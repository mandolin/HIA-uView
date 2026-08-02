<!--
@component ULine
@lang zh-CN 提供局部分隔线；不表达流程状态、层级权限或业务关系。
@lang en Provides a local divider; it expresses no flow state, hierarchy permission, or business relationship.
-->
<template><view class="u-line" :class="`u-line--${safeDirection}`" :style="lineStyle" aria-hidden="true"><slot /></view></template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>保留 u- 名称作为迁移友好的分隔原语。</zh-CN><en>Retains the u- name as a migration-friendly divider primitive.</en></lang>
defineOptions({ name: 'u-line' });

// <lang><zh-CN>方向和长度均为有限本地几何，不接受远程或业务表达式。</zh-CN><en>Direction and length are finite local geometry and accept no remote or business expression.</en></lang>
const props = defineProps({ direction: { type: String, default: 'horizontal' }, color: { type: String, default: '' }, length: { type: Number, default: 100 } });
const directions = Object.freeze(['horizontal', 'vertical']);
const safeDirection = computed(() => directions.includes(props.direction) ? props.direction : 'horizontal');
const safeLength = computed(() => Number.isFinite(props.length) ? Math.min(100, Math.max(0, props.length)) : 100);
const lineStyle = computed(() => ({ '--u-line-color': props.color || 'var(--u-comp-line-color)', '--u-line-length': `${safeLength.value}%` }));
</script>

<style src="./u-line.css"></style>
