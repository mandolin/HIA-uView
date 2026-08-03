<!--
@component UAvatarCropper
@lang zh-CN 提供调用方图片源的几何裁剪意图编辑面；组件仅投影受限 x/y/width/height 几何并报告 select、crop-change 与 confirm，不选择图片、不使用 Canvas、不处理像素或输出文件字节。
@lang en Provides a geometry-crop-intent editing surface for a caller image source; the component projects only bounded x/y/width/height geometry and reports select, crop-change, and confirm, selects no image, uses no Canvas, processes no pixels, and outputs no file bytes.
-->
<template>
  <!-- @lang zh-CN 根仅在 caller visible 且有已标注图片源或可读 select action 时输出；几何框只展示 caller crop，不产生真实裁剪结果。
  @lang en The root outputs only when caller-visible and a labeled image source or readable select action exists; the geometry frame displays caller crop only and produces no actual cropped result.
  <lang><zh-CN>调整 control 由 caller 声明的有限 delta 组成，select/confirm 也只转发局部意图。</zh-CN><en>Adjustment controls consist of caller-declared finite deltas; select/confirm also forward local intent only.</en></lang>
  -->
  <view v-if="isRenderable" class="u-avatar-cropper" role="group" :aria-label="safeAlt">
    <view v-if="hasSource" class="u-avatar-cropper__preview"><UImage :src="safeSrc" :alt="safeAlt" size="large" shape="rounded" :show-error="false" /><view class="u-avatar-cropper__geometry" :style="geometryStyle" /></view>
    <view v-if="hasSource && safeAdjustments.length > 0" class="u-avatar-cropper__adjustments"><button v-for="adjustment in safeAdjustments" :key="adjustment.key" class="u-avatar-cropper__adjustment" type="button" :disabled="disabled || adjustment.disabled" @click="emitCropChange(adjustment, $event)"><text>{{ adjustment.label }}</text></button></view>
    <view v-if="hasActions" class="u-avatar-cropper__actions"><button v-if="safeSelectText" class="u-avatar-cropper__action" type="button" :disabled="disabled" @click="emitSelect"><text>{{ safeSelectText }}</text></button><button v-if="hasSource && safeConfirmText" class="u-avatar-cropper__confirm" type="button" :disabled="disabled" @click="emitConfirm"><text>{{ safeConfirmText }}</text></button></view>
  </view>
</template>

<script setup>
import { computed } from 'vue';
import UImage from '../u-image/u-image.vue';

// <lang><zh-CN>稳定名称保留头像裁剪迁移入口；实现是无 Canvas/无二进制的受控几何意图面。</zh-CN><en>The stable name retains an avatar-crop migration entry; the implementation is a controlled geometry-intent surface without Canvas or binary handling.</en></lang>
defineOptions({ name: 'u-avatar-cropper' });

// <lang><zh-CN>调用方拥有可见性、图片源、替代文字、受控几何、有限调整和所有 action 文字；组件不接收 chooser、file、Canvas 或上传配置。</zh-CN><en>The caller owns visibility, image source, alt copy, controlled geometry, finite adjustments, and all action copy; the component accepts no chooser, file, Canvas, or upload configuration.</en></lang>
const props = defineProps({
  // <lang><zh-CN>可见性默认关闭，避免挂载时建立裁剪 UI 或任何平台访问。</zh-CN><en>Visibility defaults off, avoiding creation of crop UI or any platform access on mount.</en></lang>
  visible: { type: Boolean, default: false },
  // <lang><zh-CN>src 只是 caller-owned 原生图片投影；组件不读取、下载、缓存或解释其 bytes。</zh-CN><en>Src is only a caller-owned native-image projection; the component reads, downloads, caches, and interprets none of its bytes.</en></lang>
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  // <lang><zh-CN>geometry 采用比例 x/y/width/height；每个值会被收束到有限可见矩形，不写回 prop。</zh-CN><en>Geometry uses proportional x/y/width/height; every value is constrained to a finite visible rectangle and writes back no prop.</en></lang>
  geometry: { type: Object, default: () => ({}) },
  // <lang><zh-CN>每项 adjustment 是 caller-labeled 有限几何 delta；最多八项，不接收手势、触点或任意脚本。</zh-CN><en>Every adjustment is a caller-labeled finite geometry delta; at most eight items are accepted and no gesture, touch point, or arbitrary script is received.</en></lang>
  adjustments: { type: Array, default: () => [] },
  // <lang><zh-CN>select/confirm 的可读文字由 caller 提供；空值不输出对应 control。</zh-CN><en>Readable select/confirm copy is caller-provided; empty values output no corresponding control.</en></lang>
  selectText: { type: String, default: '' },
  confirmText: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
});

