<!--
@component UCarKeyboard
@lang zh-CN 提供调用方声明键行和 phase 的受控车牌式键盘展示面；组件只报告输入、删除、确认和 phase 切换意图，不内置地区键、随机键、长按删除、计时器或车牌业务规则。
@lang en Provides a controlled vehicle-plate-style keyboard presentation surface with caller-declared key rows and phase; the component reports input, backspace, confirm, and phase-change intent only and contains no region keys, random keys, long-press deletion, timer, or vehicle-plate business rule.
-->
<template>
  <!-- @lang zh-CN 只有 caller visible 且有限键行中存在可读键时输出；行和键均是页面拥有的数据投影。
  @lang en Outputs only when caller-visible and readable keys exist in finite rows; rows and keys are both page-owned data projections.
  <lang><zh-CN>switch、删除和确认 button 全部要求调用方可读文案；组件不附带地区或语言默认值。</zh-CN><en>Switch, backspace, and confirm buttons all require caller-readable copy; the component carries no region or language default.</en></lang>
  -->
  <view v-if="isRenderable" class="u-car-keyboard" role="group" :aria-label="safeLabel">
    <view v-for="(row, rowIndex) in safeRows" :key="`row-${rowIndex}`" class="u-car-keyboard__row"><button v-for="key in row" :key="key.key" class="u-car-keyboard__key" type="button" :disabled="disabled || key.disabled" @click="emitInput(key, $event)"><text>{{ key.label }}</text></button></view>
    <view v-if="hasActions" class="u-car-keyboard__actions"><button v-if="canChangePhase" class="u-car-keyboard__action" type="button" :disabled="disabled" @click="emitPhaseChange"><text>{{ safeSwitchText }}</text></button><button v-if="safeBackspaceLabel" class="u-car-keyboard__action" type="button" :disabled="disabled" @click="emitBackspace"><text>{{ safeBackspaceLabel }}</text></button><button v-if="safeConfirmText" class="u-car-keyboard__confirm" type="button" :disabled="disabled" @click="emitConfirm"><text>{{ safeConfirmText }}</text></button></view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称保留车牌键盘迁移入口；实现保持为不含地区数据的通用受控键行表面。</zh-CN><en>The stable name retains a vehicle-keyboard migration entry; the implementation remains a general controlled key-row surface with no region data.</en></lang>
defineOptions({ name: 'u-car-keyboard' });

// <lang><zh-CN>调用方拥有可见性、最多四行键、phase、切换目标和所有用户文字；组件不接收地区、车型或身份字段。</zh-CN><en>The caller owns visibility, up to four key rows, phase, switch target, and all user copy; the component accepts no region, vehicle type, or identity field.</en></lang>
const props = defineProps({
  // <lang><zh-CN>可见性默认关闭，不在未请求时建立局部键盘面。</zh-CN><en>Visibility defaults off and creates no local keyboard surface without a request.</en></lang>
  visible: { type: Boolean, default: false },
  // <lang><zh-CN>每行由 caller 声明有限 label/value/disabled 键；只保留前四行和每行前十二项。</zh-CN><en>Each row contains caller-declared finite label/value/disabled keys; only the first four rows and first twelve items per row are retained.</en></lang>
  rows: { type: Array, default: () => [] },
  // <lang><zh-CN>group 标签和 phase 都是透明 caller 状态，不解释为地区、车牌步骤或业务校验。</zh-CN><en>Group label and phase are transparent caller state and are not interpreted as region, plate step, or business validation.</en></lang>
  label: { type: String, default: '' },
  phase: { type: String, default: '' },
  nextPhase: { type: String, default: '' },
  // <lang><zh-CN>可选操作文字由调用方提供；空值不输出对应原生 button。</zh-CN><en>Optional action copy comes from the caller; empty values output no corresponding native button.</en></lang>
  switchText: { type: String, default: '' },
  backspaceLabel: { type: String, default: '' },
  confirmText: { type: String, default: '' },
  // <lang><zh-CN>禁用同时约束键和全部 action handler。</zh-CN><en>Disabled constrains keys and every action handler together.</en></lang>
  disabled: { type: Boolean, default: false }
});

