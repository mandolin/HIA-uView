<!--
@component UToast
@lang zh-CN 提供 caller-controlled feedback、component-ref `show/close/hide` 与显式 feedback-scope host。命令式 session 具有 last-show-wins timer、卸载清理和受控回退，但不执行 callback、请求、路由或平台命令。
@lang en Provides caller-controlled feedback, component-ref `show/close/hide`, and an explicit feedback-scope host. Imperative sessions have a last-show-wins timer, unmount cleanup, and controlled fallback, while executing no callback, request, routing, or platform command.
-->
<template>
  <!--
  @lang zh-CN 可见表面只读取当前命令式 session 或受控 props 的有限快照。
  @lang en The visible surface reads only a finite snapshot from the current imperative session or controlled props.
  <lang><zh-CN>命令式 session 结束后自动回退受控 props，不改写 visible/message。</zh-CN><en>After an imperative session ends, presentation automatically falls back to controlled props without writing visible/message.</en></lang>
  -->
  <view v-if="isVisible" :class="rootClasses" role="status">
    <!--
    @lang zh-CN loading 只组合静态 ULoading indicator，不证明任务存在。
    @lang en Loading composes only a static ULoading indicator and proves no task exists.
    -->
    <ULoading v-if="resolvedLoading" :visible="true" size="sm" tone="neutral" />
    <text class="u-toast__message">{{ resolvedMessage }}</text>
    <button
      v-if="hasCloseControl"
      class="u-toast__close"
      type="button"
      @click="handleCloseControl"
    >
      {{ resolvedCloseText }}
    </button>
  </view>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  normalizeUToastOptions,
  registerUFeedbackHost,
  settleUFeedbackRequest
} from '../../feedback-service-runtime.mjs';
import ULoading from '../u-loading/u-loading.vue';

// <lang><zh-CN>稳定组件名继续服务 manifest、Easycom 和显式 plugin registry。</zh-CN><en>The stable component name continues to serve the manifest, Easycom, and explicit plugin registry.</en></lang>
defineOptions({ name: 'u-toast' });

// <lang><zh-CN>受限 tone 与 position allowlist 同时用于受控 alias fallback 和 class 生成。</zh-CN><en>Finite tone and position allowlists are shared by controlled alias fallback and class generation.</en></lang>
const supportedTones = Object.freeze(['info', 'success', 'warning', 'error']);
// <lang><zh-CN>位置只允许三个熟悉值，不接受任意 selector 或坐标。</zh-CN><en>Position accepts only three familiar values and no arbitrary selector or coordinate.</en></lang>
const supportedPositions = Object.freeze(['top', 'center', 'bottom']);

// <lang><zh-CN>Props 分为 caller-controlled presentation、有限迁移 alias 与显式 service host；危险上游 callback/navigation props 不存在。</zh-CN><en>Props are divided into caller-controlled presentation, finite migration aliases, and an explicit service host; dangerous upstream callback/navigation props do not exist.</en></lang>
const props = defineProps({
  // <lang><zh-CN>visible 只控制受控 fallback；命令式 session 不写回它。</zh-CN><en>Visible controls only the controlled fallback; an imperative session never writes it back.</en></lang>
  visible: { type: Boolean, default: false },
  // <lang><zh-CN>message 是 HIA 的受控文字入口；空值抑制无内容 status。</zh-CN><en>Message is HIA's controlled-copy entry; an empty value suppresses a contentless status.</en></lang>
  message: { type: String, default: '' },
  // <lang><zh-CN>loading 只驱动静态 indicator。</zh-CN><en>Loading drives only a static indicator.</en></lang>
  loading: { type: Boolean, default: false },
  // <lang><zh-CN>tone 在存在且合法时优先于迁移 type；undefined 允许 alias 生效。</zh-CN><en>Tone takes precedence over migration type when present and valid; undefined lets the alias apply.</en></lang>
  tone: { type: String, default: undefined },
  // <lang><zh-CN>type 是有限迁移 alias，不扩展 tone 集合。</zh-CN><en>Type is a finite migration alias and does not widen the tone set.</en></lang>
  type: { type: String, default: undefined },
  // <lang><zh-CN>position 仅选择命令式 host 的三种局部位置 class。</zh-CN><en>Position only selects one of three local position classes for an imperative host.</en></lang>
  position: { type: String, default: 'center' },
  // <lang><zh-CN>duration 为 component-ref 默认信息披露；受控 visible 不会因此自动关闭。</zh-CN><en>Duration is component-ref default disclosure; controlled visible never auto-closes because of it.</en></lang>
  duration: { type: Number, default: 0 },
  // <lang><zh-CN>closeText 必须非空才创建文字关闭 control。</zh-CN><en>CloseText must be non-empty before a text close control is created.</en></lang>
  closeText: { type: String, default: '' },
  // <lang><zh-CN>serviceScope 必须由 createUFeedbackScope 创建；组件不发现全局 scope。</zh-CN><en>ServiceScope must be created by createUFeedbackScope; the component discovers no global scope.</en></lang>
  serviceScope: { type: Object, default: null },
  // <lang><zh-CN>serviceHost 显式授权当前实例承接该 scope 的 toast request。</zh-CN><en>ServiceHost explicitly authorizes this instance to accept toast requests for that scope.</en></lang>
  serviceHost: { type: Boolean, default: false }
});

