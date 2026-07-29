/**
 * @module hia-uview-feedback.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证 P14 的受控 modal、局部 notice 与静态空态行为。测试不启动 dev server、网络、计时器、全局 service、portal、原生 popup、焦点/滚动控制、Tool 或小程序导航；它不替代 UniApp compiler、真机、读屏、层叠或跨端证据。
 * @lang en Uses a real Vue runtime to verify P14 controlled modal, local notice, and static empty-state behavior. Tests start no dev server, network, timer, global service, portal, native popup, focus/scroll control, Tool, or mini-program navigation; they do not replace UniApp compiler, device, screen-reader, layering, or cross-platform evidence.
 */

// <lang><zh-CN>导入本地 Vue mount、Vitest 断言和本仓 runtime 组件；测试不安装全局 plugin、路由、Tool 或平台 mock。</zh-CN><en>Imports local Vue mount, Vitest assertions, and repository runtime components; the test installs no global plugin, router, Tool, or platform mock.</en></lang>
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { UEmpty, UModal, UNotice } from '../../HIA-uView-UI/src/index.mjs';

/**
 * @lang zh-CN 验证 UModal 只有调用方 visible 为真时呈现，并将 confirm/cancel 作为不写回状态的纯意图。
 * @lang en Verifies that UModal presents only while caller visible is true and treats confirm/cancel as pure intent that writes back no state.
 */
describe('UModal runtime behavior', () => {
  /**
   * @lang zh-CN 验证隐藏 modal 无输出，visible modal 展示调用方 title/slot/双文字 control，并各自 emit 一次意图。
   * @lang en Verifies that hidden modal has no output and visible modal shows caller title/slot/dual text controls and emits each intent once.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步 click 触发和 prop 更新完成后解决。</zh-CN><en>No return value; resolves after asynchronous click triggers and prop update complete.</en></lang>
   */
  it('keeps visibility and close decisions with the caller', async () => {
    // <lang><zh-CN>隐藏实例验证 visible 为假时组件不产生 panel 或 control。</zh-CN><en>The hidden instance verifies that the component produces no panel or control while visible is false.</en></lang>
    const hidden = mount(UModal, { props: { visible: false, confirmText: 'Confirm' } });

    expect(hidden.find('.u-modal').exists()).toBe(false);
    expect(hidden.emitted()).toEqual({});

    // <lang><zh-CN>可见实例提供调用方 title、slot 和两项文字 control；测试只观察 local click，不安装焦点或路由机制。</zh-CN><en>The visible instance supplies caller title, slot, and two text controls; the test observes local click only and installs no focus or routing mechanism.</en></lang>
    const modal = mount(UModal, {
      props: { visible: true, title: 'Caller modal', confirmText: 'Confirm', cancelText: 'Cancel' },
      slots: { default: 'Caller-owned modal content' }
    });

    const controls = modal.findAll('.u-button');

    await controls[0].trigger('click');
    await controls[1].trigger('click');

    expect(modal.text()).toContain('Caller modal');
    expect(modal.text()).toContain('Caller-owned modal content');
    expect(modal.emitted('cancel')).toHaveLength(1);
    expect(modal.emitted('confirm')).toHaveLength(1);

    // <lang><zh-CN>调用方更新 visible 后，modal 立即消失；组件本身没有在 click 后自动写回该 prop。</zh-CN><en>After caller updates visible, the modal disappears immediately; the component itself performed no automatic writeback after click.</en></lang>
    await modal.setProps({ visible: false });

    expect(modal.find('.u-modal').exists()).toBe(false);
  });
});

/**
 * @lang zh-CN 验证 UNotice 只在可见加非空消息时输出，将未知 tone 规范化为 info，并把 dismiss 保持为纯意图。
 * @lang en Verifies that UNotice outputs only with visible plus non-empty message, normalizes unknown tone to info, and retains dismiss as pure intent.
 */
