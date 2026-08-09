/**
 * @module verify-p61-choice-migration-contract.test
 * @lang zh-CN 锁定受控 choice family 的有限迁移 props、默认 slot、公开边界、编译 fixture 与 API matrix。测试只读取固定公开仓内文件，不访问网络、临时上游检出、DevTools、业务项目或平台 service，也不写入任何输入。
 * @lang en Locks bounded migration props, default slots, public boundaries, compiler fixture, and API matrix of the controlled choice family. The test reads only fixed public repository files, accesses no network, temporary upstream checkout, DevTools, business project, or platform service, and writes no input.
 */

// <lang><zh-CN>严格断言避免结构同名、松散类型或仅 compiler 通过被误升格为 compatible。</zh-CN><en>Strict assertions prevent structural name equality, loose types, or compiler-only success from being over-promoted to compatible.</en></lang>
import assert from 'node:assert/strict';
// <lang><zh-CN>只读固定文件而不发现目录，保证本地门禁不隐式读取使用者或上游 source。</zh-CN><en>Reads fixed files without discovering directories, ensuring the local gate does not implicitly read consumer or upstream source.</en></lang>
import { readFile } from 'node:fs/promises';
// <lang><zh-CN>使用内建 Node test runner 保持该静态 contract 独立于设备、浏览器和平台模拟器。</zh-CN><en>Uses the built-in Node test runner to keep this static contract independent from device, browser, and platform simulator.</en></lang>
import test from 'node:test';

/**
 * @lang zh-CN 经过独立实现、caller-controlled runtime 回归和 fixture 审计后允许成为 compatible 的精确 P0 prop；事件和 slot 仍为 names-only mapped。
 * @lang en Exact P0 props allowed to become compatible after independent implementation, caller-controlled runtime regression, and fixture audit; events and slots remain names-only mapped.
 */
const expectedCompatibleProps = Object.freeze({
  'u-checkbox': Object.freeze(['disabled', 'label', 'modelValue', 'value']),
  'u-checkbox-group': Object.freeze(['disabled']),
  'u-radio': Object.freeze(['disabled', 'label', 'value']),
  'u-radio-group': Object.freeze(['disabled', 'modelValue']),
  'u-switch': Object.freeze(['disabled', 'loading'])
});

// <lang><zh-CN>并行读取公开 source、contract、fixture、generator 与已提交 matrix，避免测试依赖读取顺序或临时输入。</zh-CN><en>Reads public source, contracts, fixture, generator, and committed matrix in parallel, avoiding dependencies on read order or temporary inputs.</en></lang>
const [checkboxSource, checkboxGroupSource, radioSource, radioGroupSource, switchSource, checkboxDocumentation, checkboxGroupDocumentation, radioDocumentation, radioGroupDocumentation, switchDocumentation, fixtureSource, generatorSource, matrixSource] = await Promise.all([
  readFile('HIA-uView-UI/src/components/u-checkbox/u-checkbox.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-checkbox-group/u-checkbox-group.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-radio/u-radio.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-radio-group/u-radio-group.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-switch/u-switch.vue', 'utf8'),
  readFile('docs/checkbox.md', 'utf8'),
  readFile('docs/checkbox-group.md', 'utf8'),
  readFile('docs/radio.md', 'utf8'),
  readFile('docs/radio-group.md', 'utf8'),
  readFile('docs/switch.md', 'utf8'),
  readFile('HIA-uView-UI/fixtures/mp-weixin/src/pages/index/index.vue', 'utf8'),
  readFile('scripts/generate-api-compatibility-matrix.mjs', 'utf8'),
  readFile('HIA-uView-UI/hia-uview.api-compatibility.json', 'utf8')
]);

/**
 * @lang zh-CN 当前提交的 API compatibility matrix；本测试只读取/解析产物，不重新生成或改写它。
 * @lang en Current committed API compatibility matrix; this test only reads/parses the artifact and neither regenerates nor rewrites it.
 */
const apiCompatibilityMatrix = JSON.parse(matrixSource);

