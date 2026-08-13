# UEmpty component contract / UEmpty 组件契约

> Status / 状态：Private pre-release caller-owned empty-state projection with runtime-tested text/source/action/bottom-slot behavior and package-owned precise types. / 私有预发布调用方自有空态投影；文字/来源/action/bottom slot 行为已有 runtime 测试，并具备 package 自有精确类型。

`UEmpty` presents caller-owned empty-state copy, an optional caller-approved image source, an optional local action intent, and optional supplementary bottom content. The application decides that an empty state exists. The component inspects no data, infers no loading completion, and performs no request, retry, pagination, scrolling, virtualization, route, or business action.

`UEmpty` 呈现调用方拥有的空态文字、可选调用方批准图片来源、可选本地 action 意图和可选底部补充内容。是否存在空态由应用决定。组件不检查数据、不推断 loading 完成，也不执行请求、重试、分页、滚动、虚拟化、route 或业务操作。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 契约 |
| --- | --- | --- | --- |
| `show` | `boolean` | `true` | Controls this local projection only. / 只控制当前局部投影。 |
| `src` | `string` | `''` | Optional source passed to bounded `UImage`; empty text creates no image node. / 传给受限 `UImage` 的可选来源；空文字不创建 image 节点。 |
| `title` | `string` | `''` | Caller-owned primary empty-state copy. / 调用方自有主要空态文字。 |
| `description` | `string` | `''` | Preferred caller-owned secondary copy. / 优先的调用方自有次级文字。 |
| `text` | `string` | `''` | Migration secondary copy used only when `description` is empty. / 仅在 `description` 为空时使用的迁移次级文字。 |
| `actionText` | `string` | `''` | Non-empty copy creates the local action control. / 非空文字创建局部 action control。 |

| Surface / 表面 | Payload or bindings / 载荷或绑定 | Contract / 契约 |
| --- | --- | --- |
| `action` event | original `UButton` platform event / 原始 `UButton` 平台事件 | Reports intent only when `actionText` is non-empty; no retry, route, or data mutation occurs. / 仅在 `actionText` 非空时报告意图；不发生重试、route 或数据修改。 |
| `bottom` slot | none / 无 | Projects caller supplementary content after the built-in action and participates in no action guard or state interpretation. / 在内建 action 后投影调用方补充内容；不参与 action guard 或状态解释。 |

`description` always takes precedence over migration `text`. `show=false` removes only this instance. `src` is passed into [`UImage`](image.md), so source trust, remote policy, loading, error recovery, and fallback decisions remain caller-owned.

`description` 始终优先于迁移 `text`。`show=false` 只移除当前实例。`src` 传入 [`UImage`](image.md)，因此来源信任、远程策略、加载、错误恢复与 fallback 决策仍由调用方拥有。

## Migration from uView-Pro 0.6.15 / 从 uView-Pro 0.6.15 迁移

`show`, `src`, and `text` are reviewed compatible inputs. The `bottom` slot is a runtime-tested bounded mapping with no bindings. HIA adds caller-owned `title`, `description`, `actionText`, and `action`; these are not upstream aliases. Upstream mode, icon/image geometry, raw color/style/font-size, and margin surfaces are unsupported.

`show`、`src` 与 `text` 是已复核的 compatible 输入。`bottom` slot 是已有 runtime 测试且无 binding 的受限 mapping。HIA 新增调用方自有的 `title`、`description`、`actionText` 与 `action`；它们不是上游 alias。上游 mode、图标/图片几何、原始 color/style/font-size 与 margin 表面均未支持。

## Examples / 示例

```vue
<u-empty
  :show="records.length === 0 && !loading"
  title="No records / 暂无记录"
  description="Adjust the caller-owned filters. / 请调整调用方拥有的筛选条件。"
  action-text="Reset filters / 重置筛选"
  @action="resetFilters"
>
  <template #bottom><text>Local help / 本地帮助</text></template>
</u-empty>
```

```vue
<!-- Incorrect: UEmpty does not inspect data, infer loading, or retry a request. -->
<!-- 错误：UEmpty 不检查数据、不推断 loading，也不重试请求。 -->
<u-empty :data="records" loading retry />
```

## Limits and evidence / 限制与证据

Runtime tests cover `show`, source projection, description/text precedence, action guards and original event, bottom-slot projection, and separation between built-in action and supplementary content. Package types constrain props/events. Compiler fixtures do not prove data facts, remote images, retry behavior, scrolling, accessibility-tree output, DevTools/device behavior, or cross-platform runtime.

Runtime 测试覆盖 `show`、来源投影、description/text 优先级、action guard 与原始事件、bottom slot 投影，以及内建 action 与补充内容的分离。package 类型约束 props/events。compiler fixture 不证明数据事实、远程图片、重试行为、滚动、无障碍树输出、开发者工具/真机行为或跨端 runtime。
