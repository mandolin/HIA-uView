/**
 * @module hia-uview-p69-list-state.runtime.test
 * @lang zh-CN 使用真实 Vue/jsdom 验证受控列表与状态组件：信息行只报告本地 click 意图，空态只投影调用方内容和 action，骨架只在 caller-owned loading 状态下显示有限占位。本测试不启动路由、网络、缓存、数据查询、计时器或业务状态机。
 * @lang en Uses real Vue/jsdom to verify controlled list and state components: information rows report local click intent only, empty state projects only caller content and action, and skeleton displays bounded placeholders only under caller-owned loading state. This test starts no routing, network, cache, data query, timer, or business state machine.
 */

import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { UCell, UCellGroup, UCellItem, UEmpty, USkeleton } from '../../HIA-uView-UI/src/index.mjs';

/**
 * @lang zh-CN 吞掉专门注入错误 prop 类型时 Vue 的预期开发警告，使定向测试只报告合同失败；该函数不修改 console 或组件状态。
 * @lang en Suppresses Vue's expected development warning while an intentionally invalid prop type is injected, keeping the focused test output limited to contract failures; this function changes neither console nor component state.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function ignoreExpectedPropWarning() {}

/**
 * @lang zh-CN 验证 HIA `UCell` facade 只有明确可点击且未禁用时使用并转发原始事件，纯信息行保持非 control 与零事件。
 * @lang en Verifies the HIA `UCell` facade uses and forwards the original event only when explicitly clickable and enabled, while informational rows remain non-controls with zero events.
 */
describe('P69 controlled cell facade runtime behavior', () => {
  /**
   * @lang zh-CN 验证可点击、禁用和纯信息三个分支共享同一调用方文字但只有可操作分支 emit 原始 click。
   * @lang en Verifies clickable, disabled, and informational branches share caller copy while only the active branch emits the original click.
   * @returns {void} <lang><zh-CN>无返回值；同步派发本地事件后完成。</zh-CN><en>No return value; completes after synchronous local-event dispatch.</en></lang>
   */
  it('separates active controls from disabled and informational rows', () => {
    // <lang><zh-CN>可操作实例包含全部三个可见 caller 字段，用于同时验证内容保留和原始事件 identity。</zh-CN><en>The active instance contains all three caller-visible fields, jointly verifying content preservation and original-event identity.</en></lang>
    const active = mount(UCell, {
      props: { label: 'Resource', description: 'Caller detail', value: 'Available', clickable: true }
    });

    // <lang><zh-CN>明确可点击分支必须是 native button，且其文字不依赖 route、record 或外部 store。</zh-CN><en>The explicitly clickable branch must be a native button whose copy depends on no route, record, or external store.</en></lang>
    const activeControl = active.get('button.u-cell');
    expect(active.text()).toContain('Resource');
    expect(active.text()).toContain('Caller detail');
    expect(active.text()).toContain('Available');

    // <lang><zh-CN>直接派发并保存同一个 MouseEvent，证明 facade 不把 payload 替换为 index、route 或包装对象。</zh-CN><en>Dispatches and retains one MouseEvent directly, proving the facade replaces the payload with neither an index, route, nor wrapper object.</en></lang>
    const rawClick = new MouseEvent('click', { bubbles: true });
    activeControl.element.dispatchEvent(rawClick);
    expect(active.emitted('click')).toEqual([[rawClick]]);

    // <lang><zh-CN>禁用实例仍保持已声明的 button 语义，但合成事件也必须被 script guard 拦截。</zh-CN><en>The disabled instance retains its declared button semantics, but even a synthetic event must be blocked by the script guard.</en></lang>
    const disabled = mount(UCell, { props: { label: 'Disabled resource', clickable: true, disabled: true } });
    const disabledControl = disabled.get('button.u-cell');
    disabledControl.element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(disabled.emitted('click')).toBeUndefined();

    // <lang><zh-CN>未 opt-in 的信息实例必须输出 view；即使宿主派发 click，也没有组件 listener 或隐式 intent。</zh-CN><en>The informational instance without opt-in must render a view; even if the host dispatches click, there is no component listener or implicit intent.</en></lang>
    const informational = mount(UCell, { props: { label: 'Read only' } });
    const informationalRow = informational.get('view.u-cell');
    informationalRow.element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(informational.find('button.u-cell').exists()).toBe(false);
    expect(informational.emitted('click')).toBeUndefined();
  });
});

/**
 * @lang zh-CN 验证 cell group 只投影 caller title/default slot，cell item 则保持 value 优先级与可点击 guard。
 * @lang en Verifies cell group only projects caller title/default slot while cell item preserves value precedence and click guards.
 */
