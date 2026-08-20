import assert from 'node:assert/strict';
// <lang><zh-CN>只读取下方明确列出的仓内事实文件；门禁不发现目录、不访问网络、不读取上游 checkout，也不写入文件。</zh-CN><en>Reads only repository facts explicitly listed below; the gate discovers no directory, accesses no network or upstream checkout, and writes no file.</en></lang>
import { readFile } from 'node:fs/promises';
// <lang><zh-CN>使用 Node 内建测试运行器，避免为只读一致性门禁增加执行依赖。</zh-CN><en>Uses the built-in Node test runner so the read-only consistency gate adds no execution dependency.</en></lang>
import test from 'node:test';

/**
 * @module verify-p67-selection-date-upload-contract.test
 * @lang zh-CN 锁定 choice、date/picker、dropdown、numeric 与 controlled-upload 扩展后，API 矩阵、语义证据、迁移动作、三类消费 fixture、声明和公开迁移说明之间的同一组可验证事实；测试不宣称完整上游等价。
 * @lang en Locks one verifiable fact set across the API matrix, semantic evidence, migration actions, three consumer fixtures, declarations, and public migration guidance after the choice, date/picker, dropdown, numeric, and controlled-upload expansion; the test makes no claim of complete upstream equivalence.
 */

/**
 * @lang zh-CN 本门禁唯一读取的三份生成/人工审阅元数据路径。
 * @lang en The only three generated or human-reviewed metadata paths read by this gate.
 */
const METADATA_PATHS = Object.freeze({
  actions: 'HIA-uView-UI/hia-uview.migration-actions.json',
  matrix: 'HIA-uView-UI/hia-uview.api-compatibility.json',
  review: 'HIA-uView-UI/hia-uview.api-semantic-review.json'
});

// <lang><zh-CN>并行读取固定元数据，防止测试通过目录遍历接受未审计输入。</zh-CN><en>Read fixed metadata in parallel so the test cannot accept unaudited inputs through directory traversal.</en></lang>
const [actionSource, matrixSource, reviewSource] = await Promise.all([
  readFile(METADATA_PATHS.actions, 'utf8'),
  readFile(METADATA_PATHS.matrix, 'utf8'),
  readFile(METADATA_PATHS.review, 'utf8')
]);

/**
 * @lang zh-CN 三类真实 consumer 与 package declaration 的固定仓内路径；测试不扫描应用或外部项目。
 * @lang en Fixed repository-local paths for three real consumers and package declarations; the test scans no application or external project.
 */
const CONSUMER_AND_TYPE_PATHS = Object.freeze({
  globalDeclarations: 'HIA-uView-UI/types/global-components.d.ts',
  h5: 'HIA-uView-UI/fixtures/h5/src/App.vue',
  mpWeixin: 'HIA-uView-UI/fixtures/mp-weixin/src/pages/index/index.vue',
  packageTrial: 'scripts/verify-ui-package-trial.mjs',
  typeConsumer: 'tests/fixtures/ui-package-types/consumer.ts',
  types: 'HIA-uView-UI/types/index.d.ts'
});

// <lang><zh-CN>并行读取六个固定 source/declaration 证据文件；门禁只做字符串契约检查，不执行或改写它们。</zh-CN><en>Read six fixed source/declaration evidence files in parallel; the gate performs string-contract checks only and neither executes nor rewrites them.</en></lang>
const [globalDeclarationSource, h5ConsumerSource, mpWeixinConsumerSource, packageTrialSource, typeConsumerSource, typeDeclarationSource] = await Promise.all([
  readFile(CONSUMER_AND_TYPE_PATHS.globalDeclarations, 'utf8'),
  readFile(CONSUMER_AND_TYPE_PATHS.h5, 'utf8'),
  readFile(CONSUMER_AND_TYPE_PATHS.mpWeixin, 'utf8'),
  readFile(CONSUMER_AND_TYPE_PATHS.packageTrial, 'utf8'),
  readFile(CONSUMER_AND_TYPE_PATHS.typeConsumer, 'utf8'),
  readFile(CONSUMER_AND_TYPE_PATHS.types, 'utf8')
]);

/**
 * @lang zh-CN 当前确定性 P0 迁移动作 fixture；后续断言只读取且绝不修改它。
 * @lang en Current deterministic P0 migration-action fixture; later assertions only read and never mutate it.
 */
const actionFixture = JSON.parse(actionSource);

/**
 * @lang zh-CN 当前确定性 API compatibility matrix fixture。
 * @lang en Current deterministic API compatibility matrix fixture.
 */
const matrixFixture = JSON.parse(matrixSource);

/**
 * @lang zh-CN 人工维护并由生成器摘要绑定的 P0 语义复核 fixture。
 * @lang en Human-maintained P0 semantic-review fixture bound by generator digest.
 */
const reviewFixture = JSON.parse(reviewSource);

/**
 * @lang zh-CN 矩阵中允许本门禁汇集的四类组件 API inventory；service 保持独立，不能混入组件项。
 * @lang en The four component API inventories this gate may collect from the matrix; services stay separate and cannot enter component items.
 */
