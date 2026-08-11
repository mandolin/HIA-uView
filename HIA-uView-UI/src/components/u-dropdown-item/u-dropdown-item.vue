<!--
@component UDropdownItem
@lang zh-CN 保留 legacy 单值按钮，并以显式 name 提供 caller-owned options/modelValue/show 模式；不执行命令、路由或删除。
@lang en Retains the legacy single-value button and provides caller-owned options/modelValue/show mode through an explicit name; it executes no command, route, or deletion.
-->
<template>
  <button
    v-if="!isOptionsMode"
    class="u-dropdown-item"
    :class="{ 'u-dropdown-item--selected': isLegacySelected, 'u-dropdown-item--disabled': isLegacyDisabled }"
    type="button"
    role="option"
    :aria-selected="isLegacySelected"
    :disabled="isLegacyDisabled"
    @click="handleClick"
  >
    <slot>{{ props.label }}</slot>
  </button>
  <view v-else-if="props.show" class="u-dropdown-item__controlled">
    <button
      class="u-dropdown-item u-dropdown-item__trigger"
      :class="{ 'u-dropdown-item--selected': isPanelOpen, 'u-dropdown-item--disabled': isOptionsDisabled }"
      type="button"
      :aria-expanded="isPanelOpen"
      :disabled="isOptionsDisabled"
      @click="handleTriggerClick"
    >
      {{ triggerLabel }}
    </button>
    <view v-if="isPanelOpen" class="u-dropdown-item__panel" role="listbox">
      <slot>
        <button
          v-for="option in safeOptions"
          :key="option.key"
          class="u-dropdown-item u-dropdown-item__option"
          :class="{ 'u-dropdown-item--selected': selectedOption?.index === option.index, 'u-dropdown-item--disabled': option.disabled }"
          type="button"
          role="option"
          :aria-selected="selectedOption?.index === option.index"
          :disabled="option.disabled"
          @click="handleOptionClick(option)"
        >
          {{ option.label }}
        </button>
      </slot>
    </view>
  </view>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, ref, watch } from 'vue';
import { DROPDOWN_CONTEXT, isDropdownName } from '../dropdown-context.mjs';

// <lang><zh-CN>保留 u- 名称，降低从相关 uView dropdown-item 迁移的障碍。</zh-CN><en>Retains the u- name to reduce migration friction from related uView dropdown-item components.</en></lang>
defineOptions({ name: 'u-dropdown-item' });

// <lang><zh-CN>所有值、有限 options 与可见性均来自 caller；组件不读取远端集合或修改输入数组。</zh-CN><en>All values, finite options, and visibility come from the caller; the component reads no remote collection and mutates no input array.</en></lang>
const props = defineProps({
  value: { type: [String, Number], default: '' },
  name: { type: [String, Number], default: undefined },
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  modelValue: { type: [String, Number, Array], default: '' },
  options: { type: Array, default: () => [] },
  show: { type: Boolean, default: true }
});

// <lang><zh-CN>legacy select 与受控 model 事件严格分属两种模式，不互相补发。</zh-CN><en>Legacy select and controlled-model events belong strictly to separate modes and never backfill one another.</en></lang>
const emit = defineEmits(['select', 'update:modelValue', 'change']);

// <lang><zh-CN>context 缺失是受支持的 legacy 独立模式，但显式 name 模式必须保持 inert。</zh-CN><en>A missing context is supported for independent legacy mode, while explicit-name mode must remain inert.</en></lang>
const context = inject(DROPDOWN_CONTEXT, null);

// <lang><zh-CN>每个实例使用不可猜测 token，duplicate child 无法卸载或操控 owner。</zh-CN><en>Each instance uses an unguessable token so a duplicate child cannot unregister or control the owner.</en></lang>
const itemToken = Symbol('u-dropdown-item-owner');

// <lang><zh-CN>显式提供 name 即进入 options 模式；非法 name 不退回 legacy 以免误发 select。</zh-CN><en>Providing name explicitly enters options mode; an invalid name never falls back to legacy and accidentally emits select.</en></lang>
const isOptionsMode = computed(() => props.name !== undefined);

