<!--
@component URootPortal
@lang zh-CN 提供同一组件树内的受控 overlay-root wrapper；它保留调用方 slot 与有限 layer，但不使用 Teleport、跨根重挂、页面根 mutation 或全局 portal service。
@lang en Provides a controlled overlay-root wrapper inside the same component tree; it retains caller slot and finite layer but uses no Teleport, cross-root relocation, page-root mutation, or global portal service.
-->
<template>
  <!-- @lang zh-CN 受控模板呈现说明如下。
  @lang en Controlled template-presentation explanation follows.
  <lang><zh-CN>visible 控制同树 portal wrapper；layer 已收束为有限整数，slot 内容完全属于 caller。</zh-CN><en>Visible controls the same-tree portal wrapper; layer is constrained to a finite integer and slot content belongs entirely to the caller.</en></lang> -->
  <view v-if="visible" class="u-root-portal" :style="portalStyle"><slot /></view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称声明受控同树降级，而非承诺跨端 Teleport 兼容。</zh-CN><en>The stable name declares a controlled same-tree fallback rather than promising cross-platform Teleport compatibility.</en></lang>
defineOptions({ name: 'u-root-portal' });

// <lang><zh-CN>调用方拥有 visible 和有限 layer；默认隐藏避免隐式 overlay root。</zh-CN><en>The caller owns visible and finite layer; the hidden default avoids an implicit overlay root.</en></lang>
const props = defineProps({ visible: { type: Boolean, default: false }, layer: { type: Number, default: 1200 } });

// <lang><zh-CN>layer 限制在独立 portal 范围，避免任意/无界 stacking input 进入页面。</zh-CN><en>Layer is limited to an independent portal range, preventing arbitrary or unbounded stacking input from entering a page.</en></lang>
const safeLayer = computed(() => Number.isFinite(props.layer) ? Math.round(Math.min(2400, Math.max(1, props.layer))) : 1200);

// <lang><zh-CN>动态 style 只写组件私有 layer property；CSS 仍拥有 local positioning 声明。</zh-CN><en>Dynamic style writes a component-private layer property only; CSS still owns the local positioning declaration.</en></lang>
const portalStyle = computed(() => ({ '--u-root-portal-layer': String(safeLayer.value) }));
</script>

<style src="./u-root-portal.css"></style>
