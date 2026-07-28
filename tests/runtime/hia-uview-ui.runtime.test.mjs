import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createApp } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import HiaUView, { HiaButton, HIA_UVIEW_COMPONENTS } from '../../HIA-uView-UI/src/index.mjs';

/**
 * @module hia-uview-ui.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证 HiaButton 的首轮交互与显式 plugin 边界；测试不启动 Vitest UI/API、Vite dev server 或任何网络服务。
 * @lang en Uses a real Vue runtime to verify first-slice HiaButton interaction and explicit-plugin boundaries; tests start no Vitest UI/API, Vite dev server, or network service.
 */

describe('HiaButton runtime behavior', () => {
  /**
   * @lang zh-CN 验证启用状态只触发一次 click，而 disabled/loading 状态保持可见标签并抑制事件。
   * @lang en Verifies that the enabled state emits one click while disabled/loading states retain visible labels and suppress events.
   */
  it('emits only while enabled and not loading', async () => {
    const enabled = mount(HiaButton, { props: { label: 'Save draft' } });
    await enabled.get('button').trigger('click');
    expect(enabled.emitted('click')).toHaveLength(1);

    const disabled = mount(HiaButton, { props: { disabled: true, label: 'Unavailable' } });
    await disabled.get('button').trigger('click');
    expect(disabled.text()).toContain('Unavailable');
    expect(disabled.emitted('click')).toBeUndefined();

    const loading = mount(HiaButton, { props: { loading: true, label: 'Saving' } });
    await loading.get('button').trigger('click');
    expect(loading.text()).toContain('加载中…');
    expect(loading.emitted('click')).toBeUndefined();
  });

  /**
   * @lang zh-CN 验证默认插槽文字与自定义 loadingText 可替代 prop 标签，但不扩大为任意布局或图标按钮能力。
   * @lang en Verifies that default-slot text and custom loadingText can replace prop labels without expanding into arbitrary-layout or icon-button capability.
   */
  it('renders the documented text-slot and loading-text alternatives', () => {
    const slotted = mount(HiaButton, { slots: { default: 'Slot action text' } });
    const loading = mount(HiaButton, { props: { loading: true, loadingText: 'Synchronizing local data' } });

    expect(slotted.text()).toContain('Slot action text');
    expect(loading.text()).toContain('Synchronizing local data');
  });
});

/**
 * @lang zh-CN 验证 plugin 只有被显式传给 Vue application 时才注册组件，且 runtime entry 不隐式导入全局 style entry。
 * @lang en Verifies that the plugin registers components only when explicitly given to a Vue application and that the runtime entry does not import the global style entry implicitly.
 */
it('keeps registration and style consumption explicit', async () => {
  const application = createApp({ template: '<div />' });

  expect(application.component('HiaButton')).toBeUndefined();
  application.use(HiaUView);
  expect(application.component('HiaButton')).toBe(HiaButton);
  expect(HIA_UVIEW_COMPONENTS).toHaveLength(1);

  const runtimeEntry = await readFile(resolve('HIA-uView-UI/src/index.mjs'), 'utf8');
  expect(runtimeEntry).not.toContain("./style.css");
});