const MATRIX_DIMENSIONS = Object.freeze(['props', 'events', 'slots', 'imperativeApis']);

/**
 * @lang zh-CN 本次新增运行时证据使用的两个精确仓内引用。
 * @lang en The two exact repository-local references used by the newly added runtime evidence.
 */
const RUNTIME_TEST_REFS = Object.freeze([
  'test:tests/runtime/hia-uview-p67-choice.runtime.test.mjs',
  'test:tests/runtime/hia-uview-p67-picker-calendar-select.runtime.test.mjs'
]);

/**
 * @lang zh-CN 十九项 P0 的精确 HIA payload 投影；event 锁参数与 model 关系，prop 锁值域与控制方式，slot 锁 binding/fallback/cardinality/owner。
 * @lang en Exact HIA payload projections for nineteen P0 items; events lock parameters and model relation, props lock value domain and control, and slots lock bindings, fallback, cardinality, and owner.
 */
const EXPECTED_RUNTIME_PAYLOADS = Object.freeze([
  // <lang><zh-CN>checkbox/group 记录透明值、受控数组和 slot fallback 边界。</zh-CN><en>Checkbox/group records lock transparent values, controlled arrays, and slot-fallback boundaries.</en></lang>
  Object.freeze({ id: 'u-checkbox-group/event:change', ref: RUNTIME_TEST_REFS[0], payload: { kind: 'event', parameters: [{ name: 'values', shape: 'array' }], modelRelation: 'none' } }),
  Object.freeze({ id: 'u-checkbox-group/event:update:modelValue', ref: RUNTIME_TEST_REFS[0], payload: { kind: 'event', parameters: [{ name: 'values', shape: 'array' }], modelRelation: 'updates:modelValue' } }),
  Object.freeze({ id: 'u-checkbox-group/prop:modelValue', ref: RUNTIME_TEST_REFS[0], payload: { kind: 'prop', valueDomain: { typeKinds: ['Array'], typeOrder: ['Array'], default: { kind: 'factory-array' }, required: false, validator: { kind: 'absent' } }, control: 'two-way-model' } }),
  Object.freeze({ id: 'u-checkbox-group/slot:default', ref: RUNTIME_TEST_REFS[0], payload: { kind: 'slot', bindings: [], fallback: 'absent', cardinality: 'single', contextOwner: 'component' } }),
  Object.freeze({ id: 'u-checkbox/event:change', ref: RUNTIME_TEST_REFS[0], payload: { kind: 'event', parameters: [{ name: 'detail', shape: 'value-and-checked-object' }], modelRelation: 'none' } }),
  Object.freeze({ id: 'u-checkbox/event:update:modelValue', ref: RUNTIME_TEST_REFS[0], payload: { kind: 'event', parameters: [{ name: 'checked', shape: 'boolean' }], modelRelation: 'updates:modelValue' } }),
  Object.freeze({ id: 'u-checkbox/slot:default', ref: RUNTIME_TEST_REFS[0], payload: { kind: 'slot', bindings: [], fallback: 'present', cardinality: 'single', contextOwner: 'component' } }),
  // <lang><zh-CN>picker 记录受控 scalar/array 模型与 confirm/cancel 快照差异。</zh-CN><en>Picker records lock the controlled scalar/array model and distinct confirm/cancel snapshots.</en></lang>
  Object.freeze({ id: 'u-picker/event:cancel', ref: RUNTIME_TEST_REFS[1], payload: { kind: 'event', parameters: [{ name: 'result', shape: 'value-values-indexes-options-cancel-snapshot' }], modelRelation: 'none' } }),
  Object.freeze({ id: 'u-picker/event:confirm', ref: RUNTIME_TEST_REFS[1], payload: { kind: 'event', parameters: [{ name: 'result', shape: 'value-values-indexes-options-confirm-result' }], modelRelation: 'none' } }),
  Object.freeze({ id: 'u-picker/event:update:modelValue', ref: RUNTIME_TEST_REFS[1], payload: { kind: 'event', parameters: [{ name: 'value', shape: 'selected-scalar-or-array' }], modelRelation: 'updates:modelValue' } }),
  Object.freeze({ id: 'u-picker/prop:modelValue', ref: RUNTIME_TEST_REFS[1], payload: { kind: 'prop', valueDomain: { typeKinds: ['Array', 'Number', 'String'], typeOrder: ['String', 'Number', 'Array'], default: { kind: 'literal', value: '' }, required: false, validator: { kind: 'absent' } }, control: 'selection-model' } }),
  // <lang><zh-CN>radio/group 记录不可取消的透明标量事件与各自 slot fallback。</zh-CN><en>Radio/group records lock non-cancellable transparent scalar events and their distinct slot fallbacks.</en></lang>
  Object.freeze({ id: 'u-radio-group/event:change', ref: RUNTIME_TEST_REFS[0], payload: { kind: 'event', parameters: [{ name: 'value', shape: 'string-or-number' }], modelRelation: 'none' } }),
  Object.freeze({ id: 'u-radio-group/event:update:modelValue', ref: RUNTIME_TEST_REFS[0], payload: { kind: 'event', parameters: [{ name: 'value', shape: 'string-or-number' }], modelRelation: 'updates:modelValue' } }),
  Object.freeze({ id: 'u-radio-group/slot:default', ref: RUNTIME_TEST_REFS[0], payload: { kind: 'slot', bindings: [], fallback: 'absent', cardinality: 'single', contextOwner: 'component' } }),
  Object.freeze({ id: 'u-radio/event:change', ref: RUNTIME_TEST_REFS[0], payload: { kind: 'event', parameters: [{ name: 'value', shape: 'string-or-number' }], modelRelation: 'none' } }),
  Object.freeze({ id: 'u-radio/slot:default', ref: RUNTIME_TEST_REFS[0], payload: { kind: 'slot', bindings: [], fallback: 'present', cardinality: 'single', contextOwner: 'component' } }),
  // <lang><zh-CN>switch 记录 caller 配置值而非原生布尔 payload，并锁定透明三类型 modelValue。</zh-CN><en>Switch records lock caller-configured values rather than native boolean payloads and the transparent three-type modelValue.</en></lang>
  Object.freeze({ id: 'u-switch/event:change', ref: RUNTIME_TEST_REFS[0], payload: { kind: 'event', parameters: [{ name: 'value', shape: 'configured-value' }], modelRelation: 'none' } }),
  Object.freeze({ id: 'u-switch/event:update:modelValue', ref: RUNTIME_TEST_REFS[0], payload: { kind: 'event', parameters: [{ name: 'value', shape: 'configured-value' }], modelRelation: 'updates:modelValue' } }),
  Object.freeze({ id: 'u-switch/prop:modelValue', ref: RUNTIME_TEST_REFS[0], payload: { kind: 'prop', valueDomain: { typeKinds: ['Boolean', 'Number', 'String'], typeOrder: ['Boolean', 'String', 'Number'], default: { kind: 'literal', value: false }, required: false, validator: { kind: 'absent' } }, control: 'two-way-model' } })
]);

