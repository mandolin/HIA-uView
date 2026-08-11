/**
 * @module verify-p13-component-contract.test
 * @lang zh-CN 验证 P13 的 UInput、UField、UValidationMessage 声明、token、源码边界与最小 ROP 注释形态；静态验证不替代 Vue runtime、UniApp compiler、真机、读屏或异步校验证据。
 * @lang en Verifies P13 UInput, UField, and UValidationMessage declarations, tokens, source boundaries, and minimum ROP comment form; static validation does not replace Vue runtime, UniApp compiler, device, screen-reader, or asynchronous-validation evidence.
 */

// <lang><zh-CN>导入 Node 的本地断言、文件读取、路径解析与测试入口；测试不访问网络、子进程或仓库外部输入。</zh-CN><en>Imports Node local assertions, file reading, path resolution, and test entry; the test accesses no network, child process, or repository-external input.</en></lang>
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

// <lang><zh-CN>三项 P13 组件的稳定 manifest 名称、源码、样式和公开契约路径；所有路径相对仓库根，避免测试依赖机器路径。</zh-CN><en>Stable manifest names, source, style, and public-contract paths for the three P13 components; every path is repository-relative so tests do not depend on host paths.</en></lang>
const p13ComponentRecords = Object.freeze([
  Object.freeze({ name: 'u-input', source: 'HIA-uView-UI/src/components/u-input/u-input.vue', style: 'HIA-uView-UI/src/components/u-input/u-input.css', contract: 'docs/input.md' }),
  Object.freeze({ name: 'u-field', source: 'HIA-uView-UI/src/components/u-field/u-field.vue', style: 'HIA-uView-UI/src/components/u-field/u-field.css', contract: 'docs/field.md' }),
  Object.freeze({ name: 'u-validation-message', source: 'HIA-uView-UI/src/components/u-validation-message/u-validation-message.vue', style: 'HIA-uView-UI/src/components/u-validation-message/u-validation-message.css', contract: 'docs/validation-message.md' })
]);

