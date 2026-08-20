/**
 * @module ui-package-type-consumer-fixture
 * @lang zh-CN 编译期消费 fixture：只验证私有包 declaration 的解析和受审计表面，不运行 Vue、注册组件、访问小程序 API 或读取应用状态。
 * @lang en Compile-time consumer fixture: verifies only private-package declaration resolution and audited surfaces; it runs no Vue, registers no component, accesses no Mini Program API, and reads no application state.
 */

import UView, {
  UActionSheet,
  UAlertTips,
  UButton,
  UCalendar,
  UCell,
  UCellGroup,
  UCellItem,
  UCheckbox,
  UCheckboxGroup,
  UDropdown,
  UDropdownItem,
  UEmpty,
  UField,
  UForm,
  UFormItem,
  UIcon,
  UImage,
  UInput,
  UMask,
  UModal,
  UNavbar,
  UNoticeBar,
  UNumberBox,
  UPagination,
  UPicker,
  UPopup,
  URadio,
  URadioGroup,
  URate,
  USearch,
  USelect,
  USkeleton,
  USlider,
  USwipeAction,
  USwitch,
  UTabbar,
  UTabs,
  UTag,
  UText,
  UTextarea,
  UToast,
  UTransition,
  UUpload,
  createUFeedbackScope,
  normalizeULocale,
  useModal,
  useToast,
  useULocale,
  type UActionSheetInstance,
  type UActionSheetItem,
  type UActionSheetProps,
  type UActionSheetSelectDetail,
  type UAlertTipsEmits,
  type UAlertTipsInstance,
  type UAlertTipsProps,
  type UButtonEmits,
  type UButtonInstance,
  type UButtonProps,
  type UButtonSize,
  type UButtonVariant,
  type UCalendarChangeDetail,
  type UCalendarInstance,
  type UCalendarProps,
  type UCellEmits,
  type UCellGroupEmits,
  type UCellGroupInstance,
  type UCellGroupProps,
  type UCellInstance,
  type UCellItemEmits,
  type UCellItemInstance,
  type UCellItemProps,
  type UCellProps,
  type UCheckboxGroupInstance,
  type UCheckboxGroupProps,
  type UCheckboxInstance,
  type UCheckboxProps,
  type UDropdownInstance,
  type UDropdownItemInstance,
  type UDropdownItemProps,
  type UDropdownProps,
  type UEmptyEmits,
  type UEmptyInstance,
  type UEmptyProps,
  type UFieldInstance,
  type UFieldProps,
  type UFormFieldPath,
  type UFormInstance,
  type UFormItemInstance,
  type UFormItemProps,
  type UFormModel,
  type UFormProps,
  type UFormRule,
  type UFormRules,
  type UFormRuleValidatorContext,
  type UFormValidationError,
  type UInputInstance,
  type UInputProps,
  type UIconEmits,
  type UIconInstance,
  type UIconProps,
  type UIconSize,
  type UIconTone,
  type UImageEmits,
  type UImageInstance,
  type UImageMode,
  type UImageProps,
  type UFeedbackCommandResult,
  type UFeedbackScope,
  type UMaskInstance,
  type UMaskProps,
  type UModalConfirmMetadata,
  type UModalConfirmOptions,
  type UModalController,
  type UModalInstance,
  type UModalOptions,
  type UModalProps,
  type UNavbarInstance,
  type UNavbarProps,
  type UNoticeBarInstance,
  type UNoticeBarProps,
  type UNumberBoxInstance,
  type UNumberBoxProps,
  type UPaginationEmits,
  type UPaginationInstance,
  type UPaginationProps,
  type UPickerCancelDetail,
  type UPickerColumnChangeDetail,
  type UPickerConfirmDetail,
  type UPickerInstance,
  type UPickerOption,
  type UPickerProps,
  type UPopupInstance,
  type UPopupProps,
  type URadioGroupInstance,
  type URadioGroupProps,
  type URadioInstance,
  type URadioProps,
  type URateInstance,
  type URateProps,
  type USearchInstance,
  type USearchProps,
  type USelectCancelResult,
  type USelectConfirmResult,
  type USelectInstance,
  type USelectProps,
  type USkeletonEmits,
  type USkeletonInstance,
  type USkeletonProps,
  type USliderInstance,
  type USliderProps,
  type USwipeActionEmits,
  type USwipeActionInput,
  type USwipeActionInstance,
  type USwipeActionOption,
  type USwipeActionProps,
  type USwipeActionValue,
  type USwitchInstance,
  type USwitchProps,
  type UTabbarItem,
  type UTabbarInstance,
  type UTabbarProps,
  type UTabsInstance,
  type UTabsItem,
  type UTabsProps,
  type UTagEmits,
  type UTagInstance,
  type UTagProps,
  type UTextEmits,
  type UTextInstance,
  type UTextProps,
  type UTextareaInstance,
  type UTextareaProps,
  type UToastController,
  type UToastInstance,
  type UToastOptions,
  type UToastProps,
  type UTransitionInstance,
  type UTransitionProps,
  type UUploadAdapter,
  type UUploadAdapterState,
  type UUploadFile,
  type UUploadInstance,
  type UUploadProps
} from '@hia-uview/ui';
// <lang><zh-CN>纯 service 子路径必须解析为与根入口相同的显式 scope API；别名避免把两条入口误当作两个实现。</zh-CN><en>The pure service subpath must resolve to the same explicit-scope API as the root entry; aliases avoid mistaking the two entries for separate implementations.</en></lang>
import {
  createUFeedbackScope as createSubpathFeedbackScope,
  useModal as useSubpathModal,
  useToast as useSubpathToast,
  type UFeedbackCommandResult as SubpathFeedbackCommandResult
} from '@hia-uview/ui/services';
import '@hia-uview/ui/global';
import type { GlobalComponents, Plugin } from 'vue';

// <lang><zh-CN>验证 choice props 保持透明 local value、显式 alias 与受控布尔输入；fixture 不赋予这些值业务含义。</zh-CN><en>Verifies that choice props retain transparent local values, explicit aliases, and controlled boolean input; the fixture assigns no business meaning to these values.</en></lang>
const checkboxProps: UCheckboxProps = {
  checked: true,
  disabled: false,
  label: 'Local option',
  labelDisabled: false,
  modelValue: false,
  name: 'fallback-option',
  value: 'local-option'
};

// <lang><zh-CN>其余 choice 正例锁定 group max/label guard、radio alias 与 switch 的透明 active/inactive 映射。</zh-CN><en>Remaining choice positives lock group max/label guards, radio aliases, and transparent active/inactive mapping of the switch.</en></lang>
const checkboxGroupProps: UCheckboxGroupProps = { disabled: false, labelDisabled: true, max: '3', modelValue: ['a', 2] };
const radioProps: URadioProps = { checked: false, label: 'Radio', labelDisabled: false, name: 7 };
const radioGroupProps: URadioGroupProps = { disabled: false, labelDisabled: false, modelValue: 7 };
const switchProps: USwitchProps = { activeValue: 'enabled', inactiveValue: 0, label: 'State', loading: false, modelValue: 'enabled' };

// <lang><zh-CN>验证 tabbar 项只接受有限 label/value/disabled 与图片 locator 结构，不包含路由或原生 tab 生命周期字段。</zh-CN><en>Verifies that tabbar items accept only finite label/value/disabled plus image-locator shape and contain no route or native-tab-lifecycle fields.</en></lang>
const tabItems: ReadonlyArray<UTabbarItem> = [
  { activeIcon: '/home-active.png', icon: '/home.png', label: 'Home', value: 0 },
  { disabled: true, text: 'Profile', value: 'profile' }
];

// <lang><zh-CN>P68 overlay/navigation 正例覆盖 caller-controlled alias、有限值和透明条目，不引入路由、页面或业务 command。</zh-CN><en>P68 overlay/navigation positives cover caller-controlled aliases, finite values, and transparent items without introducing a router, page, or business command.</en></lang>
const popupProps: UPopupProps = { closeText: 'Close', maskClosable: true, modelValue: true, placement: 'bottom', show: false, title: 'Details' };
const maskProps: UMaskProps = { clickable: true, layer: 1000, opacity: 0.56, show: true };
const transitionProps: UTransitionProps = { duration: 180, mode: 'slide-up', visible: true };
const actionSheetItems: ReadonlyArray<string | UActionSheetItem> = [
  'Default action',
  { disabled: false, label: 'Local action', selected: true, value: { id: 'caller-owned' } },
  { label: 'Explicit undefined', selected: false, value: undefined }
];
const actionSheetProps: UActionSheetProps = { cancelText: 'Cancel', items: actionSheetItems, maskClosable: true, modelValue: true, selectedText: 'Current', title: 'Actions' };
const actionSheetSelection: UActionSheetSelectDetail = { index: 1, value: { id: 'caller-owned' } };
const navbarProps: UNavbarProps = { backText: 'Back', disabled: false, isBack: true, rightText: 'Done', title: 'Local page', visible: true };
const tabbarProps: UTabbarProps = { items: tabItems, list: [{ label: 'Fallback', value: 'fallback' }], modelValue: 0, show: true };
const tabsItems: ReadonlyArray<string | UTabsItem> = ['Overview', { disabled: false, name: 'Details', value: 'details' }];
const tabsProps: UTabsProps = { current: 0, items: tabsItems, modelValue: 'details' };
const noticeBarProps: UNoticeBarProps = { closeText: 'Dismiss', current: '1', list: ['First', 'Second'], show: true, tone: 'info' };

