import { validateDocumentationContract } from './documentation-contract.mjs';

/**
 * @module check-documentation
 * @lang zh-CN 运行 HIA-uView 的静态双语 Documentation Sys 门禁；生成文档由后续 npm script 独立执行。
 * @lang en Runs the static bilingual Documentation Sys gate for HIA-uView; a later npm script generates the documentation separately.
 */

/**
 * @lang zh-CN 执行文档契约检查，并在发现问题时以可读列表终止进程。
 * @lang en Executes the documentation-contract check and terminates with a readable list when issues are found.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；问题存在时抛出错误。</zh-CN><en>Resolves without a value and throws when issues exist.</en></lang>
 */
async function runDocumentationCheck() {
  const issues = await validateDocumentationContract();

  if (issues.length > 0) {
    const detail = issues.map((issue) => `- ${issue.path}: ${issue.message}`).join('\n');
    throw new Error(`HIA-uView documentation contract failed:\n${detail}`);
  }
}

await runDocumentationCheck();
console.log('HIA-uView bilingual documentation contract passed.');
