/**
 * @module generate-api-compatibility-matrix
 * @lang zh-CN 从显式提供的 uView-Pro 0.6.15 本地只读检出与仓内 HIA-uView 声明生成确定性的 99 项 API/迁移比较矩阵。该脚本不联网、不启动子进程、不执行或求值任一侧源码，也不改变组件实现或源码吸收锁。
 * @lang en Generates the deterministic 99-item API and migration comparison matrix from an explicitly supplied read-only local uView-Pro 0.6.15 checkout and repository-local HIA-uView declarations. The script performs no networking, starts no subprocess, evaluates neither source tree, and changes neither component implementations nor the source-intake lock.
 */

// <lang><zh-CN>仅导入确定性摘要算法；摘要证明规范文本内容或原始二进制字节稳定，不恢复或执行表达式。</zh-CN><en>Imports only deterministic digest support; digests prove stable canonical text content or raw binary bytes without recovering or executing expressions.</en></lang>
import { createHash } from 'node:crypto';
// <lang><zh-CN>只读输入并写入唯一仓内生成物；生成器不会创建缓存、下载、临时目录或上游文件。</zh-CN><en>Reads inputs and writes the single repository-local artifact only; the generator creates no cache, download, temporary directory, or upstream file.</en></lang>
import { lstat, readFile, readdir, realpath, writeFile } from 'node:fs/promises';
// <lang><zh-CN>路径工具只用于从脚本位置定位本仓文件以及解析调用方明确给出的上游根目录。</zh-CN><en>Path helpers locate repository files from the script and resolve the upstream root explicitly supplied by the caller.</en></lang>
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
// <lang><zh-CN>将当前模块 URL 转成稳定的本地脚本路径，而不依赖调用方工作目录。</zh-CN><en>Converts the current module URL into a stable local script path without depending on the caller's working directory.</en></lang>
import { fileURLToPath } from 'node:url';

/**
 * @lang zh-CN 当前比较基线的 Git provenance 与 package 事实。Git commit/tree 由独立流程核验并在此记录；本生成器不调用 Git，也不把这些字段冒充运行时验证。`sourceRole` 明确禁止将比较快照误当作源码吸收授权。
 * @lang en Git provenance and package facts for the current comparison baseline. Git commit/tree were verified independently and are recorded here; this generator neither invokes Git nor presents those fields as runtime validation. `sourceRole` explicitly prevents the comparison snapshot from being mistaken for source-intake authorization.
 */
const CURRENT_COMPARISON = Object.freeze({
  repository: 'https://github.com/anyup/uView-Pro',
  releaseTag: 'v0.6.15',
  commit: 'bec4b39cd3195354d65c1fc8722745d72052bd8c',
  tree: 'ee561c6c12e40922d137b24fb0adb6e7f7a18c1e',
  packagePath: 'src/uni_modules/uview-pro/package.json',
  packageBlob: '9a9e4fbdb7af50580b89f837326a8db00f8999c8',
  packageDigest: 'sha256:17503c605ea553e1124b3cecfc37da4b489603b667660aef7b87bf0face365a7',
  licensePath: 'LICENSE',
  licenseBlob: '837f9643580783834339d1b40e58772413895e39',
  licenseDigest: 'sha256:906b494a3fa3b4e270bb08fc69625176e552eb0acc922c253c4d5fbfa5544627',
  componentsPath: 'src/uni_modules/uview-pro/components',
  componentsTree: '27e58b2924e42ebd761cdf5a245c61f7f8984d6f',
  packageTree: '8c356eb79adb16c63c2b1b44e87c6aaf27a37810',
  easycomPath: 'src/pages.json',
  easycomDigest: 'sha256:695b82951b9ff1297844206f8bcba21433458091dcf157e50e81544ef420b192',
  easycomPattern: '^u-(.*)',
  easycomReplacement: '@/uni_modules/uview-pro/components/u-$1/u-$1.vue',
  packageVersion: '0.6.15',
  packageId: 'uview-pro',
  licenseId: 'MIT',
  sourceRole: 'comparison-only'
});

/**
 * @lang zh-CN 前一比较提交与前一发布 tag 的分别锁定事实。0.6.14 发布 tag 指向的 commit 与既有比较 commit 不相同，字段不得合并。
 * @lang en Separately locked facts for the previous comparison commit and previous release tag. The 0.6.14 release tag points to a different commit than the established comparison commit, so the fields must not be merged.
 */
const PREVIOUS_COMPARISON = Object.freeze({
  version: '0.6.14',
  comparisonCommit: '091b5bb70312f43026c9847cca0709cafccaaaaa',
  comparisonTree: '675cd4e00fee808ecc49363996be25d4b2498604',
  packageTree: 'e40c0985c2a82f172c7372f00ca05cbee4181b12',
  componentsTree: '27e58b2924e42ebd761cdf5a245c61f7f8984d6f',
  releaseTag: 'v0.6.14',
  releaseCommit: '69d1e8b37aaad6ffdf14af96b0c022a62f98a0a7'
});

/**
 * @lang zh-CN 既有 0.6.14 比较提交到 0.6.15 当前提交之间的完整 10 路径清单；固定排序令离线复跑结果可逐字比较。
 * @lang en Complete ten-path list between the established 0.6.14 comparison commit and the current 0.6.15 commit; fixed ordering makes offline reruns byte-comparable.
 */
const COMPARISON_CHANGED_PATHS = Object.freeze([
  Object.freeze({ status: 'modified', path: 'CHANGELOG.md' }),
  Object.freeze({ status: 'modified', path: 'package.json' }),
  Object.freeze({ status: 'modified', path: 'scripts/README.md' }),
  Object.freeze({ status: 'deleted', path: 'scripts/release.bat' }),
  Object.freeze({ status: 'deleted', path: 'scripts/release.ps1' }),
  Object.freeze({ status: 'deleted', path: 'scripts/release.sh' }),
  Object.freeze({ status: 'added', path: 'scripts/sync-to-node.js' }),
  Object.freeze({ status: 'modified', path: 'src/uni_modules/uview-pro/changelog.md' }),
  Object.freeze({ status: 'modified', path: 'src/uni_modules/uview-pro/package.json' }),
  Object.freeze({ status: 'modified', path: 'src/uni_modules/uview-pro/types/index.d.ts' })
]);

/**
 * @lang zh-CN 矩阵 schema 与消费方协商的稳定身份；版本只在字段或语义发生不兼容改变时递增。
 * @lang en Stable matrix identity negotiated with consumers; the version increases only for incompatible field or semantic changes.
 */
const MATRIX_IDENTITY = Object.freeze({
  version: 1,
  kind: 'hia-uview-api-compatibility',
  profile: 'mp-weixin'
});

/**
 * @lang zh-CN 仓内唯一允许写入的生成物相对路径。输入根目录不能覆盖此边界。
 * @lang en Repository-relative path of the only artifact this generator may write. The input root cannot override this boundary.
 */
const OUTPUT_RELATIVE_PATH = 'HIA-uView-UI/hia-uview.api-compatibility.json';

/**
 * @lang zh-CN P0 组件用于优先保障基础交互、表单、导航、反馈和当前小程序纵切；其余组件再由 P1/P2 白名单分类。
 * @lang en P0 components prioritize foundational interaction, forms, navigation, feedback, and the current mini-program vertical slice; the remaining components are classified by the P1/P2 allowlists.
 */
const P0_COMPONENTS = new Set([
  'u-button',
  'u-cell',
  'u-cell-group',
  'u-cell-item',
  'u-checkbox',
  'u-checkbox-group',
  'u-empty',
  'u-field',
  'u-form',
  'u-form-item',
  'u-icon',
  'u-image',
  'u-input',
  'u-list',
  'u-loading',
  'u-loading-page',
  'u-modal',
  'u-nav-bar',
  'u-navbar',
  'u-notice-bar',
  'u-pagination',
  'u-picker',
  'u-popup',
  'u-radio',
  'u-radio-group',
  'u-search',
  'u-skeleton',
  'u-swipe-action',
  'u-switch',
  'u-tabbar',
  'u-tabs',
  'u-text',
  'u-textarea',
  'u-toast'
]);

/**
 * @lang zh-CN P1 组件是常见业务页面所需但不阻断最小纵切的能力；未列入 P0/P1 的专门化组件归为 P2。
 * @lang en P1 components support common business pages without blocking the minimum vertical slice; specialized components absent from P0/P1 are classified as P2.
 */
const P1_COMPONENTS = new Set([
  'u-action-sheet',
  'u-action-sheet-item',
  'u-alert-tips',
  'u-avatar',
  'u-back-top',
  'u-badge',
  'u-calendar',
  'u-card',
  'u-col',
  'u-collapse',
  'u-collapse-item',
  'u-config-provider',
  'u-count-down',
  'u-count-to',
  'u-divider',
  'u-dropdown',
  'u-dropdown-item',
  'u-gap',
  'u-grid',
  'u-grid-item',
  'u-line',
  'u-line-progress',
  'u-link',
  'u-loadmore',
  'u-mask',
  'u-notice',
  'u-number-box',
  'u-rate',
  'u-read-more',
  'u-row',
  'u-safe-bottom',
  'u-scroll-list',
  'u-section',
  'u-select',
  'u-slider',
  'u-status-bar',
  'u-step',
  'u-steps',
  'u-sticky',
  'u-subsection',
  'u-swiper',
  'u-tag',
  'u-transition',
  'u-upload'
]);

/**
 * @lang zh-CN 已知拥有独立 service 文件的上游组件。SFC 静态抽取无法证明 service 方法、实例状态与组件公开面一致，因此必须显式保留 unresolved 问题。
 * @lang en Upstream components known to own separate service files. SFC static extraction cannot prove service methods and instance state match the component surface, so an explicit unresolved issue is mandatory.
 */
const SERVICE_COMPONENTS = new Set(['u-modal', 'u-toast']);

/**
 * @lang zh-CN 只有经过人工语义审计、独立实现和回归测试的精确规则才能产生 `compatible`。未列入的结构同名能力仍是待复核映射候选。
 * @lang en Only exact rules that passed semantic audit, independent implementation, and regression tests may produce `compatible`. Structural name matches not listed here remain review candidates.
 */
const EXPLICIT_COMPATIBILITY_RULES = new Set([
  // <lang><zh-CN>基础呈现组件的 P0 prop 只在类型、默认值、required 与 validator 事实均相同时进入 compatible；事件和 slot 仍保持 names-only mapped。</zh-CN><en>P0 props of foundational presentation components enter compatible only when type, default, required, and validator facts all match; events and slots remain names-only mapped.</en></lang>
  'u-button|props|disabled',
  'u-button|props|loading',
  'u-button|props|text',
  'u-cell-item|props|label',
  'u-cell-item|props|required',
  'u-cell-item|props|value',
  // <lang><zh-CN>选择组件的以下 props 已由 P61 独立实现、caller-controlled 行为测试和双目标 fixture 审计；事件/slot 仍按 names-only 规则保守映射。</zh-CN><en>The following choice-component props passed P61 independent implementation, caller-controlled behavior tests, and dual-target fixture audit; events/slots remain conservatively mapped under the names-only rule.</en></lang>
  'u-checkbox|props|disabled',
  'u-checkbox|props|label',
  'u-checkbox|props|modelValue',
  'u-checkbox|props|value',
  'u-checkbox-group|props|disabled',
  'u-empty|props|show',
  'u-empty|props|src',
  'u-empty|props|text',
  'u-icon|props|label',
  'u-image|props|src',
  'u-input|props|disabled',
  'u-input|props|modelValue',
  'u-input|props|readonly',
  'u-loading|props|show',
  'u-modal|props|modelValue',
  'u-pagination|props|modelValue',
  'u-pagination|props|pageSize',
  'u-pagination|props|total',
  'u-radio|props|disabled',
  'u-radio|props|label',
  'u-radio|props|value',
  'u-radio-group|props|disabled',
  'u-radio-group|props|modelValue',
  'u-search|props|disabled',
  'u-search|props|modelValue',
  'u-text|props|show',
  'u-text|props|text',
  'u-textarea|props|readonly',
  'u-toast|props|loading',
  'u-field|props|label',
  'u-field|props|required',
  'u-form-item|props|label',
  'u-form-item|props|required',
  'u-swipe-action|props|disabled',
  'u-switch|props|disabled',
  'u-switch|props|loading'
]);

/**
 * @lang zh-CN 组件 API 的核心状态/交互名称；P0 组件中的这些 capability 保持 P0，P1 组件中保持 P1。
 * @lang en Core state and interaction names for component APIs; these capabilities remain P0 on P0 components and P1 on P1 components.
 */
const CORE_PROP_NAMES = new Set([
  'current',
  'disabled',
  'items',
  'label',
  'loading',
  'modelValue',
  'options',
  'pageSize',
  'readonly',
  'required',
  'show',
  'src',
  'text',
  'total',
  'value',
  'visible'
]);

/**
 * @lang zh-CN 核心事件名称只表达调用方拥有的本地状态或确认/取消意图，不含平台开放能力。
 * @lang en Core event names express caller-owned local state or confirm/cancel intent and exclude platform open capabilities.
 */
const CORE_EVENT_NAMES = new Set([
  'cancel',
  'change',
  'click',
  'close',
  'confirm',
  'input',
  'select',
  'update:modelValue'
]);

/**
 * @lang zh-CN 必须降为 P2 的平台开放能力与敏感按钮事件；这些名称不能因所在组件是 P0 而升格。
 * @lang en Platform open-capability and sensitive button events forced to P2; they cannot be promoted merely because their component is P0.
 */
const FORCED_P2_EVENT_NAMES = new Set([
  'agreeprivacyauthorization',
  'chooseavatar',
  'contact',
  'getphonenumber',
  'getuserinfo',
  'launchapp',
  'opensetting'
]);

/**
 * @lang zh-CN 必须降为 P2 的明确 prop escape/平台参数；颜色、style/class 与消息/session 族另由模式覆盖。
 * @lang en Explicit prop escapes and platform parameters forced to P2; color, style/class, message, and session families are covered by patterns separately.
 */
const FORCED_P2_PROP_NAMES = new Set(['appParameter', 'dataName', 'formType', 'openType', 'scope']);

/**
 * @lang zh-CN 上游 package manifest 声明的平台事实转换为稳定标识；HIA 矩阵只把 `mp-weixin` 作为比较范围，不会继承这些跨端声明或虚构逐组件验证证据。
 * @lang en Stable identifiers converted from the upstream package platform declaration; the HIA matrix uses only `mp-weixin` as comparison scope and inherits neither these cross-platform claims nor invented per-component validation evidence.
 */
const UPSTREAM_DECLARED_PLATFORMS = Object.freeze([
  'app-android',
  'app-harmony',
  'app-ios',
  'h5-chrome',
  'h5-safari',
  'mp-alipay',
  'mp-harmony',
  'mp-qq',
  'mp-toutiao',
  'mp-weixin'
]);

/**
 * @lang zh-CN 生成器只认可的类型构造器标识。无法归入该集合的类型表达式仍以受控 `unknown` 记录，不执行 TypeScript。
 * @lang en Type-constructor identifiers recognized by the generator. Type expressions outside this set are recorded as controlled `unknown` values without executing TypeScript.
 */
const KNOWN_TYPE_KINDS = Object.freeze(['Array', 'Boolean', 'Date', 'Function', 'Number', 'Object', 'String']);

/**
 * @lang zh-CN 在 prop 声明中可开启 TypeScript generic 的已知类型标识符；显式白名单避免把 validator 的 `<` 比较误当 generic。
 * @lang en Known type identifiers that may open TypeScript generics in prop declarations; the explicit allowlist prevents validator `<` comparisons from being mistaken for generics.
 */
const TYPE_GENERIC_IDENTIFIERS = new Set(['Array', 'Map', 'Promise', 'PropType', 'Record', 'Set']);

/**
 * @lang zh-CN 99 个冻结组件目录名称按换行连接后的摘要；它与计数共同阻止任意另一组 99 目录通过门禁。
 * @lang en Digest of the 99 frozen component directory names joined by newlines; together with the count it prevents any other set of 99 directories from passing the gate.
 */
const EXPECTED_COMPONENT_NAME_DIGEST = 'sha256:08686600adef497f4fe11a9150964d3c7f926f3fdabfa7325967d319a226bec2';

/**
 * @lang zh-CN 当前 HIA component manifest 的受控总数与比较交集数；独有 8 项不进入上游矩阵。
 * @lang en Controlled total in the current HIA component manifest and count in the comparison intersection; eight HIA-only entries do not enter the upstream matrix.
 */
const LOCAL_COMPONENT_COUNTS = Object.freeze({ manifest: 107, comparison: 99 });

/**
 * @lang zh-CN HIA 仓内 mp-weixin fixture 的受限 easycom 映射；它证明开发 fixture 可用，不等同 package-stable 公共契约已交付。
 * @lang en Controlled easycom mapping for the repository-local mp-weixin fixture; it proves fixture availability, not delivery of a package-stable public contract.
 */
const LOCAL_EASYCOM = Object.freeze({
  path: 'HIA-uView-UI/pages.json',
  pattern: '^u-(.*)',
  replacement: '@/src/components/u-$1/u-$1.vue',
  profile: 'mp-weixin',
  fixturePagePath: 'fixtures/mp-weixin/src/pages/index/index'
});

/**
 * @lang zh-CN 完整上游 package 物化门禁的冻结计数与摘要；该锁覆盖 `src/uni_modules/uview-pro` 下每个文件的相对路径、文本/二进制类别和规范化内容。
 * @lang en Frozen counts and digest for the complete upstream package materialization gate; the lock covers every file's relative path, text/binary class, and normalized content under `src/uni_modules/uview-pro`.
 */
const EXPECTED_PACKAGE_MATERIALIZATION = Object.freeze({
  fileCount: 290,
  textFileCount: 290,
  binaryFileCount: 0,
  contentDigest: 'sha256:ab93f693ed0492f5498d51a513c70546d858ed8eddf733d7756060e4d1fbd0b5'
});

/**
 * @lang zh-CN package 物化摘要的固定 framing magic；末尾 NUL 将版本标签与后续二进制计数明确分隔。
 * @lang en Fixed framing magic for the package materialization digest; the trailing NUL clearly separates the version label from subsequent binary counts.
 */
const MATERIALIZATION_MAGIC = 'hia-uview-package-materialization-v1\0';

/**
 * @lang zh-CN 公开物化算法说明。字段描述实际运行时门禁，不声称验证 Git object、HEAD 或 tree。
 * @lang en Public materialization algorithm descriptor. These fields describe the runtime gate and make no claim to validate Git objects, HEAD, or trees.
 */
const MATERIALIZATION_DESCRIPTOR = Object.freeze({
  scope: 'src/uni_modules/uview-pro',
  algorithm: 'sha256-framed-relative-path-kind-content-v1',
  framing:
    'magic|uint32be(fileCount)|repeat(uint32be(pathUtf8Length)|pathUtf8|kindByte|uint64be(contentLength)|content)',
  pathEncoding: 'utf-8',
  pathOrder: 'unicode-code-point',
  textDetection: 'utf8-roundtrip-without-nul',
  textNormalization: 'CRLF/CR-to-LF',
  binaryNormalization: 'raw-bytes'
});

/**
 * @lang zh-CN 脚本自身所在目录；由模块 URL 得到，避免当前工作目录影响仓库定位。
 * @lang en Directory containing this script, derived from the module URL so the current working directory cannot affect repository location.
 */
const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));

/**
 * @lang zh-CN HIA-uView 仓库根目录；只允许读取其声明输入并写入固定输出。
 * @lang en HIA-uView repository root; only declared inputs are read and the fixed output is written.
 */
const REPOSITORY_ROOT = resolve(SCRIPT_DIRECTORY, '..');

/**
 * @lang zh-CN 矩阵输出的绝对路径；该值完全由仓库根和固定相对路径组成。
 * @lang en Absolute matrix output path, composed solely from the repository root and fixed relative path.
 */
const OUTPUT_PATH = resolve(REPOSITORY_ROOT, OUTPUT_RELATIVE_PATH);

/**
 * @lang zh-CN 将所有文本换行统一为 LF；这是文本 provenance 的跨平台边界，不作用于二进制字节。
 * @lang en Canonicalizes every text newline to LF; this is the cross-platform boundary for textual provenance and does not apply to binary bytes.
 * @param {string} source <lang><zh-CN>已解码的文本。</zh-CN><en>Decoded text.</en></lang>
 * @returns {string} <lang><zh-CN>CRLF 与单独 CR 均转换为 LF 的文本。</zh-CN><en>Text whose CRLF and lone CR newlines are converted to LF.</en></lang>
 */
function canonicalizeTextNewlines(source) {
  // <lang><zh-CN>先由同一模式消费可选 LF，保证 CRLF 不会被转成两个换行。</zh-CN><en>A single pattern consumes an optional LF after CR so CRLF never becomes two newlines.</en></lang>
  return source.replace(/\r\n?/g, '\n');
}

/**
 * @lang zh-CN 生成小写 SHA-256 标识。字符串先规范化换行，Buffer 作为二进制原始字节保持不变。
 * @lang en Produces a lowercase SHA-256 identifier. Strings receive newline canonicalization first, while Buffers remain raw binary bytes.
 * @param {string | Buffer} value <lang><zh-CN>要摘要的 UTF-8 文本或原始二进制字节。</zh-CN><en>UTF-8 text or raw binary bytes to digest.</en></lang>
 * @returns {string} <lang><zh-CN>带 `sha256:` 前缀的稳定摘要。</zh-CN><en>Stable digest prefixed with `sha256:`.</en></lang>
 */
function digest(value) {
  // <lang><zh-CN>只有字符串进入文本规范化；这个分支避免意外改写图片、字体或其他二进制字节。</zh-CN><en>Only strings enter text normalization; this branch prevents accidental rewriting of images, fonts, or other binary bytes.</en></lang>
  const digestInput = typeof value === 'string' ? canonicalizeTextNewlines(value) : value;
  // <lang><zh-CN>显式指定 SHA-256 并立即结束摘要生命周期，避免共享或可变 hash 状态。</zh-CN><en>Explicitly selects SHA-256 and finalizes it immediately, avoiding shared or mutable hash state.</en></lang>
  return `sha256:${createHash('sha256').update(digestInput).digest('hex')}`;
}

/**
 * @lang zh-CN 自检文本 LF、CRLF 与单 CR 摘要等价，同时证明原始 Buffer 仍保留字节差异。
 * @lang en Self-checks digest equivalence for LF, CRLF, and lone CR text while proving that raw Buffers still retain byte differences.
 * @returns {void} <lang><zh-CN>不变量成立时无返回，否则在读取任何项目输入前失败。</zh-CN><en>Returns nothing when invariants hold and fails before reading project inputs otherwise.</en></lang>
 */
function validateDigestNormalizationCanary() {
  // <lang><zh-CN>三份文本只在换行表示上不同，规范后必须得到同一摘要。</zh-CN><en>The three texts differ only in newline representation and must produce one digest after normalization.</en></lang>
  const textDigests = new Set([digest('alpha\nbeta\n'), digest('alpha\r\nbeta\r\n'), digest('alpha\rbeta\r')]);

  if (textDigests.size !== 1) throw new Error('Text digest newline-normalization canary failed.');

  // <lang><zh-CN>Buffer 语义明确为原始二进制，因此 LF 与 CRLF 的字节摘要必须不同。</zh-CN><en>Buffer semantics are explicitly raw binary, so LF and CRLF byte digests must remain different.</en></lang>
  const binaryLf = digest(Buffer.from('alpha\nbeta\n', 'utf8'));
  const binaryCrLf = digest(Buffer.from('alpha\r\nbeta\r\n', 'utf8'));

  if (binaryLf === binaryCrLf) throw new Error('Binary digest raw-byte canary failed.');
}

/**
 * @lang zh-CN 按 JavaScript 字符串代码单元执行与 locale 无关的稳定比较，避免 ICU、系统语言或主机区域设置改变生成物顺序。
 * @lang en Compares JavaScript strings by code unit in a locale-independent stable order so ICU, system language, or host locale cannot change generated output.
 * @param {string} left <lang><zh-CN>左侧字符串。</zh-CN><en>Left string.</en></lang>
 * @param {string} right <lang><zh-CN>右侧字符串。</zh-CN><en>Right string.</en></lang>
 * @returns {number} <lang><zh-CN>仅可为 -1、0 或 1 的标准排序比较结果。</zh-CN><en>Standard sort-comparison result restricted to -1, 0, or 1.</en></lang>
 */
function compareCodePointStrings(left, right) {
  // <lang><zh-CN>相等值显式返回零，使稳定排序保留已验证的输入次序。</zh-CN><en>Equal values explicitly return zero so stable sorting preserves the validated input order.</en></lang>
  if (left === right) return 0;
  // <lang><zh-CN>关系运算使用 ECMAScript 固定代码单元语义，不调用区域设置敏感的 localeCompare。</zh-CN><en>Relational comparison uses fixed ECMAScript code-unit semantics and never calls locale-sensitive localeCompare.</en></lang>
  return left < right ? -1 : 1;
}

/**
 * @lang zh-CN 将平台路径转换为公开 JSON 使用的正斜杠相对路径；不会公开本地根目录。
 * @lang en Converts a platform path to a forward-slash relative path for public JSON without exposing the local root.
 * @param {string} value <lang><zh-CN>仓库内或上游包内的相对路径。</zh-CN><en>Repository-relative or upstream-package-relative path.</en></lang>
 * @returns {string} <lang><zh-CN>使用 `/` 的稳定路径。</zh-CN><en>Stable path using `/`.</en></lang>
 */
function toPortablePath(value) {
  // <lang><zh-CN>只替换当前平台分隔符；保留文件名大小写和已有正斜杠。</zh-CN><en>Replaces only the current platform separator while preserving filename case and existing forward slashes.</en></lang>
  return value.split(sep).join('/');
}

