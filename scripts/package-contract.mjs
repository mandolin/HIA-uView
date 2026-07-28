import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const expectedWorkspacePackages = ['HIA-uView-UI', 'HIA-uView-Tool'];

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
 * 中文：读取并解析指定根目录下的 JSON 文件，供 workspace 契约校验使用。
 * English: Read and parse a JSON file under the supplied root directory for workspace-contract validation.
 * @param {string} rootDirectory 仓库根目录。 / Repository root directory.
 * @param {string} relativePath 仓库内相对 JSON 路径。 / Relative JSON path inside the repository.
 * @returns {Promise<Record<string, unknown>>} 已解析的 JSON 对象。 / Parsed JSON object.
 */
async function readJson(rootDirectory, relativePath) {
  const content = await readFile(resolve(rootDirectory, relativePath), 'utf8');
  return JSON.parse(content);
}

/**
 * 中文：比较两个字符串数组是否按相同顺序包含相同元素，避免 workspace 列表发生未记录漂移。
 * English: Compare two string arrays for identical ordered elements so the workspace list cannot drift without a record.
 * @param {unknown} actual 待校验值。 / Value to validate.
 * @param {string[]} expected 预期数组。 / Expected array.
 * @returns {boolean} 是否完全一致。 / Whether the arrays are identical.
 */
function hasExpectedStrings(actual, expected) {
  return Array.isArray(actual)
    && actual.length === expected.length
    && actual.every((value, index) => value === expected[index]);
}

/**
 * 中文：校验 HIA-uView 根 workspace 及 UI/Tool 包的初始化期公开契约；本函数不加载 UI 运行时或第三方依赖。
 * English: Validate the initialization-stage public contract of the HIA-uView root workspace and UI/Tool packages; this function does not load a UI runtime or third-party dependency.
 * @param {string} [rootDirectory=process.cwd()] 仓库根目录。 / Repository root directory.
 * @returns {Promise<string[]>} 契约问题列表；空数组表示校验通过。 / Contract issue list; an empty array means validation passed.
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
