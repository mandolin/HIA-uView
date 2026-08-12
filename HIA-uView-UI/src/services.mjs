/**
 * @module hia-uview-services
 * @lang zh-CN 提供 HIA-uView UI 的显式局部 feedback service 公共入口。调用方必须创建并传入 scope；本模块不公开宿主注册、settlement 或 options normalizer，也不创建默认全局服务。
 * @lang en Provides the public explicit-local feedback-service entry for HIA-uView UI. Callers must create and pass a scope; this module exposes no host registration, settlement, or options normalizer and creates no default global service.
 */

// <lang><zh-CN>只从内部 runtime 转发三个调用方入口；组件桥接能力保留在包内直接 import 边界。</zh-CN><en>Forwards only three caller entries from the internal runtime; component-bridge capabilities remain behind direct package-internal imports.</en></lang>
export {
  createUFeedbackScope,
  useModal,
  useToast
} from './feedback-service-runtime.mjs';
