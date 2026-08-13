# USwipeAction component contract / USwipeAction 组件契约

> Status / 状态：Private pre-release explicit action projection with runtime-tested bounded snapshots/event order and package-owned precise types. It is not a swipe-gesture engine. / 私有预发布显式操作投影；受限快照/事件顺序已有 runtime 测试，并具备 package 自有精确类型。它不是 swipe 手势引擎。

`USwipeAction` keeps caller content visible and conditionally projects a finite action row when caller-controlled `open` or migration `show` is true. It reports scalar action and close intents; it performs no native gesture, transform, animation, deletion, submission, request, navigation, or persistence.

`USwipeAction` 保持调用方内容可见，并在调用方控制的 `open` 或迁移 `show` 为真时条件投影有限操作行。它报告标量 action 与 close 意图；不执行原生手势、transform、动画、删除、提交、请求、导航或持久化。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 契约 |
| --- | --- | --- | --- |
| `open` | `boolean \| undefined` | `undefined` | Preferred HIA controlled reveal state when supplied. / 提供时优先的 HIA 受控展开状态。 |
| `show` | `boolean` | `false` | Migration reveal state used only when `open` is absent. / 仅在 `open` 缺省时使用的迁移展开状态。 |
| `actions` | `ReadonlyArray<USwipeActionInput>` | `[]` | Preferred HIA action source when non-empty. / 非空时优先的 HIA 操作来源。 |
| `options` | `ReadonlyArray<USwipeActionInput>` | `[]` | Migration source used only when `actions` is empty. / 仅在 `actions` 为空时使用的迁移来源。 |
| `closeText` | `string` | `'Close / 关闭'` | Caller-localized explicit close-control copy. / 调用方本地化的显式关闭 control 文字。 |
| `disabled` | `boolean` | `false` | Suppresses every local action and close intent. / 抑制全部本地操作与关闭意图。 |

`USwipeActionInput` is a non-empty string, a finite number, or a finite data record with own data fields `value`, `label`, `text`, `type`, and `disabled`. `type` is limited to `primary`, `warning`, or `danger`. At most 16 own array entries are inspected. Accessor/inherited fields, functions, objects as payloads, non-finite numbers, unsafe records, and entries without safe visible copy are rejected; callbacks are never executed.

`USwipeActionInput` 是非空字符串、有限 number，或具有 own data 字段 `value`、`label`、`text`、`type`、`disabled` 的有限 data record。`type` 只允许 `primary`、`warning` 或 `danger`。最多检查 16 个 own array entry。accessor/继承字段、函数、对象载荷、非有限 number、不安全 record 和缺少安全可见文字的条目会被拒绝；callback 绝不会执行。

| Surface / 表面 | Payload or bindings / 载荷或绑定 | Contract / 契约 |
| --- | --- | --- |
| `click` | `value: string \| number` | First event after an eligible action control. / 合法 action control 的第一个事件。 |
| `action` | same `value` / 同一 `value` | Second event after the same action. / 同一操作的第二个事件。 |
| `update:open` | `false` | First close-control event; requests caller writeback only. / 关闭 control 的第一个事件；只请求调用方写回。 |
| `close` | none / 无 | Second close-control event; the component does not change `open` or `show`. / 关闭 control 的第二个事件；组件不改变 `open` 或 `show`。 |
| `default` slot | none / 无 | Caller-owned content; the component does not inspect or forward its events. / 调用方自有内容；组件不检查或转发其事件。 |

## Migration from uView-Pro 0.6.15 / 从 uView-Pro 0.6.15 迁移

`disabled`, `options`, `show`, `click`, `close`, and the default slot have runtime evidence, but only `disabled` is a reviewed compatible input. Upstream `click(rowIndex, actionIndex)` and `close(rowIndex)` do not match HIA's `click(value)` and payload-free `close()`. HIA also has no gesture lifecycle: `show/open` directly controls whether the explicit buttons are projected.

`disabled`、`options`、`show`、`click`、`close` 与默认 slot 都具备 runtime 证据，但只有 `disabled` 是已复核的 compatible 输入。上游 `click(rowIndex, actionIndex)` 和 `close(rowIndex)` 不等于 HIA 的 `click(value)` 与无 payload `close()`。HIA 也没有手势生命周期：`show/open` 直接控制是否投影显式按钮。

The migration `options` input is read only when `actions` is empty; the two arrays are never merged.

迁移 `options` 仅在 `actions` 为空时读取；两个数组绝不合并。

| Upstream assumption / 上游假设 | Required migration / 必需迁移 |
| --- | --- |
| row/action indexes identify the operation / row/action index 标识操作 | Put a safe string/number identity in `value` and handle that scalar. / 在 `value` 中放入安全 string/number identity，并处理该标量。 |
| swipe reveals or closes the row / swipe 展开或关闭操作行 | Add caller/platform gesture orchestration separately, or use the explicit controls as documented. / 另行增加调用方/平台手势编排，或按文档使用显式 control。 |
| option callbacks execute / option callback 会执行 | Move all consequences into `@click`, `@action`, or `@close` handlers. / 将全部后果移入 `@click`、`@action` 或 `@close` handler。 |
| index, vibration, content-click, open event, raw widths/colors / index、震动、content-click、open 事件、原始宽度/颜色 | These surfaces are unsupported; do not silently drop them. / 这些表面未支持；不要静默丢弃。 |

## Examples / 示例

```vue
<u-swipe-action
  v-model:open="actionsOpen"
  :options="[
    { value: 'archive', text: 'Archive / 归档', type: 'primary' },
    { value: 'remove', text: 'Remove / 移除', type: 'danger' }
  ]"
  @click="handleActionValue"
  @close="actionsOpen = false"
>
  <view>Caller-owned row / 调用方自有行</view>
</u-swipe-action>
```

```vue
<!-- Incorrect: no swipe occurs, callbacks are ignored, and click is not (rowIndex, actionIndex). -->
<!-- 错误：不会发生 swipe，callback 会被忽略，且 click 不是 (rowIndex, actionIndex)。 -->
<u-swipe-action :show="true" :options="[{ text: 'Delete', onClick: removeRecord }]" @click="removeByIndexes" />
```

## Limits and evidence / 限制与证据

Runtime tests cover source precedence, scalar/data-record normalization, accessor/callback rejection, the 16-entry bound, disabled zero-event behavior, exact action/close event order, and caller-state ownership. This is not a script sandbox: exceptional proxy reflection is caught, but arbitrary hostile proxy behavior cannot be universally characterized. Compiler fixtures do not prove a gesture, animation, DevTools/device behavior, or cross-platform runtime.

Runtime 测试覆盖来源优先级、标量/data-record 规整、accessor/callback 拒绝、16 项边界、disabled 零事件、精确 action/close 事件顺序和调用方状态所有权。它不是脚本沙箱：异常 proxy reflection 会被捕获，但无法普遍刻画任意恶意 proxy 行为。compiler fixture 不证明手势、动画、开发者工具/真机行为或跨端 runtime。
