/**
 * @module verify-p49-component-contract.test
 * @lang zh-CN 验证 P49 十项复杂交互组件的 manifest、双语 ROP、主题 token、迁移边界和平台无关约束。
 * @lang en Verifies manifest, bilingual ROP, theme tokens, migration boundaries, and platform-neutral constraints for ten P49 complex-interaction components.
 */

import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

// <lang><zh-CN>记录十项 P49 组件的稳定路径和 token 前缀，防止声明、runtime、样式和文档漂移。</zh-CN><en>Records stable paths and token prefixes for ten P49 components to prevent drift among declarations, runtime, styles, and docs.</en></lang>
const p49ComponentRecords = Object.freeze([
  Object.freeze({ name: 'u-cell-group', source: 'HIA-uView-UI/src/components/u-cell-group/u-cell-group.vue', style: 'HIA-uView-UI/src/components/u-cell-group/u-cell-group.css', contract: 'docs/cell-group.md', token: '--u-comp-cell-group-' }),
  Object.freeze({ name: 'u-dropdown', source: 'HIA-uView-UI/src/components/u-dropdown/u-dropdown.vue', style: 'HIA-uView-UI/src/components/u-dropdown/u-dropdown.css', contract: 'docs/dropdown.md', token: '--u-comp-dropdown-' }),
  Object.freeze({ name: 'u-dropdown-item', source: 'HIA-uView-UI/src/components/u-dropdown-item/u-dropdown-item.vue', style: 'HIA-uView-UI/src/components/u-dropdown-item/u-dropdown-item.css', contract: 'docs/dropdown-item.md', token: '--u-comp-dropdown-item-' }),
  Object.freeze({ name: 'u-line', source: 'HIA-uView-UI/src/components/u-line/u-line.vue', style: 'HIA-uView-UI/src/components/u-line/u-line.css', contract: 'docs/line.md', token: '--u-comp-line-' }),
  Object.freeze({ name: 'u-read-more', source: 'HIA-uView-UI/src/components/u-read-more/u-read-more.vue', style: 'HIA-uView-UI/src/components/u-read-more/u-read-more.css', contract: 'docs/read-more.md', token: '--u-comp-read-more-' }),
  Object.freeze({ name: 'u-section', source: 'HIA-uView-UI/src/components/u-section/u-section.vue', style: 'HIA-uView-UI/src/components/u-section/u-section.css', contract: 'docs/section.md', token: '--u-comp-section-' }),
  Object.freeze({ name: 'u-select', source: 'HIA-uView-UI/src/components/u-select/u-select.vue', style: 'HIA-uView-UI/src/components/u-select/u-select.css', contract: 'docs/select.md', token: '--u-comp-select-' }),
  Object.freeze({ name: 'u-slider', source: 'HIA-uView-UI/src/components/u-slider/u-slider.vue', style: 'HIA-uView-UI/src/components/u-slider/u-slider.css', contract: 'docs/slider.md', token: '--u-comp-slider-' }),
  Object.freeze({ name: 'u-swipe-action', source: 'HIA-uView-UI/src/components/u-swipe-action/u-swipe-action.vue', style: 'HIA-uView-UI/src/components/u-swipe-action/u-swipe-action.css', contract: 'docs/swipe-action.md', token: '--u-comp-swipe-action-' }),
  Object.freeze({ name: 'u-text', source: 'HIA-uView-UI/src/components/u-text/u-text.vue', style: 'HIA-uView-UI/src/components/u-text/u-text.css', contract: 'docs/text.md', token: '--u-comp-text-' })
]);

/**
 * @lang zh-CN 验证 P49 组件进入 manifest，并拥有源码、样式、契约和双语 locale。
 * @lang en Verifies that P49 components enter the manifest and have source, style, contract, and bilingual locales.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps P49 component declarations aligned', async () => {
  const manifest = JSON.parse(await readFile(resolve('HIA-uView-UI/hia-uview.components.json'), 'utf8'));
  const manifestByName = new Map(manifest.components.map((component) => [component.name, component]));
  for (const componentRecord of p49ComponentRecords) {
    const manifestRecord = manifestByName.get(componentRecord.name);
    assert.ok(manifestRecord, `Manifest must declare ${componentRecord.name}.`);
    assert.equal(manifestRecord.source, componentRecord.source.replace('HIA-uView-UI/', ''));
    assert.equal(manifestRecord.contract, componentRecord.contract);
    assert.deepEqual(manifestRecord.locales, ['zh-Hans', 'en']);
    await access(resolve(componentRecord.source));
    await access(resolve(componentRecord.style));
    await access(resolve(componentRecord.contract));
  }
  assert.equal(manifest.components.length, 89);
});

/**
 * @lang zh-CN 验证 P49 源码不引入请求、路由、存储、定时器、观察器、动态脚本或原生插件。
 * @lang en Verifies that P49 source introduces no request, route, storage, timer, observer, dynamic script, or native plugin.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps P49 source inside controlled interaction boundaries', async () => {
  const sources = await Promise.all(p49ComponentRecords.map((record) => readFile(resolve(record.source), 'utf8')));
  const styles = await Promise.all(p49ComponentRecords.map((record) => readFile(resolve(record.style), 'utf8')));
  const combined = [...sources, ...styles].join('\n');
  // <lang><zh-CN>剥离注释后检查可执行文本，避免边界披露被误认为实现。</zh-CN><en>Checks executable text after removing comments so boundary disclosures are not mistaken for implementation.</en></lang>
  const executable = combined.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
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
    /position\s*:\s*fixed/i,
    /@font-face/i
  ];
  for (const pattern of forbidden) assert.doesNotMatch(executable, pattern);
  for (const [index, source] of sources.entries()) {
    assert.match(source, /@lang zh-CN/, p49ComponentRecords[index].name);
    assert.match(source, /@lang en/, p49ComponentRecords[index].name);
    assert.match(source, /<lang><zh-CN>/, p49ComponentRecords[index].name);
  }
  assert.match(sources[0], /u-cell-group/);
  assert.match(sources[1], /DROPDOWN_CONTEXT/);
  assert.match(sources[2], /handleClick/);
  assert.match(sources[3], /safeDirection/);
  assert.match(sources[4], /safeHeight/);
  assert.match(sources[5], /handleRightClick/);
  assert.match(sources[6], /safeOptions/);
  assert.match(sources[7], /safeValue/);
  assert.match(sources[8], /safeActions/);
  assert.match(sources[9], /safeLines/);
});

/**
 * @lang zh-CN 验证默认主题声明十项 P49 CSS 实际消费的 token 族。
 * @lang en Verifies that the default theme declares token families consumed by all ten P49 CSS implementations.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('defines P49 token families in the default theme', async () => {
  const themeCss = await readFile(resolve('HIA-uView-UI/src/theme/hia-light.css'), 'utf8');
  for (const record of p49ComponentRecords) assert.match(themeCss, new RegExp(`${record.token}[^:]*:`));
});
