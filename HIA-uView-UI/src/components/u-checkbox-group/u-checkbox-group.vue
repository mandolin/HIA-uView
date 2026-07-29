<!--
@component UCheckboxGroup
@lang zh-CN 向 slot 内 UCheckbox 提供调用方受控字符串成员集合；它创建下一数组并 emit，不 mutate 输入、持久化或解释业务意义。
@lang en Provides caller-controlled string membership collection to slot-contained UCheckbox; it creates next arrays and emits them without mutating input, persisting, or interpreting business meaning.
-->
<template><!-- @lang zh-CN group 根只排列调用方 slot。 @lang en The group root arranges caller slot only. <lang><zh-CN>不发现外部子项或建立全局 registry。</zh-CN><en>It discovers no external child or global registry.</en></lang> --><view class="u-checkbox-group"><slot /></view></template>
<script setup>
import { computed, provide } from 'vue';
import { CHECKBOX_GROUP_CONTEXT } from '../selection-context.mjs';
defineOptions({ name: 'u-checkbox-group' });
// <lang><zh-CN>group 仅接收调用方数组/disabled；默认空数组不生成默认选择。</zh-CN><en>The group accepts caller array/disabled only; default empty array generates no default choice.</en></lang>
const props = defineProps({ modelValue: { type: Array, default: () => [] }, disabled: { type: Boolean, default: false } });
const emit = defineEmits(['update:modelValue', 'change']);
const selectedValues = computed(() => props.modelValue);
const isGroupDisabled = computed(() => props.disabled);
/**
 * @lang zh-CN 由 child value 和 next checked 构造新数组；不修改 prop。
 * @lang en Builds a new array from child value and next checked without modifying prop.
 * @param {string} value <lang><zh-CN>本地键。</zh-CN><en>Local key.</en></lang>
 * @param {boolean} checked <lang><zh-CN>下一呈现状态。</zh-CN><en>Next presentation state.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function changeValue(value, checked) {
  // <lang><zh-CN>禁用 group 保持零事件。</zh-CN><en>A disabled group retains zero events.</en></lang>
  if (isGroupDisabled.value) return;
  // <lang><zh-CN>先移除全部精确重复项，再按 next checked 只添加一次。</zh-CN><en>First removes exact duplicates, then adds exactly once by next checked.</en></lang>
  const withoutValue = selectedValues.value.filter((selectedValue) => selectedValue !== value);
  const nextValues = checked ? [...withoutValue, value] : withoutValue;
  emit('update:modelValue', nextValues); emit('change', nextValues);
}
provide(CHECKBOX_GROUP_CONTEXT, Object.freeze({ selectedValues, isGroupDisabled, changeValue }));
</script>
<style src="./u-checkbox-group.css"></style>
