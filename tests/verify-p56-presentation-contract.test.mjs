/**
 * @module verify-p56-presentation-contract.test
 * @lang zh-CN 验证八项调用方受控的数值、公告、时间、局部全屏与时间线呈现组件拥有对齐声明、主题 token 与严格降级边界；本测试不启动网络、dev server 或平台 API。
 * @lang en Verifies that eight caller-controlled numeric, notice, time, local-fullscreen, and timeline presentation components retain aligned declarations, theme tokens, and strict-degradation boundaries; this test starts no network, dev server, or platform API.
 */

import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

// <lang><zh-CN>逐项锁定稳定名称、导出、公开契约与 token 前缀，防止受控呈现组件在清单、源码、样式和文档之间漂移。</zh-CN><en>Locks stable names, exports, public contracts, and token prefixes item by item, preventing controlled presentation components from drifting among manifest, source, styles, and documentation.</en></lang>
const presentationRecords = Object.freeze([
  Object.freeze({ name: 'u-circle-progress', exportName: 'UCircleProgress', contract: 'docs/circle-progress.md', token: '--u-comp-circle-progress-' }),
  Object.freeze({ name: 'u-column-notice', exportName: 'UColumnNotice', contract: 'docs/column-notice.md', token: '--u-comp-column-notice-' }),
  Object.freeze({ name: 'u-count-down', exportName: 'UCountDown', contract: 'docs/count-down.md', token: '--u-comp-count-down-' }),
  Object.freeze({ name: 'u-full-screen', exportName: 'UFullScreen', contract: 'docs/full-screen.md', token: '--u-comp-full-screen-' }),
  Object.freeze({ name: 'u-row-notice', exportName: 'URowNotice', contract: 'docs/row-notice.md', token: '--u-comp-row-notice-' }),
  Object.freeze({ name: 'u-step', exportName: 'UStep', contract: 'docs/step.md', token: '--u-comp-step-' }),
  Object.freeze({ name: 'u-time-line', exportName: 'UTimeLine', contract: 'docs/time-line.md', token: '--u-comp-time-line-' }),
  Object.freeze({ name: 'u-time-line-item', exportName: 'UTimeLineItem', contract: 'docs/time-line-item.md', token: '--u-comp-time-line-item-' })
]);

/**
 * @lang zh-CN 解析一个锁定组件的同名源码和样式路径；名称仅来自本测试的有限常量。
 * @lang en Resolves same-named source and style paths for one locked component; the name comes only from this test's finite constants.
 * @param {{name: string}} record <lang><zh-CN>锁定组件记录。</zh-CN><en>Locked component record.</en></lang>
 * @returns {{source: string, style: string}} <lang><zh-CN>相对仓库根的源码和样式路径。</zh-CN><en>Source and style paths relative to repository root.</en></lang>
 */
function componentPaths(record) {
  // <lang><zh-CN>同名目录保持清单声明、源码和样式的一一对应。</zh-CN><en>The same-named directory keeps the manifest declaration, source, and style in one-to-one correspondence.</en></lang>
  const componentRoot = `HIA-uView-UI/src/components/${record.name}`;
  return Object.freeze({ source: `${componentRoot}/${record.name}.vue`, style: `${componentRoot}/${record.name}.css` });
}

