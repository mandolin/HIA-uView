#!/usr/bin/env node
/**
 * @module hia-uview-tool-cli
 * @lang zh-CN HIA-uView-Tool 的最小命令行入口，仅转交 doctor/check 的只读调用，不接受项目脚本或动态配置执行。
 * @lang en Minimal command-line entry for HIA-uView-Tool that delegates only the read-only doctor/check invocation and accepts no project-script or dynamic-configuration execution.
 */

import { runToolCli } from './index.mjs';

process.exitCode = await runToolCli(process.argv.slice(2));
