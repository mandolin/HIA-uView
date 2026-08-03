<!--
@lang zh-CN 在仅编译期的 `mp-weixin` fixture 中组合现有 HIA-uView 组件，演示固定匿名 mock 的目录、受控同步查询、详情投影、空态 reset 与调用方控制的确认/反馈状态。页面不执行网络、路由、身份、持久化、异步数据、分页、计时器或平台系统操作。
@lang en Composes existing HIA-uView components in the compile-only `mp-weixin` fixture to demonstrate a fixed anonymous mock directory, controlled synchronous query, detail projection, empty-state reset, and caller-controlled confirmation/feedback state. The page performs no network, routing, identity, persistence, asynchronous data, paging, timer, or platform-system operation.
-->
<template>
  <!-- <lang><zh-CN>页面级 stack 只提供局部纵向布局，目录/查询/详情的状态与流程仍归当前调用方页面所有。</zh-CN><en>The page-level stack provides local vertical layout only; state and flow for directory, query, and detail remain owned by the current caller page.</en></lang> -->
  <u-stack class="fixture-page" gap="lg">
    <!-- <lang><zh-CN>导航栏 action 只重置当前页面的本地查询；它不创建返回栈、目标地址或任何平台导航。</zh-CN><en>The navigation-bar action resets only the current page local query; it creates no back stack, destination, or platform navigation.</en></lang> -->
    <u-nav-bar
      title="本地目录示例 / Local catalog"
      action-text="重置查询 / Reset query"
      @action="resetCatalogQuery"
    />

    <!-- <lang><zh-CN>P54 组合以调用方声明的文字、尺寸和可见性验证新导航、间距、反馈与同树 overlay 表面能够被小程序编译器解析；它不引入平台读取、路由、滚动、网络或全局 service。</zh-CN><en>The P54 composition uses caller-declared copy, dimensions, and visibility to verify that the Mini Program compiler resolves the new navigation, spacing, feedback, and same-tree overlay surfaces; it introduces no platform read, router, scrolling, network, or global service.</en></lang> -->
    <u-config-provider density="compact">
      <u-status-bar :height="18" />
      <u-navbar title="Fixture navigation / Fixture 导航" left-text="Back / 返回" right-text="Save / 保存" />
      <u-cell-item title="Local entry / 本地条目" label="Caller projection / 调用方投影" value="Ready / 就绪" :arrow="true" :clickable="true" />
      <u-notice-bar :visible="true" text="Local feedback only / 仅本地反馈" close-text="Dismiss / 关闭" />
      <u-loading :visible="true" label="Local state / 本地状态" />
      <u-no-network :visible="true" title="Caller-declared state / 调用方声明状态" retry-text="Retry / 重试" />
      <u-safe-bottom :height="12" />
    </u-config-provider>
    <u-back-top :visible="true" label="Top / 顶部" />
    <u-fab :visible="true" label="Create / 新建" />
    <u-root-portal :visible="false"><u-transition :visible="true" mode="fade"><u-top-tips :visible="true" message="Local overlay / 本地浮层" close-text="Close / 关闭" /></u-transition></u-root-portal>
    <u-mask :visible="false" :clickable="true" />
    <u-loading-popup :visible="false" label="Local popup / 本地弹层" :mask-closable="true" />

    <!-- <lang><zh-CN>本段使用页面拥有的有限静态数据编译 item、列选择和固定长度输入；它不请求地区数据、不处理验证码、不注入 action-sheet 父级，也不写入页面以外的状态。</zh-CN><en>This section compiles item, column-selection, and fixed-length-input surfaces with page-owned finite static data; it requests no region data, handles no verification code, injects no action-sheet parent, and writes no state outside the page.</en></lang> -->
    <u-action-sheet-item text="本地选择 / Local choice" value="fixture-choice" />
    <u-city-select :visible="true" title="本地列 / Local columns" :columns="fixtureSelectorColumns" :model-value="fixtureSelectorValues" close-text="关闭 / Close" confirm-text="确认 / Confirm" />
    <u-message-input input-label="本地固定长度输入 / Local fixed-length input" model-value="42" :length="4" />

    <!-- <lang><zh-CN>三类键盘只消费页面自有的中性有限键/键行与文本，验证小程序编译器解析受控 keyboard surface；它们不建立金额、地区、车辆、身份、系统键盘或焦点所有权。</zh-CN><en>All three keyboards consume only page-owned neutral finite keys/key rows and copy to verify that the Mini Program compiler resolves controlled keyboard surfaces; they establish no money, region, vehicle, identity, system-keyboard, or focus ownership.</en></lang> -->
    <u-number-keyboard :visible="true" :keys="fixtureNumberKeys" label="本地数值键 / Local numeric keys" backspace-label="删除 / Remove" confirm-text="确认 / Confirm" />
    <u-car-keyboard :visible="true" :rows="fixtureCarRows" label="本地行键 / Local row keys" phase="primary" next-phase="secondary" switch-text="下一组 / Next" backspace-label="删除 / Remove" confirm-text="确认 / Confirm" />
    <u-keyboard :visible="false" mode="number" :number-keys="fixtureNumberKeys" label="本地组合键 / Local composed keys" backspace-label="删除 / Remove" confirm-text="确认 / Confirm" />

    <!-- <lang><zh-CN>文件状态、裁剪选择和验证码状态均为页面本地声明，以验证小程序编译器可解析受控意图面；它们不选择文件、不读图片字节、不裁剪像素、不发送验证码或计时。</zh-CN><en>File state, crop selection, and verification state are all page-local declarations to verify that the Mini Program compiler resolves controlled intent surfaces; they choose no file, read no image bytes, crop no pixel, send no code, and run no timer.</en></lang> -->
    <u-upload :visible="true" :files="fixtureFiles" label="本地文件 / Local files" select-text="选择 / Select" preview-text="预览 / Preview" remove-text="删除 / Remove" retry-text="重试 / Retry" :max="3" />
    <u-avatar-cropper :visible="true" select-text="选择来源 / Select source" />
    <u-verification-code :visible="true" label="本地请求状态 / Local request state" status-text="调用方状态 / Caller state" remaining-text="无本地计时器 / No local timer" :remaining-seconds="30" request-text="请求 / Request" :request-enabled="true" />

    <!-- <lang><zh-CN>本段以页面拥有的有限数值、notice、步骤和 timeline 字段编译 P56.2 静态投影；它们不启动 timer、full-screen API、公告轮播、流程或事件数据源。</zh-CN><en>This section compiles P56.2 static projections with page-owned finite number, notice, step, and timeline fields; they start no timer, fullscreen API, notice rotation, workflow, or event data source.</en></lang> -->
    <u-circle-progress :value="42" :max="80" label="本地数值 / Local value" />
    <u-column-notice :items="fixtureNoticeItems" :active-index="0" aria-label="本地纵向提示 / Local column notice" />
    <u-row-notice :items="fixtureNoticeItems" :active-index="1" aria-label="本地横向提示 / Local row notice" />
    <u-count-down :remaining="3661" aria-label="本地静态剩余时间 / Local static remaining time" />
    <u-full-screen :visible="false" title="本地覆盖面 / Local sheet" close-text="关闭 / Close" />
    <u-step title="本地步骤 / Local step" description="调用方呈现 / Caller projection" :index="0" status="process" :interactive="true" />
    <u-time-line aria-label="本地时间线 / Local timeline"><u-time-line-item title="本地时间线项目 / Local timeline item" time="00:00" description="静态调用方投影 / Static caller projection" status="primary" :is-last="true" /></u-time-line>

    <!-- <lang><zh-CN>notice 只呈现页面在确认本地意图后显式写入的消息和可见状态；它不表示保存、请求或业务完成。</zh-CN><en>The notice presents only the message and visibility explicitly written by the page after local intent confirmation; it represents no save, request, or business completion.</en></lang> -->
    <u-notice
      :visible="catalogNoticeVisible"
      tone="success"
      :message="catalogNoticeMessage"
      dismiss-text="关闭提示 / Dismiss"
      @dismiss="dismissCatalogNotice"
    />

    <!-- <lang><zh-CN>查询 field 组合调用方 label、help、受控 input 与独立消息；输入不会触发远程查询、规则执行或持久化。</zh-CN><en>The query field composes caller label, help, controlled input, and independent message; input triggers no remote query, rule execution, or persistence.</en></lang> -->
    <u-stack class="fixture-catalog" gap="md">
      <u-field
        label="本地目录查询 / Local catalog query"
        :required="true"
        help-text="仅同步筛选固定匿名 mock 文字。"
      >
        <!-- <lang><zh-CN>受控 input 将未修改字符串交还给页面；只有页面 handler 可以写入 query ref 并决定是否清除选择/反馈。</zh-CN><en>The controlled input returns the unmodified string to the page; only the page handler can write the query ref and decide whether to clear selection or feedback.</en></lang> -->
        <u-input
          class="fixture-catalog__query"
          :model-value="catalogQuery"
          placeholder="输入样例文字 / Enter sample text"
          @update:model-value="updateCatalogQuery"
        />
      </u-field>

      <!-- <lang><zh-CN>首发高频控件只验证受控值和本地 intent 的组合，不创建业务字段、规则、请求或持久化。</zh-CN><en>The first high-frequency controls verify controlled values and local intent composition only; they create no business fields, rules, requests, or persistence.</en></lang> -->
      <u-form label-position="top">
        <u-form-item label="备注 / Note" help-text="仅展示受控多行文字。">
          <u-textarea
            :model-value="fixtureTextareaValue"
            placeholder="输入备注 / Enter a note"
            :show-count="true"
            @update:model-value="updateFixtureTextareaValue"
          />
        </u-form-item>
        <u-form-item label="本地开关 / Local switch">
          <u-switch :model-value="fixtureSwitchValue" label="启用样例 / Enable sample" @update:model-value="updateFixtureSwitchValue" />
        </u-form-item>
        <u-form-item label="数量 / Quantity">
          <u-number-box :model-value="fixtureNumberValue" :min="0" :max="9" @update:model-value="updateFixtureNumberValue" />
        </u-form-item>
        <u-form-item label="分级 / Rate">
          <u-rate :model-value="fixtureRateValue" @update:model-value="updateFixtureRateValue" />
        </u-form-item>
        <u-form-item label="受控查询 / Controlled search">
          <u-search :model-value="catalogQuery" show-action action-text="查询 / Search" @update:model-value="updateCatalogQuery" @search="handleFixtureSearch" />
        </u-form-item>
      </u-form>

      <!-- @lang zh-CN 展示批次只组合本地文字符号、空源图片、initials、有限标签、徽标、分隔、数字和静态进度；不产生资产或任务服务。 @lang en The display batch composes local text symbol, empty-source image, initials, finite tag, badge, divider, number, and static progress only; it creates no asset or task service. <lang><zh-CN>所有值由页面 refs 拥有。</zh-CN><en>All values are owned by page refs.</en></lang> -->
      <u-stack class="fixture-display" gap="sm">
        <u-icon name="•" label="中性符号 / Neutral symbol" />
        <u-image :src="fixtureImageSource" alt="本地图片占位 / Local image placeholder" size="small" />
        <u-avatar text="HI" alt="initials 占位 / initials placeholder" size="small" />
        <u-tag :visible="fixtureTagVisible" text="本地标签 / Local tag" tone="primary" closable @close="hideFixtureTag" />
        <u-badge :value="fixtureBadgeValue"><text>徽标内容 / Badge content</text></u-badge>
        <u-divider text="局部分隔 / Local divider" />
        <u-count-to :model-value="fixtureCountValue" prefix="#" />
        <u-line-progress :percent="fixtureProgressValue" />
      </u-stack>

      <!-- @lang zh-CN P43 组合只使用页面声明的 tabs、tabbar、steps、pagination 与受控 overlay/feedback；不产生 router、timer、service 或请求。 @lang en The P43 composition uses page-declared tabs, tabbar, steps, pagination, and controlled overlay/feedback only; it creates no router, timer, service, or request. <lang><zh-CN>所有可见状态和 items 由页面 refs 拥有。</zh-CN><en>All visible state and items are owned by page refs.</en></lang> -->
      <u-stack class="fixture-navigation" gap="sm">
        <u-tabs :model-value="fixtureTabValue" :items="fixtureTabItems" @update:model-value="updateFixtureTabValue" />
        <u-tabbar :model-value="fixtureTabbarValue" :items="fixtureTabbarItems" @update:model-value="updateFixtureTabbarValue" />
        <u-steps :steps="fixtureStepItems" :current="fixtureStepCurrent" />
        <u-pagination :current="fixturePageValue" :page-count="3" @update:current="updateFixturePageValue" />
        <u-button label="打开局部 sheet / Open local sheet" @click="openFixtureSheet" />
        <u-toast :visible="fixtureToastVisible" message="局部反馈 / Local feedback" close-text="关闭 / Close" @close="closeFixtureToast" />
        <u-loading-page :visible="fixtureLoadingVisible" text="页面 loading / Page loading" />
        <u-action-sheet :visible="fixtureSheetVisible" :items="fixtureActionItems" title="局部操作 / Local actions" cancel-text="取消 / Cancel" @select="handleFixtureAction" @close="closeFixtureSheet" />
        <u-popup :visible="fixturePopupVisible" title="局部浮层 / Local popup" close-text="关闭 / Close" @close="closeFixturePopup">
          <text>调用方 slot 内容 / Caller-owned slot content</text>
        </u-popup>
      </u-stack>

      <!-- @lang zh-CN P44 组合只使用页面声明的有限列表、状态、折叠值、静态 slide、CSS overflow 和 sticky；不产生请求、缓存、虚拟化、autoplay、timer、WXS 或 observer。 @lang en The P44 composition uses page-declared finite list, status, collapse values, static slides, CSS overflow, and sticky only; it creates no request, cache, virtualization, autoplay, timer, WXS, or observer. <lang><zh-CN>所有 items 与状态由页面 refs 拥有。</zh-CN><en>All items and state are owned by page refs.</en></lang> -->
      <u-stack class="fixture-content" gap="sm">
        <u-list :items="fixtureListItems" aria-label="本地列表 / Local list" @select="handleFixtureListSelect" />
        <u-loadmore :status="fixtureLoadmoreStatus" @loadmore="handleFixtureLoadmore" />
        <u-skeleton :loading="fixtureSkeletonLoading" :rows="2" :show-title="true" :show-avatar="true">
          <text>骨架完成后的本地内容 / Local content after skeleton</text>
        </u-skeleton>
        <u-collapse :model-value="fixtureCollapseValues" @update:model-value="updateFixtureCollapseValues">
          <u-collapse-item name="limits" title="限制 / Limits" description="受控 disclosure / Controlled disclosure">
            <text>列表、滚动和吸顶均由页面决定是否使用。</text>
          </u-collapse-item>
          <u-collapse-item name="evidence" title="证据 / Evidence" description="静态编译证据 / Static compile evidence">
            <text>fixture 不代表 DevTools、真机或发布认证。</text>
          </u-collapse-item>
        </u-collapse>
        <u-swiper :items="fixtureSwiperItems" :model-value="fixtureSwiperValue" aria-label="本地 slide / Local slides" @update:model-value="updateFixtureSwiperValue" @select="handleFixtureSwiperSelect" />
        <u-scroll-list :items="fixtureScrollItems" aria-label="横向列表 / Horizontal list" @select="handleFixtureScrollSelect" />
        <u-sticky :offset-top="0">
          <u-badge :value="fixtureBadgeValue"><text>局部 sticky / Local sticky</text></u-badge>
        </u-sticky>
      </u-stack>

      <!-- @lang zh-CN P16 选择组只使用页面自有字符串与字符串数组，验证 group emit/writeback 而不引入 option 数据源或业务筛选。 @lang en The P16 choice groups use page-owned string and string array only, verifying group emit/writeback without introducing option data source or business filtering. <lang><zh-CN>这些控件不改变目录 query。</zh-CN><en>These controls do not change directory query.</en></lang> -->
      <u-radio-group :model-value="fixtureRadioValue" @update:model-value="updateFixtureRadioValue">
        <u-radio value="local-a" label="本地单选 A / Local radio A" />
        <u-radio value="local-b" label="本地单选 B / Local radio B" />
      </u-radio-group>
      <u-checkbox-group :model-value="fixtureCheckboxValues" @update:model-value="updateFixtureCheckboxValues">
        <u-checkbox value="local-one" label="本地多选 One / Local checkbox One" />
        <u-checkbox value="local-two" label="本地多选 Two / Local checkbox Two" />
      </u-checkbox-group>

      <!-- <lang><zh-CN>独立消息仅在页面明确声明无本地匹配时呈现；它不把无结果解释为后端错误、权限结论或真实校验结果。</zh-CN><en>The independent message presents only when the page explicitly declares no local match; it does not interpret no result as a backend error, permission conclusion, or real validation result.</en></lang> -->
      <u-validation-message
        :state="catalogQueryValidationState"
        :message="catalogQueryValidationMessage"
      />

      <!-- <lang><zh-CN>目录投影只在没有 selected identifier 时显示，使用当前同步派生数组的调用方文字；每一行 click 只选择本地 ID。</zh-CN><en>The directory projection displays only while there is no selected identifier and uses caller copy from the current synchronously derived array; every row click selects only a local ID.</en></lang> -->
      <u-stack v-if="!isCatalogDetailVisible" gap="sm">
        <!-- <lang><zh-CN>每条信息行展示匿名 mock 的 title、description 与通用 category，不把这些文字转换为领域模型、URL 或数据访问参数。</zh-CN><en>Every information row presents anonymous mock title, description, and generic category without turning that copy into a domain model, URL, or data-access parameter.</en></lang> -->
        <u-cell
          v-for="record in filteredCatalogRecords"
          :key="record.id"
          class="fixture-catalog__entry"
          :label="record.title"
          :description="record.description"
          :value="record.category"
          :clickable="true"
          @click="selectCatalogRecord(record.id)"
        />

        <!-- <lang><zh-CN>空态由页面根据派生数组决定；其 action 只请求页面重置本地 query，不加载、重试或滚动任何数据。</zh-CN><en>The page decides empty state from the derived array; its action only asks the page to reset local query and neither loads, retries, nor scrolls any data.</en></lang> -->
        <u-empty
          v-if="filteredCatalogRecords.length === 0"
          title="没有本地匹配项 / No local matches"
          description="请重置当前页面查询以恢复固定 mock 目录。"
          action-text="重置本地查询 / Reset local query"
          @action="resetCatalogQuery"
        />
      </u-stack>

      <!-- <lang><zh-CN>详情投影只在 selected identifier 匹配固定本地记录时显示；它是页面内条件渲染，不创建 route、URL、加载或缓存。</zh-CN><en>The detail projection displays only when selected identifier matches a fixed local record; it is in-page conditional rendering and creates no route, URL, loading, or cache.</en></lang> -->
      <u-stack v-else class="fixture-catalog__detail" gap="sm">
        <!-- <lang><zh-CN>三条展示行复用同一 selected record 的调用方文字，使详情仍不需要新增详情组件、对象协议或业务字段。</zh-CN><en>The three display rows reuse caller copy from one selected record, keeping detail free of a new detail component, object protocol, or business field.</en></lang> -->
        <u-cell label="标题 / Title" :value="selectedCatalogRecord.title" />
        <u-cell label="说明 / Description" :value="selectedCatalogRecord.description" />
        <u-cell label="分类 / Category" :value="selectedCatalogRecord.category" />

        <!-- <lang><zh-CN>两个按钮都只进入页面 handler：返回清除选择，记录本地意图仅显示受控 modal；它们不保存、导航或访问外部状态。</zh-CN><en>Both buttons enter page handlers only: return clears selection, while recording local intent only shows a controlled modal; neither saves, navigates, nor accesses external state.</en></lang> -->
        <u-stack direction="horizontal" gap="sm" wrap>
          <u-button
            class="fixture-catalog__return"
            variant="secondary"
            label="返回目录 / Back to catalog"
            @click="returnToCatalog"
          />
          <u-button
            class="fixture-catalog__intent"
            label="记录本地意图 / Record local intent"
            @click="openCatalogIntentModal"
          />
        </u-stack>
      </u-stack>

      <!-- <lang><zh-CN>modal 的可见状态和 confirm/cancel 后续均由页面拥有；slot 只说明当前本地样例，不发起任何数据操作。</zh-CN><en>The page owns modal visibility and all confirm/cancel follow-up; the slot only explains the current local sample and starts no data operation.</en></lang> -->
      <u-modal
        :visible="catalogModalVisible"
        title="确认本地意图 / Confirm local intent"
        confirm-text="确认 / Confirm"
        cancel-text="取消 / Cancel"
        @confirm="confirmCatalogIntent"
        @cancel="cancelCatalogIntent"
      >
        <text v-if="selectedCatalogRecord">当前选择仅保留在此页面：{{ selectedCatalogRecord.title }}</text>
      </u-modal>
    </u-stack>

    <!-- <lang><zh-CN>计数文字只显示当前同步派生记录数和是否有选择，供 compiler/runtime 组合观察；它不表示结果总量、权限、分页或服务端状态。</zh-CN><en>The counter text displays only the current synchronously derived record count and whether there is a selection for compiler/runtime composition observation; it represents no total result count, permission, paging, or server state.</en></lang> -->
    <text class="fixture-page__summary">本地匹配数 / Local matches: {{ filteredCatalogRecords.length }}；已选择 / Selected: {{ isCatalogDetailVisible ? 'yes' : 'no' }}</text>
  </u-stack>
