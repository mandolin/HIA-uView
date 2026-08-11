<!--
@component H5FixtureApp
@lang zh-CN 以本地声明数据展示现有 HIA-uView 组件，并提供表单/输入族与十四组件受控选择族的 H5 组合证据；fixture 不连接 API、router、storage、业务 store、平台 chooser 或外部脚本。
@lang en Displays current HIA-uView components with local declarative data and provides H5 composition evidence for the form/input family and the fourteen-component controlled-selection family; the fixture connects to no API, router, storage, business store, platform chooser, or external script.
-->
<template>
  <main class="fixture-page">
    <h1>HIA-uView H5 fixture / H5 验证 fixture</h1>
    <USection title="Local availability / 本地可用性" sub-title="H5 build and smoke evidence / H5 构建与 smoke 证据" />
    <UText text="u- naming remains available on H5 / H5 仍保持 u- 代码命名" type="secondary" />
    <UButton label="Local action / 本地操作" />
    <!--
    @lang zh-CN 本段在一个稳定 marker 下真实组合十四个受控选择、日期、数值与上传组件；每个 model、有限 option 和 adapter 均由当前页面拥有。
    @lang en This section actually composes all fourteen controlled choice, date, numeric, and upload components under one stable marker; the current page owns every model, finite option collection, and adapter.
    <lang><zh-CN>dropdown 使用显式 name/options 模式；upload adapter 只变换本地记录数组，不打开 chooser、不读取文件、不访问网络或持久化。</zh-CN><en>Dropdown uses explicit name/options mode; the upload adapter only transforms local record arrays and opens no chooser, reads no file, accesses no network, and persists nothing.</en></lang>
    -->
    <section class="fixture-p67-controls" data-smoke="p67-controlled-composition">
      <h2>Controlled local inputs / 受控本地输入</h2>
      <UCheckboxGroup v-model="p67CheckboxValues" :max="2">
        <UCheckbox value="alpha" label="Alpha / 甲" />
        <UCheckbox :value="2" label="Two / 二" />
      </UCheckboxGroup>
      <URadioGroup v-model="p67RadioValue">
        <URadio value="alpha" label="Alpha / 甲" />
        <URadio :value="2" label="Two / 二" />
      </URadioGroup>
      <USwitch v-model="p67SwitchValue" label="Local state / 本地状态" />
      <UPicker v-model="p67PickerValue" :columns="p67PickerColumns" title="Local picker / 本地选择器" />
      <UCalendar v-model="p67CalendarValue" view-date="2026-08-01" today="2026-08-11" />
      <USelect v-model="p67SelectValue" :options="p67SelectOptions" :confirm-mode="true" placeholder="Select locally / 本地选择" />
      <UDropdown v-model="p67DropdownOpenName">
        <UDropdownItem v-model="p67DropdownValue" name="scope" label="Scope / 范围" :options="p67DropdownOptions" />
      </UDropdown>
      <UNumberBox v-model="p67NumberValue" :min="0" :max="10" :step="0.5" />
      <URate v-model="p67RateValue" :count="5" />
      <USlider v-model="p67SliderValue" :show-value="true" :min="0" :max="10" :step="2" />
      <UUpload
        :visible="true"
        :model-value="p67UploadFiles"
        :adapter="p67UploadAdapter"
        label="Local files / 本地文件"
        select-text="Add local record / 添加本地记录"
        preview-text="Observe / 观察"
        remove-text="Remove / 删除"
        retry-text="Retry / 重试"
        :max="3"
        @update:model-value="updateP67UploadFiles"
        @adapter-state="recordP67UploadAdapterState"
      />
      <p data-smoke="p67-adapter-state">{{ p67UploadAdapterState }}</p>
    </section>
    <!--
    @lang zh-CN 本段以中性页面本地模型真实组合 UForm、UFormItem、UField、UInput、UTextarea 与 USearch，并提供显式 validate/clear/reset 观察入口。
    @lang en This section composes UForm, UFormItem, UField, UInput, UTextarea, and USearch over a neutral page-local model and provides explicit validate/clear/reset observation entries.
    <lang><zh-CN>所有规则、文字和结果 marker 均属于 fixture；搜索只记录本地 intent，不筛选目录、不请求网络，也不表示提交或持久化完成。</zh-CN><en>All rules, copy, and result markers belong to the fixture; search records only a local intent, filters no catalog, requests no network, and represents no completed submission or persistence.</en></lang>
    -->
    <section class="fixture-p66-form" data-smoke="p66-form-composition">
      <h2>Local form composition / 本地表单组合</h2>
      <UForm ref="p66FormReference" :model="p66FormModel" :rules="p66FormRules" label-position="top">
        <UFormItem prop="fieldText" help-text="UField uses its built-in UInput / UField 使用内建 UInput">
          <UField
            :model-value="p66FormModel.fieldText"
            label="Field text / 字段文字"
            :required="true"
            placeholder="Enter field text / 输入字段文字"
            @update:model-value="updateP66FieldText"
          />
        </UFormItem>
        <UFormItem prop="inputText" label="Direct input / 直接输入">
          <UInput
            :model-value="p66FormModel.inputText"
            placeholder="Enter direct text / 输入直接文字"
            @update:model-value="updateP66InputText"
          />
        </UFormItem>
        <UFormItem prop="longText" label="Long text / 多行文字">
          <UTextarea
            :model-value="p66FormModel.longText"
            placeholder="Enter long text / 输入多行文字"
            :show-count="true"
            @update:model-value="updateP66LongText"
          />
        </UFormItem>
        <UFormItem prop="searchText" label="Search text / 查询文字">
          <USearch
            :model-value="p66FormModel.searchText"
            placeholder="Enter local query / 输入本地查询"
            :show-action="true"
            action-text="Observe / 观察"
            @update:model-value="updateP66SearchText"
            @search="recordP66SearchIntent"
          />
        </UFormItem>
      </UForm>
      <!-- <lang><zh-CN>三个按钮只调用组件 ref 的有界 API 并更新当前 fixture marker；它们不触发 submit、远端 validator 或业务流程。</zh-CN><en>The three buttons call only bounded component-ref APIs and update the current fixture marker; they trigger no submit, remote validator, or business flow.</en></lang> -->
      <div class="fixture-p66-form__actions">
        <UButton label="Validate locally / 本地校验" @click="validateP66Form" />
        <UButton variant="secondary" label="Clear validation / 清除校验" @click="clearP66Validation" />
        <UButton variant="secondary" label="Reset fields / 重置字段" @click="resetP66Fields" />
      </div>
      <p class="fixture-p66-form__result" data-smoke="p66-form-result">{{ p66FormResult }}</p>
    </section>
    <!-- <lang><zh-CN>本段组合 P54 的本地导航、间距、反馈和 overlay 组件；所有文案与可见性均由本 fixture 明确提供。</zh-CN><en>This section composes P54 local navigation, spacing, feedback, and overlay components; the fixture explicitly provides every copy value and visibility selection.</en></lang> -->
    <UConfigProvider density="compact" locale="en">
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
    <!-- <lang><zh-CN>裁剪选择和验证码状态均来自 fixture 本地声明，验证受控意图面可在 H5 构建中解析；不选择文件、不加载图片、不裁剪像素、不发送验证码或计时。</zh-CN><en>Crop selection and verification state both come from fixture local declarations to verify controlled intent surfaces resolve in the H5 build; they choose no file, load no image, crop no pixel, send no code, and run no timer.</en></lang> -->
    <UAvatarCropper :visible="true" select-text="Select source / 选择来源" />
    <UVerificationCode :visible="true" label="Local request state / 本地请求状态" status-text="Caller state / 调用方状态" remaining-text="No local timer / 无本地计时器" :remaining-seconds="30" request-text="Request / 请求" :request-enabled="true" />
    <!-- <lang><zh-CN>本段用 fixture-owned 静态数据组合 P56.2 受控数值、notice、sheet、step 和 timeline；它们不开始 timer、原生全屏、自动轮播、流程或远程数据访问。</zh-CN><en>This section composes P56.2 controlled number, notice, sheet, step, and timeline surfaces with fixture-owned static data; they start no timer, native fullscreen, automatic rotation, workflow, or remote data access.</en></lang> -->
    <UCircleProgress :value="42" :max="80" label="Local value / 本地数值" />
    <UColumnNotice :items="fixtureNoticeItems" :active-index="0" aria-label="Local column notice / 本地纵向提示" />
    <URowNotice :items="fixtureNoticeItems" :active-index="1" aria-label="Local row notice / 本地横向提示" />
    <UCountDown :remaining="3661" aria-label="Local static remaining time / 本地静态剩余时间" />
    <UFullScreen :visible="false" title="Local sheet / 本地覆盖面" close-text="Close / 关闭" />
    <UStep title="Local step / 本地步骤" description="Caller projection / 调用方投影" :index="0" status="process" :interactive="true" />
    <UTimeLine aria-label="Local timeline / 本地时间线"><UTimeLineItem title="Local timeline item / 本地时间线项目" time="00:00" description="Static caller projection / 静态调用方投影" status="primary" :is-last="true" /></UTimeLine>
    <!-- <lang><zh-CN>本段使用 fixture-owned 有限索引、active 图片、区段、静态 panel 和列投影，验证 H5 build 可解析它们；它不读取 viewport、请求资源、使用原生 swiper 或进行高度测量。</zh-CN><en>This section uses fixture-owned finite index, active image, segment, static panel, and column projection to verify H5 build resolution; it reads no viewport, requests no resource, uses no native swiper, and measures no height.</en></lang> -->
    <UIndexAnchor label="Local index / 本地索引" value="local" :active="true" />
    <UIndexList :groups="fixtureIndexGroups" active-value="local" aria-label="Local index groups / 本地索引组" />
    <ULazyLoad :active="false" src="" alt="Local deferred image / 本地延迟图片" placeholder-text="Caller placeholder / 调用方占位" />
    <USubsection :items="fixtureSegmentItems" model-value="first" aria-label="Local segments / 本地区段" />
    <UTabsSwiper :items="fixtureSegmentItems" model-value="first" aria-label="Local static panel / 本地静态面板" previous-text="Previous / 上一项" next-text="Next / 下一项" />
    <UWaterfall :items="fixtureWaterfallItems" :column-count="2" aria-label="Local deterministic columns / 本地确定性列" />
    <!-- <lang><zh-CN>本段使用 fixture-owned rows、header、cell 与 locale 子树标记验证 H5 可解析 view table；它不查询、排序、测量或加载翻译。</zh-CN><en>This section uses fixture-owned rows, headers, cells, and locale-subtree marker to verify H5 resolves a view table; it does not query, sort, measure, or load translations.</en></lang> -->
    <UTable aria-label="Local table / 本地表格">
      <UTr><UTh label="Name / 名称" /><UTh label="Status / 状态" /></UTr>
      <UTr value="local-row" :clickable="true"><UTd text="Local row / 本地行" /><UTd text="Static / 静态" /></UTr>
    </UTable>
    <UBackTop :visible="true" label="Top / 顶部" @back-top="recordP54Intent('top')" />
    <UFab :visible="true" label="Create / 新建" @click="recordP54Intent('fab')" />
    <URootPortal :visible="true" :layer="1200"><UTransition :visible="true" mode="fade"><UTopTips :visible="true" message="Local overlay / 本地浮层" close-text="Close / 关闭" @close="recordP54Intent('tips')" /></UTransition></URootPortal>
    <UMask :visible="false" :clickable="true" @click="recordP54Intent('mask')" />
    <ULoadingPopup :visible="false" label="Local popup / 本地弹层" :mask-closable="true" @close="recordP54Intent('popup')" />
    <p data-smoke="selected">{{ p67SelectValue }}</p>
    <p data-smoke="level">{{ p67SliderValue }}</p>
    <p data-smoke="p54-intent">{{ p54Intent }}</p>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { UActionSheetItem, UAvatarCropper, UBackTop, UButton, UCarKeyboard, UCellItem, UCitySelect, UConfigProvider, UFab, UKeyboard, ULoading, ULoadingPopup, UMask, UMessageInput, UNavbar, UNoNetwork, UNoticeBar, UNumberKeyboard, URootPortal, USafeBottom, USection, UStatusBar, UText, UTopTips, UTransition, UVerificationCode } from '../../../src/index.mjs';
