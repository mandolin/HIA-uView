<!--
@component UModal
@lang zh-CN 为 HIA-uView 私有 `mp-weixin` 配置提供受控局部 modal；它呈现调用方 visible、标题、内容和文字 control，并只报告 confirm/cancel 意图，不拥有自动关闭、原生 popup、焦点、滚动、路由或完成流程。
@lang en Provides a controlled local modal for the private HIA-uView `mp-weixin` profile; it presents caller visible state, title, content, and text controls and reports only confirm/cancel intent without owning automatic close, native popup, focus, scrolling, routing, or completion flow.
-->
<template>
  <!--
  @lang zh-CN modal 根仅在调用方受控的可见值为真时存在。
  @lang en The modal root exists only when the caller-controlled visibility value is true.
  <lang><zh-CN>条件渲染不写回 prop，也不创建全局或页面根节点；应用独自决定任何后续关闭时机。</zh-CN><en>Conditional rendering writes back no prop and creates no global or page-root node; the application alone decides every subsequent close timing.</en></lang>
  -->
  <view v-if="isVisible" class="u-modal">
    <!--
    @lang zh-CN mask 只提供局部视觉分层。
    @lang en The mask provides local visual layering only.
    <lang><zh-CN>mask 没有 click handler，因此不会把点击解释为 dismiss、route 或其他应用动作。</zh-CN><en>The mask has no click handler, so it cannot interpret a click as dismiss, route, or another application action.</en></lang>
    -->
    <view class="u-modal__mask" />

    <!--
    @lang zh-CN panel 承载调用方标题、默认内容和可选文字 control。
    @lang en The panel carries caller title, default content, and optional text controls.
    <lang><zh-CN>panel 不接收任意布局配置、焦点指令或原生 popup 参数；其 slot 内容仍由调用方拥有。</zh-CN><en>The panel accepts no arbitrary layout configuration, focus instruction, or native-popup parameter; its slot content remains caller-owned.</en></lang>
    -->
    <view class="u-modal__panel">
      <text v-if="title" class="u-modal__title">{{ title }}</text>

      <!--
      @lang zh-CN 默认插槽承载调用方自有 modal 内容。
      @lang en The default slot carries caller-owned modal content.
      <lang><zh-CN>组件不读取、转换或转发插槽内部事件，避免获得表单、数据或业务流程责任。</zh-CN><en>The component neither reads, transforms, nor forwards slot-internal events, avoiding acquisition of form, data, or business-flow responsibility.</en></lang>
      -->
      <view class="u-modal__content">
        <slot />
      </view>

      <!--
      @lang zh-CN 操作行只在至少一个调用方文字 control 存在时渲染。
      @lang en The action row renders only when at least one caller text control exists.
      <lang><zh-CN>confirm/cancel 均由现有 UButton 的本地 click 语义转交，并由本组件 guard 限制为可见且有文字的纯意图。</zh-CN><en>Confirm/cancel both delegate through existing UButton local-click semantics and are constrained by this component guard to visible, text-backed pure intent.</en></lang>
      -->
      <view v-if="hasActions" class="u-modal__actions">
        <UButton
          v-if="hasCancelControl"
          variant="secondary"
          :label="cancelText"
          @click="handleCancel"
        />
        <UButton
          v-if="hasConfirmControl"
          :label="confirmText"
          @click="handleConfirm"
        />
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import UButton from '../u-button/u-button.vue';

// <lang><zh-CN>声明稳定的 kebab-case 组件名，使模板、manifest 与显式 plugin registry 使用同一运行时名称。</zh-CN><en>Declares the stable kebab-case component name so templates, the manifest, and the explicit plugin registry use one runtime name.</en></lang>
defineOptions({
  name: 'u-modal'
});

// <lang><zh-CN>modal 只接收调用方受控可见状态、文字与可选文字 control；它不接收关闭策略、mask/escape、层叠、焦点、滚动或业务参数。</zh-CN><en>The modal accepts only caller-controlled visible state, text, and optional text controls; it accepts no close policy, mask/escape, stacking, focus, scrolling, or business parameter.</en></lang>
const props = defineProps({
  // <lang><zh-CN>现有 HIA visible 入口优先于迁移 modelValue；未提供时保留 undefined，以便不会遮蔽迁移值。</zh-CN><en>The existing HIA visible entry takes priority over the migration modelValue; when absent it remains undefined so it cannot mask the migration value.</en></lang>
  visible: {
    type: Boolean,
    default: undefined
  },
  // <lang><zh-CN>迁移 modelValue 是调用方拥有的布尔可见状态；emit 只请求下一值，组件绝不直接改写 prop。</zh-CN><en>The migration modelValue is caller-owned Boolean visibility; an emit only requests the next value and the component never writes a prop directly.</en></lang>
  modelValue: {
    type: Boolean,
    default: false
  },
  // <lang><zh-CN>标题是可选调用方可见文字；空默认值避免组件制造领域或操作文案。</zh-CN><en>The title is optional caller-visible text; an empty default prevents the component from inventing domain or action copy.</en></lang>
  title: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>confirm 标签决定 confirm control 是否存在；空值不产生无标签按钮或隐式完成动作。</zh-CN><en>The confirm label decides whether a confirm control exists; an empty value produces no unlabeled button or implicit completion action.</en></lang>
  confirmText: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>cancel 标签决定 cancel control 是否存在；空值不产生 dismiss、回退或关闭副作用。</zh-CN><en>The cancel label decides whether a cancel control exists; an empty value produces no dismiss, fallback, or close side effect.</en></lang>
  cancelText: {
    type: String,
    default: ''
  }
});

