import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

/**
 * @module theme-contract
 * @lang zh-CN 验证 HIA-uView 默认浅色主题的 HIA 品牌映射和 WCAG 2.2 AA 对比度基线；不评价未定义的状态色或跨端 profile。
 * @lang en Validates the HIA-brand mapping and WCAG 2.2 AA contrast baseline of the HIA-uView default light theme; it does not assess undefined state colors or cross-platform profiles.
 */

/**
 * @lang zh-CN 默认浅色主题 CSS 的仓库相对路径。
 * @lang en Repository-relative path of the default light-theme CSS file.
 */
const lightThemePath = 'HIA-uView-UI/src/theme/hia-light.css';

/**
 * @lang zh-CN 当前默认主题必须显式声明的 HIA 基础颜色和值。
 * @lang en HIA foundational colors and values that the current default theme must declare explicitly.
 */
const requiredReferenceTokens = new Map([
  ['--u-ref-color-brand-cobalt', '#0047ab'],
  ['--u-ref-color-brand-cyan', '#00a8d3'],
  ['--u-ref-color-neutral-0', '#ffffff'],
  ['--u-ref-color-neutral-950', '#001b2e']
]);

/**
 * @lang zh-CN UButton 首轮必须由默认主题显式定义的组件 token，确保实现不以未记录的硬编码值替代公开主题边界。
 * @lang en UButton component tokens that the default theme must explicitly define in the first slice, ensuring implementation does not replace the public theme boundary with undocumented hard-coded values.
 */
const requiredButtonTokens = [
  '--u-comp-button-primary-background',
  '--u-comp-button-primary-foreground',
  '--u-comp-button-primary-disabled-background',
  '--u-comp-button-primary-disabled-foreground',
  '--u-comp-button-secondary-background',
  '--u-comp-button-secondary-border',
  '--u-comp-button-secondary-foreground',
  '--u-comp-button-secondary-disabled-background',
  '--u-comp-button-secondary-disabled-border',
  '--u-comp-button-secondary-disabled-foreground',
  '--u-comp-button-text-background',
  '--u-comp-button-text-foreground',
  '--u-comp-button-text-disabled-foreground',
  '--u-comp-button-min-height: 44px',
  '--u-comp-button-min-height-sm: 40px',
  '--u-comp-button-min-height-lg: 48px',
  '--u-comp-button-inline-padding',
  '--u-comp-button-gap',
  '--u-comp-button-focus-ring'
];

/**
 * @lang zh-CN 解析六位十六进制颜色为 sRGB 通道；仅接受明确的默认 token 色值，避免静默接受不透明的 CSS 表达式。
 * @lang en Parses a six-digit hexadecimal color into sRGB channels; accepts only explicit default-token values to avoid silently accepting opaque CSS expressions.
 * @param {string} color <lang><zh-CN>六位十六进制 CSS 颜色。</zh-CN><en>Six-digit hexadecimal CSS color.</en></lang>
 * @returns {number[]} <lang><zh-CN>按红、绿、蓝顺序排列的归一化 sRGB 通道。</zh-CN><en>Normalized sRGB channels in red, green, and blue order.</en></lang>
 * @throws {TypeError} <lang><zh-CN>颜色不是六位十六进制值时抛出。</zh-CN><en>Thrown when the color is not a six-digit hexadecimal value.</en></lang>
 */
export function parseHexColor(color) {
  // <lang><zh-CN>把任意输入先显式转为小写字符串，只接受固定 six-digit hex 而不计算 CSS 变量、函数或 alpha。</zh-CN><en>First explicitly converts arbitrary input to a lowercase string and accepts only fixed six-digit hex, never evaluating CSS variables, functions, or alpha.</en></lang>
  const normalized = String(color).trim().toLowerCase();

  // <lang><zh-CN>正则匹配捕获三组双位通道，失败时由明确错误而不是隐式 NaN 终止调用。</zh-CN><en>The regular expression captures three double-digit channels; failure terminates the call through an explicit error rather than implicit NaN.</en></lang>
  const match = /^#([0-9a-f]{6})$/.exec(normalized);

  // <lang><zh-CN>拒绝不透明或部分颜色语法，保证 contrast gate 只报告其实际可证明的 token 基线。</zh-CN><en>Rejects opaque or partial color syntax so the contrast gate reports only the token baseline it can actually prove.</en></lang>
  if (!match) {
    throw new TypeError(`Expected a six-digit hexadecimal color, received ${color}.`);
  }

  // <lang><zh-CN>提取六个十六进制字符的单一可信捕获组，供固定偏移通道转换使用。</zh-CN><en>Extracts the single trusted capture of six hexadecimal characters for fixed-offset channel conversion.</en></lang>
  const value = match[1];

  // <lang><zh-CN>按 RGB 偏移读取并归一化到 0–1，不混合透明度、显示器 profile 或平台渲染状态。</zh-CN><en>Reads RGB offsets and normalizes them to 0–1 without mixing alpha, display profile, or platform rendering state.</en></lang>
  return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16) / 255);
}

