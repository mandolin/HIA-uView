<!--
@component UNumberKeyboard
@lang zh-CN 提供调用方声明有限键集合的受控数字键盘表面；组件只报告输入、删除和确认意图，不生成数值、处理金额、管理系统键盘或执行长按计时。
@lang en Provides a controlled numeric-keyboard surface with a caller-declared finite key collection; the component reports input, backspace, and confirm intent only and neither generates numbers, handles money, manages a system keyboard, nor runs long-press timing.
-->
<template>
  <!-- @lang zh-CN 只有 caller visible 且至少有一个可读键时才输出；每个原生 button 只回传已规范化的 caller value。
  @lang en Outputs only when caller-visible and at least one readable key exists; every native button returns only a normalized caller value.
  <lang><zh-CN>删除和确认均要求调用方提供可读文字，避免无标签 control 或默认业务文案。</zh-CN><en>Both backspace and confirm require caller-provided readable copy, avoiding unlabeled controls or default business text.</en></lang>
  -->
  <view v-if="isRenderable" class="u-number-keyboard" role="group" :aria-label="safeLabel">
    <view class="u-number-keyboard__keys"><button v-for="key in safeKeys" :key="key.key" class="u-number-keyboard__key" type="button" :disabled="disabled || key.disabled" @click="emitInput(key, $event)"><text>{{ key.label }}</text></button></view>
    <view v-if="hasActions" class="u-number-keyboard__actions"><button v-if="safeBackspaceLabel" class="u-number-keyboard__action" type="button" :disabled="disabled" @click="emitBackspace"><text>{{ safeBackspaceLabel }}</text></button><button v-if="safeConfirmText" class="u-number-keyboard__confirm" type="button" :disabled="disabled" @click="emitConfirm"><text>{{ safeConfirmText }}</text></button></view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称保留数字键盘迁移面；实现不替代通用 input、表单、金额或身份证规则。</zh-CN><en>The stable name retains a numeric-keyboard migration surface; the implementation does not replace general input, forms, money rules, or identity-code rules.</en></lang>
defineOptions({ name: 'u-number-keyboard' });

// <lang><zh-CN>调用方拥有全部键、可见性、标签和 disabled 状态；空键集合不会产生组件自有键文案。</zh-CN><en>The caller owns every key, visibility, labels, and disabled state; an empty key collection produces no component-owned key copy.</en></lang>
const props = defineProps({
  // <lang><zh-CN>可见性默认关闭，避免组件在调用方未请求时建立固定输入面。</zh-CN><en>Visibility defaults off, avoiding creation of a fixed input surface without caller request.</en></lang>
  visible: { type: Boolean, default: false },
  // <lang><zh-CN>键集合只接受有限 label/value/disabled 记录或字符串/数值快捷写法；最多保留十六项。</zh-CN><en>The key collection accepts only finite label/value/disabled records or string/numeric shorthand and retains at most sixteen items.</en></lang>
  keys: { type: Array, default: () => [] },
  // <lang><zh-CN>组标签由调用方本地化；空值不生成默认键盘说明。</zh-CN><en>Group label is localized by the caller; an empty value generates no default keyboard description.</en></lang>
  label: { type: String, default: '' },
  // <lang><zh-CN>两个可选操作的文字由调用方提供；空值不输出对应 button。</zh-CN><en>Copy for both optional actions is caller-provided; an empty value outputs no corresponding button.</en></lang>
  backspaceLabel: { type: String, default: '' },
  confirmText: { type: String, default: '' },
  // <lang><zh-CN>禁用同时约束原生 control 与直接 handler 调用。</zh-CN><en>Disabled constrains both native controls and direct handler invocation.</en></lang>
  disabled: { type: Boolean, default: false }
});

// <lang><zh-CN>事件只表达本地输入/删除/确认意图；页面拥有字符串写回、格式化、校验和后续流程。</zh-CN><en>Events express local input/backspace/confirm intent only; the page owns string writeback, formatting, validation, and follow-up flow.</en></lang>
const emit = defineEmits(['input', 'backspace', 'confirm']);

/**
 * @lang zh-CN 将一个 caller 键规范化为有限可读 label/value/disabled 记录；不可读键返回 null。
 * @lang en Normalizes one caller key into a finite readable label/value/disabled record; an unreadable key returns null.
 * @param {unknown} key <lang><zh-CN>调用方声明的键。</zh-CN><en>Key declared by the caller.</en></lang>
 * @param {number} index <lang><zh-CN>有限集合索引，仅用于稳定模板键。</zh-CN><en>Finite-collection index, used only for a stable template key.</en></lang>
 * @returns {{key: string, label: string, value: unknown, disabled: boolean}|null} <lang><zh-CN>规范化键或 null。</zh-CN><en>Normalized key or null.</en></lang>
 */
