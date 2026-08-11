<!--
@component UCalendar
@lang zh-CN 提供受控的单月 Gregorian 日期选择；日期输入是本地字段字符串，不读取网络、业务日历或身份状态。
@lang en Provides controlled single-month Gregorian date selection; date inputs are local-field strings and read no network, business calendar, or identity state.
-->
<template>
  <view class="u-calendar" role="group" :aria-label="calendarAriaLabel" :aria-readonly="props.readonly">
    <view class="u-calendar__header">
      <button class="u-calendar__nav" type="button" :aria-label="previousMonthLabel" @click="changeMonth(-1)">‹</button>
      <text class="u-calendar__month">{{ monthLabel }}</text>
      <button class="u-calendar__nav" type="button" :aria-label="nextMonthLabel" @click="changeMonth(1)">›</button>
    </view>
    <view class="u-calendar__week">
      <text v-for="(label, index) in resolvedWeekLabels" :key="`${index}-${label}`" class="u-calendar__week-label">{{ label }}</text>
    </view>
    <view class="u-calendar__grid">
      <view v-for="cell in calendarCells" :key="cell.key" class="u-calendar__cell">
        <button
          v-if="!cell.blank"
          class="u-calendar__day"
          :class="{ 'u-calendar__day--selected': cell.selected, 'u-calendar__day--today': cell.today }"
          type="button"
          :disabled="props.readonly || cell.disabled"
          :aria-pressed="cell.selected"
          @click="selectDate(cell)"
        >
          {{ cell.day }}
        </button>
      </view>
    </view>
    <slot name="footer" />
  </view>
</template>

<script setup>
import { computed } from 'vue';
import { useULocale } from '../../config-locale.mjs';

// <lang><zh-CN>保持 u- 名称，并让日期选择完全由 caller 通过 v-model 和事件受控。</zh-CN><en>Retains the u- name and keeps date selection entirely caller-controlled through v-model and events.</en></lang>
defineOptions({ name: 'u-calendar' });

// <lang><zh-CN>所有日期 prop 只接受 YYYY-MM-DD；today 留空时才使用本地系统今天作呈现回退。</zh-CN><en>All date props accept YYYY-MM-DD only; the local system day is a presentation fallback only when today is empty.</en></lang>
const props = defineProps({
  modelValue: { type: String, default: '' },
  viewDate: { type: String, default: '' },
  minDate: { type: String, default: '' },
  maxDate: { type: String, default: '' },
  disabledDates: { type: Array, default: () => [] },
  readonly: { type: Boolean, default: false },
  today: { type: String, default: '' },
  weekLabels: { type: Array, default: () => [] }
});

// <lang><zh-CN>model/input/change/select 按固定顺序报告一次合法选择；视图月份仍是独立受控意图。</zh-CN><en>Model/input/change/select report one valid selection in a fixed order; the view month remains a separate controlled intent.</en></lang>
const emit = defineEmits(['update:modelValue', 'input', 'change', 'select', 'update:viewDate']);

