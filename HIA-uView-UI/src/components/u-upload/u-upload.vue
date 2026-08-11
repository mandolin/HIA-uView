<!--
@component UUpload
@lang zh-CN 提供调用方文件状态的受控列表、旧版 select/preview/remove/retry 意图与可选调用方 adapter 编排；组件不选择、读取、删除、上传、下载、缓存或处理文件字节，也不连接网络或平台 chooser。
@lang en Provides a controlled list of caller file states, legacy select/preview/remove/retry intents, and optional caller-adapter orchestration; the component does not select, read, delete, upload, download, cache, or process file bytes and does not connect to a network or platform chooser.
-->
<template>
  <!-- @lang zh-CN 只有 caller visible 且存在可读文件或可读 select action 时输出；每行及其状态文字均来自调用方数据。
  @lang en Outputs only when caller-visible and readable files or readable select action exist; every row and its status copy come from caller data.
  <lang><zh-CN>预览、删除和重试只报告当前调用方文件记录，不执行任何文件或网络操作。</zh-CN><en>Preview, remove, and retry report only the current caller file record and execute no file or network operation.</en></lang>
  -->
  <view v-if="isRenderable" class="u-upload" role="group" :aria-label="safeLabel">
    <view v-for="file in safeFiles" :key="file.key" class="u-upload__file"><view class="u-upload__file-copy"><text class="u-upload__file-label">{{ file.label }}</text><text v-if="file.description" class="u-upload__file-description">{{ file.description }}</text><text v-if="file.statusText" :class="statusClasses(file.status)">{{ file.statusText }}</text></view><view v-if="hasFileActions(file)" class="u-upload__file-actions"><button v-if="safePreviewText" class="u-upload__action" type="button" :disabled="disabled || file.disabled" @click="emitFileIntent('preview', file, $event)"><text>{{ safePreviewText }}</text></button><button v-if="safeRemoveText" class="u-upload__action" type="button" :disabled="disabled || file.disabled" @click="emitFileIntent('remove', file, $event)"><text>{{ safeRemoveText }}</text></button><button v-if="file.status === 'error' && safeRetryText" class="u-upload__retry" type="button" :disabled="disabled || file.disabled" @click="emitFileIntent('retry', file, $event)"><text>{{ safeRetryText }}</text></button></view></view>
    <button v-if="canSelect" class="u-upload__select" type="button" :disabled="disabled" @click="emitSelect"><text>{{ safeSelectText }}</text></button>
  </view>
</template>

<script setup>
import { computed, onBeforeUnmount, toRaw } from 'vue';

// <lang><zh-CN>稳定名称保留上传迁移入口；实现只管理 caller-projected file state 与显式 adapter 编排，而非文件生命周期服务。</zh-CN><en>The stable name retains an upload migration entry; the implementation manages only caller-projected file state and explicit adapter orchestration, not a file-lifecycle service.</en></lang>
defineOptions({ name: 'u-upload' });

// <lang><zh-CN>调用方拥有可见性、受控文件记录、adapter、最大显示槽数、标签和全部 action 文字；组件不接收 URL、binary、request 或平台 chooser 配置。</zh-CN><en>The caller owns visibility, controlled file records, adapter, maximum display slots, label, and all action copy; the component accepts no URL, binary, request, or platform-chooser configuration.</en></lang>
const props = defineProps({
  // <lang><zh-CN>可见性默认关闭，避免无请求地输出文件交互表面。</zh-CN><en>Visibility defaults off, avoiding output of a file-interaction surface without a request.</en></lang>
  visible: { type: Boolean, default: false },
  // <lang><zh-CN>显式 modelValue 是首选 caller-owned 文件列表；undefined 表示允许回退既有 files prop，其他无效显式值按空列表失败关闭。</zh-CN><en>An explicit modelValue is the preferred caller-owned file list; undefined permits fallback to the legacy files prop, while any other invalid explicit value fails closed as an empty list.</en></lang>
  modelValue: { type: Array, default: undefined },
  // <lang><zh-CN>files 是 modelValue 未提供时的旧版回退输入；两种数组都只投影有限显示记录并且从不被组件修改。</zh-CN><en>Files is the legacy fallback input when modelValue is absent; both arrays project only finite display records and are never modified by the component.</en></lang>
  files: { type: Array, default: () => [] },
  // <lang><zh-CN>adapter 只能由调用方注入 select/preview/remove/retry 方法；null 或缺失方法保持纯旧版 intent 行为。</zh-CN><en>The adapter may expose only caller-injected select/preview/remove/retry methods; null or a missing method preserves pure legacy-intent behavior.</en></lang>
  adapter: { type: Object, default: null },
  // <lang><zh-CN>max 只决定 caller 是否仍可请求 select intent，不表示 chooser、上传额度或持久化配额。</zh-CN><en>Max decides only whether the caller may still request select intent and represents no chooser, upload allowance, or persistence quota.</en></lang>
  max: { type: Number, default: 1 },
  // <lang><zh-CN>组标签与所有 action 文字由调用方本地化；空文字不输出对应 control。</zh-CN><en>Group label and all action copy are caller-localized; empty copy outputs no corresponding control.</en></lang>
  label: { type: String, default: '' },
  selectText: { type: String, default: '' },
  previewText: { type: String, default: '' },
  removeText: { type: String, default: '' },
  retryText: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
});

// <lang><zh-CN>旧版四个 intent 始终先发；adapter-state 是唯一异步状态事件，只有有效新数组才产生 model update。</zh-CN><en>The four legacy intents always emit first; adapter-state is the sole asynchronous state event, and only a valid new array produces a model update.</en></lang>
const emit = defineEmits(['select', 'preview', 'remove', 'retry', 'update:modelValue', 'adapter-state']);

// <lang><zh-CN>允许的显示状态仅影响固定样式类和 retry 输出资格，不解释真实上传进度或网络结果。</zh-CN><en>The allowed display states affect only fixed style classes and retry-output eligibility and do not interpret actual upload progress or network result.</en></lang>
const supportedStatuses = Object.freeze(['ready', 'pending', 'error']);

