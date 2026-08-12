/**
 * @module hia-uview-p68-feedback-service.runtime.test
 * @lang zh-CN 验证显式 scope feedback service 的有限 options、宿主替换、请求编号、stale guard、settlement 与 dispose 行为。测试不挂载组件，不创建全局单例、页面、DOM、UniApp、路由、网络、回调、计时器或持久化状态。
 * @lang en Verifies finite options, host replacement, request IDs, stale guards, settlement, and disposal for explicit-scope feedback services. Tests mount no component and create no global singleton, page, DOM, UniApp, router, network, callback, timer, or persistence state.
 */

// <lang><zh-CN>导入 Vitest 断言、三个公共 service 入口和仅供包内组件使用的宿主/规范化桥接。</zh-CN><en>Imports Vitest assertions, the three public service entries, and the host/normalization bridge used only by package-internal components.</en></lang>
import { describe, expect, it } from 'vitest';
import { createUFeedbackScope, useModal, useToast } from '../../HIA-uView-UI/src/services.mjs';
import {
  normalizeUModalOptions,
  normalizeUToastOptions,
  registerUFeedbackHost,
  settleUFeedbackRequest
} from '../../HIA-uView-UI/src/feedback-service-runtime.mjs';

/**
 * @lang zh-CN 作为必须被 options 白名单拒绝的测试回调值；production runtime 不得保存或执行它。
 * @lang en Serves as a callback value that the options allowlist must reject; production runtime must neither retain nor execute it.
 * @returns {undefined} <lang><zh-CN>若被测试代码直接调用则返回 undefined；runtime 不会调用。</zh-CN><en>Returns undefined if test code calls it directly; runtime never calls it.</en></lang>
 */
function forbiddenCallback() {
  // <lang><zh-CN>空返回使函数值不携带其他测试行为。</zh-CN><en>The empty return keeps the function value free of other test behavior.</en></lang>
  return undefined;
}

/**
 * @lang zh-CN 创建记录所有同步命令的普通 toast host，供测试观察 service 数据边界。
 * @lang en Creates a plain toast host recording every synchronous command so tests can observe the service data boundary.
 * @param {object} [configuration] <lang><zh-CN>仅测试使用的可选 show 抛错开关记录。</zh-CN><en>Optional test-only record containing the show-throw switch.</en></lang>
 * @returns {object} <lang><zh-CN>宿主、调用记录和有限测试开关记录。</zh-CN><en>Record containing the host, call log, and finite test switch.</en></lang>
 */
function createToastHost(configuration = {}) {
  // <lang><zh-CN>测试本地标志允许同一 host 先抛错再恢复，以证明失败 requestId 不被复用。</zh-CN><en>A test-local flag lets one host throw and then recover, proving that a failed request ID is not reused.</en></lang>
  let throwOnShow = configuration.throwOnShow === true;

  // <lang><zh-CN>三个数组与 release 计数只记录实际收到的同步命令。</zh-CN><en>Three arrays and a release count record only synchronous commands actually received.</en></lang>
  const calls = {
    shows: [],
    closes: [],
    releases: 0
  };

  // <lang><zh-CN>普通对象满足 runtime 对无 class prototype 宿主的约束。</zh-CN><en>A plain object satisfies the runtime constraint against class-prototype hosts.</en></lang>
  const host = {
    /**
     * @lang zh-CN 记录冻结 show request，或在测试开关打开时抛出隔离异常。
     * @lang en Records a frozen show request or throws an isolated error while the test switch is enabled.
     * @param {Readonly<object>} request <lang><zh-CN>服务派发的冻结请求。</zh-CN><en>Frozen request dispatched by the service.</en></lang>
     * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
     */
    show(request) {
      // <lang><zh-CN>异常分支模拟损坏宿主，service 必须转换为 host-unavailable。</zh-CN><en>The exception branch simulates a broken host that the service must convert to host-unavailable.</en></lang>
      if (throwOnShow) {
        throw new Error('test host failure');
      }

      // <lang><zh-CN>按接收顺序保存 request 引用，断言可检查冻结与单调编号。</zh-CN><en>Saves request references in receive order so assertions can inspect freezing and monotonic IDs.</en></lang>
      calls.shows.push(request);
    },

    /**
     * @lang zh-CN 记录 close 目标编号。
     * @lang en Records the close target ID.
     * @param {number} requestId <lang><zh-CN>当前或最近请求编号。</zh-CN><en>Current or latest request ID.</en></lang>
     * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
     */
    close(requestId) {
      // <lang><zh-CN>只记录有限数字，不模拟 UI、timer 或 callback。</zh-CN><en>Records the finite number only and simulates no UI, timer, or callback.</en></lang>
      calls.closes.push(requestId);
    },

    /**
     * @lang zh-CN 记录宿主所有权释放。
     * @lang en Records release of host ownership.
     * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
     */
    release() {
      // <lang><zh-CN>计数用于区分 replacement、旧 token 注销和 scope dispose。</zh-CN><en>The count distinguishes replacement, old-token unregister, and scope disposal.</en></lang>
      calls.releases += 1;
    }
  };

  /**
   * @lang zh-CN 切换测试 host 的 show 抛错行为，不改变 service 或 scope 状态。
   * @lang en Toggles test-host show throwing without changing service or scope state.
   * @param {boolean} value <lang><zh-CN>下一次调用是否抛错。</zh-CN><en>Whether the next call should throw.</en></lang>
   * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
   */
  function setThrowOnShow(value) {
    // <lang><zh-CN>测试 helper 只接受严格 true 作为开启值。</zh-CN><en>The test helper treats strict true as the enabled value.</en></lang>
    throwOnShow = value === true;
  }

  // <lang><zh-CN>返回对象只在测试进程内使用，不进入 production service options。</zh-CN><en>The returned object is used only in the test process and never enters production service options.</en></lang>
  return { host, calls, setThrowOnShow };
}

