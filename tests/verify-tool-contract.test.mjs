import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { executeToolCommand, runToolCli } from '../HIA-uView-Tool/src/index.mjs';

/**
 * @module verify-tool-contract.test
 * @lang zh-CN 验证首轮 Tool 只读 doctor/check 配置、manifest、退出码和输出边界，不通过子进程或网络测试来掩盖实现范围。
 * @lang en Verifies the first-slice Tool read-only doctor/check configuration, manifest, exit-code, and output boundaries without masking implementation scope through subprocess or network tests.
 */

/**
 * @lang zh-CN 验证有效声明式配置可通过 doctor/check，且 JSON 输出保持稳定、无绝对项目路径。
 * @lang en Verifies that valid declarative configuration passes doctor/check and that JSON output remains stable and free of absolute project paths.
 */
test('runs doctor and check against the declared local manifests', async () => {
  const configurationPath = 'tests/fixtures/tool/valid.config.json';
  const doctor = await executeToolCommand(['doctor', '--config', configurationPath]);
  const check = await executeToolCommand(['check', '--config', configurationPath]);
  let output = '';
  const exitCode = await runToolCli(['check', '--config', configurationPath], process.cwd(), (value) => {
    output += value;
  });

  assert.equal(doctor.ok, true);
  assert.equal(check.ok, true);
  assert.equal(exitCode, 0);
  assert.equal(check.format, 'json');
  assert.match(output, /"command": "check"/);
  assert.doesNotMatch(output, new RegExp(process.cwd().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

/**
 * @lang zh-CN 验证越界配置和未知命令使用公开的调用错误退出码，而非尝试读取目标外的文件。
 * @lang en Verifies that escaping configuration and an unknown command use the public invocation-error exit code rather than attempting to read outside the target.
 */
test('rejects escaping or remote configuration and unknown commands', async () => {
  const escaping = await executeToolCommand(['doctor', '--config', 'tests/fixtures/tool/invalid-escaping.config.json']);
  const remote = await executeToolCommand(['doctor', '--config', 'https://example.invalid/hia-uview.config.json']);
  const unknown = await executeToolCommand(['launch']);

  assert.equal(escaping.ok, false);
  assert.ok(escaping.diagnostics.some((diagnostic) => diagnostic.code === 'CONFIG_PROJECT_ROOT_INVALID'));
  assert.ok(escaping.diagnostics.some((diagnostic) => diagnostic.code === 'CONFIG_MANIFEST_PATH_INVALID'));
  assert.equal(remote.diagnostics[0].code, 'CONFIG_PATH_INVALID');
  assert.equal(unknown.diagnostics[0].code, 'INVOCATION_COMMAND_INVALID');
});

/**
 * @lang zh-CN 验证 Tool 源码未引入网络、子进程、项目脚本或包管理器执行入口，保持公开的开发期隔离边界。
 * @lang en Verifies that Tool source introduces no network, subprocess, project-script, or package-manager execution entry, preserving the public development-time isolation boundary.
 */
test('keeps Tool source free of execution and network imports', async () => {
  const sourceFiles = ['config.mjs', 'report.mjs', 'index.mjs', 'cli.mjs'];
  const source = await Promise.all(sourceFiles.map((fileName) => readFile(resolve('HIA-uView-Tool/src', fileName), 'utf8')));
  const combined = source.join('\n');

  assert.doesNotMatch(combined, /node:child_process|from ['"]child_process['"]/);
  assert.doesNotMatch(combined, /\bfetch\s*\(/);
  assert.doesNotMatch(combined, /https?:\/\//);
  assert.doesNotMatch(combined, /npm\s+(?:install|exec)|git\s+(?:run|push)/);
});
