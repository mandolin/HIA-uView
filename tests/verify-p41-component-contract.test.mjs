/**
 * @module verify-p41-component-contract.test
 * @lang zh-CN 验证 P41 七项高频组件的声明、双语契约、主题 token、本地运行边界与后续形成的私有表单 registry；静态证据不替代 Vue runtime、UniApp compiler、微信开发者工具、真机、读屏或 WCAG 认证。
 * @lang en Verifies declarations, bilingual contracts, theme tokens, local runtime boundaries, and the subsequently delivered private form registry for the seven P41 high-frequency components; static evidence does not replace Vue runtime, UniApp compiler, WeChat DevTools, devices, screen readers, or WCAG certification.
 */

// <lang><zh-CN>导入本地断言、文件读取、路径解析和 Node 测试入口；测试不访问网络、存储、子进程或仓库外部输入。</zh-CN><en>Imports local assertions, file reading, path resolution, and the Node test entry; the test accesses no network, storage, child process, or repository-external input.</en></lang>
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

// <lang><zh-CN>使用稳定模板名建立逐项审计记录，保持 manifest、runtime、CSS 与公开契约同源。</zh-CN><en>Uses stable template names to build an itemized audit record, keeping manifest, runtime, CSS, and public contracts aligned.</en></lang>
const p41ComponentRecords = Object.freeze([
  Object.freeze({ name: 'u-textarea', source: 'HIA-uView-UI/src/components/u-textarea/u-textarea.vue', style: 'HIA-uView-UI/src/components/u-textarea/u-textarea.css', contract: 'docs/textarea.md', token: '--u-comp-textarea-' }),
  Object.freeze({ name: 'u-switch', source: 'HIA-uView-UI/src/components/u-switch/u-switch.vue', style: 'HIA-uView-UI/src/components/u-switch/u-switch.css', contract: 'docs/switch.md', token: '--u-comp-switch-' }),
  Object.freeze({ name: 'u-number-box', source: 'HIA-uView-UI/src/components/u-number-box/u-number-box.vue', style: 'HIA-uView-UI/src/components/u-number-box/u-number-box.css', contract: 'docs/number-box.md', token: '--u-comp-number-box-' }),
  Object.freeze({ name: 'u-rate', source: 'HIA-uView-UI/src/components/u-rate/u-rate.vue', style: 'HIA-uView-UI/src/components/u-rate/u-rate.css', contract: 'docs/rate.md', token: '--u-comp-rate-' }),
  Object.freeze({ name: 'u-search', source: 'HIA-uView-UI/src/components/u-search/u-search.vue', style: 'HIA-uView-UI/src/components/u-search/u-search.css', contract: 'docs/search.md', token: '--u-comp-search-' }),
  Object.freeze({ name: 'u-form', source: 'HIA-uView-UI/src/components/u-form/u-form.vue', style: 'HIA-uView-UI/src/components/u-form/u-form.css', contract: 'docs/form.md', token: '--u-comp-form-' }),
  Object.freeze({ name: 'u-form-item', source: 'HIA-uView-UI/src/components/u-form-item/u-form-item.vue', style: 'HIA-uView-UI/src/components/u-form-item/u-form-item.css', contract: 'docs/form-item.md', token: '--u-comp-form-item-' })
]);

