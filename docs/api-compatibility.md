# API compatibility inventory / API 兼容盘点

HIA-uView maintains a versioned, read-only migration inventory for the 99 component names shared with the fixed uView-Pro comparison snapshot. The inventory is a pre-release engineering aid: it reports the bounded API facts defined below, explicit migration work, unsupported capabilities, and unresolved review questions. It is not a claim that every same-named component has identical behavior or that every integration surface has already been inventoried.

HIA-uView 为与固定 uView-Pro 比较快照同名的 99 个组件维护版本化、只读迁移盘点。该盘点是预发布工程辅助资料：它报告下文定义的受限 API 事实、明确迁移工作、未支持能力和待复核问题；并不宣称所有同名组件具有相同行为，也不表示所有集成表面均已完成盘点。

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

Text output provides a stable summary and one line per component. Configure `report.format` as `json` when complete records within the declared inventory scopes are needed. A successful command means those declared scopes are structurally complete and internally consistent; it does **not** mean that unsupported or unresolved counts are zero.

text 输出提供稳定汇总和每组件一行的摘要。需要查看声明范围内的完整记录时，将 `report.format` 配置为 `json`。命令成功只表示这些声明范围结构完整、内部一致；并不表示 unsupported 或 unresolved 数量为零。

## Declared scopes / 声明范围

The props inventory covers runtime option facts: type set and declaration order, required state, controlled default classification, and an opaque validator-presence digest where applicable. Event, slot, and imperative inventories are explicitly `names-only`; runtime aliases are limited to declared aliases. `complete` therefore means complete only within the container's recorded scope.

props inventory 覆盖 runtime option 事实：类型集合与声明顺序、required 状态、受控 default 分类，以及适用时只保留摘要的 validator 事实。event、slot 与 imperative inventory 显式限定为 `names-only`；runtime aliases 只覆盖已声明 alias。因此，`complete` 只表示对应 container 记录的 scope 已完成。

This inventory does not compare event payloads or validators, scoped-slot bindings, imperative method signatures, provide/inject or `useParent`/`useChildren` composition contracts, component-parent registration, global bus/listener channels such as `uni.$emit`, or complete service behavior. It also does not compare lifecycle, rendering, accessibility, device, or cross-platform behavior. Those surfaces require later semantic and runtime review before a migration can be declared compatible.

本盘点不比较 event payload/validator、scoped-slot bindings、imperative method signatures、provide/inject 或 `useParent`/`useChildren` 组合契约、组件父子注册、`uni.$emit` 等全局 bus/listener channel，也不覆盖完整 service 行为；同时不比较 lifecycle、rendering、无障碍、真机或跨端行为。上述表面必须在后续语义与 runtime 复核后，才能声明迁移兼容。

## Inventory dimensions / 盘点维度

Each component has explicit records for props and defaults, events, slots, imperative APIs, runtime aliases, easycom delivery, type delivery, platform comparison scope, and an API-item migration summary whose fixed scope is `api-items-only`. That summary covers props/events/slots/imperative items only; easycom, types, aliases, and platform remain separate dimensions and may still be unsupported or unassessed. The platform field is a comparison/migration declaration only: HIA records `comparisonScope: ["mp-weixin"]` with `evidenceStatus: "not-assessed"`; verified platform evidence comes exclusively from the separate compatibility manifest. Every prop/event/slot/imperative capability has its own priority and migration result; a component-level priority never silently assigns the same urgency to all of its APIs.

每个组件都显式记录 props/defaults、events、slots、imperative APIs、runtime aliases、easycom 交付、类型交付、平台比较范围，以及固定为 `api-items-only` 的 API item 迁移摘要。该摘要只覆盖 props/events/slots/imperative items；easycom、types、aliases 与 platform 仍是独立维度，可能继续处于 unsupported 或 not-assessed。platform 字段只是一项比较/迁移声明：HIA 在其中记录 `comparisonScope: ["mp-weixin"]` 与 `evidenceStatus: "not-assessed"`；已验证的平台证据只能来自独立 compatibility manifest。每个 prop/event/slot/imperative 能力均有自己的优先级和迁移结果；组件级优先级不会悄然把所有 API 归入同一紧急程度。

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

The generator requires an explicit local materialization prepared from the immutable comparison commit. The maintainer is responsible for checkout identity; the network-free generator validates canonical-LF package/license content, the package version, the exact 99-name component set, and a locked aggregate of the complete upstream package materialization rather than executing Git or claiming to verify `HEAD`. Text line endings are normalized only for stable content hashing; binary content remains byte-exact. It has no network or undeclared discovery outside its fixed inputs, accepts no arbitrary output path, and writes the single fixed matrix only with explicit `--write`.

生成器要求调用方显式提供从 immutable comparison commit 准备的本地 materialization。checkout identity 由维护者负责；无网络生成器会校验 canonical-LF package/license 内容、package version、精确 99 名称组件集合和完整上游 package materialization 的固定内容聚合，而不会运行 Git 或宣称验证 `HEAD`。文本换行只在稳定内容摘要时规范化，二进制内容保持逐字节校验。它不会在固定输入之外作未声明发现，不接受任意输出路径，并且只有显式 `--write` 才会写入唯一固定矩阵。

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
