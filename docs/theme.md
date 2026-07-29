# HIA light theme

The initial HIA-uView theme is a light theme. It uses cobalt blue as the primary structural and action color, and clear cyan as an accent for emphasis, data highlights, and progress.

## Foundation colors

| Token | Value | Role |
| --- | --- | --- |
| `--u-ref-color-brand-cobalt` | `#0047AB` | Brand, structure, primary action, selected state, and focus. |
| `--u-ref-color-brand-cyan` | `#00A8D3` | Limited emphasis, data highlighting, progress, and secondary attention. |
| `--u-ref-color-neutral-0` | `#FFFFFF` | Default light surface and primary-action foreground. |
| `--u-ref-color-neutral-950` | `#001B2E` | Primary text and accent foreground. |

Components consume semantic tokens such as `--u-sys-color-action-primary` and `--u-sys-color-accent`; they must not scatter foundation color values in component rules.

## Component token groups

| Component / 组件 | Token family / Token 族 | Boundary / 边界 |
| --- | --- | --- |
| `UButton` | `--u-comp-button-*` | Local action, loading, disabled, size, and text treatment. / 本地操作、加载、禁用、尺寸和文字处理。 |
| `UStack` | `--u-comp-stack-*` | Discrete layout gaps only; it does not define page geometry. / 仅定义离散布局间距，不定义页面几何。 |
| `UNavBar` | `--u-comp-nav-bar-*` | Presentation surface and text controls; no route, system-bar, icon, or font semantics. / 展示表面和文字控制项；没有路由、系统栏、图标或字体语义。 |
| `UCell` | `--u-comp-cell-*` | Generic information-row surface, text, spacing, and non-color disabled treatment. / 通用信息行表面、文字、间距和非颜色禁用处理。 |

## Readability rules

- Cobalt `#0047AB` with white foreground is checked as a normal-text pair against the WCAG 2.2 AA 4.5:1 threshold.
- Clear cyan `#00A8D3` uses the dark `#001B2E` foreground. It must not default to white text or icons on a solid cyan surface.
- Color never communicates a state on its own. Components add text, icon, shape, boundary, position, or another non-color signal as appropriate.
- Status colors, gray-scale expansion, radius, shadows, dark mode, high contrast, fonts, and icons are not part of this first token set. They require separate evidence and documentation.

Run `npm run theme:check` to validate the fixed HIA foundation colors and the two current text-contrast pairs. This automated check does not replace component fixtures or platform accessibility evidence.
