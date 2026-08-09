<!--
@component UTabs
@lang zh-CN 提供调用方声明的有限 tab 列表、受控 value 和迁移 current 选择；不导航、不请求、不懒加载、不使用滚动动画。
@lang en Provides a caller-declared finite tab list, controlled value, and migration current selection; it does not navigate, request, lazy-load, or animate scrolling.
-->
<template>
  <view class="u-tabs" role="tablist">
    <button
      v-for="item in safeItems"
      :key="item.key"
      class="u-tabs__item"
      :class="{ 'u-tabs__item--active': isActive(item), 'u-tabs__item--disabled': item.disabled }"
      type="button"
      :disabled="item.disabled"
      role="tab"
      :aria-selected="isActive(item)"
      @click="handleSelect(item)"
    >{{ item.label }}</button>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>tabs 只消费声明式 items/list、受控 modelValue 与迁移 current，不管理隐藏内容或路由。</zh-CN><en>Tabs consumes declarative items/list, controlled modelValue, and migration current only and manages neither hidden content nor routing.</en></lang>
defineOptions({ name: 'u-tabs' });

// <lang><zh-CN>所有 tab 数据和选择值均由调用方声明；组件不请求列表、缓存面板、读取 scroll 或解释行业状态。</zh-CN><en>All tab data and selection values are caller-declared; the component requests no list, caches no panel, reads no scroll, and interprets no industry state.</en></lang>
const props = defineProps({
  // <lang><zh-CN>HIA `modelValue` 是首选受控 value；当迁移 current 未提供时决定活动 tab。</zh-CN><en>HIA `modelValue` is the preferred controlled value and decides the active tab when migration current is absent.</en></lang>
  modelValue: { type: [String, Number], default: '' },
  // <lang><zh-CN>HIA `items` 是首选有限列表；非空时优先于迁移 list，避免改变已有调用方内容来源。</zh-CN><en>HIA `items` is the preferred finite list; when nonempty it takes precedence over migration list, avoiding a change to existing caller content source.</en></lang>
  items: { type: Array, default: () => [] },
  // <lang><zh-CN>迁移 `list` 仅在 HIA items 为空时作为列表来源；其成员仍被规范化为有限本地展示项。</zh-CN><en>Migration `list` becomes the list source only when HIA items is empty; its members are still normalized into finite local presentation items.</en></lang>
  list: { type: Array, default: () => [] },
  // <lang><zh-CN>迁移 `current` 接受索引或标识值；未提供时保持 undefined，从而不会覆盖既有 modelValue。</zh-CN><en>Migration `current` accepts an index or identifying value; when absent it remains undefined and therefore cannot override existing modelValue.</en></lang>
  current: { type: [Number, String], default: undefined }
});

// <lang><zh-CN>两个事件只把候选 value 交还调用方；组件不自行写 prop、切换路由或管理面板生命周期。</zh-CN><en>The two events return only a candidate value to the caller; the component writes no prop itself, changes no route, and manages no panel lifecycle.</en></lang>
const emit = defineEmits(['update:modelValue', 'change']);

// <lang><zh-CN>优先的非空 HIA items 保持既有 contract；空 items 才使用迁移 list，二者都不触发数据读取。</zh-CN><en>Preferred nonempty HIA items retain the existing contract; only empty items uses migration list, and neither triggers a data read.</en></lang>
const sourceItems = computed(() => (props.items.length > 0 ? props.items : props.list));

// <lang><zh-CN>每个调用方条目被归一为稳定 key、可见 label、受控 value 与 disabled 标记；未知成员不执行或注入模板。</zh-CN><en>Each caller item is normalized into a stable key, visible label, bounded value, and disabled marker; unknown members execute nothing and inject no template.</en></lang>
const safeItems = computed(() => sourceItems.value.map((item, index) => {
  // <lang><zh-CN>字符串条目按自身形成 label/value；其他非空对象仅读取有限公开字段。</zh-CN><en>A string item forms its own label/value; another nonempty object reads only finite public fields.</en></lang>
  const source = typeof item === 'string' ? { label: item, value: item } : (item || {});

  // <lang><zh-CN>归一结果为模板提供确定性 key 与展示字段，不保留未知对象属性或业务上下文。</zh-CN><en>The normalized result gives the template deterministic key and display fields and retains no unknown object property or business context.</en></lang>
  return {
    key: `${String(source.value ?? source.label ?? index)}-${index}`,
    label: String(source.label ?? source.text ?? source.name ?? ''),
    value: source.value ?? source.label ?? index,
    disabled: Boolean(source.disabled)
  };
}).filter((item) => item.label.length > 0));

