import assert from 'node:assert/strict';
// <lang><zh-CN>只读取仓库明确列出的版本化 JSON fixture；测试不发现目录、不读取上游 checkout，也不写文件。</zh-CN><en>Reads only explicitly listed versioned JSON fixtures in the repository; the test discovers no directory, reads no upstream checkout, and writes no file.</en></lang>
import { readFile } from 'node:fs/promises';
// <lang><zh-CN>使用 Node 内建测试运行器保持门禁无额外执行依赖。</zh-CN><en>Uses the built-in Node test runner so the gate has no additional execution dependency.</en></lang>
import test from 'node:test';
// <lang><zh-CN>直接调用公开 validator，负例无需创建临时文件或扩大 Tool 的读取白名单。</zh-CN><en>Calls the public validator directly so negative cases need no temporary files or expanded Tool read allowlist.</en></lang>
import { validateApiCompatibilityManifest } from '../HIA-uView-Tool/src/api-compatibility.mjs';
// <lang><zh-CN>通过公开 Tool 入口验证真实 inspect 流程，并通过注入 writer 捕获只读文本输出。</zh-CN><en>Verifies the real inspection flow through the public Tool entry and captures read-only text output through an injected writer.</en></lang>
import { executeToolCommand, runToolCli } from '../HIA-uView-Tool/src/index.mjs';
// <lang><zh-CN>复用公开 formatter 检查同一已校验报告的稳定 JSON 投影。</zh-CN><en>Reuses the public formatter to verify the stable JSON projection of the same validated report.</en></lang>
import { formatReport } from '../HIA-uView-Tool/src/report.mjs';

/**
 * @module verify-api-compatibility-contract.test
 * @lang zh-CN 锁定 HIA-uView-UI 对 uView-Pro 0.6.15 的不可变比较来源、99 组件在声明 scope 内的 API inventory、本地成员关联、能力级优先级与 HIA-uView-Tool 只读 inspect 边界；合法 unsupported/unresolved 仍是事实，不被误判为 schema 失败。
 * @lang en Locks the immutable uView-Pro 0.6.15 comparison provenance, the 99-component API inventory within its declared scopes, local membership linkage, capability-level priorities, and read-only HIA-uView-Tool inspection boundary; valid unsupported and unresolved states remain facts rather than being misreported as schema failures.
 */

/**
 * @lang zh-CN 真实 API compatibility matrix 的唯一公开仓内路径。
 * @lang en Sole public repository-local path of the real API compatibility matrix.
 */
const apiCompatibilityPath = 'HIA-uView-UI/hia-uview.api-compatibility.json';

/**
 * @lang zh-CN 与矩阵关联的本地 component manifest 路径。
 * @lang en Path of the local component manifest linked by the matrix.
 */
const componentManifestPath = 'HIA-uView-UI/hia-uview.components.json';

/**
 * @lang zh-CN 真实 Tool configuration 路径；其 report.format 保持 text，JSON 由同一 report 经公开 formatter 投影。
 * @lang en Path of the real Tool configuration; its report.format remains text while JSON is projected from the same report through the public formatter.
 */
const configurationPath = 'hia-uview.config.json';

// <lang><zh-CN>并行读取三份固定 JSON，避免测试通过目录发现接受未审计输入。</zh-CN><en>Read the three fixed JSON files in parallel so the test cannot accept unaudited input through directory discovery.</en></lang>
const [apiCompatibilitySource, componentManifestSource, configurationSource] = await Promise.all([
  readFile(apiCompatibilityPath, 'utf8'),
  readFile(componentManifestPath, 'utf8'),
  readFile(configurationPath, 'utf8')
]);

/**
 * @lang zh-CN 由生成器提交的真实矩阵 fixture；所有负例均先深拷贝，禁止测试间共享突变。
 * @lang en Real generated matrix fixture committed by the generator; every negative case starts from a deep clone so mutations cannot leak between tests.
 */
const apiCompatibilityFixture = JSON.parse(apiCompatibilitySource);

/**
 * @lang zh-CN 本地 UI component manifest fixture，用于建立 loader 等价的路径索引与 99 项成员资格检查。
 * @lang en Local UI component-manifest fixture used to build a loader-equivalent path index and verify membership of all 99 entries.
 */
const componentManifestFixture = JSON.parse(componentManifestSource);

/**
 * @lang zh-CN 真实声明式 Tool configuration fixture；validator 只消费其中已校验的 profile。
 * @lang en Real declarative Tool-configuration fixture; the validator consumes only its already validated profile.
 */
const configurationFixture = JSON.parse(configurationSource);

/**
 * @lang zh-CN 完整冻结比较来源；精确值同时区分 0.6.15 release、既有 0.6.14 comparison commit 与真实 0.6.14 tag commit。
 * @lang en Complete frozen comparison provenance; exact values distinguish the 0.6.15 release, the established 0.6.14 comparison commit, and the actual 0.6.14 tag commit.
 */
