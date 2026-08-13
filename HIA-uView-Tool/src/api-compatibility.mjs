/**
 * @module tool-api-compatibility
 * @lang zh-CN 读取并严格校验 HIA-uView-UI 声明的离线 API/迁移比较矩阵；模块只消费 configuration 明示的仓内 JSON 与已加载 component manifest，不扫描源码、上游 checkout、类型、文档或网络，也不执行或写入任何内容。
 * @lang en Reads and strictly validates the offline API and migration comparison matrix declared by HIA-uView-UI; the module consumes only repository-local JSON explicitly selected by configuration and an already loaded component manifest, scans no source, upstream checkout, types, documentation, or network, and executes or writes nothing.
 */

// <lang><zh-CN>摘要只用于复核矩阵当前声明的组件名称集合；不会摘要、恢复或执行任何源码表达式。</zh-CN><en>Digest support is used only to verify the component-name set declared by the current matrix; it never digests, recovers, or evaluates a source expression.</en></lang>
import { createHash } from 'node:crypto';
// <lang><zh-CN>复用 Tool 的稳定诊断、安全相对路径与跨平台路径规范化边界。</zh-CN><en>Reuses the Tool's stable diagnostics, safe-relative-path boundary, and cross-platform path normalization.</en></lang>
import { createDiagnostic, isSafeRelativePath, normalizeRelativePath } from './config.mjs';
// <lang><zh-CN>复用只读 JSON loader 与无 locale 漂移的代码点排序判断；不会打开矩阵内声明的 source/contract/evidence 路径。</zh-CN><en>Reuses the read-only JSON loader and locale-independent code-point ordering check; no source, contract, or evidence path declared inside the matrix is opened.</en></lang>
import { isCodePointSorted, readDeclaredJson } from './metadata.mjs';

/**
 * @lang zh-CN 矩阵顶层唯一允许字段；拒绝 summary、时间戳、hook、凭据或隐式输入路径。
 * @lang en Sole fields allowed at matrix top level; summaries, timestamps, hooks, credentials, and implicit input paths are rejected.
 */
const allowedTopLevelFields = new Set(['version', 'kind', 'profile', 'comparison', 'local', 'issues', 'components']);

/**
 * @lang zh-CN v2 顶层在 v1 只读比较边界上增加 semantic review provenance；旧矩阵不会被静默按 v2 解释。
 * @lang en Version 2 adds semantic-review provenance to the v1 read-only comparison boundary; an older matrix is never silently reinterpreted as v2.
 */
const allowedTopLevelFieldsV2 = new Set([...allowedTopLevelFields, 'semanticReview']);

/**
 * @lang zh-CN 每个比较组件必须拥有的固定维度；`imperativeApis` 与 declarative API 分开，避免方法/service 被 props 名称覆盖。
 * @lang en Fixed dimensions required for every comparison component; `imperativeApis` stays separate from declarative APIs so methods and services cannot be hidden by prop names.
 */
const allowedComponentFields = new Set([
  'name',
  'priority',
  'upstream',
  'hia',
  'props',
  'events',
  'slots',
  'imperativeApis',
  'aliases',
  'easycom',
  'types',
  'platforms',
  'migration',
  'issueIds'
]);

/**
 * @lang zh-CN v2 组件增加独立 services inventory；它不进入四类 API item 或 `api-items-only` migration 统计。
 * @lang en Version 2 components add a separate services inventory that enters neither the four API-item dimensions nor `api-items-only` migration totals.
 */
const allowedComponentFieldsV2 = new Set([...allowedComponentFields, 'services']);

/**
 * @lang zh-CN 上游主导 API item 的固定字段；迁移状态与优先级不能被备注或名称推断代替。
 * @lang en Fixed fields of an upstream-led API item; migration disposition and priority cannot be replaced by notes or name inference.
 */
const allowedApiItemFields = new Set(['id', 'upstream', 'hia', 'priority', 'migration']);

/**
 * @lang zh-CN v2 的 P0 item 以额外 `semantics` 字段承载逐项审阅；P1/P2 继续使用 v1 五字段 envelope。
 * @lang en A version 2 P0 item carries item-by-item review in an additional `semantics` field, while P1/P2 retain the v1 five-field envelope.
 */
const allowedP0ApiItemFieldsV2 = new Set([...allowedApiItemFields, 'semantics']);

/**
 * @lang zh-CN API 兼容矩阵可声明的组件/API 优先级。
 * @lang en Component and API priorities allowed by the matrix.
 */
const supportedPriorities = new Set(['P0', 'P1', 'P2']);

/**
 * @lang zh-CN 当前迁移事实的受控分类；unsupported 是有效事实而非 schema 错误。
 * @lang en Controlled classifications for current migration facts; unsupported is valid metadata rather than a schema error.
 */
const supportedDispositions = new Set(['compatible', 'mapped', 'unsupported']);

/**
 * @lang zh-CN 当前独立 service inventory 允许的 owner/item 与 HIA target 精确映射；固定表只验证 metadata，不导入或执行 service runtime。
 * @lang en Exact owner/item-to-HIA-target mapping allowed by the current separate service inventory; the fixed table validates metadata only and neither imports nor executes the service runtime.
 */
const supportedServiceTargets = new Map([
  ['u-modal/service:useModal', 'useModal'],
  ['u-toast/service:useToast', 'useToast']
]);

/**
 * @lang zh-CN API inventory 的两种显式完成状态；unresolved 必须由组件 issue 引用解释，但本身不失败。
 * @lang en Two explicit API-inventory completion states; unresolved must be explained by component issue references but is not itself a failure.
 */
const supportedInventoryStates = new Set(['complete', 'unresolved']);

/**
 * @lang zh-CN prop 类型事实允许的稳定构造器标识；`unknown` 只保留为受控抽取结果，不会被执行。
 * @lang en Stable constructor identifiers allowed in prop type facts; `unknown` remains only a controlled extraction result and is never executed.
 */
const supportedTypeKinds = new Set(['Array', 'Boolean', 'Date', 'Function', 'Number', 'Object', 'String', 'unknown']);

/**
 * @lang zh-CN default fact 的受控 one-of 分支；expression 只携带 SHA-256，不携带可执行文本。
 * @lang en Controlled one-of branches for default facts; expression carries only a SHA-256 digest and no executable text.
 */
const supportedDefaultKinds = new Set(['absent', 'literal', 'factory-array', 'factory-object', 'expression', 'unresolved']);

/**
 * @lang zh-CN prop validator 允许的只读事实类别；expression 只携带摘要，Tool 不保存或执行 validator 正文。
 * @lang en Read-only fact classes allowed for prop validators; expression carries only a digest, and the Tool neither stores nor executes validator bodies.
 */
const supportedValidatorKinds = new Set(['absent', 'expression']);

/**
 * @lang zh-CN v1 package 物化摘要的稳定格式政策；具体 scope、文件计数和内容摘要属于 manifest 声明与仓内契约，不在通用 loader 中冻结。
 * @lang en Stable format policy for v1 package-materialization digests; concrete scope, file counts, and content digest belong to the manifest and repository contract and are not frozen in the generic loader.
 */
const packageMaterializationFormat = Object.freeze({
  algorithm: 'sha256-framed-relative-path-kind-content-v1',
  framing: 'magic|uint32be(fileCount)|repeat(uint32be(pathUtf8Length)|pathUtf8|kindByte|uint64be(contentLength)|content)',
  pathEncoding: 'utf-8',
  pathOrder: 'unicode-code-point',
  textDetection: 'utf8-roundtrip-without-nul',
  textNormalization: 'CRLF/CR-to-LF',
  binaryNormalization: 'raw-bytes'
});

/**
 * @lang zh-CN comparison easycom repository/package 交付状态的受控枚举；状态只描述声明边界，不触发发现或运行。
 * @lang en Controlled repository/package delivery statuses for comparison easycom evidence; statuses describe declaration boundaries only and trigger no discovery or execution.
 */
const supportedComparisonRepositoryFixtureStatuses = new Set(['delivered']);
const supportedComparisonPackageEasycomStatuses = new Set(['consumer-configuration-required', 'delivered', 'not-delivered']);

/**
 * @lang zh-CN comparison diff 可记录的 Git 路径状态。
 * @lang en Git path states recordable by the comparison diff.
 */
const supportedChangedPathStatuses = new Set(['added', 'deleted', 'modified']);

/**
 * @lang zh-CN 组件上游 types/service 文件的声明状态。
 * @lang en Declaration states for upstream component types and service files.
 */
const supportedUpstreamFileStatuses = new Set(['available', 'not-declared']);

/**
 * @lang zh-CN 各 inventory/alias 维度的精确审计 scope；`complete` 只覆盖该 scope，不能外推更丰富语义。
 * @lang en Exact audit scope for every inventory and alias dimension; `complete` covers only this scope and cannot be extrapolated to richer semantics.
 */
const expectedInventoryScopes = Object.freeze({
  props: 'runtime-prop-options',
  events: 'names-only',
  slots: 'names-only',
  imperativeApis: 'names-only',
  aliases: 'runtime-aliases'
});

/**
 * @lang zh-CN default unresolved issue 可使用的直接问题 scope；`props` 表示整个 prop surface，`defaults` 表示专门的默认值抽取问题。
 * @lang en Direct issue scopes allowed for an unresolved default; `props` covers the prop surface and `defaults` denotes a default-extraction-specific issue.
 */
const defaultIssueScopes = new Set(['props', 'defaults']);

/**
 * @lang zh-CN parser 拥有但由单一 container 直接绑定的受控问题 scope；它不能跨 surface 复用，也不能替代 component owner。
 * @lang en Controlled scope for parser-owned issues directly bound by one container; it cannot be reused across surfaces or replace component ownership.
 */
const parserOwnedIssueScope = 'static-parser';

/**
 * @lang zh-CN 当前 component type 交付状态枚举。
 * @lang en Current component-type delivery status enumeration.
 */
const supportedTypeDeliveryStatuses = new Set(['available', 'not-declared', 'delivered', 'not-delivered']);

/**
 * @lang zh-CN 公共 issue 的固定字段；evidence 是可选的受限 JSON 数据，而非可执行或自动读取目标。
 * @lang en Fixed fields for public issues; evidence is optional bounded JSON data rather than an executable or automatically read target.
 */
const allowedIssueFields = new Set(['id', 'severity', 'scope', 'component', 'components', 'message', 'evidence']);

/**
 * @lang zh-CN 判断值是否为非数组、非 null 的普通 JSON record。
 * @lang en Determines whether a value is a non-array, non-null plain JSON record.
 * @param {unknown} value <lang><zh-CN>待判断值。</zh-CN><en>Value to inspect.</en></lang>
 * @returns {boolean} <lang><zh-CN>普通 record 时为真。</zh-CN><en>True for a plain record.</en></lang>
 */
function isRecord(value) {
  // <lang><zh-CN>JSON object 必须同时排除 null 与数组，避免后续字段读取产生误导诊断。</zh-CN><en>A JSON object must exclude both null and arrays so later field access cannot produce misleading diagnostics.</en></lang>
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * @lang zh-CN 比较两个仅含 JSON primitive 字段的扁平 record 是否拥有相同字段和值，不依赖 JSON 字段插入顺序。
 * @lang en Compares two flat records containing only JSON-primitive fields for identical keys and values without depending on JSON insertion order.
 * @param {unknown} left <lang><zh-CN>左侧候选 record。</zh-CN><en>Left candidate record.</en></lang>
 * @param {unknown} right <lang><zh-CN>右侧候选 record。</zh-CN><en>Right candidate record.</en></lang>
 * @returns {boolean} <lang><zh-CN>字段集合和值完全相同时为真。</zh-CN><en>True when both the field set and values are identical.</en></lang>
 */
function areFlatRecordsEqual(left, right) {
  // <lang><zh-CN>非 record 无法形成可比较投影；数组与 null 同样拒绝。</zh-CN><en>A non-record cannot form a comparable projection; arrays and null are rejected as well.</en></lang>
  if (!isRecord(left) || !isRecord(right)) return false;
  // <lang><zh-CN>代码点排序后的字段数组消除 JSON 插入顺序差异，同时保留精确字段集合。</zh-CN><en>Code-point-sorted key arrays remove JSON insertion-order differences while retaining the exact field set.</en></lang>
  const leftFields = Object.keys(left).sort();
  // <lang><zh-CN>右侧字段独立排序，用于一对一位置比较。</zh-CN><en>Right-side keys are sorted independently for one-to-one positional comparison.</en></lang>
  const rightFields = Object.keys(right).sort();
  // <lang><zh-CN>字段数、字段名及 primitive 值必须逐项相等；函数不递归也不做隐式类型转换。</zh-CN><en>Field count, names, and primitive values must match entry by entry; the function neither recurses nor coerces types.</en></lang>
  return leftFields.length === rightFields.length
    && leftFields.every((field, index) => field === rightFields[index] && left[field] === right[field]);
}

/**
 * @lang zh-CN 判断值是否为去除首尾空白后仍非空的字符串。
 * @lang en Determines whether a value is a string that remains nonempty after trimming.
 * @param {unknown} value <lang><zh-CN>待判断值。</zh-CN><en>Value to inspect.</en></lang>
 * @returns {boolean} <lang><zh-CN>稳定非空字符串时为真。</zh-CN><en>True for a stable nonempty string.</en></lang>
 */
function isNonemptyString(value) {
  // <lang><zh-CN>标识、路径与 reason code 不允许用空白占位掩盖未知。</zh-CN><en>Identifiers, paths, and reason codes may not hide unknown values behind whitespace placeholders.</en></lang>
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * @lang zh-CN 判断值是否为固定长度的小写十六进制 Git object id。
 * @lang en Determines whether a value is a fixed-length lowercase hexadecimal Git object id.
 * @param {unknown} value <lang><zh-CN>待判断的 commit/tree/blob。</zh-CN><en>Commit, tree, or blob value to inspect.</en></lang>
 * @returns {boolean} <lang><zh-CN>40 位小写十六进制时为真。</zh-CN><en>True for forty lowercase hexadecimal characters.</en></lang>
 */
function isGitObjectId(value) {
  // <lang><zh-CN>固定 SHA-1 文本长度使浮动 ref、短 commit 与任意说明不能冒充不可变 provenance。</zh-CN><en>The fixed SHA-1 text length prevents floating refs, short commits, and arbitrary prose from masquerading as immutable provenance.</en></lang>
  return typeof value === 'string' && /^[0-9a-f]{40}$/u.test(value);
}

/**
 * @lang zh-CN 判断值是否为带算法前缀的完整 SHA-256 摘要。
 * @lang en Determines whether a value is a complete SHA-256 digest with its algorithm prefix.
 * @param {unknown} value <lang><zh-CN>待判断摘要。</zh-CN><en>Digest to inspect.</en></lang>
 * @returns {boolean} <lang><zh-CN>合法摘要时为真。</zh-CN><en>True for a valid digest.</en></lang>
 */
function isSha256Digest(value) {
  // <lang><zh-CN>只接受小写、定长摘要，保持生成物和跨主机比较确定。</zh-CN><en>Only lowercase fixed-length digests are accepted to keep generated output deterministic across hosts.</en></lang>
  return typeof value === 'string' && /^sha256:[0-9a-f]{64}$/u.test(value);
}

/**
 * @lang zh-CN 判断公开 repository URL 是否是无凭据、无 query/hash 的 GitHub HTTPS 仓库定位符；函数不访问 URL。
 * @lang en Determines whether a public repository URL is a credential-free GitHub HTTPS repository locator without query or hash; the function never accesses the URL.
 * @param {unknown} value <lang><zh-CN>待判断 URL。</zh-CN><en>URL to inspect.</en></lang>
 * @returns {boolean} <lang><zh-CN>安全公开定位符时为真。</zh-CN><en>True for a safe public locator.</en></lang>
 */
function isPublicRepositoryUrl(value) {
  // <lang><zh-CN>先排除非字符串，避免 URL constructor 对任意对象执行隐式转换。</zh-CN><en>Reject non-strings first so the URL constructor never performs implicit conversion on arbitrary objects.</en></lang>
  if (!isNonemptyString(value)) return false;

  // <lang><zh-CN>URL 构造器错误被局部捕获并转换为 false；解析过程不触发网络。</zh-CN><en>URL-constructor errors are caught locally and converted to false; parsing triggers no network access.</en></lang>
  try {
    // <lang><zh-CN>解析仅用于语法检查；不会产生 DNS、HTTP 或其他网络行为。</zh-CN><en>Parsing serves syntax validation only and causes no DNS, HTTP, or other network behavior.</en></lang>
    const parsed = new URL(value);
    // <lang><zh-CN>同时锁定 HTTPS、公开 GitHub host、无凭据/查询/片段及双段仓库路径，避免“可解析”被误当作“可公开引用”。</zh-CN><en>Lock HTTPS, the public GitHub host, absence of credentials/query/fragment, and a two-segment repository path so “parseable” cannot be mistaken for “safe to cite publicly.”</en></lang>
    return parsed.protocol === 'https:'
      && parsed.hostname === 'github.com'
      && !parsed.username
      && !parsed.password
      && !parsed.search
      && !parsed.hash
      && /^\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/u.test(parsed.pathname);
  } catch {
    // <lang><zh-CN>无法解析的值只是 schema 不合格，不回显底层 URL 错误。</zh-CN><en>An unparseable value is merely schema-invalid and does not expose an underlying URL error.</en></lang>
    return false;
  }
}

/**
 * @lang zh-CN 向诊断列表追加不含绝对路径或原始 JSON 的稳定 API-matrix 错误。
 * @lang en Appends a stable API-matrix error containing neither absolute paths nor raw JSON.
 * @param {Array<object>} diagnostics <lang><zh-CN>可变诊断累积器。</zh-CN><en>Mutable diagnostic accumulator.</en></lang>
 * @param {string} code <lang><zh-CN>稳定公开诊断码。</zh-CN><en>Stable public diagnostic code.</en></lang>
 * @param {string} message <lang><zh-CN>只含公开字段/标识的可操作说明。</zh-CN><en>Actionable message containing only public fields or identifiers.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function addDiagnostic(diagnostics, code, message) {
  // <lang><zh-CN>API matrix 结构问题属于 project metadata，因此沿用默认 project category。</zh-CN><en>API-matrix structural problems belong to project metadata and therefore retain the default project category.</en></lang>
  diagnostics.push(createDiagnostic(code, message));
}

/**
 * @lang zh-CN 校验 record 的精确字段集合，并分别报告缺失与未知字段。
 * @lang en Validates the exact field set of a record and reports missing and unknown fields separately.
 * @param {unknown} value <lang><zh-CN>待校验 record。</zh-CN><en>Record to validate.</en></lang>
 * @param {Set<string>} allowedFields <lang><zh-CN>允许字段集合。</zh-CN><en>Allowed field set.</en></lang>
 * @param {string[]} requiredFields <lang><zh-CN>必填字段顺序。</zh-CN><en>Required fields in stable order.</en></lang>
 * @param {string} context <lang><zh-CN>公开诊断上下文。</zh-CN><en>Public diagnostic context.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {boolean} <lang><zh-CN>顶层形状为 record 时为真；字段问题仍通过 diagnostics 表示。</zh-CN><en>True when the top-level shape is a record; field problems remain represented by diagnostics.</en></lang>
 */
function validateExactFields(value, allowedFields, requiredFields, context, diagnostics) {
  // <lang><zh-CN>非 record 无法安全枚举字段，只产生一个精确形状错误。</zh-CN><en>A non-record cannot be safely enumerated and produces one precise shape error.</en></lang>
  if (!isRecord(value)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_SCHEMA_INVALID', `${context} must be a JSON object.`);
    return false;
  }

  // <lang><zh-CN>未知字段逐项报告，但不输出其值，避免 hook、凭据或源正文进入诊断。</zh-CN><en>Unknown fields are reported one by one without their values so hooks, credentials, or source body cannot enter diagnostics.</en></lang>
  for (const field of Object.keys(value)) {
    // <lang><zh-CN>每个未知字段独立产生诊断，确保一次遍历可列出全部越界字段。</zh-CN><en>Each unknown field produces its own diagnostic so one traversal can expose every out-of-bound field.</en></lang>
    if (!allowedFields.has(field)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_FIELD_UNKNOWN', `${context} has an unsupported field: ${field}.`);
    }
  }

  // <lang><zh-CN>按固定 required 顺序报告缺项，使 text/JSON 输出稳定。</zh-CN><en>Missing fields are reported in fixed required order to keep text and JSON output stable.</en></lang>
  for (const field of requiredFields) {
    // <lang><zh-CN>缺失检查只观察自有字段，原型链上的同名值不能满足 schema。</zh-CN><en>Missing-field checks observe own properties only, so a same-named prototype value cannot satisfy the schema.</en></lang>
    if (!Object.hasOwn(value, field)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_FIELD_MISSING', `${context} must declare field: ${field}.`);
    }
  }

  // <lang><zh-CN>返回 true 只表示可以安全继续读取 record；未知或缺失字段已经进入 diagnostics，并不被此布尔值抵消。</zh-CN><en>True means only that the record can be read safely; unknown or missing fields have already entered diagnostics and are not negated by this boolean.</en></lang>
  return true;
}

/**
 * @lang zh-CN 校验非空、唯一且按代码点排序的字符串数组。
 * @lang en Validates a nonempty, unique, code-point-sorted string array.
 * @param {unknown} value <lang><zh-CN>候选数组。</zh-CN><en>Candidate array.</en></lang>
 * @param {string} context <lang><zh-CN>公开诊断上下文。</zh-CN><en>Public diagnostic context.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @param {boolean} [allowEmpty=false] <lang><zh-CN>是否允许已审计空数组。</zh-CN><en>Whether an audited empty array is allowed.</en></lang>
 * @returns {string[] | null} <lang><zh-CN>规范字符串数组；形状无效时为 null。</zh-CN><en>Normalized string array, or null for an invalid shape.</en></lang>
 */
function validateStringArray(value, context, diagnostics, allowEmpty = false) {
  // <lang><zh-CN>数组形状与空值语义先验证，避免后续 trim 对非字符串抛错。</zh-CN><en>Validate array shape and empty semantics first so later trimming cannot fail on non-strings.</en></lang>
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0) || !value.every(isNonemptyString)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_VALUE_INVALID', `${context} must be ${allowEmpty ? 'an' : 'a non-empty'} array of non-empty strings.`);
    return null;
  }

  // <lang><zh-CN>规范化只移除外围空白；内部 API 标识与大小写保持原样。</zh-CN><en>Normalization removes outer whitespace only; internal API identity and casing remain unchanged.</en></lang>
  const normalized = value.map((item) => item.trim());
  // <lang><zh-CN>重复或乱序会让生成物 diff、映射主键和汇总漂移，因此分别失败。</zh-CN><en>Duplicates or unstable order would drift generated diffs, mapping keys, and summaries, so each fails explicitly.</en></lang>
  if (new Set(normalized).size !== normalized.length) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_VALUE_DUPLICATE', `${context} must not repeat a value.`);
  }
  // <lang><zh-CN>排序错误与重复错误分开报告，使生成器可独立修复序列顺序。</zh-CN><en>Order errors are reported separately from duplicates so the generator can repair sequence order independently.</en></lang>
  if (!isCodePointSorted(normalized)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_VALUE_ORDER_INVALID', `${context} must use code-point order.`);
  }

  // <lang><zh-CN>调用方取得去除外围空白后的稳定视图；重复或排序错误仍保留该视图以继续收集独立诊断。</zh-CN><en>The caller receives a stable outer-whitespace-trimmed view; duplicate or ordering errors still retain that view so independent diagnostics can continue.</en></lang>
  return normalized;
}

/**
 * @lang zh-CN 校验固定字段的 path/digest record；只验证声明，不打开目标文件。
 * @lang en Validates a fixed path and digest record without opening its target file.
 * @param {unknown} value <lang><zh-CN>候选 record。</zh-CN><en>Candidate record.</en></lang>
 * @param {string} context <lang><zh-CN>公开诊断上下文。</zh-CN><en>Public diagnostic context.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function validatePathDigestRecord(value, context, diagnostics) {
  // <lang><zh-CN>两个字段均必填且禁止扩展，防止路径 record 夹带源码或读取指令。</zh-CN><en>Both fields are required and extensions are forbidden so a path record cannot carry source body or read instructions.</en></lang>
  if (!validateExactFields(value, new Set(['path', 'digest']), ['path', 'digest'], context, diagnostics)) return;
  // <lang><zh-CN>路径只允许留在调用仓库根内；validator 不尝试解析、打开或修复目标。</zh-CN><en>The path must remain within the invocation repository root; the validator does not resolve, open, or repair its target.</en></lang>
  if (!isSafeRelativePath(value.path)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_PATH_INVALID', `${context}.path must be a safe relative path.`);
  }
  // <lang><zh-CN>摘要格式独立于路径合法性校验，使调用方一次看到两类 metadata 缺陷。</zh-CN><en>Digest shape is checked independently of path safety so callers see both metadata defects in one pass.</en></lang>
  if (!isSha256Digest(value.digest)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_DIGEST_INVALID', `${context}.digest must be a SHA-256 digest.`);
  }
}

/**
 * @lang zh-CN 校验只允许 JSON primitive、数组与 record 的公开 evidence，拒绝空字符串、危险键和非 JSON 值。
 * @lang en Validates public evidence limited to JSON primitives, arrays, and records, rejecting blank strings, dangerous keys, and non-JSON values.
 * @param {unknown} value <lang><zh-CN>候选 evidence 值。</zh-CN><en>Candidate evidence value.</en></lang>
 * @param {string} context <lang><zh-CN>公开诊断上下文。</zh-CN><en>Public diagnostic context.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {boolean} <lang><zh-CN>完全由受限 JSON 值组成时为真。</zh-CN><en>True when composed entirely of bounded JSON values.</en></lang>
 */
