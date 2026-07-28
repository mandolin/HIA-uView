import HiaButton from './components/hia-button/hia-button.vue';

/**
 * @module hia-uview-ui
 * @lang zh-CN 提供 HIA-uView UI 的私有首轮 runtime entry：命名组件导出与显式 Vue plugin，不在 import 时注册组件或注入样式。
 * @lang en Provides the private first-slice runtime entry for HIA-uView UI: named component exports and an explicit Vue plugin, with no component registration or style injection at import time.
 */

/**
 * @lang zh-CN 首轮可通过显式 plugin 注册的稳定组件名称与实现映射；manifest 仍只服务开发期声明校验，不承担 runtime registry 职责。
 * @lang en Stable component-name and implementation mapping registerable through the explicit first-slice plugin; the manifest remains for development-time declaration validation and is not a runtime registry.
 */
export const HIA_UVIEW_COMPONENTS = Object.freeze([
  Object.freeze({ name: 'HiaButton', component: HiaButton })
]);

/**
 * @lang zh-CN 将首轮组件显式注册到一个 Vue application；调用者控制何时调用 `app.use`，本函数不导入样式、不修改全局状态。
 * @lang en Explicitly registers first-slice components on one Vue application; callers control when `app.use` is called, while this function imports no styles and changes no global state.
 */
export function installHiaUView(application) {
  if (!application || typeof application.component !== 'function') {
    throw new TypeError('HiaUView install requires a Vue application with component(name, implementation).');
  }

  for (const { name, component } of HIA_UVIEW_COMPONENTS) {
    application.component(name, component);
  }

  return application;
}

/**
 * @lang zh-CN 供 `app.use(HiaUView)` 显式调用的私有首轮 Vue plugin；不会自动安装或加载 theme/style entry。
 * @lang en Private first-slice Vue plugin for explicit `app.use(HiaUView)` calls; does not install automatically or load the theme/style entry.
 */
export const HiaUView = Object.freeze({
  install: installHiaUView
});

export { HiaButton };
export default HiaUView;
