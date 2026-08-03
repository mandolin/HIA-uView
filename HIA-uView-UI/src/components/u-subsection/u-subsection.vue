<!--
@component USubsection
@lang zh-CN 呈现调用方提供的有限子区段选择和受控 model intent；不路由、不查询、不保存或同步领域筛选。
@lang en Presents caller-provided finite subsection selection and controlled model intent; it neither routes, queries, saves, nor synchronizes a domain filter.
-->
<template>
  <!-- @lang zh-CN 每个有 label 的 item 是局部 button；当前值与 disabled 均由 caller 明示。
  @lang en Each item with a label is a local button; current value and disabled state are explicitly caller-declared.
  <lang><zh-CN>组件不生成默认“全部”等业务分段文案，空 items 只保留空容器。</zh-CN><en>The component generates no default business segment copy such as “all”; empty items retain an empty container only.</en></lang> -->
  <view class="u-subsection" role="tablist" :aria-label="ariaLabel || undefined"><button v-for="item in safeItems" :key="item.key" :class="itemClasses(item)" type="button" :disabled="item.disabled" role="tab" :aria-selected="isActive(item)" @click="handleSelect(item)"><text>{{ item.label }}</text></button><slot /></view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称保留子区段迁移入口，但所有选择仍是 caller-owned model intent。</zh-CN><en>The stable name retains a subsection migration entry while every selection remains caller-owned model intent.</en></lang>
defineOptions({ name: 'u-subsection' });

// <lang><zh-CN>items、modelValue 和可访问名称全部来自 caller，组件不把段值解释为路由或查询条件。</zh-CN><en>Items, modelValue, and accessible name all come from the caller; the component interprets no segment value as a route or query condition.</en></lang>
const props = defineProps({ items: { type: Array, default: () => [] }, modelValue: { type: [String, Number], default: '' }, ariaLabel: { type: String, default: '' } });

// <lang><zh-CN>两种事件只报告有限下一值；caller 决定是否接受、保存或切换内容。</zh-CN><en>The two events report a finite next value only; the caller decides whether to accept, save, or switch content.</en></lang>
const emit = defineEmits(['update:modelValue', 'change']);

// <lang><zh-CN>对象/字符串项被复制为冻结投影，空 label 不创建不可发现 tab。</zh-CN><en>Object/string items are copied into frozen projections, and an empty label creates no undiscoverable tab.</en></lang>
const safeItems = computed(() => props.items.map((item, index) => {
  // <lang><zh-CN>source 容纳空输入且不修改 caller item。</zh-CN><en>Source accommodates nullish input and does not mutate caller items.</en></lang>
  const source = typeof item === 'string' ? { label: item, value: item } : (item || {});
  return Object.freeze({ key: `${String(source.value ?? source.label ?? index)}-${index}`, label: String(source.label ?? source.text ?? ''), value: source.value ?? source.label ?? index, disabled: Boolean(source.disabled) });
}).filter((item) => item.label.trim().length > 0));

/**
 * @lang zh-CN 判断有限 item 是否等于 caller 当前选择，不改变任何本地或外部状态。
 * @lang en Determines whether a finite item equals caller current selection and changes no local or external state.
 * @param {{value: string|number}} item <lang><zh-CN>规范化子区段项。</zh-CN><en>Normalized subsection item.</en></lang>
 * @returns {boolean} <lang><zh-CN>是否为当前项。</zh-CN><en>Whether it is current.</en></lang>
 */
function isActive(item) {
  return props.modelValue === item.value;
}

/**
 * @lang zh-CN 生成受限视觉 class，不让任意 caller value 成为 CSS 片段。
 * @lang en Generates constrained visual classes and does not let arbitrary caller values become CSS fragments.
 * @param {{disabled: boolean}} item <lang><zh-CN>规范化子区段项。</zh-CN><en>Normalized subsection item.</en></lang>
 * @returns {Array<string|Record<string, boolean>>} <lang><zh-CN>稳定 class 数组。</zh-CN><en>Stable class array.</en></lang>
 */
function itemClasses(item) {
  return ['u-subsection__item', { 'u-subsection__item--active': isActive(item), 'u-subsection__item--disabled': item.disabled }];
}

/**
 * @lang zh-CN 报告已启用且非当前项的下一受控值；不直接写回 modelValue。
 * @lang en Reports the next controlled value for an enabled non-current item; it writes no modelValue directly.
 * @param {{value: string|number, disabled: boolean}} item <lang><zh-CN>规范化子区段项。</zh-CN><en>Normalized subsection item.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；变化时 emit 两种 intent。</zh-CN><en>No return value; emits both intents on change.</en></lang>
 */
function handleSelect(item) {
  // <lang><zh-CN>重复选择与 disabled 都保持零事件，避免 UI 承担领域刷新语义。</zh-CN><en>Repeated selection and disabled state both remain event-free, avoiding UI ownership of domain refresh semantics.</en></lang>
  if (item.disabled || isActive(item)) return;
  emit('update:modelValue', item.value);
  emit('change', item.value);
}
</script>

<style src="./u-subsection.css"></style>