function validatePublicEvidence(value, context, diagnostics) {
  // <lang><zh-CN>null、boolean 与有限 number 是合法 JSON evidence；NaN/Infinity 不是 JSON 值。</zh-CN><en>Null, booleans, and finite numbers are legal JSON evidence; NaN and Infinity are not JSON values.</en></lang>
  if (value === null || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) return true;
  // <lang><zh-CN>evidence 字符串必须非空，避免把未知伪装为空说明。</zh-CN><en>Evidence strings must be nonempty so unknown facts cannot be disguised as blank prose.</en></lang>
  if (typeof value === 'string') return isNonemptyString(value);

  // <lang><zh-CN>数组 evidence 保持声明顺序并递归限制每一项。</zh-CN><en>Array evidence preserves declaration order and recursively bounds every entry.</en></lang>
  if (Array.isArray(value)) {
    // <lang><zh-CN>数组逐项递归校验；不执行或解释其中字符串。</zh-CN><en>Array entries are recursively validated without executing or interpreting their strings.</en></lang>
    return value.every((item, index) => validatePublicEvidence(item, `${context}[${index}]`, diagnostics));
  }

  // <lang><zh-CN>record evidence 逐字段递归，且不会调用用户定义 getter 或执行文本。</zh-CN><en>Record evidence is checked recursively per field without evaluating text or intentionally invoking user code.</en></lang>
  if (isRecord(value)) {
    // <lang><zh-CN>原型污染相关键不允许成为公共 evidence 字段；其余键必须非空。</zh-CN><en>Prototype-pollution keys are forbidden in public evidence; every other key must be nonempty.</en></lang>
    for (const [field, fieldValue] of Object.entries(value)) {
      // <lang><zh-CN>字段名先过非空与原型污染门禁，再递归检查字段值，避免危险键绕过嵌套 JSON 限制。</zh-CN><en>Each field name passes nonempty and prototype-pollution gates before its value is checked recursively, preventing dangerous keys from bypassing nested-JSON limits.</en></lang>
      if (!isNonemptyString(field) || ['__proto__', 'constructor', 'prototype'].includes(field)) return false;
      // <lang><zh-CN>任一嵌套值越界即使整个 evidence 失效；不对坏值做字符串化或部分保留。</zh-CN><en>Any out-of-bound nested value invalidates the whole evidence object; the bad value is neither stringified nor partially retained.</en></lang>
      if (!validatePublicEvidence(fieldValue, `${context}.${field}`, diagnostics)) return false;
    }
    // <lang><zh-CN>遍历完成代表当前 record 的全部键和值都留在受限 JSON 边界内。</zh-CN><en>Completing traversal proves that every key and value in the current record remains inside the bounded-JSON boundary.</en></lang>
    return true;
  }

  // <lang><zh-CN>function、symbol、undefined、bigint 等非 JSON 值统一失败，且不会被隐式转换。</zh-CN><en>Non-JSON values such as functions, symbols, undefined, and bigint fail uniformly without implicit conversion.</en></lang>
  return false;
}

/**
 * @lang zh-CN 校验 package 的完整离线物化格式、计数自洽与摘要声明；只比较 JSON 事实，不重新扫描 package，也不把结果描述成 Git 验证。
 * @lang en Validates a package's complete offline materialization format, count consistency, and digest declaration; it compares JSON only, rescans no package, and never describes the result as Git validation.
 * @param {unknown} materialization <lang><zh-CN>comparison.materialization 候选 record。</zh-CN><en>Candidate comparison.materialization record.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function validatePackageMaterialization(materialization, diagnostics) {
  // <lang><zh-CN>v1 格式字段与每份 manifest 自有的 scope、计数、摘要共同组成精确必填集合。</zh-CN><en>V1 format fields combine with each manifest's own scope, counts, and digest to form the exact required field set.</en></lang>
  const fields = ['scope', ...Object.keys(packageMaterializationFormat), 'fileCount', 'textFileCount', 'binaryFileCount', 'contentDigest'];
  // <lang><zh-CN>非 record 或字段扩展先失败，避免读取任意 framing/路径值。</zh-CN><en>A non-record or field extension fails first so arbitrary framing or path values are never consumed.</en></lang>
  if (!validateExactFields(materialization, new Set(fields), fields, 'API compatibility comparison.materialization', diagnostics)) return;

  // <lang><zh-CN>算法与 framing/规范化政策属于 v1 schema 格式，不含任何 release 专属路径、数量或摘要。</zh-CN><en>Algorithm, framing, and normalization policies belong to the v1 schema format and contain no release-specific path, count, or digest.</en></lang>
  const matchesV1Format = Object.entries(packageMaterializationFormat)
    .every(([field, value]) => materialization[field] === value);
  // <lang><zh-CN>三个文件计数必须是非负整数，且文本与二进制分类恰好覆盖总文件数。</zh-CN><en>The three file counts must be nonnegative integers, with text and binary classes exactly covering the total file count.</en></lang>
  const hasConsistentCounts = ['fileCount', 'textFileCount', 'binaryFileCount']
    .every((field) => Number.isInteger(materialization[field]) && materialization[field] >= 0)
    && materialization.textFileCount + materialization.binaryFileCount === materialization.fileCount;
  // <lang><zh-CN>scope 与摘要只过通用安全格式门禁；具体值由生成器和当前仓库契约冻结。</zh-CN><en>Scope and digest pass only generic safety-shape gates; concrete values are frozen by the generator and current repository contract.</en></lang>
  const hasSafeIdentity = isSafeRelativePath(materialization.scope) && isSha256Digest(materialization.contentDigest);
  // <lang><zh-CN>格式、计数和身份任一失效都会否定该物化声明，但不会尝试重新生成摘要。</zh-CN><en>Failure of format, counts, or identity invalidates the materialization declaration without attempting to regenerate its digest.</en></lang>
  if (!matchesV1Format || !hasConsistentCounts || !hasSafeIdentity) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_REFERENCE_INVALID', 'API compatibility comparison.materialization must declare a valid v1 canonical package-content aggregate with internally consistent counts.');
  }
}

/**
 * @lang zh-CN 校验上游 easycom repository-fixture 证据与 package 交付状态；具体路径、摘要和规则文本不在通用 loader 中冻结。
 * @lang en Validates upstream easycom repository-fixture evidence and package delivery status without freezing concrete paths, digests, or rule text in the generic loader.
 * @param {unknown} easycom <lang><zh-CN>comparison.easycom 候选 record。</zh-CN><en>Candidate comparison.easycom record.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function validateComparisonEasycom(easycom, diagnostics) {
  // <lang><zh-CN>精确字段集合禁止 regex flag、执行 hook 或隐式替代路径进入声明。</zh-CN><en>The exact field set forbids regex flags, execution hooks, or implicit alternate paths from entering the declaration.</en></lang>
  const fields = ['repositoryFixtureStatus', 'packageStatus', 'basis', 'path', 'digest', 'autoscan', 'pattern', 'replacement'];
  // <lang><zh-CN>外壳不是 record 时立即终止该维度，避免读取任意 mapping 字段。</zh-CN><en>Stop this dimension when its envelope is not a record so arbitrary mapping fields are never read.</en></lang>
  if (!validateExactFields(easycom, new Set(fields), fields, 'API compatibility comparison.easycom', diagnostics)) return;

  // <lang><zh-CN>repository/package 状态使用受控枚举；basis、pattern 与 replacement 必须非空，但 pattern 始终只作文本，Tool 不构造 RegExp。</zh-CN><en>Repository and package statuses use controlled enums; basis, pattern, and replacement must be nonempty, while pattern always remains text and the Tool never constructs a RegExp.</en></lang>
  const hasValidDeclaration = supportedComparisonRepositoryFixtureStatuses.has(easycom.repositoryFixtureStatus)
    && supportedComparisonPackageEasycomStatuses.has(easycom.packageStatus)
    && isNonemptyString(easycom.basis)
    && typeof easycom.autoscan === 'boolean'
    && isNonemptyString(easycom.pattern)
    && isNonemptyString(easycom.replacement);
  // <lang><zh-CN>独立路径/摘要门禁保持 provenance 字段与其他 comparison record 一致，具体值由仓库契约验证。</zh-CN><en>Independent path and digest gates keep provenance fields consistent with other comparison records, while concrete values remain a repository-contract concern.</en></lang>
  const hasSafeEvidenceIdentity = isSafeRelativePath(easycom.path) && isSha256Digest(easycom.digest);
  // <lang><zh-CN>状态/文本与 path/digest 必须同时有效，防止安全路径掩盖不受控交付结论。</zh-CN><en>Status/text and path/digest must both be valid so a safe path cannot mask an uncontrolled delivery conclusion.</en></lang>
  if (!hasValidDeclaration || !hasSafeEvidenceIdentity) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_REFERENCE_INVALID', 'API compatibility comparison.easycom must declare safe repository-fixture evidence and controlled package-delivery metadata.');
  }
}

/**
 * @lang zh-CN 校验 comparison provenance、前序提交与声明 changed-path 清单的固定 schema。
 * @lang en Validates the fixed schema of comparison provenance, the previous commit, and the declared changed-path list.
 * @param {unknown} comparison <lang><zh-CN>comparison record。</zh-CN><en>Comparison record.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function validateComparison(comparison, diagnostics) {
  // <lang><zh-CN>顶层 comparison 必须完整携带仓库、Git/package/license/component 与前序差异事实。</zh-CN><en>The top-level comparison must completely carry repository, Git, package, license, component, predecessor, and diff facts.</en></lang>
  const fields = ['repository', 'releaseTag', 'commit', 'tree', 'sourceRole', 'package', 'license', 'components', 'materialization', 'easycom', 'previous', 'compare'];
  // <lang><zh-CN>非 record comparison 无法安全读取任何 provenance 子项，因此在此维度早退。</zh-CN><en>A non-record comparison cannot expose provenance fields safely, so this dimension returns early.</en></lang>
  if (!validateExactFields(comparison, new Set(fields), fields, 'API compatibility comparison', diagnostics)) return;

  // <lang><zh-CN>仓库位置与 release tag 共同提供人类可复核入口；URL 仍只作语法校验，不联网。</zh-CN><en>The repository locator and release tag jointly provide a human-auditable entry point; the URL remains syntax-only and triggers no network access.</en></lang>
  if (!isPublicRepositoryUrl(comparison.repository) || !isNonemptyString(comparison.releaseTag)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_REFERENCE_INVALID', 'API compatibility comparison must declare a safe public repository and release tag.');
  }
  // <lang><zh-CN>commit/tree 固定字节来源，sourceRole 阻止该上游比较事实被误报为本地实现或运行时依赖。</zh-CN><en>Commit and tree pin the byte source while sourceRole prevents this upstream comparison fact from being reported as local implementation or runtime dependency.</en></lang>
  if (!isGitObjectId(comparison.commit) || !isGitObjectId(comparison.tree) || comparison.sourceRole !== 'comparison-only') {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_REFERENCE_INVALID', 'API compatibility comparison must declare immutable commit/tree identifiers and sourceRole "comparison-only".');
  }

  // <lang><zh-CN>package provenance 只允许公开标识、版本、安全路径、Git object 与摘要。</zh-CN><en>Package provenance allows only a public identity, version, safe path, Git objects, and digest.</en></lang>
  const packageFields = ['id', 'version', 'path', 'blob', 'tree', 'digest'];
  // <lang><zh-CN>package 子记录形状成立后才读取其 immutable metadata。</zh-CN><en>Immutable package metadata is read only after its subrecord has a safe shape.</en></lang>
  if (validateExactFields(comparison.package, new Set(packageFields), packageFields, 'API compatibility comparison.package', diagnostics)) {
    // <lang><zh-CN>身份、版本、路径、Git objects 与摘要逐项受限，任一坏值都会使 package provenance 失效。</zh-CN><en>Identity, version, path, Git objects, and digest are all bounded, and any bad value invalidates package provenance.</en></lang>
    if (!isNonemptyString(comparison.package.id) || !isNonemptyString(comparison.package.version) || !isSafeRelativePath(comparison.package.path)
      || !isGitObjectId(comparison.package.blob) || !isGitObjectId(comparison.package.tree) || !isSha256Digest(comparison.package.digest)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_REFERENCE_INVALID', 'API compatibility comparison.package has invalid immutable metadata.');
    }
  }

  // <lang><zh-CN>license provenance 与 package 使用相同只读事实边界，但没有 tree/version 字段。</zh-CN><en>License provenance uses the same read-only fact boundary as package metadata but has no tree or version field.</en></lang>
  const licenseFields = ['id', 'path', 'blob', 'digest'];
  // <lang><zh-CN>license 子记录必须先满足 exact-field 外壳，才可读取 ID 与 provenance。</zh-CN><en>The license subrecord must first satisfy its exact-field envelope before ID and provenance are read.</en></lang>
  if (validateExactFields(comparison.license, new Set(licenseFields), licenseFields, 'API compatibility comparison.license', diagnostics)) {
    // <lang><zh-CN>许可证路径/对象/摘要均为声明验证，不会打开许可证正文。</zh-CN><en>License path, object, and digest are declaration checks only and never open the license body.</en></lang>
    if (!isNonemptyString(comparison.license.id) || !isSafeRelativePath(comparison.license.path)
      || !isGitObjectId(comparison.license.blob) || !isSha256Digest(comparison.license.digest)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_REFERENCE_INVALID', 'API compatibility comparison.license has invalid immutable metadata.');
    }
  }

  // <lang><zh-CN>组件树声明正整数 count、tree 与名称摘要；实际 count/nameDigest 在全部 components 校验后现场复核。</zh-CN><en>The component tree declares a positive count, tree, and name digest; actual count and nameDigest are verified live after all components are validated.</en></lang>
  const componentFields = ['path', 'count', 'tree', 'nameDigest'];
  // <lang><zh-CN>组件 provenance 外壳成立后再校验 path/count/tree/digest 的基础类型。</zh-CN><en>Basic path, count, tree, and digest types are checked only after the component-provenance envelope is valid.</en></lang>
  if (validateExactFields(comparison.components, new Set(componentFields), componentFields, 'API compatibility comparison.components', diagnostics)) {
    // <lang><zh-CN>当前数量只要求正整数，具体 snapshot 数量留给仓内契约测试。</zh-CN><en>The current count need only be a positive integer; repository contract tests freeze the concrete snapshot count.</en></lang>
    if (!isSafeRelativePath(comparison.components.path) || !Number.isInteger(comparison.components.count) || comparison.components.count <= 0
      || !isGitObjectId(comparison.components.tree) || !isSha256Digest(comparison.components.nameDigest)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_REFERENCE_INVALID', 'API compatibility comparison.components must declare a positive count, safe path, immutable tree identifier, and SHA-256 name digest.');
    }
  }

  // <lang><zh-CN>package 物化与 package scope 外的 easycom evidence 分别校验；两者都只消费已生成 JSON，不打开声明路径。</zh-CN><en>Validate package materialization and easycom evidence outside package scope separately; both consume generated JSON only and open none of their declared paths.</en></lang>
  validatePackageMaterialization(comparison.materialization, diagnostics);
  validateComparisonEasycom(comparison.easycom, diagnostics);
  // <lang><zh-CN>物化 scope、package.json 与 components provenance 必须指向同一声明树；该关系只比较安全规范路径，不验证 Git tree。</zh-CN><en>The materialization scope, package.json, and component provenance must point into the same declared tree; this relation compares only safe normalized paths and does not validate a Git tree.</en></lang>
  const materializationScope = isSafeRelativePath(comparison.materialization?.scope)
    ? normalizeRelativePath(comparison.materialization.scope)
    : null;
  // <lang><zh-CN>package/components 候选路径各自保留 null 失败态，避免非法路径参与 prefix 比较。</zh-CN><en>Package and component candidate paths retain a null failure state so unsafe paths cannot participate in prefix comparisons.</en></lang>
  const packagePath = isSafeRelativePath(comparison.package?.path) ? normalizeRelativePath(comparison.package.path) : null;
  // <lang><zh-CN>组件候选路径独立规范化，后续只使用其安全视图判断 materialization 与 changedPaths 的内部关系。</zh-CN><en>The component candidate path is normalized independently, and only its safe view is used for materialization and changed-path consistency checks.</en></lang>
  const componentPath = isSafeRelativePath(comparison.components?.path) ? normalizeRelativePath(comparison.components.path) : null;
  // <lang><zh-CN>package provenance 必须是 scope 根的 package.json，components provenance 必须位于同一 scope 内；不硬编码版本、commit 或实际 scope 字符串。</zh-CN><en>Package provenance must be package.json at the scope root and component provenance must remain inside that scope, without hardcoding a version, commit, or concrete scope string.</en></lang>
  if (materializationScope && ((packagePath && packagePath !== `${materializationScope}/package.json`)
    || (componentPath && !componentPath.startsWith(`${materializationScope}/`)))) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_REFERENCE_INVALID', 'API compatibility package and component paths must remain internally consistent with comparison.materialization.scope.');
  }

  // <lang><zh-CN>前序 release tag 与既有 comparison commit 分开保存，禁止把两种引用悄然合并。</zh-CN><en>The previous release tag and established comparison commit remain separate so the two references cannot be silently merged.</en></lang>
  const previousFields = ['version', 'comparisonCommit', 'comparisonTree', 'packageTree', 'componentsTree', 'releaseTag', 'releaseCommit'];
  // <lang><zh-CN>previous 外壳合法后再读取版本/tag 与五个 Git object。</zh-CN><en>Version, tag, and five Git objects are read only after the previous envelope is valid.</en></lang>
  if (validateExactFields(comparison.previous, new Set(previousFields), previousFields, 'API compatibility comparison.previous', diagnostics)) {
    // <lang><zh-CN>五个 Git object 字段使用同一固定格式门禁；version/tag 仍作为独立、可读的 release 身份。</zh-CN><en>Five Git-object fields share one fixed-format gate while version and tag remain separate readable release identities.</en></lang>
    const gitFields = ['comparisonCommit', 'comparisonTree', 'packageTree', 'componentsTree', 'releaseCommit'];
    // <lang><zh-CN>任一版本、tag 或 Git object 失效都会否定 previous provenance。</zh-CN><en>Any invalid version, tag, or Git object invalidates previous provenance.</en></lang>
    if (!isNonemptyString(comparison.previous.version) || !isNonemptyString(comparison.previous.releaseTag)
      || !gitFields.every((field) => isGitObjectId(comparison.previous[field]))) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_REFERENCE_INVALID', 'API compatibility comparison.previous has invalid immutable metadata.');
    }
  }

  // <lang><zh-CN>diff 只保留 from/to、稳定路径清单和组件路径变化布尔值，不携带 patch body。</zh-CN><en>The diff retains only from/to identifiers, a stable path list, and a component-path boolean, never a patch body.</en></lang>
  const compareFields = ['from', 'to', 'changedPathCount', 'changedPaths', 'componentPathsChanged'];
  // <lang><zh-CN>compare 外壳失败时不能可靠枚举 changedPaths，因此本函数在此早退。</zh-CN><en>When the compare envelope fails, changedPaths cannot be enumerated safely, so this function returns here.</en></lang>
  if (!validateExactFields(comparison.compare, new Set(compareFields), compareFields, 'API compatibility comparison.compare', diagnostics)) return;
  // <lang><zh-CN>端点、计数、数组与布尔值必须内部一致，才进入逐路径检查。</zh-CN><en>Endpoints, count, array, and boolean must be internally consistent before per-path checks begin.</en></lang>
  if (!isGitObjectId(comparison.compare.from) || !isGitObjectId(comparison.compare.to)
    || comparison.compare.from !== comparison.previous?.comparisonCommit || comparison.compare.to !== comparison.commit
    || !Number.isInteger(comparison.compare.changedPathCount) || comparison.compare.changedPathCount < 0
    || typeof comparison.compare.componentPathsChanged !== 'boolean' || !Array.isArray(comparison.compare.changedPaths)
    || comparison.compare.changedPathCount !== comparison.compare.changedPaths.length) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_REFERENCE_INVALID', 'API compatibility comparison.compare is inconsistent with its immutable endpoints or path count.');
    return;
  }

  // <lang><zh-CN>路径清单按 path 唯一且排序；status 仅说明 Git 事实，不触发文件读取。</zh-CN><en>The path list is unique and sorted by path; status describes only a Git fact and triggers no file read.</en></lang>
  const changedPaths = [];
  // <lang><zh-CN>逐项保留 Git status/path 事实；路径内容不会被读取，规范化结果只服务唯一性与排序复核。</zh-CN><en>Preserve each Git status/path fact; path contents are never read, and normalized results serve only uniqueness and ordering checks.</en></lang>
  for (const changedPath of comparison.compare.changedPaths) {
    // <lang><zh-CN>每条 diff 记录只允许 status/path 两字段，防止 patch body 或命令混入 provenance。</zh-CN><en>Each diff record allows only status and path so patch bodies or commands cannot enter provenance.</en></lang>
    const changedFields = ['status', 'path'];
    // <lang><zh-CN>坏 diff 外壳跳过该项，保留其他路径的独立诊断。</zh-CN><en>A malformed diff envelope skips only that item and preserves diagnostics for the remaining paths.</en></lang>
    if (!validateExactFields(changedPath, new Set(changedFields), changedFields, 'API compatibility changed path', diagnostics)) continue;
    // <lang><zh-CN>status 与 path 同时受控后才允许进入规范路径序列。</zh-CN><en>Status and path must both be controlled before entering the normalized path sequence.</en></lang>
    if (!supportedChangedPathStatuses.has(changedPath.status) || !isSafeRelativePath(changedPath.path)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_REFERENCE_INVALID', 'API compatibility changed path has an invalid status or path.');
      continue;
    }
    // <lang><zh-CN>仅在字段和值合法后写入规范路径序列，使坏记录不会污染唯一性检查。</zh-CN><en>Append to the normalized path sequence only after field and value validation so an invalid record cannot pollute uniqueness checks.</en></lang>
    changedPaths.push(normalizeRelativePath(changedPath.path));
  }
  // <lang><zh-CN>规范路径序列同时检查唯一性与代码点顺序，避免同一路径重复或 locale 漂移。</zh-CN><en>The normalized path sequence checks uniqueness and code-point order together to prevent duplicates or locale drift.</en></lang>
  if (new Set(changedPaths).size !== changedPaths.length || !isCodePointSorted(changedPaths)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_VALUE_ORDER_INVALID', 'API compatibility changed paths must be unique and code-point sorted.');
  }
  // <lang><zh-CN>只有全部 changedPaths 通过基础形状后才派生组件路径变化，避免一个坏 path 同时制造不相关布尔诊断。</zh-CN><en>Derive component-path change only after every changed path passes its basic shape so one malformed path does not create an unrelated boolean diagnostic.</en></lang>
  if (changedPaths.length === comparison.compare.changedPaths.length && componentPath) {
    // <lang><zh-CN>组件路径变化由规范路径前缀现场计算；componentPathsChanged 不能与 changedPaths 自相矛盾。</zh-CN><en>Component-path change is derived live from normalized path prefixes, so componentPathsChanged cannot contradict changedPaths.</en></lang>
    const observedComponentPathChange = changedPaths.some((changedPath) => changedPath === componentPath || changedPath.startsWith(`${componentPath}/`));
    // <lang><zh-CN>声明布尔值必须与现场派生值相等，不接受手工覆盖。</zh-CN><en>The declared boolean must equal the live derived value and cannot be manually overridden.</en></lang>
    if (comparison.compare.componentPathsChanged !== observedComponentPathChange) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_REFERENCE_INVALID', 'API compatibility compare.componentPathsChanged must match changedPaths under comparison.components.path.');
    }
    // <lang><zh-CN>声明组件路径未变化时，前后 components tree 也必须相等；只校内部关系，不查询对象数据库。</zh-CN><en>When component paths are declared unchanged, current and previous component trees must also match; this checks only internal relations and never queries an object database.</en></lang>
    if (!observedComponentPathChange && comparison.components?.tree !== comparison.previous?.componentsTree) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_REFERENCE_INVALID', 'API compatibility unchanged component paths must retain the previous component tree identifier.');
    }
  }
}

/**
 * @lang zh-CN 校验本地 easycom 的 repository-fixture 与 package 交付分层；repository fixture 可用不等于 npm package 已交付稳定自动注册契约。
 * @lang en Validates the local easycom split between repository-fixture and package delivery; a usable repository fixture does not mean the npm package delivers a stable auto-registration contract.
 * @param {unknown} easycom <lang><zh-CN>local.easycom 候选 record。</zh-CN><en>Candidate local.easycom record.</en></lang>
 * @param {string} profile <lang><zh-CN>矩阵 active profile。</zh-CN><en>Active matrix profile.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function validateLocalEasycom(easycom, profile, diagnostics) {
  // <lang><zh-CN>本地 evidence 只允许两个交付状态、profile 与一对 path/digest，不承载 pattern 或执行规则。</zh-CN><en>Local evidence allows only two delivery states, a profile, and one path/digest pair; it carries no pattern or execution rule.</en></lang>
  const fields = ['repositoryFixtureStatus', 'packageStatus', 'profile', 'path', 'digest'];
  // <lang><zh-CN>local easycom 外壳无效时停止该维度，避免读取任意交付字段。</zh-CN><en>Stop the local easycom dimension when its envelope is invalid so arbitrary delivery fields are not read.</en></lang>
  if (!validateExactFields(easycom, new Set(fields), fields, 'API compatibility local.easycom', diagnostics)) return;

  // <lang><zh-CN>状态组合精确表达“仓内 fixture 已提供、package 尚未交付”，并要求 profile 与当前矩阵一致。</zh-CN><en>The exact status pair means “repository fixture delivered, package not delivered,” and the profile must match the current matrix.</en></lang>
  const hasExpectedBoundary = easycom.repositoryFixtureStatus === 'delivered'
    && easycom.packageStatus === 'not-delivered'
    && easycom.profile === profile;
  // <lang><zh-CN>路径和摘要只验证声明安全性；Tool 不打开 pages.json 或重新执行 easycom 配置。</zh-CN><en>Path and digest checks validate declaration safety only; the Tool neither opens pages.json nor re-executes easycom configuration.</en></lang>
  const hasSafeEvidenceIdentity = isSafeRelativePath(easycom.path) && isSha256Digest(easycom.digest);
  // <lang><zh-CN>交付边界和证据身份必须同时有效，避免局部合法记录产生误导结论。</zh-CN><en>Delivery boundary and evidence identity must both be valid so a partially valid record cannot produce a misleading conclusion.</en></lang>
  if (!hasExpectedBoundary || !hasSafeEvidenceIdentity) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_LOCAL_INVALID', 'API compatibility local.easycom must declare a delivered repository fixture and a not-delivered package contract for the active profile.');
  }
}

/**
 * @lang zh-CN 校验本地 UI package、component manifest 与 runtime/style 输入摘要，并返回声明的 component-manifest 路径。
 * @lang en Validates local UI package, component-manifest, runtime, and style input digests and returns the declared component-manifest path.
 * @param {unknown} local <lang><zh-CN>local record。</zh-CN><en>Local record.</en></lang>
 * @param {string} profile <lang><zh-CN>矩阵 active profile。</zh-CN><en>Active matrix profile.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {string | null} <lang><zh-CN>安全规范 component manifest 路径；无效时为 null。</zh-CN><en>Safe normalized component-manifest path, or null when invalid.</en></lang>
 */
