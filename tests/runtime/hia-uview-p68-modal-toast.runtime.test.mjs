/**
 * @module hia-uview-p68-modal-toast.runtime.test
 * @lang zh-CN 使用真实 Vue mount 与 Vitest fake timers 验证 UModal、UToast 及显式 feedback scope 的受控优先级、事件顺序、命令式生命周期、宿主隔离与资源清理。本文件不启动网络、router、平台 API 或全局 service，也不把编译/runtime 证据冒充设备、读屏或跨端证据。
 * @lang en Uses real Vue mounts and Vitest fake timers to verify controlled precedence, event ordering, imperative lifecycle, host isolation, and resource cleanup for UModal, UToast, and explicit feedback scopes. This file starts no network, router, platform API, or global service and does not present compiler/runtime evidence as device, screen-reader, or cross-platform evidence.
 */

// <lang><zh-CN>导入真实 Vue 调度器、Vue Test Utils、Vitest 控制面、两个组件与显式 feedback runtime；测试不安装应用 plugin 或平台 mock。</zh-CN><en>Imports the real Vue scheduler, Vue Test Utils, Vitest controls, both components, and the explicit feedback runtime; tests install no application plugin or platform mock.</en></lang>
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createUFeedbackScope,
  useModal,
  useToast
} from '../../HIA-uView-UI/src/feedback-service-runtime.mjs';
import UModal from '../../HIA-uView-UI/src/components/u-modal/u-modal.vue';
import UToast from '../../HIA-uView-UI/src/components/u-toast/u-toast.vue';

/**
 * @lang zh-CN 每个测试后丢弃本用例创建的 timer 并恢复真实时钟，防止 timer generation 或卸载断言污染后续用例。
 * @lang en Discards timers created by each test and restores the real clock afterward so timer-generation and unmount assertions cannot contaminate later cases.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
afterEach(() => {
  // <lang><zh-CN>只清理 Vitest 当前拥有的 fake timer；在真实时钟模式调用同一 API 不执行应用行为。</zh-CN><en>Clears only fake timers currently owned by Vitest; invoking the same API under real-clock mode executes no application behavior.</en></lang>
  vi.clearAllTimers();
  vi.useRealTimers();
});

/**
 * @lang zh-CN 验证 UModal caller-controlled 内容、优先级、事件与局部 async-close 状态。
 * @lang en Verifies UModal caller-controlled content, precedence, events, and local async-close state.
 */
