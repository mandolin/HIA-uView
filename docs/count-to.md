# UCountTo component contract / UCountTo 组件契约

> Status / 状态：Private pre-release synchronous number projection; animation is intentionally not included.
> 状态：私有预发布同步数字投影；有意不包含动画。

`UCountTo` formats a controlled finite number with `decimals`, `prefix`, `suffix`, and `separator`. It owns no timer, animation, auto-increment, easing, end event, statistics calculation, or request.

`UCountTo` 使用 `decimals`、`prefix`、`suffix` 和 `separator` 格式化受控有限数字。它不拥有计时器、动画、自动递增、easing、完成事件、统计计算或请求。

The root namespace is `u-count-to` and consumes `--u-comp-count-to-*`. The caller owns any progression and must update `modelValue` explicitly.

根命名空间为 `u-count-to`，消费 `--u-comp-count-to-*`。任何数值进展均由调用方拥有，必须显式更新 `modelValue`。
