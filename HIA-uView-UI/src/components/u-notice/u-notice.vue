<!--
@component UNotice
@lang zh-CN 为 HIA-uView 私有 `mp-weixin` 配置提供受控 inline feedback；它只呈现调用方 visible、有限 tone、消息和可选 dismiss 意图，不拥有全局 service、队列、定时器、toast、请求结果或自动消失。
@lang en Provides controlled inline feedback for the private HIA-uView `mp-weixin` profile; it presents only caller visible state, finite tone, message, and optional dismiss intent without owning global service, queue, timer, toast, request result, or automatic disappearance.
-->
<template>
  <!--
  @lang zh-CN notice 根仅在调用方 visible 为真且消息非空时渲染。
  @lang en The notice root renders only when caller visible is true and message is non-empty.
  <lang><zh-CN>双重条件防止组件生成无文字反馈；它不写回 visible 或推断任何业务/后端结果。</zh-CN><en>The dual condition prevents the component from generating textless feedback; it does not write back visible or infer any business/backend result.</en></lang>
  -->
  <view v-if="isVisible" :class="noticeClasses">
    <!--
    @lang zh-CN 符号标记补充 tone 的颜色与边界样式。
    @lang en A symbol marker supplements tone color and boundary treatment.
    <lang><zh-CN>符号来自已规范化的有限 tone，不是默认运行时文字，也不代表组件对结果的判断。</zh-CN><en>The symbol comes from normalized finite tone, is not default runtime copy, and does not represent a component judgment of result.</en></lang>
    -->
    <text class="u-notice__marker">{{ toneMarker }}</text>
    <text class="u-notice__message">{{ message }}</text>

    <!--
    @lang zh-CN dismiss control 仅在调用方提供可见文字时出现。
    @lang en The dismiss control appears only when the caller provides visible text.
    <lang><zh-CN>它只 emit 局部 dismiss 意图，不改变 visible、不启动计时器，也不影响其他 notice。</zh-CN><en>It emits local dismiss intent only, changes no visible state, starts no timer, and affects no other notice.</en></lang>
    -->
    <UButton
      v-if="hasDismissControl"
      class="u-notice__dismiss"
      variant="text"
      size="sm"
      :label="dismissText"
      @click="handleDismiss"
    />
  </view>
</template>

<script setup>
import { computed } from 'vue';
import UButton from '../u-button/u-button.vue';

// <lang><zh-CN>声明稳定的 kebab-case 组件名，使模板、manifest 与显式 plugin registry 使用同一运行时名称。</zh-CN><en>Declares the stable kebab-case component name so templates, the manifest, and the explicit plugin registry use one runtime name.</en></lang>
defineOptions({
  name: 'u-notice'
});

// <lang><zh-CN>可呈现的有限 feedback tone；该集合限制 CSS 类和符号映射，不推断应用数据或请求状态。</zh-CN><en>Finite feedback tones that may be presented; this collection limits CSS classes and symbol mapping and infers no application data or request state.</en></lang>
const supportedTones = Object.freeze(['info', 'success', 'warning', 'error']);

// <lang><zh-CN>每个已批准 tone 的非颜色符号；符号只补充调用方消息，绝不代替可读反馈文字。</zh-CN><en>Non-color symbol for every approved tone; symbols supplement caller message only and never replace readable feedback text.</en></lang>
const toneMarkers = Object.freeze({
  info: 'i',
  success: '✓',
  warning: '!',
  error: '×'
});

// <lang><zh-CN>notice 只接收调用方可见状态、有限 tone、消息和可选文字 control；它不接收时长、队列、service、请求或业务对象。</zh-CN><en>The notice accepts only caller visible state, finite tone, message, and optional text control; it accepts no duration, queue, service, request, or business object.</en></lang>
const props = defineProps({
  // <lang><zh-CN>可见状态由应用完全拥有；默认隐藏避免组件在未选择时生成 inline feedback。</zh-CN><en>Visible state is fully owned by the application; the hidden default prevents the component from generating inline feedback when not selected.</en></lang>
  visible: {
    type: Boolean,
    default: false
  },
  // <lang><zh-CN>tone 仅选择有限呈现处理；未知字符串将在计算层安全规范化，绝不写回调用方 prop。</zh-CN><en>Tone selects finite presentation treatment only; an unknown string is safely normalized in computed state and never written back to caller prop.</en></lang>
  tone: {
    type: String,
    default: 'info'
  },
  // <lang><zh-CN>消息由应用本地化并拥有；空默认值与 visible guard 配合避免组件生成默认反馈文字。</zh-CN><en>The application localizes and owns the message; an empty default works with the visible guard to prevent component-generated feedback text.</en></lang>
  message: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>dismiss 标签决定 dismiss control 是否存在；空值不产生无标签按钮、自动关闭或队列操作。</zh-CN><en>The dismiss label decides whether a dismiss control exists; an empty value produces no unlabeled button, automatic close, or queue operation.</en></lang>
  dismissText: {
    type: String,
    default: ''
  }
});

