<!--
@component UTimeLine
@lang zh-CN 提供调用方组合 time-line item 的有限纵向容器；不排序事件、不解析日期或拥有业务过程。
@lang en Provides a finite vertical container in which callers compose time-line items; it does not sort events, parse dates, or own a business process.
-->
<template>
  <!-- @lang zh-CN 容器只建立 list 语义与局部 slot，不从 child 收集状态或自动添加项目。
  @lang en The container establishes list semantics and a local slot only; it collects no child state and adds no item automatically.
  <lang><zh-CN>caller 决定项目顺序、文字、时间格式与任何领域筛选。</zh-CN><en>The caller decides item order, copy, time format, and every domain filter.</en></lang> -->
  <view class="u-time-line" role="list" :aria-label="ariaLabel || undefined"><slot /></view>
</template>

<script setup>
// <lang><zh-CN>稳定名称表示纯局部 timeline 容器，不建立全局事件流或日期服务。</zh-CN><en>The stable name represents a purely local timeline container and creates no global event stream or date service.</en></lang>
defineOptions({ name: 'u-time-line' });

// <lang><zh-CN>可访问名称由 caller 提供并本地化；空值不生成默认中英文字。</zh-CN><en>The accessible name is provided and localized by the caller; an empty value creates no default mixed-language copy.</en></lang>
defineProps({ ariaLabel: { type: String, default: '' } });
</script>

<style src="./u-time-line.css"></style>