/**
 * @lang zh-CN 验证七项 P41 组件的 manifest、Vue、CSS 和双语契约均存在且使用仓库内相对路径。
 * @lang en Verifies that manifest, Vue, CSS, and bilingual contracts exist for all seven P41 components and use repository-relative paths.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps P41 component declarations aligned', async () => {
  // <lang><zh-CN>manifest 只作为开发期声明验证输入，不承担 runtime registry 或动态加载职责。</zh-CN><en>The manifest is used for development-time declaration checks only and has no runtime-registry or dynamic-loading responsibility.</en></lang>
  const manifest = JSON.parse(await readFile(resolve('HIA-uView-UI/hia-uview.components.json'), 'utf8'));
  const manifestByName = new Map(manifest.components.map((component) => [component.name, component]));

  for (const componentRecord of p41ComponentRecords) {
    // <lang><zh-CN>逐项确认名称、路径和双语 locale，避免新增组件只在源码中存在而未进入公开契约。</zh-CN><en>Checks name, paths, and bilingual locales item by item so a new component cannot exist only in source without a public contract.</en></lang>
    const manifestRecord = manifestByName.get(componentRecord.name);
    assert.ok(manifestRecord, `Manifest must declare ${componentRecord.name}.`);
    assert.equal(manifestRecord.source, componentRecord.source.replace('HIA-uView-UI/', ''));
    assert.equal(manifestRecord.contract, componentRecord.contract);
    assert.deepEqual(manifestRecord.locales, ['zh-Hans', 'en']);
    await access(resolve(componentRecord.source));
    await access(resolve(componentRecord.style));
    await access(resolve(componentRecord.contract));
  }
});
/**
 * @lang zh-CN 验证 P41 源码使用 u-* 命名、受控事件边界、私有 Symbol/Map 表单协作和当前双语 ROP 表面，并排除网络、存储、全局状态、动态执行、路由、定时器与隐式平台服务。
 * @lang en Verifies P41 source uses u-* names, controlled event boundaries, private Symbol/Map form coordination, and the current bilingual ROP surface while excluding network, storage, global state, dynamic execution, routing, timers, and implicit platform services.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('keeps P41 source inside controlled local boundaries', async () => {
  // <lang><zh-CN>读取七项组件和其固定表单 runtime helper；扫描只针对版本控制内容，不写入任何输出。</zh-CN><en>Reads the seven components and their fixed form runtime helper; scanning targets version-controlled content only and writes no output.</en></lang>
  const componentSources = await Promise.all(p41ComponentRecords.map((componentRecord) => readFile(resolve(componentRecord.source), 'utf8')));
  // <lang><zh-CN>私有注入 key 位于固定 helper 中，必须和使用它的组件进入同一静态边界检查。</zh-CN><en>Private injection keys reside in a fixed helper, which must enter the same static boundary check as their consuming components.</en></lang>
  const formRuntimeSource = await readFile(resolve('HIA-uView-UI/src/components/u-form/form-runtime.mjs'), 'utf8');
  // <lang><zh-CN>合并组件与 helper，避免将副作用移入辅助模块来绕过组件扫描。</zh-CN><en>Combines components and helper so moving a side effect into the helper cannot bypass component scanning.</en></lang>
  const combinedSource = [...componentSources, formRuntimeSource].join('\n');
  const forbiddenPatterns = [
    /\bset(?:Timeout|Interval)\s*\(/,
    /<Teleport\b/,
    /\buni\.[A-Za-z]/,
    /\buni\.\$u\b/,
    /\bfetch\s*\(/,
    /\b(?:localStorage|sessionStorage)\s*\./,
    /\bglobalThis\s*\./,
    /\bwindow\s*\./,
    /\bdocument\s*\./,
    /\beval\s*\(/,
    /\b(?:new\s+)?Function\s*\(/,
    /\bimport\s*\(/,
    /\bconsole\s*\./,
    /\buni\.navigate(?:To|Back|RedirectTo|ReLaunch|SwitchTab)?\s*\(/,
    /\bopen-type\s*=/
  ];

  for (const forbiddenPattern of forbiddenPatterns) {
    assert.doesNotMatch(combinedSource, forbiddenPattern);
  }

  for (const [index, componentSource] of componentSources.entries()) {
    // <lang><zh-CN>每个源文件都必须同时含节点级中英文档和普通 inline lang 说明；index 用于定位具体组件。</zh-CN><en>Every source file must contain node-level Chinese/English documentation and ordinary inline lang narration; index identifies the component on failure.</en></lang>
    assert.match(componentSource, /@lang zh-CN/, `Missing zh-CN documentation in ${p41ComponentRecords[index].name}.`);
    assert.match(componentSource, /@lang en/, `Missing en documentation in ${p41ComponentRecords[index].name}.`);
    assert.match(componentSource, /<lang><zh-CN>/, `Missing inline ROP narration in ${p41ComponentRecords[index].name}.`);
  }

  // <lang><zh-CN>五项输入组件保持精确受控值/意图表面；表单组件则必须公开最终七项命令式 API，并把 registry/context 留在实例私有边界。</zh-CN><en>The five input components retain precise controlled-value/intent surfaces; form components must expose the final seven imperative APIs while keeping registry and context inside instance-private boundaries.</en></lang>
  assert.match(componentSources[0], /defineEmits\(\['update:modelValue', 'input', 'change', 'focus', 'blur', 'confirm', 'click'\]\)/);
  assert.match(componentSources[1], /defineEmits\(\['update:modelValue', 'change'\]\)/);
  assert.match(componentSources[2], /defineEmits\(\['update:modelValue', 'input', 'change'\]\)/);
  assert.match(componentSources[3], /defineEmits\(\['update:modelValue', 'input', 'change'\]\)/);
  assert.match(componentSources[4], /defineEmits\(\['update:modelValue', 'input', 'change', 'focus', 'blur', 'confirm', 'click', 'search', 'clear'\]\)/);
  assert.match(formRuntimeSource, /export const U_FORM_CONTEXT = Symbol\('hia-uview-form-context'\);/);
  assert.match(formRuntimeSource, /export const U_FORM_ITEM_CONTEXT = Symbol\('hia-uview-form-item-context'\);/);
  assert.match(componentSources[5], /const fields = new Map\(\);/);
  assert.match(componentSources[5], /provide\(U_FORM_CONTEXT, Object\.freeze\(\{\s*model,\s*disabled,\s*labelPosition,\s*registerField,\s*unregisterField,\s*resolveRules\s*\}\)\);/su);
  assert.match(componentSources[5], /defineExpose\(\{ setRules, validate, validateField, clearValidate, resetFields, requestSubmit, requestReset \}\);/);
  assert.match(componentSources[6], /UValidationMessage/);
  assert.match(componentSources[6], /const formContext = inject\(U_FORM_CONTEXT, null\);/);
  assert.match(componentSources[6], /const fieldToken = Symbol\('hia-uview-form-field'\);/);
  assert.match(componentSources[6], /provide\(U_FORM_ITEM_CONTEXT, Object\.freeze\(\{ disabled, readonly, notifyChange, notifyBlur \}\)\);/);
  assert.match(componentSources[6], /defineExpose\(\{ validate, clearValidate, resetField \}\);/);
});

/**
 * @lang zh-CN 验证默认主题声明了七个组件 CSS 实际消费的 token 族，避免视觉契约退回未审计的硬编码值。
 * @lang en Verifies the default theme declares the token families consumed by the seven component styles, preventing visual contracts from falling back to unaudited hard-coded values.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects on assertion failure.</en></lang>
 */
test('defines P41 component token families in the default theme', async () => {
  // <lang><zh-CN>主题读取来自仓库内默认 light entry，不依赖浏览器计算样式或全局平台变量。</zh-CN><en>Theme input comes from the repository default light entry and does not depend on browser computed styles or global platform variables.</en></lang>
  const themeCss = await readFile(resolve('HIA-uView-UI/src/theme/hia-light.css'), 'utf8');
  for (const componentRecord of p41ComponentRecords) {
    assert.match(themeCss, new RegExp(`${componentRecord.token}[^:]*:`));
  }
});
