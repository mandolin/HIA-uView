<!--
@component URadio
@lang zh-CN 呈现一个调用方拥有的单选项；独立模式 emit value，group 模式委托 group context，绝不写 prop、取消当前选择或取得业务职责。
@lang en Presents one caller-owned radio option; independent mode emits value, group mode delegates to group context, and it never writes a prop, cancels current selection, or acquires business responsibility.
-->
<template>
  <!--
  @lang zh-CN 原生按钮提供非颜色 selected 符号、调用方 label 和 disabled guard。
  @lang en The native button provides a non-color selected symbol, caller label, and disabled guard.
  <lang><zh-CN>它不是 picker、导航 control 或 option data source；选择含义仍由调用方提供的 value 决定。</zh-CN><en>It is not a picker, navigation control, or option data source; the caller-provided value still determines selection meaning.</en></lang>
  -->
  <button :class="radioClasses" :disabled="isDisabled" @click="handleSelect">
    <text class="u-radio__mark">{{ isSelected ? '●' : '○' }}</text>
    <text>{{ label }}</text>
  </button>
</template>

<script setup>
import { computed, inject } from 'vue';
import { RADIO_GROUP_CONTEXT } from '../selection-context.mjs';

// <lang><zh-CN>声明稳定的 kebab-case 名称，使模板、manifest 与显式 plugin registry 使用同一运行时键。</zh-CN><en>Declares the stable kebab-case name so templates, the manifest, and the explicit plugin registry use the same runtime key.</en></lang>
defineOptions({
  name: 'u-radio'
});

// <lang><zh-CN>子项只接收调用方本地 value、label、独立 checked 与 disabled；不接收 option 数据、规则、请求或业务对象。</zh-CN><en>The child accepts only caller local value, label, independent checked, and disabled; it accepts no option data, rule, request, or business object.</en></lang>
const props = defineProps({
  // <lang><zh-CN>value 是独立 emit 或 group 比较所用的透明本地键；组件不转换或持久化它。</zh-CN><en>Value is the transparent local key used for independent emit or group comparison; the component neither transforms nor persists it.</en></lang>
  value: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>label 是调用方可见文字；空默认值不会生成领域选项文案。</zh-CN><en>Label is caller-visible text; the empty default generates no domain-option copy.</en></lang>
  label: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>独立模式的选择呈现由 checked 完全控制；group 存在时由 context 的 selectedValue 接管。</zh-CN><en>Independent-mode selection presentation is fully controlled by checked; group context takes over through selectedValue when present.</en></lang>
  checked: {
    type: Boolean,
    default: false
  },
  // <lang><zh-CN>局部 disabled 与 group disabled 共同决定零事件状态。</zh-CN><en>Local disabled and group disabled jointly determine the zero-event state.</en></lang>
  disabled: {
    type: Boolean,
    default: false
  }
});

// <lang><zh-CN>独立模式唯一事件只报告原样 value；调用方决定是否和如何更新 checked。</zh-CN><en>The sole independent-mode event reports only unchanged value; the caller decides whether and how to update checked.</en></lang>
const emit = defineEmits(['select']);

// <lang><zh-CN>缺失 group 时保持 null，保留独立受控模式而不建立隐式全局关联。</zh-CN><en>Missing group remains null, retaining independent controlled mode without creating an implicit global association.</en></lang>
const groupContext = inject(RADIO_GROUP_CONTEXT, null);

// <lang><zh-CN>有 group 时只读比较 group 当前值；没有 group 时严格采用调用方 checked，不创建内部选择状态。</zh-CN><en>With a group it read-only compares the current group value; without a group it strictly uses caller checked and creates no internal selection state.</en></lang>
const isSelected = computed(() => (
  groupContext ? groupContext.selectedValue.value === props.value : props.checked
));

// <lang><zh-CN>disabled 组合局部与 group 边界，使原生按钮属性和 handler guard 表达同一可用性结论。</zh-CN><en>Disabled combines local and group boundaries so the native-button attribute and handler guard express the same availability conclusion.</en></lang>
const isDisabled = computed(() => (
  props.disabled || Boolean(groupContext?.isGroupDisabled.value)
));

// <lang><zh-CN>根类只映射受控 selected/disabled 呈现，不引入任意样式或业务状态。</zh-CN><en>Root classes map only controlled selected/disabled presentation and introduce neither arbitrary styling nor business state.</en></lang>
const radioClasses = computed(() => [
  'u-radio',
  {
    'u-radio--selected': isSelected.value,
    'u-radio--disabled': isDisabled.value
  }
]);

/**
 * @lang zh-CN 在启用且尚未选中时选择本地 value；group 模式委托 group，独立模式只 emit，不会通过再次点击取消 radio。
 * @lang en Selects local value while enabled and not already selected; group mode delegates to the group and independent mode only emits, so a second click never cancels a radio.
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时委托 group 或 emit `select`。</zh-CN><en>No return value; delegates to the group or emits `select` when guards pass.</en></lang>
 */
function handleSelect() {
  // <lang><zh-CN>已选 radio 与 disabled radio 都保持零事件，保护单选不可取消的不变量。</zh-CN><en>Already-selected and disabled radios both retain zero events, protecting the non-cancellable single-selection invariant.</en></lang>
  if (isDisabled.value || isSelected.value) {
    return;
  }

  // <lang><zh-CN>group 集中决定 v-model/change emit；独立模式把未经修改的调用方 value 交还应用。</zh-CN><en>The group centrally decides v-model/change emits; independent mode returns the unchanged caller value to the application.</en></lang>
  if (groupContext) {
    groupContext.selectValue(props.value);
    return;
  }

  emit('select', props.value);
}
</script>

<style src="./u-radio.css"></style>
