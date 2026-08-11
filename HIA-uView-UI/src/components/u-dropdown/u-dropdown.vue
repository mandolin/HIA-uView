<!--
@component UDropdown
@lang zh-CN 提供受控的 legacy 选择与显式 name registry；最多激活一个局部 item，且不拥有页面浮层、路由或请求。
@lang en Provides controlled legacy selection and an explicit-name registry; at most one local item is active, and it owns no page popup, routing, or requests.
-->
<template>
  <view class="u-dropdown" :class="{ 'u-dropdown--disabled': props.disabled }" role="group" :aria-disabled="props.disabled">
    <slot />
  </view>
</template>

<script setup>
import { computed, provide, ref, watch } from 'vue';
import { DROPDOWN_CONTEXT, isDropdownName } from '../dropdown-context.mjs';

// <lang><zh-CN>保持 u- 命名，降低从相关 uView 下拉组件迁移的障碍。</zh-CN><en>Retains the u- name to reduce migration friction from related uView dropdown components.</en></lang>
defineOptions({ name: 'u-dropdown' });

// <lang><zh-CN>legacy model 与局部禁用边界均由调用方拥有；registry 不替代这两个 prop。</zh-CN><en>The caller owns both the legacy model and local disabled boundary; the registry replaces neither prop.</en></lang>
const props = defineProps({ modelValue: { type: [String, Number], default: '' }, disabled: { type: Boolean, default: false } });

// <lang><zh-CN>close 仅报告真正关闭的显式 name；空关闭、注册失败和禁用交互不发事件。</zh-CN><en>Close reports only an explicitly named item that actually closes; empty closes, registration failures, and disabled interactions emit nothing.</en></lang>
const emit = defineEmits(['update:modelValue', 'change', 'close']);

// <lang><zh-CN>legacy activeValue 是 caller model 的只读投影，不与 activeName 混用。</zh-CN><en>The legacy activeValue is a readonly projection of the caller model and is never conflated with activeName.</en></lang>
const activeValue = computed(() => props.modelValue);

// <lang><zh-CN>禁用状态通过 computed 进入私有 context，子项只读取而不改写。</zh-CN><en>Disabled state enters the private context through a computed value that children read but never mutate.</en></lang>
const disabled = computed(() => props.disabled);

// <lang><zh-CN>registry 只存在于当前组件实例内，以 name 严格映射到一个 token owner。</zh-CN><en>The registry exists only inside this component instance and strictly maps each name to one token owner.</en></lang>
const itemRegistry = new Map();

// <lang><zh-CN>null 是唯一关闭哨兵，因此空字符串与数字零仍可作为合法 active name。</zh-CN><en>Null is the sole closed sentinel, so an empty string and numeric zero remain valid active names.</en></lang>
const activeNameState = ref(null);

// <lang><zh-CN>子项获得只读 activeName 投影，不能越过父级状态机直接写入。</zh-CN><en>Children receive a readonly activeName projection and cannot bypass the parent state machine to write it.</en></lang>
const activeName = computed(() => activeNameState.value);

/**
 * @lang zh-CN 注册一个显式命名的局部 item；同名后注册者失败且不覆盖既有 owner。
 * @lang en Registers one explicitly named local item; a later duplicate fails without replacing the existing owner.
 * @param {string|number} name <lang><zh-CN>稳定的局部 identity。</zh-CN><en>Stable local identity.</en></lang>
 * @param {symbol} token <lang><zh-CN>子项实例独有的卸载凭据。</zh-CN><en>Unmount credential unique to the child instance.</en></lang>
 * @param {() => boolean} canOpen <lang><zh-CN>读取子项当前 show/disabled 状态的无副作用 guard。</zh-CN><en>Side-effect-free guard reading the child's current show/disabled state.</en></lang>
 * @returns {boolean} <lang><zh-CN>是否成为该 name 的唯一 owner。</zh-CN><en>Whether the item became the sole owner of the name.</en></lang>
 */
function registerItem(name, token, canOpen) {
  // <lang><zh-CN>非法 name、非 symbol token、非函数 guard 或重复 name 都是确定的零事件失败。</zh-CN><en>An invalid name, non-symbol token, non-function guard, or duplicate name is a deterministic zero-event failure.</en></lang>
  if (!isDropdownName(name) || typeof token !== 'symbol' || typeof canOpen !== 'function' || itemRegistry.has(name)) return false;

  // <lang><zh-CN>冻结 descriptor，防止子项随后替换 owner token 或 guard。</zh-CN><en>Freezes the descriptor so the child cannot later replace its owner token or guard.</en></lang>
  const descriptor = Object.freeze({ token, canOpen });

  // <lang><zh-CN>仅在所有 guard 通过后写入本实例 registry。</zh-CN><en>Writes to this instance's registry only after every guard passes.</en></lang>
  itemRegistry.set(name, descriptor);
  return true;
}

