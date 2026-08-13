# HIA-uView-Tool contract / HIA-uView-Tool 工具契约

> Status / 状态：Private read-only `doctor`、`check contract`、`check adoption`、`inspect components`、`inspect compatibility`、`inspect api-compatibility` 与 `inspect migration-actions` commands are implemented. `scaffold component` remains reserved, and `@hia-uview/tool` has no published package export.

> 私有只读 `doctor`、`check contract`、`check adoption`、`inspect components`、`inspect compatibility`、`inspect api-compatibility` 与 `inspect migration-actions` 命令已经实现。`scaffold component` 仍为预留命令，且 `@hia-uview/tool` 尚未作为 npm 包导出。

HIA-uView-Tool is a development-time companion for checking and inspecting HIA-uView-UI metadata. It is never an application, UI-component, or business-framework runtime dependency. It is not a HIA-uView-Biz helper: business modules, API/adapter/Directus/identity helpers, pages, domain configuration, and related CLI work belong in the separate HIA-uView-Biz repository.

HIA-uView-Tool 是用于检查和查看 HIA-uView-UI 元数据的开发期辅助工具。它绝不是应用、UI 组件或业务框架的运行时依赖。它不是 HIA-uView-Biz 辅助工具：业务模块、API/adapter/Directus/身份辅助工具、页面、领域配置及相关 CLI 工作均属于独立的 HIA-uView-Biz 仓库。

## Implemented command surface / 已实现命令面

The executable name is `hia-uview-tool`. Every implemented command consumes only the local JSON configuration and its explicitly declared repository-relative JSON manifests. It does not read application source, component implementation, Markdown contract text, or test output. `check` is retained as a compatibility alias of `check contract`.

可执行名称为 `hia-uview-tool`。每个已实现命令仅消费本地 JSON 配置及其显式声明的仓库内相对 JSON manifest；它不读取应用源码、组件实现、Markdown 契约正文或测试输出。`check` 保留为 `check contract` 的兼容别名。

| Command / 命令 | Purpose / 用途 | Mutation / 修改行为 |
| --- | --- | --- |
| `doctor` | Reports Node 22+ compatibility and declared configuration problems. / 报告 Node 22+ 兼容性和已声明配置问题。 | Read-only. / 只读。 |
| `check` / `check contract` | Evaluates component-manifest version/profile/style entry/component paths/locales, duplicate names, and stable component order. / 检查 component manifest 的版本、profile、样式入口、组件路径/locale、重复名称和稳定顺序。 | Read-only. / 只读。 |
| `check adoption` | Checks that a bounded application adoption manifest agrees with a configuration-declared UI component manifest. / 检查受边界约束的应用 adoption manifest 是否与配置中声明的 UI component manifest 一致。 | Read-only. / 只读。 |
| `inspect components` | Produces a text or JSON report of declared component metadata and diagnostics. / 生成已声明组件元数据和诊断的 text/JSON 报告。 | Read-only. / 只读。 |
| `inspect compatibility` | Reports declared verified and unverified compatibility evidence without upgrading it to device or release evidence. / 报告声明的已验证与未验证兼容性 evidence，不将其升级为设备或发布证据。 | Read-only. / 只读。 |
| `inspect api-compatibility` | Reports the versioned component API/migration inventory and derives compatible/mapped/unsupported/unresolved, P0 semantic-evidence, and separate service counts. / 报告版本化组件 API/迁移盘点，并现场派生 compatible/mapped/unsupported/unresolved、P0 语义证据及独立 service 计数。 | Read-only. / 只读。 |
| `inspect migration-actions` | Reports explicitly reviewed, scope-complete caller guidance cross-checked against a declared API matrix. / 报告经显式审阅、对声明 scope 完整且与 API matrix 交叉核对的调用方指引。 | Read-only; never applies a migration. / 只读；绝不应用迁移。 |
| `scaffold component` | Reserved for a future component skeleton generator. / 为未来组件骨架生成器预留。 | Must require explicit `--write`; its default is dry-run. / 必须要求显式 `--write`；默认 dry-run。 |

No command may execute project scripts, template expressions, package-manager commands, Git commands, network requests, subprocesses, builds, or DevTools. A future write command must declare every target relative to the selected project root, refuse unsafe or existing targets by default, and show a dry-run plan before writing.

