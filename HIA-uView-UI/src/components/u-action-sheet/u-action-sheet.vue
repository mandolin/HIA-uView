<!--
@component UActionSheet
@lang zh-CN 提供调用方声明的有限 action 列表、首个受控 selected 投影、default slot、受控 modelValue 与有序 select/click/close intent/component-ref close；不执行命令、导航、权限或异步 provider。
@lang en Provides a caller-declared finite action list, first controlled selected projection, default slot, controlled modelValue, and ordered select/click/close intent/component-ref close; it executes no command, navigation, authorization, or async provider.
-->
<template>
  <!--
  @lang zh-CN Action sheet 只在当前受控值可见时建立局部遮罩与 panel。
  @lang en The action sheet creates its local mask and panel only while the current controlled value is visible.
  <lang><zh-CN>模板不创建 portal、页面 host、路由或全局关闭机制；所有关闭和选择都只是 intent。</zh-CN><en>The template creates no portal, page host, router, or global close mechanism; every close and selection remains intent only.</en></lang>
  -->
  <view v-if="isVisible" class="u-action-sheet">
    <view class="u-action-sheet__mask" @click="handleMaskClick" />
    <view class="u-action-sheet__panel">
      <text v-if="title" class="u-action-sheet__title">{{ title }}</text>
      <!--
      @lang zh-CN 可滚动选项区同时承载调用方 slot 与有限 item；title、cancel 和底部安全区不随长列表滚动。
      @lang en The scrollable options region contains both the caller slot and finite items; the title, cancel control, and bottom safe area remain outside long-list scrolling.
      <lang><zh-CN>滚动只解决有限列表在较矮视口中的呈现，不请求远端数据、虚拟化记录或解释 item 值。</zh-CN><en>Scrolling only presents a finite list in shorter viewports and neither requests remote data, virtualizes records, nor interprets item values.</en></lang>
      -->
      <scroll-view class="u-action-sheet__options" scroll-y>
        <view class="u-action-sheet__content"><slot /></view>
        <!--
        @lang zh-CN 每个条目保留原生 disabled、合法 button aria-pressed 与显式状态类；只有规范化后的首个 selected 条目呈现当前态。
        @lang en Every item retains native disabled, legal button aria-pressed, and explicit state classes; only the first normalized selected item presents the current state.
        <lang><zh-CN>独立勾选与 selectedText 不进入业务 label 或 select payload；选中呈现不改变条目顺序、透明 value、事件顺序或关闭行为。</zh-CN><en>The independent check and selectedText enter neither the business label nor the select payload; selected presentation changes no item order, transparent value, event order, or close behavior.</en></lang>
        -->
        <button
          v-for="(item, index) in safeItems"
          :key="item.key"
          class="u-action-sheet__item"
          :class="{ 'u-action-sheet__item--disabled': item.disabled, 'u-action-sheet__item--selected': item.selected }"
          type="button"
          :disabled="item.disabled"
          :aria-pressed="item.selected"
          @click="handleSelect(item, index)"
        >
          <text v-if="item.selected" class="u-action-sheet__selected-check" aria-hidden="true">✓</text>
          <text class="u-action-sheet__label">{{ item.label }}</text>
          <text v-if="item.selected && selectedText" class="u-action-sheet__selected-text">{{ selectedText }}</text>
        </button>
      </scroll-view>
      <button v-if="cancelText" class="u-action-sheet__cancel" type="button" @click="handleCancel">{{ cancelText }}</button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>action sheet 只消费声明式 items，不读取菜单服务或执行 item 语义。</zh-CN><en>The action sheet consumes declarative items only and reads no menu service or executes item meaning.</en></lang>
defineOptions({ name: 'u-action-sheet' });

