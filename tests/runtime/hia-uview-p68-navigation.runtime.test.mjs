/**
 * @module hia-uview-p68-navigation.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证导航与通知迁移表面的受控 alias、事件顺序和实例局部 clickTab；测试不启动 router、原生 tabBar、selector query、timer、网络或平台导航。
 * @lang en Uses the real Vue runtime to verify controlled aliases, event order, and instance-local clickTab across navigation and notice migration surfaces; tests start no router, native tab bar, selector query, timer, network, or platform navigation.
 */

// <lang><zh-CN>测试只导入本地 Vue mount、断言工具与四个私有组件入口；没有安装 router 或平台 mock。</zh-CN><en>The test imports only local Vue mounting, assertions, and four private component entries; it installs no router or platform mock.</en></lang>
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import UNavbar from '../../HIA-uView-UI/src/components/u-navbar/u-navbar.vue';
import UNoticeBar from '../../HIA-uView-UI/src/components/u-notice-bar/u-notice-bar.vue';
import UTabbar from '../../HIA-uView-UI/src/components/u-tabbar/u-tabbar.vue';
import UTabs from '../../HIA-uView-UI/src/components/u-tabs/u-tabs.vue';

/**
 * @lang zh-CN 验证 navbar 的 caller-owned 标题与三插槽，以及仅控制内建左文字的 backText/isBack alias。
 * @lang en Verifies navbar caller-owned title and three slots together with backText/isBack aliases that control built-in left copy only.
 */
describe('P68 controlled navbar runtime behavior', () => {
  /**
   * @lang zh-CN 验证 leftText 优先、backText 回退、原始事件以及 disabled/isBack 的零事件边界。
   * @lang en Verifies leftText precedence, backText fallback, original events, and disabled/isBack zero-event boundaries.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；prop 更新与点击完成后解决。</zh-CN><en>No return value; resolves after prop updates and clicks complete.</en></lang>
   */
  it('keeps built-in left copy controlled without performing navigation', async () => {
    // <lang><zh-CN>优先级实例同时提供既有 leftText 与熟悉 backText，确保已有 caller 文案不被 alias 覆盖。</zh-CN><en>The precedence instance supplies both existing leftText and familiar backText, ensuring the alias does not override existing caller copy.</en></lang>
    const navbar = mount(UNavbar, {
      props: { title: 'Caller title', leftText: 'Existing left', backText: 'Fallback back' }
    });

    // <lang><zh-CN>内建左 control 必须呈现既有文字，并保留 title 的默认中央投影。</zh-CN><en>The built-in left control must present existing copy and retain default central title projection.</en></lang>
    const initialLeftControl = navbar.get('button.u-navbar__control');
    expect(initialLeftControl.text()).toBe('Existing left');
    expect(navbar.get('.u-navbar__title').text()).toBe('Caller title');

    // <lang><zh-CN>点击只回传 jsdom 生成的原始平台事件；组件不会写 visible 或调用任何返回 API。</zh-CN><en>The click returns only the original jsdom platform event; the component writes no visible state and calls no back API.</en></lang>
    await initialLeftControl.trigger('click');
    const initialLeftEvents = navbar.emitted('left-click');
    expect(initialLeftEvents).toHaveLength(1);
    expect(initialLeftEvents[0]).toHaveLength(1);
    expect(initialLeftEvents[0][0]).toBeInstanceOf(MouseEvent);

    // <lang><zh-CN>清空 leftText 后，backText 成为可见回退，但仍只是本地 intent control。</zh-CN><en>After leftText is emptied, backText becomes the visible fallback while remaining only a local intent control.</en></lang>
    await navbar.setProps({ leftText: '' });
    expect(navbar.get('button.u-navbar__control').text()).toBe('Fallback back');

    // <lang><zh-CN>disabled 阻止内建 control 增加事件；既有一次事件记录保持不变。</zh-CN><en>Disabled prevents the built-in control from adding an event; the existing single event record remains unchanged.</en></lang>
    await navbar.setProps({ disabled: true });
    await navbar.get('button.u-navbar__control').trigger('click');
    expect(navbar.emitted('left-click')).toHaveLength(1);

    // <lang><zh-CN>isBack=false 只移除内建左文字，不影响 title 或整个 navbar 可见性。</zh-CN><en>IsBack=false removes only built-in left copy and affects neither title nor overall navbar visibility.</en></lang>
    await navbar.setProps({ disabled: false, isBack: false });
    expect(navbar.find('button.u-navbar__control').exists()).toBe(false);
    expect(navbar.get('.u-navbar__title').text()).toBe('Caller title');
  });

  /**
   * @lang zh-CN 验证 left/default/right slot 完整覆盖对应文字投影，并且 isBack 不抑制显式 left slot。
   * @lang en Verifies left/default/right slots fully replace matching text projections and isBack does not suppress an explicit left slot.
   * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
   */
  it('preserves all three caller slots independently of isBack', () => {
    // <lang><zh-CN>插槽实例关闭内建返回文字，同时提供三个明确 caller-owned 投影。</zh-CN><en>The slotted instance disables built-in back copy while supplying three explicit caller-owned projections.</en></lang>
    const navbar = mount(UNavbar, {
      props: { title: 'Hidden prop title', leftText: 'Hidden left copy', rightText: 'Hidden right copy', isBack: false },
      slots: {
        left: '<text class="test-left-slot">Caller left slot</text>',
        default: '<text class="test-default-slot">Caller default slot</text>',
        right: '<text class="test-right-slot">Caller right slot</text>'
      }
    });

    // <lang><zh-CN>三处 slot 都必须存在，且任何 prop 文字都不能泄漏到替换后的投影。</zh-CN><en>All three slots must exist, and no prop copy may leak into the replaced projections.</en></lang>
    expect(navbar.get('.test-left-slot').text()).toBe('Caller left slot');
    expect(navbar.get('.test-default-slot').text()).toBe('Caller default slot');
    expect(navbar.get('.test-right-slot').text()).toBe('Caller right slot');
    expect(navbar.text()).not.toContain('Hidden prop title');
    expect(navbar.text()).not.toContain('Hidden left copy');
    expect(navbar.text()).not.toContain('Hidden right copy');
  });
});

