# UText component contract / UText 组件契约

> Status / 状态：Private pre-release finite text projection with runtime-tested slot/click behavior and package-owned precise types. / 私有预发布有限文字投影；slot/click 行为已有 runtime 测试，并具备 package 自有精确类型。

`UText` presents caller-owned plain text or a default slot with finite tone, size, and line-clamp presentation. It parses no HTML, rich text, URL, remote content, icon, or external asset and performs no navigation, calling, copying, selection, or business formatting.

`UText` 以有限 tone、尺寸和行数截断呈现调用方拥有的纯文字或默认 slot。它不解析 HTML、富文本、URL、远程内容、图标或外部资产，也不执行导航、拨号、复制、选择或业务格式化。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 契约 |
| --- | --- | --- | --- |
| `show` | `boolean` | `true` | Controls this local projection only. / 只控制当前局部投影。 |
| `text` | `string \| number` | `''` | Plain fallback copy when the default slot is absent; numeric `0` remains visible. / 默认 slot 缺省时的纯文字回退；数字 `0` 保持可见。 |
| `type` | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'primary'` | Finite semantic tone. / 有限语义 tone。 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Finite typography size. / 有限排版尺寸。 |
| `lines` | `number` | `0` | Finite values are floored/clamped to `0..6`; `0` means no line clamp. / 有限值会 floor/clamp 到 `0..6`；`0` 表示不限制行数。 |
| `ellipsis` | `boolean` | `false` | Retained finite appearance switch; current clamping is driven by bounded `lines`. / 保留的有限外观开关；当前截断由受限 `lines` 驱动。 |

| Surface / 表面 | Payload or bindings / 载荷或绑定 | Contract / 契约 |
| --- | --- | --- |
| `click` | original platform event / 原始平台事件 | Reports local intent without changing text or invoking a platform capability. / 报告本地意图，不改变文字、不调用平台能力。 |
| `default` slot | none / 无 | Replaces `text` while `show=true`. / 在 `show=true` 时替代 `text`。 |

The root namespace is `u-text` and consumes `--u-comp-text-*` tokens. Runtime unknown tone/size values fall back to `primary`/`md` rather than forming arbitrary classes.

根命名空间为 `u-text`，消费 `--u-comp-text-*` token。runtime 未知 tone/size 值会回退到 `primary`/`md`，不会形成任意 class。

## Migration from uView-Pro 0.6.15 / 从 uView-Pro 0.6.15 迁移

`show` and `text` are reviewed compatible inputs. `type`, `size`, and `lines` require explicit mapping to HIA's finite values. Upstream click has no payload; HIA forwards the platform event. Both default slots use caller content, but HIA always gives the slot precedence while visible, so the item remains `mapped` at the full call-site boundary.

`show` 与 `text` 是已复核的 compatible 输入。`type`、`size` 与 `lines` 必须显式映射到 HIA 的有限值。上游 click 无 payload；HIA 转发平台事件。两边默认 slot 都使用调用方内容，但 HIA 在可见时始终给予 slot 优先级，因此完整调用点仍保持 `mapped`。

Unsupported upstream surfaces include URL/call/form/open-type behavior, format modes, prefix/suffix icons, raw color/style/line-height/margin, alignment, block/bold/decoration, and platform authorization events.

未支持的上游表面包括 URL/拨号/form/open-type 行为、format mode、前后缀图标、原始 color/style/line-height/margin、alignment、block/bold/decoration，以及平台授权事件。

## Examples / 示例

```vue
<u-text type="secondary" size="md" :lines="2" @click="inspectCopy">
  Caller-owned summary / 调用方自有摘要
</u-text>
```

```vue
<!-- Incorrect: HIA does not turn text into a link or parse formatting modes. -->
<!-- 错误：HIA 不会把文字变为链接，也不会解析 format mode。 -->
<u-text text="https://example.test" mode="link" href="https://example.test" />
```

## Limits and evidence / 限制与证据

Runtime tests cover visibility, slot/text precedence, original-event identity, and local bounded presentation. Package types constrain all finite values. Compiler fixtures do not prove text measurement, visual truncation on every platform, selection/copy behavior, keyboard/screen-reader output, DevTools, device behavior, or cross-platform runtime.

Runtime 测试覆盖可见性、slot/text 优先级、原始事件 identity 与局部受限呈现。package 类型约束全部有限值。compiler fixture 不证明文字测量、各平台视觉截断、选择/复制行为、键盘/读屏输出、开发者工具、真机行为或跨端 runtime。
