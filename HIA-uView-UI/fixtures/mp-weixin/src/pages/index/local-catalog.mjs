/**
 * @module local-catalog
 * @lang zh-CN 为 compile-only `mp-weixin` fixture 提供固定、匿名、本地目录 mock 与同步投影 helper。它只服务组件组合证据，不表示 HIA-uView-Biz 模块、行业 schema、服务器响应、查询协议、路由或持久化模型。
 * @lang en Provides fixed, anonymous, local catalog mock records and synchronous projection helpers for the compile-only `mp-weixin` fixture. It serves component-composition evidence only and represents no HIA-uView-Biz module, industry schema, server response, query protocol, router, or persistence model.
 */

/**
 * @typedef {Readonly<{ id: string, title: string, description: string, category: string }>} LocalCatalogRecord
 * @lang zh-CN 本地 fixture 可呈现的最小匿名记录形状。四项字段都是调用方文字和本地选择键，不映射真实用户、客户、产品、资源或后端数据。
 * @lang en Minimum anonymous record shape presentable by the local fixture. All four fields are caller copy and local selection keys and map to no real user, customer, product, resource, or backend data.
 */

/**
 * @lang zh-CN 固定的本地 mock 目录集合。每条记录仅用于演示目录、查询与详情投影；集合被冻结，避免 fixture 形成可写数据源、缓存或隐式业务状态。
 * @lang en Fixed local mock catalog collection. Every record is used only to demonstrate directory, query, and detail projections; the collection is frozen so the fixture forms no writable data source, cache, or implicit business state.
 * @type {readonly LocalCatalogRecord[]}
 */
export const LOCAL_CATALOG_RECORDS = Object.freeze([
  // <lang><zh-CN>第一个匿名样例提供简短中英标题和通用分类，不暗示任何行业实体或真实数据来源。</zh-CN><en>The first anonymous sample provides a short bilingual title and generic category without implying an industry entity or real data source.</en></lang>
  Object.freeze({
    id: 'sample-alpha',
    title: '样例 Alpha / Sample Alpha',
    description: '用于本地组件组合的固定目录条目。',
    category: '示例 / Sample'
  }),
  // <lang><zh-CN>第二个匿名样例使同步查询和选择至少覆盖多个本地候选，而不引入分页、加载或服务端排序。</zh-CN><en>The second anonymous sample makes synchronous query and selection cover multiple local candidates without introducing paging, loading, or server sorting.</en></lang>
  Object.freeze({
    id: 'sample-beta',
    title: '样例 Beta / Sample Beta',
    description: '仅用于验证调用方拥有的详情投影。',
    category: '参考 / Reference'
  }),
  // <lang><zh-CN>第三个匿名样例为无结果 reset 和大小写查询提供不同文字，不构成可扩展的领域分类体系。</zh-CN><en>The third anonymous sample supplies different text for empty-result reset and case-insensitive query without forming an extensible domain-classification system.</en></lang>
  Object.freeze({
    id: 'sample-gamma',
    title: '样例 Gamma / Sample Gamma',
    description: '编译与本地 runtime 证据使用的静态说明。',
    category: '演示 / Demonstration'
  })
]);

/**
 * @lang zh-CN 将调用方受控查询字符串规范化为同步比较键。该 helper 只去除首尾空白并转为小写；它不解析语法、不分词、不记录、不发送、不过滤真实数据，也不定义相关性规则。
 * @lang en Normalizes a caller-controlled query string into a synchronous comparison key. This helper only trims outer whitespace and lowercases; it parses no syntax, tokenizes nothing, logs nothing, sends nothing, filters no real data, and defines no relevance rule.
 * @param {string} query <lang><zh-CN>页面从受控 `UInput` 写回的本地字符串。</zh-CN><en>Local string written back by the page from controlled `UInput`.</en></lang>
 * @returns {string} <lang><zh-CN>仅供本地 `includes` 比较的规范化字符串。</zh-CN><en>Normalized string used only for local `includes` comparison.</en></lang>
 */
export function normalizeLocalCatalogQuery(query) {
  // <lang><zh-CN>先收紧为字符串，防御测试或未来调用方错误传入非字符串，同时不把该值解释为任何业务输入。</zh-CN><en>First narrows to a string, defending against a test or future caller mistakenly passing a non-string while interpreting the value as no business input.</en></lang>
  const safeQuery = typeof query === 'string' ? query : '';

  // <lang><zh-CN>返回无副作用的本地比较键；大小写归一化只用于本 fixture 的匿名展示文字。</zh-CN><en>Returns a side-effect-free local comparison key; case normalization is used only for this fixture's anonymous display text.</en></lang>
  return safeQuery.trim().toLowerCase();
}

