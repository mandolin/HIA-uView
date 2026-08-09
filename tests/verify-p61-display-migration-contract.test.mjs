/**
 * @module verify-p61-display-migration-contract.test
 * @lang zh-CN 锁定有限展示迁移面的 prop 形状、双可见性收敛、公开说明、compiler fixture 和 API matrix；测试只读取固定公开仓内文件，不访问上游 checkout、网络、平台 service、业务项目或设备。
 * @lang en Locks prop shapes, dual-visibility convergence, public explanations, compiler fixture, and API matrix of the bounded display migration surface; the test reads only fixed public repository files and accesses no upstream checkout, network, platform service, business project, or device.
 */

import assert from 'node:assert/strict';
// <lang><zh-CN>只读取明确列出的公开文件，避免测试通过目录发现扩大输入范围。</zh-CN><en>Reads only explicitly listed public files, avoiding input-boundary expansion through directory discovery.</en></lang>
import { readFile } from 'node:fs/promises';
// <lang><zh-CN>使用 Node 内建测试运行器保持静态契约与 Vue/平台 runtime 独立。</zh-CN><en>Uses the Node built-in test runner to keep the static contract independent from Vue/platform runtime.</en></lang>
import test from 'node:test';

/** @lang zh-CN 本批唯一可升级的精确 prop 规则。 @lang en Sole exact prop rules eligible for promotion in this batch. */
const expectedCompatibleProps = Object.freeze({
  'u-alert-tips': Object.freeze(['show']),
  'u-tag': Object.freeze(['disabled', 'show', 'text'])
});

// <lang><zh-CN>并行读取 source、contract、fixture、类型、生成器与提交矩阵，测试不重新生成或改写任何输入。</zh-CN><en>Reads source, contracts, fixture, types, generator, and committed matrix in parallel; the test regenerates or rewrites no input.</en></lang>
const [tagSource, alertSource, tagDocumentation, alertDocumentation, fixtureSource, typeSource, generatorSource, matrixSource] = await Promise.all([
  readFile('HIA-uView-UI/src/components/u-tag/u-tag.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-alert-tips/u-alert-tips.vue', 'utf8'),
  readFile('docs/tag.md', 'utf8'),
  readFile('docs/alert-tips.md', 'utf8'),
  readFile('HIA-uView-UI/fixtures/mp-weixin/src/pages/index/index.vue', 'utf8'),
  readFile('HIA-uView-UI/types/index.d.ts', 'utf8'),
  readFile('scripts/generate-api-compatibility-matrix.mjs', 'utf8'),
  readFile('HIA-uView-UI/hia-uview.api-compatibility.json', 'utf8')
]);

/** @lang zh-CN 当前提交的只读 API matrix。 @lang en Current committed read-only API matrix. */
const apiCompatibilityMatrix = JSON.parse(matrixSource);

/**
 * @lang zh-CN 取得一个 matrix 组件 record；缺失立即失败，不使用位置、alias 或模糊名称。
 * @lang en Obtains one matrix component record; absence fails immediately and no position, alias, or fuzzy name is used.
 * @param {string} componentName <lang><zh-CN>精确 kebab-case 组件名。</zh-CN><en>Exact kebab-case component name.</en></lang>
 * @returns {object} <lang><zh-CN>匹配组件 record。</zh-CN><en>Matching component record.</en></lang>
 */
function requireMatrixComponent(componentName) {
  // <lang><zh-CN>只遍历固定 matrix 数组，避免同名 prop 从另一组件误满足本批断言。</zh-CN><en>Traverses only the fixed matrix array, preventing a same-named prop from another component from satisfying this batch assertion.</en></lang>
  const component = apiCompatibilityMatrix.components.find((candidate) => candidate.name === componentName);

  assert.ok(component, `Missing API compatibility component: ${componentName}`);
  return component;
}

/**
 * @lang zh-CN 验证展示实现的有限输入只控制局部投影或本地 intent，且双可见性不会覆盖既有调用方语义。
 * @lang en Verifies that finite display inputs control only local projection or intent and that dual visibility does not override existing caller semantics.
 */
