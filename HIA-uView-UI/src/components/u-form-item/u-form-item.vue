<!--
@component UFormItem
@lang zh-CN 将安全字段路径注册到最近 UForm，捕获挂载初值、执行声明式规则并把内部状态投影到 UValidationMessage；独立使用时仍保持标签/帮助/外部消息呈现。
@lang en Registers a safe field path with the nearest UForm, captures its mount-time value, executes declarative rules, and projects internal state to UValidationMessage; standalone use still presents labels, help, and external messages.
-->
<template>
  <!--
  @lang zh-CN 根 class 同时呈现有效标签位置、校验状态和继承后的 disabled/readonly，不写业务状态。
  @lang en The root class presents effective label position, validation state, and inherited disabled/readonly without writing business state.
  -->
  <view :class="rootClasses">
    <view class="u-form-item__label-row">
      <text v-if="label" class="u-form-item__label">
        <text v-if="required" class="u-form-item__required">*</text>{{ label }}
      </text>
      <text v-if="helpText" class="u-form-item__help">{{ helpText }}</text>
    </view>
    <!--
    @lang zh-CN 默认 slot 保持调用方控件组合；直接输入后代通过私有 context 接收 guard 与校验通知。
    @lang en The default slot retains caller control composition; direct input descendants receive guards and validation notifications through private context.
    -->
    <view class="u-form-item__control"><slot /></view>
    <!--
    @lang zh-CN 内部规则状态优先；没有内部活动时兼容呈现调用方显式 validation props。
    @lang en Internal rule state takes precedence; when no internal activity exists, caller-explicit validation props remain compatible presentation input.
    -->
    <UValidationMessage :state="displayValidationState" :message="displayValidationMessage" />
  </view>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue';
import UValidationMessage from '../u-validation-message/u-validation-message.vue';
import {
  U_FORM_CONTEXT,
  U_FORM_ITEM_CONTEXT,
  canonicalFieldPath,
  cloneFieldValue,
  normalizeFormRules,
  readFieldValue,
  validateFormValue,
  writeFieldValue
} from '../u-form/form-runtime.mjs';

// <lang><zh-CN>稳定模板名保留迁移熟悉度；父子关系只使用本包 Symbol context。</zh-CN><en>The stable template name retains migration familiarity; parent-child relations use only this package's Symbol context.</en></lang>
defineOptions({ name: 'u-form-item' });

// <lang><zh-CN>props 同时覆盖字段生命周期与既有展示扩展；rules 函数只能由应用源码直接传入。</zh-CN><en>Props cover both field lifecycle and existing presentation extensions; rule functions may only be supplied directly by application source.</en></lang>
const props = defineProps({
  // <lang><zh-CN>prop 是 dotted/index 字符串；空值表示独立展示项，不注册或校验。</zh-CN><en>Prop is a dotted/index string; empty means a standalone presentation item that neither registers nor validates.</en></lang>
  prop: { type: String, default: '' },
  // <lang><zh-CN>item-level 规则在 form-level 规则之后执行，稳定保留声明顺序。</zh-CN><en>Item-level rules run after form-level rules while retaining declaration order.</en></lang>
  rules: { type: [Object, Array], default: () => [] },
  // <lang><zh-CN>标签由调用方本地化；空值不制造领域文字。</zh-CN><en>The caller localizes the label; an empty value creates no domain copy.</en></lang>
  label: { type: String, default: '' },
  // <lang><zh-CN>required 只呈现星号；真正必填由规则 `required` 明确声明。</zh-CN><en>Required only presents an asterisk; actual required validation is explicitly declared by a `required` rule.</en></lang>
  required: { type: Boolean, default: false },
  // <lang><zh-CN>帮助文字由调用方提供，可与错误消息同时存在。</zh-CN><en>Help copy is supplied by the caller and may coexist with an error message.</en></lang>
  helpText: { type: String, default: '' },
  // <lang><zh-CN>外部状态只在没有内部校验活动时作为兼容呈现输入；空字符串表示自动。</zh-CN><en>External state is compatibility presentation input only when no internal validation activity exists; an empty string means automatic.</en></lang>
  validationState: { type: String, default: '' },
  // <lang><zh-CN>外部消息归调用方所有，不参与规则结果或 callback errors。</zh-CN><en>External message remains caller-owned and does not participate in rule results or callback errors.</en></lang>
  validationMessage: { type: String, default: '' },
  // <lang><zh-CN>非空 item 位置覆盖 form 位置；未知值回退父级再回退 top。</zh-CN><en>A nonempty item position overrides the form position; unknown values fall back to the parent and then top.</en></lang>
  labelPosition: { type: String, default: '' },
  // <lang><zh-CN>局部 disabled 与 form disabled 合并并向输入后代传播。</zh-CN><en>Local disabled merges with form disabled and propagates to input descendants.</en></lang>
  disabled: { type: Boolean, default: false },
  // <lang><zh-CN>readonly 阻止值变更但不等同 disabled；观察事件策略由输入组件实现。</zh-CN><en>Readonly prevents value changes but is not disabled; input components implement observation-event policy.</en></lang>
  readonly: { type: Boolean, default: false }
});

