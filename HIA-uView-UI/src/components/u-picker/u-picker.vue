<!--
@component UPicker
@lang zh-CN 提供有限单列或多列的声明式草稿选择；它不绑定弹层、地区、时间、请求、路由或身份机制。
@lang en Provides finite declarative single- or multi-column draft selection; it binds to no popup, region, time, request, route, or identity mechanism.
-->
<template>
  <view class="u-picker" role="group" :aria-label="pickerAriaLabel" :aria-disabled="props.disabled">
    <view v-if="props.title || $slots.title" class="u-picker__title">
      <slot name="title" :title="props.title">{{ props.title }}</slot>
    </view>
    <view class="u-picker__options" :class="{ 'u-picker__options--multiple': isMultiple }">
      <view v-for="(column, columnIndex) in safeColumns" :key="`column-${columnIndex}`" class="u-picker__column" role="listbox" :aria-disabled="props.disabled">
        <button
          v-for="option in column"
          :key="option.key"
          class="u-picker__option"
          :class="{ 'u-picker__option--selected': draftIndexes[columnIndex] === option.index }"
          type="button"
          role="option"
          :aria-selected="draftIndexes[columnIndex] === option.index"
          :disabled="props.disabled || option.disabled"
          @click="selectOption(columnIndex, option.index)"
        >
          {{ option.label }}
        </button>
      </view>
    </view>
    <view class="u-picker__actions">
      <button class="u-picker__action" type="button" :disabled="props.disabled" @click="cancelSelection">{{ cancelLabel }}</button>
      <button class="u-picker__action u-picker__action--confirm" type="button" :disabled="props.disabled" @click="confirmSelection">{{ confirmLabel }}</button>
    </view>
    <slot />
  </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useULocale } from '../../config-locale.mjs';

// <lang><zh-CN>保留 u- 名称；确定和取消只报告局部选择意图，调用方仍拥有最终值和外层呈现。</zh-CN><en>Retains the u- name; confirm and cancel report local selection intent only while the caller still owns the final value and outer presentation.</en></lang>
defineOptions({ name: 'u-picker' });

// <lang><zh-CN>columns 是首选有限输入，range 只作为单列迁移 alias；所有 copy 均由调用方或受限 locale 提供。</zh-CN><en>Columns are the preferred finite input and range is only a single-column migration alias; all copy comes from the caller or constrained locale.</en></lang>
const props = defineProps({
  modelValue: { type: [String, Number, Array], default: '' },
  columns: { type: Array, default: () => [] },
  range: { type: Array, default: () => [] },
  rangeKey: { type: String, default: '' },
  preserveSelection: { type: Boolean, default: true },
  title: { type: String, default: '' },
  confirmText: { type: String, default: '' },
  cancelText: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
});

// <lang><zh-CN>columnchange 只报告草稿；model update 与 confirm 仅在显式确认时按固定顺序发出。</zh-CN><en>Columnchange reports draft state only; model update and confirm are emitted in a fixed order only on explicit confirmation.</en></lang>
const emit = defineEmits(['update:modelValue', 'columnchange', 'confirm', 'cancel']);

// <lang><zh-CN>locale 只解析本组件的无业务默认文字，不读取系统、账号或持久化语言。</zh-CN><en>Locale resolves only non-business default copy for this component and reads no system, account, or persisted language.</en></lang>
const locale = useULocale();
const pickerAriaLabel = computed(() => locale.value === 'en' ? 'Picker' : '选择器');
const confirmLabel = computed(() => props.confirmText || (locale.value === 'en' ? 'Confirm' : '确定'));
const cancelLabel = computed(() => props.cancelText || (locale.value === 'en' ? 'Cancel' : '取消'));

/**
 * @lang zh-CN 判断对象是否直接拥有指定字段，避免 rangeKey 读取原型链或解释路径。
 * @lang en Determines whether an object directly owns a field so rangeKey never reads the prototype chain or interprets a path.
 * @param {unknown} candidate <lang><zh-CN>候选对象。</zh-CN><en>Candidate object.</en></lang>
 * @param {string} key <lang><zh-CN>浅层字段名。</zh-CN><en>Shallow field name.</en></lang>
 * @returns {boolean} <lang><zh-CN>字段是否为候选对象的自有属性。</zh-CN><en>Whether the field is an own property of the candidate.</en></lang>
 */
