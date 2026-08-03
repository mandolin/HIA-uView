import { createSSRApp } from 'vue';
import FixtureApp from './App.vue';

/**
 * @module hia-uview-mp-weixin-fixture-entry
 * @lang zh-CN 仅为本仓 mp-weixin 编译 fixture 提供的 UI-package 输入根入口；它复用 fixture App，不注册业务插件、网络、身份、store 或全局服务，并由 package ignore 规则排除在 UI 分发包之外。
 * @lang en UI-package input-root entry provided only for the repository's mp-weixin compilation fixture; reuses the fixture App, registers no business plugin, network, identity, store, or global service, and is excluded from the UI distribution package by package-ignore rules.
 */

/**
 * @lang zh-CN 创建仅用于 compiler/DevTools 前置校验的 UniApp 应用实例；不接入业务、后端、身份、网络或第三方运行时。
 * @lang en Creates a UniApp application instance used only for compiler and DevTools-prerequisite validation; connects no business, backend, identity, network, or third-party runtime.
 * @returns {{ app: ReturnType<typeof createSSRApp> }} <lang><zh-CN>仅含当前 fixture App 的 UniApp 期望对象。</zh-CN><en>UniApp-expected object containing only the current fixture App.</en></lang>
 */
export function createApp() {
  // <lang><zh-CN>创建 fixture App 的 SSR-compatible UniApp 实例；入口不挂载开发服务器、开发者工具或设备。</zh-CN><en>Creates the SSR-compatible UniApp instance for the fixture App; the entry mounts no development server, DevTools, or device.</en></lang>
  return { app: createSSRApp(FixtureApp) };
}