</template>

<script setup>
// <lang><zh-CN>导入 Vue 的局部 ref/computed 与固定本地目录 helper；页面不导入全局 store、Tool、平台 API 或外部数据访问库。</zh-CN><en>Imports Vue local ref/computed and fixed local catalog helpers; the page imports no global store, Tool, platform API, or external data-access library.</en></lang>
import { computed, ref } from 'vue';
// <lang><zh-CN>页面的 u-* 标签由输入根 pages.json 的受限 easycom 表静态解析到同仓 SFC；这避免经公共 barrel 转发导致小程序编译器遗漏组件 JS/WXML/WXSS。</zh-CN><en>The page's u-* tags are statically resolved to in-repository SFCs by the bounded easycom table in the input-root pages.json; this avoids Mini Program compiler omissions of component JS/WXML/WXSS caused by public-barrel forwarding.</en></lang>
// <lang><zh-CN>导入固定匿名 mock 集合与纯同步 helper；它们位于 fixture 内而非 UI runtime 或 Biz package。</zh-CN><en>Imports the fixed anonymous mock collection and pure synchronous helpers; they reside inside the fixture rather than UI runtime or a Biz package.</en></lang>
import { LOCAL_CATALOG_RECORDS, filterLocalCatalogRecords, findLocalCatalogRecord } from './local-catalog.mjs';

