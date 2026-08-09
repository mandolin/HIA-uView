/**
 * @module hia-uview-ui-global-components
 * @lang zh-CN 提供可选的 Vue template 全局组件类型增强。导入该入口只影响 TypeScript 编译；它不在 runtime 注册组件、注入样式或启用 Easycom。
 * @lang en Provides optional Vue-template global-component type augmentation. Importing this entry affects TypeScript compilation only; it neither registers runtime components nor injects styles or enables Easycom.
 */

import type {
  UCheckbox,
  UCheckboxGroup,
  UNoticeBar,
  UPicker,
  URadio,
  URadioGroup,
  USwitch,
  UTabbar
} from './index';

/**
 * @lang zh-CN 仅声明当前已审计的 choice、local tabbar、banner 与 single-column picker 名称。其余组件必须继续采用显式 named import，直到具备逐项类型 contract。
 * @lang en Declares only currently audited choice, local-tabbar, banner, and single-column-picker names. Remaining components must continue using explicit named imports until per-item type contracts exist.
 */
declare module 'vue' {
  interface GlobalComponents {
    /** 中文：受控 checkbox。English: Controlled checkbox. */
    UCheckbox: typeof UCheckbox;
    /** 中文：受控 checkbox group。English: Controlled checkbox group. */
    UCheckboxGroup: typeof UCheckboxGroup;
    /** 中文：受控横幅。English: Controlled banner. */
    UNoticeBar: typeof UNoticeBar;
    /** 中文：有限单列 picker。English: Finite single-column picker. */
    UPicker: typeof UPicker;
    /** 中文：受控 radio。English: Controlled radio. */
    URadio: typeof URadio;
    /** 中文：受控 radio group。English: Controlled radio group. */
    URadioGroup: typeof URadioGroup;
    /** 中文：受控 switch。English: Controlled switch. */
    USwitch: typeof USwitch;
    /** 中文：局部、非路由 tabbar。English: Local non-routing tabbar. */
    UTabbar: typeof UTabbar;
  }
}

export {};
