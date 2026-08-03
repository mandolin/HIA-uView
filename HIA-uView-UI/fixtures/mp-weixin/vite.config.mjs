import { defineConfig } from 'vite';
import uniPlugin from '@dcloudio/vite-plugin-uni';

/**
 * @module mp-weixin-fixture-vite-config
 * @lang zh-CN compile-only mp-weixin fixture 的最小 Vite 配置模块；它只声明官方 UniApp transform plugin，不声明 dev server、proxy、环境变量、外部输入或发布行为。
 * @lang en Minimal Vite configuration module for the compile-only mp-weixin fixture; declares only the official UniApp transform plugin and declares no development server, proxy, environment variable, external input, or release behavior.
 */

/**
 * @lang zh-CN 为本地 mp-weixin 编译 fixture 提供最小官方 UniApp Vite 插件配置；不启动开发服务器，也不引入上游模板源码。
 * @lang en Provides the minimal official UniApp Vite-plugin configuration for the local mp-weixin compile fixture; starts no development server and imports no upstream template source.
 */
// <lang><zh-CN>以静态单插件数组保留官方 UniApp compiler path；配置不执行项目代码，也不扫描调用方目录。</zh-CN><en>Retains the official UniApp compiler path with a static single-plugin array; configuration executes no project code and scans no caller directory.</en></lang>
export default defineConfig({
  // <lang><zh-CN>仅实例化锁定版本的官方插件，避免 fixture 引入额外 transform、模板、网络或构建后写入。</zh-CN><en>Instantiates only the locked official plugin, preventing the fixture from introducing additional transform, template, network, or post-build write behavior.</en></lang>
  plugins: [uniPlugin.default()]
});