// <lang><zh-CN>adapter action 白名单同时约束动态读取、请求新旧覆盖和状态 payload，调用方无法借 prop 注入任意方法名。</zh-CN><en>The adapter-action allowlist constrains dynamic lookup, latest-request tracking, and state payloads together, so a caller cannot inject an arbitrary method name through props.</en></lang>
const supportedAdapterActions = Object.freeze(['select', 'preview', 'remove', 'retry']);

// <lang><zh-CN>每个 action 独立保存最近 request id；不同 action 可并行，同一 action 只有最新结果能写回。</zh-CN><en>Every action stores its latest request id independently; different actions may run concurrently, while only the latest result for one action may write back.</en></lang>
const latestRequestByAction = new Map();

// <lang><zh-CN>已发送 terminal stale 的 request id 保持到对应 Promise settlement，以确保后续完成静默而不重复 stale。</zh-CN><en>Request ids that already emitted terminal stale remain until their corresponding Promise settlements, ensuring later completion is silent rather than emitting stale twice.</en></lang>
const terminatedAdapterRequestIds = new Set();

// <lang><zh-CN>本地单调序号只用于一次组件实例内关联状态，不作为持久标识、网络 id 或跨挂载 identity。</zh-CN><en>The local monotonic sequence correlates state only within one component instance and is no persistent identifier, network id, or cross-mount identity.</en></lang>
let nextAdapterRequestId = 0;

// <lang><zh-CN>卸载标志阻止所有异步 settlement；已经同步发出的 legacy intent 与 pending 事实不会被撤回。</zh-CN><en>The unmount flag blocks every asynchronous settlement; legacy intent and pending facts already emitted synchronously are not retracted.</en></lang>
let acceptsAdapterSettlement = true;

/**
 * @lang zh-CN 在组件卸载前关闭 adapter settlement，并丢弃仅用于陈旧判定的本地 request 索引。
 * @lang en Closes adapter settlement before component unmount and discards the local request index used only for stale-result decisions.
 * @returns {void} <lang><zh-CN>无返回值；后续 Promise 完成保持静默。</zh-CN><en>No return value; later Promise completion remains silent.</en></lang>
 */
function stopAdapterSettlements() {
  // <lang><zh-CN>先关闭状态出口，再清理索引，避免卸载期间同步完成被误判为普通 stale。</zh-CN><en>Closes the state outlet before clearing the index so synchronous completion during unmount cannot be mistaken for ordinary stale state.</en></lang>
  acceptsAdapterSettlement = false;
  // <lang><zh-CN>Map 不持有文件、event 或 adapter，只持有四个有限 action 的数字 request id。</zh-CN><en>The map holds no file, event, or adapter, only numeric request ids for four finite actions.</en></lang>
  latestRequestByAction.clear();
  // <lang><zh-CN>卸载后所有旧 Promise 都必须静默，因此 terminal request 索引也可立即释放。</zh-CN><en>Every old promise must remain silent after unmount, so the terminal-request index can also be released immediately.</en></lang>
  terminatedAdapterRequestIds.clear();
}

// <lang><zh-CN>Vue 生命周期只注册具名清理函数，避免匿名副作用遗漏双语职责说明。</zh-CN><en>The Vue lifecycle registers only the named cleanup function, preventing an anonymous side effect from losing its bilingual responsibility statement.</en></lang>
onBeforeUnmount(stopAdapterSettlements);

/**
 * @lang zh-CN 将 Vue 只读/响应式 proxy identity 还原为 caller 提供的原始对象或数组 identity；primitive/null 原样返回。
 * @lang en Restores a Vue readonly/reactive proxy identity to the original caller-provided object or array identity while returning primitives/null unchanged.
 * @param {unknown} value <lang><zh-CN>可能由 Vue 包装的 prop 值。</zh-CN><en>Prop value that Vue may have wrapped.</en></lang>
 * @returns {unknown} <lang><zh-CN>caller 原始 identity 或原 primitive。</zh-CN><en>Original caller identity or unchanged primitive.</en></lang>
 */
function callerIdentity(value) {
  // <lang><zh-CN>只对 object 使用 toRaw，避免把 primitive 当作响应式容器解释。</zh-CN><en>Uses toRaw only for objects so a primitive is never interpreted as a reactive container.</en></lang>
  return value !== null && typeof value === 'object' ? toRaw(value) : value;
}

// <lang><zh-CN>undefined 是唯一允许 files 回退的哨兵；null 或其他无效显式输入不会静默读取旧列表。</zh-CN><en>Undefined is the sole sentinel that permits files fallback; null or another invalid explicit input never silently reads the legacy list.</en></lang>
const activeSourceIdentity = computed(() => callerIdentity(props.modelValue !== undefined ? props.modelValue : props.files));

// <lang><zh-CN>只有数组能成为受控 source；显式无效 identity 收束为空数组，但 identity 本身仍参与陈旧判定。</zh-CN><en>Only an array can become the controlled source; an explicitly invalid identity narrows to an empty array while the identity itself still participates in stale detection.</en></lang>
const activeSourceFiles = computed(() => Array.isArray(activeSourceIdentity.value) ? activeSourceIdentity.value : []);

/**
 * @lang zh-CN 将一个 caller 文件记录规范化为有限可读投影，并保留原始记录仅供原样事件回传；不可读 label 返回 null。
 * @lang en Normalizes one caller file record into a finite readable projection and retains the original record only for unchanged event return; an unreadable label returns null.
 * @param {unknown} file <lang><zh-CN>调用方文件状态记录或字符串快捷写法。</zh-CN><en>Caller file-state record or string shorthand.</en></lang>
 * @param {number} index <lang><zh-CN>受限集合索引，仅用于稳定模板键。</zh-CN><en>Bounded-collection index, used only for a stable template key.</en></lang>
 * @returns {{key: string, index: number, label: string, description: string, status: string, statusText: string, disabled: boolean, source: unknown}|null} <lang><zh-CN>包含原受控数组索引的规范化记录或 null。</zh-CN><en>Normalized record carrying its original controlled-array index, or null.</en></lang>
 */
