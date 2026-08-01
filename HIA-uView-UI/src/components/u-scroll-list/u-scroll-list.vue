<!--
@component UScrollList
@lang zh-CN 提供局部 CSS overflow 横向列表与有限 item/slot；不使用 WXS、BindingX、native plugin、DOM 测量、分页或请求。
@lang en Provides a local CSS-overflow horizontal list with finite items/slot; it uses no WXS, BindingX, native plugin, DOM measurement, paging, or request.
-->
<template>
  <view class="u-scroll-list" role="region" :aria-label="ariaLabel || undefined">
    <view class="u-scroll-list__viewport">
      <view class="u-scroll-list__track">
        <button
          v-for="item in safeItems"
          :key="item.key"
          class="u-scroll-list__item"
          :disabled="item.disabled"
          type="button"
          @click="handleSelect(item)"
        >
          <text>{{ item.label }}</text>
        </button>
        <slot />
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>声明稳定名称；横向滚动只由 CSS overflow 负责，不绑定平台 scroll-view。</zh-CN><en>Declares a stable name; horizontal scrolling is handled by CSS overflow only and is not bound to platform scroll-view.</en></lang>
defineOptions({ name: 'u-scroll-list' });

const props = defineProps({
  items: { type: Array, default: () => [] },
  ariaLabel: { type: String, default: '' }
});

const emit = defineEmits(['select']);
const safeItems = computed(() => props.items.map((item, index) => {
  const source = typeof item === 'string' ? { label: item } : (item || {});
  return {
    key: `${String(source.value ?? source.label ?? index)}-${index}`,
    label: String(source.label ?? source.title ?? ''),
    value: String(source.value ?? ''),
    disabled: Boolean(source.disabled)
  };
}).filter((item) => item.label.length > 0));

/**
 * @lang zh-CN 只报告 item 选择意图；组件不测量滚动位置或同步指示器。
 * @lang en Reports item selection intent only; the component does not measure scroll position or synchronize an indicator.
 * @param {{ value: string, key: string, disabled: boolean }} item <lang><zh-CN>归一化 item。</zh-CN><en>Normalized item.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleSelect(item) {
  if (item.disabled) return;
  const index = safeItems.value.findIndex((candidate) => candidate.key === item.key);
  emit('select', { value: item.value, index });
}
</script>

<style src="./u-scroll-list.css"></style>
