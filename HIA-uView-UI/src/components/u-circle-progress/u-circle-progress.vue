<!--
@component UCircleProgress
@lang zh-CN 呈现调用方提供的有限数值、最大值和标签的圆形进度投影；不解释任务、不启动动画或计时器，也不使用 Canvas。
@lang en Presents a circular progress projection of caller-provided finite value, maximum, and label; it interprets no task, starts no animation or timer, and uses no Canvas.
-->
<template>
  <!-- @lang zh-CN 受控圆环只使用规范化百分比与调用方文字；CSS 可在支持 conic-gradient 的 target 绘制弧线，不支持时仍保留数值圆环与可读标签。
  @lang en The controlled ring uses only normalized percentage and caller copy; CSS may draw an arc on targets supporting conic-gradient, while unsupported targets retain the numeric ring and readable label.
  <lang><zh-CN>role 与数值属性补充非颜色进度信息；它们不代表真实任务生命周期或上传状态。</zh-CN><en>Role and numeric attributes supplement non-color progress information; they represent no real task lifecycle or upload state.</en></lang> -->
  <view :class="rootClasses" :style="ringStyle" role="progressbar" :aria-valuenow="safeValue" aria-valuemin="0" :aria-valuemax="safeMaximum">
    <view class="u-circle-progress__content"><text class="u-circle-progress__value">{{ safePercent }}%</text><text v-if="label" class="u-circle-progress__label">{{ label }}</text><slot :value="safeValue" :max="safeMaximum" :percent="safePercent" /></view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称保留 uView 迁移入口；组件只投影数值，绝不把数值写回 caller。</zh-CN><en>The stable name retains a uView migration entry; the component projects numbers only and never writes a value back to the caller.</en></lang>
defineOptions({ name: 'u-circle-progress' });

// <lang><zh-CN>有限 tone 与 size 约束 class/token 表面；label 由应用本地化，不生成默认业务文字。</zh-CN><en>Finite tone and size constrain the class/token surface; label is localized by the application and creates no default business copy.</en></lang>
const props = defineProps({ value: { type: [Number, String], default: 0 }, max: { type: [Number, String], default: 100 }, label: { type: String, default: '' }, tone: { type: String, default: 'primary' }, size: { type: String, default: 'medium' } });

// <lang><zh-CN>支持集合阻止任意调用方文字成为未经审阅的 CSS class。</zh-CN><en>Support sets prevent arbitrary caller strings from becoming unreviewed CSS classes.</en></lang>
const supportedTones = Object.freeze(['neutral', 'primary', 'accent']);
const supportedSizes = Object.freeze(['small', 'medium', 'large']);

// <lang><zh-CN>最大值必须是大于零的有限数；非法输入回退 100，以使分母稳定且无除零路径。</zh-CN><en>Maximum must be a finite number greater than zero; invalid input falls back to 100 so the denominator stays stable with no division-by-zero path.</en></lang>
const safeMaximum = computed(() => {
  // <lang><zh-CN>数值化允许调用方传入受控字符串，同时不接受 NaN 或无限值。</zh-CN><en>Number conversion permits caller-controlled strings while rejecting NaN and infinite values.</en></lang>
  const candidate = Number(props.max);
  return Number.isFinite(candidate) && candidate > 0 ? candidate : 100;
});

// <lang><zh-CN>当前值限制在零与规范化最大值之间；组件不判断负值或超额值属于何种业务错误。</zh-CN><en>The current value is clamped between zero and normalized maximum; the component does not judge what business error a negative or excessive value represents.</en></lang>
const safeValue = computed(() => {
  // <lang><zh-CN>候选值只服务于本次渲染，不保存、请求或向外传播。</zh-CN><en>The candidate serves this render only and is neither persisted, requested, nor propagated outward.</en></lang>
  const candidate = Number(props.value);
  return Number.isFinite(candidate) ? Math.min(safeMaximum.value, Math.max(0, candidate)) : 0;
});

// <lang><zh-CN>百分比使用四舍五入的整数，使数字文本、ARIA 数值和 CSS 弧线共享同一有限投影。</zh-CN><en>Percentage uses a rounded integer so numeric text, ARIA values, and the CSS arc share one finite projection.</en></lang>
const safePercent = computed(() => Math.round((safeValue.value / safeMaximum.value) * 100));

// <lang><zh-CN>根 class 只连接固定命名空间与已规范化的 tone/size。</zh-CN><en>Root classes connect only the fixed namespace and normalized tone/size.</en></lang>
const rootClasses = computed(() => ['u-circle-progress', `u-circle-progress--${supportedTones.includes(props.tone) ? props.tone : 'primary'}`, `u-circle-progress--${supportedSizes.includes(props.size) ? props.size : 'medium'}`]);

// <lang><zh-CN>内联 CSS 变量只传递已计算的百分比给局部样式；不读取 target capability 或测量布局。</zh-CN><en>The inline CSS variable passes only calculated percentage to local styles; it reads no target capability and measures no layout.</en></lang>
const ringStyle = computed(() => ({ '--u-circle-progress-value': `${safePercent.value}%` }));
</script>

<style src="./u-circle-progress.css"></style>
