<!--
@lang zh-CN 在仅编译期的 mp-weixin fixture 中组合 UStack、UNavBar、UCell 与 UButton；页面只记录本地事件次数，不执行真实导航、网络、业务命令或系统栏操作。
@lang en Composes UStack, UNavBar, UCell, and UButton in the compile-only mp-weixin fixture; the page records local event counts only and performs no real navigation, network activity, business command, or system-bar operation.
-->
<template>
  <!-- <lang><zh-CN>页面级 stack 验证纵向布局与 token 间距，不为组件引入业务页面结构。</zh-CN><en>The page-level stack verifies vertical layout and token spacing without introducing business-page structure into components.</en></lang> -->
  <u-stack class="fixture-page" gap="lg">
    <!-- <lang><zh-CN>导航栏示例证明 back/action 只进入本地计数 handler；没有 route、path 或 uni.navigate 调用。</zh-CN><en>The navigation-bar example proves back/action enter local counter handlers only; it contains no route, path, or uni.navigate call.</en></lang> -->
    <u-nav-bar
      title="HIA-uView P12 fixture"
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

    <!-- <lang><zh-CN>按钮保留既有 label、disabled、loading 与长英文状态，验证 P12 组合没有回退 P10/P11 的独立组件边界。</zh-CN><en>The button retains prior label, disabled, loading, and long-English states, verifying P12 composition does not regress the independent P10/P11 component boundary.</en></lang> -->
    <u-stack direction="horizontal" gap="sm" wrap>
      <u-button label="保存本地草稿" @click="recordButtonClick" />
      <u-button variant="secondary" :disabled="true" label="暂不可用" />
      <u-button variant="text" :loading="true" label="正在同步" />
      <u-button size="lg" label="Continue with a deliberately long English action label" />
    </u-stack>

    <!-- <lang><zh-CN>计数区只公开 fixture 内事件是否到达；它不代表真机交互、读屏、焦点或路由结果。</zh-CN><en>The counter area exposes only whether fixture events arrived; it does not represent device interaction, screen-reader, focus, or routing results.</en></lang> -->
    <text class="fixture-page__count">back: {{ backCount }}, action: {{ actionCount }}, cell: {{ cellClickCount }}, button: {{ buttonClickCount }}</text>
  </u-stack>
</template>

<script setup>
import { ref } from 'vue';
import { UButton, UCell, UNavBar, UStack } from '../../../../../src/index.mjs';

// <lang><zh-CN>返回意图的本地 fixture 计数；生命周期仅限当前页面实例，不持久化或执行导航。</zh-CN><en>Local fixture counter for back intent; its lifetime is limited to the current page instance and it neither persists nor navigates.</en></lang>
const backCount = ref(0);

// <lang><zh-CN>右侧操作意图的本地 fixture 计数；用于 compiler/runtime 组合示例而非业务命令。</zh-CN><en>Local fixture counter for right-action intent; used for compiler/runtime composition evidence rather than a business command.</en></lang>
const actionCount = ref(0);

// <lang><zh-CN>启用 UCell click 的本地 fixture 计数；禁用和不可点击行不得改变该值。</zh-CN><en>Local fixture counter for enabled UCell click; disabled and non-clickable rows must not change this value.</en></lang>
const cellClickCount = ref(0);

// <lang><zh-CN>启用 UButton click 的本地 fixture 计数；它保留 P10/P11 按钮行为的组合证据。</zh-CN><en>Local fixture counter for enabled UButton click; it retains composition evidence for P10/P11 button behavior.</en></lang>
const buttonClickCount = ref(0);

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