// <lang><zh-CN>表单项没有公开 emit；输入、form imperative 与调用方分别拥有其事件。</zh-CN><en>The form item has no public emits; inputs, form imperatives, and callers own their respective events.</en></lang>
defineEmits([]);

// <lang><zh-CN>最近 form context 可为空，使组件保持独立展示能力。</zh-CN><en>The nearest form context may be absent, preserving standalone presentation ability.</en></lang>
const formContext = inject(U_FORM_CONTEXT, null);

/**
 * @lang zh-CN 当前实例唯一 token；相同 prop 的多个 UFormItem 仍能正确注册/注销。
 * @lang en Unique token for this instance; multiple UFormItem instances with the same prop still register and unregister correctly.
 */
const fieldToken = Symbol('hia-uview-form-field');

// <lang><zh-CN>字段 key 在 prop 变化时重新规范；无效/危险路径为空且不注册。</zh-CN><en>The field key is renormalized when prop changes; an invalid or dangerous path is empty and never registers.</en></lang>
const fieldPath = computed(() => canonicalFieldPath(props.prop));

// <lang><zh-CN>内部校验状态只包含局部 UI 事实，不进入调用方 model。</zh-CN><en>Internal validation state contains only local UI facts and never enters the caller model.</en></lang>
const internalValidationState = ref('idle');

// <lang><zh-CN>内部消息只保存当前规则显式文字；库不生成默认语言。</zh-CN><en>Internal message stores only explicit copy from the current rule; the library generates no default language.</en></lang>
const internalValidationMessage = ref('');

// <lang><zh-CN>挂载标记阻止卸载后的异步结果写 UI。</zh-CN><en>The mounted flag prevents async results from writing UI after unmount.</en></lang>
let mounted = false;

// <lang><zh-CN>注册标记确保每次 prop/model owner 变化只注销当前 descriptor 一次。</zh-CN><en>The registration flag ensures each prop/model-owner change unregisters the current descriptor only once.</en></lang>
let registered = false;

// <lang><zh-CN>单调 epoch 使 clear/reset/prop change/unmount 后的旧 Promise 失去投影资格。</zh-CN><en>A monotonic epoch revokes projection eligibility from Promises made stale by clear, reset, prop change, or unmount.</en></lang>
let validationEpoch = 0;

// <lang><zh-CN>初值存在性与值分离记录，正确支持“存在但为 undefined”的字段。</zh-CN><en>Initial presence and value are stored separately, correctly supporting a field that exists with undefined value.</en></lang>
let initialFieldExists = false;

// <lang><zh-CN>快照只在注册/owner 替换时捕获；普通输入不会改变它。</zh-CN><en>The snapshot is captured only at registration or owner replacement; ordinary input never changes it.</en></lang>
let initialFieldValue;

// <lang><zh-CN>form 与 item disabled 采用或语义，最近输入读取同一 computed。</zh-CN><en>Form and item disabled use OR semantics, and the nearest input reads the same computed value.</en></lang>
const disabled = computed(() => props.disabled || Boolean(formContext?.disabled.value));