// <lang><zh-CN>显式 feedback scope 同时服务 component host props 与两个 controller；它不是自动全局 singleton。</zh-CN><en>The explicit feedback scope serves both component-host props and both controllers; it is not an automatic global singleton.</en></lang>
const feedbackScope: Readonly<UFeedbackScope> = createUFeedbackScope();
// <lang><zh-CN>子路径创建的 scope 必须可被根入口 controller 消费，证明类型表面没有分裂。</zh-CN><en>A scope created through the subpath must be consumable by root-entry controllers, proving that the type surface is not split.</en></lang>
const subpathFeedbackScope: Readonly<UFeedbackScope> = createSubpathFeedbackScope();
const toastProps: UToastProps = { closeText: 'Dismiss', duration: 0, message: 'Saved', position: 'bottom', serviceHost: true, serviceScope: feedbackScope, tone: 'success', visible: true };
const modalProps: UModalProps = { asyncClose: true, cancelText: 'Cancel', confirmText: 'Continue', content: 'Review this action', maskCloseAble: true, modelValue: true, serviceHost: true, serviceScope: feedbackScope, showTitle: true, title: 'Confirm' };
const toastOptions: UToastOptions = { closeText: 'Dismiss', duration: 3000, loading: false, message: 'Saved', position: 'center', tone: 'success' };
const modalOptions: UModalOptions = { cancelText: 'Cancel', confirmText: 'Continue', content: 'Review this action', showCancelButton: true, showConfirmButton: true, title: 'Confirm' };
const modalConfirmOptions: UModalConfirmOptions = { cancelText: 'Cancel', confirmText: 'Continue', content: 'Review this action' };
const toastController: Readonly<UToastController> = useToast(feedbackScope);
const modalController: Readonly<UModalController> = useModal(feedbackScope);
// <lang><zh-CN>子路径 controller 仍绑定调用方显式 scope，并返回同一可判别结果 union。</zh-CN><en>Subpath controllers remain bound to a caller-explicit scope and return the same discriminated result union.</en></lang>
const subpathToastResult: SubpathFeedbackCommandResult = useSubpathToast(subpathFeedbackScope).show('Subpath toast');
const subpathModalResult: SubpathFeedbackCommandResult = useSubpathModal(subpathFeedbackScope).show('Subpath modal');

// <lang><zh-CN>Controller 正例锁定有限 helper、expected request guard 与可判别同步结果，不把 accepted 误作用户完成。</zh-CN><en>Controller positives lock finite helpers, expected-request guards, and discriminated synchronous results without mistaking accepted for user completion.</en></lang>
const toastShowResult: UFeedbackCommandResult = toastController.show(toastOptions);
const toastLoadingResult: UFeedbackCommandResult = toastController.loading({ message: 'Working' });
const toastCloseResult: UFeedbackCommandResult = toastController.close(toastShowResult.accepted ? toastShowResult.requestId : undefined);
const modalShowResult: UFeedbackCommandResult = modalController.show(modalOptions);
const modalConfirmResult: UFeedbackCommandResult = modalController.confirm(modalConfirmOptions);
const modalClearResult: UFeedbackCommandResult = modalController.clearLoading(modalConfirmResult.accepted ? modalConfirmResult.requestId : undefined);
const modalCloseResult: UFeedbackCommandResult = modalController.close(modalShowResult.accepted ? modalShowResult.requestId : undefined);

// <lang><zh-CN>验证单列 picker option 是受限的 local value/label/disabled 数据，而非日期或地区模型。</zh-CN><en>Verifies that a single-column picker option is constrained local value/label/disabled data rather than a date or region model.</en></lang>
const pickerOptions: ReadonlyArray<UPickerOption> = [
  { code: 'one', label: 'One', value: 1 },
  { code: 'two', disabled: true, label: 'Two', value: 2 }
];

// <lang><zh-CN>picker 正例覆盖多列输入、rangeKey、完整 confirm 与允许未解析列的 cancel/columnchange 快照。</zh-CN><en>Picker positives cover multi-column input, rangeKey, complete confirmation, and cancel/columnchange snapshots that permit unresolved columns.</en></lang>
const pickerProps: UPickerProps = {
  columns: [pickerOptions, ['small', 'large']],
  modelValue: [1, 'small'],
  preserveSelection: true,
  rangeKey: 'code'
};
const pickerConfirm: UPickerConfirmDetail = {
  indexes: [0, 0],
  options: [pickerOptions[0], 'small'],
  value: [1, 'small'],
  values: [1, 'small']
};
const pickerCancel: UPickerCancelDetail = {
  indexes: [-1],
  options: [null],
  value: 'orphan',
  values: [null]
};
const pickerColumnChange: UPickerColumnChangeDetail = {
  column: 0,
  index: 0,
  indexes: [0, -1],
  option: pickerOptions[0],
  options: [pickerOptions[0], null],
  value: 1,
  values: [1, null]
};

// <lang><zh-CN>calendar/select/dropdown 正例分别锁定 Gregorian 字段、非空 confirm 与可空 cancel、以及 registry/options 值域。</zh-CN><en>Calendar/select/dropdown positives respectively lock Gregorian fields, non-null confirmation versus nullable cancellation, and registry/options value domains.</en></lang>
const calendarProps: UCalendarProps = { disabledDates: ['2026-08-12'], maxDate: '2026-08-31', minDate: '2026-08-01', modelValue: '2026-08-11', viewDate: '2026-08-01', weekLabels: ['S', 'M', 'T', 'W', 'T', 'F', 'S'] };
const calendarChange: UCalendarChangeDetail = { day: 11, month: 8, value: '2026-08-11', year: 2026 };
const selectOptions = [{ label: 'First', metadata: 'caller-owned', value: 'first' }, { disabled: true, label: 'Second', value: 2 }] as const;
const selectProps: USelectProps = { confirmMode: true, modelValue: 'first', options: selectOptions, placeholder: 'Select' };
const selectConfirm: USelectConfirmResult = { index: 0, option: selectOptions[0], value: 'first' };
const selectCancel: USelectCancelResult = { index: -1, option: null, value: 'orphan' };
const dropdownProps: UDropdownProps = { disabled: false, modelValue: 'legacy' };
const dropdownItemProps: UDropdownItemProps = {
  modelValue: ['alpha'],
  name: 'filters',
  options: [{ label: 'Alpha', metadata: 'caller-owned', value: ['alpha'] }],
  show: true
};

// <lang><zh-CN>数值 props 正例只表达有限局部输入规则，不赋予数量、评分或业务范围含义。</zh-CN><en>Numeric props positives express only finite local input rules and assign no quantity, rating, or business-range meaning.</en></lang>
const numberBoxProps: UNumberBoxProps = { max: 10, min: 0, modelValue: 1.25, readonly: false, step: 0.25 };
const rateProps: URateProps = { activeSymbol: '+', count: 5, current: 2, inactiveSymbol: '-', modelValue: 3 };
const sliderProps: USliderProps = { max: 1, min: 0.1, modelValue: 0.3, showValue: true, step: 0.2 };

// <lang><zh-CN>upload 正例证明 adapter 只能读取精确 action context，并仅返回 void 或新 caller 文件数组。</zh-CN><en>The upload positive proves an adapter can read only exact action contexts and returns only void or a new caller-file array.</en></lang>
const uploadFiles: ReadonlyArray<UUploadFile> = [
  { description: 'Local state only', label: 'Document', localId: 'doc-1', status: 'ready' },
  'Readable shorthand'
];
const uploadAdapter: UUploadAdapter = {
  select: (context) => {
    // <lang><zh-CN>literal action 与只读快照来自 select 专用 context；返回新容器，不修改传入 files。</zh-CN><en>The literal action and readonly snapshot come from the select-only context; a new container is returned without mutating supplied files.</en></lang>
    const action: 'select' = context.action;
    void [action, context.event, context.remainingSlots, context.requestId];
    return [...context.files, { label: 'Selected locally', status: 'pending' }];
  },
  preview: (context) => {
    // <lang><zh-CN>preview method 的 discriminant 不会退化为三 action union。</zh-CN><en>The preview method discriminant does not degrade into a three-action union.</en></lang>
    const action: 'preview' = context.action;
    void [action, context.event, context.file, context.files, context.index, context.requestId];
  },
  remove: async (context) => context.files.filter((_file, index) => index !== context.index),
  retry: (context) => [...context.files]
};
const uploadProps: UUploadProps = { adapter: uploadAdapter, files: [], max: 4, modelValue: uploadFiles, previewText: 'Preview', removeText: 'Remove', retryText: 'Retry', selectText: 'Select', visible: true };
const uploadPendingState: UUploadAdapterState = { action: 'select', requestId: 1, status: 'pending' };
const uploadSucceededState: UUploadAdapterState = { action: 'remove', requestId: 2, status: 'succeeded', updated: true };
const uploadFailedState: UUploadAdapterState = { action: 'retry', failure: { code: 'adapter-rejected' }, requestId: 3, status: 'failed' };

