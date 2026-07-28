<!--
@component HiaButton
@lang zh-CN HIA-uView 首个独立实现的通用本地操作组件；仅实现已批准的 primary、secondary、text、尺寸、禁用、加载、标签与 click 契约。
@lang en The first independently implemented generic local-action component in HIA-uView; implements only the approved primary, secondary, text, size, disabled, loading, label, and click contract.
-->
<template>
  <button
    :class="buttonClasses"
    :disabled="isInactive"
    :loading="loading"
    @click="handleClick"
  >
    <text v-if="loading" class="hia-button__loading-text">{{ resolvedLoadingText }}</text>
    <slot v-else>{{ label }}</slot>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import { resolveButtonMessage } from '../../localization/button-messages.mjs';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'text'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  block: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['click']);

const isInactive = computed(() => props.disabled || props.loading);
const resolvedLoadingText = computed(() => props.loadingText || resolveButtonMessage('component.button.loading'));
const buttonClasses = computed(() => [
  'hia-button',
  `hia-button--${props.variant}`,
  `hia-button--${props.size}`,
  {
    'hia-button--block': props.block,
    'hia-button--disabled': props.disabled,
    'hia-button--loading': props.loading
  }
]);

function handleClick(event) {
  if (!isInactive.value) {
    emit('click', event);
  }
}
</script>

<style src="./hia-button.css"></style>
