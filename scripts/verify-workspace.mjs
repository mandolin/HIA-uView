import { access } from 'node:fs/promises';
import { resolve } from 'node:path';

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
  'docs/architecture.md'
];

/**
 * 中文：验证每个必需的相对路径都存在，并在缺失时以非零状态退出。
 * English: Verify that every required relative path exists and exit non-zero when any one is missing.
 * @returns {Promise<void>} 无返回值；失败时抛出文件访问错误。 / Resolves without a value and throws an access error on failure.
 */
async function verifyRequiredFiles() {
  await Promise.all(requiredFiles.map((relativePath) => access(resolve(process.cwd(), relativePath))));
}

await verifyRequiredFiles();
console.log(`HIA-uView initialization gate passed (${requiredFiles.length} required files).`);
