/**
 * @module hia-uview-p67-picker-calendar-select.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证 P67 有限 picker、Gregorian calendar 与 inline select 状态机。测试不启动 popup、节点测量、定时器、地区/农历数据、网络、路由、存储或平台 API，也不替代小程序 DevTools 或真机证据。
 * @lang en Uses the real Vue runtime to verify the P67 finite picker, Gregorian calendar, and inline select state machines. Tests start no popup, node measurement, timer, region/lunar data, network, routing, storage, or platform API and do not replace Mini Program DevTools or device evidence.
 */

// <lang><zh-CN>导入本地 Vue 挂载器、断言和三个真实组件；不安装全局 plugin 或平台 mock。</zh-CN><en>Imports the local Vue mount harness, assertions, and three real components; no global plugin or platform mock is installed.</en></lang>
import { ref } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { UCalendar, UPicker, USelect } from '../../HIA-uView-UI/src/index.mjs';
import { U_LOCALE_CONTEXT } from '../../HIA-uView-UI/src/config-locale.mjs';

/**
 * @lang zh-CN 按可见文字取得唯一按钮，使测试不依赖日历前导空格或 option 外层位置。
 * @lang en Obtains one button by visible text so tests do not depend on calendar leading blanks or outer option position.
 * @param {object} wrapper <lang><zh-CN>当前组件 wrapper。</zh-CN><en>Current component wrapper.</en></lang>
 * @param {string} selector <lang><zh-CN>受限按钮 selector。</zh-CN><en>Constrained button selector.</en></lang>
 * @param {string} text <lang><zh-CN>完整可见文字。</zh-CN><en>Complete visible text.</en></lang>
 * @returns {object} <lang><zh-CN>匹配按钮。</zh-CN><en>Matching button.</en></lang>
 */
function buttonByText(wrapper, selector, text) {
  // <lang><zh-CN>找不到时让 expect 提供明确失败，而不静默选中其他节点。</zh-CN><en>When absent, expect provides an explicit failure instead of silently selecting another node.</en></lang>
  const button = wrapper.findAll(selector).find((candidate) => candidate.text() === text);
  expect(button, `Missing button ${selector} with text ${text}`).toBeDefined();
  return button;
}

