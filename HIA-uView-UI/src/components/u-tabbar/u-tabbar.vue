<!--
@component UTabbar
@lang zh-CN 提供受控底部 tab 项、label/slot 与切换 intent；不执行 router、权限判断、身份推断或全局导航 service。
@lang en Provides controlled bottom tabs, labels/slots, and change intent; it performs no router, authorization, identity inference, or global navigation service.
-->
<template>
  <view v-if="visible" class="u-tabbar" role="tablist">
    <button
      v-for="item in safeItems"
      :key="item.key"
      class="u-tabbar__item"
      :class="{ 'u-tabbar__item--active': isActive(item), 'u-tabbar__item--disabled': item.disabled }"
      type="button"
      :disabled="item.disabled"
      role="tab"
      :aria-selected="isActive(item)"
      @click="handleSelect(item)"
    >
      <text class="u-tabbar__label">{{ item.label }}</text>
    </button>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>tabbar 只提供局部底部选择表面，图标、徽标与导航由调用方另行组合。</zh-CN><en>Tabbar provides a local bottom-selection surface only; caller composes any icon, badge, or navigation separately.</en></lang>
defineOptions({ name: 'u-tabbar' });

const props = defineProps({
  visible: { type: Boolean, default: true },
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
 * @lang zh-CN 报告底部 tab 的本地 change intent；不导航、不写入权限或身份状态。
 * @lang en Reports local bottom-tab change intent without navigation or authorization/identity writes.
 * @param {{ value: string|number, disabled: boolean }} item <lang><zh-CN>规范化 tab。</zh-CN><en>Normalized tab.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value。</en></lang>
 */
function handleSelect(item) {
  if (item.disabled || isActive(item)) return;
  emit('update:modelValue', item.value);
  emit('change', item.value);
}
</script>

<style src="./u-tabbar.css"></style>
