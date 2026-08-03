<!--
@component UCitySelect
@lang zh-CN 提供调用方拥有列数据和值的有限级联选择面；名称保留迁移入口，但组件不内置城市/地区数据、定位、地址字段或远端数据访问。
@lang en Provides a finite cascading-selection surface with caller-owned column data and values; the name retains a migration entry, but the component contains no city/region data, geolocation, address fields, or remote data access.
-->
<template>
  <!-- @lang zh-CN 仅在 caller visible 且至少一列存在可读选项时输出；每个 button 只报告下一组受控值，不修改内部选择状态。
  @lang en Outputs only when caller-visible and at least one column has readable options; every button reports only a next controlled value set and mutates no internal selection state.
  <lang><zh-CN>列最多三项，数据和文案完全属于调用方；footer 控制项无文字时不出现。</zh-CN><en>There are at most three columns, and data/copy belong entirely to the caller; footer controls do not appear without text.</en></lang>
  -->
  <view v-if="isRenderable" :class="selectorClasses" role="group" :aria-label="safeTitle">
    <text v-if="safeTitle" class="u-city-select__title">{{ safeTitle }}</text>
    <view class="u-city-select__columns">
      <view v-for="(column, columnIndex) in safeColumns" :key="`column-${columnIndex}`" class="u-city-select__column">
        <button v-for="option in column" :key="option.key" :class="optionClasses(columnIndex, option)" type="button" :disabled="disabled || option.disabled" :aria-pressed="isSelected(columnIndex, option.value)" @click="emitChange(columnIndex, option, $event)"><text>{{ option.label }}</text></button>
      </view>
    </view>
    <view v-if="hasFooter" class="u-city-select__footer"><button v-if="safeCloseText" class="u-city-select__close" type="button" :disabled="disabled" @click="emitClose"><text>{{ safeCloseText }}</text></button><button v-if="safeConfirmText" class="u-city-select__confirm" type="button" :disabled="disabled" @click="emitConfirm"><text>{{ safeConfirmText }}</text></button></view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称保留 uView-family 迁移入口；组件实现的是数据无关的受控列选择，而非中国地区服务。</zh-CN><en>The stable name retains a uView-family migration entry; the component implements data-agnostic controlled column selection rather than a China-region service.</en></lang>
defineOptions({ name: 'u-city-select' });

// <lang><zh-CN>调用方拥有可见性、最多三列选项、已选值和全部用户文字；组件不接受 location、API 或地址模型。</zh-CN><en>The caller owns visibility, at most three option columns, selected values, and all user copy; the component accepts no location, API, or address model.</en></lang>
const props = defineProps({
  // <lang><zh-CN>可见性默认关闭，避免无请求地创建选择面。</zh-CN><en>Visibility defaults to off, avoiding creation of a selection surface without a request.</en></lang>
  visible: { type: Boolean, default: false },
  // <lang><zh-CN>可选 group 标签由调用方本地化；空标签不产生默认地理文案。</zh-CN><en>Optional group label is localized by the caller; an empty label produces no default geographic copy.</en></lang>
  title: { type: String, default: '' },
  // <lang><zh-CN>每列是调用方定义的 label/value/disabled 选项集合；组件只保留前三列和每列前五十项。</zh-CN><en>Every column is a caller-defined label/value/disabled option set; the component retains only the first three columns and first fifty items per column.</en></lang>
  columns: { type: Array, default: () => [] },
  // <lang><zh-CN>受控已选值数组按列顺序对应；组件不会自行写回它。</zh-CN><en>The controlled selected-value array corresponds to column order; the component never writes it itself.</en></lang>
  modelValue: { type: Array, default: () => [] },
  // <lang><zh-CN>footer 的两类文字均由调用方提供；空值不创建默认确认/关闭语言。</zh-CN><en>Both footer-copy values come from the caller; empty values create no default confirm/close language.</en></lang>
  confirmText: { type: String, default: '' },
  closeText: { type: String, default: '' },
  // <lang><zh-CN>禁用同时约束全部原生 button 和 handler guard。</zh-CN><en>Disabled constrains every native button and handler guard together.</en></lang>
  disabled: { type: Boolean, default: false }
});

