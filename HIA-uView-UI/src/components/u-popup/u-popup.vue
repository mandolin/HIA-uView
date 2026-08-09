<!--
@component UPopup
@lang zh-CN 提供受控局部浮层、slot 和 close intent；不执行自动关闭、计时、焦点、滚动、路由或全局 service。
@lang en Provides a controlled local overlay, slot, and close intent; it performs no automatic close, timer, focus, scrolling, routing, or global service.
-->
<template>
  <!--
  @lang zh-CN 浮层根只由受控可见值决定是否渲染。
  @lang en The overlay root renders only according to the controlled visibility value.
  <lang><zh-CN>条件渲染不会写回任何 prop，也不创建 portal、全局节点或页面根副作用。</zh-CN><en>Conditional rendering writes back no prop and creates no portal, global node, or page-root side effect.</en></lang>
  -->
  <view v-if="isVisible" :class="rootClasses">
    <view class="u-popup__mask" @click="handleMaskClick" />
    <view class="u-popup__panel">
      <view v-if="title || closeText" class="u-popup__header">
        <text v-if="title" class="u-popup__title">{{ title }}</text>
        <button v-if="closeText" class="u-popup__close" type="button" @click="handleClose">{{ closeText }}</button>
      </view>
      <view class="u-popup__content"><slot /></view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>浮层名称保持 u-popup 迁移熟悉度，但只呈现调用方拥有的 visible 与 slot。</zh-CN><en>The popup name preserves u-popup migration familiarity while presenting caller-owned visible state and slot only.</en></lang>
defineOptions({ name: 'u-popup' });

// <lang><zh-CN>所有输入都限制在调用方拥有的可见性、有限 placement 与可见文字；不接收页面级层叠、焦点、滚动、计时或业务参数。</zh-CN><en>All inputs are limited to caller-owned visibility, finite placement, and visible copy; they accept no page-level stacking, focus, scrolling, timing, or business parameter.</en></lang>
const props = defineProps({
  // <lang><zh-CN>现有 HIA visible 若明确提供则优先；undefined 表示使用后续迁移入口，不是可见状态本身。</zh-CN><en>The existing HIA visible takes precedence when explicitly supplied; undefined means use a subsequent migration entry and is not a visibility state itself.</en></lang>
  visible: { type: Boolean, default: undefined },
  // <lang><zh-CN>modelValue 是受控迁移入口；它不由组件改写，只通过 update event 请求调用方处理。</zh-CN><en>ModelValue is a controlled migration entry; it is never rewritten by the component and only requests caller handling through an update event.</en></lang>
  modelValue: { type: Boolean, default: false },
  // <lang><zh-CN>show 是第二个受控迁移入口；当未传 visible 且任一迁移入口为真时可见，调用方不得混用冲突值。</zh-CN><en>Show is a second controlled migration entry; visibility is true when visible is absent and either migration entry is true, and callers must not combine conflicting values.</en></lang>
  show: { type: Boolean, default: false },
  placement: { type: String, default: 'bottom' },
  title: { type: String, default: '' },
  closeText: { type: String, default: '' },
  maskClosable: { type: Boolean, default: false }
});

// <lang><zh-CN>close 和 update:modelValue 只报告本地关闭意图与可拒绝的下一可见值；组件不改变页面、焦点或实际 prop。</zh-CN><en>Close and update:modelValue report only local close intent and a rejectable next visibility value; the component changes no page, focus, or actual prop.</en></lang>
const emit = defineEmits(['close', 'update:modelValue']);

// <lang><zh-CN>已有 visible 明确优先；其余两个迁移入口仅在未传 visible 时按有限布尔或关系决定显示，不建立共享状态。</zh-CN><en>The existing visible explicitly wins; the other two migration entries determine display through finite Boolean-or logic only when visible is absent and establish no shared state.</en></lang>
const isVisible = computed(() => props.visible ?? (props.modelValue || props.show));

