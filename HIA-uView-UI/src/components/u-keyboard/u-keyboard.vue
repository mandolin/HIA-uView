<!--
@component UKeyboard
@lang zh-CN 将受控 number/car 键盘与可选局部遮罩组合为 caller-visible 键盘表面；组件只转发局部键、删除、确认、phase 和关闭意图，不管理系统键盘、焦点、全局 service、路由、表单或输入模型。
@lang en Composes controlled number/car keyboards and an optional local mask into a caller-visible keyboard surface; the component forwards local key, backspace, confirm, phase, and close intent only and manages no system keyboard, focus, global service, router, form, or input model.
-->
<template>
  <!-- @lang zh-CN 根只在 caller visible 且当前 mode 有有限可读数据时输出；可选 mask 只在 caller 明确允许时转发 close intent。
  @lang en The root outputs only when caller-visible and the current mode has finite readable data; the optional mask forwards close intent only when explicitly permitted by the caller.
  <lang><zh-CN>panel 是一个受控局部 overlay，不生成默认标题、键、语言或输入值。</zh-CN><en>The panel is a controlled local overlay and creates no default title, key, language, or input value.</en></lang>
  -->
  <view v-if="isRenderable" class="u-keyboard" :style="keyboardStyle" role="group" :aria-label="safeLabel">
    <UMask v-if="mask" :visible="true" :layer="safeMaskLayer" :clickable="maskClosable" @click="emitClose" />
    <view class="u-keyboard__panel"><text v-if="safeTitle" class="u-keyboard__title">{{ safeTitle }}</text><UNumberKeyboard v-if="safeMode === 'number'" :visible="true" :keys="numberKeys" :label="safeLabel" :backspace-label="safeBackspaceLabel" :confirm-text="safeConfirmText" :disabled="disabled" @input="forwardInput" @backspace="forwardBackspace" @confirm="forwardConfirm" /><UCarKeyboard v-else :visible="true" :rows="carRows" :label="safeLabel" :phase="safePhase" :next-phase="safeNextPhase" :switch-text="safeSwitchText" :backspace-label="safeBackspaceLabel" :confirm-text="safeConfirmText" :disabled="disabled" @input="forwardInput" @backspace="forwardBackspace" @confirm="forwardConfirm" @phase-change="forwardPhaseChange" /></view>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import UCarKeyboard from '../u-car-keyboard/u-car-keyboard.vue';
import UMask from '../u-mask/u-mask.vue';
import UNumberKeyboard from '../u-number-keyboard/u-number-keyboard.vue';

// <lang><zh-CN>稳定名称保留统一键盘迁移入口；组件只是当前组件树内的显式组合，不是全局 keyboard singleton。</zh-CN><en>The stable name retains a unified-keyboard migration entry; the component is explicit composition within the current component tree, not a global keyboard singleton.</en></lang>
defineOptions({ name: 'u-keyboard' });

// <lang><zh-CN>调用方拥有 mode、可见性、键/键行、所有文字、phase、遮罩关闭许可及 disabled；没有 locale、value 或 form 注入。</zh-CN><en>The caller owns mode, visibility, keys/key rows, all copy, phase, mask-close permission, and disabled; there is no locale, value, or form injection.</en></lang>
const props = defineProps({
  // <lang><zh-CN>可见性默认关闭，避免 import 或挂载时创建固定 overlay。</zh-CN><en>Visibility defaults off, avoiding creation of a fixed overlay on import or mount.</en></lang>
  visible: { type: Boolean, default: false },
  // <lang><zh-CN>mode 仅在受限 number/car 之间选择；未知值回退 number，不进入动态组件或路径。</zh-CN><en>Mode selects only between bounded number/car; an unknown value falls back to number and enters no dynamic component or path.</en></lang>
  mode: { type: String, default: 'number' },
  // <lang><zh-CN>两个受控子面分别接收 caller-owned 有限数据；组件不重写或生成其键集合。</zh-CN><en>The two controlled child surfaces each receive caller-owned finite data; the component rewrites and generates neither key collection.</en></lang>
  numberKeys: { type: Array, default: () => [] },
  carRows: { type: Array, default: () => [] },
  // <lang><zh-CN>标题、标签和 action 文字均由 caller 本地化；空值不创建默认用户文案。</zh-CN><en>Title, label, and action copy are localized by the caller; empty values create no default user copy.</en></lang>
  title: { type: String, default: '' },
  label: { type: String, default: '' },
  backspaceLabel: { type: String, default: '' },
  confirmText: { type: String, default: '' },
  // <lang><zh-CN>phase、下一 phase 与切换文字仅传给 car 子面，不解释为车辆、地区或状态机。</zh-CN><en>Phase, next phase, and switch copy pass only to the car child surface and are not interpreted as vehicle, region, or state machine.</en></lang>
  phase: { type: String, default: '' },
  nextPhase: { type: String, default: '' },
  switchText: { type: String, default: '' },
  // <lang><zh-CN>mask 默认关闭且不可关闭；layer 限制为有限整数，保证本地 overlay 仍可由 caller 审阅。</zh-CN><en>Mask defaults off and non-closable; layer is constrained to a finite integer so the local overlay remains caller-reviewable.</en></lang>
  mask: { type: Boolean, default: false },
  maskClosable: { type: Boolean, default: false },
  layer: { type: Number, default: 1100 },
  disabled: { type: Boolean, default: false }
});

