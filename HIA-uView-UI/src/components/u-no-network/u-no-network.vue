<!--
@component UNoNetwork
@lang zh-CN 提供 caller-owned 的无网络说明与可选 retry intent；组件不检测网络、不读取设备状态、不使用上游图片资产，也不尝试连接或恢复服务。
@lang en Provides caller-owned no-network explanation and optional retry intent; the component detects no network, reads no device state, uses no upstream image asset, and does not attempt connection or service recovery.
-->
<template>
  <!-- @lang zh-CN 受控模板呈现说明如下。
  @lang en Controlled template-presentation explanation follows.
  <lang><zh-CN>空 title/description 也可作为 caller 选择的紧凑状态容器，但 retry 必须有可见文字才出现。</zh-CN><en>Empty title/description may still form a compact caller-selected state container, but retry appears only with readable text.</en></lang> -->
  <view v-if="visible" class="u-no-network" role="status" aria-live="polite"><text class="u-no-network__marker" aria-hidden="true">·</text><view class="u-no-network__content"><text v-if="title" class="u-no-network__title">{{ title }}</text><text v-if="description" class="u-no-network__description">{{ description }}</text></view><button v-if="hasRetry" class="u-no-network__retry" type="button" @click="emitRetry"><text>{{ retryText }}</text></button></view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称为 presentation-only network-state surface；它不安装平台网络 listener。</zh-CN><en>The stable name is a presentation-only network-state surface; it installs no platform network listener.</en></lang>
defineOptions({ name: 'u-no-network' });

// <lang><zh-CN>调用方拥有完整的状态文案、可见性与可选 retry 标签；组件不生成连接诊断默认文案。</zh-CN><en>The caller owns complete state copy, visibility, and optional retry label; the component generates no default connectivity diagnostic copy.</en></lang>
const props = defineProps({ visible: { type: Boolean, default: false }, title: { type: String, default: '' }, description: { type: String, default: '' }, retryText: { type: String, default: '' } });

// <lang><zh-CN>retry 只报告用户意图；调用方选择重试什么和是否开始任何网络工作。</zh-CN><en>Retry reports user intent only; the caller chooses what to retry and whether to start any network work.</en></lang>
const emit = defineEmits(['retry']);

// <lang><zh-CN>可重试 control 的资格要求文字，避免状态面板出现无法阅读的图形入口。</zh-CN><en>Eligibility of the retry control requires text, preventing a state panel from displaying an unreadable graphical entry.</en></lang>
const hasRetry = computed(() => props.retryText.trim().length > 0);

/**
 * @lang zh-CN 转发 caller-declared retry intent；不读取网络、不计时、不改变 visible 或状态文案。
 * @lang en Forwards caller-declared retry intent; it reads no network, starts no timer, and changes neither visible nor state copy.
 * @param {unknown} event <lang><zh-CN>原始平台点击事件。</zh-CN><en>Original platform click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `retry`。</zh-CN><en>No return value; emits `retry` when the guard passes.</en></lang>
 */
function emitRetry(event) {
  // <lang><zh-CN>guard 防止隐藏或无文字状态通过直接调用产生伪 retry 入口。</zh-CN><en>The guard prevents a hidden or label-less state from producing a false retry entry through direct calls.</en></lang>
  if (!props.visible || !hasRetry.value) return;

  // <lang><zh-CN>事件回到应用，它可以选择 local JSON、remote adapter 或不做任何操作。</zh-CN><en>The event returns to the application, which may choose local JSON, a remote adapter, or no action.</en></lang>
  emit('retry', event);
}
</script>

<style src="./u-no-network.css"></style>