describe('UNotice runtime behavior', () => {
  /**
   * @lang zh-CN 验证空消息抑制、未知 tone 回退和可选 dismiss control 的单次事件。
   * @lang en Verifies empty-message suppression, unknown-tone fallback, and one event from optional dismiss control.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步 click 触发和 prop 更新完成后解决。</zh-CN><en>No return value; resolves after asynchronous click trigger and prop updates complete.</en></lang>
   */
  it('renders caller feedback locally without timer or service behavior', async () => {
    // <lang><zh-CN>空消息实例即使 visible 为真也不输出，避免无文字符号被误认为完整 feedback。</zh-CN><en>The empty-message instance outputs nothing even while visible is true, avoiding a textless symbol being mistaken for complete feedback.</en></lang>
    const emptyMessage = mount(UNotice, { props: { visible: true, message: '' } });

    expect(emptyMessage.find('.u-notice').exists()).toBe(false);
    expect(emptyMessage.emitted()).toEqual({});

    // <lang><zh-CN>可见实例传入未知 tone，以验证仅在组件内规范化为 info，而不修改调用方 prop 或启动其他状态机。</zh-CN><en>The visible instance supplies unknown tone to verify normalization to info occurs only inside the component and mutates no caller prop or other state machine.</en></lang>
    const notice = mount(UNotice, {
      props: { visible: true, tone: 'unknown', message: 'Caller feedback', dismissText: 'Dismiss' }
    });

    await notice.get('.u-button').trigger('click');

    expect(notice.text()).toContain('Caller feedback');
    expect(notice.find('.u-notice').classes()).toContain('u-notice--info');
    expect(notice.emitted('dismiss')).toHaveLength(1);

    // <lang><zh-CN>应用改变 tone 后，notice 仅切换受限 error 呈现；测试不赋予它请求结果或自动消失含义。</zh-CN><en>After the application changes tone, the notice switches only to constrained error presentation; the test assigns it no request-result or automatic-disappearance meaning.</en></lang>
    await notice.setProps({ tone: 'error' });

    expect(notice.find('.u-notice').classes()).toContain('u-notice--error');
    expect(notice.emitted('dismiss')).toHaveLength(1);
  });
});

/**
 * @lang zh-CN 验证 UEmpty 只呈现调用方文字与可选 action，不读取数据、加载或分页状态。
 * @lang en Verifies that UEmpty presents only caller text and optional action and reads no data, loading, or paging state.
 */
describe('UEmpty runtime behavior', () => {
  /**
   * @lang zh-CN 验证有 action 文字时恰好 emit 一次，而缺失 action 文字时不存在 control 且零事件。
   * @lang en Verifies exactly one emit with action text and no control/zero events when action text is absent.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步 click 触发完成后解决。</zh-CN><en>No return value; resolves after asynchronous click trigger completes.</en></lang>
   */
  it('renders static caller empty state and delegates optional action', async () => {
    // <lang><zh-CN>有 action 的实例覆盖标题、说明和唯一允许的本地 action 意图。</zh-CN><en>The instance with action covers title, description, and the sole permitted local action intent.</en></lang>
    const actionable = mount(UEmpty, {
      props: { title: 'No local records', description: 'Caller-owned explanation', actionText: 'Record action' }
    });

    await actionable.get('.u-button').trigger('click');

    expect(actionable.text()).toContain('No local records');
    expect(actionable.text()).toContain('Caller-owned explanation');
    expect(actionable.emitted('action')).toHaveLength(1);

    // <lang><zh-CN>无 action 文字的实例仍可呈现空态文字，但不得创建无标签 control 或 emit 意图。</zh-CN><en>The instance without action text may still present empty-state text but must create no unlabeled control or emit intent.</en></lang>
    const displayOnly = mount(UEmpty, { props: { title: 'Display-only empty state' } });

    expect(displayOnly.find('.u-button').exists()).toBe(false);
    expect(displayOnly.emitted()).toEqual({});
  });
});