// <lang><zh-CN>组件只转发子面意图；应用拥有实际输入写回、关闭、提交和 phase 状态变化。</zh-CN><en>The component forwards child-surface intent only; the application owns actual input writeback, close, submit, and phase state changes.</en></lang>
const emit = defineEmits(['input', 'backspace', 'confirm', 'phase-change', 'close']);

// <lang><zh-CN>有限 mode 集合阻止任意 caller 字符串成为动态组件、CSS 名或隐式代码路径。</zh-CN><en>The finite mode set prevents arbitrary caller strings from becoming dynamic component, CSS name, or implicit code path.</en></lang>
const supportedModes = Object.freeze(['number', 'car']);

// <lang><zh-CN>当前 mode 仅从受限集合投影，未知值安全回退 number。</zh-CN><en>The current mode projects only from the bounded set and safely falls back to number for unknown values.</en></lang>
const safeMode = computed(() => supportedModes.includes(props.mode) ? props.mode : 'number');

// <lang><zh-CN>用户可见文字和 phase 仅接受明确字符串，防止不匹配 prop 隐式创建文案或状态。</zh-CN><en>User-visible copy and phase accept explicit strings only, preventing mismatched props from implicitly creating copy or state.</en></lang>
const safeTitle = computed(() => typeof props.title === 'string' ? props.title : '');
const safeLabel = computed(() => typeof props.label === 'string' ? props.label : '');
const safeBackspaceLabel = computed(() => typeof props.backspaceLabel === 'string' ? props.backspaceLabel : '');
const safeConfirmText = computed(() => typeof props.confirmText === 'string' ? props.confirmText : '');
const safePhase = computed(() => typeof props.phase === 'string' ? props.phase : '');
const safeNextPhase = computed(() => typeof props.nextPhase === 'string' ? props.nextPhase : '');
const safeSwitchText = computed(() => typeof props.switchText === 'string' ? props.switchText : '');

// <lang><zh-CN>只检查有限集合是否有候选项目，具体键的可读性仍由对应子组件逐项规范化。</zh-CN><en>Checks only whether finite collections have candidate items; readability of each key remains normalized item by item by the corresponding child component.</en></lang>
const hasNumberCandidates = computed(() => Array.isArray(props.numberKeys) && props.numberKeys.length > 0);
const hasCarCandidates = computed(() => Array.isArray(props.carRows) && props.carRows.some((row) => Array.isArray(row) && row.length > 0));

// <lang><zh-CN>只在当前受限 mode 有候选且 caller visible 时输出，防止空 fixed overlay 误拦截页面。</zh-CN><en>Outputs only when the current bounded mode has candidates and caller is visible, preventing an empty fixed overlay from accidentally blocking a page.</en></lang>
const isRenderable = computed(() => props.visible && (safeMode.value === 'number' ? hasNumberCandidates.value : hasCarCandidates.value));

// <lang><zh-CN>layer 约束与 UMask 相同；panel 使用此层，mask 固定低一层，保持同一局部组合内的明确叠放关系。</zh-CN><en>Layer constraint matches UMask; the panel uses this layer and the mask is fixed one layer below, retaining explicit stacking inside the same local composition.</en></lang>
const safeLayer = computed(() => Number.isFinite(props.layer) ? Math.round(Math.min(2000, Math.max(2, props.layer))) : 1100);
const safeMaskLayer = computed(() => safeLayer.value - 1);
const keyboardStyle = computed(() => ({ '--u-keyboard-layer': String(safeLayer.value) }));

