<!--
@component ULoading
@lang zh-CN 提供 caller-controlled 的静态 loading indicator；调用方拥有可见性、尺寸、tone 与文字，组件不推断异步状态、计时、请求或自动隐藏。
@lang en Provides a caller-controlled static loading indicator; the caller owns visibility, size, tone, and text, while the component infers no async state, timer, request, or automatic hiding.
-->
<template>
  <!-- @lang zh-CN 受控模板呈现说明如下。
  @lang en Controlled template-presentation explanation follows.
  <lang><zh-CN>status 只有 caller visible 时输出；文本可选但 indicator 不被解释为任何请求或任务结果。</zh-CN><en>The status outputs only when caller-visible; text is optional, but the indicator is not interpreted as any request or task result.</en></lang> -->
  <view v-if="visible" :class="loadingClasses" role="status" aria-live="polite"><view class="u-loading__indicator" aria-hidden="true" /><text v-if="label" class="u-loading__label">{{ label }}</text></view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称只服务组件解析；组件不创建全局 loading service。</zh-CN><en>The stable name serves component resolution only; the component creates no global loading service.</en></lang>
defineOptions({ name: 'u-loading' });

// <lang><zh-CN>尺寸和 tone 的受限集合保护 class surface；它们只是视觉选择，不表示任务状态。</zh-CN><en>Finite size and tone sets protect class surface; they are visual choices only and indicate no task state.</en></lang>
const supportedSizes = Object.freeze(['sm', 'md', 'lg']);
const supportedTones = Object.freeze(['neutral', 'primary', 'accent']);

// <lang><zh-CN>调用方拥有 visible、size、tone 与可选 label；空 label 不生成默认语言。</zh-CN><en>The caller owns visible, size, tone, and optional label; an empty label generates no default language.</en></lang>
const props = defineProps({ visible: { type: Boolean, default: false }, size: { type: String, default: 'md' }, tone: { type: String, default: 'primary' }, label: { type: String, default: '' } });

// <lang><zh-CN>未知 size 安全回退 md，避免任意字符串成为 CSS class。</zh-CN><en>An unknown size safely falls back to md, preventing arbitrary strings from becoming CSS classes.</en></lang>
const safeSize = computed(() => supportedSizes.includes(props.size) ? props.size : 'md');

// <lang><zh-CN>未知 tone 安全回退 primary，保持 token 选择有限可审计。</zh-CN><en>An unknown tone safely falls back to primary, keeping token selection finite and auditable.</en></lang>
const safeTone = computed(() => supportedTones.includes(props.tone) ? props.tone : 'primary');

// <lang><zh-CN>根 class 仅组合固定命名空间与已规范化视觉值。</zh-CN><en>Root classes combine only the fixed namespace and normalized visual values.</en></lang>
const loadingClasses = computed(() => ['u-loading', `u-loading--${safeSize.value}`, `u-loading--${safeTone.value}`]);
</script>

<style src="./u-loading.css"></style>
