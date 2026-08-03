# UCitySelect component contract / UCitySelect 组件契约

`UCitySelect` is a controlled, data-agnostic selector for up to three caller-owned option columns. It projects only finite `label`, `value`, and `disabled` options, then emits `update:modelValue`, `change`, `confirm`, or `close` intent for the application to accept or ignore.

`UCitySelect` 是一个数据无关的受控选择器，最多投影三列调用方拥有的选项。它只投影有限的 `label`、`value` 和 `disabled` 选项，并 emit `update:modelValue`、`change`、`confirm` 或 `close` 意图，供应用决定接受或忽略。

Despite its migration-oriented name, it contains no city or region dataset, geolocation, address model, search, API request, persistence, popup ownership, or location-derived default. The caller supplies all option data and localized copy, including title and footer controls.

尽管名称面向迁移，它不包含城市或地区数据集、定位、地址模型、搜索、API 请求、持久化、popup 所有权或基于位置的默认值。调用方提供全部选项数据和本地化文案，包括标题与 footer 控制项。