/**
 * @lang zh-CN 按完整 Unicode code point 序列比较路径，不使用 locale 或 UTF-16 surrogate 单元顺序。
 * @lang en Compares paths by complete Unicode code-point sequences without locale rules or UTF-16 surrogate-unit ordering.
 * @param {string} left <lang><zh-CN>左侧相对路径。</zh-CN><en>Left relative path.</en></lang>
 * @param {string} right <lang><zh-CN>右侧相对路径。</zh-CN><en>Right relative path.</en></lang>
 * @returns {number} <lang><zh-CN>仅可为 -1、0 或 1 的稳定 code-point 排序结果。</zh-CN><en>Stable code-point ordering result restricted to -1, 0, or 1.</en></lang>
 */
function compareUnicodeCodePointStrings(left, right) {
  // <lang><zh-CN>Array.from 按 Unicode code point 分段，补充字符不会被拆成 surrogate halves。</zh-CN><en>Array.from segments by Unicode code point so supplementary characters are not split into surrogate halves.</en></lang>
  const leftCodePoints = Array.from(left, (character) => character.codePointAt(0));
  const rightCodePoints = Array.from(right, (character) => character.codePointAt(0));
  // <lang><zh-CN>只比较公共长度；首个不同 code point 决定顺序。</zh-CN><en>Only the shared length is compared; the first distinct code point decides the order.</en></lang>
  const sharedLength = Math.min(leftCodePoints.length, rightCodePoints.length);

  for (let index = 0; index < sharedLength; index += 1) {
    if (leftCodePoints[index] !== rightCodePoints[index]) return leftCodePoints[index] < rightCodePoints[index] ? -1 : 1;
  }

  // <lang><zh-CN>完整前缀相同时，较短路径排在前面。</zh-CN><en>When one sequence is a complete prefix, the shorter path sorts first.</en></lang>
  if (leftCodePoints.length === rightCodePoints.length) return 0;
  return leftCodePoints.length < rightCodePoints.length ? -1 : 1;
}

/**
 * @lang zh-CN 将非负整数编码为四字节 big-endian framing 字段。
 * @lang en Encodes a non-negative integer as a four-byte big-endian framing field.
 * @param {number} value <lang><zh-CN>文件数或 UTF-8 路径长度。</zh-CN><en>File count or UTF-8 path length.</en></lang>
 * @returns {Buffer} <lang><zh-CN>固定四字节的帧。</zh-CN><en>Fixed four-byte frame.</en></lang>
 */
function encodeUint32(value) {
  if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) throw new Error('Materialization uint32 framing value is out of range.');

  // <lang><zh-CN>新 Buffer 每次只承载一个 framing 值，不复用可变内存。</zh-CN><en>A fresh Buffer carries exactly one framing value and no mutable memory is reused.</en></lang>
  const encoded = Buffer.allocUnsafe(4);
  encoded.writeUInt32BE(value, 0);
  return encoded;
}

/**
 * @lang zh-CN 将安全非负整数编码为八字节 big-endian framing 字段。
 * @lang en Encodes a safe non-negative integer as an eight-byte big-endian framing field.
 * @param {number} value <lang><zh-CN>规范化文件内容字节数。</zh-CN><en>Normalized file-content byte length.</en></lang>
 * @returns {Buffer} <lang><zh-CN>固定八字节的帧。</zh-CN><en>Fixed eight-byte frame.</en></lang>
 */
function encodeUint64(value) {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('Materialization uint64 framing value is out of range.');

  // <lang><zh-CN>BigInt 只用于无损写入固定宽度，不参与文件内容解析。</zh-CN><en>BigInt is used only for lossless fixed-width writing and never for file-content interpretation.</en></lang>
  const encoded = Buffer.allocUnsafe(8);
  encoded.writeBigUInt64BE(BigInt(value), 0);
  return encoded;
}

/**
 * @lang zh-CN 以严格 UTF-8 roundtrip 和 NUL 排除规则分类文件；文本换行规范化，二进制保留原始字节。
 * @lang en Classifies a file through strict UTF-8 roundtripping plus NUL exclusion; text newlines are normalized and binary bytes remain raw.
 * @param {Buffer} rawBytes <lang><zh-CN>从文件系统读取的原始字节。</zh-CN><en>Raw bytes read from the file system.</en></lang>
 * @returns {Record<string, any>} <lang><zh-CN>包含受控 text/binary 类别、framing 字节和摘要内容。</zh-CN><en>Controlled text/binary class, framing byte, and digest content.</en></lang>
 */
function normalizeMaterializedContent(rawBytes) {
  // <lang><zh-CN>Node 替换无效 UTF-8 序列；只有再编码后逐字节相同才能证明文本。</zh-CN><en>Node replaces invalid UTF-8 sequences; only byte-identical re-encoding proves that the content is text.</en></lang>
  const decoded = rawBytes.toString('utf8');
  const isText = !decoded.includes('\0') && Buffer.from(decoded, 'utf8').equals(rawBytes);

  if (isText) {
    // <lang><zh-CN>文本在摘要前统一换行，其他 Unicode 内容保持原样。</zh-CN><en>Text receives newline canonicalization before hashing while all other Unicode content is preserved.</en></lang>
    return { kind: 'text', kindByte: 0x54, content: Buffer.from(canonicalizeTextNewlines(decoded), 'utf8') };
  }

  // <lang><zh-CN>非文本使用 `B` 类别字节并直接复用原始 Buffer，不做转码。</zh-CN><en>Non-text uses the `B` kind byte and reuses the raw Buffer without transcoding.</en></lang>
  return { kind: 'binary', kindByte: 0x42, content: rawBytes };
}

/**
 * @lang zh-CN 递归收集 package 物化范围内的真实普通文件，遇到 symlink 或特殊节点立即拒绝。
 * @lang en Recursively collects real regular files in the package materialization scope and immediately rejects symlinks or special nodes.
 * @param {string} packageRoot <lang><zh-CN>冻结 package 范围的绝对根目录。</zh-CN><en>Absolute root of the frozen package scope.</en></lang>
 * @param {string} currentDirectory <lang><zh-CN>当前递归目录。</zh-CN><en>Current recursive directory.</en></lang>
 * @param {Array<{absolutePath:string,relativePath:string}>} files <lang><zh-CN>本次扫描累积的文件列表。</zh-CN><en>File list accumulated by this scan.</en></lang>
 * @returns {Promise<void>} <lang><zh-CN>收集完成时无返回。</zh-CN><en>Returns nothing after collection completes.</en></lang>
 */
async function collectMaterializationFiles(packageRoot, currentDirectory, files) {
  // <lang><zh-CN>目录名按 Unicode code point 预排序，使递归读取顺序也与文件系统无关。</zh-CN><en>Directory names are pre-sorted by Unicode code point so recursive read order is file-system independent.</en></lang>
  const childNames = (await readdir(currentDirectory)).sort(compareUnicodeCodePointStrings);

  for (const childName of childNames) {
    // <lang><zh-CN>子路径仅由已打开目录与 readdir 返回名称组成，不接受 glob 或环境替换。</zh-CN><en>Each child path combines only the opened directory and a readdir name, with no glob or environment substitution.</en></lang>
    const absolutePath = join(currentDirectory, childName);
    const status = await lstat(absolutePath);

    if (status.isSymbolicLink()) throw new Error('Upstream package materialization contains a symbolic link.');

    if (status.isDirectory()) {
      await collectMaterializationFiles(packageRoot, absolutePath, files);
      continue;
    }

    if (!status.isFile()) throw new Error('Upstream package materialization contains a non-file node.');

    // <lang><zh-CN>公开路径总是 package-root-relative 正斜杠形式，不会泄露调用方根目录。</zh-CN><en>The public path is always package-root-relative with forward slashes and never reveals the caller's root directory.</en></lang>
    const relativePath = toPortablePath(relative(packageRoot, absolutePath));

    if (!relativePath || relativePath === '..' || relativePath.startsWith('../') || relativePath.includes('\0')) {
      throw new Error('Upstream package materialization produced an invalid relative path.');
    }

    files.push({ absolutePath, relativePath });
  }
}

/**
 * @lang zh-CN 对整个上游 package 范围计算有 framing 的离线物化摘要，不调用 Git、子进程或网络。
 * @lang en Computes a framed offline materialization digest for the entire upstream package scope without Git, subprocesses, or networking.
 * @param {string} packageRoot <lang><zh-CN>显式上游根下的 package 绝对目录。</zh-CN><en>Absolute package directory beneath the explicit upstream root.</en></lang>
 * @returns {Promise<Record<string,any>>} <lang><zh-CN>不包本地绝对路径的公开物化事实。</zh-CN><en>Public materialization facts containing no local absolute path.</en></lang>
 */
async function computePackageMaterialization(packageRoot) {
  // <lang><zh-CN>根节点本身也必须是真实目录，防止整个范围通过 junction/symlink 重定向。</zh-CN><en>The root node itself must be a real directory so the entire scope cannot be redirected through a junction or symlink.</en></lang>
  const rootStatus = await lstat(packageRoot);

  if (rootStatus.isSymbolicLink() || !rootStatus.isDirectory()) {
    throw new Error('Upstream package materialization root must be a real directory.');
  }

  // <lang><zh-CN>先收集再全局排序，确保嵌套目录结构不会引入主机顺序。</zh-CN><en>Files are collected before global sorting so nested directory traversal cannot introduce host ordering.</en></lang>
  const files = [];
  await collectMaterializationFiles(packageRoot, packageRoot, files);
  files.sort((left, right) => compareUnicodeCodePointStrings(left.relativePath, right.relativePath));

  // <lang><zh-CN>重复相对路径会使 framing 语义不唯一，因此即使文件系统允许也必须拒绝。</zh-CN><en>Duplicate relative paths would make framing ambiguous and are rejected even if a file system could expose them.</en></lang>
  const uniquePaths = new Set(files.map((file) => file.relativePath));

  if (uniquePaths.size !== files.length) throw new Error('Upstream package materialization contains duplicate relative paths.');

  // <lang><zh-CN>摘要首先写入版本 magic 与固定宽度文件数，防止不同分组产生相同字节串。</zh-CN><en>The digest starts with versioned magic and a fixed-width file count so distinct groupings cannot produce the same byte stream.</en></lang>
  const hash = createHash('sha256');
  hash.update(Buffer.from(MATERIALIZATION_MAGIC, 'utf8'));
  hash.update(encodeUint32(files.length));
  // <lang><zh-CN>类别计数作为可审计附加事实，它们的文件级类别已进入摘要帧。</zh-CN><en>Class counts are auditable companion facts; every file-level class is already included in the digest frame.</en></lang>
  let textFileCount = 0;
  let binaryFileCount = 0;

  for (const file of files) {
    // <lang><zh-CN>读取前再次 lstat，防止收集后被替换为 symlink 或特殊节点。</zh-CN><en>A second lstat before reading prevents replacement by a symlink or special node after collection.</en></lang>
    const status = await lstat(file.absolutePath);

    if (status.isSymbolicLink() || !status.isFile()) throw new Error('Upstream package materialization changed during scanning.');

    // <lang><zh-CN>内容分类后，路径、类别与长度均先于内容进入摘要。</zh-CN><en>After content classification, path, kind, and length all enter the digest before the content.</en></lang>
    const normalized = normalizeMaterializedContent(await readFile(file.absolutePath));
    const encodedPath = Buffer.from(file.relativePath, MATERIALIZATION_DESCRIPTOR.pathEncoding);
    hash.update(encodeUint32(encodedPath.length));
    hash.update(encodedPath);
    hash.update(Buffer.from([normalized.kindByte]));
    hash.update(encodeUint64(normalized.content.length));
    hash.update(normalized.content);

    if (normalized.kind === 'text') textFileCount += 1;
    else binaryFileCount += 1;
  }

  // <lang><zh-CN>返回字段顺序与公开 schema 固定，摘要结束后 hash 不再复用。</zh-CN><en>Return-field order is fixed by the public schema and the hash is never reused after finalization.</en></lang>
  return {
    ...MATERIALIZATION_DESCRIPTOR,
    fileCount: files.length,
    textFileCount,
    binaryFileCount,
    contentDigest: `sha256:${hash.digest('hex')}`
  };
}

/**
 * @lang zh-CN 将公开 manifest 相对路径解析到指定根内，拒绝绝对路径、URI、反斜杠和 traversal。
 * @lang en Resolves a public manifest-relative path inside a designated root while rejecting absolute paths, URIs, backslashes, and traversal.
 * @param {string} boundaryRoot <lang><zh-CN>允许边界的绝对根。</zh-CN><en>Absolute root of the allowed boundary.</en></lang>
 * @param {string} candidate <lang><zh-CN>manifest 或固定输入中的公开相对路径。</zh-CN><en>Public relative path from a manifest or fixed input.</en></lang>
 * @param {string} requiredExtension <lang><zh-CN>必须精确匹配的文件扩展名。</zh-CN><en>File extension that must match exactly.</en></lang>
 * @param {string} label <lang><zh-CN>不包路径值的稳定诊断标签。</zh-CN><en>Stable diagnostic label containing no path value.</en></lang>
 * @returns {string} <lang><zh-CN>语法上位于边界内的绝对路径。</zh-CN><en>Absolute path lexically contained by the boundary.</en></lang>
 */
function resolveSafeRelativePath(boundaryRoot, candidate, requiredExtension, label) {
  if (
    typeof candidate !== 'string' ||
    candidate.length === 0 ||
    candidate.includes('\0') ||
    candidate.includes('\\') ||
    isAbsolute(candidate) ||
    /^[A-Za-z][A-Za-z0-9+.-]*:/.test(candidate)
  ) {
    throw new Error(`${label} must be a safe forward-slash relative path.`);
  }

  // <lang><zh-CN>显式拒绝空、`.` 和 `..` 分段，避免 normalize 在审计前消除证据。</zh-CN><en>Empty, `.`, and `..` segments are explicitly rejected so normalization cannot erase evidence before auditing.</en></lang>
  const segments = candidate.split('/');

  if (segments.some((segment) => segment === '' || segment === '.' || segment === '..') || !candidate.endsWith(requiredExtension)) {
    throw new Error(`${label} has an invalid segment or extension.`);
  }

  // <lang><zh-CN>语法 containment 是第一道门禁；后续 realpath 还会防止父目录链接越界。</zh-CN><en>Lexical containment is the first gate; a later realpath check also blocks linked-parent escapes.</en></lang>
  const absolutePath = resolve(boundaryRoot, ...segments);
  const lexicalRelative = relative(boundaryRoot, absolutePath);

  if (!lexicalRelative || lexicalRelative === '..' || lexicalRelative.startsWith(`..${sep}`) || isAbsolute(lexicalRelative)) {
    throw new Error(`${label} escapes its declared boundary.`);
  }

  return absolutePath;
}

/**
 * @lang zh-CN 验证相对路径指向边界内真实普通文件，拒绝文件 symlink 并以 realpath 防止父链接越界。
 * @lang en Verifies that a relative path targets a real regular file inside its boundary, rejecting file symlinks and using realpath to stop linked-parent escapes.
 * @param {string} boundaryRoot <lang><zh-CN>允许的绝对根。</zh-CN><en>Allowed absolute root.</en></lang>
 * @param {string} candidate <lang><zh-CN>公开相对路径。</zh-CN><en>Public relative path.</en></lang>
 * @param {string} requiredExtension <lang><zh-CN>必须匹配的扩展名。</zh-CN><en>Required extension.</en></lang>
 * @param {string} label <lang><zh-CN>安全诊断标签。</zh-CN><en>Safe diagnostic label.</en></lang>
 * @returns {Promise<string>} <lang><zh-CN>通过语法与实体 containment 的文件绝对路径。</zh-CN><en>Absolute file path that passed lexical and physical containment.</en></lang>
 */
async function validateContainedRegularFile(boundaryRoot, candidate, requiredExtension, label) {
  // <lang><zh-CN>先运行纯字符串规则，危险输入不会触发任何目标文件系统访问。</zh-CN><en>Pure string rules run first so dangerous input causes no target file-system access.</en></lang>
  const absolutePath = resolveSafeRelativePath(boundaryRoot, candidate, requiredExtension, label);
  const status = await lstat(absolutePath);

  if (status.isSymbolicLink() || !status.isFile()) throw new Error(`${label} must resolve to a real regular file.`);

  // <lang><zh-CN>同时规范化根与目标，确保 junction 或 symlink 父目录不能将文件引到边界外。</zh-CN><en>Both root and target are canonicalized so junction or symlink parents cannot redirect the file beyond the boundary.</en></lang>
  const physicalRoot = await realpath(boundaryRoot);
  const physicalTarget = await realpath(absolutePath);
  const physicalRelative = relative(physicalRoot, physicalTarget);

  if (!physicalRelative || physicalRelative === '..' || physicalRelative.startsWith(`..${sep}`) || isAbsolute(physicalRelative)) {
    throw new Error(`${label} physical path escapes its declared boundary.`);
  }

  return absolutePath;
}

/**
 * @lang zh-CN 用纯字符串负例锁定 manifest 路径门禁，不创建或读取临时文件。
 * @lang en Locks manifest path gates with pure-string negative cases and creates or reads no temporary files.
 * @returns {void} <lang><zh-CN>两类危险路径均被拒绝时无返回。</zh-CN><en>Returns nothing when both dangerous path classes are rejected.</en></lang>
 */
function validatePathBoundaryCanary() {
  // <lang><zh-CN>负例只使用固定虚拟值，不包用户路径或私有目录。</zh-CN><en>Negative cases use fixed synthetic values and contain no user path or private directory.</en></lang>
  const rejected = ['../outside.vue', resolve(REPOSITORY_ROOT, 'outside.vue'), 'file:///outside.vue'].map((candidate) => {
    try {
      resolveSafeRelativePath(REPOSITORY_ROOT, candidate, '.vue', 'Path-boundary canary');
      return false;
    } catch {
      return true;
    }
  });

  if (rejected.some((value) => !value)) throw new Error('Manifest path-boundary canary failed.');
}

/**
 * @lang zh-CN 读取并解析受信任的本地 JSON 输入，同时给解析错误附加不含文件正文的稳定上下文。
 * @lang en Reads and parses a trusted local JSON input while adding stable context to parse failures without including file contents.
 * @param {string} path <lang><zh-CN>要读取的显式绝对路径。</zh-CN><en>Explicit absolute path to read.</en></lang>
 * @returns {Promise<Record<string, any>>} <lang><zh-CN>解析后的 JSON 对象。</zh-CN><en>Parsed JSON object.</en></lang>
 */
async function readJson(path) {
  // <lang><zh-CN>读取 UTF-8 文本但不输出路径或正文，避免错误日志泄露调用方目录。</zh-CN><en>Reads UTF-8 text without logging the path or body, avoiding disclosure of the caller's directory in errors.</en></lang>
  const source = await readFile(path, 'utf8');

  try {
    // <lang><zh-CN>仅使用 JSON parser；不会导入、执行或求值配置内容。</zh-CN><en>Uses the JSON parser only and never imports, executes, or evaluates configuration content.</en></lang>
    return JSON.parse(source);
  } catch (error) {
    // <lang><zh-CN>将底层错误消息保留为诊断但不拼接文件正文或绝对路径。</zh-CN><en>Retains the underlying error message for diagnosis without appending file contents or the absolute path.</en></lang>
    throw new Error(`Could not parse required JSON input: ${error.message}`);
  }
}

/**
 * @lang zh-CN 解析唯一允许的命令行参数：上游本地根目录、显式写入模式和只读检查别名。默认与 `--check` 均只读；未知参数立即失败，防止悄然扩大写入面。
 * @lang en Parses the only allowed command-line arguments: the local upstream root, explicit write mode, and a read-only check alias. Both the default and `--check` are read-only; unknown arguments fail immediately to prevent silent expansion of the write surface.
 * @param {string[]} argumentsList <lang><zh-CN>不含 Node 与脚本路径的参数列表。</zh-CN><en>Argument list excluding Node and script paths.</en></lang>
 * @returns {{upstreamRoot:string,write:boolean}} <lang><zh-CN>规范化后的执行选项。</zh-CN><en>Normalized execution options.</en></lang>
 */
function parseArguments(argumentsList) {
  // <lang><zh-CN>上游根目录在遇到 `--upstream-root` 前保持空值，最终必须由调用方明确提供。</zh-CN><en>The upstream root remains empty until `--upstream-root` is encountered and must ultimately be supplied explicitly.</en></lang>
  let upstreamRoot = '';
  // <lang><zh-CN>写入权限默认关闭；只有精确的 `--write` 才允许替换固定输出。</zh-CN><en>Write permission is disabled by default; only exact `--write` may replace the fixed output.</en></lang>
  let write = false;
  // <lang><zh-CN>显式模式只允许声明一次；同时出现 `--check`/`--write` 会使授权含糊并被拒绝。</zh-CN><en>An explicit mode may be declared only once; combining `--check` and `--write` makes authorization ambiguous and is rejected.</en></lang>
  let explicitMode = '';

  // <lang><zh-CN>逐项消费有限参数语法；循环不会解释 shell、环境变量、glob 或参数文件。</zh-CN><en>Consumes the bounded argument grammar one item at a time and interprets no shell, environment variable, glob, or argument file.</en></lang>
  for (let index = 0; index < argumentsList.length; index += 1) {
    // <lang><zh-CN>当前参数只用于精确命令名比较。</zh-CN><en>The current argument is used only for exact option-name comparison.</en></lang>
    const argument = argumentsList[index];

    if (argument === '--upstream-root') {
      // <lang><zh-CN>根目录值必须紧随参数；空值会使输入边界不可审计。</zh-CN><en>The root value must immediately follow the option; an empty value would make the input boundary unauditable.</en></lang>
      const value = argumentsList[index + 1];

      if (!value || value.startsWith('--')) {
        // <lang><zh-CN>以稳定错误拒绝缺失路径，不尝试默认到用户目录或联网检出。</zh-CN><en>Rejects a missing path with a stable error instead of defaulting to a user directory or network checkout.</en></lang>
        throw new Error('Usage: node scripts/generate-api-compatibility-matrix.mjs --upstream-root <local-checkout> [--check|--write]');
      }

      // <lang><zh-CN>解析为绝对路径仅用于本次只读访问；输出中不会保存此值。</zh-CN><en>Resolves an absolute path for this read-only run only; the value is never stored in the output.</en></lang>
      upstreamRoot = resolve(value);
      // <lang><zh-CN>跳过已消费的路径值，避免将其误判为未知参数。</zh-CN><en>Skips the consumed path value so it is not mistaken for an unknown option.</en></lang>
      index += 1;
      continue;
    }

    if (argument === '--check') {
      if (explicitMode) throw new Error('Choose only one of --check or --write.');
      // <lang><zh-CN>显式确认只读语义；默认已经只读，因此该别名只提升命令可读性。</zh-CN><en>Explicitly confirms read-only semantics; the default is already read-only, so this alias improves command readability only.</en></lang>
      write = false;
      explicitMode = 'check';
      continue;
    }

    if (argument === '--write') {
      if (explicitMode) throw new Error('Choose only one of --check or --write.');
      // <lang><zh-CN>仅该参数授权覆盖固定仓内输出；它仍不能改变输出路径或写入上游。</zh-CN><en>Only this option authorizes replacing the fixed repository-local output; it still cannot change the output path or write upstream.</en></lang>
      write = true;
      explicitMode = 'write';
      continue;
    }

    // <lang><zh-CN>拒绝所有未定义参数，确保调用方不能改变输出位置或扩大输入发现范围。</zh-CN><en>Rejects every undefined option so callers cannot change the output location or broaden input discovery.</en></lang>
    throw new Error(`Unknown argument: ${argument}`);
  }

  if (!upstreamRoot) {
    // <lang><zh-CN>不提供隐式上游位置，避免机器相关路径或浮动检出进入公共生成流程。</zh-CN><en>Provides no implicit upstream location, preventing machine-specific paths or floating checkouts from entering the public generation flow.</en></lang>
    throw new Error('Usage: node scripts/generate-api-compatibility-matrix.mjs --upstream-root <local-checkout> [--check|--write]');
  }

  // <lang><zh-CN>返回唯一的输入根和写入策略；其他生成事实全部由冻结常量与仓内声明决定。</zh-CN><en>Returns the sole input root and write policy; every other generated fact comes from frozen constants and repository-local declarations.</en></lang>
  return { upstreamRoot, write };
}

/**
 * @lang zh-CN 在不改动字符串字面量的前提下移除 JavaScript/TypeScript 注释。空格占位保持邻接 token 不会意外拼接；本函数不执行源码。
 * @lang en Removes JavaScript and TypeScript comments without changing string literals. Space placeholders prevent adjacent tokens from being joined accidentally; this function never executes source.
 * @param {string} source <lang><zh-CN>要清理的源码片段。</zh-CN><en>Source fragment to clean.</en></lang>
 * @returns {string} <lang><zh-CN>保留字符串和换行位置的无注释文本。</zh-CN><en>Comment-free text preserving strings and newline positions.</en></lang>
 */
