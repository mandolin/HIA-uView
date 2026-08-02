/**
 * @module h5-fixture-output
 * @lang zh-CN 验证 H5 fixture 输出包含本地应用、HIA-uView 样式和可复核 smoke 文本，不执行浏览器或网络。
 * @lang en Verifies H5 fixture output contains the local app, HIA-uView style, and inspectable smoke text without browser or network execution.
 */

import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

// <lang><zh-CN>读取静态输出目录并筛选入口 HTML，避免将任意生成文件当作证据。</zh-CN><en>Reads the static output directory and selects entry HTML so arbitrary generated files are not treated as evidence.</en></lang>
const outputDirectory = fileURLToPath(new URL('./dist/', import.meta.url));
await access(outputDirectory);
const outputFiles = await readdir(outputDirectory, { recursive: true });
const htmlFile = outputFiles.find((file) => file.endsWith('.html'));
assert.ok(htmlFile, 'H5 fixture must generate an HTML entry.');
const html = await readFile(resolve(outputDirectory, htmlFile), 'utf8');
assert.match(html, /HIA-uView H5 fixture/);
assert.doesNotMatch(html, /http:\/\//i);
assert.doesNotMatch(html, /https:\/\//i);
// <lang><zh-CN>模板文字会被编译到 JavaScript，HTML 只保留入口壳；合并静态资产后检查 smoke 标识。</zh-CN><en>Template text is compiled into JavaScript while HTML retains only the entry shell; merge static assets before checking smoke markers.</en></lang>
const assetFiles = outputFiles.filter((file) => file.endsWith('.js') || file.endsWith('.css'));
const assetText = await Promise.all(assetFiles.map((file) => readFile(resolve(outputDirectory, file), 'utf8')));
const combinedOutput = [html, ...assetText].join('\n');
assert.match(combinedOutput, /data-smoke/);
assert.match(combinedOutput, /u-select|u-slider|u-dropdown/);
console.log('HIA-uView H5 fixture output contract passed.');
