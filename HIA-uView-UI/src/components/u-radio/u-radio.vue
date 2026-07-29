<!--
@component URadio
@lang zh-CN 呈现一个调用方拥有的单选项；独立模式 emit value，group 模式委托 group context，绝不写 prop、取消当前选择或取得业务职责。
@lang en Presents one caller-owned radio option; independent mode emits value, group mode delegates to group context, and it never writes a prop, cancels current selection, or acquires business responsibility.
-->
<template>
  <!-- @lang zh-CN 原生按钮提供非颜色 selected 符号、调用方 label 和 disabled guard。 @lang en The native button provides non-color selected symbol, caller label, and disabled guard. <lang><zh-CN>它不是 picker 或导航 control。</zh-CN><en>It is not a picker or navigation control.</en></lang> -->
  <button :class="radioClasses" :disabled="isDisabled" @click="handleSelect"><text class="u-radio__mark">{{ isSelected ? '●' : '○' }}</text><text>{{ label }}</text></button>
</template>

<script setup>
import { computed, inject } from 'vue';
import { RADIO_GROUP_CONTEXT } from '../selection-context.mjs';
defineOptions({ name: 'u-radio' });
// <lang><zh-CN>子项只接收调用方本地 value、label、独立 checked 与 disabled，不接收数据源或表单规则。</zh-CN><en>The child accepts only caller local value, label, independent checked, and disabled; it accepts no data source or form rule.</en></lang>
const props = defineProps({ value: { type: String, default: '' }, label: { type: String, default: '' }, checked: { type: Boolean, default: false }, disabled: { type: Boolean, default: false } });
const emit = defineEmits(['select']);
// <lang><zh-CN>缺失 group 时为 null，保留独立受控模式而不创建隐式全局关联。</zh-CN><en>Missing group is null, retaining independent controlled mode without creating implicit global association.</en></lang>
const groupContext = inject(RADIO_GROUP_CONTEXT, null);
const isSelected = computed(() => groupContext ? groupContext.selectedValue.value === props.value : props.checked);
const isDisabled = computed(() => props.disabled || Boolean(groupContext?.isGroupDisabled.value));
const radioClasses = computed(() => ['u-radio', { 'u-radio--selected': isSelected.value, 'u-radio--disabled': isDisabled.value }]);
/**
 * @lang zh-CN 在启用且未选中时选择 value；group 存在则委托，独立模式只 emit。
 * @lang en Selects value while enabled and unselected; delegates when grouped and emits only when independent.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleSelect() {
  // <lang><zh-CN>guard 保证 disabled 与已选 radio 零事件。</zh-CN><en>The guard ensures disabled and selected radio have zero events.</en></lang>
  if (isDisabled.value || isSelected.value) return;
  // <lang><zh-CN>group 统一决定 model emit；独立模式把原样 value 交给调用方。</zh-CN><en>The group centrally decides model emit; independent mode returns unchanged value to caller.</en></lang>
  if (groupContext) groupContext.selectValue(props.value); else emit('select', props.value);
}
</script>

<style src="./u-radio.css"></style>
