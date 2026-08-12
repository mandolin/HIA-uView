<!--
@component UMask
@lang zh-CN 提供带 visible/show 优先级、default slot 与可选 click intent 的受控局部遮罩；调用方拥有可见性、opacity、layer 和关闭决定，组件不写回状态、不锁滚动、不管理焦点。
@lang en Provides a controlled local mask with visible/show precedence, a default slot, and optional click intent; the caller owns visibility, opacity, layer, and close decision, while the component writes no state, locks no scrolling, and manages no focus.
-->
<template>
  <!-- @lang zh-CN 受控模板呈现说明如下。
  @lang en Controlled template-presentation explanation follows.
  <lang><zh-CN>遮罩只有解析后的受控值为真时输出；opacity/layer 均先收束为有限数值再投影到 CSS custom property。</zh-CN><en>The mask outputs only when the resolved controlled value is true; opacity and layer are both constrained to finite numbers before projection into CSS custom properties.</en></lang> -->
  <view v-if="isVisible" class="u-mask" :style="maskStyle" @click="emitClick"><slot /></view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称服务局部 overlay 组合；组件不成为全局 layer manager。</zh-CN><en>The stable name serves local overlay composition; the component does not become a global layer manager.</en></lang>
defineOptions({ name: 'u-mask' });

// <lang><zh-CN>调用方拥有可见性、有限透明度/层级与是否允许 click intent；visible 明确值优先于迁移别名 show，且没有 close-on-click 状态写回。</zh-CN><en>The caller owns visibility, finite opacity/layer, and whether click intent is allowed; an explicit visible value precedes the show migration alias, and there is no close-on-click state writeback.</en></lang>
const props = defineProps({
  // <lang><zh-CN>undefined 表示调用方未提供 HIA 入口，因此允许读取 show；显式 false 必须保持隐藏。</zh-CN><en>Undefined means the caller omitted the HIA entry and therefore permits reading show; explicit false must remain hidden.</en></lang>
  visible: { type: Boolean, default: undefined },
  // <lang><zh-CN>show 是有限布尔迁移别名，不创建独立状态或双向写回。</zh-CN><en>Show is a finite Boolean migration alias and creates neither independent state nor two-way writeback.</en></lang>
  show: { type: Boolean, default: false },
  // <lang><zh-CN>opacity 是调用方数值建议，runtime 收束到可读的 0.08–0.92 区间。</zh-CN><en>Opacity is a caller numeric hint constrained by runtime to the readable 0.08–0.92 interval.</en></lang>
  opacity: { type: Number, default: 0.56 },
  // <lang><zh-CN>layer 只投影为 1–2000 的局部整数层级，不参与全局 layer 管理。</zh-CN><en>Layer projects only to a local integer level from 1–2000 and participates in no global layer management.</en></lang>
  layer: { type: Number, default: 1000 },
  // <lang><zh-CN>clickable 仅决定是否报告 raw click intent，不隐含关闭、穿透或滚动策略。</zh-CN><en>Clickable only decides whether to report raw click intent and implies no close, pass-through, or scrolling policy.</en></lang>
  clickable: { type: Boolean, default: false }
});

// <lang><zh-CN>click 仅报告遮罩交互；应用可以选择关闭、忽略或执行其他受控流程。</zh-CN><en>Click reports mask interaction only; the application may choose to close, ignore, or run another controlled flow.</en></lang>
const emit = defineEmits(['click']);

// <lang><zh-CN>显式 visible 值拥有严格优先级；只有省略 visible 时 show 才决定本地树是否存在。</zh-CN><en>An explicit visible value has strict precedence; show determines whether the local tree exists only when visible is omitted.</en></lang>
const isVisible = computed(() => props.visible ?? props.show);

// <lang><zh-CN>透明度限制在可读遮罩范围，避免负值、NaN 或完全不透明意外遮断内容。</zh-CN><en>Opacity is limited to a readable-mask range, preventing negative values, NaN, or accidentally fully opaque content blocking.</en></lang>
const safeOpacity = computed(() => Number.isFinite(props.opacity) ? Math.min(0.92, Math.max(0.08, props.opacity)) : 0.56);

// <lang><zh-CN>layer 只允许有限整数范围，避免把任意 style 或无界层级传播到页面。</zh-CN><en>Layer permits a finite integer range only, preventing arbitrary style or unbounded layering from propagating into a page.</en></lang>
const safeLayer = computed(() => Number.isFinite(props.layer) ? Math.round(Math.min(2000, Math.max(1, props.layer))) : 1000);

// <lang><zh-CN>动态样式仅写组件私有 custom property，CSS 仍拥有定位、表面和层级规则。</zh-CN><en>Dynamic style writes component-private custom properties only; CSS still owns positioning, surface, and layering rules.</en></lang>
const maskStyle = computed(() => ({ '--u-mask-opacity': String(safeOpacity.value), '--u-mask-layer': String(safeLayer.value) }));

/**
 * @lang zh-CN 在 caller 显式启用 clickable 时报告遮罩点击；本函数不改变 visible 或滚动状态。
 * @lang en Reports mask click when the caller explicitly enables clickable; this function changes neither visible nor scroll state.
 * @param {unknown} event <lang><zh-CN>平台提供的原始遮罩点击事件。</zh-CN><en>Original mask-click event supplied by the platform.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `click`。</zh-CN><en>No return value; emits `click` when the guard passes.</en></lang>
 */
function emitClick(event) {
  // <lang><zh-CN>guard 确保不可点击或隐藏遮罩不会借由直接 handler 调用变成关闭机制。</zh-CN><en>The guard ensures a non-clickable or hidden mask cannot become a close mechanism through direct handler calls.</en></lang>
  if (!isVisible.value || !props.clickable) return;

  // <lang><zh-CN>将原始事件交还调用方，由其决定是否产生 close intent。</zh-CN><en>Return the original event to the caller, which decides whether to create close intent.</en></lang>
  emit('click', event);
}
</script>

<style src="./u-mask.css"></style>
