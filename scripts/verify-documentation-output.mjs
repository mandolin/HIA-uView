import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

/**
 * @module verify-documentation-output
 * @lang zh-CN 校验 HIA JSDoc integration 生成物没有源码片段、绝对路径或 `sourcesContent`，使临时文档输出遵守默认隐私边界。
 * @lang en Validates that the HIA JSDoc integration artifact contains no source fragments, absolute paths, or `sourcesContent`, keeping temporary documentation output within the default privacy boundary.
 */

/**
 * @lang zh-CN HIA integration 输出的仓库相对路径；该文件只在 `docs:api` 成功后存在，且由 Git 忽略。
 * @lang en Repository-relative path of the HIA integration output; the file exists only after a successful `docs:api` run and is ignored by Git.
 */
const integrationOutputPath = 'temp/documentation/jsdoc/hia-integration.json';

/**
 * @lang zh-CN 判断字符串是否包含 Windows/UNC/POSIX 绝对路径或路径遍历片段。
 * @lang en Determines whether a string contains a Windows, UNC, or POSIX absolute path or a path-traversal segment.
 * @param {string} value <lang><zh-CN>待检查字符串。</zh-CN><en>String to inspect.</en></lang>
 * @returns {boolean} <lang><zh-CN>若字符串含不安全路径形式则为 `true`。</zh-CN><en>`true` when the string contains an unsafe path form.</en></lang>
 */
function hasUnsafePath(value) {
  // <lang><zh-CN>只用固定正则识别可能泄露宿主位置或逃出预期相对路径的字符串；不尝试解析、访问或规范化该路径。</zh-CN><en>Uses fixed regular expressions only to recognize strings that may leak host location or escape an expected relative path; does not parse, access, or normalize the path.</en></lang>
  return /^[A-Za-z]:[\\/]/.test(value)
    || /^\\\\/.test(value)
    || /(?:^|[\\/])\.\.(?:[\\/]|$)/.test(value)
    || /file:\/\//i.test(value);
}

/**
 * @lang zh-CN 递归检查 integration 值，收集源码嵌入、绝对路径和 `sourcesContent` 违规。
 * @lang en Recursively checks integration values and collects source embedding, absolute path, and `sourcesContent` violations.
 * @param {unknown} value <lang><zh-CN>当前 JSON 值。</zh-CN><en>Current JSON value.</en></lang>
 * @param {string} path <lang><zh-CN>用于诊断的 JSON 路径。</zh-CN><en>JSON path used in diagnostics.</en></lang>
 * @param {string[]} issues <lang><zh-CN>可变问题收集器。</zh-CN><en>Mutable issue collector.</en></lang>
 * @returns {void} <lang><zh-CN>不返回值；问题会追加到 `issues`。</zh-CN><en>Does not return a value; appends issues to `issues`.</en></lang>
 */
function inspectIntegrationValue(value, path, issues) {
  // <lang><zh-CN>数组元素沿带索引的诊断路径递归检查，保留每个可能泄露位置的可定位信息。</zh-CN><en>Recursively checks array items along indexed diagnostic paths, retaining locatable information for each potential leak.</en></lang>
  if (Array.isArray(value)) {
    value.forEach((item, index) => inspectIntegrationValue(item, `${path}[${index}]`, issues));
    return;
  }

  // <lang><zh-CN>对象只按自身可枚举 JSON 值递归；不会调用 getter、导入 module 或执行生成链代码。</zh-CN><en>Objects recurse only through their own enumerable JSON values and never call getters, import modules, or execute generation-chain code.</en></lang>
  if (value && typeof value === 'object') {
    for (const [key, nestedValue] of Object.entries(value)) {
      // <lang><zh-CN>为子值构造 JSON-style 诊断路径，而不是在错误中写入本机文件系统路径。</zh-CN><en>Builds a JSON-style diagnostic path for the child value rather than writing a local filesystem path in errors.</en></lang>
      const nestedPath = `${path}.${key}`;

      // <lang><zh-CN>sourcesContent 一旦含真值即表示源正文泄露，必须独立报告后继续检查嵌套值。</zh-CN><en>A truthy sourcesContent indicates source-body leakage and must be reported independently before nested values continue being checked.</en></lang>
      if (key === 'sourcesContent' && nestedValue) {
        issues.push(`${nestedPath} must not embed source content.`);
      }

      inspectIntegrationValue(nestedValue, nestedPath, issues);
    }

    return;
  }

  // <lang><zh-CN>只有字符串才可能匹配路径泄露模式；数字、布尔和 null 保持无副作用地跳过。</zh-CN><en>Only strings can match path-leakage patterns; numbers, booleans, and null skip without side effects.</en></lang>
  if (typeof value === 'string' && hasUnsafePath(value)) {
    issues.push(`${path} contains an unsafe absolute or traversal path.`);
  }
}

