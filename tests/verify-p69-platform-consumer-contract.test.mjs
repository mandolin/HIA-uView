/**
 * @module verify-p69-platform-consumer-contract.test
 * @lang zh-CN 锁定 H5 package-root 与 mp-weixin Easycom 对十三个展示、媒体与列表组件的真实组合入口；测试只读取固定仓内源码和验证器，不构建、不联网、不启动开发者工具或设备。
 * @lang en Locks actual H5 package-root and mp-weixin Easycom composition entries for the thirteen display, media, and list components; the test reads only fixed in-repository source and verifier files and does not build, access the network, or start DevTools or a device.
 */

// <lang><zh-CN>严格断言要求两个平台 fixture 保持同一冻结组件集合，而不是以数量或模糊文本满足。</zh-CN><en>Strict assertions require both platform fixtures to retain the same frozen component set rather than satisfying the contract by count or fuzzy text.</en></lang>
import assert from 'node:assert/strict';
// <lang><zh-CN>四个固定读取边界排除业务项目、生成目录、网络和任意目录发现。</zh-CN><en>Four fixed read boundaries exclude business projects, generated directories, the network, and arbitrary directory discovery.</en></lang>
import { readFile } from 'node:fs/promises';
// <lang><zh-CN>内建测试 runner 让本静态合同独立于 Vue、UniApp compiler 和平台 runtime。</zh-CN><en>The built-in test runner keeps this static contract independent from Vue, the UniApp compiler, and platform runtimes.</en></lang>
import test from 'node:test';

/**
 * @lang zh-CN 两个 fixture 必须共同消费的冻结 kebab-case 组件集合；名称直接对应公开 runtime 与 Easycom 路径。
 * @lang en Frozen kebab-case component set that both fixtures must consume; names correspond directly to public runtimes and Easycom paths.
 */
const DISPLAY_MEDIA_LIST_COMPONENT_NAMES = Object.freeze([
  'u-button',
  'u-cell',
  'u-cell-group',
  'u-cell-item',
  'u-icon',
  'u-image',
  'u-pagination',
  'u-skeleton',
  'u-swipe-action',
  'u-text',
  'u-empty',
  'u-tag',
  'u-alert-tips'
]);

// <lang><zh-CN>并行读取两个平台输入与两个产物验证器；测试不执行这些验证器或改写 fixture。</zh-CN><en>Reads both platform inputs and both artifact verifiers concurrently; the test neither executes the verifiers nor rewrites fixtures.</en></lang>
const [h5Source, h5Verifier, mpWeixinSource, mpWeixinVerifier] = await Promise.all([
  readFile('HIA-uView-UI/fixtures/h5/src/App.vue', 'utf8'),
  readFile('HIA-uView-UI/fixtures/h5/verify-output.mjs', 'utf8'),
  readFile('HIA-uView-UI/fixtures/mp-weixin/src/pages/index/index.vue', 'utf8'),
  readFile('scripts/verify-mp-weixin-fixture.mjs', 'utf8')
]);

/**
 * @lang zh-CN 将 kebab-case 组件名转换为稳定 PascalCase H5 标签名；只处理冻结 ASCII 名称，不接受用户输入或 locale 规则。
 * @lang en Converts a kebab-case component name into its stable PascalCase H5 tag name; handles only frozen ASCII names and accepts no user input or locale rule.
 * @param {string} componentName <lang><zh-CN>冻结的 kebab-case 组件名。</zh-CN><en>Frozen kebab-case component name.</en></lang>
 * @returns {string} <lang><zh-CN>对应的 PascalCase 标签名。</zh-CN><en>Corresponding PascalCase tag name.</en></lang>
 */
