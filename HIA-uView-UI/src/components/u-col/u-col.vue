<!--
@component UCol
@lang zh-CN 提供 24 栅格列布局和本地 click intent；它不读取 row context、不测量 DOM，也不拥有导航。
@lang en Provides 24-grid column layout and local click intent; it reads no row context, measures no DOM, and owns no navigation.
-->
<template>
  <view class="u-col" :style="columnStyle" @click="handleClick">
    <slot />
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>保持 u- 模板名称，使既有 uView 使用者可以按名称迁移。</zh-CN><en>Retains the u- template name so existing uView users can migrate by name.</en></lang>
defineOptions({ name: 'u-col' });

// <lang><zh-CN>声明列宽、偏移和局部对齐；这些值只影响当前列的 CSS 几何。</zh-CN><en>Declares column span, offset, and local alignment; these values affect only the current column's CSS geometry.</en></lang>
const props = defineProps({
  span: { type: Number, default: 24 },
  offset: { type: Number, default: 0 },
  align: { type: String, default: 'stretch' },
  justify: { type: String, default: 'flex-start' }
});

// <lang><zh-CN>只允许受控 flex 对齐值，避免将任意 CSS token 作为运行时协议传播。</zh-CN><en>Allows controlled flex-alignment values only, preventing arbitrary CSS tokens from becoming a runtime protocol.</en></lang>
const alignValues = Object.freeze(['stretch', 'flex-start', 'center', 'flex-end', 'baseline']);
const justifyValues = Object.freeze(['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly']);

// <lang><zh-CN>把 span 和 offset 限制在 24 栅格范围，保证布局计算始终有限。</zh-CN><en>Bounds span and offset to the 24-grid range so layout calculation remains finite.</en></lang>
const safeSpan = computed(() => Number.isFinite(props.span) ? Math.min(24, Math.max(1, Math.floor(props.span))) : 24);
const safeOffset = computed(() => Number.isFinite(props.offset) ? Math.min(23, Math.max(0, Math.floor(props.offset))) : 0);

// <lang><zh-CN>输出 CSS 自定义属性而非修改调用方传入的样式对象；列组件不执行测量或平台判断。</zh-CN><en>Outputs CSS custom properties instead of mutating caller styles; the column performs no measurement or platform check.</en></lang>
const columnStyle = computed(() => ({
  '--u-col-span': safeSpan.value,
  '--u-col-offset': safeOffset.value,
  '--u-col-align': alignValues.includes(props.align) ? props.align : 'stretch',
  '--u-col-justify': justifyValues.includes(props.justify) ? props.justify : 'flex-start'
}));

const emit = defineEmits(['click']);

/**
 * @lang zh-CN 将列点击报告为局部 intent；导航、提交和业务动作仍由调用方决定。
 * @lang en Reports a column click as a local intent; the caller still decides navigation, submission, and business action.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleClick(event) {
  emit('click', event);
}
</script>

<style src="./u-col.css"></style>
