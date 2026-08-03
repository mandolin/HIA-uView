<!--
@component URowNotice
@lang zh-CN 呈现调用方提供的有限 notice 列表中的当前横向项目；不自动滚动、不计时、不请求或读取容器尺寸。
@lang en Presents the current horizontal item from a caller-provided finite notice list; it does not auto-scroll, time, request, or read container dimensions.
-->
<template>
  <!-- @lang zh-CN 当前项目只在有可读 label 时成为本地 button；slot 可补充内容，但组件不拥有公告数据或轮播节奏。
  @lang en A current item becomes a local button only when it has readable label; the slot may supplement content, while the component owns neither notice data nor rotation pace.
  <lang><zh-CN>横向布局不表示原生 marquee 或动画，activeIndex 始终由 caller 更新。</zh-CN><en>Horizontal layout does not denote a native marquee or animation; activeIndex is always updated by the caller.</en></lang> -->
  <view class="u-row-notice" role="region" :aria-label="ariaLabel || undefined"><button v-if="currentItem" class="u-row-notice__item" type="button" :disabled="currentItem.disabled" @click="handleSelect"><text class="u-row-notice__label">{{ currentItem.label }}</text><text v-if="currentItem.description" class="u-row-notice__description">{{ currentItem.description }}</text><slot :item="currentItem" :index="safeIndex" /></button><slot v-else /></view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称保留迁移可发现性；它仅投影一项，不创建横向滚动服务。</zh-CN><en>The stable name retains migration discoverability; it projects one item only and creates no horizontal-scrolling service.</en></lang>
defineOptions({ name: 'u-row-notice' });

// <lang><zh-CN>caller 提供所有项目、当前索引与可访问名称；没有默认公告文字或自动推进参数。</zh-CN><en>The caller provides all items, current index, and accessible name; there is no default announcement copy or automatic-advance parameter.</en></lang>
const props = defineProps({ items: { type: Array, default: () => [] }, activeIndex: { type: Number, default: 0 }, ariaLabel: { type: String, default: '' } });

// <lang><zh-CN>select 是唯一局部意图；数组与索引仍是 caller-owned input。</zh-CN><en>Select is the sole local intent; the array and index remain caller-owned input.</en></lang>
const emit = defineEmits(['select']);

// <lang><zh-CN>将字符串/对象输入投影为冻结的本地显示记录，避免修改 caller 数据。</zh-CN><en>Projects string/object input into frozen local display records, avoiding mutation of caller data.</en></lang>
const safeItems = computed(() => props.items.map((item, index) => {
  // <lang><zh-CN>source 吸收空值，使字段归一化不依赖外部 schema。</zh-CN><en>Source absorbs nullish input so field normalization depends on no external schema.</en></lang>
  const source = typeof item === 'string' ? { label: item } : (item || {});
  return Object.freeze({ key: `${String(source.value ?? source.label ?? index)}-${index}`, label: String(source.label ?? source.title ?? ''), description: String(source.description ?? source.desc ?? ''), value: String(source.value ?? ''), disabled: Boolean(source.disabled) });
}).filter((item) => item.label.trim().length > 0));

// <lang><zh-CN>有限 clamp 避免越界读取，不循环也不寻找下一项。</zh-CN><en>Finite clamping avoids out-of-range reads and neither loops nor finds a next item.</en></lang>
const safeIndex = computed(() => safeItems.value.length === 0 ? 0 : Math.min(safeItems.value.length - 1, Math.max(0, Math.trunc(props.activeIndex))));

// <lang><zh-CN>当前项仅是规范化列表的透明索引结果；空列表保留 null 给默认 slot。</zh-CN><en>The current item is only the transparent index result of the normalized list; an empty list retains null for the default slot.</en></lang>
const currentItem = computed(() => safeItems.value[safeIndex.value] || null);

/**
 * @lang zh-CN 报告当前项的局部选择意图；不推进公告、不写回索引也不访问网络。
 * @lang en Reports local selection intent for the current item; it neither advances notices, writes back index, nor accesses network.
 * @returns {void} <lang><zh-CN>无返回值；可用项目才 emit `select`。</zh-CN><en>No return value; emits `select` only for an enabled item.</en></lang>
 */
function handleSelect() {
  // <lang><zh-CN>空项或 disabled 项必须保持无事件，避免把静态反馈误作为操作。</zh-CN><en>An absent or disabled item must remain event-free, avoiding static feedback being mistaken for an action.</en></lang>
  if (!currentItem.value || currentItem.value.disabled) return;
  // <lang><zh-CN>payload 只返回 caller value、索引和本地投影；不泄露数据源或平台状态。</zh-CN><en>The payload returns only caller value, index, and local projection; it exposes no data source or platform state.</en></lang>
  emit('select', { value: currentItem.value.value, index: safeIndex.value, item: currentItem.value });
}
</script>

<style src="./u-row-notice.css"></style>
