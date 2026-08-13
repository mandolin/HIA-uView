# UPagination component contract / UPagination 组件契约

> Status / 状态：Private pre-release controlled finite page selector with runtime-tested event order/guards and package-owned precise types. / 私有预发布受控有限页码选择器；事件顺序与 guard 已有 runtime 测试，并具备 package 自有精确类型。

`UPagination` projects caller-computed pagination state and reports candidate page intent. It does not request records, read a remote total, manage cursor/offset, slice data, cache results, or decide a business pagination policy.

`UPagination` 投影调用方计算的分页状态，并报告候选页码意图。它不请求 records、不读取远程 total、不管理 cursor/offset、不切分数据、不缓存结果，也不决定业务分页策略。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 契约 |
| --- | --- | --- | --- |
| `current` | `number \| undefined` | `undefined` | Preferred HIA current page when explicitly supplied. / 显式提供时优先的 HIA 当前页。 |
| `pageCount` | `number \| undefined` | `undefined` | Preferred HIA local page count when explicitly supplied. / 显式提供时优先的 HIA 局部页数。 |
| `modelValue` | `number` | `1` | Migration/standard v-model current page when `current` is absent. / `current` 缺省时的迁移/标准 v-model 当前页。 |
| `pageSize` | `number` | `10` | Used only to derive page count from caller-owned `total`. / 只用于根据调用方自有 `total` 推导页数。 |
| `total` | `number \| undefined` | absent / 缺省 | Caller-owned total candidate; it is not fetched. / 调用方自有 total 候选；不会被请求。 |
| `prevText` | `string` | `'上一页 / Prev'` | Caller-localized previous control copy. / 调用方本地化的上一页 control 文字。 |
| `nextText` | `string` | `'下一页 / Next'` | Caller-localized next control copy. / 调用方本地化的下一页 control 文字。 |

| Surface / 表面 | Payload or bindings / 载荷或绑定 | Contract / 契约 |
| --- | --- | --- |
| `update:current` | `page: number` | First event for an accepted page. / 合法页码的第一个事件。 |
| `update:modelValue` | `page: number` | Second event for the same accepted page. / 同一合法页码的第二个事件。 |
| `change` | `page: number` | Third and final event for the same accepted page. / 同一合法页码的第三个也是最后一个事件。 |
| `default` slot | `{ current: number, pageCount: number }` | Replaces only the local summary; page controls remain component-owned. The consumer slot-prop key is `pageCount`. / 只替换局部摘要；页码 control 仍由组件拥有。consumer slot-prop key 是 `pageCount`。 |

Page count is normalized to an integer in `1..100`. A missing, zero, negative, or non-finite `total`/`pageSize` pair yields one displayed page. Current page is clamped into the displayed range without implicit writeback. A duplicate, non-integer, or out-of-range candidate emits nothing.

页数规整为 `1..100` 的整数。缺失、零、负数或非有限的 `total`/`pageSize` 组合会显示一页。当前页会 clamp 到显示范围，但不会隐式写回。重复、非整数或越界候选不会 emit 任何事件。

## Migration from uView-Pro 0.6.15 / 从 uView-Pro 0.6.15 迁移

`modelValue`, `pageSize`, and `total` are reviewed compatible inputs. `update:modelValue` reports the same number but remains a conservative mapping at the complete component boundary. Upstream `change` reports a page-change object; HIA reports the page number. Upstream's default slot has no bindings; HIA adds read-only summary bindings. `prevText`/`nextText` require copy review, while icon and model-modifier surfaces are unsupported.

`modelValue`、`pageSize` 与 `total` 是已复核的 compatible 输入。`update:modelValue` 报告相同 number，但在完整组件边界仍保守保持 mapping。上游 `change` 报告页码变化对象；HIA 报告页码 number。上游默认 slot 没有 binding；HIA 增加只读摘要 binding。`prevText`/`nextText` 需要复核文案，icon 与 model-modifier 表面未支持。

## Examples / 示例

```vue
<u-pagination v-model="page" :total="53" :page-size="10" @change="loadPage">
  <template #default="{ current, pageCount }">
    <text>{{ current }} of {{ pageCount }}</text>
  </template>
</u-pagination>
```

The caller updates data in `loadPage`; the component itself performs no query.

调用方在 `loadPage` 中更新数据；组件本身不执行查询。

```vue
<!-- Incorrect: `change` is a number, not the upstream detail object. -->
<!-- 错误：`change` 是 number，不是上游 detail 对象。 -->
<u-pagination :total="53" @change="({ current }) => loadPage(current)" />
```

## Limits and evidence / 限制与证据

Runtime tests cover precedence, clamping, zero-event invalid/no-op candidates, exact event order, equal numeric payloads, and summary-slot precedence. Package types constrain event payloads. Compiler fixtures do not prove queries, remote totals, large-data performance, keyboard/screen-reader behavior, DevTools, device use, or cross-platform runtime.

Runtime 测试覆盖优先级、clamp、非法/no-op 候选零事件、精确事件顺序、相同数值载荷和摘要 slot 优先级。package 类型约束事件载荷。compiler fixture 不证明查询、远程 total、大数据性能、键盘/读屏行为、开发者工具、真机使用或跨端 runtime。
