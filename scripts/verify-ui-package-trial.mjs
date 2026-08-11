/**
 * @module verify-ui-package-trial
 * @lang zh-CN 在系统临时目录中验证私有 UI tarball 的打包、离线安装、类型解析与静态 mp-weixin Easycom 编译。该脚本不发布、不访问网络、不修改工作树、锁文件或任何业务项目，并在退出前删除其唯一临时目录。
 * @lang en Verifies private UI-tarball packing, offline installation, type resolution, and static mp-weixin Easycom compilation in a system temporary directory. This script neither publishes nor accesses the network or modifies the worktree, lockfiles, or any business project, and it removes its sole temporary directory before exit.
 */

import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

// <lang><zh-CN>从本脚本位置固定推导公开仓根与 UI workspace；不接受调用方路径、glob 或环境变量覆盖。</zh-CN><en>Derives the public repository root and UI workspace from this script location; accepts no caller path, glob, or environment-variable override.</en></lang>
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// <lang><zh-CN>UI workspace 是唯一允许打包的输入；脚本绝不读取 BP、Biz、WorkZone 或上游检出。</zh-CN><en>The UI workspace is the sole allowed packing input; the script never reads BP, Biz, WorkZone, or an upstream checkout.</en></lang>
const uiPackageDirectory = resolve(repositoryRoot, 'HIA-uView-UI');
// <lang><zh-CN>根依赖树中的固定 compiler 入口只用于一次性临时 consumer；它不会写入或安装到该依赖树。</zh-CN><en>The fixed compiler entry in the root dependency tree serves only the one-use temporary consumer; it is neither written nor installed into that dependency tree.</en></lang>
const uniCompilerEntry = resolve(repositoryRoot, 'node_modules/@dcloudio/vite-plugin-uni/bin/uni.js');
// <lang><zh-CN>直接使用当前 Node 安装携带的 npm CLI JavaScript 入口，避免 Windows `.cmd` shim 的 shell 解析，同时保持固定参数和离线边界。</zh-CN><en>Uses the npm CLI JavaScript entry carried by the current Node installation directly, avoiding Windows `.cmd` shim shell parsing while retaining fixed arguments and the offline boundary.</en></lang>
const npmCliEntry = resolve(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
// <lang><zh-CN>临时 consumer 只读连接复用的根开发工具目录；它们都已由本仓锁定，绝不在试验中安装、升级或写回。</zh-CN><en>Root development-tool directories reused through read-only temporary-consumer links; all are already locked by this repository and are never installed, upgraded, or written back during the trial.</en></lang>
const linkedDevelopmentModules = Object.freeze(['@dcloudio', '@vue', 'typescript', 'vite', 'vue']);

/**
 * @lang zh-CN 离线 tarball consumer 必须真实组合并编译的六个稳定表单/输入组件名。
 * @lang en Six stable form/input component names that the offline tarball consumer must actually compose and compile.
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
 * @lang zh-CN 临时 tarball consumer 必须保留的三个显式表单动作名；列表只用于验证生成源码，不执行页面逻辑。
 * @lang en Three explicit form-action names that the temporary tarball consumer must retain; the list verifies generated source only and executes no page logic.
 */
const P66_FORM_ACTION_NAMES = Object.freeze([
  'validateP66Form',
  'clearP66Validation',
  'resetP66Fields'
]);

/**
 * @lang zh-CN tarball 必须显式携带的 P66 leaf 源码、样式与无框架 runtime；清单防止相对 import 在安装后缺失。
 * @lang en P66 leaf sources, styles, and framework-free runtime that the tarball must explicitly carry; the inventory prevents relative imports from disappearing after installation.
 */
const P66_REQUIRED_PACKAGE_PATHS = Object.freeze([
  'src/components/u-form/form-runtime.mjs',
  'src/components/u-form/u-form.vue',
  'src/components/u-form/u-form.css',
  'src/components/u-form-item/u-form-item.vue',
  'src/components/u-form-item/u-form-item.css',
  'src/components/u-field/u-field.vue',
  'src/components/u-field/u-field.css',
  'src/components/u-input/u-input.vue',
  'src/components/u-input/u-input.css',
  'src/components/u-textarea/u-textarea.vue',
  'src/components/u-textarea/u-textarea.css',
  'src/components/u-search/u-search.vue',
  'src/components/u-search/u-search.css'
]);

/**
 * @lang zh-CN 以固定参数执行一个本地进程并收集 stdout/stderr。该 helper 不允许 shell、网络命令或调用方插入的可执行文件。
 * @lang en Runs one local process with fixed arguments and collects stdout/stderr. This helper permits neither a shell nor network commands or caller-injected executables.
 * @param {string} command <lang><zh-CN>受控可执行文件或 Node binary。</zh-CN><en>Controlled executable or Node binary.</en></lang>
 * @param {string[]} argumentsList <lang><zh-CN>固定或本脚本生成的参数列表。</zh-CN><en>Fixed or script-generated argument list.</en></lang>
 * @param {object} options <lang><zh-CN>含受控 `cwd` 及可选最小 `env` 补充的对象。</zh-CN><en>Object containing controlled `cwd` and optional minimal `env` additions.</en></lang>
 * @returns {Promise<{code: number, stderr: string, stdout: string}>} <lang><zh-CN>进程退出码与捕获文本。</zh-CN><en>Process exit code and captured text.</en></lang>
 */
function runLocalProcess(command, argumentsList, options) {
  return new Promise((resolveResult, reject) => {
    // <lang><zh-CN>以 shell:false 运行，避免 tarball path、临时路径或 JSON 内容被解释为命令语法。</zh-CN><en>Runs with shell:false so tarball paths, temporary paths, or JSON content cannot be interpreted as command syntax.</en></lang>
    const child = spawn(command, argumentsList, {
      cwd: options.cwd,
      env: options.env ?? process.env,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    // <lang><zh-CN>分别缓冲两个文本流，保留 npm/compiler 诊断而不把它们写进仓库文件。</zh-CN><en>Buffers the two text streams separately, retaining npm/compiler diagnostics without writing them into repository files.</en></lang>
    let stdout = '';
    let stderr = '';

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      // <lang><zh-CN>stdout 只用于本次命令的 JSON 或受控诊断；不作为后续 shell 输入。</zh-CN><en>Stdout is used only for this command's JSON or controlled diagnostics and never as subsequent shell input.</en></lang>
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      // <lang><zh-CN>stderr 保留给失败报告或已知 compiler warning，不决定成功条件。</zh-CN><en>Stderr is retained for failure reports or known compiler warnings and does not itself decide success.</en></lang>
      stderr += chunk;
    });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      // <lang><zh-CN>signal 终止被视为失败，避免把不完整的临时输出误当作已验证 tarball。</zh-CN><en>A signal termination is treated as failure, preventing incomplete temporary output from being mistaken for a verified tarball.</en></lang>
      if (signal) {
        reject(new Error(`Local process ended from signal ${signal}.`));
        return;
      }

      resolveResult({ code: code ?? 1, stderr, stdout });
    });
  });
}

