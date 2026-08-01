<!--
@component UTag
@lang zh-CN 提供有限 tone/size/shape 的中性文字标签和可选 close intent；不拥有分类 registry 或任意样式脚本。
@lang en Provides a neutral text tag with finite tone/size/shape and optional close intent; it owns no category registry or arbitrary style script.
-->
<template>
  <view v-if="visible" :class="rootClasses" role="button" @click="handleClick">
    <text class="u-tag__text">{{ text }}</text>
    <button v-if="closable" class="u-tag__close" type="button" :disabled="disabled" @click.stop="handleClose">×</button>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>模板名使用熟悉的 u-tag，tone 只映射本仓有限 token。</zh-CN><en>Uses the familiar u-tag template name while tone maps only to this repository's finite tokens.</en></lang>
defineOptions({ name: 'u-tag' });

const props = defineProps({
  text: { type: String, default: '' },
  tone: { type: String, default: 'neutral' },
  size: { type: String, default: 'medium' },
  shape: { type: String, default: 'rounded' },
  closable: { type: Boolean, default: false },
  visible: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['click', 'close']);
const rootClasses = computed(() => {
  const tone = ['neutral', 'primary', 'accent'].includes(props.tone) ? props.tone : 'neutral';
  const size = ['small', 'medium', 'large'].includes(props.size) ? props.size : 'medium';
  const shape = ['square', 'rounded', 'pill'].includes(props.shape) ? props.shape : 'rounded';
  return ['u-tag', `u-tag--${tone}`, `u-tag--${size}`, `u-tag--${shape}`, { 'u-tag--disabled': props.disabled }];
});

/**
 * @lang zh-CN 报告标签本地 click intent；禁用时保持零事件。
 * @lang en Reports local tag click intent and retains zero events while disabled.
 * @param {unknown} event <lang><zh-CN>本地点击事件。</zh-CN><en>Local click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleClick(event) {
  if (props.disabled) return;
  emit('click', event);
}

/**
 * @lang zh-CN 报告关闭意图；组件不自行隐藏，调用方通过 visible 决定结果。
 * @lang en Reports close intent; the component does not hide itself and the caller decides through visible.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleClose() {
  if (props.disabled) return;
  emit('close');
}
</script>

<style src="./u-tag.css"></style>
