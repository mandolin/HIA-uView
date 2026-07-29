<!--
@lang zh-CN 在仅编译期的 mp-weixin fixture 中组合现有布局/展示组件、P13 受控字段组件和 P14 的 UModal、UNotice、UEmpty；页面只记录本地事件次数和调用方可见状态，不执行真实导航、网络、业务命令、规则执行、计时器或系统栏操作。
@lang en Composes existing layout/presentation components, P13 controlled field components, and P14 UModal, UNotice, and UEmpty in the compile-only mp-weixin fixture; the page records only local event counts and caller visibility state and performs no real navigation, network activity, business command, rule execution, timer, or system-bar operation.
-->
<template>
  <!-- <lang><zh-CN>页面级 stack 验证纵向布局与 token 间距，不为组件引入业务页面结构。</zh-CN><en>The page-level stack verifies vertical layout and token spacing without introducing business-page structure into components.</en></lang> -->
  <u-stack class="fixture-page" gap="lg">
    <!-- <lang><zh-CN>导航栏示例证明 back/action 只进入本地计数 handler；没有 route、path 或 uni.navigate 调用。</zh-CN><en>The navigation-bar example proves back/action enter local counter handlers only; it contains no route, path, or uni.navigate call.</en></lang> -->
    <u-nav-bar
      title="HIA-uView fixture"
      :show-back="true"
      back-text="返回"
      action-text="Save"
      @action="recordAction"
      @back="recordBack"
    />

    <!-- <lang><zh-CN>信息行组合覆盖纯展示、描述/值、启用 click、禁用 click 与较长双语文字；不把 click 解释为导航。</zh-CN><en>The information-row group covers display-only, description/value, enabled click, disabled click, and long bilingual text; it does not interpret click as navigation.</en></lang> -->
    <u-stack gap="sm">
      <u-cell label="本地信息行" />
      <u-cell label="同步状态" description="只展示调用方文字" value="待处理" />
      <u-cell label="记录本地意图" :clickable="true" @click="recordCellClick" />
      <u-cell label="暂不可用" :clickable="true" :disabled="true" value="Disabled" />
      <u-cell
        label="A deliberately long English information-row label for compile-only layout evidence"
        description="较长中文说明文本用于证明组件不会生成或截断业务文案。"
        value="Long value"
      />
    </u-stack>

    <!-- <lang><zh-CN>受控字段组覆盖调用方写回值、必填提示、帮助、error 显示、validating 显示、disabled guard 与独立消息；示例不执行规则或完成操作。</zh-CN><en>The controlled-field group covers caller value writeback, required cue, help, error display, validating display, disabled guard, and independent message; the example executes no rule or completion action.</en></lang> -->
    <u-stack gap="md">
      <u-field
        label="本地查询关键词"
        :required="true"
        help-text="由页面持有输入值与校验消息。"
        validation-state="error"
        validation-message="请由应用提供可查询的关键词。"
      >
        <u-input
          :model-value="inputValue"
          placeholder="输入关键词"
          @update:model-value="updateInputValue"
          @input="recordInput"
          @focus="recordInputFocus"
          @blur="recordInputBlur"
        />
      </u-field>
      <u-field
        label="正在检查的演示字段"
        validation-state="validating"
        validation-message="Checking the caller-owned value…"
      >
        <u-input model-value="Unavailable while controlled by the page" :disabled="true" />
      </u-field>
      <u-validation-message state="error" message="Standalone application-owned validation display." />
    </u-stack>

    <!-- <lang><zh-CN>P14 反馈组覆盖应用拥有 visible、modal confirm/cancel、notice dismiss 与空态 action；组件本身不关闭、不计时、不请求或加载数据。</zh-CN><en>The P14 feedback group covers application-owned visible state, modal confirm/cancel, notice dismiss, and empty-state action; components themselves neither close, time, request, nor load data.</en></lang> -->
    <u-stack gap="md">
      <u-stack direction="horizontal" gap="sm" wrap>
        <u-button label="显示确认面板" @click="showModal" />
        <u-button variant="secondary" label="显示局部提示" @click="showNotice" />
      </u-stack>

      <u-notice
        :visible="noticeVisible"
        tone="success"
        message="Caller-controlled local feedback."
        dismiss-text="Dismiss notice"
        @dismiss="dismissNotice"
      />

      <u-empty
        title="没有可展示的本地数据"
        description="该示例不读取数组、加载状态或后端响应。"
        action-text="记录空态意图"
        @action="recordEmptyAction"
      />

      <u-modal
        :visible="modalVisible"
        title="调用方控制的确认面板"
        confirm-text="Confirm locally"
        cancel-text="Cancel locally"
        @confirm="recordModalConfirm"
        @cancel="recordModalCancel"
      >
        <text>可见状态、关闭时机和后续流程均由当前页面 handler 决定。</text>
      </u-modal>
    </u-stack>

    <!-- <lang><zh-CN>按钮保留既有 label、disabled、loading 与长英文状态，验证新增字段组合没有回退其独立本地操作边界。</zh-CN><en>The button retains prior label, disabled, loading, and long-English states, verifying new field composition does not regress its independent local-action boundary.</en></lang> -->
    <u-stack direction="horizontal" gap="sm" wrap>
      <u-button label="保存本地草稿" @click="recordButtonClick" />
      <u-button variant="secondary" :disabled="true" label="暂不可用" />
      <u-button variant="text" :loading="true" label="正在同步" />
      <u-button size="lg" label="Continue with a deliberately long English action label" />
    </u-stack>

    <!-- <lang><zh-CN>计数区只公开 fixture 内事件是否到达；它不代表真机交互、读屏、焦点或路由结果。</zh-CN><en>The counter area exposes only whether fixture events arrived; it does not represent device interaction, screen-reader, focus, or routing results.</en></lang> -->
    <text class="fixture-page__count">back: {{ backCount }}, action: {{ actionCount }}, cell: {{ cellClickCount }}, button: {{ buttonClickCount }}, input: {{ inputEventCount }}, focus: {{ inputFocusCount }}, blur: {{ inputBlurCount }}, modal confirm: {{ modalConfirmCount }}, modal cancel: {{ modalCancelCount }}, notice dismiss: {{ noticeDismissCount }}, empty action: {{ emptyActionCount }}</text>
  </u-stack>