/**
 * @lang zh-CN 要求一个本地受控进程以零退出码结束；失败时仅包含其自身的截断诊断，避免泄露临时目录中无关内容。
 * @lang en Requires a local controlled process to finish with zero exit status; on failure it includes only that process's truncated diagnostics, avoiding leakage of unrelated temporary-directory content.
 * @param {string} label <lang><zh-CN>稳定的试验步骤名称。</zh-CN><en>Stable trial-step name.</en></lang>
 * @param {string} command <lang><zh-CN>受控可执行文件或 Node binary。</zh-CN><en>Controlled executable or Node binary.</en></lang>
 * @param {string[]} argumentsList <lang><zh-CN>固定或本脚本生成的参数。</zh-CN><en>Fixed or script-generated arguments.</en></lang>
 * @param {object} options <lang><zh-CN>含受控 `cwd` 及可选最小 `env` 补充的对象。</zh-CN><en>Object containing controlled `cwd` and optional minimal `env` additions.</en></lang>
 * @returns {Promise<string>} <lang><zh-CN>成功进程的 stdout。</zh-CN><en>Stdout from the successful process.</en></lang>
 */
async function requireLocalSuccess(label, command, argumentsList, options) {
  // <lang><zh-CN>运行已白名单的局部命令，所有参数均由此脚本构造。</zh-CN><en>Runs the allowlisted local command with every argument constructed by this script.</en></lang>
  const result = await runLocalProcess(command, argumentsList, options);

  // <lang><zh-CN>零退出码才允许继续读取 tarball/consumer 结果；stderr warning 不单独使步骤失败。</zh-CN><en>Only a zero exit code allows reading tarball/consumer results; stderr warnings alone do not fail a step.</en></lang>
  if (result.code !== 0) {
    // <lang><zh-CN>限制诊断长度，保留可操作错误同时避免把临时目录的大量输出带入日志。</zh-CN><en>Limits diagnostic length, preserving actionable errors while avoiding large temporary-directory output in logs.</en></lang>
    const diagnostic = `${result.stdout}\n${result.stderr}`.trim().slice(-4000);
    throw new Error(`${label} failed with exit code ${result.code}.\n${diagnostic}`);
  }

  return result.stdout;
}

/**
 * @lang zh-CN 确认候选路径仍位于本脚本创建的临时根内；该 guard 只服务 cleanup，拒绝根目录和跨目录删除。
 * @lang en Confirms that a candidate path remains inside the temporary root created by this script. This guard serves cleanup only and rejects a root directory or cross-directory deletion.
 * @param {string} temporaryRoot <lang><zh-CN>由 `mkdtemp` 返回的绝对临时根。</zh-CN><en>Absolute temporary root returned by `mkdtemp`.</en></lang>
 * @param {string} candidatePath <lang><zh-CN>待校验的绝对候选路径。</zh-CN><en>Absolute candidate path to validate.</en></lang>
 * @returns {boolean} <lang><zh-CN>候选是临时根的严格后代时为 true。</zh-CN><en>True when the candidate is a strict descendant of the temporary root.</en></lang>
 */
function isTemporaryDescendant(temporaryRoot, candidatePath) {
  // <lang><zh-CN>解析相对路径，避免仅依赖字符串前缀而允许相邻目录名称绕过。</zh-CN><en>Resolves a relative path, avoiding reliance on a string prefix that adjacent directory names could bypass.</en></lang>
  const relativePath = relative(temporaryRoot, candidatePath);

  // <lang><zh-CN>根自身、空路径、父目录 traversal 与绝对相对结果都不是可删除的临时后代。</zh-CN><en>The root itself, an empty path, parent traversal, and an absolute relative result are not removable temporary descendants.</en></lang>
  return Boolean(relativePath) && !relativePath.startsWith(`..${sep}`) && relativePath !== '..' && !relativePath.includes(`..${sep}`) && !relativePath.startsWith(sep);
}

/**
 * @lang zh-CN 递归列出受控输出目录的相对文件路径；它只用于验证 compiler 是否产出预期小程序构件，不读取文件正文。
 * @lang en Recursively lists relative file paths in a controlled output directory. It only verifies whether the compiler produced expected Mini Program artifacts and reads no file body.
 * @param {string} directory <lang><zh-CN>受控输出目录。</zh-CN><en>Controlled output directory.</en></lang>
 * @param {string} [prefix=''] <lang><zh-CN>当前递归相对前缀。</zh-CN><en>Current recursive relative prefix.</en></lang>
 * @returns {Promise<string[]>} <lang><zh-CN>按 code-point 排序的相对文件列表。</zh-CN><en>Relative file list sorted by code point.</en></lang>
 */
async function listOutputFiles(directory, prefix = '') {
  // <lang><zh-CN>读取单个已经创建的临时输出目录；不对仓库或使用者目录进行枚举。</zh-CN><en>Reads one already-created temporary output directory and enumerates neither repository nor consumer directories.</en></lang>
  const entries = await readdir(directory, { withFileTypes: true });
  // <lang><zh-CN>以 code-point 顺序稳定遍历，使 Windows 文件系统枚举顺序不影响诊断或断言。</zh-CN><en>Traverses in code-point order so Windows filesystem enumeration order cannot affect diagnostics or assertions.</en></lang>
  const orderedEntries = entries.sort((left, right) => (left.name < right.name ? -1 : left.name > right.name ? 1 : 0));
  // <lang><zh-CN>收集当前分支的文件，递归仅进入临时 compiler 输出中的真实目录。</zh-CN><en>Collects files in the current branch and recurses only into real directories inside temporary compiler output.</en></lang>
  const nestedPaths = await Promise.all(orderedEntries.map(async (entry) => {
    // <lang><zh-CN>每个 relative 输出名只从受控 dirent 得到，不能携带调用方传入路径片段。</zh-CN><en>Each relative output name comes only from a controlled dirent and cannot carry caller-supplied path fragments.</en></lang>
    const relativePath = join(prefix, entry.name);
    // <lang><zh-CN>目录递归延续固定输出根；文件仅报告相对路径，符号链接不作为 output evidence 接受。</zh-CN><en>Directory recursion continues from the fixed output root; files report only relative paths, and symlinks are not accepted as output evidence.</en></lang>
    if (entry.isDirectory()) {
      return listOutputFiles(join(directory, entry.name), relativePath);
    }

    return entry.isFile() ? [relativePath] : [];
  }));

  // <lang><zh-CN>扁平化后再次排序，保证深层目录组合仍保持稳定顺序。</zh-CN><en>Flattens and sorts again so deep-directory composition retains stable order.</en></lang>
  return nestedPaths.flat().sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
}

/**
 * @lang zh-CN 在受控 compiler 相对文件清单中查找稳定后缀，避免验证逻辑绑定临时 node-modules 前缀或 hash 路径。
 * @lang en Finds a stable suffix in a controlled compiler-relative file inventory, avoiding validation logic bound to a temporary node-modules prefix or hashed path.
 * @param {string[]} outputFiles <lang><zh-CN>由 `listOutputFiles` 返回的已排序相对路径。</zh-CN><en>Sorted relative paths returned by `listOutputFiles`.</en></lang>
 * @param {string} suffix <lang><zh-CN>由本脚本固定构造的 leaf 后缀。</zh-CN><en>Leaf suffix constructed by this script.</en></lang>
 * @returns {string | undefined} <lang><zh-CN>首个精确后缀匹配，或不存在时 undefined。</zh-CN><en>First exact suffix match, or undefined when absent.</en></lang>
 */