// <lang><zh-CN>验证 alert 的 show 只表达调用方局部投影，不包含定时器、服务或自动关闭字段。</zh-CN><en>Verifies that alert show expresses only caller-local projection and contains no timer, service, or auto-dismiss field.</en></lang>
const alertTipsProps: UAlertTipsProps = {
  closable: true,
  description: 'Local detail',
  show: true,
  title: 'Local alert',
  type: 'success'
};

// <lang><zh-CN>验证 tag 同时接受数字文字、双可见性和局部字符串 disabled guard；这些值不附带类别、权限或业务含义。</zh-CN><en>Verifies that tag accepts numeric text, dual visibility, and local string disabled guard; these values carry no category, authorization, or business meaning.</en></lang>
const tagProps: UTagProps = {
  clickable: true,
  disabled: 'disabled',
  show: true,
  text: 0,
  visible: true
};

// <lang><zh-CN>P69 操作与内容 props 正例锁定有限 token、caller-owned 文字和纯本地 guard；显式 type alias 赋值证明根入口导出了相应有限 union。</zh-CN><en>P69 action and content props positives lock finite tokens, caller-owned copy, and purely local guards; explicit type-alias assignments prove that the root entry exports the corresponding finite unions.</en></lang>
const buttonVariant: UButtonVariant = 'primary';
const buttonSize: UButtonSize = 'md';
const buttonProps: UButtonProps = { block: true, disabled: false, label: 'Continue', loading: false, loadingText: 'Working', size: buttonSize, variant: buttonVariant };
const iconSize: UIconSize = 'medium';
const iconTone: UIconTone = 'primary';
const iconProps: UIconProps = { disabled: false, label: 'Information', name: 'info', size: iconSize, tone: iconTone };
const textProps: UTextProps = { ellipsis: true, lines: 2, show: true, size: 'md', text: 'Caller-owned copy', type: 'secondary' };

// <lang><zh-CN>P69 信息行、分组和空态 props 正例只描述局部展示与意图启用，不赋予路由、数据查询或加载判断能力。</zh-CN><en>P69 information-row, group, and empty-state props positives describe only local presentation and intent eligibility, without granting routing, data-query, or loading-decision capability.</en></lang>
const cellProps: UCellProps = { clickable: true, description: 'Local description', disabled: false, label: 'Profile', value: 'Ready' };
const cellGroupProps: UCellGroupProps = { bordered: true, title: 'Local group' };
const cellItemProps: UCellItemProps = { arrow: true, clickable: true, disabled: false, label: 2, required: true, title: 'Status', value: 8 };
const emptyProps: UEmptyProps = { actionText: 'Retry', description: 'No local records', show: true, src: '/static/empty.png', text: 'Fallback', title: 'Nothing here' };

// <lang><zh-CN>P69 媒体、分页和 placeholder 正例锁定原生 image mode、有限页面输入与局部 skeleton 几何；它们不声明远端加载器或数据源。</zh-CN><en>P69 media, pagination, and placeholder positives lock native image modes, finite page inputs, and local skeleton geometry; they declare neither a remote loader nor a data source.</en></lang>
const imageMode: UImageMode = 'aspectFill';
const imageProps: UImageProps = { alt: 'Local venue', errorText: 'Unavailable', fluid: true, lazyLoad: true, mode: imageMode, shape: 'rounded', showError: true, size: 'large', src: '/static/venue.png' };
const paginationProps: UPaginationProps = { current: 2, modelValue: 2, nextText: 'Next', pageCount: 5, pageSize: 10, prevText: 'Previous', total: 42 };
const skeletonProps: USkeletonProps = { loading: true, rows: 3, showAvatar: true, showTitle: true };

// <lang><zh-CN>SwipeAction 正例验证 scalar shorthand 与有限 data-record 可共同输入，而事件值始终收束到 string 或 number。</zh-CN><en>The SwipeAction positive verifies that scalar shorthand and finite data records can be supplied together while event values always narrow to string or number.</en></lang>
const swipeValue: USwipeActionValue = 'archive';
const swipeOption: USwipeActionOption = { disabled: false, label: 'Archive', type: 'primary', value: swipeValue };
const swipeInputs: ReadonlyArray<USwipeActionInput> = [swipeOption, 7];
const swipeActionProps: USwipeActionProps = { actions: swipeInputs, closeText: 'Close', disabled: false, open: true, options: ['fallback'], show: false };

// <lang><zh-CN>带事件组件的显式事件别名正例保证这些公开 contracts 可独立用于包装器声明，同时保持 payload 和参数顺序。</zh-CN><en>Explicit event-alias positives for event-bearing components ensure these public contracts can independently type wrapper declarations while retaining payloads and argument order.</en></lang>
const buttonEmits: UButtonEmits = { click: (_event) => undefined };
const cellEmits: UCellEmits = { click: (_event) => undefined };
const cellItemEmits: UCellItemEmits = { click: (_event) => undefined };
const iconEmits: UIconEmits = { click: (_event) => undefined };
const imageEmits: UImageEmits = { click: (_event) => undefined, error: (_event) => undefined, load: (_event) => undefined };
const paginationEmits: UPaginationEmits = { change: (_page) => undefined, 'update:current': (_page) => undefined, 'update:modelValue': (_page) => undefined };
const swipeActionEmits: USwipeActionEmits = { action: (_value) => undefined, click: (_value) => undefined, close: () => undefined, 'update:open': (_open) => undefined };
const textEmits: UTextEmits = { click: (_event) => undefined };
const emptyEmits: UEmptyEmits = { action: (_event) => undefined };
const tagEmits: UTagEmits = { click: (_event) => undefined, close: () => undefined };
const alertTipsEmits: UAlertTipsEmits = { click: () => undefined, close: () => undefined };

/**
 * @lang zh-CN 只接受 `never` 的编译期断言，用于防止无事件别名退化为 Vue 的任意字符串事件签名。
 * @lang en Compile-time assertion that accepts only `never`, preventing event-free aliases from degrading into Vue's arbitrary string-event signature.
 */
type AssertNoPublicEmits<Emits extends never> = Emits;

// <lang><zh-CN>两个无事件别名必须保持为不可实例化的 `never`；若回退到 `{}` 或空 record，此处会立即编译失败。</zh-CN><en>Both event-free aliases must remain uninhabitable `never`; reverting to `{}` or an empty record makes these assertions fail immediately.</en></lang>
type CellGroupHasNoPublicEmits = AssertNoPublicEmits<UCellGroupEmits>;
type SkeletonHasNoPublicEmits = AssertNoPublicEmits<USkeletonEmits>;

// <lang><zh-CN>建立调用方拥有的嵌套模型，证明类型不会把 dotted path 误写成扁平业务模型。</zh-CN><en>Creates a caller-owned nested model, proving the types do not rewrite a dotted path into a flat business model.</en></lang>
const formModel: UFormModel = {
  profile: {
    name: 'Local name'
  }
};

// <lang><zh-CN>验证规则使用当前 runtime 的有限 type、trigger 与 `(value, context)` Promise validator，不接受旧 callback validator。</zh-CN><en>Verifies rules with the current runtime's finite type, trigger, and `(value, context)` Promise validator, without accepting a legacy callback validator.</en></lang>
const formRules: UFormRules = {
  'profile.name': [
    {
      message: 'Name is required',
      required: true,
      trigger: ['change', 'blur']
    },
    {
      asyncValidator: async (value, context) => {
        // <lang><zh-CN>显式赋值验证 validator context 的四个只读成员来自 package declaration。</zh-CN><en>Explicit assignments verify that all four readonly validator-context members come from the package declaration.</en></lang>
        const validatorContext: UFormRuleValidatorContext = context;
        const validatorField: UFormFieldPath = context.field;
        const validatorModel: Readonly<UFormModel> = context.model;
        const validatorRule: Readonly<UFormRule> = context.rule;

        // <lang><zh-CN>收集局部类型证据后只返回当前受控结果，不修改 model 或 rule。</zh-CN><en>After collecting local type evidence, returns only a current controlled result without modifying model or rule.</en></lang>
        void [validatorContext, validatorField, validatorModel, validatorRule, context.trigger];
        return typeof value === 'string' ? true : 'Expected a string';
      },
      message: 'Name must be text',
      type: 'string'
    }
  ]
};

// <lang><zh-CN>嵌套规则正例锁定与 dotted key 等价的 runtime 输入能力。</zh-CN><en>The nested-rule positive example locks the runtime input capability equivalent to a dotted key.</en></lang>
const nestedRules: UFormRules = {
  profile: {
    name: {
      message: 'Name is too short',
      min: 2
    }
  }
};

