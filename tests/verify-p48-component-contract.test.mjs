/**
 * @module verify-p48-component-contract.test
 * @lang zh-CN 验证 P48 首批十项布局、容器、提示与选择组件的 manifest、双语契约、主题 token 和受控边界。
 * @lang en Verifies manifest, bilingual contracts, theme tokens, and controlled boundaries for the ten P48 layout, container, feedback, and selection components.
 */

import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

// <lang><zh-CN>记录 P48 每项组件的稳定路径与 token 前缀，防止 manifest、runtime、样式和文档漂移。</zh-CN><en>Records stable paths and token prefixes for every P48 component to prevent drift among manifest, runtime, styles, and docs.</en></lang>
const p48ComponentRecords = Object.freeze([
  Object.freeze({ name: 'u-alert-tips', source: 'HIA-uView-UI/src/components/u-alert-tips/u-alert-tips.vue', style: 'HIA-uView-UI/src/components/u-alert-tips/u-alert-tips.css', contract: 'docs/alert-tips.md', token: '--u-comp-alert-tips-' }),
  Object.freeze({ name: 'u-calendar', source: 'HIA-uView-UI/src/components/u-calendar/u-calendar.vue', style: 'HIA-uView-UI/src/components/u-calendar/u-calendar.css', contract: 'docs/calendar.md', token: '--u-comp-calendar-' }),
  Object.freeze({ name: 'u-card', source: 'HIA-uView-UI/src/components/u-card/u-card.vue', style: 'HIA-uView-UI/src/components/u-card/u-card.css', contract: 'docs/card.md', token: '--u-comp-card-' }),
  Object.freeze({ name: 'u-col', source: 'HIA-uView-UI/src/components/u-col/u-col.vue', style: 'HIA-uView-UI/src/components/u-col/u-col.css', contract: 'docs/col.md', token: '--u-comp-col-' }),
  Object.freeze({ name: 'u-gap', source: 'HIA-uView-UI/src/components/u-gap/u-gap.vue', style: 'HIA-uView-UI/src/components/u-gap/u-gap.css', contract: 'docs/gap.md', token: '--u-comp-gap-' }),
  Object.freeze({ name: 'u-grid', source: 'HIA-uView-UI/src/components/u-grid/u-grid.vue', style: 'HIA-uView-UI/src/components/u-grid/u-grid.css', contract: 'docs/grid.md', token: '--u-comp-grid-' }),
  Object.freeze({ name: 'u-grid-item', source: 'HIA-uView-UI/src/components/u-grid-item/u-grid-item.vue', style: 'HIA-uView-UI/src/components/u-grid-item/u-grid-item.css', contract: 'docs/grid-item.md', token: '--u-comp-grid-item-' }),
  Object.freeze({ name: 'u-link', source: 'HIA-uView-UI/src/components/u-link/u-link.vue', style: 'HIA-uView-UI/src/components/u-link/u-link.css', contract: 'docs/link.md', token: '--u-comp-link-' }),
  Object.freeze({ name: 'u-picker', source: 'HIA-uView-UI/src/components/u-picker/u-picker.vue', style: 'HIA-uView-UI/src/components/u-picker/u-picker.css', contract: 'docs/picker.md', token: '--u-comp-picker-' }),
  Object.freeze({ name: 'u-row', source: 'HIA-uView-UI/src/components/u-row/u-row.vue', style: 'HIA-uView-UI/src/components/u-row/u-row.css', contract: 'docs/row.md', token: '--u-comp-row-' })
]);

/**
 * @lang zh-CN 验证 P48 组件均进入 manifest，并拥有源码、样式、契约和双语 locale。
 * @lang en Verifies that every P48 component enters the manifest and has source, style, contract, and bilingual locales.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps P48 component declarations aligned', async () => {
  const manifest = JSON.parse(await readFile(resolve('HIA-uView-UI/hia-uview.components.json'), 'utf8'));
  const manifestByName = new Map(manifest.components.map((component) => [component.name, component]));
  for (const componentRecord of p48ComponentRecords) {
    const manifestRecord = manifestByName.get(componentRecord.name);
    assert.ok(manifestRecord, `Manifest must declare ${componentRecord.name}.`);
    assert.equal(manifestRecord.source, componentRecord.source.replace('HIA-uView-UI/', ''));
    assert.equal(manifestRecord.contract, componentRecord.contract);
    assert.deepEqual(manifestRecord.locales, ['zh-Hans', 'en']);
    await access(resolve(componentRecord.source));
    await access(resolve(componentRecord.style));
    await access(resolve(componentRecord.contract));
  }
  assert.equal(manifest.components.length, 83);
});

/**
 * @lang zh-CN 验证 P48 源码不引入请求、timer、平台查询、任意外部脚本、原生插件或动态导航。
 * @lang en Verifies that P48 source introduces no requests, timers, platform queries, arbitrary external scripts, native plugins, or dynamic navigation.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps P48 source inside controlled UI boundaries', async () => {
  const componentSources = await Promise.all(p48ComponentRecords.map((componentRecord) => readFile(resolve(componentRecord.source), 'utf8')));
  const styleSources = await Promise.all(p48ComponentRecords.map((componentRecord) => readFile(resolve(componentRecord.style), 'utf8')));
  const combinedSource = [...componentSources, ...styleSources].join('\n');
  // <lang><zh-CN>剥离注释后检查可执行文本，避免边界披露词被误判为实现。</zh-CN><en>Checks executable text after removing comments so boundary disclosures are not mistaken for implementation.</en></lang>
  const executableSource = combinedSource.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const forbiddenPatterns = [
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
    /position\s*:\s*fixed/i,
    /@font-face/i,
    /(?:ttf|woff2?)\b/i,
    /data:image\//i
  ];
  for (const forbiddenPattern of forbiddenPatterns) assert.doesNotMatch(executableSource, forbiddenPattern);
  for (const [index, componentSource] of componentSources.entries()) {
    assert.match(componentSource, /@lang zh-CN/, p48ComponentRecords[index].name);
    assert.match(componentSource, /@lang en/, p48ComponentRecords[index].name);
    assert.match(componentSource, /<lang><zh-CN>/, p48ComponentRecords[index].name);
  }
  assert.match(componentSources[0], /safeType/);
  assert.match(componentSources[1], /calendarCells/);
  assert.match(componentSources[2], /safePadding/);
  assert.match(componentSources[3], /safeSpan/);
  assert.match(componentSources[4], /safeHeight/);
  assert.match(componentSources[5], /GRID_CONTEXT/);
  assert.match(componentSources[6], /gridContext/);
  assert.match(componentSources[7], /handleClick/);
  assert.match(componentSources[8], /safeOptions/);
  assert.match(componentSources[9], /rowStyle/);
});

/**
 * @lang zh-CN 验证默认主题声明 P48 每项 CSS 实际消费的 token 族。
 * @lang en Verifies that the default theme declares token families consumed by every P48 CSS implementation.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('defines P48 token families in the default theme', async () => {
  const themeCss = await readFile(resolve('HIA-uView-UI/src/theme/hia-light.css'), 'utf8');
  for (const componentRecord of p48ComponentRecords) assert.match(themeCss, new RegExp(`${componentRecord.token}[^:]*:`));
});
