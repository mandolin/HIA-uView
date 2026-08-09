<!--
@component UIcon
@lang zh-CN 提供调用方文字符号或 slot 的中性图标占位；不加载字体、图片、图标 registry 或平台服务。
@lang en Provides a neutral icon placeholder from caller text or a slot; it loads no font, image, icon registry, or platform service.
-->
<template>
  <!--
  @lang zh-CN 图标根保留调用方文本/slot 呈现和本地 click 意图，不加载图标资源或解释图标为导航、状态或业务命令。
  @lang en The icon root retains caller text/slot presentation and local click intent without loading icon resources or interpreting an icon as navigation, state, or business command.
  -->
  <view :class="rootClasses" role="img" :aria-label="displayLabel || displaySymbol" @click="handleClick">
    <text class="u-icon__symbol"><slot>{{ displaySymbol }}</slot></text>
    <text v-if="hasLabel" class="u-icon__label">{{ displayLabel }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>保持熟悉的 u-icon 模板名，但将图标含义和可见符号完全交给调用方。</zh-CN><en>Retains the familiar u-icon template name while leaving icon meaning and visible symbol entirely to the caller.</en></lang>
defineOptions({ name: 'u-icon' });

// <lang><zh-CN>图标只接收调用方可见文字和有限展示状态；它不接收字体、图片、图标 registry、远程资源或业务参数。</zh-CN><en>The icon accepts only caller-visible text and finite presentation state; it accepts no font, image, icon registry, remote resource, or business parameter.</en></lang>
const props = defineProps({
  // <lang><zh-CN>name 只作为文字符号使用，不作为名称到字体或图标资源的 registry key。</zh-CN><en>name is used as visible text only and never as a registry key for a font or icon resource.</en></lang>
  name: { type: String, default: '' },
  // <lang><zh-CN>label 接受字符串或数字，保持迁移调用方的有限可见标签值；运行时只进行安全的字符串投影。</zh-CN><en>label accepts string or number to retain a bounded visible-label value for migration callers; runtime performs only safe string projection.</en></lang>
  label: { type: [String, Number], default: '' },
  size: { type: String, default: 'medium' },
  tone: { type: String, default: 'neutral' },
  disabled: { type: Boolean, default: false }
});

// <lang><zh-CN>唯一事件是可选的本地 click intent；组件不执行导航或业务动作。</zh-CN><en>The only event is optional local click intent; the component performs no navigation or business action.</en></lang>
const emit = defineEmits(['click']);

// <lang><zh-CN>未知尺寸和 tone 回退到有限 token 类，避免任意字符串成为 CSS 或脚本输入。</zh-CN><en>Unknown size and tone fall back to finite token classes so arbitrary strings cannot become CSS or script input.</en></lang>
const rootClasses = computed(() => {
  // <lang><zh-CN>未知尺寸稳定回退为 medium，避免任意字符串成为 CSS 类或布局指令。</zh-CN><en>An unknown size stably falls back to medium, preventing arbitrary strings from becoming CSS classes or layout instructions.</en></lang>
  const size = ['small', 'medium', 'large'].includes(props.size) ? props.size : 'medium';

  // <lang><zh-CN>未知 tone 稳定回退为 neutral，保持 token 受限且不引入原始色值。</zh-CN><en>An unknown tone stably falls back to neutral, keeping tokens bounded and introducing no raw color.</en></lang>
  const tone = ['neutral', 'primary', 'accent'].includes(props.tone) ? props.tone : 'neutral';
  return ['u-icon', `u-icon--${size}`, `u-icon--${tone}`, { 'u-icon--disabled': props.disabled }];
});

// <lang><zh-CN>无名称时使用中性圆点，slot 仍可完全替换该默认呈现。</zh-CN><en>Uses a neutral dot when no name is supplied; the slot can still fully replace this default presentation.</en></lang>
const displaySymbol = computed(() => (props.name.length > 0 ? props.name : '•'));

// <lang><zh-CN>标签投影显式转为文字，以便数字 `0` 也能成为可见标签，并且不把任意值传给模板结构。</zh-CN><en>Label projection explicitly converts to text so numeric `0` can also become visible label and no arbitrary value reaches template structure.</en></lang>
const displayLabel = computed(() => String(props.label));

// <lang><zh-CN>空字符串是唯一“无标签”哨兵；数字零保持为存在的调用方可见标签。</zh-CN><en>The empty string is the only “no label” sentinel; numeric zero remains a present caller-visible label.</en></lang>
const hasLabel = computed(() => props.label !== '');

/**
 * @lang zh-CN 处理本地 click intent；禁用状态保持零事件。
 * @lang en Handles local click intent; disabled state retains zero events.
 * @param {unknown} event <lang><zh-CN>本地点击事件。</zh-CN><en>Local click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleClick(event) {
  // <lang><zh-CN>guard 防止直接 handler 调用绕过 disabled 视觉状态。</zh-CN><en>The guard prevents direct handler calls from bypassing disabled presentation.</en></lang>
  if (props.disabled) {
    return;
  }

  // <lang><zh-CN>启用状态原样回传本地事件，组件不决定图标点击后的导航、状态更新或业务结果。</zh-CN><en>The enabled state forwards the local event unchanged; the component decides no navigation, state update, or business outcome after an icon click.</en></lang>
  emit('click', event);
}
</script>

<style src="./u-icon.css"></style>
