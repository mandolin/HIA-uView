<!--
@component USwitch
@lang zh-CN 提供受控布尔切换意图；组件只回传平台选择结果，不执行业务开关、持久化、权限或远程更新。
@lang en Provides controlled boolean-toggle intent; the component only returns the platform selection result and performs no business toggle, persistence, authorization, or remote update.
-->
<template>
  <label :class="rootClasses" :aria-busy="loading">
    <switch
      class="u-switch__control"
      :checked="isActive"
      :disabled="isInteractionDisabled"
      @change="handleChange"
    />
    <text v-if="label" class="u-switch__label">{{ label }}</text>
  </label>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>声明模板名，保持代码层迁移使用 `u-switch` 而非品牌前缀。</zh-CN><en>Declares the template name so code-level migration uses `u-switch` rather than a brand prefix.</en></lang>
defineOptions({ name: 'u-switch' });

// <lang><zh-CN>受控布尔值、禁用、loading 与显示文字全部由调用方拥有；组件没有业务 key 或远程参数。</zh-CN><en>Controlled boolean, disabled state, loading, and visible copy are caller-owned; the component has no business key or remote parameter.</en></lang>
const props = defineProps({
  // <lang><zh-CN>modelValue 保留调用方的布尔、字符串或数字原值；组件仅与 activeValue 严格比较。</zh-CN><en>ModelValue preserves the caller's boolean, string, or number value; the component compares it strictly with activeValue only.</en></lang>
  modelValue: { type: [Boolean, String, Number], default: false },
  // <lang><zh-CN>activeValue 是原生 true 的透明 caller 值；不执行字符串/数字 coercion。</zh-CN><en>ActiveValue is the transparent caller value mapped from native true; no string/number coercion is performed.</en></lang>
  activeValue: { type: [Boolean, String, Number], default: true },
  // <lang><zh-CN>inactiveValue 是原生 false 的透明 caller 值；不承载业务关闭或持久化语义。</zh-CN><en>InactiveValue is the transparent caller value mapped from native false; it carries no business shutdown or persistence meaning.</en></lang>
  inactiveValue: { type: [Boolean, String, Number], default: false },
  // <lang><zh-CN>disabled 是调用方声明的本地不可操作边界。</zh-CN><en>Disabled is the caller-declared local inactivity boundary.</en></lang>
  disabled: { type: Boolean, default: false },
  // <lang><zh-CN>loading 只把控件置于本地不可交互状态并提供 busy 语义；它不启动请求、计时器或全局 feedback service。</zh-CN><en>Loading only places the control in a locally non-interactive state and provides busy semantics; it starts no request, timer, or global feedback service.</en></lang>
  loading: { type: Boolean, default: false },
  // <lang><zh-CN>label 只提供调用方可见文字，组件不生成默认业务文案。</zh-CN><en>Label provides caller-visible copy only; the component generates no default business copy.</en></lang>
  label: { type: String, default: '' }
});

// <lang><zh-CN>只报告受控更新和一般 change 意图；调用方决定是否写回或触发业务流程。</zh-CN><en>Reports controlled update and general change intent only; the caller decides whether to write back or trigger business flow.</en></lang>
const emit = defineEmits(['update:modelValue', 'change']);

// <lang><zh-CN>交互禁用聚合显式 disabled 与 caller-controlled loading，使原生 switch、视觉状态和 handler guard 一致。</zh-CN><en>Interaction-disabled aggregates explicit disabled and caller-controlled loading so native switch, visual state, and handler guard stay consistent.</en></lang>
const isInteractionDisabled = computed(() => props.disabled || props.loading);

// <lang><zh-CN>原生 checked 仅由 modelValue 与 activeValue 的 Object.is 比较得出，因此不会混淆数字、字符串或特殊数值。</zh-CN><en>Native checked derives only from Object.is between modelValue and activeValue, so numbers, strings, and special numeric values are not conflated.</en></lang>
const isActive = computed(() => Object.is(props.modelValue, props.activeValue));

// <lang><zh-CN>根类把 loading 呈现为同一不可操作边界，不用颜色或额外业务文案伪造完成状态。</zh-CN><en>Root classes present loading as the same inactive boundary without using color or extra business copy to fabricate completion.</en></lang>
const rootClasses = computed(() => ['u-switch', { 'u-switch--disabled': isInteractionDisabled.value, 'u-switch--loading': props.loading }]);

/**
 * @lang zh-CN 从已确认的 change 事件读取布尔值；未知形状保持零事件，避免把错误输入猜成 false。
 * @lang en Reads a boolean from the documented change event; unknown shapes emit nothing instead of guessing false.
 * @param {unknown} event <lang><zh-CN>平台或测试 change 事件。</zh-CN><en>Platform or test change event.</en></param>
 * @returns {boolean | null} <lang><zh-CN>确认的下一值或未知标记。</zh-CN><en>Confirmed next value or an unknown marker.</en></lang>
 */
function extractValue(event) {
  // <lang><zh-CN>小程序 switch 的值位于 detail.value，且必须是真正布尔值。</zh-CN><en>The mini-program switch value is in detail.value and must be a real boolean.</en></lang>
  const detailValue = event?.detail?.value;
  return typeof detailValue === 'boolean' ? detailValue : null;
}

/**
 * @lang zh-CN 处理本地切换意图；disabled/loading 或未知事件形状均保持零事件。
 * @lang en Handles local-toggle intent; disabled/loading state or unknown event shape retains zero events.
 * @param {unknown} event <lang><zh-CN>原生 change 事件。</zh-CN><en>Native change event.</en></param>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleChange(event) {
  // <lang><zh-CN>先阻止 disabled/loading 分支，防止测试或非原生调用直接调用 handler 时越过原生属性。</zh-CN><en>Blocks disabled/loading branches first so direct test or non-native handler calls cannot bypass the native property.</en></lang>
  if (isInteractionDisabled.value) {
    return;
  }

  // <lang><zh-CN>只接受确认的布尔值；组件不将字符串、数字或缺失值转换成领域状态。</zh-CN><en>Accepts only a confirmed boolean; the component converts no string, number, or missing value into domain state.</en></lang>
  const nextValue = extractValue(event);
  if (nextValue === null) {
    return;
  }

  // <lang><zh-CN>将确认的原生布尔值映射回调用方显式 active/inactive 值，原样保留类型。</zh-CN><en>Maps the confirmed native boolean back to the caller's explicit active/inactive value while preserving its type unchanged.</en></lang>
  const mappedValue = nextValue ? props.activeValue : props.inactiveValue;

  // <lang><zh-CN>先报告标准 v-model 意图，再报告 change；两者共享同一个透明值且均不写 prop。</zh-CN><en>Reports the standard v-model intent before change; both share the same transparent value and neither writes the prop.</en></lang>
  emit('update:modelValue', mappedValue);
  emit('change', mappedValue);
}
</script>

<style src="./u-switch.css"></style>
