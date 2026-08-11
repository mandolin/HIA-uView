/**
 * @module verify-uview-pro-source-intake-contract
 * @lang zh-CN 锁定 uView-Pro 当前 `0.6.15` 未来审阅基线、历史逐文件来源、限定新增衍生、顺延关系、canonical MIT 文本与 UI package 分发边界。测试只读取仓内固定文件，不访问网络、不读取上游 checkout、不执行 package lifecycle，也不修改任何源码或成品。
 * @lang en Locks the active uView-Pro `0.6.15` baseline for future reviews, historical per-file provenance, bounded additional derivations, the carry-forward relationship, canonical MIT text, and the UI-package distribution boundary. The test reads only fixed repository files; it does not access the network, read an upstream checkout, execute package lifecycle scripts, or modify source or artifacts.
 */

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

/**
 * @lang zh-CN canonical uView-Pro MIT 文件必须保持的精确字节数；该数值来自 immutable upstream Git blob，而非运行时网络查询。
 * @lang en Exact byte length required for the canonical uView-Pro MIT file; the value comes from the immutable upstream Git blob, not a runtime network query.
 * @type {number}
 */
const expectedLicenseBytes = 1068;

/**
 * @lang zh-CN canonical uView-Pro MIT 文件的固定 SHA-256，用于检测仓内许可证文本漂移。
 * @lang en Fixed SHA-256 of the canonical uView-Pro MIT file, used to detect repository-local license-text drift.
 * @type {string}
 */
const expectedLicenseSha256 = '906b494a3fa3b4e270bb08fc69625176e552eb0acc922c253c4d5fbfa5544627';

/**
 * @lang zh-CN canonical uView-Pro MIT 文件的 upstream Git blob identity；SHA-1 在这里仅表示 Git object identity，不作为安全摘要。
 * @lang en Upstream Git blob identity of the canonical uView-Pro MIT file; SHA-1 represents Git object identity here and is not used as a security digest.
 * @type {string}
 */
const expectedLicenseGitBlob = '837f9643580783834339d1b40e58772413895e39';

/**
 * @lang zh-CN 24 条历史 `0.6.13` 来源记录的稳定组件名与 source blob；路径由受限 helper 确定性生成。
 * @lang en Stable component names and source blobs for the 24 historical `0.6.13` records; paths are generated deterministically by constrained helpers.
 * @type {ReadonlyArray<Readonly<{name: string, blob: string}>>}
 */
const historicalSourceRecords = Object.freeze([
  Object.freeze({ name: 'u-navbar', blob: 'df2f98a19c99565547822d2b03122652d279dfac' }),
  Object.freeze({ name: 'u-status-bar', blob: 'f553b37a68a6e2e9eff915d6540e865e206bf7b7' }),
  Object.freeze({ name: 'u-safe-bottom', blob: '76fdc8fe6d8d3007471f5e188d71ea1ea46c0d55' }),
  Object.freeze({ name: 'u-back-top', blob: '9c84d22c1b6106f176a1755b6ab3ac4d7e30bf5f' }),
  Object.freeze({ name: 'u-cell-item', blob: 'db0cd27e53ad32d4c6071db6addd1114dd96b905' }),
  Object.freeze({ name: 'u-loading', blob: 'bbce8392a6a1217032966047352e0cf2a79d5629' }),
  Object.freeze({ name: 'u-loading-popup', blob: '4e506b8dbde3e5deabf594124b187cb269893d9b' }),
  Object.freeze({ name: 'u-mask', blob: '4855556f0df534f980fc200dec4fb36870d58091' }),
  Object.freeze({ name: 'u-no-network', blob: 'a6e1bd1398694344e26ba65fba08dec1642570b3' }),
  Object.freeze({ name: 'u-notice-bar', blob: 'b2584312f8462900bd9852e463e3b06ee3eafaba' }),
  Object.freeze({ name: 'u-top-tips', blob: '4c1c1bf951a5649f7bf9fe8b324ae93a267b35a2' }),
  Object.freeze({ name: 'u-transition', blob: 'b08546dde9940d3595d7f3c7881cd0d2a290d941' }),
  Object.freeze({ name: 'u-config-provider', blob: '36bec7483519c49816ba401ff882d4cc64a67133' }),
  Object.freeze({ name: 'u-root-portal', blob: '5550da0826a50c773d9a946251dc7de69ad4e0cb' }),
  Object.freeze({ name: 'u-fab', blob: 'f2cdc512e7e5fd7b6016190f9f5b516a84de4cae' }),
  Object.freeze({ name: 'u-action-sheet-item', blob: 'fad2cc9c939e52b0194c192819f9bd501a1056af' }),
  Object.freeze({ name: 'u-city-select', blob: '22c831490262552da63a162e9287c4edaa523daf' }),
  Object.freeze({ name: 'u-message-input', blob: '58df4a5ca051bfbfaed0eb577ac7da2978f10009' }),
  Object.freeze({ name: 'u-car-keyboard', blob: '90de12b80ff4ff22b41e84679e8735504a28f26a' }),
  Object.freeze({ name: 'u-keyboard', blob: '2590409722bcf4f219645f99e6d03c0c37a166ca' }),
  Object.freeze({ name: 'u-number-keyboard', blob: 'ba54f8e97bd9391b40ce5fa639a27c1c0c0fa30e' }),
  Object.freeze({ name: 'u-avatar-cropper', blob: 'e8c3c9077f26a5cef5e12bbf76f27111fc8cbb4f' }),
  Object.freeze({ name: 'u-upload', blob: '3d47f49855d94c33a8f1485e16094150d8219654' }),
  Object.freeze({ name: 'u-verification-code', blob: 'd2ad4a4cd3edf1b9c0d5c76d3358329807467078' })
]);

