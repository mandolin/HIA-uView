/**
 * @module hia-uview-ui-types
 * @lang zh-CN 定义私有预发布 UI 包的静态 TypeScript 入口。它只描述当前显式 runtime 导出和受审计的受控迁移表面；声明不会注册组件、注入样式或扩大平台支持承诺。
 * @lang en Defines the static TypeScript entry for the private pre-release UI package. It describes only current explicit runtime exports and audited controlled migration surfaces; declarations neither register components nor inject styles or broaden platform-support claims.
 */

import type { App, ComputedRef, DefineComponent, Plugin } from 'vue';

/**
 * @lang zh-CN 表示尚未提供逐 prop 精确声明的当前 runtime 组件。它保证导出名称可被类型检查，但不把通用基线表述为完整 API 或上游兼容承诺。
 * @lang en Represents a current runtime component whose per-prop precise declaration is not yet delivered. It guarantees that the export name type-checks, but does not present the generic baseline as a complete API or upstream-compatibility promise.
 */
export type UViewComponent = DefineComponent<Record<string, unknown>, {}, unknown>;

/**
 * @lang zh-CN 表示受控单选或多选项所使用的透明本地键；组件不解释其业务含义。
 * @lang en Represents the transparent local key used by a controlled single- or multi-choice item; components do not interpret its business meaning.
 */
export type UChoiceValue = string | number;

/**
 * @lang zh-CN 描述 `UCheckbox` 当前受审计的 caller-controlled prop 表面；`checked` 是既有 alias，显式提供时优先于 `modelValue`。
 * @lang en Describes the current audited caller-controlled prop surface of `UCheckbox`; `checked` is the existing alias and takes precedence over `modelValue` when explicitly provided.
 */
export interface UCheckboxProps {
  /** 中文：独立事件或 group 成员关系使用的透明本地键。English: Transparent local key for independent events or group membership. */
  value?: UChoiceValue;
  /** 中文：调用方可见标签；默认 slot 可以替代其显示内容。English: Caller-visible label; the default slot may replace its displayed content. */
  label?: string;
  /** 中文：既有 HIA 受控 alias；显式提供时优先。English: Existing HIA controlled alias; it takes precedence when explicit. */
  checked?: boolean;
  /** 中文：独立模式的标准布尔受控值。English: Standard boolean controlled value in independent mode. */
  modelValue?: boolean;
  /** 中文：本地不可操作声明；非空字符串和 true 均为禁用。English: Local inactivity declaration; a nonempty string and true both disable interaction. */
  disabled?: string | boolean;
}

/**
 * @lang zh-CN 描述 `UCheckboxGroup` 的只读成员集合和局部禁用边界；组件 emit 新数组而不修改传入数组。
 * @lang en Describes the readonly membership collection and local disabled boundary of `UCheckboxGroup`; the component emits a new array rather than mutating the supplied array.
 */
export interface UCheckboxGroupProps {
  /** 中文：调用方拥有的成员集合。English: Caller-owned membership collection. */
  modelValue?: ReadonlyArray<UChoiceValue>;
  /** 中文：是否阻止该子树中 checkbox 的局部交互。English: Whether to prevent local checkbox interaction in this subtree. */
  disabled?: boolean;
}

/**
 * @lang zh-CN 描述 `URadio` 当前受审计的本地单选表面；group 内的 selected state 由 `URadioGroup` 控制。
 * @lang en Describes the current audited local single-choice surface of `URadio`; selected state inside a group is controlled by `URadioGroup`.
 */
export interface URadioProps {
  /** 中文：独立事件或 group 比较使用的透明本地键。English: Transparent local key for independent events or group comparison. */
  value?: UChoiceValue;
  /** 中文：调用方可见标签；默认 slot 可以替代其显示内容。English: Caller-visible label; the default slot may replace its displayed content. */
  label?: string;
  /** 中文：独立模式的受控选中态。English: Controlled selected state in independent mode. */
  checked?: boolean;
  /** 中文：本地不可操作声明；非空字符串和 true 均为禁用。English: Local inactivity declaration; a nonempty string and true both disable interaction. */
  disabled?: string | boolean;
}

/**
 * @lang zh-CN 描述 `URadioGroup` 的 caller-owned 单个本地键和禁用边界。
 * @lang en Describes the caller-owned single local key and disabled boundary of `URadioGroup`.
 */
export interface URadioGroupProps {
  /** 中文：调用方拥有的当前选中键。English: Caller-owned current selected key. */
  modelValue?: UChoiceValue;
  /** 中文：是否阻止该子树中 radio 的局部交互。English: Whether to prevent local radio interaction in this subtree. */
  disabled?: boolean;
}

