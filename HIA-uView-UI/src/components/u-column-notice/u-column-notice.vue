<!--
@component UColumnNotice
@lang zh-CN 呈现调用方提供的有限 notice 列表中的当前纵向项目；不自动轮播、不计时、不请求或测量滚动。
@lang en Presents the current vertical item from a caller-provided finite notice list; it does not autoplay, time, request, or measure scrolling.
-->
<template>
  <!-- @lang zh-CN 当前项目存在时才生成可选择 control；调用方可用 slot 补充展示，但组件不拥有公告来源。
  @lang en A selectable control renders only when a current item exists; callers may supplement presentation through the slot, while the component owns no notice source.
  <lang><zh-CN>纵向含义仅来自布局 class；activeIndex 的推进始终由 caller 决定。</zh-CN><en>Vertical meaning comes only from the layout class; advancing activeIndex always remains caller-decided.</en></lang> -->
  <view class="u-column-notice" role="region" :aria-label="ariaLabel || undefined"><button v-if="currentItem" class="u-column-notice__item" type="button" :disabled="currentItem.disabled" @click="handleSelect"><text class="u-column-notice__label">{{ currentItem.label }}</text><text v-if="currentItem.description" class="u-column-notice__description">{{ currentItem.description }}</text><slot :item="currentItem" :index="safeIndex" /></button><slot v-else /></view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称表示单项纵向 notice 投影，不表示滚动公告服务。</zh-CN><en>The stable name denotes a one-item vertical notice projection, not a scrolling-announcement service.</en></lang>
defineOptions({ name: 'u-column-notice' });

// <lang><zh-CN>items、activeIndex 与可访问标签均由 caller 拥有；没有自动间隔或默认文字。</zh-CN><en>Items, activeIndex, and accessible label are caller-owned; there is no automatic interval or default copy.</en></lang>
const props = defineProps({ items: { type: Array, default: () => [] }, activeIndex: { type: Number, default: 0 }, ariaLabel: { type: String, default: '' } });

// <lang><zh-CN>select 只报告当前规范化项目及索引，不写回 activeIndex 或修改数组。</zh-CN><en>Select reports only the current normalized item and index; it writes neither activeIndex nor the array.</en></lang>
const emit = defineEmits(['select']);

// <lang><zh-CN>仅保留有可读 label 的项目；对象与字符串均可作为 caller 的有限本地输入。</zh-CN><en>Retains only items with readable labels; objects and strings may both be caller finite local input.</en></lang>
const safeItems = computed(() => props.items.map((item, index) => {
  // <lang><zh-CN>source 避免直接修改 caller 项；缺失对象降级为空对象。</zh-CN><en>Source avoids mutating caller items; a missing object degrades to an empty object.</en></lang>
  const source = typeof item === 'string' ? { label: item } : (item || {});
  return Object.freeze({ key: `${String(source.value ?? source.label ?? index)}-${index}`, label: String(source.label ?? source.title ?? ''), description: String(source.description ?? source.desc ?? ''), value: String(source.value ?? ''), disabled: Boolean(source.disabled) });
}).filter((item) => item.label.trim().length > 0));

// <lang><zh-CN>索引 clamp 使空列表与越界输入可预测；它不暗示下一项或循环行为。</zh-CN><en>Index clamping makes empty lists and out-of-range input predictable; it implies neither next-item nor looping behavior.</en></lang>
const safeIndex = computed(() => safeItems.value.length === 0 ? 0 : Math.min(safeItems.value.length - 1, Math.max(0, Math.trunc(props.activeIndex))));

// <lang><zh-CN>当前项由 caller index 透明投影，未选择时保持 null 以呈现默认 slot。</zh-CN><en>The current item transparently projects caller index and remains null when none is selectable so the default slot can render.</en></lang>
const currentItem = computed(() => safeItems.value[safeIndex.value] || null);

/**
 * @lang zh-CN 报告当前 notice 的局部选择意图；不推进 index、启动轮播或访问公告数据。
 * @lang en Reports local selection intent for the current notice; it neither advances index, starts rotation, nor accesses notice data.
 * @returns {void} <lang><zh-CN>无返回值；可用时 emit `select`。</zh-CN><en>No return value; emits `select` when enabled.</en></lang>
 */
function handleSelect() {
  // <lang><zh-CN>guard 保持空态和 disabled 项零事件，避免 UI 伪造可执行公告操作。</zh-CN><en>The guard keeps empty and disabled items event-free, avoiding UI fabrication of an executable announcement action.</en></lang>
  if (!currentItem.value || currentItem.value.disabled) return;
  // <lang><zh-CN>payload 保留 caller value、当前索引和只读投影，不携带数据源或平台事件。</zh-CN><en>The payload retains caller value, current index, and read-only projection without carrying a data source or platform event.</en></lang>
  emit('select', { value: currentItem.value.value, index: safeIndex.value, item: currentItem.value });
}
</script>

<style src="./u-column-notice.css"></style>
