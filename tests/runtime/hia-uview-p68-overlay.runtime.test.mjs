/**
 * @module hia-uview-p68-overlay.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证 popup、mask、transition 与 action-sheet 的 P68 受控别名、有限关闭原因、严格事件顺序、slot 与 component-ref close。测试不启动网络、router、全局 service、portal、焦点/滚动管理、JavaScript 动画 timer 或平台 API，也不替代真机、读屏与跨端证据。
 * @lang en Uses the real Vue runtime to verify P68 controlled aliases, finite close reasons, strict event order, slots, and component-ref close for popup, mask, transition, and action-sheet. Tests start no network, router, global service, portal, focus/scroll management, JavaScript animation timer, or platform API and do not replace device, screen-reader, or cross-platform evidence.
 */

// <lang><zh-CN>导入本地 Vue mount、Vitest 断言和四个仓内组件；测试不安装 plugin、service host 或平台 mock。</zh-CN><en>Imports local Vue mount, Vitest assertions, and four repository components; the tests install no plugin, service host, or platform mock.</en></lang>
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import UActionSheet from '../../HIA-uView-UI/src/components/u-action-sheet/u-action-sheet.vue';
import UMask from '../../HIA-uView-UI/src/components/u-mask/u-mask.vue';
import UPopup from '../../HIA-uView-UI/src/components/u-popup/u-popup.vue';
import UTransition from '../../HIA-uView-UI/src/components/u-transition/u-transition.vue';

/**
 * @lang zh-CN 验证 UPopup 的受控优先级、有限 placement、open 转换和三条关闭入口。
 * @lang en Verifies UPopup controlled precedence, finite placement, open transitions, and all three close entries.
 */