任何命令都不得执行项目脚本、模板表达式、包管理器命令、Git 命令、网络请求、子进程、构建或 DevTools。未来的写入命令必须将所有目标声明为相对于所选项目根目录的路径，默认拒绝不安全路径或已有目标，并在写入前展示 dry-run 计划。

## Declarative configuration / 声明式配置

The configuration file is `hia-uview.config.json`. It is JSON validated by a versioned local schema; it is not JavaScript, TypeScript, or an executable hook. Version 1 accepts `projectRoot: "."` only, plus the `mp-weixin` profile, `zh-Hans`/`en` UI locale, text/JSON report format, and relative component/adoption/platform-compatibility/API-compatibility manifest paths.

配置文件为 `hia-uview.config.json`。它由带版本的本地 schema 校验，是 JSON 而非 JavaScript、TypeScript 或可执行 hook。版本 1 仅接受 `projectRoot: "."`，以及 `mp-weixin` 配置、`zh-Hans`/`en` UI locale、text/JSON 报告格式和相对 component/adoption/平台兼容/API 兼容 manifest 路径。

```json
{
  "version": 1,
  "projectRoot": ".",
  "profile": "mp-weixin",
  "locale": "zh-Hans",
  "report": { "format": "text" },
  "componentManifests": ["HIA-uView-UI/hia-uview.components.json"],
  "adoptionManifests": [],
  "compatibilityManifests": ["HIA-uView-UI/hia-uview.compatibility.json"],
  "apiCompatibilityManifests": ["HIA-uView-UI/hia-uview.api-compatibility.json"],
  "migrationActionManifests": ["HIA-uView-UI/hia-uview.migration-actions.json"]
}
```

`componentManifests` is required. `adoptionManifests`, `compatibilityManifests`, and `apiCompatibilityManifests` are optional arrays, but their corresponding command reports a failing diagnostic when no manifest is declared. The contract rejects unknown executable fields, remote URLs, package names to install, shell snippets, hooks, credentials, and absolute or escaping paths. Documentation locales (`zh-CN`, `en`) remain a source-documentation concern; `locale` selects the UI/runtime message locale (`zh-Hans` or `en`).

`componentManifests` 是必填项。`adoptionManifests`、`compatibilityManifests` 与 `apiCompatibilityManifests` 是可选数组，但对应命令在未声明 manifest 时会报告失败诊断。契约拒绝未知的可执行字段、远程 URL、待安装包名、shell 片段、hook、凭据以及绝对路径或越界路径。Documentation Sys 的文档语言（`zh-CN`、`en`）仍属于源码文档关注点；`locale` 选择 UI/运行时消息语言（`zh-Hans` 或 `en`）。

## UI metadata manifests / UI 元数据 manifest

The component manifest is a UI-package declaration, not an application scan. In version 1, `styleEntry` and component `source` are relative to the directory containing the component manifest, while component `contract` is relative to the selected Tool project root. The Tool checks their relative-path syntax only and never reads their contents. This explicit split preserves the current repository data contract; a future schema version may unify the bases but must not reinterpret version 1 silently. Component records require a unique, code-point-sorted `name` and a `locales` array containing only `zh-Hans` and/or `en`.

component manifest 是 UI 包声明，而不是应用扫描。在版本 1 中，`styleEntry` 与组件 `source` 相对于 component manifest 所在目录，组件 `contract` 则相对于选定的 Tool project root。Tool 仅检查其相对路径语法，绝不读取其内容。这一显式区分保留当前仓库数据契约；未来 schema version 可以统一基准，但不得静默重新解释版本 1。component record 必须具有唯一且按代码点排序的 `name`，并使用只包含 `zh-Hans` 和/或 `en` 的 `locales` 数组。

```json
{
  "version": 1,
  "profile": "mp-weixin",
  "styleEntry": "src/style.css",
  "components": [
    {
      "name": "u-button",
      "source": "src/components/u-button/u-button.vue",
      "contract": "docs/button.md",
      "locales": ["zh-Hans", "en"]
    }
  ]
}
```

