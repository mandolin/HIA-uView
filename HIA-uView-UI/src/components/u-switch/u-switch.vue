<!--
@component USwitch
@lang zh-CN 提供受控布尔切换意图；组件只回传平台选择结果，不执行业务开关、持久化、权限或远程更新。
@lang en Provides controlled boolean-toggle intent; the component only returns the platform selection result and performs no business toggle, persistence, authorization, or remote update.
-->
<template>
  <label :class="rootClasses">
    <switch
      class="u-switch__control"
      :checked="modelValue"
      :disabled="disabled"
      @change="handleChange"
    />
    <text v-if="label" class="u-switch__label">{{ label }}</text>
  </label>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>声明模板名，保持代码层迁移使用 `u-switch` 而非品牌前缀。</zh-CN><en>Declares the template name so code-level migration uses `u-switch` rather than a brand prefix.</en></lang>
defineOptions({ name: 'u-switch' });

// <lang><zh-CN>受控布尔值、禁用和显示文字全部由调用方拥有；组件没有业务 key 或远程参数。</zh-CN><en>Controlled boolean, disabled state, and visible copy are caller-owned; the component has no business key or remote parameter.</en></lang>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  label: { type: String, default: '' }
});

// <lang><zh-CN>只报告受控更新和一般 change 意图；调用方决定是否写回或触发业务流程。</zh-CN><en>Reports controlled update and general change intent only; the caller decides whether to write back or trigger business flow.</en></lang>
const emit = defineEmits(['update:modelValue', 'change']);

// <lang><zh-CN>禁用状态提供非颜色视觉提示并与事件 guard 共用 props.disabled。</zh-CN><en>Disabled state provides a non-color visual cue and shares props.disabled with the event guard.</en></lang>
const rootClasses = computed(() => ['u-switch', { 'u-switch--disabled': props.disabled }]);

/**
 * @lang zh-CN 从已确认的 change 事件读取布尔值；未知形状保持零事件，避免把错误输入猜成 false。
 * @lang en Reads a boolean from the documented change event; unknown shapes emit nothing instead of guessing false.
 * @param {unknown} event <lang><zh-CN>平台或测试 change 事件。</zh-CN><en>Platform or test change event.</en></param>
 * @returns {boolean | null} <lang><zh-CN>确认的下一值或未知标记。</zh-CN><en>Confirmed next value or an unknown marker.</en></lang>
 */
function extractValue(event) {
  // <lang><zh-CN>小程序 switch 的值位于 detail.value，且必须是真正布尔值。</zh-CN><en>The mini-program switch value is in detail.value and must be a real boolean.</en></lang>
  const detailValue = event?.detail?.value;
  return typeof detailValue === 'boolean' ? detailValue : null;
}

/**
 * @lang zh-CN 处理本地切换意图；disabled 或未知事件形状均保持零事件。
 * @lang en Handles local-toggle intent; disabled state or unknown event shape retains zero events.
 * @param {unknown} event <lang><zh-CN>原生 change 事件。</zh-CN><en>Native change event.</en></param>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleChange(event) {
  // <lang><zh-CN>先阻止禁用分支，防止测试或非原生调用直接调用 handler 时越过原生属性。</zh-CN><en>Blocks disabled branches first so direct test or non-native handler calls cannot bypass the native property.</en></lang>
  if (props.disabled) {
    return;
  }

  // <lang><zh-CN>只接受确认的布尔值；组件不将字符串、数字或缺失值转换成领域状态。</zh-CN><en>Accepts only a confirmed boolean; the component converts no string, number, or missing value into domain state.</en></lang>
  const nextValue = extractValue(event);
  if (nextValue === null) {
    return;
  }

  emit('update:modelValue', nextValue);
  emit('change', nextValue);
}
</script>

<style src="./u-switch.css"></style>
