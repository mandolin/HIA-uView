<!--
@component UField
@lang zh-CN 为 HIA-uView 私有 `mp-weixin` 配置提供展示型字段结构；它组合调用方标签、帮助文字、默认插槽和独立校验消息，不拥有表单模型、规则、异步工作、完成操作或业务字段。
@lang en Provides presentational field structure for the private HIA-uView `mp-weixin` profile; it composes caller label, help text, default slot, and independent validation message without owning a form model, rules, asynchronous work, completion actions, or business fields.
-->
<template>
  <!--
  @lang zh-CN 字段根按固定顺序组织标签、控件、帮助与独立校验显示。
  @lang en The field root organizes label, control, help, and independent validation display in fixed order.
  <lang><zh-CN>字段只提供可读结构，默认插槽中的控件仍由应用拥有值、原生属性和事件。</zh-CN><en>The field provides readable structure only; the application still owns value, native attributes, and events of the control in the default slot.</en></lang>
  -->
  <view class="u-field">
    <!--
    @lang zh-CN 标签行保留调用方可见文字与可选必填标记。
    @lang en The label row retains caller-visible text and an optional required marker.
    <lang><zh-CN>必填标记是提示性文字，不执行规则，也不替代应用对提交时机的决定。</zh-CN><en>The required marker is informative text, executes no rule, and does not replace the application's decision about completion timing.</en></lang>
    -->
    <view class="u-field__label-row">
      <text class="u-field__label">{{ label }}</text>
      <text v-if="required" class="u-field__required-mark">*</text>
    </view>

    <!--
    @lang zh-CN 默认插槽承载应用自有控件。
    @lang en The default slot carries the application-owned control.
    <lang><zh-CN>组件不读取、转换或转发插槽控件事件，使 UInput 或其他未来控件保持各自的受控边界。</zh-CN><en>The component neither reads, transforms, nor forwards slotted-control events, keeping UInput or another future control within its own controlled boundary.</en></lang>
    -->
    <view class="u-field__control">
      <slot />
    </view>

    <!--
    @lang zh-CN 帮助文字只在调用方提供非空内容时渲染。
    @lang en Help text renders only when the caller provides non-empty content.
    <lang><zh-CN>帮助文字与校验消息可以同时存在；组件不推断哪一项应被隐藏或替换。</zh-CN><en>Help text and validation message may coexist; the component does not infer which one should be hidden or replaced.</en></lang>
    -->
    <text v-if="hasHelpText" class="u-field__help">{{ helpText }}</text>

    <!--
    @lang zh-CN 独立消息组件只接收调用方声明的状态和文字。
    @lang en The independent message component receives only caller-declared state and text.
    <lang><zh-CN>UField 只组合呈现，不把状态解释为规则结果，也不发起异步动作。</zh-CN><en>UField composes presentation only, does not interpret state as a rule result, and starts no asynchronous action.</en></lang>
    -->
    <UValidationMessage :state="validationState" :message="validationMessage" />
  </view>
</template>

<script setup>
import { computed } from 'vue';
import UValidationMessage from '../u-validation-message/u-validation-message.vue';

// <lang><zh-CN>声明稳定的 kebab-case 组件名，使模板、manifest 与显式 plugin registry 使用同一运行时名称。</zh-CN><en>Declares the stable kebab-case component name so templates, the manifest, and the explicit plugin registry use one runtime name.</en></lang>
defineOptions({
  name: 'u-field'
});

// <lang><zh-CN>字段输入全部是调用方自有的展示数据；没有表单对象、规则函数、完成回调、身份或后端输入。</zh-CN><en>All field inputs are caller-owned presentation data; there is no form object, rule function, completion callback, identity, or backend input.</en></lang>
const props = defineProps({
  // <lang><zh-CN>可见标签由调用方提供；空默认值避免字段结构伪造领域标签。</zh-CN><en>The caller provides the visible label; an empty default prevents the field structure from fabricating a domain label.</en></lang>
  label: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>必填标记只表示调用方希望展示该提示，不执行必填检查或改变插槽控件。</zh-CN><en>The required marker only represents a caller request to display that cue; it performs no required check and changes no slotted control.</en></lang>
  required: {
    type: Boolean,
    default: false
  },
  // <lang><zh-CN>帮助文字是可选调用方内容，与组件自有或业务默认文案完全隔离。</zh-CN><en>Help text is optional caller content fully isolated from component-owned or business default copy.</en></lang>
  helpText: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>校验呈现状态由应用声明并原样传给独立消息组件；未知字符串由消息组件安全地隐藏。</zh-CN><en>Validation presentation state is declared by the application and passed unchanged to the independent message component; an unknown string is safely hidden by that component.</en></lang>
  validationState: {
    type: String,
    default: 'idle'
  },
  // <lang><zh-CN>校验文字由应用本地化并拥有；字段不生成、翻译、缓存或记录它。</zh-CN><en>Validation text is localized and owned by the application; the field does not generate, translate, cache, or log it.</en></lang>
  validationMessage: {
    type: String,
    default: ''
  }
});

// <lang><zh-CN>帮助文字可见性只由非空调用方字符串导出，避免用状态或业务含义猜测内容。</zh-CN><en>Help-text visibility derives only from a non-empty caller string, avoiding guesses based on state or business meaning.</en></lang>
const hasHelpText = computed(() => props.helpText.length > 0);
</script>

<style src="./u-field.css"></style>
