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

  /**
   * @lang zh-CN 验证前置装饰只有在可见文字同时存在时呈现，按钮不会因此扩展为无名称的纯图标操作。
   * @lang en Verifies that a leading decoration renders only alongside visible text, so the button does not expand into an unnamed icon-only action.
   * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
   */
  it('bounds leading decoration to a visible text label', () => {
    // <lang><zh-CN>带 label 的实例证明装饰进入唯一前置位置，而 label 继续承担操作名称。</zh-CN><en>The labeled instance proves the decoration enters the sole leading position while the label continues to carry the action name.</en></lang>
    const labeled = mount(UButton, { props: { label: 'Browse venues' }, slots: { leading: '<text class="test-leading">+</text>' } });
    // <lang><zh-CN>无 label/default slot 的实例证明组件拒绝呈现孤立装饰。</zh-CN><en>The instance without label/default slot proves the component suppresses an isolated decoration.</en></lang>
    const iconOnly = mount(UButton, { slots: { leading: '<text class="test-leading">+</text>' } });

    expect(labeled.find('.u-button__leading').exists()).toBe(true);
    expect(labeled.text()).toContain('Browse venues');
    expect(iconOnly.find('.u-button__leading').exists()).toBe(false);
  });
});

/**
 * @lang zh-CN 验证基础呈现组件的迁移文字、可见性、调用方图片源与本地 click 行为；这些断言不扩展为请求、导航、预览、数据或业务流程测试。
 * @lang en Verifies migration copy, visibility, caller image source, and local click behavior for foundational presentation components; these assertions do not expand into request, routing, preview, data, or business-flow tests.
 */
