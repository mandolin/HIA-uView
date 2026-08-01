<!--
@component UList
@lang zh-CN 提供调用方声明的有限列表行与局部选择意图；不请求、缓存、虚拟化、分页、自动加载或使用平台 list/scroll 服务。
@lang en Provides caller-declared finite list rows and local selection intent; it performs no request, cache, virtualization, paging, automatic loading, or platform list/scroll service.
-->
<template>
  <view class="u-list" role="list" :aria-label="ariaLabel || undefined">
    <button
      v-for="item in safeItems"
      :key="item.key"
      class="u-list__item"
      :class="{ 'u-list__item--disabled': item.disabled }"
      :disabled="item.disabled"
      type="button"
      role="listitem"
      @click="handleSelect(item)"
    >
      <view class="u-list__body">
        <text class="u-list__label">{{ item.label }}</text>
        <text v-if="item.description" class="u-list__description">{{ item.description }}</text>
      </view>
      <text v-if="item.value" class="u-list__value">{{ item.value }}</text>
    </button>
    <view class="u-list__slot"><slot /></view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>声明稳定的 kebab-case 名称，使模板、manifest 与显式 plugin registry 使用同一运行时键。</zh-CN><en>Declares the stable kebab-case name so the template, manifest, and explicit plugin registry use the same runtime key.</en></lang>
defineOptions({ name: 'u-list' });

// <lang><zh-CN>items 只接受调用方本地文字对象；slot 保留任意行内容的调用方所有权。</zh-CN><en>Items accept caller-local text objects only; the slot retains caller ownership of arbitrary row content.</en></lang>
const props = defineProps({
  items: { type: Array, default: () => [] },
  ariaLabel: { type: String, default: '' }
});

// <lang><zh-CN>select 只报告透明的 value/index 组合；调用方决定是否导航、查询或改变数据。</zh-CN><en>Select reports a transparent value/index pair only; the caller decides whether to navigate, query, or change data.</en></lang>
const emit = defineEmits(['select']);

const safeItems = computed(() => props.items.map((item, index) => {
  const source = typeof item === 'string' ? { label: item } : (item || {});
  return {
    key: `${String(source.value ?? source.label ?? index)}-${index}`,
    label: String(source.label ?? source.title ?? ''),
    description: String(source.description ?? source.desc ?? ''),
    value: String(source.value ?? ''),
    disabled: Boolean(source.disabled)
  };
}).filter((item) => item.label.length > 0));

/**
 * @lang zh-CN 在非禁用行上报告一次本地选择意图；不修改 items 或执行后续动作。
 * @lang en Reports one local selection intent for an enabled row; it does not mutate items or execute follow-up actions.
 * @param {{ value: string, key: string }} item <lang><zh-CN>已归一化的本地行。</zh-CN><en>Normalized local row.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleSelect(item) {
  if (item.disabled) return;
  const index = safeItems.value.findIndex((candidate) => candidate.key === item.key);
  emit('select', { value: item.value, index });
}
</script>

<style src="./u-list.css"></style>