const expectedComparisonProvenance = {
  repository: 'https://github.com/anyup/uView-Pro',
  releaseTag: 'v0.6.15',
  commit: 'bec4b39cd3195354d65c1fc8722745d72052bd8c',
  tree: 'ee561c6c12e40922d137b24fb0adb6e7f7a18c1e',
  sourceRole: 'comparison-only',
  package: {
    id: 'uview-pro',
    version: '0.6.15',
    path: 'src/uni_modules/uview-pro/package.json',
    blob: '9a9e4fbdb7af50580b89f837326a8db00f8999c8',
    tree: '8c356eb79adb16c63c2b1b44e87c6aaf27a37810',
    digest: 'sha256:17503c605ea553e1124b3cecfc37da4b489603b667660aef7b87bf0face365a7'
  },
  license: {
    id: 'MIT',
    path: 'LICENSE',
    blob: '837f9643580783834339d1b40e58772413895e39',
    digest: 'sha256:906b494a3fa3b4e270bb08fc69625176e552eb0acc922c253c4d5fbfa5544627'
  },
  components: {
    path: 'src/uni_modules/uview-pro/components',
    count: 99,
    tree: '27e58b2924e42ebd761cdf5a245c61f7f8984d6f',
    nameDigest: 'sha256:08686600adef497f4fe11a9150964d3c7f926f3fdabfa7325967d319a226bec2'
  },
  materialization: {
    scope: 'src/uni_modules/uview-pro',
    algorithm: 'sha256-framed-relative-path-kind-content-v1',
    framing: 'magic|uint32be(fileCount)|repeat(uint32be(pathUtf8Length)|pathUtf8|kindByte|uint64be(contentLength)|content)',
    pathEncoding: 'utf-8',
    pathOrder: 'unicode-code-point',
    textDetection: 'utf8-roundtrip-without-nul',
    textNormalization: 'CRLF/CR-to-LF',
    binaryNormalization: 'raw-bytes',
    fileCount: 290,
    textFileCount: 290,
    binaryFileCount: 0,
    contentDigest: 'sha256:ab93f693ed0492f5498d51a513c70546d858ed8eddf733d7756060e4d1fbd0b5'
  },
  easycom: {
    repositoryFixtureStatus: 'delivered',
    packageStatus: 'consumer-configuration-required',
    basis: 'validated-demo-pages-json',
    path: 'src/pages.json',
    digest: 'sha256:695b82951b9ff1297844206f8bcba21433458091dcf157e50e81544ef420b192',
    autoscan: true,
    pattern: '^u-(.*)',
    replacement: '@/uni_modules/uview-pro/components/u-$1/u-$1.vue'
  },
  previous: {
    version: '0.6.14',
    comparisonCommit: '091b5bb70312f43026c9847cca0709cafccaaaaa',
    comparisonTree: '675cd4e00fee808ecc49363996be25d4b2498604',
    packageTree: 'e40c0985c2a82f172c7372f00ca05cbee4181b12',
    componentsTree: '27e58b2924e42ebd761cdf5a245c61f7f8984d6f',
    releaseTag: 'v0.6.14',
    releaseCommit: '69d1e8b37aaad6ffdf14af96b0c022a62f98a0a7'
  },
  compare: {
    from: '091b5bb70312f43026c9847cca0709cafccaaaaa',
    to: 'bec4b39cd3195354d65c1fc8722745d72052bd8c',
    changedPathCount: 10,
    changedPaths: [
      { status: 'modified', path: 'CHANGELOG.md' },
      { status: 'modified', path: 'package.json' },
      { status: 'modified', path: 'scripts/README.md' },
      { status: 'deleted', path: 'scripts/release.bat' },
      { status: 'deleted', path: 'scripts/release.ps1' },
      { status: 'deleted', path: 'scripts/release.sh' },
      { status: 'added', path: 'scripts/sync-to-node.js' },
      { status: 'modified', path: 'src/uni_modules/uview-pro/changelog.md' },
      { status: 'modified', path: 'src/uni_modules/uview-pro/package.json' },
      { status: 'modified', path: 'src/uni_modules/uview-pro/types/index.d.ts' }
    ],
    componentPathsChanged: false
  }
};

/**
 * @lang zh-CN 构造与真实 component loader 返回值同形的隔离 validator 输入；函数不读取文件且每次返回全新 JSON 数据。
 * @lang en Builds isolated validator input matching the real component loader result shape; the function reads no files and returns fresh JSON data every time.
 * @returns {{manifest:object,configuration:object,componentManifests:Map<string,object>}} <lang><zh-CN>可安全突变的矩阵、配置与按路径索引的 component loader 结果。</zh-CN><en>Safely mutable matrix, configuration, and path-indexed component-loader result.</en></lang>
 */
function createValidationInput() {
  // <lang><zh-CN>深拷贝矩阵，使单个 schema 负例不能污染后续断言。</zh-CN><en>Deep-clone the matrix so one schema-negative case cannot contaminate later assertions.</en></lang>
  const manifest = structuredClone(apiCompatibilityFixture);
  // <lang><zh-CN>深拷贝 configuration，保持 profile 检查与真实命令一致。</zh-CN><en>Deep-clone the configuration so profile validation matches the real command.</en></lang>
  const configuration = structuredClone(configurationFixture);
  // <lang><zh-CN>loader entry 只含规范相对路径、已解析 manifest 与空诊断，不伪造源文件存在性。</zh-CN><en>The loader entry contains only the normalized relative path, parsed manifest, and empty diagnostics and does not fabricate source-file existence.</en></lang>
  const componentManifestEntry = {
    path: componentManifestPath,
    manifest: structuredClone(componentManifestFixture),
    diagnostics: []
  };
  // <lang><zh-CN>Map 键必须与矩阵 local.componentManifest.path 精确一致，避免模糊路径关联。</zh-CN><en>The Map key must exactly match matrix local.componentManifest.path, avoiding fuzzy path linkage.</en></lang>
  const componentManifests = new Map([[componentManifestPath, componentManifestEntry]]);

  // <lang><zh-CN>返回值只供 validator 与当前测试使用，不共享到 Tool runtime。</zh-CN><en>The result is used only by the validator and current test and is not shared with Tool runtime.</en></lang>
  return { manifest, configuration, componentManifests };
}

/**
 * @lang zh-CN 从确定性诊断列表提取公开 code，便于负例只锁定错误类别而不耦合可读 message。
 * @lang en Extracts public codes from deterministic diagnostics so negative cases lock the error category without coupling to human-readable messages.
 * @param {Array<{code:string}>} diagnostics <lang><zh-CN>validator 返回的诊断。</zh-CN><en>Diagnostics returned by the validator.</en></lang>
 * @returns {string[]} <lang><zh-CN>保持 validator 顺序的诊断 code。</zh-CN><en>Diagnostic codes preserving validator order.</en></lang>
 */
function getDiagnosticCodes(diagnostics) {
  // <lang><zh-CN>只投影稳定公开字段，避免测试依赖内部 category 或未来措辞。</zh-CN><en>Project only the stable public field so the test does not depend on internal category or future wording.</en></lang>
  return diagnostics.map((diagnostic) => diagnostic.code);
}

/**
 * @lang zh-CN 对一份全新真实矩阵应用单一受控突变，并要求 validator 返回目标诊断；helper 不写回 fixture。
 * @lang en Applies one controlled mutation to a fresh real matrix and requires the validator to return the target diagnostic; the helper never writes back to the fixture.
 * @param {string} label <lang><zh-CN>失败时显示的公开负例说明。</zh-CN><en>Public negative-case description shown on failure.</en></lang>
 * @param {function(object): void} mutate <lang><zh-CN>仅修改当前深拷贝的回调。</zh-CN><en>Callback that mutates only the current deep clone.</en></lang>
 * @param {string} expectedCode <lang><zh-CN>必须出现的稳定诊断 code。</zh-CN><en>Stable diagnostic code that must be present.</en></lang>
 * @returns {void} <lang><zh-CN>断言成功时无返回值。</zh-CN><en>No return value when the assertion succeeds.</en></lang>
 */
