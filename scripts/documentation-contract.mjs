import { readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';

/**
 * @module documentation-contract
 * @lang zh-CN 校验 HIA-uView 的 Documentation Sys 配置和受管 JavaScript 文档块，防止新增实现绕过中英双语注释基线。
 * @lang en Validates the HIA-uView Documentation Sys configuration and governed JavaScript documentation blocks so new implementation cannot bypass the bilingual-comment baseline.
 */

/**
 * @typedef {object} DocumentationIssue
 * @property {string} path <lang><zh-CN>仓库内相对路径。</zh-CN><en>Repository-relative path.</en></lang>
 * @property {string} message <lang><zh-CN>可操作的契约问题说明。</zh-CN><en>Actionable contract-issue description.</en></lang>
 * @lang zh-CN 表示一个可定位、可操作的 Documentation Sys 契约问题。
 * @lang en Represents one locatable and actionable Documentation Sys contract issue.
 */

/**
 * @lang zh-CN 受 Documentation Sys 门禁管理的源码根目录；不存在的未来运行时目录不视为错误，但一旦出现就会进入检查。
 * @lang en Source roots governed by the Documentation Sys gate; absent future runtime directories are not errors, but they become checked as soon as they exist.
 */
const governedSourceRoots = [
  'scripts',
  'tests',
  'HIA-uView-UI/src',
  'HIA-uView-Tool/src'
];

/**
 * @lang zh-CN 判断相对路径是否位于当前文档门禁的受管源码根目录内。
 * @lang en Determines whether a relative path is inside a source root governed by the current documentation gate.
 * @param {string} relativePath <lang><zh-CN>使用正斜杠表示的仓库相对路径。</zh-CN><en>Repository-relative path expressed with forward slashes.</en></lang>
 * @returns {boolean} <lang><zh-CN>若路径受门禁管理则为 `true`。</zh-CN><en>`true` when the path is governed by the gate.</en></lang>
 */
function isGovernedPath(relativePath) {
  return governedSourceRoots.some((sourceRoot) => (
    relativePath === sourceRoot || relativePath.startsWith(`${sourceRoot}/`)
  ));
}

/**
 * @lang zh-CN 递归列出存在的受管源码文件；不读取 `node_modules` 或生成文档目录。
 * @lang en Recursively lists existing governed source files without reading `node_modules` or generated documentation directories.
 * @param {string} directory <lang><zh-CN>待扫描的绝对目录。</zh-CN><en>Absolute directory to scan.</en></lang>
 * @param {string} rootDirectory <lang><zh-CN>仓库绝对根目录。</zh-CN><en>Absolute repository root directory.</en></lang>
 * @returns {Promise<string[]>} <lang><zh-CN>排序后的绝对受管源码文件路径。</zh-CN><en>Sorted absolute governed source-file paths.</en></lang>
 */
async function listGovernedSourceFiles(directory, rootDirectory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = join(directory, entry.name);
    const relativePath = relative(rootDirectory, absolutePath).split(sep).join('/');

    if (!isGovernedPath(relativePath) || entry.name === 'node_modules' || entry.name === 'temp') {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...await listGovernedSourceFiles(absolutePath, rootDirectory));
      continue;
    }

    if (entry.isFile() && /\.(?:mjs|js|css|scss|vue)$/.test(entry.name)) {
      files.push(absolutePath);
    }
  }

  return files.sort();
}

/**
 * @lang zh-CN 检查单个 JSDoc 块是否同时给出 Documentation Sys 规定的中文和英文主描述。
 * @lang en Checks whether one JSDoc block supplies both Chinese and English primary descriptions required by Documentation Sys.
 * @param {string} block <lang><zh-CN>原始 JSDoc 注释块。</zh-CN><en>Raw JSDoc comment block.</en></lang>
 * @param {string} relativePath <lang><zh-CN>用于诊断的仓库相对路径。</zh-CN><en>Repository-relative path used in diagnostics.</en></lang>
 * @returns {DocumentationIssue[]} <lang><zh-CN>该块产生的契约问题。</zh-CN><en>Contract issues produced by the block.</en></lang>
 */
function validateJsdocBlock(block, relativePath) {
  const issues = [];

  if (!block.includes('@lang zh-CN')) {
    issues.push({
      path: relativePath,
      message: 'Every JSDoc block must include @lang zh-CN.'
    });
  }

  if (!block.includes('@lang en')) {
    issues.push({
      path: relativePath,
      message: 'Every JSDoc block must include @lang en.'
    });
  }

  for (const tagName of ['param', 'returns', 'property']) {
    const taggedLines = block.split(/\r?\n/).filter((line) => line.includes(`@${tagName}`));

    for (const taggedLine of taggedLines) {
      if (!taggedLine.includes('<lang>') || !taggedLine.includes('<zh-CN>') || !taggedLine.includes('<en>')) {
        issues.push({
          path: relativePath,
          message: `@${tagName} descriptions must use inline <lang> with zh-CN and en values.`
        });
      }
    }
  }

  return issues;
}

