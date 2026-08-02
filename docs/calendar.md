# UCalendar component contract / UCalendar 组件契约

> Status / 状态：Private pre-release, controlled local single-month date selector.
> 状态：私有预发布、受控本地单月日期选择器。

`UCalendar` uses local `YYYY-MM-DD` strings and emits `update:modelValue`, `select`, and `update:viewDate`. It does not read a platform calendar, network, timezone service, or identity state.

`UCalendar` 使用本地 `YYYY-MM-DD` 字符串，并 emit `update:modelValue`、`select` 与 `update:viewDate`。它不读取平台日历、网络、时区服务或身份状态。

| Prop / 属性 | Type / 类型 | Default / 默认值 |
| --- | --- | --- |
| `modelValue` / `viewDate` / `minDate` / `maxDate` | `string` | `''` |
| `disabledDates` | `string[]` | `[]` |

The first day of the week is Sunday; the six-week grid is presentation-only. / 每周从星期日开始；六周网格只服务呈现。

Consumes `--u-comp-calendar-*`; callers own date policy, persistence, and platform accessibility verification.

消费 `--u-comp-calendar-*`；日期策略、持久化和平台无障碍验证由调用方负责。
