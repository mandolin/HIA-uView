/**
 * @module button-messages
 * @lang zh-CN 提供 HiaButton 首轮内建消息的受限本地化解析；仅处理组件自有的稳定消息 ID，不引入通用 i18n 运行时。
 * @lang en Provides constrained localization resolution for initial HiaButton messages; handles only stable component-owned message IDs and introduces no general i18n runtime.
 */

/**
 * @lang zh-CN HiaButton 首轮支持的运行时语言及其加载消息；对象冻结以避免组件实例修改全局消息基线。
 * @lang en Runtime locales supported in the first HiaButton slice and their loading messages; the object is frozen to prevent component instances from changing the global message baseline.
 */
export const HIA_BUTTON_MESSAGES = Object.freeze({
  'zh-Hans': Object.freeze({
    'component.button.loading': '加载中…'
  }),
  en: Object.freeze({
    'component.button.loading': 'Loading…'
  })
});

/**
 * @lang zh-CN 将候选 locale 收敛为 HiaButton 当前支持的 BCP 47 ID；未知、空或平台变体均安全回退为中文简体。
 * @lang en Narrows a candidate locale to a BCP 47 ID currently supported by HiaButton; unknown, empty, and platform-variant values safely fall back to Simplified Chinese.
 */
export function normalizeButtonLocale(locale) {
  if (typeof locale !== 'string') {
    return 'zh-Hans';
  }

  const normalized = locale.trim().replace('_', '-');

  if (normalized === 'en' || normalized.startsWith('en-')) {
    return 'en';
  }

  return 'zh-Hans';
}

/**
 * @lang zh-CN 读取平台可用的 locale 而不要求 Web、App 或小程序全局对象必然存在；读取失败时保留受控中文回退。
 * @lang en Reads a platform locale without requiring a Web, App, or mini-program global object to exist; retains the controlled Chinese fallback when reading fails.
 */
export function getButtonRuntimeLocale() {
  if (typeof uni !== 'undefined' && typeof uni.getLocale === 'function') {
    return normalizeButtonLocale(uni.getLocale());
  }

  return 'zh-Hans';
}

/**
 * @lang zh-CN 解析 HiaButton 自有消息；未知 ID 返回空字符串，让调用方显式决定可见回退而不泄露键名。
 * @lang en Resolves an HiaButton-owned message; an unknown ID returns an empty string so callers explicitly choose a visible fallback without exposing a key name.
 */
export function resolveButtonMessage(messageId, locale = getButtonRuntimeLocale()) {
  const messages = HIA_BUTTON_MESSAGES[normalizeButtonLocale(locale)];
  return messages[messageId] ?? '';
}
