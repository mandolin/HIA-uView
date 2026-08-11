/**
 * @module hia-uview-p67-dropdown.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证 P67 dropdown 的 legacy 兼容、显式 name registry、单 active item、受控 options 与零事件失败边界。测试不启动 popup、页面测量、timer、路由、网络、存储或全局状态。
 * @lang en Uses the real Vue runtime to verify P67 dropdown legacy compatibility, explicit-name registry, single-active item, controlled options, and zero-event failure boundaries. Tests start no popup, page measurement, timer, routing, network, storage, or global state.
 */

import { defineComponent, nextTick, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { UDropdown, UDropdownItem } from '../../HIA-uView-UI/src/index.mjs';

/**
 * @lang zh-CN 把一次公开事件按真实回调顺序追加到测试拥有的日志，不转换 payload。
 * @lang en Appends one public event to a test-owned log in actual callback order without converting its payload.
 * @param {Array<{type:string,payload:unknown}>} target <lang><zh-CN>当前断言使用的顺序日志。</zh-CN><en>Ordered log used by the current assertion.</en></lang>
 * @param {string} type <lang><zh-CN>稳定事件名。</zh-CN><en>Stable event name.</en></lang>
 * @param {unknown} payload <lang><zh-CN>组件原样交付的 payload。</zh-CN><en>Payload delivered unchanged by the component.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只追加本地观察。</zh-CN><en>No return value; appends a local observation only.</en></lang>
 */
function appendObservedEvent(target, type, payload) {
  // <lang><zh-CN>保留数组与对象 identity，以验证 caller-owned 值未被组件复制或修改。</zh-CN><en>Preserves array and object identity so caller-owned values can be verified as neither copied nor mutated.</en></lang>
  target.push({ type, payload });
}

/**
 * @lang zh-CN 验证 dropdown/item 两种互斥模式的 runtime 状态与事件时序。
 * @lang en Verifies runtime state and event ordering for the two mutually exclusive dropdown/item modes.
 */
describe('P67 dropdown controlled composition', () => {
  /**
   * @lang zh-CN 验证 legacy parent-child 保持 update→change→select，且无 parent 的 legacy 按钮仍只报告 select。
   * @lang en Verifies legacy parent-child ordering remains update-to-change-to-select and a legacy button without a parent still reports select only.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；交互断言完成后解决。</zh-CN><en>No return value; resolves after interaction assertions complete.</en></lang>
   */
  it('preserves legacy parent and independent selection semantics', async () => {
    // <lang><zh-CN>顺序日志跨 parent 与 child listener 观察同一次点击，不写回 caller model。</zh-CN><en>The ordered log observes one click across parent and child listeners without writing the caller model back.</en></lang>
    const eventOrder = [];

    // <lang><zh-CN>测试壳只组合一个 legacy parent 和两个 legacy child。</zh-CN><en>The harness composes only one legacy parent and two legacy children.</en></lang>
    const LegacyHarness = defineComponent({
      components: { UDropdown, UDropdownItem },
      setup() {
        // <lang><zh-CN>listener 只记录真实顺序，不执行任何业务副作用。</zh-CN><en>The listener records actual ordering only and performs no business side effect.</en></lang>
        const record = appendObservedEvent.bind(null, eventOrder);
        return { record };
      },
      template: '<u-dropdown model-value="first" @update:model-value="record(\'parent-update\', $event)" @change="record(\'parent-change\', $event)"><u-dropdown-item value="first" label="First"/><u-dropdown-item value="second" @select="record(\'child-select\', $event)">Caller legacy slot</u-dropdown-item></u-dropdown>'
    });

    // <lang><zh-CN>第二个 legacy button 使用 default slot，并在点击时保持冻结顺序。</zh-CN><en>The second legacy button uses the default slot and preserves the frozen order when clicked.</en></lang>
    const wrapper = mount(LegacyHarness);
    const legacyButtons = wrapper.findAll('button.u-dropdown-item');
    expect(wrapper.text()).toContain('Caller legacy slot');
    expect(legacyButtons[0].classes()).toContain('u-dropdown-item--selected');
    await legacyButtons[1].trigger('click');
    expect(eventOrder).toEqual([
      { type: 'parent-update', payload: 'second' },
      { type: 'parent-change', payload: 'second' },
      { type: 'child-select', payload: 'second' }
    ]);

    // <lang><zh-CN>无 parent 的 legacy item 保留独立 select 例外，不伪造 model update/change。</zh-CN><en>A legacy item without a parent preserves the independent select exception and fabricates no model update/change.</en></lang>
    const independent = mount(UDropdownItem, { props: { value: 7, label: 'Independent' } });
    await independent.get('button.u-dropdown-item').trigger('click');
    expect(independent.emitted('select')).toEqual([[7]]);
    expect(independent.emitted('update:modelValue')).toBeUndefined();
    expect(independent.emitted('change')).toBeUndefined();
  });

  /**
   * @lang zh-CN 验证 open/close 只接受 registry name、允许 0、保持单 active，并让 A→B 切换不伪造 close。
   * @lang en Verifies open/close accept registry names only, allow zero, retain one active item, and avoid fabricating close during an A-to-B switch.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；公开实例与 DOM 断言完成后解决。</zh-CN><en>No return value; resolves after public-instance and DOM assertions complete.</en></lang>
   */
  it('uses explicit names for idempotent single-active open and raw-name close', async () => {
    // <lang><zh-CN>close 日志必须保持为空，直到显式 close 真正关闭当前 item。</zh-CN><en>The close log must remain empty until an explicit close actually closes the current item.</en></lang>
    const closeEvents = [];

    // <lang><zh-CN>两个 item 使用不同类型的稳定 name，证明 identity 不依赖 slot index。</zh-CN><en>Two items use stable names of different types, proving identity does not depend on slot index.</en></lang>
    const RegistryHarness = defineComponent({
      components: { UDropdown, UDropdownItem },
      setup() {
        // <lang><zh-CN>有限 options 由 caller 冻结持有，组件只能读取。</zh-CN><en>Finite options are frozen and owned by the caller, so components can only read them.</en></lang>
        const firstOptions = Object.freeze([Object.freeze({ label: 'Zero option', value: 0 })]);
        const secondOptions = Object.freeze([Object.freeze({ label: 'Second option', value: 'second-value' })]);

        // <lang><zh-CN>listener 只记录 raw-name payload。</zh-CN><en>The listener records only raw-name payloads.</en></lang>
        const recordClose = (name) => closeEvents.push(name);
        return { firstOptions, secondOptions, recordClose };
      },
      template: '<u-dropdown @close="recordClose"><u-dropdown-item :name="0" label="Zero" :model-value="0" :options="firstOptions"/><u-dropdown-item name="second" label="Second" model-value="second-value" :options="secondOptions"/></u-dropdown>'
    });

    // <lang><zh-CN>defineExpose 提供的实例方法是本测试唯一 imperative 入口。</zh-CN><en>The instance methods delivered by defineExpose are the sole imperative entry for this test.</en></lang>
    const wrapper = mount(RegistryHarness);
    const dropdown = wrapper.getComponent(UDropdown);

    // <lang><zh-CN>数字零可打开；同名重复 open 幂等；缺失 name 明确失败。</zh-CN><en>Numeric zero can open; repeating the same name is idempotent; a missing name fails explicitly.</en></lang>
    expect(dropdown.vm.open(0)).toBe(true);
    expect(dropdown.vm.open(0)).toBe(true);
    expect(dropdown.vm.open('missing')).toBe(false);
    await nextTick();
    expect(wrapper.findAll('.u-dropdown-item__panel')).toHaveLength(1);
    expect(wrapper.find('.u-dropdown-item__panel').text()).toContain('Zero option');
    expect(closeEvents).toEqual([]);

    // <lang><zh-CN>A→B 直接切换唯一 active item，不把持续打开的 dropdown 误报为 close。</zh-CN><en>An A-to-B transition switches the sole active item directly without misreporting the still-open dropdown as closed.</en></lang>
    expect(dropdown.vm.open('second')).toBe(true);
    await nextTick();
    expect(wrapper.findAll('.u-dropdown-item__panel')).toHaveLength(1);
    expect(wrapper.find('.u-dropdown-item__panel').text()).toContain('Second option');
    expect(closeEvents).toEqual([]);

    // <lang><zh-CN>首次 close 交付 raw string name；空 close 返回 false 且不追加 sentinel。</zh-CN><en>The first close delivers the raw string name; an empty close returns false and appends no sentinel.</en></lang>
    expect(dropdown.vm.close()).toBe(true);
    expect(dropdown.vm.close()).toBe(false);
    await nextTick();
    expect(wrapper.find('.u-dropdown-item__panel').exists()).toBe(false);
    expect(closeEvents).toEqual(['second']);
  });

  /**
   * @lang zh-CN 验证 option 点击保持 update→close→change、严格数组 identity、重复值首项解析与 disabled 零事件。
   * @lang en Verifies option clicks preserve update-to-close-to-change, strict array identity, first duplicate resolution, and zero events for disabled options.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；值、事件和不可变性断言完成后解决。</zh-CN><en>No return value; resolves after value, event, and immutability assertions complete.</en></lang>
   */
  it('emits controlled option values in update-close-change order without mutation', async () => {
    // <lang><zh-CN>数组 option value 由 caller 冻结并作为 modelValue 同一引用传入。</zh-CN><en>The array option value is frozen by the caller and passed as the same modelValue reference.</en></lang>
    const selectedValue = Object.freeze(['north', 2]);

    // <lang><zh-CN>两个 enabled duplicate 之后放置一个 disabled 项，选中显示必须落在第一个 enabled duplicate。</zh-CN><en>Two enabled duplicates precede one disabled entry, and selected display must resolve to the first enabled duplicate.</en></lang>
    const options = Object.freeze([
      Object.freeze({ label: 'First array', value: selectedValue }),
      Object.freeze({ label: 'Duplicate array', value: selectedValue }),
      Object.freeze({ label: 'Blocked', value: 'blocked', disabled: true })
    ]);

    // <lang><zh-CN>顺序日志同时观察 item model events 与 parent raw-name close。</zh-CN><en>The ordered log observes item model events and the parent raw-name close together.</en></lang>
    const eventOrder = [];

    // <lang><zh-CN>测试壳不回写 modelValue，确保组件不会借 listener 修改 caller 状态。</zh-CN><en>The harness never writes modelValue back, ensuring the component cannot mutate caller state through a listener.</en></lang>
    const OptionsHarness = defineComponent({
      components: { UDropdown, UDropdownItem },
      setup() {
        // <lang><zh-CN>记录函数保留 raw array 引用与跨组件回调顺序。</zh-CN><en>The recorder preserves raw array references and cross-component callback ordering.</en></lang>
        const record = appendObservedEvent.bind(null, eventOrder);
        return { selectedValue, options, record };
      },
      template: '<u-dropdown @close="record(\'close\', $event)"><u-dropdown-item name="filters" label="Filters" :model-value="selectedValue" :options="options" @update:model-value="record(\'update\', $event)" @change="record(\'change\', $event)"/></u-dropdown>'
    });

    // <lang><zh-CN>trigger 打开 panel 不产生任何 P1 值或 close 事件。</zh-CN><en>Opening the panel through the trigger produces no P1 value or close event.</en></lang>
    const wrapper = mount(OptionsHarness);
    await wrapper.get('.u-dropdown-item__trigger').trigger('click');
    expect(eventOrder).toEqual([]);

    // <lang><zh-CN>第一个重复项独占 selected 样式；disabled 项直接点击保持 panel 与事件不变。</zh-CN><en>The first duplicate alone owns selected styling; directly clicking the disabled entry preserves panel and events.</en></lang>
    const optionButtons = wrapper.findAll('.u-dropdown-item__option');
    expect(optionButtons[0].classes()).toContain('u-dropdown-item--selected');
    expect(optionButtons[1].classes()).not.toContain('u-dropdown-item--selected');
    await optionButtons[2].trigger('click');
    expect(eventOrder).toEqual([]);
    expect(wrapper.find('.u-dropdown-item__panel').exists()).toBe(true);

    // <lang><zh-CN>同值显式点击仍交付 raw array，并在 change 前关闭 parent。</zh-CN><en>An explicit same-value click still delivers the raw array and closes the parent before change.</en></lang>
    await optionButtons[0].trigger('click');
    expect(eventOrder).toEqual([
      { type: 'update', payload: selectedValue },
      { type: 'close', payload: 'filters' },
      { type: 'change', payload: selectedValue }
    ]);
    expect(eventOrder[0].payload).toBe(selectedValue);
    expect(eventOrder[2].payload).toBe(selectedValue);
    expect(selectedValue).toEqual(['north', 2]);
    expect(options).toHaveLength(3);
    expect(wrapper.find('.u-dropdown-item__panel').exists()).toBe(false);
  });

  /**
   * @lang zh-CN 验证 duplicate first-wins 与显式 name item 的 missing-parent 零事件边界。
   * @lang en Verifies duplicate first-wins behavior and the zero-event missing-parent boundary for explicitly named items.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；owner 与孤立组件断言完成后解决。</zh-CN><en>No return value; resolves after owner and orphan assertions complete.</en></lang>
   */
  it('keeps duplicate and missing-parent options items inert', async () => {
    // <lang><zh-CN>任何 child model/select 事件都会进入同一日志，使误退回 legacy 立即可见。</zh-CN><en>Any child model/select event enters one log, making an accidental legacy fallback immediately visible.</en></lang>
    const childEvents = [];

    // <lang><zh-CN>两个 child 故意共享 name；第一个 owner 必须稳定保留。</zh-CN><en>Two children intentionally share a name, and the first owner must remain stable.</en></lang>
    const DuplicateHarness = defineComponent({
      components: { UDropdown, UDropdownItem },
      setup() {
        // <lang><zh-CN>两组 options 使用不同文字，便于从 DOM 识别真正 owner。</zh-CN><en>Two option sets use different copy so the true owner can be identified from the DOM.</en></lang>
        const firstOptions = Object.freeze([Object.freeze({ label: 'Owner option', value: 'owner' })]);
        const duplicateOptions = Object.freeze([Object.freeze({ label: 'Duplicate option', value: 'duplicate' })]);
        const record = appendObservedEvent.bind(null, childEvents);
        return { firstOptions, duplicateOptions, record };
      },
      template: '<u-dropdown><u-dropdown-item name="duplicate-name" label="Owner" :options="firstOptions" @update:model-value="record(\'owner-update\', $event)"/><u-dropdown-item name="duplicate-name" label="Duplicate" :options="duplicateOptions" @update:model-value="record(\'duplicate-update\', $event)" @select="record(\'duplicate-select\', $event)"/></u-dropdown>'
    });

    // <lang><zh-CN>后注册 trigger 必须禁用，直接触发也不打开 panel 或发事件。</zh-CN><en>The later trigger must be disabled, and direct triggering opens no panel and emits nothing.</en></lang>
    const wrapper = mount(DuplicateHarness);
    const controlledItems = wrapper.findAll('.u-dropdown-item__controlled');
    const triggers = wrapper.findAll('.u-dropdown-item__trigger');
    expect(triggers[1].attributes('disabled')).toBeDefined();
    await triggers[1].trigger('click');
    expect(childEvents).toEqual([]);
    expect(wrapper.find('.u-dropdown-item__panel').exists()).toBe(false);

    // <lang><zh-CN>按共享 name 打开时只有 first-wins owner 呈现内容。</zh-CN><en>Opening the shared name renders content for the first-wins owner only.</en></lang>
    expect(wrapper.getComponent(UDropdown).vm.open('duplicate-name')).toBe(true);
    await nextTick();
    expect(controlledItems[0].find('.u-dropdown-item__panel').text()).toContain('Owner option');
    expect(controlledItems[1].find('.u-dropdown-item__panel').exists()).toBe(false);

    // <lang><zh-CN>显式 name item 脱离 parent 时仍呈现禁用 trigger，但所有事件保持为空。</zh-CN><en>An explicitly named item outside a parent still renders a disabled trigger while every event remains absent.</en></lang>
    const orphan = mount(UDropdownItem, { props: { name: 'orphan', label: 'Orphan', options: [{ label: 'Value', value: 'value' }] } });
    expect(orphan.get('.u-dropdown-item__trigger').attributes('disabled')).toBeDefined();
    await orphan.get('.u-dropdown-item__trigger').trigger('click');
    expect(orphan.emitted()).toEqual({});
  });

  /**
   * @lang zh-CN 验证 show/name/disabled/unmount/parent-disabled 的声明式变化只清理 registry 或 active state，不伪造 close。
   * @lang en Verifies declarative show/name/disabled/unmount/parent-disabled changes only clean registry or active state and never fabricate close.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；动态组合生命周期断言完成后解决。</zh-CN><en>No return value; resolves after dynamic composition lifecycle assertions complete.</en></lang>
   */
  it('cleans dynamic registrations and disabled active state silently', async () => {
    // <lang><zh-CN>close 数组只允许由真实 trigger/public close 写入；声明式变化必须保持为空。</zh-CN><en>The close array may be written only by a real trigger/public close; declarative changes must leave it empty.</en></lang>
    const closeEvents = [];

    // <lang><zh-CN>测试壳以 refs 显式控制所有 lifecycle 输入，不依赖 timer 或全局 store。</zh-CN><en>The harness controls every lifecycle input explicitly with refs and depends on no timer or global store.</en></lang>
    const LifecycleHarness = defineComponent({
      components: { UDropdown, UDropdownItem },
      setup() {
        // <lang><zh-CN>各 ref 分别控制 identity、membership、child guard、mount 与 parent guard。</zh-CN><en>Each ref independently controls identity, membership, child guard, mount, and parent guard.</en></lang>
        const itemName = ref('alpha');
        const shown = ref(true);
        const itemDisabled = ref(false);
        const mounted = ref(true);
        const parentDisabledState = ref(false);
        const options = Object.freeze([Object.freeze({ label: 'Value', value: 'value' })]);

        // <lang><zh-CN>listener 保留 raw name，不执行回写。</zh-CN><en>The listener preserves the raw name and performs no writeback.</en></lang>
        const recordClose = (name) => closeEvents.push(name);
        return { itemName, shown, itemDisabled, mounted, parentDisabledState, options, recordClose };
      },
      template: '<u-dropdown :disabled="parentDisabledState" @close="recordClose"><u-dropdown-item v-if="mounted" :name="itemName" label="Dynamic" :show="shown" :disabled="itemDisabled" :options="options"/></u-dropdown>'
    });

    // <lang><zh-CN>先打开 alpha，随后 child disabled 同步失效 active，但不发 close。</zh-CN><en>Opens alpha first, then child disabled synchronously invalidates active without emitting close.</en></lang>
    const wrapper = mount(LifecycleHarness);
    const dropdown = wrapper.getComponent(UDropdown);
    expect(dropdown.vm.open('alpha')).toBe(true);
    wrapper.vm.itemDisabled = true;
    await nextTick();
    expect(dropdown.vm.close()).toBe(false);
    expect(closeEvents).toEqual([]);

    // <lang><zh-CN>重新启用只恢复可打开性；show=false 会卸载 registry membership。</zh-CN><en>Re-enabling restores only openability; show=false removes registry membership.</en></lang>
    wrapper.vm.itemDisabled = false;
    await nextTick();
    expect(dropdown.vm.open('alpha')).toBe(true);
    wrapper.vm.shown = false;
    await nextTick();
    expect(dropdown.vm.open('alpha')).toBe(false);
    expect(dropdown.vm.close()).toBe(false);
    expect(closeEvents).toEqual([]);

    // <lang><zh-CN>重新显示并换名后，旧 name 失败且新 name 成功。</zh-CN><en>After showing again and changing the name, the old name fails and the new name succeeds.</en></lang>
    wrapper.vm.shown = true;
    wrapper.vm.itemName = 'beta';
    await nextTick();
    expect(dropdown.vm.open('alpha')).toBe(false);
    expect(dropdown.vm.open('beta')).toBe(true);

    // <lang><zh-CN>active child 卸载会准确 unregister 并静默清理 active。</zh-CN><en>Unmounting the active child unregisters it exactly and silently clears active state.</en></lang>
    wrapper.vm.mounted = false;
    await nextTick();
    expect(dropdown.vm.close()).toBe(false);
    expect(dropdown.vm.open('beta')).toBe(false);
    expect(closeEvents).toEqual([]);

    // <lang><zh-CN>重新挂载后 parent disabled 同样只清短生命状态，不产生 close 或自动重开。</zh-CN><en>After remount, parent disabled likewise clears only short-lived state and produces neither close nor automatic reopen.</en></lang>
    wrapper.vm.mounted = true;
    await nextTick();
    expect(dropdown.vm.open('beta')).toBe(true);
    wrapper.vm.parentDisabledState = true;
    await nextTick();
    expect(dropdown.vm.close()).toBe(false);
    expect(dropdown.vm.open('beta')).toBe(false);
    expect(closeEvents).toEqual([]);
  });

  /**
   * @lang zh-CN 验证 options 模式 default slot 只替代 active panel 内容，trigger 再次点击通过 raw-name close 收起。
   * @lang en Verifies the default slot in options mode replaces only active panel content and a second trigger click collapses through raw-name close.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；slot 与 trigger 状态断言完成后解决。</zh-CN><en>No return value; resolves after slot and trigger-state assertions complete.</en></lang>
   */
  it('maps the default slot to controlled panel content and toggles by name', async () => {
    // <lang><zh-CN>close 日志用于确认 trigger 关闭时交付显式 name。</zh-CN><en>The close log confirms that trigger-driven closing delivers the explicit name.</en></lang>
    const closeEvents = [];

    // <lang><zh-CN>caller slot 是纯本地内容，不携带命令、路由或 scoped business data。</zh-CN><en>The caller slot is pure local content and carries no command, route, or scoped business data.</en></lang>
    const SlotHarness = defineComponent({
      components: { UDropdown, UDropdownItem },
      setup() {
        // <lang><zh-CN>内建 options 故意存在，以证明 default slot 会替代其呈现。</zh-CN><en>Built-in options intentionally exist to prove the default slot replaces their presentation.</en></lang>
        const options = Object.freeze([Object.freeze({ label: 'Built-in', value: 'built-in' })]);
        const recordClose = (name) => closeEvents.push(name);
        return { options, recordClose };
      },
      template: '<u-dropdown @close="recordClose"><u-dropdown-item name="slot-item" label="Slot trigger" :options="options"><view class="caller-panel">Caller panel</view></u-dropdown-item></u-dropdown>'
    });

    // <lang><zh-CN>首次 trigger 点击打开 caller panel，且不会同时渲染内建 option button。</zh-CN><en>The first trigger click opens the caller panel without also rendering built-in option buttons.</en></lang>
    const wrapper = mount(SlotHarness);
    const trigger = wrapper.get('.u-dropdown-item__trigger');
    await trigger.trigger('click');
    expect(wrapper.get('.caller-panel').text()).toBe('Caller panel');
    expect(wrapper.find('.u-dropdown-item__option').exists()).toBe(false);
    expect(closeEvents).toEqual([]);

    // <lang><zh-CN>再次点击同一 active trigger 关闭 panel，并只交付一次 raw name。</zh-CN><en>Clicking the same active trigger again closes the panel and delivers the raw name exactly once.</en></lang>
    await trigger.trigger('click');
    expect(wrapper.find('.caller-panel').exists()).toBe(false);
    expect(closeEvents).toEqual(['slot-item']);
  });
});