// <lang><zh-CN>事件只报告 caller-owned key/phase 和局部操作意图；应用决定输入写回、流程和格式。</zh-CN><en>Events report caller-owned key/phase and local operation intent only; the application decides input writeback, flow, and formatting.</en></lang>
const emit = defineEmits(['input', 'backspace', 'confirm', 'phase-change']);

/**
 * @lang zh-CN 将一个调用方键规范化为有限可读记录；没有可读 label 的项目返回 null。
 * @lang en Normalizes one caller key into a finite readable record; an item with no readable label returns null.
 * @param {unknown} key <lang><zh-CN>调用方键。</zh-CN><en>Caller key.</en></lang>
 * @param {number} rowIndex <lang><zh-CN>受限行索引，仅用于稳定键。</zh-CN><en>Bounded row index, used only for a stable key.</en></lang>
 * @param {number} keyIndex <lang><zh-CN>受限行内索引，仅用于稳定键。</zh-CN><en>Bounded index within row, used only for a stable key.</en></lang>
 * @returns {{key: string, label: string, value: unknown, disabled: boolean}|null} <lang><zh-CN>规范化键或 null。</zh-CN><en>Normalized key or null.</en></lang>
 */
function normalizeKey(key, rowIndex, keyIndex) {
  // <lang><zh-CN>对象键只读取显式字段；原始字符串/数值仅作为透明快捷写法。</zh-CN><en>Object keys read explicit fields only; primitive string/number values serve transparent shorthand only.</en></lang>
  const source = key !== null && typeof key === 'object' ? key : { label: key, value: key };
  const candidateLabel = source.label ?? source.text ?? '';
  const label = typeof candidateLabel === 'string' || typeof candidateLabel === 'number' ? String(candidateLabel) : '';
  if (label.trim().length === 0) return null;
  const value = Object.prototype.hasOwnProperty.call(source, 'value') ? source.value : label;
  return Object.freeze({ key: `key-${rowIndex}-${keyIndex}`, label, value, disabled: Boolean(source.disabled) });
}

// <lang><zh-CN>行与键数都受限，避免把未审阅的任意大输入转化为虚拟化、随机化或地区数据服务。</zh-CN><en>Both row and key counts are bounded, preventing arbitrary unreviewed input from turning into virtualization, randomization, or a region-data service.</en></lang>
const safeRows = computed(() => (Array.isArray(props.rows) ? props.rows : []).slice(0, 4).map((row, rowIndex) => {
  // <lang><zh-CN>非数组行不具备安全可迭代键集合，因此投影为空行。</zh-CN><en>A non-array row has no safely iterable key collection and therefore projects as an empty row.</en></lang>
  if (!Array.isArray(row)) return Object.freeze([]);
  return Object.freeze(row.slice(0, 12).map((key, keyIndex) => normalizeKey(key, rowIndex, keyIndex)).filter((key) => key !== null));
}).filter((row) => row.length > 0));

// <lang><zh-CN>所有可见文字和 phase 值均只接受明确字符串，避免不匹配 prop 隐式变成用户文案或 state。</zh-CN><en>All visible copy and phase values accept explicit strings only, preventing mismatched props from implicitly becoming user copy or state.</en></lang>
const safeLabel = computed(() => typeof props.label === 'string' ? props.label : '');
const safePhase = computed(() => typeof props.phase === 'string' ? props.phase : '');
const safeNextPhase = computed(() => typeof props.nextPhase === 'string' ? props.nextPhase : '');
const safeSwitchText = computed(() => typeof props.switchText === 'string' ? props.switchText : '');
const safeBackspaceLabel = computed(() => typeof props.backspaceLabel === 'string' ? props.backspaceLabel : '');
const safeConfirmText = computed(() => typeof props.confirmText === 'string' ? props.confirmText : '');

// <lang><zh-CN>切换必须明确有不同的下一 phase 和调用方文字，避免组件猜测车牌阶段或产生无标签 action。</zh-CN><en>Switching requires an explicit different next phase and caller copy, avoiding component guesses of a plate phase or creation of an unlabeled action.</en></lang>
const canChangePhase = computed(() => safeSwitchText.value.trim().length > 0 && safeNextPhase.value.trim().length > 0 && safeNextPhase.value !== safePhase.value);

