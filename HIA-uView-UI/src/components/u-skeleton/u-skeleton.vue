<!--
@component USkeleton
@lang zh-CN 提供调用方控制的静态标题、行和头像占位；不测量内容、不播放动画、不读取真实数据或等待请求。
@lang en Provides caller-controlled static title, row, and avatar placeholders; it does not measure content, animate, read real data, or await requests.
-->
<template>
  <!--
  @lang zh-CN 根节点仅公开 caller-owned loading 的局部忙碌状态。
  @lang en The root exposes only the local busy state represented by caller-owned loading.
  <lang><zh-CN>组件不测量 slot、不等待请求，也不根据页面数据自行改变 `loading`。</zh-CN><en>The component neither measures its slot, awaits a request, nor changes `loading` from page data.</en></lang>
  -->
  <view class="u-skeleton" :aria-busy="loading" role="status">
    <!--
    @lang zh-CN loading 分支只呈现有限的静态占位结构。
    @lang en The loading branch presents only a bounded static placeholder structure.
    <lang><zh-CN>该分支与 default slot 互斥，不缓存或复制 caller content。</zh-CN><en>This branch is mutually exclusive with the default slot and neither caches nor copies caller content.</en></lang>
    -->
    <view v-if="loading" class="u-skeleton__placeholder">
      <!--
      @lang zh-CN 可选头像占位只受 caller Boolean 控制。
      @lang en The optional avatar placeholder is controlled only by a caller Boolean.
      <lang><zh-CN>占位不下载头像、不读取用户身份，也不推断真实媒体尺寸。</zh-CN><en>The placeholder downloads no avatar, reads no user identity, and infers no real media dimensions.</en></lang>
      -->
      <view v-if="showAvatar" class="u-skeleton__avatar" aria-hidden="true" />
      <view class="u-skeleton__body">
        <!--
        @lang zh-CN 可选标题占位只控制当前静态节点。
        @lang en The optional title placeholder controls only this static node.
        <lang><zh-CN>它不读取标题 slot 或生成默认文案。</zh-CN><en>It neither reads a title slot nor generates default copy.</en></lang>
        -->
        <view v-if="showTitle" class="u-skeleton__title" aria-hidden="true" />
        <!--
        @lang zh-CN 行占位来自已收束的零至八项数组。
        @lang en Row placeholders come from an already constrained zero-to-eight-item array.
        <lang><zh-CN>template 不再解释原始 rows，因此非法或过大输入不能创建无界节点。</zh-CN><en>The template no longer interprets raw rows, so invalid or excessive input cannot create unbounded nodes.</en></lang>
        -->
        <view v-for="row in rowsArray" :key="row" class="u-skeleton__row" aria-hidden="true" />
      </view>
    </view>

    <!--
    @lang zh-CN 非 loading 分支原样投影 caller default slot。
    @lang en The non-loading branch projects the caller default slot unchanged.
    <lang><zh-CN>组件不修改 slot、不追加陈旧占位，也不把内容存在性写回 loading。</zh-CN><en>The component neither modifies the slot, appends stale placeholders, nor writes content presence back to loading.</en></lang>
    -->
    <slot v-else />
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>声明稳定名称；骨架只作为局部 loading projection，不拥有异步生命周期。</zh-CN><en>Declares a stable name; the skeleton is only a local loading projection and owns no asynchronous lifecycle.</en></lang>
defineOptions({ name: 'u-skeleton' });

// <lang><zh-CN>骨架只接收 caller-owned loading 与有限占位形状；它不接收请求、数据、selector、动画计时或业务状态。</zh-CN><en>The skeleton accepts only caller-owned loading and bounded placeholder shape; it accepts no request, data, selector, animation timing, or business state.</en></lang>
const props = defineProps({
  // <lang><zh-CN>loading 只选择占位与 default slot 两个互斥分支；组件绝不自行写回。</zh-CN><en>Loading selects only between mutually exclusive placeholder and default-slot branches and is never written back by the component.</en></lang>
  loading: {
    type: Boolean,
    default: true
  },
  // <lang><zh-CN>rows 是调用方候选行数；运行时仍会拒绝非 number/非有限值，并把有限值收束到 0–8。</zh-CN><en>Rows is the caller row-count candidate; runtime still rejects non-number/non-finite values and constrains finite values to 0–8.</en></lang>
  rows: {
    type: Number,
    default: 3
  },
  // <lang><zh-CN>showTitle 只切换静态标题占位，不读取或命名真实标题。</zh-CN><en>ShowTitle only toggles a static title placeholder and neither reads nor names a real title.</en></lang>
  showTitle: {
    type: Boolean,
    default: true
  },
  // <lang><zh-CN>showAvatar 只切换静态头像占位，不加载图片或读取身份。</zh-CN><en>ShowAvatar only toggles a static avatar placeholder and neither loads an image nor reads identity.</en></lang>
  showAvatar: {
    type: Boolean,
    default: false
  }
});

// <lang><zh-CN>安全行数组将任意 runtime 输入收束为零至八个稳定整数 key；该派生不 emit 修正，也不修改 caller prop。</zh-CN><en>The safe row array constrains any runtime input to zero through eight stable integer keys; this derivation emits no correction and does not mutate the caller prop.</en></lang>
const rowsArray = computed(() => {
  // <lang><zh-CN>保留原始候选用于严格类型与有限性检查，不通过隐式 Number coercion 接受字符串或对象。</zh-CN><en>Retains the original candidate for strict type and finiteness checks, accepting no string or object through implicit Number coercion.</en></lang>
  const candidate = props.rows;

  // <lang><zh-CN>错误类型、NaN 与正负 Infinity 都不是可计数行数，稳定回退为空数组。</zh-CN><en>Wrong types, NaN, and positive or negative Infinity are not countable row quantities and stably fall back to an empty array.</en></lang>
  if (typeof candidate !== 'number' || !Number.isFinite(candidate)) {
    return [];
  }

  // <lang><zh-CN>有限候选先向零截断，再应用零与八的硬边界，防止负长度或无界 DOM。</zh-CN><en>The finite candidate is first truncated toward zero and then hard-bounded by zero and eight, preventing negative lengths or unbounded DOM.</en></lang>
  const safeLength = Math.min(8, Math.max(0, Math.trunc(candidate)));

  // <lang><zh-CN>局部数组只保存稳定 key，不包含 caller data、slot 内容或业务记录。</zh-CN><en>The local array stores only stable keys and contains no caller data, slot content, or business record.</en></lang>
  const safeRows = [];

  // <lang><zh-CN>按已收束上限生成连续 key；循环最多执行八次。</zh-CN><en>Generates consecutive keys under the constrained upper bound; the loop runs at most eight times.</en></lang>
  for (let index = 0; index < safeLength; index += 1) {
    // <lang><zh-CN>将当前有限索引加入局部投影数组；不读取外部集合或调用 callback。</zh-CN><en>Adds the current finite index to the local projection array without reading an external collection or invoking a callback.</en></lang>
    safeRows.push(index);
  }

  // <lang><zh-CN>返回新数组供当前实例模板读取；调用方无法借此写入组件或全局状态。</zh-CN><en>Returns a fresh array for this instance template; callers cannot use it to write component or global state.</en></lang>
  return safeRows;
});
</script>

<style src="./u-skeleton.css"></style>