// <lang><zh-CN>六组件 props 正例逐项覆盖当前调用方输入，不声明未实现的上游扩展。</zh-CN><en>Positive props examples for the six components cover current caller inputs without declaring unimplemented upstream extensions.</en></lang>
const formProps: UFormProps = { disabled: false, labelPosition: 'top', model: formModel, rules: formRules };
const formItemProps: UFormItemProps = { label: 'Name', prop: 'profile.name', readonly: false, rules: formRules['profile.name'], validationState: '' };
const fieldProps: UFieldProps = { label: 'Name', modelValue: 'Local name', placeholder: 'Name', required: true, validationState: 'idle' };
const inputProps: UInputProps = { disabled: false, modelValue: 1, placeholder: 'Value', readonly: false };
const textareaProps: UTextareaProps = { autoHeight: true, focus: false, maxlength: 240, modelValue: 'Notes', showCount: true };
const searchProps: USearchProps = { actionText: 'Search', clearText: 'Clear', modelValue: 'query', searchIcon: 'search', showAction: true, showClear: true };

// <lang><zh-CN>声明组件 ref 只用于编译期读取 InstanceType，不创建 Vue 实例或运行 expose 方法。</zh-CN><en>Declares component refs only for compile-time InstanceType reads and creates no Vue instance or exposed-method execution.</en></lang>
declare const formRef: UFormInstance;
declare const formItemRef: UFormItemInstance;
declare const fieldRef: UFieldInstance;
declare const inputRef: UInputInstance;
declare const textareaRef: UTextareaInstance;
declare const searchRef: USearchInstance;
declare const checkboxRef: UCheckboxInstance;
declare const checkboxGroupRef: UCheckboxGroupInstance;
declare const radioRef: URadioInstance;
declare const radioGroupRef: URadioGroupInstance;
declare const switchRef: USwitchInstance;
declare const pickerRef: UPickerInstance;
declare const calendarRef: UCalendarInstance;
declare const selectRef: USelectInstance;
declare const dropdownRef: UDropdownInstance;
declare const dropdownItemRef: UDropdownItemInstance;
declare const numberBoxRef: UNumberBoxInstance;
declare const rateRef: URateInstance;
declare const sliderRef: USliderInstance;
declare const uploadRef: UUploadInstance;
declare const popupRef: UPopupInstance;
declare const maskRef: UMaskInstance;
declare const transitionRef: UTransitionInstance;
declare const actionSheetRef: UActionSheetInstance;
declare const modalRef: UModalInstance;
declare const toastRef: UToastInstance;
declare const navbarRef: UNavbarInstance;
declare const tabbarRef: UTabbarInstance;
declare const tabsRef: UTabsInstance;
declare const noticeBarRef: UNoticeBarInstance;

// <lang><zh-CN>P69 组件 ref 仅验证精确 InstanceType 的 props、$emit 和无 expose 边界，不实例化组件或触发平台事件。</zh-CN><en>P69 component refs verify only precise InstanceType props, $emit, and no-expose boundaries; they neither instantiate components nor trigger platform events.</en></lang>
declare const buttonRef: UButtonInstance;
declare const cellRef: UCellInstance;
declare const cellGroupRef: UCellGroupInstance;
declare const cellItemRef: UCellItemInstance;
declare const iconRef: UIconInstance;
declare const imageRef: UImageInstance;
declare const paginationRef: UPaginationInstance;
declare const skeletonRef: USkeletonInstance;
declare const swipeActionRef: USwipeActionInstance;
declare const textRef: UTextInstance;
declare const emptyRef: UEmptyInstance;
declare const tagRef: UTagInstance;
declare const alertTipsRef: UAlertTipsInstance;

// <lang><zh-CN>UForm InstanceType 必须暴露七个精确方法，并保持 validate/validateField 始终返回 Promise<boolean>。</zh-CN><en>UForm InstanceType must expose seven precise methods while validate/validateField always return Promise<boolean>.</en></lang>
const allValidationResult: Promise<boolean> = formRef.validate((valid, errors) => {
  // <lang><zh-CN>callback 同时获得 boolean 与完整首错误类型；成功时数组为空。</zh-CN><en>The callback receives both a boolean and the complete first-error type; the array is empty on success.</en></lang>
  const firstError: UFormValidationError | undefined = errors[0];
  void [valid, firstError];
});
const selectedValidationResult: Promise<boolean> = formRef.validateField(['profile.name'], (valid, errors) => {
  // <lang><zh-CN>单字段 callback 与全量校验共用同一稳定形状。</zh-CN><en>The selected-field callback shares the same stable shape as complete validation.</en></lang>
  void [valid, errors];
});
formRef.clearValidate();
formRef.clearValidate('profile.name');
formRef.resetFields();
formRef.setRules(nestedRules);
formRef.requestSubmit();
formRef.requestReset();

// <lang><zh-CN>UFormItem InstanceType 返回首错误或 null，并精确暴露 clear/reset。</zh-CN><en>UFormItem InstanceType returns the first error or null and precisely exposes clear/reset.</en></lang>
const itemValidationResult: Promise<UFormValidationError | null> = formItemRef.validate('blur');
formItemRef.clearValidate();
formItemRef.resetField();

// <lang><zh-CN>事件正例锁定各组件的值、确认、点击和跨平台观察 payload 差异。</zh-CN><en>Positive event examples lock differences among value, confirm, click, and cross-platform observation payloads for each component.</en></lang>
fieldRef.$emit('update:modelValue', 'next field');
fieldRef.$emit('input', 'next field');
fieldRef.$emit('confirm', 'confirmed field');
fieldRef.$emit('click');
inputRef.$emit('update:modelValue', 'next input');
inputRef.$emit('input', 'next input');
inputRef.$emit('focus', { detail: { value: 'next input' } });
inputRef.$emit('blur', { detail: { value: 'next input' } });
inputRef.$emit('confirm', 'confirmed input');
inputRef.$emit('click');
textareaRef.$emit('change', 'next notes');
textareaRef.$emit('confirm', { detail: { value: 'next notes' } });
textareaRef.$emit('click');
searchRef.$emit('change', 'next query');
searchRef.$emit('confirm', { detail: { value: 'next query' } });
searchRef.$emit('click', { type: 'click' });
searchRef.$emit('search', 'next query');
searchRef.$emit('clear');

// <lang><zh-CN>P67 实例事件正例锁定十四组件实际 payload，dropdown 只额外公开 open/close，upload 不获得 expose 方法。</zh-CN><en>P67 instance-event positives lock actual payloads of all fourteen components; only dropdown additionally exposes open/close, while upload gains no exposed method.</en></lang>
checkboxRef.$emit('update:modelValue', true);
checkboxRef.$emit('change', { checked: true, value: 'local-option' });
checkboxGroupRef.$emit('change', ['a', 2]);
radioRef.$emit('select', 7);
radioRef.$emit('change', 7);
radioGroupRef.$emit('update:modelValue', 'selected');
switchRef.$emit('change', 'enabled');
pickerRef.$emit('columnchange', pickerColumnChange);
pickerRef.$emit('confirm', pickerConfirm);
pickerRef.$emit('cancel', pickerCancel);
calendarRef.$emit('change', calendarChange);
calendarRef.$emit('update:viewDate', '2026-09-01');
selectRef.$emit('confirm', selectConfirm);
selectRef.$emit('cancel', selectCancel);
const dropdownOpened: boolean = dropdownRef.open('filters');
const dropdownClosed: boolean = dropdownRef.close();
dropdownRef.$emit('close', 'filters');
dropdownItemRef.$emit('update:modelValue', ['alpha']);
numberBoxRef.$emit('input', 1.5);
rateRef.$emit('change', 4);
sliderRef.$emit('update:modelValue', 0.5);
uploadRef.$emit('select', { event: { type: 'click' }, remainingSlots: 2 });
uploadRef.$emit('preview', { event: { type: 'click' }, file: uploadFiles[0] });
uploadRef.$emit('update:modelValue', [...uploadFiles]);
uploadRef.$emit('adapter-state', uploadPendingState);

// <lang><zh-CN>P68 实例正例锁定 raw event 首参、有限第二参、update→intent payload 与 component-ref exposed 方法。</zh-CN><en>P68 instance positives lock raw-event first arguments, finite second arguments, update-to-intent payloads, and component-ref exposed methods.</en></lang>
const localClickEvent: unknown = { type: 'click' };
popupRef.$emit('update:modelValue', false);
popupRef.$emit('open');
popupRef.$emit('close', localClickEvent, 'mask');
popupRef.close();
maskRef.$emit('click', localClickEvent);
actionSheetRef.$emit('select', actionSheetSelection);
actionSheetRef.$emit('click', 1);
actionSheetRef.$emit('close', localClickEvent, 'cancel');
actionSheetRef.close();
const modalConfirmMetadata: UModalConfirmMetadata = { requestId: 7, source: 'service' };
modalRef.$emit('update:modelValue', false);
modalRef.$emit('confirm', localClickEvent, modalConfirmMetadata);
modalRef.$emit('cancel', localClickEvent, { reason: 'mask', source: 'controlled' });
modalRef.clearLoading();
toastRef.$emit('close', localClickEvent, { reason: 'control', requestId: 8, source: 'component-ref' });
toastRef.show(toastOptions);
toastRef.close();
toastRef.hide();
navbarRef.$emit('left-click', localClickEvent);
navbarRef.$emit('right-click', localClickEvent);
tabbarRef.$emit('update:modelValue', 'profile');
tabbarRef.$emit('change', 'profile');
tabsRef.$emit('update:modelValue', 'details');
tabsRef.$emit('change', 'details');
tabsRef.clickTab(0);
tabsRef.clickTab('details');
noticeBarRef.$emit('click', localClickEvent, 1);
noticeBarRef.$emit('close', localClickEvent);

