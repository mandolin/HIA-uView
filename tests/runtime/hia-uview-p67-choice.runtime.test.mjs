/**
 * @module hia-uview-p67-choice.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证 P67 choice/switch 的透明键、group 组合、label guard、有限 max 与 active/inactive 映射。测试不启动网络、存储、路由、表单、平台振动或业务服务。
 * @lang en Uses the real Vue runtime to verify P67 choice/switch transparent keys, group composition, label guards, finite max, and active/inactive mapping. Tests start no network, storage, routing, form, platform vibration, or business service.
 */

import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { UCheckbox, UCheckboxGroup, URadio, URadioGroup, USwitch } from '../../HIA-uView-UI/src/index.mjs';

/**
 * @lang zh-CN 把一次组件事件按实际回调顺序追加到测试日志；不改写 payload。
 * @lang en Appends one component event to a test log in actual callback order without rewriting its payload.
 * @param {Array<{type: string, payload: unknown}>} target <lang><zh-CN>当前测试拥有的顺序日志。</zh-CN><en>Ordered log owned by the current test.</en></lang>
 * @param {string} type <lang><zh-CN>稳定事件名。</zh-CN><en>Stable event name.</en></lang>
 * @param {unknown} payload <lang><zh-CN>组件原样交付的 payload。</zh-CN><en>Payload delivered unchanged by the component.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只追加一条本地观察。</zh-CN><en>No return value; appends one local observation only.</en></lang>
 */
function appendObservedEvent(target, type, payload) {
  // <lang><zh-CN>保留 payload 引用以验证 group 产生新数组而不是修改 caller 输入。</zh-CN><en>Preserves the payload reference so tests can verify groups create new arrays instead of mutating caller input.</en></lang>
  target.push({ type, payload });
}

/**
 * @lang zh-CN 验证 checkbox 族的三个 P0 mapped 表面及 name/labelDisabled/max P1 正反例。
 * @lang en Verifies the checkbox family's three P0 mapped surfaces and positive/negative P1 cases for name, labelDisabled, and max.
 */