// <lang><zh-CN>事件只报告受控候选值及确认/关闭意图；应用决定后续级联、弹层和领域写回。</zh-CN><en>Events report controlled candidate values and confirm/close intent only; the application decides follow-up cascade, overlay, and domain writeback.</en></lang>
const emit = defineEmits(['update:modelValue', 'change', 'confirm', 'close']);

/**
 * @lang zh-CN 将一个调用方 option 规范化为可渲染的有限 label/value/disabled 记录；不可读项目返回 null。
 * @lang en Normalizes one caller option into a renderable finite label/value/disabled record; an unreadable item returns null.
 * @param {unknown} option <lang><zh-CN>调用方提供的候选 option。</zh-CN><en>Candidate option supplied by the caller.</en></lang>
 * @param {number} index <lang><zh-CN>固定列内索引，仅用于稳定键。</zh-CN><en>Index within a fixed column, used only for a stable key.</en></lang>
 * @returns {{key: string, label: string, value: unknown, disabled: boolean}|null} <lang><zh-CN>规范化记录或 null。</zh-CN><en>Normalized record or null.</en></lang>
 */
function normalizeOption(option, index) {
  // <lang><zh-CN>对象候选保留其声明字段；原始字符串/数值仅作为本地 label/value 快捷写法。</zh-CN><en>Object candidates retain declared fields; primitive strings/numbers serve only as local label/value shorthand.</en></lang>
  const source = option !== null && typeof option === 'object' ? option : { label: option, value: option };

  // <lang><zh-CN>label 只接受字符串或数值的显式文本化结果，不把任意对象隐式渲染为用户文字。</zh-CN><en>Label accepts only explicit string or numeric text conversion and never implicitly renders an arbitrary object as user copy.</en></lang>
  const candidateLabel = source.label ?? source.text ?? '';
  const label = typeof candidateLabel === 'string' || typeof candidateLabel === 'number' ? String(candidateLabel) : '';

  // <lang><zh-CN>不可读 label 不形成无名称选择项，避免给辅助技术或触控用户输出空入口。</zh-CN><en>An unreadable label forms no nameless choice, avoiding an empty entry for assistive-technology or touch users.</en></lang>
  if (label.trim().length === 0) return null;

  // <lang><zh-CN>仅在 caller 明确提供 value 时使用它，否则让 label 本身成为透明的受控候选值。</zh-CN><en>Uses value only when the caller explicitly supplies it; otherwise label itself becomes the transparent controlled candidate value.</en></lang>
  const value = Object.prototype.hasOwnProperty.call(source, 'value') ? source.value : label;
  return Object.freeze({ key: `option-${index}`, label, value, disabled: Boolean(source.disabled) });
}

// <lang><zh-CN>规范化最多三列和每列五十项，避免无界 UI 数据被组件当作虚拟化/数据服务处理。</zh-CN><en>Normalizes at most three columns and fifty items per column, preventing unbounded UI data from being treated as virtualization or a data service by the component.</en></lang>
const safeColumns = computed(() => (Array.isArray(props.columns) ? props.columns : []).slice(0, 3).map((column) => {
  // <lang><zh-CN>非数组列没有可安全迭代的 option 集合，因此投影为空列。</zh-CN><en>A non-array column has no safely iterable option set and therefore projects as an empty column.</en></lang>
  if (!Array.isArray(column)) return Object.freeze([]);

  // <lang><zh-CN>每项通过有限规范化，再过滤掉不可读项；组件不修改原数组或其中对象。</zh-CN><en>Every item passes finite normalization and unreadable items are filtered; the component mutates neither the original array nor its objects.</en></lang>
  return Object.freeze(column.slice(0, 50).map(normalizeOption).filter((option) => option !== null));
}));

// <lang><zh-CN>受控值只取当前可见列数，防止多余数据成为未声明的组件状态。</zh-CN><en>Controlled values take only the current visible-column count, preventing excess data from becoming undeclared component state.</en></lang>
const safeModelValues = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []).slice(0, safeColumns.value.length));

// <lang><zh-CN>用户可见文字只接受明确字符串，避免不匹配 prop 被意外呈现为对象、数字或无标签 control。</zh-CN><en>User-visible copy accepts only explicit strings, preventing mismatched props from accidentally rendering as objects, numbers, or unlabeled controls.</en></lang>
const safeTitle = computed(() => typeof props.title === 'string' ? props.title : '');
const safeConfirmText = computed(() => typeof props.confirmText === 'string' ? props.confirmText : '');
const safeCloseText = computed(() => typeof props.closeText === 'string' ? props.closeText : '');