</template>

<script setup>
import { ref } from 'vue';
// <lang><zh-CN>从私有 runtime entry 显式导入 fixture 所需组件；页面不使用自动注册、Tool runtime 或外部包解析。</zh-CN><en>Explicitly imports fixture components from the private runtime entry; the page uses no auto-registration, Tool runtime, or external package resolution.</en></lang>
import { UButton, UCell, UEmpty, UField, UInput, UModal, UNavBar, UNotice, UStack, UValidationMessage } from '../../../../../src/index.mjs';

// <lang><zh-CN>返回意图的本地 fixture 计数；生命周期仅限当前页面实例，不持久化或执行导航。</zh-CN><en>Local fixture counter for back intent; its lifetime is limited to the current page instance and it neither persists nor navigates.</en></lang>
const backCount = ref(0);

// <lang><zh-CN>右侧操作意图的本地 fixture 计数；用于 compiler/runtime 组合示例而非业务命令。</zh-CN><en>Local fixture counter for right-action intent; used for compiler/runtime composition evidence rather than a business command.</en></lang>
const actionCount = ref(0);

// <lang><zh-CN>启用 UCell click 的本地 fixture 计数；禁用和不可点击行不得改变该值。</zh-CN><en>Local fixture counter for enabled UCell click; disabled and non-clickable rows must not change this value.</en></lang>
const cellClickCount = ref(0);

// <lang><zh-CN>启用 UButton click 的本地 fixture 计数；它保留 P10/P11 按钮行为的组合证据。</zh-CN><en>Local fixture counter for enabled UButton click; it retains composition evidence for P10/P11 button behavior.</en></lang>
const buttonClickCount = ref(0);

// <lang><zh-CN>受控输入的页面自有字符串；只有页面 handler 写回它，组件自身不持久化或修改该状态。</zh-CN><en>Page-owned string for the controlled input; only the page handler writes it back, while the component itself neither persists nor modifies this state.</en></lang>
const inputValue = ref('Caller-owned initial value');

// <lang><zh-CN>已到达的 input 意图计数仅供编译组合证据显示，不代表规则、网络或数据完成结果。</zh-CN><en>Arrived input-intent count is displayed only as compilation-composition evidence and represents no rule, network, or data-completion result.</en></lang>
const inputEventCount = ref(0);

// <lang><zh-CN>已到达的聚焦意图计数仅说明 fixture handler 被绑定，不证明真机焦点或无障碍树行为。</zh-CN><en>Arrived focus-intent count shows only that a fixture handler is bound and proves no device-focus or accessibility-tree behavior.</en></lang>
const inputFocusCount = ref(0);

// <lang><zh-CN>已到达的失焦意图计数仅说明 fixture handler 被绑定，不触发页面校验或格式化。</zh-CN><en>Arrived blur-intent count shows only that a fixture handler is bound and starts no page validation or formatting.</en></lang>
const inputBlurCount = ref(0);