describe('P69 grouped cell item runtime behavior', () => {
  /**
   * @lang zh-CN 验证 group 不注册或改写子项，并让 caller default slot 与 title 同时可见。
   * @lang en Verifies the group neither registers nor rewrites children and keeps caller default slot visible alongside the title.
   * @returns {void} <lang><zh-CN>无返回值；同步渲染后完成。</zh-CN><en>No return value; completes after synchronous rendering.</en></lang>
   */
  it('projects the title and caller-owned group slot without events', () => {
    // <lang><zh-CN>slot 内容是调用方拥有的任意局部展示，不被 group 转换为记录、选项或表单项。</zh-CN><en>The slot content is arbitrary caller-owned local presentation and is not converted by the group into a record, option, or form item.</en></lang>
    const group = mount(UCellGroup, {
      props: { title: 'Caller group', bordered: false },
      slots: { default: '<text class="caller-group-row">Caller row</text>' }
    });

    // <lang><zh-CN>标题与 slot 同时存在，且关闭 border 只移除受控 class，不产生父子 registry 或事件。</zh-CN><en>The title and slot coexist, while disabling the border only removes the controlled class and creates no parent-child registry or event.</en></lang>
    expect(group.get('.u-cell-group__title').text()).toBe('Caller group');
    expect(group.get('.caller-group-row').text()).toBe('Caller row');
    expect(group.get('.u-cell-group').classes()).not.toContain('u-cell-group--bordered');
    expect(group.emitted()).toEqual({});
  });

  /**
   * @lang zh-CN 验证非空 value（包括数字零）优先于 default slot，合法 click 保留原始事件，非 clickable/disabled 保持零事件。
   * @lang en Verifies nonempty value, including numeric zero, takes precedence over the default slot, valid click preserves the original event, and non-clickable/disabled states retain zero events.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；prop 切换完成后解决。</zh-CN><en>No return value; resolves after prop transitions.</en></lang>
   */
  it('keeps value precedence and exact item click guards', async () => {
    // <lang><zh-CN>数字零覆盖 falsy 值边界；slot 仅作为空 value 时的 caller fallback。</zh-CN><en>Numeric zero covers the falsy-value boundary; the slot is only a caller fallback while value is empty.</en></lang>
    const item = mount(UCellItem, {
      props: { title: 'Capacity', value: 0, clickable: true },
      slots: { default: '<text class="caller-item-tail">Caller fallback</text>' }
    });

    // <lang><zh-CN>当前 value 精确显示为零，caller slot 在该状态下不得同时投影。</zh-CN><en>The current value is displayed exactly as zero, and the caller slot must not be projected in that state.</en></lang>
    expect(item.get('.u-cell-item__value').text()).toBe('0');
    expect(item.find('.caller-item-tail').exists()).toBe(false);

    // <lang><zh-CN>手动派发原始事件，验证 event payload 不被替换为 index、value 或业务对象。</zh-CN><en>Manually dispatches the original event, verifying the event payload is replaced by neither an index, value, nor business object.</en></lang>
    const rawClick = new MouseEvent('click', { bubbles: true });
    item.get('button.u-cell-item').element.dispatchEvent(rawClick);
    expect(item.emitted('click')).toEqual([[rawClick]]);

    // <lang><zh-CN>清空 value 后才允许 caller slot 投影；组件不会缓存先前值或制造默认尾部文字。</zh-CN><en>Only after value is emptied may the caller slot project; the component neither caches the previous value nor fabricates trailing copy.</en></lang>
    await item.setProps({ value: '' });
    expect(item.get('.caller-item-tail').text()).toBe('Caller fallback');

    // <lang><zh-CN>关闭 clickable 后通过合成事件探测 handler guard，已有唯一事件数量必须保持不变。</zh-CN><en>After clickable is disabled, a synthetic event probes the handler guard and the existing sole event count must remain unchanged.</en></lang>
    await item.setProps({ clickable: false });
    item.get('button.u-cell-item').element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(item.emitted('click')).toEqual([[rawClick]]);

    // <lang><zh-CN>重新开启 clickable 但设置 disabled 后同样保持零新增事件，证明 guard 不只依赖单一 prop。</zh-CN><en>Re-enabling clickable while setting disabled likewise adds no event, proving the guard does not depend on only one prop.</en></lang>
    await item.setProps({ clickable: true, disabled: true });
    item.get('button.u-cell-item').element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(item.emitted('click')).toEqual([[rawClick]]);
  });
});

/**
 * @lang zh-CN 验证空态由 caller 明确控制 show、source、文字、action 与 bottom slot，组件不推断数据或执行恢复流程。
 * @lang en Verifies empty state is explicitly controlled by caller show, source, copy, action, and bottom slot, with no data inference or recovery flow executed by the component.
 */