describe('P67 controlled checkbox semantics', () => {
  /**
   * @lang zh-CN 验证显式 value 优先于 name，default slot 真实呈现，labelDisabled 只阻止 label，且 update 先于 change。
   * @lang en Verifies explicit value precedes name, the default slot renders, labelDisabled blocks only the label, and update precedes change.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；交互和断言完成后解决。</zh-CN><en>No return value; resolves after interactions and assertions complete.</en></lang>
   */
  it('keeps independent checkbox payload, slot, alias priority, and label guard exact', async () => {
    // <lang><zh-CN>顺序日志由测试拥有，可区分标准 update 与既有 change payload 的真实交付次序。</zh-CN><en>The test owns this ordered log so actual delivery order between standard update and the existing change payload remains observable.</en></lang>
    const eventOrder = [];

    // <lang><zh-CN>两个绑定 listener 只记录事件，不回写 prop 或执行业务逻辑。</zh-CN><en>The two bound listeners record events only and neither write props back nor execute business logic.</en></lang>
    const onUpdate = appendObservedEvent.bind(null, eventOrder, 'update:modelValue');
    const onChange = appendObservedEvent.bind(null, eventOrder, 'change');

    // <lang><zh-CN>显式空字符串 value 不得被 name 覆盖；slot 只提供调用方文字。</zh-CN><en>An explicit empty-string value must not be overridden by name; the slot provides caller copy only.</en></lang>
    const checkbox = mount(UCheckbox, {
      props: {
        value: '',
        name: 7,
        modelValue: true,
        labelDisabled: true,
        'onUpdate:modelValue': onUpdate,
        onChange
      },
      slots: { default: 'Caller checkbox slot' }
    });

    expect(checkbox.text()).toContain('Caller checkbox slot');

    // <lang><zh-CN>labelDisabled 使文字节点点击保持零事件，不依赖整体 button disabled。</zh-CN><en>LabelDisabled keeps a copy-node click at zero events without relying on whole-button disabled state.</en></lang>
    await checkbox.get('.u-checkbox__label').trigger('click');
    expect(eventOrder).toEqual([]);

    // <lang><zh-CN>点击 marker/control 根仍能发送下一布尔值和带显式空 value 的既有 payload。</zh-CN><en>Clicking the marker/control root still reports the next boolean and the existing payload with the explicit empty value.</en></lang>
    await checkbox.get('button.u-checkbox').trigger('click');
    expect(eventOrder).toEqual([
      { type: 'update:modelValue', payload: false },
      { type: 'change', payload: { value: '', checked: false } }
    ]);

    // <lang><zh-CN>缺省 value 的独立 checkbox 必须将数字 name 原样交付，不转换为字符串。</zh-CN><en>An independent checkbox with omitted value must deliver numeric name unchanged rather than converting it to a string.</en></lang>
    const nameFallback = mount(UCheckbox, { props: { name: 9 } });
    await nameFallback.get('button.u-checkbox').trigger('click');
    expect(nameFallback.emitted('change')).toEqual([[{ value: 9, checked: true }]]);

    // <lang><zh-CN>显式 disabled 仍是最外层 guard，根 control 直接触发也不产生事件。</zh-CN><en>Explicit disabled remains the outer guard, so direct root-control triggering also produces no events.</en></lang>
    const disabledCheckbox = mount(UCheckbox, { props: { name: 'blocked', disabled: true } });
    await disabledCheckbox.get('button.u-checkbox').trigger('click');
    expect(disabledCheckbox.emitted()).toEqual({});
  });

  /**
   * @lang zh-CN 验证 group model/default slot/update/change 的 P0 payload，以及 group labelDisabled 和“max 只限新增”边界。
   * @lang en Verifies group model/default-slot/update/change P0 payloads plus group labelDisabled and the max-limits-additions-only boundary.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；组合交互断言完成后解决。</zh-CN><en>No return value; resolves after composition interaction assertions complete.</en></lang>
   */
  it('keeps checkbox group immutable while max blocks additions but never removal', async () => {
    // <lang><zh-CN>冻结输入数组使任何意外 mutation 立即失败；group 必须创建新数组。</zh-CN><en>The frozen input array makes accidental mutation fail immediately; the group must create a new array.</en></lang>
    const initialValues = Object.freeze(['one']);

    // <lang><zh-CN>这个顺序日志仅捕获 group 事件，不回写 modelValue。</zh-CN><en>This ordered log captures group events only and does not write modelValue back.</en></lang>
    const eventOrder = [];
    const onUpdate = appendObservedEvent.bind(null, eventOrder, 'update:modelValue');
    const onChange = appendObservedEvent.bind(null, eventOrder, 'change');

    // <lang><zh-CN>测试壳仅组合一个 group 和两个使用 name 回退的 child，不安装 form/store。</zh-CN><en>The harness composes one group and two children using name fallback only and installs no form or store.</en></lang>
    const CheckboxGroupHarness = defineComponent({
      components: { UCheckbox, UCheckboxGroup },
      setup() {
        // <lang><zh-CN>只把冻结模型和两个无副作用 listener 暴露给私有模板。</zh-CN><en>Exposes only the frozen model and two side-effect-free listeners to the private template.</en></lang>
        return { initialValues, onUpdate, onChange };
      },
      template: '<u-checkbox-group :model-value="initialValues" max="1" :label-disabled="true" @update:model-value="onUpdate" @change="onChange"><u-checkbox name="one">One slot</u-checkbox><u-checkbox name="two">Two slot</u-checkbox></u-checkbox-group>'
    });

    // <lang><zh-CN>挂载后 default slot 文字和两个子 control 都必须存在。</zh-CN><en>After mounting, default-slot copy and both child controls must exist.</en></lang>
    const wrapper = mount(CheckboxGroupHarness);
    const checkboxes = wrapper.findAll('button.u-checkbox');
    expect(wrapper.text()).toContain('One slot');
    expect(wrapper.text()).toContain('Two slot');

    // <lang><zh-CN>group labelDisabled 阻止第二项 label，且 max=1 也阻止其 marker/control 新增。</zh-CN><en>Group labelDisabled blocks the second label, and max=1 also blocks its marker/control addition.</en></lang>
    await wrapper.findAll('.u-checkbox__label')[1].trigger('click');
    await checkboxes[1].trigger('click');
    expect(eventOrder).toEqual([]);

    // <lang><zh-CN>即使已达上限，点击已选第一项仍必须允许移除，并先 update 再 change。</zh-CN><en>Even at the limit, clicking the selected first item must allow removal and report update before change.</en></lang>
    await checkboxes[0].trigger('click');
    expect(initialValues).toEqual(['one']);
    expect(eventOrder).toHaveLength(2);
    expect(eventOrder[0]).toEqual({ type: 'update:modelValue', payload: [] });
    expect(eventOrder[1]).toEqual({ type: 'change', payload: [] });
    expect(eventOrder[0].payload).toBe(eventOrder[1].payload);
    expect(eventOrder[0].payload).not.toBe(initialValues);
  });
});

/**
 * @lang zh-CN 验证 radio 族的五个 P0 mapped 表面中事件/slot 部分，以及 name 回退和 child/group labelDisabled。
 * @lang en Verifies event/slot portions of the radio family's five P0 mapped surfaces plus name fallback and child/group labelDisabled.
 */