// <lang><zh-CN>modal 可见状态由当前页面拥有；组件只收到该 prop，不能自行关闭或写回它。</zh-CN><en>The current page owns modal visible state; the component receives only this prop and cannot close or write it back itself.</en></lang>
const modalVisible = ref(false);

// <lang><zh-CN>notice 可见状态由当前页面拥有；没有全局 service、队列或定时器参与该示例。</zh-CN><en>The current page owns notice visible state; no global service, queue, or timer participates in this example.</en></lang>
const noticeVisible = ref(false);

// <lang><zh-CN>已到达 modal confirm 意图的本地计数；它不代表请求完成、数据修改或页面路由。</zh-CN><en>Local count of arrived modal confirm intent; it represents no completed request, data mutation, or page route.</en></lang>
const modalConfirmCount = ref(0);

// <lang><zh-CN>已到达 modal cancel 意图的本地计数；页面 handler 决定后续可见状态。</zh-CN><en>Local count of arrived modal cancel intent; the page handler decides subsequent visible state.</en></lang>
const modalCancelCount = ref(0);

// <lang><zh-CN>已到达 notice dismiss 意图的本地计数；它不创建或移除其他 notice。</zh-CN><en>Local count of arrived notice dismiss intent; it creates or removes no other notice.</en></lang>
const noticeDismissCount = ref(0);

// <lang><zh-CN>已到达 empty action 意图的本地计数；它不读取数据数组、加载状态或后端。</zh-CN><en>Local count of arrived empty action intent; it reads no data array, loading state, or backend.</en></lang>
const emptyActionCount = ref(0);

/**
 * @lang zh-CN 记录 UNavBar 的纯 back 意图。该 handler 不读取事件、不调用导航，故不将 fixture 扩展为路由测试。
 * @lang en Records UNavBar pure back intent. This handler reads no event and calls no navigation, so it does not expand the fixture into a routing test.
 * @returns {void} <lang><zh-CN>无返回值；只递增当前页面的本地计数。</zh-CN><en>No return value; increments the current page local counter only.</en></lang>
 */
function recordBack() {
  // <lang><zh-CN>将一次已到达的 back 意图记录为可见数字，不赋予它任何导航含义。</zh-CN><en>Records one arrived back intent as a visible number without assigning it navigation meaning.</en></lang>
  backCount.value += 1;
}

/**
 * @lang zh-CN 记录 UNavBar 的纯 action 意图，保持其与业务命令和网络副作用隔离。
 * @lang en Records UNavBar pure action intent while keeping it isolated from business commands and network side effects.
 * @returns {void} <lang><zh-CN>无返回值；只递增当前页面的本地计数。</zh-CN><en>No return value; increments the current page local counter only.</en></lang>
 */
function recordAction() {
  // <lang><zh-CN>将一次已到达的 action 意图记录为本地证据，而不决定后续业务处理。</zh-CN><en>Records one arrived action intent as local evidence without deciding subsequent business handling.</en></lang>
  actionCount.value += 1;
}

/**
 * @lang zh-CN 记录符合 UCell clickable/disabled guard 的 click；页面不把该事件转换为 URL、route 或表单行为。
 * @lang en Records a click that passed the UCell clickable/disabled guard; the page does not turn this event into a URL, route, or form behavior.
 * @returns {void} <lang><zh-CN>无返回值；只递增当前页面的本地计数。</zh-CN><en>No return value; increments the current page local counter only.</en></lang>
 */
function recordCellClick() {
  // <lang><zh-CN>递增受 guard 保护的点击证据，供 fixture 页面以可见文字展示。</zh-CN><en>Increments guarded-click evidence for visible fixture-page display.</en></lang>
  cellClickCount.value += 1;
}

/**
 * @lang zh-CN 记录符合 UButton enabled/loading guard 的 click，保持首个组件纵切的本地行为证据。
 * @lang en Records a click that passed the UButton enabled/loading guard, preserving local behavior evidence for the first component vertical slice.
 * @returns {void} <lang><zh-CN>无返回值；只递增当前页面的本地计数。</zh-CN><en>No return value; increments the current page local counter only.</en></lang>
 */
function recordButtonClick() {
  // <lang><zh-CN>递增按钮点击证据，不发起保存、网络请求或其他业务副作用。</zh-CN><en>Increments button-click evidence and starts no save, network request, or other business side effect.</en></lang>
  buttonClickCount.value += 1;
}

