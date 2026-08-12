/**
 * @module verify-p14-component-contract.test
 * @lang zh-CN 验证 P14 的 UModal、UNotice、UEmpty 声明、token、源码边界与最小 ROP 注释形态；静态验证不替代 Vue runtime、UniApp compiler、真机、读屏、焦点、动画或层叠证据。
 * @lang en Verifies P14 UModal, UNotice, and UEmpty declarations, tokens, source boundaries, and minimum ROP comment form; static validation does not replace Vue runtime, UniApp compiler, device, screen-reader, focus, animation, or layering evidence.
 */

// <lang><zh-CN>导入 Node 的本地断言、文件读取、路径解析与测试入口；测试不访问网络、子进程或仓库外部输入。</zh-CN><en>Imports Node local assertions, file reading, path resolution, and test entry; the test accesses no network, child process, or repository-external input.</en></lang>
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

// <lang><zh-CN>三项 P14 组件的稳定 manifest 名称、源码、样式和公开契约路径；所有路径相对仓库根，避免测试依赖机器路径。</zh-CN><en>Stable manifest names, source, style, and public-contract paths for the three P14 components; every path is repository-relative so tests do not depend on host paths.</en></lang>
const p14ComponentRecords = Object.freeze([
  Object.freeze({ name: 'u-modal', source: 'HIA-uView-UI/src/components/u-modal/u-modal.vue', style: 'HIA-uView-UI/src/components/u-modal/u-modal.css', contract: 'docs/modal.md' }),
  Object.freeze({ name: 'u-notice', source: 'HIA-uView-UI/src/components/u-notice/u-notice.vue', style: 'HIA-uView-UI/src/components/u-notice/u-notice.css', contract: 'docs/notice.md' }),
  Object.freeze({ name: 'u-empty', source: 'HIA-uView-UI/src/components/u-empty/u-empty.vue', style: 'HIA-uView-UI/src/components/u-empty/u-empty.css', contract: 'docs/empty.md' })
]);

