import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

/**
 * @module verify-p18-documentation-contract.test
 * @lang zh-CN 验证公开组件、示例、Tool 与人工迁移说明保持可发现且不夸大预发布兼容性或验证证据；测试只读取仓内 Markdown，不执行示例或应用代码。
 * @lang en Verifies that public component, example, Tool, and manual-migration guidance remains discoverable without overstating pre-release compatibility or validation evidence; the test reads repository Markdown only and executes neither examples nor application code.
 */

/**
 * @lang zh-CN 在测试根目录下读取一份公开文档；相对路径来自本测试固定清单，不接受调用方输入或目录发现。
 * @lang en Reads one public document under test root; the relative path comes from this test's fixed list and accepts neither caller input nor directory discovery.
 */
async function readPublicDocument(relativePath) {
  // <lang><zh-CN>将固定相对文档路径解析到当前仓库根，测试不会接触 WorkZone、用户主目录或网络资源。</zh-CN><en>Resolve the fixed relative document path under current repository root; the test touches no WorkZone, user home, or network resource.</en></lang>
  const documentPath = resolve(process.cwd(), relativePath);
  // <lang><zh-CN>以 UTF-8 读取完整 Markdown，用于链接和边界文案断言；文档不会被测试写回或格式化。</zh-CN><en>Read complete Markdown as UTF-8 for link and boundary-language assertions; the test neither writes back nor formats the document.</en></lang>
  return readFile(documentPath, 'utf8');
}

/**
 * @lang zh-CN 验证 README、runtime consumption 与 component index 保持关键组件入口和当前只读 Tool 命令面可发现；完整 107 项集合由独立 component manifest 契约锁定。
 * @lang en Verifies that README, runtime consumption, and the component index keep key component entry points and the current read-only Tool command surface discoverable; the complete 107-item set is locked by the separate component-manifest contract.
 */
test('keeps current components and Tool commands discoverable from public entry points', async () => {
  // <lang><zh-CN>固定文档读取集合覆盖根入口、UI workspace 入口、runtime import 示例和组件索引；不需要站点构建器或链接爬虫。</zh-CN><en>The fixed document-read set covers root entry, UI-workspace entry, runtime-import example, and component index; it needs neither a site builder nor link crawler.</en></lang>
  const [rootReadme, uiReadme, runtimeConsumption, componentIndex] = await Promise.all([
    readPublicDocument('README.md'),
    readPublicDocument('HIA-uView-UI/README.md'),
    readPublicDocument('docs/runtime-consumption.md'),
    readPublicDocument('docs/components.md')
  ]);
  // <lang><zh-CN>四个选择组件跨越单项/分组与单选/多选，是容易在概要 README 中遗漏的关键公开导航项。</zh-CN><en>The four choice components span single/group and radio/checkbox surfaces and are key public navigation entries easily omitted from summary READMEs.</en></lang>
  const choiceComponents = ['URadio', 'URadioGroup', 'UCheckbox', 'UCheckboxGroup'];
  // <lang><zh-CN>根 README、UI README 和 index 均应包含每个选择组件名称，以防只更新一处导航造成使用者迷失。</zh-CN><en>Root README, UI README, and index must each include every choice-component name so updating one navigation entry alone cannot mislead consumers.</en></lang>
  for (const componentName of choiceComponents) {
    assert.match(rootReadme, new RegExp(componentName));
    assert.match(uiReadme, new RegExp(componentName));
    assert.match(componentIndex, new RegExp(componentName));
  }

  // <lang><zh-CN>Tool 命令面必须同时揭示 contract/adoption/inspect，而不是退回到早期只有 doctor/check 的描述。</zh-CN><en>The Tool surface must disclose contract, adoption, and inspect together rather than reverting to the early doctor-and-check-only description.</en></lang>
  assert.match(rootReadme, /tool:inspect:components/);
  assert.match(rootReadme, /tool:inspect:compatibility/);
  assert.match(rootReadme, /check adoption/);
  // <lang><zh-CN>runtime 示例必须显示选择组件的显式命名 import，且不暗示自动导入或全局注册。</zh-CN><en>The runtime example must show explicit named imports for choice components and imply neither auto import nor global registration.</en></lang>
  assert.match(runtimeConsumption, /URadio/);
  assert.match(runtimeConsumption, /UCheckboxGroup/);
  assert.match(runtimeConsumption, /explicit plugin/i);
});

/**
 * @lang zh-CN 验证示例和迁移文档明确保留人工迁移、应用所有权及有限兼容证据边界，不引入自动改写或业务框架承诺。
 * @lang en Verifies that example and migration documents explicitly retain manual migration, application ownership, and limited compatibility-evidence boundaries without introducing automatic rewriting or business-framework promises.
 */
test('keeps examples and migration guidance manual, UI-only, and evidence-bounded', async () => {
  // <lang><zh-CN>示例索引与迁移文档分别承载验证范围和上游迁移范围，因此在同一测试中交叉检查关键否定承诺。</zh-CN><en>The example index and migration guide carry verification scope and upstream-migration scope respectively, so this test cross-checks their key negative commitments together.</en></lang>
  const [examples, migration] = await Promise.all([
    readPublicDocument('docs/examples.md'),
    readPublicDocument('docs/migration-from-uview.md')
  ]);

  // <lang><zh-CN>示例必须表明 fixture 不等于 business starter 或发布就绪性，并区分可复跑的 compiler/jsdom 命令与单独记录的受限 DevTools 观察。</zh-CN><en>The example must state that a fixture is not a business starter or release readiness and distinguish repeatable compiler or jsdom commands from the separately recorded constrained DevTools observation.</en></lang>
  assert.match(examples, /not an application starter, business module/i);
  assert.match(examples, /Neither command starts a development server or repeats the separate limited local DevTools fixture observation/i);
  assert.match(examples, /Neither command proves physical devices, screen readers/i);
  assert.match(examples, /tool:inspect:compatibility/);
  // <lang><zh-CN>迁移必须是逐组件人工动作，并明确不存在 codemod、源码扫描器与 Tool 写入模式。</zh-CN><en>Migration must be a component-by-component manual action and explicitly state that no codemod, source scanner, or Tool write mode exists.</en></lang>
  assert.match(migration, /\*\*not\*\* a fork with a complete upstream API surface/i);
  assert.match(migration, /Replace one documented component at a time/i);
  assert.match(migration, /There is no codemod, source scanner, automatic import rewriter, or Tool `--write` mode/i);
  // <lang><zh-CN>业务能力必须仍然指向独立 Biz 仓库，防止 UI 迁移材料悄然承诺 API、身份或领域工具。</zh-CN><en>Business capability must still point to the separate Biz repository, preventing UI migration material from silently promising API, identity, or domain tooling.</en></lang>
  assert.match(migration, /HIA-uView-Biz helpers.*separate HIA-uView-Biz repository/i);
});
