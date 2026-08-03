<!--
@component UBackTop
@lang zh-CN 提供可见、带文字的“回到顶部”意图 control；调用方拥有何时显示、实际滚动和页面位置，组件不监听滚动也不调用平台 scroll-to。
@lang en Provides a visible, labeled “back to top” intent control; the caller owns when to show it, actual scrolling, and page position, while the component observes no scroll and calls no platform scroll-to API.
-->
<template>
  <!-- @lang zh-CN 受控模板呈现说明如下。
  @lang en Controlled template-presentation explanation follows.
  <lang><zh-CN>缺少 label 时不渲染 control，避免用图标、默认语言或无标签按钮暗示回顶行为。</zh-CN><en>Without a label the control does not render, avoiding an icon, default language, or unlabeled button that implies back-to-top behavior.</en></lang> -->
  <button v-if="isRenderable" class="u-back-top" type="button" :disabled="disabled" @click="emitBackTop"><text>{{ label }}</text></button>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称保留 uView-family 迁移入口；其实际滚动语义仍由应用显式接管。</zh-CN><en>The stable name retains a uView-family migration entry; the application explicitly owns actual scrolling semantics.</en></lang>
defineOptions({ name: 'u-back-top' });

// <lang><zh-CN>调用方拥有可见性、可读 label 和禁用状态；组件不接受 scroll container 或偏移量。</zh-CN><en>The caller owns visibility, readable label, and disabled state; the component accepts no scroll container or offset.</en></lang>
const props = defineProps({ visible: { type: Boolean, default: false }, label: { type: String, default: '' }, disabled: { type: Boolean, default: false } });

// <lang><zh-CN>唯一事件报告本地 click intent；应用决定是否、如何执行滚动。</zh-CN><en>The sole event reports local click intent; the application decides whether and how to perform scrolling.</en></lang>
const emit = defineEmits(['back-top']);

// <lang><zh-CN>可渲染性同时要求 caller 显示和有可见文字，确保触控动作不依赖猜测。</zh-CN><en>Renderability requires both caller visibility and readable text, ensuring the touch action relies on no guesswork.</en></lang>
const isRenderable = computed(() => props.visible && props.label.trim().length > 0);

/**
 * @lang zh-CN 转发受控 click 意图；本函数不测量滚动位置、不修改 visible，也不执行滚动副作用。
 * @lang en Forwards controlled click intent; this function measures no scroll position, writes no visible state, and performs no scrolling side effect.
 * @param {unknown} event <lang><zh-CN>原始平台点击事件。</zh-CN><en>Original platform click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `back-top`。</zh-CN><en>No return value; emits `back-top` when the guard passes.</en></lang>
 */
function emitBackTop(event) {
  // <lang><zh-CN>禁止隐藏、缺 label 或 disabled control 通过直接 handler 调用产生动作。</zh-CN><en>Prevent hidden, label-less, or disabled controls from producing action through direct handler calls.</en></lang>
  if (!isRenderable.value || props.disabled) return;

  // <lang><zh-CN>保留事件给调用方的 page/scroll adapter；UI 不拥有目标容器。</zh-CN><en>Preserve the event for the caller page/scroll adapter; UI owns no target container.</en></lang>
  emit('back-top', event);
}
</script>

<style src="./u-back-top.css"></style>
