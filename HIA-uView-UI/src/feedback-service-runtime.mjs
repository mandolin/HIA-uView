/**
 * @module hia-uview-feedback-service-runtime
 * @lang zh-CN 提供显式调用方作用域内的 toast/modal 服务状态机与组件宿主桥接。模块不创建全局单例，不读取页面、DOM、UniApp、路由、网络、身份或持久化状态，也不接受调用方回调。
 * @lang en Provides caller-explicit scoped toast/modal service state machines and component-host bridging. The module creates no global singleton, reads no page, DOM, UniApp, router, network, identity, or persistence state, and accepts no caller callback.
 */

/**
 * @lang zh-CN 将调用方创建的不可变 scope 对象映射到模块私有状态；WeakMap 不赋予模块任何默认 scope 或进程级服务实例。
 * @lang en Maps immutable caller-created scope objects to module-private state; the WeakMap grants the module no default scope or process-level service instance.
 */
const SCOPE_STATES = new WeakMap();

/**
 * @lang zh-CN 仅模块闭包可持有的 scope 构造令牌；即使调用方通过实例取得 constructor，也不能创建可注册的 scope。
 * @lang en Scope-construction token held only by the module closure; even a caller that obtains the constructor through an instance cannot create a registerable scope.
 */
const FEEDBACK_SCOPE_CONSTRUCTION_TOKEN = Object.freeze({});

/**
 * @lang zh-CN 服务仅允许两个有限宿主种类，阻止任意字符串扩展为隐式命令通道。
 * @lang en Services allow only two finite host kinds, preventing arbitrary strings from becoming implicit command channels.
 */
const FEEDBACK_KINDS = Object.freeze(['toast', 'modal']);

/**
 * @lang zh-CN toast 输入允许的键集合；回调、URL、路由与任意扩展键均不在该白名单内。
 * @lang en Allowed toast-input keys; callbacks, URLs, routes, and arbitrary extension keys are outside this allowlist.
 */
const TOAST_OPTION_KEYS = new Set([
  'message',
  'title',
  'tone',
  'type',
  'loading',
  'position',
  'duration',
  'closeText'
]);

/**
 * @lang zh-CN toast 内部覆盖仅限有限呈现字段；该入口只供固定 typed helper 使用，不向包消费者公开。
 * @lang en Internal toast overrides are limited to finite presentation fields; this entry is used only by fixed typed helpers and is not public to package consumers.
 */
const TOAST_OVERRIDE_KEYS = new Set(['tone', 'loading', 'duration']);

/**
 * @lang zh-CN modal 输入允许的键集合；业务回调、请求、路由和任意 payload 均被排除。
 * @lang en Allowed modal-input keys; business callbacks, requests, routes, and arbitrary payloads are excluded.
 */
const MODAL_OPTION_KEYS = new Set([
  'title',
  'content',
  'confirmText',
  'cancelText',
  'showConfirmButton',
  'showCancelButton',
  'asyncClose',
  'loading'
]);

/**
 * @lang zh-CN modal normalizer 的内部模式仅允许 confirm 键，避免每次调用创建新的可变白名单。
 * @lang en The modal normalizer's internal mode allows only the confirm key, avoiding a new mutable allowlist on each call.
 */
const MODAL_MODE_KEYS = new Set(['confirm']);

/**
 * @lang zh-CN 有限 toast tone 值与组件 token 家族保持一致。
 * @lang en Finite toast tone values stay aligned with the component token family.
 */
const TOAST_TONES = new Set(['info', 'success', 'warning', 'error']);

/**
 * @lang zh-CN 有限 toast 位置值只描述宿主内呈现，不映射平台窗口或 portal。
 * @lang en Finite toast positions describe presentation inside a host only and map to no platform window or portal.
 */
const TOAST_POSITIONS = new Set(['top', 'center', 'bottom']);

/**
 * @lang zh-CN 无效注册返回的稳定幂等注销函数；它不释放调用方仍拥有的未注册对象。
 * @lang en Stable idempotent unregister function returned for invalid registrations; it does not release an unregistered object still owned by the caller.
 * @returns {void} <lang><zh-CN>无返回值且无副作用。</zh-CN><en>No return value and no side effect.</en></lang>
 */
function noopUnregister() {}

/**
 * @lang zh-CN 判断值是否为允许作为 options/host 的普通记录，排除数组、类实例和带自定义原型的对象。
 * @lang en Determines whether a value is a plain record allowed as options/host, excluding arrays, class instances, and objects with custom prototypes.
 * @param {unknown} value <lang><zh-CN>待检查值。</zh-CN><en>Value to inspect.</en></lang>
 * @returns {boolean} <lang><zh-CN>仅普通对象或 null-prototype 记录返回 true。</zh-CN><en>True only for ordinary objects or null-prototype records.</en></lang>
 */
function isPlainRecord(value) {
  // <lang><zh-CN>null、primitive 与数组不具备受限 options 记录语义。</zh-CN><en>Null, primitives, and arrays do not have constrained options-record semantics.</en></lang>
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  // <lang><zh-CN>只接受标准或 null prototype，避免 getter/class 行为借输入执行隐式逻辑。</zh-CN><en>Accepts only the standard or null prototype so getter/class behavior cannot smuggle implicit logic through input.</en></lang>
  try {
    // <lang><zh-CN>读取 prototype 置于异常边界内；恶意 Proxy trap 只会使输入无效。</zh-CN><en>Reads the prototype inside an exception boundary; a hostile Proxy trap only makes the input invalid.</en></lang>
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  } catch {
    // <lang><zh-CN>不透传 Proxy getPrototypeOf trap 的异常或细节。</zh-CN><en>Forwards neither an exception nor details from a Proxy getPrototypeOf trap.</en></lang>
    return false;
  }
}

/**
 * @lang zh-CN 把白名单普通记录复制为冻结 null-prototype 数据快照；只读取 descriptor value，后续规范化绝不再次读取调用方对象或触发其 `get` trap。
 * @lang en Copies an allowlisted plain record into a frozen null-prototype data snapshot; it reads descriptor values only, so later normalization never rereads the caller object or triggers its `get` trap.
 * @param {unknown} record <lang><zh-CN>待审计普通记录。</zh-CN><en>Plain record to audit.</en></lang>
 * @param {Set<string>} allowedKeys <lang><zh-CN>有限键白名单。</zh-CN><en>Finite key allowlist.</en></lang>
 * @returns {Readonly<Record<string, unknown>>|null} <lang><zh-CN>冻结纯数据快照或失败标记。</zh-CN><en>Frozen plain-data snapshot or a failure marker.</en></lang>
 */
function snapshotAllowedRecord(record, allowedKeys) {
  // <lang><zh-CN>先限制 prototype/数组边界；异常 Proxy prototype trap 由 isPlainRecord 收束。</zh-CN><en>First constrains prototype/array boundaries; isPlainRecord contains a throwing Proxy prototype trap.</en></lang>
  if (!isPlainRecord(record)) {
    return null;
  }

  try {
    // <lang><zh-CN>Reflect.ownKeys 让 symbol、不可枚举和未知键都进入同一拒绝路径。</zh-CN><en>Reflect.ownKeys sends symbols, non-enumerable keys, and unknown keys through one rejection path.</en></lang>
    const ownKeys = Reflect.ownKeys(record);
    // <lang><zh-CN>null-prototype 快照避免 `__proto__` 等特殊赋值语义；白名单仍决定所有合法键。</zh-CN><en>A null-prototype snapshot avoids special assignment semantics such as `__proto__`; the allowlist still determines every valid key.</en></lang>
    const snapshot = Object.create(null);

    // <lang><zh-CN>逐键只读取 descriptor，不执行 getter 或普通属性读取。</zh-CN><en>Each key is read only through its descriptor, executing neither a getter nor an ordinary property read.</en></lang>
    for (const key of ownKeys) {
      // <lang><zh-CN>symbol、未知字符串和不可枚举字段均不属于有限数据合同。</zh-CN><en>Symbols, unknown strings, and non-enumerable fields are all outside the finite-data contract.</en></lang>
      if (typeof key !== 'string' || !allowedKeys.has(key)) {
        return null;
      }

      // <lang><zh-CN>单字段 descriptor trap 在该异常边界内；accessor 因没有 data value 被拒绝。</zh-CN><en>A per-field descriptor trap stays in this exception boundary; an accessor is rejected because it has no data value.</en></lang>
      const descriptor = Object.getOwnPropertyDescriptor(record, key);
      if (descriptor === undefined || descriptor.enumerable !== true || !hasOwn(descriptor, 'value')) {
        return null;
      }

      // <lang><zh-CN>复制 descriptor 中的 data value，而不是再次执行 `record[key]`。</zh-CN><en>Copies the descriptor's data value instead of executing `record[key]` again.</en></lang>
      snapshot[key] = descriptor.value;
    }

    // <lang><zh-CN>冻结快照使后续字段验证和宿主派发共享同一不可变输入事实。</zh-CN><en>Freezing the snapshot gives subsequent field validation and host dispatch one immutable input fact.</en></lang>
    return Object.freeze(snapshot);
  } catch {
    // <lang><zh-CN>ownKeys/getOwnPropertyDescriptor Proxy trap 失败统一收束为无效输入。</zh-CN><en>An ownKeys/getOwnPropertyDescriptor Proxy-trap failure uniformly collapses to invalid input.</en></lang>
    return null;
  }
}