describe('UModal controlled runtime behavior', () => {
  /**
   * @lang zh-CN 验证显式 visible 优先于 modelValue，并分别覆盖 content fallback、default slot 与 confirm-button slot。
   * @lang en Verifies explicit visible precedence over modelValue and separately covers the content fallback, default slot, and confirm-button slot.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；prop 更新和 Vue flush 完成后解决。</zh-CN><en>No return value; resolves after prop updates and Vue flushing complete.</en></lang>
   */
  it('preserves controlled precedence and finite content/slot composition', async () => {
    // <lang><zh-CN>显式 false 必须压过 modelValue=true，避免迁移 alias 绕过调用方当前状态。</zh-CN><en>Explicit false must override modelValue=true so the migration alias cannot bypass current caller state.</en></lang>
    const slottedModal = mount(UModal, {
      props: {
        visible: false,
        modelValue: true,
        title: 'Controlled title',
        content: 'Fallback content',
        confirmText: ''
      },
      slots: {
        default: 'Caller default slot',
        'confirm-button': 'Caller confirm slot'
      }
    });
    expect(slottedModal.find('.u-modal').exists()).toBe(false);

    // <lang><zh-CN>移除显式 visible 后回退 modelValue；两个 slot 保留 caller ownership，content 仅作为无 default slot 时的 fallback。</zh-CN><en>Removing explicit visible falls back to modelValue; both slots retain caller ownership, while content is only a fallback without a default slot.</en></lang>
    await slottedModal.setProps({ visible: undefined });
    expect(slottedModal.get('.u-modal__title').text()).toBe('Controlled title');
    expect(slottedModal.get('.u-modal__content').text()).toBe('Caller default slot');
    expect(slottedModal.text()).toContain('Caller confirm slot');
    expect(slottedModal.text()).not.toContain('Fallback content');

    // <lang><zh-CN>独立无 slot 实例证明纯文字 content 可见，且空 action 名称不会创建无标签 control。</zh-CN><en>A separate slot-free instance proves plain content is visible and empty action names create no unlabeled control.</en></lang>
    const contentModal = mount(UModal, {
      props: { modelValue: true, content: 'Plain content fallback' }
    });
    expect(contentModal.get('.u-modal__content').text()).toBe('Plain content fallback');
    expect(contentModal.find('button.u-button').exists()).toBe(false);

    // <lang><zh-CN>显式卸载两个局部实例，确保本测试不保留 host 或 watcher。</zh-CN><en>Explicitly unmounts both local instances so this test retains no host or watcher.</en></lang>
    slottedModal.unmount();
    contentModal.unmount();
  });

  /**
   * @lang zh-CN 验证普通确认和取消均严格先请求 modelValue=false，再转发对应 raw click intent。
   * @lang en Verifies ordinary confirm and cancel both strictly request modelValue=false before forwarding their respective raw-click intent.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；两个按钮 click 完成后解决。</zh-CN><en>No return value; resolves after both button clicks complete.</en></lang>
   */
  it('orders controlled update before confirm and cancel exactly', async () => {
    // <lang><zh-CN>共享序列跨事件名记录真实监听器调用顺序，而不只比较各自 emitted 数组。</zh-CN><en>A shared sequence records actual listener order across event names rather than only comparing separate emitted arrays.</en></lang>
    const sequence = [];
    const modal = mount(UModal, {
      props: {
        modelValue: true,
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        'onUpdate:modelValue': (value) => sequence.push(['update:modelValue', value]),
        onConfirm: (event) => sequence.push(['confirm', event?.type]),
        onCancel: (event) => sequence.push(['cancel', event?.type])
      }
    });

    // <lang><zh-CN>操作行固定先渲染 cancel 再 confirm，因此按索引触发并验证每条路径的精确事件对。</zh-CN><en>The action row renders cancel before confirm, so index-based triggers verify the exact event pair for each path.</en></lang>
    const controls = modal.findAll('button.u-button');
    await controls[1].trigger('click');
    await controls[0].trigger('click');
    expect(sequence).toEqual([
      ['update:modelValue', false],
      ['confirm', 'click'],
      ['update:modelValue', false],
      ['cancel', 'click']
    ]);

    modal.unmount();
  });

  /**
   * @lang zh-CN 验证 asyncClose 只进入局部确认 loading，component ref clearLoading 只清呈现而不关闭或 emit。
   * @lang en Verifies asyncClose enters only local confirm loading and component-ref clearLoading clears presentation without closing or emitting.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；点击与响应式刷新完成后解决。</zh-CN><en>No return value; resolves after click and reactive flushing complete.</en></lang>
   */
  it('keeps async-close loading caller-controlled through exposed clearLoading', async () => {
    // <lang><zh-CN>仅确认 control 的实例使 loading 断言不依赖按钮顺序。</zh-CN><en>A confirm-only instance makes the loading assertion independent of button order.</en></lang>
    const modal = mount(UModal, {
      props: { modelValue: true, confirmText: 'Continue', asyncClose: true }
    });
    await modal.get('button.u-button').trigger('click');

    // <lang><zh-CN>asyncClose 不请求关闭，只报告一次 confirm 并把同一 control 标记为 loading/disabled。</zh-CN><en>AsyncClose does not request closure; it reports one confirm and marks the same control loading/disabled.</en></lang>
    expect(modal.emitted('update:modelValue')).toBeUndefined();
    expect(modal.emitted('confirm')).toHaveLength(1);
    expect(modal.get('button.u-button').classes()).toContain('u-button--loading');

    // <lang><zh-CN>公开 clearLoading 精确恢复 control，modal 仍可见且不会附加第二个事件。</zh-CN><en>Public clearLoading restores the control precisely; the modal remains visible and appends no second event.</en></lang>
    modal.vm.$.exposed.clearLoading();
    await nextTick();
    expect(modal.get('button.u-button').classes()).not.toContain('u-button--loading');
    expect(modal.find('.u-modal').exists()).toBe(true);
    expect(modal.emitted('confirm')).toHaveLength(1);

    modal.unmount();
  });

  /**
   * @lang zh-CN 验证同一显式 host 上临时 service session 不会清除受控 async-close loading；service 关闭后原状态精确恢复。
   * @lang en Verifies a temporary service session on the same explicit host does not clear controlled async-close loading; closing the service restores the exact prior state.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；受控点击、service show/close 与 Vue flush 完成后解决。</zh-CN><en>No return value; resolves after the controlled click, service show/close, and Vue flushes complete.</en></lang>
   */
  it('isolates controlled async loading from an overlapping service session', async () => {
    // <lang><zh-CN>同一实例同时作为 caller-controlled modal 与显式 scope host，以覆盖真实交叠边界。</zh-CN><en>The same instance acts as both a caller-controlled modal and explicit scope host to cover the real overlap boundary.</en></lang>
    const scope = createUFeedbackScope();
    const controller = useModal(scope);
    const modal = mount(UModal, {
      props: {
        modelValue: true,
        content: 'Controlled content',
        confirmText: 'Continue',
        asyncClose: true,
        serviceScope: scope,
        serviceHost: true
      }
    });

    // <lang><zh-CN>受控确认先进入局部 loading，且不结束 caller-owned 可见性。</zh-CN><en>Controlled confirmation first enters local loading without ending caller-owned visibility.</en></lang>
    await modal.get('button.u-button').trigger('click');
    expect(modal.get('button.u-button').classes()).toContain('u-button--loading');

    // <lang><zh-CN>Service display 暂时取得呈现优先级，不能写入受控 loading 状态。</zh-CN><en>The service display temporarily gains presentation precedence and cannot write controlled loading state.</en></lang>
    const serviceResult = controller.show('Temporary service content');
    expect(serviceResult).toEqual({ accepted: true, requestId: 1 });
    await nextTick();
    expect(modal.text()).toContain('Temporary service content');

    // <lang><zh-CN>精确关闭 service 后回退受控内容与原 loading；随后公开 clearLoading 仍只清受控 projection。</zh-CN><en>Precisely closing the service restores controlled copy and its prior loading; public clearLoading then clears only that controlled projection.</en></lang>
    expect(controller.close(serviceResult.requestId)).toEqual({ accepted: true, requestId: 1 });
    await nextTick();
    expect(modal.text()).toContain('Controlled content');
    expect(modal.get('button.u-button').classes()).toContain('u-button--loading');
    modal.vm.$.exposed.clearLoading();
    await nextTick();
    expect(modal.get('button.u-button').classes()).not.toContain('u-button--loading');

    // <lang><zh-CN>先卸载 host 再释放 scope，避免测试保留 registration。</zh-CN><en>Unmounts the host before disposing the scope so the test retains no registration.</en></lang>
    modal.unmount();
    scope.dispose();
  });

  /**
   * @lang zh-CN 验证 mask 取消追加受限 controlled/reason metadata，并让隐藏、未授权与无 control 路径保持零事件。
   * @lang en Verifies mask cancellation appends constrained controlled/reason metadata and keeps hidden, unauthorized, and control-less paths event-free.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；mask click 完成后解决。</zh-CN><en>No return value; resolves after mask clicks complete.</en></lang>
   */
  it('reports finite mask reason and guards every ineligible path', async () => {
    // <lang><zh-CN>授权实例用共享序列验证 update→cancel，以及 metadata 不泄漏 scope、host 或 options。</zh-CN><en>The authorized instance uses a shared sequence to verify update-to-cancel and metadata that leaks no scope, host, or options.</en></lang>
    const maskSequence = [];
    const maskModal = mount(UModal, {
      props: {
        modelValue: true,
        maskCloseAble: true,
        'onUpdate:modelValue': (value) => maskSequence.push(['update:modelValue', value]),
        onCancel: (event, metadata) => maskSequence.push(['cancel', event?.type, metadata])
      }
    });
    await maskModal.get('.u-modal__mask').trigger('click');
    expect(maskSequence).toEqual([
      ['update:modelValue', false],
      ['cancel', 'click', { source: 'controlled', reason: 'mask' }]
    ]);

    // <lang><zh-CN>默认不可关闭 mask 与显式隐藏实例均不得产生更新/取消；空标签同时保持零 action controls。</zh-CN><en>The default non-closable mask and explicitly hidden instance produce neither update nor cancel; empty labels also retain zero action controls.</en></lang>
    const guardedModal = mount(UModal, { props: { modelValue: true } });
    await guardedModal.get('.u-modal__mask').trigger('click');
    expect(guardedModal.emitted('update:modelValue')).toBeUndefined();
    expect(guardedModal.emitted('cancel')).toBeUndefined();
    expect(guardedModal.find('button.u-button').exists()).toBe(false);

    const hiddenModal = mount(UModal, {
      props: { visible: false, modelValue: true, maskCloseAble: true, confirmText: 'Hidden' }
    });
    expect(hiddenModal.find('.u-modal').exists()).toBe(false);
    expect(hiddenModal.emitted()).toEqual({});

    maskModal.unmount();
    guardedModal.unmount();
    hiddenModal.unmount();
  });
});

