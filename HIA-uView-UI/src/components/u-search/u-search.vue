<!--
@component USearch
@lang zh-CN 提供受控查询文本与 search/clear 意图；组件不请求、去重、防抖、缓存、导航或生成结果。
@lang en Provides controlled query text and search/clear intent; the component performs no request, deduplication, debounce, cache, navigation, or result generation.
-->
<template>
  <view :class="rootClasses" @click="handleClick">
    <input
      class="u-search__input"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :focus="focus"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @confirm="handleConfirm"
    />
    <button v-if="showClear && modelValue.length > 0" class="u-search__clear" :disabled="disabled" type="button" @click="clear">{{ clearText }}</button>
    <button v-if="showAction && actionText.length > 0" class="u-search__action" :disabled="disabled" type="button" @click="search">{{ actionText }}</button>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定的 `u-search` 名称保持上游迁移熟悉度，但本实现不复用上游图标或请求服务。</zh-CN><en>The stable `u-search` name keeps upstream migration familiar while this implementation reuses no upstream icon or request service.</en></lang>
defineOptions({ name: 'u-search' });

// <lang><zh-CN>所有文字、显示开关和受控值由调用方提供，不产生内置 locale 或搜索协议。</zh-CN><en>All copy, display switches, and controlled value are supplied by the caller; no locale or search protocol is built in.</en></lang>
const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  focus: { type: Boolean, default: false },
  showClear: { type: Boolean, default: true },
  clearText: { type: String, default: '×' },
  showAction: { type: Boolean, default: false },
  actionText: { type: String, default: '' }
});

// <lang><zh-CN>事件只报告文本、焦点和 action intent；不对 query 进行任何业务处理。</zh-CN><en>Events report text, focus, and action intent only; query receives no business processing here.</en></lang>
const emit = defineEmits(['update:modelValue', 'input', 'change', 'focus', 'blur', 'confirm', 'click', 'search', 'clear']);

// <lang><zh-CN>根类提供禁用视觉状态，保持 input 和按钮使用同一 guard。</zh-CN><en>The root provides disabled visual state while input and buttons share the same guard.</en></lang>
const rootClasses = computed(() => ['u-search', { 'u-search--disabled': props.disabled }]);

/**
 * @lang zh-CN 从两种已记录事件形状取得字符串；未知形状返回空值。
 * @lang en Reads a string from two documented event shapes; unknown shapes return empty.
 * @param {unknown} event <lang><zh-CN>平台或测试输入事件。</zh-CN><en>Platform or test input event.</en></param>
 * @returns {string} <lang><zh-CN>未经修改的候选 query。</zh-CN><en>Unmodified candidate query.</en></lang>
 */
function extractValue(event) {
  // <lang><zh-CN>小程序 detail.value 是首发平台的优先事件形状。</zh-CN><en>Mini-program detail.value is the first-priority event shape for the launch platform.</en></lang>
  const detailValue = event?.detail?.value;
  if (typeof detailValue === 'string') {
    return detailValue;
  }

  // <lang><zh-CN>Vue/jsdom target.value 只服务本地行为测试，不把输入转换成请求。</zh-CN><en>Vue/jsdom target.value serves local behavior tests only and is not converted into a request.</en></lang>
  const targetValue = event?.target?.value;
  return typeof targetValue === 'string' ? targetValue : '';
}

/**
 * @lang zh-CN 报告文本变化意图；disabled 时保持零事件。
 * @lang en Reports text-change intent; disabled state retains zero events.
 * @param {unknown} event <lang><zh-CN>原生输入事件。</zh-CN><en>Native input event.</en></param>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleInput(event) {
  // <lang><zh-CN>禁用 guard 防止非原生调用绕过原生属性。</zh-CN><en>The disabled guard prevents non-native calls from bypassing the native attribute.</en></lang>
  if (props.disabled) {
    return;
  }

  // <lang><zh-CN>页面收到原始字符串后决定是否写回、筛选或触发异步流程。</zh-CN><en>The page receives the raw string and decides whether to write back, filter, or trigger asynchronous flow.</en></lang>
  const nextValue = extractValue(event);
  emit('update:modelValue', nextValue);
  emit('input', nextValue);
  // <lang><zh-CN>change 使用相同未修改字符串报告输入变化，不等待或假定查询动作。</zh-CN><en>Change reports the same unmodified string for input change and neither waits for nor assumes a query action.</en></lang>
  emit('change', nextValue);
}

/**
 * @lang zh-CN 转发焦点意图，不提供自动焦点或键盘策略。
 * @lang en Forwards focus intent without providing automatic-focus or keyboard policy.
 * @param {unknown} event <lang><zh-CN>原生焦点事件。</zh-CN><en>Native focus event.</en></param>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleFocus(event) {
  if (props.disabled) {
    return;
  }
  emit('focus', event);
}

/**
 * @lang zh-CN 转发失焦意图，不启动校验或搜索。
 * @lang en Forwards blur intent without starting validation or search.
 * @param {unknown} event <lang><zh-CN>原生失焦事件。</zh-CN><en>Native blur event.</en></param>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleBlur(event) {
  if (props.disabled) {
    return;
  }
  emit('blur', event);
}

/**
 * @lang zh-CN 转发 confirm 意图；它不等于 search 成功或完成请求。
 * @lang en Forwards confirm intent; it does not mean search success or request completion.
 * @param {unknown} event <lang><zh-CN>原生确认事件。</zh-CN><en>Native confirm event.</en></param>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleConfirm(event) {
  if (props.disabled) {
    return;
  }
  emit('confirm', event);
}

/**
 * @lang zh-CN 转发启用搜索区域的原始点击意图；它不自动聚焦、请求、导航或打开筛选面板。
 * @lang en Forwards original click intent from an enabled search region; it does not auto-focus, request, navigate, or open a filter panel.
 * @param {unknown} event <lang><zh-CN>搜索区域收到的原生点击事件。</zh-CN><en>Native click event received by the search region.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合条件时 emit `click`。</zh-CN><en>No return value; when eligible, emits `click`.</en></lang>
 */
function handleClick(event) {
  // <lang><zh-CN>禁用区域不得报告点击，避免嵌套原生控件的事件冒泡绕过调用方状态。</zh-CN><en>A disabled region must not report clicks, avoiding nested native-control bubbling bypassing caller state.</en></lang>
  if (props.disabled) {
    return;
  }

  // <lang><zh-CN>保留原始点击事件；调用方自行决定是否记录、聚焦或触发其他本地呈现。</zh-CN><en>Preserves the original click event; the caller independently decides whether to observe, focus, or trigger other local presentation.</en></lang>
  emit('click', event);
}

/**
 * @lang zh-CN 清除由调用方拥有的文本并回传 clear 意图；不清除历史、缓存或结果。
 * @lang en Clears caller-owned text and reports clear intent; it clears no history, cache, or result.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function clear() {
  if (props.disabled) {
    return;
  }
  emit('update:modelValue', '');
  emit('clear');
}

/**
 * @lang zh-CN 发送当前受控文本的 search 意图；不发起或模拟请求。
 * @lang en Sends search intent with current controlled text; it starts or simulates no request.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function search() {
  if (props.disabled) {
    return;
  }
  emit('search', props.modelValue);
}
</script>

<style src="./u-search.css"></style>