describe('Foundational presentation compatibility behavior', () => {
  /**
   * @lang zh-CN 验证按钮在没有 slot 时保留 label 优先级，并在 label 为空时受控显示迁移 text。
   * @lang en Verifies that the button preserves label precedence without a slot and controlledly displays migration text when label is empty.
   */
  it('preserves button label precedence and text fallback', () => {
    // <lang><zh-CN>冲突实例确保 HIA label 仍覆盖迁移 text，避免升级改变既有调用方可见文案。</zh-CN><en>The conflicting instance ensures HIA label still overrides migration text, avoiding an upgrade that changes existing caller-visible copy.</en></lang>
    const preferredLabel = mount(UButton, { props: { label: 'Current label', text: 'Legacy text' } });

    // <lang><zh-CN>回退实例只提供 text，以验证受限迁移入口能够独立产生可见标签。</zh-CN><en>The fallback instance supplies only text, verifying that the bounded migration entry can independently produce a visible label.</en></lang>
    const fallbackText = mount(UButton, { props: { text: 'Legacy text' } });

    expect(preferredLabel.text()).toContain('Current label');
    expect(preferredLabel.text()).not.toContain('Legacy text');
    expect(fallbackText.text()).toContain('Legacy text');
  });

  /**
   * @lang zh-CN 验证空态由 show 控制投影，description 优先于 text，并仅把非空调用方来源交给嵌套 UImage。
   * @lang en Verifies that show controls empty-state projection, description takes precedence over text, and only a non-empty caller source is passed to nested UImage.
   */
  it('projects empty-state migration surfaces without acquiring data behavior', () => {
    // <lang><zh-CN>隐藏实例必须完全没有根节点，且不会触发 action、数据读取或状态推断。</zh-CN><en>The hidden instance must have no root node and triggers no action, data read, or state inference.</en></lang>
    const hidden = mount(UEmpty, { props: { show: false, title: 'Hidden state' } });

    // <lang><zh-CN>可见实例同时给出 HIA 与迁移次级文字，检查 HIA description 保持优先级；固定测试来源只验证模板投影，不发出网络请求。</zh-CN><en>The visible instance supplies both HIA and migration secondary copy, checking that HIA description retains precedence; the fixed test source verifies template projection only and sends no network request.</en></lang>
    const visible = mount(UEmpty, {
      props: {
        title: 'No local entries',
        description: 'Current description',
        text: 'Legacy description',
        src: 'https://example.invalid/local-empty.png'
      }
    });

    expect(hidden.find('.u-empty').exists()).toBe(false);
    expect(visible.text()).toContain('No local entries');
    expect(visible.text()).toContain('Current description');
    expect(visible.text()).not.toContain('Legacy description');
    expect(visible.get('image.u-image__native').attributes('src')).toBe('https://example.invalid/local-empty.png');
  });

  /**
   * @lang zh-CN 验证图片和文本只转发原始本地 click，且文本能够呈现有限 numeric text 并由 show 移除投影。
   * @lang en Verifies that image and text forward only original local click, and text can present bounded numeric text and be removed by show.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步点击触发完成后解决。</zh-CN><en>No return value; resolves after asynchronous click triggers complete.</en></lang>
   */
  it('forwards presentation click intent and respects text visibility', async () => {
    // <lang><zh-CN>图片实例只使用调用方来源与替代文字；断言不观察下载、缓存或预览。</zh-CN><en>The image instance uses only caller source and alternative text; the assertion observes no download, cache, or preview.</en></lang>
    const image = mount(UImage, { props: { src: 'https://example.invalid/local-image.png', alt: 'Local image' } });

    // <lang><zh-CN>流式实例只增加受控根类，由父容器拥有实际宽高；测试不伪造 viewport 或图片固有尺寸。</zh-CN><en>The fluid instance adds only the controlled root class while its parent owns actual geometry; the test fabricates neither viewport nor intrinsic image dimensions.</en></lang>
    const fluidImage = mount(UImage, { props: { src: 'https://example.invalid/fluid-image.png', alt: 'Fluid local image', fluid: true } });

    // <lang><zh-CN>可见文本实例使用数字以覆盖迁移允许的第二种受限类型。</zh-CN><en>The visible text instance uses a number to cover the second bounded type allowed for migration.</en></lang>
    const text = mount(UText, { props: { text: 42 } });

    // <lang><zh-CN>隐藏文本不投影任何根节点，父级仍拥有决定何时显示的职责。</zh-CN><en>The hidden text projects no root node; the parent retains responsibility for deciding when to display it.</en></lang>
    const hiddenText = mount(UText, { props: { show: false, text: 'Hidden text' } });

    await image.get('.u-image').trigger('click');
    await text.get('.u-text').trigger('click');

    expect(image.emitted('click')).toHaveLength(1);
    expect(image.get('.u-image').classes()).not.toContain('u-image--fluid');
    expect(fluidImage.get('.u-image').classes()).toContain('u-image--fluid');
    expect(text.text()).toContain('42');
    expect(text.emitted('click')).toHaveLength(1);
    expect(hiddenText.find('.u-text').exists()).toBe(false);
  });

  /**
   * @lang zh-CN 验证数字零作为图标可见标签而不是空标签，并且 enabled/disabled click guard 保持本地零副作用边界。
   * @lang en Verifies that numeric zero is an icon visible label rather than an empty label and that enabled/disabled click guards retain the local zero-side-effect boundary.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步点击触发完成后解决。</zh-CN><en>No return value; resolves after asynchronous click triggers complete.</en></lang>
   */
  it('retains numeric icon labels and guards disabled click intent', async () => {
    // <lang><zh-CN>数字零实例证明 label 不依赖 JavaScript truthiness；它仍由调用方定义含义。</zh-CN><en>The numeric-zero instance proves label does not depend on JavaScript truthiness; the caller still defines its meaning.</en></lang>
    const enabled = mount(UIcon, { props: { name: '•', label: 0 } });

    // <lang><zh-CN>禁用实例验证 guard 不会被模板触发绕过，且不产生导航或业务副作用。</zh-CN><en>The disabled instance verifies that the guard cannot be bypassed by a template trigger and creates no navigation or business side effect.</en></lang>
    const disabled = mount(UIcon, { props: { name: '•', label: 0, disabled: true } });

    await enabled.get('.u-icon').trigger('click');
    await disabled.get('.u-icon').trigger('click');

    expect(enabled.text()).toContain('0');
    expect(enabled.emitted('click')).toHaveLength(1);
    expect(disabled.emitted('click')).toBeUndefined();
  });
});