// <lang><zh-CN>受限 locale 只用于星期和无障碍文字，不从系统或存储推导应用语言。</zh-CN><en>The constrained locale is used only for weekday and accessibility copy and never infers application language from the system or storage.</en></lang>
const locale = useULocale();
const defaultWeekLabels = Object.freeze({
  'zh-Hans': Object.freeze(['日', '一', '二', '三', '四', '五', '六']),
  en: Object.freeze(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
});
const calendarAriaLabel = computed(() => locale.value === 'en' ? 'Calendar' : '日历');
const previousMonthLabel = computed(() => locale.value === 'en' ? 'Previous month' : '上个月');
const nextMonthLabel = computed(() => locale.value === 'en' ? 'Next month' : '下个月');
const resolvedWeekLabels = computed(() => {
  // <lang><zh-CN>caller 只有提供七个字符串时才完整覆盖，无效部分集合不会混入 locale 集合。</zh-CN><en>The caller overrides only with exactly seven strings; an invalid partial set is never mixed with the locale set.</en></lang>
  return Array.isArray(props.weekLabels) && props.weekLabels.length === 7 && props.weekLabels.every((label) => typeof label === 'string')
    ? Object.freeze([...props.weekLabels])
    : defaultWeekLabels[locale.value];
});

/**
 * @lang zh-CN 返回指定 Gregorian 年月的天数，仅使用本地日历字段运算。
 * @lang en Returns the day count for a Gregorian year/month using local calendar-field arithmetic only.
 * @param {number} year <lang><zh-CN>完整年份。</zh-CN><en>Full year.</en></lang>
 * @param {number} month <lang><zh-CN>1-based 月份。</zh-CN><en>One-based month.</en></lang>
 * @returns {number} <lang><zh-CN>当月天数。</zh-CN><en>Number of days in the month.</en></lang>
 */
function daysInMonth(year, month) {
  // <lang><zh-CN>Date 只接收分离的本地字段，没有 ISO/UTC 字符串解析。</zh-CN><en>Date receives separated local fields only; no ISO/UTC string parsing occurs.</en></lang>
  return new Date(year, month, 0, 12).getDate();
}

/**
 * @lang zh-CN 严格解析 YYYY-MM-DD 为 Gregorian 字段记录，拒绝溢出日期和宽松文本。
 * @lang en Strictly parses YYYY-MM-DD into a Gregorian field record, rejecting overflow dates and loose text.
 * @param {unknown} value <lang><zh-CN>候选日期字符串。</zh-CN><en>Candidate date string.</en></lang>
 * @returns {{year:number,month:number,day:number,key:string,ordinal:number}|null} <lang><zh-CN>合法日期字段或 null。</zh-CN><en>Valid date fields or null.</en></lang>
 */
function parseDate(value) {
  // <lang><zh-CN>正则要求固定宽度和完整字符串，不接受时间或时区后缀。</zh-CN><en>The expression requires fixed width and the complete string and accepts no time or time-zone suffix.</en></lang>
  const matched = typeof value === 'string' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null;
  if (!matched) return null;

  // <lang><zh-CN>数值字段在年、月、日合法范围内才构成日期。</zh-CN><en>Numeric fields form a date only within valid year, month, and day ranges.</en></lang>
  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;

  // <lang><zh-CN>ordinal 只用于同格式 Gregorian 边界比较，不是时间戳。</zh-CN><en>Ordinal is used only to compare same-format Gregorian bounds and is not a timestamp.</en></lang>
  return Object.freeze({ year, month, day, key: value, ordinal: year * 10000 + month * 100 + day });
}

/**
 * @lang zh-CN 把 Gregorian 字段格式化为稳定 YYYY-MM-DD，不经过 toISOString。
 * @lang en Formats Gregorian fields as stable YYYY-MM-DD without passing through toISOString.
 * @param {number} year <lang><zh-CN>完整年份。</zh-CN><en>Full year.</en></lang>
 * @param {number} month <lang><zh-CN>1-based 月份。</zh-CN><en>One-based month.</en></lang>
 * @param {number} day <lang><zh-CN>月内日号。</zh-CN><en>Day of month.</en></lang>
 * @returns {string} <lang><zh-CN>严格日期字符串。</zh-CN><en>Strict date string.</en></lang>
 */
function formatDate(year, month, day) {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * @lang zh-CN 读取本地系统今天作空 today prop 的有限呈现回退。
 * @lang en Reads the local system day as the finite presentation fallback for an empty today prop.
 * @returns {{year:number,month:number,day:number,key:string,ordinal:number}} <lang><zh-CN>本地今天字段。</zh-CN><en>Local-today fields.</en></lang>
 */
function systemToday() {
  const now = new Date();
  return parseDate(formatDate(now.getFullYear(), now.getMonth() + 1, now.getDate()));
}

// <lang><zh-CN>显式 today 合法时优先；显式非空但无效时不标记任何今天。</zh-CN><en>A valid explicit today wins; a nonempty invalid explicit value marks no day as today.</en></lang>
const todayDate = computed(() => props.today === '' ? systemToday() : parseDate(props.today));
const selectedDate = computed(() => parseDate(props.modelValue));
const minimumDate = computed(() => parseDate(props.minDate));
const maximumDate = computed(() => parseDate(props.maxDate));

// <lang><zh-CN>非空无效边界或反向边界使选择全部失效，而不交换或猜测 caller 意图。</zh-CN><en>A nonempty invalid or reversed bound invalidates all selection rather than swapping or guessing caller intent.</en></lang>
const boundsValid = computed(() => {
  if ((props.minDate !== '' && !minimumDate.value) || (props.maxDate !== '' && !maximumDate.value)) return false;
  return !(minimumDate.value && maximumDate.value && minimumDate.value.ordinal > maximumDate.value.ordinal);
});

// <lang><zh-CN>无效 disabledDates 条目被忽略；它们不会扩展可选范围或毒化其他合法条目。</zh-CN><en>Invalid disabledDates entries are ignored; they neither widen selectable bounds nor poison other valid entries.</en></lang>
const disabledSet = computed(() => {
  // <lang><zh-CN>运行期非数组输入按空集合处理，避免一个类型误用中断整个日历呈现。</zh-CN><en>A runtime non-array input is treated as an empty set so one type misuse cannot interrupt the entire calendar presentation.</en></lang>
  const candidates = Array.isArray(props.disabledDates) ? props.disabledDates : [];
  return new Set(candidates.map((value) => parseDate(value)?.key).filter((value) => typeof value === 'string'));
});

// <lang><zh-CN>视图锚点依次使用合法 viewDate、modelValue、today 和本地今天，不修改任何 prop。</zh-CN><en>The view anchor uses a valid viewDate, modelValue, today, then local today in order without modifying any prop.</en></lang>
const anchorDate = computed(() => parseDate(props.viewDate) || selectedDate.value || todayDate.value || systemToday());
const monthLabel = computed(() => `${String(anchorDate.value.year).padStart(4, '0')}-${String(anchorDate.value.month).padStart(2, '0')}`);

/**
 * @lang zh-CN 判断日期是否被非法边界、范围或 caller disabledDates 禁用。
 * @lang en Determines whether a date is disabled by invalid bounds, range limits, or caller disabledDates.
 * @param {{ordinal:number,key:string}} date <lang><zh-CN>合法 Gregorian 记录。</zh-CN><en>Valid Gregorian record.</en></lang>
 * @returns {boolean} <lang><zh-CN>是否阻止选择。</zh-CN><en>Whether selection is prevented.</en></lang>
 */
function isDisabled(date) {
  if (!boundsValid.value) return true;
  if (minimumDate.value && date.ordinal < minimumDate.value.ordinal) return true;
  if (maximumDate.value && date.ordinal > maximumDate.value.ordinal) return true;
  return disabledSet.value.has(date.key);
}

// <lang><zh-CN>固定六周网格仅基于本地 Gregorian 字段与显式边界生成。</zh-CN><en>The fixed six-week grid is generated only from local Gregorian fields and explicit bounds.</en></lang>
const calendarCells = computed(() => {
  const anchor = anchorDate.value;
  const firstWeekday = new Date(anchor.year, anchor.month - 1, 1, 12).getDay();
  const monthDays = daysInMonth(anchor.year, anchor.month);
  const cells = [];

  // <lang><zh-CN>每个格子有稳定 key；月外格子不携带可交互日期。</zh-CN><en>Every cell has a stable key; out-of-month cells carry no interactive date.</en></lang>
  for (let index = 0; index < 42; index += 1) {
    const day = index - firstWeekday + 1;
    if (day < 1 || day > monthDays) {
      cells.push(Object.freeze({ key: `blank-${index}`, blank: true }));
      continue;
    }

    // <lang><zh-CN>格子日期先经严格 parser 建立，确保比较、事件和呈现使用同一字段记录。</zh-CN><en>The cell date is built through the strict parser so comparison, events, and presentation share one field record.</en></lang>
    const date = parseDate(formatDate(anchor.year, anchor.month, day));
    cells.push(Object.freeze({
      key: date.key,
      blank: false,
      date,
      day,
      disabled: isDisabled(date),
      selected: date.key === selectedDate.value?.key,
      today: date.key === todayDate.value?.key
    }));
  }
  return Object.freeze(cells);
});

/**
 * @lang zh-CN 报告相邻月份视图，不自动修改 caller viewDate 或选中值。
 * @lang en Reports an adjacent month view without automatically modifying caller viewDate or the selected value.
 * @param {number} offset <lang><zh-CN>只允许 -1 或 1 的月份偏移。</zh-CN><en>Month offset, limited to -1 or 1.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function changeMonth(offset) {
  // <lang><zh-CN>直接 handler 调用也必须是单月偏移，防止任意数字扩展视图协议。</zh-CN><en>Direct handler calls must also be a single-month offset so arbitrary numbers cannot widen the view protocol.</en></lang>
  if (offset !== -1 && offset !== 1) return;

  // <lang><zh-CN>用 0-based 中间月份完成显式年跨越，不解析日期字符串。</zh-CN><en>A zero-based intermediate month performs explicit year rollover without parsing a date string.</en></lang>
  const zeroBasedMonth = anchorDate.value.month - 1 + offset;
  const year = anchorDate.value.year + Math.floor(zeroBasedMonth / 12);
  const month = ((zeroBasedMonth % 12) + 12) % 12 + 1;
  if (year < 1 || year > 9999) return;
  emit('update:viewDate', formatDate(year, month, 1));
}

/**
 * @lang zh-CN 选择合法可用日期，依次报告 model、input、结构化 change 和旧 select 意图。
 * @lang en Selects a valid enabled date and reports model, input, structured change, and legacy select intents in order.
 * @param {unknown} cell <lang><zh-CN>日历网格候选记录。</zh-CN><en>Candidate calendar-grid record.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function selectDate(cell) {
  // <lang><zh-CN>readonly、空格、非法记录、反向边界和禁用日期均保持零事件。</zh-CN><en>Readonly, blank, malformed, reversed-bound, and disabled-date inputs all retain zero events.</en></lang>
  const date = cell && typeof cell === 'object' ? cell.date : null;
  if (props.readonly || !date || !parseDate(date.key) || isDisabled(date)) return;

  // <lang><zh-CN>change 只包含通用 Gregorian 字段，不添加农历、节日、可约或行业含义。</zh-CN><en>Change contains generic Gregorian fields only and adds no lunar, holiday, bookability, or industry meaning.</en></lang>
  const result = Object.freeze({ value: date.key, year: date.year, month: date.month, day: date.day });
  emit('update:modelValue', date.key);
  emit('input', date.key);
  emit('change', result);
  emit('select', date.key);
}
</script>

<style src="./u-calendar.css"></style>
