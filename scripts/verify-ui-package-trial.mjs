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
  // <lang><zh-CN>页面只引用四个审计组件和固定 local props，避免把 business data、remote option、平台 lifecycle 或动态代码带入 package trial。</zh-CN><en>The page references only four audited components with fixed local props, avoiding business data, remote options, platform lifecycle, or dynamic code in the package trial.</en></lang>
  const pageSource = "<template><view class=\"package-trial\"><u-checkbox v-model=\"checked\" value=\"trial\" label=\"Local choice\" /><u-radio-group v-model=\"radio\"><u-radio value=\"one\" label=\"One\" /></u-radio-group><u-picker v-model=\"selected\" :columns=\"pickerOptions\" title=\"Local picker\" /><u-notice-bar :show=\"true\" text=\"Local package trial\" /><u-tabbar v-model=\"tab\" :items=\"tabItems\" /></view></template>\n<script setup>import { ref } from 'vue'; const checked = ref(false); const radio = ref('one'); const selected = ref('one'); const pickerOptions = [{ label: 'One', value: 'one' }]; const tab = ref(0); const tabItems = [{ label: 'Home', value: 0 }];</script>\n<style>.package-trial { padding: 12px; }</style>\n";
  // <lang><zh-CN>TypeScript consumer 显式导入 types/global，证明 tarball 的 export resolver 而非仓内 paths 映射提供 declaration。</zh-CN><en>The TypeScript consumer explicitly imports types/global, proving the tarball export resolver rather than an in-repository paths mapping supplies declarations.</en></lang>
  const typeConsumerSource = "import UView, { UCheckbox, UPicker, type UCheckboxProps } from '@hia-uview/ui';\nimport '@hia-uview/ui/global';\nimport type { GlobalComponents, Plugin } from 'vue';\nconst props: UCheckboxProps = { value: 'trial', modelValue: false };\nconst plugin: Plugin = UView;\nconst globalCheckbox: GlobalComponents['UCheckbox'] = UCheckbox;\nvoid [props, plugin, globalCheckbox, UPicker];\n";
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
    'easycom/mp-weixin.json'
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

  // <lang><zh-CN>只检查 compiler 输出中的 app/page 和代表性 Easycom component 构件存在，不将静态产物误称为 DevTools、设备或跨端运行证据。</zh-CN><en>Checks only app/page and representative Easycom-component artifacts in compiler output, without presenting static artifacts as DevTools, device, or cross-platform runtime evidence.</en></lang>
  const compilerOutputDirectory = join(consumerDirectory, 'dist', 'build', 'mp-weixin');
  const compilerOutputFiles = await listOutputFiles(compilerOutputDirectory);
  assert.ok(compilerOutputFiles.includes('app.json'), `mp-weixin compiler must emit app.json. Observed temporary output: ${compilerOutputFiles.join(', ')}`);
  assert.ok(compilerOutputFiles.some((filePath) => filePath.endsWith(join('pages', 'index', 'index.wxml'))), 'mp-weixin compiler must emit the trial page WXML.');
  assert.ok(compilerOutputFiles.some((filePath) => filePath.endsWith(join('u-checkbox', 'u-checkbox.wxml'))), 'mp-weixin compiler must emit UCheckbox through static Easycom.');
  assert.ok(compilerOutputFiles.some((filePath) => filePath.endsWith(join('u-tabbar', 'u-tabbar.wxml'))), 'mp-weixin compiler must emit UTabbar through static Easycom.');

  console.log('Private UI package tarball trial passed (offline install, typecheck, static mp-weixin Easycom compile, temporary cleanup pending).');
} finally {
  // <lang><zh-CN>仅删除由本次 mkdtemp 创建且仍严格位于系统临时目录下的根；任何其他路径都不接受 cleanup。</zh-CN><en>Deletes only the root created by this run's mkdtemp and still strictly under the system temporary directory; no other path is accepted for cleanup.</en></lang>
  if (temporaryTrialRoot && isTemporaryDescendant(tmpdir(), temporaryTrialRoot)) {
    await rm(temporaryTrialRoot, { force: true, recursive: true });
  }
}
