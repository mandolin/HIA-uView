<!--
@component UCollapse
@lang zh-CN 提供受控展开值与局部子项 context；不执行动画、计时、请求、持久化或业务状态机。
@lang en Provides controlled open values and local child-item context; it performs no animation, timer, request, persistence, or business state machine.
-->
<template>
  <view class="u-collapse" role="list">
    <slot />
  </view>
</template>

<script setup>
import { computed, provide } from 'vue';
import { COLLAPSE_CONTEXT } from '../collapse-context.mjs';

// <lang><zh-CN>声明稳定名称，使父子折叠组件和 manifest 使用同一 runtime key。</zh-CN><en>Declares a stable name so the collapse pair and manifest use the same runtime key.</en></lang>
defineOptions({ name: 'u-collapse' });

const props = defineProps({
  modelValue: { type: [Array, String, Number], default: () => [] },
  accordion: { type: Boolean, default: false }
});

// <lang><zh-CN>父组件只报告新的 open value；调用方决定是否写回 modelValue。</zh-CN><en>The parent reports the new open value only; the caller decides whether to write modelValue back.</en></lang>
const emit = defineEmits(['update:modelValue', 'change']);

const openValues = computed(() => {
  if (Array.isArray(props.modelValue)) return props.modelValue;
  if (props.modelValue === '' || props.modelValue === null || props.modelValue === undefined) return [];
  return [props.modelValue];
});

function sameValue(left, right) {
  return String(left) === String(right);
}

function isOpen(name) {
  return openValues.value.some((value) => sameValue(value, name));
}

/**
 * @lang zh-CN 按 accordion 规则计算下一组展开值并报告给调用方；不改变 props 或启动动画。
 * @lang en Computes the next open values under accordion rules and reports them to the caller; it does not mutate props or start animation.
 * @param {string|number} name <lang><zh-CN>子项的调用方本地名称。</zh-CN><en>Caller-local name of the child item.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function toggle(name) {
  const current = openValues.value.filter((value, index, values) => values.findIndex((candidate) => sameValue(candidate, value)) === index);
  const exists = current.some((value) => sameValue(value, name));
  const next = props.accordion
    ? (exists ? [] : [name])
    : (exists ? current.filter((value) => !sameValue(value, name)) : [...current, name]);
  const output = props.accordion ? (next[0] ?? '') : next;
  emit('update:modelValue', output);
  emit('change', output);
}

// <lang><zh-CN>context 只暴露只读 ref、比较函数和受限 toggle；它不构成跨页面 registry。</zh-CN><en>The context exposes only a read-only ref, comparison function, and constrained toggle; it is not a cross-page registry.</en></lang>
provide(COLLAPSE_CONTEXT, Object.freeze({
  accordion: computed(() => props.accordion),
  isOpen,
  toggle
}));
</script>

<style src="./u-collapse.css"></style>
