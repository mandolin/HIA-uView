<!--
@component UNumberBox
@lang zh-CN 提供受控有限数值的加减和直接输入意图；组件不理解单位、货币、库存、业务范围或持久化。
@lang en Provides controlled finite-number increment, decrement, and direct-input intent; the component understands no unit, currency, inventory, business range, or persistence.
-->
<template>
  <view :class="rootClasses">
    <button class="u-number-box__button" :disabled="disabled || readonly || invalidRange || atMinimum" type="button" @click="decrement">−</button>
    <input
      class="u-number-box__input"
      :value="displayValue"
      :disabled="disabled || invalidRange"
      :readonly="readonly"
      inputmode="decimal"
      @input="handleInput"
    />
    <button class="u-number-box__button" :disabled="disabled || readonly || invalidRange || atMaximum" type="button" @click="increment">+</button>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>保持熟悉的 `u-number-box` 模板名；组件本身不导入图标或平台工具。</zh-CN><en>Retains the familiar `u-number-box` template name; the component imports no icon or platform utility.</en></lang>
defineOptions({ name: 'u-number-box' });

// <lang><zh-CN>范围和步进是调用方声明的显示规则，不是业务单位或领域校验规则。</zh-CN><en>Range and step are caller-declared presentation rules, not business units or domain validation rules.</en></lang>
const props = defineProps({
  modelValue: { type: Number, default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 999999 },
  step: { type: Number, default: 1 },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false }
});

// <lang><zh-CN>事件只说明下一数值或本地输入意图；调用方可拒绝、修正或持久化该值。</zh-CN><en>Events report next number or local input intent only; the caller may reject, correct, or persist the value.</en></lang>
const emit = defineEmits(['update:modelValue', 'input', 'change']);

/**
 * @lang zh-CN 限制本地十进制定点运算的最大精度；超过此边界的输入保持零事件，避免越过 JavaScript 安全整数范围后伪造精度。
 * @lang en Limits local decimal fixed-point arithmetic precision; input beyond this boundary emits nothing instead of fabricating precision outside JavaScript's safe-integer range.
 * @type {number}
 */
const MAX_DECIMAL_PRECISION = 15;

/**
 * @lang zh-CN 只接受普通十进制或十进制指数文字，明确排除十六进制、空白和其他 Number 宽松语法。
 * @lang en Accepts only ordinary decimal or decimal-exponent text, explicitly excluding hexadecimal, whitespace-only, and other permissive Number syntax.
 * @type {RegExp}
 */
const STRICT_DECIMAL_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

/**
 * @lang zh-CN 把有限调用方边界规范为升序范围；任一边界非有限时返回 null，使交互保持零事件。
 * @lang en Normalizes finite caller bounds into ascending order; returns null when either bound is non-finite so interaction remains event-free.
 * @returns {{minimum: number, maximum: number} | null} <lang><zh-CN>升序有限边界，或无效配置的 null。</zh-CN><en>Ascending finite bounds, or null for an invalid configuration.</en></lang>
 */
const normalizedBounds = computed(() => {
  // <lang><zh-CN>两个端点都必须有限；组件不为 Infinity、NaN 或缺损配置猜测业务范围。</zh-CN><en>Both endpoints must be finite; the component does not guess a business range for Infinity, NaN, or malformed configuration.</en></lang>
  if (!Number.isFinite(props.min) || !Number.isFinite(props.max)) {
    return null;
  }

  // <lang><zh-CN>保留既有 HIA 反向边界兼容：有限端点按数值升序投影。</zh-CN><en>Preserves existing HIA reversed-bound compatibility by projecting finite endpoints in numeric ascending order.</en></lang>
  return {
    minimum: Math.min(props.min, props.max),
    maximum: Math.max(props.min, props.max)
  };
});

// <lang><zh-CN>无效范围直接进入原生禁用与 handler 零事件边界，而不只改变视觉样式。</zh-CN><en>An invalid range enters native disabled and handler zero-event boundaries rather than changing visual style alone.</en></lang>
const invalidRange = computed(() => normalizedBounds.value === null);