/**
 * @lang zh-CN 接收 UInput 报告的未修改下一字符串，并由页面显式写回受控值；该示例不检查内容或启动后续流程。
 * @lang en Receives the unmodified next string reported by UInput and explicitly writes it back as the controlled value; this example does not inspect content or start follow-up flow.
 * @param {string} nextValue <lang><zh-CN>UInput 通过 `update:modelValue` 事件报告的候选字符串。</zh-CN><en>Candidate string reported by UInput through the `update:modelValue` event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只更新当前页面的受控 ref。</zh-CN><en>No return value; updates only the current page controlled ref.</en></lang>
 */
function updateInputValue(nextValue) {
  // <lang><zh-CN>页面明确拥有写回动作，使组件不会隐式形成自己的表单状态或缓存。</zh-CN><en>The page explicitly owns the writeback action so the component cannot implicitly form its own form state or cache.</en></lang>
  inputValue.value = nextValue;
}

/**
 * @lang zh-CN 记录一次已到达的 UInput input 意图，不读取输入值或将其用于规则、网络或持久化。
 * @lang en Records one arrived UInput input intent without reading its value or using it for rules, network, or persistence.
 * @returns {void} <lang><zh-CN>无返回值；只递增当前页面本地计数。</zh-CN><en>No return value; increments only the current page local counter.</en></lang>
 */
function recordInput() {
  // <lang><zh-CN>递增本地 input 证据，保持 fixture 对业务状态和后端完全无知。</zh-CN><en>Increments local input evidence while keeping the fixture fully unaware of business state and backend.</en></lang>
  inputEventCount.value += 1;
}

/**
 * @lang zh-CN 记录一次已到达的 UInput focus 意图；不自动设置焦点或主张平台焦点能力。
 * @lang en Records one arrived UInput focus intent; it neither sets focus automatically nor claims platform focus capability.
 * @returns {void} <lang><zh-CN>无返回值；只递增当前页面本地计数。</zh-CN><en>No return value; increments only the current page local counter.</en></lang>
 */
function recordInputFocus() {
  // <lang><zh-CN>递增聚焦 handler 证据，而不把它解释为键盘、读屏或真机观察。</zh-CN><en>Increments focus-handler evidence without interpreting it as keyboard, screen-reader, or device observation.</en></lang>
  inputFocusCount.value += 1;
}

/**
 * @lang zh-CN 记录一次已到达的 UInput blur 意图；不据此运行规则、格式化或完成动作。
 * @lang en Records one arrived UInput blur intent; it runs no rule, formatting, or completion action from it.
 * @returns {void} <lang><zh-CN>无返回值；只递增当前页面本地计数。</zh-CN><en>No return value; increments only the current page local counter.</en></lang>
 */
function recordInputBlur() {
  // <lang><zh-CN>递增失焦 handler 证据，保留应用未来自行决定状态更新的空间。</zh-CN><en>Increments blur-handler evidence while leaving the application free to decide future state updates itself.</en></lang>
  inputBlurCount.value += 1;
}

/**
 * @lang zh-CN 由页面显式显示 UModal；组件本身没有可见状态写入、自动关闭或全局弹层能力。
 * @lang en Explicitly shows UModal from the page; the component itself has no visible-state writeback, automatic close, or global-overlay capability.
 * @returns {void} <lang><zh-CN>无返回值；只将当前页面 modal ref 设为真。</zh-CN><en>No return value; sets only the current page modal ref to true.</en></lang>
 */
function showModal() {
  // <lang><zh-CN>页面写入可见状态，明确演示应用而非组件拥有 modal 生命周期。</zh-CN><en>The page writes visible state, explicitly demonstrating that the application rather than component owns modal lifecycle.</en></lang>
  modalVisible.value = true;
}

/**
 * @lang zh-CN 记录 UModal confirm 意图并由页面关闭该 modal；不执行数据修改、请求或路由。
 * @lang en Records UModal confirm intent and closes that modal from the page; it performs no data mutation, request, or route.
 * @returns {void} <lang><zh-CN>无返回值；递增本地计数并写入当前页面 modal 可见状态。</zh-CN><en>No return value; increments local count and writes current page modal visible state.</en></lang>
 */
function recordModalConfirm() {
  // <lang><zh-CN>先记录已到达的纯 confirm 意图，使 fixture 可见地区分它与组件自动完成。</zh-CN><en>Records arrived pure confirm intent first so the fixture can visibly distinguish it from component automatic completion.</en></lang>
  modalConfirmCount.value += 1;

  // <lang><zh-CN>由页面而非 UModal 写入关闭状态；这不是对焦点、路由或请求结果的声明。</zh-CN><en>Writes close state from the page rather than UModal; this is no statement about focus, route, or request result.</en></lang>
  modalVisible.value = false;
}