// <lang><zh-CN>本批具名导入只把受控 P56.2 表面提供给 H5 fixture；导入本身不注册组件、启动 timer 或写入全局状态。</zh-CN><en>These named imports provide controlled P56.2 surfaces to the H5 fixture only; importing registers no component, starts no timer, and writes no global state.</en></lang>
import { UCircleProgress, UColumnNotice, UCountDown, UFullScreen, UIndexAnchor, UIndexList, ULazyLoad, URowNotice, UStep, USubsection, UTable, UTabsSwiper, UTd, UTh, UTimeLine, UTimeLineItem, UTr, UWaterfall } from '../../../src/index.mjs';
// <lang><zh-CN>六个表单/输入组件通过具名入口进入 H5 fixture；该导入不安装全局 plugin，也不创建业务模型或服务。</zh-CN><en>The six form/input components enter the H5 fixture through named exports; this import installs no global plugin and creates no business model or service.</en></lang>
import { UField, UForm, UFormItem, UInput, USearch, UTextarea } from '../../../src/index.mjs';
// <lang><zh-CN>十四个受控组件通过同一具名入口进入页面局部组合；该导入不注册全局组件、不提供 adapter，也不启动平台能力。</zh-CN><en>The fourteen controlled components enter the page-local composition through the same named entry; this import registers no global component, supplies no adapter, and starts no platform capability.</en></lang>
import { UCalendar, UCheckbox, UCheckboxGroup, UDropdown, UDropdownItem, UNumberBox, UPicker, URadio, URadioGroup, URate, USelect, USlider, USwitch, UUpload } from '../../../src/index.mjs';

