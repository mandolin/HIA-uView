<!--
@component USkeleton
@lang zh-CN 提供调用方控制的静态标题、行和头像占位；不测量内容、不播放动画、不读取真实数据或等待请求。
@lang en Provides caller-controlled static title, row, and avatar placeholders; it does not measure content, animate, read real data, or await requests.
-->
<template>
  <view class="u-skeleton" :aria-busy="loading" role="status">
    <view v-if="loading" class="u-skeleton__placeholder">
      <view v-if="showAvatar" class="u-skeleton__avatar" aria-hidden="true" />
      <view class="u-skeleton__body">
        <view v-if="showTitle" class="u-skeleton__title" aria-hidden="true" />
        <view v-for="row in rowsArray" :key="row" class="u-skeleton__row" aria-hidden="true" />
      </view>
    </view>
    <slot v-else />
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>声明稳定名称；骨架只作为局部 loading projection，不拥有异步生命周期。</zh-CN><en>Declares a stable name; the skeleton is only a local loading projection and owns no asynchronous lifecycle.</en></lang>
defineOptions({ name: 'u-skeleton' });

const props = defineProps({
  loading: { type: Boolean, default: true },
  rows: { type: Number, default: 3 },
  showTitle: { type: Boolean, default: true },
  showAvatar: { type: Boolean, default: false }
});

const rowsArray = computed(() => Array.from({ length: Math.min(8, Math.max(0, Math.trunc(props.rows))) }, (_, index) => index));
</script>

<style src="./u-skeleton.css"></style>