/**
 * @lang zh-CN 创建记录 show/close/clearLoading/release 的普通 modal host。
 * @lang en Creates a plain modal host recording show/close/clearLoading/release.
 * @returns {object} <lang><zh-CN>宿主与同步调用记录。</zh-CN><en>Host and synchronous call record.</en></lang>
 */
function createModalHost() {
  // <lang><zh-CN>独立数组确保每类命令可以精确断言且不依赖输出字符串。</zh-CN><en>Separate arrays allow precise assertions for each command without relying on output strings.</en></lang>
  const calls = {
    shows: [],
    closes: [],
    clearLoading: [],
    releases: 0
  };

  // <lang><zh-CN>普通宿主仅实现合同要求的四个同步方法。</zh-CN><en>The plain host implements only the four synchronous methods required by the contract.</en></lang>
  const host = {
    /**
     * @lang zh-CN 记录冻结 modal request。
     * @lang en Records a frozen modal request.
     * @param {Readonly<object>} request <lang><zh-CN>服务派发请求。</zh-CN><en>Service-dispatched request.</en></lang>
     * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
     */
    show(request) {
      // <lang><zh-CN>测试不解释 modal 内容或用户选择。</zh-CN><en>The test interprets neither modal content nor user choice.</en></lang>
      calls.shows.push(request);
    },

    /**
     * @lang zh-CN 记录 close 编号。
     * @lang en Records a close ID.
     * @param {number} requestId <lang><zh-CN>请求编号。</zh-CN><en>Request ID.</en></lang>
     * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
     */
    close(requestId) {
      // <lang><zh-CN>close 记录不触发 settlement，service 自身处理 active 标记。</zh-CN><en>The close record triggers no settlement; the service itself handles the active marker.</en></lang>
      calls.closes.push(requestId);
    },

    /**
     * @lang zh-CN 记录 clearLoading 编号。
     * @lang en Records a clearLoading ID.
     * @param {number} requestId <lang><zh-CN>请求编号。</zh-CN><en>Request ID.</en></lang>
     * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
     */
    clearLoading(requestId) {
      // <lang><zh-CN>只记录呈现命令，不模拟异步任务完成。</zh-CN><en>Records the presentation command only and simulates no asynchronous completion.</en></lang>
      calls.clearLoading.push(requestId);
    },

    /**
     * @lang zh-CN 记录 modal host 释放。
     * @lang en Records modal-host release.
     * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
     */
    release() {
      // <lang><zh-CN>计数只表达所有权结束次数。</zh-CN><en>The count expresses only how often ownership ended.</en></lang>
      calls.releases += 1;
    }
  };

  // <lang><zh-CN>返回 production-compatible host 与测试记录。</zh-CN><en>Returns the production-compatible host and test record.</en></lang>
  return { host, calls };
}

/**
 * @lang zh-CN 验证 toast/modal normalizer 只接受有限纯数据并产生不可变完整副本。
 * @lang en Verifies that toast/modal normalizers accept only finite plain data and produce immutable complete copies.
 */