// <lang><zh-CN>checkbox group 的透明键数组由当前页面拥有，子项不能直接修改数组。</zh-CN><en>The current page owns the checkbox group's transparent-key array, and children cannot directly mutate it.</en></lang>
const p67CheckboxValues = ref(['alpha']);
// <lang><zh-CN>radio group 的单值键由当前页面拥有，不与 dropdown 或 select 共用状态。</zh-CN><en>The current page owns the radio group's scalar key, sharing no state with dropdown or select.</en></lang>
const p67RadioValue = ref('alpha');
// <lang><zh-CN>switch 的布尔值只表示中性 fixture 状态，不表示权限或业务开关。</zh-CN><en>The switch Boolean represents neutral fixture state only, not authorization or a business switch.</en></lang>
const p67SwitchValue = ref(false);
// <lang><zh-CN>picker 的两列调用方值保持原始字符串/数字类型。</zh-CN><en>The picker's two caller values preserve their original string and number types.</en></lang>
const p67PickerValue = ref(['alpha', 1]);
// <lang><zh-CN>固定日期使构建证据不依赖执行机器的系统日期或时区。</zh-CN><en>The fixed date keeps build evidence independent of the executing machine's system date or time zone.</en></lang>
const p67CalendarValue = ref('2026-08-11');
// <lang><zh-CN>select 的受控值只从本页有限 options 取值。</zh-CN><en>The controlled select value comes only from this page's finite options.</en></lang>
const p67SelectValue = ref('public');
// <lang><zh-CN>dropdown parent 的 active name 与 item 选择值分离，避免把面板可见性当作选项值。</zh-CN><en>The dropdown parent's active name is separate from the item selection value, avoiding treatment of panel visibility as an option value.</en></lang>
const p67DropdownOpenName = ref('');
// <lang><zh-CN>dropdown item 的选项值由页面显式写回。</zh-CN><en>The page explicitly writes back the dropdown item's option value.</en></lang>
const p67DropdownValue = ref('public');
// <lang><zh-CN>number-box 初值对齐半步网格，只验证中性数值规整。</zh-CN><en>The number-box initial value aligns to the half-step grid and verifies neutral numeric normalization only.</en></lang>
const p67NumberValue = ref(2.5);
// <lang><zh-CN>rate 数值只是有限本地刻度，不表示评价提交。</zh-CN><en>The rate value is a finite local scale only and represents no review submission.</en></lang>
const p67RateValue = ref(3);
// <lang><zh-CN>slider 值对齐相对 min 的固定步长。</zh-CN><en>The slider value aligns to a fixed step relative to its minimum.</en></lang>
const p67SliderValue = ref(4);
// <lang><zh-CN>adapter marker 只保存公开 status discriminant，不保留文件、事件或失败对象。</zh-CN><en>The adapter marker stores only the public status discriminant and retains no file, event, or failure object.</en></lang>
const p67UploadAdapterState = ref('idle');

