/**
 * @module hia-uview-local-composition.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证 P15 fixture 的本地目录、受控查询、无结果 reset、详情选择、确认与局部 feedback 状态变换。测试不启动 dev server、网络、路由、身份、storage、异步数据、计时器、Tool 或平台导航；它不替代 UniApp compiler、微信开发者工具、真机、读屏、焦点、层叠、动画或跨端证据。
 * @lang en Uses a real Vue runtime to verify local directory, controlled query, empty-result reset, detail selection, confirmation, and local-feedback state transitions in the P15 fixture. The test starts no dev server, network, routing, identity, storage, asynchronous data, timer, Tool, or platform navigation; it does not replace UniApp compiler, WeChat DevTools, device, screen-reader, focus, layering, animation, or cross-platform evidence.
 */

// <lang><zh-CN>导入本地 Vue mount、Vitest 断言与同仓 fixture 页面；测试不安装 global plugin、router、store、Tool 或平台 mock。</zh-CN><en>Imports local Vue mount, Vitest assertions, and the same-repository fixture page; the test installs no global plugin, router, store, Tool, or platform mock.</en></lang>
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import LocalCatalogFixture from '../../HIA-uView-UI/fixtures/mp-weixin/src/pages/index/index.vue';

/**
 * @lang zh-CN 验证调用方页面以固定 mock 完成目录、查询、无结果、详情、confirm、notice dismiss 与返回目录的局部状态变换。
 * @lang en Verifies that the caller page performs local state transitions for directory, query, empty result, detail, confirm, notice dismiss, and return to directory using fixed mock.
 */
describe('local catalog composition runtime behavior', () => {
  /**
   * @lang zh-CN 验证输入只更新本地同步投影、空态 action 重置 query、选择切换详情、confirm 由页面关闭 modal 并显示 notice，以及 dismiss/返回只改变页面自有状态。
   * @lang en Verifies that input updates only local synchronous projection, empty-state action resets query, selection switches detail, confirm closes modal and shows notice from the page, and dismiss/return change only page-owned state.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；所有本地 Vue click/input 更新完成后解决。</zh-CN><en>No return value; resolves after every local Vue click/input update completes.</en></lang>
   */
  it('keeps catalog query, selection, confirmation, and feedback with the page', async () => {
    // <lang><zh-CN>挂载完整 fixture，直接观察其真实 script setup 组合而不替换组件为业务或平台 stub。</zh-CN><en>Mounts the complete fixture and directly observes its real script-setup composition without replacing components with business or platform stubs.</en></lang>
    const fixture = mount(LocalCatalogFixture);

    // <lang><zh-CN>初始目录来自三个固定匿名 mock 记录；没有 query 或 selected identifier 时不应显示详情或 feedback。</zh-CN><en>The initial directory comes from three fixed anonymous mock records; with no query or selected identifier it must show neither detail nor feedback.</en></lang>
    expect(fixture.findAll('.fixture-catalog__entry')).toHaveLength(3);
    expect(fixture.find('.fixture-catalog__detail').exists()).toBe(false);
    expect(fixture.find('.u-notice').exists()).toBe(false);

    // <lang><zh-CN>通过受控 input 写入一个固定 mock 标题片段，验证页面 handler 而非 UInput 自己决定同步投影。</zh-CN><en>Writes a fixed-mock title fragment through controlled input, verifying that the page handler rather than UInput itself decides synchronous projection.</en></lang>
    const queryInput = fixture.get('.fixture-catalog__query');

    await queryInput.setValue('beta');

    expect(fixture.findAll('.fixture-catalog__entry')).toHaveLength(1);
    expect(fixture.text()).toContain('样例 Beta / Sample Beta');

    // <lang><zh-CN>写入没有匹配的本地文字后，页面选择 UEmpty 和独立提示；该状态不表示后端错误或加载失败。</zh-CN><en>After writing local text with no match, the page chooses UEmpty and independent hint; this state represents no backend error or loading failure.</en></lang>
    await queryInput.setValue('missing-local-sample');

    expect(fixture.find('.u-empty').exists()).toBe(true);
    expect(fixture.text()).toContain('当前本地查询没有匹配项');

    // <lang><zh-CN>空态 action 只要求页面复位本地 query；复位后恢复固定三项目录且不请求或追加数据。</zh-CN><en>Empty-state action only asks the page to reset local query; after reset the fixed three-item directory returns without requesting or appending data.</en></lang>
    await fixture.get('.u-empty .u-button').trigger('click');

    expect(queryInput.element.value).toBe('');
    expect(fixture.findAll('.fixture-catalog__entry')).toHaveLength(3);

    // <lang><zh-CN>点击固定第二行只写本地 selected identifier 并切换详情投影，不创建 route、数据读取或页面外状态。</zh-CN><en>Clicking fixed second row writes only local selected identifier and switches detail projection, creating no route, data read, or state outside the page.</en></lang>
    const catalogEntries = fixture.findAll('.fixture-catalog__entry');

    await catalogEntries[1].trigger('click');

    expect(fixture.find('.fixture-catalog__detail').exists()).toBe(true);
    expect(fixture.text()).toContain('样例 Beta / Sample Beta');

    // <lang><zh-CN>详情 intent 先由页面显示 modal；UModal 自己不会关闭、保存或生成 feedback。</zh-CN><en>Detail intent first displays modal from the page; UModal itself neither closes, saves, nor generates feedback.</en></lang>
    await fixture.get('.fixture-catalog__intent').trigger('click');

    const modal = fixture.get('.u-modal');
    const modalControls = modal.findAll('.u-button');

    expect(modalControls).toHaveLength(2);

    // <lang><zh-CN>第二个 modal control 是 confirm；页面 handler 关闭 modal 并显式写入局部 notice，而不修改固定 mock。</zh-CN><en>The second modal control is confirm; the page handler closes modal and explicitly writes local notice without mutating fixed mock.</en></lang>
    await modalControls[1].trigger('click');

    expect(fixture.find('.u-modal').exists()).toBe(false);
    expect(fixture.find('.u-notice').exists()).toBe(true);
    expect(fixture.text()).toContain('已记录本地意图');

    // <lang><zh-CN>dismiss 只隐藏当前局部 notice；详情仍由相同 selected identifier 决定，不被 feedback 组件隐式改写。</zh-CN><en>Dismiss hides only current local notice; detail remains decided by the same selected identifier and is not implicitly rewritten by feedback component.</en></lang>
    await fixture.get('.u-notice .u-button').trigger('click');

    expect(fixture.find('.u-notice').exists()).toBe(false);
    expect(fixture.find('.fixture-catalog__detail').exists()).toBe(true);

    // <lang><zh-CN>返回按钮只清除页面 selection 并重新显示当前本地目录，不改变 query 或引入历史/平台返回语义。</zh-CN><en>The return button clears only page selection and redisplays current local directory without changing query or introducing history/platform-back semantics.</en></lang>
    await fixture.get('.fixture-catalog__return').trigger('click');

    expect(fixture.find('.fixture-catalog__detail').exists()).toBe(false);
    expect(fixture.findAll('.fixture-catalog__entry')).toHaveLength(3);
  });
});