function hasOwn(candidate, key) {
  // <lang><zh-CN>null 和原始值没有可接受的自有 option 字段。</zh-CN><en>Null and primitive values have no acceptable own option fields.</en></lang>
  return typeof candidate === 'object' && candidate !== null && Object.prototype.hasOwnProperty.call(candidate, key);
}

/**
 * @lang zh-CN 判断透明 option 值是否可安全比较；数字必须有限，且不执行字符串/数字互转。
 * @lang en Determines whether a transparent option value can be compared safely; numbers must be finite and no string/number coercion occurs.
 * @param {unknown} value <lang><zh-CN>候选透明值。</zh-CN><en>Candidate transparent value.</en></lang>
 * @returns {boolean} <lang><zh-CN>是否为受支持的字符串或有限数字。</zh-CN><en>Whether the value is a supported string or finite number.</en></lang>
 */
function isChoiceValue(value) {
  return typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value));
}

/**
 * @lang zh-CN 把一个 caller option 投影为不可变的局部记录，不修改或执行 caller 数据。
 * @lang en Projects one caller option into an immutable local record without mutating or executing caller data.
 * @param {unknown} raw <lang><zh-CN>调用方提供的原始 option。</zh-CN><en>Raw caller-provided option.</en></lang>
 * @param {number} index <lang><zh-CN>当前列内的零基索引。</zh-CN><en>Zero-based index within the current column.</en></lang>
 * @param {number} columnIndex <lang><zh-CN>当前列的零基索引。</zh-CN><en>Zero-based current-column index.</en></lang>
 * @returns {{key:string,index:number,label:string,value:string|number,disabled:boolean,raw:unknown}} <lang><zh-CN>稳定的局部 option 记录。</zh-CN><en>Stable local option record.</en></lang>
 */
function normalizeOption(raw, index, columnIndex) {
  // <lang><zh-CN>对象 value 仅在自有且类型有效时使用；否则 label 或列内索引提供稳定的非执行回退。</zh-CN><en>An object value is used only when it is own and valid; otherwise label or the column index provides a stable non-executing fallback.</en></lang>
  const valueCandidate = hasOwn(raw, 'value') ? raw.value : (hasOwn(raw, 'label') ? raw.label : raw);
  const value = isChoiceValue(valueCandidate) ? valueCandidate : index;

  // <lang><zh-CN>rangeKey 只读取一个自有浅层字段；缺失时回退公开 label/value，绝不解析点路径。</zh-CN><en>RangeKey reads one own shallow field only; when absent it falls back to public label/value and never parses a dotted path.</en></lang>
  const keyedLabel = props.rangeKey && hasOwn(raw, props.rangeKey) ? raw[props.rangeKey] : undefined;
  const labelCandidate = keyedLabel ?? (hasOwn(raw, 'label') ? raw.label : (hasOwn(raw, 'value') ? raw.value : raw));
  const label = labelCandidate === null || labelCandidate === undefined || typeof labelCandidate === 'object' ? String(index + 1) : String(labelCandidate);

  // <lang><zh-CN>禁用状态只接受显式 truthy 投影；record 保留 raw 引用供结构化结果回传，但从不修改它。</zh-CN><en>Disabled state accepts only an explicit truthy projection; the record retains the raw reference for structured results but never mutates it.</en></lang>
  const disabled = Boolean(hasOwn(raw, 'disabled') && raw.disabled);
  return Object.freeze({ key: `${columnIndex}-${index}`, index, label, value, disabled, raw });
}

/**
 * @lang zh-CN 把有限输入规整为单列或多列；混合嵌套形状整体视为无效，避免猜测列边界。
 * @lang en Normalizes finite input into single or multiple columns; a mixed nested shape is wholly invalid so column boundaries are never guessed.
 * @returns {ReadonlyArray<ReadonlyArray<ReturnType<typeof normalizeOption>>>} <lang><zh-CN>不可变列记录。</zh-CN><en>Immutable column records.</en></lang>
 */
