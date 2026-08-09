<!--
@component UInput
@lang zh-CN 为 HIA-uView 私有 `mp-weixin` 配置提供受控的单行文本输入；它展示调用方值并回传本地输入意图，不拥有规则执行、异步工作、完成操作、持久化或导航。
@lang en Provides a controlled single-line text input for the private HIA-uView `mp-weixin` profile; it displays caller-owned value and returns local input intent without owning rule execution, asynchronous work, completion actions, persistence, or navigation.
-->
<template>
  <!--
  @lang zh-CN 原生输入只绑定调用方受控值、提示和禁用状态。
  @lang en The native input binds only caller-controlled value, hint, and disabled state.
  <lang><zh-CN>原生输入不使用 `v-model`，以便显示值始终由 `modelValue` 归属给应用；所有本地事件经受限 handler 回传。</zh-CN><en>The native input avoids `v-model` so displayed value remains application-owned through `modelValue`; every local event returns through constrained handlers.</en></lang>
  -->
  <input
    :class="inputClasses"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    @input="handleInput"
    @focus="handleFocus"
    @blur="handleBlur"
    @click="handleClick"
    @confirm="handleConfirm"
  />
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>声明稳定的 kebab-case 组件名，使模板、manifest 与显式 plugin registry 使用同一运行时名称。</zh-CN><en>Declares the stable kebab-case component name so templates, the manifest, and the explicit plugin registry use one runtime name.</en></lang>
defineOptions({
  name: 'u-input'
});

// <lang><zh-CN>受控输入只接受应用自有的字符串或数字、提示文字和本地可用性意图；它不接收规则、回调、样式逃生口或平台能力开关。</zh-CN><en>The controlled input accepts only application-owned strings or numbers, hint text, and local-availability intent; it accepts no rules, callbacks, style escape hatches, or platform-capability switches.</en></lang>
const props = defineProps({
  // <lang><zh-CN>可见值由调用方提供并在事件后自行更新；数字值只作为原生可见值传入，而新的编辑意图仍以未修改字符串回传。</zh-CN><en>The caller supplies and updates the visible value after events; a number is passed only as a native visible value, while a new editing intent still returns as an unmodified string.</en></lang>
  modelValue: {
    type: [String, Number],
    default: ''
  },
  // <lang><zh-CN>提示文字同样归调用方所有；它不能替代调用方在字段结构中提供的可见标签。</zh-CN><en>Hint text also belongs to the caller; it cannot replace a visible label supplied by the caller in field structure.</en></lang>
  placeholder: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>禁用既驱动原生输入属性，也在事件 handler 中作为防御性零事件 guard。</zh-CN><en>Disabled drives both the native input attribute and a defensive zero-event guard inside event handlers.</en></lang>
  disabled: {
    type: Boolean,
    default: false
  },
  // <lang><zh-CN>只读状态交由原生输入呈现；它不创建遮罩、选择器、自动焦点或内部值副本。</zh-CN><en>Readonly state is presented by the native input; it creates no overlay, selector, auto-focus behavior, or internal value copy.</en></lang>
  readonly: {
    type: Boolean,
    default: false
  }
});

// <lang><zh-CN>六个受限事件只报告未修改的输入或原始本地意图；应用在组件外拥有校验、回滚和后续流程。</zh-CN><en>The six constrained events report only unmodified input or original local intent; the application owns validation, rollback, and follow-up flow outside the component.</en></lang>
const emit = defineEmits(['update:modelValue', 'input', 'focus', 'blur', 'click', 'confirm']);

// <lang><zh-CN>由禁用状态派生根类，使不可用外观与 handler guard 使用同一调用方状态。</zh-CN><en>Derives root classes from disabled state so unavailable appearance and handler guards use the same caller-owned state.</en></lang>
const inputClasses = computed(() => [
  'u-input',
  {
    'u-input--disabled': props.disabled
  }
]);

