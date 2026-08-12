# Current component index / 当前组件索引

HIA-uView currently exposes the following **private, pre-release** UniApp Vue 3 component contracts for the `mp-weixin` profile. The table is a navigation index, not a published npm API or a promise of automatic registration, device behavior, accessibility-tree support, App/H5 support, or full upstream compatibility.

HIA-uView 当前为 `mp-weixin` profile 提供下列**私有、预发布**的 UniApp Vue 3 组件契约。此表只是导航索引，并非已发布 npm API，也不承诺自动注册、真机行为、无障碍树支持、App/H5 支持或对任何上游的完全兼容。

`UToast` and `UModal` may additionally act as explicitly opted-in hosts for caller-owned [feedback scopes](feedback-services.md). Those composable services are not extra components, global singletons, page discovery, or business-framework APIs.

`UToast` 与 `UModal` 还可作为调用方拥有的[反馈 scope](feedback-services.md) 的显式 opt-in host。这些 composable service 不是额外组件、全局 singleton、页面发现或业务框架 API。

| Template name / 模板名称 | Named export / 命名导出 | Contract / 契约 | Bounded role / 受限职责 |
| --- | --- | --- | --- |
| `u-button` | `UButton` | [UButton](button.md) | Caller-controlled local action intent / 调用方受控的本地操作意图 |
| `u-action-sheet` | `UActionSheet` | [UActionSheet](action-sheet.md) | Caller-declared local action list / 调用方声明的局部操作列表 |
| `u-action-sheet-item` | `UActionSheetItem` | [UActionSheetItem](action-sheet-item.md) | Caller-owned action-sheet item intent / 调用方拥有的 action-sheet 项目意图 |
| `u-alert-tips` | `UAlertTips` | [UAlertTips](alert-tips.md) | Finite local feedback strip / 有限局部提示条 |
| `u-calendar` | `UCalendar` | [UCalendar](calendar.md) | Strict local Gregorian date projection and selection / 严格本地 Gregorian 日期投影与选择 |
| `u-card` | `UCard` | [UCard](card.md) | Neutral surface and slots / 中性表面与插槽 |
| `u-cell` | `UCell` | [UCell](cell.md) | Text row and click intent / 文字行与 click 意图 |
| `u-car-keyboard` | `UCarKeyboard` | [UCarKeyboard](car-keyboard.md) | Caller-owned finite key rows / 调用方拥有的有限键行 |
| `u-city-select` | `UCitySelect` | [UCitySelect](city-select.md) | Caller-owned finite column selection / 调用方拥有的有限列选择 |
| `u-circle-progress` | `UCircleProgress` | [UCircleProgress](circle-progress.md) | Caller-controlled circular numeric projection / 调用方受控圆形数值投影 |
| `u-cell-group` | `UCellGroup` | [UCellGroup](cell-group.md) | Information-row group / 信息行分组 |
| `u-checkbox` | `UCheckbox` | [UCheckbox](checkbox.md) | Controlled boolean/membership intent / 受控布尔或成员选择意图 |
| `u-checkbox-group` | `UCheckboxGroup` | [UCheckboxGroup](checkbox-group.md) | Controlled string/number membership with finite max / 具有有限 max 的受控字符串/数字成员关系 |
| `u-col` | `UCol` | [UCol](col.md) | Bounded 24-grid column / 受限 24 栅格列 |
| `u-collapse` | `UCollapse` | [UCollapse](collapse.md) | Controlled local disclosure context / 受控局部折叠 context |
| `u-collapse-item` | `UCollapseItem` | [UCollapseItem](collapse-item.md) | Controlled disclosure item / 受控折叠子项 |
| `u-column-notice` | `UColumnNotice` | [UColumnNotice](column-notice.md) | Controlled current vertical notice / 受控当前纵向 notice |
| `u-count-to` | `UCountTo` | [UCountTo](count-to.md) | Synchronous formatted number / 同步格式化数字 |
| `u-count-down` | `UCountDown` | [UCountDown](count-down.md) | Static caller remaining-time projection / 静态调用方剩余时间投影 |
| `u-dropdown` | `UDropdown` | [UDropdown](dropdown.md) | Legacy selection and instance-local named registry / legacy 选择与实例局部 named registry |
| `u-dropdown-item` | `UDropdownItem` | [UDropdownItem](dropdown-item.md) | Legacy item or caller-owned options panel / legacy item 或调用方拥有的 options panel |
| `u-divider` | `UDivider` | [UDivider](divider.md) | Local line and slot separation / 局部线条与 slot 分隔 |
| `u-empty` | `UEmpty` | [UEmpty](empty.md) | Caller-owned empty projection / 调用方拥有的空态投影 |
| `u-field` | `UField` | [UField](field.md) | Built-in controlled input or caller-owned slot field / 内建受控输入或调用方自有 slot 字段 |
| `u-form` | `UForm` | [UForm](form.md) | Private field registry and validation orchestration / 私有字段 registry 与校验编排 |
| `u-form-item` | `UFormItem` | [UFormItem](form-item.md) | Field lifecycle, rules, snapshot, and message projection / 字段生命周期、规则、快照与消息投影 |
| `u-full-screen` | `UFullScreen` | [UFullScreen](full-screen.md) | Caller-controlled full-viewport sheet / 调用方受控全视口 sheet |
| `u-gap` | `UGap` | [UGap](gap.md) | Local vertical spacing / 局部垂直间距 |
| `u-grid` | `UGrid` | [UGrid](grid.md) | Controlled local grid container / 受控本地网格容器 |
| `u-grid-item` | `UGridItem` | [UGridItem](grid-item.md) | Declarative grid item / 声明式网格项目 |
| `u-icon` | `UIcon` | [UIcon](icon.md) | Text-symbol or slot icon placeholder / 文字符号或 slot 图标占位 |
| `u-index-anchor` | `UIndexAnchor` | [UIndexAnchor](index-anchor.md) | Caller-controlled index anchor intent / 调用方受控索引锚点意图 |
| `u-index-list` | `UIndexList` | [UIndexList](index-list.md) | Finite index-group projection / 有限索引组投影 |
| `u-image` | `UImage` | [UImage](image.md) | Caller-owned native image projection / 调用方拥有的原生图片投影 |
| `u-avatar` | `UAvatar` | [UAvatar](avatar.md) | Image or initials placeholder / 图片或 initials 占位 |
| `u-avatar-cropper` | `UAvatarCropper` | [UAvatarCropper](avatar-cropper.md) | Caller-owned crop geometry intent / 调用方拥有的裁剪几何意图 |
| `u-badge` | `UBadge` | [UBadge](badge.md) | Controlled text or dot badge / 受控文字或 dot 徽标 |
| `u-input` | `UInput` | [UInput](input.md) | Controlled string input with inherited form guards / 继承表单 guard 的受控字符串输入 |
| `u-lazy-load` | `ULazyLoad` | [ULazyLoad](lazy-load.md) | Caller-controlled deferred image projection / 调用方受控延迟图片投影 |
| `u-keyboard` | `UKeyboard` | [UKeyboard](keyboard.md) | Controlled local keyboard overlay / 受控局部键盘 overlay |
| `u-line` | `ULine` | [ULine](line.md) | Local divider primitive / 局部分隔原语 |
| `u-line-progress` | `ULineProgress` | [ULineProgress](line-progress.md) | Static bounded progress projection / 静态受边界保护进度投影 |
| `u-link` | `ULink` | [ULink](link.md) | Link-like text without href / 无 href 的链接样式文字 |
| `u-list` | `UList` | [UList](list.md) | Finite local list rows / 有限局部列表行 |
| `u-loadmore` | `ULoadmore` | [ULoadmore](loadmore.md) | Controlled load-more status / 受控加载更多状态 |
| `u-loading-page` | `ULoadingPage` | [ULoadingPage](loading-page.md) | Static page loading presentation / 静态页面 loading 呈现 |
| `u-modal` | `UModal` | [UModal](modal.md) | Controlled confirmation/cancel intent / 受控确认或取消意图 |
| `u-message-input` | `UMessageInput` | [UMessageInput](message-input.md) | Controlled fixed-length input projection / 受控固定长度输入投影 |
| `u-nav-bar` | `UNavBar` | [UNavBar](nav-bar.md) | Title and navigation/action intent / 标题与导航或操作意图 |
| `u-notice` | `UNotice` | [UNotice](notice.md) | Local feedback presentation / 本地反馈呈现 |
| `u-number-box` | `UNumberBox` | [UNumberBox](number-box.md) | Decimal-safe bounded numeric intent / 十进制安全的受边界数值意图 |
| `u-number-keyboard` | `UNumberKeyboard` | [UNumberKeyboard](number-keyboard.md) | Caller-owned finite key intent / 调用方拥有的有限键意图 |
| `u-pagination` | `UPagination` | [UPagination](pagination.md) | Controlled finite page selection / 受控有限页码选择 |
| `u-picker` | `UPicker` | [UPicker](picker.md) | Controlled finite single-/multi-column draft and confirmation / 受控有限单列/多列草稿与确认 |
| `u-popup` | `UPopup` | [UPopup](popup.md) | Controlled local overlay / 受控局部浮层 |
| `u-read-more` | `UReadMore` | [UReadMore](read-more.md) | Controlled expand/collapse projection / 受控展开收起投影 |
| `u-radio` | `URadio` | [URadio](radio.md) | Controlled single-choice intent / 受控单选意图 |
| `u-radio-group` | `URadioGroup` | [URadioGroup](radio-group.md) | Controlled single-choice coordination / 受控单选协调 |
| `u-rate` | `URate` | [URate](rate.md) | Caller-controlled integer symbol level with current alias / 具有 current alias 的调用方受控整数符号级别 |
| `u-row` | `URow` | [URow](row.md) | Flex-row layout primitive / flex 行布局原语 |
| `u-row-notice` | `URowNotice` | [URowNotice](row-notice.md) | Controlled current horizontal notice / 受控当前横向 notice |
| `u-section` | `USection` | [USection](section.md) | Section heading and action / 区块标题与 action |
| `u-search` | `USearch` | [USearch](search.md) | Controlled query, clear/search intent, and form notification / 受控查询、clear/search 意图与表单通知 |
| `u-scroll-list` | `UScrollList` | [UScrollList](scroll-list.md) | CSS overflow horizontal list / CSS overflow 横向列表 |
| `u-select` | `USelect` | [USelect](select.md) | Finite inline immediate/confirm selection / 有限 inline 即时/确认选择 |
| `u-skeleton` | `USkeleton` | [USkeleton](skeleton.md) | Static placeholder projection / 静态占位投影 |
| `u-slider` | `USlider` | [USlider](slider.md) | Min-relative stepped native numeric intent / 相对 min 的 stepped 原生数值意图 |
| `u-stack` | `UStack` | [UStack](stack.md) | Slot layout primitive / 插槽布局原语 |
| `u-steps` | `USteps` | [USteps](steps.md) | Declarative finite step sequence / 声明式有限步骤序列 |
| `u-step` | `UStep` | [UStep](step.md) | Declarative single-step projection / 声明式单步骤投影 |
| `u-sticky` | `USticky` | [USticky](sticky.md) | CSS-only sticky projection / 仅 CSS 吸顶投影 |
| `u-subsection` | `USubsection` | [USubsection](subsection.md) | Controlled finite segment selection / 受控有限区段选择 |
| `u-swipe-action` | `USwipeAction` | [USwipeAction](swipe-action.md) | Explicit local action slot / 显式局部操作槽 |
| `u-swiper` | `USwiper` | [USwiper](swiper.md) | Static slide deck / 静态 slide deck |
| `u-switch` | `USwitch` | [USwitch](switch.md) | Controlled active/inactive value mapping / 受控 active/inactive 值映射 |
| `u-tabs` | `UTabs` | [UTabs](tabs.md) | Controlled tab strip / 受控标签栏 |
| `u-tabs-swiper` | `UTabsSwiper` | [UTabsSwiper](tabs-swiper.md) | Controlled static tab-panel projection / 受控静态 tab-panel 投影 |
| `u-tabbar` | `UTabbar` | [UTabbar](tabbar.md) | Local bottom tab selection / 局部底部标签选择 |
| `u-table` | `UTable` | [UTable](table.md) | View-based caller slot table container / 基于 view 的调用方 slot 表格容器 |
| `u-tag` | `UTag` | [UTag](tag.md) | Finite-tone text tag / 有限 tone 文字标签 |
| `u-text` | `UText` | [UText](text.md) | Finite text presentation / 有限文字呈现 |
| `u-textarea` | `UTextarea` | [UTextarea](textarea.md) | Controlled multiline input with inherited form guards / 继承表单 guard 的受控多行输入 |
| `u-td` | `UTd` | [UTd](td.md) | Static view-based table cell / 静态 view 表格单元格 |
| `u-th` | `UTh` | [UTh](th.md) | Static view-based header cell / 静态 view 表头单元格 |
| `u-time-line` | `UTimeLine` | [UTimeLine](time-line.md) | Local slot-composed timeline / 本地 slot 组合时间线 |
| `u-time-line-item` | `UTimeLineItem` | [UTimeLineItem](time-line-item.md) | Declarative timeline item / 声明式时间线项目 |
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
| `u-tr` | `UTr` | [UTr](tr.md) | View-based row with optional local intent / 带可选本地意图的 view 行 |
| `u-upload` | `UUpload` | [UUpload](upload.md) | Caller-owned file-state intents with optional injected adapter / 调用方拥有的文件状态意图与可选 injected adapter |
| `u-verification-code` | `UVerificationCode` | [UVerificationCode](verification-code.md) | Caller-owned request-state projection / 调用方拥有的请求状态投影 |
| `u-waterfall` | `UWaterfall` | [UWaterfall](waterfall.md) | Deterministic finite-column projection / 确定性有限列投影 |
| `u-config-provider` | `UConfigProvider` | [UConfigProvider](config-provider.md) | Finite theme-density subtree scope / 有限主题密度子树范围 |
| `u-root-portal` | `URootPortal` | [URootPortal](root-portal.md) | Same-tree overlay-root wrapper / 同树 overlay-root 包装器 |

The index currently contains 107 declared component contracts. `u-navbar` and `u-notice-bar` are separate, bounded APIs; they do not alias the earlier `u-nav-bar` or `u-notice` contracts. Use named imports or the explicit `UView` plugin as documented in [runtime consumption](runtime-consumption.md). Import `style.css` explicitly from application-owned global style setup. The current [platform compatibility profile](compatibility.md), [API compatibility inventory](api-compatibility.md), [examples](examples.md), and [migration guidance](migration-from-uview.md) state the distinct evidence and limits that apply to this index.

该索引当前包含 107 个已声明的组件契约。`u-navbar` 与 `u-notice-bar` 是独立、受限的 API，不是既有 `u-nav-bar` 或 `u-notice` 契约的别名。按 [runtime consumption](runtime-consumption.md) 所述使用命名导入或显式 `UView` plugin，并从应用拥有的全局样式设置显式导入 `style.css`。当前[平台兼容性说明](compatibility.md)、[API 兼容盘点](api-compatibility.md)、[示例](examples.md)与[迁移指引](migration-from-uview.md)分别说明此索引适用的证据和限制。