function assertMutationRejected(label, mutate, expectedCode) {
  // <lang><zh-CN>每次负例均从相同已验证基线重新构造，防止多个错误互相掩盖。</zh-CN><en>Every negative case is rebuilt from the same validated baseline so errors cannot mask one another.</en></lang>
  const { manifest, configuration, componentManifests } = createValidationInput();
  // <lang><zh-CN>突变函数只拥有当前 manifest；配置与本地成员索引保持可信对照。</zh-CN><en>The mutator owns only the current manifest while configuration and local membership index remain trusted controls.</en></lang>
  mutate(manifest);
  // <lang><zh-CN>直接 validator 调用不打开突变路径，也不运行任何矩阵文本。</zh-CN><en>The direct validator call opens no mutated path and executes no matrix text.</en></lang>
  const diagnostics = validateApiCompatibilityManifest(
    manifest,
    apiCompatibilityPath,
    configuration,
    componentManifests
  );
  // <lang><zh-CN>稳定 code 集是唯一错误断言面；message 继续可读但可独立改进。</zh-CN><en>The stable code set is the sole error assertion surface while messages remain readable and independently evolvable.</en></lang>
  const diagnosticCodes = getDiagnosticCodes(diagnostics);

  assert.ok(diagnosticCodes.includes(expectedCode), `${label}: ${diagnosticCodes.join(', ')}`);
}

/**
 * @lang zh-CN 按 API 维度现场累计全部 99 个组件的 item 数；不信任生成物中不存在的自报全局 summary。
 * @lang en Counts items for one API dimension across all 99 components on the spot and does not trust a nonexistent self-reported global summary in the generated artifact.
 * @param {object} manifest <lang><zh-CN>已解析矩阵。</zh-CN><en>Parsed matrix.</en></lang>
 * @param {'props'|'events'|'slots'|'imperativeApis'} dimension <lang><zh-CN>受控 API 维度。</zh-CN><en>Controlled API dimension.</en></lang>
 * @returns {number} <lang><zh-CN>该维度全部 items 总数。</zh-CN><en>Total item count for the dimension.</en></lang>
 */
function countApiItems(manifest, dimension) {
  // <lang><zh-CN>reduce 只读取已校验容器的 items.length，不修改组件或数组。</zh-CN><en>The reduction reads only items.length from validated containers and mutates neither components nor arrays.</en></lang>
  return manifest.components.reduce((total, component) => total + component[dimension].items.length, 0);
}

/**
 * @lang zh-CN 查找必需组件并在生成物遗漏时立即给出可读断言，而不是产生后续 undefined 异常。
 * @lang en Finds a required component and fails immediately with a readable assertion if the artifact omits it rather than causing a later undefined exception.
 * @param {object} manifest <lang><zh-CN>已解析矩阵。</zh-CN><en>Parsed matrix.</en></lang>
 * @param {string} componentName <lang><zh-CN>精确 `u-` 组件名。</zh-CN><en>Exact `u-` component name.</en></lang>
 * @returns {object} <lang><zh-CN>匹配的组件 record。</zh-CN><en>Matching component record.</en></lang>
 */
function requireComponent(manifest, componentName) {
  // <lang><zh-CN>find 保留 manifest 顺序且不会推断 alias。</zh-CN><en>find preserves manifest order and infers no alias.</en></lang>
  const component = manifest.components.find((candidate) => candidate.name === componentName);
  // <lang><zh-CN>组件缺失属于生成契约失败，测试在读取其 API 前终止。</zh-CN><en>A missing component is a generation-contract failure, so the test stops before reading its APIs.</en></lang>
  assert.ok(component, `Missing API compatibility component: ${componentName}`);
  return component;
}

/**
 * @lang zh-CN 为负例/正例构造一个只归属指定组件与单一 container 的 `static-parser` 问题；helper 只改变当前深拷贝，不触碰共享 fixture。
 * @lang en Constructs a `static-parser` issue owned by one specified component and one container for positive/negative cases; the helper mutates only the current deep clone and never the shared fixture.
 * @param {object} manifest <lang><zh-CN>当前测试独占的矩阵深拷贝。</zh-CN><en>Matrix deep clone owned by the current test.</en></lang>
 * @param {string} componentName <lang><zh-CN>问题拥有者组件名。</zh-CN><en>Name of the issue-owning component.</en></lang>
 * @param {'props'|'events'|'slots'|'imperativeApis'|'aliases'} surface <lang><zh-CN>直接绑定问题的唯一 container。</zh-CN><en>Sole container directly binding the issue.</en></lang>
 * @returns {{component:object,issueId:string}} <lang><zh-CN>已更新组件与稳定问题 ID。</zh-CN><en>Updated component and stable issue ID.</en></lang>
 */
function attachStaticParserIssue(manifest, componentName, surface) {
  // <lang><zh-CN>复用一个无 evidence 的既有 component issue 形状，避免测试发明 loader 不接受的额外字段。</zh-CN><en>Reuse the shape of an existing component issue without evidence so the test invents no additional fields rejected by the loader.</en></lang>
  const issueTemplate = manifest.issues.find((issue) => issue.id === 'UPSTREAM_U_MODAL_SERVICE_SURFACE_REQUIRES_REVIEW');
  assert.ok(issueTemplate, 'Missing component-issue template');
  // <lang><zh-CN>新问题拥有独立对象与双语 message，不共享或覆盖真实 modal 问题。</zh-CN><en>The new issue owns an independent object and bilingual message and neither shares nor overwrites the real modal issue.</en></lang>
  const issue = structuredClone(issueTemplate);
  // <lang><zh-CN>ID 使用公开稳定格式，且只作为本次 parser-owned 关联键。</zh-CN><en>The ID uses the stable public format and serves only as this parser-owned linkage key.</en></lang>
  const issueId = `UPSTREAM_${componentName.replaceAll('-', '_').toUpperCase()}_STATIC_PARSER_REVIEW`;
  issue.id = issueId;
  issue.scope = 'static-parser';
  issue.component = componentName;
  issue.message = {
    'zh-CN': '静态解析器无法完整证明当前声明范围，需要受控人工复核。',
    en: 'The static parser cannot fully prove the current declared scope and requires controlled human review.'
  };
  // <lang><zh-CN>issue registry 继续使用 locale-independent code-point 顺序。</zh-CN><en>The issue registry continues to use locale-independent code-point order.</en></lang>
  manifest.issues.push(issue);
  manifest.issues.sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));

  // <lang><zh-CN>组件汇总引用与 container 直接引用必须同时存在；任何一侧缺失都不是合法 unresolved。</zh-CN><en>Both the component summary reference and the direct container reference must exist; absence on either side is not a valid unresolved state.</en></lang>
  const component = requireComponent(manifest, componentName);
  component.issueIds = [issueId];
  component[surface].inventoryState = 'unresolved';
  component[surface].issueIds = [issueId];

  return { component, issueId };
}

