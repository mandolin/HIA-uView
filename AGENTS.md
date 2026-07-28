# HIA-uView — Agent 指引

- 本仓是独立公开 npm monorepo；只管理根目录、`HIA-uView-UI/` 与 `HIA-uView-Tool/`。不要依赖外层工作区的 `node_modules` 或 `main-repo/` 的文件。
- Windows Shell 一律使用 PowerShell 7：`C:\Program Files\PowerShell\7\pwsh.exe`。
- 修改前检查 `git status`，并阅读 README、相关包 README、公开文档以及私有 WorkZone 中适用的规划/ADR/任务状态。
- 公开 README、`docs/`、包文档和示例不得包含内部阶段代号、AI 协作、私有路径、研究过程或会话记录。
- 从第一行代码起接入 HIA Documentation Sys：JavaScript 使用同一 JSDoc 块中的 canonical `@lang zh-CN`、`@lang en` 及字段级 `<lang>`；TypeScript 在字段级 locale extractor 可用前使用同一 TSDoc-compatible 块中的“中文：”和“English:”段落；CSS/SCSS 与 HTML/Vue template 使用各自合法的 CSSDoc/HTMDoc `@lang` 形式。新增公共 API、类型、契约、非显然逻辑、兼容性分支或 I/O 以及关键流程块必须完整双语说明。JSON/YAML 不写非法注释，改以 schema 或 sidecar 文档说明。
- 运行 `npm run docs:check` 验证双语 JSDoc、真实 HIA integration 输出及隐私边界。生成物仅位于 Git 忽略的 `temp/documentation/`；不得启用源码 preview、source fragment、`sourcesContent`、绝对路径或私有 WorkZone 信息，除非公开来源策略和新 ADR 已批准。
- 引入或吸收第三方代码、依赖、字体、图标或资产前，记录来源、版本、不可变提交、许可证、替代方案、发布边界与验证证据。上游源码仅可按 `docs/upstream-source-intake.md` 的逐文件审计规则复用；每个实际采用项必须同步登记 `THIRD_PARTY_NOTICES.md`，不得复制未审定的注释、资产或表达性内部结构。
- 每次实质文档更新完成检查后，自动在本仓创建聚焦提交；累计约 3 至 5 个提交或完成一个检查点后，核对远程和范围再推送。
