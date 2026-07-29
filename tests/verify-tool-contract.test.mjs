import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { executeToolCommand, runToolCli } from '../HIA-uView-Tool/src/index.mjs';

/**
 * @module verify-tool-contract.test
 * @lang zh-CN 验证 P17 Tool 的只读 doctor/check/inspect 配置、component/adoption/compatibility manifest、退出码和输出隐私边界；测试不通过子进程、网络或源码扫描掩盖实现范围。
 * @lang en Verifies P17 Tool read-only doctor, check, and inspect configuration, component/adoption/compatibility manifests, exit codes, and output privacy boundary; tests do not mask implementation scope through subprocess, network, or source scanning.
 */

/**
 * @lang zh-CN 验证有效声明式配置可通过 doctor、component contract 与 adoption 检查，并使 JSON 输出保持稳定、无绝对项目路径。
 * @lang en Verifies that valid declarative configuration passes doctor, component-contract, and adoption checks while JSON output remains stable and free of absolute project paths.
 */
test('runs doctor and read-only checks against declared local UI metadata', async () => {
  // <lang><zh-CN>fixture 配置只声明测试仓内 JSON metadata，避免测试依赖真实应用或 HIA-uView-Biz 内容。</zh-CN><en>The fixture configuration declares only JSON metadata within the test repository, avoiding dependence on a real application or HIA-uView-Biz content.</en></lang>
  const configurationPath = 'tests/fixtures/tool/valid.config.json';
  // <lang><zh-CN>doctor 验证 Tool 自身 Node/configuration 前提，不加载 component/adoption/compatibility 细节。</zh-CN><en>Doctor validates Tool Node and configuration prerequisites without loading component, adoption, or compatibility details.</en></lang>
  const doctor = await executeToolCommand(['doctor', '--config', configurationPath]);
  // <lang><zh-CN>默认 check 保留为 contract alias，保证早期调用方无需迁移到新 target 拼写。</zh-CN><en>Default check remains the contract alias, ensuring early callers need not migrate to a new target spelling.</en></lang>
  const check = await executeToolCommand(['check', '--config', configurationPath]);
  // <lang><zh-CN>adoption 检查只比较 JSON 声明，不读取应用源文件或执行其构建。</zh-CN><en>Adoption check compares JSON declarations only and neither reads application source nor executes its build.</en></lang>
  const adoption = await executeToolCommand(['check', 'adoption', '--config', configurationPath]);
  // <lang><zh-CN>注入 writer 捕获 JSON 输出，确保 CLI 格式化不需要创建临时文件或子进程。</zh-CN><en>Inject a writer to capture JSON output, ensuring CLI formatting needs no temporary file or subprocess.</en></lang>
  let output = '';
  const exitCode = await runToolCli(['check', '--config', configurationPath], process.cwd(), (value) => {
    // <lang><zh-CN>测试内存字符串仅保存 Tool 已许可的报告，不保存任何 fixture 原文。</zh-CN><en>The test in-memory string retains only the Tool-permitted report and no fixture raw content.</en></lang>
    output += value;
  });

  assert.equal(doctor.ok, true);
  assert.equal(check.ok, true);
  assert.equal(adoption.ok, true);
  assert.equal(exitCode, 0);
  assert.equal(check.format, 'json');
  assert.match(output, /"command": "check"/);
  assert.doesNotMatch(output, new RegExp(process.cwd().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

/**
 * @lang zh-CN 验证 component inspect 只输出已声明的公开 metadata，而 compatibility inspect 明确同时呈现有限已验证证据与未验证环境。
 * @lang en Verifies that component inspect outputs only declared public metadata while compatibility inspect explicitly presents both limited verified evidence and unverified environments.
 */
test('inspects declared components and compatibility evidence without upgrading scope', async () => {
  // <lang><zh-CN>同一有效 fixture 让两个 inspect 共享 profile/locale 选择，但各自只加载其对应 manifest 类型。</zh-CN><en>The same valid fixture lets both inspect commands share profile and locale selection while each loads only its corresponding manifest type.</en></lang>
  const configurationPath = 'tests/fixtures/tool/valid.config.json';
  const components = await executeToolCommand(['inspect', 'components', '--config', configurationPath]);
  const compatibility = await executeToolCommand(['inspect', 'compatibility', '--config', configurationPath]);
  // <lang><zh-CN>component 细节只含公开组件名与相对 source/contract 路径，证明 inspect 没有读取源正文。</zh-CN><en>Component details contain only public component names and relative source and contract paths, proving inspect did not read source body.</en></lang>
  const componentRecord = components.details.manifests[0].components[0];
  // <lang><zh-CN>compatibility evidence 的 scope 必须保留 compiler-only/jsdom-only 限制，且未验证列表仍显式保留 device。</zh-CN><en>Compatibility evidence scope must retain compiler-only and jsdom-only limits while the unverified list still explicitly retains device.</en></lang>
  const verifiedScopes = compatibility.details.manifests[0].verified.map((evidence) => evidence.scope);

  assert.equal(components.ok, true);
  assert.equal(components.details.kind, 'components');
  assert.equal(componentRecord.name, 'u-fixture-button');
  assert.equal(componentRecord.source, 'src/fixture-button.vue');
  assert.equal(compatibility.ok, true);
  assert.deepEqual(verifiedScopes, ['compiler-only', 'jsdom-only']);
  assert.ok(compatibility.details.manifests[0].unverified.includes('device'));
  assert.doesNotMatch(JSON.stringify(compatibility), /release-certified|device-verified/i);
});

/**
 * @lang zh-CN 验证不安全路径、未知根命令与 P17 各 JSON contract 的负例使用稳定诊断，而非读取目标外文件或接受业务字段。
 * @lang en Verifies that unsafe paths, unknown root command, and negative P17 JSON contracts use stable diagnostics rather than reading outside targets or accepting business fields.
 */
test('rejects escaping invocation, broken contracts, and forbidden adoption fields', async () => {
  // <lang><zh-CN>越界配置、远程样式 path 与未知命令覆盖最早的调用边界。</zh-CN><en>Escaping configuration, remote-style path, and unknown command cover the earliest invocation boundary.</en></lang>
  const escaping = await executeToolCommand(['doctor', '--config', 'tests/fixtures/tool/invalid-escaping.config.json']);
  const remote = await executeToolCommand(['doctor', '--config', 'https://example.invalid/hia-uview.config.json']);
  const unknown = await executeToolCommand(['launch']);
  // <lang><zh-CN>负 contract fixture 覆盖样式越界、组件路径越界、重复名称/locale 与非稳定排序。</zh-CN><en>The negative contract fixture covers escaping style, escaping component path, duplicate name and locale, and unstable ordering.</en></lang>
  const contract = await executeToolCommand(['check', 'contract', '--config', 'tests/fixtures/tool/invalid-contract.config.json']);
  // <lang><zh-CN>负 adoption fixture 试图携带 API 字段并失配 profile/style/component，以证明 Tool 不接受 Biz/application 元数据。</zh-CN><en>The negative adoption fixture attempts to carry an API field and mismatches profile, style, and component, proving the Tool accepts no Biz or application metadata.</en></lang>
  const adoption = await executeToolCommand(['check', 'adoption', '--config', 'tests/fixtures/tool/invalid-adoption.config.json']);
  // <lang><zh-CN>负 compatibility fixture 将 device 伪装为 verified evidence，并重复未验证环境，必须被拒绝。</zh-CN><en>The negative compatibility fixture disguises device as verified evidence and repeats an unverified environment, both of which must be rejected.</en></lang>
  const compatibility = await executeToolCommand(['inspect', 'compatibility', '--config', 'tests/fixtures/tool/invalid-compatibility.config.json']);

  assert.equal(escaping.ok, false);
  assert.ok(escaping.diagnostics.some((diagnostic) => diagnostic.code === 'CONFIG_PROJECT_ROOT_INVALID'));
  assert.ok(escaping.diagnostics.some((diagnostic) => diagnostic.code === 'CONFIG_MANIFEST_PATH_INVALID'));
  assert.equal(remote.diagnostics[0].code, 'CONFIG_PATH_INVALID');
  assert.equal(unknown.diagnostics[0].code, 'INVOCATION_COMMAND_INVALID');
  assert.ok(contract.diagnostics.some((diagnostic) => diagnostic.code === 'MANIFEST_STYLE_ENTRY_INVALID'));
  assert.ok(contract.diagnostics.some((diagnostic) => diagnostic.code === 'MANIFEST_COMPONENT_NAME_DUPLICATE'));
  assert.ok(contract.diagnostics.some((diagnostic) => diagnostic.code === 'MANIFEST_COMPONENT_ORDER_INVALID'));
  assert.ok(adoption.diagnostics.some((diagnostic) => diagnostic.code === 'ADOPTION_FIELD_UNKNOWN'));
  assert.ok(adoption.diagnostics.some((diagnostic) => diagnostic.code === 'ADOPTION_STYLE_ENTRY_MISSING'));
  assert.ok(adoption.diagnostics.some((diagnostic) => diagnostic.code === 'ADOPTION_COMPONENT_UNAVAILABLE'));
  assert.ok(compatibility.diagnostics.some((diagnostic) => diagnostic.code === 'COMPATIBILITY_EVIDENCE_KIND_UNSUPPORTED'));
  assert.ok(compatibility.diagnostics.some((diagnostic) => diagnostic.code === 'COMPATIBILITY_UNVERIFIED_DUPLICATE'));
});

/**
 * @lang zh-CN 验证 Tool 全部源模块未引入网络、子进程、包管理器、Git、UI runtime、Biz 或应用源码 import，保持开发期只读隔离边界。
 * @lang en Verifies that every Tool source module introduces no network, subprocess, package manager, Git, UI runtime, Biz, or application-source import, preserving the development-time read-only isolation boundary.
 */
test('keeps all Tool source free of execution, runtime, and business imports', async () => {
  // <lang><zh-CN>明确列出全部 Tool 源文件，避免递归文件发现本身掩盖或扩大此静态门禁范围。</zh-CN><en>List every Tool source file explicitly, avoiding recursive file discovery that could itself hide or expand this static-gate scope.</en></lang>
  const sourceFiles = ['config.mjs', 'metadata.mjs', 'adoption.mjs', 'compatibility.mjs', 'inspect.mjs', 'report.mjs', 'index.mjs', 'cli.mjs'];
  // <lang><zh-CN>源文本仅用于禁止模式 sentinel，不作为 Tool 运行时输入或 inspect 输出。</zh-CN><en>Source text is used only for forbidden-pattern sentinels and is not Tool runtime input or inspect output.</en></lang>
  const source = await Promise.all(sourceFiles.map((fileName) => readFile(resolve('HIA-uView-Tool/src', fileName), 'utf8')));
  const combined = source.join('\n');

  assert.doesNotMatch(combined, /node:child_process|from ['"]child_process['"]/);
  assert.doesNotMatch(combined, /\bfetch\s*\(/);
  assert.doesNotMatch(combined, /https?:\/\//);
  assert.doesNotMatch(combined, /\b(?:npm|pnpm|yarn)\s+(?:install|exec|publish)/);
  assert.doesNotMatch(combined, /\bgit\s+(?:run|push|commit|status)/);
  assert.doesNotMatch(combined, /from ['"][^'"]*(?:HIA-uView-UI|HIA-uView-Biz|main-repo|fixtures\/mp-weixin)[^'"]*['"]/);
});
