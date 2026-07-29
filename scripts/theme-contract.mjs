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
  const normalized = String(color).trim().toLowerCase();
  const match = /^#([0-9a-f]{6})$/.exec(normalized);

  if (!match) {
    throw new TypeError(`Expected a six-digit hexadecimal color, received ${color}.`);
  }

  const value = match[1];
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
  const firstLuminance = relativeLuminance(firstColor);
  const secondLuminance = relativeLuminance(secondColor);
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
  const expression = new RegExp(`${tokenName}:\\s*(#[0-9a-fA-F]{6})\\s*;`);
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
  const css = await readFile(resolve(rootDirectory, lightThemePath), 'utf8');
  const issues = [];

  for (const [tokenName, expectedValue] of requiredReferenceTokens) {
    const actualValue = readHexToken(css, tokenName);

    if (actualValue !== expectedValue) {
      issues.push(`${tokenName} must equal ${expectedValue}.`);
    }
  }

  for (const tokenName of requiredButtonTokens) {
    if (!css.includes(tokenName)) {
      issues.push(`Default theme must define ${tokenName}.`);
    }
  }

  const primaryContrast = contrastRatio('#0047ab', '#ffffff');
  const accentContrast = contrastRatio('#00a8d3', '#001b2e');

  if (primaryContrast < 4.5) {
    issues.push(`Primary action contrast is ${primaryContrast.toFixed(2)}:1 and must be at least 4.5:1.`);
  }

  if (accentContrast < 4.5) {
    issues.push(`Accent contrast is ${accentContrast.toFixed(2)}:1 and must be at least 4.5:1.`);
  }

  return issues;
}
