/**
 * @module verify-p15-local-composition-contract.test
 * @lang zh-CN 验证 P15 本地目录—查询—详情 fixture 的公开说明、固定匿名 mock、同步投影和禁止副作用边界。静态验证不替代 Vue runtime、UniApp compiler、微信开发者工具、真机、读屏、焦点、层叠、动画或跨端证据。
 * @lang en Verifies public guidance, fixed anonymous mock, synchronous projection, and forbidden-side-effect boundaries for the P15 local catalog-query-detail fixture. Static verification does not replace Vue runtime, UniApp compiler, WeChat DevTools, device, screen-reader, focus, layering, animation, or cross-platform evidence.
 */

// <lang><zh-CN>导入 Node 本地断言、文件读取、路径解析与测试入口；测试不访问网络、子进程、平台 API 或仓库外部输入。</zh-CN><en>Imports Node local assertions, file reading, path resolution, and test entry; the test accesses no network, child process, platform API, or repository-external input.</en></lang>
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
// <lang><zh-CN>导入 fixture 自有固定 mock 与纯同步 helper，以核对真实投影结果而不挂载页面、请求数据或写入状态。</zh-CN><en>Imports fixture-owned fixed mock and pure synchronous helpers to check actual projection results without mounting a page, requesting data, or writing state.</en></lang>
import { LOCAL_CATALOG_RECORDS, filterLocalCatalogRecords, findLocalCatalogRecord, normalizeLocalCatalogQuery } from '../HIA-uView-UI/fixtures/mp-weixin/src/pages/index/local-catalog.mjs';

/**
 * @lang zh-CN P15 公开消费说明、fixture 页面与本地 mock 的稳定仓库内相对路径。该数组只定义静态可读性检查，不形成 package export、运行时 registry 或外部文件协议。
 * @lang en Stable repository-relative paths for P15 public consumption guidance, fixture page, and local mock. This array defines static readability checks only and forms no package export, runtime registry, or external file protocol.
 */
const p15RequiredPaths = Object.freeze([
  'docs/local-composition.md',
  'HIA-uView-UI/fixtures/mp-weixin/README.md',
  'HIA-uView-UI/fixtures/mp-weixin/src/pages/index/index.vue',
  'HIA-uView-UI/fixtures/mp-weixin/src/pages/index/local-catalog.mjs'
]);

/**
 * @lang zh-CN 验证 P15 消费文档、fixture 页面和 mock helper 位于版本控制仓库内，且公开说明明确保留本地/非业务边界。
 * @lang en Verifies that P15 consumption guidance, fixture page, and mock helper reside in the version-controlled repository and that public guidance explicitly retains local and non-business boundaries.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；缺失或边界文字漂移时拒绝。</zh-CN><en>No return value; rejects when a path is missing or boundary copy drifts.</en></lang>
 */
test('keeps local composition guidance and fixture files available', async () => {
  // <lang><zh-CN>逐条检查稳定相对路径可读，避免测试依赖机器绝对路径或未受版本控制的生成物。</zh-CN><en>Checks every stable relative path for readability, avoiding dependence on machine absolute paths or unversioned generated output.</en></lang>
  await Promise.all(p15RequiredPaths.map((relativePath) => access(resolve(relativePath))));

  // <lang><zh-CN>读取公开消费说明以核对 mock、非 Biz、非后端与证据限制均对开发者可见。</zh-CN><en>Reads public consumption guidance to check that mock, non-Biz, non-backend, and evidence limits are visible to developers.</en></lang>
  const compositionGuide = await readFile(resolve('docs/local-composition.md'), 'utf8');

  assert.match(compositionGuide, /local-only/i);
  assert.match(compositionGuide, /HIA-uView-Biz/);
  assert.match(compositionGuide, /no network request/i);
  assert.match(compositionGuide, /WeChat DevTools/i);
});

/**
 * @lang zh-CN 验证固定匿名 mock 只支持本地同步字符串投影和精确选择，不携带真实/行业数据、缓存或异步数据路径。
 * @lang en Verifies that fixed anonymous mock supports only local synchronous string projection and exact selection and carries no real/industry data, cache, or asynchronous data path.
 * @returns {void} <lang><zh-CN>无返回值；断言失败时抛出。</zh-CN><en>No return value; throws on assertion failure.</en></lang>
 */
