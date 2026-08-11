# Third-party notices / 第三方声明

## Distribution scope / 分发范围

This file travels with `@hia-uview/ui`. It records the upstream material that informed materially derived HIA-uView-UI implementations and the license text that must remain present in repository and package artifacts. HIA-uView-UI does not bundle the upstream `$u` runtime, TypeScript props/types, images, fonts, icons, brand material, networking, router, platform-system access, generated output, or unreviewed dependency closure.

本文件随 `@hia-uview/ui` 一同分发，记录曾为 HIA-uView-UI 实质衍生实现提供依据的上游材料，以及必须保留在仓库与包成品中的许可证文本。HIA-uView-UI 不打包上游 `$u` runtime、TypeScript props/types、图片、字体、图标、品牌材料、网络、路由、平台系统访问、生成物或未经审计的依赖闭包。

The canonical upstream MIT text and copyright statement are preserved at [`LICENSES/uView-Pro-MIT.txt`](LICENSES/uView-Pro-MIT.txt). That file is the exact 1068-byte Git blob `837f9643580783834339d1b40e58772413895e39`, with SHA-256 `906B494A3FA3B4E270BB08FC69625176E552EB0ACC922C253C4D5FBFA5544627`, from `anyup/uView-Pro`.

上游 MIT 全文与版权声明保存在 [`LICENSES/uView-Pro-MIT.txt`](LICENSES/uView-Pro-MIT.txt)。该文件是 `anyup/uView-Pro` 中精确的 1068-byte Git blob `837f9643580783834339d1b40e58772413895e39`，SHA-256 为 `906B494A3FA3B4E270BB08FC69625176E552EB0ACC922C253C4D5FBFA5544627`。

## Historical `uview-pro@0.6.13` provenance / 历史 `uview-pro@0.6.13` 来源

The npm release `uview-pro@0.6.13` records `gitHead` `17d6b802194ea770fa602a96e3168e9ed116231c` and integrity `sha512-auuOizAmlFgVQ/IGkH80NsaeMDTwmXfjNHXHUzBh1W5VQbTU3ttQcfmpyXcuuMH7UdpC5xcgRsLEP5cF6J3YVg==`. Annotated tag object `ffe8baa86afbc6afa0fea81481742527fccfe02e` resolves to that commit and tree `806f7e0f98148778a29b92a0178f9a85dc4f5205`.

npm release `uview-pro@0.6.13` 的 `gitHead` 为 `17d6b802194ea770fa602a96e3168e9ed116231c`，integrity 为 `sha512-auuOizAmlFgVQ/IGkH80NsaeMDTwmXfjNHXHUzBh1W5VQbTU3ttQcfmpyXcuuMH7UdpC5xcgRsLEP5cF6J3YVg==`。annotated tag object `ffe8baa86afbc6afa0fea81481742527fccfe02e` 指向该 commit 及 tree `806f7e0f98148778a29b92a0178f9a85dc4f5205`。

The original review snapshot was immutable commit `3bc1948d8f7c5d2bcb1ba3434cede1e709391a62`, tree `5cf847b08c85c3481d0b9fa288b7841677df662a`. It is the direct child of the release commit and changes only three README files. Every one of the 24 source blobs below is therefore byte-identical at the release commit and review snapshot. The registry tarball stores these text files with CRLF line endings; after deterministic CRLF-to-LF normalization, all 24 files equal the corresponding release Git blobs.

最初的审阅快照是 immutable commit `3bc1948d8f7c5d2bcb1ba3434cede1e709391a62`、tree `5cf847b08c85c3481d0b9fa288b7841677df662a`。它是 release commit 的直接子提交，并且只修改三个 README 文件。因此，下表 24 个 source blob 在 release commit 与 review snapshot 中逐项、逐字节相同。registry tarball 以 CRLF 保存这些文本文件；经过确定性的 CRLF-to-LF 规范化后，24/24 文件均与对应 release Git blob 相等。

The records remain attributed to `0.6.13`; later review does not rewrite their historical source revision.

这些记录继续归属于 `0.6.13`；后续审阅不会改写其历史来源版本。

