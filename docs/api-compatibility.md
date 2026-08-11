# API compatibility inventory / API 兼容盘点

HIA-uView maintains a versioned, read-only migration inventory for the 99 component names shared with the fixed uView-Pro comparison snapshot. Version 2 adds complete semantic-review records for all 127 P0 API items and a separate inventory for the two confirmed public composable services. The inventory is a pre-release engineering aid: it reports the bounded API facts defined below, explicit migration work, unsupported capabilities, and remaining evidence. It is not a claim that every same-named component has identical behavior or that every integration surface has already been inventoried.

HIA-uView 为与固定 uView-Pro 比较快照同名的 99 个组件维护版本化、只读迁移盘点。版本 2 为全部 127 项 P0 API 增加完整语义复核记录，并为两个已确认的公开 composable service 建立独立清单。该盘点是预发布工程辅助资料：它报告下文定义的受限 API 事实、明确迁移工作、未支持能力和剩余证据；并不宣称所有同名组件具有相同行为，也不表示所有集成表面均已完成盘点。

## Fixed comparison / 固定比较面

| Fact / 事实 | Value / 值 |
| --- | --- |
| Repository / 仓库 | `https://github.com/anyup/uView-Pro` |
| Release / 版本 | `uview-pro@0.6.15`, tag `v0.6.15` |
| Commit | `bec4b39cd3195354d65c1fc8722745d72052bd8c` |
| Component tree | `27e58b2924e42ebd761cdf5a245c61f7f8984d6f` |
| Direct component directories / 直接组件目录 | 99 |
| License / 许可证 | MIT |
| Role / 用途 | Comparison-only; not a source-reuse authorization. / 仅作比较，不构成源码复用授权。 |

The previous comparison commit is `091b5bb70312f43026c9847cca0709cafccaaaaa`, whose package version is `0.6.14`. It is not the `v0.6.14` tag. The 0.6.14 comparison and 0.6.15 release use the same component tree, so this rebaseline records package/type-delivery changes without inventing a component-source change.

前序比较 commit 为 `091b5bb70312f43026c9847cca0709cafccaaaaa`，其 package version 是 `0.6.14`，但它不是 `v0.6.14` tag。0.6.14 比较点与 0.6.15 release 使用相同 component tree，因此本次重新基线记录 package/type 交付变化，不虚构组件源码变更。

HIA-uView currently declares 107 controlled components. The matrix contains exactly the 99 shared names. The eight HIA-only names—`u-cell`, `u-list`, `u-loading-page`, `u-nav-bar`, `u-notice`, `u-scroll-list`, `u-stack`, and `u-validation-message`—remain in the component manifest but are not presented as uView-Pro counterparts.

HIA-uView 当前声明 107 个受控组件。矩阵只包含精确同名的 99 项。8 个 HIA 独有名称——`u-cell`、`u-list`、`u-loading-page`、`u-nav-bar`、`u-notice`、`u-scroll-list`、`u-stack` 与 `u-validation-message`——继续存在于组件 manifest 中，但不冒充 uView-Pro 对应项。

## Read the inventory / 查看盘点

The Tool reads only the repository-declared JSON matrix. It does not scan SFCs, open an upstream checkout, access the network, execute Git, or write files.

Tool 只读取仓库配置中显式声明的 JSON 矩阵；不会扫描 SFC、打开上游 checkout、访问网络、运行 Git 或写文件。

```powershell
mise exec -- npm run tool:inspect:api-compatibility
```

Text output provides a stable summary, including full API-item and P0 dispositions, evidence levels, and independent service counts, plus one line per component. Configure `report.format` as `json` when complete records within the declared inventory scopes are needed. A successful command means those declared scopes are structurally complete and internally consistent; it does **not** mean that every source-reviewed item has runtime parity or that unsupported counts are zero. The complete 1,740-item structural inventory currently reports 47 `compatible`, 308 `mapped`, and 1,385 `unsupported`. Within it, the 127/127 P0 summary remains 43 `compatible`, 82 `mapped`, and 2 `unsupported`: 90 are runtime-tested, 37 are source-reviewed, and 35 still explicitly require runtime-parity evidence. The two unsupported service items are reported independently and enter neither component count.

