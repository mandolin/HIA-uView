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
  // <lang><zh-CN>收集只读契约检查的全部问题，避免首个缺口掩盖其他语言、路径或隐私问题。</zh-CN><en>Collects every issue from the read-only contract check so the first gap cannot hide other language, path, or privacy problems.</en></lang>
  const issues = await validateDocumentationContract();

  if (issues.length > 0) {
    // <lang><zh-CN>将路径和原因格式化为稳定的逐行诊断；不输出源码正文、绝对路径或私有工作区资料。</zh-CN><en>Formats paths and reasons as stable line diagnostics without outputting source body, absolute paths, or private workspace material.</en></lang>
    const detail = issues.map((issue) => `- ${issue.path}: ${issue.message}`).join('\n');
    throw new Error(`HIA-uView documentation contract failed:\n${detail}`);
  }
}

await runDocumentationCheck();
console.log('HIA-uView bilingual documentation contract passed.');