// <lang><zh-CN>声明稳定页面组件名，便于 compiler/runtime 诊断定位当前 fixture，而不形成可公开消费的应用 API。</zh-CN><en>Declares a stable page component name so compiler/runtime diagnostics can locate this fixture without forming a publicly consumable application API.</en></lang>
defineOptions({
  name: 'fixture-local-catalog-page'
});

// <lang><zh-CN>调用方拥有的受控查询字符串；它只在当前页面实例存活，不写入 storage、URL 或共享状态。</zh-CN><en>Caller-owned controlled query string; it lives only for the current page instance and writes to no storage, URL, or shared state.</en></lang>
const catalogQuery = ref('');

// <lang><zh-CN>调用方拥有的本地选择键；`null` 明确表示目录视图，不自动选择固定集合的第一项。</zh-CN><en>Caller-owned local selection key; `null` explicitly represents directory view and never auto-selects the first fixed-collection item.</en></lang>
const selectedCatalogIdentifier = ref(null);

// <lang><zh-CN>确认 modal 的调用方可见状态；组件只能呈现它并 emit intent，不能自行关闭或写回。</zh-CN><en>Caller visible state for the confirmation modal; the component may only present it and emit intent and cannot close or write it back itself.</en></lang>
const catalogModalVisible = ref(false);

