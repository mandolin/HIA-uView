/**
 * @module hia-uview-p56-presentation.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证数值、公告、剩余时间、局部全屏、步骤和时间线的受控呈现及局部 intent；不启动 dev server、网络、路由、平台 API、原生全屏或计时器。
 * @lang en Uses the real Vue runtime to verify controlled presentation and local intent for numeric, notice, remaining-time, local-fullscreen, step, and timeline components; it starts no dev server, network, router, platform API, native fullscreen, or timer.
 */

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { UCircleProgress, UColumnNotice, UCountDown, UFullScreen, URowNotice, UStep, UTimeLine, UTimeLineItem } from '../../HIA-uView-UI/src/index.mjs';

/**
 * @lang zh-CN 验证数值和静态时间组件仅投影 caller input，既不解释业务也不自行推进。
 * @lang en Verifies that numeric and static-time components project caller input only, neither interpreting business nor advancing themselves.
 */
describe('controlled numeric and remaining-time presentation', () => {
  /**
   * @lang zh-CN 验证进度钳制、静态倒计时分解及数字文本保持可读。
   * @lang en Verifies progress clamping, static countdown decomposition, and readable numeric text.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；运行时断言完成后解决。</zh-CN><en>No return value; resolves after runtime assertions finish.</en></lang>
   */
  it('projects finite values without animation or clock ownership', async () => {
    // <lang><zh-CN>超额 caller 值只被投影为最大百分比，不被写回也不创建任务语义。</zh-CN><en>An excessive caller value is projected only as the maximum percentage; it is neither written back nor made into task semantics.</en></lang>
    const progress = mount(UCircleProgress, { props: { value: 150, max: 80, label: 'Local progress' } });
    expect(progress.text()).toContain('100%');

    // <lang><zh-CN>90061 秒来自固定 props；四段文本必须是确定性拆分而非异步时钟结果。</zh-CN><en>90061 seconds comes from fixed props; its four text segments must be deterministic decomposition rather than an asynchronous clock result.</en></lang>
    const countdown = mount(UCountDown, { props: { remaining: 90061, separator: ':' } });
    expect(countdown.findAll('.u-count-down__segment').map((segment) => segment.text())).toEqual(['01', '01', '01', '01']);
  });
});

/**
 * @lang zh-CN 验证 notice 仅报告当前可用项目，不自行滚动、循环或修改 caller index。
 * @lang en Verifies that notices report only the current enabled item and neither scroll, loop, nor change caller index.
 */
describe('controlled notice presentation', () => {
  /**
   * @lang zh-CN 验证横向与纵向 notice 都报告有限 caller value，disabled 项保持零事件。
   * @lang en Verifies that horizontal and vertical notices both report finite caller values while disabled items retain zero events.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；运行时断言完成后解决。</zh-CN><en>No return value; resolves after runtime assertions finish.</en></lang>
   */
  it('reports current selectable notice intent only', async () => {
    // <lang><zh-CN>横向实例固定选择第二项，验证 index 不由组件推进。</zh-CN><en>The horizontal instance fixes selection on the second item, verifying that the component does not advance index.</en></lang>
    const row = mount(URowNotice, { props: { items: [{ label: 'First', value: 'first' }, { label: 'Second', value: 'second' }], activeIndex: 1 } });
    await row.get('button.u-row-notice__item').trigger('click');
    expect(row.emitted('select')[0][0].value).toBe('second');
    expect(row.emitted('select')[0][0].index).toBe(1);

    // <lang><zh-CN>纵向 disabled 实例仍可呈现文字，但不得伪造可执行选择。</zh-CN><en>The vertical disabled instance may still present copy but must not fabricate executable selection.</en></lang>
    const column = mount(UColumnNotice, { props: { items: [{ label: 'Unavailable', value: 'blocked', disabled: true }] } });
    await column.get('button.u-column-notice__item').trigger('click');
    expect(column.emitted('select')).toBeUndefined();
  });
});

/**
 * @lang zh-CN 验证局部全屏、步骤和时间线只产生 caller 可选择处理的意图，不拥有路由、流程或时间排序。
 * @lang en Verifies that local fullscreen, steps, and timeline produce only intent that callers may choose to handle and own no route, flow, or time ordering.
 */
describe('controlled local flow presentation', () => {
  /**
   * @lang zh-CN 验证受授权 backdrop close、步骤选择和时间线选择保持不同 payload，并且容器只保留 slot/list 结构。
   * @lang en Verifies that authorized backdrop close, step selection, and timeline-item selection retain distinct payloads and the container retains slot/list structure only.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；运行时断言完成后解决。</zh-CN><en>No return value; resolves after runtime assertions finish.</en></lang>
   */
  it('reports local intent without global state ownership', async () => {
    // <lang><zh-CN>可关闭 backdrop 只 emit 两种局部意图；visible 是否改变仍完全由 caller 决定。</zh-CN><en>A closable backdrop emits only two local intents; whether visible changes remains entirely caller-decided.</en></lang>
    const fullScreen = mount(UFullScreen, { props: { visible: true, title: 'Local sheet', closeOnBackdrop: true } });
    await fullScreen.get('.u-full-screen').trigger('click');
    expect(fullScreen.emitted('backdrop')).toHaveLength(1);
    expect(fullScreen.emitted('close')[0][0].source).toBe('backdrop');

    // <lang><zh-CN>步骤与 timeline 项分别携带有限 index/status 和 caller value/status，不推断下一步或下一个事件。</zh-CN><en>The step and timeline item respectively carry finite index/status and caller value/status, inferring neither a next step nor a next event.</en></lang>
    const step = mount(UStep, { props: { title: 'Local step', index: 2, status: 'process', interactive: true } });
    await step.get('button.u-step__control').trigger('click');
    expect(step.emitted('select')[0][0]).toEqual({ index: 2, status: 'process' });
    const timelineItem = mount(UTimeLineItem, { props: { title: 'Local event', value: 'event-a', status: 'accent', interactive: true } });
    await timelineItem.get('button.u-time-line-item__control').trigger('click');
    expect(timelineItem.emitted('select')[0][0]).toEqual({ value: 'event-a', status: 'accent' });

    // <lang><zh-CN>容器无需 child data 也可以呈现 caller slot，并明确保持 list 语义。</zh-CN><en>The container can render a caller slot without child data and explicitly retains list semantics.</en></lang>
    const timeline = mount(UTimeLine, { props: { ariaLabel: 'Local timeline' }, slots: { default: '<span>Local entry</span>' } });
    expect(timeline.text()).toContain('Local entry');
  });
});
