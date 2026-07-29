/**
 * @module hia-uview-ui
 * @lang zh-CN 提供 HIA-uView UI 的私有 runtime entry：显式命名组件导出与 Vue plugin。模块导入本身不注册组件、不注入样式，也不读取应用或平台状态。
 * @lang en Provides the private HIA-uView UI runtime entry: explicit named component exports and a Vue plugin. Importing this module itself registers no component, injects no style, and reads no application or platform state.
 */

// <lang><zh-CN>导入当前已批准的独立组件实现；每个组件仍由调用方直接导入或通过显式 plugin 选择注册。</zh-CN><en>Imports the currently approved independent component implementations; callers still choose direct imports or explicit plugin registration for every component.</en></lang>
import UButton from './components/u-button/u-button.vue';
import UCell from './components/u-cell/u-cell.vue';
import UCheckbox from './components/u-checkbox/u-checkbox.vue';
import UCheckboxGroup from './components/u-checkbox-group/u-checkbox-group.vue';
import UEmpty from './components/u-empty/u-empty.vue';
import UField from './components/u-field/u-field.vue';
import UInput from './components/u-input/u-input.vue';
import UModal from './components/u-modal/u-modal.vue';
import UNavBar from './components/u-nav-bar/u-nav-bar.vue';
import UNotice from './components/u-notice/u-notice.vue';
import URadio from './components/u-radio/u-radio.vue';
import URadioGroup from './components/u-radio-group/u-radio-group.vue';
import UStack from './components/u-stack/u-stack.vue';
import UValidationMessage from './components/u-validation-message/u-validation-message.vue';

/**
 * @lang zh-CN 显式 plugin 可注册的稳定模板名称与组件实现映射。该只读集合必须与 component manifest 一致；manifest 继续只服务开发期声明验证，不承担 runtime registry 职责。
 * @lang en Stable template-name and implementation mapping registerable by the explicit plugin. This read-only collection must match the component manifest; the manifest remains for development-time declaration validation and is not a runtime registry.
 */
export const UVIEW_COMPONENTS = Object.freeze([
  // <lang><zh-CN>按钮保留 P10/P11 已验证的独立本地操作边界。</zh-CN><en>The button retains the independently verified local-action boundary from P10/P11.</en></lang>
  Object.freeze({ name: 'u-button', component: UButton }),
  // <lang><zh-CN>信息行只展示调用方文字并 emit 受限 click 意图。</zh-CN><en>The information row displays caller text only and emits constrained click intent.</en></lang>
  Object.freeze({ name: 'u-cell', component: UCell }),
  Object.freeze({ name: 'u-checkbox', component: UCheckbox }),
  Object.freeze({ name: 'u-checkbox-group', component: UCheckboxGroup }),
  // <lang><zh-CN>空态只展示调用方文字并 emit 可选 action 意图，不读取数据或加载状态。</zh-CN><en>The empty state displays caller text only and emits optional action intent without reading data or loading state.</en></lang>
  Object.freeze({ name: 'u-empty', component: UEmpty }),
  // <lang><zh-CN>字段结构只组织调用方标签、插槽、帮助和独立消息，不拥有表单模型或规则生命周期。</zh-CN><en>The field structure organizes caller label, slot, help, and independent message only and owns no form model or rule lifecycle.</en></lang>
  Object.freeze({ name: 'u-field', component: UField }),
  // <lang><zh-CN>受控输入只显示调用方字符串并 emit 未修改的本地输入意图。</zh-CN><en>The controlled input displays caller string only and emits unmodified local input intent.</en></lang>
  Object.freeze({ name: 'u-input', component: UInput }),
  // <lang><zh-CN>modal 只呈现调用方 visible/内容与 confirm/cancel 意图，不自动关闭或管理焦点。</zh-CN><en>The modal presents caller visible/content and confirm/cancel intent only and neither auto-closes nor manages focus.</en></lang>
  Object.freeze({ name: 'u-modal', component: UModal }),
  // <lang><zh-CN>导航栏只展示标题/文字 control 并 emit back/action 意图。</zh-CN><en>The navigation bar displays title/text controls only and emits back/action intent.</en></lang>
  Object.freeze({ name: 'u-nav-bar', component: UNavBar }),
  // <lang><zh-CN>notice 只呈现调用方 message/tone 与可选 dismiss 意图，不创建全局 service 或定时器。</zh-CN><en>The notice presents caller message/tone and optional dismiss intent only and creates no global service or timer.</en></lang>
  Object.freeze({ name: 'u-notice', component: UNotice }),
  Object.freeze({ name: 'u-radio', component: URadio }),
  Object.freeze({ name: 'u-radio-group', component: URadioGroup }),
  // <lang><zh-CN>布局原语只排列默认插槽，不拥有页面或子项语义。</zh-CN><en>The layout primitive arranges the default slot only and owns no page or child semantics.</en></lang>
  Object.freeze({ name: 'u-stack', component: UStack }),
  // <lang><zh-CN>独立校验消息只呈现应用声明的状态和文字，不推断结果或启动异步工作。</zh-CN><en>The independent validation message presents application-declared state and text only and infers no result or starts no asynchronous work.</en></lang>
  Object.freeze({ name: 'u-validation-message', component: UValidationMessage })
]);

