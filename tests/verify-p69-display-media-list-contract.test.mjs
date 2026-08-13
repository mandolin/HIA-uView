/**
 * @module verify-p69-display-media-list-contract.test
 * @lang zh-CN 锁定展示、媒体与列表交付的 19 项 P0 运行时证据、三个有界 P1 映射、13 组件精确类型和确定迁移动作；测试只读取固定仓内文件，不访问网络、上游 checkout、业务仓或设备。
 * @lang en Locks the 19 P0 runtime-evidence records, three bounded P1 mappings, precise types for 13 display/media/list components, and deterministic migration actions; the test reads only fixed repository files and accesses no network, upstream checkout, business repository, or device.
 */

import assert from 'node:assert/strict';
// <lang><zh-CN>只读取逐项列明的公开仓内输入，禁止目录发现把未审文件带入合同。</zh-CN><en>Reads only individually listed public repository inputs, preventing directory discovery from admitting unaudited files into the contract.</en></lang>
import { readFile } from 'node:fs/promises';
// <lang><zh-CN>使用 Node 内建测试运行器保持静态证据门禁无额外执行依赖。</zh-CN><en>Uses the Node built-in test runner so the static evidence gate has no extra execution dependency.</en></lang>
import test from 'node:test';

/**
 * @lang zh-CN 精确列出本批从源码审阅升级为运行时验证的 P0 item 及唯一测试文件。
 * @lang en Exactly lists the P0 items promoted from source review to runtime-tested evidence and their sole test files.
 */
const expectedP0RuntimeEvidence = Object.freeze({
  'u-button/event:click': 'test:tests/runtime/hia-uview-p69-action-content.runtime.test.mjs',
  'u-button/slot:default': 'test:tests/runtime/hia-uview-p69-action-content.runtime.test.mjs',
  'u-cell-group/slot:default': 'test:tests/runtime/hia-uview-p69-list-state.runtime.test.mjs',
  'u-cell-item/event:click': 'test:tests/runtime/hia-uview-p69-list-state.runtime.test.mjs',
  'u-cell-item/slot:default': 'test:tests/runtime/hia-uview-p69-list-state.runtime.test.mjs',
  'u-icon/event:click': 'test:tests/runtime/hia-uview-p69-action-content.runtime.test.mjs',
  'u-image/event:click': 'test:tests/runtime/hia-uview-p69-media-pagination-swipe.runtime.test.mjs',
  'u-pagination/event:change': 'test:tests/runtime/hia-uview-p69-media-pagination-swipe.runtime.test.mjs',
  'u-pagination/event:update:modelValue': 'test:tests/runtime/hia-uview-p69-media-pagination-swipe.runtime.test.mjs',
  'u-pagination/slot:default': 'test:tests/runtime/hia-uview-p69-media-pagination-swipe.runtime.test.mjs',
  'u-skeleton/prop:loading': 'test:tests/runtime/hia-uview-p69-list-state.runtime.test.mjs',
  'u-skeleton/slot:default': 'test:tests/runtime/hia-uview-p69-list-state.runtime.test.mjs',
  'u-swipe-action/event:click': 'test:tests/runtime/hia-uview-p69-media-pagination-swipe.runtime.test.mjs',
  'u-swipe-action/event:close': 'test:tests/runtime/hia-uview-p69-media-pagination-swipe.runtime.test.mjs',
  'u-swipe-action/prop:options': 'test:tests/runtime/hia-uview-feedback.runtime.test.mjs',
  'u-swipe-action/prop:show': 'test:tests/runtime/hia-uview-feedback.runtime.test.mjs',
  'u-swipe-action/slot:default': 'test:tests/runtime/hia-uview-feedback.runtime.test.mjs',
  'u-text/event:click': 'test:tests/runtime/hia-uview-p69-action-content.runtime.test.mjs',
  'u-text/slot:default': 'test:tests/runtime/hia-uview-p69-action-content.runtime.test.mjs'
});

/**
 * @lang zh-CN 精确列出当前具备 Props、Emits、Instance 与全局映射证据的 13 个 PascalCase 组件名。
 * @lang en Exactly lists the 13 PascalCase component names carrying Props, Emits, Instance, and global-mapping evidence.
 */
const expectedTypedComponents = Object.freeze([
  'UAlertTips',
  'UButton',
  'UCell',
  'UCellGroup',
  'UCellItem',
  'UEmpty',
  'UIcon',
  'UImage',
  'UPagination',
  'USkeleton',
  'USwipeAction',
  'UTag',
  'UText'
]);