/**
 * @lang zh-CN 验证完整清单、公开文档、源码、样式和命名导出为八项呈现组件给出一致入口。
 * @lang en Verifies that the complete manifest, public documentation, source, styles, and named exports give eight presentation components aligned entry points.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps controlled presentation declarations aligned', async () => {
  // <lang><zh-CN>以名称索引清单，避免断言依赖新增记录的偶然位置。</zh-CN><en>Indexes the manifest by name, avoiding assertions that depend on an accidental position of new records.</en></lang>
  const manifest = JSON.parse(await readFile(resolve('HIA-uView-UI/hia-uview.components.json'), 'utf8'));
  const manifestByName = new Map(manifest.components.map((component) => [component.name, component]));
  const publicIndex = await readFile(resolve('HIA-uView-UI/src/index.mjs'), 'utf8');

  for (const record of presentationRecords) {
    // <lang><zh-CN>每项必须提供双语清单、存在的文件与命名导出，且不把组件文档藏在私有治理目录。</zh-CN><en>Every item must provide bilingual manifest data, existing files, and a named export without hiding its component document in a private governance directory.</en></lang>
    const manifestRecord = manifestByName.get(record.name);
    const paths = componentPaths(record);
    assert.ok(manifestRecord, `Manifest must declare ${record.name}.`);
    assert.equal(manifestRecord.source, paths.source.replace('HIA-uView-UI/', ''));
    assert.equal(manifestRecord.contract, record.contract);
    assert.deepEqual(manifestRecord.locales, ['zh-Hans', 'en']);
    assert.match(publicIndex, new RegExp(`\\b${record.exportName}\\b`));
    await access(resolve(paths.source));
    await access(resolve(paths.style));
    await access(resolve(record.contract));
  }

  // <lang><zh-CN>本批至少要求其八项记录；后续经审阅的组件可以继续追加而不破坏既有契约。</zh-CN><en>This batch requires at least its eight records; subsequently reviewed components may be added without breaking existing contracts.</en></lang>
  assert.ok(manifest.components.length >= 97);
});

/**
 * @lang zh-CN 验证源码排除时钟、网络、存储、原生全屏、观测器、布局测量、Canvas、注入和动态资源，使所有动态性保持 caller-owned。
 * @lang en Verifies that source excludes clocks, network, storage, native fullscreen, observers, layout measurement, Canvas, injection, and dynamic resources so all dynamism remains caller-owned.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps controlled presentation components data-agnostic and platform-neutral', async () => {
  // <lang><zh-CN>先移除双语说明，再检查可执行内容，避免边界说明文字本身误触发禁令。</zh-CN><en>Removes bilingual explanations before inspecting executable content, preventing boundary prose itself from triggering prohibitions.</en></lang>
  const sources = await Promise.all(presentationRecords.map((record) => readFile(resolve(componentPaths(record).source), 'utf8')));
  const styles = await Promise.all(presentationRecords.map((record) => readFile(resolve(componentPaths(record).style), 'utf8')));
  const executable = [...sources, ...styles].join('\n').replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const forbidden = [
    /\bset(?:Timeout|Interval)\s*\(/,
    /\brequestAnimationFrame\s*\(/,
    /\b(?:fetch|uni\.request)\s*\(/,
    /\buni\.[A-Za-z]/,
    /\b(?:localStorage|sessionStorage)\s*\./,
    /\brequestFullscreen\s*\(/,
    /\bIntersectionObserver\b/,
    /\b(?:getBoundingClientRect|clientHeight|offsetHeight)\b/,
    /\b(?:CanvasRenderingContext2D|canvas)\b/,
    /\b(?:inject|provide)\s*\(/,
    /<script[^>]+src=/i,
    /data:image\//i,
    /@font-face/i
  ];

  for (const pattern of forbidden) assert.doesNotMatch(executable, pattern);
  for (const [index, source] of sources.entries()) {
    // <lang><zh-CN>模块级和行内 ROP 双语注释共同保持当前源码的可审阅边界。</zh-CN><en>Module-level and inline ROP bilingual comments together retain the reviewable boundary of current source.</en></lang>
    assert.match(source, /@lang zh-CN/, presentationRecords[index].name);
    assert.match(source, /@lang en/, presentationRecords[index].name);
    assert.match(source, /<lang><zh-CN>/, presentationRecords[index].name);
  }
});

/**
 * @lang zh-CN 验证默认主题为本批实际消费的八个 token 族提供权威初值。
 * @lang en Verifies that the default theme supplies authoritative initial values for all eight token families consumed by this batch.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('defines controlled presentation token families in the default theme', async () => {
  // <lang><zh-CN>逐族检查，防止已有 token 意外掩盖新增组件缺少主题初值。</zh-CN><en>Checks every family, preventing existing tokens from accidentally masking a missing initial value for a new component.</en></lang>
  const themeCss = await readFile(resolve('HIA-uView-UI/src/theme/hia-light.css'), 'utf8');
  for (const record of presentationRecords) assert.match(themeCss, new RegExp(`${record.token}[^:]*:`));
});
