<!--
@component UPagination
@lang zh-CN 提供受控 pageCount/current 与迁移 modelValue/pageSize/total 的有限页码选择和 change intent；不请求、不缓存、不读取远程 total 或执行业务分页策略。
@lang en Provides finite page selection and change intent for controlled pageCount/current and migration modelValue/pageSize/total; it performs no request, cache, remote-total read, or business pagination strategy.
-->
<template>
  <view class="u-pagination" role="navigation" aria-label="pagination">
    <button class="u-pagination__control" type="button" :disabled="safeCurrent <= 1" @click="changePage(safeCurrent - 1)">{{ prevText }}</button>
    <!--
    @lang zh-CN 默认 slot 仅替换当前页/总页数的局部摘要；上一页、页码、下一页 control 仍保留，且 slot 不取得查询或状态写回职责。
    @lang en The default slot replaces only local current-page/total-page summary; previous, page, and next controls remain, and the slot acquires no query or state-writeback responsibility.
    -->
    <view class="u-pagination__summary"><slot :current="safeCurrent" :page-count="safePageCount"><text>{{ safeCurrent }} / {{ safePageCount }}</text></slot></view>
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

// <lang><zh-CN>pagination 只呈现调用方已计算或声明的有限页数，不把 pageCount/total 解释为远程查询总量。</zh-CN><en>Pagination presents only caller-computed or declared finite page count and does not interpret pageCount/total as a remote-query total.</en></lang>
defineOptions({ name: 'u-pagination' });

// <lang><zh-CN>所有页码输入均为调用方声明的展示状态；组件不请求 records、不管理 cursor/offset，也不保存分页偏好。</zh-CN><en>All page inputs are caller-declared presentation state; the component requests no records, manages no cursor/offset, and persists no pagination preference.</en></lang>
const props = defineProps({
  // <lang><zh-CN>既有 HIA current 在显式提供时优先；undefined 允许未提供的 current 受控回退到迁移 modelValue。</zh-CN><en>Existing HIA current takes precedence when explicitly supplied; undefined permits an absent current to controlledly fall back to migration modelValue.</en></lang>
  current: { type: Number, default: undefined },
  // <lang><zh-CN>既有 HIA pageCount 在显式提供时优先；它只描述本地展示页数，不描述远端数据。</zh-CN><en>Existing HIA pageCount takes precedence when explicitly supplied; it describes local presentation page count only and not remote data.</en></lang>
  pageCount: { type: Number, default: undefined },
  // <lang><zh-CN>迁移 modelValue 是未提供 current 时的当前页值；组件从不直接修改 prop。</zh-CN><en>Migration modelValue is the current page when current is absent; the component never mutates a prop directly.</en></lang>
  modelValue: { type: Number, default: 1 },
  // <lang><zh-CN>迁移 pageSize 只用于将调用方 total 转换为有限本地页数；它不发起查询或切分数据。</zh-CN><en>Migration pageSize is used only to convert caller total into finite local page count; it starts no query and slices no data.</en></lang>
  pageSize: { type: Number, default: 10 },
  // <lang><zh-CN>迁移 total 没有默认值，保持调用方未声明 total 与声明为零之间的事实差异。</zh-CN><en>Migration total has no default, retaining the factual distinction between caller absence and an explicit zero total.</en></lang>
  total: { type: Number },
  // <lang><zh-CN>上一页文字由调用方本地化；组件不读取应用 locale 或生成业务文案。</zh-CN><en>Previous-page copy is caller-localized; the component reads no application locale and generates no business copy.</en></lang>
  prevText: { type: String, default: '上一页 / Prev' },
  // <lang><zh-CN>下一页文字由调用方本地化；默认值只是组件中性的双语展示，不含业务状态。</zh-CN><en>Next-page copy is caller-localized; the default is only component-neutral bilingual presentation and contains no business state.</en></lang>
  nextText: { type: String, default: '下一页 / Next' }
});

// <lang><zh-CN>事件只回传候选页码；调用方决定写回 current/modelValue、触发查询或改变 records。</zh-CN><en>Events return only a candidate page; the caller decides whether to write current/modelValue, trigger a query, or change records.</en></lang>
const emit = defineEmits(['update:current', 'update:modelValue', 'change']);

// <lang><zh-CN>显式 HIA pageCount 的存在决定其是否覆盖迁移 total/pageSize；undefined 是唯一可使用迁移计算的状态。</zh-CN><en>The presence of explicit HIA pageCount decides whether it overrides migration total/pageSize; undefined is the sole state that may use migration calculation.</en></lang>
const hasHiaPageCount = computed(() => props.pageCount !== undefined);