describe('UPopup P68 overlay runtime behavior', () => {
  /**
   * @lang zh-CN 验证初始 true 不产生 open，挂载后的 false→true 才产生一次，并保持 visible 对 modelValue/show 的显式优先级。
   * @lang en Verifies initial true emits no open, only a post-mount false-to-true transition emits once, and visible retains explicit precedence over modelValue/show.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；prop 更新完成后解决。</zh-CN><en>No return value; resolves after prop updates complete.</en></lang>
   */
  it('reports only real post-mount open transitions and preserves alias precedence', async () => {
    // <lang><zh-CN>初始可见实例不得把 mount 伪装为 open 事件，未知 placement 同时回退到有限 bottom class。</zh-CN><en>An initially visible instance must not fabricate mount as an open event, while an unknown placement falls back to the finite bottom class.</en></lang>
    const initiallyVisible = mount(UPopup, { props: { modelValue: true, placement: 'unsupported' } });
    expect(initiallyVisible.emitted('open')).toBeUndefined();
    expect(initiallyVisible.get('.u-popup').classes()).toContain('u-popup--bottom');

    // <lang><zh-CN>转换实例从两个迁移入口均为 false 开始，因此根节点与 open 事件都不存在。</zh-CN><en>The transition instance starts with both migration entries false, so neither the root nor an open event exists.</en></lang>
    const popup = mount(UPopup, { props: { modelValue: false, show: false } });
    expect(popup.find('.u-popup').exists()).toBe(false);

    // <lang><zh-CN>第一次 false→true 只产生一次 open；其他输入仍维持 true 时不重复报告。</zh-CN><en>The first false-to-true transition produces one open only; other inputs retaining true do not report again.</en></lang>
    await popup.setProps({ modelValue: true });
    await popup.setProps({ show: true });
    await popup.setProps({ modelValue: false });
    expect(popup.emitted('open')).toEqual([[]]);

    // <lang><zh-CN>先回到 false 再切换 show，才形成第二次真实 open 转换。</zh-CN><en>Only returning to false and then switching show forms the second real open transition.</en></lang>
    await popup.setProps({ show: false });
    await popup.setProps({ show: true });
    expect(popup.emitted('open')).toEqual([[], []]);

    // <lang><zh-CN>显式 visible=false 压过 show=true；随后 visible=true 形成第三次 false→true。</zh-CN><en>Explicit visible=false overrides show=true; subsequent visible=true forms the third false-to-true transition.</en></lang>
    await popup.setProps({ visible: false });
    expect(popup.find('.u-popup').exists()).toBe(false);
    await popup.setProps({ visible: true });
    expect(popup.emitted('open')).toEqual([[], [], []]);
  });

  /**
   * @lang zh-CN 验证 control、mask 与 programmatic close 都严格先更新后关闭，保留 raw event 首参并追加有限 reason。
   * @lang en Verifies control, mask, and programmatic close all strictly update before close, preserve the raw event as the first argument, and append a finite reason.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；click 触发完成后解决。</zh-CN><en>No return value; resolves after click triggers complete.</en></lang>
   */
  it('orders every eligible close path and keeps ineligible paths event-free', async () => {
    // <lang><zh-CN>监听序列直接记录跨事件名称的调用顺序和 payload，而非仅比较各事件独立数组。</zh-CN><en>The listener sequence records cross-event-name call order and payload directly rather than comparing only separate emitted arrays.</en></lang>
    const controlSequence = [];
    const controlPopup = mount(UPopup, {
      props: {
        modelValue: true,
        closeText: 'Close',
        'onUpdate:modelValue': (value) => controlSequence.push(['update:modelValue', value]),
        onClose: (event, reason) => controlSequence.push(['close', event?.type, reason])
      }
    });

    // <lang><zh-CN>显式 control 保留平台 click 事件并在更新请求之后报告 control 原因。</zh-CN><en>The explicit control preserves the platform click event and reports the control reason after the update request.</en></lang>
    await controlPopup.get('.u-popup__close').trigger('click');
    expect(controlSequence).toEqual([['update:modelValue', false], ['close', 'click', 'control']]);

    // <lang><zh-CN>启用的 mask 走同一顺序，仅 reason 改为 mask。</zh-CN><en>An enabled mask uses the same order with only the reason changed to mask.</en></lang>
    const maskSequence = [];
    const maskPopup = mount(UPopup, {
      props: {
        modelValue: true,
        maskClosable: true,
        'onUpdate:modelValue': (value) => maskSequence.push(['update:modelValue', value]),
        onClose: (event, reason) => maskSequence.push(['close', event?.type, reason])
      }
    });
    await maskPopup.get('.u-popup__mask').trigger('click');
    expect(maskSequence).toEqual([['update:modelValue', false], ['close', 'click', 'mask']]);

    // <lang><zh-CN>component-ref close 没有 raw 平台事件，但仍严格先更新后报告 programmatic。</zh-CN><en>Component-ref close has no raw platform event but still strictly updates before reporting programmatic.</en></lang>
    const programmaticSequence = [];
    const programmaticPopup = mount(UPopup, {
      props: {
        modelValue: true,
        'onUpdate:modelValue': (value) => programmaticSequence.push(['update:modelValue', value]),
        onClose: (event, reason) => programmaticSequence.push(['close', event, reason])
      }
    });
    programmaticPopup.vm.close();
    expect(programmaticSequence).toEqual([['update:modelValue', false], ['close', undefined, 'programmatic']]);

    // <lang><zh-CN>显式隐藏压过 show，陈旧 ref close 与未授权 mask click 都保持零事件。</zh-CN><en>Explicit hidden overrides show, while stale-ref close and unauthorized mask click both retain zero events.</en></lang>
    const guardedPopup = mount(UPopup, { props: { visible: false, show: true, maskClosable: false } });
    guardedPopup.vm.close();
    expect(guardedPopup.find('.u-popup').exists()).toBe(false);
    expect(guardedPopup.emitted()).toEqual({});

    const nonClosablePopup = mount(UPopup, { props: { modelValue: true, maskClosable: false } });
    await nonClosablePopup.get('.u-popup__mask').trigger('click');
    expect(nonClosablePopup.emitted('update:modelValue')).toBeUndefined();
    expect(nonClosablePopup.emitted('close')).toBeUndefined();
  });
});

/**
 * @lang zh-CN 验证 UMask 与 UTransition 的 show 别名、slot、显式优先级及有限数值/class 投影。
 * @lang en Verifies UMask and UTransition show aliases, slots, explicit precedence, and finite numeric/class projection.
 */