// <lang><zh-CN>输入仅包含调用方拥有的受控可见性、有限文字列表、当前项状态文案和显式遮罩关闭许可。</zh-CN><en>Inputs contain only caller-owned controlled visibility, a finite text list, current-item status copy, and explicit mask-close permission.</en></lang>
const props = defineProps({
  // <lang><zh-CN>已有 HIA visible 若明确提供则优先；undefined 才允许回退 modelValue。</zh-CN><en>The existing HIA visible takes precedence when explicitly supplied; only undefined permits falling back to modelValue.</en></lang>
  visible: { type: Boolean, default: undefined },
  // <lang><zh-CN>modelValue 是受控迁移入口；组件只通过 update event 请求 false，不直接写回。</zh-CN><en>ModelValue is a controlled migration entry; the component only requests false through an update event and never writes it back directly.</en></lang>
  modelValue: { type: Boolean, default: false },
  // <lang><zh-CN>title 是可选调用方文字，不从 action value 或业务上下文推导。</zh-CN><en>Title is optional caller copy and is not derived from an action value or business context.</en></lang>
  title: { type: String, default: '' },
  // <lang><zh-CN>items 只接受有限声明式条目；normalizer 不执行 getter、value 或任意命令字段。</zh-CN><en>Items accepts only finite declarative entries; the normalizer executes no getter, value, or arbitrary command field.</en></lang>
  items: { type: Array, default: () => [] },
  // <lang><zh-CN>非空 cancelText 才创建有名称的取消 control，组件不制造默认文案。</zh-CN><en>Only nonempty cancelText creates a named cancel control, and the component invents no default copy.</en></lang>
  cancelText: { type: String, default: '' },
  // <lang><zh-CN>selectedText 是首个 selected item 旁的调用方状态文案；空值仍保留独立勾选和 aria-pressed，不生成默认语言。</zh-CN><en>SelectedText is caller status copy beside the first selected item; an empty value retains the independent check and aria-pressed without inventing default language.</en></lang>
  selectedText: { type: String, default: '' },
  // <lang><zh-CN>maskClosable 仅授权 mask 产生受控关闭意图，不自动隐藏 sheet。</zh-CN><en>MaskClosable only authorizes the mask to produce controlled close intent and never hides the sheet automatically.</en></lang>
  maskClosable: { type: Boolean, default: false }
});

// <lang><zh-CN>update:modelValue 与 close 形成严格有序关闭对，select 与 click 形成严格有序选择对；没有事件执行 action。</zh-CN><en>Update:modelValue and close form a strictly ordered close pair, while select and click form a strictly ordered selection pair; no event executes an action.</en></lang>
const emit = defineEmits(['update:modelValue', 'close', 'select', 'click']);

// <lang><zh-CN>显式 visible 严格优先；省略时 modelValue 才控制当前局部树。</zh-CN><en>Explicit visible has strict precedence; modelValue controls the current local tree only when visible is omitted.</en></lang>
const isVisible = computed(() => props.visible ?? props.modelValue);

/**
 * @lang zh-CN 把一个声明式 action-sheet 条目收束为纯数据视图；只读取自有 data descriptor，保留显式 `null`/对象 value，但从不 coercion 或执行它。
 * @lang en Constrains one declarative action-sheet item to a plain-data view; it reads only own data descriptors and preserves explicit `null`/object values without coercing or executing them.
 * @param {unknown} item <lang><zh-CN>调用方数组条目。</zh-CN><en>Caller array item.</en></lang>
 * @param {number} index <lang><zh-CN>原数组中的稳定索引。</zh-CN><en>Stable index in the original array.</en></lang>
 * @returns {Readonly<{key:string,label:string,value:unknown,disabled:boolean,selected:boolean}>|null} <lang><zh-CN>有限条目或不可安全呈现标记。</zh-CN><en>Finite item or an unsafe-to-render marker.</en></lang>
 */
