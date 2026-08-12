<!--
@component UNoticeBar
@lang zh-CN 提供 caller-controlled、非滚动的横幅反馈面；调用方拥有可见性、文字、tone 与关闭/点击决定，组件不轮播、计时、自动消失或管理全局队列。
@lang en Provides a caller-controlled, non-scrolling banner-feedback surface; the caller owns visibility, text, tone, and close/click decisions, while the component does not rotate, time, auto-dismiss, or manage a global queue.
-->
<template>
  <!--
  @lang zh-CN 只有解析后的可见状态和非空文字同时成立才输出横幅；文字 button 只报告本地 click intent。
  @lang en The banner outputs only when resolved visibility and nonempty text both hold; the text button reports local click intent only.
  <lang><zh-CN>close 与 click 均不写回可见性或管理反馈队列。</zh-CN><en>Neither close nor click writes visibility back or manages a feedback queue.</en></lang>
  -->
  <view v-if="isVisible" :class="noticeClasses" role="status" aria-live="polite">
    <text class="u-notice-bar__marker" aria-hidden="true">!</text>
    <button class="u-notice-bar__text" type="button" @click="emitClick">{{ displayText }}</button>
    <button v-if="hasClose" class="u-notice-bar__close" type="button" @click="emitClose"><text>{{ closeText }}</text></button>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称与既有 inline `u-notice` 并存；两者不 alias，避免误称 API 兼容。</zh-CN><en>The stable name coexists with existing inline `u-notice`; the two are not aliases, avoiding a false API-compatibility claim.</en></lang>
defineOptions({ name: 'u-notice-bar' });

// <lang><zh-CN>有限 tone 只选择视觉 token，不将应用消息解释为业务或后端结果。</zh-CN><en>Finite tones select visual tokens only and do not interpret application messages as business or backend results.</en></lang>
const supportedTones = Object.freeze(['info', 'success', 'warning', 'error']);

// <lang><zh-CN>visible 是既有 HIA 显式 alias；未声明时采用上游熟悉的 show，并保持调用方的显式可见性优先。</zh-CN><en>Visible is the existing explicit HIA alias; when absent, upstream-familiar show applies while preserving caller explicit-visibility precedence.</en></lang>
const props = defineProps({
  // <lang><zh-CN>显式 visible 覆盖 show；undefined 表示调用方未选择 HIA alias。</zh-CN><en>An explicit visible overrides show; undefined means the caller did not choose the HIA alias.</en></lang>
  visible: { type: Boolean, default: undefined },
  // <lang><zh-CN>show 保持上游布尔默认 true；空 text 仍不会产生无内容横幅。</zh-CN><en>Show retains the upstream boolean default true; empty text still produces no contentless banner.</en></lang>
  show: { type: Boolean, default: true },
  // <lang><zh-CN>text 是调用方拥有的本地化回退正文；仅在 list 为空时使用，组件不会从后端或全局消息源生成它。</zh-CN><en>Text is caller-owned localized fallback body copy; it applies only while list is empty, and the component generates none from a backend or global message source.</en></lang>
  text: { type: String, default: '' },
  // <lang><zh-CN>list 是调用方提供的有限通知文字数组；非空时按 current 投影单项，但组件不会轮播、计时或修改数组。</zh-CN><en>List is a caller-provided finite notice-copy array; when nonempty it projects one item by current, while the component never rotates, times, or mutates the array.</en></lang>
  list: { type: Array, default: () => [] },
  // <lang><zh-CN>current 接受数字或数字字符串索引；无效索引在非空 list 内确定性回退到 0。</zh-CN><en>Current accepts a numeric or numeric-string index; an invalid index deterministically falls back to 0 within a nonempty list.</en></lang>
  current: { type: [Number, String], default: 0 },
  // <lang><zh-CN>tone 只能选择有限呈现 token；未知值回退 info。</zh-CN><en>Tone may select only finite presentation tokens; unknown values fall back to info.</en></lang>
  tone: { type: String, default: 'info' },
  // <lang><zh-CN>非空 closeText 才创建关闭 control；组件不生成默认本地化文字。</zh-CN><en>A nonempty closeText creates the close control; the component generates no default localized copy.</en></lang>
  closeText: { type: String, default: '' }
});

// <lang><zh-CN>close 与 click 都是本地 intent；应用决定横幅是否消失、替换、导航或保留。</zh-CN><en>Close and click are both local intents; the application decides whether the banner disappears, is replaced, navigates, or is retained.</en></lang>
const emit = defineEmits(['click', 'close']);

// <lang><zh-CN>unknown tone 回退 info，保持 class 和主题 token 表面有限。</zh-CN><en>An unknown tone falls back to info, keeping class and theme-token surface finite.</en></lang>
const safeTone = computed(() => (supportedTones.includes(props.tone) ? props.tone : 'info'));

// <lang><zh-CN>列表条目只接受有限字符串/数字正文并保持原索引；未知对象成为空文字，不执行其成员或隐式序列化。</zh-CN><en>List entries accept finite string/number copy only and preserve original indexes; an unknown object becomes empty copy without executing its members or implicitly serializing it.</en></lang>
const safeList = computed(() => props.list.map((item) => (
  typeof item === 'string' || typeof item === 'number' ? String(item) : ''
)));

// <lang><zh-CN>非空 list 明确覆盖 text；空 list 才保留既有 text contract。</zh-CN><en>A nonempty list explicitly overrides text; only an empty list retains the existing text contract.</en></lang>
const hasList = computed(() => safeList.value.length > 0);

