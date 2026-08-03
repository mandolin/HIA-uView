<!--
@component ULoadingPopup
@lang zh-CN 将受控 `u-mask` 与 `u-loading` 组合为局部 loading popup；调用方拥有 visible、文字和遮罩关闭决定，组件不创建全局服务、异步任务或焦点/滚动策略。
@lang en Composes controlled `u-mask` and `u-loading` as a local loading popup; the caller owns visible, text, and mask-close decision, while the component creates no global service, async task, or focus/scroll policy.
-->
<template>
  <!-- @lang zh-CN 受控模板呈现说明如下。
  @lang en Controlled template-presentation explanation follows.
  <lang><zh-CN>根只在 caller visible 时输出 mask 与 panel；mask 的 click 只转发为 close intent，不写回 visible。</zh-CN><en>The root outputs mask and panel only when caller-visible; mask click forwards close intent only and writes no visible state.</en></lang> -->
  <view v-if="visible" class="u-loading-popup"><UMask :visible="true" :opacity="maskOpacity" :layer="layer" :clickable="maskClosable" @click="emitClose" /><view class="u-loading-popup__panel"><ULoading :visible="true" :label="label" :size="size" /></view></view>
</template>

<script setup>
import ULoading from '../u-loading/u-loading.vue';
import UMask from '../u-mask/u-mask.vue';

// <lang><zh-CN>稳定名称对应受控局部组合；它不注册/调用任何 loading singleton。</zh-CN><en>The stable name corresponds to controlled local composition; it registers and calls no loading singleton.</en></lang>
defineOptions({ name: 'u-loading-popup' });

// <lang><zh-CN>调用方拥有 visible、文字、尺寸、遮罩参数；默认不可通过 mask 关闭。</zh-CN><en>The caller owns visible, text, size, and mask parameters; the mask is not closable by default.</en></lang>
const props = defineProps({ visible: { type: Boolean, default: false }, label: { type: String, default: '' }, size: { type: String, default: 'md' }, maskOpacity: { type: Number, default: 0.56 }, layer: { type: Number, default: 1100 }, maskClosable: { type: Boolean, default: false } });

// <lang><zh-CN>close 只表达 caller 允许的遮罩意图；调用方决定是否隐藏 popup。</zh-CN><en>Close expresses only caller-permitted mask intent; the caller decides whether to hide the popup.</en></lang>
const emit = defineEmits(['close']);

/**
 * @lang zh-CN 将已受 UMask guard 约束的点击转发为 close intent；不修改 visible 或启动取消任务。
 * @lang en Forwards a click already constrained by UMask guard as close intent; it changes no visible state and starts no cancellation task.
 * @param {unknown} event <lang><zh-CN>来自 UMask 的原始点击事件。</zh-CN><en>Original click event from UMask.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；emit `close`。</zh-CN><en>No return value; emits `close`.</en></lang>
 */
function emitClose(event) {
  // <lang><zh-CN>重复检查 caller 选择，保证将来直接调用 handler 也不会绕过 popup boundary。</zh-CN><en>Recheck caller selection so future direct handler calls cannot bypass the popup boundary.</en></lang>
  if (!props.visible || !props.maskClosable) return;

  // <lang><zh-CN>事件交给调用方；组件不把关闭误述为任务成功、失败或取消。</zh-CN><en>Hand the event to the caller; the component does not misstate close as task success, failure, or cancellation.</en></lang>
  emit('close', event);
}
</script>

<style src="./u-loading-popup.css"></style>