describe('P68 feedback option normalization', () => {
  /**
   * @lang zh-CN 覆盖 toast 字符串、title/type 兼容、有限位置/时长以及未知 callback/url 拒绝。
   * @lang en Covers toast strings, title/type compatibility, finite position/duration, and rejection of unknown callback/URL fields.
   * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
   */
  it('normalizes finite toast data and rejects executable or unbounded input', () => {
    // <lang><zh-CN>字符串入口得到固定默认 tone/position/duration 与空 closeText。</zh-CN><en>The string entry receives fixed default tone/position/duration and empty closeText.</en></lang>
    const fromString = normalizeUToastOptions('  Saved locally  ');
    expect(fromString).toEqual({
      message: 'Saved locally',
      tone: 'info',
      loading: false,
      position: 'center',
      duration: 3000,
      closeText: ''
    });
    expect(Object.isFrozen(fromString)).toBe(true);

    // <lang><zh-CN>兼容 title/type 被收束为 canonical message/tone，输入对象未被保留。</zh-CN><en>Compatibility title/type are constrained to canonical message/tone and the input object is not retained.</en></lang>
    const compatibility = normalizeUToastOptions({
      title: '  Network warning  ',
      type: 'warning',
      position: 'top',
      duration: 60000,
      closeText: ' Close '
    });
    expect(compatibility).toEqual({
      message: 'Network warning',
      tone: 'warning',
      loading: false,
      position: 'top',
      duration: 60000,
      closeText: 'Close'
    });

    // <lang><zh-CN>空消息、越界 duration、未知 tone/position 与 callback/url 键都精确失败。</zh-CN><en>Blank messages, out-of-range durations, unknown tone/position, and callback/URL keys all fail precisely.</en></lang>
    expect(normalizeUToastOptions('   ')).toBeNull();
    expect(normalizeUToastOptions({ message: 'x', duration: 60001 })).toBeNull();
    expect(normalizeUToastOptions({ message: 'x', tone: 'fatal' })).toBeNull();
    expect(normalizeUToastOptions({ message: 'x', position: 'window' })).toBeNull();
    expect(normalizeUToastOptions({ message: 'x', callback: forbiddenCallback })).toBeNull();
    expect(normalizeUToastOptions({ message: 'x', url: '/next' })).toBeNull();
    expect(normalizeUToastOptions(['x'])).toBeNull();

    // <lang><zh-CN>三个恶意 Proxy/accessor 输入分别覆盖 getPrototypeOf、ownKeys 与 getter surface；normalizer 只能返回 null。</zh-CN><en>Three hostile Proxy/accessor inputs cover getPrototypeOf, ownKeys, and getter surfaces; the normalizer may return null only.</en></lang>
    const prototypeTrap = new Proxy({}, {
      /**
       * @lang zh-CN 模拟抛错的 Proxy getPrototypeOf trap。
       * @lang en Simulates a throwing Proxy getPrototypeOf trap.
       * @returns {never} <lang><zh-CN>始终抛错。</zh-CN><en>Always throws.</en></lang>
       */
      getPrototypeOf() {
        // <lang><zh-CN>固定异常仅用于验证 public exception containment。</zh-CN><en>The fixed exception verifies public exception containment only.</en></lang>
        throw new Error('prototype trap');
      }
    });
    const ownKeysTrap = new Proxy({}, {
      /**
       * @lang zh-CN 让 Proxy 通过 prototype 检查以抵达 ownKeys trap。
       * @lang en Lets the Proxy pass the prototype check to reach the ownKeys trap.
       * @returns {object} <lang><zh-CN>标准 Object prototype。</zh-CN><en>Standard Object prototype.</en></lang>
       */
      getPrototypeOf() {
        // <lang><zh-CN>只返回标准 prototype，不读取应用状态。</zh-CN><en>Returns only the standard prototype and reads no application state.</en></lang>
        return Object.prototype;
      },
      /**
       * @lang zh-CN 模拟抛错的 Proxy ownKeys trap。
       * @lang en Simulates a throwing Proxy ownKeys trap.
       * @returns {never} <lang><zh-CN>始终抛错。</zh-CN><en>Always throws.</en></lang>
       */
      ownKeys() {
        // <lang><zh-CN>固定异常仅用于验证 normalizer containment。</zh-CN><en>The fixed exception verifies normalizer containment only.</en></lang>
        throw new Error('ownKeys trap');
      }
    });
    const getterInput = {};
    Object.defineProperty(getterInput, 'message', {
      enumerable: true,
      /**
       * @lang zh-CN 模拟 options accessor；白名单验证必须在读取前拒绝它。
       * @lang en Simulates an options accessor that allowlist validation must reject before reading.
       * @returns {never} <lang><zh-CN>若被错误读取则抛错。</zh-CN><en>Throws if read incorrectly.</en></lang>
       */
      get() {
        // <lang><zh-CN>异常证明 getter 未从 public API 泄漏。</zh-CN><en>The exception proves that no getter leaks through the public API.</en></lang>
        throw new Error('message getter');
      }
    });
    expect(normalizeUToastOptions(prototypeTrap)).toBeNull();
    expect(normalizeUToastOptions(ownKeysTrap)).toBeNull();
    expect(normalizeUToastOptions(getterInput)).toBeNull();

    // <lang><zh-CN>合法 data descriptor Proxy 可被复制，但普通 `get` trap 绝不能执行；派发只消费冻结快照。</zh-CN><en>A Proxy with valid data descriptors may be copied, but its ordinary `get` trap must never execute; dispatch consumes only the frozen snapshot.</en></lang>
    let getTrapCalls = 0;
    const dataProxy = new Proxy({ message: '  Descriptor snapshot  ', duration: 0 }, {
      /**
       * @lang zh-CN 记录任何错误的普通属性读取。
       * @lang en Records any erroneous ordinary property read.
       * @param {object} target <lang><zh-CN>Proxy 目标。</zh-CN><en>Proxy target.</en></lang>
       * @param {string|symbol} key <lang><zh-CN>被读取键。</zh-CN><en>Key being read.</en></lang>
       * @param {object} receiver <lang><zh-CN>Proxy receiver。</zh-CN><en>Proxy receiver.</en></lang>
       * @returns {unknown} <lang><zh-CN>仅供失败诊断的原字段值。</zh-CN><en>Original field value for failure diagnosis only.</en></lang>
       */
      get(target, key, receiver) {
        // <lang><zh-CN>若 normalizer 退化为 record[key]，计数会使测试失败。</zh-CN><en>If the normalizer regresses to record[key], this counter makes the test fail.</en></lang>
        getTrapCalls += 1;
        return Reflect.get(target, key, receiver);
      }
    });
    expect(normalizeUToastOptions(dataProxy)).toEqual({
      message: 'Descriptor snapshot',
      tone: 'info',
      loading: false,
      position: 'center',
      duration: 0,
      closeText: ''
    });
    expect(getTrapCalls).toBe(0);
  });

  /**
   * @lang zh-CN 覆盖 display modal、有限 control 规则以及 confirm 强制双 control。
   * @lang en Covers display modals, finite control rules, and confirm-forced dual controls.
   * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
   */
  it('normalizes modal display and explicit dual-control confirmation', () => {
    // <lang><zh-CN>字符串 modal 只包含 display content 且不制造语言相关按钮。</zh-CN><en>A string modal contains display content only and invents no language-specific button.</en></lang>
    const display = normalizeUModalOptions('  Read-only notice  ');
    expect(display).toEqual({
      title: '',
      content: 'Read-only notice',
      confirmText: '',
      cancelText: '',
      showConfirmButton: false,
      showCancelButton: false,
      asyncClose: false,
      loading: false
    });
    expect(Object.isFrozen(display)).toBe(true);

    // <lang><zh-CN>confirm 模式覆盖隐藏标志，但保留两个调用方提供的非空标签。</zh-CN><en>Confirm mode overrides hidden flags while retaining both non-empty caller-supplied labels.</en></lang>
    const confirmation = normalizeUModalOptions({
      title: 'Delete local draft?',
      content: 'This affects only the current scope.',
      confirmText: 'Delete',
      cancelText: 'Keep',
      showConfirmButton: false,
      showCancelButton: false,
      asyncClose: true,
      loading: true
    }, { confirm: true });
    expect(confirmation.showConfirmButton).toBe(true);
    expect(confirmation.showCancelButton).toBe(true);
    expect(confirmation.asyncClose).toBe(true);
    expect(confirmation.loading).toBe(true);

    // <lang><zh-CN>confirm 字符串、缺失双标签、无内容、无标签可见按钮与 callback 键全部失败。</zh-CN><en>A confirm string, missing dual labels, empty content, an unlabeled visible button, and a callback key all fail.</en></lang>
    expect(normalizeUModalOptions('Confirm?', { confirm: true })).toBeNull();
    expect(normalizeUModalOptions({ content: 'Confirm?', confirmText: 'Yes' }, { confirm: true })).toBeNull();
    expect(normalizeUModalOptions({ title: ' ', content: ' ' })).toBeNull();
    expect(normalizeUModalOptions({ content: 'Display', showConfirmButton: true })).toBeNull();
    expect(normalizeUModalOptions({ content: 'Display', success: forbiddenCallback })).toBeNull();
  });
});

