<!--
@component USelect
@lang zh-CN 提供单值有限选项的 inline 选择面板；选项、最终值和外层布局均由 caller 拥有。
@lang en Provides an inline finite single-value selection panel; options, the final value, and outer layout all remain caller-owned.
-->
<template>
  <view class="u-select" :class="{ 'u-select--disabled': props.disabled, 'u-select--open': isOpen }" role="group">
    <button class="u-select__trigger" type="button" :disabled="props.disabled" :aria-expanded="isOpen" @click="openSelection">
      <text v-if="!selectedOption" class="u-select__placeholder">{{ placeholderLabel }}</text>
      <text v-else class="u-select__value">{{ selectedOption.label }}</text>
    </button>
    <view v-if="isOpen" class="u-select__panel">
      <view class="u-select__options" role="listbox" :aria-disabled="props.disabled">
        <button
          v-for="option in safeOptions"
          :key="option.key"
          class="u-select__option"
          :class="{ 'u-select__option--selected': draftOption?.index === option.index }"
          type="button"
          role="option"
          :aria-selected="draftOption?.index === option.index"
          :disabled="props.disabled || option.disabled"
          @click="selectOption(option)"
        >
          {{ option.label }}
        </button>
      </view>
      <view v-if="props.confirmMode" class="u-select__actions">
        <button class="u-select__action" type="button" :disabled="props.disabled" @click="cancelSelection">{{ cancelLabel }}</button>
        <button class="u-select__action u-select__action--confirm" type="button" :disabled="props.disabled" @click="confirmSelection">{{ confirmLabel }}</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useULocale } from '../../config-locale.mjs';

// <lang><zh-CN>保留 u- 名称；本组件只展开 inline panel，不获取 popup、overlay、路由或页面状态所有权。</zh-CN><en>Retains the u- name; this component opens an inline panel only and acquires no popup, overlay, routing, or page-state ownership.</en></lang>
defineOptions({ name: 'u-select' });

// <lang><zh-CN>confirmMode=false 保留立即提交；true 则显式分离草稿、确定和取消。</zh-CN><en>ConfirmMode=false retains immediate commit; true explicitly separates draft, confirm, and cancel.</en></lang>
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
  confirmText: { type: String, default: '' },
  cancelText: { type: String, default: '' },
  confirmMode: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
});

// <lang><zh-CN>click 原样返回本地触发事件；只有提交路径才发 model/change，confirm/cancel 使用结构化快照。</zh-CN><en>Click returns the local trigger event unchanged; only commit paths emit model/change, while confirm/cancel use structured snapshots.</en></lang>
const emit = defineEmits(['update:modelValue', 'change', 'click', 'confirm', 'cancel']);

// <lang><zh-CN>locale 只为空 caller copy 提供受限默认文字，不读取系统或存储。</zh-CN><en>Locale supplies constrained default copy only when caller copy is empty and reads neither system nor storage.</en></lang>
const locale = useULocale();
const placeholderLabel = computed(() => props.placeholder || (locale.value === 'en' ? 'Select' : '请选择'));
const confirmLabel = computed(() => props.confirmText || (locale.value === 'en' ? 'Confirm' : '确定'));
const cancelLabel = computed(() => props.cancelText || (locale.value === 'en' ? 'Cancel' : '取消'));

/**
 * @lang zh-CN 判断对象是否直接拥有指定 option 字段，防止原型链值潜入公开选择。
 * @lang en Determines whether an object directly owns an option field, preventing prototype-chain values from entering public selection.
 * @param {unknown} candidate <lang><zh-CN>候选对象。</zh-CN><en>Candidate object.</en></lang>
 * @param {string} key <lang><zh-CN>浅层字段名。</zh-CN><en>Shallow field name.</en></lang>
 * @returns {boolean} <lang><zh-CN>是否为自有字段。</zh-CN><en>Whether it is an own field.</en></lang>
 */
function hasOwn(candidate, key) {
  return typeof candidate === 'object' && candidate !== null && Object.prototype.hasOwnProperty.call(candidate, key);
}

/**
 * @lang zh-CN 判断透明选择值是否为可严格比较的字符串或有限数字。
 * @lang en Determines whether a transparent selection value is a strictly comparable string or finite number.
 * @param {unknown} value <lang><zh-CN>候选值。</zh-CN><en>Candidate value.</en></lang>
 * @returns {boolean} <lang><zh-CN>是否可用。</zh-CN><en>Whether it is usable.</en></lang>
 */
function isChoiceValue(value) {
  return typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value));
}