// <lang><zh-CN>close 继续只报告本地 control intent；命令式来源 metadata 仅作为第二参数追加。</zh-CN><en>Close continues to report only local-control intent; imperative-source metadata is appended only as a second argument.</en></lang>
const emit = defineEmits(['close']);

// <lang><zh-CN>当前命令式 session 是整体替换的冻结快照；null 表示立即回退受控 props。</zh-CN><en>The current imperative session is a wholly replaced frozen snapshot; null means immediate fallback to controlled props.</en></lang>
const imperativeSession = ref(null);

// <lang><zh-CN>本地 component-ref request id 单调增长，但不进入 service scope 的 id 空间。</zh-CN><en>The local component-ref request id grows monotonically but never enters the service-scope id space.</en></lang>
let nextComponentRequestId = 1;

// <lang><zh-CN>Generation 使已清除 timer 即使晚到也不能关闭替代 session。</zh-CN><en>The generation prevents a cleared timer from closing a replacement session even if it arrives late.</en></lang>
let activeGeneration = 0;

// <lang><zh-CN>始终至多保留一个本地 auto-close timer。</zh-CN><en>At most one local auto-close timer is retained.</en></lang>
let activeTimer = null;

// <lang><zh-CN>Mounted flag 阻止卸载后的 prop watcher 重新注册宿主。</zh-CN><en>The mounted flag prevents a prop watcher from re-registering a host after unmount.</en></lang>
let isMounted = false;

// <lang><zh-CN>Tokenized disposer 精确对应当前 scope/host registration。</zh-CN><en>The tokenized disposer corresponds exactly to the current scope/host registration.</en></lang>
let unregisterServiceHost = null;

// <lang><zh-CN>受控 tone 先选合法 tone，再选合法 type，最终稳定回退 info。</zh-CN><en>Controlled tone chooses valid tone first, then valid type, and finally falls back stably to info.</en></lang>
const controlledTone = computed(() => {
  // <lang><zh-CN>显式合法 tone 保持 HIA 入口优先级。</zh-CN><en>An explicit valid tone preserves precedence of the HIA entry.</en></lang>
  if (supportedTones.includes(props.tone)) return props.tone;
  // <lang><zh-CN>合法 type 只作为迁移 alias。</zh-CN><en>A valid type acts only as a migration alias.</en></lang>
  if (supportedTones.includes(props.type)) return props.type;
  // <lang><zh-CN>未知输入不会成为 class 名。</zh-CN><en>Unknown input never becomes a class name.</en></lang>
  return 'info';
});

// <lang><zh-CN>受控 position 只在 allowlist 内保留，否则回退 center。</zh-CN><en>Controlled position is retained only within the allowlist and otherwise falls back to center.</en></lang>
const controlledPosition = computed(() => supportedPositions.includes(props.position) ? props.position : 'center');

// <lang><zh-CN>非空 session 表示 component-ref 或 service 当前拥有命令式呈现优先级。</zh-CN><en>A non-null session means a component ref or service currently owns imperative presentation precedence.</en></lang>
const hasImperativeSession = computed(() => imperativeSession.value !== null);

