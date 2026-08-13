# USkeleton component contract / USkeleton 组件契约

> Status / 状态：Private pre-release static placeholder projection with runtime-tested loading/slot exclusivity and bounded rows, plus package-owned precise types. / 私有预发布静态占位投影；loading/slot 互斥和受限 rows 已有 runtime 测试，并具备 package 自有精确类型。

`USkeleton` switches between a bounded static placeholder and caller-owned real content. The caller owns the `loading` fact and asynchronous lifecycle; the component performs no animation, DOM measurement, selector query, request waiting, content inspection, or data inference.

`USkeleton` 在受限静态占位与调用方拥有的真实内容之间切换。`loading` 事实和异步生命周期由调用方拥有；组件不播放动画、不测量 DOM、不执行 selector query、不等待请求、不检查内容，也不推断数据。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 契约 |
| --- | --- | --- | --- |
| `loading` | `boolean` | `true` | `true` projects placeholders; `false` projects only the default slot. / `true` 投影占位；`false` 只投影默认 slot。 |
| `rows` | `number` | `3` | Finite candidates are truncated and clamped to `0..8`; wrong-type and non-finite runtime values produce zero rows. / 有限候选会截断并 clamp 到 `0..8`；错误类型与非有限 runtime 值产生零行。 |
| `showTitle` | `boolean` | `true` | Toggles one static title placeholder. / 切换一个静态标题占位。 |
| `showAvatar` | `boolean` | `false` | Toggles one static avatar placeholder. / 切换一个静态头像占位。 |

| Slot / 插槽 | Bindings / 绑定 | Contract / 契约 |
| --- | --- | --- |
| `default` | none / 无 | Renders only when `loading=false`; caller content is not read, cached, cloned, or used to update loading. / 仅在 `loading=false` 时呈现；调用方内容不会被读取、缓存、复制，也不会用于更新 loading。 |

The root namespace is `u-skeleton` and consumes `--u-comp-skeleton-*` tokens. Placeholder nodes contain no caller data or generated copy.

根命名空间为 `u-skeleton`，消费 `--u-comp-skeleton-*` token。占位节点不包含调用方数据或生成文字。

## Migration from uView-Pro 0.6.15 / 从 uView-Pro 0.6.15 迁移

Both implementations use caller-owned `loading` and a conditional default slot, and runtime parity is tested. The matrix keeps them `mapped` because the fixed upstream default is an opaque expression while HIA explicitly defaults to `true`, and the surrounding visual/animation surfaces differ. Set `loading` explicitly during migration.

两种实现都使用调用方拥有的 `loading` 和条件默认 slot，并已有 runtime parity 测试。matrix 仍保持 `mapped`，因为固定上游的 default 是 opaque expression，而 HIA 明确默认为 `true`，且周边视觉/动画表面不同。迁移时应显式设置 `loading`。

| Upstream surface / 上游表面 | HIA action / HIA 动作 |
| --- | --- |
| `loading` | Bind an explicit boolean; do not rely on upstream default behavior. / 绑定显式 boolean；不要依赖上游默认行为。 |
| `rows` | Review the `0..8` hard bound and truncation behavior. / 复核 `0..8` 硬边界与截断行为。 |
| `title` / `avatar` | Map deliberately to `showTitle` / `showAvatar`; names and defaults differ. / 明确映射到 `showTitle` / `showAvatar`；名称与默认值不同。 |
| animation, width/height arrays, shape or timing / 动画、宽高数组、形状或时序 | Redesign with documented tokens/composition; these surfaces are unsupported. / 以已记录 token/组合重新设计；这些表面未支持。 |

## Examples / 示例

```vue
<u-skeleton :loading="isLoading" :rows="4" :show-title="true" :show-avatar="false">
  <view>Loaded content / 已加载内容</view>
</u-skeleton>
```

```vue
<!-- Incorrect: the skeleton never waits for or discovers this request. -->
<!-- 错误：skeleton 绝不会等待或发现此请求。 -->
<u-skeleton :rows="1000"><remote-result /></u-skeleton>
```

## Limits and evidence / 限制与证据

Runtime tests prove the mutually exclusive branches and stable row bounds, including negative, excessive, fractional, and non-finite inputs. Compiler fixtures do not prove animation, layout measurement, visual fidelity, data readiness, accessibility-tree output, DevTools, device behavior, or cross-platform runtime.

Runtime 测试证明两个分支互斥，以及对负数、过大值、小数与非有限输入的稳定行数边界。compiler fixture 不证明动画、布局测量、视觉还原、数据就绪、无障碍树输出、开发者工具、真机行为或跨端 runtime。
