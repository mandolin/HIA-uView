<!--
@component UCollapseItem
@lang zh-CN 呈现一个受控标题、描述和 slot 内容；在 u-collapse 内报告本地 toggle intent，独立使用时读取 open prop。
@lang en Presents controlled title, description, and slot content; inside u-collapse it reports local toggle intent and otherwise reads the open prop.
-->
<template>
  <view class="u-collapse-item" role="listitem">
    <button
      class="u-collapse-item__header"
      :aria-expanded="isOpen"
      :disabled="disabled"
      type="button"
      @click="handleToggle"
    >
      <view class="u-collapse-item__heading">
        <text class="u-collapse-item__title">{{ title }}</text>
        <text v-if="description" class="u-collapse-item__description">{{ description }}</text>
      </view>
      <text class="u-collapse-item__indicator" aria-hidden="true">{{ isOpen ? '−' : '+' }}</text>
    </button>
    <view v-if="isOpen" class="u-collapse-item__content">
      <slot />
    </view>
  </view>
</template>

<script setup>
import { computed, inject } from 'vue';
import { COLLAPSE_CONTEXT } from '../collapse-context.mjs';

// <lang><zh-CN>声明稳定名称；子项不自动发现父组件之外的同名项。</zh-CN><en>Declares a stable name; the child never discovers same-named items outside its parent context.</en></lang>
defineOptions({ name: 'u-collapse-item' });

const props = defineProps({
  name: { type: [String, Number], default: '' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  open: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['update:open', 'toggle']);
const context = inject(COLLAPSE_CONTEXT, null);
const isOpen = computed(() => context ? context.isOpen(props.name) : props.open);

/**
 * @lang zh-CN 把当前标题点击转换为父级 context 或独立 open 的写回意图，不改变 props。
 * @lang en Converts the current header click into a parent-context or standalone-open write-back intent without mutating props.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleToggle() {
  if (props.disabled) return;
  if (context) {
    context.toggle(props.name);
  } else {
    emit('update:open', !isOpen.value);
  }
  emit('toggle', { name: props.name, open: !isOpen.value });
}
</script>

<style src="./u-collapse-item.css"></style>
