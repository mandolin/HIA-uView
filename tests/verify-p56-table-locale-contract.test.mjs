/**
 * @module verify-p56-table-locale-contract.test
 * @lang zh-CN 验证四项 view table 组件及受限 UConfigProvider locale context 的声明、ROP、token 和平台中立边界；本测试不启动网络、dev server、系统语言读取、存储或平台 API。
 * @lang en Verifies declarations, ROP, tokens, and platform-neutral boundaries for four view-table components and constrained UConfigProvider locale context; this test starts no network, dev server, system-language read, storage, or platform API.
 */

import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

// <lang><zh-CN>逐项锁定 table family 的稳定名称、导出、公开契约与 token 前缀，防止 view table 被误改为数据服务或空壳目录。</zh-CN><en>Locks stable names, exports, public contracts, and token prefixes for the table family, preventing a view table from being changed into a data service or empty directory.</en></lang>
const tableRecords = Object.freeze([
  Object.freeze({ name: 'u-table', exportName: 'UTable', contract: 'docs/table.md', token: '--u-comp-table-' }),
  Object.freeze({ name: 'u-tr', exportName: 'UTr', contract: 'docs/tr.md', token: '--u-comp-tr-' }),
  Object.freeze({ name: 'u-th', exportName: 'UTh', contract: 'docs/th.md', token: '--u-comp-th-' }),
  Object.freeze({ name: 'u-td', exportName: 'UTd', contract: 'docs/td.md', token: '--u-comp-td-' })
]);

/**
 * @lang zh-CN 解析锁定 table 组件的同名源码和样式路径；名称仅来自本地有限记录。
 * @lang en Resolves same-named source and style paths for a locked table component; the name comes only from finite local records.
 * @param {{name: string}} record <lang><zh-CN>锁定组件记录。</zh-CN><en>Locked component record.</en></lang>
 * @returns {{source: string, style: string}} <lang><zh-CN>相对仓库根的源码与样式路径。</zh-CN><en>Source and style paths relative to repository root.</en></lang>
 */
function componentPaths(record) {
  // <lang><zh-CN>同名目录保持 manifest、源文件和样式文件的可审计一一对应。</zh-CN><en>The same-named directory retains auditable one-to-one correspondence among manifest, source, and style files.</en></lang>
  const componentRoot = `HIA-uView-UI/src/components/${record.name}`;
  return Object.freeze({ source: `${componentRoot}/${record.name}.vue`, style: `${componentRoot}/${record.name}.css` });
}