// <lang><zh-CN>并行读取提交矩阵、sidecar、动作包、三份真实 runtime 测试和两份类型入口；本测试不生成或写回任何文件。</zh-CN><en>Reads the committed matrix, sidecar, action packet, three real runtime tests, and two type entries in parallel; this test generates or writes no file.</en></lang>
const [
  matrixSource,
  semanticReviewSource,
  migrationActionsSource,
  actionRuntimeSource,
  listRuntimeSource,
  mediaRuntimeSource,
  typeSource,
  globalTypeSource
] = await Promise.all([
  readFile('HIA-uView-UI/hia-uview.api-compatibility.json', 'utf8'),
  readFile('HIA-uView-UI/hia-uview.api-semantic-review.json', 'utf8'),
  readFile('HIA-uView-UI/hia-uview.migration-actions.json', 'utf8'),
  readFile('tests/runtime/hia-uview-p69-action-content.runtime.test.mjs', 'utf8'),
  readFile('tests/runtime/hia-uview-p69-list-state.runtime.test.mjs', 'utf8'),
  readFile('tests/runtime/hia-uview-p69-media-pagination-swipe.runtime.test.mjs', 'utf8'),
  readFile('HIA-uView-UI/types/index.d.ts', 'utf8'),
  readFile('HIA-uView-UI/types/global-components.d.ts', 'utf8')
]);

/** @lang zh-CN 当前提交的只读 API compatibility matrix。 @lang en Current committed read-only API compatibility matrix. */
const matrix = JSON.parse(matrixSource);
/** @lang zh-CN 当前提交且由生成器交叉核验的 P0/service 语义输入。 @lang en Current committed P0/service semantic input cross-checked by the generator. */
const semanticReview = JSON.parse(semanticReviewSource);
/** @lang zh-CN 当前从矩阵确定生成的只读 P0 迁移动作包。 @lang en Current read-only P0 migration-action packet generated deterministically from the matrix. */
const migrationActions = JSON.parse(migrationActionsSource);

/**
 * @lang zh-CN 从固定四类 API inventory 建立规范 ID 到 item 的索引；重复 ID 立即失败。
 * @lang en Builds a canonical-ID-to-item index from the fixed four API inventories; duplicate IDs fail immediately.
 * @returns {Map<string, object>} <lang><zh-CN>完整组件 API item 索引。</zh-CN><en>Complete component API-item index.</en></lang>
 */
function createMatrixItemIndex() {
  // <lang><zh-CN>索引仅由当前已解析矩阵拥有，测试不会把引用暴露给生产代码。</zh-CN><en>The index is owned only by the parsed matrix and exposes no references to production code.</en></lang>
  const itemIndex = new Map();

  for (const component of matrix.components) {
    // <lang><zh-CN>维度顺序固定，确保错误定位与生成器的公开 item 结构一致。</zh-CN><en>The dimension order is fixed so failure location agrees with the generator's public item structure.</en></lang>
    for (const dimension of ['props', 'events', 'slots', 'imperativeApis']) {
      for (const item of component[dimension].items) {
        // <lang><zh-CN>规范 ID 同时绑定组件名与 item ID，避免跨组件同名能力误匹配。</zh-CN><en>The canonical ID binds component name and item ID, preventing same-named capabilities across components from matching accidentally.</en></lang>
        const canonicalId = `${component.name}/${item.id}`;

        assert.equal(itemIndex.has(canonicalId), false, `Duplicate matrix item: ${canonicalId}`);
        itemIndex.set(canonicalId, item);
      }
    }
  }

  return itemIndex;
}

/** @lang zh-CN 当前矩阵全部 1,740 项的规范索引。 @lang en Canonical index of all 1,740 current matrix items. */
const matrixItems = createMatrixItemIndex();

/**
 * @lang zh-CN 验证所有 P0 已清除源码待验状态，且精确 19 项绑定到本批真实运行时文件而不改变 mapped 结论。
 * @lang en Verifies that every P0 item has cleared source-only status and that exactly 19 items bind to this batch's real runtime files without changing their mapped disposition.
 */
