/**
 * @module ui-package-type-consumer-fixture
 * @lang zh-CN 编译期消费 fixture：只验证私有包 declaration 的解析和受审计表面，不运行 Vue、注册组件、访问小程序 API 或读取应用状态。
 * @lang en Compile-time consumer fixture: verifies only private-package declaration resolution and audited surfaces; it runs no Vue, registers no component, accesses no Mini Program API, and reads no application state.
 */

import UView, {
  UCheckbox,
  UCheckboxGroup,
  UNoticeBar,
  UPicker,
  URadio,
  URadioGroup,
  USwitch,
  UTabbar,
  normalizeULocale,
  useULocale,
  type UCheckboxProps,
  type UPickerOption,
  type UTabbarItem
} from '@hia-uview/ui';
import '@hia-uview/ui/global';
import type { GlobalComponents, Plugin } from 'vue';

// <lang><zh-CN>验证 choice props 保持透明 local value、显式 alias 与受控布尔输入；fixture 不赋予这些值业务含义。</zh-CN><en>Verifies that choice props retain transparent local values, explicit aliases, and controlled boolean input; the fixture assigns no business meaning to these values.</en></lang>
const checkboxProps: UCheckboxProps = {
  checked: true,
  disabled: false,
  label: 'Local option',
  modelValue: false,
  value: 'local-option'
};

// <lang><zh-CN>验证 tabbar 项只接受有限 label/value/disabled 结构，不包含路由或原生 tab 生命周期字段。</zh-CN><en>Verifies that tabbar items accept only finite label/value/disabled shape and contain no route or native-tab-lifecycle fields.</en></lang>
const tabItems: ReadonlyArray<UTabbarItem> = [
  { label: 'Home', value: 0 },
  { disabled: true, text: 'Profile', value: 'profile' }
];

// <lang><zh-CN>验证单列 picker option 是受限的 local value/label/disabled 数据，而非日期或地区模型。</zh-CN><en>Verifies that a single-column picker option is constrained local value/label/disabled data rather than a date or region model.</en></lang>
const pickerOptions: ReadonlyArray<UPickerOption> = [
  { label: 'One', value: 1 },
  { disabled: true, label: 'Two', value: 2 }
];

// <lang><zh-CN>验证显式 runtime export、plugin、可选 global declaration 与 locale helper 的静态形状；没有产生 import-time 副作用。</zh-CN><en>Verifies the static shapes of explicit runtime exports, plugin, optional global declaration, and locale helper; no import-time side effect occurs.</en></lang>
const plugin: Plugin = UView;
const globalCheckbox: GlobalComponents['UCheckbox'] = UCheckbox;
const locale = useULocale(normalizeULocale('en'));

// <lang><zh-CN>收集引用以防止编译器把 fixture 的 package-consumption 断言优化成未使用的声明。</zh-CN><en>Collects references so the compiler cannot reduce this fixture's package-consumption assertions to unused declarations.</en></lang>
void [
  checkboxProps,
  globalCheckbox,
  locale.value,
  pickerOptions,
  plugin,
  UCheckboxGroup,
  UNoticeBar,
  UPicker,
  URadio,
  URadioGroup,
  USwitch,
  UTabbar,
  tabItems
];
