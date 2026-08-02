<!--
@component H5FixtureApp
@lang zh-CN 以本地声明数据展示 P49 组件；fixture 不连接 API、router、storage 或外部脚本。
@lang en Displays P49 components with local declarative data; the fixture connects to no API, router, storage, or external script.
-->
<template>
  <main class="fixture-page">
    <h1>HIA-uView H5 fixture / H5 验证 fixture</h1>
    <USection title="Local availability / 本地可用性" sub-title="H5 build and smoke evidence / H5 构建与 smoke 证据" />
    <UText text="u- naming remains available on H5 / H5 仍保持 u- 代码命名" type="secondary" />
    <USelect v-model="selected" :options="options" placeholder="Select / 请选择" />
    <USlider v-model="level" :show-value="true" :min="0" :max="10" />
    <UDropdown v-model="selected">
      <UDropdownItem value="public" label="Public / 公共" />
      <UDropdownItem value="private" label="Private / 私有" />
    </UDropdown>
    <UButton label="Local action / 本地操作" />
    <p data-smoke="selected">{{ selected }}</p>
    <p data-smoke="level">{{ level }}</p>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { UButton, UDropdown, UDropdownItem, USection, USelect, USlider, UText } from '../../../src/index.mjs';

// <lang><zh-CN>fixture 状态只来自本地 ref，便于 H5 smoke 对稳定文本进行检查。</zh-CN><en>Fixture state comes from local refs only, allowing H5 smoke to inspect stable text.</en></lang>
const selected = ref('public');
const level = ref(5);
const options = Object.freeze([
  Object.freeze({ label: 'Public / 公共', value: 'public' }),
  Object.freeze({ label: 'Private / 私有', value: 'private' })
]);
</script>

<style>
.fixture-page { color: var(--u-sys-color-text); font-family: system-ui, sans-serif; margin: 0 auto; max-width: 720px; padding: 24px; }
.fixture-page > * { margin-block-end: 16px; }
</style>