describe('P69 controlled empty-state runtime behavior', () => {
  /**
   * @lang zh-CN 验证 description 优先于 text、action 原样回传事件，bottom slot 与 action 独立共存，缺少 action 时不创建 control。
   * @lang en Verifies description precedes text, action returns the original event, bottom slot coexists independently with action, and no control is created when action is absent.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；prop 切换完成后解决。</zh-CN><en>No return value; resolves after prop transitions.</en></lang>
   */
  it('projects caller copy, source, action, and bottom slot without owning state', async () => {
    // <lang><zh-CN>完整空态同时提供 caller source、两种说明、action 与 bottom slot，用于验证各自的冻结优先级。</zh-CN><en>The complete empty state provides caller source, both descriptions, action, and bottom slot together to verify each frozen precedence rule.</en></lang>
    const empty = mount(UEmpty, {
      props: {
        show: true,
        src: '/fixtures/empty.png',
        title: 'No local records',
        description: 'Primary caller description',
        text: 'Migration fallback description',
        actionText: 'Choose filters'
      },
      slots: { bottom: '<text class="caller-empty-bottom">Caller guidance</text>' }
    });

    // <lang><zh-CN>可见根只投影已提供的 source/title/优先说明和 bottom 内容，迁移 text 在 description 非空时隐藏。</zh-CN><en>The visible root projects only the supplied source, title, preferred description, and bottom content, while migration text stays hidden when description is nonempty.</en></lang>
    expect(empty.get('.u-empty').exists()).toBe(true);
    expect(empty.get('image.u-image__native').attributes('src')).toBe('/fixtures/empty.png');
    expect(empty.text()).toContain('No local records');
    expect(empty.text()).toContain('Primary caller description');
    expect(empty.text()).not.toContain('Migration fallback description');
    expect(empty.get('.caller-empty-bottom').text()).toBe('Caller guidance');

    // <lang><zh-CN>直接派发 UButton 原始事件，空态 action 必须保留同一 identity，且 bottom slot 不拦截或消失。</zh-CN><en>Dispatches UButton's original event directly; empty-state action must preserve the same identity and the bottom slot must neither intercept nor disappear.</en></lang>
    const rawAction = new MouseEvent('click', { bubbles: true });
    empty.get('button.u-button').element.dispatchEvent(rawAction);
    expect(empty.emitted('action')).toEqual([[rawAction]]);
    expect(empty.get('.caller-empty-bottom').text()).toBe('Caller guidance');

    // <lang><zh-CN>移除 description 后才使用迁移 text，同时不写回 title、source 或 show。</zh-CN><en>Migration text is used only after description is removed, without writing back title, source, or show.</en></lang>
    await empty.setProps({ description: '' });
    expect(empty.text()).toContain('Migration fallback description');

    // <lang><zh-CN>移除 action label 与 source 只删除对应投影，bottom slot 继续由 caller 拥有且不产生额外 action。</zh-CN><en>Removing action label and source deletes only those projections; the bottom slot remains caller-owned and creates no extra action.</en></lang>
    await empty.setProps({ actionText: '', src: '' });
    expect(empty.find('button.u-button').exists()).toBe(false);
    expect(empty.find('.u-image').exists()).toBe(false);
    expect(empty.get('.caller-empty-bottom').text()).toBe('Caller guidance');
    expect(empty.emitted('action')).toEqual([[rawAction]]);

    // <lang><zh-CN>caller 最终关闭 show 时根与所有 slot 一起移除，但组件不 emit 状态修正事件。</zh-CN><en>When the caller finally disables show, the root and all slots are removed together, while the component emits no state-correction event.</en></lang>
    await empty.setProps({ show: false });
    expect(empty.find('.u-empty').exists()).toBe(false);
    expect(empty.find('.caller-empty-bottom').exists()).toBe(false);
    expect(empty.emitted('action')).toEqual([[rawAction]]);
  });
});

/**
 * @lang zh-CN 验证骨架只根据 caller loading 投影占位或 default slot，并把 rows 安全收束到零至八行。
 * @lang en Verifies skeleton projects either placeholders or the default slot solely from caller loading and safely constrains rows to zero through eight.
 */
