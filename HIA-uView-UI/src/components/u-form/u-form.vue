<!--
@component UForm
@lang zh-CN 提供表单区域和显式提交/重置意图；组件不注册字段、不运行规则、不序列化模型，也不连接后端。
@lang en Provides form grouping and explicit submit/reset intent; the component registers no fields, runs no rules, serializes no model, and connects to no backend.
-->
<template>
  <view :class="rootClasses">
    <slot />
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>模板名保持 `u-form` 迁移路径；该组件没有父子注册或 validator 依赖。</zh-CN><en>The template name retains the `u-form` migration path; the component has no parent-child registration or validator dependency.</en></lang>
defineOptions({ name: 'u-form' });

// <lang><zh-CN>表单只有显示布局属性；禁止传入任意规则、模型或异步 callback。</zh-CN><en>The form accepts display-layout properties only; arbitrary rules, models, and asynchronous callbacks are prohibited.</en></lang>
const props = defineProps({
  disabled: { type: Boolean, default: false },
  labelPosition: { type: String, default: 'top' }
});

// <lang><zh-CN>事件是调用方可选的 intent；组件不会从内部按钮或规则自动触发。</zh-CN><en>Events are optional caller intent; the component triggers none from internal buttons or rules.</en></lang>
const emit = defineEmits(['submit', 'reset']);

// <lang><zh-CN>限制标签位置到稳定集合，未知输入回退到 top 而不生成新的布局语义。</zh-CN><en>Restricts label position to a stable set, falling back to top without creating new layout semantics.</en></lang>
const rootClasses = computed(() => {
  // <lang><zh-CN>有限值表避免把任意字符串作为 CSS class 或配置脚本执行。</zh-CN><en>A finite-value set prevents arbitrary strings from becoming CSS classes or configuration scripts.</en></lang>
  const position = ['top', 'left'].includes(props.labelPosition) ? props.labelPosition : 'top';
  return ['u-form', `u-form--label-${position}`, { 'u-form--disabled': props.disabled }];
});

/**
 * @lang zh-CN 由调用方通过模板 ref 显式请求 submit intent；组件不验证或提交任何模型。
 * @lang en Lets the caller explicitly request submit intent through a template ref; the component validates or submits no model.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function requestSubmit() {
  // <lang><zh-CN>disabled 区域不发出提交意图，避免把视觉禁用绕过为流程状态。</zh-CN><en>A disabled region emits no submit intent so visual disablement cannot be bypassed into flow state.</en></lang>
  if (props.disabled) {
    return;
  }
  emit('submit');
}

/**
 * @lang zh-CN 由调用方显式请求 reset intent；组件不保存原始模型或恢复字段值。
 * @lang en Lets the caller explicitly request reset intent; the component stores no original model or restores field values.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function requestReset() {
  // <lang><zh-CN>disabled 区域保持零 reset 事件，恢复逻辑由调用方决定。</zh-CN><en>A disabled region retains zero reset events; the caller decides restoration logic.</en></lang>
  if (props.disabled) {
    return;
  }
  emit('reset');
}

// <lang><zh-CN>只暴露两个显式 intent 方法；不暴露 model、validator、字段 registry 或平台对象。</zh-CN><en>Exposes only two explicit intent methods and no model, validator, field registry, or platform object.</en></lang>
defineExpose({ requestSubmit, requestReset });
</script>

<style src="./u-form.css"></style>