/**
 * @lang zh-CN 验证 manifest、源码、样式和公开契约对三项 P13 组件使用同一稳定名称与仓库内路径，且 manifest 仍不承担 runtime registry 职责。
 * @lang en Verifies that manifest, source, style, and public contracts use the same stable names and repository-local paths for the three P13 components while the manifest still has no runtime-registry responsibility.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps P13 component declarations aligned with their contracts', async () => {
  // <lang><zh-CN>读取版本控制的声明式 manifest；它只服务开发期一致性验证。</zh-CN><en>Reads the version-controlled declarative manifest; it serves development-time consistency verification only.</en></lang>
  const manifestText = await readFile(resolve('HIA-uView-UI/hia-uview.components.json'), 'utf8');

  // <lang><zh-CN>解析本地 JSON 为组件记录集合，供按名称而非数组位置核对。</zh-CN><en>Parses local JSON into a component-record collection for checking by name rather than array position.</en></lang>
  const manifest = JSON.parse(manifestText);

  // <lang><zh-CN>按名称建立索引，使每一项 P13 声明都能独立给出缺失或漂移证据。</zh-CN><en>Builds a name index so every P13 declaration can independently yield missing or drift evidence.</en></lang>
  const manifestByName = new Map(manifest.components.map((component) => [component.name, component]));

  // <lang><zh-CN>逐项核对稳定名称、相对路径和可读性，防止公开契约、Tool 输入和 runtime 源码漂移。</zh-CN><en>Checks stable name, relative paths, and readability item by item, preventing drift among public contract, Tool input, and runtime source.</en></lang>
  for (const componentRecord of p13ComponentRecords) {
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
 * @lang zh-CN 验证 P13 源码维持受控值、UField 双模式组合、私有表单项联动和纯消息展示边界，且含有当前 ROP 双语注释表面。
 * @lang en Verifies that P13 source retains controlled values, UField dual-mode composition, private form-item coordination, and pure message-display boundaries and contains the current ROP bilingual comment surface.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps P13 source inside controlled dual-mode and ROP boundaries', async () => {
  // <lang><zh-CN>读取三份本地 Vue 源码；内容只用于静态边界断言，不写入输出、缓存或外部服务。</zh-CN><en>Reads the three local Vue sources; content is used only for static boundary assertions and is not written to output, cache, or an external service.</en></lang>
  const componentSources = await Promise.all(p13ComponentRecords.map((componentRecord) => readFile(resolve(componentRecord.source), 'utf8')));

  // <lang><zh-CN>按稳定记录顺序分离源码，使组件专属断言不依赖字符串搜索的偶然顺序。</zh-CN><en>Separates sources in stable record order so component-specific assertions do not depend on accidental string-search order.</en></lang>
  const [inputSource, fieldSource, validationMessageSource] = componentSources;

  // <lang><zh-CN>合并源码用于统一扫描真实副作用 API；扫描目标是可执行 API 形态，不把注释中的边界说明误判为行为。</zh-CN><en>Combines sources for unified scanning of real side-effect APIs; scan targets executable API shapes and does not mistake boundary prose in comments for behavior.</en></lang>
  const combinedSource = componentSources.join('\n');

  // <lang><zh-CN>禁止模式代表本地组件不得拥有的定时器、网络、持久化、全局总线、动态执行、日志、路由和原生能力；命中即证明运行边界发生漂移。</zh-CN><en>Forbidden patterns represent timers, network, persistence, global buses, dynamic execution, logging, routing, and native capabilities that local components must not own; a match proves runtime-boundary drift.</en></lang>
  const forbiddenPatterns = [
    /\bset(?:Timeout|Interval)\s*\(/,
    /\buni\.request\s*\(/,
    /\bfetch\s*\(/,
    /\b(?:localStorage|sessionStorage)\s*\./,
    /\bglobalThis\s*\./,
    /\bwindow\s*\./,
    /\bdocument\s*\./,
    /\buni\.\$u\b/,
    /\beval\s*\(/,
    /\b(?:new\s+)?Function\s*\(/,
    /\bimport\s*\(/,
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

  // <lang><zh-CN>UInput 必须公开受控更新、输入、焦点、失焦及本地 click/confirm 观察，合并最近表单项 guard，并保持跨事件形状字符串提取；规则所有权仍位于私有 context 的表单项。</zh-CN><en>UInput must expose controlled update, input, focus, blur, and local click/confirm observation, merge the nearest form-item guards, and retain cross-event-shape string extraction; rule ownership remains in the form item behind private context.</en></lang>
  assert.match(inputSource, /defineEmits\(\['update:modelValue', 'input', 'focus', 'blur', 'click', 'confirm'\]\)/);
  assert.match(inputSource, /const formItemContext = inject\(U_FORM_ITEM_CONTEXT, null\);/);
  assert.match(inputSource, /const effectiveDisabled = computed\(\(\) => props\.disabled \|\| Boolean\(formItemContext\?\.disabled\.value\)\);/);
  assert.match(inputSource, /if \(effectiveDisabled\.value \|\| effectiveReadonly\.value\)/);
  assert.match(inputSource, /event\?\.detail\?\.value/);
  assert.match(inputSource, /event\?\.target\?\.value/);
  assert.match(inputSource, /emit\('click'\);/);
  assert.match(inputSource, /emit\('confirm', value\);/);

  // <lang><zh-CN>UField 必须以 default slot 存在性选择 caller-owned 或内建 UInput 分支；只有内建分支转发四项精确事件，并继承最近表单项 guard，但自身仍不拥有 form model。</zh-CN><en>UField must select caller-owned or built-in UInput branches by default-slot presence; only the built-in branch forwards four precise events and inherits nearest form-item guards, while the field itself still owns no form model.</en></lang>
  assert.match(fieldSource, /const slots = useSlots\(\);/);
  assert.match(fieldSource, /const hasDefaultControl = computed\(\(\) => typeof slots\.default === 'function'\);/);
  assert.match(fieldSource, /<slot v-if="hasDefaultControl" \/>/);
  assert.match(fieldSource, /<UInput\s+v-else/s);
  assert.match(fieldSource, /const emit = defineEmits\(\['update:modelValue', 'input', 'confirm', 'click'\]\);/);
  assert.match(fieldSource, /const formItemContext = inject\(U_FORM_ITEM_CONTEXT, null\);/);
  assert.match(fieldSource, /emit\('update:modelValue', value\);/);
  assert.match(fieldSource, /emit\('confirm', value\);/);
  assert.match(fieldSource, /emit\('click'\);/);
  assert.match(fieldSource, /<UValidationMessage :state="validationState" :message="validationMessage" \/>/);
  assert.doesNotMatch(fieldSource, /\bformModel\b/);

  // <lang><zh-CN>独立消息只对两种非 idle 状态形成可见条件，并且首个契约没有事件或插槽。</zh-CN><en>The independent message forms visible condition only for two non-idle states and has no events or slots in the first contract.</en></lang>
  assert.match(validationMessageSource, /Object\.freeze\(\['validating', 'error'\]\)/);
  assert.match(validationMessageSource, /visibleStates\.includes\(props\.state\) && props\.message\.length > 0/);
  assert.doesNotMatch(validationMessageSource, /defineEmits/);
  assert.doesNotMatch(validationMessageSource, /<slot/);
});

/**
 * @lang zh-CN 验证默认浅色主题定义 P13 实现实际消费且公开文档承诺的关键 token，避免组件退回未记录的硬编码视觉值。
 * @lang en Verifies that the default light theme defines key tokens actually consumed and publicly promised by P13 implementation, preventing components from returning to undocumented hard-coded visual values.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('defines documented P13 component tokens in the default theme', async () => {
  // <lang><zh-CN>读取受版本控制的默认主题 CSS；不依赖浏览器计算样式或平台全局变量。</zh-CN><en>Reads version-controlled default theme CSS; it does not depend on browser computed styles or platform global variables.</en></lang>
  const themeCss = await readFile(resolve('HIA-uView-UI/src/theme/hia-light.css'), 'utf8');

  // <lang><zh-CN>列出三个组件实现关键样式路径消费的 token；列表是 theme、CSS 与公开契约之间的可审计接口。</zh-CN><en>Lists tokens consumed by key style paths of the three components; the list is an auditable interface among theme, CSS, and public contract.</en></lang>
  const requiredTokens = [
    '--u-comp-input-surface',
    '--u-comp-input-placeholder-foreground',
    '--u-comp-input-disabled-border',
    '--u-comp-input-disabled-opacity',
    '--u-comp-input-min-height',
    '--u-comp-field-label-foreground',
    '--u-comp-field-required-foreground',
    '--u-comp-field-help-foreground',
    '--u-comp-field-gap',
    '--u-comp-validation-message-surface',
    '--u-comp-validation-message-validating-foreground',
    '--u-comp-validation-message-error-foreground',
    '--u-comp-validation-message-error-border',
    '--u-comp-validation-message-marker-width'
  ];

  // <lang><zh-CN>逐项确认主题有明确声明；缺失 token 会在静态层失败，而不是留到应用视觉异常时才发现。</zh-CN><en>Confirms explicit theme declaration item by item; a missing token fails at the static layer rather than surfacing later as an application visual defect.</en></lang>
  for (const requiredToken of requiredTokens) {
    assert.match(themeCss, new RegExp(`${requiredToken}:`));
  }
});
