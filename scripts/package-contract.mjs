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
 * @lang zh-CN 当前实现阶段禁止 UI 与 Tool 包声明运行时 dependencies，确保编译 fixture 和开发期 Tool 不会被消费者隐式携带。
 * @lang en Runtime dependencies are forbidden in the current implementation stage for UI and Tool packages so consumers cannot implicitly carry the compiler fixture or development-time Tool.
 */
const packagesWithoutRuntimeDependencies = new Set(['@hia-uview/ui', '@hia-uview/tool']);

/**
 * @lang zh-CN UI 私有 runtime entry 在当前实现阶段必须公开的 source export 映射；这些映射不是已发布的 semver 兼容性承诺。
 * @lang en Source export mappings that the private UI runtime entry must expose in the current implementation stage; these mappings are not a published semver compatibility commitment.
 */
const expectedUiExports = {
  '.': './src/index.mjs',
  './style.css': './src/style.css',
  './theme/hia-light.css': './src/theme/hia-light.css'
};

/**
 * @lang zh-CN 发布候选阶段每个公开 workspace 必须随包携带的许可证文件及其最小识别文本。
 * @lang en Package-local license files and their minimum identifying text that every public workspace must carry during release-candidate preparation.
 */
const expectedPackageLicenseFiles = [
  {
    directory: 'HIA-uView-UI',
    relativePath: 'LICENSE',
    requiredText: 'MIT License'
  },
  {
    directory: 'HIA-uView-Tool',
    relativePath: 'LICENSE',
    requiredText: 'MIT License'
  }
];

/**
 * @lang zh-CN UI 子包必须忽略的本地 compile-fixture 目录和仅供 compiler 输入根使用的 adapter 文件，避免受控开发期材料进入未来发布包。
 * @lang en Local compile-fixture directory and compiler-input-root adapter files that the UI subpackage must ignore so controlled development material cannot enter a future release package.
 */
const requiredUiNpmIgnoreRules = ['fixtures/', 'manifest.json', 'pages.json', 'main.js'];

/**
 * @lang zh-CN 读取并解析指定根目录下的 JSON 文件，供 workspace 契约校验使用。
 * @lang en Reads and parses a JSON file under the supplied root directory for workspace-contract validation.
 * @param {string} rootDirectory <lang><zh-CN>仓库根目录。</zh-CN><en>Repository root directory.</en></lang>
 * @param {string} relativePath <lang><zh-CN>仓库内相对 JSON 路径。</zh-CN><en>Relative JSON path inside the repository.</en></lang>
 * @returns {Promise<Record<string, unknown>>} <lang><zh-CN>已解析的 JSON 对象。</zh-CN><en>Parsed JSON object.</en></lang>
 */
async function readJson(rootDirectory, relativePath) {
  // <lang><zh-CN>读取原始文本后才解析 JSON，便于由调用方获得一致的 I/O 失败语义。</zh-CN><en>Read the raw text before parsing JSON so callers receive consistent I/O failure semantics.</en></lang>
  const content = await readFile(resolve(rootDirectory, relativePath), 'utf8');
  return JSON.parse(content);
}

/**
 * @lang zh-CN 读取包内文本文件；缺失、不可读或不含要求文本时返回 false，而不是让契约门禁因异常中断。
 * @lang en Reads a package-local text file; returns false for a missing, unreadable, or nonconforming file instead of aborting the contract gate with an exception.
 * @param {string} rootDirectory <lang><zh-CN>仓库根目录。</zh-CN><en>Repository root directory.</en></lang>
 * @param {string} relativePath <lang><zh-CN>仓库内相对文件路径。</zh-CN><en>Relative file path inside the repository.</en></lang>
 * @param {string} requiredText <lang><zh-CN>文件必须包含的最小识别文本。</zh-CN><en>Minimum identifying text that the file must contain.</en></lang>
 * @returns {Promise<boolean>} <lang><zh-CN>文件可读且满足最小文本要求时为 true。</zh-CN><en>True when the file is readable and contains the required text.</en></lang>
 */
async function hasRequiredText(rootDirectory, relativePath, requiredText) {
  try {
    // <lang><zh-CN>许可证和忽略规则都是纯文本契约，不加载或执行其内容。</zh-CN><en>License and ignore rules are plain-text contracts, so their content is never loaded or executed.</en></lang>
    const content = await readFile(resolve(rootDirectory, relativePath), 'utf8');
    return content.includes(requiredText);
  } catch {
    // <lang><zh-CN>契约函数以问题列表报告缺失文件，保留其他包契约的完整诊断。</zh-CN><en>The contract function reports a missing file through its issue list so the remaining package contracts still receive a complete diagnosis.</en></lang>
    return false;
  }
}

