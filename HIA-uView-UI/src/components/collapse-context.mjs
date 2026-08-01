/**
 * @module collapse-context
 * @lang zh-CN 为受控 u-collapse 与 u-collapse-item 提供局部 Vue context；context 不跨越当前组件子树，也不保存持久化或业务状态。
 * @lang en Provides local Vue context for controlled u-collapse and u-collapse-item; the context does not cross the current component subtree or store persistence or business state.
 */

// <lang><zh-CN>使用稳定的 Symbol 作为局部键，避免把折叠父子关系注册到全局对象。</zh-CN><en>Uses a stable Symbol as a local key so the collapse parent-child relationship is not registered on a global object.</en></lang>
export const COLLAPSE_CONTEXT = Symbol('hia-uview-collapse-context');
