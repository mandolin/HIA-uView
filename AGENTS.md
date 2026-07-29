# HIA-uView — Agent 指引

- 本仓是独立公开 npm monorepo；只管理根目录、`HIA-uView-UI/` 与 `HIA-uView-Tool/`。不要依赖外层工作区的 `node_modules` 或 `main-repo/` 的文件。
- Windows Shell 一律使用 PowerShell 7：`C:\Program Files\PowerShell\7\pwsh.exe`。
- 修改前检查 `git status`，并阅读 README、相关包 README、公开文档以及私有 WorkZone 中适用的规划/ADR/任务状态。
- 公开 README、`docs/`、包文档和示例不得包含内部阶段代号、AI 协作、私有路径、研究过程或会话记录。
- 从第一行代码起接入 HIA Documentation Sys，并严格执行《HIA项目初始化指南》第 7 节的 ROP（面向阅读的编程）要求：每个 module/package 边界、class/type、function/method、public/exported member、重要 constant 及有独立职责、约束或副作用的内部节点，都必须有紧邻声明的完整双语文档化注释。JavaScript 使用同一 JSDoc 块中的 canonical `@lang zh-CN`、`@lang en` 及字段级 `<lang>`；TypeScript 在字段级 locale extractor 可用前使用同一 TSDoc-compatible 块中的“中文：”和“English:”段落；CSS/SCSS 与 HTML/Vue template 使用各自合法的 CSSDoc/HTMDoc `@lang` 形式。JSON/YAML 不写非法注释，改以 schema 或 sidecar 文档说明。
- 在任何 function、method、constructor、callback 或类初始化块内，明显自明者以外的每个局部变量都必须有紧邻的中英双语普通注释；每个流程块、关键子流程、非显然赋值/转换、集合读写、分支、调用、返回、异常、缓存/资源或隐式语言行为也必须以合法 inline `<lang><zh-CN>…</zh-CN><en>…</en></lang>` 注释说明目的、状态变化、约束或风险。禁止逐 token 翻译、空泛“处理数据/执行逻辑”注释或只写一侧语言。
- 每次源码改动执行 touch-improve：补齐本次触及模块的职责、公共 API 与关键不变量；未触及的存量注释缺口进入 WorkZone coverage inventory 和已排期治理周期，不得降低新增或本次修改代码的硬门槛。参数、返回、默认值、错误、隐私、安全、版本或兼容性变化时，注释和测试必须同一变更更新。
- 运行 `npm run docs:check` 验证双语 JSDoc、真实 HIA integration 输出及隐私边界。生成物仅位于 Git 忽略的 `temp/documentation/`；不得启用源码 preview、source fragment、`sourcesContent`、绝对路径或私有 WorkZone 信息，除非公开来源策略和新 ADR 已批准。
- 引入或吸收第三方代码、依赖、字体、图标或资产前，记录来源、版本、不可变提交、许可证、替代方案、发布边界与验证证据。上游源码仅可按 `docs/upstream-source-intake.md` 的逐文件审计规则复用；每个实际采用项必须同步登记 `THIRD_PARTY_NOTICES.md`，不得复制未审定的注释、资产或表达性内部结构。
- 每次实质文档更新完成检查后，自动在本仓创建聚焦提交；累计约 3 至 5 个提交或完成一个检查点后，核对远程和范围再推送。