function normalizeColumns() {
  // <lang><zh-CN>非空 columns 始终压过 range；range 仅在 columns 为空时成为一个单列。</zh-CN><en>Nonempty columns always override range; range becomes one single column only when columns are empty.</en></lang>
  const columnsTakePriority = Array.isArray(props.columns) && props.columns.length > 0;
  const source = columnsTakePriority ? props.columns : (Array.isArray(props.range) ? props.range : []);

  // <lang><zh-CN>只有首选 columns 允许嵌套列形状；range 一律是单列 alias，即使其某项本身是数组。</zh-CN><en>Only preferred columns accept a nested-column shape; range is always a single-column alias even when one of its items is itself an array.</en></lang>
  const nestedCount = columnsTakePriority ? source.reduce((count, candidate) => count + (Array.isArray(candidate) ? 1 : 0), 0) : 0;

  // <lang><zh-CN>部分嵌套意味着输入无法确定为单列或多列，返回空列使所有提交保持零事件。</zh-CN><en>Partial nesting makes the input ambiguous between single and multiple columns, so an empty column set keeps every commit at zero events.</en></lang>
  if (nestedCount > 0 && nestedCount !== source.length) {
    return Object.freeze([]);
  }

  // <lang><zh-CN>完整嵌套形成多列；其他输入（包括空数组）形成一个有限单列。</zh-CN><en>Fully nested input forms multiple columns; every other input, including an empty array, forms one finite single column.</en></lang>
  const rawColumns = columnsTakePriority && nestedCount > 0 ? source : [source];
  return Object.freeze(rawColumns.map((column, columnIndex) => Object.freeze(column.map((raw, index) => normalizeOption(raw, index, columnIndex)))));
}

// <lang><zh-CN>所有渲染与状态解析都消费同一份规范化列，避免 UI 与事件对 option 的解释分裂。</zh-CN><en>All rendering and state resolution consume the same normalized columns so UI and events cannot interpret options differently.</en></lang>
const safeColumns = computed(normalizeColumns);
const isMultiple = computed(() => safeColumns.value.length > 1 || (Array.isArray(props.columns) && props.columns.length > 0 && props.columns.every((column) => Array.isArray(column))));

/**
 * @lang zh-CN 将 caller model 拆成每列候选值，不为缺失列猜测默认 option。
 * @lang en Splits the caller model into per-column candidates without guessing default options for missing columns.
 * @param {unknown} model <lang><zh-CN>调用方已确认 model。</zh-CN><en>Caller-confirmed model.</en></lang>
 * @returns {unknown[]} <lang><zh-CN>按列排列的候选值。</zh-CN><en>Candidate values ordered by column.</en></lang>
 */
function modelValues(model) {
  // <lang><zh-CN>多列只接受数组；单列只接受一个透明标量，形状不符时返回空候选。</zh-CN><en>Multiple columns accept arrays only and a single column accepts one transparent scalar; a mismatched shape returns no candidate.</en></lang>
  if (isMultiple.value) return Array.isArray(model) ? [...model] : [];
  return !Array.isArray(model) && isChoiceValue(model) ? [model] : [];
}

/**
 * @lang zh-CN 按严格相等解析每列首个可用重复值；未匹配列使用 -1，不自动选择第一项。
 * @lang en Resolves the first enabled duplicate in each column by strict equality; an unmatched column uses -1 and never auto-selects the first item.
 * @param {readonly unknown[]} values <lang><zh-CN>每列候选值。</zh-CN><en>Per-column candidate values.</en></lang>
 * @returns {number[]} <lang><zh-CN>每列的已解析索引。</zh-CN><en>Resolved index for every column.</en></lang>
 */
function resolveIndexes(values) {
  return safeColumns.value.map((column, columnIndex) => {
    // <lang><zh-CN>findIndex 自然锁定第一个 enabled 且严格同值的 option，并保留字符串/数字差异。</zh-CN><en>FindIndex naturally locks the first enabled strictly equal option and preserves string/number distinctions.</en></lang>
    return column.findIndex((option) => !option.disabled && option.value === values[columnIndex]);
  });
}

// <lang><zh-CN>草稿只保存列索引快照；调用方 model 和 option 数组始终保持只读。</zh-CN><en>The draft stores only a snapshot of column indexes; caller model and option arrays always remain read-only.</en></lang>
const draftIndexes = ref([]);
const savedValues = ref([]);

