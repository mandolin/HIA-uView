<!--
@component ULoadingPage
@lang zh-CN 提供受控页面级静态 loading 呈现；不推断异步状态、不计时、不请求、不管理全局遮罩或图标资产。
@lang en Provides controlled page-level static loading presentation; it infers no async state and owns no timer, request, global mask, or icon asset.
-->
<template>
  <view v-if="visible" :class="rootClasses" role="status" aria-live="polite">
    <view class="u-loading-page__indicator"><text>…</text></view>
    <text v-if="text" class="u-loading-page__text">{{ text }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>loading-page 只呈现调用方 visible 与文字，静态省略号不是异步状态判断。</zh-CN><en>Loading-page presents caller visible state and copy only; the static ellipsis is no async-state judgment.</en></lang>
defineOptions({ name: 'u-loading-page' });

const props = defineProps({
  visible: { type: Boolean, default: false },
  text: { type: String, default: '' },
  tone: { type: String, default: 'neutral' }
});

const rootClasses = computed(() => {
  const tone = ['neutral', 'primary', 'accent'].includes(props.tone) ? props.tone : 'neutral';
  return ['u-loading-page', `u-loading-page--${tone}`];
});
</script>

<style src="./u-loading-page.css"></style>