/** @lang zh-CN 验证 picker 多列草稿、重复值、结构化事件与 preserveSelection。 @lang en Verifies picker multi-column draft, duplicate values, structured events, and preserveSelection. */
describe('P67 picker finite draft state', () => {
  /**
   * @lang zh-CN 验证 columns 优先、首个 enabled 重复、columnchange 快照、确认顺序与列变更保留。
   * @lang en Verifies columns precedence, first-enabled duplicate resolution, columnchange snapshots, confirmation order, and preservation across column changes.
   * @returns {Promise<void>} <lang><zh-CN>Vue 交互和 prop 更新完成后解决。</zh-CN><en>Resolves after Vue interactions and prop updates complete.</en></lang>
   */
  it('commits a complete multi-column snapshot only after confirmation', async () => {
    // <lang><zh-CN>两列原始 option 保留引用，便于证明结果不伪造 caller option。</zh-CN><en>Raw options in two columns retain references so the result can prove it does not fabricate caller options.</en></lang>
    const enabledDuplicate = Object.freeze({ label: 'Enabled A', value: 'a' });
    const secondValue = Object.freeze({ label: 'Two', value: 2 });
    const columns = Object.freeze([
      Object.freeze([{ label: 'Disabled A', value: 'a', disabled: true }, enabledDuplicate, { label: 'B', value: 'b' }]),
      Object.freeze([{ label: 'One', value: 1 }, secondValue])
    ]);

    // <lang><zh-CN>跨事件顺序数组由 caller listener 填充，不读取组件私有 ref。</zh-CN><en>A caller listener fills the cross-event order array without reading private component refs.</en></lang>
    const eventOrder = [];
    const picker = mount(UPicker, {
      props: {
        modelValue: ['a', 1],
        columns,
        range: ['range-must-not-win'],
        title: 'Caller title',
        'onUpdate:modelValue': (value) => eventOrder.push(['update', value]),
        onConfirm: (result) => eventOrder.push(['confirm', result])
      },
      slots: {
        // <lang><zh-CN>title slot 使用受限 title slot-prop，不接触草稿或 option 内部状态。</zh-CN><en>The title slot uses the constrained title slot prop and accesses no draft or option internals.</en></lang>
        title: ({ title }) => `Slot: ${title}`
      }
    });

    // <lang><zh-CN>列数和 title slot 证明 columns 压过 range，且没有 popup 被隐式安装。</zh-CN><en>Column count and the title slot prove columns override range and no popup is implicitly installed.</en></lang>
    const renderedColumns = picker.findAll('.u-picker__column');
    expect(renderedColumns).toHaveLength(2);
    expect(picker.text()).toContain('Slot: Caller title');
    expect(picker.text()).not.toContain('range-must-not-win');
    expect(picker.find('.u-popup').exists()).toBe(false);

    // <lang><zh-CN>初始 a 必须跳过禁用重复项，严格选中第一个 enabled a。</zh-CN><en>Initial a must skip the disabled duplicate and strictly select the first enabled a.</en></lang>
    expect(renderedColumns[0].findAll('.u-picker__option')[1].classes()).toContain('u-picker__option--selected');

    // <lang><zh-CN>更改第二列只发 columnchange，完整快照应同时保留第一列选择。</zh-CN><en>Changing the second column emits columnchange only, and its complete snapshot retains the first-column selection.</en></lang>
    await renderedColumns[1].findAll('.u-picker__option')[1].trigger('click');
    expect(picker.emitted('update:modelValue')).toBeUndefined();
    expect(picker.emitted('columnchange')).toEqual([[
      {
        column: 1,
        index: 1,
        value: 2,
        option: secondValue,
        values: ['a', 2],
        indexes: [1, 1],
        options: [enabledDuplicate, secondValue]
      }
    ]]);

    // <lang><zh-CN>确认先请求 caller model 写回，再发出包含四个固定字段的 confirm 快照。</zh-CN><en>Confirmation requests caller-model writeback first, then emits a confirm snapshot containing the four fixed fields.</en></lang>
    await picker.get('.u-picker__action--confirm').trigger('click');
    expect(eventOrder).toEqual([
      ['update', ['a', 2]],
      ['confirm', { value: ['a', 2], values: ['a', 2], indexes: [1, 1], options: [enabledDuplicate, secondValue] }]
    ]);

    // <lang><zh-CN>新列在前方插入 option 后，preserveSelection 应按值重新定位已确认 2，而不沿用旧索引。</zh-CN><en>After an option is inserted before the new column, preserveSelection relocates confirmed 2 by value rather than reusing its old index.</en></lang>
    const updatedColumns = Object.freeze([columns[0], Object.freeze([{ label: 'Zero', value: 0 }, ...columns[1]])]);
    await picker.setProps({ columns: updatedColumns });
    expect(picker.findAll('.u-picker__column')[1].findAll('.u-picker__option')[2].classes()).toContain('u-picker__option--selected');

    // <lang><zh-CN>显式关闭保留后，草稿立即回到未改写的 caller model 第二列值 1。</zh-CN><en>After preservation is explicitly disabled, the draft immediately returns to the unchanged caller-model second-column value 1.</en></lang>
    await picker.setProps({ preserveSelection: false });
    expect(picker.findAll('.u-picker__column')[1].findAll('.u-picker__option')[1].classes()).toContain('u-picker__option--selected');
  });

  /**
   * @lang zh-CN 验证 range/rangeKey 只读自有浅层字段，且取消保留无法解析的 caller 顶层快照。
   * @lang en Verifies range/rangeKey reads own shallow fields only and cancellation preserves an unresolved caller top-level snapshot.
   * @returns {Promise<void>} <lang><zh-CN>Vue 交互完成后解决。</zh-CN><en>Resolves after Vue interactions complete.</en></lang>
   */
  it('keeps rangeKey shallow and reports unresolved cancellation honestly', async () => {
    // <lang><zh-CN>原型 code 故意不是自有字段，可见文字必须回退到自有 label。</zh-CN><en>The prototype code is deliberately not an own field, so visible copy must fall back to the own label.</en></lang>
    const inherited = Object.create({ code: 'Prototype code must stay hidden' });
    inherited.label = 'Fallback label';
    inherited.value = 'fallback';
    const picker = mount(UPicker, {
      props: {
        modelValue: 'orphan',
        range: [{ code: 'Own code', value: 'own' }, inherited],
        rangeKey: 'code'
      }
    });

    expect(picker.text()).toContain('Own code');
    expect(picker.text()).toContain('Fallback label');
    expect(picker.text()).not.toContain('Prototype code must stay hidden');

    // <lang><zh-CN>取消不猜测第一项：顶层 value 保留 orphan，列解析字段明确为 null/-1。</zh-CN><en>Cancellation does not guess the first item: top-level value retains orphan while column-resolution fields explicitly use null/-1.</en></lang>
    await picker.get('.u-picker__action').trigger('click');
    expect(picker.emitted('cancel')).toEqual([[
      { value: 'orphan', values: [null], indexes: [-1], options: [null] }
    ]]);
  });
});

