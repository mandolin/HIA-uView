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
  // <lang><zh-CN>Tool 自身不变量失败优先于所有项目/调用问题，因为调用者不能安全相信其余结果完整。</zh-CN><en>A Tool invariant failure takes precedence over every project or invocation issue because callers cannot safely trust completeness of remaining results.</en></lang>
  if (diagnostics.some((diagnostic) => diagnostic.category === 'tool')) {
    return 3;
  }

  // <lang><zh-CN>调用或 configuration 形状错误使用独立退出码，帮助自动化区分“修正命令”与“修正项目 metadata”。</zh-CN><en>Invocation or configuration-shape errors use a separate exit code, helping automation distinguish “fix the command” from “fix project metadata.”</en></lang>
  if (diagnostics.some((diagnostic) => diagnostic.category === 'invocation')) {
    return 2;
  }

  // <lang><zh-CN>剩余诊断均属于项目 metadata；无诊断时才返回成功。</zh-CN><en>Every remaining diagnostic belongs to project metadata; return success only when none exists.</en></lang>
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
    // <lang><zh-CN>诊断投影移除内部 category，保留自动化稳定消费所需的公开 code/message。</zh-CN><en>The diagnostic projection removes internal category while retaining public code and message required for stable automation consumption.</en></lang>
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

  if (details.kind === 'api-compatibility') {
    // <lang><zh-CN>API compatibility 文本只呈现固定比较版本、现场总计和逐组件 disposition 摘要；声明 scope 内的全部 mapping 保留在 JSON 输出中。</zh-CN><en>API-compatibility text presents only the fixed comparison version, on-the-fly totals, and per-component disposition summaries; every mapping within the declared scopes remains available in JSON output.</en></lang>
    for (const manifest of details.manifests) {
      // <lang><zh-CN>标题绑定安全相对 manifest 路径和其中声明的不可变上游版本/commit，避免将浮动分支或 source-intake lock 与本次比较混同。</zh-CN><en>The heading binds a safe relative manifest path to its declared immutable upstream version and commit, avoiding confusion of a floating branch or source-intake lock with this comparison.</en></lang>
      lines.push(`- ${manifest.path}: ${manifest.comparison.package.id}@${manifest.comparison.package.version}; ${manifest.comparison.commit}`);
      // <lang><zh-CN>总计明确区分 inventory 完整性成功与当前 unsupported/unresolved 数；passed 只表示矩阵可读，不表示 API 全部兼容。</zh-CN><en>Totals distinguish inventory-integrity success from current unsupported and unresolved counts; passed means only that the matrix is readable, not that every API is compatible.</en></lang>
      lines.push(`  - summary: ${manifest.summary.componentCount} components; ${manifest.summary.itemCount} API items; ${manifest.summary.dispositions.compatible} compatible; ${manifest.summary.dispositions.mapped} mapped; ${manifest.summary.dispositions.unsupported} unsupported; ${manifest.summary.unresolvedInventories} unresolved inventories; ${manifest.summary.issueCount} issues`);
      for (const component of manifest.components) {
        // <lang><zh-CN>逐组件行把 API-item summary 与 package easycom/type 交付分开，不输出 defaults、issue 正文或 source digest。</zh-CN><en>Each component line separates the API-item summary from package easycom and type delivery without emitting defaults, issue bodies, or source digests.</en></lang>
        lines.push(`  - ${component.name} [${component.priority}]: ${component.summary.itemCount} API items; ${component.summary.dispositions.compatible}/${component.summary.dispositions.mapped}/${component.summary.dispositions.unsupported} compatible/mapped/unsupported; API-surface ${component.summary.migration}; package easycom ${component.summary.easycom}; types ${component.summary.types}`);
      }
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
  // <lang><zh-CN>JSON 分支直接序列化受限 report；其 details 已由 inspect 层筛选，formatter 不读取任何额外文件。</zh-CN><en>The JSON branch serializes bounded report directly; details were already filtered by inspect layer and formatter reads no additional file.</en></lang>
  if (format === 'json') {
    return `${JSON.stringify(report, null, 2)}\n`;
  }

  // <lang><zh-CN>headline 概括命令和总体结果，保持 text 输出第一行稳定且不包含调用主机信息。</zh-CN><en>Headline summarizes command and overall result, keeping text-output first line stable and free of invocation-host information.</en></lang>
  const headline = `${report.command}: ${report.ok ? 'passed' : 'failed'}`;
  // <lang><zh-CN>将 inspect 元数据先格式化为受边界约束文本；doctor/check 会得到空数组，不改变既有诊断顺序。</zh-CN><en>Format inspect metadata into bounded text first; doctor and check receive an empty array, preserving existing diagnostic order.</en></lang>
  const inspectionDetails = formatInspectionDetails(report.details);
  // <lang><zh-CN>诊断文本逐项保留稳定 code，随后才追加 inspect metadata，避免人工读者把 metadata 误看作失败原因。</zh-CN><en>Diagnostic text retains stable code item by item before inspect metadata is appended, preventing readers from mistaking metadata for failure reasons.</en></lang>
  const details = report.diagnostics.map((diagnostic) => `- ${diagnostic.code}: ${diagnostic.message}`);
  // <lang><zh-CN>按 headline、diagnostic、inspect 的固定层次拼接并追加单一换行，便于 CLI 与 snapshot consumer 稳定比较。</zh-CN><en>Join headline, diagnostics, and inspect in fixed layers with one trailing newline for stable CLI and snapshot-consumer comparison.</en></lang>
  return `${[headline, ...details, ...inspectionDetails].join('\n')}\n`;
}