/**
 * @lang zh-CN 转发 number/car 子面报告的 caller key payload；不拼接或写回输入值。
 * @lang en Forwards caller key payload reported by number/car child surface; it concatenates and writes back no input value.
 * @param {unknown} payload <lang><zh-CN>子面输入 payload。</zh-CN><en>Child-surface input payload.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `input`。</zh-CN><en>No return value; emits `input` when the guard passes.</en></lang>
 */
function forwardInput(payload) {
  // <lang><zh-CN>重复 visible/disabled guard，确保未来直接调用 forwarding handler 时仍没有隐式输入路径。</zh-CN><en>Repeats visible/disabled guard so a future direct forwarding-handler call still has no implicit input path.</en></lang>
  if (!isRenderable.value || props.disabled) return;
  emit('input', payload);
}

/**
 * @lang zh-CN 转发子面删除意图；不修改输入、焦点或系统键盘。
 * @lang en Forwards child-surface backspace intent; it modifies no input, focus, or system keyboard.
 * @param {unknown} event <lang><zh-CN>子面原始事件。</zh-CN><en>Original child-surface event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `backspace`。</zh-CN><en>No return value; emits `backspace` when the guard passes.</en></lang>
 */
function forwardBackspace(event) {
  // <lang><zh-CN>转发仅在当前 caller-visible、启用组合中成立。</zh-CN><en>Forwarding is valid only in the current caller-visible, enabled composition.</en></lang>
  if (!isRenderable.value || props.disabled) return;
  emit('backspace', event);
}

/**
 * @lang zh-CN 转发子面确认意图；不提交表单或关闭组件。
 * @lang en Forwards child-surface confirm intent; it submits no form and closes no component.
 * @param {unknown} event <lang><zh-CN>子面原始事件。</zh-CN><en>Original child-surface event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `confirm`。</zh-CN><en>No return value; emits `confirm` when the guard passes.</en></lang>
 */
function forwardConfirm(event) {
  // <lang><zh-CN>确认保持为调用方解释的本地 intent，不创建成功/失败结论。</zh-CN><en>Confirm remains caller-interpreted local intent and creates no success/failure conclusion.</en></lang>
  if (!isRenderable.value || props.disabled) return;
  emit('confirm', event);
}

/**
 * @lang zh-CN 转发 car 子面 phase 切换候选；当前组件不写回 phase 或重排键行。
 * @lang en Forwards car child-surface phase-change candidate; the current component writes back no phase and rearranges no key row.
 * @param {unknown} payload <lang><zh-CN>子面 phase payload。</zh-CN><en>Child-surface phase payload.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `phase-change`。</zh-CN><en>No return value; emits `phase-change` when the guard passes.</en></lang>
 */
function forwardPhaseChange(payload) {
  // <lang><zh-CN>只有 car mode 可以产生 phase intent，number mode 的直接调用保持零事件。</zh-CN><en>Only car mode may produce phase intent; a direct call in number mode retains zero event.</en></lang>
  if (!isRenderable.value || props.disabled || safeMode.value !== 'car') return;
  emit('phase-change', payload);
}

/**
 * @lang zh-CN 将 caller 明确允许的 UMask 点击转发为 close intent；组件不写 visible 或销毁 overlay。
 * @lang en Forwards caller-explicitly-permitted UMask click as close intent; the component writes no visible state and destroys no overlay.
 * @param {unknown} event <lang><zh-CN>来自 UMask 的原始事件。</zh-CN><en>Original event from UMask.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `close`。</zh-CN><en>No return value; emits `close` when the guard passes.</en></lang>
 */
function emitClose(event) {
  // <lang><zh-CN>重复 mask guard，避免直接调用 handler 绕过 UMask 的可点击边界。</zh-CN><en>Repeats the mask guard, preventing direct handler calls from bypassing UMask's clickable boundary.</en></lang>
  if (!isRenderable.value || !props.mask || !props.maskClosable) return;
  emit('close', event);
}
</script>

<style src="./u-keyboard.css"></style>