function removeComments(source) {
  // <lang><zh-CN>结果按字符累积，确保仅注释正文被空格替换。</zh-CN><en>The result accumulates character by character so only comment bodies become spaces.</en></lang>
  let result = '';
  // <lang><zh-CN>当前字符串分隔符为空表示普通代码；反引号在本静态词法层同样作为不透明字符串处理。</zh-CN><en>An empty quote delimiter denotes ordinary code; backticks are likewise treated as opaque strings by this static lexical layer.</en></lang>
  let quote = '';
  // <lang><zh-CN>转义标记仅在字符串内生效，防止转义引号提前结束字符串。</zh-CN><en>The escape flag applies only inside strings and prevents escaped quotes from ending a string early.</en></lang>
  let escaped = false;
  // <lang><zh-CN>块注释状态跨越换行，直到第一个合法结束标记。</zh-CN><en>Block-comment state spans line breaks until the first valid closing marker.</en></lang>
  let blockComment = false;
  // <lang><zh-CN>行注释状态在换行处结束，并保留该换行以维持诊断位置。</zh-CN><en>Line-comment state ends at a newline, which is retained to preserve diagnostic positions.</en></lang>
  let lineComment = false;

  // <lang><zh-CN>单次线性扫描足以处理本项目受控的 JS/TS 声明表面，不解析 AST 或运行时语义。</zh-CN><en>A single linear scan covers the controlled JS/TS declaration surface without parsing an AST or runtime semantics.</en></lang>
  for (let index = 0; index < source.length; index += 1) {
    // <lang><zh-CN>当前字符和前瞻字符共同识别注释边界。</zh-CN><en>The current and look-ahead characters identify comment boundaries together.</en></lang>
    const character = source[index];
    const nextCharacter = source[index + 1] ?? '';

    if (lineComment) {
      if (character === '\n') {
        // <lang><zh-CN>结束行注释并保留换行；下一字符恢复普通代码解析。</zh-CN><en>Ends the line comment while retaining the newline; ordinary code parsing resumes for the next character.</en></lang>
        lineComment = false;
        result += '\n';
      } else {
        // <lang><zh-CN>以空格覆盖注释正文，避免删除后把前后 token 拼接。</zh-CN><en>Replaces comment text with a space so neighboring tokens cannot join after removal.</en></lang>
        result += ' ';
      }
      continue;
    }

    if (blockComment) {
      if (character === '*' && nextCharacter === '/') {
        // <lang><zh-CN>同时消费块注释结束符，并为两个字符保留两个空格。</zh-CN><en>Consumes the block-comment terminator together and preserves two character positions as spaces.</en></lang>
        blockComment = false;
        result += '  ';
        index += 1;
      } else {
        // <lang><zh-CN>块注释内换行原样保留，其余字符变为空格。</zh-CN><en>Newlines inside block comments are retained and every other character becomes a space.</en></lang>
        result += character === '\n' ? '\n' : ' ';
      }
      continue;
    }

    if (quote) {
      // <lang><zh-CN>字符串内容原样保留，以便后续安全解析事件名和字面默认值。</zh-CN><en>String contents are retained verbatim so later parsing can safely recover event names and literal defaults.</en></lang>
      result += character;

      if (escaped) {
        // <lang><zh-CN>已转义字符不会改变字符串状态；下一字符恢复普通字符串判断。</zh-CN><en>An escaped character cannot change string state; normal string checks resume for the next character.</en></lang>
        escaped = false;
      } else if (character === '\\') {
        // <lang><zh-CN>反斜杠只转义紧随字符。</zh-CN><en>A backslash escapes only the immediately following character.</en></lang>
        escaped = true;
      } else if (character === quote) {
        // <lang><zh-CN>未转义的同类分隔符结束当前字符串。</zh-CN><en>An unescaped matching delimiter ends the current string.</en></lang>
        quote = '';
      }
      continue;
    }

    if (character === '/' && nextCharacter === '/') {
      // <lang><zh-CN>进入行注释并以空格替换起始符。</zh-CN><en>Enters a line comment and replaces its opener with spaces.</en></lang>
      lineComment = true;
      result += '  ';
      index += 1;
      continue;
    }

    if (character === '/' && nextCharacter === '*') {
      // <lang><zh-CN>进入块注释并以空格替换起始符。</zh-CN><en>Enters a block comment and replaces its opener with spaces.</en></lang>
      blockComment = true;
      result += '  ';
      index += 1;
      continue;
    }

    if (character === "'" || character === '"' || character === '`') {
      // <lang><zh-CN>记录字符串分隔符；模板插值在本生成器中不求值并作为整体不透明文本。</zh-CN><en>Records the string delimiter; template interpolation is never evaluated and remains opaque text in this generator.</en></lang>
      quote = character;
    }

    // <lang><zh-CN>普通代码字符原样进入结果，供受控平衡扫描使用。</zh-CN><en>Ordinary code characters enter the result unchanged for controlled balanced scanning.</en></lang>
    result += character;
  }

  // <lang><zh-CN>返回等长清理文本；未闭合注释或字符串会在后续平衡校验中形成显式 unresolved。</zh-CN><en>Returns equal-length cleaned text; unterminated comments or strings become explicit unresolved results during later balance validation.</en></lang>
  return result;
}

/**
 * @lang zh-CN 从已知起始分隔符查找配对结束位置，忽略字符串和注释中的同形字符。
 * @lang en Finds the matching closing delimiter from a known opener while ignoring matching characters inside strings and comments.
 * @param {string} source <lang><zh-CN>要扫描的源码。</zh-CN><en>Source text to scan.</en></lang>
 * @param {number} openingIndex <lang><zh-CN>起始分隔符的零基索引。</zh-CN><en>Zero-based index of the opening delimiter.</en></lang>
 * @param {string} openingCharacter <lang><zh-CN>起始分隔符字符。</zh-CN><en>Opening delimiter character.</en></lang>
 * @param {string} closingCharacter <lang><zh-CN>结束分隔符字符。</zh-CN><en>Closing delimiter character.</en></lang>
 * @returns {number} <lang><zh-CN>配对结束索引；未闭合时返回 `-1`。</zh-CN><en>Matching closing index, or `-1` when unclosed.</en></lang>
 */
function findMatchingDelimiter(source, openingIndex, openingCharacter, closingCharacter) {
  // <lang><zh-CN>深度从首个已知起始符开始；只有代码态同类分隔符改变深度。</zh-CN><en>Depth starts at the known opener; only matching delimiters in code state change it.</en></lang>
  let depth = 0;
  // <lang><zh-CN>字符串分隔符状态避免把字面量内容误判为结构。</zh-CN><en>Quote state prevents literal contents from being mistaken for structure.</en></lang>
  let quote = '';
  // <lang><zh-CN>转义状态避免转义引号结束字符串。</zh-CN><en>Escape state prevents escaped quotes from ending a string.</en></lang>
  let escaped = false;
  // <lang><zh-CN>行/块注释状态共同屏蔽注释中的分隔符。</zh-CN><en>Line and block comment states jointly mask delimiters inside comments.</en></lang>
  let lineComment = false;
  let blockComment = false;

  // <lang><zh-CN>从起始符线性扫描到配对结束；文件规模受 99 项组件白名单约束。</zh-CN><en>Scans linearly from the opener to its match; file size is bounded by the 99-component allowlist.</en></lang>
  for (let index = openingIndex; index < source.length; index += 1) {
    // <lang><zh-CN>当前与前瞻字符用于识别注释边界。</zh-CN><en>Current and look-ahead characters identify comment boundaries.</en></lang>
    const character = source[index];
    const nextCharacter = source[index + 1] ?? '';

    if (lineComment) {
      if (character === '\n') lineComment = false;
      continue;
    }

    if (blockComment) {
      if (character === '*' && nextCharacter === '/') {
        blockComment = false;
        index += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === quote) {
        quote = '';
      }
      continue;
    }

    if (character === '/' && nextCharacter === '/') {
      lineComment = true;
      index += 1;
      continue;
    }

    if (character === '/' && nextCharacter === '*') {
      blockComment = true;
      index += 1;
      continue;
    }

    if (character === "'" || character === '"' || character === '`') {
      quote = character;
      continue;
    }

    if (character === openingCharacter) {
      // <lang><zh-CN>嵌套同类起始符增加深度。</zh-CN><en>A nested opener of the same kind increases depth.</en></lang>
      depth += 1;
      continue;
    }

    if (character === closingCharacter && !(closingCharacter === '>' && source[index - 1] === '=')) {
      // <lang><zh-CN>结束符降低深度；`=>` 的箭头尖括号不结束 TypeScript generic。</zh-CN><en>A closer reduces depth; the arrow head in `=>` does not close a TypeScript generic.</en></lang>
      depth -= 1;

      if (depth === 0) {
        // <lang><zh-CN>首个回到零深度的位置就是配对结束符。</zh-CN><en>The first position returning to zero depth is the matching closer.</en></lang>
        return index;
      }
    }
  }

  // <lang><zh-CN>未闭合声明不能凭猜测补齐，调用方必须产生显式 parser issue。</zh-CN><en>An unclosed declaration cannot be guessed; the caller must produce an explicit parser issue.</en></lang>
  return -1;
}

/**
 * @lang zh-CN 判断尖括号是否由已知 TypeScript 类型标识符开启；比较运算符和 Vue template 标记不会进入 generic 深度。
 * @lang en Determines whether an angle bracket is opened by a known TypeScript type identifier; comparison operators and Vue template tags do not enter generic depth.
 * @param {string} source <lang><zh-CN>已去注释但保留字符串的源码。</zh-CN><en>Comment-free source retaining strings.</en></lang>
 * @param {number} angleIndex <lang><zh-CN>`<` 的零基索引。</zh-CN><en>Zero-based index of `<`.</en></lang>
 * @returns {boolean} <lang><zh-CN>是否应作为 generic 起始符。</zh-CN><en>Whether the character should be treated as a generic opener.</en></lang>
 */
function isTypeGenericOpening(source, angleIndex) {
  if (source[angleIndex + 1] === '=') return false;

  // <lang><zh-CN>只读取 `<` 前紧邻的标识符，不跨越运算符或空白之外的 token。</zh-CN><en>Reads only the identifier immediately preceding `<` and never crosses an operator or non-whitespace token.</en></lang>
  const prefix = source.slice(0, angleIndex).trimEnd();
  const identifier = /([A-Za-z_$][\w$]*)$/.exec(prefix)?.[1] ?? '';

  return TYPE_GENERIC_IDENTIFIERS.has(identifier);
}

/**
 * @lang zh-CN 按顶层分隔符拆分对象或参数内容；嵌套括号、对象、数组和 generic 中的同字符不会切分。
 * @lang en Splits object or argument contents on a top-level delimiter; matching characters inside nested parentheses, objects, arrays, and generics do not split.
 * @param {string} source <lang><zh-CN>不含外层分隔符的源码。</zh-CN><en>Source text without its outer delimiters.</en></lang>
 * @param {string} delimiter <lang><zh-CN>单字符顶层分隔符。</zh-CN><en>Single-character top-level delimiter.</en></lang>
 * @returns {string[]} <lang><zh-CN>按源码顺序得到的非空片段。</zh-CN><en>Non-empty fragments in source order.</en></lang>
 */
function splitTopLevel(source, delimiter) {
  // <lang><zh-CN>移除注释后仍保留字符位置和字符串，使平衡计数不受注释标点影响。</zh-CN><en>Comment removal preserves character positions and strings so punctuation in comments cannot affect balancing.</en></lang>
  const cleaned = removeComments(source);
  // <lang><zh-CN>结果存储每个顶层片段，空白片段被忽略。</zh-CN><en>The result stores every top-level fragment and ignores whitespace-only fragments.</en></lang>
  const parts = [];
  // <lang><zh-CN>当前片段起点在每次顶层分隔后推进。</zh-CN><en>The current fragment start advances after every top-level delimiter.</en></lang>
  let start = 0;
  // <lang><zh-CN>三类运行时括号和 TypeScript generic 深度共同定义“顶层”。</zh-CN><en>Three runtime bracket depths and a TypeScript generic depth jointly define “top level.”</en></lang>
  let parentheses = 0;
  let braces = 0;
  let brackets = 0;
  let angles = 0;
  // <lang><zh-CN>字符串与转义状态屏蔽字面量中的结构字符。</zh-CN><en>Quote and escape state mask structural characters inside literals.</en></lang>
  let quote = '';
  let escaped = false;

  // <lang><zh-CN>扫描清理后的等长文本，同时从原始 source 截取结果以保留默认表达式字节。</zh-CN><en>Scans equal-length cleaned text while slicing results from the original source to preserve default-expression bytes.</en></lang>
  for (let index = 0; index < cleaned.length; index += 1) {
    // <lang><zh-CN>当前字符只影响平衡或顶层切分。</zh-CN><en>The current character affects only balancing or top-level splitting.</en></lang>
    const character = cleaned[index];

    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = '';
      continue;
    }

    if (character === "'" || character === '"' || character === '`') {
      quote = character;
      continue;
    }

    if (character === '(') parentheses += 1;
    else if (character === ')') parentheses -= 1;
    else if (character === '{') braces += 1;
    else if (character === '}') braces -= 1;
    else if (character === '[') brackets += 1;
    else if (character === ']') brackets -= 1;
    else if (character === '<' && isTypeGenericOpening(cleaned, index)) angles += 1;
    else if (character === '>' && cleaned[index - 1] !== '=' && angles > 0) angles -= 1;

    if (character === delimiter && parentheses === 0 && braces === 0 && brackets === 0 && angles === 0) {
      // <lang><zh-CN>仅在所有嵌套深度为零时截取片段，避免拆开数组默认值或 generic 类型参数。</zh-CN><en>Slices only when every nesting depth is zero, avoiding splits inside array defaults or generic type arguments.</en></lang>
      const part = source.slice(start, index).trim();

      if (part) parts.push(part);
      start = index + 1;
    }
  }

  // <lang><zh-CN>尾部片段没有后续分隔符，需要单独收集。</zh-CN><en>The trailing fragment has no following delimiter and must be collected separately.</en></lang>
  const tail = source.slice(start).trim();

  if (tail) parts.push(tail);

  // <lang><zh-CN>按声明顺序返回；调用方在生成 JSON 前再执行稳定名称排序。</zh-CN><en>Returns declaration order; callers perform stable name sorting before generating JSON.</en></lang>
  return parts;
}

/**
 * @lang zh-CN 查找片段中的第一个顶层冒号，用于区分属性名与值；嵌套对象、类型和字符串内冒号被忽略。
 * @lang en Finds the first top-level colon in a fragment to separate a property name from its value, ignoring colons in nested objects, types, and strings.
 * @param {string} source <lang><zh-CN>单个对象属性片段。</zh-CN><en>Single object-property fragment.</en></lang>
 * @returns {number} <lang><zh-CN>顶层冒号索引；不存在时为 `-1`。</zh-CN><en>Top-level colon index, or `-1` when absent.</en></lang>
 */
function findTopLevelColon(source) {
  // <lang><zh-CN>复用顶层拆分器思想，但需要返回精确索引而非片段。</zh-CN><en>Reuses the top-level splitting model but returns an exact index instead of fragments.</en></lang>
  const cleaned = removeComments(source);
  let parentheses = 0;
  let braces = 0;
  let brackets = 0;
  let angles = 0;
  let quote = '';
  let escaped = false;

  // <lang><zh-CN>逐字符维护嵌套深度，遇到首个真正顶层冒号即结束。</zh-CN><en>Maintains nesting depth character by character and stops at the first true top-level colon.</en></lang>
  for (let index = 0; index < cleaned.length; index += 1) {
    const character = cleaned[index];

    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = '';
      continue;
    }

    if (character === "'" || character === '"' || character === '`') {
      quote = character;
      continue;
    }

    if (character === '(') parentheses += 1;
    else if (character === ')') parentheses -= 1;
    else if (character === '{') braces += 1;
    else if (character === '}') braces -= 1;
    else if (character === '[') brackets += 1;
    else if (character === ']') brackets -= 1;
    else if (character === '<' && isTypeGenericOpening(cleaned, index)) angles += 1;
    else if (character === '>' && cleaned[index - 1] !== '=' && angles > 0) angles -= 1;
    else if (character === ':' && parentheses === 0 && braces === 0 && brackets === 0 && angles === 0) return index;
  }

  // <lang><zh-CN>没有顶层冒号意味着 shorthand、spread 或不受支持语法，调用方必须保守处理。</zh-CN><en>No top-level colon indicates shorthand, spread, or unsupported syntax, which callers must handle conservatively.</en></lang>
  return -1;
}

/**
 * @lang zh-CN 从对象属性名片段恢复受控的标识符或静态字符串键；computed key 和 spread 不被推断。
 * @lang en Recovers a controlled identifier or static string key from an object-property name fragment; computed keys and spreads are not inferred.
 * @param {string} source <lang><zh-CN>冒号前的属性名源码。</zh-CN><en>Property-name source before the colon.</en></lang>
 * @returns {string} <lang><zh-CN>规范化属性名；不支持时为空字符串。</zh-CN><en>Normalized property name, or an empty string when unsupported.</en></lang>
 */
