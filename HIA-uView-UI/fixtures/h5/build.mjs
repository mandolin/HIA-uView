/**
 * @module h5-fixture-build
 * @lang zh-CN 执行一次本地 H5 构建；不启动开发服务器、不访问网络、不发布 Pages。
 * @lang en Performs one local H5 build; starts no dev server, accesses no network, and publishes no Pages site.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

// <lang><zh-CN>使用已审阅的静态配置完成构建，输出由 verify-output.mjs 检查。</zh-CN><en>Builds with the reviewed static configuration; verify-output.mjs checks the output.</en></lang>
const execFileAsync = promisify(execFile);
const viteBin = fileURLToPath(new URL('../../../node_modules/vite/bin/vite.js', import.meta.url));
const configFile = fileURLToPath(new URL('./vite.config.mjs', import.meta.url));
await execFileAsync(process.execPath, [viteBin, 'build', '--config', configFile], { stdio: 'inherit' });
