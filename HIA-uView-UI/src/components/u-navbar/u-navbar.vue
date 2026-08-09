<!--
@component UNavbar
@lang zh-CN 提供与 uView-family `u-navbar` 名称兼容的受控导航展示面：调用方拥有可见性、标题、两侧文字与实际导航；组件只 emit 左右点击意图，不读取系统栏、路由、权限或页面栈。
@lang en Provides a controlled navigation presentation surface under the uView-family `u-navbar` name: the caller owns visibility, title, side text, and actual navigation; the component emits left/right click intent only and reads no system bar, router, authorization, or page stack.
-->
<template>
  <!-- @lang zh-CN 受控模板呈现说明如下。
  @lang en Controlled template-presentation explanation follows.
  <lang><zh-CN>根栏只在调用方显式可见时呈现三列结构；它不推断当前页面或创建原生导航栏。</zh-CN><en>The root bar renders its three-column structure only when the caller explicitly makes it visible; it infers no current page and creates no native navigation bar.</en></lang> -->
  <view v-if="visible" class="u-navbar">
    <!-- @lang zh-CN 受控左侧结构说明如下。
    @lang en Controlled left-side structure explanation follows.
    <lang><zh-CN>左侧优先接受调用方插槽；缺少插槽时，只有非空 leftText 才形成带可见标签的本地 intent control。</zh-CN><en>The left side prioritizes a caller slot; without that slot, only non-empty leftText forms a local intent control with a visible label.</en></lang> -->
    <view class="u-navbar__side u-navbar__side--left">
      <slot name="left">
        <button v-if="hasLeftText" class="u-navbar__control" type="button" :disabled="disabled" @click="emitLeftClick"><text>{{ leftText }}</text></button>
      </slot>
    </view>

    <!-- @lang zh-CN 受控标题结构说明如下。
    @lang en Controlled title structure explanation follows.
    <lang><zh-CN>标题完全由调用方提供；空标题仍保留结构位置，但组件绝不生成业务或双语默认文案。</zh-CN><en>The caller fully provides the title; an empty title retains structural position, but the component never generates business or bilingual default copy.</en></lang> -->
    <!--
    @lang zh-CN 默认 slot 可替换中央标题投影；它不创建系统导航栏、返回栈、路由或页面身份。
    @lang en The default slot may replace central title projection; it creates no system navigation bar, back stack, router, or page identity.
    <lang><zh-CN>未提供 slot 时保持调用方 title 的既有文字展示，避免迁移入口改变已有页面。</zh-CN><en>When no slot is supplied, existing caller title text presentation remains, preventing the migration entry from changing existing pages.</en></lang>
    -->
    <view class="u-navbar__title"><slot><text>{{ title }}</text></slot></view>

    <!-- @lang zh-CN 受控右侧结构说明如下。
    @lang en Controlled right-side structure explanation follows.
    <lang><zh-CN>右侧与左侧遵守相同的 slot-first 与有标签 control 规则；它只报告 intent，不执行动作。</zh-CN><en>The right side follows the same slot-first and labeled-control rule as the left; it reports intent only and executes no action.</en></lang> -->
    <view class="u-navbar__side u-navbar__side--right">
      <slot name="right">
        <button v-if="hasRightText" class="u-navbar__control" type="button" :disabled="disabled" @click="emitRightClick"><text>{{ rightText }}</text></button>
      </slot>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定 kebab-case 名称与 manifest、easycom 和 explicit plugin registry 对齐；它不注册全局组件。</zh-CN><en>The stable kebab-case name aligns with the manifest, easycom, and explicit plugin registry; it registers no global component.</en></lang>
defineOptions({ name: 'u-navbar' });