function toPascalCase(componentName) {
  // <lang><zh-CN>连字符后的固定 ASCII 字母改为大写；转换不读取运行时 manifest 或 component registry。</zh-CN><en>Uppercases fixed ASCII letters after hyphens; the conversion reads no runtime manifest or component registry.</en></lang>
  return componentName.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

test('keeps the H5 package-root composition and output verifier complete', () => {
  // <lang><zh-CN>双 marker 证明页面拥有一个可见组合区和一个独立意图观察点。</zh-CN><en>The two markers prove the page owns one visible composition region and one separate intent-observation point.</en></lang>
  assert.match(h5Source, /data-smoke="display-media-list"/u);
  assert.match(h5Source, /data-smoke="display-media-list-intent"/u);

  for (const componentName of DISPLAY_MEDIA_LIST_COMPONENT_NAMES) {
    // <lang><zh-CN>每个 H5 组件既必须出现为模板标签，也必须从固定 package root 具名导入，避免只依赖未知全局状态。</zh-CN><en>Every H5 component must appear as a template tag and as a named import from the fixed package root, avoiding reliance on unknown global state.</en></lang>
    const componentTag = toPascalCase(componentName);
    assert.match(h5Source, new RegExp('<' + componentTag + '(?:\\s|>)', 'u'), 'H5 source must compose ' + componentTag + '.');
    assert.match(h5Source, new RegExp("import\\s*\\{[^}]*\\b" + componentTag + "\\b[^}]*\\}\\s*from '../../../src/index\\.mjs';", 'u'), 'H5 source must import ' + componentTag + ' from the package root.');
    assert.match(h5Verifier, new RegExp("'" + componentTag + "'", 'u'), 'H5 verifier must enumerate ' + componentTag + '.');
  }

  // <lang><zh-CN>产物验证器必须检查 freshly-built JavaScript marker，不能只复述源文件标签。</zh-CN><en>The artifact verifier must inspect freshly built JavaScript markers and cannot merely repeat source-file tags.</en></lang>
  assert.match(h5Verifier, /P69_JAVASCRIPT_RUNTIME_MARKERS/u);
  assert.match(h5Verifier, /combinedJavaScript\.includes\(runtimeMarker\)/u);
});

test('keeps the mp-weixin Easycom composition and generated-artifact verifier complete', () => {
  // <lang><zh-CN>双 marker 与十三个标签共同证明一个完整页面组合；散落旧标签不能替代统一 marker。</zh-CN><en>The two markers and thirteen tags jointly prove one complete page composition; scattered legacy tags cannot replace the unified marker.</en></lang>
  assert.match(mpWeixinSource, /data-smoke="display-media-list"/u);
  assert.match(mpWeixinSource, /data-smoke="display-media-list-intent"/u);

  for (const componentName of DISPLAY_MEDIA_LIST_COMPONENT_NAMES) {
    assert.match(mpWeixinSource, new RegExp('<' + componentName + '(?:\\s|>)', 'u'), 'mp-weixin source must compose ' + componentName + '.');
    assert.match(mpWeixinVerifier, new RegExp("'" + componentName + "'", 'u'), 'mp-weixin verifier must enumerate ' + componentName + '.');
  }

  // <lang><zh-CN>验证器必须同时锁定 page JSON mapping、WXML 标签、leaf 四件套与 UEmpty 内部依赖，不把源码出现误当作可导入证据。</zh-CN><en>The verifier must lock page-JSON mappings, WXML tags, leaf quartets, and UEmpty internal dependencies together rather than treating source presence as importable evidence.</en></lang>
  assert.match(mpWeixinVerifier, /usingComponents\?\.\[componentName\]/u);
  assert.match(mpWeixinVerifier, /p69ArtifactChecks/u);
  assert.match(mpWeixinVerifier, /emptyConfiguration\.usingComponents\?\.\['u-button'\]/u);
  assert.match(mpWeixinVerifier, /emptyConfiguration\.usingComponents\?\.\['u-image'\]/u);
});

test('keeps both platform fixtures offline and caller-owned', () => {
  // <lang><zh-CN>页面源码不得引入网络、storage、平台路由或页面栈；组件点击仅写本地 marker。</zh-CN><en>Page sources must introduce no network, storage, platform routing, or page stack; component clicks write only local markers.</en></lang>
  for (const source of [h5Source, mpWeixinSource]) {
    assert.doesNotMatch(source, /fetch\(|XMLHttpRequest|localStorage|sessionStorage|getCurrentPages|uni\.(?:request|navigate|redirect|reLaunch|switchTab)|wx\.(?:request|navigate|redirect|reLaunch|switchTab)/u);
  }
});
