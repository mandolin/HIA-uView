/**
 * @module hia-uview-p67-upload.runtime.test
 * @lang zh-CN 使用真实 Vue runtime 验证 P67 UUpload 的 model 优先级、旧版 intent、精确 adapter context、唯一状态事件、并发陈旧、失败和卸载边界。测试不启动 chooser、文件读取、网络、凭据、缓存、timer、平台 API 或后端。
 * @lang en Uses the real Vue runtime to verify P67 UUpload model precedence, legacy intents, exact adapter contexts, the sole state event, concurrent staleness, failures, and unmount boundaries. Tests start no chooser, file read, network, credential, cache, timer, platform API, or backend.
 */

// <lang><zh-CN>导入真实 Vue identity wrapper、组件挂载器、Promise flush、断言与 UUpload；不安装平台 mock、router、store 或网络拦截器。</zh-CN><en>Imports real Vue identity wrappers, the component mount harness, promise flush, assertions, and UUpload; no platform mock, router, store, or network interceptor is installed.</en></lang>
import { flushPromises, mount } from '@vue/test-utils';
import { reactive, readonly } from 'vue';
import { describe, expect, it } from 'vitest';
import { UUpload } from '../../HIA-uView-UI/src/index.mjs';

/**
 * @lang zh-CN 创建由测试显式完成的 Promise，用于确定性验证 supersession、source/adapter 变化与卸载；不使用 timer。
 * @lang en Creates a promise completed explicitly by the test for deterministic supersession, source/adapter-change, and unmount verification without timers.
 * @returns {{promise:Promise<unknown>,resolve:function(unknown):void,reject:function(unknown):void}} <lang><zh-CN>冻结的 Promise 控制器。</zh-CN><en>Frozen promise controller.</en></lang>
 */
function createDeferred() {
  // <lang><zh-CN>resolve/reject 在 Promise constructor 内同步捕获；它们只由当前测试调用。</zh-CN><en>Resolve/reject are captured synchronously inside the Promise constructor and are called only by the current test.</en></lang>
  let resolvePromise;
  let rejectPromise;
  // <lang><zh-CN>executor 不执行文件、网络或时间副作用，只保存标准 settlement 函数。</zh-CN><en>The executor performs no file, network, or time side effect and only stores standard settlement functions.</en></lang>
  const promise = new Promise((resolve, reject) => {
    // <lang><zh-CN>局部赋值使测试能精确控制异步完成顺序。</zh-CN><en>Local assignment lets the test control asynchronous completion order exactly.</en></lang>
    resolvePromise = resolve;
    rejectPromise = reject;
  });
  // <lang><zh-CN>控制器冻结，避免测试本身替换 Promise 或 settlement 函数而产生假阳性。</zh-CN><en>The controller is frozen so the test itself cannot replace the promise or settlement functions and create a false positive.</en></lang>
  return Object.freeze({ promise, resolve: resolvePromise, reject: rejectPromise });
}

