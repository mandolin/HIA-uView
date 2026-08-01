# UTag component contract / UTag 组件契约

> Status / 状态：Private pre-release finite-tone text tag.
> 状态：私有预发布有限 tone 文字标签。

`UTag` presents caller text with finite `tone`, `size`, and `shape` values. `click` and `close` report intent; the component never hides itself, resolves categories, or executes arbitrary style input.

`UTag` 使用有限的 `tone`、`size` 和 `shape` 呈现调用方文字。`click` 和 `close` 只回传意图；组件不自行隐藏、不解析分类，也不执行任意样式输入。

The root namespace is `u-tag` and consumes `--u-comp-tag-*`. `visible` and all follow-up workflow remain caller-owned.

根命名空间为 `u-tag`，消费 `--u-comp-tag-*`。`visible` 和全部后续流程仍由调用方拥有。
