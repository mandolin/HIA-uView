import { createDiagnostic, loadConfiguration } from './config.mjs';
import { loadAdoptionManifest } from './adoption.mjs';
import { loadCompatibilityManifest } from './compatibility.mjs';
import { loadApiCompatibilityManifest } from './api-compatibility.mjs';
import { loadMigrationActionManifest } from './migration-actions.mjs';
import { createApiCompatibilityInspection, createCompatibilityInspection, createComponentInspection, createMigrationActionInspection } from './inspect.mjs';
import { loadComponentManifest } from './metadata.mjs';
import { createReport, formatReport, getExitCode } from './report.mjs';

/**
 * @module hia-uview-tool
 * @lang zh-CN 实现 HIA-uView-Tool 的受限只读 CLI 调用链：检查 UI component/adoption 契约并查看 component、平台 evidence 与 API migration metadata；命令只读取已声明 JSON，不运行项目代码、网络、包管理器、Git、构建或子进程。
 * @lang en Implements the constrained read-only CLI chain for HIA-uView-Tool: checks UI component and adoption contracts and inspects component, platform-evidence, and API-migration metadata; commands read only declared JSON and never run project code, network, package manager, Git, builds, or subprocesses.
 */

/**
 * @lang zh-CN 解析公开 CLI 参数，允许一个根命令、其受限 target 与一个仓库内配置路径；未声明 position/option 不会被静默解释为脚本或文件输入。
 * @lang en Parses public CLI arguments, allowing one root command, its bounded target, and one repository-local configuration path; undeclared positions or options are never silently interpreted as script or file input.
 */
