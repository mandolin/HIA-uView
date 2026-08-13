# UIcon component contract / UIcon 组件契约

> Status / 状态：Private pre-release text/slot symbol placeholder with runtime-tested click behavior and package-owned precise types. No icon font or registry is included. / 私有预发布文字/slot 符号占位；click 行为已有 runtime 测试，并具备 package 自有精确类型。不包含图标字体或 registry。

`UIcon` presents caller-provided text through `name` or the default slot. It does not translate a name into a glyph, load an asset, infer meaning, or navigate.

`UIcon` 通过 `name` 或默认 slot 呈现调用方提供的文字。它不把名称转换为 glyph、不加载资产、不推断含义，也不导航。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 契约 |
| --- | --- | --- | --- |
| `name` | `string` | `''` | Text-symbol fallback; an empty value displays the neutral `•` fallback. / 文字符号回退；空值显示中性 `•` 回退。 |
| `label` | `string \| number` | `''` | Visible label and accessible-name input; numeric `0` remains visible. / 可见标签及无障碍名称输入；数字 `0` 保持可见。 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Finite tokenized symbol size. / 有限 token 化符号尺寸。 |
| `tone` | `'neutral' \| 'primary' \| 'accent'` | `'neutral'` | Finite tokenized tone. / 有限 token 化 tone。 |
| `disabled` | `boolean` | `false` | Suppresses local click intent. / 抑制本地 click 意图。 |

| Surface / 表面 | Payload or bindings / 载荷或绑定 | Contract / 契约 |
| --- | --- | --- |
| `click` event | original platform event / 原始平台事件 | Emits while enabled; disabled emits nothing. / 启用时 emit；禁用时不 emit。 |
| `default` slot | none / 无 | Replaces the `name`/neutral symbol presentation; label remains separate. / 替代 `name`/中性符号呈现；label 仍单独显示。 |

Numeric `0` remains a visible `label`; only the empty string means no label.

数字 `0` 保持为可见 `label`；只有空字符串表示没有 label。

The root namespace is `u-icon` and consumes `--u-comp-icon-*` tokens. A caller must provide visible or otherwise meaningful context whenever the symbol is not self-explanatory.

根命名空间为 `u-icon`，消费 `--u-comp-icon-*` token。符号无法自解释时，调用方必须提供可见或其他有意义的上下文。

## Migration from uView-Pro 0.6.15 / 从 uView-Pro 0.6.15 迁移

Upstream `name` is an icon-registry/font key and upstream `size` accepts a different geometry model. HIA deliberately treats `name` as text and uses a finite three-value size; both remain `mapped`. Upstream click may substitute its configured `index`, whereas HIA always returns the original platform event. Only `label` is a reviewed compatible input.

上游 `name` 是 icon registry/font key，且上游 `size` 使用不同的几何模型。HIA 有意把 `name` 当作文字，并使用有限三值尺寸；二者保持 `mapped`。上游 click 可能用配置的 `index` 替代事件，而 HIA 始终返回原始平台事件。只有 `label` 是已复核的 compatible 输入。

| Upstream assumption / 上游假设 | HIA migration / HIA 迁移 |
| --- | --- |
| `name="home"` resolves a bundled icon / 解析内建图标 | Supply a caller-owned text/slot symbol or choose a separately reviewed asset system. / 提供调用方自有文字/slot 符号，或选择另行审阅的资产系统。 |
| numeric or raw-size `size` / 数字或原始尺寸 | Map deliberately to `small`, `medium`, or `large`. / 明确映射到 `small`、`medium` 或 `large`。 |
| click payload may be `index` / click 载荷可能是 `index` | Accept the platform event; keep identity outside the icon. / 接收平台事件；在 icon 外保存 identity。 |
| color/prefix/image mode/spacing props / 颜色、prefix、图片模式、间距 prop | Use finite `tone`, documented composition, or another component; these props are unsupported. / 使用有限 `tone`、已记录组合或其他组件；这些 prop 未支持。 |

## Examples / 示例

```vue
<u-icon tone="primary" size="medium" label="Home / 首页" @click="goHome">⌂</u-icon>
```

```vue
<!-- Incorrect: `home` is rendered as text; no icon font is bundled. -->
<!-- 错误：`home` 会被当作文字显示；本包没有捆绑 icon font。 -->
<u-icon name="home" color="#0057b8" :size="32" />
```

## Limits and evidence / 限制与证据

Runtime tests cover slot/name precedence, original-event identity, and disabled zero-event behavior. Package types constrain size and tone. Compiler evidence is not proof of glyph availability, screen-reader output, device input, or cross-platform support. The component loads no font, image, SVG, remote asset, registry, route, or business command.

Runtime 测试覆盖 slot/name 优先级、原始事件 identity 和 disabled 零事件行为。package 类型约束 size 与 tone。compiler 证据不证明 glyph 可用性、读屏输出、真机输入或跨端支持。组件不加载字体、图片、SVG、远程资产、registry、route 或业务 command。
