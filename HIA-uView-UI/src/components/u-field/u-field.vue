<!--
@component UField
@lang zh-CN 提供双模式字段结构：调用方给出 default slot 时保持自有控件；未给 slot 时组合 HIA UInput 并转交受控 model、输入、确认与点击意图。组件不拥有表单 model、规则、持久化、请求或业务字段。
@lang en Provides a dual-mode field structure: a caller-supplied default slot retains caller-owned control, while an absent slot composes HIA UInput and forwards controlled model, input, confirmation, and click intents. The component owns no form model, rule, persistence, request, or business field.
-->
<template>
  <!--
  @lang zh-CN 字段根按固定顺序组织标签、控件、帮助与独立校验消息；两种控件模式共享同一呈现结构。
  @lang en The field root organizes label, control, help, and independent validation message in fixed order; both control modes share the same presentation structure.
  -->
  <view class="u-field">
    <!--
    @lang zh-CN 标签和星号均为调用方提供的可见提示；真正 required 规则仍由 UForm/UFormItem 声明。
    @lang en Label and asterisk are caller-provided visible cues; the actual required rule remains declared by UForm/UFormItem.
    -->
    <view class="u-field__label-row">
      <text class="u-field__label">{{ label }}</text>
      <text v-if="required" class="u-field__required-mark">*</text>
    </view>

    <!--
    @lang zh-CN default slot 存在时不渲染内建输入，UField 不读取、转换或伪造插槽控件的值与事件。
    @lang en When a default slot exists, the built-in input is not rendered and UField neither reads, transforms, nor fabricates values or events for the slotted control.
    -->
    <view class="u-field__control">
      <slot v-if="hasDefaultControl" />
      <!--
      @lang zh-CN 无 slot 时只组合本包 UInput；该分支仍由调用方通过 modelValue/writeback 拥有值。
      @lang en Without a slot, only this package's UInput is composed; the caller still owns its value through modelValue/writeback.
      -->
      <UInput
        v-else
        :model-value="modelValue"
        :placeholder="placeholder"
        :disabled="effectiveDisabled"
        :readonly="effectiveReadonly"
        @update:model-value="handleModelUpdate"
        @input="handleInput"
        @confirm="handleConfirm"
        @click="handleClick"
      />
    </view>

    <!--
    @lang zh-CN 帮助文字只在调用方提供非空字符串时出现，可与校验消息并存。
    @lang en Help copy appears only for a nonempty caller string and may coexist with validation copy.
    -->
    <text v-if="hasHelpText" class="u-field__help">{{ helpText }}</text>

    <!--
    @lang zh-CN 独立消息只呈现调用方声明状态；UField 不执行规则或生成默认语言。
    @lang en The independent message presents only caller-declared state; UField executes no rule and generates no default language.
    -->
    <UValidationMessage :state="validationState" :message="validationMessage" />
  </view>
</template>

<script setup>
import { computed, inject, useSlots } from 'vue';
import UInput from '../u-input/u-input.vue';
import UValidationMessage from '../u-validation-message/u-validation-message.vue';
import { U_FORM_ITEM_CONTEXT } from '../u-form/form-runtime.mjs';

// <lang><zh-CN>稳定 `u-field` 名称保留模板迁移路径；runtime 不依赖全局 `$u`、关系 hook 或表单总线。</zh-CN><en>The stable `u-field` name retains the template migration path; runtime depends on no global `$u`, relation hook, or form bus.</en></lang>
defineOptions({ name: 'u-field' });

// <lang><zh-CN>公开 props 同时覆盖既有展示扩展与首轮上游迁移 P0；没有 formatter、网络或动态规则输入。</zh-CN><en>Public props cover both existing presentation extensions and the initial upstream-migration P0 surface; there is no formatter, network, or dynamic-rule input.</en></lang>
const props = defineProps({
  // <lang><zh-CN>受控值接受字符串或数字；本地编辑事件只产生已确认字符串。</zh-CN><en>The controlled value accepts a string or number; local editing events produce only a confirmed string.</en></lang>
  modelValue: { type: [String, Number], default: '' },
  // <lang><zh-CN>标签由调用方本地化，空值不制造领域文字。</zh-CN><en>The caller localizes the label, and an empty value creates no domain copy.</en></lang>
  label: { type: String, default: '' },
  // <lang><zh-CN>星号只是展示提示，不替代规则中的 required。</zh-CN><en>The asterisk is only a presentation cue and does not replace required in rules.</en></lang>
  required: { type: Boolean, default: false },
  // <lang><zh-CN>内建 UInput 的提示文字由调用方拥有。</zh-CN><en>The caller owns placeholder copy for the built-in UInput.</en></lang>
  placeholder: { type: String, default: '' },
  // <lang><zh-CN>局部 disabled 与最近 UFormItem disabled 合并，所有内建交互均使用同一 guard。</zh-CN><en>Local disabled merges with the nearest UFormItem disabled and every built-in interaction uses the same guard.</en></lang>
  disabled: { type: Boolean, default: false },
  // <lang><zh-CN>局部 readonly 与最近 UFormItem readonly 合并，只阻止值变更而不伪装成 disabled。</zh-CN><en>Local readonly merges with the nearest UFormItem readonly and blocks only value changes rather than masquerading as disabled.</en></lang>
  readonly: { type: Boolean, default: false },
  // <lang><zh-CN>帮助文字是可选调用方内容，不进入规则或事件。</zh-CN><en>Help copy is optional caller content and enters neither rules nor events.</en></lang>
  helpText: { type: String, default: '' },
  // <lang><zh-CN>独立校验状态兼容既有展示使用；unknown 值由消息组件安全隐藏。</zh-CN><en>The independent validation state remains compatible with existing presentation usage; the message component safely hides an unknown value.</en></lang>
  validationState: { type: String, default: 'idle' },
  // <lang><zh-CN>校验文字归调用方所有，不缓存、翻译或记录。</zh-CN><en>Validation copy belongs to the caller and is never cached, translated, or logged.</en></lang>
  validationMessage: { type: String, default: '' }
});