// <lang><zh-CN>局部 notice 的调用方可见状态；没有全局 feedback service、队列或自动消失机制。</zh-CN><en>Caller visible state for the local notice; there is no global feedback service, queue, or automatic-disappearance mechanism.</en></lang>
const catalogNoticeVisible = ref(false);

// <lang><zh-CN>局部 notice 的调用方文字；空初值确保页面在没有确认意图时不生成默认反馈语句。</zh-CN><en>Caller copy for the local notice; the empty initial value ensures the page generates no default feedback statement before confirmation intent.</en></lang>
const catalogNoticeMessage = ref('');

// <lang><zh-CN>P16 radio group 的页面自有受控字符串；它与目录选择、路由或业务字段无关。</zh-CN><en>Page-owned controlled string for the P16 radio group; it is unrelated to catalog selection, routing, or business field.</en></lang>
const fixtureRadioValue = ref('local-a');
// <lang><zh-CN>P16 checkbox group 的页面自有受控数组；页面替换整个数组而不 mutate group 输入。</zh-CN><en>Page-owned controlled array for the P16 checkbox group; the page replaces the whole array rather than mutating group input.</en></lang>
const fixtureCheckboxValues = ref(['local-one']);

// <lang><zh-CN>这组有限静态列和值只用于小程序编译组合；它们不表达城市、地点、地址或业务领域数据。</zh-CN><en>These finite static columns and values serve Mini Program compile composition only; they express no city, place, address, or business-domain data.</en></lang>
const fixtureSelectorColumns = Object.freeze([
  Object.freeze([Object.freeze({ label: '第一 / First', value: 'first' }), Object.freeze({ label: '第二 / Second', value: 'second' })]),
  Object.freeze([Object.freeze({ label: '一 / One', value: 'one' }), Object.freeze({ label: '二 / Two', value: 'two' })])
]);
const fixtureSelectorValues = Object.freeze(['first', 'one']);

// <lang><zh-CN>有限键和键行是中性页面内编译数据；它们不代表金额、地区、车辆或身份领域模型。</zh-CN><en>Finite keys and key rows are neutral in-page compilation data; they represent no money, region, vehicle, or identity domain model.</en></lang>
const fixtureNumberKeys = Object.freeze(['1', '2', '3', '4']);
const fixtureCarRows = Object.freeze([
  Object.freeze(['A', 'B', 'C']),
  Object.freeze(['1', '2', '3'])
]);

// <lang><zh-CN>notice 项是页面本地的有限文字投影，用于编译受控 activeIndex/select 表面；它们没有远程公告、滚动或定时器语义。</zh-CN><en>Notice items are page-local finite copy projections used to compile controlled activeIndex/select surfaces; they carry no remote-announcement, scrolling, or timer semantics.</en></lang>
const fixtureNoticeItems = Object.freeze([
  Object.freeze({ label: '本地第一项 / Local first item', value: 'first' }),
  Object.freeze({ label: '本地第二项 / Local second item', value: 'second' })
]);

// <lang><zh-CN>文件记录是页面内可读状态投影，不代表文件路径、bytes、上传任务或缓存。</zh-CN><en>File records are in-page readable state projections and represent no file path, bytes, upload task, or cache.</en></lang>
const fixtureFiles = Object.freeze([
  Object.freeze({ label: '本地就绪记录 / Local ready record', status: 'ready', statusText: '就绪 / Ready' }),
  Object.freeze({ label: '本地重试记录 / Local retry record', status: 'error', statusText: '本地审阅 / Review locally' })
]);

// <lang><zh-CN>新增高频控件均使用页面内局部 refs；它们不进入目录 mock、共享 store 或外部数据源。</zh-CN><en>New high-frequency controls use page-local refs only; they enter no catalog mock, shared store, or external data source.</en></lang>
const fixtureTextareaValue = ref('');
const fixtureSwitchValue = ref(false);
const fixtureNumberValue = ref(1);
const fixtureRateValue = ref(0);
const fixtureImageSource = ref('');
const fixtureTagVisible = ref(true);
const fixtureBadgeValue = ref(3);
const fixtureCountValue = ref(42);
const fixtureProgressValue = ref(65);

