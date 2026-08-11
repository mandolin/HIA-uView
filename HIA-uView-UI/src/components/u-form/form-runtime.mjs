/**
 * @module u-form-runtime
 * @lang zh-CN 为 UForm 与 UFormItem 提供无框架副作用的安全字段路径、初值快照和规则执行原语。模块不读取网络、存储、locale 或业务配置，也不执行来自 JSON/manifest 的代码。
 * @lang en Provides side-effect-free safe field-path, initial-snapshot, and rule-execution primitives for UForm and UFormItem. The module reads no network, storage, locale, or business configuration and executes no code from JSON or manifests.
 */

/**
 * @lang zh-CN 列出永不允许出现在表单字段路径中的原型链键，阻止 reset 写入改变对象原型。
 * @lang en Lists prototype-chain keys that are never allowed in form field paths, preventing reset writes from changing object prototypes.
 */
const UNSAFE_FIELD_SEGMENTS = new Set(['__proto__', 'prototype', 'constructor']);

/**
 * @lang zh-CN 将数字 bracket 记法转换为点分段；其他 bracket 内容保持原状并由后续校验拒绝。
 * @lang en Converts numeric bracket notation into dot segments; other bracket contents remain and are rejected by later validation.
 */
const NUMERIC_BRACKET_PATTERN = /\[(\d+)\]/gu;

/**
 * @lang zh-CN 判断值是否可被安全地作为路径容器读取或写入。
 * @lang en Determines whether a value can be safely read or written as a path container.
 * @param {unknown} value <lang><zh-CN>候选路径容器。</zh-CN><en>Candidate path container.</en></lang>
 * @returns {value is Record<string, unknown> | unknown[]} <lang><zh-CN>对象或数组时为 true。</zh-CN><en>True for an object or array.</en></lang>
 */
function isPathContainer(value) {
  // <lang><zh-CN>null 不能承载字段；其余对象（含 Vue reactive proxy 与数组）可继续做 own-property 检查。</zh-CN><en>Null cannot carry a field; other objects, including Vue reactive proxies and arrays, may continue to own-property checks.</en></lang>
  return value !== null && typeof value === 'object';
}

/**
 * @lang zh-CN 把 dotted/index 字段路径规范为安全字符串分段；空段、非数字 bracket 和原型链键均返回空数组。
 * @lang en Normalizes a dotted/index field path into safe string segments; empty segments, nonnumeric brackets, and prototype-chain keys all return an empty array.
 * @param {unknown} path <lang><zh-CN>调用方声明的字段路径。</zh-CN><en>Caller-declared field path.</en></lang>
 * @returns {string[]} <lang><zh-CN>安全分段；空数组表示路径无效。</zh-CN><en>Safe segments; an empty array means the path is invalid.</en></lang>
 */
export function normalizeFieldPath(path) {
  // <lang><zh-CN>P66 只公开字符串路径，避免数组同时表示“路径分段”和“多字段选择”的二义性。</zh-CN><en>P66 exposes string paths only, avoiding ambiguity between path segments and multi-field selection arrays.</en></lang>
  if (typeof path !== 'string') {
    return [];
  }

  // <lang><zh-CN>先去除路径两端空白并转换数字索引；字段名内部不做 trim，防止静默改写调用方 key。</zh-CN><en>Trims path boundaries and converts numeric indexes first; field names are not internally trimmed so caller keys are never silently rewritten.</en></lang>
  const normalizedPath = path.trim().replace(NUMERIC_BRACKET_PATTERN, '.$1');

  // <lang><zh-CN>残留 bracket 代表未支持或不安全语法，必须整体拒绝而不是部分解析。</zh-CN><en>Remaining brackets represent unsupported or unsafe syntax and must reject the whole path rather than parse it partially.</en></lang>
  if (normalizedPath.length === 0 || normalizedPath.includes('[') || normalizedPath.includes(']')) {
    return [];
  }

  // <lang><zh-CN>点号定义稳定层级；保留原始段文字供严格空段与危险键检查。</zh-CN><en>Dots define stable hierarchy; original segment text is retained for strict empty-segment and dangerous-key checks.</en></lang>
  const segments = normalizedPath.split('.');

  // <lang><zh-CN>任何空段或原型链键都会使整条路径失效，避免读取与写入采用不同解释。</zh-CN><en>Any empty segment or prototype-chain key invalidates the entire path so reads and writes never use different interpretations.</en></lang>
  if (segments.some((segment) => segment.length === 0 || UNSAFE_FIELD_SEGMENTS.has(segment))) {
    return [];
  }

  // <lang><zh-CN>返回新数组，调用方无法修改模块内部安全集合或共享缓存。</zh-CN><en>Returns a new array so callers cannot mutate the module's safety set or a shared cache.</en></lang>
  return segments;
}

