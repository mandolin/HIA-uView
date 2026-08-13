<!--
@component UEmpty
@lang zh-CN 为 HIA-uView 私有 `mp-weixin` 配置提供静态空数据展示；它呈现调用方标题、说明和可选 action 意图，不读取数据、不推断加载、分页或重试，也不生成插图、图标或业务文案。
@lang en Provides static empty-data presentation for the private HIA-uView `mp-weixin` profile; it presents caller title, description, and optional action intent without reading data, inferring loading, paging, or retry, or generating illustration, icon, or business copy.
-->
<template>
  <!--
  @lang zh-CN 空态根提供局部文字优先结构。
  @lang en The empty-state root provides local text-first structure.
  <lang><zh-CN>父级决定是否渲染本组件；根不接收 data、loading、scroll 或页面级条件，避免把展示误解为数据事实。</zh-CN><en>The parent decides whether to render this component; the root accepts no data, loading, scroll, or page-level condition, avoiding presentation being mistaken for a data fact.</en></lang>
  -->
  <view v-if="show" class="u-empty">
    <!--
    @lang zh-CN 可选图片只投影调用方已批准的 `src`，并复用独立 UImage 的有限原生呈现边界。
    @lang en The optional image projects only caller-approved `src` and reuses UImage's bounded native-presentation boundary.
    <lang><zh-CN>本组件不取得远程来源信任、缓存、下载或 fallback 资产职责；空 `src` 不渲染任何图片节点。</zh-CN><en>This component acquires no remote-source trust, caching, downloading, or fallback-asset responsibility; an empty `src` renders no image node.</en></lang>
    -->
    <UImage v-if="src" class="u-empty__image" :src="src" :alt="resolvedDescription || title" />
    <text v-if="title" class="u-empty__title">{{ title }}</text>
    <text v-if="resolvedDescription" class="u-empty__description">{{ resolvedDescription }}</text>

    <!--
    @lang zh-CN action control 仅在调用方提供可见文字时出现。
    @lang en The action control appears only when the caller provides visible text.
    <lang><zh-CN>action 只 emit 本地意图，不发起请求、重试、导航或数据修改；应用决定下一空态或列表状态。</zh-CN><en>Action emits local intent only and starts no request, retry, route, or data mutation; the application decides the next empty or list state.</en></lang>
    -->
    <UButton
      v-if="hasActionControl"
      class="u-empty__action"
      :label="actionText"
      @click="handleAction"
    />

    <!--
    @lang zh-CN bottom slot 在内建 action 之后原样投影调用方补充内容。
    @lang en The bottom slot projects caller supplementary content unchanged after the built-in action.
    <lang><zh-CN>slot 不参与 action guard，不捕获其事件，也不被解释为重试、分页、路由或下一状态；没有 slot 时不会生成空包装节点。</zh-CN><en>The slot participates in no action guard, captures none of its events, and is not interpreted as retry, paging, routing, or a next state; when absent it creates no empty wrapper node.</en></lang>
    -->
    <slot name="bottom" />
  </view>
</template>

<script setup>
import { computed } from 'vue';
import UButton from '../u-button/u-button.vue';
import UImage from '../u-image/u-image.vue';

// <lang><zh-CN>声明稳定的 kebab-case 组件名，使模板、manifest 与显式 plugin registry 使用同一运行时名称。</zh-CN><en>Declares the stable kebab-case component name so templates, the manifest, and the explicit plugin registry use one runtime name.</en></lang>
defineOptions({
  name: 'u-empty'
});

// <lang><zh-CN>空态只接收调用方可见文字和可选 action 标签；它不接收数据数组、加载/分页、插图、请求或业务状态。</zh-CN><en>The empty state accepts only caller-visible text and optional action label; it accepts no data array, loading/paging, illustration, request, or business state.</en></lang>
const props = defineProps({
  // <lang><zh-CN>`show` 只控制当前空态根是否投影；父级仍拥有数据判断、加载完成和页面状态转换。</zh-CN><en>`show` controls only whether the current empty-state root is projected; the parent still owns data decisions, loading completion, and page-state transitions.</en></lang>
  show: {
    type: Boolean,
    default: true
  },
  // <lang><zh-CN>`src` 是可选调用方图片来源；组件只把它交给 UImage，不请求、验证、缓存或替换该来源。</zh-CN><en>`src` is an optional caller image source; the component passes it only to UImage and does not request, validate, cache, or replace it.</en></lang>
  src: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>标题是调用方主要空态文字；空默认值避免组件产生默认“暂无数据”类运行时文案。</zh-CN><en>The title is caller primary empty-state text; an empty default prevents the component from generating default runtime copy such as “no data”.</en></lang>
  title: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>说明是可选调用方次级文字；组件不把它解释为 loading、失败或授权信息。</zh-CN><en>The description is optional caller secondary text; the component does not interpret it as loading, failure, or authorization information.</en></lang>
  description: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>`text` 是迁移用次级文字；仅在 HIA `description` 为空时显示，避免破坏既有调用方对 description 的优先级。</zh-CN><en>`text` is migration secondary copy; it renders only when HIA `description` is empty, avoiding disruption to existing caller precedence for description.</en></lang>
  text: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>action 标签决定 action control 是否存在；空值不生成无标签按钮或隐式数据操作。</zh-CN><en>The action label decides whether an action control exists; an empty value produces no unlabeled button or implicit data operation.</en></lang>
  actionText: {
    type: String,
    default: ''
  }
});

// <lang><zh-CN>唯一公开事件只报告调用方选择的空态 action 意图；应用在组件外拥有请求、重试、路由和数据状态转换。</zh-CN><en>The sole public event reports only caller-selected empty-state action intent; the application owns request, retry, route, and data-state transition outside the component.</en></lang>
const emit = defineEmits(['action']);

// <lang><zh-CN>action control 可见性只由非空调用方文字导出，不根据 title、description 或数据猜测下一步操作。</zh-CN><en>Action-control visibility derives only from non-empty caller text and does not infer next action from title, description, or data.</en></lang>
const hasActionControl = computed(() => props.actionText.length > 0);

// <lang><zh-CN>次级可见文字优先保持 HIA `description`，然后才使用迁移 `text`；它不解释文本为错误、加载或业务状态。</zh-CN><en>Secondary visible copy preserves HIA `description` first and uses migration `text` only afterward; it does not interpret either text as error, loading, or business state.</en></lang>
const resolvedDescription = computed(() => props.description || props.text);

/**
 * @lang zh-CN 仅在 action control 有文字时转发 action 意图；本函数不请求、重试、导航、写数据或改变空态显示。
 * @lang en Forwards action intent only when action control has text; this function does not request, retry, route, write data, or change empty-state display.
 * @param {unknown} event <lang><zh-CN>内建 UButton 提供的原始本地点击事件。</zh-CN><en>Original local click event supplied by the built-in UButton.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合条件时 emit `action`。</zh-CN><en>No return value; when eligible, emits `action`.</en></lang>
 */
function handleAction(event) {
  // <lang><zh-CN>guard 使缺失 action 标签时的直接 handler 调用也保持零事件和零数据副作用。</zh-CN><en>The guard keeps direct handler calls with missing action label at zero events and zero data side effects.</en></lang>
  if (!hasActionControl.value) {
    return;
  }

  // <lang><zh-CN>保留原始 local event 给应用，组件不决定 action 的业务含义或后续渲染。</zh-CN><en>Preserves the original local event for the application; the component decides neither action business meaning nor subsequent rendering.</en></lang>
  emit('action', event);
}
</script>

<style src="./u-empty.css"></style>
