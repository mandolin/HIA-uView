/**
 * @module migration-actions
 * @lang zh-CN 读取并校验 HIA-uView 的声明式迁移动作包。它只关联 configuration 明示的 API matrix，不扫描应用或源码，也不生成、执行或写入迁移代码。
 * @lang en Reads and validates declarative HIA-uView migration-action packets. It links only API matrices declared by configuration, scans no application or source, and neither generates, executes, nor writes migration code.
 */

import { createDiagnostic, isSafeRelativePath, normalizeRelativePath } from './config.mjs';
import { isCodePointSorted, readDeclaredJson } from './metadata.mjs';

/** @lang zh-CN manifest v1 的唯一公开字段。 @lang en The only public fields of manifest v1. */
const manifestFields = Object.freeze(['version', 'kind', 'profile', 'apiCompatibilityManifest', 'scope', 'actions']);
/** @lang zh-CN Tool 支持的固定文案 locale。 @lang en Fixed copy locales supported by the Tool. */
const locales = Object.freeze(['en', 'zh-Hans']);
/** @lang zh-CN 可由动作包引用的 API container。 @lang en API containers eligible for action-packet references. */
const dimensions = Object.freeze(['props', 'events', 'slots', 'imperativeApis']);

/**
 * @lang zh-CN 判断值是否为普通 JSON record；数组/null/primitive 不能承载受控 schema。
 * @lang en Determines whether a value is a plain JSON record; arrays/null/primitives cannot carry the controlled schema.
 * @param {unknown} value <lang><zh-CN>待判断值。</zh-CN><en>Value to determine.</en></lang>
 * @returns {boolean} <lang><zh-CN>为 record 时为 true。</zh-CN><en>True when the value is a record.</en></lang>
 */
