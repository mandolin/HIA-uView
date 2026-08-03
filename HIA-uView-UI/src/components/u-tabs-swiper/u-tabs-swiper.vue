<!--
@component UTabsSwiper
@lang zh-CN 将调用方有限 tabs 与当前静态 panel 投影为选择、prev/next intent；不使用原生 swiper、手势测量、自动轮播或路由同步。
@lang en Projects caller finite tabs and the current static panel as selection and prev/next intent; it uses no native swiper, gesture measurement, autoplay, or route synchronization.
-->
<template>
  <!-- @lang zh-CN tab 和 panel 都来自同一受控 modelValue；只有 caller 提供 control 文字时才出现 prev/next button。
  @lang en Tab and panel both derive from one controlled modelValue; prev/next buttons appear only when callers provide control copy.
  <lang><zh-CN>slot 可替换当前 panel 呈现，但组件不加载页面、媒体或远程内容。</zh-CN><en>The slot may replace current-panel presentation, while the component loads no page, media, or remote content.</en></lang> -->
  <view class="u-tabs-swiper" role="region" :aria-label="ariaLabel || undefined"><view class="u-tabs-swiper__tabs" role="tablist"><button v-for="item in safeItems" :key="item.key" :class="tabClasses(item)" type="button" :disabled="item.disabled" role="tab" :aria-selected="isActive(item)" @click="handleSelect(item)"><text>{{ item.label }}</text></button></view><view v-if="currentItem" class="u-tabs-swiper__panel" role="tabpanel"><slot :item="currentItem" :index="safeIndex"><text class="u-tabs-swiper__label">{{ currentItem.label }}</text><text v-if="currentItem.description" class="u-tabs-swiper__description">{{ currentItem.description }}</text></slot></view><view v-else class="u-tabs-swiper__panel"><slot /></view><view v-if="previousText || nextText" class="u-tabs-swiper__controls"><button v-if="previousText" class="u-tabs-swiper__control" type="button" :disabled="safeIndex === 0" @click="handlePrevious"><text>{{ previousText }}</text></button><button v-if="nextText" class="u-tabs-swiper__control" type="button" :disabled="safeIndex === safeItems.length - 1" @click="handleNext"><text>{{ nextText }}</text></button></view></view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称保留 tabs-swiper 迁移入口；当前实现只管理 caller-owned 静态 panel 投影。</zh-CN><en>The stable name retains a tabs-swiper migration entry; the current implementation manages only caller-owned static-panel projection.</en></lang>
defineOptions({ name: 'u-tabs-swiper' });

// <lang><zh-CN>所有文字、items、当前值及可选前后 control 都由 caller 声明；没有默认中英按钮文案。</zh-CN><en>All copy, items, current value, and optional previous/next controls are caller-declared; there is no default mixed-language button copy.</en></lang>
const props = defineProps({ items: { type: Array, default: () => [] }, modelValue: { type: [String, Number], default: '' }, ariaLabel: { type: String, default: '' }, previousText: { type: String, default: '' }, nextText: { type: String, default: '' } });

// <lang><zh-CN>三种事件只报告有限候选，不触发 swipe、路由或内容加载。</zh-CN><en>The three events report finite candidates only and trigger no swipe, route, or content loading.</en></lang>
const emit = defineEmits(['update:modelValue', 'change', 'previous', 'next']);

// <lang><zh-CN>仅保留可读 tab；对象/字符串输入均变为冻结局部投影。</zh-CN><en>Retains readable tabs only; object/string input both become frozen local projections.</en></lang>
const safeItems = computed(() => props.items.map((item, index) => {
  // <lang><zh-CN>source 不修改 caller 输入，value 不存在时使用明确的 label/index 投影。</zh-CN><en>Source does not mutate caller input and uses explicit label/index projection when value is absent.</en></lang>
  const source = typeof item === 'string' ? { label: item, value: item } : (item || {});
  return Object.freeze({ key: `${String(source.value ?? source.label ?? index)}-${index}`, label: String(source.label ?? source.title ?? ''), description: String(source.description ?? source.desc ?? ''), value: source.value ?? source.label ?? index, disabled: Boolean(source.disabled) });
}).filter((item) => item.label.trim().length > 0));