/**
 * @lang zh-CN 从当前 caller model 恢复草稿，并同步最近已确认值供 preserveSelection 使用。
 * @lang en Restores the draft from the current caller model and synchronizes the latest confirmed values for preserveSelection.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function restoreCallerSelection() {
  // <lang><zh-CN>候选值先做形状限制，再按每列首个 enabled 匹配解析。</zh-CN><en>Candidate values are shape-constrained before resolving the first enabled match in each column.</en></lang>
  const values = modelValues(props.modelValue);
  draftIndexes.value = resolveIndexes(values);

  // <lang><zh-CN>只有完整有效的 caller selection 才成为可保存选择；新的无效 caller model 显式清除旧保存值。</zh-CN><en>Only a complete valid caller selection becomes preservable; a new invalid caller model explicitly clears an older saved value.</en></lang>
  if (draftIndexes.value.length === safeColumns.value.length && draftIndexes.value.every((index) => index >= 0)) {
    savedValues.value = draftIndexes.value.map((index, columnIndex) => safeColumns.value[columnIndex][index].value);
  } else {
    savedValues.value = [];
  }
}

/**
 * @lang zh-CN 在列输入或 preserveSelection 改变时重建草稿，优先保留仍有效的最近确认值。
 * @lang en Rebuilds the draft when column input or preserveSelection changes, preferring the latest confirmed values while they remain valid.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function reconcileColumns() {
  // <lang><zh-CN>关闭保存时始终服从 caller model；开启时只尝试此前完整确认的透明值。</zh-CN><en>When preservation is off the caller model always wins; when on, only previously complete confirmed transparent values are attempted.</en></lang>
  const candidates = props.preserveSelection && savedValues.value.length === safeColumns.value.length ? savedValues.value : modelValues(props.modelValue);
  const preservedIndexes = resolveIndexes(candidates);

  // <lang><zh-CN>保存候选必须在全部列仍有效；否则确定回退 caller model，不保留部分陈旧列。</zh-CN><en>A preserved candidate must remain valid in every column; otherwise reconciliation deterministically falls back to the caller model without keeping partially stale columns.</en></lang>
  if (preservedIndexes.length === safeColumns.value.length && preservedIndexes.every((index) => index >= 0)) {
    draftIndexes.value = preservedIndexes;
    return;
  }
  draftIndexes.value = resolveIndexes(modelValues(props.modelValue));
}

// <lang><zh-CN>caller model 的任何变更都是新的权威确认值；深监听只覆盖多列数组元素变化。</zh-CN><en>Every caller-model change is a new authoritative confirmed value; deep watching only covers changes to multi-column array members.</en></lang>
watch(() => props.modelValue, restoreCallerSelection, { immediate: true, deep: true });

// <lang><zh-CN>列或 preserve 开关变化只重算内部索引，不写回 caller model 或发出用户事件。</zh-CN><en>Column or preserve-toggle changes recompute internal indexes only and write neither caller model nor user events.</en></lang>
watch([safeColumns, () => props.preserveSelection], reconcileColumns, { immediate: true });

/**
 * @lang zh-CN 从索引快照建立稳定结构化结果；无效位置显式为 -1/null，而不是隐式选第一项。
 * @lang en Builds a stable structured result from an index snapshot; invalid positions are explicit -1/null rather than implicit first-item selections.
 * @param {readonly number[]} indexes <lang><zh-CN>每列零基索引快照。</zh-CN><en>Per-column zero-based index snapshot.</en></lang>
 * @returns {{value:unknown,values:readonly unknown[],indexes:readonly number[],options:readonly unknown[],valid:boolean}} <lang><zh-CN>不可变选择结果和内部 valid 标记。</zh-CN><en>Immutable selection result and internal valid marker.</en></lang>
 */
function createResult(indexes) {
  // <lang><zh-CN>每列仅接受当前范围内且 enabled 的索引；其他位置统一成为 null。</zh-CN><en>Each column accepts only a current in-range enabled index; every other position becomes null.</en></lang>
  const records = safeColumns.value.map((column, columnIndex) => {
    const index = Number.isInteger(indexes[columnIndex]) ? indexes[columnIndex] : -1;
    const option = index >= 0 && index < column.length && !column[index].disabled ? column[index] : null;
    return Object.freeze({ index: option ? index : -1, option });
  });
  const values = Object.freeze(records.map((record) => record.option?.value ?? null));
  const resultIndexes = Object.freeze(records.map((record) => record.index));
  const options = Object.freeze(records.map((record) => record.option?.raw ?? null));
  const valid = records.length > 0 && records.every((record) => record.option !== null);
  const value = isMultiple.value ? values : values[0] ?? null;
  return Object.freeze({ value, values, indexes: resultIndexes, options, valid });
}