// <lang><zh-CN>picker 的两列是冻结的中性本地 options；它们不表示城市、产品、身份或远端枚举。</zh-CN><en>The two picker columns are frozen neutral local options; they represent no city, product, identity, or remote enumeration.</en></lang>
const p67PickerColumns = Object.freeze([
  Object.freeze([Object.freeze({ label: 'Alpha / 甲', value: 'alpha' }), Object.freeze({ label: 'Beta / 乙', value: 'beta' })]),
  Object.freeze([Object.freeze({ label: 'One / 一', value: 1 }), Object.freeze({ label: 'Two / 二', value: 2 })])
]);

// <lang><zh-CN>select 拥有自己的有限 option 集合，不执行请求或动态脚本。</zh-CN><en>Select owns its finite option collection and executes no request or dynamic script.</en></lang>
const p67SelectOptions = Object.freeze([
  Object.freeze({ label: 'Public / 公共', value: 'public' }),
  Object.freeze({ label: 'Private / 私有', value: 'private' })
]);
// <lang><zh-CN>dropdown 使用独立冻结集合，避免与 select 共享可变数组或隐式业务关系。</zh-CN><en>Dropdown uses an independently frozen collection, avoiding a shared mutable array or implicit business relation with select.</en></lang>
const p67DropdownOptions = Object.freeze([
  Object.freeze({ label: 'Public / 公共', value: 'public' }),
  Object.freeze({ label: 'Private / 私有', value: 'private' })
]);

