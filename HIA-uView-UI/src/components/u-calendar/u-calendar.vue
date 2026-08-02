<!--
@component UCalendar
@lang zh-CN 提供受控的单月日期选择；日期输入为声明式字符串，不读取系统日历、网络或身份状态。
@lang en Provides controlled single-month date selection; date inputs are declarative strings and read no system calendar, network, or identity state.
-->
<template>
  <view class="u-calendar" role="group" aria-label="Calendar / 日历">
    <view class="u-calendar__header">
      <button class="u-calendar__nav" type="button" aria-label="Previous month / 上个月" @click="changeMonth(-1)">‹</button>
      <text class="u-calendar__month">{{ monthLabel }}</text>
      <button class="u-calendar__nav" type="button" aria-label="Next month / 下个月" @click="changeMonth(1)">›</button>
    </view>
    <view class="u-calendar__week">
      <text v-for="label in weekLabels" :key="label" class="u-calendar__week-label">{{ label }}</text>
    </view>
    <view class="u-calendar__grid">
      <view v-for="cell in calendarCells" :key="cell.key" class="u-calendar__cell">
        <button v-if="!cell.blank" class="u-calendar__day" :class="{ 'u-calendar__day--selected': cell.selected, 'u-calendar__day--today': cell.today }" type="button" :disabled="cell.disabled" :aria-pressed="cell.selected" @click="selectDate(cell)">{{ cell.day }}</button>
      </view>
    </view>
    <slot name="footer" />
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>保持 u- 名称，并让日期选择完全由 v-model 和事件交给调用方。</zh-CN><en>Retains the u- name and leaves date selection entirely to the caller through v-model and events.</en></lang>
defineOptions({ name: 'u-calendar' });

// <lang><zh-CN>日期采用 YYYY-MM-DD 声明式值；禁用日期是调用方提供的有限字符串集合。</zh-CN><en>Dates use declarative YYYY-MM-DD values; disabled dates are a finite caller-provided string set.</en></lang>
const props = defineProps({
  modelValue: { type: String, default: '' },
  viewDate: { type: String, default: '' },
  minDate: { type: String, default: '' },
  maxDate: { type: String, default: '' },
  disabledDates: { type: Array, default: () => [] }
});
const emit = defineEmits(['update:modelValue', 'select', 'update:viewDate']);
const weekLabels = Object.freeze(['日 Sun', '一 Mon', '二 Tue', '三 Wed', '四 Thu', '五 Fri', '六 Sat']);

/**
 * @lang zh-CN 解析严格的本地日期字符串，避免跨时区 ISO 解析改变日期。
 * @lang en Parses strict local date strings so cross-time-zone ISO parsing cannot change the day.
 * @param {string} value <lang><zh-CN>日期字符串。</zh-CN><en>Date string.</en></lang>
 * @returns {Date|null} <lang><zh-CN>有效本地日期或 null。</zh-CN><en>Valid local date or null.</en></lang>
 */
function parseDate(value) {
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!matched) return null;
  const year = Number(matched[1]);
  const month = Number(matched[2]) - 1;
  const day = Number(matched[3]);
  const date = new Date(year, month, day);
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day ? date : null;
}

// <lang><zh-CN>格式化本地日期为组件契约使用的稳定字符串。</zh-CN><en>Formats a local date as the stable string used by the component contract.</en></lang>
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// <lang><zh-CN>按优先级选择视图锚点：viewDate、已选日期、今天。</zh-CN><en>Selects the view anchor by priority: viewDate, selected date, then today.</en></lang>
const anchorDate = computed(() => parseDate(props.viewDate) || parseDate(props.modelValue) || new Date());
const monthLabel = computed(() => `${anchorDate.value.getFullYear()}-${String(anchorDate.value.getMonth() + 1).padStart(2, '0')}`);
const selectedDate = computed(() => parseDate(props.modelValue));
const minDate = computed(() => parseDate(props.minDate));
const maxDate = computed(() => parseDate(props.maxDate));
const disabledSet = computed(() => new Set(props.disabledDates.filter((value) => Boolean(parseDate(value)))));

// <lang><zh-CN>判断日期是否被边界或调用方禁用；比较使用本地日期字符串而非时间戳。</zh-CN><en>Determines whether a date is disabled by bounds or the caller; comparison uses local date strings rather than timestamps.</en></lang>
function isDisabled(date) {
  const key = formatDate(date);
  return (minDate.value && date < minDate.value) || (maxDate.value && date > maxDate.value) || disabledSet.value.has(key);
}

// <lang><zh-CN>生成固定六周网格，保持小程序布局稳定并保留调用方的日期边界。</zh-CN><en>Generates a fixed six-week grid to keep mini-program layout stable while retaining caller date bounds.</en></lang>
const calendarCells = computed(() => {
  const anchor = anchorDate.value;
  const firstDay = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const leading = firstDay.getDay();
  const todayKey = formatDate(new Date());
  const cells = [];
  for (let index = 0; index < 42; index += 1) {
    const dayNumber = index - leading + 1;
    if (dayNumber < 1 || dayNumber > new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate()) {
      cells.push({ key: `blank-${index}`, blank: true });
      continue;
    }
    const date = new Date(anchor.getFullYear(), anchor.getMonth(), dayNumber);
    const dateKey = formatDate(date);
    cells.push({ key: dateKey, date: dateKey, day: dayNumber, blank: false, disabled: isDisabled(date), selected: dateKey === props.modelValue, today: dateKey === todayKey });
  }
  return cells;
});

/**
 * @lang zh-CN 报告相邻月份视图，不自动修改外部 viewDate。
 * @lang en Reports an adjacent month view without mutating external viewDate.
 * @param {number} offset <lang><zh-CN>月份偏移量。</zh-CN><en>Month offset.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function changeMonth(offset) {
  const current = anchorDate.value;
  const next = new Date(current.getFullYear(), current.getMonth() + offset, 1);
  emit('update:viewDate', formatDate(next));
}

/**
 * @lang zh-CN 选择可用日期并报告 update/select 两个受控事件。
 * @lang en Selects an available date and reports the two controlled update/select events.
 * @param {{blank: boolean, disabled: boolean, date?: string}} cell <lang><zh-CN>日期单元格。</zh-CN><en>Date cell.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function selectDate(cell) {
  if (cell.blank || cell.disabled || !cell.date) return;
  emit('update:modelValue', cell.date);
  emit('select', cell.date);
}
</script>

<style src="./u-calendar.css"></style>
