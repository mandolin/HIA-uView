<!--
@component UConfigProvider
@lang zh-CN 提供 caller-owned 的有限 theme/density CSS scope 与默认 slot；它不读取、持久化或全局修改 locale/theme，P56 才可在此受控边界内扩展 UI locale context。
@lang en Provides caller-owned finite theme/density CSS scope and a default slot; it neither reads, persists, nor globally mutates locale/theme, and only P56 may extend UI locale context within this controlled boundary.
-->
<template>
  <!-- @lang zh-CN 受控模板呈现说明如下。
  @lang en Controlled template-presentation explanation follows.
  <lang><zh-CN>provider 只包装当前子树并输出规范化 class/data attributes；它不越出 caller 的组件树写全局根。</zh-CN><en>The provider wraps only the current subtree and outputs normalized class/data attributes; it does not write a global root outside the caller component tree.</en></lang> -->
  <view :class="providerClasses" :data-u-theme="safeTheme" :data-u-density="safeDensity"><slot /></view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称服务受限配置子树；它不是 application-wide config singleton。</zh-CN><en>The stable name serves a constrained configuration subtree; it is not an application-wide config singleton.</en></lang>
defineOptions({ name: 'u-config-provider' });

// <lang><zh-CN>当前 theme/density 只允许已文档化的浅色与两档密度；未来新增值需独立契约和 token 审计。</zh-CN><en>Current theme/density permits documented light and two density levels only; new values require independent contract and token audit.</en></lang>
const supportedThemes = Object.freeze(['light']);
const supportedDensities = Object.freeze(['comfortable', 'compact']);

// <lang><zh-CN>调用方拥有有限 scope 选择；没有 locale prop，避免提前承担 P56 locale bridge 行为。</zh-CN><en>The caller owns finite scope selection; there is no locale prop, avoiding premature ownership of P56 locale-bridge behavior.</en></lang>
const props = defineProps({ theme: { type: String, default: 'light' }, density: { type: String, default: 'comfortable' } });

// <lang><zh-CN>未知 theme 回退 light，保持当前唯一主题实现诚实可审计。</zh-CN><en>An unknown theme falls back to light, keeping the current sole theme implementation honest and auditable.</en></lang>
const safeTheme = computed(() => supportedThemes.includes(props.theme) ? props.theme : 'light');

// <lang><zh-CN>未知 density 回退 comfortable，不将任意字符串暴露为 CSS class。</zh-CN><en>An unknown density falls back to comfortable and exposes no arbitrary string as a CSS class.</en></lang>
const safeDensity = computed(() => supportedDensities.includes(props.density) ? props.density : 'comfortable');

// <lang><zh-CN>根 class 只由固定前缀和两项已规范化选择组成。</zh-CN><en>Root classes consist only of a fixed prefix and two normalized selections.</en></lang>
const providerClasses = computed(() => ['u-config-provider', `u-config-provider--${safeTheme.value}`, `u-config-provider--${safeDensity.value}`]);
</script>

<style src="./u-config-provider.css"></style>
