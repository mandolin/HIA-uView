<!--
@component UPicker
@lang zh-CN 提供单列声明式选项选择；不绑定弹层、请求、路由或身份机制。
@lang en Provides declarative single-column option selection; it binds to no popup, request, route, or identity mechanism.
-->
<template>
  <view class="u-picker" role="group" aria-label="Picker / 选择器">
    <view v-if="props.title" class="u-picker__title">{{ props.title }}</view>
    <view class="u-picker__options" role="listbox" :aria-disabled="props.disabled">
      <button v-for="option in safeOptions" :key="option.key" class="u-picker__option" :class="{ 'u-picker__option--selected': option.value === draftValue }" type="button" role="option" :aria-selected="option.value === draftValue" :disabled="props.disabled || option.disabled" @click="selectOption(option)">{{ option.label }}</button>
    </view>
    <view class="u-picker__actions">
      <button class="u-picker__action" type="button" :disabled="props.disabled" @click="cancelSelection">{{ props.cancelText }}</button>
      <button class="u-picker__action u-picker__action--confirm" type="button" :disabled="props.disabled" @click="confirmSelection">{{ props.confirmText }}</button>
    </view>
    <slot />
  </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

// <lang><zh-CN>保留 u- 名称；确定和取消都只报告局部意图，由调用方决定外层呈现。</zh-CN><en>Retains the u- name; confirm and cancel report local intent only while the caller decides outer presentation.</en></lang>
defineOptions({ name: 'u-picker' });

// <lang><zh-CN>columns 接受原始值或 { label, value, disabled } 对象，组件将其投影为有限选项。</zh-CN><en>Columns accept primitive values or { label, value, disabled } objects, which the component projects into finite options.</en></lang>
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  columns: { type: Array, default: () => [] },
  title: { type: String, default: '' },
  confirmText: { type: String, default: 'Confirm / 确定' },
  cancelText: { type: String, default: 'Cancel / 取消' },
  disabled: { type: Boolean, default: false }
});
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

// <lang><zh-CN>草稿值允许调用方在确认前预览选择，外部 v-model 变化仍会同步进来。</zh-CN><en>The draft value lets callers preview a choice before confirmation, while external v-model changes still synchronize.</en></lang>
const draftValue = ref(props.modelValue);
watch(() => props.modelValue, (value) => { draftValue.value = value; });

// <lang><zh-CN>把选项复制为稳定对象，避免修改调用方的 columns 数据。</zh-CN><en>Copies options into stable objects so the caller's columns data is never mutated.</en></lang>
const safeOptions = computed(() => props.columns.map((raw, index) => {
  const isObject = typeof raw === 'object' && raw !== null;
  const value = isObject ? (raw.value ?? raw.label ?? index) : raw;
  const label = isObject ? String(raw.label ?? raw.value ?? `Option ${index + 1}`) : String(raw);
  return Object.freeze({ key: `${String(value)}-${index}`, label, value, disabled: Boolean(isObject && raw.disabled) });
}));

/**
 * @lang zh-CN 仅更新本地草稿，不触发外部模型更新。
 * @lang en Updates the local draft only and does not update the external model.
 * @param {{value: string|number, disabled: boolean}} option <lang><zh-CN>选项。</zh-CN><en>Option.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function selectOption(option) {
  if (props.disabled || option.disabled) return;
  draftValue.value = option.value;
}

/**
 * @lang zh-CN 恢复当前外部值并报告取消意图。
 * @lang en Restores the current external value and reports cancel intent.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function cancelSelection() {
  draftValue.value = props.modelValue;
  emit('cancel');
}

/**
 * @lang zh-CN 将当前草稿值作为受控结果发出；无匹配选项时不生成隐式值。
 * @lang en Emits the current draft as a controlled result; it creates no implicit value when no option matches.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function confirmSelection() {
  const selected = safeOptions.value.find((option) => option.value === draftValue.value);
  if (props.disabled || !selected || selected.disabled) return;
  emit('update:modelValue', selected.value);
  emit('confirm', selected.value);
}
</script>

<style src="./u-picker.css"></style>
