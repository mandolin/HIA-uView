<!--
@component UUpload
@lang zh-CN 提供调用方文件状态的受控列表与 select/preview/remove/retry 意图；组件不选择、读取、删除、上传、下载、缓存或处理文件字节，也不连接网络或平台 chooser。
@lang en Provides a controlled list of caller file states with select/preview/remove/retry intent; the component selects, reads, deletes, uploads, downloads, caches, and processes no file bytes and connects to no network or platform chooser.
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
import { computed } from 'vue';

// <lang><zh-CN>稳定名称保留上传迁移入口；实现只管理 caller-projected file state，而非文件生命周期服务。</zh-CN><en>The stable name retains an upload migration entry; the implementation manages caller-projected file state only, not a file-lifecycle service.</en></lang>
defineOptions({ name: 'u-upload' });

// <lang><zh-CN>调用方拥有可见性、文件记录、最大显示槽数、标签和全部 action 文字；组件不接收 URL、binary、request 或平台 chooser 配置。</zh-CN><en>The caller owns visibility, file records, maximum display slots, label, and all action copy; the component accepts no URL, binary, request, or platform-chooser configuration.</en></lang>
const props = defineProps({
  // <lang><zh-CN>可见性默认关闭，避免无请求地输出文件交互表面。</zh-CN><en>Visibility defaults off, avoiding output of a file-interaction surface without a request.</en></lang>
  visible: { type: Boolean, default: false },
  // <lang><zh-CN>files 只投影有限 label/description/status/disabled 记录；最多显示十二项，不修改原数组或对象。</zh-CN><en>Files project only finite label/description/status/disabled records; at most twelve items display and neither original array nor objects are modified.</en></lang>
  files: { type: Array, default: () => [] },
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

// <lang><zh-CN>事件只表达 caller file-record 的局部意图；调用方决定 chooser、预览、移除、重试和任何异步工作。</zh-CN><en>Events express local intent for caller file records only; the caller decides chooser, preview, removal, retry, and any async work.</en></lang>
const emit = defineEmits(['select', 'preview', 'remove', 'retry']);

// <lang><zh-CN>允许的状态仅影响固定样式类和 retry 输出资格，不解释真实上传进度或网络结果。</zh-CN><en>The allowed states affect only fixed style classes and retry-output eligibility and do not interpret actual upload progress or network result.</en></lang>
const supportedStatuses = Object.freeze(['ready', 'pending', 'error']);

/**
 * @lang zh-CN 将一个 caller 文件记录规范化为有限可读投影，并保留原始记录仅供原样事件回传；不可读 label 返回 null。
 * @lang en Normalizes one caller file record into a finite readable projection and retains the original record only for unchanged event return; an unreadable label returns null.
 * @param {unknown} file <lang><zh-CN>调用方文件状态记录或字符串快捷写法。</zh-CN><en>Caller file-state record or string shorthand.</en></lang>
 * @param {number} index <lang><zh-CN>受限集合索引，仅用于稳定模板键。</zh-CN><en>Bounded-collection index, used only for a stable template key.</en></lang>
 * @returns {{key: string, label: string, description: string, status: string, statusText: string, disabled: boolean, source: unknown}|null} <lang><zh-CN>规范化记录或 null。</zh-CN><en>Normalized record or null.</en></lang>
 */
function normalizeFile(file, index) {
  // <lang><zh-CN>对象只读取显示字段；原始字符串/数值只形成透明 label 快捷写法，不被视为路径或二进制。</zh-CN><en>Objects read display fields only; primitive strings/numbers form transparent label shorthand only and are not treated as path or binary.</en></lang>
  const source = file !== null && typeof file === 'object' ? file : { label: file };
  const candidateLabel = source.label ?? source.name ?? '';
  const label = typeof candidateLabel === 'string' || typeof candidateLabel === 'number' ? String(candidateLabel) : '';
  if (label.trim().length === 0) return null;
  const candidateDescription = source.description ?? '';
  const description = typeof candidateDescription === 'string' ? candidateDescription : '';
  const status = supportedStatuses.includes(source.status) ? source.status : 'ready';
  const candidateStatusText = source.statusText ?? '';
  const statusText = typeof candidateStatusText === 'string' ? candidateStatusText : '';
  return Object.freeze({ key: `file-${index}`, label, description, status, statusText, disabled: Boolean(source.disabled), source: file });
}

// <lang><zh-CN>最多十二项的有限投影阻止组件被误用作无限文件目录、上传队列或缓存。</zh-CN><en>The at-most-twelve finite projection prevents misuse of the component as an unbounded file directory, upload queue, or cache.</en></lang>
const safeFiles = computed(() => (Array.isArray(props.files) ? props.files : []).slice(0, 12).map(normalizeFile).filter((file) => file !== null));

// <lang><zh-CN>max 收束为 1–12 的整数，使剩余 select 槽位与可见列表保持同一有限范围。</zh-CN><en>Max is constrained to an integer from one to twelve so remaining select slots and visible list share the same finite range.</en></lang>
const safeMax = computed(() => Number.isFinite(props.max) ? Math.round(Math.min(12, Math.max(1, props.max))) : 1);

// <lang><zh-CN>用户可见文字只接受明确字符串，避免不匹配 prop 变成对象文案或无标签 button。</zh-CN><en>User-visible copy accepts explicit strings only, preventing mismatched props from becoming object copy or unlabeled buttons.</en></lang>
const safeLabel = computed(() => typeof props.label === 'string' ? props.label : '');
const safeSelectText = computed(() => typeof props.selectText === 'string' ? props.selectText : '');
const safePreviewText = computed(() => typeof props.previewText === 'string' ? props.previewText : '');
const safeRemoveText = computed(() => typeof props.removeText === 'string' ? props.removeText : '');
const safeRetryText = computed(() => typeof props.retryText === 'string' ? props.retryText : '');

// <lang><zh-CN>只有 caller 提供 select 文字且有限槽位未满时生成 select control。</zh-CN><en>Creates select control only when the caller provides select copy and finite slots are not full.</en></lang>
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
 * @lang en Produces fixed status classes; status copy and caller data never enter CSS class.
 * @param {string} status <lang><zh-CN>已规范化状态。</zh-CN><en>Normalized status.</en></lang>
 * @returns {string[]} <lang><zh-CN>固定命名空间和状态类。</zh-CN><en>Fixed namespace and status classes.</en></lang>
 */
function statusClasses(status) {
  // <lang><zh-CN>状态仅来自受限集合；未知状态已在规范化阶段回退 ready。</zh-CN><en>Status comes only from the bounded set; unknown status has already fallen back to ready at normalization.</en></lang>
  return ['u-upload__status', `u-upload__status--${status}`];
}

/**
 * @lang zh-CN 报告调用方请求选择的剩余槽位；不打开 chooser、不创建文件或写回列表。
 * @lang en Reports remaining caller-requestable slots for selection; it opens no chooser, creates no file, and writes back no list.
 * @param {unknown} event <lang><zh-CN>原始点击事件。</zh-CN><en>Original click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `select`。</zh-CN><en>No return value; emits `select` when the guard passes.</en></lang>
 */
function emitSelect(event) {
  // <lang><zh-CN>guard 保持 visible、disabled、文案与有限槽位边界，直接调用无法绕过模板资格。</zh-CN><en>The guard retains visible, disabled, copy, and finite-slot boundaries so direct calls cannot bypass template eligibility.</en></lang>
  if (!isRenderable.value || props.disabled || !canSelect.value) return;
  emit('select', { remainingSlots: safeMax.value - safeFiles.value.length, event });
}

/**
 * @lang zh-CN 报告一个 caller 文件记录的本地 intent；不读取、修改、删除或上传其内容。
 * @lang en Reports local intent for one caller file record; it reads, modifies, deletes, and uploads none of its content.
 * @param {'preview'|'remove'|'retry'} intent <lang><zh-CN>固定 action 名称。</zh-CN><en>Fixed action name.</en></lang>
 * @param {{status: string, disabled: boolean, source: unknown}} file <lang><zh-CN>已规范化文件记录。</zh-CN><en>Normalized file record.</en></lang>
 * @param {unknown} event <lang><zh-CN>原始点击事件。</zh-CN><en>Original click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit 对应 intent。</zh-CN><en>No return value; emits matching intent when the guard passes.</en></lang>
 */
function emitFileIntent(intent, file, event) {
  // <lang><zh-CN>每种 action 都再次验证 caller 文案和 error retry 资格，防止直接调用创造隐藏操作入口。</zh-CN><en>Every action revalidates caller copy and error-retry eligibility, preventing direct calls from creating hidden action entries.</en></lang>
  const allowed = intent === 'preview'
    ? safePreviewText.value.trim().length > 0
    : intent === 'remove'
      ? safeRemoveText.value.trim().length > 0
      : file.status === 'error' && safeRetryText.value.trim().length > 0;
  if (!isRenderable.value || props.disabled || file.disabled || !allowed) return;
  emit(intent, { file: file.source, event });
}
</script>

<style src="./u-upload.css"></style>