// <lang><zh-CN>P69 实例正例锁定原始事件、无 payload intent、分页 number 顺序表面和 SwipeAction 标量边界；调用次序与 runtime 发出次序相同。</zh-CN><en>P69 instance positives lock raw events, payload-free intents, the pagination number-order surface, and the SwipeAction scalar boundary; call order mirrors runtime emission order.</en></lang>
buttonRef.$emit('click', localClickEvent);
cellRef.$emit('click', localClickEvent);
cellItemRef.$emit('click', localClickEvent);
iconRef.$emit('click', localClickEvent);
imageRef.$emit('load', localClickEvent);
imageRef.$emit('error', localClickEvent);
imageRef.$emit('click', localClickEvent);
paginationRef.$emit('update:current', 3);
paginationRef.$emit('update:modelValue', 3);
paginationRef.$emit('change', 3);
swipeActionRef.$emit('click', swipeValue);
swipeActionRef.$emit('action', swipeValue);
swipeActionRef.$emit('update:open', false);
swipeActionRef.$emit('close');
textRef.$emit('click', localClickEvent);
emptyRef.$emit('action', localClickEvent);
tagRef.$emit('click', localClickEvent);
tagRef.$emit('close');
alertTipsRef.$emit('click');
alertTipsRef.$emit('close');

// <lang><zh-CN>无事件组件的实例仍保留精确 props 读取，证明它们没有退回 generic component。</zh-CN><en>Instances of event-free components still retain precise prop reads, proving they have not regressed to generic components.</en></lang>
const cellGroupTitle: string | undefined = cellGroupRef.$props.title;
const skeletonRows: number | undefined = skeletonRef.$props.rows;

// @ts-expect-error <lang><zh-CN>UCellGroup 没有公开事件，实例 `$emit` 不能接受任意字符串。</zh-CN><en>UCellGroup has no public events, so its instance `$emit` cannot accept an arbitrary string.</en></lang>
cellGroupRef.$emit('anything');
// @ts-expect-error <lang><zh-CN>USkeleton 没有公开事件，实例 `$emit` 不能接受任意字符串。</zh-CN><en>USkeleton has no public events, so its instance `$emit` cannot accept an arbitrary string.</en></lang>
skeletonRef.$emit('anything');

// <lang><zh-CN>invalid-rule 是 runtime 对非法 pattern 配置返回的公开代码，必须可由消费方穷举处理。</zh-CN><en>invalid-rule is the public code returned by runtime for an invalid pattern configuration and must be available for exhaustive consumer handling.</en></lang>
const invalidRuleError: UFormValidationError = {
  code: 'invalid-rule',
  message: 'Invalid rule configuration',
  prop: 'profile.name',
  ruleIndex: 0,
  trigger: ''
};

// <lang><zh-CN>以下反例必须产生 TypeScript 错误；若声明退回 generic/any，对应 expect-error 会因未使用而使 fixture 失败。</zh-CN><en>The following negative examples must produce TypeScript errors; if declarations regress to generic/any, the corresponding expect-error becomes unused and fails the fixture.</en></lang>
const invalidRuleType: UFormRule = {
  // @ts-expect-error <lang><zh-CN>email 不在当前六种内建 type 中。</zh-CN><en>email is not one of the current six built-in types.</en></lang>
  type: 'email'
};
const invalidPatternRule: UFormRule = {
  // @ts-expect-error <lang><zh-CN>runtime 不把字符串动态编译为 RegExp。</zh-CN><en>Runtime does not dynamically compile a string into RegExp.</en></lang>
  pattern: '^name$'
};
const legacyValidatorRule: UFormRule = {
  // @ts-expect-error <lang><zh-CN>当前 validator 是 (value, context)，不是旧 (rule, value, callback)。</zh-CN><en>The current validator is (value, context), not legacy (rule, value, callback).</en></lang>
  validator: (_rule: UFormRule, _value: unknown, _callback: () => void) => true
};
const invalidValidatorResultRule: UFormRule = {
  // @ts-expect-error <lang><zh-CN>number 不是受控 validator 结果。</zh-CN><en>A number is not a controlled validator result.</en></lang>
  validator: () => 1
};
const invalidFormProps: UFormProps = {
  // @ts-expect-error <lang><zh-CN>form model 必须是对象根。</zh-CN><en>A form model must be an object root.</en></lang>
  model: 'invalid model'
};
// @ts-expect-error <lang><zh-CN>字段选择只接受 string 或 readonly string[]。</zh-CN><en>A field selector accepts only a string or readonly string array.</en></lang>
formRef.validateField(7);
// @ts-expect-error <lang><zh-CN>公开 item trigger 只有空值、change 或 blur。</zh-CN><en>The public item trigger is limited to empty, change, or blur.</en></lang>
formItemRef.validate('submit');
// @ts-expect-error <lang><zh-CN>兼容 callback 的 valid 参数是 boolean。</zh-CN><en>The valid argument of the compatibility callback is boolean.</en></lang>
formRef.validate((valid: string, _errors) => void valid);
// @ts-expect-error <lang><zh-CN>UField confirm 只携带字符串。</zh-CN><en>UField confirm carries only a string.</en></lang>
fieldRef.$emit('confirm', { value: 'invalid' });
// @ts-expect-error <lang><zh-CN>UInput click 明确无 payload。</zh-CN><en>UInput click explicitly has no payload.</en></lang>
inputRef.$emit('click', { type: 'click' });
// @ts-expect-error <lang><zh-CN>UInput 受控更新只携带字符串。</zh-CN><en>UInput controlled updates carry only a string.</en></lang>
inputRef.$emit('update:modelValue', { value: 'invalid' });
// @ts-expect-error <lang><zh-CN>UTextarea click 明确无 payload。</zh-CN><en>UTextarea click explicitly has no payload.</en></lang>
textareaRef.$emit('click', { type: 'click' });
// @ts-expect-error <lang><zh-CN>USearch clear 明确无 payload。</zh-CN><en>USearch clear explicitly has no payload.</en></lang>
searchRef.$emit('clear', 'invalid');
// <lang><zh-CN>负向类型 fixture 锁定 USearch 只接受空串或固定 `search` 装饰键，不将任意字符串扩大为图标 registry。</zh-CN><en>This negative type fixture locks USearch to the empty string or fixed `search` decoration key and does not broaden arbitrary strings into an icon registry.</en></lang>
const invalidSearchIconProps: USearchProps = {
  // @ts-expect-error <lang><zh-CN>前置装饰只接受空串或固定 `search`，不开放任意 icon key。</zh-CN><en>The leading decoration accepts only the empty string or fixed `search` and exposes no arbitrary icon key.</en></lang>
  searchIcon: 'custom-icon'
};
// @ts-expect-error <lang><zh-CN>checkbox change 的 value 只接受透明字符串/数字键。</zh-CN><en>A checkbox change value accepts only a transparent string/number key.</en></lang>
checkboxRef.$emit('change', { checked: true, value: false });
// @ts-expect-error <lang><zh-CN>switch 不接受对象作为 active/inactive 映射值。</zh-CN><en>A switch does not accept an object as an active/inactive mapped value.</en></lang>
switchRef.$emit('update:modelValue', { enabled: true });
const invalidPickerConfirm: UPickerConfirmDetail = {
  indexes: [0],
  // @ts-expect-error <lang><zh-CN>confirm 只在全部列解析后发出，因此 option 不可为 null。</zh-CN><en>Confirmation emits only after every column resolves, so an option cannot be null.</en></lang>
  options: [null],
  value: 1,
  values: [1]
};
// @ts-expect-error <lang><zh-CN>Gregorian change 结果必须包含完整 day 字段。</zh-CN><en>A Gregorian change result must include the complete day field.</en></lang>
const invalidCalendarChange: UCalendarChangeDetail = { month: 8, value: '2026-08-11', year: 2026 };
const invalidSelectConfirm: USelectConfirmResult = {
  index: -1,
  // @ts-expect-error <lang><zh-CN>select confirm 的 option 必须已解析；只有 cancel 允许 null。</zh-CN><en>A select confirmation option must be resolved; only cancellation permits null.</en></lang>
  option: null,
  value: 'orphan'
};
// @ts-expect-error <lang><zh-CN>dropdown registry name 只接受字符串或数字。</zh-CN><en>A dropdown registry name accepts only a string or number.</en></lang>
dropdownRef.open(true);
// @ts-expect-error <lang><zh-CN>dropdown-item model 只接受透明标量或透明值数组。</zh-CN><en>A dropdown-item model accepts only a transparent scalar or transparent-value array.</en></lang>
dropdownItemRef.$emit('change', { value: 'invalid' });
// @ts-expect-error <lang><zh-CN>number-box 事件只携带 number。</zh-CN><en>A number-box event carries only a number.</en></lang>
numberBoxRef.$emit('change', '1');
// @ts-expect-error <lang><zh-CN>rate 事件只携带 number。</zh-CN><en>A rate event carries only a number.</en></lang>
rateRef.$emit('input', '4');
// @ts-expect-error <lang><zh-CN>slider 事件只携带 number。</zh-CN><en>A slider event carries only a number.</en></lang>
sliderRef.$emit('change', { value: 0.5 });
const invalidUploadAdapter: UUploadAdapter = {
  // @ts-expect-error <lang><zh-CN>adapter 只能返回 void、下一数组或相应 thenable，不能返回任意对象。</zh-CN><en>An adapter may return only void, a next array, or the corresponding thenable, not an arbitrary object.</en></lang>
  select: () => ({ label: 'invalid result' })
};
const actionNarrowingUploadAdapter: UUploadAdapter = {
  preview: (context) => {
    // @ts-expect-error <lang><zh-CN>preview context 的 action 精确为 preview，不能作为 remove 使用。</zh-CN><en>The action in a preview context is exactly preview and cannot be used as remove.</en></lang>
    const invalidAction: 'remove' = context.action;
    void invalidAction;
  }
};
// @ts-expect-error <lang><zh-CN>succeeded 状态必须明确 updated 字段。</zh-CN><en>A succeeded state must explicitly include the updated field.</en></lang>
const invalidUploadState: UUploadAdapterState = { action: 'select', requestId: 4, status: 'succeeded' };
// @ts-expect-error <lang><zh-CN>upload 文件项只接受可读标量或文件状态记录。</zh-CN><en>An upload file entry accepts only a readable scalar or file-state record.</en></lang>
const invalidUploadFile: UUploadFile = true;
// @ts-expect-error <lang><zh-CN>UUpload 没有公开 chooser、adapter 或文件操作 expose 方法。</zh-CN><en>UUpload exposes no chooser, adapter, or file-operation method.</en></lang>
uploadRef.select();