/**
 * @lang zh-CN 本轮由真实本地 surface 证明存在、但尚未加入 P0 语义 overlay 的精确三十一项 P1 结构映射。
 * @lang en Exact thirty-one P1 structural mappings proven present by real local surfaces in this batch but not added to the P0 semantic overlay.
 */
const PROMOTED_P1_IDS = Object.freeze([
  'u-calendar/event:change',
  'u-calendar/event:input',
  'u-calendar/prop:readonly',
  'u-checkbox-group/prop:labelDisabled',
  'u-checkbox-group/prop:max',
  'u-checkbox/prop:labelDisabled',
  'u-checkbox/prop:name',
  'u-dropdown-item/event:change',
  'u-dropdown-item/event:update:modelValue',
  'u-dropdown-item/prop:modelValue',
  'u-dropdown-item/prop:options',
  'u-dropdown-item/prop:show',
  'u-dropdown/event:close',
  'u-dropdown/imperative:close',
  'u-dropdown/imperative:open',
  'u-picker/event:columnchange',
  'u-picker/prop:preserveSelection',
  'u-picker/prop:range',
  'u-picker/prop:rangeKey',
  'u-picker/slot:title',
  'u-radio-group/prop:labelDisabled',
  'u-radio/prop:labelDisabled',
  'u-radio/prop:name',
  'u-rate/prop:current',
  'u-select/event:cancel',
  'u-select/event:click',
  'u-select/event:confirm',
  'u-switch/prop:activeValue',
  'u-switch/prop:inactiveValue',
  'u-upload/event:update:modelValue',
  'u-upload/prop:modelValue'
]);

/**
 * @lang zh-CN 因当前 USelect 已公开同名文字 prop 而确定性映射的两个 P2 项；它们不改变 P0/P1 语义或动作范围。
 * @lang en The two P2 items deterministically mapped because current USelect exposes same-named copy props; they change neither P0/P1 semantics nor action scope.
 */
const EXTRA_SELECT_P2_IDS = Object.freeze([
  'u-select/prop:cancelText',
  'u-select/prop:confirmText'
]);

/**
 * @lang zh-CN 本轮受控组合使用的十四个组件名；集合只用于 P1 汇总和 consumer/type 证据，不推导其他组件支持。
 * @lang en Fourteen component names used by the controlled composition in this batch; the set serves only P1 aggregation and consumer/type evidence and infers no support for other components.
 */
const CONTROLLED_COMPONENT_NAMES = Object.freeze([
  'u-checkbox',
  'u-checkbox-group',
  'u-radio',
  'u-radio-group',
  'u-switch',
  'u-picker',
  'u-calendar',
  'u-select',
  'u-dropdown',
  'u-dropdown-item',
  'u-number-box',
  'u-rate',
  'u-slider',
  'u-upload'
]);

