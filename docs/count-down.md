# UCountDown component contract / UCountDown 组件契约

> Status / 状态：Private pre-release static remaining-time projection.
> 状态：私有预发布静态剩余时间投影。

`UCountDown` deterministically decomposes caller `remaining` seconds into days, hours, minutes, and seconds. `showDays`, `separator`, slot content, and accessible copy remain caller-controlled.

`UCountDown` 确定性地将调用方 `remaining` 秒数拆分为日、时、分和秒。`showDays`、`separator`、slot 内容与可访问文案仍由调用方控制。

It does not decrement, read a device/server clock, parse time zones, schedule a timer, or define expiry behavior. Its root namespace is `u-count-down` and it consumes `--u-comp-count-down-*`.

它不自行递减、不读取设备/服务器时钟、不解析时区、不调度计时器，也不定义到期行为。根命名空间为 `u-count-down`，消费 `--u-comp-count-down-*`。