/**
 * @lang zh-CN 按 name 与 token 同时匹配卸载 owner；移除 active owner 时静默清理呈现状态。
 * @lang en Unregisters an owner only when both name and token match; removing the active owner silently clears presentation state.
 * @param {string|number} name <lang><zh-CN>注册时使用的 identity。</zh-CN><en>Identity used at registration.</en></lang>
 * @param {symbol} token <lang><zh-CN>请求卸载的实例凭据。</zh-CN><en>Instance credential requesting unregistration.</en></lang>
 * @returns {boolean} <lang><zh-CN>是否移除了匹配 owner。</zh-CN><en>Whether the matching owner was removed.</en></lang>
 */
function unregisterItem(name, token) {
  // <lang><zh-CN>先读取当前 descriptor，重复项不得卸载真正 owner。</zh-CN><en>Reads the current descriptor first so a duplicate item cannot unregister the true owner.</en></lang>
  const descriptor = itemRegistry.get(name);

  // <lang><zh-CN>缺失或 token 不匹配保持 registry、active state 与事件流不变。</zh-CN><en>A missing entry or token mismatch leaves registry, active state, and event flow unchanged.</en></lang>
  if (!descriptor || descriptor.token !== token) return false;

  // <lang><zh-CN>准确删除 owner，再处理可能关联的短生命 active state。</zh-CN><en>Deletes the exact owner before handling any associated short-lived active state.</en></lang>
  itemRegistry.delete(name);

  // <lang><zh-CN>show/name/unmount 等声明式变化不伪造成用户 close 事件。</zh-CN><en>Declarative show/name/unmount changes are not fabricated as user close events.</en></lang>
  if (activeNameState.value === name) activeNameState.value = null;
  return true;
}

/**
 * @lang zh-CN 静默失效仍在 registry 中的 active item，用于 disabled 等声明式 guard 变化。
 * @lang en Silently invalidates an active item that remains registered, for declarative guard changes such as disabled.
 * @param {string|number} name <lang><zh-CN>待失效的已注册 identity。</zh-CN><en>Registered identity to invalidate.</en></lang>
 * @param {symbol} token <lang><zh-CN>必须匹配 owner 的实例凭据。</zh-CN><en>Instance credential that must match the owner.</en></lang>
 * @returns {boolean} <lang><zh-CN>是否清除了匹配的 active item。</zh-CN><en>Whether the matching active item was cleared.</en></lang>
 */
function invalidateItem(name, token) {
  // <lang><zh-CN>descriptor、token 与 active name 必须同时匹配，失败时保持零状态变化。</zh-CN><en>The descriptor, token, and active name must all match; failure preserves state exactly.</en></lang>
  const descriptor = itemRegistry.get(name);
  if (!descriptor || descriptor.token !== token || activeNameState.value !== name) return false;

  // <lang><zh-CN>声明式失效只清除局部呈现状态，不向调用方伪造 close。</zh-CN><en>Declarative invalidation clears only local presentation state and fabricates no close event for the caller.</en></lang>
  activeNameState.value = null;
  return true;
}

/**
 * @lang zh-CN 接收 legacy 子项选择并向调用方报告，不执行导航或持久化。
 * @lang en Receives a legacy child selection and reports it to the caller without navigation or persistence.
 * @param {string|number} value <lang><zh-CN>选项值。</zh-CN><en>Option value.</en></lang>
 * @returns {boolean} <lang><zh-CN>是否交付了 legacy 选择事件。</zh-CN><en>Whether legacy selection events were delivered.</en></lang>
 */
function selectLegacyValue(value) {
  // <lang><zh-CN>禁用或非法透明值都保持 caller model 与事件流不变。</zh-CN><en>A disabled state or invalid transparent value leaves the caller model and event flow unchanged.</en></lang>
  if (props.disabled || !isDropdownName(value)) return false;

  // <lang><zh-CN>标准 model update 始终先于既有 change，且两者交付同一透明值。</zh-CN><en>The standard model update always precedes the existing change event, and both deliver the same transparent value.</en></lang>
  emit('update:modelValue', value);
  emit('change', value);
  return true;
}

/**
 * @lang zh-CN 打开当前 registry 中唯一匹配且可交互的 item；切换 active item 不等于关闭整个 dropdown。
 * @lang en Opens the sole matching and interactive item in the current registry; switching active items does not close the dropdown itself.
 * @param {string|number} name <lang><zh-CN>待打开的显式 identity。</zh-CN><en>Explicit identity to open.</en></lang>
 * @returns {boolean} <lang><zh-CN>name 是否被接受为当前 active item。</zh-CN><en>Whether the name was accepted as the current active item.</en></lang>
 */