/**
 * @lang zh-CN 将固定 `u-*` 名称投影为 declaration 的 PascalCase 与测试局部 camelCase；函数不接受或发现其他组件。
 * @lang en Projects a fixed `u-*` name to declaration PascalCase and test-local camelCase; the function accepts and discovers no other component.
 * @param {string} componentName <lang><zh-CN>来自十四项固定集合的 kebab-case 名称。</zh-CN><en>Kebab-case name from the fixed fourteen-item set.</en></lang>
 * @returns {{kebab: string, pascal: string, camel: string}} <lang><zh-CN>三种稳定拼写。</zh-CN><en>Three stable spellings.</en></lang>
 */
function projectComponentSpellings(componentName) {
  // <lang><zh-CN>移除唯一受控 `u-` 前缀并保留其余单词顺序。</zh-CN><en>Remove the sole controlled `u-` prefix while retaining the remaining word order.</en></lang>
  const words = componentName.slice(2).split('-');
  // <lang><zh-CN>PascalCase 名称始终重新加 U 前缀，以匹配公开 named export。</zh-CN><en>The PascalCase name always restores the U prefix to match the public named export.</en></lang>
  const pascalBody = words.map((word) => `${word[0].toUpperCase()}${word.slice(1)}`).join('');
  // <lang><zh-CN>camelCase 仅用于 fixture 的局部变量锚点，不成为公开 API。</zh-CN><en>CamelCase serves only fixture-local variable anchors and becomes no public API.</en></lang>
  const camel = `${words[0]}${pascalBody.slice(words[0].length)}`;

  return { kebab: componentName, pascal: `U${pascalBody}`, camel };
}

/**
 * @lang zh-CN 十四组件的三种稳定拼写，供三类 template 与 declaration/type consumer 逐项交叉验证。
 * @lang en Three stable spellings of the fourteen components for item-level cross-checks across three templates and declaration/type consumers.
 */
const CONTROLLED_COMPONENTS = Object.freeze(CONTROLLED_COMPONENT_NAMES.map(projectComponentSpellings));

/**
 * @lang zh-CN 为矩阵组件 API 建立稳定复合 ID 索引；重复 ID 立即失败，避免后项静默覆盖前项。
 * @lang en Builds a stable composite-ID index for matrix component APIs; duplicate IDs fail immediately so a later item cannot silently replace an earlier one.
 * @param {object} matrix <lang><zh-CN>已解析的受控矩阵。</zh-CN><en>Parsed controlled matrix.</en></lang>
 * @returns {Map<string, object>} <lang><zh-CN>以 `component/itemId` 为键的只读使用索引。</zh-CN><en>Read-only-use index keyed by `component/itemId`.</en></lang>
 */
function createMatrixItemIndex(matrix) {
  // <lang><zh-CN>局部 Map 只在构造期间写入，返回后测试只读取。</zh-CN><en>The local map is written only during construction and read only after return.</en></lang>
  const index = new Map();

  // <lang><zh-CN>依照 manifest 顺序遍历组件和四类固定 inventory，不发现其他属性。</zh-CN><en>Traverse components and the four fixed inventories in manifest order without discovering other properties.</en></lang>
  for (const component of matrix.components) {
    for (const dimension of MATRIX_DIMENSIONS) {
      for (const item of component[dimension].items) {
        // <lang><zh-CN>复合键保留组件边界，同名 prop/event 不会跨组件冲突。</zh-CN><en>The composite key preserves component boundaries so same-named props/events cannot collide across components.</en></lang>
        const compositeId = `${component.name}/${item.id}`;
        assert.equal(index.has(compositeId), false, `Duplicate matrix item: ${compositeId}`);
        index.set(compositeId, item);
      }
    }
  }

  return index;
}

/**
 * @lang zh-CN 从完整 HIA semantics 中提取按 API kind 定义的公开 payload 投影；非三种受控 kind 立即失败。
 * @lang en Extracts the public payload projection defined per API kind from complete HIA semantics; any kind outside the three controlled kinds fails immediately.
 * @param {object} hiaSemantics <lang><zh-CN>单项已复核的 HIA 语义记录。</zh-CN><en>Reviewed HIA semantics for one item.</en></lang>
 * @returns {object} <lang><zh-CN>用于精确深相等的有限 payload 投影。</zh-CN><en>Bounded payload projection for exact deep equality.</en></lang>
 */
function projectHiaPayload(hiaSemantics) {
  // <lang><zh-CN>事件只投影调用方收到的参数及其 model 关系。</zh-CN><en>Events project only caller-received parameters and their model relation.</en></lang>
  if (hiaSemantics.kind === 'event') {
    return { kind: 'event', parameters: hiaSemantics.parameters, modelRelation: hiaSemantics.modelRelation };
  }

  // <lang><zh-CN>prop 投影精确值域和 ownership/control 契约中的 control。</zh-CN><en>Props project their exact value domain and control contract.</en></lang>
  if (hiaSemantics.kind === 'prop') {
    return { kind: 'prop', valueDomain: hiaSemantics.valueDomain, control: hiaSemantics.control };
  }

  // <lang><zh-CN>slot 投影全部可见 binding 与 fallback/cardinality/owner 边界。</zh-CN><en>Slots project every visible binding plus fallback, cardinality, and owner boundaries.</en></lang>
  if (hiaSemantics.kind === 'slot') {
    return {
      kind: 'slot',
      bindings: hiaSemantics.bindings,
      fallback: hiaSemantics.fallback,
      cardinality: hiaSemantics.cardinality,
      contextOwner: hiaSemantics.contextOwner
    };
  }

  assert.fail(`Unexpected P0 runtime payload kind: ${hiaSemantics.kind}`);
}

