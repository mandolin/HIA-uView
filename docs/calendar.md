# UCalendar component contract / UCalendar 组件契约

`UCalendar` is a private pre-release, caller-controlled local Gregorian single-month selector. It owns only the rendered six-week grid and local navigation projection.

`UCalendar` 是私有预发布、调用方受控的本地 Gregorian 单月选择器。它只拥有渲染出的六周网格与本地导航投影。

| Prop / 属性 | Type / 类型 | Default / 默认值 | Contract / 契约 |
| --- | --- | --- | --- |
| `modelValue` | `string` | `''` | Caller-owned selected `YYYY-MM-DD` value. / 调用方拥有的 `YYYY-MM-DD` 选中值。 |
| `viewDate` | `string` | `''` | Caller-owned visible-month anchor. / 调用方拥有的可见月份锚点。 |
| `minDate` / `maxDate` | `string` | `''` | Optional inclusive bounds. / 可选的闭区间边界。 |
| `disabledDates` | `ReadonlyArray<string>` | `[]` | Exact valid dates that cannot be selected. / 不可选择的精确有效日期。 |
| `readonly` | `boolean` | `false` | Blocks value selection but not month browsing. / 阻止值选择，但不阻止月份浏览。 |
| `today` | `string` | `''` | Explicit presentation date; empty uses the local system date. / 显式呈现日期；空值使用本地系统日期。 |
| `weekLabels` | `ReadonlyArray<string>` | `[]` | Overrides the complete Sunday-first locale set only when exactly seven strings are supplied. / 仅在恰好提供七个字符串时，整体覆盖 Sunday-first locale 集合。 |

All caller dates use strict Gregorian `YYYY-MM-DD` with years `0001` through `9999`. Invalid formats and overflow dates do not roll through permissive `Date` parsing. A nonempty invalid bound, or a valid minimum after the maximum, disables every date; bounds are never swapped. Invalid `disabledDates` entries are ignored.

所有 caller date 均使用严格 Gregorian `YYYY-MM-DD`，年份范围为 `0001` 至 `9999`。非法格式与溢出日期不会通过宽松 `Date` 解析进位。非空非法边界，或有效 min 晚于 max，都会禁用全部日期；边界绝不交换。非法 `disabledDates` 项会被忽略。

The visible-month anchor priority is valid `viewDate`, then valid `modelValue`, then valid `today`, then the local system date. `today=""` alone enables the local-system fallback; an explicitly invalid `today` marks no day as today. The first weekday is Sunday and the grid always contains six weeks.

可见月份锚点优先级依次为有效 `viewDate`、有效 `modelValue`、有效 `today`、本地系统日期。只有 `today=""` 才启用本地系统回退；显式非法 `today` 不会把任何日期标记为今天。每周从星期日开始，网格始终包含六周。

A valid enabled date emits, in order, `update:modelValue(date)`, `input(date)`, `change({ value, year, month, day })`, and `select(date)`. Readonly, malformed/blank cells, disabled dates, and invalid/reversed bounds emit no value event.

有效且 enabled 的日期依次 emit `update:modelValue(date)`、`input(date)`、`change({ value, year, month, day })` 与 `select(date)`。readonly、非法/空白 cell、disabled date 以及非法/反向边界均不 emit value 事件。

Month navigation emits only `update:viewDate(firstDayOfAdjacentMonth)` and writes neither `viewDate` nor `modelValue`; readonly still permits browsing. The footer slot is the only custom content surface.

月份导航只 emit `update:viewDate(firstDayOfAdjacentMonth)`，既不写 `viewDate` 也不写 `modelValue`；readonly 仍允许浏览。footer slot 是唯一自定义内容面。

The component reads no lunar/festival/holiday/booking data, platform calendar, network, timezone service, identity, or persistence. Styling consumes `--u-comp-calendar-*`; date policy and platform accessibility verification remain caller-owned.

组件不读取农历/节日/假日/预约数据、平台日历、网络、时区 service、身份或持久化。样式消费 `--u-comp-calendar-*`；日期策略和平台无障碍验证仍由调用方负责。
