# Documentation

HIA-uView uses HIA Documentation Sys from the beginning. JavaScript documentation is generated with JSDoc, `@mandolin/jsdoc-plugin-hia-sys`, and `@mandolin/jsdoc-theme-hia`.

Run the complete documentation gate with:

```bash
npm run docs:check
```

The command verifies bilingual JSDoc annotations, generates a local HIA integration artifact, and checks that the artifact contains neither source fragments nor absolute paths. Generated output stays under `temp/documentation/` and is not published.

## Bilingual source rules

- JavaScript uses `@lang zh-CN` and `@lang en`; JSDoc field descriptions use inline `<lang>` values for both locales.
- TypeScript uses one TSDoc-compatible comment block with matching Chinese and English sections until a field-level locale extractor is available.
- CSS/SCSS and HTML/Vue templates use their legal CSSDoc or HTMDoc annotation forms with matching `@lang zh-CN` and `@lang en` values. The repository gate recognizes these authored source files as they are introduced; a direct CSS/Vue extractor is added only after its stable Documentation Sys package is available and audited.
- JSON and YAML remain comment-free; document their semantics in schemas or sidecar documentation.

Documentation locales (`zh-CN`, `en`) describe source code. They are distinct from the UI runtime locale contract (`zh-Hans`, `en`).
