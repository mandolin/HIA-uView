<!--
@component ULazyLoad
@lang zh-CN 按 caller active 投影原生图片、placeholder 与 load/error intent；不观察 viewport、不预取、不缓存或管理网络资源。
@lang en Projects a native image, placeholder, and load/error intent according to caller active; it observes no viewport, prefetches nothing, caches nothing, and manages no network resource.
-->
<template>
  <!-- @lang zh-CN active 是唯一允许创建原生 image 的开关；placeholder 与 fallback 均由 caller slot/文字提供。
  @lang en Active is the sole switch allowed to create a native image; placeholder and fallback are supplied through caller slot/copy.
  <lang><zh-CN>组件仅转发原生事件，不能把图像可见性或加载结果解释为领域数据状态。</zh-CN><en>The component forwards native events only and cannot interpret image visibility or load result as domain data state.</en></lang> -->
  <view :class="rootClasses" role="img" :aria-label="alt || undefined"><image v-if="active && src && !hasError" class="u-lazy-load__image" :src="src" :mode="safeMode" @load="handleLoad" @error="handleError" /><view v-else-if="active && hasError" class="u-lazy-load__fallback"><slot name="error"><text v-if="errorText">{{ errorText }}</text></slot></view><view v-else class="u-lazy-load__placeholder"><slot name="placeholder"><text v-if="placeholderText">{{ placeholderText }}</text></slot></view></view>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

// <lang><zh-CN>稳定名称表示 caller-decided 延迟创建，不表示组件主动判断 viewport 的懒加载服务。</zh-CN><en>The stable name represents caller-decided deferred creation, not a lazy-loading service that actively judges the viewport.</en></lang>
defineOptions({ name: 'u-lazy-load' });

// <lang><zh-CN>active、图片属性与所有可读 fallback 文案均由 caller 提供；无默认业务文字。</zh-CN><en>Active state, image attributes, and every readable fallback copy are caller-provided; there is no default business copy.</en></lang>
const props = defineProps({ active: { type: Boolean, default: false }, src: { type: String, default: '' }, alt: { type: String, default: '' }, mode: { type: String, default: 'aspectFill' }, placeholderText: { type: String, default: '' }, errorText: { type: String, default: '' } });

// <lang><zh-CN>load/error 只报告原生 image 事件；它们不构成请求、缓存或重试协议。</zh-CN><en>Load/error report native image events only; they form no request, cache, or retry protocol.</en></lang>
const emit = defineEmits(['load', 'error']);

// <lang><zh-CN>当前错误只影响本地呈现；新 src 或 inactive 可清除该局部投影，而不保存历史。</zh-CN><en>The current error affects local presentation only; a new src or inactive state may clear that projection without persisting history.</en></lang>
const hasError = ref(false);

// <lang><zh-CN>只允许明确的跨 target image mode，未知输入确定性回退而不读取环境能力。</zh-CN><en>Allows only explicit cross-target image modes; unknown input falls back deterministically without reading environmental capability.</en></lang>
const safeMode = computed(() => ['scaleToFill', 'aspectFit', 'aspectFill', 'widthFix', 'heightFix', 'top', 'bottom', 'center', 'left', 'right'].includes(props.mode) ? props.mode : 'aspectFill');

// <lang><zh-CN>根 class 仅反映有限 active/error 局部呈现，不把 URL 或 caller 文字带入 CSS 名称。</zh-CN><en>The root class reflects only finite active/error local presentation and carries no URL or caller copy into CSS names.</en></lang>
const rootClasses = computed(() => ['u-lazy-load', { 'u-lazy-load--active': props.active, 'u-lazy-load--error': hasError.value }]);

// <lang><zh-CN>src/active 改变只重置当前 error 投影，使 caller 可以显式决定下一次原生尝试；不主动发起或取消请求。</zh-CN><en>A src/active change only resets the current error projection so the caller can explicitly decide the next native attempt; it neither initiates nor cancels a request itself.</en></lang>
watch(() => [props.src, props.active], () => { hasError.value = false; });

/**
 * @lang zh-CN 报告本地原生图像 load；不缓存结果或转换为领域成功状态。
 * @lang en Reports local native-image load; it caches no result and transforms it into no domain success state.
 * @param {unknown} event <lang><zh-CN>原生加载事件。</zh-CN><en>Native load event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；emit `load`。</zh-CN><en>No return value; emits `load`.</en></lang>
 */
function handleLoad(event) {
  // <lang><zh-CN>成功只清除本地错误显示，不改变 caller active 或 src。</zh-CN><en>Success clears only local error presentation and changes neither caller active nor src.</en></lang>
  hasError.value = false;
  emit('load', event);
}

/**
 * @lang zh-CN 报告本地原生图像 error；不发起重试、回退 URL 或网络请求。
 * @lang en Reports local native-image error; it starts no retry, fallback URL, or network request.
 * @param {unknown} event <lang><zh-CN>原生错误事件。</zh-CN><en>Native error event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；emit `error`。</zh-CN><en>No return value; emits `error`.</en></lang>
 */
function handleError(event) {
  // <lang><zh-CN>错误标记只决定当前 slot/文字分支；后续策略仍由 caller 监听事件决定。</zh-CN><en>The error marker decides only the current slot/copy branch; subsequent strategy remains caller-decided by listening to the event.</en></lang>
  hasError.value = true;
  emit('error', event);
}
</script>

<style src="./u-lazy-load.css"></style>
