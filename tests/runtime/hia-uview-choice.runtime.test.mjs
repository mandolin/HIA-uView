/**
 * @module hia-uview-choice.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证 P16 受控 radio/checkbox 与 group 只 emit 调用方状态意图。测试不启动网络、路由、存储、picker、popup、Tool 或平台导航，也不替代 compiler、DevTools 或真机证据。
 * @lang en Uses real Vue runtime to verify P16 controlled radio/checkbox and groups emit caller state intent only. Tests start no network, routing, storage, picker, popup, Tool, or platform navigation and do not replace compiler, DevTools, or device evidence.
 */
import { defineComponent, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { UCheckbox, UCheckboxGroup, URadio, URadioGroup, USwitch } from '../../HIA-uView-UI/src/index.mjs';

/** @lang zh-CN 验证单选与多选 group 由父页面写回 value/新数组，且已选 radio 不会取消。 @lang en Verifies radio and checkbox groups are written back by parent page with value/new array and selected radio does not cancel. */
describe('controlled choice runtime behavior', () => {
  /** @lang zh-CN 验证 radio group 选择和 checkbox group 新数组均只作为 emit/writeback 流动。 @lang en Verifies radio selection and checkbox new arrays flow only as emit/writeback. @returns {Promise<void>} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang> */
  it('delegates radio and checkbox writeback to the caller', async () => {
    // <lang><zh-CN>测试壳拥有两个受控 ref；它不安装 store、form、router 或业务逻辑。</zh-CN><en>The test shell owns two controlled refs and installs no store, form, router, or business logic.</en></lang>
    const Harness = defineComponent({
      components: { URadio, URadioGroup, UCheckbox, UCheckboxGroup },
      setup() {
        // <lang><zh-CN>radio 初始值明确为 a，以测试重复点击不取消当前单选。</zh-CN><en>The radio starts explicitly at a so the test can verify that a repeated click does not cancel current single selection.</en></lang>
        const radioValue = ref('a');

        // <lang><zh-CN>checkbox 初始数组只有 one，以验证 group 写回的是追加/移除后的新数组。</zh-CN><en>The checkbox starts with an array containing only one so the test can verify that group writeback uses appended/removed next arrays.</en></lang>
        const checkboxValues = ref(['one']);
        return { radioValue, checkboxValues };
      },
      template: '<u-radio-group :model-value="radioValue" @update:model-value="radioValue = $event"><u-radio value="a" label="A" /><u-radio value="b" label="B" /></u-radio-group><u-checkbox-group :model-value="checkboxValues" @update:model-value="checkboxValues = $event"><u-checkbox value="one" label="One" /><u-checkbox value="two" label="Two" /></u-checkbox-group>'
    });

    // <lang><zh-CN>挂载私有 Vue/jsdom 壳；该证据不包含 UniApp compiler、DevTools、设备或读屏。</zh-CN><en>Mounts the private Vue/jsdom shell; this evidence includes no UniApp compiler, DevTools, device, or screen reader.</en></lang>
    const wrapper = mount(Harness);

    // <lang><zh-CN>按公开 BEM 根类读取两个 radio 和两个 checkbox，测试当前本地呈现树而非全局 document。</zh-CN><en>Reads the two radios and two checkboxes by public BEM root classes, testing the current local presentation tree rather than a global document.</en></lang>
    const radios = wrapper.findAll('.u-radio');
    const checkboxes = wrapper.findAll('.u-checkbox');

    // <lang><zh-CN>点击已选 radio 后值保持 a，验证 radio 不能通过第二次点击取消。</zh-CN><en>Clicking the selected radio keeps value a, verifying a radio cannot cancel through a second click.</en></lang>
    await radios[0].trigger('click');
    expect(wrapper.vm.radioValue).toBe('a');

    // <lang><zh-CN>点击另一个 radio 仅通过父级 writeback 把值改为 b。</zh-CN><en>Clicking the other radio changes the value to b only through parent writeback.</en></lang>
    await radios[1].trigger('click');
    expect(wrapper.vm.radioValue).toBe('b');

    // <lang><zh-CN>勾选 two 后父级收到包含 one/two 的下一数组，而不是 mutation 既有 prop。</zh-CN><en>After checking two, the parent receives a next array containing one/two rather than a mutation of an existing prop.</en></lang>
    await checkboxes[1].trigger('click');
    expect(wrapper.vm.checkboxValues).toEqual(['one', 'two']);

    // <lang><zh-CN>取消 one 后父级只保留 two，验证反向成员转换同样通过新数组流动。</zh-CN><en>After unchecking one, the parent retains only two, verifying reverse membership transition also flows through a new array.</en></lang>
    await checkboxes[0].trigger('click');
    expect(wrapper.vm.checkboxValues).toEqual(['two']);
  });

  /** @lang zh-CN 验证 P61 的独立 checkbox/radio 迁移入口保持调用方写回、数值键和 default-slot 边界。 @lang en Verifies P61 independent checkbox/radio migration entries retain caller writeback, numeric keys, and default-slot boundaries. @returns {Promise<void>} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang> */
  it('keeps independent migration aliases local and controlled', async () => {
    // <lang><zh-CN>独立 checkbox 只接收页面拥有的 modelValue 和透明数字 value；不存在 group、form、router 或业务 state。</zh-CN><en>The independent checkbox receives only page-owned modelValue and transparent numeric value; no group, form, router, or business state exists.</en></lang>
    const checkbox = mount(UCheckbox, {
      props: { modelValue: true, value: 7, label: 'Fallback label' },
      slots: { default: 'Slot label' }
    });

    // <lang><zh-CN>slot 必须替代 fallback label，且受控 true 呈现为 checked；这不证明 scoped-slot 或无障碍树行为。</zh-CN><en>The slot must replace fallback label and controlled true must render checked; this proves neither scoped-slot nor accessibility-tree behavior.</en></lang>
    expect(checkbox.text()).toContain('Slot label');
    expect(checkbox.find('.u-checkbox').classes()).toContain('u-checkbox--checked');

    // <lang><zh-CN>点击仅报告下一布尔值和既有透明 payload；wrapper 不把 emitted 值写回 prop。</zh-CN><en>Clicking reports only the next boolean and existing transparent payload; the wrapper does not write emitted values back to a prop.</en></lang>
    await checkbox.find('.u-checkbox').trigger('click');
    expect(checkbox.emitted('update:modelValue')).toEqual([[false]]);
    expect(checkbox.emitted('change')).toEqual([[{ value: 7, checked: false }]]);

    // <lang><zh-CN>显式 checked alias 必须优先于 modelValue，保留现有 HIA consumer 的可预测升级路径。</zh-CN><en>An explicit checked alias must take precedence over modelValue, preserving a predictable upgrade path for existing HIA consumers.</en></lang>
    await checkbox.setProps({ checked: false });
    expect(checkbox.find('.u-checkbox').classes()).not.toContain('u-checkbox--checked');

    // <lang><zh-CN>非空 disabled 字符串必须阻止直接 handler 路径，不能只依赖原生按钮属性。</zh-CN><en>A nonempty disabled string must block the direct handler path and cannot rely only on the native button attribute.</en></lang>
    const disabledCheckbox = mount(UCheckbox, { props: { disabled: 'disabled' } });
    await disabledCheckbox.find('.u-checkbox').trigger('click');
    expect(disabledCheckbox.emitted()).toEqual({});

    // <lang><zh-CN>数值 radio group 验证同值类型和精确相等被保留，父页面仍是唯一 model 写回者。</zh-CN><en>The numeric radio group verifies same-value types and exact equality are retained while the parent page remains the sole model writer.</en></lang>
    const NumericHarness = defineComponent({
      components: { URadio, URadioGroup },
      setup() {
        // <lang><zh-CN>数值初值为 1，专门覆盖字符串化前后不能混淆的本地键。</zh-CN><en>The numeric initial value is 1, specifically covering local keys that must not be confused before or after stringification.</en></lang>
        const radioValue = ref(1);
        return { radioValue };
      },
      template: '<u-radio-group :model-value="radioValue" @update:model-value="radioValue = $event"><u-radio :value="1" label="One" /><u-radio :value="2" label="Two" /></u-radio-group>'
    });
    const numericWrapper = mount(NumericHarness);
    const numericRadios = numericWrapper.findAll('.u-radio');
    await numericRadios[1].trigger('click');
    expect(numericWrapper.vm.radioValue).toBe(2);

    // <lang><zh-CN>数值 checkbox group 单独覆盖数组成员的严格数值保留；它不复用 radio 的单值语义。</zh-CN><en>The numeric checkbox group separately covers strict numeric preservation in array membership; it does not reuse the radio's single-value semantics.</en></lang>
    const NumericCheckboxHarness = defineComponent({
      components: { UCheckbox, UCheckboxGroup },
      setup() {
        // <lang><zh-CN>空数组让本次点击可明确观察数值 3 被原样写回，而不是被转换成字符串。</zh-CN><en>The empty array lets this click show numeric 3 written back unchanged rather than converted to a string.</en></lang>
        const checkboxValues = ref([]);
        return { checkboxValues };
      },
      template: '<u-checkbox-group :model-value="checkboxValues" @update:model-value="checkboxValues = $event"><u-checkbox :value="3" label="Three" /></u-checkbox-group>'
    });
    const numericCheckboxWrapper = mount(NumericCheckboxHarness);
    await numericCheckboxWrapper.find('.u-checkbox').trigger('click');
    expect(numericCheckboxWrapper.vm.checkboxValues).toEqual([3]);

    // <lang><zh-CN>独立 radio 的迁移 change 与既有 select 必须均返回未经修改的数值 key。</zh-CN><en>The independent radio migration change and existing select must both return the unmodified numeric key.</en></lang>
    const radio = mount(URadio, { props: { value: 9, label: 'Nine' } });
    await radio.find('.u-radio').trigger('click');
    expect(radio.emitted('select')).toEqual([[9]]);
    expect(radio.emitted('change')).toEqual([[9]]);
  });

  /** @lang zh-CN 验证 loading switch 保持 caller-controlled 忙碌 guard，而不启动服务或写入设置。 @lang en Verifies a loading switch retains a caller-controlled busy guard without starting a service or writing a setting. @returns {Promise<void>} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang> */
  it('blocks switch interaction while caller-owned loading is true', async () => {
    // <lang><zh-CN>loading switch 只提供本地 busy guard；测试不挂载请求、storage、identity 或 platform vibration。</zh-CN><en>The loading switch provides only a local busy guard; the test mounts no request, storage, identity, or platform vibration.</en></lang>
    const loadingSwitch = mount(USwitch, { props: { modelValue: false, loading: true } });

    // <lang><zh-CN>根元素披露 busy，且 native control 必须是 disabled；这不等同真实辅助技术认证。</zh-CN><en>The root discloses busy and the native control must be disabled; this is not real assistive-technology certification.</en></lang>
    expect(loadingSwitch.attributes('aria-busy')).toBe('true');
    expect(loadingSwitch.find('switch').attributes('disabled')).toBeDefined();

    // <lang><zh-CN>即使测试直接触发 change，loading guard 也保持零事件，不推导任何业务写入。</zh-CN><en>Even when the test directly triggers change, the loading guard retains zero events and derives no business write.</en></lang>
    await loadingSwitch.find('switch').trigger('change', { detail: { value: true } });
    expect(loadingSwitch.emitted()).toEqual({});
  });
});
