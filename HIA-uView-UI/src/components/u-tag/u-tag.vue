<!--
@component UTag
@lang zh-CN 提供有限 tone/size/shape 的中性文字标签、显式 clickable action 与可选 close intent；不拥有分类 registry 或任意样式脚本。
@lang en Provides a neutral text tag with finite tone/size/shape, an explicit clickable action, and optional close intent; it owns no category registry or arbitrary style script.
-->
<template>
  <!--
  @lang zh-CN 根仅在两个受控可见性输入均允许时投影；标签不根据分类、路由或业务状态自行隐藏。
  @lang en The root projects only when both controlled visibility inputs allow it; the tag never hides itself from category, routing, or business state.
  -->
  <view v-if="isVisible" :class="rootClasses">
    <!--
    @lang zh-CN 默认 slot 优先呈现调用方内容；缺少 slot 时才显示 string/number `text`，数字零被保留且不生成类别名称或默认业务文案。
    @lang en The default slot presents caller content first; only without that slot does string/number `text` appear, preserving numeric zero and generating no category name or default business copy.
    -->
    <!--
    @lang zh-CN 只有调用方显式开启 clickable 时才创建原生 button；默认标签保持纯信息语义，closable 与 clickable 同时存在时两个 control 仍是兄弟节点而非嵌套按钮。
    @lang en A native button exists only when the caller explicitly enables clickable; the default tag remains informational, and close plus click controls stay siblings rather than nested buttons when both are present.
    -->
    <button v-if="props.clickable" class="u-tag__action" type="button" :disabled="Boolean(props.disabled)" @click="handleClick">
      <text class="u-tag__text"><slot>{{ displayText }}</slot></text>
    </button>
    <text v-else class="u-tag__text"><slot>{{ displayText }}</slot></text>
    <button v-if="closable" class="u-tag__close" type="button" :disabled="disabled" @click.stop="handleClose">×</button>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>模板名使用熟悉的 u-tag，tone 只映射本仓有限 token。</zh-CN><en>Uses the familiar u-tag template name while tone maps only to this repository's finite tokens.</en></lang>
defineOptions({ name: 'u-tag' });

// <lang><zh-CN>标签只接受调用方可见文字、有限视觉 token 与局部意图 guard；它不接收分类 registry、任意 CSS、请求或业务字段。</zh-CN><en>The tag accepts only caller-visible text, finite visual tokens, and local-intent guards; it accepts no category registry, arbitrary CSS, request, or business field.</en></lang>
const props = defineProps({
  // <lang><zh-CN>`text` 保持上游的 string/number 运行时形状；组件仅投影该值，不转换为类别或领域文案。</zh-CN><en>`text` retains the upstream string/number runtime shape; the component only projects it and never converts it into category or domain copy.</en></lang>
  text: { type: [String, Number], default: '' },
  // <lang><zh-CN>`tone` 映射本仓有限主题 token，未知值稳定回退，绝不接受原始色值或样式脚本。</zh-CN><en>`tone` maps repository-finite theme tokens and safely falls back on unknown input; it never accepts raw color values or style scripts.</en></lang>
  tone: { type: String, default: 'neutral' },
  // <lang><zh-CN>`size` 只选择三个本地预定义尺寸，不测量容器或设备。</zh-CN><en>`size` selects only three local predefined sizes and measures neither container nor device.</en></lang>
  size: { type: String, default: 'medium' },
  // <lang><zh-CN>`shape` 只选择有限圆角形式，不透传调用方 CSS。</zh-CN><en>`shape` selects only finite corner forms and never passes caller CSS through.</en></lang>
  shape: { type: String, default: 'rounded' },
  // <lang><zh-CN>`appearance` 只选择实心或描边两种受控表面；描边继续使用所选 tone 的文字颜色，不接受任意颜色。</zh-CN><en>`appearance` selects only controlled solid or outline surfaces; outline continues using the chosen tone's text color and accepts no arbitrary color.</en></lang>
  appearance: { type: String, default: 'solid' },
  // <lang><zh-CN>`clickable` 必须由调用方显式开启才提供标签主体 action；默认 false 保持状态 badge、分类文字和说明标签的非交互语义。</zh-CN><en>`clickable` must be explicitly enabled by the caller to provide a body action; default false preserves non-interactive semantics for status badges, category copy, and explanatory tags.</en></lang>
  clickable: { type: Boolean, default: false },
  // <lang><zh-CN>`closable` 只决定是否提供本地关闭意图 control；组件不会自行修改可见性。</zh-CN><en>`closable` decides only whether to provide a local close-intent control; the component never changes visibility itself.</en></lang>
  closable: { type: Boolean, default: false },
  // <lang><zh-CN>`visible` 是既有 HIA 输入；它与 `show` 以交集规则共存，避免破坏已有调用方的隐藏语义。</zh-CN><en>`visible` is the existing HIA input; it coexists with `show` through an intersection rule, avoiding disruption of existing caller hide semantics.</en></lang>
  visible: { type: Boolean, default: true },
  // <lang><zh-CN>`show` 是迁移用的同名 Boolean 可见性输入；它不替代 `visible`，任一为 false 均隐藏当前局部标签。</zh-CN><en>`show` is the migration Boolean visibility input with the same name; it does not replace `visible`, and either false value hides the current local tag.</en></lang>
  show: { type: Boolean, default: true },
  // <lang><zh-CN>`disabled` 保持上游 Boolean/String 形状，并只阻止本地 click/close intent；它不是身份、权限或业务状态。</zh-CN><en>`disabled` retains the upstream Boolean/String shape and only blocks local click/close intent; it is not identity, authorization, or business state.</en></lang>
  disabled: { type: [Boolean, String], default: false }
});