describe('P67 controlled radio semantics', () => {
  /**
   * @lang zh-CN 验证独立 radio 的 default slot、显式 value 优先、label guard 与 select/change 顺序。
   * @lang en Verifies independent-radio default slot, explicit-value priority, label guard, and select/change order.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；交互断言完成后解决。</zh-CN><en>No return value; resolves after interaction assertions complete.</en></lang>
   */
  it('keeps independent radio non-cancellable with exact slot and payload order', async () => {
    // <lang><zh-CN>顺序日志同时观察既有 select 和迁移 change，不写回 checked。</zh-CN><en>The ordered log observes existing select and migration change together without writing checked back.</en></lang>
    const eventOrder = [];
    const onSelect = appendObservedEvent.bind(null, eventOrder, 'select');
    const onChange = appendObservedEvent.bind(null, eventOrder, 'change');

    // <lang><zh-CN>显式空 value 必须压过数字 name，labelDisabled 只阻止 slot 文字点击。</zh-CN><en>An explicit empty value must override numeric name, while labelDisabled blocks only slot-copy clicks.</en></lang>
    const radio = mount(URadio, {
      props: { value: '', name: 3, labelDisabled: true, onSelect, onChange },
      slots: { default: 'Caller radio slot' }
    });

    expect(radio.text()).toContain('Caller radio slot');
    await radio.get('.u-radio__label').trigger('click');
    expect(eventOrder).toEqual([]);

    // <lang><zh-CN>根 control 点击按既有 select→change 顺序交付显式空 value。</zh-CN><en>A root-control click delivers the explicit empty value in the existing select→change order.</en></lang>
    await radio.get('button.u-radio').trigger('click');
    expect(eventOrder).toEqual([
      { type: 'select', payload: '' },
      { type: 'change', payload: '' }
    ]);

    // <lang><zh-CN>缺省 value 时使用数字 name；已选 radio 仍不可因再次点击取消。</zh-CN><en>Numeric name is used when value is omitted; an already-selected radio remains non-cancellable on another click.</en></lang>
    const selectedNameFallback = mount(URadio, { props: { name: 4, checked: true } });
    await selectedNameFallback.get('button.u-radio').trigger('click');
    expect(selectedNameFallback.emitted('select')).toBeUndefined();
    expect(selectedNameFallback.emitted('change')).toBeUndefined();
  });

  /**
   * @lang zh-CN 验证 radio-group 的 model/default slot/update/change payload，以及 group labelDisabled 不禁用 marker/control。
   * @lang en Verifies radio-group model/default-slot/update/change payloads and that group labelDisabled does not disable marker/control.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；组合交互断言完成后解决。</zh-CN><en>No return value; resolves after composition interaction assertions complete.</en></lang>
   */
  it('keeps radio group payload controlled while group labelDisabled blocks labels only', async () => {
    // <lang><zh-CN>顺序日志仅捕获 group 的标准 update 和 change，不修改受控 model。</zh-CN><en>The ordered log captures only standard group update and change without modifying the controlled model.</en></lang>
    const eventOrder = [];
    const onUpdate = appendObservedEvent.bind(null, eventOrder, 'update:modelValue');
    const onChange = appendObservedEvent.bind(null, eventOrder, 'change');

    // <lang><zh-CN>测试壳用数字 name 回退组合两项，保留严格数值类型。</zh-CN><en>The harness composes two entries through numeric name fallback, preserving strict numeric value types.</en></lang>
    const RadioGroupHarness = defineComponent({
      components: { URadio, URadioGroup },
      setup() {
        // <lang><zh-CN>当前模型和 listener 仅暴露给私有模板，不安装其他运行时。</zh-CN><en>The current model and listeners are exposed only to the private template and install no other runtime.</en></lang>
        return { currentValue: 1, onUpdate, onChange };
      },
      template: '<u-radio-group :model-value="currentValue" :label-disabled="true" @update:model-value="onUpdate" @change="onChange"><u-radio :name="1">One slot</u-radio><u-radio :name="2">Two slot</u-radio></u-radio-group>'
    });

    // <lang><zh-CN>挂载后先观察 default slots，再分别测试 label 与 marker/control 路径。</zh-CN><en>After mounting, observes default slots first and then tests label and marker/control paths separately.</en></lang>
    const wrapper = mount(RadioGroupHarness);
    const radios = wrapper.findAll('button.u-radio');
    expect(wrapper.text()).toContain('One slot');
    expect(wrapper.text()).toContain('Two slot');

    // <lang><zh-CN>group labelDisabled 使第二项文字点击保持零事件。</zh-CN><en>Group labelDisabled keeps the second copy click at zero events.</en></lang>
    await wrapper.findAll('.u-radio__label')[1].trigger('click');
    expect(eventOrder).toEqual([]);

    // <lang><zh-CN>第二项 marker/control 仍可选，并以 update→change 顺序交付数字 2。</zh-CN><en>The second marker/control remains selectable and delivers numeric 2 in update→change order.</en></lang>
    await radios[1].trigger('click');
    expect(eventOrder).toEqual([
      { type: 'update:modelValue', payload: 2 },
      { type: 'change', payload: 2 }
    ]);

    // <lang><zh-CN>已选第一项不会因重复点击产生新事件，保持 radio 不可取消。</zh-CN><en>Clicking the already-selected first item adds no event, retaining the non-cancellable radio invariant.</en></lang>
    await radios[0].trigger('click');
    expect(eventOrder).toHaveLength(2);
  });
});

