<!--
@component UCellItem
@lang zh-CN 提供 uView-family `u-cell-item` 的受控信息行：调用方拥有标题、说明、值、可点击性和导航含义；组件只呈现有限箭头并 emit local click intent。
@lang en Provides a controlled uView-family `u-cell-item` information row: the caller owns title, description, value, clickability, and navigation meaning; the component presents a finite arrow and emits local click intent only.
-->
<template>
  <!-- @lang zh-CN 受控模板呈现说明如下。
  @lang en Controlled template-presentation explanation follows.
  <lang><zh-CN>根行始终呈现 caller text；可点击性只决定原生 button 语义，不创建导航目标。</zh-CN><en>The root row always presents caller text; clickability decides native button semantics only and creates no navigation destination.</en></lang> -->
  <button :class="cellClasses" type="button" :disabled="disabled || !clickable" @click="emitClick">
    <view class="u-cell-item__content">
      <!-- @lang zh-CN 必填标记是调用方声明的可见提示；它不执行校验、提交或表单注册。
      @lang en The required marker is caller-declared visible guidance; it performs no validation, submission, or form registration. -->
      <text v-if="required" class="u-cell-item__required" aria-hidden="true">*</text>
      <text class="u-cell-item__title">{{ title }}</text>
      <text v-if="hasLabel" class="u-cell-item__label">{{ displayLabel }}</text>
    </view>
    <view class="u-cell-item__trailing">
      <text v-if="hasValue" class="u-cell-item__value">{{ displayValue }}</text>
      <!-- @lang zh-CN 默认 slot 只在 value 为空时提供调用方的尾部展示；组件不解释其中内容、注册点击或创建导航。
      @lang en The default slot provides caller trailing presentation only while value is empty; the component interprets no content, registers no click, and creates no navigation. -->
      <view v-else class="u-cell-item__value"><slot /></view>
      <text v-if="arrow" class="u-cell-item__arrow" aria-hidden="true">›</text>
    </view>
  </button>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称与新 migration surface 对齐；它不覆盖现有 `u-cell` 的较小契约。</zh-CN><en>The stable name aligns with the new migration surface; it does not override the smaller existing `u-cell` contract.</en></lang>
defineOptions({ name: 'u-cell-item' });

// <lang><zh-CN>调用方拥有所有文字和有限展示/交互开关；组件不接收 URL、route、data source、校验规则或业务对象。</zh-CN><en>The caller owns all text and finite presentation/interaction switches; the component accepts no URL, route, data source, validation rule, or business object.</en></lang>
const props = defineProps({
  // <lang><zh-CN>标题是调用方主要文字；空值不会由组件替换为业务默认文案。</zh-CN><en>Title is caller primary copy; an empty value is never replaced by component business-default copy.</en></lang>
  title: { type: String, default: '' },
  // <lang><zh-CN>label 接受字符串或数字，保留迁移调用方的有限次级文字；内部只安全投影为可见文字。</zh-CN><en>Label accepts string or number to retain bounded secondary copy for migration callers; internally it is only safely projected as visible text.</en></lang>
  label: { type: [String, Number], default: '' },
  // <lang><zh-CN>value 接受字符串或数字；空字符串时默认 slot 可提供调用方尾部展示。</zh-CN><en>Value accepts string or number; when it is an empty string, the default slot may provide caller trailing presentation.</en></lang>
  value: { type: [String, Number], default: '' },
  // <lang><zh-CN>required 仅显示星号提示，不把该信息升级为表单 validation、提交或错误状态。</zh-CN><en>Required only displays an asterisk cue and never upgrades the information into form validation, submission, or error state.</en></lang>
  required: { type: Boolean, default: false },
  // <lang><zh-CN>arrow 只选择有限的尾部箭头提示，不产生 route 或返回语义。</zh-CN><en>Arrow selects only a finite trailing-arrow cue and produces no route or back meaning.</en></lang>
  arrow: { type: Boolean, default: false },
  // <lang><zh-CN>clickable 决定本地原生 control 是否可激活；它不为行分配业务命令。</zh-CN><en>Clickable decides whether the local native control is activatable; it assigns no business command to the row.</en></lang>
  clickable: { type: Boolean, default: false },
  // <lang><zh-CN>disabled 同时驱动原生 disabled 与 handler guard，确保直接调用也保持零事件。</zh-CN><en>Disabled drives both native disabled and handler guard, ensuring direct invocation also retains zero events.</en></lang>
  disabled: { type: Boolean, default: false }
});

// <lang><zh-CN>click 是唯一公开意图；调用方决定点击是否映射为导航、展开或其他业务操作。</zh-CN><en>Click is the sole public intent; the caller decides whether it maps to navigation, expansion, or another business operation.</en></lang>
const emit = defineEmits(['click']);

// <lang><zh-CN>有限 class 只表达 caller 已声明的 clickable/disabled 外观，不拼接任意输入。</zh-CN><en>Finite classes express caller-declared clickable/disabled appearance only and concatenate no arbitrary input.</en></lang>
const cellClasses = computed(() => ['u-cell-item', { 'u-cell-item--clickable': props.clickable, 'u-cell-item--disabled': props.disabled }]);

// <lang><zh-CN>空字符串是唯一无 label 标记，数字零保持为可见调用方次级文字。</zh-CN><en>The empty string is the sole no-label marker; numeric zero remains visible caller secondary copy.</en></lang>
const hasLabel = computed(() => props.label !== '');

// <lang><zh-CN>将受控 label 投影为文字，不执行数字格式化、locale 转换或内容解释。</zh-CN><en>Projects the bounded label as text and performs no numeric formatting, locale conversion, or content interpretation.</en></lang>
const displayLabel = computed(() => String(props.label));

// <lang><zh-CN>空字符串是唯一无 value 标记，数字零仍能占据尾部展示。</zh-CN><en>The empty string is the sole no-value marker; numeric zero can still occupy trailing presentation.</en></lang>
const hasValue = computed(() => props.value !== '');

// <lang><zh-CN>将受控 value 投影为文字，组件不把它作为页码、金额、状态码或其他业务字段处理。</zh-CN><en>Projects the bounded value as text; the component treats it as neither page number, money, status code, nor another business field.</en></lang>
const displayValue = computed(() => String(props.value));

/**
 * @lang zh-CN 报告可点击信息行的本地点击；不执行页面跳转、值写回或列表 mutation。
 * @lang en Reports a local click on a clickable information row; it performs no page navigation, value writeback, or list mutation.
 * @param {unknown} event <lang><zh-CN>平台提供的原始点击事件。</zh-CN><en>Original click event supplied by the platform.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `click`。</zh-CN><en>No return value; emits `click` when the guard passes.</en></lang>
 */
function emitClick(event) {
  // <lang><zh-CN>仅显式 clickable 且非 disabled 的行能产生意图；原生 disabled 之外的 guard 保护直接 handler 调用。</zh-CN><en>Only explicitly clickable and non-disabled rows can produce intent; the guard protects direct handler calls beyond native disabled behavior.</en></lang>
  if (!props.clickable || props.disabled) return;

  // <lang><zh-CN>保留原始事件给页面，不赋予 arrow 或 value 任何导航语义。</zh-CN><en>Preserve the original event for the page and assign no navigation meaning to arrow or value.</en></lang>
  emit('click', event);
}
</script>

<style src="./u-cell-item.css"></style>
