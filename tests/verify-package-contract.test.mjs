import assert from 'node:assert/strict';
import test from 'node:test';
import { validatePackageContracts } from '../scripts/package-contract.mjs';

/**
 * @lang zh-CN 确认当前公开 workspace 与 UI/Tool 初始化期包契约一致，避免质量门禁与测试口径分离。
 * @lang en Confirms that the current public workspace matches the initialization-stage UI/Tool package contract so the quality gate and test expectation stay aligned.
 */
test('validates the initialization package contract', async () => {
  // <lang><zh-CN>收集所有 package 契约问题，确保许可证和 fixture 分发边界与既有 workspace 约束一并验证。</zh-CN><en>Collect every package-contract issue so license and fixture-distribution boundaries are verified together with the existing workspace constraints.</en></lang>
  const issues = await validatePackageContracts();
  assert.deepEqual(issues, []);
});