// <lang><zh-CN>readonly 当前只属于 item 局部并向输入后代传播。</zh-CN><en>Readonly is currently local to the item and propagates to input descendants.</en></lang>
const readonly = computed(() => props.readonly);

// <lang><zh-CN>item 有效位置优先，随后使用 form 有效位置，最终 top。</zh-CN><en>The valid item position takes precedence, followed by the valid form position and finally top.</en></lang>
const effectiveLabelPosition = computed(() => {
  if (['top', 'left'].includes(props.labelPosition)) {
    return props.labelPosition;
  }
  return formContext?.labelPosition.value ?? 'top';
});

// <lang><zh-CN>内部非 idle 状态优先，idle 时兼容调用方显式状态并对未知值回退 idle。</zh-CN><en>An internal non-idle state takes precedence; while idle, caller-explicit state is retained with unknown values falling back to idle.</en></lang>
const displayValidationState = computed(() => {
  if (internalValidationState.value !== 'idle') {
    return internalValidationState.value;
  }
  return ['idle', 'validating', 'error'].includes(props.validationState) ? props.validationState : 'idle';
});

// <lang><zh-CN>内部活动使用规则消息；idle 时只呈现调用方外部消息。</zh-CN><en>Internal activity uses rule copy; while idle, only caller-external copy is presented.</en></lang>
const displayValidationMessage = computed(() => (
  internalValidationState.value !== 'idle' ? internalValidationMessage.value : props.validationMessage
));

// <lang><zh-CN>根 class 从有效状态计算，不让任意 prop 进入 class 名。</zh-CN><en>Root classes derive from effective states, preventing arbitrary props from entering class names.</en></lang>
const rootClasses = computed(() => [
  'u-form-item',
  `u-form-item--label-${effectiveLabelPosition.value}`,
  `u-form-item--validation-${displayValidationState.value}`,
  {
    'u-form-item--disabled': disabled.value,
    'u-form-item--readonly': readonly.value
  }
]);

/**
 * @lang zh-CN 捕获当前 owner/model/path 的初值；无效或缺失字段保持不可 reset。
 * @lang en Captures the initial value for the current owner/model/path; an invalid or missing field remains nonresettable.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function captureInitialValue() {
  // <lang><zh-CN>每次 owner/path 变化都先清空旧快照，避免跨字段写回。</zh-CN><en>Every owner or path change clears the old snapshot first, preventing cross-field writes.</en></lang>
  initialFieldExists = false;
  initialFieldValue = undefined;

  // <lang><zh-CN>独立项或无效路径没有 model 读取。</zh-CN><en>A standalone item or invalid path performs no model read.</en></lang>
  if (formContext === null || fieldPath.value === '') {
    return;
  }

  // <lang><zh-CN>安全读取显式区分缺失与 undefined。</zh-CN><en>Safe reading explicitly distinguishes a missing field from undefined.</en></lang>
  const fieldRecord = readFieldValue(formContext.model.value, fieldPath.value);
  initialFieldExists = fieldRecord.found;

  // <lang><zh-CN>仅对真实存在字段建立快照。</zh-CN><en>Creates a snapshot only for a field that really exists.</en></lang>
  if (fieldRecord.found) {
    initialFieldValue = cloneFieldValue(fieldRecord.value);
  }
}

/**
 * @lang zh-CN 返回 form-level 后跟 item-level 的稳定规则集合。
 * @lang en Returns a stable rule collection with form-level rules followed by item-level rules.
 * @returns {Record<string, unknown>[]} <lang><zh-CN>新规则数组。</zh-CN><en>New rule array.</en></lang>
 */
function getRules() {
  // <lang><zh-CN>无 form/path 时只保留 item-level 规则；它们不会自动注册，但可由 ref 显式 validate。</zh-CN><en>Without a form or path, retains only item-level rules; they do not auto-register but may be explicitly validated through a ref.</en></lang>
  const formRules = formContext !== null && fieldPath.value !== ''
    ? formContext.resolveRules(fieldPath.value)
    : [];

  // <lang><zh-CN>拼接新数组避免修改调用方任一规则集合。</zh-CN><en>Concatenates into a new array without mutating either caller rule collection.</en></lang>
  return [...formRules, ...normalizeFormRules(props.rules)];
}