function normalizeFile(file, index) {
  // <lang><zh-CN>先恢复 caller record identity；对象只读取显示字段，原始字符串/数值只形成透明 label 快捷写法且不被视为路径或二进制。</zh-CN><en>Restores caller-record identity first; objects expose display fields only, while primitive strings/numbers form transparent label shorthand and are not treated as paths or binary.</en></lang>
  const originalFile = callerIdentity(file);
  const source = originalFile !== null && typeof originalFile === 'object' ? originalFile : { label: originalFile };
  // <lang><zh-CN>label 优先于 name；空候选不会自动构造路径、序号或文件名。</zh-CN><en>Label takes precedence over name; an empty candidate does not fabricate a path, sequence, or filename.</en></lang>
  const candidateLabel = source.label ?? source.name ?? '';
  // <lang><zh-CN>仅显式 string/number 可成为可读标签，其他值失败关闭。</zh-CN><en>Only an explicit string or number can become readable copy; every other value fails closed.</en></lang>
  const label = typeof candidateLabel === 'string' || typeof candidateLabel === 'number' ? String(candidateLabel) : '';
  // <lang><zh-CN>不可读记录不进入显示和 action surface，但原 caller 数组保持不变。</zh-CN><en>An unreadable record enters neither display nor action surface, while the original caller array remains unchanged.</en></lang>
  if (label.trim().length === 0) return null;
  // <lang><zh-CN>description 只接受 string，避免对象隐式字符串化暴露调用方结构。</zh-CN><en>Description accepts only a string, avoiding implicit object stringification that could expose caller structure.</en></lang>
  const candidateDescription = source.description ?? '';
  const description = typeof candidateDescription === 'string' ? candidateDescription : '';
  // <lang><zh-CN>未知状态回退 ready，仅影响样式和 retry 资格。</zh-CN><en>An unknown status falls back to ready and affects only styling and retry eligibility.</en></lang>
  const status = supportedStatuses.includes(source.status) ? source.status : 'ready';
  // <lang><zh-CN>状态文字同样只接受 string，不从 status 猜测网络文案。</zh-CN><en>Status copy likewise accepts only a string and is never inferred as network copy from status.</en></lang>
  const candidateStatusText = source.statusText ?? '';
  const statusText = typeof candidateStatusText === 'string' ? candidateStatusText : '';
  // <lang><zh-CN>冻结的是内部投影；原始 caller record 只作为 opaque source 原样回传。</zh-CN><en>Only the internal projection is frozen; the original caller record is returned unchanged as an opaque source.</en></lang>
  return Object.freeze({ key: `file-${index}`, index, label, description, status, statusText, disabled: Boolean(source.disabled), source: originalFile });
}

// <lang><zh-CN>最多十二项的有限投影阻止组件被误用作无限文件目录、上传队列或缓存。</zh-CN><en>The at-most-twelve finite projection prevents misuse of the component as an unbounded file directory, upload queue, or cache.</en></lang>
const safeFiles = computed(() => activeSourceFiles.value.slice(0, 12).map(normalizeFile).filter((file) => file !== null));

// <lang><zh-CN>max 收束为 1–12 的整数，使剩余 select 槽位与可见列表保持同一有限范围。</zh-CN><en>Max is constrained to an integer from one to twelve so remaining select slots and visible list share the same finite range.</en></lang>
const safeMax = computed(() => Number.isFinite(props.max) ? Math.round(Math.min(12, Math.max(1, props.max))) : 1);

// <lang><zh-CN>用户可见文字只接受明确字符串，避免不匹配 prop 变成对象文案或无标签 button。</zh-CN><en>User-visible copy accepts explicit strings only, preventing mismatched props from becoming object copy or unlabeled buttons.</en></lang>
const safeLabel = computed(() => typeof props.label === 'string' ? props.label : '');
const safeSelectText = computed(() => typeof props.selectText === 'string' ? props.selectText : '');
const safePreviewText = computed(() => typeof props.previewText === 'string' ? props.previewText : '');
const safeRemoveText = computed(() => typeof props.removeText === 'string' ? props.removeText : '');
const safeRetryText = computed(() => typeof props.retryText === 'string' ? props.retryText : '');

// <lang><zh-CN>只有 caller 提供 select 文字且有限槽位未满时生成 select control。</zh-CN><en>Creates a select control only when the caller provides select copy and finite slots are not full.</en></lang>
const canSelect = computed(() => safeSelectText.value.trim().length > 0 && safeFiles.value.length < safeMax.value);

// <lang><zh-CN>无文件时仍可显示明确 select action；两者皆无则不输出空上传容器。</zh-CN><en>An explicit select action may display with no files; when neither exists, no empty upload container outputs.</en></lang>
const isRenderable = computed(() => props.visible && (safeFiles.value.length > 0 || canSelect.value));

/**
 * @lang zh-CN 判断一个文件行是否存在至少一个 caller-labeled 本地 action；error retry 仍需要显式 retryText。
 * @lang en Determines whether a file row has at least one caller-labeled local action; error retry still requires explicit retryText.
 * @param {{status: string}} file <lang><zh-CN>已规范化文件记录。</zh-CN><en>Normalized file record.</en></lang>
 * @returns {boolean} <lang><zh-CN>存在可输出 action 时为 true。</zh-CN><en>`true` when an output action exists.</en></lang>
 */
function hasFileActions(file) {
  // <lang><zh-CN>动作资格只取决于 caller 文案和固定 status，不读取文件内容、网络进度或平台状态。</zh-CN><en>Action eligibility depends only on caller copy and fixed status and reads no file content, network progress, or platform state.</en></lang>
  return safePreviewText.value.trim().length > 0 || safeRemoveText.value.trim().length > 0 || (file.status === 'error' && safeRetryText.value.trim().length > 0);
}

/**
 * @lang zh-CN 生成固定状态类；状态文字和 caller 数据从不进入 CSS class。
 * @lang en Produces fixed status classes; status copy and caller data never enter a CSS class.
 * @param {string} status <lang><zh-CN>已规范化状态。</zh-CN><en>Normalized status.</en></lang>
 * @returns {string[]} <lang><zh-CN>固定命名空间和状态类。</zh-CN><en>Fixed namespace and status classes.</en></lang>
 */
