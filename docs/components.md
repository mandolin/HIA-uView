# Current component index / 当前组件索引

HIA-uView currently exposes the following **private, pre-release** UniApp Vue 3 component contracts for the `mp-weixin` profile. The table is a navigation index, not a published npm API or a promise of automatic registration, device behavior, accessibility-tree support, App/H5 support, or full upstream compatibility.

HIA-uView 当前为 `mp-weixin` profile 提供下列**私有、预发布**的 UniApp Vue 3 组件契约。此表只是导航索引，并非已发布 npm API，也不承诺自动注册、真机行为、无障碍树支持、App/H5 支持或对任何上游的完全兼容。

| Template name / 模板名称 | Named export / 命名导出 | Contract / 契约 | Bounded role / 受限职责 |
| --- | --- | --- | --- |
| `u-button` | `UButton` | [UButton](button.md) | Caller-controlled local action intent / 调用方受控的本地操作意图 |
| `u-action-sheet` | `UActionSheet` | [UActionSheet](action-sheet.md) | Caller-declared local action list / 调用方声明的局部操作列表 |
| `u-alert-tips` | `UAlertTips` | [UAlertTips](alert-tips.md) | Finite local feedback strip / 有限局部提示条 |
| `u-calendar` | `UCalendar` | [UCalendar](calendar.md) | Controlled local date selection / 受控本地日期选择 |
| `u-card` | `UCard` | [UCard](card.md) | Neutral surface and slots / 中性表面与插槽 |
| `u-cell` | `UCell` | [UCell](cell.md) | Text row and click intent / 文字行与 click 意图 |
| `u-cell-group` | `UCellGroup` | [UCellGroup](cell-group.md) | Information-row group / 信息行分组 |
| `u-checkbox` | `UCheckbox` | [UCheckbox](checkbox.md) | Controlled boolean/membership intent / 受控布尔或成员选择意图 |
| `u-checkbox-group` | `UCheckboxGroup` | [UCheckboxGroup](checkbox-group.md) | Controlled string-set coordination / 受控字符串集合协调 |
| `u-col` | `UCol` | [UCol](col.md) | Bounded 24-grid column / 受限 24 栅格列 |
| `u-collapse` | `UCollapse` | [UCollapse](collapse.md) | Controlled local disclosure context / 受控局部折叠 context |
| `u-collapse-item` | `UCollapseItem` | [UCollapseItem](collapse-item.md) | Controlled disclosure item / 受控折叠子项 |
| `u-count-to` | `UCountTo` | [UCountTo](count-to.md) | Synchronous formatted number / 同步格式化数字 |
| `u-dropdown` | `UDropdown` | [UDropdown](dropdown.md) | Local controlled selection context / 局部受控选择 context |
| `u-dropdown-item` | `UDropdownItem` | [UDropdownItem](dropdown-item.md) | Finite dropdown option / 有限下拉选项 |
| `u-divider` | `UDivider` | [UDivider](divider.md) | Local line and slot separation / 局部线条与 slot 分隔 |
| `u-empty` | `UEmpty` | [UEmpty](empty.md) | Caller-owned empty projection / 调用方拥有的空态投影 |
| `u-field` | `UField` | [UField](field.md) | Field layout without form ownership / 不拥有表单的字段布局 |
| `u-form` | `UForm` | [UForm](form.md) | Static form grouping and explicit intents / 静态表单分组与显式意图 |
| `u-form-item` | `UFormItem` | [UFormItem](form-item.md) | Label/help/message presentation / 标签、帮助与消息呈现 |
| `u-gap` | `UGap` | [UGap](gap.md) | Local vertical spacing / 局部垂直间距 |
| `u-grid` | `UGrid` | [UGrid](grid.md) | Controlled local grid container / 受控本地网格容器 |
| `u-grid-item` | `UGridItem` | [UGridItem](grid-item.md) | Declarative grid item / 声明式网格项目 |
| `u-icon` | `UIcon` | [UIcon](icon.md) | Text-symbol or slot icon placeholder / 文字符号或 slot 图标占位 |
| `u-image` | `UImage` | [UImage](image.md) | Caller-owned native image projection / 调用方拥有的原生图片投影 |
| `u-avatar` | `UAvatar` | [UAvatar](avatar.md) | Image or initials placeholder / 图片或 initials 占位 |
| `u-badge` | `UBadge` | [UBadge](badge.md) | Controlled text or dot badge / 受控文字或 dot 徽标 |
| `u-input` | `UInput` | [UInput](input.md) | Controlled string input intent / 受控字符串输入意图 |
| `u-line` | `ULine` | [ULine](line.md) | Local divider primitive / 局部分隔原语 |
| `u-line-progress` | `ULineProgress` | [ULineProgress](line-progress.md) | Static bounded progress projection / 静态受边界保护进度投影 |
| `u-link` | `ULink` | [ULink](link.md) | Link-like text without href / 无 href 的链接样式文字 |
| `u-list` | `UList` | [UList](list.md) | Finite local list rows / 有限局部列表行 |
| `u-loadmore` | `ULoadmore` | [ULoadmore](loadmore.md) | Controlled load-more status / 受控加载更多状态 |
| `u-loading-page` | `ULoadingPage` | [ULoadingPage](loading-page.md) | Static page loading presentation / 静态页面 loading 呈现 |
| `u-modal` | `UModal` | [UModal](modal.md) | Controlled confirmation/cancel intent / 受控确认或取消意图 |
| `u-nav-bar` | `UNavBar` | [UNavBar](nav-bar.md) | Title and navigation/action intent / 标题与导航或操作意图 |
| `u-notice` | `UNotice` | [UNotice](notice.md) | Local feedback presentation / 本地反馈呈现 |
| `u-number-box` | `UNumberBox` | [UNumberBox](number-box.md) | Bounded local numeric intent / 受边界保护的本地数值意图 |
| `u-pagination` | `UPagination` | [UPagination](pagination.md) | Controlled finite page selection / 受控有限页码选择 |
| `u-picker` | `UPicker` | [UPicker](picker.md) | Controlled finite option selection / 受控有限选项选择 |
| `u-popup` | `UPopup` | [UPopup](popup.md) | Controlled local overlay / 受控局部浮层 |
| `u-read-more` | `UReadMore` | [UReadMore](read-more.md) | Controlled expand/collapse projection / 受控展开收起投影 |
| `u-radio` | `URadio` | [URadio](radio.md) | Controlled single-choice intent / 受控单选意图 |
| `u-radio-group` | `URadioGroup` | [URadioGroup](radio-group.md) | Controlled single-choice coordination / 受控单选协调 |
| `u-rate` | `URate` | [URate](rate.md) | Text-symbol integer selection / 文字符号整数选择 |
| `u-row` | `URow` | [URow](row.md) | Flex-row layout primitive / flex 行布局原语 |
| `u-section` | `USection` | [USection](section.md) | Section heading and action / 区块标题与 action |
| `u-search` | `USearch` | [USearch](search.md) | Controlled query intent / 受控查询意图 |
| `u-scroll-list` | `UScrollList` | [UScrollList](scroll-list.md) | CSS overflow horizontal list / CSS overflow 横向列表 |
| `u-select` | `USelect` | [USelect](select.md) | Finite option selection / 有限选项选择 |
| `u-skeleton` | `USkeleton` | [USkeleton](skeleton.md) | Static placeholder projection / 静态占位投影 |
| `u-slider` | `USlider` | [USlider](slider.md) | Bounded numeric input / 受边界保护数值输入 |
| `u-stack` | `UStack` | [UStack](stack.md) | Slot layout primitive / 插槽布局原语 |
| `u-steps` | `USteps` | [USteps](steps.md) | Declarative finite step sequence / 声明式有限步骤序列 |
| `u-sticky` | `USticky` | [USticky](sticky.md) | CSS-only sticky projection / 仅 CSS 吸顶投影 |
| `u-swipe-action` | `USwipeAction` | [USwipeAction](swipe-action.md) | Explicit local action slot / 显式局部操作槽 |
| `u-swiper` | `USwiper` | [USwiper](swiper.md) | Static slide deck / 静态 slide deck |
| `u-switch` | `USwitch` | [USwitch](switch.md) | Controlled boolean choice / 受控布尔选择 |
| `u-tabs` | `UTabs` | [UTabs](tabs.md) | Controlled tab strip / 受控标签栏 |
| `u-tabbar` | `UTabbar` | [UTabbar](tabbar.md) | Local bottom tab selection / 局部底部标签选择 |
| `u-tag` | `UTag` | [UTag](tag.md) | Finite-tone text tag / 有限 tone 文字标签 |
| `u-text` | `UText` | [UText](text.md) | Finite text presentation / 有限文字呈现 |
| `u-textarea` | `UTextarea` | [UTextarea](textarea.md) | Controlled multiline input / 受控多行输入 |
| `u-toast` | `UToast` | [UToast](toast.md) | Static controlled feedback / 静态受控反馈 |
| `u-validation-message` | `UValidationMessage` | [UValidationMessage](validation-message.md) | Caller-declared validation presentation / 调用方声明的校验呈现 |
| `u-navbar` | `UNavbar` | [UNavbar](navbar.md) | Caller-controlled navigation presentation and intent / 调用方受控的导航呈现与意图 |
| `u-status-bar` | `UStatusBar` | [UStatusBar](status-bar.md) | Caller-declared system-area spacer / 调用方声明的系统区域间距 |
| `u-safe-bottom` | `USafeBottom` | [USafeBottom](safe-bottom.md) | Caller-declared bottom-safe spacer / 调用方声明的底部安全间距 |
| `u-back-top` | `UBackTop` | [UBackTop](back-top.md) | Caller-controlled return-to-top intent / 调用方受控的返回顶部意图 |
| `u-fab` | `UFab` | [UFab](fab.md) | Caller-controlled floating-action intent / 调用方受控的浮动操作意图 |
| `u-cell-item` | `UCellItem` | [UCellItem](cell-item.md) | Information row with explicit click intent / 具有显式 click 意图的信息行 |
| `u-loading` | `ULoading` | [ULoading](loading.md) | Local loading presentation / 局部加载呈现 |
| `u-mask` | `UMask` | [UMask](mask.md) | Caller-controlled local mask / 调用方受控的局部遮罩 |
| `u-loading-popup` | `ULoadingPopup` | [ULoadingPopup](loading-popup.md) | Controlled loading-mask composition / 受控加载遮罩组合 |
| `u-no-network` | `UNoNetwork` | [UNoNetwork](no-network.md) | Caller-declared unavailable-state projection / 调用方声明的不可用状态投影 |
| `u-notice-bar` | `UNoticeBar` | [UNoticeBar](notice-bar.md) | Local notice-strip presentation / 局部通知条呈现 |
| `u-top-tips` | `UTopTips` | [UTopTips](top-tips.md) | Caller-controlled top feedback / 调用方受控的顶部反馈 |
| `u-transition` | `UTransition` | [UTransition](transition.md) | Finite CSS transition wrapper / 有限 CSS transition 包装器 |
| `u-config-provider` | `UConfigProvider` | [UConfigProvider](config-provider.md) | Finite theme-density subtree scope / 有限主题密度子树范围 |
| `u-root-portal` | `URootPortal` | [URootPortal](root-portal.md) | Same-tree overlay-root wrapper / 同树 overlay-root 包装器 |

The index currently contains 80 declared component contracts. `u-navbar` and `u-notice-bar` are separate, bounded APIs; they do not alias the earlier `u-nav-bar` or `u-notice` contracts. Use named imports or the explicit `UView` plugin as documented in [runtime consumption](runtime-consumption.md). Import `style.css` explicitly from application-owned global style setup. The current [compatibility profile](compatibility.md), [examples](examples.md), and [migration guidance](migration-from-uview.md) state the evidence and limits that apply to this index.

该索引当前包含 80 个已声明的组件契约。`u-navbar` 与 `u-notice-bar` 是独立、受限的 API，不是既有 `u-nav-bar` 或 `u-notice` 契约的别名。按 [runtime consumption](runtime-consumption.md) 所述使用命名导入或显式 `UView` plugin，并从应用拥有的全局样式设置显式导入 `style.css`。当前 [compatibility profile](compatibility.md)、[examples](examples.md) 与 [migration guidance](migration-from-uview.md) 说明此索引适用的证据和限制。
