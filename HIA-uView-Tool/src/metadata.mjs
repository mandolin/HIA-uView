import { readFile } from 'node:fs/promises';
import { posix, resolve } from 'node:path';
import { createDiagnostic, isSafeRelativePath, normalizeRelativePath } from './config.mjs';

/**
 * @module tool-metadata
 * @lang zh-CN 为 HIA-uView-Tool 读取和校验受声明约束的 UI JSON metadata 提供纯本地能力；模块不读取应用源码、组件实现、Markdown 正文或测试输出。
 * @lang en Provides local-only capabilities for reading and validating declaratively bounded UI JSON metadata for HIA-uView-Tool; the module reads neither application source, component implementation, Markdown body, nor test output.
 */

/**
 * @lang zh-CN component manifest 顶层允许的声明字段；fixtures 保留为既有 UI manifest 元数据，但不属于 P17 的读取、执行或证据推断输入。
 * @lang en Declaration fields allowed at component-manifest top level; fixtures remain existing UI-manifest metadata but are not P17 input for reading, execution, or evidence inference.
 */
const allowedComponentManifestFields = new Set(['version', 'profile', 'styleEntry', 'components', 'fixtures']);

/**
 * @lang zh-CN 单个 component record 允许的字段；严格字段集防止 UI metadata 静默携带应用或业务配置。
 * @lang en Fields allowed in one component record; the strict field set prevents UI metadata from silently carrying application or business configuration.
 */
const allowedComponentFields = new Set(['name', 'source', 'contract', 'locales']);

/**
 * @lang zh-CN P17 支持的 UI runtime locale；Documentation Sys 源码语言由另一套 zh-CN/en 契约管理。
 * @lang en UI runtime locales supported by P17; Documentation Sys source languages are governed by the separate zh-CN/en contract.
 */
const supportedUiLocales = new Set(['zh-Hans', 'en']);

/**
 * @lang zh-CN 将可读 JSON 文件限制为被调用方明确提供的安全相对路径，并转换为稳定、不回显原文的加载结果。
 * @lang en Limits a readable JSON file to a safe relative path explicitly provided by the caller and converts it into a stable result that never echoes raw content.
 */
export async function readDeclaredJson(rootDirectory, manifestPath, diagnosticPrefix) {
  // <lang><zh-CN>路径再次在 I/O 边界校验，防止未来调用方绕过 configuration 层直接传入绝对或越界位置。</zh-CN><en>Validate the path again at the I/O boundary so future callers cannot bypass the configuration layer with an absolute or escaping location.</en></lang>
  if (!isSafeRelativePath(manifestPath)) {
    return {
      value: null,
      diagnostics: [createDiagnostic(`${diagnosticPrefix}_PATH_INVALID`, 'The declared metadata path must stay inside the selected project root.', 'invocation')]
    };
  }

  // <lang><zh-CN>规范路径只用于本地解析、诊断和输出；它不会被交给 shell、URL loader 或包管理器。</zh-CN><en>The normalized path serves only local resolution, diagnostics, and output; it is never passed to a shell, URL loader, or package manager.</en></lang>
  const normalizedPath = normalizeRelativePath(manifestPath);
  // <lang><zh-CN>将受限相对路径解析在调用根目录下；前置安全检查已拒绝所有父目录越界片段。</zh-CN><en>Resolve the constrained relative path under the invocation root; the earlier safety check has rejected every parent-directory escape segment.</en></lang>
  const absolutePath = resolve(rootDirectory, normalizedPath);
  // <lang><zh-CN>文件内容仅在本函数生命周期内保存，用于 JSON.parse；不会进入报告、诊断或日志。</zh-CN><en>File content exists only during this function call for JSON.parse; it never enters a report, diagnostic, or log.</en></lang>
  let content;

  try {
    // <lang><zh-CN>以 UTF-8 读取唯一已声明的 metadata 文件；不递归枚举目录，也不读取相邻源码。</zh-CN><en>Read the sole declared metadata file as UTF-8; do not recursively enumerate directories or read adjacent source.</en></lang>
    content = await readFile(absolutePath, 'utf8');
  } catch (error) {
    // <lang><zh-CN>仅区分不存在与不可读两种稳定、可行动的 I/O 结果；不泄露主机路径或底层错误文本。</zh-CN><en>Distinguish only stable, actionable missing and unreadable I/O results; do not disclose host paths or underlying error text.</en></lang>
    const code = error && error.code === 'ENOENT' ? `${diagnosticPrefix}_NOT_FOUND` : `${diagnosticPrefix}_UNREADABLE`;
    return {
      value: null,
      diagnostics: [createDiagnostic(code, `Declared metadata is unavailable: ${normalizedPath}.`)]
    };
  }

  try {
    // <lang><zh-CN>只解析 JSON 数据，不评估任何 JavaScript、hook、模板表达式或外部引用。</zh-CN><en>Parse JSON data only and evaluate no JavaScript, hook, template expression, or external reference.</en></lang>
    const value = JSON.parse(content);
    return { value, diagnostics: [] };
  } catch {
    return {
      value: null,
      diagnostics: [createDiagnostic(`${diagnosticPrefix}_INVALID_JSON`, `Declared metadata is not valid JSON: ${normalizedPath}.`)]
    };
  }
}

