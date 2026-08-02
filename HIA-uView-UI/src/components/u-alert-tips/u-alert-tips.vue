<!--
@component UAlertTips
@lang zh-CN 呈现调用方控制的提示条并报告 close intent；不创建全局 toast、定时器或服务。
@lang en Presents a caller-controlled alert strip and reports close intent; it creates no global toast, timer, or service.
-->
<template>
  <view v-if="props.show" class="u-alert-tips" :class="`u-alert-tips--${safeType}`" role="status">
    <view class="u-alert-tips__body">
      <text v-if="props.title" class="u-alert-tips__title">{{ props.title }}</text>
      <text v-if="props.description" class="u-alert-tips__description">{{ props.description }}</text>
      <slot />
    </view>
    <button v-if="props.closable" class="u-alert-tips__close" type="button" aria-label="Close / 关闭" @click="handleClose">×</button>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>使用与迁移友好的 u- 名称；显示完全由调用方控制。</zh-CN><en>Uses a migration-friendly u- name; visibility remains fully caller-controlled.</en></lang>
defineOptions({ name: 'u-alert-tips' });

// <lang><zh-CN>提示类型是有限视觉语义，不映射行业状态或远程错误码。</zh-CN><en>Alert type is a finite visual semantic and does not map industry state or remote error codes.</en></lang>
const props = defineProps({ show: { type: Boolean, default: true }, type: { type: String, default: 'primary' }, title: { type: String, default: '' }, description: { type: String, default: '' }, closable: { type: Boolean, default: false } });
const emit = defineEmits(['close']);
const alertTypes = Object.freeze(['primary', 'success', 'warning', 'error']);
const safeType = computed(() => alertTypes.includes(props.type) ? props.type : 'primary');

/**
 * @lang zh-CN 只报告关闭意图，是否隐藏由调用方更新 show 决定。
 * @lang en Reports close intent only; the caller decides whether to hide it by updating show.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleClose() {
  emit('close');
}
</script>

<style src="./u-alert-tips.css"></style>