/**
 * @lang zh-CN 验证 tabbar 的 items/list 与 visible/show 优先级，以及严格受控选择的零事件和 update→change 顺序。
 * @lang en Verifies tabbar items/list and visible/show precedence together with zero events and update→change order for strict controlled selection.
 */
describe('P68 controlled tabbar runtime behavior', () => {
  /**
   * @lang zh-CN 验证非空 items 覆盖 list，当前/禁用项零事件，合法项按精确 payload 顺序报告。
   * @lang en Verifies nonempty items override list, current/disabled items emit nothing, and a valid item reports exact payloads in order.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；点击完成后解决。</zh-CN><en>No return value; resolves after clicks complete.</en></lang>
   */
  it('uses items before list and emits update before change only for a valid next item', async () => {
    // <lang><zh-CN>监听顺序数组从 caller 视角记录两个不同事件，避免仅分别计数而遗漏跨事件先后。</zh-CN><en>The listener-order array records both distinct events from the caller perspective, avoiding a cross-event ordering gap from separate counts alone.</en></lang>
    const eventOrder = [];

    // <lang><zh-CN>三个优先 items 分别代表当前、禁用和合法下一项；list 中的值不得进入渲染。</zh-CN><en>The three preferred items represent current, disabled, and valid-next states; values from list must not enter rendering.</en></lang>
    const tabbar = mount(UTabbar, {
      props: {
        modelValue: 'current',
        items: [
          { label: 'Current item', value: 'current' },
          { label: 'Disabled item', value: 'disabled', disabled: true },
          { label: 'Next item', value: 'next' }
        ],
        list: [{ label: 'Ignored alias item', value: 'ignored' }],
        'onUpdate:modelValue': (value) => eventOrder.push(['update:modelValue', value]),
        onChange: (value) => eventOrder.push(['change', value])
      }
    });

    // <lang><zh-CN>渲染列表只能来自非空 items；严格 modelValue 使首项处于活动态。</zh-CN><en>The rendered list may come only from nonempty items; strict modelValue makes the first item active.</en></lang>
    const controls = tabbar.findAll('button.u-tabbar__item');
    expect(controls).toHaveLength(3);
    expect(tabbar.text()).not.toContain('Ignored alias item');
    expect(controls[0].classes()).toContain('u-tabbar__item--active');

    // <lang><zh-CN>当前项与禁用项都不得调用两个 listener。</zh-CN><en>Neither the current nor disabled item may invoke either listener.</en></lang>
    await controls[0].trigger('click');
    await controls[1].trigger('click');
    expect(eventOrder).toEqual([]);
    expect(tabbar.emitted('update:modelValue')).toBeUndefined();
    expect(tabbar.emitted('change')).toBeUndefined();

    // <lang><zh-CN>合法项先报告标准 v-model，再报告 change，且两个 payload 都保留原始字符串类型。</zh-CN><en>The valid item reports standard v-model before change, and both payloads preserve the original string type.</en></lang>
    await controls[2].trigger('click');
    expect(eventOrder).toEqual([['update:modelValue', 'next'], ['change', 'next']]);
    expect(tabbar.emitted('update:modelValue')).toEqual([['next']]);
    expect(tabbar.emitted('change')).toEqual([['next']]);
  });

  /**
   * @lang zh-CN 验证空 items 使用 list alias，并保持 visible 明确覆盖 show。
   * @lang en Verifies empty items uses the list alias while explicit visible continues to override show.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；prop 更新后解决。</zh-CN><en>No return value; resolves after prop updates.</en></lang>
   */
  it('falls back to list while keeping explicit visibility precedence', async () => {
    // <lang><zh-CN>alias-only 实例以 show=false 开始，证明 list 本身不会强制输出 tabbar。</zh-CN><en>The alias-only instance starts with show=false, proving list itself does not force tabbar output.</en></lang>
    const tabbar = mount(UTabbar, {
      props: { show: false, list: [{ label: 'Alias first', value: 0 }, { label: 'Alias second', value: 1 }] }
    });
    expect(tabbar.find('.u-tabbar').exists()).toBe(false);

    // <lang><zh-CN>显式 visible=true 覆盖 show=false 并呈现两个 list 项，但不创建或操作原生 tabBar。</zh-CN><en>Explicit visible=true overrides show=false and presents two list items without creating or operating a native tab bar.</en></lang>
    await tabbar.setProps({ visible: true });
    expect(tabbar.findAll('button.u-tabbar__item')).toHaveLength(2);
    expect(tabbar.text()).toContain('Alias first');
    expect(tabbar.text()).toContain('Alias second');
  });
});

