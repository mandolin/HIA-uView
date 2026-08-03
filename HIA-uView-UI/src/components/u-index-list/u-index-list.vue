<!--
@component UIndexList
@lang zh-CN 呈现调用方提供的有限索引组与当前组选择意图；不根据滚动推断 active、不查找锚点，也不接管内容列表。
@lang en Presents caller-provided finite index groups and current-group selection intent; it infers no active state from scrolling, finds no anchor, and takes over no content list.
-->
<template>
  <!-- @lang zh-CN groups 只被规范化为局部 control；默认 slot 让 caller 保留锚点以外的内容树和数据呈现。
  @lang en Groups are normalized only as local controls; the default slot lets callers retain the content tree and data presentation beyond anchors.
  <lang><zh-CN>activeValue 是显式受控值，组件不会以元素测量或可见性来改写它。</zh-CN><en>activeValue is an explicit controlled value that the component never rewrites from element measurement or visibility.</en></lang> -->
  <view class="u-index-list" role="region" :aria-label="ariaLabel || undefined"><view class="u-index-list__anchors" role="list"><u-index-anchor v-for="group in safeGroups" :key="group.key" :label="group.label" :value="group.value" :active="isActive(group)" :disabled="group.disabled" role="listitem" @select="handleSelect(group)" /></view><view class="u-index-list__content"><slot :groups="safeGroups" :active-value="activeValue" /></view></view>
</template>

<script setup>
import { computed } from 'vue';
import UIndexAnchor from '../u-index-anchor/u-index-anchor.vue';

// <lang><zh-CN>稳定名称表示有限索引控制区，而非观察滚动位置的目录系统。</zh-CN><en>The stable name represents a finite index-control area, not a directory system that observes scroll position.</en></lang>
defineOptions({ name: 'u-index-list' });

// <lang><zh-CN>groups、activeValue 和可访问名称均由 caller 提供，且没有字母表、地区或数据源默认值。</zh-CN><en>Groups, activeValue, and accessible name are all caller-provided, with no alphabet, region, or data-source default.</en></lang>
const props = defineProps({ groups: { type: Array, default: () => [] }, activeValue: { type: [String, Number], default: '' }, ariaLabel: { type: String, default: '' } });

// <lang><zh-CN>select 只转发本地有限 group，不写回 activeValue 或触发程序化滚动。</zh-CN><en>Select forwards a local finite group only and neither writes activeValue nor triggers programmatic scrolling.</en></lang>
const emit = defineEmits(['select']);

// <lang><zh-CN>字符串和对象输入都转为冻结投影；无 label 项不成为不可发现 control。</zh-CN><en>String and object input both become frozen projections; a label-less item does not become an undiscoverable control.</en></lang>
const safeGroups = computed(() => props.groups.map((group, index) => {
  // <lang><zh-CN>source 吸收空值并避免修改 caller group。</zh-CN><en>Source absorbs nullish input and avoids mutating caller groups.</en></lang>
  const source = typeof group === 'string' ? { label: group, value: group } : (group || {});
  return Object.freeze({ key: `${String(source.value ?? source.label ?? index)}-${index}`, label: String(source.label ?? source.title ?? ''), value: source.value ?? source.label ?? index, disabled: Boolean(source.disabled) });
}).filter((group) => group.label.trim().length > 0));

/**
 * @lang zh-CN 判断一个规范化 group 是否由 caller 标记为当前；不读取浏览器或小程序滚动状态。
 * @lang en Determines whether a normalized group is caller-marked current; it reads no browser or mini-program scroll state.
 * @param {{value: string|number}} group <lang><zh-CN>规范化局部 group。</zh-CN><en>Normalized local group.</en></lang>
 * @returns {boolean} <lang><zh-CN>是否与 caller activeValue 相等。</zh-CN><en>Whether it equals caller activeValue.</en></lang>
 */
function isActive(group) {
  return props.activeValue === group.value;
}

/**
 * @lang zh-CN 转发已启用 group 的本地选择；调用方决定 scroll、数据或受控更新。
 * @lang en Forwards local selection of an enabled group; the caller decides scroll, data, or controlled update.
 * @param {{value: string|number, label: string, disabled: boolean}} group <lang><zh-CN>规范化局部 group。</zh-CN><en>Normalized local group.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；可用时 emit `select`。</zh-CN><en>No return value; emits `select` when enabled.</en></lang>
 */
function handleSelect(group) {
  // <lang><zh-CN>双重 guard 保证来自子项的直接/合成事件也不绕过 disabled 边界。</zh-CN><en>The double guard ensures direct or composed child events cannot bypass the disabled boundary.</en></lang>
  if (group.disabled) return;
  emit('select', { value: group.value, label: group.label });
}
</script>

<style src="./u-index-list.css"></style>