/** @lang zh-CN 验证 modelValue/files 所有权、legacy-first 顺序与 exact select context。 @lang en Verifies modelValue/files ownership, legacy-first ordering, and the exact select context. */
describe('P67 upload controlled source and select adapter', () => {
  /**
   * @lang zh-CN 验证显式 modelValue 优先、数组不被修改、select context 精确冻结，并且新数组按固定事件顺序写回。
   * @lang en Verifies explicit modelValue precedence, non-mutation of arrays, exact frozen select context, and fixed-order write-back of a new array.
   * @returns {Promise<void>} <lang><zh-CN>adapter settlement 与 Vue flush 完成后解决。</zh-CN><en>Resolves after adapter settlement and Vue flushing complete.</en></lang>
   */
  it('prefers explicit modelValue and emits legacy before exact adapter states', async () => {
    // <lang><zh-CN>两个输入数组含不同 label，以可视化证明 modelValue 优先；nextFiles 是唯一允许写回的新 identity。</zh-CN><en>The two input arrays carry different labels to visibly prove modelValue precedence; nextFiles is the only new identity eligible for write-back.</en></lang>
    const legacyFiles = [{ label: 'Legacy file' }];
    const modelFiles = [{ label: 'Model file' }];
    const nextFiles = [{ label: 'Adapter file' }];
    // <lang><zh-CN>顺序数组由公开 listener 与 adapter 方法共同记录，避免把每个 event 的独立数组误当跨事件顺序。</zh-CN><en>The order array is recorded jointly by public listeners and the adapter method so independent event arrays cannot be mistaken for cross-event order.</en></lang>
    const order = [];
    // <lang><zh-CN>context 只保存一次 select 入参供精确字段、freeze 与 identity 断言。</zh-CN><en>Context stores the sole select argument for exact-field, freeze, and identity assertions.</en></lang>
    let selectContext;
    // <lang><zh-CN>adapter 是纯调用方对象，只返回下一数组，不执行文件或网络行为。</zh-CN><en>The adapter is a plain caller object that only returns the next array and performs no file or network behavior.</en></lang>
    const adapter = {
      select(context) {
        // <lang><zh-CN>方法调用必须发生在 pending 后，且收到冻结 context。</zh-CN><en>The method call must occur after pending and receive a frozen context.</en></lang>
        order.push('adapter');
        selectContext = context;
        return nextFiles;
      }
    };
    // <lang><zh-CN>listener 直接记录 legacy、state 与 model update 的对外先后关系。</zh-CN><en>Listeners directly record the public ordering of legacy, state, and model-update events.</en></lang>
    const upload = mount(UUpload, {
      props: {
        visible: true,
        modelValue: modelFiles,
        files: legacyFiles,
        max: 3,
        selectText: 'Select',
        adapter,
        onSelect: () => order.push('legacy'),
        onAdapterState: (state) => order.push(state.status),
        'onUpdate:modelValue': () => order.push('update')
      }
    });

    // <lang><zh-CN>模板必须显示 modelValue 记录而不是 legacy fallback。</zh-CN><en>The template must display the modelValue record rather than the legacy fallback.</en></lang>
    expect(upload.get('.u-upload__file-label').text()).toBe('Model file');
    await upload.get('button.u-upload__select').trigger('click');
    await flushPromises();

    // <lang><zh-CN>legacy→pending→adapter→model update→succeeded 是稳定顺序。</zh-CN><en>Legacy-to-pending-to-adapter-to-model-update-to-succeeded is the stable order.</en></lang>
    expect(order).toEqual(['legacy', 'pending', 'adapter', 'update', 'succeeded']);
    // <lang><zh-CN>select context 只允许冻结的五字段集合；files 是冻结新容器但 record identity 保持。</zh-CN><en>The select context permits only its frozen five-field set; files is a new frozen container while record identity remains intact.</en></lang>
    expect(Object.keys(selectContext)).toEqual(['action', 'files', 'remainingSlots', 'event', 'requestId']);
    expect(selectContext.action).toBe('select');
    expect(selectContext.remainingSlots).toBe(2);
    expect(selectContext.requestId).toBe(1);
    expect(Object.isFrozen(selectContext)).toBe(true);
    expect(Object.isFrozen(selectContext.files)).toBe(true);
    expect(selectContext.files).toEqual(modelFiles);
    expect(selectContext.files).not.toBe(modelFiles);
    expect(selectContext.files[0]).toBe(modelFiles[0]);
    // <lang><zh-CN>adapter-state discriminant 与字段集合精确，model event 原样携带新数组。</zh-CN><en>The adapter-state discriminants and field sets are exact, and the model event carries the new array unchanged.</en></lang>
    expect(upload.emitted('adapter-state')).toEqual([
      [{ status: 'pending', action: 'select', requestId: 1 }],
      [{ status: 'succeeded', action: 'select', requestId: 1, updated: true }]
    ]);
    expect(upload.emitted('update:modelValue')).toEqual([[nextFiles]]);
    expect(upload.emitted('update:modelValue')[0][0]).toBe(nextFiles);
    // <lang><zh-CN>组件没有 push/splice 任一 caller input。</zh-CN><en>The component has pushed/spliced neither caller input.</en></lang>
    expect(modelFiles).toEqual([{ label: 'Model file' }]);
    expect(legacyFiles).toEqual([{ label: 'Legacy file' }]);
  });

  /**
   * @lang zh-CN 验证 modelValue 缺省时回退 files，而显式空 model 不读取 files；缺失 adapter 方法保持纯 legacy intent。
   * @lang en Verifies files fallback when modelValue is absent, explicit empty model isolation from files, and pure legacy intent when the adapter method is missing.
   * @returns {Promise<void>} <lang><zh-CN>两个实例交互完成后解决。</zh-CN><en>Resolves after interactions on both instances complete.</en></lang>
   */
  it('uses files only as an absent-model fallback and keeps missing adapters legacy-only', async () => {
    // <lang><zh-CN>未绑定 modelValue 时，旧 files 两项占用两个有限槽位。</zh-CN><en>When modelValue is unbound, two legacy files occupy two finite slots.</en></lang>
    const fallback = mount(UUpload, {
      props: { visible: true, files: [{ label: 'A' }, { label: 'B' }], max: 3, selectText: 'Select', adapter: {} }
    });
    await fallback.get('button.u-upload__select').trigger('click');
    expect(fallback.emitted('select')[0][0].remainingSlots).toBe(1);
    expect(fallback.emitted('adapter-state')).toBeUndefined();

    // <lang><zh-CN>显式空 modelValue 必须遮蔽已填满的 files，select 仍看到三个空槽位。</zh-CN><en>An explicit empty modelValue must shadow fully populated files, leaving all three select slots visible.</en></lang>
    const explicit = mount(UUpload, {
      props: { visible: true, modelValue: [], files: [{ label: 'A' }, { label: 'B' }, { label: 'C' }], max: 3, selectText: 'Select' }
    });
    await explicit.get('button.u-upload__select').trigger('click');
    expect(explicit.emitted('select')[0][0].remainingSlots).toBe(3);
    expect(explicit.findAll('.u-upload__file')).toHaveLength(0);
    expect(explicit.emitted('adapter-state')).toBeUndefined();
  });
});

