<!--
@component UValidationMessage
@lang zh-CN 为 HIA-uView 私有 `mp-weixin` 配置提供独立校验状态/消息展示；它只呈现应用声明的状态和文字，不推断结果、执行规则、生成默认文案、发起异步工作或完成数据操作。
@lang en Provides independent validation-state/message display for the private HIA-uView `mp-weixin` profile; it presents only application-declared state and text without inferring results, executing rules, generating default copy, starting asynchronous work, or completing data actions.
-->
<template>
  <!--
  @lang zh-CN 消息根仅在受支持的非 idle 状态且调用方文字非空时渲染。
  @lang en The message root renders only for a supported non-idle state with non-empty caller text.
  <lang><zh-CN>条件渲染要求应用明确声明每条可见校验陈述，避免组件从值、时序或后台结果猜测文案。</zh-CN><en>Conditional rendering requires the application to declare every visible validation statement explicitly, preventing the component from guessing copy from value, timing, or backend result.</en></lang>
  -->
  <view v-if="isVisible" :class="messageClasses">
    <!--
    @lang zh-CN 非颜色标记区分 validating 与 error 呈现状态。
    @lang en A non-color marker distinguishes validating and error presentation states.
    <lang><zh-CN>标记是状态形状而非组件自有语言文案；调用方提供的 message 仍是唯一可读校验文字。</zh-CN><en>The marker is a state shape rather than component-owned language copy; the caller-provided message remains the only readable validation text.</en></lang>
    -->
    <text class="u-validation-message__marker">{{ stateMarker }}</text>
    <text class="u-validation-message__text">{{ message }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>声明稳定的 kebab-case 组件名，使模板、manifest 与显式 plugin registry 使用同一运行时名称。</zh-CN><en>Declares the stable kebab-case component name so templates, the manifest, and the explicit plugin registry use one runtime name.</en></lang>
defineOptions({
  name: 'u-validation-message'
});

// <lang><zh-CN>允许显示消息的有限状态集合；idle 和未知字符串都不会产生输出，从而不把状态解释扩大为应用生命周期。</zh-CN><en>Finite state collection permitted to display a message; idle and unknown strings produce no output, preventing state interpretation from expanding into an application lifecycle.</en></lang>
const visibleStates = Object.freeze(['validating', 'error']);

// <lang><zh-CN>消息展示只接受调用方声明的状态和已本地化文字；不接受值、规则、promise、代码或后端响应。</zh-CN><en>Message display accepts only caller-declared state and already localized text; it accepts no value, rule, promise, code, or backend response.</en></lang>
const props = defineProps({
  // <lang><zh-CN>状态默认 idle，使组件默认无可见输出；它不是字段有效性的断言。</zh-CN><en>State defaults to idle so the component has no visible output by default; it is not an assertion of field validity.</en></lang>
  state: {
    type: String,
    default: 'idle'
  },
  // <lang><zh-CN>可见文字由应用提供并已完成其语言选择；空默认值避免组件生成任何运行时回退文案。</zh-CN><en>Visible text is supplied by the application after it chooses a language; an empty default prevents the component from generating any runtime fallback copy.</en></lang>
  message: {
    type: String,
    default: ''
  }
});

// <lang><zh-CN>可见性同时要求受支持状态和非空文字；任一缺失都安全地保持零输出。</zh-CN><en>Visibility requires both a supported state and non-empty text; either omission safely retains zero output.</en></lang>
const isVisible = computed(() => visibleStates.includes(props.state) && props.message.length > 0);

// <lang><zh-CN>根类只映射已批准状态，为 token CSS 提供确定的视觉/非颜色标记入口。</zh-CN><en>Root classes map only approved states, providing a deterministic visual/non-color marker entry for token CSS.</en></lang>
const messageClasses = computed(() => [
  'u-validation-message',
  `u-validation-message--${props.state}`
]);

// <lang><zh-CN>符号标记补充颜色差异：error 使用感叹号，validating 使用省略号；它们不代替调用方消息。</zh-CN><en>Symbol markers supplement color difference: error uses an exclamation mark and validating uses an ellipsis; they do not replace caller message.</en></lang>
const stateMarker = computed(() => (props.state === 'error' ? '!' : '…'));
</script>

<style src="./u-validation-message.css"></style>
