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
  // <lang><zh-CN>仅读取当前白名单目录的 entry 元数据，不执行任何源码或读取 node_modules 依赖图。</zh-CN><en>Reads entry metadata only from the current allowlisted directory and executes no source or node_modules dependency graph.</en></lang>
  const entries = await readdir(directory, { withFileTypes: true });

  // <lang><zh-CN>收集相对于当前调用的绝对文件路径，最终统一排序以保持诊断与测试顺序稳定。</zh-CN><en>Collects absolute file paths relative to the current call and sorts them at the end to keep diagnostics and test order stable.</en></lang>
  const files = [];

  for (const entry of entries) {
    // <lang><zh-CN>从当前 directory 与 entry 名字构造路径，不接受来自受检文件内容的路径输入。</zh-CN><en>Builds the path from current directory and entry name and accepts no path input from inspected file content.</en></lang>
    const absolutePath = join(directory, entry.name);

    // <lang><zh-CN>把平台分隔符规范为正斜杠，只用于受管根判断与稳定报告。</zh-CN><en>Normalizes platform separators to forward slashes solely for governed-root checks and stable reporting.</en></lang>
    const relativePath = relative(rootDirectory, absolutePath).split(sep).join('/');

    // <lang><zh-CN>跳过不在白名单内的路径和可能递归膨胀/包含私有生成物的目录。</zh-CN><en>Skips paths outside the allowlist and directories that could recursively expand or contain private generated material.</en></lang>
    if (!isGovernedPath(relativePath) || entry.name === 'node_modules' || entry.name === 'temp') {
      continue;
    }

    // <lang><zh-CN>只在受管目录内递归，保留同一 rootDirectory 以防相对路径判断漂移。</zh-CN><en>Recurses only inside governed directories and retains the same rootDirectory so relative-path checks cannot drift.</en></lang>
    if (entry.isDirectory()) {
      files.push(...await listGovernedSourceFiles(absolutePath, rootDirectory));
      continue;
    }

    // <lang><zh-CN>仅把可注释源码扩展名加入门禁；JSON/YAML 等不支持注释的配置由外部 schema/contract 管理。</zh-CN><en>Adds only comment-capable source extensions to the gate; JSON/YAML and other non-commentable configuration is governed through external schema/contract.</en></lang>
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
  // <lang><zh-CN>为当前注释块累积所有语言和字段说明问题，避免一个缺失 tag 遮蔽其他修订项。</zh-CN><en>Accumulates every language and field-description issue for the current comment block so one missing tag cannot hide other repairs.</en></lang>
  const issues = [];

  // <lang><zh-CN>主中文 tag 是 Documentation Sys 双语主描述的不可省略部分。</zh-CN><en>The primary Chinese tag is an indispensable part of the Documentation Sys bilingual primary description.</en></lang>
  if (!block.includes('@lang zh-CN')) {
    issues.push({
      path: relativePath,
      message: 'Every JSDoc block must include @lang zh-CN.'
    });
  }

  // <lang><zh-CN>主英文 tag 与中文 tag 同时要求，不能由 fallback 或普通翻译文字替代。</zh-CN><en>The primary English tag is required together with the Chinese tag and cannot be replaced by fallback or ordinary translated prose.</en></lang>
  if (!block.includes('@lang en')) {
    issues.push({
      path: relativePath,
      message: 'Every JSDoc block must include @lang en.'
    });
  }

  // <lang><zh-CN>仅检查拥有字段说明语义的标准 tag，避免把任意 `@` 文字误当成 API 文档字段。</zh-CN><en>Checks only standard tags that carry field-description semantics, avoiding treating arbitrary `@` text as an API documentation field.</en></lang>
  for (const tagName of ['param', 'returns', 'property']) {
    // <lang><zh-CN>提取当前 tag 的行，不解析或执行注释内容。</zh-CN><en>Extracts lines for the current tag without parsing or executing comment content.</en></lang>
    const taggedLines = block.split(/\r?\n/).filter((line) => line.includes(`@${tagName}`));

    for (const taggedLine of taggedLines) {
      // <lang><zh-CN>字段描述必须包含一个完整 inline lang 表面，确保中文/英文值可由既有 profile 区分。</zh-CN><en>Field descriptions must contain one complete inline lang surface so existing profiles can distinguish Chinese and English values.</en></lang>
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
  // <lang><zh-CN>配置路径固定在仓内 docs 目录，避免文档门禁从参数或环境变量接受任意 JSON。</zh-CN><en>The configuration path is fixed inside repository docs, preventing the documentation gate from accepting arbitrary JSON through parameters or environment variables.</en></lang>
  const relativePath = 'docs/jsdoc.config.json';

  // <lang><zh-CN>读取原始 JSON 文本后解析，I/O 或 JSON 失败由调用方以非零失败暴露，而不是静默降级。</zh-CN><en>Reads raw JSON text before parsing; I/O or JSON failure surfaces as caller failure rather than silently degrading.</en></lang>
  const content = await readFile(resolve(rootDirectory, relativePath), 'utf8');
  const config = JSON.parse(content);

  // <lang><zh-CN>提取 HIA 专属选项以便后续检查不重复穿透可选链。</zh-CN><en>Extracts HIA-specific options so subsequent checks need not repeatedly traverse optional chains.</en></lang>
  const hia = config.opts?.hia;

  // <lang><zh-CN>收集配置偏差而不是在首个偏差时失败，便于一次修正 plugin、locale 与隐私边界。</zh-CN><en>Collects configuration drift instead of failing at the first deviation so plugin, locale, and privacy boundaries can be repaired together.</en></lang>
  const issues = [];

  // <lang><zh-CN>插件路径须显式且锁定，确保 JSDoc output 使用项目已审计的 Documentation Sys integration。</zh-CN><en>The plugin path must be explicit and locked so JSDoc output uses the project-audited Documentation Sys integration.</en></lang>
  if (!config.plugins?.includes('node_modules/@mandolin/jsdoc-plugin-hia-sys/src/index.cjs')) {
    issues.push({ path: relativePath, message: 'The HIA JSDoc plugin must be explicitly configured.' });
  }

  // <lang><zh-CN>主题路径同样必须显式，避免包默认主题或未审计模板悄然改变公开文档外观。</zh-CN><en>The theme path must likewise be explicit, preventing a package default theme or unreviewed template from silently changing public documentation appearance.</en></lang>
  if (config.opts?.template !== 'node_modules/@mandolin/jsdoc-theme-hia') {
    issues.push({ path: relativePath, message: 'The HIA JSDoc theme must be explicitly configured.' });
  }

  // <lang><zh-CN>默认/回退 locale 的顺序是项目双语输出约定，不随 host locale 或环境变量变化。</zh-CN><en>The default/fallback locale order is the project bilingual-output convention and does not vary with host locale or environment variables.</en></lang>
  if (hia?.i18n?.defaultLocale !== 'zh-CN' || hia?.i18n?.fallbackLocale !== 'en') {
    issues.push({ path: relativePath, message: 'Documentation locales must use zh-CN with en fallback.' });
  }

  // <lang><zh-CN>locale 集合必须严格为两项，避免未审查语言资源或术语 registry 被配置意外启用。</zh-CN><en>The locale set must be exactly two items, preventing unreviewed language resources or terminology registries from being enabled through configuration drift.</en></lang>
  if (JSON.stringify(hia?.i18n?.locales) !== JSON.stringify(['zh-CN', 'en'])) {
    issues.push({ path: relativePath, message: 'Documentation locales must be exactly zh-CN and en.' });
  }

  // <lang><zh-CN>integration 输出仅写入受 Git 忽略的临时相对路径，供后续隐私 gate 检查。</zh-CN><en>Integration output writes only to a Git-ignored temporary relative path for the subsequent privacy gate to inspect.</en></lang>
  if (hia?.integration?.enabled !== true || hia.integration.outputFile !== 'temp/documentation/jsdoc/hia-integration.json') {
    issues.push({ path: relativePath, message: 'HIA integration output must be enabled at the documented temporary path.' });
  }

  // <lang><zh-CN>源码链接与预览会扩大文档输出表面，当前只有在明确公共源码政策后才能开启。</zh-CN><en>Source links and previews expand the documentation-output surface and may open only after an explicit public-source policy exists.</en></lang>
  if (hia?.source?.link?.enabled !== false || hia?.source?.preview?.enabled !== false) {
    issues.push({ path: relativePath, message: 'Source links and previews must remain disabled until an explicit public-source policy is approved.' });
  }

  // <lang><zh-CN>code-fragment 会嵌入源码内容，当前 privacy baseline 明确禁止该 micro-plugin。</zh-CN><en>Code-fragment embeds source content, and the current privacy baseline explicitly forbids that micro-plugin.</en></lang>
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
  // <lang><zh-CN>汇集所有存在的受管源码文件；缺失的未来目录被允许，以免提前创建空 runtime surface。</zh-CN><en>Collects every existing governed source file; absent future directories are allowed so no empty runtime surface is created prematurely.</en></lang>
  const files = [];

  for (const sourceRoot of governedSourceRoots) {
    // <lang><zh-CN>从固定受管根解析绝对扫描目录，而不读取任意调用方给出的 source root。</zh-CN><en>Resolves the absolute scan directory from a fixed governed root rather than reading any caller-supplied source root.</en></lang>
    const absoluteRoot = resolve(rootDirectory, sourceRoot);

    try {
      // <lang><zh-CN>递归加入当前受管根的可注释源文件；函数本身排除 node_modules 和 temp。</zh-CN><en>Recursively adds comment-capable source files under the current governed root; the function itself excludes node_modules and temp.</en></lang>
      files.push(...await listGovernedSourceFiles(absoluteRoot, rootDirectory));
    } catch (error) {
      // <lang><zh-CN>仅忽略不存在的未来目录；其他 I/O 错误必须向上抛出，防止权限或读取失败被误报为通过。</zh-CN><en>Ignores only absent future directories; every other I/O error must propagate so permission or read failure cannot be misreported as passing.</en></lang>
      if (error && error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  // <lang><zh-CN>为所有文件收集可操作注释问题，保持多个文件失败时的完整可修复诊断。</zh-CN><en>Collects actionable comment issues for every file, retaining complete repairable diagnostics when multiple files fail.</en></lang>
  const issues = [];

  for (const absolutePath of files) {
    // <lang><zh-CN>把当前绝对文件路径转换为稳定的仓内报告路径，不把本机盘符写进错误文本。</zh-CN><en>Converts the current absolute file path to a stable repository report path and never writes local drive letters into error text.</en></lang>
    const relativePath = relative(rootDirectory, absolutePath).split(sep).join('/');

    // <lang><zh-CN>读取源码文本只用于识别注释表面，不解析、导入或执行任何被检查模块。</zh-CN><en>Reads source text only to identify comment surfaces and does not parse, import, or execute any inspected module.</en></lang>
    const content = await readFile(absolutePath, 'utf8');

    // <lang><zh-CN>JavaScript/CSS 使用 JSDoc/CSSDoc 表面，Vue 额外允许 HTML 注释；两者均交给同一双语 tag 检查。</zh-CN><en>JavaScript/CSS use JSDoc/CSSDoc surfaces, while Vue additionally allows HTML comments; both flow to the same bilingual-tag check.</en></lang>
    const blocks = [
      ...(content.match(/\/\*\*[\s\S]*?\*\//g) || []),
      ...(absolutePath.endsWith('.vue') ? (content.match(/<!--[\s\S]*?-->/g) || []) : [])
    ];

    // <lang><zh-CN>没有任何合法文档块即报告当前文件，但继续检查其他文件以保留完整问题列表。</zh-CN><en>Reports the current file when it has no legal documentation block but continues checking others to retain a complete issue list.</en></lang>
    if (blocks.length === 0) {
      issues.push({
        path: relativePath,
        message: 'Governed source files must contain at least one bilingual language-appropriate documentation block.'
      });
      continue;
    }

    for (const block of blocks) {
      // <lang><zh-CN>每个匹配 block 独立验证，避免一个合格 module 注释掩盖同文件坏的函数注释。</zh-CN><en>Validates each matched block independently so one valid module comment cannot hide a bad function comment in the same file.</en></lang>
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
  // <lang><zh-CN>先检查固定配置，再扫描受管源码；两组问题保持来源独立，便于维护者判定修复范围。</zh-CN><en>Checks fixed configuration first and then scans governed source; the two issue groups retain distinct origins so maintainers can determine repair scope.</en></lang>
  const configurationIssues = await validateJsdocConfiguration(rootDirectory);

  // <lang><zh-CN>源码问题在配置合格与否之外仍要收集，以免一个配置偏差隐藏新增文件的注释债务。</zh-CN><en>Source issues are collected regardless of configuration status so one configuration drift cannot hide comment debt in a newly added file.</en></lang>
  const sourceIssues = await validateGovernedSource(rootDirectory);

  // <lang><zh-CN>返回新数组而非共享可变集合，使调用方只能读取诊断并自行决定是否失败。</zh-CN><en>Returns a new array rather than a shared mutable collection so callers can only read diagnostics and independently decide whether to fail.</en></lang>
  return [...configurationIssues, ...sourceIssues];
}
