/**
 * @module verify-p54-component-contract.test
 * @lang zh-CN 验证 P54 导航、安全区、反馈与局部 overlay 组件的声明、双语 ROP、主题 token 和受限平台边界；本测试不启动网络、dev server 或平台 API。
 * @lang en Verifies declarations, bilingual ROP, theme tokens, and constrained platform boundaries for P54 navigation, safe-area, feedback, and local-overlay components; this test starts no network, dev server, or platform API.
 */

import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

// <lang><zh-CN>逐项锁定稳定声明路径和 token 前缀，防止 manifest、源码、样式、主题和公开契约漂移。</zh-CN><en>Locks each stable declaration path and token prefix, preventing drift among manifest, source, style, theme, and public contract.</en></lang>
const p54ComponentRecords = Object.freeze([
  Object.freeze({ name: 'u-back-top', exportName: 'UBackTop', contract: 'docs/back-top.md', token: '--u-comp-back-top-' }),
  Object.freeze({ name: 'u-cell-item', exportName: 'UCellItem', contract: 'docs/cell-item.md', token: '--u-comp-cell-item-' }),
  Object.freeze({ name: 'u-config-provider', exportName: 'UConfigProvider', contract: 'docs/config-provider.md', token: '--u-comp-config-provider-' }),
  Object.freeze({ name: 'u-fab', exportName: 'UFab', contract: 'docs/fab.md', token: '--u-comp-fab-' }),
  Object.freeze({ name: 'u-loading', exportName: 'ULoading', contract: 'docs/loading.md', token: '--u-comp-loading-' }),
  Object.freeze({ name: 'u-loading-popup', exportName: 'ULoadingPopup', contract: 'docs/loading-popup.md', token: '--u-comp-loading-popup-' }),
  Object.freeze({ name: 'u-mask', exportName: 'UMask', contract: 'docs/mask.md', token: '--u-comp-mask-' }),
  Object.freeze({ name: 'u-navbar', exportName: 'UNavbar', contract: 'docs/navbar.md', token: '--u-comp-navbar-' }),
  Object.freeze({ name: 'u-no-network', exportName: 'UNoNetwork', contract: 'docs/no-network.md', token: '--u-comp-no-network-' }),
  Object.freeze({ name: 'u-notice-bar', exportName: 'UNoticeBar', contract: 'docs/notice-bar.md', token: '--u-comp-notice-bar-' }),
  Object.freeze({ name: 'u-root-portal', exportName: 'URootPortal', contract: 'docs/root-portal.md', token: '--u-comp-root-portal-' }),
  Object.freeze({ name: 'u-safe-bottom', exportName: 'USafeBottom', contract: 'docs/safe-bottom.md', token: '--u-comp-safe-bottom-' }),
  Object.freeze({ name: 'u-status-bar', exportName: 'UStatusBar', contract: 'docs/status-bar.md', token: '--u-comp-status-bar-' }),
  Object.freeze({ name: 'u-top-tips', exportName: 'UTopTips', contract: 'docs/top-tips.md', token: '--u-comp-top-tips-' }),
  Object.freeze({ name: 'u-transition', exportName: 'UTransition', contract: 'docs/transition.md', token: '--u-comp-transition-' })
]);

/**
 * @lang zh-CN 解析单项 P54 组件的规范化源码和样式路径；名称来自受限常量而非外部输入。
 * @lang en Resolves normalized source and style paths for one P54 component; the name comes from a constrained constant rather than external input.
 * @param {{name: string}} record <lang><zh-CN>已锁定的组件记录。</zh-CN><en>Locked component record.</en></lang>
 * @returns {{source: string, style: string}} <lang><zh-CN>相对仓库根的源码和样式路径。</zh-CN><en>Source and style paths relative to repository root.</en></lang>
 */
function componentPaths(record) {
  // <lang><zh-CN>每项均使用同名目录和文件，保留 manifest 所表达的稳定组件边界。</zh-CN><en>Every entry uses a same-named directory and file, retaining the stable component boundary expressed by the manifest.</en></lang>
  const componentRoot = `HIA-uView-UI/src/components/${record.name}`;

  // <lang><zh-CN>返回可审计的固定后缀路径，不接受调用方路径片段。</zh-CN><en>Returns auditable fixed-suffix paths and accepts no caller path fragments.</en></lang>
  return Object.freeze({ source: `${componentRoot}/${record.name}.vue`, style: `${componentRoot}/${record.name}.css` });
}

/**
 * @lang zh-CN 验证所有 P54 组件均已声明为双语契约，并拥有一致源码、样式和公开文档入口。
 * @lang en Verifies that every P54 component is declared as a bilingual contract and has aligned source, style, and public-document entry points.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects when an assertion fails.</en></lang>
 */
