<!--
@component UCellGroup
@lang zh-CN 提供信息行的局部容器和标题；不注册 cell、不拥有表单或提交生命周期。
@lang en Provides a local information-row container and title; it registers no cells and owns no form or submission lifecycle.
-->
<template>
  <!--
  @lang zh-CN 分组根只应用调用方声明的边界外观，并保留默认 slot 的原始所有权。
  @lang en The group root only applies caller-declared boundary presentation and preserves original ownership of the default slot.
  <lang><zh-CN>该容器不扫描、注册或排序 cell，也不把 slot 内容转换为表单、记录或选择状态。</zh-CN><en>The container neither scans, registers, nor orders cells, and it never converts slot content into form, record, or selection state.</en></lang>
  -->
  <view class="u-cell-group" :class="{ 'u-cell-group--bordered': props.bordered }">
    <!--
    @lang zh-CN 非空 title 作为调用方提供的局部分组标题呈现。
    @lang en A nonempty title is presented as the caller-provided local group heading.
    <lang><zh-CN>空 title 不生成默认业务文案或无内容标题节点。</zh-CN><en>An empty title produces neither default business copy nor an empty heading node.</en></lang>
    -->
    <text v-if="props.title" class="u-cell-group__title">{{ props.title }}</text>

    <!--
    @lang zh-CN 默认 slot 原样承载调用方列表内容。
    @lang en The default slot carries caller list content unchanged.
    <lang><zh-CN>分组不向子项注入 index、value、disabled、路由或父级 registry。</zh-CN><en>The group injects no index, value, disabled state, route, or parent registry into children.</en></lang>
    -->
    <slot />
  </view>
</template>

<script setup>
// <lang><zh-CN>保持 u- 命名，分组只负责结构呈现。</zh-CN><en>Retains the u- naming while the group remains structural presentation only.</en></lang>
defineOptions({
  name: 'u-cell-group'
});

// <lang><zh-CN>标题和边界是调用方声明的局部展示输入；组件不接收列表数据、选中值、表单模型或业务命令。</zh-CN><en>Title and boundary are caller-declared local presentation inputs; the component accepts no list data, selected value, form model, or business command.</en></lang>
const props = defineProps({
  // <lang><zh-CN>标题只在非空时显示；空默认值避免框架生成领域分组名称。</zh-CN><en>The title renders only while nonempty; the empty default prevents the framework from generating a domain group name.</en></lang>
  title: {
    type: String,
    default: ''
  },
  // <lang><zh-CN>边界开关只选择现有 token 化容器 class，不改变 slot、子项或父级布局。</zh-CN><en>The boundary switch selects only the existing tokenized container class and changes neither slots, children, nor parent layout.</en></lang>
  bordered: {
    type: Boolean,
    default: true
  }
});
</script>

<style src="./u-cell-group.css"></style>
