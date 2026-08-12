/**
 * @module hia-uview-ui-service-types
 * @lang zh-CN 仅转发显式局部 feedback service 的公共 TypeScript API。该入口不公开组件宿主注册、request settlement、normalizer 或任何全局服务。
 * @lang en Re-exports only the public TypeScript API of explicit-local feedback services. This entry exposes no component-host registration, request settlement, normalizer, or global service.
 */

// <lang><zh-CN>值导出与 `@hia-uview/ui/services` runtime 的三个调用方入口严格对应，不创建 import-time scope。</zh-CN><en>Value exports correspond exactly to the three caller entries of the `@hia-uview/ui/services` runtime and create no import-time scope.</en></lang>
export {
  createUFeedbackScope,
  useModal,
  useToast
} from './index';

// <lang><zh-CN>类型转发只覆盖 scope、有限 options/controller 与可判别结果，不泄漏内部 host 或 registry contract。</zh-CN><en>Type re-exports cover only scope, finite options/controllers, and discriminated results without leaking internal host or registry contracts.</en></lang>
export type {
  UFeedbackAcceptedResult,
  UFeedbackCommandResult,
  UFeedbackRejectedResult,
  UFeedbackRejectionReason,
  UFeedbackScope,
  UModalConfirmOptions,
  UModalController,
  UModalOptions,
  UToastController,
  UToastInput,
  UToastOptions,
  UToastPosition,
  UToastTone
} from './index';
