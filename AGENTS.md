# HIA-uView — Agent 指引

- 本仓是独立公开 npm monorepo；只管理根目录、`HIA-uView-UI/` 与 `HIA-uView-Tool/`。不要依赖外层工作区的 `node_modules` 或 `main-repo/` 的文件。
- Windows Shell 一律使用 PowerShell 7：`C:\Program Files\PowerShell\7\pwsh.exe`。
- 修改前检查 `git status`，并阅读 README、相关包 README、公开文档以及私有 WorkZone 中适用的规划/ADR/任务状态。
- 公开 README、`docs/`、包文档和示例不得包含内部阶段代号、AI 协作、私有路径、研究过程或会话记录。
- 新增公共 API、类型、契约、非显然逻辑、兼容性分支或 I/O 时，使用同一 JSDoc/TSDoc 块写完整的“中文：”和“English:”说明；接入 HIA 文档链后再使用其 canonical `@lang` contract。
- 引入或吸收第三方代码、依赖、字体、图标或资产前，记录来源、版本、不可变提交、许可证、替代方案、发布边界与验证证据。上游源码仅可按 `docs/upstream-source-intake.md` 的逐文件审计规则复用；每个实际采用项必须同步登记 `THIRD_PARTY_NOTICES.md`，不得复制未审定的注释、资产或表达性内部结构。
- 每次实质文档更新完成检查后，自动在本仓创建聚焦提交；累计约 3 至 5 个提交或完成一个检查点后，核对远程和范围再推送。
