<!--
@component UBadge
@lang zh-CN 呈现调用方提供的文字或 dot 徽标；不读取通知、不请求计数，也不创建全局 badge service。
@lang en Presents a caller-provided text or dot badge; it reads no notifications, requests no count, and creates no global badge service.
-->
<template>
  <view :class="rootClasses">
    <slot />
    <text v-if="isVisible" class="u-badge__value">{{ displayValue }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>badge 只对受控 value 做有限显示投影，不推断未读或通知状态。</zh-CN><en>The badge projects controlled value only and infers no unread or notification state.</en></lang>
defineOptions({ name: 'u-badge' });

const props = defineProps({
  value: { type: [String, Number], default: '' },
  dot: { type: Boolean, default: false },
  max: { type: Number, default: 99 },
  showZero: { type: Boolean, default: false },
  tone: { type: String, default: 'primary' },
  size: { type: String, default: 'medium' },
  visible: { type: Boolean, default: true }
});

const safeValue = computed(() => String(props.value));
const displayValue = computed(() => {
  if (props.dot) return '';
  const numeric = Number(props.value);
  if (Number.isFinite(numeric) && numeric > props.max) return `${props.max}+`;
  return safeValue.value;
});
const isVisible = computed(() => {
  if (!props.visible) return false;
  if (props.dot) return true;
  if (safeValue.value.length === 0) return false;
  return props.showZero || Number(props.value) !== 0;
});
const rootClasses = computed(() => {
  const tone = ['neutral', 'primary', 'accent'].includes(props.tone) ? props.tone : 'primary';
  const size = ['small', 'medium', 'large'].includes(props.size) ? props.size : 'medium';
  return ['u-badge', `u-badge--${tone}`, `u-badge--${size}`, { 'u-badge--dot': props.dot }];
});
</script>

<style src="./u-badge.css"></style>
