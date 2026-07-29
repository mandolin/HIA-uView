<!--
@component UCheckboxGroup
@lang zh-CN 向 slot 内 UCheckbox 提供调用方受控字符串成员集合；它创建下一数组并 emit，不 mutate 输入、持久化或解释业务意义。
@lang en Provides caller-controlled string membership collection to slot-contained UCheckbox; it creates next arrays and emits them without mutating input, persisting, or interpreting business meaning.
-->
<template>
  <!--
  @lang zh-CN group 根只排列调用方 slot，不发现外部子项或建立全局 registry。
  @lang en The group root arranges caller slot only and discovers neither external children nor a global registry.
  <lang><zh-CN>context 仅在当前子树中传播，调用方保持 option 结构、顺序和数据来源的所有权。</zh-CN><en>Context propagates only in the current subtree, while the caller retains ownership of option structure, ordering, and data source.</en></lang>
  -->
  <view class="u-checkbox-group">
    <slot />
  </view>
</template>

<script setup>
import { computed, provide } from 'vue';
import { CHECKBOX_GROUP_CONTEXT } from '../selection-context.mjs';

// <lang><zh-CN>声明稳定 runtime 名称，使 template、manifest 与 explicit registry 使用同一键。</zh-CN><en>Declares the stable runtime name so template, manifest, and explicit registry use the same key.</en></lang>
defineOptions({
  name: 'u-checkbox-group'
});

// <lang><zh-CN>group 仅接收调用方数组与 disabled；默认空数组不生成默认选择，也不接受 option 数据、规则或业务对象。</zh-CN><en>The group accepts only caller array and disabled; the default empty array generates no default selection and accepts no option data, rule, or business object.</en></lang>
const props = defineProps({
  // <lang><zh-CN>modelValue 是调用方拥有的字符串成员集合；下一状态始终由本组件新建数组后交还调用方决定是否写回。</zh-CN><en>ModelValue is the caller-owned string membership collection; next state is always a new array handed back for the caller to decide whether to write it.</en></lang>
  modelValue: {
    type: Array,
    default: () => []
  },
  // <lang><zh-CN>disabled 由 group 集中投影给子项，避免 child 自行猜测集合可用性。</zh-CN><en>Disabled is projected centrally by the group to children, preventing children from guessing collection availability.</en></lang>
  disabled: {
    type: Boolean,
    default: false
  }
});

// <lang><zh-CN>两个事件携带同一不可变下一数组；调用方决定是否写回 modelValue 或执行任何业务动作。</zh-CN><en>The two events carry the same immutable next array; the caller decides whether to write modelValue back or perform any business action.</en></lang>
const emit = defineEmits(['update:modelValue', 'change']);

// <lang><zh-CN>把调用方数组投影成只读 computed，子项不会得到可写 prop 引用。</zh-CN><en>Projects the caller array as read-only computed so children never receive a writable prop reference.</en></lang>
const selectedValues = computed(() => props.modelValue);

// <lang><zh-CN>同样把 disabled 投影为只读值，供 child 原生属性和 guard 一致使用。</zh-CN><en>Likewise projects disabled as read-only for consistent child native attributes and guards.</en></lang>
const isGroupDisabled = computed(() => props.disabled);

/**
 * @lang zh-CN 根据子项 value 与下一 checked 构造去重的新数组；不修改调用方 prop，也不解释 value 的业务含义。
 * @lang en Builds a deduplicated new array from child value and next checked; it does not mutate caller prop or interpret the business meaning of value.
 * @param {string} value <lang><zh-CN>子项调用方提供的本地键。</zh-CN><en>Caller-provided local key from the child.</en></lang>
 * @param {boolean} checked <lang><zh-CN>下一呈现成员状态。</zh-CN><en>Next presentation membership state.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit 两个下一数组意图。</zh-CN><en>No return value; emits two next-array intents when guard passes.</en></lang>
 */
function changeValue(value, checked) {
  // <lang><zh-CN>禁用 group 保持零事件，任何 child 都不能通过直接调用绕过集合可用性边界。</zh-CN><en>A disabled group retains zero events, and no child can bypass collection availability through direct calls.</en></lang>
  if (isGroupDisabled.value) {
    return;
  }

  // <lang><zh-CN>先移除所有精确重复项以建立唯一成员基线，不 mutate 原数组。</zh-CN><en>First remove every exact duplicate to establish a unique membership baseline without mutating the original array.</en></lang>
  const withoutValue = selectedValues.value.filter((selectedValue) => selectedValue !== value);

  // <lang><zh-CN>checked 时仅在末尾追加一次 value；未选中时直接采用排除后的新数组。</zh-CN><en>When checked, append value exactly once; when unchecked, use the excluded new array directly.</en></lang>
  const nextValues = checked ? [...withoutValue, value] : withoutValue;

  // <lang><zh-CN>以同一不可变数组先报告 v-model、再报告一般 change；两者都不代表提交、持久化或业务完成。</zh-CN><en>Reports v-model first and general change second with the same immutable array; neither represents submit, persistence, or business completion.</en></lang>
  emit('update:modelValue', nextValues);
  emit('change', nextValues);
}

// <lang><zh-CN>私有 context 只暴露只读集合/disabled 与受限数组转换函数；冻结外层对象，避免 child 替换成员。</zh-CN><en>The private context exposes only read-only collection/disabled and constrained array-transform function; freeze the outer object so children cannot replace members.</en></lang>
provide(CHECKBOX_GROUP_CONTEXT, Object.freeze({
  selectedValues,
  isGroupDisabled,
  changeValue
}));
</script>

<style src="./u-checkbox-group.css"></style>