/** @lang zh-CN 验证 file-action context、void 成功与原受控数组索引。 @lang en Verifies file-action context, void success, and original controlled-array indexing. */
describe('P67 upload exact file-action adapter context', () => {
  /**
   * @lang zh-CN 验证过滤不可读记录不会重编号 index，retry void 只完成而不写 model。
   * @lang en Verifies filtering an unreadable record does not renumber index and a void retry only completes without writing the model.
   * @returns {Promise<void>} <lang><zh-CN>retry settlement 完成后解决。</zh-CN><en>Resolves after retry settlement completes.</en></lang>
   */
  it('retains the original source index and treats void as a non-updating success', async () => {
    // <lang><zh-CN>第一项不可读但仍位于 controlled source；第二项 error record 的精确 index 必须为 1。</zh-CN><en>The first item is unreadable but remains in the controlled source; the second error record must retain exact index 1.</en></lang>
    const files = [{ label: '' }, { label: 'Retry file', status: 'error' }];
    // <lang><zh-CN>保存唯一 retry context，不执行真实重试。</zh-CN><en>Stores the sole retry context and performs no real retry.</en></lang>
    let retryContext;
    const adapter = {
      retry(context) {
        // <lang><zh-CN>undefined 是显式无 model 更新的成功结果。</zh-CN><en>Undefined is the explicit successful result with no model update.</en></lang>
        retryContext = context;
        return undefined;
      }
    };
    const upload = mount(UUpload, {
      props: { visible: true, modelValue: files, retryText: 'Retry', adapter }
    });
    await upload.get('button.u-upload__retry').trigger('click');
    await flushPromises();

    // <lang><zh-CN>file-action context 精确包含六字段并浅冻结；files 快照仍包含不可读原记录。</zh-CN><en>The file-action context contains exactly six fields and is shallow-frozen; its files snapshot still includes the original unreadable record.</en></lang>
    expect(Object.keys(retryContext)).toEqual(['action', 'files', 'file', 'index', 'event', 'requestId']);
    expect(retryContext.action).toBe('retry');
    expect(retryContext.files).toEqual(files);
    expect(retryContext.file).toBe(files[1]);
    expect(retryContext.index).toBe(1);
    expect(retryContext.requestId).toBe(1);
    expect(Object.isFrozen(retryContext)).toBe(true);
    expect(Object.isFrozen(retryContext.files)).toBe(true);
    // <lang><zh-CN>legacy retry 仍先发，void 不 emit model，terminal succeeded 明确 updated=false。</zh-CN><en>Legacy retry still emits first, void emits no model, and terminal succeeded explicitly reports updated=false.</en></lang>
    expect(upload.emitted('retry')[0][0].file).toBe(files[1]);
    expect(upload.emitted('update:modelValue')).toBeUndefined();
    expect(upload.emitted('adapter-state')).toEqual([
      [{ status: 'pending', action: 'retry', requestId: 1 }],
      [{ status: 'succeeded', action: 'retry', requestId: 1, updated: false }]
    ]);
  });
});