/**
 * @lang zh-CN 读取有效的正步长；异常步长回退为 1，避免算术产生 NaN 或无限循环。
 * @lang en Reads a valid positive step; invalid steps fall back to 1 so arithmetic cannot produce NaN or unbounded behavior.
 * @returns {number} <lang><zh-CN>可用于本地加减的正有限步长。</zh-CN><en>Positive finite step usable for local arithmetic.</en></lang>
 */
function safeStep() {
  // <lang><zh-CN>只有正有限数字才有确定的增减含义；回退值保持组件可预测。</zh-CN><en>Only a positive finite number has deterministic increment meaning; the fallback keeps the component predictable.</en></lang>
  return Number.isFinite(props.step) && props.step > 0 ? props.step : 1;
}

/**
 * @lang zh-CN 计算有限数字十进制文本所需的小数位，并识别指数记法；过高精度返回 null。
 * @lang en Computes decimal places required by a finite number's decimal text, including exponent notation; returns null for excessive precision.
 * @param {number} value <lang><zh-CN>需要参与定点运算的有限数字。</zh-CN><en>Finite number that will participate in fixed-point arithmetic.</en></lang>
 * @returns {number | null} <lang><zh-CN>受限小数位数，或超出安全边界时的 null。</zh-CN><en>Bounded decimal-place count, or null outside the safety boundary.</en></lang>
 */
function decimalPrecision(value) {
  // <lang><zh-CN>Number 的规范字符串可能使用指数形式，因此先分离系数与指数。</zh-CN><en>A Number's canonical string may use exponent form, so coefficient and exponent are separated first.</en></lang>
  const [coefficient, exponentText = '0'] = String(value).toLowerCase().split('e');
  // <lang><zh-CN>系数小数部分只决定显式位数；不存在小数点时为零。</zh-CN><en>The coefficient fraction determines explicit places only; absence of a decimal point means zero.</en></lang>
  const fractionLength = coefficient.includes('.') ? coefficient.length - coefficient.indexOf('.') - 1 : 0;
  // <lang><zh-CN>规范 Number 指数应为整数；防御性检查阻止异常文本进入缩放运算。</zh-CN><en>A canonical Number exponent should be integral; the defensive check keeps malformed text out of scaling arithmetic.</en></lang>
  const exponent = Number(exponentText);
  if (!Number.isInteger(exponent)) {
    return null;
  }

  // <lang><zh-CN>负指数增加小数位，正指数消费小数位；结果不允许低于零。</zh-CN><en>A negative exponent adds decimal places while a positive exponent consumes them; the result cannot be negative.</en></lang>
  const precision = Math.max(0, fractionLength - exponent);
  return precision <= MAX_DECIMAL_PRECISION ? precision : null;
}

/**
 * @lang zh-CN 为两个有限数字建立共同十进制缩放；无法保持安全整数时返回 null。
 * @lang en Builds a shared decimal scale for two finite numbers; returns null when safe integers cannot be preserved.
 * @param {number} firstValue <lang><zh-CN>第一个运算数。</zh-CN><en>First operand.</en></lang>
 * @param {number} secondValue <lang><zh-CN>第二个运算数。</zh-CN><en>Second operand.</en></lang>
 * @returns {{scale: number, firstUnits: number, secondUnits: number} | null} <lang><zh-CN>安全整数单位，或不安全时的 null。</zh-CN><en>Safe integer units, or null when unsafe.</en></lang>
 */