/**
 * @lang zh-CN 清除内部校验投影并使所有在途轮次 stale；外部 validation props 不被修改。
 * @lang en Clears internal validation projection and marks every in-flight run stale; external validation props are not modified.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function clearValidate() {
  // <lang><zh-CN>epoch 先推进，旧 Promise 即使随后 resolve 也不能写 UI。</zh-CN><en>The epoch advances first so an older Promise cannot write UI even if it resolves later.</en></lang>
  validationEpoch += 1;
  internalValidationState.value = 'idle';
  internalValidationMessage.value = '';
}

/**
 * @lang zh-CN 校验当前字段快照；返回错误或 null，只有最新且仍挂载的轮次可以更新 UI。
 * @lang en Validates the current field snapshot; returns an error or null, and only the latest still-mounted run may update UI.
 * @param {string} [trigger] <lang><zh-CN>空字符串、change 或 blur。</zh-CN><en>Empty string, change, or blur.</en></lang>
 * @returns {Promise<null | { prop: string, message: string, ruleIndex: number, trigger: string, code: string }>} <lang><zh-CN>首错误或 null。</zh-CN><en>First error or null.</en></lang>
 */
async function validate(trigger = '') {
  // <lang><zh-CN>无 form 或无效 path 的独立项没有可读 model，视为无注册规则通过。</zh-CN><en>A standalone item without a form or valid path has no readable model and passes as an unregistered rule surface.</en></lang>
  if (formContext === null || fieldPath.value === '') {
    clearValidate();
    return null;
  }

  // <lang><zh-CN>取得调用开始时的值与规则快照，使返回结果不受后续 prop 替换改写。</zh-CN><en>Gets value and rule snapshots at call start so later prop replacement cannot rewrite the returned result.</en></lang>
  const fieldRecord = readFieldValue(formContext.model.value, fieldPath.value);
  const rules = getRules();

  // <lang><zh-CN>缺失字段仍可由 required 规则验证为错误；无规则时直接清理通过。</zh-CN><en>A missing field may still fail a required rule; with no rules it clears and passes directly.</en></lang>
  if (rules.length === 0) {
    clearValidate();
    return null;
  }

  // <lang><zh-CN>本轮 epoch 与当前挂载状态共同决定后续 UI 写入资格。</zh-CN><en>This run's epoch and current mount state jointly determine later UI-write eligibility.</en></lang>
  const runEpoch = ++validationEpoch;
  internalValidationState.value = 'validating';
  internalValidationMessage.value = '';

  // <lang><zh-CN>规则执行只获得调用方 model 引用作只读上下文约定，不会由库主动写入。</zh-CN><en>Rule execution receives the caller model reference only as a conventionally readonly context and the library does not write it.</en></lang>
  const error = await validateFormValue(fieldRecord.value, rules, {
    field: fieldPath.value,
    model: formContext.model.value,
    trigger
  });

  // <lang><zh-CN>stale 轮次仍向其调用者返回自身快照结果，但绝不覆盖新字段/新轮次 UI。</zh-CN><en>A stale run still returns its own snapshot result to its caller but never overwrites UI for a newer field or run.</en></lang>
  const stale = !mounted || runEpoch !== validationEpoch;
  if (!stale) {
    internalValidationState.value = error === null ? 'idle' : 'error';
    internalValidationMessage.value = error?.message ?? '';
  }
  return error;
}

