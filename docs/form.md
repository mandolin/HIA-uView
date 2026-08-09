# UForm component contract / UForm 组件契约

> Status / 状态：Private pre-release static grouping contract. It is not a validator, model, or backend form engine.
> 状态：私有预发布静态分组契约。它不是校验器、模型或后端表单引擎。

`UForm` supplies a local visual region for slotted fields and exposes explicit `requestSubmit` and `requestReset` methods. It registers no fields, executes no rules, serializes no model, and connects to no backend.

`UForm` 为插槽字段提供局部视觉区域，并暴露显式的 `requestSubmit` 与 `requestReset` 方法。它不注册字段、不执行规则、不序列化模型，也不连接后端。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `disabled` | `boolean` | `false` |
| `labelPosition` | `'top' \| 'left'` | `'top'` |

The component has `submit` and `reset` events, emitted only after the caller explicitly invokes the exposed method while enabled. The caller owns all field values and workflow decisions.

组件有 `submit` 和 `reset` 事件，仅在启用状态下由调用方显式调用暴露方法后触发。所有字段值和流程决策均由调用方拥有。

The current boundary intentionally does not provide upstream-style `resetFields`, field registration, model snapshots, or validator lifecycle. Applications that need restoration keep the original values and request their own controlled writeback.

当前边界有意不提供上游风格的 `resetFields`、字段注册、模型快照或 validator 生命周期。需要恢复的应用应自行保留原始值并请求自己的受控写回。

The root namespace is `u-form` and consumes `--u-comp-form-*`. `disabled` is a region-level visual hint; embedded controls must receive their own disabled props when needed.

根命名空间为 `u-form`，消费 `--u-comp-form-*`。`disabled` 是区域级视觉提示；需要禁用时，嵌入控件仍必须单独传入 disabled 属性。
