<!--
@component UIndexAnchor
@lang zh-CN 呈现调用方提供的单个有限索引锚点和本地选择意图；不读取滚动位置、不测量锚点，也不控制平台 scroll-view。
@lang en Presents one caller-provided finite index anchor and local selection intent; it reads no scroll position, measures no anchor, and controls no platform scroll-view.
-->
<template>
  <!-- @lang zh-CN 有可读 label 的锚点才生成 button；active 只表达 caller 当前选择，不代表实际滚动位置。
  @lang en An anchor with a readable label alone renders a button; active expresses caller current selection only and does not represent actual scroll position.
  <lang><zh-CN>disabled 锚点保持可见但不产生 select，避免呈现层伪造索引导航。</zh-CN><en>A disabled anchor remains visible but produces no select, avoiding presentation-layer fabrication of index navigation.</en></lang> -->
  <button v-if="label" :class="rootClasses" type="button" :disabled="disabled" :aria-current="active ? 'true' : undefined" @click="handleSelect"><text class="u-index-anchor__label">{{ label }}</text><slot :value="value" :active="active" /></button>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称提供迁移可发现的局部锚点，而不建立滚动容器或全局索引服务。</zh-CN><en>The stable name provides a migration-discoverable local anchor and creates neither a scroll container nor a global index service.</en></lang>
defineOptions({ name: 'u-index-anchor' });

// <lang><zh-CN>文字、值、active 与可用性均由 caller 拥有；组件不生成默认字母、城市或行业分组。</zh-CN><en>Copy, value, active state, and availability are caller-owned; the component generates no default alphabet, city, or industry grouping.</en></lang>
const props = defineProps({ label: { type: String, default: '' }, value: { type: [String, Number], default: '' }, active: { type: Boolean, default: false }, disabled: { type: Boolean, default: false } });

// <lang><zh-CN>select 只报告锚点的透明局部 intent；caller 决定任何实际滚动或 active writeback。</zh-CN><en>Select reports the anchor's transparent local intent only; the caller decides any actual scroll or active writeback.</en></lang>
const emit = defineEmits(['select']);

// <lang><zh-CN>固定 class 仅由有限布尔状态组成，避免 caller 文字进入 CSS 命名空间。</zh-CN><en>Fixed classes consist only of finite boolean state, preventing caller copy from entering the CSS namespace.</en></lang>
const rootClasses = computed(() => ['u-index-anchor', { 'u-index-anchor--active': props.active, 'u-index-anchor--disabled': props.disabled }]);

/**
 * @lang zh-CN 报告已启用锚点的选择意图；不调用 scroll API 或修改 caller props。
 * @lang en Reports selection intent of an enabled anchor; it calls no scroll API and changes no caller prop.
 * @returns {void} <lang><zh-CN>无返回值；可用时 emit `select`。</zh-CN><en>No return value; emits `select` when enabled.</en></lang>
 */
function handleSelect() {
  // <lang><zh-CN>guard 使直接调用与原生 disabled 行为保持一致。</zh-CN><en>The guard keeps direct invocation consistent with native disabled behavior.</en></lang>
  if (props.disabled || !props.label.trim()) return;
  emit('select', { value: props.value, label: props.label });
}
</script>

<style src="./u-index-anchor.css"></style>
