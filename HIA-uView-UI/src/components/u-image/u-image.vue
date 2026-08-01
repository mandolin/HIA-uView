<!--
@component UImage
@lang zh-CN 呈现调用方提供的原生图片源、尺寸形状和替代文字；不负责请求、缓存、上传、下载或内置资产。
@lang en Presents a caller-provided native image source, size, shape, and alternative text; it owns no request, cache, upload, download, or bundled asset.
-->
<template>
  <view :class="rootClasses" role="img" :aria-label="alt || errorText">
    <image
      v-if="!hasError || !showError"
      class="u-image__native"
      :src="src"
      :mode="safeMode"
      :lazy-load="lazyLoad"
      @load="handleLoad"
      @error="handleError"
    />
    <text v-if="hasError && showError" class="u-image__fallback">{{ errorText }}</text>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';

// <lang><zh-CN>模板名保持 u-image 迁移熟悉度，但 src、alt 和错误后续均由调用方拥有。</zh-CN><en>Retains the u-image migration name while the caller owns src, alt, and all error follow-up.</en></lang>
defineOptions({ name: 'u-image' });

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  mode: { type: String, default: 'aspectFill' },
  shape: { type: String, default: 'square' },
  size: { type: String, default: 'medium' },
  lazyLoad: { type: Boolean, default: true },
  showError: { type: Boolean, default: true },
  errorText: { type: String, default: '图片不可用 / Image unavailable' }
});

// <lang><zh-CN>load/error 只报告本地原生呈现状态，不把平台结果转换成远程错误协议。</zh-CN><en>load/error report local native presentation state only and never turn platform results into a remote error protocol.</en></lang>
const emit = defineEmits(['load', 'error']);
const hasError = ref(false);

// <lang><zh-CN>仅允许已知原生 mode，未知值回退到 aspectFill。</zh-CN><en>Allows only known native modes and falls back to aspectFill for unknown values.</en></lang>
const safeMode = computed(() => ['scaleToFill', 'aspectFit', 'aspectFill', 'widthFix', 'heightFix', 'top', 'bottom', 'center', 'left', 'right'].includes(props.mode) ? props.mode : 'aspectFill');
const rootClasses = computed(() => {
  const shape = ['square', 'rounded', 'circle'].includes(props.shape) ? props.shape : 'square';
  const size = ['small', 'medium', 'large'].includes(props.size) ? props.size : 'medium';
  return ['u-image', `u-image--${shape}`, `u-image--${size}`, { 'u-image--error': hasError.value }];
});

/**
 * @lang zh-CN 报告原生图片加载意图并清除当前错误显示。
 * @lang en Reports native image-load intent and clears the current error presentation.
 * @param {unknown} event <lang><zh-CN>原生加载事件。</zh-CN><en>Native load event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleLoad(event) {
  hasError.value = false;
  emit('load', event);
}

/**
 * @lang zh-CN 报告原生图片错误并显示调用方提供的中性 fallback 文字。
 * @lang en Reports a native image error and displays caller-provided neutral fallback copy.
 * @param {unknown} event <lang><zh-CN>原生错误事件。</zh-CN><en>Native error event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleError(event) {
  hasError.value = true;
  emit('error', event);
}
</script>

<style src="./u-image.css"></style>
