<!--
@component USearch
@lang zh-CN 提供受控查询文本、可选纯呈现前置搜索装饰与 search/clear 意图；组件不请求、去重、防抖、缓存、导航或生成结果。
@lang en Provides controlled query text, an optional presentation-only leading search decoration, and search/clear intent; the component performs no request, deduplication, debounce, cache, navigation, or result generation.
-->
<template>
  <view :class="rootClasses" @click="handleClick">
    <!--
    @lang zh-CN 前置搜索装饰仅在调用方显式开启时呈现；它声明 aria-hidden 请求从无障碍树排除，并退出指针命中。
    @lang en The leading search decoration renders only when explicitly enabled by the caller; it declares aria-hidden to request exclusion from the accessibility tree and leaves pointer targeting.
    <lang><zh-CN>圆环与手柄由组件局部 CSS 几何构成；节点没有事件、文字、字体图标、图片或业务含义。</zh-CN><en>The ring and handle are component-local CSS geometry; the nodes have no event, copy, font icon, image, or business meaning.</en></lang>
    -->
    <view v-if="searchIcon === 'search'" class="u-search__leading-icon" aria-hidden="true">
      <view class="u-search__leading-icon-ring" />
      <view class="u-search__leading-icon-handle" />
    </view>
    <input
      class="u-search__input"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="effectiveDisabled"
      :readonly="effectiveReadonly"
      :focus="focus"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @confirm="handleConfirm"
    />
    <button v-if="showClear && modelValue.length > 0" class="u-search__clear" :disabled="effectiveDisabled || effectiveReadonly" type="button" @click.stop="clear">{{ clearText }}</button>
    <button v-if="showAction && actionText.length > 0" class="u-search__action" :disabled="effectiveDisabled" type="button" @click.stop="search">{{ actionText }}</button>
  </view>
</template>

<script setup>
import { computed, inject, nextTick } from 'vue';
import { U_FORM_ITEM_CONTEXT } from '../u-form/form-runtime.mjs';

// <lang><zh-CN>稳定的 `u-search` 名称保持上游迁移熟悉度，但本实现不复用上游图标或请求服务。</zh-CN><en>The stable `u-search` name keeps upstream migration familiar while this implementation reuses no upstream icon or request service.</en></lang>
defineOptions({ name: 'u-search' });

// <lang><zh-CN>所有文字、显示开关和受控值由调用方提供；可选装饰默认关闭，且不产生内置 locale 或搜索协议。</zh-CN><en>All copy, display switches, and controlled value are supplied by the caller; the optional decoration is disabled by default and creates no built-in locale or search protocol.</en></lang>
const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  focus: { type: Boolean, default: false },
  // <lang><zh-CN>只识别上游熟悉的空串或 `search`；空串及其他运行时字符串均不呈现装饰，也不改变输入焦点、点击或 search intent。</zh-CN><en>Only the upstream-familiar empty string or `search` is recognized; the empty string and every other runtime string render no decoration and change neither input focus, click, nor search intent.</en></lang>
  searchIcon: { type: String, default: '' },
  showClear: { type: Boolean, default: true },
  clearText: { type: String, default: '×' },
  showAction: { type: Boolean, default: false },
  actionText: { type: String, default: '' }
});

// <lang><zh-CN>事件只报告文本、焦点和 action intent；不对 query 进行任何业务处理。</zh-CN><en>Events report text, focus, and action intent only; query receives no business processing here.</en></lang>
const emit = defineEmits(['update:modelValue', 'input', 'change', 'focus', 'blur', 'confirm', 'click', 'search', 'clear']);

// <lang><zh-CN>最近 form-item context 可为空，使独立搜索框不依赖表单 owner。</zh-CN><en>The nearest form-item context may be absent so a standalone search field does not depend on a form owner.</en></lang>
const formItemContext = inject(U_FORM_ITEM_CONTEXT, null);

// <lang><zh-CN>局部与父级 disabled 合并后统一保护输入、清除、action 与根点击。</zh-CN><en>Merged local and parent disabled state uniformly guards input, clear, action, and root click.</en></lang>
const effectiveDisabled = computed(() => props.disabled || Boolean(formItemContext?.disabled.value));

// <lang><zh-CN>搜索没有公开 readonly prop，但可继承最近表单项 readonly 并阻止输入/clear 值变化。</zh-CN><en>Search exposes no readonly prop but may inherit nearest-form-item readonly and block input/clear value changes.</en></lang>
const effectiveReadonly = computed(() => Boolean(formItemContext?.readonly.value));

// <lang><zh-CN>根类同时披露有效 disabled/readonly，使呈现与 handler guard 对齐。</zh-CN><en>The root class discloses effective disabled/readonly together so presentation aligns with handler guards.</en></lang>
const rootClasses = computed(() => ['u-search', {
  'u-search--disabled': effectiveDisabled.value,
  'u-search--readonly': effectiveReadonly.value
}]);

/**
 * @lang zh-CN 从两种已记录事件形状取得字符串；未知形状返回 null，使其保持零事件。
 * @lang en Reads a string from two documented event shapes; unknown shapes return null so they retain zero events.
 * @param {unknown} event <lang><zh-CN>平台或测试输入事件。</zh-CN><en>Platform or test input event.</en></param>
 * @returns {string | null} <lang><zh-CN>未经修改的候选 query 或无安全候选。</zh-CN><en>Unmodified candidate query or no safe candidate.</en></lang>
 */
