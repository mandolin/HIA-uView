/**
 * @module verify-migration-actions-generator.test
 * @lang zh-CN 验证 P0 动作生成器对 matrix v2 的 127/127 确定覆盖、来源指纹约束、仅在事实未漂移时保留人工说明，以及缺失语义/重复 ID 拒绝；测试不扫描 consumer、组件源码或文档正文，也不写文件。
 * @lang en Verifies the P0 action generator's deterministic 127/127 coverage of matrix v2, source-fingerprint constraint, retention of human copy only while facts remain unchanged, and rejection of missing semantics or duplicate IDs; the test scans no consumer, component source, or documentation body and writes no file.
 */

// <lang><zh-CN>严格断言使用 Node 内建模块，不引入测试 runtime 依赖。</zh-CN><en>Strict assertions use the Node built-in module and add no test-runtime dependency.</en></lang>
import assert from 'node:assert/strict';
// <lang><zh-CN>固定 JSON 输入通过显式文件读取获得，不做目录发现。</zh-CN><en>Fixed JSON inputs are obtained through explicit file reads with no directory discovery.</en></lang>
import { readFile } from 'node:fs/promises';
// <lang><zh-CN>Node 内建 test runner 保持测试一次性、无 watch/server。</zh-CN><en>The Node built-in test runner keeps testing one-shot with no watch process or server.</en></lang>
import test from 'node:test';
// <lang><zh-CN>只导入纯 manifest builder；CLI write 分支不会在 import 时执行。</zh-CN><en>Imports only the pure manifest builder; the CLI write branch does not execute on import.</en></lang>
import { buildMigrationActionManifest } from '../scripts/generate-p0-migration-actions.mjs';

/** @lang zh-CN 当前 matrix v2 的固定公开路径。 @lang en Fixed public path of the current matrix v2. */
const matrixPath = 'HIA-uView-UI/hia-uview.api-compatibility.json';
/** @lang zh-CN 当前 P0 动作包的固定公开路径。 @lang en Fixed public path of the current P0 action packet. */
const actionPath = 'HIA-uView-UI/hia-uview.migration-actions.json';

// <lang><zh-CN>两个 JSON 并行读取并只解析为测试内存对象。</zh-CN><en>The two JSON files are read in parallel and parsed only into test-memory objects.</en></lang>
const [matrixSource, actionSource] = await Promise.all([readFile(matrixPath, 'utf8'), readFile(actionPath, 'utf8')]);
/** @lang zh-CN 当前真实 matrix fixture。 @lang en Current real matrix fixture. */
const matrixFixture = JSON.parse(matrixSource);
/** @lang zh-CN 当前真实 action fixture。 @lang en Current real action fixture. */
const actionFixture = JSON.parse(actionSource);

/**
 * @lang zh-CN 在深拷贝 matrix 中定位第一个 P0 component/item，供受控来源事实突变。
 * @lang en Locates the first P0 component/item pair in a deep-cloned matrix for controlled source-fact mutations.
 * @param {object} matrix <lang><zh-CN>matrix 深拷贝。</zh-CN><en>Deep-cloned matrix.</en></lang>
 * @returns {{component:object,item:object}} <lang><zh-CN>第一个 P0 component 与 item 引用。</zh-CN><en>References to the first P0 component and item.</en></lang>
 */
function firstP0Entry(matrix) {
  for (const component of matrix.components) {
    // <lang><zh-CN>固定四维顺序只用于找到一个测试对象，不参与生成器排序。</zh-CN><en>The fixed four-dimension order only locates one test object and does not participate in generator ordering.</en></lang>
    for (const dimension of ['props', 'events', 'slots', 'imperativeApis']) {
      // <lang><zh-CN>find 返回真实深拷贝引用，允许当前负例只改这一项。</zh-CN><en>Find returns a reference inside the deep clone, allowing the current negative case to change only this item.</en></lang>
      const item = component[dimension].items.find((candidate) => candidate.priority === 'P0');
      if (item) return { component, item };
    }
  }
  throw new Error('Matrix fixture contains no P0 item.');
}

/**
 * @lang zh-CN 验证真实生成结果与提交文件逐字段一致，并锁定 30/127 与 43/82/2。
 * @lang en Verifies that real generation matches the committed file field for field and locks 30/127 plus 43/82/2.
 */
