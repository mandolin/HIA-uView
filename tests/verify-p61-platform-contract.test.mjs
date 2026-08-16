/**
 * @module verify-p61-platform-contract.test
 * @lang zh-CN 锁定 P61 的有限 picker、tabbar 与 notice-bar 迁移事实。测试只读取公开仓内 source、合同、fixture、生成器与 matrix，不访问网络、上游检出、DevTools、业务项目、平台服务或使用者源码，也不写入输入。
 * @lang en Locks P61 bounded picker, tabbar, and notice-bar migration facts. The test reads only public repository source, contracts, fixture, generator, and matrix; it accesses no network, upstream checkout, DevTools, business project, platform service, or consumer source and writes no input.
 */

// <lang><zh-CN>严格断言把同名 prop/event 与已审计的 API 语义区分开，避免 compiler 通过被误升格为兼容。</zh-CN><en>Strict assertions distinguish same-named props/events from audited API semantics, preventing compiler success from being over-promoted to compatibility.</en></lang>
import assert from 'node:assert/strict';
// <lang><zh-CN>固定读取确保本门禁不会隐式发现目录或读取不受控 consumer 文件。</zh-CN><en>Fixed reads ensure this gate discovers no directories or uncontrolled consumer files implicitly.</en></lang>
import { readFile } from 'node:fs/promises';
// <lang><zh-CN>内建测试 runner 保持静态契约独立于浏览器、设备与小程序运行时。</zh-CN><en>The built-in test runner keeps the static contract independent from browser, device, and Mini Program runtime.</en></lang>
import test from 'node:test';

// <lang><zh-CN>并行读取所有固定公共输入；每项均在本仓且由后续精确断言消费。</zh-CN><en>Reads every fixed public input in parallel; each belongs to this repository and is consumed by subsequent exact assertions.</en></lang>
const [pickerSource, tabbarSource, noticeSource, pickerDocumentation, tabbarDocumentation, noticeDocumentation, fixtureSource, generatorSource, matrixSource] = await Promise.all([
  readFile('HIA-uView-UI/src/components/u-picker/u-picker.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-tabbar/u-tabbar.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-notice-bar/u-notice-bar.vue', 'utf8'),
  readFile('docs/picker.md', 'utf8'),
  readFile('docs/tabbar.md', 'utf8'),
  readFile('docs/notice-bar.md', 'utf8'),
  readFile('HIA-uView-UI/fixtures/mp-weixin/src/pages/index/index.vue', 'utf8'),
  readFile('scripts/generate-api-compatibility-matrix.mjs', 'utf8'),
  readFile('HIA-uView-UI/hia-uview.api-compatibility.json', 'utf8')
]);

// <lang><zh-CN>已提交 matrix 仅供只读事实断言；测试不重新运行生成器。</zh-CN><en>The committed matrix serves only read-only fact assertions; the test does not rerun the generator.</en></lang>
const apiCompatibilityMatrix = JSON.parse(matrixSource);

/**
 * @lang zh-CN 以精确 kebab-case 名称取得 matrix component，不接受 alias、模糊匹配或数组位置。
 * @lang en Obtains a matrix component by exact kebab-case name and accepts no alias, fuzzy match, or array position.
 * @param {string} componentName <lang><zh-CN>固定组件名称。</zh-CN><en>Fixed component name.</en></lang>
 * @returns {object} <lang><zh-CN>对应已提交 component record。</zh-CN><en>Corresponding committed component record.</en></lang>
 */
function requireComponent(componentName) {
  // <lang><zh-CN>仅查 matrix 的 components，缺失立即失败，防止跨组件同名 prop 满足断言。</zh-CN><en>Looks only in matrix components and fails immediately on absence, preventing same-named props across components from satisfying an assertion.</en></lang>
  const component = apiCompatibilityMatrix.components.find((candidate) => candidate.name === componentName);

  assert.ok(component, `Missing API compatibility component: ${componentName}`);
  return component;
}

/**
 * @lang zh-CN 以精确 prop ID 取得迁移项目，保持组件和 prop 身份均受约束。
 * @lang en Obtains a migration item by exact prop ID, constraining both component and prop identity.
 * @param {string} componentName <lang><zh-CN>固定组件名称。</zh-CN><en>Fixed component name.</en></lang>
 * @param {string} propName <lang><zh-CN>固定 prop 名称。</zh-CN><en>Fixed prop name.</en></lang>
 * @returns {object} <lang><zh-CN>已提交 prop item。</zh-CN><en>Committed prop item.</en></lang>
 */
function requireProp(componentName, propName) {
  // <lang><zh-CN>prop ID 是稳定 JSON fact，而非显示文字或实现细节。</zh-CN><en>The prop ID is a stable JSON fact rather than display text or implementation detail.</en></lang>
  const item = requireComponent(componentName).props.items.find((candidate) => candidate.id === `prop:${propName}`);

  assert.ok(item, `Missing API compatibility prop: ${componentName}.${propName}`);
  return item;
}