test('keeps mock query and detail projection fixed, local, and synchronous', () => {
  // <lang><zh-CN>固定三条记录是刻意最小的组合证据集合，不应增长为分页、加载或真实目录实现。</zh-CN><en>The fixed three records are a deliberately minimum composition-evidence collection and must not grow into a paging, loading, or real-directory implementation.</en></lang>
  assert.equal(LOCAL_CATALOG_RECORDS.length, 3);
  assert.equal(Object.isFrozen(LOCAL_CATALOG_RECORDS), true);

  // <lang><zh-CN>大小写和外侧空白归一化只用于本地比较，确保辅助函数不产生查询语言或远程协议。</zh-CN><en>Case and outer-whitespace normalization serves local comparison only, ensuring the helper produces no query language or remote protocol.</en></lang>
  assert.equal(normalizeLocalCatalogQuery('  BeTa  '), 'beta');

  // <lang><zh-CN>筛选结果保持固定集合顺序，并只依赖传入 mock/字符串；此断言不把匹配解释为相关性评分或权限结果。</zh-CN><en>Filter result retains fixed-collection order and depends only on supplied mock/string; this assertion does not interpret match as relevance score or permission result.</en></lang>
  const betaResults = filterLocalCatalogRecords(LOCAL_CATALOG_RECORDS, 'beta');

  assert.deepEqual(betaResults.map((record) => record.id), ['sample-beta']);
  assert.deepEqual(filterLocalCatalogRecords(LOCAL_CATALOG_RECORDS, '').map((record) => record.id), ['sample-alpha', 'sample-beta', 'sample-gamma']);

  // <lang><zh-CN>详情查找仅接受精确固定 ID；未知和空选择都安全为 null，不触发替代、重试或数据读取。</zh-CN><en>Detail lookup accepts only exact fixed ID; unknown and empty selection both safely become null and trigger no substitute, retry, or data read.</en></lang>
  assert.equal(findLocalCatalogRecord(LOCAL_CATALOG_RECORDS, 'sample-beta')?.title, '样例 Beta / Sample Beta');
  assert.equal(findLocalCatalogRecord(LOCAL_CATALOG_RECORDS, 'unknown-sample'), null);
  assert.equal(findLocalCatalogRecord(LOCAL_CATALOG_RECORDS, null), null);
});

/**
 * @lang zh-CN 验证 fixture 源码保持目录、受控查询、空态、详情、modal/notice 的页面组合，并排除本 W 禁止的可执行副作用 API。
 * @lang en Verifies that fixture source retains page composition of directory, controlled query, empty state, detail, modal/notice and excludes executable side-effect APIs prohibited in this W.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps fixture composition and source boundaries explicit', async () => {
  // <lang><zh-CN>读取页面与 mock 源码，仅用于本地静态断言；测试不会执行 fixture、写入文件或生成 compiler 输出。</zh-CN><en>Reads page and mock source for local static assertions only; the test neither executes fixture, writes files, nor generates compiler output.</en></lang>
  const [fixtureSource, mockSource] = await Promise.all([
    readFile(resolve('HIA-uView-UI/fixtures/mp-weixin/src/pages/index/index.vue'), 'utf8'),
    readFile(resolve('HIA-uView-UI/fixtures/mp-weixin/src/pages/index/local-catalog.mjs'), 'utf8')
  ]);

  // <lang><zh-CN>组合源码必须保留当前 10 个组件和目录/查询/详情结构，而不通过新组件或自动注册扩展 runtime 表面。</zh-CN><en>Composition source must retain the current ten components and directory/query/detail structure without expanding runtime surface through new components or auto-registration.</en></lang>
  assert.match(fixtureSource, /UButton, UCell, UCheckbox, UCheckboxGroup, UEmpty, UField, UInput, UModal, UNavBar, UNotice, URadio, URadioGroup, UStack, UValidationMessage/);
  assert.match(fixtureSource, /v-for="record in filteredCatalogRecords"/);
  assert.match(fixtureSource, /@update:model-value="updateCatalogQuery"/);
  assert.match(fixtureSource, /@click="selectCatalogRecord\(record\.id\)"/);
  assert.match(fixtureSource, /@action="resetCatalogQuery"/);
  assert.match(fixtureSource, /@confirm="confirmCatalogIntent"/);
  assert.match(fixtureSource, /@dismiss="dismissCatalogNotice"/);

  // <lang><zh-CN>每份新增源码必须具有模块级 zh-CN/en 文档与普通 inline lang 叙事，作为 ROP 人工审查的最小自动化哨兵。</zh-CN><en>Every new source file must contain module-level zh-CN/en documentation and ordinary inline lang narrative as a minimum automated sentinel for ROP human review.</en></lang>
  for (const sourceText of [fixtureSource, mockSource]) {
    assert.match(sourceText, /@lang zh-CN/);
    assert.match(sourceText, /@lang en/);
    assert.match(sourceText, /<lang><zh-CN>/);
  }

  // <lang><zh-CN>禁止模式只匹配可执行 API 形态，避免把源码中的边界说明文字误判为实际行为。</zh-CN><en>Forbidden patterns match executable API forms only, avoiding misclassification of boundary-explanation prose in source as real behavior.</en></lang>
  const forbiddenPatterns = [
    /\bfetch\s*\(/,
    /\bXMLHttpRequest\s*\(/,
    /\buni\.[A-Za-z]/,
    /\b(?:localStorage|sessionStorage)\s*\./,
    /\bset(?:Timeout|Interval)\s*\(/,
    /\bconsole\s*\./,
    /\bopen-type\s*=/
  ];

  // <lang><zh-CN>合并两份新增源码后逐条扫描，确保本地 mock helper 与页面组合都没有越过已确认边界。</zh-CN><en>Scans each forbidden pattern after combining the two new sources, ensuring both local mock helper and page composition stay within confirmed boundaries.</en></lang>
  const combinedSource = `${fixtureSource}\n${mockSource}`;

  for (const forbiddenPattern of forbiddenPatterns) {
    assert.doesNotMatch(combinedSource, forbiddenPattern);
  }
});
