<!--
@lang zh-CN 在仅编译期的 `mp-weixin` fixture 中组合现有 HIA-uView 组件，演示固定匿名 mock 目录及十四组件受控选择/日期/数值/上传组合。页面不执行网络、路由、身份、持久化、异步数据、分页、计时器、文件 chooser 或平台系统操作。
@lang en Composes existing HIA-uView components in the compile-only `mp-weixin` fixture to demonstrate a fixed anonymous mock directory and a fourteen-component controlled choice/date/numeric/upload composition. The page performs no network, routing, identity, persistence, asynchronous data, paging, timer, file chooser, or platform-system operation.
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

    <!--
    @lang zh-CN 本段在统一 marker 内真实组合十个 overlay、feedback 与 navigation 组件；页面局部状态显式拥有每个受控值、有限集合与 intent。
    @lang en This section actually composes ten overlay, feedback, and navigation components under one marker; page-local state explicitly owns every controlled value, finite collection, and intent.
    <lang><zh-CN>Modal/toast service 必须经过本页面显式 scope 与两个显式 host；入口不查找 page stack、不路由、不请求、不读写 storage 或平台状态。</zh-CN><en>Modal/toast services must pass through this page's explicit scope and two explicit hosts; the entry discovers no page stack, routes nowhere, requests nothing, and reads or writes no storage or platform state.</en></lang>
    -->
    <view class="fixture-overlay-feedback-navigation" data-smoke="overlay-feedback-navigation">
      <u-navbar title="本地界面 / Local surface" :is-back="true" back-text="返回 / Back" right-text="观察 / Observe" @left-click="recordFixtureFeedbackIntent('navbar-left')" @right-click="recordFixtureFeedbackIntent('navbar-right')" />
      <u-notice-bar :list="fixtureNavigationNoticeItems" :current="1" close-text="关闭 / Dismiss" @click="recordFixtureNoticeClick" @close="recordFixtureFeedbackIntent('notice-close')" />
      <u-tabs :list="fixtureNavigationTabItems" :current="fixtureNavigationTabIndex" @update:model-value="updateFixtureNavigationTab" />
      <u-tabbar v-model="fixtureNavigationTabbarValue" :list="fixtureNavigationTabbarItems" />
      <!-- <lang><zh-CN>四个按钮只改变本地布尔值或调用绑定显式 scope 的 controller；不执行任何领域操作。</zh-CN><en>The four buttons only change local Booleans or call controllers bound to the explicit scope; they perform no domain action.</en></lang> -->
      <u-stack direction="horizontal" gap="sm" wrap>
        <u-button label="显示弹层 / Show popup" @click="showFixtureOverlayPopup" />
        <u-button variant="secondary" label="显示操作表 / Show actions" @click="showFixtureOverlayActionSheet" />
        <u-button variant="secondary" label="局部提示 / Scoped toast" @click="showFixtureScopedToast" />
        <u-button variant="secondary" label="局部对话框 / Scoped modal" @click="showFixtureScopedModal" />
      </u-stack>
      <u-transition :show="fixtureOverlayTransitionVisible" mode="fade" :duration="120"><text>有限过渡 / Finite transition</text></u-transition>
      <u-mask :show="fixtureOverlayMaskVisible" :clickable="true" @click="hideFixtureOverlayMask"><text>本地遮罩 slot / Local mask slot</text></u-mask>
      <u-popup v-model="fixtureOverlayPopupVisible" title="本地弹层 / Local popup" close-text="关闭 / Close" :mask-closable="true" @close="recordFixturePopupClose"><text>调用方弹层 slot / Caller popup slot</text></u-popup>
      <u-action-sheet v-model="fixtureOverlayActionSheetVisible" title="本地操作 / Local actions" :items="fixtureOverlayActionItems" cancel-text="取消 / Cancel" :mask-closable="true" @select="recordFixtureFeedbackIntent('action-select')" @close="recordFixtureActionSheetClose"><text>调用方操作 slot / Caller action slot</text></u-action-sheet>
      <u-modal :service-scope="fixtureFeedbackScope" :service-host="true" @confirm="recordFixtureFeedbackIntent('modal-confirm')" @cancel="recordFixtureFeedbackIntent('modal-cancel')" />
      <u-toast :service-scope="fixtureFeedbackScope" :service-host="true" @close="recordFixtureFeedbackIntent('toast-close')" />
      <text data-smoke="feedback-service-result">{{ fixtureFeedbackIntent }}</text>
    </view>

    <!-- <lang><zh-CN>P54 组合以调用方声明的文字、尺寸和可见性验证新导航、间距、反馈与同树 overlay 表面能够被小程序编译器解析；它不引入平台读取、路由、滚动、网络或全局 service。</zh-CN><en>The P54 composition uses caller-declared copy, dimensions, and visibility to verify that the Mini Program compiler resolves the new navigation, spacing, feedback, and same-tree overlay surfaces; it introduces no platform read, router, scrolling, network, or global service.</en></lang> -->
    <u-config-provider density="compact" locale="en">
      <u-status-bar :height="18" />
      <u-navbar title="Fixture navigation / Fixture 导航" left-text="Back / 返回" right-text="Save / 保存"><text>Caller center / 调用方中央</text></u-navbar>
      <u-cell-item title="Local entry / 本地条目" :label="0" :value="0" :required="true" :arrow="true" :clickable="true" />
      <u-notice-bar :show="true" text="Local feedback only / 仅本地反馈" close-text="Dismiss / 关闭" />
      <u-loading :show="true" label="Local state / 本地状态" />
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

    <!-- <lang><zh-CN>裁剪选择和验证码状态均为页面本地声明，以验证小程序编译器可解析受控意图面；它们不选择文件、不读图片字节、不裁剪像素、不发送验证码或计时。</zh-CN><en>Crop selection and verification state are page-local declarations that verify the Mini Program compiler resolves controlled intent surfaces; they choose no file, read no image bytes, crop no pixel, send no code, and run no timer.</en></lang> -->
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

    <!-- <lang><zh-CN>本段编译 caller-owned 索引、active 图片、有限区段/静态 panel 与确定性列投影；它不读取 scroll/viewport、不预取、不启动原生 swiper 或按高度重排。</zh-CN><en>This section compiles caller-owned index, active image, finite segment/static panel, and deterministic-column projection; it reads no scroll/viewport, prefetches nothing, starts no native swiper, and performs no height-based reflow.</en></lang> -->
    <u-index-anchor label="本地索引 / Local index" value="local" :active="true" />
    <u-index-list :groups="fixtureIndexGroups" active-value="local" aria-label="本地索引组 / Local index groups" />
    <u-lazy-load :active="false" src="" alt="本地延迟图片 / Local deferred image" placeholder-text="调用方占位 / Caller placeholder" />
    <u-subsection :items="fixtureSegmentItems" model-value="first" aria-label="本地区段 / Local segments" />
    <u-tabs-swiper :items="fixtureSegmentItems" model-value="first" aria-label="本地静态面板 / Local static panel" previous-text="上一项 / Previous" next-text="下一项 / Next" />
    <u-waterfall :items="fixtureWaterfallItems" :column-count="2" aria-label="本地确定性列 / Local deterministic columns" />

    <!-- <lang><zh-CN>本段编译 view-based table 与 locale 子树标记；行、header、cell 和文字均由页面提供，不查询、排序、测量或加载翻译。</zh-CN><en>This section compiles a view-based table and locale-subtree marker; the page provides rows, headers, cells, and copy, with no query, sort, measurement, or translation loading.</en></lang> -->
    <u-table aria-label="本地表格 / Local table">
      <u-tr><u-th label="名称 / Name" /><u-th label="状态 / Status" /></u-tr>
      <u-tr value="local-row" :clickable="true"><u-td text="本地行 / Local row" /><u-td text="静态 / Static" /></u-tr>
    </u-table>

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
          @click="recordFixturePresentationIntent('input-click')"
          @confirm="recordFixturePresentationIntent('input-confirm')"
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
            @change="recordFixturePresentationIntent('textarea-change')"
            @click="recordFixturePresentationIntent('textarea-click')"
          />
        </u-form-item>
        <u-form-item label="受控查询 / Controlled search">
          <u-search
            :model-value="catalogQuery"
            show-action
            action-text="查询 / Search"
            @update:model-value="updateCatalogQuery"
            @change="recordFixturePresentationIntent('search-change')"
            @click="recordFixturePresentationIntent('search-click')"
            @search="handleFixtureSearch"
          />
        </u-form-item>
      </u-form>

      <!--
      @lang zh-CN 本段使用独立中性模型真实组合 P66 六个表单/输入组件，并通过组件 ref 提供 validate/clear/reset 的本地可见观察；它不复用目录 query 或任何业务字段。
      @lang en This section uses an independent neutral model to compose all six P66 form/input components and provides local visible validate/clear/reset observation through a component ref; it reuses neither the catalog query nor any business field.
      <lang><zh-CN>UField 采用无 default slot 的内建 UInput 模式，另一个 UFormItem 直接组合 UInput，以同时证明两条消费路径。</zh-CN><en>UField uses its built-in UInput mode without a default slot, while another UFormItem composes UInput directly, proving both consumption paths.</en></lang>
      -->
      <view class="fixture-p66-form" data-smoke="p66-form-composition">
        <text class="fixture-p66-form__title">本地表单组合 / Local form composition</text>
        <u-form ref="fixtureP66FormReference" :model="fixtureP66FormModel" :rules="fixtureP66FormRules" label-position="top">
          <u-form-item prop="fieldText" help-text="UField 使用内建 UInput / UField uses its built-in UInput">
            <u-field
              :model-value="fixtureP66FormModel.fieldText"
              label="字段文字 / Field text"
              :required="true"
              placeholder="输入字段文字 / Enter field text"
              @update:model-value="updateFixtureP66FieldText"
            />
          </u-form-item>
          <u-form-item prop="inputText" label="直接输入 / Direct input">
            <u-input
              :model-value="fixtureP66FormModel.inputText"
              placeholder="输入直接文字 / Enter direct text"
              @update:model-value="updateFixtureP66InputText"
            />
          </u-form-item>
          <u-form-item prop="longText" label="多行文字 / Long text">
            <u-textarea
              :model-value="fixtureP66FormModel.longText"
              placeholder="输入多行文字 / Enter long text"
              :show-count="true"
              @update:model-value="updateFixtureP66LongText"
            />
          </u-form-item>
          <u-form-item prop="searchText" label="查询文字 / Search text">
            <u-search
              :model-value="fixtureP66FormModel.searchText"
              placeholder="输入本地查询 / Enter local query"
              :show-action="true"
              action-text="观察 / Observe"
              @update:model-value="updateFixtureP66SearchText"
              @search="recordFixtureP66SearchIntent"
            />
          </u-form-item>
        </u-form>
        <!-- <lang><zh-CN>三个操作只调用当前 UForm ref，并把结果写入下方 data-smoke marker；没有 submit、请求、持久化或远端 validator。</zh-CN><en>The three actions call only the current UForm ref and write results into the data-smoke marker below; there is no submit, request, persistence, or remote validator.</en></lang> -->
        <u-stack class="fixture-p66-form__actions" direction="horizontal" gap="sm" wrap>
          <u-button label="本地校验 / Validate locally" @click="validateFixtureP66Form" />
          <u-button variant="secondary" label="清除校验 / Clear validation" @click="clearFixtureP66Validation" />
          <u-button variant="secondary" label="重置字段 / Reset fields" @click="resetFixtureP66Fields" />
        </u-stack>
        <text class="fixture-p66-form__result" data-smoke="p66-form-result">{{ fixtureP66FormResult }}</text>
      </view>

      <!-- @lang zh-CN 展示批次只组合本地文字符号、调用方图片来源、迁移文字、initials、有限标签、徽标、分隔、数字和静态进度；不产生资产、请求、导航或任务服务。 @lang en The display batch composes local text symbol, caller image source, migration copy, initials, finite tag, badge, divider, number, and static progress only; it creates no asset, request, routing, or task service. <lang><zh-CN>所有值与 click 观察均由页面 refs 拥有。</zh-CN><en>All values and click observations are owned by page refs.</en></lang> -->
      <u-stack class="fixture-display" gap="sm">
        <u-icon name="•" :label="0" @click="recordFixturePresentationIntent('icon')" />
        <u-image :src="fixtureImageSource" alt="本地图片占位 / Local image placeholder" size="small" @click="recordFixturePresentationIntent('image')" />
        <u-text :show="true" :text="42" @click="recordFixturePresentationIntent('text')" />
        <u-text :text="fixturePresentationIntent" type="secondary" />
        <u-button text="迁移文字按钮 / Migration text button" @click="recordFixturePresentationIntent('button')" />
        <u-avatar text="HI" alt="initials 占位 / initials placeholder" size="small" />
        <u-tag :visible="fixtureTagVisible" :show="true" :text="7" :disabled="false" tone="primary" closable @close="hideFixtureTag" />
        <u-alert-tips :show="true" title="本地提示 / Local alert" description="调用方控制可见性 / Caller-controlled visibility" />
        <u-badge :value="fixtureBadgeValue"><text>徽标内容 / Badge content</text></u-badge>
        <u-divider text="局部分隔 / Local divider" />
        <u-count-to :model-value="fixtureCountValue" prefix="#" />
        <u-line-progress :percent="fixtureProgressValue" />
      </u-stack>

      <!-- @lang zh-CN 本段只使用页面声明的 tabs、tabbar、steps、pagination 与受控 overlay/feedback；也编译受限迁移 list/current/modelValue/pageSize/total 入口，不产生 router、timer、service 或请求。 @lang en This section uses only page-declared tabs, tabbar, steps, pagination, and controlled overlay/feedback; it also compiles constrained migration list/current/modelValue/pageSize/total entries and creates no router, timer, service, or request. <lang><zh-CN>所有可见状态和 items 由页面 refs 拥有。</zh-CN><en>All visible state and items are owned by page refs.</en></lang> -->
      <u-stack class="fixture-navigation" gap="sm">
        <u-tabs :model-value="fixtureTabValue" :items="fixtureTabItems" @update:model-value="updateFixtureTabValue" />
        <u-tabs :items="[]" :list="fixtureMigrationTabItems" :current="1" />
        <u-tabbar :show="true" :model-value="fixtureTabbarValue" :items="fixtureTabbarItems" @update:model-value="updateFixtureTabbarValue" />
        <u-steps :steps="fixtureStepItems" :current="fixtureStepCurrent" />
        <u-pagination :current="fixturePageValue" :page-count="3" @update:current="updateFixturePageValue" />
        <u-pagination :model-value="2" :page-size="10" :total="21" />
        <u-button label="打开局部 sheet / Open local sheet" @click="openFixtureSheet" />
        <u-toast :visible="fixtureToastVisible" message="局部反馈 / Local feedback" :loading="true" close-text="关闭 / Close" @close="closeFixtureToast" />
        <u-loading-page :visible="fixtureLoadingVisible" text="页面 loading / Page loading" />
        <u-action-sheet :visible="fixtureSheetVisible" :items="fixtureActionItems" title="局部操作 / Local actions" cancel-text="取消 / Cancel" @select="handleFixtureAction" @close="closeFixtureSheet" />
        <u-popup :model-value="fixturePopupVisible" title="局部浮层 / Local popup" close-text="关闭 / Close" @update:model-value="updateFixturePopupVisible" @close="closeFixturePopup">
          <text>调用方 slot 内容 / Caller-owned slot content</text>
        </u-popup>
        <u-swipe-action :show="true" :options="fixtureSwipeOptions" @click="recordFixturePresentationIntent('swipe-click')">
          <text>调用方局部内容 / Caller local content</text>
        </u-swipe-action>
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

      <!--
      @lang zh-CN 本段在统一 marker 下复用既有选择/数值实例并补齐十四个受控组件；全部 model、有限 options 与 adapter 均由当前页面拥有。
      @lang en This section reuses existing choice and numeric instances and completes all fourteen controlled components under one unified marker; the current page owns every model, finite option collection, and adapter.
      <lang><zh-CN>dropdown 使用显式 name/options 模式；upload adapter 只创建或移除本地记录，不调用 chooser、网络、文件读取、凭据、timer 或持久化。</zh-CN><en>Dropdown uses explicit name/options mode; the upload adapter only creates or removes local records and invokes no chooser, network, file read, credential, timer, or persistence.</en></lang>
      -->
      <view class="fixture-p67-controls" data-smoke="p67-controlled-composition">
        <u-radio-group :model-value="fixtureRadioValue" @update:model-value="updateFixtureRadioValue">
          <u-radio value="local-a" label="本地单选 A / Local radio A" />
          <u-radio :value="2" label="本地单选 Two / Local radio Two" />
        </u-radio-group>
        <u-checkbox-group :model-value="fixtureCheckboxValues" :max="2" @update:model-value="updateFixtureCheckboxValues">
          <u-checkbox value="local-one" label="本地多选 One / Local checkbox One" />
          <u-checkbox :value="2" label="本地多选 Two / Local checkbox Two" />
        </u-checkbox-group>
        <!-- @lang zh-CN 独立选择示例继续验证标准 modelValue、数值 value 与 default slot 的静态编译组合；页面仍拥有所有写回。 @lang en The independent choice example continues to verify static compiler composition for standard modelValue, numeric value, and a default slot; the page still owns every writeback. <lang><zh-CN>它不连接表单、数据源、导航或业务规则。</zh-CN><en>It connects no form, data source, navigation, or business rule.</en></lang> -->
        <u-checkbox :model-value="fixtureIndependentCheckboxValue" :value="7" @update:model-value="updateFixtureIndependentCheckboxValue">
          <text>独立多选 / Independent checkbox</text>
        </u-checkbox>
        <u-radio :value="8" label="独立单选 / Independent radio" @change="recordFixtureIndependentRadioValue" />
        <u-switch :model-value="fixtureSwitchValue" :loading="fixtureSwitchBusy" label="启用样例 / Enable sample" @update:model-value="updateFixtureSwitchValue" />
        <u-picker
          :model-value="fixturePickerValue"
          :columns="fixturePickerColumns"
          title="本地选择器 / Local picker"
          @update:model-value="updateFixturePickerValue"
          @confirm="recordFixtureP67Intent('picker-confirm')"
          @cancel="recordFixtureP67Intent('picker-cancel')"
        />
        <u-calendar
          :model-value="fixtureCalendarValue"
          :view-date="fixtureCalendarViewDate"
          today="2026-08-11"
          @update:model-value="updateFixtureCalendarValue"
          @update:view-date="updateFixtureCalendarViewDate"
          @change="recordFixtureP67Intent('calendar-change')"
        />
        <u-select
          :model-value="fixtureSelectValue"
          :options="fixtureSelectOptions"
          :confirm-mode="true"
          placeholder="本地选择 / Select locally"
          @update:model-value="updateFixtureSelectValue"
          @confirm="recordFixtureP67Intent('select-confirm')"
          @cancel="recordFixtureP67Intent('select-cancel')"
        />
        <u-dropdown :model-value="fixtureDropdownOpenName" @update:model-value="updateFixtureDropdownOpenName" @close="recordFixtureP67Intent('dropdown-close')">
          <u-dropdown-item
            name="scope"
            :model-value="fixtureDropdownValue"
            label="范围 / Scope"
            :options="fixtureDropdownOptions"
            @update:model-value="updateFixtureDropdownValue"
          />
        </u-dropdown>
        <u-number-box :model-value="fixtureNumberValue" :min="0" :max="9" :step="0.5" @update:model-value="updateFixtureNumberValue" />
        <u-rate :model-value="fixtureRateValue" :count="5" @update:model-value="updateFixtureRateValue" />
        <u-slider :model-value="fixtureSliderValue" :min="0" :max="10" :step="2" :show-value="true" @update:model-value="updateFixtureSliderValue" />
        <u-upload
          :visible="true"
          :model-value="fixtureUploadFiles"
          :adapter="fixtureUploadAdapter"
          label="本地文件 / Local files"
          select-text="添加本地记录 / Add local record"
          preview-text="观察 / Observe"
          remove-text="删除 / Remove"
          retry-text="重试 / Retry"
          :max="3"
          @update:model-value="updateFixtureUploadFiles"
          @adapter-state="recordFixtureUploadAdapterState"
        />
        <text data-smoke="p67-adapter-state">{{ fixtureUploadAdapterState }}</text>
        <text data-smoke="p67-intent">{{ fixtureP67Intent }}</text>
      </view>

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
          :show="true"
          src=""
          title="没有本地匹配项 / No local matches"
          description="请重置当前页面查询以恢复固定 mock 目录。"
          text="迁移说明不会覆盖 description / Migration copy does not override description."
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
        :model-value="catalogModalVisible"
        title="确认本地意图 / Confirm local intent"
        confirm-text="确认 / Confirm"
        cancel-text="取消 / Cancel"
        @update:model-value="updateCatalogModalVisible"
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
import { computed, onBeforeUnmount, reactive, ref } from 'vue';
// <lang><zh-CN>页面的 u-* 标签由输入根 pages.json 的受限 easycom 表静态解析到同仓 SFC；这避免经公共 barrel 转发导致小程序编译器遗漏组件 JS/WXML/WXSS。</zh-CN><en>The page's u-* tags are statically resolved to in-repository SFCs by the bounded easycom table in the input-root pages.json; this avoids Mini Program compiler omissions of component JS/WXML/WXSS caused by public-barrel forwarding.</en></lang>
// <lang><zh-CN>导入固定匿名 mock 集合与纯同步 helper；它们位于 fixture 内而非 UI runtime 或 Biz package。</zh-CN><en>Imports the fixed anonymous mock collection and pure synchronous helpers; they reside inside the fixture rather than UI runtime or a Biz package.</en></lang>
import { LOCAL_CATALOG_RECORDS, filterLocalCatalogRecords, findLocalCatalogRecord } from './local-catalog.mjs';
// <lang><zh-CN>三个 feedback service 入口来自同一 UI package 的纯服务子模块；导入不创建默认 scope、host 或页面副作用。</zh-CN><en>The three feedback-service entries come from the same UI package's pure service submodule; importing creates no default scope, host, or page side effect.</en></lang>
import { createUFeedbackScope, useModal, useToast } from '../../../../../src/services.mjs';

