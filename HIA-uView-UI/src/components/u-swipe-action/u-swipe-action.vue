<!--
@component USwipeAction
@lang zh-CN 提供 caller-controlled 的局部操作投影；它只呈现有限文字操作并报告本地 action/click/close 意图，不执行原生手势、删除、提交、持久化、导航或请求。
@lang en Provides a caller-controlled local action projection; it renders only finite text actions and reports local action/click/close intent without performing native gestures, deletion, submission, persistence, navigation, or requests.
-->
<template>
  <!--
  @lang zh-CN 根只在调用方受控 open/show 为真时投影操作行。
  @lang en The root projects the action row only when caller-controlled open/show is true.
  <lang><zh-CN>这不是平台 swipe 手势、transform 或动画状态机；条件渲染不会写回调用方 prop。</zh-CN><en>This is not a platform swipe gesture, transform, or animation state machine; conditional rendering writes back no caller prop.</en></lang>
  -->
  <view :class="rootClasses">
    <!--
    @lang zh-CN 默认 slot 始终属于调用方内容。
    @lang en The default slot always belongs to caller content.
    <lang><zh-CN>组件不读取、拦截或转发 slot 内部输入、点击、表单或业务事件。</zh-CN><en>The component neither reads, intercepts, nor forwards input, click, form, or business events inside the slot.</en></lang>
    -->
    <view class="u-swipe-action__content"><slot /></view>

    <!--
    @lang zh-CN 操作区仅在受控打开时渲染，并且每个 button 都由受限的归一化 record 驱动。
    @lang en The action area renders only while controlled-open, and every button is driven by a bounded normalized record.
    <lang><zh-CN>不接受任意样式、HTML、回调或业务 command；空 action 集合仍可提供显式关闭 control。</zh-CN><en>It accepts no arbitrary style, HTML, callback, or business command; an empty action collection may still provide the explicit close control.</en></lang>
    -->
    <view v-if="isOpen" class="u-swipe-action__actions">
      <button
        v-for="action in safeActions"
        :key="action.key"
        class="u-swipe-action__action"
        :class="`u-swipe-action__action--${action.type}`"
        type="button"
        :disabled="disabled || action.disabled"
        @click="handleAction(action)"
      >{{ action.label }}</button>
      <button class="u-swipe-action__close" type="button" :disabled="disabled" @click="close">{{ closeText }}</button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

/**
 * @lang zh-CN action 所允许的有限视觉类型；不把调用方对象中的任意字符串直接变为 class。
 * @lang en Finite visual types permitted for an action; no arbitrary string in a caller object becomes a class directly.
 */
const supportedActionTypes = Object.freeze(['primary', 'warning', 'danger']);

// <lang><zh-CN>声明稳定组件名，保持既有模板/manifest/显式 plugin registry 的解析一致。</zh-CN><en>Declares the stable component name, keeping parsing consistent across existing templates, manifest, and explicit plugin registry.</en></lang>
defineOptions({ name: 'u-swipe-action' });

// <lang><zh-CN>所有输入都由调用方拥有，并限于受控打开状态、有限文字操作与禁用呈现；不存在手势、动画、删除或业务 command 输入。</zh-CN><en>All inputs are caller-owned and limited to controlled-open state, finite text actions, and disabled presentation; no gesture, animation, deletion, or business-command input exists.</en></lang>
const props = defineProps({
  // <lang><zh-CN>已有 HIA open 显式提供时优先；undefined 表示使用 show 迁移入口，不是打开状态本身。</zh-CN><en>The existing HIA open takes precedence when explicitly supplied; undefined means use the show migration entry and is not open state itself.</en></lang>
  open: { type: Boolean, default: undefined },
  // <lang><zh-CN>show 是受控迁移入口；它只决定操作行可见性，不启动平台手势或自动关闭。</zh-CN><en>Show is a controlled migration entry; it decides only action-row visibility and starts neither platform gestures nor automatic close.</en></lang>
  show: { type: Boolean, default: false },
  // <lang><zh-CN>actions 是现有 HIA 操作输入；当它非空时优先于迁移 options。</zh-CN><en>Actions is the existing HIA action input; it takes priority over migration options when non-empty.</en></lang>
  actions: { type: Array, default: () => [] },
  // <lang><zh-CN>options 是上游迁移输入；只有 actions 为空时才投影它，避免混合两个操作集合。</zh-CN><en>Options is an upstream migration input; it projects only when actions is empty, avoiding a mixture of two action collections.</en></lang>
  options: { type: Array, default: () => [] },
  // <lang><zh-CN>关闭文字由调用方提供；空值仍按当前私有契约渲染空文字 control，不生成默认业务文案。</zh-CN><en>Close copy is supplied by the caller; an empty value still renders an empty-copy control under the current private contract and generates no default business copy.</en></lang>
  closeText: { type: String, default: 'Close / 关闭' },
  // <lang><zh-CN>disabled 同时控制所有本地 control 的 native attribute 与 handler guard。</zh-CN><en>Disabled controls both native attributes of every local control and their handler guards.</en></lang>
  disabled: { type: Boolean, default: false }
});

