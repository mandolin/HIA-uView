# UTimeLine component contract / UTimeLine 组件契约

> Status / 状态：Private pre-release local timeline container.
> 状态：私有预发布本地时间线容器。

`UTimeLine` is a local list container for caller-composed `UTimeLineItem` or other slot content. The caller owns item order, copy, time formatting, filtering, and data source.

`UTimeLine` 是用于调用方组合 `UTimeLineItem` 或其他 slot 内容的本地列表容器。调用方拥有项目顺序、文案、时间格式、筛选与数据来源。

It does not parse dates, sort, request, or build an event stream. The root namespace is `u-time-line` and consumes `--u-comp-time-line-*`.

它不解析日期、不排序、不请求，也不构建事件流。根命名空间为 `u-time-line`，消费 `--u-comp-time-line-*`。