function normalizeActionSheetItem(item, index) {
  // <lang><zh-CN>字符串是唯一 primitive 简写，文字和值保持同一 primitive。</zh-CN><en>A string is the sole primitive shorthand, retaining the same primitive as copy and value.</en></lang>
  if (typeof item === 'string') {
    return item.length > 0
      ? Object.freeze({ key: String(index), label: item, value: item, disabled: false, selected: false })
      : null;
  }

  // <lang><zh-CN>其余条目必须是非数组对象；function/class/数字均不进入呈现面。</zh-CN><en>Every other item must be a non-array object; functions/classes/numbers do not enter the presentation surface.</en></lang>
  if (item === null || typeof item !== 'object' || Array.isArray(item)) {
    return null;
  }

  try {
    // <lang><zh-CN>一次取得自有 descriptor，避免 label/text/value/disabled/selected getter 或 Proxy trap 在模板求值中执行。</zh-CN><en>Obtains own descriptors once so label/text/value/disabled/selected getters or Proxy traps cannot execute during template evaluation.</en></lang>
    const descriptors = Object.getOwnPropertyDescriptors(item);
    const labelDescriptor = descriptors.label;
    const textDescriptor = descriptors.text;
    const valueDescriptor = descriptors.value;
    const disabledDescriptor = descriptors.disabled;
    const selectedDescriptor = descriptors.selected;

    // <lang><zh-CN>只接受 string data label，并在缺失时读取同为 string data 的 text alias。</zh-CN><en>Accepts only a string data label and reads the string data text alias only when label is absent.</en></lang>
    const label = labelDescriptor && Object.prototype.hasOwnProperty.call(labelDescriptor, 'value') && typeof labelDescriptor.value === 'string'
      ? labelDescriptor.value
      : (textDescriptor && Object.prototype.hasOwnProperty.call(textDescriptor, 'value') && typeof textDescriptor.value === 'string' ? textDescriptor.value : '');
    if (label.length === 0) {
      return null;
    }

    // <lang><zh-CN>value data descriptor 即使为 undefined/null/对象也原样保留；真正缺失时才回退 label。</zh-CN><en>A value data descriptor is preserved unchanged even for undefined/null/object; only true absence falls back to the label.</en></lang>
    const hasDataValue = valueDescriptor !== undefined && Object.prototype.hasOwnProperty.call(valueDescriptor, 'value');
    const value = hasDataValue ? valueDescriptor.value : label;

    // <lang><zh-CN>disabled 只接受显式 Boolean true；accessor 与其他类型不会被执行或 coercion。</zh-CN><en>Disabled accepts only explicit Boolean true; accessors and other types are neither executed nor coerced.</en></lang>
    const disabled = Boolean(disabledDescriptor && Object.prototype.hasOwnProperty.call(disabledDescriptor, 'value') && disabledDescriptor.value === true);

    // <lang><zh-CN>selected 同样只接受显式 Boolean true；多项冲突会在列表投影层确定性收束为首项。</zh-CN><en>Selected likewise accepts only explicit Boolean true; the list projection deterministically constrains conflicting claims to the first item.</en></lang>
    const selected = Boolean(selectedDescriptor && Object.prototype.hasOwnProperty.call(selectedDescriptor, 'value') && selectedDescriptor.value === true);

    // <lang><zh-CN>渲染 key 只使用内部索引，绝不对透明 value 调用 String/toString。</zh-CN><en>The render key uses only the internal index and never calls String/toString on the transparent value.</en></lang>
    return Object.freeze({ key: String(index), label, value, disabled, selected });
  } catch {
    // <lang><zh-CN>Descriptor/Proxy 异常收束为忽略该项，不泄漏异常或执行替代逻辑。</zh-CN><en>A descriptor/Proxy exception collapses to ignoring the item without leaking the exception or executing fallback logic.</en></lang>
    return null;
  }
}

