<!--
@component UDropdown
@lang zh-CN 提供受控的局部下拉选择 context；不拥有页面浮层、路由或请求。
@lang en Provides controlled local dropdown-selection context; it owns no page popup, routing, or requests.
-->
<template><view class="u-dropdown" :class="{ 'u-dropdown--disabled': props.disabled }"><slot /></view></template>

<script setup>
import { computed, provide } from 'vue';
import { DROPDOWN_CONTEXT } from '../dropdown-context.mjs';

// <lang><zh-CN>保持 u- 命名，降低从相关 uView 下拉组件迁移的障碍。</zh-CN><en>Retains the u- name to reduce migration friction from related uView dropdown components.</en></lang>
defineOptions({ name: 'u-dropdown' });

// <lang><zh-CN>父级只维护一个受控值和禁用意图，不注册全局选项。</zh-CN><en>The parent maintains one controlled value and disabled intent only and registers no global options.</en></lang>
const props = defineProps({ modelValue: { type: [String, Number], default: '' }, disabled: { type: Boolean, default: false } });
const emit = defineEmits(['update:modelValue', 'change']);
const activeValue = computed(() => props.modelValue);

/**
 * @lang zh-CN 接收子项选择并向调用方报告，不执行导航或持久化。
 * @lang en Receives child selection and reports it to the caller without navigation or persistence.
 * @param {string|number} value <lang><zh-CN>选项值。</zh-CN><en>Option value.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function selectValue(value) {
  if (props.disabled) return;
  emit('update:modelValue', value);
  emit('change', value);
}

// <lang><zh-CN>context 只暴露只读值和局部选择函数。</zh-CN><en>Context exposes only the read-only value and local selection function.</en></lang>
provide(DROPDOWN_CONTEXT, Object.freeze({ activeValue, disabled: computed(() => props.disabled), selectValue }));
</script>

<style src="./u-dropdown.css"></style>
