/**
 * @module generate-p0-migration-actions
 * @lang zh-CN 从已审计 API compatibility matrix v2 确定性生成 P0 迁移动作包；人工双语说明只有在来源指纹仍精确匹配时才会保留，生成器不读取 consumer、组件源码或文档正文，也不生成或执行代码迁移。
 * @lang en Deterministically generates the P0 migration-action packet from the reviewed API compatibility matrix v2; human-reviewed bilingual copy is retained only while its source fingerprint remains an exact match, and the generator reads no consumer, component source, or documentation body and neither generates nor executes code migrations.
 */

// <lang><zh-CN>Node crypto 只对规范化 matrix 事实计算 SHA-256，不签名、不联网，也不读取额外输入。</zh-CN><en>Node crypto computes SHA-256 only over canonicalized matrix facts; it neither signs, accesses the network, nor reads additional input.</en></lang>
import { createHash } from 'node:crypto';
// <lang><zh-CN>Node 文件 API 只读取两个已声明 JSON，并在显式 `--write` 时覆盖唯一目标。</zh-CN><en>Node file APIs read only two declared JSON files and overwrite the sole target only with explicit `--write`.</en></lang>
import { readFile, writeFile } from 'node:fs/promises';
// <lang><zh-CN>URL 转路径仅用于判断当前模块是否作为 CLI 直接执行。</zh-CN><en>URL-to-path conversion is used only to determine whether this module is executed directly as a CLI.</en></lang>
import { fileURLToPath } from 'node:url';
// <lang><zh-CN>路径解析固定仓库内三个声明位置，不接受调用方任意文件参数。</zh-CN><en>Path resolution fixes three repository-declared locations and accepts no arbitrary caller file argument.</en></lang>
import { resolve } from 'node:path';

/** @lang zh-CN 已生成 API compatibility matrix 的固定相对路径。 @lang en Fixed relative path of the generated API compatibility matrix. */
const matrixPath = 'HIA-uView-UI/hia-uview.api-compatibility.json';
/** @lang zh-CN P0 迁移动作包的固定相对路径。 @lang en Fixed relative path of the P0 migration-action packet. */
const actionPath = 'HIA-uView-UI/hia-uview.migration-actions.json';
/** @lang zh-CN matrix 中四个受控 API container 及其 item ID 前缀。 @lang en Four controlled API containers and their item-ID prefixes in the matrix. */
const dimensions = Object.freeze([
  ['props', 'prop'],
  ['events', 'event'],
  ['slots', 'slot'],
  ['imperativeApis', 'imperative']
]);
/** @lang zh-CN disposition 到只读调用方动作的唯一映射。 @lang en Sole mapping from disposition to a read-only caller action. */
const operations = Object.freeze({
  compatible: 'use-as-is',
  mapped: 'adapt-call-site',
  unsupported: 'keep-existing-or-compose'
});

/**
 * @lang zh-CN 使用 Unicode 代码点语义比较两个稳定标识，避免依赖主机 locale。
 * @lang en Compares two stable identifiers with Unicode code-point semantics and avoids host-locale dependence.
 * @param {string} left <lang><zh-CN>左值。</zh-CN><en>Left value.</en></lang>
 * @param {string} right <lang><zh-CN>右值。</zh-CN><en>Right value.</en></lang>
 * @returns {number} <lang><zh-CN>排序比较结果。</zh-CN><en>Sort comparison result.</en></lang>
 */
function compareCodePoints(left, right) {
  // <lang><zh-CN>严格相等不改变相对位置；其余直接按代码点先后返回。</zh-CN><en>Exact equality preserves relative position; all other values return direct code-point precedence.</en></lang>
  return left === right ? 0 : left < right ? -1 : 1;
}

/**
 * @lang zh-CN 把纯 JSON 值转换为递归键排序的规范字符串，使对象原始字段顺序不会改变指纹。
 * @lang en Converts a pure JSON value to a recursively key-sorted canonical string so original object-field order cannot change a fingerprint.
 * @param {unknown} value <lang><zh-CN>来自已解析 matrix 的纯 JSON 值。</zh-CN><en>Pure JSON value from the parsed matrix.</en></lang>
 * @returns {string} <lang><zh-CN>无空白的规范 JSON。</zh-CN><en>Whitespace-free canonical JSON.</en></lang>
 */
