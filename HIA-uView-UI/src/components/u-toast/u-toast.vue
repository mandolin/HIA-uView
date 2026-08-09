<!--
@component UToast
@lang zh-CN 提供受控局部反馈文字、有限 tone 与 close intent；不拥有 timer、队列、全局 service、请求、回调或路由。
@lang en Provides controlled local feedback copy, finite tone, and close intent; it owns no timer, queue, global service, request, callback, or route.
-->
<template>
  <view v-if="isVisible" :class="rootClasses" role="status">
    <!--
    @lang zh-CN loading 只组合现有受控 ULoading 的静态视觉 indicator。
    @lang en Loading composes only the existing controlled ULoading static visual indicator.
    <lang><zh-CN>它不创建 timer、队列、全局 service 或任何异步任务所有权。</zh-CN><en>It creates no timer, queue, global service, or ownership of any asynchronous task.</en></lang>
    -->
    <ULoading v-if="loading" :visible="true" size="sm" tone="neutral" />
    <text class="u-toast__message">{{ message }}</text>
    <button v-if="closeText" class="u-toast__close" type="button" @click="handleClose">{{ closeText }}</button>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import ULoading from '../u-loading/u-loading.vue';

// <lang><zh-CN>toast 保留熟悉名称但收紧为 caller-owned local feedback，不实现服务化 toast。</zh-CN><en>Toast retains a familiar name but is narrowed to caller-owned local feedback with no service-based toast.</en></lang>
defineOptions({ name: 'u-toast' });

// <lang><zh-CN>所有输入均由调用方拥有；toast 不接受回调、计时、队列、任务、请求或页面级 service 配置。</zh-CN><en>All inputs are caller-owned; toast accepts no callback, timing, queue, task, request, or page-level service configuration.</en></lang>
const props = defineProps({
  // <lang><zh-CN>visible 仅决定局部反馈是否存在；组件绝不自动写回它。</zh-CN><en>Visible only decides whether local feedback exists; the component never writes it back automatically.</en></lang>
  visible: { type: Boolean, default: false },
  // <lang><zh-CN>message 是调用方可见文字；空值不产生无内容 status。</zh-CN><en>Message is caller-visible copy; an empty value produces no contentless status.</en></lang>
  message: { type: String, default: '' },
  // <lang><zh-CN>loading 只显示本地静态 indicator，既不启动任务也不证明任务正在运行。</zh-CN><en>Loading shows only a local static indicator; it starts no task and proves no task is running.</en></lang>
  loading: { type: Boolean, default: false },
  // <lang><zh-CN>tone 限于有限反馈 token 族。</zh-CN><en>Tone is limited to a finite feedback token family.</en></lang>
  tone: { type: String, default: 'info' },
  // <lang><zh-CN>closeText 由调用方提供；空值不生成未标记的关闭 control。</zh-CN><en>CloseText is caller-provided; an empty value generates no unlabeled close control.</en></lang>
  closeText: { type: String, default: '' }
});

// <lang><zh-CN>close 只报告调用方可处理的本地关闭意图，不关闭 toast、不执行回调或清除任何队列。</zh-CN><en>Close reports only caller-handleable local close intent and does not close toast, execute a callback, or clear any queue.</en></lang>
const emit = defineEmits(['close']);

// <lang><zh-CN>root class 只由受限 tone 派生，避免任意字符串成为 CSS surface。</zh-CN><en>Root classes derive only from finite tone, preventing arbitrary strings from becoming a CSS surface.</en></lang>
const rootClasses = computed(() => {
  // <lang><zh-CN>未知 tone 安全回退 info，不生成额外反馈含义。</zh-CN><en>An unknown tone safely falls back to info and creates no additional feedback meaning.</en></lang>
  const tone = ['info', 'success', 'warning', 'error'].includes(props.tone) ? props.tone : 'info';
  return ['u-toast', `u-toast--${tone}`];
});

// <lang><zh-CN>只有调用方同时提供 visible 和非空 message 时存在局部反馈表面。</zh-CN><en>A local feedback surface exists only when the caller provides both visible and non-empty message.</en></lang>
const isVisible = computed(() => props.visible && props.message.length > 0);

/**
 * @lang zh-CN 报告显式 close intent；组件不改变 visible，也不启动计时器。
 * @lang en Reports explicit close intent; the component does not change visible or start a timer.
 * @param {unknown} event <lang><zh-CN>关闭按钮事件。</zh-CN><en>Close-button event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleClose(event) {
  // <lang><zh-CN>缺失可见 toast 或关闭文字时保持零事件，避免直接 handler 调用生成伪关闭。</zh-CN><en>When visible toast or close copy is absent, retains zero events so a direct handler call cannot generate a false close.</en></lang>
  if (!isVisible.value || !props.closeText) {
    return;
  }

  // <lang><zh-CN>原样交还本地事件；调用方决定 visible 的下一值与任何后续流程。</zh-CN><en>Returns the local event unchanged; the caller decides the next visible value and any follow-up flow.</en></lang>
  emit('close', event);
}
</script>

<style src="./u-toast.css"></style>