/**
 * @lang zh-CN 更新指定列草稿并发出完整 columnchange 快照；禁用、未知列或禁用 option 均为零事件。
 * @lang en Updates one column draft and emits a complete columnchange snapshot; disabled, unknown-column, or disabled-option inputs emit nothing.
 * @param {number} columnIndex <lang><zh-CN>目标列索引。</zh-CN><en>Target column index.</en></lang>
 * @param {number} optionIndex <lang><zh-CN>目标 option 索引。</zh-CN><en>Target option index.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function selectOption(columnIndex, optionIndex) {
  // <lang><zh-CN>所有索引和 option 必须来自当前有限列；直接调用也不能绕过 disabled guard。</zh-CN><en>Every index and option must belong to the current finite columns; direct calls cannot bypass the disabled guard.</en></lang>
  const column = safeColumns.value[columnIndex];
  const option = column?.[optionIndex];
  if (props.disabled || !column || !option || option.disabled) return;

  // <lang><zh-CN>新数组替换内部草稿，既不 mutation caller model，也不复用旧事件数组。</zh-CN><en>A new array replaces the internal draft, mutating neither caller model nor reusing an old event array.</en></lang>
  const nextIndexes = [...draftIndexes.value];
  nextIndexes[columnIndex] = optionIndex;
  draftIndexes.value = nextIndexes;

  // <lang><zh-CN>columnchange 先看到已应用的草稿，并携带当前列及完整选择快照。</zh-CN><en>Columnchange observes the already-applied draft and carries both the current column and complete selection snapshot.</en></lang>
  const result = createResult(nextIndexes);
  emit('columnchange', Object.freeze({ column: columnIndex, index: optionIndex, value: option.value, option: option.raw, values: result.values, indexes: result.indexes, options: result.options }));
}

/**
 * @lang zh-CN 恢复当前 caller 值并用结构化快照报告取消，不写 model。
 * @lang en Restores the current caller value and reports cancellation with a structured snapshot without writing the model.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function cancelSelection() {
  if (props.disabled) return;
  restoreCallerSelection();

  // <lang><zh-CN>取消的顶层 value 保留 caller 原始快照；无法解析的各列则在 values/indexes/options 中用 null/-1 诚实披露。</zh-CN><en>Cancellation preserves the original caller snapshot at top-level value; unresolved columns are honestly disclosed as null/-1 in values/indexes/options.</en></lang>
  const result = createResult(draftIndexes.value);
  const callerValue = Array.isArray(props.modelValue) ? Object.freeze([...props.modelValue]) : props.modelValue;
  emit('cancel', Object.freeze({ value: callerValue, values: result.values, indexes: result.indexes, options: result.options }));
}

/**
 * @lang zh-CN 仅在每列草稿都解析为 enabled option 时提交 model，并随后发出同一不可变结构化结果。
 * @lang en Commits the model only when every column draft resolves to an enabled option, then emits the same immutable structured result.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function confirmSelection() {
  const result = createResult(draftIndexes.value);
  if (props.disabled || !result.valid) return;

  // <lang><zh-CN>保存透明值而非索引，使列更新后可按严格值重新定位首个 enabled 重复项。</zh-CN><en>Transparent values rather than indexes are saved so changed columns can relocate the first enabled duplicate by strict value.</en></lang>
  savedValues.value = [...result.values];
  const publicResult = Object.freeze({ value: result.value, values: result.values, indexes: result.indexes, options: result.options });

  // <lang><zh-CN>固定顺序先请求 caller model 写回，再报告 confirm 观察；组件不会直接 mutation prop。</zh-CN><en>The fixed order requests caller-model writeback before reporting the confirm observation; the component never mutates the prop directly.</en></lang>
  emit('update:modelValue', result.value);
  emit('confirm', publicResult);
}
</script>

<style src="./u-picker.css"></style>
