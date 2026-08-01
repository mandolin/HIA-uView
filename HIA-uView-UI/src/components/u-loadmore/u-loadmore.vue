<!--
@component ULoadmore
@lang zh-CN 呈现调用方控制的加载更多状态并报告显式 loadmore intent；不请求、重试、计时或管理分页。
@lang en Presents caller-controlled load-more status and reports explicit loadmore intent; it performs no request, retry, timer, or paging management.
-->
<template>
  <view class="u-loadmore" role="status" :aria-label="statusText">
    <button v-if="safeStatus === 'more'" class="u-loadmore__action" type="button" @click="handleLoadmore">
      {{ statusText }}
    </button>
    <text v-else class="u-loadmore__text">{{ statusText }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>声明稳定名称，使 loadmore 的 template、manifest 与显式 registry 保持一致。</zh-CN><en>Declares a stable name so the loadmore template, manifest, and explicit registry stay aligned.</en></lang>
defineOptions({ name: 'u-loadmore' });

const props = defineProps({
  status: { type: String, default: 'more' },
  moreText: { type: String, default: '加载更多 / Load more' },
  loadingText: { type: String, default: '加载中 / Loading' },
  nomoreText: { type: String, default: '没有更多 / No more' },
  errorText: { type: String, default: '加载失败 / Load failed' }
});

// <lang><zh-CN>只有 more 状态会报告 loadmore；状态本身仍完全由调用方拥有。</zh-CN><en>Only the more status reports loadmore; the status itself remains fully caller-owned.</en></lang>
const emit = defineEmits(['loadmore']);

const safeStatus = computed(() => ['more', 'loading', 'nomore', 'error'].includes(props.status) ? props.status : 'more');
const statusText = computed(() => ({
  more: props.moreText,
  loading: props.loadingText,
  nomore: props.nomoreText,
  error: props.errorText
}[safeStatus.value]));

/**
 * @lang zh-CN 把点击转换成调用方处理的本地意图，不执行请求或分页。
 * @lang en Converts a click into a caller-handled local intent without executing request or paging behavior.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleLoadmore() {
  if (safeStatus.value === 'more') emit('loadmore');
}
</script>

<style src="./u-loadmore.css"></style>
