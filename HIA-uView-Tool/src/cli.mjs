#!/usr/bin/env node
/**
 * @module hia-uview-tool-cli
 * @lang zh-CN HIA-uView-Tool 的最小命令行入口，仅转交 doctor/check/inspect 的只读 JSON 调用，不接受项目脚本、动态配置或写入执行。
 * @lang en Minimal command-line entry for HIA-uView-Tool that delegates only read-only doctor, check, and inspect JSON invocation and accepts no project-script, dynamic-configuration, or write execution.
 */

import { runToolCli } from './index.mjs';

process.exitCode = await runToolCli(process.argv.slice(2));