// <lang><zh-CN>操作区只在至少一个调用方拥有的 action 可以输出时创建。</zh-CN><en>The action area is created only when at least one caller-owned action can output.</en></lang>
const hasActions = computed(() => canChangePhase.value || safeBackspaceLabel.value.trim().length > 0 || safeConfirmText.value.trim().length > 0);

// <lang><zh-CN>空/隐藏键盘不会产生固定面或默认键，至少一行可读键才可渲染。</zh-CN><en>An empty/hidden keyboard creates no fixed surface or default key; at least one readable key row is required for rendering.</en></lang>
const isRenderable = computed(() => props.visible && safeRows.value.length > 0);

/**
 * @lang zh-CN 报告启用键的 caller value；不拼接车牌、不更新 phase 或写回输入模型。
 * @lang en Reports caller value of an enabled key; it concatenates no plate, updates no phase, and writes no input model.
 * @param {{value: unknown, disabled: boolean}} key <lang><zh-CN>已规范化键。</zh-CN><en>Normalized key.</en></lang>
 * @param {unknown} event <lang><zh-CN>原始点击事件。</zh-CN><en>Original click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `input`。</zh-CN><en>No return value; emits `input` when the guard passes.</en></lang>
 */
function emitInput(key, event) {
  // <lang><zh-CN>guard 同时保护 hidden、disabled 与单键 disabled，防止直接 handler 调用越过模板。</zh-CN><en>The guard protects hidden, disabled, and per-key-disabled states together, preventing direct handler calls from bypassing the template.</en></lang>
  if (!isRenderable.value || props.disabled || key.disabled) return;
  emit('input', { value: key.value, event });
}

/**
 * @lang zh-CN 报告已标签化的本地删除意图；不长按重复、不清空输入或启动 timer。
 * @lang en Reports labeled local backspace intent; it repeats no long press, clears no input, and starts no timer.
 * @param {unknown} event <lang><zh-CN>原始点击事件。</zh-CN><en>Original click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `backspace`。</zh-CN><en>No return value; emits `backspace` when the guard passes.</en></lang>
 */
function emitBackspace(event) {
  // <lang><zh-CN>没有 caller 文案时没有删除入口；guard 使直接调用保持同一边界。</zh-CN><en>Without caller copy there is no backspace entry; the guard keeps the same boundary for direct calls.</en></lang>
  if (!isRenderable.value || props.disabled || safeBackspaceLabel.value.trim().length === 0) return;
  emit('backspace', event);
}

/**
 * @lang zh-CN 报告已标签化的本地确认意图；不提交、关闭或校验调用方输入。
 * @lang en Reports labeled local confirm intent; it submits, closes, and validates no caller input.
 * @param {unknown} event <lang><zh-CN>原始点击事件。</zh-CN><en>Original click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `confirm`。</zh-CN><en>No return value; emits `confirm` when the guard passes.</en></lang>
 */
function emitConfirm(event) {
  // <lang><zh-CN>确认只在可见、启用且存在 caller 文字时成为可发现意图。</zh-CN><en>Confirm becomes discoverable intent only when visible, enabled, and caller copy exists.</en></lang>
  if (!isRenderable.value || props.disabled || safeConfirmText.value.trim().length === 0) return;
  emit('confirm', event);
}

/**
 * @lang zh-CN 报告 caller 声明的下一 phase；组件不修改当前 phase 或重排键行。
 * @lang en Reports caller-declared next phase; the component changes no current phase and rearranges no key row.
 * @param {unknown} event <lang><zh-CN>原始点击事件。</zh-CN><en>Original click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `phase-change`。</zh-CN><en>No return value; emits `phase-change` when the guard passes.</en></lang>
 */
function emitPhaseChange(event) {
  // <lang><zh-CN>guard 要求明确且不同的下一 phase，避免把当前值或空值误当作状态机推进。</zh-CN><en>The guard requires an explicit and different next phase, avoiding treating current or empty value as state-machine progression.</en></lang>
  if (!isRenderable.value || props.disabled || !canChangePhase.value) return;
  emit('phase-change', { phase: safeNextPhase.value, event });
}
</script>

<style src="./u-car-keyboard.css"></style>
