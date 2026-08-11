/**
 * @module hia-uview-form-runtime.test
 * @lang zh-CN 直接验证 P66 无框架表单原语的安全路径、快照与确定性规则执行；测试不挂载 Vue、不读取网络或存储，也不执行 manifest/JSON 中的代码。
 * @lang en Directly verifies safe paths, snapshots, and deterministic rule execution in the P66 framework-free form primitives; tests do not mount Vue, read network or storage, or execute code from manifests or JSON.
 */

// <lang><zh-CN>导入 Vitest 断言与被测纯函数；测试没有全局 plugin 或平台 mock。</zh-CN><en>Imports Vitest assertions and the pure functions under test; the suite has no global plugin or platform mock.</en></lang>
import { describe, expect, it } from 'vitest';
import {
  canonicalFieldPath,
  cloneFieldValue,
  normalizeFieldPath,
  readFieldValue,
  validateFormValue,
  writeFieldValue
} from '../../HIA-uView-UI/src/components/u-form/form-runtime.mjs';

/**
 * @lang zh-CN 验证 dotted/index 路径只访问 own property，并完整拒绝原型污染与不完整语法。
 * @lang en Verifies that dotted/index paths access own properties only and fully reject prototype-pollution and incomplete syntax.
 */
describe('P66 safe form paths', () => {
  /**
   * @lang zh-CN 验证点号、数字 bracket 和数组索引采用同一 canonical key，并能读写既有字段。
   * @lang en Verifies that dots, numeric brackets, and array indexes share one canonical key and can read/write an existing field.
   */
  it('normalizes and updates existing dotted/index fields', () => {
    // <lang><zh-CN>模型含嵌套数组，覆盖首个交付的 `items.0.name` 场景。</zh-CN><en>The model contains a nested array, covering the initial `items.0.name` delivery scenario.</en></lang>
    const model = { items: [{ name: 'Initial' }] };

    expect(normalizeFieldPath('items[0].name')).toEqual(['items', '0', 'name']);
    expect(canonicalFieldPath('items[0].name')).toBe('items.0.name');
    expect(readFieldValue(model, 'items.0.name')).toEqual({ found: true, value: 'Initial' });
    expect(writeFieldValue(model, 'items[0].name', 'Restored')).toBe(true);
    expect(model.items[0].name).toBe('Restored');
  });

  /**
   * @lang zh-CN 验证危险、空段、非数字 bracket 与不存在路径均保持零写入。
   * @lang en Verifies that dangerous, empty-segment, nonnumeric-bracket, and missing paths all retain zero writes.
   */
  it('rejects dangerous or missing paths without partial writes', () => {
    // <lang><zh-CN>无原型对象使污染断言不依赖测试环境的 Object.prototype 初始状态。</zh-CN><en>A null-prototype object keeps the pollution assertion independent of the test environment's initial Object.prototype state.</en></lang>
    const model = Object.create(null);
    model.profile = { name: 'Safe' };

    // <lang><zh-CN>三类 prototype key 与不完整语法必须整体失败。</zh-CN><en>All three prototype keys and incomplete syntax must fail as a whole.</en></lang>
    for (const path of ['__proto__.polluted', 'profile.constructor.name', 'profile.prototype.name', 'profile..name', 'profile[name]']) {
      expect(normalizeFieldPath(path)).toEqual([]);
      expect(writeFieldValue(model, path, 'Blocked')).toBe(false);
    }

    expect(writeFieldValue(model, 'profile.missing', 'Blocked')).toBe(false);
    expect(model.profile).toEqual({ name: 'Safe' });
    expect({}.polluted).toBeUndefined();
  });
});

/**
 * @lang zh-CN 验证 reset 快照只深拷贝数组和普通对象，并保持循环结构稳定。
 * @lang en Verifies that reset snapshots deep-clone only arrays and plain objects while keeping circular structures stable.
 */
