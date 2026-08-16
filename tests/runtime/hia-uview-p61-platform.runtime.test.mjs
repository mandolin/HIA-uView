/**
 * @module hia-uview-p61-platform.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证 P61 的 tabbar/notice caller-controlled aliases 与有限 picker 草稿；测试不启动开发服务器、网络、router、微信 custom tabBar、平台 API、定时器或全局 service。
 * @lang en Uses the real Vue runtime to verify P61 tabbar/notice caller-controlled aliases and finite picker draft; tests start no dev server, network, router, WeChat custom tab bar, platform API, timer, or global service.
 */

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { UNoticeBar, UPicker, UTabbar } from '../../HIA-uView-UI/src/index.mjs';

/** @lang zh-CN 验证有限平台相邻表面仅 emit 调用方 intent。 @lang en Verifies finite platform-adjacent surfaces emit caller intent only. */
describe('P61 bounded platform-adjacent runtime behavior', () => {
  /** @lang zh-CN 验证 tabbar 的 show/visible 优先级、默认索引与零副作用切换。 @lang en Verifies tabbar show/visible precedence, default index, and side-effect-free switching. @returns {Promise<void>} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang> */
  it('keeps tabbar local while honoring show and explicit visible', async () => {
    // <lang><zh-CN>未提供 modelValue 时，默认 0 选中第一个调用方 item；items 不包含页面路径或路由数据。</zh-CN><en>Without modelValue, default 0 selects the first caller item; items contain no page path or routing data.</en></lang>
    const tabbar = mount(UTabbar, { props: { items: [
      { label: 'First', value: 0, icon: '/first.png', activeIcon: '/first-active.png' },
      { label: 'Second', value: 1, icon: '/second.png' }
    ] } });
    const initialTabs = tabbar.findAll('button.u-tabbar__item');
    expect(initialTabs[0].classes()).toContain('u-tabbar__item--active');
    // <lang><zh-CN>选中项使用 activeIcon，普通项使用 icon；图片保持装饰语义，完整名称继续由 label 提供。</zh-CN><en>The selected item uses activeIcon and the regular item uses icon; images remain decorative while labels retain the complete names.</en></lang>
    expect(initialTabs[0].get('.u-tabbar__icon').attributes('src')).toBe('/first-active.png');
    expect(initialTabs[1].get('.u-tabbar__icon').attributes('src')).toBe('/second.png');

    // <lang><zh-CN>点击第二项只报告下一个本地 key，不改变 wrapper prop、路由或平台 tab 状态。</zh-CN><en>Clicking the second item reports only the next local key and changes neither wrapper prop, route, nor platform-tab state.</en></lang>
    await initialTabs[1].trigger('click');
    expect(tabbar.emitted('update:modelValue')).toEqual([[1]]);
    expect(tabbar.emitted('change')).toEqual([[1]]);

    // <lang><zh-CN>受控 modelValue 改为第二项后，没有 activeIcon 的项稳定回退普通 icon，不产生默认或远端 locator。</zh-CN><en>After controlled modelValue changes to the second item, an item without activeIcon stably falls back to its regular icon and creates no default or remote locator.</en></lang>
    await tabbar.setProps({ modelValue: 1 });
    expect(tabbar.findAll('button.u-tabbar__item')[1].get('.u-tabbar__icon').attributes('src')).toBe('/second.png');

    // <lang><zh-CN>show=false 隐藏当前局部 tree；显式 visible=true 随后覆盖 show，但不表示 native tabBar 被重建。</zh-CN><en>Show=false hides the current local tree; explicit visible=true subsequently overrides show without meaning a native tab bar is rebuilt.</en></lang>
    await tabbar.setProps({ show: false });
    expect(tabbar.find('.u-tabbar').exists()).toBe(false);
    await tabbar.setProps({ visible: true });
    expect(tabbar.find('.u-tabbar').exists()).toBe(true);
  });

  /** @lang zh-CN 验证 notice 的 show/visible 优先级和文本 click/close intent。 @lang en Verifies notice show/visible precedence and text click/close intent. @returns {Promise<void>} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang> */
  it('keeps notice visibility and outcomes caller-owned', async () => {
    // <lang><zh-CN>show 和文字足以输出 banner；组件不会创建列表、轮播或自动消失状态。</zh-CN><en>Show and text suffice to output the banner; the component creates no list, rotation, or auto-dismiss state.</en></lang>
    const notice = mount(UNoticeBar, { props: { show: true, text: 'Local notice', closeText: 'Dismiss' } });
    expect(notice.find('.u-notice-bar').exists()).toBe(true);

    // <lang><zh-CN>正文和关闭控件分别报告一次本地 observation，不写回 show/visible。</zh-CN><en>Body and close control each report one local observation and write neither show nor visible back.</en></lang>
    await notice.get('button.u-notice-bar__text').trigger('click');
    await notice.get('button.u-notice-bar__close').trigger('click');
    expect(notice.emitted('click')).toHaveLength(1);
    expect(notice.emitted('close')).toHaveLength(1);

    // <lang><zh-CN>显式 visible=false 覆盖 show=true 并保持隐藏；直接不存在的控件不产生事件。</zh-CN><en>Explicit visible=false overrides show=true and remains hidden; absent controls produce no event.</en></lang>
    await notice.setProps({ visible: false });
    expect(notice.find('.u-notice-bar').exists()).toBe(false);
  });

  /** @lang zh-CN 验证 picker 只提交有限单列草稿，不伪装为 popup 可见性。 @lang en Verifies picker commits only a finite single-column draft and does not masquerade as popup visibility. @returns {Promise<void>} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang> */
  it('keeps picker modelValue as a selected local value rather than popup state', async () => {
    // <lang><zh-CN>两个固定选项只含本地 value/label；不提供地区、时间、多列或远端数据。</zh-CN><en>The two fixed options contain only local value/label; no region, time, multi-column, or remote data is provided.</en></lang>
    const picker = mount(UPicker, { props: { modelValue: 'first', columns: [{ label: 'First', value: 'first' }, { label: 'Second', value: 'second' }] } });
    const options = picker.findAll('button.u-picker__option');

    // <lang><zh-CN>选择第二项只改变内部草稿，确认前不写回调用方 modelValue。</zh-CN><en>Selecting the second item changes only internal draft and does not write caller modelValue back before confirmation.</en></lang>
    await options[1].trigger('click');
    expect(picker.emitted('update:modelValue')).toBeUndefined();

    // <lang><zh-CN>确认才报告 selected local value 与 P67 结构化快照；渲染树没有 popup 组件或外层可见性 service。</zh-CN><en>Only confirmation reports the selected local value and P67 structured snapshot; render tree has no popup component or outer visibility service.</en></lang>
    await picker.get('button.u-picker__action--confirm').trigger('click');
    expect(picker.emitted('update:modelValue')).toEqual([['second']]);
    expect(picker.emitted('confirm')).toEqual([[{ value: 'second', values: ['second'], indexes: [1], options: [{ label: 'Second', value: 'second' }] }]]);
    expect(picker.find('.u-popup').exists()).toBe(false);
  });
});