// <lang><zh-CN>每个解析字段只读取当前 session 或受控 props，不读取 scope registry。</zh-CN><en>Each resolved field reads only the current session or controlled props and never reads the scope registry.</en></lang>
const resolvedMessage = computed(() => imperativeSession.value?.message ?? props.message);
// <lang><zh-CN>Resolved loading 只控制 indicator。</zh-CN><en>Resolved loading controls only the indicator.</en></lang>
const resolvedLoading = computed(() => imperativeSession.value?.loading ?? props.loading);
// <lang><zh-CN>Resolved tone 只能来自已规范化 session 或受限 fallback。</zh-CN><en>Resolved tone can come only from a normalized session or constrained fallback.</en></lang>
const resolvedTone = computed(() => imperativeSession.value?.tone ?? controlledTone.value);
// <lang><zh-CN>Resolved position 只能来自已规范化 session 或受限 fallback。</zh-CN><en>Resolved position can come only from a normalized session or constrained fallback.</en></lang>
const resolvedPosition = computed(() => imperativeSession.value?.position ?? controlledPosition.value);
// <lang><zh-CN>关闭文字遵循 session 优先、props 回退。</zh-CN><en>Close copy follows session precedence and props fallback.</en></lang>
const resolvedCloseText = computed(() => imperativeSession.value?.closeText ?? props.closeText);

// <lang><zh-CN>受控路径需要 visible；命令式路径已由 show 创建，二者都要求非空文字。</zh-CN><en>The controlled path requires visible while the imperative path was created by show; both require non-empty copy.</en></lang>
const isVisible = computed(() => (hasImperativeSession.value || props.visible) && resolvedMessage.value.trim().length > 0);

// <lang><zh-CN>关闭 control 只由非空调用方文字产生。</zh-CN><en>The close control is produced only by non-empty caller copy.</en></lang>
const hasCloseControl = computed(() => resolvedCloseText.value.trim().length > 0);

// <lang><zh-CN>根 class 只组合有限 tone/position 与内部 imperative marker。</zh-CN><en>Root classes compose only finite tone/position and an internal imperative marker.</en></lang>
const rootClasses = computed(() => [
  'u-toast',
  `u-toast--${resolvedTone.value}`,
  `u-toast--${resolvedPosition.value}`,
  { 'u-toast--imperative': hasImperativeSession.value }
]);

/**
 * @lang zh-CN 清除唯一 active timer，并释放其句柄。
 * @lang en Clears the sole active timer and releases its handle.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function clearActiveTimer() {
  // <lang><zh-CN>null 表示当前没有 timer；重复 close 保持幂等。</zh-CN><en>Null means there is no current timer; repeated close remains idempotent.</en></lang>
  if (activeTimer === null) return;
  // <lang><zh-CN>只清除本组件创建的句柄。</zh-CN><en>Clears only the handle created by this component.</en></lang>
  clearTimeout(activeTimer);
  activeTimer = null;
}

/**
 * @lang zh-CN 结束当前命令式 session，并按来源选择是否结算显式 scope。
 * @lang en Ends the current imperative session and settles an explicit scope according to source.
 * @param {boolean} settleScope <lang><zh-CN>service 来源是否反向结算 active request。</zh-CN><en>Whether a service source should settle its active request.</en></lang>
 * @returns {Readonly<Record<string, unknown>>|null} <lang><zh-CN>结束前 session，供事件 metadata 使用。</zh-CN><en>Session before ending, for event metadata.</en></lang>
 */
function endImperativeSession(settleScope) {
  // <lang><zh-CN>先捕获、再递增 generation 与清 timer，使同步 reentry 不能复用旧 timer。</zh-CN><en>Captures first, then increments generation and clears the timer so synchronous re-entry cannot reuse an old timer.</en></lang>
  const currentSession = imperativeSession.value;
  activeGeneration += 1;
  clearActiveTimer();
  imperativeSession.value = null;

  // <lang><zh-CN>只有 service session 且调用路径拥有结算责任时才触碰 scope。</zh-CN><en>The scope is touched only for a service session when the calling path owns settlement responsibility.</en></lang>
  if (settleScope && currentSession?.source === 'service') {
    settleUFeedbackRequest(currentSession.scope, 'toast', currentSession.requestId);
  }

  // <lang><zh-CN>返回冻结 session identity，不返回 timer、host 或 registry。</zh-CN><en>Returns the frozen session identity and no timer, host, or registry.</en></lang>
  return currentSession;
}