// <lang><zh-CN>根 class 只包含固定命名空间和 1–3 的受限列数，避免调用方数据进入 CSS class 或留下无意义的空列轨道。</zh-CN><en>Root classes contain only the fixed namespace and bounded one-to-three column count, preventing caller data from entering CSS classes or leaving meaningless empty column tracks.</en></lang>
const selectorClasses = computed(() => ['u-city-select', `u-city-select--columns-${Math.max(1, safeColumns.value.length)}`]);

// <lang><zh-CN>footer 仅在至少一项调用方文字存在时输出，不生成图标或默认语言按钮。</zh-CN><en>The footer outputs only when at least one caller copy value exists and generates no icon or default-language button.</en></lang>
const hasFooter = computed(() => safeConfirmText.value.trim().length > 0 || safeCloseText.value.trim().length > 0);

// <lang><zh-CN>组件只在 caller visible 且至少一列拥有可读 option 时输出，防止空容器误称为选择器。</zh-CN><en>The component outputs only when caller-visible and at least one column has readable options, preventing an empty container from being misrepresented as a selector.</en></lang>
const isRenderable = computed(() => props.visible && safeColumns.value.some((column) => column.length > 0));

/**
 * @lang zh-CN 判断一个 option 是否等于当前列的 caller-owned 受控值；比较使用 Object.is，不对值做字符串化。
 * @lang en Determines whether one option equals the current column caller-owned controlled value; comparison uses Object.is and does not stringify values.
 * @param {number} columnIndex <lang><zh-CN>有限列索引。</zh-CN><en>Finite column index.</en></lang>
 * @param {unknown} value <lang><zh-CN>候选 option 值。</zh-CN><en>Candidate option value.</en></lang>
 * @returns {boolean} <lang><zh-CN>当前值相等时为 true。</zh-CN><en>`true` when equal to current value.</en></lang>
 */
function isSelected(columnIndex, value) {
  // <lang><zh-CN>读取仅来自受控 modelValue 投影；组件不维护上一次点击的内部副本。</zh-CN><en>The read comes only from controlled modelValue projection; the component maintains no internal copy of the last click.</en></lang>
  return Object.is(safeModelValues.value[columnIndex], value);
}

/**
 * @lang zh-CN 为列 option 生成固定状态类；调用方 label/value 从不进入 CSS class。
 * @lang en Produces fixed state classes for a column option; caller label/value never enters a CSS class.
 * @param {number} columnIndex <lang><zh-CN>有限列索引。</zh-CN><en>Finite column index.</en></lang>
 * @param {{value: unknown, disabled: boolean}} option <lang><zh-CN>已规范化 option。</zh-CN><en>Normalized option.</en></lang>
 * @returns {Array<string|object>} <lang><zh-CN>固定命名空间和状态类。</zh-CN><en>Fixed namespace and state classes.</en></lang>
 */
function optionClasses(columnIndex, option) {
  // <lang><zh-CN>selected/disabled 是唯一视觉状态；它们不解释业务有效性或地区层级。</zh-CN><en>Selected/disabled are the only visual states; they interpret neither business validity nor geographic hierarchy.</en></lang>
  return ['u-city-select__option', { 'u-city-select__option--selected': isSelected(columnIndex, option.value), 'u-city-select__option--disabled': props.disabled || option.disabled }];
}

/**
 * @lang zh-CN 为一次候选选择构造完整值数组；未选列保留受控值，缺值时只使用该列第一个可读 option 作为显式候选。
 * @lang en Builds complete values for one candidate selection; unselected columns retain controlled values and only use a column's first readable option as an explicit candidate when missing.
 * @param {number} changedColumnIndex <lang><zh-CN>被点击列索引。</zh-CN><en>Clicked column index.</en></lang>
 * @param {unknown} changedValue <lang><zh-CN>被点击值。</zh-CN><en>Clicked value.</en></lang>
 * @returns {unknown[]} <lang><zh-CN>调用方可选择写回的候选值数组。</zh-CN><en>Candidate values array the caller may choose to write back.</en></lang>
 */
