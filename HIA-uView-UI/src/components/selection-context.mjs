/**
 * @module selection-context
 * @lang zh-CN 定义 radio/checkbox group 与其直接子组件共享的私有注入键。键只传递受控本地选择上下文，不形成全局 registry、store、选项数据源或业务状态。
 * @lang en Defines private injection keys shared by radio/checkbox groups and their direct child components. Keys carry controlled local selection context only and form no global registry, store, option data source, or business state.
 */

/**
 * @lang zh-CN radio group 私有上下文键；只由同一 HIA-uView runtime entry 内的 `URadioGroup` provide、`URadio` inject。
 * @lang en Private radio-group context key; provided only by `URadioGroup` and injected only by `URadio` within the same HIA-uView runtime entry.
 */
export const RADIO_GROUP_CONTEXT = Symbol('hia-uview-radio-group');

/**
 * @lang zh-CN checkbox group 私有上下文键；只由同一 HIA-uView runtime entry 内的 `UCheckboxGroup` provide、`UCheckbox` inject。
 * @lang en Private checkbox-group context key; provided only by `UCheckboxGroup` and injected only by `UCheckbox` within the same HIA-uView runtime entry.
 */
export const CHECKBOX_GROUP_CONTEXT = Symbol('hia-uview-checkbox-group');