// <lang><zh-CN>两个事件只报告调用方显式开放的局部 intent；组件不写状态、不导航，也不执行分类或业务流程。</zh-CN><en>The two events report only caller-explicit local intent; the component writes no state, navigates nowhere, and executes no category or business flow.</en></lang>
const emit = defineEmits(['click', 'close']);
// <lang><zh-CN>可见性取交集确保新增 `show` 默认不改变既有 `visible` 调用；任一显式 false 都保持为稳定的本地隐藏控制。</zh-CN><en>Visibility intersection ensures the new default `show` does not change existing `visible` calls; either explicit false remains a stable local hide control.</en></lang>
const isVisible = computed(() => props.visible && props.show);
// <lang><zh-CN>将数字文字显式转为可呈现字符串，保留零值并避免模板依赖隐式业务格式化。</zh-CN><en>Explicitly converts numeric text into renderable string, preserving zero and avoiding template dependence on implicit business formatting.</en></lang>
const displayText = computed(() => String(props.text));
// <lang><zh-CN>根 class 只由有限 tone/size/shape/appearance 和禁用状态派生；它不读取父页面样式、全局配置或平台信息。</zh-CN><en>Root classes derive only from finite tone/size/shape/appearance and disabled state; they read no parent-page style, global configuration, or platform information.</en></lang>
const rootClasses = computed(() => {
  // <lang><zh-CN>未知 tone 回退 neutral，防止任意 class 片段进入渲染树。</zh-CN><en>Unknown tone falls back to neutral, preventing arbitrary class fragments from entering the render tree.</en></lang>
  const tone = ['neutral', 'primary', 'accent'].includes(props.tone) ? props.tone : 'neutral';
  // <lang><zh-CN>未知 size 回退 medium，保持 token 集合和组件几何可审计。</zh-CN><en>Unknown size falls back to medium, keeping the token set and component geometry auditable.</en></lang>
  const size = ['small', 'medium', 'large'].includes(props.size) ? props.size : 'medium';
  // <lang><zh-CN>未知 shape 回退 rounded，不将调用方文本解释为 CSS class。</zh-CN><en>Unknown shape falls back to rounded and never interprets caller text as a CSS class.</en></lang>
  const shape = ['square', 'rounded', 'pill'].includes(props.shape) ? props.shape : 'rounded';
  // <lang><zh-CN>未知 appearance 回退 solid，保持既有调用方视觉并拒绝任意 class 片段。</zh-CN><en>An unknown appearance falls back to solid, preserving existing caller visuals and rejecting arbitrary class fragments.</en></lang>
  const appearance = ['solid', 'outline'].includes(props.appearance) ? props.appearance : 'solid';
  // <lang><zh-CN>返回稳定 BEM class 列表；clickable 只表示存在主体 action，disabled 只表示局部交互 guard。</zh-CN><en>Returns a stable BEM class list; clickable only denotes a body action, while disabled represents only a local interaction guard.</en></lang>
  return ['u-tag', `u-tag--${tone}`, `u-tag--${size}`, `u-tag--${shape}`, `u-tag--${appearance}`, { 'u-tag--clickable': props.clickable, 'u-tag--disabled': props.disabled }];
});

/**
 * @lang zh-CN 报告显式 clickable 标签的本地 click intent；非 clickable 或禁用时保持零事件。
 * @lang en Reports local click intent for an explicitly clickable tag and retains zero events while non-clickable or disabled.
 * @param {unknown} event <lang><zh-CN>本地点击事件。</zh-CN><en>Local click event.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleClick(event) {
  // <lang><zh-CN>显式 clickable 与禁用 guard 均先于 emit，默认信息标签和任一 disabled 形状都不会泄露局部 intent。</zh-CN><en>Explicit clickable and disabled guards both precede emit, so a default informational tag and either disabled shape leak no local intent.</en></lang>
  if (!props.clickable || props.disabled) return;
  // <lang><zh-CN>保留原始本地事件给调用方；标签不解释点击的后续动作。</zh-CN><en>Preserves the original local event for the caller; the tag does not interpret the click's follow-up action.</en></lang>
  emit('click', event);
}

/**
 * @lang zh-CN 报告关闭意图；组件不自行隐藏，调用方通过 visible 决定结果。
 * @lang en Reports close intent; the component does not hide itself and the caller decides through visible.
 * @returns {void} <lang><zh-CN>无返回值。</zh-CN><en>No return value.</en></lang>
 */
function handleClose() {
  // <lang><zh-CN>关闭同样受 disabled guard 约束，避免视觉禁用时仍产生状态修改意图。</zh-CN><en>Close uses the same disabled guard, preventing state-change intent while visually disabled.</en></lang>
  if (props.disabled) return;
  // <lang><zh-CN>只发出关闭意图；调用方决定是否把 `show`、`visible` 或其他局部状态改为 false。</zh-CN><en>Emits close intent only; the caller decides whether to set `show`, `visible`, or another local state to false.</en></lang>
  emit('close');
}
</script>

<style src="./u-tag.css"></style>