// @ts-expect-error <lang><zh-CN>useToast 必须绑定调用方显式创建的 scope，不存在隐式全局默认值。</zh-CN><en>UseToast must bind a caller-explicit scope; there is no implicit global default.</en></lang>
useToast();
// @ts-expect-error <lang><zh-CN>useModal 同样要求显式 scope，不自动发现页面 host。</zh-CN><en>UseModal likewise requires an explicit scope and does not discover a page host.</en></lang>
useModal();
const forgedFeedbackScopeProps: UModalProps = {
  // @ts-expect-error <lang><zh-CN>只有 createUFeedbackScope 返回值具备未导出的 nominal identity。</zh-CN><en>Only a createUFeedbackScope result has the unexported nominal identity.</en></lang>
  serviceScope: { dispose: () => undefined }
};
const invalidToastCallback: UToastOptions = {
  // @ts-expect-error <lang><zh-CN>toast options 不接受或执行 callback。</zh-CN><en>Toast options neither accept nor execute a callback.</en></lang>
  callback: () => undefined,
  message: 'Unsafe extension'
};
const invalidModalCallback: UModalOptions = {
  // @ts-expect-error <lang><zh-CN>modal options 不承载业务 callback。</zh-CN><en>Modal options do not carry a business callback.</en></lang>
  callback: () => undefined,
  content: 'Unsafe extension'
};
const invalidToastTone: UToastProps = {
  // @ts-expect-error <lang><zh-CN>neutral 不属于 toast 的四种有限 tone。</zh-CN><en>Neutral is outside the four finite toast tones.</en></lang>
  tone: 'neutral'
};
const invalidToastPosition: UToastOptions = {
  message: 'Invalid position',
  // @ts-expect-error <lang><zh-CN>toast position 只能是 top/center/bottom。</zh-CN><en>Toast position is limited to top/center/bottom.</en></lang>
  position: 'viewport'
};
const invalidNoticeTone: UNoticeBarProps = {
  // @ts-expect-error <lang><zh-CN>notice-bar 使用与 feedback token 对齐的有限 tone。</zh-CN><en>Notice-bar uses finite tones aligned with feedback tokens.</en></lang>
  tone: 'brand'
};
// @ts-expect-error <lang><zh-CN>popup close 第二参数必须是有限关闭原因。</zh-CN><en>The second popup-close argument must be a finite close reason.</en></lang>
popupRef.$emit('close', localClickEvent, 'outside');
// @ts-expect-error <lang><zh-CN>action-sheet select 需要结构化 value/index，不接受裸索引。</zh-CN><en>Action-sheet selection requires structured value/index and does not accept a bare index.</en></lang>
actionSheetRef.$emit('select', 1);
const invalidActionSheetItem: UActionSheetItem = {
  label: 'Invalid selected',
  // @ts-expect-error <lang><zh-CN>selected 必须是 Boolean data state，不能使用字符串模拟。</zh-CN><en>Selected must be Boolean data state and cannot be imitated by a string.</en></lang>
  selected: 'true'
};
const invalidActionSheetProps: UActionSheetProps = {
  // @ts-expect-error <lang><zh-CN>selectedText 只接受调用方字符串文案，不能接受数值状态码。</zh-CN><en>SelectedText accepts caller string copy only and rejects numeric status codes.</en></lang>
  selectedText: 1
};
// @ts-expect-error <lang><zh-CN>modal service confirm metadata 必须包含数值 requestId。</zh-CN><en>Modal service-confirm metadata must include a numeric request ID.</en></lang>
modalRef.$emit('confirm', localClickEvent, { source: 'service' });
// @ts-expect-error <lang><zh-CN>toast close metadata 的 reason 只能为 control。</zh-CN><en>The reason in toast-close metadata can only be control.</en></lang>
toastRef.$emit('close', localClickEvent, { reason: 'timeout', requestId: 1, source: 'service' });
// @ts-expect-error <lang><zh-CN>notice-bar click 必须同时携带当前投影索引。</zh-CN><en>A notice-bar click must also carry the current projected index.</en></lang>
noticeBarRef.$emit('click', localClickEvent);
// @ts-expect-error <lang><zh-CN>mask ref 没有 close expose；关闭决定仍由调用方拥有。</zh-CN><en>A mask ref has no close expose; the caller still owns the close decision.</en></lang>
maskRef.close();
// @ts-expect-error <lang><zh-CN>modal component ref 不公开 service show；必须通过 useModal(scope)。</zh-CN><en>A modal component ref does not expose service show; useModal(scope) is required.</en></lang>
modalRef.show(modalOptions);
// @ts-expect-error <lang><zh-CN>tabs ref 不取得路由能力。</zh-CN><en>A tabs ref acquires no routing capability.</en></lang>
tabsRef.navigate('details');
// @ts-expect-error <lang><zh-CN>confirm helper 必须同时获得调用方确认与取消标签。</zh-CN><en>The confirm helper must receive both caller confirmation and cancellation labels.</en></lang>
modalController.confirm({ confirmText: 'Continue', content: 'Missing cancel label' });
// @ts-expect-error <lang><zh-CN>service toast 输入也拒绝 URL/导航扩展。</zh-CN><en>Service toast input also rejects URL/navigation extensions.</en></lang>
toastController.show({ message: 'Unsafe URL', url: '/pages/private' });
// @ts-expect-error <lang><zh-CN>toast options 必须在类型层提供 message 或 title，不能只给生命周期字段。</zh-CN><en>Toast options must provide message or title at the type layer, not lifecycle fields alone.</en></lang>
toastController.show({ duration: 100 });
// @ts-expect-error <lang><zh-CN>modal options 必须在类型层提供 title 或 content，不能创建无语义遮罩。</zh-CN><en>Modal options must provide title or content at the type layer and cannot create a semantic-free mask.</en></lang>
modalController.show({ confirmText: 'Continue' });
// @ts-expect-error <lang><zh-CN>confirm helper 除双 control 标签外仍必须提供 title 或 content。</zh-CN><en>The confirm helper still requires title or content in addition to both control labels.</en></lang>
modalController.confirm({ confirmText: 'Continue', cancelText: 'Cancel' });