function canonicalizeJson(value) {
  // <lang><zh-CN>标量使用 JSON 自身编码，保持 string escape、boolean 与 null 语义一致。</zh-CN><en>Scalars use JSON's own encoding, preserving string escapes, booleans, and null semantics.</en></lang>
  if (value === null || typeof value !== 'object') {
    // <lang><zh-CN>matrix 必须是纯 JSON；undefined、function 与 symbol 没有可绑定的 JSON 表达。</zh-CN><en>The matrix must be pure JSON; undefined, functions, and symbols have no bindable JSON representation.</en></lang>
    const scalar = JSON.stringify(value);
    if (scalar === undefined) throw new Error('Source fingerprint input must be pure JSON.');
    return scalar;
  }
  // <lang><zh-CN>数组保留元素顺序，因为 semantics 中 evidence、parameter 与 side-effect 顺序属于完整事实。</zh-CN><en>Arrays preserve element order because evidence, parameter, and side-effect ordering is part of the complete semantics.</en></lang>
  if (Array.isArray(value)) return `[${value.map((entry) => canonicalizeJson(entry)).join(',')}]`;
  // <lang><zh-CN>对象键按稳定比较器排序，并为每个键和值递归编码。</zh-CN><en>Object keys use the stable comparator and recursively encode every key and value.</en></lang>
  const entries = Object.keys(value)
    .sort(compareCodePoints)
    .map((key) => `${JSON.stringify(key)}:${canonicalizeJson(value[key])}`);
  return `{${entries.join(',')}}`;
}

/**
 * @lang zh-CN 绑定 action identity、priority、当前 migration 三元组与完整 semantics，生成不可歧义的 SHA-256 来源指纹。
 * @lang en Binds action identity, priority, the current migration triple, and complete semantics into an unambiguous SHA-256 source fingerprint.
 * @param {string} componentName <lang><zh-CN>规范组件名。</zh-CN><en>Canonical component name.</en></lang>
 * @param {object} item <lang><zh-CN>当前 matrix item。</zh-CN><en>Current matrix item.</en></lang>
 * @returns {string} <lang><zh-CN>带 `sha256:` 前缀的来源指纹。</zh-CN><en>Source fingerprint prefixed with `sha256:`.</en></lang>
 */
function buildSourceFingerprint(componentName, item) {
  // <lang><zh-CN>固定 payload 明确包含要求绑定的全部字段；缺失 target 规范化为 null，避免 undefined 被静默省略。</zh-CN><en>The fixed payload explicitly includes every required bound field; an absent target normalizes to null so undefined cannot disappear silently.</en></lang>
  const payload = {
    component: componentName,
    itemId: item.id,
    priority: item.priority,
    migration: {
      target: item.migration?.target ?? null,
      disposition: item.migration?.disposition,
      reasonCode: item.migration?.reasonCode
    },
    semantics: item.semantics
  };
  // <lang><zh-CN>UTF-8 SHA-256 只覆盖规范 payload；guidance、limitations 和 docs 不参与来源事实绑定。</zh-CN><en>UTF-8 SHA-256 covers only the canonical payload; guidance, limitations, and docs do not participate in source-fact binding.</en></lang>
  return `sha256:${createHash('sha256').update(canonicalizeJson(payload), 'utf8').digest('hex')}`;
}

/**
 * @lang zh-CN 验证并解析唯一允许的 `--check` 或 `--write` 模式。
 * @lang en Validates and parses the sole allowed `--check` or `--write` mode.
 * @param {string[]} argumentsList <lang><zh-CN>CLI 参数。</zh-CN><en>CLI arguments.</en></lang>
 * @returns {'check'|'write'} <lang><zh-CN>受控执行模式。</zh-CN><en>Controlled execution mode.</en></lang>
 */
function parseMode(argumentsList) {
  // <lang><zh-CN>无参数默认只读 check，降低意外覆盖 metadata 的可能。</zh-CN><en>No arguments default to read-only check, reducing accidental metadata overwrite.</en></lang>
  if (argumentsList.length === 0 || (argumentsList.length === 1 && argumentsList[0] === '--check')) return 'check';
  // <lang><zh-CN>只有单一显式 write 参数才能进入写入分支。</zh-CN><en>Only one explicit write argument may enter the write branch.</en></lang>
  if (argumentsList.length === 1 && argumentsList[0] === '--write') return 'write';
  // <lang><zh-CN>拒绝路径、脚本或组合参数，保持生成器输入边界固定。</zh-CN><en>Reject paths, scripts, or combined arguments so generator input boundaries remain fixed.</en></lang>
  throw new Error('Usage: node scripts/generate-p0-migration-actions.mjs [--check|--write]');
}