function createDecimalUnits(firstValue, secondValue) {
  // <lang><zh-CN>非有限运算数不进入任何隐式数值转换。</zh-CN><en>Non-finite operands never enter implicit numeric conversion.</en></lang>
  if (!Number.isFinite(firstValue) || !Number.isFinite(secondValue)) {
    return null;
  }

  // <lang><zh-CN>分别读取两数精度，任一超界都使本次交互失败关闭。</zh-CN><en>Reads precision for both numbers; either overflow fails this interaction closed.</en></lang>
  const firstPrecision = decimalPrecision(firstValue);
  const secondPrecision = decimalPrecision(secondValue);
  if (firstPrecision === null || secondPrecision === null) {
    return null;
  }

  // <lang><zh-CN>共同 scale 只覆盖实际需要的小数位，不扩大中间整数。</zh-CN><en>The shared scale covers only required decimal places and does not enlarge intermediate integers unnecessarily.</en></lang>
  const scale = 10 ** Math.max(firstPrecision, secondPrecision);
  // <lang><zh-CN>乘积四舍五入为十进制定点单位，并要求每个单位仍在安全整数范围。</zh-CN><en>Products are rounded into decimal fixed-point units, and every unit must remain a safe integer.</en></lang>
  const firstUnits = Math.round(firstValue * scale);
  const secondUnits = Math.round(secondValue * scale);
  if (!Number.isSafeInteger(scale) || !Number.isSafeInteger(firstUnits) || !Number.isSafeInteger(secondUnits)) {
    return null;
  }

  return { scale, firstUnits, secondUnits };
}

/**
 * @lang zh-CN 使用安全十进制定点单位相加，避免常见二进制浮点步进漂移。
 * @lang en Adds safe decimal fixed-point units to avoid common binary floating-point step drift.
 * @param {number} currentValue <lang><zh-CN>当前有限受控值。</zh-CN><en>Current finite controlled value.</en></lang>
 * @param {number} delta <lang><zh-CN>正或负步进。</zh-CN><en>Positive or negative step delta.</en></lang>
 * @returns {number | null} <lang><zh-CN>精确到声明十进制位的候选，或无法安全运算时的 null。</zh-CN><en>Candidate exact to the declared decimal places, or null when arithmetic is unsafe.</en></lang>
 */
function addDecimal(currentValue, delta) {
  // <lang><zh-CN>共同单位是本次加法的完整安全前提，不成功时不退回普通浮点相加。</zh-CN><en>Shared units are the complete safety prerequisite for this addition; failure never falls back to ordinary floating-point addition.</en></lang>
  const units = createDecimalUnits(currentValue, delta);
  if (units === null) {
    return null;
  }

  // <lang><zh-CN>相加结果也必须是安全整数，避免两个安全操作数的和越界。</zh-CN><en>The sum must also be a safe integer because two safe operands can still overflow when added.</en></lang>
  const resultUnits = units.firstUnits + units.secondUnits;
  if (!Number.isSafeInteger(resultUnits)) {
    return null;
  }

  // <lang><zh-CN>除回共同 scale 后规范化负零，避免向 caller 泄漏仅由运算产生的 -0。</zh-CN><en>After dividing by the shared scale, canonicalizes negative zero so an arithmetic-only -0 does not leak to the caller.</en></lang>
  const result = resultUnits / units.scale;
  return Object.is(result, -0) ? 0 : result;
}

/**
 * @lang zh-CN 将原生输入 payload 解析为严格有限十进制数；宽松 JavaScript 数字语法保持无事件。
 * @lang en Parses a native input payload as a strict finite decimal number; permissive JavaScript numeric syntax remains event-free.
 * @param {unknown} rawValue <lang><zh-CN>小程序 detail.value 或 H5 target.value。</zh-CN><en>Mini Program detail.value or H5 target.value.</en></lang>
 * @returns {number | null} <lang><zh-CN>有限十进制候选，或无法确认时的 null。</zh-CN><en>Finite decimal candidate, or null when unconfirmed.</en></lang>
 */
