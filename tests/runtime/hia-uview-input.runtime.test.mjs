/**
 * @module hia-uview-input.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证 P13 的受控值事件、disabled guard、字段组合与独立消息呈现。测试不启动 dev server、网络、规则执行、完成操作、Tool 或小程序导航；它不替代 UniApp compiler、真机、读屏、焦点或异步校验证据。
 * @lang en Uses a real Vue runtime to verify P13 controlled-value events, disabled guard, field composition, and independent message presentation. Tests start no dev server, network, rule execution, completion action, Tool, or mini-program navigation; they do not replace UniApp compiler, device, screen-reader, focus, or asynchronous-validation evidence.
 */

// <lang><zh-CN>导入本地 Vue mount、Vitest 断言和本仓 runtime 组件；测试不安装全局 plugin、路由、Tool 或平台 mock。</zh-CN><en>Imports local Vue mount, Vitest assertions, and repository runtime components; the test installs no global plugin, router, Tool, or platform mock.</en></lang>
import { defineComponent, nextTick, reactive, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { UField, UForm, UFormItem, UInput, UValidationMessage } from '../../HIA-uView-UI/src/index.mjs';

/**
 * @lang zh-CN 验证 UInput 只报告未修改的本地值和焦点意图，并由调用方 prop 写回决定下一次渲染值。
 * @lang en Verifies that UInput reports only unmodified local value and focus intent while caller prop writeback decides the next rendered value.
 */
describe('UInput runtime behavior', () => {
  /**
   * @lang zh-CN 验证启用输入按固定顺序 emit 值事件，且调用方改变 prop 后才成为明确的下一受控渲染状态。
   * @lang en Verifies that an enabled input emits value events in fixed order and that only caller prop change becomes the explicit next controlled render state.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步原生事件触发与 prop 更新完成后解决。</zh-CN><en>No return value; resolves after asynchronous native-event triggers and prop updates complete.</en></lang>
   */
  it('reports unmodified input intent and accepts caller writeback', async () => {
    // <lang><zh-CN>初始实例由调用方字符串驱动，先确认模板没有创建隐式默认值。</zh-CN><en>The initial instance is driven by a caller string, first confirming the template creates no implicit default value.</en></lang>
    const input = mount(UInput, { props: { modelValue: 'Initial caller value', placeholder: 'Enter value' } });

    expect(input.get('input').element.value).toBe('Initial caller value');

    // <lang><zh-CN>原生 setValue 模拟 Vue/jsdom 的 target.value 形状；组件必须先 emit 受控更新，再 emit 一般 input 意图。</zh-CN><en>Native setValue simulates Vue/jsdom target.value shape; the component must emit controlled update first and general input intent second.</en></lang>
    await input.get('input').setValue('Next caller value');

    expect(input.emitted('update:modelValue')).toEqual([['Next caller value']]);
    expect(input.emitted('input')).toEqual([['Next caller value']]);

    // <lang><zh-CN>调用方显式写回的新 prop 才形成后续受控呈现事实；测试不把一次原生输入当作组件自有状态。</zh-CN><en>The caller explicitly written-back prop forms the subsequent controlled-render fact; the test does not treat one native input as component-owned state.</en></lang>
    await input.setProps({ modelValue: 'Confirmed by caller' });

    expect(input.get('input').element.value).toBe('Confirmed by caller');
  });

  /**
   * @lang zh-CN 验证 focus/blur 只在启用状态转发，disabled 对所有四类事件都保持零事件。
   * @lang en Verifies that focus/blur forward only while enabled and that disabled retains zero events for all four event categories.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步事件触发完成后解决。</zh-CN><en>No return value; resolves after asynchronous event triggers complete.</en></lang>
   */
  it('forwards enabled focus and blur while suppressing every disabled event', async () => {
    // <lang><zh-CN>启用实例只验证原始焦点意图是否到达，不把 jsdom 事件扩展为键盘或真机焦点证明。</zh-CN><en>The enabled instance verifies only that raw focus intent arrives and does not expand a jsdom event into keyboard or device-focus proof.</en></lang>
    const enabled = mount(UInput, { props: { modelValue: 'Enabled' } });

    await enabled.get('input').trigger('focus');
    await enabled.get('input').trigger('blur');
    await enabled.get('input').trigger('click');
    await enabled.get('input').trigger('confirm', { detail: { value: 'Confirmed' } });

    expect(enabled.emitted('focus')).toHaveLength(1);
    expect(enabled.emitted('blur')).toHaveLength(1);
    expect(enabled.emitted('click')).toEqual([[]]);
    expect(enabled.emitted('confirm')).toEqual([['Confirmed']]);

    // <lang><zh-CN>禁用实例即使在测试中直接收到 input/focus/blur 事件也必须全部由 handler guard 抑制。</zh-CN><en>The disabled instance must suppress every event through handler guards even when the test directly supplies input/focus/blur events.</en></lang>
    const disabled = mount(UInput, { props: { modelValue: 'Disabled', disabled: true } });

    await disabled.get('input').trigger('input', { detail: { value: 'Ignored' } });
    await disabled.get('input').trigger('focus');
    await disabled.get('input').trigger('blur');
    await disabled.get('input').trigger('click');
    await disabled.get('input').trigger('confirm', { detail: { value: 'Ignored' } });

    expect(disabled.emitted('update:modelValue')).toBeUndefined();
    expect(disabled.emitted('input')).toBeUndefined();
    expect(disabled.emitted('focus')).toBeUndefined();
    expect(disabled.emitted('blur')).toBeUndefined();
    expect(disabled.emitted('click')).toBeUndefined();
    expect(disabled.emitted('confirm')).toBeUndefined();
    expect(disabled.get('input').classes()).toContain('u-input--disabled');
  });

  /**
   * @lang zh-CN 验证最近 UFormItem 的 disabled/readonly 继承，并在宿主写回后触发 change 规则。
   * @lang en Verifies nearest-UFormItem disabled/readonly inheritance and change-rule execution after host writeback.
   * @returns {Promise<void>} <lang><zh-CN>受控输入、Vue 更新与规则执行完成后解决。</zh-CN><en>Resolves after controlled input, Vue updates, and rule execution complete.</en></lang>
   */
  it('inherits form-item guards and validates the caller-written value', async () => {
    // <lang><zh-CN>测试壳拥有 model、guard 与规则；UInput 只 emit，父壳在同一事件中显式写回。</zh-CN><en>The harness owns the model, guards, and rules; UInput only emits and the parent harness explicitly writes back in the same event.</en></lang>
    const Harness = defineComponent({
      components: { UForm, UFormItem, UInput },
      setup() {
        // <lang><zh-CN>初始非空值用于观察后续空值 change 失败与恢复。</zh-CN><en>The initial nonempty value allows observing a later empty-value change failure and recovery.</en></lang>
        const model = reactive({ name: 'initial' });
        // <lang><zh-CN>只有 change trigger 会由输入通知自动执行。</zh-CN><en>Only the change trigger runs automatically from the input notification.</en></lang>
        const rules = { name: { required: true, trigger: 'change', message: 'Required after change' } };
        // <lang><zh-CN>两个 guard 可独立切换，证明 readonly 与 disabled 不是同一状态。</zh-CN><en>Two guards can be switched independently, proving readonly and disabled are not the same state.</en></lang>
        const formDisabled = ref(false);
        const itemReadonly = ref(false);
        return { model, rules, formDisabled, itemReadonly };
      },
      template: '<u-form :model="model" :rules="rules" :disabled="formDisabled"><u-form-item prop="name" :readonly="itemReadonly"><u-input :model-value="model.name" @update:model-value="model.name = $event" /></u-form-item></u-form>'
    });

    // <lang><zh-CN>空字符串先由宿主写回；UInput 的 nextTick 通知随后读取新 model 并投影错误。</zh-CN><en>The host first writes back an empty string; UInput's nextTick notification then reads the new model and projects the error.</en></lang>
    const wrapper = mount(Harness);
    const input = wrapper.getComponent(UInput);
    await input.get('input').trigger('input', { detail: { value: '' } });
    await nextTick();
    expect(wrapper.vm.model.name).toBe('');
    expect(wrapper.text()).toContain('Required after change');

    // <lang><zh-CN>恢复非空值后同一 change 规则清除旧错误。</zh-CN><en>After restoring a nonempty value, the same change rule clears the old error.</en></lang>
    await input.get('input').trigger('input', { detail: { value: 'ready' } });
    await nextTick();
    expect(wrapper.vm.model.name).toBe('ready');
    expect(wrapper.text()).not.toContain('Required after change');

    // <lang><zh-CN>父级 disabled 同时进入原生属性和全部事件 guard。</zh-CN><en>Parent disabled enters both the native attribute and every event guard.</en></lang>
    wrapper.vm.formDisabled = true;
    await nextTick();
    const valueEventCount = input.emitted('update:modelValue')?.length ?? 0;
    await input.get('input').trigger('input', { detail: { value: 'blocked' } });
    await input.get('input').trigger('click');
    expect(input.get('input').attributes()).toHaveProperty('disabled');
    expect(input.emitted('update:modelValue')).toHaveLength(valueEventCount);
    expect(input.emitted('click')).toBeUndefined();

    // <lang><zh-CN>readonly 仅阻止值事件；实际到达的 click/confirm 仍按冻结 payload 转发。</zh-CN><en>Readonly blocks only value events; click/confirm observations that actually arrive still forward with frozen payloads.</en></lang>
    wrapper.vm.formDisabled = false;
    wrapper.vm.itemReadonly = true;
    await nextTick();
    await input.get('input').trigger('input', { detail: { value: 'readonly-blocked' } });
    await input.get('input').trigger('click');
    await input.get('input').trigger('confirm', { detail: { value: 'ready' } });
    expect(wrapper.vm.model.name).toBe('ready');
    expect(input.get('input').attributes()).toHaveProperty('readonly');
    expect(input.emitted('click')).toEqual([[]]);
    expect(input.emitted('confirm')).toEqual([['ready']]);
  });
});

/**
 * @lang zh-CN 验证 UField 只组织可见字段上下文与插槽，并把应用声明的校验状态交给独立显示组件。
 * @lang en Verifies that UField organizes only visible field context and slot and delegates application-declared validation state to the independent display component.
 */
describe('UField runtime behavior', () => {
  /**
   * @lang zh-CN 验证标签、必填提示、帮助、插槽和 error 消息可组合，但字段本身不产生事件。
   * @lang en Verifies that label, required cue, help, slot, and error message compose while the field itself produces no events.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；prop 更新完成后解决。</zh-CN><en>No return value; resolves after prop update completes.</en></lang>
   */
  it('composes caller field context without taking control events', async () => {
    // <lang><zh-CN>字段实例把输入作为默认插槽，证明值和事件仍属于嵌入控件而非字段结构。</zh-CN><en>The field instance uses an input as default slot, proving value and events still belong to the embedded control rather than field structure.</en></lang>
    const field = mount(UField, {
      props: {
        label: 'Search phrase',
        required: true,
        helpText: 'Caller-owned help',
        validationState: 'idle',
        validationMessage: 'Not visible while idle'
      },
      slots: { default: '<input value="Caller-owned nested value" />' }
    });

    expect(field.text()).toContain('Search phrase');
    expect(field.text()).toContain('*');
    expect(field.text()).toContain('Caller-owned help');
    expect(field.text()).not.toContain('Not visible while idle');
    expect(field.find('input').exists()).toBe(true);
    expect(field.emitted()).toEqual({});

    // <lang><zh-CN>应用改变两个展示 prop 后，UField 只呈现独立 error 消息，不产生自己的状态机或事件。</zh-CN><en>After the application changes two presentation props, UField only renders the independent error message and creates no state machine or event of its own.</en></lang>
    await field.setProps({ validationState: 'error', validationMessage: 'Caller-owned error text' });

    expect(field.text()).toContain('Caller-owned error text');
    expect(field.find('.u-validation-message').classes()).toContain('u-validation-message--error');
    expect(field.emitted()).toEqual({});
  });

  /**
   * @lang zh-CN 验证无 default slot 时只组合一个 UInput，并精确转交四项受控迁移事件。
   * @lang en Verifies that an absent default slot composes exactly one UInput and precisely forwards four controlled migration events.
   * @returns {Promise<void>} <lang><zh-CN>输入、确认与点击事件完成后解决。</zh-CN><en>Resolves after input, confirmation, and click events complete.</en></lang>
   */
  it('provides a guarded built-in input only when no custom control is supplied', async () => {
    // <lang><zh-CN>内建模式由数字初值启动，证明可见 prop 范围与编辑字符串 payload 被明确区分。</zh-CN><en>Built-in mode starts from a numeric value, proving visible prop range and edited string payload are explicitly distinct.</en></lang>
    const field = mount(UField, { props: { modelValue: 7, placeholder: 'Local field' } });
    // <lang><zh-CN>通过组件身份取得唯一 UInput，避免把任意后代原生 input 误认成组合边界。</zh-CN><en>Gets the sole UInput by component identity, avoiding confusion with an arbitrary descendant native input.</en></lang>
    const builtInInput = field.getComponent(UInput);

    expect(field.findAllComponents(UInput)).toHaveLength(1);
    expect(builtInInput.get('input').element.value).toBe('7');

    // <lang><zh-CN>值事件按 UInput 受控流进入 UField，字段本身不写回 modelValue。</zh-CN><en>Value events enter UField through the UInput controlled flow, and the field itself does not write back modelValue.</en></lang>
    await builtInInput.get('input').trigger('input', { detail: { value: 'next' } });
    expect(field.emitted('update:modelValue')).toEqual([['next']]);
    expect(field.emitted('input')).toEqual([['next']]);
    expect(field.props('modelValue')).toBe(7);

    // <lang><zh-CN>确认统一为字符串，点击统一为无参数；二者都不表示校验或提交成功。</zh-CN><en>Confirmation is normalized to a string and click to no parameters; neither represents successful validation or submission.</en></lang>
    await builtInInput.get('input').trigger('confirm', { detail: { value: 'confirmed' } });
    await builtInInput.get('input').trigger('click');
    expect(field.emitted('confirm')).toEqual([['confirmed']]);
    expect(field.emitted('click')).toEqual([[]]);

    // <lang><zh-CN>disabled 从字段传到内建输入并使直接测试事件保持零新增。</zh-CN><en>Disabled propagates from the field to the built-in input and keeps directly triggered test events from adding emissions.</en></lang>
    await field.setProps({ disabled: true });
    await builtInInput.get('input').trigger('input', { detail: { value: 'blocked' } });
    await builtInInput.get('input').trigger('confirm', { detail: { value: 'blocked' } });
    await builtInInput.get('input').trigger('click');
    expect(field.emitted('update:modelValue')).toHaveLength(1);
    expect(field.emitted('confirm')).toHaveLength(1);
    expect(field.emitted('click')).toHaveLength(1);
  });
});

/**
 * @lang zh-CN 验证 UValidationMessage 的 idle 抑制和两种明确消息状态，不让它推断值有效性或创建运行时默认文案。
 * @lang en Verifies UValidationMessage idle suppression and two explicit message states without letting it infer value validity or create runtime default copy.
 */
describe('UValidationMessage runtime behavior', () => {
  /**
   * @lang zh-CN 验证 idle 即使有文字也不输出，validating/error 只有调用方提供文字才显示对应标记和类。
   * @lang en Verifies that idle outputs nothing even with text and that validating/error display corresponding marker and class only when caller supplies text.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；prop 更新完成后解决。</zh-CN><en>No return value; resolves after prop update completes.</en></lang>
   */
  it('renders only explicit non-idle state with caller message', async () => {
    // <lang><zh-CN>idle 实例包含误传文字，用以验证组件不把任意字符串猜成可见校验结果。</zh-CN><en>The idle instance contains accidentally supplied text to verify the component does not guess any string into a visible validation result.</en></lang>
    const message = mount(UValidationMessage, { props: { state: 'idle', message: 'Must remain hidden' } });

    expect(message.find('.u-validation-message').exists()).toBe(false);

    // <lang><zh-CN>应用声明 validating 后，组件仅显示原始文字与非颜色省略号标记。</zh-CN><en>After the application declares validating, the component displays only original text and non-color ellipsis marker.</en></lang>
    await message.setProps({ state: 'validating', message: 'Checking caller-owned value…' });

    expect(message.text()).toContain('Checking caller-owned value…');
    expect(message.text()).toContain('…');
    expect(message.find('.u-validation-message').classes()).toContain('u-validation-message--validating');

    // <lang><zh-CN>应用声明 error 后，组件切换到 error 类与感叹号标记；测试不赋予它错误分类或恢复行为。</zh-CN><en>After the application declares error, the component switches to error class and exclamation marker; the test assigns it no error-classification or recovery behavior.</en></lang>
    await message.setProps({ state: 'error', message: 'Caller-owned error' });

    expect(message.text()).toContain('Caller-owned error');
    expect(message.text()).toContain('!');
    expect(message.find('.u-validation-message').classes()).toContain('u-validation-message--error');
    expect(message.emitted()).toEqual({});
  });
});