/**
 * @lang zh-CN 判断一个字符串数组是否按 Unicode 代码点非递减排列；该简单规则避免依赖运行环境 locale，从而使 JSON 报告和 fixture 结果确定。
 * @lang en Determines whether a string array is in nondecreasing Unicode code-point order; this simple rule avoids runtime-locale dependence and makes JSON reports and fixtures deterministic.
 */
export function isCodePointSorted(values) {
  // <lang><zh-CN>首项没有前驱，不可能违反顺序；从第二项开始比较即可。</zh-CN><en>The first item has no predecessor and cannot violate order, so comparison begins with the second item.</en></lang>
  for (let index = 1; index < values.length; index += 1) {
    // <lang><zh-CN>前一项是当前稳定顺序判断的唯一比较基准；数组此前已由调用方校验为字符串。</zh-CN><en>The preceding item is the only comparison baseline for the current stable-order check; the caller has already validated the array as strings.</en></lang>
    const previousValue = values[index - 1];
    // <lang><zh-CN>当前项与前项按 JavaScript 字符串代码单元顺序比较；组件与证据标识仅允许 ASCII 契约值，因此等价于所需代码点顺序。</zh-CN><en>Compare the current item with its predecessor in JavaScript string code-unit order; component and evidence identifiers allow only ASCII contract values, so this equals the required code-point order.</en></lang>
    const currentValue = values[index];

    // <lang><zh-CN>出现倒序立即返回 false；调用方会以字段专属诊断解释如何修正声明。</zh-CN><en>Return false immediately upon an inversion; the caller will explain how to correct the declaration with a field-specific diagnostic.</en></lang>
    if (previousValue > currentValue) {
      return false;
    }
  }

  // <lang><zh-CN>所有相邻对均未倒序，说明输入保持稳定顺序。</zh-CN><en>No adjacent pair was inverted, so the input preserves stable order.</en></lang>
  return true;
}

/**
 * @lang zh-CN 将 component manifest 内部相对路径提升为相对于 Tool 项目根的安全路径；该转换只组合 JSON 路径，不访问目标文件。
 * @lang en Lifts an internal component-manifest relative path into a safe path relative to the Tool project root; the conversion combines JSON paths only and does not access the target file.
 */
export function resolveManifestRelativePath(manifestPath, internalPath) {
  // <lang><zh-CN>规范外层 manifest 路径，保证 Windows 与 POSIX 配置在报告中具有同一表示。</zh-CN><en>Normalize the outer manifest path so Windows and POSIX configurations have one report representation.</en></lang>
  const normalizedManifestPath = normalizeRelativePath(manifestPath);
  // <lang><zh-CN>取得 manifest 所在目录；根目录 manifest 的 dirname 为点号，后续单独处理以避免输出 `./` 前缀。</zh-CN><en>Obtain the manifest directory; a root-level manifest has dot dirname and is handled separately to avoid emitting a `./` prefix.</en></lang>
  const manifestDirectory = posix.dirname(normalizedManifestPath);
  // <lang><zh-CN>规范内部声明后再拼接，确保输出总是可比较的正斜杠相对路径。</zh-CN><en>Normalize the internal declaration before joining so output is always a comparable slash-form relative path.</en></lang>
  const normalizedInternalPath = normalizeRelativePath(internalPath);

  // <lang><zh-CN>根目录 manifest 不需要目录前缀；其他 manifest 保留其已声明的 package/目录边界。</zh-CN><en>A root-level manifest needs no directory prefix; other manifests retain their declared package or directory boundary.</en></lang>
  return manifestDirectory === '.' ? normalizedInternalPath : posix.join(manifestDirectory, normalizedInternalPath);
}

