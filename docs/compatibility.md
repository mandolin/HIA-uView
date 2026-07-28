# Compatibility profile

## Initial profile

HIA-uView is being designed first for **UniApp Vue 3** applications targeting the **WeChat Mini Program** platform (`mp-weixin`). This is the only compatibility profile currently under active validation.

| Area | Current status | Contract |
| --- | --- | --- |
| UniApp runtime | Planned and documented | Vue 3 APIs and UniApp semantics are the initial target. |
| WeChat Mini Program | Planned and documented | Components and fixtures will be reviewed against `mp-weixin` first. |
| App / H5 / other mini-programs | Not validated | No compatibility or fallback behavior is promised yet. |
| UI component APIs | Not published | A future component contract will state its platform profile explicitly. |

## Platform rules

- A component must not silently access device or platform APIs. Platform access needs an explicit adapter, feature detection, and a documented fallback or unsupported result.
- A component must not claim cross-platform support merely because it compiles. Each target needs its own fixture and validation evidence.
- Application and business rules belong outside this package. HIA-uView-Biz, when integrated later, must use a documented package contract rather than importing UI source files.

## Future profiles

App and web targets may be introduced as separate compatibility profiles after their platform differences, test fixtures, and public API effects are documented. They do not inherit support from the initial `mp-weixin` profile.
