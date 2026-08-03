/**
 * @module hia-uview-ui.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证当前私有组件的局部行为与显式 plugin 边界。测试不启动 Vitest UI/API、Vite dev server、网络、Tool 或小程序导航；它不替代 UniApp compiler、真机、读屏、焦点或跨端证据。
 * @lang en Uses a real Vue runtime to verify local behavior and explicit-plugin boundaries of current private components. Tests start no Vitest UI/API, Vite dev server, network, Tool, or mini-program navigation; they do not replace UniApp compiler, device, screen-reader, focus, or cross-platform evidence.
 */

// <lang><zh-CN>导入本地文件读取、Vue runtime、测试工具与私有组件入口；测试只观察本地行为，不安装路由、Tool 或平台全局能力。</zh-CN><en>Imports local file reading, Vue runtime, test tools, and private component entry; tests observe local behavior only and install no router, Tool, or platform-global capability.</en></lang>
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createApp } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import UView, { UActionSheet, UAlertTips, UBackTop, UBadge, UButton, UCalendar, UCard, UCell, UCellGroup, UCellItem, UCheckbox, UCheckboxGroup, UCircleProgress, UCollapse, UCollapseItem, UCol, UColumnNotice, UConfigProvider, UCountDown, UCountTo, UDivider, UDropdown, UDropdownItem, UEmpty, UFab, UField, UForm, UFormItem, UFullScreen, UGap, UGrid, UGridItem, UIcon, UImage, UIndexAnchor, UIndexList, UAvatar, UInput, ULazyLoad, ULine, ULineProgress, ULink, UList, ULoadmore, ULoading, ULoadingPage, ULoadingPopup, UMask, UModal, UNavBar, UNavbar, UNoNetwork, UNotice, UNoticeBar, UNumberBox, UPagination, UPicker, UPopup, UReadMore, URadio, URadioGroup, URate, URootPortal, URow, URowNotice, USafeBottom, USection, USearch, USelect, USlider, UScrollList, USkeleton, UStack, UStatusBar, UStep, USteps, USticky, USubsection, USwipeAction, USwiper, USwitch, UTabbar, UTable, UTag, UTabs, UTabsSwiper, UText, UTextarea, UTd, UTh, UTimeLine, UTimeLineItem, UToast, UTopTips, UTransition, UTr, UValidationMessage, UWaterfall, UVIEW_COMPONENTS } from '../../HIA-uView-UI/src/index.mjs';

/**
 * @lang zh-CN 验证 UButton 保持 P10/P11 的 enabled、disabled、loading、slot 与 loadingText 契约，防止 P12 registry 扩展回退既有组件行为。
 * @lang en Verifies that UButton retains the P10/P11 enabled, disabled, loading, slot, and loadingText contract, preventing P12 registry expansion from regressing existing component behavior.
 */
describe('UButton runtime behavior', () => {
  /**
   * @lang zh-CN 验证启用按钮恰好触发一次 click，而 disabled/loading 状态保持可见文字并抑制事件。
   * @lang en Verifies that an enabled button emits exactly one click while disabled/loading states retain visible text and suppress events.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步触发和断言完成后解决。</zh-CN><en>No return value; resolves after asynchronous triggers and assertions complete.</en></lang>
   */
  it('emits only while enabled and not loading', async () => {
    // <lang><zh-CN>启用实例代表允许本地操作的基线状态。</zh-CN><en>The enabled instance represents the baseline state that permits local action.</en></lang>
    const enabled = mount(UButton, { props: { label: 'Save draft' } });

    await enabled.get('button').trigger('click');
    expect(enabled.emitted('click')).toHaveLength(1);

    // <lang><zh-CN>禁用实例必须保留调用方标签，但不得产生 click 意图。</zh-CN><en>The disabled instance must retain the caller label but produce no click intent.</en></lang>
    const disabled = mount(UButton, { props: { disabled: true, label: 'Unavailable' } });

    await disabled.get('button').trigger('click');
    expect(disabled.text()).toContain('Unavailable');
    expect(disabled.emitted('click')).toBeUndefined();

    // <lang><zh-CN>加载实例使用组件自有 loading 文案，并与禁用一样抑制重复激活。</zh-CN><en>The loading instance uses component-owned loading copy and suppresses repeated activation just like disabled state.</en></lang>
    const loading = mount(UButton, { props: { loading: true, label: 'Saving' } });

    await loading.get('button').trigger('click');
    expect(loading.text()).toContain('加载中…');
    expect(loading.emitted('click')).toBeUndefined();
  });

  /**
   * @lang zh-CN 验证默认插槽文字和自定义 loadingText 可替代 prop 标签，但不扩大为任意布局或图标按钮能力。
   * @lang en Verifies that default-slot text and custom loadingText can replace prop labels without expanding into arbitrary-layout or icon-button capability.
   */
  it('renders the documented text-slot and loading-text alternatives', () => {
    // <lang><zh-CN>默认插槽实例证明文字 slot 保留可见标签责任。</zh-CN><en>The default-slot instance proves that the text slot retains visible-label responsibility.</en></lang>
    const slotted = mount(UButton, { slots: { default: 'Slot action text' } });

    // <lang><zh-CN>自定义 loadingText 实例证明调用方可以替换组件默认进行中文字。</zh-CN><en>The custom-loadingText instance proves callers can replace the component default in-progress text.</en></lang>
    const loading = mount(UButton, { props: { loading: true, loadingText: 'Synchronizing local data' } });

    expect(slotted.text()).toContain('Slot action text');
    expect(loading.text()).toContain('Synchronizing local data');
  });
});