/**
 * @lang zh-CN 按规范化查询同步投影固定本地目录。空查询保留全量固定集合的记录顺序；非空查询只比较标题、说明和通用分类文字，不读取外部输入或修改原集合。
 * @lang en Synchronously projects the fixed local catalog by normalized query. An empty query retains fixed-collection record order; a non-empty query compares only title, description, and generic category text and neither reads external input nor mutates the original collection.
 * @param {readonly LocalCatalogRecord[]} records <lang><zh-CN>版本控制的有限本地 mock 集合。</zh-CN><en>Version-controlled finite local mock collection.</en></lang>
 * @param {string} query <lang><zh-CN>调用方当前拥有的查询字符串。</zh-CN><en>Current query string owned by the caller.</en></lang>
 * @returns {LocalCatalogRecord[]} <lang><zh-CN>保持输入顺序的同步本地投影；返回新数组但不创建缓存或持久化状态。</zh-CN><en>Synchronous local projection retaining input order; returns a new array but creates no cache or persistent state.</en></lang>
 */
export function filterLocalCatalogRecords(records, query) {
  // <lang><zh-CN>将查询转为本地比较键，使所有记录共享同一明确、无网络的筛选前提。</zh-CN><en>Converts the query into a local comparison key so every record shares one explicit, network-free filtering premise.</en></lang>
  const normalizedQuery = normalizeLocalCatalogQuery(query);

  // <lang><zh-CN>空键应保留目录的全部本地记录；slice 创建新的展示数组，避免调用方误以为它可写入冻结源集合。</zh-CN><en>An empty key must retain every local catalog record; slice creates a new display array so callers cannot mistake it for a writable source collection.</en></lang>
  if (normalizedQuery.length === 0) {
    return records.slice();
  }

  // <lang><zh-CN>只拼接已声明的匿名展示字段作为同步 haystack；不引入 ID 搜索、业务字段、权重或服务端语义。</zh-CN><en>Concatenates only declared anonymous display fields as a synchronous haystack; it introduces no ID search, business field, weight, or server semantics.</en></lang>
  return records.filter((record) => {
    // <lang><zh-CN>记录文字按与查询相同的纯本地规则规范化，以便大小写差异不改变 fixture 的展示证据。</zh-CN><en>Record copy is normalized by the same pure local rule as the query so case differences do not change the fixture's presentation evidence.</en></lang>
    const searchableText = `${record.title} ${record.description} ${record.category}`.toLowerCase();

    // <lang><zh-CN>仅返回包含比较键的本地记录；该布尔结果不表示相关性评分、权限或数据可见性结论。</zh-CN><en>Returns only local records containing the comparison key; this boolean result represents no relevance score, permission, or data-visibility conclusion.</en></lang>
    return searchableText.includes(normalizedQuery);
  });
}

/**
 * @lang zh-CN 从固定本地目录按 selected identifier 取得一个详情投影来源。它只做同步、精确的本地 ID 比较；不存在时返回 `null`，不请求、重试、缓存或推断替代记录。
 * @lang en Obtains one detail-projection source from the fixed local catalog by selected identifier. It performs only synchronous exact local ID comparison; when absent it returns `null` and neither requests, retries, caches, nor infers a substitute record.
 * @param {readonly LocalCatalogRecord[]} records <lang><zh-CN>版本控制的有限本地 mock 集合。</zh-CN><en>Version-controlled finite local mock collection.</en></lang>
 * @param {string | null} identifier <lang><zh-CN>页面拥有的当前选择键，或未选择时的 `null`。</zh-CN><en>Current selection key owned by the page, or `null` when no record is selected.</en></lang>
 * @returns {LocalCatalogRecord | null} <lang><zh-CN>匹配的本地记录；没有精确匹配时为 `null`。</zh-CN><en>Matching local record, or `null` when there is no exact match.</en></lang>
 */
export function findLocalCatalogRecord(records, identifier) {
  // <lang><zh-CN>空选择没有可投影详情；提前返回避免将列表第一项或任何默认项误称为用户选择。</zh-CN><en>An empty selection has no detail to project; the early return avoids mislabeling the first list item or any default item as a user selection.</en></lang>
  if (identifier === null) {
    return null;
  }

  // <lang><zh-CN>在固定本地集合中查找精确标识；find 不改变顺序、集合内容或页面状态。</zh-CN><en>Finds an exact identifier in the fixed local collection; find changes neither order, collection content, nor page state.</en></lang>
  return records.find((record) => record.id === identifier) ?? null;
}