| Upstream source path / 上游来源路径 | HIA target / HIA 目标 | `0.6.13` source blob / 来源 blob | Adoption form / 采用形式 |
| --- | --- | --- | --- |
| `src/uni_modules/uview-pro/components/u-navbar/u-navbar.vue` | `HIA-uView-UI/src/components/u-navbar/u-navbar.vue` | `df2f98a19c99565547822d2b03122652d279dfac` | 实质衍生、独立重写的受控标题与两侧 intent 表面。 / Materially derived, independently rewritten controlled title and side-intent surface. |
| `src/uni_modules/uview-pro/components/u-status-bar/u-status-bar.vue` | `HIA-uView-UI/src/components/u-status-bar/u-status-bar.vue` | `f553b37a68a6e2e9eff915d6540e865e206bf7b7` | 实质衍生、独立重写的 caller-height spacer。 / Materially derived, independently rewritten caller-height spacer. |
| `src/uni_modules/uview-pro/components/u-safe-bottom/u-safe-bottom.vue` | `HIA-uView-UI/src/components/u-safe-bottom/u-safe-bottom.vue` | `76fdc8fe6d8d3007471f5e188d71ea1ea46c0d55` | 实质衍生、独立重写的 caller-height spacer。 / Materially derived, independently rewritten caller-height spacer. |
| `src/uni_modules/uview-pro/components/u-back-top/u-back-top.vue` | `HIA-uView-UI/src/components/u-back-top/u-back-top.vue` | `9c84d22c1b6106f176a1755b6ab3ac4d7e30bf5f` | 实质衍生、独立重写的 click intent 表面，不观察滚动。 / Materially derived, independently rewritten click-intent surface without scroll observation. |
| `src/uni_modules/uview-pro/components/u-cell-item/u-cell-item.vue` | `HIA-uView-UI/src/components/u-cell-item/u-cell-item.vue` | `db0cd27e53ad32d4c6071db6addd1114dd96b905` | 实质衍生、独立重写的本地信息行。 / Materially derived, independently rewritten local information row. |
| `src/uni_modules/uview-pro/components/u-loading/u-loading.vue` | `HIA-uView-UI/src/components/u-loading/u-loading.vue` | `bbce8392a6a1217032966047352e0cf2a79d5629` | 实质衍生、独立重写的静态指示器。 / Materially derived, independently rewritten static indicator. |
| `src/uni_modules/uview-pro/components/u-loading-popup/u-loading-popup.vue` | `HIA-uView-UI/src/components/u-loading-popup/u-loading-popup.vue` | `4e506b8dbde3e5deabf594124b187cb269893d9b` | 实质衍生、独立重写的本地 overlay composition。 / Materially derived, independently rewritten local overlay composition. |
| `src/uni_modules/uview-pro/components/u-mask/u-mask.vue` | `HIA-uView-UI/src/components/u-mask/u-mask.vue` | `4855556f0df534f980fc200dec4fb36870d58091` | 实质衍生、独立重写的受控 mask。 / Materially derived, independently rewritten controlled mask. |
| `src/uni_modules/uview-pro/components/u-no-network/u-no-network.vue` | `HIA-uView-UI/src/components/u-no-network/u-no-network.vue` | `a6e1bd1398694344e26ba65fba08dec1642570b3` | 实质衍生、独立重写的文字优先面板；排除上游 `image.ts` 资产。 / Materially derived, independently rewritten text-first panel; upstream `image.ts` asset excluded. |
| `src/uni_modules/uview-pro/components/u-notice-bar/u-notice-bar.vue` | `HIA-uView-UI/src/components/u-notice-bar/u-notice-bar.vue` | `b2584312f8462900bd9852e463e3b06ee3eafaba` | 实质衍生、独立重写的非滚动 banner。 / Materially derived, independently rewritten non-scrolling banner. |
| `src/uni_modules/uview-pro/components/u-top-tips/u-top-tips.vue` | `HIA-uView-UI/src/components/u-top-tips/u-top-tips.vue` | `4c1c1bf951a5649f7bf9fe8b324ae93a267b35a2` | 实质衍生、独立重写的本地 feedback tip。 / Materially derived, independently rewritten local feedback tip. |
| `src/uni_modules/uview-pro/components/u-transition/u-transition.vue` | `HIA-uView-UI/src/components/u-transition/u-transition.vue` | `b08546dde9940d3595d7f3c7881cd0d2a290d941` | 实质衍生、独立重写的有限 CSS transition 表面。 / Materially derived, independently rewritten finite CSS transition surface. |
| `src/uni_modules/uview-pro/components/u-config-provider/u-config-provider.vue` | `HIA-uView-UI/src/components/u-config-provider/u-config-provider.vue` | `36bec7483519c49816ba401ff882d4cc64a67133` | 实质衍生、独立重写的同树 theme/density scope。 / Materially derived, independently rewritten same-tree theme/density scope. |
| `src/uni_modules/uview-pro/components/u-root-portal/u-root-portal.vue` | `HIA-uView-UI/src/components/u-root-portal/u-root-portal.vue` | `5550da0826a50c773d9a946251dc7de69ad4e0cb` | 实质衍生、独立重写的同树 portal fallback。 / Materially derived, independently rewritten same-tree portal fallback. |
| `src/uni_modules/uview-pro/components/u-fab/u-fab.vue` | `HIA-uView-UI/src/components/u-fab/u-fab.vue` | `f2cdc512e7e5fd7b6016190f9f5b516a84de4cae` | 实质衍生、独立重写的带标签本地 action control。 / Materially derived, independently rewritten labeled local action control. |
| `src/uni_modules/uview-pro/components/u-action-sheet-item/u-action-sheet-item.vue` | `HIA-uView-UI/src/components/u-action-sheet-item/u-action-sheet-item.vue` | `fad2cc9c939e52b0194c192819f9bd501a1056af` | 实质衍生、独立重写的 caller-controlled item；无 parent injection 或 sheet close。 / Materially derived, independently rewritten caller-controlled item without parent injection or sheet close behavior. |
| `src/uni_modules/uview-pro/components/u-city-select/u-city-select.vue` | `HIA-uView-UI/src/components/u-city-select/u-city-select.vue` | `22c831490262552da63a162e9287c4edaa523daf` | 实质衍生、独立重写的有限 caller-column selector；无 region data、geolocation 或 address service。 / Materially derived, independently rewritten finite caller-column selector without region data, geolocation, or address service. |
| `src/uni_modules/uview-pro/components/u-message-input/u-message-input.vue` | `HIA-uView-UI/src/components/u-message-input/u-message-input.vue` | `58df4a5ca051bfbfaed0eb577ac7da2978f10009` | 实质衍生、独立重写的定长 controlled input；无 code validation、messaging、timer 或 keyboard ownership。 / Materially derived, independently rewritten fixed-length controlled input without code validation, messaging, timer, or keyboard ownership. |
| `src/uni_modules/uview-pro/components/u-car-keyboard/u-car-keyboard.vue` | `HIA-uView-UI/src/components/u-car-keyboard/u-car-keyboard.vue` | `90de12b80ff4ff22b41e84679e8735504a28f26a` | 实质衍生、独立重写的 caller-row keyboard；无 region keys、randomization、long press、timer 或 vehicle rules。 / Materially derived, independently rewritten caller-row keyboard without region keys, randomization, long press, timer, or vehicle rules. |
| `src/uni_modules/uview-pro/components/u-keyboard/u-keyboard.vue` | `HIA-uView-UI/src/components/u-keyboard/u-keyboard.vue` | `2590409722bcf4f219645f99e6d03c0c37a166ca` | 实质衍生、独立重写的本地 controlled keyboard composition；无 global service、focus、locale 或 model ownership。 / Materially derived, independently rewritten local controlled keyboard composition without global service, focus, locale, or model ownership. |
| `src/uni_modules/uview-pro/components/u-number-keyboard/u-number-keyboard.vue` | `HIA-uView-UI/src/components/u-number-keyboard/u-number-keyboard.vue` | `ba54f8e97bd9391b40ce5fa639a27c1c0c0fa30e` | 实质衍生、独立重写的有限 caller-key keyboard；无 numeric generation、format rule、long press、timer 或 icon asset。 / Materially derived, independently rewritten finite caller-key keyboard without numeric generation, format rule, long press, timer, or icon asset. |
| `src/uni_modules/uview-pro/components/u-avatar-cropper/u-avatar-cropper.vue` | `HIA-uView-UI/src/components/u-avatar-cropper/u-avatar-cropper.vue` | `e8c3c9077f26a5cef5e12bbf76f27111fc8cbb4f` | 实质衍生、独立重写的 crop-geometry intent 表面；无 `weCropper`、Canvas、image chooser、pixel processing 或 file output。 / Materially derived, independently rewritten crop-geometry intent surface without `weCropper`, Canvas, image chooser, pixel processing, or file output. |
| `src/uni_modules/uview-pro/components/u-upload/u-upload.vue` | `HIA-uView-UI/src/components/u-upload/u-upload.vue` | `3d47f49855d94c33a8f1485e16094150d8219654` | 实质衍生、独立重写的 caller file-state intent list；无 chooser、file bytes、upload、deletion、preview implementation、network 或 cache。 / Materially derived, independently rewritten caller file-state intent list without chooser, file bytes, upload, deletion, preview implementation, network, or cache. |
| `src/uni_modules/uview-pro/components/u-verification-code/u-verification-code.vue` | `HIA-uView-UI/src/components/u-verification-code/u-verification-code.vue` | `d2ad4a4cd3edf1b9c0d5c76d3358329807467078` | 实质衍生、独立重写的 caller remaining/request-state projection；无 sending、timer、storage、network、identity 或 platform state。 / Materially derived, independently rewritten caller remaining/request-state projection without sending, timer, storage, network, identity, or platform state. |

