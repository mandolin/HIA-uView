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
    <!-- @lang zh-CN 默认 slot 仅替代调用方 label 的可见内容；独立 label 节点使 labelDisabled 可以阻止文字点击，而 marker/control 仍可遵循其他 guard。 @lang en The default slot replaces only caller label content; the separate label node lets labelDisabled block copy clicks while the marker/control continues to follow the other guards. <lang><zh-CN>slot 不接收 option 数据、scoped value 或业务上下文。</zh-CN><en>The slot receives no option data, scoped value, or business context.</en></lang> -->
    <view class="u-checkbox__label" @click.stop="handleLabelChange"><slot><text>{{ label }}</text></slot></view>
  </button>
</template>

<script setup>
import { computed, getCurrentInstance, inject } from 'vue';
import { CHECKBOX_GROUP_CONTEXT } from '../selection-context.mjs';

// <lang><zh-CN>声明稳定的 kebab-case 名称，使模板、manifest 与显式 plugin registry 使用同一运行时键。</zh-CN><en>Declares the stable kebab-case name so templates, the manifest, and the explicit plugin registry use the same runtime key.</en></lang>
defineOptions({
  name: 'u-checkbox'
});

// <lang><zh-CN>子项只接收本地 value、label、受控 checked/modelValue/disabled；不接收 option 数据、规则、请求或业务对象。</zh-CN><en>The child accepts only local value, label, controlled checked/modelValue/disabled; it accepts no option data, rule, request, or business object.</en></lang>
const props = defineProps({
  // <lang><zh-CN>value 是独立 payload 或 group 数组成员比较所用的透明本地键；保留字符串/数字原值，不转换或持久化。</zh-CN><en>Value is the transparent local key for independent payload or group-array membership comparison; it preserves string/number values without conversion or persistence.</en></lang>
  value: {
    type: [String, Number],
    default: ''
  },
  // <lang><zh-CN>name 是上游熟悉的透明键 alias；仅在调用方缺省 value 时回退使用，不转换字符串或数字。</zh-CN><en>Name is the upstream-familiar transparent-key alias; it is used only when the caller omits value, without converting strings or numbers.</en></lang>
  name: {
    type: [String, Number],
    default: ''
  },
  // <lang><zh-CN>label 是调用方可见文字；空默认值不会生成领域选项文案。</zh-CN><en>Label is caller-visible text; the empty default generates no domain-option copy.</en></lang>
  label: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>checked 是既有 HIA 独立模式 alias；未声明时由 modelValue 接管，group 存在时成员关系由 context 接管。</zh-CN><en>Checked is the existing HIA independent-mode alias; when absent modelValue takes over, and group context takes over membership when present.</en></lang>
  checked: {
    type: Boolean,
    default: undefined
  },
  // <lang><zh-CN>modelValue 是独立模式的标准布尔受控值；组件只 emit 下一值，不写入该 prop。</zh-CN><en>ModelValue is the standard boolean controlled value in independent mode; the component only emits the next value and never writes this prop.</en></lang>
  modelValue: {
    type: Boolean,
    default: false
  },
  // <lang><zh-CN>局部 disabled 保持上游的 string/boolean 接收面；任何非空字符串都表示调用方明确的不可操作状态。</zh-CN><en>Local disabled retains the upstream string/boolean acceptance surface; any nonempty string represents a caller-explicit inactive state.</en></lang>
  disabled: {
    type: [String, Boolean],
    default: ''
  },
  // <lang><zh-CN>labelDisabled 只阻止 label 节点的选择意图；它不把整个 control 置为 disabled。</zh-CN><en>LabelDisabled blocks selection intent from the label node only; it does not disable the whole control.</en></lang>
  labelDisabled: {
    type: Boolean,
    default: false
  }
});

// <lang><zh-CN>独立模式同时报告标准 v-model 布尔值与既有 HIA change payload；调用方决定是否及如何写回。</zh-CN><en>Independent mode reports both the standard v-model boolean and the existing HIA change payload; the caller decides whether and how to write back.</en></lang>
const emit = defineEmits(['change', 'update:modelValue']);

// <lang><zh-CN>缺失 group 时保持 null，保留独立受控 checkbox 而不建立隐式全局关联。</zh-CN><en>Missing group remains null, retaining an independent controlled checkbox without creating an implicit global association.</en></lang>
const groupContext = inject(CHECKBOX_GROUP_CONTEXT, null);

// <lang><zh-CN>当前 Vue 实例仅用于判断 value 是否由调用方显式传入；不读取父页、全局 registry 或 DOM。</zh-CN><en>The current Vue instance is used only to determine whether the caller explicitly supplied value; it reads no parent page, global registry, or DOM.</en></lang>
const componentInstance = getCurrentInstance();

/**
 * @lang zh-CN 判断当前 vnode 是否显式声明指定 prop，从而区分缺省 value 与显式空字符串 value。
 * @lang en Determines whether the current vnode explicitly declares a prop, distinguishing an omitted value from an explicit empty-string value.
 * @param {string} propName <lang><zh-CN>需要检查的声明式 prop 名称。</zh-CN><en>Declared prop name to inspect.</en></lang>
 * @returns {boolean} <lang><zh-CN>调用方显式传入时为 true。</zh-CN><en>`true` when the caller supplied the prop explicitly.</en></lang>
 */
