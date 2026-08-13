/**
 * @module verify-feedback-migration-contract.test
 * @lang zh-CN 锁定局部反馈与浮层 family 的受控迁移面、公开边界和只读 API compatibility matrix。测试只读取固定公开仓内文件，不访问网络、临时上游检出、DevTools、业务项目或平台 service，也不写入任何输入。
 * @lang en Locks controlled migration surfaces, public boundaries, and the read-only API compatibility matrix of the local feedback and overlay family. The test reads only fixed public repository files and accesses no network, temporary upstream checkout, DevTools, business project, or platform service, nor does it write any input.
 */

// <lang><zh-CN>使用严格断言锁定精确公开契约，避免宽松转换掩盖 migration surface 漂移。</zh-CN><en>Uses strict assertions to lock exact public contracts and avoid loose coercion hiding migration-surface drift.</en></lang>
import assert from 'node:assert/strict';
// <lang><zh-CN>只读取明示仓内输入；测试不发现目录、读取临时比较树或运行构建工具。</zh-CN><en>Reads only declared repository inputs; the test discovers no directories, reads no temporary comparison tree, and runs no build tool.</en></lang>
import { readFile } from 'node:fs/promises';
// <lang><zh-CN>使用 Node 内建测试运行器，使静态门禁独立于浏览器、设备和平台模拟器。</zh-CN><en>Uses the Node built-in test runner, keeping the static gate independent from browser, device, and platform simulator.</en></lang>
import test from 'node:test';

/**
 * @lang zh-CN 本 family 经独立实现、运行时回归和受限语义审计确认的精确 compatible prop。其他新入口仍为 mapped，因为当前 inventory 不比较完整 event payload、slot binding、options item schema 或生命周期语义。
 * @lang en Exact compatible props of this family confirmed by independent implementation, runtime regression, and bounded semantic audit. Other new entries remain mapped because the current inventory does not compare complete event payload, slot binding, options-item schema, or lifecycle semantics.
 */
const expectedCompatibleProps = Object.freeze({
  'u-loading': Object.freeze(['show']),
  'u-modal': Object.freeze(['modelValue']),
  'u-swipe-action': Object.freeze(['disabled']),
  'u-toast': Object.freeze(['loading'])
});

// <lang><zh-CN>并行读取固定输入，防止读取顺序、缓存或临时文件状态成为测试隐式依赖。</zh-CN><en>Reads fixed inputs in parallel, preventing read order, cache, or temporary-file state from becoming an implicit test dependency.</en></lang>
const [modalSource, popupSource, loadingSource, toastSource, swipeActionSource, modalDocumentation, popupDocumentation, loadingDocumentation, toastDocumentation, swipeActionDocumentation, fixtureSource, generatorSource, matrixSource] = await Promise.all([
  readFile('HIA-uView-UI/src/components/u-modal/u-modal.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-popup/u-popup.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-loading/u-loading.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-toast/u-toast.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-swipe-action/u-swipe-action.vue', 'utf8'),
  readFile('docs/modal.md', 'utf8'),
  readFile('docs/popup.md', 'utf8'),
  readFile('docs/loading.md', 'utf8'),
  readFile('docs/toast.md', 'utf8'),
  readFile('docs/swipe-action.md', 'utf8'),
  readFile('HIA-uView-UI/fixtures/mp-weixin/src/pages/index/index.vue', 'utf8'),
  readFile('scripts/generate-api-compatibility-matrix.mjs', 'utf8'),
  readFile('HIA-uView-UI/hia-uview.api-compatibility.json', 'utf8')
]);

/**
 * @lang zh-CN 当前提交的 API compatibility matrix；本测试只读取和解析该产物，绝不改写或再生成。
 * @lang en Current committed API compatibility matrix; this test only reads and parses the artifact and never rewrites or regenerates it.
 */
const apiCompatibilityMatrix = JSON.parse(matrixSource);

/**
 * @lang zh-CN 按精确 kebab-case 名称取得 matrix component record；缺失立即失败，不允许 alias 或模糊匹配。
 * @lang en Obtains a matrix component record by exact kebab-case name; absence fails immediately and permits no alias or fuzzy match.
 * @param {string} componentName <lang><zh-CN>固定组件名。</zh-CN><en>Fixed component name.</en></lang>
 * @returns {object} <lang><zh-CN>对应的已提交 matrix record。</zh-CN><en>Corresponding committed matrix record.</en></lang>
 */