/**
 * @lang zh-CN 为一个组件建立确定、仓内公开 Markdown 引用，不读取文档正文。
 * @lang en Builds deterministic repository-local public Markdown references for one component without reading documentation bodies.
 * @param {string} componentName <lang><zh-CN>规范 `u-*` 组件名。</zh-CN><en>Canonical `u-*` component name.</en></lang>
 * @param {string} disposition <lang><zh-CN>当前 matrix disposition。</zh-CN><en>Current matrix disposition.</en></lang>
 * @returns {string[]} <lang><zh-CN>代码点排序的文档路径。</zh-CN><en>Code-point-sorted documentation paths.</en></lang>
 */
function buildDocumentationReferences(componentName, disposition) {
  // <lang><zh-CN>组件名先通过有限字符门禁，避免名称被解释为路径。</zh-CN><en>The component name first passes a bounded-character gate so it cannot be interpreted as a path.</en></lang>
  if (!/^u-[a-z0-9-]+$/.test(componentName)) throw new Error(`Invalid component name in P0 matrix: ${componentName}.`);
  // <lang><zh-CN>所有 action 至少引用对应组件公开文档。</zh-CN><en>Every action references at least the matching public component documentation.</en></lang>
  const references = [`docs/${componentName.slice(2)}.md`];
  // <lang><zh-CN>需要适配或组合的 action 同时指向通用迁移边界。</zh-CN><en>An action requiring adaptation or composition also references the general migration boundary.</en></lang>
  if (disposition !== 'compatible') references.push('docs/migration-from-uview.md');
  // <lang><zh-CN>显式排序满足 Tool 的稳定顺序门禁，不依赖插入偶然性。</zh-CN><en>Explicit sorting satisfies the Tool's stable-order gate without relying on insertion happenstance.</en></lang>
  return references.sort(compareCodePoints);
}

/**
 * @lang zh-CN 为没有既有人工说明的 P0 item 构造有限双语调用方指引。
 * @lang en Builds bounded bilingual caller guidance for a P0 item without existing human-authored copy.
 * @param {string} componentName <lang><zh-CN>组件名。</zh-CN><en>Component name.</en></lang>
 * @param {object} item <lang><zh-CN>已审计 matrix item。</zh-CN><en>Reviewed matrix item.</en></lang>
 * @returns {{guidance:{en:string,'zh-Hans':string},limitations:{en:string,'zh-Hans':string}}} <lang><zh-CN>不执行的双语说明。</zh-CN><en>Non-executable bilingual copy.</en></lang>
 */
