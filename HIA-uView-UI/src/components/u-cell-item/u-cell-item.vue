<!--
@component UCellItem
@lang zh-CN 提供 uView-family `u-cell-item` 的受控信息行：调用方拥有标题、说明、值、可点击性和导航含义；组件只呈现有限箭头并 emit local click intent。
@lang en Provides a controlled uView-family `u-cell-item` information row: the caller owns title, description, value, clickability, and navigation meaning; the component presents a finite arrow and emits local click intent only.
-->
<template>
  <!-- @lang zh-CN 受控模板呈现说明如下。
  @lang en Controlled template-presentation explanation follows.
  <lang><zh-CN>根行始终呈现 caller text；可点击性只决定原生 button 语义，不创建导航目标。</zh-CN><en>The root row always presents caller text; clickability decides native button semantics only and creates no navigation destination.</en></lang> -->
  <button :class="cellClasses" type="button" :disabled="disabled || !clickable" @click="emitClick">
    <view class="u-cell-item__content"><text class="u-cell-item__title">{{ title }}</text><text v-if="label" class="u-cell-item__label">{{ label }}</text></view>
    <view class="u-cell-item__trailing"><text v-if="value" class="u-cell-item__value">{{ value }}</text><text v-if="arrow" class="u-cell-item__arrow" aria-hidden="true">›</text></view>
  </button>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称与新 migration surface 对齐；它不覆盖现有 `u-cell` 的较小契约。</zh-CN><en>The stable name aligns with the new migration surface; it does not override the smaller existing `u-cell` contract.</en></lang>
defineOptions({ name: 'u-cell-item' });

// <lang><zh-CN>调用方拥有所有文字和有限展示/交互开关；组件不接收 URL、route、data source 或业务对象。</zh-CN><en>The caller owns all text and finite presentation/interaction switches; the component accepts no URL, route, data source, or business object.</en></lang>
const props = defineProps({ title: { type: String, default: '' }, label: { type: String, default: '' }, value: { type: String, default: '' }, arrow: { type: Boolean, default: false }, clickable: { type: Boolean, default: false }, disabled: { type: Boolean, default: false } });

// <lang><zh-CN>click 是唯一公开意图；调用方决定点击是否映射为导航、展开或其他业务操作。</zh-CN><en>Click is the sole public intent; the caller decides whether it maps to navigation, expansion, or another business operation.</en></lang>
const emit = defineEmits(['click']);

// <lang><zh-CN>有限 class 只表达 caller 已声明的 clickable/disabled 外观，不拼接任意输入。</zh-CN><en>Finite classes express caller-declared clickable/disabled appearance only and concatenate no arbitrary input.</en></lang>
const cellClasses = computed(() => ['u-cell-item', { 'u-cell-item--clickable': props.clickable, 'u-cell-item--disabled': props.disabled }]);

/**
 * @lang zh-CN 报告可点击信息行的本地点击；不执行页面跳转、值写回或列表 mutation。
 * @lang en Reports a local click on a clickable information row; it performs no page navigation, value writeback, or list mutation.
 * @param {unknown} event <lang><zh-CN>平台提供的原始点击事件。</zh-CN><en>Original click event supplied by the platform.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `click`。</zh-CN><en>No return value; emits `click` when the guard passes.</en></lang>
 */
function emitClick(event) {
  // <lang><zh-CN>仅显式 clickable 且非 disabled 的行能产生意图；原生 disabled 之外的 guard 保护直接 handler 调用。</zh-CN><en>Only explicitly clickable and non-disabled rows can produce intent; the guard protects direct handler calls beyond native disabled behavior.</en></lang>
  if (!props.clickable || props.disabled) return;

  // <lang><zh-CN>保留原始事件给页面，不赋予 arrow 或 value 任何导航语义。</zh-CN><en>Preserve the original event for the page and assign no navigation meaning to arrow or value.</en></lang>
  emit('click', event);
}
</script>

<style src="./u-cell-item.css"></style>