// <lang><zh-CN>合法 identity 保留原始字符串/数字类型；null 只表示当前 name 无法注册。</zh-CN><en>A valid identity preserves its original string/number type; null only means the current name cannot register.</en></lang>
const optionName = computed(() => isDropdownName(props.name) ? props.name : null);

// <lang><zh-CN>parent disabled 是只读组合边界；缺失 context 不影响 legacy 独立按钮。</zh-CN><en>Parent disabled is a readonly composition boundary; a missing context does not affect an independent legacy button.</en></lang>
const parentDisabled = computed(() => Boolean(context?.disabled?.value));

// <lang><zh-CN>legacy selected 只比较 parent legacy model，不读取 registry activeName。</zh-CN><en>Legacy selected compares only the parent legacy model and never reads registry activeName.</en></lang>
const isLegacySelected = computed(() => context?.activeValue?.value === props.value);

// <lang><zh-CN>legacy 禁用由 child 与 parent guard 合并，仍允许无 parent 的独立选择意图。</zh-CN><en>Legacy disabled combines child and parent guards while still allowing independent intent without a parent.</en></lang>
const isLegacyDisabled = computed(() => props.disabled || parentDisabled.value);

// <lang><zh-CN>注册结果属于本实例短生命状态；duplicate、missing parent 与非法 name 都保持 false。</zh-CN><en>Registration outcome is short-lived instance state; duplicate, missing-parent, and invalid-name cases remain false.</en></lang>
const isRegistered = ref(false);

// <lang><zh-CN>记录准确注册 name 以便 prop 变化或卸载时用同一 token 清理。</zh-CN><en>Records the exact registered name so prop changes or unmount can clean it with the same token.</en></lang>
let registeredName = null;

/**
 * @lang zh-CN 判断 option/model 值是否属于受控 dropdown-item 的有限透明值域，包括只读透明值数组。
 * @lang en Determines whether an option/model value belongs to the controlled dropdown-item's finite transparent domain, including readonly arrays of transparent values.
 * @param {unknown} value <lang><zh-CN>待验证的 caller 值。</zh-CN><en>Caller value to validate.</en></lang>
 * @returns {boolean} <lang><zh-CN>值是否可原样比较与交付。</zh-CN><en>Whether the value can be compared and delivered unchanged.</en></lang>
 */
function isDropdownItemValue(value) {
  // <lang><zh-CN>单值复用严格 name 值域；数组必须逐项通过且不被组件修改。</zh-CN><en>Scalar values reuse the strict name domain; arrays must pass item by item and are never mutated by the component.</en></lang>
  return isDropdownName(value) || (Array.isArray(value) && value.every((entry) => isDropdownName(entry)));
}

/**
 * @lang zh-CN 判断对象是否直接拥有 option 字段，防止原型链属性进入公开 payload。
 * @lang en Determines whether an object directly owns an option field, preventing prototype-chain properties from entering public payloads.
 * @param {unknown} candidate <lang><zh-CN>候选 option。</zh-CN><en>Candidate option.</en></lang>
 * @param {string} key <lang><zh-CN>浅层字段名。</zh-CN><en>Shallow field name.</en></lang>
 * @returns {boolean} <lang><zh-CN>字段是否为对象自有属性。</zh-CN><en>Whether the field is an own property.</en></lang>
 */
function hasOwn(candidate, key) {
  // <lang><zh-CN>仅接受非 null 对象并调用原生 own-property 检查。</zh-CN><en>Accepts only non-null objects and invokes the native own-property check.</en></lang>
  return typeof candidate === 'object' && candidate !== null && Object.prototype.hasOwnProperty.call(candidate, key);
}

/**
 * @lang zh-CN 将一个 caller option 复制为不可变局部记录，不修改或执行 caller 数据。
 * @lang en Copies one caller option into an immutable local record without mutating or executing caller data.
 * @param {unknown} raw <lang><zh-CN>原始 option。</zh-CN><en>Raw option.</en></lang>
 * @param {number} index <lang><zh-CN>稳定的零基位置。</zh-CN><en>Stable zero-based position.</en></lang>
 * @returns {{key:string,index:number,label:string,value:string|number|ReadonlyArray<string|number>,disabled:boolean,raw:unknown}} <lang><zh-CN>受限局部 option。</zh-CN><en>Bounded local option.</en></lang>
 */
