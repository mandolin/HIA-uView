<!--
@component UText
@lang zh-CN 提供有限 tone、尺寸和行数的调用方文本呈现与本地 click 意图；不解析 HTML、富文本、远程内容或外部资产。
@lang en Provides finite tone, size, line-count caller-text presentation, and local click intent; it parses no HTML, rich text, remote content, or external asset.
-->
<template>
  <!--
  @lang zh-CN 文本根仅在调用方 `show` 为真时投影，保留默认 slot 对文字内容的优先级。
  @lang en The text root projects only while caller `show` is true and retains default-slot precedence for text content.
  <lang><zh-CN>click 只回传本地意图；组件不选择、复制、导航、解析富文本或改变调用方文字。</zh-CN><en>Click returns local intent only; the component neither selects, copies, routes, parses rich text, nor changes caller copy.</en></lang>
  -->
  <text
    v-if="show"
    class="u-text"
    :class="`u-text--${safeType} u-text--${safeSize}`"
    :style="textStyle"
    @click="handleClick"
  ><slot>{{ text }}</slot></text>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>保持稳定的 u-text 名称，使模板、manifest 和显式 plugin registry 使用同一运行时名称；文字语义仍由调用方控制。</zh-CN><en>Retains the stable u-text name so templates, the manifest, and explicit plugin registry use one runtime name; text meaning remains caller-controlled.</en></lang>
defineOptions({ name: 'u-text' });

// <lang><zh-CN>文本只接收有限视觉 token、调用方文字与可见性；不接收 HTML、富文本、远程来源、任意样式或业务状态。</zh-CN><en>The text accepts only finite visual tokens, caller copy, and visibility; it accepts no HTML, rich text, remote source, arbitrary style, or business state.</en></lang>
const props = defineProps({
  // <lang><zh-CN>`show` 仅控制本实例是否投影；父级拥有页面条件、数据事实和后续状态。</zh-CN><en>`show` controls only whether this instance projects; the parent owns page conditions, data facts, and subsequent state.</en></lang>
  show: {
    type: Boolean,
    default: true
  },
  // <lang><zh-CN>`text` 接受字符串或数字以保持迁移时的有限原始值；模板和 Vue 保持调用方实际显示值，不作数值计算。</zh-CN><en>`text` accepts string or number to retain a bounded original value during migration; the template and Vue retain the caller display value without numeric calculation.</en></lang>
  text: {
    type: [String, Number],
    default: ''
  },
  // <lang><zh-CN>`type` 选择有限色彩 token，不接受任意 CSS 类或原始色值。</zh-CN><en>`type` selects a finite color token and accepts no arbitrary CSS class or raw color.</en></lang>
  type: {
    type: String,
    default: 'primary'
  },
  // <lang><zh-CN>`size` 选择有限排版尺寸，不测量内容或 viewport。</zh-CN><en>`size` selects a finite typography size and measures neither content nor viewport.</en></lang>
  size: {
    type: String,
    default: 'md'
  },
  // <lang><zh-CN>`lines` 只作为 CSS 截断上限候选，由本地计算受限到 0–6。</zh-CN><en>`lines` is only a CSS-clamp candidate and is locally bounded to 0–6.</en></lang>
  lines: {
    type: Number,
    default: 0
  },
  // <lang><zh-CN>`ellipsis` 保留既有有限外观入口；当前 CSS 截断仍由受限 lines 驱动，组件不裁剪或重写文本。</zh-CN><en>`ellipsis` retains the existing bounded appearance entry; current CSS clamping remains driven by bounded lines and the component neither truncates nor rewrites text.</en></lang>
  ellipsis: {
    type: Boolean,
    default: false
  }
});

// <lang><zh-CN>唯一公开事件只报告原始本地 click；应用在组件外拥有选择、复制、导航与文字状态变化。</zh-CN><en>The sole public event reports only original local click; the application owns selection, copying, routing, and text-state changes outside the component.</en></lang>
const emit = defineEmits(['click']);

// <lang><zh-CN>允许的 tone 集合冻结为内部常量，防止调用方值扩展为未审计的样式表面。</zh-CN><en>The allowed tone set is frozen as an internal constant, preventing caller values from expanding into an unaudited styling surface.</en></lang>
const types = Object.freeze(['primary', 'secondary', 'success', 'warning', 'danger']);

// <lang><zh-CN>允许的尺寸集合冻结为内部常量，确保模板只形成已文档化的 token 类。</zh-CN><en>The allowed size set is frozen as an internal constant, ensuring the template forms only documented token classes.</en></lang>
const sizes = Object.freeze(['sm', 'md', 'lg']);

// <lang><zh-CN>未知 tone 回退为 primary，避免原始调用方字符串进入类名。</zh-CN><en>An unknown tone falls back to primary, preventing raw caller strings from entering class names.</en></lang>
const safeType = computed(() => types.includes(props.type) ? props.type : 'primary');

// <lang><zh-CN>未知尺寸回退为 md，保持受限文本密度且不影响父布局。</zh-CN><en>An unknown size falls back to md, retaining bounded text density without affecting parent layout.</en></lang>
const safeSize = computed(() => sizes.includes(props.size) ? props.size : 'md');

// <lang><zh-CN>行数仅接受有限整数并裁剪到 0–6；NaN、无穷和负数都稳定回退为不截断。</zh-CN><en>Line count accepts only a finite integer and clamps it to 0–6; NaN, infinity, and negative values stably fall back to no clamp.</en></lang>
const safeLines = computed(() => Number.isFinite(props.lines) ? Math.min(6, Math.max(0, Math.floor(props.lines))) : 0);

// <lang><zh-CN>局部 CSS 变量只携带受限行数或 `none`，不允许任意调用方 style 注入。</zh-CN><en>The local CSS variable carries only bounded line count or `none`, allowing no arbitrary caller style injection.</en></lang>
const textStyle = computed(() => ({ '--u-text-lines': safeLines.value || 'none' }));

/**
 * @lang zh-CN 转发文本根的原始本地 click 意图；不选择、复制、导航、修改文字或解释业务动作。
 * @lang en Forwards original local click intent from the text root; it selects nothing, copies nothing, routes nowhere, changes no text, and interprets no business action.
 * @param {unknown} event <lang><zh-CN>文本根提供的本地点击事件。</zh-CN><en>Local click event supplied by the text root.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；emit 原始 `click`。</zh-CN><en>No return value; emits original `click`.</en></lang>
 */
function handleClick(event) {
  // <lang><zh-CN>事件按原样交给调用方，保持组件为无状态文字呈现而非交互流程 owner。</zh-CN><en>The event is returned unchanged to the caller, keeping the component as stateless text presentation rather than an interaction-flow owner.</en></lang>
  emit('click', event);
}
</script>

<style src="./u-text.css"></style>