function validateLocal(local, profile, diagnostics) {
  // <lang><zh-CN>本地输入仅允许五个声明面，避免矩阵成为源码扫描或业务配置入口。</zh-CN><en>Local input allows only five declaration surfaces so the matrix cannot become a source-scanning or business-configuration entry.</en></lang>
  const fields = ['package', 'componentManifest', 'runtimeEntry', 'styleEntry', 'easycom'];
  // <lang><zh-CN>local 外壳不是 record 时无法安全返回关联路径，因此立即返回 null。</zh-CN><en>A non-record local envelope cannot yield a safe linkage path and therefore returns null immediately.</en></lang>
  if (!validateExactFields(local, new Set(fields), fields, 'API compatibility local metadata', diagnostics)) return null;

  // <lang><zh-CN>package record 保存公开身份与输入摘要，但 Tool 不打开该 path。</zh-CN><en>The package record retains public identity and input digest, but the Tool does not open its path.</en></lang>
  const packageFields = ['name', 'version', 'path', 'digest'];
  // <lang><zh-CN>package 外壳成立后再读取身份、版本、路径和摘要。</zh-CN><en>Identity, version, path, and digest are read only after the package envelope is valid.</en></lang>
  if (validateExactFields(local.package, new Set(packageFields), packageFields, 'API compatibility local.package', diagnostics)) {
    // <lang><zh-CN>四个 package 字段必须同时合法；路径和摘要仍不会触发文件读取。</zh-CN><en>All four package fields must be valid together, while path and digest still trigger no file read.</en></lang>
    if (!isNonemptyString(local.package.name) || !isNonemptyString(local.package.version)
      || !isSafeRelativePath(local.package.path) || !isSha256Digest(local.package.digest)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_LOCAL_INVALID', 'API compatibility local.package has invalid metadata.');
    }
  }

  // <lang><zh-CN>component manifest 计数必须明确区分本地受控组件与当前比较子集，且比较子集不能大于本地集合。</zh-CN><en>Component-manifest counts must distinguish locally controlled components from the current comparison subset, and the subset cannot exceed the local set.</en></lang>
  const manifestFields = ['path', 'version', 'controlledCount', 'comparisonCount', 'digest'];
  // <lang><zh-CN>规范化后的 component manifest 路径是此函数唯一返回值；null 表示关联边界尚未建立。</zh-CN><en>The normalized component-manifest path is this function's sole return value; null means the linkage boundary has not been established.</en></lang>
  let manifestPath = null;
  // <lang><zh-CN>component-manifest 外壳合法后才建立关联键和计数关系。</zh-CN><en>The linkage key and count relations are established only after the component-manifest envelope is valid.</en></lang>
  if (validateExactFields(local.componentManifest, new Set(manifestFields), manifestFields, 'API compatibility local.componentManifest', diagnostics)) {
    // <lang><zh-CN>仅安全相对路径进入后续 Map 关联；非法路径保持 null，绝不尝试猜测替代位置。</zh-CN><en>Only a safe relative path enters later Map linkage; an unsafe path remains null and no alternative location is guessed.</en></lang>
    manifestPath = isSafeRelativePath(local.componentManifest.path) ? normalizeRelativePath(local.componentManifest.path) : null;
    // <lang><zh-CN>版本、正整数计数、子集关系与摘要必须同时成立，才是可信本地关联声明。</zh-CN><en>Version, positive counts, subset relation, and digest must all hold for a trustworthy local linkage declaration.</en></lang>
    if (!manifestPath || local.componentManifest.version !== 1 || !Number.isInteger(local.componentManifest.controlledCount)
      || local.componentManifest.controlledCount <= 0 || !Number.isInteger(local.componentManifest.comparisonCount)
      || local.componentManifest.comparisonCount <= 0 || local.componentManifest.controlledCount < local.componentManifest.comparisonCount
      || !isSha256Digest(local.componentManifest.digest)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_LOCAL_INVALID', 'API compatibility local.componentManifest has invalid version, count, path, or digest.');
    }
  }

  // <lang><zh-CN>runtime/style 摘要与 easycom 分层是彼此独立的本地交付事实；全部校验仅消费 JSON 声明。</zh-CN><en>Runtime/style digests and the easycom delivery split are independent local facts; every check consumes JSON declarations only.</en></lang>
  validatePathDigestRecord(local.runtimeEntry, 'API compatibility local.runtimeEntry', diagnostics);
  validatePathDigestRecord(local.styleEntry, 'API compatibility local.styleEntry', diagnostics);
  validateLocalEasycom(local.easycom, profile, diagnostics);

  // <lang><zh-CN>返回经过安全门禁的关联键；其他字段错误已经累积但不改变此路径事实。</zh-CN><en>Return the linkage key that passed the safety gate; errors in other fields remain accumulated without changing this path fact.</en></lang>
  return manifestPath;
}

/**
 * @lang zh-CN 校验顶层公开 issue registry，并返回按 ID 索引的只读查找表。
 * @lang en Validates the top-level public issue registry and returns a read-only lookup map by ID.
 * @param {unknown} issues <lang><zh-CN>issue 数组。</zh-CN><en>Issue array.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {Map<string, object>} <lang><zh-CN>已解析 issue 索引；坏记录不会进入。</zh-CN><en>Parsed issue index; invalid records are excluded.</en></lang>
 */
function validateIssues(issues, diagnostics) {
  // <lang><zh-CN>issue registry 可以为空，但必须显式为数组，不能用缺字段表示“无争议”。</zh-CN><en>The issue registry may be empty but must be an explicit array rather than omitting the field to imply no disputes.</en></lang>
  if (!Array.isArray(issues)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_ISSUES_INVALID', 'API compatibility issues must be an array.');
    return new Map();
  }

  // <lang><zh-CN>Map 同时服务重复检测与后续 component/default issue 引用校验。</zh-CN><en>The map serves both duplicate detection and later component/default issue-reference validation.</en></lang>
  const issuesById = new Map();
  // <lang><zh-CN>声明顺序单独保存以验证确定性代码点排序。</zh-CN><en>Declaration order is retained separately to validate deterministic code-point ordering.</en></lang>
  const issueIds = [];

  // <lang><zh-CN>逐条建立 registry；形状无效的记录不进入索引，其他独立记录仍继续校验。</zh-CN><en>Build the registry item by item; shape-invalid records never enter the index while other independent records continue validation.</en></lang>
  for (const issue of issues) {
    // <lang><zh-CN>id/severity/scope/message 构成所有 issue 的公共最小契约，owner 与 evidence 按需出现。</zh-CN><en>ID, severity, scope, and message form the public minimum contract for every issue; owner and evidence are optional.</en></lang>
    const required = ['id', 'severity', 'scope', 'message'];
    // <lang><zh-CN>坏 issue 外壳只跳过当前记录，避免其任意字段进入索引。</zh-CN><en>A malformed issue envelope skips only the current record so arbitrary fields never enter the index.</en></lang>
    if (!validateExactFields(issue, allowedIssueFields, required, 'API compatibility issue', diagnostics)) continue;
    // <lang><zh-CN>稳定大写 ID、固定 review severity 与非空 scope 共同保证 issue 可被公开引用且不夹带过程状态。</zh-CN><en>A stable uppercase ID, fixed review severity, and nonempty scope keep issues publicly referenceable without embedding process state.</en></lang>
    if (!isNonemptyString(issue.id) || !/^[A-Z0-9][A-Z0-9_-]*$/u.test(issue.id)
      || issue.severity !== 'review-required' || !isNonemptyString(issue.scope)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_ISSUE_INVALID', 'API compatibility issue has an invalid id, severity, or scope.');
      continue;
    }
    // <lang><zh-CN>重复 ID 会让组件反向引用产生歧义，因此即使内容相同也必须失败。</zh-CN><en>A duplicate ID makes component reverse references ambiguous and therefore fails even when records are otherwise identical.</en></lang>
    if (issuesById.has(issue.id)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_ISSUE_DUPLICATE', `API compatibility issue is declared more than once: ${issue.id}.`);
    }

    // <lang><zh-CN>双语公开 message 必须恰含 zh-CN/en，且两侧均非空。</zh-CN><en>The bilingual public message must contain exactly zh-CN and en, both nonempty.</en></lang>
    const messageFields = ['zh-CN', 'en'];
    // <lang><zh-CN>message 外壳与两种语言内容同时校验，避免空翻译通过字段存在性门禁。</zh-CN><en>Message envelope and both language values are checked together so an empty translation cannot pass a field-presence gate.</en></lang>
    if (!validateExactFields(issue.message, new Set(messageFields), messageFields, `API compatibility issue ${issue.id}.message`, diagnostics)
      || !isNonemptyString(issue.message?.['zh-CN']) || !isNonemptyString(issue.message?.en)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_ISSUE_INVALID', `API compatibility issue ${issue.id} must provide bilingual non-empty messages.`);
    }
    // <lang><zh-CN>单组件 owner 若存在必须是非空名称；成员资格在当前组件索引建立后统一反查。</zh-CN><en>A singular component owner, when present, must be a nonempty name; membership is checked later after the current component index exists.</en></lang>
    if (Object.hasOwn(issue, 'component') && !isNonemptyString(issue.component)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_ISSUE_INVALID', `API compatibility issue ${issue.id}.component must be non-empty.`);
    }
    // <lang><zh-CN>共享组件问题用显式 components 集合表达；单组件与共享组件所有权互斥，避免反向引用语义含混。</zh-CN><en>Shared component issues use an explicit components set; singular and shared ownership are mutually exclusive so reverse-reference semantics remain unambiguous.</en></lang>
    if (Object.hasOwn(issue, 'component') && Object.hasOwn(issue, 'components')) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_ISSUE_INVALID', `API compatibility issue ${issue.id} cannot declare both component and components.`);
    }
    // <lang><zh-CN>共享 owner 数组存在时必须应用非空、唯一和代码点顺序门禁。</zh-CN><en>When a shared-owner array exists, it must pass nonempty, uniqueness, and code-point-order gates.</en></lang>
    if (Object.hasOwn(issue, 'components')) {
      validateStringArray(issue.components, `API compatibility issue ${issue.id}.components`, diagnostics);
    }
    // <lang><zh-CN>可选 evidence 只能是受限 JSON；原始源码、函数或危险 object 键不能进入公共矩阵。</zh-CN><en>Optional evidence must remain bounded JSON; raw source, functions, and dangerous object keys cannot enter the public matrix.</en></lang>
    if (Object.hasOwn(issue, 'evidence') && !validatePublicEvidence(issue.evidence, `API compatibility issue ${issue.id}.evidence`, diagnostics)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_ISSUE_INVALID', `API compatibility issue ${issue.id}.evidence must contain bounded JSON data.`);
    }

    // <lang><zh-CN>合法身份记录写入按 ID 索引，供 default、types 和组件 owner 引用复核。</zh-CN><en>Store the identity-valid record by ID for later default, types, and component-owner reference checks.</en></lang>
    issuesById.set(issue.id, issue);
    // <lang><zh-CN>另存声明顺序，不依赖 Map 消费方推断排序。</zh-CN><en>Retain declaration order separately instead of asking Map consumers to infer ordering.</en></lang>
    issueIds.push(issue.id);
  }

  // <lang><zh-CN>registry 的代码点顺序保证跨 locale 生成稳定；unsupported/review-required 的存在不影响此结构门禁。</zh-CN><en>Code-point ordering keeps the registry stable across locales; the presence of unsupported or review-required facts does not affect this structural gate.</en></lang>
  if (!isCodePointSorted(issueIds)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_VALUE_ORDER_INVALID', 'API compatibility issues must use code-point id order.');
  }

  // <lang><zh-CN>返回的索引只用于本次纯内存关联，不读取 issue 中的 evidence 路径或文本。</zh-CN><en>The returned index serves only this in-memory linkage pass and never opens paths or text found in issue evidence.</en></lang>
  return issuesById;
}

/**
 * @lang zh-CN 判断 issue 是否以单 owner 或共享 owners 明确拥有当前组件；无 owner 的 package/global issue 不属于任何组件 surface。
 * @lang en Determines whether an issue explicitly owns the current component through a singular or shared owner; ownerless package/global issues belong to no component surface.
 * @param {unknown} issue <lang><zh-CN>顶层 issue record。</zh-CN><en>Top-level issue record.</en></lang>
 * @param {string} componentName <lang><zh-CN>当前组件名。</zh-CN><en>Current component name.</en></lang>
 * @returns {boolean} <lang><zh-CN>issue 明确拥有当前组件时为真。</zh-CN><en>True when the issue explicitly owns the current component.</en></lang>
 */
function issueOwnsComponent(issue, componentName) {
  // <lang><zh-CN>单 owner 精确相等，或共享 owner 数组显式包含当前组件；不从 issue ID/scope 猜测所有权。</zh-CN><en>Ownership requires exact singular equality or explicit membership in shared owners and is never inferred from an issue ID or scope.</en></lang>
  return isRecord(issue)
    && (issue.component === componentName || (Array.isArray(issue.components) && issue.components.includes(componentName)));
}

/**
 * @lang zh-CN 判断已知 issue 是否直接属于指定组件/surface；`static-parser` 只作为后续单 container 唯一性门禁下的 parser-owned 例外。
 * @lang en Determines whether a known issue directly belongs to the specified component and surface; `static-parser` is a parser-owned exception only under a later one-container uniqueness gate.
 * @param {unknown} issue <lang><zh-CN>已知顶层 issue。</zh-CN><en>Known top-level issue.</en></lang>
 * @param {string} componentName <lang><zh-CN>当前组件名。</zh-CN><en>Current component name.</en></lang>
 * @param {Set<string>} allowedScopes <lang><zh-CN>当前 surface 专属 scope 集合。</zh-CN><en>Scopes specific to the current surface.</en></lang>
 * @param {boolean} allowParserOwnedScope <lang><zh-CN>是否允许受控 static-parser 例外。</zh-CN><en>Whether the controlled static-parser exception is allowed.</en></lang>
 * @returns {boolean} <lang><zh-CN>owner 与 scope 均直接匹配时为真。</zh-CN><en>True when both owner and scope match directly.</en></lang>
 */
function issueMatchesDirectSurface(issue, componentName, allowedScopes, allowParserOwnedScope) {
  // <lang><zh-CN>owner 是首要门禁；global/package issue 即使 scope 文本相似也不能为组件 unresolved 兜底。</zh-CN><en>Ownership is the primary gate; a global or package issue cannot justify component unresolved even when its scope text looks similar.</en></lang>
  if (!issueOwnsComponent(issue, componentName)) return false;
  // <lang><zh-CN>优先接受明确 surface scope；static-parser 仅在调用方授权时作为 parser 自有直接原因。</zh-CN><en>Prefer an explicit surface scope; static-parser is accepted only when the caller authorizes it as a parser-owned direct cause.</en></lang>
  return allowedScopes.has(issue.scope) || (allowParserOwnedScope && issue.scope === parserOwnedIssueScope);
}

/**
 * @lang zh-CN 校验 container/types 的排序直接 issue 引用，并要求每项同时存在于 component.issueIds、拥有当前组件且匹配当前 surface scope。
 * @lang en Validates sorted direct issue references for a container or types surface, requiring each entry to exist in component.issueIds, own the current component, and match the current surface scope.
 * @param {unknown} issueIds <lang><zh-CN>当前 surface 的直接 issueIds。</zh-CN><en>Direct issue IDs of the current surface.</en></lang>
 * @param {string} context <lang><zh-CN>公开诊断上下文。</zh-CN><en>Public diagnostic context.</en></lang>
 * @param {string} componentName <lang><zh-CN>当前组件名。</zh-CN><en>Current component name.</en></lang>
 * @param {Set<string>} allowedScopes <lang><zh-CN>当前 surface 允许的专属 scope。</zh-CN><en>Surface-specific scopes allowed here.</en></lang>
 * @param {boolean} allowParserOwnedScope <lang><zh-CN>是否允许受控 static-parser 直接原因。</zh-CN><en>Whether a controlled direct static-parser cause is allowed.</en></lang>
 * @param {Map<string, object>} issuesById <lang><zh-CN>顶层 issue registry。</zh-CN><en>Top-level issue registry.</en></lang>
 * @param {Set<string>} componentIssueIds <lang><zh-CN>组件汇总 issueIds。</zh-CN><en>Component-summary issue IDs.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {Set<string>} <lang><zh-CN>通过数组形状规范化的直接 issue ID 集；坏数组返回空集。</zh-CN><en>Normalized direct issue-ID set after array-shape validation, or an empty set for a malformed array.</en></lang>
 */
function validateDirectIssueIds(
  issueIds,
  context,
  componentName,
  allowedScopes,
  allowParserOwnedScope,
  issuesById,
  componentIssueIds,
  diagnostics
) {
  // <lang><zh-CN>空数组是 complete surface 的合法直接原因集合；通用 helper 同时锁定唯一性与代码点顺序。</zh-CN><en>An empty array is the legal direct-cause set for a complete surface; the shared helper also locks uniqueness and code-point order.</en></lang>
  const normalizedIssueIds = validateStringArray(issueIds, `${context}.issueIds`, diagnostics, true) ?? [];
  // <lang><zh-CN>Set 供状态门禁与 default 绑定复用，同时不改变 manifest 中的声明顺序。</zh-CN><en>The Set supports state gates and default binding without changing declaration order in the manifest.</en></lang>
  const directIssueIds = new Set(normalizedIssueIds);

  // <lang><zh-CN>逐项要求 registry、component 汇总、owner 和 surface scope 四层同时成立。</zh-CN><en>Require registry presence, component-summary presence, ownership, and surface scope for every entry.</en></lang>
  for (const issueId of directIssueIds) {
    // <lang><zh-CN>当前 issue record 只从已验证顶层索引取得；缺失保持 undefined 并进入单一引用诊断。</zh-CN><en>The current issue record comes only from the validated top-level index; absence remains undefined and produces one reference diagnostic.</en></lang>
    const issue = issuesById.get(issueId);
    // <lang><zh-CN>registry、组件汇总、owner 和 surface scope 四层任一不匹配都会拒绝直接引用。</zh-CN><en>A mismatch in registry, component summary, ownership, or surface scope rejects the direct reference.</en></lang>
    if (!issue || !componentIssueIds.has(issueId)
      || !issueMatchesDirectSurface(issue, componentName, allowedScopes, allowParserOwnedScope)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_ISSUE_REFERENCE_INVALID', `${context}.issueIds must reference a direct issue owned by ${componentName} and scoped to this surface: ${issueId}.`);
    }
  }

  // <lang><zh-CN>返回直接集合供 complete/unresolved 与同 surface default 复核；不返回 issue 正文。</zh-CN><en>Return the direct set for complete/unresolved and same-surface default checks without returning issue prose.</en></lang>
  return directIssueIds;
}

/**
 * @lang zh-CN 校验 default fact 的精确 one-of，并复核 unresolved issue 引用。
 * @lang en Validates the exact one-of for a default fact and checks unresolved issue references.
 * @param {unknown} fact <lang><zh-CN>default fact。</zh-CN><en>Default fact.</en></lang>
 * @param {string} context <lang><zh-CN>公开诊断上下文。</zh-CN><en>Public diagnostic context.</en></lang>
 * @param {string} componentName <lang><zh-CN>当前组件名。</zh-CN><en>Current component name.</en></lang>
 * @param {Map<string, object>} issuesById <lang><zh-CN>顶层 issue registry。</zh-CN><en>Top-level issue registry.</en></lang>
 * @param {Set<string>} componentIssueIds <lang><zh-CN>当前组件 issue 引用。</zh-CN><en>Current component issue references.</en></lang>
 * @param {Set<string>} surfaceIssueIds <lang><zh-CN>当前 props container 的直接 issue 引用。</zh-CN><en>Direct issue references of the current props container.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function validateDefaultFact(fact, context, componentName, issuesById, componentIssueIds, surfaceIssueIds, diagnostics) {
  // <lang><zh-CN>kind 是选择 one-of 的唯一 discriminator；缺失/未知不能回退为 absent。</zh-CN><en>Kind is the sole one-of discriminator; missing or unknown values cannot fall back to absent.</en></lang>
  if (!isRecord(fact) || !supportedDefaultKinds.has(fact.kind)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_DEFAULT_INVALID', `${context} must declare a supported default kind.`);
    return;
  }

  // <lang><zh-CN>每个分支拥有精确字段集合，防止 expression text 或多重分支同时出现。</zh-CN><en>Every branch owns an exact field set so expression text or multiple branches cannot coexist.</en></lang>
  const branchFields = fact.kind === 'literal'
    ? ['kind', 'value']
    : fact.kind === 'expression'
      ? ['kind', 'digest']
      : fact.kind === 'unresolved'
        ? ['kind', 'issueId']
        : ['kind'];
  // <lang><zh-CN>`factory-array`/`factory-object` 只声明 factory 的返回类别，内容有意省略；无 payload 绝不表示返回空数组或空对象。</zh-CN><en>`factory-array` and `factory-object` declare only a factory's return category and intentionally omit contents; absence of payload never means the factory returns an empty array or object.</en></lang>
  // <lang><zh-CN>精确字段门禁在读取分支 payload 前运行，拒绝 expression text、literal 额外对象或多分支混载。</zh-CN><en>The exact-field gate runs before reading branch payloads, rejecting expression text, extra literal objects, or mixed branch data.</en></lang>
  validateExactFields(fact, new Set(branchFields), branchFields, context, diagnostics);

  // <lang><zh-CN>literal 分支独立限制 JSON primitive；其他分支不读取 value。</zh-CN><en>The literal branch independently bounds JSON primitives; other branches never read value.</en></lang>
  if (fact.kind === 'literal') {
    // <lang><zh-CN>literal 仅接受 JSON primitive；null 在此分支合法，数组/object 必须使用 factory 分类。</zh-CN><en>Literal accepts JSON primitives only; null is legal here while arrays and objects require a factory classification.</en></lang>
    const literal = fact.value;
    // <lang><zh-CN>非法 literal 值只产生 default 诊断，不尝试转换为字符串或 factory。</zh-CN><en>An invalid literal produces only a default diagnostic and is never coerced into a string or factory.</en></lang>
    if (!(literal === null || typeof literal === 'string' || typeof literal === 'boolean' || (typeof literal === 'number' && Number.isFinite(literal)))) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_DEFAULT_INVALID', `${context}.value must be a JSON primitive or null.`);
    }
  }
  // <lang><zh-CN>expression 只允许不可执行摘要；缺失或格式错误不能退化为未知文本。</zh-CN><en>An expression may carry only a non-executable digest; a missing or malformed digest cannot degrade into unknown text.</en></lang>
  if (fact.kind === 'expression' && !isSha256Digest(fact.digest)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_DEFAULT_INVALID', `${context}.digest must be a SHA-256 digest.`);
  }
  // <lang><zh-CN>仅 unresolved 分支需要 issue 交叉引用；已解析分支不借用 issue。</zh-CN><en>Only the unresolved branch requires issue cross-references; resolved branches borrow no issue.</en></lang>
  if (fact.kind === 'unresolved') {
    // <lang><zh-CN>unresolved 是可接受事实，但原因必须被当前 props container 直接列出，不能借用组件汇总中的 package 或其他 surface issue。</zh-CN><en>Unresolved is an acceptable fact, but its cause must be listed directly by the current props container and cannot borrow a package or another-surface issue from the component summary.</en></lang>
    const issue = isNonemptyString(fact.issueId) ? issuesById.get(fact.issueId) : null;
    // <lang><zh-CN>`static-parser` 仅作为 parser 拥有、当前 surface 直接绑定的受控例外；组件 owner 与 container 直接引用仍不可省略。</zh-CN><en>`static-parser` is allowed only as a controlled parser-owned exception directly bound by this surface; component ownership and the container's direct reference remain mandatory.</en></lang>
    const hasDirectDefaultCause = issue
      && componentIssueIds.has(fact.issueId)
      && surfaceIssueIds.has(fact.issueId)
      && issueMatchesDirectSurface(issue, componentName, defaultIssueScopes, true);
    // <lang><zh-CN>缺少任一直接绑定条件都会拒绝 unresolved default。</zh-CN><en>Missing any direct-binding condition rejects the unresolved default.</en></lang>
    if (!hasDirectDefaultCause) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_ISSUE_REFERENCE_INVALID', `${context}.issueId must reference a direct props/default issue owned by ${componentName}.`);
    }
  }
}

/**
 * @lang zh-CN 校验 prop typeKinds 为非空、唯一、排序的受控标识数组。
 * @lang en Validates prop typeKinds as a nonempty, unique, sorted array of controlled identifiers.
 * @param {unknown} typeKinds <lang><zh-CN>类型标识数组。</zh-CN><en>Type-identifier array.</en></lang>
 * @param {string} context <lang><zh-CN>公开诊断上下文。</zh-CN><en>Public diagnostic context.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {string[] | null} <lang><zh-CN>合法的排序类型集合；数组形状无效时为 null。</zh-CN><en>Validated sorted type set, or null when the array shape is invalid.</en></lang>
 */
function validateTypeKinds(typeKinds, context, diagnostics) {
  // <lang><zh-CN>先应用通用字符串数组规则，再限制到不会被 Tool 执行的稳定构造器名称。</zh-CN><en>Apply generic string-array rules first, then restrict values to stable constructor names that the Tool never executes.</en></lang>
  const values = validateStringArray(typeKinds, context, diagnostics);
  // <lang><zh-CN>只有数组形状已成立时才检查枚举，避免同一坏输入产生误导的派生类型错误。</zh-CN><en>Check the enum only after array shape succeeds so one malformed input does not produce a misleading derived type error.</en></lang>
  if (values && values.some((value) => !supportedTypeKinds.has(value))) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_TYPE_INVALID', `${context} contains an unsupported type kind.`);
  }
  // <lang><zh-CN>返回已规范化数组供 typeOrder 做集合等价校验；枚举错误已经单独诊断，不改写原数组。</zh-CN><en>Return the normalized array for typeOrder set-equivalence checks; enum errors are diagnosed separately without rewriting the source array.</en></lang>
  return values;
}

