<!--
@component UTabs
@lang zh-CN 提供调用方声明的有限 tab 列表与受控切换 intent；不导航、不请求、不懒加载、不使用滚动动画。
@lang en Provides a caller-declared finite tab list and controlled change intent; it does not navigate, request, lazy-load, or animate scrolling.
-->
<template>
  <view class="u-tabs" role="tablist">
    <button
      v-for="item in safeItems"
      :key="item.key"
      class="u-tabs__item"
      :class="{ 'u-tabs__item--active': isActive(item), 'u-tabs__item--disabled': item.disabled }"
      type="button"
      :disabled="item.disabled"
      role="tab"
      :aria-selected="isActive(item)"
      @click="handleSelect(item)"
    >{{ item.label }}</button>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>tabs 只消费声明式 items 与受控 modelValue，不管理隐藏内容或路由。</zh-CN><en>Tabs consumes declarative items and controlled modelValue only and manages neither hidden content nor routing.</en></lang>
defineOptions({ name: 'u-tabs' });

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  items: { type: Array, default: () => [] }
});
const emit = defineEmits(['update:modelValue', 'change']);
const safeItems = computed(() => props.items.map((item, index) => {
  const source = typeof item === 'string' ? { label: item, value: item } : (item || {});
  return {
    key: `${String(source.value ?? source.label ?? index)}-${index}`,
    label: String(source.label ?? source.text ?? ''),
    value: source.value ?? source.label ?? index,
    disabled: Boolean(source.disabled)
  };
}).filter((item) => item.label.length > 0));

function isActive(item) {
  return props.modelValue === item.value;
}

/**
 * @lang zh-CN 报告 tab value/change intent；调用方决定内容、请求和后续视图。
 * @lang en Reports tab value/change intent; the caller decides content, requests, and follow-up view.
 * @param {{ value: string|number, disabled: boolean }} item <lang><zh-CN>规范化 tab。</zh-CN><en>Normalized tab.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleSelect(item) {
  if (item.disabled || isActive(item)) return;
  emit('update:modelValue', item.value);
  emit('change', item.value);
}
</script>

<style src="./u-tabs.css"></style>
