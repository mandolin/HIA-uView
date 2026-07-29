<!--
@component URadioGroup
@lang zh-CN 为 slot 内 `URadio` 提供调用方受控的单一字符串选择上下文；它只 emit 原样子项 value，不拥有默认选择、选项数据、表单、请求、路由或持久化。
@lang en Provides caller-controlled single-string selection context to slot-contained `URadio`; it emits only unchanged child value and owns no default choice, option data, form, request, routing, or persistence.
-->
<template>
  <!-- @lang zh-CN group 根只排列调用方 slot，不发现 slot 外子项或注册全局 radio。 @lang en The group root arranges caller slot only and neither discovers children outside the slot nor registers global radios. <lang><zh-CN>slot 保持调用方内容所有权。</zh-CN><en>The slot retains caller content ownership.</en></lang> -->
  <view class="u-radio-group"><slot /></view>
</template>

<script setup>
import { computed, provide } from 'vue';
import { RADIO_GROUP_CONTEXT } from '../selection-context.mjs';

// <lang><zh-CN>声明稳定 runtime 名称，使 template、manifest 与 explicit registry 使用同一键。</zh-CN><en>Declares the stable runtime name so template, manifest, and explicit registry use the same key.</en></lang>
defineOptions({ name: 'u-radio-group' });

// <lang><zh-CN>group 只接受调用方拥有的字符串选择与 disabled；不接收 option 数组、validator 或业务对象。</zh-CN><en>The group accepts only caller-owned string selection and disabled; it accepts no option array, validator, or business object.</en></lang>
const props = defineProps({ modelValue: { type: String, default: '' }, disabled: { type: Boolean, default: false } });
// <lang><zh-CN>两个事件报告同一纯选择意图；调用方决定是否写回 modelValue。</zh-CN><en>The two events report the same pure selection intent; the caller decides whether to write modelValue back.</en></lang>
const emit = defineEmits(['update:modelValue', 'change']);
// <lang><zh-CN>将 props 投影为只读 computed，避免子项持有可写 group 状态。</zh-CN><en>Projects props as readonly computed values, preventing children from holding writable group state.</en></lang>
const selectedValue = computed(() => props.modelValue);
const isGroupDisabled = computed(() => props.disabled);

/**
 * @lang zh-CN 接收子项未修改的 value，并在 group 启用且 value 尚未选中时 emit 两个调用方处理的选择意图。
 * @lang en Receives unchanged child value and, while group is enabled and value is not already selected, emits two caller-handled selection intents.
 * @param {string} value <lang><zh-CN>子项调用方提供的本地键。</zh-CN><en>Caller-provided local key from the child.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit。</zh-CN><en>No return value; emits when guard passes.</en></lang>
 */
function selectValue(value) {
  // <lang><zh-CN>禁用或已选 value 保持零事件，radio 绝不通过再次点击取消当前选择。</zh-CN><en>A disabled or already-selected value retains zero event; radio never cancels current selection through a second click.</en></lang>
  if (isGroupDisabled.value || value === selectedValue.value) return;
  // <lang><zh-CN>以相同未修改 value 连续报告 v-model 与一般 change，不解释为完成或提交。</zh-CN><en>Reports v-model and general change consecutively with the same unchanged value and interprets neither as completion nor submit.</en></lang>
  emit('update:modelValue', value); emit('change', value);
}

// <lang><zh-CN>私有 context 只暴露只读选择/disabled 与受限 select 函数，不暴露 props 或 emit 的可写引用。</zh-CN><en>The private context exposes only readonly selection/disabled and constrained select function, not writable references to props or emit.</en></lang>
provide(RADIO_GROUP_CONTEXT, Object.freeze({ selectedValue, isGroupDisabled, selectValue }));
</script>

<style src="./u-radio-group.css"></style>
