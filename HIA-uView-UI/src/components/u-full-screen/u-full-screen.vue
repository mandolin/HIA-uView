<!--
@component UFullScreen
@lang zh-CN 提供调用方可见状态控制的局部 full-viewport sheet；不调用原生 fullscreen API、不创建全局 overlay 或路由返回。
@lang en Provides a local full-viewport sheet controlled by caller visibility; it calls no native fullscreen API and creates no global overlay or route back action.
-->
<template>
  <!-- @lang zh-CN 外层只在 caller visible 时出现；backdrop 与 close 均是可选意图，caller 决定后续 writeback。
  @lang en The outer layer appears only when caller visible is true; backdrop and close are optional intents and the caller decides subsequent writeback.
  <lang><zh-CN>sheet 阻止自身点击传播，避免内容交互误被解释为 backdrop 操作。</zh-CN><en>The sheet stops its own click propagation, preventing content interaction from being interpreted as a backdrop action.</en></lang> -->
  <view v-if="visible" class="u-full-screen" role="dialog" aria-modal="true" :aria-label="title || undefined" @click="handleBackdrop"><view class="u-full-screen__sheet" @click.stop><view v-if="title || closeText" class="u-full-screen__header"><text v-if="title" class="u-full-screen__title">{{ title }}</text><button v-if="closeText" class="u-full-screen__close" type="button" @click="handleClose"><text>{{ closeText }}</text></button></view><view class="u-full-screen__body"><slot /></view></view></view>
</template>

<script setup>
// <lang><zh-CN>稳定名称指向同一 caller 子树中的全视口呈现，而非平台级 fullscreen session。</zh-CN><en>The stable name denotes full-viewport presentation in one caller tree, not a platform-level fullscreen session.</en></lang>
defineOptions({ name: 'u-full-screen' });

// <lang><zh-CN>所有可读文字、可见性与 backdrop 行为由 caller 声明；空 closeText 不产生未本地化的关闭按钮。</zh-CN><en>All readable copy, visibility, and backdrop behavior are caller-declared; empty closeText produces no unlocalized close button.</en></lang>
const props = defineProps({ visible: { type: Boolean, default: false }, title: { type: String, default: '' }, closeText: { type: String, default: '' }, closeOnBackdrop: { type: Boolean, default: false } });

// <lang><zh-CN>两个事件都只报告局部用户意图；组件不改变 visible、焦点、路由或原生全屏状态。</zh-CN><en>Both events report local user intent only; the component changes no visible, focus, route, or native-fullscreen state.</en></lang>
const emit = defineEmits(['close', 'backdrop']);

/**
 * @lang zh-CN 报告背景点击；只有 caller 选择 closeOnBackdrop 时才额外报告 close，且不自行隐藏。
 * @lang en Reports a backdrop click; reports close additionally only when the caller chooses closeOnBackdrop and never hides itself.
 * @param {unknown} event <lang><zh-CN>本地 backdrop 点击事件。</zh-CN><en>Local backdrop click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleBackdrop(event) {
  // <lang><zh-CN>先保留 backdrop 语义，使 caller 能区分关闭按钮和背景操作。</zh-CN><en>Preserve backdrop semantics first so the caller can distinguish close-button and background actions.</en></lang>
  emit('backdrop', event);
  // <lang><zh-CN>受控布尔值只决定是否报告第二个意图，不承担任何 visibility writeback。</zh-CN><en>The controlled boolean decides only whether to report a second intent and owns no visibility writeback.</en></lang>
  if (props.closeOnBackdrop) emit('close', { source: 'backdrop', event });
}

/**
 * @lang zh-CN 报告明确 close control 的局部意图；文字、隐藏与后续流程仍由 caller 拥有。
 * @lang en Reports local intent from the explicit close control; copy, hiding, and follow-up remain caller-owned.
 * @param {unknown} event <lang><zh-CN>本地按钮点击事件。</zh-CN><en>Local button click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleClose(event) {
  // <lang><zh-CN>空文字时模板不创建按钮；guard 保持直接调用同样无意图。</zh-CN><en>The template creates no button for empty copy; the guard keeps direct invocation equally intent-free.</en></lang>
  if (!props.closeText.trim()) return;
  emit('close', { source: 'control', event });
}
</script>

<style src="./u-full-screen.css"></style>
