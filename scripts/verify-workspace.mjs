/**
 * @module verify-workspace
 * @lang zh-CN 初始化质量门禁所需的最小文件集合；运行时实现开始后应由测试、类型检查和打包检查扩展。
 * @lang en Minimal files required by the initialization quality gate; extend this with tests, type checks, and package checks when implementation starts.
 */

// <lang><zh-CN>导入本地文件存在性校验、路径解析和 package 契约验证；脚本不写入仓库、不执行项目代码或访问网络。</zh-CN><en>Imports local file-existence checks, path resolution, and package-contract validation; the script writes no repository file, executes no project code, and accesses no network.</en></lang>
import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validatePackageContracts } from './package-contract.mjs';

/**
 * @lang zh-CN 初始化质量门禁必须存在的稳定仓库内相对文件。该冻结前清单把公开消费说明、组件源码、主题、Tool 和 Documentation Sys 配置保持在同一基础完整性检查内，而不读取仓库外路径。
 * @lang en Stable repository-relative files that must exist for the initialization quality gate. This pre-frozen list keeps public consumption guidance, component source, theme, Tool, and Documentation Sys configuration in one baseline integrity check without reading paths outside the repository.
 */
const requiredFiles = [
  'README.md',
  'AGENTS.md',
  'LICENSE',
  'HIA-uView-UI/package.json',
  'HIA-uView-UI/main.js',
  'HIA-uView-UI/manifest.json',
  'HIA-uView-UI/pages.json',
  'HIA-uView-UI/hia-uview.components.json',
  'HIA-uView-UI/hia-uview.api-compatibility.json',
  'HIA-uView-UI/src/theme/hia-light.css',
  'HIA-uView-UI/src/index.mjs',
  'HIA-uView-UI/src/style.css',
  'HIA-uView-UI/types/index.d.ts',
  'HIA-uView-UI/types/global-components.d.ts',
  'HIA-uView-UI/types/global-components.mjs',
  'HIA-uView-UI/easycom/mp-weixin.json',
  'HIA-uView-UI/src/components/u-button/u-button.vue',
  'HIA-uView-UI/src/components/u-input/u-input.vue',
  'HIA-uView-UI/src/components/u-field/u-field.vue',
  'HIA-uView-UI/src/components/u-validation-message/u-validation-message.vue',
  'HIA-uView-UI/src/components/u-modal/u-modal.vue',
  'HIA-uView-UI/src/components/u-notice/u-notice.vue',
  'HIA-uView-UI/src/components/u-empty/u-empty.vue',
  'HIA-uView-Tool/package.json',
  'HIA-uView-Tool/src/cli.mjs',
  'HIA-uView-Tool/src/index.mjs',
  'HIA-uView-Tool/src/config.mjs',
  'HIA-uView-Tool/src/metadata.mjs',
  'HIA-uView-Tool/src/adoption.mjs',
  'HIA-uView-Tool/src/compatibility.mjs',
  'HIA-uView-Tool/src/api-compatibility.mjs',
  'HIA-uView-UI/fixtures/mp-weixin/build.mjs',
  'HIA-uView-Tool/src/inspect.mjs',
  'hia-uview.config.json',
  'HIA-uView-UI/hia-uview.compatibility.json',
  'scripts/generate-api-compatibility-matrix.mjs',
  'docs/api-compatibility.md',
  'docs/development.md',
  'docs/development-toolchain-risk.md',
  'docs/runtime-consumption.md',
  'docs/private-package-consumption.md',
  'docs/local-composition.md',
  'docs/architecture.md',
  'docs/compatibility.md',
  'docs/design-system.md',
  'docs/documentation.md',
  'docs/components.md',
  'docs/examples.md',
  'docs/migration-from-uview.md',
  'docs/tool.md',
  'docs/tool-adoption.md',
  'docs/button.md',
  'docs/input.md',
  'docs/field.md',
  'docs/validation-message.md',
  'docs/modal.md',
  'docs/notice.md',
  'docs/empty.md',
  'docs/radio.md',
  'docs/radio-group.md',
  'docs/checkbox.md',
  'docs/checkbox-group.md',
  'docs/jsdoc.config.json',
  'THIRD_PARTY_NOTICES.md',
  'vitest.config.mjs'
];

/**
 * @lang zh-CN 验证每个必需的相对路径都存在，并在缺失时以非零状态退出。
 * @lang en Verifies that every required relative path exists and exits non-zero when any one is missing.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；失败时抛出文件访问错误。</zh-CN><en>Resolves without a value and throws an access error on failure.</en></lang>
 */
async function verifyRequiredFiles() {
  // <lang><zh-CN>从当前仓库根解析每个白名单相对路径；不接受调用方路径、glob 或仓库外遍历。</zh-CN><en>Resolves every allowlisted relative path from the current repository root; accepts no caller path, glob, or traversal outside the repository.</en></lang>
  await Promise.all(requiredFiles.map((relativePath) => access(resolve(process.cwd(), relativePath))));
}

/**
 * @lang zh-CN 验证根 workspace 与两个公开包的名称、私有初始化状态、许可证和 Node 版本要求，防止未声明的包边界漂移。
 * @lang en Validates the root workspace and both public packages for their names, private initialization state, license, and Node-version requirement to prevent undeclared package-boundary drift.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；发现契约问题时抛出错误。</zh-CN><en>Resolves without a value and throws when a contract issue is found.</en></lang>
 */
async function verifyPackageContracts() {
  // <lang><zh-CN>收集 package 元数据和分发边界问题；校验函数不执行 UI、Tool、compiler 或项目代码。</zh-CN><en>Collects package-metadata and distribution-boundary issues; the validation function executes no UI, Tool, compiler, or project code.</en></lang>
  const issues = await validatePackageContracts();

  if (issues.length > 0) {
    // <lang><zh-CN>按单行问题输出稳定失败文本，不泄露依赖目录、用户路径或 package 内容正文。</zh-CN><en>Outputs stable failure text per issue without leaking dependency directories, user paths, or package-content body.</en></lang>
    throw new Error(`HIA-uView package contract failed:\n${issues.map((issue) => `- ${issue}`).join('\n')}`);
  }
}

await verifyRequiredFiles();
await verifyPackageContracts();
console.log(`HIA-uView package-contract gate passed (${requiredFiles.length} required files).`);
