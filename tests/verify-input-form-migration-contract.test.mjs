/**
 * @module verify-input-form-migration-contract.test
 * @lang zh-CN 锁定本批受控输入、查询、多行文字与展示型表单结构的独立迁移面。测试只读取明确列出的公开仓内文件，不访问上游检出、网络、平台工具或业务项目，也不写入任何输入。
 * @lang en Locks the independent migration surfaces of this batch's controlled input, query, multiline text, and presentational form structure. The test reads only explicitly listed public repository files and accesses no upstream checkout, network, platform tool, or business project, nor does it write any input.
 */

// <lang><zh-CN>使用严格断言表达精确公开契约，避免宽松类型转换掩盖 prop 或 matrix 结论漂移。</zh-CN><en>Uses strict assertions to express exact public contracts and avoid loose type coercion masking prop or matrix-conclusion drift.</en></lang>
import assert from 'node:assert/strict';
// <lang><zh-CN>只读取固定源码、文档、生成器、fixture 和已提交 matrix；不发现目录或读取临时输入。</zh-CN><en>Reads only fixed source, documentation, generator, fixture, and committed matrix; it discovers no directories and reads no temporary input.</en></lang>
import { readFile } from 'node:fs/promises';
// <lang><zh-CN>使用 Node 内建测试运行器，使静态契约门禁独立于浏览器、DevTools 或额外服务。</zh-CN><en>Uses the Node built-in test runner, keeping the static contract gate independent from browsers, DevTools, or extra services.</en></lang>
import test from 'node:test';

/**
 * @lang zh-CN 本批经独立实现、可执行行为回归和受限语义审计确认的精确 compatible prop。事件、slot 和命令式方法仍保持保守 migration 结论，因为当前盘点不比较其完整载荷、插槽绑定或生命周期语义。
 * @lang en Exact compatible props confirmed by independent implementation, executable behavior regression, and bounded semantic audit in this batch. Events, slots, and imperative methods retain conservative migration conclusions because the current inventory does not compare their complete payload, slot-binding, or lifecycle semantics.
 */
const expectedCompatibleProps = Object.freeze({
  'u-field': Object.freeze(['label', 'required']),
  'u-form-item': Object.freeze(['label', 'required']),
  'u-input': Object.freeze(['disabled', 'modelValue', 'readonly']),
  'u-search': Object.freeze(['disabled', 'modelValue']),
  'u-textarea': Object.freeze(['readonly'])
});

// <lang><zh-CN>并行读取固定公开输入，避免读取顺序、缓存或目录状态成为隐式契约。</zh-CN><en>Reads fixed public inputs in parallel, avoiding read order, cache, or directory state becoming an implicit contract.</en></lang>
const [inputSource, searchSource, textareaSource, fieldSource, formItemSource, inputDocumentation, searchDocumentation, textareaDocumentation, fieldDocumentation, formDocumentation, formItemDocumentation, fixtureSource, generatorSource, matrixSource] = await Promise.all([
  readFile('HIA-uView-UI/src/components/u-input/u-input.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-search/u-search.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-textarea/u-textarea.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-field/u-field.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-form-item/u-form-item.vue', 'utf8'),
  readFile('docs/input.md', 'utf8'),
  readFile('docs/search.md', 'utf8'),
  readFile('docs/textarea.md', 'utf8'),
  readFile('docs/field.md', 'utf8'),
  readFile('docs/form.md', 'utf8'),
  readFile('docs/form-item.md', 'utf8'),
  readFile('HIA-uView-UI/fixtures/mp-weixin/src/pages/index/index.vue', 'utf8'),
  readFile('scripts/generate-api-compatibility-matrix.mjs', 'utf8'),
  readFile('HIA-uView-UI/hia-uview.api-compatibility.json', 'utf8')
]);

/**
 * @lang zh-CN 当前提交的只读 API compatibility matrix；本测试只解析和断言，绝不改写或重新生成它。
 * @lang en Current committed read-only API compatibility matrix; this test only parses and asserts it and never rewrites or regenerates it.
 */