/**
 * @lang zh-CN 根据精确 kebab-case 名称取得 matrix component record；不接受 alias、模糊匹配或数组位置推断。
 * @lang en Obtains a matrix component record by exact kebab-case name; it accepts no alias, fuzzy match, or array-position inference.
 * @param {string} componentName <lang><zh-CN>固定组件名称。</zh-CN><en>Fixed component name.</en></lang>
 * @returns {object} <lang><zh-CN>已提交的 matrix component record。</zh-CN><en>Committed matrix component record.</en></lang>
 */
function requireMatrixComponent(componentName) {
  // <lang><zh-CN>只遍历 matrix 中的固定 component 数组，缺失立即失败，避免另一个组件的同名 prop 满足断言。</zh-CN><en>Traverses only the fixed component array in the matrix and fails on absence, preventing a same-named prop on another component from satisfying an assertion.</en></lang>
  const component = apiCompatibilityMatrix.components.find((candidate) => candidate.name === componentName);

  assert.ok(component, `Missing API compatibility component: ${componentName}`);
  return component;
}

test('keeps choice migration inputs caller-controlled and local', () => {
  // <lang><zh-CN>checkbox 的标准 modelValue、字符串/数字 key、非空字符串 disabled 与 default slot 必须都在 source 中明确，不能通过隐式 coercion 补齐。</zh-CN><en>The checkbox standard modelValue, string/number key, nonempty-string disabled, and default slot must all be explicit in source and cannot be supplied by implicit coercion.</en></lang>
  assert.match(checkboxSource, /modelValue:\s*\{\s*type: Boolean,\s*default: false\s*\}/su);
  assert.match(checkboxSource, /value:\s*\{\s*type: \[String, Number\],\s*default: ''\s*\}/su);
  assert.match(checkboxSource, /disabled:\s*\{\s*type: \[String, Boolean\],\s*default: ''\s*\}/su);
  assert.match(checkboxSource, /<slot><text>\{\{ label \}\}<\/text><\/slot>/u);
  assert.match(checkboxSource, /defineEmits\(\['change', 'update:modelValue'\]\)/u);
  assert.match(checkboxSource, /emit\('update:modelValue', nextChecked\);/u);

  // <lang><zh-CN>radio/group 必须保留数值 key 和既有 select，同时提供受限的 migration change；不得接入 form registry 或任意 option source。</zh-CN><en>The radio/group must retain numeric keys and existing select while providing bounded migration change; they must not acquire a form registry or arbitrary option source.</en></lang>
  assert.match(radioSource, /value:\s*\{\s*type: \[String, Number\],\s*default: ''\s*\}/su);
  assert.match(radioSource, /defineEmits\(\['select', 'change'\]\)/u);
  assert.match(radioSource, /emit\('change', props\.value\);/u);
  assert.match(radioSource, /<slot><text>\{\{ label \}\}<\/text><\/slot>/u);
  assert.match(radioGroupSource, /modelValue:\s*\{\s*type: \[String, Number\],\s*default: ''\s*\}/su);
  assert.match(checkboxGroupSource, /string\/number membership/u);

  // <lang><zh-CN>switch loading 只能成为本地 busy guard；不得出现 vibration、request、storage 或 service 入口。</zh-CN><en>Switch loading may become only a local busy guard; vibration, request, storage, or service entries must not appear.</en></lang>
  assert.match(switchSource, /loading: \{ type: Boolean, default: false \}/u);
  assert.match(switchSource, /const isInteractionDisabled = computed\(\(\) => props\.disabled \|\| props\.loading\);/u);
  assert.doesNotMatch(switchSource, /vibrate|fetch\(|uni\.request|localStorage|defineExpose\(/u);
});

test('keeps contracts and compiler fixture aligned with the bounded surface', () => {
  // <lang><zh-CN>公开合同必须说明 alias 优先级、数值 key/default slot、双事件与 loading 零事件边界，避免读者误解为表单、服务或业务更新。</zh-CN><en>Public contracts must explain alias precedence, numeric key/default slot, dual events, and loading zero-event boundary, preventing readers from mistaking them for form, service, or business updates.</en></lang>
  assert.match(checkboxDocumentation, /explicit `checked`/u);
  assert.match(checkboxDocumentation, /default slot/u);
  assert.match(checkboxGroupDocumentation, /Array<string \| number>/u);
  assert.match(radioDocumentation, /`change\(value\)`/u);
  assert.match(radioGroupDocumentation, /`string \\| number`/u);
  assert.match(switchDocumentation, /`loading`/u);

  // <lang><zh-CN>MP fixture 必须静态组合 loading、独立 checkbox 的 modelValue/数值 value/default slot 与 radio change；它不调用业务服务。</zh-CN><en>The MP fixture must statically compose loading, independent checkbox modelValue/numeric value/default slot, and radio change; it calls no business service.</en></lang>
  assert.match(fixtureSource, /:loading="fixtureSwitchBusy"/u);
  assert.match(fixtureSource, /<u-checkbox :model-value="fixtureIndependentCheckboxValue" :value="7"/u);
  assert.match(fixtureSource, /@update:model-value="updateFixtureIndependentCheckboxValue"/u);
  assert.match(fixtureSource, /<u-radio :value="8"[^>]*@change="recordFixtureIndependentRadioValue"/u);
  assert.doesNotMatch(fixtureSource, /uni\.request|fetch\(|localStorage/u);
});

test('marks only audited choice props compatible and retains bounded mappings', () => {
  // <lang><zh-CN>每项 compatible prop 都必须同时具有同名 target、显式人工规则与稳定原因码；不能从同名自动升级。</zh-CN><en>Every compatible prop must simultaneously have a same-named target, explicit human rule, and stable reason code; it cannot auto-promote from a matching name.</en></lang>
  for (const [componentName, propNames] of Object.entries(expectedCompatibleProps)) {
    // <lang><zh-CN>逐组件读取避免同名 prop 跨组件泄漏；每项 prop 不依赖数组位置。</zh-CN><en>Reads component by component to prevent same-named prop leakage across components; no prop depends on array position.</en></lang>
    const component = requireMatrixComponent(componentName);

    for (const propName of propNames) {
      // <lang><zh-CN>稳定 item ID 绑定 prop 身份，缺失、错误 target 或错误 disposition 都必须失败。</zh-CN><en>The stable item ID binds prop identity; absence, wrong target, or wrong disposition must fail.</en></lang>
      const item = component.props.items.find((candidate) => candidate.id === `prop:${propName}`);

      assert.ok(item, `Missing audited prop: ${componentName}.${propName}`);
      assert.equal(item.migration.disposition, 'compatible');
      assert.equal(item.migration.reasonCode, 'EXPLICIT_SEMANTIC_RULE');
      assert.equal(item.migration.target, propName);
      assert.match(generatorSource, new RegExp(`'${componentName}\\|props\\|${propName}'`, 'u'));
    }
  }

  // <lang><zh-CN>names-only 事件与 slot 仍保持 mapped，switch modelValue 的多类型上游差异仍保持 mapped，防止本批夸大为完整语义兼容。</zh-CN><en>Names-only events and slots remain mapped, and the upstream multi-type difference for switch modelValue remains mapped, preventing this batch from being overstated as complete semantic compatibility.</en></lang>
  assert.equal(requireMatrixComponent('u-checkbox').events.items.find((item) => item.id === 'event:update:modelValue').migration.disposition, 'mapped');
  assert.equal(requireMatrixComponent('u-checkbox').slots.items.find((item) => item.id === 'slot:default').migration.disposition, 'mapped');
  assert.equal(requireMatrixComponent('u-radio').events.items.find((item) => item.id === 'event:change').migration.disposition, 'mapped');
  assert.equal(requireMatrixComponent('u-radio').slots.items.find((item) => item.id === 'slot:default').migration.disposition, 'mapped');
  assert.equal(requireMatrixComponent('u-switch').props.items.find((item) => item.id === 'prop:modelValue').migration.disposition, 'mapped');
});