/**
 * @lang zh-CN 描述 `USwitch` 的受控布尔选择表面；loading 只阻止局部切换，不表示异步业务完成。
 * @lang en Describes the controlled boolean-choice surface of `USwitch`; loading only blocks local toggling and does not represent asynchronous business completion.
 */
export interface USwitchProps {
  /** 中文：调用方拥有的当前布尔值。English: Caller-owned current boolean value. */
  modelValue?: boolean;
  /** 中文：调用方可见标签。English: Caller-visible label. */
  label?: string;
  /** 中文：是否阻止局部切换。English: Whether to prevent local toggling. */
  disabled?: boolean;
  /** 中文：是否以本地 loading guard 阻止切换。English: Whether to prevent toggling with a local loading guard. */
  loading?: boolean;
}

/**
 * @lang zh-CN 描述 `UTabbar` 的有限、非路由 tab 项；没有图标、徽标、页面或原生 tabBar 生命周期语义。
 * @lang en Describes a finite, non-routing `UTabbar` item; it has no icon, badge, page, or native-tab-bar lifecycle semantics.
 */
export interface UTabbarItem {
  /** 中文：可见标签。English: Visible label. */
  label?: string;
  /** 中文：`label` 的既有文本 alias。English: Existing text alias for `label`. */
  text?: string;
  /** 中文：本地选中键；未提供时组件回退到 label/text/index。English: Local selected key; the component falls back to label/text/index when absent. */
  value?: UChoiceValue;
  /** 中文：是否阻止该本地项的选择。English: Whether to prevent selection of this local item. */
  disabled?: boolean;
}

/**
 * @lang zh-CN 描述 `UTabbar` 的局部可见性和受控本地选择；`visible` 显式提供时优先于 `show`。
 * @lang en Describes local visibility and controlled local selection of `UTabbar`; explicit `visible` takes precedence over `show`.
 */
export interface UTabbarProps {
  /** 中文：既有 HIA 显式可见性 alias。English: Existing explicit HIA visibility alias. */
  visible?: boolean;
  /** 中文：本地输出的上游熟悉可见性开关；不调用 native tabBar API。English: Upstream-familiar visibility control for local output; it calls no native tab-bar API. */
  show?: boolean;
  /** 中文：调用方拥有的局部选中值，默认运行时值为 0。English: Caller-owned local selected value, with runtime default 0. */
  modelValue?: UChoiceValue;
  /** 中文：调用方声明的有限静态 tab 项。English: Finite static tab items declared by the caller. */
  items?: ReadonlyArray<string | UTabbarItem>;
}

/**
 * @lang zh-CN 描述 `UNoticeBar` 的 caller-controlled 横幅表面；它不是全局消息队列或自动滚动服务。
 * @lang en Describes the caller-controlled banner surface of `UNoticeBar`; it is neither a global message queue nor an auto-scrolling service.
 */
export interface UNoticeBarProps {
  /** 中文：既有 HIA 显式可见性 alias。English: Existing explicit HIA visibility alias. */
  visible?: boolean;
  /** 中文：本地输出的上游熟悉可见性开关。English: Upstream-familiar visibility control for local output. */
  show?: boolean;
  /** 中文：调用方拥有的横幅正文。English: Caller-owned banner body. */
  text?: string;
  /** 中文：有限展示 tone；未知值回退到 info。English: Finite presentation tone; unknown values fall back to info. */
  tone?: 'info' | 'success' | 'warning' | 'error' | string;
  /** 中文：非空时显示 close control；组件不生成默认本地化文字。English: Shows a close control when nonempty; the component generates no default localized copy. */
  closeText?: string;
}

/**
 * @lang zh-CN 描述 `UPicker` 单列 option 的声明式本地结构；它不是日期、地区、远端或多列 picker contract。
 * @lang en Describes the declarative local shape of a single-column `UPicker` option; it is not a date, region, remote, or multi-column picker contract.
 */
export interface UPickerOption {
  /** 中文：可见文字。English: Visible text. */
  label?: string | number;
  /** 中文：透明本地值。English: Transparent local value. */
  value?: UChoiceValue;
  /** 中文：是否禁止选择该 option。English: Whether selection of this option is prevented. */
  disabled?: boolean;
}

/**
 * @lang zh-CN 描述 `UPicker` 的有限单列受控草稿/确认表面；其同名 `modelValue` 不等同于上游 popup、地区、时间或多列状态语义。
 * @lang en Describes the finite single-column controlled draft/confirm surface of `UPicker`; its same-name `modelValue` is not equivalent to upstream popup, region, time, or multi-column state semantics.
 */
