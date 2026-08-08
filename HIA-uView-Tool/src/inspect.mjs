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

/**
 * @lang zh-CN API compatibility 单组件中会被逐项汇总的固定能力维度；aliases/easycom/types/platforms 由其独立摘要字段呈现，不与 API item 数混算。
 * @lang en Fixed capability dimensions summarized item by item for one API-compatibility component; aliases, easycom, types, and platforms are presented through their own summary fields rather than mixed into API-item counts.
 */
const apiInventoryDimensions = Object.freeze(['props', 'events', 'slots', 'imperativeApis']);

/**
 * @lang zh-CN 创建一个空的 migration disposition 计数器，避免缺少某类事实时省略 JSON 键并造成自动化输出漂移。
 * @lang en Creates an empty migration-disposition counter so a missing fact category does not omit JSON keys and cause automation-output drift.
 * @returns {{compatible: number, mapped: number, unsupported: number}} <lang><zh-CN>三个公开 disposition 的零值计数。</zh-CN><en>Zero-value counts for the three public dispositions.</en></lang>
 */
function createDispositionCounts() {
  // <lang><zh-CN>返回新的可变计数对象，仅由当前纯内存汇总流程拥有；不附着或写回 manifest。</zh-CN><en>Return a new mutable counter owned only by the current in-memory summary flow; it is neither attached nor written back to the manifest.</en></lang>
  return { compatible: 0, mapped: 0, unsupported: 0 };
}

/**
 * @lang zh-CN 从已通过 schema 校验的单组件矩阵现场派生 API item、disposition 与 unresolved 数；不信任或接受 manifest 自报 totals。
 * @lang en Derives API-item, disposition, and unresolved counts on the fly from one schema-valid component matrix; trusts and accepts no manifest-reported totals.
 * @param {object} component <lang><zh-CN>已校验且只含公开 metadata 的组件矩阵项。</zh-CN><en>A validated component-matrix entry containing only public metadata.</en></lang>
 * @returns {object} <lang><zh-CN>供 text/JSON 报告使用的有限稳定摘要。</zh-CN><en>A bounded stable summary for text and JSON reports.</en></lang>
 */
function summarizeApiComponent(component) {
  // <lang><zh-CN>disposition 计数只覆盖四个 API item 维度，避免把 component/easycom/type/platform 结论重复相加。</zh-CN><en>Disposition counts cover only the four API-item dimensions, avoiding double-counting component, easycom, type, or platform conclusions.</en></lang>
  const dispositions = createDispositionCounts();
  // <lang><zh-CN>按公开维度保留独立 item 数，使使用者能区分 prop 缺口和 event/slot/imperative 缺口。</zh-CN><en>Retain item counts per public dimension so users can distinguish prop gaps from event, slot, or imperative gaps.</en></lang>
  const dimensions = {};
  // <lang><zh-CN>unresolvedInventory 只统计显式 unresolved 容器；unsupported item 仍属于 complete inventory，不被错误归入未知。</zh-CN><en>Unresolved inventory counts only explicit unresolved containers; unsupported items may still belong to a complete inventory and are not mislabeled unknown.</en></lang>
  let unresolvedInventories = 0;

  // <lang><zh-CN>固定次序遍历确保 JSON key 和累计结果跨配置、平台与编辑器保持稳定。</zh-CN><en>Iterate in fixed order so JSON keys and accumulated results remain stable across configurations, platforms, and editors.</en></lang>
  for (const dimension of apiInventoryDimensions) {
    // <lang><zh-CN>容器已经通过 loader 的完整性校验；此处只读取有限 items 和 inventoryState，不重新解释 schema。</zh-CN><en>The container has passed loader completeness validation; read only its bounded items and inventoryState without reinterpreting the schema.</en></lang>
    const inventory = component[dimension];
    // <lang><zh-CN>每个维度计数使用实际 items 长度，不接受外部 total 或推断缺失项目。</zh-CN><en>Each dimension count uses the actual items length and accepts no external total or inferred missing item.</en></lang>
    dimensions[dimension] = inventory.items.length;
    if (inventory.inventoryState === 'unresolved') {
      // <lang><zh-CN>明确 unresolved 只增加可见风险计数，不产生 Tool failure；引用完整性已由 loader 保证。</zh-CN><en>An explicit unresolved state only increases the visible risk count and does not fail the Tool; referential integrity is guaranteed by the loader.</en></lang>
      unresolvedInventories += 1;
    }

    // <lang><zh-CN>每个 item 恰好拥有一个受控 migration disposition，因此可安全累加到固定键。</zh-CN><en>Each item owns exactly one constrained migration disposition and can therefore be safely accumulated into a fixed key.</en></lang>
    for (const item of inventory.items) {
      dispositions[item.migration.disposition] += 1;
    }
  }

  // <lang><zh-CN>itemCount 是四个维度的真实和；显式 reduce 起点避免空容器组合产生非数字值。</zh-CN><en>Item count is the actual sum of the four dimensions; an explicit reduce seed prevents an all-empty inventory from producing a nonnumeric value.</en></lang>
  const itemCount = Object.values(dimensions).reduce((total, count) => total + count, 0);
  return {
    itemCount,
    dimensions,
    dispositions,
    unresolvedInventories,
    issueCount: component.issueIds.length,
    easycom: component.easycom.migration.disposition,
    types: component.types.migration.disposition,
    migration: component.migration.disposition
  };
}