function normalizePropertyName(source) {
  // <lang><zh-CN>删除注释与首尾空白，但不解释 computed expression。</zh-CN><en>Removes comments and surrounding whitespace without interpreting computed expressions.</en></lang>
  const candidate = removeComments(source).trim();

  if (/^[A-Za-z_$][\w$-]*$/.test(candidate)) {
    // <lang><zh-CN>普通标识符及现有 kebab key 原样保留。</zh-CN><en>Plain identifiers and existing kebab keys are retained verbatim.</en></lang>
    return candidate;
  }

  if (/^(['"])[^'"\r\n]+\1$/.test(candidate)) {
    // <lang><zh-CN>静态单/双引号键去除分隔符；不接受转义或换行以免错误解码。</zh-CN><en>Static single- or double-quoted keys lose their delimiters; escapes and newlines are rejected to avoid incorrect decoding.</en></lang>
    return candidate.slice(1, -1);
  }

  // <lang><zh-CN>computed、template、数字或 spread 键保持未知，不能伪造成已审计名称。</zh-CN><en>Computed, template, numeric, or spread keys remain unknown and cannot be presented as audited names.</en></lang>
  return '';
}

/**
 * @lang zh-CN 将对象字面量拆成稳定的名称和值记录，并报告无法解释的顶层成员。
 * @lang en Splits an object literal into stable name/value records and reports top-level members that cannot be interpreted.
 * @param {string} objectSource <lang><zh-CN>包含外层花括号的对象字面量。</zh-CN><en>Object literal including its outer braces.</en></lang>
 * @returns {{entries:Array<{name:string,value:string}>,unresolved:string[]}} <lang><zh-CN>已解析成员与不可解析片段摘要列表。</zh-CN><en>Parsed members and a list of digests for unresolved fragments.</en></lang>
 */
function parseObjectLiteral(objectSource) {
  // <lang><zh-CN>移除外层花括号后只在顶层逗号处分割属性。</zh-CN><en>Removes the outer braces and splits properties only on top-level commas.</en></lang>
  const fragments = splitTopLevel(objectSource.slice(1, -1), ',');
  // <lang><zh-CN>有效成员保持源码顺序，最终由调用方按名称排序。</zh-CN><en>Valid members retain source order and are later sorted by name by the caller.</en></lang>
  const entries = [];
  // <lang><zh-CN>不可解析成员仅记录摘要，防止复制上游表达性源码。</zh-CN><en>Unresolved members are recorded by digest only so expressive upstream source is not copied.</en></lang>
  const unresolved = [];

  // <lang><zh-CN>逐属性验证静态名称和顶层冒号，不把 spread 或 computed key 当成普通 API。</zh-CN><en>Validates a static name and top-level colon for every property, never treating spreads or computed keys as ordinary APIs.</en></lang>
  for (const fragment of fragments) {
    const colonIndex = findTopLevelColon(fragment);

    if (colonIndex < 0) {
      unresolved.push(digest(removeComments(fragment).trim()));
      continue;
    }

    const name = normalizePropertyName(fragment.slice(0, colonIndex));

    if (!name) {
      unresolved.push(digest(removeComments(fragment).trim()));
      continue;
    }

    // <lang><zh-CN>属性值保留在生成器内供类型/默认分类；公开结果只保存受控事实或摘要。</zh-CN><en>The property value remains inside the generator for type/default classification; public output stores only controlled facts or digests.</en></lang>
    entries.push({ name, value: fragment.slice(colonIndex + 1).trim() });
  }

  // <lang><zh-CN>返回显式的成功与未知两部分，调用方不能用空数组掩盖未知。</zh-CN><en>Returns explicit successful and unknown portions so callers cannot hide unknowns behind an empty array.</en></lang>
  return { entries, unresolved };
}

/**
 * @lang zh-CN 在已知 token 后提取紧随的平衡结构；用于宏参数、generic 与 props 对象，不执行 token 内容。
 * @lang en Extracts a balanced structure immediately following a known token for macro arguments, generics, and prop objects without executing token contents.
 * @param {string} source <lang><zh-CN>完整源码。</zh-CN><en>Complete source text.</en></lang>
 * @param {number} searchStart <lang><zh-CN>开始寻找起始分隔符的位置。</zh-CN><en>Position from which to search for the opening delimiter.</en></lang>
 * @param {string} openingCharacter <lang><zh-CN>起始分隔符。</zh-CN><en>Opening delimiter.</en></lang>
 * @param {string} closingCharacter <lang><zh-CN>结束分隔符。</zh-CN><en>Closing delimiter.</en></lang>
 * @returns {{source:string,start:number,end:number}|null} <lang><zh-CN>含外层分隔符的片段和索引；不存在或未闭合时为 `null`。</zh-CN><en>Fragment including delimiters and its indices, or `null` when absent or unclosed.</en></lang>
 */
function extractBalancedStructure(source, searchStart, openingCharacter, closingCharacter) {
  // <lang><zh-CN>只接受 searchStart 之后首个起始符，调用方负责确认它属于目标声明。</zh-CN><en>Accepts only the first opener after searchStart; the caller is responsible for tying it to the target declaration.</en></lang>
  const start = source.indexOf(openingCharacter, searchStart);

  if (start < 0) return null;

  // <lang><zh-CN>平衡扫描忽略注释/字符串并返回精确结束位置。</zh-CN><en>Balanced scanning ignores comments and strings and returns the exact closing position.</en></lang>
  const end = findMatchingDelimiter(source, start, openingCharacter, closingCharacter);

  if (end < 0) return null;

  // <lang><zh-CN>片段只在内存中用于静态事实抽取。</zh-CN><en>The fragment is used in memory for static fact extraction only.</en></lang>
  return { source: source.slice(start, end + 1), start, end };
}

/**
 * @lang zh-CN 按源声明顺序提取受控运行时构造器；顺序会影响 Vue Boolean/String casting，不得排序抙平。
 * @lang en Extracts controlled runtime constructors in source declaration order; order affects Vue Boolean/String casting and must not be sorted away.
 * @param {string} expression <lang><zh-CN>prop 定义的 `type` 字段表达式。</zh-CN><en>The prop definition's `type` field expression.</en></lang>
 * @returns {string[]} <lang><zh-CN>按首次出现去重的构造器顺序；无法识别时为 `unknown`。</zh-CN><en>Constructor order deduplicated by first appearance, or `unknown` when none can be recognized.</en></lang>
 */
function parseTypeOrder(expression) {
  // <lang><zh-CN>只匹配冻结白名单的独立标识符，注释先被屏蔽以免示例文字进入事实。</zh-CN><en>Only standalone allowlisted identifiers are matched, with comments masked first so examples cannot enter the facts.</en></lang>
  const pattern = new RegExp(`\\b(?:${KNOWN_TYPE_KINDS.join('|')})\\b`, 'g');
  const cleaned = removeComments(expression);
  const order = [];
  const seen = new Set();
  let match = pattern.exec(cleaned);

  while (match) {
    if (!seen.has(match[0])) {
      seen.add(match[0]);
      order.push(match[0]);
    }

    match = pattern.exec(cleaned);
  }

  return order.length > 0 ? order : ['unknown'];
}

/**
 * @lang zh-CN 从同一类型表达式生成排序集合视图，与保留语义的 `typeOrder` 并存。
 * @lang en Produces a sorted set view from the same type expression, alongside the semantics-preserving `typeOrder`.
 * @param {string} expression <lang><zh-CN>prop 定义的 `type` 字段表达式。</zh-CN><en>The prop definition's `type` field expression.</en></lang>
 * @returns {string[]} <lang><zh-CN>排序去重的构造器集合视图。</zh-CN><en>Sorted unique constructor-set view.</en></lang>
 */
function parseTypeKinds(expression) {
  // <lang><zh-CN>复制后排序，不改变调用方需要的源顺序。</zh-CN><en>Sorting a copy leaves the source-order view untouched for callers that need it.</en></lang>
  const kinds = parseTypeOrder(expression);

  return [...kinds].sort(compareCodePointStrings);
}

/**
 * @lang zh-CN 解码无需执行即可证明的单/双引号静态字符串。复杂转义返回 `null` 并由调用方改记表达式摘要。
 * @lang en Decodes a single- or double-quoted static string that can be proven without execution. Complex escapes return `null` so callers record an expression digest instead.
 * @param {string} expression <lang><zh-CN>已去除首尾空白的候选字面量。</zh-CN><en>Trimmed literal candidate.</en></lang>
 * @returns {string|null} <lang><zh-CN>安全解码文本；无法证明时为 `null`。</zh-CN><en>Safely decoded text, or `null` when it cannot be proven.</en></lang>
 */
function parseStaticString(expression) {
  // <lang><zh-CN>首尾必须是同一引号并且正文不能换行。</zh-CN><en>The first and last delimiters must match and the body cannot contain a line break.</en></lang>
  const quote = expression[0];

  if ((quote !== "'" && quote !== '"') || expression.at(-1) !== quote || /[\r\n]/.test(expression)) return null;

  // <lang><zh-CN>双引号文本交由 JSON parser 处理标准转义，失败时保持未知。</zh-CN><en>Double-quoted text uses the JSON parser for standard escapes and remains unknown on failure.</en></lang>
  if (quote === '"') {
    try {
      return JSON.parse(expression);
    } catch {
      return null;
    }
  }

  // <lang><zh-CN>单引号仅接受一组明确无歧义的常见转义；Unicode/十六进制/续行等复杂形式不自行解释。</zh-CN><en>Single-quoted text accepts only an explicit set of unambiguous common escapes; Unicode, hexadecimal, continuation, and other complex forms are not interpreted.</en></lang>
  const body = expression.slice(1, -1);

  if (/\\(?!['\\nrt])/u.test(body)) return null;

  // <lang><zh-CN>按固定顺序还原已允许转义，最后处理反斜杠以免二次转义。</zh-CN><en>Restores allowed escapes in a fixed order and handles backslashes last to avoid double unescaping.</en></lang>
  return body
    .replaceAll("\\'", "'")
    .replaceAll('\\n', '\n')
    .replaceAll('\\r', '\r')
    .replaceAll('\\t', '\t')
    .replaceAll('\\\\', '\\');
}

/**
 * @lang zh-CN 将 prop 默认表达式归一为允许的六类事实。函数与运行时表达式不进入 JSON，只保留类别或摘要。
 * @lang en Normalizes a prop default expression into the six allowed fact classes. Functions and runtime expressions never enter JSON; only their class or digest is retained.
 * @param {string|undefined} expression <lang><zh-CN>`default` 字段源码；缺失表示 absent。</zh-CN><en>`default` field source; omission means absent.</en></lang>
 * @param {string} unresolvedIssueId <lang><zh-CN>空或损坏表达式对应的公开问题 ID。</zh-CN><en>Public issue ID for an empty or malformed expression.</en></lang>
 * @returns {Record<string, any>} <lang><zh-CN>受控默认事实；按 kind 选择 value、digest 或 issueId。</zh-CN><en>Controlled default fact; selects value, digest, or issueId according to kind.</en></lang>
 */
function normalizeDefault(expression, unresolvedIssueId) {
  if (expression === undefined) {
    // <lang><zh-CN>缺失 default 是已审计事实，不等同解析失败。</zh-CN><en>An omitted default is an audited fact, not a parse failure.</en></lang>
    return { kind: 'absent' };
  }

  // <lang><zh-CN>去除注释和外层空白后再分类，避免注释文字影响摘要或模式。</zh-CN><en>Removes comments and surrounding whitespace before classification so comment text cannot affect patterns or digests.</en></lang>
  const candidate = removeComments(expression).trim();

  if (!candidate) {
    // <lang><zh-CN>存在字段却没有表达式是显式未知，必须引用公开问题。</zh-CN><en>A present field with no expression is explicitly unknown and must reference a public issue.</en></lang>
    return { kind: 'unresolved', issueId: unresolvedIssueId };
  }

  // <lang><zh-CN>布尔与 null 可直接表示为 JSON literal。</zh-CN><en>Booleans and null can be represented directly as JSON literals.</en></lang>
  if (candidate === 'true') return { kind: 'literal', value: true };
  if (candidate === 'false') return { kind: 'literal', value: false };
  if (candidate === 'null') return { kind: 'literal', value: null };

  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(candidate)) {
    // <lang><zh-CN>仅十进制有限数值进入 literal；Infinity、NaN、指数与常量表达式保留摘要。</zh-CN><en>Only finite decimal numbers become literals; Infinity, NaN, exponents, and constant expressions remain digests.</en></lang>
    return { kind: 'literal', value: Number(candidate) };
  }

  // <lang><zh-CN>静态引号字符串由受控解码器处理。</zh-CN><en>Static quoted strings are handled by the controlled decoder.</en></lang>
  const stringValue = parseStaticString(candidate);

  if (stringValue !== null) {
    if (stringValue.startsWith('data:') || Buffer.byteLength(stringValue, 'utf8') > 256) {
      // <lang><zh-CN>嵌入资产或超长文案即使语法上是字面量，也只保留表达式摘要，避免复制第三方资产/大段内容。</zh-CN><en>Embedded assets and long text retain only an expression digest even when syntactically literal, preventing third-party assets or large content from being copied.</en></lang>
      return { kind: 'expression', digest: digest(candidate) };
    }

    return { kind: 'literal', value: stringValue };
  }

  if (/^(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*\[/.test(candidate) || /^function\b[\s\S]*\breturn\s*\[/.test(candidate)) {
    // <lang><zh-CN>工厂返回数组时只记录容器类别，不复制数组元素或函数实现。</zh-CN><en>When a factory returns an array, only the container class is recorded; elements and function implementation are not copied.</en></lang>
    return { kind: 'factory-array' };
  }

  if (
    /^(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*\(?\s*\{/.test(candidate) ||
    /^function\b[\s\S]*\breturn\s*\{/.test(candidate)
  ) {
    // <lang><zh-CN>工厂返回对象时只记录容器类别，不复制对象键值或函数实现。</zh-CN><en>When a factory returns an object, only the container class is recorded; object members and function implementation are not copied.</en></lang>
    return { kind: 'factory-object' };
  }

  // <lang><zh-CN>其他合法表达式以去注释文本摘要表示，既可离线比较又不复制表达性源码。</zh-CN><en>Every other valid expression is represented by a digest of comment-free text, enabling offline comparison without copying expressive source.</en></lang>
  return { kind: 'expression', digest: digest(candidate) };
}

/**
 * @lang zh-CN 将 Vue runtime prop `required` 归一为必填布尔事实；缺失为 false，非静态布尔则保守回退 false 并显式未决。
 * @lang en Normalizes Vue runtime prop `required` into a mandatory boolean fact; omission is false, while a non-static boolean conservatively falls back to false and is explicitly unresolved.
 * @param {string|undefined} expression <lang><zh-CN>`required` 字段表达式。</zh-CN><en>`required` field expression.</en></lang>
 * @param {string} issueId <lang><zh-CN>非静态值对应的公开 issue ID。</zh-CN><en>Public issue ID for a non-static value.</en></lang>
 * @returns {{value:boolean,issueIds:string[]}} <lang><zh-CN>布尔事实与直接未决引用。</zh-CN><en>Boolean fact and direct unresolved references.</en></lang>
 */
function normalizeRequired(expression, issueId) {
  if (expression === undefined) return { value: false, issueIds: [] };

  // <lang><zh-CN>只接受去注释后精确 `true`/`false`，不执行常量或布尔转换。</zh-CN><en>Only exact comment-free `true` or `false` is accepted; constants and Boolean coercion are never executed.</en></lang>
  const candidate = removeComments(expression).trim();

  if (candidate === 'true') return { value: true, issueIds: [] };
  if (candidate === 'false') return { value: false, issueIds: [] };
  return { value: false, issueIds: [issueId] };
}

/**
 * @lang zh-CN 将 prop validator 记录为 absent 或去注释表达式摘要；从不保存或执行 validator 正文。
 * @lang en Records a prop validator as absent or as a digest of its comment-free expression; validator source is never stored or executed.
 * @param {string|undefined} expression <lang><zh-CN>`validator` 字段表达式。</zh-CN><en>`validator` field expression.</en></lang>
 * @param {string} issueId <lang><zh-CN>存在但无法分离的表达式问题 ID。</zh-CN><en>Issue ID for a present expression that cannot be separated.</en></lang>
 * @returns {{value:Record<string,string>,issueIds:string[]}} <lang><zh-CN>受控 validator 事实与直接问题引用。</zh-CN><en>Controlled validator fact and direct issue references.</en></lang>
 */
function normalizeValidator(expression, issueId) {
  if (expression === undefined) return { value: { kind: 'absent' }, issueIds: [] };

  // <lang><zh-CN>摘要输入先去注释并去除外层空白，换行由 digest 边界统一。</zh-CN><en>The digest input is comment-free and trimmed, with newline normalization delegated to the digest boundary.</en></lang>
  const candidate = removeComments(expression).trim();

  if (!candidate) return { value: { kind: 'expression', digest: digest('') }, issueIds: [issueId] };
  return { value: { kind: 'expression', digest: digest(candidate) }, issueIds: [] };
}

/**
 * @lang zh-CN 从一个 prop 定义对象提取类型集合/顺序、default、required 与 validator 受控事实。
 * @lang en Extracts controlled type-set/order, default, required, and validator facts from one prop-definition object.
 * @param {string} definitionSource <lang><zh-CN>包含外层花括号的 prop 定义。</zh-CN><en>Prop definition including outer braces.</en></lang>
 * @param {{default:string,required:string,validator:string}} issueIds <lang><zh-CN>字段级稳定问题 ID。</zh-CN><en>Stable field-level issue IDs.</en></lang>
 * @returns {{typeKinds:string[],typeOrder:string[],default:Record<string,any>,required:boolean,validator:Record<string,string>,unresolved:string[],issueCodes:string[]}} <lang><zh-CN>prop 结构事实与未决代码。</zh-CN><en>Prop shape facts and unresolved codes.</en></lang>
 */
function parsePropDefinition(definitionSource, issueIds) {
  // <lang><zh-CN>将定义对象拆成顶层字段；validator 只进入摘要，从不执行。</zh-CN><en>Splits the definition into top-level fields; validators enter digests only and are never executed.</en></lang>
  const parsed = parseObjectLiteral(definitionSource);
  // <lang><zh-CN>以字段名映射便于只读取公开 runtime prop 选项；重复键不会被静默选择。</zh-CN><en>A field map reads only public runtime prop options; duplicate keys are never silently resolved.</en></lang>
  const fields = new Map();

  for (const entry of parsed.entries) {
    if (fields.has(entry.name)) parsed.unresolved.push(digest(entry.name));
    else fields.set(entry.name, entry.value);
  }

  // <lang><zh-CN>缺失 type 在集合与顺序视图都显式标记 unknown，不自行推断。</zh-CN><en>An omitted type is explicitly `unknown` in both set and order views and is never inferred.</en></lang>
  const typeKinds = fields.has('type') ? parseTypeKinds(fields.get('type')) : ['unknown'];
  const typeOrder = fields.has('type') ? parseTypeOrder(fields.get('type')) : ['unknown'];
  // <lang><zh-CN>默认值按受控类别归一化，绝不求值 factory 或表达式。</zh-CN><en>The default is normalized into controlled classes and no factory or expression is ever evaluated.</en></lang>
  const defaultValue = normalizeDefault(fields.get('default'), issueIds.default);
  // <lang><zh-CN>required 与 validator 各自返回事实与直接问题，使 surface issueIds 不依赖组件级兜底。</zh-CN><en>Required and validator each return a fact plus direct issues so surface issueIds need no component-level fallback.</en></lang>
  const required = normalizeRequired(fields.get('required'), issueIds.required);
  const validator = normalizeValidator(fields.get('validator'), issueIds.validator);
  const issueCodes = [...required.issueIds, ...validator.issueIds];

  // <lang><zh-CN>返回所有必填结构事实，并保留对象级与字段级未知。</zh-CN><en>Returns every mandatory structural fact while retaining object-level and field-level unknowns.</en></lang>
  return {
    typeKinds,
    typeOrder,
    default: defaultValue,
    required: required.value,
    validator: validator.value,
    unresolved: parsed.unresolved,
    issueCodes
  };
}

/**
 * @lang zh-CN 判断 Vue runtime prop shorthand 是否仅由受控构造器或构造器数组组成；该判断不接受变量、调用或 spread。
 * @lang en Determines whether a Vue runtime prop shorthand contains only controlled constructors or a constructor array; variables, calls, and spreads are rejected.
 * @param {string} expression <lang><zh-CN>已去注释的 prop 值表达式。</zh-CN><en>Comment-free prop value expression.</en></lang>
 * @returns {boolean} <lang><zh-CN>是否可安全归一为“类型 + absent 默认”。</zh-CN><en>Whether it can safely normalize to “type plus absent default.”</en></lang>
 */
function isDirectPropTypeDeclaration(expression) {
  // <lang><zh-CN>单构造器模式从冻结类型白名单生成，避免维护第二份名称集合。</zh-CN><en>The single-constructor pattern derives from the frozen type allowlist to avoid maintaining a second name set.</en></lang>
  const constructorPattern = KNOWN_TYPE_KINDS.join('|');
  // <lang><zh-CN>仅接受 `String` 或 `[String, Number]` 等纯结构；空数组和其他 token 均拒绝。</zh-CN><en>Accepts only pure structures such as `String` or `[String, Number]`; empty arrays and every other token are rejected.</en></lang>
  const pattern = new RegExp(`^(?:${constructorPattern}|\\[\\s*(?:${constructorPattern})(?:\\s*,\\s*(?:${constructorPattern}))*\\s*\\])$`);

  return pattern.test(expression.trim());
}

/**
 * @lang zh-CN 从 `export const *Props = {}` 或 Vue `defineProps({})` 的对象中抽取完整 prop inventory。
 * @lang en Extracts a complete prop inventory from an `export const *Props = {}` object or Vue `defineProps({})` object.
 * @param {string} objectSource <lang><zh-CN>包含外层花括号的 props 对象。</zh-CN><en>Props object including outer braces.</en></lang>
 * @param {string} componentName <lang><zh-CN>用于稳定问题 ID 的组件名。</zh-CN><en>Component name used in stable issue IDs.</en></lang>
 * @param {string} side <lang><zh-CN>`upstream` 或 `hia` 证据侧。</zh-CN><en>`upstream` or `hia` evidence side.</en></lang>
 * @returns {{inventoryState:string,items:Array<Record<string,any>>,issueCodes:string[]}} <lang><zh-CN>名称排序的 prop 事实和解析状态。</zh-CN><en>Name-sorted prop facts and parse state.</en></lang>
 */
function parsePropsObject(objectSource, componentName, side) {
  // <lang><zh-CN>先拆出每个 prop 名称与定义；顶层未知会使整个 inventory 明确 unresolved。</zh-CN><en>First separates every prop name and definition; any top-level unknown makes the entire inventory explicitly unresolved.</en></lang>
  const parsed = parseObjectLiteral(objectSource);
  // <lang><zh-CN>问题代码仅保存机器稳定标识，具体双语说明由矩阵问题表统一生成。</zh-CN><en>Issue codes store machine-stable identifiers only; the matrix issue table supplies the bilingual explanation.</en></lang>
  const issueCodes = [];
  // <lang><zh-CN>已证明的 prop 即使同一 inventory 另有未知也继续保留，便于后续逐项审计。</zh-CN><en>Proven props remain available even when another member is unknown, enabling later item-by-item review.</en></lang>
  const items = [];

  if (parsed.unresolved.length > 0) issueCodes.push(`${side.toUpperCase()}_PROPS_TOP_LEVEL_UNRESOLVED`);

  // <lang><zh-CN>逐项要求 prop 值为静态对象字面量；构造函数 shorthand 等其他 Vue 语法保持 unresolved。</zh-CN><en>Requires each prop value to be a static object literal; constructor shorthand and other Vue forms remain unresolved.</en></lang>
  for (const entry of parsed.entries) {
    // <lang><zh-CN>去除注释后定位定义对象首字符，但保留原始字节用于平衡截取。</zh-CN><en>Locates the definition object's first character after comment removal while retaining original bytes for balanced slicing.</en></lang>
    const cleanedValue = removeComments(entry.value).trim();

    if (!cleanedValue.startsWith('{')) {
      if (isDirectPropTypeDeclaration(cleanedValue)) {
        // <lang><zh-CN>Vue constructor shorthand 明确缺失 default/required/validator，但仍保留构造器源顺序。</zh-CN><en>Vue constructor shorthand explicitly omits default, required, and validator while retaining constructor source order.</en></lang>
        items.push({
          name: entry.name,
          typeKinds: parseTypeKinds(cleanedValue),
          typeOrder: parseTypeOrder(cleanedValue),
          default: { kind: 'absent' },
          required: false,
          validator: { kind: 'absent' }
        });
      } else {
        issueCodes.push(`${side.toUpperCase()}_PROP_DEFINITION_UNRESOLVED`);
      }
      continue;
    }

    // <lang><zh-CN>定义必须由完整平衡对象构成，尾部 `as const` 等表达式会保守标为未知。</zh-CN><en>The definition must be one complete balanced object; trailing expressions such as `as const` are conservatively unresolved.</en></lang>
    const definitionEnd = findMatchingDelimiter(cleanedValue, 0, '{', '}');

    if (definitionEnd < 0) {
      issueCodes.push(`${side.toUpperCase()}_PROP_DEFINITION_UNRESOLVED`);
      continue;
    }

    // <lang><zh-CN>字段级问题按组件、证据侧、prop 与选项名形成稳定 ID。</zh-CN><en>Field-level issue IDs are stable across component, evidence side, prop, and option name.</en></lang>
    const issuePrefix = `PARSER_${componentName.toUpperCase().replaceAll('-', '_')}_${side.toUpperCase()}_PROP_${entry.name.toUpperCase().replaceAll('-', '_')}`;
    const fieldIssueIds = {
      default: `${issuePrefix}_DEFAULT`,
      required: `${issuePrefix}_REQUIRED`,
      validator: `${issuePrefix}_VALIDATOR`
    };
    // <lang><zh-CN>只传入平衡对象部分；定义尾部的类型断言不改变运行时 type/default 字段。</zh-CN><en>Passes only the balanced object portion; trailing type assertions do not change runtime type/default fields.</en></lang>
    const definition = parsePropDefinition(cleanedValue.slice(0, definitionEnd + 1), fieldIssueIds);

    if (definition.unresolved.length > 0) issueCodes.push(`${side.toUpperCase()}_PROP_FIELD_UNRESOLVED`);
    if (definition.default.kind === 'unresolved') issueCodes.push(fieldIssueIds.default);
    issueCodes.push(...definition.issueCodes);

    // <lang><zh-CN>六个必填事实共同构成 prop 结构比较输入。</zh-CN><en>Six mandatory facts together form the prop structural-comparison input.</en></lang>
    items.push({
      name: entry.name,
      typeKinds: definition.typeKinds,
      typeOrder: definition.typeOrder,
      default: definition.default,
      required: definition.required,
      validator: definition.validator
    });
  }

  // <lang><zh-CN>按 API 名称排序，并对问题代码去重；排序与源文件重排无关。</zh-CN><en>Sorts by API name and deduplicates issue codes, independent of source-file reordering.</en></lang>
  items.sort((left, right) => compareCodePointStrings(left.name, right.name));
  const uniqueIssueCodes = [...new Set(issueCodes)].sort(compareCodePointStrings);

  // <lang><zh-CN>任何未知都显式改变 inventoryState；空 items 只有在无问题时才表示“已审计无 prop”。</zh-CN><en>Any unknown explicitly changes inventoryState; an empty items list means “audited no props” only when no issue exists.</en></lang>
  return { inventoryState: uniqueIssueCodes.length === 0 ? 'complete' : 'unresolved', items, issueCodes: uniqueIssueCodes };
}

/**
 * @lang zh-CN 从上游 `types.ts` 的唯一 `*Props` 常量提取 prop inventory；缺失类型文件由调用方转交 SFC 宏抽取。
 * @lang en Extracts a prop inventory from the sole upstream `*Props` constant in `types.ts`; callers fall back to SFC macro extraction when the type file is absent.
 * @param {string} source <lang><zh-CN>完整 `types.ts` 文本。</zh-CN><en>Complete `types.ts` text.</en></lang>
 * @param {string} componentName <lang><zh-CN>组件 kebab 名称。</zh-CN><en>Component kebab name.</en></lang>
 * @returns {{inventoryState:string,items:Array<Record<string,any>>,issueCodes:string[]}} <lang><zh-CN>上游 prop inventory。</zh-CN><en>Upstream prop inventory.</en></lang>
 */
function extractUpstreamProps(source, componentName) {
  // <lang><zh-CN>只接受导出的 `*Props` 常量，避免把内部配置对象误当组件 API。</zh-CN><en>Accepts only an exported `*Props` constant so internal configuration objects are not mistaken for component APIs.</en></lang>
  const declaration = /export\s+const\s+[A-Za-z_$][\w$]*Props\s*=\s*/g.exec(removeComments(source));

  if (!declaration) {
    return { inventoryState: 'unresolved', items: [], issueCodes: ['UPSTREAM_PROPS_DECLARATION_UNRESOLVED'] };
  }

  // <lang><zh-CN>正则在等长无注释文本上的索引可安全用于原始 source。</zh-CN><en>The regex index in equal-length comment-free text can safely index the original source.</en></lang>
  const structure = extractBalancedStructure(source, declaration.index + declaration[0].length, '{', '}');

  if (!structure) {
    return { inventoryState: 'unresolved', items: [], issueCodes: ['UPSTREAM_PROPS_DECLARATION_UNRESOLVED'] };
  }

  // <lang><zh-CN>平衡对象交由通用 prop parser；不会读取导出类型别名或执行 import。</zh-CN><en>The balanced object goes to the common prop parser; exported type aliases and imports are neither read nor executed.</en></lang>
  return parsePropsObject(structure.source, componentName, 'upstream');
}

/**
 * @lang zh-CN 从 Vue SFC 的 `defineProps` 宏静态抽取 HIA 或无类型文件的上游 prop inventory。
 * @lang en Statically extracts a prop inventory from a Vue SFC `defineProps` macro for HIA or an upstream component without a type file.
 * @param {string} source <lang><zh-CN>完整 Vue SFC 文本。</zh-CN><en>Complete Vue SFC text.</en></lang>
 * @param {string} componentName <lang><zh-CN>组件 kebab 名称。</zh-CN><en>Component kebab name.</en></lang>
 * @param {string} side <lang><zh-CN>`upstream` 或 `hia`。</zh-CN><en>`upstream` or `hia`.</en></lang>
 * @returns {{inventoryState:string,items:Array<Record<string,any>>,issueCodes:string[]}} <lang><zh-CN>宏声明的 prop inventory。</zh-CN><en>Macro-declared prop inventory.</en></lang>
 */
function extractSfcProps(source, componentName, side) {
  // <lang><zh-CN>在去注释文本中定位真实宏调用，注释示例不会触发匹配。</zh-CN><en>Locates the real macro call in comment-free text so examples in comments cannot trigger a match.</en></lang>
  const cleaned = removeComments(source);
  const macroIndex = cleaned.indexOf('defineProps');

  if (macroIndex < 0) {
    // <lang><zh-CN>完全没有 defineProps 是已审计无 prop，而不是解析失败。</zh-CN><en>A complete absence of defineProps is an audited no-prop result, not a parse failure.</en></lang>
    return { inventoryState: 'complete', items: [], issueCodes: [] };
  }

  // <lang><zh-CN>generic 与括号之间可能有空白；找到宏后的第一个调用括号。</zh-CN><en>Whitespace or a generic may precede the call; finds the first call parenthesis after the macro.</en></lang>
  const call = extractBalancedStructure(source, macroIndex + 'defineProps'.length, '(', ')');

  if (!call) {
    return { inventoryState: 'unresolved', items: [], issueCodes: [`${side.toUpperCase()}_PROPS_MACRO_UNRESOLVED`] };
  }

  // <lang><zh-CN>空参数或 identifier 参数需要 TypeScript/模块解析，不能静态冒充为空 API。</zh-CN><en>An empty or identifier argument requires TypeScript/module resolution and cannot be presented as an empty API.</en></lang>
  const argument = removeComments(call.source.slice(1, -1)).trim();

  if (!argument.startsWith('{')) {
    return { inventoryState: 'unresolved', items: [], issueCodes: [`${side.toUpperCase()}_PROPS_MACRO_UNRESOLVED`] };
  }

  // <lang><zh-CN>调用首参数必须是完整对象字面量；多参数或尾随表达式将由对象 parser 之外的文本触发问题。</zh-CN><en>The first call argument must be a complete object literal; extra arguments or trailing expressions are treated as a problem outside the object parser.</en></lang>
  const objectEnd = findMatchingDelimiter(argument, 0, '{', '}');

  if (objectEnd < 0) {
    return { inventoryState: 'unresolved', items: [], issueCodes: [`${side.toUpperCase()}_PROPS_MACRO_UNRESOLVED`] };
  }

  // <lang><zh-CN>HIA 当前采用运行时对象声明；对上游无 types 文件组件也使用同一受控抽取。</zh-CN><en>HIA currently uses runtime object declarations; the same controlled extraction serves upstream components without type files.</en></lang>
  const inventory = parsePropsObject(argument.slice(0, objectEnd + 1), componentName, side);

  if (argument.slice(objectEnd + 1).trim()) {
    // <lang><zh-CN>对象后的额外参数或表达式会改变宏语义，必须显式 unresolved。</zh-CN><en>Extra arguments or expressions after the object can change macro semantics and must be explicit unresolved state.</en></lang>
    inventory.inventoryState = 'unresolved';
    inventory.issueCodes = [...new Set([...inventory.issueCodes, `${side.toUpperCase()}_PROPS_MACRO_UNRESOLVED`])].sort(compareCodePointStrings);
  }

  return inventory;
}

/**
 * @lang zh-CN 定位一个 Vue compiler macro 的 generic 与调用参数，不解析或运行宏。注释中的同名文本已由等长清理层屏蔽。
 * @lang en Locates a Vue compiler macro's generic and call arguments without parsing or running the macro. Equal-length comment cleaning masks same-named text inside comments.
 * @param {string} source <lang><zh-CN>完整 Vue SFC 文本。</zh-CN><en>Complete Vue SFC text.</en></lang>
 * @param {string} macroName <lang><zh-CN>精确宏标识符，例如 `defineEmits`。</zh-CN><en>Exact macro identifier, such as `defineEmits`.</en></lang>
 * @returns {{generic:string,argumentsSource:string}|null} <lang><zh-CN>不含外层分隔符的 generic/参数；宏缺失时为 `null`。</zh-CN><en>Generic and argument text without outer delimiters, or `null` when the macro is absent.</en></lang>
 */
function extractMacroCall(source, macroName) {
  // <lang><zh-CN>等长清理文本保证匹配索引可映射回原始源码。</zh-CN><en>Equal-length cleaned text guarantees match indices map back to the original source.</en></lang>
  const cleaned = removeComments(source);
  // <lang><zh-CN>单词边界防止将用户函数或更长标识符误识别为 compiler macro。</zh-CN><en>Word boundaries prevent user functions or longer identifiers from being mistaken for the compiler macro.</en></lang>
  const match = new RegExp(`\\b${macroName}\\b`).exec(cleaned);

  if (!match) return null;

  // <lang><zh-CN>游标从宏名后开始，先跳过空白再判断是否存在 TypeScript generic。</zh-CN><en>The cursor starts after the macro name, skips whitespace, and then checks for a TypeScript generic.</en></lang>
  let cursor = match.index + macroName.length;

  while (/\s/.test(cleaned[cursor] ?? '')) cursor += 1;

  // <lang><zh-CN>generic 默认为空；内联类型或命名类型均原样保留供只读事件名抽取。</zh-CN><en>The generic is empty by default; inline and named types are retained for read-only event-name extraction.</en></lang>
  let generic = '';

  if (cleaned[cursor] === '<') {
    // <lang><zh-CN>配对尖括号扫描忽略 `=>`，避免函数签名中的箭头提前关闭 generic。</zh-CN><en>Balanced angle scanning ignores `=>`, preventing arrows in function signatures from closing the generic early.</en></lang>
    const genericEnd = findMatchingDelimiter(source, cursor, '<', '>');

    if (genericEnd < 0) return { generic: '', argumentsSource: '', unresolved: true };

    generic = source.slice(cursor + 1, genericEnd);
    cursor = genericEnd + 1;

    while (/\s/.test(cleaned[cursor] ?? '')) cursor += 1;
  }

  if (cleaned[cursor] !== '(') return { generic, argumentsSource: '', unresolved: true };

  // <lang><zh-CN>调用参数使用普通括号平衡扫描，不把数组/对象内容当作结束。</zh-CN><en>Call arguments use balanced-parenthesis scanning and do not treat array/object content as the end.</en></lang>
  const callEnd = findMatchingDelimiter(source, cursor, '(', ')');

  if (callEnd < 0) return { generic, argumentsSource: '', unresolved: true };

  // <lang><zh-CN>返回不含外层分隔符的受控文本，后续 parser 只读取名称事实。</zh-CN><en>Returns controlled text without outer delimiters; later parsers read name facts only.</en></lang>
  return { generic, argumentsSource: source.slice(cursor + 1, callEnd), unresolved: false };
}

/**
 * @lang zh-CN 为 compiler 生成的 model modifiers prop 或无 runtime options 的 model prop 创建完整未指定类型事实。
 * @lang en Creates a complete unspecified-type fact for a compiler-generated model modifiers prop or a model prop without runtime options.
 * @param {string} name <lang><zh-CN>生成的 runtime prop 名。</zh-CN><en>Generated runtime prop name.</en></lang>
 * @returns {Record<string,any>} <lang><zh-CN>必填 prop 事实。</zh-CN><en>Mandatory prop facts.</en></lang>
 */
function createUnspecifiedPropFact(name) {
  return {
    name,
    typeKinds: ['unknown'],
    typeOrder: ['unknown'],
    default: { kind: 'absent' },
    required: false,
    validator: { kind: 'absent' }
  };
}

/**
 * @lang zh-CN 静态提取 Vue `defineModel` 产生的 model prop、modifiers prop 与 update event；不运行 compiler macro。
 * @lang en Statically extracts the model prop, modifiers prop, and update event produced by Vue `defineModel` without executing the compiler macro.
 * @param {string} source <lang><zh-CN>完整 Vue SFC 文本。</zh-CN><en>Complete Vue SFC text.</en></lang>
 * @param {string} componentName <lang><zh-CN>组件名，用于字段级 issue ID。</zh-CN><en>Component name used in field-level issue IDs.</en></lang>
 * @param {string} side <lang><zh-CN>`upstream` 或 `hia`。</zh-CN><en>`upstream` or `hia`.</en></lang>
 * @returns {{props:Record<string,any>,events:Record<string,any>}} <lang><zh-CN>可合并的 prop/event inventories。</zh-CN><en>Mergeable prop and event inventories.</en></lang>
 */
function extractDefineModelFacts(source, componentName, side) {
  const macro = extractMacroCall(source, 'defineModel');

  if (!macro) {
    return {
      props: { inventoryState: 'complete', items: [], issueCodes: [] },
      events: { inventoryState: 'complete', items: [], issueCodes: [] }
    };
  }

  // <lang><zh-CN>无法平衡宏调用时，prop 名与 event 名都不可冒充已知。</zh-CN><en>When the macro call cannot be balanced, neither prop nor event names may masquerade as known.</en></lang>
  const callIssueCode = `${side.toUpperCase()}_DEFINE_MODEL_CALL_UNRESOLVED`;

  if (macro.unresolved) {
    return {
      props: { inventoryState: 'unresolved', items: [], issueCodes: [callIssueCode] },
      events: { inventoryState: 'unresolved', items: [], issueCodes: [callIssueCode] }
    };
  }

  // <lang><zh-CN>参数只按顶层逗号分割，嵌套 validator/default 表达式不会被拆开。</zh-CN><en>Arguments split only on top-level commas, leaving nested validator/default expressions intact.</en></lang>
  const argumentText = removeComments(macro.argumentsSource).trim();
  const argumentsList = argumentText ? splitTopLevel(macro.argumentsSource, ',').map((value) => removeComments(value).trim()) : [];
  let modelName = 'modelValue';
  let optionsSource = '';
  let callUnresolved = false;

  if (argumentsList.length === 1) {
    if (argumentsList[0].startsWith('{')) optionsSource = argumentsList[0];
    else {
      const explicitName = parseStaticString(argumentsList[0]);

      if (explicitName === null || explicitName.length === 0 || explicitName.includes('\0')) callUnresolved = true;
      else modelName = explicitName;
    }
  } else if (argumentsList.length === 2) {
    const explicitName = parseStaticString(argumentsList[0]);

    if (explicitName === null || explicitName.length === 0 || explicitName.includes('\0') || !argumentsList[1].startsWith('{')) {
      callUnresolved = true;
    } else {
      modelName = explicitName;
      optionsSource = argumentsList[1];
    }
  } else if (argumentsList.length > 2) {
    callUnresolved = true;
  }

  if (callUnresolved) {
    return {
      props: { inventoryState: 'unresolved', items: [], issueCodes: [callIssueCode] },
      events: { inventoryState: 'unresolved', items: [], issueCodes: [callIssueCode] }
    };
  }

  // <lang><zh-CN>宏同时生成 `<name>Modifiers` runtime prop；它没有用户声明的 runtime type/default。</zh-CN><en>The macro also generates a `<name>Modifiers` runtime prop with no user-declared runtime type or default.</en></lang>
  const modifierName = `${modelName === 'modelValue' ? 'model' : modelName}Modifiers`;
  let modelFact = createUnspecifiedPropFact(modelName);
  const propIssueCodes = [];
  const eventIssueCodes = [];

  if (optionsSource) {
    const optionsEnd = findMatchingDelimiter(optionsSource, 0, '{', '}');

    if (optionsEnd < 0 || optionsSource.slice(optionsEnd + 1).trim()) {
      propIssueCodes.push(callIssueCode);
      eventIssueCodes.push(callIssueCode);
    } else {
      const issuePrefix = `PARSER_${componentName.toUpperCase().replaceAll('-', '_')}_${side.toUpperCase()}_PROP_${modelName.toUpperCase().replaceAll('-', '_')}`;
      const definition = parsePropDefinition(optionsSource.slice(0, optionsEnd + 1), {
        default: `${issuePrefix}_DEFAULT`,
        required: `${issuePrefix}_REQUIRED`,
        validator: `${issuePrefix}_VALIDATOR`
      });
      modelFact = {
        name: modelName,
        typeKinds: definition.typeKinds,
        typeOrder: definition.typeOrder,
        default: definition.default,
        required: definition.required,
        validator: definition.validator
      };

      if (definition.unresolved.length > 0) propIssueCodes.push(`${side.toUpperCase()}_DEFINE_MODEL_OPTIONS_UNRESOLVED`);
      if (definition.default.kind === 'unresolved') propIssueCodes.push(definition.default.issueId);
      propIssueCodes.push(...definition.issueCodes);
    }
  } else if (macro.generic.trim()) {
    // <lang><zh-CN>只有 TypeScript generic 时 runtime prop type 无法由静态运行时选项证明，prop/event surface 均保守未决。</zh-CN><en>With only a TypeScript generic, runtime prop type cannot be proven from runtime options, so both prop and event surfaces remain conservatively unresolved.</en></lang>
    const genericIssueCode = `${side.toUpperCase()}_DEFINE_MODEL_GENERIC_TYPE_ONLY_UNRESOLVED`;
    propIssueCodes.push(genericIssueCode);
    eventIssueCodes.push(genericIssueCode);
  }

  const uniquePropIssues = [...new Set(propIssueCodes)].sort(compareCodePointStrings);
  const uniqueEventIssues = [...new Set(eventIssueCodes)].sort(compareCodePointStrings);

  return {
    props: {
      inventoryState: uniquePropIssues.length === 0 ? 'complete' : 'unresolved',
      items: [modelFact, createUnspecifiedPropFact(modifierName)].sort((left, right) => compareCodePointStrings(left.name, right.name)),
      issueCodes: uniquePropIssues
    },
    events: {
      inventoryState: uniqueEventIssues.length === 0 ? 'complete' : 'unresolved',
      items: [{ name: `update:${modelName}` }],
      issueCodes: uniqueEventIssues
    }
  };
}

/**
 * @lang zh-CN 合并同一 API surface 的多个静态来源，同名同事实去重，同名冲突显式未决。
 * @lang en Merges multiple static sources for one API surface, deduplicating identical same-name facts and marking conflicting same-name facts unresolved.
 * @param {Record<string,any>} primary <lang><zh-CN>主要 inventory。</zh-CN><en>Primary inventory.</en></lang>
 * @param {Record<string,any>} additional <lang><zh-CN>宏生成的附加 inventory。</zh-CN><en>Additional macro-generated inventory.</en></lang>
 * @param {string} conflictIssueCode <lang><zh-CN>同名事实冲突问题代码。</zh-CN><en>Issue code for conflicting same-name facts.</en></lang>
 * @returns {Record<string,any>} <lang><zh-CN>名称排序的合并 inventory。</zh-CN><en>Name-sorted merged inventory.</en></lang>
 */
function mergeApiInventories(primary, additional, conflictIssueCode) {
  const byName = new Map(primary.items.map((item) => [item.name, item]));
  const issueCodes = [...primary.issueCodes, ...additional.issueCodes];

  for (const item of additional.items) {
    const existing = byName.get(item.name);

    if (!existing) byName.set(item.name, item);
    else if (JSON.stringify(existing) !== JSON.stringify(item)) issueCodes.push(conflictIssueCode);
  }

  const uniqueIssueCodes = [...new Set(issueCodes)].sort(compareCodePointStrings);

  return {
    inventoryState: uniqueIssueCodes.length === 0 ? 'complete' : 'unresolved',
    items: [...byName.values()].sort((left, right) => compareCodePointStrings(left.name, right.name)),
    issueCodes: uniqueIssueCodes
  };
}

/**
 * @lang zh-CN 从 TypeScript generic 事件签名中提取静态事件名。支持 call-signature 与对象 tuple 两种声明，不复制 payload 类型。
 * @lang en Extracts static event names from TypeScript generic event signatures. Supports call signatures and object-tuple declarations without copying payload types.
 * @param {string} genericSource <lang><zh-CN>generic 或已解析命名类型的正文。</zh-CN><en>Generic body or resolved named-type body.</en></lang>
 * @returns {string[]} <lang><zh-CN>排序去重后的事件名。</zh-CN><en>Sorted unique event names.</en></lang>
 */
function extractEventNamesFromGeneric(genericSource) {
  // <lang><zh-CN>注释移除后仅保留可验证签名 token 和字符串。</zh-CN><en>Comment removal retains only verifiable signature tokens and strings.</en></lang>
  const cleaned = removeComments(genericSource);
  // <lang><zh-CN>集合去除 overloaded call signatures 中的重复事件名。</zh-CN><en>A set removes duplicate event names from overloaded call signatures.</en></lang>
  const names = new Set();
  // <lang><zh-CN>call-signature 中第一个 `e`/`event` 参数的类型可为一个或多个字符串联合。</zh-CN><en>The first `e`/`event` parameter type in a call signature may be a union of one or more string literals.</en></lang>
  const callSignaturePattern = /\(\s*(?:e|event)\s*:\s*([^,)]+)/g;
  // <lang><zh-CN>复用匹配对象逐签名抽取联合中的所有静态字符串。</zh-CN><en>A reusable match object extracts every static string from each signature union.</en></lang>
  let signatureMatch = callSignaturePattern.exec(cleaned);

  while (signatureMatch) {
    // <lang><zh-CN>事件类型片段中的引号字符串均为候选事件名；payload 位于逗号后不会进入该片段。</zh-CN><en>Quoted strings in the event-type fragment are candidate event names; payload types after the comma are excluded.</en></lang>
    const stringPattern = /(['"])([^'"\r\n]+)\1/g;
    let stringMatch = stringPattern.exec(signatureMatch[1]);

    while (stringMatch) {
      names.add(stringMatch[2]);
      stringMatch = stringPattern.exec(signatureMatch[1]);
    }

    signatureMatch = callSignaturePattern.exec(cleaned);
  }

  // <lang><zh-CN>Vue 3 对象 tuple 语法以 `eventName: [...]` 声明；只接受行/分号后的静态键。</zh-CN><en>Vue 3 object-tuple syntax declares `eventName: [...]`; only static keys following a line boundary or semicolon are accepted.</en></lang>
  const tuplePattern = /(?:^|[;\r\n])\s*(['"]?)([A-Za-z_$][\w$:-]*)\1\s*:\s*\[/g;
  let tupleMatch = tuplePattern.exec(cleaned);

  while (tupleMatch) {
    names.add(tupleMatch[2]);
    tupleMatch = tuplePattern.exec(cleaned);
  }

  // <lang><zh-CN>名称排序令输出不受 overload 排列影响。</zh-CN><en>Name sorting makes output independent of overload ordering.</en></lang>
  return [...names].sort(compareCodePointStrings);
}

/**
 * @lang zh-CN 在相邻 `types.ts` 中解析 `defineEmits<NamedType>` 引用的 interface/type 对象，只提取其平衡正文。
 * @lang en Resolves the interface/type object referenced by `defineEmits<NamedType>` in adjacent `types.ts`, extracting only its balanced body.
 * @param {string} typeSource <lang><zh-CN>相邻类型文件文本；缺失时为空字符串。</zh-CN><en>Adjacent type-file text, or an empty string when absent.</en></lang>
 * @param {string} typeName <lang><zh-CN>单一 TypeScript 类型标识符。</zh-CN><en>Single TypeScript type identifier.</en></lang>
 * @returns {string} <lang><zh-CN>含外层花括号的类型正文；无法解析时为空。</zh-CN><en>Type body including outer braces, or empty when unresolved.</en></lang>
 */
function resolveNamedTypeBody(typeSource, typeName) {
  // <lang><zh-CN>只允许单一标识符，拒绝 generic、qualified name 与表达式。</zh-CN><en>Allows only one identifier and rejects generics, qualified names, and expressions.</en></lang>
  if (!/^[A-Za-z_$][\w$]*$/.test(typeName.trim())) return '';

  // <lang><zh-CN>interface 与 type-object 两种导出形式共享同一定位表达式。</zh-CN><en>Interface and type-object exports share one locating expression.</en></lang>
  const cleaned = removeComments(typeSource);
  const declarationPattern = new RegExp(`(?:export\\s+)?(?:interface\\s+${typeName.trim()}|type\\s+${typeName.trim()}\\s*=)\\s*`);
  const declaration = declarationPattern.exec(cleaned);

  if (!declaration) return '';

  // <lang><zh-CN>声明后的首个花括号必须形成完整类型正文。</zh-CN><en>The first brace after the declaration must form a complete type body.</en></lang>
  const structure = extractBalancedStructure(typeSource, declaration.index + declaration[0].length, '{', '}');

  return structure?.source ?? '';
}

/**
 * @lang zh-CN 从 Vue SFC `defineEmits` 静态提取事件 inventory；数组与类型签名均不执行 payload validator。
 * @lang en Statically extracts the event inventory from a Vue SFC `defineEmits`; arrays and type signatures are read without executing payload validators.
 * @param {string} source <lang><zh-CN>完整 Vue SFC 文本。</zh-CN><en>Complete Vue SFC text.</en></lang>
 * @param {string} typeSource <lang><zh-CN>可选相邻类型文件文本。</zh-CN><en>Optional adjacent type-file text.</en></lang>
 * @param {string} side <lang><zh-CN>`upstream` 或 `hia`。</zh-CN><en>`upstream` or `hia`.</en></lang>
 * @returns {{inventoryState:string,items:Array<{name:string}>,issueCodes:string[]}} <lang><zh-CN>事件名称事实与解析状态。</zh-CN><en>Event-name facts and parse state.</en></lang>
 */
function extractEvents(source, typeSource, side) {
  // <lang><zh-CN>缺少宏表示已审计无显式 emit API；模板原生事件不自动算组件 emit。</zh-CN><en>An absent macro means no explicit emit API was audited; native template events are not automatically component emits.</en></lang>
  const macro = extractMacroCall(source, 'defineEmits');

  if (!macro) return { inventoryState: 'complete', items: [], issueCodes: [] };
  if (macro.unresolved) return { inventoryState: 'unresolved', items: [], issueCodes: [`${side.toUpperCase()}_EVENTS_MACRO_UNRESOLVED`] };

  // <lang><zh-CN>事件名集合合并 runtime 数组与 generic 声明，避免重复。</zh-CN><en>An event-name set merges runtime-array and generic declarations without duplicates.</en></lang>
  const names = new Set();
  // <lang><zh-CN>参数去注释后若为数组，仅抽取顶层字符串项。</zh-CN><en>If comment-free arguments form an array, only top-level string items are extracted.</en></lang>
  const argumentsSource = removeComments(macro.argumentsSource).trim();
  // <lang><zh-CN>问题代码在遇到动态数组、validator 对象或无法解析 generic 时显式产生。</zh-CN><en>An issue code is explicit when arrays are dynamic, validator objects are used, or a generic cannot be resolved.</en></lang>
  const issueCodes = [];

  if (argumentsSource.startsWith('[')) {
    const arrayEnd = findMatchingDelimiter(argumentsSource, 0, '[', ']');

    if (arrayEnd < 0 || argumentsSource.slice(arrayEnd + 1).trim()) {
      issueCodes.push(`${side.toUpperCase()}_EVENTS_ARRAY_UNRESOLVED`);
    } else {
      // <lang><zh-CN>每个顶层数组项必须是静态字符串；动态变量不能被忽略。</zh-CN><en>Every top-level array item must be a static string; dynamic variables cannot be ignored.</en></lang>
      const entries = splitTopLevel(argumentsSource.slice(1, arrayEnd), ',');

      for (const entry of entries) {
        const name = parseStaticString(removeComments(entry).trim());

        if (name === null) issueCodes.push(`${side.toUpperCase()}_EVENTS_ARRAY_UNRESOLVED`);
        else names.add(name);
      }
    }
  } else if (argumentsSource) {
    // <lang><zh-CN>对象 validator 或 identifier 参数需要执行/模块解析，当前保守 unresolved。</zh-CN><en>Object validators or identifier arguments require execution/module resolution and remain conservatively unresolved.</en></lang>
    issueCodes.push(`${side.toUpperCase()}_EVENTS_ARGUMENT_UNRESOLVED`);
  }

  if (macro.generic.trim()) {
    // <lang><zh-CN>内联对象 generic 直接读取；单一命名类型只从同目录 types.ts 解析。</zh-CN><en>An inline object generic is read directly; a single named type is resolved only from adjacent types.ts.</en></lang>
    const genericCandidate = removeComments(macro.generic).trim();
    const genericBody = genericCandidate.startsWith('{') ? genericCandidate : resolveNamedTypeBody(typeSource, genericCandidate);

    if (!genericBody) {
      issueCodes.push(`${side.toUpperCase()}_EVENTS_GENERIC_UNRESOLVED`);
    } else {
      for (const name of extractEventNamesFromGeneric(genericBody)) names.add(name);

      if (names.size === 0 && removeComments(genericBody).replace(/[{};\s]/g, '')) {
        // <lang><zh-CN>非空类型正文却没有可证明事件名时不得冒充空 inventory。</zh-CN><en>A non-empty type body with no provable event names cannot masquerade as an empty inventory.</en></lang>
        issueCodes.push(`${side.toUpperCase()}_EVENTS_GENERIC_UNRESOLVED`);
      }
    }
  }

  // <lang><zh-CN>参数与 generic 均为空时等价于显式空 emit 声明。</zh-CN><en>Empty arguments and an empty generic are equivalent to an explicitly empty emit declaration.</en></lang>
  const uniqueIssueCodes = [...new Set(issueCodes)].sort(compareCodePointStrings);
  const items = [...names].sort(compareCodePointStrings).map((name) => ({ name }));

  return { inventoryState: uniqueIssueCodes.length === 0 ? 'complete' : 'unresolved', items, issueCodes: uniqueIssueCodes };
}

/**
 * @lang zh-CN 以等长空白屏蔽 Vue/HTML 注释，使其中示例 tag 不影响根 template 深度；换行保持不变。
 * @lang en Masks Vue/HTML comments with equal-length whitespace so example tags inside them cannot affect root-template depth; line breaks remain unchanged.
 * @param {string} source <lang><zh-CN>完整 SFC 文本。</zh-CN><en>Complete SFC text.</en></lang>
 * @returns {string} <lang><zh-CN>与原文等长的注释屏蔽文本。</zh-CN><en>Comment-masked text with the same length as the source.</en></lang>
 */
function maskHtmlComments(source) {
  // <lang><zh-CN>每个非换行注释字符替换为空格，从而保留后续 tag 的绝对索引。</zh-CN><en>Every non-newline comment character becomes a space, preserving absolute indices of subsequent tags.</en></lang>
  return source.replace(/<!--[\s\S]*?-->/g, (comment) => comment.replace(/[^\r\n]/g, ' '));
}

/**
 * @lang zh-CN 提取 SFC 根 `<template>` 正文，同时正确跨越用于 slot/条件的嵌套 `<template>` 元素。
 * @lang en Extracts the SFC root `<template>` body while correctly crossing nested `<template>` elements used for slots or conditions.
 * @param {string} source <lang><zh-CN>完整 SFC 文本。</zh-CN><en>Complete SFC text.</en></lang>
 * @returns {string} <lang><zh-CN>根 template 正文；不存在或未闭合时为空字符串。</zh-CN><en>Root template body, or an empty string when absent or unclosed.</en></lang>
 */
function extractRootTemplateBody(source) {
  // <lang><zh-CN>注释屏蔽副本用于 tag 扫描，原文仍用于最终切片。</zh-CN><en>A comment-masked copy drives tag scanning while the original source supplies the final slice.</en></lang>
  const masked = maskHtmlComments(source);
  // <lang><zh-CN>只匹配 template 开始/结束 tag；其他 HTML/Vue 元素不影响 template 层级。</zh-CN><en>Matches only template opening/closing tags; other HTML/Vue elements do not affect template depth.</en></lang>
  const tagPattern = /<\/?template\b[^>]*>/gi;
  // <lang><zh-CN>depth 为零表示尚未进入或已经离开 SFC 根 template。</zh-CN><en>A zero depth means the scan has not entered or has already left the SFC root template.</en></lang>
  let depth = 0;
  // <lang><zh-CN>正文起点紧随根开始 tag；在找到根 tag 前保持 `-1`。</zh-CN><en>The body starts immediately after the root opening tag and remains `-1` until that tag is found.</en></lang>
  let bodyStart = -1;
  let tagMatch = tagPattern.exec(masked);

  while (tagMatch) {
    // <lang><zh-CN>结束 tag 先降低层级；首次回到零时切出完整根正文。</zh-CN><en>A closing tag decreases depth first; the first return to zero slices the complete root body.</en></lang>
    const isClosing = /^<\//.test(tagMatch[0]);
    const isSelfClosing = /\/\s*>$/.test(tagMatch[0]);

    if (isClosing) {
      if (depth > 0) depth -= 1;

      if (depth === 0 && bodyStart >= 0) return source.slice(bodyStart, tagMatch.index);
    } else if (!isSelfClosing) {
      depth += 1;

      if (depth === 1) bodyStart = tagMatch.index + tagMatch[0].length;
    }

    tagMatch = tagPattern.exec(masked);
  }

  // <lang><zh-CN>没有完整根 template 时不能截取部分正文。</zh-CN><en>No partial body is returned when a complete root template is unavailable.</en></lang>
  return '';
}

/**
 * @lang zh-CN 从 SFC template 中提取静态 `<slot>` 名称。动态 slot name 保留 unresolved，不能用空数组掩盖。
 * @lang en Extracts static `<slot>` names from an SFC template. Dynamic slot names remain unresolved and cannot be hidden by an empty array.
 * @param {string} source <lang><zh-CN>完整 Vue SFC 文本。</zh-CN><en>Complete Vue SFC text.</en></lang>
 * @param {string} side <lang><zh-CN>`upstream` 或 `hia`。</zh-CN><en>`upstream` or `hia`.</en></lang>
 * @returns {{inventoryState:string,items:Array<{name:string}>,issueCodes:string[]}} <lang><zh-CN>slot 名称事实与解析状态。</zh-CN><en>Slot-name facts and parse state.</en></lang>
 */
function extractSlots(source, side) {
  // <lang><zh-CN>只扫描完整 SFC 根 template；script/style 中字符串形式的 `<slot>` 不属于模板 API。</zh-CN><en>Scans only the complete SFC root template; string forms of `<slot>` in script/style are not template APIs.</en></lang>
  const template = extractRootTemplateBody(source);

  if (!template) return { inventoryState: 'unresolved', items: [], issueCodes: [`${side.toUpperCase()}_TEMPLATE_UNRESOLVED`] };
  const names = new Set();
  const issueCodes = [];
  const slotPattern = /<slot\b([^>]*)>/gi;
  let slotMatch = slotPattern.exec(template);

  while (slotMatch) {
    // <lang><zh-CN>绑定 name 或动态表达式不能在不执行模板的情况下确定。</zh-CN><en>A bound name or dynamic expression cannot be determined without executing the template.</en></lang>
    if (/(?:^|\s)(?::name|v-bind:name)\s*=/.test(slotMatch[1])) {
      issueCodes.push(`${side.toUpperCase()}_DYNAMIC_SLOT_UNRESOLVED`);
    } else {
      // <lang><zh-CN>静态 name 缺失时按 Vue 语义记录 `default`。</zh-CN><en>When a static name is absent, records `default` according to Vue semantics.</en></lang>
      const nameMatch = /(?:^|\s)name\s*=\s*(['"])([^'"\r\n]+)\1/.exec(slotMatch[1]);
      names.add(nameMatch ? nameMatch[2] : 'default');
    }

    slotMatch = slotPattern.exec(template);
  }

  // <lang><zh-CN>对动态访问 `$slots[...]` 做额外警戒；静态 `$slots.name` 只用于条件判断，不新增声明。</zh-CN><en>Adds a guard for dynamic `$slots[...]` access; static `$slots.name` used in conditions does not add a declaration.</en></lang>
  if (/\$slots\s*\[\s*(?!['"])/.test(template)) issueCodes.push(`${side.toUpperCase()}_DYNAMIC_SLOT_UNRESOLVED`);

  const uniqueIssueCodes = [...new Set(issueCodes)].sort(compareCodePointStrings);
  const items = [...names].sort(compareCodePointStrings).map((name) => ({ name }));

  return { inventoryState: uniqueIssueCodes.length === 0 ? 'complete' : 'unresolved', items, issueCodes: uniqueIssueCodes };
}

/**
 * @lang zh-CN 从 `defineExpose({})` 对象提取静态公开成员名称，支持 shorthand 与显式静态键，不复制方法实现。
 * @lang en Extracts static public member names from a `defineExpose({})` object, supporting shorthand and explicit static keys without copying method implementations.
 * @param {string} source <lang><zh-CN>完整 Vue SFC 文本。</zh-CN><en>Complete Vue SFC text.</en></lang>
 * @param {string} side <lang><zh-CN>`upstream` 或 `hia`。</zh-CN><en>`upstream` or `hia`.</en></lang>
 * @param {boolean} hasService <lang><zh-CN>组件目录是否另含公开能力 service 文件。</zh-CN><en>Whether the component directory also contains a public-capability service file.</en></lang>
 * @returns {{inventoryState:string,items:Array<{name:string}>,issueCodes:string[]}} <lang><zh-CN>imperative API 名称事实与解析状态。</zh-CN><en>Imperative API name facts and parse state.</en></lang>
 */
function extractImperativeApis(source, side, hasService) {
  const macro = extractMacroCall(source, 'defineExpose');
  const names = new Set();
  const issueCodes = [];

  if (macro) {
    if (macro.unresolved) {
      issueCodes.push(`${side.toUpperCase()}_EXPOSE_MACRO_UNRESOLVED`);
    } else {
      // <lang><zh-CN>defineExpose 必须接收单一对象字面量；identifier 或工厂调用保持未知。</zh-CN><en>defineExpose must receive one object literal; identifiers or factory calls remain unknown.</en></lang>
      const argument = removeComments(macro.argumentsSource).trim();

      if (!argument.startsWith('{')) {
        issueCodes.push(`${side.toUpperCase()}_EXPOSE_ARGUMENT_UNRESOLVED`);
      } else {
        const objectEnd = findMatchingDelimiter(argument, 0, '{', '}');

        if (objectEnd < 0 || argument.slice(objectEnd + 1).trim()) {
          issueCodes.push(`${side.toUpperCase()}_EXPOSE_ARGUMENT_UNRESOLVED`);
        } else {
          // <lang><zh-CN>逐顶层成员接受 shorthand、静态 `key: value` 与方法 shorthand；spread/computed 保持未知。</zh-CN><en>Accepts shorthand, static `key: value`, and method shorthand per top-level member; spreads and computed keys remain unknown.</en></lang>
          const entries = splitTopLevel(argument.slice(1, objectEnd), ',');

          for (const entry of entries) {
            const cleanedEntry = removeComments(entry).trim();
            const colonIndex = findTopLevelColon(cleanedEntry);
            let name = '';

            if (colonIndex >= 0) name = normalizePropertyName(cleanedEntry.slice(0, colonIndex));
            else if (/^[A-Za-z_$][\w$]*$/.test(cleanedEntry)) name = cleanedEntry;
            else {
              const methodMatch = /^([A-Za-z_$][\w$]*)\s*\(/.exec(cleanedEntry);
              name = methodMatch?.[1] ?? '';
            }

            if (name) names.add(name);
            else issueCodes.push(`${side.toUpperCase()}_EXPOSE_MEMBER_UNRESOLVED`);
          }
        }
      }
    }
  }

  if (hasService) {
    // <lang><zh-CN>独立 service 表面可能包含实例方法和状态，SFC expose 静态结果不足以证明完整性。</zh-CN><en>A separate service surface may contain instance methods and state, so SFC expose facts cannot prove completeness.</en></lang>
    issueCodes.push('UPSTREAM_SERVICE_SURFACE_REQUIRES_REVIEW');
  }

  const uniqueIssueCodes = [...new Set(issueCodes)].sort(compareCodePointStrings);
  const items = [...names].sort(compareCodePointStrings).map((name) => ({ name }));

  return { inventoryState: uniqueIssueCodes.length === 0 ? 'complete' : 'unresolved', items, issueCodes: uniqueIssueCodes };
}

/**
 * @lang zh-CN 比较两个受控默认事实是否逐字段相等。字段顺序由归一化函数固定，因此稳定 stringify 足够且不会执行表达式。
 * @lang en Compares two controlled default facts field by field. Normalization fixes field order, so stable stringify is sufficient and executes no expression.
 * @param {Record<string,any>} left <lang><zh-CN>上游默认事实。</zh-CN><en>Upstream default fact.</en></lang>
 * @param {Record<string,any>} right <lang><zh-CN>HIA 默认事实。</zh-CN><en>HIA default fact.</en></lang>
 * @returns {boolean} <lang><zh-CN>结构事实是否完全相同。</zh-CN><en>Whether the structural facts are exactly equal.</en></lang>
 */
function defaultsEqual(left, right) {
  // <lang><zh-CN>受控对象没有循环、undefined 或不稳定键，JSON 字符串比较可重复。</zh-CN><en>Controlled objects contain no cycles, undefined values, or unstable keys, making JSON string comparison repeatable.</en></lang>
  return JSON.stringify(left) === JSON.stringify(right);
}

/**
 * @lang zh-CN 比较两组运行时类型类别，忽略源声明顺序但不忽略未知类别。
 * @lang en Compares two runtime type-kind sets while ignoring declaration order but retaining the `unknown` category.
 * @param {string[]} left <lang><zh-CN>上游类型类别。</zh-CN><en>Upstream type kinds.</en></lang>
 * @param {string[]} right <lang><zh-CN>HIA 类型类别。</zh-CN><en>HIA type kinds.</en></lang>
 * @returns {boolean} <lang><zh-CN>排序后是否逐项相同。</zh-CN><en>Whether sorted values match item by item.</en></lang>
 */
function typeKindsEqual(left, right) {
  // <lang><zh-CN>复制排序避免改变 parser inventory。</zh-CN><en>Copy sorting avoids mutating parser inventories.</en></lang>
  return [...left].sort(compareCodePointStrings).join('\u0000') === [...right].sort(compareCodePointStrings).join('\u0000');
}

/**
 * @lang zh-CN 为一个上游 API 生成保守迁移分类。名称/结构相同默认仍为 mapped，只有显式人工安全规则可 compatible。
 * @lang en Produces a conservative migration classification for one upstream API. Matching names and shapes remain mapped by default; only an explicit human-reviewed safety rule may be compatible.
 * @param {string} componentName <lang><zh-CN>组件名。</zh-CN><en>Component name.</en></lang>
 * @param {string} surface <lang><zh-CN>`props`、`events`、`slots` 或 `imperativeApis`。</zh-CN><en>`props`, `events`, `slots`, or `imperativeApis`.</en></lang>
 * @param {Record<string,any>} upstreamItem <lang><zh-CN>上游 API 事实。</zh-CN><en>Upstream API fact.</en></lang>
 * @param {Record<string,any>|undefined} hiaItem <lang><zh-CN>同名 HIA API 事实；缺失表示未交付。</zh-CN><en>Same-named HIA API fact; absence means not delivered.</en></lang>
 * @returns {Record<string, string>} <lang><zh-CN>明确的迁移处置、原因和可选 target。</zh-CN><en>Explicit migration disposition, reason, and optional target.</en></lang>
 */
function classifyApiMigration(componentName, surface, upstreamItem, hiaItem) {
  if (!hiaItem) {
    // <lang><zh-CN>没有同名 HIA API 时不猜测 alias 或隐式适配器，直接标为当前 unsupported。</zh-CN><en>When no same-named HIA API exists, no alias or implicit adapter is guessed and the API is currently unsupported.</en></lang>
    return { disposition: 'unsupported', reasonCode: 'HIA_API_NOT_DELIVERED' };
  }

  // <lang><zh-CN>prop 需要同时比较运行时类型与默认事实；其他名称表面只具备结构同名证据。</zh-CN><en>Props require both runtime-type and default comparison; other name surfaces provide structural-name evidence only.</en></lang>
  const sameShape =
    surface !== 'props' ||
    (typeKindsEqual(upstreamItem.typeKinds, hiaItem.typeKinds) &&
      upstreamItem.typeOrder.join('\u0000') === hiaItem.typeOrder.join('\u0000') &&
      defaultsEqual(upstreamItem.default, hiaItem.default) &&
      upstreamItem.required === hiaItem.required &&
      defaultsEqual(upstreamItem.validator, hiaItem.validator));
  // <lang><zh-CN>显式规则键由组件、表面和 API 名组成，不能因另一个组件同名而外溢。</zh-CN><en>The explicit-rule key contains component, surface, and API name so a same-named API on another component cannot inherit it.</en></lang>
  const ruleKey = `${componentName}|${surface}|${upstreamItem.name}`;

  if (sameShape && EXPLICIT_COMPATIBILITY_RULES.has(ruleKey)) {
    // <lang><zh-CN>只有已登记人工审计规则才允许无改动兼容结论。</zh-CN><en>Only a registered human-audited rule permits a no-change compatibility conclusion.</en></lang>
    return { disposition: 'compatible', reasonCode: 'EXPLICIT_SEMANTIC_RULE', target: hiaItem.name };
  }

  // <lang><zh-CN>同名结构证据提供明确迁移目标，但语义仍需人工复核；结构差异使用单独原因码。</zh-CN><en>Same-name structural evidence provides an explicit migration target while semantics still need review; shape differences use a separate reason code.</en></lang>
  return {
    disposition: 'mapped',
    reasonCode: sameShape ? 'STRUCTURAL_MATCH_REQUIRES_SEMANTIC_REVIEW' : 'SAME_NAME_DIFFERENT_SHAPE',
    target: hiaItem.name
  };
}

/**
 * @lang zh-CN 将 prop inventory 投影为上游主导的迁移条目；HIA-only prop 不会伪装为上游兼容事实。
 * @lang en Projects prop inventories into upstream-led migration entries; HIA-only props are not presented as upstream compatibility facts.
 * @param {string} componentName <lang><zh-CN>组件名。</zh-CN><en>Component name.</en></lang>
 * @param {string} priority <lang><zh-CN>组件级 P0/P1/P2 优先级。</zh-CN><en>Component-level P0/P1/P2 priority.</en></lang>
 * @param {Record<string,any>} upstreamInventory <lang><zh-CN>上游 prop inventory。</zh-CN><en>Upstream prop inventory.</en></lang>
 * @param {Record<string,any>} hiaInventory <lang><zh-CN>HIA prop inventory。</zh-CN><en>HIA prop inventory.</en></lang>
 * @returns {Array<Record<string,any>>} <lang><zh-CN>按 prop 名称排序的迁移条目。</zh-CN><en>Migration entries sorted by prop name.</en></lang>
 */
function buildPropItems(componentName, priority, upstreamInventory, hiaInventory) {
  // <lang><zh-CN>同名 HIA prop 映射用于产生显式 targets；不会进行模糊匹配。</zh-CN><en>A same-named HIA prop map produces explicit targets and performs no fuzzy matching.</en></lang>
  const hiaByName = new Map(hiaInventory.items.map((item) => [item.name, item]));

  // <lang><zh-CN>上游排序已固定，但这里再次按名称投影确保生成器契约独立于 parser 实现。</zh-CN><en>Upstream sorting is already fixed, but this projection sorts again so the generator contract is independent of parser implementation.</en></lang>
  return upstreamInventory.items
    .map((upstreamItem) => {
      const hiaItem = hiaByName.get(upstreamItem.name);
      // <lang><zh-CN>target 包含 HIA 自身结构事实，便于人工区分同名同形与同名异形。</zh-CN><en>The target includes HIA's own structural facts so reviewers can distinguish same-name/same-shape from same-name/different-shape cases.</en></lang>
      const targets = hiaItem
        ? [
            {
              name: hiaItem.name,
              typeKinds: hiaItem.typeKinds,
              typeOrder: hiaItem.typeOrder,
              default: hiaItem.default,
              required: hiaItem.required,
              validator: hiaItem.validator
            }
          ]
        : [];

      return {
        id: `prop:${upstreamItem.name}`,
        upstream: {
          name: upstreamItem.name,
          typeKinds: upstreamItem.typeKinds,
          typeOrder: upstreamItem.typeOrder,
          default: upstreamItem.default,
          required: upstreamItem.required,
          validator: upstreamItem.validator
        },
        hia: { targets },
        priority: resolveCapabilityPriority(componentName, priority, 'props', upstreamItem.name),
        migration: classifyApiMigration(componentName, 'props', upstreamItem, hiaItem)
      };
    })
    .sort((left, right) => compareCodePointStrings(left.id, right.id));
}

/**
 * @lang zh-CN 将只含名称的事件、slot 或 imperative inventory 投影为上游主导迁移条目。
 * @lang en Projects name-only event, slot, or imperative inventories into upstream-led migration entries.
 * @param {string} componentName <lang><zh-CN>组件名。</zh-CN><en>Component name.</en></lang>
 * @param {string} priority <lang><zh-CN>组件级优先级。</zh-CN><en>Component-level priority.</en></lang>
 * @param {string} surface <lang><zh-CN>表面名称。</zh-CN><en>Surface name.</en></lang>
 * @param {string} idPrefix <lang><zh-CN>条目 ID 前缀。</zh-CN><en>Entry ID prefix.</en></lang>
 * @param {Record<string,any>} upstreamInventory <lang><zh-CN>上游名称 inventory。</zh-CN><en>Upstream name inventory.</en></lang>
 * @param {Record<string,any>} hiaInventory <lang><zh-CN>HIA 名称 inventory。</zh-CN><en>HIA name inventory.</en></lang>
 * @returns {Array<Record<string,any>>} <lang><zh-CN>稳定迁移条目。</zh-CN><en>Stable migration entries.</en></lang>
 */
function buildNamedItems(componentName, priority, surface, idPrefix, upstreamInventory, hiaInventory) {
  // <lang><zh-CN>同名集合只提供精确 target，不推断大小写、kebab/camel 或历史 alias。</zh-CN><en>The same-name map provides exact targets only and infers no casing, kebab/camel, or historical aliases.</en></lang>
  const hiaByName = new Map(hiaInventory.items.map((item) => [item.name, item]));

  return upstreamInventory.items
    .map((upstreamItem) => {
      const hiaItem = hiaByName.get(upstreamItem.name);

      return {
        id: `${idPrefix}:${upstreamItem.name}`,
        upstream: { name: upstreamItem.name },
        hia: { targets: hiaItem ? [{ name: hiaItem.name }] : [] },
        priority: resolveCapabilityPriority(componentName, priority, surface, upstreamItem.name),
        migration: classifyApiMigration(componentName, surface, upstreamItem, hiaItem)
      };
    })
    .sort((left, right) => compareCodePointStrings(left.id, right.id));
}

/**
 * @lang zh-CN 将 parser 问题代码转换为组件作用域的稳定公开 issue ID，避免不同组件问题相互覆盖。
 * @lang en Converts a parser issue code into a stable public component-scoped issue ID so issues from different components cannot collide.
 * @param {string} componentName <lang><zh-CN>组件名。</zh-CN><en>Component name.</en></lang>
 * @param {string} issueCode <lang><zh-CN>parser 或 service 问题代码。</zh-CN><en>Parser or service issue code.</en></lang>
 * @returns {string} <lang><zh-CN>稳定 issue ID。</zh-CN><en>Stable issue ID.</en></lang>
 */
function normalizeIssueId(componentName, issueCode) {
  if (issueCode.startsWith('PARSER_')) return issueCode;

  // <lang><zh-CN>service 问题使用来源前缀，明确它不是 HIA parser 本身的错误。</zh-CN><en>Service issues use an upstream-source prefix, making clear they are not HIA parser failures.</en></lang>
  if (issueCode === 'UPSTREAM_SERVICE_SURFACE_REQUIRES_REVIEW') {
    return `UPSTREAM_${componentName.toUpperCase().replaceAll('-', '_')}_SERVICE_SURFACE_REQUIRES_REVIEW`;
  }

  // <lang><zh-CN>其余静态抽取未知统一进入组件作用域 parser ID。</zh-CN><en>Every other static-extraction unknown becomes a component-scoped parser ID.</en></lang>
  return `PARSER_${componentName.toUpperCase().replaceAll('-', '_')}_${issueCode}`;
}

/**
 * @lang zh-CN 将一个 API surface 两侧 parser 代码映射为排序、去重的直接公开 issueIds。
 * @lang en Maps parser codes from both sides of one API surface into sorted, unique, direct public issueIds.
 * @param {string} componentName <lang><zh-CN>组件名。</zh-CN><en>Component name.</en></lang>
 * @param {...Record<string,any>} inventories <lang><zh-CN>仅属于该 surface 的 inventories。</zh-CN><en>Inventories belonging only to that surface.</en></lang>
 * @returns {string[]} <lang><zh-CN>直接导致该 surface 未决的 issue IDs。</zh-CN><en>Issue IDs directly causing that surface to be unresolved.</en></lang>
 */
function resolveSurfaceIssueIds(componentName, ...inventories) {
  // <lang><zh-CN>不使用 component issueIds 兜底；只投影该 surface parser 的问题代码。</zh-CN><en>No component-level fallback is used; only this surface's parser codes are projected.</en></lang>
  const issueIds = inventories.flatMap((inventory) => inventory.issueCodes.map((code) => normalizeIssueId(componentName, code)));

  return [...new Set(issueIds)].sort(compareCodePointStrings);
}

/**
 * @lang zh-CN 为一个组件 issue ID 创建中英对等的公开问题记录；不包含本地路径、源码片段或私有过程信息。
 * @lang en Creates a bilingual public issue record for one component issue ID without local paths, source fragments, or private process information.
 * @param {string} issueId <lang><zh-CN>稳定 issue ID。</zh-CN><en>Stable issue ID.</en></lang>
 * @param {string} componentName <lang><zh-CN>受影响组件。</zh-CN><en>Affected component.</en></lang>
 * @returns {Record<string,any>} <lang><zh-CN>公开 issue 对象。</zh-CN><en>Public issue object.</en></lang>
 */
function createComponentIssue(issueId, componentName) {
  if (issueId.includes('SERVICE_SURFACE_REQUIRES_REVIEW')) {
    return {
      id: issueId,
      severity: 'review-required',
      scope: 'imperativeApis',
      component: componentName,
      message: {
        'zh-CN': '上游组件另含 service 文件；仅扫描 SFC defineExpose 无法证明完整 imperative API，需逐项人工审计。',
        en: 'The upstream component also contains a service file; scanning SFC defineExpose alone cannot prove the complete imperative API and requires item-by-item human review.'
      }
    };
  }

  return {
    id: issueId,
    severity: 'review-required',
    scope: 'static-parser',
    component: componentName,
    message: {
      'zh-CN': '受控静态抽取无法完整证明该声明；矩阵保留已证明条目并将 inventory 标为 unresolved。',
      en: 'Controlled static extraction could not fully prove this declaration; the matrix retains proven items and marks the inventory unresolved.'
    }
  };
}

/**
 * @lang zh-CN 仅汇总四类 API items 与其 inventory 状态；easycom、types、platforms 与 aliases 不进入该摘要。
 * @lang en Summarizes only the four API item surfaces and their inventory states; easycom, types, platforms, and aliases are outside this summary.
 * @param {Array<Record<string,any>>} inventories <lang><zh-CN>包含 `inventoryState/items` 的四类 API 容器。</zh-CN><en>Four API containers containing `inventoryState/items`.</en></lang>
 * @returns {Record<string,any>} <lang><zh-CN>组件迁移摘要。</zh-CN><en>Component migration summary.</en></lang>
 */
function summarizeMigration(inventories) {
  // <lang><zh-CN>计数对象采用固定键顺序，便于 Tool 稳定输出。</zh-CN><en>The count object uses a fixed key order for stable Tool output.</en></lang>
  const counts = { compatible: 0, mapped: 0, unsupported: 0, unresolved: 0 };

  for (const inventory of inventories) {
    if (inventory.inventoryState === 'unresolved') counts.unresolved += 1;

    for (const item of inventory.items) counts[item.migration.disposition] += 1;
  }

  // <lang><zh-CN>任何缺失 API 或 unresolved 表面都使 API-items 摘要保持 unsupported；否则结构候选仍只是 mapped。</zh-CN><en>Any missing API or unresolved surface keeps the API-items summary unsupported; otherwise structural candidates remain mapped.</en></lang>
  const hasUnsupported = counts.unsupported > 0 || counts.unresolved > 0;

  return {
    scope: 'api-items-only',
    disposition: hasUnsupported ? 'unsupported' : 'mapped',
    reasonCode: hasUnsupported ? 'API_SURFACE_HAS_UNSUPPORTED_MEMBERS' : 'API_SURFACE_REQUIRES_SEMANTIC_REVIEW',
    counts
  };
}

/**
 * @lang zh-CN 根据冻结白名单给组件分配 P0/P1/P2；分类只影响后续排序优先级，不改变兼容结论。
 * @lang en Assigns P0/P1/P2 from frozen allowlists; classification affects follow-up priority only and never changes compatibility conclusions.
 * @param {string} componentName <lang><zh-CN>组件名。</zh-CN><en>Component name.</en></lang>
 * @returns {'P0'|'P1'|'P2'} <lang><zh-CN>组件优先级。</zh-CN><en>Component priority.</en></lang>
 */
function resolvePriority(componentName) {
  if (P0_COMPONENTS.has(componentName)) return 'P0';
  if (P1_COMPONENTS.has(componentName)) return 'P1';
  return 'P2';
}

/**
 * @lang zh-CN 判断 capability 是否属于强制 P2 的平台开放能力、原始样式/class/颜色 escape 或消息/session 参数。
 * @lang en Determines whether a capability is a forced-P2 platform open capability, raw style/class/color escape, or message/session parameter.
 * @param {string} componentName <lang><zh-CN>精确组件名，用于限定只属于某组件的平台字段。</zh-CN><en>Exact component name used to scope platform fields owned by one component.</en></lang>
 * @param {string} surface <lang><zh-CN>API 表面名称。</zh-CN><en>API surface name.</en></lang>
 * @param {string} apiName <lang><zh-CN>上游 API 名。</zh-CN><en>Upstream API name.</en></lang>
 * @returns {boolean} <lang><zh-CN>是否必须为 P2。</zh-CN><en>Whether the capability must be P2.</en></lang>
 */
function isForcedP2Capability(componentName, surface, apiName) {
  if (surface === 'events') {
    // <lang><zh-CN>开放能力事件在任何组件中保持 P2；原生 error 只有在 u-button 上属于该开放能力失败面。</zh-CN><en>Open-capability events remain P2 on any component; native error belongs to that open-capability failure surface only on u-button.</en></lang>
    return FORCED_P2_EVENT_NAMES.has(apiName.toLowerCase())
      || (componentName === 'u-button' && apiName.toLowerCase() === 'error');
  }

  if (surface === 'props') {
    // <lang><zh-CN>显式平台字段优先匹配；族模式覆盖 customStyle/customClass、任意颜色字段及 send/show message/session 变体。</zh-CN><en>Explicit platform fields match first; family patterns cover customStyle/customClass, color fields, and send/show message/session variants.</en></lang>
    return (
      FORCED_P2_PROP_NAMES.has(apiName) ||
      (componentName === 'u-button' && apiName === 'lang') ||
      /(?:color|style|class)/i.test(apiName) ||
      /^(?:session|sendMessage|showMessage)/i.test(apiName)
    );
  }

  return false;
}

/**
 * @lang zh-CN 判断 API 是否是对应表面的核心 capability；imperative 只认可 show/open/close/reset/submit 及 request 前缀变体。
 * @lang en Determines whether an API is a core capability for its surface; imperative APIs recognize only show/open/close/reset/submit and request-prefixed variants.
 * @param {string} surface <lang><zh-CN>API 表面名称。</zh-CN><en>API surface name.</en></lang>
 * @param {string} apiName <lang><zh-CN>上游 API 名。</zh-CN><en>Upstream API name.</en></lang>
 * @returns {boolean} <lang><zh-CN>是否属于核心能力。</zh-CN><en>Whether the API is a core capability.</en></lang>
 */
function isCoreCapability(surface, apiName) {
  if (surface === 'props') return CORE_PROP_NAMES.has(apiName);
  if (surface === 'events') return CORE_EVENT_NAMES.has(apiName);
  if (surface === 'slots') return apiName === 'default';
  if (surface === 'imperativeApis') return /^(?:request)?(?:show|open|close|reset|submit)/i.test(apiName);
  return false;
}

/**
 * @lang zh-CN 基于组件级优先级、能力风险和核心性确定逐 capability 的 P0/P1/P2；不会把组件优先级机械复制到每个 API。
 * @lang en Resolves per-capability P0/P1/P2 from component priority, capability risk, and core status instead of mechanically copying component priority to every API.
 * @param {string} componentName <lang><zh-CN>精确组件名。</zh-CN><en>Exact component name.</en></lang>
 * @param {'P0'|'P1'|'P2'} componentPriority <lang><zh-CN>组件总体优先级。</zh-CN><en>Overall component priority.</en></lang>
 * @param {string} surface <lang><zh-CN>API 表面。</zh-CN><en>API surface.</en></lang>
 * @param {string} apiName <lang><zh-CN>上游 API 名。</zh-CN><en>Upstream API name.</en></lang>
 * @returns {'P0'|'P1'|'P2'} <lang><zh-CN>能力级优先级。</zh-CN><en>Capability-level priority.</en></lang>
 */
function resolveCapabilityPriority(componentName, componentPriority, surface, apiName) {
  if (componentPriority === 'P2' || isForcedP2Capability(componentName, surface, apiName)) return 'P2';

  // <lang><zh-CN>P0 组件仅核心 capability 保持 P0，其余普通能力降为 P1。</zh-CN><en>Only core capabilities remain P0 on P0 components; ordinary capabilities step down to P1.</en></lang>
  if (componentPriority === 'P0') return isCoreCapability(surface, apiName) ? 'P0' : 'P1';

  // <lang><zh-CN>P1 组件核心 capability 保持 P1，其余能力降为 P2。</zh-CN><en>Core capabilities remain P1 on P1 components; every other capability steps down to P2.</en></lang>
  return isCoreCapability(surface, apiName) ? 'P1' : 'P2';
}

/**
 * @lang zh-CN 读取可选 UTF-8 文件；仅 `ENOENT` 转为 `null`，权限或 I/O 错误保持失败。
 * @lang en Reads an optional UTF-8 file; only `ENOENT` becomes `null`, while permission and I/O errors remain failures.
 * @param {string} path <lang><zh-CN>显式文件路径。</zh-CN><en>Explicit file path.</en></lang>
 * @returns {Promise<string|null>} <lang><zh-CN>文件文本或缺失标记。</zh-CN><en>File text or the absence marker.</en></lang>
 */
async function readOptionalFile(path) {
  try {
    // <lang><zh-CN>成功时原样返回 UTF-8 文本，不执行其内容。</zh-CN><en>Returns UTF-8 text unchanged on success and never executes it.</en></lang>
    return await readFile(path, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

/**
 * @lang zh-CN 从 HIA runtime entry 建立组件目录到命名导出的精确映射，并验证每个 import symbol 确实进入 export block。
 * @lang en Builds an exact component-directory to named-export map from the HIA runtime entry and verifies every imported symbol appears in an export block.
 * @param {string} runtimeSource <lang><zh-CN>仓内 `src/index.mjs` 文本。</zh-CN><en>Repository-local `src/index.mjs` text.</en></lang>
 * @returns {Map<string,string>} <lang><zh-CN>组件 kebab 名到导出 symbol 的映射。</zh-CN><en>Map from component kebab name to exported symbol.</en></lang>
 */
function extractRuntimeExports(runtimeSource) {
  // <lang><zh-CN>去注释文本避免 JSDoc 示例影响 import/export 匹配，索引无需映射回原文。</zh-CN><en>Comment-free text prevents JSDoc examples from affecting import/export matching; no indices need mapping back to original text.</en></lang>
  const cleaned = removeComments(runtimeSource);
  // <lang><zh-CN>import 映射只接受既有相对组件路径，不接受包名、动态 import 或仓外路径。</zh-CN><en>The import map accepts only existing relative component paths, not package names, dynamic imports, or paths outside the repository.</en></lang>
  const importedByComponent = new Map();
  const importPattern = /import\s+([A-Za-z_$][\w$]*)\s+from\s+(['"])\.\/components\/([^/'"]+)\/[^'"]+\2\s*;/g;
  let importMatch = importPattern.exec(cleaned);

  while (importMatch) {
    if (importedByComponent.has(importMatch[3])) throw new Error(`Duplicate runtime import for component ${importMatch[3]}.`);
    importedByComponent.set(importMatch[3], importMatch[1]);
    importMatch = importPattern.exec(cleaned);
  }

  // <lang><zh-CN>收集所有具名 export block 的 symbol；default export 与常量声明不构成组件具名导出。</zh-CN><en>Collects symbols from every named export block; default exports and constant declarations are not component named exports.</en></lang>
  const exportedSymbols = new Set();
  const exportPattern = /export\s*\{([\s\S]*?)\}\s*;/g;
  let exportMatch = exportPattern.exec(cleaned);

  while (exportMatch) {
    for (const fragment of splitTopLevel(exportMatch[1], ',')) {
      // <lang><zh-CN>`Local as Public` 形式使用公开名；普通 symbol 使用自身名称。</zh-CN><en>`Local as Public` forms use the public name; plain symbols use their own name.</en></lang>
      const aliasMatch = /^([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?$/.exec(fragment.trim());

      if (aliasMatch) exportedSymbols.add(aliasMatch[2] ?? aliasMatch[1]);
    }

    exportMatch = exportPattern.exec(cleaned);
  }

  // <lang><zh-CN>最终映射要求 import symbol 与公开 export symbol 同名；当前 runtime 不使用重命名组件导出。</zh-CN><en>The final map requires the import symbol to be a same-named public export; the current runtime does not rename component exports.</en></lang>
  const result = new Map();

  for (const [componentName, symbol] of importedByComponent) {
    if (!exportedSymbols.has(symbol)) throw new Error(`Runtime component ${componentName} is imported but not named-exported.`);
    result.set(componentName, symbol);
  }

  return result;
}

/**
 * @lang zh-CN 验证上游完整 package 物化、package/许可证文本与精确 99 目录锁，并返回后续只读事实。
 * @lang en Validates the complete upstream package materialization, package/license text, and exact 99-directory lock, then returns subsequent read-only facts.
 * @param {string} upstreamRoot <lang><zh-CN>调用方明确提供的本地检出根。</zh-CN><en>Local checkout root explicitly supplied by the caller.</en></lang>
 * @returns {Promise<Record<string,any>>} <lang><zh-CN>已验证的上游输入。</zh-CN><en>Validated upstream inputs.</en></lang>
 */
async function validateUpstream(upstreamRoot) {
  // <lang><zh-CN>所有路径都由显式根与冻结相对路径构成；生成结果不保存绝对根。</zh-CN><en>Every path combines the explicit root with frozen relative paths; the generated result never stores the absolute root.</en></lang>
  const packagePath = resolve(upstreamRoot, CURRENT_COMPARISON.packagePath);
  const licensePath = resolve(upstreamRoot, CURRENT_COMPARISON.licensePath);
  const componentsPath = resolve(upstreamRoot, CURRENT_COMPARISON.componentsPath);
  const easycomPath = resolve(upstreamRoot, CURRENT_COMPARISON.easycomPath);
  const packageRoot = resolve(upstreamRoot, MATERIALIZATION_DESCRIPTOR.scope);
  // <lang><zh-CN>先锁定 package 范围全部文件；后续单文件读取只做语义校验，不替代这个完整性门禁。</zh-CN><en>Locks every file in the package scope first; later single-file reads provide semantic checks and do not replace this completeness gate.</en></lang>
  const materialization = await computePackageMaterialization(packageRoot);

  if (
    materialization.fileCount !== EXPECTED_PACKAGE_MATERIALIZATION.fileCount ||
    materialization.textFileCount !== EXPECTED_PACKAGE_MATERIALIZATION.textFileCount ||
    materialization.binaryFileCount !== EXPECTED_PACKAGE_MATERIALIZATION.binaryFileCount ||
    materialization.contentDigest !== EXPECTED_PACKAGE_MATERIALIZATION.contentDigest
  ) {
    throw new Error('Upstream package materialization does not match the frozen comparison snapshot.');
  }

  // <lang><zh-CN>package 与许可证都以 UTF-8 文本读取，使 CRLF/CR 与 LF checkout 共享同一规范摘要。</zh-CN><en>Both package and license are read as UTF-8 text so CRLF/CR and LF checkouts share one canonical digest.</en></lang>
  const packageSource = await readFile(packagePath, 'utf8');
  const licenseSource = await readFile(licensePath, 'utf8');
  const easycomSource = await readFile(easycomPath, 'utf8');
  const packageMetadata = JSON.parse(packageSource);
  // <lang><zh-CN>上游 pages.json 含 JSONC 注释；仅屏蔽注释后交给 JSON parser，不执行配置。</zh-CN><en>The upstream pages.json contains JSONC comments; comments are only masked before JSON parsing and the configuration is never executed.</en></lang>
  const easycomMetadata = JSON.parse(removeComments(easycomSource));

  if (
    packageMetadata.id !== CURRENT_COMPARISON.packageId ||
    packageMetadata.version !== CURRENT_COMPARISON.packageVersion ||
    packageMetadata.license !== CURRENT_COMPARISON.licenseId
  ) {
    // <lang><zh-CN>版本、包身份或许可证漂移会使比较基线失效，必须先重新审阅而不是继续生成。</zh-CN><en>A package identity, version, or license drift invalidates the comparison baseline and requires review rather than continued generation.</en></lang>
    throw new Error('Upstream package identity, version, or license does not match the frozen 0.6.15 comparison baseline.');
  }

  if (digest(packageSource) !== CURRENT_COMPARISON.packageDigest || digest(licenseSource) !== CURRENT_COMPARISON.licenseDigest) {
    // <lang><zh-CN>规范文本摘要防止同版本 mutable checkout 悄然改变 package 或许可证事实，但不因换行风格误报。</zh-CN><en>Canonical text digests prevent a mutable same-version checkout from changing package or license facts without falsely rejecting newline-style differences.</en></lang>
    throw new Error('Upstream package or license text does not match the frozen comparison snapshot.');
  }

  // <lang><zh-CN>package 范围外的 demo pages.json 以独立文本摘要锁定，并对 easycom 语义做精确验证。</zh-CN><en>The demo pages.json outside the package scope is locked by a separate text digest and exact easycom semantic validation.</en></lang>
  const easycomEntries = Object.entries(easycomMetadata.easycom?.custom ?? {});

  if (
    digest(easycomSource) !== CURRENT_COMPARISON.easycomDigest ||
    easycomMetadata.easycom?.autoscan !== true ||
    easycomEntries.length !== 1 ||
    easycomEntries[0]?.[0] !== CURRENT_COMPARISON.easycomPattern ||
    easycomEntries[0]?.[1] !== CURRENT_COMPARISON.easycomReplacement
  ) {
    throw new Error('Upstream easycom fixture does not match the frozen comparison snapshot.');
  }

  // <lang><zh-CN>只接受组件根下的真实目录名称；文件和隐藏项目不进入组件集合。</zh-CN><en>Accepts only actual directory names under the component root; files and hidden entries do not enter the component set.</en></lang>
  const directoryEntries = await readdir(componentsPath, { withFileTypes: true });
  const componentNames = directoryEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(compareCodePointStrings);

  if (componentNames.length !== LOCAL_COMPONENT_COUNTS.comparison || digest(componentNames.join('\n')) !== EXPECTED_COMPONENT_NAME_DIGEST) {
    // <lang><zh-CN>计数与名称摘要必须同时通过，杜绝“任意 99 项”误入矩阵。</zh-CN><en>Both count and name digest must pass, preventing an arbitrary set of 99 entries from entering the matrix.</en></lang>
    throw new Error('Upstream component directories do not match the frozen 99-item comparison set.');
  }

  // <lang><zh-CN>0.6.15 package 宣称根 `index.d.ts`，但冻结快照实际缺失；该事实必须保持并进入公开 issue。</zh-CN><en>The 0.6.15 package declares root `index.d.ts`, but the frozen snapshot lacks it; this fact must remain and become a public issue.</en></lang>
  const declaredTypesEntry = await readOptionalFile(resolve(upstreamRoot, 'src/uni_modules/uview-pro/index.d.ts'));
  const actualTypesIndex = await readOptionalFile(resolve(upstreamRoot, 'src/uni_modules/uview-pro/types/index.d.ts'));

  if (declaredTypesEntry !== null || actualTypesIndex === null) {
    throw new Error('Upstream type-packaging defect no longer matches the audited 0.6.15 snapshot.');
  }

  // <lang><zh-CN>package exports 同时声明 plugins ESM/CJS 目标，但冻结目录仅含 TypeScript 源；存在性事实需要独立 issue。</zh-CN><en>Package exports declare both ESM and CJS plugin targets, but the frozen directory contains only TypeScript source; this existence fact needs a separate issue.</en></lang>
  const pluginTypeScript = await readOptionalFile(resolve(upstreamRoot, 'src/uni_modules/uview-pro/plugins/index.ts'));
  const pluginEsm = await readOptionalFile(resolve(upstreamRoot, 'src/uni_modules/uview-pro/plugins/index.mjs'));
  const pluginCommonJs = await readOptionalFile(resolve(upstreamRoot, 'src/uni_modules/uview-pro/plugins/index.cjs'));

  if (pluginTypeScript === null || pluginEsm !== null || pluginCommonJs !== null) {
    throw new Error('Upstream plugin export targets no longer match the audited 0.6.15 snapshot.');
  }

  // <lang><zh-CN>全局组件声明把 u-step 指向不存在的复数目录；实际 SFC 位于单数 `u-step` 目录。</zh-CN><en>The global component declaration points u-step at a missing plural directory while the actual SFC lives in singular `u-step`.</en></lang>
  const globalComponentsTypes = await readFile(resolve(upstreamRoot, 'src/uni_modules/uview-pro/types/components.d.ts'), 'utf8');
  const invalidStepTarget = await readOptionalFile(resolve(upstreamRoot, 'src/uni_modules/uview-pro/components/u-steps/u-step.vue'));
  const actualStepTarget = await readOptionalFile(resolve(upstreamRoot, 'src/uni_modules/uview-pro/components/u-step/u-step.vue'));

  if (!globalComponentsTypes.includes("../components/u-steps/u-step.vue") || invalidStepTarget !== null || actualStepTarget === null) {
    throw new Error('Upstream u-step declaration-path defect no longer matches the audited 0.6.15 snapshot.');
  }

  // <lang><zh-CN>返回仅供本次进程使用的绝对路径与文本；只有相对 provenance 会进入 JSON。</zh-CN><en>Returns absolute paths and text for this process only; only relative provenance enters JSON.</en></lang>
  return {
    packageMetadata,
    packageSource,
    licenseSource,
    easycomSource,
    componentsPath,
    componentNames,
    actualTypesIndex,
    materialization
  };
}

/**
 * @lang zh-CN 读取并验证 HIA package、component manifest、easycom fixture、runtime/style entry 与每个 source/contract 路径边界。
 * @lang en Reads and validates the HIA package, component manifest, easycom fixture, runtime/style entries, and every source/contract path boundary.
 * @param {string[]} upstreamComponentNames <lang><zh-CN>已冻结验证的上游组件名。</zh-CN><en>Frozen and validated upstream component names.</en></lang>
 * @returns {Promise<Record<string,any>>} <lang><zh-CN>仓内 HIA 输入和导出映射。</zh-CN><en>Repository-local HIA inputs and export map.</en></lang>
 */
async function validateLocalInputs(upstreamComponentNames) {
  // <lang><zh-CN>UI 根只用作组件 source 边界；contract 则明确相对整个公开仓根。</zh-CN><en>The UI root bounds component sources, while contracts are explicitly relative to the full public repository root.</en></lang>
  const uiRoot = resolve(REPOSITORY_ROOT, 'HIA-uView-UI');
  // <lang><zh-CN>固定输入同样通过 lstat/realpath 门禁，不因为路径写在脚本中就允许 symlink 越界。</zh-CN><en>Fixed inputs pass the same lstat/realpath gate; being hard-coded does not permit symlink escapes.</en></lang>
  const packagePath = await validateContainedRegularFile(REPOSITORY_ROOT, 'HIA-uView-UI/package.json', '.json', 'Local package input');
  const manifestPath = await validateContainedRegularFile(
    REPOSITORY_ROOT,
    'HIA-uView-UI/hia-uview.components.json',
    '.json',
    'Local component manifest input'
  );
  const pagesPath = await validateContainedRegularFile(REPOSITORY_ROOT, LOCAL_EASYCOM.path, '.json', 'Local easycom fixture input');
  // <lang><zh-CN>先只读 package/manifest/pages 配置；组件源码、runtime 与 style 必须等 manifest 路径全部验证后再读。</zh-CN><en>Only package, manifest, and pages configuration are read first; component sources, runtime, and style wait until every manifest path is validated.</en></lang>
  const packageSource = await readFile(packagePath, 'utf8');
  const manifestSource = await readFile(manifestPath, 'utf8');
  const pagesSource = await readFile(pagesPath, 'utf8');
  const packageMetadata = JSON.parse(packageSource);
  const manifest = JSON.parse(manifestSource);
  const pagesMetadata = JSON.parse(pagesSource);

  if (packageMetadata.name !== '@hia-uview/ui' || packageMetadata.version !== '0.0.0' || packageMetadata.private !== true) {
    throw new Error('Local HIA-uView-UI package boundary differs from the audited private baseline.');
  }

  if (manifest.version !== 1 || manifest.profile !== MATRIX_IDENTITY.profile || manifest.components?.length !== LOCAL_COMPONENT_COUNTS.manifest) {
    throw new Error('Local component manifest identity, profile, or controlled count differs from the comparison baseline.');
  }

  // <lang><zh-CN>仓内 fixture 必须显式关闭 autoscan，且只包含当前 mp-weixin 受限映射。</zh-CN><en>The repository fixture must explicitly disable autoscan and contain only the controlled mp-weixin mapping.</en></lang>
  const easycomEntries = Object.entries(pagesMetadata.easycom?.custom ?? {});
  const fixturePages = Array.isArray(pagesMetadata.pages) ? pagesMetadata.pages : [];

  if (
    pagesMetadata.easycom?.autoscan !== false ||
    easycomEntries.length !== 1 ||
    easycomEntries[0]?.[0] !== LOCAL_EASYCOM.pattern ||
    easycomEntries[0]?.[1] !== LOCAL_EASYCOM.replacement ||
    !fixturePages.some((page) => page?.path === LOCAL_EASYCOM.fixturePagePath)
  ) {
    throw new Error('Local easycom fixture does not match the controlled mp-weixin mapping.');
  }

  // <lang><zh-CN>manifest 名称必须唯一；重复名称会使 export、source 与 contract 映射不可审计。</zh-CN><en>Manifest names must be unique; duplicates would make export, source, and contract mapping unauditable.</en></lang>
  const manifestByName = new Map();
  // <lang><zh-CN>通过全部 containment 检查的 source 绝对路径单独保存，后续不再从 manifest 字符串重新 resolve。</zh-CN><en>Absolute source paths that pass every containment check are stored separately and never re-resolved from manifest strings later.</en></lang>
  const sourcePaths = new Map();

  for (const component of manifest.components) {
    if (manifestByName.has(component.name)) throw new Error(`Duplicate local component manifest name ${component.name}.`);

    // <lang><zh-CN>组件 source 相对 UI 根且必须是 `.vue`；contract 相对仓根且必须是已存在 `.md`。</zh-CN><en>Each component source is a `.vue` file relative to the UI root, and each contract is an existing `.md` file relative to the repository root.</en></lang>
    const sourcePath = await validateContainedRegularFile(uiRoot, component.source, '.vue', 'Component source path');
    await validateContainedRegularFile(REPOSITORY_ROOT, component.contract, '.md', 'Component contract path');
    manifestByName.set(component.name, component);
    sourcePaths.set(component.name, sourcePath);
  }

  // <lang><zh-CN>每个冻结上游名称必须在 HIA manifest 中精确存在，形成 99 项名称交集。</zh-CN><en>Every frozen upstream name must exist exactly in the HIA manifest, forming the 99-item name intersection.</en></lang>
  const missing = upstreamComponentNames.filter((name) => !manifestByName.has(name));

  if (missing.length > 0 || upstreamComponentNames.length !== LOCAL_COMPONENT_COUNTS.comparison) {
    throw new Error('Local component manifest no longer contains the exact 99-item upstream comparison intersection.');
  }

  // <lang><zh-CN>所有 manifest 路径通过后才读取 runtime/style，两个固定文件也必须是边界内真实文件。</zh-CN><en>Runtime and style are read only after all manifest paths pass, and both fixed files must be real files within the repository boundary.</en></lang>
  const runtimePath = await validateContainedRegularFile(REPOSITORY_ROOT, 'HIA-uView-UI/src/index.mjs', '.mjs', 'Local runtime entry');
  const stylePath = await validateContainedRegularFile(REPOSITORY_ROOT, 'HIA-uView-UI/src/style.css', '.css', 'Local style entry');
  const runtimeSource = await readFile(runtimePath, 'utf8');
  const styleSource = await readFile(stylePath, 'utf8');
  // <lang><zh-CN>runtime map 证明每个矩阵组件是具名导出，不以目录存在代替消费入口。</zh-CN><en>The runtime map proves every matrix component is a named export instead of treating directory presence as a consumption entry.</en></lang>
  const runtimeExports = extractRuntimeExports(runtimeSource);

  for (const name of upstreamComponentNames) {
    if (!runtimeExports.has(name)) throw new Error(`Local comparison component ${name} has no named runtime export.`);
  }

  return {
    packageMetadata,
    packageSource,
    manifest,
    manifestSource,
    manifestByName,
    sourcePaths,
    pagesSource,
    runtimeSource,
    runtimeExports,
    styleSource
  };
}

/**
 * @lang zh-CN 为一个组件收集两侧静态 API 事实、provenance、迁移映射和问题引用，不修改任一组件文件。
 * @lang en Collects static API facts, provenance, migration mappings, and issue references for one component without modifying either component file.
 * @param {string} componentName <lang><zh-CN>冻结组件名。</zh-CN><en>Frozen component name.</en></lang>
 * @param {Record<string,any>} upstream <lang><zh-CN>已验证上游输入。</zh-CN><en>Validated upstream inputs.</en></lang>
 * @param {Record<string,any>} local <lang><zh-CN>已验证 HIA 输入。</zh-CN><en>Validated HIA inputs.</en></lang>
 * @returns {Promise<{component:Record<string,any>,issues:Array<Record<string,any>>}>} <lang><zh-CN>组件矩阵条目与公开问题。</zh-CN><en>Component matrix entry and public issues.</en></lang>
 */
async function buildComponent(componentName, upstream, local) {
  // <lang><zh-CN>上游组件目录下只读取同名 SFC、可选 types.ts 与已审计 service.ts。</zh-CN><en>Reads only the same-named SFC, optional types.ts, and audited service.ts under the upstream component directory.</en></lang>
  const upstreamDirectory = resolve(upstream.componentsPath, componentName);
  const upstreamSourcePath = resolve(upstreamDirectory, `${componentName}.vue`);
  const upstreamTypesPath = resolve(upstreamDirectory, 'types.ts');
  const upstreamServicePath = resolve(upstreamDirectory, 'service.ts');
  const upstreamSource = await readFile(upstreamSourcePath, 'utf8');
  const upstreamTypes = await readOptionalFile(upstreamTypesPath);
  const upstreamService = await readOptionalFile(upstreamServicePath);
  // <lang><zh-CN>service 文件集合必须与冻结白名单一致，新增或缺失都要求重新审阅。</zh-CN><en>The service-file set must match the frozen allowlist; additions or removals require renewed review.</en></lang>
  const expectedService = SERVICE_COMPONENTS.has(componentName);

  if ((upstreamService !== null) !== expectedService) {
    throw new Error(`Upstream service surface changed for component ${componentName}.`);
  }

  // <lang><zh-CN>HIA 源文件与公开 contract 均来自 component manifest，不进行目录 glob 或隐式猜测。</zh-CN><en>The HIA source file and public contract both come from the component manifest, with no directory glob or implicit guessing.</en></lang>
  const manifestEntry = local.manifestByName.get(componentName);
  // <lang><zh-CN>只使用 validateLocalInputs 已通过语法、lstat 与 realpath 门禁的绝对路径。</zh-CN><en>Uses only the absolute path that already passed lexical, lstat, and realpath gates in validateLocalInputs.</en></lang>
  const hiaSourcePath = local.sourcePaths.get(componentName);
  const hiaSource = await readFile(hiaSourcePath, 'utf8');
  const priority = resolvePriority(componentName);
  // <lang><zh-CN>上游优先从 types.ts 读取显式 prop；defineModel 的 compiler-generated prop/event 再从 SFC 静态合并。</zh-CN><en>Upstream explicit props prefer types.ts; compiler-generated defineModel props/events are then merged statically from the SFC.</en></lang>
  const upstreamExplicitProps = upstreamTypes
    ? extractUpstreamProps(upstreamTypes, componentName)
    : extractSfcProps(upstreamSource, componentName, 'upstream');
  const hiaExplicitProps = extractSfcProps(hiaSource, componentName, 'hia');
  const upstreamModel = extractDefineModelFacts(upstreamSource, componentName, 'upstream');
  const hiaModel = extractDefineModelFacts(hiaSource, componentName, 'hia');
  const upstreamProps = mergeApiInventories(
    upstreamExplicitProps,
    upstreamModel.props,
    'UPSTREAM_DEFINE_MODEL_PROP_CONFLICT'
  );
  const hiaProps = mergeApiInventories(hiaExplicitProps, hiaModel.props, 'HIA_DEFINE_MODEL_PROP_CONFLICT');
  const upstreamEvents = mergeApiInventories(
    extractEvents(upstreamSource, upstreamTypes ?? '', 'upstream'),
    upstreamModel.events,
    'UPSTREAM_DEFINE_MODEL_EVENT_CONFLICT'
  );
  const hiaEvents = mergeApiInventories(extractEvents(hiaSource, '', 'hia'), hiaModel.events, 'HIA_DEFINE_MODEL_EVENT_CONFLICT');
  const upstreamSlots = extractSlots(upstreamSource, 'upstream');
  const hiaSlots = extractSlots(hiaSource, 'hia');
  const upstreamImperative = extractImperativeApis(upstreamSource, 'upstream', expectedService);
  const hiaImperative = extractImperativeApis(hiaSource, 'hia', false);
  // <lang><zh-CN>每个 surface 只绑定直接 parser/service 问题，并由非空 issueIds 唯一决定 unresolved。</zh-CN><en>Each surface binds only direct parser/service issues, and non-empty issueIds are the sole cause of unresolved state.</en></lang>
  const propsIssueIds = resolveSurfaceIssueIds(componentName, upstreamProps, hiaProps);
  const eventsIssueIds = resolveSurfaceIssueIds(componentName, upstreamEvents, hiaEvents);
  const slotsIssueIds = resolveSurfaceIssueIds(componentName, upstreamSlots, hiaSlots);
  const imperativeIssueIds = resolveSurfaceIssueIds(componentName, upstreamImperative, hiaImperative);
  // <lang><zh-CN>将上游主导 API 转为保守迁移条目，HIA-only 项仍由自身 contract 管理。</zh-CN><en>Converts upstream-led APIs into conservative migration entries; HIA-only items remain governed by their own contracts.</en></lang>
  const props = {
    scope: 'runtime-prop-options',
    inventoryState: propsIssueIds.length === 0 ? 'complete' : 'unresolved',
    items: buildPropItems(componentName, priority, upstreamProps, hiaProps),
    issueIds: propsIssueIds
  };
  const events = {
    scope: 'names-only',
    inventoryState: eventsIssueIds.length === 0 ? 'complete' : 'unresolved',
    items: buildNamedItems(componentName, priority, 'events', 'event', upstreamEvents, hiaEvents),
    issueIds: eventsIssueIds
  };
  const slots = {
    scope: 'names-only',
    inventoryState: slotsIssueIds.length === 0 ? 'complete' : 'unresolved',
    items: buildNamedItems(componentName, priority, 'slots', 'slot', upstreamSlots, hiaSlots),
    issueIds: slotsIssueIds
  };
  const imperativeApis = {
    scope: 'names-only',
    inventoryState: imperativeIssueIds.length === 0 ? 'complete' : 'unresolved',
    items: buildNamedItems(componentName, priority, 'imperativeApis', 'imperative', upstreamImperative, hiaImperative),
    issueIds: imperativeIssueIds
  };
  // <lang><zh-CN>已审计的类型交付争议不是 parser 失败，但必须与相关组件互相引用。</zh-CN><en>Audited type-delivery disputes are not parser failures but must cross-reference the affected components.</en></lang>
  const typesIssueIds = [];

  if (componentName === 'u-step') typesIssueIds.push('UPSTREAM_U_STEP_DECLARATION_PATH_INVALID');
  if (componentName === 'u-root-portal' || componentName === 'u-time-line') {
    typesIssueIds.push('UPSTREAM_COMPONENT_TYPES_FILES_MISSING');
  }

  // <lang><zh-CN>组件 issueIds 合并 parser/service 与已审计类型问题；全局 package 问题不强行绑定任一组件。</zh-CN><en>Component issueIds merge parser/service and audited type issues; global package issues are not artificially bound to one component.</en></lang>
  const parserIssueIds = [...new Set([...propsIssueIds, ...eventsIssueIds, ...slotsIssueIds, ...imperativeIssueIds])].sort(
    compareCodePointStrings
  );
  const issueIds = [...new Set([...parserIssueIds, ...typesIssueIds])].sort(compareCodePointStrings);
  const issues = parserIssueIds.map((issueId) => createComponentIssue(issueId, componentName));
  // <lang><zh-CN>上游路径全部相对仓库根且使用正斜杠；不写入本地 checkout 绝对位置。</zh-CN><en>Every upstream path is repository-relative with forward slashes; the local checkout's absolute location is never written.</en></lang>
  const upstreamSourceRelative = `${CURRENT_COMPARISON.componentsPath}/${componentName}/${componentName}.vue`;
  const upstreamTypesRelative = `${CURRENT_COMPARISON.componentsPath}/${componentName}/types.ts`;
  const upstreamServiceRelative = `${CURRENT_COMPARISON.componentsPath}/${componentName}/service.ts`;

  const component = {
    name: componentName,
    priority,
    upstream: {
      source: { path: upstreamSourceRelative, digest: digest(upstreamSource) },
      types:
        upstreamTypes === null
          ? { status: 'not-declared' }
          : { status: 'available', path: upstreamTypesRelative, digest: digest(upstreamTypes) },
      service:
        upstreamService === null
          ? { status: 'not-declared' }
          : { status: 'available', path: upstreamServiceRelative, digest: digest(upstreamService) }
    },
    hia: {
      name: componentName,
      export: local.runtimeExports.get(componentName),
      source: manifestEntry.source,
      contract: manifestEntry.contract
    },
    props,
    events,
    slots,
    imperativeApis,
    aliases: { scope: 'runtime-aliases', inventoryState: 'complete', items: [], issueIds: [] },
    easycom: {
      upstream: {
        repositoryFixtureStatus: 'delivered',
        packageStatus: 'consumer-configuration-required',
        basis: 'validated-demo-pages-json'
      },
      hia: {
        repositoryFixtureStatus: 'delivered',
        packageStatus: 'not-delivered',
        profile: LOCAL_EASYCOM.profile
      },
      migration: { disposition: 'unsupported', reasonCode: 'HIA_PACKAGE_EASYCOM_NOT_DELIVERED' }
    },
    types: {
      upstream:
        upstreamTypes === null
          ? { status: 'not-declared' }
          : { status: 'available', path: upstreamTypesRelative, digest: digest(upstreamTypes) },
      hia: { status: 'not-delivered' },
      migration: { disposition: 'unsupported', reasonCode: 'HIA_COMPONENT_TYPES_NOT_DELIVERED' },
      issueIds: typesIssueIds
    },
    platforms: {
      profile: MATRIX_IDENTITY.profile,
      upstream: {
        declared: UPSTREAM_DECLARED_PLATFORMS,
        profileStatus: 'declared',
        sourceConditionStatus: 'not-assessed'
      },
      hia: {
        comparisonScope: [MATRIX_IDENTITY.profile],
        evidenceStatus: 'not-assessed',
        sourceConditionStatus: 'not-assessed'
      },
      migration: {
        disposition: 'unsupported',
        reasonCode: 'PLATFORM_SOURCE_CONDITIONS_NOT_ASSESSED'
      }
    },
    migration: summarizeMigration([props, events, slots, imperativeApis]),
    issueIds
  };

  return { component, issues };
}

/**
 * @lang zh-CN 验证生成后的关键 capability 计数与分级 canary，防止 parser 或规则回归仍产出表面合法 JSON。
 * @lang en Validates generated capability counts and priority canaries so parser or rule regressions cannot still produce superficially valid JSON.
 * @param {Array<Record<string,any>>} components <lang><zh-CN>完整 99 项组件矩阵。</zh-CN><en>Complete 99-item component matrix.</en></lang>
 * @returns {void} <lang><zh-CN>验证通过无返回；回归时抛错。</zh-CN><en>Returns nothing on success and throws on regression.</en></lang>
 */
function validateGeneratedCapabilities(components) {
  // <lang><zh-CN>四类 API 总量已经过独立源码/compiler 审计，共同作为 parser 完整性 canary。</zh-CN><en>All four API totals were independently source/compiler-audited and jointly serve as parser-completeness canaries.</en></lang>
  const propsCount = components.reduce((total, component) => total + component.props.items.length, 0);
  const eventsCount = components.reduce((total, component) => total + component.events.items.length, 0);
  const slotsCount = components.reduce((total, component) => total + component.slots.items.length, 0);
  const imperativeCount = components.reduce((total, component) => total + component.imperativeApis.items.length, 0);

  if (propsCount !== 1308 || eventsCount !== 200 || slotsCount !== 87 || imperativeCount !== 145) {
    throw new Error(
      `Generated capability totals drifted (props=${propsCount}, events=${eventsCount}, slots=${slotsCount}, imperative=${imperativeCount}).`
    );
  }

  // <lang><zh-CN>容器 scope 与 issueIds 是 schema 必填语义；complete 只能对应空问题集，unresolved 必须有直接原因。</zh-CN><en>Container scope and issueIds are mandatory schema semantics: complete requires no issues, while unresolved requires a direct cause.</en></lang>
  const expectedScopes = {
    props: 'runtime-prop-options',
    events: 'names-only',
    slots: 'names-only',
    imperativeApis: 'names-only',
    aliases: 'runtime-aliases'
  };

  for (const component of components) {
    for (const [surfaceName, expectedScope] of Object.entries(expectedScopes)) {
      const surface = component[surfaceName];
      const sortedIssueIds = [...surface.issueIds].sort(compareCodePointStrings);
      const issueIdsAreCanonical =
        Array.isArray(surface.issueIds) &&
        new Set(surface.issueIds).size === surface.issueIds.length &&
        JSON.stringify(sortedIssueIds) === JSON.stringify(surface.issueIds);
      const stateMatchesIssues =
        (surface.inventoryState === 'complete' && surface.issueIds.length === 0) ||
        (surface.inventoryState === 'unresolved' && surface.issueIds.length > 0);

      if (surface.scope !== expectedScope || !Array.isArray(surface.items) || !issueIdsAreCanonical || !stateMatchesIssues) {
        throw new Error(`Component ${component.name} has an invalid ${surfaceName} inventory contract.`);
      }

      if (surface.issueIds.some((issueId) => !component.issueIds.includes(issueId))) {
        throw new Error(`Component ${component.name} omits a direct ${surfaceName} issue from component issueIds.`);
      }
    }

    if (component.migration.scope !== 'api-items-only') {
      throw new Error(`Component ${component.name} migration summary must remain scoped to API items only.`);
    }

    // <lang><zh-CN>每个 prop 证据侧都必须携带类型集合/顺序、default、required 与 validator，且两个类型视图集合一致。</zh-CN><en>Every prop evidence side must carry type set/order, default, required, and validator, with equal type sets across both views.</en></lang>
    for (const prop of component.props.items) {
      const facts = [prop.upstream, ...prop.hia.targets];

      for (const fact of facts) {
        const typeKinds = [...fact.typeKinds].sort(compareCodePointStrings);
        const orderSet = [...new Set(fact.typeOrder)].sort(compareCodePointStrings);
        const validatorIsControlled =
          fact.validator?.kind === 'absent' ||
          (fact.validator?.kind === 'expression' && /^sha256:[0-9a-f]{64}$/.test(fact.validator.digest));

        if (
          !Array.isArray(fact.typeKinds) ||
          !Array.isArray(fact.typeOrder) ||
          new Set(fact.typeKinds).size !== fact.typeKinds.length ||
          new Set(fact.typeOrder).size !== fact.typeOrder.length ||
          JSON.stringify(typeKinds) !== JSON.stringify(fact.typeKinds) ||
          JSON.stringify(typeKinds) !== JSON.stringify(orderSet) ||
          typeof fact.required !== 'boolean' ||
          !fact.default?.kind ||
          !validatorIsControlled
        ) {
          throw new Error(`Component ${component.name} prop ${prop.id} has incomplete structural facts.`);
        }
      }
    }
  }

  // <lang><zh-CN>至少一个组件必须在其 API 内形成混合优先级，否则说明又退化为复制组件优先级。</zh-CN><en>At least one component must contain mixed API priorities; otherwise capability classification has regressed to copying component priority.</en></lang>
  const componentsWithMixedPriorities = components.filter((component) => {
    const priorities = new Set(
      [component.props, component.events, component.slots, component.imperativeApis].flatMap((surface) =>
        surface.items.map((item) => item.priority)
      )
    );
    return priorities.size > 1;
  }).length;

  if (componentsWithMixedPriorities === 0) throw new Error('Capability priorities must not mirror component priority uniformly.');

  // <lang><zh-CN>required canary 锁定两个上游必填 prop，防止缺失字段与显式 true 再次被混同。</zh-CN><en>Required canaries lock two mandatory upstream props so omission and explicit true cannot regress into one state.</en></lang>
  const countToEndValue = components
    .find((component) => component.name === 'u-count-to')
    ?.props.items.find((item) => item.id === 'prop:endVal');
  const waterfallModelValue = components
    .find((component) => component.name === 'u-waterfall')
    ?.props.items.find((item) => item.id === 'prop:modelValue');

  if (countToEndValue?.upstream.required !== true || waterfallModelValue?.upstream.required !== true) {
    throw new Error('Required prop canary failed for u-count-to.endVal or u-waterfall.modelValue.');
  }

  // <lang><zh-CN>validator/typeOrder canary 分别锁定表达式摘要与 Vue Boolean/String casting 顺序。</zh-CN><en>Validator/typeOrder canaries lock expression digests and Vue Boolean/String casting order respectively.</en></lang>
  const circlePercent = components
    .find((component) => component.name === 'u-circle-progress')
    ?.props.items.find((item) => item.id === 'prop:percent');
  const checkboxDisabled = components
    .find((component) => component.name === 'u-checkbox')
    ?.props.items.find((item) => item.id === 'prop:disabled');

  if (
    circlePercent?.upstream.validator.kind !== 'expression' ||
    circlePercent?.hia.targets.length !== 0 ||
    circlePercent?.migration.reasonCode !== 'HIA_API_NOT_DELIVERED' ||
    JSON.stringify(checkboxDisabled?.upstream.typeOrder) !== JSON.stringify(['String', 'Boolean'])
  ) {
    throw new Error(
      `Validator or constructor-order canary failed (upstreamValidator=${circlePercent?.upstream.validator.kind}, hiaTargets=${circlePercent?.hia.targets.length}, migration=${circlePercent?.migration.reasonCode}, checkboxOrder=${JSON.stringify(checkboxDisabled?.upstream.typeOrder)}).`
    );
  }

  // <lang><zh-CN>defineModel canary 同时锁定 runtime model prop、compiler-generated modifiers prop 与 update event。</zh-CN><en>The defineModel canary jointly locks the runtime model prop, compiler-generated modifiers prop, and update event.</en></lang>
  const pagination = components.find((component) => component.name === 'u-pagination');
  const paginationModel = pagination?.props.items.find((item) => item.id === 'prop:modelValue');
  const paginationModifiers = pagination?.props.items.find((item) => item.id === 'prop:modelModifiers');
  const paginationUpdate = pagination?.events.items.find((item) => item.id === 'event:update:modelValue');

  if (
    JSON.stringify(paginationModel?.upstream.typeKinds) !== JSON.stringify(['Number']) ||
    JSON.stringify(paginationModel?.upstream.typeOrder) !== JSON.stringify(['Number']) ||
    paginationModel?.upstream.default.kind !== 'literal' ||
    paginationModel?.upstream.default.value !== 1 ||
    JSON.stringify(paginationModifiers?.upstream.typeKinds) !== JSON.stringify(['unknown']) ||
    paginationUpdate?.upstream.name !== 'update:modelValue'
  ) {
    throw new Error('u-pagination defineModel canary failed.');
  }

  // <lang><zh-CN>u-button canary 锁定核心 click 为 P0，并把 openType、lang 与全部开放能力/失败事件锁定为 P2。</zh-CN><en>The u-button canary locks core click at P0 and all openType, lang, open-capability, and failure-event surfaces at P2.</en></lang>
  const button = components.find((component) => component.name === 'u-button');
  const buttonClick = button?.events.items.find((item) => item.id === 'event:click');
  const buttonOpenType = button?.props.items.find((item) => item.id === 'prop:openType');
  const buttonLanguage = button?.props.items.find((item) => item.id === 'prop:lang');
  // <lang><zh-CN>除普通 click 外，当前按钮事件均来自微信开放能力或其原生失败回调，必须逐项保持 P2。</zh-CN><en>Every current button event except ordinary click comes from a WeChat open capability or its native failure callback and must remain P2 item by item.</en></lang>
  const buttonOpenEvents = button?.events.items.filter((item) => item.id !== 'event:click') ?? [];

  if (buttonClick?.priority !== 'P0' || buttonOpenType?.priority !== 'P2'
    || buttonLanguage?.priority !== 'P2' || buttonOpenEvents.length !== 8
    || buttonOpenEvents.some((item) => item.priority !== 'P2')) {
    throw new Error('u-button capability-priority canary failed (click=P0; openType/lang/open events=P2 required).');
  }
}

/**
 * @lang zh-CN 组装顶层 provenance、本地输入摘要、公开问题与 99 项组件矩阵；不包含时间戳或机器路径，保证相同输入逐字稳定。
 * @lang en Assembles top-level provenance, local input digests, public issues, and the 99-item component matrix without timestamps or machine paths, guaranteeing byte stability for equal inputs.
 * @param {Record<string,any>} upstream <lang><zh-CN>已验证上游输入。</zh-CN><en>Validated upstream inputs.</en></lang>
 * @param {Record<string,any>} local <lang><zh-CN>已验证 HIA 输入。</zh-CN><en>Validated HIA inputs.</en></lang>
 * @returns {Promise<Record<string,any>>} <lang><zh-CN>完整矩阵 JSON 对象。</zh-CN><en>Complete matrix JSON object.</en></lang>
 */
async function buildMatrix(upstream, local) {
  // <lang><zh-CN>组件按冻结名称顺序串行读取；确定性优先于并发，且避免大量文件句柄。</zh-CN><en>Components are read serially in frozen name order; determinism takes priority over concurrency and avoids a large file-handle burst.</en></lang>
  const components = [];
  // <lang><zh-CN>顶层问题先包含已核验的 package types entry 缺陷。</zh-CN><en>Top-level issues begin with the verified package types-entry defect.</en></lang>
  const issues = [
    {
      id: 'UPSTREAM_PACKAGE_TYPES_ENTRY_MISSING',
      severity: 'review-required',
      scope: 'package-types',
      message: {
        'zh-CN': 'uView-Pro 0.6.15 package.json 将类型入口声明为根 index.d.ts，但该文件不存在；实际 types/index.d.ts 不能自动修复 package exports。',
        en: 'uView-Pro 0.6.15 package.json declares root index.d.ts as its type entry, but that file is absent; the existing types/index.d.ts does not automatically repair package exports.'
      },
      evidence: { declared: 'src/uni_modules/uview-pro/index.d.ts', available: 'src/uni_modules/uview-pro/types/index.d.ts' }
    },
    {
      id: 'UPSTREAM_PLUGIN_EXPORT_TARGETS_MISSING',
      severity: 'review-required',
      scope: 'package-exports',
      message: {
        'zh-CN': 'uView-Pro 0.6.15 package.json 的 ./plugins export 指向 index.mjs/index.cjs，但冻结目录只有 index.ts，发布消费能力需另行验证。',
        en: 'The uView-Pro 0.6.15 package.json ./plugins export targets index.mjs/index.cjs, but the frozen directory contains only index.ts, so published consumption requires separate verification.'
      },
      evidence: {
        declared: ['src/uni_modules/uview-pro/plugins/index.mjs', 'src/uni_modules/uview-pro/plugins/index.cjs'],
        available: ['src/uni_modules/uview-pro/plugins/index.ts']
      }
    },
    {
      id: 'UPSTREAM_U_STEP_DECLARATION_PATH_INVALID',
      severity: 'review-required',
      scope: 'component-types',
      component: 'u-step',
      message: {
        'zh-CN': '上游全局组件类型将 u-step 指向不存在的 u-steps/u-step.vue；实际组件位于 u-step/u-step.vue。',
        en: 'The upstream global component type points u-step at missing u-steps/u-step.vue; the actual component is located at u-step/u-step.vue.'
      },
      evidence: {
        declared: 'src/uni_modules/uview-pro/components/u-steps/u-step.vue',
        available: 'src/uni_modules/uview-pro/components/u-step/u-step.vue'
      }
    },
    {
      id: 'UPSTREAM_COMPONENT_TYPES_FILES_MISSING',
      severity: 'review-required',
      scope: 'component-types',
      components: ['u-root-portal', 'u-time-line'],
      message: {
        'zh-CN': '上游 u-root-portal 与 u-time-line 目录没有组件级 types.ts；SFC API 可比较，但组件类型交付不能推定。',
        en: 'The upstream u-root-portal and u-time-line directories have no component-level types.ts; their SFC APIs can be compared, but component type delivery cannot be inferred.'
      },
      evidence: {
        missing: [
          'src/uni_modules/uview-pro/components/u-root-portal/types.ts',
          'src/uni_modules/uview-pro/components/u-time-line/types.ts'
        ]
      }
    }
  ];

  for (const componentName of upstream.componentNames) {
    const built = await buildComponent(componentName, upstream, local);
    components.push(built.component);
    issues.push(...built.issues);
  }

  // <lang><zh-CN>在组装顶层 JSON 前执行完整性与分级 canary，失败时不写部分生成物。</zh-CN><en>Runs completeness and priority canaries before top-level JSON assembly so failures never write a partial artifact.</en></lang>
  validateGeneratedCapabilities(components);

  // <lang><zh-CN>不同 parser 分支可能引用同一 issue；按 ID 去重并排序，确保 Tool 可以二分/稳定统计。</zh-CN><en>Different parser branches may reference the same issue; ID deduplication and sorting enable stable Tool statistics and lookup.</en></lang>
  const issuesById = new Map();

  for (const issue of issues) {
    if (!issuesById.has(issue.id)) issuesById.set(issue.id, issue);
  }

  const sortedIssues = [...issuesById.values()].sort((left, right) => compareCodePointStrings(left.id, right.id));
  // <lang><zh-CN>组件 issue 引用必须全部在顶层 registry 存在，否则生成器自身契约失败。</zh-CN><en>Every component issue reference must exist in the top-level registry or the generator contract fails.</en></lang>
  const knownIssueIds = new Set(sortedIssues.map((issue) => issue.id));

  for (const component of components) {
    for (const issueId of component.issueIds) {
      if (!knownIssueIds.has(issueId)) throw new Error(`Component ${component.name} references unknown issue ${issueId}.`);
    }
  }

  return {
    version: MATRIX_IDENTITY.version,
    kind: MATRIX_IDENTITY.kind,
    profile: MATRIX_IDENTITY.profile,
    comparison: {
      repository: CURRENT_COMPARISON.repository,
      releaseTag: CURRENT_COMPARISON.releaseTag,
      commit: CURRENT_COMPARISON.commit,
      tree: CURRENT_COMPARISON.tree,
      sourceRole: CURRENT_COMPARISON.sourceRole,
      package: {
        id: CURRENT_COMPARISON.packageId,
        version: CURRENT_COMPARISON.packageVersion,
        path: CURRENT_COMPARISON.packagePath,
        blob: CURRENT_COMPARISON.packageBlob,
        tree: CURRENT_COMPARISON.packageTree,
        digest: CURRENT_COMPARISON.packageDigest
      },
      license: {
        id: CURRENT_COMPARISON.licenseId,
        path: CURRENT_COMPARISON.licensePath,
        blob: CURRENT_COMPARISON.licenseBlob,
        digest: CURRENT_COMPARISON.licenseDigest
      },
      components: {
        path: CURRENT_COMPARISON.componentsPath,
        count: LOCAL_COMPONENT_COUNTS.comparison,
        tree: CURRENT_COMPARISON.componentsTree,
        nameDigest: EXPECTED_COMPONENT_NAME_DIGEST
      },
      materialization: upstream.materialization,
      easycom: {
        repositoryFixtureStatus: 'delivered',
        packageStatus: 'consumer-configuration-required',
        basis: 'validated-demo-pages-json',
        path: CURRENT_COMPARISON.easycomPath,
        digest: CURRENT_COMPARISON.easycomDigest,
        autoscan: true,
        pattern: CURRENT_COMPARISON.easycomPattern,
        replacement: CURRENT_COMPARISON.easycomReplacement
      },
      previous: PREVIOUS_COMPARISON,
      compare: {
        from: PREVIOUS_COMPARISON.comparisonCommit,
        to: CURRENT_COMPARISON.commit,
        changedPathCount: COMPARISON_CHANGED_PATHS.length,
        changedPaths: COMPARISON_CHANGED_PATHS,
        componentPathsChanged: false
      }
    },
    local: {
      package: {
        name: local.packageMetadata.name,
        version: local.packageMetadata.version,
        path: 'HIA-uView-UI/package.json',
        digest: digest(local.packageSource)
      },
      componentManifest: {
        path: 'HIA-uView-UI/hia-uview.components.json',
        version: local.manifest.version,
        controlledCount: local.manifest.components.length,
        comparisonCount: LOCAL_COMPONENT_COUNTS.comparison,
        digest: digest(local.manifestSource)
      },
      runtimeEntry: { path: 'HIA-uView-UI/src/index.mjs', digest: digest(local.runtimeSource) },
      styleEntry: { path: 'HIA-uView-UI/src/style.css', digest: digest(local.styleSource) },
      easycom: {
        repositoryFixtureStatus: 'delivered',
        packageStatus: 'not-delivered',
        profile: LOCAL_EASYCOM.profile,
        path: LOCAL_EASYCOM.path,
        digest: digest(local.pagesSource)
      }
    },
    issues: sortedIssues,
    components
  };
}

/**
 * @lang zh-CN 执行完整离线生成或只读一致性检查。默认只读；只有 `--write` 会替换固定 JSON。
 * @lang en Executes the complete offline generation or read-only consistency check. The default is read-only; only `--write` replaces the fixed JSON.
 * @returns {Promise<void>} <lang><zh-CN>成功时输出稳定摘要；输入或现有输出不一致时抛错。</zh-CN><en>Prints a stable summary on success and throws when inputs or the existing output disagree.</en></lang>
 */
async function main() {
  // <lang><zh-CN>在读取调用方输入前先锁定换行摘要与路径边界两类安全不变量。</zh-CN><en>Locks newline-digest and path-boundary safety invariants before reading caller inputs.</en></lang>
  validateDigestNormalizationCanary();
  validatePathBoundaryCanary();
  // <lang><zh-CN>命令行不允许改变输出路径，且必须显式提供本地上游根。</zh-CN><en>The command line cannot change the output path and must explicitly provide the local upstream root.</en></lang>
  const options = parseArguments(process.argv.slice(2));
  // <lang><zh-CN>先分别验证上游和 HIA 边界，再读取组件细节。</zh-CN><en>Validates upstream and HIA boundaries separately before reading component details.</en></lang>
  const upstream = await validateUpstream(options.upstreamRoot);
  const local = await validateLocalInputs(upstream.componentNames);
  const matrix = await buildMatrix(upstream, local);
  // <lang><zh-CN>两空格缩进与末尾换行是生成物字节契约的一部分。</zh-CN><en>Two-space indentation and the trailing newline are part of the artifact byte contract.</en></lang>
  const serialized = `${JSON.stringify(matrix, null, 2)}\n`;

  if (options.write) {
    // <lang><zh-CN>显式写入只触达固定仓内 JSON；上游根和其他文件保持只读。</zh-CN><en>Explicit writing touches only the fixed repository-local JSON; the upstream root and every other file remain read-only.</en></lang>
    await writeFile(OUTPUT_PATH, serialized, 'utf8');
    console.log(`HIA-uView API compatibility matrix written (${matrix.components.length} components, ${matrix.issues.length} issues).`);
    return;
  }

  // <lang><zh-CN>默认/`--check` 读取现有生成物进行逐字比较，不自动修复差异。</zh-CN><en>The default and `--check` read the existing artifact for byte comparison and never repair differences automatically.</en></lang>
  const existing = await readOptionalFile(OUTPUT_PATH);

  if (existing === null) throw new Error(`Generated matrix is missing; run the same command with --write after review.`);
  if (existing !== serialized) throw new Error('Generated matrix is stale; review the input change before running with --write.');

  console.log(`HIA-uView API compatibility matrix is current (${matrix.components.length} components, ${matrix.issues.length} issues).`);
}

// <lang><zh-CN>顶层 await 保持单一显式入口；异常交给 Node 以非零状态报告，不吞掉失败。</zh-CN><en>Top-level await keeps one explicit entry point; failures propagate to Node for a non-zero exit status.</en></lang>
await main();
