/**
 * @module hia-uview-p54.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证 P54 组件的受控呈现、有限值回退与 intent 事件；不启动 dev server、网络、路由、平台 API 或全局 service。
 * @lang en Uses the real Vue runtime to verify controlled presentation, finite-value fallback, and intent events of P54 components; it starts no dev server, network, router, platform API, or global service.
 */

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { UBackTop, UCellItem, UConfigProvider, UFab, ULoading, ULoadingPopup, UMask, UNavbar, UNoNetwork, UNoticeBar, URootPortal, USafeBottom, UStatusBar, UTopTips, UTransition } from '../../HIA-uView-UI/src/index.mjs';

/**
 * @lang zh-CN 验证导航、安全区和浮动 intent 组件不取得路由、设备或滚动所有权。
 * @lang en Verifies that navigation, safe-area, and floating-intent components acquire no routing, device, or scrolling ownership.
 */
describe('P54 navigation and local layout surfaces', () => {
  /**
   * @lang zh-CN 验证两侧 navbar 意图和两个有标签 action 控件仅在 caller 条件允许时 emit。
   * @lang en Verifies that both navbar intents and two labeled action controls emit only when caller conditions permit them.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步交互断言完成后解决。</zh-CN><en>No return value; resolves after asynchronous interaction assertions complete.</en></lang>
   */
  it('emits explicit navigation and floating intents without side effects', async () => {
    // <lang><zh-CN>导航实例提供全部可见文字，确保组件不会创建默认业务或语言内容。</zh-CN><en>The navigation instance supplies all visible text, ensuring that the component creates no default business or language copy.</en></lang>
    const navbar = mount(UNavbar, { props: { title: 'Local page', leftText: 'Back', rightText: 'Save' } });
    const navbarControls = navbar.findAll('button.u-navbar__control');
    await navbarControls[0].trigger('click');
    await navbarControls[1].trigger('click');
    expect(navbar.emitted('left-click')).toHaveLength(1);
    expect(navbar.emitted('right-click')).toHaveLength(1);

    // <lang><zh-CN>回顶和 FAB 都只报告 intent，且 disabled guard 保持零事件。</zh-CN><en>Back-top and FAB both report intent only, and their disabled guards retain zero events.</en></lang>
    const backTop = mount(UBackTop, { props: { visible: true, label: 'Top' } });
    await backTop.get('button.u-back-top').trigger('click');
    expect(backTop.emitted('back-top')).toHaveLength(1);
    const fab = mount(UFab, { props: { visible: true, label: 'Create', position: 'unknown', disabled: true } });
    await fab.get('button.u-fab').trigger('click');
    expect(fab.get('button.u-fab').classes()).toContain('u-fab--bottom-right');
    expect(fab.emitted('click')).toBeUndefined();
  });

  /**
   * @lang zh-CN 验证两类 spacer 只投影受限调用方高度，且 cell-item 保持显式 click guard。
   * @lang en Verifies that both spacers project only bounded caller heights and that cell-item retains an explicit click guard.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步交互断言完成后解决。</zh-CN><en>No return value; resolves after asynchronous interaction assertions complete.</en></lang>
   */
  it('bounds spacers and cell-item interaction', async () => {
    // <lang><zh-CN>超界高度必须被组件收束，不表达任何平台安全区读取。</zh-CN><en>Out-of-bound height must be constrained by the component and does not express any platform safe-area reading.</en></lang>
    const statusBar = mount(UStatusBar, { props: { height: 120 } });
    const safeBottom = mount(USafeBottom, { props: { height: -3 } });
    expect(statusBar.get('.u-status-bar').attributes('style')).toContain('height: 96px');
    expect(safeBottom.get('.u-safe-bottom').attributes('style')).toContain('height: 0px');

    // <lang><zh-CN>可点击行只有在显式 enabled 时才将 click 交给调用方。</zh-CN><en>A clickable row hands click to the caller only when explicitly enabled.</en></lang>
    const enabledCell = mount(UCellItem, { props: { title: 'Entry', value: 'Ready', arrow: true, clickable: true } });
    await enabledCell.get('button.u-cell-item').trigger('click');
    expect(enabledCell.text()).toContain('›');
    expect(enabledCell.emitted('click')).toHaveLength(1);
    const disabledCell = mount(UCellItem, { props: { title: 'Entry', clickable: true, disabled: true } });
    await disabledCell.get('button.u-cell-item').trigger('click');
    expect(disabledCell.emitted('click')).toBeUndefined();
  });
});

/**
 * @lang zh-CN 验证反馈与局部 overlay 组件由调用方确定可见性、文案和关闭/重试意图。
 * @lang en Verifies that feedback and local-overlay components leave visibility, copy, and close/retry intent to the caller.
 */
