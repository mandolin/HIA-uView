# HIA-uView-Tool contract / HIA-uView-Tool 工具契约

> Status / 状态：Pre-release design contract only. `@hia-uview/tool` has no CLI implementation or published package export yet.

> 本文仅为预发布设计契约。`@hia-uview/tool` 尚无 CLI 实现，也尚未作为 npm 包导出。

HIA-uView-Tool is a development-time companion for checking and preparing HIA-uView projects. It is never an application, UI-component, or business-framework runtime dependency.

HIA-uView-Tool 是用于检查和准备 HIA-uView 项目的开发期辅助工具。它绝不是应用、UI 组件或业务框架的运行时依赖。

## Planned command surface / 计划中的命令面

The future executable name is `hia-uview-tool`. The following command names are reserved by this contract; they do not exist yet.

未来的可执行名称为 `hia-uview-tool`。下列命令名由本契约预留，当前尚未实现。

| Command / 命令 | Purpose / 用途 | Mutation / 修改行为 |
| --- | --- | --- |
| `doctor` | Reports supported Node/npm versions, the declared compatibility profile, and configuration problems. / 报告受支持的 Node/npm 版本、已声明兼容配置和配置问题。 | Read-only. / 只读。 |
| `check` | Evaluates declared HIA-uView contracts, component manifests, and release fixtures. / 检查已声明的 HIA-uView 契约、组件 manifest 和发布 fixture。 | Read-only. / 只读。 |
| `inspect` | Produces a bounded text or JSON report of declared metadata and diagnostics. / 生成受边界约束的声明式元数据和诊断文本/JSON 报告。 | Read-only. / 只读。 |
| `scaffold component` | Reserved for a future component skeleton generator. / 为未来组件骨架生成器预留。 | Must require explicit `--write`; its default is dry-run. / 必须要求显式 `--write`；默认 dry-run。 |

No command may execute project scripts, template expressions, package-manager commands, Git commands, or network requests. A future write command must declare every target relative to the selected project root, refuse unsafe or existing targets by default, and show a dry-run plan before writing.

任何命令都不得执行项目脚本、模板表达式、包管理器命令、Git 命令或网络请求。未来的写入命令必须将所有目标声明为相对于所选项目根目录的路径，默认拒绝不安全路径或已有目标，并在写入前展示 dry-run 计划。

## Declarative configuration / 声明式配置

The future configuration file is `hia-uview.config.json`. It is JSON validated by a versioned local schema; it is not JavaScript, TypeScript, or an executable hook. Configuration may select a project root, compatibility profile, UI locale, report format, and relative component-manifest paths.

未来配置文件为 `hia-uview.config.json`。它由带版本的本地 schema 校验，是 JSON 而非 JavaScript、TypeScript 或可执行 hook。配置可选择项目根目录、兼容性配置、UI locale、报告格式和相对组件 manifest 路径。

```json
{
  "version": 1,
  "projectRoot": ".",
  "profile": "mp-weixin",
  "locale": "zh-Hans",
  "report": { "format": "text" },
  "componentManifests": []
}
```

The first contract rejects unknown executable fields, remote URLs, package names to install, shell snippets, hooks, credentials, and absolute or escaping paths. Documentation locales (`zh-CN`, `en`) remain a source-documentation concern; `locale` selects the future UI/runtime message locale (`zh-Hans` or `en`).

首个契约拒绝未知的可执行字段、远程 URL、待安装包名、shell 片段、hook、凭据以及绝对路径或越界路径。Documentation Sys 的文档语言（`zh-CN`、`en`）仍属于源码文档关注点；`locale` 选择未来 UI/运行时消息语言（`zh-Hans` 或 `en`）。

## Results and exit codes / 结果与退出码

Text output is intended for people and JSON output for automation. JSON must contain stable diagnostic codes and relative target paths where possible; it must not include source text, generated Documentation Sys output, credentials, private workspace details, or unrequested absolute paths.

文本输出面向人工阅读，JSON 输出面向自动化。JSON 必须包含稳定的诊断代码，并尽可能使用相对目标路径；不得包含源码文本、Documentation Sys 生成物、凭据、私有工作区详情或未被请求的绝对路径。

| Exit code / 退出码 | Meaning / 含义 |
| --- | --- |
| `0` | The requested read-only operation completed with no failing diagnostic. / 请求的只读操作完成，且没有失败诊断。 |
| `1` | The project or declared contract has one or more failing diagnostics. / 项目或已声明契约有一个或多个失败诊断。 |
| `2` | Invocation, configuration, path, or write-permission input is invalid. / 调用、配置、路径或写入许可输入无效。 |
| `3` | The tool cannot safely complete because its own expected contract is unavailable or inconsistent. / 工具自身所需契约不可用或不一致，无法安全完成。 |

## Isolation and privacy / 隔离与隐私

- The Tool package may consume stable, declarative schemas or manifests. It must not import UI implementation files, application source, HIA-uView-Biz internals, or application runtime dependencies. / Tool 包可消费稳定的声明式 schema 或 manifest；不得 import UI 实现文件、应用源码、HIA-uView-Biz 内部或应用运行时依赖。
- UI components must not import the Tool package. Installing or running the Tool must not change application production dependencies. / UI 组件不得 import Tool 包。安装或运行 Tool 不得改变应用生产依赖。
- The Tool has no telemetry, automatic upload, package installation, or network-discovery behavior in this contract. / 本契约中 Tool 不具备遥测、自动上传、安装包或网络发现行为。
- Generated code, if later approved, must begin with the applicable bilingual Documentation Sys comments and must pass the repository documentation, theme, and source-intake gates. / 若以后批准生成代码，必须从第一行使用对应的 Documentation Sys 中英双语注释，并通过仓库文档、主题和来源 intake 门禁。

## Initial validation requirements / 首轮验证要求

Before a Tool command is released, fixtures must demonstrate valid and invalid JSON configuration, a missing project root, an escaping path, an unsupported profile, deterministic text/JSON diagnostics, no network or subprocess execution, and no UI/runtime dependency edge. A future scaffold fixture must additionally prove default dry-run, explicit write permission, target allowlisting, and refusal to overwrite.

Tool 命令发布前，fixture 必须证明有效与无效 JSON 配置、缺失项目根目录、越界路径、不受支持配置、确定性的文本/JSON 诊断、没有网络或子进程执行，以及不存在 UI/运行时依赖边。未来脚手架 fixture 还必须证明默认 dry-run、显式写入许可、目标白名单和拒绝覆盖。