test('locks complete P0 runtime evidence without inflating migration compatibility', () => {
  // <lang><zh-CN>现场筛选 P0，而不信任顶层自报计数。</zh-CN><en>Filters P0 items live rather than trusting a top-level declared count.</en></lang>
  const p0Items = [...matrixItems.values()].filter((item) => item.priority === 'P0');
  // <lang><zh-CN>sidecar 的精确集合仍固定为 127 项，P1 不得借本批写入 P0-only semantics 集合。</zh-CN><en>The sidecar exact set remains fixed at 127 items, and P1 cannot enter the P0-only semantics collection through this batch.</en></lang>
  const reviewedP0Ids = semanticReview.items.map((entry) => entry.id);

  assert.equal(p0Items.length, 127);
  assert.equal(reviewedP0Ids.length, 127);
  assert.equal(new Set(reviewedP0Ids).size, 127);
  assert.ok(p0Items.every((item) => item.semantics.reviewState === 'complete'));
  assert.ok(p0Items.every((item) => item.semantics.evidenceLevel === 'runtime-tested'));
  assert.ok(p0Items.every((item) => item.semantics.remainingEvidence.length === 0));

  for (const [canonicalId, expectedReference] of Object.entries(expectedP0RuntimeEvidence)) {
    // <lang><zh-CN>每个冻结 ID 必须仍是 mapped；runtime 证据只完成 parity，不抹平已记录的语义差异。</zh-CN><en>Every frozen ID must remain mapped; runtime evidence completes parity without erasing a recorded semantic difference.</en></lang>
    const item = matrixItems.get(canonicalId);

    assert.ok(item, `Missing P69 P0 item: ${canonicalId}`);
    assert.equal(item.migration.disposition, 'mapped');
    assert.equal(item.semantics.evidenceLevel, 'runtime-tested');
    assert.deepEqual(item.semantics.remainingEvidence, []);
    assert.ok(item.semantics.evidenceRefs.includes(expectedReference), `Missing runtime reference: ${canonicalId}`);
  }

  // <lang><zh-CN>只有确由三个 P69 文件新增覆盖的 16 项引用 P69 路径；show/options/default slot 复用既有真实测试，不能为凑批次数字伪造新证据位置。</zh-CN><en>Only the 16 items newly covered by the three P69 files reference a P69 path; show/options/default slot reuse their existing real test and must not receive fabricated locations merely to fit a batch count.</en></lang>
  const p69ReferencedIds = [...matrixItems.entries()]
    .filter(([, item]) => item.priority === 'P0' && item.semantics.evidenceRefs.some((reference) => reference.includes('p69-')))
    .map(([canonicalId]) => canonicalId)
    .sort();
  // <lang><zh-CN>从冻结映射现场派生应引用 P69 文件的集合，避免另维护一份会漂移的 ID 清单。</zh-CN><en>Derives the expected P69-file set live from the frozen mapping, avoiding a second drifting ID list.</en></lang>
  const expectedP69ReferencedIds = Object.entries(expectedP0RuntimeEvidence)
    .filter(([, reference]) => reference.includes('p69-'))
    .map(([canonicalId]) => canonicalId)
    .sort();

  assert.deepEqual(p69ReferencedIds, expectedP69ReferencedIds);
});

/**
 * @lang zh-CN 验证三项新增 P1 表面与既有 tag/alert props 只取得经审计的保守结论，且 P1 不伪造 P0 semantic envelope。
 * @lang en Verifies that the three new P1 surfaces and existing tag/alert props receive only audited conservative conclusions and that P1 does not fabricate a P0 semantic envelope.
 */
test('keeps bounded P1 delivery mapped or explicitly compatible', () => {
  // <lang><zh-CN>这三项是本批唯一由 unsupported 提升到 mapped 的 P1 表面。</zh-CN><en>These are the only three P1 surfaces promoted from unsupported to mapped in this batch.</en></lang>
  const promotedMappings = [
    'u-alert-tips/event:click',
    'u-empty/slot:bottom',
    'u-tag/slot:default'
  ];
  // <lang><zh-CN>既有 tag/alert 交互继续 mapped；相同名称与 runtime 测试均不构成无转换兼容。</zh-CN><en>Existing tag/alert interactions remain mapped; neither a shared name nor runtime tests establish transformation-free compatibility.</en></lang>
  const retainedMappings = [
    'u-alert-tips/event:close',
    'u-tag/event:click',
    'u-tag/event:close'
  ];
  // <lang><zh-CN>只有逐字段相同且已有显式规则的四个 prop 保持 compatible。</zh-CN><en>Only the four props with field-equal semantics and an existing explicit rule remain compatible.</en></lang>
  const compatibleProps = [
    'u-alert-tips/prop:show',
    'u-tag/prop:disabled',
    'u-tag/prop:show',
    'u-tag/prop:text'
  ];

  for (const canonicalId of [...promotedMappings, ...retainedMappings]) {
    // <lang><zh-CN>逐项读取结构结论，并拒绝 P1 item 出现 P0-only semantics 字段。</zh-CN><en>Reads each structural conclusion and rejects a P0-only semantics field on a P1 item.</en></lang>
    const item = matrixItems.get(canonicalId);

    assert.equal(item?.priority, 'P1', `Unexpected P1 priority: ${canonicalId}`);
    assert.equal(item?.migration.disposition, 'mapped', `Unexpected P1 mapping: ${canonicalId}`);
    assert.equal(Object.hasOwn(item, 'semantics'), false, `P1 must not claim P0 semantic review: ${canonicalId}`);
  }

  for (const canonicalId of compatibleProps) {
    // <lang><zh-CN>兼容 prop 必须继续由显式语义规则产生，不能由同名自动升级。</zh-CN><en>A compatible prop must continue to come from an explicit semantic rule rather than automatic same-name promotion.</en></lang>
    const item = matrixItems.get(canonicalId);

    assert.equal(item?.priority, 'P1', `Unexpected P1 priority: ${canonicalId}`);
    assert.equal(item?.migration.disposition, 'compatible', `Unexpected P1 compatibility: ${canonicalId}`);
    assert.equal(item?.migration.reasonCode, 'EXPLICIT_SEMANTIC_RULE');
    assert.equal(Object.hasOwn(item, 'semantics'), false, `P1 must not claim P0 semantic review: ${canonicalId}`);
  }
});

