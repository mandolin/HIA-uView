<!--
@component UTd
@lang zh-CN 呈现调用方提供的有限 view-based table cell 文本或 slot；不格式化领域数据、不推断类型、不管理编辑或写回。
@lang en Presents caller-provided finite view-based table-cell text or slot; it neither formats domain data, infers a type, nor manages editing or writeback.
-->
<template>
  <!-- @lang zh-CN text 与 slot 仅是 caller cell 呈现；align 只控制有限局部 class，不读取表格、行或列 context。
  @lang en Text and slot are caller cell presentation only; align controls finite local classes only and reads no table, row, or column context.
  <lang><zh-CN>cell role 是辅助标记，不承诺小程序或读屏形成完整表格可访问性树。</zh-CN><en>The cell role is an assistive marker and promises no complete table accessibility tree in Mini Program or screen readers.</en></lang> -->
  <view :class="rootClasses" role="cell"><text v-if="text" class="u-td__text">{{ text }}</text><slot /></view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称表示静态 table cell，不成为领域字段格式化器或内联编辑器。</zh-CN><en>The stable name denotes a static table cell and does not become a domain-field formatter or inline editor.</en></lang>
defineOptions({ name: 'u-td' });

// <lang><zh-CN>text 与 align 来自 caller；空 text 允许 slot，组件不引入默认数值、日期或状态格式。</zh-CN><en>Text and align come from the caller; empty text permits a slot and the component introduces no default number, date, or status format.</en></lang>
const props = defineProps({ text: { type: String, default: '' }, align: { type: String, default: 'start' } });

// <lang><zh-CN>有限集合约束局部对齐，未知输入确定性回退 start。</zh-CN><en>The finite set constrains local alignment, and unknown input deterministically falls back to start.</en></lang>
const safeAlign = computed(() => ['start', 'center', 'end'].includes(props.align) ? props.align : 'start');

// <lang><zh-CN>根 class 只携带规范化对齐，不把 caller 文本插入 CSS 命名空间。</zh-CN><en>The root class carries normalized alignment only and inserts no caller text into the CSS namespace.</en></lang>
const rootClasses = computed(() => ['u-td', `u-td--${safeAlign.value}`]);
</script>

<style src="./u-td.css"></style>
