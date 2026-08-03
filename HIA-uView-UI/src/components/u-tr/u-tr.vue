<!--
@component UTr
@lang zh-CN 提供 caller slot 组成的有限 view-based table row 与可选本地 select intent；不拥有记录、排序、导航或行测量。
@lang en Provides a finite view-based table row composed by caller slots and optional local select intent; it owns no record, sorting, navigation, or row measurement.
-->
<template>
  <!-- @lang zh-CN 可点击行使用 button 以提供明确局部 control；静态行保持 view，两个分支都只承载 caller cells/slot。
  @lang en A clickable row uses a button to provide an explicit local control; a static row remains a view, and both branches carry caller cells/slot only.
  <lang><zh-CN>row role 是辅助可发现性提示，不承诺小程序或读屏会形成完整 table tree。</zh-CN><en>The row role is an assistive discoverability cue and does not promise a complete table tree in Mini Program or screen readers.</en></lang> -->
  <button v-if="clickable" :class="rootClasses" type="button" :disabled="disabled" role="row" @click="handleSelect"><slot /></button><view v-else :class="rootClasses" role="row"><slot /></view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称表示 slot-composed 的本地行，不代表数据记录、路由目标或表格控制器。</zh-CN><en>The stable name denotes a slot-composed local row, not a data record, route target, or table controller.</en></lang>
defineOptions({ name: 'u-tr' });

// <lang><zh-CN>value、可点击与 disabled 由 caller 拥有；没有 index、record 或排序字段。</zh-CN><en>Value, clickability, and disabled state are caller-owned; there are no index, record, or sort fields.</en></lang>
const props = defineProps({ value: { type: [String, Number], default: '' }, clickable: { type: Boolean, default: false }, disabled: { type: Boolean, default: false } });

// <lang><zh-CN>select 只报告透明 caller value；任何导航、写入或详情展开均在组件边界外决定。</zh-CN><en>Select reports transparent caller value only; any navigation, write, or detail expansion is decided outside the component boundary.</en></lang>
const emit = defineEmits(['select']);

// <lang><zh-CN>根 class 仅反映有限交互状态，不把 caller value 放入 CSS 名称。</zh-CN><en>The root class reflects finite interaction state only and places no caller value in a CSS name.</en></lang>
const rootClasses = computed(() => ['u-tr', { 'u-tr--clickable': props.clickable, 'u-tr--disabled': props.clickable && props.disabled }]);

/**
 * @lang zh-CN 报告已启用 row 的局部选择；不修改 props 或读取/测量其他行。
 * @lang en Reports local selection of an enabled row; it mutates no props and reads/measures no other row.
 * @returns {void} <lang><zh-CN>无返回值；可用时 emit `select`。</zh-CN><en>No return value; emits `select` when enabled.</en></lang>
 */
function handleSelect() {
  // <lang><zh-CN>guard 保持静态/disabled 行的零事件契约，即使 handler 被直接调用。</zh-CN><en>The guard retains the zero-event contract for static/disabled rows even when the handler is called directly.</en></lang>
  if (!props.clickable || props.disabled) return;
  emit('select', { value: props.value });
}
</script>

<style src="./u-tr.css"></style>