// <lang><zh-CN>当前索引只由 caller value 在有限数组中定位；未命中时确定性展示第一项，不写回模型。</zh-CN><en>The current index locates caller value only in the finite array; a miss deterministically presents the first item without writing back the model.</en></lang>
const safeIndex = computed(() => {
  // <lang><zh-CN>indexOf 只读取冻结本地 projection，不访问 DOM 或 scroll state。</zh-CN><en>Index lookup reads only frozen local projection and accesses neither DOM nor scroll state.</en></lang>
  const index = safeItems.value.findIndex((item) => item.value === props.modelValue);
  return index >= 0 ? index : 0;
});

// <lang><zh-CN>当前 panel 是受控索引的透明结果；空项保留 null 给默认 slot。</zh-CN><en>The current panel is the transparent result of the controlled index; empty items retain null for the default slot.</en></lang>
const currentItem = computed(() => safeItems.value[safeIndex.value] || null);

/**
 * @lang zh-CN 判断 item 是否等于 caller 当前值；不将首次 fallback 视为模型更新。
 * @lang en Determines whether an item equals caller current value; it does not treat first-item fallback as a model update.
 * @param {{value: string|number}} item <lang><zh-CN>规范化 tab/panel 项。</zh-CN><en>Normalized tab/panel item.</en></lang>
 * @returns {boolean} <lang><zh-CN>是否是 caller 当前项。</zh-CN><en>Whether it is caller current item.</en></lang>
 */
function isActive(item) {
  return props.modelValue === item.value;
}

/**
 * @lang zh-CN 生成有限 tab class，不让 caller value 进入 CSS 名称。
 * @lang en Generates finite tab classes and does not let caller value enter CSS names.
 * @param {{disabled: boolean}} item <lang><zh-CN>规范化 tab 项。</zh-CN><en>Normalized tab item.</en></lang>
 * @returns {Array<string|Record<string, boolean>>} <lang><zh-CN>稳定 class 数组。</zh-CN><en>Stable class array.</en></lang>
 */
function tabClasses(item) {
  return ['u-tabs-swiper__tab', { 'u-tabs-swiper__tab--active': isActive(item), 'u-tabs-swiper__tab--disabled': item.disabled }];
}

/**
 * @lang zh-CN 报告已启用且非当前项的选择候选；caller 决定是否写回、切换 panel 或加载内容。
 * @lang en Reports selection candidate for an enabled non-current item; the caller decides whether to write back, switch panel, or load content.
 * @param {{value: string|number, disabled: boolean}} item <lang><zh-CN>规范化 tab 项。</zh-CN><en>Normalized tab item.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；变化时 emit update/change。</zh-CN><en>No return value; emits update/change on change.</en></lang>
 */
function handleSelect(item) {
  // <lang><zh-CN>重复/disabled 项零事件，避免组件拥有刷新、滚动或动画语义。</zh-CN><en>Repeated/disabled items are event-free, avoiding component ownership of refresh, scrolling, or animation semantics.</en></lang>
  if (item.disabled || isActive(item)) return;
  emit('update:modelValue', item.value);
  emit('change', { value: item.value, index: safeItems.value.findIndex((candidate) => candidate.key === item.key) });
}

/**
 * @lang zh-CN 报告前一可用位置的候选；不循环或驱动原生 swiper。
 * @lang en Reports the candidate for the preceding available position; it neither wraps nor drives a native swiper.
 * @returns {void} <lang><zh-CN>无返回值；可用时 emit `previous`。</zh-CN><en>No return value; emits `previous` when available.</en></lang>
 */
function handlePrevious() {
  // <lang><zh-CN>首项保持零事件，caller 可据此区分边界而非接收伪造循环值。</zh-CN><en>The first item remains event-free, so callers can distinguish a boundary rather than receiving a fabricated wrapped value.</en></lang>
  if (safeIndex.value <= 0) return;
  const item = safeItems.value[safeIndex.value - 1];
  emit('previous', { value: item.value, index: safeIndex.value - 1 });
}

/**
 * @lang zh-CN 报告后一可用位置的候选；不循环、加载或同步路由。
 * @lang en Reports the candidate for the following available position; it neither wraps, loads, nor synchronizes routes.
 * @returns {void} <lang><zh-CN>无返回值；可用时 emit `next`。</zh-CN><en>No return value; emits `next` when available.</en></lang>
 */
function handleNext() {
  // <lang><zh-CN>末项保持零事件；未提供 items 时也不会产生无效索引。</zh-CN><en>The last item remains event-free; no invalid index is produced when items are absent.</en></lang>
  if (safeIndex.value >= safeItems.value.length - 1) return;
  const item = safeItems.value[safeIndex.value + 1];
  emit('next', { value: item.value, index: safeIndex.value + 1 });
}
</script>

<style src="./u-tabs-swiper.css"></style>