/**
 * @lang zh-CN 把 current 解析为当前非空有限列表中的索引；空白、非整数、负数或越界值统一回退 0。
 * @lang en Resolves current to an index in the current nonempty finite list; blank, noninteger, negative, or out-of-range values uniformly fall back to 0.
 * @returns {number} <lang><zh-CN>用于投影和 click 第二参数的确定性索引。</zh-CN><en>Deterministic index used for projection and the second click argument.</en></lang>
 */
function resolveCurrentIndex() {
  // <lang><zh-CN>空列表没有候选索引，仍返回 0 作为 text 回退点击的稳定附加参数。</zh-CN><en>An empty list has no candidate index and still returns 0 as the stable extra argument for fallback-text clicks.</en></lang>
  if (!hasList.value) {
    return 0;
  }

  // <lang><zh-CN>空白字符串不得经 Number 静默变成 0；它按无效输入走明确回退。</zh-CN><en>A blank string must not silently become 0 through Number; it follows the explicit invalid-input fallback.</en></lang>
  if (typeof props.current === 'string' && props.current.trim().length === 0) {
    return 0;
  }

  // <lang><zh-CN>数字化仅用于有限索引判断，不改变或写回 caller-owned current。</zh-CN><en>Numeric conversion serves only the finite index check and neither changes nor writes back caller-owned current.</en></lang>
  const candidate = Number(props.current);

  // <lang><zh-CN>只有列表内整数可选择对应正文；其余输入确定性使用首项。</zh-CN><en>Only an integer inside the list may select corresponding copy; every other input deterministically uses the first item.</en></lang>
  if (!Number.isInteger(candidate) || candidate < 0 || candidate >= safeList.value.length) {
    return 0;
  }

  return candidate;
}

// <lang><zh-CN>活动索引由 list/current 本地确定，既不自增也不受 timer、viewport 或点击改变。</zh-CN><en>The active index is determined locally from list/current and is neither incremented nor changed by a timer, viewport, or click.</en></lang>
const activeIndex = computed(() => resolveCurrentIndex());

// <lang><zh-CN>非空 list 投影当前索引文字；否则显示 text，且两条路径都保持 caller-owned 本地化内容。</zh-CN><en>A nonempty list projects copy at the current index; otherwise text is displayed, and both paths retain caller-owned localized content.</en></lang>
const displayText = computed(() => (hasList.value ? safeList.value[activeIndex.value] : props.text));

// <lang><zh-CN>只在未显式使用 visible 时采用 show；这不读取页面、路由或全局 feedback state。</zh-CN><en>Uses show only when visible is not explicit; it reads no page, route, or global-feedback state.</en></lang>
const requestedVisible = computed(() => (props.visible === undefined ? props.show : props.visible));

// <lang><zh-CN>可见性要求调用方请求显示且有可读文字；文本不由组件默认生成。</zh-CN><en>Visibility requires caller-requested display and readable text; text is not default-generated by the component.</en></lang>
const isVisible = computed(() => requestedVisible.value && displayText.value.trim().length > 0);

// <lang><zh-CN>根 class 只含固定命名空间及已规范化 tone。</zh-CN><en>Root classes contain only the fixed namespace and normalized tone.</en></lang>
const noticeClasses = computed(() => ['u-notice-bar', `u-notice-bar--${safeTone.value}`]);

// <lang><zh-CN>close control 资格只由 caller 文字决定；组件不从 tone 推断关闭行为。</zh-CN><en>Close-control eligibility derives only from caller text; the component infers no close behavior from tone.</en></lang>
const hasClose = computed(() => props.closeText.trim().length > 0);

/**
 * @lang zh-CN 转发有文字横幅正文的 local click intent；原始事件保持第一参数，当前投影索引作为第二参数，组件不导航。
 * @lang en Forwards local click intent from labeled banner body; the original event remains the first argument, the current projected index is second, and the component does not navigate.
 * @param {unknown} event <lang><zh-CN>原始平台点击事件。</zh-CN><en>Original platform click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `click`。</zh-CN><en>No return value; emits `click` when the guard passes.</en></lang>
 */
function emitClick(event) {
  // <lang><zh-CN>隐藏或空文字横幅保持零事件，保护直接 handler 调用不产生虚假通知操作。</zh-CN><en>Hidden or textless banners retain zero events, protecting direct handler calls from producing a false notice action.</en></lang>
  if (!isVisible.value) {
    return;
  }

  // <lang><zh-CN>事件对象保持原样位于第一参数；稳定索引只描述当前 list/text 投影，不触发轮播或状态写回。</zh-CN><en>The event object remains unchanged as the first argument; the stable index describes only the current list/text projection and triggers neither rotation nor state writeback.</en></lang>
  emit('click', event, activeIndex.value);
}

/**
 * @lang zh-CN 转发有文字 close control 的 intent；不写回 visible/show 或启动自动消失计时器。
 * @lang en Forwards intent from a labeled close control; it writes no visible/show state and starts no auto-dismiss timer.
 * @param {unknown} event <lang><zh-CN>原始平台点击事件。</zh-CN><en>Original platform click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `close`。</zh-CN><en>No return value; emits `close` when the guard passes.</en></lang>
 */
function emitClose(event) {
  // <lang><zh-CN>guard 保护隐藏横幅和无标签 control，保持直接 handler 调用零副作用。</zh-CN><en>The guard protects hidden banners and label-less controls, keeping direct handler calls side-effect free.</en></lang>
  if (!isVisible.value || !hasClose.value) {
    return;
  }

  // <lang><zh-CN>事件交给调用方；组件不管理反馈队列、时间或可见性写回。</zh-CN><en>Hand the event to the caller; the component manages neither feedback queue, time, nor visibility writeback.</en></lang>
  emit('close', event);
}
</script>

<style src="./u-notice-bar.css"></style>
