#!/usr/bin/env node
/**
 * @module hia-uview-tool-cli
 * @lang zh-CN HIA-uView-Tool 的最小命令行入口，仅转交 doctor/check/inspect 的只读 JSON 调用，不接受项目脚本、动态配置或写入执行。
 * @lang en Minimal command-line entry for HIA-uView-Tool that delegates only read-only doctor, check, and inspect JSON invocation and accepts no project-script, dynamic-configuration, or write execution.
 */

// <lang><zh-CN>导入受限领域调用入口；CLI 不直接读取项目 metadata，也不拥有 network、subprocess 或写入能力。</zh-CN><en>Imports the constrained domain invocation entry; the CLI neither reads project metadata directly nor owns network, subprocess, or write capability.</en></lang>
import { runToolCli } from './index.mjs';

// <lang><zh-CN>将 Node 进程参数去除解释器/入口部分后原样交给受限 parser，并将稳定退出码写回进程；不创建缓存、日志或临时文件。</zh-CN><en>Passes Node process arguments without interpreter and entry parts unchanged to the constrained parser and writes the stable exit code back to the process; creates no cache, log, or temporary file.</en></lang>
process.exitCode = await runToolCli(process.argv.slice(2));