/**
 * @lang zh-CN 校验 prop typeOrder 为唯一、保留源码声明顺序且与排序 typeKinds 拥有完全相同成员的数组。
 * @lang en Validates prop typeOrder as a unique source-order-preserving array with exactly the same members as sorted typeKinds.
 * @param {unknown} typeOrder <lang><zh-CN>源码顺序类型数组。</zh-CN><en>Source-order type array.</en></lang>
 * @param {string[] | null} typeKinds <lang><zh-CN>已校验的排序类型集合。</zh-CN><en>Validated sorted type set.</en></lang>
 * @param {string} context <lang><zh-CN>公开诊断上下文。</zh-CN><en>Public diagnostic context.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function validateTypeOrder(typeOrder, typeKinds, context, diagnostics) {
  // <lang><zh-CN>typeOrder 有意不使用通用排序 helper，因为它记录构造器在源码中的 casting 顺序。</zh-CN><en>TypeOrder intentionally avoids the shared sorting helper because it records constructor casting order from source.</en></lang>
  if (!Array.isArray(typeOrder) || typeOrder.length === 0
    || typeOrder.some((value) => !isNonemptyString(value) || value !== value.trim())) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_TYPE_INVALID', `${context} must be a nonempty array of trimmed type kinds.`);
    return;
  }
  // <lang><zh-CN>顺序数组内重复构造器会使 casting 优先级含混，因此必须保持一对一成员身份。</zh-CN><en>A repeated constructor would make casting precedence ambiguous, so the order array must retain one-to-one membership.</en></lang>
  const uniqueOrder = new Set(typeOrder);
  // <lang><zh-CN>重复或未知构造器都会破坏 typeOrder 的受控 casting 语义。</zh-CN><en>A duplicate or unknown constructor breaks the controlled casting semantics of typeOrder.</en></lang>
  if (uniqueOrder.size !== typeOrder.length || typeOrder.some((value) => !supportedTypeKinds.has(value))) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_TYPE_INVALID', `${context} must contain unique supported type kinds.`);
  }
  // <lang><zh-CN>只有 typeKinds 外壳有效时才做集合等价；两边可有不同顺序，但不得增删成员。</zh-CN><en>Check set equivalence only when the typeKinds envelope is valid; order may differ, but members may not be added or removed.</en></lang>
  if (typeKinds && (uniqueOrder.size !== typeKinds.length || typeKinds.some((value) => !uniqueOrder.has(value)))) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_TYPE_INVALID', `${context} must contain exactly the members declared by typeKinds.`);
  }
}

/**
 * @lang zh-CN 校验 prop validator 的精确只读 one-of；expression 只携带摘要，不携带或执行函数正文。
 * @lang en Validates the exact read-only one-of for a prop validator; expression carries only a digest and no executable function body.
 * @param {unknown} validator <lang><zh-CN>validator fact。</zh-CN><en>Validator fact.</en></lang>
 * @param {string} context <lang><zh-CN>公开诊断上下文。</zh-CN><en>Public diagnostic context.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function validateValidatorFact(validator, context, diagnostics) {
  // <lang><zh-CN>kind 是唯一 discriminator；未知值不得退化成 absent。</zh-CN><en>Kind is the sole discriminator, and an unknown value cannot degrade into absent.</en></lang>
  if (!isRecord(validator) || !supportedValidatorKinds.has(validator.kind)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_VALIDATOR_INVALID', `${context} must declare a supported validator kind.`);
    return;
  }
  // <lang><zh-CN>absent 只允许 kind；expression 额外且仅允许 SHA-256 digest。</zh-CN><en>Absent allows only kind, while expression additionally and exclusively allows a SHA-256 digest.</en></lang>
  const fields = validator.kind === 'expression' ? ['kind', 'digest'] : ['kind'];
  validateExactFields(validator, new Set(fields), fields, context, diagnostics);
  // <lang><zh-CN>expression 必须携带合法摘要；absent 分支不读取 digest。</zh-CN><en>Expression must carry a valid digest, while the absent branch never reads digest.</en></lang>
  if (validator.kind === 'expression' && !isSha256Digest(validator.digest)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_VALIDATOR_INVALID', `${context}.digest must be a SHA-256 digest.`);
  }
}

/**
 * @lang zh-CN 校验一条 API migration，要求 compatible/mapped 拥有真实 HIA target，unsupported 只需明确 reason。
 * @lang en Validates one API migration, requiring compatible and mapped dispositions to own a real HIA target while unsupported requires an explicit reason.
 * @param {unknown} migration <lang><zh-CN>迁移 record。</zh-CN><en>Migration record.</en></lang>
 * @param {string[]} targetNames <lang><zh-CN>本 item 已声明 HIA target 名称。</zh-CN><en>HIA target names declared by this item.</en></lang>
 * @param {string} context <lang><zh-CN>公开诊断上下文。</zh-CN><en>Public diagnostic context.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function validateApiMigration(migration, targetNames, context, diagnostics) {
  // <lang><zh-CN>target 只允许在 compatible/mapped 分支；unsupported 不能用残留 target 暗示可迁移。</zh-CN><en>Target is allowed only for compatible and mapped branches; unsupported cannot imply migratability through a leftover target.</en></lang>
  const disposition = isRecord(migration) ? migration.disposition : null;
  // <lang><zh-CN>字段集合由 disposition 选择；未知 disposition 采用无 target 形状并在后续枚举门禁明确失败。</zh-CN><en>The disposition selects the field set; an unknown disposition uses the no-target shape and then fails explicitly at the enum gate.</en></lang>
  const requiredFields = disposition === 'compatible' || disposition === 'mapped'
    ? ['disposition', 'reasonCode', 'target']
    : ['disposition', 'reasonCode'];
  // <lang><zh-CN>非 record 或字段扩展在读取 disposition/reason 前终止此条迁移校验。</zh-CN><en>A non-record or invalid field set stops validation of this migration before disposition and reason are read.</en></lang>
  if (!validateExactFields(migration, new Set(requiredFields), requiredFields, context, diagnostics)) return;
  // <lang><zh-CN>所有迁移结论都必须来自受控枚举并说明稳定 reason；unsupported 不因是预期事实而免除此要求。</zh-CN><en>Every migration conclusion must use the controlled enum and a stable reason; being an expected unsupported fact does not waive that requirement.</en></lang>
  if (!supportedDispositions.has(migration.disposition) || !isNonemptyString(migration.reasonCode)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_MIGRATION_INVALID', `${context} has an invalid disposition or reasonCode.`);
    return;
  }
  // <lang><zh-CN>只有声明为可兼容或已映射时才核对 target；unsupported 明确保持无目标。</zh-CN><en>Validate a target only for compatible or mapped facts; unsupported explicitly remains targetless.</en></lang>
  if (migration.disposition === 'compatible' || migration.disposition === 'mapped') {
    // <lang><zh-CN>target 必须精确命中当前 item 的已声明 HIA 名称，不能引用其他 item。</zh-CN><en>Target must exactly match a declared HIA name of the current item and cannot reference another item.</en></lang>
    if (!isNonemptyString(migration.target) || !targetNames.includes(migration.target)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_MIGRATION_TARGET_INVALID', `${context}.target must name a declared HIA target.`);
    }
  }
}

/**
 * @lang zh-CN kind-specific semantic side 的固定字段集合；互斥 envelope 防止 payload、slot binding 或 service controller 事实跨种类混用。
 * @lang en Fixed fields for each kind-specific semantic side; mutually exclusive envelopes prevent payload, slot-binding, or service-controller facts from crossing kinds.
 */
const semanticSideFields = Object.freeze({
  prop: ['status', 'kind', 'valueDomain', 'ownership', 'control', 'coercion', 'validation', 'sideEffects', 'parentChild'],
  event: ['status', 'kind', 'trigger', 'parameters', 'delivery', 'cancellable', 'modelRelation', 'sideEffects'],
  slot: ['status', 'kind', 'bindings', 'fallback', 'cardinality', 'contextOwner'],
  imperativeApi: ['status', 'kind', 'entry', 'parameters', 'returns', 'effects', 'lifecycle', 'scope', 'concurrency', 'failure'],
  service: ['status', 'kind', 'entry', 'parameters', 'returns', 'scope', 'host', 'lifecycle', 'effects', 'concurrency', 'failure']
});

/**
 * @lang zh-CN 校验一个非空、无外围空格且非占位词的语义字符串。
 * @lang en Validates one nonempty, trim-stable semantic string that is not a placeholder token.
 * @param {unknown} value <lang><zh-CN>待校验值。</zh-CN><en>Value to validate.</en></lang>
 * @param {string} context <lang><zh-CN>公开诊断上下文。</zh-CN><en>Public diagnostic context.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {boolean} <lang><zh-CN>值是否有效。</zh-CN><en>Whether the value is valid.</en></lang>
 */
function validateSemanticText(value, context, diagnostics) {
  // <lang><zh-CN>布尔结果同时要求字符串类型、无外围空格、非空且不命中受控占位词。</zh-CN><en>The Boolean result simultaneously requires string type, trim stability, nonemptiness, and absence from the controlled placeholder set.</en></lang>
  const valid = typeof value === 'string'
    && value.trim() === value
    && value.length > 0
    && !/^(?:generic|placeholder|tbd|todo|unknown)$/iu.test(value);

  // <lang><zh-CN>坏文本产生稳定语义诊断；返回值仍供上层决定是否进入集合检查。</zh-CN><en>Invalid text emits the stable semantic diagnostic while the return value lets the caller decide whether it may enter set checks.</en></lang>
  if (!valid) addDiagnostic(diagnostics, 'API_COMPATIBILITY_SEMANTICS_INVALID', `${context} must be a non-placeholder semantic string.`);
  // <lang><zh-CN>不修剪或改写输入，确保校验器保持只读。</zh-CN><en>Return without trimming or rewriting input so the validator remains read-only.</en></lang>
  return valid;
}

/**
 * @lang zh-CN 校验语义字符串数组的形状、成员与唯一性；声明顺序保持不变。
 * @lang en Validates the shape, members, and uniqueness of a semantic string array while preserving declaration order.
 * @param {unknown} values <lang><zh-CN>字符串数组候选。</zh-CN><en>Candidate string array.</en></lang>
 * @param {string} context <lang><zh-CN>公开诊断上下文。</zh-CN><en>Public diagnostic context.</en></lang>
 * @param {boolean} allowEmpty <lang><zh-CN>是否允许空数组。</zh-CN><en>Whether an empty array is allowed.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {string[]} <lang><zh-CN>可用于后续集合检查的合法字符串。</zh-CN><en>Valid strings usable by later set checks.</en></lang>
 */
function validateSemanticTextArray(values, context, allowEmpty, diagnostics) {
  // <lang><zh-CN>数组形状与非空策略先行；坏容器不再被枚举。</zh-CN><en>Check array shape and the empty-list policy first; a malformed container is never enumerated.</en></lang>
  if (!Array.isArray(values) || (!allowEmpty && values.length === 0)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_SEMANTICS_INVALID', `${context} must be a ${allowEmpty ? '' : 'nonempty '}string array.`);
    return [];
  }

  // <lang><zh-CN>只收集通过文本门禁的值，坏成员不会制造二次重复诊断。</zh-CN><en>Collect only values that pass the text gate so a malformed member cannot create a secondary duplicate diagnostic.</en></lang>
  const validValues = values.filter((value, index) => validateSemanticText(value, `${context}[${index}]`, diagnostics));

  // <lang><zh-CN>只对合法成员检查重复，避免一个坏值同时产生无意义的重复噪声。</zh-CN><en>Check duplicates only among valid members so one malformed value cannot create meaningless duplicate noise.</en></lang>
  if (new Set(validValues).size !== validValues.length) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_SEMANTICS_INVALID', `${context} must not repeat a value.`);
  }
  // <lang><zh-CN>返回筛选后的只读视图供排序、前缀和集合门禁复用。</zh-CN><en>Return the filtered read-only view for ordering, prefix, and set gates.</en></lang>
  return validValues;
}

/**
 * @lang zh-CN 校验 payload、binding 或 parameter 的命名 shape 数组；`optional` 只能是显式 boolean。
 * @lang en Validates a named-shape array for payloads, bindings, or parameters; `optional` may only be an explicit boolean.
 * @param {unknown} values <lang><zh-CN>命名 shape 数组。</zh-CN><en>Named-shape array.</en></lang>
 * @param {string} context <lang><zh-CN>公开诊断上下文。</zh-CN><en>Public diagnostic context.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {void} <lang><zh-CN>无返回。</zh-CN><en>No return value.</en></lang>
 */
function validateSemanticShapes(values, context, diagnostics) {
  // <lang><zh-CN>非数组不能形成有序 payload/binding/parameter contract，立即停止该节点。</zh-CN><en>A non-array cannot form an ordered payload, binding, or parameter contract, so validation of this node stops immediately.</en></lang>
  if (!Array.isArray(values)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_SEMANTICS_INVALID', `${context} must be an array.`);
    return;
  }

  // <lang><zh-CN>名称序列只收集通过字段门禁的成员，用于独立唯一性检查。</zh-CN><en>The name sequence collects only members that pass field validation for an independent uniqueness check.</en></lang>
  const names = [];

  // <lang><zh-CN>按声明顺序逐项校验，保留 payload/parameter 的位置语义。</zh-CN><en>Validate in declaration order to preserve positional payload and parameter semantics.</en></lang>
  for (const [index, value] of values.entries()) {
    // <lang><zh-CN>optional 只有显式出现时才属于 envelope，校验器不会补默认值。</zh-CN><en>Optional belongs to the envelope only when explicitly present; the validator never supplies a default.</en></lang>
    const fields = isRecord(value) && Object.hasOwn(value, 'optional') ? ['name', 'shape', 'optional'] : ['name', 'shape'];

    // <lang><zh-CN>字段形状失败的成员跳过后续属性读取，防止派生异常掩盖主诊断。</zh-CN><en>Skip property reads after a field-shape failure so derived exceptions cannot hide the primary diagnostic.</en></lang>
    if (!validateExactFields(value, new Set(fields), fields, `${context}[${index}]`, diagnostics)) continue;
    // <lang><zh-CN>名称只有通过文本门禁才进入唯一性集合；shape 始终单独校验。</zh-CN><en>A name enters the uniqueness set only after passing the text gate, while shape is always validated independently.</en></lang>
    if (validateSemanticText(value.name, `${context}[${index}].name`, diagnostics)) names.push(value.name);
    validateSemanticText(value.shape, `${context}[${index}].shape`, diagnostics);
    // <lang><zh-CN>显式 optional 必须是 boolean，禁止字符串真值产生调用歧义。</zh-CN><en>An explicit optional flag must be Boolean so string truthiness cannot create invocation ambiguity.</en></lang>
    if (Object.hasOwn(value, 'optional') && typeof value.optional !== 'boolean') {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_SEMANTICS_INVALID', `${context}[${index}].optional must be a boolean.`);
    }
  }

  // <lang><zh-CN>同一 payload/binding/parameter 列表不能重复命名成员。</zh-CN><en>A single payload, binding, or parameter list cannot repeat a named member.</en></lang>
  if (new Set(names).size !== names.length) addDiagnostic(diagnostics, 'API_COMPATIBILITY_SEMANTICS_INVALID', `${context} must not repeat a name.`);
}

/**
 * @lang zh-CN 校验一侧 delivered semantic record，并在 prop 上复核既有结构事实。
 * @lang en Validates one delivered semantic-side record and cross-checks existing structural facts for props.
 * @param {unknown} side <lang><zh-CN>upstream 或 HIA 语义侧。</zh-CN><en>Upstream or HIA semantic side.</en></lang>
 * @param {'prop'|'event'|'slot'|'imperativeApi'|'service'} kind <lang><zh-CN>受控语义 kind。</zh-CN><en>Controlled semantic kind.</en></lang>
 * @param {object|null} propFact <lang><zh-CN>prop 结构事实；其他 kind 为 null。</zh-CN><en>Structural prop fact, or null for other kinds.</en></lang>
 * @param {string} context <lang><zh-CN>公开诊断上下文。</zh-CN><en>Public diagnostic context.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {void} <lang><zh-CN>无返回。</zh-CN><en>No return value.</en></lang>
 */
function validateDeliveredSemanticSide(side, kind, propFact, context, diagnostics) {
  // <lang><zh-CN>kind 选择互斥字段集合；未知 kind 不会获得宽松 fallback。</zh-CN><en>The kind selects a mutually exclusive field set; an unknown kind receives no permissive fallback.</en></lang>
  const fields = semanticSideFields[kind];

  // <lang><zh-CN>字段集合不成立时停止该侧，避免读取未验证的嵌套值。</zh-CN><en>Stop this side when its field set is invalid so unvalidated nested values are never read.</en></lang>
  if (!fields || !validateExactFields(side, new Set(fields), fields, context, diagnostics)) return;
  // <lang><zh-CN>交付侧必须同时陈述 delivered 与预期 kind，不能借字段外形跨 kind 复用。</zh-CN><en>A delivered side must state both delivered status and the expected kind and cannot reuse a field shape across kinds.</en></lang>
  if (side.status !== 'delivered' || side.kind !== kind) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_SEMANTICS_INVALID', `${context} must declare delivered ${kind} semantics.`);
  }

  // <lang><zh-CN>prop 分支将人工语义与当前结构事实逐字段对齐。</zh-CN><en>The prop branch aligns human-reviewed semantics field by field with the current structural fact.</en></lang>
  if (kind === 'prop') {
    // <lang><zh-CN>valueDomain 复用既有结构 prop 的五项固定事实，不另建更宽 schema。</zh-CN><en>The value domain reuses the five fixed facts from the structural prop rather than defining a wider schema.</en></lang>
    const domainFields = ['typeKinds', 'typeOrder', 'default', 'required', 'validator'];

    // <lang><zh-CN>只有完整 valueDomain 才能与结构事实比较。</zh-CN><en>Only a complete value domain can be compared with the structural fact.</en></lang>
    if (validateExactFields(side.valueDomain, new Set(domainFields), domainFields, `${context}.valueDomain`, diagnostics)) {
      // <lang><zh-CN>期望对象保持与 JSON 生成物相同字段顺序，使深比较稳定。</zh-CN><en>The expected object preserves generated-JSON field order for a stable deep comparison.</en></lang>
      const expectedDomain = {
        typeKinds: propFact?.typeKinds,
        typeOrder: propFact?.typeOrder,
        default: propFact?.default,
        required: propFact?.required,
        validator: propFact?.validator
      };

      // <lang><zh-CN>任何类型顺序、default、required 或 validator 漂移都属于语义冲突。</zh-CN><en>Any drift in type order, default, required state, or validator is a semantic conflict.</en></lang>
      if (JSON.stringify(side.valueDomain) !== JSON.stringify(expectedDomain)) {
        addDiagnostic(diagnostics, 'API_COMPATIBILITY_SEMANTICS_INVALID', `${context}.valueDomain must match the API prop fact.`);
      }
    }
    // <lang><zh-CN>其余 prop 语义字段逐项拒绝占位文本，副作用列表必须非空且唯一。</zh-CN><en>Every remaining prop semantic field rejects placeholders, while the side-effect list must be nonempty and unique.</en></lang>
    for (const field of ['ownership', 'control', 'coercion', 'validation', 'parentChild']) validateSemanticText(side[field], `${context}.${field}`, diagnostics);
    // <lang><zh-CN>副作用列表单独验证，使无副作用也必须成为显式且唯一的事实。</zh-CN><en>Validate the side-effect list separately so even no side effect must be an explicit unique fact.</en></lang>
    validateSemanticTextArray(side.sideEffects, `${context}.sideEffects`, false, diagnostics);
    // <lang><zh-CN>prop 专属字段完成后返回，避免落入调用型 API 分支。</zh-CN><en>Return after prop-specific fields so validation cannot fall through to callable-API handling.</en></lang>
    return;
  }

  // <lang><zh-CN>event 分支独立锁定 trigger、payload、投递与副作用事实。</zh-CN><en>The event branch independently locks trigger, payload, delivery, and side-effect facts.</en></lang>
  if (kind === 'event') {
    // <lang><zh-CN>事件 trigger/delivery/model relation 与参数、副作用分别验证；不从事件名推断这些事实。</zh-CN><en>Validate event trigger, delivery, model relation, parameters, and side effects separately instead of inferring them from the event name.</en></lang>
    for (const field of ['trigger', 'delivery', 'modelRelation']) validateSemanticText(side[field], `${context}.${field}`, diagnostics);
    // <lang><zh-CN>当前审计面是 Vue emit，不具有 DOM 风格取消返回通道，必须明确为 false。</zh-CN><en>The reviewed surface is a Vue emit without a DOM-style cancellation return channel and must explicitly be false.</en></lang>
    if (side.cancellable !== false) addDiagnostic(diagnostics, 'API_COMPATIBILITY_SEMANTICS_INVALID', `${context}.cancellable must be false.`);
    // <lang><zh-CN>参数列表保留声明顺序并逐项验证，不从事件名猜测 payload。</zh-CN><en>Validate the parameter list in declaration order without guessing payload from the event name.</en></lang>
    validateSemanticShapes(side.parameters, `${context}.parameters`, diagnostics);
    // <lang><zh-CN>事件副作用必须作为非空唯一事实列表声明。</zh-CN><en>Event side effects must be declared as a nonempty unique fact list.</en></lang>
    validateSemanticTextArray(side.sideEffects, `${context}.sideEffects`, false, diagnostics);
    // <lang><zh-CN>event 专属字段完成后返回。</zh-CN><en>Return after event-specific fields are complete.</en></lang>
    return;
  }

  // <lang><zh-CN>slot 分支独立锁定 binding、fallback、cardinality 与上下文所有权。</zh-CN><en>The slot branch independently locks bindings, fallback, cardinality, and context ownership.</en></lang>
  if (kind === 'slot') {
    // <lang><zh-CN>slot 的 binding 列表与 fallback/cardinality/context owner 共同构成完整 P0 语义。</zh-CN><en>The slot binding list and fallback, cardinality, and context owner together form complete P0 semantics.</en></lang>
    validateSemanticShapes(side.bindings, `${context}.bindings`, diagnostics);
    // <lang><zh-CN>其余 slot 语义逐字段拒绝空值与占位词。</zh-CN><en>Reject empty values and placeholders for every remaining slot semantic fact.</en></lang>
    for (const field of ['fallback', 'cardinality', 'contextOwner']) validateSemanticText(side[field], `${context}.${field}`, diagnostics);
    // <lang><zh-CN>slot 专属字段完成后返回。</zh-CN><en>Return after slot-specific fields are complete.</en></lang>
    return;
  }

  // <lang><zh-CN>imperative/service 共享参数与执行语义字段；kind-specific return 形状在后续分支处理。</zh-CN><en>Imperative APIs and services share parameter and execution-semantic fields, while kind-specific return shapes are handled below.</en></lang>
  validateSemanticShapes(side.parameters, `${context}.parameters`, diagnostics);
  // <lang><zh-CN>共同调用生命周期字段逐项校验，避免 scope 或 failure 等事实彼此代偿。</zh-CN><en>Validate common invocation-lifecycle fields individually so scope, failure, and related facts cannot substitute for one another.</en></lang>
  for (const field of ['entry', 'scope', 'lifecycle', 'concurrency', 'failure']) validateSemanticText(side[field], `${context}.${field}`, diagnostics);
  // <lang><zh-CN>调用效果必须显式列出且不得重复。</zh-CN><en>Invocation effects must be listed explicitly without duplicates.</en></lang>
  validateSemanticTextArray(side.effects, `${context}.effects`, false, diagnostics);

  // <lang><zh-CN>imperative API 使用单字符串返回 shape；service 使用 controller envelope。</zh-CN><en>An imperative API uses a single return-shape string, while a service uses a controller envelope.</en></lang>
  if (kind === 'imperativeApi') {
    // <lang><zh-CN>组件 ref method 的返回值使用一个非占位 shape 字符串。</zh-CN><en>A component-ref method uses one non-placeholder return-shape string.</en></lang>
    validateSemanticText(side.returns, `${context}.returns`, diagnostics);
  } else if (validateExactFields(side.returns, new Set(['shape', 'operations']), ['shape', 'operations'], `${context}.returns`, diagnostics)) {
    // <lang><zh-CN>service controller 同时声明 controller shape 与公开 operation 清单。</zh-CN><en>A service controller declares both its controller shape and public operation list.</en></lang>
    validateSemanticText(side.returns.shape, `${context}.returns.shape`, diagnostics);
    // <lang><zh-CN>operations 保留合法、唯一字符串，用于代码点顺序门禁。</zh-CN><en>Operations retains valid unique strings for the code-point ordering gate.</en></lang>
    const operations = validateSemanticTextArray(side.returns.operations, `${context}.returns.operations`, false, diagnostics);

    // <lang><zh-CN>controller operation 使用跨 locale 代码点顺序，确保生成物字节稳定。</zh-CN><en>Controller operations use locale-independent code-point order for byte-stable artifacts.</en></lang>
    if (!isCodePointSorted(operations)) addDiagnostic(diagnostics, 'API_COMPATIBILITY_SEMANTICS_INVALID', `${context}.returns.operations must use code-point order.`);
  }
}

/**
 * @lang zh-CN 校验一个完整 P0/service semantics envelope 的 evidence、remaining-evidence 与上下游交付事实。
 * @lang en Validates evidence, remaining evidence, and upstream/local delivery facts for one complete P0 or service semantic envelope.
 * @param {unknown} semantics <lang><zh-CN>语义 envelope。</zh-CN><en>Semantic envelope.</en></lang>
 * @param {object} expected <lang><zh-CN>kind、disposition 与结构交叉核对事实。</zh-CN><en>Kind, disposition, and structural cross-check facts.</en></lang>
 * @param {string} context <lang><zh-CN>公开诊断上下文。</zh-CN><en>Public diagnostic context.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {void} <lang><zh-CN>无返回。</zh-CN><en>No return value.</en></lang>
 */
