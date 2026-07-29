import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createApp } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import UView, { UButton, UCell, UNavBar, UStack, UVIEW_COMPONENTS } from '../../HIA-uView-UI/src/index.mjs';

/**
 * @module hia-uview-ui.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证当前私有组件的局部行为与显式 plugin 边界。测试不启动 Vitest UI/API、Vite dev server、网络、Tool 或小程序导航；它不替代 UniApp compiler、真机、读屏、焦点或跨端证据。
 * @lang en Uses a real Vue runtime to verify local behavior and explicit-plugin boundaries of current private components. Tests start no Vitest UI/API, Vite dev server, network, Tool, or mini-program navigation; they do not replace UniApp compiler, device, screen-reader, focus, or cross-platform evidence.
 */

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
 * @lang zh-CN 验证 UCell 仅在 clickable 且未 disabled 时 emit click，并让禁用状态保留非颜色类。
 * @lang en Verifies that UCell emits click only when clickable and not disabled and that disabled state retains a non-color class.
 */
describe('UCell runtime behavior', () => {
  /**
   * @lang zh-CN 验证启用可点击行触发一次 click，而禁用和默认信息行触发零事件。
   * @lang en Verifies that an enabled clickable row emits one click while disabled and default informational rows emit zero events.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步 click 触发完成后解决。</zh-CN><en>No return value; resolves after asynchronous click triggers complete.</en></lang>
   */
  it('guards click intent and retains visible information text', async () => {
    // <lang><zh-CN>启用实例同时覆盖 label、description 与 value 的可见文字以及唯一允许的 click。</zh-CN><en>The enabled instance covers visible label, description, and value text together with the sole allowed click.</en></lang>
    const enabled = mount(UCell, {
      props: { label: 'Local row', description: 'Local detail', value: 'Ready', clickable: true }
    });

    await enabled.get('.u-cell').trigger('click');
    expect(enabled.text()).toContain('Local row');
    expect(enabled.text()).toContain('Local detail');
    expect(enabled.text()).toContain('Ready');
    expect(enabled.emitted('click')).toHaveLength(1);

    // <lang><zh-CN>禁用实例保留标签并增加禁用类，但 guard 必须阻止 click 转交给应用。</zh-CN><en>The disabled instance retains its label and adds the disabled class, but the guard must block click delegation to the application.</en></lang>
    const disabled = mount(UCell, { props: { label: 'Unavailable row', clickable: true, disabled: true } });

    await disabled.get('.u-cell').trigger('click');
    expect(disabled.get('.u-cell').classes()).toContain('u-cell--disabled');
    expect(disabled.emitted('click')).toBeUndefined();

    // <lang><zh-CN>默认实例是纯信息行；即使平台传来 click，也不得隐式产生操作意图。</zh-CN><en>The default instance is an informational row; even if the platform supplies click, it must not implicitly produce action intent.</en></lang>
    const informational = mount(UCell, { props: { label: 'Display only' } });

    await informational.get('.u-cell').trigger('click');
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
  expect(application.component('u-cell')).toBeUndefined();
  expect(application.component('u-nav-bar')).toBeUndefined();
  expect(application.component('u-stack')).toBeUndefined();

  // <lang><zh-CN>显式安装是唯一注册入口；集合长度与 manifest 的四项私有组件声明一致。</zh-CN><en>Explicit installation is the only registration entry; collection length matches the manifest four private component declarations.</en></lang>
  application.use(UView);

  expect(application.component('u-button')).toBe(UButton);
  expect(application.component('u-cell')).toBe(UCell);
  expect(application.component('u-nav-bar')).toBe(UNavBar);
  expect(application.component('u-stack')).toBe(UStack);
  expect(UVIEW_COMPONENTS).toHaveLength(4);

  // <lang><zh-CN>读取 runtime entry 本文以验证 style 仍由应用显式导入，而非由 import 或 plugin 注入。</zh-CN><en>Reads runtime-entry text to verify styles remain application-explicit rather than being injected by import or plugin.</en></lang>
  const runtimeEntry = await readFile(resolve('HIA-uView-UI/src/index.mjs'), 'utf8');

  expect(runtimeEntry).not.toContain("./style.css");
});