## `uview-pro@0.6.15` carry-forward review / `uview-pro@0.6.15` 顺延审阅

Annotated tag object `3614e7287d9ba6cc1801ef6d3389c5cb424879ca` resolves to commit and npm `gitHead` `bec4b39cd3195354d65c1fc8722745d72052bd8c`, tree `ee561c6c12e40922d137b24fb0adb6e7f7a18c1e`, with integrity `sha512-rh8AcjeQ/6X8tlVtZj5MNOoWj1Js/+45caFSuPE4eDQiI+8sS7kaIESDrFPPeO3sRGSMuTqw5crsoQq+Slh41A==`. The repository MIT blob remains `837f9643580783834339d1b40e58772413895e39`.

annotated tag object `3614e7287d9ba6cc1801ef6d3389c5cb424879ca` 指向 commit 与 npm `gitHead` `bec4b39cd3195354d65c1fc8722745d72052bd8c`、tree `ee561c6c12e40922d137b24fb0adb6e7f7a18c1e`，integrity 为 `sha512-rh8AcjeQ/6X8tlVtZj5MNOoWj1Js/+45caFSuPE4eDQiI+8sS7kaIESDrFPPeO3sRGSMuTqw5crsoQq+Slh41A==`。仓库 MIT blob 仍为 `837f9643580783834339d1b40e58772413895e39`。

