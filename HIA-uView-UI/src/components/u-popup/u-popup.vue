<!--
@component UPopup
@lang zh-CN 提供受控局部浮层、slot 和 close intent；不执行自动关闭、计时、焦点、滚动、路由或全局 service。
@lang en Provides a controlled local overlay, slot, and close intent; it performs no automatic close, timer, focus, scrolling, routing, or global service.
-->
<template>
  <view v-if="visible" :class="rootClasses">
    <view class="u-popup__mask" @click="handleMaskClick" />
    <view class="u-popup__panel">
      <view v-if="title || closeText" class="u-popup__header">
        <text v-if="title" class="u-popup__title">{{ title }}</text>
        <button v-if="closeText" class="u-popup__close" type="button" @click="handleClose">{{ closeText }}</button>
      </view>
      <view class="u-popup__content"><slot /></view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>浮层名称保持 u-popup 迁移熟悉度，但只呈现调用方拥有的 visible 与 slot。</zh-CN><en>The popup name preserves u-popup migration familiarity while presenting caller-owned visible state and slot only.</en></lang>
defineOptions({ name: 'u-popup' });

const props = defineProps({
  visible: { type: Boolean, default: false },
  placement: { type: String, default: 'bottom' },
  title: { type: String, default: '' },
  closeText: { type: String, default: '' },
  maskClosable: { type: Boolean, default: false }
});

// <lang><zh-CN>close 只报告本地意图；组件不写回 visible，也不改变页面或焦点。</zh-CN><en>Close reports local intent only; the component does not write visible or change page or focus state.</en></lang>
const emit = defineEmits(['close']);
const rootClasses = computed(() => {
  const placement = ['top', 'bottom', 'left', 'right', 'center'].includes(props.placement) ? props.placement : 'bottom';
  return ['u-popup', `u-popup--${placement}`];
});

/**
 * @lang zh-CN 仅在 visible 且调用方明确允许 maskClosable 时报告遮罩关闭意图。
 * @lang en Reports mask-close intent only while visible and when the caller explicitly enables maskClosable.
 * @param {unknown} event <lang><zh-CN>遮罩点击事件。</zh-CN><en>Mask click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleMaskClick(event) {
  if (!props.visible || !props.maskClosable) return;
  emit('close', event);
}

/**
 * @lang zh-CN 报告显式 close control 的本地意图；不自动隐藏浮层。
 * @lang en Reports local intent from the explicit close control without hiding the overlay.
 * @param {unknown} event <lang><zh-CN>关闭按钮事件。</zh-CN><en>Close-button event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleClose(event) {
  if (!props.visible || !props.closeText) return;
  emit('close', event);
}
</script>

<style src="./u-popup.css"></style>