/**
 * @lang zh-CN 当前矩阵的稳定复合 ID 索引；测试不修改其中 item。
 * @lang en Stable composite-ID index of the current matrix; tests never mutate its items.
 */
const matrixItemsById = createMatrixItemIndex(matrixFixture);

/**
 * @lang zh-CN 审阅 sidecar 的稳定 ID 索引；基数断言在测试中排除重复项。
 * @lang en Stable ID index of the review sidecar; a cardinality assertion in the test excludes duplicates.
 */
const reviewItemsById = new Map(reviewFixture.items.map((item) => [item.id, item]));

/**
 * @lang zh-CN 当前动作包的稳定 ID 集合；只读检查会证明 P1/P2 不能进入 P0-only packet。
 * @lang en Stable ID set of the current action packet; read-only checks prove P1/P2 cannot enter the P0-only packet.
 */
const actionIds = new Set(actionFixture.actions.map((action) => action.id));

/**
 * @lang zh-CN 先锁定三份输入的顶层身份，使后续精细断言不会在错误 schema 上产生误导性失败。
 * @lang en First locks top-level identity of all three inputs so later fine-grained assertions cannot fail misleadingly against the wrong schema.
 */
test('loads the deterministic matrix, review, and P0 action packet', () => {
  // <lang><zh-CN>矩阵 v2 与审阅 sidecar/action packet 的既定版本必须同时存在。</zh-CN><en>Matrix v2 and the established review-sidecar/action-packet versions must exist together.</en></lang>
  assert.equal(matrixFixture.version, 2);
  assert.equal(reviewFixture.version, 1);
  assert.equal(actionFixture.version, 2);

  // <lang><zh-CN>三个有限集合的当前基数是后续逐项门禁的前置条件，不代表行为等价。</zh-CN><en>Current cardinalities of the three bounded sets are prerequisites for later item gates, not claims of behavioral equivalence.</en></lang>
  assert.equal(matrixFixture.components.length, 99);
  assert.equal(reviewFixture.items.length, 127);
  assert.equal(actionFixture.actions.length, 127);
});

/**
 * @lang zh-CN 验证新增的十九项 P0 runtime 证据集合、唯一测试引用、零剩余证据和精确 HIA payload，同时锁定 sidecar 到矩阵的逐项传递。
 * @lang en Verifies the exact nineteen-item P0 runtime-evidence set, sole test reference, zero remaining evidence, exact HIA payload, and item-level propagation from sidecar to matrix.
 */
test('locks the exact nineteen runtime evidence and HIA payload records', () => {
  // <lang><zh-CN>只按两个精确 test ref 选择本批记录，既有其他 runtime-tested P0 不会混入。</zh-CN><en>Select only by the two exact test refs so earlier runtime-tested P0 records cannot enter this batch.</en></lang>
  const selectedReviewItems = reviewFixture.items.filter((item) => item.semantics.evidenceRefs
    .some((reference) => RUNTIME_TEST_REFS.includes(reference)));
  // <lang><zh-CN>显式排序后比较完整 ID 集合，阻止遗漏、额外项或错挂引用。</zh-CN><en>Compare the complete sorted ID set to reject omissions, additions, or misattached references.</en></lang>
  const actualIds = selectedReviewItems.map((item) => item.id).sort();
  const expectedIds = EXPECTED_RUNTIME_PAYLOADS.map((record) => record.id).sort();

  assert.equal(reviewItemsById.size, 127);
  assert.equal(EXPECTED_RUNTIME_PAYLOADS.length, 19);
  assert.deepEqual(actualIds, expectedIds);

  // <lang><zh-CN>逐项验证证据、payload 与生成矩阵副本，避免仅靠汇总数字掩盖单项漂移。</zh-CN><en>Verify evidence, payload, and generated-matrix copy item by item so aggregate counts cannot hide individual drift.</en></lang>
  for (const expected of EXPECTED_RUNTIME_PAYLOADS) {
    // <lang><zh-CN>缺失 sidecar 或矩阵项会形成带稳定 ID 的明确失败。</zh-CN><en>A missing sidecar or matrix item produces an explicit failure with its stable ID.</en></lang>
    const reviewItem = reviewItemsById.get(expected.id);
    const matrixItem = matrixItemsById.get(expected.id);

    assert.ok(reviewItem, `Missing semantic review: ${expected.id}`);
    assert.ok(matrixItem, `Missing matrix item: ${expected.id}`);
    assert.equal(matrixItem.priority, 'P0');
    assert.equal(reviewItem.semantics.reviewState, 'complete');
    assert.equal(reviewItem.semantics.evidenceLevel, 'runtime-tested');
    assert.deepEqual(reviewItem.semantics.remainingEvidence, []);
    assert.deepEqual(reviewItem.semantics.evidenceRefs.filter((reference) => reference.startsWith('test:')), [expected.ref]);
    assert.deepEqual(projectHiaPayload(reviewItem.semantics.hia), expected.payload);
    assert.deepEqual(matrixItem.semantics, reviewItem.semantics);
  }
});