// <lang><zh-CN>P43 items 与状态都是页面内声明的中性 fixture 数据，不进入 UI runtime、路由或业务模型。</zh-CN><en>P43 items and state are page-declared neutral fixture data and enter no UI runtime, router, or business model.</en></lang>
const fixtureTabItems = Object.freeze([
  Object.freeze({ label: '概览 / Overview', value: 'overview' }),
  Object.freeze({ label: '说明 / Notes', value: 'notes' }),
  Object.freeze({ label: '限制 / Limits', value: 'limits' })
]);
const fixtureTabbarItems = Object.freeze([
  Object.freeze({ label: '首页 / Home', value: 'home' }),
  Object.freeze({ label: '设置 / Settings', value: 'settings' })
]);
const fixtureStepItems = Object.freeze([
  Object.freeze({ label: '声明 / Declare', description: '本地 fixture / Local fixture' }),
  Object.freeze({ label: '呈现 / Present', description: '受控 UI / Controlled UI' }),
  Object.freeze({ label: '验证 / Verify', description: '静态 evidence / Static evidence' })
]);
const fixtureActionItems = Object.freeze([
  Object.freeze({ label: '显示反馈 / Show feedback', value: 'toast' }),
  Object.freeze({ label: '显示浮层 / Show popup', value: 'popup' })
]);
const fixtureTabValue = ref('overview');
const fixtureTabbarValue = ref('home');
const fixtureStepCurrent = ref(1);
const fixturePageValue = ref(1);
const fixtureToastVisible = ref(false);
const fixtureLoadingVisible = ref(false);
const fixtureSheetVisible = ref(false);
const fixturePopupVisible = ref(false);

// <lang><zh-CN>P44 items 与状态都是页面内声明的中性 fixture 数据，不进入 UI runtime、路由或业务模型。</zh-CN><en>P44 items and state are page-declared neutral fixture data and enter no UI runtime, router, or business model.</en></lang>
const fixtureListItems = Object.freeze([
  Object.freeze({ label: '列表行 A / List row A', description: '局部文字 / Local copy', value: 'a' }),
  Object.freeze({ label: '列表行 B / List row B', description: '受控选择 / Controlled selection', value: 'b' })
]);
const fixtureSwiperItems = Object.freeze([
  Object.freeze({ label: 'Slide 一 / Slide one', description: '静态呈现 / Static presentation', value: 'one' }),
  Object.freeze({ label: 'Slide 二 / Slide two', description: '显式切换 / Explicit change', value: 'two' })
]);
const fixtureScrollItems = Object.freeze([
  Object.freeze({ label: '横向一 / Horizontal one', value: 'one' }),
  Object.freeze({ label: '横向二 / Horizontal two', value: 'two' }),
  Object.freeze({ label: '横向三 / Horizontal three', value: 'three' })
]);
const fixtureLoadmoreStatus = ref('more');
const fixtureSkeletonLoading = ref(true);
const fixtureCollapseValues = ref(['limits']);
const fixtureSwiperValue = ref(0);

/**
 * @lang zh-CN 隐藏 fixture 标签只更新当前页面可见 ref，不代表业务删除或远程状态。
 * @lang en Hides the fixture tag by updating a page-local visible ref only; it represents no business deletion or remote state.
 * @returns {void} <lang><zh-CN>无返回值；只写当前页面 ref。</zh-CN><en>No return value; writes the current page ref only.</en></lang>
 */
function hideFixtureTag() {
  fixtureTagVisible.value = false;
}