The following 13 reviewed source files are byte-identical to the historical `0.6.13` blobs.

以下 13 个受审阅来源文件与历史 `0.6.13` blob 逐字节相同。

| Upstream source path / 上游来源路径 | Shared blob / 共同 blob | Result / 结论 |
| --- | --- | --- |
| `src/uni_modules/uview-pro/components/u-status-bar/u-status-bar.vue` | `f553b37a68a6e2e9eff915d6540e865e206bf7b7` | 逐字节未变化。 / Byte-identical. |
| `src/uni_modules/uview-pro/components/u-safe-bottom/u-safe-bottom.vue` | `76fdc8fe6d8d3007471f5e188d71ea1ea46c0d55` | 逐字节未变化。 / Byte-identical. |
| `src/uni_modules/uview-pro/components/u-loading/u-loading.vue` | `bbce8392a6a1217032966047352e0cf2a79d5629` | 逐字节未变化。 / Byte-identical. |
| `src/uni_modules/uview-pro/components/u-mask/u-mask.vue` | `4855556f0df534f980fc200dec4fb36870d58091` | 逐字节未变化。 / Byte-identical. |
| `src/uni_modules/uview-pro/components/u-no-network/u-no-network.vue` | `a6e1bd1398694344e26ba65fba08dec1642570b3` | 逐字节未变化。 / Byte-identical. |
| `src/uni_modules/uview-pro/components/u-top-tips/u-top-tips.vue` | `4c1c1bf951a5649f7bf9fe8b324ae93a267b35a2` | 逐字节未变化。 / Byte-identical. |
| `src/uni_modules/uview-pro/components/u-transition/u-transition.vue` | `b08546dde9940d3595d7f3c7881cd0d2a290d941` | 逐字节未变化。 / Byte-identical. |
| `src/uni_modules/uview-pro/components/u-config-provider/u-config-provider.vue` | `36bec7483519c49816ba401ff882d4cc64a67133` | 逐字节未变化。 / Byte-identical. |
| `src/uni_modules/uview-pro/components/u-root-portal/u-root-portal.vue` | `5550da0826a50c773d9a946251dc7de69ad4e0cb` | 逐字节未变化。 / Byte-identical. |
| `src/uni_modules/uview-pro/components/u-action-sheet-item/u-action-sheet-item.vue` | `fad2cc9c939e52b0194c192819f9bd501a1056af` | 逐字节未变化。 / Byte-identical. |
| `src/uni_modules/uview-pro/components/u-message-input/u-message-input.vue` | `58df4a5ca051bfbfaed0eb577ac7da2978f10009` | 逐字节未变化。 / Byte-identical. |
| `src/uni_modules/uview-pro/components/u-avatar-cropper/u-avatar-cropper.vue` | `e8c3c9077f26a5cef5e12bbf76f27111fc8cbb4f` | 逐字节未变化。 / Byte-identical. |
| `src/uni_modules/uview-pro/components/u-verification-code/u-verification-code.vue` | `d2ad4a4cd3edf1b9c0d5c76d3358329807467078` | 逐字节未变化。 / Byte-identical. |