function buildCopy(componentName, item) {
  // <lang><zh-CN>目标只来自 matrix 明示 migration target；unsupported 不猜测替代 API。</zh-CN><en>The target comes only from the explicit matrix migration target; unsupported items infer no replacement API.</en></lang>
  const target = item.migration.target ?? '';

  if (item.migration.disposition === 'compatible') {
    // <lang><zh-CN>compatible 指引只声明已审 P0 调用面，不把上游内部实现带入 HIA。</zh-CN><en>Compatible guidance states only the reviewed P0 call surface and does not bring upstream internals into HIA.</en></lang>
    return {
      guidance: {
        en: `Use ${componentName} ${item.id} through the reviewed HIA target ${target}; keep caller values within its P0 semantic contract.`,
        'zh-Hans': `通过已审计的 HIA 目标 ${target} 使用 ${componentName} ${item.id}，并让调用方取值保持在其 P0 语义契约内。`
      },
      limitations: {
        en: 'Compatibility is limited to the recorded P0 contract and does not adopt upstream internal state, services, networking, identity, or business rules.',
        'zh-Hans': '兼容结论只覆盖已记录的 P0 契约，不吸收上游内部状态、service、网络、身份或业务规则。'
      }
    };
  }

  if (item.migration.disposition === 'mapped') {
    // <lang><zh-CN>mapped 指引要求调用方核对逐项语义，不能把同名当作行为等价。</zh-CN><en>Mapped guidance requires per-item semantic review and never treats a shared name as behavioral equivalence.</en></lang>
    return {
      guidance: {
        en: `Adapt the caller from upstream ${componentName} ${item.id} to HIA target ${target}, following the recorded payload, binding, ownership, and lifecycle facts.`,
        'zh-Hans': `把调用方从上游 ${componentName} ${item.id} 适配到 HIA 目标 ${target}，并遵循已记录的 payload、binding、ownership 与 lifecycle 事实。`
      },
      limitations: {
        en: 'A shared name is not behavioral equivalence; retain no upstream handler, slot, parent-child, or service assumption without an explicit review.',
        'zh-Hans': '同名不等于行为等价；未经明确审计，不得保留上游 handler、slot、父子关系或 service 假设。'
      }
    };
  }

  // <lang><zh-CN>unsupported 是已审计缺口；动作仅保留或组合调用方能力，不伪造 HIA target。</zh-CN><en>Unsupported is a reviewed gap; the action only retains or composes caller capability and invents no HIA target.</en></lang>
  return {
    guidance: {
      en: `Keep or explicitly compose the caller-side behavior for upstream ${componentName} ${item.id}; HIA currently exposes no reviewed target.`,
      'zh-Hans': `为上游 ${componentName} ${item.id} 保留或显式组合调用方行为；HIA 当前没有已审计目标。`
    },
    limitations: {
      en: 'This records a current delivery gap only; it adds no runtime behavior, service, patch, script, or automatic migration.',
      'zh-Hans': '这只记录当前交付缺口；不会增加 runtime 行为、service、patch、script 或自动迁移。'
    }
  };
}

/**
 * @lang zh-CN 从 matrix item 与可选既有人工 action 建立单一规范 action。
 * @lang en Builds one canonical action from a matrix item and an optional existing human-authored action.
 * @param {string} componentName <lang><zh-CN>组件名。</zh-CN><en>Component name.</en></lang>
 * @param {object} item <lang><zh-CN>P0 matrix item。</zh-CN><en>P0 matrix item.</en></lang>
 * @param {object|null} existing <lang><zh-CN>相同 ID 的既有 action。</zh-CN><en>Existing action with the same ID.</en></lang>
 * @returns {object} <lang><zh-CN>规范动作记录。</zh-CN><en>Canonical action record.</en></lang>
 */
function buildAction(componentName, item, existing) {
  // <lang><zh-CN>matrix v2 的完成信号是进入 P0 action packet 的前置条件。</zh-CN><en>The matrix-v2 completion signal is a prerequisite for entering the P0 action packet.</en></lang>
  if (item.semantics?.reviewState !== 'complete') throw new Error(`P0 item lacks complete semantics: ${componentName}/${item.id}.`);
  // <lang><zh-CN>disposition 必须能机械映射到固定 operation，未知值直接拒绝。</zh-CN><en>The disposition must map mechanically to a fixed operation; an unknown value is rejected.</en></lang>
  const operation = operations[item.migration?.disposition];
  if (!operation) throw new Error(`P0 item has an unsupported disposition: ${componentName}/${item.id}.`);
  // <lang><zh-CN>来源指纹先由当前 matrix 事实独立生成，旧 manifest 的自报值不能参与计算。</zh-CN><en>The source fingerprint is independently generated from current matrix facts; a previous manifest's reported value cannot influence it.</en></lang>
  const sourceFingerprint = buildSourceFingerprint(componentName, item);
  // <lang><zh-CN>双语文案只有在旧指纹与当前事实精确匹配时才复用；不匹配时立即回到当前事实生成的保守说明。</zh-CN><en>Bilingual copy is reused only when the previous fingerprint exactly matches current facts; a mismatch immediately falls back to conservative copy generated from current facts.</en></lang>
  const mayReuseCopy = existing?.sourceFingerprint === sourceFingerprint;
  const copy = mayReuseCopy
    ? { guidance: existing.guidance, limitations: existing.limitations }
    : buildCopy(componentName, item);

  return {
    id: `${componentName}/${item.id}`,
    component: componentName,
    itemId: item.id,
    priority: 'P0',
    sourceFingerprint,
    disposition: item.migration.disposition,
    operation,
    guidance: copy.guidance,
    limitations: copy.limitations,
    docs: buildDocumentationReferences(componentName, item.migration.disposition)
  };
}