function findOutputFileBySuffix(outputFiles, suffix) {
  // <lang><zh-CN>清单已经稳定排序，因此首个匹配在不同文件系统枚举顺序下仍确定。</zh-CN><en>The inventory is already stably sorted, so the first match remains deterministic across filesystem enumeration orders.</en></lang>
  for (const filePath of outputFiles) {
    if (filePath.endsWith(suffix)) {
      return filePath;
    }
  }
  return undefined;
}

/**
 * @lang zh-CN 从本轮临时 compiler 输出读取并解析一个已定位 JSON 文件；函数不接受仓库或外部绝对路径。
 * @lang en Reads and parses one located JSON file from this run's temporary compiler output; the function accepts no repository or external absolute path.
 * @param {string} outputDirectory <lang><zh-CN>本轮受控 compiler 输出根。</zh-CN><en>Controlled compiler-output root for this run.</en></lang>
 * @param {string} relativeFilePath <lang><zh-CN>由输出清单取得的相对 JSON 路径。</zh-CN><en>Relative JSON path obtained from the output inventory.</en></lang>
 * @returns {Promise<Record<string, unknown>>} <lang><zh-CN>解析后的生成配置。</zh-CN><en>Parsed generated configuration.</en></lang>
 */
async function readTrialOutputJson(outputDirectory, relativeFilePath) {
  // <lang><zh-CN>路径只由受控根和已枚举相对项组成，读取文本后直接采用严格 JSON 解析。</zh-CN><en>The path consists only of the controlled root and an enumerated relative entry; its text is parsed as strict JSON directly.</en></lang>
  const content = await readFile(join(outputDirectory, relativeFilePath), 'utf8');
  return JSON.parse(content);
}

/**
 * @lang zh-CN 写入一次性 consumer 的最小 UniApp 输入；全部文字固定、无业务数据、无网络 URL，且仅可写到本函数的已验证临时根内。
 * @lang en Writes the minimal UniApp input for the one-use consumer. All text is fixed, has no business data or network URL, and may write only inside this function's verified temporary root.
 * @param {string} consumerDirectory <lang><zh-CN>已验证的临时 consumer 根。</zh-CN><en>Verified temporary consumer root.</en></lang>
 * @param {string} tarballPath <lang><zh-CN>本轮 `npm pack` 输出的绝对 tarball 路径。</zh-CN><en>Absolute tarball path output by this run's `npm pack`.</en></lang>
 * @param {{easycom: object}} easycomFragment <lang><zh-CN>从包内 JSON 读取的受控 Easycom 片段。</zh-CN><en>Controlled Easycom fragment read from package JSON.</en></lang>
 * @returns {Promise<void>} <lang><zh-CN>无返回值；解析并写入固定临时 fixture。</zh-CN><en>Resolves without a value after composing and writing the fixed temporary fixture.</en></lang>
 */