function extractValue(event) {
  // <lang><zh-CN>小程序 detail.value 是首发平台的优先事件形状。</zh-CN><en>Mini-program detail.value is the first-priority event shape for the launch platform.</en></lang>
  const detailValue = event?.detail?.value;
  if (typeof detailValue === 'string') {
    return detailValue;
  }

  // <lang><zh-CN>Vue/jsdom target.value 只服务本地行为测试，不把输入转换成请求。</zh-CN><en>Vue/jsdom target.value serves local behavior tests only and is not converted into a request.</en></lang>
  const targetValue = event?.target?.value;
  return typeof targetValue === 'string' ? targetValue : null;
}

/**
 * @lang zh-CN 报告文本变化意图；disabled 时保持零事件。
 * @lang en Reports text-change intent; disabled state retains zero events.
 * @param {unknown} event <lang><zh-CN>原生输入事件。</zh-CN><en>Native input event.</en></param>
 * @returns {Promise<void>} <lang><zh-CN>值事件同步发出后等待 Vue 写回，再通知 change 规则。</zh-CN><en>After synchronous value events, waits for Vue writeback and then notifies change rules.</en></lang>
 */
async function handleInput(event) {
  // <lang><zh-CN>禁用 guard 防止非原生调用绕过原生属性。</zh-CN><en>The disabled guard prevents non-native calls from bypassing the native attribute.</en></lang>
  if (effectiveDisabled.value || effectiveReadonly.value) {
    return;
  }

  // <lang><zh-CN>页面收到原始字符串后决定是否写回、筛选或触发异步流程。</zh-CN><en>The page receives the raw string and decides whether to write back, filter, or trigger asynchronous flow.</en></lang>
  const nextValue = extractValue(event);
  // <lang><zh-CN>未知 payload 不伪造空 query 或 clear。</zh-CN><en>An unknown payload fabricates neither an empty query nor a clear operation.</en></lang>
  if (nextValue === null) {
    return;
  }
  emit('update:modelValue', nextValue);
  emit('input', nextValue);
  // <lang><zh-CN>change 使用相同未修改字符串报告输入变化，不等待或假定查询动作。</zh-CN><en>Change reports the same unmodified string for input change and neither waits for nor assumes a query action.</en></lang>
  emit('change', nextValue);
  // <lang><zh-CN>等待宿主写回后通知最近表单项；不防抖、不使用固定 timer。</zh-CN><en>Waits for host writeback before notifying the nearest form item; no debounce or fixed timer is used.</en></lang>
  await nextTick();
  formItemContext?.notifyChange();
}

/**
 * @lang zh-CN 转发焦点意图，不提供自动焦点或键盘策略。
 * @lang en Forwards focus intent without providing automatic-focus or keyboard policy.
 * @param {unknown} event <lang><zh-CN>原生焦点事件。</zh-CN><en>Native focus event.</en></param>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleFocus(event) {
  if (effectiveDisabled.value) {
    return;
  }
  emit('focus', event);
}

/**
 * @lang zh-CN 转发失焦意图，不启动校验或搜索。
 * @lang en Forwards blur intent without starting validation or search.
 * @param {unknown} event <lang><zh-CN>原生失焦事件。</zh-CN><en>Native blur event.</en></param>
 * @returns {Promise<void>} <lang><zh-CN>先 emit blur，等待 Vue 更新后通知 blur 规则。</zh-CN><en>Emits blur first, waits for a Vue update, and then notifies blur rules.</en></lang>
 */
async function handleBlur(event) {
  if (effectiveDisabled.value) {
    return;
  }
  emit('blur', event);
  // <lang><zh-CN>blur 通知只运行显式 blur 规则，不触发 search 或请求。</zh-CN><en>The blur notification runs only explicit blur rules and starts neither search nor request.</en></lang>
  await nextTick();
  formItemContext?.notifyBlur();
}

/**
 * @lang zh-CN 转发 confirm 意图；它不等于 search 成功或完成请求。
 * @lang en Forwards confirm intent; it does not mean search success or request completion.
 * @param {unknown} event <lang><zh-CN>原生确认事件。</zh-CN><en>Native confirm event.</en></param>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleConfirm(event) {
  if (effectiveDisabled.value) {
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
  if (effectiveDisabled.value) {
    return;
  }

  // <lang><zh-CN>保留原始点击事件；调用方自行决定是否记录、聚焦或触发其他本地呈现。</zh-CN><en>Preserves the original click event; the caller independently decides whether to observe, focus, or trigger other local presentation.</en></lang>
  emit('click', event);
}

/**
 * @lang zh-CN 清除由调用方拥有的文本并回传 clear 意图；不清除历史、缓存或结果。
 * @lang en Clears caller-owned text and reports clear intent; it clears no history, cache, or result.
 * @returns {Promise<void>} <lang><zh-CN>按稳定顺序 emit 后等待宿主写回并通知 change 规则。</zh-CN><en>After stable ordered emissions, waits for host writeback and notifies change rules.</en></lang>
 */
async function clear() {
  if (effectiveDisabled.value || effectiveReadonly.value) {
    return;
  }
  // <lang><zh-CN>clear 与普通输入共享 value/update/input/change 协议，最后单独报告 clear 意图。</zh-CN><en>Clear shares the value/update/input/change protocol with ordinary input and reports the clear intent last.</en></lang>
  emit('update:modelValue', '');
  emit('input', '');
  emit('change', '');
  emit('clear');
  // <lang><zh-CN>宿主清空 model 后再运行 change 规则，确保校验读取新值。</zh-CN><en>Runs change rules after the host clears the model so validation reads the new value.</en></lang>
  await nextTick();
  formItemContext?.notifyChange();
}

/**
 * @lang zh-CN 发送当前受控文本的 search 意图；不发起或模拟请求。
 * @lang en Sends search intent with current controlled text; it starts or simulates no request.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function search() {
  if (effectiveDisabled.value) {
    return;
  }
  emit('search', props.modelValue);
}
</script>

<style src="./u-search.css"></style>
