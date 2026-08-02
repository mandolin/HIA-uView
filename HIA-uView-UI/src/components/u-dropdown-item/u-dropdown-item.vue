<!--
@component UDropdownItem
@lang zh-CN 呈现下拉项并报告局部选择意图；不执行命令、路由或删除。
@lang en Presents a dropdown item and reports local selection intent; it executes no command, route, or deletion.
-->
<template><button class="u-dropdown-item" :class="{ 'u-dropdown-item--selected': isSelected, 'u-dropdown-item--disabled': props.disabled || parentDisabled }" type="button" role="option" :aria-selected="isSelected" :disabled="props.disabled || parentDisabled" @click="handleClick"><slot>{{ props.label }}</slot></button></template>

<script setup>
import { computed, inject } from 'vue';
import { DROPDOWN_CONTEXT } from '../dropdown-context.mjs';

// <lang><zh-CN>保留 u- 名称，子项只承担选项呈现。</zh-CN><en>Retains the u- name while the item remains presentation-only.</en></lang>
defineOptions({ name: 'u-dropdown-item' });

// <lang><zh-CN>选项值和文字由调用方声明，不读取任何外部集合。</zh-CN><en>Option value and label are caller-declared and read no external collection.</en></lang>
const props = defineProps({ value: { type: [String, Number], default: '' }, label: { type: String, default: '' }, disabled: { type: Boolean, default: false } });
const emit = defineEmits(['select']);
const context = inject(DROPDOWN_CONTEXT, null);
const parentDisabled = computed(() => Boolean(context?.disabled?.value));
const isSelected = computed(() => context?.activeValue?.value === props.value);

/**
 * @lang zh-CN 优先交给父级 context，否则报告独立 select 意图。
 * @lang en Delegates to parent context when available; otherwise reports independent select intent.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleClick() {
  if (props.disabled || parentDisabled.value) return;
  if (context) context.selectValue(props.value);
  emit('select', props.value);
}
</script>

<style src="./u-dropdown-item.css"></style>
