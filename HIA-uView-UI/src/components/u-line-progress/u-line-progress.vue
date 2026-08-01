<!--
@component ULineProgress
@lang zh-CN 呈现调用方提供的有限百分比静态进度条；不连接上传、下载、任务、计时器或后端。
@lang en Presents a static progress bar for a caller-provided finite percentage; it connects to no upload, download, task, timer, or backend.
-->
<template>
  <view :class="rootClasses" role="progressbar" :aria-valuenow="safePercent" aria-valuemin="0" aria-valuemax="100">
    <view class="u-line-progress__track">
      <view class="u-line-progress__bar" :style="barStyle" />
    </view>
    <text v-if="showPercent" class="u-line-progress__label">{{ safePercent }}%</text>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>进度条只投影调用方 percent，不把数值解释为上传或下载状态。</zh-CN><en>The progress bar projects caller percent only and does not interpret the number as upload or download state.</en></lang>
defineOptions({ name: 'u-line-progress' });

const props = defineProps({
  percent: { type: [Number, String], default: 0 },
  tone: { type: String, default: 'primary' },
  size: { type: String, default: 'medium' },
  striped: { type: Boolean, default: false },
  showPercent: { type: Boolean, default: true }
});

// <lang><zh-CN>有限 clamp 保证宽度始终在 0–100 之间，不执行动画或任务更新。</zh-CN><en>Finite clamping keeps width within 0–100 and performs no animation or task update.</en></lang>
const safePercent = computed(() => {
  const candidate = Number(props.percent);
  return Number.isFinite(candidate) ? Math.round(Math.min(100, Math.max(0, candidate))) : 0;
});
const rootClasses = computed(() => {
  const tone = ['neutral', 'primary', 'accent'].includes(props.tone) ? props.tone : 'primary';
  const size = ['small', 'medium', 'large'].includes(props.size) ? props.size : 'medium';
  return ['u-line-progress', `u-line-progress--${tone}`, `u-line-progress--${size}`, { 'u-line-progress--striped': props.striped }];
});
const barStyle = computed(() => ({ width: `${safePercent.value}%` }));
</script>

<style src="./u-line-progress.css"></style>