function isRecord(value) {
  // <lang><zh-CN>排除数组与 null，避免索引或空值被误作字段集合。</zh-CN><en>Excludes arrays and null so indexes or an empty value cannot be mistaken for a field set.</en></lang>
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/**
 * @lang zh-CN 判断有限的公开说明文本；文本不会被执行、插值或作为路径读取。
 * @lang en Determines bounded public explanation text; text is neither executed nor interpolated or read as a path.
 * @param {unknown} value <lang><zh-CN>待判断值。</zh-CN><en>Value to determine.</en></lang>
 * @returns {boolean} <lang><zh-CN>为允许文本时为 true。</zh-CN><en>True when the value is allowed text.</en></lang>
 */
function isText(value) {
  // <lang><zh-CN>限制长度，避免动作 JSON 被用作大段文档或源码正文载体。</zh-CN><en>Bounds length so action JSON cannot serve as a carrier for large documentation or source bodies.</en></lang>
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 360;
}

/**
 * @lang zh-CN 追加稳定项目级诊断；绝不回显原始 JSON、绝对路径或调用环境。
 * @lang en Appends a stable project-level diagnostic and never echoes raw JSON, absolute paths, or invocation environment.
 * @param {Array<object>} diagnostics <lang><zh-CN>共享诊断数组。</zh-CN><en>Shared diagnostic array.</en></lang>
 * @param {string} code <lang><zh-CN>公开稳定代码。</zh-CN><en>Public stable code.</en></lang>
 * @param {string} message <lang><zh-CN>简洁公开说明。</zh-CN><en>Concise public explanation.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function add(diagnostics, code, message) {
  // <lang><zh-CN>category 固定为 project，使调用层仍能正确派生退出码。</zh-CN><en>Fixes category to project so the invocation layer can still derive the correct exit code.</en></lang>
  diagnostics.push(createDiagnostic(code, message));
}

/**
 * @lang zh-CN 校验 record 的精确字段，不接受未来未审计的执行类扩展。
 * @lang en Validates exact record fields and accepts no future unaudited executable extension.
 * @param {object} value <lang><zh-CN>已确认 record。</zh-CN><en>Confirmed record.</en></lang>
 * @param {readonly string[]} fields <lang><zh-CN>允许且必需字段。</zh-CN><en>Allowed and required fields.</en></lang>
 * @param {string} context <lang><zh-CN>公开 schema 上下文。</zh-CN><en>Public schema context.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>共享诊断数组。</zh-CN><en>Shared diagnostic array.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function exactFields(value, fields, context, diagnostics) {
  // <lang><zh-CN>冻结字段数组转为集合，令未知项检查不依赖输入对象。</zh-CN><en>Converts the frozen field array into a set so unknown-field checking never depends on input object content.</en></lang>
  const allowed = new Set(fields);
  for (const field of Object.keys(value)) {
    if (!allowed.has(field)) add(diagnostics, 'MIGRATION_ACTIONS_FIELD_UNKNOWN', `${context} contains an unsupported field: ${field}.`);
  }
  for (const field of fields) {
    if (!(field in value)) add(diagnostics, 'MIGRATION_ACTIONS_FIELD_MISSING', `${context} is missing required field: ${field}.`);
  }
}

/**
 * @lang zh-CN 校验 `en`/`zh-Hans` 双语说明；Tool 只选择已存在文本，不翻译。
 * @lang en Validates `en`/`zh-Hans` bilingual copy; the Tool only selects existing text and never translates.
 * @param {unknown} copy <lang><zh-CN>待校验文案。</zh-CN><en>Copy to validate.</en></lang>
 * @param {string} context <lang><zh-CN>公开上下文。</zh-CN><en>Public context.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>共享诊断数组。</zh-CN><en>Shared diagnostic array.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function localizedCopy(copy, context, diagnostics) {
  if (!isRecord(copy)) {
    add(diagnostics, 'MIGRATION_ACTIONS_COPY_INVALID', `${context} must be an en/zh-Hans object.`);
    return;
  }
  exactFields(copy, locales, context, diagnostics);
  for (const locale of locales) {
    if (!isText(copy[locale])) add(diagnostics, 'MIGRATION_ACTIONS_COPY_INVALID', `${context}.${locale} must be bounded nonempty text.`);
  }
}

/**
 * @lang zh-CN 从有效 matrix 创建 component/item 内存索引；不读取 matrix 所指向的 source/contract/docs。
 * @lang en Creates a component/item memory index from a valid matrix and reads no source/contract/docs named by that matrix.
 * @param {object} matrix <lang><zh-CN>已验证 API matrix。</zh-CN><en>Validated API matrix.</en></lang>
 * @returns {Map<string, Map<string, object>>} <lang><zh-CN>component 到 item 的索引。</zh-CN><en>Component-to-item index.</en></lang>
 */
function matrixIndex(matrix) {
  // <lang><zh-CN>外层 Map 只收录 matrix 公开 component；action 不能引入新的组件名称。</zh-CN><en>The outer Map includes only matrix public components; an action cannot introduce a new component name.</en></lang>
  const components = new Map();
  for (const component of matrix.components) {
    // <lang><zh-CN>内层 Map 用精确 item ID 汇总四个固定 API container。</zh-CN><en>The inner Map aggregates four fixed API containers by exact item ID.</en></lang>
    const items = new Map();
    for (const dimension of dimensions) {
      for (const item of component[dimension].items) items.set(item.id, item);
    }
    components.set(component.name, items);
  }
  return components;
}

/**
 * @lang zh-CN 判断动作数组是否先按 component、再按 itemId 的 Unicode 代码点顺序排列；不直接比较带 `/` 分隔符的复合 ID。
 * @lang en Determines whether actions are ordered by Unicode code point first by component and then by itemId; it does not compare compound IDs containing a `/` separator directly.
 * @param {Array<object>} actions <lang><zh-CN>已验证为 record 的动作数组。</zh-CN><en>Action array already validated as records.</en></lang>
 * @returns {boolean} <lang><zh-CN>顺序稳定时为 true。</zh-CN><en>True when the order is stable.</en></lang>
 */
function isActionSorted(actions) {
  // <lang><zh-CN>首项没有前驱，逐相邻 action 比较即可避免创建派生排序数组。</zh-CN><en>The first item has no predecessor, so adjacent-action comparison avoids constructing a derived sorted array.</en></lang>
  for (let index = 1; index < actions.length; index += 1) {
    // <lang><zh-CN>前一动作是当前唯一排序基准；无效字段已由单项 schema 诊断单独报告。</zh-CN><en>The preceding action is the sole current sort baseline; invalid fields have separate per-item schema diagnostics.</en></lang>
    const previous = actions[index - 1];
    // <lang><zh-CN>当前动作只在前一项存在时比较，保留完整 diagnostics 而不因单项无效提前退出。</zh-CN><en>Compare the current action only when the preceding item exists, retaining complete diagnostics instead of exiting early on one invalid item.</en></lang>
    const current = actions[index];
    // <lang><zh-CN>非 record 或缺少排序键的项已由 action schema 处理；此处跳过它们以保证坏输入仍只产生诊断而不会抛出异常。</zh-CN><en>Non-record items or items missing sort keys are handled by action schema; skip them here so malformed input still produces diagnostics rather than throwing.</en></lang>
    if (!isRecord(previous) || !isRecord(current) || !isText(previous.component) || !isText(current.component) || !isText(previous.itemId) || !isText(current.itemId)) continue;
    // <lang><zh-CN>component 优先级先行；短名称是前缀时自然排在其延伸名称之前。</zh-CN><en>Component precedence comes first; a shorter name naturally precedes its extension when it is a prefix.</en></lang>
    const componentInverted = previous.component > current.component;
    // <lang><zh-CN>同组件内才比较 itemId，避免 `/` 分隔符把 `u-checkbox-group` 排到 `u-checkbox` 的 action 之前。</zh-CN><en>Compare itemId only within one component, preventing the `/` separator from placing `u-checkbox-group` before actions of `u-checkbox`.</en></lang>
    const itemInverted = previous.component === current.component && previous.itemId > current.itemId;
    if (componentInverted || itemInverted) return false;
  }
  return true;
}

/**
 * @lang zh-CN 校验 scope 的非空、排序、当前 matrix 成员资格；scope 是报告 coverage，不是文件发现规则。
 * @lang en Validates nonempty ordered current-matrix membership of scope; scope is report coverage, not a file-discovery rule.
 * @param {unknown} scope <lang><zh-CN>待校验 scope。</zh-CN><en>Scope to validate.</en></lang>
 * @param {Map<string, Map<string, object>>} index <lang><zh-CN>matrix 索引。</zh-CN><en>Matrix index.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>共享诊断数组。</zh-CN><en>Shared diagnostic array.</en></lang>
 * @returns {{components:Set<string>,priorities:Set<string>}} <lang><zh-CN>归一化 scope 集合。</zh-CN><en>Normalized scope sets.</en></lang>
 */
function validateScope(scope, index, diagnostics) {
  // <lang><zh-CN>空集合让后续 action 仍能独立报告越界，而不从无效 scope 推断默认覆盖范围。</zh-CN><en>Empty sets let later actions independently report out-of-scope status without inferring default coverage from an invalid scope.</en></lang>
  const result = { components: new Set(), priorities: new Set() };
  if (!isRecord(scope)) {
    add(diagnostics, 'MIGRATION_ACTIONS_SCOPE_INVALID', 'Migration action scope must be a JSON object.');
    return result;
  }
  exactFields(scope, ['components', 'priorities'], 'Migration action scope', diagnostics);
  // <lang><zh-CN>component 名称必须为有序唯一字符串并存在于当前 matrix。</zh-CN><en>Component names must be ordered unique strings and exist in the current matrix.</en></lang>
  if (!Array.isArray(scope.components) || scope.components.length === 0 || !scope.components.every(isText) || new Set(scope.components).size !== scope.components.length || !isCodePointSorted(scope.components)) {
    add(diagnostics, 'MIGRATION_ACTIONS_SCOPE_INVALID', 'Migration action scope.components must be a nonempty code-point-sorted unique string array.');
  } else {
    for (const component of scope.components) {
      if (!index.has(component)) add(diagnostics, 'MIGRATION_ACTIONS_SCOPE_COMPONENT_INVALID', `Migration action scope component is absent from API compatibility matrix: ${component}.`);
      result.components.add(component);
    }
  }
  // <lang><zh-CN>priority 是固定 P0/P1/P2 枚举，允许未来 action packet 有界扩展但不接受自由等级。</zh-CN><en>Priority uses fixed P0/P1/P2 enums, allowing bounded future action packets without accepting free-form tiers.</en></lang>
  if (!Array.isArray(scope.priorities) || scope.priorities.length === 0 || !scope.priorities.every((value) => ['P0', 'P1', 'P2'].includes(value)) || new Set(scope.priorities).size !== scope.priorities.length || !isCodePointSorted(scope.priorities)) {
    add(diagnostics, 'MIGRATION_ACTIONS_SCOPE_INVALID', 'Migration action scope.priorities must be a nonempty code-point-sorted unique P0/P1/P2 array.');
  } else {
    for (const priority of scope.priorities) result.priorities.add(priority);
  }
  return result;
}

/**
 * @lang zh-CN 校验一个 action 并返回有效 ID；逐项关联 matrix 的 priority/disposition，绝不按名称猜测兼容性。
 * @lang en Validates one action and returns its valid ID; links each item to matrix priority/disposition and never guesses compatibility by name.
 * @param {unknown} action <lang><zh-CN>待校验 action。</zh-CN><en>Action to validate.</en></lang>
 * @param {{components:Set<string>,priorities:Set<string>}} scope <lang><zh-CN>已解析 scope。</zh-CN><en>Parsed scope.</en></lang>
 * @param {Map<string, Map<string, object>>} index <lang><zh-CN>matrix 索引。</zh-CN><en>Matrix index.</en></lang>
 * @param {Array<object>} diagnostics <lang><zh-CN>共享诊断数组。</zh-CN><en>Shared diagnostic array.</en></lang>
 * @returns {string|null} <lang><zh-CN>有效 action ID 或 null。</zh-CN><en>Valid action ID or null.</en></lang>
 */
function validateAction(action, scope, index, diagnostics) {
  if (!isRecord(action)) {
    add(diagnostics, 'MIGRATION_ACTIONS_ACTION_INVALID', 'Every migration action must be a JSON object.');
    return null;
  }
  exactFields(action, ['id', 'component', 'itemId', 'priority', 'disposition', 'operation', 'guidance', 'limitations', 'docs'], 'Migration action', diagnostics);
  // <lang><zh-CN>稳定 ID 只能是 component/itemId，防止同一 matrix item 使用任意显示别名重复输出。</zh-CN><en>The stable ID can only be component/itemId, preventing one matrix item from being output repeatedly under arbitrary display aliases.</en></lang>
  const expectedId = isText(action.component) && isText(action.itemId) ? `${action.component}/${action.itemId}` : null;
  if (!isText(action.id) || action.id !== expectedId) add(diagnostics, 'MIGRATION_ACTIONS_ID_INVALID', 'Migration action id must equal component/itemId.');
  if (!scope.components.has(action.component) || !scope.priorities.has(action.priority)) add(diagnostics, 'MIGRATION_ACTIONS_SCOPE_COVERAGE_INVALID', `Migration action is outside declared scope: ${action.id ?? 'unknown'}.`);
  // <lang><zh-CN>只查询精确 component/item；alias/type/easycom/platform 不是 action item 输入。</zh-CN><en>Queries only exact component/item; alias/type/easycom/platform are not action-item inputs.</en></lang>
  const item = index.get(action.component)?.get(action.itemId) ?? null;
  if (!item) {
    add(diagnostics, 'MIGRATION_ACTIONS_ITEM_UNAVAILABLE', `Migration action must reference an API item in the configured matrix: ${action.id ?? 'unknown'}.`);
  } else {
    if (action.priority !== item.priority) add(diagnostics, 'MIGRATION_ACTIONS_PRIORITY_MISMATCH', `Migration action priority must match matrix item: ${action.id}.`);
    if (action.disposition !== item.migration.disposition) add(diagnostics, 'MIGRATION_ACTIONS_DISPOSITION_MISMATCH', `Migration action disposition must match matrix item: ${action.id}.`);
    // <lang><zh-CN>operation 从当前 disposition 机械派生，避免 compatible/mapped/unsupported 的人工指引相互矛盾。</zh-CN><en>Operation is mechanically derived from current disposition, preventing human guidance from contradicting compatible/mapped/unsupported.</en></lang>
    const operation = item.migration.disposition === 'compatible' ? 'use-as-is' : item.migration.disposition === 'mapped' ? 'adapt-call-site' : 'keep-existing-or-compose';
    if (action.operation !== operation) add(diagnostics, 'MIGRATION_ACTIONS_OPERATION_INVALID', `Migration action operation must match matrix disposition: ${action.id ?? 'unknown'}.`);
  }
  localizedCopy(action.guidance, `Migration action guidance ${action.id ?? 'unknown'}`, diagnostics);
  localizedCopy(action.limitations, `Migration action limitations ${action.id ?? 'unknown'}`, diagnostics);
  // <lang><zh-CN>docs 是只展示、不读取的公开 Markdown 引用，路径必须受根 containment 的语法门禁约束。</zh-CN><en>Docs are public Markdown references displayed but never read; paths must satisfy root-containment syntax gates.</en></lang>
  const docs = Array.isArray(action.docs) ? action.docs.map(normalizeRelativePath) : [];
  if (docs.length === 0 || !docs.every((path) => isSafeRelativePath(path) && path.startsWith('docs/') && path.endsWith('.md')) || new Set(docs).size !== docs.length || !isCodePointSorted(docs)) add(diagnostics, 'MIGRATION_ACTIONS_DOCS_INVALID', `Migration action docs must be a nonempty code-point-sorted unique docs/*.md path array: ${action.id ?? 'unknown'}.`);
  return isText(action.id) ? action.id : null;
}

/**
 * @lang zh-CN 校验整个 action manifest 与已配置有效 matrix 的精确关联和 scope 全覆盖；不修改输入。
 * @lang en Validates exact linkage and full scope coverage of an action manifest against a configured valid matrix; modifies no input.
 * @param {unknown} manifest <lang><zh-CN>已解析 manifest JSON。</zh-CN><en>Parsed manifest JSON.</en></lang>
 * @param {string} manifestPath <lang><zh-CN>安全相对 manifest 路径。</zh-CN><en>Safe relative manifest path.</en></lang>
 * @param {object} configuration <lang><zh-CN>已校验配置。</zh-CN><en>Validated configuration.</en></lang>
 * @param {Map<string, object>} matrices <lang><zh-CN>有效 matrix 路径索引。</zh-CN><en>Valid-matrix path index.</en></lang>
 * @returns {Array<object>} <lang><zh-CN>稳定项目级诊断。</zh-CN><en>Stable project-level diagnostics.</en></lang>
 */
export function validateMigrationActionManifest(manifest, manifestPath, configuration, matrices) {
  if (!isRecord(manifest)) return [createDiagnostic('MIGRATION_ACTIONS_SCHEMA_INVALID', `Migration action manifest must be a JSON object: ${manifestPath}.`)];
  // <lang><zh-CN>先做顶层 schema/配置关联，再校验 action，确保无效 matrix 不会生成可被信任的迁移建议。</zh-CN><en>Validates top-level schema/configuration linkage before actions, ensuring an invalid matrix cannot generate trusted migration guidance.</en></lang>
  const diagnostics = [];
  exactFields(manifest, manifestFields, `Migration action manifest ${manifestPath}`, diagnostics);
  if (manifest.version !== 1) add(diagnostics, 'MIGRATION_ACTIONS_VERSION_UNSUPPORTED', `Migration action manifest version must be 1: ${manifestPath}.`);
  if (manifest.kind !== 'hia-uview-migration-actions') add(diagnostics, 'MIGRATION_ACTIONS_KIND_INVALID', `Migration action manifest kind is unsupported: ${manifestPath}.`);
  if (manifest.profile !== configuration.profile) add(diagnostics, 'MIGRATION_ACTIONS_PROFILE_MISMATCH', `Migration action manifest profile must match configuration profile: ${manifestPath}.`);
  // <lang><zh-CN>引用路径必须同时通过配置白名单与加载成功索引；没有备用 file scan。</zh-CN><en>The reference path must pass both configuration allowlist and successful-load index; there is no fallback file scan.</en></lang>
  const matrixPath = isSafeRelativePath(manifest.apiCompatibilityManifest) ? normalizeRelativePath(manifest.apiCompatibilityManifest) : null;
  if (!matrixPath || !(configuration.apiCompatibilityManifests ?? []).map(normalizeRelativePath).includes(matrixPath)) add(diagnostics, 'MIGRATION_ACTIONS_MATRIX_REFERENCE_INVALID', 'Migration action apiCompatibilityManifest must reference a matrix declared by configuration.');
  const matrix = matrixPath ? matrices.get(matrixPath) : null;
  if (!matrix) add(diagnostics, 'MIGRATION_ACTIONS_MATRIX_UNAVAILABLE', 'Migration action apiCompatibilityManifest must reference a valid loaded API compatibility matrix.');
  const index = matrix ? matrixIndex(matrix.manifest) : new Map();
  const scope = validateScope(manifest.scope, index, diagnostics);
  if (!Array.isArray(manifest.actions) || manifest.actions.length === 0) {
    add(diagnostics, 'MIGRATION_ACTIONS_ACTIONS_INVALID', 'Migration action manifest must contain a nonempty actions array.');
    return diagnostics;
  }
  // <lang><zh-CN>保留每项有效 ID，用于重复、顺序和“每个 scoped matrix item 恰一次”门禁。</zh-CN><en>Retains each valid ID for duplicate/order and “each scoped matrix item exactly once” gates.</en></lang>
  const ids = [];
  for (const action of manifest.actions) {
    const id = validateAction(action, scope, index, diagnostics);
    if (id) ids.push(id);
  }
  if (new Set(ids).size !== ids.length) add(diagnostics, 'MIGRATION_ACTIONS_ID_DUPLICATE', 'Migration action ids must not repeat.');
  // <lang><zh-CN>动作采用 component、itemId 两级代码点顺序；不能直接比较含 `/` 的复合 ID，否则分隔符会破坏前缀组件名称的自然顺序。</zh-CN><en>Actions use two-level code-point order by component and itemId; compound IDs containing `/` cannot be compared directly because the separator would disrupt natural prefix-component ordering.</en></lang>
  if (!isActionSorted(manifest.actions)) add(diagnostics, 'MIGRATION_ACTIONS_ORDER_INVALID', 'Migration actions must use code-point order by component and itemId.');
  // <lang><zh-CN>从 matrix 现场推导 expected ID，不信任 manifest 自报 count/summary。</zh-CN><en>Derives expected IDs live from the matrix and trusts no manifest-reported count or summary.</en></lang>
  const expected = [];
  for (const [component, items] of index) {
    if (!scope.components.has(component)) continue;
    for (const [itemId, item] of items) if (scope.priorities.has(item.priority)) expected.push(`${component}/${itemId}`);
  }
  const actual = [...new Set(ids)].sort();
  const required = expected.sort();
  if (actual.length !== required.length || actual.some((id, position) => id !== required[position])) add(diagnostics, 'MIGRATION_ACTIONS_SCOPE_COVERAGE_INVALID', 'Migration actions must cover every API item in declared component/priority scope exactly once.');
  return diagnostics;
}

/**
 * @lang zh-CN 从 configuration 明示的安全相对路径加载一份 action manifest，并只关联内存中已验证 matrix。
 * @lang en Loads one action manifest from a configuration-declared safe relative path and links it only to an in-memory validated matrix.
 * @param {string} rootDirectory <lang><zh-CN>Tool 调用根。</zh-CN><en>Tool invocation root.</en></lang>
 * @param {string} manifestPath <lang><zh-CN>配置声明的 action manifest 路径。</zh-CN><en>Configuration-declared action-manifest path.</en></lang>
 * @param {object} configuration <lang><zh-CN>已校验配置。</zh-CN><en>Validated configuration.</en></lang>
 * @param {Map<string, object>} matrices <lang><zh-CN>有效 matrix 路径索引。</zh-CN><en>Valid-matrix path index.</en></lang>
 * @returns {Promise<{path:string,manifest:object|null,diagnostics:Array<object>}>} <lang><zh-CN>安全路径、JSON/null 和稳定诊断。</zh-CN><en>Safe path, JSON/null, and stable diagnostics.</en></lang>
 */
export async function loadMigrationActionManifest(rootDirectory, manifestPath, configuration, matrices) {
  // <lang><zh-CN>底层 JSON loader 再次执行 path containment，只读取这一份白名单文件。</zh-CN><en>The underlying JSON loader applies path containment again and reads only this allowlisted file.</en></lang>
  const loaded = await readDeclaredJson(rootDirectory, manifestPath, 'MIGRATION_ACTIONS_MANIFEST');
  const path = normalizeRelativePath(manifestPath);
  if (loaded.diagnostics.length > 0) return { path, manifest: null, diagnostics: loaded.diagnostics };
  // <lang><zh-CN>validator 纯比较 metadata，不写入 manifest/matrix/configuration。</zh-CN><en>The validator compares metadata purely and writes neither manifest, matrix, nor configuration.</en></lang>
  return { path, manifest: loaded.value, diagnostics: validateMigrationActionManifest(loaded.value, path, configuration, matrices) };
}
