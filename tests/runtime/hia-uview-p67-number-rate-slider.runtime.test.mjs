/**
 * @module hia-uview-p67-number-rate-slider.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证 P67 number-box、rate 与 native slider 的有限数值、事件顺序、显式别名及失败关闭边界。测试不启动定时器、节点测量、触摸几何、平台 API、网络、存储或业务数量/评分规则，也不替代小程序 DevTools 或真机证据。
 * @lang en Uses the real Vue runtime to verify P67 number-box, rate, and native-slider finite numbers, event order, explicit aliases, and fail-closed boundaries. Tests start no timer, node measurement, touch geometry, platform API, network, storage, or business quantity/rating rule and do not replace Mini Program DevTools or device evidence.
 */

// <lang><zh-CN>导入本地 Vue 挂载器、断言和三个真实组件；测试不安装全局 plugin 或平台 mock。</zh-CN><en>Imports the local Vue mount harness, assertions, and three real components; the tests install no global plugin or platform mock.</en></lang>
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { UNumberBox, URate, USlider } from '../../HIA-uView-UI/src/index.mjs';

/**
 * @lang zh-CN 用标准 input 承载 Vue runtime 中的 UniApp slider 原生事件与属性；它只消除 jsdom 对平台标签的解析告警，不模拟触摸、布局或平台行为。
 * @lang en Uses a standard input to carry the UniApp slider's native events and attributes in Vue runtime; it only removes jsdom platform-tag resolution warnings and simulates no touch, layout, or platform behavior.
 * @type {Readonly<object>}
 */
const NativeSliderStub = Object.freeze({
  inheritAttrs: false,
  template: '<div v-bind="$attrs"></div>'
});

