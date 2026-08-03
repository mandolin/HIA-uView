/**
 * @module hia-uview-p55-keyboard.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证有限 caller-key 键盘、phase 意图及可选局部遮罩关闭；不启动 dev server、网络、平台键盘、焦点或 timer。
 * @lang en Uses the real Vue runtime to verify finite caller-key keyboards, phase intent, and optional local-mask close; it starts no dev server, network, platform keyboard, focus, or timer.
 */

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { UCarKeyboard, UKeyboard, UNumberKeyboard } from '../../HIA-uView-UI/src/index.mjs';

/**
 * @lang zh-CN 验证直接键盘只报告 caller key/action/phase intent，不拥有输入或键行状态。
 * @lang en Verifies that direct keyboards report caller key/action/phase intent only and own neither input nor key-row state.
 */
describe('controlled direct keyboard surfaces', () => {
  /**
   * @lang zh-CN 验证数字键和车牌式键行各自报告有限候选，且 phase 切换不改变 prop。
   * @lang en Verifies that numeric keys and vehicle-style key rows each report finite candidates and phase switching changes no prop.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步交互断言完成后解决。</zh-CN><en>No return value; resolves after asynchronous interaction assertions complete.</en></lang>
   */
  it('forwards finite key and phase intent without model ownership', async () => {
    // <lang><zh-CN>数字实例显式提供所有可读键和 action 文案，避免默认键或默认语言。</zh-CN><en>The numeric instance explicitly supplies all readable keys and action copy, avoiding default keys or default language.</en></lang>
    const numeric = mount(UNumberKeyboard, { props: { visible: true, keys: ['1', '2'], backspaceLabel: 'Remove', confirmText: 'Confirm' } });
    await numeric.findAll('button.u-number-keyboard__key')[1].trigger('click');
    await numeric.get('button.u-number-keyboard__action').trigger('click');
    expect(numeric.emitted('input')[0][0].value).toBe('2');
    expect(numeric.emitted('backspace')).toHaveLength(1);

    // <lang><zh-CN>行键实例不带地区数据；phase-change 只报告调用方声明的下一字符串。</zh-CN><en>The row-key instance carries no region data; phase-change reports only the caller-declared next string.</en></lang>
    const car = mount(UCarKeyboard, { props: { visible: true, rows: [['A', 'B']], phase: 'first', nextPhase: 'second', switchText: 'Next' } });
    await car.findAll('button.u-car-keyboard__key')[0].trigger('click');
    await car.get('button.u-car-keyboard__action').trigger('click');
    expect(car.emitted('input')[0][0].value).toBe('A');
    expect(car.emitted('phase-change')[0][0].phase).toBe('second');
  });
});

/**
 * @lang zh-CN 验证组合键盘只转发子面意图，mask close 仍须 caller 显式许可。
 * @lang en Verifies that the composed keyboard forwards child-surface intent only and mask close still requires caller explicit permission.
 */
describe('controlled local keyboard composition', () => {
  /**
   * @lang zh-CN 验证 number mode 通过子面转发键值和受授权 mask close，且不产生全局写回。
   * @lang en Verifies that number mode forwards key value and authorized mask close through the child surface and produces no global writeback.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步交互断言完成后解决。</zh-CN><en>No return value; resolves after asynchronous interaction assertions complete.</en></lang>
   */
  it('forwards child intent and guards local-mask close', async () => {
    // <lang><zh-CN>组合实例提供 caller-owned key 与可关闭 mask；没有 input model、focus 或系统键盘配置。</zh-CN><en>The composition instance provides caller-owned key and closable mask and has no input model, focus, or system-keyboard configuration.</en></lang>
    const keyboard = mount(UKeyboard, { props: { visible: true, mode: 'number', numberKeys: ['7'], label: 'Local keys', mask: true, maskClosable: true } });
    await keyboard.get('button.u-number-keyboard__key').trigger('click');
    await keyboard.get('.u-mask').trigger('click');
    expect(keyboard.emitted('input')[0][0].value).toBe('7');
    expect(keyboard.emitted('close')).toHaveLength(1);

    // <lang><zh-CN>不可关闭 mask 即使接收点击也不会形成 close intent。</zh-CN><en>A non-closable mask forms no close intent even if it receives a click.</en></lang>
    const guarded = mount(UKeyboard, { props: { visible: true, mode: 'number', numberKeys: ['7'], mask: true, maskClosable: false } });
    await guarded.get('.u-mask').trigger('click');
    expect(guarded.emitted('close')).toBeUndefined();
  });
});
