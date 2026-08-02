/**
 * @module h5-fixture-main
 * @lang zh-CN H5 fixture 的显式应用入口；只用于本地构建与 smoke，不负责部署或业务路由。
 * @lang en Explicit H5 fixture application entry; used for local build and smoke only, with no deployment or business routing responsibility.
 */
import { createApp } from 'vue';
import App from './App.vue';
import '../../../src/style.css';

// <lang><zh-CN>显式创建并挂载 fixture 应用，保持样式和组件来源可审计。</zh-CN><en>Explicitly creates and mounts the fixture app so style and component sources remain auditable.</en></lang>
createApp(App).mount('#app');