function hasExplicitProp(propName) {
  // <lang><zh-CN>vnode props 可能为 null；使用 Object.prototype 避免依赖任意输入对象的原型方法。</zh-CN><en>Vnode props may be null; Object.prototype avoids depending on a prototype method from an arbitrary input object.</en></lang>
  return Object.prototype.hasOwnProperty.call(componentInstance?.vnode?.props ?? {}, propName);
}

// <lang><zh-CN>透明键严格按显式 value 优先、缺省时 name 回退解析；显式空字符串也不会被 name 覆盖。</zh-CN><en>The transparent key resolves by explicit value first and name only when value is omitted; even an explicit empty string is not overridden by name.</en></lang>
const resolvedValue = computed(() => (hasExplicitProp('value') ? props.value : props.name));

// <lang><zh-CN>仅在调用方显式提供 checked 时保留既有 alias 优先级；否则采用标准 modelValue，避免默认 false 覆盖迁移值。</zh-CN><en>Retains existing alias precedence only when the caller explicitly provides checked; otherwise uses standard modelValue so a default false cannot mask the migration value.</en></lang>
const independentChecked = computed(() => (
  props.checked === undefined ? props.modelValue : props.checked
));

// <lang><zh-CN>有 group 时由只读成员集合确定 checked；独立模式严格采用已解析的 caller-controlled 布尔值。</zh-CN><en>With a group the read-only membership collection determines checked; independent mode strictly uses the resolved caller-controlled boolean.</en></lang>
const isChecked = computed(() => (
  groupContext ? groupContext.selectedValues.value.includes(resolvedValue.value) : independentChecked.value
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

// <lang><zh-CN>disabled 聚合局部与 group 状态，使原生属性和 handler guard 使用同一结论。</zh-CN><en>Disabled aggregates local and group state so the native attribute and handler guard use the same conclusion.</en></lang>
const isDisabled = computed(() => (
  isDisabledInput(props.disabled) || Boolean(groupContext?.isGroupDisabled.value)
));

// <lang><zh-CN>label guard 合并 child/group 声明；它仅供 label 点击路径使用，不改变 marker/control 的可用性。</zh-CN><en>The label guard combines child and group declarations; it is used only by the label-click path and does not alter marker/control availability.</en></lang>
const isLabelInteractionDisabled = computed(() => (
  props.labelDisabled || Boolean(groupContext?.isGroupLabelDisabled.value)
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
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时委托 group 或 emit 标准/既有独立模式意图。</zh-CN><en>No return value; delegates to the group or emits standard/existing independent-mode intent when guards pass.</en></lang>
 */
function handleChange() {
  // <lang><zh-CN>disabled guard 必须先于状态反转或 emit，保证直接 handler 调用也保持零事件。</zh-CN><en>The disabled guard must precede state inversion or emit, ensuring direct handler calls also retain zero events.</en></lang>
  if (isDisabled.value) {
    return;
  }

  // <lang><zh-CN>下一布尔值仅由当前呈现状态反转得出；它不触发规则、请求或业务数据更新。</zh-CN><en>The next boolean derives only by inverting current presentation state; it triggers no rule, request, or business-data update.</en></lang>
  const nextChecked = !isChecked.value;

  // <lang><zh-CN>group 负责创建新成员数组；独立模式先报告标准布尔值，再保留既有透明 payload，应用始终拥有状态写回。</zh-CN><en>The group creates the new membership array; independent mode reports the standard boolean first then retains the existing transparent payload, while the application always owns state write-back.</en></lang>
  if (groupContext) {
    groupContext.changeValue(resolvedValue.value, nextChecked);
    return;
  }

  // <lang><zh-CN>标准 v-model 事件只携带下一布尔值，不携带或推导业务键。</zh-CN><en>The standard v-model event carries only the next boolean and neither carries nor derives a business key.</en></lang>
  emit('update:modelValue', nextChecked);

  // <lang><zh-CN>既有 change payload 保留 value 与 checked，避免破坏已存在的 HIA caller contract。</zh-CN><en>The existing change payload retains value and checked, avoiding a break to the existing HIA caller contract.</en></lang>
  emit('change', {
    value: resolvedValue.value,
    checked: nextChecked
  });
}

/**
 * @lang zh-CN 处理 label 区域点击；child/group labelDisabled 任一生效时保持零事件，否则复用标准 control 转换。
 * @lang en Handles label-area clicks; child or group labelDisabled retains zero events, otherwise the standard control transition is reused.
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时委托 handleChange。</zh-CN><en>No return value; delegates to handleChange when guards pass.</en></lang>
 */
function handleLabelChange() {
  // <lang><zh-CN>labelDisabled 不能被直接 handler 调用绕过；整体 disabled 仍由 handleChange 统一阻止。</zh-CN><en>Direct handler calls cannot bypass labelDisabled; handleChange still centrally blocks whole-control disabled state.</en></lang>
  if (isLabelInteractionDisabled.value) {
    return;
  }

  // <lang><zh-CN>启用 label 与 marker/control 使用完全相同的下一状态、group 委托和事件顺序。</zh-CN><en>An enabled label uses exactly the same next state, group delegation, and event order as the marker/control.</en></lang>
  handleChange();
}
</script>

<style src="./u-checkbox.css"></style>