// <lang><zh-CN>所有可见文本与 disabled 状态均由调用方拥有；组件不接收路径、系统栏或导航配置。</zh-CN><en>The caller owns every visible text value and disabled state; the component accepts no path, system-bar, or navigation configuration.</en></lang>
const props = defineProps({
  // <lang><zh-CN>显式可见性防止导航结构在未选择时自动出现。</zh-CN><en>Explicit visibility prevents navigation structure from appearing automatically when it has not been selected.</en></lang>
  visible: { type: Boolean, default: true },
  // <lang><zh-CN>页面标题由应用本地化；空默认值拒绝组件生成业务语言。</zh-CN><en>The application localizes the page title; an empty default refuses component-generated business language.</en></lang>
  title: { type: String, default: '' },
  // <lang><zh-CN>左侧内建 control 的 caller-owned 可见文字；空值不创建无标签按钮。</zh-CN><en>Caller-owned visible text for the built-in left control; an empty value creates no unlabeled button.</en></lang>
  leftText: { type: String, default: '' },
  // <lang><zh-CN>右侧内建 control 的 caller-owned 可见文字；空值不创建无标签按钮。</zh-CN><en>Caller-owned visible text for the built-in right control; an empty value creates no unlabeled button.</en></lang>
  rightText: { type: String, default: '' },
  // <lang><zh-CN>禁用状态仅抑制内建 control 的原生点击，不更改插槽内容或应用状态。</zh-CN><en>The disabled state suppresses native clicks on built-in controls only and changes neither slot content nor application state.</en></lang>
  disabled: { type: Boolean, default: false }
});

// <lang><zh-CN>两个事件只表达用户意图；调用方决定返回、路由、保存或任何副作用。</zh-CN><en>The two events express user intent only; the caller decides back navigation, routing, saving, or any side effect.</en></lang>
const emit = defineEmits(['left-click', 'right-click']);

// <lang><zh-CN>左侧 control 资格要求非空的可见文字，使触控入口对阅读者可发现。</zh-CN><en>Left-control eligibility requires non-empty visible text, keeping the touch entry discoverable to readers.</en></lang>
const hasLeftText = computed(() => props.leftText.trim().length > 0);

// <lang><zh-CN>右侧 control 资格与左侧对称，不从 title、slot 或业务状态猜测可执行动作。</zh-CN><en>Right-control eligibility is symmetric with the left and infers no executable action from title, slot, or business state.</en></lang>
const hasRightText = computed(() => props.rightText.trim().length > 0);

/**
 * @lang zh-CN 将内建左侧点击转发为无副作用 intent；本函数不调用 `uni.navigateBack` 或任何路由 API。
 * @lang en Forwards a built-in left click as side-effect-free intent; this function calls neither `uni.navigateBack` nor any router API.
 * @param {unknown} event <lang><zh-CN>平台提供的原始点击事件。</zh-CN><en>Original click event supplied by the platform.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `left-click`。</zh-CN><en>No return value; emits `left-click` when the guard passes.</en></lang>
 */
function emitLeftClick(event) {
  // <lang><zh-CN>没有可见/可用内建 control 时保持零事件，避免直接调用 handler 绕过展示边界。</zh-CN><en>Retain zero events when no visible and enabled built-in control exists, preventing direct handler calls from bypassing the presentation boundary.</en></lang>
  if (!props.visible || props.disabled || !hasLeftText.value) return;

  // <lang><zh-CN>保留原始事件给调用方，不在 UI 层解释为“返回”。</zh-CN><en>Preserve the original event for the caller and do not interpret it as “back” in the UI layer.</en></lang>
  emit('left-click', event);
}

/**
 * @lang zh-CN 将内建右侧点击转发为无副作用 intent；本函数不执行命令、请求或导航。
 * @lang en Forwards a built-in right click as side-effect-free intent; this function executes no command, request, or navigation.
 * @param {unknown} event <lang><zh-CN>平台提供的原始点击事件。</zh-CN><en>Original click event supplied by the platform.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `right-click`。</zh-CN><en>No return value; emits `right-click` when the guard passes.</en></lang>
 */
function emitRightClick(event) {
  // <lang><zh-CN>guard 与左侧相同，保证 disabled 或缺少文字时不会出现隐式动作。</zh-CN><en>The guard matches the left side, ensuring no implicit action appears while disabled or missing text.</en></lang>
  if (!props.visible || props.disabled || !hasRightText.value) return;

  // <lang><zh-CN>事件仅交还调用方；组件不改变自身 visible 或外部状态。</zh-CN><en>Return the event to the caller only; the component changes neither its own visible state nor external state.</en></lang>
  emit('right-click', event);
}
</script>

<style src="./u-navbar.css"></style>
