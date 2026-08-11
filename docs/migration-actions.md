# Migration action packets / 迁移动作包

`hia-uview-tool inspect migration-actions` is a read-only explanation report for every currently reviewed P0 item in the API compatibility inventory. It never scans an application, reads component source or documentation bodies, evaluates code, writes a patch, runs a package manager, starts a build, or decides whether a consumer completed a migration.

`hia-uview-tool inspect migration-actions` 是针对 API compatibility inventory 中当前每一个已审 P0 item 的只读说明报告。它绝不扫描 application、不读取 component source 或 documentation body、不执行代码、不写 patch、不运行 package manager、不启动 build，也不判断 consumer 是否已完成迁移。

## Current packet / 当前动作包

The current packet covers all 127 P0 API items across the 30 comparison components that actually contribute P0: 45 `compatible`, 71 `mapped`, and 11 `unsupported`. It retains the initial 38 actions for checkbox, checkbox group, radio, radio group, switch, single-column picker, local tabbar, and notice bar. Coverage is complete only for the declared P0 scope; it does not imply P1/P2 coverage, complete component equivalence, or runtime delivery of an unsupported item.

当前动作包覆盖 30 个实际贡献 P0 的 comparison component 中全部 127 个 P0 API item：45 个 `compatible`、71 个 `mapped`、11 个 `unsupported`。它继续保留 checkbox、checkbox group、radio、radio group、switch、single-column picker、local tabbar 与 notice bar 的首批 38 个 action。覆盖结论只对声明的 P0 scope 完整；它不意味着 P1/P2 覆盖、完整组件等价，也不意味着 unsupported item 已完成 runtime 交付。

The packet is generated deterministically as migration-action manifest v2 from API compatibility matrix v2. Every P0 item must first have a complete, source-bound semantic review. Each action carries a SHA-256 `sourceFingerprint` over its component/item identity, priority, current migration target/disposition/reason, and complete semantics. Existing human-reviewed bilingual copy is retained only when that fingerprint still matches exactly; target, disposition, reason, or semantic drift regenerates conservative copy instead of silently preserving stale guidance. The Tool independently recomputes every v2 fingerprint, while continuing to accept a historical v1 packet without fingerprints for read-only compatibility.

动作包由 API compatibility matrix v2 确定性生成为 migration-action manifest v2。每个 P0 item 必须先具备完整且绑定来源的 semantic review。每个 action 都带有 SHA-256 `sourceFingerprint`，绑定其 component/item identity、priority、当前 migration target/disposition/reason 与完整 semantics。既有人工审阅双语文案只有在该指纹仍精确匹配时才会保留；target、disposition、reason 或 semantic 漂移会重建保守文案，不会静默沿用过期指引。Tool 会独立重算每个 v2 指纹，同时为无指纹的历史 v1 动作包保留只读兼容。

Each item is cross-checked against the explicitly configured API matrix and has one finite operation:

每项都会与显式配置的 API matrix 交叉核对，并具有一个有限 operation：

| Operation | Meaning / 含义 |
| --- | --- |
| `use-as-is` | An audited HIA prop can be used as its current caller-controlled surface. / 已审计的 HIA prop 可按其当前 caller-controlled surface 使用。 |
| `adapt-call-site` | A same-name item needs caller review because payload, scope, or responsibility differs. / 同名 item 因 payload、scope 或责任不同而需要 caller review。 |
| `keep-existing-or-compose` | A future packet may use this for unsupported work; retain existing behavior or compose application code instead of expecting an automatic replacement. / 未来动作包可用于 unsupported work；保留既有行为或组合 application code，不要期待自动替换。 |

The Tool does not elevate a `compatible` item into complete component equivalence, and it never claims that a `mapped` item is a drop-in replacement. The action report is not a device, accessibility, H5/App, business-framework, backend, or publication support claim.

Tool 不会把 `compatible` item 提升为完整 component 等价，也不会声称 `mapped` item 是 drop-in replacement。动作报告不是 device、accessibility、H5/App、business framework、backend 或 publication support claim。

## Run it / 运行方式

```bash
mise exec -- npm run tool:inspect:migration-actions
```

Repository maintainers can verify or explicitly regenerate the committed packet without touching consumer code:

仓库维护者可在不触及 consumer code 的情况下检查或显式重生成提交的动作包：

```bash
mise exec -- npm run migration-actions:check
mise exec -- npm run migration-actions:generate
```

The root configuration must explicitly list both the API matrix and one or more action manifests. If an action manifest is absent, malformed, out of scope, ordered incorrectly, or mismatched with the matrix priority, migration facts, complete semantics, or independently recomputed source fingerprint, the command fails with a stable metadata diagnostic rather than guessing a caller action.

根 configuration 必须显式列出 API matrix 和一个或多个 action manifest。如果 action manifest 缺失、格式错误、超出 scope、顺序不正确，或者与 matrix priority、migration facts、完整 semantics 或独立重算的来源指纹不匹配，命令会以稳定 metadata diagnostic 失败，而不是猜测 caller action。

## Consumer boundary / 消费者边界

The report shows only bounded bilingual guidance, limitations, item identifiers, current dispositions, and repository-relative document links. `keep-existing-or-compose` is an honest current gap, not generated fallback code. The consumer owns its data, routing, identity, platform configuration, tests, and any actual code edits. The Tool intentionally has no “apply”, source-discovery, automatic-import, or migration-completion command.

报告只显示有界的双语 guidance、limitations、item identifier、当前 disposition 和 repository-relative document link。`keep-existing-or-compose` 是诚实的当前缺口，不是生成的 fallback code。consumer 拥有其 data、routing、identity、platform configuration、test 和任何实际 code edit。Tool 刻意没有 “apply”、source-discovery、automatic-import 或 migration-completion command。