test('generates one deterministic action for every reviewed P0 semantic item', () => {
  // <lang><zh-CN>纯 builder 两次使用独立输入，结果必须相同且等于提交 manifest。</zh-CN><en>The pure builder uses independent inputs twice; both results must match each other and the committed manifest.</en></lang>
  const first = buildMigrationActionManifest(structuredClone(matrixFixture), structuredClone(actionFixture));
  const second = buildMigrationActionManifest(structuredClone(matrixFixture), structuredClone(actionFixture));
  // <lang><zh-CN>disposition summary 从 action 现场派生，不读取任何自报 count。</zh-CN><en>The disposition summary is derived live from actions and reads no self-reported count.</en></lang>
  const dispositions = first.actions.reduce(
    (summary, action) => ({ ...summary, [action.disposition]: summary[action.disposition] + 1 }),
    { compatible: 0, mapped: 0, unsupported: 0 }
  );

  assert.deepEqual(first, second);
  assert.deepEqual(first, actionFixture);
  assert.equal(first.version, 2);
  assert.equal(first.scope.components.length, 30);
  assert.deepEqual(first.scope.priorities, ['P0']);
  assert.equal(first.actions.length, 127);
  assert.deepEqual(dispositions, { compatible: 43, mapped: 84, unsupported: 0 });
  assert.ok(first.actions.every((action) => /^sha256:[0-9a-f]{64}$/u.test(action.sourceFingerprint)));
  assert.ok(first.actions.every((action) => !('apply' in action) && !('script' in action)));
});

/**
 * @lang zh-CN 验证旧 action 的来源指纹精确匹配当前 matrix 时，人工双语文案可被保留。
 * @lang en Verifies that human bilingual copy can be retained when an existing action's source fingerprint exactly matches the current matrix.
 */
test('retains existing copy only behind an exact source fingerprint', () => {
  // <lang><zh-CN>只修改文案而保留已提交指纹，模拟维护者对当前事实完成的人工作文。</zh-CN><en>Change only copy while retaining the committed fingerprint, simulating human authorship reviewed against current facts.</en></lang>
  const actions = structuredClone(actionFixture);
  actions.actions[0].guidance.en = 'Human-reviewed copy bound to the current matrix facts.';
  // <lang><zh-CN>生成器应保留文案并继续输出相同来源指纹。</zh-CN><en>The generator must retain the copy and continue emitting the same source fingerprint.</en></lang>
  const generated = buildMigrationActionManifest(structuredClone(matrixFixture), actions);

  assert.equal(generated.actions[0].guidance.en, 'Human-reviewed copy bound to the current matrix facts.');
  assert.equal(generated.actions[0].sourceFingerprint, actionFixture.actions[0].sourceFingerprint);
});

/**
 * @lang zh-CN 验证 migration target 漂移会使旧指纹失配，并强制从当前事实重建文案。
 * @lang en Verifies that migration-target drift invalidates the old fingerprint and forces copy to be rebuilt from current facts.
 */
test('rebuilds copy when the migration target drifts', () => {
  // <lang><zh-CN>matrix 与 action 各自深拷贝，确保目标漂移不会污染其他负例。</zh-CN><en>Deep-clone the matrix and actions separately so target drift cannot contaminate other negative cases.</en></lang>
  const matrix = structuredClone(matrixFixture);
  const actions = structuredClone(actionFixture);
  // <lang><zh-CN>稳定 ID 将被用于精确找到与所改 matrix item 对应的旧 action。</zh-CN><en>The stable ID precisely locates the existing action corresponding to the mutated matrix item.</en></lang>
  const { component, item } = firstP0Entry(matrix);
  const action = actions.actions.find((candidate) => candidate.id === `${component.name}/${item.id}`);
  action.guidance.en = 'Stale human copy that must not survive target drift.';
  // <lang><zh-CN>只改变当前 migration target，保留 disposition、reason 与 semantics。</zh-CN><en>Change only the current migration target while retaining disposition, reason, and semantics.</en></lang>
  item.migration.target = `${item.migration.target ?? 'none'}-changed`;
  const generated = buildMigrationActionManifest(matrix, actions);
  const regenerated = generated.actions.find((candidate) => candidate.id === action.id);

  assert.notEqual(regenerated.guidance.en, action.guidance.en);
  assert.notEqual(regenerated.sourceFingerprint, action.sourceFingerprint);
});

