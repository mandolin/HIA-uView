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

    // <lang><zh-CN>对一个代表性组件同时检查 JS、JSON、WXML 与 WXSS；这样可防止将来重新出现只输出模板而丢失执行或样式文件的退化。</zh-CN><en>Checks JavaScript, JSON, WXML, and WXSS for one representative component; this prevents a regression where only a template is emitted while execution or style files are lost.</en></lang>
    await Promise.all([
      access(resolve(outputDirectory, 'src/components/u-button/u-button.js')),
      access(resolve(outputDirectory, 'src/components/u-button/u-button.json')),
      access(resolve(outputDirectory, 'src/components/u-button/u-button.wxml')),
      access(resolve(outputDirectory, 'src/components/u-button/u-button.wxss'))
    ]);

    // <lang><zh-CN>组件局部 WXSS 必须含由 MP-WEIXIN 条件编译得到的默认浅色字面值规则；它们覆盖小程序组件作用域缺失的 token，而 H5 不编译这些规则并保留动态主题语义。</zh-CN><en>Component-local WXSS must contain default-light literal rules produced by MP-WEIXIN conditional compilation; they cover tokens missing in Mini Program component scope while H5 does not compile these rules and retains dynamic-theme semantics.</en></lang>
    const [buttonStyles, tagStyles] = await Promise.all([
      readFile(resolve(outputDirectory, 'src/components/u-button/u-button.wxss'), 'utf8'),
      readFile(resolve(outputDirectory, 'src/components/u-tag/u-tag.wxss'), 'utf8')
    ]);
    assert.match(buttonStyles, /\.u-button--primary\{background:#0047ab;color:#fff\}/, 'The generated UButton WXSS must include its MP-WEIXIN default-light literal primary rule.');
    assert.match(tagStyles, /\.u-tag--neutral\{background:#f7f9fc;color:#001b2e\}/, 'The generated UTag WXSS must include its MP-WEIXIN default-light literal neutral rule.');

    // <lang><zh-CN>应用 WXSS 仍需包含完整主题与全局组件规则；组件的独立 WXSS 与此共同构成小程序端可用的样式证据。</zh-CN><en>The app WXSS must still contain the complete theme and global component rules; its combination with component-local WXSS forms the usable Mini Program style evidence.</en></lang>
    const applicationStyles = await readFile(resolve(outputDirectory, 'app.wxss'), 'utf8');
    assert.match(applicationStyles, /\.u-button\{/, 'The generated app WXSS must include UButton rules from the explicit style entry.');
    assert.match(applicationStyles, /\.u-card\{/, 'The generated app WXSS must include UCard rules from the explicit style entry.');
    assert.match(applicationStyles, /\.u-image\{/, 'The generated app WXSS must include UImage rules from the explicit style entry.');
  } finally {
    // <lang><zh-CN>无论编译或断言成功与否，都删除本函数刚创建的唯一临时目录；不遍历或删除仓库、用户目录或外部路径。</zh-CN><en>Deletes the unique temporary directory created by this function whether compilation or assertions succeed; never traverses or deletes repository, user, or external paths.</en></lang>
    await rm(outputDirectory, { recursive: true, force: true, maxRetries: 2 });
  }
}

await verifyMpWeixinFixture();
console.log('HIA-uView mp-weixin fixture generation contract passed.');
