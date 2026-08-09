/**
 * @module verify-p60-presentation-contract.test
 * @lang zh-CN 锁定五个基础呈现组件经独立实现与运行时回归确认的迁移 prop，以及与之对应的公开说明和只读 API compatibility matrix。测试不读取上游检出、不执行网络、不写文件，也不把事件/slot 的 names-only 盘点误作完整语义兼容。
 * @lang en Locks migration props of five foundational presentation components confirmed by independent implementation and runtime regression, together with their public documentation and read-only API compatibility matrix. The test reads no upstream checkout, performs no network, writes no files, and never mistakes names-only event/slot inventory for full semantic compatibility.
 */

// <lang><zh-CN>使用严格断言表达固定公开契约，避免测试框架隐式转换掩盖迁移表面漂移。</zh-CN><en>Uses strict assertions to express fixed public contracts and avoid test-framework coercion hiding migration-surface drift.</en></lang>
import assert from 'node:assert/strict';
// <lang><zh-CN>只读取显式列出的仓内源码、文档、生成器和 JSON，不发现目录或访问外部来源。</zh-CN><en>Reads only explicitly listed repository source, docs, generator, and JSON; it discovers no directories and accesses no external source.</en></lang>
import { readFile } from 'node:fs/promises';
// <lang><zh-CN>使用 Node 内建测试运行器，保持这项静态契约门禁不依赖浏览器、DevTools 或额外服务。</zh-CN><en>Uses the Node built-in test runner, keeping this static contract gate independent from browser, DevTools, or additional services.</en></lang>
import test from 'node:test';

/**
 * @lang zh-CN 五个本批组件源码的固定公开仓内路径。
 * @lang en Fixed public repository-local paths for the five components in this batch.
 */
const componentPaths = Object.freeze({
  button: 'HIA-uView-UI/src/components/u-button/u-button.vue',
  empty: 'HIA-uView-UI/src/components/u-empty/u-empty.vue',
  icon: 'HIA-uView-UI/src/components/u-icon/u-icon.vue',
  image: 'HIA-uView-UI/src/components/u-image/u-image.vue',
  text: 'HIA-uView-UI/src/components/u-text/u-text.vue'
});

/**
 * @lang zh-CN 与每个改动组件对应的公开契约路径；路径不包含工作区或个人机器信息。
 * @lang en Public contract paths corresponding to each changed component; paths contain no workspace or personal-machine information.
 */
const documentationPaths = Object.freeze({
  button: 'docs/button.md',
  empty: 'docs/empty.md',
  icon: 'docs/icon.md',
  image: 'docs/image.md',
  text: 'docs/text.md'
});

/**
 * @lang zh-CN 本批经语义审计、独立实现与运行时回归证明的精确 prop；事件和 slot 没有列入，因为当前盘点范围只记录它们的名称。
 * @lang en Exact props proven by semantic audit, independent implementation, and runtime regression in this batch; events and slots are not listed because the current inventory records their names only.
 */
const expectedCompatibleProps = Object.freeze({
  'u-button': Object.freeze(['disabled', 'loading', 'text']),
  'u-empty': Object.freeze(['show', 'src', 'text']),
  'u-icon': Object.freeze(['label']),
  'u-image': Object.freeze(['src']),
  'u-text': Object.freeze(['show', 'text'])
});

// <lang><zh-CN>并行读取固定输入，确保测试不以读取顺序或缓存状态推断组件行为。</zh-CN><en>Reads fixed inputs in parallel, ensuring the test infers no component behavior from read order or cache state.</en></lang>
const [componentSources, documentationSources, generatorSource, matrixSource] = await Promise.all([
  Promise.all(Object.values(componentPaths).map((path) => readFile(path, 'utf8'))),
  Promise.all(Object.values(documentationPaths).map((path) => readFile(path, 'utf8'))),
  readFile('scripts/generate-api-compatibility-matrix.mjs', 'utf8'),
  readFile('HIA-uView-UI/hia-uview.api-compatibility.json', 'utf8')
]);

/**
 * @lang zh-CN 以稳定键重新关联五份组件源码，避免 object value 顺序成为测试隐式契约。
 * @lang en Reassociates five component sources through stable keys so object value order cannot become an implicit test contract.
 */
