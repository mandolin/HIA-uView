/**
 * @module button-messages
 * @lang zh-CN 提供 UButton 首轮内建消息的受限本地化解析；仅处理组件自有的稳定消息 ID，不引入通用 i18n 运行时。
 * @lang en Provides constrained localization resolution for initial UButton messages; handles only stable component-owned message IDs and introduces no general i18n runtime.
 */

/**
 * @lang zh-CN UButton 首轮支持的运行时语言及其加载消息；对象冻结以避免组件实例修改全局消息基线。
 * @lang en Runtime locales supported in the first UButton slice and their loading messages; the object is frozen to prevent component instances from changing the global message baseline.
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
 * @lang zh-CN 将候选 locale 收敛为 UButton 当前支持的 BCP 47 ID；未知、空或平台变体均安全回退为中文简体。
 * @lang en Narrows a candidate locale to a BCP 47 ID currently supported by UButton; unknown, empty, and platform-variant values safely fall back to Simplified Chinese.
 */
export function normalizeButtonLocale(locale) {
  // <lang><zh-CN>非字符串输入无法安全进行 BCP 47 文本归一化；保留稳定中文简体回退而不抛出影响渲染的错误。</zh-CN><en>A non-string input cannot safely undergo BCP 47 text normalization; retain the stable Simplified-Chinese fallback rather than throw an error that affects rendering.</en></lang>
  if (typeof locale !== 'string') {
    return 'zh-Hans';
  }

  // <lang><zh-CN>归一化后的候选值去除外围空白并统一首个下划线分隔符，便于接纳常见平台 locale 变体但不改变未知语言的回退策略。</zh-CN><en>The normalized candidate trims outer whitespace and unifies the first underscore separator, accepting common platform locale variants without changing fallback policy for unknown languages.</en></lang>
  const normalized = locale.trim().replace('_', '-');

  // <lang><zh-CN>英语及其区域变体共享当前英文消息；其他语言尚无组件自有翻译时统一回退到中文简体。</zh-CN><en>English and its regional variants share the current English message; every other language falls back to Simplified Chinese while the component owns no translation for it.</en></lang>
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
  // <lang><zh-CN>仅在 UniApp `uni.getLocale` 确实可用时读取平台 locale，保证 jsdom、SSR 式工具和其他 host 不因全局对象缺失失败。</zh-CN><en>Read platform locale only when UniApp `uni.getLocale` truly exists, ensuring jsdom, SSR-like tools, and other hosts do not fail from a missing global object.</en></lang>
  if (typeof uni !== 'undefined' && typeof uni.getLocale === 'function') {
    // <lang><zh-CN>将平台返回值交给同一归一化节点，保持 runtime 与显式调用传入 locale 的回退规则一致。</zh-CN><en>Pass the platform return value through the same normalization node, keeping fallback rules consistent between runtime and explicitly supplied locales.</en></lang>
    return normalizeButtonLocale(uni.getLocale());
  }

  // <lang><zh-CN>没有可用平台 API 时返回确定的中文简体，而不是猜测浏览器、设备或应用全局 locale。</zh-CN><en>Return deterministic Simplified Chinese when no platform API is available rather than guessing browser, device, or application global locale.</en></lang>
  return 'zh-Hans';
}

/**
 * @lang zh-CN 解析 UButton 自有消息；未知 ID 返回空字符串，让调用方显式决定可见回退而不泄露键名。
 * @lang en Resolves a UButton-owned message; an unknown ID returns an empty string so callers explicitly choose a visible fallback without exposing a key name.
 */
export function resolveButtonMessage(messageId, locale = getButtonRuntimeLocale()) {
  // <lang><zh-CN>messages 是经 locale 归一化后选中的冻结组件词典；它仅在本调用内引用，无法由组件实例改写。</zh-CN><en>Messages is the frozen component dictionary selected after locale normalization; it is referenced only in this call and cannot be rewritten by a component instance.</en></lang>
  const messages = HIA_BUTTON_MESSAGES[normalizeButtonLocale(locale)];
  // <lang><zh-CN>按稳定 message ID 返回文本；不存在的 ID 返回空字符串，使可见回退仍由调用方而非隐藏默认文案决定。</zh-CN><en>Return text by stable message ID; an absent ID returns an empty string so visible fallback remains caller-owned rather than decided by hidden default copy.</en></lang>
  return messages[messageId] ?? '';
}
