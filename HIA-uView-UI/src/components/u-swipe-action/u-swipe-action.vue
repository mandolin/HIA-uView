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

/**
 * @lang zh-CN 单个 swipe-action 实例允许投影的最大操作数，阻止调用方数组无界扩张模板 surface。
 * @lang en Maximum action count one swipe-action instance may project, preventing a caller array from expanding the template surface without bound.
 */
const maximumActionCount = 16;

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

/**
 * @lang zh-CN 选择唯一 caller-owned 操作数组；非空 actions 严格优先于 options，两个来源从不合并。
 * @lang en Selects the sole caller-owned action array; nonempty actions strictly take precedence over options and the two sources are never merged.
 * @returns {unknown[]} <lang><zh-CN>被选择的原始数组引用；后续步骤才创建有限 own-data 快照。</zh-CN><en>The selected raw array reference; a later step creates the bounded own-data snapshot.</en></lang>
 */
function selectActionSource() {
  // <lang><zh-CN>props 类型约束保证两项为数组；这里只观察普通数组 length，不读取任何 action 记录字段。</zh-CN><en>Prop typing guarantees both values are arrays; this observes only ordinary array length and reads no action-record field.</en></lang>
  return props.actions.length > 0 ? props.actions : props.options;
}

// <lang><zh-CN>操作来源 computed 只选择一个数组，不排序、拼接、写入或执行其中的值。</zh-CN><en>The action-source computed selects one array and never sorts, concatenates, writes, or executes its values.</en></lang>
const actionSource = computed(selectActionSource);

/**
 * @lang zh-CN 安全读取记录的 own data descriptor；accessor、继承字段和 descriptor 异常都按缺失处理，普通 getter 不会执行。
 * @lang en Safely reads a record's own data descriptor; accessors, inherited fields, and descriptor errors are treated as absent, and ordinary getters never execute.
 * @param {object} record <lang><zh-CN>待检查的调用方记录。</zh-CN><en>Caller record to inspect.</en></lang>
 * @param {string} field <lang><zh-CN>允许读取的固定字段名。</zh-CN><en>Fixed allowlisted field name to read.</en></lang>
 * @returns {unknown} <lang><zh-CN>own data descriptor 的值，或字段不可安全读取时的 undefined。</zh-CN><en>The own data-descriptor value, or undefined when the field cannot be read safely.</en></lang>
 */
function readOwnDataValue(record, field) {
  try {
    // <lang><zh-CN>descriptor 查询不会调用普通属性 getter；只接受含 value 的 data descriptor。</zh-CN><en>Descriptor lookup does not invoke an ordinary property getter; only a data descriptor containing value is accepted.</en></lang>
    const descriptor = Object.getOwnPropertyDescriptor(record, field);

    // <lang><zh-CN>accessor descriptor 没有 own value，因此与继承或缺失字段一样被忽略。</zh-CN><en>An accessor descriptor has no own value and is therefore ignored like an inherited or absent field.</en></lang>
    return descriptor && Object.prototype.hasOwnProperty.call(descriptor, 'value') ? descriptor.value : undefined;
  } catch {
    // <lang><zh-CN>异常 descriptor/proxy 只令该字段缺失，不传播调用方对象能力或破坏整个操作行。</zh-CN><en>An exceptional descriptor/proxy only makes this field absent and neither propagates caller-object capability nor breaks the entire action row.</en></lang>
    return undefined;
  }
}

/**
 * @lang zh-CN 判断值能否成为有限事件 payload 或可见文字来源。
 * @lang en Determines whether a value may become a bounded event payload or visible-copy source.
 * @param {unknown} value <lang><zh-CN>待验证的调用方值。</zh-CN><en>Caller value to validate.</en></lang>
 * @returns {value is string|number} <lang><zh-CN>仅非空字符串或有限数字返回 true。</zh-CN><en>True only for a nonempty string or finite number.</en></lang>
 */
function isSafeActionScalar(value) {
  // <lang><zh-CN>空字符串不能形成有标签的操作；有限数字包括零但排除 NaN 与 Infinity。</zh-CN><en>An empty string cannot form a labeled action; finite numbers include zero but exclude NaN and Infinity.</en></lang>
  return (typeof value === 'string' && value.length > 0) || (typeof value === 'number' && Number.isFinite(value));
}

/**
 * @lang zh-CN 从调用方数组创建最多 maximumActionCount 项的 own data 快照；数组 accessor 与稀疏/继承项不执行也不进入结果。
 * @lang en Creates an own-data snapshot of at most maximumActionCount entries from a caller array; array accessors and sparse/inherited entries neither execute nor enter the result.
 * @param {unknown[]} source <lang><zh-CN>唯一被选择的 caller-owned 操作数组。</zh-CN><en>The sole selected caller-owned action array.</en></lang>
 * @returns {Array<{ raw: unknown, index: number }>} <lang><zh-CN>保持原位置的有限 data-entry 快照。</zh-CN><en>A bounded data-entry snapshot retaining original positions.</en></lang>
 */