const componentSourcesByKey = Object.fromEntries(Object.keys(componentPaths).map((key, index) => [key, componentSources[index]]));

/**
 * @lang zh-CN 以稳定键重新关联五份公开文档，供实现和使用者契约同时断言。
 * @lang en Reassociates five public documents through stable keys for joint implementation and user-contract assertions.
 */
const documentationSourcesByKey = Object.fromEntries(Object.keys(documentationPaths).map((key, index) => [key, documentationSources[index]]));

/**
 * @lang zh-CN 当前已提交的版本化 API compatibility matrix；本测试只读取而不重生成该文件。
 * @lang en Current committed versioned API compatibility matrix; this test reads it only and does not regenerate it.
 */
const apiCompatibilityMatrix = JSON.parse(matrixSource);

/**
 * @lang zh-CN 从矩阵中按精确组件名取得 record；名称缺失直接失败，禁止以模糊 alias 代替。
 * @lang en Obtains a record by exact component name from the matrix; an absent name fails immediately and no fuzzy alias may substitute.
 * @param {string} componentName <lang><zh-CN>固定 kebab-case 组件名。</zh-CN><en>Fixed kebab-case component name.</en></lang>
 * @returns {object} <lang><zh-CN>对应矩阵组件 record。</zh-CN><en>Corresponding matrix component record.</en></lang>
 */
function requireMatrixComponent(componentName) {
  // <lang><zh-CN>矩阵数组只从已提交 JSON 读取，查找不写入或重排任何 record。</zh-CN><en>The matrix array is read only from committed JSON; lookup writes or reorders no record.</en></lang>
  const component = apiCompatibilityMatrix.components.find((candidate) => candidate.name === componentName);

  assert.ok(component, `Missing API compatibility component: ${componentName}`);
  return component;
}

test('keeps the independently implemented presentation migration props and public explanations aligned', () => {
  // <lang><zh-CN>按钮必须保留 label 优先级并暴露 text 回退，避免仅矩阵变更而 runtime 仍丢失可见文字。</zh-CN><en>The button must retain label precedence and expose text fallback, avoiding a matrix-only change while runtime still loses visible copy.</en></lang>
  assert.match(componentSourcesByKey.button, /const resolvedLabel = computed\(\(\) => props\.label \|\| props\.text\);/u);
  assert.match(componentSourcesByKey.button, /text:\s*\{\s*type: String,\s*default: ''\s*\}/su);

  // <lang><zh-CN>空态必须有 show、src、text 和受控 description 优先级；嵌套图片不得绕过独立 UImage 边界。</zh-CN><en>The empty state must have show, src, text, and controlled description precedence; nested image must not bypass the independent UImage boundary.</en></lang>
  assert.match(componentSourcesByKey.empty, /<view v-if="show" class="u-empty">/u);
  assert.match(componentSourcesByKey.empty, /<UImage v-if="src"/u);
  assert.match(componentSourcesByKey.empty, /const resolvedDescription = computed\(\(\) => props\.description \|\| props\.text\);/u);

  // <lang><zh-CN>图标数字标签必须保留零值可见性，图片和文本必须仅 emit 本地 click 意图。</zh-CN><en>The icon numeric label must retain zero-value visibility, and image and text must emit local click intent only.</en></lang>
  assert.match(componentSourcesByKey.icon, /label: \{ type: \[String, Number\], default: '' \}/u);
  assert.match(componentSourcesByKey.icon, /const hasLabel = computed\(\(\) => props\.label !== ''\);/u);
  assert.match(componentSourcesByKey.image, /const emit = defineEmits\(\['load', 'error', 'click'\]\);/u);
  assert.match(componentSourcesByKey.text, /text: \{\s*type: \[String, Number\],\s*default: ''\s*\}/su);
  assert.match(componentSourcesByKey.text, /const emit = defineEmits\(\['click'\]\);/u);

  // <lang><zh-CN>公开文档必须说明新增迁移面及其边界，避免调用方将 local click 或 caller src 误读为导航、预览或请求能力。</zh-CN><en>Public docs must explain new migration surfaces and their boundaries, preventing callers from mistaking local click or caller src for navigation, preview, or request capability.</en></lang>
  assert.match(documentationSourcesByKey.button, /`text`/u);
  assert.match(documentationSourcesByKey.empty, /`show`/u);
  assert.match(documentationSourcesByKey.image, /local `click` intent/u);
  assert.match(documentationSourcesByKey.text, /`string \\\| number`/u);
  assert.match(documentationSourcesByKey.icon, /Numeric `0`/u);
});