/**
 * @lang zh-CN 验证导航、信息行、标签栏和分页的受控迁移入口；断言仅覆盖本地呈现与事件转发，不把它们扩展为路由、请求、滚动、数据或系统导航证据。
 * @lang en Verifies controlled migration entries for navigation, information rows, tabs, and pagination; assertions cover local presentation and event forwarding only and do not expand into routing, request, scroll, data, or system-navigation evidence.
 */
describe('Navigation and pagination migration behavior', () => {
  /**
   * @lang zh-CN 验证信息行呈现数值零、必填提示和 value 为空时的默认 slot，同时保持 click 只是调用方 intent。
   * @lang en Verifies that an information row presents numeric zero, required cue, and default slot for an empty value while keeping click as caller intent only.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步点击触发完成后解决。</zh-CN><en>No return value; resolves after asynchronous click triggers complete.</en></lang>
   */
  it('retains numeric cell content and a caller trailing slot', async () => {
    // <lang><zh-CN>数值实例同时覆盖零值的可见性、required 星号和明确可点击行；测试不为其分配表单或导航职责。</zh-CN><en>The numeric instance covers zero-value visibility, required asterisk, and explicit clickable row together; the test assigns it no form or navigation responsibility.</en></lang>
    const numeric = mount(UCellItem, { props: { title: 'Local row', label: 0, value: 0, required: true, clickable: true } });

    // <lang><zh-CN>slot 实例仅在 value 为空时让调用方提供尾部展示，以验证不会和非空 value 混合。</zh-CN><en>The slot instance lets the caller provide trailing presentation only while value is empty, verifying it does not mix with nonempty value.</en></lang>
    const slotted = mount(UCellItem, { props: { title: 'Local slot row', value: '' }, slots: { default: 'Caller trailing copy' } });

    await numeric.get('button.u-cell-item').trigger('click');

    expect(numeric.text()).toContain('0');
    expect(numeric.get('.u-cell-item__required').text()).toBe('*');
    expect(numeric.emitted('click')).toHaveLength(1);
    expect(slotted.text()).toContain('Caller trailing copy');
  });

  /**
   * @lang zh-CN 验证 tabs 在 HIA items 为空时使用迁移 list，并将显式 numeric current 限定为当前有限列表索引。
   * @lang en Verifies that tabs uses migration list when HIA items is empty and constrains explicit numeric current to an index of the current finite list.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步点击触发完成后解决。</zh-CN><en>No return value; resolves after asynchronous click triggers complete.</en></lang>
   */
  it('maps migration current onto finite tabs without taking panel ownership', async () => {
    // <lang><zh-CN>两个调用方条目只携带可见 label/name 和有限 value；它们不是路由、动态面板或异步数据来源。</zh-CN><en>The two caller items carry only visible label/name and finite value; they are not a route, dynamic panel, or asynchronous data source.</en></lang>
    const tabs = mount(UTabs, {
      props: {
        list: [{ name: 'First tab', value: 'first' }, { name: 'Second tab', value: 'second' }],
        current: 1
      }
    });

    // <lang><zh-CN>current=1 应指向第二项；选择第一项只报告候选 value 给调用方。</zh-CN><en>current=1 must point to the second item; selecting the first item reports only its candidate value to the caller.</en></lang>
    const controls = tabs.findAll('.u-tabs__item');

    expect(controls[1].classes()).toContain('u-tabs__item--active');
    await controls[0].trigger('click');
    expect(tabs.emitted('update:modelValue')[0]).toEqual(['first']);
    expect(tabs.emitted('change')[0]).toEqual(['first']);
  });

  /**
   * @lang zh-CN 验证 pagination 可由迁移 modelValue/pageSize/total 投影有限页数，并在 HIA current/pageCount 存在时保留其优先级。
   * @lang en Verifies that pagination can project finite page count from migration modelValue/pageSize/total and retains HIA current/pageCount precedence when present.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步点击触发完成后解决。</zh-CN><en>No return value; resolves after asynchronous click triggers complete.</en></lang>
   */
  it('projects bounded migration pages and reports both controlled update names', async () => {
    // <lang><zh-CN>迁移实例由 total/pageSize 得出三页；它不读取 records 或触发查询。</zh-CN><en>The migration instance derives three pages from total/pageSize; it reads no records and starts no query.</en></lang>
    const migration = mount(UPagination, { props: { modelValue: 2, pageSize: 10, total: 21 } });

    // <lang><zh-CN>既有 HIA pageCount/current 实例验证优先级；迁移输入即使冲突也不能改变其当前展示。</zh-CN><en>The existing HIA pageCount/current instance verifies precedence; migration inputs cannot change its current display even if conflicting.</en></lang>
    const hiaPreferred = mount(UPagination, { props: { current: 2, pageCount: 4, modelValue: 1, pageSize: 10, total: 11 } });

    expect(migration.text()).toContain('2 / 3');
    expect(hiaPreferred.text()).toContain('2 / 4');

    // <lang><zh-CN>第三个页码是唯一可前进候选；点击后两个 controlled update 和 change 都仅报告数字三。</zh-CN><en>The third page is the sole forward candidate; after clicking, both controlled updates and change report only number three.</en></lang>
    const pageControls = migration.findAll('.u-pagination__page');

    await pageControls[2].trigger('click');
    expect(migration.emitted('update:current')[0]).toEqual([3]);
    expect(migration.emitted('update:modelValue')[0]).toEqual([3]);
    expect(migration.emitted('change')[0]).toEqual([3]);
  });

  /**
   * @lang zh-CN 验证 navbar 默认 slot 只替换中央标题投影，不改变两侧 intent 或引入系统导航行为。
   * @lang en Verifies that navbar default slot replaces only central title projection and does not change side intent or introduce system navigation behavior.
   */
  it('uses a caller default slot for the navbar center only', () => {
    // <lang><zh-CN>实例同时提供 title 和默认 slot，确保 slot 优先级可见且不需任何 route 或页面栈 fixture。</zh-CN><en>The instance supplies both title and default slot, ensuring slot precedence is visible and needs no route or page-stack fixture.</en></lang>
    const navbar = mount(UNavbar, { props: { title: 'Fallback title' }, slots: { default: 'Caller center' } });

    expect(navbar.text()).toContain('Caller center');
    expect(navbar.text()).not.toContain('Fallback title');
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
 * @lang zh-CN 验证受控输入族只回传调用方拥有的本地意图；它们不创建查询、校验、提交、持久化或导航流程。
 * @lang en Verifies that the controlled-input family returns only caller-owned local intent; it creates no query, validation, submission, persistence, or navigation flow.
 */
describe('controlled input migration runtime behavior', () => {
  /**
   * @lang zh-CN 验证 UInput 显示数字初值、只读时不写回值，并保留启用状态的 click/confirm 本地观察。
   * @lang en Verifies that UInput displays a numeric initial value, does not write back while readonly, and retains enabled click/confirm local observation.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步事件触发与断言完成后解决。</zh-CN><en>No return value; resolves after asynchronous event triggers and assertions complete.</en></lang>
   */
  it('keeps UInput numeric display and readonly interaction bounded', async () => {
    // <lang><zh-CN>readonly 实例用数字初值验证 prop 接受范围，同时不安装表单、validator 或平台 service。</zh-CN><en>The readonly instance uses a numeric initial value to verify the prop acceptance range and installs no form, validator, or platform service.</en></lang>
    const input = mount(UInput, { props: { modelValue: 42, readonly: true } });

    // <lang><zh-CN>原生 input 属性必须保留可见数字，并以 readonly 表明不能产生受控写回。</zh-CN><en>The native input attribute must retain the visible number and use readonly to indicate it cannot produce controlled writeback.</en></lang>
    const nativeInput = input.get('input.u-input');
    expect(nativeInput.element.value).toBe('42');
    expect(nativeInput.attributes()).toHaveProperty('readonly');

    // <lang><zh-CN>直接触发 input 用于验证 handler guard，避免测试只依赖浏览器/小程序原生 readonly 行为。</zh-CN><en>Directly triggers input to verify the handler guard, avoiding a test that depends only on browser or Mini Program native readonly behavior.</en></lang>
    await nativeInput.trigger('input', { detail: { value: '43' } });
    expect(input.emitted('update:modelValue')).toBeUndefined();
    expect(input.emitted('input')).toBeUndefined();

    // <lang><zh-CN>click/confirm 只是启用表面的原始本地观察，不写回值、不校验也不提交。</zh-CN><en>Click/confirm are only raw local observations of an enabled surface and neither write back, validate, nor submit a value.</en></lang>
    await nativeInput.trigger('click');
    await nativeInput.trigger('confirm');
    expect(input.emitted('click')).toHaveLength(1);
    expect(input.emitted('confirm')).toHaveLength(1);
  });

  /**
   * @lang zh-CN 验证 USearch 和 UTextarea 在一次编辑中按固定顺序报告 update、input、change，并将 click 保持为本地观察。
   * @lang en Verifies that USearch and UTextarea report update, input, and change in fixed order for one edit and retain click as local observation.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步事件触发与断言完成后解决。</zh-CN><en>No return value; resolves after asynchronous event triggers and assertions complete.</en></lang>
   */
  it('reports search and multiline changes without starting application work', async () => {
    // <lang><zh-CN>查询实例只提供受控初值；测试不绑定 fetch、定时器、router 或业务筛选。</zh-CN><en>The search instance provides only a controlled initial value; the test binds no fetch, timer, router, or business filter.</en></lang>
    const search = mount(USearch, { props: { modelValue: 'old' } });

    // <lang><zh-CN>原生输入候选值应在三个事件中保持一致，允许调用方选择任何一个受控观察入口。</zh-CN><en>The native input candidate value must remain equal in all three events, allowing the caller to choose any controlled observation entry.</en></lang>
    await search.get('input.u-search__input').trigger('input', { detail: { value: 'next' } });
    expect(search.emitted('update:modelValue')).toEqual([['next']]);
    expect(search.emitted('input')).toEqual([['next']]);
    expect(search.emitted('change')).toEqual([['next']]);

    // <lang><zh-CN>根点击只产生一次 click 观察；它不会调用 search action 或改变受控值。</zh-CN><en>A root click produces only one click observation; it invokes no search action and changes no controlled value.</en></lang>
    await search.get('.u-search').trigger('click');
    expect(search.emitted('click')).toHaveLength(1);
    expect(search.emitted('search')).toBeUndefined();

    // <lang><zh-CN>多行实例复用同一受控事件顺序，但不创建独立模型副本或异步任务。</zh-CN><en>The multiline instance reuses the same controlled event order but creates no independent model copy or asynchronous task.</en></lang>
    const textarea = mount(UTextarea, { props: { modelValue: 'old' } });
    await textarea.get('textarea.u-textarea__field').trigger('input', { detail: { value: 'next' } });
    expect(textarea.emitted('update:modelValue')).toEqual([['next']]);
    expect(textarea.emitted('input')).toEqual([['next']]);
    expect(textarea.emitted('change')).toEqual([['next']]);
    await textarea.get('.u-textarea').trigger('click');
    expect(textarea.emitted('click')).toHaveLength(1);
  });

  /**
   * @lang zh-CN 验证 field 与 form-item 只呈现标签、必填提示和调用方 slot，不获得模型或字段重置职责。
   * @lang en Verifies that field and form-item present only label, required cue, and caller slot and acquire no model or field-reset responsibility.
   */
  it('keeps field structures presentational', () => {
    // <lang><zh-CN>两个结构实例显式提供数字零文本与 caller slot，确认呈现不依赖模型或 validator。</zh-CN><en>The two structural instances explicitly provide zero-like text and caller slots, confirming presentation has no dependency on a model or validator.</en></lang>
    const field = mount(UField, { props: { label: 'Field label', required: true }, slots: { default: '<text>Caller control</text>' } });
    const formItem = mount(UFormItem, { props: { label: 'Item label', required: true }, slots: { default: '<text>Caller content</text>' } });

    expect(field.text()).toContain('Field label');
    expect(field.text()).toContain('*');
    expect(field.text()).toContain('Caller control');
    expect(field.emitted()).toEqual({});
    expect(formItem.text()).toContain('Item label');
    expect(formItem.text()).toContain('*');
    expect(formItem.text()).toContain('Caller content');
    expect(formItem.emitted()).toEqual({});
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
