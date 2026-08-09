<!--
@component ULoading
@lang zh-CN 提供 caller-controlled 的静态 loading indicator；调用方拥有可见性、尺寸、tone 与文字，组件不推断异步状态、计时、请求或自动隐藏。
@lang en Provides a caller-controlled static loading indicator; the caller owns visibility, size, tone, and text, while the component infers no async state, timer, request, or automatic hiding.
-->
<template>
  <!-- @lang zh-CN 受控模板呈现说明如下。
  @lang en Controlled template-presentation explanation follows.
  <lang><zh-CN>status 只有 caller visible 时输出；文本可选但 indicator 不被解释为任何请求或任务结果。</zh-CN><en>The status outputs only when caller-visible; text is optional, but the indicator is not interpreted as any request or task result.</en></lang> -->
  <view v-if="isVisible" :class="loadingClasses" role="status" aria-live="polite"><view class="u-loading__indicator" aria-hidden="true" /><text v-if="label" class="u-loading__label">{{ label }}</text></view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称只服务组件解析；组件不创建全局 loading service。</zh-CN><en>The stable name serves component resolution only; the component creates no global loading service.</en></lang>
defineOptions({ name: 'u-loading' });

// <lang><zh-CN>尺寸和 tone 的受限集合保护 class surface；它们只是视觉选择，不表示任务状态。</zh-CN><en>Finite size and tone sets protect class surface; they are visual choices only and indicate no task state.</en></lang>
const supportedSizes = Object.freeze(['sm', 'md', 'lg']);
const supportedTones = Object.freeze(['neutral', 'primary', 'accent']);

// <lang><zh-CN>调用方拥有 visible/show、size、tone 与可选 label；空 label 不生成默认语言。</zh-CN><en>The caller owns visible/show, size, tone, and optional label; an empty label generates no default language.</en></lang>
const props = defineProps({
  // <lang><zh-CN>已有 visible 显式提供时优先；undefined 表示不遮蔽迁移 show。</zh-CN><en>The existing visible takes priority when explicitly supplied; undefined means it does not mask migration show.</en></lang>
  visible: { type: Boolean, default: undefined },
  // <lang><zh-CN>上游迁移 show 默认 true，仅决定静态 indicator 是否呈现；它不表示请求、计时器或任务生命周期。</zh-CN><en>The upstream-migration show defaults true and decides only whether a static indicator renders; it represents no request, timer, or task lifecycle.</en></lang>
  show: { type: Boolean, default: true },
  // <lang><zh-CN>受限 size 只选择有限视觉密度。</zh-CN><en>The finite size selects only finite visual density.</en></lang>
  size: { type: String, default: 'md' },
  // <lang><zh-CN>受限 tone 只选择有限 token 族。</zh-CN><en>The finite tone selects only a finite token family.</en></lang>
  tone: { type: String, default: 'primary' },
  // <lang><zh-CN>文字完全由调用方提供；空值不生成默认语言。</zh-CN><en>Copy is supplied entirely by the caller; an empty value generates no default language.</en></lang>
  label: { type: String, default: '' }
});

// <lang><zh-CN>可见性遵循已有 visible 优先与 show 回退；组件不观察、缓存或写回调用方状态。</zh-CN><en>Visibility follows existing visible precedence with show fallback; the component neither observes, caches, nor writes back caller state.</en></lang>
const isVisible = computed(() => props.visible ?? props.show);

// <lang><zh-CN>未知 size 安全回退 md，避免任意字符串成为 CSS class。</zh-CN><en>An unknown size safely falls back to md, preventing arbitrary strings from becoming CSS classes.</en></lang>
const safeSize = computed(() => supportedSizes.includes(props.size) ? props.size : 'md');

// <lang><zh-CN>未知 tone 安全回退 primary，保持 token 选择有限可审计。</zh-CN><en>An unknown tone safely falls back to primary, keeping token selection finite and auditable.</en></lang>
const safeTone = computed(() => supportedTones.includes(props.tone) ? props.tone : 'primary');

// <lang><zh-CN>根 class 仅组合固定命名空间与已规范化视觉值。</zh-CN><en>Root classes combine only the fixed namespace and normalized visual values.</en></lang>
const loadingClasses = computed(() => ['u-loading', `u-loading--${safeSize.value}`, `u-loading--${safeTone.value}`]);
</script>

<style src="./u-loading.css"></style>