/** @lang zh-CN 验证 calendar 严格本地 Gregorian 边界、locale/caller 星期与事件顺序。 @lang en Verifies calendar strict local-Gregorian bounds, locale/caller weekdays, and event order. */
describe('P67 calendar Gregorian state', () => {
  /**
   * @lang zh-CN 验证显式 today、English locale、本地月份导航与四事件选择顺序。
   * @lang en Verifies explicit today, English locale, local month navigation, and four-event selection order.
   * @returns {Promise<void>} <lang><zh-CN>Vue 交互完成后解决。</zh-CN><en>Resolves after Vue interactions complete.</en></lang>
   */
  it('uses local fields and emits one valid date in a fixed order', async () => {
    // <lang><zh-CN>事件 listener 直接记录公开 payload，不访问组件内部 Date 或网格结构。</zh-CN><en>Event listeners record public payloads directly and access no internal Date or grid structure.</en></lang>
    const eventOrder = [];
    const calendar = mount(UCalendar, {
      props: {
        modelValue: '2024-03-10',
        viewDate: '2024-03-01',
        minDate: '2024-03-01',
        maxDate: '2024-03-31',
        today: '2024-03-15',
        'onUpdate:modelValue': (value) => eventOrder.push(['update', value]),
        onInput: (value) => eventOrder.push(['input', value]),
        onChange: (value) => eventOrder.push(['change', value]),
        onSelect: (value) => eventOrder.push(['select', value]),
        'onUpdate:viewDate': (value) => eventOrder.push(['view', value])
      },
      global: {
        // <lang><zh-CN>测试显式注入受限 English locale ref，不从当前机器环境推导。</zh-CN><en>The test explicitly injects the constrained English locale ref rather than inferring it from the current machine.</en></lang>
        provide: { [U_LOCALE_CONTEXT]: Object.freeze({ locale: ref('en') }) }
      }
    });

    expect(calendar.findAll('.u-calendar__week-label').map((label) => label.text())).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    expect(buttonByText(calendar, '.u-calendar__day', '15').classes()).toContain('u-calendar__day--today');

    // <lang><zh-CN>一次合法选择先写 model/input，再发纯 Gregorian change 和旧 select 标量。</zh-CN><en>One valid selection writes model/input first, then emits a Gregorian-only change and the legacy select scalar.</en></lang>
    await buttonByText(calendar, '.u-calendar__day', '20').trigger('click');
    expect(eventOrder).toEqual([
      ['update', '2024-03-20'],
      ['input', '2024-03-20'],
      ['change', { value: '2024-03-20', year: 2024, month: 3, day: 20 }],
      ['select', '2024-03-20']
    ]);

    // <lang><zh-CN>相邻月导航只报告本地字段构造的月首日，不携带 ISO 时间或时区。</zh-CN><en>Adjacent-month navigation reports only a month-first date built from local fields and carries no ISO time or zone.</en></lang>
    await calendar.findAll('.u-calendar__nav')[1].trigger('click');
    expect(eventOrder.at(-1)).toEqual(['view', '2024-04-01']);
  });

  /**
   * @lang zh-CN 验证 readonly、反向/非法边界、disabledDates 均使值选择保持零事件，caller 星期则整体覆盖 locale。
   * @lang en Verifies readonly, reversed/invalid bounds, and disabledDates keep value selection at zero events while caller weekdays wholly override locale.
   * @returns {Promise<void>} <lang><zh-CN>Vue 交互完成后解决。</zh-CN><en>Resolves after Vue interactions complete.</en></lang>
   */
  it('keeps invalid and readonly date boundaries at zero value events', async () => {
    // <lang><zh-CN>caller 的七项文字集合不与默认中英文混排。</zh-CN><en>The caller's seven-label set is never mixed with default Chinese or English copy.</en></lang>
    const callerLabels = Object.freeze(['0', '1', '2', '3', '4', '5', '6']);
    const readonlyCalendar = mount(UCalendar, {
      props: { viewDate: '2024-03-01', today: '2024-03-15', readonly: true, weekLabels: callerLabels }
    });
    expect(readonlyCalendar.findAll('.u-calendar__week-label').map((label) => label.text())).toEqual(callerLabels);
    await buttonByText(readonlyCalendar, '.u-calendar__day', '15').trigger('click');
    expect(readonlyCalendar.emitted()).toEqual({});

    // <lang><zh-CN>反向边界不被交换，所有日期按钮均不可提交。</zh-CN><en>Reversed bounds are not swapped, and every date button is non-committable.</en></lang>
    const reversed = mount(UCalendar, { props: { viewDate: '2024-03-01', today: '2024-03-15', minDate: '2024-03-20', maxDate: '2024-03-10' } });
    await buttonByText(reversed, '.u-calendar__day', '15').trigger('click');
    expect(reversed.emitted()).toEqual({});
    expect(reversed.findAll('.u-calendar__day').every((button) => button.attributes('disabled') !== undefined)).toBe(true);

    // <lang><zh-CN>非法溢出 minDate 同样使边界失效，不让 Date 自动进位到下月。</zh-CN><en>An invalid overflow minDate likewise invalidates bounds and never lets Date roll it into the next month.</en></lang>
    const invalid = mount(UCalendar, { props: { viewDate: '2024-03-01', today: '2024-03-15', minDate: '2024-02-30' } });
    await buttonByText(invalid, '.u-calendar__day', '15').trigger('click');
    expect(invalid.emitted()).toEqual({});

    // <lang><zh-CN>单个 disabledDates 只阻止对应合法日期，其 handler 同样不发任何值事件。</zh-CN><en>One disabledDates entry blocks only that valid day, and its handler likewise emits no value event.</en></lang>
    const disabled = mount(UCalendar, { props: { viewDate: '2024-03-01', today: '2024-03-15', disabledDates: ['2024-03-15'] } });
    await buttonByText(disabled, '.u-calendar__day', '15').trigger('click');
    expect(disabled.emitted()).toEqual({});
  });
});