describe('P66 reset snapshots', () => {
  /**
   * @lang zh-CN 验证嵌套普通值与循环引用获得独立可恢复快照。
   * @lang en Verifies that nested plain values and a circular reference receive an independent restorable snapshot.
   */
  it('clones JSON-like values without recursion overflow', () => {
    // <lang><zh-CN>源值包含数组、对象与自引用，覆盖 clone cache。</zh-CN><en>The source contains an array, object, and self-reference, covering the clone cache.</en></lang>
    const source = { names: ['A'], nested: { count: 1 } };
    source.self = source;

    // <lang><zh-CN>快照应与源对象分离，但自引用仍指向快照自身。</zh-CN><en>The snapshot should be separate from the source while its self-reference points to the snapshot itself.</en></lang>
    const snapshot = cloneFieldValue(source);
    source.names.push('B');
    source.nested.count = 2;

    expect(snapshot).not.toBe(source);
    expect(snapshot.names).toEqual(['A']);
    expect(snapshot.nested).toEqual({ count: 1 });
    expect(snapshot.self).toBe(snapshot);
  });
});

/**
 * @lang zh-CN 验证规则顺序、trigger 过滤、内置约束与同步/异步 validator 的确定失败边界。
 * @lang en Verifies deterministic failure boundaries for rule order, trigger filtering, built-in constraints, and synchronous/asynchronous validators.
 */
describe('P66 rule execution', () => {
  /**
   * @lang zh-CN 验证 required 在首位失败并保留调用方本地化文字与规则索引。
   * @lang en Verifies that required fails first and retains caller-localized copy and rule index.
   */
  it('returns the first ordered built-in error', async () => {
    // <lang><zh-CN>上下文只含字段、模型和显式整体验证 trigger。</zh-CN><en>The context contains only field, model, and the explicit whole-validation trigger.</en></lang>
    const context = { field: 'profile.name', model: { profile: { name: '' } }, trigger: '' };
    const rules = [
      { required: true, message: 'Name is required' },
      { min: 3, message: 'Name is too short' }
    ];

    await expect(validateFormValue('', rules, context)).resolves.toEqual({
      code: 'required',
      message: 'Name is required',
      prop: 'profile.name',
      ruleIndex: 0,
      trigger: ''
    });
  });

  /**
   * @lang zh-CN 验证交互 trigger 只运行显式匹配规则，整体验证仍运行全部规则。
   * @lang en Verifies that an interaction trigger runs only explicitly matching rules while whole validation still runs all rules.
   */
  it('filters interaction rules without weakening explicit validation', async () => {
    // <lang><zh-CN>无 trigger 的 required 不应在 change 自动执行，但应在显式 validate 执行。</zh-CN><en>The required rule without a trigger should not auto-run on change but should run during explicit validate.</en></lang>
    const rules = [
      { required: true, message: 'Required only on submit' },
      { min: 2, message: 'Change minimum', trigger: 'change' }
    ];
    const model = { code: '' };

    await expect(validateFormValue('', rules, { field: 'code', model, trigger: 'change' })).resolves.toBeNull();
    await expect(validateFormValue('', rules, { field: 'code', model, trigger: '' })).resolves.toMatchObject({ code: 'required' });
  });

  /**
   * @lang zh-CN 验证 Promise validator 结果和异常均转换为稳定错误，不产生未处理 rejection。
   * @lang en Verifies that Promise validator results and exceptions become stable errors without unhandled rejections.
   */
  it('handles async outcomes and exceptions deterministically', async () => {
    // <lang><zh-CN>第一个异步规则显式返回文字，应阻止后续规则执行。</zh-CN><en>The first async rule explicitly returns copy and should stop later rules from running.</en></lang>
    let laterRuleCalls = 0;
    const rules = [
      { asyncValidator: async () => 'Already reserved' },
      { validator: () => { laterRuleCalls += 1; return true; } }
    ];

    await expect(validateFormValue('A', rules, { field: 'code', model: { code: 'A' }, trigger: '' })).resolves.toMatchObject({
      code: 'validator',
      message: 'Already reserved',
      ruleIndex: 0
    });
    expect(laterRuleCalls).toBe(0);

    // <lang><zh-CN>抛出的 Error 转换为 validator-exception，调用方 rule message 仍具有优先级。</zh-CN><en>A thrown Error becomes validator-exception while caller rule copy retains precedence.</en></lang>
    const throwingRule = { message: 'Caller-safe failure', validator: () => { throw new Error('Internal detail'); } };
    await expect(validateFormValue('A', throwingRule, { field: 'code', model: { code: 'A' }, trigger: '' })).resolves.toMatchObject({
      code: 'validator-exception',
      message: 'Caller-safe failure'
    });
  });
});
