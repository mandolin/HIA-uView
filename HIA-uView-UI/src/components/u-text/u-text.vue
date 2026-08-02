<!--
@component UText
@lang zh-CN 提供有限 tone、尺寸和行数的文本呈现；不解析 HTML 或富文本。
@lang en Provides finite tone, size, and line-count text presentation; it does not parse HTML or rich text.
-->
<template><text class="u-text" :class="`u-text--${safeType} u-text--${safeSize}`" :style="textStyle"><slot>{{ props.text }}</slot></text></template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>保持 u- 名称，文本语义由调用方控制。</zh-CN><en>Retains the u- name while text semantics remain caller-controlled.</en></lang>
defineOptions({ name: 'u-text' });

// <lang><zh-CN>type/size 是有限视觉 token，lines 只影响 CSS 截断，不读取内容源。</zh-CN><en>Type/size are finite visual tokens; lines affects CSS truncation only and reads no content source.</en></lang>
const props = defineProps({ text: { type: String, default: '' }, type: { type: String, default: 'primary' }, size: { type: String, default: 'md' }, lines: { type: Number, default: 0 }, ellipsis: { type: Boolean, default: false } });
const types = Object.freeze(['primary', 'secondary', 'success', 'warning', 'danger']);
const sizes = Object.freeze(['sm', 'md', 'lg']);
const safeType = computed(() => types.includes(props.type) ? props.type : 'primary');
const safeSize = computed(() => sizes.includes(props.size) ? props.size : 'md');
const safeLines = computed(() => Number.isFinite(props.lines) ? Math.min(6, Math.max(0, Math.floor(props.lines))) : 0);
const textStyle = computed(() => ({ '--u-text-lines': safeLines.value || 'none' }));
</script>

<style src="./u-text.css"></style>
