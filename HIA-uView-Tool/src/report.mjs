/**
 * @module tool-report
 * @lang zh-CN 生成 HIA-uView-Tool 的稳定、无源码正文泄露的 text/JSON 报告与退出码；仅呈现已校验的 JSON metadata，不读取文件、不执行网络或子进程。
 * @lang en Generates stable text and JSON reports and exit codes for HIA-uView-Tool without leaking source body; presents only validated JSON metadata and performs no file reads, network calls, or subprocess execution.
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
export function createReport(command, configuration, diagnostics, details = null) {
  // <lang><zh-CN>报告字段只保留调用语义、配置选择、稳定诊断和明确请求的 inspect metadata；它不保存调用根目录或原始 JSON。</zh-CN><en>Report fields retain only invocation semantics, configuration selection, stable diagnostics, and explicitly requested inspect metadata; they store neither invocation root nor raw JSON.</en></lang>
  return Object.freeze({
    command,
    ok: diagnostics.length === 0,
    profile: configuration?.profile ?? null,
    locale: configuration?.locale ?? null,
    format: configuration?.report?.format ?? 'text',
    diagnostics: diagnostics.map(({ code, message }) => ({ code, message })),
    details
  });
}

/**
 * @lang zh-CN 将已经受 schema 限制的 inspect details 转为简洁文本行；未知或缺失 kind 不会被猜测或输出为隐式支持结论。
 * @lang en Converts already schema-bounded inspect details into concise text lines; unknown or missing kind is neither guessed nor emitted as an implicit support conclusion.
 */
function formatInspectionDetails(details) {
  // <lang><zh-CN>没有 inspect details 的 doctor/check 报告保持既有简洁文本形态。</zh-CN><en>Doctor and check reports without inspect details retain their existing concise text shape.</en></lang>
  if (!details || !Array.isArray(details.manifests)) {
    return [];
  }

  // <lang><zh-CN>text 行累积器仅收集已校验的公开相对 metadata；不会追加源码、Markdown 或主机路径。</zh-CN><en>The text-line accumulator collects only validated public relative metadata and never appends source, Markdown, or host paths.</en></lang>
  const lines = [details.kind];
  if (details.kind === 'components') {
    for (const manifest of details.manifests) {
      // <lang><zh-CN>component manifest 标题显示其相对路径、profile 和样式入口，帮助人工确认采用边界。</zh-CN><en>The component-manifest heading displays its relative path, profile, and style entry to help people confirm adoption boundaries.</en></lang>
      lines.push(`- ${manifest.path}: ${manifest.profile}; style ${manifest.styleEntry}`);
      for (const component of manifest.components) {
        // <lang><zh-CN>组件行只呈现公开名称、相对 source/contract 位置和 UI locale，不读取或打印任何文件正文。</zh-CN><en>A component line presents only public name, relative source and contract location, and UI locale; it reads and prints no file body.</en></lang>
        lines.push(`  - ${component.name}: ${component.source}; ${component.contract}; ${component.locales.join(', ')}`);
      }
    }
    return lines;
  }

  if (details.kind === 'compatibility') {
    for (const manifest of details.manifests) {
      // <lang><zh-CN>兼容性标题将 profile 与相对 metadata 路径绑定，避免将 evidence 混同为全局跨端声明。</zh-CN><en>The compatibility heading binds profile to relative metadata path, avoiding confusion of evidence with a global cross-platform claim.</en></lang>
      lines.push(`- ${manifest.path}: ${manifest.profile}`);
      for (const evidence of manifest.verified) {
        // <lang><zh-CN>verified 行保留 kind、target 与限制 scope；scope 使读者不会把 compiler/jsdom 结果误解为设备证据。</zh-CN><en>A verified line retains kind, target, and limiting scope; scope prevents readers from mistaking compiler or jsdom results for device evidence.</en></lang>
        lines.push(`  - verified ${evidence.kind}: ${evidence.target}; ${evidence.scope}`);
      }
      // <lang><zh-CN>未验证环境以明确列表呈现；它们不是错误修复建议，也不代表 Tool 已检测过这些环境。</zh-CN><en>Unverified environments appear as an explicit list; they are neither error-remediation advice nor evidence that the Tool has tested them.</en></lang>
      lines.push(`  - unverified: ${manifest.unverified.join(', ')}`);
    }
    return lines;
  }

  // <lang><zh-CN>只有固定 inspect kind 才能进入可读文本，防止未来未审计 details 被 formatter 意外输出。</zh-CN><en>Only fixed inspect kinds may enter human-readable text, preventing future unaudited details from being output accidentally by the formatter.</en></lang>
  return [];
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
  // <lang><zh-CN>将 inspect 元数据先格式化为受边界约束文本；doctor/check 会得到空数组，不改变既有诊断顺序。</zh-CN><en>Format inspect metadata into bounded text first; doctor and check receive an empty array, preserving existing diagnostic order.</en></lang>
  const inspectionDetails = formatInspectionDetails(report.details);
  const details = report.diagnostics.map((diagnostic) => `- ${diagnostic.code}: ${diagnostic.message}`);
  return `${[headline, ...details, ...inspectionDetails].join('\n')}\n`;
}