/** @lang zh-CN 验证 select 的 inline open、立即/确定模式、草稿及 orphan cancel 快照。 @lang en Verifies select inline open, immediate/confirm modes, draft state, and orphan cancellation snapshots. */
describe('P67 select inline state', () => {
  /**
   * @lang zh-CN 验证原始 click 事件打开 inline panel，立即选择按 model/change 顺序提交。
   * @lang en Verifies a raw click event opens the inline panel and immediate selection commits in model/change order.
   * @returns {Promise<void>} <lang><zh-CN>Vue 交互完成后解决。</zh-CN><en>Resolves after Vue interactions complete.</en></lang>
   */
  it('keeps immediate selection inline and caller-controlled', async () => {
    // <lang><zh-CN>重复 x 的首项禁用，用于验证 model 显示解析跳到第一个 enabled 匹配。</zh-CN><en>The first duplicate x is disabled so model display resolution must skip to the first enabled match.</en></lang>
    const options = Object.freeze([
      { label: 'Disabled X', value: 'x', disabled: true },
      { label: 'Enabled X', value: 'x' },
      { label: 'Y', value: 'y' }
    ]);
    const eventOrder = [];
    const select = mount(USelect, {
      props: {
        modelValue: 'x',
        options,
        onClick: (event) => eventOrder.push(['click', event]),
        'onUpdate:modelValue': (value) => eventOrder.push(['update', value]),
        onChange: (value) => eventOrder.push(['change', value])
      }
    });

    expect(select.text()).toContain('Enabled X');
    expect(select.find('.u-select__panel').exists()).toBe(false);
    await select.get('.u-select__trigger').trigger('click');
    expect(select.find('.u-select__panel').exists()).toBe(true);
    expect(eventOrder[0][0]).toBe('click');
    expect(eventOrder[0][1]).toBeInstanceOf(Event);

    // <lang><zh-CN>选择 Y 先关闭 panel，再按 model/change 顺序报告标量，不伪造 confirm。</zh-CN><en>Selecting Y closes the panel first, then reports a scalar in model/change order without fabricating confirm.</en></lang>
    await buttonByText(select, '.u-select__option', 'Y').trigger('click');
    expect(select.find('.u-select__panel').exists()).toBe(false);
    expect(eventOrder.slice(1)).toEqual([['update', 'y'], ['change', 'y']]);
    expect(select.emitted('confirm')).toBeUndefined();
  });

  /**
   * @lang zh-CN 验证 confirm 模式只保存草稿，确定时发结构化快照，取消 orphan 时保留 caller value。
   * @lang en Verifies confirm mode stores draft only, emits a structured snapshot on confirmation, and preserves caller value when cancelling an orphan.
   * @returns {Promise<void>} <lang><zh-CN>Vue 交互和 prop 更新完成后解决。</zh-CN><en>Resolves after Vue interactions and prop updates complete.</en></lang>
   */
  it('separates confirm draft from cancellation restore', async () => {
    // <lang><zh-CN>记录三个提交事件的跨名称顺序，click/cancel 另通过 wrapper emitted 断言。</zh-CN><en>Records cross-name order for three commit events while click/cancel are asserted separately through wrapper emissions.</en></lang>
    const eventOrder = [];
    const optionA = Object.freeze({ label: 'A', value: 'a' });
    const optionB = Object.freeze({ label: 'B', value: 'b' });
    const select = mount(USelect, {
      props: {
        modelValue: 'a',
        options: [optionA, optionB],
        confirmMode: true,
        'onUpdate:modelValue': (value) => eventOrder.push(['update', value]),
        onChange: (value) => eventOrder.push(['change', value]),
        onConfirm: (value) => eventOrder.push(['confirm', value])
      }
    });

    await select.get('.u-select__trigger').trigger('click');
    await buttonByText(select, '.u-select__option', 'B').trigger('click');
    expect(eventOrder).toEqual([]);
    expect(buttonByText(select, '.u-select__option', 'B').classes()).toContain('u-select__option--selected');

    // <lang><zh-CN>确定后顺序为 update、change、confirm，最后一项保留原始 caller option 引用。</zh-CN><en>After confirmation the order is update, change, confirm, and the last item retains the raw caller-option reference.</en></lang>
    await select.get('.u-select__action--confirm').trigger('click');
    expect(eventOrder).toEqual([
      ['update', 'b'],
      ['change', 'b'],
      ['confirm', { value: 'b', index: 1, option: optionB }]
    ]);

    // <lang><zh-CN>把 caller model 更为 options 外的 orphan，再选择 B 后取消；取消不发新值事件。</zh-CN><en>Changes the caller model to an orphan outside options, then selects B and cancels; cancellation emits no new value event.</en></lang>
    eventOrder.length = 0;
    await select.setProps({ modelValue: 'orphan' });
    await select.get('.u-select__trigger').trigger('click');
    await buttonByText(select, '.u-select__option', 'B').trigger('click');
    await select.get('.u-select__action:not(.u-select__action--confirm)').trigger('click');
    expect(eventOrder).toEqual([]);
    expect(select.emitted('cancel').at(-1)).toEqual([{ value: 'orphan', index: -1, option: null }]);
    expect(select.find('.u-select__panel').exists()).toBe(false);

    // <lang><zh-CN>空 caller placeholder 由默认 zh-Hans locale 生成单语文字，不再中英混排。</zh-CN><en>An empty caller placeholder uses single-language copy from default zh-Hans locale and no longer mixes Chinese and English.</en></lang>
    const emptySelect = mount(USelect);
    expect(emptySelect.text()).toBe('请选择');
    expect(emptySelect.text()).not.toContain('Select');
  });
});
