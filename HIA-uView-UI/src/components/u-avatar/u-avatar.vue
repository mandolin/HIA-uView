<!--
@component UAvatar
@lang zh-CN 提供调用方图片或 initials 文字的头像占位；不生成身份、性别、等级或默认 base64 资产。
@lang en Provides a caller-owned image or initials avatar placeholder; it generates no identity, sex, level, or default base64 asset.
-->
<template>
  <view :class="rootClasses" role="img" :aria-label="alt || text" @click="handleClick">
    <UImage
      v-if="src && !hasImageError"
      :src="src"
      :alt="alt"
      :shape="shape"
      :size="safeSize"
      :show-error="false"
      @load="handleImageLoad"
      @error="handleImageError"
    />
    <text v-else class="u-avatar__text">{{ displayText }}</text>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import UImage from '../u-image/u-image.vue';

// <lang><zh-CN>头像只提供可替换的占位呈现，不推断调用方文字对应的真实身份。</zh-CN><en>The avatar provides replaceable placeholder presentation only and infers no real identity from caller text.</en></lang>
defineOptions({ name: 'u-avatar' });

const props = defineProps({
  src: { type: String, default: '' },
  text: { type: String, default: '' },
  alt: { type: String, default: '' },
  shape: { type: String, default: 'circle' },
  size: { type: String, default: 'medium' },
  disabled: { type: Boolean, default: false }
});

// <lang><zh-CN>头像 click 只报告本地 intent，不创建用户详情、导航或身份服务。</zh-CN><en>Avatar click reports local intent only and creates no user detail, navigation, or identity service.</en></lang>
const emit = defineEmits(['click']);
const hasImageError = ref(false);

const safeSize = computed(() => ['small', 'medium', 'large'].includes(props.size) ? props.size : 'medium');
const displayText = computed(() => props.text.trim().slice(0, 2) || '•');
const rootClasses = computed(() => [
  'u-avatar',
  `u-avatar--${safeSize.value}`,
  `u-avatar--${['square', 'rounded', 'circle'].includes(props.shape) ? props.shape : 'circle'}`,
  { 'u-avatar--disabled': props.disabled }
]);

/**
 * @lang zh-CN 在图片成功时清除 fallback 标记；不缓存或保存图片状态。
 * @lang en Clears the fallback marker after image success without caching or storing image state.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleImageLoad() {
  hasImageError.value = false;
}

/**
 * @lang zh-CN 在图片失败时回退到调用方文字，不生成默认资产。
 * @lang en Falls back to caller text after image failure without generating a default asset.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleImageError() {
  hasImageError.value = true;
}

/**
 * @lang zh-CN 报告头像本地 click intent；禁用时保持零事件。
 * @lang en Reports local avatar click intent and retains zero events while disabled.
 * @param {unknown} event <lang><zh-CN>本地点击事件。</zh-CN><en>Local click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleClick(event) {
  if (props.disabled) {
    return;
  }
  emit('click', event);
}
</script>

<style src="./u-avatar.css"></style>