/** @lang zh-CN 验证 number-box 十进制定点步进、范围规整与固定 scalar 事件顺序。 @lang en Verifies number-box decimal fixed-point stepping, range normalization, and fixed scalar event order. */
describe('P67 number-box finite decimal state', () => {
  /**
   * @lang zh-CN 验证常见小数加减不泄漏二进制漂移，并在反向有限边界上 clamp。
   * @lang en Verifies common decimal addition/subtraction does not leak binary drift and clamps against reversed finite bounds.
   * @returns {Promise<void>} <lang><zh-CN>两次受控交互与 prop 更新完成后解决。</zh-CN><en>Resolves after two controlled interactions and a prop update complete.</en></lang>
   */
  it('steps decimal values exactly and emits scalar intent in a fixed order', async () => {
    // <lang><zh-CN>caller listener 记录跨事件顺序，避免只比较每个事件自己的数组。</zh-CN><en>Caller listeners record cross-event order rather than comparing each event array in isolation.</en></lang>
    const eventOrder = [];
    const numberBox = mount(UNumberBox, {
      props: {
        modelValue: 0.2,
        min: 1,
        max: 0,
        step: 0.1,
        'onUpdate:modelValue': (value) => eventOrder.push(['update', value]),
        onInput: (value) => eventOrder.push(['input', value]),
        onChange: (value) => eventOrder.push(['change', value])
      }
    });

    // <lang><zh-CN>有限反向边界按既有 HIA 兼容规则整理为 0..1，第一次增加精确得到 0.3。</zh-CN><en>Finite reversed bounds follow the existing HIA compatibility rule and normalize to 0..1, with the first increment producing exact 0.3.</en></lang>
    const controls = numberBox.findAll('button.u-number-box__button');
    await controls[1].trigger('click');
    expect(eventOrder).toEqual([
      ['update', 0.3],
      ['input', 0.3],
      ['change', 0.3]
    ]);

    // <lang><zh-CN>caller 接受候选后更新 model；减少路径必须精确返回 0.2，并重复同一事件顺序。</zh-CN><en>After the caller accepts the candidate and updates the model, decrement must return exact 0.2 with the same event order.</en></lang>
    await numberBox.setProps({ modelValue: 0.3 });
    await controls[0].trigger('click');
    expect(eventOrder.slice(3)).toEqual([
      ['update', 0.2],
      ['input', 0.2],
      ['change', 0.2]
    ]);

    // <lang><zh-CN>在上界接近位置的步进先定点计算再 clamp，最终只能报告精确上界 1。</zh-CN><en>A step near the upper bound is calculated in fixed point before clamping and can report only the exact upper bound 1.</en></lang>
    await numberBox.setProps({ modelValue: 0.95, step: 0.1 });
    await controls[1].trigger('click');
    expect(eventOrder.slice(-3)).toEqual([
      ['update', 1],
      ['input', 1],
      ['change', 1]
    ]);
  });

  /**
   * @lang zh-CN 验证严格十进制输入、异常 step 回退、只读原生属性和无效范围零事件。
   * @lang en Verifies strict decimal input, invalid-step fallback, readonly native attributes, and zero events for invalid ranges.
   * @returns {Promise<void>} <lang><zh-CN>所有正反输入与 guard 交互完成后解决。</zh-CN><en>Resolves after all positive/negative input and guard interactions complete.</en></lang>
   */
  it('fails closed for permissive input syntax and native guarded states', async () => {
    // <lang><zh-CN>有效直接输入只做范围 clamp，不强制落到按钮 step 网格。</zh-CN><en>Valid direct input performs range clamping only and is not forced onto the button-step grid.</en></lang>
    const numberBox = mount(UNumberBox, { props: { modelValue: 2, min: 0, max: 5, step: 0 } });
    const input = numberBox.get('input.u-number-box__input');
    await input.trigger('input', { detail: { value: ' 4.25 ' } });
    expect(numberBox.emitted('update:modelValue')).toEqual([[4.25]]);
    expect(numberBox.emitted('input')).toEqual([[4.25]]);
    expect(numberBox.emitted('change')).toEqual([[4.25]]);

    // <lang><zh-CN>caller 更新后，hex、空白、boolean 与非有限 number 均不能追加事件。</zh-CN><en>After the caller update, hexadecimal, whitespace-only, boolean, and non-finite numbers cannot append events.</en></lang>
    await numberBox.setProps({ modelValue: 4.25 });
    await input.trigger('input', { detail: { value: '0x10' } });
    await input.trigger('input', { detail: { value: '   ' } });
    await input.trigger('input', { detail: { value: true } });
    await input.trigger('input', { detail: { value: Number.POSITIVE_INFINITY } });
    expect(numberBox.emitted('update:modelValue')).toHaveLength(1);

    // <lang><zh-CN>非正 step 回退 1；4.25 增加后 clamp 到 5，不引入 NaN 或循环。</zh-CN><en>A non-positive step falls back to 1; incrementing 4.25 clamps to 5 without NaN or looping.</en></lang>
    await numberBox.findAll('button.u-number-box__button')[1].trigger('click');
    expect(numberBox.emitted('update:modelValue')?.at(-1)).toEqual([5]);

    // <lang><zh-CN>readonly 同时落到两个原生按钮、input readonly 和 handler 零事件。</zh-CN><en>Readonly applies simultaneously to both native buttons, the input readonly attribute, and handler zero events.</en></lang>
    const readonlyBox = mount(UNumberBox, { props: { modelValue: 2, readonly: true } });
    expect(readonlyBox.findAll('button').every((button) => button.attributes('disabled') !== undefined)).toBe(true);
    expect(readonlyBox.get('input').attributes('readonly')).toBeDefined();
    await readonlyBox.findAll('button')[1].trigger('click');
    await readonlyBox.get('input').trigger('input', { detail: { value: '3' } });
    expect(readonlyBox.emitted()).toEqual({});

    // <lang><zh-CN>非有限范围把全部原生输入路径关闭，组件不猜测替代边界。</zh-CN><en>A non-finite range closes every native input path and the component does not guess replacement bounds.</en></lang>
    const invalidRange = mount(UNumberBox, { props: { modelValue: 2, max: Number.NaN } });
    expect(invalidRange.get('input').attributes('disabled')).toBeDefined();
    expect(invalidRange.findAll('button').every((button) => button.attributes('disabled') !== undefined)).toBe(true);
    await invalidRange.get('input').trigger('input', { detail: { value: '3' } });
    expect(invalidRange.emitted()).toEqual({});
  });

  /**
   * @lang zh-CN 冻结指数十进制输入、超过十五位的小步长与安全整数加法溢出的边缘分支。
   * @lang en Freezes edge branches for decimal-exponent input, a step beyond fifteen decimal places, and safe-integer addition overflow.
   * @returns {Promise<void>} <lang><zh-CN>三个独立边缘实例完成交互后解决。</zh-CN><en>Resolves after interactions complete for three independent edge instances.</en></lang>
   */
  it('accepts decimal exponents while unsafe fixed-point arithmetic remains event-free', async () => {
    // <lang><zh-CN>普通十进制指数仍属于严格语法，并在范围内按 update→input→change 报告 125。</zh-CN><en>An ordinary decimal exponent remains strict syntax and reports 125 within bounds in update-to-input-to-change order.</en></lang>
    const exponentOrder = [];
    const exponentBox = mount(UNumberBox, {
      props: {
        max: 200,
        min: 0,
        modelValue: 0,
        onChange: (value) => exponentOrder.push(['change', value]),
        onInput: (value) => exponentOrder.push(['input', value]),
        'onUpdate:modelValue': (value) => exponentOrder.push(['update', value])
      }
    });
    await exponentBox.get('input.u-number-box__input').trigger('input', { detail: { value: '1.25e+2' } });
    expect(exponentOrder).toEqual([
      ['update', 125],
      ['input', 125],
      ['change', 125]
    ]);

    // <lang><zh-CN>1e-16 需要十六位定点精度，超过冻结上限；增加按钮存在但必须保持零事件。</zh-CN><en>A 1e-16 step requires sixteen fixed-point decimal places beyond the frozen limit; the increment button exists but must remain event-free.</en></lang>
    const excessivePrecision = mount(UNumberBox, { props: { max: 1, min: 0, modelValue: 0, step: 1e-16 } });
    await excessivePrecision.findAll('button.u-number-box__button')[1].trigger('click');
    // <lang><zh-CN>可用原生 button 的 DOM click 可由 Vue test wrapper 观察；冻结的是组件声明的三个数值事件均不存在。</zh-CN><en>The Vue test wrapper may observe the DOM click of an enabled native button; the frozen boundary is absence of all three component-declared numeric events.</en></lang>
    expect(excessivePrecision.emitted('update:modelValue')).toBeUndefined();
    expect(excessivePrecision.emitted('input')).toBeUndefined();
    expect(excessivePrecision.emitted('change')).toBeUndefined();

    // <lang><zh-CN>两个单独安全整数的和可能越过 MAX_SAFE_INTEGER；该分支不退回普通浮点加法。</zh-CN><en>The sum of two individually safe integers can exceed MAX_SAFE_INTEGER; this branch never falls back to ordinary floating-point addition.</en></lang>
    const unsafeSum = mount(UNumberBox, {
      props: {
        max: Number.MAX_SAFE_INTEGER,
        min: 0,
        modelValue: Number.MAX_SAFE_INTEGER - 1,
        step: 2
      }
    });
    await unsafeSum.findAll('button.u-number-box__button')[1].trigger('click');
    expect(unsafeSum.emitted('update:modelValue')).toBeUndefined();
    expect(unsafeSum.emitted('input')).toBeUndefined();
    expect(unsafeSum.emitted('change')).toBeUndefined();
  });
});

