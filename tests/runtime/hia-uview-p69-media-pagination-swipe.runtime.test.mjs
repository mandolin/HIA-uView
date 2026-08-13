/**
 * @module hia-uview-p69-media-pagination-swipe.runtime.test
 * @lang zh-CN 使用真实 Vue/jsdom runtime 验证图片恢复、有限分页与受控 swipe-action 的展示合同；测试不启动网络、缓存、手势、动画、路由、存储、平台 API 或业务动作。
 * @lang en Uses the real Vue/jsdom runtime to verify image recovery, bounded pagination, and controlled swipe-action presentation contracts; the tests start no network, cache, gesture, animation, routing, storage, platform API, or business action.
 */

// <lang><zh-CN>导入真实 Vue 渲染辅助、mount 和断言；测试不安装全局 plugin、UniApp mock 或远程 fixture。</zh-CN><en>Imports real Vue rendering helpers, mount, and assertions; the tests install no global plugin, UniApp mock, or remote fixture.</en></lang>
import { h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { UImage, UPagination, USwipeAction } from '../../HIA-uView-UI/src/index.mjs';

/**
 * @lang zh-CN 验证 UImage 对当前 src 的原生节点、错误 fallback 与原始事件身份保持明确且可恢复。
 * @lang en Verifies that UImage keeps the native node, error fallback, and original event identity for the current src explicit and recoverable.
 */
describe('UImage source recovery runtime behavior', () => {
  /**
   * @lang zh-CN 验证 error 后变更 src 会重建原生图片、未知 mode 回退，并原样回传 load/error/click。
   * @lang en Verifies that changing src after error recreates the native image, unknown mode falls back, and load/error/click are forwarded unchanged.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；事件派发和 prop 更新完成后解决。</zh-CN><en>No return value; resolves after event dispatch and prop updates complete.</en></lang>
   */
  it('rebuilds the native image for a changed source and preserves raw event identity', async () => {
    // <lang><zh-CN>初始实例使用固定的非网络测试字符串和未知 mode，只观察模板属性与本地事件。</zh-CN><en>The initial instance uses a fixed non-network test string and unknown mode, observing only template attributes and local events.</en></lang>
    const wrapper = mount(UImage, {
      props: { src: 'local://image-a', alt: 'Caller image', mode: 'unknown-mode' }
    });

    // <lang><zh-CN>保存首个原生节点身份，以便确认来源变化不是在错误 fallback 后复用陈旧节点。</zh-CN><en>Retains the first native-node identity to confirm that a source change does not reuse a stale node after error fallback.</en></lang>
    const firstNativeNode = wrapper.get('image.u-image__native').element;

    expect(wrapper.get('image.u-image__native').attributes('mode')).toBe('aspectFill');

    // <lang><zh-CN>手工派发原生错误对象，断言组件既显示本地 fallback 又不包装或替换事件身份。</zh-CN><en>Dispatches a native error object manually and asserts that the component shows the local fallback without wrapping or replacing event identity.</en></lang>
    const errorEvent = new Event('error');
    firstNativeNode.dispatchEvent(errorEvent);
    await nextTick();

    expect(wrapper.emitted('error')).toEqual([[errorEvent]]);
    expect(wrapper.find('image.u-image__native').exists()).toBe(false);
    expect(wrapper.get('.u-image__fallback').text()).toContain('Image unavailable');

    // <lang><zh-CN>调用方提供新来源后，组件必须恢复一个新原生节点，且不要求调用方重新挂载整个组件。</zh-CN><en>After the caller supplies a new source, the component must restore a new native node without requiring the caller to remount the whole component.</en></lang>
    await wrapper.setProps({ src: 'local://image-b' });

    const secondNativeNode = wrapper.get('image.u-image__native').element;

    expect(secondNativeNode).not.toBe(firstNativeNode);
    expect(wrapper.find('.u-image__fallback').exists()).toBe(false);

    // <lang><zh-CN>新节点的 load 与根节点 click 都必须保留平台事件对象 identity；组件不附加远端状态或图片命令。</zh-CN><en>Both load from the new node and click from the root must retain platform-event object identity; the component appends no remote state or image command.</en></lang>
    const loadEvent = new Event('load');
    const clickEvent = new Event('click');
    secondNativeNode.dispatchEvent(loadEvent);
    wrapper.get('.u-image').element.dispatchEvent(clickEvent);
    await nextTick();

    expect(wrapper.emitted('load')).toEqual([[loadEvent]]);
    expect(wrapper.emitted('click')).toEqual([[clickEvent]]);
  });

  /**
   * @lang zh-CN 验证 showError=false 保留原生节点，但 src 变化仍重建节点并清除当前错误呈现状态。
   * @lang en Verifies that showError=false retains the native node while a src change still recreates it and clears current error-presentation state.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；错误派发与 prop 更新完成后解决。</zh-CN><en>No return value; resolves after error dispatch and prop update complete.</en></lang>
   */
  it('keeps error fallback hidden while still rebuilding for a changed source', async () => {
    // <lang><zh-CN>关闭错误文字只改变局部投影，不应阻止 error 事件或新来源节点重建。</zh-CN><en>Disabling error copy changes only local projection and must not block the error event or new-source node recreation.</en></lang>
    const wrapper = mount(UImage, {
      props: { src: 'local://hidden-error-a', showError: false }
    });

    const firstNativeNode = wrapper.get('image.u-image__native').element;
    const errorEvent = new Event('error');

    firstNativeNode.dispatchEvent(errorEvent);
    await nextTick();

    expect(wrapper.emitted('error')).toEqual([[errorEvent]]);
    expect(wrapper.find('.u-image__fallback').exists()).toBe(false);
    expect(wrapper.get('image.u-image__native').element).toBe(firstNativeNode);

    // <lang><zh-CN>来源字符串变化是明确的重建边界；测试不声称识别所有平台陈旧异步事件竞态。</zh-CN><en>A changed source string is the explicit recreation boundary; the test does not claim detection of every platform stale asynchronous-event race.</en></lang>
    await wrapper.setProps({ src: 'local://hidden-error-b' });

    expect(wrapper.get('image.u-image__native').element).not.toBe(firstNativeNode);
    expect(wrapper.find('.u-image__fallback').exists()).toBe(false);
  });
});

/**
 * @lang zh-CN 验证 UPagination 只接受合法整数候选，并以稳定顺序报告三个 caller-controlled 事件。
 * @lang en Verifies that UPagination accepts only valid integer candidates and reports three caller-controlled events in stable order.
 */
describe('UPagination bounded event runtime behavior', () => {
  /**
   * @lang zh-CN 验证合法页严格按 update:current、update:modelValue、change 顺序回传同一数字。
   * @lang en Verifies that a valid page reports the same number strictly in update:current, update:modelValue, then change order.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；点击触发完成后解决。</zh-CN><en>No return value; resolves after click dispatch completes.</en></lang>
   */
  it('reports a valid page in strict controlled-event order', async () => {
    // <lang><zh-CN>监听器只记录同步 emit 顺序和 payload，不写回 prop、查询数据或改变页面。</zh-CN><en>The listeners record only synchronous emit order and payload and write no prop, query data, or page state.</en></lang>
    const eventOrder = [];
    const wrapper = mount(UPagination, {
      props: {
        current: 2,
        pageCount: 3,
        'onUpdate:current': (page) => eventOrder.push(['update:current', page]),
        'onUpdate:modelValue': (page) => eventOrder.push(['update:modelValue', page]),
        onChange: (page) => eventOrder.push(['change', page])
      }
    });

    await wrapper.findAll('.u-pagination__page')[2].trigger('click');

    expect(eventOrder).toEqual([
      ['update:current', 3],
      ['update:modelValue', 3],
      ['change', 3]
    ]);
    expect(wrapper.emitted('update:current')).toEqual([[3]]);
    expect(wrapper.emitted('update:modelValue')).toEqual([[3]]);
    expect(wrapper.emitted('change')).toEqual([[3]]);
  });

  /**
   * @lang zh-CN 验证重复、越界、非整数与非有限候选都保持零事件。
   * @lang en Verifies that repeated, out-of-range, noninteger, and nonfinite candidates all retain zero events.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；内部 handler 调用后的 Vue flush 完成后解决。</zh-CN><en>No return value; resolves after the Vue flush following internal-handler calls.</en></lang>
   */
  it('rejects repeated, out-of-range, noninteger, and nonfinite candidates', async () => {
    // <lang><zh-CN>真实挂载实例提供三页和当前第二页；测试通过 setup binding 调用同一模板 handler，覆盖 UI 无法产生的畸形候选。</zh-CN><en>The real mounted instance supplies three pages with page two current; the test calls the same template handler through its setup binding to cover malformed candidates the UI cannot produce.</en></lang>
    const wrapper = mount(UPagination, { props: { current: 2, pageCount: 3 } });
    const changePage = wrapper.vm.$.setupState.changePage;

    changePage(2);
    changePage(0);
    changePage(4);
    changePage(2.5);
    changePage(Number.NaN);
    changePage(Number.POSITIVE_INFINITY);
    await nextTick();

    expect(wrapper.emitted()).toEqual({});
  });

  /**
   * @lang zh-CN 验证 default slot 接收 current/pageCount 且与内置摘要 fallback 互斥。
   * @lang en Verifies that the default slot receives current/pageCount and is mutually exclusive with the built-in summary fallback.
   */
  it('keeps caller summary slot and built-in fallback mutually exclusive', () => {
    // <lang><zh-CN>fallback 实例证明没有 slot 时仍呈现稳定摘要。</zh-CN><en>The fallback instance proves that a stable summary remains when no slot is supplied.</en></lang>
    const fallback = mount(UPagination, { props: { current: 2, pageCount: 3 } });

    // <lang><zh-CN>slot 函数只读取组件提供的有限 binding 并输出测试文字，不引入查询或共享状态。</zh-CN><en>The slot function reads only the finite bindings supplied by the component and outputs test copy without introducing a query or shared state.</en></lang>
    const slotted = mount(UPagination, {
      props: { current: 2, pageCount: 3 },
      slots: {
        default: ({ current, pageCount }) => h('text', { class: 'caller-summary' }, `${current} of ${pageCount}`)
      }
    });

    expect(fallback.get('.u-pagination__summary').text()).toBe('2 / 3');
    expect(slotted.get('.caller-summary').text()).toBe('2 of 3');
    expect(slotted.get('.u-pagination__summary').text()).not.toContain('2 / 3');
  });
});

/**
 * @lang zh-CN 验证 USwipeAction 只快照有限 own data 字段、优先 actions，并保持 caller-controlled 的事件与可见性所有权。
 * @lang en Verifies that USwipeAction snapshots only bounded own data fields, prioritizes actions, and retains caller-controlled event and visibility ownership.
 */
describe('USwipeAction bounded descriptor runtime behavior', () => {
  /**
   * @lang zh-CN 验证普通 getter/callback 不执行、非法 payload 安全降级、accessor-only 项跳过，并保持 click→action 与 close 顺序。
   * @lang en Verifies that ordinary getters/callbacks never execute, invalid payloads degrade safely, accessor-only items are skipped, and click-to-action plus close order remains stable.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；本地 control 点击完成后解决。</zh-CN><en>No return value; resolves after local-control clicks complete.</en></lang>
   */
  it('uses a bounded own-data snapshot without executing caller capabilities', async () => {
    // <lang><zh-CN>计数器捕获任何意外 getter 或 callback 执行；它们不代表业务状态。</zh-CN><en>Counters capture any accidental getter or callback execution; they represent no business state.</en></lang>
    let getterReads = 0;
    let callbackCalls = 0;

    // <lang><zh-CN>首项同时含安全 data 字段、危险 accessor 和 callback；只有 own data text/value 可进入快照。</zh-CN><en>The first item contains safe data fields, a dangerous accessor, and a callback; only own data text/value may enter the snapshot.</en></lang>
    const preferredAction = {
      text: 'Preferred action',
      value: 'preferred',
      callback: () => { callbackCalls += 1; }
    };
    Object.defineProperty(preferredAction, 'label', {
      enumerable: true,
      get: () => {
        getterReads += 1;
        return 'Getter label';
      }
    });

    // <lang><zh-CN>第二项的对象 payload 不可回传，必须降级为安全文字 payload。</zh-CN><en>The second item's object payload cannot be returned and must degrade to the safe text payload.</en></lang>
    const invalidPayloadAction = { text: 'Fallback payload', value: { hidden: true } };

    // <lang><zh-CN>第三项只有 accessor，读取它会执行调用方能力，因此必须完整跳过。</zh-CN><en>The third item has only an accessor; reading it would execute caller capability, so the item must be skipped completely.</en></lang>
    const accessorOnlyAction = {};
    Object.defineProperty(accessorOnlyAction, 'text', {
      enumerable: true,
      get: () => {
        getterReads += 1;
        return 'Unsafe accessor';
      }
    });

    // <lang><zh-CN>顺序监听器验证 emit 次序而不写回 open、调用业务 callback 或解释 payload。</zh-CN><en>Order listeners verify emit order without writing open, invoking a business callback, or interpreting payload.</en></lang>
    const eventOrder = [];
    const wrapper = mount(USwipeAction, {
      props: {
        open: true,
        actions: [preferredAction, invalidPayloadAction, accessorOnlyAction],
        options: [{ text: 'Ignored option', value: 'ignored' }],
        onClick: (value) => eventOrder.push(['click', value]),
        onAction: (value) => eventOrder.push(['action', value]),
        'onUpdate:open': (value) => eventOrder.push(['update:open', value]),
        onClose: () => eventOrder.push(['close'])
      },
      slots: { default: 'Caller-owned row' }
    });

    const actionControls = wrapper.findAll('.u-swipe-action__action');

    expect(actionControls).toHaveLength(2);
    expect(wrapper.text()).toContain('Preferred action');
    expect(wrapper.text()).toContain('Fallback payload');
    expect(wrapper.text()).not.toContain('Getter label');
    expect(wrapper.text()).not.toContain('Unsafe accessor');
    expect(wrapper.text()).not.toContain('Ignored option');
    expect(getterReads).toBe(0);

    await actionControls[0].trigger('click');
    await actionControls[1].trigger('click');
    await wrapper.get('.u-swipe-action__close').trigger('click');

    expect(eventOrder).toEqual([
      ['click', 'preferred'],
      ['action', 'preferred'],
      ['click', 'Fallback payload'],
      ['action', 'Fallback payload'],
      ['update:open', false],
      ['close']
    ]);
    expect(getterReads).toBe(0);
    expect(callbackCalls).toBe(0);
    expect(wrapper.find('.u-swipe-action__actions').exists()).toBe(true);
  });

  /**
   * @lang zh-CN 验证组件或单项 disabled 均保持零事件，即使测试直接触发本地按钮。
   * @lang en Verifies that component-level or item-level disabled retains zero events even when tests directly trigger local buttons.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；按钮触发完成后解决。</zh-CN><en>No return value; resolves after button triggers complete.</en></lang>
   */
  it('keeps every local action and close event silent while disabled', async () => {
    // <lang><zh-CN>组件级 disabled 同时覆盖 action 和 close；测试不依赖调用方权限或业务规则。</zh-CN><en>Component-level disabled covers both action and close; the test relies on no caller authorization or business rule.</en></lang>
    const disabledComponent = mount(USwipeAction, {
      props: { open: true, disabled: true, actions: [{ text: 'Blocked', value: 1 }] }
    });

    await disabledComponent.get('.u-swipe-action__action').trigger('click');
    await disabledComponent.get('.u-swipe-action__close').trigger('click');

    expect(disabledComponent.emitted()).toEqual({});

    // <lang><zh-CN>单项 disabled 只禁止该 action，且其 boolean 必须来自 own data descriptor。</zh-CN><en>Item-level disabled blocks only that action, and its boolean must come from an own data descriptor.</en></lang>
    const disabledItem = mount(USwipeAction, {
      props: { open: true, actions: [{ text: 'Blocked item', value: 2, disabled: true }] }
    });

    await disabledItem.get('.u-swipe-action__action').trigger('click');

    expect(disabledItem.emitted()).toEqual({});
  });
});