function normalizeOption(raw, index) {
  // <lang><zh-CN>优先使用自有 value，其次使用自有 label；非法或缺失值回退到有限 index。</zh-CN><en>Prefers an own value, then an own label; an invalid or missing value falls back to the finite index.</en></lang>
  const valueCandidate = hasOwn(raw, 'value') ? raw.value : (hasOwn(raw, 'label') ? raw.label : index);

  // <lang><zh-CN>保留有效数组引用以维持 caller ownership 与严格相等语义；否则使用 index。</zh-CN><en>Preserves a valid array reference for caller ownership and strict-equality semantics; otherwise uses the index.</en></lang>
  const value = isDropdownItemValue(valueCandidate) ? valueCandidate : index;

  // <lang><zh-CN>可见 label 只接受可安全字符串化的标量；对象与数组回退到一基序号。</zh-CN><en>The visible label accepts only safely stringifiable scalars; objects and arrays fall back to the one-based ordinal.</en></lang>
  const labelCandidate = hasOwn(raw, 'label') ? raw.label : (hasOwn(raw, 'value') ? raw.value : index + 1);
  const label = labelCandidate === null || labelCandidate === undefined || typeof labelCandidate === 'object' ? String(index + 1) : String(labelCandidate);

  // <lang><zh-CN>disabled 仅从自有字段解析，不执行 getter 之外的任意逻辑或命令。</zh-CN><en>Disabled is resolved only from an own field and executes no arbitrary logic or command beyond property access.</en></lang>
  const disabledValue = Boolean(hasOwn(raw, 'disabled') && raw.disabled);
  return Object.freeze({ key: `option-${index}`, index, label, value, disabled: disabledValue, raw });
}

// <lang><zh-CN>所有呈现与选择 handler 消费同一不可变映射，不排序、过滤或修改 caller options。</zh-CN><en>All presentation and selection handlers consume the same immutable mapping without sorting, filtering, or mutating caller options.</en></lang>
const safeOptions = computed(() => Object.freeze(props.options.map((raw, index) => normalizeOption(raw, index))));

// <lang><zh-CN>重复值按首个 enabled option 解析，数组仅按引用严格相等，不做隐式深比较。</zh-CN><en>Duplicate values resolve to the first enabled option, and arrays use strict reference equality without implicit deep comparison.</en></lang>
const selectedOption = computed(() => safeOptions.value.find((option) => !option.disabled && option.value === props.modelValue) || null);

// <lang><zh-CN>静态 label 优先；未提供时只回退到 caller model 匹配项的可见 label。</zh-CN><en>The static label takes precedence; when absent, only the caller-model match supplies the visible fallback label.</en></lang>
const triggerLabel = computed(() => props.label || selectedOption.value?.label || '');

// <lang><zh-CN>options trigger 在缺 parent、注册失败、任一 disabled guard 或 show=false 时不可交互。</zh-CN><en>The options trigger is non-interactive with a missing parent, failed registration, either disabled guard, or show=false.</en></lang>
const isOptionsDisabled = computed(() => !context || !isRegistered.value || props.disabled || parentDisabled.value || !props.show);

// <lang><zh-CN>panel 只在当前 token owner 是唯一 active item 时呈现；name 相等但重复注册失败的 child 不会泄漏内容。</zh-CN><en>The panel renders only when this token owner is the sole active item; a duplicate child with the same name cannot leak content.</en></lang>
const isPanelOpen = computed(() => Boolean(context && isRegistered.value && props.show && !props.disabled && !parentDisabled.value && context.activeName?.value === optionName.value));

/**
 * @lang zh-CN 按准确 name/token 清理当前注册，避免 duplicate 或陈旧实例移除 owner。
 * @lang en Cleans the current registration by exact name/token so duplicate or stale instances cannot remove the owner.
 * @returns {void} <lang><zh-CN>无返回值；只同步本地注册状态。</zh-CN><en>No return value; synchronizes local registration state only.</en></lang>
 */