function validateItemSemantics(semantics, expected, context, diagnostics) {
  // <lang><zh-CN>统一 envelope 将完成状态、证据、剩余证据与上下游事实绑定在同一 item 上。</zh-CN><en>The common envelope binds completion, evidence, remaining evidence, and both implementation sides to the same item.</en></lang>
  const fields = ['reviewState', 'evidenceLevel', 'evidenceRefs', 'remainingEvidence', 'upstream', 'hia'];

  // <lang><zh-CN>坏 envelope 不进入证据或 nested-side 读取。</zh-CN><en>A malformed envelope never enters evidence or nested-side reads.</en></lang>
  if (!validateExactFields(semantics, new Set(fields), fields, context, diagnostics)) return;
  // <lang><zh-CN>v2 不接受部分完成或未定义 evidence level。</zh-CN><en>Version 2 accepts neither partially completed reviews nor undefined evidence levels.</en></lang>
  if (semantics.reviewState !== 'complete' || !['source-reviewed', 'runtime-tested'].includes(semantics.evidenceLevel)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_SEMANTICS_INVALID', `${context} must declare a complete supported evidence level.`);
  }

  // <lang><zh-CN>先取得合法 evidence 字符串视图，再进行安全前缀与相对引用检查。</zh-CN><en>Obtain the valid evidence-string view before checking safe prefixes and relative references.</en></lang>
  const evidenceRefs = validateSemanticTextArray(semantics.evidenceRefs, `${context}.evidenceRefs`, false, diagnostics);
  // <lang><zh-CN>公开引用只允许 comparison/local/test 三种命名空间，且拒绝父目录片段。</zh-CN><en>Public references allow only comparison, local, and test namespaces and reject parent-directory segments.</en></lang>
  const evidenceIsSafe = evidenceRefs.every((reference) => /^(?:comparison|local|test):[A-Za-z0-9._@/-]+$/u.test(reference) && !reference.includes('..'));

  // <lang><zh-CN>每项审计必须具有排序稳定且同时覆盖上下游的证据集合。</zh-CN><en>Every review must have a stably sorted evidence set covering both upstream and local sides.</en></lang>
  if (!isCodePointSorted(evidenceRefs) || !evidenceIsSafe
    || !evidenceRefs.some((reference) => reference.startsWith('comparison:'))
    || !evidenceRefs.some((reference) => reference.startsWith('local:'))) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_SEMANTICS_INVALID', `${context}.evidenceRefs must be sorted safe public comparison/local references.`);
  }
  // <lang><zh-CN>runtime-tested 没有 test reference 时属于虚假升级，必须拒绝。</zh-CN><en>A runtime-tested claim without a test reference is a false upgrade and must be rejected.</en></lang>
  if (semantics.evidenceLevel === 'runtime-tested' && !evidenceRefs.some((reference) => reference.startsWith('test:'))) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_SEMANTICS_INVALID', `${context} requires a test evidence reference.`);
  }

  // <lang><zh-CN>剩余证据允许空数组，但成员仍需通过非占位与唯一性门禁。</zh-CN><en>Remaining evidence may be empty, but every member still passes non-placeholder and uniqueness gates.</en></lang>
  const remainingEvidence = validateSemanticTextArray(semantics.remainingEvidence, `${context}.remainingEvidence`, true, diagnostics);
  // <lang><zh-CN>证据 profile 同时绑定 disposition、证据等级与剩余工作；mapped 可明确表示待 runtime parity，或表示已有测试且无剩余证据。</zh-CN><en>The evidence profile binds disposition, evidence level, and remaining work; mapped may explicitly mean pending runtime parity or tested with no evidence remaining.</en></lang>
  const evidenceProfileIsValid = expected.disposition === 'compatible'
    ? semantics.evidenceLevel === 'runtime-tested' && remainingEvidence.length === 0
    : expected.disposition === 'mapped'
      ? (semantics.evidenceLevel === 'source-reviewed' && JSON.stringify(remainingEvidence) === JSON.stringify(['runtime-parity']))
        || (semantics.evidenceLevel === 'runtime-tested' && remainingEvidence.length === 0)
      : semantics.evidenceLevel === 'source-reviewed' && remainingEvidence.length === 0;

  // <lang><zh-CN>任何混合 profile 都是矛盾事实，包括 runtime-tested 仍有待办，或 source-reviewed mapped 没有待办。</zh-CN><en>Any mixed profile is contradictory, including runtime-tested with a remaining task or source-reviewed mapped without one.</en></lang>
  if (!evidenceProfileIsValid) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_SEMANTICS_INVALID', `${context} evidence level or remaining evidence contradicts migration disposition.`);
  }

  // <lang><zh-CN>上游是审计对象，必须始终声明 delivered kind-specific 事实。</zh-CN><en>The upstream is the review subject and must always declare delivered kind-specific facts.</en></lang>
  validateDeliveredSemanticSide(semantics.upstream, expected.kind, expected.upstreamPropFact ?? null, `${context}.upstream`, diagnostics);

  // <lang><zh-CN>本地已交付目标需完整语义；未交付目标只能使用精确单字段 sentinel。</zh-CN><en>A delivered local target requires complete semantics, while an undelivered target may use only the exact one-field sentinel.</en></lang>
  if (expected.hiaDelivered) {
    validateDeliveredSemanticSide(semantics.hia, expected.kind, expected.hiaPropFact ?? null, `${context}.hia`, diagnostics);
  } else if (validateExactFields(semantics.hia, new Set(['status']), ['status'], `${context}.hia`, diagnostics)
    && semantics.hia.status !== 'not-delivered') {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_SEMANTICS_INVALID', `${context}.hia must be explicitly not-delivered.`);
  }

  // <lang><zh-CN>`compatible` 必须具有逐字段相同的上下游 kind-specific 语义；仅有 runtime 证据或同名 target 不能覆盖 ownership、payload、side effect 等差异。</zh-CN><en>A `compatible` item must have field-for-field equal upstream and local kind-specific semantics; runtime evidence or a same-name target cannot hide ownership, payload, or side-effect differences.</en></lang>
  if (expected.disposition === 'compatible' && JSON.stringify(semantics.upstream) !== JSON.stringify(semantics.hia)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_SEMANTICS_INVALID', `${context} compatible sides must declare identical semantics.`);
  }
}

/**
 * @lang zh-CN 校验一个 prop item，包括上下游类型顺序、default、required、validator、HIA targets、优先级与迁移 target。
 * @lang en Validates one prop item, including upstream and HIA type order, default, required, validator, HIA targets, priority, and migration target.
 * @param {unknown} item <lang><zh-CN>prop item。</zh-CN><en>Prop item.</en></lang>
 * @param {string} componentName <lang><zh-CN>当前组件名。</zh-CN><en>Current component name.</en></lang>
 * @param {Map<string, object>} issuesById <lang><zh-CN>issue registry。</zh-CN><en>Issue registry.</en></lang>
 * @param {Set<string>} componentIssueIds <lang><zh-CN>当前组件 issue 集。</zh-CN><en>Current component issue set.</en></lang>
 * @param {Set<string>} surfaceIssueIds <lang><zh-CN>当前 props container 的直接 issue 集。</zh-CN><en>Direct issue set of the current props container.</en></lang>
 * @param {number} schemaVersion <lang><zh-CN>矩阵 schema version。</zh-CN><en>Matrix schema version.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {string | null} <lang><zh-CN>合法 id 候选；形状无效时为 null。</zh-CN><en>Valid id candidate, or null for an invalid shape.</en></lang>
 */
function validatePropItem(item, componentName, issuesById, componentIssueIds, surfaceIssueIds, schemaVersion, diagnostics) {
  // <lang><zh-CN>上下文只包含公开组件名和维度，用于稳定诊断而不暴露源码位置。</zh-CN><en>The context contains only the public component name and dimension, producing stable diagnostics without exposing source locations.</en></lang>
  const context = `API compatibility component ${componentName} prop item`;
  // <lang><zh-CN>v2 只给 P0 增加 semantics；其他优先级与 v1 均保持五字段 envelope。</zh-CN><en>Version 2 adds semantics only to P0; every other priority and v1 retain the five-field envelope.</en></lang>
  const itemFields = schemaVersion === 2 && item?.priority === 'P0' ? allowedP0ApiItemFieldsV2 : allowedApiItemFields;

  if (!validateExactFields(item, itemFields, [...itemFields], context, diagnostics)) return null;

  // <lang><zh-CN>上游 prop 必须完整声明类型集合/源码顺序、default、required 与 validator 事实。</zh-CN><en>The upstream prop must fully declare its type set and source order, default, required flag, and validator fact.</en></lang>
  const upstreamFields = ['name', 'typeKinds', 'typeOrder', 'default', 'required', 'validator'];
  // <lang><zh-CN>上游 prop 外壳不是 record 时无法安全建立 item 身份，因此返回 null。</zh-CN><en>An invalid upstream-prop envelope cannot establish a safe item identity and therefore returns null.</en></lang>
  if (!validateExactFields(item.upstream, new Set(upstreamFields), upstreamFields, `${context}.upstream`, diagnostics)) return null;
  // <lang><zh-CN>规范 prop 名只去除外围空白，并作为 id、target 和诊断的稳定身份基准。</zh-CN><en>The normalized prop name removes outer whitespace only and becomes the stable identity basis for IDs, targets, and diagnostics.</en></lang>
  const propName = isNonemptyString(item.upstream.name) ? item.upstream.name.trim() : '';
  // <lang><zh-CN>id 必须由规范名称确定，能力优先级必须逐 item 明示，不能继承组件级优先级。</zh-CN><en>The normalized name determines the ID, and capability priority must be explicit per item rather than inherited from the component.</en></lang>
  if (!propName || item.id !== `prop:${propName}` || !supportedPriorities.has(item.priority)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_API_ITEM_INVALID', `${context} has an invalid id, name, or priority.`);
  }
  // <lang><zh-CN>排序 typeKinds 与源码 typeOrder 分别建模；后者只要求唯一与集合等价，不得被代码点排序改写。</zh-CN><en>Sorted typeKinds and source-order typeOrder are modeled separately; the latter requires only uniqueness and set equivalence and must not be rewritten into code-point order.</en></lang>
  const upstreamTypeKinds = validateTypeKinds(item.upstream.typeKinds, `${context}.upstream.typeKinds`, diagnostics);
  validateTypeOrder(item.upstream.typeOrder, upstreamTypeKinds, `${context}.upstream.typeOrder`, diagnostics);
  // <lang><zh-CN>required 必须是显式 boolean；缺失或字符串化值不能由 default 反推。</zh-CN><en>Required must be an explicit boolean; it cannot be inferred from default when missing or stringified.</en></lang>
  if (typeof item.upstream.required !== 'boolean') {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_API_ITEM_INVALID', `${context}.upstream.required must be a boolean.`);
  }
  // <lang><zh-CN>default unresolved 只可绑定当前 props surface 的直接原因；validator 永远作为不可执行摘要事实校验。</zh-CN><en>An unresolved default may bind only to a direct cause of the current props surface; validator is always checked as a non-executable digest fact.</en></lang>
  validateDefaultFact(item.upstream.default, `${context}.upstream.default`, componentName, issuesById, componentIssueIds, surfaceIssueIds, diagnostics);
  validateValidatorFact(item.upstream.validator, `${context}.upstream.validator`, diagnostics);

  // <lang><zh-CN>HIA targets 可以为空表示明确 unsupported；每个非空 target 仍须完整记录同形 prop option 事实。</zh-CN><en>HIA targets may be empty to represent explicit unsupported status; every nonempty target must still record same-shape prop-option facts.</en></lang>
  if (!validateExactFields(item.hia, new Set(['targets']), ['targets'], `${context}.hia`, diagnostics) || !Array.isArray(item.hia.targets)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_API_ITEM_INVALID', `${context}.hia.targets must be an array.`);
    return item.id ?? null;
  }
  // <lang><zh-CN>目标名称序列用于验证唯一性、代码点顺序以及 migration.target 的真实成员资格。</zh-CN><en>The target-name sequence verifies uniqueness, code-point order, and real membership of migration.target.</en></lang>
  const targetNames = [];
  // <lang><zh-CN>逐个目标校验其独立 prop option 事实；一个坏目标不阻止收集同 item 的其他问题。</zh-CN><en>Validate each target's independent prop-option facts; one bad target does not stop collection of other issues in the same item.</en></lang>
  for (const target of item.hia.targets) {
    // <lang><zh-CN>prop target 必须陈述与 upstream 同形的六项事实，不能只用重命名字符串代替兼容事实。</zh-CN><en>A prop target must state the same six facts as upstream and cannot substitute a rename string for compatibility facts.</en></lang>
    const targetFields = ['name', 'typeKinds', 'typeOrder', 'default', 'required', 'validator'];
    // <lang><zh-CN>坏 target 外壳只跳过当前映射，保留同 item 的其他目标诊断。</zh-CN><en>A malformed target envelope skips only that mapping and preserves diagnostics for other targets in the same item.</en></lang>
    if (!validateExactFields(target, new Set(targetFields), targetFields, `${context}.hia target`, diagnostics)) continue;
    // <lang><zh-CN>目标名为空时不能进入 migration target 成员集合。</zh-CN><en>An empty target name cannot enter migration-target membership.</en></lang>
    if (!isNonemptyString(target.name)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_API_ITEM_INVALID', `${context}.hia target must have a non-empty name.`);
      continue;
    }
    // <lang><zh-CN>只把非空规范名称写入成员序列，再以原始 target record 校验其余 prop option 事实。</zh-CN><en>Append only a nonempty normalized name to the membership sequence, then validate the remaining prop-option facts from the original target record.</en></lang>
    targetNames.push(target.name.trim());
    // <lang><zh-CN>目标类型集合与源码顺序必须成员等价，但保留各自声明顺序职责。</zh-CN><en>The target type set and source order must be member-equivalent while retaining their distinct ordering responsibilities.</en></lang>
    const targetTypeKinds = validateTypeKinds(target.typeKinds, `${context}.hia target ${target.name}.typeKinds`, diagnostics);
    validateTypeOrder(target.typeOrder, targetTypeKinds, `${context}.hia target ${target.name}.typeOrder`, diagnostics);
    // <lang><zh-CN>目标 required 独立于 upstream 校验，避免“同名映射”掩盖 optional/required 差异。</zh-CN><en>The target required flag is checked independently of upstream so a same-name mapping cannot hide optional/required differences.</en></lang>
    if (typeof target.required !== 'boolean') {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_API_ITEM_INVALID', `${context}.hia target ${target.name}.required must be a boolean.`);
    }
    // <lang><zh-CN>目标 default 与 validator 使用相同只读边界；任何 unresolved default 仍必须直接绑定当前 props container。</zh-CN><en>Target default and validator use the same read-only boundary; any unresolved default must still bind directly to the current props container.</en></lang>
    validateDefaultFact(target.default, `${context}.hia target ${target.name}.default`, componentName, issuesById, componentIssueIds, surfaceIssueIds, diagnostics);
    validateValidatorFact(target.validator, `${context}.hia target ${target.name}.validator`, diagnostics);
  }
  // <lang><zh-CN>prop targets 的唯一/顺序门禁在全部合法名称收集后统一执行。</zh-CN><en>Prop-target uniqueness and order gates run after all valid names are collected.</en></lang>
  if (new Set(targetNames).size !== targetNames.length || !isCodePointSorted(targetNames)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_VALUE_ORDER_INVALID', `${context}.hia targets must be unique and code-point sorted.`);
  }
  // <lang><zh-CN>迁移 target 最后对照已验证名称序列，避免引用尚未通过形状门禁的目标。</zh-CN><en>Validate the migration target last against the checked name sequence so it cannot reference a target that failed the shape gate.</en></lang>
  validateApiMigration(item.migration, targetNames, `${context}.migration`, diagnostics);
  if (schemaVersion === 2 && item.priority === 'P0') {
    // <lang><zh-CN>语义交叉核对必须跟随明确的 migration target；多个候选 target 时不得默认取数组首项。</zh-CN><en>Semantic cross-checking must follow the explicit migration target and must not default to the first array entry when several targets exist.</en></lang>
    const semanticTargetName = isNonemptyString(item.migration?.target) ? item.migration.target.trim() : null;
    // <lang><zh-CN>只在已声明 targets 中按精确名称选择语义目标；无 target 的 unsupported 项保持未交付。</zh-CN><en>Select the semantic target by exact name only among declared targets; a targetless unsupported item remains undelivered.</en></lang>
    const semanticTarget = semanticTargetName
      ? item.hia.targets.find((target) => isNonemptyString(target?.name) && target.name.trim() === semanticTargetName) ?? null
      : null;

    validateItemSemantics(item.semantics, {
      kind: 'prop',
      disposition: item.migration?.disposition,
      hiaDelivered: Boolean(semanticTarget),
      upstreamPropFact: item.upstream,
      hiaPropFact: semanticTarget
    }, `${context}.semantics`, diagnostics);
  }
  // <lang><zh-CN>返回稳定 item id 供容器做唯一/顺序检查；坏 id 返回 null，避免污染派生序列。</zh-CN><en>Return a stable item ID for container uniqueness and ordering checks; an invalid ID returns null so it cannot pollute the derived sequence.</en></lang>
  return isNonemptyString(item.id) ? item.id : null;
}

/**
 * @lang zh-CN 校验 event/slot/imperative item 的共同名称映射结构。
 * @lang en Validates the shared name-mapping structure of event, slot, and imperative items.
 * @param {unknown} item <lang><zh-CN>API item。</zh-CN><en>API item.</en></lang>
 * @param {string} componentName <lang><zh-CN>当前组件名。</zh-CN><en>Current component name.</en></lang>
 * @param {string} dimension <lang><zh-CN>公开维度名。</zh-CN><en>Public dimension name.</en></lang>
 * @param {string} idPrefix <lang><zh-CN>稳定 id 前缀。</zh-CN><en>Stable id prefix.</en></lang>
 * @param {number} schemaVersion <lang><zh-CN>矩阵 schema version。</zh-CN><en>Matrix schema version.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {string | null} <lang><zh-CN>合法 id 候选；形状无效时为 null。</zh-CN><en>Valid id candidate, or null for an invalid shape.</en></lang>
 */
function validateNamedApiItem(item, componentName, dimension, idPrefix, schemaVersion, diagnostics) {
  // <lang><zh-CN>诊断上下文保留具体 event/slot/imperative 维度，但不携带源码路径或声明正文。</zh-CN><en>The diagnostic context retains the concrete event, slot, or imperative dimension without carrying source paths or declaration bodies.</en></lang>
  const context = `API compatibility component ${componentName} ${dimension} item`;
  // <lang><zh-CN>v2 P0 使用六字段语义 envelope；其他条目保持 v1 五字段兼容面。</zh-CN><en>Version 2 P0 uses a six-field semantic envelope; other items retain the v1 five-field compatibility surface.</en></lang>
  const itemFields = schemaVersion === 2 && item?.priority === 'P0' ? allowedP0ApiItemFieldsV2 : allowedApiItemFields;

  if (!validateExactFields(item, itemFields, [...itemFields], context, diagnostics)) return null;
  // <lang><zh-CN>upstream name 外壳无效时无法建立稳定 item ID，立即返回 null。</zh-CN><en>An invalid upstream-name envelope cannot establish a stable item ID and returns null immediately.</en></lang>
  if (!validateExactFields(item.upstream, new Set(['name']), ['name'], `${context}.upstream`, diagnostics)) return null;
  // <lang><zh-CN>规范 API 名是稳定 id 的唯一后缀；不会推断 alias 或修改大小写。</zh-CN><en>The normalized API name is the sole stable-ID suffix; no alias is inferred and casing is preserved.</en></lang>
  const apiName = isNonemptyString(item.upstream.name) ? item.upstream.name.trim() : '';
  // <lang><zh-CN>维度前缀、名称和逐能力优先级必须同时合法，防止跨维度 id 碰撞。</zh-CN><en>The dimension prefix, name, and capability-level priority must all be valid, preventing cross-dimension ID collisions.</en></lang>
  if (!apiName || item.id !== `${idPrefix}:${apiName}` || !supportedPriorities.has(item.priority)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_API_ITEM_INVALID', `${context} has an invalid id, name, or priority.`);
  }

  // <lang><zh-CN>HIA targets 必须是精确单字段数组外壳，禁止嵌入额外映射语义。</zh-CN><en>HIA targets must use an exact single-field array envelope and cannot embed extra mapping semantics.</en></lang>
  if (!validateExactFields(item.hia, new Set(['targets']), ['targets'], `${context}.hia`, diagnostics) || !Array.isArray(item.hia.targets)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_API_ITEM_INVALID', `${context}.hia.targets must be an array.`);
    return item.id ?? null;
  }
  // <lang><zh-CN>目标名称序列只承载映射成员身份，不臆造 payload、slot binding 或 method signature。</zh-CN><en>The target-name sequence carries mapping membership only and invents no payload, slot binding, or method signature.</en></lang>
  const targetNames = [];
  // <lang><zh-CN>逐目标要求精确单字段 name；空 targets 仍可与明确 unsupported 迁移配套。</zh-CN><en>Require an exact single name field for each target; an empty target list may still pair with an explicit unsupported migration.</en></lang>
  for (const target of item.hia.targets) {
    // <lang><zh-CN>坏名称 target 只跳过当前记录，不进入成员或排序序列。</zh-CN><en>A malformed name target skips only the current record and enters neither membership nor order sequences.</en></lang>
    if (!validateExactFields(target, new Set(['name']), ['name'], `${context}.hia target`, diagnostics)) continue;
    // <lang><zh-CN>空目标名不能成为迁移 target。</zh-CN><en>An empty target name cannot become a migration target.</en></lang>
    if (!isNonemptyString(target.name)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_API_ITEM_INVALID', `${context}.hia target must have a non-empty name.`);
      continue;
    }
    // <lang><zh-CN>规范名称进入唯一/顺序序列，原 target record 不被修改。</zh-CN><en>The normalized name enters the uniqueness/order sequence while the original target record remains unchanged.</en></lang>
    targetNames.push(target.name.trim());
  }
  // <lang><zh-CN>所有可用名称收集后统一检查重复与代码点顺序。</zh-CN><en>Duplicate and code-point-order checks run after all usable names are collected.</en></lang>
  if (new Set(targetNames).size !== targetNames.length || !isCodePointSorted(targetNames)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_VALUE_ORDER_INVALID', `${context}.hia targets must be unique and code-point sorted.`);
  }
  // <lang><zh-CN>映射结论最后绑定到已验证目标集合，unsupported 则维持无 target 的明确事实。</zh-CN><en>Bind the migration conclusion to the checked target set last; unsupported remains an explicit targetless fact.</en></lang>
  validateApiMigration(item.migration, targetNames, `${context}.migration`, diagnostics);
  if (schemaVersion === 2 && item.priority === 'P0') {
    const semanticKind = dimension === 'events' ? 'event' : dimension === 'slots' ? 'slot' : 'imperativeApi';

    validateItemSemantics(item.semantics, {
      kind: semanticKind,
      disposition: item.migration?.disposition,
      hiaDelivered: targetNames.length > 0
    }, `${context}.semantics`, diagnostics);
  }
  // <lang><zh-CN>容器只接收非空 item id，以便独立检查重复和代码点顺序。</zh-CN><en>The container receives only a nonempty item ID for independent duplicate and code-point-order checks.</en></lang>
  return isNonemptyString(item.id) ? item.id : null;
}

/**
 * @lang zh-CN 校验带精确 scope 与直接 issue 引用的 API inventory container；空 items 在 complete 状态下只表示该 scope 已审计无项。
 * @lang en Validates an API-inventory container with an exact scope and direct issue references; empty items in complete state mean an audited absence only within that scope.
 * @param {unknown} container <lang><zh-CN>inventory container。</zh-CN><en>Inventory container.</en></lang>
 * @param {string} componentName <lang><zh-CN>当前组件名。</zh-CN><en>Current component name.</en></lang>
 * @param {string} dimension <lang><zh-CN>维度字段名。</zh-CN><en>Dimension field name.</en></lang>
 * @param {Map<string, object>} issuesById <lang><zh-CN>issue registry。</zh-CN><en>Issue registry.</en></lang>
 * @param {Set<string>} componentIssueIds <lang><zh-CN>组件 issue 引用。</zh-CN><en>Component issue references.</en></lang>
 * @param {number} schemaVersion <lang><zh-CN>矩阵 schema version。</zh-CN><en>Matrix schema version.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {{itemCount:number,unresolved:number}} <lang><zh-CN>供组件 summary 复核的数量。</zh-CN><en>Counts used to verify the component summary.</en></lang>
 */
