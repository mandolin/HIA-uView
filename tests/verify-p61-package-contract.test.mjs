/**
 * @module verify-private-ui-package-contract
 * @lang zh-CN 锁定私有 UI 包的 types、静态 Easycom 与发布边界。测试只读取固定公开仓内文件，不打包、不安装、不联网、不扫描 consumer 项目，也不执行 Vue 或小程序 runtime。
 * @lang en Locks types, static Easycom, and distribution boundaries of the private UI package. The test reads only fixed public repository files; it neither packs, installs, nor accesses the network, scans consumer projects, or runs Vue/Mini Program runtime.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// <lang><zh-CN>并行读取固定 package、runtime、declaration、Easycom 与消费 fixture 输入，避免测试通过目录发现扩大读取边界。</zh-CN><en>Reads fixed package, runtime, declaration, Easycom, and consumer-fixture inputs in parallel, avoiding boundary expansion through directory discovery.</en></lang>
const [packageSource, runtimeSource, declarationSource, globalDeclarationSource, easycomSource, consumerSource, typeConfigSource] = await Promise.all([
  readFile('HIA-uView-UI/package.json', 'utf8'),
  readFile('HIA-uView-UI/src/index.mjs', 'utf8'),
  readFile('HIA-uView-UI/types/index.d.ts', 'utf8'),
  readFile('HIA-uView-UI/types/global-components.d.ts', 'utf8'),
  readFile('HIA-uView-UI/easycom/mp-weixin.json', 'utf8'),
  readFile('tests/fixtures/ui-package-types/consumer.ts', 'utf8'),
  readFile('tests/fixtures/ui-package-types/tsconfig.json', 'utf8')
]);

// <lang><zh-CN>解析 JSON 仅用于精确 metadata/静态 mapping 比较；不会执行 package 中的任何字段。</zh-CN><en>Parses JSON only for exact metadata/static-mapping comparison; it executes no package field.</en></lang>
const packageJson = JSON.parse(packageSource);
const easycomJson = JSON.parse(easycomSource);
const typeConfig = JSON.parse(typeConfigSource);

/**
 * @lang zh-CN 从 runtime source 的显式 export 块取得 PascalCase 组件名；此测试不导入 SFC，以避免构建或 runtime 副作用。
 * @lang en Obtains PascalCase component names from explicit runtime export blocks; this test imports no SFC, avoiding build or runtime side effects.
 * @param {string} source <lang><zh-CN>固定 runtime entry 原文。</zh-CN><en>Fixed runtime-entry source text.</en></lang>
 * @returns {string[]} <lang><zh-CN>按 code-point 排序的唯一组件名。</zh-CN><en>Unique component names sorted by code point.</en></lang>
 */
function readRuntimeComponentNames(source) {
  // <lang><zh-CN>只匹配以 export 开头且以分号结束的命名块，不把内部 import、registry 或 locale export 当成组件声明。</zh-CN><en>Matches only named blocks beginning with export and ending with a semicolon, excluding internal imports, registries, and locale exports from component declarations.</en></lang>
  const exportBlocks = [...source.matchAll(/^export \{([^}]+)\};$/gmu)];

  // <lang><zh-CN>逐块拆分逗号分隔的标识符，并只保留当前 U-组件 PascalCase 名称。</zh-CN><en>Splits comma-separated identifiers block by block and retains only current U-component PascalCase names.</en></lang>
  const names = exportBlocks.flatMap((match) => match[1].split(',').map((name) => name.trim()).filter((name) => /^U[A-Z][A-Za-z0-9]*$/u.test(name)));

  // <lang><zh-CN>排序前先去重，令声明/运行时集合比较不依赖源文件中的块顺序。</zh-CN><en>Deduplicates before sorting so declaration/runtime set comparison does not depend on source-block order.</en></lang>
  return [...new Set(names)].sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
}

/**
 * @lang zh-CN 从 declaration 中取得 `UViewComponent` 基线、既有精确 `DefineComponent` 与带公开实例/事件的 `UViewTypedComponent` 常量；类型 alias 与 helper 本身不属于 runtime 组件集。
 * @lang en Obtains the `UViewComponent` baseline, existing precise `DefineComponent`, and public-instance/event-aware `UViewTypedComponent` constants from declarations; type aliases and helpers themselves are not part of the runtime component set.
 * @param {string} source <lang><zh-CN>固定 type declaration 原文。</zh-CN><en>Fixed type-declaration source text.</en></lang>
 * @returns {string[]} <lang><zh-CN>按 code-point 排序的唯一组件名。</zh-CN><en>Unique component names sorted by code point.</en></lang>
 */
function readDeclarationComponentNames(source) {
  // <lang><zh-CN>匹配三个受控组件声明形式，防止任意 `declare const` 被误计为 UI runtime export。</zh-CN><en>Matches the three controlled component-declaration forms, preventing arbitrary `declare const` values from being counted as UI runtime exports.</en></lang>
  const names = [...source.matchAll(/^export declare const (U[A-Z][A-Za-z0-9]*): (?:UViewComponent|DefineComponent<[^;]+>|UViewTypedComponent<[^;]+>);$/gmu)].map((match) => match[1]);

  // <lang><zh-CN>以相同规则归一集合，确保每个 runtime component 恰有一个 declaration。</zh-CN><en>Normalizes the set with the same rule, ensuring every runtime component has exactly one declaration.</en></lang>
  return [...new Set(names)].sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
}

