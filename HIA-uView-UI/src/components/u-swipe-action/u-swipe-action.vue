<!--
@component USwipeAction
@lang zh-CN 提供局部操作槽投影并报告 action/close intent；不执行删除、提交或持久化。
@lang en Provides a local action-slot projection and reports action/close intent; it executes no deletion, submission, or persistence.
-->
<template><view class="u-swipe-action" :class="{ 'u-swipe-action--open': props.open, 'u-swipe-action--disabled': props.disabled }"><view class="u-swipe-action__content"><slot /></view><view v-if="props.open" class="u-swipe-action__actions"><button v-for="action in safeActions" :key="action.key" class="u-swipe-action__action" :class="`u-swipe-action__action--${action.type}`" type="button" :disabled="props.disabled || action.disabled" @click="handleAction(action)">{{ action.label }}</button><button class="u-swipe-action__close" type="button" :disabled="props.disabled" @click="close">{{ props.closeText }}</button></view></view></template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>保持 u- 名称，当前实现采用显式操作槽而非平台手势或动画。</zh-CN><en>Retains the u- name; this implementation uses explicit action slots rather than platform gestures or animation.</en></lang>
defineOptions({ name: 'u-swipe-action' });

// <lang><zh-CN>actions 只描述有限文字操作，不绑定删除、路由或数据写入。</zh-CN><en>Actions describe finite text operations only and bind to no deletion, route, or data write.</en></lang>
const props = defineProps({ open: { type: Boolean, default: false }, actions: { type: Array, default: () => [] }, closeText: { type: String, default: 'Close / 关闭' }, disabled: { type: Boolean, default: false } });
const emit = defineEmits(['action', 'close', 'update:open']);

// <lang><zh-CN>复制并限制 action 的可消费字段，避免把任意对象传入按钮呈现。</zh-CN><en>Copies and bounds consumable action fields so arbitrary objects do not enter button presentation.</en></lang>
const safeActions = computed(() => props.actions.map((raw, index) => {
  const isObject = typeof raw === 'object' && raw !== null;
  const value = isObject ? (raw.value ?? raw.label ?? index) : raw;
  return Object.freeze({ key: `${String(value)}-${index}`, value, label: String(isObject ? (raw.label ?? value) : raw), type: ['primary', 'warning', 'danger'].includes(raw?.type) ? raw.type : 'primary', disabled: Boolean(isObject && raw.disabled) });
}));

/**
 * @lang zh-CN 报告 action 对象，不执行其可能代表的业务行为。
 * @lang en Reports the action object without executing whatever business behavior it may represent.
 * @param {{value: string|number, disabled: boolean}} action <lang><zh-CN>受限操作。</zh-CN><en>Bounded action.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleAction(action) {
  if (props.disabled || action.disabled) return;
  emit('action', action.value);
}

/**
 * @lang zh-CN 报告关闭意图，由调用方更新 open。
 * @lang en Reports close intent; the caller updates open.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function close() {
  if (props.disabled) return;
  emit('update:open', false);
  emit('close');
}
</script>

<style src="./u-swipe-action.css"></style>
