/**
 * @module hia-uview-textarea-search.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证 P66 UTextarea/USearch 的受控 payload、事件顺序、form-item 继承、change 规则与 Search 按钮不冒泡。测试不请求、缓存、防抖、导航、读取存储或启动平台服务。
 * @lang en Uses the real Vue runtime to verify P66 UTextarea/USearch controlled payloads, event order, form-item inheritance, change rules, and non-bubbling Search buttons. The tests perform no request, cache, debounce, navigation, storage read, or platform-service startup.
 */

// <lang><zh-CN>导入 Vue 测试壳、响应式调用方状态、Vitest 断言与真实仓内组件；不安装 router、store、plugin 或平台 mock。</zh-CN><en>Imports the Vue test harness, reactive caller state, Vitest assertions, and real repository components; no router, store, plugin, or platform mock is installed.</en></lang>
import { defineComponent, nextTick, reactive, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { UForm, UFormItem, USearch, UTextarea } from '../../HIA-uView-UI/src/index.mjs';

/**
 * @lang zh-CN 验证独立 UTextarea 的值事件、观察事件和 disabled/readonly 分工。
 * @lang en Verifies value events, observation events, and disabled/readonly separation for standalone UTextarea.
 */
describe('P66 textarea runtime behavior', () => {
  /**
   * @lang zh-CN 验证三项值事件使用同一字符串，点击无参数，confirm 保留平台事件，并由 guard 精确限制。
   * @lang en Verifies that three value events use the same string, click has no parameters, confirm retains the platform event, and guards constrain them precisely.
   * @returns {Promise<void>} <lang><zh-CN>原生事件和 prop 更新完成后解决。</zh-CN><en>Resolves after native events and prop updates complete.</en></lang>
   */
  it('keeps value and observation payloads controlled across guards', async () => {
    // <lang><zh-CN>独立实例只由调用方 prop 驱动，不挂载 form context。</zh-CN><en>The standalone instance is driven only by caller props and mounts no form context.</en></lang>
    const textarea = mount(UTextarea, { props: { modelValue: 'initial' } });

    // <lang><zh-CN>输入事件依次形成标准 model、input 与同值 change，不修改 prop。</zh-CN><en>An input event forms standard model, input, and same-value change events without mutating the prop.</en></lang>
    await textarea.get('textarea').trigger('input', { detail: { value: 'next' } });
    expect(textarea.emitted('update:modelValue')).toEqual([['next']]);
    expect(textarea.emitted('input')).toEqual([['next']]);
    expect(textarea.emitted('change')).toEqual([['next']]);
    expect(textarea.props('modelValue')).toBe('initial');

    // <lang><zh-CN>点击不传播平台对象，confirm 仍保留原始事件以匹配冻结的多行契约。</zh-CN><en>Click does not spread a platform object, while confirm retains its original event to match the frozen multiline contract.</en></lang>
    await textarea.get('.u-textarea').trigger('click');
    await textarea.get('textarea').trigger('confirm', { detail: { value: 'confirmed' } });
    expect(textarea.emitted('click')).toEqual([[]]);
    expect(textarea.emitted('confirm')).toHaveLength(1);
    expect(textarea.emitted('confirm')[0][0]).toBeInstanceOf(Event);

    // <lang><zh-CN>readonly 阻止新增值事件，但实际送达的点击和确认仍可观察。</zh-CN><en>Readonly blocks additional value events while click and confirmation that actually arrive remain observable.</en></lang>
    await textarea.setProps({ readonly: true });
    await textarea.get('textarea').trigger('input', { detail: { value: 'blocked' } });
    await textarea.get('.u-textarea').trigger('click');
    await textarea.get('textarea').trigger('confirm', { detail: { value: 'readonly-confirm' } });
    expect(textarea.emitted('update:modelValue')).toHaveLength(1);
    expect(textarea.emitted('click')).toHaveLength(2);
    expect(textarea.emitted('confirm')).toHaveLength(2);

    // <lang><zh-CN>disabled 是完整交互 guard，后续 input/click/confirm 均保持零新增。</zh-CN><en>Disabled is the complete interaction guard, so later input/click/confirm add nothing.</en></lang>
    await textarea.setProps({ disabled: true, readonly: false });
    await textarea.get('textarea').trigger('input', { detail: { value: 'disabled' } });
    await textarea.get('.u-textarea').trigger('click');
    await textarea.get('textarea').trigger('confirm', { detail: { value: 'disabled-confirm' } });
    expect(textarea.emitted('update:modelValue')).toHaveLength(1);
    expect(textarea.emitted('click')).toHaveLength(2);
    expect(textarea.emitted('confirm')).toHaveLength(2);
  });
});

/**
 * @lang zh-CN 验证 USearch 保持 caller-controlled model、稳定事件顺序和独立 clear/search intent。
 * @lang en Verifies that USearch retains a caller-controlled model, stable event order, and independent clear/search intents.
 */
describe('P66 search runtime behavior', () => {
  /**
   * @lang zh-CN 验证输入与 clear 顺序、外部 prop 零回放、按钮 stop 以及 disabled 全 guard。
   * @lang en Verifies input and clear order, zero replay for external props, button stop behavior, and the complete disabled guard.
   * @returns {Promise<void>} <lang><zh-CN>受控写回、按钮事件与 prop 更新完成后解决。</zh-CN><en>Resolves after controlled writeback, button events, and prop updates complete.</en></lang>
   */
  it('orders value intents and keeps clear/action clicks from bubbling', async () => {
    // <lang><zh-CN>测试壳按监听器调用顺序记录事件，并只在 update 监听器中执行调用方写回。</zh-CN><en>The harness records events in listener-call order and performs caller writeback only in the update listener.</en></lang>
    const Harness = defineComponent({
      components: { USearch },
      setup() {
        // <lang><zh-CN>query 是唯一受控状态，外部替换不会通过组件 watcher 回放事件。</zh-CN><en>Query is the sole controlled state, and external replacement is never replayed through a component watcher.</en></lang>
        const query = ref('seed');
        // <lang><zh-CN>disabled 由测试壳显式切换。</zh-CN><en>Disabled is switched explicitly by the harness.</en></lang>
        const disabled = ref(false);
        // <lang><zh-CN>events 是本地有序观测，不发送到日志或存储。</zh-CN><en>Events is a local ordered observation and is sent to neither logs nor storage.</en></lang>
        const events = reactive([]);
        /**
         * @lang zh-CN 记录一个有限事件，并在 update 时模拟标准宿主写回。
         * @lang en Records one bounded event and simulates standard host writeback for update.
         * @param {string} name <lang><zh-CN>测试内稳定事件名。</zh-CN><en>Stable test-local event name.</en></lang>
         * @param {unknown} [value] <lang><zh-CN>可选公开 payload。</zh-CN><en>Optional public payload.</en></lang>
         * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
         */
        function record(name, value) {
          // <lang><zh-CN>新二元组保留触发顺序，不保存平台事件对象。</zh-CN><en>A new tuple preserves trigger order without retaining a platform event object.</en></lang>
          events.push([name, value]);
          if (name === 'update' && typeof value === 'string') {
            query.value = value;
          }
        }
        return { query, disabled, events, record };
      },
      template: '<u-search :model-value="query" :disabled="disabled" show-action action-text="Search" @update:model-value="record(\'update\', $event)" @input="record(\'input\', $event)" @change="record(\'change\', $event)" @clear="record(\'clear\')" @search="record(\'search\', $event)" @click="record(\'click\')" />'
    });

    // <lang><zh-CN>clear 按 update/input/change/clear 顺序运行，并因 `.stop` 不产生根 click。</zh-CN><en>Clear runs in update/input/change/clear order and produces no root click because of `.stop`.</en></lang>
    const wrapper = mount(Harness);
    await wrapper.get('.u-search__clear').trigger('click');
    expect(wrapper.vm.events).toEqual([
      ['update', ''],
      ['input', ''],
      ['change', ''],
      ['clear', undefined]
    ]);
    expect(wrapper.vm.query).toBe('');

    // <lang><zh-CN>外部直接替换 query 不回放任何 model/input/change 事件。</zh-CN><en>Direct external query replacement replays no model/input/change event.</en></lang>
    wrapper.vm.events.splice(0);
    wrapper.vm.query = 'external';
    await nextTick();
    expect(wrapper.vm.events).toEqual([]);

    // <lang><zh-CN>普通输入仍按 update/input/change 排序，action 只报告当前受控 query 且不冒泡。</zh-CN><en>Ordinary input remains ordered update/input/change, while action reports only the current controlled query and does not bubble.</en></lang>
    await wrapper.get('input').trigger('input', { detail: { value: 'next' } });
    expect(wrapper.vm.events).toEqual([
      ['update', 'next'],
      ['input', 'next'],
      ['change', 'next']
    ]);
    wrapper.vm.events.splice(0);
    await wrapper.get('.u-search__action').trigger('click');
    expect(wrapper.vm.events).toEqual([['search', 'next']]);

    // <lang><zh-CN>根本身的启用 click 仍可观察；disabled 后 root/action/clear/input 全部保持零新增。</zh-CN><en>An enabled root click remains observable; after disabling, root/action/clear/input all add nothing.</en></lang>
    wrapper.vm.events.splice(0);
    await wrapper.get('.u-search').trigger('click');
    expect(wrapper.vm.events).toEqual([['click', undefined]]);
    wrapper.vm.events.splice(0);
    wrapper.vm.disabled = true;
    await nextTick();
    await wrapper.get('.u-search').trigger('click');
    await wrapper.get('input').trigger('input', { detail: { value: 'blocked' } });
    await wrapper.get('.u-search__action').trigger('click');
    await wrapper.get('.u-search__clear').trigger('click');
    expect(wrapper.vm.events).toEqual([]);
  });

  /**
   * @lang zh-CN 验证前置放大镜默认不存在，显式开启后仅形成声明 aria-hidden 的 CSS 几何且不产生组件事件。
   * @lang en Verifies the leading magnifier is absent by default and, once enabled, forms only CSS geometry declaring aria-hidden without producing component events.
   * @returns {void} <lang><zh-CN>无返回值；全部断言为同步呈现检查。</zh-CN><en>No return value; all assertions are synchronous presentation checks.</en></lang>
   */
  it('keeps the opt-in leading decoration presentational and inert', () => {
    // <lang><zh-CN>默认实例锁定空串默认值，避免无意改变既有搜索框布局。</zh-CN><en>The default instance locks the empty-string default, preventing an unintended change to existing search layouts.</en></lang>
    const defaultSearch = mount(USearch);
    expect(defaultSearch.find('.u-search__leading-icon').exists()).toBe(false);

    // <lang><zh-CN>显式实例只应增加一个隐藏装饰及其两个几何节点，不新增可聚焦 control 或 emit。</zh-CN><en>The explicit instance must add only one hidden decoration and its two geometry nodes, with no new focusable control or emission.</en></lang>
    const decoratedSearch = mount(USearch, { props: { searchIcon: 'search' } });
    const decoration = decoratedSearch.get('.u-search__leading-icon');
    expect(decoration.attributes('aria-hidden')).toBe('true');
    expect(decoration.attributes('tabindex')).toBeUndefined();
    expect(decoration.find('.u-search__leading-icon-ring').exists()).toBe(true);
    expect(decoration.find('.u-search__leading-icon-handle').exists()).toBe(true);
    expect(decoratedSearch.emitted()).toEqual({});

    // <lang><zh-CN>运行时未知字符串安全回退为无装饰，且不被解释为任意 icon key 或资产 locator。</zh-CN><en>An unknown runtime string safely falls back to no decoration and is not interpreted as an arbitrary icon key or asset locator.</en></lang>
    const unknownSearch = mount(USearch, { props: { searchIcon: 'unknown-icon' } });
    expect(unknownSearch.find('.u-search__leading-icon').exists()).toBe(false);
    expect(unknownSearch.emitted()).toEqual({});
  });
});

/**
 * @lang zh-CN 验证 Textarea/Search 通过最近 UFormItem 读取 guard，并在宿主写回后执行 change 规则。
 * @lang en Verifies that Textarea/Search read guards through the nearest UFormItem and run change rules after host writeback.
 */
describe('P66 textarea and search form integration', () => {
  /**
   * @lang zh-CN 验证两组件的 change 错误投影、恢复、readonly 值 guard 与 form disabled 传播。
   * @lang en Verifies change-error projection, recovery, readonly value guards, and form-disabled propagation for both components.
   * @returns {Promise<void>} <lang><zh-CN>输入、清除、规则与 guard 更新完成后解决。</zh-CN><en>Resolves after input, clear, rules, and guard updates complete.</en></lang>
   */
  it('validates host writeback and inherits readonly/disabled without global state', async () => {
    // <lang><zh-CN>测试壳拥有两个字段、规则和两个父级 guard，不安装全局 registry。</zh-CN><en>The harness owns two fields, rules, and two parent guards and installs no global registry.</en></lang>
    const Harness = defineComponent({
      components: { UForm, UFormItem, UTextarea, USearch },
      setup() {
        // <lang><zh-CN>初值均非空，便于分别通过 input 与 clear 触发 required。</zh-CN><en>Both initial values are nonempty so required can be triggered separately through input and clear.</en></lang>
        const model = reactive({ notes: 'ready', query: 'seed' });
        // <lang><zh-CN>两条规则只声明 change 自动触发，文案由调用方本地化。</zh-CN><en>Both rules declare only automatic change triggers and caller-localized copy.</en></lang>
        const rules = {
          notes: { required: true, trigger: 'change', message: 'Notes required' },
          query: { required: true, trigger: 'change', message: 'Query required' }
        };
        // <lang><zh-CN>readonly 同时作用于两个 form-item，disabled 来自 form owner。</zh-CN><en>Readonly applies to both form items while disabled comes from the form owner.</en></lang>
        const readonly = ref(false);
        const disabled = ref(false);
        return { model, rules, readonly, disabled };
      },
      template: '<u-form :model="model" :rules="rules" :disabled="disabled"><u-form-item prop="notes" :readonly="readonly"><u-textarea :model-value="model.notes" @update:model-value="model.notes = $event" /></u-form-item><u-form-item prop="query" :readonly="readonly"><u-search :model-value="model.query" @update:model-value="model.query = $event" /></u-form-item></u-form>'
    });

    // <lang><zh-CN>Textarea 空输入与 Search clear 均先由宿主写回，再由 change 规则形成各自错误。</zh-CN><en>Textarea empty input and Search clear are first written back by the host and then form their respective errors through change rules.</en></lang>
    const wrapper = mount(Harness);
    const textarea = wrapper.getComponent(UTextarea);
    const search = wrapper.getComponent(USearch);
    await textarea.get('textarea').trigger('input', { detail: { value: '' } });
    await search.get('.u-search__clear').trigger('click');
    await nextTick();
    expect(wrapper.vm.model).toEqual({ notes: '', query: '' });
    expect(wrapper.text()).toContain('Notes required');
    expect(wrapper.text()).toContain('Query required');

    // <lang><zh-CN>宿主写回新非空值后，同一规则清除两项旧错误。</zh-CN><en>After host writeback of new nonempty values, the same rules clear both old errors.</en></lang>
    await textarea.get('textarea').trigger('input', { detail: { value: 'restored notes' } });
    await search.get('input').trigger('input', { detail: { value: 'restored query' } });
    await nextTick();
    expect(wrapper.text()).not.toContain('Notes required');
    expect(wrapper.text()).not.toContain('Query required');

    // <lang><zh-CN>父级 readonly 阻止两项值变更，并传入原生 readonly/clear disabled。</zh-CN><en>Parent readonly blocks both value changes and reaches native readonly/clear-disabled state.</en></lang>
    wrapper.vm.readonly = true;
    await nextTick();
    const textareaUpdateCount = textarea.emitted('update:modelValue')?.length ?? 0;
    const searchUpdateCount = search.emitted('update:modelValue')?.length ?? 0;
    await textarea.get('textarea').trigger('input', { detail: { value: 'blocked notes' } });
    await search.get('input').trigger('input', { detail: { value: 'blocked query' } });
    await search.get('.u-search__clear').trigger('click');
    expect(textarea.emitted('update:modelValue')).toHaveLength(textareaUpdateCount);
    expect(search.emitted('update:modelValue')).toHaveLength(searchUpdateCount);
    expect(textarea.get('textarea').attributes()).toHaveProperty('readonly');
    expect(search.get('input').attributes()).toHaveProperty('readonly');
    expect(search.get('.u-search__clear').attributes()).toHaveProperty('disabled');

    // <lang><zh-CN>form disabled 进一步进入两个原生控件，且不改变调用方现有 model。</zh-CN><en>Form disabled additionally reaches both native controls without changing the caller's existing model.</en></lang>
    wrapper.vm.readonly = false;
    wrapper.vm.disabled = true;
    await nextTick();
    expect(textarea.get('textarea').attributes()).toHaveProperty('disabled');
    expect(search.get('input').attributes()).toHaveProperty('disabled');
    expect(wrapper.vm.model).toEqual({ notes: 'restored notes', query: 'restored query' });
  });
});