/**
 * @lang zh-CN 从 matrix v2 与上一份动作包建立 30 组件、127 项的确定 manifest。
 * @lang en Builds the deterministic 30-component, 127-item manifest from matrix v2 and the previous action packet.
 * @param {object} matrix <lang><zh-CN>已生成 matrix v2。</zh-CN><en>Generated matrix v2.</en></lang>
 * @param {object} previousManifest <lang><zh-CN>用于保留既有人工文案的上一份动作包。</zh-CN><en>Previous action packet used to preserve existing human copy.</en></lang>
 * @returns {object} <lang><zh-CN>规范动作 manifest。</zh-CN><en>Canonical action manifest.</en></lang>
 */
export function buildMigrationActionManifest(matrix, previousManifest) {
  // <lang><zh-CN>生成器只接受 matrix v2；旧 action manifest 的只读兼容属于 Tool，不降低新产物版本。</zh-CN><en>The generator accepts only matrix v2; read-only compatibility for old action manifests belongs to the Tool and does not lower the new output version.</en></lang>
  if (matrix?.version !== 2 || !Array.isArray(matrix.components)) throw new Error('P0 migration actions require API compatibility matrix v2.');
  // <lang><zh-CN>既有 action 只按稳定 ID 建索引；重复 ID 会丢失人工说明，因此直接拒绝。</zh-CN><en>Existing actions are indexed only by stable ID; duplicate IDs would lose human copy and are therefore rejected.</en></lang>
  const previousActions = Array.isArray(previousManifest?.actions) ? previousManifest.actions : [];
  const previousById = new Map(previousActions.map((action) => [action.id, action]));
  if (previousById.size !== previousActions.length) throw new Error('Existing migration actions contain duplicate IDs.');
  // <lang><zh-CN>scope 与 action 都从 matrix 现场派生，不信任上一份 manifest 的自报范围。</zh-CN><en>Both scope and actions are derived live from the matrix and never trust the previous manifest's self-reported range.</en></lang>
  const components = [];
  const actions = [];

  for (const component of matrix.components) {
    // <lang><zh-CN>逐 container 收集 P0，并用 item ID 排序保证维度插入顺序不会改变产物。</zh-CN><en>Collect P0 items across containers and sort by item ID so dimension insertion order cannot change output.</en></lang>
    const p0Items = dimensions
      .flatMap(([dimension, prefix]) => {
        // <lang><zh-CN>缺失 container 是 matrix 结构错误；前缀门禁防止跨维度伪造 ID。</zh-CN><en>A missing container is a matrix-shape error; the prefix gate prevents cross-dimension forged IDs.</en></lang>
        const items = component?.[dimension]?.items;
        if (!Array.isArray(items)) throw new Error(`Matrix component lacks ${dimension}: ${component?.name ?? 'unknown'}.`);
        return items.filter((item) => {
          if (item.priority !== 'P0') return false;
          if (!item.id?.startsWith(`${prefix}:`)) throw new Error(`P0 item has the wrong dimension prefix: ${component.name}/${item.id}.`);
          return true;
        });
      })
      .sort((left, right) => compareCodePoints(left.id, right.id));
    // <lang><zh-CN>没有 P0 的 comparison component 不进入 action scope。</zh-CN><en>A comparison component without P0 items does not enter action scope.</en></lang>
    if (p0Items.length === 0) continue;
    components.push(component.name);
    // <lang><zh-CN>每个 P0 item 恰生成一个 action，并只按相同稳定 ID 复用旧文案。</zh-CN><en>Every P0 item generates exactly one action and reuses old copy only by the same stable ID.</en></lang>
    for (const item of p0Items) {
      const id = `${component.name}/${item.id}`;
      actions.push(buildAction(component.name, item, previousById.get(id) ?? null));
    }
  }

  // <lang><zh-CN>两级代码点排序与 Tool validator 使用相同规则，避免 `/` 破坏前缀组件顺序。</zh-CN><en>Two-level code-point sorting matches the Tool validator and prevents `/` from disrupting prefix-component order.</en></lang>
  components.sort(compareCodePoints);
  actions.sort((left, right) => compareCodePoints(left.component, right.component) || compareCodePoints(left.itemId, right.itemId));
  // <lang><zh-CN>重复 ID 表示 matrix 自身冲突，不能由后写覆盖。</zh-CN><en>A duplicate ID means the matrix itself conflicts and cannot be resolved by last-write wins.</en></lang>
  const generatedIds = new Set(actions.map((action) => action.id));
  if (generatedIds.size !== actions.length) throw new Error('Generated migration actions contain duplicate IDs.');
  // <lang><zh-CN>上一份人工 action 若已脱离当前 P0 scope，必须先显式审阅，不能被 write 静默丢弃。</zh-CN><en>An existing human-authored action outside the current P0 scope requires explicit review and cannot be silently discarded by write.</en></lang>
  const staleIds = previousActions.map((action) => action.id).filter((id) => !generatedIds.has(id));
  if (staleIds.length > 0) throw new Error(`Existing migration actions are outside the current P0 scope: ${staleIds.sort(compareCodePoints).join(', ')}.`);

  return {
    version: 2,
    kind: 'hia-uview-migration-actions',
    profile: matrix.profile,
    apiCompatibilityManifest: matrixPath,
    scope: { components, priorities: ['P0'] },
    actions
  };
}

