import assert from 'node:assert/strict';
import test from 'node:test';
import { validatePackageContracts } from '../scripts/package-contract.mjs';

/**
 * 中文：确认当前公开 workspace 与 UI/Tool 初始化期包契约一致，避免质量门禁与测试口径分离。
 * English: Confirm that the current public workspace matches the initialization-stage UI/Tool package contract so the quality gate and test expectation stay aligned.
 */
test('validates the initialization package contract', async () => {
  const issues = await validatePackageContracts();
  assert.deepEqual(issues, []);
});
