<!--
@component UCellGroup
@lang zh-CN 提供信息行的局部容器和标题；不注册 cell、不拥有表单或提交生命周期。
@lang en Provides a local information-row container and title; it registers no cells and owns no form or submission lifecycle.
-->
<template><view class="u-cell-group" :class="{ 'u-cell-group--bordered': props.bordered }"><text v-if="props.title" class="u-cell-group__title">{{ props.title }}</text><slot /></view></template>

<script setup>
// <lang><zh-CN>保持 u- 命名，分组只负责结构呈现。</zh-CN><en>Retains the u- naming while the group remains structural presentation only.</en></lang>
defineOptions({ name: 'u-cell-group' });

// <lang><zh-CN>标题和边界是调用方声明的局部输入。</zh-CN><en>Title and boundary are caller-declared local inputs.</en></lang>
const props = defineProps({ title: { type: String, default: '' }, bordered: { type: Boolean, default: true } });
</script>

<style src="./u-cell-group.css"></style>