function statusClasses(status) {
  // <lang><zh-CN>状态仅来自受限集合；未知状态已在规范化阶段回退 ready。</zh-CN><en>Status comes only from the bounded set; unknown status has already fallen back to ready during normalization.</en></lang>
  return ['u-upload__status', `u-upload__status--${status}`];
}

/**
 * @lang zh-CN 构造 adapter 可读的冻结文件快照；只复制数组容器，不克隆或解释 caller record。
 * @lang en Builds the frozen file snapshot readable by an adapter; it copies only the array container and neither clones nor interprets caller records.
 * @param {unknown[]} files <lang><zh-CN>当前受控 source 数组。</zh-CN><en>Current controlled source array.</en></lang>
 * @returns {ReadonlyArray<unknown>} <lang><zh-CN>浅冻结的新数组快照。</zh-CN><en>A newly allocated shallow-frozen array snapshot.</en></lang>
 */
function createFileSnapshot(files) {
  // <lang><zh-CN>新容器防止 adapter 通过 push/splice 修改 caller 数组；record identity 保持透明。</zh-CN><en>The new container prevents an adapter from mutating the caller array through push/splice while record identities remain transparent.</en></lang>
  return Object.freeze(files.slice());
}

/**
 * @lang zh-CN 为 select 构造字段集合精确且浅冻结的 adapter context。
 * @lang en Builds an exact-field, shallow-frozen adapter context for select.
 * @param {ReadonlyArray<unknown>} files <lang><zh-CN>冻结文件快照。</zh-CN><en>Frozen file snapshot.</en></lang>
 * @param {number} remainingSlots <lang><zh-CN>当前有限剩余槽位。</zh-CN><en>Current finite remaining-slot count.</en></lang>
 * @param {unknown} event <lang><zh-CN>原始本地交互事件。</zh-CN><en>Original local interaction event.</en></lang>
 * @param {number} requestId <lang><zh-CN>组件实例内 request id。</zh-CN><en>Component-instance-local request id.</en></lang>
 * @returns {Readonly<{action: 'select', files: ReadonlyArray<unknown>, remainingSlots: number, event: unknown, requestId: number}>} <lang><zh-CN>精确 select context。</zh-CN><en>Exact select context.</en></lang>
 */
function createSelectContext(files, remainingSlots, event, requestId) {
  // <lang><zh-CN>对象不包含 URL、header、token、bytes、chooser 配置或任意业务字段。</zh-CN><en>The object contains no URL, header, token, bytes, chooser configuration, or arbitrary business field.</en></lang>
  return Object.freeze({ action: 'select', files, remainingSlots, event, requestId });
}

/**
 * @lang zh-CN 为 preview/remove/retry 构造字段集合精确且浅冻结的 adapter context。
 * @lang en Builds an exact-field, shallow-frozen adapter context for preview/remove/retry.
 * @param {'preview'|'remove'|'retry'} action <lang><zh-CN>当前 file action。</zh-CN><en>Current file action.</en></lang>
 * @param {ReadonlyArray<unknown>} files <lang><zh-CN>冻结文件快照。</zh-CN><en>Frozen file snapshot.</en></lang>
 * @param {unknown} file <lang><zh-CN>当前 opaque caller record。</zh-CN><en>Current opaque caller record.</en></lang>
 * @param {number} index <lang><zh-CN>记录在原受控 source 数组中的索引。</zh-CN><en>Record index in the original controlled source array.</en></lang>
 * @param {unknown} event <lang><zh-CN>原始本地交互事件。</zh-CN><en>Original local interaction event.</en></lang>
 * @param {number} requestId <lang><zh-CN>组件实例内 request id。</zh-CN><en>Component-instance-local request id.</en></lang>
 * @returns {Readonly<{action: 'preview'|'remove'|'retry', files: ReadonlyArray<unknown>, file: unknown, index: number, event: unknown, requestId: number}>} <lang><zh-CN>精确 file-action context。</zh-CN><en>Exact file-action context.</en></lang>
 */
function createFileActionContext(action, files, file, index, event, requestId) {
  // <lang><zh-CN>对象只携带现有 caller record，不生成文件路径、binary handle 或持久化 identity。</zh-CN><en>The object carries only the existing caller record and creates no file path, binary handle, or persistent identity.</en></lang>
  return Object.freeze({ action, files, file, index, event, requestId });
}

/**
 * @lang zh-CN 发送唯一 adapter-state 事件，并冻结状态对象以保持 discriminant 与字段集合稳定。
 * @lang en Emits the sole adapter-state event and freezes the state object to keep its discriminant and field set stable.
 * @param {object} state <lang><zh-CN>已按 pending/succeeded/stale/failed 构造的状态。</zh-CN><en>State constructed as pending/succeeded/stale/failed.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；卸载后保持静默。</zh-CN><en>No return value; remains silent after unmount.</en></lang>
 */
function emitAdapterState(state) {
  // <lang><zh-CN>生命周期 guard 是所有 settlement 的最终出口，防止卸载后泄漏事件。</zh-CN><en>The lifecycle guard is the final outlet for every settlement and prevents event leakage after unmount.</en></lang>
  if (!acceptsAdapterSettlement) return;
  // <lang><zh-CN>每个公开状态 payload 浅冻结；failed 的 failure 子对象由调用点单独冻结。</zh-CN><en>Every public state payload is shallow-frozen; a failed state's failure child is frozen separately at its call site.</en></lang>
  emit('adapter-state', Object.freeze(state));
}

/**
 * @lang zh-CN 判断指定 request 是否仍拥有写回资格；卸载、同 action 后发请求、source identity 或 adapter identity 变化都会失去资格。
 * @lang en Determines whether a request still owns write-back eligibility; unmount, a later same-action request, source-identity change, or adapter-identity change removes eligibility.
 * @param {'select'|'preview'|'remove'|'retry'} action <lang><zh-CN>受限 adapter action。</zh-CN><en>Constrained adapter action.</en></lang>
 * @param {number} requestId <lang><zh-CN>待核对 request id。</zh-CN><en>Request id to verify.</en></lang>
 * @param {unknown} sourceIdentity <lang><zh-CN>调用开始时的原始 modelValue/files identity。</zh-CN><en>Raw modelValue/files identity at invocation start.</en></lang>
 * @param {object} adapterIdentity <lang><zh-CN>调用开始时的 adapter identity。</zh-CN><en>Adapter identity at invocation start.</en></lang>
 * @returns {boolean} <lang><zh-CN>仍可 settlement 时为 true。</zh-CN><en>`true` while settlement remains eligible.</en></lang>
 */