/**
 * @lang zh-CN 将 caller option 复制为有限局部记录，不修改 caller 数据或执行其字段。
 * @lang en Copies a caller option into a finite local record without mutating caller data or executing its fields.
 * @param {unknown} raw <lang><zh-CN>原始 option。</zh-CN><en>Raw option.</en></lang>
 * @param {number} index <lang><zh-CN>零基索引。</zh-CN><en>Zero-based index.</en></lang>
 * @returns {{key:string,index:number,label:string,value:string|number,disabled:boolean,raw:unknown}} <lang><zh-CN>不可变局部 option。</zh-CN><en>Immutable local option.</en></lang>
 */
function normalizeOption(raw, index) {
  // <lang><zh-CN>只信任自有 value/label；其他对象使用索引回退，原始标量值则原样保留。</zh-CN><en>Only own value/label fields are trusted; other objects fall back to the index while original scalar values are preserved.</en></lang>
  const valueCandidate = hasOwn(raw, 'value') ? raw.value : (hasOwn(raw, 'label') ? raw.label : raw);
  const value = isChoiceValue(valueCandidate) ? valueCandidate : index;
  const labelCandidate = hasOwn(raw, 'label') ? raw.label : (hasOwn(raw, 'value') ? raw.value : raw);
  const label = labelCandidate === null || labelCandidate === undefined || typeof labelCandidate === 'object' ? String(index + 1) : String(labelCandidate);
  const disabled = Boolean(hasOwn(raw, 'disabled') && raw.disabled);
  return Object.freeze({ key: `option-${index}`, index, label, value, disabled, raw });
}

// <lang><zh-CN>所有呈现、重复解析和事件都消费同一不可变规范化数组。</zh-CN><en>All presentation, duplicate resolution, and events consume the same immutable normalized array.</en></lang>
const safeOptions = computed(() => {
  // <lang><zh-CN>运行期非数组输入投影为空有限集合，不让类型误用打开隐式数据转换。</zh-CN><en>A runtime non-array input projects to an empty finite set and never opens an implicit data conversion.</en></lang>
  const candidates = Array.isArray(props.options) ? props.options : [];
  return Object.freeze(candidates.map((raw, index) => normalizeOption(raw, index)));
});

/**
 * @lang zh-CN 以严格值相等解析首个 enabled 重复项，不进行字符串/数字互转。
 * @lang en Resolves the first enabled duplicate by strict value equality without string/number coercion.
 * @param {unknown} value <lang><zh-CN>候选透明值。</zh-CN><en>Candidate transparent value.</en></lang>
 * @returns {ReturnType<typeof normalizeOption>|null} <lang><zh-CN>首个可用 option 或 null。</zh-CN><en>First usable option or null.</en></lang>
 */
function findOption(value) {
  return safeOptions.value.find((option) => !option.disabled && option.value === value) || null;
}

// <lang><zh-CN>对外显示始终根据 caller model 解析，而不偷用未确认草稿。</zh-CN><en>External display always resolves from the caller model and never borrows an unconfirmed draft.</en></lang>
const selectedOption = computed(() => findOption(props.modelValue));

// <lang><zh-CN>inline 面板和草稿是局部短生命状态，不代替 caller model。</zh-CN><en>The inline panel and draft are short-lived local state and never replace the caller model.</en></lang>
const isOpen = ref(false);
const draftValue = ref(props.modelValue);
const draftOption = computed(() => findOption(draftValue.value));

// <lang><zh-CN>caller model 变化是新的权威快照，即使面板已展开也覆盖本地草稿。</zh-CN><en>A caller-model change is a new authoritative snapshot and replaces the local draft even while the panel is open.</en></lang>
watch(() => props.modelValue, (value) => { draftValue.value = value; });

// <lang><zh-CN>option 更新时，有效草稿继续保留；失效草稿回到 caller model，且不发事件。</zh-CN><en>When options change, a valid draft remains; an invalid draft returns to the caller model without emitting events.</en></lang>
watch(safeOptions, () => {
  if (!findOption(draftValue.value)) draftValue.value = props.modelValue;
});

// <lang><zh-CN>运行期进入 disabled 会静默关闭局部面板，不伪造 cancel 或值变更。</zh-CN><en>Entering disabled at runtime silently closes the local panel without fabricating cancellation or a value change.</en></lang>
watch(() => props.disabled, (disabled) => {
  if (disabled) isOpen.value = false;
});