function validateApiContainer(container, componentName, dimension, issuesById, componentIssueIds, schemaVersion, diagnostics) {
  // <lang><zh-CN>上下文与字段白名单按当前组件维度固定，所有后续诊断均落在同一公开位置。</zh-CN><en>The context and field allowlist are fixed to the current component dimension so all later diagnostics share one public location.</en></lang>
  const context = `API compatibility component ${componentName}.${dimension}`;
  // <lang><zh-CN>inventory container 只允许 scope、完成状态、items 与直接 issueIds，禁止内嵌自报 summary 或扫描入口。</zh-CN><en>An inventory container allows only scope, completion state, items, and direct issueIds, forbidding embedded self-reported summaries or scan entry points.</en></lang>
  const fields = ['scope', 'inventoryState', 'items', 'issueIds'];
  // <lang><zh-CN>container 外壳或 items 数组无效时返回零计数，避免派生遍历抛错。</zh-CN><en>An invalid container envelope or items array returns zero counts so derived traversal cannot throw.</en></lang>
  if (!validateExactFields(container, new Set(fields), fields, context, diagnostics) || !Array.isArray(container.items)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_INVENTORY_INVALID', `${context} must declare scope, inventoryState, items, and direct issueIds.`);
    return { itemCount: 0, unresolved: 0 };
  }
  // <lang><zh-CN>scope 精确限制“完整”结论：props 覆盖 runtime prop options，其余名称面只覆盖 names-only，不能外推 payload、slot bindings 或方法签名。</zh-CN><en>The exact scope bounds any “complete” conclusion: props cover runtime prop options while the other surfaces cover names only, never payloads, slot bindings, or method signatures.</en></lang>
  if (container.scope !== expectedInventoryScopes[dimension]) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_INVENTORY_INVALID', `${context}.scope must be ${expectedInventoryScopes[dimension]}.`);
  }
  // <lang><zh-CN>直接 issue 引用必须归属当前组件与当前 surface；`static-parser` 只可作为被本 container 直接绑定的 parser-owned 例外。</zh-CN><en>Direct issue references must belong to this component and surface; `static-parser` is allowed only as a parser-owned exception directly bound by this container.</en></lang>
  const surfaceIssueIds = validateDirectIssueIds(
    container.issueIds,
    context,
    componentName,
    new Set([dimension]),
    true,
    issuesById,
    componentIssueIds,
    diagnostics
  );
  // <lang><zh-CN>状态枚举独立于 items 内容校验；合法 unresolved 是事实而不是失败。</zh-CN><en>The state enum is independent of item validation; a valid unresolved state is a fact rather than a failure.</en></lang>
  if (!supportedInventoryStates.has(container.inventoryState)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_INVENTORY_INVALID', `${context}.inventoryState is unsupported.`);
  }
  // <lang><zh-CN>complete 必须没有直接原因，unresolved 必须至少有一个直接原因；组件汇总中的全局/package/其他 surface issue 不能兜底。</zh-CN><en>Complete requires no direct cause and unresolved requires at least one; global, package, or other-surface issues in the component summary cannot act as fallback.</en></lang>
  if ((container.inventoryState === 'complete' && surfaceIssueIds.size !== 0)
    || (container.inventoryState === 'unresolved' && surfaceIssueIds.size === 0)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_ISSUE_REFERENCE_INVALID', `${context}.issueIds must be empty for complete and nonempty for unresolved.`);
  }

  // <lang><zh-CN>item ID 序列同时锁定唯一性与 locale 无关的代码点顺序；unsupported item 同样保留并计数。</zh-CN><en>The item-ID sequence locks both uniqueness and locale-independent code-point order; unsupported items are retained and counted normally.</en></lang>
  const itemIds = [];
  // <lang><zh-CN>props 使用包含类型/default 的专用 validator，其余三个名称映射维度复用受控前缀分派。</zh-CN><en>Props use the type/default-aware validator while the other three name-mapping dimensions share controlled prefix dispatch.</en></lang>
  for (const item of container.items) {
    // <lang><zh-CN>当前 item 的返回 ID 只在嵌套形状足够可靠时存在；诊断仍由被调 validator 累积。</zh-CN><en>The current item returns an ID only when its nested shape is reliable enough; diagnostics continue accumulating in the delegated validator.</en></lang>
    const itemId = dimension === 'props'
      ? validatePropItem(item, componentName, issuesById, componentIssueIds, surfaceIssueIds, schemaVersion, diagnostics)
      : validateNamedApiItem(
        item,
        componentName,
        dimension,
        dimension === 'events' ? 'event' : dimension === 'slots' ? 'slot' : 'imperative',
        schemaVersion,
        diagnostics
      );
    // <lang><zh-CN>跳过 null ID，防止原始坏值参与重复/排序比较而制造二次噪声。</zh-CN><en>Skip a null ID so a malformed raw value cannot create secondary duplicate or ordering noise.</en></lang>
    if (itemId) itemIds.push(itemId);
  }
  // <lang><zh-CN>同一维度内重复 ID 破坏一对一 inventory 身份，即使两个 records 内容一致也失败。</zh-CN><en>A duplicate ID within one dimension breaks one-to-one inventory identity and fails even when both records are identical.</en></lang>
  if (new Set(itemIds).size !== itemIds.length) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_API_ITEM_DUPLICATE', `${context} repeats an API item id.`);
  }
  // <lang><zh-CN>代码点顺序与生成器字节契约一致，不允许运行主机 locale 重排 API records。</zh-CN><en>Code-point order matches the generator byte contract and prevents the runtime host locale from reordering API records.</en></lang>
  if (!isCodePointSorted(itemIds)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_API_ITEM_ORDER_INVALID', `${context} API item ids must use code-point order.`);
  }
  // <lang><zh-CN>派生数量只供组件 summary 复核；不会回写 container，也不把 unsupported 计作 unresolved。</zh-CN><en>Derived counts serve only component-summary verification; they do not mutate the container or count unsupported as unresolved.</en></lang>
  return { itemCount: container.items.length, unresolved: container.inventoryState === 'unresolved' ? 1 : 0 };
}

/**
 * @lang zh-CN 校验 aliases inventory；当前空数组是有效的“已审计无 runtime alias”。
 * @lang en Validates aliases inventory; the current empty array is valid evidence of an audited absence of runtime aliases.
 * @param {unknown} aliases <lang><zh-CN>alias container。</zh-CN><en>Alias container.</en></lang>
 * @param {string} componentName <lang><zh-CN>当前组件名。</zh-CN><en>Current component name.</en></lang>
 * @param {Map<string, object>} issuesById <lang><zh-CN>issue registry。</zh-CN><en>Issue registry.</en></lang>
 * @param {Set<string>} componentIssueIds <lang><zh-CN>当前组件 issue 引用。</zh-CN><en>Current component issue references.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function validateAliases(aliases, componentName, issuesById, componentIssueIds, diagnostics) {
  // <lang><zh-CN>alias 上下文只含公开组件名；运行时 alias 事实与迁移 rename recipe 保持不同责任面。</zh-CN><en>The alias context contains only the public component name; runtime alias facts remain distinct from migration rename recipes.</en></lang>
  const context = `API compatibility component ${componentName}.aliases`;
  // <lang><zh-CN>与 API inventory 一致，alias container 只允许精确 scope、状态、显式 items 与直接 issueIds。</zh-CN><en>Like API inventories, the alias container allows only an exact scope, state, explicit items, and direct issueIds.</en></lang>
  const fields = ['scope', 'inventoryState', 'items', 'issueIds'];
  // <lang><zh-CN>alias 外壳或 items 数组无效时停止该维度，避免读取任意 alias 记录。</zh-CN><en>Stop the alias dimension when its envelope or items array is invalid so arbitrary alias records are not read.</en></lang>
  if (!validateExactFields(aliases, new Set(fields), fields, context, diagnostics) || !Array.isArray(aliases.items)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_INVENTORY_INVALID', `${context} must declare scope, inventoryState, items, and direct issueIds.`);
    return;
  }
  // <lang><zh-CN>runtime-aliases scope 明确排除迁移 rename recipe；其他 scope 名不能偷换该结论。</zh-CN><en>The runtime-aliases scope explicitly excludes migration rename recipes; another scope name cannot substitute for that conclusion.</en></lang>
  if (aliases.scope !== expectedInventoryScopes.aliases) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_INVENTORY_INVALID', `${context}.scope must be ${expectedInventoryScopes.aliases}.`);
  }
  // <lang><zh-CN>alias 未决原因必须直接绑定 aliases surface；parser-owned 例外仍要求当前 owner、component 汇总和直接引用三者齐备。</zh-CN><en>An alias unresolved cause must bind directly to the aliases surface; the parser-owned exception still requires current ownership, component summary, and direct reference together.</en></lang>
  const surfaceIssueIds = validateDirectIssueIds(
    aliases.issueIds,
    context,
    componentName,
    new Set(['aliases']),
    true,
    issuesById,
    componentIssueIds,
    diagnostics
  );
  // <lang><zh-CN>complete 加空 issueIds 表示该 runtime alias scope 已审计；unresolved 必须拥有非空直接原因。</zh-CN><en>Complete with empty issueIds means this runtime-alias scope was audited; unresolved requires a nonempty direct cause.</en></lang>
  if (!supportedInventoryStates.has(aliases.inventoryState)
    || (aliases.inventoryState === 'complete' && surfaceIssueIds.size !== 0)
    || (aliases.inventoryState === 'unresolved' && surfaceIssueIds.size === 0)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_INVENTORY_INVALID', `${context} has an invalid inventoryState or direct issue binding.`);
  }

  // <lang><zh-CN>为后续真实 runtime alias 保留固定事实 schema；rename recipe 不得冒充 alias。</zh-CN><en>A fixed factual schema is reserved for future real runtime aliases; rename recipes cannot masquerade as aliases.</en></lang>
  const aliasKeys = [];
  // <lang><zh-CN>逐项建立 scope:alias 主键并校验公开 evidence，不读取 evidence 中的任何路径。</zh-CN><en>Build each scope:alias key and validate public evidence without opening any path found in evidence.</en></lang>
  for (const alias of aliases.items) {
    // <lang><zh-CN>alias record 精确分离 scope、别名、目标与证据，禁止附带执行或迁移字段。</zh-CN><en>The alias record precisely separates scope, alias, target, and evidence and forbids execution or migration fields.</en></lang>
    const aliasFields = ['scope', 'alias', 'target', 'evidence'];
    // <lang><zh-CN>坏 alias 外壳不进入主键序列，其他条目继续校验。</zh-CN><en>A malformed alias envelope never enters the key sequence while other entries continue validation.</en></lang>
    if (!validateExactFields(alias, new Set(aliasFields), aliasFields, `${context} item`, diagnostics)) continue;
    // <lang><zh-CN>scope、alias 与 target 必须同时有效，避免形成不可引用的 runtime alias。</zh-CN><en>Scope, alias, and target must all be valid to avoid an unreferenceable runtime alias.</en></lang>
    if (!['component', 'prop', 'event', 'slot', 'imperative', 'value'].includes(alias.scope)
      || !isNonemptyString(alias.alias) || !isNonemptyString(alias.target)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_ALIAS_INVALID', `${context} item has an invalid scope, alias, or target.`);
    }
    // <lang><zh-CN>evidence 是已声明字符串清单；空数组可表示没有额外证据路径，但仍需稳定顺序。</zh-CN><en>Evidence is a declared string list; an empty array may mean no additional evidence paths while still retaining stable ordering.</en></lang>
    validateStringArray(alias.evidence, `${context} item evidence`, diagnostics, true);
    // <lang><zh-CN>主键保留原始 scope/alias 身份，只用于重复和顺序检查。</zh-CN><en>The key preserves original scope/alias identity and serves only duplicate and ordering checks.</en></lang>
    aliasKeys.push(`${alias.scope}:${alias.alias}`);
  }
  // <lang><zh-CN>alias 主键必须唯一且代码点排序，使同一别名不会获得两个冲突 target。</zh-CN><en>Alias keys must be unique and code-point sorted so one alias cannot acquire two conflicting targets.</en></lang>
  if (new Set(aliasKeys).size !== aliasKeys.length || !isCodePointSorted(aliasKeys)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_VALUE_ORDER_INVALID', `${context}.items must be unique and code-point sorted.`);
  }
}

/**
 * @lang zh-CN 复核 parser-owned issue 只被当前组件的一个 API/alias surface 直接引用，防止一个模糊解析失败跨能力面兜底。
 * @lang en Verifies that a parser-owned issue is directly referenced by only one API or alias surface of the current component, preventing one vague parse failure from covering multiple capability surfaces.
 * @param {object} component <lang><zh-CN>当前组件 record。</zh-CN><en>Current component record.</en></lang>
 * @param {Map<string, object>} issuesById <lang><zh-CN>issue registry。</zh-CN><en>Issue registry.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function validateParserIssueSurfaceUniqueness(component, issuesById, diagnostics) {
  // <lang><zh-CN>Map 只记录 parser issue 第一次出现的 surface，不复制 issue 正文或修改输入。</zh-CN><en>The Map records only the first surface of each parser issue without copying issue prose or mutating input.</en></lang>
  const firstSurfaceByIssueId = new Map();
  // <lang><zh-CN>固定五个 surface 与直接 issueIds envelope 对齐；types 不接受 static-parser 例外，因此不进入遍历。</zh-CN><en>The fixed five surfaces align with direct issue-ID envelopes; types does not allow the static-parser exception and therefore is excluded.</en></lang>
  for (const surface of ['props', 'events', 'slots', 'imperativeApis', 'aliases']) {
    // <lang><zh-CN>坏 envelope 留给各自 schema validator；这里只检查能够安全枚举的直接引用。</zh-CN><en>Malformed envelopes remain with their schema validators; this pass inspects only safely enumerable direct references.</en></lang>
    const issueIds = Array.isArray(component[surface]?.issueIds) ? component[surface].issueIds : [];
    // <lang><zh-CN>逐个直接 issue ID 检查 parser scope 与跨 surface 复用。</zh-CN><en>Inspect every direct issue ID for parser scope and cross-surface reuse.</en></lang>
    for (const issueId of issueIds) {
      // <lang><zh-CN>只有 registry 中明确标记 static-parser 的 issue 受“不跨 surface”约束；surface-specific issue 由各容器 owner 门禁处理。</zh-CN><en>Only issues explicitly marked static-parser in the registry use the no-cross-surface gate; surface-specific issues are handled by each container's ownership gate.</en></lang>
      if (issuesById.get(issueId)?.scope !== parserOwnedIssueScope) continue;
      // <lang><zh-CN>第一次引用建立唯一归属；第二个不同 surface 立即产生结构诊断。</zh-CN><en>The first reference establishes unique ownership; a second distinct surface immediately produces a structural diagnostic.</en></lang>
      const firstSurface = firstSurfaceByIssueId.get(issueId);
      // <lang><zh-CN>只有跨不同 surface 的第二次出现失败；同数组重复由字符串数组门禁单独处理。</zh-CN><en>Only a second occurrence on a different surface fails here; duplicates in one array are handled by the string-array gate.</en></lang>
      if (firstSurface && firstSurface !== surface) {
        addDiagnostic(diagnostics, 'API_COMPATIBILITY_ISSUE_REFERENCE_INVALID', `API compatibility component ${component.name} must not reuse parser-owned issue ${issueId} across ${firstSurface} and ${surface}.`);
      } else if (!firstSurface) {
        firstSurfaceByIssueId.set(issueId, surface);
      }
    }
  }
}

/**
 * @lang zh-CN 校验 easycom、types 与平台三条独立交付/迁移维度。
 * @lang en Validates the three independent delivery and migration dimensions for easycom, types, and platform.
 * @param {object} component <lang><zh-CN>当前组件 record。</zh-CN><en>Current component record.</en></lang>
 * @param {string} profile <lang><zh-CN>矩阵 profile。</zh-CN><en>Matrix profile.</en></lang>
 * @param {Map<string, object>} issuesById <lang><zh-CN>顶层 issue registry。</zh-CN><en>Top-level issue registry.</en></lang>
 * @param {Set<string>} componentIssueIds <lang><zh-CN>当前组件 issue 引用。</zh-CN><en>Current component issue references.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function validateDeliveryDimensions(component, profile, issuesById, componentIssueIds, diagnostics) {
  // <lang><zh-CN>三个交付维度共享公开组件上下文，但各自维持独立状态与迁移结论。</zh-CN><en>The three delivery dimensions share one public component context while retaining independent states and migration conclusions.</en></lang>
  const context = `API compatibility component ${component.name}`;

  // <lang><zh-CN>easycom 必须分别陈述 repository fixture、package 交付与迁移结论，不能由同名目录推断 package contract。</zh-CN><en>Easycom must separately state repository-fixture delivery, package delivery, and migration; a same-name directory cannot imply a package contract.</en></lang>
  const deliveryFields = ['upstream', 'hia', 'migration'];
  // <lang><zh-CN>easycom 总外壳成立后才分别读取上游、本地与迁移子记录。</zh-CN><en>Upstream, local, and migration subrecords are read only after the easycom envelope is valid.</en></lang>
  if (validateExactFields(component.easycom, new Set(deliveryFields), deliveryFields, `${context}.easycom`, diagnostics)) {
    // <lang><zh-CN>上游只在 demo repository fixture 中交付，package 仍要求消费者配置；basis 是说明而非可执行发现规则。</zh-CN><en>Upstream delivers only a demo repository fixture while the package still requires consumer configuration; basis is explanatory metadata rather than an executable discovery rule.</en></lang>
    const upstreamFields = ['repositoryFixtureStatus', 'packageStatus', 'basis'];
    // <lang><zh-CN>上游 easycom 三字段必须与 repository/package 分层语义一致。</zh-CN><en>The three upstream easycom fields must agree with repository/package split semantics.</en></lang>
    if (!validateExactFields(component.easycom.upstream, new Set(upstreamFields), upstreamFields, `${context}.easycom.upstream`, diagnostics)
      || component.easycom.upstream?.repositoryFixtureStatus !== 'delivered'
      || component.easycom.upstream?.packageStatus !== 'consumer-configuration-required'
      || component.easycom.upstream?.basis !== 'validated-demo-pages-json') {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_DELIVERY_INVALID', `${context}.easycom.upstream has invalid delivery metadata.`);
    }
    // <lang><zh-CN>HIA 在当前 profile 提供 repository fixture，但 package 尚未交付；两层状态不能被合并为笼统 delivered。</zh-CN><en>HIA provides a repository fixture for the active profile while package delivery remains absent; the two layers cannot be collapsed into a generic delivered state.</en></lang>
    const hiaEasycomFields = ['repositoryFixtureStatus', 'packageStatus', 'profile'];
    // <lang><zh-CN>HIA easycom 三字段必须同时匹配当前 profile 与交付分层。</zh-CN><en>The three HIA easycom fields must simultaneously match the active profile and delivery split.</en></lang>
    if (!validateExactFields(component.easycom.hia, new Set(hiaEasycomFields), hiaEasycomFields, `${context}.easycom.hia`, diagnostics)
      || component.easycom.hia?.repositoryFixtureStatus !== 'delivered'
      || component.easycom.hia?.packageStatus !== 'not-delivered'
      || component.easycom.hia?.profile !== profile) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_DELIVERY_INVALID', `${context}.easycom.hia has invalid repository-fixture or package delivery metadata.`);
    }
    // <lang><zh-CN>unsupported 只描述 package-stable/public easycom contract 尚未交付，不否定仓内 fixture 已可用。</zh-CN><en>Unsupported describes only the missing package-stable public easycom contract and does not negate the usable repository fixture.</en></lang>
    validateApiMigration(component.easycom.migration, [], `${context}.easycom.migration`, diagnostics);
    // <lang><zh-CN>当前 package 未交付事实必须使用稳定 unsupported reason，不接受任意迁移文字。</zh-CN><en>The current missing-package fact must use the stable unsupported reason and cannot accept arbitrary migration prose.</en></lang>
    if (component.easycom.migration?.disposition !== 'unsupported'
      || component.easycom.migration?.reasonCode !== 'HIA_PACKAGE_EASYCOM_NOT_DELIVERED') {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_DELIVERY_INVALID', `${context}.easycom.migration must describe the not-delivered HIA package contract.`);
    }
  }

  // <lang><zh-CN>types 与 easycom 分开；available 上游条目必须携带安全 path/digest，not-declared 不得携带伪路径。</zh-CN><en>Types remain separate from easycom; an available upstream entry must carry a safe path and digest while not-declared may carry no invented path.</en></lang>
  const typeDeliveryFields = [...deliveryFields, 'issueIds'];
  // <lang><zh-CN>types 外壳成立后才执行 issue、上下游状态与迁移的交叉检查。</zh-CN><en>Issue, upstream/local status, and migration cross-checks run only after the types envelope is valid.</en></lang>
  if (validateExactFields(component.types, new Set(typeDeliveryFields), typeDeliveryFields, `${context}.types`, diagnostics)) {
    // <lang><zh-CN>类型交付问题必须直接归属当前组件且 scope 为 component-types；package/global、其他 surface 以及 static-parser 都不能为 types 兜底。</zh-CN><en>Type-delivery issues must directly own the current component with component-types scope; package/global, other-surface, and static-parser issues cannot justify types.</en></lang>
    validateDirectIssueIds(
      component.types.issueIds,
      `${context}.types`,
      component.name,
      new Set(['component-types']),
      false,
      issuesById,
      componentIssueIds,
      diagnostics
    );
    // <lang><zh-CN>上游类型状态决定其精确字段集合：available 必须携带 path/digest，not-declared 不得伪造文件信息。</zh-CN><en>Upstream type status selects its exact field set: available requires path/digest while not-declared cannot invent file metadata.</en></lang>
    const upstreamStatus = component.types.upstream?.status;
    // <lang><zh-CN>状态到字段集合的映射只控制 schema；Tool 仍不会打开 available 路径。</zh-CN><en>The status-to-field-set mapping controls schema only; the Tool still never opens an available path.</en></lang>
    const upstreamTypeFields = upstreamStatus === 'available' ? ['status', 'path', 'digest'] : ['status'];
    // <lang><zh-CN>状态、字段集合与 available path/digest 必须共同合法。</zh-CN><en>Status, field set, and any available path/digest must be valid together.</en></lang>
    if (!validateExactFields(component.types.upstream, new Set(upstreamTypeFields), upstreamTypeFields, `${context}.types.upstream`, diagnostics)
      || !supportedTypeDeliveryStatuses.has(upstreamStatus)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_DELIVERY_INVALID', `${context}.types.upstream has invalid status or fields.`);
    } else if (upstreamStatus === 'available'
      && (!isSafeRelativePath(component.types.upstream.path) || !isSha256Digest(component.types.upstream.digest))) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_DELIVERY_INVALID', `${context}.types.upstream has an invalid path or digest.`);
    }
    // <lang><zh-CN>types.upstream 是 component.upstream.types 的公开重复投影，必须字段和值完全一致，不能分别指向两个安全但不同的文件。</zh-CN><en>Types.upstream is the public duplicate projection of component.upstream.types and must match every field and value so the two records cannot point to different but individually safe files.</en></lang>
    if (!areFlatRecordsEqual(component.types.upstream, component.upstream?.types)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_DELIVERY_INVALID', `${context}.types.upstream must exactly match component.upstream.types.`);
    }
    // <lang><zh-CN>HIA type 交付状态单独陈述，不能因为上游有声明就推断本地 `.d.ts` 已交付。</zh-CN><en>HIA type delivery is stated separately and cannot be inferred merely because upstream declarations exist.</en></lang>
    if (!validateExactFields(component.types.hia, new Set(['status']), ['status'], `${context}.types.hia`, diagnostics)
      || !supportedTypeDeliveryStatuses.has(component.types.hia?.status)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_DELIVERY_INVALID', `${context}.types.hia has an invalid status.`);
    }
    // <lang><zh-CN>类型迁移结论以无 target 的交付事实校验，不把类型路径当作 API target。</zh-CN><en>Type migration is validated as a targetless delivery fact and never treats a type path as an API target.</en></lang>
    validateApiMigration(component.types.migration, [], `${context}.types.migration`, diagnostics);
    // <lang><zh-CN>本地状态与稳定 reason 必须成对：已交付精确 HIA contract 仍因未完成上游 type parity 而 unsupported，未交付则使用独立缺失原因。</zh-CN><en>The local status and stable reason must agree: a delivered precise HIA contract remains unsupported because upstream type parity is unassessed, while an absent contract uses the separate missing-delivery reason.</en></lang>
    const expectedTypeReason = component.types.hia?.status === 'delivered'
      ? 'HIA_COMPONENT_TYPE_PARITY_NOT_ASSESSED'
      : 'HIA_COMPONENT_TYPES_NOT_DELIVERED';

    if (component.types.migration?.disposition !== 'unsupported'
      || component.types.migration?.reasonCode !== expectedTypeReason) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_DELIVERY_INVALID', `${context}.types.migration must match the HIA type-delivery status.`);
    }
  }

  // <lang><zh-CN>平台结论只限声明的 active profile；上游声明数组绝不升级为 HIA 验证或设备证据。</zh-CN><en>Platform conclusions remain limited to the declared active profile; an upstream declaration array never becomes HIA validation or device evidence.</en></lang>
  const platformFields = ['profile', 'upstream', 'hia', 'migration'];
  // <lang><zh-CN>platform 外壳无效时停止该交付维度，避免读取不受控证据字段。</zh-CN><en>Stop the platform dimension when its envelope is invalid so uncontrolled evidence fields are not read.</en></lang>
  if (!validateExactFields(component.platforms, new Set(platformFields), platformFields, `${context}.platforms`, diagnostics)) return;
  // <lang><zh-CN>组件平台 profile 必须与矩阵 profile 同源，防止一条记录混入其他运行环境的结论。</zh-CN><en>The component platform profile must match the matrix profile so one record cannot mix conclusions from another runtime environment.</en></lang>
  if (component.platforms.profile !== profile) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_PLATFORM_INVALID', `${context}.platforms.profile must match the matrix profile.`);
  }
  // <lang><zh-CN>上游 declared 数组与其 profileStatus 构成只读声明事实，不等于 HIA 测试证据。</zh-CN><en>The upstream declared array and profileStatus form a read-only declaration fact and do not constitute HIA test evidence.</en></lang>
  const upstreamPlatformFields = ['declared', 'profileStatus', 'sourceConditionStatus'];
  // <lang><zh-CN>规范上游平台清单仅用于形状/顺序复核；null 表示外壳无效而非“不支持”。</zh-CN><en>The normalized upstream platform list serves shape and order checks only; null means an invalid envelope rather than “unsupported.”</en></lang>
  const upstreamPlatforms = validateExactFields(component.platforms.upstream, new Set(upstreamPlatformFields), upstreamPlatformFields, `${context}.platforms.upstream`, diagnostics)
    ? validateStringArray(component.platforms.upstream.declared, `${context}.platforms.upstream.declared`, diagnostics)
    : null;
  // <lang><zh-CN>只有 declared 可描述此上游字段；validated/runtime-verified 等更强术语会虚增证据等级。</zh-CN><en>Only declared may describe this upstream field; stronger terms such as validated or runtime-verified would overstate evidence.</en></lang>
  if (component.platforms.upstream?.profileStatus !== 'declared'
    || component.platforms.upstream?.sourceConditionStatus !== 'not-assessed') {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_PLATFORM_INVALID', `${context}.platforms.upstream must declare the profile without claiming source-condition assessment.`);
  }
  // <lang><zh-CN>HIA 平台字段只陈述比较范围、未评估证据与未评估源码条件，明确不再使用 validated 形状。</zh-CN><en>The HIA platform fields state only comparison scope, unassessed evidence, and unassessed source conditions, explicitly avoiding a validated shape.</en></lang>
  const hiaPlatformFields = ['comparisonScope', 'evidenceStatus', 'sourceConditionStatus'];
  // <lang><zh-CN>comparisonScope 是本矩阵允许比较的 profile 清单，不是设备、编译器或运行时通过清单。</zh-CN><en>comparisonScope lists profiles this matrix may compare and is not a device, compiler, or runtime pass list.</en></lang>
  const hiaComparisonScope = validateExactFields(component.platforms.hia, new Set(hiaPlatformFields), hiaPlatformFields, `${context}.platforms.hia`, diagnostics)
    ? validateStringArray(component.platforms.hia.comparisonScope, `${context}.platforms.hia.comparisonScope`, diagnostics)
    : null;
  // <lang><zh-CN>比较范围必须精确为当前 profile；evidence/source conditions 均固定 not-assessed，避免当前组件集合被误报为已验证或已盘点条件编译。</zh-CN><en>Comparison scope must be exactly the active profile; evidence and source conditions both remain not-assessed so the current component set is not misreported as validated or source-condition-audited.</en></lang>
  if (component.platforms.hia?.evidenceStatus !== 'not-assessed'
    || component.platforms.hia?.sourceConditionStatus !== 'not-assessed'
    || (hiaComparisonScope && (hiaComparisonScope.length !== 1 || hiaComparisonScope[0] !== profile))) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_PLATFORM_INVALID', `${context}.platforms.hia must declare only the active comparison scope without claiming evidence or source-condition assessment.`);
  }
  // <lang><zh-CN>平台迁移必须保持 unsupported，因为每组件 `#ifdef`/源码行为尚未评估；comparisonScope 不能升级为 migration target。</zh-CN><en>Platform migration must remain unsupported because per-component `#ifdef` and source behavior are unassessed; comparisonScope cannot be promoted into a migration target.</en></lang>
  validateApiMigration(component.platforms.migration, [], `${context}.platforms.migration`, diagnostics);
  // <lang><zh-CN>稳定 reasonCode 必须明确披露 source-condition 未评估，不接受笼统 unsupported。</zh-CN><en>The stable reasonCode must disclose unassessed source conditions rather than a generic unsupported claim.</en></lang>
  if (component.platforms.migration?.disposition !== 'unsupported'
    || component.platforms.migration?.reasonCode !== 'PLATFORM_SOURCE_CONDITIONS_NOT_ASSESSED') {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_PLATFORM_INVALID', `${context}.platforms.migration must disclose unassessed platform source conditions.`);
  }
  // <lang><zh-CN>显式引用变量保留上游平台数组的校验结果；不从其内容推导 HIA 支持。</zh-CN><en>The explicit reference retains validation of the upstream platform array; no HIA support is derived from its content.</en></lang>
  void upstreamPlatforms;
}

/**
 * @lang zh-CN 校验组件级 `api-items-only` 汇总与四个 API container 的现场 item/inventory 计数一致。
 * @lang en Validates that the component-level `api-items-only` summary matches live item and inventory counts across the four API containers.
 * @param {unknown} migration <lang><zh-CN>组件 migration summary。</zh-CN><en>Component migration summary.</en></lang>
 * @param {object} observed <lang><zh-CN>现场计数。</zh-CN><en>Observed counts.</en></lang>
 * @param {string} componentName <lang><zh-CN>组件名。</zh-CN><en>Component name.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function validateComponentMigration(migration, observed, componentName, diagnostics) {
  // <lang><zh-CN>公开上下文定位组件级汇总，与单个 API item migration 保持区分。</zh-CN><en>The public context identifies the component summary and distinguishes it from individual API-item migrations.</en></lang>
  const context = `API compatibility component ${componentName}.migration`;
  // <lang><zh-CN>组件汇总只允许固定 scope、总 disposition、reasonCode 与四项现场 counts，不接收预生成详情。</zh-CN><en>The component summary allows only a fixed scope, overall disposition, reasonCode, and four live counts, not pre-generated detail.</en></lang>
  const fields = ['scope', 'disposition', 'reasonCode', 'counts'];
  // <lang><zh-CN>summary 外壳无效时停止该汇总，避免读取任意 counts。</zh-CN><en>Stop summary validation when its envelope is invalid so arbitrary counts are not read.</en></lang>
  if (!validateExactFields(migration, new Set(fields), fields, context, diagnostics)) return;
  // <lang><zh-CN>api-items-only 明确排除 aliases/easycom/types/platforms，避免该汇总被误读为组件总体兼容结论。</zh-CN><en>Api-items-only explicitly excludes aliases, easycom, types, and platforms so the summary cannot be mistaken for overall component compatibility.</en></lang>
  if (migration.scope !== 'api-items-only') {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_MIGRATION_INVALID', `${context}.scope must be api-items-only.`);
  }
  // <lang><zh-CN>总 disposition 与 reasonCode 仍须受控；大量 unsupported 是兼容事实，不等于 schema 错误。</zh-CN><en>The overall disposition and reasonCode remain controlled; many unsupported facts are compatibility metadata rather than schema errors.</en></lang>
  if (!supportedDispositions.has(migration.disposition) || !isNonemptyString(migration.reasonCode)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_MIGRATION_INVALID', `${context} has an invalid disposition or reasonCode.`);
  }
  // <lang><zh-CN>四个固定计数字段只覆盖 API item disposition 与 unresolved API inventory 数，禁止额外总数或交付维度自报。</zh-CN><en>Four fixed count fields cover only API-item dispositions and unresolved API inventories, forbidding an extra total or delivery-dimension count.</en></lang>
  const countFields = ['compatible', 'mapped', 'unsupported', 'unresolved'];
  // <lang><zh-CN>counts 外壳无效时不能做逐项数值或现场相等检查。</zh-CN><en>An invalid counts envelope cannot support per-field numeric or live-equality checks.</en></lang>
  if (!validateExactFields(migration.counts, new Set(countFields), countFields, `${context}.counts`, diagnostics)) return;
  // <lang><zh-CN>逐字段要求非负整数，避免字符串、负数或小数进入公开统计。</zh-CN><en>Require a nonnegative integer per field so strings, negative numbers, and fractions cannot enter public statistics.</en></lang>
  for (const field of countFields) {
    // <lang><zh-CN>每个计数字段独立失败，使调用方可一次修复全部坏值。</zh-CN><en>Each count field fails independently so callers can repair every bad value in one pass.</en></lang>
    if (!Number.isInteger(migration.counts[field]) || migration.counts[field] < 0) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_SUMMARY_INVALID', `${context}.counts.${field} must be a non-negative integer.`);
    }
  }
  // <lang><zh-CN>最后将自报 counts 与现场遍历结果逐项相等，任何 unsupported/unresolved 仍只按其本来类别计数。</zh-CN><en>Finally compare every reported count with live traversal results; unsupported and unresolved remain counted only in their own categories.</en></lang>
  if (migration.counts.compatible !== observed.compatible || migration.counts.mapped !== observed.mapped
    || migration.counts.unsupported !== observed.unsupported || migration.counts.unresolved !== observed.unresolved) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_SUMMARY_INVALID', `${context}.counts must match the declared API items and unresolved inventories.`);
  }
  // <lang><zh-CN>总迁移结论由现场 API item/inventory 计数确定；只要存在 unsupported 或 unresolved 就不能声明 mapped/compatible。</zh-CN><en>The overall migration conclusion is determined by live API-item and inventory counts; any unsupported or unresolved member prevents a mapped or compatible claim.</en></lang>
  const hasUnsupportedSurfaceMember = observed.unsupported > 0 || observed.unresolved > 0;
  // <lang><zh-CN>无 unsupported/unresolved 时当前 v1 仍只声明 mapped + semantic review，不把名称映射升级为语义 compatible。</zh-CN><en>Without unsupported or unresolved members, v1 still declares mapped plus semantic review and never upgrades name mapping into semantic compatibility.</en></lang>
  const expectedDisposition = hasUnsupportedSurfaceMember ? 'unsupported' : 'mapped';
  // <lang><zh-CN>reasonCode 与 disposition 同源派生，禁止任意非空文本冒充稳定汇总结论。</zh-CN><en>ReasonCode is derived from the same disposition rule, so arbitrary nonempty text cannot masquerade as a stable summary conclusion.</en></lang>
  const expectedReasonCode = hasUnsupportedSurfaceMember
    ? 'API_SURFACE_HAS_UNSUPPORTED_MEMBERS'
    : 'API_SURFACE_REQUIRES_SEMANTIC_REVIEW';
  // <lang><zh-CN>汇总声明必须与现场派生的 disposition/reason 同时一致。</zh-CN><en>The summary declaration must match both the live-derived disposition and reason.</en></lang>
  if (migration.disposition !== expectedDisposition || migration.reasonCode !== expectedReasonCode) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_SUMMARY_INVALID', `${context} disposition and reasonCode must match the declared API-item outcomes.`);
  }
}

/**
 * @lang zh-CN 统计四个 API container 内的迁移 dispositions，不将 unsupported/unresolved 转为失败。
 * @lang en Counts migration dispositions across the four API containers without turning unsupported or unresolved into failures.
 * @param {object} component <lang><zh-CN>当前组件。</zh-CN><en>Current component.</en></lang>
 * @returns {{compatible:number,mapped:number,unsupported:number,unresolved:number}} <lang><zh-CN>现场汇总。</zh-CN><en>Live summary.</en></lang>
 */