function unregisterCurrent() {
  // <lang><zh-CN>null 表示本实例当前没有成功拥有任何 registry name。</zh-CN><en>Null means this instance currently owns no registry name successfully.</en></lang>
  if (!context || registeredName === null) {
    isRegistered.value = false;
    return;
  }

  // <lang><zh-CN>父级会验证 token；随后无条件清空本地 owner 快照。</zh-CN><en>The parent verifies the token; the local owner snapshot is then cleared unconditionally.</en></lang>
  context.unregisterItem(registeredName, itemToken);
  registeredName = null;
  isRegistered.value = false;
}

/**
 * @lang zh-CN 在 name/show 变化后重建 exact-token 注册；missing parent、非法 name 与 show=false 都保持 inert。
 * @lang en Rebuilds exact-token registration after name/show changes; missing parent, invalid name, and show=false remain inert.
 * @returns {void} <lang><zh-CN>无返回值；只更新私有组合关系。</zh-CN><en>No return value; updates only the private composition relationship.</en></lang>
 */
function syncRegistration() {
  // <lang><zh-CN>先清旧 owner，确保动态 name 永远不会同时占用两个 registry entry。</zh-CN><en>Clears the old owner first so a dynamic name never occupies two registry entries simultaneously.</en></lang>
  unregisterCurrent();

  // <lang><zh-CN>只有显式 options 模式、有效 name、可见状态和 parent context 才能尝试注册。</zh-CN><en>Only explicit options mode, a valid name, visible state, and a parent context may attempt registration.</en></lang>
  if (!context || !isOptionsMode.value || optionName.value === null || !props.show) return;

  // <lang><zh-CN>guard 每次 open 时读取最新 show/disabled，不把 prop 快照复制进 registry。</zh-CN><en>The guard reads current show/disabled values on every open rather than copying prop snapshots into the registry.</en></lang>
  const registered = context.registerItem(optionName.value, itemToken, () => props.show && !props.disabled);

  // <lang><zh-CN>只有 first-wins 成功时记录 owner；duplicate 保持 false 且不覆盖 parent。</zh-CN><en>Records ownership only after first-wins success; a duplicate remains false and never replaces the parent entry.</en></lang>
  if (!registered) return;
  registeredName = optionName.value;
  isRegistered.value = true;
}

// <lang><zh-CN>name 与 show 决定 registry membership；disabled 只决定可打开性而不改变 identity ownership。</zh-CN><en>Name and show determine registry membership; disabled controls openability without changing identity ownership.</en></lang>
watch([optionName, () => props.show], syncRegistration, { immediate: true, flush: 'sync' });

// <lang><zh-CN>active item 运行期进入 disabled 时静默失效，重新启用不会自动重开。</zh-CN><en>When an active item becomes disabled at runtime it is invalidated silently, and re-enabling never reopens it automatically.</en></lang>
watch(() => props.disabled, (nextDisabled) => {
  // <lang><zh-CN>只处理成功 owner 的 true 转态；其他变化保持 active state 原样。</zh-CN><en>Handles only a true transition for a successful owner; other changes preserve active state.</en></lang>
  if (nextDisabled && context && registeredName !== null) context.invalidateItem(registeredName, itemToken);
}, { flush: 'sync' });

// <lang><zh-CN>组件卸载前执行 exact-token unregister，父级不会留下陈旧 active identity。</zh-CN><en>Exact-token unregister runs before unmount so the parent retains no stale active identity.</en></lang>
onBeforeUnmount(unregisterCurrent);

