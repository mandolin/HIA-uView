<!--
@component UNavBar
@lang zh-CN 为 HIA-uView 私有 `mp-weixin` 配置提供标题和文本控制项的展示型导航栏；它只 emit 返回/操作意图，不读取系统栏或执行路由、权限与原生导航。
@lang en Provides a presentation-only navigation bar with a title and text controls for the private HIA-uView `mp-weixin` profile; it emits back/action intent only and neither reads system bars nor performs routing, permissions, or native navigation.
-->
<template>
  <!--
  @lang zh-CN 根栏只负责三列展示布局。
  @lang en The root bar owns a three-column presentation layout only.
  <lang><zh-CN>根栏只负责三列展示布局；它不声明页面、路由或系统栏状态。</zh-CN><en>The root bar owns a three-column presentation layout only; it declares no page, route, or system-bar state.</en></lang>
  -->
  <view class="u-nav-bar">
    <!--
    @lang zh-CN 左侧优先交给调用方插槽。
    @lang en The left side prioritizes the caller slot.
    <lang><zh-CN>左侧优先交给调用方插槽；仅在插槽缺失且可见文字存在时提供受限的内建返回按钮。</zh-CN><en>The left side prioritizes the caller slot; it provides the constrained built-in back button only when the slot is absent and visible text exists.</en></lang>
    -->
    <view class="u-nav-bar__side u-nav-bar__side--left">
      <slot name="left">
        <button
          v-if="shouldRenderBack"
          class="u-nav-bar__control"
          @click="emitBack"
        >
          <text>{{ backText }}</text>
        </button>
      </slot>
    </view>

    <!--
    @lang zh-CN 标题始终是调用方提供的可见文本。
    @lang en The title is always caller-provided visible text.
    <lang><zh-CN>标题始终是调用方提供的可见文本；组件不生成页面文案或本地化回退。</zh-CN><en>The title is always caller-provided visible text; the component generates neither page copy nor a localization fallback.</en></lang>
    -->
    <text class="u-nav-bar__title">{{ title }}</text>

    <!--
    @lang zh-CN 右侧遵循与左侧相同的插槽优先规则。
    @lang en The right side follows the same slot-first rule as the left.
    <lang><zh-CN>右侧遵循与左侧相同的插槽优先规则；空 actionText 不创建无标签的可点击控件。</zh-CN><en>The right side follows the same slot-first rule as the left; an empty actionText never creates an unlabeled clickable control.</en></lang>
    -->
    <view class="u-nav-bar__side u-nav-bar__side--right">
      <slot name="right">
        <button
          v-if="shouldRenderAction"
          class="u-nav-bar__control"
          @click="emitAction"
        >
          <text>{{ actionText }}</text>
        </button>
      </slot>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>声明稳定的 kebab-case 组件名，使模板、manifest 与显式 plugin registry 使用同一公开运行时名称。</zh-CN><en>Declares the stable kebab-case component name so templates, the manifest, and the explicit plugin registry use the same public runtime name.</en></lang>
defineOptions({
  name: 'u-nav-bar'
});

// <lang><zh-CN>调用方拥有的可见文本与内建 control 开关；不接受 route、path、状态栏或原生导航参数。</zh-CN><en>Caller-owned visible text and built-in control switches; no route, path, system-bar, or native-navigation parameters are accepted.</en></lang>
const props = defineProps({
  // <lang><zh-CN>页面标题由应用提供；空默认值避免组件擅自生成业务标题或 locale 回退。</zh-CN><en>The application supplies the page title; an empty default prevents the component from inventing business title or locale fallback.</en></lang>
  title: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>内建返回 control 必须由调用方显式启用，避免展示组件把任何页面都假设为可返回。</zh-CN><en>The built-in back control requires explicit caller opt-in, preventing the presentation component from assuming every page can navigate back.</en></lang>
  showBack: {
    type: Boolean,
    default: false
  },
  // <lang><zh-CN>返回标签归调用方所有；与 showBack 一起决定是否可以渲染带可见文字的内建 control。</zh-CN><en>The caller owns the back label; together with showBack it determines whether a built-in control with visible text can render.</en></lang>
  backText: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>右侧操作标签归调用方所有；空值明确表示没有内建 action，而非使用默认业务文案。</zh-CN><en>The caller owns the right-action label; an empty value explicitly means no built-in action rather than using default business copy.</en></lang>
  actionText: {
    type: String,
    default: ''
  }
});

// <lang><zh-CN>仅公开两个无副作用的意图事件；应用决定实际导航、权限、状态栏和错误处置。</zh-CN><en>Exposes only two side-effect-free intent events; the application decides actual navigation, permissions, system bars, and error handling.</en></lang>
const emit = defineEmits(['back', 'action']);

// <lang><zh-CN>内建返回 control 的可见性；同时要求调用方显式选择显示并提供非空可见标签，避免图标或无标签按钮。</zh-CN><en>Visibility of the built-in back control; it requires both an explicit caller opt-in and a non-empty visible label, avoiding icons or unlabeled buttons.</en></lang>
const shouldRenderBack = computed(() => (
  props.showBack
  && typeof props.backText === 'string'
  && props.backText.trim().length > 0
));

// <lang><zh-CN>内建操作 control 的可见性；空字符串表示调用方没有请求操作，而不是生成默认业务文案。</zh-CN><en>Visibility of the built-in action control; an empty string means the caller requested no action, rather than causing generated default business copy.</en></lang>
const shouldRenderAction = computed(() => (
  typeof props.actionText === 'string'
  && props.actionText.trim().length > 0
));

/**
 * @lang zh-CN 转发原生按钮事件为纯返回意图；本函数不读取路由、不调用 `uni.navigate*`，也不改变组件外部状态。
 * @lang en Forwards the native button event as pure back intent; this function reads no route, calls no `uni.navigate*`, and changes no state outside the component.
 * @param {Event} event <lang><zh-CN>内建返回按钮提供的平台事件。</zh-CN><en>Platform event supplied by the built-in back button.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；意图通过 `back` 事件交给应用。</zh-CN><en>No return value; intent is handed to the application through the `back` event.</en></lang>
 */
function emitBack(event) {
  // <lang><zh-CN>保留原始平台事件，使应用能够在自身边界内决定后续处理。</zh-CN><en>Preserves the original platform event so the application can decide subsequent handling inside its own boundary.</en></lang>
  emit('back', event);
}

/**
 * @lang zh-CN 转发原生按钮事件为纯右侧操作意图；本函数不执行网络、业务命令或导航。
 * @lang en Forwards the native button event as pure right-action intent; this function executes no network activity, business command, or navigation.
 * @param {Event} event <lang><zh-CN>内建右侧操作按钮提供的平台事件。</zh-CN><en>Platform event supplied by the built-in right-action button.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；意图通过 `action` 事件交给应用。</zh-CN><en>No return value; intent is handed to the application through the `action` event.</en></lang>
 */
function emitAction(event) {
  // <lang><zh-CN>保留原始平台事件，不在 UI 层推断业务含义或执行副作用。</zh-CN><en>Preserves the original platform event and does not infer business meaning or perform side effects in the UI layer.</en></lang>
  emit('action', event);
}
</script>

<style src="./u-nav-bar.css"></style>
