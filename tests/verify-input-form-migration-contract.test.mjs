/**
 * @module verify-input-form-migration-contract.test
 * @lang zh-CN 锁定 UInput、UTextarea、USearch、UField、UFormItem 与 UForm 的最终本地运行边界、编译组合和 P0 迁移证据。测试只读取明确列出的公开仓内文件，不访问上游检出、网络、平台工具或业务项目，也不写入任何输入。
 * @lang en Locks the final local runtime boundaries, compile composition, and P0 migration evidence of UInput, UTextarea, USearch, UField, UFormItem, and UForm. The test reads only explicitly listed public-repository files, accesses no upstream checkout, network, platform tool, or business project, and writes no input.
 */

// <lang><zh-CN>使用严格断言表达精确公开契约，避免宽松类型转换掩盖源码或 matrix 结论漂移。</zh-CN><en>Uses strict assertions to express exact public contracts and avoid loose type coercion masking source or matrix-conclusion drift.</en></lang>
import assert from 'node:assert/strict';
// <lang><zh-CN>只读取固定源码、文档、生成器、fixture 和已提交 matrix；不发现目录或读取临时输入。</zh-CN><en>Reads only fixed source, documentation, generator, fixture, and committed matrix; it discovers no directories and reads no temporary input.</en></lang>
import { readFile } from 'node:fs/promises';
// <lang><zh-CN>使用 Node 内建测试运行器，使静态契约门禁独立于浏览器、DevTools 或额外服务。</zh-CN><en>Uses the Node built-in test runner, keeping the static contract gate independent from browsers, DevTools, or extra services.</en></lang>
import test from 'node:test';

/**
 * @lang zh-CN 经独立实现、运行时回归和上下游逐项语义审计确认完全一致的精确 compatible props。未列项可以是有运行证据的 mapped，但不能借同名结构冒充完整等价。
 * @lang en Exact compatible props confirmed as fully equal through independent implementation, runtime regression, and itemized upstream/local semantic audit. Unlisted items may be runtime-evidenced mapped items but cannot use same-named structure to impersonate full equivalence.
 */
const expectedCompatibleProps = Object.freeze({
  'u-field': Object.freeze(['label', 'required']),
  'u-form-item': Object.freeze(['label', 'required']),
  'u-input': Object.freeze(['disabled', 'modelValue', 'readonly']),
  'u-textarea': Object.freeze(['readonly'])
});

// <lang><zh-CN>六组件集合是本门禁的固定迁移分母；顺序只用于稳定失败信息，不表达运行依赖。</zh-CN><en>The six-component set is this gate's fixed migration denominator; order only stabilizes failure output and expresses no runtime dependency.</en></lang>
const finalRuntimeComponentNames = Object.freeze(['u-field', 'u-form-item', 'u-form', 'u-input', 'u-search', 'u-textarea']);

// <lang><zh-CN>P0 项只来自四个公开组件 API 维度；service、类型、easycom 与平台证据由各自门禁管理。</zh-CN><en>P0 items come only from the four public component-API dimensions; services, types, easycom, and platform evidence are managed by their own gates.</en></lang>
const matrixApiDimensions = Object.freeze(['props', 'events', 'slots', 'imperativeApis']);

/**
 * @lang zh-CN 旧矩阵中九项未交付 P0 能力的最终同名迁移目标；本清单防止整体统计通过时单项回退被隐藏。
 * @lang en Final same-name migration targets for the nine P0 capabilities that were undelivered in the historical matrix; this list prevents an item-level regression from being hidden by passing aggregate totals.
 */
const finalFormerlyUnsupportedItems = Object.freeze([
  Object.freeze({ component: 'u-field', dimension: 'props', id: 'prop:disabled', target: 'disabled' }),
  Object.freeze({ component: 'u-field', dimension: 'props', id: 'prop:modelValue', target: 'modelValue' }),
  Object.freeze({ component: 'u-field', dimension: 'props', id: 'prop:readonly', target: 'readonly' }),
  Object.freeze({ component: 'u-field', dimension: 'events', id: 'event:click', target: 'click' }),
  Object.freeze({ component: 'u-field', dimension: 'events', id: 'event:confirm', target: 'confirm' }),
  Object.freeze({ component: 'u-field', dimension: 'events', id: 'event:input', target: 'input' }),
  Object.freeze({ component: 'u-field', dimension: 'events', id: 'event:update:modelValue', target: 'update:modelValue' }),
  Object.freeze({ component: 'u-form-item', dimension: 'imperativeApis', id: 'imperative:resetField', target: 'resetField' }),
  Object.freeze({ component: 'u-form', dimension: 'imperativeApis', id: 'imperative:resetFields', target: 'resetFields' })
]);

