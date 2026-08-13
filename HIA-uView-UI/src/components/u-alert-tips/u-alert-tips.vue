<!--
@component UAlertTips
@lang zh-CN 呈现调用方控制的提示条并分别报告内容 click 与 close intent；不创建全局 toast、定时器或服务。
@lang en Presents a caller-controlled alert strip and reports body-click and close intents separately; it creates no global toast, timer, or service.
-->
<template>
  <!--
  @lang zh-CN 提示根只由调用方 `show` 控制投影，有限 type 仅选择本地 token class；组件不会因 click、close、计时或外部状态自行隐藏。
  @lang en The alert root projects only under caller-controlled `show`, while finite type selects a local token class only; click, close, timers, or external state never make the component hide itself.
  -->
  <view v-if="props.show" class="u-alert-tips" :class="`u-alert-tips--${safeType}`" role="status">
    <!--
    @lang zh-CN 内容区只报告无 payload click intent；title 与默认 slot/description fallback 均保持调用方拥有，不解释提示后的业务动作。
    @lang en The body reports payload-free click intent only; title and default-slot/description fallback remain caller-owned and the component interprets no business action after the alert.
    -->
    <view class="u-alert-tips__body" @click="handleBodyClick">
      <text v-if="props.title" class="u-alert-tips__title">{{ props.title }}</text>
      <!--
      @lang zh-CN 默认 slot 完整覆盖 description fallback，避免同时呈现两份正文；空 slot 时只投影调用方提供的 description。
      @lang en The default slot fully overrides the description fallback so two body copies never coexist; without a slot, only caller-supplied description is projected.
      -->
      <slot><text v-if="props.description" class="u-alert-tips__description">{{ props.description }}</text></slot>
    </view>
    <!--
    @lang zh-CN close control 只报告独立的无 payload close intent；`.stop` 阻止它被任何祖先内容交互误认为 body click。
    @lang en The close control reports only an independent payload-free close intent; `.stop` prevents any ancestor content interaction from mistaking it for a body click.
    -->
    <button v-if="props.closable" class="u-alert-tips__close" type="button" aria-label="Close / 关闭" @click.stop="handleClose">×</button>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>使用与迁移友好的 u- 名称；显示完全由调用方控制。</zh-CN><en>Uses a migration-friendly u- name; visibility remains fully caller-controlled.</en></lang>
defineOptions({ name: 'u-alert-tips' });

// <lang><zh-CN>提示只接收调用方可见文字、受控可见性、有限 type 与 close control 开关；不接收远程错误对象、任意样式、计时器或业务命令。</zh-CN><en>The alert accepts only caller-visible copy, controlled visibility, finite type, and a close-control flag; it accepts no remote error object, arbitrary style, timer, or business command.</en></lang>
const props = defineProps({
  // <lang><zh-CN>`show` 只决定当前实例是否投影；组件的 click/close handler 均不会写回该 prop。</zh-CN><en>`show` decides only whether this instance projects; neither click nor close handler writes the prop back.</en></lang>
  show: {
    type: Boolean,
    default: true
  },
  // <lang><zh-CN>`type` 是有限视觉语义候选，未知值由 `safeType` 回退而不进入原始 class。</zh-CN><en>`type` is a finite visual-semantic candidate; `safeType` falls unknown values back rather than placing them in a raw class.</en></lang>
  type: {
    type: String,
    default: 'primary'
  },
  // <lang><zh-CN>`title` 是调用方拥有的可选可见标题，空值不会生成隐式业务文案。</zh-CN><en>`title` is optional caller-owned visible heading copy; an empty value generates no implicit business copy.</en></lang>
  title: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>`description` 只在没有默认 slot 时成为正文 fallback；组件不解析 HTML、错误码或远程内容。</zh-CN><en>`description` becomes body fallback only without a default slot; the component parses no HTML, error code, or remote content.</en></lang>
  description: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>`closable` 只控制本地 close intent 按钮是否存在，不授权组件修改 show 或任何应用状态。</zh-CN><en>`closable` controls only whether the local close-intent button exists and never authorizes the component to mutate show or any application state.</en></lang>
  closable: {
    type: Boolean,
    default: false
  }
});

// <lang><zh-CN>两个公开事件均为无 payload 局部 intent；调用方在组件外决定导航、状态更新、日志与后续业务结果。</zh-CN><en>Both public events are payload-free local intents; the caller decides routing, state updates, logging, and subsequent business results outside the component.</en></lang>
const emit = defineEmits(['click', 'close']);

// <lang><zh-CN>允许的提示类型冻结为内部常量，防止运行时扩展或调用方字符串形成未审计 class。</zh-CN><en>The allowed alert types are frozen as an internal constant, preventing runtime extension or caller strings from forming unaudited classes.</en></lang>
const alertTypes = Object.freeze(['primary', 'success', 'warning', 'error']);

// <lang><zh-CN>未知 type 稳定回退 primary，使模板只消费已审计的 token 名称。</zh-CN><en>An unknown type stably falls back to primary so the template consumes only audited token names.</en></lang>
const safeType = computed(() => (alertTypes.includes(props.type) ? props.type : 'primary'));

/**
 * @lang zh-CN 报告内容区的无 payload click intent；不转发 DOM 事件，也不执行导航、关闭或业务动作。
 * @lang en Reports a payload-free click intent from the body; it forwards no DOM event and performs no routing, closing, or business action.
 * @returns {void} <lang><zh-CN>无返回值；只 emit `click`。</zh-CN><en>No return value; emits `click` only.</en></lang>
 */
function handleBodyClick() {
  // <lang><zh-CN>不携带底层事件或文字内容，保持公共 payload 与调用方平台实现解耦。</zh-CN><en>Supplies neither the underlying event nor copy content, keeping the public payload decoupled from the caller's platform implementation.</en></lang>
  emit('click');
}

/**
 * @lang zh-CN 只报告无 payload 关闭意图；是否隐藏由调用方更新 `show` 决定，且模板阻止该 click 向祖先传播。
 * @lang en Reports a payload-free close intent only; the caller decides whether to hide by updating `show`, and the template stops this click from propagating to ancestors.
 * @returns {void} <lang><zh-CN>无返回值；只 emit `close`。</zh-CN><en>No return value; emits `close` only.</en></lang>
 */
function handleClose() {
  // <lang><zh-CN>组件不写入 show、不启动计时器，也不把关闭解释为内容区 click。</zh-CN><en>The component writes no show state, starts no timer, and does not interpret close as a body click.</en></lang>
  emit('close');
}
</script>

<style src="./u-alert-tips.css"></style>