/**
 * @lang zh-CN 显式恢复注册时快照并清除校验；这是 UFormItem 唯一 model 写入入口。
 * @lang en Explicitly restores the registration snapshot and clears validation; this is UFormItem's only model-write entry.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function resetField() {
  // <lang><zh-CN>先使在途校验 stale，避免旧错误在 reset 后恢复。</zh-CN><en>Marks in-flight validation stale first so an old error cannot reappear after reset.</en></lang>
  clearValidate();

  // <lang><zh-CN>只有原字段真实存在且当前安全路径仍存在时写入新快照副本。</zh-CN><en>Writes a fresh snapshot copy only when the original field really existed and the current safe path still exists.</en></lang>
  if (formContext !== null && fieldPath.value !== '' && initialFieldExists) {
    writeFieldValue(formContext.model.value, fieldPath.value, cloneFieldValue(initialFieldValue));
  }
}

/**
 * @lang zh-CN 在输入发出 change 意图后运行匹配规则；Promise 被消费，错误已由执行器转换为结果。
 * @lang en Runs matching rules after an input emits change intent; the Promise is consumed and executor errors are already converted into results.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function notifyChange() {
  // <lang><zh-CN>输入组件在 Vue nextTick 后调用，因此此处读取调用方可能写回的新 model 值。</zh-CN><en>Input components call after Vue nextTick, so this read may observe the caller's newly written-back model value.</en></lang>
  void validate('change');
}

/**
 * @lang zh-CN 在输入发出 blur 观察后运行匹配规则；blur 不表示提交。
 * @lang en Runs matching rules after an input reports blur; blur does not mean submission.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function notifyBlur() {
  void validate('blur');
}

// <lang><zh-CN>descriptor 外壳固定；getPath 动态读取当前 prop，其他方法是受限公开行为。</zh-CN><en>The descriptor shell is fixed; getPath dynamically reads the current prop and the other methods are constrained public behavior.</en></lang>
const fieldDescriptor = Object.freeze({
  token: fieldToken,
  getPath: () => fieldPath.value,
  validate,
  resetField,
  clearValidate
});

/**
 * @lang zh-CN 在满足 form/path/mount 条件时注册当前 descriptor。
 * @lang en Registers the current descriptor when form, path, and mount conditions are met.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function registerCurrentField() {
  if (mounted && formContext !== null && fieldPath.value !== '' && !registered) {
    formContext.registerField(fieldDescriptor);
    registered = true;
  }
}

/**
 * @lang zh-CN 只注销当前实例 token，不按 prop 删除相邻实例。
 * @lang en Unregisters only this instance token and never deletes a neighboring instance by prop.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function unregisterCurrentField() {
  if (formContext !== null && registered) {
    formContext.unregisterField(fieldToken);
    registered = false;
  }
}

// <lang><zh-CN>挂载后捕获初值再注册，保证 reset descriptor 首次可见时已有快照。</zh-CN><en>After mount, captures the initial value before registration so the reset descriptor already has a snapshot when first visible.</en></lang>
onMounted(() => {
  mounted = true;
  captureInitialValue();
  registerCurrentField();
});

// <lang><zh-CN>prop 或整个 model owner 引用变化时重新绑定；普通嵌套值更新不会重置初值快照。</zh-CN><en>Rebinds when prop or the entire model-owner reference changes; ordinary nested-value updates do not reset the initial snapshot.</en></lang>
watch(
  () => [props.prop, formContext?.model.value],
  () => {
    if (!mounted) {
      return;
    }
    unregisterCurrentField();
    clearValidate();
    captureInitialValue();
    registerCurrentField();
  }
);

// <lang><zh-CN>卸载先撤销异步投影资格，再按实例 token 注销。</zh-CN><en>Unmount revokes async projection eligibility first and then unregisters by instance token.</en></lang>
onBeforeUnmount(() => {
  mounted = false;
  clearValidate();
  unregisterCurrentField();
});

// <lang><zh-CN>输入后代只获得 guard 与通知方法；model、rules、快照和 registry 不向下暴露。</zh-CN><en>Input descendants receive only guards and notification methods; model, rules, snapshots, and registry are not exposed downward.</en></lang>
provide(U_FORM_ITEM_CONTEXT, Object.freeze({ disabled, readonly, notifyChange, notifyBlur }));

// <lang><zh-CN>实例 ref 只暴露单字段 validate/clear/reset，不暴露内部状态或 owner context。</zh-CN><en>The instance ref exposes only single-field validate/clear/reset and not internal state or owner context.</en></lang>
defineExpose({ validate, clearValidate, resetField });
</script>

<style src="./u-form-item.css"></style>