/**
 * @lang zh-CN 将有效字段路径转换为唯一点分 key，供 registry、rules 与字段选择比较；无效路径返回空字符串。
 * @lang en Converts a valid field path into a unique dotted key for registry, rules, and field-selection comparison; invalid paths return an empty string.
 * @param {unknown} path <lang><zh-CN>候选字段路径。</zh-CN><en>Candidate field path.</en></lang>
 * @returns {string} <lang><zh-CN>规范 key 或空字符串。</zh-CN><en>Canonical key or an empty string.</en></lang>
 */
export function canonicalFieldPath(path) {
  // <lang><zh-CN>复用唯一规范器，避免读取、写入和 registry 各自实现不同的安全规则。</zh-CN><en>Reuses the single normalizer so reading, writing, and registry never implement different safety rules.</en></lang>
  const segments = normalizeFieldPath(path);
  return segments.length > 0 ? segments.join('.') : '';
}

/**
 * @lang zh-CN 按安全路径读取 own property，并显式区分“不存在”和“存在但值为 undefined”。
 * @lang en Reads an own property through a safe path and explicitly distinguishes absence from an existing undefined value.
 * @param {unknown} root <lang><zh-CN>调用方拥有的模型或规则根对象。</zh-CN><en>Caller-owned model or rules root object.</en></lang>
 * @param {unknown} path <lang><zh-CN>字段路径。</zh-CN><en>Field path.</en></lang>
 * @returns {{ found: boolean, value: unknown }} <lang><zh-CN>存在标记与读取值。</zh-CN><en>Presence flag and read value.</en></lang>
 */
export function readFieldValue(root, path) {
  // <lang><zh-CN>先规范路径；无效路径不尝试任何属性访问。</zh-CN><en>Normalizes the path first; an invalid path attempts no property access.</en></lang>
  const segments = normalizeFieldPath(path);

  // <lang><zh-CN>根对象或路径无效时返回稳定缺失结果。</zh-CN><en>Returns a stable missing result when the root or path is invalid.</en></lang>
  if (!isPathContainer(root) || segments.length === 0) {
    return { found: false, value: undefined };
  }

  // <lang><zh-CN>游标仅在 own-property 成功后前进，避免从 Object.prototype 或应用原型读取字段。</zh-CN><en>The cursor advances only after an own-property match, avoiding fields read from Object.prototype or application prototypes.</en></lang>
  let cursor = root;

  // <lang><zh-CN>逐段读取可支持对象与数组的数字字符串索引。</zh-CN><en>Reads segment by segment, supporting numeric string indexes on arrays.</en></lang>
  for (const segment of segments) {
    // <lang><zh-CN>中间值必须仍可遍历且直接拥有目标键。</zh-CN><en>Each intermediate value must remain traversable and directly own the target key.</en></lang>
    if (!isPathContainer(cursor) || !Object.prototype.hasOwnProperty.call(cursor, segment)) {
      return { found: false, value: undefined };
    }

    // <lang><zh-CN>仅在安全检查后读取该段；Vue reactive proxy 仍可在此正常追踪。</zh-CN><en>Reads the segment only after safety checks; Vue reactive proxies can still track this access normally.</en></lang>
    cursor = cursor[segment];
  }

  // <lang><zh-CN>即使最终值为 undefined，own-property 已证明该字段存在。</zh-CN><en>Even when the final value is undefined, the own-property checks prove that the field exists.</en></lang>
  return { found: true, value: cursor };
}

