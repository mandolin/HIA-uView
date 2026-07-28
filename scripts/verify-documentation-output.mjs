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
  if (Array.isArray(value)) {
    value.forEach((item, index) => inspectIntegrationValue(item, `${path}[${index}]`, issues));
    return;
  }

  if (value && typeof value === 'object') {
    for (const [key, nestedValue] of Object.entries(value)) {
      const nestedPath = `${path}.${key}`;

      if (key === 'sourcesContent' && nestedValue) {
        issues.push(`${nestedPath} must not embed source content.`);
      }

      inspectIntegrationValue(nestedValue, nestedPath, issues);
    }

    return;
  }

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
  const content = await readFile(resolve(rootDirectory, integrationOutputPath), 'utf8');
  const output = JSON.parse(content);
  const issues = [];

  if (output.contract !== 'hia-jsdoc-integration') {
    issues.push('Integration output must declare the hia-jsdoc-integration contract.');
  }

  if (output.mode !== 'hiaIntegration') {
    issues.push('Integration output must use hiaIntegration mode.');
  }

  if (Array.isArray(output.sourceFragments) && output.sourceFragments.length > 0) {
    issues.push('Integration output must not contain source fragments in the default privacy profile.');
  }

  for (const node of output.ir?.nodes || []) {
    const source = node.source || {};

    if (source.primaryBlock || (Array.isArray(source.fragments) && source.fragments.length > 0)) {
      issues.push(`Integration node ${node.id} must not embed a primary block or source fragment.`);
    }
  }

  inspectIntegrationValue(output, '$', issues);
  return issues;
}

/**
 * @lang zh-CN 执行生成物隐私检查，并在存在问题时以非零状态终止。
 * @lang en Executes generated-output privacy validation and terminates with a non-zero status when issues exist.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；验证失败时抛出错误。</zh-CN><en>Resolves without a value and throws when validation fails.</en></lang>
 */
async function runOutputCheck() {
  const issues = await validateDocumentationOutput();

  if (issues.length > 0) {
    throw new Error(`HIA-uView documentation output failed:\n${issues.map((issue) => `- ${issue}`).join('\n')}`);
  }
}

await runOutputCheck();
console.log('HIA-uView documentation output privacy check passed.');