test('keeps the private package entry explicit, typed, and dependency-light', () => {
  // <lang><zh-CN>包保持私有并使用 package-owned types，避免把本地 declaration 假称为已发布 semver API。</zh-CN><en>The package remains private and uses package-owned types, avoiding presentation of local declarations as a published semver API.</en></lang>
  assert.equal(packageJson.private, true);
  assert.equal(packageJson.types, './types/index.d.ts');
  assert.deepEqual(packageJson.peerDependencies, { vue: '>=3.4.0 <4.0.0' });
  assert.deepEqual(packageJson.dependencies ?? {}, {});

  // <lang><zh-CN>export map 只允许 runtime、类型、显式 style 和静态 Easycom；不会暴露 manifest、fixture 或自动注册入口。</zh-CN><en>The export map allows only runtime, types, explicit style, and static Easycom; it exposes no manifest, fixture, or auto-registration entry.</en></lang>
  assert.deepEqual(Object.keys(packageJson.exports), ['.', './global', './style.css', './theme/hia-light.css', './easycom/mp-weixin.json']);
  assert.deepEqual(packageJson.exports['.'], { default: './src/index.mjs', types: './types/index.d.ts' });
  assert.deepEqual(packageJson.exports['./global'], { default: './types/global-components.mjs', types: './types/global-components.d.ts' });
});

test('declares every current runtime component exactly once without overclaiming precision', () => {
  // <lang><zh-CN>运行时/声明名称集合必须精确相同；这个静态比较不会加载 component implementation 或执行任何 Vue code。</zh-CN><en>Runtime/declaration name sets must be exactly equal; this static comparison loads no component implementation or executes Vue code.</en></lang>
  assert.deepEqual(readDeclarationComponentNames(declarationSource), readRuntimeComponentNames(runtimeSource));

  // <lang><zh-CN>既有十个审计表面继续保持精确 props，不因 P66 实例类型扩展而退化。</zh-CN><en>The existing ten audited surfaces retain precise props and do not regress because P66 adds instance-aware types.</en></lang>
  for (const componentName of ['UAlertTips', 'UCheckbox', 'UCheckboxGroup', 'UNoticeBar', 'UPicker', 'URadio', 'URadioGroup', 'USwitch', 'UTabbar', 'UTag']) {
    assert.match(declarationSource, new RegExp(`export declare const ${componentName}: DefineComponent<`, 'u'));
  }

  // <lang><zh-CN>P66 六组件必须使用带 RawBindings 与 emits 的精确 helper，使 public instance 和 payload 同时可检查。</zh-CN><en>The six P66 components must use the precise RawBindings/emits helper so public instances and payloads are both checkable.</en></lang>
  for (const componentName of ['UField', 'UForm', 'UFormItem', 'UInput', 'USearch', 'UTextarea']) {
    assert.match(declarationSource, new RegExp(`export declare const ${componentName}: UViewTypedComponent<`, 'u'));
  }

  assert.match(declarationSource, /not yet promise complete TypeScript shapes/u);
  assert.match(globalDeclarationSource, /declare module 'vue'/u);
  assert.match(globalDeclarationSource, /UTabbar: typeof UTabbar/u);
  assert.match(globalDeclarationSource, /UTag: typeof UTag/u);

  // <lang><zh-CN>可选 global augmentation 必须同步覆盖全部六个 P66 精确组件。</zh-CN><en>The optional global augmentation must cover all six precise P66 components in sync.</en></lang>
  for (const componentName of ['UField', 'UForm', 'UFormItem', 'UInput', 'USearch', 'UTextarea']) {
    assert.match(globalDeclarationSource, new RegExp(`${componentName}: typeof ${componentName}`, 'u'));
  }
});

test('keeps Easycom static, consumer-owned, and compiler-testable', () => {
  // <lang><zh-CN>fragment 固定为关闭 autoscan 的单个静态正则路径；它不发现任意目录、注入 runtime registry 或执行代码。</zh-CN><en>The fragment is fixed to one static regex path with autoscan off; it neither discovers arbitrary directories, injects a runtime registry, nor executes code.</en></lang>
  assert.deepEqual(easycomJson, {
    version: 1,
    profile: 'uniapp-vue3-mp-weixin',
    easycom: {
      autoscan: false,
      custom: {
        '^u-(.*)': '@/node_modules/@hia-uview/ui/src/components/u-$1/u-$1.vue'
      }
    }
  });

  // <lang><zh-CN>类型 fixture 必须显式导入 global augmentation，并保持 package alias 映射受控在本仓测试目录。</zh-CN><en>The type fixture must explicitly import the global augmentation and keep package-alias mapping controlled in this repository test directory.</en></lang>
  assert.match(consumerSource, /import '@hia-uview\/ui\/global';/u);
  // <lang><zh-CN>fixture 同时锁定 expose InstanceType 与负类型门禁，避免精确声明退回 generic/any 仍然通过。</zh-CN><en>The fixture also locks exposed InstanceType and negative type gates so a regression to generic/any cannot still pass.</en></lang>
  assert.match(consumerSource, /type UFormInstance/u);
  assert.match(consumerSource, /asyncValidator: async \(value, context\)/u);
  assert.match(consumerSource, /@ts-expect-error/u);
  assert.equal(typeConfig.compilerOptions.paths['@hia-uview/ui'][0], 'HIA-uView-UI/types/index.d.ts');
});
