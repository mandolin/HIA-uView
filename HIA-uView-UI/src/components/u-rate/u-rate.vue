<!--
@component URate
@lang zh-CN 提供受控整数分级选择；组件使用文本符号作为无资产默认呈现，不执行评价提交、统计或业务解释。
@lang en Provides controlled integer rating selection; the component uses text symbols as an asset-free default and performs no review submission, analytics, or business interpretation.
-->
<template>
  <view :class="rootClasses" role="group">
    <button
      v-for="position in safeCount"
      :key="position"
      class="u-rate__item"
      :class="{ 'u-rate__item--active': position <= displayValue }"
      :disabled="disabled"
      type="button"
      @click="select(position)"
    >
      {{ position <= displayValue ? activeSymbol : inactiveSymbol }}
    </button>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>使用熟悉的 `u-rate` 名称，不引入图标组件、字体或图片资产。</zh-CN><en>Uses the familiar `u-rate` name without importing an icon component, font, or image asset.</en></lang>
defineOptions({ name: 'u-rate' });

// <lang><zh-CN>分级范围和符号由调用方声明；组件不把数字解释为评分模型。</zh-CN><en>Range and symbols are caller-declared; the component does not interpret the number as a rating model.</en></lang>
const props = defineProps({
  modelValue: { type: Number, default: 0 },
  count: { type: Number, default: 5 },
  disabled: { type: Boolean, default: false },
  activeSymbol: { type: String, default: '★' },
  inactiveSymbol: { type: String, default: '☆' }
});

// <lang><zh-CN>事件回传整数选择意图；调用方决定是否保存、提交或拒绝该值。</zh-CN><en>Events return integer-selection intent; the caller decides whether to save, submit, or reject the value.</en></lang>
const emit = defineEmits(['update:modelValue', 'input', 'change']);

/**
 * @lang zh-CN 将组件 count 收紧为至少一个有限整数，避免模板循环依赖异常数据。
 * @lang en Narrows count to at least one finite integer so template iteration does not depend on invalid data.
 * @returns {number} <lang><zh-CN>可渲染的分级数量。</zh-CN><en>Renderable rating count.</en></lang>
 */
const safeCount = computed(() => {
  // <lang><zh-CN>向下取整只服务通用展示几何，不生成业务精度或半星语义。</zh-CN><en>Flooring serves generic presentation geometry only and creates no business precision or half-star meaning.</en></lang>
  return Number.isFinite(props.count) && props.count > 0 ? Math.floor(props.count) : 1;
});

// <lang><zh-CN>显示值限制到 0 与 count 之间；它不改变 modelValue 或向调用方写回。</zh-CN><en>Display value is bounded between zero and count; it changes neither modelValue nor caller state.</en></lang>
const displayValue = computed(() => {
  // <lang><zh-CN>有限数字才可比较，异常值按零呈现而不猜测业务默认评分。</zh-CN><en>Only finite numbers are comparable; invalid values present as zero without guessing a business default.</en></lang>
  const candidate = Number.isFinite(props.modelValue) ? Math.floor(props.modelValue) : 0;
  return Math.min(safeCount.value, Math.max(0, candidate));
});

// <lang><zh-CN>根类反映 disabled，供非颜色视觉呈现使用。</zh-CN><en>Root class reflects disabled for non-color visual presentation.</en></lang>
const rootClasses = computed(() => ['u-rate', { 'u-rate--disabled': props.disabled }]);

/**
 * @lang zh-CN 处理一个位置选择并报告其整数值；禁用状态保持零事件。
 * @lang en Handles one position selection and reports its integer value; disabled state retains zero events.
 * @param {number} position <lang><zh-CN>模板产生的 1-based 位置。</zh-CN><en>One-based position produced by the template.</en></param>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function select(position) {
  // <lang><zh-CN>禁用 guard 使直接调用与原生 disabled 属性保持相同语义。</zh-CN><en>The disabled guard gives direct calls the same semantics as the native disabled attribute.</en></lang>
  if (props.disabled) {
    return;
  }

  // <lang><zh-CN>位置来自有限模板循环，因此只需再次限制到 safeCount 以防未来调用方传入异常值。</zh-CN><en>The position comes from a finite template loop, so it is bounded again to safeCount for future direct callers.</en></lang>
  const nextValue = Math.min(safeCount.value, Math.max(1, Math.floor(position)));
  emit('update:modelValue', nextValue);
  emit('input', nextValue);
  emit('change', nextValue);
}
</script>

<style src="./u-rate.css"></style>
