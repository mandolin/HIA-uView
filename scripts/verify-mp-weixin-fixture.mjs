/**
 * @module verify-mp-weixin-fixture
 * @lang zh-CN 在受控系统临时目录中构建并校验本仓 mp-weixin fixture；验证结束后删除唯一临时目录，不启动开发服务器、微信开发者工具、网络、预览或发布。
 * @lang en Builds and validates the repository's mp-weixin fixture in a controlled system-temporary directory; removes the unique temporary directory after validation and starts no development server, WeChat DevTools, network, preview, or release operation.
 */

import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { execFile as executeFile } from 'node:child_process';

const execFile = promisify(executeFile);
const repositoryDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixtureDirectory = resolve(repositoryDirectory, 'HIA-uView-UI/fixtures/mp-weixin');
const uiPackageDirectory = resolve(repositoryDirectory, 'HIA-uView-UI');
const compilerEntry = resolve(repositoryDirectory, 'node_modules/@dcloudio/vite-plugin-uni/bin/uni.js');

/**
 * @lang zh-CN P66 仓内 fixture 必须真实组合并输出的六个稳定 `u-*` 组件名；列表只用于生成产物断言，不扩大 UI API。
 * @lang en Six stable `u-*` component names that the in-repository P66 fixture must actually compose and emit; the list serves generated-artifact assertions only and does not broaden the UI API.
 */
const P66_FORM_COMPONENT_NAMES = Object.freeze([
  'u-form',
  'u-form-item',
  'u-field',
  'u-input',
  'u-textarea',
  'u-search'
]);

/**
 * @lang zh-CN P66 fixture 必须保留的三个显式表单动作名；列表仅用于源码漂移断言，不调用页面函数。
 * @lang en Three explicit form-action names that the P66 fixture must retain; the list serves source-drift assertions only and does not call page functions.
 */
const P66_FORM_ACTION_NAMES = Object.freeze([
  'validateFixtureP66Form',
  'clearFixtureP66Validation',
  'resetFixtureP66Fields'
]);

/**
 * @lang zh-CN P67 仓内 fixture 必须在统一 marker 下真实组合并输出的十四个稳定 `u-*` 组件名。
 * @lang en Fourteen stable `u-*` component names that the in-repository P67 fixture must actually compose and emit under one unified marker.
 */
const P67_CONTROL_COMPONENT_NAMES = Object.freeze([
  'u-checkbox',
  'u-checkbox-group',
  'u-radio',
  'u-radio-group',
  'u-switch',
  'u-picker',
  'u-calendar',
  'u-select',
  'u-dropdown',
  'u-dropdown-item',
  'u-number-box',
  'u-rate',
  'u-slider',
  'u-upload'
]);

/**
 * @lang zh-CN 仓内 fixture 必须在统一 marker 下真实组合、映射并输出的十个 overlay、feedback 与 navigation 组件名。
 * @lang en Ten overlay, feedback, and navigation component names that the in-repository fixture must actually compose, map, and emit under one unified marker.
 */
const P68_SURFACE_COMPONENT_NAMES = Object.freeze([
  'u-popup',
  'u-mask',
  'u-transition',
  'u-action-sheet',
  'u-modal',
  'u-toast',
  'u-navbar',
  'u-tabbar',
  'u-tabs',
  'u-notice-bar'
]);

/**
 * @lang zh-CN mp-weixin fixture 必须在统一 marker 下通过受限 Easycom 真实组合、映射并输出的十三个展示、媒体与列表组件名。
 * @lang en Thirteen display, media, and list component names that the mp-weixin fixture must actually compose, map, and emit under one unified marker through bounded Easycom.
 */
const P69_DISPLAY_MEDIA_LIST_COMPONENT_NAMES = Object.freeze([
  'u-button',
  'u-cell',
  'u-cell-group',
  'u-cell-item',
  'u-icon',
  'u-image',
  'u-pagination',
  'u-skeleton',
  'u-swipe-action',
  'u-text',
  'u-empty',
  'u-tag',
  'u-alert-tips'
]);

/**
 * @lang zh-CN 从临时微信小程序产物读取并解析一个 JSON 配置文件；读取范围仅限本函数创建的输出目录。
 * @lang en Reads and parses one JSON configuration file from the temporary WeChat Mini Program output; read scope is limited to the output directory created by this function.
 * @param {string} outputDirectory <lang><zh-CN>本次校验创建的绝对临时输出目录。</zh-CN><en>Absolute temporary output directory created by this validation run.</en></lang>
 * @param {string} fileName <lang><zh-CN>所需的产物内 JSON 文件名。</zh-CN><en>Required JSON file name within the output.</en></lang>
 * @returns {Promise<Record<string, unknown>>} <lang><zh-CN>已解析的受控配置对象。</zh-CN><en>Parsed controlled configuration object.</en></lang>
 */
async function readGeneratedJson(outputDirectory, fileName) {
  const filePath = resolve(outputDirectory, fileName);
  const content = await readFile(filePath, 'utf8');
  return JSON.parse(content);
}

/**
 * @lang zh-CN 构建本地 fixture 并验证微信小程序导入所需的最小生成文件；编译器 stderr（包括已知 warning）会保持可见，所有临时输出都会在 finally 中清理。
 * @lang en Builds the local fixture and validates the minimum generated files required for WeChat Mini Program import; compiler stderr, including the known warning, remains visible and all temporary output is cleaned in finally.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；缺少预期产物或配置不符时抛出错误。</zh-CN><en>Resolves without a value and throws when expected output or configuration is missing.</en></lang>
 */
