import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validatePackageContracts } from './package-contract.mjs';

/**
 * @lang zh-CN 初始化质量门禁所需的最小文件集合；运行时实现开始后应由测试、类型检查和打包检查扩展。
 * @lang en Minimal files required by the initialization quality gate; extend this with tests, type checks, and package checks when implementation starts.
 */
const requiredFiles = [
  'README.md',
  'AGENTS.md',
  'LICENSE',
  'HIA-uView-UI/package.json',
  'HIA-uView-UI/hia-uview.components.json',
  'HIA-uView-UI/src/theme/hia-light.css',
  'HIA-uView-UI/src/index.mjs',
  'HIA-uView-UI/src/style.css',
  'HIA-uView-UI/src/components/u-button/u-button.vue',
  'HIA-uView-Tool/package.json',
  'HIA-uView-Tool/src/cli.mjs',
  'hia-uview.config.json',
  'docs/development.md',
  'docs/development-toolchain-risk.md',
  'docs/runtime-consumption.md',
  'docs/architecture.md',
  'docs/compatibility.md',
  'docs/design-system.md',
  'docs/documentation.md',
  'docs/tool.md',
  'docs/button.md',
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
  await Promise.all(requiredFiles.map((relativePath) => access(resolve(process.cwd(), relativePath))));
}

/**
 * @lang zh-CN 验证根 workspace 与两个公开包的名称、私有初始化状态、许可证和 Node 版本要求，防止未声明的包边界漂移。
 * @lang en Validates the root workspace and both public packages for their names, private initialization state, license, and Node-version requirement to prevent undeclared package-boundary drift.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；发现契约问题时抛出错误。</zh-CN><en>Resolves without a value and throws when a contract issue is found.</en></lang>
 */
async function verifyPackageContracts() {
  const issues = await validatePackageContracts();

  if (issues.length > 0) {
    throw new Error(`HIA-uView package contract failed:\n${issues.map((issue) => `- ${issue}`).join('\n')}`);
  }
}

await verifyRequiredFiles();
await verifyPackageContracts();
console.log(`HIA-uView package-contract gate passed (${requiredFiles.length} required files).`);
