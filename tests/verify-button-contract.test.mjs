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
  // <lang><zh-CN>断言英文地区标签规范化为唯一 en 输出，避免 locale resolver 传播未审查的细分语言键。</zh-CN><en>Asserts that an English regional tag normalizes to the sole en output, preventing the locale resolver from propagating unreviewed granular language keys.</en></lang>
  assert.equal(normalizeButtonLocale('en-US'), 'en');

  // <lang><zh-CN>断言下划线中文输入归并到公开 zh-Hans，并让未知语言使用确定中文回退。</zh-CN><en>Asserts that underscore Chinese input resolves to public zh-Hans and an unknown language uses deterministic Chinese fallback.</en></lang>
  assert.equal(normalizeButtonLocale('zh_CN'), 'zh-Hans');
  assert.equal(normalizeButtonLocale('fr'), 'zh-Hans');

  // <lang><zh-CN>仅校验批准 loading key 的中英文固定文字；未知 key 必须返回空串而不是生成业务或回退文案。</zh-CN><en>Checks fixed Chinese/English copy only for the approved loading key; an unknown key must return an empty string rather than generating business or fallback copy.</en></lang>
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
  // <lang><zh-CN>只读读取固定的组件和样式路径；测试不编译、挂载或写回这两个文件。</zh-CN><en>Reads fixed component and style paths only; the test neither compiles, mounts, nor writes either file.</en></lang>
  const component = await readFile(resolve('HIA-uView-UI/src/components/u-button/u-button.vue'), 'utf8');
  const styles = await readFile(resolve('HIA-uView-UI/src/components/u-button/u-button.css'), 'utf8');

  // <lang><zh-CN>批准 prop 清单是有限公开契约；逐项断言防止任意业务、路由或样式 escape prop 静默出现。</zh-CN><en>The approved prop list is a finite public contract; assertion item by item prevents arbitrary business, route, or style-escape props from appearing silently.</en></lang>
  for (const property of ['variant', 'size', 'block', 'disabled', 'loading', 'loadingText', 'label']) {
    assert.match(component, new RegExp(`\\b${property}:`));
  }

  // <lang><zh-CN>剩余断言检查 click-only event、受控 inactive guard、native loading、locale key 与 token 化样式边界。</zh-CN><en>The remaining assertions check click-only event, controlled inactive guard, native loading, locale key, and tokenized style boundaries.</en></lang>
  assert.match(component, /defineEmits\(\['click'\]\)/);
  assert.match(component, /props\.disabled \|\| props\.loading/);
  assert.match(component, /if \(!isInactive\.value\)/);
  assert.match(component, /:loading="loading"/);
  assert.match(component, /resolveButtonMessage\('component\.button\.loading'\)/);
  assert.match(styles, /--u-comp-button-primary-background/);
  assert.match(styles, /--u-comp-button-min-height/);

  // <lang><zh-CN>拒绝 CSS 中直接 hex 色，确保可见颜色只能来自已审计 theme token 而非组件私有硬编码。</zh-CN><en>Rejects direct hexadecimal colors in CSS so visible color can come only from audited theme tokens rather than component-private hard coding.</en></lang>
  assert.doesNotMatch(styles, /#[0-9a-f]{3,8}\b/i);
});
