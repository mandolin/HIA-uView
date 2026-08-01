# USwiper component contract / USwiper 组件契约

> Status / 状态：Private pre-release static slide deck.
> 状态：私有预发布静态 slide deck。

`USwiper` presents one item from a finite caller-declared `items` array and exposes explicit previous, next, change, and select intents. It does not use native `<swiper>`, autoplay, timers, transitions, image/video loading, remote media, or indicator registries.

`USwiper` 呈现调用方声明的有限 `items` 中一个当前项，并提供显式 previous、next、change、select 意图。它不使用原生 `<swiper>`、autoplay、timer、transition、图片/视频加载、远程媒体或 indicator registry。

The root namespace is `u-swiper` and consumes `--u-comp-swiper-*`. The caller owns the current index and any content/asset trust decision.

根命名空间为 `u-swiper`，消费 `--u-comp-swiper-*`。当前索引和内容/资产可信决策由调用方拥有。
