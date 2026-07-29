/**
 * @module hia-uview-choice.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证 P16 受控 radio/checkbox 与 group 只 emit 调用方状态意图。测试不启动网络、路由、存储、picker、popup、Tool 或平台导航，也不替代 compiler、DevTools 或真机证据。
 * @lang en Uses real Vue runtime to verify P16 controlled radio/checkbox and groups emit caller state intent only. Tests start no network, routing, storage, picker, popup, Tool, or platform navigation and do not replace compiler, DevTools, or device evidence.
 */
import { defineComponent, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { UCheckbox, UCheckboxGroup, URadio, URadioGroup } from '../../HIA-uView-UI/src/index.mjs';

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
});
