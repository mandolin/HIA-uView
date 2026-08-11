# UForm component contract / UForm 组件契约

> Status / 状态：Private pre-release form owner and validation contract. It is not a submission, persistence, request, identity, or backend engine.
> 私有预发布的表单所有者与校验契约。它不是提交、持久化、请求、身份或后端引擎。

`UForm` owns one instance-private field registry for its nearest descendant `UFormItem` components. The application continues to own the `model`, localized rule copy, business workflow, and all writes except an explicitly requested snapshot reset.

`UForm` 为最近后代的 `UFormItem` 维护实例私有字段 registry。应用仍拥有 `model`、本地化规则文字、业务流程以及除显式快照重置以外的全部写入。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 约定 |
| --- | --- | --- | --- |
| `model` | `Record<string, unknown>` | `{}` | Caller-owned current model. Ordinary input components report intent and never write this object directly. / 调用方拥有的当前模型。普通输入组件只报告意图，绝不直接写入此对象。 |
| `rules` | `UFormRules` | `{}` | Rules keyed by an exact dotted/index path or an equivalent safe nested object. / 以精确 dotted/index 路径或等价安全嵌套对象为键的规则。 |
| `disabled` | `boolean` | `false` | Disables the nearest form subtree and suppresses `requestSubmit` and `requestReset`. / 禁用最近表单子树，并抑制 `requestSubmit` 与 `requestReset`。 |
| `labelPosition` | `'top' \| 'left'` | `'top'` | Default field-label position; an item may override it. / 默认字段标签位置；表单项可以覆盖。 |

| Event / 事件 | Payload / 载荷 | Contract / 约定 |
| --- | --- | --- |
| `submit` | none / 无 | Emitted only by enabled `requestSubmit`; it does not imply validation or submission success. / 仅由启用状态的 `requestSubmit` 触发；不表示校验或提交成功。 |
| `reset` | none / 无 | Emitted only by enabled `requestReset`; it does not restore model values. / 仅由启用状态的 `requestReset` 触发；不会恢复模型值。 |

The component ref exposes exactly these methods:

组件 ref 精确暴露下列方法：

| Method / 方法 | Result / 结果 | Contract / 约定 |
| --- | --- | --- |
| `setRules(rules)` | `void` | Replaces rules used by later runs and clears internal validation projections; it does not validate. / 替换后续轮次使用的规则并清除内部校验投影；不执行校验。 |
| `validate(callback?)` | `Promise<boolean>` | Validates all currently registered fields in mount order. The optional callback receives `(valid, freshErrors)`. / 按挂载顺序校验全部当前注册字段；可选 callback 接收 `(valid, freshErrors)`。 |
| `validateField(pathOrPaths, callback?)` | `Promise<boolean>` | Validates matching registered fields; a safe but unregistered selection resolves `true`. / 校验匹配的已注册字段；安全但未注册的选择 resolve `true`。 |
| `clearValidate(pathOrPaths?)` | `void` | Clears all or selected internal validation projections and invalidates in-flight results. / 清除全部或所选内部校验投影，并使在途结果失效。 |
| `resetFields()` | `void` | Restores every registered field's mount snapshot and clears its validation. / 恢复每个已注册字段的挂载快照并清除其校验。 |
| `requestSubmit()` | `void` | Emits only the `submit` intent while enabled; it never calls `validate`. / 启用时仅触发 `submit` 意图；绝不调用 `validate`。 |
| `requestReset()` | `void` | Emits only the `reset` intent while enabled; it never calls `resetFields`. / 启用时仅触发 `reset` 意图；绝不调用 `resetFields`。 |

## Rules and errors / 规则与错误

A rule may declare `required`, `type`, `len`, `min`, `max`, `pattern`, `trigger`, `message`, `validator`, or `asyncValidator`. Built-in `type` is limited to `string`, `number`, `integer`, `boolean`, `array`, and `object`. A trigger is `change`, `blur`, or an array containing those values. Explicit `validate` calls use all valid rules; input notifications use only rules matching their trigger.

