<!--
@component UCard
@lang zh-CN 提供中性卡片表面、标题和插槽；不读取业务状态或管理卡片集合。
@lang en Provides a neutral card surface, headings, and slots; it reads no business state or manages card collections.
-->
<template>
  <view class="u-card" :class="{ 'u-card--bordered': props.bordered, 'u-card--shadow': props.shadow }" :style="cardStyle">
    <view v-if="props.title || props.subTitle || $slots.header" class="u-card__header">
      <slot name="header">
        <view class="u-card__heading">
          <text v-if="props.title" class="u-card__title">{{ props.title }}</text>
          <text v-if="props.subTitle" class="u-card__subtitle">{{ props.subTitle }}</text>
        </view>
      </slot>
    </view>
    <view class="u-card__body"><slot /></view>
    <view v-if="$slots.footer" class="u-card__footer"><slot name="footer" /></view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>保持 u- 组件名称以降低从既有 uView 卡片的迁移阻力。</zh-CN><en>Retains the u- component name to reduce migration friction from existing uView cards.</en></lang>
defineOptions({ name: 'u-card' });

// <lang><zh-CN>卡片输入仅描述表面与文字，padding 由组件限制为有限本地尺寸。</zh-CN><en>Card inputs describe surface and text only; padding is bounded to a finite local size.</en></lang>
const props = defineProps({
  title: { type: String, default: '' },
  subTitle: { type: String, default: '' },
  bordered: { type: Boolean, default: true },
  shadow: { type: Boolean, default: false },
  padding: { type: Number, default: 16 }
});

// <lang><zh-CN>把 padding 收敛到安全范围，避免调用方把任意 CSS 字符串注入组件样式。</zh-CN><en>Converges padding to a safe range so callers cannot inject arbitrary CSS strings into component styles.</en></lang>
const safePadding = computed(() => Number.isFinite(props.padding) ? Math.min(64, Math.max(0, props.padding)) : 16);
const cardStyle = computed(() => ({ '--u-card-padding': `${safePadding.value}px` }));
</script>

<style src="./u-card.css"></style>
