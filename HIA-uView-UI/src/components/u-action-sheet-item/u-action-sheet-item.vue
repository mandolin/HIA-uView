<!--
@component UActionSheetItem
@lang zh-CN 提供调用方拥有文本、说明和值的受控 action-sheet item；组件只呈现一个可发现的本地 click intent，不注入父级、不关闭 sheet，也不执行命令。
@lang en Provides a controlled action-sheet item with caller-owned text, description, and value; the component presents one discoverable local click intent only, injects no parent, closes no sheet, and executes no command.
-->
<template>
  <!-- @lang zh-CN 只有 caller 声明可见且存在可读文字或默认 slot 时才输出原生 button，避免无标签操作入口。
  @lang en Outputs a native button only when the caller declares visibility and supplies readable text or a default slot, avoiding an unlabeled action entry.
  <lang><zh-CN>item 不读取 action sheet context；slot 优先于内建文本，click 仍只表达调用方定义的意图。</zh-CN><en>The item reads no action-sheet context; slot takes precedence over built-in text and click still expresses only caller-defined intent.</en></lang>
  -->
  <button v-if="isRenderable" :class="itemClasses" type="button" :disabled="disabled" @click="emitClick">
    <slot><text class="u-action-sheet-item__text">{{ safeText }}</text><text v-if="safeDescription" class="u-action-sheet-item__description">{{ safeDescription }}</text></slot>
  </button>
</template>

<script setup>
import { computed, useSlots } from 'vue';

// <lang><zh-CN>稳定名称对应独立 migration surface；它不替代既有 UActionSheet 的 items API。</zh-CN><en>The stable name corresponds to an independent migration surface; it does not replace the existing UActionSheet items API.</en></lang>
defineOptions({ name: 'u-action-sheet-item' });

// <lang><zh-CN>默认 slot 资格用于避免空原生按钮；slot 内容和业务文案始终由调用方拥有。</zh-CN><en>Default-slot eligibility avoids an empty native button; slot content and business copy always belong to the caller.</en></lang>
const slots = useSlots();

// <lang><zh-CN>调用方拥有可见性、文字、值和 disabled；组件不接收父级索引、close policy 或异步命令配置。</zh-CN><en>The caller owns visibility, copy, value, and disabled state; the component accepts no parent index, close policy, or async-command configuration.</en></lang>
const props = defineProps({
  // <lang><zh-CN>可见性默认开启，仍须结合可读 text 或 slot 才输出控制项。</zh-CN><en>Visibility defaults to enabled but still requires readable text or a slot before outputting a control.</en></lang>
  visible: { type: Boolean, default: true },
  // <lang><zh-CN>主文字无默认语言；空值不生成组件业务文案。</zh-CN><en>Primary copy has no default language; an empty value generates no component business copy.</en></lang>
  text: { type: String, default: '' },
  // <lang><zh-CN>可选说明由调用方本地化；它不表示校验、权限或异步状态。</zh-CN><en>Optional description is localized by the caller; it represents no validation, authorization, or async state.</en></lang>
  description: { type: String, default: '' },
  // <lang><zh-CN>value 原样回传给调用方，不序列化为 URL、命令或领域对象。</zh-CN><en>Value returns unchanged to the caller and is not serialized as a URL, command, or domain object.</en></lang>
  value: { default: null },
  // <lang><zh-CN>禁用同时作用于原生 button 与 handler guard。</zh-CN><en>Disabled applies to both the native button and the handler guard.</en></lang>
  disabled: { type: Boolean, default: false }
});

// <lang><zh-CN>click 只报告局部 item 意图；调用方决定 sheet 可见性和后续动作。</zh-CN><en>Click reports local item intent only; the caller decides sheet visibility and follow-up action.</en></lang>
const emit = defineEmits(['click']);

// <lang><zh-CN>固定状态类避免把调用方字符串拼接为 CSS class。</zh-CN><en>Fixed state classes avoid concatenating caller strings into CSS classes.</en></lang>
const itemClasses = computed(() => ['u-action-sheet-item', { 'u-action-sheet-item--disabled': props.disabled }]);

// <lang><zh-CN>只接受明确字符串作为组件默认文字，防止不匹配 prop 在可发现性判断中被隐式对象化。</zh-CN><en>Accepts only explicit strings as component default copy, preventing mismatched props from being implicitly objectified in discoverability checks.</en></lang>
const safeText = computed(() => typeof props.text === 'string' ? props.text : '');

// <lang><zh-CN>说明与主文字采用相同收束规则；调用方仍可用 default slot 完全替代内建文字。</zh-CN><en>Description uses the same constraint rule as primary copy; callers may still fully replace built-in copy with the default slot.</en></lang>
const safeDescription = computed(() => typeof props.description === 'string' ? props.description : '');

// <lang><zh-CN>输出资格要求明确可见且有 slot 或非空主文字，保障最小可发现性。</zh-CN><en>Output eligibility requires explicit visibility plus a slot or non-empty primary copy, preserving minimum discoverability.</en></lang>
const isRenderable = computed(() => props.visible && (Boolean(slots.default) || safeText.value.trim().length > 0));

/**
 * @lang zh-CN 在可见、可用且有可发现内容时回传 value 与原始事件；不关闭任何父级 overlay 或执行 item 语义。
 * @lang en Returns value and original event when visible, enabled, and discoverable; it closes no parent overlay and executes no item meaning.
 * @param {unknown} event <lang><zh-CN>平台提供的原始点击事件。</zh-CN><en>Original click event supplied by the platform.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `click`。</zh-CN><en>No return value; emits `click` when the guard passes.</en></lang>
 */
function emitClick(event) {
  // <lang><zh-CN>guard 保护 disabled、隐藏和无文字/slot 场景，直接调用 handler 也不会形成隐式动作。</zh-CN><en>The guard protects disabled, hidden, and label-less/slot-less states so direct handler calls cannot form an implicit action.</en></lang>
  if (!isRenderable.value || props.disabled) return;

  // <lang><zh-CN>payload 只携带 caller value 和原始事件；不推断 parent index、close 或业务结果。</zh-CN><en>The payload carries caller value and the original event only; it infers no parent index, close action, or business result.</en></lang>
  emit('click', { value: props.value, event });
}
</script>

<style src="./u-action-sheet-item.css"></style>