规则可声明 `required`、`type`、`len`、`min`、`max`、`pattern`、`trigger`、`message`、`validator` 或 `asyncValidator`。内建 `type` 仅限 `string`、`number`、`integer`、`boolean`、`array` 和 `object`。触发器为 `change`、`blur` 或包含两者的数组。显式 `validate` 使用全部合法规则；输入通知只使用匹配其 trigger 的规则。

Application validators have the fixed signature `(value, context)` and may return a result or a Promise. `context` contains the canonical `field`, conventionally read-only `model`, current `trigger`, and current `rule`. `asyncValidator` takes precedence if a rule declares both validator names. Validators must be direct application functions; script strings, dependency loading, remote execution, and implicit network work are outside the contract.

应用 validator 使用固定签名 `(value, context)`，可返回结果或 Promise。`context` 包含规范 `field`、约定只读的 `model`、当前 `trigger` 与当前 `rule`。一条规则同时声明两个 validator 名称时，`asyncValidator` 优先。validator 必须是应用直接提供的函数；脚本字符串、依赖加载、远程执行和隐式网络工作不属于此契约。

Each failed field returns only its first error as `{ prop, message, ruleIndex, trigger, code }`. The stable codes are `required`, `type`, `len`, `min`, `max`, `pattern`, `invalid-rule`, `validator`, and `validator-exception`. The library generates no localized default message and does not expose a thrown exception's private message; use the caller-owned rule `message` when public copy is required.

每个失败字段只返回首个错误，形状为 `{ prop, message, ruleIndex, trigger, code }`。稳定代码为 `required`、`type`、`len`、`min`、`max`、`pattern`、`invalid-rule`、`validator` 与 `validator-exception`。库不生成本地化默认消息，也不暴露异常中可能含有隐私的 message；需要公开文字时应使用调用方拥有的规则 `message`。

## Ownership and lifecycle / 所有权与生命周期

Field paths accept safe dotted and numeric-index segments. Empty paths, prototype-related segments, missing traversal parents, and other unsafe structures are rejected rather than created. Nested forms use nearest-owner injection, so an inner form never registers its fields with an outer form. Multiple items may use the same path without overwriting one another because registration identity is per component instance.

字段路径接受安全的 dotted 与数字索引段。空路径、原型相关路径段、缺失的遍历父级及其他不安全结构会被拒绝，而不会被创建。嵌套表单采用最近 owner 注入，因此内层表单不会把字段注册到外层。多个表单项可以使用相同路径而不互相覆盖，因为注册身份属于组件实例。

`resetFields` is intentionally distinct from `requestReset`: the former performs the one bounded model write and the latter only reports caller intent. Snapshot restoration applies only to paths that existed when the item registered. Asynchronous runs still resolve to their callers, but a run made stale by clear, reset, path change, owner change, a newer run, or unmount cannot overwrite current validation UI.

`resetFields` 有意区别于 `requestReset`：前者执行唯一受限的模型写入，后者只报告调用方意图。快照恢复只适用于表单项注册时已经存在的路径。异步轮次仍会向其调用者 resolve，但因清除、重置、路径变化、owner 变化、更新轮次或卸载而过期的结果不能覆盖当前校验 UI。

The root namespace is `u-form` and consumes `--u-comp-form-*`. The form creates no toast, route, storage, request, backend payload, or business rule. WCAG 2.2 AA remains the controllable visual target; applications retain responsibility for localized labels, error copy, native accessibility linkage, and platform/device verification.

根命名空间为 `u-form`，消费 `--u-comp-form-*`。表单不创建 toast、路由、存储、请求、后端 payload 或业务规则。WCAG 2.2 AA 仍是可控视觉目标；应用继续负责本地化标签、错误文字、原生无障碍关联以及平台/真机验证。
