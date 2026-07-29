<!--
@lang zh-CN 在仅编译期的 mp-weixin fixture 中组合现有布局/展示组件和 P13 的 UInput、UField、UValidationMessage；页面只记录本地事件次数，不执行真实导航、网络、业务命令、规则执行或系统栏操作。
@lang en Composes existing layout/presentation components and P13 UInput, UField, and UValidationMessage in the compile-only mp-weixin fixture; the page records local event counts only and performs no real navigation, network activity, business command, rule execution, or system-bar operation.
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

    <!-- <lang><zh-CN>按钮保留既有 label、disabled、loading 与长英文状态，验证新增字段组合没有回退其独立本地操作边界。</zh-CN><en>The button retains prior label, disabled, loading, and long-English states, verifying new field composition does not regress its independent local-action boundary.</en></lang> -->
    <u-stack direction="horizontal" gap="sm" wrap>
      <u-button label="保存本地草稿" @click="recordButtonClick" />
      <u-button variant="secondary" :disabled="true" label="暂不可用" />
      <u-button variant="text" :loading="true" label="正在同步" />
      <u-button size="lg" label="Continue with a deliberately long English action label" />
    </u-stack>

    <!-- <lang><zh-CN>计数区只公开 fixture 内事件是否到达；它不代表真机交互、读屏、焦点或路由结果。</zh-CN><en>The counter area exposes only whether fixture events arrived; it does not represent device interaction, screen-reader, focus, or routing results.</en></lang> -->
    <text class="fixture-page__count">back: {{ backCount }}, action: {{ actionCount }}, cell: {{ cellClickCount }}, button: {{ buttonClickCount }}, input: {{ inputEventCount }}, focus: {{ inputFocusCount }}, blur: {{ inputBlurCount }}</text>
  </u-stack>
</template>

<script setup>
import { ref } from 'vue';
// <lang><zh-CN>从私有 runtime entry 显式导入 fixture 所需组件；页面不使用自动注册、Tool runtime 或外部包解析。</zh-CN><en>Explicitly imports fixture components from the private runtime entry; the page uses no auto-registration, Tool runtime, or external package resolution.</en></lang>
import { UButton, UCell, UField, UInput, UNavBar, UStack, UValidationMessage } from '../../../../../src/index.mjs';

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
