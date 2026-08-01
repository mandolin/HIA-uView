<!--
@component UToast
@lang zh-CN 提供受控局部反馈文字、有限 tone 与 close intent；不拥有 timer、队列、全局 service、请求、回调或路由。
@lang en Provides controlled local feedback copy, finite tone, and close intent; it owns no timer, queue, global service, request, callback, or route.
-->
<template>
  <view v-if="isVisible" :class="rootClasses" role="status">
    <text class="u-toast__message">{{ message }}</text>
    <button v-if="closeText" class="u-toast__close" type="button" @click="handleClose">{{ closeText }}</button>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>toast 保留熟悉名称但收紧为 caller-owned local feedback，不实现服务化 toast。</zh-CN><en>Toast retains a familiar name but is narrowed to caller-owned local feedback with no service-based toast.</en></lang>
defineOptions({ name: 'u-toast' });

const props = defineProps({
  visible: { type: Boolean, default: false },
  message: { type: String, default: '' },
  tone: { type: String, default: 'info' },
  closeText: { type: String, default: '' }
});

const emit = defineEmits(['close']);
const rootClasses = computed(() => {
  const tone = ['info', 'success', 'warning', 'error'].includes(props.tone) ? props.tone : 'info';
  return ['u-toast', `u-toast--${tone}`];
});
const isVisible = computed(() => props.visible && props.message.length > 0);

/**
 * @lang zh-CN 报告显式 close intent；组件不改变 visible，也不启动计时器。
 * @lang en Reports explicit close intent; the component does not change visible or start a timer.
 * @param {unknown} event <lang><zh-CN>关闭按钮事件。</zh-CN><en>Close-button event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleClose(event) {
  if (!isVisible.value || !props.closeText) return;
  emit('close', event);
}
</script>

<style src="./u-toast.css"></style>