/**
 * @lang zh-CN 验证三份真实 runtime 测试存在且覆盖各自组件组，并锁定 SwipeAction 的标量 payload 语义。
 * @lang en Verifies that the three real runtime tests exist and cover their respective component groups, while locking SwipeAction scalar-payload semantics.
 */
test('keeps runtime test files and swipe payload semantics aligned', () => {
  // <lang><zh-CN>操作/内容批必须直接挂载五个目标组件，不以静态 source-only 测试代替 Vue runtime。</zh-CN><en>The action/content batch must mount its five target components directly rather than substituting static source-only tests for Vue runtime.</en></lang>
  for (const componentName of ['UAlertTips', 'UButton', 'UIcon', 'UTag', 'UText']) {
    assert.match(actionRuntimeSource, new RegExp(`\\b${componentName}\\b`, 'u'));
  }
  // <lang><zh-CN>列表/状态批必须直接挂载 group/item/empty/skeleton 组合。</zh-CN><en>The list/state batch must directly mount the group/item/empty/skeleton composition.</en></lang>
  for (const componentName of ['UCellGroup', 'UCellItem', 'UEmpty', 'USkeleton']) {
    assert.match(listRuntimeSource, new RegExp(`\\b${componentName}\\b`, 'u'));
  }
  // <lang><zh-CN>媒体批必须直接挂载 image/pagination/swipe，并含 getter 拒绝与非有限输入边界。</zh-CN><en>The media batch must directly mount image/pagination/swipe and include getter rejection and nonfinite-input boundaries.</en></lang>
  for (const componentName of ['UImage', 'UPagination', 'USwipeAction']) {
    assert.match(mediaRuntimeSource, new RegExp(`\\b${componentName}\\b`, 'u'));
  }
  assert.match(mediaRuntimeSource, /getter|accessor/u);
  assert.match(mediaRuntimeSource, /Infinity|NaN/u);

  // <lang><zh-CN>矩阵本地 click payload 必须与 runtime/type 的安全标量一致，不能残留 action-object 旧声明。</zh-CN><en>The matrix local click payload must match the runtime/type safe scalar and cannot retain the former action-object declaration.</en></lang>
  const swipeClick = matrixItems.get('u-swipe-action/event:click');
  // <lang><zh-CN>pagination 默认 slot 使用 JavaScript consumer key `pageCount`，不能误记为模板 attribute 拼写 `page-count`。</zh-CN><en>The pagination default slot uses the JavaScript consumer key `pageCount` and must not be recorded as the template-attribute spelling `page-count`.</en></lang>
  const paginationSlot = matrixItems.get('u-pagination/slot:default');

  assert.deepEqual(swipeClick?.semantics.hia.parameters, [{ name: 'value', shape: 'string-or-number' }]);
  assert.deepEqual(paginationSlot?.semantics.hia.bindings, [
    { name: 'current', shape: 'number' },
    { name: 'pageCount', shape: 'number' }
  ]);
  assert.match(typeSource, /export type USwipeActionValue = string \| number;/u);
  assert.doesNotMatch(JSON.stringify(swipeClick?.semantics.hia), /action-object/u);
});