/**
 * @lang zh-CN 锁定三十一项选择/日期/上传 P1 结构映射、十四组件内的 54/54 边界和更新后的全矩阵确定性统计，同时拒绝给 P1 附加 P0 semantics。
 * @lang en Locks the thirty-one selection/date/upload P1 structural mappings, the 54/54 boundary within fourteen components, and updated deterministic whole-matrix statistics while rejecting P0 semantics on P1.
 */
test('keeps P1 promotions structural and preserves deterministic matrix totals', () => {
  // <lang><zh-CN>从稳定复合索引现场汇集全部 P1，不能信任单独维护的计数。</zh-CN><en>Collect all P1 items live from the stable composite index rather than trusting separately maintained counts.</en></lang>
  const p1Entries = [...matrixItemsById.entries()].filter(([, item]) => item.priority === 'P1');
  // <lang><zh-CN>十四组件子集按复合 ID 的 component 前缀选择，避免同名 API 跨组件泄漏。</zh-CN><en>Select the fourteen-component subset by composite-ID component prefix so same-named APIs cannot leak across components.</en></lang>
  const controlledP1Entries = p1Entries.filter(([compositeId]) => CONTROLLED_COMPONENT_NAMES
    .includes(compositeId.slice(0, compositeId.indexOf('/'))));

  assert.equal(PROMOTED_P1_IDS.length, 31);
  assert.equal(p1Entries.length, 536);
  assert.equal(p1Entries.filter(([, item]) => item.migration.disposition === 'compatible').length, 4);
  assert.equal(p1Entries.filter(([, item]) => item.migration.disposition === 'mapped').length, 168);
  assert.equal(p1Entries.filter(([, item]) => item.migration.disposition === 'unsupported').length, 364);
  assert.equal(controlledP1Entries.length, 108);
  assert.equal(controlledP1Entries.filter(([, item]) => item.migration.disposition === 'mapped').length, 54);
  assert.equal(controlledP1Entries.filter(([, item]) => item.migration.disposition === 'unsupported').length, 54);
  assert.ok(p1Entries.every(([, item]) => Object.hasOwn(item, 'semantics') === false));

  // <lang><zh-CN>逐项确认三十一项只有具名 target 与结构映射理由，绝不伪装成 compatible。</zh-CN><en>Confirm item by item that all thirty-one records have named targets and structural mapping reasons and never masquerade as compatible.</en></lang>
  for (const compositeId of PROMOTED_P1_IDS) {
    // <lang><zh-CN>缺失项产生带稳定复合 ID 的明确失败。</zh-CN><en>A missing item produces an explicit failure carrying its stable composite ID.</en></lang>
    const item = matrixItemsById.get(compositeId);

    assert.ok(item, `Missing promoted P1 item: ${compositeId}`);
    assert.equal(item.priority, 'P1');
    assert.equal(item.migration.disposition, 'mapped');
    assert.ok(['SAME_NAME_DIFFERENT_SHAPE', 'STRUCTURAL_MATCH_REQUIRES_SEMANTIC_REVIEW']
      .includes(item.migration.reasonCode));
    assert.equal(typeof item.migration.target, 'string');
    assert.notEqual(item.migration.target, '');
    assert.equal(Object.hasOwn(item, 'semantics'), false);
  }
});

/**
 * @lang zh-CN 单独披露两个 USelect P2 映射，并锁定完整矩阵的 47/340/1353 与 P0 127/0/0 证据事实；后续展示/媒体/列表/搜索装饰映射不改变本批选择组件断言。
 * @lang en Separately discloses the two USelect P2 mappings and locks whole-matrix 47/340/1353 plus P0 127/0/0 evidence facts; later display/media/list/search-decoration mappings do not change this selection-component batch assertion.
 */
