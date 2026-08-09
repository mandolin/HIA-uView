/**
 * @module hia-uview-p61-display.runtime.test
 * @lang zh-CN 用真实 Vue/jsdom 验证有限 tag/alert 展示迁移行为：双可见性只控制局部投影、数字文字保持可见、disabled 阻止 intent、alert close 不自动改状态。测试不启动网络、路由、存储、全局 service、平台 API 或业务流程。
 * @lang en Uses real Vue/jsdom to verify bounded tag/alert display migration behavior: dual visibility controls only local projection, numeric text remains visible, disabled blocks intent, and alert close changes no state automatically. The test starts no network, routing, storage, global service, platform API, or business flow.
 */

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { UAlertTips, UTag } from '../../HIA-uView-UI/src/index.mjs';

/** @lang zh-CN 验证 tokenized tag 的可见性收敛、数字文字和 disabled 局部 guard。 @lang en Verifies tokenized-tag visibility convergence, numeric text, and disabled local guard. */
describe('bounded display migration runtime behavior', () => {
  /** @lang zh-CN 验证 tag 由 show/visible 共同控制投影，且数字零不会被当作空文字丢弃。 @lang en Verifies that tag projection is jointly controlled by show/visible and numeric zero is not lost as empty text. @returns {Promise<void>} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang> */
  it('converges tag show and visible without losing numeric text', async () => {
    // <lang><zh-CN>初始 tag 同时开启两种可见性输入，文字使用零以覆盖 falsy 数字边界。</zh-CN><en>The initial tag enables both visibility inputs and uses zero text to cover the falsy-numeric boundary.</en></lang>
    const wrapper = mount(UTag, { props: { text: 0, show: true, visible: true } });

    // <lang><zh-CN>可见状态下根和数字零均必须存在；此断言不涉及主题、布局或无障碍平台认证。</zh-CN><en>Both root and numeric zero must exist while visible; this assertion covers no theme, layout, or accessibility-platform certification.</en></lang>
    expect(wrapper.find('.u-tag').exists()).toBe(true);
    expect(wrapper.text()).toContain('0');

    // <lang><zh-CN>描边 appearance 只增加受控根类，并保留同一有限 tone、文字和事件边界。</zh-CN><en>Outline appearance only adds the controlled root class while retaining the same finite tone, copy, and event boundary.</en></lang>
    await wrapper.setProps({ appearance: 'outline' });
    expect(wrapper.get('.u-tag').classes()).toContain('u-tag--outline');

    // <lang><zh-CN>show=false 只移除本地投影，组件不写入 visible 或调用方状态。</zh-CN><en>show=false removes only local projection; the component writes neither visible nor caller state.</en></lang>
    await wrapper.setProps({ show: false });
    expect(wrapper.find('.u-tag').exists()).toBe(false);

    // <lang><zh-CN>恢复 show 后再关闭既有 visible，验证两个输入均为隐藏 guard 而不存在隐式优先级覆盖。</zh-CN><en>After restoring show, disable existing visible to verify both inputs are hide guards with no implicit precedence override.</en></lang>
    await wrapper.setProps({ show: true, visible: false });
    expect(wrapper.find('.u-tag').exists()).toBe(false);
  });

  /** @lang zh-CN 验证非空字符串 disabled 同时阻止 click 与 close intent。 @lang en Verifies that nonempty-string disabled blocks both click and close intent. @returns {Promise<void>} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang> */
  it('keeps tag disabled as a local intent guard', async () => {
    // <lang><zh-CN>使用 closable tag 与上游允许的字符串 disabled，测试不挂载授权、表单或业务状态。</zh-CN><en>Uses a closable tag with upstream-allowed string disabled and mounts no authorization, form, or business state.</en></lang>
    const wrapper = mount(UTag, { props: { closable: true, disabled: 'disabled' } });

    // <lang><zh-CN>直接触发根与 close control 后仍必须保持零 emit，避免只依赖原生按钮 disabled 属性。</zh-CN><en>After direct triggering of root and close control, emitted events must remain empty, avoiding reliance only on the native button disabled attribute.</en></lang>
    await wrapper.find('.u-tag').trigger('click');
    await wrapper.find('.u-tag__close').trigger('click');
    expect(wrapper.emitted()).toEqual({});
  });

  /** @lang zh-CN 验证 alert show 只控制局部投影，close 只报告 intent 而不自行关闭。 @lang en Verifies that alert show controls only local projection and close reports intent without self-closing. @returns {Promise<void>} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang> */
  it('keeps alert visibility and close state caller-controlled', async () => {
    // <lang><zh-CN>初始关闭 alert，说明显示状态由调用方 prop 而非 service/timer 决定。</zh-CN><en>The alert begins hidden, showing that display state is determined by a caller prop rather than service/timer.</en></lang>
    const wrapper = mount(UAlertTips, { props: { show: false, closable: true, title: 'Local alert' } });

    expect(wrapper.find('.u-alert-tips').exists()).toBe(false);

    // <lang><zh-CN>调用方将 show 设为 true 后，组件才投影本地提示条。</zh-CN><en>Only after the caller sets show to true does the component project the local alert strip.</en></lang>
    await wrapper.setProps({ show: true });
    expect(wrapper.find('.u-alert-tips').exists()).toBe(true);

    // <lang><zh-CN>点击 close 后只报告 intent，未写回 show，因此提示条保持存在直到调用方更新 prop。</zh-CN><en>After clicking close, only intent is reported and show is not written back, so the alert remains until the caller updates the prop.</en></lang>
    await wrapper.find('.u-alert-tips__close').trigger('click');
    expect(wrapper.emitted('close')).toEqual([[]]);
    expect(wrapper.find('.u-alert-tips').exists()).toBe(true);
  });
});