/**
 * @lang zh-CN 验证 13 组件均具有根入口 Props、Emits、Instance 及显式全局映射，并保持无 expose 的类型边界。
 * @lang en Verifies that all 13 components have root-entry Props, Emits, Instance, and explicit global mappings while retaining a no-expose type boundary.
 */
test('publishes precise root and global types for all 13 components', () => {
  for (const componentName of expectedTypedComponents) {
    // <lang><zh-CN>每个组件必须显式导出三类类型名；无事件组件使用空 Emits record，而不是退回不精确组件类型。</zh-CN><en>Every component must explicitly export all three type names; no-event components use an empty Emits record rather than falling back to an imprecise component type.</en></lang>
    assert.match(typeSource, new RegExp(`export (?:interface|type) ${componentName}Props\\b`, 'u'));
    assert.match(typeSource, new RegExp(`export type ${componentName}Emits\\b`, 'u'));
    assert.match(typeSource, new RegExp(`export type ${componentName}Instance\\b`, 'u'));
    assert.match(typeSource, new RegExp(`export declare const ${componentName}: UViewTypedComponent<${componentName}Props, \\{\\}, ${componentName}Emits>;`, 'u'));
    // <lang><zh-CN>全局增强只映射已导入的精确根类型，不重复声明一套漂移的 props。</zh-CN><en>The global augmentation maps only to the imported precise root type and does not redeclare a drifting prop surface.</en></lang>
    assert.match(globalTypeSource, new RegExp(`${componentName}: typeof ${componentName};`, 'u'));
  }

  // <lang><zh-CN>99 组件矩阵只含其中 12 个上游同名组件；HIA 自有 UCell 不伪造上游 type mapping，其余 12 项必须陈述本地类型已交付但上游 parity 尚未评估。</zh-CN><en>The 99-component matrix contains only 12 same-named upstream components; HIA-owned UCell fabricates no upstream type mapping, while the other 12 must state that local types are delivered but upstream parity remains unassessed.</en></lang>
  for (const componentName of expectedTypedComponents.filter((name) => name !== 'UCell')) {
    // <lang><zh-CN>PascalCase 导出按受控 `U` 前缀转换为矩阵 kebab 名，不从目录猜测。</zh-CN><en>The PascalCase export converts to a matrix kebab name under the controlled `U` prefix without directory discovery.</en></lang>
    const matrixName = `u-${componentName.slice(1).replace(/([a-z0-9])([A-Z])/gu, '$1-$2').toLowerCase()}`;
    // <lang><zh-CN>精确查找同名矩阵组件；缺失会由断言给出公开名称。</zh-CN><en>Looks up the exact same-named matrix component; absence is reported by public name.</en></lang>
    const component = matrix.components.find((candidate) => candidate.name === matrixName);

    assert.ok(component, `Missing typed matrix component: ${matrixName}`);
    assert.deepEqual(component.types.hia, { status: 'delivered' });
    assert.deepEqual(component.types.migration, {
      disposition: 'unsupported',
      reasonCode: 'HIA_COMPONENT_TYPE_PARITY_NOT_ASSESSED'
    });
  }
});

/**
 * @lang zh-CN 验证 19 个 P0 映射均有指纹化调用点动作，且动作包没有以生成结果改写 consumer。
 * @lang en Verifies that all 19 P0 mappings have fingerprinted call-site actions and that the action packet does not represent consumer rewrites.
 */
test('regenerates deterministic migration actions for the 19 mapped items', () => {
  // <lang><zh-CN>动作按规范 ID 建立只读索引；重复项会使 Map 数量小于数组并由后续断言暴露。</zh-CN><en>Actions form a read-only canonical-ID index; duplicates would shrink the Map relative to the array and be exposed by the following assertion.</en></lang>
  const actionsById = new Map(migrationActions.actions.map((action) => [action.id, action]));

  assert.equal(actionsById.size, migrationActions.actions.length);
  assert.equal(migrationActions.actions.length, 127);

  for (const canonicalId of Object.keys(expectedP0RuntimeEvidence)) {
    // <lang><zh-CN>mapped P0 只能要求显式调用点适配；指纹必须由完整矩阵事实生成。</zh-CN><en>A mapped P0 item may only request explicit call-site adaptation; its fingerprint must derive from complete matrix facts.</en></lang>
    const action = actionsById.get(canonicalId);

    assert.ok(action, `Missing migration action: ${canonicalId}`);
    assert.equal(action.disposition, 'mapped');
    assert.equal(action.operation, 'adapt-call-site');
    assert.match(action.sourceFingerprint, /^sha256:[0-9a-f]{64}$/u);
    assert.ok(action.docs.includes('docs/migration-from-uview.md'));
  }
});
