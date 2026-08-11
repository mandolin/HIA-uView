# USearch component contract / USearch 组件契约

> Status / 状态：Private pre-release controlled query and local-action contract with standalone and form-composed runtime coverage.
> 具有独立与表单组合 runtime 覆盖的私有预发布受控查询与局部操作契约。

`USearch` reports controlled query edits plus explicit clear and search intents. It performs no debounce, request, cache, result generation, navigation, analytics, or search-policy decision.

`USearch` 报告受控查询编辑以及显式 clear 与 search 意图。它不执行防抖、请求、缓存、结果生成、导航、分析或搜索策略决策。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 约定 |
| --- | --- | --- | --- |
| `modelValue` | `string` | `''` | Caller-owned controlled query. / 调用方拥有的受控 query。 |
| `placeholder` | `string` | `''` | Caller-owned hint, not a visible label. / 调用方拥有的提示，不是可见标签。 |
| `disabled` | `boolean` | `false` | Local unavailable state, OR-combined with the nearest `UFormItem`. / 局部不可用状态，与最近 `UFormItem` 按 OR 合并。 |
| `focus` | `boolean` | `false` | Caller-controlled native focus input. / 调用方控制的原生 focus 输入。 |
| `showClear` / `clearText` | `boolean` / `string` | `true` / `'×'` | Clear-control visibility and caller-localized copy. / clear 控件可见性与调用方本地化文字。 |
| `showAction` / `actionText` | `boolean` / `string` | `false` / `''` | Search-action visibility and caller-localized copy. / search action 可见性与调用方本地化文字。 |

| Event / 事件 | Payload / 载荷 | Contract / 约定 |
| --- | --- | --- |
| `update:modelValue` | `value: string` | First value intent for input or clear. / 输入或 clear 的首个值意图。 |
| `input` / `change` | `value: string` | Same unmodified candidate; clear emits both with `''`. / 同一未经修改候选；clear 以 `''` 触发两者。 |
| `focus` / `blur` / `confirm` | platform event / 平台事件 | Original enabled observations. / 启用状态的原始观察。 |
| `click` | platform event / 平台事件 | Original root click observation; control clicks stop propagation. / 原始根点击观察；控件点击会阻止冒泡。 |
| `search` | `value: string` | Current controlled query, without starting a request. / 当前受控 query，不启动请求。 |
| `clear` | none / 无 | Emitted after empty value intents, without clearing result/history/cache state. / 在空值意图后触发，不清除结果、历史或缓存状态。 |

Only string `detail.value` or `target.value` candidates are accepted; malformed events emit nothing. Effective `disabled` suppresses input, observation, clear, action, and root-click events. `USearch` has no public `readonly` prop, but it inherits `readonly` from the nearest `UFormItem`: inherited readonly blocks input and clear value changes while allowing action and actual observation events.

只接受字符串形式的 `detail.value` 或 `target.value` 候选；畸形事件保持零事件。有效 `disabled` 抑制输入、观察、clear、action 与根点击事件。`USearch` 没有公开 `readonly` prop，但会继承最近 `UFormItem` 的 `readonly`：继承只读会阻止输入与 clear 值变化，同时允许 action 与实际观察事件。

An accepted edit emits `update:modelValue`, `input`, and `change`; clear uses the same sequence with an empty string and then emits `clear`. Inside a `UFormItem`, both paths wait for caller writeback before notifying matching `change` rules. Enabled blur notifies matching `blur` rules after the event reaches the caller. Neither `confirm` nor `search` means validation, request, or backend success.

被接受的编辑依次触发 `update:modelValue`、`input` 与 `change`；clear 以空字符串使用同一序列，再触发 `clear`。位于 `UFormItem` 内时，两条路径都会等待调用方写回，再通知匹配的 `change` 规则。启用状态的 blur 会在事件到达调用方后通知匹配的 `blur` 规则。`confirm` 与 `search` 都不表示校验、请求或后端成功。

The root namespace is `u-search` and consumes `--u-comp-search-*`. Compose a meaningful visible label and disclose the caller's query policy. WCAG 2.2 AA remains the controllable visual target, while keyboard, screen-reader, accessibility-tree, IME, DevTools, and device behavior require platform verification.

根命名空间为 `u-search`，消费 `--u-comp-search-*`。应组合有意义的可见标签，并披露调用方查询策略。WCAG 2.2 AA 仍是可控视觉目标，而键盘、读屏、无障碍树、输入法、开发者工具与真机行为需要平台验证。
