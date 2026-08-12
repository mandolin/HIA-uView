/**
 * @module h5-fixture-output
 * @lang zh-CN 验证 H5 fixture 源码与输出包含本地应用、P68 十组件与显式 feedback scope/host、P66 表单组合、P67 十四组件真实组合、HIA-uView 样式和可复核 smoke 文本，不执行浏览器或网络。
 * @lang en Verifies that H5 fixture source and output contain the local app, the P68 ten-component composition with an explicit feedback scope/host, actual P66 form composition, actual P67 fourteen-component composition, HIA-uView style, and inspectable smoke text without browser or network execution.
 */

import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

// <lang><zh-CN>源码路径固定相对于本验证脚本，读取范围不会扩展到业务项目或仓库外。</zh-CN><en>The source path is fixed relative to this verifier and does not expand read scope into a business project or outside the repository.</en></lang>
const fixtureSourcePath = fileURLToPath(new URL('./src/App.vue', import.meta.url));
const fixtureSource = await readFile(fixtureSourcePath, 'utf8');

/**
 * @lang zh-CN P67 H5 页面必须在统一 marker 下真实组合的十四个具名组件标签；列表不导入组件或扩大 runtime。
 * @lang en Fourteen named component tags that the P67 H5 page must actually compose under one marker; the list imports no component and broadens no runtime.
 */
const P67_COMPONENT_TAGS = Object.freeze([
  'UCheckbox',
  'UCheckboxGroup',
  'URadio',
  'URadioGroup',
  'USwitch',
  'UPicker',
  'UCalendar',
  'USelect',
  'UDropdown',
  'UDropdownItem',
  'UNumberBox',
  'URate',
  'USlider',
  'UUpload'
]);

/**
 * @lang zh-CN 每个字符串来自目标组件实际 render function 的稳定 class；验证仅在 JavaScript bundle 中执行，避免完整 CSS 入口制造假阳性。
 * @lang en Every string comes from the target component's actual render function; verification runs only against JavaScript bundles so the complete CSS entry cannot create false positives.
 */
const P67_JAVASCRIPT_RUNTIME_MARKERS = Object.freeze([
  'u-checkbox__mark',
  'u-checkbox-group',
  'u-radio__mark',
  'u-radio-group',
  'u-switch__control',
  'u-picker__options',
  'u-calendar__grid',
  'u-select__options',
  'u-dropdown--disabled',
  'u-dropdown-item__controlled',
  'u-number-box__input',
  'u-rate__item',
  'u-slider__control',
  'u-upload__file'
]);

/**
 * @lang zh-CN P68 H5 页面必须在统一 marker 下真实组合的十个具名组件标签；服务仍以显式源码断言单独验证。
 * @lang en Ten named component tags that the P68 H5 page must actually compose under one marker; services remain separately verified through explicit source assertions.
 */
const P68_COMPONENT_TAGS = Object.freeze([
  'UPopup',
  'UMask',
  'UTransition',
  'UActionSheet',
  'UModal',
  'UToast',
  'UNavbar',
  'UTabbar',
  'UTabs',
  'UNoticeBar'
]);

/**
 * @lang zh-CN 十个 class marker 均来自目标组件 render function；验证不读取 CSS 作为组件消费替代。
 * @lang en All ten class markers originate from target-component render functions; verification does not accept CSS as a substitute for component consumption.
 */
const P68_JAVASCRIPT_RUNTIME_MARKERS = Object.freeze([
  'u-popup',
  'u-mask',
  'u-transition',
  'u-action-sheet',
  'u-modal',
  'u-toast',
  'u-navbar',
  'u-tabbar',
  'u-tabs',
  'u-notice-bar'
]);

// <lang><zh-CN>统一 P68 marker、逐标签与显式 scope/host 绑定共同防止组件或 service 只被 import 而未在页面消费。</zh-CN><en>The unified P68 marker, tag-by-tag checks, and explicit scope/host bindings jointly prevent components or services from being imported without page consumption.</en></lang>
assert.match(fixtureSource, /data-smoke="overlay-feedback-navigation"/u, 'H5 fixture source must retain the unified P68 composition marker.');
assert.match(fixtureSource, /data-smoke="feedback-service-result"/u, 'H5 fixture source must retain the visible P68 service-result marker.');
for (const componentTag of P68_COMPONENT_TAGS) {
  assert.match(fixtureSource, new RegExp('<' + componentTag + '(?:\\s|>)', 'u'), 'H5 fixture source must compose ' + componentTag + '.');
}
assert.match(fixtureSource, /const feedbackScope = createUFeedbackScope\(\)/u, 'H5 fixture must create one explicit feedback scope.');
assert.match(fixtureSource, /<UModal\s+:service-scope="feedbackScope"\s+:service-host="true"/u, 'H5 fixture must mount an explicit modal host.');
assert.match(fixtureSource, /<UToast\s+:service-scope="feedbackScope"\s+:service-host="true"/u, 'H5 fixture must mount an explicit toast host.');

