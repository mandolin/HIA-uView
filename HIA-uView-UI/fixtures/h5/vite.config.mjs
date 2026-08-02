/**
 * @module h5-fixture-vite
 * @lang zh-CN H5 fixture 的 Vite 配置；使用相对 base 以验证静态资源可被 Pages 风格路径加载。
 * @lang en Vite configuration for the H5 fixture; uses a relative base to verify assets can load from Pages-style paths.
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

// <lang><zh-CN>从配置文件定位 fixture 根目录，使 npm --prefix 或直接调用时都不依赖当前工作目录。</zh-CN><en>Locates the fixture root from this config so npm --prefix and direct calls do not depend on the current working directory.</en></lang>
const fixtureRoot = fileURLToPath(new URL('.', import.meta.url));

// <lang><zh-CN>构建只启用 Vue SFC 和相对资源，不启动 dev server 或外部代理。</zh-CN><en>Build enables Vue SFC and relative assets only; it starts no dev server or external proxy.</en></lang>
export default defineConfig({
  root: fixtureRoot,
  base: './',
  plugins: [vue()],
  build: { outDir: 'dist', emptyOutDir: true }
});
