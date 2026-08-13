# UCellGroup component contract / UCellGroup 组件契约

> Status / 状态：Private pre-release local information-row container with runtime-tested default-slot projection and package-owned types. / 私有预发布局部信息行容器；默认 slot 投影已有 runtime 测试，类型由 package 自有声明提供。

`UCellGroup` presents an optional caller title and a bordered container for caller-owned row content. It registers, sorts, selects, or disables no child and owns no form, route, request, or submission lifecycle.

`UCellGroup` 呈现可选的调用方标题，并为调用方拥有的信息行内容提供带边界容器。它不注册、不排序、不选择、也不禁用子项，并且不拥有表单、路由、请求或提交生命周期。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 契约 |
| --- | --- | --- | --- |
| `title` | `string` | `''` | Optional visible group title. Empty text creates no title node. / 可选可见分组标题；空文字不创建标题节点。 |
| `bordered` | `boolean` | `true` | Selects the local tokenized boundary only. / 只选择局部 token 化边界。 |

| Slot / 插槽 | Bindings / 绑定 | Contract / 契约 |
| --- | --- | --- |
| `default` | none / 无 | Projects caller content unchanged; no index, value, route, disabled state, or parent registry is injected. / 原样投影调用方内容；不注入 index、value、route、disabled 状态或父级 registry。 |

The component emits no event and exposes no imperative method. Its root consumes `--u-comp-cell-group-*` tokens; child semantics remain caller-owned.

组件不 emit 事件，也不 expose imperative method。根节点消费 `--u-comp-cell-group-*` token；子项语义仍由调用方拥有。

## Migration from uView-Pro 0.6.15 / 从 uView-Pro 0.6.15 迁移

The fixed comparison contains a `title` prop, a `border` prop, and an unbound default slot. HIA's default slot has runtime-tested matching ownership, but the inventory deliberately keeps it `mapped` because the component as a whole is not a drop-in upstream container.

固定比较面包含 `title` prop、`border` prop 和无 binding 的默认 slot。HIA 默认 slot 的内容所有权已具备 runtime 测试，但盘点仍有意保持为 `mapped`，因为整个组件不是可直接替换的上游容器。

| Upstream call site / 上游调用点 | HIA action / HIA 迁移动作 |
| --- | --- |
| `title` | Review the caller copy and keep `title`; same name alone is not a full-component compatibility claim. / 复核调用方文字后保留 `title`；同名不构成完整组件兼容声明。 |
| `border` | Replace deliberately with `bordered`; do not pass `border` and expect it to work. / 明确改为 `bordered`；不要继续传 `border` 并期待生效。 |
| default slot | Keep the children, then verify their own contracts separately. / 保留子项，并分别验证每个子项自身契约。 |
| parent/child registration assumptions | Remove them; HIA injects no registry or inherited state. / 移除这类假设；HIA 不注入 registry 或继承状态。 |

## Examples / 示例

```vue
<u-cell-group title="Contact / 联系方式" :bordered="true">
  <u-cell label="Email / 邮箱" value="team@example.test" />
</u-cell-group>
```

The following migration is incorrect because `border` is not a HIA alias and the group never makes children clickable:

下面的迁移不正确，因为 `border` 不是 HIA alias，且分组绝不会使子项自动可点击：

```vue
<u-cell-group :border="false" @click="openDetails">
  <u-cell label="Profile / 资料" />
</u-cell-group>
```

## Limits and evidence / 限制与证据

Vue runtime tests cover default-slot ownership and local title/border projection. Repository H5 and `mp-weixin` fixtures are compiler evidence only; they are not DevTools, device, accessibility-tree, or cross-platform certification. The component has no list data, child registry, selection, form, navigation, request, persistence, or business behavior.

Vue runtime 测试覆盖默认 slot 所有权和局部标题/边界投影。仓内 H5 与 `mp-weixin` fixture 只提供 compiler 证据；不构成开发者工具、真机、无障碍树或跨端认证。组件没有列表数据、子项 registry、选择、表单、导航、请求、持久化或业务行为。
