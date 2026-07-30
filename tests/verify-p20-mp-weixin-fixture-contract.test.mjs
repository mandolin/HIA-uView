/**
 * @module verify-p20-mp-weixin-fixture-contract
 * @lang zh-CN 验证 P20 的 mp-weixin fixture 保持显式平台编译器声明和受限内部验证说明；静态测试不替代真实 compiler、微信开发者工具、模拟器、真机、读屏、焦点、跨端或发布证据。
 * @lang en Verifies that the P20 mp-weixin fixture retains its explicit platform-compiler declaration and constrained internal-validation guidance; this static test does not replace evidence from the real compiler, WeChat DevTools, simulator, device, screen reader, focus, cross-platform testing, or release.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

const fixturePackagePath = 'HIA-uView-UI/fixtures/mp-weixin/package.json';
const fixtureReadmePath = 'HIA-uView-UI/fixtures/mp-weixin/README.md';
const fixtureBuildPath = 'HIA-uView-UI/fixtures/mp-weixin/build.mjs';
const fixtureManifestPath = 'HIA-uView-UI/manifest.json';
const compatibilityManifestPath = 'HIA-uView-UI/hia-uview.compatibility.json';

/**
 * @lang zh-CN 验证 fixture 的独立 package metadata 声明锁定微信编译器，并以 README 与 compatibility metadata 公开其受限校验、风险披露和非运行时边界。
 * @lang en Verifies that the fixture's independent package metadata declares the locked WeChat compiler and that its README and compatibility metadata disclose constrained validation, risk, and non-runtime boundaries.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；元数据或说明漂移时抛出断言错误。</zh-CN><en>Resolves without a value and throws an assertion error when metadata or guidance drifts.</en></lang>
 */
test('keeps the mp-weixin fixture compiler declaration and internal validation boundary explicit', async () => {
  // <lang><zh-CN>只读取仓库内受控 fixture metadata 与说明，不执行 compiler、开发者工具或任何网络/发布动作。</zh-CN><en>Reads only controlled in-repository fixture metadata and guidance; executes no compiler, DevTools, network, or release action.</en></lang>
  const [packageContent, readme, buildSource, manifestContent, compatibilityContent] = await Promise.all([
    readFile(resolve(fixturePackagePath), 'utf8'),
    readFile(resolve(fixtureReadmePath), 'utf8'),
    readFile(resolve(fixtureBuildPath), 'utf8'),
    readFile(resolve(fixtureManifestPath), 'utf8'),
    readFile(resolve(compatibilityManifestPath), 'utf8')
  ]);
  const fixturePackage = JSON.parse(packageContent);
  const fixtureManifest = JSON.parse(manifestContent);
  const compatibilityManifest = JSON.parse(compatibilityContent);

  assert.equal(fixturePackage.devDependencies?.['@dcloudio/uni-mp-weixin'], '3.0.0-5010520260709002');
  assert.equal(fixturePackage.scripts.build, 'node build.mjs');
  assert.match(buildSource, /UNI_INPUT_DIR: uiPackageDirectory/);
  assert.match(buildSource, /'build', '-p', 'mp-weixin'/);
  assert.equal(fixtureManifest['mp-weixin']?.appid, 'touristappid');
  assert.match(readme, /dist\/build\/mp-weixin/);
  assert.match(readme, /project\.config\.json/);
  assert.match(readme, /finally/);
  assert.match(readme, /not a UI runtime dependency/);
  assert.match(readme, /does not constitute evidence of actual import/);
  assert.deepEqual(compatibilityManifest.verified.map((evidence) => evidence.scope), ['compiler-only', 'local-fixture-only', 'jsdom-only']);
  assert.equal(compatibilityManifest.unverified.includes('weixin-devtools'), false);
  assert.ok(compatibilityManifest.unverified.includes('device'));
});