/**
 * @lang zh-CN `0.6.15` 中与历史来源逐字节相同的 13 个组件名；集合必须与 import-only 集合互斥并共同覆盖全部历史记录。
 * @lang en Thirteen component names whose `0.6.15` sources are byte-identical to the historical sources; this set must be disjoint from the import-only set and together cover every historical record.
 * @type {ReadonlyArray<string>}
 */
const unchangedComponentNames = Object.freeze([
  'u-status-bar',
  'u-safe-bottom',
  'u-loading',
  'u-mask',
  'u-no-network',
  'u-top-tips',
  'u-transition',
  'u-config-provider',
  'u-root-portal',
  'u-action-sheet-item',
  'u-message-input',
  'u-avatar-cropper',
  'u-verification-code'
]);

/**
 * @lang zh-CN `0.6.15` 中仅增加显式子组件 import 的 11 条来源记录；addedEdges 只描述上游依赖闭包，不授权 HIA runtime 采用。
 * @lang en Eleven sources that add only explicit child-component imports in `0.6.15`; addedEdges describe upstream dependency closure and do not authorize HIA runtime adoption.
 * @type {ReadonlyArray<Readonly<{name: string, blob: string, addedEdges: ReadonlyArray<string>}>>}
 */
const importOnlyRecords = Object.freeze([
  Object.freeze({ name: 'u-navbar', blob: '5699978bc24af9604fa921dcd591aa954df4e2c6', addedEdges: Object.freeze(['uIcon']) }),
  Object.freeze({ name: 'u-back-top', blob: 'c66d12f81d0c302329505abcc2ea668e6bc48460', addedEdges: Object.freeze(['uIcon']) }),
  Object.freeze({ name: 'u-cell-item', blob: '99ba4788743993e64964fb6d36ccc0c6e57e533d', addedEdges: Object.freeze(['uIcon']) }),
  Object.freeze({ name: 'u-loading-popup', blob: 'f0f01c52385946117363ea38a4bc3d10dad0b57e', addedEdges: Object.freeze(['uLoading']) }),
  Object.freeze({ name: 'u-notice-bar', blob: 'b26cdfa14dc086908fecf6bc9eb19bcec05e7baf', addedEdges: Object.freeze(['uColumnNotice', 'uRowNotice']) }),
  Object.freeze({ name: 'u-fab', blob: '58b88c2c5a26f6bce4dec7bbb98bbd5d19fa6cde', addedEdges: Object.freeze(['uButton', 'uIcon']) }),
  Object.freeze({ name: 'u-city-select', blob: '147a465edc1ca1da20118f3fd46bc70c03d34551', addedEdges: Object.freeze(['uCellGroup', 'uCellItem', 'uIcon', 'uPopup', 'uTabs']) }),
  Object.freeze({ name: 'u-car-keyboard', blob: '1ab26ddc8b78d55f06339321597de07ab0f1a43d', addedEdges: Object.freeze(['uIcon']) }),
  Object.freeze({ name: 'u-keyboard', blob: 'ff648990ee61f220f5d3f376cfd6300a454ef9da', addedEdges: Object.freeze(['uCarKeyboard', 'uNumberKeyboard', 'uPopup']) }),
  Object.freeze({ name: 'u-number-keyboard', blob: '816cc99ac5299db271c67d786f80f16728af6592', addedEdges: Object.freeze(['uIcon']) }),
  Object.freeze({ name: 'u-upload', blob: '0df99d644dc17adbeea3607aed6b48e1f71841c0', addedEdges: Object.freeze(['uIcon', 'uLineProgress']) })
]);

