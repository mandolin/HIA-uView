# USearch component contract / USearch 组件契约

> Status / 状态：Private pre-release controlled query surface; request and result ownership remain external.
> 状态：私有预发布受控查询表面；请求和结果仍由外部拥有。

`USearch` combines a controlled text input with optional clear and action controls. It emits intent only: no debounce, deduplication, request, cache, navigation, or result generation is built in.

`USearch` 组合受控文字输入及可选的清除和 action 控件。它只回传意图：不内置防抖、去重、请求、缓存、导航或结果生成。

## Public API / 公开 API

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `modelValue` / `placeholder` | `string` | `''` / `''` |
| `disabled` / `focus` | `boolean` | `false` / `false` |
| `showClear` | `boolean` | `true` |
| `clearText` | `string` | `×` |
| `showAction` / `actionText` | `boolean` / `string` | `false` / `''` |

Events are `update:modelValue`, `input`, `change`, `focus`, `blur`, `confirm`, `click`, `search`, and `clear`. `input` and `change` receive the same unmodified candidate string; `click` is only an enabled local observation. `search` carries the current controlled string; no event means that a request succeeded.

事件包括 `update:modelValue`、`input`、`change`、`focus`、`blur`、`confirm`、`click`、`search` 和 `clear`。`input` 和 `change` 接收同一未修改候选字符串；`click` 只是启用状态的本地观察。`search` 携带当前受控字符串；任何事件都不表示请求成功。

The root namespace is `u-search` and consumes `--u-comp-search-*`. Compose a visible label and disclose the chosen query policy in the caller.

根命名空间为 `u-search`，消费 `--u-comp-search-*`。调用方应组合可见标签，并自行披露采用的查询策略。

The native input, clear control, and action control inherit the application font so the composed query surface stays typographically consistent. `USearch` bundles no font and exposes no font token or font-selection prop; font selection remains application-owned.

原生 input、清除控件和 action 控件继承应用字体，使组合查询表面的文字保持一致。`USearch` 不捆绑字体，也不暴露字体 token 或字体选择 prop；字体选择仍由应用拥有。
