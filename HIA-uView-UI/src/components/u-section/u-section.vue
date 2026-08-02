<!--
@component USection
@lang zh-CN 提供页面区块标题、说明和右侧 slot；不推断行业字段或页面路由。
@lang en Provides section title, description, and right slot; it infers no industry field or page route.
-->
<template><view class="u-section"><view class="u-section__heading"><text v-if="props.title" class="u-section__title">{{ props.title }}</text><text v-if="props.subTitle" class="u-section__subtitle">{{ props.subTitle }}</text></view><view class="u-section__right"><slot name="right"><button v-if="props.rightText" class="u-section__action" type="button" @click="handleRightClick">{{ props.rightText }}</button></slot></view><slot /></view></template>

<script setup>
// <lang><zh-CN>使用稳定 u- 名称，保持区块呈现和局部操作意图。</zh-CN><en>Uses a stable u- name while retaining section presentation and local action intent.</en></lang>
defineOptions({ name: 'u-section' });

// <lang><zh-CN>文字由调用方声明，组件不解释领域或页面结构。</zh-CN><en>Text is caller-declared; the component interprets no domain or page structure.</en></lang>
const props = defineProps({ title: { type: String, default: '' }, subTitle: { type: String, default: '' }, rightText: { type: String, default: '' } });
const emit = defineEmits(['right-click']);

/**
 * @lang zh-CN 报告右侧按钮的局部意图。
 * @lang en Reports the local intent of the right-side button.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleRightClick() {
  emit('right-click');
}
</script>

<style src="./u-section.css"></style>
