# Migration action packets / 迁移动作包

`hia-uview-tool inspect migration-actions` is a read-only explanation report for a deliberately small, reviewed part of the API compatibility inventory. It never scans an application, reads component source or documentation bodies, evaluates code, writes a patch, runs a package manager, starts a build, or decides whether a consumer completed a migration.

`hia-uview-tool inspect migration-actions` 是针对 API compatibility inventory 中经过刻意审阅的小范围项目的只读说明报告。它绝不扫描 application、不读取 component source 或 documentation body、不执行代码、不写 patch、不运行 package manager、不启动 build，也不判断 consumer 是否已完成迁移。

## Current packet / 当前动作包

The initial packet covers every P0 API item in eight current caller-controlled surfaces: checkbox, checkbox group, radio, radio group, switch, single-column picker, local tabbar, and notice bar. It is complete only for that declared component/P0 scope. It does not imply coverage of other P0 components or any P1/P2 item.

初始动作包覆盖八个当前 caller-controlled 表面中的每一个 P0 API item：checkbox、checkbox group、radio、radio group、switch、single-column picker、local tabbar 与 notice bar。它只对该已声明的 component/P0 范围完整；它不意味着覆盖其他 P0 component 或任何 P1/P2 item。

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

The root configuration must explicitly list both the API matrix and one or more action manifests. If an action manifest is absent, malformed, out of scope, ordered incorrectly, or mismatched with the matrix priority/disposition, the command fails with a stable metadata diagnostic rather than guessing a caller action.

根 configuration 必须显式列出 API matrix 和一个或多个 action manifest。如果 action manifest 缺失、格式错误、超出 scope、顺序不正确，或者与 matrix priority/disposition 不匹配，命令会以稳定 metadata diagnostic 失败，而不是猜测 caller action。

## Consumer boundary / 消费者边界

The report shows only selected bilingual guidance, limitations, item identifiers, current dispositions, and repository-relative document links. The consumer owns its data, routing, identity, platform configuration, tests, and any actual code edits. The Tool intentionally has no “apply”, source-discovery, automatic-import, or migration-completion command.

报告只显示选定的双语 guidance、limitations、item identifier、当前 disposition 和 repository-relative document link。consumer 拥有其 data、routing、identity、platform configuration、test 和任何实际 code edit。Tool 刻意没有 “apply”、source-discovery、automatic-import 或 migration-completion command。