/**
 * @lang zh-CN 整体替换命令式 toast，并为正 duration 建立 generation-guarded timer。
 * @lang en Wholly replaces the imperative toast and creates a generation-guarded timer for a positive duration.
 * @param {Readonly<Record<string, unknown>>} options <lang><zh-CN>已规范化的有限 toast options。</zh-CN><en>Normalized finite toast options.</en></lang>
 * @param {{source:'component-ref'|'service',requestId:number,scope:object|null}} identity <lang><zh-CN>本地或 service request identity。</zh-CN><en>Local or service request identity.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function startImperativeSession(options, identity) {
  // <lang><zh-CN>本地 component-ref 若替代 active service session，先显式结算旧 scope request；否则 service controller 会保留一个已无宿主呈现的伪 active id。</zh-CN><en>When a local component ref replaces an active service session, it first explicitly settles the old scoped request; otherwise the service controller would retain a falsely active ID with no host presentation.</en></lang>
  if (identity.source === 'component-ref' && imperativeSession.value?.source === 'service') {
    settleUFeedbackRequest(imperativeSession.value.scope, 'toast', imperativeSession.value.requestId);
  }

  // <lang><zh-CN>替代 show 先使旧 timer/session 陈旧，但旧 service request 的 active id 由 scope 新 show 原子替换。</zh-CN><en>A replacement show first makes the old timer/session stale, while the scope atomically replaces an old service active id with the new show.</en></lang>
  activeGeneration += 1;
  clearActiveTimer();

  // <lang><zh-CN>当前 generation 与有限 identity 一起冻结，杜绝 options 后续突变。</zh-CN><en>The current generation and finite identity are frozen together, preventing later options mutation.</en></lang>
  const generation = activeGeneration;
  imperativeSession.value = Object.freeze({ ...options, ...identity, generation });

  // <lang><zh-CN>零 duration 表示常驻直到显式 close；负值/非法值已被 normalizer 拒绝。</zh-CN><en>Zero duration means persistent until explicit close; negative/invalid values were rejected by the normalizer.</en></lang>
  if (options.duration <= 0) return;

  // <lang><zh-CN>Timer callback 只核对 generation/session identity，不 emit、不执行 callback 或导航。</zh-CN><en>The timer callback checks only generation/session identity and neither emits nor executes callback or navigation.</en></lang>
  activeTimer = setTimeout(() => {
    // <lang><zh-CN>被替代或已关闭的 timer 保持静默。</zh-CN><en>A replaced or already-closed timer remains silent.</en></lang>
    if (!imperativeSession.value || imperativeSession.value.generation !== generation) return;
    // <lang><zh-CN>超时是 service request 的正常结算，但不产生 close intent。</zh-CN><en>Timeout normally settles a service request but produces no close intent.</en></lang>
    endImperativeSession(true);
  }, options.duration);
}

/**
 * @lang zh-CN 为 component-ref `show` 应用组件声明的默认 duration；显式 options duration 始终优先，且 accessor/Proxy trap 被收束为非法输入。
 * @lang en Applies the component-declared default duration to component-ref `show`; an explicit options duration always wins, while accessor/Proxy traps collapse to invalid input.
 * @param {string|Record<string, unknown>} input <lang><zh-CN>调用方 component-ref 输入。</zh-CN><en>Caller component-ref input.</en></lang>
 * @returns {Readonly<Record<string, unknown>>|null} <lang><zh-CN>规范化有限快照或失败标记。</zh-CN><en>Normalized finite snapshot or failure marker.</en></lang>
 */
function normalizeComponentRefOptions(input) {
  // <lang><zh-CN>公共 normalizer 在单次 caller snapshot 内判定显式 duration；组件 prop 只作为缺失字段 fallback，不产生预探测或 Proxy TOCTOU。</zh-CN><en>The public normalizer determines explicit duration within one caller snapshot; the component prop acts only as an absent-field fallback, creating no preflight read or Proxy TOCTOU.</en></lang>
  return normalizeUToastOptions(input, { duration: props.duration });
}

