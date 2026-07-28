# Design-system contract

HIA-uView defines its design-system boundary before publishing component APIs. The initial profile is UniApp Vue 3 for WeChat Mini Program applications; this document does not promise App, H5, or other platform behavior.

## Token layers

Tokens use three layers:

| Layer | Purpose | Consumer rule |
| --- | --- | --- |
| `ref` | Raw design values such as color scales, spacing scales, and durations | Theme definitions and token mappings only. |
| `sys` | Semantic intent such as surface, text, action, status, focus, layer, and typography | Components and application layouts should use these tokens. |
| `comp` | A component-specific semantic token | Only the owning component and documented theme extensions may use it. |

The planned CSS-variable prefixes are `--hia-ref-*`, `--hia-sys-*`, and `--hia-comp-<component>-*`. Components must not rely on hard-coded brand values when a semantic token applies. Token names and values are not published yet.

## Theme and style boundaries

- A theme changes token values, not component structure, business copy, or application logic.
- The initial contract covers a light theme only. Dark and high-contrast themes require their own profile and validation evidence.
- A component root uses a documented `hia-<component>` namespace. Consumers customize through documented tokens, props, and slots rather than deep selectors.
- Global styles are limited to documented token definitions and base rules. Components must not apply hidden resets or make assumptions about application-page CSS.
- Overlay, dialog, toast, and similar stacking behavior must use semantic layer tokens rather than arbitrary `z-index` values.

## Accessibility design requirements

HIA-uView will use WCAG 2.2 AA as a design and test reference; this is not a platform conformance certification.

- Applicable states must be perceptible without relying on color alone.
- Icon-only actions need an accessible or visible label; errors need a recovery-oriented message.
- Text and non-text contrast, touch-target size or spacing, loading, disabled, and error states must be tested in each component fixture.
- Platform-specific focus, screen-reader, and semantic behavior is documented as supported, degraded, or unsupported. No Web ARIA behavior is implied for a mini-program target.

## Localization boundary

- UI text uses stable component message IDs and BCP 47 locale IDs, for example `zh-Hans` and `en`.
- Applications own business terms, page titles, tab-bar text, permissions, and domain errors. Components own only their generic UI messages.
- A future locale adapter may provide interpolation, pluralization, dates, and numbers. HIA-uView does not select an i18n runtime yet.
- Text must tolerate translation expansion. RTL is a future compatibility profile, not an implicit result of text alignment.
- Native mini-program navigation and tab-bar localization remain an application-level concern.

## Component-design checklist

Before a component is published, its contract must state its compatibility profile, token usage, customization points, localization keys, accessible states, platform fallbacks, and fixture coverage.
