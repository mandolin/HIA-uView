# UTag component contract / UTag 组件契约

> Status / 状态：Private pre-release finite text tag with runtime-tested visibility/slot/event guards and package-owned precise types. / 私有预发布有限文字标签；可见性/slot/事件 guard 已有 runtime 测试，并具备 package 自有精确类型。

`UTag` presents caller-owned text with finite tokenized tone, size, shape, and appearance. It is informational by default. An explicit `clickable` body action and an optional close control report local intent only; the component never resolves a category registry, authorization, navigation, request, or business status and never hides itself.

`UTag` 以有限 token 化 tone、尺寸、形状与外观呈现调用方拥有的文字，默认是纯信息标签。显式 `clickable` 主体 action 与可选 close control 只报告本地意图；组件绝不解析分类 registry、授权、导航、请求或业务状态，也绝不自行隐藏。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 契约 |
| --- | --- | --- | --- |
| `text` | `string \| number` | `''` | Fallback visible copy; numeric `0` remains visible. / 可见文字回退；数字 `0` 保持可见。 |
| `tone` | `'neutral' \| 'primary' \| 'accent'` | `'neutral'` | Finite semantic token. / 有限语义 token。 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Finite local geometry. / 有限局部几何。 |
| `shape` | `'square' \| 'rounded' \| 'pill'` | `'rounded'` | Finite corner geometry. / 有限圆角几何。 |
| `appearance` | `'solid' \| 'outline'` | `'solid'` | Tokenized solid or transparent outlined surface. / token 化实心或透明描边表面。 |
| `clickable` | `boolean` | `false` | Explicitly creates a native body action; passive tags expose no false button semantics. / 显式创建原生主体 action；只读标签不暴露虚假按钮语义。 |
| `closable` | `boolean` | `false` | Shows the local close-intent control. / 显示局部 close 意图 control。 |
| `visible` | `boolean` | `true` | Existing HIA visibility input. / 既有 HIA 可见性输入。 |
| `show` | `boolean` | `true` | Migration visibility input. / 迁移可见性输入。 |
| `disabled` | `boolean \| string` | `false` | `true` or a non-empty string blocks both click and close intent; it is not authorization. / `true` 或非空字符串阻止 click 与 close 意图；它不是授权。 |

The tag projects only when both `visible` and `show` are true. The default slot replaces `text`. Only `clickable=true` creates a native body button and emits `click(originalEvent)`; a passive tag has no click control or button role. An enabled close control remains a sibling native button, emits payload-free `close()`, and never nests inside the body action. Neither event changes `visible` or `show`.

只有 `visible` 与 `show` 同时为真时才投影标签。默认 slot 替代 `text`。只有 `clickable=true` 才创建原生主体按钮并 emit `click(originalEvent)`；只读标签没有 click control 或 button role。启用的关闭 control 是同级原生按钮，emit 无 payload 的 `close()`，且不会嵌套在主体 action 中。两个事件都不会改变 `visible` 或 `show`。

In other words, either explicit `false` hides the local tag. `disabled` accepts `boolean | string`; a non-empty string is an interaction guard rather than a business or authorization state.

换言之，任一显式 `false` 都会隐藏局部标签。`disabled` 接受 `boolean | string`；非空字符串是交互 guard，而不是业务或授权状态。

## Migration from uView-Pro 0.6.15 / 从 uView-Pro 0.6.15 迁移

`disabled`, `show`, and `text` are reviewed compatible inputs. The default slot, click, and close have runtime-tested bounded mappings, not upstream equivalence: an HIA caller must opt into the body action with `clickable`, while upstream click/close report the configured `index` and HIA reports the original click event and payload-free close respectively. `shape` and `size` require finite-value translation.

`disabled`、`show` 与 `text` 是已复核的 compatible 输入。默认 slot、click 与 close 已有 runtime 测试的受限 mapping，但并非上游等价：HIA 调用方必须用 `clickable` 显式开启主体 action；上游 click/close 报告配置的 `index`，而 HIA 分别报告原始点击事件和无 payload close。`shape` 与 `size` 需要有限值转换。

Upstream `closeable` (spelling), `mode`, `type`, index, raw color/border/close color, and arbitrary class/style surfaces are unsupported. HIA's prop is `closable`, and `appearance`/`tone` are its bounded replacements rather than aliases.

上游 `closeable`（拼写）、`mode`、`type`、index、原始 color/border/close color 及任意 class/style 表面均未支持。HIA prop 是 `closable`，而 `appearance`/`tone` 是受限替代，并非 alias。

## Examples / 示例

```vue
<u-tag
  v-if="tagVisible"
  text="Available / 可用"
  tone="primary"
  appearance="outline"
  :clickable="true"
  :closable="true"
  @click="inspectTag"
  @close="tagVisible = false"
/>
```

```vue
<!-- Incorrect: close does not carry index or hide automatically; `closeable` is unsupported. -->
<!-- 错误：close 不携带 index、不会自动隐藏，且 `closeable` 未支持。 -->
<u-tag :index="record.id" :closeable="true" @close="removeByIndex" />
```

## Limits and evidence / 限制与证据

Runtime tests cover passive default semantics, explicit native click action, dual visibility, slot/text precedence, numeric zero, Boolean/String disabled guards, original click identity, payload-free close, and sibling click/close isolation. Package types constrain finite tokens. Compiler evidence does not prove authorization, category semantics, DevTools/device behavior, or cross-platform assistive-technology support.

Runtime 测试覆盖默认只读语义、显式原生 click action、双可见性、slot/text 优先级、数字零、Boolean/String disabled guard、原始 click identity、无 payload close，以及同级 click/close 隔离。package 类型约束有限 token。compiler 证据不证明授权、分类语义、开发者工具/真机行为或跨端辅助技术支持。
