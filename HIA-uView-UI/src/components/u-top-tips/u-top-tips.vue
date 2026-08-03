<!--
@component UTopTips
@lang zh-CN 提供 caller-controlled 的顶部反馈提示；调用方拥有可见性、文字、tone 和关闭决定，组件不计时、自动消失、推送、排队或解释结果。
@lang en Provides caller-controlled top feedback tips; the caller owns visibility, text, tone, and close decision, while the component does not time, auto-dismiss, push, queue, or interpret outcomes.
-->
<template>
  <!-- @lang zh-CN 受控模板呈现说明如下。
  @lang en Controlled template-presentation explanation follows.
  <lang><zh-CN>提示条在可见且有文字时呈现；有限 layer 与 CSS 定位只表达本地覆盖面，不代表全局 toast 服务。</zh-CN><en>The tips strip renders when visible and textual; finite layer and CSS positioning express a local overlay surface only and do not represent a global toast service.</en></lang> -->
  <view v-if="isVisible" :class="tipClasses" role="status" aria-live="polite"><text class="u-top-tips__message">{{ message }}</text><button v-if="hasClose" class="u-top-tips__close" type="button" @click="emitClose"><text>{{ closeText }}</text></button></view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称服务 local feedback surface；组件不创建 timer 或 global queue。</zh-CN><en>The stable name serves a local feedback surface; the component creates no timer or global queue.</en></lang>
defineOptions({ name: 'u-top-tips' });

// <lang><zh-CN>有限 tone 限制 class/token；它不推断 caller message 的业务类别。</zh-CN><en>Finite tones constrain class/token; they infer no business category from caller message.</en></lang>
const supportedTones = Object.freeze(['info', 'success', 'warning', 'error']);

// <lang><zh-CN>调用方提供全部用户可见文本；空 closeText 不生成默认本地化关闭入口。</zh-CN><en>The caller supplies all user-visible text; empty closeText generates no default localized close entry.</en></lang>
const props = defineProps({ visible: { type: Boolean, default: false }, message: { type: String, default: '' }, tone: { type: String, default: 'info' }, closeText: { type: String, default: '' } });

// <lang><zh-CN>close 只表达用户意图，应用拥有 visible writeback 和后续反馈逻辑。</zh-CN><en>Close expresses user intent only; the application owns visible writeback and subsequent feedback logic.</en></lang>
const emit = defineEmits(['close']);

// <lang><zh-CN>未知 tone 回退 info，避免任意字符串成为 class。</zh-CN><en>An unknown tone falls back to info, preventing arbitrary strings from becoming a class.</en></lang>
const safeTone = computed(() => supportedTones.includes(props.tone) ? props.tone : 'info');

// <lang><zh-CN>提示的可见性同时要求 caller visible 与非空可读 message。</zh-CN><en>Tips visibility requires both caller visibility and non-empty readable message.</en></lang>
const isVisible = computed(() => props.visible && props.message.trim().length > 0);

// <lang><zh-CN>根 class 仅由固定命名空间和规范化 tone 组成。</zh-CN><en>Root classes consist only of the fixed namespace and normalized tone.</en></lang>
const tipClasses = computed(() => ['u-top-tips', `u-top-tips--${safeTone.value}`]);

// <lang><zh-CN>close control 仅在 caller 明确提供可见文字时出现。</zh-CN><en>The close control appears only when the caller explicitly provides readable text.</en></lang>
const hasClose = computed(() => props.closeText.trim().length > 0);

/**
 * @lang zh-CN 转发 close intent；不自动隐藏、计时或把 message 记录到任何全局状态。
 * @lang en Forwards close intent; it neither auto-hides, times, nor records message in any global state.
 * @param {unknown} event <lang><zh-CN>原始平台点击事件。</zh-CN><en>Original platform click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `close`。</zh-CN><en>No return value; emits `close` when the guard passes.</en></lang>
 */
function emitClose(event) {
  // <lang><zh-CN>guard 保持隐藏/无标签状态的直接调用无事件。</zh-CN><en>The guard keeps direct calls while hidden or label-less event-free.</en></lang>
  if (!isVisible.value || !hasClose.value) return;

  // <lang><zh-CN>把 intent 原样交回 caller；UI 不改变反馈队列。</zh-CN><en>Return intent unchanged to the caller; UI changes no feedback queue.</en></lang>
  emit('close', event);
}
</script>

<style src="./u-top-tips.css"></style>
