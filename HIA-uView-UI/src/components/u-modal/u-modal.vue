<!--
@component UModal
@lang zh-CN 提供 caller-owned modal 与显式 feedback scope 宿主。受控模式只请求 model 写回；service 模式只承接同一调用方 scope 的有限文字配置，不发现页面、不执行回调、请求或导航。
@lang en Provides a caller-owned modal and an explicit feedback-scope host. Controlled mode only requests model writeback; service mode accepts finite text configuration from the same caller scope and discovers no page and executes no callback, request, or navigation.
-->
<template>
  <!--
  @lang zh-CN 根层只在受控输入或显式 service session 可见时存在。
  @lang en The root layer exists only while controlled input or an explicit service session is visible.
  <lang><zh-CN>Service session 只覆盖当前呈现快照，不改写 visible/modelValue，也不拥有调用方业务状态。</zh-CN><en>A service session overrides only the current presentation snapshot and writes neither visible/modelValue nor caller business state.</en></lang>
  -->
  <view v-if="isVisible" class="u-modal">
    <!--
    @lang zh-CN mask 仅在调用方显式允许时报告受限取消意图。
    @lang en The mask reports a constrained cancellation intent only when explicitly allowed by the caller.
    <lang><zh-CN>它不锁滚动、不恢复焦点，也不调用平台关闭或路由 API。</zh-CN><en>It neither locks scrolling nor restores focus nor calls platform close or routing APIs.</en></lang>
    -->
    <view class="u-modal__mask" @click="handleMaskCancel" />

    <!--
    @lang zh-CN panel 组合解析后的标题、内容和有限文字 control。
    @lang en The panel composes resolved title, content, and finite text controls.
    <lang><zh-CN>受控 slot 与 service 文字互斥，防止 service 意外取得任意 slot 内容的所有权。</zh-CN><en>The controlled slot and service copy are mutually exclusive so a service cannot accidentally acquire ownership of arbitrary slot content.</en></lang>
    -->
    <view class="u-modal__panel" role="dialog" aria-modal="true">
      <text v-if="hasTitle" class="u-modal__title">{{ resolvedTitle }}</text>

      <!--
      @lang zh-CN Service session 只呈现已规范化 content；否则保留调用方 default slot。
      @lang en A service session presents only normalized content; otherwise the caller default slot is preserved.
      -->
      <view class="u-modal__content">
        <text v-if="hasServiceSession">{{ resolvedContent }}</text>
        <slot v-else>{{ resolvedContent }}</slot>
      </view>

      <!--
      @lang zh-CN 操作行只包含具有可见名称的取消/确认 control。
      @lang en The action row contains only cancel/confirm controls with visible names.
      <lang><zh-CN>确认 loading 只表示当前 session 等待调用方决定；它不会启动异步任务。</zh-CN><en>Confirm loading only means the current session awaits a caller decision; it starts no asynchronous task.</en></lang>
      -->
      <view v-if="hasActions" class="u-modal__actions">
        <UButton
          v-if="hasCancelControl"
          variant="secondary"
          :label="resolvedCancelText"
          @click="handleCancel"
        />
        <UButton
          v-if="hasConfirmControl"
          :label="resolvedConfirmText"
          :loading="isConfirmLoading"
          @click="handleConfirm"
        >
          <slot v-if="!hasServiceSession" name="confirm-button">{{ resolvedConfirmText }}</slot>
          <template v-else>{{ resolvedConfirmText }}</template>
        </UButton>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue';
import {
  registerUFeedbackHost,
  settleUFeedbackRequest
} from '../../feedback-service-runtime.mjs';
import UButton from '../u-button/u-button.vue';

// <lang><zh-CN>稳定组件名继续与 manifest、Easycom 与显式 plugin registry 一致。</zh-CN><en>The stable component name remains aligned with the manifest, Easycom, and explicit plugin registry.</en></lang>
defineOptions({ name: 'u-modal' });

