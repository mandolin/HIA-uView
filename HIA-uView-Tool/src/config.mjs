import { readFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';

/**
 * @module tool-config
 * @lang zh-CN 为 HIA-uView-Tool 的首轮只读 JSON 配置提供解析与 schema 校验；不执行配置内容，也不接受远程、绝对或越界路径。
 * @lang en Provides parsing and schema validation for the first read-only JSON configuration of HIA-uView-Tool; does not execute configuration content and rejects remote, absolute, and escaping paths.
 */

/**
 * @lang zh-CN 首轮配置允许的固定字段；未知字段被拒绝，避免通过配置悄然引入可执行能力。
 * @lang en Fixed fields allowed by the first configuration schema; unknown fields are rejected so configuration cannot silently introduce executable capability.
 */
const allowedConfigurationFields = new Set([
  'version',
  'projectRoot',
  'profile',
  'locale',
  'report',
  'componentManifests'
]);

/**
 * @lang zh-CN 创建不含绝对路径、源码文本或私有工作区细节的稳定诊断记录。
 * @lang en Creates a stable diagnostic record without absolute paths, source text, or private-workspace details.
 */
export function createDiagnostic(code, message, category = 'project') {
  return Object.freeze({ code, message, category });
}

/**
 * @lang zh-CN 判断字符串是否为本工具允许的仓库内相对路径；拒绝绝对路径、空路径、空字节和任意父目录越界。
 * @lang en Determines whether a string is a repository-relative path allowed by this tool; rejects absolute paths, empty paths, null bytes, and every parent-directory escape.
 */
export function isSafeRelativePath(candidate) {
  if (typeof candidate !== 'string') {
    return false;
  }

  const value = candidate.trim().replaceAll('\\', '/');

  if (!value || value.includes('\u0000') || value.includes('://') || isAbsolute(value)) {
    return false;
  }

  return !value.split('/').some((segment) => segment === '..');
}

/**
 * @lang zh-CN 校验声明式配置对象，并返回全部可操作的调用/配置诊断而非静默忽略未知值。
 * @lang en Validates a declarative configuration object and returns all actionable invocation/configuration diagnostics instead of silently ignoring unknown values.
 */
export function validateConfiguration(configuration) {
  const diagnostics = [];

  if (!configuration || typeof configuration !== 'object' || Array.isArray(configuration)) {
    return [createDiagnostic('CONFIG_SCHEMA_INVALID', 'Configuration must be a JSON object.', 'invocation')];
  }

  for (const field of Object.keys(configuration)) {
    if (!allowedConfigurationFields.has(field)) {
      diagnostics.push(createDiagnostic('CONFIG_UNKNOWN_FIELD', `Configuration field is not allowed: ${field}.`, 'invocation'));
    }
  }

  if (configuration.version !== 1) {
    diagnostics.push(createDiagnostic('CONFIG_VERSION_UNSUPPORTED', 'Configuration version must be 1.', 'invocation'));
  }

  if (configuration.projectRoot !== '.') {
    diagnostics.push(createDiagnostic('CONFIG_PROJECT_ROOT_INVALID', 'The initial Tool implementation accepts projectRoot "." only.', 'invocation'));
  }

  if (configuration.profile !== 'mp-weixin') {
    diagnostics.push(createDiagnostic('CONFIG_PROFILE_UNSUPPORTED', 'The initial Tool implementation supports profile "mp-weixin" only.', 'invocation'));
  }

  if (!['zh-Hans', 'en'].includes(configuration.locale)) {
    diagnostics.push(createDiagnostic('CONFIG_LOCALE_UNSUPPORTED', 'Configuration locale must be "zh-Hans" or "en".', 'invocation'));
  }

  if (!configuration.report || typeof configuration.report !== 'object' || Array.isArray(configuration.report) || !['text', 'json'].includes(configuration.report.format)) {
    diagnostics.push(createDiagnostic('CONFIG_REPORT_INVALID', 'Configuration report.format must be "text" or "json".', 'invocation'));
  }

  if (!Array.isArray(configuration.componentManifests)) {
    diagnostics.push(createDiagnostic('CONFIG_MANIFESTS_INVALID', 'Configuration componentManifests must be an array.', 'invocation'));
  } else {
    const seenPaths = new Set();

    for (const manifestPath of configuration.componentManifests) {
      if (!isSafeRelativePath(manifestPath)) {
        diagnostics.push(createDiagnostic('CONFIG_MANIFEST_PATH_INVALID', 'Every component manifest path must stay inside the selected project root.', 'invocation'));
        continue;
      }

      if (seenPaths.has(manifestPath)) {
        diagnostics.push(createDiagnostic('CONFIG_MANIFEST_PATH_DUPLICATE', `Component manifest path is declared more than once: ${manifestPath}.`, 'invocation'));
      }

      seenPaths.add(manifestPath);
    }
  }

  return diagnostics;
}

/**
 * @lang zh-CN 从调用目录内读取并解析一个受限的 JSON 配置；错误只返回稳定诊断，不回显原始 JSON 或本机路径。
 * @lang en Reads and parses a constrained JSON configuration inside the invocation directory; errors return only stable diagnostics and never echo raw JSON or host paths.
 */
export async function loadConfiguration(rootDirectory, configurationPath) {
  if (!isSafeRelativePath(configurationPath)) {
    return { configuration: null, diagnostics: [createDiagnostic('CONFIG_PATH_INVALID', 'The configuration path must be a non-escaping relative path.', 'invocation')] };
  }

  let content;

  try {
    content = await readFile(resolve(rootDirectory, configurationPath), 'utf8');
  } catch (error) {
    const code = error && error.code === 'ENOENT' ? 'CONFIG_NOT_FOUND' : 'CONFIG_UNREADABLE';
    return { configuration: null, diagnostics: [createDiagnostic(code, 'The declared configuration cannot be read.', 'invocation')] };
  }

  let configuration;

  try {
    configuration = JSON.parse(content);
  } catch {
    return { configuration: null, diagnostics: [createDiagnostic('CONFIG_INVALID_JSON', 'The declared configuration is not valid JSON.', 'invocation')] };
  }

  return { configuration, diagnostics: validateConfiguration(configuration) };
}

/**
 * @lang zh-CN 只读地检查一个已声明的组件 manifest 是否满足首轮版本、平台和最小组件记录要求。
 * @lang en Read-only checks whether one declared component manifest meets the first-slice version, platform, and minimum component-record requirements.
 */
export async function validateComponentManifest(rootDirectory, manifestPath) {
  let content;

  try {
    content = await readFile(resolve(rootDirectory, manifestPath), 'utf8');
  } catch (error) {
    const code = error && error.code === 'ENOENT' ? 'MANIFEST_NOT_FOUND' : 'MANIFEST_UNREADABLE';
    return [createDiagnostic(code, `Declared component manifest is unavailable: ${manifestPath}.`)];
  }

  let manifest;

  try {
    manifest = JSON.parse(content);
  } catch {
    return [createDiagnostic('MANIFEST_INVALID_JSON', `Declared component manifest is not valid JSON: ${manifestPath}.`)];
  }

  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return [createDiagnostic('MANIFEST_SCHEMA_INVALID', `Declared component manifest must be a JSON object: ${manifestPath}.`)];
  }

  const diagnostics = [];

  if (manifest.version !== 1) {
    diagnostics.push(createDiagnostic('MANIFEST_VERSION_UNSUPPORTED', `Component manifest version must be 1: ${manifestPath}.`));
  }

  if (manifest.profile !== 'mp-weixin') {
    diagnostics.push(createDiagnostic('MANIFEST_PROFILE_UNSUPPORTED', `Component manifest profile must be "mp-weixin": ${manifestPath}.`));
  }

  if (!Array.isArray(manifest.components) || manifest.components.length === 0) {
    diagnostics.push(createDiagnostic('MANIFEST_COMPONENTS_INVALID', `Component manifest must declare at least one component: ${manifestPath}.`));
  } else {
    for (const component of manifest.components) {
      if (!component || typeof component.name !== 'string' || !component.name.trim() || !isSafeRelativePath(component.source) || !isSafeRelativePath(component.contract)) {
        diagnostics.push(createDiagnostic('MANIFEST_COMPONENT_INVALID', `Component manifest has an invalid component record: ${manifestPath}.`));
        break;
      }
    }
  }

  return diagnostics;
}
