<!--
@component UCountTo
@lang zh-CN 提供受控数字的同步格式投影；首轮不使用计时器、动画、自动递增或完成事件。
@lang en Provides a synchronous formatted projection of a controlled number; the first contract uses no timer, animation, auto-increment, or completion event.
-->
<template>
  <text :class="rootClasses">{{ formattedValue }}</text>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>保持 u-count-to 迁移名称，但明确把 count-to 收紧为静态受控呈现。</zh-CN><en>Retains the u-count-to migration name while explicitly narrowing count-to to static controlled presentation.</en></lang>
defineOptions({ name: 'u-count-to' });

const props = defineProps({
  modelValue: { type: [Number, String], default: 0 },
  decimals: { type: Number, default: 0 },
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
  separator: { type: String, default: ',' },
  size: { type: String, default: 'medium' },
  tone: { type: String, default: 'neutral' }
});

// <lang><zh-CN>把输入收紧为有限数字和有限小数位，避免 NaN、无限值或任意格式脚本进入呈现。</zh-CN><en>Narrows input to finite numbers and finite decimal places so NaN, infinity, and arbitrary formatting scripts cannot enter presentation.</en></lang>
const normalizedValue = computed(() => {
  const candidate = Number(props.modelValue);
  return Number.isFinite(candidate) ? candidate : 0;
});
const formattedValue = computed(() => {
  const decimals = Number.isInteger(props.decimals) && props.decimals >= 0 && props.decimals <= 6 ? props.decimals : 0;
  const fixed = normalizedValue.value.toFixed(decimals);
  const [integerPart, fractionPart] = fixed.split('.');
  const sign = integerPart.startsWith('-') ? '-' : '';
  const unsigned = sign ? integerPart.slice(1) : integerPart;
  const grouped = props.separator.length > 0 ? unsigned.replace(/\B(?=(\d{3})+(?!\d))/g, props.separator) : unsigned;
  return `${props.prefix}${sign}${grouped}${fractionPart ? `.${fractionPart}` : ''}${props.suffix}`;
});
const rootClasses = computed(() => {
  const size = ['small', 'medium', 'large'].includes(props.size) ? props.size : 'medium';
  const tone = ['neutral', 'primary', 'accent'].includes(props.tone) ? props.tone : 'neutral';
  return ['u-count-to', `u-count-to--${size}`, `u-count-to--${tone}`];
});
</script>

<style src="./u-count-to.css"></style>
