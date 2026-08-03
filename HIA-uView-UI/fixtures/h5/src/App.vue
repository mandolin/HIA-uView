<!--
@component H5FixtureApp
@lang zh-CN 以本地声明数据展示 P49 组件；fixture 不连接 API、router、storage 或外部脚本。
@lang en Displays P49 components with local declarative data; the fixture connects to no API, router, storage, or external script.
-->
<template>
  <main class="fixture-page">
    <h1>HIA-uView H5 fixture / H5 验证 fixture</h1>
    <USection title="Local availability / 本地可用性" sub-title="H5 build and smoke evidence / H5 构建与 smoke 证据" />
    <UText text="u- naming remains available on H5 / H5 仍保持 u- 代码命名" type="secondary" />
    <USelect v-model="selected" :options="options" placeholder="Select / 请选择" />
    <USlider v-model="level" :show-value="true" :min="0" :max="10" />
    <UDropdown v-model="selected">
      <UDropdownItem value="public" label="Public / 公共" />
      <UDropdownItem value="private" label="Private / 私有" />
    </UDropdown>
    <UButton label="Local action / 本地操作" />
    <!-- <lang><zh-CN>本段组合 P54 的本地导航、间距、反馈和 overlay 组件；所有文案与可见性均由本 fixture 明确提供。</zh-CN><en>This section composes P54 local navigation, spacing, feedback, and overlay components; the fixture explicitly provides every copy value and visibility selection.</en></lang> -->
    <UConfigProvider density="compact">
      <UStatusBar :height="18" />
      <UNavbar title="Fixture navigation / Fixture 导航" left-text="Back / 返回" right-text="Save / 保存" @left-click="recordP54Intent('left')" @right-click="recordP54Intent('right')" />
      <UCellItem title="Local entry / 本地条目" label="Caller projection / 调用方投影" value="Ready / 就绪" :arrow="true" :clickable="true" @click="recordP54Intent('cell')" />
      <UNoticeBar :visible="true" text="Local feedback only / 仅本地反馈" close-text="Dismiss / 关闭" @close="recordP54Intent('notice')" />
      <ULoading :visible="true" label="Local state / 本地状态" />
      <UNoNetwork :visible="true" title="Caller-declared state / 调用方声明状态" retry-text="Retry / 重试" @retry="recordP54Intent('retry')" />
      <USafeBottom :height="12" />
    </UConfigProvider>
    <!-- <lang><zh-CN>本段直接组合调用方拥有的 item、有限列和固定长度输入数据，以验证它们在 H5 构建中保持受控呈现；fixture 不赋予它们城市数据、验证码、父级 sheet、请求或持久化职责。</zh-CN><en>This section directly composes caller-owned item, finite-column, and fixed-length-input data to verify controlled rendering in the H5 build; the fixture gives them no city-data, verification-code, parent-sheet, request, or persistence responsibility.</en></lang> -->
    <UActionSheetItem text="Local choice / 本地选择" value="fixture-choice" />
    <UCitySelect :visible="true" title="Local columns / 本地列" :columns="fixtureSelectorColumns" :model-value="fixtureSelectorValues" close-text="Close / 关闭" confirm-text="Confirm / 确认" />
    <UMessageInput input-label="Local fixed-length input / 本地固定长度输入" model-value="42" :length="4" />
    <!-- <lang><zh-CN>三类键盘均使用 fixture-owned 的有限静态键/键行和文字，验证受控 emit 表面可被 H5 构建解析；它们不代表金额、车牌地区、身份或系统键盘行为。</zh-CN><en>All three keyboards use fixture-owned finite static keys/key rows and copy to verify controlled emit surfaces are resolved by the H5 build; they represent no money, vehicle-region, identity, or system-keyboard behavior.</en></lang> -->
    <UNumberKeyboard :visible="true" :keys="fixtureNumberKeys" label="Local numeric keys / 本地数值键" backspace-label="Remove / 删除" confirm-text="Confirm / 确认" />
    <UCarKeyboard :visible="true" :rows="fixtureCarRows" label="Local row keys / 本地行键" phase="primary" next-phase="secondary" switch-text="Next / 下一组" backspace-label="Remove / 删除" confirm-text="Confirm / 确认" />
    <UKeyboard :visible="false" mode="number" :number-keys="fixtureNumberKeys" label="Local composed keys / 本地组合键" backspace-label="Remove / 删除" confirm-text="Confirm / 确认" />
    <UBackTop :visible="true" label="Top / 顶部" @back-top="recordP54Intent('top')" />
    <UFab :visible="true" label="Create / 新建" @click="recordP54Intent('fab')" />
    <URootPortal :visible="true" :layer="1200"><UTransition :visible="true" mode="fade"><UTopTips :visible="true" message="Local overlay / 本地浮层" close-text="Close / 关闭" @close="recordP54Intent('tips')" /></UTransition></URootPortal>
    <UMask :visible="false" :clickable="true" @click="recordP54Intent('mask')" />
    <ULoadingPopup :visible="false" label="Local popup / 本地弹层" :mask-closable="true" @close="recordP54Intent('popup')" />
    <p data-smoke="selected">{{ selected }}</p>
    <p data-smoke="level">{{ level }}</p>
    <p data-smoke="p54-intent">{{ p54Intent }}</p>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { UActionSheetItem, UBackTop, UButton, UCarKeyboard, UCellItem, UCitySelect, UConfigProvider, UDropdown, UDropdownItem, UFab, UKeyboard, ULoading, ULoadingPopup, UMask, UMessageInput, UNavbar, UNoNetwork, UNoticeBar, UNumberKeyboard, URootPortal, USafeBottom, USection, USelect, USlider, UStatusBar, UText, UTopTips, UTransition } from '../../../src/index.mjs';