function countComponentMigration(component) {
  // <lang><zh-CN>计数器只依据受验证 container 当前声明；不信任 manifest 自报 counts。</zh-CN><en>Counters use only currently declared validated containers and never trust manifest-reported counts.</en></lang>
  const counts = { compatible: 0, mapped: 0, unsupported: 0, unresolved: 0 };
  // <lang><zh-CN>按固定四维遍历，避免未来额外字段被无意纳入当前公开汇总。</zh-CN><en>Traverse the fixed four dimensions so future extra fields cannot enter the current public summary accidentally.</en></lang>
  for (const dimension of ['props', 'events', 'slots', 'imperativeApis']) {
    // <lang><zh-CN>当前 container 是只读引用；函数只更新本地 counts，不修改组件 record。</zh-CN><en>The current container is a read-only reference; the function updates only local counts and never mutates the component record.</en></lang>
    const container = component[dimension];
    // <lang><zh-CN>坏 container 已由 schema validator 诊断，此处跳过以避免派生统计抛错或制造假数量。</zh-CN><en>A malformed container is already diagnosed by the schema validator and is skipped here to avoid throwing or inventing derived counts.</en></lang>
    if (!isRecord(container) || !Array.isArray(container.items)) continue;
    // <lang><zh-CN>unresolved 统计 inventory 数而非 item 数，使缺失能力面不会按空数组错误归零。</zh-CN><en>Unresolved counts inventories rather than items so an unknown capability surface is not incorrectly reduced to zero by an empty array.</en></lang>
    if (container.inventoryState === 'unresolved') counts.unresolved += 1;
    // <lang><zh-CN>逐 item 读取已经声明的 disposition；不从 target 数量或 reason 文本推断类别。</zh-CN><en>Read the declared disposition from each item without inferring a category from target count or reason text.</en></lang>
    for (const item of container.items) {
      // <lang><zh-CN>可选链允许坏 item 留给结构诊断处理，同时保持汇总函数无异常。</zh-CN><en>Optional chaining leaves malformed items to structural diagnostics while keeping the summary function exception-free.</en></lang>
      const disposition = item?.migration?.disposition;
      // <lang><zh-CN>只累计已知计数字段；unresolved 是 container 状态，不接受伪造为 item disposition。</zh-CN><en>Increment only known count fields; unresolved is a container state and cannot be forged as an item disposition.</en></lang>
      if (Object.hasOwn(counts, disposition) && disposition !== 'unresolved') counts[disposition] += 1;
    }
  }
  // <lang><zh-CN>返回现场派生快照供同组件 summary 对比；调用方不能据此改写 manifest。</zh-CN><en>Return the live derived snapshot for same-component summary comparison; callers cannot use it to rewrite the manifest.</en></lang>
  return counts;
}

/**
 * @lang zh-CN 校验 v2 独立 public composable service inventory；当前两个入口只允许映射到已审计的显式 scope/host 等价能力，并继续独立于 1,740 项组件 API。
 * @lang en Validates the separate v2 public-composable-service inventory; the current two entries may map only to their reviewed explicit scope/host equivalents and remain separate from the 1,740 component APIs.
 * @param {unknown} services <lang><zh-CN>service inventory container。</zh-CN><en>Service-inventory container.</en></lang>
 * @param {string} componentName <lang><zh-CN>拥有 service 的比较组件。</zh-CN><en>Comparison component owning the service.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {number} <lang><zh-CN>结构中声明的 service item 数。</zh-CN><en>Number of service items declared by the structure.</en></lang>
 */
function validateServices(services, componentName, diagnostics) {
  // <lang><zh-CN>诊断上下文只含公开组件名；不泄露 service 源码或主机路径。</zh-CN><en>The diagnostic context contains only the public component name and leaks neither service source nor host paths.</en></lang>
  const context = `API compatibility component ${componentName}.services`;
  // <lang><zh-CN>service inventory 使用固定四字段 envelope，拒绝未来未经审计的执行或发现配置。</zh-CN><en>The service inventory uses a fixed four-field envelope and rejects future unaudited execution or discovery configuration.</en></lang>
  const containerFields = ['scope', 'inventoryState', 'items', 'issueIds'];

  // <lang><zh-CN>容器形状或 items 数组无效时停止枚举，避免派生异常掩盖主诊断。</zh-CN><en>Stop enumeration when the container shape or items array is invalid so a derived exception cannot hide the primary diagnostic.</en></lang>
  if (!validateExactFields(services, new Set(containerFields), containerFields, context, diagnostics) || !Array.isArray(services.items)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_SERVICE_INVENTORY_INVALID', `${context} must be a complete service inventory.`);
    return 0;
  }
  // <lang><zh-CN>当前 service inventory 只陈述已完成且无 parser issue 的公开 composable 入口。</zh-CN><en>The current service inventory declares only complete public composable entrypoints with no parser issue.</en></lang>
  if (services.scope !== 'public-composable-services' || services.inventoryState !== 'complete'
    || !Array.isArray(services.issueIds) || services.issueIds.length !== 0) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_SERVICE_INVENTORY_INVALID', `${context} must use public-composable-services, complete, and no issues.`);
  }

  // <lang><zh-CN>合法 ID 单独收集，以便在完整枚举后统一验证重复与跨 locale 顺序。</zh-CN><en>Collect valid IDs separately so duplicate and cross-locale ordering checks run after complete enumeration.</en></lang>
  const itemIds = [];

  // <lang><zh-CN>逐 service 聚合所有诊断；一个坏 entry 不会阻断同容器其他事实。</zh-CN><en>Accumulate diagnostics service by service; one malformed entry does not hide other facts in the container.</en></lang>
  for (const item of services.items) {
    // <lang><zh-CN>单项上下文保持稳定且不回显原始 JSON。</zh-CN><en>The per-item context remains stable and never echoes raw JSON.</en></lang>
    const itemContext = `${context} item`;
    // <lang><zh-CN>service item 只允许身份、迁移结论与完整语义三类字段。</zh-CN><en>A service item allows only identity, migration disposition, and complete semantics.</en></lang>
    const itemFields = ['id', 'migration', 'semantics'];

    // <lang><zh-CN>坏 item 外壳跳过当前项的嵌套读取，同时保留已产生的字段诊断。</zh-CN><en>A malformed item envelope skips nested reads for that item while retaining its field diagnostics.</en></lang>
    if (!validateExactFields(item, new Set(itemFields), itemFields, itemContext, diagnostics)) continue;
    // <lang><zh-CN>规范 ID 只去除外围空白，不改写公开 entry 名。</zh-CN><en>The canonical ID removes outer whitespace only and does not rewrite the public entry name.</en></lang>
    const itemId = isNonemptyString(item.id) ? item.id.trim() : '';

    // <lang><zh-CN>ID 必须采用 service:identifier 形式；只有合法 ID 才进入排序集合。</zh-CN><en>An ID must use the service:identifier form; only a valid ID enters the ordering set.</en></lang>
    if (!/^service:[A-Za-z_$][\w$]*$/u.test(itemId)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_SERVICE_INVENTORY_INVALID', `${itemContext}.id must use service:<entry>.`);
    } else {
      // <lang><zh-CN>只有合法 service ID 才进入最终唯一性与排序集合。</zh-CN><en>Only a valid service ID enters the final uniqueness and ordering set.</en></lang>
      itemIds.push(itemId);
    }
    // <lang><zh-CN>公开 owner/ID 组合只允许两个冻结入口；该固定映射防止 manifest 自行声明第三个 service 或把 target 指向任意同名字符串。</zh-CN><en>The public owner/ID pair permits only the two frozen entries; this fixed mapping prevents a manifest from declaring a third service or targeting an arbitrary same-named string.</en></lang>
    const expectedTarget = supportedServiceTargets.get(`${componentName}/${itemId}`);
    // <lang><zh-CN>复用统一 migration validator；只有冻结 target 可成为 mapped 目标，未知 service 使用空 target 集并同时收到 inventory 诊断。</zh-CN><en>Reuse the common migration validator; only the frozen target may be mapped, while an unknown service uses an empty target set and also receives an inventory diagnostic.</en></lang>
    validateApiMigration(item.migration, expectedTarget ? [expectedTarget] : [], `${itemContext}.migration`, diagnostics);
    // <lang><zh-CN>通用迁移形状合法仍不够；service 必须使用保守的同名异形映射且 target 精确命中公开 composable。</zh-CN><en>A valid common migration shape is insufficient; a service must use the conservative same-name/different-shape mapping and target the exact public composable.</en></lang>
    if (!expectedTarget || item.migration?.disposition !== 'mapped'
      || item.migration?.reasonCode !== 'SAME_NAME_DIFFERENT_SHAPE'
      || item.migration?.target !== expectedTarget) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_SERVICE_INVENTORY_INVALID', `${itemContext}.migration must map the reviewed explicit-scope HIA service target.`);
    }
    // <lang><zh-CN>service 语义必须完整审阅上下游交付面；runtime-tested mapped 仍不等于无需迁移的 compatible。</zh-CN><en>Service semantics must completely review both delivered sides; runtime-tested mapped still does not mean no-migration compatibility.</en></lang>
    validateItemSemantics(item.semantics, {
      kind: 'service',
      disposition: 'mapped',
      hiaDelivered: true
    }, `${itemContext}.semantics`, diagnostics);

    // <lang><zh-CN>语义 entry 与结构 ID 必须同源，防止复用另一 composable 的审阅事实。</zh-CN><en>The semantic entry and structural ID must have the same identity so review facts from another composable cannot be reused.</en></lang>
    if (item.semantics?.upstream?.entry && itemId !== `service:${item.semantics.upstream.entry}`) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_SERVICE_INVENTORY_INVALID', `${itemContext}.id must match semantics.upstream.entry.`);
    }
    // <lang><zh-CN>HIA semantic entry 也必须与冻结 target 同源；仅修改 migration.target 或语义文字不能伪造另一项可交付服务。</zh-CN><en>The HIA semantic entry must share identity with the frozen target; changing only migration.target or semantic copy cannot fabricate another delivered service.</en></lang>
    if (expectedTarget && item.semantics?.hia?.entry !== expectedTarget) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_SERVICE_INVENTORY_INVALID', `${itemContext}.migration target must match semantics.hia.entry.`);
    }
  }

  // <lang><zh-CN>唯一性与代码点顺序在合法 ID 全部收集后统一核验。</zh-CN><en>Validate uniqueness and code-point order after all valid IDs have been collected.</en></lang>
  if (new Set(itemIds).size !== itemIds.length || !isCodePointSorted(itemIds)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_SERVICE_INVENTORY_INVALID', `${context} item ids must be unique and code-point sorted.`);
  }
  // <lang><zh-CN>返回声明 item 总数供顶层 provenance 现场复核，不把有效 ID 数冒充覆盖数。</zh-CN><en>Return the declared item count for top-level provenance verification rather than presenting the valid-ID count as coverage.</en></lang>
  return services.items.length;
}

/**
 * @lang zh-CN 校验单个比较组件 record 与上游组件根目录及本地 component manifest 的成员、source 和 contract 对齐。
 * @lang en Validates one comparison-component record against the upstream component root and membership, source, and contract in the local component manifest.
 * @param {unknown} component <lang><zh-CN>组件 record。</zh-CN><en>Component record.</en></lang>
 * @param {string} profile <lang><zh-CN>矩阵 profile。</zh-CN><en>Matrix profile.</en></lang>
 * @param {string | null} componentRoot <lang><zh-CN>已通过安全门禁的上游组件根路径。</zh-CN><en>Upstream component-root path after the safety gate.</en></lang>
 * @param {Map<string, object>} issuesById <lang><zh-CN>issue registry。</zh-CN><en>Issue registry.</en></lang>
 * @param {Map<string, object>} localComponents <lang><zh-CN>本地 component manifest 名称索引。</zh-CN><en>Local component-manifest index by name.</en></lang>
 * @param {number} schemaVersion <lang><zh-CN>矩阵 schema version。</zh-CN><en>Matrix schema version.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>诊断累积器。</zh-CN><en>Diagnostic accumulator.</en></lang>
 * @returns {string | null} <lang><zh-CN>组件名；形状无效时为 null。</zh-CN><en>Component name, or null for an invalid shape.</en></lang>
 */