/**
 * @lang zh-CN 处理 legacy 单值按钮；优先交给父级 legacy context，否则报告独立 select 意图。
 * @lang en Handles the legacy single-value button; delegates to the parent legacy context first, otherwise reporting independent select intent.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleClick() {
  // <lang><zh-CN>handler 再次确认模式与 disabled，直接调用也不能绕过模板 guard。</zh-CN><en>The handler rechecks mode and disabled state so direct invocation cannot bypass template guards.</en></lang>
  if (isOptionsMode.value || isLegacyDisabled.value || !isDropdownName(props.value)) return;

  // <lang><zh-CN>组合模式先让父级按 update→change 报告；独立模式不伪造父级事件。</zh-CN><en>Composition mode first lets the parent report update then change; independent mode fabricates no parent event.</en></lang>
  if (context && !context.selectLegacyValue(props.value)) return;

  // <lang><zh-CN>既有 select 最后交付同一 raw value，保持 legacy 调用方顺序。</zh-CN><en>The existing select event finally delivers the same raw value, preserving legacy caller order.</en></lang>
  emit('select', props.value);
}

/**
 * @lang zh-CN 切换当前显式注册 item；打开不发事件，再次点击 active trigger 通过父级 close 报告 raw name。
 * @lang en Toggles the explicitly registered item; opening emits nothing, while clicking the active trigger again reports its raw name through the parent close event.
 * @returns {void} <lang><zh-CN>无返回值；失败路径是零事件 no-op。</zh-CN><en>No return value; failure paths are zero-event no-ops.</en></lang>
 */
function handleTriggerClick() {
  // <lang><zh-CN>missing parent、duplicate、非法 name、hidden 或 disabled 均不可进入 registry 状态机。</zh-CN><en>A missing parent, duplicate, invalid name, hidden state, or disabled state cannot enter the registry state machine.</en></lang>
  if (!context || !isRegistered.value || optionName.value === null || isOptionsDisabled.value) return;

  // <lang><zh-CN>active trigger 请求真正 close；inactive trigger 只请求 open，不补发 P2 open 事件。</zh-CN><en>An active trigger requests a real close; an inactive trigger only requests open and does not backfill the P2 open event.</en></lang>
  if (isPanelOpen.value) context.requestClose(optionName.value, itemToken);
  else context.requestOpen(optionName.value, itemToken);
}

/**
 * @lang zh-CN 选择当前 panel 中一个 enabled option，并冻结 update→parent close→change 的上游熟悉顺序。
 * @lang en Selects one enabled option from the current panel and freezes the upstream-familiar update-to-parent-close-to-change ordering.
 * @param {{index:number,value:unknown,disabled:boolean}} option <lang><zh-CN>来自当前 safeOptions 的局部记录。</zh-CN><en>Local record from the current safeOptions collection.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；失效、禁用或陈旧 option 不发事件。</zh-CN><en>No return value; invalid, disabled, or stale options emit nothing.</en></lang>
 */
function handleOptionClick(option) {
  // <lang><zh-CN>按 index 回读当前映射并要求对象 identity 相同，陈旧 handler 参数不能写 model。</zh-CN><en>Reads the current mapping by index and requires identical object identity, so stale handler arguments cannot write the model.</en></lang>
  const currentOption = safeOptions.value[option?.index];

  // <lang><zh-CN>panel、owner、option identity 和 disabled guard 必须同时有效。</zh-CN><en>Panel, owner, option identity, and disabled guards must all be valid together.</en></lang>
  if (!isPanelOpen.value || !currentOption || currentOption !== option || currentOption.disabled || !isDropdownItemValue(currentOption.value)) return;

  // <lang><zh-CN>第一步交付 caller-owned model intent；组件不直接修改 prop 或 option value 数组。</zh-CN><en>First delivers caller-owned model intent; the component directly mutates neither the prop nor an option-value array.</en></lang>
  emit('update:modelValue', currentOption.value);

  // <lang><zh-CN>第二步由 exact owner 关闭 parent active state并发 raw-name close。</zh-CN><en>Second, the exact owner closes parent active state and emits the raw-name close event.</en></lang>
  context.requestClose(optionName.value, itemToken);

  // <lang><zh-CN>第三步交付既有 change；即使值与 caller 当前值相同也保留明确点击语义。</zh-CN><en>Third delivers the existing change event; an explicit click is preserved even when the value equals the caller's current value.</en></lang>
  emit('change', currentOption.value);
}
</script>

<style src="./u-dropdown-item.css"></style>
