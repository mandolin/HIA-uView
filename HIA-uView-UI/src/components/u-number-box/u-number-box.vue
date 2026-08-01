<!--
@component UNumberBox
@lang zh-CN 提供受控有限数值的加减和直接输入意图；组件不理解单位、货币、库存、业务范围或持久化。
@lang en Provides controlled finite-number increment, decrement, and direct-input intent; the component understands no unit, currency, inventory, business range, or persistence.
-->
<template>
  <view :class="rootClasses">
    <button class="u-number-box__button" :disabled="disabled || atMinimum" type="button" @click="decrement">−</button>
    <input
      class="u-number-box__input"
      :value="displayValue"
      :disabled="disabled"
      :readonly="readonly"
      inputmode="numeric"
      @input="handleInput"
    />
    <button class="u-number-box__button" :disabled="disabled || atMaximum" type="button" @click="increment">+</button>
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
 * @lang zh-CN 读取有效的正步长；异常步长回退为 1，避免算术产生 NaN 或无限循环。
 * @lang en Reads a valid positive step; invalid steps fall back to 1 so arithmetic cannot produce NaN or unbounded behavior.
 * @returns {number} <lang><zh-CN>可用于本地加减的正有限步长。</zh-CN><en>Positive finite step usable for local arithmetic.</en></lang>
 */
function safeStep() {
  // <lang><zh-CN>只有正有限数字才有确定的增减含义；回退值保持组件可预测。</zh-CN><en>Only a positive finite number has deterministic increment meaning; the fallback keeps the component predictable.</en></lang>
  return Number.isFinite(props.step) && props.step > 0 ? props.step : 1;
}

/**
 * @lang zh-CN 将候选数值限制在调用方声明的边界内；不执行单位、货币或业务精度转换。
 * @lang en Clamps a candidate to caller-declared bounds without unit, currency, or business-precision conversion.
 * @param {number} candidate <lang><zh-CN>本地算术或输入产生的候选数字。</zh-CN><en>Candidate number from local arithmetic or input.</en></param>
 * @returns {number | null} <lang><zh-CN>有限且受边界保护的数字，或无法确认时的 null。</zh-CN><en>Finite bounded number, or null when unconfirmed.</en></lang>
 */
function clampValue(candidate) {
  // <lang><zh-CN>非有限候选没有安全输出，因此保持零事件而不是猜测。</zh-CN><en>Non-finite candidates have no safe output, so the component emits nothing instead of guessing.</en></lang>
  if (!Number.isFinite(candidate)) {
    return null;
  }

  // <lang><zh-CN>排序后的边界防止调用方临时传入反向范围导致按钮行为不可解释。</zh-CN><en>Ordered bounds prevent temporarily reversed caller ranges from making button behavior unintelligible.</en></lang>
  const lowerBound = Math.min(props.min, props.max);
  const upperBound = Math.max(props.min, props.max);
  return Math.min(upperBound, Math.max(lowerBound, candidate));
}

// <lang><zh-CN>显示值只把受控 modelValue 转为文本；组件不格式化千分位、单位或小数位。</zh-CN><en>The display value converts controlled modelValue to text only; it formats no grouping, unit, or decimal places.</en></lang>
const displayValue = computed(() => String(props.modelValue));

// <lang><zh-CN>派生按钮边界用于视觉和 disabled 属性；最终值仍由调用方决定。</zh-CN><en>Derives button bounds for visual and disabled attributes; final value remains caller-owned.</en></lang>
const atMinimum = computed(() => props.modelValue <= Math.min(props.min, props.max));
const atMaximum = computed(() => props.modelValue >= Math.max(props.min, props.max));
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
  // <lang><zh-CN>算术基于当前受控值，组件不使用内部计数器。</zh-CN><en>Arithmetic starts from the current controlled value; the component uses no internal counter.</en></lang>
  emitCandidate(props.modelValue - safeStep());
}

/**
 * @lang zh-CN 把当前值增加一个声明步长并回传意图。
 * @lang en Increases the current value by the declared step and reports intent.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function increment() {
  // <lang><zh-CN>增长路径与减少路径使用同一受控 candidate 逻辑，避免边界语义分裂。</zh-CN><en>The growth path uses the same controlled-candidate logic as decrement to avoid split boundary semantics.</en></lang>
  emitCandidate(props.modelValue + safeStep());
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

  // <lang><zh-CN>兼容小程序 detail.value 与 Vue/jsdom target.value，但不把不可解析文本当作数字。</zh-CN><en>Supports mini-program detail.value and Vue/jsdom target.value without treating unparseable text as a number.</en></lang>
  const rawValue = typeof event?.detail?.value === 'string' ? event.detail.value : event?.target?.value;
  if (rawValue === '' || rawValue === null || rawValue === undefined) {
    return;
  }

  // <lang><zh-CN>Number 只作为通用数字呈现转换；单位、货币和业务精度仍由应用处理。</zh-CN><en>Number conversion serves generic numeric presentation only; the application owns units, currency, and business precision.</en></lang>
  const candidate = Number(rawValue);
  emitCandidate(candidate);
}
</script>

<style src="./u-number-box.css"></style>