/**
 * @lang zh-CN 判断普通记录是否显式提供某个自有键，不把 prototype 值当作调用方配置。
 * @lang en Determines whether a plain record explicitly supplies an own key without treating prototype values as caller configuration.
 * @param {Record<string, unknown>} record <lang><zh-CN>普通记录。</zh-CN><en>Plain record.</en></lang>
 * @param {string} key <lang><zh-CN>待查键。</zh-CN><en>Key to inspect.</en></lang>
 * @returns {boolean} <lang><zh-CN>自有键存在时返回 true。</zh-CN><en>True when the own key exists.</en></lang>
 */
function hasOwn(record, key) {
  try {
    // <lang><zh-CN>使用标准静态检查以兼容 null-prototype 记录，并隔离 Proxy descriptor trap。</zh-CN><en>Uses the standard static check to support null-prototype records while isolating Proxy descriptor traps.</en></lang>
    return Object.prototype.hasOwnProperty.call(record, key);
  } catch {
    // <lang><zh-CN>trap 异常只表示键不可安全读取。</zh-CN><en>A trap exception means only that the key cannot be read safely.</en></lang>
    return false;
  }
}

/**
 * @lang zh-CN 将非空调用方文字规范化为去除首尾空白的字符串；非字符串或空白字符串返回 null。
 * @lang en Normalizes non-empty caller copy to a trimmed string; non-strings and blank strings return null.
 * @param {unknown} value <lang><zh-CN>待规范化文字。</zh-CN><en>Copy to normalize.</en></lang>
 * @returns {string|null} <lang><zh-CN>规范化文字或失败标记。</zh-CN><en>Normalized copy or a failure marker.</en></lang>
 */