export function parseInvocation(argv) {
  // <lang><zh-CN>首个 token 是根命令；余下 token 只会被解析为 `--config` 或 command target。</zh-CN><en>The first token is the root command; remaining tokens are parsed only as `--config` or a command target.</en></lang>
  const [command, ...options] = argv;
  // <lang><zh-CN>诊断收集器将调用错误保持为 exit code 2，不与项目 metadata 的 exit code 1 混淆。</zh-CN><en>The diagnostic accumulator keeps invocation errors at exit code 2 rather than conflating them with project-metadata exit code 1.</en></lang>
  const diagnostics = [];
  // <lang><zh-CN>默认配置名是调用根目录下的唯一约定 JSON；调用方可用 `--config` 显式改为另一安全相对路径。</zh-CN><en>The default configuration name is the sole conventional JSON under invocation root; callers may explicitly change it to another safe relative path with `--config`.</en></lang>
  let configurationPath = 'hia-uview.config.json';
  // <lang><zh-CN>位置参数只用于固定 command target；不将它们解释为源码、shell 或任意 manifest 路径。</zh-CN><en>Positional arguments serve only fixed command targets; do not interpret them as source, shell, or arbitrary manifest paths.</en></lang>
  const positionals = [];

  // <lang><zh-CN>按顺序消费 options，以便 `--config` 只能取得紧邻的单个值。</zh-CN><en>Consume options in order so `--config` may take only one adjacent value.</en></lang>
  for (let index = 0; index < options.length; index += 1) {
    // <lang><zh-CN>当前 token 尚未被归类；仅在严格匹配公开开关时才改变配置路径。</zh-CN><en>The current token is not yet classified; it changes configuration path only on an exact public-switch match.</en></lang>
    const option = options[index];
    if (option === '--config' && typeof options[index + 1] === 'string') {
      // <lang><zh-CN>紧邻值保留为声明性配置路径，实际安全性仍由 configuration I/O 边界复核。</zh-CN><en>The adjacent value is retained as a declarative configuration path; actual safety is still rechecked at configuration I/O boundary.</en></lang>
      configurationPath = options[index + 1];
      index += 1;
      continue;
    }

    // <lang><zh-CN>以双连字符开头的未识别 token 是无效 option；其他 token 作为待验证的 command target 收集。</zh-CN><en>An unrecognized token beginning with double hyphen is an invalid option; every other token is collected as a command target to validate later.</en></lang>
    if (typeof option === 'string' && option.startsWith('--')) {
      diagnostics.push(createDiagnostic('INVOCATION_OPTION_INVALID', `Unsupported or incomplete option: ${option}.`, 'invocation'));
    } else {
      positionals.push(option);
    }
  }

  // <lang><zh-CN>根命令白名单排除任何未公开的写入、运行或业务子命令。</zh-CN><en>The root-command allowlist excludes every unpublished write, execution, or business subcommand.</en></lang>
  if (!['doctor', 'check', 'inspect'].includes(command)) {
    diagnostics.push(createDiagnostic('INVOCATION_COMMAND_INVALID', 'Command must be "doctor", "check", or "inspect".', 'invocation'));
  }

  // <lang><zh-CN>doctor 没有 target；额外位置参数不能被当作任意文件或项目路径使用。</zh-CN><en>Doctor has no target; extra positional arguments cannot be used as arbitrary file or project paths.</en></lang>
  if (command === 'doctor' && positionals.length > 0) {
    diagnostics.push(createDiagnostic('INVOCATION_TARGET_INVALID', 'Command "doctor" does not accept a target.', 'invocation'));
  }

  // <lang><zh-CN>check 的默认 target 保持对早期 `check` 调用的兼容；只允许 contract 或 adoption 两个非执行检查面。</zh-CN><en>The default check target preserves compatibility with earlier `check` calls; only contract and adoption non-executing check surfaces are allowed.</en></lang>
  const target = command === 'check'
    ? positionals[0] ?? 'contract'
    : command === 'inspect'
      ? positionals[0]
      : null;
  if (command === 'check' && (positionals.length > 1 || !['contract', 'adoption'].includes(target))) {
    diagnostics.push(createDiagnostic('INVOCATION_TARGET_INVALID', 'Command "check" target must be "contract" or "adoption".', 'invocation'));
  }
  if (command === 'inspect' && (positionals.length !== 1 || !['api-compatibility', 'components', 'compatibility', 'migration-actions'].includes(target))) {
    diagnostics.push(createDiagnostic('INVOCATION_TARGET_INVALID', 'Command "inspect" target must be "api-compatibility", "components", "compatibility", or "migration-actions".', 'invocation'));
  }

  return { command, target, configurationPath, diagnostics };
}

/**
 * @lang zh-CN 校验当前 Node 主版本是否达到 Tool 公开契约要求；npm 版本和运行环境详情不被读取或上报。
 * @lang en Validates that the current Node major version meets the public Tool-contract requirement; npm versions and environment details are neither read nor reported.
 */
export function getRuntimeDiagnostics(nodeVersion = process.versions.node) {
  // <lang><zh-CN>主版本是唯一需要的运行时兼容信息；拆分字符串避免读取额外环境变量或包管理器状态。</zh-CN><en>The major version is the only required runtime compatibility fact; splitting the string avoids reading additional environment variables or package-manager state.</en></lang>
  const major = Number.parseInt(String(nodeVersion).split('.')[0], 10);
  return Number.isInteger(major) && major >= 22
    ? []
    : [createDiagnostic('RUNTIME_NODE_UNSUPPORTED', 'HIA-uView-Tool requires Node.js 22 or later.')];
}

/**
 * @lang zh-CN 并行加载 configuration 已批准的 component manifests，并将其转换为按规范相对路径索引的只读结果；不读取 components 指向的 source/contract 文件。
 * @lang en Loads configuration-approved component manifests in parallel and converts them into read-only results indexed by normalized relative path; does not read files named by component source or contract.
 */
