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

## Readability rules

- Cobalt `#0047AB` with white foreground is checked as a normal-text pair against the WCAG 2.2 AA 4.5:1 threshold.
- Clear cyan `#00A8D3` uses the dark `#001B2E` foreground. It must not default to white text or icons on a solid cyan surface.
- Color never communicates a state on its own. Components add text, icon, shape, boundary, position, or another non-color signal as appropriate.
- Status colors, gray-scale expansion, radius, shadows, dark mode, high contrast, fonts, and icons are not part of this first token set. They require separate evidence and documentation.

Run `npm run theme:check` to validate the fixed HIA foundation colors and the two current text-contrast pairs. This automated check does not replace component fixtures or platform accessibility evidence.