/**
 * @lang zh-CN 验证 table family 及 config-locale helper 在 manifest、公开文档、源码、样式和 runtime entry 中对齐。
 * @lang en Verifies that table family and config-locale helper align across manifest, public documentation, source, styles, and runtime entry.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps view-table declarations and locale helper aligned', async () => {
  // <lang><zh-CN>按名称索引 manifest，避免依赖新增条目的偶然位置。</zh-CN><en>Indexes the manifest by name, avoiding dependence on accidental position of new entries.</en></lang>
  const manifest = JSON.parse(await readFile(resolve('HIA-uView-UI/hia-uview.components.json'), 'utf8'));
  const manifestByName = new Map(manifest.components.map((component) => [component.name, component]));
  const publicIndex = await readFile(resolve('HIA-uView-UI/src/index.mjs'), 'utf8');

  for (const record of tableRecords) {
    // <lang><zh-CN>每项必须有双语 manifest、存在的公开文件与命名 export，不能以 HTML table alias 或私有文档代替。</zh-CN><en>Every item must have bilingual manifest data, existing public files, and a named export; no HTML-table alias or private document can substitute.</en></lang>
    const manifestRecord = manifestByName.get(record.name);
    const paths = componentPaths(record);
    assert.ok(manifestRecord, `Manifest must declare ${record.name}.`);
    assert.equal(manifestRecord.source, paths.source.replace('HIA-uView-UI/', ''));
    assert.equal(manifestRecord.contract, record.contract);
    assert.deepEqual(manifestRecord.locales, ['zh-Hans', 'en']);
    assert.match(publicIndex, new RegExp(`\\b${record.exportName}\\b`));
    await access(resolve(paths.source));
    await access(resolve(paths.style));
    await access(resolve(record.contract));
  }

  // <lang><zh-CN>locale helper 只经公开 runtime entry 明确导出；它不成为自动全局安装或翻译资源入口。</zh-CN><en>The locale helper is explicitly exported only through the public runtime entry; it does not become automatic global installation or translation-resource entry.</en></lang>
  const localeSource = await readFile(resolve('HIA-uView-UI/src/config-locale.mjs'), 'utf8');
  const providerSource = await readFile(resolve('HIA-uView-UI/src/components/u-config-provider/u-config-provider.vue'), 'utf8');
  assert.match(publicIndex, /\buseULocale\b/);
  assert.match(publicIndex, /\bnormalizeULocale\b/);
  assert.match(localeSource, /U_SUPPORTED_LOCALES/);
  assert.match(localeSource, /'zh-Hans'/);
  assert.match(localeSource, /'en'/);
  assert.match(providerSource, /data-u-locale/);
  assert.match(providerSource, /provide\(U_LOCALE_CONTEXT/);
  assert.match(localeSource, /inject\(U_LOCALE_CONTEXT, null\)/);
  assert.ok(manifest.components.length >= 107);
});

/**
 * @lang zh-CN 验证 view table 排除数据/布局/平台服务，locale helper 仅用受限 context 而不读取系统、存储、网络或翻译资源。
 * @lang en Verifies that view tables exclude data/layout/platform services and the locale helper uses constrained context only without system, storage, network, or translation resources.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps table data-agnostic and locale context local', async () => {
  // <lang><zh-CN>先移除说明性注释再检查 executable 内容，避免边界文案本身误触发禁令。</zh-CN><en>Removes explanatory comments before inspecting executable content, preventing boundary copy itself from triggering prohibitions.</en></lang>
  const tableSources = await Promise.all(tableRecords.map((record) => readFile(resolve(componentPaths(record).source), 'utf8')));
  const tableStyles = await Promise.all(tableRecords.map((record) => readFile(resolve(componentPaths(record).style), 'utf8')));
  const tableExecutable = [...tableSources, ...tableStyles].join('\n').replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const tableForbidden = [
    /\bset(?:Timeout|Interval)\s*\(/,
    /\brequestAnimationFrame\s*\(/,
    /\b(?:fetch|uni\.request)\s*\(/,
    /\buni\.[A-Za-z]/,
    /\b(?:localStorage|sessionStorage)\s*\./,
    /\b(?:getBoundingClientRect|clientHeight|offsetHeight)\b/,
    /\b(?:inject|provide)\s*\(/,
    /\b(?:sort|filter|page|query)\s*\(/,
    /<table\b/i,
    /<script[^>]+src=/i,
    /data:image\//i,
    /@font-face/i
  ];

  for (const pattern of tableForbidden) assert.doesNotMatch(tableExecutable, pattern);
  for (const [index, source] of tableSources.entries()) {
    // <lang><zh-CN>模块级与行内 ROP 双语注释共同保持每项 table source 的可审阅边界。</zh-CN><en>Module-level and inline ROP bilingual comments jointly retain reviewable boundaries for every table source.</en></lang>
    assert.match(source, /@lang zh-CN/, tableRecords[index].name);
    assert.match(source, /@lang en/, tableRecords[index].name);
    assert.match(source, /<lang><zh-CN>/, tableRecords[index].name);
  }

  // <lang><zh-CN>locale source/provider 特许且只特许当前 Vue context 的 provide/inject；其余动态来源仍被禁止。</zh-CN><en>Locale source/provider permits only the current Vue-context provide/inject; every other dynamic source remains prohibited.</en></lang>
  const localeSource = await readFile(resolve('HIA-uView-UI/src/config-locale.mjs'), 'utf8');
  const providerSource = await readFile(resolve('HIA-uView-UI/src/components/u-config-provider/u-config-provider.vue'), 'utf8');
  const localeExecutable = `${localeSource}\n${providerSource}`.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const localeForbidden = [
    /\bset(?:Timeout|Interval)\s*\(/,
    /\b(?:fetch|uni\.request)\s*\(/,
    /\buni\.[A-Za-z]/,
    /\b(?:localStorage|sessionStorage)\s*\./,
    /\b(?:navigator|window|document)\b/,
    /\b(?:Intl|i18n|translate)\b/,
    /<script[^>]+src=/i
  ];

  for (const pattern of localeForbidden) assert.doesNotMatch(localeExecutable, pattern);
  assert.match(localeSource, /@lang zh-CN/);
  assert.match(localeSource, /@lang en/);
  assert.match(localeSource, /<lang><zh-CN>/);
  assert.match(providerSource, /@lang zh-CN/);
  assert.match(providerSource, /@lang en/);
  assert.match(providerSource, /<lang><zh-CN>/);
});

/**
 * @lang zh-CN 验证默认主题为四个 table token 族提供权威初值。
 * @lang en Verifies that the default theme supplies authoritative initial values for four table token families.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('defines view-table token families in the default theme', async () => {
  // <lang><zh-CN>逐族检查避免已有 token 掩盖某个 table source 漏掉主题初值。</zh-CN><en>Checks each family so existing tokens cannot mask a missing initial value for a table source.</en></lang>
  const themeCss = await readFile(resolve('HIA-uView-UI/src/theme/hia-light.css'), 'utf8');
  for (const record of tableRecords) assert.match(themeCss, new RegExp(`${record.token}[^:]*:`));
});