/** @lang zh-CN 验证 per-action latest、identity stale 与卸载静默。 @lang en Verifies per-action latest behavior, identity staleness, and silent unmount. */
describe('P67 upload adapter request lifecycle', () => {
  /**
   * @lang zh-CN 验证同 action 后发请求立即且只终止旧请求一次，旧 Promise 随后完成静默。
   * @lang en Verifies a later same-action request immediately terminates the older request exactly once and later old-promise completion stays silent.
   * @returns {Promise<void>} <lang><zh-CN>两个受控 Promise 按反序完成后解决。</zh-CN><en>Resolves after two controlled promises complete in reverse order.</en></lang>
   */
  it('makes only the latest request per action eligible and never duplicates stale', async () => {
    // <lang><zh-CN>两个 deferred 对应连续 preview 调用；不使用 timer 竞速。</zh-CN><en>Two deferreds correspond to consecutive preview calls and use no timer race.</en></lang>
    const first = createDeferred();
    const second = createDeferred();
    const deferreds = [first, second];
    // <lang><zh-CN>调用游标只从受限测试数组取 Promise。</zh-CN><en>The call cursor reads promises only from the constrained test array.</en></lang>
    let callIndex = 0;
    const adapter = {
      preview() {
        // <lang><zh-CN>每次调用获得独立 deferred，使 settlement 顺序由断言显式决定。</zh-CN><en>Every call receives an independent deferred so assertion code explicitly determines settlement order.</en></lang>
        const deferred = deferreds[callIndex];
        callIndex += 1;
        return deferred.promise;
      }
    };
    const files = [{ label: 'Preview file' }];
    const upload = mount(UUpload, {
      props: { visible: true, modelValue: files, previewText: 'Preview', adapter }
    });
    const preview = upload.get('button.u-upload__action');
    await preview.trigger('click');
    await preview.trigger('click');

    // <lang><zh-CN>第二次开始立即把 request 1 终止为唯一 stale，再产生 request 2 pending。</zh-CN><en>The second start immediately terminates request 1 with the sole stale state, then emits request 2 pending.</en></lang>
    expect(upload.emitted('adapter-state')).toEqual([
      [{ status: 'pending', action: 'preview', requestId: 1 }],
      [{ status: 'stale', action: 'preview', requestId: 1 }],
      [{ status: 'pending', action: 'preview', requestId: 2 }]
    ]);
    // <lang><zh-CN>旧 Promise 返回新数组也必须静默，不重复 stale 且不写 model。</zh-CN><en>Even when the old promise returns a new array, it must stay silent, not repeat stale, and not write the model.</en></lang>
    first.resolve([{ label: 'Old result' }]);
    await flushPromises();
    expect(upload.emitted('adapter-state')).toHaveLength(3);
    expect(upload.emitted('update:modelValue')).toBeUndefined();
    // <lang><zh-CN>最新 Promise 可以原样写回并形成 succeeded terminal。</zh-CN><en>The latest promise may write back unchanged and produce a succeeded terminal.</en></lang>
    const latestResult = [{ label: 'Latest result' }];
    second.resolve(latestResult);
    await flushPromises();
    expect(upload.emitted('update:modelValue')).toEqual([[latestResult]]);
    expect(upload.emitted('adapter-state').at(-1)).toEqual([{ status: 'succeeded', action: 'preview', requestId: 2, updated: true }]);
    expect(upload.emitted('adapter-state').filter(([state]) => state.status === 'stale')).toHaveLength(1);
  });

  /**
   * @lang zh-CN 验证 stale listener 同步重入同 action 时，外层新请求不会覆盖重入请求或错误调用 adapter。
   * @lang en Verifies synchronous same-action re-entry from a stale listener prevents the outer new request from overwriting the re-entrant request or wrongly calling the adapter.
   * @returns {Promise<void>} <lang><zh-CN>旧请求与重入请求 settlement 完成后解决。</zh-CN><en>Resolves after settlement of the old and re-entrant requests.</en></lang>
   */
  it('preserves a same-action request re-entered by the stale listener', async () => {
    // <lang><zh-CN>只有真正调用 adapter 的 request 1 与重入 request 3 各消费一个 deferred；被覆盖的 request 2 不得调用 adapter。</zh-CN><en>Only request 1 and re-entrant request 3 that truly call the adapter consume deferreds; overwritten request 2 must not call the adapter.</en></lang>
    const first = createDeferred();
    const reentered = createDeferred();
    const deferreds = [first, reentered];
    let adapterCalls = 0;
    const adapter = {
      preview() {
        // <lang><zh-CN>调用计数证明外层 request 2 在失去 latest ownership 后中止。</zh-CN><en>The call count proves outer request 2 aborts after losing latest ownership.</en></lang>
        const deferred = deferreds[adapterCalls];
        adapterCalls += 1;
        return deferred.promise;
      }
    };
    // <lang><zh-CN>button 引用在挂载后赋值；state listener 仅在第一次 stale 时同步触发一次重入。</zh-CN><en>The button reference is assigned after mount; the state listener synchronously triggers re-entry only on the first stale state.</en></lang>
    let preview;
    let didReenter = false;
    const upload = mount(UUpload, {
      props: {
        visible: true,
        modelValue: [{ label: 'File' }],
        previewText: 'Preview',
        adapter,
        onAdapterState: (state) => {
          // <lang><zh-CN>第一次 stale 来自 request 1；重入 click 会让 request 2 也 stale，并创建 request 3。</zh-CN><en>The first stale comes from request 1; the re-entrant click also makes request 2 stale and creates request 3.</en></lang>
          if (state.status === 'stale' && !didReenter) {
            didReenter = true;
            void preview.trigger('click');
          }
        }
      }
    });
    preview = upload.get('button.u-upload__action');
    await preview.trigger('click');
    await preview.trigger('click');
    await flushPromises();

    // <lang><zh-CN>request 2 只有 stale terminal、没有 pending；adapter 只被 request 1 与 request 3 调用。</zh-CN><en>Request 2 has only a stale terminal and no pending; the adapter is called only by requests 1 and 3.</en></lang>
    expect(upload.emitted('adapter-state')).toEqual([
      [{ status: 'pending', action: 'preview', requestId: 1 }],
      [{ status: 'stale', action: 'preview', requestId: 1 }],
      [{ status: 'stale', action: 'preview', requestId: 2 }],
      [{ status: 'pending', action: 'preview', requestId: 3 }]
    ]);
    expect(adapterCalls).toBe(2);
    // <lang><zh-CN>旧 request 1 settlement 静默；重入 request 3 保持唯一写回资格。</zh-CN><en>Settlement of old request 1 stays silent, while re-entrant request 3 retains sole write-back eligibility.</en></lang>
    first.resolve([{ label: 'Old' }]);
    await flushPromises();
    expect(upload.emitted('adapter-state')).toHaveLength(4);
    const latest = [{ label: 'Re-entered' }];
    reentered.resolve(latest);
    await flushPromises();
    expect(upload.emitted('update:modelValue')).toEqual([[latest]]);
    expect(upload.emitted('adapter-state').at(-1)).toEqual([{ status: 'succeeded', action: 'preview', requestId: 3, updated: true }]);
  });

  /**
   * @lang zh-CN 验证不同 action 不互相终止，并且 source/adapter identity 变化只在 settlement 产生最小 stale。
   * @lang en Verifies different actions do not terminate one another and source/adapter identity changes produce only minimal stale at settlement.
   * @returns {Promise<void>} <lang><zh-CN>四个 deferred 完成后解决。</zh-CN><en>Resolves after four deferreds complete.</en></lang>
   */
  it('isolates actions while rejecting changed source or adapter identities', async () => {
    // <lang><zh-CN>preview/remove 并行实例证明不同 action 可以各自成功。</zh-CN><en>The parallel preview/remove instance proves different actions may each succeed.</en></lang>
    const previewDeferred = createDeferred();
    const removeDeferred = createDeferred();
    const files = [{ label: 'File' }];
    const parallel = mount(UUpload, {
      props: {
        visible: true,
        modelValue: files,
        previewText: 'Preview',
        removeText: 'Remove',
        adapter: { preview: () => previewDeferred.promise, remove: () => removeDeferred.promise }
      }
    });
    const actions = parallel.findAll('button.u-upload__action');
    await actions[0].trigger('click');
    await actions[1].trigger('click');
    expect(parallel.emitted('adapter-state').map(([state]) => state)).toEqual([
      { status: 'pending', action: 'preview', requestId: 1 },
      { status: 'pending', action: 'remove', requestId: 2 }
    ]);
    previewDeferred.resolve(undefined);
    removeDeferred.resolve(undefined);
    await flushPromises();
    expect(parallel.emitted('adapter-state').filter(([state]) => state.status === 'stale')).toHaveLength(0);
    expect(parallel.emitted('adapter-state').filter(([state]) => state.status === 'succeeded')).toHaveLength(2);

    // <lang><zh-CN>source identity 在 preview pending 后换表，旧完成必须成为无附加原因字段的最小 stale。</zh-CN><en>Source identity is replaced while preview is pending, so the old completion must become minimal stale with no extra reason field.</en></lang>
    const sourceDeferred = createDeferred();
    const sourceStale = mount(UUpload, {
      props: { visible: true, modelValue: files, previewText: 'Preview', adapter: { preview: () => sourceDeferred.promise } }
    });
    await sourceStale.get('button.u-upload__action').trigger('click');
    await sourceStale.setProps({ modelValue: [{ label: 'Replacement' }] });
    sourceDeferred.resolve([{ label: 'Old source result' }]);
    await flushPromises();
    expect(sourceStale.emitted('adapter-state').at(-1)).toEqual([{ status: 'stale', action: 'preview', requestId: 1 }]);
    expect(Object.keys(sourceStale.emitted('adapter-state').at(-1)[0])).toEqual(['status', 'action', 'requestId']);
    expect(sourceStale.emitted('update:modelValue')).toBeUndefined();

    // <lang><zh-CN>adapter identity 在 remove pending 后替换，旧完成遵循同一 stale 边界。</zh-CN><en>Adapter identity is replaced while remove is pending, so old completion follows the same stale boundary.</en></lang>
    const adapterDeferred = createDeferred();
    const firstAdapter = { remove: () => adapterDeferred.promise };
    const adapterStale = mount(UUpload, {
      props: { visible: true, modelValue: files, removeText: 'Remove', adapter: firstAdapter }
    });
    await adapterStale.get('button.u-upload__action').trigger('click');
    await adapterStale.setProps({ adapter: { remove: () => undefined } });
    adapterDeferred.resolve(undefined);
    await flushPromises();
    expect(adapterStale.emitted('adapter-state').at(-1)).toEqual([{ status: 'stale', action: 'remove', requestId: 1 }]);
  });

  /**
   * @lang zh-CN 验证卸载后的 resolve/reject 都不产生 completion state、model update 或未处理 rejection。
   * @lang en Verifies resolve/reject after unmount produce no completion state, model update, or unhandled rejection.
   * @returns {Promise<void>} <lang><zh-CN>两个卸载实例 settlement 完成后解决。</zh-CN><en>Resolves after settlement of two unmounted instances.</en></lang>
   */
  it('keeps all adapter settlement silent after unmount', async () => {
    // <lang><zh-CN>外部数组保存卸载前后的 state listener 调用，避免依赖 wrapper DOM 生命周期。</zh-CN><en>An external array stores state-listener calls before and after unmount, avoiding dependence on wrapper DOM lifecycle.</en></lang>
    const states = [];
    const resolving = createDeferred();
    const resolveUpload = mount(UUpload, {
      props: { visible: true, modelValue: [{ label: 'A', status: 'error' }], retryText: 'Retry', adapter: { retry: () => resolving.promise }, onAdapterState: (state) => states.push(state) }
    });
    await resolveUpload.get('button.u-upload__retry').trigger('click');
    resolveUpload.unmount();
    resolving.resolve([{ label: 'After unmount' }]);
    await flushPromises();
    expect(states).toEqual([{ status: 'pending', action: 'retry', requestId: 1 }]);

    // <lang><zh-CN>reject 分支同样被内部 catch 收束，卸载后不新增 failed/stale。</zh-CN><en>The reject branch is likewise contained by the internal catch and adds neither failed nor stale after unmount.</en></lang>
    const rejecting = createDeferred();
    const rejectStates = [];
    const rejectUpload = mount(UUpload, {
      props: { visible: true, modelValue: [{ label: 'B' }], previewText: 'Preview', adapter: { preview: () => rejecting.promise }, onAdapterState: (state) => rejectStates.push(state) }
    });
    await rejectUpload.get('button.u-upload__action').trigger('click');
    rejectUpload.unmount();
    rejecting.reject(new Error('caller failure'));
    await flushPromises();
    expect(rejectStates).toEqual([{ status: 'pending', action: 'preview', requestId: 1 }]);
  });
});

