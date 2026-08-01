<!--
@component USticky
@lang zh-CN 提供 CSS position: sticky 的局部 slot 投影与声明式 offset；不使用 observer、DOM 测量、平台嗅探或 fixed fallback。
@lang en Provides a local slot projection using CSS position: sticky and declarative offset; it uses no observer, DOM measurement, platform sniffing, or fixed fallback.
-->
<template>
  <view class="u-sticky" :class="{ 'u-sticky--disabled': disabled }" :style="stickyStyle">
    <slot />
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>声明稳定名称；吸顶能力由调用方和目标平台对 CSS sticky 的支持共同决定。</zh-CN><en>Declares a stable name; sticky behavior depends on caller usage and target-platform support for CSS sticky.</en></lang>
defineOptions({ name: 'u-sticky' });

const props = defineProps({
  offsetTop: { type: [String, Number], default: 0 },
  zIndex: { type: [String, Number], default: 1 },
  disabled: { type: Boolean, default: false }
});

const stickyStyle = computed(() => props.disabled ? {} : {
  top: typeof props.offsetTop === 'number' ? `${props.offsetTop}px` : props.offsetTop,
  zIndex: String(props.zIndex)
});
</script>

<style src="./u-sticky.css"></style>