/**
 * @lang zh-CN 验证 toast controller 的显式 scope、typed helper、编号、stale guard 与无 host/无效输入结果。
 * @lang en Verifies explicit scope, typed helpers, IDs, stale guards, and missing-host/invalid-input results for the toast controller.
 */
describe('P68 scoped toast service runtime', () => {
  /**
   * @lang zh-CN 验证 invalid scope、missing host、invalid options 与 disposed scope 的有限失败原因。
   * @lang en Verifies finite failure reasons for invalid scope, missing host, invalid options, and disposed scope.
   * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
   */
  it('reports precise lifecycle and input failures without throwing', () => {
    // <lang><zh-CN>伪造对象从未进入 WeakMap，因此始终是 invalid-scope。</zh-CN><en>A forged object never entered the WeakMap and is therefore always invalid-scope.</en></lang>
    expect(useToast({}).show('Visible text')).toEqual({ accepted: false, reason: 'invalid-scope' });

    // <lang><zh-CN>即使通过合法实例泄漏 constructor，也没有模块私有令牌，所得对象不能进入 WeakMap 或冒充 factory scope。</zh-CN><en>Even when a constructor leaks through a valid instance, the module-private token is absent, so the resulting object cannot enter the WeakMap or impersonate a factory scope.</en></lang>
    const legitimateScope = createUFeedbackScope();
    const leakedConstructorScope = new legitimateScope.constructor();
    expect(Object.isFrozen(Object.getPrototypeOf(legitimateScope))).toBe(true);
    expect(useToast(leakedConstructorScope).show('Constructor forgery')).toEqual({ accepted: false, reason: 'invalid-scope' });

    // <lang><zh-CN>有效 scope 但未挂载 host 时不缓存 show 命令。</zh-CN><en>A valid scope without a mounted host does not cache a show command.</en></lang>
    const scope = createUFeedbackScope();
    const toast = useToast(scope);
    expect(toast.show('Visible text')).toEqual({ accepted: false, reason: 'host-unavailable' });

    // <lang><zh-CN>无效 options 在 host 缺失之前仍由 finite normalizer 明确拒绝。</zh-CN><en>Invalid options are explicitly rejected by the finite normalizer even before a host is present.</en></lang>
    expect(toast.show({ message: 'Visible text', callback: forbiddenCallback })).toEqual({ accepted: false, reason: 'invalid-options' });

    // <lang><zh-CN>public controller 将 Proxy trap 收束为 invalid-options，而不是向应用抛错。</zh-CN><en>The public controller contains a Proxy trap as invalid-options instead of throwing into the application.</en></lang>
    const trappedInput = new Proxy({}, {
      /**
       * @lang zh-CN 模拟 public controller 收到的 getPrototypeOf trap。
       * @lang en Simulates a getPrototypeOf trap received by the public controller.
       * @returns {never} <lang><zh-CN>始终抛错。</zh-CN><en>Always throws.</en></lang>
       */
      getPrototypeOf() {
        // <lang><zh-CN>固定异常必须被转换为 invalid-options。</zh-CN><en>The fixed exception must be converted to invalid-options.</en></lang>
        throw new Error('public controller trap');
      }
    });
    expect(toast.show(trappedInput)).toEqual({ accepted: false, reason: 'invalid-options' });

    // <lang><zh-CN>dispose 后所有 operation 都稳定报告 scope-disposed，不复活 scope。</zh-CN><en>After dispose, every operation stably reports scope-disposed without reviving the scope.</en></lang>
    scope.dispose();
    expect(toast.show('Later')).toEqual({ accepted: false, reason: 'scope-disposed' });
    expect(toast.close()).toEqual({ accepted: false, reason: 'scope-disposed' });
  });

  /**
   * @lang zh-CN 验证 typed helper 覆盖、loading 默认 duration、冻结请求、单调编号和 stale close。
   * @lang en Verifies typed-helper overrides, loading default duration, frozen requests, monotonic IDs, and stale close.
   * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
   */
  it('dispatches immutable typed requests with monotonic IDs and stale-safe close', () => {
    // <lang><zh-CN>显式 scope 与单一 toast host 是该测试唯一状态边界。</zh-CN><en>An explicit scope and one toast host are the test's only state boundary.</en></lang>
    const scope = createUFeedbackScope();
    const toastHost = createToastHost();
    registerUFeedbackHost(scope, 'toast', toastHost.host);
    const toast = useToast(scope);

    // <lang><zh-CN>success helper 覆盖合法 caller tone，并产生首个 requestId。</zh-CN><en>The success helper overrides a valid caller tone and produces the first request ID.</en></lang>
    const successResult = toast.success({ message: 'Saved', tone: 'error', position: 'bottom' });
    expect(successResult).toEqual({ accepted: true, requestId: 1 });
    expect(toastHost.calls.shows[0].options.tone).toBe('success');
    expect(Object.isFrozen(toastHost.calls.shows[0])).toBe(true);
    expect(Object.isFrozen(toastHost.calls.shows[0].options)).toBe(true);

    // <lang><zh-CN>loading helper 强制 loading 并在缺失 duration 时使用 0；显式 duration 则保留。</zh-CN><en>The loading helper forces loading and uses 0 when duration is absent; an explicit duration is preserved.</en></lang>
    const loadingResult = toast.loading({ message: 'Working', loading: false });
    const finiteLoadingResult = toast.loading({ message: 'Working briefly', duration: 900 });
    expect(loadingResult).toEqual({ accepted: true, requestId: 2 });
    expect(finiteLoadingResult).toEqual({ accepted: true, requestId: 3 });
    expect(toastHost.calls.shows[1].options).toMatchObject({ loading: true, duration: 0 });
    expect(toastHost.calls.shows[2].options).toMatchObject({ loading: true, duration: 900 });

    // <lang><zh-CN>Helper 覆盖不能掩盖调用方函数值；非法 loading 在分配编号和 host show 前被拒绝。</zh-CN><en>A helper override cannot hide a caller function value; invalid loading is rejected before ID allocation and host show.</en></lang>
    expect(toast.loading({ message: 'Unsafe loading', loading: forbiddenCallback })).toEqual({ accepted: false, reason: 'invalid-options' });
    expect(toastHost.calls.shows).toHaveLength(3);

    // <lang><zh-CN>有状态 Proxy 只在单次 snapshot 中被读取；helper 的 duration fallback 不能掩盖随后出现的非法 caller duration。</zh-CN><en>A stateful Proxy is read only within one snapshot; the helper's duration fallback cannot hide an invalid caller duration that appears there.</en></lang>
    let durationDescriptorReads = 0;
    const statefulDurationInput = new Proxy({ message: 'Stateful duration', duration: 0 }, {
      /**
       * @lang zh-CN 返回有状态 duration descriptor，模拟预探测与正式读取之间的 TOCTOU 输入。
       * @lang en Returns a stateful duration descriptor to model TOCTOU input between a preflight and formal read.
       * @param {object} target <lang><zh-CN>Proxy 目标。</zh-CN><en>Proxy target.</en></lang>
       * @param {string|symbol} key <lang><zh-CN>descriptor 键。</zh-CN><en>Descriptor key.</en></lang>
       * @returns {PropertyDescriptor|undefined} <lang><zh-CN>当前 data descriptor。</zh-CN><en>Current data descriptor.</en></lang>
       */
      getOwnPropertyDescriptor(target, key) {
        // <lang><zh-CN>非 duration 字段保持标准 descriptor；duration 首次即暴露非法函数，证明实现没有更早预探测。</zh-CN><en>Non-duration fields retain standard descriptors; duration exposes an invalid function on its first read, proving the implementation performs no earlier preflight.</en></lang>
        if (key !== 'duration') {
          return Reflect.getOwnPropertyDescriptor(target, key);
        }
        durationDescriptorReads += 1;
        return { configurable: true, enumerable: true, writable: true, value: forbiddenCallback };
      }
    });
    expect(toast.loading(statefulDurationInput)).toEqual({ accepted: false, reason: 'invalid-options' });
    expect(durationDescriptorReads).toBe(1);
    expect(toastHost.calls.shows).toHaveLength(3);

    // <lang><zh-CN>旧编号无法关闭当前第三个请求；当前编号成功后，无 expected 的重复 close 保持幂等。</zh-CN><en>An old ID cannot close the current third request; after the current ID succeeds, repeated close without expected remains idempotent.</en></lang>
    expect(toast.close(2)).toEqual({ accepted: false, reason: 'stale-request' });
    expect(toast.close(3)).toEqual({ accepted: true, requestId: 3 });
    expect(toast.close()).toEqual({ accepted: true, requestId: 3 });
    expect(toastHost.calls.closes).toEqual([3, 3]);
  });

  /**
   * @lang zh-CN 验证两个 scope 完全隔离，宿主替换会 release 旧宿主且旧 token 不影响新宿主。
   * @lang en Verifies complete isolation between two scopes and that replacement releases the old host while its old token cannot affect the new host.
   * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
   */
  it('isolates scopes and protects replacement with registration tokens', () => {
    // <lang><zh-CN>两个 scope 各自从 requestId 1 开始，且命令只进入各自 host。</zh-CN><en>Each of two scopes starts at request ID 1 and commands enter only its own host.</en></lang>
    const firstScope = createUFeedbackScope();
    const secondScope = createUFeedbackScope();
    const firstHost = createToastHost();
    const secondHost = createToastHost();

    // <lang><zh-CN>带 method getter trap 的伪 host 注册必须无异常失败，且不会遮蔽随后合法 host。</zh-CN><en>Registration of a fake host with a method-getter trap must fail without an exception and cannot shadow the later valid host.</en></lang>
    const trappedHost = {
      /**
       * @lang zh-CN 模拟 host method getter；注册必须在执行 getter 前拒绝 accessor。
       * @lang en Simulates a host-method getter that registration must reject before execution.
       * @returns {never} <lang><zh-CN>若被错误读取则抛错。</zh-CN><en>Throws if read incorrectly.</en></lang>
       */
      get show() {
        // <lang><zh-CN>异常用于证明 register 的 getter containment。</zh-CN><en>The exception proves getter containment during registration.</en></lang>
        throw new Error('host method getter');
      },
      /**
       * @lang zh-CN 提供其余固定方法以隔离 show accessor 失败。
       * @lang en Supplies the remaining fixed method to isolate failure of the show accessor.
       * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
       */
      close() {},
      /**
       * @lang zh-CN 提供空 release；无效注册不得调用它。
       * @lang en Supplies empty release, which invalid registration must not call.
       * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
       */
      release() {}
    };
    const unregisterTrapped = registerUFeedbackHost(firstScope, 'toast', trappedHost);
    unregisterTrapped();

    const unregisterFirst = registerUFeedbackHost(firstScope, 'toast', firstHost.host);
    registerUFeedbackHost(secondScope, 'toast', secondHost.host);

    expect(useToast(firstScope).info('First')).toEqual({ accepted: true, requestId: 1 });
    expect(useToast(secondScope).warning('Second')).toEqual({ accepted: true, requestId: 1 });
    expect(firstHost.calls.shows).toHaveLength(1);
    expect(secondHost.calls.shows).toHaveLength(1);

    // <lang><zh-CN>同 kind 后注册 host 立即取得所有权并 release 旧 host。</zh-CN><en>A later host for the same kind immediately takes ownership and releases the old host.</en></lang>
    const replacementHost = createToastHost();
    const unregisterReplacement = registerUFeedbackHost(firstScope, 'toast', replacementHost.host);
    expect(firstHost.calls.releases).toBe(1);

    // <lang><zh-CN>旧 token 注销不 release 或删除 replacement，后续 show 仍进入新 host。</zh-CN><en>Unregistering the old token neither releases nor deletes the replacement, and a later show still enters the new host.</en></lang>
    unregisterFirst();
    expect(replacementHost.calls.releases).toBe(0);
    expect(useToast(firstScope).error('Replacement')).toEqual({ accepted: true, requestId: 2 });
    expect(replacementHost.calls.shows).toHaveLength(1);

    // <lang><zh-CN>current token 第一次注销释放 host，第二次幂等；随后 operation 报告 unavailable。</zh-CN><en>The current token releases the host once and is idempotent on repetition; later operations report unavailable.</en></lang>
    unregisterReplacement();
    unregisterReplacement();
    expect(replacementHost.calls.releases).toBe(1);
    expect(useToast(firstScope).show('No host')).toEqual({ accepted: false, reason: 'host-unavailable' });
  });

  /**
   * @lang zh-CN 验证同一 host identity 重复注册只更新 token，不自我 release、不中断 active request，也不在派发时读取 Proxy 属性。
   * @lang en Verifies repeated registration of the same host identity renews only the token, never self-releases or interrupts the active request, and reads no Proxy property during dispatch.
   * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
   */
  it('renews the same host identity without self-release or proxy reads', () => {
    // <lang><zh-CN>Proxy 只包装固定 data methods；任何普通 get 都是 registry 快照回归。</zh-CN><en>The Proxy wraps only fixed data methods; any ordinary get indicates a registry-snapshot regression.</en></lang>
    const scope = createUFeedbackScope();
    const toastHost = createToastHost();
    let hostGetCalls = 0;
    const proxiedHost = new Proxy(toastHost.host, {
      /**
       * @lang zh-CN 记录 registry 对原 host 的普通属性读取。
       * @lang en Records ordinary registry property reads from the original host.
       * @param {object} target <lang><zh-CN>原 host。</zh-CN><en>Original host.</en></lang>
       * @param {string|symbol} key <lang><zh-CN>读取键。</zh-CN><en>Read key.</en></lang>
       * @param {object} receiver <lang><zh-CN>Proxy receiver。</zh-CN><en>Proxy receiver.</en></lang>
       * @returns {unknown} <lang><zh-CN>原字段值，仅供失败诊断。</zh-CN><en>Original field value for failure diagnosis only.</en></lang>
       */
      get(target, key, receiver) {
        // <lang><zh-CN>计数必须保持零；固定方法从 descriptor snapshot 调用。</zh-CN><en>The count must stay zero; fixed methods are invoked from the descriptor snapshot.</en></lang>
        hostGetCalls += 1;
        return Reflect.get(target, key, receiver);
      }
    });

    // <lang><zh-CN>首个 token 建立 host 与 active request 1。</zh-CN><en>The first token establishes the host and active request 1.</en></lang>
    const unregisterFirst = registerUFeedbackHost(scope, 'toast', proxiedHost);
    const toast = useToast(scope);
    expect(toast.show({ message: 'Active same host', duration: 0 })).toEqual({ accepted: true, requestId: 1 });

    // <lang><zh-CN>同 identity 第二次注册保持 request 1 active 且 release 计数为零。</zh-CN><en>A second registration of the same identity preserves request 1 as active and leaves release count at zero.</en></lang>
    const unregisterRenewed = registerUFeedbackHost(scope, 'toast', proxiedHost);
    expect(toastHost.calls.releases).toBe(0);
    expect(toast.close(1)).toEqual({ accepted: true, requestId: 1 });
    expect(hostGetCalls).toBe(0);

    // <lang><zh-CN>旧 token 无权删除续期 registration；新 token 最终只 release 一次。</zh-CN><en>The old token cannot remove the renewed registration; the new token ultimately releases exactly once.</en></lang>
    unregisterFirst();
    expect(toast.show('After renewal')).toEqual({ accepted: true, requestId: 2 });
    unregisterRenewed();
    unregisterRenewed();
    expect(toastHost.calls.releases).toBe(1);
    expect(hostGetCalls).toBe(0);
  });

  /**
   * @lang zh-CN 验证自然 settlement、重复 settlement 和宿主异常后的编号不复用。
   * @lang en Verifies natural settlement, repeated settlement, and non-reuse of IDs after a host exception.
   * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
   */
  it('settles only the active request and never reuses a failed request ID', () => {
    // <lang><zh-CN>首个 show 建立 active request 1，宿主 settlement 只清空该编号一次。</zh-CN><en>The first show establishes active request 1, and host settlement clears that ID only once.</en></lang>
    const scope = createUFeedbackScope();
    const toastHost = createToastHost();
    registerUFeedbackHost(scope, 'toast', toastHost.host);
    const toast = useToast(scope);
    expect(toast.show('Auto-finish')).toEqual({ accepted: true, requestId: 1 });
    expect(settleUFeedbackRequest(scope, 'toast', 1)).toEqual({ accepted: true, requestId: 1 });
    expect(settleUFeedbackRequest(scope, 'toast', 1)).toEqual({ accepted: false, reason: 'stale-request' });
    expect(toast.close(1)).toEqual({ accepted: false, reason: 'stale-request' });

    // <lang><zh-CN>第二个编号在宿主抛错时被消费但不 active；恢复后下一成功编号必须为 3。</zh-CN><en>The second ID is consumed but not active when the host throws; after recovery, the next successful ID must be 3.</en></lang>
    toastHost.setThrowOnShow(true);
    expect(toast.show('Host failure')).toEqual({ accepted: false, reason: 'host-unavailable' });
    toastHost.setThrowOnShow(false);
    expect(toast.show('Recovered')).toEqual({ accepted: true, requestId: 3 });
    expect(toastHost.calls.shows.at(-1).requestId).toBe(3);
  });
});

