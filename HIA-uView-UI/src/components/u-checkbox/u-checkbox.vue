<!--
@component UCheckbox
@lang zh-CN 呈现调用方拥有的布尔选项；独立模式 emit next checked，group 模式委托 group 产生新数组，不写 prop 或取得表单/业务职责。
@lang en Presents a caller-owned boolean option; independent mode emits next checked, group mode delegates to group for a new array, and it writes no prop or acquires form/business responsibility.
-->
<template>
  <!--
  @lang zh-CN 原生按钮呈现文字、非颜色方形符号和 disabled guard。
  @lang en The native button presents text, a non-color square symbol, and a disabled guard.
  <lang><zh-CN>它不是 picker、导航 control 或 option data source；checked 仅反映调用方或 group 提供的受控状态。</zh-CN><en>It is not a picker, navigation control, or option data source; checked reflects only state controlled by the caller or group.</en></lang>
  -->
  <button :class="checkboxClasses" :disabled="isDisabled" @click="handleChange">
    <text class="u-checkbox__mark">{{ isChecked ? '☑' : '☐' }}</text>
    <text>{{ label }}</text>
  </button>
</template>

<script setup>
import { computed, inject } from 'vue';
import { CHECKBOX_GROUP_CONTEXT } from '../selection-context.mjs';

// <lang><zh-CN>声明稳定的 kebab-case 名称，使模板、manifest 与显式 plugin registry 使用同一运行时键。</zh-CN><en>Declares the stable kebab-case name so templates, the manifest, and the explicit plugin registry use the same runtime key.</en></lang>
defineOptions({
  name: 'u-checkbox'
});

// <lang><zh-CN>子项只接收本地 value、label、受控 checked/disabled；不接收 option 数据、规则、请求或业务对象。</zh-CN><en>The child accepts only local value, label, controlled checked/disabled; it accepts no option data, rule, request, or business object.</en></lang>
const props = defineProps({
  // <lang><zh-CN>value 是独立 payload 或 group 数组成员比较所用的透明本地键；组件不转换或持久化它。</zh-CN><en>Value is the transparent local key for independent payload or group-array membership comparison; the component neither transforms nor persists it.</en></lang>
  value: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>label 是调用方可见文字；空默认值不会生成领域选项文案。</zh-CN><en>Label is caller-visible text; the empty default generates no domain-option copy.</en></lang>
  label: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>独立模式的 checked 完全由调用方控制；group 存在时成员关系由 context 的 selectedValues 接管。</zh-CN><en>Independent-mode checked is fully caller-controlled; group context takes over membership through selectedValues when present.</en></lang>
  checked: {
    type: Boolean,
    default: false
  },
  // <lang><zh-CN>局部 disabled 与 group disabled 共同形成不可操作边界。</zh-CN><en>Local disabled and group disabled jointly form the inactive boundary.</en></lang>
  disabled: {
    type: Boolean,
    default: false
  }
});

// <lang><zh-CN>独立模式唯一事件返回下一 checked 和原样 value；调用方决定是否写回 checked。</zh-CN><en>The sole independent-mode event returns next checked and unchanged value; the caller decides whether to write checked back.</en></lang>
const emit = defineEmits(['change']);

// <lang><zh-CN>缺失 group 时保持 null，保留独立受控 checkbox 而不建立隐式全局关联。</zh-CN><en>Missing group remains null, retaining an independent controlled checkbox without creating an implicit global association.</en></lang>
const groupContext = inject(CHECKBOX_GROUP_CONTEXT, null);

// <lang><zh-CN>有 group 时由只读成员集合确定 checked；独立模式严格采用调用方 prop。</zh-CN><en>With a group the read-only membership collection determines checked; independent mode strictly uses the caller prop.</en></lang>
const isChecked = computed(() => (
  groupContext ? groupContext.selectedValues.value.includes(props.value) : props.checked
));

// <lang><zh-CN>disabled 聚合局部与 group 状态，使原生属性和 handler guard 使用同一结论。</zh-CN><en>Disabled aggregates local and group state so the native attribute and handler guard use the same conclusion.</en></lang>
const isDisabled = computed(() => (
  props.disabled || Boolean(groupContext?.isGroupDisabled.value)
));

// <lang><zh-CN>根类只映射受控 checked/disabled 呈现，不引入任意样式或业务状态。</zh-CN><en>Root classes map only controlled checked/disabled presentation and introduce neither arbitrary styling nor business state.</en></lang>
const checkboxClasses = computed(() => [
  'u-checkbox',
  {
    'u-checkbox--checked': isChecked.value,
    'u-checkbox--disabled': isDisabled.value
  }
]);

/**
 * @lang zh-CN 在启用时报告反转后的 checked；group 存在则只委托其 immutable next-array 计算，独立模式不写 prop。
 * @lang en Reports inverted checked while enabled; when grouped it delegates only immutable next-array calculation, and independent mode writes no prop.
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时委托 group 或 emit `change`。</zh-CN><en>No return value; delegates to the group or emits `change` when guards pass.</en></lang>
 */
function handleChange() {
  // <lang><zh-CN>disabled guard 必须先于状态反转或 emit，保证直接 handler 调用也保持零事件。</zh-CN><en>The disabled guard must precede state inversion or emit, ensuring direct handler calls also retain zero events.</en></lang>
  if (isDisabled.value) {
    return;
  }

  // <lang><zh-CN>下一布尔值仅由当前呈现状态反转得出；它不触发规则、请求或业务数据更新。</zh-CN><en>The next boolean derives only by inverting current presentation state; it triggers no rule, request, or business-data update.</en></lang>
  const nextChecked = !isChecked.value;

  // <lang><zh-CN>group 负责创建新成员数组；独立模式返回小而透明的 payload，保留应用对状态写回的控制。</zh-CN><en>The group creates the new membership array; independent mode returns a small transparent payload, retaining application control over state write-back.</en></lang>
  if (groupContext) {
    groupContext.changeValue(props.value, nextChecked);
    return;
  }

  emit('change', {
    value: props.value,
    checked: nextChecked
  });
}
</script>

<style src="./u-checkbox.css"></style>
