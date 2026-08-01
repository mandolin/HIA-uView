<!--
@component UCell
@lang zh-CN 为 HIA-uView 私有 `mp-weixin` 配置提供受限的通用信息行；展示调用方自有文字，并在明确 opt-in 后 emit 通用 click 意图，不拥有链接、路由、表单或业务记录。
@lang en Provides a constrained generic information row for the private HIA-uView `mp-weixin` profile; it displays caller-owned text and emits generic click intent after explicit opt-in, while owning no link, route, form, or business record.
-->
<template>
  <!--
  @lang zh-CN 根行按交互状态选择原生 control 或纯展示容器。
  @lang en The root row selects a native control or a presentation-only container according to interaction state.
  <lang><zh-CN>可点击行使用原生 button，使 mp-weixin 能提供实际可激活的 control；不可点击行保持 view，避免纯信息默认成为操作或表单控件。两个分支都只转发通用 click 意图，handler guard 仍是跨宿主的最终保护。</zh-CN><en>A clickable row uses a native button so mp-weixin can provide an actually activatable control; a non-clickable row remains a view, preventing pure information from becoming an action or form control by default. Both branches forward only generic click intent, and the handler guard remains the final cross-host protection.</en></lang>
  -->
  <button
    v-if="clickable"
    type="button"
    :class="cellClasses"
    :disabled="disabled"
    @click="handleClick"
  >
    <!--
    @lang zh-CN 可点击分支保留调用方主标签、可选说明和值。
    @lang en The clickable branch retains caller primary label, optional description, and value.
    <lang><zh-CN>button 内部仍只呈现调用方提供的信息；它不会取得链接、导航、表单提交或业务记录职责。</zh-CN><en>Inside the button, the component still presents only caller-provided information; it acquires no link, navigation, form-submission, or business-record responsibility.</en></lang>
    -->
    <view class="u-cell__content">
      <text class="u-cell__label">{{ label }}</text>
      <text v-if="description" class="u-cell__description">{{ description }}</text>
    </view>
    <text v-if="value" class="u-cell__value">{{ value }}</text>
  </button>

  <!--
  @lang zh-CN 纯信息分支维持非 control 根节点。
  @lang en The informational branch retains a non-control root node.
  <lang><zh-CN>该分支不绑定 click，也不输出 disabled 原生属性；即使宿主意外派发事件，script guard 仍会维持零事件契约。</zh-CN><en>This branch binds no click and emits no native disabled attribute; even if a host unexpectedly dispatches an event, the script guard still retains the zero-event contract.</en></lang>
  -->
  <view v-else :class="cellClasses">
    <!--
    @lang zh-CN 信息分支使用与可点击分支相同的调用方文字结构。
    @lang en The informational branch uses the same caller-text structure as the clickable branch.
    <lang><zh-CN>重复的静态结构有意避免动态 component 选择，使 UniApp compiler 可为两个固定宿主标签生成可审阅输出。</zh-CN><en>The repeated static structure deliberately avoids dynamic component selection, allowing the UniApp compiler to generate auditable output for two fixed host tags.</en></lang>
    -->
    <view class="u-cell__content">
      <text class="u-cell__label">{{ label }}</text>
      <text v-if="description" class="u-cell__description">{{ description }}</text>
    </view>
    <text v-if="value" class="u-cell__value">{{ value }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>声明稳定的 kebab-case 组件名，保持模板、manifest 与显式 plugin registry 的运行时名称一致。</zh-CN><en>Declares the stable kebab-case component name, keeping the runtime name consistent across templates, the manifest, and the explicit plugin registry.</en></lang>
defineOptions({
  name: 'u-cell'
});

// <lang><zh-CN>受限信息行输入；文本均归调用方所有，交互只接受布尔 opt-in，不接受 URL、route、表单值或业务字段。</zh-CN><en>Constrained information-row inputs; all text belongs to the caller and interaction accepts boolean opt-in only, never a URL, route, form value, or business field.</en></lang>
const props = defineProps({
  // <lang><zh-CN>主标签是调用方必须提供的可见信息；空默认值避免组件伪造领域术语或占位业务文案。</zh-CN><en>The primary label is caller-required visible information; an empty default prevents the component from fabricating domain terminology or placeholder business copy.</en></lang>
  label: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>次级说明是可选调用方文字，用于补充主标签但不承担表单帮助、错误或业务校验语义。</zh-CN><en>Secondary description is optional caller text that supplements the primary label without owning form help, error, or business-validation semantics.</en></lang>
  description: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>右侧值是可选调用方文字；组件不把它解释为路由目标、表单值或状态码。</zh-CN><en>The right-side value is optional caller text; the component does not interpret it as route destination, form value, or status code.</en></lang>
  value: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>点击能力必须由调用方显式开启，使默认信息行保持零事件、零导航意图。</zh-CN><en>Click capability must be explicitly enabled by the caller so the default informational row retains zero events and zero navigation intent.</en></lang>
  clickable: {
    type: Boolean,
    default: false
  },
  // <lang><zh-CN>禁用状态仅抑制已 opt-in 的 click；它不改变调用方提供的文字或引入业务状态逻辑。</zh-CN><en>Disabled state suppresses only opt-in click; it changes neither caller-provided text nor introduces business-state logic.</en></lang>
  disabled: {
    type: Boolean,
    default: false
  }
});

// <lang><zh-CN>唯一公开的通用意图事件；调用方在组件边界之外决定导航、业务命令、网络或其他副作用。</zh-CN><en>The sole public generic intent event; callers decide navigation, business commands, network activity, or other side effects outside the component boundary.</en></lang>
const emit = defineEmits(['click']);

// <lang><zh-CN>点击不可用条件；未选择 clickable 和显式 disabled 都必须抑制事件，避免信息展示默认变成隐式操作。</zh-CN><en>Click-inactive condition; both lack of clickable opt-in and explicit disabled state must suppress events so informational display never becomes an implicit action.</en></lang>
const isInactive = computed(() => !props.clickable || props.disabled);

// <lang><zh-CN>由交互 props 派生的根类；disabled 外观仅在可点击行上出现，避免为纯信息行传递错误状态含义。</zh-CN><en>Root classes derived from interaction props; disabled appearance occurs only on clickable rows, avoiding an erroneous state meaning for purely informational rows.</en></lang>
const cellClasses = computed(() => [
  'u-cell',
  {
    'u-cell--clickable': props.clickable,
    'u-cell--disabled': props.clickable && props.disabled
  }
]);

/**
 * @lang zh-CN 仅在信息行被明确设为可点击且未禁用时转发平台 click；不解释点击目的，也不执行导航或业务副作用。
 * @lang en Forwards the platform click only when the information row is explicitly clickable and not disabled; it interprets no click purpose and performs no navigation or business side effect.
 * @param {Event} event <lang><zh-CN>根 view 提供的平台点击事件。</zh-CN><en>Platform click event supplied by the root view.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合条件时通过 `click` 事件转交原始事件。</zh-CN><en>No return value; when eligible, the original event is delegated through the `click` event.</en></lang>
 */
function handleClick(event) {
  // <lang><zh-CN>先执行无副作用 guard，使不可点击或禁用状态保持零事件契约。</zh-CN><en>Runs the side-effect-free guard first so non-clickable and disabled states retain the zero-event contract.</en></lang>
  if (isInactive.value) {
    return;
  }

  // <lang><zh-CN>保留原始平台事件给应用层；组件本身不创建目标地址或后续动作。</zh-CN><en>Preserves the original platform event for the application layer; the component itself creates no destination or follow-up action.</en></lang>
  emit('click', event);
}
</script>

<style src="./u-cell.css"></style>
