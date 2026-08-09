/**
 * @module verify-p60-navigation-contract.test
 * @lang zh-CN 锁定 P60 已完成导航/信息行/分页 family 的独立实现、公开说明与 API compatibility matrix 精确 prop 规则。测试只读取固定仓内输入，不访问上游 checkout、网络、DevTools、业务项目或临时目录。
 * @lang en Locks independent implementation, public explanation, and exact API compatibility rules for the completed P60 navigation/information-row/pagination family. The test reads only fixed repository inputs and accesses no upstream checkout, network, DevTools, business project, or temporary directory.
 */

// <lang><zh-CN>使用严格断言锁定公开 component contract，避免宽松转换掩盖属性或 matrix 结论漂移。</zh-CN><en>Uses strict assertions to lock public component contracts and avoid loose coercion hiding prop or matrix-conclusion drift.</en></lang>
import assert from 'node:assert/strict';
// <lang><zh-CN>只读取明示源码、文档、生成器和提交的 JSON matrix；测试不发现目录或写文件。</zh-CN><en>Reads only declared source, docs, generator, and committed JSON matrix; the test discovers no directories and writes no files.</en></lang>
import { readFile } from 'node:fs/promises';
// <lang><zh-CN>使用 Node 内建测试运行器，使契约门禁独立于浏览器、平台模拟器或额外服务。</zh-CN><en>Uses the Node built-in test runner so the contract gate remains independent from browser, platform simulator, or extra service.</en></lang>
import test from 'node:test';

/**
 * @lang zh-CN 本 family 已审计的精确 compatible prop。tabs/navbar/default slot 保留 mapped，因为当前 inventory 对事件和 slot 不比较完整语义。
 * @lang en Exact compatible props audited for this family. Tabs/navbar/default slot remain mapped because current inventory does not compare full event or slot semantics.
 */
const expectedCompatibleProps = Object.freeze({
  'u-cell-item': Object.freeze(['label', 'required', 'value']),
  'u-pagination': Object.freeze(['modelValue', 'pageSize', 'total'])
});

// <lang><zh-CN>并行读取固定输入，避免读顺序、缓存或目录状态成为隐式测试条件。</zh-CN><en>Reads fixed inputs in parallel, avoiding read order, cache, or directory state becoming an implicit test condition.</en></lang>
const [cellItemSource, navbarSource, tabsSource, paginationSource, cellItemDocumentation, navbarDocumentation, tabsDocumentation, paginationDocumentation, generatorSource, matrixSource] = await Promise.all([
  readFile('HIA-uView-UI/src/components/u-cell-item/u-cell-item.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-navbar/u-navbar.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-tabs/u-tabs.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-pagination/u-pagination.vue', 'utf8'),
  readFile('docs/cell-item.md', 'utf8'),
  readFile('docs/navbar.md', 'utf8'),
  readFile('docs/tabs.md', 'utf8'),
  readFile('docs/pagination.md', 'utf8'),
  readFile('scripts/generate-api-compatibility-matrix.mjs', 'utf8'),
  readFile('HIA-uView-UI/hia-uview.api-compatibility.json', 'utf8')
]);

/**
 * @lang zh-CN 当前提交的 API compatibility matrix；本测试只解析和断言，不重生成或改写该产物。
 * @lang en Current committed API compatibility matrix; this test parses and asserts it only and neither regenerates nor rewrites the artifact.
 */
const apiCompatibilityMatrix = JSON.parse(matrixSource);

/**
 * @lang zh-CN 按精确组件名取得 matrix record；缺失 record 立即失败，禁止 alias 或模糊名称替代。
 * @lang en Obtains a matrix record by exact component name; a missing record fails immediately and no alias or fuzzy name may substitute.
 * @param {string} componentName <lang><zh-CN>固定 kebab-case 组件名。</zh-CN><en>Fixed kebab-case component name.</en></lang>
 * @returns {object} <lang><zh-CN>对应的已提交 matrix record。</zh-CN><en>Corresponding committed matrix record.</en></lang>
 */
function requireMatrixComponent(componentName) {
  // <lang><zh-CN>查找只遍历已提交的数组，不改变 record 顺序、计数或 migration disposition。</zh-CN><en>The lookup traverses only the committed array and changes no record order, count, or migration disposition.</en></lang>
  const component = apiCompatibilityMatrix.components.find((candidate) => candidate.name === componentName);

  assert.ok(component, `Missing API compatibility component: ${componentName}`);
  return component;
}

