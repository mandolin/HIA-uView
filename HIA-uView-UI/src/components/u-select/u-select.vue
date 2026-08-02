<!--
@component USelect
@lang zh-CN 提供单值有限选项选择；选项和数据生命周期由调用方拥有。
@lang en Provides finite single-value option selection; the caller owns options and data lifecycle.
-->
<template>
  <view class="u-select" :class="{ 'u-select--disabled': props.disabled }" role="group">
    <text v-if="!selectedOption" class="u-select__placeholder">{{ props.placeholder }}</text>
    <text v-else class="u-select__value">{{ selectedOption.label }}</text>
    <view class="u-select__options" role="listbox" :aria-disabled="props.disabled">
      <button v-for="option in safeOptions" :key="option.key" class="u-select__option" :class="{ 'u-select__option--selected': option.value === props.modelValue }" type="button" role="option" :aria-selected="option.value === props.modelValue" :disabled="props.disabled || option.disabled" @click="selectOption(option)">{{ option.label }}</button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>保留 u- 名称，选项选择仍然由调用方显式控制。</zh-CN><en>Retains the u- name while option selection remains explicitly caller-controlled.</en></lang>
defineOptions({ name: 'u-select' });

// <lang><zh-CN>options 只接受有限原始值或简单对象，不执行请求、搜索或远程过滤。</zh-CN><en>Options accept finite primitives or simple objects only and perform no request, search, or remote filtering.</en></lang>
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Select / 请选择' },
  disabled: { type: Boolean, default: false }
});
const emit = defineEmits(['update:modelValue', 'change']);

// <lang><zh-CN>复制并规范化选项，避免改变调用方传入的数据集合。</zh-CN><en>Copies and normalizes options without changing the caller-provided collection.</en></lang>
const safeOptions = computed(() => props.options.map((raw, index) => {
  const isObject = typeof raw === 'object' && raw !== null;
  const value = isObject ? (raw.value ?? raw.label ?? index) : raw;
  const label = isObject ? String(raw.label ?? raw.value ?? `Option ${index + 1}`) : String(raw);
  return Object.freeze({ key: `${String(value)}-${index}`, label, value, disabled: Boolean(isObject && raw.disabled) });
}));
const selectedOption = computed(() => safeOptions.value.find((option) => option.value === props.modelValue));

/**
 * @lang zh-CN 选择可用选项并报告受控更新和 change 意图。
 * @lang en Selects an available option and reports controlled update and change intent.
 * @param {{value: string|number, disabled: boolean}} option <lang><zh-CN>选项。</zh-CN><en>Option.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function selectOption(option) {
  if (props.disabled || option.disabled) return;
  emit('update:modelValue', option.value);
  emit('change', option.value);
}
</script>

<style src="./u-select.css"></style>