function snapshotActionInputs(source) {
  // <lang><zh-CN>普通数组 length 裁剪为固定上限，防止模板创建无界 control 集合。</zh-CN><en>Ordinary array length is clamped to a fixed limit, preventing the template from creating an unbounded control collection.</en></lang>
  const boundedLength = Math.min(source.length, maximumActionCount);

  // <lang><zh-CN>快照只收集 own data 数组项，不通过 source[index] 触发 accessor。</zh-CN><en>The snapshot collects only own data array entries and does not trigger accessors through source[index].</en></lang>
  const snapshot = [];

  // <lang><zh-CN>按原索引顺序检查有限范围，保持按钮顺序和 key 可预测。</zh-CN><en>Checks the bounded range in original index order, keeping button order and keys predictable.</en></lang>
  for (let index = 0; index < boundedLength; index += 1) {
    try {
      // <lang><zh-CN>数组索引也只通过 own descriptor 读取，稀疏项、继承值和 accessor 均不会执行。</zh-CN><en>Array indices are also read only through own descriptors, so sparse entries, inherited values, and accessors never execute.</en></lang>
      const descriptor = Object.getOwnPropertyDescriptor(source, String(index));

      // <lang><zh-CN>只有 data descriptor 才复制其值和原索引；accessor 或空洞直接跳过。</zh-CN><en>Only a data descriptor contributes its value and original index; an accessor or hole is skipped directly.</en></lang>
      if (descriptor && Object.prototype.hasOwnProperty.call(descriptor, 'value')) {
        snapshot.push({ raw: descriptor.value, index });
      }
    } catch {
      // <lang><zh-CN>单项 descriptor 异常只跳过该项，不读取 fallback 属性或中断其他安全操作。</zh-CN><en>A descriptor error for one entry skips only that entry and neither reads a fallback property nor interrupts other safe actions.</en></lang>
    }
  }

  // <lang><zh-CN>返回新数组而非调用方引用，后续归一化无法重排或写入原始集合。</zh-CN><en>Returns a new array rather than the caller reference, so later normalization cannot reorder or write the original collection.</en></lang>
  return snapshot;
}

/**
 * @lang zh-CN 将一个调用方 action/options 快照值归一为有限可呈现 record；只读取 allowlisted own data 字段，未知输入不执行或保留原始对象能力。
 * @lang en Normalizes one caller action/options snapshot value into a finite presentable record; it reads only allowlisted own data fields and neither executes nor retains unknown input capability.
 * @param {unknown} raw <lang><zh-CN>调用方提供的数组项。</zh-CN><en>Array item supplied by the caller.</en></lang>
 * @param {number} index <lang><zh-CN>受控输入数组中的稳定位置。</zh-CN><en>Stable position in the controlled input array.</en></lang>
 * @returns {{ key: string, value: string|number, label: string, type: string, disabled: boolean }|null} <lang><zh-CN>可安全呈现和回传的有限 record；无安全文字时返回 null。</zh-CN><en>A finite record safe to render and return, or null when no safe copy exists.</en></lang>
 */