// <lang><zh-CN>事件只报告 caller-owned 图片选择、下一几何或确认意图；应用决定 chooser、裁剪、像素输出与上传。</zh-CN><en>Events report caller-owned image selection, next geometry, or confirm intent only; the application decides chooser, crop, pixel output, and upload.</en></lang>
const emit = defineEmits(['select', 'crop-change', 'confirm']);

/**
 * @lang zh-CN 将任意候选数收束为闭区间中的有限数；NaN/Infinity/非数值回退指定值。
 * @lang en Constrains any candidate number to a finite value in a closed interval; NaN/infinity/non-number falls back to a specified value.
 * @param {unknown} value <lang><zh-CN>候选数。</zh-CN><en>Candidate number.</en></lang>
 * @param {number} minimum <lang><zh-CN>允许最小值。</zh-CN><en>Allowed minimum.</en></lang>
 * @param {number} maximum <lang><zh-CN>允许最大值。</zh-CN><en>Allowed maximum.</en></lang>
 * @param {number} fallback <lang><zh-CN>无效候选时的回退值。</zh-CN><en>Fallback for invalid candidate.</en></lang>
 * @returns {number} <lang><zh-CN>受限有限数。</zh-CN><en>Constrained finite number.</en></lang>
 */
function boundedNumber(value, minimum, maximum, fallback) {
  // <lang><zh-CN>先转换并确认有限性，再执行区间收束，避免任意字符串或无穷值进入 CSS 几何。</zh-CN><en>First converts and confirms finiteness, then constrains interval, preventing arbitrary strings or infinity from entering CSS geometry.</en></lang>
  const candidate = Number(value);
  if (!Number.isFinite(candidate)) return fallback;
  return Math.min(maximum, Math.max(minimum, candidate));
}

/**
 * @lang zh-CN 规范化调用方几何为始终落在 0–1 边界内的矩形；不读取图片真实尺寸或像素。
 * @lang en Normalizes caller geometry to a rectangle always inside zero-to-one boundaries; it reads no actual image size or pixels.
 * @param {unknown} geometry <lang><zh-CN>调用方候选几何对象。</zh-CN><en>Caller candidate geometry object.</en></lang>
 * @returns {{x: number, y: number, width: number, height: number}} <lang><zh-CN>受限比例几何。</zh-CN><en>Constrained proportional geometry.</en></lang>
 */
function normalizeGeometry(geometry) {
  // <lang><zh-CN>只读取普通对象字段；非对象回退为完整可见矩形，仍不推断像素或业务含义。</zh-CN><en>Reads plain-object fields only; a non-object falls back to a complete visible rectangle and still infers no pixel or business meaning.</en></lang>
  const source = geometry !== null && typeof geometry === 'object' ? geometry : {};
  const width = boundedNumber(source.width, 0.05, 1, 1);
  const height = boundedNumber(source.height, 0.05, 1, 1);
  const x = boundedNumber(source.x, 0, 1 - width, 0);
  const y = boundedNumber(source.y, 0, 1 - height, 0);
  return Object.freeze({ x, y, width, height });
}