// <lang><zh-CN>四项事件只来自内建模式；custom-slot 模式保持零合成事件。</zh-CN><en>The four events originate only from built-in mode; custom-slot mode retains zero synthetic events.</en></lang>
const emit = defineEmits(['update:modelValue', 'input', 'confirm', 'click']);

// <lang><zh-CN>slot 表只用于判断调用方是否显式提供 default control，不执行 slot 内容。</zh-CN><en>The slot table is used only to determine whether the caller explicitly supplied a default control and does not execute slot content here.</en></lang>
const slots = useSlots();

// <lang><zh-CN>最近 form-item context 可为空，使独立 UField 正常工作。</zh-CN><en>The nearest form-item context may be absent so a standalone UField works normally.</en></lang>
const formItemContext = inject(U_FORM_ITEM_CONTEXT, null);

// <lang><zh-CN>default slot 函数存在即选择 caller-owned 模式；不检查或推断其渲染结果。</zh-CN><en>The presence of a default-slot function selects caller-owned mode; its rendered result is neither inspected nor inferred.</en></lang>
const hasDefaultControl = computed(() => typeof slots.default === 'function');

// <lang><zh-CN>帮助可见性只由非空调用方字符串决定。</zh-CN><en>Help visibility derives only from a nonempty caller string.</en></lang>
const hasHelpText = computed(() => props.helpText.length > 0);

// <lang><zh-CN>disabled 采用父子或语义，防止字段局部值绕过表单项 guard。</zh-CN><en>Disabled uses parent-child OR semantics, preventing a local field value from bypassing the form-item guard.</en></lang>
const effectiveDisabled = computed(() => props.disabled || Boolean(formItemContext?.disabled.value));

// <lang><zh-CN>readonly 同样采用父子或语义，但仍允许内建输入报告焦点、点击与确认观察。</zh-CN><en>Readonly also uses parent-child OR semantics while still allowing the built-in input to report focus, click, and confirmation observations.</en></lang>
const effectiveReadonly = computed(() => props.readonly || Boolean(formItemContext?.readonly.value));

/**
 * @lang zh-CN 转发内建输入的受控更新；disabled/readonly 或非字符串 payload 保持零事件。
 * @lang en Forwards a controlled update from the built-in input; disabled/readonly state or a nonstring payload retains zero events.
 * @param {unknown} value <lang><zh-CN>内建 UInput 候选值。</zh-CN><en>Candidate value from built-in UInput.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleModelUpdate(value) {
  if (effectiveDisabled.value || effectiveReadonly.value || typeof value !== 'string') {
    return;
  }
  emit('update:modelValue', value);
}

/**
 * @lang zh-CN 转发内建输入的 input 字符串，与 model 更新保持相同 guard。
 * @lang en Forwards the built-in input string using the same guard as the model update.
 * @param {unknown} value <lang><zh-CN>内建输入 payload。</zh-CN><en>Built-in input payload.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleInput(value) {
  if (effectiveDisabled.value || effectiveReadonly.value || typeof value !== 'string') {
    return;
  }
  emit('input', value);
}

/**
 * @lang zh-CN 从当前或过渡期 UInput confirm payload 中取得已确认字符串；未知形状返回 null。
 * @lang en Reads a confirmed string from the current or transitional UInput confirm payload; an unknown shape returns null.
 * @param {unknown} payload <lang><zh-CN>字符串或已记录平台事件。</zh-CN><en>String or documented platform event.</en></lang>
 * @returns {string | null} <lang><zh-CN>确认字符串或无安全候选。</zh-CN><en>Confirmed string or no safe candidate.</en></lang>
 */
function confirmedValue(payload) {
  if (typeof payload === 'string') {
    return payload;
  }
  if (typeof payload?.detail?.value === 'string') {
    return payload.detail.value;
  }
  if (typeof payload?.target?.value === 'string') {
    return payload.target.value;
  }
  return null;
}

/**
 * @lang zh-CN 以字符串转发内建确认观察；readonly 仍可观察，disabled 与未知 payload 保持零事件。
 * @lang en Forwards built-in confirmation as a string; readonly remains observable, while disabled and unknown payloads retain zero events.
 * @param {unknown} payload <lang><zh-CN>内建 UInput confirm payload。</zh-CN><en>Built-in UInput confirm payload.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleConfirm(payload) {
  if (effectiveDisabled.value) {
    return;
  }
  // <lang><zh-CN>只有确认字符串存在时才形成公开事件，避免未知平台形状被转换为空值。</zh-CN><en>A public event is formed only when a confirmed string exists, avoiding conversion of an unknown platform shape into an empty value.</en></lang>
  const value = confirmedValue(payload);
  if (value !== null) {
    emit('confirm', value);
  }
}

/**
 * @lang zh-CN 以无参数形式转发内建点击观察；disabled 时保持零事件。
 * @lang en Forwards built-in click observation without parameters; disabled state retains zero events.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleClick() {
  if (!effectiveDisabled.value) {
    emit('click');
  }
}
</script>

<style src="./u-field.css"></style>
