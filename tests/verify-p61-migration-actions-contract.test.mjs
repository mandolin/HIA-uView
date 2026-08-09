import assert from 'node:assert/strict';
// <lang><zh-CN>测试只读取明确列出的 JSON metadata；负例通过内存深拷贝交给公开 validator，不创建临时文件。</zh-CN><en>The test reads only explicitly listed JSON metadata; negative cases use in-memory deep clones with the public validator and create no temporary files.</en></lang>
import { readFile } from 'node:fs/promises';
// <lang><zh-CN>使用 Node 内建测试运行器，避免测试引入迁移执行或额外运行时依赖。</zh-CN><en>Uses the Node built-in test runner, avoiding migration execution or extra runtime dependencies in the test.</en></lang>
import test from 'node:test';
// <lang><zh-CN>公开 validator 只比较已加载 metadata，适合验证负例不会触发文件发现。</zh-CN><en>The public validator compares loaded metadata only and is suitable for verifying that negative cases trigger no file discovery.</en></lang>
import { validateMigrationActionManifest } from '../HIA-uView-Tool/src/migration-actions.mjs';
// <lang><zh-CN>公开 Tool 入口验证真实 CLI 数据流和输出边界。</zh-CN><en>The public Tool entry verifies the real CLI data flow and output boundary.</en></lang>
import { executeToolCommand, runToolCli } from '../HIA-uView-Tool/src/index.mjs';
// <lang><zh-CN>同一 formatter 用于检查 text 和 JSON 报告投影的确定性。</zh-CN><en>The same formatter is used to check determinism of text and JSON report projections.</en></lang>
import { formatReport } from '../HIA-uView-Tool/src/report.mjs';

/**
 * @module verify-p61-migration-actions-contract.test
 * @lang zh-CN 锁定首个迁移动作包的只读边界、矩阵事实关联、八组件 P0 scope 全覆盖、稳定双语报告与不安全/失配 metadata 拒绝；测试不扫描 consumer、源码或文档正文，也不生成 patch。
 * @lang en Locks the first migration-action packet's read-only boundary, matrix-fact linkage, complete P0 coverage across eight components, stable bilingual reports, and rejection of unsafe or mismatched metadata; the test scans no consumer, source, or documentation body and generates no patch.
 */

/** @lang zh-CN 真实只读 Tool configuration。 @lang en Real read-only Tool configuration. */
const configurationPath = 'hia-uview.config.json';
/** @lang zh-CN 真实已冻结 API matrix metadata。 @lang en Real frozen API-matrix metadata. */
const matrixPath = 'HIA-uView-UI/hia-uview.api-compatibility.json';
/** @lang zh-CN 首个调用方迁移动作包 metadata。 @lang en First caller-facing migration-action packet metadata. */
const actionPath = 'HIA-uView-UI/hia-uview.migration-actions.json';

// <lang><zh-CN>并行读取三个已声明 JSON，避免测试通过目录枚举接受未审计输入。</zh-CN><en>Read the three declared JSON files in parallel so the test cannot accept unaudited input through directory enumeration.</en></lang>
const [configurationSource, matrixSource, actionSource] = await Promise.all([
  readFile(configurationPath, 'utf8'),
  readFile(matrixPath, 'utf8'),
  readFile(actionPath, 'utf8')
]);

/** @lang zh-CN 已解析真实 configuration 基线。 @lang en Parsed real configuration baseline. */
const configurationFixture = JSON.parse(configurationSource);
/** @lang zh-CN 已解析真实 API matrix 基线。 @lang en Parsed real API-matrix baseline. */
const matrixFixture = JSON.parse(matrixSource);
/** @lang zh-CN 已解析真实动作包基线。 @lang en Parsed real action-packet baseline. */
const actionFixture = JSON.parse(actionSource);

/**
 * @lang zh-CN 构造隔离 validator 输入，确保每个负例互不影响，也不模拟文件系统读取。
 * @lang en Builds isolated validator input so every negative case is independent and simulates no filesystem reading.
 * @returns {{configuration:object,matrixEntries:Map<string,object>,manifest:object}} <lang><zh-CN>深拷贝的 configuration、matrix entry 和动作包。</zh-CN><en>Deep-cloned configuration, matrix entry, and action packet.</en></lang>
 */
function createValidationInput() {
  // <lang><zh-CN>configuration 深拷贝保留 profile 和明示白名单检查。</zh-CN><en>Deep-clone configuration to retain profile and declared-allowlist checks.</en></lang>
  const configuration = structuredClone(configurationFixture);
  // <lang><zh-CN>matrix entry 使用 loader 的公开 path/manifest/diagnostics 形状，且本测试明确只供应一个有效 matrix。</zh-CN><en>The matrix entry uses the loader's public path/manifest/diagnostics shape, and this test explicitly supplies one valid matrix only.</en></lang>
  const matrixEntries = new Map([[matrixPath, { path: matrixPath, manifest: structuredClone(matrixFixture), diagnostics: [] }]]);
  // <lang><zh-CN>动作包深拷贝让 mutate 不能污染其他测试或提交文件。</zh-CN><en>Deep-clone the action packet so a mutation cannot contaminate another test or the committed file.</en></lang>
  const manifest = structuredClone(actionFixture);

  return { configuration, matrixEntries, manifest };
}