test('keeps navigation migration implementation and public boundaries aligned', () => {
  // <lang><zh-CN>信息行必须保留数字零、required 提示与 value 为空时的默认 slot，而不是将这些 surface 误接入表单或导航。</zh-CN><en>The information row must retain numeric zero, required cue, and default slot for empty value rather than incorrectly connecting these surfaces to form or navigation.</en></lang>
  assert.match(cellItemSource, /label: \{ type: \[String, Number\], default: '' \}/u);
  assert.match(cellItemSource, /value: \{ type: \[String, Number\], default: '' \}/u);
  assert.match(cellItemSource, /required: \{ type: Boolean, default: false \}/u);
  assert.match(cellItemSource, /<view v-else class="u-cell-item__value"><slot \/><\/view>/u);

  // <lang><zh-CN>导航栏默认 slot、tabs current/list 与分页三个迁移 prop 均须存在，同时保持 caller-controlled 文档边界。</zh-CN><en>Navbar default slot, tabs current/list, and pagination's three migration props must all exist while retaining caller-controlled documentation boundaries.</en></lang>
  assert.match(navbarSource, /<view class="u-navbar__title"><slot><text>\{\{ title \}\}<\/text><\/slot><\/view>/u);
  assert.match(tabsSource, /list: \{ type: Array, default: \(\) => \[\] \}/u);
  assert.match(tabsSource, /current: \{ type: \[Number, String\], default: undefined \}/u);
  assert.match(paginationSource, /modelValue: \{ type: Number, default: 1 \}/u);
  assert.match(paginationSource, /pageSize: \{ type: Number, default: 10 \}/u);
  assert.match(paginationSource, /total: \{ type: Number \}/u);
  assert.match(paginationSource, /emit\('update:modelValue', page\);/u);

  assert.match(cellItemDocumentation, /`required`/u);
  assert.match(navbarDocumentation, /default slot/u);
  assert.match(tabsDocumentation, /`current`/u);
  assert.match(paginationDocumentation, /`pageSize`/u);
});

test('keeps navigation compatible props explicitly audited and other migration surfaces mapped', () => {
  // <lang><zh-CN>收集本 family 的 actual compatible prop，防止无关组件的 future rules 影响此处精确审计。</zh-CN><en>Collects actual compatible props of this family, preventing future rules for unrelated components from affecting this exact audit.</en></lang>
  const actualCompatibleProps = [];

  for (const [componentName, propNames] of Object.entries(expectedCompatibleProps)) {
    // <lang><zh-CN>每个期望组件只读取自身 prop inventory；该过程不依赖 component 数组顺序。</zh-CN><en>Each expected component reads only its own prop inventory; this process does not depend on component-array order.</en></lang>
    const component = requireMatrixComponent(componentName);

    for (const propName of propNames) {
      // <lang><zh-CN>精确 item ID 将 prop 名与 component scope 绑定，防止另一个组件同名属性越权满足断言。</zh-CN><en>The exact item ID binds prop name to component scope, preventing a same-named prop on another component from satisfying the assertion.</en></lang>
      const item = component.props.items.find((candidate) => candidate.id === `prop:${propName}`);

      assert.ok(item, `Missing audited prop: ${componentName}.${propName}`);
      actualCompatibleProps.push(`${componentName}|${item.id}`);
      assert.equal(item.migration.disposition, 'compatible');
      assert.equal(item.migration.reasonCode, 'EXPLICIT_SEMANTIC_RULE');
      assert.equal(item.migration.target, propName);
      assert.match(generatorSource, new RegExp(`'${componentName}\\|props\\|${propName}'`, 'u'));
    }
  }

  // <lang><zh-CN>期望 key 从固定 audit list 派生并代码点排序，保证兼容结论的集合无重复且可复核。</zh-CN><en>Expected keys derive from the fixed audit list and use code-point order, keeping the compatible-conclusion set duplicate-free and reviewable.</en></lang>
  const expectedKeys = Object.entries(expectedCompatibleProps)
    .flatMap(([componentName, propNames]) => propNames.map((propName) => `${componentName}|prop:${propName}`))
    .sort();

  actualCompatibleProps.sort();
  assert.deepEqual(actualCompatibleProps, expectedKeys);

  // <lang><zh-CN>slot/current/update:modelValue 均已获得命名 target，但由于当前盘点 scope 不比较完整 slot/event 语义或 current 默认值，它们必须保守保持 mapped。</zh-CN><en>Slot/current/update:modelValue all now have named targets, but because current inventory scope does not compare full slot/event semantics or current default, they must conservatively remain mapped.</en></lang>
  assert.equal(requireMatrixComponent('u-cell-item').slots.items.find((item) => item.id === 'slot:default').migration.disposition, 'mapped');
  assert.equal(requireMatrixComponent('u-navbar').slots.items.find((item) => item.id === 'slot:default').migration.disposition, 'mapped');
  assert.equal(requireMatrixComponent('u-tabs').props.items.find((item) => item.id === 'prop:current').migration.disposition, 'mapped');
  assert.equal(requireMatrixComponent('u-pagination').events.items.find((item) => item.id === 'event:update:modelValue').migration.disposition, 'mapped');
});
