<!--
@component UStep
@lang zh-CN 呈现调用方声明的单个步骤标题、描述、状态与可选选择意图；不协调父级流程或自动推进。
@lang en Presents one caller-declared step title, description, status, and optional selection intent; it neither coordinates a parent flow nor advances automatically.
-->
<template>
  <!-- @lang zh-CN step 可选地成为本地 button；status 只决定有限视觉处理，不结论真实流程是否完成。
  @lang en A step may optionally become a local button; status decides finite visual treatment only and does not conclude whether a real process completed.
  <lang><zh-CN>空 title 不生成无文字操作入口，description 仅在 caller 提供时可见。</zh-CN><en>An empty title generates no textless action entry, and description is visible only when supplied by the caller.</en></lang> -->
  <view :class="rootClasses" role="listitem"><button v-if="isInteractive" class="u-step__control" type="button" @click="handleSelect"><view class="u-step__indicator"><text>{{ displayIndex }}</text></view><view class="u-step__content"><text class="u-step__title">{{ title }}</text><text v-if="description" class="u-step__description">{{ description }}</text><slot /></view></button><view v-else class="u-step__static"><view class="u-step__indicator"><text>{{ displayIndex }}</text></view><view class="u-step__content"><text v-if="title" class="u-step__title">{{ title }}</text><text v-if="description" class="u-step__description">{{ description }}</text><slot /></view></view></view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称提供与现有 USteps 并存的单节点呈现；它不注入或读取 parent state。</zh-CN><en>The stable name provides single-node presentation alongside existing USteps; it injects and reads no parent state.</en></lang>
defineOptions({ name: 'u-step' });

// <lang><zh-CN>title、description、index 与 status 均由 caller 声明；interactive 只允许明确的局部选择，不拥有业务跳转。</zh-CN><en>Title, description, index, and status are caller-declared; interactive permits only explicit local selection and owns no business navigation.</en></lang>
const props = defineProps({ title: { type: String, default: '' }, description: { type: String, default: '' }, index: { type: Number, default: 0 }, status: { type: String, default: 'wait' }, interactive: { type: Boolean, default: false } });

// <lang><zh-CN>select 只返回 caller index/status，不把步骤改变为 process 或 finish。</zh-CN><en>Select returns caller index/status only and does not change a step into process or finish.</en></lang>
const emit = defineEmits(['select']);

// <lang><zh-CN>有限状态保护视觉 class；未知输入回退 wait 而不改写 props。</zh-CN><en>Finite statuses protect visual classes; unknown input falls back to wait without rewriting props.</en></lang>
const safeStatus = computed(() => ['wait', 'process', 'finish', 'error'].includes(props.status) ? props.status : 'wait');

// <lang><zh-CN>显示序号从一开始且不小于一，避免负数/小数 caller input 造成无意义指示器。</zh-CN><en>The display index starts at one and is never below one, preventing negative/fractional caller input from producing meaningless indicators.</en></lang>
const displayIndex = computed(() => Math.max(1, Math.trunc(Number(props.index) || 0) + 1));

// <lang><zh-CN>只有有可读 title 的 interactive 节点才生成 button，确保选择意图可发现。</zh-CN><en>Only an interactive node with readable title generates a button, ensuring selection intent is discoverable.</en></lang>
const isInteractive = computed(() => props.interactive && props.title.trim().length > 0);

// <lang><zh-CN>根 class 仅使用规范化 status，不把任意 caller string 插入 CSS 名称。</zh-CN><en>The root class uses normalized status only and inserts no arbitrary caller string into a CSS name.</en></lang>
const rootClasses = computed(() => ['u-step', `u-step--${safeStatus.value}`]);

/**
 * @lang zh-CN 报告可发现 step 的局部选择意图；不执行流程、路由或状态写回。
 * @lang en Reports local selection intent for a discoverable step; it executes no flow, route, or state writeback.
 * @returns {void} <lang><zh-CN>无返回值；满足 interactive guard 时 emit `select`。</zh-CN><en>No return value; emits `select` when the interactive guard passes.</en></lang>
 */
function handleSelect() {
  // <lang><zh-CN>直接调用在不可交互状态也保持零事件。</zh-CN><en>Direct invocation remains event-free when the node is not interactive.</en></lang>
  if (!isInteractive.value) return;
  emit('select', { index: Math.max(0, displayIndex.value - 1), status: safeStatus.value });
}
</script>

<style src="./u-step.css"></style>