/**
 * @lang zh-CN 验证 tabs 的 items/list/current 迁移优先级与 clickTab 实例入口共享同一严格选择语义。
 * @lang en Verifies tabs items/list/current migration precedence and that the clickTab instance entry shares the same strict selection semantics.
 */
describe('P68 controlled tabs runtime behavior', () => {
  /**
   * @lang zh-CN 验证 items 优先、current 索引选择、当前/禁用零事件与点击的 update→change 顺序。
   * @lang en Verifies items precedence, current-index selection, current/disabled zero events, and click update→change order.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；点击完成后解决。</zh-CN><en>No return value; resolves after clicks complete.</en></lang>
   */
  it('keeps items and current precedence with exact click event order', async () => {
    // <lang><zh-CN>caller listener 顺序用于验证 change 不得早于 v-model 更新意图。</zh-CN><en>Caller listener order verifies change must not precede the v-model update intent.</en></lang>
    const eventOrder = [];

    // <lang><zh-CN>current=1 选择第二个优先 item，即使 modelValue 指向首项；第三项用于 disabled guard。</zh-CN><en>Current=1 selects the second preferred item even when modelValue points to the first; the third item covers the disabled guard.</en></lang>
    const tabs = mount(UTabs, {
      props: {
        modelValue: 'first',
        current: 1,
        items: [
          { label: 'First item', value: 'first' },
          { label: 'Current item', value: 'current' },
          { label: 'Disabled item', value: 'disabled', disabled: true }
        ],
        list: [{ label: 'Ignored list item', value: 'ignored' }],
        'onUpdate:modelValue': (value) => eventOrder.push(['update:modelValue', value]),
        onChange: (value) => eventOrder.push(['change', value])
      }
    });

    // <lang><zh-CN>非空 items 隐藏 list alias，且 current 索引明确覆盖 modelValue 活动态。</zh-CN><en>Nonempty items hides the list alias, and the current index explicitly overrides modelValue active state.</en></lang>
    const controls = tabs.findAll('button.u-tabs__item');
    expect(controls).toHaveLength(3);
    expect(tabs.text()).not.toContain('Ignored list item');
    expect(controls[1].classes()).toContain('u-tabs__item--active');

    // <lang><zh-CN>当前与禁用点击均保持 caller listener 和组件 emit 为空。</zh-CN><en>Current and disabled clicks both keep caller listeners and component emits empty.</en></lang>
    await controls[1].trigger('click');
    await controls[2].trigger('click');
    expect(eventOrder).toEqual([]);

    // <lang><zh-CN>点击首项报告其 value，并严格复用 update 后 change 的顺序。</zh-CN><en>Clicking the first item reports its value and strictly reuses update-then-change order.</en></lang>
    await controls[0].trigger('click');
    expect(eventOrder).toEqual([['update:modelValue', 'first'], ['change', 'first']]);
    expect(tabs.emitted('update:modelValue')).toEqual([['first']]);
    expect(tabs.emitted('change')).toEqual([['first']]);
  });

  /**
   * @lang zh-CN 验证 list alias 与 exposed clickTab 的索引/value 解析、guard 和精确事件顺序。
   * @lang en Verifies list alias and exposed clickTab index/value resolution, guards, and exact event order.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；实例调用与 prop 更新后解决。</zh-CN><en>No return value; resolves after instance calls and prop updates.</en></lang>
   */
  it('keeps clickTab bounded to the current finite list', async () => {
    // <lang><zh-CN>imperative listener 顺序独立验证 clickTab 与模板点击共享 update→change contract。</zh-CN><en>The imperative listener order independently verifies clickTab shares the template click update→change contract.</en></lang>
    const eventOrder = [];

    // <lang><zh-CN>alias-only 列表包含当前、合法下一项和禁用项，覆盖 imperative guard 的全部边界。</zh-CN><en>The alias-only list contains current, valid-next, and disabled items, covering all imperative guard boundaries.</en></lang>
    const tabs = mount(UTabs, {
      props: {
        modelValue: 'first',
        list: [
          { label: 'Alias first', value: 'first' },
          { label: 'Alias second', value: 'second' },
          { label: 'Alias disabled', value: 'disabled', disabled: true }
        ],
        'onUpdate:modelValue': (value) => eventOrder.push(['update:modelValue', value]),
        onChange: (value) => eventOrder.push(['change', value])
      }
    });

    // <lang><zh-CN>空 items 时 list 被完整投影，且 clickTab 作为唯一实例方法可调用。</zh-CN><en>When items is empty, list is fully projected and clickTab is callable as the sole instance method.</en></lang>
    expect(tabs.findAll('button.u-tabs__item')).toHaveLength(3);
    expect(typeof tabs.vm.clickTab).toBe('function');

    // <lang><zh-CN>当前索引、禁用索引、越界、负数、非整数和未知 value 均保持零事件。</zh-CN><en>The current index, disabled index, out-of-range, negative, noninteger, and unknown value all retain zero events.</en></lang>
    tabs.vm.clickTab(0);
    tabs.vm.clickTab(2);
    tabs.vm.clickTab(9);
    tabs.vm.clickTab(-1);
    tabs.vm.clickTab(1.5);
    tabs.vm.clickTab('missing');
    expect(tabs.emitted('update:modelValue')).toBeUndefined();
    expect(tabs.emitted('change')).toBeUndefined();

    // <lang><zh-CN>合法数字只按索引 1 映射第二项，两个事件使用同一个字符串 value。</zh-CN><en>A valid number maps the second item only by index 1, with both events using the same string value.</en></lang>
    tabs.vm.clickTab(1);
    expect(eventOrder).toEqual([['update:modelValue', 'second'], ['change', 'second']]);
    expect(tabs.emitted('update:modelValue')).toEqual([['second']]);
    expect(tabs.emitted('change')).toEqual([['second']]);

    // <lang><zh-CN>调用方写回 modelValue 后，精确 value 候选识别为当前项并保持事件数量不变。</zh-CN><en>After the caller writes modelValue back, an exact value candidate is recognized as current and keeps event counts unchanged.</en></lang>
    await tabs.setProps({ modelValue: 'second' });
    tabs.vm.clickTab('second');
    expect(eventOrder).toEqual([['update:modelValue', 'second'], ['change', 'second']]);
    expect(tabs.emitted('update:modelValue')).toEqual([['second']]);
    expect(tabs.emitted('change')).toEqual([['second']]);

    // <lang><zh-CN>另一个非数字 value 严格匹配首项并再次保持 update→change 的成对 payload。</zh-CN><en>Another nonnumeric value strictly matches the first item and again retains paired update→change payloads.</en></lang>
    tabs.vm.clickTab('first');
    expect(eventOrder).toEqual([
      ['update:modelValue', 'second'],
      ['change', 'second'],
      ['update:modelValue', 'first'],
      ['change', 'first']
    ]);
    expect(tabs.emitted('update:modelValue')).toEqual([['second'], ['first']]);
    expect(tabs.emitted('change')).toEqual([['second'], ['first']]);
  });
});

