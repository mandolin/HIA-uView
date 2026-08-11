<!--
@component UForm
@lang zh-CN 提供调用方 model/rules、实例私有字段 registry、校验/清理/重置 imperative API 与既有 submit/reset 意图。只有显式 resetFields 会恢复字段快照；组件不提交、持久化、请求或生成业务规则。
@lang en Provides caller model/rules, an instance-private field registry, validation/clear/reset imperative APIs, and existing submit/reset intents. Only explicit resetFields restores field snapshots; the component never submits, persists, requests, or generates business rules.
-->
<template>
  <!--
  @lang zh-CN 表单根只组织最近子树并提供 slot；字段关系由同一实例的私有 context 维护。
  @lang en The form root only groups its nearest subtree and provides a slot; field relationships are maintained by this instance's private context.
  <lang><zh-CN>嵌套 UForm 会通过最近祖先注入自然隔离，不建立全局 registry。</zh-CN><en>Nested UForm instances isolate naturally through nearest-ancestor injection and create no global registry.</en></lang>
  -->
  <view :class="rootClasses">
    <slot />
  </view>
</template>

<script setup>
import { computed, provide, shallowRef, watch } from 'vue';
import {
  U_FORM_CONTEXT,
  canonicalFieldPath,
  normalizeFormRules,
  readFieldValue
} from './form-runtime.mjs';

// <lang><zh-CN>稳定模板名保留 `u-*` 迁移路径，runtime 不依赖全局 `$u` 或关系 hook。</zh-CN><en>The stable template name retains the `u-*` migration path while runtime depends on no global `$u` or relation hook.</en></lang>
defineOptions({ name: 'u-form' });

// <lang><zh-CN>model/rules 均是调用方显式输入；默认空对象只让独立展示安全挂载，不生成领域字段。</zh-CN><en>Model and rules are explicit caller inputs; default empty objects only allow safe standalone mounting and create no domain fields.</en></lang>
const props = defineProps({
  // <lang><zh-CN>调用方拥有的当前表单对象；普通输入只 emit，只有显式 reset API 可写回既有路径。</zh-CN><en>Current form object owned by the caller; ordinary inputs only emit, and only explicit reset APIs may write an existing path.</en></lang>
  model: { type: Object, default: () => ({}) },
  // <lang><zh-CN>规则根可以使用精确 dotted key 或等价安全嵌套对象；规则函数必须由应用源码直接传入。</zh-CN><en>The rules root may use an exact dotted key or an equivalent safe nested object; rule functions must be supplied directly by application source.</en></lang>
  rules: { type: Object, default: () => ({}) },
  // <lang><zh-CN>禁用状态向最近 form-item/input 子树传播，并抑制本组件两个 intent 方法。</zh-CN><en>Disabled state propagates to the nearest form-item/input subtree and suppresses this component's two intent methods.</en></lang>
  disabled: { type: Boolean, default: false },
  // <lang><zh-CN>标签位置只接受 top/left 语义；未知值在样式与 context 中统一回退 top。</zh-CN><en>Label position accepts only top/left semantics; unknown values consistently fall back to top in styling and context.</en></lang>
  labelPosition: { type: String, default: 'top' }
});

// <lang><zh-CN>submit/reset 继续是显式调用方意图，不自动执行 validate 或 resetFields。</zh-CN><en>Submit/reset remain explicit caller intents and do not automatically run validate or resetFields.</en></lang>
const emit = defineEmits(['submit', 'reset']);

/**
 * @lang zh-CN 当前实例的字段 registry；Map 以实例 Symbol 为键并保留挂载顺序，重复 prop 不会互相覆盖。
 * @lang en Field registry for this instance; the Map uses instance Symbols as keys and retains mount order, so duplicate props never overwrite each other.
 */
const fields = new Map();

// <lang><zh-CN>当前规则 ref 接收响应式 prop 替换与显式 setRules；两者都不自动运行规则。</zh-CN><en>The current-rules ref receives reactive prop replacement and explicit setRules; neither automatically runs rules.</en></lang>
const currentRules = shallowRef(props.rules);

// <lang><zh-CN>父级替换 rules 对象时只更新后续校验输入，不清除 model 或字段快照。</zh-CN><en>When the parent replaces the rules object, only subsequent validation input changes; model and field snapshots remain untouched.</en></lang>
watch(
  () => props.rules,
  (nextRules) => {
    // <lang><zh-CN>Vue 已确认 prop 是对象；保存引用使调用方继续拥有规则生命周期。</zh-CN><en>Vue has already confirmed an object prop; retaining its reference keeps the rule lifecycle caller-owned.</en></lang>
    currentRules.value = nextRules;
  }
);

