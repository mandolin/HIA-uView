<!--
@component UTable
@lang zh-CN 提供由 caller slot 组成的有限 view-based table 容器；不查询、排序、筛选、分页、测量布局或承诺原生 HTML table 行为。
@lang en Provides a finite view-based table container composed by caller slots; it performs no query, sort, filter, paging, layout measurement, and promises no native HTML table behavior.
-->
<template>
  <!-- @lang zh-CN 容器只提供局部 table role、边界外观和 slot；caller 决定行、列、数据及所有领域表格语义。
  @lang en The container provides only local table role, boundary presentation, and a slot; the caller decides rows, columns, data, and all domain-table semantics.
  <lang><zh-CN>role 是辅助可发现性标记，不构成小程序、读屏或 HTML table 行为承诺。</zh-CN><en>Role is an assistive discoverability marker and is not a promise of Mini Program, screen-reader, or HTML table behavior.</en></lang> -->
  <view :class="rootClasses" role="table" :aria-label="ariaLabel || undefined"><slot /></view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称表示跨 target 的 view table 容器，不表示数据表服务或浏览器表格元素。</zh-CN><en>The stable name denotes a cross-target view table container, not a data-table service or browser table element.</en></lang>
defineOptions({ name: 'u-table' });

// <lang><zh-CN>bordered 和可访问名称来自 caller；没有 columns、records、排序或分页 props。</zh-CN><en>Bordered state and accessible name come from the caller; there are no columns, records, sort, or paging props.</en></lang>
const props = defineProps({ bordered: { type: Boolean, default: true }, ariaLabel: { type: String, default: '' } });

// <lang><zh-CN>根 class 只包含有限布尔呈现状态，不编码数据源或领域样式。</zh-CN><en>The root class contains finite boolean presentation state only and encodes no data source or domain styling.</en></lang>
const rootClasses = computed(() => ['u-table', { 'u-table--bordered': props.bordered }]);
</script>

<style src="./u-table.css"></style>
