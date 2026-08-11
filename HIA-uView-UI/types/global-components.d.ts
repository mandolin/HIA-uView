/**
 * @module hia-uview-ui-global-components
 * @lang zh-CN 提供可选的 Vue template 全局组件类型增强。导入该入口只影响 TypeScript 编译；它不在 runtime 注册组件、注入样式或启用 Easycom。
 * @lang en Provides optional Vue-template global-component type augmentation. Importing this entry affects TypeScript compilation only; it neither registers runtime components nor injects styles or enables Easycom.
 */

import type {
  UAlertTips,
  UCheckbox,
  UCheckboxGroup,
  UField,
  UForm,
  UFormItem,
  UInput,
  UNoticeBar,
  UPicker,
  URadio,
  URadioGroup,
  USearch,
  USwitch,
  UTabbar,
  UTag,
  UTextarea
} from './index';

/**
 * @lang zh-CN 仅声明当前已审计的 choice、local tabbar、banner、single-column picker、有限展示与 form/input 名称。其余组件必须继续采用显式 named import，直到具备逐项类型 contract。
 * @lang en Declares only currently audited choice, local-tabbar, banner, single-column-picker, finite-display, and form/input names. Remaining components must continue using explicit named imports until per-item type contracts exist.
 */
declare module 'vue' {
  interface GlobalComponents {
    /** 中文：caller-controlled 局部提示条。English: Caller-controlled local alert strip. */
    UAlertTips: typeof UAlertTips;
    /** 中文：受控 checkbox。English: Controlled checkbox. */
    UCheckbox: typeof UCheckbox;
    /** 中文：受控 checkbox group。English: Controlled checkbox group. */
    UCheckboxGroup: typeof UCheckboxGroup;
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
    /** 中文：有限单列 picker。English: Finite single-column picker. */
    UPicker: typeof UPicker;
    /** 中文：受控 radio。English: Controlled radio. */
    URadio: typeof URadio;
    /** 中文：受控 radio group。English: Controlled radio group. */
    URadioGroup: typeof URadioGroup;
    /** 中文：受控搜索与 clear/action 意图。English: Controlled search with clear/action intents. */
    USearch: typeof USearch;
    /** 中文：受控 switch。English: Controlled switch. */
    USwitch: typeof USwitch;
    /** 中文：局部、非路由 tabbar。English: Local non-routing tabbar. */
    UTabbar: typeof UTabbar;
    /** 中文：有限 token 化文字标签。English: Finite tokenized text tag. */
    UTag: typeof UTag;
    /** 中文：受控多行输入。English: Controlled multiline input. */
    UTextarea: typeof UTextarea;
  }
}

export {};