// <lang><zh-CN>computed model 让后代始终读取调用方当前对象引用，而不是注册时副本。</zh-CN><en>The computed model lets descendants always read the caller's current object reference rather than a registration-time copy.</en></lang>
const model = computed(() => props.model);

// <lang><zh-CN>有限 labelPosition 同时驱动 class 与子项 context，避免两处回退不一致。</zh-CN><en>The finite labelPosition drives both classes and child context, avoiding inconsistent fallback behavior.</en></lang>
const labelPosition = computed(() => (['top', 'left'].includes(props.labelPosition) ? props.labelPosition : 'top'));

// <lang><zh-CN>禁用 computed 供表单根、form-item 和输入后代共享同一事实。</zh-CN><en>The disabled computed lets the form root, form item, and input descendants share one fact.</en></lang>
const disabled = computed(() => props.disabled);

// <lang><zh-CN>根 class 不接收任意字符串；未知标签位置已在 computed 中回退。</zh-CN><en>Root classes accept no arbitrary string; unknown label positions already fall back in the computed value.</en></lang>
const rootClasses = computed(() => [
  'u-form',
  `u-form--label-${labelPosition.value}`,
  { 'u-form--disabled': disabled.value }
]);

/**
 * @lang zh-CN 注册一个字段 descriptor；descriptor 只能暴露 path、validate、reset 与 clear 的有限能力。
 * @lang en Registers one field descriptor; a descriptor may expose only constrained path, validate, reset, and clear capabilities.
 * @param {unknown} field <lang><zh-CN>UFormItem 创建的实例 descriptor。</zh-CN><en>Instance descriptor created by UFormItem.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function registerField(field) {
  // <lang><zh-CN>完整形状校验防止任意后代把不受限对象放进 registry。</zh-CN><en>Complete shape validation prevents an arbitrary descendant from placing an unconstrained object in the registry.</en></lang>
  const validField = field !== null
    && typeof field === 'object'
    && typeof field.token === 'symbol'
    && typeof field.getPath === 'function'
    && typeof field.validate === 'function'
    && typeof field.resetField === 'function'
    && typeof field.clearValidate === 'function';

  if (!validField) {
    throw new TypeError('Invalid form field descriptor.');
  }

  // <lang><zh-CN>实例 token 是唯一身份；相同 prop 的多个渲染字段仍按挂载顺序保留。</zh-CN><en>The instance token is unique identity; multiple rendered fields with the same prop remain in mount order.</en></lang>
  fields.set(field.token, field);
}

/**
 * @lang zh-CN 按同一实例 token 注销字段，避免动态卸载误删相同 prop 的另一实例。
 * @lang en Unregisters a field by the same instance token, preventing dynamic unmount from deleting another instance with the same prop.
 * @param {unknown} token <lang><zh-CN>注册时 Symbol。</zh-CN><en>Symbol used at registration.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function unregisterField(token) {
  // <lang><zh-CN>Map.delete 对未知 token 安全无副作用，且不会按 prop 猜测目标。</zh-CN><en>Map.delete is safely side-effect-free for an unknown token and never guesses a target by prop.</en></lang>
  fields.delete(token);
}

/**
 * @lang zh-CN 取得字段的 form-level 规则；精确 dotted key 优先，安全嵌套读取作为回退。
 * @lang en Resolves form-level rules for a field; an exact dotted key takes precedence, with safe nested lookup as fallback.
 * @param {string} path <lang><zh-CN>已规范字段 key。</zh-CN><en>Canonical field key.</en></lang>
 * @returns {Record<string, unknown>[]} <lang><zh-CN>稳定顺序的新规则数组。</zh-CN><en>New rule array in stable order.</en></lang>
 */
function resolveRules(path) {
  // <lang><zh-CN>规则根不是可遍历对象时返回空集合，不执行隐式转换。</zh-CN><en>Returns an empty collection when the rules root is not traversable and performs no implicit conversion.</en></lang>
  const ruleRoot = currentRules.value;
  if (ruleRoot === null || typeof ruleRoot !== 'object') {
    return [];
  }

  // <lang><zh-CN>直接 dotted key 可表达数组索引且不会与嵌套对象冲突。</zh-CN><en>An exact dotted key can express array indexes without conflicting with a nested object.</en></lang>
  const directRules = Object.prototype.hasOwnProperty.call(ruleRoot, path)
    ? ruleRoot[path]
    : readFieldValue(ruleRoot, path).value;
  return normalizeFormRules(directRules);
}

