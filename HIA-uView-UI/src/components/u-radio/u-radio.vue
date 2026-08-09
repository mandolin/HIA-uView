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
    <!-- @lang zh-CN 默认 slot 仅替代调用方 label；它不接收选择数据、scoped value 或业务上下文。 @lang en The default slot replaces only caller label content; it receives no choice data, scoped value, or business context. <lang><zh-CN>slot 不取得选择状态或业务 authority。</zh-CN><en>The slot acquires neither choice state nor business authority.</en></lang> -->
    <slot><text>{{ label }}</text></slot>
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
  // <lang><zh-CN>value 是独立 emit 或 group 比较所用的透明本地键；保留字符串/数字原值，不转换或持久化。</zh-CN><en>Value is the transparent local key used for independent emit or group comparison; it preserves string/number values without conversion or persistence.</en></lang>
  value: {
    type: [String, Number],
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
  // <lang><zh-CN>局部 disabled 保持上游的 string/boolean 接收面；任何非空字符串都表示调用方明确的不可操作状态。</zh-CN><en>Local disabled retains the upstream string/boolean acceptance surface; any nonempty string represents a caller-explicit inactive state.</en></lang>
  disabled: {
    type: [String, Boolean],
    default: ''
  }
});

// <lang><zh-CN>独立模式保留 HIA select，并增加上游熟悉的 change；二者都只报告原样 local value。</zh-CN><en>Independent mode retains HIA select and adds the upstream-familiar change; both report only the unchanged local value.</en></lang>
const emit = defineEmits(['select', 'change']);

// <lang><zh-CN>缺失 group 时保持 null，保留独立受控模式而不建立隐式全局关联。</zh-CN><en>Missing group remains null, retaining independent controlled mode without creating an implicit global association.</en></lang>
const groupContext = inject(RADIO_GROUP_CONTEXT, null);

// <lang><zh-CN>有 group 时只读比较 group 当前值；没有 group 时严格采用调用方 checked，不创建内部选择状态。</zh-CN><en>With a group it read-only compares the current group value; without a group it strictly uses caller checked and creates no internal selection state.</en></lang>
const isSelected = computed(() => (
  groupContext ? groupContext.selectedValue.value === props.value : props.checked
));

/**
 * @lang zh-CN 将声明式 string/boolean disabled 输入归一为本地不可操作判断；不解释字符串内容为业务状态。
 * @lang en Normalizes declarative string/boolean disabled input into a local inactive judgment; it does not interpret string content as business state.
 * @param {string|boolean} disabled <lang><zh-CN>调用方声明的禁用输入。</zh-CN><en>Caller-declared disabled input.</en></lang>
 * @returns {boolean} <lang><zh-CN>是否应阻止本地交互。</zh-CN><en>Whether local interaction must be blocked.</en></lang>
 */
function isDisabledInput(disabled) {
  // <lang><zh-CN>空字符串是上游同形默认值且表示未禁用；其余非空字符串与 true 都是明确的不可操作声明。</zh-CN><en>The empty string is the upstream-shaped default and means enabled; every other nonempty string and true explicitly declares inactivity.</en></lang>
  return disabled === true || (typeof disabled === 'string' && disabled.length > 0);
}

// <lang><zh-CN>disabled 组合局部与 group 边界，使原生按钮属性和 handler guard 表达同一可用性结论。</zh-CN><en>Disabled combines local and group boundaries so the native-button attribute and handler guard express the same availability conclusion.</en></lang>
const isDisabled = computed(() => (
  isDisabledInput(props.disabled) || Boolean(groupContext?.isGroupDisabled.value)
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
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时委托 group 或 emit `select`/`change`。</zh-CN><en>No return value; delegates to the group or emits `select`/`change` when guards pass.</en></lang>
 */
function handleSelect() {
  // <lang><zh-CN>已选 radio 与 disabled radio 都保持零事件，保护单选不可取消的不变量。</zh-CN><en>Already-selected and disabled radios both retain zero events, protecting the non-cancellable single-selection invariant.</en></lang>
  if (isDisabled.value || isSelected.value) {
    return;
  }

  // <lang><zh-CN>group 集中决定 v-model/change emit；独立模式同时报告既有 select 与迁移 change，但都只交还未经修改的调用方 value。</zh-CN><en>The group centrally decides v-model/change emits; independent mode reports both existing select and migration change, but both return only the unchanged caller value.</en></lang>
  if (groupContext) {
    groupContext.selectValue(props.value);
    return;
  }

  emit('select', props.value);
  emit('change', props.value);
}
</script>

<style src="./u-radio.css"></style>