/**
 * @lang zh-CN 更新 fixture tabs 的本地选择，不导航、不加载内容或执行请求。
 * @lang en Updates local fixture tab selection without navigation, content loading, or requests.
 * @param {string|number} value <lang><zh-CN>受控 tab value。</zh-CN><en>Controlled tab value.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function updateFixtureTabValue(value) {
  fixtureTabValue.value = value;
}

/**
 * @lang zh-CN 更新 fixture tabbar 的本地选择，不写路由、权限或身份状态。
 * @lang en Updates local fixture tabbar selection without writing route, authorization, or identity state.
 * @param {string|number} value <lang><zh-CN>受控 tabbar value。</zh-CN><en>Controlled tabbar value.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function updateFixtureTabbarValue(value) {
  fixtureTabbarValue.value = value;
}

/**
 * @lang zh-CN 更新 fixture 页码；页面不把它转换为请求或数据分页策略。
 * @lang en Updates fixture page number without converting it into a request or data-pagination strategy.
 * @param {number} value <lang><zh-CN>受控页码。</zh-CN><en>Controlled page number.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function updateFixturePageValue(value) {
  fixturePageValue.value = value;
}

/**
 * @lang zh-CN 记录 P44 列表的本地选择，只显示受控 notice，不导航、不请求或修改目录数据。
 * @lang en Records a P44 list local selection by showing a controlled notice only; it does not navigate, request, or mutate catalog data.
 * @param {{ value: string, index: number }} selection <lang><zh-CN>列表选择意图。</zh-CN><en>List selection intent.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleFixtureListSelect(selection) {
  catalogNoticeMessage.value = `已选择列表项 ${selection.value} / Selected list item ${selection.value}`;
  catalogNoticeVisible.value = true;
}

/**
 * @lang zh-CN 将 loadmore intent 映射为静态 nomore 状态，避免启动任何数据请求。
 * @lang en Maps loadmore intent to a static nomore state without starting any data request.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleFixtureLoadmore() {
  fixtureLoadmoreStatus.value = 'nomore';
}

/**
 * @lang zh-CN 写回页面拥有的折叠值；不执行动画或持久化。
 * @lang en Writes back the page-owned collapse values without animation or persistence.
 * @param {string[]|string} value <lang><zh-CN>折叠 open value。</zh-CN><en>Collapse open value.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function updateFixtureCollapseValues(value) {
  fixtureCollapseValues.value = Array.isArray(value) ? value : (value ? [value] : []);
}

/**
 * @lang zh-CN 写回页面拥有的静态 slide index；不 autoplay、不创建 timer。
 * @lang en Writes back the page-owned static slide index without autoplay or timer creation.
 * @param {number} value <lang><zh-CN>当前 slide index。</zh-CN><en>Current slide index.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function updateFixtureSwiperValue(value) {
  fixtureSwiperValue.value = value;
}

/**
 * @lang zh-CN 处理 slide 选择，只写页面 notice 文字。
 * @lang en Handles slide selection by writing page notice copy only.
 * @param {{ value: string, index: number }} selection <lang><zh-CN>slide 选择意图。</zh-CN><en>Slide selection intent.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleFixtureSwiperSelect(selection) {
  catalogNoticeMessage.value = `已选择 slide ${selection.value} / Selected slide ${selection.value}`;
  catalogNoticeVisible.value = true;
}

/**
 * @lang zh-CN 处理横向列表选择，只写页面 notice 文字，不同步滚动指示器。
 * @lang en Handles horizontal-list selection by writing page notice copy only without synchronizing a scroll indicator.
 * @param {{ value: string, index: number }} selection <lang><zh-CN>横向列表选择意图。</zh-CN><en>Horizontal-list selection intent.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleFixtureScrollSelect(selection) {
  catalogNoticeMessage.value = `已选择横向项 ${selection.value} / Selected horizontal item ${selection.value}`;
  catalogNoticeVisible.value = true;
}

/**
 * @lang zh-CN 打开局部 action sheet；只更新页面 ref，不执行 item 命令。
 * @lang en Opens the local action sheet by updating a page ref only; it executes no item command.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function openFixtureSheet() {
  fixtureSheetVisible.value = true;
}

/**
 * @lang zh-CN 关闭局部 action sheet；不代表业务取消或路由返回。
 * @lang en Closes the local action sheet without representing business cancellation or route return.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function closeFixtureSheet() {
  fixtureSheetVisible.value = false;
}

/**
 * @lang zh-CN 处理 fixture action intent，只切换本地反馈或浮层 ref。
 * @lang en Handles fixture action intent by toggling local feedback or popup refs only.
 * @param {{ value: string }} selection <lang><zh-CN>受控 action 选择。</zh-CN><en>Controlled action selection.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleFixtureAction(selection) {
  closeFixtureSheet();
  if (selection.value === 'toast') {
    fixtureToastVisible.value = true;
  }
  if (selection.value === 'popup') {
    fixturePopupVisible.value = true;
  }
}

/**
 * @lang zh-CN 关闭 fixture toast；组件不使用 timer 自动消失。
 * @lang en Closes fixture toast; the component does not auto-disappear with a timer.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function closeFixtureToast() {
  fixtureToastVisible.value = false;
}

/**
 * @lang zh-CN 关闭 fixture popup；组件不自动写回 visible。
 * @lang en Closes fixture popup; the component does not write visible automatically.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function closeFixturePopup() {
  fixturePopupVisible.value = false;
}

// <lang><zh-CN>由当前受控 query 同步派生的本地目录投影；helper 不访问网络、缓存或异步数据源。</zh-CN><en>Local catalog projection synchronously derived from the current controlled query; the helper accesses no network, cache, or asynchronous data source.</en></lang>
const filteredCatalogRecords = computed(() => filterLocalCatalogRecords(LOCAL_CATALOG_RECORDS, catalogQuery.value));

// <lang><zh-CN>由当前 selection key 同步取得详情源；无匹配保持 `null`，不创建回退记录或数据加载。</zh-CN><en>Synchronously obtains detail source from the current selection key; no match remains `null` and creates no fallback record or data load.</en></lang>
const selectedCatalogRecord = computed(() => findLocalCatalogRecord(LOCAL_CATALOG_RECORDS, selectedCatalogIdentifier.value));

// <lang><zh-CN>详情可见性只由本地详情源是否存在推导，避免以 query、目录长度或业务状态猜测页面视图。</zh-CN><en>Detail visibility derives only from whether a local detail source exists, avoiding view inference from query, directory length, or business state.</en></lang>
const isCatalogDetailVisible = computed(() => selectedCatalogRecord.value !== null);

// <lang><zh-CN>无本地匹配时由页面提供独立可见文字；空 query 不产生消息，使初始目录不被误述为校验失败。</zh-CN><en>Provides independent visible copy from the page when there is no local match; an empty query creates no message so the initial directory is not misdescribed as a validation failure.</en></lang>
const catalogQueryValidationMessage = computed(() => {
  // <lang><zh-CN>空白 query 只表示查看完整固定目录，因此保持零独立消息。</zh-CN><en>An empty query only means viewing the complete fixed directory and therefore retains zero independent message.</en></lang>
  if (catalogQuery.value.trim().length === 0) {
    return '';
  }

  // <lang><zh-CN>无匹配时返回调用方文字；它描述本地投影，不报告网络、权限或服务端校验。</zh-CN><en>Returns caller copy when there is no match; it describes local projection and reports no network, permission, or server validation.</en></lang>
  return filteredCatalogRecords.value.length === 0
    ? '当前本地查询没有匹配项 / The current local query has no matches.'
    : '';
});

// <lang><zh-CN>独立消息 state 只在页面确有文字时为 error；该样式选择不把无结果扩大为组件或后端错误判断。</zh-CN><en>The independent-message state is error only while the page has copy; this style choice does not expand no result into a component or backend error judgment.</en></lang>
const catalogQueryValidationState = computed(() => (catalogQueryValidationMessage.value.length > 0 ? 'error' : 'idle'));

/**
 * @lang zh-CN 更新 fixture 多行文字 ref；它不执行裁剪、校验或持久化。
 * @lang en Updates the fixture multiline-text ref without trimming, validation, or persistence.
 * @param {string} value <lang><zh-CN>来自 UTextarea 的受控候选字符串。</zh-CN><en>Controlled candidate string from UTextarea.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只写当前页面 ref。</zh-CN><en>No return value; writes the current page ref only.</en></lang>
 */
function updateFixtureTextareaValue(value) {
  fixtureTextareaValue.value = value;
}

/**
 * @lang zh-CN 更新 fixture 布尔 ref；它不解释为权限或业务开关。
 * @lang en Updates the fixture boolean ref without interpreting it as authorization or a business switch.
 * @param {boolean} value <lang><zh-CN>来自 USwitch 的受控候选值。</zh-CN><en>Controlled candidate value from USwitch.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只写当前页面 ref。</zh-CN><en>No return value; writes the current page ref only.</en></lang>
 */
function updateFixtureSwitchValue(value) {
  fixtureSwitchValue.value = value;
}

/**
 * @lang zh-CN 更新 fixture 数值 ref；它不增加单位或库存含义。
 * @lang en Updates the fixture numeric ref without adding unit or inventory meaning.
 * @param {number} value <lang><zh-CN>来自 UNumberBox 的受边界保护候选值。</zh-CN><en>Bounded candidate value from UNumberBox.</en></param>
 * @returns {void} <lang><zh-CN>无返回值；只写当前页面 ref。</zh-CN><en>No return value; writes the current page ref only.</en></lang>
 */
function updateFixtureNumberValue(value) {
  fixtureNumberValue.value = value;
}

/**
 * @lang zh-CN 更新 fixture 分级 ref；它不提交评价或计算业务分数。
 * @lang en Updates the fixture rating ref without submitting a review or calculating a business score.
 * @param {number} value <lang><zh-CN>来自 URate 的整数候选值。</zh-CN><en>Integer candidate value from URate.</en></param>
 * @returns {void} <lang><zh-CN>无返回值；只写当前页面 ref。</zh-CN><en>No return value; writes the current page ref only.</en></lang>
 */
function updateFixtureRateValue(value) {
  fixtureRateValue.value = value;
}

