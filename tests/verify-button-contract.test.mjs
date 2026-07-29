import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { getButtonRuntimeLocale, normalizeButtonLocale, resolveButtonMessage } from '../HIA-uView-UI/src/localization/button-messages.mjs';

/**
 * @module verify-button-contract.test
 * @lang zh-CN 验证首个 UButton 独立实现仍符合已批准 API、受限 locale 和 token 边界；真实 Vue/UniApp 处理另由 mp-weixin fixture 验证。
 * @lang en Verifies that the first independent UButton implementation remains within the approved API, constrained locale, and token boundary; real Vue/UniApp handling is verified separately by the mp-weixin fixture.
 */

/**
 * @lang zh-CN 验证首轮 locale 解析仅返回受支持语言，并为未知运行时值保持确定的中文回退。
 * @lang en Verifies that first-slice locale resolution returns only supported languages and retains a deterministic Chinese fallback for unknown runtime values.
 */
test('resolves only the documented UButton loading locales', () => {
  assert.equal(normalizeButtonLocale('en-US'), 'en');
  assert.equal(normalizeButtonLocale('zh_CN'), 'zh-Hans');
  assert.equal(normalizeButtonLocale('fr'), 'zh-Hans');
  assert.equal(resolveButtonMessage('component.button.loading', 'zh-Hans'), '加载中…');
  assert.equal(resolveButtonMessage('component.button.loading', 'en'), 'Loading…');
  assert.equal(resolveButtonMessage('component.button.unknown', 'en'), '');
  assert.equal(getButtonRuntimeLocale(), 'zh-Hans');
});

/**
 * @lang zh-CN 验证组件只声明批准的 props、加载/禁用激活抑制和组件 token 消费，且样式不新增硬编码色值。
 * @lang en Verifies that the component declares only approved props, suppresses loading/disabled activation, and consumes component tokens without adding hard-coded color values in styles.
 */
test('keeps UButton inside its initial component contract', async () => {
  const component = await readFile(resolve('HIA-uView-UI/src/components/u-button/u-button.vue'), 'utf8');
  const styles = await readFile(resolve('HIA-uView-UI/src/components/u-button/u-button.css'), 'utf8');

  for (const property of ['variant', 'size', 'block', 'disabled', 'loading', 'loadingText', 'label']) {
    assert.match(component, new RegExp(`\\b${property}:`));
  }

  assert.match(component, /defineEmits\(\['click'\]\)/);
  assert.match(component, /props\.disabled \|\| props\.loading/);
  assert.match(component, /if \(!isInactive\.value\)/);
  assert.match(component, /:loading="loading"/);
  assert.match(component, /resolveButtonMessage\('component\.button\.loading'\)/);
  assert.match(styles, /--u-comp-button-primary-background/);
  assert.match(styles, /--u-comp-button-min-height/);
  assert.doesNotMatch(styles, /#[0-9a-f]{3,8}\b/i);
});