function isCurrentAdapterRequest(action, requestId, sourceIdentity, adapterIdentity) {
  // <lang><zh-CN>四项 identity/生命周期条件必须同时成立；测试不依赖时间或取消 API。</zh-CN><en>All four identity/lifecycle conditions must hold together; tests depend on neither time nor a cancellation API.</en></lang>
  return acceptsAdapterSettlement
    && latestRequestByAction.get(action) === requestId
    && activeSourceIdentity.value === sourceIdentity
    && callerIdentity(props.adapter) === adapterIdentity;
}

/**
 * @lang zh-CN 对已经完成或失败的非当前 request 发送最小 stale 状态；卸载保持完全静默。
 * @lang en Emits the minimal stale state for a completed or failed non-current request; unmount remains completely silent.
 * @param {'select'|'preview'|'remove'|'retry'} action <lang><zh-CN>受限 adapter action。</zh-CN><en>Constrained adapter action.</en></lang>
 * @param {number} requestId <lang><zh-CN>陈旧 request id。</zh-CN><en>Stale request id.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；状态字段固定为三项。</zh-CN><en>No return value; the state has exactly three fields.</en></lang>
 */
function emitStaleAdapterState(action, requestId) {
  // <lang><zh-CN>先释放仍由该 request 占有的 latest 索引，避免 stale listener 重入时把 terminal request 再次判为 active。</zh-CN><en>Releases any latest index still owned by this request before emission so stale-listener re-entry cannot treat a terminal request as active again.</en></lang>
  clearCurrentAdapterRequest(action, requestId);
  // <lang><zh-CN>stale 不披露 source、adapter、event 或错误对象，也不区分可能同时成立的陈旧原因。</zh-CN><en>Stale discloses no source, adapter, event, or error object and does not distinguish potentially concurrent stale causes.</en></lang>
  emitAdapterState({ status: 'stale', action, requestId });
}

/**
 * @lang zh-CN 在 request 仍为当前项时清理其 action 索引，避免旧 completion 删除后发 request。
 * @lang en Clears an action index only while the request is still current, preventing an old completion from deleting a later request.
 * @param {'select'|'preview'|'remove'|'retry'} action <lang><zh-CN>受限 adapter action。</zh-CN><en>Constrained adapter action.</en></lang>
 * @param {number} requestId <lang><zh-CN>完成的 request id。</zh-CN><en>Completed request id.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function clearCurrentAdapterRequest(action, requestId) {
  // <lang><zh-CN>严格相等 guard 保留同 action 的后发调用。</zh-CN><en>The strict-equality guard preserves a later call for the same action.</en></lang>
  if (latestRequestByAction.get(action) === requestId) latestRequestByAction.delete(action);
}

/**
 * @lang zh-CN 分配一个新的 per-action request，并在新请求开始时把仍 active 的旧请求终止为且仅为一次 stale。
 * @lang en Allocates a new per-action request and terminates any still-active older request with exactly one stale state when the new request begins.
 * @param {'select'|'preview'|'remove'|'retry'} action <lang><zh-CN>受限 adapter action。</zh-CN><en>Constrained adapter action.</en></lang>
 * @returns {number|null} <lang><zh-CN>新 request id；stale listener 同步卸载组件时返回 null。</zh-CN><en>New request id, or null when a stale listener synchronously unmounts the component.</en></lang>
 */
function beginAdapterRequest(action) {
  // <lang><zh-CN>旧 id 只可能属于同 action；跨 action 请求不互相终止。</zh-CN><en>An older id can belong only to the same action; requests for different actions never terminate one another.</en></lang>
  const previousRequestId = latestRequestByAction.get(action);
  // <lang><zh-CN>先分配并占有新 id，使旧 stale listener 的同 action 重入能显式终止本次外层请求，而不是被外层随后覆盖。</zh-CN><en>Allocates and claims the new id first so same-action re-entry from the old stale listener can explicitly terminate this outer request rather than be overwritten later.</en></lang>
  nextAdapterRequestId += 1;
  const requestId = nextAdapterRequestId;
  latestRequestByAction.set(action, requestId);
  if (previousRequestId !== undefined) {
    // <lang><zh-CN>先标记 terminal 再 emit stale，保证 listener 重入或旧 Promise 同步 settlement 也不能重复终止。</zh-CN><en>Marks terminal before emitting stale so listener re-entry or synchronous old-promise settlement cannot terminate it twice.</en></lang>
    terminatedAdapterRequestIds.add(previousRequestId);
    emitStaleAdapterState(action, previousRequestId);
    // <lang><zh-CN>stale listener 可以卸载或重入同 action；外层只有仍拥有 latest id 时才能继续 pending 和 adapter 调用。</zh-CN><en>A stale listener may unmount or re-enter the same action; the outer call may continue to pending and adapter invocation only while it still owns the latest id.</en></lang>
    if (!acceptsAdapterSettlement || latestRequestByAction.get(action) !== requestId) {
      // <lang><zh-CN>本请求尚未调用 adapter，因此其重入 stale 不需要等待 Promise settlement；立即释放 terminal 索引。</zh-CN><en>This request has not called the adapter yet, so its re-entrant stale needs no promise settlement; its terminal index is released immediately.</en></lang>
      terminatedAdapterRequestIds.delete(requestId);
      return null;
    }
  }
  // <lang><zh-CN>没有重入覆盖时，本 id 仍是该 action 唯一当前 request。</zh-CN><en>Without a re-entrant overwrite, this id remains the sole current request for the action.</en></lang>
  return requestId;
}

/**
 * @lang zh-CN 消费一个已终止 request 的 settlement 标记，使其 Promise 后续完成保持静默且释放索引。
 * @lang en Consumes a terminated request's settlement marker so its later Promise completion stays silent and releases the index.
 * @param {number} requestId <lang><zh-CN>待核对 request id。</zh-CN><en>Request id to inspect.</en></lang>
 * @returns {boolean} <lang><zh-CN>该 request 已经 terminal stale 时为 true。</zh-CN><en>`true` when the request already reached terminal stale.</en></lang>
 */