// <lang><zh-CN>items 规范化只保留可安全呈现的稳定条目，并把多个 selected 声明收束为首个；过滤和投影都不改变原数组或透明 value。</zh-CN><en>Item normalization retains only safely renderable stable items and constrains multiple selected declarations to the first; filtering and projection change neither the original array nor transparent values.</en></lang>
const safeItems = computed(() => {
  // <lang><zh-CN>先完成单项 descriptor 审计；不可读条目不占用“首个 selected”资格或可见索引。</zh-CN><en>Audits individual descriptors first; unreadable items consume neither first-selected eligibility nor a visible index.</en></lang>
  const normalizedItems = props.items
    .map((item, index) => normalizeActionSheetItem(item, index))
    .filter((item) => item !== null);

  // <lang><zh-CN>局部标记只记录本次纯投影是否已接受一个 selected，不写回 caller item。</zh-CN><en>The local marker records only whether this pure projection has accepted one selected item and never writes to a caller item.</en></lang>
  let hasSelectedItem = false;

  // <lang><zh-CN>输出数组包含新的冻结视图，确保后续重复 selected 只降为普通可交互项。</zh-CN><en>The output array contains new frozen views so every later duplicate selected claim becomes an ordinary interactive item.</en></lang>
  const projectedItems = normalizedItems.map((item) => {
    // <lang><zh-CN>只有当前声明为 true 且尚无前项取得资格时才保留 selected。</zh-CN><en>Selected is retained only when the current claim is true and no earlier item has taken eligibility.</en></lang>
    const selected = item.selected && !hasSelectedItem;

    // <lang><zh-CN>一旦接受首项便封闭本次列表的其余 selected 声明；false 路径保持标记不变。</zh-CN><en>Accepting the first item closes the remaining selected claims for this list; the false path leaves the marker unchanged.</en></lang>
    if (selected) hasSelectedItem = true;

    // <lang><zh-CN>展开原规范化视图只复制安全 data property；透明 value identity 与显式 undefined 均保持不变。</zh-CN><en>Spreading the normalized view copies only safe data properties; transparent value identity and explicit undefined both remain unchanged.</en></lang>
    return Object.freeze({ ...item, selected });
  });

  // <lang><zh-CN>冻结有限数组，防止模板或测试误把内部投影当成可写 store。</zh-CN><en>Freezes the finite array so neither the template nor tests can mistake the internal projection for a writable store.</en></lang>
  return Object.freeze(projectedItems);
});

/**
 * @lang zh-CN 对当前可见 sheet 先请求 modelValue=false，再保留 raw event 首参并报告有限 close reason；不改写任何 prop。
 * @lang en For the currently visible sheet, first requests modelValue=false, then preserves the raw event as the first argument and reports a finite close reason; no prop is mutated.
 * @param {unknown} event <lang><zh-CN>平台 control/mask 的原始事件；programmatic 入口为 undefined。</zh-CN><en>Original platform control/mask event; undefined for the programmatic entry.</en></lang>
 * @param {'mask'|'cancel'|'programmatic'} reason <lang><zh-CN>由内部关闭入口确定的有限原因。</zh-CN><en>Finite reason determined by the internal close entry.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时严格依次 emit 更新与关闭。</zh-CN><en>No return value; when the guard passes, emits update then close in strict order.</en></lang>
 */
function requestClose(event, reason) {
  // <lang><zh-CN>隐藏 sheet 不能因 handler 直调或陈旧 component ref 产生虚假关闭事件。</zh-CN><en>A hidden sheet cannot produce false close events through direct handler invocation or a stale component ref.</en></lang>
  if (!isVisible.value) {
    return;
  }

  // <lang><zh-CN>先请求受控下一值；调用方可以接受或拒绝，组件本身仍不隐藏。</zh-CN><en>First requests the next controlled value; the caller may accept or reject it, while the component itself still does not hide.</en></lang>
  emit('update:modelValue', false);

  // <lang><zh-CN>随后报告原始事件与有限原因，不附带 action、router 或业务对象。</zh-CN><en>Then reports the original event and finite reason without any action, router, or business object.</en></lang>
  emit('close', event, reason);
}

