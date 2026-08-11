/**
 * @module verify-p67-upload-adapter-contract.test
 * @lang zh-CN 静态锁定 P67 UUpload 的受控 source、精确 adapter context、唯一状态事件、陈旧/失败边界与平台中立性。测试只读取固定源码，不启动 chooser、网络、文件 IO、timer、平台 API 或 adapter。
 * @lang en Statically locks P67 UUpload controlled sources, exact adapter contexts, the sole state event, stale/failure boundaries, and platform neutrality. The test reads only fixed source and starts no chooser, network, file I/O, timer, platform API, or adapter.
 */

// <lang><zh-CN>只导入 Node 断言、固定文件读取和 test runner；不扫描目录或执行 Vue 源码。</zh-CN><en>Imports only Node assertions, fixed-file reading, and the test runner; it neither scans directories nor executes Vue source.</en></lang>
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// <lang><zh-CN>固定路径把审计面限定为本 W 唯一 upload runtime 文件。</zh-CN><en>The fixed path constrains the audit surface to this W's sole upload runtime file.</en></lang>
const uploadSourcePath = 'HIA-uView-UI/src/components/u-upload/u-upload.vue';

// <lang><zh-CN>读取源码文本只用于结构/禁令断言；不会 import、compile 或运行组件。</zh-CN><en>Reads source text only for structural/prohibition assertions and does not import, compile, or run the component.</en></lang>
const uploadSource = await readFile(uploadSourcePath, 'utf8');

/**
 * @lang zh-CN 剥离 Vue/JS/CSS 说明性注释，使安全禁令只检查可执行/模板表面而不误报双语边界文字。
 * @lang en Strips Vue/JS/CSS explanatory comments so safety prohibitions inspect only executable/template surfaces without false positives from bilingual boundary prose.
 * @param {string} source <lang><zh-CN>完整 Vue SFC 源码。</zh-CN><en>Complete Vue SFC source.</en></lang>
 * @returns {string} <lang><zh-CN>去除块/行注释的审计文本。</zh-CN><en>Audit text with block/line comments removed.</en></lang>
 */
