import { createDiagnostic, loadConfiguration, validateComponentManifest } from './config.mjs';
import { createReport, formatReport, getExitCode } from './report.mjs';

/**
 * @module hia-uview-tool
 * @lang zh-CN 实现 HIA-uView-Tool 首轮 doctor/check 的受限只读调用链；命令只读取已声明 JSON，不运行项目代码、网络、包管理器或子进程。
 * @lang en Implements the constrained read-only first-slice doctor/check invocation chain for HIA-uView-Tool; commands read only declared JSON and never run project code, network, package-manager, or subprocess operations.
 */

/**
 * @lang zh-CN 解析首轮 CLI 参数，接受一个只读命令与可选的仓库内配置路径，不接受未声明开关。
 * @lang en Parses first-slice CLI arguments, accepting one read-only command and an optional repository-local configuration path while rejecting undeclared switches.
 */
export function parseInvocation(argv) {
  const [command, ...options] = argv;
  const diagnostics = [];
  let configurationPath = 'hia-uview.config.json';

  if (!['doctor', 'check'].includes(command)) {
    diagnostics.push(createDiagnostic('INVOCATION_COMMAND_INVALID', 'Command must be "doctor" or "check".', 'invocation'));
  }

  for (let index = 0; index < options.length; index += 1) {
    const option = options[index];

    if (option === '--config' && typeof options[index + 1] === 'string') {
      configurationPath = options[index + 1];
      index += 1;
      continue;
    }

    diagnostics.push(createDiagnostic('INVOCATION_OPTION_INVALID', `Unsupported or incomplete option: ${option ?? ''}.`, 'invocation'));
  }

  return { command, configurationPath, diagnostics };
}

/**
 * @lang zh-CN 校验当前 Node 主版本是否达到 Tool 公开契约要求；npm 版本和运行环境详情不被读取或上报。
 * @lang en Validates that the current Node major version meets the public Tool-contract requirement; npm versions and environment details are neither read nor reported.
 */
export function getRuntimeDiagnostics(nodeVersion = process.versions.node) {
  const major = Number.parseInt(String(nodeVersion).split('.')[0], 10);
  return Number.isInteger(major) && major >= 22
    ? []
    : [createDiagnostic('RUNTIME_NODE_UNSUPPORTED', 'HIA-uView-Tool requires Node.js 22 or later.')];
}

/**
 * @lang zh-CN 运行 doctor 或 check 的纯只读领域流程，并将预期配置/项目问题与工具自身不可用问题分开编码。
 * @lang en Runs the pure read-only domain flow for doctor or check and encodes expected configuration/project issues separately from tool-unavailable issues.
 */
export async function executeToolCommand(argv, rootDirectory = process.cwd()) {
  const invocation = parseInvocation(argv);

  if (invocation.diagnostics.length > 0) {
    return createReport(invocation.command ?? 'unknown', null, invocation.diagnostics);
  }

  try {
    const loaded = await loadConfiguration(rootDirectory, invocation.configurationPath);
    const diagnostics = [...loaded.diagnostics];

    if (diagnostics.length > 0) {
      return createReport(invocation.command, null, diagnostics);
    }

    diagnostics.push(...getRuntimeDiagnostics());

    if (invocation.command === 'check') {
      for (const manifestPath of loaded.configuration.componentManifests) {
        diagnostics.push(...await validateComponentManifest(rootDirectory, manifestPath));
      }
    }

    return createReport(invocation.command, loaded.configuration, diagnostics);
  } catch {
    return createReport(invocation.command, null, [createDiagnostic('TOOL_INVARIANT_UNAVAILABLE', 'The Tool cannot safely complete its expected local validation.', 'tool')]);
  }
}

/**
 * @lang zh-CN 以调用者注入的 writer 输出报告，便于测试保持无子进程、无网络、无写入的 Tool 边界。
 * @lang en Writes a report through a caller-injected writer so tests preserve the Tool boundary of no subprocesses, network, or writes.
 */
export async function runToolCli(argv, rootDirectory = process.cwd(), writer = (value) => process.stdout.write(value)) {
  const report = await executeToolCommand(argv, rootDirectory);
  writer(formatReport(report, report.format));
  return getExitCode(report.diagnostics);
}
