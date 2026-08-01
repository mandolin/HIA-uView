<!--
@component UFormItem
@lang zh-CN 提供表单项标签、帮助、必填和应用声明的校验消息呈现；组件不执行规则或注册父级字段。
@lang en Provides form-item label, help, required cue, and application-declared validation presentation; the component runs no rules or parent-field registration.
-->
<template>
  <view :class="rootClasses">
    <view class="u-form-item__label-row">
      <text v-if="label" class="u-form-item__label">
        <text v-if="required" class="u-form-item__required">*</text>{{ label }}
      </text>
      <text v-if="helpText" class="u-form-item__help">{{ helpText }}</text>
    </view>
    <view class="u-form-item__control"><slot /></view>
    <UValidationMessage :state="validationState" :message="validationMessage" />
  </view>
</template>

<script setup>
import { computed } from 'vue';
import UValidationMessage from '../u-validation-message/u-validation-message.vue';

// <lang><zh-CN>声明熟悉的 `u-form-item` 名称，并通过现有独立消息组件呈现应用文字。</zh-CN><en>Declares the familiar `u-form-item` name and presents caller copy through the existing independent message component.</en></lang>
defineOptions({ name: 'u-form-item' });

// <lang><zh-CN>所有字段上下文由调用方提供；validationState 只是一种呈现状态，不是 validator 状态机。</zh-CN><en>All field context is supplied by the caller; validationState is presentation state only, not a validator state machine.</en></lang>
const props = defineProps({
  label: { type: String, default: '' },
  required: { type: Boolean, default: false },
  helpText: { type: String, default: '' },
  validationState: { type: String, default: 'idle' },
  validationMessage: { type: String, default: '' },
  labelPosition: { type: String, default: 'top' },
  disabled: { type: Boolean, default: false }
});

// <lang><zh-CN>表单项不产生事件；嵌入控件和调用方页面拥有所有输入意图。</zh-CN><en>The form item emits no events; embedded controls and the caller page own all input intent.</en></lang>
defineEmits([]);

// <lang><zh-CN>未知布局/状态回退到有限稳定值，避免任意 prop 变成 class 或默认错误。</zh-CN><en>Unknown layout/state values fall back to finite stable values so arbitrary props cannot become classes or default errors.</en></lang>
const rootClasses = computed(() => {
  // <lang><zh-CN>只允许 top/left 两种通用布局，保持组件不绑定特定表单设计。</zh-CN><en>Allows only top/left generic layouts so the component remains independent of a specific form design.</en></lang>
  const position = ['top', 'left'].includes(props.labelPosition) ? props.labelPosition : 'top';

  // <lang><zh-CN>校验状态仅控制独立消息呈现，未知值回退到 idle。</zh-CN><en>Validation state controls independent message presentation only; unknown values fall back to idle.</en></lang>
  const state = ['idle', 'validating', 'error'].includes(props.validationState) ? props.validationState : 'idle';
  return [
    'u-form-item',
    `u-form-item--label-${position}`,
    `u-form-item--validation-${state}`,
    { 'u-form-item--disabled': props.disabled }
  ];
});
</script>

<style src="./u-form-item.css"></style>