// <lang><zh-CN>上传记录只是页面可读状态，不含路径、URL、字节、凭据、请求句柄或平台文件对象。</zh-CN><en>Upload records are page-readable state only and contain no path, URL, bytes, credential, request handle, or platform-file object.</en></lang>
const p67UploadFiles = ref([
  Object.freeze({ label: 'Local ready record / 本地就绪记录', status: 'ready', statusText: 'Ready / 就绪' }),
  Object.freeze({ label: 'Local retry record / 本地重试记录', status: 'error', statusText: 'Review locally / 本地审阅' })
]);

// <lang><zh-CN>select adapter 可追加的唯一记录是冻结的 fixture 常量；它不是 chooser 结果或真实文件。</zh-CN><en>The sole record appendable by the select adapter is a frozen fixture constant; it is neither a chooser result nor a real file.</en></lang>
const P67_ADDED_UPLOAD_RECORD = Object.freeze({ label: 'Local added record / 本地新增记录', status: 'ready', statusText: 'Added locally / 本地新增' });

/**
 * @lang zh-CN 为 select intent 返回新的本地记录数组；函数只复制 adapter context 的有限记录并追加 fixture 常量。
 * @lang en Returns a new local-record array for a select intent; the function only copies finite records from adapter context and appends the fixture constant.
 * @param {{files: ReadonlyArray<object>}} context <lang><zh-CN>UUpload 提供的冻结浅层记录快照。</zh-CN><en>Frozen shallow record snapshot supplied by UUpload.</en></lang>
 * @returns {ReadonlyArray<object>} <lang><zh-CN>新的冻结候选数组。</zh-CN><en>New frozen candidate array.</en></lang>
 */
function addP67LocalUploadRecord(context) {
  // <lang><zh-CN>spread 只复制数组槽位，不读取文件内容、打开 chooser 或修改 caller source。</zh-CN><en>Spread copies array slots only and neither reads file content, opens a chooser, nor mutates caller source.</en></lang>
  return Object.freeze([...context.files, P67_ADDED_UPLOAD_RECORD]);
}

/**
 * @lang zh-CN 为 remove intent 构造不含目标索引的新数组；记录对象保持调用方 identity。
 * @lang en Builds a new array without the target index for a remove intent; record objects retain caller identity.
 * @param {{files: ReadonlyArray<object>, index: number}} context <lang><zh-CN>UUpload 提供的冻结文件快照与有限索引。</zh-CN><en>Frozen file snapshot and bounded index supplied by UUpload.</en></lang>
 * @returns {ReadonlyArray<object>} <lang><zh-CN>新的冻结候选数组。</zh-CN><en>New frozen candidate array.</en></lang>
 */
