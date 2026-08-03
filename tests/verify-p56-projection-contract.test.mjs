/**
 * @module verify-p56-projection-contract.test
 * @lang zh-CN 验证六项 caller-owned index、延迟图片、区段、静态 panel 与确定性列组件的声明、ROP、token 与严格降级边界；本测试不启动网络、dev server 或平台 API。
 * @lang en Verifies declarations, ROP, tokens, and strict-degradation boundaries for six caller-owned index, deferred-image, segment, static-panel, and deterministic-column components; this test starts no network, dev server, or platform API.
 */

import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

// <lang><zh-CN>逐项锁定稳定名称、导出、公开契约与 token 前缀，防止受控投影在清单、源码、样式和文档之间漂移。</zh-CN><en>Locks stable names, exports, public contracts, and token prefixes item by item, preventing controlled projections from drifting among manifest, source, styles, and documentation.</en></lang>
const projectionRecords = Object.freeze([
  Object.freeze({ name: 'u-index-anchor', exportName: 'UIndexAnchor', contract: 'docs/index-anchor.md', token: '--u-comp-index-anchor-' }),
  Object.freeze({ name: 'u-index-list', exportName: 'UIndexList', contract: 'docs/index-list.md', token: '--u-comp-index-list-' }),
  Object.freeze({ name: 'u-lazy-load', exportName: 'ULazyLoad', contract: 'docs/lazy-load.md', token: '--u-comp-lazy-load-' }),
  Object.freeze({ name: 'u-subsection', exportName: 'USubsection', contract: 'docs/subsection.md', token: '--u-comp-subsection-' }),
  Object.freeze({ name: 'u-tabs-swiper', exportName: 'UTabsSwiper', contract: 'docs/tabs-swiper.md', token: '--u-comp-tabs-swiper-' }),
  Object.freeze({ name: 'u-waterfall', exportName: 'UWaterfall', contract: 'docs/waterfall.md', token: '--u-comp-waterfall-' })
]);

/**
 * @lang zh-CN 解析锁定组件的同名源码和样式路径；名称只来自有限本地记录。
 * @lang en Resolves same-named source and style paths for a locked component; the name comes only from finite local records.
 * @param {{name: string}} record <lang><zh-CN>锁定组件记录。</zh-CN><en>Locked component record.</en></lang>
 * @returns {{source: string, style: string}} <lang><zh-CN>相对仓库根的源码与样式路径。</zh-CN><en>Source and style paths relative to repository root.</en></lang>
 */
function componentPaths(record) {
  // <lang><zh-CN>同名目录维持 manifest、源码与样式的一一对应。</zh-CN><en>The same-named directory retains one-to-one correspondence among manifest, source, and style.</en></lang>
  const componentRoot = `HIA-uView-UI/src/components/${record.name}`;
  return Object.freeze({ source: `${componentRoot}/${record.name}.vue`, style: `${componentRoot}/${record.name}.css` });
}

/**
 * @lang zh-CN 验证清单、公开文档、源码、样式和命名导出为六项组件给出一致入口。
 * @lang en Verifies that manifest, public documentation, source, styles, and named exports give six components aligned entry points.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps controlled projection declarations aligned', async () => {
  // <lang><zh-CN>以名称索引 manifest，避免断言依赖记录的偶然追加位置。</zh-CN><en>Indexes the manifest by name, avoiding assertions that depend on accidental append position.</en></lang>
  const manifest = JSON.parse(await readFile(resolve('HIA-uView-UI/hia-uview.components.json'), 'utf8'));
  const manifestByName = new Map(manifest.components.map((component) => [component.name, component]));
  const publicIndex = await readFile(resolve('HIA-uView-UI/src/index.mjs'), 'utf8');

  for (const record of projectionRecords) {
    // <lang><zh-CN>每项都需有双语清单、存在的公开文件与具名 export，且不以 alias 或私有文档替代实现。</zh-CN><en>Every item needs bilingual manifest data, existing public files, and a named export, with no alias or private document substituting for implementation.</en></lang>
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

  // <lang><zh-CN>本批至少要求其六项；后续受审阅组件可继续追加而不破坏当前契约。</zh-CN><en>This batch requires at least its six records; subsequently reviewed components may be added without breaking current contracts.</en></lang>
  assert.ok(manifest.components.length >= 103);
});

/**
 * @lang zh-CN 验证源码排除滚动/viewport、网络、storage、timer、原生 swiper、测量、Canvas、注入、WXS/BindingX 和动态资源，以保留 caller-owned 动态性。
 * @lang en Verifies source excludes scroll/viewport, network, storage, timer, native swiper, measurement, Canvas, injection, WXS/BindingX, and dynamic resources, retaining caller-owned dynamism.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps controlled projection components platform-neutral and deterministic', async () => {
  // <lang><zh-CN>先剥离注释再检查可执行内容，避免治理说明文字误触发可执行边界禁令。</zh-CN><en>Strips comments before inspecting executable content, preventing governance prose from triggering executable-boundary prohibitions.</en></lang>
  const sources = await Promise.all(projectionRecords.map((record) => readFile(resolve(componentPaths(record).source), 'utf8')));
  const styles = await Promise.all(projectionRecords.map((record) => readFile(resolve(componentPaths(record).style), 'utf8')));
  const executable = [...sources, ...styles].join('\n').replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const forbidden = [
    /\bset(?:Timeout|Interval)\s*\(/,
    /\brequestAnimationFrame\s*\(/,
    /\b(?:fetch|uni\.request)\s*\(/,
    /\buni\.[A-Za-z]/,
    /\b(?:localStorage|sessionStorage)\s*\./,
    /\b(?:IntersectionObserver|ResizeObserver)\b/,
    /\b(?:getBoundingClientRect|clientHeight|offsetHeight|scrollTo)\b/,
    /\b(?:CanvasRenderingContext2D|canvas)\b/,
    /\b(?:inject|provide)\s*\(/,
    /\b(?:WXS|BindingX)\b/,
    /<script[^>]+src=/i,
    /data:image\//i,
    /@font-face/i
  ];

  for (const pattern of forbidden) assert.doesNotMatch(executable, pattern);
  for (const [index, source] of sources.entries()) {
    // <lang><zh-CN>模块级与行内双语 ROP 注释共同保持源码可以按当前受限语义审阅。</zh-CN><en>Module-level and inline bilingual ROP comments together keep source reviewable under current constrained semantics.</en></lang>
    assert.match(source, /@lang zh-CN/, projectionRecords[index].name);
    assert.match(source, /@lang en/, projectionRecords[index].name);
    assert.match(source, /<lang><zh-CN>/, projectionRecords[index].name);
  }
});

/**
 * @lang zh-CN 验证默认主题为本批实际消费的六个 token 族提供权威初值。
 * @lang en Verifies that the default theme supplies authoritative initial values for all six token families consumed by this batch.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('defines controlled projection token families in the default theme', async () => {
  // <lang><zh-CN>逐族检查以防已有 token 意外掩盖某个新增组件漏掉主题初值。</zh-CN><en>Checks each family so existing tokens cannot accidentally mask a missing initial value for a new component.</en></lang>
  const themeCss = await readFile(resolve('HIA-uView-UI/src/theme/hia-light.css'), 'utf8');
  for (const record of projectionRecords) assert.match(themeCss, new RegExp(`${record.token}[^:]*:`));
});
