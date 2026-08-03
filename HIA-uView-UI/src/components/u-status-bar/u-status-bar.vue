<!--
@component UStatusBar
@lang zh-CN 提供调用方指定高度的受控状态栏占位结构；它不读取设备状态栏、系统信息、安全区或原生窗口配置。
@lang en Provides a controlled status-bar spacer with caller-specified height; it reads no device status bar, system information, safe area, or native window configuration.
-->
<template>
  <!-- @lang zh-CN 受控模板呈现说明如下。
  @lang en Controlled template-presentation explanation follows.
  <lang><zh-CN>占位元素只在调用方选择可见时输出；动态高度已在计算层限制为有限像素值。</zh-CN><en>The spacer outputs only when the caller selects visibility; dynamic height has already been limited to a finite pixel value in computed state.</en></lang> -->
  <view v-if="visible" class="u-status-bar" :style="spacerStyle" aria-hidden="true" />
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称供 manifest 与显式 registry 使用；组件不注册或读取全局状态。</zh-CN><en>The stable name serves manifest and explicit registry use; the component registers and reads no global state.</en></lang>
defineOptions({ name: 'u-status-bar' });

// <lang><zh-CN>调用方显式决定是否输出和预留的像素高度；0 是合法的无空间占位。</zh-CN><en>The caller explicitly decides output and reserved pixel height; zero is a valid no-space spacer.</en></lang>
const props = defineProps({ visible: { type: Boolean, default: true }, height: { type: Number, default: 0 } });

// <lang><zh-CN>将任意数值收束到 0–96px，避免 NaN、负数或异常大布局值进入 inline style。</zh-CN><en>Constrain any number to 0–96px so NaN, negative, or exceptionally large layout values never enter inline style.</en></lang>
const safeHeight = computed(() => Number.isFinite(props.height) ? Math.min(96, Math.max(0, props.height)) : 0);

// <lang><zh-CN>唯一动态样式只投影已规范化高度；不拼接调用方 CSS 字符串。</zh-CN><en>The sole dynamic style projects normalized height only and concatenates no caller CSS string.</en></lang>
const spacerStyle = computed(() => ({ height: `${safeHeight.value}px` }));
</script>

<style src="./u-status-bar.css"></style>