/**
 * @lang zh-CN 只向已存在的安全字段路径写值；函数不创建容器、不扩展数组、不写原型链。
 * @lang en Writes only to an existing safe field path; the function creates no containers, extends no arrays, and writes no prototype chain.
 * @param {unknown} root <lang><zh-CN>调用方拥有的模型根对象。</zh-CN><en>Caller-owned model root object.</en></lang>
 * @param {unknown} path <lang><zh-CN>字段路径。</zh-CN><en>Field path.</en></lang>
 * @param {unknown} value <lang><zh-CN>显式 reset 要恢复的快照值。</zh-CN><en>Snapshot value restored by explicit reset.</en></lang>
 * @returns {boolean} <lang><zh-CN>成功写入既有字段时为 true。</zh-CN><en>True when an existing field was written.</en></lang>
 */
export function writeFieldValue(root, path, value) {
  // <lang><zh-CN>路径与根对象必须先通过同一套读取安全规则。</zh-CN><en>The path and root must first pass the same safety rules used by reads.</en></lang>
  const segments = normalizeFieldPath(path);

  // <lang><zh-CN>无效输入绝不产生部分写入。</zh-CN><en>Invalid input never produces a partial write.</en></lang>
  if (!isPathContainer(root) || segments.length === 0) {
    return false;
  }

  // <lang><zh-CN>父游标在最后一段之前移动；任何缺失容器都会中止。</zh-CN><en>The parent cursor advances until the last segment; any missing container aborts the write.</en></lang>
  let parent = root;

  // <lang><zh-CN>只遍历父路径，最终 own-property 在循环后单独验证。</zh-CN><en>Traverses only the parent path; the final own property is validated separately afterward.</en></lang>
  for (const segment of segments.slice(0, -1)) {
    // <lang><zh-CN>不允许 reset 创建新的嵌套对象或穿过继承属性。</zh-CN><en>Reset cannot create new nested objects or traverse inherited properties.</en></lang>
    if (!isPathContainer(parent) || !Object.prototype.hasOwnProperty.call(parent, segment)) {
      return false;
    }

    // <lang><zh-CN>取得下一级既有容器；非对象会在下一轮或最终检查中被拒绝。</zh-CN><en>Gets the next existing container; a nonobject is rejected in the next iteration or final check.</en></lang>
    parent = parent[segment];
  }

  // <lang><zh-CN>最终父级必须可写且直接拥有最终 key，确保 reset 只恢复注册时存在的字段。</zh-CN><en>The final parent must be writable and directly own the final key so reset restores only a field that existed at registration.</en></lang>
  const finalSegment = segments.at(-1);
  if (!isPathContainer(parent) || !Object.prototype.hasOwnProperty.call(parent, finalSegment)) {
    return false;
  }

  // <lang><zh-CN>唯一副作用发生在全部检查通过之后。</zh-CN><en>The only side effect occurs after every check has passed.</en></lang>
  parent[finalSegment] = value;
  return true;
}

/**
 * @lang zh-CN 为显式 reset 复制 JSON-like 字段值；数组与普通对象深拷贝，其他对象保持引用并在公开文档中披露。
 * @lang en Copies JSON-like field values for explicit reset; arrays and plain objects are deep-cloned, while other objects retain identity as disclosed publicly.
 * @param {unknown} value <lang><zh-CN>注册时字段值。</zh-CN><en>Field value at registration.</en></lang>
 * @param {WeakMap<object, unknown>} [seen] <lang><zh-CN>内部循环引用缓存。</zh-CN><en>Internal circular-reference cache.</en></lang>
 * @returns {unknown} <lang><zh-CN>可用于恢复的快照。</zh-CN><en>Snapshot suitable for restoration.</en></lang>
 */
