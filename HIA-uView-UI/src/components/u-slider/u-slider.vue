<!--
@component USlider
@lang zh-CN 提供受边界保护的本地数值滑块；不解释价格、库存或任务进度。
@lang en Provides a bounded local numeric slider; it interprets no price, inventory, or task progress.
-->
<template>
  <view class="u-slider" :class="{ 'u-slider--disabled': props.disabled }">
    <text v-if="props.showValue" class="u-slider__value">{{ safeValue }}</text>
    <slider class="u-slider__control" :value="safeValue" :min="safeMin" :max="safeMax" :step="safeStep" :disabled="props.disabled" :show-value="false" @change="handleChange" />
    <slot />
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>使用 u- 名称并保持滑块为局部受控输入。</zh-CN><en>Uses the u- name and keeps the slider as a local controlled input.</en></lang>
defineOptions({ name: 'u-slider' });

// <lang><zh-CN>数值边界是有限本地协议，不启动校验、持久化或远程同步。</zh-CN><en>Numeric bounds are a finite local protocol with no validation, persistence, or remote synchronization.</en></lang>
const props = defineProps({
  modelValue: { type: Number, default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  showValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
});
const emit = defineEmits(['update:modelValue', 'change']);

/**
 * @lang zh-CN 限制 slider 十进制定点网格精度；无法保持安全整数时交互保持零事件。
 * @lang en Limits slider decimal fixed-point grid precision; interaction emits nothing when safe integers cannot be preserved.
 * @type {number}
 */
const MAX_SLIDER_DECIMAL_PRECISION = 15;

/**
 * @lang zh-CN 只接受普通十进制或十进制指数 payload，排除空白、十六进制和隐式 boolean 转换。
 * @lang en Accepts only ordinary decimal or decimal-exponent payloads, excluding whitespace-only, hexadecimal, and implicit boolean conversion.
 * @type {RegExp}
 */
const STRICT_SLIDER_DECIMAL_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

// <lang><zh-CN>先校正范围与步长，再投影当前值，保证平台 slider 始终收到有限确定参数。</zh-CN><en>Normalizes range and step before projecting the current value so the platform slider always receives finite deterministic parameters.</en></lang>
const safeMin = computed(() => Number.isFinite(props.min) ? props.min : 0);
const safeMax = computed(() => Number.isFinite(props.max) ? Math.max(safeMin.value, props.max) : Math.max(safeMin.value, 100));
const safeStep = computed(() => Number.isFinite(props.step) && props.step > 0 ? props.step : 1);

/**
 * @lang zh-CN 计算 slider 网格数字所需的十进制位，支持指数记法并拒绝过高精度。
 * @lang en Computes decimal places required by a slider-grid number, supporting exponent notation and rejecting excessive precision.
 * @param {number} value <lang><zh-CN>有限的边界或步长。</zh-CN><en>Finite bound or step.</en></lang>
 * @returns {number | null} <lang><zh-CN>受限精度，或超界时的 null。</zh-CN><en>Bounded precision, or null outside the limit.</en></lang>
 */
function sliderDecimalPrecision(value) {
  // <lang><zh-CN>规范 Number 文本按指数分段，避免把 1e-7 错认为整数精度。</zh-CN><en>Canonical Number text is split at the exponent so 1e-7 is not mistaken for integer precision.</en></lang>
  const [coefficient, exponentText = '0'] = String(value).toLowerCase().split('e');
  // <lang><zh-CN>系数小数位来自小数点后的实际字符数。</zh-CN><en>Coefficient precision comes from the actual characters after its decimal point.</en></lang>
  const fractionLength = coefficient.includes('.') ? coefficient.length - coefficient.indexOf('.') - 1 : 0;
  // <lang><zh-CN>规范指数必须是整数；异常情况失败关闭。</zh-CN><en>The canonical exponent must be integral; malformed cases fail closed.</en></lang>
  const exponent = Number(exponentText);
  if (!Number.isInteger(exponent)) {
    return null;
  }

  // <lang><zh-CN>指数偏移后的实际十进制位不能超过本地安全上限。</zh-CN><en>Actual decimal places after exponent adjustment cannot exceed the local safety limit.</en></lang>
  const precision = Math.max(0, fractionLength - exponent);
  return precision <= MAX_SLIDER_DECIMAL_PRECISION ? precision : null;
}

/**
 * @lang zh-CN 为当前 min/max/step 建立相对 min 的安全整数网格；配置不安全时返回 null。
 * @lang en Builds a safe-integer grid relative to the current min/max/step; returns null for an unsafe configuration.
 * @returns {{scale: number, minimumUnits: number, maximumUnits: number, stepUnits: number, rangeUnits: number} | null} <lang><zh-CN>定点网格，或不安全配置的 null。</zh-CN><en>Fixed-point grid, or null for an unsafe configuration.</en></lang>
 */
function createSliderGrid() {
  // <lang><zh-CN>网格精度仅由 min/max/step 决定；原生 payload 的浮点噪声不应扩大 scale。</zh-CN><en>Grid precision is determined only by min/max/step; floating noise in a native payload must not enlarge the scale.</en></lang>
  const minimumPrecision = sliderDecimalPrecision(safeMin.value);
  const maximumPrecision = sliderDecimalPrecision(safeMax.value);
  const stepPrecision = sliderDecimalPrecision(safeStep.value);
  if (minimumPrecision === null || maximumPrecision === null || stepPrecision === null) {
    return null;
  }

  // <lang><zh-CN>共同 scale 将全部网格量转换到同一十进制定点单位。</zh-CN><en>A shared scale converts every grid quantity into the same decimal fixed-point unit.</en></lang>
  const scale = 10 ** Math.max(minimumPrecision, maximumPrecision, stepPrecision);
  // <lang><zh-CN>三个网格量各自四舍五入到整数单位；step 必须保持正整数。</zh-CN><en>The three grid quantities are rounded to integer units, and step must remain a positive integer.</en></lang>
  const minimumUnits = Math.round(safeMin.value * scale);
  const maximumUnits = Math.round(safeMax.value * scale);
  const stepUnits = Math.round(safeStep.value * scale);
  if (!Number.isSafeInteger(scale) || !Number.isSafeInteger(minimumUnits) || !Number.isSafeInteger(maximumUnits) || !Number.isSafeInteger(stepUnits) || stepUnits <= 0) {
    return null;
  }

  // <lang><zh-CN>范围差也必须可安全表示，防止跨越大正负端点时溢出。</zh-CN><en>The range difference must also be safely representable, preventing overflow across large negative and positive endpoints.</en></lang>
  const rangeUnits = maximumUnits - minimumUnits;
  if (!Number.isSafeInteger(rangeUnits) || rangeUnits < 0) {
    return null;
  }

  return { scale, minimumUnits, maximumUnits, stepUnits, rangeUnits };
}

/**
 * @lang zh-CN 将有限候选 clamp 并对齐到以 min 为原点的 step 网格；不会产生越过 max 的离网格值。
 * @lang en Clamps a finite candidate and aligns it to the step grid whose origin is min; never produces an off-grid value beyond max.
 * @param {number} candidate <lang><zh-CN>原生 change 或受控 model 提供的数字。</zh-CN><en>Number supplied by native change or the controlled model.</en></lang>
 * @returns {number | null} <lang><zh-CN>对齐后的有限值，或配置/候选不安全时的 null。</zh-CN><en>Aligned finite value, or null when the configuration or candidate is unsafe.</en></lang>
 */
function alignSliderValue(candidate) {
  // <lang><zh-CN>非有限候选始终保持零事件，不回退到当前值。</zh-CN><en>A non-finite candidate always remains event-free and never falls back to the current value.</en></lang>
  if (!Number.isFinite(candidate)) {
    return null;
  }

  // <lang><zh-CN>安全网格是对齐的前提；失败时不使用普通浮点近似。</zh-CN><en>A safe grid is the prerequisite for alignment; failure never uses an ordinary-floating approximation.</en></lang>
  const grid = createSliderGrid();
  if (grid === null) {
    return null;
  }

  // <lang><zh-CN>先在数值域 clamp，避免巨大 payload 在乘 scale 前溢出。</zh-CN><en>Clamps in the numeric domain first so a huge payload cannot overflow before scaling.</en></lang>
  const boundedCandidate = Math.min(safeMax.value, Math.max(safeMin.value, candidate));
  // <lang><zh-CN>候选映射为同一整数单位，必须继续满足安全整数约束。</zh-CN><en>The candidate maps into the same integer unit and must continue to satisfy the safe-integer constraint.</en></lang>
  const candidateUnits = Math.round(boundedCandidate * grid.scale);
  if (!Number.isSafeInteger(candidateUnits)) {
    return null;
  }

  // <lang><zh-CN>最大索引只覆盖完整 step，因此 max 不在网格上时不会被错误作为可达步进值。</zh-CN><en>The maximum index covers complete steps only, so a max outside the grid is never fabricated as a reachable stepped value.</en></lang>
  const maximumIndex = Math.floor(grid.rangeUnits / grid.stepUnits);
  // <lang><zh-CN>候选相对 min 四舍五入到最近网格，并再次限制在实际索引范围。</zh-CN><en>The candidate is rounded to the nearest grid point relative to min and then bounded again by the actual index range.</en></lang>
  const candidateIndex = Math.round((candidateUnits - grid.minimumUnits) / grid.stepUnits);
  const alignedIndex = Math.min(maximumIndex, Math.max(0, candidateIndex));
  // <lang><zh-CN>最终单位由 min 加完整 step 组成，因而天然保持相对 min 对齐。</zh-CN><en>Final units consist of min plus complete steps and therefore remain aligned relative to min by construction.</en></lang>
  const alignedUnits = grid.minimumUnits + alignedIndex * grid.stepUnits;
  if (!Number.isSafeInteger(alignedUnits)) {
    return null;
  }

  // <lang><zh-CN>转换回公开数字并规范负零，事件 payload 与显示值使用同一结果。</zh-CN><en>Converts back to the public number and canonicalizes negative zero so event payload and display use the same result.</en></lang>
  const alignedValue = alignedUnits / grid.scale;
  return Object.is(alignedValue, -0) ? 0 : alignedValue;
}

/**
 * @lang zh-CN 将原生 slider payload 解析为严格有限十进制值；未知或宽松类型返回 null。
 * @lang en Parses a native slider payload as a strict finite decimal value; unknown or permissive types return null.
 * @param {unknown} rawValue <lang><zh-CN>小程序 detail.value 或 H5 target.value。</zh-CN><en>Mini Program detail.value or H5 target.value.</en></lang>
 * @returns {number | null} <lang><zh-CN>有限候选，或无法确认时的 null。</zh-CN><en>Finite candidate, or null when unconfirmed.</en></lang>
 */
function parseSliderValue(rawValue) {
  // <lang><zh-CN>number payload 只需有限性检查，不经过字符串往返。</zh-CN><en>A number payload needs only a finiteness check and does not round-trip through text.</en></lang>
  if (typeof rawValue === 'number') {
    return Number.isFinite(rawValue) ? rawValue : null;
  }
  if (typeof rawValue !== 'string') {
    return null;
  }

  // <lang><zh-CN>trim 后的空串和非十进制语法均不能触发状态 intent。</zh-CN><en>An empty trimmed string and non-decimal syntax cannot trigger state intent.</en></lang>
  const normalizedText = rawValue.trim();
  if (normalizedText === '' || !STRICT_SLIDER_DECIMAL_PATTERN.test(normalizedText)) {
    return null;
  }

  // <lang><zh-CN>指数溢出仍可能产生 Infinity，因此转换后再做最终有限性门禁。</zh-CN><en>Exponent overflow can still produce Infinity, so a final finiteness gate follows conversion.</en></lang>
  const candidate = Number(normalizedText);
  return Number.isFinite(candidate) ? candidate : null;
}

// <lang><zh-CN>受控显示值和原生 value 使用同一相对 min 网格；异常 model 或网格安全失败时只呈现 safeMin，不产生事件。</zh-CN><en>The controlled display and native value use the same min-relative grid; an invalid model or unsafe grid presents safeMin only and emits nothing.</en></lang>
const safeValue = computed(() => alignSliderValue(props.modelValue) ?? safeMin.value);

/**
 * @lang zh-CN 将平台 change 值 clamp 到有限范围并报告受控事件。
 * @lang en Clamps the platform change value to the finite range and reports controlled events.
 * @param {{detail?: {value?: number}}} event <lang><zh-CN>平台滑块事件。</zh-CN><en>Platform slider event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleChange(event) {
  // <lang><zh-CN>原生 disabled 属性之外再设 handler guard，直接调用也不能绕过禁用语义。</zh-CN><en>A handler guard supplements the native disabled attribute so direct invocation cannot bypass disabled semantics.</en></lang>
  if (props.disabled) {
    return;
  }

  // <lang><zh-CN>小程序 detail.value 优先，H5 target.value 仅在缺省时回退；未知事件不使用 safeValue 伪造 change。</zh-CN><en>Mini Program detail.value takes precedence, with H5 target.value used only when absent; an unknown event never fabricates change from safeValue.</en></lang>
  const rawValue = event?.detail?.value !== undefined ? event.detail.value : event?.target?.value;
  // <lang><zh-CN>严格解析先拒绝 boolean、空值、hex 和非有限 payload。</zh-CN><en>Strict parsing first rejects booleans, empty values, hexadecimal, and non-finite payloads.</en></lang>
  const candidate = parseSliderValue(rawValue);
  if (candidate === null) {
    return;
  }

  // <lang><zh-CN>有效候选再 clamp 并对齐到相对 min 网格；不安全配置保持零事件。</zh-CN><en>A valid candidate is then clamped and aligned to the min-relative grid; an unsafe configuration remains event-free.</en></lang>
  const nextValue = alignSliderValue(candidate);
  if (nextValue === null) {
    return;
  }

  // <lang><zh-CN>固定顺序先请求 model 写回，再报告最终 change 数字。</zh-CN><en>The fixed order requests model writeback first and then reports the final change number.</en></lang>
  emit('update:modelValue', nextValue);
  emit('change', nextValue);
}
</script>

<style src="./u-slider.css"></style>