// <lang><zh-CN>声明稳定页面组件名，便于 compiler/runtime 诊断定位当前 fixture，而不形成可公开消费的应用 API。</zh-CN><en>Declares a stable page component name so compiler/runtime diagnostics can locate this fixture without forming a publicly consumable application API.</en></lang>
defineOptions({
  name: 'fixture-local-catalog-page'
});

// <lang><zh-CN>页面显式拥有唯一 feedback scope，并把 modal/toast controller 限制在同一局部 host 边界。</zh-CN><en>The page explicitly owns its sole feedback scope and confines modal/toast controllers to the same local host boundary.</en></lang>
const fixtureFeedbackScope = createUFeedbackScope();
const fixtureModalController = useModal(fixtureFeedbackScope);
const fixtureToastController = useToast(fixtureFeedbackScope);
// <lang><zh-CN>可见 marker 只保存有限 intent 或稳定 request id，不保存 event、options、页面或平台对象。</zh-CN><en>The visible marker stores only a finite intent or stable request ID and retains no event, options, page, or platform object.</en></lang>
const fixtureFeedbackIntent = ref('idle');
// <lang><zh-CN>两个 overlay 的受控可见性归当前页面所有，初始隐藏避免遮挡既有目录组合。</zh-CN><en>The current page owns controlled visibility for both overlays; they start hidden to avoid obscuring the existing catalog composition.</en></lang>
const fixtureOverlayPopupVisible = ref(false);
const fixtureOverlayActionSheetVisible = ref(false);
// <lang><zh-CN>mask 初始隐藏而 transition 初始可见，以静态编译两个 show alias 方向。</zh-CN><en>The mask starts hidden while the transition starts visible, statically compiling both directions of the show alias.</en></lang>
const fixtureOverlayMaskVisible = ref(false);
const fixtureOverlayTransitionVisible = ref(true);
// <lang><zh-CN>tabs current 与 tabbar model 都是页面局部导航投影，不表示 route 或原生 tab 状态。</zh-CN><en>Tabs current and the tabbar model are page-local navigation projections and represent neither a route nor native-tab state.</en></lang>
const fixtureNavigationTabIndex = ref(0);
const fixtureNavigationTabbarValue = ref('first');
// <lang><zh-CN>notice、tabs 与 tabbar 集合都由页面冻结，条目只携带双语文字及透明值。</zh-CN><en>The page freezes the notice, tabs, and tabbar collections; entries carry only bilingual copy and transparent values.</en></lang>
const fixtureNavigationNoticeItems = Object.freeze(['第一条本地提示 / First local notice', '第二条本地提示 / Second local notice']);
const fixtureNavigationTabItems = Object.freeze([
  Object.freeze({ label: '第一项 / First', value: 'first' }),
  Object.freeze({ label: '第二项 / Second', value: 'second' })
]);
const fixtureNavigationTabbarItems = Object.freeze([
  Object.freeze({ label: '第一项 / First', value: 'first' }),
  Object.freeze({ label: '第二项 / Second', value: 'second' })
]);
// <lang><zh-CN>action sheet 的有限 items 不携带 handler、URL、权限或业务命令。</zh-CN><en>The action sheet's finite items carry no handler, URL, authorization, or business command.</en></lang>
const fixtureOverlayActionItems = Object.freeze([
  Object.freeze({ label: '观察 / Observe', value: 'observe' }),
  Object.freeze({ label: '已禁用 / Disabled', value: 'disabled', disabled: true })
]);

