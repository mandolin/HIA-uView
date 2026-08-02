<!--
@component UReadMore
@lang zh-CN 提供受控展开/收起投影；不测量 DOM、不自动折叠，也不拥有分页。
@lang en Provides controlled expand/collapse projection; it measures no DOM, auto-collapses nothing, and owns no pagination.
-->
<template><view class="u-read-more" :class="{ 'u-read-more--expanded': props.modelValue, 'u-read-more--disabled': props.disabled }" :style="contentStyle"><slot /></view><button class="u-read-more__trigger" type="button" :disabled="props.disabled" @click="toggle">{{ props.modelValue ? props.collapseText : props.expandText }}</button></template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>使用 u- 名称，展开状态完全由 v-model 控制。</zh-CN><en>Uses the u- name while expansion remains fully controlled by v-model.</en></lang>
defineOptions({ name: 'u-read-more' });

// <lang><zh-CN>showHeight 只投影固定 CSS 高度，不执行内容测量或异步工作。</zh-CN><en>showHeight projects a fixed CSS height only and performs no content measurement or asynchronous work.</en></lang>
const props = defineProps({ modelValue: { type: Boolean, default: false }, showHeight: { type: Number, default: 120 }, expandText: { type: String, default: 'Read more / 展开' }, collapseText: { type: String, default: 'Collapse / 收起' }, disabled: { type: Boolean, default: false } });
const emit = defineEmits(['update:modelValue', 'change']);
const safeHeight = computed(() => Number.isFinite(props.showHeight) ? Math.min(600, Math.max(24, props.showHeight)) : 120);
const contentStyle = computed(() => ({ '--u-read-more-height': `${safeHeight.value}px` }));

/**
 * @lang zh-CN 报告相反的受控展开意图，不直接修改 props。
 * @lang en Reports the inverse controlled expansion intent without mutating props.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function toggle() {
  if (props.disabled) return;
  const nextValue = !props.modelValue;
  emit('update:modelValue', nextValue);
  emit('change', nextValue);
}
</script>

<style src="./u-read-more.css"></style>
