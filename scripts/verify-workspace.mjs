import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validatePackageContracts } from './package-contract.mjs';

/**
 * 中文：初始化质量门禁所需的最小文件集合；运行时实现开始后应由测试、类型检查和打包检查扩展。
 * English: Minimal files required by the initialization quality gate; extend this with tests, type checks, and package checks when implementation starts.
 */
const requiredFiles = [
  'README.md',
  'AGENTS.md',
  'LICENSE',
  'HIA-uView-UI/package.json',
  'HIA-uView-Tool/package.json',
  'docs/development.md',
  'docs/architecture.md',
  'docs/compatibility.md',
  'THIRD_PARTY_NOTICES.md'
];

/**
 * 中文：验证每个必需的相对路径都存在，并在缺失时以非零状态退出。
 * English: Verify that every required relative path exists and exit non-zero when any one is missing.
 * @returns {Promise<void>} 无返回值；失败时抛出文件访问错误。 / Resolves without a value and throws an access error on failure.
 */
async function verifyRequiredFiles() {
  await Promise.all(requiredFiles.map((relativePath) => access(resolve(process.cwd(), relativePath))));
}

/**
 * 中文：验证根 workspace 与两个公开包的名称、私有初始化状态、许可证和 Node 版本要求，防止未声明的包边界漂移。
 * English: Validate the root workspace and both public packages for their names, private initialization state, license, and Node-version requirement to prevent undeclared package-boundary drift.
 * @returns {Promise<void>} 无返回值；发现契约问题时抛出错误。 / Resolves without a value and throws when a contract issue is found.
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
