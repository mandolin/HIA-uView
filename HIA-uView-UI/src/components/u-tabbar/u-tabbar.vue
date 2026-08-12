<!--
@component UTabbar
@lang zh-CN 提供受控底部 tab 项、label 与切换 intent；不执行 router、权限判断、身份推断、微信 custom tabBar 生命周期或全局导航 service。
@lang en Provides controlled bottom tabs, labels, and change intent; it performs no router, authorization, identity inference, WeChat custom-tab-bar lifecycle, or global navigation service.
-->
<template>
  <!--
  @lang zh-CN 只有调用方解析后的可见状态才输出局部 tablist；该条件不隐藏或接管原生 tabBar。
  @lang en Only caller-resolved visibility outputs the local tablist; this condition neither hides nor takes over a native tab bar.
  <lang><zh-CN>每个 item 只呈现调用方标签和受控选中态。</zh-CN><en>Each item presents only caller label and controlled selected state.</en></lang>
  -->
  <view v-if="isVisible" class="u-tabbar" role="tablist">
    <button
      v-for="item in safeItems"
      :key="item.key"
      class="u-tabbar__item"
      :class="{ 'u-tabbar__item--active': isActive(item), 'u-tabbar__item--disabled': item.disabled }"
      type="button"
      :disabled="item.disabled"
      role="tab"
      :aria-selected="isActive(item)"
      @click="handleSelect(item)"
    >
      <text class="u-tabbar__label">{{ item.label }}</text>
    </button>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// <lang><zh-CN>tabbar 只提供局部底部选择表面，图标、徽标、路由与平台 tab 生命周期均由调用方另行组合。</zh-CN><en>Tabbar provides a local bottom-selection surface only; caller separately composes icons, badges, routing, and platform-tab lifecycle.</en></lang>
defineOptions({ name: 'u-tabbar' });

// <lang><zh-CN>visible 是既有 HIA 显式可见性 alias；未声明时使用上游熟悉的 show，保持调用方决定优先级。</zh-CN><en>Visible is the existing explicit HIA visibility alias; when absent, the upstream-familiar show applies while retaining caller-controlled precedence.</en></lang>
const props = defineProps({
  // <lang><zh-CN>显式 visible 覆盖 show；undefined 表示调用方未使用既有 HIA alias。</zh-CN><en>An explicit visible overrides show; undefined means the caller does not use the existing HIA alias.</en></lang>
  visible: { type: Boolean, default: undefined },
  // <lang><zh-CN>show 保留上游的布尔默认 true；它只控制当前组件输出，不调用原生 hideTabBar。</zh-CN><en>Show retains the upstream boolean default true; it controls only this component output and never calls native hideTabBar.</en></lang>
  show: { type: Boolean, default: true },
  // <lang><zh-CN>modelValue 保留上游默认索引 0；字符串 key 仍可由调用方用于本地、非路由式 tab 标识。</zh-CN><en>ModelValue retains the upstream default index 0; callers may still use string keys for local non-routing tab identity.</en></lang>
  modelValue: { type: [String, Number], default: 0 },
  // <lang><zh-CN>items 仅接收调用方有限静态数组；组件不发现页面、图标、徽标或远端导航配置。</zh-CN><en>Items accepts only a caller finite static array; the component discovers no pages, icons, badges, or remote navigation configuration.</en></lang>
  items: { type: Array, default: () => [] },
  // <lang><zh-CN>熟悉的 list alias 仅在 items 为空时成为有限条目来源；它同样不承载页面或原生 tab 配置。</zh-CN><en>The familiar list alias becomes the finite item source only while items is empty; it likewise carries no page or native-tab configuration.</en></lang>
  list: { type: Array, default: () => [] }
});

// <lang><zh-CN>两个事件都只是页面拥有的下一 local key；不会导航、写权限或修改身份。</zh-CN><en>Both events are merely the page-owned next local key; they neither navigate nor write authorization or identity.</en></lang>
const emit = defineEmits(['update:modelValue', 'change']);

// <lang><zh-CN>解析后的可见性只采用显式 alias 或 show，不推断设备、页面路由或原生 tabBar 状态。</zh-CN><en>Resolved visibility uses only explicit alias or show and infers neither device, page route, nor native-tab-bar state.</en></lang>
const isVisible = computed(() => (props.visible === undefined ? props.show : props.visible));

