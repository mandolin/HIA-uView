<!--
@component UStack
@lang zh-CN 为 HIA-uView 私有 `mp-weixin` 配置提供受限 flex 布局原语；只排列默认插槽子项，不拥有页面、滚动、业务数据、导航或子项语义。
@lang en Provides a constrained flex-layout primitive for the private HIA-uView `mp-weixin` profile; it arranges default-slot children only and owns no page, scrolling, business data, navigation, or child semantics.
-->
<template>
  <!--
  @lang zh-CN 根容器只应用由受限 props 推导的布局类。
  @lang en The root applies layout classes derived only from constrained props.
  <lang><zh-CN>根容器只应用由受限 props 推导的布局类，让默认插槽子项保留其自身顺序与职责。</zh-CN><en>The root applies layout classes derived only from constrained props so default-slot children retain their own order and responsibilities.</en></lang>
  -->
  <view :class="stackClasses">
    <slot />
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>为本 SFC 声明稳定的 kebab-case 组件名，使直接导入和显式 plugin 注册使用同一模板名称。</zh-CN><en>Declares the stable kebab-case component name so direct imports and explicit plugin registration use the same template name.</en></lang>
defineOptions({
  name: 'u-stack'
});

// <lang><zh-CN>受限布局输入；枚举值映射到已审阅的 CSS 类，禁止将任意样式值或页面职责带入组件。</zh-CN><en>Constrained layout inputs; enum values map to reviewed CSS classes and keep arbitrary style values and page responsibilities outside the component.</en></lang>
const props = defineProps({
  // <lang><zh-CN>主轴方向只允许纵向或横向两个离散值，默认纵向以适配信息型小程序页面的常见阅读顺序。</zh-CN><en>Main-axis direction permits only vertical or horizontal discrete values; vertical is the default for the common reading order of information-oriented mini-program pages.</en></lang>
  direction: {
    type: String,
    default: 'vertical',
    validator: (value) => ['vertical', 'horizontal'].includes(value)
  },
  // <lang><zh-CN>间距只映射已审阅 token；none 用于调用方明确要求无间隙，而不接收任意 CSS 长度。</zh-CN><en>Gap maps to reviewed tokens only; none lets callers explicitly request no gap without accepting arbitrary CSS lengths.</en></lang>
  gap: {
    type: String,
    default: 'md',
    validator: (value) => ['none', 'sm', 'md', 'lg'].includes(value)
  },
  // <lang><zh-CN>交叉轴对齐保留 flex 的四个通用语义，不引入组件特定或页面特定位置值。</zh-CN><en>Cross-axis alignment retains four general flex semantics and introduces no component-specific or page-specific positional values.</en></lang>
  align: {
    type: String,
    default: 'stretch',
    validator: (value) => ['start', 'center', 'end', 'stretch'].includes(value)
  },
  // <lang><zh-CN>主轴分布限制为开始、居中、结束和两端分布，保持 fixture 可覆盖的有限布局集合。</zh-CN><en>Main-axis distribution is limited to start, center, end, and between, preserving a finite layout set that fixtures can cover.</en></lang>
  justify: {
    type: String,
    default: 'start',
    validator: (value) => ['start', 'center', 'end', 'between'].includes(value)
  },
  // <lang><zh-CN>换行是显式 opt-in；默认不改变子项在单行/单列中的连续阅读顺序。</zh-CN><en>Wrapping is explicit opt-in; by default it does not change the continuous reading order of children in one row/column.</en></lang>
  wrap: {
    type: Boolean,
    default: false
  }
});

// <lang><zh-CN>由当前受限 props 派生的完整 BEM 类集合；每个类只控制其对应 flex 维度，避免交叉覆盖或隐式页面样式。</zh-CN><en>The complete BEM class set derived from current constrained props; every class controls only its corresponding flex dimension to avoid cross-overrides or implicit page styles.</en></lang>
const stackClasses = computed(() => [
  'u-stack',
  `u-stack--${props.direction}`,
  `u-stack--gap-${props.gap}`,
  `u-stack--align-${props.align}`,
  `u-stack--justify-${props.justify}`,
  {
    'u-stack--wrap': props.wrap
  }
]);
</script>

<style src="./u-stack.css"></style>