function removeP67LocalUploadRecord(context) {
  // <lang><zh-CN>局部数组只收集非目标记录，永不修改 context.files。</zh-CN><en>The local array collects only nontarget records and never mutates context.files.</en></lang>
  const nextFiles = [];
  for (let index = 0; index < context.files.length; index += 1) {
    // <lang><zh-CN>目标索引被明确跳过；其他槽位按原顺序复制。</zh-CN><en>The target index is explicitly skipped; all other slots are copied in original order.</en></lang>
    if (index !== context.index) nextFiles.push(context.files[index]);
  }
  return Object.freeze(nextFiles);
}

/**
 * @lang zh-CN 结束 preview/retry 的本地观察而不产生 model 候选；组件仍会报告成功 adapter 状态。
 * @lang en Completes local preview/retry observation without producing a model candidate; the component still reports a successful adapter state.
 * @returns {undefined} <lang><zh-CN>明确无文件列表更新。</zh-CN><en>Explicitly no file-list update.</en></lang>
 */
function observeP67UploadIntent() {
  // <lang><zh-CN>undefined 是显式“成功但无 model 更新”结果，不触发任何替代行为。</zh-CN><en>Undefined explicitly means success without a model update and triggers no fallback behavior.</en></lang>
  return undefined;
}

// <lang><zh-CN>adapter 只暴露四个受限 action；没有 transport、chooser、凭据、URL、timer 或共享队列。</zh-CN><en>The adapter exposes only four bounded actions and has no transport, chooser, credential, URL, timer, or shared queue.</en></lang>
const p67UploadAdapter = Object.freeze({
  select: addP67LocalUploadRecord,
  preview: observeP67UploadIntent,
  remove: removeP67LocalUploadRecord,
  retry: observeP67UploadIntent
});

/**
 * @lang zh-CN 接受 UUpload 唯一允许的数组候选并替换页面 ref；无效值保持原状态。
 * @lang en Accepts the sole array candidate permitted from UUpload and replaces the page ref; invalid values retain prior state.
 * @param {unknown} nextFiles <lang><zh-CN>组件报告的候选文件记录集合。</zh-CN><en>Candidate file-record collection reported by the component.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；有效时只写页面局部 ref。</zh-CN><en>No return value; on validity writes only the page-local ref.</en></lang>
 */
function updateP67UploadFiles(nextFiles) {
  // <lang><zh-CN>数组 guard 防止 fixture 把任意事件值解释为文件状态。</zh-CN><en>The array guard prevents the fixture from interpreting an arbitrary event value as file state.</en></lang>
  if (!Array.isArray(nextFiles)) return;
  // <lang><zh-CN>新容器保持页面拥有写回 identity，记录对象不被解析或克隆。</zh-CN><en>A new container keeps writeback identity page-owned while record objects are neither interpreted nor cloned.</en></lang>
  p67UploadFiles.value = [...nextFiles];
}

/**
 * @lang zh-CN 把受限 adapter 状态的 status discriminant 投影为可见 smoke 文字；不保存 event、文件或失败 cause。
 * @lang en Projects the status discriminant from a bounded adapter state into visible smoke text; stores no event, file, or failure cause.
 * @param {unknown} state <lang><zh-CN>UUpload 报告的候选 adapter 状态。</zh-CN><en>Candidate adapter state reported by UUpload.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只写稳定本地 marker。</zh-CN><en>No return value; writes only the stable local marker.</en></lang>
 */