describe('P54 feedback and overlay surfaces', () => {
  /**
   * @lang zh-CN 验证 loading、notice、网络状态和顶部提示提供可发现文字并只 emit 本地意图。
   * @lang en Verifies that loading, notice, network state, and top tips provide discoverable text and emit local intent only.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步交互断言完成后解决。</zh-CN><en>No return value; resolves after asynchronous interaction assertions complete.</en></lang>
   */
  it('keeps feedback copy and local intent caller-owned', async () => {
    // <lang><zh-CN>未知视觉值回退到有限类，文字仍仅来自调用方。</zh-CN><en>Unknown visual values fall back to finite classes while text still comes only from the caller.</en></lang>
    const loading = mount(ULoading, { props: { visible: true, size: 'unknown', tone: 'unknown', label: 'Synchronizing' } });
    expect(loading.get('.u-loading').classes()).toEqual(expect.arrayContaining(['u-loading--md', 'u-loading--primary']));
    expect(loading.text()).toContain('Synchronizing');
    const notice = mount(UNoticeBar, { props: { visible: true, text: 'Saved locally', closeText: 'Dismiss' } });
    await notice.get('button.u-notice-bar__close').trigger('click');
    expect(notice.emitted('close')).toHaveLength(1);
    const offline = mount(UNoNetwork, { props: { visible: true, title: 'Unavailable', retryText: 'Retry' } });
    await offline.get('button.u-no-network__retry').trigger('click');
    expect(offline.emitted('retry')).toHaveLength(1);
    const topTips = mount(UTopTips, { props: { visible: true, message: 'Review local data', closeText: 'Close' } });
    await topTips.get('button.u-top-tips__close').trigger('click');
    expect(topTips.emitted('close')).toHaveLength(1);
  });

  /**
   * @lang zh-CN 验证 mask 与 loading-popup 的关闭需要 caller 显式授权，且 popup 不建立全局 loading 所有权。
   * @lang en Verifies that mask and loading-popup close requires caller explicit authorization and that popup establishes no global loading ownership.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步交互断言完成后解决。</zh-CN><en>No return value; resolves after asynchronous interaction assertions complete.</en></lang>
   */
  it('guards local mask and loading-popup close intent', async () => {
    // <lang><zh-CN>不可点击 mask 不应有事件；启用后才转发一次局部点击。</zh-CN><en>A non-clickable mask must have no event; only after enablement does it forward one local click.</en></lang>
    const mask = mount(UMask, { props: { visible: true, opacity: 5, layer: 5000 } });
    await mask.get('.u-mask').trigger('click');
    expect(mask.emitted('click')).toBeUndefined();
    await mask.setProps({ clickable: true });
    await mask.get('.u-mask').trigger('click');
    expect(mask.get('.u-mask').attributes('style')).toContain('--u-mask-opacity: 0.92');
    expect(mask.emitted('click')).toHaveLength(1);
    const popup = mount(ULoadingPopup, { props: { visible: true, label: 'Waiting', maskClosable: true } });
    await popup.get('.u-mask').trigger('click');
    expect(popup.emitted('close')).toHaveLength(1);
  });
});

/**
 * @lang zh-CN 验证 transition、配置 provider 与 root-portal 保持有限同树呈现，而非全局动画、语言运行时或 portal 服务。
 * @lang en Verifies that transition, configuration provider, and root portal remain finite same-tree presentation rather than global animation, language runtime, or portal services.
 */
describe('P54 constrained composition surfaces', () => {
  /**
   * @lang zh-CN 验证未知配置和 transition 输入安全回退，root portal 只保留 slot 与有限 layer。
   * @lang en Verifies that unknown configuration and transition input safely falls back and that root portal retains only slot and finite layer.
   */
  it('keeps configuration and composition finite', () => {
    // <lang><zh-CN>provider 的 locale 只限当前双语 UI 子树；未知 theme/density/locale 都必须回退既有受审计值，不读取系统设置。</zh-CN><en>The provider locale is limited to the current bilingual UI subtree; unknown theme/density/locale must all fall back to already audited values without reading system settings.</en></lang>
    const provider = mount(UConfigProvider, { props: { theme: 'dark', density: 'expanded', locale: 'unknown' }, slots: { default: 'Scoped content' } });
    expect(provider.get('.u-config-provider').classes()).toEqual(expect.arrayContaining(['u-config-provider--light', 'u-config-provider--comfortable']));
    expect(provider.get('.u-config-provider').attributes('data-u-theme')).toBe('light');
    expect(provider.get('.u-config-provider').attributes('data-u-locale')).toBe('zh-Hans');
    const transition = mount(UTransition, { props: { visible: true, mode: 'unbounded', duration: 5000 }, slots: { default: 'Transition content' } });
    expect(transition.get('.u-transition').classes()).toContain('u-transition--fade');
    expect(transition.get('.u-transition').attributes('style')).toContain('--u-transition-duration: 1000ms');
    const portal = mount(URootPortal, { props: { visible: true, layer: -10 }, slots: { default: 'Overlay content' } });
    expect(portal.text()).toContain('Overlay content');
    expect(portal.get('.u-root-portal').attributes('style')).toContain('--u-root-portal-layer: 1');
  });
});