// <lang><zh-CN>Props 分成 caller-controlled presentation 与显式 opt-in service host 两组；不接受 callback、路由、网络或任意样式对象。</zh-CN><en>Props are split between caller-controlled presentation and an explicit opt-in service host; callbacks, routing, networking, and arbitrary style objects are not accepted.</en></lang>
const props = defineProps({
  // <lang><zh-CN>显式 visible 在存在时优先于迁移 modelValue。</zh-CN><en>Explicit visible takes precedence over migration modelValue when present.</en></lang>
  visible: { type: Boolean, default: undefined },
  // <lang><zh-CN>modelValue 是受控可见状态；组件只 emit 下一值请求。</zh-CN><en>ModelValue is controlled visibility; the component only emits next-value requests.</en></lang>
  modelValue: { type: Boolean, default: false },
  // <lang><zh-CN>标题由调用方本地化；空字符串不会制造默认语言。</zh-CN><en>The title is caller-localized; an empty string invents no default language.</en></lang>
  title: { type: String, default: '' },
  // <lang><zh-CN>content 为无 default slot 场景提供熟悉的纯文字入口。</zh-CN><en>Content provides a familiar text-only entry when no default slot is used.</en></lang>
  content: { type: String, default: '' },
  // <lang><zh-CN>标题开关只影响呈现，不改变 session 或关闭行为。</zh-CN><en>The title switch affects presentation only and changes no session or close behavior.</en></lang>
  showTitle: { type: Boolean, default: true },
  // <lang><zh-CN>确认文字决定内建确认 control 的可访问名称。</zh-CN><en>Confirm text determines the accessible name of the built-in confirm control.</en></lang>
  confirmText: { type: String, default: '' },
  // <lang><zh-CN>取消文字决定内建取消 control 是否可呈现。</zh-CN><en>Cancel text determines whether the built-in cancel control can render.</en></lang>
  cancelText: { type: String, default: '' },
  // <lang><zh-CN>undefined 表示按文字/slot 推断；显式 false 抑制确认 control。</zh-CN><en>Undefined means derive from copy/slot; explicit false suppresses the confirm control.</en></lang>
  showConfirmButton: { type: Boolean, default: undefined },
  // <lang><zh-CN>undefined 表示按取消文字推断；显式 false 抑制取消 control。</zh-CN><en>Undefined means derive from cancel copy; explicit false suppresses the cancel control.</en></lang>
  showCancelButton: { type: Boolean, default: undefined },
  // <lang><zh-CN>asyncClose 让确认意图进入局部 loading，直到调用方 clearLoading/关闭；它不启动任务。</zh-CN><en>AsyncClose puts confirmation intent into local loading until the caller clears loading or closes; it starts no task.</en></lang>
  asyncClose: { type: Boolean, default: false },
  // <lang><zh-CN>maskCloseAble 仅授权 mask 产生取消意图，保持上游熟悉拼写。</zh-CN><en>MaskCloseAble only authorizes mask to produce cancellation intent and retains the familiar upstream spelling.</en></lang>
  maskCloseAble: { type: Boolean, default: false },
  // <lang><zh-CN>serviceScope 必须来自 createUFeedbackScope；普通对象会被 runtime 确定拒绝。</zh-CN><en>ServiceScope must come from createUFeedbackScope; an ordinary object is deterministically rejected by runtime.</en></lang>
  serviceScope: { type: Object, default: null },
  // <lang><zh-CN>serviceHost 是显式 opt-in；仅传 scope 不会注册宿主。</zh-CN><en>ServiceHost is explicit opt-in; supplying only a scope registers no host.</en></lang>
  serviceHost: { type: Boolean, default: false }
});

// <lang><zh-CN>事件保留受控写回与确认/取消 intent；service metadata 仅作为第二参数追加。</zh-CN><en>Events retain controlled writeback and confirm/cancel intent; service metadata is appended only as a second argument.</en></lang>
const emit = defineEmits(['confirm', 'cancel', 'update:modelValue']);

