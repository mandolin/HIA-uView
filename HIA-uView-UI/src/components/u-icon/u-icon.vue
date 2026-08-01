<!--
@component UIcon
@lang zh-CN 提供调用方文字符号或 slot 的中性图标占位；不加载字体、图片、图标 registry 或平台服务。
@lang en Provides a neutral icon placeholder from caller text or a slot; it loads no font, image, icon registry, or platform service.
-->
<template>
  <view :class="rootClasses" role="img" :aria-label="label || displaySymbol" @click="handleClick">
    <text class="u-icon__symbol"><slot>{{ displaySymbol }}</slot></text>
    <text v-if="label" class="u-icon__label">{{ label }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>保持熟悉的 u-icon 模板名，但将图标含义和可见符号完全交给调用方。</zh-CN><en>Retains the familiar u-icon template name while leaving icon meaning and visible symbol entirely to the caller.</en></lang>
defineOptions({ name: 'u-icon' });

// <lang><zh-CN>name 只作为文字符号使用，不作为名称到字体或图标资源的 registry key。</zh-CN><en>name is used as visible text only and never as a registry key for a font or icon resource.</en></lang>
const props = defineProps({
  name: { type: String, default: '' },
  label: { type: String, default: '' },
  size: { type: String, default: 'medium' },
  tone: { type: String, default: 'neutral' },
  disabled: { type: Boolean, default: false }
});

// <lang><zh-CN>唯一事件是可选的本地 click intent；组件不执行导航或业务动作。</zh-CN><en>The only event is optional local click intent; the component performs no navigation or business action.</en></lang>
const emit = defineEmits(['click']);

// <lang><zh-CN>未知尺寸和 tone 回退到有限 token 类，避免任意字符串成为 CSS 或脚本输入。</zh-CN><en>Unknown size and tone fall back to finite token classes so arbitrary strings cannot become CSS or script input.</en></lang>
const rootClasses = computed(() => {
  const size = ['small', 'medium', 'large'].includes(props.size) ? props.size : 'medium';
  const tone = ['neutral', 'primary', 'accent'].includes(props.tone) ? props.tone : 'neutral';
  return ['u-icon', `u-icon--${size}`, `u-icon--${tone}`, { 'u-icon--disabled': props.disabled }];
});

// <lang><zh-CN>无名称时使用中性圆点，slot 仍可完全替换该默认呈现。</zh-CN><en>Uses a neutral dot when no name is supplied; the slot can still fully replace this default presentation.</en></lang>
const displaySymbol = computed(() => (props.name.length > 0 ? props.name : '•'));

/**
 * @lang zh-CN 处理本地 click intent；禁用状态保持零事件。
 * @lang en Handles local click intent; disabled state retains zero events.
 * @param {unknown} event <lang><zh-CN>本地点击事件。</zh-CN><en>Local click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleClick(event) {
  // <lang><zh-CN>guard 防止直接 handler 调用绕过 disabled 视觉状态。</zh-CN><en>The guard prevents direct handler calls from bypassing disabled presentation.</en></lang>
  if (props.disabled) {
    return;
  }
  emit('click', event);
}
</script>

<style src="./u-icon.css"></style>
