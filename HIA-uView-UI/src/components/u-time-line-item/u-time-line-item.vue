<!--
@component UTimeLineItem
@lang zh-CN 呈现调用方声明的单条时间线标题、时间、描述、有限状态与可选选择意图；不解析时间、不排序或自动推进。
@lang en Presents one caller-declared timeline title, time, description, finite status, and optional selection intent; it does not parse time, sort, or advance automatically.
-->
<template>
  <!-- @lang zh-CN 节点与线提供非颜色结构，所有可读字段仍由 caller 提供；interactive 仅产生可发现的本地选择。
  @lang en Node and line provide non-color structure while all readable fields remain caller-provided; interactive produces only discoverable local selection.
  <lang><zh-CN>末项处理由 caller 的 isLast 明示，组件不检查或测量相邻 slot 项。</zh-CN><en>Last-item treatment is explicitly declared by caller isLast; the component does not inspect or measure adjacent slot items.</en></lang> -->
  <view :class="rootClasses" role="listitem"><button v-if="isInteractive" class="u-time-line-item__control" type="button" @click="handleSelect"><view class="u-time-line-item__rail"><view class="u-time-line-item__node" /><view v-if="!isLast" class="u-time-line-item__line" /></view><view class="u-time-line-item__content"><text v-if="time" class="u-time-line-item__time">{{ time }}</text><text class="u-time-line-item__title">{{ title }}</text><text v-if="description" class="u-time-line-item__description">{{ description }}</text><slot /></view></button><view v-else class="u-time-line-item__static"><view class="u-time-line-item__rail"><view class="u-time-line-item__node" /><view v-if="!isLast" class="u-time-line-item__line" /></view><view class="u-time-line-item__content"><text v-if="time" class="u-time-line-item__time">{{ time }}</text><text v-if="title" class="u-time-line-item__title">{{ title }}</text><text v-if="description" class="u-time-line-item__description">{{ description }}</text><slot /></view></view></view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称服务单条 slot-composed timeline item；它不依赖 parent injection。</zh-CN><en>The stable name serves one slot-composed timeline item and depends on no parent injection.</en></lang>
defineOptions({ name: 'u-time-line-item' });

// <lang><zh-CN>可读字段、状态、末项与选择能力全部来自 caller；组件不持有 event source 或日期格式规则。</zh-CN><en>Readable fields, status, last-item state, and selection capability all come from the caller; the component holds no event source or date-format rule.</en></lang>
const props = defineProps({ title: { type: String, default: '' }, time: { type: String, default: '' }, description: { type: String, default: '' }, status: { type: String, default: 'neutral' }, isLast: { type: Boolean, default: false }, interactive: { type: Boolean, default: false }, value: { type: [String, Number], default: '' } });

// <lang><zh-CN>select 只报告 caller value 和有限视觉状态，不写回项目或重排时间线。</zh-CN><en>Select reports caller value and finite visual status only and writes back neither an item nor timeline ordering.</en></lang>
const emit = defineEmits(['select']);

// <lang><zh-CN>状态列表限定 node 的视觉 class；未知值回退 neutral，不成为任意 CSS 片段。</zh-CN><en>The status list constrains the node visual class; an unknown value falls back to neutral and becomes no arbitrary CSS fragment.</en></lang>
const safeStatus = computed(() => ['neutral', 'primary', 'accent', 'error'].includes(props.status) ? props.status : 'neutral');

// <lang><zh-CN>可交互项目必须有可读标题，避免空标签 button 破坏可发现性。</zh-CN><en>An interactive item must have readable title, avoiding an empty-label button that harms discoverability.</en></lang>
const isInteractive = computed(() => props.interactive && props.title.trim().length > 0);

// <lang><zh-CN>根 class 仅携带稳定命名空间与规范化状态。</zh-CN><en>The root class carries only the stable namespace and normalized status.</en></lang>
const rootClasses = computed(() => ['u-time-line-item', `u-time-line-item--${safeStatus.value}`]);

/**
 * @lang zh-CN 报告 timeline 项选择意图；不导航、不转换时间或触发领域工作流。
 * @lang en Reports timeline-item selection intent; it does not navigate, transform time, or trigger a domain workflow.
 * @returns {void} <lang><zh-CN>无返回值；可交互时 emit `select`。</zh-CN><en>No return value; emits `select` when interactive.</en></lang>
 */
function handleSelect() {
  // <lang><zh-CN>guard 确保静态/无标题项的直接调用保持无事件。</zh-CN><en>The guard ensures direct calls on static or title-less items remain event-free.</en></lang>
  if (!isInteractive.value) return;
  emit('select', { value: props.value, status: safeStatus.value });
}
</script>

<style src="./u-time-line-item.css"></style>