/**
 * @lang zh-CN 转义主机绝对路径以用于仅检查输出泄露的正则表达式；函数不解析或规范化该路径。
 * @lang en Escapes a host absolute path for a regular expression used only to detect output leakage; the function neither resolves nor normalizes the path.
 * @param {string} value <lang><zh-CN>待转义的当前调用目录。</zh-CN><en>Current invocation directory to escape.</en></lang>
 * @returns {string} <lang><zh-CN>可安全嵌入 RegExp constructor 的文本。</zh-CN><en>Text safe to embed in the RegExp constructor.</en></lang>
 */
function escapeRegularExpression(value) {
  // <lang><zh-CN>仅转义正则元字符；目录文本不会被执行或写入报告。</zh-CN><en>Escape only regular-expression metacharacters; directory text is neither executed nor written into the report.</en></lang>
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

/**
 * @lang zh-CN 验证真实生成物锁定不可变来源、完整数量、本地 99 项成员关联与能力级优先级，而非仅声明同名组件数量。
 * @lang en Verifies that the real generated artifact locks immutable provenance, complete counts, local membership of all 99 entries, and capability-level priorities rather than merely declaring a same-name component count.
 */
test('locks immutable provenance, declared-scope API counts, and local component membership', () => {
  // <lang><zh-CN>从 fixture 深拷贝，确保本测试的对象遍历不会向共享输入写入任何派生字段。</zh-CN><en>Clone the fixture so this test's object traversal cannot write derived fields into shared input.</en></lang>
  const { manifest, configuration, componentManifests } = createValidationInput();
  // <lang><zh-CN>真实 validator 必须接受生成物；unsupported 与已引用 unresolved 不得制造失败诊断。</zh-CN><en>The real validator must accept the artifact; unsupported and referenced unresolved facts must not create failure diagnostics.</en></lang>
  const diagnostics = validateApiCompatibilityManifest(
    manifest,
    apiCompatibilityPath,
    configuration,
    componentManifests
  );
  // <lang><zh-CN>比较来源使用完整对象相等，任何浮动 ref、digest、diff 或前序 tag 偷换都会失败。</zh-CN><en>Comparison provenance uses complete object equality so any substituted floating ref, digest, diff, or predecessor tag fails.</en></lang>
  assert.deepEqual(manifest.comparison, expectedComparisonProvenance);
  assert.deepEqual(diagnostics, []);

  // <lang><zh-CN>名称清单来自实际 99 records，并保留 code-point 排序作为跨 locale 确定性契约。</zh-CN><en>The name list comes from the actual 99 records and retains code-point ordering as a cross-locale determinism contract.</en></lang>
  const componentNames = manifest.components.map((component) => component.name);
  // <lang><zh-CN>使用显式 `<`/`>` 比较器，不让主机 locale 改变排序证据。</zh-CN><en>Use an explicit `<`/`>` comparator so the host locale cannot change ordering evidence.</en></lang>
  const sortedComponentNames = [...componentNames].sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
  // <lang><zh-CN>本地 component manifest 索引支持精确名称、source 与 contract 三字段成员匹配。</zh-CN><en>The local component-manifest index supports exact membership matching across name, source, and contract.</en></lang>
  const localComponentsByName = new Map(componentManifestFixture.components.map((component) => [component.name, component]));

  assert.equal(manifest.components.length, 99);
  assert.deepEqual(componentNames, sortedComponentNames);
  assert.equal(new Set(componentNames).size, 99);
  // <lang><zh-CN>逐项证明矩阵没有用上游同名 record 绕过 HIA 本地受控组件边界。</zh-CN><en>Prove item by item that the matrix does not use an upstream same-name record to bypass the controlled local HIA component boundary.</en></lang>
  for (const component of manifest.components) {
    // <lang><zh-CN>当前本地 record 必须存在；undefined 会在 deepEqual 中形成明确失败。</zh-CN><en>The current local record must exist; undefined produces an explicit deepEqual failure.</en></lang>
    const localComponent = localComponentsByName.get(component.name);
    assert.deepEqual(
      { name: component.hia.name, source: component.hia.source, contract: component.hia.contract },
      { name: localComponent?.name, source: localComponent?.source, contract: localComponent?.contract }
    );
  }

  assert.equal(countApiItems(manifest, 'props'), 1308);
  assert.equal(countApiItems(manifest, 'events'), 200);
  assert.equal(countApiItems(manifest, 'slots'), 87);
  assert.equal(countApiItems(manifest, 'imperativeApis'), 145);
  assert.equal(manifest.issues.length, 6);

  // <lang><zh-CN>u-button 是能力级优先级校准 sentinel：常规 click 保持 P0，小程序开放能力、语言参数及其失败事件明确降至 P2。</zh-CN><en>u-button is the capability-level priority calibration sentinel: ordinary click remains P0 while Mini Program open capabilities, the language parameter, and their failure event are explicitly P2.</en></lang>
  const button = requireComponent(manifest, 'u-button');
  // <lang><zh-CN>click 从事件 inventory 精确按稳定 id 获取，不从组件总体优先级推断。</zh-CN><en>Obtain click from the event inventory by stable ID rather than inferring it from component priority.</en></lang>
  const clickEvent = button.events.items.find((item) => item.id === 'event:click');
  // <lang><zh-CN>openType 从 prop inventory 精确获取，证明平台开放能力没有继承按钮的 P0。</zh-CN><en>Obtain openType from the prop inventory, proving a platform open capability does not inherit the button's P0.</en></lang>
  const openTypeProp = button.props.items.find((item) => item.id === 'prop:openType');
  // <lang><zh-CN>lang 只服务于按钮开放能力返回信息，不能被普通文本 locale 概念误升为 P0/P1。</zh-CN><en>lang serves only button open-capability response data and cannot be promoted to P0/P1 through confusion with ordinary text locale.</en></lang>
  const languageProp = button.props.items.find((item) => item.id === 'prop:lang');
  // <lang><zh-CN>error 是原生开放能力失败面；它与常规 click 的优先级必须分离。</zh-CN><en>error is the native open-capability failure surface and must remain priority-separated from ordinary click.</en></lang>
  const errorEvent = button.events.items.find((item) => item.id === 'event:error');

  assert.equal(clickEvent?.priority, 'P0');
  assert.equal(openTypeProp?.priority, 'P2');
  assert.equal(languageProp?.priority, 'P2');
  assert.equal(errorEvent?.priority, 'P2');

  // <lang><zh-CN>u-pagination 是 defineModel 宏展开 sentinel：默认 model、修饰符 prop 与 update event 必须同时存在，防止仅扫描 defineProps/defineEmits 的旧实现回归。</zh-CN><en>u-pagination is the defineModel expansion sentinel: the default model, modifier prop, and update event must coexist so the former defineProps/defineEmits-only scan cannot regress.</en></lang>
  const pagination = requireComponent(manifest, 'u-pagination');
  // <lang><zh-CN>modelValue 保留 Number、默认值 1 与非必填事实。</zh-CN><en>modelValue preserves its Number type, default value 1, and optional fact.</en></lang>
  const modelValueProp = pagination.props.items.find((item) => item.id === 'prop:modelValue');
  // <lang><zh-CN>Vue 自动生成的 modelModifiers 仍是公开 prop，即使静态类型只能保守记录为 unknown。</zh-CN><en>Vue-generated modelModifiers remains a public prop even when its static type can only be recorded conservatively as unknown.</en></lang>
  const modelModifiersProp = pagination.props.items.find((item) => item.id === 'prop:modelModifiers');
  // <lang><zh-CN>双向模型更新事件独立计入名称级事件 inventory。</zh-CN><en>The two-way model update event is counted independently in the names-only event inventory.</en></lang>
  const modelUpdateEvent = pagination.events.items.find((item) => item.id === 'event:update:modelValue');

  assert.deepEqual(modelValueProp?.upstream, {
    name: 'modelValue',
    typeKinds: ['Number'],
    typeOrder: ['Number'],
    default: { kind: 'literal', value: 1 },
    required: false,
    validator: { kind: 'absent' }
  });
  assert.deepEqual(modelModifiersProp?.upstream.typeKinds, ['unknown']);
  assert.equal(modelUpdateEvent?.upstream.name, 'update:modelValue');

  // <lang><zh-CN>runtime prop shape 还必须保留 required、联合类型声明顺序与 validator；这些事实会影响调用方式，不能退化成排序后的类型名称集合。</zh-CN><en>The runtime prop shape must also preserve required, union-type declaration order, and validator facts because they affect consumption and cannot collapse into a sorted type-name set.</en></lang>
  const requiredEndValue = requireComponent(manifest, 'u-count-to').props.items.find((item) => item.id === 'prop:endVal');
  // <lang><zh-CN>checkbox.disabled 的 Boolean/String 集合与 String-first 声明顺序故意不同，用作 Vue Boolean casting 顺序 sentinel。</zh-CN><en>checkbox.disabled intentionally has a Boolean/String set but String-first declaration order, serving as the Vue Boolean-casting-order sentinel.</en></lang>
  const orderedDisabled = requireComponent(manifest, 'u-checkbox').props.items.find((item) => item.id === 'prop:disabled');
  // <lang><zh-CN>circle-progress.percent 的 validator 不执行源码，只保存稳定 opaque digest。</zh-CN><en>The circle-progress.percent validator never executes source and retains only a stable opaque digest.</en></lang>
  const validatedPercent = requireComponent(manifest, 'u-circle-progress').props.items.find((item) => item.id === 'prop:percent');

  assert.equal(requiredEndValue?.upstream.required, true);
  assert.deepEqual(orderedDisabled?.upstream.typeKinds, ['Boolean', 'String']);
  assert.deepEqual(orderedDisabled?.upstream.typeOrder, ['String', 'Boolean']);
  assert.deepEqual(validatedPercent?.upstream.validator, {
    kind: 'expression',
    digest: 'sha256:fab8bf9775bad074c41f8d5445956ad14ad39c427bea67b0d126e2d3795bdea6'
  });
});

/**
 * @lang zh-CN 验证真实 Tool inspect 的派生统计、文本与 JSON 输出完全确定，且不泄露调用绝对路径或组件源码正文。
 * @lang en Verifies that the real Tool inspection has fully deterministic derived statistics, text, and JSON output and leaks neither invocation absolute paths nor component source bodies.
 */
test('inspects the real matrix deterministically without host paths or source body', async () => {
  // <lang><zh-CN>两次独立执行同一只读命令，任何时间戳、随机值或遍历漂移都会破坏深相等。</zh-CN><en>Execute the same read-only command twice independently so any timestamp, random value, or traversal drift breaks deep equality.</en></lang>
  const firstReport = await executeToolCommand(['inspect', 'api-compatibility']);
  const secondReport = await executeToolCommand(['inspect', 'api-compatibility']);

  assert.equal(firstReport.ok, true);
  assert.deepEqual(firstReport.diagnostics, []);
  assert.deepEqual(secondReport, firstReport);
  assert.equal(firstReport.details.kind, 'api-compatibility');
  assert.deepEqual(firstReport.details.manifests[0].summary, {
    componentCount: 99,
    itemCount: 1740,
    priorities: { P0: 30, P1: 42, P2: 27 },
    dispositions: { compatible: 42, mapped: 261, unsupported: 1437 },
    unresolvedInventories: 2,
    issueCount: 6
  });

  // <lang><zh-CN>注入 writer 捕获两次 text 输出；CLI 不创建 snapshot 或临时文件。</zh-CN><en>Capture two text outputs through injected writers; the CLI creates no snapshot or temporary file.</en></lang>
  let firstTextOutput = '';
  let secondTextOutput = '';
  // <lang><zh-CN>第一次 writer 只追加当前 Tool 生成的受限报告片段。</zh-CN><en>The first writer appends only bounded report fragments generated by the current Tool.</en></lang>
  const firstExitCode = await runToolCli(['inspect', 'api-compatibility'], process.cwd(), (value) => {
    // <lang><zh-CN>内存字符串不进入文件系统，也不改变 report。</zh-CN><en>The in-memory string never enters the filesystem and does not change the report.</en></lang>
    firstTextOutput += value;
  });
  // <lang><zh-CN>第二次 writer 使用独立累积器验证输出不依赖先前调用状态。</zh-CN><en>The second writer uses an independent accumulator to prove output does not depend on prior invocation state.</en></lang>
  const secondExitCode = await runToolCli(['inspect', 'api-compatibility'], process.cwd(), (value) => {
    // <lang><zh-CN>只保存第二次受限文本用于精确比较。</zh-CN><en>Retain only the second bounded text for exact comparison.</en></lang>
    secondTextOutput += value;
  });

  assert.equal(firstExitCode, 0);
  assert.equal(secondExitCode, 0);
  assert.equal(secondTextOutput, firstTextOutput);
  assert.match(firstTextOutput, /uview-pro@0\.6\.15; bec4b39cd3195354d65c1fc8722745d72052bd8c/u);
  assert.match(firstTextOutput, /99 components; 1740 API items/u);

  // <lang><zh-CN>JSON 由同一已校验 report 格式化两次，防止 serializer 注入非确定字段。</zh-CN><en>Format JSON twice from the same validated report so the serializer cannot inject nondeterministic fields.</en></lang>
  const firstJsonOutput = formatReport(firstReport, 'json');
  const secondJsonOutput = formatReport(firstReport, 'json');
  // <lang><zh-CN>解析后的 JSON 必须仍对应原报告，证明完整 mapping 没有被 text formatter 的摘要规则改变。</zh-CN><en>Parsed JSON must still match the original report, proving complete mappings are not changed by text formatter summarization rules.</en></lang>
  const parsedJsonReport = JSON.parse(firstJsonOutput);

  assert.equal(secondJsonOutput, firstJsonOutput);
  assert.deepEqual(parsedJsonReport, firstReport);
  assert.equal(parsedJsonReport.details.manifests[0].components.length, 99);

  // <lang><zh-CN>同时检查 Windows 与 slash 形式的调用根，避免路径分隔符转换绕过隐私门禁。</zh-CN><en>Check both Windows and slash forms of the invocation root so separator conversion cannot bypass the privacy gate.</en></lang>
  const escapedWindowsRoot = escapeRegularExpression(process.cwd());
  const escapedSlashRoot = escapeRegularExpression(process.cwd().replaceAll('\\', '/'));
  // <lang><zh-CN>合并两种公开输出仅用于泄露 sentinel，不会回写或再次格式化。</zh-CN><en>Combine the two public outputs only for leakage sentinels; it is neither written back nor reformatted.</en></lang>
  const combinedOutput = `${firstTextOutput}\n${firstJsonOutput}`;

  assert.doesNotMatch(combinedOutput, new RegExp(escapedWindowsRoot, 'iu'));
  assert.doesNotMatch(combinedOutput, new RegExp(escapedSlashRoot, 'iu'));
  // <lang><zh-CN>驱动器 sentinel 要求路径前存在文本边界，避免把 HTTPS scheme 尾部的 `s:/` 误判为 Windows 驱动器。</zh-CN><en>The drive sentinel requires a text boundary before the path so the trailing `s:/` in an HTTPS scheme is not mistaken for a Windows drive.</en></lang>
  assert.doesNotMatch(combinedOutput, /(?:^|[\s"'])[A-Za-z]:[\\/]/u);
  assert.doesNotMatch(combinedOutput, /<template\b|<script\b|defineProps\s*\(|defineEmits\s*\(|@lang\s+(?:zh-CN|en)/u);
});

/**
 * @lang zh-CN 验证 parser-owned 未决原因只能由一个明确组件与一个 container 直接拥有；它是可审计事实，不会因为 `unresolved` 状态本身令 Tool 失败。
 * @lang en Verifies that a parser-owned unresolved cause must be directly owned by one explicit component and one container; it remains an auditable fact and does not fail the Tool merely because its state is `unresolved`.
 */
test('accepts one directly owned static-parser issue on one surface', () => {
  // <lang><zh-CN>使用 alias surface 可验证 parser 例外，而不改变 `api-items-only` migration counts。</zh-CN><en>Use the alias surface to verify the parser exception without changing `api-items-only` migration counts.</en></lang>
  const { manifest, configuration, componentManifests } = createValidationInput();
  attachStaticParserIssue(manifest, 'u-button', 'aliases');
  // <lang><zh-CN>有效 parser-owned issue 不产生结构诊断；其未决状态仍保留在 manifest 中供 inspect 披露。</zh-CN><en>A valid parser-owned issue produces no structural diagnostic while its unresolved state remains in the manifest for inspection disclosure.</en></lang>
  const diagnostics = validateApiCompatibilityManifest(
    manifest,
    apiCompatibilityPath,
    configuration,
    componentManifests
  );

  assert.deepEqual(diagnostics, []);
});

/**
 * @lang zh-CN 验证 validator 拒绝 provenance、profile、必填字段、状态、迁移 target/reason、issue/default、唯一顺序与路径边界破坏，并保持每个负例相互隔离。
 * @lang en Verifies that the validator rejects broken provenance, profile, required fields, state, migration target/reason, issue/default, uniqueness/order, and path boundaries while keeping every negative case isolated.
 */
test('rejects malformed matrix facts through stable diagnostics', () => {
  // <lang><zh-CN>格式合法但与 compare.to 不一致的 commit 不能冒充冻结来源。</zh-CN><en>A well-formed commit inconsistent with compare.to cannot masquerade as frozen provenance.</en></lang>
  assertMutationRejected('wrong immutable commit', (manifest) => {
    // <lang><zh-CN>仅替换 commit，保留其余 provenance 作为一致性对照。</zh-CN><en>Replace only the commit while retaining all other provenance as consistency controls.</en></lang>
    manifest.comparison.commit = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  }, 'API_COMPATIBILITY_REFERENCE_INVALID');

  // <lang><zh-CN>矩阵 profile 不能脱离 configuration 的 mp-weixin 选择。</zh-CN><en>The matrix profile cannot diverge from the configuration's mp-weixin selection.</en></lang>
  assertMutationRejected('wrong matrix profile', (manifest) => {
    // <lang><zh-CN>使用受支持语义之外的 profile 值触发精确失配。</zh-CN><en>Use a different profile value to trigger the exact mismatch.</en></lang>
    manifest.profile = 'h5';
  }, 'API_COMPATIBILITY_PROFILE_MISMATCH');

  // <lang><zh-CN>删除 comparison 必填 tree，证明 schema 不用默认值补齐 provenance。</zh-CN><en>Delete the required comparison tree to prove the schema does not fill provenance with a default.</en></lang>
  assertMutationRejected('missing required field', (manifest) => {
    // <lang><zh-CN>delete 仅作用于本次深拷贝。</zh-CN><en>delete affects only this deep clone.</en></lang>
    delete manifest.comparison.tree;
  }, 'API_COMPATIBILITY_FIELD_MISSING');

  // <lang><zh-CN>pending 不是完整或已引用 unresolved，必须被显式拒绝。</zh-CN><en>pending is neither complete nor referenced unresolved and must be rejected explicitly.</en></lang>
  assertMutationRejected('pending inventory state', (manifest) => {
    // <lang><zh-CN>选择 u-button 事件容器，避免与已存在 unresolved 组件混淆。</zh-CN><en>Select the u-button event container to avoid confusion with an existing unresolved component.</en></lang>
    requireComponent(manifest, 'u-button').events.inventoryState = 'pending';
  }, 'API_COMPATIBILITY_INVENTORY_INVALID');

  // <lang><zh-CN>mapped 必须指向当前 item 声明的非空 HIA target。</zh-CN><en>mapped must point to a nonempty HIA target declared by the current item.</en></lang>
  assertMutationRejected('mapped item without a target', (manifest) => {
    // <lang><zh-CN>空 target 保留字段形状，专门验证 target 语义而非缺字段诊断。</zh-CN><en>An empty target preserves field shape and specifically validates target semantics rather than missing-field handling.</en></lang>
    const clickEvent = requireComponent(manifest, 'u-button').events.items.find((item) => item.id === 'event:click');
    clickEvent.migration.target = '';
  }, 'API_COMPATIBILITY_MIGRATION_TARGET_INVALID');

  // <lang><zh-CN>unsupported 仍须说明稳定 reasonCode，不能以空字符串隐藏未知。</zh-CN><en>unsupported still requires a stable reasonCode and cannot hide unknown state behind an empty string.</en></lang>
  assertMutationRejected('unsupported item without a reason', (manifest) => {
    // <lang><zh-CN>openType 当前是明确 unsupported，清空 reason 只测试该分支。</zh-CN><en>openType is explicitly unsupported, so clearing its reason isolates that branch.</en></lang>
    const openTypeProp = requireComponent(manifest, 'u-button').props.items.find((item) => item.id === 'prop:openType');
    openTypeProp.migration.reasonCode = '';
  }, 'API_COMPATIBILITY_MIGRATION_INVALID');

  // <lang><zh-CN>unresolved inventory 必须由组件 issueIds 引用可审计原因。</zh-CN><en>An unresolved inventory must reference an auditable reason through component issueIds.</en></lang>
  assertMutationRejected('unresolved inventory without an issue', (manifest) => {
    // <lang><zh-CN>u-button 没有 issueIds；将其 slot inventory 标为 unresolved 可精确触发引用门禁。</zh-CN><en>u-button has no issueIds; marking its slot inventory unresolved precisely triggers the reference gate.</en></lang>
    requireComponent(manifest, 'u-button').slots.inventoryState = 'unresolved';
  }, 'API_COMPATIBILITY_ISSUE_REFERENCE_INVALID');

  // <lang><zh-CN>即使 issue 属于同一组件，也不能用 imperative surface 的原因替 props unresolved 兜底。</zh-CN><en>Even an issue owned by the same component cannot use an imperative-surface reason to satisfy an unresolved props inventory.</en></lang>
  assertMutationRejected('wrong-surface component issue', (manifest) => {
    // <lang><zh-CN>u-modal 已合法拥有 service/imperative issue；把它直接挂到 props 可隔离验证 surface ownership。</zh-CN><en>u-modal already legally owns a service/imperative issue; attaching it directly to props isolates surface ownership validation.</en></lang>
    const modal = requireComponent(manifest, 'u-modal');
    modal.props.inventoryState = 'unresolved';
    modal.props.issueIds = ['UPSTREAM_U_MODAL_SERVICE_SURFACE_REQUIRES_REVIEW'];
  }, 'API_COMPATIBILITY_ISSUE_REFERENCE_INVALID');

  // <lang><zh-CN>package/global issue 不能通过复制到组件与 container 列表来伪装成具体 surface 的未决依据。</zh-CN><en>A package/global issue cannot masquerade as a surface-specific unresolved basis merely by being copied into component and container lists.</en></lang>
  assertMutationRejected('global issue used as a surface issue', (manifest) => {
    // <lang><zh-CN>保留 issue registry 不变，只制造非法反向引用，证明 validator 核对 owner 与 scope，而非仅检查 ID 存在。</zh-CN><en>Keep the issue registry unchanged and create only invalid reverse references, proving the validator checks owner and scope rather than mere ID existence.</en></lang>
    const button = requireComponent(manifest, 'u-button');
    button.slots.inventoryState = 'unresolved';
    button.slots.issueIds = ['UPSTREAM_PACKAGE_TYPES_ENTRY_MISSING'];
    button.issueIds = ['UPSTREAM_PACKAGE_TYPES_ENTRY_MISSING'];
  }, 'API_COMPATIBILITY_ISSUE_REFERENCE_INVALID');

  // <lang><zh-CN>即使 parser-owned issue 的 owner 正确，也不能同时为两个 container 兜底。</zh-CN><en>Even a parser-owned issue with the correct owner cannot justify two containers simultaneously.</en></lang>
  assertMutationRejected('static-parser issue reused across surfaces', (manifest) => {
    // <lang><zh-CN>helper 先建立合法 alias 绑定，再把同一 ID 非法复用到 slot surface。</zh-CN><en>The helper first creates a legal alias binding, then illegally reuses the same ID on the slot surface.</en></lang>
    const { component, issueId } = attachStaticParserIssue(manifest, 'u-button', 'aliases');
    component.slots.inventoryState = 'unresolved';
    component.slots.issueIds = [issueId];
    // <lang><zh-CN>slot 是 API item container，因此同步其派生 unresolved count，令负例只聚焦跨 surface 复用。</zh-CN><en>Slots is an API-item container, so update its derived unresolved count to keep the negative case focused on cross-surface reuse.</en></lang>
    component.migration.counts.unresolved = 1;
  }, 'API_COMPATIBILITY_ISSUE_REFERENCE_INVALID');

  // <lang><zh-CN>组件 types 的两份公开投影必须完全一致，不能分别指向两个看似安全的摘要。</zh-CN><en>The two public component-types projections must be exactly equal and cannot point to two individually plausible digests.</en></lang>
  assertMutationRejected('divergent upstream type projection', (manifest) => {
    // <lang><zh-CN>只修改 delivery 维度的重复投影，保留 component.upstream.types 作为可信对照。</zh-CN><en>Mutate only the duplicate projection in the delivery dimension while retaining component.upstream.types as the trusted control.</en></lang>
    const button = requireComponent(manifest, 'u-button');
    button.types.upstream.digest = 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  }, 'API_COMPATIBILITY_DELIVERY_INVALID');

  // <lang><zh-CN>安全相对路径仍不能跨到另一个组件目录，否则 provenance 与当前组件名脱钩。</zh-CN><en>A safe relative path still cannot cross into another component directory because that would detach provenance from the current component name.</en></lang>
  assertMutationRejected('upstream source crosses component directory', (manifest) => {
    // <lang><zh-CN>目标路径本身合法且存在于比较树的声明空间，专门验证逐组件 containment。</zh-CN><en>The target path is itself safe and belongs to the declared comparison tree, isolating per-component containment.</en></lang>
    requireComponent(manifest, 'u-button').upstream.source.path = 'src/uni_modules/uview-pro/components/u-alert/u-alert.vue';
  }, 'API_COMPATIBILITY_COMPONENT_INVALID');

  // <lang><zh-CN>literal default 仅接受 JSON primitive/null，object 必须使用受控 factory 分类。</zh-CN><en>A literal default accepts only a JSON primitive or null; an object requires a controlled factory classification.</en></lang>
  assertMutationRejected('invalid prop default', (manifest) => {
    // <lang><zh-CN>将 openType 默认值替换为 object，同时保留合法 kind 以测试 one-of value 约束。</zh-CN><en>Replace the openType default with an object while retaining a valid kind to test the one-of value constraint.</en></lang>
    const openTypeProp = requireComponent(manifest, 'u-button').props.items.find((item) => item.id === 'prop:openType');
    openTypeProp.upstream.default = { kind: 'literal', value: {} };
  }, 'API_COMPATIBILITY_DEFAULT_INVALID');

  // <lang><zh-CN>同一 API id 不能在一个 inventory 中出现两次，即使 records 内容完全相同。</zh-CN><en>The same API ID cannot appear twice in one inventory even when the records are otherwise identical.</en></lang>
  assertMutationRejected('duplicate API item', (manifest) => {
    // <lang><zh-CN>复制 click record 到同一事件列表末尾，不复用对象引用。</zh-CN><en>Clone the click record to the end of the same event list without reusing its object reference.</en></lang>
    const events = requireComponent(manifest, 'u-button').events.items;
    events.push(structuredClone(events.find((item) => item.id === 'event:click')));
  }, 'API_COMPATIBILITY_API_ITEM_DUPLICATE');

  // <lang><zh-CN>单组件 API inventory 也必须使用与组件清单相同的 locale-independent 顺序，避免不同 ICU 主机产生不同矩阵字节。</zh-CN><en>A component API inventory must use the same locale-independent ordering as the component list so hosts with different ICU data cannot generate different matrix bytes.</en></lang>
  assertMutationRejected('out-of-order API items', (manifest) => {
    // <lang><zh-CN>交换 u-alert-tips 的前两个 prop，只破坏 item ID 顺序而不改变集合、数量或组件汇总。</zh-CN><en>Swap the first two u-alert-tips props, changing only item-ID order while preserving the set, count, and component summary.</en></lang>
    const props = requireComponent(manifest, 'u-alert-tips').props.items;
    [props[0], props[1]] = [props[1], props[0]];
  }, 'API_COMPATIBILITY_API_ITEM_ORDER_INVALID');

  // <lang><zh-CN>99 个组件必须使用 code-point 顺序，不能依赖读取或主机 locale 后再排序。</zh-CN><en>All 99 components must use code-point order and cannot depend on sorting after read or on host locale.</en></lang>
  assertMutationRejected('out-of-order components', (manifest) => {
    // <lang><zh-CN>交换前两项保持数量与成员集合不变，仅破坏声明顺序。</zh-CN><en>Swap the first two entries, preserving count and membership while breaking declaration order only.</en></lang>
    [manifest.components[0], manifest.components[1]] = [manifest.components[1], manifest.components[0]];
  }, 'API_COMPATIBILITY_COMPONENT_ORDER_INVALID');

  // <lang><zh-CN>路径摘要 record 不能以父目录片段离开项目根；validator 只拒绝声明且绝不打开该路径。</zh-CN><en>A path-digest record cannot leave the project root through a parent segment; the validator rejects only the declaration and never opens the path.</en></lang>
  assertMutationRejected('unsafe repository-relative path', (manifest) => {
    // <lang><zh-CN>runtimeEntry 路径改为越界形式，digest 保持合法以隔离路径错误。</zh-CN><en>Change runtimeEntry to an escaping path while retaining a valid digest to isolate the path error.</en></lang>
    manifest.local.runtimeEntry.path = '../outside/index.mjs';
  }, 'API_COMPATIBILITY_PATH_INVALID');
});