test('marks only audited same-shape props as compatible in the regenerated matrix', () => {
  // <lang><zh-CN>收集当前 matrix 中所有 compatible prop，随后与精确审计清单比较，防止规则集合无意扩张。</zh-CN><en>Collects every compatible prop in the current matrix and then compares it with the exact audit list, preventing accidental rule-set expansion.</en></lang>
  const actualCompatibleProps = [];

  for (const component of apiCompatibilityMatrix.components) {
    // <lang><zh-CN>本测试只锁定基础呈现 family；其他 P60 family 的独立审计规则不得使本检查点误报漂移。</zh-CN><en>This test locks only the foundational presentation family; independent audit rules in other P60 families must not make this checkpoint falsely report drift.</en></lang>
    if (!Object.hasOwn(expectedCompatibleProps, component.name)) {
      continue;
    }

    // <lang><zh-CN>只检查 runtime prop inventory；events、slots 和 imperative APIs 仍处于其各自的受限盘点范围。</zh-CN><en>Inspects only runtime prop inventory; events, slots, and imperative APIs remain within their respective bounded inventory scopes.</en></lang>
    for (const item of component.props.items) {
      // <lang><zh-CN>compatible 是本批唯一允许的无转换结论；其他 disposition 保持其原始保守事实。</zh-CN><en>Compatible is the only no-transformation conclusion allowed in this batch; other dispositions retain their original conservative facts.</en></lang>
      if (item.migration.disposition === 'compatible') {
        actualCompatibleProps.push(`${component.name}|${item.id}`);
      }
    }
  }

  // <lang><zh-CN>从审计清单派生期望 key，使用 prop: 前缀与矩阵稳定 item ID 完全对应。</zh-CN><en>Derives expected keys from the audit list, matching the matrix stable item IDs exactly through the prop: prefix.</en></lang>
  const expectedKeys = Object.entries(expectedCompatibleProps)
    .flatMap(([componentName, propNames]) => propNames.map((propName) => `${componentName}|prop:${propName}`))
    .sort();

  actualCompatibleProps.sort();
  assert.deepEqual(actualCompatibleProps, expectedKeys);

  for (const [componentName, propNames] of Object.entries(expectedCompatibleProps)) {
    // <lang><zh-CN>每个获批 prop 都必须能回溯到生成器中的精确规则键，不能由名称或结构相同自动升级。</zh-CN><en>Every approved prop must trace back to an exact rule key in the generator and cannot be promoted automatically by name or structural equality.</en></lang>
    for (const propName of propNames) {
      assert.match(generatorSource, new RegExp(`'${componentName}\\|props\\|${propName}'`, 'u'));
    }

    // <lang><zh-CN>读取矩阵 record 使循环明确依赖精确组件身份，避免未来 audit list 键与 matrix 脱节。</zh-CN><en>Reads the matrix record so the loop explicitly depends on exact component identity, avoiding future detachment between audit-list keys and matrix.</en></lang>
    const matrixComponent = requireMatrixComponent(componentName);

    for (const propName of propNames) {
      // <lang><zh-CN>相同 API item 必须报告显式人工规则原因和当前同名 target，证明它不依赖隐式 alias。</zh-CN><en>The same API item must report the explicit human-rule reason and current same-name target, proving it relies on no implicit alias.</en></lang>
      const item = matrixComponent.props.items.find((candidate) => candidate.id === `prop:${propName}`);

      assert.ok(item, `Missing audited prop: ${componentName}.${propName}`);
      assert.equal(item.migration.disposition, 'compatible');
      assert.equal(item.migration.reasonCode, 'EXPLICIT_SEMANTIC_RULE');
      assert.equal(item.migration.target, propName);
    }
  }
});