/**
 * @lang zh-CN 从 UniApp 原生事件或 Vue/jsdom 原生事件中读取候选字符串；无法确认字符串时返回空值，而不猜测、转换或保留旧值。
 * @lang en Reads a candidate string from a UniApp native event or a Vue/jsdom native event; when a string cannot be confirmed, returns an empty value without guessing, transforming, or retaining an old value.
 * @param {unknown} event <lang><zh-CN>输入 handler 收到的平台或 Vue 事件。</zh-CN><en>Platform or Vue event received by the input handler.</en></lang>
 * @returns {string} <lang><zh-CN>未经修改的候选字符串，或无法确认时的空字符串。</zh-CN><en>Unmodified candidate string, or an empty string when it cannot be confirmed.</en></lang>
 */
function extractInputValue(event) {
  // <lang><zh-CN>UniApp 输入事件通常把候选值置于 detail.value；先读取该形状以保持小程序优先的契约。</zh-CN><en>UniApp input events commonly place the candidate value in detail.value; reads that shape first to retain the mini-program-first contract.</en></lang>
  const detailValue = event?.detail?.value;

  // <lang><zh-CN>已确认的 UniApp 字符串可直接回传，绝不 trim、格式化或以规则替换。</zh-CN><en>A confirmed UniApp string can return directly and is never trimmed, formatted, or replaced through a rule.</en></lang>
  if (typeof detailValue === 'string') {
    return detailValue;
  }

  // <lang><zh-CN>Vue/jsdom 的原生输入事件把值置于 target.value；该兼容读取只服务本地 runtime 证据。</zh-CN><en>Vue/jsdom native input events place value in target.value; this compatibility read serves local runtime evidence only.</en></lang>
  const targetValue = event?.target?.value;

  // <lang><zh-CN>已确认的 Vue/jsdom 字符串同样保持原样回传，不把非字符串隐式序列化为文本。</zh-CN><en>A confirmed Vue/jsdom string also returns unchanged and never implicitly serializes a non-string as text.</en></lang>
  if (typeof targetValue === 'string') {
    return targetValue;
  }

  // <lang><zh-CN>未知事件形状没有安全的候选值；空字符串让应用保留其明确的受控状态决定。</zh-CN><en>An unknown event shape has no safe candidate value; the empty string leaves the application with its explicit controlled-state decision.</en></lang>
  return '';
}

/**
 * @lang zh-CN 在启用状态下按固定顺序报告未修改的下一字符串值；组件不写回 prop，也不启动任何规则或完成流程。
 * @lang en Reports the unmodified next string value in fixed order while enabled; the component neither writes back a prop nor starts any rule or completion flow.
 * @param {unknown} event <lang><zh-CN>原生输入事件。</zh-CN><en>Native input event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合条件时依次 emit `update:modelValue` 与 `input`。</zh-CN><en>No return value; when eligible, emits `update:modelValue` followed by `input`.</en></lang>
 */
function handleInput(event) {
  // <lang><zh-CN>不可编辑 guard 必须先于值读取和事件转发执行，使非原生直接 handler 调用也保持零写回契约。</zh-CN><en>The non-editable guard must run before value reading and event forwarding so non-native direct handler calls also retain the zero-writeback contract.</en></lang>
  if (props.disabled || props.readonly) {
    return;
  }

  // <lang><zh-CN>提取候选字符串只适配两种已记录事件形状；结果仍完全由应用决定是否写回 modelValue。</zh-CN><en>Extracts a candidate string only from the two documented event shapes; the application still entirely decides whether to write it back to modelValue.</en></lang>
  const nextValue = extractInputValue(event);

  // <lang><zh-CN>先触发受控值更新意图，使 Vue 调用方可以按标准 v-model 约定处理下一值。</zh-CN><en>Emits controlled-value update intent first so Vue callers can handle the next value through the standard v-model convention.</en></lang>
  emit('update:modelValue', nextValue);

  // <lang><zh-CN>随后以相同未修改值报告一般 input 意图；该事件不携带校验、持久化或领域含义。</zh-CN><en>Then reports general input intent with the same unmodified value; this event carries no validation, persistence, or domain meaning.</en></lang>
  emit('input', nextValue);
}