export function cloneFieldValue(value, seen = new WeakMap()) {
  // <lang><zh-CN>原始值不可被内部修改，直接返回最精确。</zh-CN><en>Primitive values cannot be internally mutated and return most precisely as-is.</en></lang>
  if (!isPathContainer(value)) {
    return value;
  }

  // <lang><zh-CN>已访问对象复用缓存快照，避免循环结构导致递归溢出。</zh-CN><en>A previously visited object reuses its cached snapshot, preventing recursion overflow on cycles.</en></lang>
  if (seen.has(value)) {
    return seen.get(value);
  }

  // <lang><zh-CN>数组保持索引与长度，逐项复制 JSON-like 子值。</zh-CN><en>Arrays preserve indexes and length while cloning each JSON-like child value.</en></lang>
  if (Array.isArray(value)) {
    // <lang><zh-CN>先缓存空数组，循环引用才能指向同一个快照容器。</zh-CN><en>Caches the empty array first so circular references can point to the same snapshot container.</en></lang>
    const snapshot = [];
    seen.set(value, snapshot);

    // <lang><zh-CN>map 顺序与源数组稳定一致。</zh-CN><en>Map order remains stable with the source array.</en></lang>
    for (const item of value) {
      snapshot.push(cloneFieldValue(item, seen));
    }
    return snapshot;
  }

  // <lang><zh-CN>只有普通对象进入深拷贝；Date、Map、File 等平台对象保持调用方身份。</zh-CN><en>Only plain objects are deep-cloned; platform objects such as Date, Map, and File retain caller identity.</en></lang>
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    return value;
  }

  // <lang><zh-CN>新普通对象不继承业务对象的自定义 prototype。</zh-CN><en>The new plain object inherits no custom prototype from a business object.</en></lang>
  const snapshot = {};
  seen.set(value, snapshot);

  // <lang><zh-CN>只复制 own enumerable entries，并再次排除危险键。</zh-CN><en>Copies own enumerable entries only and excludes dangerous keys again.</en></lang>
  for (const [key, childValue] of Object.entries(value)) {
    if (!UNSAFE_FIELD_SEGMENTS.has(key)) {
      snapshot[key] = cloneFieldValue(childValue, seen);
    }
  }
  return snapshot;
}

/**
 * @lang zh-CN 把单条或数组规则规范为新数组，并忽略 null 与非对象输入。
 * @lang en Normalizes one rule or a rule array into a new array and ignores null or nonobject input.
 * @param {unknown} rules <lang><zh-CN>form 或 form-item 声明的规则输入。</zh-CN><en>Rule input declared by a form or form item.</en></lang>
 * @returns {Record<string, unknown>[]} <lang><zh-CN>稳定顺序的规则对象。</zh-CN><en>Rule objects in stable order.</en></lang>
 */
export function normalizeFormRules(rules) {
  // <lang><zh-CN>统一为候选数组，使单规则与多规则采用同一过滤路径。</zh-CN><en>Converts to a candidate array so one and many rules share the same filtering path.</en></lang>
  const candidates = Array.isArray(rules) ? rules : [rules];

  // <lang><zh-CN>只接受直接对象；函数、字符串和 null 不能成为可执行规则。</zh-CN><en>Accepts direct objects only; functions, strings, and null cannot become executable rules.</en></lang>
  return candidates.filter((rule) => rule !== null && typeof rule === 'object' && !Array.isArray(rule));
}

/**
 * @lang zh-CN 判断规则是否应在当前 trigger 运行；无 trigger 的规则只参与显式整体验证。
 * @lang en Determines whether a rule should run for the current trigger; rules without a trigger participate only in explicit whole-form validation.
 * @param {Record<string, unknown>} rule <lang><zh-CN>候选规则。</zh-CN><en>Candidate rule.</en></lang>
 * @param {string} trigger <lang><zh-CN>空字符串表示显式整体验证，其他值为局部交互触发。</zh-CN><en>An empty string means explicit whole-form validation; other values are local interaction triggers.</en></lang>
 * @returns {boolean} <lang><zh-CN>当前应执行时为 true。</zh-CN><en>True when the rule should run now.</en></lang>
 */