/**
 * @lang zh-CN 校验 HIA JSDoc 配置的依赖、隐私与双语 locale 约束。
 * @lang en Validates dependency, privacy, and bilingual-locale constraints in the HIA JSDoc configuration.
 * @param {string} rootDirectory <lang><zh-CN>仓库绝对根目录。</zh-CN><en>Absolute repository root directory.</en></lang>
 * @returns {Promise<DocumentationIssue[]>} <lang><zh-CN>配置问题列表。</zh-CN><en>Configuration-issue list.</en></lang>
 */
async function validateJsdocConfiguration(rootDirectory) {
  const relativePath = 'docs/jsdoc.config.json';
  const content = await readFile(resolve(rootDirectory, relativePath), 'utf8');
  const config = JSON.parse(content);
  const hia = config.opts?.hia;
  const issues = [];

  if (!config.plugins?.includes('node_modules/@mandolin/jsdoc-plugin-hia-sys/src/index.cjs')) {
    issues.push({ path: relativePath, message: 'The HIA JSDoc plugin must be explicitly configured.' });
  }

  if (config.opts?.template !== 'node_modules/@mandolin/jsdoc-theme-hia') {
    issues.push({ path: relativePath, message: 'The HIA JSDoc theme must be explicitly configured.' });
  }

  if (hia?.i18n?.defaultLocale !== 'zh-CN' || hia?.i18n?.fallbackLocale !== 'en') {
    issues.push({ path: relativePath, message: 'Documentation locales must use zh-CN with en fallback.' });
  }

  if (JSON.stringify(hia?.i18n?.locales) !== JSON.stringify(['zh-CN', 'en'])) {
    issues.push({ path: relativePath, message: 'Documentation locales must be exactly zh-CN and en.' });
  }

  if (hia?.integration?.enabled !== true || hia.integration.outputFile !== 'temp/documentation/jsdoc/hia-integration.json') {
    issues.push({ path: relativePath, message: 'HIA integration output must be enabled at the documented temporary path.' });
  }

  if (hia?.source?.link?.enabled !== false || hia?.source?.preview?.enabled !== false) {
    issues.push({ path: relativePath, message: 'Source links and previews must remain disabled until an explicit public-source policy is approved.' });
  }

  if (hia?.microPlugins?.includes('code-fragment')) {
    issues.push({ path: relativePath, message: 'The code-fragment micro-plugin must stay disabled because this baseline does not embed source content.' });
  }

  return issues;
}

/**
 * @lang zh-CN 校验受管源码均有与其语言对应、可被 HIA Documentation Sys 识别的中英双语文档块。
 * @lang en Validates that every governed source file has bilingual documentation blocks appropriate to its language and recognizable by HIA Documentation Sys.
 * @param {string} rootDirectory <lang><zh-CN>仓库绝对根目录。</zh-CN><en>Absolute repository root directory.</en></lang>
 * @returns {Promise<DocumentationIssue[]>} <lang><zh-CN>源码文档问题列表。</zh-CN><en>Source-documentation issue list.</en></lang>
 */
async function validateGovernedSource(rootDirectory) {
  const files = [];

  for (const sourceRoot of governedSourceRoots) {
    const absoluteRoot = resolve(rootDirectory, sourceRoot);

    try {
      files.push(...await listGovernedSourceFiles(absoluteRoot, rootDirectory));
    } catch (error) {
      if (error && error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  const issues = [];

  for (const absolutePath of files) {
    const relativePath = relative(rootDirectory, absolutePath).split(sep).join('/');
    const content = await readFile(absolutePath, 'utf8');
    const blocks = [
      ...(content.match(/\/\*\*[\s\S]*?\*\//g) || []),
      ...(absolutePath.endsWith('.vue') ? (content.match(/<!--[\s\S]*?-->/g) || []) : [])
    ];

    if (blocks.length === 0) {
      issues.push({
        path: relativePath,
        message: 'Governed source files must contain at least one bilingual language-appropriate documentation block.'
      });
      continue;
    }

    for (const block of blocks) {
      issues.push(...validateJsdocBlock(block, relativePath));
    }
  }

  return issues;
}

/**
 * @lang zh-CN 汇总 Documentation Sys 配置与受管 JavaScript 的所有可操作问题，不写入文件或生成物。
 * @lang en Collects all actionable issues from the Documentation Sys configuration and governed JavaScript without writing files or generated artifacts.
 * @param {string} [rootDirectory=process.cwd()] <lang><zh-CN>仓库绝对根目录。</zh-CN><en>Absolute repository root directory.</en></lang>
 * @returns {Promise<DocumentationIssue[]>} <lang><zh-CN>按来源分组前的问题列表；空数组表示当前文档门禁通过。</zh-CN><en>Issue list before source grouping; an empty array means the current documentation gate passes.</en></lang>
 */
export async function validateDocumentationContract(rootDirectory = process.cwd()) {
  const configurationIssues = await validateJsdocConfiguration(rootDirectory);
  const sourceIssues = await validateGovernedSource(rootDirectory);
  return [...configurationIssues, ...sourceIssues];
}