test('keeps display migration props finite, caller-controlled, and locally convergent', () => {
  // <lang><zh-CN>tag 必须同时保留 HIA visible 与迁移 show，二者取交集；数字 text 和 Boolean/String disabled 必须显式声明。</zh-CN><en>The tag must retain both HIA visible and migration show with intersection; numeric text and Boolean/String disabled must be explicit.</en></lang>
  assert.match(tagSource, /v-if="isVisible"/u);
  assert.match(tagSource, /text:\s*\{\s*type:\s*\[String,\s*Number\],\s*default:\s*''\s*\}/su);
  assert.match(tagSource, /show:\s*\{\s*type:\s*Boolean,\s*default:\s*true\s*\}/su);
  assert.match(tagSource, /disabled:\s*\{\s*type:\s*\[Boolean,\s*String\],\s*default:\s*false\s*\}/su);
  assert.match(tagSource, /const isVisible = computed\(\(\) => props\.visible && props\.show\);/u);
  assert.match(tagSource, /const displayText = computed\(\(\) => String\(props\.text\)\);/u);

  // <lang><zh-CN>alert 的 show 只控制局部 v-if，close 继续只是 caller-owned intent；不能出现 timer/global service 或自动状态写回。</zh-CN><en>The alert show controls only local v-if and close remains caller-owned intent; timer/global service or automatic state writeback cannot appear.</en></lang>
  assert.match(alertSource, /v-if="props\.show"/u);
  assert.match(alertSource, /show:\s*\{\s*type:\s*Boolean,\s*default:\s*true\s*\}/su);
  assert.match(alertSource, /defineEmits\(\['close'\]\)/u);
  assert.doesNotMatch(alertSource, /setTimeout|setInterval|fetch\(|uni\.request|localStorage|defineExpose\(/u);
});

/**
 * @lang zh-CN 验证公开 contract、package types 和 compiler fixture 都准确表达当前小面，而不把事件/slot 提升为完整上游等价。
 * @lang en Verifies that public contracts, package types, and compiler fixture accurately express the current micro-surface without upgrading events/slots into complete upstream equivalence.
 */
test('keeps display documentation, package types, and compiler fixture aligned', () => {
  // <lang><zh-CN>公开文档必须写明 show/visible 交集、禁用边界和 alert 的 caller-owned close，避免调用方猜测优先级或自动隐藏。</zh-CN><en>Public documentation must state show/visible intersection, disabled boundary, and alert caller-owned close so consumers do not guess precedence or automatic hiding.</en></lang>
  assert.match(tagDocumentation, /either explicit `false` hides the local tag/u);
  assert.match(tagDocumentation, /`disabled` accepts `boolean \| string`/u);
  assert.match(alertDocumentation, /`show` only controls projection/u);
  assert.match(alertDocumentation, /caller decides whether to update `show`/u);

  // <lang><zh-CN>package declarations只承诺四项已审计 prop；全局增强仍是显式 opt-in，不构成 runtime 自动注册。</zh-CN><en>Package declarations promise only the four audited props; global augmentation remains explicit opt-in and creates no runtime auto-registration.</en></lang>
  assert.match(typeSource, /export interface UAlertTipsProps/u);
  assert.match(typeSource, /export interface UTagProps/u);
  assert.match(typeSource, /export declare const UAlertTips: DefineComponent<UAlertTipsProps>;/u);
  assert.match(typeSource, /export declare const UTag: DefineComponent<UTagProps>;/u);

  // <lang><zh-CN>fixture 静态组合双 tag 可见性输入、数字 text、禁用状态和 alert show，不引入网络或业务 handler。</zh-CN><en>The fixture statically composes dual tag visibility inputs, numeric text, disabled state, and alert show without introducing network or business handlers.</en></lang>
  assert.match(fixtureSource, /<u-tag :visible="fixtureTagVisible" :show="true" :text="7" :disabled="false"/u);
  assert.match(fixtureSource, /<u-alert-tips :show="true"/u);
  assert.doesNotMatch(fixtureSource, /uni\.request|fetch\(|localStorage/u);
});

/**
 * @lang zh-CN 验证只有已审计的四项 prop 可被 matrix 标为 compatible；所有事件与 slot 继续保守展示映射或未支持事实。
 * @lang en Verifies that only the four audited props may be marked compatible in the matrix; every event and slot remains a conservative display mapping or unsupported fact.
 */
test('promotes only audited display props to compatible in the matrix', () => {
  for (const [componentName, propNames] of Object.entries(expectedCompatibleProps)) {
    // <lang><zh-CN>逐组件读取精确 props，防止相同 prop 名跨组件泄漏。</zh-CN><en>Reads exact props component by component, preventing the same prop name from leaking across components.</en></lang>
    const component = requireMatrixComponent(componentName);

    for (const propName of propNames) {
      // <lang><zh-CN>组件和 prop 名必须同时出现在生成器的显式人工规则中，不能由同名自动推断。</zh-CN><en>Both component and prop name must appear in the generator's explicit human rule and cannot be inferred automatically from the same name.</en></lang>
      const item = component.props.items.find((candidate) => candidate.id === `prop:${propName}`);

      assert.ok(item, `Missing audited display prop: ${componentName}.${propName}`);
      assert.equal(item.migration.disposition, 'compatible');
      assert.equal(item.migration.reasonCode, 'EXPLICIT_SEMANTIC_RULE');
      assert.equal(item.migration.target, propName);
      assert.match(generatorSource, new RegExp(`'${componentName}\\|props\\|${propName}'`, 'u'));
    }
  }

  // <lang><zh-CN>names-only 事件/slot 不因同名或 compiler 通过被升格；这些声明仍要求调用方复核实际 payload/slot binding/行为。</zh-CN><en>Names-only events/slots are not promoted merely by same name or compiler success; these declarations still require callers to review real payload, slot binding, and behavior.</en></lang>
  assert.equal(requireMatrixComponent('u-tag').events.items.find((item) => item.id === 'event:click').migration.disposition, 'mapped');
  assert.equal(requireMatrixComponent('u-tag').events.items.find((item) => item.id === 'event:close').migration.disposition, 'mapped');
  assert.equal(requireMatrixComponent('u-tag').slots.items.find((item) => item.id === 'slot:default').migration.disposition, 'unsupported');
  assert.equal(requireMatrixComponent('u-alert-tips').events.items.find((item) => item.id === 'event:close').migration.disposition, 'mapped');
  assert.equal(requireMatrixComponent('u-alert-tips').events.items.find((item) => item.id === 'event:click').migration.disposition, 'unsupported');
});
