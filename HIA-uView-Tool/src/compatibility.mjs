import { createDiagnostic, isSafeRelativePath, normalizeRelativePath } from './config.mjs';
import { isCodePointSorted, readDeclaredJson } from './metadata.mjs';

/**
 * @module tool-compatibility
 * @lang zh-CN 读取和校验 HIA-uView-UI 的声明式兼容性 evidence metadata；它只呈现维护者已记录的证据，不运行 fixture、compiler、DevTools 或设备。
 * @lang en Reads and validates declarative compatibility-evidence metadata for HIA-uView-UI; it presents only maintainer-recorded evidence and runs no fixture, compiler, DevTools, or device.
 */

/**
 * @lang zh-CN compatibility evidence manifest 顶层固定字段；严格字段集防止其变成任意测试、发布或业务配置容器。
 * @lang en Fixed top-level fields for a compatibility-evidence manifest; the strict set prevents it from becoming an arbitrary test, release, or business configuration container.
 */
const allowedCompatibilityFields = new Set(['version', 'profile', 'verified', 'unverified']);

/**
 * @lang zh-CN 每条已验证 evidence 的固定字段；target 只定位声明性证据位置，不触发对其内容的读取。
 * @lang en Fixed fields in each verified-evidence entry; target only identifies a declarative evidence location and does not trigger a read of its content.
 */
const allowedVerifiedEvidenceFields = new Set(['kind', 'target', 'scope']);

/**
 * @lang zh-CN Tool 可呈现的低层验证种类及其唯一允许的限制范围；P20 的本机 DevTools fixture 证据仍明确排除真机、完整无障碍、跨端和发布认证。
 * @lang en Low-level verification kinds the Tool may present and their sole allowed limited scopes; P20 local DevTools fixture evidence still explicitly excludes device, complete accessibility, cross-platform, and release certification.
 */
const verifiedEvidenceScopes = new Map([
  ['compiler-fixture', 'compiler-only'],
  ['devtools-fixture', 'local-fixture-only'],
  ['jsdom-runtime', 'jsdom-only']
]);

/**
 * @lang zh-CN 必须显式披露的首发未验证环境；列表是当前 profile 风险陈述，不是支持或拒绝未来 profile 的永久目录。
 * @lang en Initial unverified environments that must be explicitly disclosed; the list is a current profile risk statement, not a permanent catalog approving or rejecting future profiles.
 */
const supportedUnverifiedEnvironments = new Set([
  'app',
  'device',
  'h5',
  'keyboard',
  'other-mini-program',
  'screen-reader',
  'weixin-devtools'
]);

/**
 * @lang zh-CN 读取并校验一个 configuration 已声明的 compatibility evidence manifest，保留其相对路径和原始声明供 inspect 报告使用。
 * @lang en Reads and validates one configuration-declared compatibility-evidence manifest, retaining its relative path and raw declaration for an inspect report.
 */
export async function loadCompatibilityManifest(rootDirectory, manifestPath, configuration) {
  // <lang><zh-CN>只读取 configuration 白名单中的 JSON；不会根据设备、平台、测试目录或网络自动发现证据。</zh-CN><en>Read only JSON in the configuration allowlist; do not automatically discover evidence from devices, platforms, test directories, or network.</en></lang>
  const loaded = await readDeclaredJson(rootDirectory, manifestPath, 'COMPATIBILITY_MANIFEST');
  // <lang><zh-CN>相对路径被规范化后可安全进入 reports；绝对调用目录仍不出现在任何返回值中。</zh-CN><en>The normalized relative path may safely enter reports; the absolute invocation directory still appears in no return value.</en></lang>
  const normalizedPath = normalizeRelativePath(manifestPath);
  if (loaded.diagnostics.length > 0) {
    return { path: normalizedPath, manifest: null, diagnostics: loaded.diagnostics };
  }

  // <lang><zh-CN>已解析 metadata 仅经过纯 schema 校验；不会执行 target 所指向的 fixture 或测试。</zh-CN><en>Parsed metadata undergoes only pure schema validation; do not execute the fixture or test to which target points.</en></lang>
  const diagnostics = validateCompatibilityManifest(loaded.value, normalizedPath, configuration);
  return { path: normalizedPath, manifest: loaded.value, diagnostics };
}

/**
 * @lang zh-CN 校验 compatibility evidence JSON 的结构、profile 对齐、有限 evidence kind/scope、相对 target 及未验证环境清单。
 * @lang en Validates compatibility-evidence JSON structure, profile alignment, limited evidence kind and scope, relative target, and unverified-environment list.
 */