// <lang><zh-CN>有效 total 与 pageSize 才可导出迁移页数；缺失、无穷、负值或零总数稳定投影为一页而不推断数据异常。</zh-CN><en>Only valid total and pageSize may derive migration page count; absent, infinite, negative, or zero total stably projects one page without inferring a data error.</en></lang>
const migrationPageCount = computed(() => {
  // <lang><zh-CN>总量和每页量都需为正有限数，避免零除、NaN 或无限页数扩展呈现表面。</zh-CN><en>Total and page size must both be positive finite numbers, avoiding division by zero, NaN, or infinite pages expanding the presentation surface.</en></lang>
  if (!Number.isFinite(props.total) || props.total <= 0 || !Number.isFinite(props.pageSize) || props.pageSize <= 0) {
    return 1;
  }

  // <lang><zh-CN>向上取整只计算调用方已声明 total 的展示页数，不读取、请求或缓存实际记录。</zh-CN><en>Rounding up calculates display pages only from caller-declared total and reads, requests, or caches no actual record.</en></lang>
  return Math.ceil(props.total / props.pageSize);
});

// <lang><zh-CN>所有 page count 都裁剪到 1–100，防止展示控件因调用方值创建无边界按钮集合。</zh-CN><en>Every page count is clamped to 1–100, preventing caller values from creating an unbounded button collection in the presentation control.</en></lang>
const safePageCount = computed(() => {
  // <lang><zh-CN>优先 HIA pageCount，否则使用从迁移 total/pageSize 得出的有限数值。</zh-CN><en>Prefers HIA pageCount and otherwise uses the finite value derived from migration total/pageSize.</en></lang>
  const candidate = hasHiaPageCount.value ? props.pageCount : migrationPageCount.value;

  // <lang><zh-CN>非有限候选稳定回退为一页，不发出错误、请求或隐式状态变更。</zh-CN><en>A nonfinite candidate stably falls back to one page and emits no error, request, or implicit state change.</en></lang>
  return Number.isFinite(candidate) ? Math.min(100, Math.max(1, Math.floor(candidate))) : 1;
});

// <lang><zh-CN>显式 HIA current 保持既有优先级；未提供时使用迁移 modelValue 的公开默认值。</zh-CN><en>Explicit HIA current retains existing precedence; when absent, use migration modelValue's public default.</en></lang>
const requestedCurrent = computed(() => (props.current === undefined ? props.modelValue : props.current));

// <lang><zh-CN>当前页被裁剪到可见页数范围；组件不自动写回裁剪结果，调用方仍拥有状态。</zh-CN><en>Current page is clamped to the visible-page range; the component does not automatically write back the clamped result and the caller still owns state.</en></lang>
const safeCurrent = computed(() => Math.min(safePageCount.value, Math.max(1, Math.floor(Number.isFinite(requestedCurrent.value) ? requestedCurrent.value : 1))));

// <lang><zh-CN>页码数组只由已裁剪的有限数量派生，生成顺序稳定且不读取 records。</zh-CN><en>The page array derives only from the clamped finite count, has stable order, and reads no records.</en></lang>
const pages = computed(() => Array.from({ length: safePageCount.value }, (_, index) => index + 1));

/**
 * @lang zh-CN 在受控页码有效且变化时报告 update/change intent；组件不修改数据源或发起查询。
 * @lang en Reports update/change intent when the controlled page is valid and changed; the component modifies no data source or starts no query.
 * @param {number} page <lang><zh-CN>候选页码。</zh-CN><en>Candidate page number.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function changePage(page) {
  // <lang><zh-CN>越界或重复页码保持零事件，避免点击边界 control 生成无意义的调用方状态写回。</zh-CN><en>An out-of-range or repeated page retains zero events, avoiding a boundary-control click generating meaningless caller-state write-back.</en></lang>
  if (page < 1 || page > safePageCount.value || page === safeCurrent.value) return;

  // <lang><zh-CN>同时报告既有 HIA 和迁移受控更新事件，二者均只携带候选页码，调用方可按自身绑定选择处理。</zh-CN><en>Reports both existing HIA and migration controlled-update events; both carry only a candidate page and the caller may handle them according to its own binding.</en></lang>
  emit('update:current', page);
  emit('update:modelValue', page);
  emit('change', page);
}
</script>

<style src="./u-pagination.css"></style>
