import assert from 'node:assert/strict';
import test from 'node:test';
import { validateDocumentationContract } from '../scripts/documentation-contract.mjs';

/**
 * @module verify-documentation-contract.test
 * @lang zh-CN 确认 Documentation Sys 配置与受管 JavaScript 注释满足中英双语起始门禁。
 * @lang en Confirms that the Documentation Sys configuration and governed JavaScript comments satisfy the initial bilingual gate.
 */

/**
 * @lang zh-CN 验证当前仓库的 HIA JSDoc 配置、语言 tag 和受管源码文档块没有契约偏差。
 * @lang en Verifies that the current repository has no contract drift in HIA JSDoc configuration, language tags, or governed source documentation blocks.
 */
test('validates the bilingual Documentation Sys contract', async () => {
  // <lang><zh-CN>运行不写入仓库的文档契约检查，断言当前配置和受管源码没有可报告偏差。</zh-CN><en>Runs the repository-nonwriting documentation contract check and asserts that current configuration and governed source have no reportable drift.</en></lang>
  const issues = await validateDocumentationContract();
  assert.deepEqual(issues, []);
});