/**
 * @lang zh-CN 把可选单字段/字段数组选择为当前 registry descriptor；未传参数表示全部字段。
 * @lang en Selects current registry descriptors from an optional field or field array; omission means every field.
 * @param {unknown} paths <lang><zh-CN>string、string[] 或 undefined。</zh-CN><en>String, string array, or undefined.</en></lang>
 * @returns {Array<Record<string, unknown>>} <lang><zh-CN>按挂载顺序选择的 descriptor。</zh-CN><en>Descriptors selected in mount order.</en></lang>
 */
function selectFields(paths) {
  // <lang><zh-CN>无参数复制当前 Map values，后续异步校验不受中途 registry 迭代器变化影响。</zh-CN><en>Without an argument, copies current Map values so later async validation is unaffected by iterator changes in the registry.</en></lang>
  if (paths === undefined) {
    return [...fields.values()];
  }

  // <lang><zh-CN>统一单值与数组；非字符串条目会规范为空并被忽略。</zh-CN><en>Normalizes a scalar and array; nonstring entries canonicalize to empty and are ignored.</en></lang>
  const requestedInputs = Array.isArray(paths) ? paths : [paths];

  // <lang><zh-CN>Set 消除重复选择，但不会折叠 registry 中相同 prop 的不同实例。</zh-CN><en>The Set removes duplicate selectors but does not collapse different registry instances with the same prop.</en></lang>
  const requestedPaths = new Set(requestedInputs.map((path) => canonicalFieldPath(path)).filter(Boolean));

  // <lang><zh-CN>descriptor 动态返回当前 path，使 prop 改变后的选择不会使用旧 key。</zh-CN><en>Descriptors return their current path dynamically, so selection after a prop change never uses a stale key.</en></lang>
  return [...fields.values()].filter((field) => requestedPaths.has(field.getPath()));
}

/**
 * @lang zh-CN 按 registry 顺序运行字段校验并把首字段错误集合投影给 callback；Promise 始终 resolve boolean。
 * @lang en Runs field validation in registry order and projects the field-error collection to a callback; the Promise always resolves a boolean.
 * @param {Array<Record<string, unknown>>} selectedFields <lang><zh-CN>当前字段快照。</zh-CN><en>Current field snapshot.</en></lang>
 * @param {unknown} callback <lang><zh-CN>可选 `(valid, errors)` callback。</zh-CN><en>Optional `(valid, errors)` callback.</en></lang>
 * @returns {Promise<boolean>} <lang><zh-CN>全部通过为 true。</zh-CN><en>True when every field passes.</en></lang>
 */
async function validateSelected(selectedFields, callback) {
  // <lang><zh-CN>Promise.all 保留输入索引顺序；各 field 自己防止旧异步结果覆盖新 UI。</zh-CN><en>Promise.all preserves input index order; each field prevents stale async results from overwriting newer UI.</en></lang>
  const fieldErrors = await Promise.all(selectedFields.map((field) => field.validate('')));

  // <lang><zh-CN>null 表示通过；错误对象按 registry 顺序进入公开数组。</zh-CN><en>Null means success; error objects enter the public array in registry order.</en></lang>
  const errors = fieldErrors.filter((error) => error !== null);

  // <lang><zh-CN>整个表单的 boolean 仅由错误数量导出，不触发 toast、提交或业务状态。</zh-CN><en>The whole-form boolean derives only from error count and triggers no toast, submission, or business state.</en></lang>
  const valid = errors.length === 0;

  // <lang><zh-CN>callback 是兼容面；同步调用并提供新数组，组件不保留其引用。</zh-CN><en>The callback is a compatibility surface; it is invoked synchronously with a new array whose reference the component does not retain.</en></lang>
  if (typeof callback === 'function') {
    callback(valid, [...errors]);
  }
  return valid;
}

/**
 * @lang zh-CN 校验当前全部注册字段。
 * @lang en Validates every currently registered field.
 * @param {unknown} callback <lang><zh-CN>可选兼容 callback。</zh-CN><en>Optional compatibility callback.</en></lang>
 * @returns {Promise<boolean>} <lang><zh-CN>全部通过为 true。</zh-CN><en>True when all pass.</en></lang>
 */