// <lang><zh-CN>图片和替代文字必须同时明确，才形成可发现的原生图片投影；避免无替代文字的裁剪入口。</zh-CN><en>Image and alt copy must both be explicit before forming a discoverable native-image projection, avoiding a crop entry with no alternative text.</en></lang>
const safeSrc = computed(() => typeof props.src === 'string' ? props.src : '');
const safeAlt = computed(() => typeof props.alt === 'string' ? props.alt : '');
const hasSource = computed(() => safeSrc.value.trim().length > 0 && safeAlt.value.trim().length > 0);

// <lang><zh-CN>当前几何仅来自 caller prop 的受限投影；组件不保存上一次 adjustment 或图片状态。</zh-CN><en>Current geometry comes only from constrained caller-prop projection; the component stores no prior adjustment or image state.</en></lang>
const safeGeometry = computed(() => normalizeGeometry(props.geometry));

/**
 * @lang zh-CN 将一项 caller adjustment 规范化为可读 label 和受限 delta；不可读项返回 null。
 * @lang en Normalizes one caller adjustment into readable label and constrained delta; an unreadable item returns null.
 * @param {unknown} adjustment <lang><zh-CN>调用方 adjustment 候选。</zh-CN><en>Caller adjustment candidate.</en></lang>
 * @param {number} index <lang><zh-CN>受限索引，仅用于稳定模板键。</zh-CN><en>Bounded index, used only for a stable template key.</en></lang>
 * @returns {{key: string, label: string, delta: {x: number, y: number, width: number, height: number}, disabled: boolean}|null} <lang><zh-CN>规范化 adjustment 或 null。</zh-CN><en>Normalized adjustment or null.</en></lang>
 */
function normalizeAdjustment(adjustment, index) {
  // <lang><zh-CN>只允许对象和显式字符串标签；delta 不是手势、脚本或 canvas 命令。</zh-CN><en>Allows only objects and explicit string label; delta is not a gesture, script, or canvas command.</en></lang>
  if (adjustment === null || typeof adjustment !== 'object') return null;
  const label = typeof adjustment.label === 'string' ? adjustment.label : '';
  if (label.trim().length === 0) return null;
  const candidateDelta = adjustment.delta !== null && typeof adjustment.delta === 'object' ? adjustment.delta : {};
  const delta = Object.freeze({
    x: boundedNumber(candidateDelta.x, -1, 1, 0),
    y: boundedNumber(candidateDelta.y, -1, 1, 0),
    width: boundedNumber(candidateDelta.width, -1, 1, 0),
    height: boundedNumber(candidateDelta.height, -1, 1, 0)
  });
  return Object.freeze({ key: `adjustment-${index}`, label, delta, disabled: Boolean(adjustment.disabled) });
}

// <lang><zh-CN>调整项最多八项，避免任意大控制列表或未审阅动态 UI；不会 mutate caller 数组。</zh-CN><en>At most eight adjustment items are retained, avoiding arbitrary large control lists or unreviewed dynamic UI; caller array is never mutated.</en></lang>
const safeAdjustments = computed(() => (Array.isArray(props.adjustments) ? props.adjustments : []).slice(0, 8).map(normalizeAdjustment).filter((adjustment) => adjustment !== null));

// <lang><zh-CN>action 文字只接受明确字符串，避免不匹配 prop 形成无标签或对象化 control。</zh-CN><en>Action copy accepts explicit strings only, preventing mismatched props from forming unlabeled or objectified controls.</en></lang>
const safeSelectText = computed(() => typeof props.selectText === 'string' ? props.selectText : '');
const safeConfirmText = computed(() => typeof props.confirmText === 'string' ? props.confirmText : '');

// <lang><zh-CN>无图片仍可显示明确 select intent；确认和 adjustment 则必须存在带替代文字的图片投影。</zh-CN><en>With no image, explicit select intent may still display; confirm and adjustment require an image projection with alternative copy.</en></lang>
const hasActions = computed(() => safeSelectText.value.trim().length > 0 || (hasSource.value && safeConfirmText.value.trim().length > 0));
const isRenderable = computed(() => props.visible && (hasSource.value || safeSelectText.value.trim().length > 0));