/**
 * @lang zh-CN 校验 component record 的固定字段、非空名称、仓库内 source/contract 路径与首发 UI locale；它不读取 source 或 contract 内容。
 * @lang en Validates the fixed fields, nonempty name, repository-local source/contract paths, and initial UI locales of one component record; it does not read source or contract content.
 */
function validateComponentRecord(component, manifestPath, componentNames, diagnostics) {
  // <lang><zh-CN>record 必须是普通 JSON 对象；数组、null 或原始值无法表示受限组件元数据。</zh-CN><en>A record must be a plain JSON object; arrays, null, or primitives cannot represent bounded component metadata.</en></lang>
  if (!component || typeof component !== 'object' || Array.isArray(component)) {
    diagnostics.push(createDiagnostic('MANIFEST_COMPONENT_INVALID', `Component manifest has an invalid component record: ${manifestPath}.`));
    return;
  }

  // <lang><zh-CN>未知字段会模糊 UI metadata 与应用/业务配置边界，因此逐一明确拒绝。</zh-CN><en>Unknown fields would blur the boundary between UI metadata and application or business configuration, so reject each one explicitly.</en></lang>
  for (const field of Object.keys(component)) {
    // <lang><zh-CN>当前字段名只参与 schema 白名单比较；不把字段值写进诊断以避免泄露未批准内容。</zh-CN><en>The current field name participates only in the schema allowlist comparison; do not write its value into diagnostics to avoid disclosing unapproved content.</en></lang>
    const fieldName = field;
    if (!allowedComponentFields.has(fieldName)) {
      diagnostics.push(createDiagnostic('MANIFEST_COMPONENT_FIELD_UNKNOWN', `Component manifest has an unsupported component field: ${fieldName}.`));
    }
  }

  // <lang><zh-CN>组件名是 adoption membership 和稳定排序的主键，必须为去除空白后仍非空的字符串。</zh-CN><en>The component name is the primary key for adoption membership and stable ordering, so it must be a string that remains nonempty after trimming.</en></lang>
  const componentName = typeof component.name === 'string' ? component.name.trim() : '';
  if (!componentName) {
    diagnostics.push(createDiagnostic('MANIFEST_COMPONENT_NAME_INVALID', `Component manifest has a component without a valid name: ${manifestPath}.`));
  } else if (componentNames.has(componentName)) {
    diagnostics.push(createDiagnostic('MANIFEST_COMPONENT_NAME_DUPLICATE', `Component manifest declares a component name more than once: ${componentName}.`));
  }

  // <lang><zh-CN>在重复时仍记录名称，使后续排序诊断以完整声明顺序计算，而不依赖提前退出。</zh-CN><en>Record the name even when duplicated so later ordering diagnostics use the complete declaration order instead of depending on an early exit.</en></lang>
  if (componentName) {
    componentNames.add(componentName);
  }

  // <lang><zh-CN>source 与 contract 只接受 manifest 所在目录内的相对声明；Tool 仅检查语法，不打开这两个文件。</zh-CN><en>Source and contract accept only relative declarations inside the manifest directory; the Tool checks syntax only and never opens either file.</en></lang>
  if (!isSafeRelativePath(component.source) || !isSafeRelativePath(component.contract)) {
    diagnostics.push(createDiagnostic('MANIFEST_COMPONENT_PATH_INVALID', `Component manifest has an unsafe source or contract path: ${manifestPath}.`));
  }

  // <lang><zh-CN>locale 数组定义每个组件可被 adoption 选择的 UI 消息语言；空或未知 locale 不能形成可审计匹配。</zh-CN><en>The locale array defines the UI message languages each component can be selected for by adoption; empty or unknown locales cannot form an auditable match.</en></lang>
  if (!Array.isArray(component.locales) || component.locales.length === 0) {
    diagnostics.push(createDiagnostic('MANIFEST_COMPONENT_LOCALES_INVALID', `Component manifest has a component without supported locales: ${manifestPath}.`));
    return;
  }

  // <lang><zh-CN>已声明 locale 集合用于检测重复；不排序 locale 以保留 UI 包作者已有的首发语言展示顺序。</zh-CN><en>The declared locale set detects duplicates; locale order is not constrained so UI-package authors retain their existing first-release language presentation order.</en></lang>
  const declaredLocales = new Set();
  for (const locale of component.locales) {
    // <lang><zh-CN>当前 locale 是运行时消息 locale，而不是源码 Documentation Sys 的 zh-CN/en 标识。</zh-CN><en>The current locale is a runtime-message locale, not the Documentation Sys zh-CN/en identifier for source code.</en></lang>
    const localeName = locale;
    if (!supportedUiLocales.has(localeName)) {
      diagnostics.push(createDiagnostic('MANIFEST_COMPONENT_LOCALE_UNSUPPORTED', `Component manifest has an unsupported component locale: ${manifestPath}.`));
    } else if (declaredLocales.has(localeName)) {
      diagnostics.push(createDiagnostic('MANIFEST_COMPONENT_LOCALE_DUPLICATE', `Component manifest declares a component locale more than once: ${manifestPath}.`));
    }

    // <lang><zh-CN>记录 locale 后继续检查其余项，以一次报告完整暴露重复或不支持的声明。</zh-CN><en>Record the locale before continuing so one report fully exposes duplicate or unsupported declarations.</en></lang>
    declaredLocales.add(localeName);
  }
}

