<!--
@component USlider
@lang zh-CN 提供受边界保护的本地数值滑块；不解释价格、库存或任务进度。
@lang en Provides a bounded local numeric slider; it interprets no price, inventory, or task progress.
-->
<template>
  <view class="u-slider" :class="{ 'u-slider--disabled': props.disabled }">
    <text v-if="props.showValue" class="u-slider__value">{{ safeValue }}</text>
    <slider class="u-slider__control" :value="safeValue" :min="safeMin" :max="safeMax" :step="safeStep" :disabled="props.disabled" :show-value="false" @change="handleChange" />
    <slot />
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>使用 u- 名称并保持滑块为局部受控输入。</zh-CN><en>Uses the u- name and keeps the slider as a local controlled input.</en></lang>
defineOptions({ name: 'u-slider' });

// <lang><zh-CN>数值边界是有限本地协议，不启动校验、持久化或远程同步。</zh-CN><en>Numeric bounds are a finite local protocol with no validation, persistence, or remote synchronization.</en></lang>
const props = defineProps({
  modelValue: { type: Number, default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  showValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
});
const emit = defineEmits(['update:modelValue', 'change']);

// <lang><zh-CN>先校正范围再投影当前值，保证平台 slider 始终收到合法数字。</zh-CN><en>Normalizes the range before projecting the current value so the platform slider always receives legal numbers.</en></lang>
const safeMin = computed(() => Number.isFinite(props.min) ? props.min : 0);
const safeMax = computed(() => Number.isFinite(props.max) ? Math.max(safeMin.value, props.max) : Math.max(safeMin.value, 100));
const safeStep = computed(() => Number.isFinite(props.step) && props.step > 0 ? props.step : 1);
const safeValue = computed(() => Number.isFinite(props.modelValue) ? Math.min(safeMax.value, Math.max(safeMin.value, props.modelValue)) : safeMin.value);

/**
 * @lang zh-CN 将平台 change 值 clamp 到有限范围并报告受控事件。
 * @lang en Clamps the platform change value to the finite range and reports controlled events.
 * @param {{detail?: {value?: number}}} event <lang><zh-CN>平台滑块事件。</zh-CN><en>Platform slider event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleChange(event) {
  const rawValue = Number(event?.detail?.value ?? event?.target?.value ?? safeValue.value);
  const nextValue = Number.isFinite(rawValue) ? Math.min(safeMax.value, Math.max(safeMin.value, rawValue)) : safeValue.value;
  emit('update:modelValue', nextValue);
  emit('change', nextValue);
}
</script>

<style src="./u-slider.css"></style>