function validateComponent(component, profile, componentRoot, issuesById, localComponents, schemaVersion, diagnostics) {
  // <lang><zh-CN>完整组件外壳先过字段白名单；失败时不读取 name 或任何嵌套 capability。</zh-CN><en>The complete component envelope passes the field allowlist first; a failure prevents reads of name or nested capabilities.</en></lang>
  const componentFields = schemaVersion === 2 ? allowedComponentFieldsV2 : allowedComponentFields;

  if (!validateExactFields(component, componentFields, [...componentFields], 'API compatibility component', diagnostics)) return null;
  // <lang><zh-CN>规范名称是组件内所有上下文、owner 和本地成员关联的稳定键，只去除外围空白。</zh-CN><en>The normalized name is the stable key for all component contexts, owners, and local membership linkage and removes outer whitespace only.</en></lang>
  const componentName = isNonemptyString(component.name) ? component.name.trim() : '';
  // <lang><zh-CN>组件名称与总体优先级必须先成立；空名称时继续读取嵌套数据会产生不可定位诊断。</zh-CN><en>Component name and overall priority must be established first; reading nested data with an empty name would create unlocatable diagnostics.</en></lang>
  if (!componentName || !supportedPriorities.has(component.priority)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_COMPONENT_INVALID', 'API compatibility component must declare a non-empty name and P0/P1/P2 priority.');
    return componentName || null;
  }

  // <lang><zh-CN>组件 issue 引用在任何 unresolved/default 校验之前解析，且只接受顶层已知 ID。</zh-CN><en>Component issue references are resolved before any unresolved or default validation and accept only top-level known IDs.</en></lang>
  const normalizedIssueIds = validateStringArray(component.issueIds, `API compatibility component ${componentName}.issueIds`, diagnostics, true) ?? [];
  // <lang><zh-CN>Set 提供当前组件的常数时间引用门禁；来源数组仍保留排序检查和公开输出顺序。</zh-CN><en>The Set provides constant-time reference gates for this component while the source array retains ordering validation and public output order.</en></lang>
  const componentIssueIds = new Set(normalizedIssueIds);
  // <lang><zh-CN>逐引用核对存在性与 owner，允许无 owner 的 package issue 保持全局事实。</zh-CN><en>Check existence and ownership for each reference while allowing ownerless package issues to remain global facts.</en></lang>
  for (const issueId of componentIssueIds) {
    // <lang><zh-CN>未知 ID 先产生单一引用诊断，避免随后读取 owner。</zh-CN><en>An unknown ID produces one reference diagnostic before any ownership read.</en></lang>
    if (!issuesById.has(issueId)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_ISSUE_REFERENCE_INVALID', `API compatibility component ${componentName} references unknown issue: ${issueId}.`);
    } else {
      // <lang><zh-CN>单组件或共享组件 issue 只能由其声明的所有者引用；全局 package issue 保持可选引用。</zh-CN><en>A singular or shared component issue may be referenced only by its declared owners; references to global package issues remain optional.</en></lang>
      const issue = issuesById.get(issueId);
      // <lang><zh-CN>显式 owner 与当前组件不匹配时拒绝引用；无 owner 的全局 issue 留给直接 surface 门禁排除。</zh-CN><en>An explicit owner mismatch rejects the reference, while ownerless global issues remain for direct-surface gates to exclude.</en></lang>
      if ((issue.component && issue.component !== componentName)
        || (Array.isArray(issue.components) && !issue.components.includes(componentName))) {
        addDiagnostic(diagnostics, 'API_COMPATIBILITY_ISSUE_REFERENCE_INVALID', `API compatibility component ${componentName} references an issue owned by another component: ${issueId}.`);
      }
    }
  }

  // <lang><zh-CN>当前组件的上游目录由已验证 component root 与公开名称派生；只用于 containment，不打开目录。</zh-CN><en>The current upstream component directory is derived from the validated component root and public name and is used only for containment without opening the directory.</en></lang>
  const upstreamComponentDirectory = componentRoot ? `${componentRoot}/${componentName}` : null;
  // <lang><zh-CN>上游 source/types/service 只作为 provenance；Tool 不打开这些路径。</zh-CN><en>Upstream source, types, and service exist only as provenance; the Tool never opens their paths.</en></lang>
  const upstreamFields = ['source', 'types', 'service'];
  // <lang><zh-CN>上游三字段外壳成立后才做 path/digest 与 containment 检查。</zh-CN><en>Path/digest and containment checks run only after the three-field upstream envelope is valid.</en></lang>
  if (validateExactFields(component.upstream, new Set(upstreamFields), upstreamFields, `API compatibility component ${componentName}.upstream`, diagnostics)) {
    // <lang><zh-CN>source 只校验 path/digest 声明；不会打开冻结 checkout 或比较 SFC 正文。</zh-CN><en>Source validation checks only declared path/digest and never opens the frozen checkout or compares SFC bodies.</en></lang>
    validatePathDigestRecord(component.upstream.source, `API compatibility component ${componentName}.upstream.source`, diagnostics);
    // <lang><zh-CN>source 必须留在当前组件目录且以 `.vue` 结尾；文件名可随未来受控目录演进，不强制等于组件名。</zh-CN><en>Source must remain inside the current component directory and end in `.vue`; the filename may evolve with a future controlled layout and need not equal the component name.</en></lang>
    const upstreamSourcePath = isSafeRelativePath(component.upstream.source?.path)
      ? normalizeRelativePath(component.upstream.source.path)
      : null;
    // <lang><zh-CN>只有组件根与安全 source 路径均成立时才比较 containment 与扩展名。</zh-CN><en>Containment and extension are compared only when both component root and safe source path exist.</en></lang>
    if (upstreamComponentDirectory && upstreamSourcePath
      && (!upstreamSourcePath.startsWith(`${upstreamComponentDirectory}/`) || !upstreamSourcePath.endsWith('.vue'))) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_COMPONENT_INVALID', `API compatibility component ${componentName}.upstream.source must be a Vue file inside its declared component directory.`);
    }
    // <lang><zh-CN>types 与 service 使用相同状态分支，但各自保留独立 path/digest provenance。</zh-CN><en>Types and service share the same status branching while retaining independent path/digest provenance.</en></lang>
    for (const field of ['types', 'service']) {
      // <lang><zh-CN>当前声明只作为只读 record 引用；后续校验不修改其 status 或路径。</zh-CN><en>The current declaration is a read-only record reference; later checks do not modify its status or path.</en></lang>
      const declaration = component.upstream[field];
      // <lang><zh-CN>available 要求完整文件 provenance，not-declared 精确禁止附带伪 path/digest。</zh-CN><en>Available requires complete file provenance while not-declared precisely forbids invented path/digest fields.</en></lang>
      const declarationFields = declaration?.status === 'available' ? ['status', 'path', 'digest'] : ['status'];
      // <lang><zh-CN>辅助文件状态、字段集合与可选 provenance 必须同时合法。</zh-CN><en>Supporting-file status, field set, and optional provenance must be valid together.</en></lang>
      if (!validateExactFields(declaration, new Set(declarationFields), declarationFields, `API compatibility component ${componentName}.upstream.${field}`, diagnostics)
        || !supportedUpstreamFileStatuses.has(declaration?.status)) {
        addDiagnostic(diagnostics, 'API_COMPATIBILITY_COMPONENT_INVALID', `API compatibility component ${componentName}.upstream.${field} has invalid declaration metadata.`);
      } else if (declaration.status === 'available' && (!isSafeRelativePath(declaration.path) || !isSha256Digest(declaration.digest))) {
        addDiagnostic(diagnostics, 'API_COMPATIBILITY_COMPONENT_INVALID', `API compatibility component ${componentName}.upstream.${field} has an invalid path or digest.`);
      } else if (declaration.status === 'available' && upstreamComponentDirectory) {
        // <lang><zh-CN>available 辅助文件必须留在同一组件目录；只校 containment，不锁 types.ts/service.ts 文件名。</zh-CN><en>An available supporting file must remain inside the same component directory; containment is checked without locking types.ts or service.ts filenames.</en></lang>
        const declarationPath = normalizeRelativePath(declaration.path);
        // <lang><zh-CN>跨组件或逃离目录的安全相对路径同样失败，防止 provenance 偷换。</zh-CN><en>A safe relative path that crosses components or leaves the directory still fails, preventing provenance substitution.</en></lang>
        if (!declarationPath.startsWith(`${upstreamComponentDirectory}/`)) {
          addDiagnostic(diagnostics, 'API_COMPATIBILITY_COMPONENT_INVALID', `API compatibility component ${componentName}.upstream.${field} must remain inside its declared component directory.`);
        }
      }
    }
  }

  // <lang><zh-CN>HIA name/source/contract 必须与已加载 component manifest 精确一致；export 只校验标识，不读取 runtime entry。</zh-CN><en>HIA name, source, and contract must exactly match the loaded component manifest; export is validated as an identifier without reading the runtime entry.</en></lang>
  const hiaFields = ['name', 'export', 'source', 'contract'];
  // <lang><zh-CN>HIA 外壳成立后才进行身份、路径和本地成员对照。</zh-CN><en>Identity, path, and local-membership checks run only after the HIA envelope is valid.</en></lang>
  if (validateExactFields(component.hia, new Set(hiaFields), hiaFields, `API compatibility component ${componentName}.hia`, diagnostics)) {
    // <lang><zh-CN>本地 component manifest record 是唯一成员资格对照；缺项保持 undefined 并产生明确 unavailable 诊断。</zh-CN><en>The local component-manifest record is the sole membership control; a missing entry remains undefined and produces an explicit unavailable diagnostic.</en></lang>
    const localComponent = localComponents.get(componentName);
    // <lang><zh-CN>HIA 自报 identity/path 先独立校验，防止两个相同坏值在对照时相互“匹配”。</zh-CN><en>Validate HIA-reported identity and paths independently so two equally malformed values cannot appear to match during comparison.</en></lang>
    if (component.hia.name !== componentName || !isNonemptyString(component.hia.export)
      || !isSafeRelativePath(component.hia.source) || !isSafeRelativePath(component.hia.contract)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_COMPONENT_INVALID', `API compatibility component ${componentName}.hia has invalid identity or paths.`);
    }
    // <lang><zh-CN>name/source/contract 必须与已加载本地 record 精确一致；export 不执行，因此不参与 runtime 解析。</zh-CN><en>Name, source, and contract must exactly match the loaded local record; export is never executed and therefore does not enter runtime resolution.</en></lang>
    if (!localComponent || localComponent.name !== component.hia.name
      || normalizeRelativePath(localComponent.source) !== normalizeRelativePath(component.hia.source)
      || normalizeRelativePath(localComponent.contract) !== normalizeRelativePath(component.hia.contract)) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_COMPONENT_UNAVAILABLE', `API compatibility component ${componentName} does not match its declared local component manifest.`);
    }
  }

  // <lang><zh-CN>四个 API 维度按固定顺序累积诊断，使 text/JSON 报告跨主机稳定且能力边界清晰。</zh-CN><en>Accumulate diagnostics across the four API dimensions in fixed order, keeping text/JSON reports stable across hosts and capability boundaries explicit.</en></lang>
  for (const dimension of ['props', 'events', 'slots', 'imperativeApis']) {
    validateApiContainer(component[dimension], componentName, dimension, issuesById, componentIssueIds, schemaVersion, diagnostics);
  }
  // <lang><zh-CN>service inventory 只属于 v2；v1 exact component envelope 已确保该字段不存在。</zh-CN><en>The service inventory belongs only to v2; the exact v1 component envelope already guarantees its absence there.</en></lang>
  if (schemaVersion === 2) validateServices(component.services, componentName, diagnostics);
  // <lang><zh-CN>alias 使用同一直接 issue 归属规则，但保持 runtime-aliases 独立 scope。</zh-CN><en>Aliases use the same direct-issue ownership rule while retaining an independent runtime-aliases scope.</en></lang>
  validateAliases(component.aliases, componentName, issuesById, componentIssueIds, diagnostics);
  // <lang><zh-CN>parser-owned issue 只允许绑定一个 surface；此跨容器门禁在各自直接引用校验后统一复核。</zh-CN><en>A parser-owned issue may bind to only one surface; this cross-container gate is checked after each direct-reference validation.</en></lang>
  validateParserIssueSurfaceUniqueness(component, issuesById, diagnostics);
  // <lang><zh-CN>交付维度与 API-items-only 汇总最后校验，以复用已建立的 issue 与现场计数事实。</zh-CN><en>Delivery dimensions and the api-items-only summary are checked last so they can reuse established issue and live-count facts.</en></lang>
  validateDeliveryDimensions(component, profile, issuesById, componentIssueIds, diagnostics);
  validateComponentMigration(component.migration, countComponentMigration(component), componentName, diagnostics);
  // <lang><zh-CN>非空名称返回给顶层集合门禁；嵌套诊断不会隐藏该组件在当前比较集合中的身份。</zh-CN><en>Return the nonempty name to the top-level set gate; nested diagnostics do not hide the component's identity in the current comparison set.</en></lang>
  return componentName;
}

/**
 * @lang zh-CN 校验版本化 API/迁移矩阵的全部结构、当前组件集合、本地成员资格与 issue 交叉引用；不修改输入。
 * @lang en Validates the complete structure, current component set, local membership, and issue cross-references of a versioned API and migration matrix without modifying input.
 * @param {unknown} manifest <lang><zh-CN>已解析矩阵 JSON。</zh-CN><en>Parsed matrix JSON.</en></lang>
 * @param {string} manifestPath <lang><zh-CN>用于稳定诊断的安全相对矩阵路径。</zh-CN><en>Safe relative matrix path used for stable diagnostics.</en></lang>
 * @param {object} configuration <lang><zh-CN>已校验 Tool configuration。</zh-CN><en>Validated Tool configuration.</en></lang>
 * @param {Map<string, object>} componentManifests <lang><zh-CN>已配置 component manifest 加载索引。</zh-CN><en>Configured component-manifest load index.</en></lang>
 * @returns {Array<object>} <lang><zh-CN>结构完整性诊断；合法 unsupported/unresolved 不产生诊断。</zh-CN><en>Structural-integrity diagnostics; valid unsupported and unresolved facts produce none.</en></lang>
 */
export function validateApiCompatibilityManifest(manifest, manifestPath, configuration, componentManifests) {
  // <lang><zh-CN>非 record 无法形成可信 inventory，立即返回单一 schema 诊断。</zh-CN><en>A non-record cannot form a trustworthy inventory and immediately returns one schema diagnostic.</en></lang>
  if (!isRecord(manifest)) {
    return [createDiagnostic('API_COMPATIBILITY_SCHEMA_INVALID', `API compatibility manifest must be a JSON object: ${manifestPath}.`)];
  }

  // <lang><zh-CN>所有独立问题在固定遍历顺序内累积，支持一次修复完整 metadata。</zh-CN><en>All independent issues accumulate in fixed traversal order so complete metadata can be repaired in one pass.</en></lang>
  const diagnostics = [];
  // <lang><zh-CN>版本先只用于选择 exact-field envelope；未知版本沿用 v1 最小面并由独立 version 诊断拒绝。</zh-CN><en>The version initially selects only the exact-field envelope; an unknown version uses the minimal v1 surface and is rejected by the independent version diagnostic.</en></lang>
  const topLevelFields = manifest.version === 2 ? allowedTopLevelFieldsV2 : allowedTopLevelFields;
  validateExactFields(manifest, topLevelFields, [...topLevelFields], `API compatibility manifest ${manifestPath}`, diagnostics);

  // <lang><zh-CN>版本、kind 与 profile 分别锁定 schema 世代、公开用途和本次调用环境，三者互不代偿。</zh-CN><en>Version, kind, and profile independently lock schema generation, public purpose, and invocation environment; none substitutes for another.</en></lang>
  if (manifest.version !== 1 && manifest.version !== 2) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_VERSION_UNSUPPORTED', `API compatibility manifest version must be 1 or 2: ${manifestPath}.`);
  }
  // <lang><zh-CN>kind 独立于版本校验，防止其他 v1 JSON 被误当作 API compatibility matrix。</zh-CN><en>Kind is checked independently of version so another v1 JSON document cannot masquerade as an API compatibility matrix.</en></lang>
  if (manifest.kind !== 'hia-uview-api-compatibility') {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_KIND_INVALID', `API compatibility manifest kind is unsupported: ${manifestPath}.`);
  }
  // <lang><zh-CN>profile 必须与已验证 configuration 精确一致，禁止跨环境复用结论。</zh-CN><en>Profile must exactly match validated configuration so conclusions cannot be reused across environments.</en></lang>
  if (manifest.profile !== configuration.profile) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_PROFILE_MISMATCH', `API compatibility manifest profile must match configuration profile: ${manifestPath}.`);
  }

  // <lang><zh-CN>comparison provenance 先独立校验；其路径与摘要不会触发任何外部读取。</zh-CN><en>Validate comparison provenance independently first; its paths and digests trigger no external reads.</en></lang>
  validateComparison(manifest.comparison, diagnostics);
  // <lang><zh-CN>local validator 返回唯一可用于 component manifest Map 关联的安全规范路径。</zh-CN><en>The local validator returns the only safe normalized path eligible for component-manifest Map linkage.</en></lang>
  const localManifestPath = validateLocal(manifest.local, manifest.profile, diagnostics);
  // <lang><zh-CN>issue registry 在组件遍历前建立，使 unresolved、types 与 owner 引用共享同一可信索引。</zh-CN><en>Build the issue registry before component traversal so unresolved, types, and owner references share one trusted index.</en></lang>
  const issuesById = validateIssues(manifest.issues, diagnostics);

  // <lang><zh-CN>v2 review provenance 只声明安全相对路径、摘要与两类数量；Tool 不打开该 review 文件。</zh-CN><en>Version 2 review provenance declares only a safe relative path, digest, and two counts; the Tool never opens the review file.</en></lang>
  if (manifest.version === 2) {
    const reviewFields = ['path', 'digest', 'itemCount', 'serviceCount'];

    if (validateExactFields(manifest.semanticReview, new Set(reviewFields), reviewFields, 'API compatibility semanticReview', diagnostics)) {
      if (!isSafeRelativePath(manifest.semanticReview.path) || !isSha256Digest(manifest.semanticReview.digest)
        || !Number.isInteger(manifest.semanticReview.itemCount) || manifest.semanticReview.itemCount < 1
        || !Number.isInteger(manifest.semanticReview.serviceCount) || manifest.semanticReview.serviceCount < 0) {
        addDiagnostic(diagnostics, 'API_COMPATIBILITY_SEMANTIC_REVIEW_INVALID', 'API compatibility semanticReview must declare a safe path, SHA-256 digest, and nonnegative counts.');
      }
    }
  }

  // <lang><zh-CN>只允许关联 configuration 已加载的 component manifest；不猜测包位置或打开替代路径。</zh-CN><en>Only a component manifest already loaded from configuration may be linked; no package location is guessed and no alternative path is opened.</en></lang>
  const loadedComponentManifest = localManifestPath ? componentManifests.get(localManifestPath) : null;
  // <lang><zh-CN>只有已加载、无诊断且含 manifest 的 entry 可作为成员对照；不回退到磁盘发现。</zh-CN><en>Only a loaded, diagnostic-free entry containing a manifest may serve as membership control; there is no fallback disk discovery.</en></lang>
  if (!loadedComponentManifest || loadedComponentManifest.diagnostics.length > 0 || !loadedComponentManifest.manifest) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_COMPONENT_MANIFEST_UNAVAILABLE', 'API compatibility local.componentManifest must reference a valid component manifest declared by configuration.');
  }
  // <lang><zh-CN>本地名称索引只复制公开 component records；source/contract 文件保持未读取。</zh-CN><en>The local name index copies only public component records; source and contract files remain unread.</en></lang>
  const localComponents = new Map((loadedComponentManifest?.manifest?.components ?? []).map((component) => [component.name, component]));
  // <lang><zh-CN>矩阵自报的受控数量/version 必须与已加载 manifest 相等，防止关联到另一个合法但错误的本地清单。</zh-CN><en>The matrix-reported controlled count and version must equal the loaded manifest, preventing linkage to another valid but incorrect local inventory.</en></lang>
  if (manifest.local?.componentManifest?.controlledCount !== localComponents.size
    || manifest.local?.componentManifest?.version !== loadedComponentManifest?.manifest?.version) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_COMPONENT_MANIFEST_MISMATCH', 'API compatibility local component count or version differs from its configured component manifest.');
  }

  // <lang><zh-CN>非空组件数组是后续集合摘要与反向引用的前置条件；形状错误时早退，避免制造派生噪声。</zh-CN><en>A nonempty component array is a precondition for later set digest and reverse references; return early on a bad shape to avoid derived noise.</en></lang>
  if (!Array.isArray(manifest.components) || manifest.components.length === 0) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_COMPONENT_COUNT_INVALID', `API compatibility manifest must declare a nonempty component array: ${manifestPath}.`);
    return diagnostics;
  }
  // <lang><zh-CN>comparison 与 local 的比较数量必须同时等于真实数组长度；当前快照的具体数量由仓库契约测试冻结。</zh-CN><en>Comparison and local comparison counts must both equal the actual array length; the current snapshot's concrete count is frozen by repository contract tests.</en></lang>
  if (manifest.comparison?.components?.count !== manifest.components.length
    || manifest.local?.componentManifest?.comparisonCount !== manifest.components.length) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_COMPONENT_COUNT_INVALID', 'API compatibility comparison/local component counts must match the declared component array length.');
  }
  // <lang><zh-CN>只把已经通过安全相对路径门禁的组件根传给逐组件 containment 校验；非法根保持 null。</zh-CN><en>Pass only a component root that satisfies the safe-relative-path gate into per-component containment checks; an unsafe root remains null.</en></lang>
  const comparisonComponentRoot = isSafeRelativePath(manifest.comparison?.components?.path)
    ? normalizeRelativePath(manifest.comparison.components.path)
    : null;

  // <lang><zh-CN>逐组件校验后同时锁定唯一/排序/名称摘要与 component-scoped issue 的反向引用。</zh-CN><en>After item-by-item validation, uniqueness, ordering, name digest, and reverse references for component-scoped issues are locked together.</en></lang>
  const componentNames = [];
  // <lang><zh-CN>反向引用表按组件保留其原始 issueIds 集合，供单 owner 与共享 owner 统一复核。</zh-CN><en>The reverse-reference table retains each component's original issue-ID set for uniform singular- and shared-owner verification.</en></lang>
  const referencedIssuesByComponent = new Map();
  // <lang><zh-CN>按 manifest 声明顺序遍历，使组件顺序错误可被顶层代码点门禁观察。</zh-CN><en>Traverse in manifest declaration order so the top-level code-point gate can observe component ordering errors.</en></lang>
  for (const component of manifest.components) {
    // <lang><zh-CN>组件 validator 返回可靠名称或 null；所有嵌套错误已进入共享 diagnostics。</zh-CN><en>The component validator returns a reliable name or null; all nested errors already enter shared diagnostics.</en></lang>
    const componentName = validateComponent(component, manifest.profile, comparisonComponentRoot, issuesById, localComponents, manifest.version, diagnostics);
    // <lang><zh-CN>null 名称无法成为集合或 owner 键，跳过可避免二次重复/排序噪声。</zh-CN><en>A null name cannot become a set or owner key and is skipped to prevent secondary duplicate or ordering noise.</en></lang>
    if (!componentName) continue;
    // <lang><zh-CN>名称序列保留声明顺序；反向表只复制 issue ID，不修改组件 record。</zh-CN><en>The name sequence preserves declaration order; the reverse table copies only issue IDs and never mutates the component record.</en></lang>
    componentNames.push(componentName);
    referencedIssuesByComponent.set(componentName, new Set(Array.isArray(component.issueIds) ? component.issueIds : []));
  }
  // <lang><zh-CN>名称唯一性与排序分别报告，便于一次修复重复记录和顺序漂移。</zh-CN><en>Report name uniqueness and ordering separately so duplicate records and order drift can be repaired in one pass.</en></lang>
  if (new Set(componentNames).size !== componentNames.length) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_COMPONENT_NAME_DUPLICATE', 'API compatibility components must not repeat a name.');
  }
  // <lang><zh-CN>排序检查独立于重复检查，确保生成顺序跨 locale 稳定。</zh-CN><en>Order is checked independently from duplicates to keep generation stable across locales.</en></lang>
  if (!isCodePointSorted(componentNames)) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_COMPONENT_ORDER_INVALID', 'API compatibility components must use code-point name order.');
  }
  // <lang><zh-CN>名称摘要从当前实际组件数组重算，并与 manifest 声明对照；具体名称集合由仓库契约测试冻结。</zh-CN><en>The name digest is recalculated from the current component array and checked against the manifest declaration; the concrete name set is frozen by repository contract tests.</en></lang>
  const actualNameDigest = `sha256:${createHash('sha256').update(componentNames.join('\n')).digest('hex')}`;
  // <lang><zh-CN>现场摘要必须与 comparison 声明一致，防止 count 相同但名称集合漂移。</zh-CN><en>The live digest must match the comparison declaration so a same-sized but different name set cannot drift silently.</en></lang>
  if (actualNameDigest !== manifest.comparison?.components?.nameDigest) {
    addDiagnostic(diagnostics, 'API_COMPATIBILITY_COMPONENT_SET_INVALID', 'API compatibility component names do not match comparison.components.nameDigest.');
  }

  // <lang><zh-CN>v2 semantic review 数量从当前合法形状现场派生；不信任 provenance 自报 127/2。</zh-CN><en>Version 2 semantic-review counts are derived live from the current valid shapes; provenance-reported 127/2 is not trusted.</en></lang>
  if (manifest.version === 2 && isRecord(manifest.semanticReview)) {
    const semanticItemCount = manifest.components.reduce((total, component) => total
      + ['props', 'events', 'slots', 'imperativeApis'].reduce((componentTotal, dimension) => componentTotal
        + (Array.isArray(component?.[dimension]?.items)
          ? component[dimension].items.filter((item) => item?.priority === 'P0' && item?.semantics?.reviewState === 'complete').length
          : 0), 0), 0);
    const serviceCount = manifest.components.reduce((total, component) => total
      + (Array.isArray(component?.services?.items) ? component.services.items.length : 0), 0);

    if (manifest.semanticReview.itemCount !== semanticItemCount || manifest.semanticReview.serviceCount !== serviceCount) {
      addDiagnostic(diagnostics, 'API_COMPATIBILITY_SEMANTIC_REVIEW_INVALID', 'API compatibility semanticReview counts must match live complete P0 semantics and service items.');
    }
  }

  // <lang><zh-CN>显式拥有 component/components 的 issue 要求由每个所有者反向引用；全局 package issue 可以无组件引用。</zh-CN><en>An issue that explicitly owns component/components requires a reverse reference from every owner; global package issues may remain unreferenced by components.</en></lang>
  for (const [issueId, issue] of issuesById) {
    // <lang><zh-CN>将单所有者与共享所有者规范化为同一只读序列，再逐一检查当前组件集合与反向引用。</zh-CN><en>Normalize singular and shared owners into one read-only sequence, then verify membership in the current component set and each reverse reference.</en></lang>
    const issueComponents = issue.component ? [issue.component] : Array.isArray(issue.components) ? issue.components : [];
    // <lang><zh-CN>每个显式 owner 都必须存在于当前组件表并反向引用该 issue；全局 issue 的 owner 序列为空，因此合法跳过。</zh-CN><en>Every explicit owner must exist in the current component table and reverse-reference the issue; a global issue has an empty owner sequence and therefore skips legally.</en></lang>
    for (const componentName of issueComponents) {
      // <lang><zh-CN>缺少 owner 组件或反向引用都会产生同一稳定引用诊断。</zh-CN><en>A missing owner component or reverse reference produces the same stable reference diagnostic.</en></lang>
      if (!referencedIssuesByComponent.has(componentName) || !referencedIssuesByComponent.get(componentName).has(issueId)) {
        addDiagnostic(diagnostics, 'API_COMPATIBILITY_ISSUE_REFERENCE_INVALID', `Component-scoped API compatibility issue must be referenced by its component: ${issueId} (${componentName}).`);
      }
    }
  }

  // <lang><zh-CN>返回稳定顺序的结构诊断；合法 unsupported、not-assessed 与有引用 unresolved 均不进入结果。</zh-CN><en>Return structural diagnostics in stable order; valid unsupported, not-assessed, and referenced unresolved facts never enter the result.</en></lang>
  return diagnostics;
}

/**
 * @lang zh-CN 从 configuration 明示的安全相对路径读取一份 API/迁移矩阵，并仅与内存中的已配置 component manifest 建立关联。
 * @lang en Reads one API and migration matrix from a safe relative path explicitly selected by configuration and links it only to an already configured component manifest in memory.
 * @param {string} rootDirectory <lang><zh-CN>Tool 调用根目录。</zh-CN><en>Tool invocation root directory.</en></lang>
 * @param {string} manifestPath <lang><zh-CN>configuration 明示的矩阵相对路径。</zh-CN><en>Configuration-declared relative matrix path.</en></lang>
 * @param {object} configuration <lang><zh-CN>已校验声明式 configuration。</zh-CN><en>Validated declarative configuration.</en></lang>
 * @param {Map<string, object>} componentManifests <lang><zh-CN>已加载 component manifest 的路径索引。</zh-CN><en>Path index of already loaded component manifests.</en></lang>
 * @returns {Promise<{path:string,manifest:object|null,diagnostics:Array<object>}>} <lang><zh-CN>规范相对路径、解析矩阵与稳定诊断。</zh-CN><en>Normalized relative path, parsed matrix, and stable diagnostics.</en></lang>
 */
export async function loadApiCompatibilityManifest(rootDirectory, manifestPath, configuration, componentManifests) {
  // <lang><zh-CN>readDeclaredJson 在 I/O 边界再次拒绝绝对、URI 与越界路径，并且只读取这一份 JSON。</zh-CN><en>readDeclaredJson rejects absolute, URI, and escaping paths again at the I/O boundary and reads only this one JSON file.</en></lang>
  const loaded = await readDeclaredJson(rootDirectory, manifestPath, 'API_COMPATIBILITY_MANIFEST');
  // <lang><zh-CN>规范路径可以安全进入报告；调用根绝对路径始终不进入返回值。</zh-CN><en>The normalized path may safely enter reports while the invocation root's absolute path never enters the return value.</en></lang>
  const normalizedPath = normalizeRelativePath(manifestPath);
  // <lang><zh-CN>I/O 或 JSON 解析失败时返回 loader 诊断并隐藏半解析值；不会再执行 schema 关联。</zh-CN><en>On I/O or JSON parsing failure, return loader diagnostics and hide any partial value; schema linkage does not run.</en></lang>
  if (loaded.diagnostics.length > 0) {
    return { path: normalizedPath, manifest: null, diagnostics: loaded.diagnostics };
  }

  // <lang><zh-CN>纯 schema/关联校验不修改已解析 JSON、configuration 或 component manifest 索引。</zh-CN><en>Pure schema and linkage validation modifies neither parsed JSON, configuration, nor the component-manifest index.</en></lang>
  const diagnostics = validateApiCompatibilityManifest(loaded.value, normalizedPath, configuration, componentManifests);
  // <lang><zh-CN>成功读取后始终返回原始解析 manifest 与独立 diagnostics；调用方据此决定是否进入 inspect 投影。</zh-CN><en>After a successful read, return the original parsed manifest with separate diagnostics so the caller can decide whether it enters inspection projection.</en></lang>
  return { path: normalizedPath, manifest: loaded.value, diagnostics };
}
