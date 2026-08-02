<!--
@component UGridItem
@lang zh-CN 呈现网格中的单个声明式项目并报告局部 click intent；不拥有路由或业务动作。
@lang en Presents one declarative grid item and reports local click intent; it owns no routing or business action.
-->
<template>
  <view class="u-grid-item" :class="{ 'u-grid-item--disabled': props.disabled }" :style="itemStyle" role="button" :aria-disabled="props.disabled" :tabindex="props.disabled ? -1 : 0" @click="handleClick">
    <view class="u-grid-item__icon"><slot name="icon" /></view>
    <view class="u-grid-item__content">
      <text v-if="props.label" class="u-grid-item__label">{{ props.label }}</text>
      <text v-if="props.description" class="u-grid-item__description">{{ props.description }}</text>
      <slot />
    </view>
  </view>
</template>

<script setup>
import { computed, inject } from 'vue';
import { GRID_CONTEXT } from '../grid-context.mjs';

// <lang><zh-CN>使用稳定的 u- 名称；上下文仅用于布局展示。</zh-CN><en>Uses a stable u- name; context is used for presentation layout only.</en></lang>
defineOptions({ name: 'u-grid-item' });

// <lang><zh-CN>网格项输入只包含调用方文字和禁用意图，不解释业务类别。</zh-CN><en>Grid-item inputs contain caller text and disabled intent only and interpret no business category.</en></lang>
const props = defineProps({
  label: { type: String, default: '' },
  description: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
});
const emit = defineEmits(['click']);

// <lang><zh-CN>缺少父级时仍可独立渲染，保证组件不依赖隐式全局 registry。</zh-CN><en>Renders independently when no parent exists, so the component does not depend on an implicit global registry.</en></lang>
const gridContext = inject(GRID_CONTEXT, null);
const square = computed(() => Boolean(gridContext?.square?.value));
const itemStyle = computed(() => ({ '--u-grid-item-aspect': square.value ? '1' : 'auto' }));

/**
 * @lang zh-CN 仅在启用时报告局部点击意图。
 * @lang en Reports local click intent only when enabled.
 * @param {Event} event <lang><zh-CN>平台点击事件。</zh-CN><en>Platform click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleClick(event) {
  if (props.disabled) return;
  emit('click', event);
}
</script>

<style src="./u-grid-item.css"></style>
