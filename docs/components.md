# Current component index / 当前组件索引

HIA-uView currently exposes the following **private, pre-release** UniApp Vue 3 component contracts for the `mp-weixin` profile. The table is a navigation index, not a published npm API or a promise of automatic registration, device behavior, accessibility-tree support, App/H5 support, or full upstream compatibility.

HIA-uView 当前为 `mp-weixin` profile 提供下列**私有、预发布**的 UniApp Vue 3 组件契约。此表只是导航索引，并非已发布 npm API，也不承诺自动注册、真机行为、无障碍树支持、App/H5 支持或对任何上游的完全兼容。

| Template name / 模板名称 | Named export / 命名导出 | Contract / 契约 | Bounded role / 受限职责 |
| --- | --- | --- | --- |
| `u-button` | `UButton` | [UButton](button.md) | Caller-controlled local action intent / 调用方受控的本地操作意图 |
| `u-cell` | `UCell` | [UCell](cell.md) | Text row and click intent / 文字行与 click 意图 |
| `u-checkbox` | `UCheckbox` | [UCheckbox](checkbox.md) | Controlled boolean/membership intent / 受控布尔或成员选择意图 |
| `u-checkbox-group` | `UCheckboxGroup` | [UCheckboxGroup](checkbox-group.md) | Controlled string-set coordination / 受控字符串集合协调 |
| `u-empty` | `UEmpty` | [UEmpty](empty.md) | Caller-owned empty projection / 调用方拥有的空态投影 |
| `u-field` | `UField` | [UField](field.md) | Field layout without form ownership / 不拥有表单的字段布局 |
| `u-form` | `UForm` | [UForm](form.md) | Static form grouping and explicit intents / 静态表单分组与显式意图 |
| `u-form-item` | `UFormItem` | [UFormItem](form-item.md) | Label/help/message presentation / 标签、帮助与消息呈现 |
| `u-icon` | `UIcon` | [UIcon](icon.md) | Text-symbol or slot icon placeholder / 文字符号或 slot 图标占位 |
| `u-image` | `UImage` | [UImage](image.md) | Caller-owned native image projection / 调用方拥有的原生图片投影 |
| `u-avatar` | `UAvatar` | [UAvatar](avatar.md) | Image or initials placeholder / 图片或 initials 占位 |
| `u-input` | `UInput` | [UInput](input.md) | Controlled string input intent / 受控字符串输入意图 |
| `u-modal` | `UModal` | [UModal](modal.md) | Controlled confirmation/cancel intent / 受控确认或取消意图 |
| `u-nav-bar` | `UNavBar` | [UNavBar](nav-bar.md) | Title and navigation/action intent / 标题与导航或操作意图 |
| `u-notice` | `UNotice` | [UNotice](notice.md) | Local feedback presentation / 本地反馈呈现 |
| `u-number-box` | `UNumberBox` | [UNumberBox](number-box.md) | Bounded local numeric intent / 受边界保护的本地数值意图 |
| `u-tag` | `UTag` | [UTag](tag.md) | Finite-tone text tag / 有限 tone 文字标签 |
| `u-badge` | `UBadge` | [UBadge](badge.md) | Controlled text or dot badge / 受控文字或 dot 徽标 |
| `u-divider` | `UDivider` | [UDivider](divider.md) | Local line and slot separation / 局部线条与 slot 分隔 |
| `u-count-to` | `UCountTo` | [UCountTo](count-to.md) | Synchronous formatted number / 同步格式化数字 |
| `u-line-progress` | `ULineProgress` | [ULineProgress](line-progress.md) | Static bounded progress projection / 静态受边界保护进度投影 |
| `u-action-sheet` | `UActionSheet` | [UActionSheet](action-sheet.md) | Caller-declared local action list / 调用方声明的局部操作列表 |
| `u-loading-page` | `ULoadingPage` | [ULoadingPage](loading-page.md) | Static page loading presentation / 静态页面 loading 呈现 |
| `u-pagination` | `UPagination` | [UPagination](pagination.md) | Controlled finite page selection / 受控有限页码选择 |
| `u-popup` | `UPopup` | [UPopup](popup.md) | Controlled local overlay / 受控局部浮层 |
| `u-tabbar` | `UTabbar` | [UTabbar](tabbar.md) | Local bottom tab selection / 局部底部标签选择 |
| `u-tabs` | `UTabs` | [UTabs](tabs.md) | Controlled tab strip / 受控标签栏 |
| `u-steps` | `USteps` | [USteps](steps.md) | Declarative finite step sequence / 声明式有限步骤序列 |
| `u-toast` | `UToast` | [UToast](toast.md) | Static controlled feedback / 静态受控反馈 |
| `u-radio` | `URadio` | [URadio](radio.md) | Controlled single-choice intent / 受控单选意图 |
| `u-radio-group` | `URadioGroup` | [URadioGroup](radio-group.md) | Controlled single-choice coordination / 受控单选协调 |
| `u-rate` | `URate` | [URate](rate.md) | Text-symbol integer selection / 文字符号整数选择 |
| `u-search` | `USearch` | [USearch](search.md) | Controlled query intent / 受控查询意图 |
| `u-stack` | `UStack` | [UStack](stack.md) | Slot layout primitive / 插槽布局原语 |
| `u-switch` | `USwitch` | [USwitch](switch.md) | Controlled boolean choice / 受控布尔选择 |
| `u-textarea` | `UTextarea` | [UTextarea](textarea.md) | Controlled multiline input / 受控多行输入 |
| `u-validation-message` | `UValidationMessage` | [UValidationMessage](validation-message.md) | Caller-declared validation presentation / 调用方声明的校验呈现 |

Use named imports or the explicit `UView` plugin as documented in [runtime consumption](runtime-consumption.md). Import `style.css` explicitly from application-owned global style setup. The current [compatibility profile](compatibility.md), [examples](examples.md), and [migration guidance](migration-from-uview.md) state the evidence and limits that apply to this index.

按 [runtime consumption](runtime-consumption.md) 所述使用命名导入或显式 `UView` plugin，并从应用拥有的全局样式设置显式导入 `style.css`。当前 [compatibility profile](compatibility.md)、[examples](examples.md) 与 [migration guidance](migration-from-uview.md) 说明此索引适用的证据和限制。
