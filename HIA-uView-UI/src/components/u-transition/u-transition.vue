<!--
@component UTransition
@lang zh-CN 提供 caller-controlled 的有限 CSS transition 包装面；调用方拥有 visible、mode、duration 与内容，组件不使用 JavaScript timer、测量、全局生命周期或异步动画服务。
@lang en Provides a caller-controlled finite CSS-transition wrapper; the caller owns visible, mode, duration, and content, while the component uses no JavaScript timer, measurement, global lifecycle, or async animation service.
-->
<template>
  <!-- @lang zh-CN 受控模板呈现说明如下。
  @lang en Controlled template-presentation explanation follows.
  <lang><zh-CN>visible 直接控制 slot 是否在树中；class/style 只投影已规范化的 mode/duration。</zh-CN><en>Visible directly controls whether the slot is in the tree; class/style project normalized mode/duration only.</en></lang> -->
  <view v-if="visible" :class="transitionClasses" :style="transitionStyle"><slot /></view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称供模板和 manifest 使用；它不模拟 upstream 的完整动画生命周期。</zh-CN><en>The stable name serves template and manifest use; it does not simulate an upstream complete animation lifecycle.</en></lang>
defineOptions({ name: 'u-transition' });

// <lang><zh-CN>有限 mode 集合避免任意 caller 字符串成为 CSS class；每个 mode 只是 CSS 呈现选择。</zh-CN><en>The finite mode set prevents arbitrary caller strings from becoming CSS classes; every mode is a CSS presentation choice only.</en></lang>
const supportedModes = Object.freeze(['fade', 'slide-up', 'slide-down', 'zoom']);

// <lang><zh-CN>调用方拥有可见性、mode 与 duration；duration 单位为毫秒，0 允许关闭 CSS transition。</zh-CN><en>The caller owns visibility, mode, and duration; duration is milliseconds and zero permits disabling CSS transition.</en></lang>
const props = defineProps({ visible: { type: Boolean, default: false }, mode: { type: String, default: 'fade' }, duration: { type: Number, default: 180 } });

// <lang><zh-CN>未知 mode 回退 fade，保持 class 受限。</zh-CN><en>An unknown mode falls back to fade, keeping classes constrained.</en></lang>
const safeMode = computed(() => supportedModes.includes(props.mode) ? props.mode : 'fade');

// <lang><zh-CN>duration 只允许 0–1000ms 的有限整数，避免无界 CSS inline 值。</zh-CN><en>Duration permits a finite integer of 0–1000ms only, preventing unbounded CSS inline values.</en></lang>
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.round(Math.min(1000, Math.max(0, props.duration))) : 180);

// <lang><zh-CN>class 仅组合固定命名空间及规范化 mode。</zh-CN><en>Classes combine only the fixed namespace and normalized mode.</en></lang>
const transitionClasses = computed(() => ['u-transition', `u-transition--${safeMode.value}`]);

// <lang><zh-CN>动态 style 仅传递私有 duration property，CSS 保留真正的 transition 声明。</zh-CN><en>Dynamic style passes a private duration property only; CSS retains the actual transition declaration.</en></lang>
const transitionStyle = computed(() => ({ '--u-transition-duration': `${safeDuration.value}ms` }));
</script>

<style src="./u-transition.css"></style>
