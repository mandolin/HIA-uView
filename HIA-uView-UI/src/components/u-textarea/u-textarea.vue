<!--
@component UTextarea
@lang zh-CN 提供受控多行字符串输入；组件只展示调用方值并回传本地输入意图，不执行校验、提交、持久化或数据请求。
@lang en Provides controlled multiline string input; the component displays caller-owned value and returns local input intent without validation, submission, persistence, or data requests.
-->
<template>
  <view :class="rootClasses">
    <textarea
      class="u-textarea__field"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :auto-height="autoHeight"
      :focus="focus"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @confirm="handleConfirm"
    />
    <text v-if="showCount" class="u-textarea__count">{{ modelValue.length }}/{{ maxlength }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>声明稳定模板名，使显式 registry、manifest 和模板迁移保持同一 `u-*` 名称。</zh-CN><en>Declares the stable template name so explicit registry, manifest, and template migration retain one `u-*` name.</en></lang>
defineOptions({ name: 'u-textarea' });

// <lang><zh-CN>所有可见值和输入行为均由调用方 props 驱动；组件不接收规则、格式化器或业务字段。</zh-CN><en>All visible value and input behavior is driven by caller props; the component accepts no rules, formatter, or business field.</en></lang>
const props = defineProps({
  // <lang><zh-CN>受控多行字符串默认为空，避免组件猜测任何领域内容。</zh-CN><en>The controlled multiline string defaults to empty so the component never guesses domain content.</en></lang>
  modelValue: { type: String, default: '' },
  // <lang><zh-CN>提示文字由调用方提供，不能代替字段 label。</zh-CN><en>Placeholder copy is supplied by the caller and cannot replace a field label.</en></lang>
  placeholder: { type: String, default: '' },
  // <lang><zh-CN>禁用状态同时驱动原生属性、样式和事件 guard。</zh-CN><en>Disabled state drives the native attribute, styling, and event guard together.</en></lang>
  disabled: { type: Boolean, default: false },
  // <lang><zh-CN>只读状态阻止本地输入写回，但仍允许调用方观察焦点/失焦。</zh-CN><en>Readonly state prevents local input writeback while allowing callers to observe focus and blur.</en></lang>
  readonly: { type: Boolean, default: false },
  // <lang><zh-CN>maxlength 只交给平台展示约束；组件不截断或重写字符串。</zh-CN><en>Maxlength is passed as a platform presentation constraint; the component never truncates or rewrites the string.</en></lang>
  maxlength: { type: Number, default: 140 },
  // <lang><zh-CN>平台自动高度开关只改变原生 textarea 展示，不创建测量或布局状态。</zh-CN><en>The platform auto-height switch changes native textarea presentation only and creates no measurement or layout state.</en></lang>
  autoHeight: { type: Boolean, default: false },
  // <lang><zh-CN>focus 由调用方控制；组件不调用任何自动聚焦 API。</zh-CN><en>Focus is caller-controlled; the component calls no automatic-focus API.</en></lang>
  focus: { type: Boolean, default: false },
  // <lang><zh-CN>计数展示是可选的中性呈现，不表示校验或剩余配额。</zh-CN><en>Counter presentation is optional and neutral and represents neither validation nor quota.</en></lang>
  showCount: { type: Boolean, default: false }
});

// <lang><zh-CN>事件只报告受控更新、原始输入和焦点意图；应用拥有写回、校验和后续流程。</zh-CN><en>Events report controlled update, raw input, and focus intent only; the application owns writeback, validation, and follow-up flow.</en></lang>
const emit = defineEmits(['update:modelValue', 'input', 'focus', 'blur', 'confirm']);

// <lang><zh-CN>根类由调用方状态派生，保证视觉状态与事件 guard 使用同一事实。</zh-CN><en>Root classes derive from caller state so visual state and event guards use one fact.</en></lang>
const rootClasses = computed(() => [
  'u-textarea',
  { 'u-textarea--disabled': props.disabled, 'u-textarea--readonly': props.readonly }
]);

/**
 * @lang zh-CN 从已记录的 UniApp/Vue 事件形状取得字符串；未知形状返回空值而不猜测或转换。
 * @lang en Reads a string from documented UniApp/Vue event shapes; unknown shapes return empty without guessing or transforming.
 * @param {unknown} event <lang><zh-CN>平台或测试输入事件。</zh-CN><en>Platform or test input event.</en></lang>
 * @returns {string} <lang><zh-CN>未经修改的候选字符串。</zh-CN><en>Unmodified candidate string.</en></lang>
 */
function extractValue(event) {
  // <lang><zh-CN>小程序输入事件优先从 detail.value 读取，以保持首发平台契约。</zh-CN><en>Reads detail.value first for the mini-program-first contract.</en></lang>
  const detailValue = event?.detail?.value;
  if (typeof detailValue === 'string') {
    return detailValue;
  }

  // <lang><zh-CN>Vue/jsdom 原生事件从 target.value 读取，仍不执行 trim 或格式化。</zh-CN><en>Reads target.value from Vue/jsdom native events without trimming or formatting.</en></lang>
  const targetValue = event?.target?.value;
  return typeof targetValue === 'string' ? targetValue : '';
}

/**
 * @lang zh-CN 报告受控多行输入意图；disabled/readonly 时保持零事件。
 * @lang en Reports controlled multiline-input intent and emits nothing while disabled or readonly.
 * @param {unknown} event <lang><zh-CN>原生输入事件。</zh-CN><en>Native input event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleInput(event) {
  // <lang><zh-CN>guard 先于读取执行，使直接 handler 调用也不会绕过受控状态限制。</zh-CN><en>The guard runs before reading so direct handler calls cannot bypass controlled-state limits.</en></lang>
  if (props.disabled || props.readonly) {
    return;
  }

  // <lang><zh-CN>候选值保持原样交还调用方；组件不保存副本。</zh-CN><en>Returns the candidate unchanged to the caller; the component stores no copy.</en></lang>
  const nextValue = extractValue(event);
  emit('update:modelValue', nextValue);
  emit('input', nextValue);
}

/**
 * @lang zh-CN 转发启用状态的焦点意图，不声明键盘、读屏或自动焦点能力。
 * @lang en Forwards focus intent while enabled without claiming keyboard, screen-reader, or automatic-focus capability.
 * @param {unknown} event <lang><zh-CN>原生焦点事件。</zh-CN><en>Native focus event.</en></param>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleFocus(event) {
  // <lang><zh-CN>禁用控件不报告焦点，保持与单行输入的受控事件规则一致。</zh-CN><en>Disabled controls report no focus, matching the controlled event rule of single-line input.</en></lang>
  if (props.disabled) {
    return;
  }
  emit('focus', event);
}

/**
 * @lang zh-CN 转发启用状态的失焦意图，不触发校验或提交。
 * @lang en Forwards blur intent while enabled without triggering validation or submission.
 * @param {unknown} event <lang><zh-CN>原生失焦事件。</zh-CN><en>Native blur event.</en></param>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleBlur(event) {
  // <lang><zh-CN>统一 disabled guard，防止不同事件路径产生不一致的禁用语义。</zh-CN><en>Uses the same disabled guard so event paths cannot produce inconsistent disabled semantics.</en></lang>
  if (props.disabled) {
    return;
  }
  emit('blur', event);
}

/**
 * @lang zh-CN 转发原始 confirm 意图；confirm 不代表完成、提交或后端成功。
 * @lang en Forwards raw confirm intent; confirm represents no completion, submission, or backend success.
 * @param {unknown} event <lang><zh-CN>原生确认事件。</zh-CN><en>Native confirm event.</en></param>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleConfirm(event) {
  // <lang><zh-CN>禁用或只读状态不产生确认意图，避免调用方误将它当作可编辑完成。</zh-CN><en>Disabled or readonly state produces no confirm intent, avoiding a false editable-completion interpretation.</en></lang>
  if (props.disabled || props.readonly) {
    return;
  }
  emit('confirm', event);
}
</script>

<style src="./u-textarea.css"></style>
