<!--
@component UMessageInput
@lang zh-CN 提供调用方受控的固定长度 message/code 输入呈现；组件回传未修改字符串，不判断验证码、身份、金额或其他领域格式。
@lang en Provides caller-controlled fixed-length message/code input presentation; the component returns an unmodified string and judges no verification code, identity, money, or other domain format.
-->
<template>
  <!-- @lang zh-CN 隐形原生 input 保持实际输入入口，展示格只投影 caller modelValue；无 inputLabel 时不生成无标签输入。
  @lang en The transparent native input retains an actual input entry while display cells project caller modelValue only; no label-less input is generated when inputLabel is absent.
  <lang><zh-CN>调用方提供 inputLabel、长度和文字；组件不持有内部输入 state 或自动聚焦。</zh-CN><en>The caller provides inputLabel, length, and text; the component holds no internal input state and does not autofocus.</en></lang>
  -->
  <view v-if="isRenderable" :class="messageClasses" :style="messageStyle" role="group" :aria-label="safeInputLabel">
    <input class="u-message-input__native" :value="safeValue" :maxlength="safeLength" :disabled="disabled" :password="masked" :aria-label="safeInputLabel" @input="handleInput" @focus="emitFocus" @blur="emitBlur" />
    <view v-for="index in safeLength" :key="index" class="u-message-input__cell"><text v-if="characters[index - 1]" class="u-message-input__character">{{ masked ? '•' : characters[index - 1] }}</text></view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称服务 message/code 展示迁移；组件不改变既有 UInput 的一般单行契约。</zh-CN><en>The stable name serves message/code presentation migration; the component does not change the existing UInput general single-line contract.</en></lang>
defineOptions({ name: 'u-message-input' });

// <lang><zh-CN>调用方拥有受控值、可访问标签、长度和外观开关；组件不接收规则、请求或持久化配置。</zh-CN><en>The caller owns controlled value, accessible label, length, and appearance switches; the component accepts no rule, request, or persistence configuration.</en></lang>
const props = defineProps({
  // <lang><zh-CN>完整受控字符串；组件只显示和回传其受限前缀。</zh-CN><en>Complete controlled string; the component only displays and returns its constrained prefix.</en></lang>
  modelValue: { type: String, default: '' },
  // <lang><zh-CN>可访问标签必须由调用方提供；空值使组件不输出输入入口。</zh-CN><en>The caller must provide an accessible label; an empty value prevents the component from outputting an input entry.</en></lang>
  inputLabel: { type: String, default: '' },
  // <lang><zh-CN>格数限制为 1–8，避免无界 DOM 和不审阅的输入布局。</zh-CN><en>Cell count is limited to 1–8, preventing unbounded DOM and unreviewed input layout.</en></lang>
  length: { type: Number, default: 4 },
  // <lang><zh-CN>masked 只改变可见字符投影，不改变 caller-owned modelValue。</zh-CN><en>Masked changes visible character projection only and does not change caller-owned modelValue.</en></lang>
  masked: { type: Boolean, default: false },
  // <lang><zh-CN>禁用同时约束 native input 和所有 handler。</zh-CN><en>Disabled constrains both the native input and every handler.</en></lang>
  disabled: { type: Boolean, default: false },
  // <lang><zh-CN>有限 mode 只选择 CSS class，不改变输入/校验语义。</zh-CN><en>The finite mode selects a CSS class only and changes no input or validation semantics.</en></lang>
  mode: { type: String, default: 'box' }
});

// <lang><zh-CN>事件只回传输入/焦点意图；应用拥有校验、错误呈现和后续流程。</zh-CN><en>Events return input/focus intent only; the application owns validation, error presentation, and follow-up flow.</en></lang>
const emit = defineEmits(['update:modelValue', 'input', 'focus', 'blur']);

// <lang><zh-CN>允许的 mode 集合防止任意 caller 字符串进入 class 名称。</zh-CN><en>The allowed mode set prevents arbitrary caller strings from entering class names.</en></lang>
const supportedModes = Object.freeze(['box', 'line']);

// <lang><zh-CN>长度先取有限整数，保证原生 maxlength、v-for 和字符串切片使用同一约束。</zh-CN><en>Length first becomes a finite integer so native maxlength, v-for, and string slicing use one constraint.</en></lang>
const safeLength = computed(() => Number.isFinite(props.length) ? Math.round(Math.min(8, Math.max(1, props.length))) : 4);

// <lang><zh-CN>未知 mode 回退 box，不向 CSS 表面传播任意输入。</zh-CN><en>An unknown mode falls back to box and propagates no arbitrary input to the CSS surface.</en></lang>
const safeMode = computed(() => supportedModes.includes(props.mode) ? props.mode : 'box');

// <lang><zh-CN>可访问标签和值只接受明确字符串，防止不匹配 prop 造成隐式字符串化或字符串方法异常。</zh-CN><en>Accessible label and value accept only explicit strings, preventing mismatched props from causing implicit stringification or string-method failure.</en></lang>
const safeInputLabel = computed(() => typeof props.inputLabel === 'string' ? props.inputLabel : '');

// <lang><zh-CN>可见值只保留声明长度内的字符串，不 trim、格式化或解释其内容。</zh-CN><en>Visible value retains only the declared-length string prefix and neither trims, formats, nor interprets its content.</en></lang>
const safeValue = computed(() => (typeof props.modelValue === 'string' ? props.modelValue : '').slice(0, safeLength.value));