/**
 * @lang zh-CN 验证 UToast component-ref session、timer generation、关闭 metadata 与卸载清理。
 * @lang en Verifies UToast component-ref sessions, timer generations, close metadata, and unmount cleanup.
 */
describe('UToast component-ref runtime behavior', () => {
  /**
   * @lang zh-CN 验证 show 覆盖受控呈现，close/hide 清 session 后立即回退，并让非法空 message 成为安全 no-op。
   * @lang en Verifies show overrides controlled presentation, close/hide immediately fall back after clearing the session, and an invalid blank message is a safe no-op.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；每次命令后的 Vue flush 完成后解决。</zh-CN><en>No return value; resolves after Vue flushes following every command.</en></lang>
   */
  it('supports show, close, and hide with controlled fallback and invalid-input no-op', async () => {
    // <lang><zh-CN>受控 fallback 持续存在；命令式 session 只暂时取得呈现优先级。</zh-CN><en>The controlled fallback remains present; an imperative session only temporarily gains presentation precedence.</en></lang>
    const toast = mount(UToast, {
      props: { visible: true, message: 'Controlled fallback', tone: 'info' }
    });
    expect(Object.keys(toast.vm.$.exposed).sort()).toEqual(['close', 'hide', 'show']);
    toast.vm.$.exposed.show({ message: 'Imperative session', tone: 'success', duration: 0 });
    await nextTick();
    expect(toast.text()).toContain('Imperative session');
    expect(toast.get('.u-toast').classes()).toContain('u-toast--success');

    // <lang><zh-CN>空白 message 不替换当前合法 session，也不分配可观察的新呈现。</zh-CN><en>A blank message neither replaces the current valid session nor allocates an observable new presentation.</en></lang>
    toast.vm.$.exposed.show({ message: '   ', duration: 0 });
    await nextTick();
    expect(toast.text()).toContain('Imperative session');

    // <lang><zh-CN>close 清除命令 session 后恢复受控文字；重复 close 保持幂等且不 emit。</zh-CN><en>Close clears the command session and restores controlled copy; repeated close remains idempotent and emits nothing.</en></lang>
    toast.vm.$.exposed.close();
    toast.vm.$.exposed.close();
    await nextTick();
    expect(toast.text()).toContain('Controlled fallback');
    expect(toast.emitted()).toEqual({});

    // <lang><zh-CN>hide 是同一关闭语义：新 session 可见后被 hide 清除并再次回退。</zh-CN><en>Hide is the same close semantic: a new session becomes visible, is cleared by hide, and falls back again.</en></lang>
    toast.vm.$.exposed.show({ message: 'Hide session', duration: 0 });
    await nextTick();
    expect(toast.text()).toContain('Hide session');
    toast.vm.$.exposed.hide();
    await nextTick();
    expect(toast.text()).toContain('Controlled fallback');

    toast.unmount();
  });

  /**
   * @lang zh-CN 使用 fake timers 验证正 duration 自动结束，而 duration=0 永久等待显式关闭。
   * @lang en Uses fake timers to verify a positive duration ends automatically while duration=0 waits indefinitely for explicit closure.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；受控时间推进和 Vue flush 完成后解决。</zh-CN><en>No return value; resolves after controlled time advancement and Vue flushing complete.</en></lang>
   */
  it('honors positive duration and persistent zero duration exactly', async () => {
    vi.useFakeTimers();
    const toast = mount(UToast);

    // <lang><zh-CN>99ms 时仍可见，精确到 100ms 才清除 session，timer 自身不 emit close intent。</zh-CN><en>The session remains visible at 99ms and clears exactly at 100ms; the timer itself emits no close intent.</en></lang>
    toast.vm.$.exposed.show({ message: 'Timed session', duration: 100 });
    await nextTick();
    await vi.advanceTimersByTimeAsync(99);
    expect(toast.text()).toContain('Timed session');
    await vi.advanceTimersByTimeAsync(1);
    await nextTick();
    expect(toast.find('.u-toast').exists()).toBe(false);
    expect(toast.emitted('close')).toBeUndefined();

    // <lang><zh-CN>零 duration 在长时间推进后仍存在，只有显式 close 才结束。</zh-CN><en>A zero duration survives long time advancement and ends only through explicit close.</en></lang>
    toast.vm.$.exposed.show({ message: 'Persistent session', duration: 0 });
    await nextTick();
    await vi.advanceTimersByTimeAsync(60000);
    expect(toast.text()).toContain('Persistent session');
    toast.vm.$.exposed.close();
    await nextTick();
    expect(toast.find('.u-toast').exists()).toBe(false);

    toast.unmount();
  });

  /**
   * @lang zh-CN 验证 component-ref 省略 duration 时使用组件 prop 默认值，而显式 duration=0 仍优先并保持常驻。
   * @lang en Verifies component-ref input uses the component-prop duration when omitted, while explicit duration=0 still wins and persists.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；两段 fake-time 生命周期结束后解决。</zh-CN><en>No return value; resolves after both fake-time lifecycles complete.</en></lang>
   */
  it('uses the component duration only as an omitted component-ref default', async () => {
    vi.useFakeTimers();
    // <lang><zh-CN>Prop 默认 120ms 只作用于 component-ref 命令，不控制受控 visible。</zh-CN><en>The 120ms prop default applies only to component-ref commands and does not control caller-visible state.</en></lang>
    const toast = mount(UToast, { props: { duration: 120 } });
    toast.vm.$.exposed.show('Uses prop duration');
    await nextTick();
    await vi.advanceTimersByTimeAsync(119);
    expect(toast.text()).toContain('Uses prop duration');
    await vi.advanceTimersByTimeAsync(1);
    await nextTick();
    expect(toast.find('.u-toast').exists()).toBe(false);

    // <lang><zh-CN>显式零值压过 prop，长期推进后仍需调用 close 才结束。</zh-CN><en>An explicit zero overrides the prop and still requires close after long time advancement.</en></lang>
    toast.vm.$.exposed.show({ message: 'Explicit persistent duration', duration: 0 });
    await nextTick();
    await vi.advanceTimersByTimeAsync(1000);
    expect(toast.text()).toContain('Explicit persistent duration');
    toast.vm.$.exposed.close();
    await nextTick();
    expect(toast.find('.u-toast').exists()).toBe(false);

    // <lang><zh-CN>显式卸载确保 fake timer 句柄已清空。</zh-CN><en>Explicitly unmounts to ensure fake-timer handles are cleared.</en></lang>
    toast.unmount();
  });

  /**
   * @lang zh-CN 验证 service host 注销或换 scope 只释放 service ownership，不清除同实例的 component-ref session/timer。
   * @lang en Verifies unregistering a service host or changing its scope releases only service ownership and does not clear a component-ref session/timer on the same instance.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；两次 prop watcher 刷新后解决。</zh-CN><en>No return value; resolves after two prop-watcher flushes.</en></lang>
   */
  it('preserves a local component-ref session across service-host rewiring', async () => {
    // <lang><zh-CN>两个显式 scope 用于证明注销与重新注册边界；本地 ref session 不属于任一 scope。</zh-CN><en>Two explicit scopes prove unregister/re-register boundaries; the local ref session belongs to neither scope.</en></lang>
    const firstScope = createUFeedbackScope();
    const secondScope = createUFeedbackScope();
    const toast = mount(UToast, {
      props: { serviceScope: firstScope, serviceHost: true }
    });

    // <lang><zh-CN>本地 session 使用零 duration，host registration 只能旁路存在。</zh-CN><en>The local session uses zero duration, while the host registration may only coexist beside it.</en></lang>
    toast.vm.$.exposed.show({ message: 'Caller-owned local session', duration: 0 });
    await nextTick();
    expect(toast.text()).toContain('Caller-owned local session');

    // <lang><zh-CN>关闭 serviceHost 会调用旧 registration release，但不得终止本地 session。</zh-CN><en>Disabling serviceHost calls release on the old registration but must not end the local session.</en></lang>
    await toast.setProps({ serviceHost: false });
    expect(toast.text()).toContain('Caller-owned local session');

    // <lang><zh-CN>切换 scope 并重新 opt-in 同样只改变 host ownership；本地 session 继续可见直到 ref close。</zh-CN><en>Changing scope and opting in again likewise changes only host ownership; the local session remains visible until ref close.</en></lang>
    await toast.setProps({ serviceScope: secondScope, serviceHost: true });
    expect(toast.text()).toContain('Caller-owned local session');
    toast.vm.$.exposed.close();
    await nextTick();
    expect(toast.find('.u-toast').exists()).toBe(false);

    // <lang><zh-CN>卸载当前 host 后分别释放两个 scope，测试不保留 registry。</zh-CN><en>Unmounts the current host before disposing both scopes so the test retains no registry.</en></lang>
    toast.unmount();
    firstScope.dispose();
    secondScope.dispose();
  });

  /**
   * @lang zh-CN 验证替代 show 的 generation 使旧 timer 即使到达原截止点也不能关闭新 session。
   * @lang en Verifies replacement-show generation prevents an old timer from closing a newer session even at the old deadline.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；两个 timer 窗口推进完成后解决。</zh-CN><en>No return value; resolves after both timer windows advance.</en></lang>
   */
  it('prevents a replaced timer generation from closing the new session', async () => {
    vi.useFakeTimers();
    const toast = mount(UToast);

    // <lang><zh-CN>旧 session 运行 50ms 后由 200ms 新 session 整体替换。</zh-CN><en>The old session runs for 50ms before being wholly replaced by a new 200ms session.</en></lang>
    toast.vm.$.exposed.show({ message: 'Old generation', duration: 100 });
    await vi.advanceTimersByTimeAsync(50);
    toast.vm.$.exposed.show({ message: 'New generation', duration: 200 });
    await nextTick();

    // <lang><zh-CN>推进到旧截止点和新截止点前一毫秒都必须保留新 session。</zh-CN><en>Advancing to the old deadline and one millisecond before the new deadline must retain the new session.</en></lang>
    await vi.advanceTimersByTimeAsync(50);
    expect(toast.text()).toContain('New generation');
    await vi.advanceTimersByTimeAsync(149);
    expect(toast.text()).toContain('New generation');

    // <lang><zh-CN>只有新 generation 自己的最后 1ms 能结束呈现。</zh-CN><en>Only the final millisecond of the new generation may end presentation.</en></lang>
    await vi.advanceTimersByTimeAsync(1);
    await nextTick();
    expect(toast.find('.u-toast').exists()).toBe(false);

    toast.unmount();
  });

  /**
   * @lang zh-CN 验证文字关闭 control 先结束 component-ref session，再报告有限 source/request/reason metadata。
   * @lang en Verifies a text close control ends the component-ref session before reporting finite source/request/reason metadata.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；control click 完成后解决。</zh-CN><en>No return value; resolves after the control click completes.</en></lang>
   */
  it('reports finite control-close metadata without leaking session state', async () => {
    const toast = mount(UToast);
    toast.vm.$.exposed.show({ message: 'Closable session', closeText: 'Dismiss', duration: 0 });
    await nextTick();
    await toast.get('.u-toast__close').trigger('click');

    // <lang><zh-CN>根节点已移除，唯一 close payload 保留 raw event 与三个有限 metadata 字段。</zh-CN><en>The root has been removed, and the sole close payload retains the raw event plus three finite metadata fields.</en></lang>
    expect(toast.find('.u-toast').exists()).toBe(false);
    expect(toast.emitted('close')).toHaveLength(1);
    expect(toast.emitted('close')[0][0].type).toBe('click');
    expect(toast.emitted('close')[0][1]).toEqual({
      source: 'component-ref',
      requestId: 1,
      reason: 'control'
    });

    toast.unmount();
  });

  /**
   * @lang zh-CN 验证卸载主动清除正 duration timer，之后推进时钟保持静默且不产生 close 事件。
   * @lang en Verifies unmount actively clears a positive-duration timer so later clock advancement stays silent and emits no close event.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；卸载与 fake-time 推进完成后解决。</zh-CN><en>No return value; resolves after unmount and fake-time advancement complete.</en></lang>
   */
  it('silently clears its timer on unmount', async () => {
    vi.useFakeTimers();
    const toast = mount(UToast);
    toast.vm.$.exposed.show({ message: 'Unmounted session', duration: 500 });
    await nextTick();
    expect(vi.getTimerCount()).toBe(1);

    // <lang><zh-CN>卸载后 timer 计数归零；继续推进不会重新进入组件或伪造关闭意图。</zh-CN><en>Timer count reaches zero after unmount; further advancement neither re-enters the component nor fabricates a close intent.</en></lang>
    toast.unmount();
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(1000);
    expect(toast.emitted('close')).toBeUndefined();
  });
});

