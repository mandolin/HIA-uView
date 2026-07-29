import { createSSRApp } from 'vue';
import App from './App.vue';

/**
 * @module mp-weixin-fixture-main
 * @lang zh-CN compile-only `mp-weixin` fixture 的最小 UniApp 入口；只创建当前本地 App，不注册业务插件、网络、身份、store 或全局服务。
 * @lang en Minimal UniApp entry for the compile-only `mp-weixin` fixture; creates only the current local App and registers no business plugin, network, identity, store, or global service.
 */

/**
 * @lang zh-CN 创建仅用于编译验证的 UniApp 应用实例；不接入业务、后端、身份、网络或第三方运行时。
 * @lang en Creates a UniApp application instance used only for compilation validation; connects no business, backend, identity, network, or third-party runtime.
 */
export function createApp() {
  // <lang><zh-CN>创建当前 fixture 壳的 SSR-compatible UniApp 实例；实例不会被此入口挂载到开发服务器或设备。</zh-CN><en>Creates the SSR-compatible UniApp instance for the current fixture shell; this entry does not mount it to a development server or device.</en></lang>
  const app = createSSRApp(App);

  // <lang><zh-CN>仅交还 UniApp 期望的 app 对象，不附加 router、store、provider 或业务初始化副作用。</zh-CN><en>Returns only the app object expected by UniApp and attaches no router, store, provider, or business-initialization side effect.</en></lang>
  return { app };
}
