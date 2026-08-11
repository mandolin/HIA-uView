/**
 * @module dropdown-context
 * @lang zh-CN UDropdown 与 UDropdownItem 之间的私有局部选择与 registry context，不承载业务、路由或页面状态。
 * @lang en Private local selection and registry context between UDropdown and UDropdownItem; it carries no business, route, or page state.
 */
export const DROPDOWN_CONTEXT = Symbol('u-dropdown-context');

/**
 * @lang zh-CN 判断候选值能否作为稳定的 dropdown registry name；空字符串与零有效，非有限数字无效。
 * @lang en Determines whether a candidate can be a stable dropdown registry name; empty strings and zero are valid, while non-finite numbers are invalid.
 * @param {unknown} value <lang><zh-CN>待验证的候选值。</zh-CN><en>Candidate value to validate.</en></lang>
 * @returns {value is string|number} <lang><zh-CN>候选值是否为字符串或有限数字。</zh-CN><en>Whether the candidate is a string or finite number.</en></lang>
 */
export function isDropdownName(value) {
  // <lang><zh-CN>严格限制 identity 类型，避免对象键、NaN 或 Infinity 形成不可移植的注册关系。</zh-CN><en>Strictly limits identity types so object keys, NaN, or Infinity cannot form non-portable registrations.</en></lang>
  return typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value));
}