/** @lang zh-CN 验证 rate 的显式 current 迁移优先级、有限显示和受控事件。 @lang en Verifies rate explicit-current migration precedence, finite display, and controlled events. */
describe('P67 rate explicit alias state', () => {
  /**
   * @lang zh-CN 验证显式 current（包括零）优先，选择仍按 model/input/change 顺序报告。
   * @lang en Verifies explicit current, including zero, takes precedence while selection still reports model/input/change order.
   * @returns {Promise<void>} <lang><zh-CN>选择与 prop 更新完成后解决。</zh-CN><en>Resolves after selection and prop updates complete.</en></lang>
   */
  it('lets an explicit current value win without taking caller ownership', async () => {
    // <lang><zh-CN>跨事件数组证明新增 alias 不改变既有 HIA scalar 事件顺序。</zh-CN><en>The cross-event array proves the new alias does not change existing HIA scalar event order.</en></lang>
    const eventOrder = [];
    const rate = mount(URate, {
      props: {
        modelValue: 4,
        current: 2,
        count: 5,
        'onUpdate:modelValue': (value) => eventOrder.push(['update', value]),
        onInput: (value) => eventOrder.push(['input', value]),
        onChange: (value) => eventOrder.push(['change', value])
      }
    });

    // <lang><zh-CN>显式 current=2 只激活前两项，即使 modelValue=4。</zh-CN><en>Explicit current=2 activates only the first two items even when modelValue=4.</en></lang>
    const items = rate.findAll('button.u-rate__item');
    expect(items.filter((item) => item.classes().includes('u-rate__item--active'))).toHaveLength(2);
    await items[3].trigger('click');
    expect(eventOrder).toEqual([
      ['update', 4],
      ['input', 4],
      ['change', 4]
    ]);

    // <lang><zh-CN>组件只回传 model intent，不修改 current；显式 0 更新后必须压过仍为 4 的 model。</zh-CN><en>The component reports model intent only and never modifies current; an explicit update to 0 must override the still-4 model.</en></lang>
    await rate.setProps({ current: 0 });
    expect(rate.findAll('.u-rate__item--active')).toHaveLength(0);
  });

  /**
   * @lang zh-CN 验证缺省 current 回退 model，异常显式 current 不回退，disabled 保持零事件。
   * @lang en Verifies absent current falls back to model, an invalid explicit current does not fall back, and disabled remains event-free.
   * @returns {Promise<void>} <lang><zh-CN>三个独立实例断言完成后解决。</zh-CN><en>Resolves after assertions for three independent instances complete.</en></lang>
   */
  it('keeps invalid aliases and disabled selection deterministic', async () => {
    // <lang><zh-CN>未提供 current 时 modelValue 继续拥有显示状态；小数 count 向下收紧为有限项数。</zh-CN><en>When current is absent, modelValue continues to own display state; a fractional count narrows down to a finite item count.</en></lang>
    const modelOwned = mount(URate, { props: { modelValue: 2, count: 3.9 } });
    expect(modelOwned.findAll('button.u-rate__item')).toHaveLength(3);
    expect(modelOwned.findAll('.u-rate__item--active')).toHaveLength(2);

    // <lang><zh-CN>显式 NaN 表示无可确认 current，显示为零而不是静默读取 modelValue=2。</zh-CN><en>Explicit NaN means there is no confirmable current value and presents zero instead of silently reading modelValue=2.</en></lang>
    const invalidAlias = mount(URate, { props: { modelValue: 2, current: Number.NaN } });
    expect(invalidAlias.findAll('.u-rate__item--active')).toHaveLength(0);

    // <lang><zh-CN>disabled 同时落到原生按钮和 handler guard，点击不产生任何公开事件。</zh-CN><en>Disabled applies to native buttons and the handler guard together, so a click produces no public event.</en></lang>
    const disabledRate = mount(URate, { props: { modelValue: 2, disabled: true } });
    expect(disabledRate.findAll('button').every((button) => button.attributes('disabled') !== undefined)).toBe(true);
    await disabledRate.findAll('button')[2].trigger('click');
    expect(disabledRate.emitted()).toEqual({});
  });

  /**
   * @lang zh-CN 冻结有限但越界 current 只影响受限显示且不产生隐式写回的边缘分支。
   * @lang en Freezes the edge branch where finite but out-of-range current values affect bounded presentation only and cause no implicit writeback.
   */
  it('bounds finite current aliases for presentation without emitting state', () => {
    // <lang><zh-CN>负 current 收紧为零个 active 项，不回退到 modelValue 或发出修正事件。</zh-CN><en>A negative current narrows to zero active items without falling back to modelValue or emitting a corrective event.</en></lang>
    const belowRange = mount(URate, { props: { count: 4, current: -3, modelValue: 2 } });
    expect(belowRange.findAll('.u-rate__item--active')).toHaveLength(0);
    expect(belowRange.emitted()).toEqual({});

    // <lang><zh-CN>超过 count 的 current 只激活全部有限项，同样不改写 caller state。</zh-CN><en>A current above count activates only all finite items and likewise does not rewrite caller state.</en></lang>
    const aboveRange = mount(URate, { props: { count: 4, current: 99, modelValue: 2 } });
    expect(aboveRange.findAll('.u-rate__item--active')).toHaveLength(4);
    expect(aboveRange.emitted()).toEqual({});
  });
});