/**
 * @lang zh-CN 验证 manifest、源码、样式和公开契约对三项 P14 组件使用同一稳定名称与仓库内路径，且 manifest 仍不承担 runtime registry 职责。
 * @lang en Verifies that manifest, source, style, and public contracts use the same stable names and repository-local paths for the three P14 components while the manifest still has no runtime-registry responsibility.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps P14 component declarations aligned with their contracts', async () => {
  // <lang><zh-CN>读取版本控制的声明式 manifest；它只服务开发期一致性验证。</zh-CN><en>Reads the version-controlled declarative manifest; it serves development-time consistency verification only.</en></lang>
  const manifestText = await readFile(resolve('HIA-uView-UI/hia-uview.components.json'), 'utf8');

  // <lang><zh-CN>解析本地 JSON 为组件记录集合，供按名称而非数组位置核对。</zh-CN><en>Parses local JSON into a component-record collection for checking by name rather than array position.</en></lang>
  const manifest = JSON.parse(manifestText);

  // <lang><zh-CN>按名称建立索引，使每一项 P14 声明都能独立给出缺失或漂移证据。</zh-CN><en>Builds a name index so every P14 declaration can independently yield missing or drift evidence.</en></lang>
  const manifestByName = new Map(manifest.components.map((component) => [component.name, component]));

  // <lang><zh-CN>逐项核对稳定名称、相对路径和可读性，防止公开契约、Tool 输入和 runtime 源码漂移。</zh-CN><en>Checks stable name, relative paths, and readability item by item, preventing drift among public contract, Tool input, and runtime source.</en></lang>
  for (const componentRecord of p14ComponentRecords) {
    // <lang><zh-CN>取得当前组件的 manifest 记录；缺失会产生直接的组件级断言失败。</zh-CN><en>Gets the manifest record for the current component; absence produces a direct component-level assertion failure.</en></lang>
    const manifestRecord = manifestByName.get(componentRecord.name);

    assert.ok(manifestRecord, `Manifest must declare ${componentRecord.name}.`);
    assert.equal(manifestRecord.source, componentRecord.source.replace('HIA-uView-UI/', ''));
    assert.equal(manifestRecord.contract, componentRecord.contract);

    // <lang><zh-CN>确认 Vue 源码、局部 CSS 和公开契约均位于本仓，而非通过外部路径或隐式共享文件提供。</zh-CN><en>Confirms Vue source, local CSS, and public contract all reside in this repository rather than being supplied through external paths or implicit shared files.</en></lang>
    await access(resolve(componentRecord.source));
    await access(resolve(componentRecord.style));
    await access(resolve(componentRecord.contract));
  }
});

/**
 * @lang zh-CN 验证 P14 源码维持受控可见状态、局部反馈和静态空态边界，且含有当前 ROP 双语注释表面。
 * @lang en Verifies that P14 source retains controlled visible state, local feedback, and static empty-state boundaries and contains the current ROP bilingual comment surface.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps P14 source inside controlled feedback and ROP boundaries', async () => {
  // <lang><zh-CN>读取三份本地 Vue 源码；内容只用于静态边界断言，不写入输出、缓存或外部服务。</zh-CN><en>Reads the three local Vue sources; content is used only for static boundary assertions and is not written to output, cache, or an external service.</en></lang>
  const componentSources = await Promise.all(p14ComponentRecords.map((componentRecord) => readFile(resolve(componentRecord.source), 'utf8')));

  // <lang><zh-CN>按稳定记录顺序分离源码，使组件专属断言不依赖字符串搜索的偶然顺序。</zh-CN><en>Separates sources in stable record order so component-specific assertions do not depend on accidental string-search order.</en></lang>
  const [modalSource, noticeSource, emptySource] = componentSources;

  // <lang><zh-CN>合并源码用于统一扫描真实副作用 API；扫描目标是可执行 API 形态，不把注释中的边界说明误判为行为。</zh-CN><en>Combines sources for unified scanning of real side-effect APIs; scan targets executable API shapes and does not mistake boundary prose in comments for behavior.</en></lang>
  const combinedSource = componentSources.join('\n');

  // <lang><zh-CN>禁止模式代表本 W 排除的计时器、native API、portal、请求、持久化、日志、路由和原生能力；命中必须停止实现并重新取得决定。</zh-CN><en>Forbidden patterns represent timers, native APIs, portal, request, persistence, logging, routing, and native capability excluded by this W; a match requires implementation to stop and obtain a new decision.</en></lang>
  const forbiddenPatterns = [
    /\bset(?:Timeout|Interval)\s*\(/,
    /<Teleport\b/,
    /\buni\.[A-Za-z]/,
    /\bfetch\s*\(/,
    /\b(?:localStorage|sessionStorage)\s*\./,
    /\bconsole\s*\./,
    /\buni\.navigate(?:To|Back|RedirectTo|ReLaunch|SwitchTab)?\s*\(/,
    /\bopen-type\s*=/
  ];

  // <lang><zh-CN>逐条应用边界扫描，确保失败信息能归因到具体被禁止的运行时能力。</zh-CN><en>Applies boundary scans one by one so a failure can be attributed to the specific prohibited runtime capability.</en></lang>
  for (const forbiddenPattern of forbiddenPatterns) {
    assert.doesNotMatch(combinedSource, forbiddenPattern);
  }

  // <lang><zh-CN>每份新增 Vue 源码都必须同时具有节点级 zh-CN/en 文档和普通 inline lang 叙事，作为 ROP 人工审查的最小自动化哨兵。</zh-CN><en>Every new Vue source must contain node-level zh-CN/en documentation and ordinary inline lang narration, acting as a minimum automated sentinel for ROP human review.</en></lang>
  for (const componentSource of componentSources) {
    assert.match(componentSource, /@lang zh-CN/);
    assert.match(componentSource, /@lang en/);
    assert.match(componentSource, /<lang><zh-CN>/);
  }

  // <lang><zh-CN>UModal 必须把 caller-controlled 可见性与显式 service session 分层，并保留 confirm/cancel、可拒绝 modelValue 请求和具名 control guards。</zh-CN><en>UModal must layer caller-controlled visibility and an explicit service session while retaining confirm/cancel, rejectable modelValue requests, and named-control guards.</en></lang>
  assert.match(modalSource, /v-if="isVisible"/);
  assert.match(modalSource, /defineEmits\(\['confirm', 'cancel', 'update:modelValue'\]\)/);
  assert.match(modalSource, /const controlledVisible = computed\(\(\) => props\.visible \?\? props\.modelValue\);/);
  assert.match(modalSource, /const isVisible = computed\(\(\) => hasServiceSession\.value \|\| controlledVisible\.value\);/);
  assert.match(modalSource, /if \(!isVisible\.value \|\| !hasConfirmControl\.value \|\| isConfirmLoading\.value\)/);
  assert.match(modalSource, /if \(!isVisible\.value \|\| !hasCancelControl\.value\)/);
  assert.match(modalSource, /serviceHost: \{ type: Boolean, default: false \}/);
  assert.match(modalSource, /emit\('update:modelValue', false\);/);

  // <lang><zh-CN>UNotice 必须将未知 tone 规范化为有限 info 类，并以 visible 加非空 message 形成展示/事件 guard。</zh-CN><en>UNotice must normalize unknown tone to finite info class and form display/event guard from visible plus non-empty message.</en></lang>
  assert.match(noticeSource, /Object\.freeze\(\['info', 'success', 'warning', 'error'\]\)/);
  assert.match(noticeSource, /supportedTones\.includes\(props\.tone\) \? props\.tone : 'info'/);
  assert.match(noticeSource, /props\.visible && props\.message\.length > 0/);
  assert.match(noticeSource, /defineEmits\(\['dismiss'\]\)/);

  // <lang><zh-CN>UEmpty 只拥有文字与可选 action 意图，不能声明数据数组、loading 或分页输入。</zh-CN><en>UEmpty owns only text and optional action intent and cannot declare data-array, loading, or paging input.</en></lang>
  assert.match(emptySource, /defineEmits\(\['action'\]\)/);
  assert.match(emptySource, /if \(!hasActionControl\.value\)/);
  assert.doesNotMatch(emptySource, /\b(?:items|dataSource|loading|pageSize)\s*:/);
});

/**
 * @lang zh-CN 验证默认浅色主题定义 P14 实现实际消费且公开文档承诺的关键 token，避免组件退回未记录的硬编码视觉值。
 * @lang en Verifies that the default light theme defines key tokens actually consumed and publicly promised by P14 implementation, preventing components from returning to undocumented hard-coded visual values.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('defines documented P14 component tokens in the default theme', async () => {
  // <lang><zh-CN>读取受版本控制的默认主题 CSS；不依赖浏览器计算样式或平台全局变量。</zh-CN><en>Reads version-controlled default theme CSS; it does not depend on browser computed styles or platform global variables.</en></lang>
  const themeCss = await readFile(resolve('HIA-uView-UI/src/theme/hia-light.css'), 'utf8');

  // <lang><zh-CN>列出三个组件实现关键样式路径消费的 token；列表是 theme、CSS 与公开契约之间的可审计接口。</zh-CN><en>Lists tokens consumed by key style paths of the three components; the list is an auditable interface among theme, CSS, and public contract.</en></lang>
  const requiredTokens = [
    '--u-comp-modal-mask-surface',
    '--u-comp-modal-panel-surface',
    '--u-comp-modal-panel-border',
    '--u-comp-modal-max-width',
    '--u-comp-modal-layer',
    '--u-comp-notice-info-surface',
    '--u-comp-notice-success-surface',
    '--u-comp-notice-warning-border',
    '--u-comp-notice-error-border',
    '--u-comp-notice-marker-min-width',
    '--u-comp-empty-surface',
    '--u-comp-empty-border',
    '--u-comp-empty-title-foreground',
    '--u-comp-empty-max-width'
  ];

  // <lang><zh-CN>逐项确认主题有明确声明；缺失 token 会在静态层失败，而不是留到应用视觉异常时才发现。</zh-CN><en>Confirms explicit theme declaration item by item; a missing token fails at the static layer rather than surfacing later as an application visual defect.</en></lang>
  for (const requiredToken of requiredTokens) {
    assert.match(themeCss, new RegExp(`${requiredToken}:`));
  }
});
