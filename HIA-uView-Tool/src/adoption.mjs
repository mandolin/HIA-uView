import { createDiagnostic, isSafeRelativePath, normalizeRelativePath } from './config.mjs';
import { isCodePointSorted, readDeclaredJson, resolveManifestRelativePath } from './metadata.mjs';

/**
 * @module tool-adoption
 * @lang zh-CN 校验应用拥有的 HIA-uView-UI adoption JSON 声明与已配置 component manifest 的一致性；模块不扫描应用源码、页面、路由、API、身份或业务数据。
 * @lang en Validates consistency between an application-owned HIA-uView-UI adoption JSON declaration and configured component manifests; the module scans no application source, pages, routes, APIs, identity, or business data.
 */

/**
 * @lang zh-CN adoption manifest 固定的六个 UI 字段；白名单本身是 Tool 与 Biz/application 责任边界的一部分。
 * @lang en The six fixed UI fields of an adoption manifest; the allowlist itself is part of the responsibility boundary between Tool and Biz or application code.
 */
const allowedAdoptionFields = new Set(['version', 'profile', 'locale', 'componentManifest', 'styleEntries', 'components']);

/**
 * @lang zh-CN 判断数组是否只包含去除空白后仍有效的字符串；调用方会在此基础上追加路径、成员资格或排序语义。
 * @lang en Determines whether an array contains only strings that remain valid after trimming; callers add path, membership, or ordering semantics on top of this check.
 */
function hasOnlyNonemptyStrings(value) {
  // <lang><zh-CN>数组是 adoption 中所有可重复声明的唯一合法 JSON 形状；空数组由具体字段规则决定是否允许。</zh-CN><en>An array is the only legal JSON shape for every repeatable adoption declaration; field-specific rules decide whether an empty array is allowed.</en></lang>
  if (!Array.isArray(value)) {
    return false;
  }

  // <lang><zh-CN>逐项保证后续 trim、排序和集合比较不会将对象、数字或空白误作合法 UI 标识。</zh-CN><en>Check each item so later trimming, sorting, and set comparison never mistake objects, numbers, or whitespace for legal UI identifiers.</en></lang>
  return value.every((item) => typeof item === 'string' && item.trim().length > 0);
}

/**
 * @lang zh-CN 读取和校验 adoption manifest 的固定 schema，并对照 Tool configuration 与已加载 component manifest 执行纯 JSON 关联检查。
 * @lang en Reads and validates the fixed adoption-manifest schema, then performs pure JSON linkage checks against Tool configuration and loaded component manifests.
 */
export async function loadAdoptionManifest(rootDirectory, adoptionPath, configuration, componentManifests) {
  // <lang><zh-CN>只打开 configuration 明确列出的 adoption JSON；不会根据应用目录、路由或依赖树进行发现。</zh-CN><en>Open only the adoption JSON explicitly listed by configuration; do not discover files from application directories, routes, or dependency trees.</en></lang>
  const loaded = await readDeclaredJson(rootDirectory, adoptionPath, 'ADOPTION_MANIFEST');
  // <lang><zh-CN>保留规范相对路径供稳定诊断使用，同时避免将调用主机绝对路径暴露给报告。</zh-CN><en>Retain the normalized relative path for stable diagnostics while avoiding disclosure of the invocation host's absolute path to reports.</en></lang>
  const normalizedPath = normalizeRelativePath(adoptionPath);
  if (loaded.diagnostics.length > 0) {
    return { path: normalizedPath, adoption: null, diagnostics: loaded.diagnostics };
  }

  // <lang><zh-CN>已解析 JSON 进入无副作用 schema 和关联校验；不会写入 adoption 文件或 component manifest。</zh-CN><en>Parsed JSON enters side-effect-free schema and linkage validation; neither the adoption file nor a component manifest is written.</en></lang>
  const diagnostics = validateAdoptionManifest(loaded.value, normalizedPath, configuration, componentManifests);
  return { path: normalizedPath, adoption: loaded.value, diagnostics };
}

/**
 * @lang zh-CN 校验 adoption JSON 的字段形状、配置匹配、样式入口和组件成员资格；所有诊断只包含稳定 code、字段或已声明相对路径。
 * @lang en Validates adoption JSON field shapes, configuration alignment, style entry, and component membership; every diagnostic contains only stable code, field, or declared relative path.
 */