The following 11 files changed only through 20 explicit child-component import additions in upstream commit `091b5bb70312f43026c9847cca0709cafccaaaaa`. These edges are recorded for dependency closure; they are not automatically incorporated into HIA-uView-UI.

以下 11 个文件仅因上游 commit `091b5bb70312f43026c9847cca0709cafccaaaaa` 增加共 20 行显式子组件 import 而变化。这些边用于记录依赖闭包，不会自动进入 HIA-uView-UI。

| Upstream source path / 上游来源路径 | `0.6.13` blob | `0.6.15` blob | Added upstream edge / 新增上游依赖边 |
| --- | --- | --- | --- |
| `src/uni_modules/uview-pro/components/u-navbar/u-navbar.vue` | `df2f98a19c99565547822d2b03122652d279dfac` | `5699978bc24af9604fa921dcd591aa954df4e2c6` | `uIcon` |
| `src/uni_modules/uview-pro/components/u-back-top/u-back-top.vue` | `9c84d22c1b6106f176a1755b6ab3ac4d7e30bf5f` | `c66d12f81d0c302329505abcc2ea668e6bc48460` | `uIcon` |
| `src/uni_modules/uview-pro/components/u-cell-item/u-cell-item.vue` | `db0cd27e53ad32d4c6071db6addd1114dd96b905` | `99ba4788743993e64964fb6d36ccc0c6e57e533d` | `uIcon` |
| `src/uni_modules/uview-pro/components/u-loading-popup/u-loading-popup.vue` | `4e506b8dbde3e5deabf594124b187cb269893d9b` | `f0f01c52385946117363ea38a4bc3d10dad0b57e` | `uLoading` |
| `src/uni_modules/uview-pro/components/u-notice-bar/u-notice-bar.vue` | `b2584312f8462900bd9852e463e3b06ee3eafaba` | `b26cdfa14dc086908fecf6bc9eb19bcec05e7baf` | `uColumnNotice`, `uRowNotice` |
| `src/uni_modules/uview-pro/components/u-fab/u-fab.vue` | `f2cdc512e7e5fd7b6016190f9f5b516a84de4cae` | `58b88c2c5a26f6bce4dec7bbb98bbd5d19fa6cde` | `uButton`, `uIcon` |
| `src/uni_modules/uview-pro/components/u-city-select/u-city-select.vue` | `22c831490262552da63a162e9287c4edaa523daf` | `147a465edc1ca1da20118f3fd46bc70c03d34551` | `uCellGroup`, `uCellItem`, `uIcon`, `uPopup`, `uTabs` |
| `src/uni_modules/uview-pro/components/u-car-keyboard/u-car-keyboard.vue` | `90de12b80ff4ff22b41e84679e8735504a28f26a` | `1ab26ddc8b78d55f06339321597de07ab0f1a43d` | `uIcon` |
| `src/uni_modules/uview-pro/components/u-keyboard/u-keyboard.vue` | `2590409722bcf4f219645f99e6d03c0c37a166ca` | `ff648990ee61f220f5d3f376cfd6300a454ef9da` | `uCarKeyboard`, `uNumberKeyboard`, `uPopup` |
| `src/uni_modules/uview-pro/components/u-number-keyboard/u-number-keyboard.vue` | `ba54f8e97bd9391b40ce5fa639a27c1c0c0fa30e` | `816cc99ac5299db271c67d786f80f16728af6592` | `uIcon` |
| `src/uni_modules/uview-pro/components/u-upload/u-upload.vue` | `3d47f49855d94c33a8f1485e16094150d8219654` | `0df99d644dc17adbeea3607aed6b48e1f71841c0` | `uIcon`, `uLineProgress` |