/**
 * @lang zh-CN 校验已解析 component manifest 的版本、profile、样式入口、组件字段、唯一性和稳定顺序；返回诊断但不修改输入对象。
 * @lang en Validates version, profile, style entry, component fields, uniqueness, and stable order of a parsed component manifest; returns diagnostics without modifying the input object.
 */
export function validateComponentManifest(manifest, manifestPath) {
  // <lang><zh-CN>manifest 必须是普通 JSON 对象；在对象形状无效时停止深层读取以避免派生误导诊断。</zh-CN><en>The manifest must be a plain JSON object; stop deep reading when its shape is invalid to avoid deriving misleading diagnostics.</en></lang>
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return [createDiagnostic('MANIFEST_SCHEMA_INVALID', `Declared component manifest must be a JSON object: ${manifestPath}.`)];
  }

  // <lang><zh-CN>收集全部独立问题，使维护者能在一次只读调用中修正 metadata，而无需猜测下一处失败。</zh-CN><en>Collect every independent issue so a maintainer can correct metadata in one read-only invocation without guessing the next failure.</en></lang>
  const diagnostics = [];
  // <lang><zh-CN>字段白名单保持 component manifest 只表达 UI 契约，禁止静默扩展成业务或可执行配置容器。</zh-CN><en>The field allowlist keeps a component manifest expressing only UI contract and prevents silent expansion into a business or executable configuration container.</en></lang>
  for (const field of Object.keys(manifest)) {
    // <lang><zh-CN>当前顶层字段名仅用于 schema 判断；诊断不回显其值。</zh-CN><en>The current top-level field name is used only for schema determination; diagnostics do not echo its value.</en></lang>
    const fieldName = field;
    if (!allowedComponentManifestFields.has(fieldName)) {
      diagnostics.push(createDiagnostic('MANIFEST_FIELD_UNKNOWN', `Component manifest has an unsupported field: ${fieldName}.`));
    }
  }

  // <lang><zh-CN>version 锁定当前 machine-readable 结构；未来变更必须显式升版，不能由 Tool 猜测兼容性。</zh-CN><en>Version locks the current machine-readable structure; future changes must explicitly bump it and cannot be compatibility-guessed by the Tool.</en></lang>
  if (manifest.version !== 1) {
    diagnostics.push(createDiagnostic('MANIFEST_VERSION_UNSUPPORTED', `Component manifest version must be 1: ${manifestPath}.`));
  }

  // <lang><zh-CN>P17 只有 mp-weixin UI profile；其他平台必须先建立独立 profile/fixture/evidence 契约。</zh-CN><en>P17 has only the mp-weixin UI profile; every other platform must first establish a separate profile, fixture, and evidence contract.</en></lang>
  if (manifest.profile !== 'mp-weixin') {
    diagnostics.push(createDiagnostic('MANIFEST_PROFILE_UNSUPPORTED', `Component manifest profile must be "mp-weixin": ${manifestPath}.`));
  }

  // <lang><zh-CN>样式入口是 adoption 对齐的唯一 UI 资产声明；它必须保持 manifest 相对且不含越界语义。</zh-CN><en>The style entry is the only UI asset declaration used for adoption alignment; it must remain manifest-relative and free of escaping semantics.</en></lang>
  if (!isSafeRelativePath(manifest.styleEntry)) {
    diagnostics.push(createDiagnostic('MANIFEST_STYLE_ENTRY_INVALID', `Component manifest must declare a safe style entry: ${manifestPath}.`));
  }

  // <lang><zh-CN>组件数组是 inspect 和 adoption membership 的唯一来源；空数组不能提供任何可用 UI 契约。</zh-CN><en>The component array is the sole source for inspect and adoption membership; an empty array cannot provide any usable UI contract.</en></lang>
  if (!Array.isArray(manifest.components) || manifest.components.length === 0) {
    diagnostics.push(createDiagnostic('MANIFEST_COMPONENTS_INVALID', `Component manifest must declare at least one component: ${manifestPath}.`));
    return diagnostics;
  }

  // <lang><zh-CN>名称集合与声明顺序列表分别服务于重复检测和稳定排序；二者都只保留公开组件标识而非源码文本。</zh-CN><en>The name set and declaration-order list serve duplicate detection and stable ordering respectively; both retain only public component identifiers, not source text.</en></lang>
  const componentNames = new Set();
  const declaredNames = [];
  for (const component of manifest.components) {
    // <lang><zh-CN>当前 record 交给单一校验节点，以保持每项字段规则与诊断代码一致。</zh-CN><en>Pass the current record to one validation node so each field rule and diagnostic code remains consistent.</en></lang>
    const componentRecord = component;
    validateComponentRecord(componentRecord, manifestPath, componentNames, diagnostics);

    // <lang><zh-CN>仅将有效非空名称加入排序输入；无效值已拥有更精确的 record 诊断，不再制造比较噪声。</zh-CN><en>Add only valid nonempty names to ordering input; invalid values already have more precise record diagnostics and should not create comparison noise.</en></lang>
    if (typeof componentRecord?.name === 'string' && componentRecord.name.trim()) {
      declaredNames.push(componentRecord.name.trim());
    }
  }

  // <lang><zh-CN>按代码点顺序要求使 manifest diff、inspect JSON 和 adoption fixture 在不同主机上保持稳定。</zh-CN><en>Code-point order keeps manifest diffs, inspect JSON, and adoption fixtures stable across hosts.</en></lang>
  if (!isCodePointSorted(declaredNames)) {
    diagnostics.push(createDiagnostic('MANIFEST_COMPONENT_ORDER_INVALID', `Component manifest component names must be in code-point order: ${manifestPath}.`));
  }

  return diagnostics;
}