/**
 * @lang zh-CN 验证 modal controller 的 show/confirm/clearLoading/close 以及 scope dispose 对双宿主的释放。
 * @lang en Verifies modal-controller show/confirm/clearLoading/close and release of both hosts by scope disposal.
 */
describe('P68 scoped modal service runtime', () => {
  /**
   * @lang zh-CN 验证 confirm 只接收双 control 普通对象，clearLoading 不 settlement，close 使用 stale guard。
   * @lang en Verifies that confirm accepts only dual-control plain objects, clearLoading does not settle, and close uses a stale guard.
   * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
   */
  it('dispatches finite confirmation and idempotent loading commands', () => {
    // <lang><zh-CN>显式 modal host 记录全部有限同步命令。</zh-CN><en>The explicit modal host records every finite synchronous command.</en></lang>
    const scope = createUFeedbackScope();
    const modalHost = createModalHost();
    registerUFeedbackHost(scope, 'modal', modalHost.host);
    const modal = useModal(scope);

    // <lang><zh-CN>字符串只能走 display show；confirm 字符串和 callback 扩展均 invalid-options。</zh-CN><en>A string can use display show only; a confirm string and callback extension are both invalid-options.</en></lang>
    expect(modal.show('Local information')).toEqual({ accepted: true, requestId: 1 });
    expect(modal.confirm('Confirm?')).toEqual({ accepted: false, reason: 'invalid-options' });
    expect(modal.confirm({
      content: 'Confirm?',
      confirmText: 'Yes',
      cancelText: 'No',
      callback: forbiddenCallback
    })).toEqual({ accepted: false, reason: 'invalid-options' });

    // <lang><zh-CN>有效 confirm 分配下一编号并强制双 control。</zh-CN><en>A valid confirm allocates the next ID and forces both controls.</en></lang>
    const confirmResult = modal.confirm({
      title: 'Replace draft?',
      content: 'Only local state is affected.',
      confirmText: 'Replace',
      cancelText: 'Keep',
      showConfirmButton: false,
      showCancelButton: false,
      loading: true
    });
    expect(confirmResult).toEqual({ accepted: true, requestId: 2 });
    expect(modalHost.calls.shows[1].options).toMatchObject({
      showConfirmButton: true,
      showCancelButton: true,
      loading: true
    });

    // <lang><zh-CN>旧编号无法清除新 request loading；当前编号可重复清除且 active 仍可 settlement。</zh-CN><en>An old ID cannot clear loading for the new request; the current ID can be cleared repeatedly and remains active for settlement.</en></lang>
    expect(modal.clearLoading(1)).toEqual({ accepted: false, reason: 'stale-request' });
    expect(modal.clearLoading(2)).toEqual({ accepted: true, requestId: 2 });
    expect(modal.clearLoading()).toEqual({ accepted: true, requestId: 2 });
    expect(modalHost.calls.clearLoading).toEqual([2, 2]);
    expect(settleUFeedbackRequest(scope, 'modal', 2)).toEqual({ accepted: true, requestId: 2 });

    // <lang><zh-CN>settled 编号的 expected close 已 stale；省略 expected 的 close 对最近编号保持幂等。</zh-CN><en>Expected close for a settled ID is stale; close without expected remains idempotent for the latest ID.</en></lang>
    expect(modal.close(2)).toEqual({ accepted: false, reason: 'stale-request' });
    expect(modal.close()).toEqual({ accepted: true, requestId: 2 });
    expect(modal.close()).toEqual({ accepted: true, requestId: 2 });
    expect(modalHost.calls.closes).toEqual([2, 2]);
  });

  /**
   * @lang zh-CN 验证 scope.dispose 同时 release 当前 toast/modal host，旧 replacement 不重复释放，后续全部拒绝。
   * @lang en Verifies that scope.dispose releases current toast/modal hosts together, does not re-release an old replacement, and rejects every later operation.
   * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
   */
  it('releases current hosts exactly once when the explicit scope is disposed', () => {
    // <lang><zh-CN>同一 scope 显式登记两个独立 kind host。</zh-CN><en>One scope explicitly registers two independent kind hosts.</en></lang>
    const scope = createUFeedbackScope();
    const firstToastHost = createToastHost();
    const currentToastHost = createToastHost();
    const modalHost = createModalHost();
    registerUFeedbackHost(scope, 'toast', firstToastHost.host);
    registerUFeedbackHost(scope, 'toast', currentToastHost.host);
    registerUFeedbackHost(scope, 'modal', modalHost.host);

    // <lang><zh-CN>replacement 已释放 first host；dispose 只释放两个 current host。</zh-CN><en>Replacement already released the first host; dispose releases only the two current hosts.</en></lang>
    expect(firstToastHost.calls.releases).toBe(1);
    scope.dispose();
    scope.dispose();
    expect(firstToastHost.calls.releases).toBe(1);
    expect(currentToastHost.calls.releases).toBe(1);
    expect(modalHost.calls.releases).toBe(1);

    // <lang><zh-CN>两个既有 controller 入口都稳定拒绝，disposed scope 不能登记新宿主。</zh-CN><en>Both existing controller entries reject stably, and a disposed scope cannot register a new host.</en></lang>
    expect(useToast(scope).show('Later')).toEqual({ accepted: false, reason: 'scope-disposed' });
    expect(useModal(scope).show('Later')).toEqual({ accepted: false, reason: 'scope-disposed' });
    const lateHost = createToastHost();
    const unregisterLate = registerUFeedbackHost(scope, 'toast', lateHost.host);
    unregisterLate();
    expect(lateHost.calls.releases).toBe(0);
  });
});
