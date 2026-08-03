<!--
@component UConfigProvider
@lang zh-CN 提供 caller-owned 的有限 theme/density/locale 子树 scope 与默认 slot；它不读取系统语言、不持久化、不加载翻译或全局修改任何设置。
@lang en Provides a caller-owned finite theme/density/locale subtree scope and default slot; it reads no system language, persists nothing, loads no translations, and globally mutates no setting.
-->
<template>
  <!-- @lang zh-CN 受控模板呈现说明如下。
  @lang en Controlled template-presentation explanation follows.
  <lang><zh-CN>provider 只包装当前子树并输出规范化 class/data attributes；它不越出 caller 的组件树写全局根。</zh-CN><en>The provider wraps only the current subtree and outputs normalized class/data attributes; it does not write a global root outside the caller component tree.</en></lang> -->
  <view :class="providerClasses" :data-u-theme="safeTheme" :data-u-density="safeDensity" :data-u-locale="safeLocale"><slot /></view>
</template>

<script setup>
import { computed, provide } from 'vue';
import { normalizeULocale, U_LOCALE_CONTEXT } from '../../config-locale.mjs';

// <lang><zh-CN>稳定名称服务受限配置子树；它不是 application-wide config singleton。</zh-CN><en>The stable name serves a constrained configuration subtree; it is not an application-wide config singleton.</en></lang>
defineOptions({ name: 'u-config-provider' });

// <lang><zh-CN>当前 theme/density 只允许已文档化的浅色与两档密度；未来新增值需独立契约和 token 审计。</zh-CN><en>Current theme/density permits documented light and two density levels only; new values require independent contract and token audit.</en></lang>
const supportedThemes = Object.freeze(['light']);
const supportedDensities = Object.freeze(['comfortable', 'compact']);

// <lang><zh-CN>调用方拥有有限 scope 选择；locale 只接受当前双语 UI contract，不读取系统、账号或 source-comment 设置。</zh-CN><en>The caller owns finite scope selection; locale accepts only the current bilingual UI contract and reads no system, account, or source-comment setting.</en></lang>
const props = defineProps({ theme: { type: String, default: 'light' }, density: { type: String, default: 'comfortable' }, locale: { type: String, default: 'zh-Hans' } });

// <lang><zh-CN>未知 theme 回退 light，保持当前唯一主题实现诚实可审计。</zh-CN><en>An unknown theme falls back to light, keeping the current sole theme implementation honest and auditable.</en></lang>
const safeTheme = computed(() => supportedThemes.includes(props.theme) ? props.theme : 'light');

// <lang><zh-CN>未知 density 回退 comfortable，不将任意字符串暴露为 CSS class。</zh-CN><en>An unknown density falls back to comfortable and exposes no arbitrary string as a CSS class.</en></lang>
const safeDensity = computed(() => supportedDensities.includes(props.density) ? props.density : 'comfortable');

// <lang><zh-CN>locale 归一化由共享纯 helper 完成，未知输入稳定回退 `zh-Hans`，不触发翻译或内容投影。</zh-CN><en>Locale normalization uses the shared pure helper; unknown input stably falls back to `zh-Hans` and triggers no translation or content projection.</en></lang>
const safeLocale = computed(() => normalizeULocale(props.locale));

// <lang><zh-CN>context 只向当前默认 slot 子树提供只读 reactive locale；它不创建应用级 singleton、存储或反向 writeback。</zh-CN><en>Context provides read-only reactive locale only to the current default-slot subtree; it creates no application singleton, storage, or reverse writeback.</en></lang>
provide(U_LOCALE_CONTEXT, Object.freeze({ locale: safeLocale }));

// <lang><zh-CN>根 class 只由固定前缀和两项已规范化选择组成。</zh-CN><en>Root classes consist only of a fixed prefix and two normalized selections.</en></lang>
const providerClasses = computed(() => ['u-config-provider', `u-config-provider--${safeTheme.value}`, `u-config-provider--${safeDensity.value}`, `u-config-provider--locale-${safeLocale.value}`]);
</script>

<style src="./u-config-provider.css"></style>
