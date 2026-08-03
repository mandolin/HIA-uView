<!--
@component USafeBottom
@lang zh-CN 提供调用方指定高度的底部安全占位结构；它不探测刘海、设备 inset、页面滚动或原生容器。
@lang en Provides a caller-specified bottom-safe spacer; it detects no notch, device inset, page scroll, or native container.
-->
<template>
  <!-- @lang zh-CN 受控模板呈现说明如下。
  @lang en Controlled template-presentation explanation follows.
  <lang><zh-CN>占位只表达调用方已知的布局空间；不把它宣称为设备安全区读取结果。</zh-CN><en>The spacer expresses only layout space known to the caller and does not claim to be a device safe-area reading.</en></lang> -->
  <view v-if="visible" class="u-safe-bottom" :style="spacerStyle" aria-hidden="true" />
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称供本地组件解析使用；它不安装任何平台适配器。</zh-CN><en>The stable name supports local component resolution; it installs no platform adapter.</en></lang>
defineOptions({ name: 'u-safe-bottom' });

// <lang><zh-CN>调用方拥有可见性和高度；默认 0 保持零隐式设备推断。</zh-CN><en>The caller owns visibility and height; the zero default retains zero implicit device inference.</en></lang>
const props = defineProps({ visible: { type: Boolean, default: true }, height: { type: Number, default: 0 } });

// <lang><zh-CN>底部占位上限较小且有限，防止未审阅输入压缩页面主体。</zh-CN><en>The bottom spacer uses a small finite upper limit, preventing unreviewed input from compressing page body content.</en></lang>
const safeHeight = computed(() => Number.isFinite(props.height) ? Math.min(64, Math.max(0, props.height)) : 0);

// <lang><zh-CN>样式对象只写受限像素高度，不接受调用方样式对象或字符串。</zh-CN><en>The style object writes constrained pixel height only and accepts no caller style object or string.</en></lang>
const spacerStyle = computed(() => ({ height: `${safeHeight.value}px` }));
</script>

<style src="./u-safe-bottom.css"></style>