// <lang><zh-CN>动态样式只投影已收束的百分比几何到组件私有 custom property；CSS 保留遮罩视觉，而不计算像素裁剪。</zh-CN><en>Dynamic style projects only constrained percentage geometry into component-private custom properties; CSS retains frame visuals and computes no pixel crop.</en></lang>
const geometryStyle = computed(() => ({
  '--u-avatar-cropper-x': `${safeGeometry.value.x * 100}%`,
  '--u-avatar-cropper-y': `${safeGeometry.value.y * 100}%`,
  '--u-avatar-cropper-width': `${safeGeometry.value.width * 100}%`,
  '--u-avatar-cropper-height': `${safeGeometry.value.height * 100}%`
}));

/**
 * @lang zh-CN 报告 caller 请求选择图片的意图；不调用 chooser 或创建文件。
 * @lang en Reports caller intent to select an image; it calls no chooser and creates no file.
 * @param {unknown} event <lang><zh-CN>原始点击事件。</zh-CN><en>Original click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `select`。</zh-CN><en>No return value; emits `select` when the guard passes.</en></lang>
 */
function emitSelect(event) {
  // <lang><zh-CN>guard 保持 caller visible、enabled 和可读 select 标签边界。</zh-CN><en>The guard retains caller-visible, enabled, and readable-select-label boundaries.</en></lang>
  if (!isRenderable.value || props.disabled || safeSelectText.value.trim().length === 0) return;
  emit('select', event);
}

/**
 * @lang zh-CN 基于 caller adjustment 计算并报告下一受限几何；组件不写 prop、拖动图片或读取像素。
 * @lang en Computes and reports next constrained geometry from caller adjustment; the component writes no prop, drags no image, and reads no pixel.
 * @param {{delta: {x: number, y: number, width: number, height: number}, disabled: boolean}} adjustment <lang><zh-CN>已规范化 adjustment。</zh-CN><en>Normalized adjustment.</en></lang>
 * @param {unknown} event <lang><zh-CN>原始点击事件。</zh-CN><en>Original click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `crop-change`。</zh-CN><en>No return value; emits `crop-change` when the guard passes.</en></lang>
 */
function emitCropChange(adjustment, event) {
  // <lang><zh-CN>guard 确保无源、禁用或单项禁用时没有隐式 crop 状态变化。</zh-CN><en>The guard ensures no implicit crop-state change with no source, disabled state, or per-item disabled state.</en></lang>
  if (!isRenderable.value || !hasSource.value || props.disabled || adjustment.disabled) return;
  const geometry = normalizeGeometry({
    x: safeGeometry.value.x + adjustment.delta.x,
    y: safeGeometry.value.y + adjustment.delta.y,
    width: safeGeometry.value.width + adjustment.delta.width,
    height: safeGeometry.value.height + adjustment.delta.height
  });
  emit('crop-change', { geometry, event });
}

/**
 * @lang zh-CN 报告当前受限几何的确认意图；不执行裁剪、选择、上传或文件输出。
 * @lang en Reports confirm intent for current constrained geometry; it performs no crop, selection, upload, or file output.
 * @param {unknown} event <lang><zh-CN>原始点击事件。</zh-CN><en>Original click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit `confirm`。</zh-CN><en>No return value; emits `confirm` when the guard passes.</en></lang>
 */
function emitConfirm(event) {
  // <lang><zh-CN>确认要求真实 caller 源、可读 action 与 enabled；否则不伪称生成了裁剪结果。</zh-CN><en>Confirm requires actual caller source, readable action, and enabled state; otherwise it does not falsely claim a crop result was generated.</en></lang>
  if (!isRenderable.value || !hasSource.value || props.disabled || safeConfirmText.value.trim().length === 0) return;
  emit('confirm', { geometry: safeGeometry.value, event });
}
</script>

<style src="./u-avatar-cropper.css"></style>