/**
 * @lang zh-CN 把有限 feedback/navigation intent 写入页面 marker，不把点击解释为导航或业务完成。
 * @lang en Writes a finite feedback/navigation intent into the page marker without interpreting a click as navigation or business completion.
 * @param {string} intent <lang><zh-CN>fixture 源码声明的有限操作名。</zh-CN><en>Finite operation name declared in fixture source.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只写局部 ref。</zh-CN><en>No return value; writes only the local ref.</en></lang>
 */
function recordFixtureFeedbackIntent(intent) {
  fixtureFeedbackIntent.value = intent;
}

/**
 * @lang zh-CN 记录 notice 当前投影索引并丢弃 raw event；页面不轮播或导航。
 * @lang en Records the current notice-projection index and discards the raw event; the page neither rotates nor navigates.
 * @param {unknown} _event <lang><zh-CN>组件保留首参的原始事件，本 fixture 不保存。</zh-CN><en>Original event retained as the component's first argument and not stored by this fixture.</en></lang>
 * @param {number} index <lang><zh-CN>当前有限通知索引。</zh-CN><en>Current finite notice index.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只写稳定 marker。</zh-CN><en>No return value; writes a stable marker only.</en></lang>
 */
function recordFixtureNoticeClick(_event, index) {
  fixtureFeedbackIntent.value = 'notice-' + index;
}

