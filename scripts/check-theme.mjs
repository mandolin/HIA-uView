import { validateThemeContract } from './theme-contract.mjs';

/**
 * @module check-theme
 * @lang zh-CN 运行 HIA 默认浅色主题 token 与对比度门禁；该脚本不替代真机触控、读屏或平台语义验证。
 * @lang en Runs the HIA default light-theme token and contrast gate; this script does not replace device touch, screen-reader, or platform-semantic validation.
 */

/**
 * @lang zh-CN 执行主题契约检查并将所有问题汇总为一个失败结果。
 * @lang en Executes the theme-contract check and aggregates all issues into one failing result.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；主题契约不满足时抛出错误。</zh-CN><en>Resolves without a value and throws when the theme contract is not satisfied.</en></lang>
 */
async function runThemeCheck() {
  const issues = await validateThemeContract();

  if (issues.length > 0) {
    throw new Error(`HIA-uView theme contract failed:\n${issues.map((issue) => `- ${issue}`).join('\n')}`);
  }
}

await runThemeCheck();
console.log('HIA-uView default light-theme contract passed.');
