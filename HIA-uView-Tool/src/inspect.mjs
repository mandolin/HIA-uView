import { normalizeRelativePath } from './config.mjs';

/**
 * @module tool-inspect
 * @lang zh-CN 将已通过 schema 校验的 HIA-uView UI metadata 投影为受边界约束的 inspect details；模块不读取、推断或执行 metadata 所引用的文件。
 * @lang en Projects schema-valid HIA-uView UI metadata into bounded inspect details; the module neither reads, infers, nor executes files referenced by metadata.
 */

/**
 * @lang zh-CN 按稳定相对路径创建新的排序副本，避免在报告生成过程中修改调用方保留的加载结果。
 * @lang en Creates a new sorted copy by stable relative path, avoiding mutation of load results retained by the caller during report generation.
 */
function sortByPath(entries) {
  // <lang><zh-CN>浅复制保留 entry/manifest 对象身份，排序只作用于本次 inspect 的数组视图。</zh-CN><en>A shallow copy retains entry and manifest object identity while sorting affects only this inspect array view.</en></lang>
  const sortedEntries = [...entries];
  // <lang><zh-CN>路径来自已校验的安全相对 JSON，因此简单字符串比较足以提供跨主机确定顺序。</zh-CN><en>Paths come from validated safe relative JSON, so simple string comparison provides deterministic order across hosts.</en></lang>
  sortedEntries.sort((left, right) => (left.path === right.path ? 0 : left.path < right.path ? -1 : 1));
  return sortedEntries;
}

/**
 * @lang zh-CN 生成 component inspect 的公开 metadata；仅保留名称、相对 source/contract 路径和 runtime locale，不携带 source/Markdown 正文、fixture 或私有路径。
 * @lang en Generates public metadata for component inspect; retains only names, relative source/contract paths, and runtime locales, with no source or Markdown body, fixture, or private path.
 */
export function createComponentInspection(componentManifests) {
  // <lang><zh-CN>只接受无诊断且含解析 manifest 的条目；有错误的文件由 report diagnostics 表示，不会形成不可信细节。</zh-CN><en>Accept only entries with no diagnostics and a parsed manifest; erroneous files are represented by report diagnostics and do not form untrustworthy details.</en></lang>
  const validEntries = componentManifests.filter((entry) => entry.diagnostics.length === 0 && entry.manifest);
  // <lang><zh-CN>按路径排序使多个 UI package manifest 的 inspect JSON 不依赖 configuration 数组编辑顺序。</zh-CN><en>Sort by path so inspect JSON for multiple UI-package manifests does not depend on configuration-array editing order.</en></lang>
  const orderedEntries = sortByPath(validEntries);

  // <lang><zh-CN>details 使用固定 kind 标识，供 text formatter 与自动化消费者区分不同 inspect 投影。</zh-CN><en>Details uses a fixed kind identifier so text formatters and automation consumers can distinguish inspect projections.</en></lang>
  return {
    kind: 'components',
    manifests: orderedEntries.map((entry) => {
      // <lang><zh-CN>当前 manifest 是已校验 UI metadata；其公开字段可被安全复制到报告而不触发文件读取。</zh-CN><en>The current manifest is validated UI metadata; its public fields may be safely copied into a report without triggering file reads.</en></lang>
      const manifest = entry.manifest;
      return {
        path: entry.path,
        version: manifest.version,
        profile: manifest.profile,
        styleEntry: normalizeRelativePath(manifest.styleEntry),
        components: manifest.components.map((component) => ({
          name: component.name.trim(),
          source: normalizeRelativePath(component.source),
          contract: normalizeRelativePath(component.contract),
          locales: [...component.locales]
        }))
      };
    })
  };
}

/**
 * @lang zh-CN 生成 compatibility inspect 的公开 evidence metadata；输出仅复述 manifest 声明的有限证据与未验证环境，绝不推断支持状态。
 * @lang en Generates public evidence metadata for compatibility inspect; output only restates limited manifest-declared evidence and unverified environments and never infers support status.
 */
export function createCompatibilityInspection(compatibilityManifests) {
  // <lang><zh-CN>排除 schema 失败条目，避免部分 evidence 看似通过而掩盖同一 manifest 的结构问题。</zh-CN><en>Exclude schema-failing entries so partial evidence does not appear to pass while hiding a structural problem in the same manifest.</en></lang>
  const validEntries = compatibilityManifests.filter((entry) => entry.diagnostics.length === 0 && entry.manifest);
  // <lang><zh-CN>路径排序使多个 profile evidence 的 JSON/text 顺序稳定；它不改变 manifest 内已经受校验的证据顺序。</zh-CN><en>Path sorting stabilizes JSON and text order for multiple profile evidence entries; it does not alter the already-validated evidence order within a manifest.</en></lang>
  const orderedEntries = sortByPath(validEntries);

  // <lang><zh-CN>固定 kind 防止 report consumer 将 compatibility 细节误当作 component metadata。</zh-CN><en>The fixed kind prevents report consumers from mistaking compatibility details for component metadata.</en></lang>
  return {
    kind: 'compatibility',
    manifests: orderedEntries.map((entry) => {
      // <lang><zh-CN>当前 compatibility manifest 仅提供声明事实；target 不会在投影期间被打开或执行。</zh-CN><en>The current compatibility manifest supplies declaration facts only; targets are not opened or executed during projection.</en></lang>
      const manifest = entry.manifest;
      return {
        path: entry.path,
        version: manifest.version,
        profile: manifest.profile,
        verified: manifest.verified.map((evidence) => ({
          kind: evidence.kind,
          target: normalizeRelativePath(evidence.target),
          scope: evidence.scope
        })),
        unverified: [...manifest.unverified]
      };
    })
  };
}