/** @lang zh-CN 验证 slider 相对 min 的十进制 step 网格、slot 与坏 payload 零事件。 @lang en Verifies slider decimal step grid relative to min, slot, and zero events for bad payloads. */
describe('P67 slider min-relative step state', () => {
  /**
   * @lang zh-CN 验证显示和 change 共享相对 min 网格，浮点噪声不改变 scalar 结果或事件顺序。
   * @lang en Verifies display and change share a min-relative grid while floating noise changes neither scalar results nor event order.
   * @returns {Promise<void>} <lang><zh-CN>两次原生 change 完成后解决。</zh-CN><en>Resolves after two native change interactions complete.</en></lang>
   */
  it('aligns display and native changes to the same decimal grid', async () => {
    // <lang><zh-CN>事件 listener 直接记录公开顺序；default slot 证明现有组合表面未被移除。</zh-CN><en>Event listeners record the public order directly, and the default slot proves the existing composition surface remains available.</en></lang>
    const eventOrder = [];
    const slider = mount(USlider, {
      props: {
        modelValue: 0.4000000000000001,
        min: 0.1,
        max: 1,
        step: 0.2,
        showValue: true,
        'onUpdate:modelValue': (value) => eventOrder.push(['update', value]),
        onChange: (value) => eventOrder.push(['change', value])
      },
      slots: { default: '<text class="caller-slider-slot">Caller slot</text>' },
      global: { stubs: { slider: NativeSliderStub } }
    });

    // <lang><zh-CN>0.4 相对 0.1 的最近网格点为 0.5；显示、原生 value 和 slot 同时可见。</zh-CN><en>The nearest grid point to 0.4 relative to 0.1 is 0.5; display, native value, and slot are visible together.</en></lang>
    expect(slider.get('.u-slider__value').text()).toBe('0.5');
    expect(slider.get('div.u-slider__control').attributes('value')).toBe('0.5');
    expect(slider.get('.caller-slider-slot').text()).toBe('Caller slot');

    // <lang><zh-CN>带二进制噪声的 detail.value 仍稳定对齐到 0.3，并保持 update→change。</zh-CN><en>A detail.value with binary noise still aligns stably to 0.3 and preserves update→change.</en></lang>
    await slider.get('div.u-slider__control').trigger('change', { detail: { value: 0.30000000000000004 } });
    expect(eventOrder).toEqual([
      ['update', 0.3],
      ['change', 0.3]
    ]);

    // <lang><zh-CN>max=1 不属于 0.1+N×0.2 网格，最终值保持在最后一个完整步进 0.9。</zh-CN><en>max=1 is outside the 0.1+N×0.2 grid, so the final value stays at the last complete step 0.9.</en></lang>
    await slider.get('div.u-slider__control').trigger('change', { detail: { value: 1 } });
    expect(eventOrder.slice(-2)).toEqual([
      ['update', 0.9],
      ['change', 0.9]
    ]);
  });

  /**
   * @lang zh-CN 验证 disabled、缺损/宽松 payload 零输出，并保留 H5 target.value 与反向范围确定行为。
   * @lang en Verifies disabled and missing/permissive payloads emit nothing while retaining deterministic H5 target.value and reversed-range behavior.
   * @returns {Promise<void>} <lang><zh-CN>坏事件、H5 回退与折叠范围交互完成后解决。</zh-CN><en>Resolves after bad-event, H5-fallback, and collapsed-range interactions complete.</en></lang>
   */
  it('rejects bad native payloads without fabricating current-value changes', async () => {
    // <lang><zh-CN>坏事件实例用于证明 handler 不再用 safeValue 伪造 change。</zh-CN><en>The bad-event instance proves the handler no longer fabricates change from safeValue.</en></lang>
    const slider = mount(USlider, {
      props: { modelValue: 0.5, min: 0, max: 1, step: 0.1 },
      global: { stubs: { slider: NativeSliderStub } }
    });
    const control = slider.get('div.u-slider__control');
    await control.trigger('change');
    await control.trigger('change', { detail: { value: '' } });
    await control.trigger('change', { detail: { value: true } });
    await control.trigger('change', { detail: { value: '0x1' } });
    await control.trigger('change', { detail: { value: Number.NaN } });
    expect(slider.emitted()).toEqual({});

    // <lang><zh-CN>H5 自定义元素的 target.value 字符串经过同一严格解析与 step 对齐。</zh-CN><en>The H5 custom element's target.value string passes through the same strict parsing and step alignment.</en></lang>
    control.element.value = '0.74';
    await control.trigger('change');
    expect(slider.emitted('update:modelValue')).toEqual([[0.7]]);
    expect(slider.emitted('change')).toEqual([[0.7]]);

    // <lang><zh-CN>disabled 原生属性和 handler guard 同时成立，即使 detail.value 合法也零输出。</zh-CN><en>The native disabled attribute and handler guard both hold, so even a valid detail.value emits nothing.</en></lang>
    const disabledSlider = mount(USlider, {
      props: { modelValue: 0.5, disabled: true },
      global: { stubs: { slider: NativeSliderStub } }
    });
    expect(disabledSlider.get('div.u-slider__control').attributes('disabled')).toBeDefined();
    await disabledSlider.get('div.u-slider__control').trigger('change', { detail: { value: 0.8 } });
    expect(disabledSlider.emitted()).toEqual({});

    // <lang><zh-CN>有限反向范围延续既有 slider 折叠到 min 的规则；有效事件只能报告折叠值。</zh-CN><en>A finite reversed range preserves the existing slider rule of collapsing to min; a valid event can report only the collapsed value.</en></lang>
    const collapsedSlider = mount(USlider, {
      props: { modelValue: 5, min: 10, max: 0, step: 2 },
      global: { stubs: { slider: NativeSliderStub } }
    });
    expect(collapsedSlider.get('div.u-slider__control').attributes('min')).toBe('10');
    expect(collapsedSlider.get('div.u-slider__control').attributes('max')).toBe('10');
    await collapsedSlider.get('div.u-slider__control').trigger('change', { detail: { value: 4 } });
    expect(collapsedSlider.emitted('update:modelValue')).toEqual([[10]]);
    expect(collapsedSlider.emitted('change')).toEqual([[10]]);
  });

  /**
   * @lang zh-CN 冻结异常 step/range 的确定回退，以及过高精度或不安全范围网格的零事件边界。
   * @lang en Freezes deterministic fallbacks for invalid step/range values and zero-event boundaries for excessive-precision or unsafe-range grids.
   * @returns {Promise<void>} <lang><zh-CN>回退与失败关闭实例完成原生 change 后解决。</zh-CN><en>Resolves after native changes complete for fallback and fail-closed instances.</en></lang>
   */
  it('normalizes invalid platform parameters but rejects unsafe decimal grids', async () => {
    // <lang><zh-CN>零、NaN 与负 step 都使用同一个有限回退 1；循环逐例验证原生属性和对齐结果。</zh-CN><en>Zero, NaN, and negative steps all use the same finite fallback 1; the loop verifies native attributes and aligned results case by case.</en></lang>
    const invalidSteps = [0, Number.NaN, -2];
    for (const invalidStep of invalidSteps) {
      // <lang><zh-CN>每个实例隔离公开事件，防止前一异常 step 的结果污染下一断言。</zh-CN><en>Each instance isolates public events so one invalid-step result cannot contaminate the next assertion.</en></lang>
      const fallbackSlider = mount(USlider, {
        props: { max: 5, min: 0, modelValue: 2, step: invalidStep },
        global: { stubs: { slider: NativeSliderStub } }
      });
      // <lang><zh-CN>平台得到 step=1，并把 2.6 确定对齐为 3。</zh-CN><en>The platform receives step=1 and deterministically aligns 2.6 to 3.</en></lang>
      const fallbackControl = fallbackSlider.get('div.u-slider__control');
      expect(fallbackControl.attributes('step')).toBe('1');
      await fallbackControl.trigger('change', { detail: { value: 2.6 } });
      expect(fallbackSlider.emitted('update:modelValue')).toEqual([[3]]);
      expect(fallbackSlider.emitted('change')).toEqual([[3]]);
    }

    // <lang><zh-CN>非有限 min/max 分别回退到 0/100；合法 payload 在同一 step=1 网格得到 38。</zh-CN><en>Non-finite min/max fall back to 0/100 respectively; a valid payload becomes 38 on the same step=1 grid.</en></lang>
    const invalidRange = mount(USlider, {
      props: { max: Number.POSITIVE_INFINITY, min: Number.NaN, modelValue: 20, step: 1 },
      global: { stubs: { slider: NativeSliderStub } }
    });
    const invalidRangeControl = invalidRange.get('div.u-slider__control');
    expect(invalidRangeControl.attributes('min')).toBe('0');
    expect(invalidRangeControl.attributes('max')).toBe('100');
    await invalidRangeControl.trigger('change', { detail: { value: 37.6 } });
    expect(invalidRange.emitted('update:modelValue')).toEqual([[38]]);
    expect(invalidRange.emitted('change')).toEqual([[38]]);

    // <lang><zh-CN>十六位小数 step 无法建立受限定点网格；有效数值事件也保持零输出。</zh-CN><en>A sixteen-decimal-place step cannot form a bounded fixed-point grid; even a valid numeric event remains output-free.</en></lang>
    const excessivePrecision = mount(USlider, {
      props: { max: 1, min: 0, modelValue: 0, step: 1e-16 },
      global: { stubs: { slider: NativeSliderStub } }
    });
    await excessivePrecision.get('div.u-slider__control').trigger('change', { detail: { value: 0.5 } });
    expect(excessivePrecision.emitted()).toEqual({});

    // <lang><zh-CN>跨越两个安全整数端点的范围差本身不安全；组件不以近似网格伪造 change。</zh-CN><en>A range difference spanning both safe-integer endpoints is itself unsafe; the component does not fabricate change through an approximate grid.</en></lang>
    const unsafeRange = mount(USlider, {
      props: { max: Number.MAX_SAFE_INTEGER, min: -Number.MAX_SAFE_INTEGER, modelValue: 0, step: 1 },
      global: { stubs: { slider: NativeSliderStub } }
    });
    await unsafeRange.get('div.u-slider__control').trigger('change', { detail: { value: 1 } });
    expect(unsafeRange.emitted()).toEqual({});
  });
});
