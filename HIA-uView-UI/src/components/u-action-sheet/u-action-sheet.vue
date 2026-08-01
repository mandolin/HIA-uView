<!--
@component UActionSheet
@lang zh-CN 提供调用方声明的有限 action 列表、局部 sheet 与 select/close intent；不执行命令、导航、权限或异步 provider。
@lang en Provides a caller-declared finite action list, local sheet, and select/close intent; it executes no command, navigation, authorization, or async provider.
-->
<template>
  <view v-if="visible" class="u-action-sheet">
    <view class="u-action-sheet__mask" @click="handleMaskClick" />
    <view class="u-action-sheet__panel">
      <text v-if="title" class="u-action-sheet__title">{{ title }}</text>
      <button
        v-for="(item, index) in safeItems"
        :key="item.key"
        class="u-action-sheet__item"
        type="button"
        :disabled="item.disabled"
        @click="handleSelect(item, index)"
      >{{ item.label }}</button>
      <button v-if="cancelText" class="u-action-sheet__cancel" type="button" @click="handleCancel">{{ cancelText }}</button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>action sheet 只消费声明式 items，不读取菜单服务或执行 item 语义。</zh-CN><en>The action sheet consumes declarative items only and reads no menu service or executes item meaning.</en></lang>
defineOptions({ name: 'u-action-sheet' });

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  cancelText: { type: String, default: '' },
  maskClosable: { type: Boolean, default: false }
});

const emit = defineEmits(['select', 'close']);
const safeItems = computed(() => props.items.map((item, index) => {
  const source = typeof item === 'string' ? { label: item, value: item } : (item || {});
  return {
    key: `${String(source.value ?? source.label ?? index)}-${index}`,
    label: String(source.label ?? source.text ?? ''),
    value: source.value ?? source.label ?? index,
    disabled: Boolean(source.disabled)
  };
}).filter((item) => item.label.length > 0));

// <lang><zh-CN>遮罩关闭必须由调用方显式开启，避免 sheet 猜测 dismiss 语义。</zh-CN><en>Mask closing must be explicitly enabled by the caller so the sheet does not infer dismiss semantics.</en></lang>
function handleMaskClick(event) {
  if (!props.visible || !props.maskClosable) return;
  emit('close', event);
}

/**
 * @lang zh-CN 回传有限 item 的 value 和 index；组件不执行命令或隐藏 sheet。
 * @lang en Returns finite item value and index; the component executes no command and hides no sheet.
 * @param {{ value: unknown, disabled: boolean }} item <lang><zh-CN>规范化 item。</zh-CN><en>Normalized item.</en></lang>
 * @param {number} index <lang><zh-CN>当前 item 索引。</zh-CN><en>Current item index.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleSelect(item, index) {
  if (!props.visible || item.disabled) return;
  emit('select', { value: item.value, index });
}

/**
 * @lang zh-CN 回传 cancel close intent；组件不自动隐藏或导航。
 * @lang en Returns cancel close intent; the component does not hide or navigate automatically.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleCancel() {
  if (!props.visible || !props.cancelText) return;
  emit('close');
}
</script>

<style src="./u-action-sheet.css"></style>
