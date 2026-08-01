# URate component contract / URate 组件契约

> Status / 状态：Private pre-release text-symbol rating presentation for `mp-weixin`.
> 状态：`mp-weixin` 私有预发布文字符号分级呈现。

`URate` renders a finite number of caller-selected symbols and emits an integer position when a symbol is selected. It does not submit reviews, calculate scores, or assign business meaning.

`URate` 呈现有限数量的调用方选择符号，并在选择时回传整数位置。它不提交评价、不计算分数，也不赋予业务含义。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `modelValue` | `number` | `0` |
| `count` | `number` | `5` |
| `disabled` | `boolean` | `false` |
| `activeSymbol` / `inactiveSymbol` | `string` | `★` / `☆` |

`update:modelValue`, `input`, and `change` carry the selected integer. The root namespace is `u-rate` and consumes `--u-comp-rate-*`; the default implementation loads no icon, font, or image asset.

`update:modelValue`、`input` 和 `change` 携带选中的整数。根命名空间为 `u-rate`，消费 `--u-comp-rate-*`；默认实现不加载图标、字体或图片资产。

WCAG 2.2 AA visual distinction is the target, but screen-reader announcement, device behavior, and cross-platform support are not promised by this contract.

 WCAG 2.2 AA 视觉区分是目标，但本文不承诺读屏播报、真机行为或跨端支持。
