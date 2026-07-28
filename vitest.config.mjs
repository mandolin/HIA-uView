import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

/**
 * @lang zh-CN 配置仅运行私有 runtime 行为测试的 Vitest/Vue/jsdom 链；不启用 UI、API、浏览器或 watch server。
 * @lang en Configures the Vitest/Vue/jsdom chain for private runtime behavior tests only; enables no UI, API, browser, or watch server.
 */
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['tests/runtime/**/*.test.mjs'],
    watch: false
  }
});