/**
 * @lang zh-CN 接收 USearch 的本地 search intent；fixture 只显示既有受控 notice，不发起查询。
 * @lang en Receives USearch local search intent; the fixture only shows an existing controlled notice and starts no query.
 * @param {string} value <lang><zh-CN>当前受控查询文字。</zh-CN><en>Current controlled query text.</en></param>
 * @returns {void} <lang><zh-CN>无返回值；只更新页面内 notice refs。</zh-CN><en>No return value; updates page-local notice refs only.</en></lang>
 */
function handleFixtureSearch(value) {
  catalogNoticeMessage.value = `本地查询意图：${value} / Local search intent: ${value}`;
  catalogNoticeVisible.value = true;
}

/**
 * @lang zh-CN 接收受控 UInput 的下一字符串，并由页面显式写入 query。每次查询变化都会清除本地选择和当前反馈，避免详情或确认文字与新投影混合；不执行请求、规则或持久化。
 * @lang en Receives the next string from controlled UInput and explicitly writes it as page query. Every query change clears local selection and current feedback, preventing detail or confirmation copy from mixing with a new projection; it performs no request, rule, or persistence.
 * @param {string} nextQuery <lang><zh-CN>UInput 未修改地报告的候选字符串。</zh-CN><en>Candidate string reported unchanged by UInput.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只写当前页面 ref。</zh-CN><en>No return value; writes current-page refs only.</en></lang>
 */
function updateCatalogQuery(nextQuery) {
  // <lang><zh-CN>页面拥有 query 写回，使 UInput 不形成自己的筛选状态或缓存。</zh-CN><en>The page owns query writeback so UInput forms no filtering state or cache of its own.</en></lang>
  catalogQuery.value = nextQuery;

  // <lang><zh-CN>新投影不继承旧详情选择，避免将当前 visible 详情误称为新查询的匹配结果。</zh-CN><en>A new projection inherits no old detail selection, avoiding mislabeling the currently visible detail as a match for the new query.</en></lang>
  selectedCatalogIdentifier.value = null;

  // <lang><zh-CN>查询变化同时收起局部反馈和确认面板；页面而非 feedback 组件决定这些状态变化。</zh-CN><en>A query change also hides local feedback and confirmation panel; the page rather than feedback components decides these state changes.</en></lang>
  catalogModalVisible.value = false;
  catalogNoticeVisible.value = false;
  catalogNoticeMessage.value = '';
}

/**
 * @lang zh-CN 选择一个固定本地目录记录用于详情投影。只有精确存在的 identifier 才可写入页面 state；未知标识保持现状，不生成详情、错误、请求或日志。
 * @lang en Selects one fixed local catalog record for detail projection. Only an exactly existing identifier may write page state; an unknown identifier retains current state and generates no detail, error, request, or log.
 * @param {string} identifier <lang><zh-CN>被点击信息行所属的固定本地记录键。</zh-CN><en>Fixed local record key belonging to the clicked information row.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时只更新当前页面 selection/feedback refs。</zh-CN><en>No return value; when the guard passes, updates only current-page selection/feedback refs.</en></lang>
 */
function selectCatalogRecord(identifier) {
  // <lang><zh-CN>先确认 identifier 属于固定 mock，避免页面把任意字符串变成未定义详情状态。</zh-CN><en>First confirms the identifier belongs to fixed mock, preventing the page from turning an arbitrary string into undefined detail state.</en></lang>
  const matchedRecord = findLocalCatalogRecord(LOCAL_CATALOG_RECORDS, identifier);

  // <lang><zh-CN>未知键保持零副作用；fixture 不尝试加载、替换或恢复任何记录。</zh-CN><en>An unknown key retains zero side effect; the fixture attempts to load, replace, or recover no record.</en></lang>
  if (matchedRecord === null) {
    return;
  }

  // <lang><zh-CN>页面写入已确认的本地键，详情 computed 随后负责纯同步投影。</zh-CN><en>The page writes the confirmed local key and the detail computed subsequently performs pure synchronous projection.</en></lang>
  selectedCatalogIdentifier.value = identifier;

  // <lang><zh-CN>新选择清除上一条本地反馈，避免 notice 文案被误认为当前详情的结果。</zh-CN><en>A new selection clears prior local feedback, avoiding a notice message being mistaken for the current detail result.</en></lang>
  catalogNoticeVisible.value = false;
  catalogNoticeMessage.value = '';
}

/**
 * @lang zh-CN 清除当前页面 query、选择、确认面板和局部反馈，以恢复固定 mock 目录。它不重新获取数据、不清除外部缓存，也不改变任何共享或持久化状态。
 * @lang en Clears current-page query, selection, confirmation panel, and local feedback to restore the fixed mock directory. It refetches no data, clears no external cache, and changes no shared or persistent state.
 * @returns {void} <lang><zh-CN>无返回值；只重置当前页面 refs。</zh-CN><en>No return value; resets current-page refs only.</en></lang>
 */
function resetCatalogQuery() {
  // <lang><zh-CN>回到空 query，使同步 helper 按固定集合原始顺序投影全部匿名记录。</zh-CN><en>Returns to empty query so the synchronous helper projects every anonymous record in fixed collection order.</en></lang>
  catalogQuery.value = '';

  // <lang><zh-CN>重置操作不保留旧详情或 feedback，以保持目录状态只反映当前页面的本地集合。</zh-CN><en>The reset retains no old detail or feedback, keeping directory state reflective only of the current page local collection.</en></lang>
  selectedCatalogIdentifier.value = null;
  catalogModalVisible.value = false;
  catalogNoticeVisible.value = false;
  catalogNoticeMessage.value = '';
}

/**
 * @lang zh-CN 从详情投影返回目录投影。它只清除 local selection 和确认面板，不改变 query，因而当前同步筛选结果仍由页面 query 决定。
 * @lang en Returns from detail projection to directory projection. It clears only local selection and confirmation panel and does not change query, so current synchronous filtered results remain decided by page query.
 * @returns {void} <lang><zh-CN>无返回值；只更新当前页面 selection/modal refs。</zh-CN><en>No return value; updates current-page selection/modal refs only.</en></lang>
 */
function returnToCatalog() {
  // <lang><zh-CN>清除选择键以显示目录；这不是 URL、历史记录或平台返回操作。</zh-CN><en>Clears the selection key to display the directory; this is not a URL, history, or platform-back operation.</en></lang>
  selectedCatalogIdentifier.value = null;

  // <lang><zh-CN>详情离开时收起确认面板，避免没有详情上下文的 modal 留在页面上。</zh-CN><en>Hides the confirmation panel when detail is left, avoiding a modal remaining on the page without detail context.</en></lang>
  catalogModalVisible.value = false;
}

/**
 * @lang zh-CN 在存在本地详情选择时由页面显示确认 modal。没有选择时保持零输出，避免把 action button 的直接 handler 调用转换为隐式默认对象。
 * @lang en Shows confirmation modal from the page while a local detail selection exists. With no selection it retains zero output, avoiding turning a direct action-button handler call into an implicit default object.
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时只写当前页面 modal ref。</zh-CN><en>No return value; when the guard passes, writes only the current-page modal ref.</en></lang>
 */
