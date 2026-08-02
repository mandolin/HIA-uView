<!--
@component URow
@lang zh-CN 提供受控的横向 flex 行布局；它不测量 DOM、不读取页面状态，也不拥有业务子项。
@lang en Provides controlled horizontal flex-row layout; it measures no DOM, reads no page state, and owns no business items.
-->
<template>
  <view class="u-row" :class="{ 'u-row--nowrap': !props.wrap }" :style="rowStyle">
    <slot />
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>使用稳定组件名称，保证模板调试和显式导出都保留 u- 生态命名。</zh-CN><en>Uses a stable component name so template debugging and explicit exports retain the u-ecosystem naming.</en></lang>
defineOptions({ name: 'u-row' });

// <lang><zh-CN>声明行布局的有限输入；gutter 只表示本地 CSS 间距，不表示网络或业务分页。</zh-CN><en>Declares finite row-layout inputs; gutter represents local CSS spacing only, not network or business pagination.</en></lang>
const props = defineProps({
  gutter: { type: Number, default: 0 },
  wrap: { type: Boolean, default: true },
  align: { type: String, default: 'stretch' },
  justify: { type: String, default: 'flex-start' }
});

// <lang><zh-CN>限制 CSS flex 值，避免调用方把任意运行时字符串扩散到布局声明。</zh-CN><en>Bounds CSS flex values so arbitrary runtime strings do not spread into layout declarations.</en></lang>
const alignValues = Object.freeze(['stretch', 'flex-start', 'center', 'flex-end', 'baseline']);
const justifyValues = Object.freeze(['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly']);

// <lang><zh-CN>将非法或过大的间距收敛到可预测的本地 CSS 尺寸。</zh-CN><en>Converges invalid or excessive spacing to a predictable local CSS size.</en></lang>
const safeGutter = computed(() => Number.isFinite(props.gutter) ? Math.min(64, Math.max(0, props.gutter)) : 0);

// <lang><zh-CN>把受控值投影为行样式；组件不修改外部对象，也不执行平台查询。</zh-CN><en>Projects controlled values into row styles; the component mutates no external object and performs no platform query.</en></lang>
const rowStyle = computed(() => ({
  '--u-row-gutter': `${safeGutter.value}px`,
  '--u-row-align': alignValues.includes(props.align) ? props.align : 'stretch',
  '--u-row-justify': justifyValues.includes(props.justify) ? props.justify : 'flex-start'
}));
</script>

<style src="./u-row.css"></style>
