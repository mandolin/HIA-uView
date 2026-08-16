/**
 * @module hia-uview-p69-action-content.runtime.test
 * @lang zh-CN 使用真实 Vue/jsdom 验证操作与内容组件的受控运行时合同：slot/fallback/loading 互斥、原始 click identity、禁用零事件、调用方拥有的可见性，以及 close 与根 click 隔离。测试不启动网络、路由、存储、平台服务或业务流程。
 * @lang en Uses real Vue/jsdom to verify controlled runtime contracts for action and content components: mutually exclusive slot/fallback/loading content, raw click identity, disabled zero-event behavior, caller-owned visibility, and isolation between close and root click. The test starts no network, routing, storage, platform service, or business flow.
 */

import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { describe, expect, it } from 'vitest';
import { UAlertTips, UButton, UIcon, UTag, UText } from '../../HIA-uView-UI/src/index.mjs';

/**
 * @lang zh-CN 在指定元素上分派一个可冒泡的原始 click，并等待 Vue 完成同步事件后的响应式刷新；返回同一事件实例供 identity 断言使用。
 * @lang en Dispatches one bubbling raw click on the specified element and waits for Vue's reactive flush after the synchronous event; returns the same event instance for identity assertions.
 * @param {Element} element <lang><zh-CN>接收本地 click 的已挂载 DOM 元素。</zh-CN><en>Mounted DOM element that receives the local click.</en></lang>
 * @returns {Promise<MouseEvent>} <lang><zh-CN>分派给元素的同一 MouseEvent 实例。</zh-CN><en>The same MouseEvent instance dispatched to the element.</en></lang>
 */
async function dispatchRawClick(element) {
  // <lang><zh-CN>显式创建可冒泡事件，以同时覆盖组件 handler 和父级传播边界；测试不附加业务 payload。</zh-CN><en>Explicitly creates a bubbling event to cover both component handlers and parent propagation boundaries; the test attaches no business payload.</en></lang>
  const event = new MouseEvent('click', { bubbles: true });

  // <lang><zh-CN>直接通过 DOM 分派保留对象 identity，避免测试工具重新创建或包装事件。</zh-CN><en>Direct DOM dispatch preserves object identity and avoids the test utility recreating or wrapping the event.</en></lang>
  element.dispatchEvent(event);

  // <lang><zh-CN>等待一次 Vue 刷新，使事件导致的 emit 与条件投影在断言前稳定可见。</zh-CN><en>Waits for one Vue flush so emits and conditional projections caused by the event are stably observable before assertions.</en></lang>
  await nextTick();

  // <lang><zh-CN>返回原事件，调用方可证明组件没有替换、克隆或解释 click。</zh-CN><en>Returns the original event so callers can prove the component neither replaces, clones, nor interprets the click.</en></lang>
  return event;
}

