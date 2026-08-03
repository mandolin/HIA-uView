# UTabsSwiper component contract / UTabsSwiper 组件契约

> Status / 状态：Private pre-release controlled static tab-panel projection.
> 状态：私有预发布受控静态 tab-panel 投影。

`UTabsSwiper` projects a finite caller item set and its current static panel. It reports explicit selection plus optional `previous`/`next` candidates; the caller owns model writeback, content, and every follow-up action.

`UTabsSwiper` 投影有限调用方项目集及其当前静态 panel。它报告显式选择和可选 `previous`/`next` 候选；调用方拥有模型回写、内容及所有后续动作。

The root namespace is `u-tabs-swiper` and consumes `--u-comp-tabs-swiper-*`. It uses no native swiper, gesture measurement, autoplay, route synchronization, or remote content loading.

根命名空间为 `u-tabs-swiper`，消费 `--u-comp-tabs-swiper-*`。它不使用原生 swiper、手势测量、自动轮播、路由同步或远程内容加载。