/**
 * @lang zh-CN 读取 `.npmignore` 的有效规则集合；空行和注释不构成可执行忽略规则。
 * @lang en Reads the effective rule set of an `.npmignore`; blank lines and comments are not executable ignore rules.
 * @param {string} rootDirectory <lang><zh-CN>仓库根目录。</zh-CN><en>Repository root directory.</en></lang>
 * @param {string} relativePath <lang><zh-CN>仓库内 `.npmignore` 相对路径。</zh-CN><en>Relative `.npmignore` path inside the repository.</en></lang>
 * @returns {Promise<Set<string> | null>} <lang><zh-CN>有效规则集合；文件不可读时为 null。</zh-CN><en>Effective rule set, or null when the file cannot be read.</en></lang>
 */
async function readNpmIgnoreRules(rootDirectory, relativePath) {
  try {
    // <lang><zh-CN>先拆分平台无关的换行，再标准化空白以便稳定比较单条规则。</zh-CN><en>Split platform-neutral line endings first, then normalize whitespace for stable single-rule comparison.</en></lang>
    const lines = (await readFile(resolve(rootDirectory, relativePath), 'utf8')).split(/\r?\n/u);
    // <lang><zh-CN>保留实际规则并排除注释，避免注释文字意外满足发布边界断言。</zh-CN><en>Keep actual rules while excluding comments so comment text cannot accidentally satisfy a release-boundary assertion.</en></lang>
    return new Set(lines.map((line) => line.trim()).filter((line) => line && !line.startsWith('#')));
  } catch {
    // <lang><zh-CN>调用方将 null 归入问题列表，而不是把缺少 ignore 文件误判为允许打包。</zh-CN><en>The caller turns null into an issue instead of mistaking a missing ignore file for permission to pack its content.</en></lang>
    return null;
  }
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
  // <lang><zh-CN>累积所有可独立修复的契约问题，避免首个问题掩盖后续发布边界。</zh-CN><en>Accumulate independently fixable contract issues so the first failure cannot hide later release boundaries.</en></lang>
  const issues = [];
  // <lang><zh-CN>根 manifest 是 workspace 名称、开发边界和公开子包声明的唯一仓内事实源。</zh-CN><en>The root manifest is the repository-local source of truth for workspace names, development boundaries, and public subpackage declarations.</en></lang>
  const rootPackage = await readJson(rootDirectory, 'package.json');

  if (!hasExpectedStrings(rootPackage.workspaces, expectedWorkspacePackages)) {
    issues.push('Root workspaces must contain only HIA-uView-UI and HIA-uView-Tool in the documented order.');
  }

  for (const expected of expectedPackageMetadata) {
    // <lang><zh-CN>每次循环只读取当前受管理子包，避免由目录枚举引入未登记 package。</zh-CN><en>Read only the currently governed subpackage in each iteration so directory enumeration cannot introduce an unregistered package.</en></lang>
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

    if (packagesWithoutRuntimeDependencies.has(packageJson.name) && Object.keys(packageJson.dependencies ?? {}).length > 0) {
      issues.push(`${expected.directory} must not declare runtime dependencies during the current implementation stage.`);
    }

    if (packageJson.name === '@hia-uview/tool' && packageJson.bin?.['hia-uview-tool'] !== 'src/cli.mjs') {
      issues.push('HIA-uView-Tool must expose only the documented hia-uview-tool CLI entry.');
    }

    if (packageJson.name === '@hia-uview/ui' && JSON.stringify(packageJson.exports) !== JSON.stringify(expectedUiExports)) {
      issues.push('HIA-uView-UI must expose only the documented private runtime and explicit style entries.');
    }
  }

  for (const expectedLicense of expectedPackageLicenseFiles) {
    // <lang><zh-CN>许可证文件必须位于对应 workspace 内，npm pack 才会将其作为包元数据自动携带。</zh-CN><en>The license file must live inside its workspace so npm pack can carry it automatically as package metadata.</en></lang>
    const hasLicense = await hasRequiredText(
      rootDirectory,
      `${expectedLicense.directory}/${expectedLicense.relativePath}`,
      expectedLicense.requiredText
    );

    if (!hasLicense) {
      issues.push(`${expectedLicense.directory} must carry a package-local MIT LICENSE file.`);
    }
  }

  // <lang><zh-CN>UI fixture 与 compiler 输入根 adapter 仅用于受控本地编译，必须由子包自己的 ignore 文件排除；根 ignore 不会继承到子包打包。</zh-CN><en>The UI fixture and compiler-input-root adapter are only for controlled local compilation and must be excluded by the subpackage's own ignore file; a root ignore file is not inherited by subpackage packing.</en></lang>
  const uiIgnoreRules = await readNpmIgnoreRules(rootDirectory, 'HIA-uView-UI/.npmignore');

  for (const requiredRule of requiredUiNpmIgnoreRules) {
    if (uiIgnoreRules === null || !uiIgnoreRules.has(requiredRule)) {
      issues.push(`HIA-uView-UI must exclude its local ${requiredRule} development-only path from package contents.`);
    }
  }

  return issues;
}
