import { readFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';

/**
 * @module tool-config
 * @lang zh-CN 为 HIA-uView-Tool 的首轮只读 JSON 配置提供解析与 schema 校验；不执行配置内容，也不接受远程、绝对或越界路径。
 * @lang en Provides parsing and schema validation for the first read-only JSON configuration of HIA-uView-Tool; does not execute configuration content and rejects remote, absolute, and escaping paths.
 */

/**
 * @lang zh-CN 首轮配置允许的固定字段；未知字段被拒绝，避免通过配置悄然引入可执行能力。
 * @lang en Fixed fields allowed by the first configuration schema; unknown fields are rejected so configuration cannot silently introduce executable capability.
 */
const allowedConfigurationFields = new Set([
  'version',
  'projectRoot',
  'profile',
  'locale',
  'report',
  'componentManifests',
  'adoptionManifests',
  'compatibilityManifests'
]);

/**
 * @lang zh-CN 创建不含绝对路径、源码文本或私有工作区细节的稳定诊断记录。
 * @lang en Creates a stable diagnostic record without absolute paths, source text, or private-workspace details.
 */
export function createDiagnostic(code, message, category = 'project') {
  // <lang><zh-CN>冻结仅含公开 code/message/category 的最小记录，防止后续调用方附加路径、原始 JSON 或私有环境细节。</zh-CN><en>Freezes a minimal record containing only public code, message, and category, preventing later callers from appending paths, raw JSON, or private environment detail.</en></lang>
  return Object.freeze({ code, message, category });
}

/**
 * @lang zh-CN 判断字符串是否为本工具允许的仓库内相对路径；拒绝绝对路径、空路径、空字节和任意父目录越界。
 * @lang en Determines whether a string is a repository-relative path allowed by this tool; rejects absolute paths, empty paths, null bytes, and every parent-directory escape.
 */
export function isSafeRelativePath(candidate) {
  // <lang><zh-CN>只有字符串候选才可能成为 JSON 路径；其他 JSON 类型在进入任何路径 API 前直接拒绝。</zh-CN><en>Only a string candidate can become a JSON path; every other JSON type is rejected before entering any path API.</en></lang>
  if (typeof candidate !== 'string') {
    return false;
  }

  // <lang><zh-CN>规范值用于纯语法判断，统一空白和分隔符但不解析符号链接、不访问文件或改变调用方 JSON。</zh-CN><en>The normalized value serves pure syntax determination, unifying whitespace and separators while resolving no symlink, accessing no file, and changing no caller JSON.</en></lang>
  const value = candidate.trim().replaceAll('\\', '/');

  // <lang><zh-CN>空、空字节、URI 与绝对路径无法受项目根 containment 保证，因此在分段检查前拒绝。</zh-CN><en>Empty values, null bytes, URIs, and absolute paths cannot receive project-root containment guarantees, so reject them before segment checks.</en></lang>
  if (!value || value.includes('\u0000') || value.includes('://') || isAbsolute(value)) {
    return false;
  }

  // <lang><zh-CN>任何父目录片段都可能借后续 resolve 离开选定根目录；不接受“先进入再返回”的路径形式。</zh-CN><en>Any parent-directory segment could escape selected root through later resolve; do not accept a path form that enters and later returns.</en></lang>
  return !value.split('/').some((segment) => segment === '..');
}

/**
 * @lang zh-CN 将已通过相对路径安全判断的声明归一为正斜杠形式，供跨平台 JSON 比较和稳定报告使用；此函数不解析、访问或重写文件系统。
 * @lang en Normalizes a declaration that has passed relative-path safety checks into slash form for cross-platform JSON comparison and stable reporting; this function neither resolves, accesses, nor rewrites the file system.
 */
export function normalizeRelativePath(candidate) {
  // <lang><zh-CN>保留调用方已声明的相对语义，仅移除外围空白并将 Windows 分隔符统一为 JSON 契约使用的正斜杠。</zh-CN><en>Preserve the caller-declared relative meaning while trimming outer whitespace and converting Windows separators to the slash form used by the JSON contract.</en></lang>
  return String(candidate).trim().replaceAll('\\', '/');
}

/**
 * @lang zh-CN 校验一个配置中的相对 manifest 路径数组；required 为真时数组不能为空，optional 数组缺席时不产生诊断。
 * @lang en Validates a configuration array of relative manifest paths; a required array cannot be empty, while an optional array may be absent without a diagnostic.
 */
function validateManifestPathArray(value, fieldName, fieldDiagnosticName, pathDiagnosticName, diagnostics, required) {
  // <lang><zh-CN>缺失的可选数组不扩大默认输入范围；调用方仅在对应命令被请求时才将其视为项目级失败。</zh-CN><en>A missing optional array does not expand the default input scope; the caller treats it as a project-level failure only when its corresponding command is requested.</en></lang>
  if (typeof value === 'undefined' && !required) {
    return;
  }

  // <lang><zh-CN>路径清单必须是 JSON 数组；其他类型无法逐项实施根目录边界检查。</zh-CN><en>A path declaration must be a JSON array; other types cannot receive an item-by-item project-root boundary check.</en></lang>
  if (!Array.isArray(value) || (required && value.length === 0)) {
    // <lang><zh-CN>以字段专属稳定代码报告 schema 问题，避免回显可能包含敏感信息的原始配置。</zh-CN><en>Report the schema problem with a field-specific stable code rather than echoing raw configuration that could contain sensitive information.</en></lang>
    diagnostics.push(createDiagnostic(`CONFIG_${fieldDiagnosticName}_INVALID`, `Configuration ${fieldName} must be ${required ? 'a non-empty' : 'an optional'} array.`, 'invocation'));
    return;
  }

  // <lang><zh-CN>记录已归一化路径以拒绝同一 manifest 的分隔符或空白变体，确保之后读取范围可审计。</zh-CN><en>Record normalized paths to reject separator or whitespace variants of the same manifest, keeping later read scope auditable.</en></lang>
  const seenPaths = new Set();

  // <lang><zh-CN>逐项执行安全与重复判断；无效项不会进入读取阶段。</zh-CN><en>Apply safety and duplication checks item by item; invalid entries never reach the reading stage.</en></lang>
  for (const manifestPath of value) {
    // <lang><zh-CN>当前 JSON 声明的候选路径；它仅用于安全校验和稳定诊断，不会被作为 shell、URL 或可执行输入。</zh-CN><en>The current candidate path declared by JSON; it serves only safety validation and stable diagnostics and is never treated as a shell, URL, or executable input.</en></lang>
    const normalizedPath = isSafeRelativePath(manifestPath) ? normalizeRelativePath(manifestPath) : null;

    // <lang><zh-CN>拒绝绝对、越界、URI 或空路径，确保 Tool 不会借 manifest 列表读取项目根外内容。</zh-CN><en>Reject absolute, escaping, URI, or empty paths so the Tool cannot read outside the project root through a manifest list.</en></lang>
    if (!normalizedPath) {
      diagnostics.push(createDiagnostic(`CONFIG_${pathDiagnosticName}_PATH_INVALID`, `Every ${fieldName} path must stay inside the selected project root.`, 'invocation'));
      continue;
    }

    // <lang><zh-CN>同一规范路径只能声明一次；重复会使报告顺序和错误归属产生歧义。</zh-CN><en>Each normalized path may be declared only once; duplicates would make report order and error ownership ambiguous.</en></lang>
    if (seenPaths.has(normalizedPath)) {
      diagnostics.push(createDiagnostic(`CONFIG_${pathDiagnosticName}_PATH_DUPLICATE`, `${fieldName} path is declared more than once: ${normalizedPath}.`, 'invocation'));
    }

    // <lang><zh-CN>无论是否重复都记录规范路径，以便后续同值继续获得确定性重复诊断。</zh-CN><en>Record the normalized path whether or not it was duplicated so later equivalent values receive deterministic duplicate diagnostics.</en></lang>
    seenPaths.add(normalizedPath);
  }
}

/**
 * @lang zh-CN 校验声明式配置对象，并返回全部可操作的调用/配置诊断而非静默忽略未知值。
 * @lang en Validates a declarative configuration object and returns all actionable invocation/configuration diagnostics instead of silently ignoring unknown values.
 */
export function validateConfiguration(configuration) {
  // <lang><zh-CN>诊断列表按固定检查顺序累积，使 text/JSON 自动化消费者获得确定性结果。</zh-CN><en>The diagnostic list accumulates in fixed check order so text and JSON automation consumers receive deterministic results.</en></lang>
  const diagnostics = [];

  // <lang><zh-CN>顶层必须是普通 JSON 对象；在形状无效时停止字段访问，避免从 primitive 或数组派生误导错误。</zh-CN><en>The top level must be a plain JSON object; stop field access on invalid shape to avoid deriving misleading errors from a primitive or array.</en></lang>
  if (!configuration || typeof configuration !== 'object' || Array.isArray(configuration)) {
    return [createDiagnostic('CONFIG_SCHEMA_INVALID', 'Configuration must be a JSON object.', 'invocation')];
  }

  // <lang><zh-CN>逐项拒绝未知字段，保证 configuration 不能静默增加 hook、URL、凭据或任意执行表面。</zh-CN><en>Reject unknown fields one by one, ensuring configuration cannot silently add hooks, URLs, credentials, or an arbitrary execution surface.</en></lang>
  for (const field of Object.keys(configuration)) {
    // <lang><zh-CN>当前字段名是公开 schema 键；诊断只回显键而不回显其可能敏感的值。</zh-CN><en>The current field name is a public schema key; diagnostics echo only the key and never its potentially sensitive value.</en></lang>
    if (!allowedConfigurationFields.has(field)) {
      diagnostics.push(createDiagnostic('CONFIG_UNKNOWN_FIELD', `Configuration field is not allowed: ${field}.`, 'invocation'));
    }
  }

  // <lang><zh-CN>版本、root、profile、locale 与 report 是固定 P17 输入边界；每项独立报告以支持一次修正多项 metadata 问题。</zh-CN><en>Version, root, profile, locale, and report are fixed P17 input boundaries; report each independently so one metadata repair can address multiple issues.</en></lang>
  if (configuration.version !== 1) {
    diagnostics.push(createDiagnostic('CONFIG_VERSION_UNSUPPORTED', 'Configuration version must be 1.', 'invocation'));
  }

  if (configuration.projectRoot !== '.') {
    diagnostics.push(createDiagnostic('CONFIG_PROJECT_ROOT_INVALID', 'The initial Tool implementation accepts projectRoot "." only.', 'invocation'));
  }

  if (configuration.profile !== 'mp-weixin') {
    diagnostics.push(createDiagnostic('CONFIG_PROFILE_UNSUPPORTED', 'The initial Tool implementation supports profile "mp-weixin" only.', 'invocation'));
  }

  if (!['zh-Hans', 'en'].includes(configuration.locale)) {
    diagnostics.push(createDiagnostic('CONFIG_LOCALE_UNSUPPORTED', 'Configuration locale must be "zh-Hans" or "en".', 'invocation'));
  }

  if (!configuration.report || typeof configuration.report !== 'object' || Array.isArray(configuration.report) || !['text', 'json'].includes(configuration.report.format)) {
    diagnostics.push(createDiagnostic('CONFIG_REPORT_INVALID', 'Configuration report.format must be "text" or "json".', 'invocation'));
  }

  // <lang><zh-CN>组件 manifest 是每次 Tool 调用的最小可信输入；缺失或空清单不能安全地产生 UI 报告。</zh-CN><en>Component manifests are the minimum trusted input for every Tool invocation; a missing or empty list cannot safely produce a UI report.</en></lang>
  validateManifestPathArray(configuration.componentManifests, 'componentManifests', 'MANIFESTS', 'MANIFEST', diagnostics, true);

  // <lang><zh-CN>adoption manifest 仅在 adoption 检查被请求时需要存在；此处仍预先拒绝其不安全声明。</zh-CN><en>Adoption manifests need exist only when adoption checking is requested; this stage still rejects their unsafe declarations in advance.</en></lang>
  validateManifestPathArray(configuration.adoptionManifests, 'adoptionManifests', 'ADOPTION_MANIFESTS', 'ADOPTION_MANIFEST', diagnostics, false);

  // <lang><zh-CN>compatibility manifest 同样是可选输入；预校验保证 inspect 不会因一份越界声明扩大读取范围。</zh-CN><en>Compatibility manifests are likewise optional inputs; prevalidation ensures inspect cannot expand read scope through an escaping declaration.</en></lang>
  validateManifestPathArray(configuration.compatibilityManifests, 'compatibilityManifests', 'COMPATIBILITY_MANIFESTS', 'COMPATIBILITY_MANIFEST', diagnostics, false);

  return diagnostics;
}

/**
 * @lang zh-CN 从调用目录内读取并解析一个受限的 JSON 配置；错误只返回稳定诊断，不回显原始 JSON 或本机路径。
 * @lang en Reads and parses a constrained JSON configuration inside the invocation directory; errors return only stable diagnostics and never echo raw JSON or host paths.
 */
export async function loadConfiguration(rootDirectory, configurationPath) {
  // <lang><zh-CN>配置路径先通过同一安全判断，避免直接 API 调用绕过 CLI parser 的相对路径限制。</zh-CN><en>Validate configuration path through the same safety check, preventing direct API calls from bypassing CLI parser relative-path limits.</en></lang>
  if (!isSafeRelativePath(configurationPath)) {
    return { configuration: null, diagnostics: [createDiagnostic('CONFIG_PATH_INVALID', 'The configuration path must be a non-escaping relative path.', 'invocation')] };
  }

  // <lang><zh-CN>content 只在本函数内短暂保存以进行 JSON.parse；不进入报告、诊断或缓存。</zh-CN><en>Content is held briefly only inside this function for JSON.parse; it enters no report, diagnostic, or cache.</en></lang>
  let content;

  try {
    // <lang><zh-CN>在调用根下读取单一已声明 JSON，不枚举目录、不读取 package、源码或相邻 metadata。</zh-CN><en>Read one declared JSON under invocation root; do not enumerate directories or read package, source, or adjacent metadata.</en></lang>
    content = await readFile(resolve(rootDirectory, configurationPath), 'utf8');
  } catch (error) {
    // <lang><zh-CN>仅区分不存在与不可读，保持错误可行动且不泄露底层路径或 I/O 异常文本。</zh-CN><en>Distinguish only missing and unreadable outcomes, keeping errors actionable without disclosing underlying path or I/O exception text.</en></lang>
    const code = error && error.code === 'ENOENT' ? 'CONFIG_NOT_FOUND' : 'CONFIG_UNREADABLE';
    return { configuration: null, diagnostics: [createDiagnostic(code, 'The declared configuration cannot be read.', 'invocation')] };
  }

  // <lang><zh-CN>configuration 保存解析后的声明对象；它随后只进入纯 schema 校验，不作为可执行配置处理。</zh-CN><en>Configuration holds the parsed declaration object; it then enters only pure schema validation and is never treated as executable configuration.</en></lang>
  let configuration;

  try {
    // <lang><zh-CN>使用 JSON.parse 解析数据；不支持 JavaScript、JSONC 注释、表达式、远程引用或 hook。</zh-CN><en>Parse data with JSON.parse; do not support JavaScript, JSONC comments, expressions, remote references, or hooks.</en></lang>
    configuration = JSON.parse(content);
  } catch {
    return { configuration: null, diagnostics: [createDiagnostic('CONFIG_INVALID_JSON', 'The declared configuration is not valid JSON.', 'invocation')] };
  }

  // <lang><zh-CN>返回原始解析对象与完整 schema 诊断，使上层决定命令是否可继续读取进一步已声明 manifest。</zh-CN><en>Return the parsed object and complete schema diagnostics so the upper layer decides whether a command may continue reading further declared manifests.</en></lang>
  return { configuration, diagnostics: validateConfiguration(configuration) };
}