export interface UPickerProps {
  /** 中文：调用方拥有的已确认值。English: Caller-owned confirmed value. */
  modelValue?: UChoiceValue;
  /** 中文：有限单列 option；原始 string/number 同样可用。English: Finite single-column options; primitive strings/numbers are also accepted. */
  columns?: ReadonlyArray<UChoiceValue | UPickerOption>;
  /** 中文：本地标题。English: Local title. */
  title?: string;
  /** 中文：调用方提供的确认文字。English: Caller-provided confirm text. */
  confirmText?: string;
  /** 中文：调用方提供的取消文字。English: Caller-provided cancel text. */
  cancelText?: string;
  /** 中文：是否阻止本地 option/action 操作。English: Whether to prevent local option/action interaction. */
  disabled?: boolean;
}

/**
 * @lang zh-CN 当前受审计的 choice/navigation/feedback 组件保持精确 props 声明；其余导出采用 `UViewComponent` 基线，等待逐项 API 审计。
 * @lang en Current audited choice/navigation/feedback components retain precise prop declarations; the remaining exports use the `UViewComponent` baseline pending per-item API audit.
 */
export declare const UCheckbox: DefineComponent<UCheckboxProps>;
/** @lang zh-CN 受控多选 group 组件。 @lang en Controlled multi-choice group component. */
export declare const UCheckboxGroup: DefineComponent<UCheckboxGroupProps>;
/** @lang zh-CN 受控单选项组件。 @lang en Controlled single-choice item component. */
export declare const URadio: DefineComponent<URadioProps>;
/** @lang zh-CN 受控单选 group 组件。 @lang en Controlled single-choice group component. */
export declare const URadioGroup: DefineComponent<URadioGroupProps>;
/** @lang zh-CN 受控布尔选择组件。 @lang en Controlled boolean-choice component. */
export declare const USwitch: DefineComponent<USwitchProps>;
/** @lang zh-CN 局部、非路由 tabbar 组件。 @lang en Local non-routing tabbar component. */
export declare const UTabbar: DefineComponent<UTabbarProps>;
/** @lang zh-CN caller-controlled 非滚动横幅组件。 @lang en Caller-controlled non-scrolling banner component. */
export declare const UNoticeBar: DefineComponent<UNoticeBarProps>;
/** @lang zh-CN 有限单列本地 picker 组件。 @lang en Finite single-column local picker component. */
export declare const UPicker: DefineComponent<UPickerProps>;

/**
 * @lang zh-CN 以下运行时命名导出均已存在，但尚未承诺逐 prop、事件 payload、slot props、expose signature、父子 context 或全局 bus 的完整 TypeScript 形状。
 * @lang en The following runtime named exports already exist, but do not yet promise complete TypeScript shapes for every prop, event payload, slot prop, expose signature, parent-child context, or global bus.
 */
