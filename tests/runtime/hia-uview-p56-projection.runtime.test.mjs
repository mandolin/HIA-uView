/**
 * @module hia-uview-p56-projection.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证 caller-owned 索引、延迟图片、有限选择、静态 panel 和确定性列的本地呈现/intent；不启动 dev server、网络、scroll、viewport、平台 API 或计时器。
 * @lang en Uses the real Vue runtime to verify local presentation/intent for caller-owned index, deferred image, finite selection, static panel, and deterministic columns; it starts no dev server, network, scroll, viewport, platform API, or timer.
 */

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { UIndexAnchor, UIndexList, ULazyLoad, USubsection, UTabsSwiper, UWaterfall } from '../../HIA-uView-UI/src/index.mjs';

/**
 * @lang zh-CN 验证 index controls 只报告 caller 候选，不测量或驱动滚动。
 * @lang en Verifies that index controls report caller candidates only and neither measure nor drive scrolling.
 */
describe('controlled index projection', () => {
  /**
   * @lang zh-CN 验证单锚点和有限索引组分别报告透明 value，不改变 caller active state。
   * @lang en Verifies that one anchor and finite index groups respectively report transparent values without changing caller active state.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；运行时断言完成后解决。</zh-CN><en>No return value; resolves after runtime assertions finish.</en></lang>
   */
  it('reports finite anchor selection without scroll ownership', async () => {
    // <lang><zh-CN>单锚点带有限 caller value；click 只形成局部 intent。</zh-CN><en>The one anchor carries a finite caller value; click forms local intent only.</en></lang>
    const anchor = mount(UIndexAnchor, { props: { label: 'Local', value: 'local', active: true } });
    await anchor.get('button.u-index-anchor').trigger('click');
    expect(anchor.emitted('select')[0][0]).toEqual({ value: 'local', label: 'Local' });

    // <lang><zh-CN>索引组不需要 content/scroll container 即可转发已启用 group 候选。</zh-CN><en>The index group needs no content/scroll container to forward an enabled group candidate.</en></lang>
    const list = mount(UIndexList, { props: { groups: [{ label: 'First', value: 'first' }, { label: 'Second', value: 'second' }], activeValue: 'first' } });
    await list.findAll('button.u-index-anchor')[1].trigger('click');
    expect(list.emitted('select')[0][0]).toEqual({ value: 'second', label: 'Second' });
  });
});

/**
 * @lang zh-CN 验证 deferred image 只由 caller active 创建，而有限区段/面板只报告下一候选。
 * @lang en Verifies that deferred image is created only by caller active while finite segments/panel report next candidates only.
 */
describe('controlled deferred and finite selection projection', () => {
  /**
   * @lang zh-CN 验证 inactive placeholder 与区段/tab-panel intent，不引入图片请求或自动 panel 转换。
   * @lang en Verifies inactive placeholder and segment/tab-panel intent, introducing neither image request nor automatic panel transition.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；运行时断言完成后解决。</zh-CN><en>No return value; resolves after runtime assertions finish.</en></lang>
   */
  it('retains caller control over image creation and selection writeback', async () => {
    // <lang><zh-CN>inactive 且空 src 的实例只能呈现 caller placeholder，绝不创建原生 image。</zh-CN><en>An inactive empty-src instance can present caller placeholder only and never creates a native image.</en></lang>
    const lazy = mount(ULazyLoad, { props: { active: false, src: '', placeholderText: 'Local placeholder' } });
    expect(lazy.text()).toContain('Local placeholder');
    expect(lazy.find('image.u-lazy-load__image').exists()).toBe(false);

    // <lang><zh-CN>子区段第二项是明确 caller 候选，组件不自行写回 props。</zh-CN><en>The second subsection item is an explicit caller candidate; the component writes no prop itself.</en></lang>
    const subsection = mount(USubsection, { props: { items: [{ label: 'First', value: 'first' }, { label: 'Second', value: 'second' }], modelValue: 'first' } });
    await subsection.findAll('button.u-subsection__item')[1].trigger('click');
    expect(subsection.emitted('update:modelValue')[0][0]).toBe('second');
    expect(subsection.emitted('change')[0][0]).toBe('second');

    // <lang><zh-CN>静态 panel 的 next 只报告下一项候选，不创建原生 swiper 或改变当前 prop。</zh-CN><en>The static panel's next reports only the next candidate and creates no native swiper or current-prop change.</en></lang>
    const tabsSwiper = mount(UTabsSwiper, { props: { items: [{ label: 'First', value: 'first' }, { label: 'Second', value: 'second' }], modelValue: 'first', nextText: 'Next' } });
    await tabsSwiper.get('button.u-tabs-swiper__control').trigger('click');
    expect(tabsSwiper.emitted('next')[0][0]).toEqual({ value: 'second', index: 1 });
  });
});

/**
 * @lang zh-CN 验证确定性列不依赖高度或资源状态，并返回透明 local item 候选。
 * @lang en Verifies that deterministic columns depend on no height or resource state and return transparent local-item candidates.
 */
describe('controlled deterministic column projection', () => {
  /**
   * @lang zh-CN 验证三项在两列 round-robin 中保持可预测顺序，点击第三项报告原始 index 与零列。
   * @lang en Verifies that three items retain predictable two-column round-robin order and clicking the third reports original index and zero column.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；运行时断言完成后解决。</zh-CN><en>No return value; resolves after runtime assertions finish.</en></lang>
   */
  it('projects finite cards by stable round robin without measurement', async () => {
    // <lang><zh-CN>三个文字项不含高度、图片或数据源，足以证明固定索引分配。</zh-CN><en>The three text items contain no height, image, or data source and suffice to prove fixed index allocation.</en></lang>
    const waterfall = mount(UWaterfall, { props: { columnCount: 2, items: [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }, { label: 'C', value: 'c' }] } });
    const cards = waterfall.findAll('button.u-waterfall__item');
    expect(cards).toHaveLength(3);
    // <lang><zh-CN>第三项在 round-robin 后位于第一列的第二张卡；DOM 列优先顺序不同于原始 items 顺序。</zh-CN><en>After round robin, the third item is the second card in the first column; DOM column-first order differs from original items order.</en></lang>
    await waterfall.findAll('.u-waterfall__column')[0].findAll('button.u-waterfall__item')[1].trigger('click');
    expect(waterfall.emitted('select')[0][0].index).toBe(2);
    expect(waterfall.emitted('select')[0][0].columnIndex).toBe(0);
  });
});
