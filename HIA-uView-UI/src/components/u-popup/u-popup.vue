<!--
@component UPopup
@lang zh-CN 提供受控局部浮层、slot、真实 open 转换和带原因的 close intent/component-ref close；不执行自动关闭、计时、焦点、滚动、路由或全局 service。
@lang en Provides a controlled local overlay, slot, real open transitions, and reasoned close intent/component-ref close; it performs no automatic close, timer, focus, scrolling, routing, or global service.
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
import { computed, watch } from 'vue';

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
  // <lang><zh-CN>placement 只选择五种局部 panel class，未知值稳定回退 bottom。</zh-CN><en>Placement selects only five local panel classes, with unknown values falling back stably to bottom.</en></lang>
  placement: { type: String, default: 'bottom' },
  // <lang><zh-CN>title 是可选调用方文字，不从页面、路由或业务对象推导。</zh-CN><en>Title is optional caller copy and is not derived from a page, route, or business object.</en></lang>
  title: { type: String, default: '' },
  // <lang><zh-CN>非空 closeText 才创建有名称的关闭 control；组件不制造默认语言。</zh-CN><en>Only nonempty closeText creates a named close control; the component invents no default language.</en></lang>
  closeText: { type: String, default: '' },
  // <lang><zh-CN>maskClosable 仅授权遮罩报告关闭意图，不直接改变任一可见性 prop。</zh-CN><en>MaskClosable only authorizes the mask to report close intent and directly changes no visibility prop.</en></lang>
  maskClosable: { type: Boolean, default: false }
});

// <lang><zh-CN>close/update:modelValue 报告受控关闭意图，open 只报告挂载后的 false→true 转换；组件不改变页面、焦点或实际 prop。</zh-CN><en>Close/update:modelValue report controlled close intent, while open reports only post-mount false-to-true transitions; the component changes no page, focus, or actual prop.</en></lang>
const emit = defineEmits(['close', 'open', 'update:modelValue']);

// <lang><zh-CN>已有 visible 明确优先；其余两个迁移入口仅在未传 visible 时按有限布尔或关系决定显示，不建立共享状态。</zh-CN><en>The existing visible explicitly wins; the other two migration entries determine display through finite Boolean-or logic only when visible is absent and establish no shared state.</en></lang>
const isVisible = computed(() => props.visible ?? (props.modelValue || props.show));

// <lang><zh-CN>监听仅观察挂载后的受控值变化；默认非 immediate，避免把初始 true 伪装成一次 open 转换。</zh-CN><en>The watcher observes only post-mount controlled-value changes; it is non-immediate by default so an initial true is not fabricated as an open transition.</en></lang>
watch(isVisible, (nextVisible, previousVisible) => {
  // <lang><zh-CN>只有严格 false→true 才报告 open；true→true、true→false 与初始挂载均保持零事件。</zh-CN><en>Only a strict false-to-true transition reports open; true-to-true, true-to-false, and initial mount retain zero events.</en></lang>
  if (!previousVisible && nextVisible) {
    // <lang><zh-CN>open 不携带页面、焦点或动画信息，因为这些能力不属于当前组件合同。</zh-CN><en>Open carries no page, focus, or animation information because those capabilities are outside this component contract.</en></lang>
    emit('open');
  }
});

// <lang><zh-CN>placement 只允许有限 class 后缀，防止任意字符串进入 CSS surface。</zh-CN><en>Placement allows only finite class suffixes, preventing arbitrary strings from entering the CSS surface.</en></lang>
const rootClasses = computed(() => {
  // <lang><zh-CN>未知 placement 回退 bottom，保持已有的小程序优先默认布局。</zh-CN><en>An unknown placement falls back to bottom, retaining the existing mini-program-first default layout.</en></lang>
  const placement = ['top', 'bottom', 'left', 'right', 'center'].includes(props.placement) ? props.placement : 'bottom';
  return ['u-popup', `u-popup--${placement}`];
});

/**
 * @lang zh-CN 在当前浮层可见时先请求 modelValue 为 false，再转发带有限原因的 close 意图；该请求不写回 visible、show 或任何页面状态。
 * @lang en Requests modelValue false and then forwards close intent with a finite reason while the current overlay is visible; this request writes back neither visible, show, nor any page state.
 * @param {unknown} event <lang><zh-CN>触发关闭的原始本地事件。</zh-CN><en>Original local event that triggered close.</en></lang>
 * @param {'mask'|'control'|'programmatic'} reason <lang><zh-CN>由内部关闭入口确定的有限原因。</zh-CN><en>Finite reason determined by the internal close entry.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合条件时依次 emit `update:modelValue` 与 `close`。</zh-CN><en>No return value; when eligible, emits `update:modelValue` followed by `close`.</en></lang>
 */
function requestClose(event, reason) {
  // <lang><zh-CN>不可见浮层不能因直接 handler 调用产生虚假的关闭或值更新意图。</zh-CN><en>An invisible overlay cannot produce false close or value-update intent from a direct handler call.</en></lang>
  if (!isVisible.value) {
    return;
  }

  // <lang><zh-CN>先提供可拒绝的 v-model 写回请求；调用方决定是否实际修改其可见状态。</zh-CN><en>First provides a rejectable v-model writeback request; the caller decides whether to actually change its visibility state.</en></lang>
  emit('update:modelValue', false);

  // <lang><zh-CN>再原样保留 raw event 首参，并把内部已知原因追加为第二参；组件不推断业务结果。</zh-CN><en>Then preserves the raw event as the first argument and appends the internally known reason as the second; the component infers no business outcome.</en></lang>
  emit('close', event, reason);
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
  requestClose(event, 'mask');
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
  requestClose(event, 'control');
}

/**
 * @lang zh-CN 通过 mounted component ref 报告 programmatic 关闭意图；方法不隐藏浮层、不管理焦点，也不调用 service。
 * @lang en Reports programmatic close intent through a mounted component ref; the method does not hide the overlay, manage focus, or call a service.
 * @returns {void} <lang><zh-CN>无返回值；仅在当前受控值可见时依次报告更新与关闭。</zh-CN><en>No return value; reports update then close only while the current controlled value is visible.</en></lang>
 */
function close() {
  // <lang><zh-CN>复用统一关闭路径并保留 undefined raw event，便于调用方区分无平台事件的命令入口。</zh-CN><en>Reuses the unified close path and preserves an undefined raw event so callers can distinguish the command entry without a platform event.</en></lang>
  requestClose(undefined, 'programmatic');
}

// <lang><zh-CN>实例只公开局部 close 命令，不公开内部状态、watcher、页面节点或任意执行入口。</zh-CN><en>The instance exposes only the local close command and exposes no internal state, watcher, page node, or arbitrary execution entry.</en></lang>
defineExpose({ close });
</script>

<style src="./u-popup.css"></style>