text 输出提供稳定汇总（包括完整 API item 与 P0 disposition、证据层级和独立 service 计数）及每组件一行的摘要。需要查看声明范围内的完整记录时，将 `report.format` 配置为 `json`。命令成功只表示这些声明范围结构完整、内部一致；并不表示每个 source-reviewed item 已具备 runtime parity，也不表示 unsupported 数量为零。完整 1,740 项结构盘点当前报告 47 个 `compatible`、308 个 `mapped` 与 1,385 个 `unsupported`。其中 127/127 项 P0 汇总仍为 43 个 `compatible`、82 个 `mapped` 与 2 个 `unsupported`：90 项为 runtime-tested，37 项为 source-reviewed，35 项仍明确需要 runtime-parity 证据。两项 unsupported service 会独立报告，既不进入组件 item 数，也不进入 component count。

For reviewed caller guidance over a deliberately smaller part of this matrix, use the separate read-only [migration action packet](migration-actions.md). It cross-checks declared item priority/disposition and scope coverage, but does not scan or modify a consumer project.

如需获取本矩阵中经审阅、范围刻意更小的调用方指引，请使用独立的只读[迁移动作包](migration-actions.md)。它会交叉核对声明 item 的 priority/disposition 及 scope coverage，但不会扫描或修改 consumer project。

## Declared scopes / 声明范围

The structural props inventory covers runtime option facts: type set and declaration order, required state, controlled default classification, and an opaque validator-presence digest where applicable. Structural event, slot, and imperative inventories remain explicitly `names-only`; runtime aliases remain limited to declared aliases. Version 2 layers a kind-specific semantic envelope onto every P0 item: prop ownership/control/coercion/validation/side effects/parent-child facts, event trigger/parameters/delivery/model relation, slot bindings/fallback/cardinality/context owner, or imperative signature/effects/lifecycle/scope/concurrency/failure. `complete` therefore means complete only within the recorded structural or P0 semantic scope.

结构性 props inventory 覆盖 runtime option 事实：类型集合与声明顺序、required 状态、受控 default 分类，以及适用时只保留摘要的 validator 事实。结构性 event、slot 与 imperative inventory 仍显式限定为 `names-only`；runtime aliases 仍只覆盖已声明 alias。版本 2 在每个 P0 item 上叠加 kind-specific semantics envelope：prop 的 ownership/control/coercion/validation/side effects/parent-child 事实，event 的 trigger/parameters/delivery/model relation，slot 的 bindings/fallback/cardinality/context owner，或 imperative 的 signature/effects/lifecycle/scope/concurrency/failure。因此，`complete` 只表示已记录的结构范围或 P0 语义范围已完成。

Semantic coverage is deliberately priority-bounded. Non-P0 event payloads/validators, scoped-slot bindings, imperative signatures, provide/inject or `useParent`/`useChildren` composition contracts, component-parent registration, and general global bus/listener channels remain outside this review. Lifecycle, rendering, accessibility, device, and cross-platform behavior also remain outside unless a specific `test:` evidence reference says otherwise. A mapped item remains mapped whenever callers must adapt a semantic difference, even when runtime evidence is complete. Runtime-tested mapped items use an empty `remainingEvidence`; only source-reviewed mapped items retain `remainingEvidence: ["runtime-parity"]`.

语义覆盖刻意限定在 P0。非 P0 的 event payload/validator、scoped-slot bindings、imperative signatures、provide/inject 或 `useParent`/`useChildren` 组合契约、组件父子注册和一般性全局 bus/listener channel 仍不在本次复核范围内。lifecycle、rendering、无障碍、真机与跨端行为也仍在范围外，除非具体记录具有明确的 `test:` evidence reference。只要调用方仍需适配语义差异，即使 runtime 证据已经完整，该项仍保持 mapped。runtime-tested mapped item 使用空 `remainingEvidence`；只有 source-reviewed mapped item 保留 `remainingEvidence: ["runtime-parity"]`。

## P0 semantics and services / P0 语义与服务

Each P0 semantic record is `complete` and uses exactly one evidence level. `runtime-tested` requires a repository-local `test:` reference in addition to immutable `comparison:` and `local:` references. `source-reviewed` records a completed source-level comparison but never claims runtime parity. Prop semantic value domains must exactly match the structural prop facts, preventing two contradictory descriptions of type order, default, required state, or validator presence.

