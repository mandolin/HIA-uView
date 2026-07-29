import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

/**
 * @module verify-p12-component-contract.test
 * @lang zh-CN 验证 P12 的 UStack、UNavBar 与 UCell 声明、token、源码边界和最小 ROP 注释形态；静态验证不替代 Vue runtime、UniApp compiler、真机或读屏证据。
 * @lang en Verifies P12 UStack, UNavBar, and UCell declarations, tokens, source boundaries, and minimum ROP comment form; static validation does not replace Vue runtime, UniApp compiler, device, or screen-reader evidence.
 */

// <lang><zh-CN>三项 P12 组件的 manifest 名称、源码路径和公开契约路径；路径全部相对仓库根，避免测试依赖机器路径。</zh-CN><en>Manifest names, source paths, and public contract paths for the three P12 components; every path is repository-relative so tests do not depend on host paths.</en></lang>
const p12ComponentRecords = Object.freeze([
  Object.freeze({ name: 'u-stack', source: 'HIA-uView-UI/src/components/u-stack/u-stack.vue', contract: 'docs/stack.md' }),
  Object.freeze({ name: 'u-nav-bar', source: 'HIA-uView-UI/src/components/u-nav-bar/u-nav-bar.vue', contract: 'docs/nav-bar.md' }),
  Object.freeze({ name: 'u-cell', source: 'HIA-uView-UI/src/components/u-cell/u-cell.vue', contract: 'docs/cell.md' })
]);

