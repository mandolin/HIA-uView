/**
 * @module hia-uview-ui-global-components
 * @lang zh-CN 提供可选的 Vue template 全局组件类型增强。导入该入口只影响 TypeScript 编译；它不在 runtime 注册组件、注入样式或启用 Easycom。
 * @lang en Provides optional Vue-template global-component type augmentation. Importing this entry affects TypeScript compilation only; it neither registers runtime components nor injects styles or enables Easycom.
 */

import type {
  UAlertTips,
  UCalendar,
  UCheckbox,
  UCheckboxGroup,
  UDropdown,
  UDropdownItem,
  UField,
  UForm,
  UFormItem,
  UInput,
  UNoticeBar,
  UNumberBox,
  UPicker,
  URadio,
  URadioGroup,
  URate,
  USearch,
  USelect,
  USlider,
  USwitch,
  UTabbar,
  UTag,
  UTextarea,
  UUpload
} from './index';

/**
 * @lang zh-CN 仅声明当前已审计的 choice、picker/date、dropdown、numeric、controlled upload、local tabbar、banner、有限展示与 form/input 名称。其余组件必须继续采用显式 named import，直到具备逐项类型 contract。
 * @lang en Declares only currently audited choice, picker/date, dropdown, numeric, controlled-upload, local-tabbar, banner, finite-display, and form/input names. Remaining components must continue using explicit named imports until per-item type contracts exist.
 */
declare module 'vue' {
  interface GlobalComponents {
    /** 中文：caller-controlled 局部提示条。English: Caller-controlled local alert strip. */
    UAlertTips: typeof UAlertTips;
    /** 中文：受控单月 Gregorian 日历。English: Controlled single-month Gregorian calendar. */
    UCalendar: typeof UCalendar;
    /** 中文：受控 checkbox。English: Controlled checkbox. */
    UCheckbox: typeof UCheckbox;
    /** 中文：受控 checkbox group。English: Controlled checkbox group. */
    UCheckboxGroup: typeof UCheckboxGroup;
    /** 中文：受控 legacy 选择与显式 name registry owner。English: Controlled legacy-selection and explicit-name registry owner. */
    UDropdown: typeof UDropdown;
    /** 中文：独立 legacy 或 registry options 下拉子项。English: Independent legacy or registry-options dropdown child. */
    UDropdownItem: typeof UDropdownItem;
    /** 中文：内建受控输入或 caller-owned slot 字段。English: Field with a built-in controlled input or caller-owned slot. */
    UField: typeof UField;
    /** 中文：表单 owner、registry 与校验编排。English: Form owner, registry, and validation orchestration. */
    UForm: typeof UForm;
    /** 中文：单字段注册、校验与错误投影。English: Single-field registration, validation, and error projection. */
    UFormItem: typeof UFormItem;
    /** 中文：受控单行输入。English: Controlled single-line input. */
    UInput: typeof UInput;
    /** 中文：受控横幅。English: Controlled banner. */
    UNoticeBar: typeof UNoticeBar;
    /** 中文：十进制定点受控 number-box。English: Decimal fixed-point controlled number box. */
    UNumberBox: typeof UNumberBox;
    /** 中文：有限单列/多列 picker。English: Finite single-/multi-column picker. */
    UPicker: typeof UPicker;
    /** 中文：受控 radio。English: Controlled radio. */
    URadio: typeof URadio;
    /** 中文：受控 radio group。English: Controlled radio group. */
    URadioGroup: typeof URadioGroup;
    /** 中文：有限整数分级受控组件。English: Finite integer-level controlled component. */
    URate: typeof URate;
    /** 中文：受控搜索与 clear/action 意图。English: Controlled search with clear/action intents. */
    USearch: typeof USearch;
    /** 中文：有限 inline 单值选择组件。English: Finite inline single-value selection component. */
    USelect: typeof USelect;
    /** 中文：相对 min 十进制网格受控 slider。English: Min-relative decimal-grid controlled slider. */
    USlider: typeof USlider;
    /** 中文：受控 switch。English: Controlled switch. */
    USwitch: typeof USwitch;
    /** 中文：局部、非路由 tabbar。English: Local non-routing tabbar. */
    UTabbar: typeof UTabbar;
    /** 中文：有限 token 化文字标签。English: Finite tokenized text tag. */
    UTag: typeof UTag;
    /** 中文：受控多行输入。English: Controlled multiline input. */
    UTextarea: typeof UTextarea;
    /** 中文：caller-owned 文件状态与 injected adapter 编排组件。English: Caller-owned file-state and injected-adapter orchestration component. */
    UUpload: typeof UUpload;
  }
}

export {};