// <lang><zh-CN>placement 只允许有限 class 后缀，防止任意字符串进入 CSS surface。</zh-CN><en>Placement allows only finite class suffixes, preventing arbitrary strings from entering the CSS surface.</en></lang>
const rootClasses = computed(() => {
  // <lang><zh-CN>未知 placement 回退 bottom，保持已有的小程序优先默认布局。</zh-CN><en>An unknown placement falls back to bottom, retaining the existing mini-program-first default layout.</en></lang>
  const placement = ['top', 'bottom', 'left', 'right', 'center'].includes(props.placement) ? props.placement : 'bottom';
  return ['u-popup', `u-popup--${placement}`];
});

/**
 * @lang zh-CN 在当前浮层可见时先请求 modelValue 为 false，再转发 close 意图；该请求不写回 visible、show 或任何页面状态。
 * @lang en Requests modelValue false and then forwards close intent while the current overlay is visible; this request writes back neither visible, show, nor any page state.
 * @param {unknown} event <lang><zh-CN>触发关闭的原始本地事件。</zh-CN><en>Original local event that triggered close.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合条件时依次 emit `update:modelValue` 与 `close`。</zh-CN><en>No return value; when eligible, emits `update:modelValue` followed by `close`.</en></lang>
 */
function requestClose(event) {
  // <lang><zh-CN>不可见浮层不能因直接 handler 调用产生虚假的关闭或值更新意图。</zh-CN><en>An invisible overlay cannot produce false close or value-update intent from a direct handler call.</en></lang>
  if (!isVisible.value) {
    return;
  }

  // <lang><zh-CN>先提供可拒绝的 v-model 写回请求；调用方决定是否实际修改其可见状态。</zh-CN><en>First provides a rejectable v-model writeback request; the caller decides whether to actually change its visibility state.</en></lang>
  emit('update:modelValue', false);

  // <lang><zh-CN>再报告原始关闭意图；组件不推断来源是确认、取消、路由或业务结束。</zh-CN><en>Then reports the original close intent; the component does not infer whether its source is confirmation, cancellation, routing, or business completion.</en></lang>
  emit('close', event);
}

/**
 * @lang zh-CN 仅在 visible 且调用方明确允许 maskClosable 时报告遮罩关闭意图。
 * @lang en Reports mask-close intent only while visible and when the caller explicitly enables maskClosable.
 * @param {unknown} event <lang><zh-CN>遮罩点击事件。</zh-CN><en>Mask click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleMaskClick(event) {
  // <lang><zh-CN>mask 关闭必须由调用方显式开启；默认 mask 点击没有任何流程含义。</zh-CN><en>Mask closing must be explicitly enabled by the caller; a default mask click has no flow meaning.</en></lang>
  if (!isVisible.value || !props.maskClosable) {
    return;
  }

  // <lang><zh-CN>统一走受控关闭请求，保持 mask 与显式 control 的事件顺序一致。</zh-CN><en>Uses the shared controlled close request so mask and explicit-control event order remains identical.</en></lang>
  requestClose(event);
}

/**
 * @lang zh-CN 报告显式 close control 的本地意图；不自动隐藏浮层。
 * @lang en Reports local intent from the explicit close control without hiding the overlay.
 * @param {unknown} event <lang><zh-CN>关闭按钮事件。</zh-CN><en>Close-button event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleClose(event) {
  // <lang><zh-CN>缺失可见文字时不产生无标签 control 的关闭意图。</zh-CN><en>When visible copy is absent, no close intent is produced from an unlabeled control.</en></lang>
  if (!isVisible.value || !props.closeText) {
    return;
  }

  // <lang><zh-CN>显式 control 与 mask 复用同一受控关闭路径，不自动改变页面状态。</zh-CN><en>The explicit control reuses the same controlled close path as the mask and changes no page state automatically.</en></lang>
  requestClose(event);
}
</script>

<style src="./u-popup.css"></style>