async function writeConsumerFixture(consumerDirectory, tarballPath, easycomFragment) {
  // <lang><zh-CN>consumer root 必须是调用方已证实的临时子目录，避免此 helper 被错误复用为工作树 writer。</zh-CN><en>The consumer root must be a caller-confirmed temporary descendant, preventing this helper from being misused as a worktree writer.</en></lang>
  assert.ok(isTemporaryDescendant(temporaryTrialRoot, consumerDirectory), 'Consumer fixture must remain inside the one-use temporary root.');
  // <lang><zh-CN>仅创建本次 fixture 所需的单页目录；不会复制仓库 fixture、BP 或业务代码。</zh-CN><en>Creates only the single-page directory required by this fixture and copies no repository fixture, BP, or business code.</en></lang>
  await mkdir(join(consumerDirectory, 'pages', 'index'), { recursive: true });

  // <lang><zh-CN>package metadata 只绑定本轮 tarball；开发工具稍后通过只读临时链接提供，避免离线缓存缺失时 npm 查询 registry。</zh-CN><en>Package metadata binds only this run's tarball; development tools are supplied later through read-only temporary links, avoiding npm registry queries when the offline cache is incomplete.</en></lang>
  const consumerPackage = {
    name: '@hia-uview/private-package-trial',
    private: true,
    version: '0.0.0',
    dependencies: {
      '@hia-uview/ui': pathToFileURL(tarballPath).href
    }
  };
  // <lang><zh-CN>pages JSON 只合并包内静态 easycom 与一个本地页面；不会加入域名、权限、路由或动态脚本。</zh-CN><en>Pages JSON merges only package-static Easycom with one local page and adds no domain, permission, route, or dynamic script.</en></lang>
  const pagesJson = {
    ...easycomFragment,
    pages: [
      {
        path: 'pages/index/index',
        style: {
          navigationBarTitleText: 'Private package trial'
        }
      }
    ]
  };
  // <lang><zh-CN>最小 manifest 固定使用 compiler tourist AppID，不绑定任何真实开发者、项目或云资源。</zh-CN><en>The minimal manifest is fixed to the compiler tourist AppID and binds no real developer, project, or cloud resource.</en></lang>
  const manifest = {
    name: 'HIA-uView private package trial',
    versionCode: '100',
    versionName: '0.0.0',
    'mp-weixin': {
      appid: 'touristappid'
    }
  };
  // <lang><zh-CN>Vite 配置只引用本地已安装的官方 UniApp plugin，不声明 server、proxy、环境变量或外部 transform。</zh-CN><en>The Vite configuration references only the locally installed official UniApp plugin and declares no server, proxy, environment variable, or external transform.</en></lang>
  const viteConfig = "import { defineConfig } from 'vite';\nimport uniPlugin from '@dcloudio/vite-plugin-uni';\nexport default defineConfig({ plugins: [uniPlugin.default()] });\n";
  // <lang><zh-CN>入口仅创建 UniApp 应用，不安装 plugin、读取网络或执行页面以外的全局逻辑。</zh-CN><en>The entry only creates the UniApp application and installs no plugin, reads no network, and executes no global logic outside the page.</en></lang>
  const mainSource = "import { createSSRApp } from 'vue';\nimport App from './App.vue';\nexport function createApp() { return { app: createSSRApp(App) }; }\n";
  // <lang><zh-CN>HTML 仅满足 Vite/UniApp build 的固定入口要求；它不在试验中启动浏览器、页面服务或 H5 runtime。</zh-CN><en>HTML satisfies only the fixed Vite/UniApp build-entry requirement; it starts no browser, page server, or H5 runtime in this trial.</en></lang>
  const indexHtml = "<!doctype html>\n<html lang=\"en\"><head><meta charset=\"UTF-8\" /><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" /><title>Private UI package trial</title></head><body><div id=\"app\"></div><script type=\"module\" src=\"/main.js\"></script></body></html>\n";
  // <lang><zh-CN>根 App 只提供页面 slot 与显式包 style import；它不注册 runtime global components，证明 Easycom 是编译期解析。</zh-CN><en>The root App provides only a page slot and explicit package-style import; it registers no runtime global components, proving Easycom is compile-time resolution.</en></lang>
  const appSource = "<script>export default { onLaunch() {} };</script>\n<style>@import '@hia-uview/ui/style.css';</style>\n";
  // <lang><zh-CN>临时页面保留既有代表组件，并新增独立中性 P66 表单组合；全部状态与规则位于页面内，不携带 business data、remote option、平台 lifecycle 或动态代码。</zh-CN><en>The temporary page retains existing representative components and adds an independent neutral P66 form composition; all state and rules stay in the page and carry no business data, remote option, platform lifecycle, or dynamic code.</en></lang>
  const pageSource = `<!--
@component PrivatePackageTrialPage
@lang zh-CN 通过已安装 tarball 的 Easycom 组合代表组件与 P66 六组件表单；页面只使用中性本地状态，不连接网络、业务、storage、router 或身份。
@lang en Composes representative components and the P66 six-component form through Easycom from the installed tarball; the page uses only neutral local state and connects to no network, business, storage, router, or identity.
-->
<template>
  <view class="package-trial">
    <u-checkbox v-model="checked" value="trial" label="Local choice" />
    <u-radio-group v-model="radio"><u-radio value="one" label="One" /></u-radio-group>
    <u-picker v-model="selected" :columns="pickerOptions" title="Local picker" />
    <u-notice-bar :show="true" text="Local package trial" />
    <u-tabbar v-model="tab" :items="tabItems" />

    <!--
    @lang zh-CN 中性表单模型只验证 tarball 安装后的 registry、受控输入与 imperative API 可被 compiler 组合；不表示任何领域实体或提交。
    @lang en The neutral form model only verifies that registry, controlled inputs, and imperative APIs can be composed by the compiler after tarball installation; it represents no domain entity or submission.
    -->
    <view class="package-trial__p66-form" data-smoke="p66-form-composition">
      <u-form ref="p66FormReference" :model="p66FormModel" :rules="p66FormRules" label-position="top">
        <u-form-item prop="fieldText" help-text="UField built-in UInput">
          <u-field v-model="p66FormModel.fieldText" label="Field text" :required="true" placeholder="Enter field text" />
        </u-form-item>
        <u-form-item prop="inputText" label="Direct input">
          <u-input v-model="p66FormModel.inputText" placeholder="Enter direct text" />
        </u-form-item>
        <u-form-item prop="longText" label="Long text">
          <u-textarea v-model="p66FormModel.longText" placeholder="Enter long text" :show-count="true" />
        </u-form-item>
        <u-form-item prop="searchText" label="Search text">
          <u-search v-model="p66FormModel.searchText" placeholder="Enter local query" :show-action="true" action-text="Observe" @search="recordP66SearchIntent" />
        </u-form-item>
      </u-form>
      <!-- <lang><zh-CN>原生按钮仅调用当前 form ref 并更新可见 marker；compiler trial 不执行这些点击，也不据此声明平台 runtime 通过。</zh-CN><en>Native buttons only call the current form ref and update a visible marker; the compiler trial does not execute these clicks or claim platform runtime success from them.</en></lang> -->
      <button @click="validateP66Form">Validate locally</button>
      <button @click="clearP66Validation">Clear validation</button>
      <button @click="resetP66Fields">Reset fields</button>
      <text class="package-trial__p66-result" data-smoke="p66-form-result">{{ p66FormResult }}</text>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue';

// <lang><zh-CN>既有代表组件继续使用页面本地受控值；它们不与 P66 表单模型共享语义。</zh-CN><en>Existing representative components continue to use page-local controlled values and share no semantics with the P66 form model.</en></lang>
const checked = ref(false);
const radio = ref('one');
const selected = ref('one');
const pickerOptions = Object.freeze([Object.freeze({ label: 'One', value: 'one' })]);
const tab = ref(0);
const tabItems = Object.freeze([Object.freeze({ label: 'Home', value: 0 })]);

// <lang><zh-CN>form ref 只服务三个显式本地观察方法；空初值不会自动运行规则。</zh-CN><en>The form ref serves only three explicit local observation methods; its empty initial value runs no rule automatically.</en></lang>
const p66FormReference = ref(null);

// <lang><zh-CN>四字段只区分组件输入形态，不表示用户、订单、搜索服务或任何业务记录。</zh-CN><en>The four fields distinguish component input shapes only and represent no user, order, search service, or business record.</en></lang>
const p66FormModel = reactive({
  fieldText: 'Local field',
  inputText: 'Local input',
  longText: 'Local long text',
  searchText: 'Local query'
});

/**
 * @lang zh-CN 声明临时 consumer 源码直接提供的同步规则；没有远端 validator、脚本字符串或默认业务文案。
 * @lang en Declares synchronous rules supplied directly by temporary-consumer source; there is no remote validator, script string, or default business copy.
 */
const p66FormRules = Object.freeze({
  fieldText: Object.freeze([Object.freeze({ required: true, trigger: Object.freeze(['change', 'blur']), message: 'Field text is required' })]),
  inputText: Object.freeze([Object.freeze({ min: 2, trigger: 'blur', message: 'Use at least two characters' })]),
  longText: Object.freeze([Object.freeze({ max: 80, trigger: 'change', message: 'Use at most eighty characters' })]),
  searchText: Object.freeze([Object.freeze({ min: 2, trigger: 'change', message: 'Use at least two query characters' })])
});

// <lang><zh-CN>结果文字只用于编译后可见 marker，不表示提交、保存或后端成功。</zh-CN><en>Result copy serves only as a visible post-compile marker and represents no submission, save, or backend success.</en></lang>
const p66FormResult = ref('idle');

/**
 * @lang zh-CN 显式运行当前注册字段校验，并将 boolean 映射为中性 marker。
 * @lang en Explicitly validates currently registered fields and maps the boolean to a neutral marker.
 * @returns {Promise<void>} <lang><zh-CN>校验完成并更新 marker 后解决。</zh-CN><en>Resolves after validation and marker update complete.</en></lang>
 */
async function validateP66Form() {
  // <lang><zh-CN>挂载前没有组件实例时保持受控失败披露，不进行全局组件查找。</zh-CN><en>Before mount, absence of a component instance retains a controlled failure disclosure and performs no global component lookup.</en></lang>
  const form = p66FormReference.value;
  if (form === null) {
    p66FormResult.value = 'unavailable';
    return;
  }

  // <lang><zh-CN>页面只消费稳定 boolean，不把错误解释为业务状态。</zh-CN><en>The page consumes only the stable boolean and does not interpret errors as business state.</en></lang>
  const valid = await form.validate();
  p66FormResult.value = valid ? 'valid' : 'invalid';
}

/**
 * @lang zh-CN 清除内部校验投影并保留调用方模型值。
 * @lang en Clears internal validation projections while retaining caller-model values.
 * @returns {void} <lang><zh-CN>无返回值；只更新本地 UI 与 marker。</zh-CN><en>No return value; updates only local UI and the marker.</en></lang>
 */
function clearP66Validation() {
  // <lang><zh-CN>可选实例 guard 只保护挂载边界，不创建替代表单。</zh-CN><en>The optional-instance guard protects only the mount boundary and creates no substitute form.</en></lang>
  p66FormReference.value?.clearValidate();
  p66FormResult.value = 'cleared';
}

/**
 * @lang zh-CN 显式恢复挂载快照；这是临时页面唯一允许 form 写 model 的入口。
 * @lang en Explicitly restores mount snapshots; this is the temporary page's only entry that permits the form to write the model.
 * @returns {void} <lang><zh-CN>无返回值；更新字段和 marker。</zh-CN><en>No return value; updates fields and the marker.</en></lang>
 */
function resetP66Fields() {
  // <lang><zh-CN>未挂载时模型保持不变，marker 仍记录调用方的本地 reset 请求。</zh-CN><en>Before mount, the model remains unchanged while the marker still records the caller's local reset request.</en></lang>
  p66FormReference.value?.resetFields();
  p66FormResult.value = 'reset';
}

/**
 * @lang zh-CN 记录搜索 intent；文字是否为空只改变中性 marker，不发起查询。
 * @lang en Records search intent; whether copy is empty changes only a neutral marker and starts no query.
 * @param {string} value <lang><zh-CN>页面拥有的当前查询文字。</zh-CN><en>Current page-owned query copy.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；只写本地 marker。</zh-CN><en>No return value; writes only the local marker.</en></lang>
 */
function recordP66SearchIntent(value) {
  p66FormResult.value = value.length > 0 ? 'search-intent' : 'search-empty-intent';
}
</script>

<style>
.package-trial { padding: 12px; }
.package-trial__p66-form { margin-block-start: 12px; }
</style>
`;
  // <lang><zh-CN>写入临时目录前先验证生成页源码，确保 trial 输入本身包含中性 marker、六组件、调用方 model/rules 和三个显式 form API。</zh-CN><en>Before writing the temporary directory, validates generated page source so the trial input itself contains neutral markers, all six components, caller-owned model/rules, and three explicit form APIs.</en></lang>
  assert.match(pageSource, /data-smoke="p66-form-composition"/u, 'Installed-package trial source must retain the neutral P66 composition marker.');
  assert.match(pageSource, /data-smoke="p66-form-result"/u, 'Installed-package trial source must retain the visible P66 result marker.');
  assert.match(pageSource, /<u-form\s+ref="p66FormReference"\s+:model="p66FormModel"\s+:rules="p66FormRules"/u, 'Installed-package trial source must bind UForm to its local ref, model, and rules.');

  // <lang><zh-CN>逐标签断言真实组合，避免仅凭 tarball 文件清单误判临时 consumer 已消费组件。</zh-CN><en>Asserts actual composition tag by tag, avoiding a false conclusion from the tarball inventory alone that the temporary consumer uses the components.</en></lang>
  for (const componentName of P66_FORM_COMPONENT_NAMES) {
    assert.match(pageSource, new RegExp(`<${componentName}(?:\\s|>)`, 'u'), `Installed-package trial source must compose ${componentName}.`);
  }

  // <lang><zh-CN>三个源码函数必须分别提供 validate、clear 与 reset 入口；compiler trial 只验证它们可编译，不宣称已执行点击。</zh-CN><en>Three source functions must separately provide validate, clear, and reset entries; the compiler trial verifies only that they compile and does not claim clicks were executed.</en></lang>
  for (const actionName of P66_FORM_ACTION_NAMES) {
    assert.match(pageSource, new RegExp(`function ${actionName}\\(`, 'u'), `Installed-package trial source must retain ${actionName}.`);
  }

  // <lang><zh-CN>TypeScript consumer 显式导入六组件精确类型与 global 映射，证明 tarball export resolver 而非仓内 paths 映射提供 declaration。</zh-CN><en>The TypeScript consumer explicitly imports precise six-component types and global mappings, proving the tarball export resolver rather than in-repository path mappings supplies declarations.</en></lang>
  const typeConsumerSource = `/**
 * @module private-package-type-trial
 * @lang zh-CN 从一次性安装的 tarball 验证组件、props、规则、实例和 global declaration；文件只被 TypeScript 静态检查，不运行 UI。
 * @lang en Verifies components, props, rules, instances, and global declarations from the one-use installed tarball; the file is only type-checked by TypeScript and runs no UI.
 */
import UView, {
  UCheckbox,
  UField,
  UForm,
  UFormItem,
  UInput,
  UPicker,
  USearch,
  UTextarea,
  type UCheckboxProps,
  type UFieldProps,
  type UFormInstance,
  type UFormItemProps,
  type UFormProps,
  type UFormRules,
  type UInputProps,
  type USearchProps,
  type UTextareaProps
} from '@hia-uview/ui';
import '@hia-uview/ui/global';
import type { GlobalComponents, Plugin } from 'vue';

// <lang><zh-CN>既有 checkbox 类型继续证明普通包导出没有因 P66 组合退化。</zh-CN><en>The existing checkbox type continues to prove ordinary package exports do not regress because of the P66 composition.</en></lang>
const checkboxProps: UCheckboxProps = { value: 'trial', modelValue: false };

// <lang><zh-CN>规则根只包含当前 runtime 支持的同步 required/change 形状。</zh-CN><en>The rules root contains only the synchronous required/change shape supported by the current runtime.</en></lang>
const formRules: UFormRules = {
  fieldText: [{ required: true, trigger: ['change', 'blur'], message: 'Field text is required' }]
};

// <lang><zh-CN>六组件 props 分别检查模型、字段路径、受控值与有限显示开关。</zh-CN><en>Props for the six components separately check model, field path, controlled values, and finite display switches.</en></lang>
const formProps: UFormProps = { model: { fieldText: 'Local field' }, rules: formRules, labelPosition: 'top' };
const formItemProps: UFormItemProps = { prop: 'fieldText', required: true };
const fieldProps: UFieldProps = { modelValue: 'Local field', label: 'Field text', required: true };
const inputProps: UInputProps = { modelValue: 'Local input', readonly: false };
const textareaProps: UTextareaProps = { modelValue: 'Local long text', showCount: true };
const searchProps: USearchProps = { modelValue: 'Local query', showAction: true, actionText: 'Observe' };

// <lang><zh-CN>instance 方法类型证明 defineExpose 表面从安装包 declaration 可解析；变量没有运行时值。</zh-CN><en>The instance-method type proves the defineExpose surface resolves from installed-package declarations; the variable has no runtime value.</en></lang>
type FormValidationMethod = UFormInstance['validateField'];
const formValidationMethod: FormValidationMethod | undefined = undefined;

// <lang><zh-CN>plugin 与六个 global 映射只做静态赋值，不注册 Vue 应用。</zh-CN><en>The plugin and six global mappings perform static assignment only and register no Vue application.</en></lang>
const plugin: Plugin = UView;
const globalForm: GlobalComponents['UForm'] = UForm;
const globalFormItem: GlobalComponents['UFormItem'] = UFormItem;
const globalField: GlobalComponents['UField'] = UField;
const globalInput: GlobalComponents['UInput'] = UInput;
const globalTextarea: GlobalComponents['UTextarea'] = UTextarea;
const globalSearch: GlobalComponents['USearch'] = USearch;

// <lang><zh-CN>收集静态引用，避免 TypeScript 将本 trial 退化为只解析 import 的空文件。</zh-CN><en>Collects static references so TypeScript cannot reduce this trial to an empty file that only resolves imports.</en></lang>
void [
  checkboxProps,
  fieldProps,
  formItemProps,
  formProps,
  formValidationMethod,
  globalField,
  globalForm,
  globalFormItem,
  globalInput,
  globalSearch,
  globalTextarea,
  inputProps,
  plugin,
  searchProps,
  textareaProps,
  UCheckbox,
  UPicker
];
`;
  // <lang><zh-CN>临时 tsconfig 使用 package resolver，不声明 paths；这样类型通过只能来自已安装 tarball 的 package metadata。</zh-CN><en>The temporary tsconfig uses the package resolver and declares no paths, so a type pass can come only from installed-tarball package metadata.</en></lang>
  const typeConfig = {
    compilerOptions: {
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      noEmit: true,
      strict: true,
      target: 'ES2022'
    },
    files: ['consumer.ts']
  };

  // <lang><zh-CN>写入所有固定 consumer 输入；每个目标由已验证的 consumer root 拼接，不接受外部文件名。</zh-CN><en>Writes every fixed consumer input; each target is joined from the verified consumer root and accepts no external filename.</en></lang>
  await Promise.all([
    writeFile(join(consumerDirectory, 'package.json'), `${JSON.stringify(consumerPackage, null, 2)}\n`, 'utf8'),
    writeFile(join(consumerDirectory, 'pages.json'), `${JSON.stringify(pagesJson, null, 2)}\n`, 'utf8'),
    writeFile(join(consumerDirectory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8'),
    writeFile(join(consumerDirectory, 'vite.config.mjs'), viteConfig, 'utf8'),
    writeFile(join(consumerDirectory, 'index.html'), indexHtml, 'utf8'),
    writeFile(join(consumerDirectory, 'main.js'), mainSource, 'utf8'),
    writeFile(join(consumerDirectory, 'App.vue'), appSource, 'utf8'),
    writeFile(join(consumerDirectory, 'pages', 'index', 'index.vue'), pageSource, 'utf8'),
    writeFile(join(consumerDirectory, 'consumer.ts'), typeConsumerSource, 'utf8'),
    writeFile(join(consumerDirectory, 'tsconfig.json'), `${JSON.stringify(typeConfig, null, 2)}\n`, 'utf8')
  ]);
}

/**
 * @lang zh-CN 在临时 consumer 的 node_modules 下建立指向本仓已锁定开发工具的目录链接；这只复用本地已安装内容，不复制、修改或安装任何依赖。
 * @lang en Creates directory links under the temporary consumer node_modules to this repository's locked development tools. This only reuses already-installed local content and copies, modifies, or installs no dependency.
 * @param {string} consumerDirectory <lang><zh-CN>已验证的一次性 consumer 根。</zh-CN><en>Verified one-use consumer root.</en></lang>
 * @returns {Promise<void>} <lang><zh-CN>无返回值；全部链接创建后完成。</zh-CN><en>Resolves without a value after every link is created.</en></lang>
 */
async function linkLockedDevelopmentModules(consumerDirectory) {
  // <lang><zh-CN>consumer node_modules 必须已经由 tarball install 创建，且 consumer 必须仍在唯一临时根内。</zh-CN><en>The consumer node_modules must already be created by tarball installation, and the consumer must remain inside the sole temporary root.</en></lang>
  assert.ok(isTemporaryDescendant(temporaryTrialRoot, consumerDirectory), 'Development-module links must stay inside the one-use temporary root.');
  // <lang><zh-CN>固定根目录使链接来源只能是当前仓的锁定 node_modules，不接受外部开发工具路径。</zh-CN><en>The fixed root limits link sources to this repository's locked node_modules and accepts no external development-tool path.</en></lang>
  const repositoryModulesDirectory = join(repositoryRoot, 'node_modules');
  const consumerModulesDirectory = join(consumerDirectory, 'node_modules');

  // <lang><zh-CN>逐个验证受控源目录存在后创建 directory/junction 链接；Windows 使用 junction，其他平台使用 dir 链接。</zh-CN><en>Verifies each controlled source directory before creating a directory/junction link; Windows uses junction and other platforms use dir links.</en></lang>
  for (const moduleName of linkedDevelopmentModules) {
    // <lang><zh-CN>module 名来自冻结列表，source/target 均由固定 node_modules 根与该名称拼接。</zh-CN><en>The module name comes from the frozen list, and both source/target join that name with fixed node_modules roots.</en></lang>
    const sourceDirectory = join(repositoryModulesDirectory, moduleName);
    const targetDirectory = join(consumerModulesDirectory, moduleName);
    await access(sourceDirectory);
    await mkdir(dirname(targetDirectory), { recursive: true });
    await symlink(sourceDirectory, targetDirectory, process.platform === 'win32' ? 'junction' : 'dir');
  }
}

/**
 * @lang zh-CN 当前试验的唯一临时根在开始后赋值，供 fixture writer 和 finally cleanup 使用；它永不指向仓库根。
 * @lang en The sole temporary root for the current trial is assigned after start and is used by the fixture writer and finally cleanup; it never points to the repository root.
 */
let temporaryTrialRoot = '';

try {
  // <lang><zh-CN>在创建任何试验材料前确认当前 Node 的 npm CLI 存在；缺失时立即失败，不退回 shell 或下载替代工具。</zh-CN><en>Confirms that the current Node npm CLI exists before creating any trial material; on absence it fails immediately and falls back to neither a shell nor a downloaded replacement.</en></lang>
  await access(npmCliEntry);

  // <lang><zh-CN>创建带固定前缀的系统临时根，所有 pack、install、compile 和 output 都限制在该根内。</zh-CN><en>Creates a system temporary root with a fixed prefix; all packing, installation, compilation, and output are confined to this root.</en></lang>
  temporaryTrialRoot = await mkdtemp(join(tmpdir(), 'hia-uview-ui-package-trial-'));
  // <lang><zh-CN>显式创建 tarball 与 consumer 子目录，避免使用系统临时根自身作为 install 或 compiler cwd。</zh-CN><en>Explicitly creates tarball and consumer subdirectories, avoiding use of the system temporary root itself as install or compiler cwd.</en></lang>
  const tarballDirectory = join(temporaryTrialRoot, 'tarball');
  const consumerDirectory = join(temporaryTrialRoot, 'consumer');
  await Promise.all([mkdir(tarballDirectory), mkdir(consumerDirectory)]);

  // <lang><zh-CN>以 ignore-scripts 打包 UI workspace；pack 本身不访问 registry，输出 JSON 仅用于验证受控包内容。</zh-CN><en>Packs the UI workspace with ignore-scripts; pack itself accesses no registry, and JSON output serves only to validate controlled package contents.</en></lang>
  const packOutput = await requireLocalSuccess(
    'Private UI package pack',
    process.execPath,
    [npmCliEntry, 'pack', '--json', '--ignore-scripts', '--pack-destination', tarballDirectory],
    { cwd: uiPackageDirectory }
  );
  // <lang><zh-CN>npm pack JSON 必须恰有一个本轮 tarball；不能以目录扫描推测文件名或复用旧 artifact。</zh-CN><en>Npm-pack JSON must describe exactly one tarball from this run; no filename is guessed through directory scanning or reused from an old artifact.</en></lang>
  const packRecords = JSON.parse(packOutput);
  assert.ok(Array.isArray(packRecords) && packRecords.length === 1, 'npm pack must report exactly one package artifact.');
  // <lang><zh-CN>artifact 文件名和清单均来自 npm 输出，再由固定目录拼接为绝对路径。</zh-CN><en>The artifact filename and inventory both come from npm output and are joined with the fixed directory into an absolute path.</en></lang>
  const packRecord = packRecords[0];
  const tarballPath = join(tarballDirectory, packRecord.filename);
  // <lang><zh-CN>只接受 private package 的必要 runtime/types/Easycom 文件，且拒绝 fixture/adapter 泄露到 tarball。</zh-CN><en>Accepts only required runtime/types/Easycom files for the private package and rejects fixture/adapter leakage into the tarball.</en></lang>
  const packedPaths = new Set(packRecord.files.map((file) => file.path));
  for (const requiredPath of [
    'package.json',
    'README.md',
    'LICENSE',
    'src/index.mjs',
    'src/style.css',
    'types/index.d.ts',
    'types/global-components.d.ts',
    'types/global-components.mjs',
    'easycom/mp-weixin.json',
    ...P66_REQUIRED_PACKAGE_PATHS
  ]) {
    assert.ok(packedPaths.has(requiredPath), `Package tarball must contain ${requiredPath}.`);
  }
  for (const forbiddenPath of ['fixtures/', 'manifest.json', 'pages.json', 'main.js', 'App.vue']) {
    assert.ok(![...packedPaths].some((packedPath) => packedPath === forbiddenPath || packedPath.startsWith(forbiddenPath)), `Package tarball must not contain ${forbiddenPath}.`);
  }

  // <lang><zh-CN>从 tarball 的本地 JSON 读取静态 Easycom，确保临时 consumer 不依赖仓内未打包的源片段。</zh-CN><en>Reads static Easycom from tarball-local JSON, ensuring the temporary consumer does not depend on an unpackaged in-repository source fragment.</en></lang>
  const extractedPackageDirectory = join(temporaryTrialRoot, 'extracted-package');
  await mkdir(extractedPackageDirectory);
  await requireLocalSuccess('Private UI package extract', 'tar', ['-xzf', tarballPath, '-C', extractedPackageDirectory], { cwd: temporaryTrialRoot });
  const easycomFragment = JSON.parse(await readFile(join(extractedPackageDirectory, 'package', 'easycom', 'mp-weixin.json'), 'utf8'));

  // <lang><zh-CN>写入 consumer 后执行 offline、ignore-scripts tarball 安装，并忽略 peer 自动解析；随后只读链接提供仓内锁定开发工具，绝不触发 registry 请求。</zh-CN><en>After writing the consumer, performs an offline ignore-scripts tarball installation while bypassing peer auto-resolution; read-only links then provide repository-locked development tools without triggering a registry request.</en></lang>
  await writeConsumerFixture(consumerDirectory, tarballPath, easycomFragment);
  await requireLocalSuccess(
    'Private UI package offline install',
    process.execPath,
    [npmCliEntry, 'install', '--offline', '--ignore-scripts', '--legacy-peer-deps', '--omit=dev', '--no-audit', '--no-fund'],
    { cwd: consumerDirectory }
  );

  // <lang><zh-CN>tarball 安装完成后才在临时 metadata 中声明目标 adapter，使 compiler 选择 mp-weixin；由于安装已结束，该声明不能触发 npm registry 解析。</zh-CN><en>Declares the target adapter in temporary metadata only after tarball installation so the compiler selects mp-weixin; because installation has ended, this declaration cannot trigger npm registry resolution.</en></lang>
  const compilerConsumerPackage = {
    name: '@hia-uview/private-package-trial',
    private: true,
    version: '0.0.0',
    dependencies: {
      '@hia-uview/ui': pathToFileURL(tarballPath).href
    },
    devDependencies: {
      '@dcloudio/uni-mp-weixin': '3.0.0-5010520260709002'
    }
  };
  await writeFile(join(consumerDirectory, 'package.json'), `${JSON.stringify(compilerConsumerPackage, null, 2)}\n`, 'utf8');

  // <lang><zh-CN>建立一次性开发工具链接后再进行 typecheck/compile；链接在 finally 中随 consumer 一并删除，根依赖树保持只读。</zh-CN><en>Creates one-use development-tool links before typecheck/compile; links are removed with the consumer in finally, while the root dependency tree remains read-only.</en></lang>
  await linkLockedDevelopmentModules(consumerDirectory);

  // <lang><zh-CN>验证已安装 package 是独立 consumer 的 node_modules 内容，而非 workspace link 或仓内 source 目录。</zh-CN><en>Verifies that the installed package is content in the independent consumer node_modules rather than a workspace link or in-repository source directory.</en></lang>
  const installedPackageDirectory = join(consumerDirectory, 'node_modules', '@hia-uview', 'ui');
  const installedPackage = JSON.parse(await readFile(join(installedPackageDirectory, 'package.json'), 'utf8'));
  assert.equal(installedPackage.name, '@hia-uview/ui');
  assert.equal(installedPackage.types, './types/index.d.ts');
  await readFile(join(installedPackageDirectory, 'types', 'index.d.ts'), 'utf8');
  await readFile(join(installedPackageDirectory, 'easycom', 'mp-weixin.json'), 'utf8');

  // <lang><zh-CN>临时 consumer 使用其自身安装的 TypeScript 解析包 export；没有 paths fallback，失败即可暴露 tarball declaration/exports 问题。</zh-CN><en>The temporary consumer uses its own installed TypeScript to resolve package exports with no paths fallback, so failure exposes tarball declaration/export issues.</en></lang>
  await requireLocalSuccess(
    'Private UI package typecheck',
    process.execPath,
    [join(repositoryRoot, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', 'tsconfig.json'],
    { cwd: consumerDirectory }
  );

  // <lang><zh-CN>运行固定本地 UniApp compiler，输入根为一次性 consumer；不启动 dev server、DevTools、预览或发布。</zh-CN><en>Runs the fixed local UniApp compiler with the one-use consumer as input root; it starts no dev server, DevTools, preview, or release.</en></lang>
  await requireLocalSuccess(
    'Private UI package mp-weixin compile',
    process.execPath,
    [uniCompilerEntry, 'build', '-p', 'mp-weixin'],
    {
      cwd: consumerDirectory,
      env: { ...process.env, UNI_INPUT_DIR: consumerDirectory }
    }
  );

  // <lang><zh-CN>只检查 compiler 输出中的 app/page、页面真实组合和 Easycom component 构件，不将静态产物误称为 DevTools、设备或跨端运行证据。</zh-CN><en>Checks only app/page output, actual page composition, and Easycom-component artifacts without presenting static artifacts as DevTools, device, or cross-platform runtime evidence.</en></lang>
  const compilerOutputDirectory = join(consumerDirectory, 'dist', 'build', 'mp-weixin');
  const compilerOutputFiles = await listOutputFiles(compilerOutputDirectory);
  assert.ok(compilerOutputFiles.includes('app.json'), `mp-weixin compiler must emit app.json. Observed temporary output: ${compilerOutputFiles.join(', ')}`);

  // <lang><zh-CN>取得本轮唯一试验页的 WXML/JSON 相对路径；路径来自受控 compiler 输出枚举，不接受外部输入。</zh-CN><en>Gets WXML/JSON relative paths for this run's sole trial page; paths come from controlled compiler-output enumeration and accept no external input.</en></lang>
  const trialPageMarkupPath = findOutputFileBySuffix(compilerOutputFiles, join('pages', 'index', 'index.wxml'));
  const trialPageConfigurationPath = findOutputFileBySuffix(compilerOutputFiles, join('pages', 'index', 'index.json'));
  assert.ok(trialPageMarkupPath, 'mp-weixin compiler must emit the trial page WXML.');
  assert.ok(trialPageConfigurationPath, 'mp-weixin compiler must emit the trial page JSON.');
  assert.ok(compilerOutputFiles.some((filePath) => filePath.endsWith(join('u-checkbox', 'u-checkbox.wxml'))), 'mp-weixin compiler must emit UCheckbox through static Easycom.');
  assert.ok(compilerOutputFiles.some((filePath) => filePath.endsWith(join('u-tabbar', 'u-tabbar.wxml'))), 'mp-weixin compiler must emit UTabbar through static Easycom.');

  // <lang><zh-CN>页面 WXML 必须同时保留中性 marker 与六个标签，排除“包里有组件但临时 consumer 未真实使用”的假阳性。</zh-CN><en>Page WXML must retain both neutral markers and all six tags, excluding a false positive where components exist in the package but the temporary consumer never actually uses them.</en></lang>
  const trialPageMarkup = await readFile(join(compilerOutputDirectory, trialPageMarkupPath), 'utf8');
  assert.match(trialPageMarkup, /data-smoke="p66-form-composition"/, 'Installed-package trial page must retain the neutral P66 composition marker.');
  assert.match(trialPageMarkup, /data-smoke="p66-form-result"/, 'Installed-package trial page must retain the visible P66 result marker.');
  for (const componentName of P66_FORM_COMPONENT_NAMES) {
    assert.match(trialPageMarkup, new RegExp(`<${componentName}(?:\\s|>)`, 'u'), `Installed-package trial page must compose ${componentName}.`);
  }

  // <lang><zh-CN>页面 JSON 的六个 mapping 必须指向已安装 package 的对应 leaf 名；不固定 node-modules 前缀，以免依赖 compiler 的内部输出布局。</zh-CN><en>All six mappings in page JSON must point to the matching leaf name in the installed package; the node-modules prefix remains unfixed to avoid depending on compiler-internal output layout.</en></lang>
  const trialPageConfiguration = await readTrialOutputJson(compilerOutputDirectory, trialPageConfigurationPath);
  for (const componentName of P66_FORM_COMPONENT_NAMES) {
    // <lang><zh-CN>统一路径分隔符后只检查稳定 leaf 后缀；安装根仍由本试验的临时 consumer 决定。</zh-CN><en>After normalizing path separators, checks only the stable leaf suffix; the temporary consumer still determines the installation root.</en></lang>
    const componentMapping = trialPageConfiguration.usingComponents?.[componentName];
    assert.equal(typeof componentMapping, 'string', `Installed-package trial page must map ${componentName}.`);
    assert.ok(componentMapping.replaceAll('\\', '/').endsWith(`/src/components/${componentName}/${componentName}`), `Installed-package trial mapping for ${componentName} must end at its package leaf SFC.`);
  }

  // <lang><zh-CN>每个目标组件必须从 tarball 经 Easycom 编译出 JS/JSON/WXML/WXSS；只出现 page tag 或单个模板文件均不足。</zh-CN><en>Each target component must compile from the tarball through Easycom into JS/JSON/WXML/WXSS; a page tag or one template file alone is insufficient.</en></lang>
  for (const componentName of P66_FORM_COMPONENT_NAMES) {
    for (const extension of ['js', 'json', 'wxml', 'wxss']) {
      // <lang><zh-CN>后缀断言允许 compiler 选择内部 node-modules 前缀，同时仍要求精确 leaf 文件名。</zh-CN><en>The suffix assertion permits a compiler-selected internal node-modules prefix while still requiring the exact leaf filename.</en></lang>
      const expectedSuffix = join(componentName, `${componentName}.${extension}`);
      assert.ok(findOutputFileBySuffix(compilerOutputFiles, expectedSuffix), `Installed-package compiler must emit ${componentName}.${extension}.`);
    }
  }

  // <lang><zh-CN>两个内部组合 JSON 进一步证明 UField 实际携带 UInput、UFormItem 实际携带校验消息组件，而非仅靠页面直接标签通过。</zh-CN><en>Two internal-composition JSON files further prove UField actually carries UInput and UFormItem carries the validation-message component rather than passing only through direct page tags.</en></lang>
  const fieldConfigurationPath = findOutputFileBySuffix(compilerOutputFiles, join('u-field', 'u-field.json'));
  const formItemConfigurationPath = findOutputFileBySuffix(compilerOutputFiles, join('u-form-item', 'u-form-item.json'));
  assert.ok(fieldConfigurationPath, 'Installed-package compiler must emit UField JSON.');
  assert.ok(formItemConfigurationPath, 'Installed-package compiler must emit UFormItem JSON.');
  const [fieldConfiguration, formItemConfiguration] = await Promise.all([
    readTrialOutputJson(compilerOutputDirectory, fieldConfigurationPath),
    readTrialOutputJson(compilerOutputDirectory, formItemConfigurationPath)
  ]);
  const fieldInputMapping = fieldConfiguration.usingComponents?.['u-input'];
  const formItemMessageMapping = formItemConfiguration.usingComponents?.['u-validation-message'];
  assert.equal(typeof fieldInputMapping, 'string', 'Installed-package UField must map its built-in UInput.');
  assert.equal(typeof formItemMessageMapping, 'string', 'Installed-package UFormItem must map UValidationMessage.');
  assert.ok(fieldInputMapping.replaceAll('\\', '/').endsWith('/u-input/u-input'), 'Installed-package UField mapping must end at UInput.');
  assert.ok(formItemMessageMapping.replaceAll('\\', '/').endsWith('/u-validation-message/u-validation-message'), 'Installed-package UFormItem mapping must end at UValidationMessage.');

  console.log('Private UI package tarball trial passed (offline install, typecheck, static mp-weixin Easycom compile, temporary cleanup pending).');
} finally {
  // <lang><zh-CN>仅删除由本次 mkdtemp 创建且仍严格位于系统临时目录下的根；任何其他路径都不接受 cleanup。</zh-CN><en>Deletes only the root created by this run's mkdtemp and still strictly under the system temporary directory; no other path is accepted for cleanup.</en></lang>
  if (temporaryTrialRoot && isTemporaryDescendant(tmpdir(), temporaryTrialRoot)) {
    await rm(temporaryTrialRoot, { force: true, recursive: true });
  }
}