/**
 * @lang zh-CN 对全新动作包应用一个受控突变，并要求公开 validator 产生目标稳定诊断 code。
 * @lang en Applies one controlled mutation to a fresh packet and requires the public validator to produce the target stable diagnostic code.
 * @param {string} label <lang><zh-CN>可读失败说明。</zh-CN><en>Readable failure description.</en></lang>
 * @param {function(object): void} mutate <lang><zh-CN>只修改当前深拷贝的回调。</zh-CN><en>Callback that changes only the current deep clone.</en></lang>
 * @param {string} expectedCode <lang><zh-CN>必需出现的稳定 code。</zh-CN><en>Stable code that must appear.</en></lang>
 * @returns {void} <lang><zh-CN>断言成功时无返回。</zh-CN><en>No return on successful assertion.</en></lang>
 */
function assertMutationRejected(label, mutate, expectedCode) {
  // <lang><zh-CN>为本次断言建立不共享的可信 matrix/configuration 对照。</zh-CN><en>Build non-shared trusted matrix/configuration controls for this assertion.</en></lang>
  const { configuration, matrixEntries, manifest } = createValidationInput();
  // <lang><zh-CN>回调只收到当前 manifest，不具备修改 matrix 或配置的引用。</zh-CN><en>The callback receives only the current manifest and has no reference that can modify the matrix or configuration.</en></lang>
  mutate(manifest);
  // <lang><zh-CN>直接 validator 调用不打开 docs/source/application，也不执行动作文本。</zh-CN><en>The direct validator call opens no docs/source/application and executes no action text.</en></lang>
  const diagnostics = validateMigrationActionManifest(manifest, actionPath, configuration, matrixEntries);
  // <lang><zh-CN>仅检查稳定 code，保留 message 的独立可读性改进空间。</zh-CN><en>Check only the stable code, preserving room for independent message readability improvements.</en></lang>
  const codes = diagnostics.map((diagnostic) => diagnostic.code);

  assert.ok(codes.includes(expectedCode), `${label}: ${codes.join(', ')}`);
}

/**
 * @lang zh-CN 转义当前工作目录，只用于断言报告没有泄露调用主机绝对路径。
 * @lang en Escapes the current working directory only to assert that reports disclose no invocation-host absolute path.
 * @param {string} value <lang><zh-CN>当前工作目录。</zh-CN><en>Current working directory.</en></lang>
 * @returns {string} <lang><zh-CN>可嵌入 RegExp 的转义文本。</zh-CN><en>Escaped text suitable for RegExp.</en></lang>
 */
