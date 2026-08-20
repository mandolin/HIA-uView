/**
 * @module verify-p43-component-contract.test
 * @lang zh-CN 验证 P43 八项浮层、反馈与导航组件的声明、双语契约、主题 token、平台/资产边界和静态受控行为。
 * @lang en Verifies declarations, bilingual contracts, theme tokens, platform/asset boundaries, and static controlled behavior for eight P43 overlay, feedback, and navigation components.
 */

import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

// <lang><zh-CN>用稳定名称记录八项组件的源码、样式、契约和 token 前缀，防止 manifest、runtime 与文档漂移。</zh-CN><en>Records stable source, style, contract, and token prefixes for eight components to prevent drift among manifest, runtime, and documentation.</en></lang>
const p43ComponentRecords = Object.freeze([
  Object.freeze({ name: 'u-action-sheet', source: 'HIA-uView-UI/src/components/u-action-sheet/u-action-sheet.vue', style: 'HIA-uView-UI/src/components/u-action-sheet/u-action-sheet.css', contract: 'docs/action-sheet.md', token: '--u-comp-action-sheet-' }),
  Object.freeze({ name: 'u-loading-page', source: 'HIA-uView-UI/src/components/u-loading-page/u-loading-page.vue', style: 'HIA-uView-UI/src/components/u-loading-page/u-loading-page.css', contract: 'docs/loading-page.md', token: '--u-comp-loading-page-' }),
  Object.freeze({ name: 'u-pagination', source: 'HIA-uView-UI/src/components/u-pagination/u-pagination.vue', style: 'HIA-uView-UI/src/components/u-pagination/u-pagination.css', contract: 'docs/pagination.md', token: '--u-comp-pagination-' }),
  Object.freeze({ name: 'u-popup', source: 'HIA-uView-UI/src/components/u-popup/u-popup.vue', style: 'HIA-uView-UI/src/components/u-popup/u-popup.css', contract: 'docs/popup.md', token: '--u-comp-popup-' }),
  Object.freeze({ name: 'u-steps', source: 'HIA-uView-UI/src/components/u-steps/u-steps.vue', style: 'HIA-uView-UI/src/components/u-steps/u-steps.css', contract: 'docs/steps.md', token: '--u-comp-steps-' }),
  Object.freeze({ name: 'u-tabbar', source: 'HIA-uView-UI/src/components/u-tabbar/u-tabbar.vue', style: 'HIA-uView-UI/src/components/u-tabbar/u-tabbar.css', contract: 'docs/tabbar.md', token: '--u-comp-tabbar-' }),
  Object.freeze({ name: 'u-tabs', source: 'HIA-uView-UI/src/components/u-tabs/u-tabs.vue', style: 'HIA-uView-UI/src/components/u-tabs/u-tabs.css', contract: 'docs/tabs.md', token: '--u-comp-tabs-' }),
  Object.freeze({ name: 'u-toast', source: 'HIA-uView-UI/src/components/u-toast/u-toast.vue', style: 'HIA-uView-UI/src/components/u-toast/u-toast.css', contract: 'docs/toast.md', token: '--u-comp-toast-' })
]);