describe('P69 bounded skeleton runtime behavior', () => {
  /**
   * @lang zh-CN 验证 loading 占位与 caller slot 严格互斥，并让 title/avatar 只影响占位结构。
   * @lang en Verifies loading placeholders and caller slot are strictly exclusive, with title/avatar affecting only placeholder structure.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；loading 切换完成后解决。</zh-CN><en>No return value; resolves after the loading transition.</en></lang>
   */
  it('keeps loading placeholders exclusive from caller content', async () => {
    // <lang><zh-CN>loading 实例显式开启 title/avatar 并提供 caller slot，证明状态选择不依赖内容测量。</zh-CN><en>The loading instance explicitly enables title/avatar and provides a caller slot, proving state selection does not depend on content measurement.</en></lang>
    const skeleton = mount(USkeleton, {
      props: { loading: true, rows: 2, showTitle: true, showAvatar: true },
      slots: { default: '<text class="caller-skeleton-content">Loaded content</text>' }
    });

    // <lang><zh-CN>loading=true 只出现受限占位，caller slot 尚未投影。</zh-CN><en>With loading=true, only bounded placeholders appear and the caller slot is not yet projected.</en></lang>
    expect(skeleton.find('.u-skeleton__placeholder').exists()).toBe(true);
    expect(skeleton.find('.u-skeleton__title').exists()).toBe(true);
    expect(skeleton.find('.u-skeleton__avatar').exists()).toBe(true);
    expect(skeleton.findAll('.u-skeleton__row')).toHaveLength(2);
    expect(skeleton.find('.caller-skeleton-content').exists()).toBe(false);

    // <lang><zh-CN>caller 将 loading 切为 false 后只出现原始 slot，组件不保留或叠加陈旧占位。</zh-CN><en>After the caller sets loading to false, only the original slot appears and the component retains or overlays no stale placeholder.</en></lang>
    await skeleton.setProps({ loading: false });
    expect(skeleton.find('.u-skeleton__placeholder').exists()).toBe(false);
    expect(skeleton.get('.caller-skeleton-content').text()).toBe('Loaded content');
    expect(skeleton.emitted()).toEqual({});
  });

  /**
   * @lang zh-CN 验证负数、分数、超限、NaN、Infinity 与错误类型都确定性映射到有限行数，不抛错或 emit 修正。
   * @lang en Verifies negative, fractional, excessive, NaN, Infinity, and wrong-type values deterministically map to bounded row counts without throwing or emitting corrections.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；边界 prop 依次写入后解决。</zh-CN><en>No return value; resolves after boundary props are applied in sequence.</en></lang>
   */
  it('constrains every row candidate to a safe zero-through-eight projection', async () => {
    // <lang><zh-CN>从负数开始验证下界，组件不得尝试构造负长度数组。</zh-CN><en>Begins with a negative number to verify the lower bound; the component must not attempt to construct a negative-length array.</en></lang>
    const skeleton = mount(USkeleton, { props: { loading: true, rows: -3 } });
    expect(skeleton.findAll('.u-skeleton__row')).toHaveLength(0);

    // <lang><zh-CN>有限分数向零截断，保持调用方只得到完整占位行。</zh-CN><en>A finite fraction truncates toward zero so callers receive complete placeholder rows only.</en></lang>
    await skeleton.setProps({ rows: 3.9 });
    expect(skeleton.findAll('.u-skeleton__row')).toHaveLength(3);

    // <lang><zh-CN>超过上限的有限整数稳定收束为八行，防止输入创建无界 DOM。</zh-CN><en>A finite integer above the upper bound stabilizes at eight rows, preventing input from creating unbounded DOM.</en></lang>
    await skeleton.setProps({ rows: 99 });
    expect(skeleton.findAll('.u-skeleton__row')).toHaveLength(8);

    // <lang><zh-CN>NaN 与正/负 Infinity 都不是有效数量，统一回落零行而非被误判为上限。</zh-CN><en>NaN and positive/negative Infinity are not valid quantities and uniformly fall back to zero rows instead of being mistaken for the upper bound.</en></lang>
    await skeleton.setProps({ rows: Number.NaN });
    expect(skeleton.findAll('.u-skeleton__row')).toHaveLength(0);
    await skeleton.setProps({ rows: Number.POSITIVE_INFINITY });
    expect(skeleton.findAll('.u-skeleton__row')).toHaveLength(0);
    await skeleton.setProps({ rows: Number.NEGATIVE_INFINITY });
    expect(skeleton.findAll('.u-skeleton__row')).toHaveLength(0);

    // <lang><zh-CN>错误类型输入专门触发 Vue 开发期警告；临时 spy 只抑制该预期输出，不改变收到的 prop。</zh-CN><en>A wrong-type input intentionally triggers Vue's development warning; the temporary spy suppresses only that expected output and does not change the received prop.</en></lang>
    const warningSpy = vi.spyOn(console, 'warn').mockImplementation(ignoreExpectedPropWarning);
    await skeleton.setProps({ rows: 'invalid' });
    warningSpy.mockRestore();
    expect(skeleton.findAll('.u-skeleton__row')).toHaveLength(0);
    expect(skeleton.emitted()).toEqual({});
  });
});
