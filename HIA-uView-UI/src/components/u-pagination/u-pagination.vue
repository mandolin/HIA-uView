<!--
@component UPagination
@lang zh-CN 提供受控 pageCount/current 的有限页码选择与 change intent；不请求、不缓存、不读取远程 total 或执行业务分页策略。
@lang en Provides finite page selection and change intent for controlled pageCount/current; it performs no request, cache, remote total read, or business pagination strategy.
-->
<template>
  <view class="u-pagination" role="navigation" aria-label="pagination">
    <button class="u-pagination__control" type="button" :disabled="safeCurrent <= 1" @click="changePage(safeCurrent - 1)">{{ prevText }}</button>
    <button
      v-for="page in pages"
      :key="page"
      class="u-pagination__page"
      :class="{ 'u-pagination__page--active': page === safeCurrent }"
      type="button"
      :aria-current="page === safeCurrent ? 'page' : undefined"
      @click="changePage(page)"
    >{{ page }}</button>
    <button class="u-pagination__control" type="button" :disabled="safeCurrent >= safePageCount" @click="changePage(safeCurrent + 1)">{{ nextText }}</button>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>pagination 只呈现调用方已计算的页数，不把 pageCount 解释为远程查询总量。</zh-CN><en>Pagination presents caller-computed page count only and does not interpret pageCount as a remote query total.</en></lang>
defineOptions({ name: 'u-pagination' });

const props = defineProps({
  current: { type: Number, default: 1 },
  pageCount: { type: Number, default: 1 },
  prevText: { type: String, default: '上一页 / Prev' },
  nextText: { type: String, default: '下一页 / Next' }
});
const emit = defineEmits(['update:current', 'change']);
const safePageCount = computed(() => Number.isFinite(props.pageCount) ? Math.min(100, Math.max(1, Math.floor(props.pageCount))) : 1);
const safeCurrent = computed(() => Math.min(safePageCount.value, Math.max(1, Math.floor(Number.isFinite(props.current) ? props.current : 1))));
const pages = computed(() => Array.from({ length: safePageCount.value }, (_, index) => index + 1));

/**
 * @lang zh-CN 在受控页码有效且变化时报告 update/change intent；组件不修改数据源或发起查询。
 * @lang en Reports update/change intent when the controlled page is valid and changed; the component modifies no data source or starts no query.
 * @param {number} page <lang><zh-CN>候选页码。</zh-CN><en>Candidate page number.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function changePage(page) {
  if (page < 1 || page > safePageCount.value || page === safeCurrent.value) return;
  emit('update:current', page);
  emit('change', page);
}
</script>

<style src="./u-pagination.css"></style>