function requireMatrixComponent(componentName) {
  // <lang><zh-CN>查找只遍历提交的 component 数组，不改变数组顺序、计数或任何 migration disposition。</zh-CN><en>The lookup traverses only the committed component array and changes no array order, count, or migration disposition.</en></lang>
  const component = apiCompatibilityMatrix.components.find((candidate) => candidate.name === componentName);

  assert.ok(component, `Missing API compatibility component: ${componentName}`);
  return component;
}

test('keeps feedback migration implementations controlled and explicitly scoped', () => {
  // <lang><zh-CN>modal/popup 都必须将受控可见值转为可拒绝的 update 请求；modal 仅允许由调用方显式提供 scope 与 host opt-in，不得发现 global service。</zh-CN><en>Modal/popup must convert controlled visibility into a rejectable update request; modal permits only caller-supplied scope and explicit host opt-in and must discover no global service.</en></lang>
  assert.match(modalSource, /modelValue: \{\s*type: Boolean,\s*default: false\s*\}/su);
  assert.match(modalSource, /const controlledVisible = computed\(\(\) => props\.visible \?\? props\.modelValue\);/u);
  assert.match(modalSource, /serviceScope: \{ type: Object, default: null \}/u);
  assert.match(modalSource, /serviceHost: \{ type: Boolean, default: false \}/u);
  assert.match(modalSource, /registerUFeedbackHost\(props\.serviceScope, 'modal', serviceHost\)/u);
  assert.match(modalSource, /emit\('update:modelValue', false\);/u);
  assert.doesNotMatch(modalSource, /getCurrentPages\(|\buni\.(?:request|navigate|redirect|switchTab)|globalThis\.|props\.callback/u);
  assert.match(popupSource, /modelValue: \{ type: Boolean, default: false \}/u);
  assert.match(popupSource, /show: \{ type: Boolean, default: false \}/u);
  assert.match(popupSource, /function requestClose\(event, reason\)/u);

  // <lang><zh-CN>loading 保持静态 indicator；toast 的命令式 surface 必须同时支持组件 ref 与显式 scope host，并排除回调、URL、路由或页面发现。</zh-CN><en>Loading remains a static indicator; toast's imperative surface must support both component refs and explicit scoped hosts while excluding callbacks, URLs, routing, or page discovery.</en></lang>
  assert.match(loadingSource, /show: \{ type: Boolean, default: true \}/u);
  assert.match(loadingSource, /const isVisible = computed\(\(\) => props\.visible \?\? props\.show\);/u);
  assert.match(toastSource, /loading: \{ type: Boolean, default: false \}/u);
  assert.match(toastSource, /<ULoading v-if="resolvedLoading"/u);
  assert.match(toastSource, /serviceScope: \{ type: Object, default: null \}/u);
  assert.match(toastSource, /serviceHost: \{ type: Boolean, default: false \}/u);
  assert.match(toastSource, /registerUFeedbackHost\(props\.serviceScope, 'toast', serviceHost\)/u);
  assert.match(toastSource, /defineExpose\(\{ show, close, hide: close \}\);/u);
  assert.doesNotMatch(toastSource, /getCurrentPages\(|\buni\.(?:request|navigate|redirect|switchTab)|globalThis\.|props\.(?:callback|url)/u);

  // <lang><zh-CN>swipe-action 必须以 show/options 作为受控迁移入口，归一 text/label 并保持无原生手势或数据操作边界。</zh-CN><en>Swipe-action must use show/options as controlled migration entries, normalize text/label, and retain no-native-gesture or data-operation boundaries.</en></lang>
  assert.match(swipeActionSource, /show: \{ type: Boolean, default: false \}/u);
  assert.match(swipeActionSource, /options: \{ type: Array, default: \(\) => \[\] \}/u);
  // <lang><zh-CN>P69 后 label/text/value 必须通过 own-data descriptor 与安全标量门禁；旧直接属性读取会执行 getter，因此不再接受。</zh-CN><en>After P69, label/text/value must pass own-data-descriptor and safe-scalar gates; the former direct property read could execute getters and is no longer accepted.</en></lang>
  assert.match(swipeActionSource, /const rawLabel = readOwnDataValue\(raw, 'label'\);/u);
  assert.match(swipeActionSource, /const rawText = readOwnDataValue\(raw, 'text'\);/u);
  assert.match(swipeActionSource, /const rawValue = readOwnDataValue\(raw, 'value'\);/u);
  assert.match(swipeActionSource, /const value = safeValue \?\? labelSource;/u);
  assert.doesNotMatch(swipeActionSource, /raw\.label \?\? raw\.text/u);
  assert.match(swipeActionSource, /const emit = defineEmits\(\['action', 'click', 'close', 'update:open'\]\);/u);
  assert.doesNotMatch(swipeActionSource, /touchstart|touchmove|touchend|transform:/u);
});

test('keeps public explanation and compiler fixture aligned with the bounded migration surface', () => {
  // <lang><zh-CN>公开文档必须说明 alias 优先级、可拒绝写回和静态 indicator/service 边界，避免调用方误读为自动关闭或全局能力。</zh-CN><en>Public documentation must explain alias precedence, rejectable writeback, and static-indicator/service boundaries, avoiding callers mistaking them for automatic close or global capability.</en></lang>
  assert.match(modalDocumentation, /`modelValue`/u);
  assert.match(popupDocumentation, /`modelValue` and `show` are combined/u);
  assert.match(loadingDocumentation, /migration `show`/u);
  assert.match(toastDocumentation, /imperative `show\(\)`\/`close\(\)` command/u);
  assert.match(swipeActionDocumentation, /migration `show`/u);
  assert.match(swipeActionDocumentation, /migration `options`/u);

  // <lang><zh-CN>MP fixture 仅编译有限受控 props/events，并把 swipe click 交给现有本地文字记录；它不调用 service 或外部数据访问。</zh-CN><en>The MP fixture compiles only finite controlled props/events and delegates swipe click to the existing local-copy record; it calls no service or external data access.</en></lang>
  assert.match(fixtureSource, /<u-loading :show="true"/u);
  assert.match(fixtureSource, /:loading="true"/u);
  assert.match(fixtureSource, /<u-popup :model-value="fixturePopupVisible"/u);
  assert.match(fixtureSource, /<u-swipe-action :show="true" :options="fixtureSwipeOptions"/u);
  assert.match(fixtureSource, /@update:model-value="updateCatalogModalVisible"/u);
});

test('marks only explicit audited feedback props compatible and retains bounded mappings', () => {
  // <lang><zh-CN>每项 compatible prop 都必须有同名 target、显式人工规则和稳定原因码，禁止名称相同自动升级。</zh-CN><en>Every compatible prop must have a same-name target, explicit human rule, and stable reason code; matching names cannot auto-promote it.</en></lang>
  for (const [componentName, propNames] of Object.entries(expectedCompatibleProps)) {
    // <lang><zh-CN>每个 component record 独立读取，避免其他组件的同名 prop 满足当前断言。</zh-CN><en>Each component record is read independently, preventing a same-named prop on another component from satisfying the current assertion.</en></lang>
    const component = requireMatrixComponent(componentName);

    for (const propName of propNames) {
      // <lang><zh-CN>稳定 item ID 绑定 component 与 prop 身份；不依据数组位置推断记录。</zh-CN><en>The stable item ID binds component and prop identity; no array position is used to infer the record.</en></lang>
      const item = component.props.items.find((candidate) => candidate.id === `prop:${propName}`);

      assert.ok(item, `Missing audited prop: ${componentName}.${propName}`);
      assert.equal(item.migration.disposition, 'compatible');
      assert.equal(item.migration.reasonCode, 'EXPLICIT_SEMANTIC_RULE');
      assert.equal(item.migration.target, propName);
      assert.match(generatorSource, new RegExp(`'${componentName}\\|props\\|${propName}'`, 'u'));
    }
  }

  // <lang><zh-CN>alias/options/click/update 与 toast component-ref 命令仍处于受限名字、item-shape 或语义差异 scope，必须保守保持 mapped。</zh-CN><en>Aliases/options/click/update and toast component-ref commands remain within bounded name, item-shape, or semantically different scopes and must conservatively stay mapped.</en></lang>
  assert.equal(requireMatrixComponent('u-popup').props.items.find((item) => item.id === 'prop:modelValue').migration.disposition, 'mapped');
  assert.equal(requireMatrixComponent('u-popup').events.items.find((item) => item.id === 'event:update:modelValue').migration.disposition, 'mapped');
  assert.equal(requireMatrixComponent('u-swipe-action').props.items.find((item) => item.id === 'prop:options').migration.disposition, 'mapped');
  assert.equal(requireMatrixComponent('u-swipe-action').events.items.find((item) => item.id === 'event:click').migration.disposition, 'mapped');
  assert.equal(requireMatrixComponent('u-toast').imperativeApis.items.find((item) => item.id === 'imperative:show').migration.disposition, 'mapped');
});
