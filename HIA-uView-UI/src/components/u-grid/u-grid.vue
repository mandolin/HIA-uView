<!--
@component UGrid
@lang zh-CN 提供受控的本地网格容器；只通过显式 context 向直接子项传递列数、间距和方形意图。
@lang en Provides a controlled local grid container; it passes only explicit column, gap, and square intent through context to direct children.
-->
<template>
  <view class="u-grid" :class="{ 'u-grid--bordered': props.border }" :style="gridStyle">
    <slot />
  </view>
</template>

<script setup>
import { computed, provide } from 'vue';
import { GRID_CONTEXT } from '../grid-context.mjs';

// <lang><zh-CN>保留 u- 模板名称，方便既有 uView 代码按名称迁移。</zh-CN><en>Retains the u- template name so existing uView code can migrate by name.</en></lang>
defineOptions({ name: 'u-grid' });

// <lang><zh-CN>网格只接受有限的本地几何输入，不读取页面、网络或业务集合。</zh-CN><en>The grid accepts finite local geometry only and reads no page, network, or business collection.</en></lang>
const props = defineProps({
  columns: { type: Number, default: 3 },
  gap: { type: Number, default: 0 },
  border: { type: Boolean, default: false },
  square: { type: Boolean, default: false }
});

// <lang><zh-CN>将网格输入限制为可预测的 CSS 变量，避免任意字符串形成样式协议。</zh-CN><en>Bounds grid inputs to predictable CSS variables so arbitrary strings cannot become a style protocol.</en></lang>
const safeColumns = computed(() => Number.isFinite(props.columns) ? Math.min(12, Math.max(1, Math.floor(props.columns))) : 3);
const safeGap = computed(() => Number.isFinite(props.gap) ? Math.min(64, Math.max(0, props.gap)) : 0);
const gridStyle = computed(() => ({ '--u-grid-columns': safeColumns.value, '--u-grid-gap': `${safeGap.value}px` }));

// <lang><zh-CN>仅向直接子项提供只读布局 context；子项不因此获得导航、请求或状态管理能力。</zh-CN><en>Provides read-only layout context to direct children only; children gain no navigation, request, or state-management capability.</en></lang>
provide(GRID_CONTEXT, Object.freeze({ columns: safeColumns, gap: safeGap, square: computed(() => props.square) }));
</script>

<style src="./u-grid.css"></style>
