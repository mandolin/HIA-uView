<!--
@lang zh-CN 展示 HiaButton 的 label、disabled、loading 和长文本状态，以形成仅编译期的最小 mp-weixin 纵切证据。
@lang en Demonstrates HiaButton label, disabled, loading, and long-text states to form minimum mp-weixin vertical-slice evidence for compilation only.
-->
<template>
  <view class="fixture-page">
    <text class="fixture-page__title">HIA-uView HiaButton fixture</text>
    <HiaButton label="保存本地草稿" @click="recordActivation" />
    <HiaButton variant="secondary" :disabled="true" label="暂不可用" />
    <HiaButton variant="text" :loading="true" label="正在同步" />
    <HiaButton size="lg" block label="Continue with a deliberately long English action label" />
    <text class="fixture-page__count">{{ activationCount }}</text>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { HiaButton } from '../../../../../src/index.mjs';

const activationCount = ref(0);

function recordActivation() {
  activationCount.value += 1;
}
</script>

<style>
/**
 * @lang zh-CN fixture 页面仅使用本地布局，避免把业务样式或未经审计资源带入 HiaButton 编译证据。
 * @lang en The fixture page uses only local layout so business styling or unaudited resources do not enter HiaButton compilation evidence.
 */
.fixture-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}

.fixture-page__title,
.fixture-page__count {
  color: var(--hia-sys-color-text);
}
</style>