/**
 * @lang zh-CN 验证 UStack 将所有受限 props 映射为稳定局部类，并保留默认插槽子项而不新增事件。
 * @lang en Verifies that UStack maps every constrained prop to stable local classes and retains default-slot children without adding events.
 */
describe('UStack runtime behavior', () => {
  /**
   * @lang zh-CN 验证横向、大间距、居中、两端分布与换行能够同时形成文档化类，并保留子文字。
   * @lang en Verifies that horizontal direction, large gap, centered alignment, between distribution, and wrapping form documented classes together while retaining child text.
   */
  it('maps constrained layout props without taking child semantics', () => {
    // <lang><zh-CN>组合实例覆盖所有非默认布局维度，避免单一 prop 测试遗漏 class 交互。</zh-CN><en>The combined instance covers every non-default layout dimension, preventing single-prop tests from missing class interaction.</en></lang>
    const stack = mount(UStack, {
      props: { direction: 'horizontal', gap: 'lg', align: 'center', justify: 'between', wrap: true },
      slots: { default: 'Visible stack child' }
    });

    // <lang><zh-CN>根元素承载所有布局类；断言不检查子项角色，因为该职责属于调用方。</zh-CN><en>The root element carries every layout class; assertions do not inspect child role because that responsibility belongs to the caller.</en></lang>
    const root = stack.get('.u-stack');

    expect(root.classes()).toEqual(expect.arrayContaining([
      'u-stack--horizontal',
      'u-stack--gap-lg',
      'u-stack--align-center',
      'u-stack--justify-between',
      'u-stack--wrap'
    ]));
    expect(stack.text()).toContain('Visible stack child');
    expect(stack.emitted()).toEqual({});
  });
});

/**
 * @lang zh-CN 验证 UNavBar 只渲染可见文字 control 并 emit 意图；slot 可以替代内建 control，组件本身不取得导航职责。
 * @lang en Verifies that UNavBar renders visible-text controls and emits intent only; slots can replace built-in controls and the component itself never acquires navigation responsibility.
 */