The adoption manifest is an application-owned declarative declaration. It has exactly six fields: `version`, `profile`, `locale`, `componentManifest`, `styleEntries`, and `components`. `componentManifest` must exactly match a path in the Tool configuration's `componentManifests`; `styleEntries` are relative to the selected project root and must include the selected component manifest's resolved style entry. `components` are explicit component names and must be unique, code-point-sorted members of that UI manifest.

adoption manifest 是应用拥有的声明式声明。它只能拥有六个字段：`version`、`profile`、`locale`、`componentManifest`、`styleEntries` 与 `components`。`componentManifest` 必须精确匹配 Tool 配置 `componentManifests` 中的路径；`styleEntries` 相对于所选项目根目录，且必须包含所选 component manifest 解析后的样式入口。`components` 是显式组件名称，必须唯一、按代码点排序，并属于该 UI manifest。

```json
{
  "version": 1,
  "profile": "mp-weixin",
  "locale": "zh-Hans",
  "componentManifest": "vendor/hia-uview/hia-uview.components.json",
  "styleEntries": ["vendor/hia-uview/src/style.css"],
  "components": ["u-button", "u-field"]
}
```

Route names, pages, domain modules, API endpoints, credentials, identity providers, hooks, template expressions, script paths, data models, and business configuration are invalid adoption fields. The separate HIA-uView-Biz repository owns any business-oriented manifest or helper.

路由名称、页面、领域模块、API endpoint、凭据、身份提供方、hooks、模板表达式、脚本路径、数据模型和业务配置均是无效 adoption 字段。任何业务导向 manifest 或辅助工具均由独立的 HIA-uView-Biz 仓库拥有。

The compatibility evidence manifest records bounded evidence rather than platform claims. `verified` records only `compiler-fixture`, `devtools-fixture`, or `jsdom-runtime` evidence with a safe relative target and its limited scope. `devtools-fixture` is limited to a manually observed local fixture; it is not device, accessibility, review, or release evidence. `unverified` records the remaining explicitly named environments; a report never infers validation for a missing environment.

compatibility evidence manifest 记录受限证据，而非平台声明。`verified` 仅记录带安全相对 target 及有限 scope 的 `compiler-fixture`、`devtools-fixture` 或 `jsdom-runtime` evidence。`devtools-fixture` 只表示人工观察的本机 fixture，不是设备、无障碍、审核或发布证据。`unverified` 记录其余明确命名的环境；报告绝不为缺失环境推断验证。

```json
{
  "version": 1,
  "profile": "mp-weixin",
  "verified": [
    { "kind": "compiler-fixture", "target": "fixtures/mp-weixin", "scope": "compiler-only" },
    { "kind": "devtools-fixture", "target": "fixtures/mp-weixin", "scope": "local-fixture-only" },
    { "kind": "jsdom-runtime", "target": "tests/runtime", "scope": "jsdom-only" }
  ],
  "unverified": ["app", "device", "h5", "screen-reader"]
}
```

## API migration inventory / API 迁移盘点

The API compatibility manifest is a comparison and migration inventory, not platform evidence. Version 2 binds an immutable upstream reference and a digest-locked semantic-review input to one declared local component manifest, contains exactly the audited shared component rows, and records each prop/event/slot/imperative capability as `compatible`, `mapped`, or `unsupported`. Every P0 item must carry a complete kind-specific semantic envelope and explicit evidence level. Public composable services use their own inventory and do not enter the `api-items-only` component migration summary; easycom, types, aliases, and platform also stay separate. The validator continues to accept the exact version 1 envelope without semantics or services. `complete` with no items means “audited and none”; an unresolved inventory must directly reference its owning component-and-surface issue. Defaults are limited to JSON literals, array/object factory classifications with contents intentionally omitted, opaque digests, or directly issue-linked unresolved facts and are never evaluated.

API compatibility manifest 是比较与迁移盘点，而不是平台证据。版本 2 把 immutable 上游 reference 和 digest-locked semantic-review 输入绑定到一份已声明的本地 component manifest，只包含已审计的同名组件行，并将每个 prop/event/slot/imperative 能力记录为 `compatible`、`mapped` 或 `unsupported`。每个 P0 item 必须携带完整的 kind-specific semantics envelope 和明确的 evidence level。公开 composable service 使用独立 inventory，不进入 `api-items-only` 组件迁移摘要；easycom、types、aliases 与 platform 也保持独立。validator 继续接受不含 semantics/services 的精确版本 1 envelope。`complete` 加空 items 表示“已审计且无项目”；未解决 inventory 必须直接引用同时拥有当前组件与表面的 issue。default 仅允许 JSON literal、有意省略内容的 array/object factory 分类、opaque digest 或直接关联 issue 的 unresolved 事实，绝不会被求值。