/**
 * @lang zh-CN 验证八项 P43 组件均进入 manifest、拥有源码/样式/契约和中英 locale。
 * @lang en Verifies that all eight P43 components enter the manifest and have source, style, contract, and bilingual locales.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps P43 component declarations aligned', async () => {
  const manifest = JSON.parse(await readFile(resolve('HIA-uView-UI/hia-uview.components.json'), 'utf8'));
  const manifestByName = new Map(manifest.components.map((component) => [component.name, component]));
  for (const componentRecord of p43ComponentRecords) {
    const manifestRecord = manifestByName.get(componentRecord.name);
    assert.ok(manifestRecord, `Manifest must declare ${componentRecord.name}.`);
    assert.equal(manifestRecord.source, componentRecord.source.replace('HIA-uView-UI/', ''));
    assert.equal(manifestRecord.contract, componentRecord.contract);
    assert.deepEqual(manifestRecord.locales, ['zh-Hans', 'en']);
    await access(resolve(componentRecord.source));
    await access(resolve(componentRecord.style));
    await access(resolve(componentRecord.contract));
  }
});

/**
 * @lang zh-CN 验证 P43 源码保持受控 presentation/local intent 边界，不引入 timer、请求、存储、路由、全局 service 或外部资产。
 * @lang en Verifies that P43 source retains controlled presentation/local-intent boundaries without timers, requests, storage, routing, global services, or external assets.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps P43 source inside overlay and navigation boundaries', async () => {
  const componentSources = await Promise.all(p43ComponentRecords.map((componentRecord) => readFile(resolve(componentRecord.source), 'utf8')));
  const styleSources = await Promise.all(p43ComponentRecords.map((componentRecord) => readFile(resolve(componentRecord.style), 'utf8')));
  const combinedSource = [...componentSources, ...styleSources].join('\n');
  const forbiddenPatterns = [
    /\brequestAnimationFrame\s*\(/,
    /\bfetch\s*\(/,
    /\buni\.[A-Za-z]/,
    /\b(?:localStorage|sessionStorage)\s*\./,
    /\bconsole\s*\./,
    /@font-face/i,
    /\.(?:ttf|woff2?)\b/i,
    /\biconfont\b/i,
    /data:image\//i,
    /<script[^>]+src=/i
  ];
  for (const forbiddenPattern of forbiddenPatterns) {
    assert.doesNotMatch(combinedSource, forbiddenPattern);
  }
  // <lang><zh-CN>P68 只允许 toast 使用一个实例局部 auto-close timer；其余七组件仍不得取得 timer，toast 也不得使用 interval。</zh-CN><en>P68 permits only toast to use one instance-local auto-close timer; the other seven components still acquire no timer, and toast may not use an interval.</en></lang>
  const toastSourceIndex = p43ComponentRecords.findIndex((componentRecord) => componentRecord.name === 'u-toast');
  // <lang><zh-CN>从稳定组件记录定位 toast，避免依赖数组尾部这一偶然位置。</zh-CN><en>Locates toast from the stable component record rather than relying on its accidental position at the array tail.</en></lang>
  assert.notEqual(toastSourceIndex, -1);
  // <lang><zh-CN>非 toast 源码继续保持无 JavaScript timer；该检查不把 CSS transition 当作计时器。</zh-CN><en>Non-toast sources remain free of JavaScript timers; this check does not mistake CSS transitions for timers.</en></lang>
  const nonToastSources = componentSources.filter((_, index) => index !== toastSourceIndex).join('\n');
  assert.doesNotMatch(nonToastSources, /\bset(?:Timeout|Interval)\s*\(/);
  // <lang><zh-CN>toast 的有限 timeout 是 last-show-wins 生命周期的一部分，但不得升级为持续 interval。</zh-CN><en>Toast's finite timeout is part of last-show-wins lifecycle but must not expand into a persistent interval.</en></lang>
  assert.match(componentSources[toastSourceIndex], /activeTimer = setTimeout\(\(\) =>/);
  assert.doesNotMatch(componentSources[toastSourceIndex], /\bsetInterval\s*\(/);
  for (const [index, componentSource] of componentSources.entries()) {
    assert.match(componentSource, /@lang zh-CN/, p43ComponentRecords[index].name);
    assert.match(componentSource, /@lang en/, p43ComponentRecords[index].name);
    assert.match(componentSource, /<lang><zh-CN>/, p43ComponentRecords[index].name);
  }
  assert.match(componentSources[0], /safeItems/);
  // <lang><zh-CN>Action sheet 的禁用/首项 selected 必须使用显式状态类，同时保留原生 disabled 和 button aria-pressed；不得退回 aria-selected 或微信 WXSS 不支持的 attribute selector。</zh-CN><en>Action-sheet disabled/first-selected presentation must use explicit state classes while retaining native disabled and button aria-pressed; it must regress to neither aria-selected nor the attribute selector rejected by WeChat WXSS.</en></lang>
  assert.match(componentSources[0], /'u-action-sheet__item--disabled': item\.disabled/u);
  assert.match(componentSources[0], /'u-action-sheet__item--selected': item\.selected/u);
  assert.match(componentSources[0], /:disabled="item\.disabled"/u);
  assert.match(componentSources[0], /:aria-pressed="item\.selected"/u);
  assert.doesNotMatch(componentSources[0], /aria-selected/u);
  assert.match(componentSources[0], /class="u-action-sheet__selected-check" aria-hidden="true">✓<\/text>/u);
  assert.match(componentSources[0], /item\.selected && selectedText/u);
  assert.match(componentSources[0], /<scroll-view class="u-action-sheet__options" scroll-y>/u);
  assert.match(styleSources[0], /\.u-action-sheet__item--disabled\s*\{/u);
  assert.match(styleSources[0], /\.u-action-sheet__item--selected\s*\{/u);
  assert.match(styleSources[0], /\.u-action-sheet__selected-check\s*\{/u);
  assert.match(styleSources[0], /\.u-action-sheet__selected-text\s*\{/u);
  assert.match(styleSources[0], /font-family:\s*inherit/u);
  assert.match(styleSources[0], /env\(safe-area-inset-bottom\)/u);
  assert.match(styleSources[0], /overflow-y:\s*auto/u);
  assert.doesNotMatch(styleSources[0], /\.u-action-sheet__item\s*\[disabled\]/u);
  assert.match(componentSources[1], /u-loading-page__indicator/);
  assert.match(componentSources[2], /Array\.from/);
  assert.match(componentSources[3], /maskClosable/);
  assert.match(componentSources[4], /safeSteps/);
  // <lang><zh-CN>纵向步骤连接线必须脱离横向 flex 主轴，防止 1px 连接线回归为占满正文宽度的色块。</zh-CN><en>The vertical steps connector must leave the horizontal flex axis, preventing the 1px connector from regressing into a block that fills content width.</en></lang>
  assert.match(styleSources[4], /\.u-steps--vertical \.u-steps__line \{[^}]*position:\s*absolute;[^}]*flex:\s*none;/s);
  assert.match(componentSources[5], /modelValue/);
  assert.match(componentSources[6], /role="tablist"/);
  assert.match(componentSources[7], /isVisible/);
});

/**
 * @lang zh-CN 验证默认主题声明了八项 P43 CSS 实际消费的 token 族。
 * @lang en Verifies that the default theme declares token families consumed by all eight P43 CSS implementations.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('defines P43 token families in the default theme', async () => {
  const themeCss = await readFile(resolve('HIA-uView-UI/src/theme/hia-light.css'), 'utf8');
  for (const componentRecord of p43ComponentRecords) {
    assert.match(themeCss, new RegExp(`${componentRecord.token}[^:]*:`));
  }
  // <lang><zh-CN>Action sheet 使用 modal 同类层但不得越过更高 feedback/portal scale；内建 option token 与独立 UActionSheetItem token 必须保持不同命名。</zh-CN><en>The action sheet uses the modal-class layer without crossing the higher feedback/portal scale; built-in option tokens must remain distinctly named from standalone UActionSheetItem tokens.</en></lang>
  assert.match(themeCss, /--u-comp-action-sheet-z-index:\s*1000;/u);
  assert.match(themeCss, /--u-comp-action-sheet-option-min-height:\s*52px;/u);
  assert.match(themeCss, /--u-comp-action-sheet-max-height:\s*75vh;/u);
  assert.match(themeCss, /--u-comp-action-sheet-selected-surface:/u);
});