const apiCompatibilityMatrix = JSON.parse(matrixSource);

/**
 * @lang zh-CN 按精确 kebab-case 名称取得 matrix component record；缺失即失败，不允许 alias 或模糊匹配。
 * @lang en Obtains a matrix component record by exact kebab-case name; absence fails immediately and allows no alias or fuzzy match.
 * @param {string} componentName <lang><zh-CN>固定组件名。</zh-CN><en>Fixed component name.</en></lang>
 * @returns {object} <lang><zh-CN>对应 matrix record。</zh-CN><en>Corresponding matrix record.</en></lang>
 */
function requireMatrixComponent(componentName) {
  // <lang><zh-CN>查找只遍历已提交 component 数组，不改变其顺序、计数或 migration disposition。</zh-CN><en>The lookup traverses only the committed component array and changes none of its order, count, or migration disposition.</en></lang>
  const component = apiCompatibilityMatrix.components.find((candidate) => candidate.name === componentName);

  assert.ok(component, `Missing API compatibility component: ${componentName}`);
  return component;
}

test('keeps controlled input and presentational form migration surfaces explicit', () => {
  // <lang><zh-CN>单行输入必须将 readonly 传给原生控件，并以 String/Number 声明 modelValue；点击和确认仍只是原始本地意图。</zh-CN><en>The single-line input must pass readonly to the native control and declare modelValue as String/Number; click and confirm remain raw local intent only.</en></lang>
  assert.match(inputSource, /:readonly="readonly"/u);
  assert.match(inputSource, /modelValue:\s*\{\s*type: \[String, Number\],\s*default: ''\s*\}/su);
  assert.match(inputSource, /const emit = defineEmits\(\['update:modelValue', 'input', 'focus', 'blur', 'click', 'confirm'\]\);/u);

  // <lang><zh-CN>查询和多行输入必须同时保留原始 input 与同值 change，点击仅作为受控区域的本地观察。</zh-CN><en>Search and multiline input must retain both raw input and same-value change, while click is only a local observation of the controlled region.</en></lang>
  assert.match(searchSource, /const emit = defineEmits\(\['update:modelValue', 'input', 'change', 'focus', 'blur', 'confirm', 'click', 'search', 'clear'\]\);/u);
  assert.match(searchSource, /emit\('change', nextValue\);/u);
  assert.match(textareaSource, /const emit = defineEmits\(\['update:modelValue', 'input', 'change', 'focus', 'blur', 'confirm', 'click'\]\);/u);
  assert.match(textareaSource, /emit\('change', nextValue\);/u);

  // <lang><zh-CN>field/form-item 继续保持展示型结构；它们不得悄然出现模型绑定、字段 registry 或 validator 接入。</zh-CN><en>Field/form-item continue as presentational structure; they must not silently gain model binding, field registry, or validator integration.</en></lang>
  assert.match(fieldSource, /<slot\s*\/>/u);
  assert.doesNotMatch(fieldSource, /defineEmits\(/u);
  assert.match(formItemSource, /defineEmits\(\[\]\);/u);
  assert.doesNotMatch(formItemSource, /resetField/u);
});

test('keeps public explanations and the compile fixture aligned with bounded interaction', () => {
  // <lang><zh-CN>输入文档必须说明数字初值、readonly、click 与 confirm 的边界；这些事件不得被表述为业务完成。</zh-CN><en>Input documentation must explain numeric initial values, readonly, click, and confirm boundaries; these events must not be described as business completion.</en></lang>
  assert.match(inputDocumentation, /`string \\\| number`/u);
  assert.match(inputDocumentation, /`readonly`/u);
  assert.match(inputDocumentation, /`click`/u);
  assert.match(inputDocumentation, /`confirm`/u);

  // <lang><zh-CN>查询、多行和展示型 form 文档必须披露新增本地观察面及刻意未交付的表单引擎能力。</zh-CN><en>Search, multiline, and presentational-form documentation must disclose the added local-observation surface and intentionally undelivered form-engine capability.</en></lang>
  assert.match(searchDocumentation, /`change`/u);
  assert.match(searchDocumentation, /`click`/u);
  assert.match(textareaDocumentation, /`change`/u);
  assert.match(textareaDocumentation, /`click`/u);
  assert.match(fieldDocumentation, /presentation-compatible/u);
  assert.match(formDocumentation, /`resetFields`/u);
  assert.match(formItemDocumentation, /`resetField`/u);

  // <lang><zh-CN>编译 fixture 只将新增事件记录为现有页面的有限本地文字；它不接入请求、路由、持久化或动态脚本。</zh-CN><en>The compile fixture records added events only as finite local copy on the existing page; it connects no request, route, persistence, or dynamic script.</en></lang>
  assert.match(fixtureSource, /@confirm="recordFixturePresentationIntent\('input-confirm'\)"/u);
  assert.match(fixtureSource, /@change="recordFixturePresentationIntent\('textarea-change'\)"/u);
  assert.match(fixtureSource, /@click="recordFixturePresentationIntent\('search-click'\)"/u);
});

test('marks only the explicit audited input and presentational props as compatible', () => {
  // <lang><zh-CN>逐项读取固定 audit list，确保 compatible 结论既有同名 target，也有生成器中可审计的显式规则。</zh-CN><en>Reads the fixed audit list item by item, ensuring each compatible conclusion has both a same-name target and an auditable explicit generator rule.</en></lang>
  for (const [componentName, propNames] of Object.entries(expectedCompatibleProps)) {
    // <lang><zh-CN>每个组件 record 独立解析，避免另一个组件的同名 prop 越权满足当前断言。</zh-CN><en>Each component record is resolved independently, preventing a same-named prop on another component from improperly satisfying the current assertion.</en></lang>
    const component = requireMatrixComponent(componentName);

    for (const propName of propNames) {
      // <lang><zh-CN>稳定 item ID 绑定组件与 prop 身份；不依据数组索引推断其位置。</zh-CN><en>The stable item ID binds component and prop identity; no array index is used to infer its position.</en></lang>
      const item = component.props.items.find((candidate) => candidate.id === `prop:${propName}`);

      assert.ok(item, `Missing audited prop: ${componentName}.${propName}`);
      assert.equal(item.migration.disposition, 'compatible');
      assert.equal(item.migration.reasonCode, 'EXPLICIT_SEMANTIC_RULE');
      assert.equal(item.migration.target, propName);
      assert.match(generatorSource, new RegExp(`'${componentName}\\|props\\|${propName}'`, 'u'));
    }
  }

  // <lang><zh-CN>事件与 slot 当前只作受限名称盘点，因此即使 target 已存在也必须保守保持 mapped，不升级为完整语义兼容。</zh-CN><en>Events and slots are currently only bounded name inventory, so even when a target exists they must conservatively remain mapped and cannot be promoted to complete semantic compatibility.</en></lang>
  assert.equal(requireMatrixComponent('u-input').events.items.find((item) => item.id === 'event:click').migration.disposition, 'mapped');
  assert.equal(requireMatrixComponent('u-search').events.items.find((item) => item.id === 'event:change').migration.disposition, 'mapped');
  assert.equal(requireMatrixComponent('u-textarea').events.items.find((item) => item.id === 'event:click').migration.disposition, 'mapped');
  assert.equal(requireMatrixComponent('u-field').events.items.find((item) => item.id === 'event:update:modelValue').migration.disposition, 'unsupported');
  assert.equal(requireMatrixComponent('u-form').slots.items.find((item) => item.id === 'slot:default').migration.disposition, 'mapped');
  assert.equal(requireMatrixComponent('u-form').imperativeApis.items.find((item) => item.id === 'imperative:resetFields').migration.disposition, 'unsupported');
});