test('keeps platform-facing aliases local and does not acquire platform lifecycle', () => {
  // <lang><zh-CN>tabbar 的 show/modelValue/visible 需要存在精确 defaults，且 source 中不得接入 native tabBar 控制或路由调用。</zh-CN><en>Tabbar show/modelValue/visible need exact defaults, and source must not acquire native-tab-bar control or routing calls.</en></lang>
  assert.match(tabbarSource, /show: \{ type: Boolean, default: true \}/u);
  assert.match(tabbarSource, /visible: \{ type: Boolean, default: undefined \}/u);
  assert.match(tabbarSource, /modelValue: \{ type: \[String, Number\], default: 0 \}/u);
  assert.match(tabbarSource, /props\.visible === undefined \? props\.show : props\.visible/u);
  assert.match(tabbarSource, /const icon = typeof source\.icon === 'string' \? source\.icon\.trim\(\) : '';/u);
  assert.match(tabbarSource, /const activeIcon = typeof source\.activeIcon === 'string' \? source\.activeIcon\.trim\(\) : '';/u);
  assert.match(tabbarSource, /<image v-if="resolveItemIcon\(item\)" class="u-tabbar__icon"/u);
  assert.doesNotMatch(tabbarSource, /uni\.hideTabBar|uni\.switchTab|getCurrentPages|navigateTo|redirectTo/u);

  // <lang><zh-CN>notice 的 show alias 和 click 必须只是 caller-controlled intent，不出现 timer、轮播或全局 service。</zh-CN><en>Notice show alias and click must be caller-controlled intent only, with no timer, rotation, or global service.</en></lang>
  assert.match(noticeSource, /show: \{ type: Boolean, default: true \}/u);
  assert.match(noticeSource, /visible: \{ type: Boolean, default: undefined \}/u);
  assert.match(noticeSource, /defineEmits\(\['click', 'close'\]\)/u);
  assert.match(noticeSource, /class="u-notice-bar__text" type="button" @click="emitClick"/u);
  assert.doesNotMatch(noticeSource, /setTimeout|setInterval|uni\.|fetch\(|globalThis\./u);
});

test('documents the picker semantic boundary and compiles explicit show inputs', () => {
  // <lang><zh-CN>picker 必须明确说明同名 modelValue 不是上游 popup/地区/时间状态，以免应用错误迁移。</zh-CN><en>Picker must expressly state that same-named modelValue is not upstream popup/region/time state, preventing incorrect application migration.</en></lang>
  assert.match(pickerDocumentation, /mapped, not API-compatible/u);
  assert.match(pickerDocumentation, /地区\/时间\/列状态/u);
  assert.doesNotMatch(pickerSource, /<u-popup|uni\.|fetch\(|getCurrentPages/u);

  // <lang><zh-CN>公开合同与编译 fixture 都必须呈现 show/visible 边界；fixture 不编入平台 tab lifecycle 或业务 service。</zh-CN><en>Public contracts and compiler fixture must both present show/visible boundaries; fixture must not compile platform-tab lifecycle or business service.</en></lang>
  assert.match(tabbarDocumentation, /official custom tabBar/u);
  assert.match(tabbarDocumentation, /13 px labels/u);
  assert.match(tabbarDocumentation, /optional 27 px images/u);
  assert.match(noticeDocumentation, /`click` returns the local platform click observation/u);
  assert.match(fixtureSource, /<u-notice-bar :show="true"/u);
  assert.match(fixtureSource, /<u-tabbar :show="true"/u);
  assert.doesNotMatch(fixtureSource, /uni\.switchTab|uni\.hideTabBar|fetch\(|uni\.request/u);
});

test('promotes only audited tabbar and notice props while keeping semantic gaps mapped', () => {
  // <lang><zh-CN>三条 generator 规则和三个同形 prop 必须同时存在；不允许仅通过 source 同名提升 matrix disposition。</zh-CN><en>All three generator rules and same-shape props must coexist; matrix disposition cannot be promoted merely by source name equality.</en></lang>
  for (const [componentName, propName] of [['u-tabbar', 'modelValue'], ['u-tabbar', 'show'], ['u-notice-bar', 'show']]) {
    // <lang><zh-CN>每项读取其固定 component/prop record，避免规则从其他组件泄漏。</zh-CN><en>Reads each fixed component/prop record, preventing rules from leaking from another component.</en></lang>
    const item = requireProp(componentName, propName);

    assert.equal(item.migration.disposition, 'compatible');
    assert.equal(item.migration.reasonCode, 'EXPLICIT_SEMANTIC_RULE');
    assert.equal(item.migration.target, propName);
    assert.match(generatorSource, new RegExp(`'${componentName}\\|props\\|${propName}'`, 'u'));
  }

  // <lang><zh-CN>picker 的 modelValue 与 notice 的 click 仍是不同语义/载荷范围的映射，不能因同名被误报为兼容。</zh-CN><en>Picker modelValue and notice click remain mappings with different semantic/payload scope and must not be misreported as compatible by name equality.</en></lang>
  assert.equal(requireProp('u-picker', 'modelValue').migration.disposition, 'mapped');
  assert.equal(requireProp('u-picker', 'modelValue').migration.reasonCode, 'SAME_NAME_DIFFERENT_SHAPE');
  assert.equal(requireComponent('u-notice-bar').events.items.find((item) => item.id === 'event:click').migration.disposition, 'mapped');
});
