/**
 * @module verify-component-name-matrix.test
 * @lang zh-CN 验证冻结的公开组件目录名称与本地 manifest、runtime registry、样式和公开契约保持一致；比较输入只含名称，不含上游源码、API 或行为断言。
 * @lang en Verifies that frozen public component-directory names remain aligned with the local manifest, runtime registry, styles, and public contracts; comparison input contains names only, not upstream source, API, or behavior assertions.
 */

import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

// <lang><zh-CN>这份有限名称矩阵来自已记录的 0.6.14 目录广度检查；它是离线回归输入，不读取网络，也不授权复制或推断上游实现。</zh-CN><en>This finite name matrix comes from the recorded 0.6.14 directory-breadth check; it is offline regression input, reads no network, and authorizes neither copying nor inference of upstream implementations.</en></lang>
const frozenUViewProComponentNames = Object.freeze([
  'u-action-sheet', 'u-action-sheet-item', 'u-alert-tips', 'u-avatar', 'u-avatar-cropper', 'u-back-top', 'u-badge', 'u-button', 'u-calendar', 'u-car-keyboard', 'u-card', 'u-cell-group', 'u-cell-item', 'u-checkbox', 'u-checkbox-group', 'u-circle-progress', 'u-city-select', 'u-col', 'u-collapse', 'u-collapse-item', 'u-column-notice', 'u-config-provider', 'u-count-down', 'u-count-to', 'u-divider', 'u-dropdown', 'u-dropdown-item', 'u-empty', 'u-fab', 'u-field', 'u-form', 'u-form-item', 'u-full-screen', 'u-gap', 'u-grid', 'u-grid-item', 'u-icon', 'u-image', 'u-index-anchor', 'u-index-list', 'u-input', 'u-keyboard', 'u-lazy-load', 'u-line', 'u-line-progress', 'u-link', 'u-loading', 'u-loading-popup', 'u-loadmore', 'u-mask', 'u-message-input', 'u-modal', 'u-navbar', 'u-no-network', 'u-notice-bar', 'u-number-box', 'u-number-keyboard', 'u-pagination', 'u-picker', 'u-popup', 'u-radio', 'u-radio-group', 'u-rate', 'u-read-more', 'u-root-portal', 'u-row', 'u-row-notice', 'u-safe-bottom', 'u-search', 'u-section', 'u-select', 'u-skeleton', 'u-slider', 'u-status-bar', 'u-step', 'u-steps', 'u-sticky', 'u-subsection', 'u-swipe-action', 'u-swiper', 'u-switch', 'u-tabbar', 'u-table', 'u-tabs', 'u-tabs-swiper', 'u-tag', 'u-td', 'u-text', 'u-textarea', 'u-th', 'u-time-line', 'u-time-line-item', 'u-toast', 'u-top-tips', 'u-tr', 'u-transition', 'u-upload', 'u-verification-code', 'u-waterfall'
]);

/**
 * @lang zh-CN 检查有限字符串列表是否按代码点稳定升序排列，避免名称输入或 manifest 的偶然重排掩盖差异。
 * @lang en Checks whether a finite string list is stably ascending by code point, preventing accidental reordering of the name input or manifest from masking a difference.
 * @param {string[]} values <lang><zh-CN>需要检查的有限名称。</zh-CN><en>Finite names to inspect.</en></lang>
 * @returns {boolean} <lang><zh-CN>列表升序且无重复时为真。</zh-CN><en>True when the list is ascending and has no duplicates.</en></lang>
 */
function isStrictlySorted(values) {
  // <lang><zh-CN>相邻字符串的严格比较同时锁定排序与唯一性，无需依赖运行时区域设置。</zh-CN><en>Strict comparison of adjacent strings locks both ordering and uniqueness without relying on runtime locale settings.</en></lang>
  return values.every((value, index) => index === 0 || values[index - 1] < value);
}

/**
 * @lang zh-CN 验证冻结名称的 99/99 广度以及每个当前 manifest 项的本地 consumer 表面对齐。
 * @lang en Verifies the 99/99 breadth of frozen names and local consumer-surface alignment for every current manifest item.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；任一不可达或不一致项将使测试失败。</zh-CN><en>No return value; any unreachable or inconsistent item fails the test.</en></lang>
 */
test('keeps the frozen component-name matrix and local consumer surfaces aligned', async () => {
  // <lang><zh-CN>读取本地、受版本控制的声明和 entry；测试不下载任何上游内容。</zh-CN><en>Reads local version-controlled declarations and entries; the test downloads no upstream content.</en></lang>
  const manifest = JSON.parse(await readFile(resolve('HIA-uView-UI/hia-uview.components.json'), 'utf8'));
  const runtimeEntry = await readFile(resolve('HIA-uView-UI/src/index.mjs'), 'utf8');
  const styleEntry = await readFile(resolve('HIA-uView-UI/src/style.css'), 'utf8');
  const manifestNames = manifest.components.map((component) => component.name);
  const manifestByName = new Map(manifest.components.map((component) => [component.name, component]));
  const missingFrozenNames = frozenUViewProComponentNames.filter((name) => !manifestByName.has(name));

  assert.equal(frozenUViewProComponentNames.length, 99);
  assert.ok(isStrictlySorted(frozenUViewProComponentNames));
  assert.ok(manifest.components.length >= frozenUViewProComponentNames.length);
  assert.ok(isStrictlySorted(manifestNames));
  assert.deepEqual(missingFrozenNames, []);

  for (const component of manifest.components) {
    // <lang><zh-CN>每个 manifest 项均须指向同名 Vue/CSS、公开契约、显式 plugin registry 和全局 style entry，不能只保留空目录或私有实现。</zh-CN><en>Every manifest item must point to same-named Vue/CSS, a public contract, an explicit plugin registry, and the global style entry; an empty directory or private-only implementation cannot substitute.</en></lang>
    const expectedSource = `src/components/${component.name}/${component.name}.vue`;
    const expectedStyle = `src/components/${component.name}/${component.name}.css`;
    assert.equal(component.source, expectedSource, component.name);
    assert.deepEqual(component.locales, ['zh-Hans', 'en'], component.name);
    assert.match(runtimeEntry, new RegExp(`Object\\.freeze\\(\\{ name: '${component.name}', component:`));
    assert.match(styleEntry, new RegExp(`@import [\"']\\./components/${component.name}/${component.name}\\.css[\"'];`));
    await access(resolve(`HIA-uView-UI/${expectedSource}`));
    await access(resolve(`HIA-uView-UI/${expectedStyle}`));
    await access(resolve(component.contract));
  }
});
