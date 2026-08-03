/**
 * @module verify-p55-keyboard-contract.test
 * @lang zh-CN 验证三项受控键盘的声明、双语 ROP、token 和无平台服务边界；本测试不启动网络、dev server、系统键盘或计时器。
 * @lang en Verifies declarations, bilingual ROP, tokens, and no-platform-service boundaries of the three controlled keyboards; this test starts no network, dev server, system keyboard, or timer.
 */

import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

// <lang><zh-CN>锁定三项键盘的稳定名称、命名导出、公开契约与 token 前缀。</zh-CN><en>Locks stable names, named exports, public contracts, and token prefixes of the three keyboards.</en></lang>
const keyboardRecords = Object.freeze([
  Object.freeze({ name: 'u-car-keyboard', exportName: 'UCarKeyboard', contract: 'docs/car-keyboard.md', token: '--u-comp-car-keyboard-' }),
  Object.freeze({ name: 'u-keyboard', exportName: 'UKeyboard', contract: 'docs/keyboard.md', token: '--u-comp-keyboard-' }),
  Object.freeze({ name: 'u-number-keyboard', exportName: 'UNumberKeyboard', contract: 'docs/number-keyboard.md', token: '--u-comp-number-keyboard-' })
]);

/**
 * @lang zh-CN 解析一个锁定键盘的同名源码和样式路径，不接受外部路径片段。
 * @lang en Resolves same-named source and style paths for one locked keyboard and accepts no external path fragment.
 * @param {{name: string}} record <lang><zh-CN>锁定键盘记录。</zh-CN><en>Locked keyboard record.</en></lang>
 * @returns {{source: string, style: string}} <lang><zh-CN>相对仓库根的源码和样式路径。</zh-CN><en>Source and style paths relative to repository root.</en></lang>
 */
function componentPaths(record) {
  // <lang><zh-CN>同名目录和文件与 manifest 组件边界一一对应。</zh-CN><en>Same-named directory and file correspond one-to-one with the manifest component boundary.</en></lang>
  const root = `HIA-uView-UI/src/components/${record.name}`;
  return Object.freeze({ source: `${root}/${record.name}.vue`, style: `${root}/${record.name}.css` });
}

/**
 * @lang zh-CN 验证 manifest、公开契约、源码、样式和 named export 对三项键盘保持一致。
 * @lang en Verifies that manifest, public contract, source, style, and named export stay aligned for the three keyboards.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects when an assertion fails.</en></lang>
 */
test('keeps controlled keyboard declarations aligned', async () => {
  // <lang><zh-CN>按稳定名称索引 manifest，避免追加顺序成为契约。</zh-CN><en>Indexes manifest by stable name, avoiding appended order becoming a contract.</en></lang>
  const manifest = JSON.parse(await readFile(resolve('HIA-uView-UI/hia-uview.components.json'), 'utf8'));
  const manifestByName = new Map(manifest.components.map((component) => [component.name, component]));
  const runtimeEntry = await readFile(resolve('HIA-uView-UI/src/index.mjs'), 'utf8');

  for (const record of keyboardRecords) {
    // <lang><zh-CN>每项公开入口都必须指向同名源码/契约，且 runtime entry 明确保留 named export。</zh-CN><en>Every public entry must point to same-named source/contract and the runtime entry must explicitly retain named export.</en></lang>
    const manifestRecord = manifestByName.get(record.name);
    const paths = componentPaths(record);
    assert.ok(manifestRecord, `Manifest must declare ${record.name}.`);
    assert.equal(manifestRecord.source, paths.source.replace('HIA-uView-UI/', ''));
    assert.equal(manifestRecord.contract, record.contract);
    assert.deepEqual(manifestRecord.locales, ['zh-Hans', 'en']);
    assert.match(runtimeEntry, new RegExp(`\\b${record.exportName}\\b`));
    await access(resolve(paths.source));
    await access(resolve(paths.style));
    await access(resolve(record.contract));
  }

  // <lang><zh-CN>本测试保持三项键盘契约；完整 manifest 可以包含后续受审阅组件。</zh-CN><en>This test retains three keyboard contracts; the complete manifest may contain subsequently reviewed components.</en></lang>
  assert.ok(manifest.components.length >= 89);
});

/**
 * @lang zh-CN 验证键盘源码不扩展为地区数据、随机化、长按、timer、平台键盘、焦点、请求或全局服务。
 * @lang en Verifies keyboard source does not expand into region data, randomization, long press, timer, platform keyboard, focus, request, or global service.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects when an assertion fails.</en></lang>
 */
test('keeps controlled keyboards finite and platform-neutral', async () => {
  // <lang><zh-CN>剥离注释后检查可执行源码，避免边界说明文本产生误报。</zh-CN><en>Checks executable source after stripping comments, avoiding false positives from boundary-explanation text.</en></lang>
  const sources = await Promise.all(keyboardRecords.map((record) => readFile(resolve(componentPaths(record).source), 'utf8')));
  const styles = await Promise.all(keyboardRecords.map((record) => readFile(resolve(componentPaths(record).style), 'utf8')));
  const executable = [...sources, ...styles].join('\n').replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const forbidden = [
    /\bset(?:Timeout|Interval)\s*\(/,
    /\brequestAnimationFrame\s*\(/,
    /\b(?:fetch|uni\.request)\s*\(/,
    /\buni\.[A-Za-z]/,
    /\b(?:localStorage|sessionStorage)\s*\./,
    /\b(?:inject|provide)\s*\(/,
    /\b(?:focus|blur)\s*\(/,
    /\bconsole\s*\./,
    /<script[^>]+src=/i,
    /data:image\//i,
    /@font-face/i
  ];
  for (const pattern of forbidden) assert.doesNotMatch(executable, pattern);
  for (const [index, source] of sources.entries()) {
    // <lang><zh-CN>每份键盘源码必须保留模块级与行内双语 ROP。</zh-CN><en>Every keyboard source must retain module-level and inline bilingual ROP.</en></lang>
    assert.match(source, /@lang zh-CN/, keyboardRecords[index].name);
    assert.match(source, /@lang en/, keyboardRecords[index].name);
    assert.match(source, /<lang><zh-CN>/, keyboardRecords[index].name);
  }
});

/**
 * @lang zh-CN 验证默认主题为三项键盘 CSS 消费的 token 族提供初值。
 * @lang en Verifies that the default theme provides initial values for token families consumed by the three keyboard CSS files.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects when an assertion fails.</en></lang>
 */
test('defines controlled keyboard token families in the default theme', async () => {
  // <lang><zh-CN>逐项检查 token 前缀，防止新键盘隐式依赖硬编码视觉值。</zh-CN><en>Checks token prefixes item by item, preventing new keyboards from implicitly depending on hard-coded visual values.</en></lang>
  const themeCss = await readFile(resolve('HIA-uView-UI/src/theme/hia-light.css'), 'utf8');
  for (const record of keyboardRecords) assert.match(themeCss, new RegExp(`${record.token}[^:]*:`));
});