// <lang><zh-CN>P69 有限 union 反例覆盖视觉 token 与原生 mode；任何回退到 string/unknown 都会让 expect-error 失效。</zh-CN><en>P69 finite-union negatives cover visual tokens and native modes; any regression to string/unknown makes the expect-error directives fail.</en></lang>
const invalidButtonProps: UButtonProps = {
  // @ts-expect-error <lang><zh-CN>button variant 仅允许 primary、secondary 或 text。</zh-CN><en>Button variant is limited to primary, secondary, or text.</en></lang>
  variant: 'danger'
};
const invalidIconProps: UIconProps = {
  // @ts-expect-error <lang><zh-CN>icon size 只接受三个受控文字几何 token。</zh-CN><en>Icon size accepts only the three controlled text-geometry tokens.</en></lang>
  size: 'xl'
};
const invalidImageProps: UImageProps = {
  // @ts-expect-error <lang><zh-CN>UImage 不发明 viewport cover mode，只透传已声明的原生模式。</zh-CN><en>UImage invents no viewport cover mode and forwards only declared native modes.</en></lang>
  mode: 'cover'
};
const invalidTextProps: UTextProps = {
  // @ts-expect-error <lang><zh-CN>文字 type 只允许五种有限语义 tone。</zh-CN><en>Text type is limited to five finite semantic tones.</en></lang>
  type: 'info'
};
const invalidTagProps: UTagProps = {
  // @ts-expect-error <lang><zh-CN>tag shape 只允许 square、rounded 或 pill。</zh-CN><en>Tag shape is limited to square, rounded, or pill.</en></lang>
  shape: 'circle'
};
const invalidTabbarItem: UTabbarItem = {
  // @ts-expect-error <lang><zh-CN>tabbar icon 是 caller-owned string locator，不接受任意对象或动态命令。</zh-CN><en>A tabbar icon is a caller-owned string locator and accepts no arbitrary object or dynamic command.</en></lang>
  icon: { source: '/home.png' }
};
const invalidAlertTipsProps: UAlertTipsProps = {
  // @ts-expect-error <lang><zh-CN>alert type 使用 error 而非未声明的 danger alias。</zh-CN><en>Alert type uses error rather than an undeclared danger alias.</en></lang>
  type: 'danger'
};

// <lang><zh-CN>P69 单事件 payload 反例锁定 number、boolean 与原始事件差异，避免包装器把不同 intent 合并为宽泛 any。</zh-CN><en>P69 single-event payload negatives lock number, boolean, and raw-event distinctions, preventing wrappers from merging different intents into broad any.</en></lang>
// @ts-expect-error <lang><zh-CN>分页写回只携带 number，不携带包装对象。</zh-CN><en>Pagination writeback carries only a number, not a wrapper object.</en></lang>
paginationRef.$emit('update:current', { page: 3 });
// @ts-expect-error <lang><zh-CN>分页 change 同样只携带 number。</zh-CN><en>Pagination change likewise carries only a number.</en></lang>
paginationRef.$emit('change', '3');
// @ts-expect-error <lang><zh-CN>SwipeAction 的 update:open 是 boolean caller writeback，不是字符串状态。</zh-CN><en>SwipeAction update:open is a boolean caller writeback, not a string state.</en></lang>
swipeActionRef.$emit('update:open', 'false');
// @ts-expect-error <lang><zh-CN>button click 要求原始事件参数，不能省略。</zh-CN><en>Button click requires its raw-event argument and cannot omit it.</en></lang>
buttonRef.$emit('click');
// @ts-expect-error <lang><zh-CN>UEmpty action 要求原始 control 事件参数。</zh-CN><en>UEmpty action requires the raw control-event argument.</en></lang>
emptyRef.$emit('action');

// <lang><zh-CN>SwipeAction 反例锁定 options 输入和两个操作事件都只能归一化为 string 或 number，拒绝 object payload 泄漏。</zh-CN><en>SwipeAction negatives lock option input and both action events to string-or-number normalization, rejecting object-payload leakage.</en></lang>
const invalidSwipeActionProps: USwipeActionProps = {
  options: [
    {
      // @ts-expect-error <lang><zh-CN>option value 不接受对象；runtime 只快照透明标量。</zh-CN><en>Option value rejects objects; runtime snapshots only transparent scalars.</en></lang>
      value: { id: 'unsafe' }
    }
  ]
};
// @ts-expect-error <lang><zh-CN>SwipeAction click 只携带 string 或 number。</zh-CN><en>SwipeAction click carries only a string or number.</en></lang>
swipeActionRef.$emit('click', { value: 'archive' });
// @ts-expect-error <lang><zh-CN>SwipeAction action 不回传完整 option record。</zh-CN><en>SwipeAction action does not return the complete option record.</en></lang>
swipeActionRef.$emit('action', swipeOption);

// <lang><zh-CN>Alert 与 Tag 的无 payload 反例防止 close/click 被误扩展为原始事件或业务值。</zh-CN><en>Payload-free Alert and Tag negatives prevent close/click from being broadened into raw events or business values.</en></lang>
// @ts-expect-error <lang><zh-CN>alert click 明确无 payload。</zh-CN><en>Alert click explicitly has no payload.</en></lang>
alertTipsRef.$emit('click', localClickEvent);
// @ts-expect-error <lang><zh-CN>alert close 明确无 payload。</zh-CN><en>Alert close explicitly has no payload.</en></lang>
alertTipsRef.$emit('close', 'dismiss');
// @ts-expect-error <lang><zh-CN>tag close 明确无 payload，caller 自行更新 visible/show。</zh-CN><en>Tag close explicitly has no payload; the caller updates visible/show itself.</en></lang>
tagRef.$emit('close', localClickEvent);

// <lang><zh-CN>P69 实例都没有 defineExpose 能力；这些反例防止通用组件类型意外开放命令式方法。</zh-CN><en>P69 instances have no defineExpose capabilities; these negatives prevent a generic component type from accidentally opening imperative methods.</en></lang>
// @ts-expect-error <lang><zh-CN>UButton 不公开 click 命令；交互只能来自平台事件。</zh-CN><en>UButton exposes no click command; interaction originates only from platform events.</en></lang>
buttonRef.click();
// @ts-expect-error <lang><zh-CN>UCell 不公开 activate 命令；clickable 只控制本地 intent。</zh-CN><en>UCell exposes no activate command; clickable only controls local intent eligibility.</en></lang>
cellRef.activate();
// @ts-expect-error <lang><zh-CN>UCellGroup 不注册或公开 addItem 方法。</zh-CN><en>UCellGroup neither registers nor exposes an addItem method.</en></lang>
cellGroupRef.addItem(cellItemRef);
// @ts-expect-error <lang><zh-CN>UCellItem 不公开 navigate 命令；arrow 不具有路由语义。</zh-CN><en>UCellItem exposes no navigate command; arrow carries no routing semantics.</en></lang>
cellItemRef.navigate();
// @ts-expect-error <lang><zh-CN>UIcon 不公开 register 命令，也不拥有字体 registry。</zh-CN><en>UIcon exposes no register command and owns no font registry.</en></lang>
iconRef.register('custom');
// @ts-expect-error <lang><zh-CN>UImage 不公开 reload；来源和重试由调用方拥有。</zh-CN><en>UImage exposes no reload; the caller owns source and retry decisions.</en></lang>
imageRef.reload();
// @ts-expect-error <lang><zh-CN>UPagination 不公开 next 命令；调用方通过 props 和事件受控更新。</zh-CN><en>UPagination exposes no next command; the caller controls updates through props and events.</en></lang>
paginationRef.next();
// @ts-expect-error <lang><zh-CN>USkeleton 不公开 stop 命令；loading 始终由 caller prop 控制。</zh-CN><en>USkeleton exposes no stop command; loading always remains caller-controlled through a prop.</en></lang>
skeletonRef.stop();
// @ts-expect-error <lang><zh-CN>USwipeAction 不公开 close 命令，只发出 caller-owned 关闭意图。</zh-CN><en>USwipeAction exposes no close command and only emits a caller-owned close intent.</en></lang>
swipeActionRef.close();
// @ts-expect-error <lang><zh-CN>UText 不公开 expand 命令；lines 仅是 caller-owned 展示候选。</zh-CN><en>UText exposes no expand command; lines is only a caller-owned presentation candidate.</en></lang>
textRef.expand();
// @ts-expect-error <lang><zh-CN>UEmpty 不公开 retry 命令；组件只发出 action intent。</zh-CN><en>UEmpty exposes no retry command; the component emits only an action intent.</en></lang>
emptyRef.retry();
// @ts-expect-error <lang><zh-CN>UTag 不公开 hide 命令；visible/show 由 caller 更新。</zh-CN><en>UTag exposes no hide command; visible/show are updated by the caller.</en></lang>
tagRef.hide();
// @ts-expect-error <lang><zh-CN>UAlertTips 不公开 dismiss 命令；close 只是 caller-owned intent。</zh-CN><en>UAlertTips exposes no dismiss command; close is only a caller-owned intent.</en></lang>
alertTipsRef.dismiss();