// <lang><zh-CN>Slots 只用于判定受控 confirm control 是否拥有可见名称。</zh-CN><en>Slots are used only to determine whether the controlled confirm control has a visible name.</en></lang>
const slots = useSlots();

// <lang><zh-CN>受控确认 loading 独立于 service snapshot，避免两个状态源相互污染。</zh-CN><en>Controlled confirm loading is isolated from the service snapshot so the two state sources cannot contaminate each other.</en></lang>
const controlledConfirmLoading = ref(false);

// <lang><zh-CN>Service session 只保存 runtime 已规范化、冻结后再浅复制的有限呈现值与 request id。</zh-CN><en>The service session stores only finite presentation values normalized by the runtime, shallow-copied from a frozen snapshot, and a request id.</en></lang>
const serviceSession = ref(null);

// <lang><zh-CN>组件是否已进入 mounted lifecycle；卸载后禁止重新注册 host。</zh-CN><en>Whether the component has entered its mounted lifecycle; host re-registration is forbidden after unmount.</en></lang>
let isMounted = false;

// <lang><zh-CN>当前精确 host registration 的 tokenized disposer；旧 disposer 不得清除替代 host。</zh-CN><en>Tokenized disposer of the current exact host registration; a stale disposer must not clear a replacement host.</en></lang>
let unregisterServiceHost = null;

// <lang><zh-CN>受控可见值只执行 visible 优先、modelValue 回退，不合并业务状态。</zh-CN><en>Controlled visibility follows visible precedence and modelValue fallback only and merges no business state.</en></lang>
const controlledVisible = computed(() => props.visible ?? props.modelValue);

// <lang><zh-CN>非空 serviceSession 精确表示由当前 host 承接的一个 service request。</zh-CN><en>A non-null serviceSession exactly represents one service request handled by the current host.</en></lang>
const hasServiceSession = computed(() => serviceSession.value !== null);

// <lang><zh-CN>Service session 可见性优先于 caller-controlled surface，但不写回后者。</zh-CN><en>Service-session visibility takes precedence over the caller-controlled surface without writing back to it.</en></lang>
const isVisible = computed(() => hasServiceSession.value || controlledVisible.value);

// <lang><zh-CN>解析值只读取当前 service snapshot 或 props；不会读取 scope 内部状态。</zh-CN><en>Resolved values read only the current service snapshot or props and never read scope internals.</en></lang>
const resolvedTitle = computed(() => serviceSession.value?.title ?? props.title);
// <lang><zh-CN>内容只在当前 service snapshot 存在时覆盖受控 content。</zh-CN><en>Content is overridden only while a current service snapshot exists.</en></lang>
const resolvedContent = computed(() => serviceSession.value?.content ?? props.content);
// <lang><zh-CN>确认文字遵循相同的 session 优先级。</zh-CN><en>Confirm copy follows the same session precedence.</en></lang>
const resolvedConfirmText = computed(() => serviceSession.value?.confirmText ?? props.confirmText);
// <lang><zh-CN>取消文字遵循相同的 session 优先级。</zh-CN><en>Cancel copy follows the same session precedence.</en></lang>
const resolvedCancelText = computed(() => serviceSession.value?.cancelText ?? props.cancelText);
// <lang><zh-CN>标题开关只从当前呈现来源解析。</zh-CN><en>The title switch resolves only from the current presentation source.</en></lang>
const resolvedShowTitle = computed(() => serviceSession.value?.showTitle ?? props.showTitle);
// <lang><zh-CN>确认 control 开关不读取业务状态。</zh-CN><en>The confirm-control switch reads no business state.</en></lang>
const resolvedShowConfirmButton = computed(() => serviceSession.value?.showConfirmButton ?? props.showConfirmButton);
// <lang><zh-CN>取消 control 开关不读取业务状态。</zh-CN><en>The cancel-control switch reads no business state.</en></lang>
const resolvedShowCancelButton = computed(() => serviceSession.value?.showCancelButton ?? props.showCancelButton);
// <lang><zh-CN>异步关闭只属于当前呈现来源。</zh-CN><en>Async-close belongs only to the current presentation source.</en></lang>
const resolvedAsyncClose = computed(() => serviceSession.value?.asyncClose ?? props.asyncClose);
// <lang><zh-CN>遮罩授权只属于当前呈现来源；service 未声明时回退显式 host prop。</zh-CN><en>Mask authorization belongs only to the current presentation source; service absence falls back to the explicit host prop.</en></lang>
const resolvedMaskCloseAble = computed(() => serviceSession.value?.maskCloseAble ?? props.maskCloseAble);

