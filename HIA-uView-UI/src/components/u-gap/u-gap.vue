<!--
@component UGap
@lang zh-CN 提供受控的垂直空隙；不拥有布局树、页面滚动或业务节奏。
@lang en Provides a controlled vertical gap; it owns no layout tree, page scrolling, or business cadence.
-->
<template><view class="u-gap" :style="gapStyle" aria-hidden="true" /></template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>保留 u- 名称作为可迁移的布局原语。</zh-CN><en>Retains the u- name as a migratable layout primitive.</en></lang>
defineOptions({ name: 'u-gap' });

// <lang><zh-CN>gap 只接收有限像素尺寸和可选背景色；背景色缺省时由主题提供透明值。</zh-CN><en>Gap accepts a finite pixel size and optional background color; the theme supplies transparency when no color is given.</en></lang>
const props = defineProps({ height: { type: Number, default: 8 }, bgColor: { type: String, default: '' } });

// <lang><zh-CN>将高度限制在本地可预期范围；调用方不应借此传入业务表达式。</zh-CN><en>Bounds height to a predictable local range; callers should not use it to pass business expressions.</en></lang>
const safeHeight = computed(() => Number.isFinite(props.height) ? Math.min(256, Math.max(0, props.height)) : 8);
const gapStyle = computed(() => ({ '--u-gap-height': `${safeHeight.value}px`, '--u-gap-background': props.bgColor || 'transparent' }));
</script>

<style src="./u-gap.css"></style>