// <lang><zh-CN>字符数组只供逐格呈现；按 Unicode code point 拆分避免常见多码元字符被截断显示。</zh-CN><en>The character array serves cell-by-cell presentation only; splitting by Unicode code point avoids displaying common multi-code-unit characters truncated.</en></lang>
const characters = computed(() => Array.from(safeValue.value));

// <lang><zh-CN>根 class 只由固定命名空间、有限 mode 和 disabled 状态组成。</zh-CN><en>Root classes contain only the fixed namespace, finite mode, and disabled state.</en></lang>
const messageClasses = computed(() => ['u-message-input', `u-message-input--${safeMode.value}`, { 'u-message-input--disabled': props.disabled }]);

// <lang><zh-CN>动态样式只写受限单元格数，CSS 仍拥有全部布局、边框和文字规则。</zh-CN><en>Dynamic style writes only the bounded cell count while CSS retains every layout, border, and typography rule.</en></lang>
const messageStyle = computed(() => ({ '--u-message-input-length': String(safeLength.value) }));

// <lang><zh-CN>空标签不输出原生输入，防止调用方把不可发现的输入控件误用作无障碍实现。</zh-CN><en>An empty label outputs no native input, preventing callers from mistaking an undiscoverable control for an accessible implementation.</en></lang>
const isRenderable = computed(() => safeInputLabel.value.trim().length > 0);

/**
 * @lang zh-CN 从 UniApp 或 Vue/jsdom 输入事件读取候选字符串；未知事件形状回退空字符串而不猜测旧值。
 * @lang en Reads candidate string from a UniApp or Vue/jsdom input event; an unknown event shape falls back to an empty string without guessing an old value.
 * @param {unknown} event <lang><zh-CN>输入事件。</zh-CN><en>Input event.</en></lang>
 * @returns {string} <lang><zh-CN>未经修改的候选字符串或空字符串。</zh-CN><en>Unmodified candidate string or an empty string.</en></lang>
 */
function extractValue(event) {
  // <lang><zh-CN>小程序优先读取 detail.value，保持输入事件的已记录平台形状。</zh-CN><en>Reads detail.value first for Mini Program priority and the documented platform event shape.</en></lang>
  const detailValue = event?.detail?.value;
  if (typeof detailValue === 'string') return detailValue;

  // <lang><zh-CN>H5/jsdom 兼容读取 target.value，只服务本地 runtime 证据。</zh-CN><en>The H5/jsdom compatibility read of target.value serves local runtime evidence only.</en></lang>
  const targetValue = event?.target?.value;
  if (typeof targetValue === 'string') return targetValue;

  // <lang><zh-CN>没有确认字符串时不构造或保留内部值，回传空候选供应用决定。</zh-CN><en>When no string is confirmed, constructs and retains no internal value and returns an empty candidate for the application to decide.</en></lang>
  return '';
}

/**
 * @lang zh-CN 回传受限长度内的下一字符串；组件不写 prop、不校验也不请求验证码。
 * @lang en Returns the next string inside the bounded length; the component writes no prop, validates nothing, and requests no verification code.
 * @param {unknown} event <lang><zh-CN>原生输入事件。</zh-CN><en>Native input event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合条件时 emit 两个输入意图。</zh-CN><en>No return value; emits two input intents when eligible.</en></lang>
 */
function handleInput(event) {
  // <lang><zh-CN>disabled 或无可访问标签时保留零事件，防止直接 handler 调用绕开 template 边界。</zh-CN><en>Disabled or label-less states retain zero events, preventing direct handler calls from bypassing the template boundary.</en></lang>
  if (props.disabled || !isRenderable.value) return;

  // <lang><zh-CN>将候选值按同一安全长度截断，避免原生平台忽略 maxlength 时扩展显示/事件边界。</zh-CN><en>Truncates candidate value to the same safe length, preventing display/event boundary expansion when a native platform ignores maxlength.</en></lang>
  const nextValue = extractValue(event).slice(0, safeLength.value);
  emit('update:modelValue', nextValue);
  emit('input', nextValue);
}

/**
 * @lang zh-CN 转发启用输入的原始 focus 意图；组件不请求键盘或管理焦点。
 * @lang en Forwards original focus intent from an enabled input; the component requests no keyboard and manages no focus.
 * @param {unknown} event <lang><zh-CN>原始 focus 事件。</zh-CN><en>Original focus event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合条件时 emit `focus`。</zh-CN><en>No return value; emits `focus` when eligible.</en></lang>
 */
function emitFocus(event) {
  // <lang><zh-CN>guard 与 input 路径一致，保证 disabled/无标签状态没有隐式焦点入口。</zh-CN><en>The guard matches the input path, ensuring disabled/label-less states have no implicit focus entry.</en></lang>
  if (props.disabled || !isRenderable.value) return;
  emit('focus', event);
}

/**
 * @lang zh-CN 转发启用输入的原始 blur 意图；组件不据此提交、校验或隐藏键盘。
 * @lang en Forwards original blur intent from an enabled input; the component neither submits, validates, nor hides a keyboard from it.
 * @param {unknown} event <lang><zh-CN>原始 blur 事件。</zh-CN><en>Original blur event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合条件时 emit `blur`。</zh-CN><en>No return value; emits `blur` when eligible.</en></lang>
 */
function emitBlur(event) {
  // <lang><zh-CN>guard 保持与其他交互事件一致的受控 disabled 语义。</zh-CN><en>The guard retains controlled disabled semantics consistent with other interaction events.</en></lang>
  if (props.disabled || !isRenderable.value) return;
  emit('blur', event);
}
</script>

<style src="./u-message-input.css"></style>