每项 P0 semantics record 均为 `complete`，并且只使用一种证据层级。`runtime-tested` 除 immutable `comparison:` 与 `local:` references 外，还必须具有仓库内 `test:` reference。`source-reviewed` 表示已完成源码级比较，但绝不宣称 runtime parity。prop semantics 的 value domain 必须与结构性 prop 事实精确一致，避免 type order、default、required 或 validator presence 出现两套矛盾描述。

Public composable services are not imperative component-ref methods and do not enter the 1,740 API-item baseline. The fixed upstream exposes `useModal` and `useToast` from its package root. Their controller operations, host/scope lifecycle, effects, concurrency, and failure behavior are source-reviewed in independent service records. HIA-uView does not currently deliver corresponding services, so both records are explicit `unsupported` facts with `HIA_SERVICE_NOT_DELIVERED`; they are no longer unresolved parser issues.

公开 composable service 不是组件 ref 的 imperative method，也不进入 1,740 项 API item 基线。固定上游从 package root 导出 `useModal` 与 `useToast`；它们的 controller operations、host/scope lifecycle、effects、concurrency 与 failure 行为已在独立 service record 中完成源码复核。HIA-uView 当前尚未交付对应 service，因此两项均以 `HIA_SERVICE_NOT_DELIVERED` 明确记录为 `unsupported`，不再是未解决的 parser issue。

## Inventory dimensions / 盘点维度

Each component has explicit records for props and defaults, events, slots, imperative APIs, runtime aliases, services, easycom delivery, type delivery, platform comparison scope, and an API-item migration summary whose fixed scope is `api-items-only`. That summary covers props/events/slots/imperative items only; services, easycom, types, aliases, and platform remain separate dimensions and may still be unsupported or unassessed. The platform field is a comparison/migration declaration only: HIA records `comparisonScope: ["mp-weixin"]` with `evidenceStatus: "not-assessed"`; verified platform evidence comes exclusively from the separate compatibility manifest. Every prop/event/slot/imperative capability has its own priority and migration result; a component-level priority never silently assigns the same urgency to all of its APIs.

每个组件都显式记录 props/defaults、events、slots、imperative APIs、runtime aliases、services、easycom 交付、类型交付、平台比较范围，以及固定为 `api-items-only` 的 API item 迁移摘要。该摘要只覆盖 props/events/slots/imperative items；services、easycom、types、aliases 与 platform 仍是独立维度，可能继续处于 unsupported 或 not-assessed。platform 字段只是一项比较/迁移声明：HIA 在其中记录 `comparisonScope: ["mp-weixin"]` 与 `evidenceStatus: "not-assessed"`；已验证的平台证据只能来自独立 compatibility manifest。每个 prop/event/slot/imperative 能力均有自己的优先级和迁移结果；组件级优先级不会悄然把所有 API 归入同一紧急程度。

| Value / 值 | Meaning / 含义 |
| --- | --- |
| `compatible` | A reviewed HIA contract accepts the capability without a migration transformation. Structural name equality alone is insufficient. / 已审阅的 HIA 契约无需迁移转换即可接收该能力；仅名称相同并不足够。 |
| `mapped` | A named HIA target exists, but defaults, types, payload, lifecycle, or other semantics still require an explicit migration recipe/review. / 存在明确 HIA target，但 defaults、types、payload、lifecycle 或其他语义仍需显式迁移规则/复核。 |
| `unsupported` | The current HIA surface has no safe equivalent; the record includes a reason rather than silently dropping the capability. / 当前 HIA surface 没有安全等价项；记录会给出原因，而不是静默遗漏。 |

`complete` plus an empty item list means that the dimension was audited and contains no items. An unresolved fact uses the explicit `unresolved` inventory state and references a public issue. Missing fields, empty-string placeholders, free-form `unknown`/`pending`, or `null` as an unknown marker are invalid. The controlled `typeKinds: ["unknown"]` value is allowed only as a static type-extraction result; it is not an inventory or migration state.

`complete` 加空 item list 表示该维度已审计且确实没有项目。未解决事实使用显式 `unresolved` inventory state，并引用公开 issue。缺字段、空字符串占位、自由形式的 `unknown`/`pending`，或用 `null` 表示未知，均为非法。受控的 `typeKinds: ["unknown"]` 只允许表示静态类型抽取结果，不是 inventory 或 migration 状态。

Defaults are data, never executable expressions. The matrix distinguishes `absent`, JSON `literal`, array/object-returning factories whose contents are intentionally omitted, opaque expression digests, and issue-linked unresolved values. Neither the generator nor Tool evaluates upstream or local source expressions.

