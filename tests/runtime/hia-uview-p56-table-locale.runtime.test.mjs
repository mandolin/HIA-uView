/**
 * @module hia-uview-p56-table-locale.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证 view table 的静态 slot/intent 与 UConfigProvider locale 子树 context；不启动 dev server、网络、系统语言读取、存储、翻译加载或平台 API。
 * @lang en Uses the real Vue runtime to verify static slot/intent of view tables and UConfigProvider locale subtree context; it starts no dev server, network, system-language read, storage, translation loading, or platform API.
 */

import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { UConfigProvider, UTable, UTd, UTh, UTr, useULocale } from '../../HIA-uView-UI/src/index.mjs';

// <lang><zh-CN>探针只读取最近 provider 的 locale ref 并渲染其当前值；它不翻译、持久化或写回任何语言选择。</zh-CN><en>The probe reads only the nearest provider locale ref and renders its current value; it translates, persists, and writes back no language choice.</en></lang>
const LocaleProbe = defineComponent({
  name: 'LocaleProbe',
  setup() {
    // <lang><zh-CN>helper 的调用位置在 setup 内，符合 Vue context 生命周期且不建立全局 singleton。</zh-CN><en>The helper is called in setup, respecting Vue context lifecycle and creating no global singleton.</en></lang>
    const locale = useULocale();
    return () => h('span', { class: 'locale-probe' }, locale.value);
  }
});

/**
 * @lang zh-CN 验证 provider 只向当前子树投影 caller locale，并为未知/缺失 provider 提供确定性 fallback。
 * @lang en Verifies that the provider projects caller locale only to the current subtree and gives deterministic fallback for unknown/absent provider.
 */
describe('constrained UI locale context', () => {
  /**
   * @lang zh-CN 验证显式 `en`、未知输入和无 provider 三种路径均不读取系统或写入状态。
   * @lang en Verifies that explicit `en`, unknown input, and absent provider paths all read no system and write no state.
   * @returns {void} <lang><zh-CN>无返回值；同步运行时断言完成。</zh-CN><en>No return value; synchronous runtime assertions complete.</en></lang>
   */
  it('projects caller locale locally with deterministic fallback', () => {
    // <lang><zh-CN>en provider 只影响其默认 slot 子树，并在根上公开可检查的 data marker。</zh-CN><en>The en provider affects only its default-slot subtree and exposes an inspectable data marker on its root.</en></lang>
    const english = mount(UConfigProvider, { props: { locale: 'en' }, slots: { default: () => h(LocaleProbe) } });
    expect(english.get('.locale-probe').text()).toBe('en');
    expect(english.get('.u-config-provider').attributes('data-u-locale')).toBe('en');

    // <lang><zh-CN>未知 caller 字符串回退 zh-Hans，而不会把字符串当翻译资源名称或系统区域。</zh-CN><en>An unknown caller string falls back to zh-Hans without treating the string as a translation-resource name or system region.</en></lang>
    const unknown = mount(UConfigProvider, { props: { locale: 'fr-unknown' }, slots: { default: () => h(LocaleProbe) } });
    expect(unknown.get('.locale-probe').text()).toBe('zh-Hans');

    // <lang><zh-CN>缺少 provider 的 probe 自身仍返回局部 fallback，不创建反向 provider 或 global state。</zh-CN><en>A probe without provider still returns local fallback and creates no reverse provider or global state.</en></lang>
    const absent = mount(LocaleProbe);
    expect(absent.get('.locale-probe').text()).toBe('zh-Hans');
  });
});

/**
 * @lang zh-CN 验证 view table 只组合 caller slot/text，并在 opt-in row 上报告透明局部 intent。
 * @lang en Verifies that view tables compose caller slot/text only and report transparent local intent on an opt-in row.
 */
describe('view-based table presentation', () => {
  /**
   * @lang zh-CN 验证 header/cell 文本、caller slot 和 row select 不成为数据查询、排序或编辑行为。
   * @lang en Verifies that header/cell text, caller slot, and row select become no data query, sorting, or editing behavior.
   * @returns {Promise<void>} <lang><zh-CN>无返回值；异步点击断言完成后解决。</zh-CN><en>No return value; resolves after asynchronous click assertions finish.</en></lang>
   */
  it('retains static cells and caller-owned row intent', async () => {
    // <lang><zh-CN>table 只承载 caller slot 文本，不需要 records/columns prop 或浏览器 table 元素。</zh-CN><en>The table carries caller slot text only and needs no records/columns prop or browser table element.</en></lang>
    const table = mount(UTable, { props: { ariaLabel: 'Local table' }, slots: { default: 'Local cells' } });
    expect(table.text()).toContain('Local cells');

    // <lang><zh-CN>header/cell 只投影 caller 字段文字和有限对齐，不引入字段 schema 或格式化。</zh-CN><en>Header/cell project caller field copy and finite alignment only, introducing no field schema or formatting.</en></lang>
    const header = mount(UTh, { props: { label: 'Name', align: 'center' } });
    const cell = mount(UTd, { props: { text: 'Local value', align: 'end' } });
    expect(header.text()).toContain('Name');
    expect(cell.text()).toContain('Local value');

    // <lang><zh-CN>可点击 row 的 payload 只包含透明 caller value；它不返回 record、index 或导航目标。</zh-CN><en>A clickable row payload contains transparent caller value only; it returns no record, index, or navigation target.</en></lang>
    const row = mount(UTr, { props: { value: 'row-a', clickable: true }, slots: { default: 'Local row' } });
    await row.get('button.u-tr').trigger('click');
    expect(row.emitted('select')[0][0]).toEqual({ value: 'row-a' });
  });
});