/**
 * @lang zh-CN 展开 inline panel、从 caller model 创建草稿，然后原样报告触发事件。
 * @lang en Opens the inline panel, creates a draft from the caller model, then reports the trigger event unchanged.
 * @param {unknown} event <lang><zh-CN>本地触发事件，不解析或持久化。</zh-CN><en>Local trigger event, neither interpreted nor persisted.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function openSelection(event) {
  // <lang><zh-CN>disabled 或已展开时保持幂等零事件，防止重复 click 被误解为多个 panel。</zh-CN><en>Disabled or already-open states retain idempotent zero events so repeated clicks cannot be mistaken for multiple panels.</en></lang>
  if (props.disabled || isOpen.value) return;
  draftValue.value = props.modelValue;
  isOpen.value = true;
  emit('click', event);
}

/**
 * @lang zh-CN 为一个已解析 option 建立不可变公开快照。
 * @lang en Builds an immutable public snapshot for one resolved option.
 * @param {ReturnType<typeof normalizeOption>|null} option <lang><zh-CN>已解析 option 或 null。</zh-CN><en>Resolved option or null.</en></lang>
 * @param {string|number|null} [orphanValue=null] <lang><zh-CN>取消恢复时仍需报告的未匹配 caller 值。</zh-CN><en>Unmatched caller value that still needs reporting during cancellation restore.</en></lang>
 * @returns {{value:string|number|null,index:number,option:unknown}} <lang><zh-CN>结构化选择快照。</zh-CN><en>Structured selection snapshot.</en></lang>
 */
function createResult(option, orphanValue = null) {
  // <lang><zh-CN>有效 option 始终优先；只有无匹配取消快照才保留透明 caller 孤儿值。</zh-CN><en>A valid option always wins; only an unmatched cancellation snapshot retains the transparent caller orphan value.</en></lang>
  const value = option ? option.value : (isChoiceValue(orphanValue) ? orphanValue : null);
  return Object.freeze({ value, index: option?.index ?? -1, option: option?.raw ?? null });
}

/**
 * @lang zh-CN 选择一个 enabled option；立即模式提交，confirm 模式仅改草稿。
 * @lang en Selects one enabled option; immediate mode commits it while confirm mode changes the draft only.
 * @param {ReturnType<typeof normalizeOption>} option <lang><zh-CN>当前渲染的局部 option。</zh-CN><en>Currently rendered local option.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function selectOption(option) {
  // <lang><zh-CN>直接 handler 调用同样校验 panel、disabled 和当前 option 身份。</zh-CN><en>Direct handler calls validate the panel, disabled state, and current option identity as well.</en></lang>
  const currentOption = safeOptions.value[option?.index];
  if (!isOpen.value || props.disabled || !currentOption || currentOption !== option || option.disabled) return;

  // <lang><zh-CN>同值的多个 enabled option 始终收敛到首个可用项，使点击、model 恢复和 confirm 使用同一解析规则。</zh-CN><en>Multiple enabled options with the same value always converge on the first usable item, so click, model restore, and confirm share one resolution rule.</en></lang>
  const canonicalOption = findOption(option.value);
  if (!canonicalOption) return;
  draftValue.value = canonicalOption.value;

  // <lang><zh-CN>confirm 模式至此只有本地草稿变化，不发出值或 confirm 事件。</zh-CN><en>At this point confirm mode changes local draft only and emits neither value nor confirm events.</en></lang>
  if (props.confirmMode) return;

  // <lang><zh-CN>立即模式先关闭局部 panel，再依次请求 model 写回和报告 change。</zh-CN><en>Immediate mode closes the local panel first, then requests model writeback and reports change in order.</en></lang>
  isOpen.value = false;
  emit('update:modelValue', canonicalOption.value);
  emit('change', canonicalOption.value);
}

/**
 * @lang zh-CN 提交有效草稿，依次报告 model、change 和结构化 confirm。
 * @lang en Commits a valid draft and reports model, change, and structured confirm in order.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function confirmSelection() {
  const option = draftOption.value;
  if (!isOpen.value || !props.confirmMode || props.disabled || !option) return;

  // <lang><zh-CN>面板状态在事件前已经关闭；同一 option 快照服务全部三个事件。</zh-CN><en>Panel state is closed before events; the same option snapshot serves all three events.</en></lang>
  isOpen.value = false;
  const result = createResult(option);
  emit('update:modelValue', option.value);
  emit('change', option.value);
  emit('confirm', result);
}

/**
 * @lang zh-CN 取消时恢复当前 caller model，关闭 panel，并报告可能含 null 的诚实快照。
 * @lang en On cancellation, restores the current caller model, closes the panel, and reports an honest snapshot that may contain null.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function cancelSelection() {
  if (!isOpen.value || !props.confirmMode || props.disabled) return;
  draftValue.value = props.modelValue;
  isOpen.value = false;
  emit('cancel', createResult(findOption(props.modelValue), props.modelValue));
}
</script>

<style src="./u-select.css"></style>