function recordP67UploadAdapterState(state) {
  // <lang><zh-CN>只读取非 null 对象的字符串 status；其他输入统一收束为 unknown。</zh-CN><en>Reads a string status only from a non-null object; every other input converges to unknown.</en></lang>
  const status = typeof state === 'object' && state !== null && typeof state.status === 'string' ? state.status : 'unknown';
  p67UploadAdapterState.value = status;
}
// <lang><zh-CN>本地观察文字只记录 P54 intent 名称，用于 H5 build/smoke，不触发路由、滚动、网络或存储。</zh-CN><en>Local observation copy records only a P54 intent name for H5 build/smoke and triggers no router, scrolling, network, or storage.</en></lang>
const p54Intent = ref('none');
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
// <lang><zh-CN>notice 项是 H5 fixture 的有限本地文字投影，只测试 controlled active index；它们不代表公告数据源或自动轮播。</zh-CN><en>Notice items are finite local-copy projections for the H5 fixture and test controlled active index only; they represent no announcement source or automatic rotation.</en></lang>
const fixtureNoticeItems = Object.freeze([
  Object.freeze({ label: 'Local first item / 本地第一项', value: 'first' }),
  Object.freeze({ label: 'Local second item / 本地第二项', value: 'second' })
]);
// <lang><zh-CN>索引、区段与列投影数据均是 H5 fixture 拥有的有限本地文字；它们不表示滚动位置、远程图片、行业筛选或无穷数据源。</zh-CN><en>Index, segment, and column-projection data are finite local copy owned by the H5 fixture; they represent no scroll position, remote image, industry filter, or infinite data source.</en></lang>
const fixtureIndexGroups = Object.freeze([
  Object.freeze({ label: 'Local / 本地', value: 'local' }),
  Object.freeze({ label: 'Alternate / 备用', value: 'alternate' })
]);
const fixtureSegmentItems = Object.freeze([
  Object.freeze({ label: 'First / 第一项', value: 'first', description: 'Static caller panel / 静态调用方 panel' }),
  Object.freeze({ label: 'Second / 第二项', value: 'second', description: 'Finite local projection / 有限局部投影' })
]);
const fixtureWaterfallItems = Object.freeze([
  Object.freeze({ label: 'Column item A / 列项 A', value: 'a' }),
  Object.freeze({ label: 'Column item B / 列项 B', value: 'b' }),
  Object.freeze({ label: 'Column item C / 列项 C', value: 'c' })
]);

// <lang><zh-CN>表单 ref 只用于三个显式本地观察动作；初始 null 不触发自动校验。</zh-CN><en>The form ref serves only three explicit local observation actions; its initial null starts no automatic validation.</en></lang>
const p66FormReference = ref(null);

// <lang><zh-CN>中性模型由当前 H5 页面拥有；字段只表示输入形态，不表示用户、订单、资源或其他业务实体。</zh-CN><en>The current H5 page owns this neutral model; its fields represent only input shapes and no user, order, resource, or other business entity.</en></lang>
const p66FormModel = reactive({
  fieldText: 'Local field',
  inputText: 'Local input',
  longText: 'Local long text',
  searchText: 'Local query'
});

/**
 * @lang zh-CN 声明仅由本 fixture 源码提供的同步规则；规则不读取网络、storage、locale service 或业务配置。
 * @lang en Declares synchronous rules supplied only by this fixture source; the rules read no network, storage, locale service, or business configuration.
 */
const p66FormRules = Object.freeze({
  fieldText: Object.freeze([Object.freeze({ required: true, trigger: Object.freeze(['change', 'blur']), message: 'Field text is required / 字段文字为必填' })]),
  inputText: Object.freeze([Object.freeze({ min: 2, trigger: 'blur', message: 'Use at least two characters / 至少输入两个字符' })]),
  longText: Object.freeze([Object.freeze({ max: 80, trigger: 'change', message: 'Use at most eighty characters / 最多输入八十个字符' })]),
  searchText: Object.freeze([Object.freeze({ min: 2, trigger: 'change', message: 'Use at least two query characters / 查询至少输入两个字符' })])
});

// <lang><zh-CN>可见结果只记录本地 fixture 操作状态；它不是校验服务、提交状态或持久化回执。</zh-CN><en>The visible result records only local fixture-operation state; it is no validation service, submission status, or persistence receipt.</en></lang>
const p66FormResult = ref('idle');

/**
 * @lang zh-CN 由页面显式写回 UField 内建输入报告的字符串，保持 model 所有权在 fixture。
 * @lang en Explicitly writes back the string reported by UField's built-in input, keeping model ownership in the fixture.
 * @param {string} value <lang><zh-CN>未经修改的本地候选值。</zh-CN><en>Unmodified local candidate value.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只写页面本地模型。</zh-CN><en>No return value; writes only the page-local model.</en></lang>
 */
function updateP66FieldText(value) {
  p66FormModel.fieldText = value;
}

/**
 * @lang zh-CN 由页面显式写回直接 UInput 报告的字符串。
 * @lang en Explicitly writes back the string reported by the direct UInput.
 * @param {string} value <lang><zh-CN>未经修改的本地候选值。</zh-CN><en>Unmodified local candidate value.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只写页面本地模型。</zh-CN><en>No return value; writes only the page-local model.</en></lang>
 */
