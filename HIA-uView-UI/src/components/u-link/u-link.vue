<!--
@component ULink
@lang zh-CN 提供无路由语义的文字链接样式和 click intent；不接受 href、不发起导航。
@lang en Provides link-like text styling and click intent without route semantics; it accepts no href and performs no navigation.
-->
<template>
  <text class="u-link" :class="{ 'u-link--underlined': props.underlined, 'u-link--disabled': props.disabled }" :style="linkStyle" role="link" :aria-disabled="props.disabled" @click="handleClick">
    <slot>{{ props.text }}</slot>
  </text>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>保持 u- 命名，迁移时仍由应用自行决定路由或打开行为。</zh-CN><en>Retains the u- naming while the application decides routing or opening behavior during migration.</en></lang>
defineOptions({ name: 'u-link' });

// <lang><zh-CN>链接只描述文字呈现和局部禁用状态，不暴露 href、router 或网络能力。</zh-CN><en>The link describes text presentation and local disabled state only and exposes no href, router, or network capability.</en></lang>
const props = defineProps({ text: { type: String, default: '' }, color: { type: String, default: '' }, underlined: { type: Boolean, default: false }, disabled: { type: Boolean, default: false } });
const emit = defineEmits(['click']);

// <lang><zh-CN>空颜色回退到主题 token；非空颜色由调用方负责提供可审计的 CSS 值。</zh-CN><en>Empty color falls back to a theme token; callers own the auditability of any non-empty CSS value.</en></lang>
const linkStyle = computed(() => ({ color: props.color || 'var(--u-comp-link-foreground)' }));

/**
 * @lang zh-CN 只报告局部 click intent，不执行导航。
 * @lang en Reports local click intent only and performs no navigation.
 * @param {Event} event <lang><zh-CN>点击事件。</zh-CN><en>Click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleClick(event) {
  if (props.disabled) return;
  emit('click', event);
}
</script>

<style src="./u-link.css"></style>