// <lang><zh-CN>源码必须保留中性组合/结果 marker、model/rules 绑定和三个显式 form API；这些静态断言只防止 fixture 漂移，行为仍由 runtime 测试证明。</zh-CN><en>Source must retain neutral composition/result markers, model/rules bindings, and three explicit form APIs; these static assertions only prevent fixture drift while runtime tests still prove behavior.</en></lang>
assert.match(fixtureSource, /data-smoke="p66-form-composition"/);
assert.match(fixtureSource, /data-smoke="p66-form-result"/);
assert.match(fixtureSource, /<UForm\s+ref="p66FormReference"\s+:model="p66FormModel"\s+:rules="p66FormRules"/u);
for (const componentTag of ['UFormItem', 'UField', 'UInput', 'UTextarea', 'USearch']) {
  assert.match(fixtureSource, new RegExp(`<${componentTag}(?:\\s|>)`, 'u'), `H5 fixture source must compose ${componentTag}.`);
}
for (const actionName of ['validateP66Form', 'clearP66Validation', 'resetP66Fields']) {
  assert.match(fixtureSource, new RegExp(`function ${actionName}\\(`, 'u'), `H5 fixture source must retain ${actionName}.`);
}

// <lang><zh-CN>统一 marker 与逐标签断言证明 P67 组件属于页面真实组合，不是仅有 import、样式或孤立旧示例。</zh-CN><en>The unified marker and tag-by-tag assertions prove P67 components belong to actual page composition rather than only imports, styles, or isolated legacy examples.</en></lang>
assert.match(fixtureSource, /data-smoke="p67-controlled-composition"/u, 'H5 fixture source must retain the unified P67 composition marker.');
for (const componentTag of P67_COMPONENT_TAGS) {
  assert.match(fixtureSource, new RegExp(`<${componentTag}(?:\\s|>)`, 'u'), `H5 fixture source must compose ${componentTag}.`);
}

// <lang><zh-CN>精确绑定断言锁定 dropdown options mode 与调用方 upload adapter；这两个能力不能退化为 legacy 单值按钮或纯上传 intent。</zh-CN><en>Exact binding assertions lock dropdown options mode and the caller-owned upload adapter; neither capability may regress to a legacy scalar button or pure upload intent.</en></lang>
assert.match(fixtureSource, /<UDropdownItem\s+v-model="p67DropdownValue"\s+name="scope"[^>]+:options="p67DropdownOptions"/u, 'H5 fixture must use UDropdownItem options mode.');
assert.match(fixtureSource, /<UUpload[\s\S]+:adapter="p67UploadAdapter"[\s\S]+@adapter-state="recordP67UploadAdapterState"/u, 'H5 fixture must inject and observe its page-local UUpload adapter.');

