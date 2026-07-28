import { createSSRApp } from 'vue';
import App from './App.vue';

/**
 * @lang zh-CN 创建仅用于编译验证的 UniApp 应用实例；不接入业务、后端、身份、网络或第三方运行时。
 * @lang en Creates a UniApp application instance used only for compilation validation; connects no business, backend, identity, network, or third-party runtime.
 */
export function createApp() {
  const app = createSSRApp(App);
  return { app };
}