function openCatalogIntentModal() {
  // <lang><zh-CN>详情缺失时没有可确认的本地意图；页面不创建 modal 或推断记录。</zh-CN><en>With detail absent there is no local intent to confirm; the page creates no modal and infers no record.</en></lang>
  if (selectedCatalogRecord.value === null) {
    return;
  }

  // <lang><zh-CN>应用显式写入 visible，保持 UModal 只负责呈现 props 与 emit intent 的既有边界。</zh-CN><en>The application explicitly writes visible, preserving UModal's existing boundary of presenting props and emitting intent only.</en></lang>
  catalogModalVisible.value = true;
}

/**
 * @lang zh-CN 记录当前详情的纯本地 confirm 意图：页面关闭 modal，并展示一条调用方 notice。它不修改 mock 记录、不保存、不请求，也不将 intent 描述为业务完成。
 * @lang en Records pure local confirm intent for current detail: the page closes modal and presents one caller notice. It mutates no mock record, saves nothing, requests nothing, and describes no intent as business completion.
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时只更新当前页面 modal/notice refs。</zh-CN><en>No return value; when the guard passes, updates only current-page modal/notice refs.</en></lang>
 */
function confirmCatalogIntent() {
  // <lang><zh-CN>确认必须仍有详情来源；若 selection 已清除，则不生成误导性的本地 feedback。</zh-CN><en>Confirmation must still have a detail source; if selection has been cleared, no misleading local feedback is generated.</en></lang>
  if (selectedCatalogRecord.value === null) {
    return;
  }

  // <lang><zh-CN>页面而非 UModal 决定关闭时机；关闭只影响当前局部可见状态。</zh-CN><en>The page rather than UModal decides close timing; closing affects only current local visible state.</en></lang>
  catalogModalVisible.value = false;

  // <lang><zh-CN>notice 文字明确把结果限定为本地 intent 记录，并仅引用当前固定匿名展示标题。</zh-CN><en>The notice copy explicitly limits its result to local-intent recording and references only the current fixed anonymous display title.</en></lang>
  catalogNoticeMessage.value = `已记录本地意图 / Local intent recorded: ${selectedCatalogRecord.value.title}`;
  catalogNoticeVisible.value = true;
}

/**
 * @lang zh-CN 响应 modal cancel 意图并由页面隐藏它。它不回滚数据、不恢复焦点、不返回历史，也不产生 notice。
 * @lang en Responds to modal cancel intent and hides it from the page. It rolls back no data, restores no focus, returns no history, and produces no notice.
 * @returns {void} <lang><zh-CN>无返回值；只更新当前页面 modal ref。</zh-CN><en>No return value; updates only the current-page modal ref.</en></lang>
 */
function cancelCatalogIntent() {
  // <lang><zh-CN>页面明确隐藏 modal，保留详情和 query 供调用方继续查看或自行决定后续流程。</zh-CN><en>The page explicitly hides modal while retaining detail and query for the caller to continue viewing or independently decide follow-up flow.</en></lang>
  catalogModalVisible.value = false;
}

/**
 * @lang zh-CN 响应 notice dismiss 意图并清除当前页面 feedback。它不影响详情、目录、query 或其他可能存在的页面反馈。
 * @lang en Responds to notice dismiss intent and clears current-page feedback. It affects no detail, directory, query, or any other possible page feedback.
 * @returns {void} <lang><zh-CN>无返回值；只更新当前页面 notice refs。</zh-CN><en>No return value; updates only current-page notice refs.</en></lang>
 */
function dismissCatalogNotice() {
  // <lang><zh-CN>由页面关闭 visible，并清空调用方文字以避免下次显式显示时保留旧的本地意图说明。</zh-CN><en>The page closes visible and clears caller copy to avoid retaining old local-intent explanation on a future explicit show.</en></lang>
  catalogNoticeVisible.value = false;
  catalogNoticeMessage.value = '';
}

/**
 * @lang zh-CN 写回 radio group 报告的未修改本地 value；不把选择解释为目录查询或业务流程。
 * @lang en Writes back the unchanged local value reported by radio group; it does not interpret selection as catalog query or business flow.
 * @param {string} nextValue <lang><zh-CN>group emit 的下一本地键。</zh-CN><en>Next local key emitted by the group.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只更新页面 ref。</zh-CN><en>No return value; updates page ref only.</en></lang>
 */
function updateFixtureRadioValue(nextValue) {
  // <lang><zh-CN>页面拥有单选写回，group 不会自行修改 modelValue。</zh-CN><en>The page owns radio writeback; the group never modifies modelValue itself.</en></lang>
  fixtureRadioValue.value = nextValue;
}

/**
 * @lang zh-CN 替换 checkbox group 报告的新数组；不排序、持久化或把成员关系解释为权限。
 * @lang en Replaces the new array reported by checkbox group; it neither sorts, persists, nor interprets membership as permission.
 * @param {string[]} nextValues <lang><zh-CN>group emit 的下一本地集合。</zh-CN><en>Next local collection emitted by the group.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只更新页面 ref。</zh-CN><en>No return value; updates page ref only.</en></lang>
 */
function updateFixtureCheckboxValues(nextValues) {
  // <lang><zh-CN>替换 ref 值保留调用方数组所有权。</zh-CN><en>Replacing ref value retains caller ownership of the array.</en></lang>
  fixtureCheckboxValues.value = nextValues;
}
</script>

<style>
/**
 * @lang zh-CN fixture 页面只使用局部布局、边界和文字样式，避免把业务 CSS、图标、字体或未经审计资源带入 compiler/runtime 组合证据。
 * @lang en The fixture page uses only local layout, boundary, and text styles, preventing business CSS, icons, fonts, or unaudited resources from entering compiler/runtime composition evidence.
 */

/* <lang><zh-CN>页面容器提供 compile-only 示例所需内边距，不覆盖组件 token 化结构或添加全局 reset。</zh-CN><en>The page container provides padding required by the compile-only example without overriding component tokenized structure or adding a global reset.</en></lang> */
.fixture-page {
  padding: 20px;
}

/* <lang><zh-CN>目录组合以局部最大宽度避免超长 mock 文字紧贴页面边缘；该样式不代表生产布局或跨端断点承诺。</zh-CN><en>The catalog composition uses a local maximum width so long mock copy does not touch page edges; this style represents no production-layout or cross-platform breakpoint promise.</en></lang> */
.fixture-catalog {
  max-width: 640px;
}

/* <lang><zh-CN>详情区域以 token 边界与内边距区别于目录行，不通过图片、图标或硬编码品牌色表达状态。</zh-CN><en>The detail area uses token border and padding to distinguish itself from directory rows and expresses no state through images, icons, or hard-coded brand colors.</en></lang> */
.fixture-catalog__detail {
  padding: var(--u-sys-space-md);
  border: 1px solid var(--u-sys-color-border);
  border-radius: var(--u-sys-radius-md);
}

/* <lang><zh-CN>摘要文字使用系统次要文字 token，明确其仅是 fixture 观察辅助而非业务统计组件。</zh-CN><en>Summary text uses the system secondary-text token, making clear that it is fixture observation aid only rather than a business-statistics component.</en></lang> */
.fixture-page__summary {
  color: var(--u-sys-color-text-secondary);
}
</style>