/**
 * @lang zh-CN 通过 component ref 显示一个已验证 toast；非法输入安全 no-op。
 * @lang en Shows one validated toast through a component ref; invalid input is a safe no-op.
 * @param {string|Record<string, unknown>} options <lang><zh-CN>有限 toast 文字或 options。</zh-CN><en>Finite toast copy or options.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function show(options) {
  // <lang><zh-CN>使用与 service 相同有限 normalizer，并仅在 component-ref 未显式给 duration 时叠加组件 prop 默认值。</zh-CN><en>Uses the same finite normalizer as the service and layers the component-prop default only when the component-ref input omits duration.</en></lang>
  const normalized = normalizeComponentRefOptions(options);
  if (!normalized) return;

  // <lang><zh-CN>局部 id 只标识当前组件的 ref session。</zh-CN><en>The local id identifies only a ref session of this component.</en></lang>
  const requestId = nextComponentRequestId;
  nextComponentRequestId += 1;
  startImperativeSession(normalized, Object.freeze({ source: 'component-ref', requestId, scope: null }));
}

/**
 * @lang zh-CN 通过 component ref 幂等关闭当前命令式 toast；受控 fallback 保持不变。
 * @lang en Idempotently closes the current imperative toast through a component ref; controlled fallback remains unchanged.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function close() {
  endImperativeSession(true);
}

/**
 * @lang zh-CN 承接 service runtime 已规范化的 request object。
 * @lang en Accepts a request object normalized by the service runtime.
 * @param {{requestId:number,options:Readonly<Record<string,unknown>>}} request <lang><zh-CN>有限 service request。</zh-CN><en>Finite service request.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function showServiceToast(request) {
  // <lang><zh-CN>Scope identity 来自当前精确 host registration，不从 request 注入。</zh-CN><en>Scope identity comes from the current exact host registration and is not injected through the request.</en></lang>
  startImperativeSession(request.options, Object.freeze({ source: 'service', requestId: request.requestId, scope: props.serviceScope }));
}

/**
 * @lang zh-CN 响应 service close，并对 expected request id 做 host 侧二次 guard。
 * @lang en Responds to service close with a host-side second guard on expected request id.
 * @param {number|undefined} expectedRequestId <lang><zh-CN>期望 active id。</zh-CN><en>Expected active id.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function closeServiceToast(expectedRequestId) {
  // <lang><zh-CN>缺 session、非 service session 或陈旧 id 保持零副作用。</zh-CN><en>An absent session, non-service session, or stale id retains zero side effect.</en></lang>
  if (imperativeSession.value?.source !== 'service'
    || (expectedRequestId !== undefined && imperativeSession.value.requestId !== expectedRequestId)) return;
  // <lang><zh-CN>Controller 路径由 runtime 结算 scope；host 只清本地 timer/session。</zh-CN><en>The runtime settles the scope on a controller path; the host clears only local timer/session.</en></lang>
  endImperativeSession(false);
}

/**
 * @lang zh-CN 在 host replacement/unregister/dispose 时只释放当前 service session；同实例的 caller-owned component-ref session 与 timer 必须保持不变。
 * @lang en Releases only the current service session during host replacement/unregister/dispose; a caller-owned component-ref session and timer on the same instance must remain unchanged.
 * @returns {void} <lang><zh-CN>无返回值；非 service session 时零副作用。</zh-CN><en>No return value; has zero side effect for a non-service session.</en></lang>
 */
function releaseServiceToast() {
  // <lang><zh-CN>Host 所有权只覆盖 source=service 的 session，不包含通过组件 ref 创建的本地命令。</zh-CN><en>Host ownership covers only a source=service session and excludes a local command created through the component ref.</en></lang>
  if (imperativeSession.value?.source !== 'service') {
    return;
  }

  // <lang><zh-CN>Scope registry 已清 active request；这里只静默清本地 service timer/session。</zh-CN><en>The scope registry has already cleared the active request; this only silently clears the local service timer/session.</en></lang>
  endImperativeSession(false);
}