function normalizeAction(raw, index) {
  // <lang><zh-CN>安全字符串/有限数字标量可直接同时成为 label 与 payload；其他非对象值没有可执行或可见语义，直接跳过。</zh-CN><en>A safe string or finite-number scalar may directly become both label and payload; other nonobject values have no executable or visible meaning and are skipped.</en></lang>
  if (isSafeActionScalar(raw)) {
    return Object.freeze({
      key: `${typeof raw}:${String(raw)}-${index}`,
      value: raw,
      label: String(raw),
      type: 'primary',
      disabled: false
    });
  }

  // <lang><zh-CN>函数、null 与其他非对象值不读取字段、不转字符串，也不创建无标签按钮。</zh-CN><en>Functions, null, and other nonobject values have no fields read, are not stringified, and create no unlabeled button.</en></lang>
  if (typeof raw !== 'object' || raw === null) {
    return null;
  }

  // <lang><zh-CN>当前 HIA label 优先于迁移 text，但两者都只允许 own data 的字符串或有限数字。</zh-CN><en>The current HIA label takes precedence over migration text, while both permit only an own-data string or finite number.</en></lang>
  const rawLabel = readOwnDataValue(raw, 'label');
  const rawText = readOwnDataValue(raw, 'text');
  const copyCandidate = isSafeActionScalar(rawLabel) ? rawLabel : (isSafeActionScalar(rawText) ? rawText : undefined);

  // <lang><zh-CN>value 只接受 own data 的安全标量；对象、函数、symbol、bigint、NaN 与 Infinity 不会成为事件 payload。</zh-CN><en>Value accepts only a safe own-data scalar; objects, functions, symbols, bigints, NaN, and Infinity never become event payloads.</en></lang>
  const rawValue = readOwnDataValue(raw, 'value');
  const safeValue = isSafeActionScalar(rawValue) ? rawValue : undefined;

  // <lang><zh-CN>缺少安全 label/text 时可用安全 value 作为可见文字；两类值均缺失则完整跳过记录。</zh-CN><en>When safe label/text is absent, a safe value may supply visible copy; if both categories are absent, the record is skipped completely.</en></lang>
  const labelSource = copyCandidate ?? safeValue;
  if (labelSource === undefined) {
    return null;
  }

  // <lang><zh-CN>非法或缺失 value 回退到同一安全文字标量，因此最终 payload 始终为 string|number。</zh-CN><en>An invalid or absent value falls back to the same safe copy scalar, so the final payload is always string|number.</en></lang>
  const value = safeValue ?? labelSource;

  // <lang><zh-CN>可见 label 只做纯文字转换，不渲染 HTML，也不保留对象 identity。</zh-CN><en>The visible label undergoes only plain-text conversion, renders no HTML, and retains no object identity.</en></lang>
  const label = String(labelSource);

  // <lang><zh-CN>未知或 accessor type 回退 primary，阻断 getter 执行与任意 CSS class 注入。</zh-CN><en>An unknown or accessor type falls back to primary, blocking getter execution and arbitrary CSS-class injection.</en></lang>
  const rawType = readOwnDataValue(raw, 'type');
  const type = supportedActionTypes.includes(rawType) ? rawType : 'primary';

  // <lang><zh-CN>只有严格布尔 true 的 own data disabled 才禁用该项；truthy 对象或字符串不扩大状态语义。</zh-CN><en>Only strict Boolean true from own-data disabled disables the item; truthy objects or strings do not broaden state meaning.</en></lang>
  const disabled = readOwnDataValue(raw, 'disabled') === true;

  // <lang><zh-CN>key 由有限 value 与数组位置组成；不会使用对象 identity、随机值或时间。</zh-CN><en>Key consists of finite value and array position; it uses no object identity, randomness, or time.</en></lang>
  return Object.freeze({ key: `${typeof value}:${String(value)}-${index}`, value, label, type, disabled });
}

/**
 * @lang zh-CN 从唯一来源构建有限、不可执行、仅含安全 payload 的展示记录集合。
 * @lang en Builds a bounded, non-executable presentation-record collection containing only safe payloads from the sole source.
 * @returns {Array<{ key: string, value: string|number, label: string, type: string, disabled: boolean }>} <lang><zh-CN>按原索引顺序保留的安全操作集合。</zh-CN><en>Safe actions retained in original-index order.</en></lang>
 */
function buildSafeActions() {
  // <lang><zh-CN>先取得有限 own-data 数组快照，后续循环从不访问原始 source[index]。</zh-CN><en>First obtains a bounded own-data array snapshot; the later loop never accesses raw source[index].</en></lang>
  const inputs = snapshotActionInputs(actionSource.value);

  // <lang><zh-CN>结果仅接收成功归一的 record；null 项表示无安全 label/payload 并被跳过。</zh-CN><en>The result accepts only successfully normalized records; a null entry means no safe label/payload and is skipped.</en></lang>
  const actions = [];

  // <lang><zh-CN>按快照顺序逐项归一，同时保留原数组索引用于稳定 key。</zh-CN><en>Normalizes in snapshot order while retaining original array indices for stable keys.</en></lang>
  for (const input of inputs) {
    // <lang><zh-CN>归一化只读 allowlisted own data descriptor，不执行 callback 或普通 getter。</zh-CN><en>Normalization reads only allowlisted own data descriptors and executes no callback or ordinary getter.</en></lang>
    const normalized = normalizeAction(input.raw, input.index);

    // <lang><zh-CN>无安全内容的记录不创建按钮，也不会产生任何事件 payload。</zh-CN><en>A record without safe content creates no button and can produce no event payload.</en></lang>
    if (normalized !== null) {
      actions.push(normalized);
    }
  }

  // <lang><zh-CN>冻结集合防止模板或内部后续步骤改变顺序；调用方原数组始终未写入。</zh-CN><en>Freezes the collection so neither the template nor later internal steps can change order; the caller array is never written.</en></lang>
  return Object.freeze(actions);
}

// <lang><zh-CN>安全操作 computed 仅在 caller-owned 来源变化时重建有限快照，不建立内部业务状态。</zh-CN><en>The safe-actions computed rebuilds a bounded snapshot only when the caller-owned source changes and creates no internal business state.</en></lang>
const safeActions = computed(buildSafeActions);

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