function parseFiniteDecimal(rawValue) {
  // <lang><zh-CN>真实 number 必须有限；boolean、null 和对象不参与 Number 强制转换。</zh-CN><en>A real number must be finite; booleans, null, and objects do not participate in Number coercion.</en></lang>
  if (typeof rawValue === 'number') {
    return Number.isFinite(rawValue) ? rawValue : null;
  }
  if (typeof rawValue !== 'string') {
    return null;
  }

  // <lang><zh-CN>允许数字周围空白，但空白本身以及非十进制语法被正则明确拒绝。</zh-CN><en>Whitespace around a number is allowed, while whitespace alone and non-decimal syntax are explicitly rejected by the pattern.</en></lang>
  const normalizedText = rawValue.trim();
  if (normalizedText === '' || !STRICT_DECIMAL_PATTERN.test(normalizedText)) {
    return null;
  }

  // <lang><zh-CN>通过语法门禁后再转换，并最终拒绝溢出为 Infinity 的指数。</zh-CN><en>Conversion happens only after the syntax gate, and exponents that overflow to Infinity are finally rejected.</en></lang>
  const candidate = Number(normalizedText);
  return Number.isFinite(candidate) ? candidate : null;
}

/**
 * @lang zh-CN 将候选数值限制在调用方声明的边界内；不执行单位、货币或业务精度转换。
 * @lang en Clamps a candidate to caller-declared bounds without unit, currency, or business-precision conversion.
 * @param {number} candidate <lang><zh-CN>本地算术或输入产生的候选数字。</zh-CN><en>Candidate number from local arithmetic or input.</en></param>
 * @returns {number | null} <lang><zh-CN>有限且受边界保护的数字，或无法确认时的 null。</zh-CN><en>Finite bounded number, or null when unconfirmed.</en></lang>
 */
function clampValue(candidate) {
  // <lang><zh-CN>非有限候选没有安全输出，因此保持零事件而不是猜测。</zh-CN><en>Non-finite candidates have no safe output, so the component emits nothing instead of guessing.</en></lang>
  if (!Number.isFinite(candidate) || normalizedBounds.value === null) {
    return null;
  }

  // <lang><zh-CN>候选只按已验证的通用边界 clamp；负零被规范为零后再对外报告。</zh-CN><en>The candidate is clamped only by validated generic bounds; negative zero is canonicalized before reporting.</en></lang>
  const boundedValue = Math.min(normalizedBounds.value.maximum, Math.max(normalizedBounds.value.minimum, candidate));
  return Object.is(boundedValue, -0) ? 0 : boundedValue;
}

// <lang><zh-CN>显示值只呈现有限 modelValue；异常值留空而不向用户显示 NaN/Infinity。</zh-CN><en>The display value presents only a finite modelValue; invalid values stay blank instead of displaying NaN/Infinity.</en></lang>
const displayValue = computed(() => Number.isFinite(props.modelValue) ? String(props.modelValue) : '');

// <lang><zh-CN>派生按钮边界用于视觉和 disabled 属性；最终值仍由调用方决定。</zh-CN><en>Derives button bounds for visual and disabled attributes; final value remains caller-owned.</en></lang>
const atMinimum = computed(() => normalizedBounds.value === null || !Number.isFinite(props.modelValue) || props.modelValue <= normalizedBounds.value.minimum);
const atMaximum = computed(() => normalizedBounds.value === null || !Number.isFinite(props.modelValue) || props.modelValue >= normalizedBounds.value.maximum);
const rootClasses = computed(() => ['u-number-box', { 'u-number-box--disabled': props.disabled, 'u-number-box--readonly': props.readonly }]);

