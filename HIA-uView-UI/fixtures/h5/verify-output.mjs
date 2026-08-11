/**
 * @module h5-fixture-output
 * @lang zh-CN 验证 H5 fixture 源码与输出包含本地应用、P66 六组件真实组合、HIA-uView 样式和可复核 smoke 文本，不执行浏览器或网络。
 * @lang en Verifies that H5 fixture source and output contain the local app, actual P66 six-component composition, HIA-uView style, and inspectable smoke text without browser or network execution.
 */

import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

// <lang><zh-CN>源码路径固定相对于本验证脚本，读取范围不会扩展到业务项目或仓库外。</zh-CN><en>The source path is fixed relative to this verifier and does not expand read scope into a business project or outside the repository.</en></lang>
const fixtureSourcePath = fileURLToPath(new URL('./src/App.vue', import.meta.url));
const fixtureSource = await readFile(fixtureSourcePath, 'utf8');

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
console.log('HIA-uView H5 fixture output contract passed.');