export declare const UActionSheet: UViewComponent;
export declare const UActionSheetItem: UViewComponent;
export declare const UAlertTips: UViewComponent;
export declare const UAvatar: UViewComponent;
export declare const UAvatarCropper: UViewComponent;
export declare const UBackTop: UViewComponent;
export declare const UBadge: UViewComponent;
export declare const UButton: UViewComponent;
export declare const UCalendar: UViewComponent;
export declare const UCard: UViewComponent;
export declare const UCarKeyboard: UViewComponent;
export declare const UCell: UViewComponent;
export declare const UCellGroup: UViewComponent;
export declare const UCellItem: UViewComponent;
export declare const UCircleProgress: UViewComponent;
export declare const UCitySelect: UViewComponent;
export declare const UCol: UViewComponent;
export declare const UCollapse: UViewComponent;
export declare const UCollapseItem: UViewComponent;
export declare const UColumnNotice: UViewComponent;
export declare const UConfigProvider: UViewComponent;
export declare const UCountDown: UViewComponent;
export declare const UCountTo: UViewComponent;
export declare const UDivider: UViewComponent;
export declare const UDropdown: UViewComponent;
export declare const UDropdownItem: UViewComponent;
export declare const UEmpty: UViewComponent;
export declare const UFab: UViewComponent;
export declare const UField: UViewComponent;
export declare const UForm: UViewComponent;
export declare const UFormItem: UViewComponent;
export declare const UFullScreen: UViewComponent;
export declare const UGap: UViewComponent;
export declare const UGrid: UViewComponent;
export declare const UGridItem: UViewComponent;
export declare const UIcon: UViewComponent;
export declare const UImage: UViewComponent;
export declare const UIndexAnchor: UViewComponent;
export declare const UIndexList: UViewComponent;
export declare const UInput: UViewComponent;
export declare const UKeyboard: UViewComponent;
export declare const ULazyLoad: UViewComponent;
export declare const ULine: UViewComponent;
export declare const ULineProgress: UViewComponent;
export declare const ULink: UViewComponent;
export declare const UList: UViewComponent;
export declare const ULoading: UViewComponent;
export declare const ULoadingPage: UViewComponent;
export declare const ULoadingPopup: UViewComponent;
export declare const ULoadmore: UViewComponent;
export declare const UMask: UViewComponent;
export declare const UMessageInput: UViewComponent;
export declare const UModal: UViewComponent;
export declare const UNavBar: UViewComponent;
export declare const UNavbar: UViewComponent;
export declare const UNoNetwork: UViewComponent;
export declare const UNotice: UViewComponent;
export declare const UNumberBox: UViewComponent;
export declare const UNumberKeyboard: UViewComponent;
export declare const UPagination: UViewComponent;
export declare const UPopup: UViewComponent;
export declare const URate: UViewComponent;
export declare const UReadMore: UViewComponent;
export declare const URootPortal: UViewComponent;
export declare const URow: UViewComponent;
export declare const URowNotice: UViewComponent;
export declare const USafeBottom: UViewComponent;
export declare const UScrollList: UViewComponent;
export declare const USearch: UViewComponent;
export declare const USection: UViewComponent;
export declare const USelect: UViewComponent;
export declare const USkeleton: UViewComponent;
export declare const USlider: UViewComponent;
export declare const UStack: UViewComponent;
export declare const UStatusBar: UViewComponent;
export declare const UStep: UViewComponent;
export declare const USteps: UViewComponent;
export declare const USticky: UViewComponent;
export declare const USubsection: UViewComponent;
export declare const USwipeAction: UViewComponent;
export declare const USwiper: UViewComponent;
export declare const UTable: UViewComponent;
export declare const UTabs: UViewComponent;
export declare const UTabsSwiper: UViewComponent;
export declare const UTag: UViewComponent;
export declare const UTd: UViewComponent;
export declare const UText: UViewComponent;
export declare const UTextarea: UViewComponent;
export declare const UTh: UViewComponent;
export declare const UTimeLine: UViewComponent;
export declare const UTimeLineItem: UViewComponent;
export declare const UToast: UViewComponent;
export declare const UTopTips: UViewComponent;
export declare const UTr: UViewComponent;
export declare const UTransition: UViewComponent;
export declare const UUpload: UViewComponent;
export declare const UValidationMessage: UViewComponent;
export declare const UVerificationCode: UViewComponent;
export declare const UWaterfall: UViewComponent;

/**
 * @lang zh-CN 描述 explicit plugin 的最小 Vue application 输入；安装只在调用方显式 `app.use` 时发生。
 * @lang en Describes the minimum Vue application input for the explicit plugin; installation happens only when the caller explicitly invokes `app.use`.
 */
export declare function installUView(application: App): App;

/**
 * @lang zh-CN 描述当前命名模板和组件实现的只读 registry；它不是 application source scanner 或 runtime global registry。
 * @lang en Describes the readonly registry of current template names and component implementations; it is not an application-source scanner or runtime global registry.
 */
export declare const UVIEW_COMPONENTS: ReadonlyArray<Readonly<{
  /** 中文：稳定的 kebab-case 模板名称。English: Stable kebab-case template name. */
  name: string;
  /** 中文：对应的当前 runtime 组件实现。English: Corresponding current runtime component implementation. */
  component: UViewComponent;
}>>;

/**
 * @lang zh-CN 描述只接受 `zh-Hans` 和 `en` 的当前本地 locale 值；它不读取系统、存储或网络。
 * @lang en Describes the current local locale value that accepts only `zh-Hans` and `en`; it reads no system, storage, or network state.
 */
export type ULocale = 'zh-Hans' | 'en';

/**
 * @lang zh-CN 描述当前显式支持的有限 locale 列表。
 * @lang en Describes the finite list of currently explicitly supported locales.
 */
export declare const U_SUPPORTED_LOCALES: readonly ULocale[];

/**
 * @lang zh-CN 将任意输入归一为当前有限 locale，不读取系统偏好或持久化状态。
 * @lang en Normalizes arbitrary input to the current finite locale without reading system preference or persisted state.
 */
export declare function normalizeULocale(value?: unknown): ULocale;

/**
 * @lang zh-CN 返回调用方提供的 locale ref 或安全的局部默认值；它不创建全局 locale store。
 * @lang en Returns a caller-provided locale ref or a safe local default; it creates no global locale store.
 */
export declare function useULocale(locale?: ULocale | ComputedRef<ULocale>): ComputedRef<ULocale>;

/**
 * @lang zh-CN 描述显式安装所有当前 runtime 组件的私有 Vue plugin；它不自动注入样式或注册到全局 runtime。
 * @lang en Describes the private Vue plugin that explicitly installs all current runtime components; it neither automatically injects styles nor registers on global runtime.
 */
export declare const UView: Plugin;

export default UView;