/**
 * @lang zh-CN 将 tabs 报告的透明值严格映射为受控 current 索引。
 * @lang en Strictly maps the transparent value reported by tabs into the controlled current index.
 * @param {unknown} value <lang><zh-CN>组件报告的候选值。</zh-CN><en>Candidate value reported by the component.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；未知值保持当前状态。</zh-CN><en>No return value; an unknown value retains current state.</en></lang>
 */
function updateFixtureNavigationTab(value) {
  // <lang><zh-CN>只搜索当前冻结集合，绝不查询 route、page stack 或外部 registry。</zh-CN><en>Searches only the current frozen collection and never queries a route, page stack, or external registry.</en></lang>
  const nextIndex = fixtureNavigationTabItems.findIndex((item) => item.value === value);
  if (nextIndex < 0) return;
  fixtureNavigationTabIndex.value = nextIndex;
  fixtureFeedbackIntent.value = 'tab-' + nextIndex;
}

/**
 * @lang zh-CN 显示本地受控 popup 并记录有限 intent。
 * @lang en Shows the local controlled popup and records a finite intent.
 * @returns {void} <lang><zh-CN>无返回值；只更新页面 refs。</zh-CN><en>No return value; updates page refs only.</en></lang>
 */
function showFixtureOverlayPopup() {
  fixtureOverlayPopupVisible.value = true;
  fixtureFeedbackIntent.value = 'popup-open';
}

/**
 * @lang zh-CN 显示本地受控 action sheet 并记录有限 intent。
 * @lang en Shows the local controlled action sheet and records a finite intent.
 * @returns {void} <lang><zh-CN>无返回值；只更新页面 refs。</zh-CN><en>No return value; updates page refs only.</en></lang>
 */
function showFixtureOverlayActionSheet() {
  fixtureOverlayActionSheetVisible.value = true;
  fixtureFeedbackIntent.value = 'action-sheet-open';
}

/**
 * @lang zh-CN 记录 popup 有限关闭原因，不保存 raw event。
 * @lang en Records the popup's finite close reason without storing the raw event.
 * @param {unknown} _event <lang><zh-CN>组件转发的原始本地事件。</zh-CN><en>Original local event forwarded by the component.</en></lang>
 * @param {string} reason <lang><zh-CN>有限关闭原因。</zh-CN><en>Finite close reason.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只写 marker。</zh-CN><en>No return value; writes the marker only.</en></lang>
 */
function recordFixturePopupClose(_event, reason) {
  fixtureFeedbackIntent.value = 'popup-' + reason;
}

/**
 * @lang zh-CN 记录 action sheet 有限关闭原因，不保存 raw event。
 * @lang en Records the action sheet's finite close reason without storing the raw event.
 * @param {unknown} _event <lang><zh-CN>组件转发的原始本地事件。</zh-CN><en>Original local event forwarded by the component.</en></lang>
 * @param {string} reason <lang><zh-CN>有限关闭原因。</zh-CN><en>Finite close reason.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只写 marker。</zh-CN><en>No return value; writes the marker only.</en></lang>
 */
function recordFixtureActionSheetClose(_event, reason) {
  fixtureFeedbackIntent.value = 'action-sheet-' + reason;
}

/**
 * @lang zh-CN 隐藏局部 mask；该 intent 不关闭其他 overlay。
 * @lang en Hides the local mask; this intent closes no other overlay.
 * @returns {void} <lang><zh-CN>无返回值；只更新页面 refs。</zh-CN><en>No return value; updates page refs only.</en></lang>
 */
function hideFixtureOverlayMask() {
  fixtureOverlayMaskVisible.value = false;
  fixtureFeedbackIntent.value = 'mask-click';
}

/**
 * @lang zh-CN 通过显式 scope/host 请求有限 toast，并把同步接收结果投影到本地 marker。
 * @lang en Requests a finite toast through the explicit scope/host and projects its synchronous acceptance result into the local marker.
 * @returns {void} <lang><zh-CN>无返回值；只改变局部呈现和 marker。</zh-CN><en>No return value; changes only local presentation and the marker.</en></lang>
 */
function showFixtureScopedToast() {
  // <lang><zh-CN>固定 options 仅包含双语文字、有限 tone 和 duration，不含 callback、URL 或 payload。</zh-CN><en>Fixed options contain only bilingual copy, a finite tone, and duration, with no callback, URL, or payload.</en></lang>
  const result = fixtureToastController.success({ message: '本地局部提示 / Local scoped toast', duration: 1200, closeText: '关闭 / Close' });
  fixtureFeedbackIntent.value = result.accepted ? 'toast-' + result.requestId : 'toast-' + result.reason;
}

/**
 * @lang zh-CN 通过显式 scope/host 请求有限双 control modal，并投影同步接收结果。
 * @lang en Requests a finite dual-control modal through the explicit scope/host and projects its synchronous acceptance result.
 * @returns {void} <lang><zh-CN>无返回值；只改变局部呈现和 marker。</zh-CN><en>No return value; changes only local presentation and the marker.</en></lang>
 */
function showFixtureScopedModal() {
  // <lang><zh-CN>固定 options 只有可见双语文字；组件事件仍决定确认或取消后的页面 marker。</zh-CN><en>Fixed options contain visible bilingual copy only; component events still decide the page marker after confirm or cancel.</en></lang>
  const result = fixtureModalController.confirm({
    title: '本地局部对话框 / Local scoped modal',
    content: '不执行远程动作 / No remote action',
    confirmText: '观察 / Observe',
    cancelText: '取消 / Cancel'
  });
  fixtureFeedbackIntent.value = result.accepted ? 'modal-' + result.requestId : 'modal-' + result.reason;
}