// <lang><zh-CN>Host 对象只包含 runtime 允许的 show/close/release 三方法。</zh-CN><en>The host object contains only the show/close/release methods allowed by runtime.</en></lang>
const serviceHost = Object.freeze({
  show: showServiceToast,
  close: closeServiceToast,
  // <lang><zh-CN>替换/注销 release 静默清理；scope 自己清 active id。</zh-CN><en>Replacement/unregister release cleans silently; the scope clears its own active id.</en></lang>
  release: releaseServiceToast
});

/**
 * @lang zh-CN 依据当前 props 原子替换 toast host registration。
 * @lang en Atomically replaces toast host registration from current props.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function syncServiceHost() {
  // <lang><zh-CN>旧 token 先注销，且不能清除后注册替代 host。</zh-CN><en>The old token unregisters first and cannot clear a later replacement host.</en></lang>
  if (typeof unregisterServiceHost === 'function') unregisterServiceHost();
  unregisterServiceHost = null;

  // <lang><zh-CN>缺任一显式前提时保持未注册，不做全局 fallback。</zh-CN><en>When any explicit prerequisite is absent, remains unregistered with no global fallback.</en></lang>
  if (!isMounted || !props.serviceHost || !props.serviceScope) return;

  // <lang><zh-CN>只有 runtime 创建的有效 scope 会返回 disposer。</zh-CN><en>Only a valid scope created by runtime returns a disposer.</en></lang>
  const unregister = registerUFeedbackHost(props.serviceScope, 'toast', serviceHost);
  if (typeof unregister === 'function') unregisterServiceHost = unregister;
}

/**
 * @lang zh-CN 处理可见关闭 control；受控路径只 emit，命令式路径先结束 session 再 emit。
 * @lang en Handles the visible close control; the controlled path only emits, while an imperative path ends its session before emitting.
 * @param {unknown} event <lang><zh-CN>原始本地点击事件。</zh-CN><en>Original local click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleCloseControl(event) {
  // <lang><zh-CN>隐藏或无文字 control 时即使直接调用也保持零事件。</zh-CN><en>Hidden state or absence of named control retains zero events even under direct invocation.</en></lang>
  if (!isVisible.value || !hasCloseControl.value) return;

  // <lang><zh-CN>命令式路径捕获有限 metadata 后结算；不泄漏 scope 或完整 options。</zh-CN><en>The imperative path captures finite metadata before settlement and leaks neither scope nor full options.</en></lang>
  if (imperativeSession.value) {
    const currentSession = endImperativeSession(true);
    emit('close', event, Object.freeze({ source: currentSession.source, requestId: currentSession.requestId, reason: 'control' }));
    return;
  }

  // <lang><zh-CN>受控路径继续只报告 raw event，由 caller 决定 visible 下一值。</zh-CN><en>The controlled path continues to report only the raw event, and the caller decides the next visible value.</en></lang>
  emit('close', event);
}

// <lang><zh-CN>Scope identity 或 opt-in 变化只替换精确 registration，不迁移旧 session。</zh-CN><en>A scope-identity or opt-in change only replaces exact registration and migrates no old session.</en></lang>
watch(() => [props.serviceScope, props.serviceHost], syncServiceHost);

// <lang><zh-CN>Mounted 后 host 才可解析。</zh-CN><en>The host becomes resolvable only after mount.</en></lang>
onMounted(() => {
  isMounted = true;
  syncServiceHost();
});

// <lang><zh-CN>卸载撤销 registration、清 timer/session，且不 emit、不 callback。</zh-CN><en>Unmount revokes registration and clears timer/session without emit or callback.</en></lang>
onBeforeUnmount(() => {
  isMounted = false;
  if (typeof unregisterServiceHost === 'function') unregisterServiceHost();
  unregisterServiceHost = null;
  endImperativeSession(false);
});

// <lang><zh-CN>Component ref 暴露熟悉 show/close/hide；hide 是 close 的同一幂等函数，不是 service controller。</zh-CN><en>The component ref exposes familiar show/close/hide; hide is the same idempotent function as close and is not a service controller.</en></lang>
defineExpose({ show, close, hide: close });
</script>

<style src="./u-toast.css"></style>