describe('UMask and UTransition P68 overlay primitives', () => {
  /**
   * @lang zh-CN 验证 mask 仅在 show 可见且 clickable 时转发 raw click，并把 opacity/layer 限制到合同范围。
   * @lang en Verifies the mask forwards raw click only while show-visible and clickable and clamps opacity/layer to the contract range.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；click 触发完成后解决。</zh-CN><en>No return value; resolves after the click trigger completes.</en></lang>
   */
  it('projects the mask alias, slot, click guard, clamp, and fallback', async () => {
    // <lang><zh-CN>show 别名输出 slot；超界透明度与层级分别收束为 0.92 和 2000。</zh-CN><en>The show alias outputs the slot; out-of-range opacity and layer clamp to 0.92 and 2000 respectively.</en></lang>
    const mask = mount(UMask, {
      props: { show: true, clickable: true, opacity: 4, layer: 9000 },
      slots: { default: 'Caller mask slot' }
    });
    const maskElement = mask.get('.u-mask').element;
    await mask.get('.u-mask').trigger('click');
    expect(mask.text()).toContain('Caller mask slot');
    expect(mask.emitted('click')?.[0]?.[0]?.type).toBe('click');
    expect(maskElement.style.getPropertyValue('--u-mask-opacity')).toBe('0.92');
    expect(maskElement.style.getPropertyValue('--u-mask-layer')).toBe('2000');

    // <lang><zh-CN>非有限值回退默认投影；不启用 clickable 时直接 click 仍保持零事件。</zh-CN><en>Non-finite values fall back to default projection; when clickable is not enabled, a direct click still retains zero events.</en></lang>
    const fallbackMask = mount(UMask, { props: { show: true, opacity: Number.NaN, layer: Number.NaN } });
    const fallbackElement = fallbackMask.get('.u-mask').element;
    await fallbackMask.get('.u-mask').trigger('click');
    expect(fallbackElement.style.getPropertyValue('--u-mask-opacity')).toBe('0.56');
    expect(fallbackElement.style.getPropertyValue('--u-mask-layer')).toBe('1000');
    expect(fallbackMask.emitted()).toEqual({});

    // <lang><zh-CN>显式 visible=false 始终压过 show=true，根节点和 slot 都不输出。</zh-CN><en>Explicit visible=false always overrides show=true, so neither root nor slot is output.</en></lang>
    const hiddenMask = mount(UMask, { props: { visible: false, show: true }, slots: { default: 'Hidden slot' } });
    expect(hiddenMask.find('.u-mask').exists()).toBe(false);
  });

  /**
   * @lang zh-CN 验证 transition 的 show/visible 优先级、slot、未知 mode 回退与 duration clamp/fallback。
   * @lang en Verifies transition show/visible precedence, slot, unknown-mode fallback, and duration clamp/fallback.
   */
  it('keeps transition presentation finite without timers or lifecycle events', () => {
    // <lang><zh-CN>show 输出 slot；未知 mode 回退 fade，过大 duration 收束为 1000ms。</zh-CN><en>Show outputs the slot; an unknown mode falls back to fade and an excessive duration clamps to 1000ms.</en></lang>
    const transition = mount(UTransition, {
      props: { show: true, mode: 'unsupported', duration: 5000 },
      slots: { default: 'Caller transition slot' }
    });
    const transitionElement = transition.get('.u-transition').element;
    expect(transition.text()).toContain('Caller transition slot');
    expect(transition.get('.u-transition').classes()).toContain('u-transition--fade');
    expect(transitionElement.style.getPropertyValue('--u-transition-duration')).toBe('1000ms');
    expect(transition.emitted()).toEqual({});

    // <lang><zh-CN>NaN 回退 180ms；显式 visible=false 则压过 show 并完全移除局部树。</zh-CN><en>NaN falls back to 180ms; explicit visible=false overrides show and removes the local tree completely.</en></lang>
    const fallbackTransition = mount(UTransition, { props: { show: true, duration: Number.NaN } });
    expect(fallbackTransition.get('.u-transition').element.style.getPropertyValue('--u-transition-duration')).toBe('180ms');
    const hiddenTransition = mount(UTransition, { props: { visible: false, show: true } });
    expect(hiddenTransition.find('.u-transition').exists()).toBe(false);
  });
});

