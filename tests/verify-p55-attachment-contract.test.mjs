/**
 * @module verify-p55-attachment-contract.test
 * @lang zh-CN 验证受控 file-state、crop-geometry 和 verification-state 组件的声明、ROP、token 与严格降级边界；本测试不启动 chooser、Canvas、网络、timer、storage 或平台 API。
 * @lang en Verifies declarations, ROP, tokens, and strict-degradation boundaries of controlled file-state, crop-geometry, and verification-state components; this test starts no chooser, Canvas, network, timer, storage, or platform API.
 */

import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

// <lang><zh-CN>锁定最后三项组件的稳定名称、公开契约和 token 前缀。</zh-CN><en>Locks stable names, public contracts, and token prefixes of the final three components.</en></lang>
const attachmentRecords = Object.freeze([
  Object.freeze({ name: 'u-avatar-cropper', contract: 'docs/avatar-cropper.md', token: '--u-comp-avatar-cropper-' }),
  Object.freeze({ name: 'u-upload', contract: 'docs/upload.md', token: '--u-comp-upload-' }),
  Object.freeze({ name: 'u-verification-code', contract: 'docs/verification-code.md', token: '--u-comp-verification-code-' })
]);

/**
 * @lang zh-CN 解析同名组件源码和样式路径；记录仅来自受限本地常量。
 * @lang en Resolves same-named component source and style paths; records come only from constrained local constants.
 * @param {{name: string}} record <lang><zh-CN>锁定组件记录。</zh-CN><en>Locked component record.</en></lang>
 * @returns {{source: string, style: string}} <lang><zh-CN>相对仓库根的源码和样式路径。</zh-CN><en>Source and style paths relative to repository root.</en></lang>
 */
function componentPaths(record) {
  // <lang><zh-CN>同名目录/文件使 manifest 与物理组件边界保持可审计的一对一映射。</zh-CN><en>Same-named directory/file keeps an auditable one-to-one mapping between manifest and physical component boundary.</en></lang>
  const root = `HIA-uView-UI/src/components/${record.name}`;
  return Object.freeze({ source: `${root}/${record.name}.vue`, style: `${root}/${record.name}.css` });
}

/**
 * @lang zh-CN 验证 manifest、源码、样式和公开契约对三项严格降级组件保持一致。
 * @lang en Verifies that manifest, source, style, and public contracts stay aligned for three strict-degradation components.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects when an assertion fails.</en></lang>
 */
test('keeps attachment and verification declarations aligned', async () => {
  // <lang><zh-CN>通过名称索引 manifest，使测试不依赖增量追加顺序。</zh-CN><en>Indexes manifest by name so the test depends on no incremental append order.</en></lang>
  const manifest = JSON.parse(await readFile(resolve('HIA-uView-UI/hia-uview.components.json'), 'utf8'));
  const manifestByName = new Map(manifest.components.map((component) => [component.name, component]));
  for (const record of attachmentRecords) {
    // <lang><zh-CN>每项必须声明双语 locale，并引用同名源码与可公开消费的契约。</zh-CN><en>Every item must declare bilingual locale and reference same-named source and publicly consumable contract.</en></lang>
    const manifestRecord = manifestByName.get(record.name);
    const paths = componentPaths(record);
    assert.ok(manifestRecord, `Manifest must declare ${record.name}.`);
    assert.equal(manifestRecord.source, paths.source.replace('HIA-uView-UI/', ''));
    assert.equal(manifestRecord.contract, record.contract);
    assert.deepEqual(manifestRecord.locales, ['zh-Hans', 'en']);
    await access(resolve(paths.source));
    await access(resolve(paths.style));
    await access(resolve(record.contract));
  }
  assert.ok(manifest.components.length >= 89);
});

/**
 * @lang zh-CN 验证源码排除文件/图片 chooser、Canvas、weCropper、bytes、网络、timer、storage、身份和平台访问。
 * @lang en Verifies source excludes file/image chooser, Canvas, weCropper, bytes, network, timer, storage, identity, and platform access.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects when an assertion fails.</en></lang>
 */
test('keeps attachment and verification components strictly caller-controlled', async () => {
  // <lang><zh-CN>先剥离注释，避免安全边界说明文本触发可执行源码禁令。</zh-CN><en>Strips comments first, avoiding execution-source prohibition triggers from safety-boundary explanation text.</en></lang>
  const sources = await Promise.all(attachmentRecords.map((record) => readFile(resolve(componentPaths(record).source), 'utf8')));
  const styles = await Promise.all(attachmentRecords.map((record) => readFile(resolve(componentPaths(record).style), 'utf8')));
  const executable = [...sources, ...styles].join('\n').replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const forbidden = [
    /\b(?:chooseImage|chooseFile|uploadFile|downloadFile|previewImage)\b/,
    /\b(?:Canvas|canvas|weCropper)\b/,
    /\bset(?:Timeout|Interval)\s*\(/,
    /\b(?:fetch|uni\.request)\s*\(/,
    /\buni\.[A-Za-z]/,
    /\b(?:localStorage|sessionStorage)\s*\./,
    /\bconsole\s*\./,
    /<script[^>]+src=/i,
    /data:image\//i,
    /@font-face/i
  ];
  for (const pattern of forbidden) assert.doesNotMatch(executable, pattern);
  for (const [index, source] of sources.entries()) {
    // <lang><zh-CN>所有源码保留模块级和行内双语 ROP。</zh-CN><en>All source retains module-level and inline bilingual ROP.</en></lang>
    assert.match(source, /@lang zh-CN/, attachmentRecords[index].name);
    assert.match(source, /@lang en/, attachmentRecords[index].name);
    assert.match(source, /<lang><zh-CN>/, attachmentRecords[index].name);
  }
});

/**
 * @lang zh-CN 验证默认主题为三项组件 CSS 实际消费的 token 族提供初值。
 * @lang en Verifies that the default theme provides initial values for token families actually consumed by the three component CSS files.
 * @returns {Promise<void>} <lang><zh-CN>无返回值；断言失败时拒绝。</zh-CN><en>No return value; rejects when an assertion fails.</en></lang>
 */
test('defines attachment and verification token families in the default theme', async () => {
  // <lang><zh-CN>逐项 token 检查避免组件以硬编码视觉值绕过主题契约。</zh-CN><en>Checks tokens item by item, preventing components from bypassing the theme contract with hard-coded visual values.</en></lang>
  const themeCss = await readFile(resolve('HIA-uView-UI/src/theme/hia-light.css'), 'utf8');
  for (const record of attachmentRecords) assert.match(themeCss, new RegExp(`${record.token}[^:]*:`));
});
