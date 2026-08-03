/**
 * @module hia-uview-p55.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证本批三项受控组件的有限呈现和局部 intent；不启动 dev server、网络、路由、平台 API 或全局 service。
 * @lang en Uses the real Vue runtime to verify finite presentation and local intent of this batch's three controlled components; it starts no dev server, network, router, platform API, or global service.
 */

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { UActionSheetItem, UCitySelect, UMessageInput } from '../../HIA-uView-UI/src/index.mjs';

/**
 * @lang zh-CN 验证 action-sheet item 只报告 caller value，不取得父级 sheet 的关闭或索引职责。
 * @lang en Verifies that action-sheet item reports caller value only and does not acquire parent-sheet close or index responsibility.
 */
describe('controlled action-sheet item', () => {
  /**
   * @lang zh-CN 验证可读文字实例报告一次 payload，禁用实例保持零事件。
   * @lang en Verifies that a readable-copy instance reports one payload and a disabled instance retains zero events.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步交互断言完成后解决。</zh-CN><en>No return value; resolves after asynchronous interaction assertions complete.</en></lang>
   */
  it('emits caller value only while enabled and discoverable', async () => {
    // <lang><zh-CN>启用实例提供可读标签和透明调用方值，不建立命令或关闭语义。</zh-CN><en>The enabled instance provides readable label and transparent caller value and establishes no command or close meaning.</en></lang>
    const enabled = mount(UActionSheetItem, { props: { text: 'Local choice', value: 'choice-a' } });
    await enabled.get('button.u-action-sheet-item').trigger('click');
    expect(enabled.emitted('click')).toHaveLength(1);
    expect(enabled.emitted('click')[0][0].value).toBe('choice-a');

    // <lang><zh-CN>禁用实例仍有可发现文字，但 guard 必须阻止局部 intent。</zh-CN><en>The disabled instance retains discoverable copy, but the guard must prevent local intent.</en></lang>
    const disabled = mount(UActionSheetItem, { props: { text: 'Unavailable', disabled: true } });
    await disabled.get('button.u-action-sheet-item').trigger('click');
    expect(disabled.emitted('click')).toBeUndefined();
  });
});

/**
 * @lang zh-CN 验证有限列选择只形成调用方可接受的候选数组，不读取地区或地址数据。
 * @lang en Verifies that finite-column selection forms only a candidate array the caller may accept and reads no region or address data.
 */
describe('controlled finite-column selector', () => {
  /**
   * @lang zh-CN 验证选择和确认分别报告受控候选值；组件不自行写回 props。
   * @lang en Verifies that selection and confirmation report controlled candidate values separately; the component does not write props itself.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步交互断言完成后解决。</zh-CN><en>No return value; resolves after asynchronous interaction assertions complete.</en></lang>
   */
  it('reports finite selected candidates without owning column data', async () => {
    // <lang><zh-CN>两列本地静态选项不带城市或地址语义，仅用于验证透明 label/value 投影。</zh-CN><en>Two local static columns carry no city or address semantics and only verify transparent label/value projection.</en></lang>
    const selector = mount(UCitySelect, {
      props: {
        visible: true,
        title: 'Local columns',
        columns: [[{ label: 'First', value: 'first' }, { label: 'Second', value: 'second' }], [{ label: 'One', value: 'one' }]],
        modelValue: ['first', 'one'],
        confirmText: 'Confirm'
      }
    });
    const options = selector.findAll('button.u-city-select__option');
    expect(options).toHaveLength(3);
    expect(options[0].classes()).toContain('u-city-select__option--selected');
    await options[1].trigger('click');
    expect(selector.emitted('update:modelValue')[0][0]).toEqual(['second', 'one']);
    expect(selector.emitted('change')[0][0].columnIndex).toBe(0);
    await selector.get('button.u-city-select__confirm').trigger('click');
    expect(selector.emitted('confirm')[0][0]).toEqual(['first', 'one']);
  });
});

/**
 * @lang zh-CN 验证固定长度输入只回传受限字符串和焦点意图，不把显示投影解释为验证码流程。
 * @lang en Verifies that fixed-length input returns only bounded string and focus intent and does not interpret display projection as a verification-code flow.
 */
describe('controlled fixed-length input', () => {
  /**
   * @lang zh-CN 验证 masked 字符仍受长度限制，输入只回传调用方决定是否写回的下一字符串。
   * @lang en Verifies that masked characters remain length-bounded and input returns only a next string the caller decides whether to write back.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步交互断言完成后解决。</zh-CN><en>No return value; resolves after asynchronous interaction assertions complete.</en></lang>
   */
  it('bounds values and preserves caller-owned input writeback', async () => {
    // <lang><zh-CN>实例提供明确可访问标签和四格边界；masked 只影响可见投影。</zh-CN><en>The instance provides explicit accessible label and a four-cell boundary; masked affects visible projection only.</en></lang>
    const input = mount(UMessageInput, { props: { inputLabel: 'Local code', modelValue: '12', length: 4, masked: true } });
    expect(input.findAll('.u-message-input__cell')).toHaveLength(4);
    expect(input.text()).toContain('••');
    await input.get('input.u-message-input__native').setValue('12345');
    expect(input.emitted('update:modelValue')[0][0]).toBe('1234');
    expect(input.emitted('input')[0][0]).toBe('1234');

    // <lang><zh-CN>无标签输入不应产生不可发现的原生 control 或间接事件。</zh-CN><en>A label-less input must create no undiscoverable native control or indirect event.</en></lang>
    const hidden = mount(UMessageInput, { props: { inputLabel: '', modelValue: '12' } });
    expect(hidden.find('input.u-message-input__native').exists()).toBe(false);
  });
});
