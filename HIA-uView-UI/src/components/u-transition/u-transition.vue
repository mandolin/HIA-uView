<!--
@component UTransition
@lang zh-CN 提供带 visible/show 优先级的 caller-controlled 有限 CSS transition 包装面；调用方拥有可见性、mode、duration 与内容，组件不使用 JavaScript timer、测量、全局生命周期或异步动画服务。
@lang en Provides a caller-controlled finite CSS-transition wrapper with visible/show precedence; the caller owns visibility, mode, duration, and content, while the component uses no JavaScript timer, measurement, global lifecycle, or async animation service.
-->
<template>
  <!-- @lang zh-CN 受控模板呈现说明如下。
  @lang en Controlled template-presentation explanation follows.
  <lang><zh-CN>解析后的受控值直接控制 slot 是否在树中；class/style 只投影已规范化的 mode/duration。</zh-CN><en>The resolved controlled value directly controls whether the slot is in the tree; class/style project normalized mode/duration only.</en></lang> -->
  <view v-if="isVisible" :class="transitionClasses" :style="transitionStyle"><slot /></view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称供模板和 manifest 使用；它不模拟 upstream 的完整动画生命周期。</zh-CN><en>The stable name serves template and manifest use; it does not simulate an upstream complete animation lifecycle.</en></lang>
defineOptions({ name: 'u-transition' });

// <lang><zh-CN>有限 mode 集合避免任意 caller 字符串成为 CSS class；每个 mode 只是 CSS 呈现选择。</zh-CN><en>The finite mode set prevents arbitrary caller strings from becoming CSS classes; every mode is a CSS presentation choice only.</en></lang>
const supportedModes = Object.freeze(['fade', 'slide-up', 'slide-down', 'zoom']);

// <lang><zh-CN>调用方拥有可见性、mode 与 duration；visible 明确值优先于 show，duration 单位为毫秒，0 允许关闭 CSS transition。</zh-CN><en>The caller owns visibility, mode, and duration; an explicit visible value precedes show, duration is milliseconds, and zero permits disabling CSS transition.</en></lang>
const props = defineProps({
  // <lang><zh-CN>undefined 表示调用方省略 HIA 入口，只有此时才读取迁移别名 show。</zh-CN><en>Undefined means the caller omitted the HIA entry, and only then is the show migration alias read.</en></lang>
  visible: { type: Boolean, default: undefined },
  // <lang><zh-CN>show 只作为受控布尔别名，不启动 JavaScript 动画或计时器。</zh-CN><en>Show serves only as a controlled Boolean alias and starts no JavaScript animation or timer.</en></lang>
  show: { type: Boolean, default: false },
  // <lang><zh-CN>mode 只选择四种有限 CSS 呈现 class；当前不承诺完整 enter/leave lifecycle。</zh-CN><en>Mode selects only four finite CSS presentation classes; it currently promises no complete enter/leave lifecycle.</en></lang>
  mode: { type: String, default: 'fade' },
  // <lang><zh-CN>duration 以毫秒输入并收束为 0–1000 的整数，只投影到组件私有 CSS property。</zh-CN><en>Duration is supplied in milliseconds, constrained to an integer from 0–1000, and projected only into a component-private CSS property.</en></lang>
  duration: { type: Number, default: 180 }
});

// <lang><zh-CN>显式 visible 决定本地树；省略时才回退 show，避免冲突输入改变既有优先级。</zh-CN><en>Explicit visible determines the local tree; only omission falls back to show, preventing conflicting input from changing existing precedence.</en></lang>
const isVisible = computed(() => props.visible ?? props.show);

// <lang><zh-CN>未知 mode 回退 fade，保持 class 受限。</zh-CN><en>An unknown mode falls back to fade, keeping classes constrained.</en></lang>
const safeMode = computed(() => supportedModes.includes(props.mode) ? props.mode : 'fade');

// <lang><zh-CN>duration 只允许 0–1000ms 的有限整数，避免无界 CSS inline 值。</zh-CN><en>Duration permits a finite integer of 0–1000ms only, preventing unbounded CSS inline values.</en></lang>
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.round(Math.min(1000, Math.max(0, props.duration))) : 180);

// <lang><zh-CN>class 仅组合固定命名空间及规范化 mode。</zh-CN><en>Classes combine only the fixed namespace and normalized mode.</en></lang>
const transitionClasses = computed(() => ['u-transition', `u-transition--${safeMode.value}`]);

// <lang><zh-CN>动态 style 仅传递私有 duration property，CSS 保留真正的 transition 声明。</zh-CN><en>Dynamic style passes a private duration property only; CSS retains the actual transition declaration.</en></lang>
const transitionStyle = computed(() => ({ '--u-transition-duration': `${safeDuration.value}ms` }));
</script>

<style src="./u-transition.css"></style>