default 是数据，绝不是可执行表达式。矩阵区分 `absent`、JSON `literal`、返回 array/object 且有意省略内容的 factory、opaque expression digest 和关联 issue 的 unresolved 值。生成器与 Tool 都不会求值上游或本地源码表达式。

## Offline regeneration / 离线重新生成

The generator requires an explicit local materialization prepared from the immutable comparison commit. It also reads the fixed repository-local `HIA-uView-UI/hia-uview.api-semantic-review.json`, validates its immutable upstream and local digests, requires exactly 127 P0 item reviews plus two service reviews, and copies only validated semantic records into matrix version 2. The maintainer is responsible for checkout identity; the network-free generator validates canonical-LF package/license content, the package version, the exact 99-name component set, and a locked aggregate of the complete upstream package materialization rather than executing Git or claiming to verify `HEAD`. Text line endings are normalized only for stable content hashing; binary content remains byte-exact. It has no network or undeclared discovery outside its fixed inputs, accepts no arbitrary output path, and writes the single fixed matrix only with explicit `--write`.

生成器要求调用方显式提供从 immutable comparison commit 准备的本地 materialization。它还会读取固定的仓库内 `HIA-uView-UI/hia-uview.api-semantic-review.json`，校验其中不可变的上游与本地 digest，要求精确 127 项 P0 item review 与两项 service review，并且只把通过校验的语义记录复制到版本 2 矩阵。checkout identity 由维护者负责；无网络生成器会校验 canonical-LF package/license 内容、package version、精确 99 名称组件集合和完整上游 package materialization 的固定内容聚合，而不会运行 Git 或宣称验证 `HEAD`。文本换行只在稳定内容摘要时规范化，二进制内容保持逐字节校验。它不会在固定输入之外作未声明发现，不接受任意输出路径，并且只有显式 `--write` 才会写入唯一固定矩阵。

```powershell
mise exec -- node scripts/generate-api-compatibility-matrix.mjs --upstream-root <local-uview-pro-checkout> --check
mise exec -- node scripts/generate-api-compatibility-matrix.mjs --upstream-root <local-uview-pro-checkout> --write
```

Run `--check` after generation to prove byte-for-byte artifact reproducibility. The script validates canonical content digests, the locked package materialization aggregate, package version, exact 99-name set, local component-manifest linkage, stable ordering, and safe static extraction. It does not build or run either implementation.

生成后再次运行 `--check`，以证明生成物 byte-for-byte 可复现。脚本会校验 canonical 内容摘要、固定 package materialization 聚合、package version、精确 99 名称集合、本地 component-manifest 关联、稳定排序和安全静态抽取；不会构建或运行任一实现。

## Known upstream delivery facts / 已知上游交付事实

The comparison records upstream facts without upgrading them into HIA support claims:

比较盘点如实记录下列上游事实，但不会将其升级为 HIA 支持声明：

- The 0.6.15 package points its root type export to a missing root `index.d.ts`; the available index is under `types/index.d.ts`. / 0.6.15 package 将根类型出口指向不存在的根 `index.d.ts`；实际可见 index 位于 `types/index.d.ts`。
- Plugin exports name missing `.mjs`/`.cjs` targets while the tree contains `plugins/index.ts`. / plugin exports 声明了缺失的 `.mjs`/`.cjs` target，而 tree 中只有 `plugins/index.ts`。
- The global `uStep` declaration uses an incorrect component path. / 全局 `uStep` 声明使用了错误的组件路径。
- Ninety-nine SFCs have only 97 component-level `types.ts` files; `u-root-portal` and `u-time-line` lack them. / 99 个 SFC 只有 97 个组件级 `types.ts`；`u-root-portal` 与 `u-time-line` 缺失该文件。
- Package platform declarations and conditional source branches remain upstream declarations, not HIA device, release, or cross-platform evidence. / package 平台声明和条件源码分支仍只是上游声明，不是 HIA 的真机、发布或跨端证据。

See the separate [platform compatibility profile](compatibility.md) for compiler, local DevTools, runtime, and unverified-environment evidence. See [manual migration guidance](migration-from-uview.md) before changing an application.

compiler、本地 DevTools、runtime 和未验证环境证据请见独立的[平台兼容性说明](compatibility.md)。修改应用前请先阅读[人工迁移指引](migration-from-uview.md)。