// <lang><zh-CN>标题必须同时被允许且非空，防止创建空 heading。</zh-CN><en>A title must be allowed and non-empty, preventing an empty heading.</en></lang>
const hasTitle = computed(() => resolvedShowTitle.value && resolvedTitle.value.trim().length > 0);

// <lang><zh-CN>受控 confirm slot 或非空文字提供名称；service 模式只允许规范化文字。</zh-CN><en>A controlled confirm slot or non-empty copy provides the name; service mode permits normalized copy only.</en></lang>
const hasConfirmName = computed(() => hasServiceSession.value
  ? resolvedConfirmText.value.trim().length > 0
  : Boolean(slots['confirm-button']) || resolvedConfirmText.value.trim().length > 0);

// <lang><zh-CN>确认 control 需要名称且未被显式 false 抑制。</zh-CN><en>The confirm control requires a name and must not be suppressed by explicit false.</en></lang>
const hasConfirmControl = computed(() => hasConfirmName.value && resolvedShowConfirmButton.value !== false);

// <lang><zh-CN>取消 control 需要非空文字且未被显式 false 抑制。</zh-CN><en>The cancel control requires non-empty copy and must not be suppressed by explicit false.</en></lang>
const hasCancelControl = computed(() => resolvedCancelText.value.trim().length > 0 && resolvedShowCancelButton.value !== false);

// <lang><zh-CN>操作行只在至少一个具名 control 存在时渲染。</zh-CN><en>The action row renders only when at least one named control exists.</en></lang>
const hasActions = computed(() => hasConfirmControl.value || hasCancelControl.value);

// <lang><zh-CN>Service loading 存在于 snapshot；受控 loading 存在于局部 ref，两者不共享写入。</zh-CN><en>Service loading lives in the snapshot and controlled loading in a local ref; they share no write path.</en></lang>
const isConfirmLoading = computed(() => serviceSession.value?.loading ?? controlledConfirmLoading.value);