// <lang><zh-CN>fixture 状态只来自本地 ref，便于 H5 smoke 对稳定文本进行检查。</zh-CN><en>Fixture state comes from local refs only, allowing H5 smoke to inspect stable text.</en></lang>
const selected = ref('public');
const level = ref(5);
// <lang><zh-CN>本地观察文字只记录 P54 intent 名称，用于 H5 build/smoke，不触发路由、滚动、网络或存储。</zh-CN><en>Local observation copy records only a P54 intent name for H5 build/smoke and triggers no router, scrolling, network, or storage.</en></lang>
const p54Intent = ref('none');
const options = Object.freeze([
  Object.freeze({ label: 'Public / 公共', value: 'public' }),
  Object.freeze({ label: 'Private / 私有', value: 'private' })
]);
// <lang><zh-CN>有限列和受控值只服务 H5 组合编译；它们是本地静态数据，不构成地点、城市或业务模型。</zh-CN><en>The finite columns and controlled values serve H5 composition compilation only; they are local static data and form no place, city, or business model.</en></lang>
const fixtureSelectorColumns = Object.freeze([
  Object.freeze([Object.freeze({ label: 'First / 第一', value: 'first' }), Object.freeze({ label: 'Second / 第二', value: 'second' })]),
  Object.freeze([Object.freeze({ label: 'One / 一', value: 'one' }), Object.freeze({ label: 'Two / 二', value: 'two' })])
]);
const fixtureSelectorValues = Object.freeze(['first', 'one']);
// <lang><zh-CN>键和键行均为中性本地 fixture 数据；它们只检验受控键盘组合，不携带金额、地区、车辆或身份含义。</zh-CN><en>Keys and key rows are neutral local fixture data; they test controlled keyboard composition only and carry no money, region, vehicle, or identity meaning.</en></lang>
const fixtureNumberKeys = Object.freeze(['1', '2', '3', '4']);
const fixtureCarRows = Object.freeze([
  Object.freeze(['A', 'B', 'C']),
  Object.freeze(['1', '2', '3'])
]);

/**
 * @lang zh-CN 记录 fixture 内观察到的 P54 局部 intent；不将 UI intent 解释为业务完成或执行副作用。
 * @lang en Records a P54 local intent observed by the fixture; it neither interprets UI intent as business completion nor performs a side effect.
 * @param {string} intent <lang><zh-CN>受限 fixture 事件名称。</zh-CN><en>Constrained fixture event name.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只写当前组件 ref。</zh-CN><en>No return value; writes only the current-component ref.</en></lang>
 */
function recordP54Intent(intent) {
  // <lang><zh-CN>测试夹具仅反映已发生的事件，不建立业务状态机或跨页面协议。</zh-CN><en>The test fixture only reflects the event that occurred and establishes no business state machine or cross-page protocol.</en></lang>
  p54Intent.value = intent;
}
</script>

<style>
.fixture-page { color: var(--u-sys-color-text); font-family: system-ui, sans-serif; margin: 0 auto; max-width: 720px; padding: 24px; }
.fixture-page > * { margin-block-end: 16px; }
</style>