// <lang><zh-CN>四个事件只报告 caller-owned 的操作或关闭意图；组件绝不删除记录、提交模型或持久化状态。</zh-CN><en>The four events report only caller-owned action or close intent; the component never deletes a record, submits a model, or persists state.</en></lang>
const emit = defineEmits(['action', 'click', 'close', 'update:open']);

// <lang><zh-CN>open 优先、show 回退的有限规则确保旧入口不被迁移值意外覆盖；组件不合并为共享状态。</zh-CN><en>The finite rule of open precedence with show fallback ensures the old entry is not accidentally overridden by a migration value; the component merges nothing into shared state.</en></lang>
const isOpen = computed(() => props.open ?? props.show);

// <lang><zh-CN>操作输入来源只选择一个受控数组，避免 actions/options 同时产生重复或相互冲突的按钮。</zh-CN><en>The action input source selects only one controlled array, avoiding duplicate or conflicting buttons from actions/options together.</en></lang>
const actionInputs = computed(() => props.actions.length > 0 ? props.actions : props.options);

/**
 * @lang zh-CN 将一个调用方 action/options 值归一为有限可呈现 record；未知输入只转换为安全文字，不执行或保留原始对象能力。
 * @lang en Normalizes one caller action/options value into a finite presentable record; unknown input becomes safe copy only and neither executes nor retains original-object capability.
 * @param {unknown} raw <lang><zh-CN>调用方提供的数组项。</zh-CN><en>Array item supplied by the caller.</en></lang>
 * @param {number} index <lang><zh-CN>受控输入数组中的稳定位置。</zh-CN><en>Stable position in the controlled input array.</en></lang>
 * @returns {{ key: string, value: string|number, label: string, type: string, disabled: boolean }} <lang><zh-CN>可安全呈现和回传的有限 record。</zh-CN><en>Finite record that can be safely rendered and returned.</en></lang>
 */
function normalizeAction(raw, index) {
  // <lang><zh-CN>仅识别非空对象；原始标量只作为 label/value 候选，不获得对象字段语义。</zh-CN><en>Recognizes only non-null objects; a raw scalar is only a label/value candidate and acquires no object-field semantics.</en></lang>
  const isObject = typeof raw === 'object' && raw !== null;

  // <lang><zh-CN>value 按受限回退选择，使空/未知对象仍有稳定 key 而不泄漏对象本身。</zh-CN><en>Selects value through bounded fallback so an empty/unknown object still has a stable key without leaking the object itself.</en></lang>
  const value = isObject ? (raw.value ?? raw.label ?? raw.text ?? index) : raw;

  // <lang><zh-CN>label 接受当前 HIA label 与迁移 text；最终转换只产生可见文字，不渲染 HTML。</zh-CN><en>Label accepts the current HIA label and migration text; final conversion produces visible copy only and renders no HTML.</en></lang>
  const label = String(isObject ? (raw.label ?? raw.text ?? value) : raw);

  // <lang><zh-CN>未知 type 回退 primary，阻断任意 CSS class 注入。</zh-CN><en>An unknown type falls back to primary, blocking arbitrary CSS-class injection.</en></lang>
  const type = isObject && supportedActionTypes.includes(raw.type) ? raw.type : 'primary';

  // <lang><zh-CN>disabled 只从布尔 truthiness 归一，组件不执行 action 对象中的其他字段。</zh-CN><en>Disabled normalizes only Boolean truthiness; the component executes no other field in an action object.</en></lang>
  const disabled = Boolean(isObject && raw.disabled);

  // <lang><zh-CN>key 由有限 value 与数组位置组成；不会使用对象 identity、随机值或时间。</zh-CN><en>Key consists of finite value and array position; it uses no object identity, randomness, or time.</en></lang>
  return Object.freeze({ key: `${String(value)}-${index}`, value, label, type, disabled });
}