// <lang><zh-CN>三个公开事件只报告调用方主动选择的 local control 意图和可见状态请求；应用在组件外处理状态、请求和后续结果。</zh-CN><en>The three public events report only caller-selected local-control intent and a visibility request; the application handles state, request, and subsequent result outside the component.</en></lang>
const emit = defineEmits(['confirm', 'cancel', 'update:modelValue']);

// <lang><zh-CN>可见性遵循已有 visible 优先、迁移 modelValue 回退的有限规则；组件不合并、缓存或推断多个应用状态源。</zh-CN><en>Visibility follows the finite rule of existing visible precedence with migration modelValue fallback; the component does not merge, cache, or infer multiple application state sources.</en></lang>
const isVisible = computed(() => props.visible ?? props.modelValue);

// <lang><zh-CN>confirm control 可见性只由非空调用方文字导出，不根据 title、slot 或业务状态猜测操作。</zh-CN><en>Confirm-control visibility derives only from non-empty caller text and does not infer action from title, slot, or business state.</en></lang>
const hasConfirmControl = computed(() => props.confirmText.length > 0);

// <lang><zh-CN>cancel control 可见性与 confirm 独立，允许应用明确提供单一或双重本地意图。</zh-CN><en>Cancel-control visibility is independent of confirm, allowing the application to explicitly provide single or dual local intent.</en></lang>
const hasCancelControl = computed(() => props.cancelText.length > 0);

// <lang><zh-CN>操作行只在任一受限 control 可见时出现，避免为纯展示 modal 预留无意义空间。</zh-CN><en>The action row appears only when either constrained control is visible, avoiding meaningless space for a presentation-only modal.</en></lang>
const hasActions = computed(() => hasConfirmControl.value || hasCancelControl.value);

/**
 * @lang zh-CN 在 modal 可见且 confirm control 有文字时先请求迁移 modelValue 为 false，再转发 confirm 意图；本函数不直接关闭 modal 或执行完成操作。
 * @lang en Requests migration modelValue false and then forwards confirm intent only while the modal is visible and confirm control has text; this function does not directly close the modal or perform a completion action.
 * @param {unknown} event <lang><zh-CN>内建 UButton 提供的原始本地点击事件。</zh-CN><en>Original local click event supplied by the built-in UButton.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合条件时 emit `confirm`。</zh-CN><en>No return value; when eligible, emits `confirm`.</en></lang>
 */
function handleConfirm(event) {
  // <lang><zh-CN>先执行双重 guard，使隐藏 modal 或缺失文字 control 即使收到直接 handler 调用也保持零事件。</zh-CN><en>Runs a dual guard first so a hidden modal or missing text control retains zero events even when receiving a direct handler call.</en></lang>
  if (!isVisible.value || !hasConfirmControl.value) {
    return;
  }

  // <lang><zh-CN>先发出受控写回请求；应用可以接受、拒绝或延后写回，组件不会观察或强制该决定。</zh-CN><en>Emits the controlled-writeback request first; the application may accept, reject, or defer writeback and the component neither observes nor enforces that decision.</en></lang>
  emit('update:modelValue', false);

  // <lang><zh-CN>随后保留原始 local event 给应用层；组件不解释确认目的或决定下一个 visible 状态。</zh-CN><en>Then preserves the original local event for the application layer; the component does not interpret confirmation purpose or decide the next visible state.</en></lang>
  emit('confirm', event);
}

/**
 * @lang zh-CN 在 modal 可见且 cancel control 有文字时先请求迁移 modelValue 为 false，再转发 cancel 意图；本函数不直接关闭 modal、恢复焦点或路由。
 * @lang en Requests migration modelValue false and then forwards cancel intent only while the modal is visible and cancel control has text; this function does not directly close the modal, restore focus, or route.
 * @param {unknown} event <lang><zh-CN>内建 UButton 提供的原始本地点击事件。</zh-CN><en>Original local click event supplied by the built-in UButton.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合条件时 emit `cancel`。</zh-CN><en>No return value; when eligible, emits `cancel`.</en></lang>
 */
function handleCancel(event) {
  // <lang><zh-CN>guard 与 confirm 路径对称，确保本地 control 的存在和可见状态始终共同约束事件。</zh-CN><en>The guard is symmetric with the confirm path, ensuring local-control existence and visible state always constrain the event together.</en></lang>
  if (!isVisible.value || !hasCancelControl.value) {
    return;
  }

  // <lang><zh-CN>受控写回请求不等同立即关闭；它只给 v-model 调用方一个明确、可拒绝的下一值。</zh-CN><en>The controlled-writeback request is not an immediate close; it only gives a v-model caller one explicit, rejectable next value.</en></lang>
  emit('update:modelValue', false);

  // <lang><zh-CN>原样交还 cancel 意图；应用可独自决定关闭、保留、请求或其他后续行为。</zh-CN><en>Returns cancel intent unchanged; the application alone may decide close, retention, request, or other follow-up behavior.</en></lang>
  emit('cancel', event);
}
</script>

<style src="./u-modal.css"></style>