export function ruleMatchesTrigger(rule, trigger) {
  // <lang><zh-CN>显式 validate 不过滤规则，保持确定的完整检查。</zh-CN><en>Explicit validate does not filter rules, retaining a deterministic complete check.</en></lang>
  if (trigger === '') {
    return true;
  }

  // <lang><zh-CN>交互触发只运行明确声明该 trigger 的规则，避免每次输入意外执行昂贵异步规则。</zh-CN><en>Interaction triggers run only rules that explicitly declare that trigger, avoiding accidental expensive async validation on each input.</en></lang>
  const declaredTrigger = rule.trigger;
  if (Array.isArray(declaredTrigger)) {
    return declaredTrigger.includes(trigger);
  }
  return declaredTrigger === trigger;
}

/**
 * @lang zh-CN 判断 required 规则使用的空值语义；零、false 与非空对象不是空值。
 * @lang en Determines empty-value semantics for required rules; zero, false, and nonempty objects are not empty.
 * @param {unknown} value <lang><zh-CN>字段候选值。</zh-CN><en>Candidate field value.</en></lang>
 * @returns {boolean} <lang><zh-CN>值为空时为 true。</zh-CN><en>True when the value is empty.</en></lang>
 */
function isEmptyRuleValue(value) {
  // <lang><zh-CN>undefined、null、空字符串和空数组构成首轮稳定空值集合。</zh-CN><en>Undefined, null, empty strings, and empty arrays form the initial stable empty-value set.</en></lang>
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
}

/**
 * @lang zh-CN 返回 string/array 的长度或 number 本身，供 len/min/max 使用；其他值没有可比较度量。
 * @lang en Returns string/array length or a number itself for len/min/max; other values have no comparable measure.
 * @param {unknown} value <lang><zh-CN>字段值。</zh-CN><en>Field value.</en></lang>
 * @returns {number | undefined} <lang><zh-CN>度量值或 undefined。</zh-CN><en>Measure or undefined.</en></lang>
 */
function measureRuleValue(value) {
  // <lang><zh-CN>数字直接参与边界比较；NaN 不构成有效度量。</zh-CN><en>Numbers participate directly in boundary comparison; NaN is not a valid measure.</en></lang>
  if (typeof value === 'number') {
    return Number.isNaN(value) ? undefined : value;
  }

  // <lang><zh-CN>字符串和数组按长度比较，与常见表单规则迁移一致。</zh-CN><en>Strings and arrays compare by length, matching common form-rule migration.</en></lang>
  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length;
  }
  return undefined;
}

/**
 * @lang zh-CN 检查有限内置 type；未知 type 明确失败，避免拼写错误被静默忽略。
 * @lang en Checks finite built-in types; an unknown type explicitly fails so a typo is never silently ignored.
 * @param {unknown} value <lang><zh-CN>非空字段值。</zh-CN><en>Nonempty field value.</en></lang>
 * @param {unknown} expectedType <lang><zh-CN>规则声明的 type。</zh-CN><en>Type declared by the rule.</en></lang>
 * @returns {boolean} <lang><zh-CN>匹配或未声明 type 时为 true。</zh-CN><en>True on a match or when no type is declared.</en></lang>
 */
function matchesRuleType(value, expectedType) {
  // <lang><zh-CN>未声明 type 不增加限制。</zh-CN><en>An undeclared type adds no restriction.</en></lang>
  if (expectedType === undefined || expectedType === '') {
    return true;
  }

  // <lang><zh-CN>switch 限定公开文档承诺的稳定集合。</zh-CN><en>The switch limits behavior to the stable set promised by public documentation.</en></lang>
  switch (expectedType) {
    case 'string': return typeof value === 'string';
    case 'number': return typeof value === 'number' && !Number.isNaN(value);
    case 'integer': return Number.isInteger(value);
    case 'boolean': return typeof value === 'boolean';
    case 'array': return Array.isArray(value);
    case 'object': return isPathContainer(value) && !Array.isArray(value);
    default: return false;
  }
}