/**
 * @lang zh-CN 验证 notice-bar 的 list/current 单项投影、text 回退与不计时的原始 click/close payload。
 * @lang en Verifies notice-bar list/current single-item projection, text fallback, and untimed original click/close payloads.
 */
describe('P68 controlled notice-bar runtime behavior', () => {
  /**
   * @lang zh-CN 验证非空 list 覆盖 text、索引确定性回退、click 第二参数与 close 单参数。
   * @lang en Verifies nonempty list overrides text, deterministic index fallback, click second argument, and single-argument close.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；点击与 prop 更新后解决。</zh-CN><en>No return value; resolves after clicks and prop updates.</en></lang>
   */
  it('projects one list item and preserves raw event payload positions', async () => {
    // <lang><zh-CN>current 数字字符串选择第二条通知；text 仅是 list 清空后的回退。</zh-CN><en>A numeric-string current selects the second notice; text is only a fallback after list is emptied.</en></lang>
    const notice = mount(UNoticeBar, {
      props: {
        text: 'Fallback notice',
        list: ['First notice', 'Second notice'],
        current: '1',
        closeText: 'Dismiss',
        tone: 'unsupported-tone'
      }
    });

    // <lang><zh-CN>横幅只呈现当前 list 项，并把未知 tone 收束到 info class。</zh-CN><en>The banner presents only the current list item and constrains an unknown tone to the info class.</en></lang>
    expect(notice.get('button.u-notice-bar__text').text()).toBe('Second notice');
    expect(notice.text()).not.toContain('Fallback notice');
    expect(notice.get('.u-notice-bar').classes()).toContain('u-notice-bar--info');

    // <lang><zh-CN>正文 click 保留原始 MouseEvent 第一参数并追加当前索引 1；close 仍只有原始第一参数。</zh-CN><en>The body click keeps the original MouseEvent first and appends current index 1; close still has only the original first argument.</en></lang>
    await notice.get('button.u-notice-bar__text').trigger('click');
    await notice.get('button.u-notice-bar__close').trigger('click');
    const clickEvents = notice.emitted('click');
    const closeEvents = notice.emitted('close');
    expect(clickEvents).toHaveLength(1);
    expect(clickEvents[0]).toHaveLength(2);
    expect(clickEvents[0][0]).toBeInstanceOf(MouseEvent);
    expect(clickEvents[0][1]).toBe(1);
    expect(closeEvents).toHaveLength(1);
    expect(closeEvents[0]).toHaveLength(1);
    expect(closeEvents[0][0]).toBeInstanceOf(MouseEvent);

    // <lang><zh-CN>越界 current 确定性回退首项；组件不自动前进或修改 current。</zh-CN><en>An out-of-range current deterministically falls back to the first item; the component neither advances automatically nor modifies current.</en></lang>
    await notice.setProps({ current: 99 });
    expect(notice.get('button.u-notice-bar__text').text()).toBe('First notice');

    // <lang><zh-CN>清空 list 恢复既有 text 路径；该路径的稳定 click 索引为 0。</zh-CN><en>Emptying list restores the existing text path; that path uses stable click index 0.</en></lang>
    await notice.setProps({ list: [] });
    expect(notice.get('button.u-notice-bar__text').text()).toBe('Fallback notice');
    await notice.get('button.u-notice-bar__text').trigger('click');
    expect(notice.emitted('click')[1][1]).toBe(0);
  });

  /**
   * @lang zh-CN 验证 visible/show 优先级、空内容与缺少 closeText 时都不产生虚假交互面。
   * @lang en Verifies visible/show precedence, empty content, and missing closeText produce no false interaction surface.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；prop 更新后解决。</zh-CN><en>No return value; resolves after prop updates.</en></lang>
   */
  it('keeps visibility and empty-content guards caller controlled', async () => {
    // <lang><zh-CN>空 text/list 即使 show=true 也不输出 banner，因此没有可触发的 click/close control。</zh-CN><en>Empty text/list outputs no banner even with show=true, leaving no click/close control to trigger.</en></lang>
    const notice = mount(UNoticeBar, { props: { show: true, text: '', list: [], closeText: '' } });
    expect(notice.find('.u-notice-bar').exists()).toBe(false);
    expect(notice.emitted('click')).toBeUndefined();
    expect(notice.emitted('close')).toBeUndefined();

    // <lang><zh-CN>增加 text 后 banner 可见但无 close control；显式 visible=false 随后覆盖 show=true。</zh-CN><en>Adding text makes the banner visible without a close control; explicit visible=false then overrides show=true.</en></lang>
    await notice.setProps({ text: 'Caller notice' });
    expect(notice.find('.u-notice-bar').exists()).toBe(true);
    expect(notice.find('button.u-notice-bar__close').exists()).toBe(false);
    await notice.setProps({ visible: false });
    expect(notice.find('.u-notice-bar').exists()).toBe(false);
  });
});