The structural props scope records bounded runtime option facts, while structural event, slot, and imperative scopes remain `names-only`. The P0 semantics overlay separately records reviewed payload/binding/signature and behavioral facts. A mapped item may be runtime-tested with no remaining evidence yet stay mapped because callers must adapt a semantic difference; source-reviewed mapped items retain explicit `runtime-parity` work. The separate service inventory records upstream `useModal` and `useToast` as mapped to HIA's delivered explicit scope/host controllers; they remain mapped because global/page event-bus, callback, and navigation semantics require adaptation. Easycom reporting also separates the bounded repository `mp-weixin` fixture mapping from the package-stable/public contract; the former may exist while the latter remains unsupported.

结构性 props scope 记录受限 runtime option 事实，而结构性 event、slot 与 imperative scope 仍只到 `names-only`。P0 semantics overlay 会另行记录已复核的 payload/binding/signature 与行为事实。mapped item 可以已经 runtime-tested 且没有剩余证据，但因调用方仍需适配语义差异而保持 mapped；source-reviewed mapped item 则保留明确的 `runtime-parity` 待办。独立 service inventory 把上游 `useModal` 与 `useToast` 映射到 HIA 已交付的显式 scope/host controller；由于 global/page event bus、callback 与导航语义仍需适配，两项保持 mapped。Easycom 报告也会区分受限仓内 `mp-weixin` fixture 映射与 package-stable/public 契约；前者可以存在，而后者仍处于 unsupported。

`inspect api-compatibility` derives totals from validated records and does not trust manifest-provided counts. The complete 1,740-item structural inventory currently reports 47 `compatible`, 339 `mapped`, and 1,354 `unsupported`. Its 127/127 reviewed P0 subset is 43 `compatible`, 84 `mapped`, and 0 `unsupported`; all 127 items are runtime-tested, with no source-reviewed-only item remaining. It separately reports two mapped service items across two components. An exit code of `0` means the inventory structure, ordering, semantic shapes/evidence, cross-links, and issue references are valid. Current `unsupported` or issue-backed `unresolved` results remain visible facts and do not by themselves fail the Tool or imply that an implementation change has already been made. The complete schema and immutable comparison boundary are documented in [API compatibility inventory](api-compatibility.md).

`inspect api-compatibility` 会从已校验记录现场派生统计，不信任 manifest 自报 count。完整 1,740 项结构盘点当前报告 47 个 `compatible`、339 个 `mapped` 与 1,354 个 `unsupported`。其中 127/127 项已复核 P0 子集为 43 个 `compatible`、84 个 `mapped` 与 0 个 `unsupported`；127 项已全部具备 runtime-tested 证据，不再遗留仅 source-reviewed 的条目。另有两个组件上的两项 mapped service 独立报告。退出码 `0` 表示盘点结构、排序、语义形状/证据、关联和 issue 引用有效。当前 `unsupported` 或有 issue 依据的 `unresolved` 仍是可见事实，它们本身不会让 Tool 失败，也不表示实现已经改变。完整 schema 与 immutable 比较边界见 [API 兼容盘点](api-compatibility.md)。

## Migration action packets / 迁移动作包

`inspect migration-actions` reads one or more configuration-declared action packets and their explicitly declared API matrix. Each action must point to an existing matrix item with the same priority and disposition; all items in the packet's component/priority scope must appear exactly once. The report selects its existing bilingual guidance and relative documentation links, but never reads those documentation bodies or an application.

`inspect migration-actions` 读取一个或多个 configuration 明示的动作包及其显式声明的 API matrix。每个 action 必须指向已有 matrix item，且 priority 与 disposition 必须一致；动作包 component/priority scope 内的所有 item 必须恰好出现一次。报告只选择既有的双语 guidance 和相对 documentation link，但绝不读取这些 documentation body 或 application。

