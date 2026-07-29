import assert from 'node:assert/strict';
import test from 'node:test';
import { contrastRatio, validateThemeContract } from '../scripts/theme-contract.mjs';

/**
 * @module verify-theme-contract.test
 * @lang zh-CN 确认默认 HIA 浅色主题的基础 token 和可读文本组合满足当前可重复验证的 AA 门槛。
 * @lang en Confirms that foundation tokens and readable-text pairs in the default HIA light theme meet the current repeatable AA threshold.
 */

/**
 * @lang zh-CN 验证主题 token 值、主操作前景和强调前景的对比度基线。
 * @lang en Verifies the theme-token values and contrast baselines for primary-action and accent foregrounds.
 */
test('validates the HIA default light-theme contract', async () => {
  // <lang><zh-CN>先收集 theme contract 的全部静态问题；空列表不表示设备、读屏或跨端主题已经验证。</zh-CN><en>First collects every static theme-contract issue; an empty list does not mean device, screen-reader, or cross-platform theme validation is complete.</en></lang>
  const issues = await validateThemeContract();

  // <lang><zh-CN>断言公开的两组文字/背景基线仍满足当前 AA 数值门槛，避免 token 存在但可读性回退。</zh-CN><en>Asserts that the two public text/background baselines still meet the current AA numeric threshold, preventing token presence with readability regression.</en></lang>
  assert.deepEqual(issues, []);
  assert.ok(contrastRatio('#0047ab', '#ffffff') >= 4.5);
  assert.ok(contrastRatio('#00a8d3', '#001b2e') >= 4.5);
});