export function validateCompatibilityManifest(manifest, manifestPath, configuration) {
  // <lang><zh-CN>无效顶层 JSON 不能产生可信 compatibility report；立即返回稳定 schema 错误。</zh-CN><en>Invalid top-level JSON cannot produce a trustworthy compatibility report; return a stable schema error immediately.</en></lang>
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return [createDiagnostic('COMPATIBILITY_SCHEMA_INVALID', `Compatibility manifest must be a JSON object: ${manifestPath}.`)];
  }

  // <lang><zh-CN>收集可独立修复的问题；报告保持 metadata 审计而不代替实际平台验证。</zh-CN><en>Collect independently repairable issues; the report remains a metadata audit and does not replace actual platform validation.</en></lang>
  const diagnostics = [];
  for (const field of Object.keys(manifest)) {
    // <lang><zh-CN>顶层字段名属于公开 schema，可用于精确指出越界字段而不回显其值。</zh-CN><en>The top-level field name belongs to public schema and can precisely identify an out-of-bound field without echoing its value.</en></lang>
    const fieldName = field;
    if (!allowedCompatibilityFields.has(fieldName)) {
      diagnostics.push(createDiagnostic('COMPATIBILITY_FIELD_UNKNOWN', `Compatibility manifest has an unsupported field: ${fieldName}.`));
    }
  }

  // <lang><zh-CN>version 锁定 evidence 格式，阻止 Tool 为未来 metadata 猜测含义或支持范围。</zh-CN><en>Version locks evidence format and prevents the Tool from guessing meanings or support scope for future metadata.</en></lang>
  if (manifest.version !== 1) {
    diagnostics.push(createDiagnostic('COMPATIBILITY_VERSION_UNSUPPORTED', `Compatibility manifest version must be 1: ${manifestPath}.`));
  }

  // <lang><zh-CN>evidence profile 必须与调用 configuration 对齐，避免将一个平台的 compiler 记录投射到另一个平台。</zh-CN><en>The evidence profile must align with invocation configuration, avoiding projection of one platform's compiler record onto another platform.</en></lang>
  if (manifest.profile !== configuration.profile) {
    diagnostics.push(createDiagnostic('COMPATIBILITY_PROFILE_MISMATCH', `Compatibility manifest profile must match configuration profile: ${manifestPath}.`));
  }

  // <lang><zh-CN>verified 列表必须至少有一条受限证据，才能说明报告中“已验证”字段的来源。</zh-CN><en>The verified list must contain at least one bounded evidence item before a report can explain its verified field's origin.</en></lang>
  if (!Array.isArray(manifest.verified) || manifest.verified.length === 0) {
    diagnostics.push(createDiagnostic('COMPATIBILITY_VERIFIED_INVALID', `Compatibility manifest must declare verified evidence: ${manifestPath}.`));
  } else {
    // <lang><zh-CN>evidence identity 集合以 kind/target/scope 组合去重；不会读取 target 内容来生成身份。</zh-CN><en>The evidence identity set deduplicates the kind, target, and scope combination; it does not read target content to create identity.</en></lang>
    const evidenceIdentities = new Set();
    // <lang><zh-CN>稳定 kind 顺序输入只采用受限 ASCII kind；target 可能含目录层级，不作为跨环境排序依据。</zh-CN><en>Stable kind-order input uses only restricted ASCII kinds; target may contain directory hierarchy and is not a cross-environment sort basis.</en></lang>
    const evidenceKinds = [];
    for (const evidence of manifest.verified) {
      // <lang><zh-CN>每条 evidence 必须是固定字段的 JSON 对象，避免携带任意测试参数或发布状态。</zh-CN><en>Each evidence item must be a JSON object with fixed fields, avoiding carriage of arbitrary test parameters or release state.</en></lang>
      if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) {
        diagnostics.push(createDiagnostic('COMPATIBILITY_EVIDENCE_INVALID', `Compatibility manifest has an invalid verified evidence record: ${manifestPath}.`));
        continue;
      }

      for (const field of Object.keys(evidence)) {
        // <lang><zh-CN>evidence 子字段名只参与白名单比较；不输出可能包含未批准 metadata 的值。</zh-CN><en>The evidence child-field name participates only in allowlist comparison; do not output values that might contain unapproved metadata.</en></lang>
        const fieldName = field;
        if (!allowedVerifiedEvidenceFields.has(fieldName)) {
          diagnostics.push(createDiagnostic('COMPATIBILITY_EVIDENCE_FIELD_UNKNOWN', `Compatibility manifest has an unsupported evidence field: ${fieldName}.`));
        }
      }

      // <lang><zh-CN>kind 必须是本 W 明确定义的低层验证来源；未知 kind 不能被文本报告美化成“已支持”。</zh-CN><en>Kind must be a low-level verification source explicitly defined by this W; an unknown kind cannot be polished into “supported” by text output.</en></lang>
      const expectedScope = verifiedEvidenceScopes.get(evidence.kind);
      if (!expectedScope) {
        diagnostics.push(createDiagnostic('COMPATIBILITY_EVIDENCE_KIND_UNSUPPORTED', `Compatibility manifest has an unsupported evidence kind: ${manifestPath}.`));
      }

      // <lang><zh-CN>target 是仅供维护者定位的安全相对 metadata；Tool 不打开、执行或验证其存在性。</zh-CN><en>Target is safe relative metadata for maintainer location only; the Tool does not open, execute, or verify its existence.</en></lang>
      const target = isSafeRelativePath(evidence.target) ? normalizeRelativePath(evidence.target) : null;
      if (!target) {
        diagnostics.push(createDiagnostic('COMPATIBILITY_EVIDENCE_TARGET_INVALID', `Compatibility manifest has an unsafe evidence target: ${manifestPath}.`));
      }

      // <lang><zh-CN>scope 必须精确表达 kind 的验证限制，防止 compiler 或 jsdom evidence 被误称为 device 证据。</zh-CN><en>Scope must precisely express the kind's validation limitation, preventing compiler or jsdom evidence from being called device evidence.</en></lang>
      if (evidence.scope !== expectedScope) {
        diagnostics.push(createDiagnostic('COMPATIBILITY_EVIDENCE_SCOPE_INVALID', `Compatibility manifest has an invalid evidence scope: ${manifestPath}.`));
      }

      // <lang><zh-CN>只有完整的受限三元组才进入去重与排序；残缺记录已拥有更精确的诊断。</zh-CN><en>Only a complete bounded triple enters duplicate and ordering logic; incomplete records already have more precise diagnostics.</en></lang>
      if (expectedScope && target && evidence.scope === expectedScope) {
        const identity = `${evidence.kind}|${target}|${evidence.scope}`;
        if (evidenceIdentities.has(identity)) {
          diagnostics.push(createDiagnostic('COMPATIBILITY_EVIDENCE_DUPLICATE', `Compatibility manifest repeats verified evidence: ${manifestPath}.`));
        }
        evidenceIdentities.add(identity);
        evidenceKinds.push(evidence.kind);
      }
    }

    // <lang><zh-CN>kind 稳定排序使报告不会因同义路径或编辑器格式改变而重排其高层 evidence 分类。</zh-CN><en>Stable kind order prevents the report from reordering its high-level evidence classification due to equivalent paths or editor formatting.</en></lang>
    if (!isCodePointSorted(evidenceKinds)) {
      diagnostics.push(createDiagnostic('COMPATIBILITY_EVIDENCE_ORDER_INVALID', `Compatibility manifest verified evidence kinds must be in code-point order: ${manifestPath}.`));
    }
  }

  // <lang><zh-CN>unverified 必须显式列出尚未证明的环境；缺失清单不能被解释为“其他环境默认支持”。</zh-CN><en>Unverified must explicitly list environments not yet proven; an absent list cannot be interpreted as “all other environments supported by default.”</en></lang>
  if (!Array.isArray(manifest.unverified) || manifest.unverified.length === 0 || !manifest.unverified.every((item) => typeof item === 'string' && item.trim().length > 0)) {
    diagnostics.push(createDiagnostic('COMPATIBILITY_UNVERIFIED_INVALID', `Compatibility manifest must declare unverified environments: ${manifestPath}.`));
  } else {
    // <lang><zh-CN>规范化未验证环境名称后做集合与排序校验；这些值均为公开枚举，不含设备或用户数据。</zh-CN><en>Normalize unverified environment names before set and order checks; these values are all public enumeration members and contain no device or user data.</en></lang>
    const unverifiedEnvironments = manifest.unverified.map((environment) => environment.trim());
    const distinctEnvironments = new Set(unverifiedEnvironments);
    if (distinctEnvironments.size !== unverifiedEnvironments.length) {
      diagnostics.push(createDiagnostic('COMPATIBILITY_UNVERIFIED_DUPLICATE', `Compatibility manifest repeats an unverified environment: ${manifestPath}.`));
    }
    if (!isCodePointSorted(unverifiedEnvironments)) {
      diagnostics.push(createDiagnostic('COMPATIBILITY_UNVERIFIED_ORDER_INVALID', `Compatibility manifest unverified environments must be in code-point order: ${manifestPath}.`));
    }
    for (const environment of unverifiedEnvironments) {
      // <lang><zh-CN>当前环境必须是公开允许枚举成员；自由文本会让不同维护者对风险含义产生漂移。</zh-CN><en>The current environment must be a public allowed enumeration member; free text would cause risk-meaning drift among maintainers.</en></lang>
      const environmentName = environment;
      if (!supportedUnverifiedEnvironments.has(environmentName)) {
        diagnostics.push(createDiagnostic('COMPATIBILITY_UNVERIFIED_UNSUPPORTED', `Compatibility manifest has an unsupported unverified environment: ${manifestPath}.`));
      }
    }
  }

  return diagnostics;
}