The action report is a constrained planning aid, not a source scanner, automatic rewrite, migration-completion judgment, or support promise. Its current packet scope and its finite operations are documented in [Migration action packets](migration-actions.md).

动作报告是受约束的规划辅助资料，不是 source scanner、自动重写工具、迁移完成判断或支持承诺。当前动作包的 scope 及有限 operation 见 [迁移动作包](migration-actions.md)。

## Results and exit codes / 结果与退出码

Text output is intended for people and JSON output for automation. JSON contains stable diagnostic codes, declared relative metadata paths, and (for `inspect`) only the requested bounded metadata. It must not include source text, generated Documentation Sys output, credentials, private workspace details, unrequested absolute paths, or inferred environment support.

文本输出面向人工阅读，JSON 输出面向自动化。JSON 包含稳定 diagnostic code、已声明的相对元数据路径，以及（对于 `inspect`）仅限所请求的受边界约束元数据；不得包含源码文本、Documentation Sys 生成物、凭据、私有工作区详情、未被请求的绝对路径或推断的平台支持。

| Exit code / 退出码 | Meaning / 含义 |
| --- | --- |
| `0` | The requested read-only operation completed with no failing diagnostic. / 请求的只读操作完成，且没有失败诊断。 |
| `1` | The project or declared contract has one or more failing diagnostics. / 项目或已声明契约有一个或多个失败诊断。 |
| `2` | Invocation, configuration, path, or write-permission input is invalid. / 调用、配置、路径或写入许可输入无效。 |
| `3` | The tool cannot safely complete because its own expected contract is unavailable or inconsistent. / 工具自身所需契约不可用或不一致，无法安全完成。 |

## Isolation and privacy / 隔离与隐私

- The Tool package may consume stable, declarative schemas or manifests. It must not import UI implementation files, application source, HIA-uView-Biz internals, or application runtime dependencies. / Tool 包可消费稳定的声明式 schema 或 manifest；不得 import UI 实现文件、应用源码、HIA-uView-Biz 内部或应用运行时依赖。
- UI components must not import the Tool package. Installing or running the Tool must not change application production dependencies. / UI 组件不得 import Tool 包。安装或运行 Tool 不得改变应用生产依赖。
- The Tool has no telemetry, automatic upload, package installation, network discovery, build, or process-execution behavior in this contract. / 本契约中 Tool 不具备遥测、自动上传、安装包、网络发现、构建或进程执行行为。
- Generated code, if later approved, must begin with the applicable bilingual Documentation Sys comments and must pass the repository documentation, theme, and source-intake gates. / 若以后批准生成代码，必须从第一行使用对应的 Documentation Sys 中英双语注释，并通过仓库文档、主题和来源 intake 门禁。

## Validation requirements / 验证要求

Before a Tool command is released, fixtures must demonstrate valid and invalid JSON configuration, a missing project root, an escaping path, an unsupported profile, deterministic text/JSON diagnostics, no network or subprocess execution, and no UI/runtime dependency edge. Positive and negative component/adoption/platform-compatibility/API-compatibility manifests must cover stable ordering, path safety, exact cross-links, status/default enums, mapped targets, unsupported reasons, unresolved issue references, P0 semantic shape/evidence consistency, service identity, live review counts, version 1 compatibility, and output privacy. Tests must also prove that forbidden business adoption fields fail. A future scaffold fixture must additionally prove default dry-run, explicit write permission, target allowlisting, and refusal to overwrite.

Tool 命令发布前，fixture 必须证明有效与无效 JSON 配置、缺失项目根目录、越界路径、不受支持配置、确定性的文本/JSON 诊断、没有网络或子进程执行，以及不存在 UI/运行时依赖边。component/adoption/平台兼容/API 兼容 manifest 的正反 fixture 必须覆盖稳定排序、路径安全、精确关联、status/default 枚举、mapped target、unsupported reason、unresolved issue 引用、P0 semantic shape/evidence 一致性、service identity、现场 review count、版本 1 兼容性和输出隐私；测试还必须明确证明被禁止的业务 adoption 字段失败。未来脚手架 fixture 还必须证明默认 dry-run、显式写入许可、目标白名单和拒绝覆盖。
