<!--
@component UCountDown
@lang zh-CN 将调用方提供的剩余秒数确定性投影为日、时、分、秒；不自行减少数值、不读取时钟或服务器时间。
@lang en Deterministically projects caller-provided remaining seconds as days, hours, minutes, and seconds; it does not decrement values or read clock or server time.
-->
<template>
  <!-- @lang zh-CN 各数段来自同一 remaining 投影；separator 是 caller 给定的中性分隔符而非本地化文案。
  @lang en Every segment comes from one remaining projection; separator is a caller-provided neutral delimiter rather than localized copy.
  <lang><zh-CN>showDays 仅控制日段是否可见，不改变 caller 数值或定义到期动作。</zh-CN><en>showDays controls only whether the day segment is visible and neither changes caller value nor defines an expiry action.</en></lang> -->
  <view class="u-count-down" role="timer" :aria-label="ariaLabel || undefined"><text v-if="showDays" class="u-count-down__segment">{{ parts.days }}</text><text v-if="showDays" class="u-count-down__separator">{{ separator }}</text><text class="u-count-down__segment">{{ parts.hours }}</text><text class="u-count-down__separator">{{ separator }}</text><text class="u-count-down__segment">{{ parts.minutes }}</text><text class="u-count-down__separator">{{ separator }}</text><text class="u-count-down__segment">{{ parts.seconds }}</text><slot :parts="parts" :remaining="safeRemaining" /></view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>稳定名称提供静态剩余时间呈现，不拥有倒计时生命周期。</zh-CN><en>The stable name provides static remaining-time presentation and owns no countdown lifecycle.</en></lang>
defineOptions({ name: 'u-count-down' });

// <lang><zh-CN>remaining 与显示选择来自 caller；ariaLabel 也由应用本地化，避免组件生成中英混排描述。</zh-CN><en>Remaining and display choices come from the caller; ariaLabel is also localized by the application, avoiding component-generated mixed-language descriptions.</en></lang>
const props = defineProps({ remaining: { type: [Number, String], default: 0 }, showDays: { type: Boolean, default: true }, separator: { type: String, default: ':' }, ariaLabel: { type: String, default: '' } });

// <lang><zh-CN>非法或负数秒数回退零；这只是呈现归一化，不报告或保存领域过期状态。</zh-CN><en>Invalid or negative seconds fall back to zero; this is presentation normalization only and reports or stores no domain expiry state.</en></lang>
const safeRemaining = computed(() => {
  // <lang><zh-CN>向下取整保证各数段使用完整秒，而不启动任何逐秒更新。</zh-CN><en>Flooring ensures segments use whole seconds without starting any per-second update.</en></lang>
  const candidate = Number(props.remaining);
  return Number.isFinite(candidate) ? Math.max(0, Math.floor(candidate)) : 0;
});

// <lang><zh-CN>parts 是从一个静态秒数解构的只读显示对象；它不包含时区、日期或服务器校正语义。</zh-CN><en>Parts is a read-only display object decomposed from static seconds; it includes no timezone, date, or server-correction semantics.</en></lang>
const parts = computed(() => {
  // <lang><zh-CN>余数变量在本次计算内逐段消费秒数，生命周期不超出当前渲染。</zh-CN><en>The remainder variable consumes seconds segment by segment within this computation and lives no longer than the current render.</en></lang>
  let remainder = safeRemaining.value;
  // <lang><zh-CN>日数保留完整整数，以支持超过 24 小时的 caller-owned 剩余量。</zh-CN><en>Days retain a whole integer to support caller-owned remaining values beyond 24 hours.</en></lang>
  const days = Math.floor(remainder / 86400);
  // <lang><zh-CN>移除已投影的日数后，余数只用于时分秒。</zh-CN><en>After projected days are removed, remainder serves hours, minutes, and seconds only.</en></lang>
  remainder %= 86400;
  const hours = Math.floor(remainder / 3600);
  remainder %= 3600;
  const minutes = Math.floor(remainder / 60);
  const seconds = remainder % 60;
  // <lang><zh-CN>两位补零仅是数值可读性处理，不是 locale 格式化或业务截止判断。</zh-CN><en>Two-digit padding is numeric readability treatment only, not locale formatting or a business deadline decision.</en></lang>
  const pad = (value) => String(value).padStart(2, '0');
  return Object.freeze({ days: String(days).padStart(2, '0'), hours: pad(hours), minutes: pad(minutes), seconds: pad(seconds) });
});
</script>

<style src="./u-count-down.css"></style>
