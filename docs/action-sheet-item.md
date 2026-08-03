# UActionSheetItem component contract / UActionSheetItem 组件契约

`UActionSheetItem` renders caller-owned text or a default slot, optional description, and caller value. When enabled, its native button emits one local `click` payload containing that value and the original event.

`UActionSheetItem` 渲染调用方拥有的文字或默认 slot、可选说明和调用方值。启用时，其原生按钮会 emit 一个包含该值与原始事件的本地 `click` payload。

The component does not inject an action-sheet parent, infer an item index, close an overlay, execute a command, navigate, or create default user-facing copy. A visible item without readable text or a default slot is intentionally omitted.

组件不注入 action-sheet 父级、不推断项目索引、不关闭 overlay、不执行命令、不导航，也不生成默认用户可见文案。可见项目若没有可读文字或默认 slot，会被有意省略。
