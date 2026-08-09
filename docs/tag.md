# UTag component contract / UTag 组件契约

> Status / 状态：Private pre-release finite-tone text tag.
> 状态：私有预发布有限 tone 文字标签。

`UTag` presents caller string/number text with finite `tone`, `size`, and `shape` values. `click` and `close` report intent; the component never resolves categories, executes arbitrary style input, or changes caller state itself.

`UTag` 使用有限的 `tone`、`size` 和 `shape` 呈现调用方 string/number 文字。`click` 和 `close` 只回传意图；组件不解析分类、不执行任意样式输入，也不自行改变调用方状态。

The root namespace is `u-tag` and consumes `--u-comp-tag-*`. `show` is the migration visibility input and the existing HIA `visible` input remains supported: both default to `true`, and either explicit `false` hides the local tag. `disabled` accepts `boolean | string` and only blocks local `click`/`close` intent; it is not authorization. Events and the default-slot migration surface remain bounded mappings rather than complete upstream equivalence.

根命名空间为 `u-tag`，消费 `--u-comp-tag-*`。`show` 是迁移可见性输入，既有 HIA `visible` 输入继续受支持：二者默认均为 `true`，任一显式 `false` 都会隐藏本地标签。`disabled` 接受 `boolean | string`，只阻止本地 `click`/`close` intent；它不是授权。事件和 default-slot 迁移表面仍是有界 mapping，而不是完整上游等价。