function consumeTerminatedAdapterRequest(requestId) {
  // <lang><zh-CN>不存在时零修改；存在时删除一次，后续重复 settlement 仍不会制造新状态。</zh-CN><en>Absence causes no mutation; presence deletes once, and any repeated settlement still cannot create a new state.</en></lang>
  if (!terminatedAdapterRequestIds.has(requestId)) return false;
  terminatedAdapterRequestIds.delete(requestId);
  return true;
}

/**
 * @lang zh-CN 发送稳定 failed 状态；不暴露任意 throw/rejection 值，避免泄漏调用方错误对象或凭据。
 * @lang en Emits a stable failed state without exposing an arbitrary thrown/rejected value, avoiding leakage of caller error objects or credentials.
 * @param {'select'|'preview'|'remove'|'retry'} action <lang><zh-CN>受限 adapter action。</zh-CN><en>Constrained adapter action.</en></lang>
 * @param {number} requestId <lang><zh-CN>失败 request id。</zh-CN><en>Failed request id.</en></lang>
 * @param {'adapter-threw'|'adapter-rejected'|'invalid-result'} code <lang><zh-CN>稳定失败 code。</zh-CN><en>Stable failure code.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function emitFailedAdapterState(action, requestId, code) {
  // <lang><zh-CN>failed terminal 在 listener 可见前释放 latest ownership，防止重入产生第二个 stale terminal。</zh-CN><en>The failed terminal releases latest ownership before becoming visible to listeners, preventing re-entry from creating a second stale terminal.</en></lang>
  clearCurrentAdapterRequest(action, requestId);
  // <lang><zh-CN>failure 子对象单独冻结，使嵌套 code 也不能被 listener 改写。</zh-CN><en>The failure child is frozen separately so a listener cannot rewrite its nested code.</en></lang>
  const failure = Object.freeze({ code });
  // <lang><zh-CN>failed discriminant 与 frozen failure 是唯一错误表面；没有自动 retry 或日志副作用。</zh-CN><en>The failed discriminant and frozen failure are the sole error surface; there is no automatic retry or logging side effect.</en></lang>
  emitAdapterState({ status: 'failed', action, requestId, failure });
}

/**
 * @lang zh-CN 以 caller-owned source、adapter identity 与 per-action latest 规则编排一个可选 adapter 方法。
 * @lang en Orchestrates one optional adapter method under caller-owned source, adapter-identity, and per-action-latest rules.
 * @param {'select'|'preview'|'remove'|'retry'} action <lang><zh-CN>受限 adapter action。</zh-CN><en>Constrained adapter action.</en></lang>
 * @param {{event: unknown, remainingSlots?: number, file?: unknown, index?: number}} details <lang><zh-CN>已通过 UI guard 的 action-specific 本地事实。</zh-CN><en>Action-specific local facts that have passed UI guards.</en></lang>
 * @returns {Promise<void>} <lang><zh-CN>所有同步/异步结果均在函数内收束，不向调用点泄漏 rejection。</zh-CN><en>Every synchronous/asynchronous result is settled inside the function and no rejection leaks to the call site.</en></lang>
 */
