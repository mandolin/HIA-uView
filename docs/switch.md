# USwitch component contract / USwitch 组件契约

> Status / 状态：Private pre-release contract for `mp-weixin`; the caller owns the boolean state and all business consequences.
> 状态：`mp-weixin` 私有预发布契约；布尔状态及全部业务后果由调用方拥有。

`USwitch` wraps a native switch and emits a controlled boolean choice. It does not persist, authorize, call a service, or infer a business setting.

`USwitch` 包装原生 switch 并回传受控布尔选择。它不持久化、授权、调用服务，也不推断业务设置。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 约定 |
| --- | --- | --- | --- |
| `modelValue` | `boolean` | `false` | Controlled checked state. / 受控 checked 状态。 |
| `disabled` | `boolean` | `false` | Native disabled state and zero `change` emissions. / 原生禁用状态及零 `change` 事件。 |
| `loading` | `boolean` | `false` | Caller-owned busy guard; it blocks local interaction and exposes busy semantics, but starts no request or service. / 调用方拥有的忙碌 guard；它阻止本地交互并暴露 busy 语义，但不启动请求或 service。 |
| `label` | `string` | `''` | Optional caller-owned adjacent copy. / 可选的调用方拥有的相邻文字。 |

`update:modelValue` and `change` both carry the confirmed boolean value. `disabled` or `loading` keeps both events at zero. The caller decides whether to write it back or begin any workflow.

`update:modelValue` 与 `change` 均携带确认后的布尔值。`disabled` 或 `loading` 时两个事件都保持零次。是否写回或开始任何流程由调用方决定。

The root namespace is `u-switch` and consumes `--u-comp-switch-*` tokens. The acceptance target is WCAG 2.2 AA visual distinction without color alone; platform and assistive-technology behavior remains unverified.

根命名空间为 `u-switch`，消费 `--u-comp-switch-*` token。验收目标是不能只依赖颜色的 WCAG 2.2 AA 视觉区分；平台和辅助技术行为仍未验证。