// <lang><zh-CN>验证显式 runtime export、plugin、可选 global declaration 与 locale helper 的静态形状；没有产生 import-time 副作用。</zh-CN><en>Verifies the static shapes of explicit runtime exports, plugin, optional global declaration, and locale helper; no import-time side effect occurs.</en></lang>
const plugin: Plugin = UView;
const globalCheckbox: GlobalComponents['UCheckbox'] = UCheckbox;
// <lang><zh-CN>checkbox group 的可选 global 映射必须解析到同一精确组件值。</zh-CN><en>The optional checkbox-group global mapping must resolve to the same precise component value.</en></lang>
const globalCheckboxGroup: GlobalComponents['UCheckboxGroup'] = UCheckboxGroup;
// <lang><zh-CN>radio leaf 的可选 global 映射只做静态赋值，不注册应用。</zh-CN><en>The optional radio-leaf global mapping performs static assignment only and registers no application.</en></lang>
const globalRadio: GlobalComponents['URadio'] = URadio;
// <lang><zh-CN>radio group 的可选 global 映射必须保留其精确受控实例类型。</zh-CN><en>The optional radio-group global mapping must retain its precise controlled-instance type.</en></lang>
const globalRadioGroup: GlobalComponents['URadioGroup'] = URadioGroup;
// <lang><zh-CN>switch 的可选 global 映射验证 package augmentation 没有遗漏该组件。</zh-CN><en>The optional switch global mapping verifies the package augmentation does not omit this component.</en></lang>
const globalSwitch: GlobalComponents['USwitch'] = USwitch;
// <lang><zh-CN>picker 的可选 global 映射与具名导出保持同一组件类型。</zh-CN><en>The optional picker global mapping retains the same component type as the named export.</en></lang>
const globalPicker: GlobalComponents['UPicker'] = UPicker;
// <lang><zh-CN>P69 十三个展示组件的可选 global augmentation 必须与精确具名导出保持同一类型；赋值只检查映射，不执行注册。</zh-CN><en>The optional global augmentation of all thirteen P69 display components must retain the same types as their precise named exports; assignments check mappings only and perform no registration.</en></lang>
const globalButton: GlobalComponents['UButton'] = UButton;
const globalCell: GlobalComponents['UCell'] = UCell;
const globalCellGroup: GlobalComponents['UCellGroup'] = UCellGroup;
const globalCellItem: GlobalComponents['UCellItem'] = UCellItem;
const globalIcon: GlobalComponents['UIcon'] = UIcon;
const globalImage: GlobalComponents['UImage'] = UImage;
const globalPagination: GlobalComponents['UPagination'] = UPagination;
const globalSkeleton: GlobalComponents['USkeleton'] = USkeleton;
const globalSwipeAction: GlobalComponents['USwipeAction'] = USwipeAction;
const globalText: GlobalComponents['UText'] = UText;
const globalEmpty: GlobalComponents['UEmpty'] = UEmpty;
const globalTag: GlobalComponents['UTag'] = UTag;
const globalAlertTips: GlobalComponents['UAlertTips'] = UAlertTips;

// <lang><zh-CN>其余可选 global augmentation 中的展示与表单/输入组件继续只检查类型映射，不执行组件注册。</zh-CN><en>Remaining display and form/input components in optional global augmentation continue to check only type mappings and execute no component registration.</en></lang>
const globalActionSheet: GlobalComponents['UActionSheet'] = UActionSheet;
const globalCalendar: GlobalComponents['UCalendar'] = UCalendar;
const globalDropdown: GlobalComponents['UDropdown'] = UDropdown;
const globalDropdownItem: GlobalComponents['UDropdownItem'] = UDropdownItem;
const globalField: GlobalComponents['UField'] = UField;
const globalForm: GlobalComponents['UForm'] = UForm;
const globalFormItem: GlobalComponents['UFormItem'] = UFormItem;
const globalInput: GlobalComponents['UInput'] = UInput;
const globalMask: GlobalComponents['UMask'] = UMask;
const globalModal: GlobalComponents['UModal'] = UModal;
const globalNavbar: GlobalComponents['UNavbar'] = UNavbar;
const globalNoticeBar: GlobalComponents['UNoticeBar'] = UNoticeBar;
const globalNumberBox: GlobalComponents['UNumberBox'] = UNumberBox;
const globalPopup: GlobalComponents['UPopup'] = UPopup;
const globalRate: GlobalComponents['URate'] = URate;
const globalSearch: GlobalComponents['USearch'] = USearch;
const globalSelect: GlobalComponents['USelect'] = USelect;
const globalSlider: GlobalComponents['USlider'] = USlider;
const globalTabbar: GlobalComponents['UTabbar'] = UTabbar;
const globalTabs: GlobalComponents['UTabs'] = UTabs;
const globalTextarea: GlobalComponents['UTextarea'] = UTextarea;
const globalToast: GlobalComponents['UToast'] = UToast;
const globalTransition: GlobalComponents['UTransition'] = UTransition;
const globalUpload: GlobalComponents['UUpload'] = UUpload;
const locale = useULocale(normalizeULocale('en'));

// <lang><zh-CN>收集引用以防止编译器把 fixture 的 package-consumption 断言优化成未使用的声明。</zh-CN><en>Collects references so the compiler cannot reduce this fixture's package-consumption assertions to unused declarations.</en></lang>
void [
  actionSheetItems,
  actionSheetProps,
  actionSheetSelection,
  invalidActionSheetItem,
  invalidActionSheetProps,
  actionNarrowingUploadAdapter,
  alertTipsEmits,
  alertTipsProps,
  allValidationResult,
  buttonEmits,
  buttonProps,
  buttonSize,
  buttonVariant,
  calendarChange,
  calendarProps,
  cellEmits,
  cellGroupProps,
  cellGroupTitle,
  cellItemEmits,
  cellItemProps,
  cellProps,
  checkboxGroupProps,
  checkboxProps,
  dropdownClosed,
  dropdownItemProps,
  dropdownOpened,
  dropdownProps,
  emptyEmits,
  emptyProps,
  fieldProps,
  feedbackScope,
  forgedFeedbackScopeProps,
  globalActionSheet,
  globalAlertTips,
  globalButton,
  globalCalendar,
  globalCell,
  globalCellGroup,
  globalCellItem,
  globalCheckbox,
  globalCheckboxGroup,
  globalDropdown,
  globalDropdownItem,
  globalEmpty,
  globalField,
  globalForm,
  globalFormItem,
  globalInput,
  globalIcon,
  globalImage,
  globalMask,
  globalModal,
  globalNavbar,
  globalNoticeBar,
  globalNumberBox,
  globalPagination,
  globalPicker,
  globalRadio,
  globalRadioGroup,
  globalRate,
  globalPopup,
  globalSearch,
  globalSelect,
  globalSkeleton,
  globalSlider,
  globalSwitch,
  globalSwipeAction,
  globalTabbar,
  globalTabs,
  globalTag,
  globalText,
  globalTextarea,
  globalToast,
  globalTransition,
  globalUpload,
  formModel,
  formProps,
  formItemProps,
  formRules,
  iconEmits,
  iconProps,
  iconSize,
  iconTone,
  imageEmits,
  imageMode,
  imageProps,
  inputProps,
  invalidAlertTipsProps,
  invalidButtonProps,
  invalidCalendarChange,
  invalidFormProps,
  invalidIconProps,
  invalidImageProps,
  invalidModalCallback,
  invalidNoticeTone,
  invalidPatternRule,
  invalidPickerConfirm,
  invalidRuleError,
  invalidRuleType,
  invalidSelectConfirm,
  invalidSwipeActionProps,
  invalidTagProps,
  invalidTextProps,
  invalidUploadAdapter,
  invalidUploadFile,
  invalidUploadState,
  invalidValidatorResultRule,
  invalidToastCallback,
  invalidToastPosition,
  invalidToastTone,
  itemValidationResult,
  legacyValidatorRule,
  locale.value,
  maskProps,
  modalClearResult,
  modalCloseResult,
  modalConfirmMetadata,
  modalConfirmOptions,
  modalConfirmResult,
  modalOptions,
  modalProps,
  modalShowResult,
  navbarProps,
  nestedRules,
  numberBoxProps,
  noticeBarProps,
  paginationEmits,
  paginationProps,
  pickerCancel,
  pickerColumnChange,
  pickerConfirm,
  pickerOptions,
  pickerProps,
  plugin,
  popupProps,
  radioGroupProps,
  radioProps,
  rateProps,
  searchProps,
  selectCancel,
  selectConfirm,
  selectProps,
  selectedValidationResult,
  skeletonProps,
  skeletonRows,
  sliderProps,
  switchProps,
  subpathFeedbackScope,
  subpathModalResult,
  subpathToastResult,
  swipeActionEmits,
  swipeActionProps,
  swipeInputs,
  swipeOption,
  swipeValue,
  tabbarProps,
  tabsItems,
  tabsProps,
  tagEmits,
  textareaProps,
  textEmits,
  textProps,
  toastCloseResult,
  toastLoadingResult,
  toastOptions,
  toastProps,
  toastShowResult,
  transitionProps,
  transitionRef,
  UActionSheet,
  UAlertTips,
  UButton,
  UCalendar,
  UCell,
  UCellGroup,
  UCellItem,
  UCheckboxGroup,
  UDropdown,
  UDropdownItem,
  UEmpty,
  UField,
  UForm,
  UFormItem,
  UIcon,
  UImage,
  UInput,
  UMask,
  UModal,
  UNavbar,
  UNoticeBar,
  UNumberBox,
  UPagination,
  UPicker,
  UPopup,
  URadio,
  URadioGroup,
  URate,
  USearch,
  USelect,
  USkeleton,
  USlider,
  USwipeAction,
  USwitch,
  UTabbar,
  UTabs,
  tabItems,
  tagProps,
  UTag,
  UText,
  UTextarea,
  UToast,
  UTransition,
  uploadAdapter,
  uploadFailedState,
  uploadFiles,
  uploadProps,
  uploadSucceededState,
  UUpload
];