/**
 * @lang zh-CN 读取并验证已经生成的 HIA integration JSON，拒绝意外的源码片段和路径泄露。
 * @lang en Reads and validates the generated HIA integration JSON, rejecting unexpected source fragments and path leakage.
 * @param {string} [rootDirectory=process.cwd()] <lang><zh-CN>仓库绝对根目录。</zh-CN><en>Absolute repository root directory.</en></lang>
 * @returns {Promise<string[]>} <lang><zh-CN>输出隐私问题列表；空数组表示通过。</zh-CN><en>Output-privacy issue list; an empty array means validation passed.</en></lang>
 */
export async function validateDocumentationOutput(rootDirectory = process.cwd()) {
  // <lang><zh-CN>读取固定临时 integration 输出；此函数不生成它，也不接受调用方给出的输出路径。</zh-CN><en>Reads fixed temporary integration output; this function does not generate it and accepts no caller-supplied output path.</en></lang>
  const content = await readFile(resolve(rootDirectory, integrationOutputPath), 'utf8');

  // <lang><zh-CN>将纯 JSON 解析为可检查对象；损坏生成物须显式失败，不能被当作隐私合格。</zh-CN><en>Parses plain JSON into an inspectable object; malformed output must fail explicitly and cannot be treated as privacy-compliant.</en></lang>
  const output = JSON.parse(content);

  // <lang><zh-CN>累积 contract、source-fragment 和路径问题，保持一次运行可修复的完整诊断。</zh-CN><en>Accumulates contract, source-fragment, and path issues, retaining a complete repairable diagnosis in one run.</en></lang>
  const issues = [];

  // <lang><zh-CN>输出 contract 是消费者理解 privacy profile 的固定标识，不允许被普通 JSON 替代。</zh-CN><en>The output contract is the fixed identifier by which consumers understand the privacy profile and cannot be replaced by ordinary JSON.</en></lang>
  if (output.contract !== 'hia-jsdoc-integration') {
    issues.push('Integration output must declare the hia-jsdoc-integration contract.');
  }

  // <lang><zh-CN>mode 必须保持 integration 专用模式，避免同一路径被非隐私输出格式复用。</zh-CN><en>Mode must retain the integration-specific mode, preventing the same path from being reused by a non-private output format.</en></lang>
  if (output.mode !== 'hiaIntegration') {
    issues.push('Integration output must use hiaIntegration mode.');
  }

  // <lang><zh-CN>顶层 sourceFragments 若非空即是源码嵌入，不因节点级检查通过而豁免。</zh-CN><en>A non-empty top-level sourceFragments is source embedding and is not excused by passing node-level checks.</en></lang>
  if (Array.isArray(output.sourceFragments) && output.sourceFragments.length > 0) {
    issues.push('Integration output must not contain source fragments in the default privacy profile.');
  }

  for (const node of output.ir?.nodes || []) {
    // <lang><zh-CN>节点 source 缺失时使用空对象，只检查 output 自己声明的 metadata，不读取源文件补齐信息。</zh-CN><en>Uses an empty object when node source is absent and checks only output-declared metadata, never reading source files to fill information.</en></lang>
    const source = node.source || {};

    // <lang><zh-CN>primaryBlock 或 fragments 表明节点嵌入了源码正文/片段，必须逐节点报告。</zh-CN><en>PrimaryBlock or fragments indicates that a node embeds source body/fragment and must be reported per node.</en></lang>
    if (source.primaryBlock || (Array.isArray(source.fragments) && source.fragments.length > 0)) {
      issues.push(`Integration node ${node.id} must not embed a primary block or source fragment.`);
    }
  }

  // <lang><zh-CN>最后递归检查所有 JSON 值，覆盖 contract-specific 检查未触及的任意路径和 sourcesContent 位置。</zh-CN><en>Finally recursively checks every JSON value, covering arbitrary path and sourcesContent locations not reached by contract-specific checks.</en></lang>
  inspectIntegrationValue(output, '$', issues);
  return issues;
}

/**
 * @lang zh-CN 执行生成物隐私检查，并在存在问题时以非零状态终止。
 * @lang en Executes generated-output privacy validation and terminates with a non-zero status when issues exist.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；验证失败时抛出错误。</zh-CN><en>Resolves without a value and throws when validation fails.</en></lang>
 */
async function runOutputCheck() {
  // <lang><zh-CN>执行纯读取 privacy contract，收集问题而不删除、重写或上传生成输出。</zh-CN><en>Executes the read-only privacy contract and collects issues without deleting, rewriting, or uploading generated output.</en></lang>
  const issues = await validateDocumentationOutput();

  if (issues.length > 0) {
    // <lang><zh-CN>把问题格式化为稳定文本，避免错误信息回显 integration JSON 的完整内容。</zh-CN><en>Formats issues as stable text, avoiding an error message that echoes the full integration JSON content.</en></lang>
    throw new Error(`HIA-uView documentation output failed:\n${issues.map((issue) => `- ${issue}`).join('\n')}`);
  }
}

await runOutputCheck();
console.log('HIA-uView documentation output privacy check passed.');