/**
 * @lang zh-CN 读取并校验一个 configuration 已声明的 component manifest，同时保留其安全相对路径供后续报告或 adoption 关联使用。
 * @lang en Reads and validates one configuration-declared component manifest while retaining its safe relative path for later reporting or adoption linkage.
 */
export async function loadComponentManifest(rootDirectory, manifestPath) {
  // <lang><zh-CN>统一使用既有 MANIFEST diagnostic 前缀，保持 doctor/check 首轮消费者的稳定错误代码。</zh-CN><en>Use the established MANIFEST diagnostic prefix consistently to preserve stable first-slice error codes for doctor/check consumers.</en></lang>
  const loaded = await readDeclaredJson(rootDirectory, manifestPath, 'MANIFEST');
  if (loaded.diagnostics.length > 0) {
    return { path: normalizeRelativePath(manifestPath), manifest: null, diagnostics: loaded.diagnostics };
  }

  // <lang><zh-CN>对已解析 JSON 运行纯 schema 校验；校验不读取 component source、style 或 Markdown 文件。</zh-CN><en>Run pure schema validation against parsed JSON; validation does not read component source, style, or Markdown files.</en></lang>
  const diagnostics = validateComponentManifest(loaded.value, normalizeRelativePath(manifestPath));
  return { path: normalizeRelativePath(manifestPath), manifest: loaded.value, diagnostics };
}