function open(name) {
  // <lang><zh-CN>父级禁用或非法 name 直接失败，不读取页面或猜测索引。</zh-CN><en>A disabled parent or invalid name fails immediately without reading the page or guessing an index.</en></lang>
  if (props.disabled || !isDropdownName(name)) return false;

  // <lang><zh-CN>只从本实例 registry 读取 descriptor，未注册 name 不产生状态或事件。</zh-CN><en>Reads the descriptor only from this instance's registry; an unregistered name changes no state and emits nothing.</en></lang>
  const descriptor = itemRegistry.get(name);
  if (!descriptor || !descriptor.canOpen()) return false;

  // <lang><zh-CN>赋值天然实现同名幂等与 A→B 单 active 切换，两种情况都不发 close。</zh-CN><en>Assignment naturally provides same-name idempotence and a single-active A-to-B switch; neither case emits close.</en></lang>
  activeNameState.value = name;
  return true;
}

/**
 * @lang zh-CN 关闭当前 active item，并以 raw name 报告一次 close；空关闭是零事件 no-op。
 * @lang en Closes the current active item and reports one close with the raw name; an empty close is a zero-event no-op.
 * @returns {boolean} <lang><zh-CN>是否实际关闭了一个 item。</zh-CN><en>Whether an item was actually closed.</en></lang>
 */
function close() {
  // <lang><zh-CN>null 是唯一空状态；不得向调用方泄漏 sentinel。</zh-CN><en>Null is the sole empty state and must never leak to callers as a sentinel.</en></lang>
  if (activeNameState.value === null) return false;

  // <lang><zh-CN>先保存 raw name 并清状态，使 close listener 观察到确定的关闭语义。</zh-CN><en>Saves the raw name and clears state first so close listeners observe deterministic closed semantics.</en></lang>
  const closingName = activeNameState.value;
  activeNameState.value = null;

  // <lang><zh-CN>payload 直接使用显式 name，不回退到易漂移的位置索引。</zh-CN><en>The payload is the explicit name directly and never falls back to a drift-prone positional index.</en></lang>
  emit('close', closingName);
  return true;
}

/**
 * @lang zh-CN 仅允许 registry owner 通过私有 context 请求打开自身。
 * @lang en Allows only the registry owner to request opening itself through the private context.
 * @param {string|number} name <lang><zh-CN>请求者的注册 identity。</zh-CN><en>Registered identity of the requester.</en></lang>
 * @param {symbol} token <lang><zh-CN>请求者的实例凭据。</zh-CN><en>Instance credential of the requester.</en></lang>
 * @returns {boolean} <lang><zh-CN>请求是否打开了该 item。</zh-CN><en>Whether the request opened the item.</en></lang>
 */
function requestOpen(name, token) {
  // <lang><zh-CN>token 必须与当前 descriptor 严格相等，duplicate 或陈旧 child 均不可代理打开。</zh-CN><en>The token must strictly equal the current descriptor, so duplicate or stale children cannot proxy an open.</en></lang>
  const descriptor = itemRegistry.get(name);
  if (!descriptor || descriptor.token !== token) return false;
  return open(name);
}

/**
 * @lang zh-CN 仅允许当前 active registry owner 通过私有 context 请求关闭自身。
 * @lang en Allows only the current active registry owner to request closing itself through the private context.
 * @param {string|number} name <lang><zh-CN>请求者的注册 identity。</zh-CN><en>Registered identity of the requester.</en></lang>
 * @param {symbol} token <lang><zh-CN>请求者的实例凭据。</zh-CN><en>Instance credential of the requester.</en></lang>
 * @returns {boolean} <lang><zh-CN>请求是否关闭了当前 item。</zh-CN><en>Whether the request closed the current item.</en></lang>
 */
function requestClose(name, token) {
  // <lang><zh-CN>只有 exact owner 且当前 active 时才可进入公共 close 状态机。</zh-CN><en>Only the exact owner while active may enter the public close state machine.</en></lang>
  const descriptor = itemRegistry.get(name);
  if (!descriptor || descriptor.token !== token || activeNameState.value !== name) return false;
  return close();
}

// <lang><zh-CN>父级运行期进入 disabled 时静默清理短生命 active state，不伪造用户 close。</zh-CN><en>When the parent enters disabled at runtime, short-lived active state is cleared silently without fabricating a user close.</en></lang>
watch(() => props.disabled, (nextDisabled) => {
  // <lang><zh-CN>仅 true 转态需要清理；重新启用不自动打开任何 item。</zh-CN><en>Only a true state requires clearing; re-enabling opens no item automatically.</en></lang>
  if (nextDisabled) activeNameState.value = null;
}, { flush: 'sync' });

// <lang><zh-CN>冻结的私有 context 只暴露只读投影、owner-checked registry 操作和 legacy 选择函数。</zh-CN><en>The frozen private context exposes only readonly projections, owner-checked registry operations, and legacy selection.</en></lang>
provide(DROPDOWN_CONTEXT, Object.freeze({ activeValue, disabled, activeName, registerItem, unregisterItem, invalidateItem, selectLegacyValue, requestOpen, requestClose }));

// <lang><zh-CN>公开实例只交付冻结的 P1 open/close；registry 与 child token 始终保持私有。</zh-CN><en>The public instance delivers only the frozen P1 open/close methods; registry and child tokens remain private.</en></lang>
defineExpose({ open, close });
</script>

<style src="./u-dropdown.css"></style>