/**
 * @lang zh-CN 已按 `0.6.15` 精确 SFC blob 形成追加 NOTICE 的三个有界衍生记录；该集合不得被语义审阅组件扩张。
 * @lang en Three bounded derivation records with additive NOTICE entries for exact `0.6.15` SFC blobs; semantic-review components must not expand this set.
 * @type {ReadonlyArray<Readonly<{name: string, blob: string}>>}
 */
const additionalReviewedSourceRecords = Object.freeze([
  Object.freeze({ name: 'u-form', blob: '6ace7cc46414c28572f62272fd9fef6300572ab9' }),
  Object.freeze({ name: 'u-form-item', blob: 'fc60f477b688d24033cdf26b2e3b85377f4389da' }),
  Object.freeze({ name: 'u-field', blob: '861330f3d119622ccf7689b22c75f454fb5b2eff' })
]);

/**
 * @lang zh-CN 仅做 `0.6.15` 语义对照、未复制或实质衍生上游源码的 13 个组件；它们不得进入追加 source NOTICE 表。
 * @lang en Thirteen components reviewed only for `0.6.15` semantics without copied or materially derived upstream source; they must not enter the additional source-NOTICE tables.
 * @type {ReadonlyArray<string>}
 */
const semanticOnlyComponentNames = Object.freeze([
  'u-checkbox',
  'u-checkbox-group',
  'u-radio',
  'u-radio-group',
  'u-switch',
  'u-picker',
  'u-calendar',
  'u-select',
  'u-dropdown',
  'u-dropdown-item',
  'u-number-box',
  'u-rate',
  'u-slider'
]);

// <lang><zh-CN>并行读取固定 metadata、吸收政策、总账、包内声明和 canonical license；不会通过目录扫描扩大输入面。</zh-CN><en>Reads fixed metadata, intake policy, root ledger, package-local notice, and canonical license in parallel without expanding the input surface through directory scanning.</en></lang>
const [packageSource, sourceIntakeSource, rootNoticeSource, packageNoticeSource, licenseBytes] = await Promise.all([
  readFile('HIA-uView-UI/package.json', 'utf8'),
  readFile('docs/upstream-source-intake.md', 'utf8'),
  readFile('THIRD_PARTY_NOTICES.md', 'utf8'),
  readFile('HIA-uView-UI/THIRD_PARTY_NOTICES.md', 'utf8'),
  readFile('HIA-uView-UI/LICENSES/uView-Pro-MIT.txt')
]);

// <lang><zh-CN>只解析固定 package metadata；测试不会执行 scripts、exports 或其他 package 字段。</zh-CN><en>Parses only fixed package metadata; the test executes no scripts, exports, or other package fields.</en></lang>
const packageJson = JSON.parse(packageSource);

// <lang><zh-CN>以名称索引历史记录，供 carry-forward 检查读取唯一旧 blob。</zh-CN><en>Indexes historical records by name so carry-forward checks read one unique prior blob.</en></lang>
const historicalRecordByName = new Map(historicalSourceRecords.map((record) => [record.name, record]));

/**
 * @lang zh-CN 为一个受限组件名生成 exact upstream source path。
 * @lang en Generates the exact upstream source path for one constrained component name.
 * @param {string} componentName <lang><zh-CN>硬编码审计记录中的组件名。</zh-CN><en>Component name from the hard-coded audit records.</en></lang>
 * @returns {string} <lang><zh-CN>相对上游仓库根的 `.vue` 路径。</zh-CN><en>`.vue` path relative to the upstream repository root.</en></lang>
 */
function upstreamSourcePath(componentName) {
  // <lang><zh-CN>目录与文件使用相同稳定名称，避免测试接受路径 alias。</zh-CN><en>The directory and file use the same stable name so the test accepts no path alias.</en></lang>
  return `src/uni_modules/uview-pro/components/${componentName}/${componentName}.vue`;
}

/**
 * @lang zh-CN 为一个受限组件名生成仓内 HIA target path。
 * @lang en Generates the repository-local HIA target path for one constrained component name.
 * @param {string} componentName <lang><zh-CN>硬编码审计记录中的组件名。</zh-CN><en>Component name from the hard-coded audit records.</en></lang>
 * @returns {string} <lang><zh-CN>相对当前仓库根的目标 `.vue` 路径。</zh-CN><en>Target `.vue` path relative to the current repository root.</en></lang>
 */