/**
 * @lang zh-CN 将单个 sRGB 通道转换为相对亮度计算所需的线性值。
 * @lang en Converts one sRGB channel to the linear value required for relative-luminance calculation.
 * @param {number} channel <lang><zh-CN>范围为 0 至 1 的 sRGB 通道。</zh-CN><en>sRGB channel in the range from 0 to 1.</en></lang>
 * @returns {number} <lang><zh-CN>线性化后的通道值。</zh-CN><en>Linearized channel value.</en></lang>
 */
function linearizeSrgbChannel(channel) {
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

/**
 * @lang zh-CN 计算六位十六进制颜色的 WCAG 相对亮度。
 * @lang en Calculates WCAG relative luminance for a six-digit hexadecimal color.
 * @param {string} color <lang><zh-CN>六位十六进制 CSS 颜色。</zh-CN><en>Six-digit hexadecimal CSS color.</en></lang>
 * @returns {number} <lang><zh-CN>范围为 0 至 1 的相对亮度。</zh-CN><en>Relative luminance in the range from 0 to 1.</en></lang>
 */
export function relativeLuminance(color) {
  // <lang><zh-CN>解构三个已校验 sRGB 通道并逐一线性化，保持 WCAG 数学与 CSS 解析边界分离。</zh-CN><en>Destructures three validated sRGB channels and linearizes each, keeping WCAG mathematics separate from CSS parsing boundaries.</en></lang>
  const [red, green, blue] = parseHexColor(color).map(linearizeSrgbChannel);
  return (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
}

/**
 * @lang zh-CN 计算两种颜色的 WCAG contrast ratio，返回值总是不小于 1。
 * @lang en Calculates the WCAG contrast ratio of two colors; the returned value is always at least 1.
 * @param {string} firstColor <lang><zh-CN>第一种六位十六进制 CSS 颜色。</zh-CN><en>First six-digit hexadecimal CSS color.</en></lang>
 * @param {string} secondColor <lang><zh-CN>第二种六位十六进制 CSS 颜色。</zh-CN><en>Second six-digit hexadecimal CSS color.</en></lang>
 * @returns {number} <lang><zh-CN>WCAG contrast ratio。</zh-CN><en>WCAG contrast ratio.</en></lang>
 */
export function contrastRatio(firstColor, secondColor) {
  // <lang><zh-CN>分别计算两个独立颜色的相对亮度，不比较任何未解析的 CSS 选择器或运行时样式。</zh-CN><en>Calculates relative luminance for two independent colors and compares no unparsed CSS selector or runtime style.</en></lang>
  const firstLuminance = relativeLuminance(firstColor);
  const secondLuminance = relativeLuminance(secondColor);

  // <lang><zh-CN>先确定较亮/较暗值，使比率顺序无关并始终不小于 1。</zh-CN><en>Determines lighter/darker values first so the ratio is order-independent and always at least 1.</en></lang>
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * @lang zh-CN 从 CSS 文本中读取一个明确十六进制 custom property 值；该读取只服务默认主题的可审计 token 基线。
 * @lang en Reads one explicit hexadecimal custom-property value from CSS text; this lookup serves only the auditable default-theme token baseline.
 * @param {string} css <lang><zh-CN>主题 CSS 文本。</zh-CN><en>Theme CSS text.</en></lang>
 * @param {string} tokenName <lang><zh-CN>CSS custom property 名称。</zh-CN><en>CSS custom-property name.</en></lang>
 * @returns {string | null} <lang><zh-CN>规范化十六进制色值，未找到时为 `null`。</zh-CN><en>Normalized hexadecimal color value, or `null` when absent.</en></lang>
 */
function readHexToken(css, tokenName) {
  // <lang><zh-CN>按 token 名称构造严格的 property/value 表达式，只接受完整声明中的六位 hex。</zh-CN><en>Builds a strict property/value expression from the token name and accepts six-digit hex only in a complete declaration.</en></lang>
  const expression = new RegExp(`${tokenName}:\\s*(#[0-9a-fA-F]{6})\\s*;`);

  // <lang><zh-CN>执行只读文本匹配；没有显式值时返回 null，不从 fallback 或计算样式猜测颜色。</zh-CN><en>Executes a read-only text match; returns null when no explicit value exists and never guesses a color from fallback or computed style.</en></lang>
  const match = expression.exec(css);
  return match ? match[1].toLowerCase() : null;
}

/**
 * @lang zh-CN 验证默认主题包含规定的 HIA 基础色，并验证主操作与强调实底的前景组合达到 4.5:1 文本对比度。
 * @lang en Validates that the default theme contains required HIA foundation colors and that primary-action and solid-accent foreground pairs reach a 4.5:1 text contrast ratio.
 * @param {string} [rootDirectory=process.cwd()] <lang><zh-CN>仓库绝对根目录。</zh-CN><en>Absolute repository root directory.</en></lang>
 * @returns {Promise<string[]>} <lang><zh-CN>主题契约问题列表；空数组表示通过。</zh-CN><en>Theme-contract issue list; an empty array means validation passed.</en></lang>
 */
export async function validateThemeContract(rootDirectory = process.cwd()) {
  // <lang><zh-CN>读取固定默认主题文本，不遍历调用方路径或加载运行时 style sheet。</zh-CN><en>Reads fixed default-theme text and neither traverses caller paths nor loads a runtime style sheet.</en></lang>
  const css = await readFile(resolve(rootDirectory, lightThemePath), 'utf8');

  // <lang><zh-CN>汇集所有缺失/不匹配 token 与对比度问题，避免单一问题掩盖其余静态基线回退。</zh-CN><en>Collects every missing/mismatched token and contrast issue so one problem cannot hide other static-baseline regressions.</en></lang>
  const issues = [];

  for (const [tokenName, expectedValue] of requiredReferenceTokens) {
    // <lang><zh-CN>读取当前 token 的显式十六进制值，供与 HIA 颜色规范锁定值逐项比较。</zh-CN><en>Reads the current token's explicit hexadecimal value for one-by-one comparison with the locked HIA color-specification value.</en></lang>
    const actualValue = readHexToken(css, tokenName);

    // <lang><zh-CN>值缺失或不同均为问题，不能由运行时 fallback、透明度或品牌近似色自动通过。</zh-CN><en>Both absence and difference are issues; runtime fallback, opacity, or approximate brand color cannot pass automatically.</en></lang>
    if (actualValue !== expectedValue) {
      issues.push(`${tokenName} must equal ${expectedValue}.`);
    }
  }

  for (const tokenName of requiredButtonTokens) {
    // <lang><zh-CN>按钮组件 token 只检查声明存在，具体运行时 cascade 与平台绘制仍需另行验证。</zh-CN><en>Button component tokens are checked only for declaration presence; runtime cascade and platform painting still need separate validation.</en></lang>
    if (!css.includes(tokenName)) {
      issues.push(`Default theme must define ${tokenName}.`);
    }
  }

  // <lang><zh-CN>计算公开 primary 文本/背景的固定基线，不从页面、业务主题或设备颜色模式读取输入。</zh-CN><en>Calculates the fixed public primary text/background baseline and reads no input from pages, business themes, or device color modes.</en></lang>
  const primaryContrast = contrastRatio('#0047ab', '#ffffff');

  // <lang><zh-CN>计算公开 accent 文本/背景的固定基线，与 primary 独立报告。</zh-CN><en>Calculates the fixed public accent text/background baseline and reports it independently of primary.</en></lang>
  const accentContrast = contrastRatio('#00a8d3', '#001b2e');

  // <lang><zh-CN>低于 4.5:1 时明确报告当前数值；该阈值只覆盖本函数定义的静态文字对。</zh-CN><en>Explicitly reports the current value when below 4.5:1; this threshold covers only the static text pairs defined by this function.</en></lang>
  if (primaryContrast < 4.5) {
    issues.push(`Primary action contrast is ${primaryContrast.toFixed(2)}:1 and must be at least 4.5:1.`);
  }

  // <lang><zh-CN>强调色同样采用独立 4.5:1 检查，避免 token 存在却没有可读文字组合。</zh-CN><en>Accent uses the same independent 4.5:1 check, preventing token presence without a readable text combination.</en></lang>
  if (accentContrast < 4.5) {
    issues.push(`Accent contrast is ${accentContrast.toFixed(2)}:1 and must be at least 4.5:1.`);
  }

  return issues;
}