This carry-forward review does not retroactively attribute the 24 HIA targets to `0.6.15`, authorize automatic reuse of future upstream changes, or incorporate the added dependency edges. Every future copied or materially derived file still requires a separate per-file review and additive notice.

本顺延审阅不会把 24 个 HIA 目标追溯改写为来源于 `0.6.15`，不会授权自动复用未来上游变更，也不会引入新增依赖边。今后每个复制或实质衍生文件仍须单独完成逐文件审计并追加声明。

## Additional reviewed `uview-pro@0.6.15` bounded derivations / 新增已审阅 `uview-pro@0.6.15` 有界实质衍生

The entries below use `anyup/uView-Pro`, package `uview-pro@0.6.15`, immutable commit `bec4b39cd3195354d65c1fc8722745d72052bd8c`, repository tree `ee561c6c12e40922d137b24fb0adb6e7f7a18c1e`, package tree `8c356eb79adb16c63c2b1b44e87c6aaf27a37810`, components tree `27e58b2924e42ebd761cdf5a245c61f7f8984d6f`, and MIT license blob `837f9643580783834339d1b40e58772413895e39`. Adoption is limited to the exact SFC blobs listed here. Upstream TypeScript types and dependency closures are semantic references only and are not incorporated.

下列条目使用 `anyup/uView-Pro`、package `uview-pro@0.6.15`、不可变 commit `bec4b39cd3195354d65c1fc8722745d72052bd8c`、仓库 tree `ee561c6c12e40922d137b24fb0adb6e7f7a18c1e`、package tree `8c356eb79adb16c63c2b1b44e87c6aaf27a37810`、components tree `27e58b2924e42ebd761cdf5a245c61f7f8984d6f` 与 MIT license blob `837f9643580783834339d1b40e58772413895e39`。采用范围仅限表内精确 SFC blob；上游 TypeScript types 与依赖闭包只作语义参考，未被纳入。

| Upstream source path / 上游来源路径 | Source blob / 来源 blob | HIA target / HIA 目标 | Adoption form / 采用形式 |
| --- | --- | --- | --- |
| `src/uni_modules/uview-pro/components/u-form/u-form.vue` | `6ace7cc46414c28572f62272fd9fef6300572ab9` | `src/components/u-form/u-form.vue` | 有界实质衍生、按 HIA 边界重写的局部字段 registry 与 validate/reset 编排；不包含上游 `$u`、toast、关系 hook 或 validator。 / Bounded material derivation, rewritten within HIA boundaries for the local field registry and validate/reset orchestration; excludes upstream `$u`, toast, relation hooks, and validator. |
| `src/uni_modules/uview-pro/components/u-form-item/u-form-item.vue` | `fc60f477b688d24033cdf26b2e3b85377f4389da` | `src/components/u-form-item/u-form-item.vue` | 有界实质衍生、按 HIA 边界重写的字段路径、初值/reset 与校验状态编排；不包含上游 `async-validator`、`$u`、图标、关系 hook 或主题样式。 / Bounded material derivation, rewritten within HIA boundaries for field paths, initial-value/reset, and validation-state orchestration; excludes upstream `async-validator`, `$u`, icons, relation hooks, and theme styles. |
| `src/uni_modules/uview-pro/components/u-field/u-field.vue` | `861330f3d119622ccf7689b22c75f454fb5b2eff` | `src/components/u-field/u-field.vue` | 有界实质衍生、按 HIA 受控边界重写的 model、内建输入、disabled/readonly 与四项事件表面；不包含上游图标、`$u`、trim、timer、主题或关系 hook。 / Bounded material derivation, rewritten within HIA controlled boundaries for model, built-in input, disabled/readonly, and four-event surfaces; excludes upstream icons, `$u`, trimming, timers, theme, and relation hooks. |