/** @lang zh-CN 验证 button、icon、text、tag 与 alert 的有限操作/内容运行时边界。 @lang en Verifies bounded action/content runtime boundaries for button, icon, text, tag, and alert. */
describe('P69 controlled action and content runtime contracts', () => {
  /** @lang zh-CN 验证按钮默认 slot 优先于文字 fallback，且 loading 文案独占内容区。 @lang en Verifies that the button default slot takes precedence over copy fallback and loading copy exclusively owns the content area. @returns {Promise<void>} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang> */
  it('keeps button slot, fallback, and loading content mutually exclusive', async () => {
    // <lang><zh-CN>fallback 实例同时提供 label/text，以验证既有 HIA label 优先于迁移文字且不生成额外内容。</zh-CN><en>The fallback instance supplies both label and text to verify that the existing HIA label precedes migration copy without creating extra content.</en></lang>
    const fallbackWrapper = mount(UButton, {
      props: { label: 'Local label', text: 'Migration text' }
    });

    // <lang><zh-CN>没有默认 slot 时只显示 label fallback，迁移文字不与其并列。</zh-CN><en>Without a default slot, only the label fallback is visible and migration copy is not rendered beside it.</en></lang>
    expect(fallbackWrapper.text()).toBe('Local label');

    // <lang><zh-CN>slot 实例提供默认内容、前置装饰和两种文字 prop，用于证明默认 slot 的最高内容优先级。</zh-CN><en>The slot instance supplies default content, a leading decoration, and both copy props to prove the default slot's highest content precedence.</en></lang>
    const slotWrapper = mount(UButton, {
      props: {
        label: 'Hidden label',
        text: 'Hidden migration text',
        loadingText: 'Loading locally'
      },
      slots: {
        // <lang><zh-CN>默认 slot 是调用方拥有的可见操作名称，不由组件改写或解释。</zh-CN><en>The default slot is caller-owned visible action naming and is neither rewritten nor interpreted by the component.</en></lang>
        default: () => h('span', { class: 'caller-button-copy' }, 'Caller action'),
        // <lang><zh-CN>前置 slot 仅提供无障碍树外的装饰，用于验证 loading 时不会残留。</zh-CN><en>The leading slot provides decoration outside the accessibility name and verifies that none remains during loading.</en></lang>
        leading: () => h('span', { class: 'caller-button-leading' }, '◆')
      }
    });

    // <lang><zh-CN>常规状态只呈现默认 slot 与其前置装饰，不泄露任一 fallback 文案。</zh-CN><en>The normal state renders only the default slot and its leading decoration without leaking either fallback copy.</en></lang>
    expect(slotWrapper.find('.caller-button-copy').exists()).toBe(true);
    expect(slotWrapper.find('.caller-button-leading').exists()).toBe(true);
    expect(slotWrapper.text()).toBe('◆Caller action');

    // <lang><zh-CN>由调用方开启 loading；组件只改变局部投影，不启动或完成任何任务。</zh-CN><en>The caller enables loading; the component changes only local projection and starts or completes no task.</en></lang>
    await slotWrapper.setProps({ loading: true });

    // <lang><zh-CN>loading 文案独占按钮内容，默认 slot、装饰和两个 fallback 均不得同时存在。</zh-CN><en>Loading copy exclusively owns button content; the default slot, decoration, and both fallbacks must not coexist with it.</en></lang>
    expect(slotWrapper.get('.u-button__loading-text').text()).toBe('Loading locally');
    expect(slotWrapper.find('.caller-button-copy').exists()).toBe(false);
    expect(slotWrapper.find('.caller-button-leading').exists()).toBe(false);
    expect(slotWrapper.text()).toBe('Loading locally');
  });

  /** @lang zh-CN 验证可用按钮原样转发 click，而 disabled/loading 在真实 DOM 分派下均保持零新增事件。 @lang en Verifies that an active button forwards raw click unchanged while disabled/loading add zero events under real DOM dispatch. @returns {Promise<void>} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang> */
  it('forwards button click identity and guards disabled or loading states', async () => {
    // <lang><zh-CN>初始按钮处于可操作状态，所有状态仍由 props 的调用方拥有。</zh-CN><en>The initial button is active while all state remains owned by the props caller.</en></lang>
    const wrapper = mount(UButton, { props: { label: 'Continue' } });

    // <lang><zh-CN>在原生按钮元素上分派并保存事件 identity，验证 emit 不构造替代 payload。</zh-CN><en>Dispatches and retains event identity on the native button element, proving the emit constructs no replacement payload.</en></lang>
    const activeEvent = await dispatchRawClick(wrapper.get('button').element);
    expect(wrapper.emitted('click')).toEqual([[activeEvent]]);

    // <lang><zh-CN>调用方切换 disabled 后再次分派；事件总数必须保持一条。</zh-CN><en>After the caller enables disabled, dispatches again; the event total must remain one.</en></lang>
    await wrapper.setProps({ disabled: true });
    await dispatchRawClick(wrapper.get('button').element);
    expect(wrapper.emitted('click')).toHaveLength(1);

    // <lang><zh-CN>调用方改为 loading 但解除 disabled；busy 状态同样不得报告操作 intent。</zh-CN><en>The caller changes to loading while clearing disabled; the busy state likewise must not report action intent.</en></lang>
    await wrapper.setProps({ disabled: false, loading: true });
    await dispatchRawClick(wrapper.get('button').element);
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  /** @lang zh-CN 验证图标 slot/fallback、数字标签、原始 click 与 disabled 零事件。 @lang en Verifies icon slot/fallback, numeric label, raw click, and disabled zero-event behavior. @returns {Promise<void>} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang> */
  it('keeps icon content caller-owned and forwards only active raw clicks', async () => {
    // <lang><zh-CN>fallback 实例使用明确符号和数字零标签，覆盖 falsy 数字的可见性边界。</zh-CN><en>The fallback instance uses an explicit symbol and numeric-zero label to cover falsy-number visibility.</en></lang>
    const fallbackWrapper = mount(UIcon, { props: { name: '◇', label: 0 } });
    expect(fallbackWrapper.get('.u-icon__symbol').text()).toBe('◇');
    expect(fallbackWrapper.get('.u-icon__label').text()).toBe('0');

    // <lang><zh-CN>slot 实例同时保留 name fallback，用于证明调用方内容完全覆盖而非并列。</zh-CN><en>The slot instance also retains a name fallback to prove caller content fully overrides rather than renders beside it.</en></lang>
    const slotWrapper = mount(UIcon, {
      props: { name: 'Hidden symbol' },
      slots: {
        // <lang><zh-CN>调用方 slot 只提供可见符号，不注册字体、图片或远程图标。</zh-CN><en>The caller slot supplies visible symbol only and registers no font, image, or remote icon.</en></lang>
        default: () => h('span', { class: 'caller-icon-symbol' }, '★')
      }
    });
    expect(slotWrapper.get('.u-icon__symbol').text()).toBe('★');
    expect(slotWrapper.text()).not.toContain('Hidden symbol');

    // <lang><zh-CN>可用图标必须保留 DOM 事件 identity，不把 name/label 组合成业务 payload。</zh-CN><en>The active icon must preserve DOM event identity and must not combine name/label into a business payload.</en></lang>
    const activeEvent = await dispatchRawClick(slotWrapper.get('.u-icon').element);
    expect(slotWrapper.emitted('click')).toEqual([[activeEvent]]);

    // <lang><zh-CN>调用方禁用后再次分派，既有 emit 保持不变。</zh-CN><en>After caller disablement, another dispatch leaves the existing emit unchanged.</en></lang>
    await slotWrapper.setProps({ disabled: true });
    await dispatchRawClick(slotWrapper.get('.u-icon').element);
    expect(slotWrapper.emitted('click')).toHaveLength(1);
  });

  /** @lang zh-CN 验证文本 slot/fallback 与 show 投影，同时保留可见状态下的原始 click。 @lang en Verifies text slot/fallback and show projection while preserving raw click in the visible state. @returns {Promise<void>} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang> */
  it('keeps text slot precedence, raw click identity, and caller visibility', async () => {
    // <lang><zh-CN>fallback 实例使用数字零，证明有限原始文字不会因 falsy 判断被丢弃。</zh-CN><en>The fallback instance uses numeric zero, proving bounded raw copy is not lost through a falsy check.</en></lang>
    const fallbackWrapper = mount(UText, { props: { text: 0 } });
    expect(fallbackWrapper.get('.u-text').text()).toBe('0');

    // <lang><zh-CN>slot 实例同时提供 text prop，验证调用方 slot 是唯一可见内容。</zh-CN><en>The slot instance also supplies a text prop, verifying the caller slot is the sole visible content.</en></lang>
    const slotWrapper = mount(UText, {
      props: { text: 'Hidden fallback', show: true },
      slots: {
        // <lang><zh-CN>调用方 slot 只提供纯展示内容，不传入 HTML 字符串或远程数据。</zh-CN><en>The caller slot supplies presentation content only and passes no HTML string or remote data.</en></lang>
        default: () => h('span', { class: 'caller-text-copy' }, 'Caller text')
      }
    });
    expect(slotWrapper.get('.u-text').text()).toBe('Caller text');
    expect(slotWrapper.text()).not.toContain('Hidden fallback');

    // <lang><zh-CN>可见根原样报告 DOM click，组件不转换为 link、route 或复制动作。</zh-CN><en>The visible root reports the DOM click unchanged and does not convert it into a link, route, or copy action.</en></lang>
    const activeEvent = await dispatchRawClick(slotWrapper.get('.u-text').element);
    expect(slotWrapper.emitted('click')).toEqual([[activeEvent]]);

    // <lang><zh-CN>调用方关闭 show 后根节点消失，既有事件记录不因隐藏而被改写。</zh-CN><en>After the caller clears show, the root disappears and existing event history is not rewritten by hiding.</en></lang>
    await slotWrapper.setProps({ show: false });
    expect(slotWrapper.find('.u-text').exists()).toBe(false);
    expect(slotWrapper.emitted('click')).toHaveLength(1);
  });

  /** @lang zh-CN 验证 tag 默认 slot 优先、禁用 guard、close 隔离与调用方拥有的可见性。 @lang en Verifies tag default-slot precedence, disabled guard, close isolation, and caller-owned visibility. @returns {Promise<void>} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang> */
  it('keeps tag slot content and close lifecycle caller-controlled', async () => {
    // <lang><zh-CN>fallback 实例保留数字零，锁定无 slot 时的安全文字投影。</zh-CN><en>The fallback instance retains numeric zero, locking safe copy projection when no slot exists.</en></lang>
    const fallbackWrapper = mount(UTag, { props: { text: 0 } });
    expect(fallbackWrapper.get('.u-tag__text').text()).toBe('0');

    // <lang><zh-CN>可关闭实例同时提供 fallback 和默认 slot，用于验证 slot 优先级及 caller-owned close。</zh-CN><en>The closable instance supplies both fallback and default slot to verify slot precedence and caller-owned close.</en></lang>
    const wrapper = mount(UTag, {
      props: { text: 'Hidden fallback', clickable: true, closable: true, show: true, visible: true },
      slots: {
        // <lang><zh-CN>默认 slot 只提供标签可见内容，分类含义和后续操作仍由调用方解释。</zh-CN><en>The default slot supplies visible tag content only; category meaning and subsequent action remain caller-interpreted.</en></lang>
        default: () => h('span', { class: 'caller-tag-copy' }, 'Caller tag')
      }
    });
    expect(wrapper.get('.u-tag__text').text()).toBe('Caller tag');
    expect(wrapper.text()).not.toContain('Hidden fallback');

    // <lang><zh-CN>根 click 原样回传事件，不附加 index、文字或类别 payload。</zh-CN><en>The root click returns the event unchanged and attaches no index, copy, or category payload.</en></lang>
    const rootEvent = await dispatchRawClick(wrapper.get('.u-tag__action').element);
    expect(wrapper.emitted('click')).toEqual([[rootEvent]]);

    // <lang><zh-CN>close control 报告无 payload close；stop 使该事件不新增根 click，组件也不自行隐藏。</zh-CN><en>The close control reports a payload-free close; stop prevents an extra root click and the component does not hide itself.</en></lang>
    await dispatchRawClick(wrapper.get('.u-tag__close').element);
    expect(wrapper.emitted('close')).toEqual([[]]);
    expect(wrapper.emitted('click')).toHaveLength(1);
    expect(wrapper.find('.u-tag').exists()).toBe(true);

    // <lang><zh-CN>禁用后根与 close control 均不得新增 intent；调用方可见性 prop 保持原值。</zh-CN><en>After disablement, neither root nor close control may add intent; caller visibility props retain their values.</en></lang>
    await wrapper.setProps({ disabled: true });
    await dispatchRawClick(wrapper.get('.u-tag__action').element);
    await dispatchRawClick(wrapper.get('.u-tag__close').element);
    expect(wrapper.emitted('click')).toHaveLength(1);
    expect(wrapper.emitted('close')).toHaveLength(1);
    expect(wrapper.find('.u-tag').exists()).toBe(true);
  });

  /** @lang zh-CN 验证 alert 默认 slot 覆盖 description、body click 无 payload、close 不连带 click 且 show 不被内部改写。 @lang en Verifies that the alert default slot overrides description, body click has no payload, close does not cascade to click, and show is not internally rewritten. @returns {Promise<void>} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang> */
  it('isolates alert body click and close while leaving visibility to the caller', async () => {
    // <lang><zh-CN>无 slot 的实例锁定 description fallback，不引入默认业务文案。</zh-CN><en>The slotless instance locks description fallback without introducing default business copy.</en></lang>
    const fallbackWrapper = mount(UAlertTips, {
      props: { description: 'Local description' }
    });
    expect(fallbackWrapper.get('.u-alert-tips__description').text()).toBe('Local description');

    // <lang><zh-CN>主实例同时提供 description 与默认 slot，验证调用方 slot 完整覆盖说明正文。</zh-CN><en>The main instance supplies both description and a default slot to verify complete caller-slot override of description body copy.</en></lang>
    const wrapper = mount(UAlertTips, {
      props: {
        show: true,
        title: 'Local alert',
        description: 'Hidden description',
        closable: true
      },
      slots: {
        // <lang><zh-CN>默认 slot 只提供提示正文，不创建全局消息、计时器或自动关闭。</zh-CN><en>The default slot supplies alert body copy only and creates no global message, timer, or automatic close.</en></lang>
        default: () => h('span', { class: 'caller-alert-copy' }, 'Caller alert body')
      }
    });
    expect(wrapper.find('.caller-alert-copy').exists()).toBe(true);
    expect(wrapper.find('.u-alert-tips__description').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Hidden description');

    // <lang><zh-CN>body click 只报告无 payload intent，即使底层 DOM 事件存在也不将其提升为公共数据。</zh-CN><en>The body click reports only payload-free intent; even though a DOM event exists, it is not promoted into public data.</en></lang>
    await dispatchRawClick(wrapper.get('.u-alert-tips__body').element);
    expect(wrapper.emitted('click')).toEqual([[]]);

    // <lang><zh-CN>close control 只新增 close，不冒泡成第二个 body click，也不修改调用方 show。</zh-CN><en>The close control adds close only, does not bubble into a second body click, and does not mutate caller show.</en></lang>
    await dispatchRawClick(wrapper.get('.u-alert-tips__close').element);
    expect(wrapper.emitted('close')).toEqual([[]]);
    expect(wrapper.emitted('click')).toHaveLength(1);
    expect(wrapper.find('.u-alert-tips').exists()).toBe(true);

    // <lang><zh-CN>只有调用方显式更新 show=false 后提示条才移除，证明 close 不拥有状态。</zh-CN><en>The alert disappears only after the caller explicitly updates show=false, proving close owns no state.</en></lang>
    await wrapper.setProps({ show: false });
    expect(wrapper.find('.u-alert-tips').exists()).toBe(false);
  });
});
