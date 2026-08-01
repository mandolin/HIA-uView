# ULoadmore component contract / ULoadmore 组件契约

> Status / 状态：Private pre-release controlled load-more status.
> 状态：私有预发布受控加载更多状态。

`ULoadmore` accepts `status` values `more`, `loading`, `nomore`, and `error`, with caller-provided copy. Only `more` renders a button and emits `loadmore`; the component performs no request, retry, timer, spinner, or paging strategy.

`ULoadmore` 接受 `more`、`loading`、`nomore`、`error` 四种 `status` 和调用方文案。只有 `more` 呈现按钮并 emit `loadmore`；组件不请求、不重试、不计时、不提供 spinner，也不管理分页策略。

The root namespace is `u-loadmore` and consumes `--u-comp-loadmore-*`. The caller owns status transitions and all data loading decisions.

根命名空间为 `u-loadmore`，消费 `--u-comp-loadmore-*`。状态转换和数据加载决策完全由调用方拥有。