// <lang><zh-CN>并行读取固定公开输入，避免读取顺序、缓存或目录状态成为隐式契约。</zh-CN><en>Reads fixed public inputs in parallel, avoiding read order, cache, or directory state becoming an implicit contract.</en></lang>
const [inputSource, searchSource, searchStyles, textareaSource, fieldSource, formSource, formItemSource, formRuntimeSource, inputDocumentation, searchDocumentation, textareaDocumentation, fixtureSource, generatorSource, matrixSource] = await Promise.all([
  readFile('HIA-uView-UI/src/components/u-input/u-input.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-search/u-search.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-search/u-search.css', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-textarea/u-textarea.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-field/u-field.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-form/u-form.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-form-item/u-form-item.vue', 'utf8'),
  readFile('HIA-uView-UI/src/components/u-form/form-runtime.mjs', 'utf8'),
  readFile('docs/input.md', 'utf8'),
  readFile('docs/search.md', 'utf8'),
  readFile('docs/textarea.md', 'utf8'),
  readFile('HIA-uView-UI/fixtures/mp-weixin/src/pages/index/index.vue', 'utf8'),
  readFile('scripts/generate-api-compatibility-matrix.mjs', 'utf8'),
  readFile('HIA-uView-UI/hia-uview.api-compatibility.json', 'utf8')
]);

/**
 * @lang zh-CN 当前提交的只读 API compatibility matrix；本测试只解析和断言，绝不改写或重新生成它。
 * @lang en Current committed read-only API compatibility matrix; this test only parses and asserts it and never rewrites or regenerates it.
 */
const apiCompatibilityMatrix = JSON.parse(matrixSource);

/**
 * @lang zh-CN 按精确 kebab-case 名称取得 matrix component record；缺失即失败，不允许 alias 或模糊匹配。
 * @lang en Obtains a matrix component record by exact kebab-case name; absence fails immediately and allows no alias or fuzzy match.
 * @param {string} componentName <lang><zh-CN>固定组件名。</zh-CN><en>Fixed component name.</en></lang>
 * @returns {object} <lang><zh-CN>对应 matrix record。</zh-CN><en>Corresponding matrix record.</en></lang>
 */
function requireMatrixComponent(componentName) {
  // <lang><zh-CN>查找只遍历已提交 component 数组，不改变其顺序、计数或 migration disposition。</zh-CN><en>The lookup traverses only the committed component array and changes none of its order, count, or migration disposition.</en></lang>
  const component = apiCompatibilityMatrix.components.find((candidate) => candidate.name === componentName);

  assert.ok(component, `Missing API compatibility component: ${componentName}`);
  return component;
}

/**
 * @lang zh-CN 在固定组件和 API 维度中取得精确 item；该函数不跨维度猜测同名能力。
 * @lang en Obtains an exact item from a fixed component and API dimension; the function never guesses a same-named capability across dimensions.
 * @param {string} componentName <lang><zh-CN>稳定组件名。</zh-CN><en>Stable component name.</en></lang>
 * @param {string} dimension <lang><zh-CN>固定 API 维度。</zh-CN><en>Fixed API dimension.</en></lang>
 * @param {string} itemId <lang><zh-CN>带种类前缀的稳定 item ID。</zh-CN><en>Stable kind-prefixed item ID.</en></lang>
 * @returns {object} <lang><zh-CN>精确 matrix item。</zh-CN><en>Exact matrix item.</en></lang>
 */
function requireMatrixItem(componentName, dimension, itemId) {
  // <lang><zh-CN>先取得组件，再从调用方明确指定的维度数组中查找。</zh-CN><en>Obtains the component first and then searches the dimension array explicitly selected by the caller.</en></lang>
  const component = requireMatrixComponent(componentName);
  // <lang><zh-CN>维度缺失属于 schema/生成漂移，不能退回空集合掩盖。</zh-CN><en>A missing dimension is schema/generation drift and cannot fall back to an empty collection.</en></lang>
  const items = component[dimension]?.items;

  assert.ok(Array.isArray(items), `Missing matrix dimension: ${componentName}.${dimension}`);
  // <lang><zh-CN>稳定 ID 查找不依赖生成顺序。</zh-CN><en>The stable-ID lookup does not depend on generation order.</en></lang>
  const item = items.find((candidate) => candidate.id === itemId);

  assert.ok(item, `Missing matrix item: ${componentName}/${itemId}`);
  return item;
}

test('keeps the six-component runtime inside private and side-effect-free boundaries', () => {
  // <lang><zh-CN>六组件与私有 helper 一并扫描，避免把请求、全局状态或动态执行移入辅助模块来绕过门禁。</zh-CN><en>Scans the six components together with the private helper so requests, global state, or dynamic execution cannot bypass the gate by moving into a helper.</en></lang>
  const combinedRuntimeSource = [inputSource, searchSource, textareaSource, fieldSource, formSource, formItemSource, formRuntimeSource].join('\n');
  // <lang><zh-CN>模式只匹配可执行 API 表面；说明“未使用某能力”的注释不会因普通单词而误报。</zh-CN><en>Patterns match executable API surfaces only; comments explaining that a capability is unused do not fail merely because of ordinary words.</en></lang>
  const forbiddenPatterns = [
    /\bset(?:Timeout|Interval)\s*\(/u,
    /\buni\.(?:request|uploadFile|downloadFile|connectSocket)\s*\(/u,
    /\bfetch\s*\(/u,
    /\b(?:localStorage|sessionStorage)\s*\./u,
    /\bglobalThis\s*\./u,
    /\bwindow\s*\./u,
    /\bdocument\s*\./u,
    /\buni\.\$u\b/u,
    /\beval\s*\(/u,
    /\b(?:new\s+)?Function\s*\(/u,
    /\bimport\s*\(/u
  ];

  // <lang><zh-CN>逐项给出禁止能力的直接失败证据。</zh-CN><en>Produces direct failure evidence for each prohibited capability.</en></lang>
  for (const forbiddenPattern of forbiddenPatterns) {
    assert.doesNotMatch(combinedRuntimeSource, forbiddenPattern);
  }

  // <lang><zh-CN>单行输入合并最近表单项 guard，向原生控件传递有效状态，并保持精确六事件表面。</zh-CN><en>The single-line input merges nearest-form-item guards, passes effective state to the native control, and retains the exact six-event surface.</en></lang>
  assert.match(inputSource, /:readonly="effectiveReadonly"/u);
  assert.match(inputSource, /const formItemContext = inject\(U_FORM_ITEM_CONTEXT, null\);/u);
  assert.match(inputSource, /const emit = defineEmits\(\['update:modelValue', 'input', 'focus', 'blur', 'click', 'confirm'\]\);/u);
  assert.match(inputSource, /formItemContext\?\.notifyChange\(\);/u);
  assert.match(inputSource, /formItemContext\?\.notifyBlur\(\);/u);

  // <lang><zh-CN>查询与多行输入使用同一私有 form-item context，并保留各自精确事件表面和宿主字体继承；查询前置装饰必须默认关闭且只使用本地 CSS 几何。</zh-CN><en>Search and multiline input use the same private form-item context while retaining their exact event surfaces and host-font inheritance; the search leading decoration must be default-off and use only local CSS geometry.</en></lang>
  assert.match(searchSource, /const formItemContext = inject\(U_FORM_ITEM_CONTEXT, null\);/u);
  assert.match(searchSource, /const emit = defineEmits\(\['update:modelValue', 'input', 'change', 'focus', 'blur', 'confirm', 'click', 'search', 'clear'\]\);/u);
  assert.match(searchSource, /searchIcon:\s*\{\s*type:\s*String,\s*default:\s*''\s*\}/u);
  assert.match(searchSource, /v-if="searchIcon === 'search'"[^>]+aria-hidden="true"/u);
  assert.match(searchStyles, /\.u-search__input\s*\{[\s\S]*?font-family:\s*inherit;/u);
  assert.match(searchStyles, /\.u-search__clear,\s*\n\.u-search__action\s*\{[\s\S]*?font-family:\s*inherit;/u);
  assert.match(searchStyles, /\.u-search__leading-icon-ring\s*\{[\s\S]*?border:\s*2px solid currentColor;/u);
  assert.match(searchStyles, /\.u-search__leading-icon-handle\s*\{[\s\S]*?background:\s*currentColor;/u);
  assert.doesNotMatch(`${searchSource}\n${searchStyles}`, /@font-face|<svg\b|data:image\/|\.(?:svg|png|jpe?g|woff2?|ttf)\b/iu);
  // <lang><zh-CN>搜索组件完整样式文本（含已提交的 MP-WEIXIN 字面值回退）不得使用 attribute selector、关系伪类、URL 或字体/图片资产。</zh-CN><en>The complete search stylesheet, including its committed MP-WEIXIN literal fallback, must use no attribute selector, relational pseudo-class, URL, or font/image asset.</en></lang>
  assert.doesNotMatch(searchStyles, /\[|:has\s*\(|url\s*\(|@font-face|\.(?:svg|png|jpe?g|woff2?|ttf)\b/iu);
  assert.match(textareaSource, /const formItemContext = inject\(U_FORM_ITEM_CONTEXT, null\);/u);
  assert.match(textareaSource, /const emit = defineEmits\(\['update:modelValue', 'input', 'change', 'focus', 'blur', 'confirm', 'click'\]\);/u);

  // <lang><zh-CN>UField 以 slot 是否存在选择 caller-owned 或内建 UInput，且只有内建分支转发四项受控事件。</zh-CN><en>UField selects caller-owned or built-in UInput by slot presence, and only the built-in branch forwards four controlled events.</en></lang>
  assert.match(fieldSource, /<slot v-if="hasDefaultControl" \/>/u);
  assert.match(fieldSource, /<UInput\s+v-else/su);
  assert.match(fieldSource, /const emit = defineEmits\(\['update:modelValue', 'input', 'confirm', 'click'\]\);/u);
  assert.match(fieldSource, /const formItemContext = inject\(U_FORM_ITEM_CONTEXT, null\);/u);

  // <lang><zh-CN>表单 owner 使用实例私有 Map 与私有 Symbol context，并只暴露最终七项 imperative API。</zh-CN><en>The form owner uses an instance-private Map and private Symbol context and exposes only the final seven imperative APIs.</en></lang>
  assert.match(formRuntimeSource, /export const U_FORM_CONTEXT = Symbol\('hia-uview-form-context'\);/u);
  assert.match(formRuntimeSource, /export const U_FORM_ITEM_CONTEXT = Symbol\('hia-uview-form-item-context'\);/u);
  assert.match(formSource, /const fields = new Map\(\);/u);
  assert.match(formSource, /provide\(U_FORM_CONTEXT, Object\.freeze\(/u);
  assert.match(formSource, /defineExpose\(\{ setRules, validate, validateField, clearValidate, resetFields, requestSubmit, requestReset \}\);/u);
  assert.doesNotMatch(formSource, /defineExpose\(\{[^}]*\bfields\b/su);

  // <lang><zh-CN>表单项以每实例 Symbol 注册，只向输入后代提供 guard/通知，并只向 ref 暴露三项字段 API。</zh-CN><en>The form item registers with a per-instance Symbol, provides only guards/notifications to input descendants, and exposes only three field APIs through its ref.</en></lang>
  assert.match(formItemSource, /const fieldToken = Symbol\('hia-uview-form-field'\);/u);
  assert.match(formItemSource, /provide\(U_FORM_ITEM_CONTEXT, Object\.freeze\(\{ disabled, readonly, notifyChange, notifyBlur \}\)\);/u);
  assert.match(formItemSource, /defineExpose\(\{ validate, clearValidate, resetField \}\);/u);
});

test('keeps public input explanations and the six-component compile fixture aligned', () => {
  // <lang><zh-CN>三项输入文档保留值域、观察事件与 guard 的公开边界；表单引擎细节由独立 form 契约门禁维护。</zh-CN><en>The three input documents retain public value-domain, observation-event, and guard boundaries; form-engine detail is maintained by the separate form-contract gate.</en></lang>
  assert.match(inputDocumentation, /`string \\| number`/u);
  assert.match(inputDocumentation, /`readonly`/u);
  assert.match(inputDocumentation, /`click`/u);
  assert.match(inputDocumentation, /`confirm`/u);
  assert.match(searchDocumentation, /`change`/u);
  assert.match(searchDocumentation, /`click`/u);
  assert.match(searchDocumentation, /`searchIcon`/u);
  assert.match(searchDocumentation, /`searchIconColor` remains unsupported/u);
  assert.match(textareaDocumentation, /`change`/u);
  assert.match(textareaDocumentation, /`click`/u);

  // <lang><zh-CN>编译 fixture 必须以独立中性 model/rules 真实嵌套六组件，而不是只把标签放在同一页面。</zh-CN><en>The compile fixture must genuinely nest all six components with an independent neutral model/rules pair rather than merely placing their tags on one page.</en></lang>
  assert.match(fixtureSource, /data-smoke="p66-form-composition"/u);
  assert.match(fixtureSource, /<u-form ref="fixtureP66FormReference" :model="fixtureP66FormModel" :rules="fixtureP66FormRules" label-position="top">/u);
  assert.match(fixtureSource, /<u-form-item prop="fieldText"[\s\S]*?<u-field[\s\S]*?@update:model-value="updateFixtureP66FieldText"\s*\/>/u);
  assert.match(fixtureSource, /<u-form-item prop="inputText"[\s\S]*?<u-input[\s\S]*?@update:model-value="updateFixtureP66InputText"\s*\/>/u);
  assert.match(fixtureSource, /<u-form-item prop="longText"[\s\S]*?<u-textarea[\s\S]*?@update:model-value="updateFixtureP66LongText"\s*\/>/u);
  assert.match(fixtureSource, /<u-form-item prop="searchText"[\s\S]*?<u-search[\s\S]*?@search="recordFixtureP66SearchIntent"\s*\/>/u);
  // <lang><zh-CN>同一 USearch fixture 必须精确选入 `search` 装饰，使公开 prop 从源码声明进入实际 mp-weixin 编译闭环。</zh-CN><en>The same USearch fixture must opt into the exact `search` decoration so the public prop enters an actual mp-weixin compiler closure from its source declaration.</en></lang>
  assert.match(fixtureSource, /<u-form-item prop="searchText"[\s\S]*?<u-search[\s\S]*?search-icon="search"[\s\S]*?@search="recordFixtureP66SearchIntent"\s*\/>/u);

  // <lang><zh-CN>fixture 的三个操作只通过组件 ref 调用 validate/clear/reset，并把有限结果写入本地 smoke marker。</zh-CN><en>The fixture's three actions call validate/clear/reset only through the component ref and write finite results into a local smoke marker.</en></lang>
  assert.match(fixtureSource, /const valid = await form\.validate\(\);/u);
  assert.match(fixtureSource, /fixtureP66FormReference\.value\?\.clearValidate\(\);/u);
  assert.match(fixtureSource, /fixtureP66FormReference\.value\?\.resetFields\(\);/u);
  assert.match(fixtureSource, /data-smoke="p66-form-result"/u);
});

test('locks final runtime evidence for all six components in the migration matrix', () => {
  // <lang><zh-CN>上游熟悉的 P1 searchIcon 必须映射到同名 HIA 受限装饰，并如实保留上游 `search` 与 HIA 空串默认值差异。</zh-CN><en>The upstream-familiar P1 searchIcon must map to the same-named bounded HIA decoration while faithfully retaining the upstream `search` versus HIA empty-string default difference.</en></lang>
  const searchIconItem = requireMatrixItem('u-search', 'props', 'prop:searchIcon');
  assert.equal(searchIconItem.priority, 'P1');
  assert.equal(searchIconItem.migration.disposition, 'mapped');
  assert.equal(searchIconItem.migration.reasonCode, 'SAME_NAME_DIFFERENT_SHAPE');
  assert.equal(searchIconItem.migration.target, 'searchIcon');
  assert.equal(searchIconItem.upstream.default.value, 'search');
  assert.equal(searchIconItem.hia.targets[0].default.value, '');

  // <lang><zh-CN>逐项读取精确 compatible 白名单，确保每个结论都有同名 target 与生成器显式规则。</zh-CN><en>Reads the exact compatible allowlist item by item, ensuring every conclusion has a same-name target and an explicit generator rule.</en></lang>
  for (const [componentName, propNames] of Object.entries(expectedCompatibleProps)) {
    // <lang><zh-CN>组件边界独立解析，另一个组件的同名 prop 不能满足当前断言。</zh-CN><en>The component boundary is resolved independently so a same-named prop on another component cannot satisfy this assertion.</en></lang>
    for (const propName of propNames) {
      // <lang><zh-CN>稳定 ID 精确取得 audited prop。</zh-CN><en>The stable ID obtains the audited prop exactly.</en></lang>
      const item = requireMatrixItem(componentName, 'props', `prop:${propName}`);

      assert.equal(item.migration.disposition, 'compatible');
      assert.equal(item.migration.reasonCode, 'EXPLICIT_SEMANTIC_RULE');
      assert.equal(item.migration.target, propName);
      assert.match(generatorSource, new RegExp(`'${componentName}\\|props\\|${propName}'`, 'u'));
    }
  }

  // <lang><zh-CN>固定九项旧缺口都必须成为有同名目标的保守 mapped，而不是因已有 runtime 证据被夸大为 compatible。</zh-CN><en>All nine historical gaps must become conservative mapped items with same-name targets rather than being overstated as compatible merely because runtime evidence exists.</en></lang>
  for (const expectedItem of finalFormerlyUnsupportedItems) {
    // <lang><zh-CN>逐项取得最终记录，防止 aggregate 统计掩盖某一能力回退。</zh-CN><en>Obtains each final record individually so aggregate totals cannot hide a capability regression.</en></lang>
    const item = requireMatrixItem(expectedItem.component, expectedItem.dimension, expectedItem.id);

    assert.equal(item.migration.disposition, 'mapped', `${expectedItem.component}/${expectedItem.id} must remain a reviewed mapping.`);
    assert.equal(item.migration.target, expectedItem.target);
  }

  // <lang><zh-CN>现场累计 P0 分母；36 是冻结上游清单在这六组件四个维度中的总数，防止通过删项获得零缺口。</zh-CN><en>Accumulates the live P0 denominator; 36 is the frozen upstream inventory total across the four dimensions for these six components and prevents reaching zero gaps by deleting items.</en></lang>
  let p0ItemCount = 0;

  // <lang><zh-CN>六组件中的每个 P0 都必须已交付、完成 runtime 验证且没有剩余 parity 待办。</zh-CN><en>Every P0 item in the six components must be delivered, runtime tested, and carry no remaining parity task.</en></lang>
  for (const componentName of finalRuntimeComponentNames) {
    // <lang><zh-CN>组件按精确名称取得，不允许 alias 代偿。</zh-CN><en>The component is obtained by exact name and permits no alias substitution.</en></lang>
    const component = requireMatrixComponent(componentName);

    for (const dimension of matrixApiDimensions) {
      // <lang><zh-CN>只筛选该维度真实 P0 items；非 P0 缺口继续由完整 matrix 报告。</zh-CN><en>Filters only real P0 items in this dimension; non-P0 gaps remain reported by the complete matrix.</en></lang>
      const p0Items = component[dimension].items.filter((item) => item.priority === 'P0');

      for (const item of p0Items) {
        // <lang><zh-CN>先推进分母，再核对交付、review 和三类证据引用。</zh-CN><en>Advances the denominator before checking delivery, review, and the three evidence-reference classes.</en></lang>
        p0ItemCount += 1;
        assert.ok(['compatible', 'mapped'].includes(item.migration.disposition), `${componentName}/${item.id} must be delivered.`);
        assert.equal(item.semantics.reviewState, 'complete');
        assert.equal(item.semantics.evidenceLevel, 'runtime-tested');
        assert.deepEqual(item.semantics.remainingEvidence, []);
        assert.equal(item.semantics.hia.status, 'delivered');
        assert.ok(item.semantics.evidenceRefs.some((reference) => reference.startsWith('comparison:')));
        assert.ok(item.semantics.evidenceRefs.some((reference) => reference.startsWith('local:')));
        assert.ok(item.semantics.evidenceRefs.some((reference) => reference.startsWith('test:')));
      }
    }
  }

  assert.equal(p0ItemCount, 36);
  // <lang><zh-CN>生成器必须显式接受“mapped + runtime-tested + 无剩余证据”组合，避免下次生成把最终证据降回源码待办。</zh-CN><en>The generator must explicitly accept the mapped + runtime-tested + no-remaining-evidence combination so a later generation cannot demote final evidence to a source-only task.</en></lang>
  assert.match(generatorSource, /expected\.disposition === 'mapped'[\s\S]*semantics\.evidenceLevel === 'runtime-tested' && remainingEvidence\.length === 0/u);
});