// <lang><zh-CN>对唯一受控 action 输入逐项归一；computed 不写入、排序、过滤或修改调用方数组。</zh-CN><en>Normalizes the sole controlled action input item by item; the computed value writes, sorts, filters, and mutates no caller array.</en></lang>
const safeActions = computed(() => actionInputs.value.map((raw, index) => normalizeAction(raw, index)));

// <lang><zh-CN>根 class 仅表示有限 open/disabled 呈现，不代表手势完成、动画进度或业务操作。</zh-CN><en>Root classes represent only finite open/disabled presentation and do not represent gesture completion, animation progress, or business action.</en></lang>
const rootClasses = computed(() => [
  'u-swipe-action',
  {
    'u-swipe-action--open': isOpen.value,
    'u-swipe-action--disabled': props.disabled
  }
]);

/**
 * @lang zh-CN 在启用且 action 可用时依次报告 click 与现有 action 意图；组件不执行其可能代表的删除、提交或其他业务动作。
 * @lang en Reports click and then the existing action intent while enabled and action-available; the component executes no deletion, submission, or other business action it may represent.
 * @param {{ key: string, value: string|number, label: string, type: string, disabled: boolean }} action <lang><zh-CN>已归一的受限操作。</zh-CN><en>Normalized bounded action.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合条件时依次 emit `click` 与 `action`。</zh-CN><en>No return value; when eligible, emits `click` followed by `action`.</en></lang>
 */
function handleAction(action) {
  // <lang><zh-CN>组件禁用或单项禁用时保持零事件，即使测试直接调用 handler。</zh-CN><en>When the component or item is disabled, retains zero events even if a test calls the handler directly.</en></lang>
  if (props.disabled || action.disabled) {
    return;
  }

  // <lang><zh-CN>click 是迁移名称级意图；当前 inventory 不因此声明完整 upstream payload 等价。</zh-CN><en>Click is a migration name-level intent; current inventory does not thereby claim complete upstream payload equivalence.</en></lang>
  emit('click', action.value);

  // <lang><zh-CN>保留既有 action 事件及其同一有限 value，避免破坏当前 HIA 调用方。</zh-CN><en>Retains the existing action event and its same finite value, avoiding breakage for current HIA callers.</en></lang>
  emit('action', action.value);
}

/**
 * @lang zh-CN 在未禁用时请求 open 为 false 并报告 close 意图；组件不写回 open/show，也不启动动画或数据操作。
 * @lang en Requests open false and reports close intent while enabled; the component writes back neither open/show nor starts animation or data work.
 * @returns {void} <lang><zh-CN>无返回值；符合条件时依次 emit `update:open` 与 `close`。</zh-CN><en>No return value; when eligible, emits `update:open` followed by `close`.</en></lang>
 */
function close() {
  // <lang><zh-CN>禁用状态不产生关闭意图，避免原生 button 以外的直接调用绕过调用方状态。</zh-CN><en>A disabled state produces no close intent, preventing a direct call outside the native button from bypassing caller state.</en></lang>
  if (props.disabled) {
    return;
  }

  // <lang><zh-CN>update:open 只是调用方可拒绝的下一值请求；它不保证以 show 驱动的调用方会隐藏。</zh-CN><en>Update:open is only a caller-rejectable next-value request; it does not guarantee a show-driven caller will hide.</en></lang>
  emit('update:open', false);

  // <lang><zh-CN>close 独立报告本地意图，调用方可选择是否更改其任一可见性入口。</zh-CN><en>Close independently reports local intent, and the caller may choose whether to change any of its visibility entries.</en></lang>
  emit('close');
}
</script>

<style src="./u-swipe-action.css"></style>