async function runAdapterAction(action, details) {
  // <lang><zh-CN>只有白名单 action、活跃生命周期和 object adapter 能进入动态方法读取。</zh-CN><en>Only an allowlisted action, active lifecycle, and object adapter may enter dynamic method lookup.</en></lang>
  const adapterIdentity = callerIdentity(props.adapter);
  if (!acceptsAdapterSettlement || !supportedAdapterActions.includes(action) || adapterIdentity === null || typeof adapterIdentity !== 'object') return;

  // <lang><zh-CN>在任何 adapter property lookup 前捕获 active source 与两输入 raw identity；getter 副作用不能悄然移动本次请求的所有权基线。</zh-CN><en>Captures active-source and both-input raw identities before any adapter property lookup so getter side effects cannot silently move this request's ownership baseline.</en></lang>
  const sourceIdentity = activeSourceIdentity.value;
  const modelValueIdentity = callerIdentity(props.modelValue);
  const filesIdentity = callerIdentity(props.files);
  // <lang><zh-CN>context 文件快照来自同一开始时 source identity，而不是 property lookup 后可能变化的响应式值。</zh-CN><en>The context file snapshot comes from the same start-time source identity rather than a reactive value that may change after property lookup.</en></lang>
  const sourceFiles = Array.isArray(sourceIdentity) ? sourceIdentity : [];

  // <lang><zh-CN>adapter 方法只按固定 action 名读取；getter/proxy 的同步 throw 也必须收束为稳定失败，而非泄漏 rejected async function。</zh-CN><en>An adapter method is read only by its fixed action name; a synchronous getter/proxy throw must also settle as a stable failure rather than leak a rejected async function.</en></lang>
  let adapterMethod;
  try {
    adapterMethod = adapterIdentity[action];
  } catch {
    // <lang><zh-CN>lookup throw 仍代表一次 action 请求，并遵循同 action supersession、pending→failed 顺序。</zh-CN><en>A lookup throw still represents one action request and follows same-action supersession plus pending-to-failed ordering.</en></lang>
    const failedLookupRequestId = beginAdapterRequest(action);
    if (failedLookupRequestId === null) return;
    emitAdapterState({ status: 'pending', action, requestId: failedLookupRequestId });
    // <lang><zh-CN>pending listener 若卸载、换 source/adapter 或重入同 action，本 lookup failure 不得再发送第二个 terminal。</zh-CN><en>If the pending listener unmounts, replaces source/adapter, or re-enters the same action, this lookup failure must not emit a second terminal.</en></lang>
    if (!acceptsAdapterSettlement || consumeTerminatedAdapterRequest(failedLookupRequestId)) return;
    if (!isCurrentAdapterRequest(action, failedLookupRequestId, sourceIdentity, adapterIdentity)) emitStaleAdapterState(action, failedLookupRequestId);
    else emitFailedAdapterState(action, failedLookupRequestId, 'adapter-threw');
    return;
  }
  // <lang><zh-CN>缺失或非函数方法保持纯 legacy intent，不制造 pending/failed 状态。</zh-CN><en>A missing or non-function method preserves pure legacy intent and creates no pending/failed state.</en></lang>
  if (typeof adapterMethod !== 'function') return;

  // <lang><zh-CN>开始新请求会先为同 action 旧 active request 发送唯一 stale terminal；其他 action 不受影响。</zh-CN><en>Starting a new request first emits the sole stale terminal for an older active request of the same action; other actions remain unaffected.</en></lang>
  const requestId = beginAdapterRequest(action);
  if (requestId === null) return;

  // <lang><zh-CN>冻结数组快照只复制开始时 source 容器；record identity 保持 caller 原值。</zh-CN><en>The frozen array snapshot copies only the start-time source container while record identities retain caller values.</en></lang>
  const fileSnapshot = createFileSnapshot(sourceFiles);

  // <lang><zh-CN>select 与 file action 拥有不同的精确 context 字段；两者都不携带 action 之外的运行配置。</zh-CN><en>Select and file actions have distinct exact context fields; neither carries runtime configuration beyond its action facts.</en></lang>
  const context = action === 'select'
    ? createSelectContext(fileSnapshot, details.remainingSlots, details.event, requestId)
    : createFileActionContext(action, fileSnapshot, details.file, details.index, details.event, requestId);

  // <lang><zh-CN>pending 在调用 adapter 前同步发送，但 legacy intent 已由外层 handler 更早发送。</zh-CN><en>Pending emits synchronously before calling the adapter, while the outer handler has already emitted the legacy intent.</en></lang>
  emitAdapterState({ status: 'pending', action, requestId });
  // <lang><zh-CN>pending listener 可能同步卸载、换 identity 或重入同 action；失去 ownership 时不再调用 adapter，且已发 stale 不重复。</zh-CN><en>A pending listener may synchronously unmount, replace an identity, or re-enter the same action; an ineligible request no longer calls the adapter and never repeats an already-emitted stale state.</en></lang>
  if (!acceptsAdapterSettlement || consumeTerminatedAdapterRequest(requestId)) return;
  if (!isCurrentAdapterRequest(action, requestId, sourceIdentity, adapterIdentity)) {
    emitStaleAdapterState(action, requestId);
    return;
  }

  // <lang><zh-CN>同步调用与 Promise 获取分开捕获，使 throw 与 reject 形成不同稳定 failure code。</zh-CN><en>The synchronous call and Promise settlement are caught separately so throw and rejection produce distinct stable failure codes.</en></lang>
  let adapterResult;
  try {
    // <lang><zh-CN>以 adapter 为 this 调用固定方法，兼容调用方对象方法而不读取其他属性。</zh-CN><en>Calls the fixed method with the adapter as `this`, supporting caller object methods without reading other properties.</en></lang>
    adapterResult = adapterMethod.call(adapterIdentity, context);
  } catch {
    // <lang><zh-CN>同步 throw 若已经陈旧则只报告 stale；当前请求报告 adapter-threw，且不透传 error。</zh-CN><en>A synchronous throw reports only stale when already stale; a current request reports adapter-threw without forwarding the error.</en></lang>
    if (!acceptsAdapterSettlement || consumeTerminatedAdapterRequest(requestId)) return;
    if (!isCurrentAdapterRequest(action, requestId, sourceIdentity, adapterIdentity)) emitStaleAdapterState(action, requestId);
    else emitFailedAdapterState(action, requestId, 'adapter-threw');
    clearCurrentAdapterRequest(action, requestId);
    return;
  }

  // <lang><zh-CN>Promise.resolve 统一同步值、Promise 与 thenable；所有 rejection 在此捕获，不形成 unhandled rejection。</zh-CN><en>Promise.resolve unifies synchronous values, promises, and thenables; every rejection is caught here and cannot become unhandled.</en></lang>
  let settledResult;
  try {
    // <lang><zh-CN>await 只等待调用方 adapter 的完成，不添加 timer、retry、取消器或全局队列。</zh-CN><en>Await waits only for caller-adapter completion and adds no timer, retry, canceller, or global queue.</en></lang>
    settledResult = await Promise.resolve(adapterResult);
  } catch {
    // <lang><zh-CN>rejection 先按 lifecycle/identity 判 stale；当前请求只报告 adapter-rejected 稳定 code。</zh-CN><en>A rejection is checked for lifecycle/identity staleness first; a current request reports only the stable adapter-rejected code.</en></lang>
    if (!acceptsAdapterSettlement || consumeTerminatedAdapterRequest(requestId)) return;
    if (!isCurrentAdapterRequest(action, requestId, sourceIdentity, adapterIdentity)) emitStaleAdapterState(action, requestId);
    else emitFailedAdapterState(action, requestId, 'adapter-rejected');
    clearCurrentAdapterRequest(action, requestId);
    return;
  }

  // <lang><zh-CN>任何完成值在解释前都重新验证 per-action latest、source identity 与 adapter identity。</zh-CN><en>Every completion value revalidates per-action latest, source identity, and adapter identity before interpretation.</en></lang>
  if (consumeTerminatedAdapterRequest(requestId)) return;
  if (!isCurrentAdapterRequest(action, requestId, sourceIdentity, adapterIdentity)) {
    // <lang><zh-CN>卸载已由前置生命周期 guard 静默；其余失去资格的完成统一为最小 stale。</zh-CN><en>Unmount is already silent through the lifecycle guard; every other ineligible completion becomes the minimal stale state.</en></lang>
    if (acceptsAdapterSettlement) emitStaleAdapterState(action, requestId);
    clearCurrentAdapterRequest(action, requestId);
    return;
  }

  // <lang><zh-CN>undefined 表示 adapter 已完成但 caller model 无候选更新；它仍形成 succeeded 状态。</zh-CN><en>Undefined means the adapter completed without a candidate caller-model update; it still produces a succeeded state.</en></lang>
  if (settledResult === undefined) {
    // <lang><zh-CN>先释放 latest ownership，再发送 succeeded，避免 succeeded listener 重入把已完成请求误终止为 stale。</zh-CN><en>Releases latest ownership before emitting succeeded so succeeded-listener re-entry cannot wrongly terminate a completed request as stale.</en></lang>
    clearCurrentAdapterRequest(action, requestId);
    emitAdapterState({ status: 'succeeded', action, requestId, updated: false });
    return;
  }

  // <lang><zh-CN>只有同时不同于调用开始与 settlement 时 modelValue/files identity 的新数组可写回；scalar/object/null 或任一输入数组本身都是 invalid-result。</zh-CN><en>Only a new array distinct from modelValue/files identities both at invocation start and settlement may write back; a scalar, object, null, or any input array itself is invalid-result.</en></lang>
  if (!Array.isArray(settledResult)
    || settledResult === modelValueIdentity
    || settledResult === filesIdentity
    || settledResult === callerIdentity(props.modelValue)
    || settledResult === callerIdentity(props.files)) {
    emitFailedAdapterState(action, requestId, 'invalid-result');
    return;
  }

  // <lang><zh-CN>结果解释完成即释放 latest ownership；model listener 重入属于新请求，不应把已接受结果再标 stale。</zh-CN><en>Latest ownership is released once result interpretation completes; model-listener re-entry is a new request and must not mark the accepted result stale.</en></lang>
  clearCurrentAdapterRequest(action, requestId);
  // <lang><zh-CN>组件原样 emit 新数组，不 freeze、clone 或解释 caller 选择的下一状态。</zh-CN><en>The component emits the new array unchanged and does not freeze, clone, or interpret the caller's chosen next state.</en></lang>
  emit('update:modelValue', settledResult);
  // <lang><zh-CN>succeeded 在 model intent 之后报告 updated=true，形成稳定可观测顺序。</zh-CN><en>Succeeded reports updated=true after the model intent, creating a stable observable order.</en></lang>
  emitAdapterState({ status: 'succeeded', action, requestId, updated: true });
}