/** @lang zh-CN 验证同步/异步/invalid result 的稳定 failed code 与双输入 identity guard。 @lang en Verifies stable failed codes for synchronous/asynchronous/invalid results and the two-input identity guard. */
describe('P67 upload strict adapter failures', () => {
  /**
   * @lang zh-CN 验证 method lookup throw、method throw 与 Promise reject 分别收束且不透传任意 cause。
   * @lang en Verifies method-lookup throw, method throw, and Promise rejection are contained without forwarding arbitrary causes.
   * @returns {Promise<void>} <lang><zh-CN>三个失败实例完成后解决。</zh-CN><en>Resolves after three failing instances complete.</en></lang>
   */
  it('reports stable throw and rejection codes without leaking causes', async () => {
    // <lang><zh-CN>getter throw 验证动态方法读取本身也不会形成未处理 async rejection。</zh-CN><en>A getter throw verifies dynamic method lookup itself cannot become an unhandled async rejection.</en></lang>
    const lookupAdapter = {};
    Object.defineProperty(lookupAdapter, 'select', { get() { throw new Error('secret lookup'); } });
    const lookup = mount(UUpload, { props: { visible: true, modelValue: [], selectText: 'Select', adapter: lookupAdapter } });
    await lookup.get('button.u-upload__select').trigger('click');
    await flushPromises();
    expect(lookup.emitted('adapter-state')).toEqual([
      [{ status: 'pending', action: 'select', requestId: 1 }],
      [{ status: 'failed', action: 'select', requestId: 1, failure: { code: 'adapter-threw' } }]
    ]);

    // <lang><zh-CN>普通同步 throw 使用同一稳定 code，failure 不含原 Error/message。</zh-CN><en>An ordinary synchronous throw uses the same stable code, and failure contains neither the original Error nor its message.</en></lang>
    const throwing = mount(UUpload, { props: { visible: true, modelValue: [], selectText: 'Select', adapter: { select() { throw new Error('secret throw'); } } } });
    await throwing.get('button.u-upload__select').trigger('click');
    await flushPromises();
    const thrownFailure = throwing.emitted('adapter-state').at(-1)[0];
    expect(thrownFailure).toEqual({ status: 'failed', action: 'select', requestId: 1, failure: { code: 'adapter-threw' } });
    expect(Object.isFrozen(thrownFailure)).toBe(true);
    expect(Object.isFrozen(thrownFailure.failure)).toBe(true);

    // <lang><zh-CN>Promise rejection 只暴露 adapter-rejected，不泄漏 caller reason。</zh-CN><en>Promise rejection exposes only adapter-rejected and does not leak the caller reason.</en></lang>
    const rejected = mount(UUpload, { props: { visible: true, modelValue: [], selectText: 'Select', adapter: { select: () => Promise.reject(new Error('secret rejection')) } } });
    await rejected.get('button.u-upload__select').trigger('click');
    await flushPromises();
    expect(rejected.emitted('adapter-state').at(-1)).toEqual([
      { status: 'failed', action: 'select', requestId: 1, failure: { code: 'adapter-rejected' } }
    ]);
  });

  /**
   * @lang zh-CN 验证 scalar/null 与调用开始时 modelValue/files 任一数组 identity 都是 invalid-result。
   * @lang en Verifies a scalar/null and either modelValue/files array identity from invocation start are invalid-result.
   * @returns {Promise<void>} <lang><zh-CN>四个独立实例完成后解决。</zh-CN><en>Resolves after four independent instances complete.</en></lang>
   */
  it('accepts only a genuinely new result array', async () => {
    // <lang><zh-CN>helper 仅创建一个返回指定结果的本地实例，不执行网络或文件副作用。</zh-CN><en>The helper only mounts a local instance returning a specified result and performs no network or file side effect.</en></lang>
    async function failedResult(resultFactory, modelValue, files) {
      // <lang><zh-CN>factory 在 adapter 调用时解析当前测试值，允许精确返回同一输入 identity。</zh-CN><en>The factory resolves the current test value at adapter invocation, allowing exact return of an input identity.</en></lang>
      const upload = mount(UUpload, { props: { visible: true, modelValue, files, max: 2, selectText: 'Select', adapter: { select: () => resultFactory() } } });
      await upload.get('button.u-upload__select').trigger('click');
      await flushPromises();
      return upload;
    }

    // <lang><zh-CN>scalar 与 null 不构成受控文件数组。</zh-CN><en>A scalar and null do not form controlled file arrays.</en></lang>
    const scalar = await failedResult(() => 1, [], []);
    const nullResult = await failedResult(() => null, [], []);
    expect(scalar.emitted('adapter-state').at(-1)[0].failure.code).toBe('invalid-result');
    expect(nullResult.emitted('adapter-state').at(-1)[0].failure.code).toBe('invalid-result');

    // <lang><zh-CN>active modelValue 原数组与 inactive files 原数组都不能冒充“新数组”。</zh-CN><en>Neither the active modelValue input array nor the inactive files input array may masquerade as a “new array.”</en></lang>
    const modelValue = [{ label: 'Model' }];
    const files = [{ label: 'Files' }];
    const sameModel = await failedResult(() => modelValue, modelValue, files);
    const sameFiles = await failedResult(() => files, modelValue, files);
    expect(sameModel.emitted('adapter-state').at(-1)[0].failure.code).toBe('invalid-result');
    expect(sameFiles.emitted('adapter-state').at(-1)[0].failure.code).toBe('invalid-result');
    expect(sameModel.emitted('update:modelValue')).toBeUndefined();
    expect(sameFiles.emitted('update:modelValue')).toBeUndefined();

    // <lang><zh-CN>Vue reactive/readonly wrapper 即使 strict identity 不同，也共享 caller source raw identity，必须与直接返回输入数组同样失败。</zh-CN><en>Even with different strict identities, Vue reactive/readonly wrappers share the caller source's raw identity and must fail exactly like directly returned input arrays.</en></lang>
    const proxySource = [{ label: 'Proxy source' }];
    const reactiveAlias = reactive(proxySource);
    const readonlyAlias = readonly(proxySource);
    const sameReactiveAlias = await failedResult(() => reactiveAlias, proxySource, []);
    const sameReadonlyAlias = await failedResult(() => readonlyAlias, proxySource, []);
    expect(sameReactiveAlias.emitted('adapter-state').at(-1)[0].failure.code).toBe('invalid-result');
    expect(sameReadonlyAlias.emitted('adapter-state').at(-1)[0].failure.code).toBe('invalid-result');
    expect(sameReactiveAlias.emitted('update:modelValue')).toBeUndefined();
    expect(sameReadonlyAlias.emitted('update:modelValue')).toBeUndefined();

    // <lang><zh-CN>等待期间替换 inactive files 后，adapter 返回该 settlement-time 输入 identity 也必须 invalid，而不是写回 active model。</zh-CN><en>After replacing inactive files while waiting, an adapter result equal to that settlement-time input identity must also be invalid rather than writing back the active model.</en></lang>
    const deferred = createDeferred();
    const currentInactiveFiles = [{ label: 'Current inactive files' }];
    const settlementIdentity = mount(UUpload, {
      props: { visible: true, modelValue, files, max: 2, selectText: 'Select', adapter: { select: () => deferred.promise } }
    });
    await settlementIdentity.get('button.u-upload__select').trigger('click');
    await settlementIdentity.setProps({ files: currentInactiveFiles });
    deferred.resolve(currentInactiveFiles);
    await flushPromises();
    expect(settlementIdentity.emitted('adapter-state').at(-1)[0].failure.code).toBe('invalid-result');
    expect(settlementIdentity.emitted('update:modelValue')).toBeUndefined();
  });

  /**
   * @lang zh-CN 验证 adapter/source/result 的 identity、snapshot 与 property Proxy trap 均形成稳定 terminal，且不产生未处理 rejection 或泄漏 cause。
   * @lang en Verifies identity, snapshot, and property Proxy traps from adapter/source/result all produce stable terminals without an unhandled rejection or leaked cause.
   * @returns {Promise<void>} <lang><zh-CN>四个 trap 实例与 rejection 观测完成后解决。</zh-CN><en>Resolves after four trap instances and rejection observation complete.</en></lang>
   */
  it('contains caller-controlled Proxy traps without cause or unhandled rejection', async () => {
    // <lang><zh-CN>显式监听当前测试期间的 Node unhandledRejection；finally 必须移除监听器，避免污染其他 runtime case。</zh-CN><en>Explicitly observes Node unhandledRejection during this test; finally must remove the listener to avoid contaminating other runtime cases.</en></lang>
    const unhandledReasons = [];
    const observeUnhandledRejection = (reason) => unhandledReasons.push(reason);
    process.on('unhandledRejection', observeUnhandledRejection);

    try {
      // <lang><zh-CN>adapter raw-identity trap 发生在 action getter 前；方法不得调用，状态只能是 pending→adapter-threw。</zh-CN><en>The adapter raw-identity trap occurs before action lookup; the method must not run and state may only be pending-to-adapter-threw.</en></lang>
      let adapterCalls = 0;
      let rejectAdapterIdentity = false;
      const hostileAdapter = new Proxy({ select: () => { adapterCalls += 1; } }, {
        get(target, property, receiver) {
          // <lang><zh-CN>挂载后才在 Vue raw identity 探测时抛出私密 cause；测试工具的 prop 安装仍读取真实目标。</zh-CN><en>Throws a private cause during Vue raw-identity inspection only after mount; test-harness prop installation still reads the real target.</en></lang>
          if (rejectAdapterIdentity && property === '__v_raw') throw new Error('secret adapter identity');
          return Reflect.get(target, property, receiver);
        }
      });
      const adapterTrap = mount(UUpload, { props: { visible: true, modelValue: [], selectText: 'Select', adapter: hostileAdapter } });
      rejectAdapterIdentity = true;
      await adapterTrap.get('button.u-upload__select').trigger('click');
      await flushPromises();
      expect(adapterCalls).toBe(0);
      expect(adapterTrap.emitted('adapter-state')).toEqual([
        [{ status: 'pending', action: 'select', requestId: 1 }],
        [{ status: 'failed', action: 'select', requestId: 1, failure: { code: 'adapter-threw' } }]
      ]);

      // <lang><zh-CN>active source identity trap 在 action-time capture 中失败关闭，并在存在 adapter 方法时形成同一稳定同步失败。</zh-CN><en>An active-source identity trap fails closed during action-time capture and becomes the same stable synchronous failure when an adapter method exists.</en></lang>
      let sourceAdapterCalls = 0;
      let rejectSourceIdentity = false;
      const hostileSource = new Proxy([], {
        get(target, property, receiver) {
          // <lang><zh-CN>挂载完成后 raw identity probe 才成为失败面；Array brand 与普通读取仍保持 caller Array 语义。</zh-CN><en>The raw-identity probe becomes the failing surface only after mount; Array brand and ordinary reads retain caller-Array semantics.</en></lang>
          if (rejectSourceIdentity && property === '__v_raw') throw new Error('secret source identity');
          return Reflect.get(target, property, receiver);
        }
      });
      const sourceIdentityTrap = mount(UUpload, { props: { visible: true, modelValue: hostileSource, selectText: 'Select', adapter: { select: () => { sourceAdapterCalls += 1; } } } });
      rejectSourceIdentity = true;
      await sourceIdentityTrap.get('button.u-upload__select').trigger('click');
      await flushPromises();
      expect(sourceAdapterCalls).toBe(0);
      expect(sourceIdentityTrap.emitted('adapter-state')).toEqual([
        [{ status: 'pending', action: 'select', requestId: 1 }],
        [{ status: 'failed', action: 'select', requestId: 1, failure: { code: 'adapter-threw' } }]
      ]);

      // <lang><zh-CN>source 可先正常渲染，再在 action snapshot 的 length 读取中抛错；组件不得调用 adapter 或冻结 caller source。</zh-CN><en>A source may render normally and then throw from the action snapshot's length read; the component must neither invoke the adapter nor freeze caller source.</en></lang>
      let rejectSnapshot = false;
      let snapshotAdapterCalls = 0;
      const snapshotSource = new Proxy([{ label: 'Snapshot source' }], {
        get(target, property, receiver) {
          // <lang><zh-CN>测试开关仅在挂载完成后启用，从而隔离 action snapshot 而不是 render projection。</zh-CN><en>The test switch activates only after mount, isolating the action snapshot rather than the render projection.</en></lang>
          if (rejectSnapshot && property === 'length') throw new Error('secret snapshot length');
          return Reflect.get(target, property, receiver);
        }
      });
      const snapshotTrap = mount(UUpload, { props: { visible: true, modelValue: snapshotSource, max: 2, selectText: 'Select', adapter: { select: () => { snapshotAdapterCalls += 1; } } } });
      rejectSnapshot = true;
      await snapshotTrap.get('button.u-upload__select').trigger('click');
      await flushPromises();
      expect(snapshotAdapterCalls).toBe(0);
      expect(Object.isFrozen(snapshotSource)).toBe(false);
      expect(snapshotTrap.emitted('adapter-state')).toEqual([
        [{ status: 'pending', action: 'select', requestId: 1 }],
        [{ status: 'failed', action: 'select', requestId: 1, failure: { code: 'adapter-threw' } }]
      ]);

      // <lang><zh-CN>完成值 raw-identity trap 属于不可验证结果，只公开 invalid-result，不读取数组元素或原始 cause。</zh-CN><en>A completion-value raw-identity trap is an unverifiable result and exposes only invalid-result without reading array items or the original cause.</en></lang>
      const hostileResult = new Proxy([{ label: 'Hostile result' }], {
        get(target, property, receiver) {
          // <lang><zh-CN>Promise assimilation 可读取 then；只有后续 raw identity 归一化失败。</zh-CN><en>Promise assimilation may read then; only the later raw-identity normalization fails.</en></lang>
          if (property === '__v_raw') throw new Error('secret result identity');
          return Reflect.get(target, property, receiver);
        }
      });
      const resultTrap = mount(UUpload, { props: { visible: true, modelValue: [], selectText: 'Select', adapter: { select: () => hostileResult } } });
      await resultTrap.get('button.u-upload__select').trigger('click');
      await flushPromises();
      const resultFailure = resultTrap.emitted('adapter-state').at(-1)[0];
      expect(resultTrap.emitted('adapter-state')).toEqual([
        [{ status: 'pending', action: 'select', requestId: 1 }],
        [{ status: 'failed', action: 'select', requestId: 1, failure: { code: 'invalid-result' } }]
      ]);
      expect(resultFailure).toEqual({ status: 'failed', action: 'select', requestId: 1, failure: { code: 'invalid-result' } });
      expect(Object.keys(resultFailure.failure)).toEqual(['code']);
      expect(resultTrap.emitted('update:modelValue')).toBeUndefined();

      // <lang><zh-CN>所有 caller causes 已在组件内收束，测试进程不应观察到任一未处理 rejection。</zh-CN><en>All caller causes have been contained inside the component, so the test process must observe no unhandled rejection.</en></lang>
      expect(unhandledReasons).toEqual([]);
    } finally {
      // <lang><zh-CN>无论断言是否通过都移除全局监听器，保持 runtime suite 隔离。</zh-CN><en>Removes the global listener regardless of assertion outcome, preserving runtime-suite isolation.</en></lang>
      process.off('unhandledRejection', observeUnhandledRejection);
    }
  });
});