// <lang><zh-CN>非空 items 保持既有 HIA 数据源优先；只有空 items 才采用 list alias，二者都只是调用方有限数组。</zh-CN><en>Nonempty items retain the existing HIA data-source precedence; only empty items adopts the list alias, and both remain caller finite arrays.</en></lang>
const sourceItems = computed(() => (props.items.length > 0 ? props.items : props.list));

// <lang><zh-CN>把有限调用方 item 投影为只含 label/value/disabled/key 的本地记录，避免 mutation 或保留任意附带字段。</zh-CN><en>Projects finite caller items into local records containing only label/value/disabled/key, avoiding mutation or retaining arbitrary attached fields.</en></lang>
const safeItems = computed(() => sourceItems.value
  .map((item, index) => {
    // <lang><zh-CN>字符串 item 是 label/value 同值的简写；其他非对象输入收束为空对象。</zh-CN><en>A string item abbreviates equal label/value; every other non-object input is constrained to an empty object.</en></lang>
    const source = typeof item === 'string' ? { label: item, value: item } : (item && typeof item === 'object' ? item : {});

    // <lang><zh-CN>value 回退只使用固定数组索引；不创建 URL、路由或业务标识。</zh-CN><en>Value fallback uses only the fixed array index; it creates no URL, route, or business identifier.</en></lang>
    const value = source.value ?? source.label ?? index;

    // <lang><zh-CN>key 在相同 value 出现时仍按索引稳定区分，仅服务当前渲染树。</zh-CN><en>Key remains stably distinct by index when equal values occur and serves only the current render tree.</en></lang>
    const key = `${String(value)}-${index}`;

    // <lang><zh-CN>label 只接受调用方 text/label，空字符串会在后续过滤，不生成默认业务文案。</zh-CN><en>Label accepts only caller text/label; empty strings are filtered later and generate no default business copy.</en></lang>
    const label = String(source.label ?? source.text ?? '');

    // <lang><zh-CN>disabled 只控制本地 button 选择边界，不影响任何外部导航可用性。</zh-CN><en>Disabled controls only the local button-selection boundary and affects no external navigation availability.</en></lang>
    const disabled = Boolean(source.disabled);

    return Object.freeze({ key, label, value, disabled });
  })
  .filter((item) => item.label.length > 0));

/**
 * @lang zh-CN 判断一个已规范化 item 是否为调用方当前选中值；使用严格相等，不字符串化数字 key。
 * @lang en Determines whether a normalized item is the caller current selected value; it uses strict equality and does not stringify numeric keys.
 * @param {{value: string|number}} item <lang><zh-CN>已规范化的局部 tab 项。</zh-CN><en>Normalized local tab item.</en></lang>
 * @returns {boolean} <lang><zh-CN>是否应呈现为当前选中项。</zh-CN><en>Whether it must present as current selection.</en></lang>
 */
function isActive(item) {
  // <lang><zh-CN>受控 modelValue 是唯一选中事实来源；组件不从页面、路由或 native tab state 反推结果。</zh-CN><en>The controlled modelValue is the sole selection fact; the component derives no result from pages, routes, or native-tab state.</en></lang>
  return props.modelValue === item.value;
}

/**
 * @lang zh-CN 报告底部 tab 的本地切换 intent；不导航、不写入权限或身份状态。
 * @lang en Reports local bottom-tab change intent without navigation or authorization/identity writes.
 * @param {{value: string|number, disabled: boolean}} item <lang><zh-CN>规范化 tab。</zh-CN><en>Normalized tab.</en></lang>
 * @returns {void} <lang><zh-CN>无返回值；符合 guard 时 emit 两个调用方处理的本地值。</zh-CN><en>No return value; emits two caller-handled local values when the guard passes.</en></lang>
 */
function handleSelect(item) {
  // <lang><zh-CN>禁用项和当前项保持零事件，避免用重复点击伪造导航或业务状态变化。</zh-CN><en>Disabled and current items retain zero events, avoiding fabrication of navigation or business-state change through repeated clicks.</en></lang>
  if (item.disabled || isActive(item)) {
    return;
  }

  // <lang><zh-CN>先报告标准 v-model、再报告本地 change；调用方是唯一可能执行路由或状态写回的一方。</zh-CN><en>Reports standard v-model first and local change second; the caller is the only party that may perform routing or state writeback.</en></lang>
  emit('update:modelValue', item.value);
  emit('change', item.value);
}
</script>

<style src="./u-tabbar.css"></style>