/**
 * @lang zh-CN 仅清除当前 modal 的局部确认 loading；不关闭 modal、不完成任务或 emit。
 * @lang en Clears only local confirm loading of the current modal; it neither closes the modal nor completes a task nor emits.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function clearLoading() {
  // <lang><zh-CN>Service snapshot 通过新对象替换，保留 request identity 并避免改写冻结输入。</zh-CN><en>The service snapshot is replaced with a new object, preserving request identity and avoiding mutation of frozen input.</en></lang>
  if (serviceSession.value) {
    serviceSession.value = Object.freeze({ ...serviceSession.value, loading: false });
    return;
  }

  // <lang><zh-CN>没有 service session 时只清除受控路径的局部 projection。</zh-CN><en>Without a service session, only the local projection of the controlled path is cleared.</en></lang>
  controlledConfirmLoading.value = false;
}

/**
 * @lang zh-CN 清除 service session，并可通知显式 scope 当前 request 已结束。
 * @lang en Clears the service session and may notify the explicit scope that the current request ended.
 * @param {boolean} settleScope <lang><zh-CN>是否结算 scope active request。</zh-CN><en>Whether to settle the scope active request.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function releaseServiceSession(settleScope) {
  // <lang><zh-CN>捕获当前有限 session 后立即清空，使同步 reentry 不能再次结束同一 request。</zh-CN><en>Captures the current finite session and clears it immediately so synchronous re-entry cannot finish the same request again.</en></lang>
  const currentSession = serviceSession.value;
  serviceSession.value = null;

  // <lang><zh-CN>Host replacement/dispose 已由 scope 自身结算，只有用户/本地路径需要反向通知。</zh-CN><en>Host replacement/disposal is already settled by the scope itself, so only user/local paths notify it back.</en></lang>
  if (settleScope && currentSession) {
    settleUFeedbackRequest(currentSession.scope, 'modal', currentSession.requestId);
  }
}

/**
 * @lang zh-CN 承接一个已由 service runtime 规范化的 modal request，整体替换旧 session。
 * @lang en Accepts one modal request normalized by the service runtime and wholly replaces the old session.
 * @param {{requestId: number, options: Readonly<Record<string, unknown>>}} request <lang><zh-CN>scope 分配的 id 与有限 modal 呈现快照。</zh-CN><en>Scope-allocated id and finite modal presentation snapshot.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function showServiceModal(request) {
  // <lang><zh-CN>Host 只解构 runtime 创建的两个固定字段，不保留 request wrapper 或额外调用方对象。</zh-CN><en>The host destructures only the two fixed fields created by runtime and retains neither the request wrapper nor extra caller objects.</en></lang>
  const { options, requestId } = request;
  // <lang><zh-CN>Service show 只替换 service snapshot；受控 async-close loading 属于另一状态源，必须在 service session 结束后原样恢复。</zh-CN><en>A service show replaces only the service snapshot; controlled async-close loading belongs to another state source and must be restored unchanged after the service session ends.</en></lang>
  serviceSession.value = Object.freeze({ ...options, requestId, scope: props.serviceScope });
}

/**
 * @lang zh-CN 由 service controller 请求关闭当前 session；expected id 的二次 guard 防止 host 被直接误用。
 * @lang en Closes the current session at service-controller request; a second expected-id guard prevents direct host misuse.
 * @param {number|undefined} expectedRequestId <lang><zh-CN>可选期望 request id。</zh-CN><en>Optional expected request id.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function closeServiceModal(expectedRequestId) {
  // <lang><zh-CN>陈旧 id 或缺 session 时保持幂等零副作用；scope runtime 会返回精确结果。</zh-CN><en>A stale id or absent session remains idempotent with zero side effect; the scope runtime returns the precise result.</en></lang>
  if (!serviceSession.value || (expectedRequestId !== undefined && serviceSession.value.requestId !== expectedRequestId)) return;

  // <lang><zh-CN>Controller close 的 active-state 结算由 runtime 完成，host 只清本地呈现。</zh-CN><en>Runtime settles active state for controller close; the host clears only local presentation.</en></lang>
  releaseServiceSession(false);
}

/**
 * @lang zh-CN 由 service controller 清除当前 request 的确认 loading。
 * @lang en Clears confirm loading for the current request at service-controller request.
 * @param {number|undefined} expectedRequestId <lang><zh-CN>当前 active request id。</zh-CN><en>Current active request id.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function clearServiceModalLoading(expectedRequestId) {
  // <lang><zh-CN>只有匹配 session 能更新 loading，避免陈旧 controller 触碰新 modal。</zh-CN><en>Only a matching session may update loading, preventing a stale controller from touching a newer modal.</en></lang>
  if (!serviceSession.value || (expectedRequestId !== undefined && serviceSession.value.requestId !== expectedRequestId)) return;
  clearLoading();
}

// <lang><zh-CN>Host 对象只暴露 feedback runtime 允许调用的四个固定方法。</zh-CN><en>The host object exposes only the four fixed methods callable by the feedback runtime.</en></lang>
const serviceHost = Object.freeze({
  show: showServiceModal,
  close: closeServiceModal,
  clearLoading: clearServiceModalLoading,
  // <lang><zh-CN>替换/卸载 release 只清本地 session；scope 自己负责 request state。</zh-CN><en>Replacement/unmount release clears only the local session; the scope owns request state.</en></lang>
  release: () => releaseServiceSession(false)
});

/**
 * @lang zh-CN 依据当前 props 原子替换 modal host registration。
 * @lang en Atomically replaces the modal host registration from current props.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function syncServiceHost() {
  // <lang><zh-CN>先撤销精确旧 token；runtime 确保它不能删除随后替代的 host。</zh-CN><en>Revokes the exact old token first; runtime ensures it cannot delete a later replacement host.</en></lang>
  if (typeof unregisterServiceHost === 'function') unregisterServiceHost();
  unregisterServiceHost = null;

  // <lang><zh-CN>未挂载、未 opt-in 或缺 scope 时不注册，也不自动发现任何宿主。</zh-CN><en>When unmounted, not opted in, or missing a scope, registers nothing and auto-discovers no host.</en></lang>
  if (!isMounted || !props.serviceHost || !props.serviceScope) return;

  // <lang><zh-CN>Runtime 返回 tokenized disposer；无效 scope 会稳定返回不可注册结果而不抛异常。</zh-CN><en>Runtime returns a tokenized disposer; an invalid scope yields a stable non-registration result without throwing.</en></lang>
  const unregister = registerUFeedbackHost(props.serviceScope, 'modal', serviceHost);
  if (typeof unregister === 'function') unregisterServiceHost = unregister;
}

/**
 * @lang zh-CN 处理确认 control，保持受控 update→confirm 顺序或 service session 的 async-close 生命周期。
 * @lang en Handles the confirm control, preserving controlled update-to-confirm order or the async-close lifecycle of a service session.
 * @param {unknown} event <lang><zh-CN>原始本地点击事件。</zh-CN><en>Original local click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleConfirm(event) {
  // <lang><zh-CN>隐藏、无 control 或 loading 状态即使直接调用 handler 也保持零事件。</zh-CN><en>Hidden, control-less, or loading state retains zero events even under direct handler invocation.</en></lang>
  if (!isVisible.value || !hasConfirmControl.value || isConfirmLoading.value) return;

  // <lang><zh-CN>Service confirmation 只操作当前 session，并追加不可执行 metadata。</zh-CN><en>Service confirmation operates only on the current session and appends non-executable metadata.</en></lang>
  if (serviceSession.value) {
    // <lang><zh-CN>先捕获 request id，避免同步 emit listener 关闭/替换 session 后 metadata 漂移。</zh-CN><en>Captures the request id first so synchronous emit listeners cannot drift metadata by closing or replacing the session.</en></lang>
    const requestId = serviceSession.value.requestId;

    // <lang><zh-CN>async close 保持 modal 可见并进入 loading；普通确认先结束 session。</zh-CN><en>Async close keeps the modal visible and enters loading; ordinary confirmation ends the session first.</en></lang>
    if (resolvedAsyncClose.value) {
      serviceSession.value = Object.freeze({ ...serviceSession.value, loading: true });
    } else {
      releaseServiceSession(true);
    }

    // <lang><zh-CN>事件不携带 callback、scope 或 host，只披露稳定来源和 request id。</zh-CN><en>The event carries no callback, scope, or host and discloses only stable source and request id.</en></lang>
    emit('confirm', event, Object.freeze({ source: 'service', requestId }));
    return;
  }

  // <lang><zh-CN>受控 asyncClose 只进入局部 loading，不请求关闭。</zh-CN><en>Controlled asyncClose only enters local loading and does not request closure.</en></lang>
  if (resolvedAsyncClose.value) {
    controlledConfirmLoading.value = true;
    emit('confirm', event);
    return;
  }

  // <lang><zh-CN>常规受控路径严格先请求 modelValue=false，再报告 confirm intent。</zh-CN><en>The ordinary controlled path strictly requests modelValue=false before reporting confirm intent.</en></lang>
  emit('update:modelValue', false);
  emit('confirm', event);
}

/**
 * @lang zh-CN 处理取消 control，并在 service/受控模式中结束对应可见来源。
 * @lang en Handles the cancel control and ends the corresponding visibility source in service or controlled mode.
 * @param {unknown} event <lang><zh-CN>原始本地点击事件。</zh-CN><en>Original local click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleCancel(event) {
  // <lang><zh-CN>隐藏、无取消 control 时保持零事件。</zh-CN><en>Hidden state or absence of a cancel control retains zero events.</en></lang>
  if (!isVisible.value || !hasCancelControl.value) return;

  // <lang><zh-CN>Service 取消先结算 session，再报告有限 metadata。</zh-CN><en>Service cancellation settles the session before reporting finite metadata.</en></lang>
  if (serviceSession.value) {
    const requestId = serviceSession.value.requestId;
    releaseServiceSession(true);
    emit('cancel', event, Object.freeze({ source: 'service', requestId, reason: 'cancel' }));
    return;
  }

  // <lang><zh-CN>受控取消严格保持 update→cancel 顺序。</zh-CN><en>Controlled cancellation strictly preserves update-to-cancel order.</en></lang>
  emit('update:modelValue', false);
  emit('cancel', event);
}

/**
 * @lang zh-CN 仅在显式允许时把 mask 点击解释为有限取消意图。
 * @lang en Interprets a mask click as a finite cancellation intent only when explicitly allowed.
 * @param {unknown} event <lang><zh-CN>原始 mask 点击事件。</zh-CN><en>Original mask click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleMaskCancel(event) {
  // <lang><zh-CN>默认 mask 不可关闭；隐藏状态和未授权路径保持零事件。</zh-CN><en>The mask is non-closable by default; hidden and unauthorized paths retain zero events.</en></lang>
  if (!isVisible.value || !resolvedMaskCloseAble.value) return;

  // <lang><zh-CN>Service mask 结束当前 request 并以 cancel event 第二参数披露 reason。</zh-CN><en>A service mask ends the current request and discloses its reason in the second cancel-event argument.</en></lang>
  if (serviceSession.value) {
    const requestId = serviceSession.value.requestId;
    releaseServiceSession(true);
    emit('cancel', event, Object.freeze({ source: 'service', requestId, reason: 'mask' }));
    return;
  }

  // <lang><zh-CN>受控 mask 仍严格先请求 modelValue=false，再报告 mask cancellation。</zh-CN><en>The controlled mask still strictly requests modelValue=false before reporting mask cancellation.</en></lang>
  emit('update:modelValue', false);
  emit('cancel', event, Object.freeze({ source: 'controlled', reason: 'mask' }));
}

// <lang><zh-CN>关闭受控 modal 时清除旧 loading projection，避免下次打开继承陈旧状态。</zh-CN><en>Closing a controlled modal clears stale loading projection so the next opening cannot inherit it.</en></lang>
watch(controlledVisible, (visible) => {
  if (!visible) controlledConfirmLoading.value = false;
});

// <lang><zh-CN>Scope identity 或 opt-in 变化只触发精确注销/注册，不迁移旧 session。</zh-CN><en>A scope-identity or opt-in change triggers only exact unregister/register and migrates no old session.</en></lang>
watch(() => [props.serviceScope, props.serviceHost], syncServiceHost);

// <lang><zh-CN>Mounted 后才允许 host 可被 controller 解析。</zh-CN><en>The host becomes controller-resolvable only after mount.</en></lang>
onMounted(() => {
  isMounted = true;
  syncServiceHost();
});

// <lang><zh-CN>卸载先禁止重注册，再撤销 token 并静默清 session。</zh-CN><en>Unmount first forbids re-registration, then revokes the token and silently clears the session.</en></lang>
onBeforeUnmount(() => {
  isMounted = false;
  if (typeof unregisterServiceHost === 'function') unregisterServiceHost();
  unregisterServiceHost = null;
  releaseServiceSession(false);
  controlledConfirmLoading.value = false;
});

// <lang><zh-CN>Component ref 只公开上游熟悉的 clearLoading；service show/close 仍通过显式 controller 分层。</zh-CN><en>The component ref exposes only familiar clearLoading; service show/close remain layered behind the explicit controller.</en></lang>
defineExpose({ clearLoading });
</script>

<style src="./u-modal.css"></style>