/**
 * @lang zh-CN 只在 sheet 可见且 maskClosable 明确开启时报告遮罩关闭意图。
 * @lang en Reports mask-close intent only while the sheet is visible and maskClosable is explicitly enabled.
 * @param {unknown} event <lang><zh-CN>平台提供的原始遮罩点击事件。</zh-CN><en>Original mask-click event supplied by the platform.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleMaskClick(event) {
  // <lang><zh-CN>隐藏或未授权遮罩关闭时保持严格零事件。</zh-CN><en>Retains strictly zero events while hidden or when mask closing is not authorized.</en></lang>
  if (!isVisible.value || !props.maskClosable) {
    return;
  }

  // <lang><zh-CN>遮罩路径复用唯一关闭序列，并标记 mask 原因。</zh-CN><en>The mask path reuses the sole close sequence and marks the mask reason.</en></lang>
  requestClose(event, 'mask');
}

/**
 * @lang zh-CN 先以既有 select payload 回传有限 item，再以 click(index) 提供迁移事件；组件不执行命令或隐藏 sheet。
 * @lang en First returns the finite item through the existing select payload, then provides the click(index) migration event; the component executes no command and hides no sheet.
 * @param {{ value: unknown, disabled: boolean }} item <lang><zh-CN>规范化 item。</zh-CN><en>Normalized item.</en></lang>
 * @param {number} index <lang><zh-CN>当前已渲染 item 索引。</zh-CN><en>Current rendered-item index.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleSelect(item, index) {
  // <lang><zh-CN>隐藏或 disabled item 保持零事件；空 label item 已在渲染前过滤。</zh-CN><en>A hidden sheet or disabled item retains zero events; empty-label items were filtered before rendering.</en></lang>
  if (!isVisible.value || item.disabled) {
    return;
  }

  // <lang><zh-CN>先保持既有 select 结构化 payload，避免迁移新增 click 改变旧监听顺序。</zh-CN><en>First preserves the existing structured select payload so the new migration click does not alter legacy listener order.</en></lang>
  emit('select', { value: item.value, index });

  // <lang><zh-CN>再报告上游熟悉的 click(index)；选择不会隐式触发 close 或值写回。</zh-CN><en>Then reports the upstream-familiar click(index); selection implicitly triggers neither close nor value writeback.</en></lang>
  emit('click', index);
}

/**
 * @lang zh-CN 在有可见 cancel 文本时通过统一路径报告 cancel 关闭意图；组件不自动隐藏或导航。
 * @lang en Reports cancel close intent through the shared path when visible cancel copy exists; the component does not hide or navigate automatically.
 * @param {unknown} event <lang><zh-CN>平台提供的原始取消按钮事件。</zh-CN><en>Original cancel-button event supplied by the platform.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleCancel(event) {
  // <lang><zh-CN>隐藏或无文字 control 保持零事件；模板本身也不会为缺失文字建立按钮。</zh-CN><en>A hidden sheet or textless control retains zero events; the template also creates no button for absent copy.</en></lang>
  if (!isVisible.value || !props.cancelText) {
    return;
  }

  // <lang><zh-CN>取消路径保留 raw event，并把原因限制为 cancel。</zh-CN><en>The cancel path preserves the raw event and constrains the reason to cancel.</en></lang>
  requestClose(event, 'cancel');
}

/**
 * @lang zh-CN 通过 mounted component ref 报告 programmatic 关闭意图；方法不隐藏 sheet，也不执行 item。
 * @lang en Reports programmatic close intent through a mounted component ref; the method neither hides the sheet nor executes an item.
 * @returns {void} <lang><zh-CN>无返回值；仅在当前受控值可见时产生严格有序事件。</zh-CN><en>No return value; produces strictly ordered events only while the current controlled value is visible.</en></lang>
 */
function close() {
  // <lang><zh-CN>programmatic 入口没有平台 raw event，并复用同一 guard 与事件顺序。</zh-CN><en>The programmatic entry has no platform raw event and reuses the same guard and event order.</en></lang>
  requestClose(undefined, 'programmatic');
}

// <lang><zh-CN>实例只暴露局部 close 方法；内部 items、props 与 handler 不成为命令表面。</zh-CN><en>The instance exposes only the local close method; internal items, props, and handlers do not become a command surface.</en></lang>
defineExpose({ close });
</script>

<style src="./u-action-sheet.css"></style>