/**
 * @lang zh-CN 构造不含业务默认文案的稳定校验错误；message 始终来自调用方规则或 validator。
 * @lang en Builds a stable validation error with no business default copy; message always comes from the caller rule or validator.
 * @param {Record<string, unknown>} rule <lang><zh-CN>失败规则。</zh-CN><en>Failed rule.</en></lang>
 * @param {{ field: string, trigger: string }} context <lang><zh-CN>字段和触发上下文。</zh-CN><en>Field and trigger context.</en></lang>
 * @param {number} ruleIndex <lang><zh-CN>稳定规则索引。</zh-CN><en>Stable rule index.</en></lang>
 * @param {string} code <lang><zh-CN>非本地化失败代码。</zh-CN><en>Nonlocalized failure code.</en></lang>
 * @param {string} [validatorMessage] <lang><zh-CN>validator 明确返回或抛出的文字。</zh-CN><en>Copy explicitly returned or thrown by the validator.</en></lang>
 * @returns {{ prop: string, message: string, ruleIndex: number, trigger: string, code: string }} <lang><zh-CN>公开可序列化错误。</zh-CN><en>Public serializable error.</en></lang>
 */
function createValidationError(rule, context, ruleIndex, code, validatorMessage = '') {
  // <lang><zh-CN>规则 message 优先，validator 文字作为次级明确输入；库不生成默认语言。</zh-CN><en>Rule message takes precedence and validator copy is the secondary explicit input; the library generates no default language.</en></lang>
  const message = typeof rule.message === 'string' ? rule.message : validatorMessage;
  return { prop: context.field, message, ruleIndex, trigger: context.trigger, code };
}

/**
 * @lang zh-CN 按声明顺序验证一个字段并在首个失败处停止；自定义 validator 只接受应用源码直接传入的函数返回值或 Promise。
 * @lang en Validates one field in declaration order and stops at the first failure; a custom validator accepts only a function return value or Promise supplied directly by application source.
 * @param {unknown} value <lang><zh-CN>验证开始时读取的字段快照值。</zh-CN><en>Field snapshot read when validation starts.</en></lang>
 * @param {unknown} rules <lang><zh-CN>单条或数组规则。</zh-CN><en>One rule or a rule array.</en></lang>
 * @param {{ field: string, model: Record<string, unknown>, trigger: string }} context <lang><zh-CN>调用方模型与字段上下文。</zh-CN><en>Caller model and field context.</en></lang>
 * @returns {Promise<null | { prop: string, message: string, ruleIndex: number, trigger: string, code: string }>} <lang><zh-CN>通过时 null，失败时首个错误。</zh-CN><en>Null on success, otherwise the first error.</en></lang>
 */