/**
 * @lang zh-CN 验证显式 feedback scope、UModal/UToast host、typed helper、替换、隔离及 dispose 生命周期。
 * @lang en Verifies explicit feedback scopes, UModal/UToast hosts, typed helpers, replacement, isolation, and disposal lifecycle.
 */
describe('explicit feedback-scope component integration', () => {
  /**
   * @lang zh-CN 验证没有显式宿主时 controller 返回稳定失败，且命令不缓存供未来 host 回放。
   * @lang en Verifies controllers return stable failure without an explicit host and commands are not cached for replay by a future host.
   */
  it('rejects missing hosts without allocating or replaying requests', async () => {
    const scope = createUFeedbackScope();
    const toastController = useToast(scope);
    const modalController = useModal(scope);

    // <lang><zh-CN>两个 kind 独立报告 host-unavailable，未分配 requestId。</zh-CN><en>Both kinds independently report host-unavailable without allocating a request ID.</en></lang>
    expect(toastController.show({ message: 'No toast host', duration: 0 })).toEqual({
      accepted: false,
      reason: 'host-unavailable'
    });
    expect(modalController.show('No modal host')).toEqual({
      accepted: false,
      reason: 'host-unavailable'
    });

    // <lang><zh-CN>后挂载 host 保持空白，证明失败命令没有被 scope 暗中排队。</zh-CN><en>A host mounted later remains blank, proving the failed command was not secretly queued by the scope.</en></lang>
    const toastHost = mount(UToast, { props: { serviceScope: scope, serviceHost: true } });
    const modalHost = mount(UModal, { props: { serviceScope: scope, serviceHost: true } });
    await nextTick();
    expect(toastHost.find('.u-toast').exists()).toBe(false);
    expect(modalHost.find('.u-modal').exists()).toBe(false);

    toastHost.unmount();
    modalHost.unmount();
    scope.dispose();
  });

  /**
   * @lang zh-CN 验证显式 UToast host 接收 typed success/loading helper，并保持 last-show-wins 与有限 loading 呈现。
   * @lang en Verifies an explicit UToast host accepts typed success/loading helpers while retaining last-show-wins and finite loading presentation.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；两个 service dispatch 的 Vue flush 完成后解决。</zh-CN><en>No return value; resolves after Vue flushes for both service dispatches.</en></lang>
   */
  it('routes typed toast helpers only to the opted-in host', async () => {
    const scope = createUFeedbackScope();
    const toastController = useToast(scope);
    const toastHost = mount(UToast, { props: { serviceScope: scope, serviceHost: true } });

    // <lang><zh-CN>success helper 固定覆盖合法 caller tone，并返回该 scope 的首个 request id。</zh-CN><en>The success helper deterministically overrides a valid caller tone and returns the scope's first request ID.</en></lang>
    const successResult = toastController.success({
      message: 'Saved locally',
      tone: 'info',
      duration: 0
    });
    await nextTick();
    expect(successResult).toEqual({ accepted: true, requestId: 1 });
    expect(toastHost.text()).toContain('Saved locally');
    expect(toastHost.get('.u-toast').classes()).toContain('u-toast--success');

    // <lang><zh-CN>loading helper 原子替换旧 session、分配下一编号，并在未给 duration 时保持常驻。</zh-CN><en>The loading helper atomically replaces the old session, allocates the next ID, and remains persistent when duration is absent.</en></lang>
    const loadingResult = toastController.loading('Waiting locally');
    await nextTick();
    expect(loadingResult).toEqual({ accepted: true, requestId: 2 });
    expect(toastHost.text()).toContain('Waiting locally');
    expect(toastHost.find('.u-loading').exists()).toBe(true);

    // <lang><zh-CN>精确编号 close 只结束当前 service request；它不 emit 组件 control close。</zh-CN><en>An exact-ID close ends only the current service request and emits no component-control close.</en></lang>
    expect(toastController.close(loadingResult.requestId)).toEqual({ accepted: true, requestId: 2 });
    await nextTick();
    expect(toastHost.find('.u-toast').exists()).toBe(false);
    expect(toastHost.emitted('close')).toBeUndefined();

    toastHost.unmount();
    scope.dispose();
  });

  /**
   * @lang zh-CN 验证 service async modal 的 confirm loading、controller clearLoading 与精确 close 全部绑定同一 request id。
   * @lang en Verifies service async-modal confirm loading, controller clearLoading, and exact close are all bound to one request ID.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；service 命令与 click 的响应式刷新完成后解决。</zh-CN><en>No return value; resolves after reactive flushing for service commands and the click.</en></lang>
   */
  it('controls async modal loading and close through one scoped request', async () => {
    const scope = createUFeedbackScope();
    const modalController = useModal(scope);
    const modalHost = mount(UModal, { props: { serviceScope: scope, serviceHost: true } });

    // <lang><zh-CN>confirm helper 只接受有限双 control 文字，并把首个 request 同步交给显式 host。</zh-CN><en>The confirm helper accepts only finite dual-control copy and synchronously gives the first request to the explicit host.</en></lang>
    const showResult = modalController.confirm({
      title: 'Confirm local action',
      content: 'No business callback is stored.',
      confirmText: 'Continue',
      cancelText: 'Cancel',
      asyncClose: true
    });
    await nextTick();
    expect(showResult).toEqual({ accepted: true, requestId: 1 });
    expect(modalHost.text()).toContain('No business callback is stored.');

    // <lang><zh-CN>service confirm 进入 loading、保持可见，并只 emit 不可执行 source/request metadata。</zh-CN><en>Service confirm enters loading, stays visible, and emits only non-executable source/request metadata.</en></lang>
    const controls = modalHost.findAll('button.u-button');
    await controls[1].trigger('click');
    expect(modalHost.get('button.u-button--loading').exists()).toBe(true);
    expect(modalHost.emitted('confirm')).toHaveLength(1);
    expect(modalHost.emitted('confirm')[0][1]).toEqual({ source: 'service', requestId: 1 });

    // <lang><zh-CN>clearLoading 不 settlement；同一 active id 随后仍可 close，关闭后显式旧 id 被稳定拒绝。</zh-CN><en>ClearLoading does not settle; the same active ID may then close, and the explicit old ID is stably rejected afterward.</en></lang>
    expect(modalController.clearLoading(showResult.requestId)).toEqual({ accepted: true, requestId: 1 });
    await nextTick();
    expect(modalHost.find('button.u-button--loading').exists()).toBe(false);
    expect(modalHost.find('.u-modal').exists()).toBe(true);
    expect(modalController.close(showResult.requestId)).toEqual({ accepted: true, requestId: 1 });
    await nextTick();
    expect(modalHost.find('.u-modal').exists()).toBe(false);
    expect(modalController.clearLoading(showResult.requestId)).toEqual({
      accepted: false,
      reason: 'stale-request'
    });

    modalHost.unmount();
    scope.dispose();
  });

  /**
   * @lang zh-CN 验证同 scope 后挂载 host 替换并释放旧 host，替代 host 卸载后不会隐式恢复旧实例。
   * @lang en Verifies a later host in the same scope replaces and releases the old host, and unmounting the replacement does not implicitly restore the old instance.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；两次挂载/派发/卸载刷新完成后解决。</zh-CN><en>No return value; resolves after flushing two mounts, dispatches, and unmount.</en></lang>
   */
  it('replaces and unmounts a host without restoring stale registrations', async () => {
    const scope = createUFeedbackScope();
    const toastController = useToast(scope);
    const firstHost = mount(UToast, { props: { serviceScope: scope, serviceHost: true } });
    expect(toastController.show({ message: 'First host session', duration: 0 })).toEqual({
      accepted: true,
      requestId: 1
    });
    await nextTick();
    expect(firstHost.text()).toContain('First host session');

    // <lang><zh-CN>后注册实例立即 release 旧 session；下一 request 只出现在替代 host。</zh-CN><en>The later registration immediately releases the old session; the next request appears only in the replacement host.</en></lang>
    const replacementHost = mount(UToast, { props: { serviceScope: scope, serviceHost: true } });
    await nextTick();
    expect(firstHost.find('.u-toast').exists()).toBe(false);
    expect(toastController.show({ message: 'Replacement session', duration: 0 })).toEqual({
      accepted: true,
      requestId: 2
    });
    await nextTick();
    expect(replacementHost.text()).toContain('Replacement session');
    expect(firstHost.find('.u-toast').exists()).toBe(false);

    // <lang><zh-CN>替代 host 卸载后 service 明确失败；旧 host 不作为隐式栈恢复。</zh-CN><en>After replacement-host unmount, the service fails explicitly; the old host is not restored as an implicit stack.</en></lang>
    replacementHost.unmount();
    expect(toastController.show({ message: 'No restored host', duration: 0 })).toEqual({
      accepted: false,
      reason: 'host-unavailable'
    });
    expect(firstHost.find('.u-toast').exists()).toBe(false);

    firstHost.unmount();
    scope.dispose();
  });

  /**
   * @lang zh-CN 验证两个显式 scope 的宿主、编号与关闭命令完全隔离。
   * @lang en Verifies hosts, request IDs, and close commands are fully isolated across two explicit scopes.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；独立派发和关闭刷新完成后解决。</zh-CN><en>No return value; resolves after independent dispatch and close flushing complete.</en></lang>
   */
  it('isolates host state and request sequences between scopes', async () => {
    const firstScope = createUFeedbackScope();
    const secondScope = createUFeedbackScope();
    const firstController = useToast(firstScope);
    const secondController = useToast(secondScope);
    const firstHost = mount(UToast, { props: { serviceScope: firstScope, serviceHost: true } });
    const secondHost = mount(UToast, { props: { serviceScope: secondScope, serviceHost: true } });

    // <lang><zh-CN>每个 scope 独立从 requestId=1 开始，文字只到达匹配 host。</zh-CN><en>Each scope independently starts at requestId=1, and copy reaches only the matching host.</en></lang>
    expect(firstController.info({ message: 'First scope', duration: 0 })).toEqual({ accepted: true, requestId: 1 });
    expect(secondController.warning({ message: 'Second scope', duration: 0 })).toEqual({ accepted: true, requestId: 1 });
    await nextTick();
    expect(firstHost.text()).toContain('First scope');
    expect(firstHost.text()).not.toContain('Second scope');
    expect(secondHost.text()).toContain('Second scope');
    expect(secondHost.text()).not.toContain('First scope');

    // <lang><zh-CN>关闭第一 scope 不触及第二 scope 的 active session。</zh-CN><en>Closing the first scope does not touch the active session in the second scope.</en></lang>
    expect(firstController.close(1)).toEqual({ accepted: true, requestId: 1 });
    await nextTick();
    expect(firstHost.find('.u-toast').exists()).toBe(false);
    expect(secondHost.text()).toContain('Second scope');

    firstHost.unmount();
    secondHost.unmount();
    firstScope.dispose();
    secondScope.dispose();
  });

  /**
   * @lang zh-CN 验证 scope dispose 同时静默释放 modal/toast host，永久拒绝后续 controller 操作且重复 dispose 幂等。
   * @lang en Verifies scope disposal silently releases modal and toast hosts together, permanently rejects later controller operations, and remains idempotent on repetition.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；释放后的 Vue flush 完成后解决。</zh-CN><en>No return value; resolves after Vue flush following release.</en></lang>
   */
  it('disposes all hosts permanently and silently', async () => {
    const scope = createUFeedbackScope();
    const toastController = useToast(scope);
    const modalController = useModal(scope);
    const toastHost = mount(UToast, { props: { serviceScope: scope, serviceHost: true } });
    const modalHost = mount(UModal, { props: { serviceScope: scope, serviceHost: true } });

    // <lang><zh-CN>同 scope 的单调序列跨 kind 分配 1/2，两个宿主各自呈现有限 session。</zh-CN><en>The same scope's monotonic sequence allocates 1/2 across kinds, while both hosts present their finite sessions independently.</en></lang>
    expect(toastController.show({ message: 'Active toast', duration: 0 })).toEqual({ accepted: true, requestId: 1 });
    expect(modalController.show({ content: 'Active modal' })).toEqual({ accepted: true, requestId: 2 });
    await nextTick();
    expect(toastHost.find('.u-toast').exists()).toBe(true);
    expect(modalHost.find('.u-modal').exists()).toBe(true);

    // <lang><zh-CN>dispose release 两个局部 session，不 emit control intent；重复调用保持无异常。</zh-CN><en>Dispose releases both local sessions without emitting control intent; repetition remains exception-free.</en></lang>
    scope.dispose();
    scope.dispose();
    await nextTick();
    expect(toastHost.find('.u-toast').exists()).toBe(false);
    expect(modalHost.find('.u-modal').exists()).toBe(false);
    expect(toastHost.emitted('close')).toBeUndefined();
    expect(modalHost.emitted('cancel')).toBeUndefined();

    // <lang><zh-CN>释放后的同一 identity 不可复活；show/close 都使用稳定 scope-disposed reason。</zh-CN><en>The disposed identity cannot be revived; both show and close use the stable scope-disposed reason.</en></lang>
    expect(toastController.show({ message: 'Rejected', duration: 0 })).toEqual({
      accepted: false,
      reason: 'scope-disposed'
    });
    expect(modalController.close()).toEqual({
      accepted: false,
      reason: 'scope-disposed'
    });

    // <lang><zh-CN>组件随后卸载只调用陈旧 token disposer，不产生异常或恢复 registration。</zh-CN><en>Subsequent component unmount invokes only stale-token disposers and neither throws nor restores registrations.</en></lang>
    toastHost.unmount();
    modalHost.unmount();
  });
});
