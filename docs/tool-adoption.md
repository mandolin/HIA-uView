# HIA-uView-Tool adoption metadata

`hia-uview-tool check adoption` validates a deliberately small JSON declaration. It is a UI-integration guard, not a project analyser, starter template, or business configuration format.

The manifest gives a consuming application one auditable way to state four UI facts: target `profile`, runtime-message `locale`, the selected UI package manifest, its imported style entry or entries, and explicitly used component names. It does not inspect whether the application's source really imports those assets or components; application source remains private to the application and outside the Tool boundary.

The command checks the following relationships:

- The adoption profile and locale equal the Tool configuration profile and locale.
- The referenced component manifest is already listed by `hia-uview.config.json`.
- The referenced UI manifest has the same profile, offers every declared component, and offers the adoption locale for each of those components.
- The adoption style entries include the selected UI manifest's style entry resolved relative to the Tool project root.
- Paths, names, and lists are unique and in code-point order, making text and JSON reports deterministic.

An adoption manifest cannot declare page paths, routes, APIs, requests, backend adapters, Directus, business modules, permissions, identity, credentials, hooks, arbitrary script locations, template expressions, or domain data. Those are application or HIA-uView-Biz concerns and belong outside this UI-and-Tool repository.

## Example

```json
{
  "version": 1,
  "profile": "mp-weixin",
  "locale": "zh-Hans",
  "componentManifest": "vendor/hia-uview/hia-uview.components.json",
  "styleEntries": [
    "vendor/hia-uview/src/style.css"
  ],
  "components": [
    "u-button",
    "u-field"
  ]
}
```

The example does not create a package dependency, install anything, load a package from a registry, or grant HIA-uView-Tool access to the rest of the application. The containing `hia-uview.config.json` must also list both the selected component manifest and this adoption manifest using safe relative paths.

## Evidence limit

Passing `check adoption` means only that the declared JSON records agree. It is not evidence of source imports, compilation, WeChat DevTools, device behavior, accessibility, localization rendering, package publication, or backend integration. Use the UI repository's separate compiler, test, package, and compatibility gates for those claims.
