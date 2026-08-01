<!--
@component USwiper
@lang zh-CN 提供有限 slides 的静态当前项、prev/next 与 select intent；不使用原生 swiper、自动轮播、timer、媒体加载或远程源。
@lang en Provides a static current slide, prev/next, and select intent for finite slides; it uses no native swiper, autoplay, timer, media loading, or remote source.
-->
<template>
  <view class="u-swiper" role="region" :aria-label="ariaLabel || undefined">
    <view v-if="currentSlide" class="u-swiper__slide" @click="handleSelect">
      <text class="u-swiper__label">{{ currentSlide.label }}</text>
      <text v-if="currentSlide.description" class="u-swiper__description">{{ currentSlide.description }}</text>
      <slot :item="currentSlide" :index="safeIndex" />
    </view>
    <view v-else class="u-swiper__empty"><slot /></view>
    <view v-if="slides.length > 1" class="u-swiper__controls">
      <button type="button" :disabled="safeIndex === 0" @click="handlePrevious">上一项 / Previous</button>
      <text class="u-swiper__position">{{ safeIndex + 1 }} / {{ slides.length }}</text>
      <button type="button" :disabled="safeIndex === slides.length - 1" @click="handleNext">下一项 / Next</button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>声明稳定名称；当前实现把 swiper 降级为 caller-owned 静态 slide deck。</zh-CN><en>Declares a stable name; the current implementation degrades swiper to a caller-owned static slide deck.</en></lang>
defineOptions({ name: 'u-swiper' });

const props = defineProps({
  items: { type: Array, default: () => [] },
  modelValue: { type: Number, default: 0 },
  ariaLabel: { type: String, default: '' }
});

// <lang><zh-CN>update/change/select 都是本地 intent；组件不自动播放或写回当前项。</zh-CN><en>Update/change/select are local intents only; the component neither autoplays nor writes back the current item.</en></lang>
const emit = defineEmits(['update:modelValue', 'change', 'select']);

const slides = computed(() => props.items.map((item, index) => {
  const source = typeof item === 'string' ? { label: item } : (item || {});
  return {
    key: `${String(source.value ?? source.label ?? index)}-${index}`,
    label: String(source.label ?? source.title ?? ''),
    description: String(source.description ?? source.desc ?? ''),
    value: String(source.value ?? '')
  };
}).filter((item) => item.label.length > 0));

const safeIndex = computed(() => slides.value.length === 0
  ? 0
  : Math.min(slides.value.length - 1, Math.max(0, Math.trunc(props.modelValue))));
const currentSlide = computed(() => slides.value[safeIndex.value] || null);

function changeTo(index) {
  if (index < 0 || index >= slides.value.length || index === safeIndex.value) return;
  emit('update:modelValue', index);
  emit('change', { index, value: slides.value[index].value });
}

/**
 * @lang zh-CN 报告显式上一项意图；不循环、不动画、不启动定时器。
 * @lang en Reports an explicit previous-slide intent; it does not wrap, animate, or start a timer.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handlePrevious() {
  changeTo(safeIndex.value - 1);
}

/**
 * @lang zh-CN 报告显式下一项意图；不循环、不加载媒体或请求数据。
 * @lang en Reports an explicit next-slide intent; it does not wrap, load media, or request data.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleNext() {
  changeTo(safeIndex.value + 1);
}

function handleSelect() {
  if (currentSlide.value) emit('select', { index: safeIndex.value, value: currentSlide.value.value });
}
</script>

<style src="./u-swiper.css"></style>