/**
 * @lang zh-CN 验证 switch 的三个 P0 mapped 值/事件表面及 activeValue/inactiveValue P1 映射和失败 guard。
 * @lang en Verifies the switch's three P0 mapped value/event surfaces plus P1 activeValue/inactiveValue mapping and failure guards.
 */
describe('P67 controlled switch semantics', () => {
  /**
   * @lang zh-CN 验证 native boolean 原样映射 caller 值、update/change 顺序，以及未知 payload/disabled/loading 零事件。
   * @lang en Verifies native booleans map to caller values unchanged, update/change ordering, and zero events for unknown payload, disabled, or loading.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；交互断言完成后解决。</zh-CN><en>No return value; resolves after interaction assertions complete.</en></lang>
   */
  it('maps native booleans to caller values and rejects guarded or malformed changes', async () => {
    // <lang><zh-CN>顺序日志用于确认标准 model update 在 change 之前交付同一透明值。</zh-CN><en>The ordered log confirms the standard model update delivers the same transparent value before change.</en></lang>
    const eventOrder = [];
    const onUpdate = appendObservedEvent.bind(null, eventOrder, 'update:modelValue');
    const onChange = appendObservedEvent.bind(null, eventOrder, 'change');

    // <lang><zh-CN>数字 inactive 和字符串 active 不能被转换或混淆。</zh-CN><en>Numeric inactive and string active values must be neither converted nor conflated.</en></lang>
    const controlledSwitch = mount(USwitch, {
      props: {
        modelValue: 0,
        activeValue: 'enabled',
        inactiveValue: 0,
        'onUpdate:modelValue': onUpdate,
        onChange
      }
    });

    // <lang><zh-CN>原生 true 交付字符串 active 值，并保持 update→change 顺序。</zh-CN><en>Native true delivers the string active value while preserving update→change order.</en></lang>
    await controlledSwitch.get('switch').trigger('change', { detail: { value: true } });
    expect(eventOrder).toEqual([
      { type: 'update:modelValue', payload: 'enabled' },
      { type: 'change', payload: 'enabled' }
    ]);

    // <lang><zh-CN>字符串形状的伪布尔 payload 不可被猜测，因此事件数不变。</zh-CN><en>A string-shaped pseudo-boolean payload must not be guessed, so the event count remains unchanged.</en></lang>
    await controlledSwitch.get('switch').trigger('change', { detail: { value: 'true' } });
    expect(eventOrder).toHaveLength(2);

    // <lang><zh-CN>loading 设置后即使直接触发 handler，也必须保持零新事件。</zh-CN><en>After loading is set, even a direct handler trigger must add zero events.</en></lang>
    await controlledSwitch.setProps({ loading: true });
    await controlledSwitch.get('switch').trigger('change', { detail: { value: false } });
    expect(eventOrder).toHaveLength(2);

    // <lang><zh-CN>独立 disabled 实例覆盖布尔默认兼容路径，不产生任何事件。</zh-CN><en>A separate disabled instance covers the boolean-default compatibility path and produces no event.</en></lang>
    const disabledSwitch = mount(USwitch, { props: { modelValue: false, disabled: true } });
    await disabledSwitch.get('switch').trigger('change', { detail: { value: true } });
    expect(disabledSwitch.emitted()).toEqual({});

    // <lang><zh-CN>启用的默认布尔实例仍交付 true，保持已有 consumer 契约。</zh-CN><en>An enabled default-boolean instance still delivers true, preserving the existing consumer contract.</en></lang>
    const booleanSwitch = mount(USwitch, { props: { modelValue: false } });
    await booleanSwitch.get('switch').trigger('change', { detail: { value: true } });
    expect(booleanSwitch.emitted('update:modelValue')).toEqual([[true]]);
    expect(booleanSwitch.emitted('change')).toEqual([[true]]);
  });
});
