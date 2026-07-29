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
        const radioValue = ref('a');
        const checkboxValues = ref(['one']);
        return { radioValue, checkboxValues };
      },
      template: '<u-radio-group :model-value="radioValue" @update:model-value="radioValue = $event"><u-radio value="a" label="A" /><u-radio value="b" label="B" /></u-radio-group><u-checkbox-group :model-value="checkboxValues" @update:model-value="checkboxValues = $event"><u-checkbox value="one" label="One" /><u-checkbox value="two" label="Two" /></u-checkbox-group>'
    });
    const wrapper = mount(Harness);
    const radios = wrapper.findAll('.u-radio');
    const checkboxes = wrapper.findAll('.u-checkbox');
    await radios[0].trigger('click');
    expect(wrapper.vm.radioValue).toBe('a');
    await radios[1].trigger('click');
    expect(wrapper.vm.radioValue).toBe('b');
    await checkboxes[1].trigger('click');
    expect(wrapper.vm.checkboxValues).toEqual(['one', 'two']);
    await checkboxes[0].trigger('click');
    expect(wrapper.vm.checkboxValues).toEqual(['two']);
  });
});