/**
 * @lang zh-CN 验证完整 semantics 中任一事实漂移都会使旧指纹失配，并强制重建文案。
 * @lang en Verifies that drift in any complete-semantics fact invalidates the old fingerprint and forces copy reconstruction.
 */
test('rebuilds copy when complete semantics drift', () => {
  // <lang><zh-CN>在独立输入中定位对应 action，并把旧文案替换为可识别哨兵。</zh-CN><en>Locate the matching action in isolated inputs and replace its old copy with a recognizable sentinel.</en></lang>
  const matrix = structuredClone(matrixFixture);
  const actions = structuredClone(actionFixture);
  const { component, item } = firstP0Entry(matrix);
  const action = actions.actions.find((candidate) => candidate.id === `${component.name}/${item.id}`);
  action.guidance.en = 'Stale human copy that must not survive semantic drift.';
  // <lang><zh-CN>追加一个受控 side-effect 事实，证明 fingerprint 覆盖完整嵌套 semantics，而非只看 reviewState。</zh-CN><en>Append one controlled side-effect fact, proving the fingerprint covers complete nested semantics rather than only reviewState.</en></lang>
  item.semantics.upstream.sideEffects = [...item.semantics.upstream.sideEffects, 'controlled-test-drift'];
  const generated = buildMigrationActionManifest(matrix, actions);
  const regenerated = generated.actions.find((candidate) => candidate.id === action.id);

  assert.notEqual(regenerated.guidance.en, action.guidance.en);
  assert.notEqual(regenerated.sourceFingerprint, action.sourceFingerprint);
});

/**
 * @lang zh-CN 验证缺失 P0 semantic review 时生成器拒绝产生看似完整的 action。
 * @lang en Verifies that the generator rejects an apparently complete action when a P0 semantic review is missing.
 */
test('rejects a P0 item whose semantic review is absent', () => {
  // <lang><zh-CN>删除单项 semantics，保留其他 matrix 事实以隔离完成门禁。</zh-CN><en>Deletes semantics from one item while retaining every other matrix fact to isolate the completion gate.</en></lang>
  const matrix = structuredClone(matrixFixture);
  delete firstP0Entry(matrix).item.semantics;

  assert.throws(() => buildMigrationActionManifest(matrix, structuredClone(actionFixture)), /lacks complete semantics/u);
});

/**
 * @lang zh-CN 验证重复 P0 item ID 不能由生成顺序或最后写入隐藏。
 * @lang en Verifies that a duplicate P0 item ID cannot be hidden by generation order or last-write behavior.
 */
test('rejects a duplicate P0 matrix item identity', () => {
  // <lang><zh-CN>在同一 container 追加第一个 P0 的深拷贝，构造只包含 identity 冲突的负例。</zh-CN><en>Appends a deep clone of the first P0 item to the same container, creating a negative case containing only an identity conflict.</en></lang>
  const matrix = structuredClone(matrixFixture);
  const firstComponent = matrix.components.find((component) => component.props.items.some((item) => item.priority === 'P0'));
  const item = firstComponent.props.items.find((candidate) => candidate.priority === 'P0');
  firstComponent.props.items.push(structuredClone(item));

  assert.throws(() => buildMigrationActionManifest(matrix, structuredClone(actionFixture)), /duplicate IDs/u);
});

/**
 * @lang zh-CN 验证既有人工 action 离开当前 P0 scope 时必须显式审阅，不能在重生成时静默删除。
 * @lang en Verifies that an existing human-authored action leaving current P0 scope requires explicit review and cannot disappear silently during regeneration.
 */
test('rejects a stale existing action outside current P0 scope', () => {
  // <lang><zh-CN>向动作包深拷贝追加一个不存在于 matrix 的受控 ID，其他既有文案保持不变。</zh-CN><en>Appends one controlled ID absent from the matrix to a deep-cloned packet while leaving all existing copy unchanged.</en></lang>
  const actions = structuredClone(actionFixture);
  actions.actions.push({ ...structuredClone(actions.actions[0]), id: 'u-removed/prop:gone', component: 'u-removed', itemId: 'prop:gone' });

  assert.throws(() => buildMigrationActionManifest(structuredClone(matrixFixture), actions), /outside the current P0 scope/u);
});