test('isolates the two select P2 mappings from P0 and P1 semantics', () => {
  // <lang><zh-CN>所有组件项现场按 disposition/P0 evidence 分类；service 不在复合索引中。</zh-CN><en>Classify all component items live by disposition and P0 evidence; services are absent from the composite index.</en></lang>
  const allItems = [...matrixItemsById.values()];
  const p0Items = allItems.filter((item) => item.priority === 'P0');
  const selectP2MappedIds = [...matrixItemsById.entries()]
    .filter(([compositeId, item]) => compositeId.startsWith('u-select/')
      && item.priority === 'P2'
      && item.migration.disposition === 'mapped')
    .map(([compositeId]) => compositeId)
    .sort();

  assert.equal(allItems.length, 1740);
  assert.equal(allItems.filter((item) => item.migration.disposition === 'compatible').length, 47);
  assert.equal(allItems.filter((item) => item.migration.disposition === 'mapped').length, 340);
  assert.equal(allItems.filter((item) => item.migration.disposition === 'unsupported').length, 1353);
  assert.equal(p0Items.filter((item) => item.semantics.evidenceLevel === 'runtime-tested').length, 127);
  assert.equal(p0Items.filter((item) => item.semantics.evidenceLevel === 'source-reviewed').length, 0);
  assert.equal(p0Items.filter((item) => item.semantics.remainingEvidence.includes('runtime-parity')).length, 0);
  assert.deepEqual(selectP2MappedIds, [...EXTRA_SELECT_P2_IDS].sort());

  // <lang><zh-CN>两个额外映射逐项保持 P2、无 semantics、具名同名 target 且不进入动作包。</zh-CN><en>Each extra mapping stays P2, carries no semantics, has a named same-name target, and stays outside the action packet.</en></lang>
  for (const compositeId of EXTRA_SELECT_P2_IDS) {
    const item = matrixItemsById.get(compositeId);

    assert.ok(item, `Missing USelect P2 mapping: ${compositeId}`);
    assert.equal(item.priority, 'P2');
    assert.equal(item.migration.disposition, 'mapped');
    assert.equal(item.migration.reasonCode, 'STRUCTURAL_MATCH_REQUIRES_SEMANTIC_REVIEW');
    assert.equal(item.migration.target, compositeId.slice(compositeId.indexOf(':') + 1));
    assert.equal(Object.hasOwn(item, 'semantics'), false);
    assert.equal(actionIds.has(compositeId), false);
  }
});

/**
 * @lang zh-CN 证明动作包继续精确覆盖 127 项 P0，包含十九项更新后的来源指纹，但排除全部本轮 P1/P2 结构映射。
 * @lang en Proves the action packet still covers exactly 127 P0 items, includes refreshed source fingerprints for the nineteen items, and excludes every P1/P2 structural mapping in this batch.
 */
test('keeps migration actions P0-only after evidence and structural mapping changes', () => {
  assert.deepEqual(actionFixture.scope.priorities, ['P0']);
  assert.equal(actionIds.size, 127);
  assert.ok(actionFixture.actions.every((action) => action.priority === 'P0'));
  assert.ok(actionFixture.actions.every((action) => /^sha256:[0-9a-f]{64}$/u.test(action.sourceFingerprint)));

  // <lang><zh-CN>运行时证据变化必须刷新并保留相应 P0 action，而结构映射不得扩大 packet scope。</zh-CN><en>Runtime-evidence changes must refresh and retain their P0 actions while structural mappings cannot expand packet scope.</en></lang>
  for (const record of EXPECTED_RUNTIME_PAYLOADS) {
    assert.equal(actionIds.has(record.id), true, `Missing refreshed P0 action: ${record.id}`);
  }
  for (const compositeId of [...PROMOTED_P1_IDS, ...EXTRA_SELECT_P2_IDS]) {
    assert.equal(actionIds.has(compositeId), false, `Non-P0 item entered action packet: ${compositeId}`);
  }
});

/**
 * @lang zh-CN 验证 H5、仓内 MP-Weixin 与安装包试验都在一个可见组合中真实引用十四组件和 injected upload adapter；marker 只证明消费，不证明平台发布。
 * @lang en Verifies that H5, the in-repository MP-Weixin fixture, and the installed-package trial each really reference all fourteen components and an injected upload adapter in one visible composition; markers prove consumption, not platform release.
 */