async function verifyMpWeixinFixture() {
  // <lang><zh-CN>先读取仓内 fixture 首页源码，证明编译输入本身声明了中性 marker、真实六组件组合、调用方 model/rules 与三个显式动作。</zh-CN><en>First reads the in-repository fixture home-page source, proving that compiler input itself declares neutral markers, actual six-component composition, caller-owned model/rules, and three explicit actions.</en></lang>
  const fixturePageSource = await readFile(resolve(fixtureDirectory, 'src/pages/index/index.vue'), 'utf8');
  // <lang><zh-CN>统一 P68 marker、逐标签和显式 scope/host 绑定证明 service 与十组件实际进入页面，而非闲置 Easycom 或 import。</zh-CN><en>The unified P68 marker, tag-by-tag checks, and explicit scope/host bindings prove that services and all ten components actually enter the page rather than remaining idle Easycom mappings or imports.</en></lang>
  assert.match(fixturePageSource, /data-smoke="overlay-feedback-navigation"/u, 'The fixture source must retain the unified P68 composition marker.');
  assert.match(fixturePageSource, /data-smoke="feedback-service-result"/u, 'The fixture source must retain the visible P68 service-result marker.');
  for (const componentName of P68_SURFACE_COMPONENT_NAMES) {
    assert.match(fixturePageSource, new RegExp('<' + componentName + '(?:\\s|>)', 'u'), 'The fixture source must compose ' + componentName + '.');
  }
  assert.match(fixturePageSource, /const fixtureFeedbackScope = createUFeedbackScope\(\)/u, 'The fixture source must create one explicit feedback scope.');
  assert.match(fixturePageSource, /<u-modal\s+:service-scope="fixtureFeedbackScope"\s+:service-host="true"/u, 'The fixture source must mount an explicit modal host.');
  assert.match(fixturePageSource, /<u-toast\s+:service-scope="fixtureFeedbackScope"\s+:service-host="true"/u, 'The fixture source must mount an explicit toast host.');
  // <lang><zh-CN>fixture 源码不得通过平台 page stack、路由、网络或 storage 为局部服务建立隐式依赖。</zh-CN><en>Fixture source must not establish implicit local-service dependencies through a platform page stack, routing, network, or storage.</en></lang>
  assert.doesNotMatch(fixturePageSource, /getCurrentPages|uni\.(?:navigate|redirect|reLaunch|switchTab|request|setStorage|getStorage)|wx\.(?:navigate|redirect|reLaunch|switchTab|request)/u);
  assert.match(fixturePageSource, /data-smoke="p66-form-composition"/u, 'The fixture source must retain the neutral P66 form-composition marker.');
  assert.match(fixturePageSource, /data-smoke="p66-form-result"/u, 'The fixture source must retain the visible P66 form-result marker.');
  assert.match(fixturePageSource, /<u-form\s+ref="fixtureP66FormReference"\s+:model="fixtureP66FormModel"\s+:rules="fixtureP66FormRules"/u, 'The fixture source must bind UForm to its page-local ref, model, and rules.');

  // <lang><zh-CN>六个源码标签必须全部存在，避免生成验证退化为只检查过期产物或闲置 Easycom 注册。</zh-CN><en>All six source tags must exist, preventing generated-output verification from degrading into checks of stale artifacts or idle Easycom registrations.</en></lang>
  for (const componentName of P66_FORM_COMPONENT_NAMES) {
    assert.match(fixturePageSource, new RegExp(`<${componentName}(?:\\s|>)`, 'u'), `The fixture source must compose ${componentName}.`);
  }
  // <lang><zh-CN>P66 的 USearch 实例必须精确选入受限 `search` 装饰，防止 leaf 编译检查只观察到未被页面消费的可选分支。</zh-CN><en>The P66 USearch instance must opt into the exact bounded `search` decoration, preventing leaf compilation checks from observing only an optional branch that no page consumes.</en></lang>
  assert.match(fixturePageSource, /<u-form-item prop="searchText"[\s\S]*?<u-search[\s\S]*?search-icon="search"[\s\S]*?@search="recordFixtureP66SearchIntent"\s*\/>/u, 'The fixture source must opt one actual USearch consumer into the bounded search decoration.');

  // <lang><zh-CN>三个函数声明分别证明 validate、clear 与 reset 由 fixture 调用方显式观察，而非只在组件内部不可达。</zh-CN><en>The three function declarations separately prove that validate, clear, and reset are explicitly observable by the fixture caller rather than remaining unreachable inside components.</en></lang>
  for (const actionName of P66_FORM_ACTION_NAMES) {
    assert.match(fixturePageSource, new RegExp(`function ${actionName}\\(`, 'u'), `The fixture source must retain ${actionName}.`);
  }

  // <lang><zh-CN>统一 marker 与十四个源码标签证明 P67 组件属于同一页面组合，而非旧旁路标签、闲置 Easycom 或样式入口。</zh-CN><en>The unified marker and fourteen source tags prove P67 components belong to one page composition rather than legacy side tags, idle Easycom mappings, or a style entry.</en></lang>
  assert.match(fixturePageSource, /data-smoke="p67-controlled-composition"/u, 'The fixture source must retain the unified P67 composition marker.');
  for (const componentName of P67_CONTROL_COMPONENT_NAMES) {
    assert.match(fixturePageSource, new RegExp(`<${componentName}(?:\\s|>)`, 'u'), `The fixture source must compose ${componentName}.`);
  }

  // <lang><zh-CN>精确绑定断言锁定 dropdown options mode 与页面注入 upload adapter；两者不得退化为 legacy 单值/纯 intent。</zh-CN><en>Exact binding assertions lock dropdown options mode and the page-injected upload adapter; neither may regress to a legacy scalar or pure intent.</en></lang>
  assert.match(fixturePageSource, /<u-dropdown-item\s+name="scope"[\s\S]+:options="fixtureDropdownOptions"[\s\S]+@update:model-value="updateFixtureDropdownValue"/u, 'The fixture source must use UDropdownItem options mode.');
  assert.match(fixturePageSource, /<u-upload[\s\S]+:adapter="fixtureUploadAdapter"[\s\S]+@adapter-state="recordFixtureUploadAdapterState"/u, 'The fixture source must inject and observe its page-local UUpload adapter.');

  // <lang><zh-CN>统一 P69 marker 与十三个源码标签证明展示/媒体/列表组件位于同一真实组合，而不是闲置 Easycom、旧散点标签或全量样式入口。</zh-CN><en>The unified P69 marker and thirteen source tags prove display/media/list components belong to one actual composition rather than idle Easycom, scattered legacy tags, or the complete style entry.</en></lang>
  assert.match(fixturePageSource, /data-smoke="display-media-list"/u, 'The fixture source must retain the unified P69 composition marker.');
  assert.match(fixturePageSource, /data-smoke="display-media-list-intent"/u, 'The fixture source must retain the visible P69 intent marker.');
  for (const componentName of P69_DISPLAY_MEDIA_LIST_COMPONENT_NAMES) {
    // <lang><zh-CN>每个固定名称必须形成实际模板标签；循环不扫描目录或接受 alias。</zh-CN><en>Every fixed name must form an actual template tag; the loop scans no directory and accepts no alias.</en></lang>
    assert.match(fixturePageSource, new RegExp('<' + componentName + '(?:\\s|>)', 'u'), 'The fixture source must compose ' + componentName + '.');
  }
  // <lang><zh-CN>局部 group/default/bottom slot 关系与无外部副作用边界必须保留，避免“组件出现”退化为无内容孤立标签。</zh-CN><en>Local group/default/bottom-slot relationships and the no-external-effect boundary must remain, preventing “component presence” from regressing into content-free isolated tags.</en></lang>
  assert.match(fixturePageSource, /<u-cell-group[\s\S]+<u-cell[\s\S]+<u-cell-item/u, 'The fixture source must retain the local cell-group composition.');
  assert.match(fixturePageSource, /<u-pagination[\s\S]+<template #default><text>本地页码摘要/u, 'The fixture source must retain the caller-owned pagination slot.');
  assert.match(fixturePageSource, /<u-empty[\s\S]+<template #bottom><u-text/u, 'The fixture source must retain the caller-owned empty bottom slot.');

  // <lang><zh-CN>用固定前缀创建唯一系统临时目录；该目录不位于仓库内，且只由本次验证拥有。</zh-CN><en>Creates a unique system temporary directory with a fixed prefix; it is outside the repository and owned only by this validation run.</en></lang>
  const outputDirectory = await mkdtemp(join(tmpdir(), 'hia-uview-mp-weixin-'));

  try {
    // <lang><zh-CN>以固定编译入口、固定平台和受控输出目录执行；不接受调用方参数、网络输入或发布参数。</zh-CN><en>Executes with a fixed compiler entry, platform, and controlled output directory; accepts no caller arguments, network input, or release arguments.</en></lang>
    const { stderr } = await execFile(
      process.execPath,
      [compilerEntry, 'build', '-p', 'mp-weixin', '--outDir', outputDirectory],
      {
        cwd: fixtureDirectory,
        env: { ...process.env, UNI_INPUT_DIR: uiPackageDirectory },
        maxBuffer: 2 * 1024 * 1024
      }
    );

    if (stderr) {
      process.stderr.write(stderr);
    }

    const appConfiguration = await readGeneratedJson(outputDirectory, 'app.json');
    assert.ok(Array.isArray(appConfiguration.pages), 'The generated app.json must declare a pages array.');
    assert.deepEqual(appConfiguration.pages, ['fixtures/mp-weixin/src/pages/index/index'], 'The generated app.json must declare only the fixture home page.');
    const [fixtureHomePage] = appConfiguration.pages;

    // <lang><zh-CN>只检查微信小程序导入的基础配置和生成 app.json 明确声明的首页四类文件；这不触发开发者工具、模拟器或设备验证。</zh-CN><en>Checks only base WeChat Mini Program import configuration and the four home-page file types explicitly declared by generated app.json; this does not trigger DevTools, simulator, or device validation.</en></lang>
    await Promise.all([
      access(resolve(outputDirectory, 'app.json')),
      access(resolve(outputDirectory, 'project.config.json')),
      access(resolve(outputDirectory, `${fixtureHomePage}.js`)),
      access(resolve(outputDirectory, `${fixtureHomePage}.json`)),
      access(resolve(outputDirectory, `${fixtureHomePage}.wxml`)),
      access(resolve(outputDirectory, `${fixtureHomePage}.wxss`))
    ]);

    const projectConfiguration = await readGeneratedJson(outputDirectory, 'project.config.json');

    assert.equal(projectConfiguration.compileType, 'miniprogram', 'The generated project config must identify a Mini Program compile type.');
    assert.equal(projectConfiguration.appid, 'touristappid', 'The generated project config must retain the fixture-only tourist AppID.');

    // <lang><zh-CN>页面配置必须保留受限 easycom 的静态映射，确保 u-* 标签各自输出小程序组件文件，而非只经运行时 barrel 获得内存组件对象。</zh-CN><en>The page configuration must retain bounded easycom static mappings so each u-* tag emits Mini Program component files rather than obtaining only an in-memory component object through a runtime barrel.</en></lang>
    const fixtureHomeConfiguration = await readGeneratedJson(outputDirectory, `${fixtureHomePage}.json`);
    const usingComponents = fixtureHomeConfiguration.usingComponents;
    assert.equal(typeof usingComponents, 'object', 'The fixture page must declare static Mini Program components.');
    assert.equal(usingComponents?.['u-button'], '../../../../../src/components/u-button/u-button', 'The fixture page must statically resolve UButton to its leaf SFC output.');

    // <lang><zh-CN>六组件必须各自从仓内 UI 输入树解析到 leaf SFC；这防止页面仅保留未知标签或经 runtime barrel 偶然可见。</zh-CN><en>Each of the six components must resolve from the in-repository UI input tree to its leaf SFC, preventing the page from retaining only unknown tags or becoming incidentally visible through a runtime barrel.</en></lang>
    for (const componentName of P66_FORM_COMPONENT_NAMES) {
      const expectedComponentPath = `../../../../../src/components/${componentName}/${componentName}`;
      assert.equal(usingComponents?.[componentName], expectedComponentPath, `The fixture page must statically resolve ${componentName} to its leaf SFC output.`);
    }

    // <lang><zh-CN>十四个 P67 组件必须各自从仓内 UI 输入树映射到 leaf SFC，排除未知标签或仅 runtime barrel 可见。</zh-CN><en>Each of the fourteen P67 components must map from the in-repository UI input tree to its leaf SFC, excluding unknown tags or visibility only through the runtime barrel.</en></lang>
    for (const componentName of P67_CONTROL_COMPONENT_NAMES) {
      // <lang><zh-CN>目标路径由固定组件名构造，始终留在本轮临时输出对应的仓内 source tree。</zh-CN><en>The target path is constructed from a fixed component name and remains in the in-repository source tree represented by this run's temporary output.</en></lang>
      const expectedComponentPath = `../../../../../src/components/${componentName}/${componentName}`;
      assert.equal(usingComponents?.[componentName], expectedComponentPath, `The fixture page must statically resolve ${componentName} to its leaf SFC output.`);
    }

    // <lang><zh-CN>十个 P68 组件必须各自通过受限 Easycom 映射到仓内 leaf SFC；service 仍由页面 JavaScript 的显式 submodule import 提供。</zh-CN><en>All ten P68 components must map to in-repository leaf SFCs through bounded Easycom; services remain supplied by the page JavaScript's explicit submodule import.</en></lang>
    for (const componentName of P68_SURFACE_COMPONENT_NAMES) {
      // <lang><zh-CN>路径仅由冻结组件名与固定 source 根拼接，不读取 package registry 或动态 manifest。</zh-CN><en>The path joins only a frozen component name with the fixed source root and reads no package registry or dynamic manifest.</en></lang>
      const expectedComponentPath = '../../../../../src/components/' + componentName + '/' + componentName;
      assert.equal(usingComponents?.[componentName], expectedComponentPath, 'The fixture page must statically resolve ' + componentName + ' to its leaf SFC output.');
    }

    // <lang><zh-CN>十三个 P69 组件必须各自通过受限 Easycom 映射到仓内 leaf SFC；映射只证明 compiler 消费，不提升为 DevTools、真机或全平台支持。</zh-CN><en>All thirteen P69 components must map to in-repository leaf SFCs through bounded Easycom; the mapping proves compiler consumption only and does not promote the result to DevTools, device, or cross-platform support.</en></lang>
    for (const componentName of P69_DISPLAY_MEDIA_LIST_COMPONENT_NAMES) {
      // <lang><zh-CN>固定组件名只拼接固定 source 根，不读取 registry、网络或动态 manifest。</zh-CN><en>The fixed component name joins only the fixed source root and reads no registry, network, or dynamic manifest.</en></lang>
      const expectedComponentPath = '../../../../../src/components/' + componentName + '/' + componentName;
      assert.equal(usingComponents?.[componentName], expectedComponentPath, 'The fixture page must statically resolve ' + componentName + ' to its leaf SFC output.');
    }

    // <lang><zh-CN>首页 WXML 中的中性 data marker 与六个标签证明目标组件真实位于页面组合，而不仅是 page JSON 的闲置映射。</zh-CN><en>The neutral data marker and six tags in home-page WXML prove the target components are actually in page composition rather than idle mappings in page JSON.</en></lang>
    const fixtureHomeMarkup = await readFile(resolve(outputDirectory, `${fixtureHomePage}.wxml`), 'utf8');
    // <lang><zh-CN>统一 P68 marker、service 结果 marker 与十个 WXML 标签排除仅映射或仅导入而未渲染的假阳性。</zh-CN><en>The unified P68 marker, service-result marker, and ten WXML tags exclude false positives where a surface is only mapped or imported without rendering.</en></lang>
    assert.match(fixtureHomeMarkup, /data-smoke="overlay-feedback-navigation"/, 'The generated fixture page must retain the unified P68 composition marker.');
    assert.match(fixtureHomeMarkup, /data-smoke="feedback-service-result"/, 'The generated fixture page must retain the visible P68 service-result marker.');
    for (const componentName of P68_SURFACE_COMPONENT_NAMES) {
      assert.match(fixtureHomeMarkup, new RegExp('<' + componentName + '(?:\\s|>)', 'u'), 'The generated fixture page must compose ' + componentName + '.');
    }
    assert.match(fixtureHomeMarkup, /data-smoke="p66-form-composition"/, 'The generated fixture page must retain the neutral P66 form-composition marker.');
    assert.match(fixtureHomeMarkup, /data-smoke="p66-form-result"/, 'The generated fixture page must retain the visible P66 form-result marker.');
    for (const componentName of P66_FORM_COMPONENT_NAMES) {
      assert.match(fixtureHomeMarkup, new RegExp(`<${componentName}(?:\\s|>)`, 'u'), `The generated fixture page must compose ${componentName}.`);
    }


    // <lang><zh-CN>生成 WXML 必须保留统一 P67 marker、adapter 观察 marker 与十四个标签，防止 page JSON 的闲置映射冒充真实消费。</zh-CN><en>Generated WXML must retain the unified P67 marker, adapter-observation marker, and all fourteen tags so idle page-JSON mappings cannot masquerade as actual consumption.</en></lang>
    assert.match(fixtureHomeMarkup, /data-smoke="p67-controlled-composition"/, 'The generated fixture page must retain the unified P67 composition marker.');
    assert.match(fixtureHomeMarkup, /data-smoke="p67-adapter-state"/, 'The generated fixture page must retain the visible P67 adapter-state marker.');
    for (const componentName of P67_CONTROL_COMPONENT_NAMES) {
      assert.match(fixtureHomeMarkup, new RegExp(`<${componentName}(?:\\s|>)`, 'u'), `The generated fixture page must compose ${componentName}.`);
    }

    // <lang><zh-CN>生成 WXML 必须保留 P69 统一 marker、可见意图 marker 与十三个标签，排除只有 JSON mapping 或源码标签的假阳性。</zh-CN><en>Generated WXML must retain the unified P69 marker, visible intent marker, and all thirteen tags, excluding false positives from JSON mappings or source tags alone.</en></lang>
    assert.match(fixtureHomeMarkup, /data-smoke="display-media-list"/, 'The generated fixture page must retain the unified P69 composition marker.');
    assert.match(fixtureHomeMarkup, /data-smoke="display-media-list-intent"/, 'The generated fixture page must retain the visible P69 intent marker.');
    for (const componentName of P69_DISPLAY_MEDIA_LIST_COMPONENT_NAMES) {
      assert.match(fixtureHomeMarkup, new RegExp('<' + componentName + '(?:\\s|>)', 'u'), 'The generated fixture page must compose ' + componentName + '.');
    }

    // <lang><zh-CN>对一个代表性组件同时检查 JS、JSON、WXML 与 WXSS；这样可防止将来重新出现只输出模板而丢失执行或样式文件的退化。</zh-CN><en>Checks JavaScript, JSON, WXML, and WXSS for one representative component; this prevents a regression where only a template is emitted while execution or style files are lost.</en></lang>
    await Promise.all([
      access(resolve(outputDirectory, 'src/components/u-button/u-button.js')),
      access(resolve(outputDirectory, 'src/components/u-button/u-button.json')),
      access(resolve(outputDirectory, 'src/components/u-button/u-button.wxml')),
      access(resolve(outputDirectory, 'src/components/u-button/u-button.wxss'))
    ]);

    // <lang><zh-CN>六组件均须输出执行、映射、模板与样式四类 leaf 产物；缺失任一文件都不能称为可导入的真实组合。</zh-CN><en>All six components must emit executable, mapping, template, and style leaf artifacts; a composition missing any one file cannot be treated as genuinely importable.</en></lang>
    const p66ArtifactChecks = [];
    for (const componentName of P66_FORM_COMPONENT_NAMES) {
      // <lang><zh-CN>每个扩展名均来自固定集合，目标始终位于本轮临时 outputDirectory 内。</zh-CN><en>Every extension comes from a fixed collection, and each target remains inside this run's temporary outputDirectory.</en></lang>
      for (const extension of ['js', 'json', 'wxml', 'wxss']) {
        p66ArtifactChecks.push(access(resolve(
          outputDirectory,
          `src/components/${componentName}/${componentName}.${extension}`
        )));
      }
    }
    await Promise.all(p66ArtifactChecks);

    // <lang><zh-CN>十四个 P67 leaf 均须输出执行、映射、模板与样式四件套；只有页面标签或单个 WXML 文件不足以构成可导入证据。</zh-CN><en>Every P67 leaf must emit the executable, mapping, template, and style quartet; a page tag or one WXML file alone is insufficient import evidence.</en></lang>
    const p67ArtifactChecks = [];
    for (const componentName of P67_CONTROL_COMPONENT_NAMES) {
      // <lang><zh-CN>扩展名来自固定四项集合，每个目标均位于本轮 outputDirectory 内。</zh-CN><en>Extensions come from a fixed four-item set, and every target remains inside this run's outputDirectory.</en></lang>
      for (const extension of ['js', 'json', 'wxml', 'wxss']) {
        p67ArtifactChecks.push(access(resolve(
          outputDirectory,
          `src/components/${componentName}/${componentName}.${extension}`
        )));
      }
    }
    await Promise.all(p67ArtifactChecks);

    // <lang><zh-CN>十个 P68 leaf 也必须各自产出 JS/JSON/WXML/WXSS 四件套；这仍只证明静态 compiler 可消费，不代表 DevTools 或真机运行。</zh-CN><en>Each of the ten P68 leaves must also emit the JS/JSON/WXML/WXSS quartet; this proves static compiler consumption only and does not represent DevTools or device execution.</en></lang>
    const p68ArtifactChecks = [];
    for (const componentName of P68_SURFACE_COMPONENT_NAMES) {
      // <lang><zh-CN>四个扩展名来自固定集合，路径始终落在本轮唯一临时输出中。</zh-CN><en>The four extensions come from a fixed collection and paths always remain inside this run's sole temporary output.</en></lang>
      for (const extension of ['js', 'json', 'wxml', 'wxss']) {
        p68ArtifactChecks.push(access(resolve(
          outputDirectory,
          'src/components/' + componentName + '/' + componentName + '.' + extension
        )));
      }
    }
    await Promise.all(p68ArtifactChecks);

    // <lang><zh-CN>十三个 P69 leaf 均须产生 JS/JSON/WXML/WXSS 四件套；这证明可导入静态闭包，但不执行小程序 runtime。</zh-CN><en>Every P69 leaf must produce the JS/JSON/WXML/WXSS quartet; this proves an importable static closure without executing the Mini Program runtime.</en></lang>
    const p69ArtifactChecks = [];
    for (const componentName of P69_DISPLAY_MEDIA_LIST_COMPONENT_NAMES) {
      // <lang><zh-CN>扩展名来自固定集合，目标只位于本轮唯一临时输出目录。</zh-CN><en>Extensions come from a fixed collection and targets exist only inside this run's unique temporary output directory.</en></lang>
      for (const extension of ['js', 'json', 'wxml', 'wxss']) {
        p69ArtifactChecks.push(access(resolve(
          outputDirectory,
          'src/components/' + componentName + '/' + componentName + '.' + extension
        )));
      }
    }
    await Promise.all(p69ArtifactChecks);

    // <lang><zh-CN>UEmpty 的两个内部叶依赖必须出现在生成配置，防止空态根只编译成功却丢失 action 或图片投影。</zh-CN><en>Both UEmpty internal leaf dependencies must appear in generated configuration, preventing an empty-state root from compiling while losing its action or image projection.</en></lang>
    const emptyConfiguration = await readGeneratedJson(outputDirectory, 'src/components/u-empty/u-empty.json');
    assert.equal(emptyConfiguration.usingComponents?.['u-button'], '../u-button/u-button', 'Generated UEmpty must statically compose its built-in UButton.');
    assert.equal(emptyConfiguration.usingComponents?.['u-image'], '../u-image/u-image', 'Generated UEmpty must statically compose its built-in UImage.');

    // <lang><zh-CN>读取两个内部组合根的生成 JSON，确认 UField 的内建 UInput 和 UFormItem 的校验消息不是只存在于源码注释。</zh-CN><en>Reads generated JSON for the two internal composition roots, confirming that UField's built-in UInput and UFormItem's validation message do not exist only in source comments.</en></lang>
    const [fieldConfiguration, formItemConfiguration] = await Promise.all([
      readGeneratedJson(outputDirectory, 'src/components/u-field/u-field.json'),
      readGeneratedJson(outputDirectory, 'src/components/u-form-item/u-form-item.json')
    ]);
    assert.equal(fieldConfiguration.usingComponents?.['u-input'], '../u-input/u-input', 'Generated UField must statically compose its built-in UInput.');
    assert.equal(formItemConfiguration.usingComponents?.['u-validation-message'], '../u-validation-message/u-validation-message', 'Generated UFormItem must statically compose UValidationMessage.');

    // <lang><zh-CN>同时读取代表性默认回退样式、USearch 装饰及 UActionSheet 禁用/首项 selected/滚动安全区的 leaf WXML/WXSS；这些文本只来自本轮受控临时产物。</zh-CN><en>Reads representative default-fallback styles plus USearch decoration and UActionSheet disabled/first-selected/scroll-safe-area leaf WXML/WXSS together; these texts come only from this run's controlled temporary output.</en></lang>
    const [buttonStyles, tagStyles, searchMarkup, searchStyles, actionSheetMarkup, actionSheetStyles] = await Promise.all([
      readFile(resolve(outputDirectory, 'src/components/u-button/u-button.wxss'), 'utf8'),
      readFile(resolve(outputDirectory, 'src/components/u-tag/u-tag.wxss'), 'utf8'),
      readFile(resolve(outputDirectory, 'src/components/u-search/u-search.wxml'), 'utf8'),
      readFile(resolve(outputDirectory, 'src/components/u-search/u-search.wxss'), 'utf8'),
      readFile(resolve(outputDirectory, 'src/components/u-action-sheet/u-action-sheet.wxml'), 'utf8'),
      readFile(resolve(outputDirectory, 'src/components/u-action-sheet/u-action-sheet.wxss'), 'utf8')
    ]);
    // <lang><zh-CN>组件局部 WXSS 必须含由 MP-WEIXIN 条件编译得到的默认浅色字面值规则；它们覆盖小程序组件作用域缺失的 token，而 H5 不编译这些规则并保留动态主题语义。</zh-CN><en>Component-local WXSS must contain default-light literal rules produced by MP-WEIXIN conditional compilation; they cover tokens missing in Mini Program component scope while H5 does not compile these rules and retains dynamic-theme semantics.</en></lang>
    assert.match(buttonStyles, /\.u-button--primary\{background:#0047ab;color:#fff\}/, 'The generated UButton WXSS must include its MP-WEIXIN default-light literal primary rule.');
    assert.match(tagStyles, /\.u-tag--neutral\{background:#f7f9fc;color:#001b2e\}/, 'The generated UTag WXSS must include its MP-WEIXIN default-light literal neutral rule.');

    // <lang><zh-CN>USearch leaf 模板必须保留请求隐藏的容器与两个纯 CSS 几何子节点，样式产物必须同时含三个固定类。</zh-CN><en>The USearch leaf template must retain the requested-hidden container and two pure-CSS geometry children, while its style output must contain all three fixed classes.</en></lang>
    assert.match(searchMarkup, /class="u-search__leading-icon" aria-hidden="true"/u, 'Generated USearch WXML must retain the hidden leading-decoration container.');
    assert.match(searchMarkup, /class="u-search__leading-icon-ring"/u, 'Generated USearch WXML must retain the CSS ring node.');
    assert.match(searchMarkup, /class="u-search__leading-icon-handle"/u, 'Generated USearch WXML must retain the CSS handle node.');
    assert.match(searchStyles, /\.u-search__leading-icon\{/u, 'Generated USearch WXSS must retain the leading-decoration container rule.');
    assert.match(searchStyles, /\.u-search__leading-icon-ring\{/u, 'Generated USearch WXSS must retain the ring geometry rule.');
    assert.match(searchStyles, /\.u-search__leading-icon-handle\{/u, 'Generated USearch WXSS must retain the handle geometry rule.');

    // <lang><zh-CN>UActionSheet leaf 必须保留原生 disabled、button aria-pressed、独立 selected 内容与 scroll-view；WXSS 锁定 modal 层、顶部圆角、有限滚动、安全区、字体继承和状态类，且不得回退 `[disabled]` selector。</zh-CN><en>The UActionSheet leaf must retain native disabled, button aria-pressed, independent selected content, and scroll-view; WXSS locks the modal layer, top rounding, bounded scrolling, safe area, font inheritance, and state classes without regressing to a `[disabled]` selector.</en></lang>
    assert.match(actionSheetMarkup, /u-action-sheet__item--disabled/u, 'Generated UActionSheet WXML must retain the explicit disabled-state class.');
    assert.match(actionSheetMarkup, /u-action-sheet__item--selected/u, 'Generated UActionSheet WXML must retain the explicit selected-state class.');
    assert.match(actionSheetMarkup, /disabled="\{\{item\.[A-Za-z]+\}\}"/u, 'Generated UActionSheet WXML must retain the native disabled binding.');
    assert.match(actionSheetMarkup, /aria-pressed="\{\{item\.[A-Za-z]+\}\}"/u, 'Generated UActionSheet WXML must retain button aria-pressed binding.');
    assert.doesNotMatch(actionSheetMarkup, /aria-selected/u, 'Generated UActionSheet WXML must not apply aria-selected to native buttons.');
    assert.match(actionSheetMarkup, /u-action-sheet__selected-check/u, 'Generated UActionSheet WXML must retain the independent selected check.');
    assert.match(actionSheetMarkup, /u-action-sheet__selected-text/u, 'Generated UActionSheet WXML must retain caller-provided selected-state copy.');
    assert.match(actionSheetMarkup, /<scroll-view[^>]*class="u-action-sheet__options"[^>]*scroll-y/u, 'Generated UActionSheet WXML must retain the finite vertical scroll region.');
    assert.match(actionSheetStyles, /\.u-action-sheet__item--disabled\{/u, 'Generated UActionSheet WXSS must retain the explicit disabled-state class rule.');
    assert.match(actionSheetStyles, /\.u-action-sheet__item--selected\{/u, 'Generated UActionSheet WXSS must retain the explicit selected-state class rule.');
    assert.match(actionSheetStyles, /\.u-action-sheet\{[^}]*z-index:1000/u, 'Generated UActionSheet WXSS must place the modal sheet above persistent local tabs.');
    // <lang><zh-CN>结构规则与 MP 浅色字面值覆盖会被编译为两条同名规则，因此分别校验裁剪能力与主题尺寸，避免误把规则合并顺序当成产品契约。</zh-CN><en>The structural rule and MP default-light literal override compile into two rules with the same selector, so clipping and theme dimensions are asserted separately instead of treating rule-merging order as a product contract.</en></lang>
    assert.match(actionSheetStyles, /\.u-action-sheet__panel\{[^}]*overflow:hidden/u, 'Generated UActionSheet WXSS must retain bounded panel clipping.');
    assert.match(actionSheetStyles, /\.u-action-sheet__panel\{[^}]*border-radius:20px 20px 0 0[^}]*max-height:75vh/u, 'Generated UActionSheet WXSS must retain top rounding and the bounded panel height.');
    assert.match(actionSheetStyles, /\.u-action-sheet__panel\{[^}]*padding-bottom:calc\(12px \+ env\(safe-area-inset-bottom\)\)/u, 'Generated UActionSheet WXSS must retain CSS safe-area bottom padding.');
    assert.match(actionSheetStyles, /\.u-action-sheet__options\{[^}]*overflow-y:auto/u, 'Generated UActionSheet WXSS must keep the option region scrollable.');
    assert.match(actionSheetStyles, /\.u-action-sheet__item,\.u-action-sheet__cancel\{[^}]*font-family:inherit/u, 'Generated UActionSheet WXSS must preserve caller font inheritance on native buttons.');
    assert.match(actionSheetStyles, /\.u-action-sheet__item,\.u-action-sheet__cancel\{[^}]*min-height:52px/u, 'Generated UActionSheet WXSS must retain the 52px minimum option and cancel height.');
    assert.doesNotMatch(actionSheetStyles, /\[disabled\]/u, 'Generated UActionSheet WXSS must not contain a disabled attribute selector.');

    // <lang><zh-CN>应用 WXSS 仍需包含完整主题与全局组件规则；组件的独立 WXSS 与此共同构成小程序端可用的样式证据。</zh-CN><en>The app WXSS must still contain the complete theme and global component rules; its combination with component-local WXSS forms the usable Mini Program style evidence.</en></lang>
    const applicationStyles = await readFile(resolve(outputDirectory, 'app.wxss'), 'utf8');
    assert.match(applicationStyles, /\.u-button\{/, 'The generated app WXSS must include UButton rules from the explicit style entry.');
    assert.match(applicationStyles, /\.u-card\{/, 'The generated app WXSS must include UCard rules from the explicit style entry.');
    assert.match(applicationStyles, /\.u-image\{/, 'The generated app WXSS must include UImage rules from the explicit style entry.');
    // <lang><zh-CN>应用级样式入口必须包含六组件根规则；结合 page mapping 与 leaf 产物可证明样式不会仅在 H5 存在。</zh-CN><en>The application-level style entry must include root rules for all six components; together with page mappings and leaf artifacts this proves styles do not exist only on H5.</en></lang>
    for (const componentName of P66_FORM_COMPONENT_NAMES) {
      assert.match(applicationStyles, new RegExp(`\\.${componentName}\\{`, 'u'), `The generated app WXSS must include ${componentName} rules from the explicit style entry.`);
    }
    // <lang><zh-CN>应用级样式入口也必须包含十四组件根规则；结合 WXML、mapping 与 leaf 四件套可排除仅 H5 有样式。</zh-CN><en>The application-level style entry must also include root rules for all fourteen components; together with WXML, mappings, and leaf quartets this excludes H5-only styling.</en></lang>
    for (const componentName of P67_CONTROL_COMPONENT_NAMES) {
      assert.match(applicationStyles, new RegExp(`\\.${componentName}\\{`, 'u'), `The generated app WXSS must include ${componentName} rules from the explicit style entry.`);
    }
    // <lang><zh-CN>应用级样式入口必须包含十个 P68 根规则；结合 mapping、WXML 与 leaf 四件套可证小程序静态消费闭包完整。</zh-CN><en>The application-level style entry must contain root rules for all ten P68 components; together with mappings, WXML, and leaf quartets this proves a complete Mini Program static-consumption closure.</en></lang>
    for (const componentName of P68_SURFACE_COMPONENT_NAMES) {
      assert.match(applicationStyles, new RegExp('\\.' + componentName + '\\{', 'u'), 'The generated app WXSS must include ' + componentName + ' rules from the explicit style entry.');
    }
    // <lang><zh-CN>应用级样式入口也必须包含十三个 P69 根规则；与 mapping、WXML 和 leaf 四件套共同证明样式闭包不是 H5-only。</zh-CN><en>The application-level style entry must also contain all thirteen P69 root rules; together with mappings, WXML, and leaf quartets this proves the style closure is not H5-only.</en></lang>
    for (const componentName of P69_DISPLAY_MEDIA_LIST_COMPONENT_NAMES) {
      assert.match(applicationStyles, new RegExp('\\.' + componentName + '\\{', 'u'), 'The generated app WXSS must include ' + componentName + ' rules from the explicit style entry.');
    }
  } finally {
    // <lang><zh-CN>无论编译或断言成功与否，都删除本函数刚创建的唯一临时目录；不遍历或删除仓库、用户目录或外部路径。</zh-CN><en>Deletes the unique temporary directory created by this function whether compilation or assertions succeed; never traverses or deletes repository, user, or external paths.</en></lang>
    await rm(outputDirectory, { recursive: true, force: true, maxRetries: 2 });
  }
}

await verifyMpWeixinFixture();
console.log('HIA-uView mp-weixin fixture generation contract passed.');
