/**
 * @module verify-p44-component-contract.test
 * @lang zh-CN 验证 P44 八项列表、滚动与信息承载组件的声明、双语契约、主题 token、平台/资产边界和静态受控行为。
 * @lang en Verifies declarations, bilingual contracts, theme tokens, platform/asset boundaries, and static controlled behavior for eight P44 list, scroll, and information-content components.
 */

import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

// <lang><zh-CN>用稳定名称记录八项组件的源码、样式、契约和 token 前缀，防止 manifest、runtime 与文档漂移。</zh-CN><en>Records stable source, style, contract, and token prefixes for eight components to prevent drift among manifest, runtime, and documentation.</en></lang>
const p44ComponentRecords = Object.freeze([
  Object.freeze({ name: 'u-collapse', source: 'HIA-uView-UI/src/components/u-collapse/u-collapse.vue', style: 'HIA-uView-UI/src/components/u-collapse/u-collapse.css', contract: 'docs/collapse.md', token: '--u-comp-collapse-' }),
  Object.freeze({ name: 'u-collapse-item', source: 'HIA-uView-UI/src/components/u-collapse-item/u-collapse-item.vue', style: 'HIA-uView-UI/src/components/u-collapse-item/u-collapse-item.css', contract: 'docs/collapse-item.md', token: '--u-comp-collapse-item-' }),
  Object.freeze({ name: 'u-list', source: 'HIA-uView-UI/src/components/u-list/u-list.vue', style: 'HIA-uView-UI/src/components/u-list/u-list.css', contract: 'docs/list.md', token: '--u-comp-list-' }),
  Object.freeze({ name: 'u-loadmore', source: 'HIA-uView-UI/src/components/u-loadmore/u-loadmore.vue', style: 'HIA-uView-UI/src/components/u-loadmore/u-loadmore.css', contract: 'docs/loadmore.md', token: '--u-comp-loadmore-' }),
  Object.freeze({ name: 'u-scroll-list', source: 'HIA-uView-UI/src/components/u-scroll-list/u-scroll-list.vue', style: 'HIA-uView-UI/src/components/u-scroll-list/u-scroll-list.css', contract: 'docs/scroll-list.md', token: '--u-comp-scroll-list-' }),
  Object.freeze({ name: 'u-skeleton', source: 'HIA-uView-UI/src/components/u-skeleton/u-skeleton.vue', style: 'HIA-uView-UI/src/components/u-skeleton/u-skeleton.css', contract: 'docs/skeleton.md', token: '--u-comp-skeleton-' }),
  Object.freeze({ name: 'u-sticky', source: 'HIA-uView-UI/src/components/u-sticky/u-sticky.vue', style: 'HIA-uView-UI/src/components/u-sticky/u-sticky.css', contract: 'docs/sticky.md', token: '--u-comp-sticky-' }),
  Object.freeze({ name: 'u-swiper', source: 'HIA-uView-UI/src/components/u-swiper/u-swiper.vue', style: 'HIA-uView-UI/src/components/u-swiper/u-swiper.css', contract: 'docs/swiper.md', token: '--u-comp-swiper-' })
]);

