<!--
@component UImage
@lang zh-CN 呈现调用方提供的原生图片源、尺寸形状和替代文字；不负责请求、缓存、上传、下载或内置资产。
@lang en Presents a caller-provided native image source, size, shape, and alternative text; it owns no request, cache, upload, download, or bundled asset.
-->
<template>
  <!--
  @lang zh-CN 根节点只把本地 click 意图交还调用方，不把图片点击解释为导航、预览、下载或远程操作。
  @lang en The root returns only local click intent to the caller and never interprets an image click as navigation, preview, download, or remote operation.
  -->
  <view :class="rootClasses" role="img" :aria-label="alt || errorText" @click="handleClick">
    <image
      v-if="!hasError || !showError"
      :key="src"
      class="u-image__native"
      :src="src"
      :mode="safeMode"
      :lazy-load="lazyLoad"
      @load="handleLoad"
      @error="handleError"
    />
    <text v-if="hasError && showError" class="u-image__fallback">{{ errorText }}</text>
  </view>
</template>

<script setup>
import { computed, ref, toRef, watch } from 'vue';

// <lang><zh-CN>模板名保持 u-image 迁移熟悉度，但 src、alt、点击含义和错误后续均由调用方拥有。</zh-CN><en>Retains the u-image migration name while the caller owns src, alt, click meaning, and all error follow-up.</en></lang>
defineOptions({ name: 'u-image' });

// <lang><zh-CN>图片只接收有限原生呈现选项与调用方文字；它不接收请求、缓存、上传、下载或预览流程参数。</zh-CN><en>The image accepts only bounded native-presentation options and caller text; it accepts no request, cache, upload, download, or preview-flow parameter.</en></lang>
const props = defineProps({
  // <lang><zh-CN>图片来源由调用方提供；组件不解析、补全或请求该字符串。</zh-CN><en>The caller supplies the image source; the component never parses, completes, or requests this string.</en></lang>
  src: { type: String, default: '' },
  // <lang><zh-CN>替代文字描述可见图片内容，并同时作为根节点的无障碍名称。</zh-CN><en>Alternative text describes the visible image content and also names the root for accessibility.</en></lang>
  alt: { type: String, default: '' },
  // <lang><zh-CN>原生缩放模式只经过有限 allowlist 投影，未知值稳定回退。</zh-CN><en>The native scaling mode is projected through a finite allowlist and unknown values fall back deterministically.</en></lang>
  mode: { type: String, default: 'aspectFill' },
  // <lang><zh-CN>形状只选择受控的直角、圆角或圆形外观。</zh-CN><en>Shape selects only a controlled square, rounded, or circular appearance.</en></lang>
  shape: { type: String, default: 'square' },
  // <lang><zh-CN>固定尺寸只选择主题声明的三档几何；调用方不能注入任意尺寸值。</zh-CN><en>Fixed size selects only the three theme-declared geometries; callers cannot inject arbitrary dimensions.</en></lang>
  size: { type: String, default: 'medium' },
  // <lang><zh-CN>流式模式让根节点填满父容器的显式宽高；组件仍不测量 viewport、内容或图片固有尺寸。</zh-CN><en>Fluid mode fills the parent's explicit width and height while the component still measures neither viewport, content, nor intrinsic image size.</en></lang>
  fluid: { type: Boolean, default: false },
  // <lang><zh-CN>延迟加载只透传给原生图片节点，不建立缓存或预取策略。</zh-CN><en>Lazy loading is forwarded only to the native image node and establishes no cache or prefetch policy.</en></lang>
  lazyLoad: { type: Boolean, default: true },
  // <lang><zh-CN>错误可见性只控制本地 fallback 投影，不改变错误事件。</zh-CN><en>Error visibility controls only the local fallback projection and never changes error events.</en></lang>
  showError: { type: Boolean, default: true },
  // <lang><zh-CN>错误文字由调用方本地化；默认值仅提供双语中性兜底。</zh-CN><en>The caller localizes error copy; the default provides only a neutral bilingual fallback.</en></lang>
  errorText: { type: String, default: '图片不可用 / Image unavailable' }
});

// <lang><zh-CN>load/error/click 只报告本地原生呈现或调用方意图，不把平台结果转换成远程错误协议或图片操作流程。</zh-CN><en>load/error/click report only local native presentation or caller intent and never turn platform results into a remote error protocol or image-operation flow.</en></lang>
const emit = defineEmits(['load', 'error', 'click']);

// <lang><zh-CN>错误状态只属于当前组件实例，加载成功会清除它；状态不写入调用方来源、缓存或全局 store。</zh-CN><en>Error state belongs only to the current component instance and a successful load clears it; it writes neither caller source, cache, nor global store.</en></lang>
const hasError = ref(false);

// <lang><zh-CN>来源 ref 只为观察调用方 src identity 边界；它不解析 URL、不启动请求，也不缓存历史来源。</zh-CN><en>The source ref observes only the caller src identity boundary; it parses no URL, starts no request, and caches no source history.</en></lang>
const sourceRef = toRef(props, 'src');

