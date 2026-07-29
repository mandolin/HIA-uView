<!--
@component UCheckbox
@lang zh-CN 呈现调用方拥有的布尔选项；独立模式 emit next checked，group 模式委托 group 产生新数组，不写 prop 或取得表单/业务职责。
@lang en Presents a caller-owned boolean option; independent mode emits next checked, group mode delegates to group for a new array, and it writes no prop or acquires form/business responsibility.
-->
<template><!-- @lang zh-CN 原生按钮呈现文字、非颜色方形符号和 disabled guard。 @lang en The native button presents text, non-color square symbol, and disabled guard. <lang><zh-CN>它不是 picker 或导航 control。</zh-CN><en>It is not a picker or navigation control.</en></lang> --><button :class="checkboxClasses" :disabled="isDisabled" @click="handleChange"><text class="u-checkbox__mark">{{ isChecked ? '☑' : '☐' }}</text><text>{{ label }}</text></button></template>
<script setup>
import { computed, inject } from 'vue';
import { CHECKBOX_GROUP_CONTEXT } from '../selection-context.mjs';
defineOptions({ name: 'u-checkbox' });
// <lang><zh-CN>仅接收本地 value、label、受控 checked/disabled，不接收 option 数据或规则。</zh-CN><en>Accepts only local value, label, controlled checked/disabled and no option data or rule.</en></lang>
const props = defineProps({ value: { type: String, default: '' }, label: { type: String, default: '' }, checked: { type: Boolean, default: false }, disabled: { type: Boolean, default: false } });
const emit = defineEmits(['change']);
const groupContext = inject(CHECKBOX_GROUP_CONTEXT, null);
const isChecked = computed(() => groupContext ? groupContext.selectedValues.value.includes(props.value) : props.checked);
const isDisabled = computed(() => props.disabled || Boolean(groupContext?.isGroupDisabled.value));
const checkboxClasses = computed(() => ['u-checkbox', { 'u-checkbox--checked': isChecked.value, 'u-checkbox--disabled': isDisabled.value }]);
/**
 * @lang zh-CN 在启用时报告反转后的 checked；group 存在则只委托其 new-array 计算。
 * @lang en Reports inverted checked while enabled; when grouped it delegates only new-array calculation.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleChange() {
  // <lang><zh-CN>禁用 guard 先于状态计算或 emit。</zh-CN><en>The disabled guard precedes state calculation or emit.</en></lang>
  if (isDisabled.value) return;
  const nextChecked = !isChecked.value;
  if (groupContext) groupContext.changeValue(props.value, nextChecked); else emit('change', { value: props.value, checked: nextChecked });
}
</script>
<style src="./u-checkbox.css"></style>
