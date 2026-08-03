<!--
@component UWaterfall
@lang zh-CN 将调用方有限 items 按确定性 round-robin 分配到有限列，并报告局部选择；不测量高度、不重排、不观察图像或无限获取数据。
@lang en Distributes caller finite items to finite columns by deterministic round robin and reports local selection; it measures no height, reflows nothing, observes no image, and fetches no infinite data.
-->
<template>
  <!-- @lang zh-CN 每列的项目序列只依赖有限 item 顺序和 caller columnCount；slot 可替代文字卡片。
  @lang en Every column item sequence depends only on finite item order and caller columnCount; the slot may replace text cards.
  <lang><zh-CN>列分配不是视觉高度平衡，不承诺瀑布流的测量、重排或图像加载布局。</zh-CN><en>Column distribution is not visual-height balancing and promises no masonry measurement, reflow, or image-load layout.</en></lang> -->
  <view class="u-waterfall" :style="rootStyle" role="list" :aria-label="ariaLabel || undefined"><view v-for="(column, columnIndex) in projectedColumns" :key="`column-${columnIndex}`" class="u-waterfall__column"><button v-for="entry in column" :key="entry.item.key" class="u-waterfall__item" type="button" :disabled="entry.item.disabled" role="listitem" @click="handleSelect(entry)"><slot :item="entry.item" :index="entry.index" :column-index="columnIndex"><text class="u-waterfall__label">{{ entry.item.label }}</text><text v-if="entry.item.description" class="u-waterfall__description">{{ entry.item.description }}</text></slot></button></view><slot name="empty" v-if="safeItems.length === 0" /></view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称表示确定性有限列投影，而非测量驱动或数据驱动的瀑布流引擎。</zh-CN><en>The stable name represents deterministic finite-column projection, not a measurement-driven or data-driven masonry engine.</en></lang>
defineOptions({ name: 'u-waterfall' });

// <lang><zh-CN>items、列数和可访问名称由 caller 拥有；不预设图像、分类、分页或加载文案。</zh-CN><en>Items, column count, and accessible name are caller-owned; no image, category, paging, or loading copy is predefined.</en></lang>
const props = defineProps({ items: { type: Array, default: () => [] }, columnCount: { type: Number, default: 2 }, ariaLabel: { type: String, default: '' } });

// <lang><zh-CN>select 只带回透明 item/index/column 候选，caller 决定后续导航、写入或加载。</zh-CN><en>Select returns only transparent item/index/column candidate; the caller decides follow-up navigation, write, or loading.</en></lang>
const emit = defineEmits(['select']);

// <lang><zh-CN>列数限制在一至四，避免任意输入产生难以审阅的跨 target 布局表面。</zh-CN><en>Column count is constrained to one through four, preventing arbitrary input from producing an unreviewable cross-target layout surface.</en></lang>
const safeColumnCount = computed(() => Math.min(4, Math.max(1, Math.trunc(Number(props.columnCount) || 2))));

// <lang><zh-CN>内联变量只向本地 CSS 投递已规范化列数，不测量项目、图片或容器。</zh-CN><en>The inline variable passes only normalized column count to local CSS and measures no item, image, or container.</en></lang>
const rootStyle = computed(() => ({ '--u-waterfall-column-count': String(safeColumnCount.value) }));

// <lang><zh-CN>对象/字符串输入被复制为冻结文字投影；无 label 项不成为不可发现的卡片 control。</zh-CN><en>Object/string input is copied into frozen text projection; a label-less item does not become an undiscoverable card control.</en></lang>
const safeItems = computed(() => props.items.map((item, index) => {
  // <lang><zh-CN>source 容纳空值并保护 caller item 不被局部标准化修改。</zh-CN><en>Source accommodates nullish input and protects caller items from local-normalization mutation.</en></lang>
  const source = typeof item === 'string' ? { label: item, value: item } : (item || {});
  return Object.freeze({ key: `${String(source.value ?? source.label ?? index)}-${index}`, label: String(source.label ?? source.title ?? ''), description: String(source.description ?? source.desc ?? ''), value: source.value ?? source.label ?? index, disabled: Boolean(source.disabled) });
}).filter((item) => item.label.trim().length > 0));

// <lang><zh-CN>round-robin 只基于稳定数组索引，确保同样 caller 输入跨 render 得到同样的有限列分配。</zh-CN><en>Round robin is based only on stable array index, ensuring identical caller input produces the same finite column distribution across renders.</en></lang>
const projectedColumns = computed(() => {
  // <lang><zh-CN>预先创建有限列，不根据布局或任何异步资源结果增减列数。</zh-CN><en>Creates finite columns up front and changes no column count based on layout or asynchronous resource result.</en></lang>
  const columns = Array.from({ length: safeColumnCount.value }, () => []);
  safeItems.value.forEach((item, index) => {
    // <lang><zh-CN>每个 entry 保留原始有限 index，便于 caller 区分局部同值项。</zh-CN><en>Every entry retains the original finite index so callers can distinguish local items with equal values.</en></lang>
    columns[index % safeColumnCount.value].push(Object.freeze({ item, index }));
  });
  return columns.map((column) => Object.freeze(column));
});

/**
 * @lang zh-CN 报告已启用卡片的局部选择；不读高度、图片状态或外部数据源。
 * @lang en Reports local selection of an enabled card; it reads no height, image state, or external data source.
 * @param {{item: {value: string|number, disabled: boolean}, index: number}} entry <lang><zh-CN>受限列投影 entry。</zh-CN><en>Constrained column-projection entry.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；可用时 emit `select`。</zh-CN><en>No return value; emits `select` when enabled.</en></lang>
 */
function handleSelect(entry) {
  // <lang><zh-CN>guard 使 disabled 卡片即使经合成事件到达也保持无 intent。</zh-CN><en>The guard keeps disabled cards intent-free even if reached through a composed event.</en></lang>
  if (entry.item.disabled) return;
  emit('select', { value: entry.item.value, item: entry.item, index: entry.index, columnIndex: entry.index % safeColumnCount.value });
}
</script>

<style src="./u-waterfall.css"></style>