function hiaTargetPath(componentName) {
  // <lang><zh-CN>目标路径保持 package-owned component 边界，不读取外部 consumer 或 WorkZone。</zh-CN><en>The target path remains inside the package-owned component boundary and reads no external consumer or WorkZone.</en></lang>
  return `HIA-uView-UI/src/components/${componentName}/${componentName}.vue`;
}

/**
 * @lang zh-CN 按 Git blob object 格式计算字节的 SHA-1 identity；该值只用于复核 immutable Git provenance。
 * @lang en Computes the SHA-1 identity of bytes using the Git blob-object format; the value is used only to verify immutable Git provenance.
 * @param {Buffer} bytes <lang><zh-CN>未转换的仓内 license bytes。</zh-CN><en>Untransformed repository-local license bytes.</en></lang>
 * @returns {string} <lang><zh-CN>小写十六进制 Git blob identity。</zh-CN><en>Lowercase hexadecimal Git blob identity.</en></lang>
 */
function gitBlobIdentity(bytes) {
  // <lang><zh-CN>Git header 包含精确 byte length 与 NUL 分隔符，避免文本解码或换行归一化改变 identity。</zh-CN><en>The Git header contains the exact byte length and NUL separator, preventing text decoding or line-ending normalization from changing identity.</en></lang>
  const header = Buffer.from(`blob ${bytes.length}\0`, 'utf8');

  // <lang><zh-CN>按 Git object 规则依次吸收 header 与原始 bytes；不把 SHA-1 当作恶意输入安全校验。</zh-CN><en>Feeds the header and original bytes in Git-object order; SHA-1 is not treated as a hostile-input security check.</en></lang>
  return createHash('sha1').update(header).update(bytes).digest('hex');
}

/**
 * @lang zh-CN 将 Markdown table cell 中的依赖边格式化为与 package-local notice 完全一致的反引号列表。
 * @lang en Formats dependency edges as the exact backtick list used by the package-local notice Markdown table cell.
 * @param {ReadonlyArray<string>} edges <lang><zh-CN>受审计的上游 import 名称。</zh-CN><en>Reviewed upstream import names.</en></lang>
 * @returns {string} <lang><zh-CN>以逗号加空格分隔的 Markdown code spans。</zh-CN><en>Comma-and-space-delimited Markdown code spans.</en></lang>
 */
function markdownEdges(edges) {
  // <lang><zh-CN>只格式化硬编码记录，不解释、排序或执行任一 import 名称。</zh-CN><en>Formats only hard-coded records and does not interpret, sort, or execute any import name.</en></lang>
  return edges.map((edge) => `\`${edge}\``).join(', ');
}

/**
 * @lang zh-CN 从固定 Markdown 中取得一个二级标题及其正文，供门禁将计数限制在指定政策区段。
 * @lang en Extracts one level-two heading and its body from fixed Markdown so the gate limits counts to the intended policy section.
 * @param {string} source <lang><zh-CN>仓内固定 Markdown 文本。</zh-CN><en>Fixed repository-local Markdown source.</en></lang>
 * @param {string} heading <lang><zh-CN>包含 `## ` 前缀的精确标题。</zh-CN><en>Exact heading including the `## ` prefix.</en></lang>
 * @returns {string} <lang><zh-CN>从目标标题起、到下一二级标题前的文本。</zh-CN><en>Text from the target heading up to the next level-two heading.</en></lang>
 */