export function validateAdoptionManifest(adoption, adoptionPath, configuration, componentManifests) {
  // <lang><zh-CN>无效顶层形状无法安全读取任何字段；立即返回单一精确 schema 诊断。</zh-CN><en>An invalid top-level shape cannot safely provide any field; return one precise schema diagnostic immediately.</en></lang>
  if (!adoption || typeof adoption !== 'object' || Array.isArray(adoption)) {
    return [createDiagnostic('ADOPTION_SCHEMA_INVALID', `Adoption manifest must be a JSON object: ${adoptionPath}.`)];
  }

  // <lang><zh-CN>在不早退的前提下收集独立问题，以便 UI 使用者一次修复其最小声明。</zh-CN><en>Collect independent issues without early exit so a UI consumer can repair its minimal declaration in one pass.</en></lang>
  const diagnostics = [];
  // <lang><zh-CN>字段白名单拒绝任何业务或可执行扩展，例如 routes、API、identity 与 hooks。</zh-CN><en>The field allowlist rejects every business or executable extension such as routes, APIs, identity, and hooks.</en></lang>
  for (const field of Object.keys(adoption)) {
    // <lang><zh-CN>字段名是公开 schema 信息，可安全用于说明哪一项越过 adoption 边界；不输出字段值。</zh-CN><en>The field name is public schema information and can safely identify what crossed the adoption boundary; do not output the field value.</en></lang>
    const fieldName = field;
    if (!allowedAdoptionFields.has(fieldName)) {
      diagnostics.push(createDiagnostic('ADOPTION_FIELD_UNKNOWN', `Adoption manifest has an unsupported field: ${fieldName}.`));
    }
  }

  // <lang><zh-CN>version 阻止 Tool 将未来 adoption 结构误当作当前六字段契约处理。</zh-CN><en>Version prevents the Tool from treating a future adoption structure as the current six-field contract.</en></lang>
  if (adoption.version !== 1) {
    diagnostics.push(createDiagnostic('ADOPTION_VERSION_UNSUPPORTED', `Adoption manifest version must be 1: ${adoptionPath}.`));
  }

  // <lang><zh-CN>profile 必须与当前 Tool 调用保持一致，避免一个 JSON 报告混合不同平台承诺。</zh-CN><en>Profile must agree with the current Tool invocation so one JSON report cannot mix different platform promises.</en></lang>
  if (adoption.profile !== configuration.profile) {
    diagnostics.push(createDiagnostic('ADOPTION_PROFILE_MISMATCH', `Adoption manifest profile must match configuration profile: ${adoptionPath}.`));
  }

  // <lang><zh-CN>locale 是 UI 运行时语言而非源码文档语言，必须与本次 Tool 配置的选择完全一致。</zh-CN><en>Locale is a UI runtime language rather than a source-documentation language and must exactly match this Tool configuration selection.</en></lang>
  if (adoption.locale !== configuration.locale) {
    diagnostics.push(createDiagnostic('ADOPTION_LOCALE_MISMATCH', `Adoption manifest locale must match configuration locale: ${adoptionPath}.`));
  }

  // <lang><zh-CN>引用 component manifest 的值必须是安全相对路径，并且只能指向 configuration 已批准的 UI metadata 输入。</zh-CN><en>The referenced component-manifest value must be a safe relative path and may point only to UI metadata input approved by configuration.</en></lang>
  const componentManifestPath = isSafeRelativePath(adoption.componentManifest) ? normalizeRelativePath(adoption.componentManifest) : null;
  if (!componentManifestPath) {
    diagnostics.push(createDiagnostic('ADOPTION_COMPONENT_MANIFEST_PATH_INVALID', `Adoption manifest has an unsafe component manifest path: ${adoptionPath}.`));
  } else if (!componentManifests.has(componentManifestPath)) {
    diagnostics.push(createDiagnostic('ADOPTION_COMPONENT_MANIFEST_UNDECLARED', `Adoption manifest references a component manifest not declared by configuration: ${componentManifestPath}.`));
  }

  // <lang><zh-CN>样式入口数组必须显式说明 UI 样式载入意图；Tool 不检查应用源码是否真的 import 这些路径。</zh-CN><en>The style-entry array must explicitly state UI style-loading intent; the Tool does not check whether application source actually imports these paths.</en></lang>
  const styleEntries = hasOnlyNonemptyStrings(adoption.styleEntries) ? adoption.styleEntries.map((entry) => normalizeRelativePath(entry)) : null;
  if (!styleEntries || styleEntries.length === 0 || styleEntries.some((entry) => !isSafeRelativePath(entry))) {
    diagnostics.push(createDiagnostic('ADOPTION_STYLE_ENTRIES_INVALID', `Adoption manifest must declare safe style entries: ${adoptionPath}.`));
  } else {
    // <lang><zh-CN>样式集合检测重复和顺序，确保同一 adoption JSON 不因编辑器格式差异产生不确定报告。</zh-CN><en>The style set detects duplicates and order so one adoption JSON does not produce nondeterministic reports from editor formatting differences.</en></lang>
    const distinctStyleEntries = new Set(styleEntries);
    if (distinctStyleEntries.size !== styleEntries.length) {
      diagnostics.push(createDiagnostic('ADOPTION_STYLE_ENTRIES_DUPLICATE', `Adoption manifest repeats a style entry: ${adoptionPath}.`));
    }
    if (!isCodePointSorted(styleEntries)) {
      diagnostics.push(createDiagnostic('ADOPTION_STYLE_ENTRIES_ORDER_INVALID', `Adoption manifest style entries must be in code-point order: ${adoptionPath}.`));
    }
  }

  // <lang><zh-CN>组件使用清单是显式声明，不从模板或自动注册结果推断；它必须可与 UI manifest 的公开名称直接比较。</zh-CN><en>The component-usage list is an explicit declaration and is not inferred from templates or auto-registration; it must compare directly with public UI-manifest names.</en></lang>
  const componentNames = hasOnlyNonemptyStrings(adoption.components) ? adoption.components.map((name) => name.trim()) : null;
  if (!componentNames || componentNames.length === 0) {
    diagnostics.push(createDiagnostic('ADOPTION_COMPONENTS_INVALID', `Adoption manifest must declare at least one component: ${adoptionPath}.`));
  } else {
    // <lang><zh-CN>名称集合暴露重复声明；它只包含公开 `u-*` 名称，不携带应用节点或业务字段。</zh-CN><en>The name set exposes duplicate declarations; it holds only public `u-*` names and carries no application node or business field.</en></lang>
    const distinctComponentNames = new Set(componentNames);
    if (distinctComponentNames.size !== componentNames.length) {
      diagnostics.push(createDiagnostic('ADOPTION_COMPONENTS_DUPLICATE', `Adoption manifest repeats a component name: ${adoptionPath}.`));
    }
    if (!isCodePointSorted(componentNames)) {
      diagnostics.push(createDiagnostic('ADOPTION_COMPONENTS_ORDER_INVALID', `Adoption manifest component names must be in code-point order: ${adoptionPath}.`));
    }
  }

  // <lang><zh-CN>只有安全且已声明的引用才能关联已加载 UI manifest；否则不读取任何替代路径或尝试猜测包位置。</zh-CN><en>Only a safe, declared reference may link to a loaded UI manifest; otherwise do not read any alternative path or guess a package location.</en></lang>
  const selectedManifest = componentManifestPath ? componentManifests.get(componentManifestPath) : null;
  if (!selectedManifest || selectedManifest.diagnostics.length > 0 || !selectedManifest.manifest) {
    return diagnostics;
  }

  // <lang><zh-CN>已选 UI manifest profile 也必须与 adoption 保持一致；该重复检查防止 configuration 自身跨 profile 声明造成误配。</zh-CN><en>The selected UI-manifest profile must also agree with adoption; this duplicate check prevents configuration itself from creating cross-profile misalignment.</en></lang>
  if (adoption.profile !== selectedManifest.manifest.profile) {
    diagnostics.push(createDiagnostic('ADOPTION_COMPONENT_MANIFEST_PROFILE_MISMATCH', `Adoption manifest profile must match its component manifest: ${adoptionPath}.`));
  }

  // <lang><zh-CN>仅在 UI manifest styleEntry 已通过 schema 校验时派生项目根相对期望路径。</zh-CN><en>Derive the expected project-root-relative path only when the UI manifest styleEntry has passed schema validation.</en></lang>
  const expectedStyleEntry = isSafeRelativePath(selectedManifest.manifest.styleEntry)
    ? resolveManifestRelativePath(componentManifestPath, selectedManifest.manifest.styleEntry)
    : null;
  if (expectedStyleEntry && styleEntries && !styleEntries.includes(expectedStyleEntry)) {
    diagnostics.push(createDiagnostic('ADOPTION_STYLE_ENTRY_MISSING', `Adoption manifest must include its component manifest style entry: ${expectedStyleEntry}.`));
  }

  // <lang><zh-CN>仅在 adoption 组件数组形状有效时比较成员资格和 locale，避免为同一原始 schema 错误制造派生噪声。</zh-CN><en>Compare membership and locale only when the adoption component array shape is valid, avoiding derived noise for the same raw schema error.</en></lang>
  if (!componentNames) {
    return diagnostics;
  }

  // <lang><zh-CN>以公开组件名建立查找表；不会打开所列 source 或 contract 文件。</zh-CN><en>Build a lookup table by public component name; do not open listed source or contract files.</en></lang>
  const availableComponents = new Map(selectedManifest.manifest.components.map((component) => [component.name.trim(), component]));
  for (const componentName of componentNames) {
    // <lang><zh-CN>当前 adoption 使用项只用于匹配 UI manifest 的公开组件记录。</zh-CN><en>The current adoption usage item serves only to match a public component record in the UI manifest.</en></lang>
    const selectedComponent = availableComponents.get(componentName);
    if (!selectedComponent) {
      diagnostics.push(createDiagnostic('ADOPTION_COMPONENT_UNAVAILABLE', `Adoption manifest declares a component absent from its component manifest: ${componentName}.`));
      continue;
    }

    // <lang><zh-CN>组件必须公开本次 adoption locale；Tool 不伪造翻译、默认文字或跨语言回退。</zh-CN><en>The component must publish this adoption locale; the Tool does not fabricate translations, default text, or cross-language fallback.</en></lang>
    if (!selectedComponent.locales.includes(adoption.locale)) {
      diagnostics.push(createDiagnostic('ADOPTION_COMPONENT_LOCALE_UNAVAILABLE', `Adoption manifest locale is unavailable for component: ${componentName}.`));
    }
  }

  return diagnostics;
}
