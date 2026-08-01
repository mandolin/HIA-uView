/**
 * @module hia-uview-p44.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证 P44 列表、加载更多、骨架、折叠、轮播、横向滚动和吸顶的局部受控行为；不启动平台 API、网络或 dev server。
 * @lang en Uses the real Vue runtime to verify local controlled behavior of P44 list, load-more, skeleton, collapse, swiper, horizontal-scroll, and sticky components; it starts no platform API, network, or dev server.
 */

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { UCollapse, UCollapseItem, UList, ULoadmore, UScrollList, USkeleton, USticky, USwiper } from '../../HIA-uView-UI/src/index.mjs';

describe('P44 local content components', () => {
  it('keeps list and loadmore caller-controlled', async () => {
    const list = mount(UList, { props: { items: [{ label: 'Row one', value: 'one' }] } });
    await list.get('button.u-list__item').trigger('click');
    expect(list.emitted('select')).toEqual([[{ value: 'one', index: 0 }]]);

    const loadmore = mount(ULoadmore, { props: { status: 'more' } });
    await loadmore.get('button').trigger('click');
    expect(loadmore.emitted('loadmore')).toHaveLength(1);
    await loadmore.setProps({ status: 'loading' });
    expect(loadmore.find('button').exists()).toBe(false);
    expect(loadmore.emitted('loadmore')).toHaveLength(1);
  });

  it('keeps skeleton and sticky static', async () => {
    const skeleton = mount(USkeleton, { props: { loading: true, rows: 2 }, slots: { default: 'Ready content' } });
    expect(skeleton.findAll('.u-skeleton__row')).toHaveLength(2);
    expect(skeleton.text()).not.toContain('Ready content');
    await skeleton.setProps({ loading: false });
    expect(skeleton.text()).toContain('Ready content');

    const sticky = mount(USticky, { props: { offsetTop: 12 }, slots: { default: 'Sticky content' } });
    expect(sticky.get('.u-sticky').attributes('style')).toContain('top: 12px');
    await sticky.setProps({ disabled: true });
    expect(sticky.get('.u-sticky').classes()).toContain('u-sticky--disabled');
  });

  it('coordinates collapse through caller-owned values only', async () => {
    const wrapper = mount(UCollapse, {
      props: { modelValue: [] },
      slots: {
        default: () => [
          h(UCollapseItem, { name: 'one', title: 'One' }, { default: () => 'One content' }),
          h(UCollapseItem, { name: 'two', title: 'Two' }, { default: () => 'Two content' })
        ]
      }
    });
    await wrapper.findAll('button.u-collapse-item__header')[0].trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[['one']]]);
    expect(wrapper.find('.u-collapse-item__content').exists()).toBe(false);
  });

  it('keeps swiper and horizontal list explicit', async () => {
    const swiper = mount(USwiper, { props: { items: [{ label: 'One', value: 'one' }, { label: 'Two', value: 'two' }] } });
    await swiper.findAll('button')[1].trigger('click');
    expect(swiper.emitted('update:modelValue')).toEqual([[1]]);
    expect(swiper.emitted('change')).toEqual([[{ index: 1, value: 'two' }]]);

    const scrollList = mount(UScrollList, { props: { items: [{ label: 'Horizontal', value: 'h' }] } });
    await scrollList.get('button.u-scroll-list__item').trigger('click');
    expect(scrollList.emitted('select')).toEqual([[{ value: 'h', index: 0 }]]);
  });
});
