<!--
@component UDivider
@lang zh-CN 提供局部水平/垂直分隔和可选文字 slot；不推断页面层级或业务语义。
@lang en Provides local horizontal/vertical separation and optional text slot; it infers no page hierarchy or business meaning.
-->
<template>
  <view :class="rootClasses" role="separator">
    <view class="u-divider__line" />
    <text v-if="text || hasSlot" class="u-divider__text">{{ text }}<slot /></text>
    <view class="u-divider__line" />
  </view>
</template>

<script setup>
import { computed, useSlots } from 'vue';

// <lang><zh-CN>分隔线只消费有限方向和 tone，不创建动态布局服务。</zh-CN><en>The divider consumes finite direction and tone only and creates no dynamic layout service.</en></lang>
defineOptions({ name: 'u-divider' });

const props = defineProps({
  direction: { type: String, default: 'horizontal' },
  tone: { type: String, default: 'neutral' },
  text: { type: String, default: '' }
});
const slots = useSlots();
const hasSlot = computed(() => Boolean(slots.default));
const rootClasses = computed(() => {
  const direction = ['horizontal', 'vertical'].includes(props.direction) ? props.direction : 'horizontal';
  const tone = ['neutral', 'primary', 'accent'].includes(props.tone) ? props.tone : 'neutral';
  return ['u-divider', `u-divider--${direction}`, `u-divider--${tone}`];
});
</script>

<style src="./u-divider.css"></style>