async function loadConfiguredComponentManifests(rootDirectory, configuration) {
  // <lang><zh-CN>组件 manifest 路径已通过 configuration schema；Promise.all 只读取这一有限清单，不发现目录中的其他 JSON。</zh-CN><en>Component-manifest paths have passed configuration schema; Promise.all reads only this finite list and discovers no other JSON in directories.</en></lang>
  const entries = await Promise.all(configuration.componentManifests.map((manifestPath) => loadComponentManifest(rootDirectory, manifestPath)));
  // <lang><zh-CN>Map 为 adoption 提供精确的已声明引用查找；键来自 metadata loader 的标准化相对路径。</zh-CN><en>The Map provides adoption with exact declared-reference lookup; keys come from the metadata loader's normalized relative paths.</en></lang>
  const byPath = new Map(entries.map((entry) => [entry.path, entry]));
  return { entries, byPath };
}

/**
 * @lang zh-CN 从多份加载结果提取保持原始读取顺序的诊断，避免 Set/Map 遍历造成 JSON/text 输出漂移。
 * @lang en Extracts diagnostics from multiple load results while preserving original read order, avoiding JSON and text output drift from Set or Map iteration.
 */
function collectDiagnostics(entries) {
  // <lang><zh-CN>扁平化只复制稳定 diagnostic record；不复制 manifest JSON 或文件内容进报告。</zh-CN><en>Flatten only stable diagnostic records; do not copy manifest JSON or file content into the report.</en></lang>
  return entries.flatMap((entry) => entry.diagnostics);
}

/**
 * @lang zh-CN 运行 doctor、check 或 inspect 的纯只读领域流程，并将调用/配置问题、项目 metadata 问题与 Tool 自身不可用问题分开编码。
 * @lang en Runs the pure read-only domain flow for doctor, check, or inspect and encodes invocation/configuration issues, project metadata issues, and Tool-unavailable issues separately.
 */