/**
 * @lang zh-CN 记录 UModal cancel 意图并由页面关闭该 modal；不恢复焦点、不执行回退或业务取消。
 * @lang en Records UModal cancel intent and closes that modal from the page; it restores no focus and performs no rollback or business cancellation.
 * @returns {void} <lang><zh-CN>无返回值；递增本地计数并写入当前页面 modal 可见状态。</zh-CN><en>No return value; increments local count and writes current page modal visible state.</en></lang>
 */
function recordModalCancel() {
  // <lang><zh-CN>记录 cancel 意图，保留其作为页面可见证据而非组件内部关闭逻辑。</zh-CN><en>Records cancel intent, retaining it as page-visible evidence rather than component-internal close logic.</en></lang>
  modalCancelCount.value += 1;

  // <lang><zh-CN>当前页面明确关闭 modal，后续流程仍完全由应用决定。</zh-CN><en>The current page explicitly closes the modal while all follow-up flow remains entirely application-decided.</en></lang>
  modalVisible.value = false;
}

/**
 * @lang zh-CN 由页面显式显示 UNotice；组件不生成 toast、队列或自动持续时间。
 * @lang en Explicitly shows UNotice from the page; the component generates no toast, queue, or automatic duration.
 * @returns {void} <lang><zh-CN>无返回值；只将当前页面 notice ref 设为真。</zh-CN><en>No return value; sets only the current page notice ref to true.</en></lang>
 */
function showNotice() {
  // <lang><zh-CN>页面写入 notice 可见状态，保持 feedback 生命周期与组件展示边界分离。</zh-CN><en>The page writes notice visible state, keeping feedback lifecycle separate from component presentation boundary.</en></lang>
  noticeVisible.value = true;
}

/**
 * @lang zh-CN 记录 UNotice dismiss 意图并由页面隐藏它；不启动计时器、队列或其他 feedback 状态机。
 * @lang en Records UNotice dismiss intent and hides it from the page; it starts no timer, queue, or other feedback state machine.
 * @returns {void} <lang><zh-CN>无返回值；递增本地计数并写入当前页面 notice 可见状态。</zh-CN><en>No return value; increments local count and writes current page notice visible state.</en></lang>
 */
function dismissNotice() {
  // <lang><zh-CN>先记录已到达 dismiss 意图，不将它误述为组件自动移除行为。</zh-CN><en>Records arrived dismiss intent first and does not misdescribe it as component automatic removal behavior.</en></lang>
  noticeDismissCount.value += 1;

  // <lang><zh-CN>由页面选择隐藏当前 notice；组件不会影响页面中的其他 feedback。</zh-CN><en>The page chooses to hide the current notice; the component affects no other feedback on the page.</en></lang>
  noticeVisible.value = false;
}

/**
 * @lang zh-CN 记录 UEmpty action 意图；不发起加载、重试、分页、滚动或数据读取。
 * @lang en Records UEmpty action intent; it starts no loading, retry, paging, scrolling, or data read.
 * @returns {void} <lang><zh-CN>无返回值；只递增当前页面本地计数。</zh-CN><en>No return value; increments only the current page local counter.</en></lang>
 */
function recordEmptyAction() {
  // <lang><zh-CN>将空态 action 保留为可见的局部意图证据，不赋予它业务或后端含义。</zh-CN><en>Retains empty-state action as visible local intent evidence and assigns it no business or backend meaning.</en></lang>
  emptyActionCount.value += 1;
}
</script>

<style>
/**
 * @lang zh-CN fixture 页面只使用局部布局与文字样式，避免将业务 CSS、图标、字体或未经审计资源带入 compiler evidence。
 * @lang en The fixture page uses local layout and text styles only, preventing business CSS, icons, fonts, or unaudited resources from entering compiler evidence.
 */

/* <lang><zh-CN>页面容器提供编译示例所需的内边距，不覆盖组件的 token 化结构或页面全局 reset。</zh-CN><en>The page container provides padding required by the compilation example without overriding component tokenized structure or a global page reset.</en></lang> */
.fixture-page {
  padding: 20px;
}

/* <lang><zh-CN>事件计数采用系统主要文字色，确保辅助证据不引入新的视觉或业务主题。</zh-CN><en>Event counters use the system primary text color so auxiliary evidence introduces no new visual or business theme.</en></lang> */
.fixture-page__count {
  color: var(--u-sys-color-text);
}
</style>
