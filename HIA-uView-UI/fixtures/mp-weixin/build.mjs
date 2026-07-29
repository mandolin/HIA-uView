/**
 * @module mp-weixin-fixture-build
 * @lang zh-CN 使用受控 UI-package 输入根构建本仓 mp-weixin fixture；入口不启动开发服务器、微信开发者工具、网络、预览或发布。
 * @lang en Builds the repository's mp-weixin fixture with a controlled UI-package input root; the entry starts no development server, WeChat DevTools, network, preview, or release operation.
 */

import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const fixtureDirectory = dirname(fileURLToPath(import.meta.url));
const uiPackageDirectory = resolve(fixtureDirectory, '../..');
const compilerEntry = resolve(fixtureDirectory, '../../../node_modules/@dcloudio/vite-plugin-uni/bin/uni.js');

/**
 * @lang zh-CN 以固定的 UI-package 输入根运行官方已锁定 compiler，并继承最小环境；子进程退出码原样传回调用方。
 * @lang en Runs the locked official compiler with a fixed UI-package input root and a minimal inherited environment; returns the child-process exit code unchanged to the caller.
 * @returns {Promise<number>} <lang><zh-CN>compiler 进程退出码。</zh-CN><en>Compiler-process exit code.</en></lang>
 */
function buildFixture() {
  return new Promise((resolveExitCode, reject) => {
    // <lang><zh-CN>固定 cwd 保留 fixture 自己的 package metadata 和 Vite 配置；固定 UNI_INPUT_DIR 将页面与同仓 UI source 置于同一 compiler 输入树。</zh-CN><en>The fixed cwd retains the fixture's own package metadata and Vite configuration; the fixed UNI_INPUT_DIR places the page and in-repository UI source in one compiler input tree.</en></lang>
    const compiler = spawn(
      process.execPath,
      [compilerEntry, 'build', '-p', 'mp-weixin'],
      {
        cwd: fixtureDirectory,
        env: { ...process.env, UNI_INPUT_DIR: uiPackageDirectory },
        stdio: 'inherit'
      }
    );

    compiler.once('error', reject);
    compiler.once('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`mp-weixin fixture compiler ended from signal ${signal}.`));
        return;
      }
      resolveExitCode(code ?? 1);
    });
  });
}

const exitCode = await buildFixture();
process.exitCode = exitCode;