/**
 * @lang zh-CN 发出一个受边界保护的候选值；disabled/readonly 时保持零事件。
 * @lang en Emits one bounded candidate; disabled or readonly state retains zero events.
 * @param {number} candidate <lang><zh-CN>候选数值。</zh-CN><en>Candidate number.</en></param>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function emitCandidate(candidate) {
  // <lang><zh-CN>统一 guard 保证按钮和输入路径使用相同的受控所有权规则。</zh-CN><en>Shared guards keep button and input paths under the same controlled-ownership rule.</en></lang>
  if (props.disabled || props.readonly) {
    return;
  }

  // <lang><zh-CN>边界保护只属于组件的通用呈现规则，不替代应用的业务校验。</zh-CN><en>Clamping belongs to the component's generic presentation rule and does not replace application business validation.</en></lang>
  const nextValue = clampValue(candidate);
  if (nextValue === null) {
    return;
  }

  // <lang><zh-CN>clamp 后没有数值变化时保持零事件，防止边界处重复产生同值 intent。</zh-CN><en>When clamping produces no numeric change, emits nothing so boundaries cannot generate repeated same-value intent.</en></lang>
  const currentValue = Object.is(props.modelValue, -0) ? 0 : props.modelValue;
  if (Number.isFinite(currentValue) && nextValue === currentValue) {
    return;
  }

  // <lang><zh-CN>固定顺序先请求 model 写回，再兼容 input，最后报告 change。</zh-CN><en>The fixed order requests model writeback first, then compatibility input, and finally reports change.</en></lang>
  emit('update:modelValue', nextValue);
  emit('input', nextValue);
  emit('change', nextValue);
}

/**
 * @lang zh-CN 把当前值减少一个声明步长并回传意图。
 * @lang en Decreases the current value by the declared step and reports intent.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function decrement() {
  // <lang><zh-CN>定点减法基于当前受控值，组件不使用内部计数器或普通浮点回退。</zh-CN><en>Fixed-point subtraction starts from the current controlled value; the component uses neither an internal counter nor an ordinary-floating fallback.</en></lang>
  const candidate = addDecimal(props.modelValue, -safeStep());
  if (candidate !== null) {
    emitCandidate(candidate);
  }
}

/**
 * @lang zh-CN 把当前值增加一个声明步长并回传意图。
 * @lang en Increases the current value by the declared step and reports intent.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function increment() {
  // <lang><zh-CN>增长路径与减少路径使用同一定点及受控 candidate 逻辑，避免边界语义分裂。</zh-CN><en>The growth path uses the same fixed-point and controlled-candidate logic as decrement to avoid split boundary semantics.</en></lang>
  const candidate = addDecimal(props.modelValue, safeStep());
  if (candidate !== null) {
    emitCandidate(candidate);
  }
}

/**
 * @lang zh-CN 读取输入候选数字并回传；空值或非有限值不触发事件。
 * @lang en Reads an input candidate number and reports it; empty or non-finite values emit nothing.
 * @param {unknown} event <lang><zh-CN>原生输入事件。</zh-CN><en>Native input event.</en></param>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleInput(event) {
  // <lang><zh-CN>先判断受控边界，避免只读状态通过直接 handler 调用被绕过。</zh-CN><en>Checks controlled boundaries first so readonly state cannot be bypassed by direct handler calls.</en></lang>
  if (props.disabled || props.readonly) {
    return;
  }

  // <lang><zh-CN>小程序 detail.value 优先；缺省时回退 Vue/jsdom target.value，不把未知对象本身当作数字。</zh-CN><en>Mini Program detail.value takes precedence, with Vue/jsdom target.value as fallback; the unknown event object itself is never treated as a number.</en></lang>
  const rawValue = event?.detail?.value !== undefined ? event.detail.value : event?.target?.value;
  // <lang><zh-CN>严格解析器统一拒绝空值、宽松语法和非有限结果。</zh-CN><en>The strict parser uniformly rejects empty values, permissive syntax, and non-finite results.</en></lang>
  const candidate = parseFiniteDecimal(rawValue);
  if (candidate === null) {
    return;
  }

  // <lang><zh-CN>直接输入只执行有限范围 clamp，不把按钮 step 擅自解释为业务精度网格。</zh-CN><en>Direct input applies only finite-range clamping and does not reinterpret the button step as a business-precision grid.</en></lang>
  emitCandidate(candidate);
}
</script>

<style src="./u-number-box.css"></style>