function validate(callback) {
  // <lang><zh-CN>调用开始时冻结字段顺序。</zh-CN><en>Freezes field order at call start.</en></lang>
  return validateSelected(selectFields(), callback);
}

/**
 * @lang zh-CN 校验一个或多个当前注册字段；合法但未注册的选择返回 true。
 * @lang en Validates one or more currently registered fields; a valid but unregistered selection returns true.
 * @param {string | string[]} paths <lang><zh-CN>字段选择。</zh-CN><en>Field selection.</en></lang>
 * @param {unknown} callback <lang><zh-CN>可选兼容 callback。</zh-CN><en>Optional compatibility callback.</en></lang>
 * @returns {Promise<boolean>} <lang><zh-CN>所选字段全部通过为 true。</zh-CN><en>True when all selected fields pass.</en></lang>
 */
function validateField(paths, callback) {
  return validateSelected(selectFields(paths), callback);
}

/**
 * @lang zh-CN 清除全部或所选字段的内部校验投影，并使在途结果失效。
 * @lang en Clears internal validation projection for all or selected fields and invalidates in-flight results.
 * @param {string | string[] | undefined} paths <lang><zh-CN>可选字段选择。</zh-CN><en>Optional field selection.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function clearValidate(paths) {
  // <lang><zh-CN>逐项调用受限 descriptor，不访问 form-item 内部 ref。</zh-CN><en>Calls each constrained descriptor without accessing form-item internal refs.</en></lang>
  for (const field of selectFields(paths)) {
    field.clearValidate();
  }
}

/**
 * @lang zh-CN 显式恢复全部注册字段的挂载快照；该命令是表单组件唯一 model 写入入口。
 * @lang en Explicitly restores mount snapshots for every registered field; this command is the form component's only model-write entry.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function resetFields() {
  // <lang><zh-CN>Map 插入顺序形成稳定 reset 顺序，重复 prop 仍由每个实例独立处理。</zh-CN><en>Map insertion order forms stable reset order, and duplicate props remain independently handled by each instance.</en></lang>
  for (const field of selectFields()) {
    field.resetField();
  }
}

/**
 * @lang zh-CN 显式替换后续使用的规则根并清除旧校验投影；不自动运行新规则。
 * @lang en Explicitly replaces the rules root used later and clears old validation projection; it does not auto-run new rules.
 * @param {unknown} nextRules <lang><zh-CN>调用方新规则对象。</zh-CN><en>New caller rules object.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function setRules(nextRules) {
  // <lang><zh-CN>只接受非数组对象，避免将任意函数或 JSON 字符串解释为规则根。</zh-CN><en>Accepts only a nonarray object, avoiding interpretation of arbitrary functions or JSON strings as a rules root.</en></lang>
  if (nextRules === null || typeof nextRules !== 'object' || Array.isArray(nextRules)) {
    throw new TypeError('Invalid form rules.');
  }

  // <lang><zh-CN>保存调用方引用并取消旧投影；model 与初值快照不变。</zh-CN><en>Retains the caller reference and cancels old projection; model and initial snapshots remain unchanged.</en></lang>
  currentRules.value = nextRules;
  clearValidate();
}

/**
 * @lang zh-CN 请求 submit 意图；disabled 时保持零事件，且不隐式校验或提交。
 * @lang en Requests submit intent; disabled state retains zero events and no validation or submission occurs implicitly.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function requestSubmit() {
  if (!disabled.value) {
    emit('submit');
  }
}

/**
 * @lang zh-CN 请求 reset 意图；为保持既有 HIA 语义，它不隐式调用 resetFields。
 * @lang en Requests reset intent; to retain existing HIA semantics it does not implicitly call resetFields.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function requestReset() {
  if (!disabled.value) {
    emit('reset');
  }
}

// <lang><zh-CN>冻结 context 外壳；子项只能读取 computed 或调用受限方法，不能替换 owner/registry。</zh-CN><en>Freezes the context shell; children may only read computed values or call constrained methods and cannot replace the owner or registry.</en></lang>
provide(U_FORM_CONTEXT, Object.freeze({
  model,
  disabled,
  labelPosition,
  registerField,
  unregisterField,
  resolveRules
}));

// <lang><zh-CN>只暴露使用者 imperative API；内部 registry/context 永不出现在组件 ref。</zh-CN><en>Exposes only consumer imperative APIs; the internal registry and context never appear on the component ref.</en></lang>
defineExpose({ setRules, validate, validateField, clearValidate, resetFields, requestSubmit, requestReset });
</script>

<style src="./u-form.css"></style>