/**
 * @lang zh-CN 在调用方更换 src 时清除当前来源的错误呈现，使 keyed 原生图片节点能够重新建立。
 * @lang en Clears error presentation for the current source when the caller changes src so the keyed native image node can be recreated.
 * @returns {void} <lang><zh-CN>无返回值；只重置当前实例的本地错误状态。</zh-CN><en>No return value; resets only this instance's local error state.</en></lang>
 */
function resetErrorForSourceChange() {
  // <lang><zh-CN>来源变化是明确的恢复边界；组件不声称识别所有平台迟到的旧来源事件竞态。</zh-CN><en>A source change is the explicit recovery boundary; the component does not claim to identify every late old-source platform-event race.</en></lang>
  hasError.value = false;
}

// <lang><zh-CN>watch 只响应 src 值变化；相同字符串不会隐式重试或重建。</zh-CN><en>The watch responds only to a changed src value; the same string causes no implicit retry or recreation.</en></lang>
watch(sourceRef, resetErrorForSourceChange);

// <lang><zh-CN>仅允许已知原生 mode，未知值回退到 aspectFill。</zh-CN><en>Allows only known native modes and falls back to aspectFill for unknown values.</en></lang>
const safeMode = computed(() => ['scaleToFill', 'aspectFit', 'aspectFill', 'widthFix', 'heightFix', 'top', 'bottom', 'center', 'left', 'right'].includes(props.mode) ? props.mode : 'aspectFill');

// <lang><zh-CN>根类仅由有限的形状、尺寸、流式布局与本地错误状态组合，避免调用方字符串进入未受限 CSS 类。</zh-CN><en>Root classes combine only finite shape, size, fluid layout, and local error state, preventing caller strings from entering unconstrained CSS classes.</en></lang>
const rootClasses = computed(() => {
  // <lang><zh-CN>未知形状稳定回退为 square，保持本地展示而不扩大 CSS 表面。</zh-CN><en>An unknown shape stably falls back to square, retaining local presentation without expanding the CSS surface.</en></lang>
  const shape = ['square', 'rounded', 'circle'].includes(props.shape) ? props.shape : 'square';

  // <lang><zh-CN>未知尺寸稳定回退为 medium，组件不测量 viewport 或重排父级布局。</zh-CN><en>An unknown size stably falls back to medium; the component neither measures the viewport nor reflows parent layout.</en></lang>
  const size = ['small', 'medium', 'large'].includes(props.size) ? props.size : 'medium';
  // <lang><zh-CN>fluid 是显式 Boolean opt-in；固定尺寸类仍保留为无流式模式时的稳定 fallback。</zh-CN><en>Fluid is an explicit Boolean opt-in; the fixed-size class remains as the stable fallback when fluid mode is absent.</en></lang>
  return ['u-image', `u-image--${shape}`, `u-image--${size}`, {
    'u-image--fluid': props.fluid,
    'u-image--error': hasError.value
  }];
});

/**
 * @lang zh-CN 报告原生图片加载意图并清除当前错误显示。
 * @lang en Reports native image-load intent and clears the current error presentation.
 * @param {unknown} event <lang><zh-CN>原生加载事件。</zh-CN><en>Native load event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleLoad(event) {
  // <lang><zh-CN>原生加载成功仅清除当前实例的错误呈现，不修改调用方的 source 或业务状态。</zh-CN><en>Native load success clears only this instance's error presentation and does not modify caller source or business state.</en></lang>
  hasError.value = false;

  // <lang><zh-CN>原样回传平台事件，方便调用方自行记录或决定后续界面。</zh-CN><en>Forwards the platform event unchanged so the caller may independently record it or decide later UI.</en></lang>
  emit('load', event);
}

/**
 * @lang zh-CN 报告原生图片错误并显示调用方提供的中性 fallback 文字。
 * @lang en Reports a native image error and displays caller-provided neutral fallback copy.
 * @param {unknown} event <lang><zh-CN>原生错误事件。</zh-CN><en>Native error event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleError(event) {
  // <lang><zh-CN>原生错误只切换当前 fallback 呈现，不尝试补源、重试、下载或报告远程协议。</zh-CN><en>A native error switches only current fallback presentation and does not attempt source replacement, retry, download, or remote-protocol reporting.</en></lang>
  hasError.value = true;

  // <lang><zh-CN>原样回传平台事件，由调用方决定是否记录、替换来源或改变页面状态。</zh-CN><en>Forwards the platform event unchanged; the caller decides whether to record it, replace the source, or change page state.</en></lang>
  emit('error', event);
}

/**
 * @lang zh-CN 转发图片根的原始本地 click 意图；本函数不打开预览、下载资源、导航或解释图片业务含义。
 * @lang en Forwards original local click intent from the image root; this function opens no preview, downloads no resource, routes nowhere, and interprets no image business meaning.
 * @param {unknown} event <lang><zh-CN>根节点提供的本地点击事件。</zh-CN><en>Local click event supplied by the root node.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；emit 原始 `click`。</zh-CN><en>No return value; emits original `click`.</en></lang>
 */
function handleClick(event) {
  // <lang><zh-CN>点击语义完全由调用方拥有，因此无需内部 guard、状态写回或平台 API 调用。</zh-CN><en>Click meaning belongs entirely to the caller, so no internal guard, state write-back, or platform API call is required.</en></lang>
  emit('click', event);
}
</script>

<style src="./u-image.css"></style>