function updateP66InputText(value) {
  p66FormModel.inputText = value;
}

/**
 * @lang zh-CN 由页面显式写回 UTextarea 报告的多行字符串。
 * @lang en Explicitly writes back the multiline string reported by UTextarea.
 * @param {string} value <lang><zh-CN>未经修改的本地候选值。</zh-CN><en>Unmodified local candidate value.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只写页面本地模型。</zh-CN><en>No return value; writes only the page-local model.</en></lang>
 */
function updateP66LongText(value) {
  p66FormModel.longText = value;
}

/**
 * @lang zh-CN 由页面显式写回 USearch 报告的查询字符串，但不据此生成结果或请求。
 * @lang en Explicitly writes back the query string reported by USearch without generating results or requests.
 * @param {string} value <lang><zh-CN>未经修改的本地查询候选。</zh-CN><en>Unmodified local query candidate.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只写页面本地模型。</zh-CN><en>No return value; writes only the page-local model.</en></lang>
 */
function updateP66SearchText(value) {
  p66FormModel.searchText = value;
}

/**
 * @lang zh-CN 运行当前已注册字段的显式完整校验，并把 boolean 映射为稳定可见 marker。
 * @lang en Runs explicit complete validation for currently registered fields and maps the boolean to a stable visible marker.
 * @returns {Promise<void>} <lang><zh-CN>校验完成并更新本地 marker 后解决。</zh-CN><en>Resolves after validation completes and the local marker is updated.</en></lang>
 */
async function validateP66Form() {
  // <lang><zh-CN>挂载前没有可调用实例；该分支只披露 fixture 状态，不尝试重试或全局查找。</zh-CN><en>No callable instance exists before mount; this branch only discloses fixture state and attempts neither retry nor global lookup.</en></lang>
  const form = p66FormReference.value;
  if (form === null) {
    p66FormResult.value = 'unavailable';
    return;
  }

  // <lang><zh-CN>UForm Promise 始终返回 boolean；页面只把它转换为非业务 marker。</zh-CN><en>The UForm Promise always returns a boolean; the page converts it only to a nonbusiness marker.</en></lang>
  const valid = await form.validate();
  p66FormResult.value = valid ? 'valid' : 'invalid';
}

/**
 * @lang zh-CN 清除全部内部校验投影，同时保留调用方模型原值。
 * @lang en Clears every internal validation projection while retaining the caller-model values.
 * @returns {void} <lang><zh-CN>无返回值；只更新组件局部状态和观察 marker。</zh-CN><en>No return value; updates only component-local state and the observation marker.</en></lang>
 */
function clearP66Validation() {
  // <lang><zh-CN>可选实例 guard 防止挂载边界抛错，不创建替代 form。</zh-CN><en>The optional-instance guard prevents a mount-boundary error and creates no substitute form.</en></lang>
  p66FormReference.value?.clearValidate();
  p66FormResult.value = 'cleared';
}

/**
 * @lang zh-CN 显式恢复各字段挂载快照并清除校验；这是 fixture 唯一允许 UForm 写 model 的入口。
 * @lang en Explicitly restores each field's mount snapshot and clears validation; this is the fixture's only entry that permits UForm to write the model.
 * @returns {void} <lang><zh-CN>无返回值；更新字段和观察 marker。</zh-CN><en>No return value; updates fields and the observation marker.</en></lang>
 */
function resetP66Fields() {
  // <lang><zh-CN>没有实例时保持模型不变；marker 仍记录调用方发出的本地 reset 请求。</zh-CN><en>Without an instance the model remains unchanged; the marker still records the caller's local reset request.</en></lang>
  p66FormReference.value?.resetFields();
  p66FormResult.value = 'reset';
}

/**
 * @lang zh-CN 记录 USearch 的本地 search intent；有无文字只改变中性 marker，不触发查询机制。
 * @lang en Records USearch's local search intent; whether copy exists changes only a neutral marker and starts no query mechanism.
 * @param {string} value <lang><zh-CN>当前调用方拥有的查询文字。</zh-CN><en>Current caller-owned query copy.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只写观察 marker。</zh-CN><en>No return value; writes only the observation marker.</en></lang>
 */
function recordP66SearchIntent(value) {
  p66FormResult.value = value.length > 0 ? 'search-intent' : 'search-empty-intent';
}

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
