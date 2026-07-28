/**
 * @module tool-report
 * @lang zh-CN 生成 HIA-uView-Tool 的稳定、无源码泄露的 text/JSON 报告与退出码；不读取文件、不执行网络或子进程。
 * @lang en Generates stable source-free text/JSON reports and exit codes for HIA-uView-Tool; performs no file reads, network calls, or subprocess execution.
 */

/**
 * @lang zh-CN 根据诊断类别计算公开 Tool 契约的退出码优先级。
 * @lang en Calculates the public Tool-contract exit-code precedence from diagnostic categories.
 */
export function getExitCode(diagnostics) {
  if (diagnostics.some((diagnostic) => diagnostic.category === 'tool')) {
    return 3;
  }

  if (diagnostics.some((diagnostic) => diagnostic.category === 'invocation')) {
    return 2;
  }

  return diagnostics.length > 0 ? 1 : 0;
}

/**
 * @lang zh-CN 生成不含调用目录绝对路径、源码内容或私有工作区信息的最小报告对象。
 * @lang en Creates a minimal report object containing no invocation-directory absolute path, source content, or private-workspace information.
 */
export function createReport(command, configuration, diagnostics) {
  return Object.freeze({
    command,
    ok: diagnostics.length === 0,
    profile: configuration?.profile ?? null,
    locale: configuration?.locale ?? null,
    format: configuration?.report?.format ?? 'text',
    diagnostics: diagnostics.map(({ code, message }) => ({ code, message }))
  });
}

/**
 * @lang zh-CN 将报告格式化为配置批准的 text 或 JSON；text 输出逐条给出稳定诊断代码，JSON 保持机器可读。
 * @lang en Formats a report as configuration-approved text or JSON; text emits each stable diagnostic code while JSON remains machine-readable.
 */
export function formatReport(report, format) {
  if (format === 'json') {
    return `${JSON.stringify(report, null, 2)}\n`;
  }

  const headline = `${report.command}: ${report.ok ? 'passed' : 'failed'}`;
  const details = report.diagnostics.map((diagnostic) => `- ${diagnostic.code}: ${diagnostic.message}`);
  return `${[headline, ...details].join('\n')}\n`;
}
