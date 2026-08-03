# USubsection component contract / USubsection 组件契约

> Status / 状态：Private pre-release caller-controlled finite segment selection.
> 状态：私有预发布调用方受控有限区段选择。

`USubsection` presents finite caller items as local tabs. An enabled non-current item emits `update:modelValue` and `change`; the caller decides whether to accept the change, switch content, save a preference, or query data.

`USubsection` 将有限调用方项目呈现为本地 tabs。已启用且非当前项目会 emit `update:modelValue` 与 `change`；调用方决定是否接受变化、切换内容、保存偏好或查询数据。

The root namespace is `u-subsection` and consumes `--u-comp-subsection-*`. It creates no default business segment labels and owns no route or filter semantics.

根命名空间为 `u-subsection`，消费 `--u-comp-subsection-*`。它不创建默认业务区段标签，也不拥有路由或筛选语义。