function normalizeRequiredText(value) {
  // <lang><zh-CN>禁止隐式 string coercion，以免对象 getter/toString 成为代码执行面。</zh-CN><en>Forbids implicit string coercion so object getters/toString cannot become an execution surface.</en></lang>
  if (typeof value !== 'string') {
    return null;
  }

  // <lang><zh-CN>去除边界空白后再次判空，宿主不会收到不可见的消息或 control 标签。</zh-CN><en>Trims boundary whitespace and checks again so the host receives no invisible message or control label.</en></lang>
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

/**
 * @lang zh-CN 将可选文字规范化为去除首尾空白的字符串；缺失时使用空字符串，非字符串时失败。
 * @lang en Normalizes optional copy to a trimmed string; absence becomes an empty string and non-strings fail.
 * @param {Record<string, unknown>} record <lang><zh-CN>普通 options 记录。</zh-CN><en>Plain options record.</en></lang>
 * @param {string} key <lang><zh-CN>可选文字键。</zh-CN><en>Optional-copy key.</en></lang>
 * @returns {{valid: boolean, value: string}} <lang><zh-CN>显式有效性与规范化值。</zh-CN><en>Explicit validity and normalized value.</en></lang>
 */
function normalizeOptionalText(record, key) {
  // <lang><zh-CN>缺失字段规范化为空字符串，使宿主无需读取原始 options 或合并任意默认对象。</zh-CN><en>An absent field normalizes to an empty string so the host need not read raw options or merge arbitrary defaults.</en></lang>
  if (!hasOwn(record, key)) {
    return { valid: true, value: '' };
  }

  // <lang><zh-CN>所有显式文字必须保持字符串类型；空字符串允许表示“不呈现”。</zh-CN><en>Every explicit copy value must remain a string; an empty string may represent “do not present.”</en></lang>
  if (typeof record[key] !== 'string') {
    return { valid: false, value: '' };
  }

  // <lang><zh-CN>只清理边界空白，不进行翻译、插值或 HTML 解释。</zh-CN><en>Trims boundary whitespace only and performs no translation, interpolation, or HTML interpretation.</en></lang>
  return { valid: true, value: record[key].trim() };
}

/**
 * @lang zh-CN 将可选布尔字段规范化为显式布尔值；缺失时使用提供的有限默认值。
 * @lang en Normalizes an optional Boolean field to an explicit Boolean; absence uses the supplied finite default.
 * @param {Record<string, unknown>} record <lang><zh-CN>普通 options 记录。</zh-CN><en>Plain options record.</en></lang>
 * @param {string} key <lang><zh-CN>布尔字段键。</zh-CN><en>Boolean-field key.</en></lang>
 * @param {boolean} fallback <lang><zh-CN>字段缺失时的默认值。</zh-CN><en>Default used when the field is absent.</en></lang>
 * @returns {{valid: boolean, value: boolean}} <lang><zh-CN>显式有效性与规范化布尔值。</zh-CN><en>Explicit validity and normalized Boolean.</en></lang>
 */
function normalizeOptionalBoolean(record, key, fallback) {
  // <lang><zh-CN>缺失键采用固定默认值，不使用 truthy/falsy coercion。</zh-CN><en>An absent key uses the fixed default without truthy/falsy coercion.</en></lang>
  if (!hasOwn(record, key)) {
    return { valid: true, value: fallback };
  }

  // <lang><zh-CN>显式值必须是 Boolean primitive，数字与字符串不被猜测。</zh-CN><en>An explicit value must be a Boolean primitive; numbers and strings are not guessed.</en></lang>
  return typeof record[key] === 'boolean'
    ? { valid: true, value: record[key] }
    : { valid: false, value: fallback };
}

/**
 * @lang zh-CN 规范化有限 toast options 并返回不可变、完整的宿主输入；任何未知键、回调式扩展或无效有限值均返回 null。
 * @lang en Normalizes finite toast options into immutable, complete host input; any unknown key, callback-like extension, or invalid finite value returns null.
 * @param {unknown} input <lang><zh-CN>非空 message 字符串或普通 options 记录。</zh-CN><en>Non-empty message string or plain options record.</en></lang>
 * @param {unknown} [overrides] <lang><zh-CN>仅供内部 typed helper 使用的 tone/loading/duration 覆盖。</zh-CN><en>Tone/loading/duration overrides used only by internal typed helpers.</en></lang>
 * @returns {Readonly<{message: string, tone: string, loading: boolean, position: string, duration: number, closeText: string}>|null} <lang><zh-CN>冻结后的有限 options 或失败标记。</zh-CN><en>Frozen finite options or a failure marker.</en></lang>
 */
function normalizeUToastOptionsUnchecked(input, overrides = undefined) {
  // <lang><zh-CN>字符串入口只表达可见 message；对象入口稍后逐键验证。</zh-CN><en>The string entry expresses visible message only; the object entry is validated key by key below.</en></lang>
  const inputRecord = typeof input === 'string' ? { message: input } : input;

  // <lang><zh-CN>options 必须完整复制为白名单快照；之后不再读取调用方对象。</zh-CN><en>Options must copy completely into an allowlisted snapshot; the caller object is never read afterward.</en></lang>
  const record = snapshotAllowedRecord(inputRecord, TOAST_OPTION_KEYS);
  if (record === null) {
    return null;
  }

  // <lang><zh-CN>内部覆盖缺失时使用空记录；显式覆盖仍需普通记录和独立白名单。</zh-CN><en>Absent internal overrides use an empty record; explicit overrides still require a plain record and their own allowlist.</en></lang>
  const overrideRecord = snapshotAllowedRecord(overrides === undefined ? {} : overrides, TOAST_OVERRIDE_KEYS);
  if (overrideRecord === null) {
    return null;
  }

  // <lang><zh-CN>message 优先于兼容 title；显式空 message 不会被 title 隐式替换。</zh-CN><en>Message takes precedence over the compatibility title; an explicitly empty message is not implicitly replaced by title.</en></lang>
  const messageSource = hasOwn(record, 'message') ? record.message : record.title;
  const message = normalizeRequiredText(messageSource);
  if (message === null) {
    return null;
  }

  // <lang><zh-CN>兼容 tone/type 即使被 typed helper 覆盖也必须各自为允许值，避免隐藏无效调用点。</zh-CN><en>Compatibility tone/type values must each be allowed even when overridden by a typed helper, avoiding hidden invalid call sites.</en></lang>
  if ((hasOwn(record, 'tone') && !TOAST_TONES.has(record.tone)) || (hasOwn(record, 'type') && !TOAST_TONES.has(record.type))) {
    return null;
  }

  // <lang><zh-CN>typed helper 的固定 tone 最后覆盖兼容 tone/type；否则依次使用 tone、type、info。</zh-CN><en>A typed helper's fixed tone overrides compatibility tone/type last; otherwise tone, type, and info are used in order.</en></lang>
  const tone = hasOwn(overrideRecord, 'tone')
    ? overrideRecord.tone
    : (hasOwn(record, 'tone') ? record.tone : (hasOwn(record, 'type') ? record.type : 'info'));
  if (!TOAST_TONES.has(tone)) {
    return null;
  }

  // <lang><zh-CN>position 仅接受固定宿主内位置，缺失时选择 center。</zh-CN><en>Position accepts only a fixed in-host placement and defaults to center.</en></lang>
  const position = hasOwn(record, 'position') ? record.position : 'center';
  if (!TOAST_POSITIONS.has(position)) {
    return null;
  }

  // <lang><zh-CN>调用方显式 loading 即使将被 typed helper 覆盖也必须先是 Boolean，防止函数/对象借 helper 绕过纯数据合同。</zh-CN><en>An explicit caller loading value must first be Boolean even when a typed helper will override it, preventing a function/object from bypassing the plain-data contract through a helper.</en></lang>
  if (hasOwn(record, 'loading') && typeof record.loading !== 'boolean') {
    return null;
  }

  // <lang><zh-CN>内部 loading helper 只覆盖已验证的布尔值或缺失字段。</zh-CN><en>The internal loading helper overrides only an already-validated Boolean or an absent field.</en></lang>
  const loadingSource = hasOwn(overrideRecord, 'loading') ? overrideRecord.loading : (hasOwn(record, 'loading') ? record.loading : false);
  if (typeof loadingSource !== 'boolean') {
    return null;
  }

  // <lang><zh-CN>调用方显式 duration 无论是否存在内部 fallback 都必须先满足有限数值边界，helper 不能隐藏函数或无界值。</zh-CN><en>An explicit caller duration must satisfy the finite numeric boundary regardless of an internal fallback, so a helper cannot hide a function or unbounded value.</en></lang>
  if (hasOwn(record, 'duration') && (typeof record.duration !== 'number' || !Number.isFinite(record.duration) || record.duration < 0 || record.duration > 60000)) {
    return null;
  }

  // <lang><zh-CN>内部 duration 仅在调用方字段缺失时作为默认；普通 toast 最终回退 3000ms。</zh-CN><en>An internal duration acts only as a default when the caller field is absent; an ordinary toast finally falls back to 3000ms.</en></lang>
  const duration = hasOwn(record, 'duration') ? record.duration : (hasOwn(overrideRecord, 'duration') ? overrideRecord.duration : 3000);
  if (typeof duration !== 'number' || !Number.isFinite(duration) || duration < 0 || duration > 60000) {
    return null;
  }

  // <lang><zh-CN>closeText 仅为可选纯文字，不被解释为 action、回调或无障碍替代协议。</zh-CN><en>CloseText is optional plain copy only and is not interpreted as an action, callback, or accessibility-substitution protocol.</en></lang>
  const closeTextResult = normalizeOptionalText(record, 'closeText');
  if (!closeTextResult.valid) {
    return null;
  }

  // <lang><zh-CN>冻结完整副本，宿主不能回写调用方 options，调用方也不能在 show 后改变已派发命令。</zh-CN><en>Freezes a complete copy so the host cannot write back caller options and the caller cannot change a dispatched command after show.</en></lang>
  return Object.freeze({
    message,
    tone,
    loading: loadingSource,
    position,
    duration,
    closeText: closeTextResult.value
  });
}

/**
 * @lang zh-CN 在无异常公共边界内调用 toast normalizer；任何 Proxy/getter/descriptor trap 都精确收束为 null。
 * @lang en Calls the toast normalizer behind an exception-free public boundary; every Proxy/getter/descriptor trap is precisely contained as null.
 * @param {unknown} input <lang><zh-CN>待规范化 toast 输入。</zh-CN><en>Toast input to normalize.</en></lang>
 * @param {unknown} [overrides] <lang><zh-CN>有限内部 typed-helper 覆盖。</zh-CN><en>Finite internal typed-helper overrides.</en></lang>
 * @returns {Readonly<object>|null} <lang><zh-CN>冻结纯数据或失败标记。</zh-CN><en>Frozen plain data or a failure marker.</en></lang>
 */
export function normalizeUToastOptions(input, overrides = undefined) {
  try {
    // <lang><zh-CN>unchecked 实现只在该边界内运行，确保 public controller 永不透传输入 trap。</zh-CN><en>The unchecked implementation runs only inside this boundary so a public controller never forwards an input trap.</en></lang>
    return normalizeUToastOptionsUnchecked(input, overrides);
  } catch {
    // <lang><zh-CN>异常内容既不记录也不暴露，调用点只收到 invalid-options 所需的 null。</zh-CN><en>Exception content is neither logged nor exposed; the caller receives only the null required for invalid-options.</en></lang>
    return null;
  }
}

/**
 * @lang zh-CN 规范化有限 modal options；confirm 模式只接受普通对象、要求两个非空标签并强制显示双 control。
 * @lang en Normalizes finite modal options; confirm mode accepts only a plain object, requires two non-empty labels, and forces both controls visible.
 * @param {unknown} input <lang><zh-CN>display content 字符串或普通 modal options。</zh-CN><en>Display-content string or plain modal options.</en></lang>
 * @param {unknown} [mode] <lang><zh-CN>内部 `{confirm?: boolean}` 模式记录。</zh-CN><en>Internal `{confirm?: boolean}` mode record.</en></lang>
 * @returns {Readonly<{title: string, content: string, confirmText: string, cancelText: string, showConfirmButton: boolean, showCancelButton: boolean, asyncClose: boolean, loading: boolean}>|null} <lang><zh-CN>冻结后的有限 options 或失败标记。</zh-CN><en>Frozen finite options or a failure marker.</en></lang>
 */
function normalizeUModalOptionsUnchecked(input, mode = undefined) {
  // <lang><zh-CN>内部 mode 只允许可选 confirm Boolean，避免 normalizer 获得任意策略入口。</zh-CN><en>The internal mode allows only an optional confirm Boolean so the normalizer gains no arbitrary policy entry.</en></lang>
  const modeRecord = snapshotAllowedRecord(mode === undefined ? {} : mode, MODAL_MODE_KEYS);
  if (modeRecord === null || (hasOwn(modeRecord, 'confirm') && typeof modeRecord.confirm !== 'boolean')) {
    return null;
  }

  // <lang><zh-CN>confirm 模式的值被收束为显式 Boolean，缺失即 false。</zh-CN><en>The confirm-mode value is constrained to an explicit Boolean and defaults to false.</en></lang>
  const confirmMode = modeRecord.confirm === true;

  // <lang><zh-CN>字符串只适用于无 control 的 display modal；confirm 必须显式声明两个 control 标签。</zh-CN><en>A string is only for a control-free display modal; confirm must explicitly declare both control labels.</en></lang>
  if (typeof input === 'string') {
    const content = normalizeRequiredText(input);
    if (confirmMode || content === null) {
      return null;
    }

    // <lang><zh-CN>display 字符串规范化为完整冻结对象，宿主无需猜测任何缺省 control。</zh-CN><en>A display string normalizes to a complete frozen object so the host guesses no default control.</en></lang>
    return Object.freeze({
      title: '',
      content,
      confirmText: '',
      cancelText: '',
      showConfirmButton: false,
      showCancelButton: false,
      asyncClose: false,
      loading: false
    });
  }

  // <lang><zh-CN>对象入口必须成为 modal 白名单纯数据快照；后续不再读取调用方对象。</zh-CN><en>The object entry must become an allowlisted plain-data modal snapshot; the caller object is never read afterward.</en></lang>
  const inputRecord = snapshotAllowedRecord(input, MODAL_OPTION_KEYS);
  if (inputRecord === null) {
    return null;
  }

  // <lang><zh-CN>四个文字字段分别验证，避免任何隐式 coercion 或 HTML/模板解释。</zh-CN><en>The four copy fields are validated separately, avoiding implicit coercion or HTML/template interpretation.</en></lang>
  const titleResult = normalizeOptionalText(inputRecord, 'title');
  const contentResult = normalizeOptionalText(inputRecord, 'content');
  const confirmTextResult = normalizeOptionalText(inputRecord, 'confirmText');
  const cancelTextResult = normalizeOptionalText(inputRecord, 'cancelText');
  if (!titleResult.valid || !contentResult.valid || !confirmTextResult.valid || !cancelTextResult.valid) {
    return null;
  }

  // <lang><zh-CN>至少一个标题或内容必须可见，防止空 modal 成为无语义遮罩。</zh-CN><en>At least one title or content value must be visible so an empty modal cannot become a semantic-free mask.</en></lang>
  if (titleResult.value.length === 0 && contentResult.value.length === 0) {
    return null;
  }

  // <lang><zh-CN>control 显示默认从对应非空标签派生；显式 Boolean 可关闭它，但不能创建无标签 control。</zh-CN><en>Control visibility defaults from its corresponding non-empty label; an explicit Boolean may hide it but cannot create an unlabeled control.</en></lang>
  const showConfirmResult = normalizeOptionalBoolean(inputRecord, 'showConfirmButton', confirmTextResult.value.length > 0);
  const showCancelResult = normalizeOptionalBoolean(inputRecord, 'showCancelButton', cancelTextResult.value.length > 0);
  const asyncCloseResult = normalizeOptionalBoolean(inputRecord, 'asyncClose', false);
  const loadingResult = normalizeOptionalBoolean(inputRecord, 'loading', false);
  if (!showConfirmResult.valid || !showCancelResult.valid || !asyncCloseResult.valid || !loadingResult.valid) {
    return null;
  }

  // <lang><zh-CN>任何可见 control 都必须具有非空标签；服务不制造语言相关默认文案。</zh-CN><en>Every visible control must have a non-empty label; the service invents no language-specific default copy.</en></lang>
  if ((showConfirmResult.value && confirmTextResult.value.length === 0) || (showCancelResult.value && cancelTextResult.value.length === 0)) {
    return null;
  }

  // <lang><zh-CN>confirm helper 要求调用方提供两个标签，并覆盖隐藏标志以形成明确的双 control 选择。</zh-CN><en>The confirm helper requires both caller labels and overrides hidden flags to form an explicit two-control choice.</en></lang>
  if (confirmMode && (confirmTextResult.value.length === 0 || cancelTextResult.value.length === 0)) {
    return null;
  }

  // <lang><zh-CN>冻结完整 modal 命令数据；asyncClose/loading 只作为宿主呈现状态，不执行异步任务。</zh-CN><en>Freezes complete modal command data; asyncClose/loading are host-presentation state only and execute no asynchronous task.</en></lang>
  return Object.freeze({
    title: titleResult.value,
    content: contentResult.value,
    confirmText: confirmTextResult.value,
    cancelText: cancelTextResult.value,
    showConfirmButton: confirmMode ? true : showConfirmResult.value,
    showCancelButton: confirmMode ? true : showCancelResult.value,
    asyncClose: asyncCloseResult.value,
    loading: loadingResult.value
  });
}

/**
 * @lang zh-CN 在无异常公共边界内调用 modal normalizer；任何 Proxy/getter/descriptor trap 都精确收束为 null。
 * @lang en Calls the modal normalizer behind an exception-free public boundary; every Proxy/getter/descriptor trap is precisely contained as null.
 * @param {unknown} input <lang><zh-CN>待规范化 modal 输入。</zh-CN><en>Modal input to normalize.</en></lang>
 * @param {unknown} [mode] <lang><zh-CN>有限内部 confirm 模式。</zh-CN><en>Finite internal confirm mode.</en></lang>
 * @returns {Readonly<object>|null} <lang><zh-CN>冻结纯数据或失败标记。</zh-CN><en>Frozen plain data or a failure marker.</en></lang>
 */
export function normalizeUModalOptions(input, mode = undefined) {
  try {
    // <lang><zh-CN>unchecked 实现只在该边界内运行，确保 public controller 永不透传输入 trap。</zh-CN><en>The unchecked implementation runs only inside this boundary so a public controller never forwards an input trap.</en></lang>
    return normalizeUModalOptionsUnchecked(input, mode);
  } catch {
    // <lang><zh-CN>异常不越过有限数据 API，调用点只收到 null。</zh-CN><en>The exception cannot cross the finite-data API; the caller receives null only.</en></lang>
    return null;
  }
}

/**
 * @lang zh-CN 创建冻结成功结果，使所有 controller/internal settlement 返回同一精确形状。
 * @lang en Creates a frozen success result so every controller/internal settlement returns the same precise shape.
 * @param {number} requestId <lang><zh-CN>当前或最近一次有限请求编号；0 仅表示尚无 show 请求的幂等 close/clear。</zh-CN><en>Current or latest finite request number; 0 only denotes idempotent close/clear before any show request.</en></lang>
 * @returns {Readonly<{accepted: true, requestId: number}>} <lang><zh-CN>冻结成功结果。</zh-CN><en>Frozen success result.</en></lang>
 */
function createAcceptedResult(requestId) {
  // <lang><zh-CN>结果不暴露内部 host、scope 或 options 引用。</zh-CN><en>The result exposes no internal host, scope, or options reference.</en></lang>
  return Object.freeze({ accepted: true, requestId });
}

/**
 * @lang zh-CN 创建冻结失败结果，仅公开合同允许的有限 reason。
 * @lang en Creates a frozen failure result exposing only a finite contract-approved reason.
 * @param {'invalid-scope'|'host-unavailable'|'scope-disposed'|'stale-request'|'invalid-options'} reason <lang><zh-CN>有限失败原因。</zh-CN><en>Finite failure reason.</en></lang>
 * @returns {Readonly<{accepted: false, reason: string}>} <lang><zh-CN>冻结失败结果。</zh-CN><en>Frozen failure result.</en></lang>
 */
function createRejectedResult(reason) {
  // <lang><zh-CN>失败不透传异常、平台信息或宿主实现细节。</zh-CN><en>A failure forwards no exception, platform information, or host implementation detail.</en></lang>
  return Object.freeze({ accepted: false, reason });
}

/**
 * @lang zh-CN 解析 scope 并区分从未创建与已释放状态，供每个同步操作使用一致 guard 顺序。
 * @lang en Resolves a scope and distinguishes never-created from disposed state so every synchronous operation uses one guard order.
 * @param {unknown} scope <lang><zh-CN>调用方显式传入的 scope。</zh-CN><en>Caller-explicit scope.</en></lang>
 * @returns {{state: object|null, failure: object|null}} <lang><zh-CN>内部状态或精确失败结果。</zh-CN><en>Internal state or a precise failure result.</en></lang>
 */
function resolveScope(scope) {
  // <lang><zh-CN>WeakMap.get 对 primitive 不抛错，但先限制对象/函数使合同更明确。</zh-CN><en>WeakMap.get does not throw for primitives, but constraining object/function first makes the contract explicit.</en></lang>
  if ((typeof scope !== 'object' || scope === null) && typeof scope !== 'function') {
    return { state: null, failure: createRejectedResult('invalid-scope') };
  }

  // <lang><zh-CN>只有 createUFeedbackScope 登记的对象可获得内部状态。</zh-CN><en>Only an object registered by createUFeedbackScope can obtain internal state.</en></lang>
  const state = SCOPE_STATES.get(scope);
  if (state === undefined) {
    return { state: null, failure: createRejectedResult('invalid-scope') };
  }

  // <lang><zh-CN>dispose 后保留 WeakMap 身份只为报告 scope-disposed，不允许重新注册或复活。</zh-CN><en>After dispose, WeakMap identity is retained only to report scope-disposed and permits no re-registration or revival.</en></lang>
  if (state.disposed) {
    return { state: null, failure: createRejectedResult('scope-disposed') };
  }

  // <lang><zh-CN>成功解析不创建默认 host 或其他外部能力。</zh-CN><en>Successful resolution creates no default host or other external capability.</en></lang>
  return { state, failure: null };
}

/**
 * @lang zh-CN 安全调用宿主 release；异常被收束且不会中断替换、注销或 scope dispose。
 * @lang en Safely invokes host release; exceptions are contained and cannot interrupt replacement, unregister, or scope disposal.
 * @param {unknown} host <lang><zh-CN>先前已登记宿主。</zh-CN><en>Previously registered host.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function releaseHost(host) {
  // <lang><zh-CN>注册验证保证 release 为函数；try/catch 仍隔离宿主实现缺陷。</zh-CN><en>Registration validation guarantees release is a function; try/catch still isolates host implementation defects.</en></lang>
  try {
    host.release();
  } catch {
    // <lang><zh-CN>release 异常不得越过无异常服务边界，也不包含在结果中。</zh-CN><en>A release exception must not cross the exception-free service boundary and is not included in a result.</en></lang>
  }
}

/**
 * @lang zh-CN 判断 kind 是否属于固定 feedback host 集合。
 * @lang en Determines whether a kind belongs to the fixed feedback-host set.
 * @param {unknown} kind <lang><zh-CN>待检查种类。</zh-CN><en>Kind to inspect.</en></lang>
 * @returns {boolean} <lang><zh-CN>toast 或 modal 返回 true。</zh-CN><en>True for toast or modal.</en></lang>
 */
function isFeedbackKind(kind) {
  // <lang><zh-CN>有限数组足以表达两个稳定值且不暴露可变 registry。</zh-CN><en>The finite array expresses the two stable values without exposing a mutable registry.</en></lang>
  return FEEDBACK_KINDS.includes(kind);
}

/**
 * @lang zh-CN 将宿主固定同步方法复制为不可变快照；注册后派发不再读取调用方 host 对象或触发 Proxy `get` trap。
 * @lang en Copies fixed synchronous host methods into an immutable snapshot; dispatch after registration no longer reads the caller host object or triggers a Proxy `get` trap.
 * @param {'toast'|'modal'} kind <lang><zh-CN>有限宿主种类。</zh-CN><en>Finite host kind.</en></lang>
 * @param {unknown} host <lang><zh-CN>待注册宿主。</zh-CN><en>Host to register.</en></lang>
 * @returns {Readonly<Record<string, Function>>|null} <lang><zh-CN>固定方法快照或无效标记。</zh-CN><en>Fixed-method snapshot or invalid marker.</en></lang>
 */
function normalizeFeedbackHost(kind, host) {
  // <lang><zh-CN>toast 只需要 show/close/release；modal 额外需要 clearLoading。</zh-CN><en>Toast needs show/close/release only; modal additionally needs clearLoading.</en></lang>
  const requiredMethods = kind === 'toast'
    ? ['show', 'close', 'release']
    : ['show', 'close', 'clearLoading', 'release'];

  // <lang><zh-CN>精确白名单拒绝 accessor、额外命令和非普通对象，并返回不再引用 host 属性表面的快照。</zh-CN><en>The exact allowlist rejects accessors, extra commands, and non-plain objects and returns a snapshot that no longer references the host property surface.</en></lang>
  const snapshot = snapshotAllowedRecord(host, new Set(requiredMethods));
  if (snapshot === null) {
    return null;
  }

  // <lang><zh-CN>每个固定字段都必须是同步可调用函数；函数不会在注册阶段执行或绑定任意 `this`。</zh-CN><en>Every fixed field must be a synchronously callable function; registration neither executes functions nor binds an arbitrary `this`.</en></lang>
  for (const methodName of requiredMethods) {
    if (typeof snapshot[methodName] !== 'function') {
      return null;
    }
  }

  // <lang><zh-CN>snapshot 已冻结且只有固定方法，可安全存入 scope registry。</zh-CN><en>The snapshot is already frozen and contains only fixed methods, so it is safe to retain in the scope registry.</en></lang>
  return snapshot;
}

/**
 * @lang zh-CN 释放 scope 当前拥有的两个宿主并永久关闭其服务状态。
 * @lang en Releases both hosts currently owned by a scope and permanently closes its service state.
 * @param {unknown} scope <lang><zh-CN>待释放显式 scope。</zh-CN><en>Explicit scope to dispose.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；重复调用幂等。</zh-CN><en>No return value; repeated calls are idempotent.</en></lang>
 */
function disposeFeedbackScope(scope) {
  // <lang><zh-CN>直接读取 WeakMap 允许 dispose 对无效 this 和重复调用保持无异常。</zh-CN><en>Reading the WeakMap directly keeps dispose exception-free for invalid `this` and repeated calls.</en></lang>
  const state = ((typeof scope === 'object' && scope !== null) || typeof scope === 'function')
    ? SCOPE_STATES.get(scope)
    : undefined;
  if (state === undefined || state.disposed) {
    return;
  }

  // <lang><zh-CN>先标记 disposed 并移除宿主记录，防止 release 中的重入重新使用该 scope。</zh-CN><en>Marks disposed and removes host records first so re-entry from release cannot reuse the scope.</en></lang>
  state.disposed = true;
  const registrations = Array.from(state.hosts.values());
  state.hosts.clear();

  // <lang><zh-CN>清空 active 请求，但保留 last/next 仅用于不可复活状态的内部一致性。</zh-CN><en>Clears active requests while retaining last/next only for internal consistency of the non-revivable state.</en></lang>
  state.activeRequestIds.set('toast', null);
  state.activeRequestIds.set('modal', null);

  // <lang><zh-CN>逐个释放 scope 仍拥有的宿主；每个异常独立隔离。</zh-CN><en>Releases each host still owned by the scope; every exception is isolated independently.</en></lang>
  for (const registration of registrations) {
    // <lang><zh-CN>releaseHost 为每个宿主建立独立异常边界。</zh-CN><en>ReleaseHost establishes an independent exception boundary for each host.</en></lang>
    releaseHost(registration.host);
  }
}

/**
 * @lang zh-CN 显式 feedback scope 实例；其唯一公开生命周期操作是幂等 dispose。
 * @lang en Explicit feedback-scope instance whose sole public lifecycle operation is idempotent dispose.
 */
class UFeedbackScope {
  /**
   * @lang zh-CN 创建独立 host/request 状态，不注册组件、页面事件或任何全局默认值。
   * @lang en Creates independent host/request state without registering a component, page event, or global default.
   * @param {unknown} constructionToken <lang><zh-CN>仅公共 factory 可提供的模块私有构造令牌。</zh-CN><en>Module-private construction token supplied only by the public factory.</en></lang>
   */
  constructor(constructionToken) {
    // <lang><zh-CN>只有公共 factory 的闭包令牌能建立 WeakMap 身份；直接或泄漏 constructor 调用只得到无效、无状态对象。</zh-CN><en>Only the public factory's closure token establishes WeakMap identity; direct or leaked-constructor calls yield an invalid stateless object.</en></lang>
    if (constructionToken !== FEEDBACK_SCOPE_CONSTRUCTION_TOKEN) {
      return;
    }

    // <lang><zh-CN>每个 scope 使用单一递增序列，为 toast/modal 生成不复用的本地 requestId。</zh-CN><en>Each scope uses one increasing sequence to generate non-reused local request IDs across toast/modal.</en></lang>
    const state = {
      disposed: false,
      nextRequestId: 1,
      hosts: new Map(),
      activeRequestIds: new Map([['toast', null], ['modal', null]]),
      lastRequestIds: new Map([['toast', 0], ['modal', 0]])
    };

    // <lang><zh-CN>私有状态只通过 WeakMap 与实例关联，实例本身不暴露可变字段。</zh-CN><en>Private state is associated only through the WeakMap; the instance exposes no mutable field.</en></lang>
    SCOPE_STATES.set(this, state);
  }

  /**
   * @lang zh-CN 永久释放该 scope 当前宿主并使后续 controller 操作返回 scope-disposed。
   * @lang en Permanently releases this scope's current hosts and makes subsequent controller operations return scope-disposed.
   * @returns {void} <lang><zh-CN>无返回值；重复调用幂等。</zh-CN><en>No return value; repeated calls are idempotent.</en></lang>
   */
  dispose() {
    // <lang><zh-CN>委托统一释放流程以维持 replacement/unregister/dispose 的相同异常边界。</zh-CN><en>Delegates to the shared release path to retain the same exception boundary across replacement, unregister, and dispose.</en></lang>
    disposeFeedbackScope(this);
  }
}

// <lang><zh-CN>冻结共享 prototype，阻止调用方经合法实例改写 constructor/dispose 并影响其他 scope；私有构造令牌继续阻止 constructor 泄漏伪造。</zh-CN><en>Freezes the shared prototype so callers cannot rewrite constructor/dispose through a valid instance and affect other scopes; the private construction token continues to prevent leaked-constructor forgery.</en></lang>
Object.freeze(UFeedbackScope.prototype);

/**
 * @lang zh-CN 创建必须由调用方保存并显式传给 use/register 的独立 feedback scope。
 * @lang en Creates an independent feedback scope that the caller must retain and pass explicitly to use/register.
 * @returns {Readonly<UFeedbackScope>} <lang><zh-CN>冻结且无默认全局注册的 scope。</zh-CN><en>Frozen scope with no default global registration.</en></lang>
 */
export function createUFeedbackScope() {
  // <lang><zh-CN>冻结只保护公开对象表面；模块私有 WeakMap 状态仍由受限方法管理。</zh-CN><en>Freezing protects only the public object surface; constrained methods still manage module-private WeakMap state.</en></lang>
  return Object.freeze(new UFeedbackScope(FEEDBACK_SCOPE_CONSTRUCTION_TOKEN));
}

/**
 * @lang zh-CN 将一个同步组件宿主注册到显式 scope/kind；后注册者替换旧宿主并安全 release 旧宿主。
 * @lang en Registers one synchronous component host in an explicit scope/kind; a later registration replaces and safely releases the old host.
 * @param {unknown} scope <lang><zh-CN>由 createUFeedbackScope 创建的显式 scope。</zh-CN><en>Explicit scope created by createUFeedbackScope.</en></lang>
 * @param {unknown} kind <lang><zh-CN>仅 toast 或 modal。</zh-CN><en>Toast or modal only.</en></lang>
 * @param {unknown} host <lang><zh-CN>实现固定 kind 方法的普通记录。</zh-CN><en>Plain record implementing the fixed kind methods.</en></lang>
 * @returns {() => void} <lang><zh-CN>token-safe 幂等注销函数；旧 token 不会移除新宿主。</zh-CN><en>Token-safe idempotent unregister function; an old token cannot remove a new host.</en></lang>
 */
export function registerUFeedbackHost(scope, kind, host) {
  // <lang><zh-CN>注册前同时验证 kind、scope 与固定 host 方法；失败不取得 host 所有权。</zh-CN><en>Validates kind, scope, and fixed host methods before registration; failure takes no host ownership.</en></lang>
  if (!isFeedbackKind(kind)) {
    return noopUnregister;
  }

  const resolution = resolveScope(scope);
  // <lang><zh-CN>Scope 生命周期 guard 先于 host descriptor 审计；无效/已释放 scope 不触碰调用方 host。</zh-CN><en>The scope lifecycle guard precedes host-descriptor auditing; an invalid/disposed scope never touches the caller host.</en></lang>
  if (resolution.failure !== null) {
    return noopUnregister;
  }

  // <lang><zh-CN>有效 scope 下才复制固定 host 方法，避免注册后再次读取调用方对象。</zh-CN><en>Fixed host methods are copied only under a valid scope so the caller object is never read again after registration.</en></lang>
  const hostSnapshot = normalizeFeedbackHost(kind, host);
  if (hostSnapshot === null) {
    return noopUnregister;
  }

  // <lang><zh-CN>每次登记创建唯一 token，注销闭包只可删除其自身仍为 current 的记录。</zh-CN><en>Each registration creates a unique token, and its unregister closure may delete only its own still-current record.</en></lang>
  const token = Object.freeze({});
  const previousRegistration = resolution.state.hosts.get(kind);
  const registration = Object.freeze({ token, owner: host, host: hostSnapshot });
  // <lang><zh-CN>同一 host identity 的重复注册是 token renewal，不是替换；它保留 active request 且不会 release 自身。</zh-CN><en>Repeated registration of the same host identity is token renewal rather than replacement; it preserves the active request and never releases itself.</en></lang>
  const renewsSameHost = previousRegistration?.owner === host;

  // <lang><zh-CN>先安装新记录；真正替换才清 active 并 release 旧快照，release 重入不能覆盖新记录。</zh-CN><en>Installs the new record first; only a real replacement clears active state and releases the old snapshot, so release re-entry cannot overwrite the new record.</en></lang>
  resolution.state.hosts.set(kind, registration);
  if (!renewsSameHost) {
    resolution.state.activeRequestIds.set(kind, null);
  }
  if (previousRegistration !== undefined && !renewsSameHost) {
    releaseHost(previousRegistration.host);
  }

  // <lang><zh-CN>闭包本地标记使同一注销函数重复调用保持零副作用。</zh-CN><en>A closure-local flag keeps repeated calls to the same unregister function side-effect free.</en></lang>
  let registered = true;

  /**
   * @lang zh-CN 仅当 token 仍指向 current host 时移除并 release；被替换的旧 token 保持零副作用。
   * @lang en Removes and releases only while the token still identifies the current host; a replaced old token remains side-effect free.
   * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
   */
  return function unregisterFeedbackHost() {
    // <lang><zh-CN>重复注销在读取 scope 之前即返回，避免 dispose 后改变结果。</zh-CN><en>A repeated unregister returns before reading the scope so disposal cannot change its result.</en></lang>
    if (!registered) {
      return;
    }
    registered = false;

    // <lang><zh-CN>直接读取现有 state 允许 dispose/replacement 后安全比较 token，不会把其视为新操作。</zh-CN><en>Reading the existing state directly permits safe token comparison after disposal/replacement without treating it as a new operation.</en></lang>
    const state = SCOPE_STATES.get(scope);
    const currentRegistration = state?.hosts.get(kind);
    if (currentRegistration?.token !== token) {
      return;
    }

    // <lang><zh-CN>删除 current host 并清空其 active 请求，然后只 release 当前 token 所有的宿主。</zh-CN><en>Deletes the current host and clears its active request, then releases only the host owned by the current token.</en></lang>
    state.hosts.delete(kind);
    state.activeRequestIds.set(kind, null);
    releaseHost(hostSnapshot);
  };
}

/**
 * @lang zh-CN 由宿主确认当前请求已自然结束；仅匹配 active requestId 时清空，不触发 close/release 或外部副作用。
 * @lang en Lets a host confirm that the current request ended naturally; clears only a matching active request ID and triggers no close/release or external side effect.
 * @param {unknown} scope <lang><zh-CN>显式 feedback scope。</zh-CN><en>Explicit feedback scope.</en></lang>
 * @param {unknown} kind <lang><zh-CN>toast 或 modal。</zh-CN><en>Toast or modal.</en></lang>
 * @param {unknown} requestId <lang><zh-CN>宿主当前命令携带的正整数编号。</zh-CN><en>Positive integer carried by the host's current command.</en></lang>
 * @returns {Readonly<{accepted: true, requestId: number}>|Readonly<{accepted: false, reason: string}>} <lang><zh-CN>精确 settlement 结果。</zh-CN><en>Precise settlement result.</en></lang>
 */
export function settleUFeedbackRequest(scope, kind, requestId) {
  // <lang><zh-CN>scope 失败优先于 request 判定，保持所有操作一致的生命周期语义。</zh-CN><en>Scope failure precedes request checks, retaining consistent lifecycle semantics across operations.</en></lang>
  const resolution = resolveScope(scope);
  if (resolution.failure !== null) {
    return resolution.failure;
  }

  // <lang><zh-CN>未知 kind、非正安全整数或非 active 编号都属于 stale request，不扩展失败 reason 集合。</zh-CN><en>An unknown kind, non-positive safe integer, or non-active ID is a stale request without extending the failure-reason set.</en></lang>
  if (!isFeedbackKind(kind) || !Number.isSafeInteger(requestId) || requestId <= 0 || resolution.state.activeRequestIds.get(kind) !== requestId) {
    return createRejectedResult('stale-request');
  }

  // <lang><zh-CN>只清空匹配 active 标记；last request 保留用于无 expectedId 的幂等 close/clear 结果。</zh-CN><en>Clears only the matching active marker; the last request remains for idempotent close/clear results without an expected ID.</en></lang>
  resolution.state.activeRequestIds.set(kind, null);
  return createAcceptedResult(requestId);
}

/**
 * @lang zh-CN 分配 scope 内单调 requestId，并同步派发冻结 show request；宿主异常收束为 host-unavailable。
 * @lang en Allocates a scope-monotonic request ID and synchronously dispatches a frozen show request; host exceptions collapse to host-unavailable.
 * @param {unknown} scope <lang><zh-CN>显式 scope。</zh-CN><en>Explicit scope.</en></lang>
 * @param {'toast'|'modal'} kind <lang><zh-CN>目标宿主种类。</zh-CN><en>Target host kind.</en></lang>
 * @param {Readonly<object>|null} options <lang><zh-CN>已规范化冻结 options 或 null。</zh-CN><en>Normalized frozen options or null.</en></lang>
 * @returns {Readonly<{accepted: true, requestId: number}>|Readonly<{accepted: false, reason: string}>} <lang><zh-CN>精确同步结果。</zh-CN><en>Precise synchronous result.</en></lang>
 */
function dispatchShow(scope, kind, options) {
  // <lang><zh-CN>先解析 scope，使伪造/已释放 scope 不因 options 内容泄漏不同执行路径。</zh-CN><en>Resolves the scope first so forged/disposed scopes do not leak different execution paths through options content.</en></lang>
  const resolution = resolveScope(scope);
  if (resolution.failure !== null) {
    return resolution.failure;
  }

  // <lang><zh-CN>normalizer 的 null 是唯一 invalid-options 标记。</zh-CN><en>Normalizer null is the sole invalid-options marker.</en></lang>
  if (options === null) {
    return createRejectedResult('invalid-options');
  }

  // <lang><zh-CN>没有匹配宿主时不分配 requestId，也不缓存待回放命令。</zh-CN><en>Without a matching host, allocates no request ID and caches no command for replay.</en></lang>
  const registration = resolution.state.hosts.get(kind);
  if (registration === undefined) {
    return createRejectedResult('host-unavailable');
  }

  // <lang><zh-CN>单调编号在调用 host 前即消费；即使 host 抛错也不复用编号。</zh-CN><en>The monotonic ID is consumed before calling the host and is never reused even if the host throws.</en></lang>
  const requestId = resolution.state.nextRequestId;
  resolution.state.nextRequestId += 1;
  resolution.state.lastRequestIds.set(kind, requestId);

  // <lang><zh-CN>冻结 request envelope，宿主只能读取编号与已冻结 options。</zh-CN><en>Freezes the request envelope so the host can only read the ID and already-frozen options.</en></lang>
  const request = Object.freeze({ requestId, options });
  const previousActiveRequestId = resolution.state.activeRequestIds.get(kind);

  // <lang><zh-CN>先写 active 允许同步宿主在 show 内立即 settlement；抛错时仅在仍匹配本编号时回滚。</zh-CN><en>Writes active first so a synchronous host may settle inside show; on throw, rolls back only while this ID still matches.</en></lang>
  resolution.state.activeRequestIds.set(kind, requestId);
  try {
    registration.host.show(request);
  } catch {
    // <lang><zh-CN>宿主抛错时不暴露异常；若没有重入改变 active，则恢复先前请求。</zh-CN><en>On a host exception, exposes no exception; if re-entry did not change active, restores the previous request.</en></lang>
    if (resolution.state.activeRequestIds.get(kind) === requestId) {
      resolution.state.activeRequestIds.set(kind, previousActiveRequestId);
    }
    return createRejectedResult('host-unavailable');
  }

  // <lang><zh-CN>accepted 只证明同步命令被宿主接收，不证明用户看见、确认或业务完成。</zh-CN><en>Accepted proves only that the host received the synchronous command, not that a user saw/confirmed it or that business work completed.</en></lang>
  return createAcceptedResult(requestId);
}

/**
 * @lang zh-CN 同步派发 close；显式 expectedRequestId 必须匹配 active，无 expected 时对当前/最近编号幂等。
 * @lang en Synchronously dispatches close; an explicit expected request ID must match active, while omission is idempotent for the current/latest ID.
 * @param {unknown} scope <lang><zh-CN>显式 scope。</zh-CN><en>Explicit scope.</en></lang>
 * @param {'toast'|'modal'} kind <lang><zh-CN>目标宿主种类。</zh-CN><en>Target host kind.</en></lang>
 * @param {unknown} expectedRequestId <lang><zh-CN>可选 stale guard。</zh-CN><en>Optional stale guard.</en></lang>
 * @returns {Readonly<{accepted: true, requestId: number}>|Readonly<{accepted: false, reason: string}>} <lang><zh-CN>精确同步结果。</zh-CN><en>Precise synchronous result.</en></lang>
 */
function dispatchClose(scope, kind, expectedRequestId) {
  // <lang><zh-CN>生命周期 guard 始终优先。</zh-CN><en>The lifecycle guard always takes precedence.</en></lang>
  const resolution = resolveScope(scope);
  if (resolution.failure !== null) {
    return resolution.failure;
  }

  // <lang><zh-CN>缺失宿主不会把 close 缓存为以后自动执行。</zh-CN><en>A missing host does not cache close for later automatic execution.</en></lang>
  const registration = resolution.state.hosts.get(kind);
  if (registration === undefined) {
    return createRejectedResult('host-unavailable');
  }

  // <lang><zh-CN>只把 undefined 解释为省略；null/0/字符串等显式值均进入 stale guard。</zh-CN><en>Only undefined means omitted; explicit null/zero/string values all enter the stale guard.</en></lang>
  const activeRequestId = resolution.state.activeRequestIds.get(kind);
  if (expectedRequestId !== undefined && (!Number.isSafeInteger(expectedRequestId) || expectedRequestId <= 0 || activeRequestId !== expectedRequestId)) {
    return createRejectedResult('stale-request');
  }

  // <lang><zh-CN>无 expected 时选择 active，否则选择最近编号；从未 show 的幂等 close 使用保留编号 0。</zh-CN><en>Without expected, selects active then latest; idempotent close before any show uses reserved ID 0.</en></lang>
  const requestId = expectedRequestId === undefined
    ? (activeRequestId ?? resolution.state.lastRequestIds.get(kind))
    : expectedRequestId;

  // <lang><zh-CN>host close 保持同步且无异常边界；失败时 active 状态不改变。</zh-CN><en>Host close remains synchronous and exception-free at the service boundary; failure leaves active state unchanged.</en></lang>
  try {
    registration.host.close(requestId);
  } catch {
    return createRejectedResult('host-unavailable');
  }

  // <lang><zh-CN>成功 close 清空匹配 active；重复无 expected close 继续返回同一最近编号。</zh-CN><en>A successful close clears the matching active request; repeated close without expected keeps returning the same latest ID.</en></lang>
  if (resolution.state.activeRequestIds.get(kind) === requestId) {
    resolution.state.activeRequestIds.set(kind, null);
  }
  return createAcceptedResult(requestId);
}

/**
 * @lang zh-CN 同步清除 modal loading 呈现；可选 expectedRequestId 使用与 close 相同的 stale guard，且操作幂等。
 * @lang en Synchronously clears modal loading presentation; an optional expected request ID uses the same stale guard as close, and the operation is idempotent.
 * @param {unknown} scope <lang><zh-CN>显式 scope。</zh-CN><en>Explicit scope.</en></lang>
 * @param {unknown} expectedRequestId <lang><zh-CN>可选 stale guard。</zh-CN><en>Optional stale guard.</en></lang>
 * @returns {Readonly<{accepted: true, requestId: number}>|Readonly<{accepted: false, reason: string}>} <lang><zh-CN>精确同步结果。</zh-CN><en>Precise synchronous result.</en></lang>
 */
function dispatchClearModalLoading(scope, expectedRequestId) {
  // <lang><zh-CN>生命周期 guard 与其他操作一致。</zh-CN><en>The lifecycle guard matches every other operation.</en></lang>
  const resolution = resolveScope(scope);
  if (resolution.failure !== null) {
    return resolution.failure;
  }

  // <lang><zh-CN>clearLoading 只面向已登记 modal host。</zh-CN><en>ClearLoading targets only a registered modal host.</en></lang>
  const registration = resolution.state.hosts.get('modal');
  if (registration === undefined) {
    return createRejectedResult('host-unavailable');
  }

  // <lang><zh-CN>显式 expected 编号必须仍为 active；省略时允许对最近编号重复清除。</zh-CN><en>An explicit expected ID must still be active; omission permits repeated clearing for the latest ID.</en></lang>
  const activeRequestId = resolution.state.activeRequestIds.get('modal');
  if (expectedRequestId !== undefined && (!Number.isSafeInteger(expectedRequestId) || expectedRequestId <= 0 || activeRequestId !== expectedRequestId)) {
    return createRejectedResult('stale-request');
  }

  // <lang><zh-CN>从未 show 时保留编号 0，使无 expected 的清理成为精确幂等命令。</zh-CN><en>Before any show, reserved ID 0 makes clearing without expected a precise idempotent command.</en></lang>
  const requestId = expectedRequestId === undefined
    ? (activeRequestId ?? resolution.state.lastRequestIds.get('modal'))
    : expectedRequestId;

  // <lang><zh-CN>宿主异常统一收束，服务不推断 loading 是否已改变。</zh-CN><en>A host exception is uniformly contained; the service does not infer whether loading changed.</en></lang>
  try {
    registration.host.clearLoading(requestId);
  } catch {
    return createRejectedResult('host-unavailable');
  }

  // <lang><zh-CN>清除 loading 不结束 modal request，后续 confirm/cancel/settle 仍可匹配 active 编号。</zh-CN><en>Clearing loading does not end the modal request; later confirm/cancel/settle may still match the active ID.</en></lang>
  return createAcceptedResult(requestId);
}

/**
 * @lang zh-CN 创建绑定显式 scope 的不可变 toast controller；controller 本身不缓存 host 或应用状态。
 * @lang en Creates an immutable toast controller bound to an explicit scope; the controller itself caches no host or application state.
 * @param {unknown} scope <lang><zh-CN>调用方显式 scope。</zh-CN><en>Caller-explicit scope.</en></lang>
 * @returns {Readonly<object>} <lang><zh-CN>有限 toast 操作集合。</zh-CN><en>Finite toast-operation set.</en></lang>
 */
export function useToast(scope) {
  // <lang><zh-CN>冻结方法集合，避免调用方替换 operation 或注入额外状态。</zh-CN><en>Freezes the method set so callers cannot replace operations or inject extra state.</en></lang>
  return Object.freeze({
    /**
     * @lang zh-CN 显示有限 toast options。
     * @lang en Shows finite toast options.
     * @param {unknown} input <lang><zh-CN>toast 字符串或普通 options。</zh-CN><en>Toast string or plain options.</en></lang>
     * @returns {object} <lang><zh-CN>精确同步结果。</zh-CN><en>Precise synchronous result.</en></lang>
     */
    show(input) {
      // <lang><zh-CN>先规范化有限数据，再交给统一同步派发流程。</zh-CN><en>Normalizes finite data before the shared synchronous dispatch path.</en></lang>
      return dispatchShow(scope, 'toast', normalizeUToastOptions(input));
    },

    /**
     * @lang zh-CN 关闭当前 toast；可选 expectedRequestId 防止旧异步路径关闭新请求。
     * @lang en Closes the current toast; an optional expected request ID prevents an old asynchronous path from closing a newer request.
     * @param {unknown} [expectedRequestId] <lang><zh-CN>可选 active request guard。</zh-CN><en>Optional active-request guard.</en></lang>
     * @returns {object} <lang><zh-CN>精确同步结果。</zh-CN><en>Precise synchronous result.</en></lang>
     */
    close(expectedRequestId = undefined) {
      // <lang><zh-CN>close 不分配新编号，也不执行回调。</zh-CN><en>Close allocates no new ID and executes no callback.</en></lang>
      return dispatchClose(scope, 'toast', expectedRequestId);
    },

    /**
     * @lang zh-CN 以固定 success tone 显示 toast。
     * @lang en Shows a toast with the fixed success tone.
     * @param {unknown} input <lang><zh-CN>toast 字符串或普通 options。</zh-CN><en>Toast string or plain options.</en></lang>
     * @returns {object} <lang><zh-CN>精确同步结果。</zh-CN><en>Precise synchronous result.</en></lang>
     */
    success(input) {
      // <lang><zh-CN>固定 helper 覆盖调用方合法 tone，但不放宽未知键或无效值验证。</zh-CN><en>The fixed helper overrides a valid caller tone without relaxing unknown-key or invalid-value checks.</en></lang>
      return dispatchShow(scope, 'toast', normalizeUToastOptions(input, { tone: 'success' }));
    },

    /**
     * @lang zh-CN 以固定 error tone 显示 toast。
     * @lang en Shows a toast with the fixed error tone.
     * @param {unknown} input <lang><zh-CN>toast 字符串或普通 options。</zh-CN><en>Toast string or plain options.</en></lang>
     * @returns {object} <lang><zh-CN>精确同步结果。</zh-CN><en>Precise synchronous result.</en></lang>
     */
    error(input) {
      // <lang><zh-CN>错误 helper 只改变有限 tone，不解释异常或请求结果。</zh-CN><en>The error helper changes only the finite tone and interprets no exception or request result.</en></lang>
      return dispatchShow(scope, 'toast', normalizeUToastOptions(input, { tone: 'error' }));
    },

    /**
     * @lang zh-CN 以固定 warning tone 显示 toast。
     * @lang en Shows a toast with the fixed warning tone.
     * @param {unknown} input <lang><zh-CN>toast 字符串或普通 options。</zh-CN><en>Toast string or plain options.</en></lang>
     * @returns {object} <lang><zh-CN>精确同步结果。</zh-CN><en>Precise synchronous result.</en></lang>
     */
    warning(input) {
      // <lang><zh-CN>warning helper 不创建队列或优先级。</zh-CN><en>The warning helper creates no queue or priority.</en></lang>
      return dispatchShow(scope, 'toast', normalizeUToastOptions(input, { tone: 'warning' }));
    },

    /**
     * @lang zh-CN 以固定 info tone 显示 toast。
     * @lang en Shows a toast with the fixed info tone.
     * @param {unknown} input <lang><zh-CN>toast 字符串或普通 options。</zh-CN><en>Toast string or plain options.</en></lang>
     * @returns {object} <lang><zh-CN>精确同步结果。</zh-CN><en>Precise synchronous result.</en></lang>
     */
    info(input) {
      // <lang><zh-CN>info helper 仅收束 tone。</zh-CN><en>The info helper constrains only the tone.</en></lang>
      return dispatchShow(scope, 'toast', normalizeUToastOptions(input, { tone: 'info' }));
    },

    /**
     * @lang zh-CN 显示 loading toast；强制 loading=true，并仅在调用方未提供 duration 时使用 0。
     * @lang en Shows a loading toast; forces loading=true and uses 0 only when the caller did not supply duration.
     * @param {unknown} input <lang><zh-CN>toast 字符串或普通 options。</zh-CN><en>Toast string or plain options.</en></lang>
     * @returns {object} <lang><zh-CN>精确同步结果。</zh-CN><en>Precise synchronous result.</en></lang>
     */
    loading(input) {
      // <lang><zh-CN>单次 snapshot 内显式 duration 保留调用方有限生命周期；缺失时内部 fallback=0 使 loading 默认不自动结束。</zh-CN><en>Within one snapshot, an explicit duration preserves the caller's finite lifecycle; when absent, the internal fallback of zero keeps loading from ending automatically.</en></lang>
      return dispatchShow(scope, 'toast', normalizeUToastOptions(input, { loading: true, duration: 0 }));
    }
  });
}

/**
 * @lang zh-CN 创建绑定显式 scope 的不可变 modal controller；show/confirm 只派发有限文字和呈现状态。
 * @lang en Creates an immutable modal controller bound to an explicit scope; show/confirm dispatch only finite copy and presentation state.
 * @param {unknown} scope <lang><zh-CN>调用方显式 scope。</zh-CN><en>Caller-explicit scope.</en></lang>
 * @returns {Readonly<object>} <lang><zh-CN>有限 modal 操作集合。</zh-CN><en>Finite modal-operation set.</en></lang>
 */
export function useModal(scope) {
  // <lang><zh-CN>冻结方法集合，不提供 callback registry、Promise 完成语义或页面 event channel。</zh-CN><en>Freezes the method set and provides no callback registry, Promise-completion semantics, or page event channel.</en></lang>
  return Object.freeze({
    /**
     * @lang zh-CN 显示有限 display/action modal options。
     * @lang en Shows finite display/action modal options.
     * @param {unknown} input <lang><zh-CN>display 字符串或普通 modal options。</zh-CN><en>Display string or plain modal options.</en></lang>
     * @returns {object} <lang><zh-CN>精确同步结果。</zh-CN><en>Precise synchronous result.</en></lang>
     */
    show(input) {
      // <lang><zh-CN>普通 show 不强制双 control，但仍拒绝无标签可见 control。</zh-CN><en>Ordinary show does not force dual controls but still rejects a visible unlabeled control.</en></lang>
      return dispatchShow(scope, 'modal', normalizeUModalOptions(input));
    },

    /**
     * @lang zh-CN 显示双 control confirm modal；输入必须为普通对象并提供非空 confirm/cancel 标签。
     * @lang en Shows a dual-control confirm modal; input must be a plain object with non-empty confirm/cancel labels.
     * @param {unknown} input <lang><zh-CN>有限 confirm modal options。</zh-CN><en>Finite confirm-modal options.</en></lang>
     * @returns {object} <lang><zh-CN>精确同步结果。</zh-CN><en>Precise synchronous result.</en></lang>
     */
    confirm(input) {
      // <lang><zh-CN>confirm 模式由内部固定标志选择，不接受调用方 mode 字符串或任意策略。</zh-CN><en>Confirm mode is selected by an internal fixed flag and accepts no caller mode string or arbitrary policy.</en></lang>
      return dispatchShow(scope, 'modal', normalizeUModalOptions(input, { confirm: true }));
    },

    /**
     * @lang zh-CN 关闭当前 modal；可选 expectedRequestId 提供 stale guard。
     * @lang en Closes the current modal with an optional expected-request stale guard.
     * @param {unknown} [expectedRequestId] <lang><zh-CN>可选 active request guard。</zh-CN><en>Optional active-request guard.</en></lang>
     * @returns {object} <lang><zh-CN>精确同步结果。</zh-CN><en>Precise synchronous result.</en></lang>
     */
    close(expectedRequestId = undefined) {
      // <lang><zh-CN>关闭只通知当前 scope 的 modal host，不触发路由、焦点或业务回调。</zh-CN><en>Close notifies only this scope's modal host and triggers no routing, focus, or business callback.</en></lang>
      return dispatchClose(scope, 'modal', expectedRequestId);
    },

    /**
     * @lang zh-CN 清除当前 modal 的 loading 呈现但不 settlement；可选 expectedRequestId 提供 stale guard。
     * @lang en Clears current modal loading presentation without settlement, with an optional expected-request stale guard.
     * @param {unknown} [expectedRequestId] <lang><zh-CN>可选 active request guard。</zh-CN><en>Optional active-request guard.</en></lang>
     * @returns {object} <lang><zh-CN>精确同步结果。</zh-CN><en>Precise synchronous result.</en></lang>
     */
    clearLoading(expectedRequestId = undefined) {
      // <lang><zh-CN>操作只转发有限编号，不改变 request 生命周期。</zh-CN><en>The operation forwards only a finite ID and does not change request lifecycle.</en></lang>
      return dispatchClearModalLoading(scope, expectedRequestId);
    }
  });
}
