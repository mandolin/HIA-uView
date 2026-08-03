/**
 * @module config-locale
 * @lang zh-CN 定义 UConfigProvider 子树可用的受限 UI locale context；它不读取系统语言、不持久化、不加载翻译，也不把源码注释 locale 作为运行时数据。
 * @lang en Defines constrained UI locale context available to UConfigProvider subtrees; it reads no system language, persists nothing, loads no translations, and never treats source-comment locale as runtime data.
 */

import { computed, inject } from 'vue';

// <lang><zh-CN>公开 locale 集合只包含当前受审阅的两项 UI locale；它不是应用语言清单或翻译资源 registry。</zh-CN><en>The public locale set contains only the two currently reviewed UI locales; it is not an application-language list or translation-resource registry.</en></lang>
export const U_SUPPORTED_LOCALES = Object.freeze(['zh-Hans', 'en']);

// <lang><zh-CN>私有 symbol 防止 string key 与调用方任意 provide 冲突；它只在当前 Vue 子树内传递 locale ref。</zh-CN><en>The private symbol prevents collision with a string key or arbitrary caller provide; it passes a locale ref only inside the current Vue subtree.</en></lang>
export const U_LOCALE_CONTEXT = Symbol('u-locale-context');

/**
 * @lang zh-CN 将任意 caller 输入归一为当前受支持 UI locale；未知输入确定性回退 `zh-Hans`。
 * @lang en Normalizes arbitrary caller input to a currently supported UI locale; unknown input deterministically falls back to `zh-Hans`.
 * @param {unknown} locale <lang><zh-CN>调用方提供的候选 locale。</zh-CN><en>Caller-provided locale candidate.</en></lang>
 * @returns {'zh-Hans'|'en'} <lang><zh-CN>受限且可预测的 UI locale。</zh-CN><en>Constrained, predictable UI locale.</en></lang>
 */
export function normalizeULocale(locale) {
  // <lang><zh-CN>严格匹配阻止任意区域、系统或用户字符串扩展当前公共 UI contract。</zh-CN><en>Strict matching prevents arbitrary region, system, or user strings from extending the current public UI contract.</en></lang>
  return U_SUPPORTED_LOCALES.includes(locale) ? locale : 'zh-Hans';
}

/**
 * @lang zh-CN 在 setup 中读取最近 UConfigProvider 的 reactive UI locale；缺少 provider 时返回局部 `zh-Hans` fallback ref。
 * @lang en Reads the nearest UConfigProvider reactive UI locale in setup; returns a local `zh-Hans` fallback ref when the provider is absent.
 * @returns {import('vue').ComputedRef<'zh-Hans'|'en'>} <lang><zh-CN>只读 UI locale ref。</zh-CN><en>Read-only UI locale ref.</en></lang>
 */
export function useULocale() {
  // <lang><zh-CN>注入只查询当前组件祖先链，不读取全局 singleton、浏览器设置或持久化状态。</zh-CN><en>Injection queries only the current component ancestor chain and reads no global singleton, browser setting, or persisted state.</en></lang>
  const context = inject(U_LOCALE_CONTEXT, null);
  // <lang><zh-CN>无 provider 的 consumer 仍可预测地渲染，但不会反向创建或写入 provider。</zh-CN><en>A consumer without provider still renders predictably but creates or writes back no provider.</en></lang>
  return context?.locale || computed(() => 'zh-Hans');
}
