/**
 * @module hia-uview-form.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证 P66 表单 owner、实例私有 registry、嵌套隔离、显式 reset/clear 与异步陈旧结果边界。测试不启动网络、存储、路由、平台服务或动态脚本，也不把 jsdom 结果冒充小程序真机证据。
 * @lang en Uses the real Vue runtime to verify P66 form ownership, instance-private registries, nested isolation, explicit reset/clear, and stale-async-result boundaries. The tests start no network, storage, routing, platform service, or dynamic script and do not present jsdom results as mini-program device evidence.
 */

// <lang><zh-CN>导入 Vue 测试壳、受控响应式状态、Vitest 断言与仓内真实组件；没有全局 plugin 或平台 mock。</zh-CN><en>Imports the Vue test harness, controlled reactive state, Vitest assertions, and real repository components; no global plugin or platform mock is installed.</en></lang>
import { defineComponent, nextTick, reactive, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { UForm, UFormItem } from '../../HIA-uView-UI/src/index.mjs';

/**
 * @lang zh-CN 创建由测试显式解决的 Promise，用于稳定控制 validator 完成顺序而不使用定时器。
 * @lang en Creates a Promise resolved explicitly by the test so validator completion order is controlled without timers.
 * @returns {{promise:Promise<unknown>,resolve:function(unknown):void}} <lang><zh-CN>待决 Promise 与唯一解决函数。</zh-CN><en>Pending Promise and its sole resolver.</en></lang>
 */
function createDeferred() {
  // <lang><zh-CN>resolver 在 Promise 构造期间同步赋值；默认函数只防止静态未初始化分支。</zh-CN><en>The resolver is assigned synchronously during Promise construction; the default function only guards the statically uninitialized branch.</en></lang>
  let resolve = () => {};
  // <lang><zh-CN>Promise 不启动任务，只等待测试提供一个 validator 结果。</zh-CN><en>The Promise starts no task and only waits for a validator result supplied by the test.</en></lang>
  const promise = new Promise((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}

/**
 * @lang zh-CN 验证公开 imperative 表面使用最近注册字段，并且普通编辑与显式 reset 具有不同所有权。
 * @lang en Verifies that the public imperative surface uses the nearest registered fields and that ordinary edits and explicit reset have distinct ownership.
 */
describe('P66 form owner and field lifecycle', () => {
  /**
   * @lang zh-CN 验证 validate/callback/clear、合法未注册选择、深快照 reset 与 reset intent 分离。
   * @lang en Verifies validate/callback/clear, a valid unregistered selection, deep-snapshot reset, and separation of reset intent.
   * @returns {Promise<void>} <lang><zh-CN>真实 Vue 更新与校验完成后解决。</zh-CN><en>Resolves after real Vue updates and validation complete.</en></lang>
   */
  it('validates caller state and writes it only through explicit reset commands', async () => {
    // <lang><zh-CN>测试壳拥有 model/rules/reset 计数；组件只读取或按显式 reset 写既有字段。</zh-CN><en>The harness owns the model, rules, and reset count; components only read or write existing fields through explicit reset.</en></lang>
    const Harness = defineComponent({
      components: { UForm, UFormItem },
      setup() {
        // <lang><zh-CN>两个字段同时覆盖字符串规则和可变嵌套快照。</zh-CN><en>Two fields cover a string rule and a mutable nested snapshot together.</en></lang>
        const model = reactive({ profile: { name: 'Initial', preferences: { tags: ['one'] } } });
        // <lang><zh-CN>规则文字由测试调用方提供，库不生成 locale 默认值。</zh-CN><en>Rule copy is supplied by the test caller; the library generates no locale default.</en></lang>
        const rules = { 'profile.name': [{ required: true, message: 'Name required' }] };
        // <lang><zh-CN>模板 ref 只读取公开 expose，不访问内部 registry。</zh-CN><en>The template ref reads only public exposed methods and never accesses the internal registry.</en></lang>
        const form = ref(null);
        // <lang><zh-CN>resetCount 观察旧 requestReset 意图，而不把它误当成字段恢复命令。</zh-CN><en>ResetCount observes the legacy requestReset intent without treating it as a field-restoration command.</en></lang>
        const resetCount = ref(0);
        return { form, model, rules, resetCount };
      },
      template: '<u-form ref="form" :model="model" :rules="rules" @reset="resetCount += 1"><u-form-item prop="profile.name" label="Name"><input /></u-form-item><u-form-item prop="profile.preferences" label="Preferences"><input /></u-form-item></u-form>'
    });

    // <lang><zh-CN>挂载后两个 item 已捕获调用方初值并按实例注册。</zh-CN><en>After mounting, both items have captured caller initial values and registered by instance.</en></lang>
    const wrapper = mount(Harness);
    // <lang><zh-CN>callback spy 只收集公开 boolean/error 数组，不读取组件内部 ref。</zh-CN><en>The callback spy collects only the public boolean/error array and reads no component-internal ref.</en></lang>
    const callback = vi.fn();

    // <lang><zh-CN>普通编辑由宿主直接完成；随后 validate 读取当前值但不改回 model。</zh-CN><en>An ordinary edit is performed directly by the host; validate then reads the current value without writing back to the model.</en></lang>
    wrapper.vm.model.profile.name = '';
    await expect(wrapper.vm.form.validate(callback)).resolves.toBe(false);
    expect(callback).toHaveBeenCalledWith(false, [{ code: 'required', message: 'Name required', prop: 'profile.name', ruleIndex: 0, trigger: '' }]);
    expect(wrapper.text()).toContain('Name required');

    // <lang><zh-CN>局部 clear 只移除内部投影；合法但未注册字段选择是空集合成功。</zh-CN><en>Local clear removes only the internal projection; selecting a valid but unregistered field succeeds as an empty set.</en></lang>
    wrapper.vm.form.clearValidate('profile.name');
    await nextTick();
    expect(wrapper.text()).not.toContain('Name required');
    await expect(wrapper.vm.form.validateField('profile.unmounted')).resolves.toBe(true);

    // <lang><zh-CN>requestReset 只发出旧意图，既不改字符串也不恢复嵌套数组。</zh-CN><en>RequestReset emits only the legacy intent and changes neither the string nor the nested array.</en></lang>
    wrapper.vm.model.profile.name = 'Changed by caller';
    wrapper.vm.model.profile.preferences.tags.push('two');
    wrapper.vm.form.requestReset();
    expect(wrapper.vm.resetCount).toBe(1);
    expect(wrapper.vm.model.profile).toEqual({ name: 'Changed by caller', preferences: { tags: ['one', 'two'] } });

    // <lang><zh-CN>显式 resetFields 是唯一写入点，并以新深快照恢复两个已存在路径。</zh-CN><en>Explicit resetFields is the sole write point and restores both existing paths from fresh deep snapshots.</en></lang>
    wrapper.vm.form.resetFields();
    expect(wrapper.vm.model.profile).toEqual({ name: 'Initial', preferences: { tags: ['one'] } });
  });

  /**
   * @lang zh-CN 验证重复 prop 使用实例 token，卸载其中一项不会误删另一项。
   * @lang en Verifies that duplicate props use instance tokens so unmounting one item cannot delete the other.
   * @returns {Promise<void>} <lang><zh-CN>两轮校验与动态卸载完成后解决。</zh-CN><en>Resolves after two validation rounds and dynamic unmount complete.</en></lang>
   */
  it('keeps duplicate-prop registry entries independent during unmount', async () => {
    // <lang><zh-CN>validator 调用计数直接证明 registry 中的实例数，而不暴露 Map。</zh-CN><en>The validator-call count directly proves registry instance count without exposing the Map.</en></lang>
    let validatorCalls = 0;
    // <lang><zh-CN>测试壳可动态卸载第二项；两个 item 故意共享同一安全 prop。</zh-CN><en>The harness can dynamically unmount the second item; both items deliberately share the same safe prop.</en></lang>
    const Harness = defineComponent({
      components: { UForm, UFormItem },
      setup() {
        // <lang><zh-CN>非空字段确保自定义 validator 会执行。</zh-CN><en>A nonempty field ensures the custom validator runs.</en></lang>
        const model = reactive({ value: 'ready' });
        // <lang><zh-CN>同步 validator 只增加本地计数并通过，不启动外部副作用。</zh-CN><en>The synchronous validator only increments a local count and passes, starting no external side effect.</en></lang>
        const rules = { value: { validator: () => { validatorCalls += 1; return true; } } };
        // <lang><zh-CN>公开 form ref 用于两轮整体验证。</zh-CN><en>The public form ref is used for two whole-form validations.</en></lang>
        const form = ref(null);
        // <lang><zh-CN>showSecond 只控制第二个实例生命周期。</zh-CN><en>ShowSecond controls only the second instance lifecycle.</en></lang>
        const showSecond = ref(true);
        return { form, model, rules, showSecond };
      },
      template: '<u-form ref="form" :model="model" :rules="rules"><u-form-item prop="value"><input /></u-form-item><u-form-item v-if="showSecond" prop="value"><input /></u-form-item></u-form>'
    });

    // <lang><zh-CN>首轮两个 descriptor 各执行一次。</zh-CN><en>Each of the two descriptors runs once in the first round.</en></lang>
    const wrapper = mount(Harness);
    await expect(wrapper.vm.form.validate()).resolves.toBe(true);
    expect(validatorCalls).toBe(2);

    // <lang><zh-CN>卸载第二项后按其 Symbol 注销；剩余同 prop 项仍能校验。</zh-CN><en>After the second item unmounts it unregisters by its Symbol; the remaining same-prop item still validates.</en></lang>
    validatorCalls = 0;
    wrapper.vm.showSecond = false;
    await nextTick();
    await expect(wrapper.vm.form.validate()).resolves.toBe(true);
    expect(validatorCalls).toBe(1);
  });

  /**
   * @lang zh-CN 验证嵌套 UForm 使用最近祖先 context，外层校验不读取或运行内层字段。
   * @lang en Verifies that nested UForm uses the nearest-ancestor context and outer validation neither reads nor runs inner fields.
   * @returns {Promise<void>} <lang><zh-CN>外层与内层独立校验完成后解决。</zh-CN><en>Resolves after independent outer and inner validation complete.</en></lang>
   */
  it('isolates nested forms through the nearest owner context', async () => {
    // <lang><zh-CN>两个 owner 使用独立 model/rules/ref；内层物理位于外层 slot 内但不进入外层 registry。</zh-CN><en>Two owners use independent models, rules, and refs; the inner form is physically inside the outer slot but never enters the outer registry.</en></lang>
    const Harness = defineComponent({
      components: { UForm, UFormItem },
      setup() {
        // <lang><zh-CN>两个字段初始均为空，用于分别观察 required 失败。</zh-CN><en>Both fields start empty so required failures can be observed independently.</en></lang>
        const outerModel = reactive({ name: '' });
        const innerModel = reactive({ code: '' });
        // <lang><zh-CN>规则文字不同，避免 DOM 断言混淆 owner。</zh-CN><en>Distinct rule copy prevents DOM assertions from confusing owners.</en></lang>
        const outerRules = { name: { required: true, message: 'Outer required' } };
        const innerRules = { code: { required: true, message: 'Inner required' } };
        // <lang><zh-CN>两个 ref 只访问各自公开 API。</zh-CN><en>Both refs access only their respective public APIs.</en></lang>
        const outerForm = ref(null);
        const innerForm = ref(null);
        return { outerModel, innerModel, outerRules, innerRules, outerForm, innerForm };
      },
      template: '<u-form ref="outerForm" :model="outerModel" :rules="outerRules"><u-form-item prop="name"><input /></u-form-item><u-form ref="innerForm" :model="innerModel" :rules="innerRules"><u-form-item prop="code"><input /></u-form-item></u-form></u-form>'
    });

    // <lang><zh-CN>外层先因自己的字段失败；内层错误尚未被外层触发。</zh-CN><en>The outer form first fails on its own field; the inner error has not been triggered by the outer form.</en></lang>
    const wrapper = mount(Harness);
    await expect(wrapper.vm.outerForm.validate()).resolves.toBe(false);
    expect(wrapper.text()).toContain('Outer required');
    expect(wrapper.text()).not.toContain('Inner required');

    // <lang><zh-CN>修复外层后，即使内层仍为空，外层也独立通过。</zh-CN><en>After fixing the outer field, the outer form passes independently even while the inner field remains empty.</en></lang>
    wrapper.vm.outerModel.name = 'ready';
    await expect(wrapper.vm.outerForm.validate()).resolves.toBe(true);
    await expect(wrapper.vm.innerForm.validate()).resolves.toBe(false);
    expect(wrapper.text()).toContain('Inner required');
  });

  /**
   * @lang zh-CN 验证 clear、reset、prop 改变与卸载都会撤销旧异步 validator 的 UI 写入资格。
   * @lang en Verifies that clear, reset, prop change, and unmount each revoke an old async validator's eligibility to write UI.
   * @returns {Promise<void>} <lang><zh-CN>四个受控 Promise 与 Vue 生命周期变化完成后解决。</zh-CN><en>Resolves after four controlled Promises and Vue lifecycle changes complete.</en></lang>
   */
  it('prevents stale async results from restoring obsolete errors', async () => {
    // <lang><zh-CN>pending 队列按 validator 调用顺序保存受控 Promise。</zh-CN><en>The pending queue stores controlled Promises in validator-call order.</en></lang>
    const pending = [];
    // <lang><zh-CN>每次规则调用创建一个无 timer 的待决结果。</zh-CN><en>Each rule invocation creates one pending result without a timer.</en></lang>
    const createAsyncRule = () => ({
      message: 'Configured async error',
      asyncValidator: () => {
        // <lang><zh-CN>当前 deferred 只暴露给本测试队列，不进入组件或公开错误。</zh-CN><en>The current deferred is exposed only to this test queue and never enters the component or a public error.</en></lang>
        const deferred = createDeferred();
        pending.push(deferred);
        return deferred.promise;
      }
    });
    // <lang><zh-CN>测试壳允许切换安全 prop 与卸载 item，model/rules 始终由宿主拥有。</zh-CN><en>The harness permits switching a safe prop and unmounting the item while the host always owns model and rules.</en></lang>
    const Harness = defineComponent({
      components: { UForm, UFormItem },
      setup() {
        // <lang><zh-CN>两个字段使用不同初值，便于确认 reset 只恢复当前字段快照。</zh-CN><en>Two fields use different initial values so reset can be confirmed to restore only the current field snapshot.</en></lang>
        const model = reactive({ first: 'initial-first', second: 'initial-second' });
        // <lang><zh-CN>两个 path 各有独立规则对象，但共享受控 deferred 工厂。</zh-CN><en>Each path has an independent rule object while sharing the controlled deferred factory.</en></lang>
        const rules = { first: createAsyncRule(), second: createAsyncRule() };
        // <lang><zh-CN>form/item ref 只调用冻结的公开 imperative API。</zh-CN><en>Form and item refs call only the frozen public imperative APIs.</en></lang>
        const form = ref(null);
        const item = ref(null);
        // <lang><zh-CN>field 和 showItem 分别驱动 prop-change 与 unmount 边界。</zh-CN><en>Field and showItem drive the prop-change and unmount boundaries respectively.</en></lang>
        const field = ref('first');
        const showItem = ref(true);
        return { model, rules, form, item, field, showItem };
      },
      template: '<u-form ref="form" :model="model" :rules="rules"><u-form-item v-if="showItem" ref="item" :prop="field"><input /></u-form-item></u-form>'
    });

    // <lang><zh-CN>clear 先使第一轮 stale；Promise 仍向原调用方返回快照错误，但不得恢复 DOM 消息。</zh-CN><en>Clear first makes the initial run stale; the Promise may still return its snapshot error to the original caller but must not restore a DOM message.</en></lang>
    const wrapper = mount(Harness);
    const clearRun = wrapper.vm.item.validate();
    wrapper.vm.item.clearValidate();
    pending[0].resolve(false);
    await clearRun;
    await nextTick();
    expect(wrapper.text()).not.toContain('Configured async error');

    // <lang><zh-CN>reset 同时恢复挂载快照并撤销第二轮 UI 写入。</zh-CN><en>Reset both restores the mount snapshot and revokes the second run's UI write.</en></lang>
    wrapper.vm.model.first = 'changed-first';
    const resetRun = wrapper.vm.item.validate();
    wrapper.vm.item.resetField();
    pending[1].resolve(false);
    await resetRun;
    await nextTick();
    expect(wrapper.vm.model.first).toBe('initial-first');
    expect(wrapper.text()).not.toContain('Configured async error');

    // <lang><zh-CN>prop 改变先注销旧 descriptor、清状态并捕获 second 初值；旧 first 结果不得写新字段 UI。</zh-CN><en>A prop change first unregisters the old descriptor, clears state, and captures the second initial value; the old first result cannot write the new field UI.</en></lang>
    const pathRun = wrapper.vm.item.validate();
    wrapper.vm.field = 'second';
    await nextTick();
    pending[2].resolve(false);
    await pathRun;
    await nextTick();
    expect(wrapper.text()).not.toContain('Configured async error');

    // <lang><zh-CN>卸载撤销最后一轮并按实例 token 注销；晚到结果不得产生消息或未处理 rejection。</zh-CN><en>Unmount revokes the final run and unregisters by instance token; a late result creates neither a message nor an unhandled rejection.</en></lang>
    const unmountRun = wrapper.vm.item.validate();
    wrapper.vm.showItem = false;
    await nextTick();
    pending[3].resolve(false);
    await unmountRun;
    await nextTick();
    expect(wrapper.find('.u-form-item').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('Configured async error');
  });
});