function escapeRegularExpression(value) {
  // <lang><zh-CN>只转义正则元字符；路径不被解析、执行或写入 Tool 输出。</zh-CN><en>Escapes only regular-expression metacharacters; the path is neither parsed, executed, nor written to Tool output.</en></lang>
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @lang zh-CN 验证真实 action report 严格覆盖八个组件的全部 P0 matrix item，并在 text/JSON 中保持确定、受边界约束的只读投影。
 * @lang en Verifies that the real action report exactly covers every P0 matrix item across eight components and remains a deterministic, bounded read-only projection in text/JSON.
 */
test('inspects scope-complete P0 migration actions without source discovery or rewrite', async () => {
  // <lang><zh-CN>两次真实入口调用必须得到同一 JSON report，证明 action 顺序不依赖主机 locale 或文件发现。</zh-CN><en>Two real entry calls must yield the same JSON report, proving action order depends on neither host locale nor file discovery.</en></lang>
  const first = await executeToolCommand(['inspect', 'migration-actions']);
  const second = await executeToolCommand(['inspect', 'migration-actions']);
  // <lang><zh-CN>text writer 捕获唯一允许的人类可读投影，不需要写临时输出文件。</zh-CN><en>The text writer captures the sole permitted human-readable projection without writing a temporary output file.</en></lang>
  let textOutput = '';
  const exitCode = await runToolCli(['inspect', 'migration-actions'], process.cwd(), (value) => {
    // <lang><zh-CN>只累积 Tool 已限制的 report 文本，不保存任何 JSON source 或文档正文。</zh-CN><en>Accumulate only Tool-bounded report text and retain no JSON source or documentation body.</en></lang>
    textOutput += value;
  });
  // <lang><zh-CN>JSON formatter 复用相同已验证 report，避免单独的 JSON 代码路径掩盖字段漂移。</zh-CN><en>The JSON formatter reuses the same validated report, avoiding a separate JSON path that could hide field drift.</en></lang>
  const jsonOutput = formatReport(first, 'json');
  // <lang><zh-CN>唯一动作包的公开摘要包含 38 项，其中 15 项可直接使用、23 项需要调用方适配。</zh-CN><en>The sole packet's public summary contains 38 items: 15 usable as-is and 23 requiring caller adaptation.</en></lang>
  const packet = first.details.manifests[0];

  assert.equal(first.ok, true);
  assert.deepEqual(first, second);
  assert.equal(exitCode, 0);
  assert.equal(first.details.kind, 'migration-actions');
  assert.equal(first.details.manifests.length, 1);
  assert.equal(packet.path, actionPath);
  assert.equal(packet.apiCompatibilityManifest, matrixPath);
  assert.deepEqual(packet.summary, { actionCount: 38, dispositions: { compatible: 15, mapped: 23, unsupported: 0 } });
  assert.equal(packet.actions[0].id, 'u-checkbox/event:change');
  assert.equal(packet.actions.at(-1).id, 'u-tabbar/prop:show');
  assert.match(textOutput, /inspect: passed/);
  assert.match(textOutput, /38 actions; 15\/23\/0 compatible\/mapped\/unsupported/);
  assert.match(jsonOutput, /"kind": "migration-actions"/);
  assert.doesNotMatch(`${textOutput}\n${jsonOutput}`, new RegExp(escapeRegularExpression(process.cwd())));
  assert.doesNotMatch(`${textOutput}\n${jsonOutput}`, /<template|defineProps|readFile\(|git\s+|npm\s+(?:install|exec)/i);
});

/**
 * @lang zh-CN 验证动作包拒绝与 matrix 事实失配、coverage 缺口、越界文档路径和伪造的可执行字段。
 * @lang en Verifies that the packet rejects matrix-fact mismatches, coverage gaps, escaping documentation paths, and invented executable fields.
 */
test('rejects migration action metadata that is unsafe, incomplete, or inconsistent with its matrix', () => {
  // <lang><zh-CN>priority 不得人工升级或降级；它必须继续是 matrix item 的事实。</zh-CN><en>Priority cannot be manually raised or lowered; it must remain a matrix-item fact.</en></lang>
  assertMutationRejected('priority mismatch', (manifest) => {
    // <lang><zh-CN>首项保持其他字段不变，只偏离 P0 以隔离 priority 门禁。</zh-CN><en>Keep all other fields of the first item unchanged and diverge only from P0 to isolate the priority gate.</en></lang>
    manifest.actions[0].priority = 'P1';
  }, 'MIGRATION_ACTIONS_PRIORITY_MISMATCH');

  // <lang><zh-CN>删去一个合法 action 后，scope 不再对每个 P0 item 恰好一次完整。</zh-CN><en>After deleting one valid action, scope is no longer complete exactly once for every P0 item.</en></lang>
  assertMutationRejected('scope coverage gap', (manifest) => {
    // <lang><zh-CN>删除末项保持其他 action 的相对顺序，从而只测试 coverage。</zh-CN><en>Remove the final item while preserving relative order of the rest, isolating coverage.</en></lang>
    manifest.actions.pop();
  }, 'MIGRATION_ACTIONS_SCOPE_COVERAGE_INVALID');

  // <lang><zh-CN>docs 只能是仓内 docs/ 相对 Markdown 引用，不能把 action report 变成任意文件读取渠道。</zh-CN><en>Docs can only be repository-local docs/ relative Markdown references and cannot turn the action report into an arbitrary file-read channel.</en></lang>
  assertMutationRejected('unsafe documentation reference', (manifest) => {
    // <lang><zh-CN>只将首项 docs 改为父目录越界形式，其他 action 继续有效。</zh-CN><en>Change only the first item's docs to a parent-directory escape while keeping the other actions valid.</en></lang>
    manifest.actions[0].docs = ['../private.md'];
  }, 'MIGRATION_ACTIONS_DOCS_INVALID');

  // <lang><zh-CN>未知字段不得偷偷携带 apply、script 或 application execution 配置。</zh-CN><en>An unknown field cannot secretly carry apply, script, or application-execution configuration.</en></lang>
  assertMutationRejected('unsupported executable field', (manifest) => {
    // <lang><zh-CN>字段值不重要；schema 必须在读取或解释该值前拒绝该字段。</zh-CN><en>The field value is immaterial; schema must reject the field before reading or interpreting it.</en></lang>
    manifest.actions[0].apply = 'rewrite';
  }, 'MIGRATION_ACTIONS_FIELD_UNKNOWN');
});