test('keeps P54 component declarations aligned', async () => {
  // <lang><zh-CN>读取 UI manifest 并按名称索引，避免依赖新增记录的偶然数组顺序。</zh-CN><en>Reads the UI manifest and indexes it by name, avoiding reliance on accidental array order of new records.</en></lang>
  const manifest = JSON.parse(await readFile(resolve('HIA-uView-UI/hia-uview.components.json'), 'utf8'));
  const manifestByName = new Map(manifest.components.map((component) => [component.name, component]));

  for (const record of p54ComponentRecords) {
    // <lang><zh-CN>每项必须引用与稳定命名空间一致的源码和公开契约。</zh-CN><en>Every entry must reference source and public contract consistent with its stable namespace.</en></lang>
    const manifestRecord = manifestByName.get(record.name);
    const paths = componentPaths(record);
    assert.ok(manifestRecord, `Manifest must declare ${record.name}.`);
    assert.equal(manifestRecord.source, paths.source.replace('HIA-uView-UI/', ''));
    assert.equal(manifestRecord.contract, record.contract);
    assert.deepEqual(manifestRecord.locales, ['zh-Hans', 'en']);
    await access(resolve(paths.source));
    await access(resolve(paths.style));
    await access(resolve(record.contract));
  }

  // <lang><zh-CN>P54 保持自身十五项声明；完整 manifest 还可包含保持同一治理边界的后续组件。</zh-CN><en>P54 retains its own fifteen declarations; the complete manifest may also contain subsequent components under the same governance boundary.</en></lang>
  assert.equal(manifest.components.length, 83);
});

/**
 * @lang zh-CN 验证 P54 源码保持双语 ROP，并排除请求、平台读取、存储、计时器、观察器、动态资源和原生插件。
 * @lang en Verifies that P54 source retains bilingual ROP and excludes requests, platform reads, storage, timers, observers, dynamic assets, and native plugins.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects when an assertion fails.</en></lang>
 */
test('keeps P54 components caller-controlled and platform-neutral', async () => {
  // <lang><zh-CN>读取全部源码和样式，先剥离注释再检查可执行内容，避免边界说明触发误报。</zh-CN><en>Reads all source and styles, removes comments before checking executable content, avoiding false positives from boundary disclosures.</en></lang>
  const sources = await Promise.all(p54ComponentRecords.map(async (record) => readFile(resolve(componentPaths(record).source), 'utf8')));
  const styles = await Promise.all(p54ComponentRecords.map(async (record) => readFile(resolve(componentPaths(record).style), 'utf8')));
  const executable = [...sources, ...styles].join('\n').replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const forbidden = [
    /\bset(?:Timeout|Interval)\s*\(/,
    /\brequestAnimationFrame\s*\(/,
    /\b(?:fetch|uni\.request)\s*\(/,
    /\buni\.[A-Za-z]/,
    /\b(?:localStorage|sessionStorage)\s*\./,
    /\bconsole\s*\./,
    /IntersectionObserver/i,
    /createSelectorQuery/i,
    /requireNativePlugin/i,
    /BindingX/i,
    /<script[^>]+src=/i,
    /data:image\//i,
    /@font-face/i
  ];

  for (const pattern of forbidden) assert.doesNotMatch(executable, pattern);
  for (const [index, source] of sources.entries()) {
    // <lang><zh-CN>模块级双语描述和行内双语说明共同构成当前代码文档最低门槛。</zh-CN><en>Module-level bilingual description and inline bilingual explanation jointly form the current minimum code-documentation threshold.</en></lang>
    assert.match(source, /@lang zh-CN/, p54ComponentRecords[index].name);
    assert.match(source, /@lang en/, p54ComponentRecords[index].name);
    assert.match(source, /<lang><zh-CN>/, p54ComponentRecords[index].name);
  }

  // <lang><zh-CN>名称近似的旧契约必须继续分开，避免 registry 或实现层出现隐式别名。</zh-CN><en>Similarly named earlier contracts must remain separate, avoiding implicit aliases in registry or implementation.</en></lang>
  assert.match(sources[7], /name: 'u-navbar'/);
  assert.match(sources[9], /name: 'u-notice-bar'/);
  assert.doesNotMatch(sources[7], /name: 'u-nav-bar'/);
  assert.doesNotMatch(sources[9], /name: 'u-notice'/);
  assert.match(sources[5], /<UMask/);
  assert.match(sources[5], /<ULoading/);
});

/**
 * @lang zh-CN 验证默认主题声明本批 CSS 实际消费的 token 族，避免组件把硬编码视觉值当作主题实现。
 * @lang en Verifies that the default theme declares token families actually consumed by this batch CSS, preventing components from treating hard-coded visual values as theming.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects when an assertion fails.</en></lang>
 */
test('defines P54 token families in the default theme', async () => {
  // <lang><zh-CN>主题是唯一权威默认 token 来源；逐族检查而非只检查任意组件 token 存在。</zh-CN><en>The theme is the sole authoritative default-token source; check each family rather than merely any component token.</en></lang>
  const themeCss = await readFile(resolve('HIA-uView-UI/src/theme/hia-light.css'), 'utf8');
  for (const record of p54ComponentRecords) assert.match(themeCss, new RegExp(`${record.token}[^:]*:`));
});