/**
 * @lang zh-CN 由已校验的 99 项组件摘要派生 manifest 总计；该函数不把 unsupported/unresolved 当作 schema 错误或平台支持结论。
 * @lang en Derives manifest totals from validated component summaries; this function treats neither unsupported nor unresolved as a schema error or platform-support conclusion.
 * @param {Array<{component: object, summary: object}>} componentRecords <lang><zh-CN>带现场摘要的稳定组件记录。</zh-CN><en>Stable component records carrying on-the-fly summaries.</en></lang>
 * @param {number} issueCount <lang><zh-CN>已校验公开 issue 清单的实际长度。</zh-CN><en>Actual length of the validated public issue list.</en></lang>
 * @returns {object} <lang><zh-CN>manifest 级有限统计。</zh-CN><en>Bounded manifest-level totals.</en></lang>
 */
function summarizeApiManifest(componentRecords, issueCount) {
  // <lang><zh-CN>优先级计数器保留全部三个公开键，即使当前矩阵某层为零。</zh-CN><en>The priority counter retains all three public keys even when the current matrix has zero entries in a tier.</en></lang>
  const priorities = { P0: 0, P1: 0, P2: 0 };
  // <lang><zh-CN>总 disposition 与每组件算法使用相同固定键，确保 text/JSON 解释一致。</zh-CN><en>Total dispositions use the same fixed keys as the per-component algorithm, keeping text and JSON interpretation aligned.</en></lang>
  const dispositions = createDispositionCounts();
  // <lang><zh-CN>实际 API item 与 unresolved 容器数从零开始逐组件累积，不依赖矩阵中的易漂移 summary。</zh-CN><en>Actual API-item and unresolved-container counts accumulate from zero per component and do not depend on a drifting summary in the matrix.</en></lang>
  let itemCount = 0;
  let unresolvedInventories = 0;

  // <lang><zh-CN>组件输入已按 code point 校验；保持该顺序同时累积统计，不做 locale 排序。</zh-CN><en>Component input is already validated in code-point order; preserve that order while accumulating totals and perform no locale sort.</en></lang>
  for (const record of componentRecords) {
    priorities[record.component.priority] += 1;
    itemCount += record.summary.itemCount;
    unresolvedInventories += record.summary.unresolvedInventories;
    // <lang><zh-CN>逐个固定 disposition 键相加，避免 Object iteration 接纳未来未审计分类。</zh-CN><en>Add each fixed disposition key explicitly, avoiding acceptance of a future unaudited category through object iteration.</en></lang>
    dispositions.compatible += record.summary.dispositions.compatible;
    dispositions.mapped += record.summary.dispositions.mapped;
    dispositions.unsupported += record.summary.dispositions.unsupported;
  }

  return {
    componentCount: componentRecords.length,
    itemCount,
    priorities,
    dispositions,
    unresolvedInventories,
    issueCount
  };
}

/**
 * @lang zh-CN 生成 API compatibility inspect 的公开 comparison/migration metadata 与现场统计；输出不读取组件源码、上游 checkout、类型正文或网络。
 * @lang en Generates public comparison/migration metadata and on-the-fly statistics for API-compatibility inspection; output reads no component source, upstream checkout, type body, or network.
 * @param {object[]} apiCompatibilityManifests <lang><zh-CN>配置白名单中已经完成 schema 与关联校验的加载结果。</zh-CN><en>Load results from the configuration allowlist after schema and linkage validation.</en></lang>
 * @returns {object} <lang><zh-CN>仅含有效矩阵的稳定 inspect details。</zh-CN><en>Stable inspect details containing only valid matrices.</en></lang>
 */
export function createApiCompatibilityInspection(apiCompatibilityManifests) {
  // <lang><zh-CN>结构失败的矩阵只通过 diagnostics 呈现，避免部分条目在 JSON 中看似成为可信迁移建议。</zh-CN><en>Structurally failing matrices appear only through diagnostics so partial entries do not look like trusted migration advice in JSON.</en></lang>
  const validEntries = apiCompatibilityManifests.filter((entry) => entry.diagnostics.length === 0 && entry.manifest);
  // <lang><zh-CN>多个声明矩阵按安全相对路径排序；不修改 configuration 或 loader 保留的 entry 数组。</zh-CN><en>Sort multiple declared matrices by safe relative path without mutating configuration or the entry array retained by the loader.</en></lang>
  const orderedEntries = sortByPath(validEntries);

  return {
    kind: 'api-compatibility',
    manifests: orderedEntries.map((entry) => {
      // <lang><zh-CN>当前 manifest 已通过固定字段、引用、路径、状态和默认值校验；structuredClone 创建与 loader 数据分离的纯 JSON 投影。</zh-CN><en>The current manifest has passed fixed-field, reference, path, status, and default-value validation; structuredClone creates a pure JSON projection detached from loader data.</en></lang>
      const manifest = entry.manifest;
      // <lang><zh-CN>逐组件建立摘要与深复制矩阵，保留声明 scope 内的全部 API mapping 供 JSON consumer 审阅，同时不暴露源码正文。</zh-CN><en>Build a summary and deep-cloned matrix per component, retaining every API mapping within the declared scopes for JSON consumers without exposing source body.</en></lang>
      const componentRecords = manifest.components.map((component) => ({
        component,
        summary: summarizeApiComponent(component)
      }));
      // <lang><zh-CN>manifest summary 完全由本次 component records 和 issue 清单派生。</zh-CN><en>The manifest summary is derived entirely from the current component records and issue list.</en></lang>
      const summary = summarizeApiManifest(componentRecords, manifest.issues.length);
      return {
        path: entry.path,
        version: manifest.version,
        profile: manifest.profile,
        comparison: structuredClone(manifest.comparison),
        local: structuredClone(manifest.local),
        summary,
        issues: structuredClone(manifest.issues),
        components: componentRecords.map((record) => ({
          ...structuredClone(record.component),
          summary: record.summary
        }))
      };
    })
  };
}