/**
 * @lang zh-CN 验证八项 P44 组件均进入 manifest、拥有源码/样式/契约和中英 locale。
 * @lang en Verifies that all eight P44 components enter the manifest and have source, style, contract, and bilingual locales.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps P44 component declarations aligned', async () => {
  const manifest = JSON.parse(await readFile(resolve('HIA-uView-UI/hia-uview.components.json'), 'utf8'));
  const manifestByName = new Map(manifest.components.map((component) => [component.name, component]));
  for (const componentRecord of p44ComponentRecords) {
    const manifestRecord = manifestByName.get(componentRecord.name);
    assert.ok(manifestRecord, `Manifest must declare ${componentRecord.name}.`);
    assert.equal(manifestRecord.source, componentRecord.source.replace('HIA-uView-UI/', ''));
    assert.equal(manifestRecord.contract, componentRecord.contract);
    assert.deepEqual(manifestRecord.locales, ['zh-Hans', 'en']);
    await access(resolve(componentRecord.source));
    await access(resolve(componentRecord.style));
    await access(resolve(componentRecord.contract));
  }
  // <lang><zh-CN>P44 仍验证自身八项声明；manifest 还包含后续 P48 十项组件。</zh-CN><en>P44 still verifies its eight declarations; the manifest also contains the ten components added in later P48 work.</en></lang>
  assert.equal(manifest.components.length, 55);
});

/**
 * @lang zh-CN 验证 P44 源码保持 caller-owned presentation 边界，不引入平台滚动、轮播、测量、观察器、请求、timer 或外部资产。
 * @lang en Verifies that P44 source retains caller-owned presentation boundaries without platform scrolling, carousel, measurement, observers, requests, timers, or external assets.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps P44 source inside list and content boundaries', async () => {
  const componentSources = await Promise.all(p44ComponentRecords.map((componentRecord) => readFile(resolve(componentRecord.source), 'utf8')));
  const styleSources = await Promise.all(p44ComponentRecords.map((componentRecord) => readFile(resolve(componentRecord.style), 'utf8')));
  const combinedSource = [...componentSources, ...styleSources].join('\n');
  // <lang><zh-CN>禁止模式只检查可执行/可消费文本，先移除双语注释中对被排除能力的说明，避免把边界披露误判为实现。</zh-CN><en>Forbidden patterns inspect executable/consumable text only; remove bilingual comments first so boundary disclosures are not mistaken for implementation.</en></lang>
  const executableSource = combinedSource
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  const forbiddenPatterns = [
    /\bset(?:Timeout|Interval)\s*\(/,
    /\brequestAnimationFrame\s*\(/,
    /\bfetch\s*\(/,
    /\buni\.[A-Za-z]/,
    /\b(?:localStorage|sessionStorage)\s*\./,
    /\bconsole\s*\./,
    /<swiper\b/i,
    /<scroll-view\b/i,
    /IntersectionObserver/i,
    /createSelectorQuery/i,
    /requireNativePlugin/i,
    /BindingX/i,
    /\.wxs\b/i,
    /\bautoplay\s*[:=]/i,
    /position\s*:\s*fixed/i,
    /@font-face/i,
    /\.(?:ttf|woff2?)\b/i,
    /\biconfont\b/i,
    /data:image\//i,
    /<script[^>]+src=/i
  ];
  for (const forbiddenPattern of forbiddenPatterns) {
    assert.doesNotMatch(executableSource, forbiddenPattern);
  }
  for (const [index, componentSource] of componentSources.entries()) {
    assert.match(componentSource, /@lang zh-CN/, p44ComponentRecords[index].name);
    assert.match(componentSource, /@lang en/, p44ComponentRecords[index].name);
    assert.match(componentSource, /<lang><zh-CN>/, p44ComponentRecords[index].name);
  }
  assert.match(componentSources[0], /COLLAPSE_CONTEXT/);
  assert.match(componentSources[1], /isOpen/);
  assert.match(componentSources[2], /safeItems/);
  assert.match(componentSources[3], /statusText/);
  assert.match(componentSources[4], /overflow/);
  assert.match(componentSources[5], /rowsArray/);
  assert.match(componentSources[6], /stickyStyle/);
  assert.match(componentSources[7], /currentSlide/);
});

/**
 * @lang zh-CN 验证默认主题声明了八项 P44 CSS 实际消费的 token 族。
 * @lang en Verifies that the default theme declares token families consumed by all eight P44 CSS implementations.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('defines P44 token families in the default theme', async () => {
  const themeCss = await readFile(resolve('HIA-uView-UI/src/theme/hia-light.css'), 'utf8');
  for (const componentRecord of p44ComponentRecords) {
    assert.match(themeCss, new RegExp(`${componentRecord.token}[^:]*:`));
  }
});