/**
 * @lang zh-CN 将当前组件集合显式注册到一个 Vue application。调用者控制 `app.use` 时机；本函数不导入样式、不自动安装、不访问路由、Tool、网络或全局平台状态。
 * @lang en Explicitly registers the current component collection on one Vue application. Callers control when `app.use` runs; this function imports no style, auto-installs nothing, and accesses no route, Tool, network, or global platform state.
 * @param {{ component: (name: string, implementation: unknown) => unknown }} application <lang><zh-CN>具有 Vue `component(name, implementation)` 注册能力的应用实例。</zh-CN><en>Application instance exposing Vue `component(name, implementation)` registration capability.</en></lang>
 * @returns {typeof application} <lang><zh-CN>同一应用实例，便于调用方显式链式使用。</zh-CN><en>The same application instance, enabling explicit caller-side chaining.</en></lang>
 * @throws {TypeError} <lang><zh-CN>应用实例缺失或不具有组件注册函数时抛出。</zh-CN><en>Thrown when the application is absent or has no component-registration function.</en></lang>
 */
export function installUView(application) {
  // <lang><zh-CN>在注册前验证最小 Vue application 表面，避免对任意对象产生部分注册副作用。</zh-CN><en>Validates the minimum Vue application surface before registration, avoiding partial registration side effects on arbitrary objects.</en></lang>
  if (!application || typeof application.component !== 'function') {
    throw new TypeError('UView install requires a Vue application with component(name, implementation).');
  }

  // <lang><zh-CN>按冻结集合的声明顺序注册每个模板名；解构出的 name 和 component 始终来自经过审阅的本地 registry。</zh-CN><en>Registers every template name in declared frozen-collection order; destructured name and component always come from the reviewed local registry.</en></lang>
  for (const { name, component } of UVIEW_COMPONENTS) {
    application.component(name, component);
  }

  // <lang><zh-CN>返回原应用实例而非创建包装对象，保持 Vue plugin 的显式且可预测的生命周期。</zh-CN><en>Returns the original application rather than creating a wrapper, preserving an explicit and predictable Vue-plugin lifecycle.</en></lang>
  return application;
}

/**
 * @lang zh-CN 供 `app.use(UView)` 显式调用的私有 Vue plugin。它只委托 `installUView`，绝不自动加载 theme/style entry。
 * @lang en Private Vue plugin for explicit `app.use(UView)` calls. It delegates only to `installUView` and never loads the theme/style entry automatically.
 */
export const UView = Object.freeze({
  install: installUView
});

// <lang><zh-CN>导出命名组件供应用按需注册；默认导出保持显式 plugin 入口，二者均不产生 import-time 副作用。</zh-CN><en>Exports named components for application-side registration; the default export remains the explicit plugin entry, and neither creates import-time side effects.</en></lang>
export { UButton, UCell, UCheckbox, UCheckboxGroup, UEmpty, UField, UInput, UModal, UNavBar, UNotice, URadio, URadioGroup, UStack, UValidationMessage };
export default UView;