export async function executeToolCommand(argv, rootDirectory = process.cwd()) {
  // <lang><zh-CN>先解析受限调用面；调用错误无需读取配置或任何项目 metadata。</zh-CN><en>Parse the constrained invocation surface first; invocation errors require no configuration or project-metadata read.</en></lang>
  const invocation = parseInvocation(argv);
  if (invocation.diagnostics.length > 0) {
    return createReport(invocation.command ?? 'unknown', null, invocation.diagnostics);
  }

  try {
    // <lang><zh-CN>configuration loader 是唯一进入项目文件系统的首层；它只接受已声明安全相对 JSON 路径。</zh-CN><en>The configuration loader is the only first-layer entry into project file system; it accepts only a declared safe relative JSON path.</en></lang>
    const loadedConfiguration = await loadConfiguration(rootDirectory, invocation.configurationPath);
    if (loadedConfiguration.diagnostics.length > 0) {
      return createReport(invocation.command, null, loadedConfiguration.diagnostics);
    }

    // <lang><zh-CN>已通过 schema 的 configuration 仅保存 JSON 选择；不会拥有可执行 hook、依赖、URL 或私有工作区输入。</zh-CN><en>The schema-valid configuration holds JSON selections only; it owns no executable hook, dependency, URL, or private-workspace input.</en></lang>
    const configuration = loadedConfiguration.configuration;
    // <lang><zh-CN>Node 诊断适用于所有公开命令；它不会阻止报告同一安全 JSON 配置中的其他结构问题。</zh-CN><en>The Node diagnostic applies to every public command; it does not prevent reporting other structural problems in the same safe JSON configuration.</en></lang>
    const runtimeDiagnostics = getRuntimeDiagnostics();

    if (invocation.command === 'doctor') {
      return createReport(invocation.command, configuration, runtimeDiagnostics);
    }

    if (invocation.command === 'check' && invocation.target === 'contract') {
      // <lang><zh-CN>contract 检查只加载 configuration 声明的 UI component manifests；不会读取 style/source/contract target 本身。</zh-CN><en>Contract check loads only UI component manifests declared by configuration; it does not read style, source, or contract targets themselves.</en></lang>
      const componentManifests = await loadConfiguredComponentManifests(rootDirectory, configuration);
      return createReport(invocation.command, configuration, [...runtimeDiagnostics, ...collectDiagnostics(componentManifests.entries)]);
    }

    if (invocation.command === 'check' && invocation.target === 'adoption') {
      // <lang><zh-CN>adoption 关联只能引用已加载 component manifest，因而先构造同一 configuration 边界内的索引。</zh-CN><en>Adoption linkage may reference only loaded component manifests, so build an index within the same configuration boundary first.</en></lang>
      const componentManifests = await loadConfiguredComponentManifests(rootDirectory, configuration);
      // <lang><zh-CN>缺失 adoption 声明是项目 metadata 失败，而非调用语法错误；用户可据此选择是否在其应用根提供 adoption JSON。</zh-CN><en>A missing adoption declaration is a project-metadata failure, not invocation syntax error; users may then choose whether to provide adoption JSON at their application root.</en></lang>
      const adoptionPaths = configuration.adoptionManifests ?? [];
      if (adoptionPaths.length === 0) {
        return createReport(invocation.command, configuration, [
          ...runtimeDiagnostics,
          ...collectDiagnostics(componentManifests.entries),
          createDiagnostic('ADOPTION_MANIFESTS_MISSING', 'Configuration must declare at least one adoption manifest for "check adoption".')
        ]);
      }

      // <lang><zh-CN>每份 adoption JSON 只在其配置白名单路径上读取，并且仅与 componentManifests.byPath 进行内存关联。</zh-CN><en>Each adoption JSON is read only at its configuration-allowlisted path and links in memory only to componentManifests.byPath.</en></lang>
      const adoptionManifests = await Promise.all(adoptionPaths.map((adoptionPath) => loadAdoptionManifest(rootDirectory, adoptionPath, configuration, componentManifests.byPath)));
      return createReport(invocation.command, configuration, [
        ...runtimeDiagnostics,
        ...collectDiagnostics(componentManifests.entries),
        ...collectDiagnostics(adoptionManifests)
      ]);
    }

    if (invocation.command === 'inspect' && invocation.target === 'components') {
      // <lang><zh-CN>component inspect 使用与 contract 检查相同的 loader，确保报告不能绕过 schema 或扩大读取范围。</zh-CN><en>Component inspect uses the same loader as contract check, ensuring the report cannot bypass schema or expand read scope.</en></lang>
      const componentManifests = await loadConfiguredComponentManifests(rootDirectory, configuration);
      const diagnostics = [...runtimeDiagnostics, ...collectDiagnostics(componentManifests.entries)];
      // <lang><zh-CN>即使某一 manifest 失败，details 也只包含其他完整有效条目；报告 ok 仍由全部 diagnostics 决定。</zh-CN><en>Even if one manifest fails, details contain only other complete valid entries; report ok is still determined by all diagnostics.</en></lang>
      const details = createComponentInspection(componentManifests.entries);
      return createReport(invocation.command, configuration, diagnostics, details);
    }

    if (invocation.command === 'inspect' && invocation.target === 'compatibility') {
      // <lang><zh-CN>compatibility evidence 清单必须显式声明；Tool 不从 docs、test 输出、package 或设备状态推断它。</zh-CN><en>The compatibility-evidence list must be explicit; the Tool does not infer it from docs, test output, package, or device state.</en></lang>
      const compatibilityPaths = configuration.compatibilityManifests ?? [];
      if (compatibilityPaths.length === 0) {
        return createReport(invocation.command, configuration, [
          ...runtimeDiagnostics,
          createDiagnostic('COMPATIBILITY_MANIFESTS_MISSING', 'Configuration must declare at least one compatibility manifest for "inspect compatibility".')
        ]);
      }

      // <lang><zh-CN>仅读取 configuration 列出的 evidence JSON；不会打开其中 target 所指向的 fixture 或 runtime test。</zh-CN><en>Read only evidence JSON listed by configuration; do not open fixtures or runtime tests named by its targets.</en></lang>
      const compatibilityManifests = await Promise.all(compatibilityPaths.map((manifestPath) => loadCompatibilityManifest(rootDirectory, manifestPath, configuration)));
      const diagnostics = [...runtimeDiagnostics, ...collectDiagnostics(compatibilityManifests)];
      // <lang><zh-CN>报告将 verified/unverified 声明原样投影为受限 details，不将其提升为平台认证。</zh-CN><en>The report projects verified and unverified declarations into bounded details without promoting them to platform certification.</en></lang>
      const details = createCompatibilityInspection(compatibilityManifests);
      return createReport(invocation.command, configuration, diagnostics, details);
    }

    if (invocation.command === 'inspect' && invocation.target === 'api-compatibility') {
      // <lang><zh-CN>API/migration inventory 必须由 configuration 显式列出；Tool 不从 SFC、类型、文档、上游 checkout 或网络生成矩阵。</zh-CN><en>The API/migration inventory must be explicitly listed by configuration; the Tool does not generate a matrix from SFCs, types, documentation, an upstream checkout, or network.</en></lang>
      const apiCompatibilityPaths = configuration.apiCompatibilityManifests ?? [];
      if (apiCompatibilityPaths.length === 0) {
        return createReport(invocation.command, configuration, [
          ...runtimeDiagnostics,
          createDiagnostic('API_COMPATIBILITY_MANIFESTS_MISSING', 'Configuration must declare at least one API compatibility manifest for "inspect api-compatibility".')
        ]);
      }

      // <lang><zh-CN>先加载同一配置白名单中的 component manifests，令矩阵只能引用已声明的本地 UI component boundary，而不是任意应用或上游文件。</zh-CN><en>Load component manifests from the same configuration allowlist first so the matrix can reference only declared local UI component boundaries rather than arbitrary application or upstream files.</en></lang>
      const componentManifests = await loadConfiguredComponentManifests(rootDirectory, configuration);
      // <lang><zh-CN>每份矩阵 JSON 只在配置指定的安全相对路径读取，并仅与内存中的 component manifest 索引关联。</zh-CN><en>Each matrix JSON is read only at its configuration-declared safe relative path and links only to the in-memory component-manifest index.</en></lang>
      const apiCompatibilityManifests = await Promise.all(apiCompatibilityPaths.map((manifestPath) => loadApiCompatibilityManifest(
        rootDirectory,
        manifestPath,
        configuration,
        componentManifests.byPath
      )));
      // <lang><zh-CN>unsupported/unresolved 是已记录的当前迁移事实，不是 schema 失败；details 会汇总它们，而 diagnostics 只表示矩阵不完整或不一致。</zh-CN><en>Unsupported and unresolved are recorded current migration facts rather than schema failures; details summarize them while diagnostics represent only an incomplete or inconsistent matrix.</en></lang>
      const diagnostics = [
        ...runtimeDiagnostics,
        ...collectDiagnostics(componentManifests.entries),
        ...collectDiagnostics(apiCompatibilityManifests)
      ];
      // <lang><zh-CN>投影只包含已校验矩阵的公开 metadata 与现场派生统计，不读取 target 文件或信任 manifest 自报 summary。</zh-CN><en>The projection contains only validated public matrix metadata and locally derived counts; it reads no target file and trusts no manifest-reported summary.</en></lang>
      const details = createApiCompatibilityInspection(apiCompatibilityManifests);
      return createReport(invocation.command, configuration, diagnostics, details);
    }

    if (invocation.command === 'inspect' && invocation.target === 'migration-actions') {
      // <lang><zh-CN>动作包必须显式声明；缺失是项目 metadata 诊断，Tool 不从 matrix 自动臆测调用方应修改什么。</zh-CN><en>Action packets must be explicitly declared; absence is a project-metadata diagnostic, and the Tool never guesses what callers should modify from a matrix.</en></lang>
      const actionPaths = configuration.migrationActionManifests ?? [];
      if (actionPaths.length === 0) {
        return createReport(invocation.command, configuration, [
          ...runtimeDiagnostics,
          createDiagnostic('MIGRATION_ACTION_MANIFESTS_MISSING', 'Configuration must declare at least one migration action manifest for "inspect migration-actions".')
        ]);
      }
      // <lang><zh-CN>先加载同一配置白名单中的 API matrix；action loader 只关联其内存 record，不打开 action 指向的 docs/source。</zh-CN><en>Loads API matrices from the same configuration allowlist first; the action loader links only their in-memory records and opens no docs/source named by actions.</en></lang>
      const componentManifests = await loadConfiguredComponentManifests(rootDirectory, configuration);
      const matrixPaths = configuration.apiCompatibilityManifests ?? [];
      const apiCompatibilityManifests = await Promise.all(matrixPaths.map((manifestPath) => loadApiCompatibilityManifest(rootDirectory, manifestPath, configuration, componentManifests.byPath)));
      // <lang><zh-CN>只把无诊断 matrix 放进 action 索引，避免 action report 对不完整 API inventory 产生可信建议。</zh-CN><en>Places only diagnostic-free matrices in the action index, preventing an action report from producing trusted guidance over an incomplete API inventory.</en></lang>
      const matrices = new Map(apiCompatibilityManifests.filter((entry) => entry.diagnostics.length === 0 && entry.manifest).map((entry) => [entry.path, entry]));
      const actionManifests = await Promise.all(actionPaths.map((manifestPath) => loadMigrationActionManifest(rootDirectory, manifestPath, configuration, matrices)));
      const diagnostics = [
        ...runtimeDiagnostics,
        ...collectDiagnostics(componentManifests.entries),
        ...collectDiagnostics(apiCompatibilityManifests),
        ...collectDiagnostics(actionManifests)
      ];
      const details = createMigrationActionInspection(actionManifests, configuration.locale);
      return createReport(invocation.command, configuration, diagnostics, details);
    }

    // <lang><zh-CN>所有合法调用组合已在 parser 中覆盖；保留这一不变量错误防止未来扩展静默落入错误分支。</zh-CN><en>Parser covers every legal invocation combination; retain this invariant error so future extensions do not silently fall into a wrong branch.</en></lang>
    return createReport(invocation.command, configuration, [createDiagnostic('TOOL_INVARIANT_UNAVAILABLE', 'The Tool cannot safely select its expected read-only operation.', 'tool')]);
  } catch {
    // <lang><zh-CN>任何未预期内部失败只暴露稳定 Tool 级诊断，不回显异常、路径、JSON 正文或系统环境。</zh-CN><en>Any unexpected internal failure exposes only a stable Tool-level diagnostic and never echoes exception, path, JSON body, or system environment.</en></lang>
    return createReport(invocation.command ?? 'unknown', null, [createDiagnostic('TOOL_INVARIANT_UNAVAILABLE', 'The Tool cannot safely complete its expected local validation.', 'tool')]);
  }
}

/**
 * @lang zh-CN 以调用者注入的 writer 输出报告，便于测试保持无子进程、无网络、无写入的 Tool 边界。
 * @lang en Writes a report through a caller-injected writer so tests preserve the Tool boundary of no subprocesses, network, or writes.
 */
export async function runToolCli(argv, rootDirectory = process.cwd(), writer = (value) => process.stdout.write(value)) {
  // <lang><zh-CN>先得到纯数据报告，再由注入 writer 输出；CLI 本身不创建日志、缓存或输出文件。</zh-CN><en>Produce the pure data report before emitting through injected writer; the CLI itself creates no log, cache, or output file.</en></lang>
  const report = await executeToolCommand(argv, rootDirectory);
  // <lang><zh-CN>格式由已验证 configuration 控制；调用错误使用 text 默认值，避免读取更多输入决定输出格式。</zh-CN><en>Format is controlled by validated configuration; invocation errors use text default, avoiding reads of more input to decide output format.</en></lang>
  writer(formatReport(report, report.format));
  return getExitCode(report.diagnostics);
}
