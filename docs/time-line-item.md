# UTimeLineItem component contract / UTimeLineItem 组件契约

> Status / 状态：Private pre-release declarative timeline item.
> 状态：私有预发布声明式时间线项目。

`UTimeLineItem` presents caller title, time text, description, finite visual status, and optional local selection. `isLast` is explicit so the component never inspects or measures sibling items.

`UTimeLineItem` 呈现调用方 title、时间文字、description、有限视觉状态与可选本地选择。`isLast` 显式给出，因此组件从不检查或测量相邻项目。

It does not parse time, order events, navigate, or trigger a workflow. The root namespace is `u-time-line-item` and consumes `--u-comp-time-line-item-*`.

它不解析时间、不排序事件、不导航，也不触发工作流。根命名空间为 `u-time-line-item`，消费 `--u-comp-time-line-item-*`。