describe('UNavBar runtime behavior', () => {
  /**
   * @lang zh-CN 验证内建 back/action 控件各自转发一次事件，且标题保持可见。
   * @lang en Verifies that built-in back/action controls each forward one event while the title remains visible.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步 click 触发完成后解决。</zh-CN><en>No return value; resolves after asynchronous click triggers complete.</en></lang>
   */
  it('emits back and action intent without navigation', async () => {
    // <lang><zh-CN>导航栏实例显式提供两个内建可见标签，符合无图标/无默认业务文案契约。</zh-CN><en>The navigation-bar instance explicitly supplies both built-in visible labels, satisfying the no-icon/no-default-business-copy contract.</en></lang>
    const navigation = mount(UNavBar, {
      props: { title: 'Local page', showBack: true, backText: 'Back', actionText: 'Save' }
    });

    // <lang><zh-CN>内建控件按模板顺序为返回后操作；测试只触发 Vue 事件，不安装路由或模拟平台导航。</zh-CN><en>Built-in controls follow template order of back then action; the test triggers Vue events only and installs no router or platform navigation mock.</en></lang>
    const controls = navigation.findAll('.u-nav-bar__control');

    await controls[0].trigger('click');
    await controls[1].trigger('click');

    expect(navigation.text()).toContain('Local page');
    expect(navigation.emitted('back')).toHaveLength(1);
    expect(navigation.emitted('action')).toHaveLength(1);
  });

  /**
   * @lang zh-CN 验证 left/right slot 取代内建 control，且空 actionText 不生成无标签按钮。
   * @lang en Verifies that left/right slots replace built-in controls and an empty actionText creates no unlabeled button.
   */
  it('prioritizes caller slots and suppresses empty built-in controls', () => {
    // <lang><zh-CN>slot 实例将两侧表面完全交给调用方，以检查组件不会重复渲染内建 control。</zh-CN><en>The slot instance hands both side surfaces entirely to the caller, checking that the component does not duplicate built-in controls.</en></lang>
    const navigation = mount(UNavBar, {
      props: { title: 'Custom page', showBack: true, backText: 'Back', actionText: '' },
      slots: { left: '<text>Custom left</text>', right: '<text>Custom right</text>' }
    });

    expect(navigation.text()).toContain('Custom left');
    expect(navigation.text()).toContain('Custom right');
    expect(navigation.findAll('.u-nav-bar__control')).toHaveLength(0);
  });
});

/**
 * @lang zh-CN 验证 UCell 为 clickable 行输出原生 control、仅在未 disabled 时 emit click，并让禁用状态保留非颜色类。
 * @lang en Verifies that UCell renders a native control for a clickable row, emits click only while not disabled, and retains a non-color class for disabled state.
 */
describe('UCell runtime behavior', () => {
  /**
   * @lang zh-CN 验证启用可点击行是可激活原生 button 并触发一次 click，而禁用和默认信息行触发零事件。
   * @lang en Verifies that an enabled clickable row is an activatable native button and emits one click while disabled and default informational rows emit zero events.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步 click 触发完成后解决。</zh-CN><en>No return value; resolves after asynchronous click triggers complete.</en></lang>
   */
  it('guards click intent and retains visible information text', async () => {
    // <lang><zh-CN>启用实例同时覆盖 label、description 与 value 的可见文字以及唯一允许的 click。</zh-CN><en>The enabled instance covers visible label, description, and value text together with the sole allowed click.</en></lang>
    const enabled = mount(UCell, {
      props: { label: 'Local row', description: 'Local detail', value: 'Ready', clickable: true }
    });

    // <lang><zh-CN>可点击行必须使用原生 button，而不是只有 `bindtap` 的平台 view；这使其在 mp-weixin 模拟器中具有实际可激活的 control 语义，同时保留公开 `click` 意图。</zh-CN><en>A clickable row must use a native button rather than a platform view with only `bindtap`; this gives it actually activatable control semantics in the mp-weixin simulator while preserving the public `click` intent.</en></lang>
    const enabledControl = enabled.get('button.u-cell');

    // <lang><zh-CN>固定 button type，避免 Web host 将信息行解释为表单 submit；小程序编译器可独立映射其原生 control。</zh-CN><en>Fix the button type so a web host cannot interpret the information row as form submission; the Mini Program compiler can map its native control independently.</en></lang>
    expect(enabledControl.attributes('type')).toBe('button');

    await enabledControl.trigger('click');
    expect(enabled.text()).toContain('Local row');
    expect(enabled.text()).toContain('Local detail');
    expect(enabled.text()).toContain('Ready');
    expect(enabled.emitted('click')).toHaveLength(1);

    // <lang><zh-CN>禁用实例保留标签并增加禁用类，但 guard 必须阻止 click 转交给应用。</zh-CN><en>The disabled instance retains its label and adds the disabled class, but the guard must block click delegation to the application.</en></lang>
    const disabled = mount(UCell, { props: { label: 'Unavailable row', clickable: true, disabled: true } });

    // <lang><zh-CN>禁用可点击行仍输出原生 button，并同步 native disabled 与 CSS 状态，避免 mp-weixin 出现看似可点却无法激活的普通 view。</zh-CN><en>A disabled clickable row still renders a native button and synchronizes native disabled with CSS state, avoiding an ordinary view that appears tappable but cannot activate in mp-weixin.</en></lang>
    const disabledControl = disabled.get('button.u-cell');

    await disabledControl.trigger('click');
    expect(disabledControl.attributes()).toHaveProperty('disabled');
    expect(disabledControl.classes()).toContain('u-cell--disabled');
    expect(disabled.emitted('click')).toBeUndefined();

    // <lang><zh-CN>默认实例是纯信息行；即使平台传来 click，也不得隐式产生操作意图。</zh-CN><en>The default instance is an informational row; even if the platform supplies click, it must not implicitly produce action intent.</en></lang>
    const informational = mount(UCell, { props: { label: 'Display only' } });

    // <lang><zh-CN>默认信息行必须保持 view，而非无业务意图的 button，防止辅助技术或表单宿主把文本行宣告为可操作。</zh-CN><en>The default informational row must remain a view rather than a button with no business intent, preventing assistive technology or a form host from announcing text row as actionable.</en></lang>
    const informationalRow = informational.get('view.u-cell');

    await informationalRow.trigger('click');
    expect(informational.emitted('click')).toBeUndefined();
  });
});