function normalizeKey(key, index) {
  // <lang><zh-CN>对象键只读取显式 label/text/value/disabled；原始字符串与数值只服务透明快捷写法。</zh-CN><en>Object keys read only explicit label/text/value/disabled; primitive strings and numbers serve transparent shorthand only.</en></lang>
  const source = key !== null && typeof key === 'object' ? key : { label: key, value: key };
  const candidateLabel = source.label ?? source.text ?? '';
  const label = typeof candidateLabel === 'string' || typeof candidateLabel === 'number' ? String(candidateLabel) : '';

  // <lang><zh-CN>无可读标签的键不形成输入入口，避免把未知对象或空文字暴露给用户。</zh-CN><en>A key without a readable label forms no input entry, avoiding exposure of an unknown object or empty copy to users.</en></lang>
  if (label.trim().length === 0) return null;

  // <lang><zh-CN>value 仅由 caller 显式给出或透明回退到 label，不推断任何数值语义。</zh-CN><en>Value is explicitly caller-provided or transparently falls back to label and infers no numeric semantics.</en></lang>
  const value = Object.prototype.hasOwnProperty.call(source, 'value') ? source.value : label;
  return Object.freeze({ key: `key-${index}`, label, value, disabled: Boolean(source.disabled) });
}

// <lang><zh-CN>有限投影阻止无界 caller 数据成为组件的虚拟化、随机键或平台键盘服务。</zh-CN><en>The finite projection prevents unbounded caller data from becoming component virtualization, random keys, or a platform-keyboard service.</en></lang>
const safeKeys = computed(() => (Array.isArray(props.keys) ? props.keys : []).slice(0, 16).map(normalizeKey).filter((key) => key !== null));

// <lang><zh-CN>用户文字只接受明确字符串，避免不匹配 prop 隐式呈现为对象或无标签操作。</zh-CN><en>User copy accepts only explicit strings, preventing mismatched props from implicitly rendering as objects or unlabeled actions.</en></lang>
const safeLabel = computed(() => typeof props.label === 'string' ? props.label : '');
const safeBackspaceLabel = computed(() => typeof props.backspaceLabel === 'string' ? props.backspaceLabel : '');
const safeConfirmText = computed(() => typeof props.confirmText === 'string' ? props.confirmText : '');

// <lang><zh-CN>操作区只在至少一个调用方文字存在时输出。</zh-CN><en>The action area outputs only when at least one caller copy value exists.</en></lang>
const hasActions = computed(() => safeBackspaceLabel.value.trim().length > 0 || safeConfirmText.value.trim().length > 0);

// <lang><zh-CN>可见且有至少一个可读键才是可用输入面，空集合不会占据页面或创建默认键。</zh-CN><en>A usable input surface requires visibility and at least one readable key; an empty collection occupies no page space and creates no default key.</en></lang>
const isRenderable = computed(() => props.visible && safeKeys.value.length > 0);

/**
 * @lang zh-CN 报告一个启用的 caller 键值；不拼接输入、不修改任何 model 或产生数值。
 * @lang en Reports one enabled caller key value; it concatenates no input, modifies no model, and generates no number.
 * @param {{value: unknown, disabled: boolean}} key <lang><zh-CN>已规范化键。</zh-CN><en>Normalized key.</en></lang>
 * @param {unknown} event <lang><zh-CN>原始点击事件。</zh-CN><en>Original click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `input`。</zh-CN><en>No return value; emits `input` when the guard passes.</en></lang>
 */
function emitInput(key, event) {
  // <lang><zh-CN>guard 保护隐藏、禁用和单键禁用状态，避免直接调用 handler 越过模板边界。</zh-CN><en>The guard protects hidden, disabled, and per-key-disabled states, preventing direct handler calls from bypassing the template boundary.</en></lang>
  if (!isRenderable.value || props.disabled || key.disabled) return;
  emit('input', { value: key.value, event });
}

/**
 * @lang zh-CN 报告调用方已标签化的本地删除意图；不清空、长按重复或计时。
 * @lang en Reports caller-labeled local backspace intent; it clears nothing, repeats no long press, and uses no timer.
 * @param {unknown} event <lang><zh-CN>原始点击事件。</zh-CN><en>Original click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `backspace`。</zh-CN><en>No return value; emits `backspace` when the guard passes.</en></lang>
 */
function emitBackspace(event) {
  // <lang><zh-CN>无 caller 文字的删除 control 不存在；重复 guard 保持直接调用的相同边界。</zh-CN><en>A backspace control with no caller copy does not exist; the repeated guard preserves the same boundary for direct calls.</en></lang>
  if (!isRenderable.value || props.disabled || safeBackspaceLabel.value.trim().length === 0) return;
  emit('backspace', event);
}

/**
 * @lang zh-CN 报告调用方已标签化的本地确认意图；不提交表单、关闭 overlay 或解释输入。
 * @lang en Reports caller-labeled local confirm intent; it submits no form, closes no overlay, and interprets no input.
 * @param {unknown} event <lang><zh-CN>原始点击事件。</zh-CN><en>Original click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `confirm`。</zh-CN><en>No return value; emits `confirm` when the guard passes.</en></lang>
 */
function emitConfirm(event) {
  // <lang><zh-CN>确认与其他 control 共享 visible/disabled/可读标签边界。</zh-CN><en>Confirm shares the visible/disabled/readable-label boundary of other controls.</en></lang>
  if (!isRenderable.value || props.disabled || safeConfirmText.value.trim().length === 0) return;
  emit('confirm', event);
}
</script>

<style src="./u-number-keyboard.css"></style>