test('keeps three bounded consumers on the same fourteen-component composition', () => {
  // <lang><zh-CN>每类 consumer 使用自己的精确容器和 tag 拼写，防止一个文件的 marker 冒充另一个环境证据。</zh-CN><en>Each consumer uses its own exact container and tag spelling so one file's marker cannot masquerade as evidence for another environment.</en></lang>
  const consumers = [
    {
      name: 'H5 fixture',
      source: h5ConsumerSource,
      container: '<section class="fixture-p67-controls" data-smoke="p67-controlled-composition">',
      adapterState: '<p data-smoke="p67-adapter-state">{{ p67UploadAdapterState }}</p>',
      tagName: (component) => component.pascal
    },
    {
      name: 'MP-Weixin fixture',
      source: mpWeixinConsumerSource,
      container: '<view class="fixture-p67-controls" data-smoke="p67-controlled-composition">',
      adapterState: '<text data-smoke="p67-adapter-state">{{ fixtureUploadAdapterState }}</text>',
      tagName: (component) => component.kebab
    },
    {
      name: 'installed-package trial',
      source: packageTrialSource,
      container: '<view class="package-trial__p67-controls" data-smoke="p67-controlled-composition">',
      adapterState: '<text data-smoke="p67-adapter-state">{{ p67UploadAdapterState }}</text>',
      tagName: (component) => component.kebab
    }
  ];

  // <lang><zh-CN>逐 consumer 先锁唯一容器和 adapter 可见状态，再逐项证明十四个标签均真实出现在源码。</zh-CN><en>For each consumer, lock its unique container and visible adapter state first, then prove all fourteen tags actually occur in source.</en></lang>
  for (const consumer of consumers) {
    assert.equal(consumer.source.includes(consumer.container), true, `${consumer.name} lost its exact composition container.`);
    assert.equal(consumer.source.includes(consumer.adapterState), true, `${consumer.name} lost its adapter-state marker.`);

    for (const component of CONTROLLED_COMPONENTS) {
      // <lang><zh-CN>标签正则要求紧邻空白或闭合符，避免同前缀组件名产生假阳性。</zh-CN><en>The tag expression requires whitespace or a closing delimiter so same-prefix component names cannot produce false positives.</en></lang>
      const tagPattern = new RegExp(`<${consumer.tagName(component)}(?:\\s|>)`, 'u');
      assert.match(consumer.source, tagPattern, `${consumer.name} does not consume ${component.kebab}.`);
    }
  }

  // <lang><zh-CN>三个 consumer 分别锁定自身 adapter 注入/观察名称，防止只保留空 upload 标签。</zh-CN><en>Each consumer locks its own adapter injection/observation names so an empty upload tag cannot satisfy the gate.</en></lang>
  assert.match(h5ConsumerSource, /<UUpload[\s\S]+:adapter="p67UploadAdapter"[\s\S]+@adapter-state="recordP67UploadAdapterState"/u);
  assert.match(mpWeixinConsumerSource, /<u-upload[\s\S]+:adapter="fixtureUploadAdapter"[\s\S]+@adapter-state="recordFixtureUploadAdapterState"/u);
  assert.match(packageTrialSource, /<u-upload[\s\S]+:adapter="p67UploadAdapter"[\s\S]+@adapter-state="recordP67UploadAdapterState"/u);
});

/**
 * @lang zh-CN 锁定十四组件的 Props、Instance、可选 global declaration 和真实编译期 consumer 锚点，并保留代表性事件/expose payload。
 * @lang en Locks Props, Instance, optional global declarations, and real compile-time consumer anchors for fourteen components while retaining representative event/expose payloads.
 */
test('keeps fourteen precise package declarations connected to the type consumer', () => {
  assert.equal(CONTROLLED_COMPONENTS.length, 14);

  // <lang><zh-CN>逐组件要求四个独立声明/消费锚点，避免 generic component 或仅导出名称冒充精确类型交付。</zh-CN><en>Require four independent declaration/consumption anchors per component so a generic component or name-only export cannot masquerade as precise type delivery.</en></lang>
  for (const component of CONTROLLED_COMPONENTS) {
    // <lang><zh-CN>每个正则都从固定名称构造，不读取或解释任意 source 文本。</zh-CN><en>Every expression is built from a fixed name and neither reads nor interprets arbitrary source text.</en></lang>
    const propsPattern = new RegExp(`export interface ${component.pascal}Props \\{`, 'u');
    const instancePattern = new RegExp(`export type ${component.pascal}Instance = InstanceType<typeof ${component.pascal}>;`, 'u');
    const globalPattern = new RegExp(`${component.pascal}: typeof ${component.pascal};`, 'u');
    const consumerPropsPattern = new RegExp(`const ${component.camel}Props: ${component.pascal}Props =`, 'u');
    const consumerRefPattern = new RegExp(`declare const ${component.camel}Ref: ${component.pascal}Instance;`, 'u');
    const consumerGlobalPattern = new RegExp(`const global${component.pascal.slice(1)}: GlobalComponents\\['${component.pascal}'\\] = ${component.pascal};`, 'u');

    assert.match(typeDeclarationSource, propsPattern, `Missing precise props declaration for ${component.pascal}.`);
    assert.match(typeDeclarationSource, instancePattern, `Missing precise instance declaration for ${component.pascal}.`);
    assert.match(globalDeclarationSource, globalPattern, `Missing optional global declaration for ${component.pascal}.`);
    assert.match(typeConsumerSource, consumerPropsPattern, `Missing props consumer for ${component.pascal}.`);
    assert.match(typeConsumerSource, consumerRefPattern, `Missing instance consumer for ${component.pascal}.`);
    assert.match(typeConsumerSource, consumerGlobalPattern, `Missing global consumer for ${component.pascal}.`);
  }

  // <lang><zh-CN>四个精确调用点分别锁定 transparent switch 值、picker result、dropdown expose 与 upload discriminated state。</zh-CN><en>Four exact call sites respectively lock a transparent switch value, picker result, dropdown expose, and upload discriminated state.</en></lang>
  assert.equal(typeConsumerSource.includes("switchRef.$emit('change', 'enabled');"), true);
  assert.equal(typeConsumerSource.includes("pickerRef.$emit('confirm', pickerConfirm);"), true);
  assert.equal(typeConsumerSource.includes("const dropdownOpened: boolean = dropdownRef.open('filters');"), true);
  assert.equal(typeConsumerSource.includes("uploadRef.$emit('adapter-state', uploadPendingState);"), true);
});