// <lang><zh-CN>页面卸载时幂等释放显式 scope；释放不读取平台 page stack 或全局状态。</zh-CN><en>Page unmount idempotently disposes the explicit scope; disposal reads no platform page stack or global state.</en></lang>
onBeforeUnmount(() => {
  fixtureFeedbackScope.dispose();
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
// <lang><zh-CN>独立 checkbox 的页面自有布尔值只用于 compiler fixture；它不表示业务开关或持久化状态。</zh-CN><en>The page-owned independent-checkbox boolean is only for the compiler fixture; it represents neither a business toggle nor persisted state.</en></lang>
const fixtureIndependentCheckboxValue = ref(false);
// <lang><zh-CN>独立 radio 的最后本地数值只用于观察透明 event payload；它不驱动路由、查询或领域选择。</zh-CN><en>The independent radio's last local number only observes a transparent event payload; it drives neither routing, query, nor domain selection.</en></lang>
const fixtureIndependentRadioValue = ref(0);

// <lang><zh-CN>picker 的页面值保留字符串与数字透明键，不与 city-select 既有列共享状态。</zh-CN><en>The page-owned picker value preserves transparent string and number keys and shares no state with the existing city-select columns.</en></lang>
const fixturePickerValue = ref(['alpha', 1]);
// <lang><zh-CN>固定 picker 列只用于编译及本地交互观察，不表示城市、产品或远端 option。</zh-CN><en>Fixed picker columns serve only compilation and local interaction observation and represent no city, product, or remote option.</en></lang>
const fixturePickerColumns = Object.freeze([
  Object.freeze([Object.freeze({ label: '甲 / Alpha', value: 'alpha' }), Object.freeze({ label: '乙 / Beta', value: 'beta' })]),
  Object.freeze([Object.freeze({ label: '一 / One', value: 1 }), Object.freeze({ label: '二 / Two', value: 2 })])
]);
// <lang><zh-CN>calendar model 使用固定合法日期，使 compiler evidence 不依赖机器当前日期。</zh-CN><en>The calendar model uses a fixed valid date so compiler evidence does not depend on the machine's current date.</en></lang>
const fixtureCalendarValue = ref('2026-08-11');
// <lang><zh-CN>calendar 视图锚点由页面独立拥有，月份导航只能请求显式写回。</zh-CN><en>The page independently owns the calendar view anchor, and month navigation can only request explicit writeback.</en></lang>
const fixtureCalendarViewDate = ref('2026-08-01');
// <lang><zh-CN>select 的受控值只从当前页面有限 options 取值。</zh-CN><en>The controlled select value comes only from the current page's finite options.</en></lang>
const fixtureSelectValue = ref('public');
// <lang><zh-CN>select options 是冻结的中性本地集合，不执行 getter、请求或动态脚本。</zh-CN><en>Select options are a frozen neutral local collection and execute no getter, request, or dynamic script.</en></lang>
const fixtureSelectOptions = Object.freeze([
  Object.freeze({ label: '公共 / Public', value: 'public' }),
  Object.freeze({ label: '私有 / Private', value: 'private' })
]);
// <lang><zh-CN>dropdown parent active name 与 item model 分离，避免把面板可见性解释为选项值。</zh-CN><en>The dropdown parent's active name is separate from the item model, avoiding interpretation of panel visibility as an option value.</en></lang>
const fixtureDropdownOpenName = ref('');
// <lang><zh-CN>dropdown item 的受控选项值由本页显式写回。</zh-CN><en>The current page explicitly writes back the dropdown item's controlled option value.</en></lang>
const fixtureDropdownValue = ref('public');
// <lang><zh-CN>dropdown options 独立于 select 集合，以避免共享可变容器或隐式业务关系。</zh-CN><en>Dropdown options are separate from the select collection to avoid a shared mutable container or implicit business relation.</en></lang>
const fixtureDropdownOptions = Object.freeze([
  Object.freeze({ label: '公共 / Public', value: 'public' }),
  Object.freeze({ label: '私有 / Private', value: 'private' })
]);

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

// <lang><zh-CN>索引、区段与列投影数据均是页面拥有的有限本地文字；不表示实际滚动位置、远程图片、行业筛选或无穷数据源。</zh-CN><en>Index, segment, and column-projection data are all page-owned finite local copy; they represent no actual scroll position, remote image, industry filter, or infinite data source.</en></lang>
const fixtureIndexGroups = Object.freeze([
  Object.freeze({ label: '本地 / Local', value: 'local' }),
  Object.freeze({ label: '备用 / Alternate', value: 'alternate' })
]);
const fixtureSegmentItems = Object.freeze([
  Object.freeze({ label: '第一项 / First', value: 'first', description: '静态调用方 panel / Static caller panel' }),
  Object.freeze({ label: '第二项 / Second', value: 'second', description: '有限局部投影 / Finite local projection' })
]);
const fixtureWaterfallItems = Object.freeze([
  Object.freeze({ label: '列项 A / Column item A', value: 'a' }),
  Object.freeze({ label: '列项 B / Column item B', value: 'b' }),
  Object.freeze({ label: '列项 C / Column item C', value: 'c' })
]);

// <lang><zh-CN>文件记录是页面拥有的可读状态投影，不含文件路径、URL、bytes、上传任务、凭据或缓存。</zh-CN><en>File records are page-owned readable state projections containing no file path, URL, bytes, upload task, credential, or cache.</en></lang>
const fixtureUploadFiles = ref([
  Object.freeze({ label: '本地就绪记录 / Local ready record', status: 'ready', statusText: '就绪 / Ready' }),
  Object.freeze({ label: '本地重试记录 / Local retry record', status: 'error', statusText: '本地审阅 / Review locally' })
]);

// <lang><zh-CN>adapter select 可追加的唯一常量是匿名本地记录，不是 chooser 或文件系统结果。</zh-CN><en>The sole constant appendable by adapter select is an anonymous local record, not a chooser or filesystem result.</en></lang>
const FIXTURE_ADDED_UPLOAD_RECORD = Object.freeze({ label: '本地新增记录 / Local added record', status: 'ready', statusText: '本地新增 / Added locally' });

// <lang><zh-CN>新增高频控件均使用页面内局部 refs；它们不进入目录 mock、共享 store 或外部数据源。</zh-CN><en>New high-frequency controls use page-local refs only; they enter no catalog mock, shared store, or external data source.</en></lang>
const fixtureTextareaValue = ref('');

// <lang><zh-CN>基础呈现组件的本地 click 观察只记录有限名称，供 compile fixture 保留调用方事件所有权；它不触发导航、预览、请求或持久化。</zh-CN><en>The local click observation for foundational presentation components records only a finite name so the compile fixture retains caller event ownership; it triggers no routing, preview, request, or persistence.</en></lang>
const fixturePresentationIntent = ref('none');

// <lang><zh-CN>switch 布尔值只表示中性 fixture 状态，不表示权限或业务功能开关。</zh-CN><en>The switch Boolean represents neutral fixture state only, not authorization or a business-feature toggle.</en></lang>
const fixtureSwitchValue = ref(false);
// <lang><zh-CN>busy flag 只让 compiler 组合 switch loading 输入；默认 false 不会阻塞本 fixture 的本地 switch 写回。</zh-CN><en>The busy flag only lets the compiler compose the switch loading input; its false default does not block this fixture's local switch writeback.</en></lang>
const fixtureSwitchBusy = ref(false);
// <lang><zh-CN>number-box 初值落在半步网格上，只验证数值规整。</zh-CN><en>The number-box initial value lies on the half-step grid and verifies numeric normalization only.</en></lang>
const fixtureNumberValue = ref(1);
// <lang><zh-CN>rate 数值是有限本地刻度，不表示评价提交或业务评分。</zh-CN><en>The rate value is a finite local scale and represents no review submission or business score.</en></lang>
const fixtureRateValue = ref(0);
// <lang><zh-CN>slider 值对齐相对 min 的固定步长，只供本地受控写回。</zh-CN><en>The slider value aligns to a fixed step relative to min and serves local controlled writeback only.</en></lang>
const fixtureSliderValue = ref(4);
// <lang><zh-CN>P67 intent marker 只记录有限交互名称，不携带 option、日期、文件或平台 event。</zh-CN><en>The P67 intent marker records only finite interaction names and carries no option, date, file, or platform event.</en></lang>
const fixtureP67Intent = ref('idle');
// <lang><zh-CN>upload marker 只保留 adapter status discriminant，不保存失败 cause 或 caller context。</zh-CN><en>The upload marker retains only the adapter status discriminant and stores no failure cause or caller context.</en></lang>
const fixtureUploadAdapterState = ref('idle');
const fixtureImageSource = ref('');
const fixtureTagVisible = ref(true);
const fixtureBadgeValue = ref(3);
const fixtureCountValue = ref(42);
const fixtureProgressValue = ref(65);

// <lang><zh-CN>P66 form ref 只服务本页面三个显式观察操作；空初值不会触发自动校验或组件查找。</zh-CN><en>The P66 form ref serves only three explicit observation actions on this page; its empty initial value triggers neither automatic validation nor component lookup.</en></lang>
const fixtureP66FormReference = ref(null);

// <lang><zh-CN>四个中性字段只区分输入表面，并与目录 mock、选择记录、身份和业务状态完全隔离。</zh-CN><en>The four neutral fields distinguish input surfaces only and remain completely isolated from catalog mocks, selected records, identity, and business state.</en></lang>
const fixtureP66FormModel = reactive({
  fieldText: '本地字段 / Local field',
  inputText: '本地输入 / Local input',
  longText: '本地多行文字 / Local long text',
  searchText: '本地查询 / Local query'
});

/**
 * @lang zh-CN 声明页面源码直接提供的有限同步规则；规则不读取网络、storage、平台 API、locale service 或业务配置。
 * @lang en Declares finite synchronous rules supplied directly by page source; the rules read no network, storage, platform API, locale service, or business configuration.
 */
const fixtureP66FormRules = Object.freeze({
  fieldText: Object.freeze([Object.freeze({ required: true, trigger: Object.freeze(['change', 'blur']), message: '字段文字为必填 / Field text is required' })]),
  inputText: Object.freeze([Object.freeze({ min: 2, trigger: 'blur', message: '至少输入两个字符 / Use at least two characters' })]),
  longText: Object.freeze([Object.freeze({ max: 80, trigger: 'change', message: '最多输入八十个字符 / Use at most eighty characters' })]),
  searchText: Object.freeze([Object.freeze({ min: 2, trigger: 'change', message: '查询至少输入两个字符 / Use at least two query characters' })])
});

// <lang><zh-CN>可见结果 marker 只记录 fixture 内观察状态，不表示提交、保存、请求或业务有效性。</zh-CN><en>The visible result marker records only fixture-local observation state and represents no submission, save, request, or business validity.</en></lang>
const fixtureP66FormResult = ref('idle');

/**
 * @lang zh-CN 由页面写回 UField 内建输入报告的字符串，保持中性模型所有权在 fixture。
 * @lang en Writes back the string reported by UField's built-in input from the page, retaining neutral-model ownership in the fixture.
 * @param {string} value <lang><zh-CN>未经修改的本地候选值。</zh-CN><en>Unmodified local candidate value.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只写本页面模型。</zh-CN><en>No return value; writes only this page model.</en></lang>
 */
function updateFixtureP66FieldText(value) {
  fixtureP66FormModel.fieldText = value;
}

/**
 * @lang zh-CN 由页面写回直接 UInput 报告的字符串。
 * @lang en Writes back the string reported by the direct UInput from the page.
 * @param {string} value <lang><zh-CN>未经修改的本地候选值。</zh-CN><en>Unmodified local candidate value.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只写本页面模型。</zh-CN><en>No return value; writes only this page model.</en></lang>
 */
function updateFixtureP66InputText(value) {
  fixtureP66FormModel.inputText = value;
}

/**
 * @lang zh-CN 由页面写回 UTextarea 报告的多行字符串。
 * @lang en Writes back the multiline string reported by UTextarea from the page.
 * @param {string} value <lang><zh-CN>未经修改的本地候选值。</zh-CN><en>Unmodified local candidate value.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只写本页面模型。</zh-CN><en>No return value; writes only this page model.</en></lang>
 */
function updateFixtureP66LongText(value) {
  fixtureP66FormModel.longText = value;
}

/**
 * @lang zh-CN 由页面写回 USearch 报告的查询文字；函数不生成结果、过滤目录或发起请求。
 * @lang en Writes back query copy reported by USearch from the page; the function generates no result, filters no catalog, and starts no request.
 * @param {string} value <lang><zh-CN>未经修改的本地查询候选。</zh-CN><en>Unmodified local query candidate.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只写本页面模型。</zh-CN><en>No return value; writes only this page model.</en></lang>
 */
function updateFixtureP66SearchText(value) {
  fixtureP66FormModel.searchText = value;
}

/**
 * @lang zh-CN 显式校验当前注册字段，并把 boolean 转换为稳定中性 marker。
 * @lang en Explicitly validates currently registered fields and converts the boolean into a stable neutral marker.
 * @returns {Promise<void>} <lang><zh-CN>校验完成并更新 marker 后解决。</zh-CN><en>Resolves after validation completes and the marker is updated.</en></lang>
 */
async function validateFixtureP66Form() {
  // <lang><zh-CN>挂载前 ref 为空时只披露 unavailable，不全局查询组件或启动重试。</zh-CN><en>When the ref is empty before mount, only unavailable is disclosed; no global component lookup or retry starts.</en></lang>
  const form = fixtureP66FormReference.value;
  if (form === null) {
    fixtureP66FormResult.value = 'unavailable';
    return;
  }

  // <lang><zh-CN>调用方只消费 UForm 的稳定 boolean，不解释错误为业务状态。</zh-CN><en>The caller consumes only UForm's stable boolean and does not interpret an error as business state.</en></lang>
  const valid = await form.validate();
  fixtureP66FormResult.value = valid ? 'valid' : 'invalid';
}

/**
 * @lang zh-CN 清除全部内部校验投影但保留页面模型值。
 * @lang en Clears every internal validation projection while retaining page-model values.
 * @returns {void} <lang><zh-CN>无返回值；只更新局部 UI 与 marker。</zh-CN><en>No return value; updates only local UI and the marker.</en></lang>
 */
function clearFixtureP66Validation() {
  // <lang><zh-CN>实例 guard 只保护挂载边界，不创建替代 form。</zh-CN><en>The instance guard protects only the mount boundary and creates no substitute form.</en></lang>
  fixtureP66FormReference.value?.clearValidate();
  fixtureP66FormResult.value = 'cleared';
}

/**
 * @lang zh-CN 显式恢复字段挂载快照；这是该中性组合唯一允许表单组件写 model 的入口。
 * @lang en Explicitly restores field mount snapshots; this is the neutral composition's only entry that permits the form component to write the model.
 * @returns {void} <lang><zh-CN>无返回值；更新字段和 marker。</zh-CN><en>No return value; updates fields and the marker.</en></lang>
 */
function resetFixtureP66Fields() {
  // <lang><zh-CN>未挂载时保持模型不变；marker 仅记录页面发出的本地 reset 请求。</zh-CN><en>Before mount, the model remains unchanged; the marker only records the page's local reset request.</en></lang>
  fixtureP66FormReference.value?.resetFields();
  fixtureP66FormResult.value = 'reset';
}

/**
 * @lang zh-CN 记录 USearch search intent；有无文字只选择中性 marker，不连接 catalog 或 API。
 * @lang en Records a USearch search intent; presence of copy selects only a neutral marker and connects to neither catalog nor API.
 * @param {string} value <lang><zh-CN>当前页面拥有的查询文字。</zh-CN><en>Current page-owned query copy.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只写观察 marker。</zh-CN><en>No return value; writes only the observation marker.</en></lang>
 */
function recordFixtureP66SearchIntent(value) {
  fixtureP66FormResult.value = value.length > 0 ? 'search-intent' : 'search-empty-intent';
}

// <lang><zh-CN>P43 items 与状态都是页面内声明的中性 fixture 数据，不进入 UI runtime、路由或业务模型。</zh-CN><en>P43 items and state are page-declared neutral fixture data and enter no UI runtime, router, or business model.</en></lang>
const fixtureTabItems = Object.freeze([
  Object.freeze({ label: '概览 / Overview', value: 'overview' }),
  Object.freeze({ label: '说明 / Notes', value: 'notes' }),
  Object.freeze({ label: '限制 / Limits', value: 'limits' })
]);
// <lang><zh-CN>迁移 tabs 项是页面自有的有限静态展示数据，只验证 list/current 编译解析，不形成动态 panel、路由或数据来源。</zh-CN><en>Migration tab items are finite static presentation data owned by the page and verify list/current compilation only; they form no dynamic panel, route, or data source.</en></lang>
const fixtureMigrationTabItems = Object.freeze([
  Object.freeze({ name: 'First / 第一项', value: 'first' }),
  Object.freeze({ name: 'Second / 第二项', value: 'second' })
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
// <lang><zh-CN>swipe options 是页面自有的有限可见文字投影，只用于编译迁移 options/click 表面；它不代表删除、路由或数据写入。</zh-CN><en>Swipe options are a page-owned finite visible-copy projection used only to compile migration options/click surfaces; they represent no deletion, route, or data write.</en></lang>
const fixtureSwipeOptions = Object.freeze([
  Object.freeze({ text: '本地操作 / Local action', value: 'local-action', type: 'primary' })
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
 * @lang zh-CN 接受 popup 的受控迁移下一值；它只更新当前页面局部 ref，不写路由、存储或共享状态。
 * @lang en Accepts the popup controlled-migration next value; it updates only the current page-local ref and writes no route, storage, or shared state.
 * @param {boolean} value <lang><zh-CN>popup 请求的下一可见值。</zh-CN><en>Next visibility value requested by the popup.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function updateFixturePopupVisible(value) {
  // <lang><zh-CN>只接受布尔值，避免 fixture 把任意事件 payload 解释为可见状态。</zh-CN><en>Accepts only a Boolean, avoiding the fixture interpreting arbitrary event payload as visibility state.</en></lang>
  fixturePopupVisible.value = value === true;
}

/**
 * @lang zh-CN 关闭 fixture popup；页面在 close intent 后决定将当前局部 ref 设为 false。
 * @lang en Closes the fixture popup; the page decides to set the current local ref false after close intent.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function closeFixturePopup() {
  fixturePopupVisible.value = false;
}

/**
 * @lang zh-CN 接受 modal 的受控迁移下一值；它只更新当前页面局部 ref，不表示确认成功、取消完成或业务状态变更。
 * @lang en Accepts the modal controlled-migration next value; it updates only the current page-local ref and represents no confirmation success, cancellation completion, or business-state change.
 * @param {boolean} value <lang><zh-CN>modal 请求的下一可见值。</zh-CN><en>Next visibility value requested by the modal.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function updateCatalogModalVisible(value) {
  // <lang><zh-CN>只接受布尔值，保持页面而非组件拥有 local modal 可见状态。</zh-CN><en>Accepts only a Boolean, keeping the page rather than the component in ownership of local modal visibility.</en></lang>
  catalogModalVisible.value = value === true;
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
 * @lang zh-CN 记录基础呈现组件报告的本地 click 名称。它只更新当前页面 ref，不解释图片、文字、图标或按钮意图为业务行为。
 * @lang en Records a local click name reported by a foundational presentation component. It updates only the current-page ref and does not interpret image, text, icon, or button intent as business behavior.
 * @param {'button'|'icon'|'image'|'text'} intent <lang><zh-CN>固定 fixture 内允许记录的本地呈现意图名称。</zh-CN><en>Local presentation-intent name allowed by this fixed fixture.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只写当前页面观察 ref。</zh-CN><en>No return value; writes only the current-page observation ref.</en></lang>
 */
function recordFixturePresentationIntent(intent) {
  // <lang><zh-CN>来源字符串只来自模板中的四个固定字面量；函数不接受自由文本、不会调用平台 API，也不保留事件对象。</zh-CN><en>The source string comes only from four fixed template literals; the function accepts no free text, calls no platform API, and retains no event object.</en></lang>
  fixturePresentationIntent.value = intent;
}

/**
 * @lang zh-CN 接受 picker 多列确认产生的透明数组并替换页面 model；其他形状保持旧值。
 * @lang en Accepts the transparent array produced by a multi-column picker confirmation and replaces the page model; other shapes retain the old value.
 * @param {unknown} value <lang><zh-CN>picker 报告的候选 model。</zh-CN><en>Candidate model reported by the picker.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；有效时只写页面局部 ref。</zh-CN><en>No return value; on validity writes only the page-local ref.</en></lang>
 */
function updateFixturePickerValue(value) {
  // <lang><zh-CN>数组 guard 与当前两列配置一致，避免把任意事件对象当成选择值。</zh-CN><en>The array guard matches the current two-column configuration and prevents treating an arbitrary event object as a selection value.</en></lang>
  if (!Array.isArray(value)) return;
  // <lang><zh-CN>复制外层容器保持页面拥有写回 identity，不解析透明键。</zh-CN><en>Copies the outer container to retain page ownership of writeback identity without interpreting transparent keys.</en></lang>
  fixturePickerValue.value = [...value];
}

/**
 * @lang zh-CN 写回 calendar 报告的合法日期字符串；fixture 不执行时区转换或业务日期规则。
 * @lang en Writes back the valid date string reported by the calendar; the fixture performs no time-zone conversion or business date rule.
 * @param {unknown} value <lang><zh-CN>候选日期值。</zh-CN><en>Candidate date value.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；字符串输入只写当前页面 ref。</zh-CN><en>No return value; a string input writes only the current-page ref.</en></lang>
 */
function updateFixtureCalendarValue(value) {
  // <lang><zh-CN>组件契约输出字符串；额外 guard 防止直接 handler 调用污染本地 model。</zh-CN><en>The component contract outputs a string; the extra guard prevents a direct handler call from contaminating the local model.</en></lang>
  if (typeof value !== 'string') return;
  fixtureCalendarValue.value = value;
}

/**
 * @lang zh-CN 写回 calendar 月份导航请求的视图锚点，不改变已选日期。
 * @lang en Writes back the view anchor requested by calendar month navigation without changing the selected date.
 * @param {unknown} value <lang><zh-CN>候选月份锚点。</zh-CN><en>Candidate month anchor.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；字符串输入只写页面视图 ref。</zh-CN><en>No return value; a string input writes only the page-view ref.</en></lang>
 */
function updateFixtureCalendarViewDate(value) {
  // <lang><zh-CN>非字符串请求保持零副作用，不尝试构造回退日期。</zh-CN><en>A nonstring request has zero side effect and creates no fallback date.</en></lang>
  if (typeof value !== 'string') return;
  fixtureCalendarViewDate.value = value;
}

/**
 * @lang zh-CN 写回 select 的页面自有透明字符串值；不触发目录查询或远端 option 加载。
 * @lang en Writes back the select's page-owned transparent string value without triggering catalog query or remote-option loading.
 * @param {unknown} value <lang><zh-CN>select 报告的候选值。</zh-CN><en>Candidate value reported by the select.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；有效时只写页面 ref。</zh-CN><en>No return value; on validity writes only the page ref.</en></lang>
 */
function updateFixtureSelectValue(value) {
  // <lang><zh-CN>当前有限 options 只含字符串键，其他类型不被猜测或转换。</zh-CN><en>The current finite options contain only string keys, and other types are neither guessed nor converted.</en></lang>
  if (typeof value !== 'string') return;
  fixtureSelectValue.value = value;
}

/**
 * @lang zh-CN 写回 dropdown parent 的 active item name；该状态只控制局部 panel 可见性。
 * @lang en Writes back the dropdown parent's active item name; this state controls only local panel visibility.
 * @param {unknown} value <lang><zh-CN>dropdown 报告的透明 name。</zh-CN><en>Transparent name reported by the dropdown.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；有限标量只写 parent ref。</zh-CN><en>No return value; a finite scalar writes only the parent ref.</en></lang>
 */
function updateFixtureDropdownOpenName(value) {
  // <lang><zh-CN>有效 name 只允许字符串或有限数值，避免对象成为 registry identity。</zh-CN><en>A valid name allows only a string or finite number, preventing an object from becoming registry identity.</en></lang>
  if (typeof value !== 'string' && (typeof value !== 'number' || !Number.isFinite(value))) return;
  fixtureDropdownOpenName.value = value;
}

/**
 * @lang zh-CN 写回 dropdown-item options 模式的选择值，与 parent active name 保持分离。
 * @lang en Writes back the dropdown-item options-mode selection while keeping it separate from the parent active name.
 * @param {unknown} value <lang><zh-CN>item 报告的透明 option 值。</zh-CN><en>Transparent option value reported by the item.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；有效标量只写 item model ref。</zh-CN><en>No return value; a valid scalar writes only the item-model ref.</en></lang>
 */
function updateFixtureDropdownValue(value) {
  // <lang><zh-CN>当前 options 只用字符串键；数值或对象不会被隐式字符串化。</zh-CN><en>The current options use only string keys; numbers and objects are not implicitly stringified.</en></lang>
  if (typeof value !== 'string') return;
  fixtureDropdownValue.value = value;
}

/**
 * @lang zh-CN 写回 slider 报告的有限数值，不添加单位、库存或进度语义。
 * @lang en Writes back the finite number reported by the slider without adding unit, inventory, or progress semantics.
 * @param {unknown} value <lang><zh-CN>slider 候选数值。</zh-CN><en>Candidate slider number.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；有限数值只写页面 ref。</zh-CN><en>No return value; a finite number writes only the page ref.</en></lang>
 */
function updateFixtureSliderValue(value) {
  // <lang><zh-CN>有限数值 guard 防止 NaN、Infinity 或事件对象进入受控状态。</zh-CN><en>The finite-number guard prevents NaN, Infinity, or an event object from entering controlled state.</en></lang>
  if (typeof value !== 'number' || !Number.isFinite(value)) return;
  fixtureSliderValue.value = value;
}

/**
 * @lang zh-CN 记录模板中固定的 P67 confirm/cancel/change/close 名称；不保留 payload 或派生业务状态。
 * @lang en Records fixed P67 confirm/cancel/change/close names from the template without retaining payloads or deriving business state.
 * @param {string} intent <lang><zh-CN>模板提供的有限观察名称。</zh-CN><en>Finite observation name supplied by the template.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只写可见 marker。</zh-CN><en>No return value; writes only the visible marker.</en></lang>
 */
function recordFixtureP67Intent(intent) {
  fixtureP67Intent.value = intent;
}

/**
 * @lang zh-CN 为 upload select adapter 创建新的本地记录数组；不打开 chooser、不读取文件且不修改 context。
 * @lang en Creates a new local-record array for the upload select adapter without opening a chooser, reading a file, or mutating context.
 * @param {{files: ReadonlyArray<object>}} context <lang><zh-CN>UUpload 提供的冻结浅层记录快照。</zh-CN><en>Frozen shallow record snapshot supplied by UUpload.</en></lang>
 * @returns {ReadonlyArray<object>} <lang><zh-CN>新的冻结候选数组。</zh-CN><en>New frozen candidate array.</en></lang>
 */
function addFixtureLocalUploadRecord(context) {
  // <lang><zh-CN>只复制数组槽位并追加匿名常量；不解释或克隆记录对象。</zh-CN><en>Copies array slots and appends the anonymous constant only; record objects are neither interpreted nor cloned.</en></lang>
  return Object.freeze([...context.files, FIXTURE_ADDED_UPLOAD_RECORD]);
}

/**
 * @lang zh-CN 为 upload remove adapter 返回不含目标索引的新数组；原记录及 source 数组保持不变。
 * @lang en Returns a new array without the target index for the upload remove adapter; original records and source array remain unchanged.
 * @param {{files: ReadonlyArray<object>, index: number}} context <lang><zh-CN>冻结记录快照与有限目标索引。</zh-CN><en>Frozen record snapshot and bounded target index.</en></lang>
 * @returns {ReadonlyArray<object>} <lang><zh-CN>新的冻结候选数组。</zh-CN><en>New frozen candidate array.</en></lang>
 */
function removeFixtureLocalUploadRecord(context) {
  // <lang><zh-CN>局部容器只用于构造候选结果，不能泄漏到共享状态。</zh-CN><en>The local container only constructs the candidate result and cannot leak into shared state.</en></lang>
  const nextFiles = [];
  for (let index = 0; index < context.files.length; index += 1) {
    // <lang><zh-CN>跳过目标索引，其余记录按原顺序复制且保持 identity。</zh-CN><en>Skips the target index while copying all other records in original order with identity preserved.</en></lang>
    if (index !== context.index) nextFiles.push(context.files[index]);
  }
  return Object.freeze(nextFiles);
}

/**
 * @lang zh-CN 完成 preview/retry 的本地 adapter 观察但不产生 model 候选。
 * @lang en Completes local adapter observation for preview/retry without producing a model candidate.
 * @returns {undefined} <lang><zh-CN>明确不请求文件列表写回。</zh-CN><en>Explicitly requests no file-list writeback.</en></lang>
 */
function observeFixtureUploadIntent() {
  // <lang><zh-CN>undefined 是受支持的成功结果，不触发 chooser、网络或替代实现。</zh-CN><en>Undefined is a supported successful result and triggers no chooser, network, or fallback implementation.</en></lang>
  return undefined;
}

// <lang><zh-CN>页面注入的 adapter 仅暴露四个受限 action，不携带 transport、URL、凭据、timer 或全局队列。</zh-CN><en>The page-injected adapter exposes only four bounded actions and carries no transport, URL, credential, timer, or global queue.</en></lang>
const fixtureUploadAdapter = Object.freeze({
  select: addFixtureLocalUploadRecord,
  preview: observeFixtureUploadIntent,
  remove: removeFixtureLocalUploadRecord,
  retry: observeFixtureUploadIntent
});

/**
 * @lang zh-CN 接受 UUpload 产生的新数组并替换页面记录容器；无效输入保持原状态。
 * @lang en Accepts a new array produced by UUpload and replaces the page record container; invalid input retains prior state.
 * @param {unknown} value <lang><zh-CN>候选记录数组。</zh-CN><en>Candidate record array.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；有效时只写页面 ref。</zh-CN><en>No return value; on validity writes only the page ref.</en></lang>
 */
function updateFixtureUploadFiles(value) {
  // <lang><zh-CN>数组 guard 防止任意事件 payload 被解释为文件状态。</zh-CN><en>The array guard prevents an arbitrary event payload from being interpreted as file state.</en></lang>
  if (!Array.isArray(value)) return;
  // <lang><zh-CN>复制外层数组保持调用方拥有最终容器 identity。</zh-CN><en>Copies the outer array so the caller owns the final container identity.</en></lang>
  fixtureUploadFiles.value = [...value];
}

/**
 * @lang zh-CN 将 upload adapter 的公开 status 投影为 smoke marker，不保存文件、event、requestId 或失败 cause。
 * @lang en Projects the public upload-adapter status into a smoke marker without storing file, event, requestId, or failure cause.
 * @param {unknown} state <lang><zh-CN>候选 adapter 状态。</zh-CN><en>Candidate adapter state.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只写稳定文字 marker。</zh-CN><en>No return value; writes only the stable text marker.</en></lang>
 */
function recordFixtureUploadAdapterState(state) {
  // <lang><zh-CN>只读取非 null 对象的字符串 status；其他输入统一收束为 unknown。</zh-CN><en>Reads a string status only from a non-null object; every other input converges to unknown.</en></lang>
  const status = typeof state === 'object' && state !== null && typeof state.status === 'string' ? state.status : 'unknown';
  fixtureUploadAdapterState.value = status;
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

/**
 * @lang zh-CN 接收独立 checkbox 的下一布尔值并只写回当前页面 ref；不触发表单、请求或持久化。
 * @lang en Receives the independent checkbox's next boolean and writes only the current page ref; it triggers no form, request, or persistence.
 * @param {boolean} nextValue <lang><zh-CN>checkbox 报告的下一受控值。</zh-CN><en>Next controlled value reported by the checkbox.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function updateFixtureIndependentCheckboxValue(nextValue) {
  // <lang><zh-CN>页面是唯一写回 owner，组件本身没有 prop mutation 能力。</zh-CN><en>The page is the sole writeback owner; the component itself has no prop-mutation capability.</en></lang>
  fixtureIndependentCheckboxValue.value = nextValue;
}

/**
 * @lang zh-CN 记录独立 radio 原样报告的数值，不把它解释为业务选择、路由或查询参数。
 * @lang en Records the number reported unchanged by the independent radio without interpreting it as a business choice, route, or query parameter.
 * @param {string|number} nextValue <lang><zh-CN>radio 报告的透明本地键。</zh-CN><en>Transparent local key reported by the radio.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function recordFixtureIndependentRadioValue(nextValue) {
  // <lang><zh-CN>fixture 只保留数值键；非数值输入不会被猜测或转换。</zh-CN><en>The fixture retains only a numeric key; a nonnumeric input is neither guessed nor converted.</en></lang>
  if (typeof nextValue !== 'number') {
    return;
  }

  // <lang><zh-CN>写入局部观察 ref，不产生其他副作用。</zh-CN><en>Writes the local observation ref and produces no other side effect.</en></lang>
  fixtureIndependentRadioValue.value = nextValue;
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
