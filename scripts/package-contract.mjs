import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

/**
 * @lang zh-CN 初始化期允许的根 workspace 包目录及其稳定顺序。
 * @lang en Root workspace package directories and their stable order allowed during initialization.
 */
const expectedWorkspacePackages = ['HIA-uView-UI', 'HIA-uView-Tool'];

/**
 * @lang zh-CN 每个受管理包必须满足的目录和公开 npm 名称映射。
 * @lang en Directory and public npm-name mappings that every governed package must satisfy.
 */
const expectedPackageMetadata = [
  {
    directory: 'HIA-uView-UI',
    name: '@hia-uview/ui'
  },
  {
    directory: 'HIA-uView-Tool',
    name: '@hia-uview/tool'
  }
];

/**
 * @lang zh-CN 读取并解析指定根目录下的 JSON 文件，供 workspace 契约校验使用。
 * @lang en Reads and parses a JSON file under the supplied root directory for workspace-contract validation.
 * @param {string} rootDirectory <lang><zh-CN>仓库根目录。</zh-CN><en>Repository root directory.</en></lang>
 * @param {string} relativePath <lang><zh-CN>仓库内相对 JSON 路径。</zh-CN><en>Relative JSON path inside the repository.</en></lang>
 * @returns {Promise<Record<string, unknown>>} <lang><zh-CN>已解析的 JSON 对象。</zh-CN><en>Parsed JSON object.</en></lang>
 */
async function readJson(rootDirectory, relativePath) {
  const content = await readFile(resolve(rootDirectory, relativePath), 'utf8');
  return JSON.parse(content);
}

/**
 * @lang zh-CN 比较两个字符串数组是否按相同顺序包含相同元素，避免 workspace 列表发生未记录漂移。
 * @lang en Compares two string arrays for identical ordered elements so the workspace list cannot drift without a record.
 * @param {unknown} actual <lang><zh-CN>待校验值。</zh-CN><en>Value to validate.</en></lang>
 * @param {string[]} expected <lang><zh-CN>预期数组。</zh-CN><en>Expected array.</en></lang>
 * @returns {boolean} <lang><zh-CN>是否完全一致。</zh-CN><en>Whether the arrays are identical.</en></lang>
 */
function hasExpectedStrings(actual, expected) {
  return Array.isArray(actual)
    && actual.length === expected.length
    && actual.every((value, index) => value === expected[index]);
}

/**
 * @lang zh-CN 校验 HIA-uView 根 workspace 及 UI/Tool 包的初始化期公开契约；本函数不加载 UI 运行时或第三方依赖。
 * @lang en Validates the initialization-stage public contract of the HIA-uView root workspace and UI/Tool packages; this function does not load a UI runtime or third-party dependency.
 * @param {string} [rootDirectory=process.cwd()] <lang><zh-CN>仓库根目录。</zh-CN><en>Repository root directory.</en></lang>
 * @returns {Promise<string[]>} <lang><zh-CN>契约问题列表；空数组表示校验通过。</zh-CN><en>Contract issue list; an empty array means validation passed.</en></lang>
 */
export async function validatePackageContracts(rootDirectory = process.cwd()) {
  const issues = [];
  const rootPackage = await readJson(rootDirectory, 'package.json');

  if (!hasExpectedStrings(rootPackage.workspaces, expectedWorkspacePackages)) {
    issues.push('Root workspaces must contain only HIA-uView-UI and HIA-uView-Tool in the documented order.');
  }

  for (const expected of expectedPackageMetadata) {
    const packageJson = await readJson(rootDirectory, `${expected.directory}/package.json`);

    if (packageJson.name !== expected.name) {
      issues.push(`${expected.directory} must declare name ${expected.name}.`);
    }

    if (packageJson.private !== true) {
      issues.push(`${expected.directory} must remain private until a published package contract is approved.`);
    }

    if (packageJson.version !== '0.0.0') {
      issues.push(`${expected.directory} must use version 0.0.0 during the initialization contract stage.`);
    }

    if (packageJson.license !== 'MIT') {
      issues.push(`${expected.directory} must declare the MIT license.`);
    }

    if (packageJson.engines?.node !== '>=22.0.0') {
      issues.push(`${expected.directory} must declare Node.js >=22.0.0.`);
    }
  }

  return issues;
}
