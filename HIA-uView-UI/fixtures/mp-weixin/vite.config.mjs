import { defineConfig } from 'vite';
import uniPlugin from '@dcloudio/vite-plugin-uni';

/**
 * @lang zh-CN 为本地 mp-weixin 编译 fixture 提供最小官方 UniApp Vite 插件配置；不启动开发服务器，也不引入上游模板源码。
 * @lang en Provides the minimal official UniApp Vite-plugin configuration for the local mp-weixin compile fixture; starts no development server and imports no upstream template source.
 */
export default defineConfig({
  plugins: [uniPlugin.default()]
});
