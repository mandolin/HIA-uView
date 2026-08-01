/**
 * @module verify-p42-component-contract.test
 * @lang zh-CN 验证 P42 八项展示组件的声明、双语契约、主题 token、资产边界和静态受控行为；静态证据不替代 Vue runtime、UniApp compiler、DevTools、真机、读屏或 WCAG 认证。
 * @lang en Verifies declarations, bilingual contracts, theme tokens, asset boundaries, and static controlled behavior for the eight P42 display components; static evidence does not replace Vue runtime, UniApp compiler, DevTools, devices, screen readers, or WCAG certification.
 */

// <lang><zh-CN>导入本地断言、文件读取、路径解析和 Node 测试入口；测试不访问网络、存储、子进程或仓库外部输入。</zh-CN><en>Imports local assertions, file reading, path resolution, and the Node test entry; the test accesses no network, storage, child process, or repository-external input.</en></lang>
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

// <lang><zh-CN>用稳定名称记录八项组件的源码、样式、契约和 token 前缀，避免 manifest、runtime 与文档漂移。</zh-CN><en>Records source, style, contract, and token prefixes for eight stable components to prevent drift among manifest, runtime, and documentation.</en></lang>
const p42ComponentRecords = Object.freeze([
  Object.freeze({ name: 'u-icon', source: 'HIA-uView-UI/src/components/u-icon/u-icon.vue', style: 'HIA-uView-UI/src/components/u-icon/u-icon.css', contract: 'docs/icon.md', token: '--u-comp-icon-' }),
  Object.freeze({ name: 'u-image', source: 'HIA-uView-UI/src/components/u-image/u-image.vue', style: 'HIA-uView-UI/src/components/u-image/u-image.css', contract: 'docs/image.md', token: '--u-comp-image-' }),
  Object.freeze({ name: 'u-avatar', source: 'HIA-uView-UI/src/components/u-avatar/u-avatar.vue', style: 'HIA-uView-UI/src/components/u-avatar/u-avatar.css', contract: 'docs/avatar.md', token: '--u-comp-avatar-' }),
  Object.freeze({ name: 'u-tag', source: 'HIA-uView-UI/src/components/u-tag/u-tag.vue', style: 'HIA-uView-UI/src/components/u-tag/u-tag.css', contract: 'docs/tag.md', token: '--u-comp-tag-' }),
  Object.freeze({ name: 'u-badge', source: 'HIA-uView-UI/src/components/u-badge/u-badge.vue', style: 'HIA-uView-UI/src/components/u-badge/u-badge.css', contract: 'docs/badge.md', token: '--u-comp-badge-' }),
  Object.freeze({ name: 'u-divider', source: 'HIA-uView-UI/src/components/u-divider/u-divider.vue', style: 'HIA-uView-UI/src/components/u-divider/u-divider.css', contract: 'docs/divider.md', token: '--u-comp-divider-' }),
  Object.freeze({ name: 'u-count-to', source: 'HIA-uView-UI/src/components/u-count-to/u-count-to.vue', style: 'HIA-uView-UI/src/components/u-count-to/u-count-to.css', contract: 'docs/count-to.md', token: '--u-comp-count-to-' }),
  Object.freeze({ name: 'u-line-progress', source: 'HIA-uView-UI/src/components/u-line-progress/u-line-progress.vue', style: 'HIA-uView-UI/src/components/u-line-progress/u-line-progress.css', contract: 'docs/line-progress.md', token: '--u-comp-line-progress-' })
]);

/**
 * @lang zh-CN 验证八项 P42 组件均进入 manifest、拥有源码/样式/契约和中英 locale。
 * @lang en Verifies that all eight P42 components enter the manifest and have source, style, contract, and bilingual locales.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps P42 component declarations aligned', async () => {
  // <lang><zh-CN>manifest 只服务开发期声明一致性，不承担动态加载或 runtime registry 职责。</zh-CN><en>The manifest serves declaration consistency only and owns no dynamic loading or runtime-registry responsibility.</en></lang>
  const manifest = JSON.parse(await readFile(resolve('HIA-uView-UI/hia-uview.components.json'), 'utf8'));
  const manifestByName = new Map(manifest.components.map((component) => [component.name, component]));
  for (const componentRecord of p42ComponentRecords) {
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
 * @lang zh-CN 验证 P42 源码保持受控展示、明确 fallback 和本地 intent 边界，不引入计时器、请求、存储、路由或外部资产机制。
 * @lang en Verifies that P42 source retains controlled presentation, explicit fallback, and local-intent boundaries without timers, requests, storage, routing, or external-asset mechanisms.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps P42 source inside display and asset boundaries', async () => {
  const componentSources = await Promise.all(p42ComponentRecords.map((componentRecord) => readFile(resolve(componentRecord.source), 'utf8')));
  const styleSources = await Promise.all(p42ComponentRecords.map((componentRecord) => readFile(resolve(componentRecord.style), 'utf8')));
  const combinedSource = [...componentSources, ...styleSources].join('\n');
  const forbiddenPatterns = [
    /\bset(?:Timeout|Interval)\s*\(/,
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
  for (const [index, componentSource] of componentSources.entries()) {
    // <lang><zh-CN>每个新增 Vue 源文件都必须同时含 JSDoc 双语节点和 inline lang 普通注释。</zh-CN><en>Every new Vue source must contain bilingual JSDoc nodes and inline lang ordinary comments.</en></lang>
    assert.match(componentSource, /@lang zh-CN/, p42ComponentRecords[index].name);
    assert.match(componentSource, /@lang en/, p42ComponentRecords[index].name);
    assert.match(componentSource, /<lang><zh-CN>/, p42ComponentRecords[index].name);
  }
  assert.match(componentSources[0], /displaySymbol/);
  assert.match(componentSources[1], /@error="handleError"/);
  assert.match(componentSources[2], /displayText/);
  assert.match(componentSources[3], /defineEmits\(\['click', 'close'\]\)/);
  assert.match(componentSources[6], /toFixed/);
  assert.match(componentSources[7], /Math\.min\(100/);
});

/**
 * @lang zh-CN 验证默认主题声明了八项 P42 CSS 实际消费的 token 族。
 * @lang en Verifies that the default theme declares the token families consumed by all eight P42 CSS implementations.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('defines P42 token families in the default theme', async () => {
  const themeCss = await readFile(resolve('HIA-uView-UI/src/theme/hia-light.css'), 'utf8');
  for (const componentRecord of p42ComponentRecords) {
    assert.match(themeCss, new RegExp(`${componentRecord.token}[^:]*:`));
  }
});