/**
 * @lang zh-CN 验证 manifest、源码和公开契约对三项 P12 组件使用同一稳定名称与仓库内路径，不为 Tool 引入运行时 registry。
 * @lang en Verifies that manifest, source, and public contracts use the same stable names and repository-local paths for the three P12 components without introducing a runtime registry for Tool.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps P12 component declarations aligned with their contracts', async () => {
  // <lang><zh-CN>读取声明式 manifest；该 JSON 只作为开发期验证输入，不承担 runtime 注册职责。</zh-CN><en>Reads the declarative manifest; this JSON serves development-time validation input only and has no runtime-registration responsibility.</en></lang>
  const manifestText = await readFile(resolve('HIA-uView-UI/hia-uview.components.json'), 'utf8');

  // <lang><zh-CN>解析 manifest 为可审阅的组件记录集合；输入来自受版本控制的本地 JSON。</zh-CN><en>Parses the manifest into an auditable component-record collection; input comes from version-controlled local JSON.</en></lang>
  const manifest = JSON.parse(manifestText);

  // <lang><zh-CN>按名称索引 manifest 记录，使每项 P12 契约可独立核对其源码和文档路径。</zh-CN><en>Indexes manifest records by name so every P12 contract can independently check its source and documentation path.</en></lang>
  const manifestByName = new Map(manifest.components.map((component) => [component.name, component]));

  // <lang><zh-CN>逐项核对稳定名称、manifest 映射、公开契约可读性和源码可读性，防止 Tool 与 runtime 事实漂移。</zh-CN><en>Checks stable name, manifest mapping, public-contract readability, and source readability for every record, preventing Tool and runtime facts from drifting.</en></lang>
  for (const componentRecord of p12ComponentRecords) {
    // <lang><zh-CN>取得当前名称的 manifest 记录；缺失时后续断言给出直接的组件级失败。</zh-CN><en>Gets the manifest record for the current name; when absent, the following assertion yields a direct component-level failure.</en></lang>
    const manifestRecord = manifestByName.get(componentRecord.name);

    assert.ok(manifestRecord, `Manifest must declare ${componentRecord.name}.`);
    assert.equal(manifestRecord.source, componentRecord.source.replace('HIA-uView-UI/', ''));
    assert.equal(manifestRecord.contract, componentRecord.contract);

    // <lang><zh-CN>验证契约与源码都存在于仓库内，而非通过外部路径、包安装或隐式共享文件提供。</zh-CN><en>Verifies that both contract and source exist inside the repository rather than being supplied through external paths, package installation, or implicit shared files.</en></lang>
    await access(resolve(componentRecord.contract));
    await access(resolve(componentRecord.source));
  }
});

/**
 * @lang zh-CN 验证 P12 组件源码维持已批准的无路由、无系统栏、无图标/字体、无网络和无 Tool runtime 依赖边界，并含有当前 ROP 双语注释表面。
 * @lang en Verifies that P12 component source retains approved no-route, no-system-bar, no-icon/font, no-network, and no-Tool-runtime dependency boundaries and contains the current ROP bilingual comment surface.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps P12 source inside its presentation and ROP boundaries', async () => {
  // <lang><zh-CN>收集三份 Vue 源码；内容只用于本地静态边界断言，不写入输出或报告。</zh-CN><en>Collects the three Vue sources; content is used only for local static-boundary assertions and is not written to output or reports.</en></lang>
  const componentSources = await Promise.all(p12ComponentRecords.map((componentRecord) => readFile(resolve(componentRecord.source), 'utf8')));

  // <lang><zh-CN>合并源码以便统一扫描禁止能力；组件级 API 仍在后续单独断言。</zh-CN><en>Combines source for a unified prohibited-capability scan; component-level APIs are still asserted separately below.</en></lang>
  const combinedSource = componentSources.join('\n');

  // <lang><zh-CN>禁止字符串代表本 W 明确排除的平台、路由、资产、网络与 Tool runtime 能力；命中意味着必须停止并重新取得决定。</zh-CN><en>Forbidden strings represent platform, route, asset, network, and Tool-runtime capabilities explicitly excluded by this W; a match requires stopping and obtaining a new decision.</en></lang>
  const forbiddenPatterns = [
    /\buni\.navigate(?:To|Back|RedirectTo|ReLaunch|SwitchTab)?\s*\(/,
    /\bopen-type\s*=/,
    /\b(?:statusBar|safeArea)\s*:/,
    /from\s+['"][^'"]*node:child_process['"]/,
    /\bfetch\s*\(/,
    /from\s+['"][^'"]*HIA-uView-Tool/
  ];

  // <lang><zh-CN>逐条应用边界扫描，确保失败信息能指出被禁止能力而不是只报告模糊的综合错误。</zh-CN><en>Applies boundary scans one by one so failure messages identify the prohibited capability rather than reporting only an ambiguous combined error.</en></lang>
  for (const forbiddenPattern of forbiddenPatterns) {
    assert.doesNotMatch(combinedSource, forbiddenPattern);
  }

  // <lang><zh-CN>每份新增 Vue 源码都必须同时具有节点级 zh-CN/en 文档和普通 inline lang 叙事，作为 ROP 人工审查的最小自动化哨兵。</zh-CN><en>Every new Vue source must contain node-level zh-CN/en documentation and ordinary inline lang narration, acting as a minimum automated sentinel for ROP human review.</en></lang>
  for (const componentSource of componentSources) {
    assert.match(componentSource, /@lang zh-CN/);
    assert.match(componentSource, /@lang en/);
    assert.match(componentSource, /<lang><zh-CN>/);
  }

  // <lang><zh-CN>UStack 必须保留受限 layout props，且不添加事件；该断言防止布局原语悄然取得页面或交互职责。</zh-CN><en>UStack must retain constrained layout props and add no events; this assertion prevents the layout primitive from silently acquiring page or interaction responsibility.</en></lang>
  const stackSource = componentSources[0];
  assert.match(stackSource, /direction:/);
  assert.match(stackSource, /gap:/);
  assert.match(stackSource, /align:/);
  assert.match(stackSource, /justify:/);
  assert.match(stackSource, /wrap:/);
  assert.doesNotMatch(stackSource, /defineEmits/);

  // <lang><zh-CN>UNavBar 只能声明 title/back/action 表面和两个纯意图事件，不能出现 route/path 输入。</zh-CN><en>UNavBar may declare only title/back/action surface and two pure intent events; route/path inputs cannot appear.</en></lang>
  const navBarSource = componentSources[1];
  assert.match(navBarSource, /defineEmits\(\['back', 'action'\]\)/);
  assert.doesNotMatch(navBarSource, /\b(?:route|path)\s*:/);

  // <lang><zh-CN>UCell 的 click 必须受到 clickable/disabled guard 保护，保证默认信息行和禁用行都不 emit 操作。</zh-CN><en>UCell click must be protected by the clickable/disabled guard, ensuring default informational and disabled rows emit no action.</en></lang>
  const cellSource = componentSources[2];
  assert.match(cellSource, /!props\.clickable \|\| props\.disabled/);
  assert.match(cellSource, /if \(isInactive\.value\)/);
  assert.match(cellSource, /emit\('click', event\)/);
});

/**
 * @lang zh-CN 验证默认浅色主题为三项 P12 组件定义全部已文档化 token，确保实现不以未记录的硬编码视觉值替代公开主题边界。
 * @lang en Verifies that the default light theme defines every documented token for the three P12 components, ensuring implementation does not replace the public theme boundary with undocumented hard-coded visual values.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('defines all documented P12 component tokens in the default theme', async () => {
  // <lang><zh-CN>读取受版本控制的默认主题 CSS；不依赖浏览器计算样式或平台全局变量。</zh-CN><en>Reads version-controlled default theme CSS; it does not depend on browser computed styles or platform globals.</en></lang>
  const themeCss = await readFile(resolve('HIA-uView-UI/src/theme/hia-light.css'), 'utf8');

  // <lang><zh-CN>列出 P12 实现实际消费的 token 前缀/完整名；列表同时是主题和 CSS 规则之间的可审计接口。</zh-CN><en>Lists token prefixes/full names actually consumed by P12 implementation; the list is an auditable interface between theme and CSS rules.</en></lang>
  const requiredTokens = [
    '--u-comp-stack-gap-sm',
    '--u-comp-stack-gap-md',
    '--u-comp-stack-gap-lg',
    '--u-comp-nav-bar-surface',
    '--u-comp-nav-bar-control-min-height',
    '--u-comp-nav-bar-focus-ring',
    '--u-comp-cell-surface',
    '--u-comp-cell-disabled-opacity',
    '--u-comp-cell-focus-ring'
  ];

  // <lang><zh-CN>逐项验证 token 在主题中有明确声明；空洞 token 会在这个静态层先失败，而不是留到应用样式异常。</zh-CN><en>Verifies every token has an explicit theme declaration; missing tokens fail at this static layer rather than surfacing later as application-style anomalies.</en></lang>
  for (const requiredToken of requiredTokens) {
    assert.match(themeCss, new RegExp(`${requiredToken}:`));
  }
});