function stripComments(source) {
  // <lang><zh-CN>三步只删除静态注释表面，不解析或改写字符串、模板表达式和执行语句。</zh-CN><en>The three steps remove only static comment surfaces and do not parse or rewrite strings, template expressions, or executable statements.</en></lang>
  return source
    .replace(/<!--[\s\S]*?-->/gu, '')
    .replace(/\/\*[\s\S]*?\*\//gu, '')
    .replace(/^\s*\/\/.*$/gmu, '');
}

// <lang><zh-CN>注释剥离后的文本供全部 platform/network/identity 禁令复用。</zh-CN><en>Comment-stripped text is reused by every platform/network/identity prohibition.</en></lang>
const executableSource = stripComments(uploadSource);

/**
 * @lang zh-CN 验证 source props、legacy intent、model update 与唯一 adapter-state 事件保持固定名称和顺序入口。
 * @lang en Verifies source props, legacy intents, model update, and the sole adapter-state event retain fixed names and ordering entry points.
 * @returns {void} <lang><zh-CN>断言失败时抛出。</zh-CN><en>Throws on assertion failure.</en></lang>
 */
test('locks controlled source precedence and the sole adapter state event', () => {
  // <lang><zh-CN>modelValue 必须以 undefined 为唯一 fallback 哨兵，adapter 必须默认 null。</zh-CN><en>ModelValue must use undefined as the sole fallback sentinel, and adapter must default to null.</en></lang>
  assert.match(executableSource, /modelValue:\s*\{\s*type:\s*Array,\s*default:\s*undefined\s*\}/u);
  assert.match(executableSource, /files:\s*\{\s*type:\s*Array,\s*default:\s*\(\)\s*=>\s*\[\]\s*\}/u);
  assert.match(executableSource, /adapter:\s*\{\s*type:\s*Object,\s*default:\s*null\s*\}/u);
  assert.match(executableSource, /props\.modelValue\s*!==\s*undefined\s*\?\s*props\.modelValue\s*:\s*props\.files/u);

  // <lang><zh-CN>公开事件表面只能在旧版四 intent 上增加 model update 与单一 adapter-state。</zh-CN><en>The public event surface may add only model update and one adapter-state to the four legacy intents.</en></lang>
  assert.match(executableSource, /defineEmits\(\['select', 'preview', 'remove', 'retry', 'update:modelValue', 'adapter-state'\]\)/u);
  assert.doesNotMatch(executableSource, /['"]adapter-(?:pending|success|succeeded|stale|failed|error)['"]/u);

  // <lang><zh-CN>每个 UI handler 必须先 emit legacy event，再调用内部 adapter orchestrator。</zh-CN><en>Every UI handler must emit the legacy event before calling the internal adapter orchestrator.</en></lang>
  assert.match(executableSource, /emit\('select',[\s\S]*?void runAdapterAction\('select'/u);
  assert.match(executableSource, /emit\(intent,[\s\S]*?void runAdapterAction\(intent/u);
});

/**
 * @lang zh-CN 验证 allowlist、select/file context 的 exact keys、原 controlled index 与浅冻结数组快照。
 * @lang en Verifies the allowlist, exact select/file context keys, original controlled index, and shallow-frozen array snapshot.
 * @returns {void} <lang><zh-CN>断言失败时抛出。</zh-CN><en>Throws on assertion failure.</en></lang>
 */
test('locks exact shallow-frozen adapter contexts and allowlisted methods', () => {
  // <lang><zh-CN>只有四个 action 可用于动态 adapter method lookup。</zh-CN><en>Only four actions may be used for dynamic adapter-method lookup.</en></lang>
  assert.match(executableSource, /Object\.freeze\(\['select', 'preview', 'remove', 'retry'\]\)/u);
  assert.match(executableSource, /supportedAdapterActions\.includes\(action\)[\s\S]*?adapterIdentity\[action\]/u);

  // <lang><zh-CN>两个 context literal 的 key 集合和顺序必须精确；file action 必须包含原 source index。</zh-CN><en>The key sets and order of both context literals must be exact, and a file action must include the original source index.</en></lang>
  assert.match(executableSource, /Object\.freeze\(\{ action: 'select', files, remainingSlots, event, requestId \}\)/u);
  assert.match(executableSource, /Object\.freeze\(\{ action, files, file, index, event, requestId \}\)/u);
  assert.match(executableSource, /Object\.freeze\(files\.slice\(\)\)/u);
  assert.match(executableSource, /key:\s*`file-\$\{index\}`\s*,\s*index/u);
  assert.match(executableSource, /runAdapterAction\(intent,\s*\{ file: file\.source, index: file\.index, event \}\)/u);
});

/**
 * @lang zh-CN 验证 per-action latest、同 action 唯一 stale terminal、source/adapter identity 和卸载静默结构。
 * @lang en Verifies per-action latest behavior, one stale terminal per superseded same-action request, source/adapter identity, and silent-unmount structure.
 * @returns {void} <lang><zh-CN>断言失败时抛出。</zh-CN><en>Throws on assertion failure.</en></lang>
 */
test('locks latest-request identity and silent terminal behavior', () => {
  // <lang><zh-CN>Map 只按 action 保存 latest；Set 负责已 terminal stale 的旧 Promise 后续静默。</zh-CN><en>The map stores latest by action only; the set keeps later settlement of already-terminal stale promises silent.</en></lang>
  assert.match(executableSource, /const latestRequestByAction = new Map\(\)/u);
  assert.match(executableSource, /const terminatedAdapterRequestIds = new Set\(\)/u);
  assert.match(executableSource, /terminatedAdapterRequestIds\.add\(previousRequestId\)[\s\S]*?emitStaleAdapterState\(action, previousRequestId\)/u);
  assert.match(executableSource, /latestRequestByAction\.get\(action\) !== requestId/u);
  assert.match(executableSource, /consumeTerminatedAdapterRequest\(requestId\)/u);

  // <lang><zh-CN>current 资格必须同时检查 lifecycle、per-action id、active source raw identity 与 adapter raw identity。</zh-CN><en>Current eligibility must check lifecycle, per-action id, active-source raw identity, and adapter raw identity together.</en></lang>
  assert.match(executableSource, /acceptsAdapterSettlement[\s\S]*?latestRequestByAction\.get\(action\) === requestId[\s\S]*?activeSourceIdentity\.value === sourceIdentity[\s\S]*?callerIdentity\(props\.adapter\) === adapterIdentity/u);
  assert.match(executableSource, /onBeforeUnmount\(stopAdapterSettlements\)/u);
  assert.match(executableSource, /acceptsAdapterSettlement = false[\s\S]*?latestRequestByAction\.clear\(\)[\s\S]*?terminatedAdapterRequestIds\.clear\(\)/u);

  // <lang><zh-CN>stale payload 必须保持最小三字段，不增加 reason/source/adapter/cause。</zh-CN><en>The stale payload must retain exactly three fields and add no reason/source/adapter/cause.</en></lang>
  assert.match(executableSource, /emitAdapterState\(\{ status: 'stale', action, requestId \}\)/u);
});

/**
 * @lang zh-CN 验证严格 result/failure discriminant、双输入 identity 与同步 getter throw containment。
 * @lang en Verifies strict result/failure discriminants, two-input identity, and synchronous getter-throw containment.
 * @returns {void} <lang><zh-CN>断言失败时抛出。</zh-CN><en>Throws on assertion failure.</en></lang>
 */
test('locks strict adapter results and stable failure codes', () => {
  // <lang><zh-CN>唯一允许的状态 discriminant 为 pending/succeeded/stale/failed。</zh-CN><en>The only allowed state discriminants are pending/succeeded/stale/failed.</en></lang>
  const statusLiterals = [...executableSource.matchAll(/status:\s*'(pending|succeeded|stale|failed)'/gu)].map((match) => match[1]);
  assert.deepEqual(new Set(statusLiterals), new Set(['pending', 'succeeded', 'stale', 'failed']));
  assert.doesNotMatch(executableSource, /status:\s*'(?:success|failure|error)'/u);

  // <lang><zh-CN>failure code 必须固定为三项，catch 不绑定或透传任意 error/cause。</zh-CN><en>Failure codes must remain exactly three, and catch clauses bind or forward no arbitrary error/cause.</en></lang>
  const failureCodes = [...executableSource.matchAll(/emitFailedAdapterState\(action,\s*requestId,\s*'(adapter-threw|adapter-rejected|invalid-result)'\)/gu)].map((match) => match[1]);
  assert.deepEqual(new Set(failureCodes), new Set(['adapter-threw', 'adapter-rejected', 'invalid-result']));
  assert.doesNotMatch(executableSource, /catch\s*\([^)]/u);
  assert.match(executableSource, /try\s*\{\s*adapterMethod = adapterIdentity\[action\];\s*\}\s*catch\s*\{/u);
  assert.match(executableSource, /const failure = Object\.freeze\(\{ code \}\)/u);

  // <lang><zh-CN>array result 必须同时不同于开始与 settlement 时的 modelValue/files raw identity。</zh-CN><en>An array result must differ from raw modelValue/files identities both at invocation start and settlement.</en></lang>
  assert.match(executableSource, /settledResult === modelValueIdentity/u);
  assert.match(executableSource, /settledResult === filesIdentity/u);
  assert.match(executableSource, /settledResult === callerIdentity\(props\.modelValue\)/u);
  assert.match(executableSource, /settledResult === callerIdentity\(props\.files\)/u);
  assert.match(executableSource, /settledResult === undefined[\s\S]*?status: 'succeeded'[\s\S]*?updated: false/u);
  assert.match(executableSource, /emit\('update:modelValue', settledResult\)[\s\S]*?status: 'succeeded'[\s\S]*?updated: true/u);
});

/**
 * @lang zh-CN 验证 component executable 不包含 chooser、文件字节、transport、凭据、cache/storage、timer、平台 API 或任意 backend 配置。
 * @lang en Verifies component executable contains no chooser, file bytes, transport, credential, cache/storage, timer, platform API, or arbitrary backend configuration.
 * @returns {void} <lang><zh-CN>断言失败时抛出。</zh-CN><en>Throws on assertion failure.</en></lang>
 */
test('keeps the adapter orchestration platform-neutral and transport-free', () => {
  // <lang><zh-CN>禁令覆盖平台、浏览器 transport、二进制读取、持久化、计时、全局服务和常见凭据字段。</zh-CN><en>Prohibitions cover platform/browser transports, binary reads, persistence, timing, global services, and common credential fields.</en></lang>
  const forbiddenPatterns = Object.freeze([
    /\buni\.[A-Za-z]/u,
    /\b(?:chooseImage|chooseFile|chooseMedia|uploadFile|downloadFile|previewImage|openDocument)\b/u,
    /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|axios)\b/u,
    /\b(?:FileReader|Blob|ArrayBuffer|FormData)\b/u,
    /\b(?:localStorage|sessionStorage|indexedDB|caches)\b/u,
    /\bset(?:Timeout|Interval)\s*\(/u,
    /\brequestAnimationFrame\s*\(/u,
    /\b(?:provide|inject)\s*\(/u,
    /\b(?:url|baseURL|endpoint|headers?|authorization|credential|token|cookie|backend)\s*:/iu,
    /\bconsole\s*\./u,
    /<script[^>]+src=/iu,
    /data:image\//iu,
    /@font-face/iu
  ]);
  for (const pattern of forbiddenPatterns) {
    // <lang><zh-CN>逐项断言保留失败 pattern identity，便于定位具体边界漂移。</zh-CN><en>Each assertion retains the failing pattern identity for precise boundary-drift diagnosis.</en></lang>
    assert.doesNotMatch(executableSource, pattern);
  }

  // <lang><zh-CN>触及源码仍必须保留 module 文档化与 inline 双语 ROP 表面。</zh-CN><en>The touched source must retain module documentation and inline bilingual ROP surfaces.</en></lang>
  assert.match(uploadSource, /@component UUpload/u);
  assert.match(uploadSource, /@lang zh-CN/u);
  assert.match(uploadSource, /@lang en/u);
  assert.match(uploadSource, /<lang><zh-CN>/u);
  assert.match(uploadSource, /<en>/u);
});
