<!--
@component USteps
@lang zh-CN 提供调用方声明的有限步骤序列与 current/status 呈现；不自动推进、不执行流程、不请求或提交。
@lang en Provides a caller-declared finite step sequence with current/status presentation; it does not advance, execute flows, request, or submit.
-->
<template>
  <view :class="rootClasses" role="list">
    <view v-for="(item, index) in safeSteps" :key="item.key" class="u-steps__item" role="listitem">
      <view class="u-steps__indicator" :class="`u-steps__indicator--${item.status}`"><text>{{ index + 1 }}</text></view>
      <view class="u-steps__body">
        <text class="u-steps__label">{{ item.label }}</text>
        <text v-if="item.description" class="u-steps__description">{{ item.description }}</text>
      </view>
      <view v-if="index < safeSteps.length - 1" class="u-steps__line" />
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>steps 只把调用方 current 与有限 status 映射为视觉序列，不拥有业务流程状态机。</zh-CN><en>Steps maps caller current and finite status to a visual sequence only and owns no business-flow state machine.</en></lang>
defineOptions({ name: 'u-steps' });

const props = defineProps({
  current: { type: Number, default: 0 },
  direction: { type: String, default: 'horizontal' },
  steps: { type: Array, default: () => [] }
});
const safeSteps = computed(() => props.steps.map((step, index) => {
  const source = typeof step === 'string' ? { label: step } : (step || {});
  const explicitStatus = ['wait', 'process', 'finish', 'error'].includes(source.status) ? source.status : '';
  const status = explicitStatus || (index < props.current ? 'finish' : index === props.current ? 'process' : 'wait');
  return {
    key: `${String(source.label ?? index)}-${index}`,
    label: String(source.label ?? source.title ?? ''),
    description: String(source.description ?? source.desc ?? ''),
    status
  };
}).filter((item) => item.label.length > 0));
const rootClasses = computed(() => {
  const direction = ['horizontal', 'vertical'].includes(props.direction) ? props.direction : 'horizontal';
  return ['u-steps', `u-steps--${direction}`];
});
</script>

<style src="./u-steps.css"></style>