// <lang><zh-CN>唯一公开事件只报告应用选择的 dismiss 意图；应用在组件外决定是否隐藏、替换或保留 notice。</zh-CN><en>The sole public event reports only application-selected dismiss intent; the application decides outside the component whether to hide, replace, or retain the notice.</en></lang>
const emit = defineEmits(['dismiss']);

// <lang><zh-CN>未知 tone 回退到 info，以保持 CSS、符号和 token 表面有限且可审计；该回退不表示错误状态。</zh-CN><en>Unknown tone falls back to info, keeping CSS, symbol, and token surface finite and auditable; this fallback does not indicate an error state.</en></lang>
const effectiveTone = computed(() => (supportedTones.includes(props.tone) ? props.tone : 'info'));

// <lang><zh-CN>根可见性同时要求应用选择 visible 和提供可读消息，避免没有文本的状态标记被误认为完整反馈。</zh-CN><en>Root visibility requires both application-selected visible state and readable message, avoiding a textless state marker being mistaken for complete feedback.</en></lang>
const isVisible = computed(() => props.visible && props.message.length > 0);

// <lang><zh-CN>根类只消费已经规范化的 tone，从而不把任意调用方字符串拼接为未审阅的 CSS 类。</zh-CN><en>Root classes consume normalized tone only, preventing arbitrary caller strings from being concatenated into unreviewed CSS classes.</en></lang>
const noticeClasses = computed(() => [
  'u-notice',
  `u-notice--${effectiveTone.value}`
]);

// <lang><zh-CN>符号映射使用与根类相同的规范化 tone，确保颜色、边界和非颜色标记描述同一呈现状态。</zh-CN><en>Symbol mapping uses the same normalized tone as root classes, ensuring color, boundary, and non-color marker describe one presentation state.</en></lang>
const toneMarker = computed(() => toneMarkers[effectiveTone.value]);

// <lang><zh-CN>dismiss control 可见性只由非空调用方文字导出；不根据 tone 或消息内容隐式生成关闭入口。</zh-CN><en>Dismiss-control visibility derives only from non-empty caller text; no close entry is implicitly generated from tone or message content.</en></lang>
const hasDismissControl = computed(() => props.dismissText.length > 0);

/**
 * @lang zh-CN 仅在 notice 实际可见且 dismiss control 有文字时转发 dismiss 意图；本函数不写 visible、不启动计时器，也不管理队列。
 * @lang en Forwards dismiss intent only when the notice is actually visible and dismiss control has text; this function writes no visible state, starts no timer, and manages no queue.
 * @param {unknown} event <lang><zh-CN>内建 UButton 提供的原始本地点击事件。</zh-CN><en>Original local click event supplied by the built-in UButton.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合条件时 emit `dismiss`。</zh-CN><en>No return value; when eligible, emits `dismiss`.</en></lang>
 */
function handleDismiss(event) {
  // <lang><zh-CN>guard 同时检查文本可见性与 control 存在性，使隐藏或缺失标签时的直接 handler 调用也保持零事件。</zh-CN><en>The guard checks both text visibility and control existence so direct handler calls while hidden or missing label also retain zero events.</en></lang>
  if (!isVisible.value || !hasDismissControl.value) {
    return;
  }

  // <lang><zh-CN>保留原始 local event 给应用；组件不决定 notice 何时或是否从页面消失。</zh-CN><en>Preserves the original local event for the application; the component does not decide when or whether the notice disappears from the page.</en></lang>
  emit('dismiss', event);
}
</script>

<style src="./u-notice.css"></style>