/**
 * @lang zh-CN 验证 plugin 只有被显式传给 Vue application 时才注册全部当前组件，且 runtime entry 不隐式导入全局 style entry。
 * @lang en Verifies that the plugin registers every current component only when explicitly given to a Vue application and that the runtime entry does not import the global style entry implicitly.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；读取 runtime entry 并完成断言后解决。</zh-CN><en>No return value; resolves after reading the runtime entry and completing assertions.</en></lang>
 */
it('keeps registration and style consumption explicit', async () => {
  // <lang><zh-CN>最小 Vue application 只提供组件 registry，未安装 UView 前不应含任何 HIA-uView 组件。</zh-CN><en>The minimal Vue application provides only component registry; before installing UView it must contain no HIA-uView component.</en></lang>
  const application = createApp({ template: '<div />' });

  expect(application.component('u-button')).toBeUndefined();
  expect(application.component('u-action-sheet')).toBeUndefined();
  expect(application.component('u-cell')).toBeUndefined();
  expect(application.component('u-checkbox')).toBeUndefined();
  expect(application.component('u-checkbox-group')).toBeUndefined();
  expect(application.component('u-collapse')).toBeUndefined();
  expect(application.component('u-collapse-item')).toBeUndefined();
  expect(application.component('u-empty')).toBeUndefined();
  expect(application.component('u-field')).toBeUndefined();
  expect(application.component('u-form')).toBeUndefined();
  expect(application.component('u-form-item')).toBeUndefined();
  expect(application.component('u-icon')).toBeUndefined();
  expect(application.component('u-image')).toBeUndefined();
  expect(application.component('u-avatar')).toBeUndefined();
  expect(application.component('u-input')).toBeUndefined();
  expect(application.component('u-modal')).toBeUndefined();
  expect(application.component('u-nav-bar')).toBeUndefined();
  expect(application.component('u-notice')).toBeUndefined();
  expect(application.component('u-number-box')).toBeUndefined();
  expect(application.component('u-pagination')).toBeUndefined();
  expect(application.component('u-popup')).toBeUndefined();
  expect(application.component('u-tag')).toBeUndefined();
  expect(application.component('u-badge')).toBeUndefined();
  expect(application.component('u-divider')).toBeUndefined();
  expect(application.component('u-count-to')).toBeUndefined();
  expect(application.component('u-line-progress')).toBeUndefined();
  expect(application.component('u-list')).toBeUndefined();
  expect(application.component('u-loadmore')).toBeUndefined();
  expect(application.component('u-loading-page')).toBeUndefined();
  expect(application.component('u-radio')).toBeUndefined();
  expect(application.component('u-radio-group')).toBeUndefined();
  expect(application.component('u-rate')).toBeUndefined();
  expect(application.component('u-search')).toBeUndefined();
  expect(application.component('u-scroll-list')).toBeUndefined();
  expect(application.component('u-skeleton')).toBeUndefined();
  expect(application.component('u-stack')).toBeUndefined();
  expect(application.component('u-steps')).toBeUndefined();
  expect(application.component('u-sticky')).toBeUndefined();
  expect(application.component('u-swiper')).toBeUndefined();
  expect(application.component('u-switch')).toBeUndefined();
  expect(application.component('u-tabbar')).toBeUndefined();
  expect(application.component('u-tabs')).toBeUndefined();
  expect(application.component('u-textarea')).toBeUndefined();
  expect(application.component('u-toast')).toBeUndefined();
  expect(application.component('u-validation-message')).toBeUndefined();

  // <lang><zh-CN>显式安装是唯一注册入口；集合长度与当前八十项预发布组件声明一致。</zh-CN><en>Explicit installation is the only registration entry; collection length matches the current eighty pre-release component declarations.</en></lang>
  application.use(UView);

  expect(application.component('u-button')).toBe(UButton);
  expect(application.component('u-action-sheet')).toBe(UActionSheet);
  expect(application.component('u-alert-tips')).toBe(UAlertTips);
  expect(application.component('u-calendar')).toBe(UCalendar);
  expect(application.component('u-card')).toBe(UCard);
  expect(application.component('u-cell')).toBe(UCell);
  expect(application.component('u-cell-group')).toBe(UCellGroup);
  expect(application.component('u-checkbox')).toBe(UCheckbox);
  expect(application.component('u-checkbox-group')).toBe(UCheckboxGroup);
  expect(application.component('u-col')).toBe(UCol);
  expect(application.component('u-dropdown')).toBe(UDropdown);
  expect(application.component('u-dropdown-item')).toBe(UDropdownItem);
  expect(application.component('u-collapse')).toBe(UCollapse);
  expect(application.component('u-collapse-item')).toBe(UCollapseItem);
  expect(application.component('u-empty')).toBe(UEmpty);
  expect(application.component('u-field')).toBe(UField);
  expect(application.component('u-form')).toBe(UForm);
  expect(application.component('u-form-item')).toBe(UFormItem);
  expect(application.component('u-gap')).toBe(UGap);
  expect(application.component('u-grid')).toBe(UGrid);
  expect(application.component('u-grid-item')).toBe(UGridItem);
  expect(application.component('u-icon')).toBe(UIcon);
  expect(application.component('u-image')).toBe(UImage);
  expect(application.component('u-avatar')).toBe(UAvatar);
  expect(application.component('u-input')).toBe(UInput);
  expect(application.component('u-line')).toBe(ULine);
  expect(application.component('u-link')).toBe(ULink);
  expect(application.component('u-modal')).toBe(UModal);
  expect(application.component('u-nav-bar')).toBe(UNavBar);
  expect(application.component('u-notice')).toBe(UNotice);
  expect(application.component('u-number-box')).toBe(UNumberBox);
  expect(application.component('u-pagination')).toBe(UPagination);
  expect(application.component('u-picker')).toBe(UPicker);
  expect(application.component('u-popup')).toBe(UPopup);
  expect(application.component('u-read-more')).toBe(UReadMore);
  expect(application.component('u-tag')).toBe(UTag);
  expect(application.component('u-badge')).toBe(UBadge);
  expect(application.component('u-divider')).toBe(UDivider);
  expect(application.component('u-count-to')).toBe(UCountTo);
  expect(application.component('u-line-progress')).toBe(ULineProgress);
  expect(application.component('u-list')).toBe(UList);
  expect(application.component('u-loadmore')).toBe(ULoadmore);
  expect(application.component('u-loading-page')).toBe(ULoadingPage);
  expect(application.component('u-radio')).toBe(URadio);
  expect(application.component('u-radio-group')).toBe(URadioGroup);
  expect(application.component('u-rate')).toBe(URate);
  expect(application.component('u-row')).toBe(URow);
  expect(application.component('u-section')).toBe(USection);
  expect(application.component('u-select')).toBe(USelect);
  expect(application.component('u-slider')).toBe(USlider);
  expect(application.component('u-search')).toBe(USearch);
  expect(application.component('u-scroll-list')).toBe(UScrollList);
  expect(application.component('u-skeleton')).toBe(USkeleton);
  expect(application.component('u-stack')).toBe(UStack);
  expect(application.component('u-steps')).toBe(USteps);
  expect(application.component('u-sticky')).toBe(USticky);
  expect(application.component('u-swiper')).toBe(USwiper);
  expect(application.component('u-switch')).toBe(USwitch);
  expect(application.component('u-swipe-action')).toBe(USwipeAction);
  expect(application.component('u-tabbar')).toBe(UTabbar);
  expect(application.component('u-tabs')).toBe(UTabs);
  expect(application.component('u-textarea')).toBe(UTextarea);
  expect(application.component('u-text')).toBe(UText);
  expect(application.component('u-toast')).toBe(UToast);
  expect(application.component('u-validation-message')).toBe(UValidationMessage);
  // <lang><zh-CN>P54 组件也只能由同一显式 plugin 安装；它们不通过 import 或全局副作用自行注册。</zh-CN><en>P54 components are installed only by the same explicit plugin; they do not self-register through import or global side effect.</en></lang>
  expect(application.component('u-back-top')).toBe(UBackTop);
  expect(application.component('u-cell-item')).toBe(UCellItem);
  expect(application.component('u-config-provider')).toBe(UConfigProvider);
  expect(application.component('u-fab')).toBe(UFab);
  expect(application.component('u-loading')).toBe(ULoading);
  expect(application.component('u-loading-popup')).toBe(ULoadingPopup);
  expect(application.component('u-mask')).toBe(UMask);
  expect(application.component('u-navbar')).toBe(UNavbar);
  expect(application.component('u-no-network')).toBe(UNoNetwork);
  expect(application.component('u-notice-bar')).toBe(UNoticeBar);
  expect(application.component('u-root-portal')).toBe(URootPortal);
  expect(application.component('u-safe-bottom')).toBe(USafeBottom);
  expect(application.component('u-status-bar')).toBe(UStatusBar);
  expect(application.component('u-top-tips')).toBe(UTopTips);
  expect(application.component('u-transition')).toBe(UTransition);
  // <lang><zh-CN>本批呈现组件同样只能经显式 plugin 注册；它们不读取全局状态或自行安装。</zh-CN><en>This batch's presentation components likewise register only through the explicit plugin; they read no global state and do not self-install.</en></lang>
  expect(application.component('u-circle-progress')).toBe(UCircleProgress);
  expect(application.component('u-column-notice')).toBe(UColumnNotice);
  expect(application.component('u-count-down')).toBe(UCountDown);
  expect(application.component('u-full-screen')).toBe(UFullScreen);
  expect(application.component('u-row-notice')).toBe(URowNotice);
  expect(application.component('u-step')).toBe(UStep);
  expect(application.component('u-time-line')).toBe(UTimeLine);
  expect(application.component('u-time-line-item')).toBe(UTimeLineItem);
  // <lang><zh-CN>本批索引、延迟呈现、segment、静态 panel 与确定性列也只能经显式 plugin 注册；它们不读取滚动/viewport 或发起数据访问。</zh-CN><en>This batch's index, deferred presentation, segment, static panel, and deterministic columns likewise register only through the explicit plugin; they read no scroll/viewport and initiate no data access.</en></lang>
  expect(application.component('u-index-anchor')).toBe(UIndexAnchor);
  expect(application.component('u-index-list')).toBe(UIndexList);
  expect(application.component('u-lazy-load')).toBe(ULazyLoad);
  expect(application.component('u-subsection')).toBe(USubsection);
  expect(application.component('u-tabs-swiper')).toBe(UTabsSwiper);
  expect(application.component('u-waterfall')).toBe(UWaterfall);
  // <lang><zh-CN>view table family 也只能经显式 plugin 注册；它们不获取记录、排序、测量或平台表格服务。</zh-CN><en>The view table family likewise registers only through the explicit plugin; it acquires no record, sorting, measurement, or platform table service.</en></lang>
  expect(application.component('u-table')).toBe(UTable);
  expect(application.component('u-tr')).toBe(UTr);
  expect(application.component('u-th')).toBe(UTh);
  expect(application.component('u-td')).toBe(UTd);
  // <lang><zh-CN>集合长度与当前一百零七项预发布组件声明一致；后续组件批次会在各自审阅中更新此可执行注册断言。</zh-CN><en>Collection length matches the current one-hundred-and-seven pre-release component declarations; subsequent component batches update this executable registration assertion in their own review.</en></lang>
  expect(UVIEW_COMPONENTS).toHaveLength(107);

  // <lang><zh-CN>读取 runtime entry 本文以验证 style 仍由应用显式导入，而非由 import 或 plugin 注入。</zh-CN><en>Reads runtime-entry text to verify styles remain application-explicit rather than being injected by import or plugin.</en></lang>
  const runtimeEntry = await readFile(resolve('HIA-uView-UI/src/index.mjs'), 'utf8');

  expect(runtimeEntry).not.toContain("./style.css");
});