/**
 * @lang zh-CN 执行固定输入的 check/write 流程，并返回生成摘要。
 * @lang en Runs the fixed-input check/write flow and returns a generation summary.
 * @param {'check'|'write'} mode <lang><zh-CN>受控模式。</zh-CN><en>Controlled mode.</en></lang>
 * @param {string} rootDirectory <lang><zh-CN>仓库根目录。</zh-CN><en>Repository root directory.</en></lang>
 * @returns {Promise<{actionCount:number,componentCount:number,changed:boolean}>} <lang><zh-CN>现场派生摘要。</zh-CN><en>Live-derived summary.</en></lang>
 */
export async function generateP0MigrationActions(mode, rootDirectory = process.cwd()) {
  // <lang><zh-CN>两个输入路径固定在仓库根下，不接受 manifest 内路径作为读取入口。</zh-CN><en>Both input paths are fixed under the repository root and accept no manifest-provided read location.</en></lang>
  const matrixFile = resolve(rootDirectory, matrixPath);
  const actionFile = resolve(rootDirectory, actionPath);
  // <lang><zh-CN>并行读取稳定 UTF-8 输入；JSON parse 不执行其文本。</zh-CN><en>Read stable UTF-8 inputs in parallel; JSON parsing executes none of their text.</en></lang>
  const [matrixSource, previousSource] = await Promise.all([readFile(matrixFile, 'utf8'), readFile(actionFile, 'utf8')]);
  const matrix = JSON.parse(matrixSource);
  const previousManifest = JSON.parse(previousSource);
  // <lang><zh-CN>规范 JSON 使用两个空格、LF 与结尾换行，确保跨主机 byte deterministic。</zh-CN><en>Canonical JSON uses two spaces, LF, and a trailing newline for cross-host byte determinism.</en></lang>
  const manifest = buildMigrationActionManifest(matrix, previousManifest);
  const generatedSource = `${JSON.stringify(manifest, null, 2)}\n`;
  const changed = generatedSource !== previousSource.replace(/\r\n/g, '\n');

  if (mode === 'write') {
    // <lang><zh-CN>显式 write 只覆盖声明 action 文件，不创建其他输出。</zh-CN><en>Explicit write overwrites only the declared action file and creates no other output.</en></lang>
    await writeFile(actionFile, generatedSource, 'utf8');
  } else if (changed) {
    // <lang><zh-CN>check 模式用稳定错误要求维护者显式重生成，不暗中修复。</zh-CN><en>Check mode uses a stable error requiring explicit regeneration and performs no silent repair.</en></lang>
    throw new Error('P0 migration action manifest is stale; run with --write.');
  }

  return { actionCount: manifest.actions.length, componentCount: manifest.scope.components.length, changed };
}

// <lang><zh-CN>只有直接执行当前文件才运行 CLI；测试 import 不产生文件 I/O 副作用。</zh-CN><en>Run the CLI only when this file is executed directly; test imports have no file-I/O side effects.</en></lang>
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // <lang><zh-CN>解析模式后执行固定生成流程，并输出不含绝对路径的简洁摘要。</zh-CN><en>Parse the mode, run the fixed generation flow, and print a concise summary containing no absolute path.</en></lang>
  const mode = parseMode(process.argv.slice(2));
  const result = await generateP0MigrationActions(mode);
  process.stdout.write(`P0 migration actions: ${result.actionCount} actions across ${result.componentCount} components (${mode}).\n`);
}