/**
 * @lang zh-CN 报告调用方请求选择的剩余槽位，并在 legacy intent 后可选调用 injected adapter；不打开 chooser、不创建文件或直接写回列表。
 * @lang en Reports caller-requestable remaining slots and optionally calls an injected adapter after the legacy intent; it opens no chooser, creates no file, and directly writes back no list.
 * @param {unknown} event <lang><zh-CN>原始点击事件。</zh-CN><en>Original click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；adapter Promise 在内部完全收束。</zh-CN><en>No return value; the adapter promise is fully settled internally.</en></lang>
 */
function emitSelect(event) {
  // <lang><zh-CN>guard 保持 visible、disabled、文案与有限槽位边界，直接调用无法绕过模板资格。</zh-CN><en>The guard retains visible, disabled, copy, and finite-slot boundaries so direct calls cannot bypass template eligibility.</en></lang>
  if (!isRenderable.value || props.disabled || !canSelect.value) return;
  // <lang><zh-CN>剩余槽位只来自有限显示列表与 safeMax，不表示平台 chooser 或后端额度。</zh-CN><en>Remaining slots come only from the finite display list and safeMax and represent no platform chooser or backend quota.</en></lang>
  const remainingSlots = safeMax.value - safeFiles.value.length;
  // <lang><zh-CN>旧版 intent 必须先同步发送，保证没有 adapter 或 adapter 失败时的兼容行为不变。</zh-CN><en>The legacy intent must emit synchronously first, preserving compatibility when no adapter exists or an adapter fails.</en></lang>
  emit('select', { remainingSlots, event });
  // <lang><zh-CN>void 明确丢弃已内部捕获的 Promise，不让模板 handler 获得异步控制权。</zh-CN><en>Void explicitly discards the internally caught promise so the template handler gains no asynchronous ownership.</en></lang>
  void runAdapterAction('select', { remainingSlots, event });
}

/**
 * @lang zh-CN 报告一个 caller 文件记录的本地 intent，并在 legacy intent 后可选调用相同行为名的 injected adapter；不读取、修改、删除或上传其内容。
 * @lang en Reports local intent for one caller file record and optionally invokes the same-named injected-adapter method after the legacy intent; it reads, modifies, deletes, and uploads none of the content.
 * @param {'preview'|'remove'|'retry'} intent <lang><zh-CN>固定 action 名称。</zh-CN><en>Fixed action name.</en></lang>
 * @param {{status: string, disabled: boolean, source: unknown}} file <lang><zh-CN>已规范化文件记录。</zh-CN><en>Normalized file record.</en></lang>
 * @param {unknown} event <lang><zh-CN>原始点击事件。</zh-CN><en>Original click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；adapter Promise 在内部完全收束。</zh-CN><en>No return value; the adapter promise is fully settled internally.</en></lang>
 */
function emitFileIntent(intent, file, event) {
  // <lang><zh-CN>每种 action 都再次验证 caller 文案和 error retry 资格，防止直接调用创造隐藏操作入口。</zh-CN><en>Every action revalidates caller copy and error-retry eligibility, preventing direct calls from creating a hidden action entry.</en></lang>
  const allowed = intent === 'preview'
    ? safePreviewText.value.trim().length > 0
    : intent === 'remove'
      ? safeRemoveText.value.trim().length > 0
      : file.status === 'error' && safeRetryText.value.trim().length > 0;
  // <lang><zh-CN>可见性、全局 disabled、record disabled 与 action 资格任一失败都保持零事件。</zh-CN><en>A failure of visibility, global disabled, record disabled, or action eligibility keeps the interaction event-free.</en></lang>
  if (!isRenderable.value || props.disabled || file.disabled || !allowed) return;
  // <lang><zh-CN>旧版 payload 继续原样携带 caller record 和事件，并且严格早于 adapter-state。</zh-CN><en>The legacy payload continues to carry the caller record and event unchanged and strictly precedes adapter-state.</en></lang>
  emit(intent, { file: file.source, event });
  // <lang><zh-CN>受限 intent 已通过 allowlist guard，adapter 调用不会扩大到任意方法名。</zh-CN><en>The constrained intent has passed the allowlist guard, so adapter invocation cannot expand to an arbitrary method name.</en></lang>
  void runAdapterAction(intent, { file: file.source, index: file.index, event });
}
</script>

<style src="./u-upload.css"></style>