// <lang><zh-CN>current 是否由调用方显式传入决定迁移选择是否生效；undefined 是唯一不覆盖 modelValue 的状态。</zh-CN><en>Whether current was explicitly supplied by the caller decides whether migration selection applies; undefined is the sole state that does not override modelValue.</en></lang>
const hasMigrationCurrent = computed(() => props.current !== undefined);

/**
 * @lang zh-CN 将迁移 current 解释为当前有限列表的索引（存在时）或原始标识值；不猜测路由、面板或异步内容。
 * @lang en Interprets migration current as an index of the current finite list when present, or as its original identifying value; it guesses no route, panel, or asynchronous content.
 * @returns {string|number} <lang><zh-CN>用于活动项比较的受控 value。</zh-CN><en>Bounded value used for active-item comparison.</en></lang>
 */
function resolveMigrationCurrent() {
  // <lang><zh-CN>当前候选只来自声明 prop；函数不读取 DOM、历史记录或全局状态。</zh-CN><en>The current candidate comes only from the declared prop; the function reads no DOM, history, or global state.</en></lang>
  const candidate = props.current;

  // <lang><zh-CN>有效整数索引映射到当前归一列表对应 value，使典型上游 current=0 可选择首项。</zh-CN><en>A valid integer index maps to the corresponding value in the current normalized list, allowing a typical upstream current=0 to select the first item.</en></lang>
  if (Number.isInteger(candidate) && candidate >= 0 && candidate < safeItems.value.length) {
    return safeItems.value[candidate].value;
  }

  // <lang><zh-CN>非索引 current 保持原值，以支持调用方以有限字符串或数字标识已归一的 tab。</zh-CN><en>A non-index current retains its original value, allowing the caller to identify a normalized tab with a finite string or number.</en></lang>
  return candidate;
}

// <lang><zh-CN>活动 value 优先使用显式迁移 current；缺失时完整保留 HIA modelValue 行为。</zh-CN><en>The active value prefers explicit migration current; when absent it fully retains HIA modelValue behavior.</en></lang>
const selectedValue = computed(() => (hasMigrationCurrent.value ? resolveMigrationCurrent() : props.modelValue));

/**
 * @lang zh-CN 判断一个归一 tab 是否为当前活动项；判断只比较受控 value，不产生副作用。
 * @lang en Determines whether one normalized tab is currently active; the check compares controlled value only and produces no side effect.
 * @param {{value:string|number}} item <lang><zh-CN>已归一的有限 tab 项。</zh-CN><en>Normalized finite tab item.</en></lang>
 * @returns {boolean} <lang><zh-CN>是否为当前活动项。</zh-CN><en>Whether the item is currently active.</en></lang>
 */
function isActive(item) {
  // <lang><zh-CN>严格相等保留调用方 value 类型，避免字符串/数字静默互转改变选择状态。</zh-CN><en>Strict equality retains caller value type and avoids silently converting string/number selection state.</en></lang>
  return selectedValue.value === item.value;
}

/**
 * @lang zh-CN 报告 tab value/change intent；调用方决定内容、请求和后续视图。
 * @lang en Reports tab value/change intent; the caller decides content, requests, and follow-up view.
 * @param {{ value: string|number, disabled: boolean }} item <lang><zh-CN>规范化 tab。</zh-CN><en>Normalized tab.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleSelect(item) {
  // <lang><zh-CN>禁用或已活动项保持零事件，防止无意义的重复写回或将 disabled 外观绕过为业务动作。</zh-CN><en>A disabled or already-active item retains zero events, preventing meaningless repeat write-back or bypassing disabled presentation into a business action.</en></lang>
  if (item.disabled || isActive(item)) return;

  // <lang><zh-CN>仅报告候选 value；调用方决定是否写回 modelValue/current、显示内容或开始任何请求。</zh-CN><en>Reports only a candidate value; the caller decides whether to write modelValue/current, display content, or begin any request.</en></lang>
  emit('update:modelValue', item.value);
  emit('change', item.value);
}
</script>

<style src="./u-tabs.css"></style>
