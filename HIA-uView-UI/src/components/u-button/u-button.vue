<!--
@component UButton
@lang zh-CN HIA-uView 首个独立实现的通用本地操作组件；仅实现已批准的 primary、secondary、text、尺寸、禁用、加载、标签与 click 契约。
@lang en The first independently implemented generic local-action component in HIA-uView; implements only the approved primary, secondary, text, size, disabled, loading, label, and click contract.
-->
<template>
  <!--
  @lang zh-CN 原生按钮只绑定已归一的 class、禁用/加载状态和本地 click handler。
  @lang en The native button binds only normalized classes, disabled/loading state, and the local click handler.
  <lang><zh-CN>加载时显示本地化文字，否则保留调用方 slot 或 label；组件不引入图标、计时器、请求或完成流程。</zh-CN><en>While loading it shows localized text; otherwise it retains caller slot or label, and introduces no icon, timer, request, or completion flow.</en></lang>
  -->
  <button
    :class="buttonClasses"
    :disabled="isInactive"
    :loading="loading"
    @click="handleClick"
  >
    <text v-if="loading" class="u-button__loading-text">{{ resolvedLoadingText }}</text>
    <slot v-else>{{ resolvedLabel }}</slot>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import { resolveButtonMessage } from '../../localization/button-messages.mjs';

// <lang><zh-CN>声明稳定的 kebab-case 组件名，使模板、manifest 与显式 plugin registry 使用同一运行时名称。</zh-CN><en>Declares the stable kebab-case component name so templates, the manifest, and the explicit plugin registry use one runtime name.</en></lang>
defineOptions({
  name: 'u-button'
});

// <lang><zh-CN>按钮只接收已批准的展示、可用性与调用方文字状态；不接收任意样式、导航、请求、规则或业务参数。</zh-CN><en>The button accepts only approved presentation, availability, and caller-text state; it accepts no arbitrary styling, navigation, request, rule, or business parameter.</en></lang>
const props = defineProps({
  // <lang><zh-CN>变体仅选择三种 token 化视觉语义；validator 拒绝未声明的样式分支。</zh-CN><en>Variant selects only three tokenized visual semantics; the validator rejects undeclared styling branches.</en></lang>
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'text'].includes(value)
  },
  // <lang><zh-CN>尺寸只选择受限的紧凑、标准或宽松几何，不允许调用方传入任意像素值。</zh-CN><en>Size selects only constrained compact, standard, or spacious geometry and accepts no caller-supplied arbitrary pixel value.</en></lang>
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  // <lang><zh-CN>block 只改变自身展示宽度，不改变父布局、slot 内容或页面栅格。</zh-CN><en>Block changes only the component's own display width and never changes parent layout, slot content, or page grid.</en></lang>
  block: {
    type: Boolean,
    default: false
  },
  // <lang><zh-CN>disabled 是调用方拥有的明确不可操作状态，并同时驱动原生属性与 handler guard。</zh-CN><en>Disabled is a caller-owned explicit unavailable state and drives both the native attribute and handler guard.</en></lang>
  disabled: {
    type: Boolean,
    default: false
  },
  // <lang><zh-CN>loading 是调用方拥有的忙碌呈现状态；它不自行启动、结束或计时任何工作。</zh-CN><en>Loading is a caller-owned busy presentation state; it neither starts, ends, nor times any work by itself.</en></lang>
  loading: {
    type: Boolean,
    default: false
  },
  // <lang><zh-CN>可选加载文字优先于 locale fallback，空默认值避免组件伪造业务进度文案。</zh-CN><en>Optional loading text takes precedence over locale fallback; the empty default prevents the component from fabricating business progress copy.</en></lang>
  loadingText: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>label 是没有默认 slot 时的调用方可见文字；空值不会生成隐式操作名称。</zh-CN><en>Label is caller-visible text when there is no default slot; an empty value creates no implicit action name.</en></lang>
  label: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>`text` 是面向既有 uView 调用方的迁移文字入口；当 `label` 为空且没有默认 slot 时才成为可见标签，现有 `label` 保持优先级。</zh-CN><en>`text` is a migration copy entry for existing uView callers; it becomes the visible label only when `label` is empty and no default slot exists, while existing `label` keeps precedence.</en></lang>
  text: {
    type: String,
    default: ''
  }
});

// <lang><zh-CN>唯一公开事件只报告原始本地 click 意图；应用在组件外拥有状态写回、请求、路由和完成处理。</zh-CN><en>The sole public event reports only original local click intent; the application owns state write-back, requests, routing, and completion outside the component.</en></lang>
const emit = defineEmits(['click']);

// <lang><zh-CN>禁用与加载都使按钮不可操作，确保原生属性和直接 handler 调用共享同一零事件不变量。</zh-CN><en>Disabled and loading both make the button inactive, ensuring the native attribute and direct handler calls share the same zero-event invariant.</en></lang>
const isInactive = computed(() => props.disabled || props.loading);

// <lang><zh-CN>加载文案优先使用调用方文字，缺失时才读取受限 locale resolver；不会缓存、请求或写入 locale。</zh-CN><en>Loading copy prefers caller text and consults the constrained locale resolver only when absent; it never caches, requests, or writes locale.</en></lang>
const resolvedLoadingText = computed(() => props.loadingText || resolveButtonMessage('component.button.loading'));

// <lang><zh-CN>常规状态的可见标签优先保留 HIA 的 `label` 契约，再受控回退到迁移 `text`；默认 slot 仍由模板优先呈现。</zh-CN><en>The normal-state visible label preserves the HIA `label` contract first and then falls back in a controlled way to migration `text`; the template still gives the default slot precedence.</en></lang>
const resolvedLabel = computed(() => props.label || props.text);

// <lang><zh-CN>根类只由已校验 props 导出，令变体、尺寸、block 和不可操作视觉保持可预测且无全局样式副作用。</zh-CN><en>Root classes derive only from validated props, keeping variant, size, block, and inactive visuals predictable and free of global-style side effects.</en></lang>
const buttonClasses = computed(() => [
  'u-button',
  `u-button--${props.variant}`,
  `u-button--${props.size}`,
  {
    'u-button--block': props.block,
    'u-button--disabled': props.disabled,
    'u-button--loading': props.loading
  }
]);

/**
 * @lang zh-CN 仅在按钮可操作时转发原始本地 click 意图；本函数不写 prop、不改变 loading，也不执行请求或导航。
 * @lang en Forwards original local click intent only while the button is active; this function writes no prop, changes no loading state, and performs no request or navigation.
 * @param {unknown} event <lang><zh-CN>原生按钮提供的点击事件。</zh-CN><en>Click event supplied by the native button.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合条件时 emit `click`。</zh-CN><en>No return value; emits `click` when eligible.</en></lang>
 */
function handleClick(event) {
  // <lang><zh-CN>只有可操作状态能转发事件，使测试或非原生调用方也不能绕过 disabled/loading 零事件契约。</zh-CN><en>Only the active state may forward an event, so tests and non-native callers cannot bypass the disabled/loading zero-event contract.</en></lang>
  if (!isInactive.value) {
    // <lang><zh-CN>原样交还本地事件，避免组件解释操作语义、保存目标或决定应用下一状态。</zh-CN><en>Returns the local event unchanged, avoiding interpretation of action meaning, target retention, or application next-state decisions.</en></lang>
    emit('click', event);
  }
}
</script>

<style src="./u-button.css"></style>
