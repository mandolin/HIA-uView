<!--
@component UVerificationCode
@lang zh-CN 提供调用方拥有的验证码请求状态投影；组件只显示 caller remaining/status 文字并在显式启用时报告 request，不发送验证码、不倒计时、不读写 storage、不联网，也不读取身份或平台状态。
@lang en Provides a projection of caller-owned verification-request state; the component displays caller remaining/status copy and reports request when explicitly enabled, sends no code, runs no countdown, reads/writes no storage, uses no network, and reads no identity or platform state.
-->
<template>
  <!-- @lang zh-CN 只有 caller visible 且存在可读 status、remaining 或 request action 时输出；数字与文字始终来自调用方当前状态。
  @lang en Outputs only when caller-visible and readable status, remaining, or request action exists; numbers and copy always come from current caller state.
  <lang><zh-CN>request button 需要 caller 文案与 explicit enabled，remaining 不会由组件自行递减。</zh-CN><en>The request button requires caller copy and explicit enabled; remaining is never decremented by the component.</en></lang>
  -->
  <view v-if="isRenderable" class="u-verification-code" role="group" :aria-label="safeLabel"><text v-if="safeStatusText" class="u-verification-code__status">{{ safeStatusText }}</text><text v-if="safeRemainingText" class="u-verification-code__remaining" :data-remaining="safeRemainingSeconds">{{ safeRemainingText }}</text><button v-if="canRequest" class="u-verification-code__request" type="button" :disabled="disabled" @click="emitRequest"><text>{{ safeRequestText }}</text></button></view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称保留验证码请求迁移入口；实现是 caller-state 展示而非验证码服务。</zh-CN><en>The stable name retains a verification-request migration entry; the implementation is caller-state presentation rather than a verification service.</en></lang>
defineOptions({ name: 'u-verification-code' });

// <lang><zh-CN>调用方拥有可见性、remaining 数值及其本地化文字、状态、request 标签和 enabled；组件不接收手机号、身份、endpoint、timer 或 storage key。</zh-CN><en>The caller owns visibility, remaining number and its localized copy, status, request label, and enabled; the component accepts no phone number, identity, endpoint, timer, or storage key.</en></lang>
const props = defineProps({
  // <lang><zh-CN>可见性默认关闭，避免无请求显示验证码流程表面。</zh-CN><en>Visibility defaults off, avoiding display of a verification-flow surface without a request.</en></lang>
  visible: { type: Boolean, default: false },
  // <lang><zh-CN>remaining 是 caller 提供的有限整数快照，只用于 data 属性与 request payload，不驱动计时。</zh-CN><en>Remaining is a caller-provided finite integer snapshot used only for data attribute and request payload and drives no timing.</en></lang>
  remainingSeconds: { type: Number, default: 0 },
  // <lang><zh-CN>全部用户可见文字由 caller 本地化；空值不会被组件替换为默认语言。</zh-CN><en>All user-visible copy is caller-localized; empty values are not replaced by component default language.</en></lang>
  label: { type: String, default: '' },
  statusText: { type: String, default: '' },
  remainingText: { type: String, default: '' },
  requestText: { type: String, default: '' },
  // <lang><zh-CN>requestEnabled 明确属于 caller 状态；remaining 为零或非零都不会自动改变它。</zh-CN><en>RequestEnabled explicitly belongs to caller state; zero or nonzero remaining never changes it automatically.</en></lang>
  requestEnabled: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
});

// <lang><zh-CN>唯一事件只表达 caller 已允许的本地 request intent；应用决定实际发送、倒计时和反馈。</zh-CN><en>The sole event expresses caller-permitted local request intent only; the application decides actual sending, countdown, and feedback.</en></lang>
const emit = defineEmits(['request']);

// <lang><zh-CN>remaining 收束为 0–3600 的有限整数，避免 arbitrary number 进入可观察 payload；这不是倒计时逻辑。</zh-CN><en>Remaining is constrained to a finite integer from zero to 3600, preventing arbitrary numbers from entering observable payload; this is not countdown logic.</en></lang>
const safeRemainingSeconds = computed(() => Number.isFinite(props.remainingSeconds) ? Math.round(Math.min(3600, Math.max(0, props.remainingSeconds))) : 0);

// <lang><zh-CN>用户文字只接受明确字符串，防止不匹配 prop 形成对象化文案或无标签请求 control。</zh-CN><en>User copy accepts explicit strings only, preventing mismatched props from forming objectified copy or an unlabeled request control.</en></lang>
const safeLabel = computed(() => typeof props.label === 'string' ? props.label : '');
const safeStatusText = computed(() => typeof props.statusText === 'string' ? props.statusText : '');
const safeRemainingText = computed(() => typeof props.remainingText === 'string' ? props.remainingText : '');
const safeRequestText = computed(() => typeof props.requestText === 'string' ? props.requestText : '');

// <lang><zh-CN>请求 control 同时要求调用方文字和 explicit enabled；组件不根据 remaining 推断冷却结束或发送资格。</zh-CN><en>Request control requires caller copy and explicit enabled together; the component does not infer cooldown completion or sending eligibility from remaining.</en></lang>
const canRequest = computed(() => props.requestEnabled && safeRequestText.value.trim().length > 0);

// <lang><zh-CN>空状态不创建验证码容器；可见文字或明确可请求 action 至少其一才可输出。</zh-CN><en>An empty state creates no verification container; at least visible copy or an explicit requestable action is required for output.</en></lang>
const isRenderable = computed(() => props.visible && (safeStatusText.value.trim().length > 0 || safeRemainingText.value.trim().length > 0 || canRequest.value));

/**
 * @lang zh-CN 报告 caller 已启用的 request intent 与当前 remaining snapshot；不执行网络、timer、storage 或身份判断。
 * @lang en Reports caller-enabled request intent and current remaining snapshot; it executes no network, timer, storage, or identity judgment.
 * @param {unknown} event <lang><zh-CN>原始点击事件。</zh-CN><en>Original click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `request`。</zh-CN><en>No return value; emits `request` when the guard passes.</en></lang>
 */
function emitRequest(event) {
  // <lang><zh-CN>guard 保持 caller visible、enabled 与可读 action 标签边界，直接调用也不能触发隐式发送。</zh-CN><en>The guard retains caller-visible, enabled, and readable-action-label boundaries; direct calls cannot trigger implicit sending either.</en></lang>
  if (!isRenderable.value || props.disabled || !canRequest.value) return;
  emit('request', { remainingSeconds: safeRemainingSeconds.value, event });
}
</script>

<style src="./u-verification-code.css"></style>