// <lang><zh-CN>读取静态输出目录并筛选入口 HTML，避免将任意生成文件当作证据。</zh-CN><en>Reads the static output directory and selects entry HTML so arbitrary generated files are not treated as evidence.</en></lang>
const outputDirectory = fileURLToPath(new URL('./dist/', import.meta.url));
await access(outputDirectory);
const outputFiles = await readdir(outputDirectory, { recursive: true });
const htmlFile = outputFiles.find((file) => file.endsWith('.html'));
assert.ok(htmlFile, 'H5 fixture must generate an HTML entry.');
const html = await readFile(resolve(outputDirectory, htmlFile), 'utf8');
assert.match(html, /HIA-uView H5 fixture/);
assert.doesNotMatch(html, /http:\/\//i);
assert.doesNotMatch(html, /https:\/\//i);
// <lang><zh-CN>模板文字会被编译到 JavaScript，HTML 只保留入口壳；合并静态资产后检查既有 smoke 标识。</zh-CN><en>Template text is compiled into JavaScript while HTML retains only the entry shell; merge static assets before checking existing smoke markers.</en></lang>
const assetFiles = outputFiles.filter((file) => file.endsWith('.js') || file.endsWith('.css'));
const assetText = await Promise.all(assetFiles.map((file) => readFile(resolve(outputDirectory, file), 'utf8')));
const combinedOutput = [html, ...assetText].join('\n');
assert.match(combinedOutput, /data-smoke/);
assert.match(combinedOutput, /u-select|u-slider|u-dropdown/);

// <lang><zh-CN>只从 JavaScript bundle 验证 P66 组合 marker 与组件运行时 class，避免全量 style.css 让未实际组合的组件形成假阳性。</zh-CN><en>Verifies P66 composition markers and component runtime classes only in JavaScript bundles, preventing the complete style.css from creating false positives for components that were never actually composed.</en></lang>
const javascriptFiles = outputFiles.filter((file) => file.endsWith('.js'));
// <lang><zh-CN>每个候选都来自刚生成的受控 dist；读取不会执行 bundle 或启动浏览器。</zh-CN><en>Every candidate comes from the freshly generated controlled dist; reading neither executes a bundle nor starts a browser.</en></lang>
const javascriptText = await Promise.all(javascriptFiles.map((file) => readFile(resolve(outputDirectory, file), 'utf8')));
// <lang><zh-CN>合并文本只用于稳定 marker 断言，不依赖 hash 文件名或 chunk 顺序。</zh-CN><en>The merged text serves stable-marker assertions only and depends on neither hashed filenames nor chunk order.</en></lang>
const combinedJavaScript = javascriptText.join('\n');

assert.match(combinedJavaScript, /p66-form-composition/, 'H5 JavaScript must retain the neutral P66 form-composition marker.');
assert.match(combinedJavaScript, /p66-form-result/, 'H5 JavaScript must retain the visible P66 result marker.');
assert.match(combinedJavaScript, /p67-controlled-composition/, 'H5 JavaScript must retain the unified P67 composition marker.');
assert.match(combinedJavaScript, /p67-adapter-state/, 'H5 JavaScript must retain the visible P67 adapter-state marker.');
assert.match(combinedJavaScript, /overlay-feedback-navigation/, 'H5 JavaScript must retain the unified P68 composition marker.');
assert.match(combinedJavaScript, /feedback-service-result/, 'H5 JavaScript must retain the visible P68 service-result marker.');

// <lang><zh-CN>六个 class marker 分别来自实际渲染函数；它们与双 data marker 共同证明本地页面真实引入目标组件，而非仅加载其 CSS。</zh-CN><en>The six class markers each originate from an actual render function; together with the two data markers they prove the local page really imports the target components rather than loading only their CSS.</en></lang>
for (const runtimeMarker of [
  'u-form--label-',
  'u-form-item__control',
  'u-field__control',
  'u-input',
  'u-textarea__field',
  'u-search__input'
]) {
  assert.ok(combinedJavaScript.includes(runtimeMarker), `H5 JavaScript must contain the P66 runtime marker ${runtimeMarker}.`);
}

// <lang><zh-CN>十四个 class marker 只能从 JavaScript render 输出满足；未读取 CSS，因而静态全量 style.css 不能替代真实组件组合。</zh-CN><en>All fourteen class markers can be satisfied only by JavaScript render output; no CSS is read, so the static complete style.css cannot substitute for actual component composition.</en></lang>
for (const runtimeMarker of P67_JAVASCRIPT_RUNTIME_MARKERS) {
  assert.ok(combinedJavaScript.includes(runtimeMarker), `H5 JavaScript must contain the P67 runtime marker ${runtimeMarker}.`);
}
// <lang><zh-CN>十个 P68 marker 与局部双语 service 文字证明组件 render 和 service 调用均进入 H5 bundle；这仍只是静态构建证据。</zh-CN><en>The ten P68 markers and local bilingual service copy prove component renders and service calls enter the H5 bundle; this remains static-build evidence only.</en></lang>
for (const runtimeMarker of P68_JAVASCRIPT_RUNTIME_MARKERS) {
  assert.ok(combinedJavaScript.includes(runtimeMarker), 'H5 JavaScript must contain the P68 runtime marker ' + runtimeMarker + '.');
}
assert.match(combinedJavaScript, /Local scoped toast/, 'H5 JavaScript must retain the explicit-scope toast invocation.');
assert.match(combinedJavaScript, /Local scoped modal/, 'H5 JavaScript must retain the explicit-scope modal invocation.');
console.log('HIA-uView H5 fixture output contract passed.');