function nextValues(changedColumnIndex, changedValue) {
  // <lang><zh-CN>按当前受限列映射候选，保证不会为不可见的第四列生成状态。</zh-CN><en>Maps candidates by current constrained columns, ensuring no state is generated for an invisible fourth column.</en></lang>
  return safeColumns.value.map((column, columnIndex) => {
    // <lang><zh-CN>点击列必须采用被点击值，不从当前 modelValue 或第一个 option 猜测替代。</zh-CN><en>The clicked column must use the clicked value and does not guess a substitute from current modelValue or first option.</en></lang>
    if (columnIndex === changedColumnIndex) return changedValue;

    // <lang><zh-CN>已有受控值保持不变；级联数据重建仍由应用对 change 事件负责。</zh-CN><en>An existing controlled value remains unchanged; the application remains responsible for rebuilding cascade data on change.</en></lang>
    if (safeModelValues.value[columnIndex] !== undefined) return safeModelValues.value[columnIndex];

    // <lang><zh-CN>无受控值时返回首项 value 或 undefined，让调用方显式决定是否接受候选。</zh-CN><en>Without a controlled value, returns first item value or undefined so the caller explicitly decides whether to accept the candidate.</en></lang>
    return column[0]?.value;
  });
}

/**
 * @lang zh-CN 报告单列选择和完整受控候选数组；组件不更新 modelValue、不关闭选择面，也不解析地域规则。
 * @lang en Reports a single-column selection and complete controlled candidate array; the component updates no modelValue, closes no selector, and parses no geographic rule.
 * @param {number} columnIndex <lang><zh-CN>被点击列索引。</zh-CN><en>Clicked column index.</en></lang>
 * @param {{value: unknown, label: string, disabled: boolean}} option <lang><zh-CN>已规范化 option。</zh-CN><en>Normalized option.</en></lang>
 * @param {unknown} event <lang><zh-CN>原始点击事件。</zh-CN><en>Original click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit update/change。</zh-CN><en>No return value; emits update/change when the guard passes.</en></lang>
 */
function emitChange(columnIndex, option, event) {
  // <lang><zh-CN>hidden、disabled 或不可用 option 不可形成选择意图，即使 handler 被直接调用。</zh-CN><en>Hidden, disabled, or unavailable options cannot form selection intent even when the handler is called directly.</en></lang>
  if (!isRenderable.value || props.disabled || option.disabled) return;

  // <lang><zh-CN>候选数组只含有限列值；调用方可拒绝、重建后续列或原样写回。</zh-CN><en>The candidate array contains finite column values only; the caller may reject it, rebuild later columns, or write it back unchanged.</en></lang>
  const values = nextValues(columnIndex, option.value);
  emit('update:modelValue', values);
  emit('change', { values, columnIndex, value: option.value, label: option.label, event });
}

/**
 * @lang zh-CN 在 caller 提供 confirmText 时回传当前受控/显式候选值；组件不提交地址、表单或业务数据。
 * @lang en Returns current controlled/explicit candidate values when the caller provides confirmText; the component submits no address, form, or business data.
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `confirm`。</zh-CN><en>No return value; emits `confirm` when the guard passes.</en></lang>
 */
function emitConfirm() {
  // <lang><zh-CN>文字和 enabled 条件共同保证 confirm 是可发现、调用方授权的本地意图。</zh-CN><en>Copy and enabled conditions together ensure confirm is a discoverable caller-authorized local intent.</en></lang>
  if (!isRenderable.value || props.disabled || props.confirmText.trim().length === 0) return;
  emit('confirm', nextValues(-1, undefined));
}

/**
 * @lang zh-CN 在 caller 提供 closeText 时回传关闭意图；组件不写 visible、不恢复值也不关闭父级 service。
 * @lang en Returns close intent when the caller provides closeText; the component writes no visible state, restores no value, and closes no parent service.
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `close`。</zh-CN><en>No return value; emits `close` when the guard passes.</en></lang>
 */
function emitClose() {
  // <lang><zh-CN>guard 禁止隐藏、disabled 或无标签 close 通过直接调用产生意图。</zh-CN><en>The guard prevents hidden, disabled, or label-less close from producing intent through direct calls.</en></lang>
  if (!isRenderable.value || props.disabled || props.closeText.trim().length === 0) return;
  emit('close');
}
</script>

<style src="./u-city-select.css"></style>