/**
 * @lang zh-CN 验证 UActionSheet 的 modelValue 优先级、slot、item 过滤、双选择事件与三条统一关闭路径。
 * @lang en Verifies UActionSheet modelValue precedence, slot, item filtering, dual selection events, and all three unified close paths.
 */
describe('UActionSheet P68 overlay runtime behavior', () => {
  /**
   * @lang zh-CN 验证 select payload 严格先于 click(index)，且 disabled/无标签 item 不产生事件或自动关闭。
   * @lang en Verifies the select payload strictly precedes click(index), while disabled/unlabeled items produce no event or automatic close.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；item click 触发完成后解决。</zh-CN><en>No return value; resolves after item click triggers complete.</en></lang>
   */
  it('reports bounded selections without executing or closing them', async () => {
    // <lang><zh-CN>监听序列验证跨 select/click 的精确顺序；输入还包含应过滤的空 label 与应 guard 的 disabled item。</zh-CN><en>The listener sequence verifies exact order across select/click; input also contains an empty label to filter and a disabled item to guard.</en></lang>
    const selectionSequence = [];
    const sheet = mount(UActionSheet, {
      props: {
        modelValue: true,
        items: [{ label: 'Available', value: 'available' }, { label: '', value: 'hidden' }, { label: 'Disabled', value: 'disabled', disabled: true }, 'String item'],
        onSelect: (payload) => selectionSequence.push(['select', payload]),
        onClick: (index) => selectionSequence.push(['click', index])
      },
      slots: { default: 'Caller sheet slot' }
    });

    // <lang><zh-CN>过滤后只渲染三个有标签 item；首项依次报告结构化 select 与迁移 click(0)。</zh-CN><en>After filtering, only three labeled items render; the first reports structured select then migration click(0).</en></lang>
    const itemControls = sheet.findAll('button.u-action-sheet__item');
    expect(itemControls).toHaveLength(3);
    expect(sheet.text()).toContain('Caller sheet slot');
    expect(sheet.text()).not.toContain('hidden');
    await itemControls[0].trigger('click');
    expect(selectionSequence).toEqual([['select', { value: 'available', index: 0 }], ['click', 0]]);
    expect(sheet.emitted('update:modelValue')).toBeUndefined();
    expect(sheet.emitted('close')).toBeUndefined();

    // <lang><zh-CN>disabled item 的平台 click 不增加任何监听记录，且 sheet 仍由 modelValue 保持可见。</zh-CN><en>A platform click on the disabled item adds no listener record, and the sheet remains visible under modelValue ownership.</en></lang>
    await itemControls[1].trigger('click');
    expect(selectionSequence).toHaveLength(2);
    expect(sheet.find('.u-action-sheet').exists()).toBe(true);
  });

  /**
   * @lang zh-CN 验证显式 null 与 opaque object value 原样回传，渲染 key 不触发 value coercion，accessor 也不会执行。
   * @lang en Verifies explicit null and opaque-object values are returned unchanged, render keys never coerce values, and accessors are not executed.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；两个有限 item click 完成后解决。</zh-CN><en>No return value; resolves after two finite item clicks complete.</en></lang>
   */
  it('preserves opaque values without coercion or accessor execution', async () => {
    // <lang><zh-CN>若组件对 opaque value 调用 String/toString，本对象会立即暴露错误。</zh-CN><en>This object exposes an error immediately if the component calls String/toString on an opaque value.</en></lang>
    const opaqueValue = Object.freeze({
      toString() {
        throw new Error('opaque value must not be coerced');
      }
    });

    // <lang><zh-CN>Accessor 条目用于证明 descriptor 审计不会执行 getter；其非数据 value 安全回退到 label。</zh-CN><en>The accessor item proves descriptor inspection executes no getter; its non-data value safely falls back to the label.</en></lang>
    let getterCalls = 0;
    const accessorItem = { label: 'Accessor fallback' };
    Object.defineProperty(accessorItem, 'value', {
      enumerable: true,
      get() {
        getterCalls += 1;
        return 'unsafe getter value';
      }
    });

    // <lang><zh-CN>收集结构化选择，不比较 DOM key 实现细节。</zh-CN><en>Collects structured selections without comparing DOM-key implementation details.</en></lang>
    const selections = [];
    const sheet = mount(UActionSheet, {
      props: {
        modelValue: true,
        items: [
          { label: 'Null value', value: null },
          { label: 'Opaque value', value: opaqueValue },
          accessorItem
        ],
        onSelect: (detail) => selections.push(detail)
      }
    });

    // <lang><zh-CN>挂载和点击前三项均不得执行 getter/toString，且 null/object identity 保持不变。</zh-CN><en>Mounting and clicking all three items executes neither getter nor toString and preserves null/object identity.</en></lang>
    const controls = sheet.findAll('button.u-action-sheet__item');
    expect(controls).toHaveLength(3);
    expect(getterCalls).toBe(0);
    await controls[0].trigger('click');
    await controls[1].trigger('click');
    await controls[2].trigger('click');
    expect(getterCalls).toBe(0);
    expect(selections[0]).toEqual({ value: null, index: 0 });
    expect(selections[1].value).toBe(opaqueValue);
    expect(selections[1].index).toBe(1);
    expect(selections[2]).toEqual({ value: 'Accessor fallback', index: 2 });

    // <lang><zh-CN>显式卸载局部 sheet，不保留响应式 effect。</zh-CN><en>Explicitly unmounts the local sheet and retains no reactive effect.</en></lang>
    sheet.unmount();
  });

  /**
   * @lang zh-CN 验证 mask、cancel、component-ref close 都严格先更新后关闭，并保留各自 raw event/reason。
   * @lang en Verifies mask, cancel, and component-ref close all strictly update before close and preserve their respective raw event/reason.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；两个本地 click 触发完成后解决。</zh-CN><en>No return value; resolves after two local click triggers complete.</en></lang>
   */
  it('orders eligible close paths and rejects hidden or unauthorized paths', async () => {
    // <lang><zh-CN>同一可见实例依次触发 mask、cancel 与 programmatic，以验证每条路径都复用严格事件对。</zh-CN><en>The same visible instance triggers mask, cancel, and programmatic paths in sequence to verify each reuses the strict event pair.</en></lang>
    const closeSequence = [];
    const sheet = mount(UActionSheet, {
      props: {
        modelValue: true,
        maskClosable: true,
        cancelText: 'Cancel',
        'onUpdate:modelValue': (value) => closeSequence.push(['update:modelValue', value]),
        onClose: (event, reason) => closeSequence.push(['close', event?.type, reason])
      }
    });
    await sheet.get('.u-action-sheet__mask').trigger('click');
    await sheet.get('.u-action-sheet__cancel').trigger('click');
    sheet.vm.close();
    expect(closeSequence).toEqual([
      ['update:modelValue', false], ['close', 'click', 'mask'],
      ['update:modelValue', false], ['close', 'click', 'cancel'],
      ['update:modelValue', false], ['close', undefined, 'programmatic']
    ]);

    // <lang><zh-CN>未授权 mask click 与缺失 cancel 文字均保持零事件；模板不会创建无标签取消 control。</zh-CN><en>An unauthorized mask click and missing cancel copy both retain zero events; the template creates no unlabeled cancel control.</en></lang>
    const guardedSheet = mount(UActionSheet, { props: { modelValue: true, maskClosable: false, cancelText: '' } });
    await guardedSheet.get('.u-action-sheet__mask').trigger('click');
    expect(guardedSheet.find('.u-action-sheet__cancel').exists()).toBe(false);
    expect(guardedSheet.emitted()).toEqual({});

    // <lang><zh-CN>显式 visible=false 压过 modelValue=true；陈旧 component-ref close 不产生更新或关闭。</zh-CN><en>Explicit visible=false overrides modelValue=true; stale component-ref close produces neither update nor close.</en></lang>
    const hiddenSheet = mount(UActionSheet, { props: { visible: false, modelValue: true } });
    hiddenSheet.vm.close();
    expect(hiddenSheet.find('.u-action-sheet').exists()).toBe(false);
    expect(hiddenSheet.emitted()).toEqual({});
  });
});
