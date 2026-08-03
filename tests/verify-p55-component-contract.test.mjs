/**
 * @module verify-p55-component-contract.test
 * @lang zh-CN 验证受控 action-sheet item、有限列选择与固定长度输入的声明、ROP、主题 token 和平台中立边界；本测试不启动网络、dev server 或平台 API。
 * @lang en Verifies declarations, ROP, theme tokens, and platform-neutral boundaries for controlled action-sheet item, finite-column selection, and fixed-length input; this test starts no network, dev server, or platform API.
 */

import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

// <lang><zh-CN>逐项锁定稳定名称、公开契约和 token 前缀，防止 manifest、源码、样式和文档发生不受控漂移。</zh-CN><en>Locks stable names, public contracts, and token prefixes item by item, preventing uncontrolled drift among manifest, source, styles, and documentation.</en></lang>
const p55ComponentRecords = Object.freeze([
  Object.freeze({ name: 'u-action-sheet-item', exportName: 'UActionSheetItem', contract: 'docs/action-sheet-item.md', token: '--u-comp-action-sheet-item-' }),
  Object.freeze({ name: 'u-city-select', exportName: 'UCitySelect', contract: 'docs/city-select.md', token: '--u-comp-city-select-' }),
  Object.freeze({ name: 'u-message-input', exportName: 'UMessageInput', contract: 'docs/message-input.md', token: '--u-comp-message-input-' })
]);

/**
 * @lang zh-CN 解析一个已锁定组件的同名源码和样式路径；名称只来自本地受限常量。
 * @lang en Resolves same-named source and style paths for one locked component; the name comes only from a local constrained constant.
 * @param {{name: string}} record <lang><zh-CN>已锁定组件记录。</zh-CN><en>Locked component record.</en></lang>
 * @returns {{source: string, style: string}} <lang><zh-CN>相对仓库根的源码和样式路径。</zh-CN><en>Source and style paths relative to repository root.</en></lang>
 */
function componentPaths(record) {
  // <lang><zh-CN>同名目录和文件保持 manifest 声明与文件系统边界一一对应。</zh-CN><en>Same-named directory and file keep the manifest declaration in one-to-one correspondence with the filesystem boundary.</en></lang>
  const componentRoot = `HIA-uView-UI/src/components/${record.name}`;
  return Object.freeze({ source: `${componentRoot}/${record.name}.vue`, style: `${componentRoot}/${record.name}.css` });
}

/**
 * @lang zh-CN 验证三项受控组件拥有双语 manifest、源码、样式和公开契约入口。
 * @lang en Verifies that the three controlled components have bilingual manifest, source, style, and public-contract entries.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects when an assertion fails.</en></lang>
 */
test('keeps controlled component declarations aligned', async () => {
  // <lang><zh-CN>以名称索引 manifest，避免测试依赖追加记录的偶然排序。</zh-CN><en>Indexes the manifest by name, avoiding a dependency on accidental ordering of appended records.</en></lang>
  const manifest = JSON.parse(await readFile(resolve('HIA-uView-UI/hia-uview.components.json'), 'utf8'));
  const manifestByName = new Map(manifest.components.map((component) => [component.name, component]));

  for (const record of p55ComponentRecords) {
    // <lang><zh-CN>每项必须有一致的组件根路径、公开文档和双语 locale 声明。</zh-CN><en>Every item must have aligned component-root path, public documentation, and bilingual locale declaration.</en></lang>
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

  // <lang><zh-CN>本测试保持前三项受控组件的契约；完整 manifest 可以包含后续受审阅组件。</zh-CN><en>This test retains the first three controlled-component contracts; the complete manifest may contain subsequently reviewed components.</en></lang>
  assert.equal(manifest.components.length, 89);
});

/**
 * @lang zh-CN 验证受控源码排除平台调用、请求、存储、计时器、父级注入、定位与动态资源。
 * @lang en Verifies that controlled source excludes platform calls, requests, storage, timers, parent injection, geolocation, and dynamic assets.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects when an assertion fails.</en></lang>
 */
test('keeps controlled components data-agnostic and platform-neutral', async () => {
  // <lang><zh-CN>检查前剥离说明性注释，保证边界说明本身不会误触发可执行代码禁令。</zh-CN><en>Strips explanatory comments before inspection so boundary explanations themselves cannot trigger executable-code prohibitions.</en></lang>
  const sources = await Promise.all(p55ComponentRecords.map((record) => readFile(resolve(componentPaths(record).source), 'utf8')));
  const styles = await Promise.all(p55ComponentRecords.map((record) => readFile(resolve(componentPaths(record).style), 'utf8')));
  const executable = [...sources, ...styles].join('\n').replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const forbidden = [
    /\bset(?:Timeout|Interval)\s*\(/,
    /\brequestAnimationFrame\s*\(/,
    /\b(?:fetch|uni\.request)\s*\(/,
    /\buni\.[A-Za-z]/,
    /\b(?:localStorage|sessionStorage)\s*\./,
    /\b(?:inject|provide)\s*\(/,
    /\b(?:navigator\.geolocation|getLocation)\b/,
    /\bconsole\s*\./,
    /<script[^>]+src=/i,
    /data:image\//i,
    /@font-face/i
  ];

  for (const pattern of forbidden) assert.doesNotMatch(executable, pattern);
  for (const [index, source] of sources.entries()) {
    // <lang><zh-CN>模块级和行内双语说明共同维持当前源码文档边界。</zh-CN><en>Module-level and inline bilingual explanations together retain the current source-documentation boundary.</en></lang>
    assert.match(source, /@lang zh-CN/, p55ComponentRecords[index].name);
    assert.match(source, /@lang en/, p55ComponentRecords[index].name);
    assert.match(source, /<lang><zh-CN>/, p55ComponentRecords[index].name);
  }
});

/**
 * @lang zh-CN 验证默认主题为本批 CSS 实际消费的全部 token 族提供权威初值。
 * @lang en Verifies that the default theme provides authoritative initial values for every token family actually consumed by this batch CSS.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects when an assertion fails.</en></lang>
 */
test('defines controlled component token families in the default theme', async () => {
  // <lang><zh-CN>逐族检查避免仅凭任意组件 token 存在而遗漏一项新增组件。</zh-CN><en>Checks every family, avoiding omission of a new component merely because some unrelated component token exists.</en></lang>
  const themeCss = await readFile(resolve('HIA-uView-UI/src/theme/hia-light.css'), 'utf8');
  for (const record of p55ComponentRecords) assert.match(themeCss, new RegExp(`${record.token}[^:]*:`));
});
