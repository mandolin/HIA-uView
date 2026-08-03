<!--
@component UTh
@lang zh-CN 呈现调用方提供的有限 view-based table header 文本或 slot；不排序、不筛选、不解释字段或创建数据协议。
@lang en Presents caller-provided finite view-based table-header text or slot; it neither sorts, filters, interprets a field, nor creates a data protocol.
-->
<template>
  <!-- @lang zh-CN label 与 slot 只表达 caller header 呈现；align 限制在有限 class，不承诺实际列宽或浏览器表头行为。
  @lang en Label and slot express caller header presentation only; align is constrained to finite classes and promises no actual column width or browser-header behavior.
  <lang><zh-CN>columnheader role 是辅助标记，不能替代目标平台的无障碍验证。</zh-CN><en>The columnheader role is an assistive marker and cannot replace accessibility verification on a target platform.</en></lang> -->
  <view :class="rootClasses" role="columnheader"><text v-if="label" class="u-th__label">{{ label }}</text><slot /></view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称表示静态 header cell，不表示 sortable column 或字段 schema。</zh-CN><en>The stable name denotes a static header cell, not a sortable column or field schema.</en></lang>
defineOptions({ name: 'u-th' });

// <lang><zh-CN>label 与 align 均由 caller 传入；空 label 支持 caller slot，组件没有默认业务字段文字。</zh-CN><en>Label and align are caller-provided; empty label supports a caller slot and the component has no default business-field copy.</en></lang>
const props = defineProps({ label: { type: String, default: '' }, align: { type: String, default: 'start' } });

// <lang><zh-CN>有限集合阻止任意 caller 字符串扩展 CSS 表面对齐协议。</zh-CN><en>The finite set prevents arbitrary caller strings from extending the CSS-surface alignment protocol.</en></lang>
const safeAlign = computed(() => ['start', 'center', 'end'].includes(props.align) ? props.align : 'start');

// <lang><zh-CN>根 class 只使用规范化对齐值，不包含 header 文字或领域键。</zh-CN><en>The root class uses normalized alignment only and contains no header copy or domain key.</en></lang>
const rootClasses = computed(() => ['u-th', `u-th--${safeAlign.value}`]);
</script>

<style src="./u-th.css"></style>