function markdownSection(source, heading) {
  // <lang><zh-CN>要求标题唯一存在，避免拼写漂移时静默审计空字符串。</zh-CN><en>Requires the heading to exist so spelling drift cannot silently audit an empty string.</en></lang>
  const headingOffset = source.indexOf(heading);
  assert.notEqual(headingOffset, -1, `Missing Markdown section: ${heading}`);

  // <lang><zh-CN>只在目标标题之后搜索下一二级标题，避免命中当前标题。</zh-CN><en>Searches for the next level-two heading only after the target heading, avoiding the current heading.</en></lang>
  const remainingSource = source.slice(headingOffset + heading.length);
  const nextHeadingOffset = remainingSource.search(/\n## /u);

  // <lang><zh-CN>末尾 section 没有后继标题时返回余下全文；否则在下一标题前精确截断。</zh-CN><en>Returns the remaining source for a terminal section; otherwise cuts exactly before the next heading.</en></lang>
  return nextHeadingOffset === -1
    ? source.slice(headingOffset)
    : source.slice(headingOffset, headingOffset + heading.length + nextHeadingOffset);
}

test('locks the active uView-Pro baseline to exact 0.6.15 provenance without rewriting history', () => {
  // <lang><zh-CN>只检查 locked-baseline section，防止历史 NOTICE 或示例文字干扰 active-row 计数。</zh-CN><en>Checks only the locked-baseline section so historical NOTICE language or examples cannot affect the active-row count.</en></lang>
  const lockedBaselineSection = markdownSection(sourceIntakeSource, '## Locked reference baselines');
  const activeRow = '| `anyup/uView-Pro` | `uview-pro@0.6.15` | `bec4b39cd3195354d65c1fc8722745d72052bd8c` | `src/uni_modules/uview-pro/` |';
  const uViewProRows = lockedBaselineSection.match(/^\| `anyup\/uView-Pro` \|/gmu) ?? [];

  // <lang><zh-CN>active lock 必须恰有一行并精确绑定 package、commit 与 eligible boundary。</zh-CN><en>The active lock must have exactly one row and bind the package, commit, and eligible boundary exactly.</en></lang>
  assert.equal(uViewProRows.length, 1);
  assert.ok(lockedBaselineSection.includes(activeRow));
  assert.doesNotMatch(lockedBaselineSection, /\| `anyup\/uView-Pro` \| `uview-pro@0\.6\.13` \|/u);

  // <lang><zh-CN>政策必须明示 lock 只约束未来审阅，24 条历史记录不会因表格升级而被追溯改写。</zh-CN><en>The policy must say the lock governs future reviews only and that upgrading the table does not retroactively rewrite the 24 historical records.</en></lang>
  assert.match(lockedBaselineSection, /active lock governs future reviews only/iu);
  assert.match(lockedBaselineSection, /existing 24 per-file provenance records remain historical `uview-pro@0\.6\.13` attributions/iu);
  assert.match(lockedBaselineSection, /changing the lock is not retroactive/iu);
});

test('preserves the canonical upstream MIT bytes and identities', () => {
  // <lang><zh-CN>byte length、强摘要与 Git identity 必须同时匹配，避免只凭可读文字或文件名接受漂移。</zh-CN><en>Byte length, strong digest, and Git identity must all match so readable text or a filename alone cannot conceal drift.</en></lang>
  assert.equal(licenseBytes.length, expectedLicenseBytes);
  assert.equal(createHash('sha256').update(licenseBytes).digest('hex'), expectedLicenseSha256);
  assert.equal(gitBlobIdentity(licenseBytes), expectedLicenseGitBlob);

  // <lang><zh-CN>上游版权声明和 MIT permission condition 必须存在；HIA 自身 LICENSE 不能替代它们。</zh-CN><en>The upstream copyright statement and MIT permission condition must remain present; HIA's own LICENSE cannot replace them.</en></lang>
  const licenseSource = licenseBytes.toString('utf8');
  assert.match(licenseSource, /Copyright \(c\) 2025 uviewpro\.cn/u);
  assert.match(licenseSource, /The above copyright notice and this permission notice shall be included/u);
});

test('retains exactly 24 historical 0.6.13 paths, blobs, and existing HIA targets', async () => {
  // <lang><zh-CN>只匹配历史 table 的四列形状；carry-forward tables 没有 HIA target 列，因而不会被误计。</zh-CN><en>Matches only the four-column historical-table shape; carry-forward tables have no HIA-target column and cannot be miscounted.</en></lang>
  const historicalRows = [...packageNoticeSource.matchAll(/^\| `(src\/uni_modules\/uview-pro\/components\/(?<name>u-[^/]+)\/u-[^/]+\.vue)` \| `(HIA-uView-UI\/src\/components\/u-[^/]+\/u-[^/]+\.vue)` \| `(?<blob>[0-9a-f]{40})` \|/gmu)];

  // <lang><zh-CN>来源路径必须恰有 24 条且唯一，防止 duplicate row 掩盖缺失组件。</zh-CN><en>There must be exactly 24 unique source paths so a duplicate row cannot conceal a missing component.</en></lang>
  const uniqueSourcePaths = new Set(historicalRows.map((row) => row[1]));
  assert.equal(historicalRows.length, 24);
  assert.equal(uniqueSourcePaths.size, 24);
  assert.equal(historicalSourceRecords.length, 24);

  for (const record of historicalSourceRecords) {
    // <lang><zh-CN>每个硬编码来源必须在 package notice 中具有 exact source、target 与历史 blob。</zh-CN><en>Every hard-coded source must have its exact source, target, and historical blob in the package notice.</en></lang>
    const sourcePath = upstreamSourcePath(record.name);
    const targetPath = hiaTargetPath(record.name);
    const matchingRow = historicalRows.find((row) => row[1] === sourcePath);
    assert.ok(matchingRow, `Missing historical source row: ${sourcePath}`);
    assert.equal(matchingRow[3], targetPath);
    assert.equal(matchingRow.groups.blob, record.blob);

    // <lang><zh-CN>NOTICE 不得指向已删除或拼写漂移的 HIA target。</zh-CN><en>The NOTICE must not point to a deleted or misspelled HIA target.</en></lang>
    await access(resolve(targetPath));
  }

  // <lang><zh-CN>release/tag 与 review snapshot 的双 commit/tree 事实必须保持可见，避免再次压缩为含糊单字段。</zh-CN><en>The paired release/tag and review-snapshot commit/tree facts must remain visible, preventing another collapse into one ambiguous field.</en></lang>
  assert.match(packageNoticeSource, /17d6b802194ea770fa602a96e3168e9ed116231c/u);
  assert.match(packageNoticeSource, /806f7e0f98148778a29b92a0178f9a85dc4f5205/u);
  assert.match(packageNoticeSource, /3bc1948d8f7c5d2bcb1ba3434cede1e709391a62/u);
  assert.match(packageNoticeSource, /5cf847b08c85c3481d0b9fa288b7841677df662a/u);
  assert.match(packageNoticeSource, /direct child/u);
  assert.match(packageNoticeSource, /直接子提交/u);
});

test('keeps the additional 0.6.15 derivation ledger exact and excludes semantic-only reviews', () => {
  // <lang><zh-CN>分别隔离根总账与随包声明的追加区段，避免把历史 24 行或 carry-forward 表误计为新增衍生。</zh-CN><en>Separately isolates the root-ledger and package-local additional sections so the 24 historical rows and carry-forward tables cannot be miscounted as new derivations.</en></lang>
  const additionalHeading = '## Additional reviewed `uview-pro@0.6.15` bounded derivations / 新增已审阅 `uview-pro@0.6.15` 有界实质衍生';
  const rootAdditionalSection = markdownSection(rootNoticeSource, additionalHeading);
  const packageAdditionalSection = markdownSection(packageNoticeSource, additionalHeading);

  // <lang><zh-CN>只解析具有 source、blob、target 三列的追加数据行，并分别约束根路径与 package-relative 路径。</zh-CN><en>Parses only additional data rows with source, blob, and target columns, constraining root and package-relative target paths separately.</en></lang>
  const rootAdditionalRows = [...rootAdditionalSection.matchAll(/^\| `src\/uni_modules\/uview-pro\/components\/(?<name>u-[^/]+)\/u-[^/]+\.vue` \| `(?<blob>[0-9a-f]{40})` \| `HIA-uView-UI\/src\/components\/(?<targetName>u-[^/]+)\/u-[^/]+\.vue` \|/gmu)];
  const packageAdditionalRows = [...packageAdditionalSection.matchAll(/^\| `src\/uni_modules\/uview-pro\/components\/(?<name>u-[^/]+)\/u-[^/]+\.vue` \| `(?<blob>[0-9a-f]{40})` \| `src\/components\/(?<targetName>u-[^/]+)\/u-[^/]+\.vue` \|/gmu)];

  // <lang><zh-CN>两个追加表都必须恰好保留 form、form-item、field 三行，任何多余 source row 都会失败。</zh-CN><en>Both additional tables must retain exactly the form, form-item, and field rows; any extra source row fails the gate.</en></lang>
  assert.equal(rootAdditionalRows.length, additionalReviewedSourceRecords.length);
  assert.equal(packageAdditionalRows.length, additionalReviewedSourceRecords.length);
  assert.deepEqual(new Set(rootAdditionalRows.map((row) => row.groups.name)), new Set(additionalReviewedSourceRecords.map((record) => record.name)));
  assert.deepEqual(new Set(packageAdditionalRows.map((row) => row.groups.name)), new Set(additionalReviewedSourceRecords.map((record) => record.name)));

  for (const record of additionalReviewedSourceRecords) {
    // <lang><zh-CN>每项都必须在两个声明中保留 exact source blob 与各自正确的 target boundary。</zh-CN><en>Each entry must retain its exact source blob and the correct target boundary in both notices.</en></lang>
    const sourcePath = upstreamSourcePath(record.name);
    const rootTargetPath = hiaTargetPath(record.name);
    const packageTargetPath = rootTargetPath.replace(/^HIA-uView-UI\//u, '');
    assert.ok(rootAdditionalSection.includes(`| \`${sourcePath}\` | \`${record.blob}\` | \`${rootTargetPath}\` |`));
    assert.ok(packageAdditionalSection.includes(`| \`${sourcePath}\` | \`${record.blob}\` | \`${packageTargetPath}\` |`));
  }

  for (const componentName of semanticOnlyComponentNames) {
    // <lang><zh-CN>语义对照不构成复制或实质衍生，因此不得在任一追加 source NOTICE 中出现对应来源路径。</zh-CN><en>Semantic comparison is neither copying nor material derivation, so its source path must appear in neither additional source NOTICE.</en></lang>
    const semanticSourcePath = upstreamSourcePath(componentName);
    assert.ok(!rootAdditionalSection.includes(semanticSourcePath));
    assert.ok(!packageAdditionalSection.includes(semanticSourcePath));
  }

  // <lang><zh-CN>upload 继续只保留历史来源与 import-only 顺延记录，不得被 adapter 编排误升级为新的 `0.6.15` source derivation。</zh-CN><en>Upload remains only a historical source and import-only carry-forward record; adapter orchestration must not promote it to a new `0.6.15` source derivation.</en></lang>
  const uploadSourcePath = upstreamSourcePath('u-upload');
  assert.ok(!rootAdditionalSection.includes(uploadSourcePath));
  assert.ok(!packageAdditionalSection.includes(uploadSourcePath));
});

test('preserves upload provenance while recording independently designed adapter orchestration', () => {
  // <lang><zh-CN>历史 package row 必须继续绑定旧 source blob，并以精确表述区分衍生 file-state intent 与后来独立设计的 adapter 编排。</zh-CN><en>The historical package row must remain bound to the old source blob and precisely distinguish the derived file-state intent from later independently designed adapter orchestration.</en></lang>
  const uploadSourcePath = upstreamSourcePath('u-upload');
  const uploadTargetPath = hiaTargetPath('u-upload');
  const historicalUploadBlob = historicalRecordByName.get('u-upload')?.blob;
  const adapterBoundaryText = 'later independently designed caller-injected adapter orchestration adds no built-in chooser, file-byte access, upload/delete/preview implementation, transport, network, cache, or platform integration.';
  assert.equal(historicalUploadBlob, '3d47f49855d94c33a8f1485e16094150d8219654');
  assert.ok(packageNoticeSource.includes(`| \`${uploadSourcePath}\` | \`${uploadTargetPath}\` | \`${historicalUploadBlob}\` |`));
  assert.ok(packageNoticeSource.includes(adapterBoundaryText));
  assert.match(packageNoticeSource, /后续独立设计的 caller-injected adapter orchestration 不增加内建 chooser、file-byte access、upload\/delete\/preview implementation、transport、network、cache 或 platform integration。/u);

  // <lang><zh-CN>根总账必须给出相同英文边界，且不能把 adapter 自身描述成上游衍生。</zh-CN><en>The root ledger must give the same English boundary and must not describe the adapter itself as an upstream derivation.</en></lang>
  assert.ok(rootNoticeSource.includes(`| \`${uploadSourcePath}\` | \`${uploadTargetPath}\` | Materially derived, independently rewritten caller file-state intent list; ${adapterBoundaryText} |`));

  // <lang><zh-CN>顺延表仍须精确保留旧、新 blob 及 `uIcon`、`uLineProgress` 两条仅上游 import edge。</zh-CN><en>The carry-forward table must still retain the exact old and new blobs plus the upstream-only `uIcon` and `uLineProgress` import edges.</en></lang>
  const importOnlyUploadRecord = importOnlyRecords.find((record) => record.name === 'u-upload');
  assert.ok(importOnlyUploadRecord);
  assert.equal(importOnlyUploadRecord.blob, '0df99d644dc17adbeea3607aed6b48e1f71841c0');
  assert.ok(packageNoticeSource.includes(`| \`${uploadSourcePath}\` | \`${historicalUploadBlob}\` | \`${importOnlyUploadRecord.blob}\` | \`uIcon\`, \`uLineProgress\` |`));
});

test('keeps the 0.6.15 carry-forward split exact and non-retroactive', () => {
  // <lang><zh-CN>两个集合必须互斥并共同覆盖全部 24 条历史记录，不允许遗漏或把 import-only 文件误标为 unchanged。</zh-CN><en>The two sets must be disjoint and together cover all 24 historical records, allowing neither omission nor misclassification of an import-only file as unchanged.</en></lang>
  const unchangedNames = new Set(unchangedComponentNames);
  const importOnlyNames = new Set(importOnlyRecords.map((record) => record.name));
  const carryForwardNames = new Set([...unchangedNames, ...importOnlyNames]);
  assert.equal(unchangedNames.size, 13);
  assert.equal(importOnlyNames.size, 11);
  assert.equal(carryForwardNames.size, 24);
  assert.deepEqual(carryForwardNames, new Set(historicalSourceRecords.map((record) => record.name)));

  for (const componentName of unchangedComponentNames) {
    // <lang><zh-CN>unchanged table 必须复用 exact 历史 blob，而不是只写组件名或宽泛结论。</zh-CN><en>The unchanged table must repeat the exact historical blob rather than recording only a component name or broad conclusion.</en></lang>
    const historicalRecord = historicalRecordByName.get(componentName);
    assert.ok(historicalRecord, `Missing historical record for unchanged source: ${componentName}`);
    assert.ok(packageNoticeSource.includes(`| \`${upstreamSourcePath(componentName)}\` | \`${historicalRecord.blob}\` | 逐字节未变化。 / Byte-identical. |`));
  }

  for (const record of importOnlyRecords) {
    // <lang><zh-CN>import-only table 必须同时保留旧 blob、新 blob 与全部新增 edge，避免把依赖变化误写成 byte-identical。</zh-CN><en>The import-only table must retain the prior blob, new blob, and every added edge so dependency changes cannot be mislabeled byte-identical.</en></lang>
    const historicalRecord = historicalRecordByName.get(record.name);
    assert.ok(historicalRecord, `Missing historical record for import-only source: ${record.name}`);
    assert.ok(packageNoticeSource.includes(`| \`${upstreamSourcePath(record.name)}\` | \`${historicalRecord.blob}\` | \`${record.blob}\` | ${markdownEdges(record.addedEdges)} |`));
  }

  // <lang><zh-CN>20 条显式 import edge 与对应 upstream commit 必须保持可审计，且声明不得追溯改写旧来源。</zh-CN><en>All 20 explicit import edges and their upstream commit must remain auditable, and the notice must prohibit retroactive source rewriting.</en></lang>
  const addedEdgeCount = importOnlyRecords.reduce((count, record) => count + record.addedEdges.length, 0);
  assert.equal(addedEdgeCount, 20);
  assert.match(packageNoticeSource, /091b5bb70312f43026c9847cca0709cafccaaaaa/u);
  assert.match(packageNoticeSource, /does not retroactively attribute/u);
  assert.match(packageNoticeSource, /不会把 24 个 HIA 目标追溯改写/u);
});

test('ships the package-local notice and upstream license through explicit metadata', () => {
  // <lang><zh-CN>files allowlist 必须显式包含 package-local NOTICE 与 LICENSES，同时保持既有 runtime/type/style 目录和 HIA LICENSE。</zh-CN><en>The files allowlist must explicitly include the package-local NOTICE and LICENSES while retaining existing runtime/type/style directories and HIA LICENSE.</en></lang>
  assert.deepEqual(packageJson.files, ['src', 'types', 'easycom', 'README.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md', 'LICENSES']);

  // <lang><zh-CN>根总账必须指向实际随包分发的两个文件，并保留 upstream copyright 归属。</zh-CN><en>The root ledger must point to both files actually distributed with the package and retain the upstream copyright attribution.</en></lang>
  assert.match(rootNoticeSource, /HIA-uView-UI\/LICENSES\/uView-Pro-MIT\.txt/u);
  assert.match(rootNoticeSource, /HIA-uView-UI\/THIRD_PARTY_NOTICES\.md/u);
  assert.match(rootNoticeSource, /Copyright \(c\) 2025 uviewpro\.cn/u);

  // <lang><zh-CN>package notice 自身必须声明 canonical digest 和 0.6.15 immutable revision；这不执行网络核验。</zh-CN><en>The package notice itself must declare the canonical digest and immutable 0.6.15 revision; this performs no network verification.</en></lang>
  assert.match(packageNoticeSource, new RegExp(expectedLicenseSha256, 'iu'));
  assert.match(packageNoticeSource, new RegExp(expectedLicenseGitBlob, 'u'));
  assert.match(packageNoticeSource, /bec4b39cd3195354d65c1fc8722745d72052bd8c/u);
  assert.match(packageNoticeSource, /ee561c6c12e40922d137b24fb0adb6e7f7a18c1e/u);
});