/**
 * @lang zh-CN 在启用状态下转发原始聚焦意图；组件不承诺键盘、读屏或自动焦点行为。
 * @lang en Forwards original focus intent while enabled; the component promises no keyboard, screen-reader, or automatic-focus behavior.
 * @param {unknown} event <lang><zh-CN>原生聚焦事件。</zh-CN><en>Native focus event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合条件时 emit `focus`。</zh-CN><en>No return value; when eligible, emits `focus`.</en></lang>
 */
function handleFocus(event) {
  // <lang><zh-CN>禁用输入不得发出聚焦意图，即使测试或非原生调用方直接触发 handler。</zh-CN><en>A disabled input must not emit focus intent even when a test or non-native caller directly triggers the handler.</en></lang>
  if (props.disabled) {
    return;
  }

  // <lang><zh-CN>保留原始事件给应用，以免组件重构、缓存或解释平台焦点信息。</zh-CN><en>Preserves the original event for the application so the component does not reshape, cache, or interpret platform focus information.</en></lang>
  emit('focus', event);
}

/**
 * @lang zh-CN 在启用状态下转发原始失焦意图；组件不据此执行校验、格式化或完成操作。
 * @lang en Forwards original blur intent while enabled; the component performs no validation, formatting, or completion action from it.
 * @param {unknown} event <lang><zh-CN>原生失焦事件。</zh-CN><en>Native blur event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合条件时 emit `blur`。</zh-CN><en>No return value; when eligible, emits `blur`.</en></lang>
 */
function handleBlur(event) {
  // <lang><zh-CN>禁用 guard 与输入/聚焦路径一致，避免同一 disabled prop 在不同事件上产生不一致语义。</zh-CN><en>The disabled guard matches input/focus paths, preventing the same disabled prop from producing inconsistent semantics across events.</en></lang>
  if (props.disabled) {
    return;
  }

  // <lang><zh-CN>原样交还平台失焦事件；应用可自行决定是否更新其校验或呈现状态。</zh-CN><en>Returns the platform blur event unchanged; the application may independently decide whether to update its validation or presentation state.</en></lang>
  emit('blur', event);
}

/**
 * @lang zh-CN 在启用状态下转发原始点击意图；只读输入仍可报告本地点击，组件不把它解释为选择、打开或导航。
 * @lang en Forwards original click intent while enabled; a readonly input may still report a local click, which the component never interprets as selection, opening, or navigation.
 * @param {unknown} event <lang><zh-CN>原生点击事件。</zh-CN><en>Native click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合条件时 emit `click`。</zh-CN><en>No return value; when eligible, emits `click`.</en></lang>
 */
function handleClick(event) {
  // <lang><zh-CN>禁用 guard 保证非原生直接调用不会绕过原生 unavailable 状态。</zh-CN><en>The disabled guard ensures a direct non-native call cannot bypass native unavailable state.</en></lang>
  if (props.disabled) {
    return;
  }

  // <lang><zh-CN>保留原始事件给应用决定其本地流程；组件不保存任何点击状态。</zh-CN><en>Preserves the original event for the application to decide its local flow; the component stores no click state.</en></lang>
  emit('click', event);
}

/**
 * @lang zh-CN 在启用状态下转发原始确认意图；确认不表示校验、提交、持久化或后端成功。
 * @lang en Forwards original confirm intent while enabled; confirmation means no validation, submission, persistence, or backend success.
 * @param {unknown} event <lang><zh-CN>原生确认事件。</zh-CN><en>Native confirm event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合条件时 emit `confirm`。</zh-CN><en>No return value; when eligible, emits `confirm`.</en></lang>
 */
function handleConfirm(event) {
  // <lang><zh-CN>禁用 guard 与其他本地意图保持一致；readonly 不等同 disabled，原生仍可报告确认意图。</zh-CN><en>The disabled guard matches other local intents; readonly is not disabled, so the native surface may still report confirm intent.</en></lang>
  if (props.disabled) {
    return;
  }

  // <lang><zh-CN>原样交还事件，避免组件推断确认后的业务动作。</zh-CN><en>Returns the event unchanged so the component never infers a business action after confirmation.</en></lang>
  emit('confirm', event);
}
</script>

<style src="./u-input.css"></style>
