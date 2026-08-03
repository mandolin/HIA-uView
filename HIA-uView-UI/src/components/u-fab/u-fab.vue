<!--
@component UFab
@lang zh-CN 提供受控、带文字的局部 floating-action control；调用方拥有可见性、位置、禁用状态和业务动作，组件不拖拽、不展开菜单、不执行命令。
@lang en Provides a controlled, labeled local floating-action control; the caller owns visibility, position, disabled state, and business action, while the component does not drag, expand a menu, or execute a command.
-->
<template>
  <!-- @lang zh-CN 受控模板呈现说明如下。
  @lang en Controlled template-presentation explanation follows.
  <lang><zh-CN>FAB 只有具备 caller label 时才能输出；position 先在计算层规范化为有限 class。</zh-CN><en>The FAB can output only with a caller label; position is normalized to a finite class in computed state first.</en></lang> -->
  <button v-if="isRenderable" :class="fabClasses" type="button" :disabled="disabled" @click="emitClick"><text>{{ label }}</text></button>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称对应 manifest 与 explicit plugin；组件不安装任何全局浮动层。</zh-CN><en>The stable name corresponds to manifest and explicit plugin; the component installs no global floating layer.</en></lang>
defineOptions({ name: 'u-fab' });

// <lang><zh-CN>允许的局部位置只影响 CSS class；它不是 screen coordinate、safe-area 或固定平台层级 API。</zh-CN><en>Allowed local positions affect CSS classes only; they are not screen-coordinate, safe-area, or fixed platform-layer APIs.</en></lang>
const supportedPositions = Object.freeze(['bottom-right', 'bottom-left', 'top-right', 'top-left']);

// <lang><zh-CN>调用方拥有可见性、文字、有限位置和 disabled；空文字不创建无标签 action。</zh-CN><en>The caller owns visibility, text, finite position, and disabled state; empty text creates no unlabeled action.</en></lang>
const props = defineProps({ visible: { type: Boolean, default: false }, label: { type: String, default: '' }, position: { type: String, default: 'bottom-right' }, disabled: { type: Boolean, default: false } });

// <lang><zh-CN>click 只把 local intent 交给应用；组件不解释为新建、保存、预约或导航。</zh-CN><en>Click hands local intent to the application only; the component does not interpret it as create, save, booking, or navigation.</en></lang>
const emit = defineEmits(['click']);

// <lang><zh-CN>未知位置回退到 bottom-right，避免任意字符串变成 CSS class 或布局注入。</zh-CN><en>An unknown position falls back to bottom-right, preventing arbitrary strings from becoming CSS classes or layout injection.</en></lang>
const safePosition = computed(() => supportedPositions.includes(props.position) ? props.position : 'bottom-right');

// <lang><zh-CN>根 class 只由固定命名空间和已规范化位置构成。</zh-CN><en>Root classes consist only of the fixed namespace and normalized position.</en></lang>
const fabClasses = computed(() => ['u-fab', `u-fab--${safePosition.value}`]);

// <lang><zh-CN>可渲染性要求 caller 选择 visible 与非空可读文字。</zh-CN><en>Renderability requires caller-selected visibility and non-empty readable text.</en></lang>
const isRenderable = computed(() => props.visible && props.label.trim().length > 0);

/**
 * @lang zh-CN 报告 FAB 的单次 click intent；本函数不修改 visible、不启动 menu 或执行业务动作。
 * @lang en Reports one FAB click intent; this function writes no visible state, starts no menu, and executes no business action.
 * @param {unknown} event <lang><zh-CN>原始平台点击事件。</zh-CN><en>Original platform click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `click`。</zh-CN><en>No return value; emits `click` when the guard passes.</en></lang>
 */
function emitClick(event) {
  // <lang><zh-CN>guard 保证 disabled 或不可见时的直接调用仍不会变成隐藏业务入口。</zh-CN><en>The guard ensures direct calls while disabled or invisible cannot become a hidden business entry.</en></lang>
  if (!isRenderable.value || props.disabled) return;

  // <lang><zh-CN>事件原样交回调用方；UI 不维护 action 结果或上下文。</zh-CN><en>Return the event unchanged to the caller; UI maintains no action result or context.</en></lang>
  emit('click', event);
}
</script>

<style src="./u-fab.css"></style>