export async function validateFormValue(value, rules, context) {
  // <lang><zh-CN>先过滤非法规则与不匹配 trigger，稳定保留原声明顺序。</zh-CN><en>Filters invalid rules and nonmatching triggers first while retaining declaration order.</en></lang>
  const runnableRules = normalizeFormRules(rules).filter((rule) => ruleMatchesTrigger(rule, context.trigger));

  // <lang><zh-CN>顺序循环保证多个异步 validator 也不会乱序竞争首个错误。</zh-CN><en>Sequential iteration ensures multiple async validators cannot race for the first error.</en></lang>
  for (const [ruleIndex, rule] of runnableRules.entries()) {
    // <lang><zh-CN>每条规则独立计算空值，required 失败后立即停止。</zh-CN><en>Each rule computes emptiness independently and stops immediately on required failure.</en></lang>
    const empty = isEmptyRuleValue(value);
    if (rule.required === true && empty) {
      return createValidationError(rule, context, ruleIndex, 'required');
    }

    // <lang><zh-CN>非必填空值跳过 type/长度/pattern/validator，与 optional 字段预期一致。</zh-CN><en>An optional empty value skips type, size, pattern, and validator checks, matching optional-field expectations.</en></lang>
    if (empty) {
      continue;
    }

    // <lang><zh-CN>有限 type 不匹配时返回稳定代码。</zh-CN><en>A finite type mismatch returns a stable code.</en></lang>
    if (!matchesRuleType(value, rule.type)) {
      return createValidationError(rule, context, ruleIndex, 'type');
    }

    // <lang><zh-CN>取得可比较度量；只在规则实际声明对应边界时使用。</zh-CN><en>Gets a comparable measure and uses it only when the rule declares a corresponding boundary.</en></lang>
    const measure = measureRuleValue(value);
    if (typeof rule.len === 'number' && measure !== rule.len) {
      return createValidationError(rule, context, ruleIndex, 'len');
    }
    if (typeof rule.min === 'number' && (measure === undefined || measure < rule.min)) {
      return createValidationError(rule, context, ruleIndex, 'min');
    }
    if (typeof rule.max === 'number' && (measure === undefined || measure > rule.max)) {
      return createValidationError(rule, context, ruleIndex, 'max');
    }

    // <lang><zh-CN>pattern 只接受 RegExp；每次重置 lastIndex，避免 global/sticky 正则跨验证泄漏状态。</zh-CN><en>Pattern accepts RegExp only; lastIndex resets each time so global or sticky regex state cannot leak across validations.</en></lang>
    if (rule.pattern instanceof RegExp) {
      rule.pattern.lastIndex = 0;
      if (!rule.pattern.test(String(value))) {
        return createValidationError(rule, context, ruleIndex, 'pattern');
      }
    }

    // <lang><zh-CN>asyncValidator 优先于 validator，使一条规则只有一个完成通道。</zh-CN><en>AsyncValidator takes precedence over validator so one rule has only one completion channel.</en></lang>
    const validator = typeof rule.asyncValidator === 'function'
      ? rule.asyncValidator
      : (typeof rule.validator === 'function' ? rule.validator : null);

    // <lang><zh-CN>没有自定义函数时本条规则已经通过。</zh-CN><en>Without a custom function, this rule has already passed.</en></lang>
    if (validator === null) {
      continue;
    }

    try {
      // <lang><zh-CN>validator 接收值与只读约定上下文；是否返回 Promise 由 await 统一处理。</zh-CN><en>The validator receives the value and conventionally readonly context; await handles both direct and Promise results.</en></lang>
      const outcome = await validator(value, Object.freeze({ ...context, rule }));

      // <lang><zh-CN>false 表示无额外文案的失败，非空字符串表示 validator 明确提供的失败文字。</zh-CN><en>False means failure without extra copy; a nonempty string is explicit failure copy from the validator.</en></lang>
      if (outcome === false) {
        return createValidationError(rule, context, ruleIndex, 'validator');
      }
      if (typeof outcome === 'string' && outcome.length > 0) {
        return createValidationError(rule, context, ruleIndex, 'validator', outcome);
      }
      if (outcome instanceof Error) {
        return createValidationError(rule, context, ruleIndex, 'validator', outcome.message);
      }
    } catch (error) {
      // <lang><zh-CN>异常转换为验证失败而非未处理 rejection；只有 Error.message 可作为调用方函数的明确文字。</zh-CN><en>An exception becomes validation failure rather than an unhandled rejection; only Error.message is explicit copy from caller code.</en></lang>
      const validatorMessage = error instanceof Error ? error.message : '';
      return createValidationError(rule, context, ruleIndex, 'validator-exception', validatorMessage);
    }
  }

  // <lang><zh-CN>所有适用规则通过时返回 null，不生成 success 文案。</zh-CN><en>Returns null when all applicable rules pass and generates no success copy.</en></lang>
  return null;
}
