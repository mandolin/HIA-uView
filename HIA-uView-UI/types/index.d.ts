/**
 * @module hia-uview-ui-types
 * @lang zh-CN 定义私有预发布 UI 包的静态 TypeScript 入口。它只描述当前显式 runtime 导出和受审计的受控迁移表面；声明不会注册组件、注入样式或扩大平台支持承诺。
 * @lang en Defines the static TypeScript entry for the private pre-release UI package. It describes only current explicit runtime exports and audited controlled migration surfaces; declarations neither register components nor inject styles or broaden platform-support claims.
 */

import type { App, ComponentOptionsMixin, ComputedRef, DefineComponent, EmitsOptions, Plugin } from 'vue';

/**
 * @lang zh-CN 表示尚未提供逐 prop 精确声明的当前 runtime 组件。它保证导出名称可被类型检查，但不把通用基线表述为完整 API 或上游兼容承诺。
 * @lang en Represents a current runtime component whose per-prop precise declaration is not yet delivered. It guarantees that the export name type-checks, but does not present the generic baseline as a complete API or upstream-compatibility promise.
 */
export type UViewComponent = DefineComponent<Record<string, unknown>, {}, unknown>;

/**
 * @lang zh-CN 描述具有精确 props、公开实例成员与事件 payload 的 Vue 组件；第二个泛型对应 Vue 3.4 `RawBindings`，使 `InstanceType` 能读取 `defineExpose` 对应成员。
 * @lang en Describes a Vue component with precise props, public instance members, and event payloads; the second generic maps to Vue 3.4 `RawBindings`, allowing `InstanceType` to read members corresponding to `defineExpose`.
 */
export type UViewTypedComponent<Props, Exposed = {}, Emits extends EmitsOptions = {}> =
  DefineComponent<Props, Exposed, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, Emits>;

/**
 * @lang zh-CN 表示调用方拥有的表单模型根；组件只在显式 reset 命令中恢复已经存在的安全字段路径。
 * @lang en Represents the caller-owned form-model root; components restore an existing safe field path only through an explicit reset command.
 */
export type UFormModel = Record<string, unknown>;

/**
 * @lang zh-CN 表示 dotted/index 字段路径；危险段、空路径和不可遍历结构仍由 runtime 拒绝。
 * @lang en Represents a dotted/index field path; dangerous segments, empty paths, and non-traversable structures remain rejected by runtime.
 */
export type UFormFieldPath = string;

/**
 * @lang zh-CN 表示输入后代可自动通知的有限规则触发器。
 * @lang en Represents the finite rule triggers that input descendants may notify automatically.
 */
export type UFormRuleTrigger = 'change' | 'blur';

/**
 * @lang zh-CN 表示单字段校验调用的触发上下文；空字符串用于显式完整校验。
 * @lang en Represents the trigger context of a single-field validation call; the empty string denotes explicit complete validation.
 */
export type UFormValidationTrigger = '' | UFormRuleTrigger;

/**
 * @lang zh-CN 表示首轮 runtime 实际实现的有限内建规则类型；未知类型会校验失败而不会被静默忽略。
 * @lang en Represents the finite built-in rule types implemented by the current runtime; an unknown type fails validation rather than being silently ignored.
 */
export type UFormRuleType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';

/**
 * @lang zh-CN 表示当前校验器可公开返回的稳定、非本地化失败代码。
 * @lang en Represents the stable nonlocalized failure codes that the current validator may expose.
 */
export type UFormValidationErrorCode =
  | 'required'
  | 'type'
  | 'len'
  | 'min'
  | 'max'
  | 'pattern'
  | 'invalid-rule'
  | 'validator'
  | 'validator-exception';

/**
 * @lang zh-CN 描述一个字段的首个公开校验错误；文字只来自调用方规则或 validator。
 * @lang en Describes the first public validation error for a field; its copy comes only from a caller rule or validator.
 */
export interface UFormValidationError {
  /** 中文：发生错误的规范字段路径。English: Canonical field path where the error occurred. */
  prop: UFormFieldPath;
  /** 中文：调用方提供的错误文字；库不生成默认语言。English: Caller-provided error copy; the library generates no default language. */
  message: string;
  /** 中文：原始合法规则声明序列中的零基索引，不因 trigger 过滤而重编号。English: Zero-based index in the original valid-rule declaration sequence, without renumbering after trigger filtering. */
  ruleIndex: number;
  /** 中文：产生本结果的显式或交互触发上下文。English: Explicit or interaction trigger context that produced this result. */
  trigger: UFormValidationTrigger;
  /** 中文：稳定、非本地化的失败分类。English: Stable nonlocalized failure classification. */
  code: UFormValidationErrorCode;
}

/**
 * @lang zh-CN 描述自定义 validator 的受控返回值；false、非空字符串和 Error 表示失败，true、空字符串、null 与 undefined 表示通过。
 * @lang en Describes the controlled return value of a custom validator; false, a nonempty string, and Error mean failure, while true, an empty string, null, and undefined mean success.
 */
export type UFormRuleValidatorOutcome = boolean | string | Error | null | void;

/**
 * @lang zh-CN 描述传给调用方 validator 的浅冻结上下文；model 仍由调用方拥有并按只读约定提供。
 * @lang en Describes the shallow-frozen context passed to a caller validator; the model remains caller-owned and is provided under a readonly convention.
 */
export interface UFormRuleValidatorContext {
  /** 中文：当前规范字段路径。English: Current canonical field path. */
  readonly field: UFormFieldPath;
  /** 中文：调用方模型的只读类型视图。English: Readonly typed view of the caller model. */
  readonly model: Readonly<UFormModel>;
  /** 中文：当前显式或交互触发上下文。English: Current explicit or interaction trigger context. */
  readonly trigger: UFormValidationTrigger;
  /** 中文：当前执行规则的只读类型视图。English: Readonly typed view of the currently executing rule. */
  readonly rule: Readonly<UFormRule>;
}

/**
 * @lang zh-CN 描述应用源码直接提供的同步或 Promise validator；参数顺序固定为字段值与受控上下文。
 * @lang en Describes a synchronous or Promise validator supplied directly by application source; parameters are fixed as field value followed by constrained context.
 */
export type UFormRuleValidator = (
  value: unknown,
  context: UFormRuleValidatorContext
) => UFormRuleValidatorOutcome | Promise<UFormRuleValidatorOutcome>;

/**
 * @lang zh-CN 描述当前 runtime 支持的声明式单条表单规则；没有网络、脚本字符串、toast 或业务默认文案。
 * @lang en Describes one declarative form rule supported by the current runtime; it contains no network, script string, toast, or business-default copy.
 */
export interface UFormRule {
  /** 中文：是否拒绝 undefined、null、空字符串或空数组。English: Whether to reject undefined, null, an empty string, or an empty array. */
  required?: boolean;
  /** 中文：有限内建值类型。English: Finite built-in value type. */
  type?: UFormRuleType;
  /** 中文：字符串/数组精确长度或数字精确值。English: Exact string/array length or exact numeric value. */
  len?: number;
  /** 中文：字符串/数组最小长度或数字下界。English: Minimum string/array length or numeric lower bound. */
  min?: number;
  /** 中文：字符串/数组最大长度或数字上界。English: Maximum string/array length or numeric upper bound. */
  max?: number;
  /** 中文：用于字符串化值检查的调用方 RegExp。English: Caller RegExp used to check the stringified value. */
  pattern?: RegExp;
  /** 中文：允许自动执行本规则的交互触发器。English: Interaction triggers allowed to run this rule automatically. */
  trigger?: UFormRuleTrigger | readonly UFormRuleTrigger[];
  /** 中文：调用方本地化的失败文字。English: Caller-localized failure copy. */
  message?: string;
  /** 中文：同步或 Promise validator；与 asyncValidator 皆存在时后者优先。English: Synchronous or Promise validator; asyncValidator takes precedence when both exist. */
  validator?: UFormRuleValidator;
  /** 中文：上游熟悉的异步命名 alias，使用相同受控签名。English: Upstream-familiar asynchronous naming alias using the same constrained signature. */
  asyncValidator?: UFormRuleValidator;
}

/**
 * @lang zh-CN 描述表单规则根；既支持精确 dotted key，也支持与字段路径等价的安全嵌套对象。
 * @lang en Describes the form-rule root; it supports both exact dotted keys and safe nested objects equivalent to field paths.
 */
export interface UFormRules {
  /** 中文：字段路径或单个安全路径段映射到规则、规则数组或下一层规则对象。English: A field path or one safe path segment maps to a rule, rule array, or nested rule object. */
  [fieldPathOrSegment: string]: UFormRule | readonly UFormRule[] | UFormRules;
}

/**
 * @lang zh-CN 表示表单项与字段可呈现的有限校验状态。
 * @lang en Represents the finite validation states that a form item or field may present.
 */
export type UFormValidationState = 'idle' | 'validating' | 'error';

/**
 * @lang zh-CN 描述 UForm 的兼容 callback；每次调用都获得 boolean 与新的错误数组。
 * @lang en Describes the compatibility callback of UForm; each invocation receives a boolean and a fresh error array.
 */
export type UFormValidateCallback = (valid: boolean, errors: UFormValidationError[]) => void;

/**
 * @lang zh-CN 描述 UForm 的调用方模型、规则、禁用继承与有限标签布局。
 * @lang en Describes UForm caller model, rules, disabled inheritance, and finite label layout.
 */
export interface UFormProps {
  /** 中文：调用方拥有的表单模型。English: Caller-owned form model. */
  model?: UFormModel;
  /** 中文：dotted 或安全嵌套规则根。English: Dotted or safely nested rule root. */
  rules?: UFormRules;
  /** 中文：是否禁用本表单子树及 submit/reset 意图。English: Whether this form subtree and submit/reset intents are disabled. */
  disabled?: boolean;
  /** 中文：字段标签的有限默认位置。English: Finite default position of field labels. */
  labelPosition?: 'top' | 'left';
}

/**
 * @lang zh-CN 描述 UForm 的无 payload submit/reset 意图事件；事件不表示校验、重置或提交已经发生。
 * @lang en Describes UForm submit/reset intent events with no payload; neither event means validation, reset, or submission has occurred.
 */
export type UFormEmits = {
  /** 中文：显式提交意图。English: Explicit submit intent. */
  submit: () => void;
  /** 中文：显式重置意图。English: Explicit reset intent. */
  reset: () => void;
};

/**
 * @lang zh-CN 描述 UForm 通过组件 ref 暴露的有限 imperative API；内部 registry 和 context 不公开。
 * @lang en Describes the finite imperative API exposed by UForm through a component ref; the internal registry and context remain private.
 */
export interface UFormExposed {
  /** 中文：替换后续校验规则并清除旧投影。English: Replaces rules for subsequent validation and clears old projections. */
  setRules(rules: UFormRules): void;
  /** 中文：校验全部当前注册字段并始终 resolve boolean。English: Validates all currently registered fields and always resolves a boolean. */
  validate(callback?: UFormValidateCallback): Promise<boolean>;
  /** 中文：校验一个或多个当前注册字段并始终 resolve boolean。English: Validates one or more currently registered fields and always resolves a boolean. */
  validateField(paths: UFormFieldPath | readonly UFormFieldPath[], callback?: UFormValidateCallback): Promise<boolean>;
  /** 中文：清除全部或所选字段的内部校验投影。English: Clears internal validation projections for all or selected fields. */
  clearValidate(paths?: UFormFieldPath | readonly UFormFieldPath[]): void;
  /** 中文：显式恢复全部注册字段的挂载快照。English: Explicitly restores mount snapshots for all registered fields. */
  resetFields(): void;
  /** 中文：请求既有 submit 意图而不隐式校验。English: Requests the existing submit intent without implicit validation. */
  requestSubmit(): void;
  /** 中文：请求既有 reset 意图而不隐式恢复字段。English: Requests the existing reset intent without implicitly restoring fields. */
  requestReset(): void;
}

/**
 * @lang zh-CN 描述 UFormItem 的字段生命周期、局部规则和兼容呈现输入。
 * @lang en Describes UFormItem field lifecycle, local rules, and compatible presentation inputs.
 */
export interface UFormItemProps {
  /** 中文：注册到最近 UForm 的安全字段路径；空值表示独立展示。English: Safe field path registered with the nearest UForm; empty means standalone presentation. */
  prop?: UFormFieldPath;
  /** 中文：在 form-level 规则之后运行的局部规则。English: Local rules run after form-level rules. */
  rules?: UFormRule | readonly UFormRule[];
  /** 中文：调用方本地化标签。English: Caller-localized label. */
  label?: string;
  /** 中文：仅用于呈现的必填星号。English: Required asterisk used only for presentation. */
  required?: boolean;
  /** 中文：调用方帮助文字。English: Caller-provided help copy. */
  helpText?: string;
  /** 中文：无内部活动时使用的兼容状态；空字符串表示自动。English: Compatible state used without internal activity; empty means automatic. */
  validationState?: '' | UFormValidationState;
  /** 中文：无内部活动时呈现的调用方消息。English: Caller message presented without internal activity. */
  validationMessage?: string;
  /** 中文：局部标签位置覆盖；空字符串继承最近表单。English: Local label-position override; empty inherits from the nearest form. */
  labelPosition?: '' | 'top' | 'left';
  /** 中文：与最近表单禁用状态合并。English: Merges with the nearest form disabled state. */
  disabled?: boolean;
  /** 中文：向最近输入后代传播的局部只读状态。English: Local readonly state propagated to nearest input descendants. */
  readonly?: boolean;
}

/**
 * @lang zh-CN 描述 UFormItem 通过组件 ref 暴露的单字段 API。
 * @lang en Describes the single-field API exposed by UFormItem through a component ref.
 */
export interface UFormItemExposed {
  /** 中文：校验字段快照并返回首错误或 null。English: Validates the field snapshot and returns the first error or null. */
  validate(trigger?: UFormValidationTrigger): Promise<UFormValidationError | null>;
  /** 中文：清除本项内部校验投影。English: Clears this item's internal validation projection. */
  clearValidate(): void;
  /** 中文：显式恢复本项挂载快照。English: Explicitly restores this item's mount snapshot. */
  resetField(): void;
}

/**
 * @lang zh-CN 描述 UField 的内建受控输入与既有标签/帮助/校验呈现输入；有 default slot 时不合成输入事件。
 * @lang en Describes UField built-in controlled input and existing label/help/validation presentation inputs; no input event is synthesized when a default slot exists.
 */
export interface UFieldProps {
  /** 中文：调用方拥有的字符串或数字值。English: Caller-owned string or numeric value. */
  modelValue?: string | number;
  /** 中文：调用方本地化标签。English: Caller-localized label. */
  label?: string;
  /** 中文：仅用于呈现的必填星号。English: Required asterisk used only for presentation. */
  required?: boolean;
  /** 中文：内建输入提示文字。English: Placeholder copy for the built-in input. */
  placeholder?: string;
  /** 中文：局部禁用状态。English: Local disabled state. */
  disabled?: boolean;
  /** 中文：局部只读状态。English: Local readonly state. */
  readonly?: boolean;
  /** 中文：调用方帮助文字。English: Caller-provided help copy. */
  helpText?: string;
  /** 中文：独立校验呈现状态。English: Independent validation presentation state. */
  validationState?: UFormValidationState;
  /** 中文：独立校验呈现文字。English: Independent validation presentation copy. */
  validationMessage?: string;
}

/**
 * @lang zh-CN 描述 UField 内建模式的四项事件；click 无 payload，confirm 只返回已确认字符串。
 * @lang en Describes the four events of UField built-in mode; click has no payload and confirm returns only a confirmed string.
 */
export type UFieldEmits = {
  /** 中文：标准受控值更新意图。English: Standard controlled-value update intent. */
  'update:modelValue': (value: string) => void;
  /** 中文：未修改字符串输入意图。English: Unmodified string input intent. */
  input: (value: string) => void;
  /** 中文：已确认字符串意图。English: Confirmed string intent. */
  confirm: (value: string) => void;
  /** 中文：无 payload 本地点击意图。English: Local click intent with no payload. */
  click: () => void;
};

/**
 * @lang zh-CN 描述 UInput 的受控值与局部可用性输入。
 * @lang en Describes UInput controlled value and local availability inputs.
 */
export interface UInputProps {
  /** 中文：调用方拥有的字符串或数字值；编辑事件返回字符串。English: Caller-owned string or numeric value; editing events return a string. */
  modelValue?: string | number;
  /** 中文：调用方提示文字。English: Caller-provided placeholder copy. */
  placeholder?: string;
  /** 中文：局部禁用状态。English: Local disabled state. */
  disabled?: boolean;
  /** 中文：局部只读状态。English: Local readonly state. */
  readonly?: boolean;
}

/**
 * @lang zh-CN 描述 UInput 的精确事件 payload；click 无参数，confirm 返回确认字符串，焦点事件保持跨平台 unknown。
 * @lang en Describes precise UInput event payloads; click has no argument, confirm returns a confirmed string, and focus events remain cross-platform unknown values.
 */
export type UInputEmits = {
  /** 中文：标准受控值更新意图。English: Standard controlled-value update intent. */
  'update:modelValue': (value: string) => void;
  /** 中文：未修改字符串输入意图。English: Unmodified string input intent. */
  input: (value: string) => void;
  /** 中文：原始跨平台聚焦事件。English: Original cross-platform focus event. */
  focus: (event: unknown) => void;
  /** 中文：原始跨平台失焦事件。English: Original cross-platform blur event. */
  blur: (event: unknown) => void;
  /** 中文：无 payload 本地点击意图。English: Local click intent with no payload. */
  click: () => void;
  /** 中文：已确认字符串意图。English: Confirmed string intent. */
  confirm: (value: string) => void;
};

/**
 * @lang zh-CN 描述 UTextarea 的受控多行值和有限平台呈现开关。
 * @lang en Describes UTextarea controlled multiline value and finite platform-presentation switches.
 */
export interface UTextareaProps {
  /** 中文：调用方拥有的多行字符串。English: Caller-owned multiline string. */
  modelValue?: string;
  /** 中文：调用方提示文字。English: Caller-provided placeholder copy. */
  placeholder?: string;
  /** 中文：局部禁用状态。English: Local disabled state. */
  disabled?: boolean;
  /** 中文：局部只读状态。English: Local readonly state. */
  readonly?: boolean;
  /** 中文：交给平台的最大长度约束。English: Maximum-length constraint passed to the platform. */
  maxlength?: number;
  /** 中文：平台自动高度开关。English: Platform automatic-height switch. */
  autoHeight?: boolean;
  /** 中文：调用方控制的聚焦开关。English: Caller-controlled focus switch. */
  focus?: boolean;
  /** 中文：是否呈现中性字符计数。English: Whether to present a neutral character count. */
  showCount?: boolean;
}

/**
 * @lang zh-CN 描述 UTextarea 的精确文本事件和跨平台观察事件；click 无 payload，confirm 保留 unknown 平台事件。
 * @lang en Describes UTextarea precise text events and cross-platform observation events; click has no payload while confirm preserves an unknown platform event.
 */
export type UTextareaEmits = {
  /** 中文：标准受控值更新意图。English: Standard controlled-value update intent. */
  'update:modelValue': (value: string) => void;
  /** 中文：未修改字符串输入意图。English: Unmodified string input intent. */
  input: (value: string) => void;
  /** 中文：与 input 相同候选值的 change 意图。English: Change intent carrying the same candidate value as input. */
  change: (value: string) => void;
  /** 中文：原始跨平台聚焦事件。English: Original cross-platform focus event. */
  focus: (event: unknown) => void;
  /** 中文：原始跨平台失焦事件。English: Original cross-platform blur event. */
  blur: (event: unknown) => void;
  /** 中文：原始跨平台确认事件。English: Original cross-platform confirm event. */
  confirm: (event: unknown) => void;
  /** 中文：无 payload 本地点击意图。English: Local click intent with no payload. */
  click: () => void;
};

/**
 * @lang zh-CN 描述 USearch 的受控 query、调用方文字和有限 action 显示开关。
 * @lang en Describes USearch controlled query, caller copy, and finite action-visibility switches.
 */
export interface USearchProps {
  /** 中文：调用方拥有的 query 字符串。English: Caller-owned query string. */
  modelValue?: string;
  /** 中文：调用方提示文字。English: Caller-provided placeholder copy. */
  placeholder?: string;
  /** 中文：局部禁用状态。English: Local disabled state. */
  disabled?: boolean;
  /** 中文：调用方控制的聚焦开关。English: Caller-controlled focus switch. */
  focus?: boolean;
  /** 中文：是否在非空值时显示 clear control。English: Whether to show the clear control for a nonempty value. */
  showClear?: boolean;
  /** 中文：调用方本地化 clear 文字。English: Caller-localized clear copy. */
  clearText?: string;
  /** 中文：是否显示 search action control。English: Whether to show the search action control. */
  showAction?: boolean;
  /** 中文：调用方本地化 action 文字。English: Caller-localized action copy. */
  actionText?: string;
}

/**
 * @lang zh-CN 描述 USearch 的文本、观察与 action 事件；click/confirm 保留 unknown 平台事件，clear 无 payload。
 * @lang en Describes USearch text, observation, and action events; click/confirm preserve unknown platform events and clear has no payload.
 */
export type USearchEmits = {
  /** 中文：标准受控值更新意图。English: Standard controlled-value update intent. */
  'update:modelValue': (value: string) => void;
  /** 中文：未修改字符串输入意图。English: Unmodified string input intent. */
  input: (value: string) => void;
  /** 中文：与 input 相同候选值的 change 意图。English: Change intent carrying the same candidate value as input. */
  change: (value: string) => void;
  /** 中文：原始跨平台聚焦事件。English: Original cross-platform focus event. */
  focus: (event: unknown) => void;
  /** 中文：原始跨平台失焦事件。English: Original cross-platform blur event. */
  blur: (event: unknown) => void;
  /** 中文：原始跨平台确认事件。English: Original cross-platform confirm event. */
  confirm: (event: unknown) => void;
  /** 中文：原始跨平台点击事件。English: Original cross-platform click event. */
  click: (event: unknown) => void;
  /** 中文：携带当前受控 query 的搜索意图。English: Search intent carrying the current controlled query. */
  search: (value: string) => void;
  /** 中文：无 payload 清除意图。English: Clear intent with no payload. */
  clear: () => void;
};

/**
 * @lang zh-CN 表示受控单选或多选项所使用的透明本地键；组件不解释其业务含义。
 * @lang en Represents the transparent local key used by a controlled single- or multi-choice item; components do not interpret its business meaning.
 */
export type UChoiceValue = string | number;

/**
 * @lang zh-CN 描述独立 `UCheckbox` 的既有 change payload；group 模式由 group 直接报告下一成员数组，不产生此 payload。
 * @lang en Describes the existing change payload of an independent `UCheckbox`; group mode reports the next membership array directly from the group and does not emit this payload.
 */
export interface UCheckboxChangeDetail {
  /** 中文：调用方提供的透明本地键。English: Caller-provided transparent local key. */
  value: UChoiceValue;
  /** 中文：本次交互请求的下一选中态。English: Next checked state requested by this interaction. */
  checked: boolean;
}

/**
 * @lang zh-CN 描述 `UCheckbox` 当前受审计的 caller-controlled prop 表面；`checked` 是既有 alias，显式提供时优先于 `modelValue`。
 * @lang en Describes the current audited caller-controlled prop surface of `UCheckbox`; `checked` is the existing alias and takes precedence over `modelValue` when explicitly provided.
 */
export interface UCheckboxProps {
  /** 中文：独立事件或 group 成员关系使用的透明本地键。English: Transparent local key for independent events or group membership. */
  value?: UChoiceValue;
  /** 中文：`value` 缺省时使用的上游熟悉透明键 alias。English: Upstream-familiar transparent-key alias used when `value` is omitted. */
  name?: UChoiceValue;
  /** 中文：调用方可见标签；默认 slot 可以替代其显示内容。English: Caller-visible label; the default slot may replace its displayed content. */
  label?: string;
  /** 中文：既有 HIA 受控 alias；显式提供时优先。English: Existing HIA controlled alias; it takes precedence when explicit. */
  checked?: boolean;
  /** 中文：独立模式的标准布尔受控值。English: Standard boolean controlled value in independent mode. */
  modelValue?: boolean;
  /** 中文：本地不可操作声明；非空字符串和 true 均为禁用。English: Local inactivity declaration; a nonempty string and true both disable interaction. */
  disabled?: string | boolean;
  /** 中文：是否仅阻止 label 区域触发选择。English: Whether to prevent selection from the label area only. */
  labelDisabled?: boolean;
}

/**
 * @lang zh-CN 描述独立 `UCheckbox` 的标准受控更新与既有 change 事件。
 * @lang en Describes the standard controlled update and existing change events of an independent `UCheckbox`.
 */
export type UCheckboxEmits = {
  /** 中文：下一独立布尔值。English: Next independent boolean value. */
  'update:modelValue': (value: boolean) => void;
  /** 中文：透明键与下一布尔值。English: Transparent key and next boolean value. */
  change: (detail: UCheckboxChangeDetail) => void;
};

/**
 * @lang zh-CN 描述 `UCheckboxGroup` 的只读成员集合和局部禁用边界；组件 emit 新数组而不修改传入数组。
 * @lang en Describes the readonly membership collection and local disabled boundary of `UCheckboxGroup`; the component emits a new array rather than mutating the supplied array.
 */
export interface UCheckboxGroupProps {
  /** 中文：调用方拥有的成员集合。English: Caller-owned membership collection. */
  modelValue?: ReadonlyArray<UChoiceValue>;
  /** 中文：是否阻止该子树中 checkbox 的局部交互。English: Whether to prevent local checkbox interaction in this subtree. */
  disabled?: boolean;
  /** 中文：是否仅阻止该子树中 label 区域触发选择。English: Whether to prevent selection from label areas in this subtree only. */
  labelDisabled?: boolean;
  /** 中文：正整数时限制新增成员数量；其他数值或字符串表示不限制。English: Limits added members when it resolves to a positive integer; other numbers or strings mean unlimited. */
  max?: number | string;
}

/**
 * @lang zh-CN 描述 `UCheckboxGroup` 创建的下一成员数组事件；两个事件接收同一新数组。
 * @lang en Describes next-membership-array events created by `UCheckboxGroup`; both events receive the same new array.
 */
export type UCheckboxGroupEmits = {
  /** 中文：下一调用方成员数组。English: Next caller membership array. */
  'update:modelValue': (values: UChoiceValue[]) => void;
  /** 中文：与受控更新相同的下一成员数组。English: The same next membership array as the controlled update. */
  change: (values: UChoiceValue[]) => void;
};

/**
 * @lang zh-CN 描述 `URadio` 当前受审计的本地单选表面；group 内的 selected state 由 `URadioGroup` 控制。
 * @lang en Describes the current audited local single-choice surface of `URadio`; selected state inside a group is controlled by `URadioGroup`.
 */
export interface URadioProps {
  /** 中文：独立事件或 group 比较使用的透明本地键。English: Transparent local key for independent events or group comparison. */
  value?: UChoiceValue;
  /** 中文：`value` 缺省时使用的上游熟悉透明键 alias。English: Upstream-familiar transparent-key alias used when `value` is omitted. */
  name?: UChoiceValue;
  /** 中文：调用方可见标签；默认 slot 可以替代其显示内容。English: Caller-visible label; the default slot may replace its displayed content. */
  label?: string;
  /** 中文：独立模式的受控选中态。English: Controlled selected state in independent mode. */
  checked?: boolean;
  /** 中文：本地不可操作声明；非空字符串和 true 均为禁用。English: Local inactivity declaration; a nonempty string and true both disable interaction. */
  disabled?: string | boolean;
  /** 中文：是否仅阻止 label 区域触发选择。English: Whether to prevent selection from the label area only. */
  labelDisabled?: boolean;
}

/**
 * @lang zh-CN 描述独立 `URadio` 保留的 select/change 透明键事件。
 * @lang en Describes the transparent-key select/change events retained by an independent `URadio`.
 */
export type URadioEmits = {
  /** 中文：既有选择意图。English: Existing selection intent. */
  select: (value: UChoiceValue) => void;
  /** 中文：迁移用 change 意图。English: Migration change intent. */
  change: (value: UChoiceValue) => void;
};

/**
 * @lang zh-CN 描述 `URadioGroup` 的 caller-owned 单个本地键和禁用边界。
 * @lang en Describes the caller-owned single local key and disabled boundary of `URadioGroup`.
 */
export interface URadioGroupProps {
  /** 中文：调用方拥有的当前选中键。English: Caller-owned current selected key. */
  modelValue?: UChoiceValue;
  /** 中文：是否阻止该子树中 radio 的局部交互。English: Whether to prevent local radio interaction in this subtree. */
  disabled?: boolean;
  /** 中文：是否仅阻止该子树中 label 区域触发选择。English: Whether to prevent selection from label areas in this subtree only. */
  labelDisabled?: boolean;
}

/**
 * @lang zh-CN 描述 `URadioGroup` 的单一透明值更新事件。
 * @lang en Describes single-transparent-value update events of `URadioGroup`.
 */
export type URadioGroupEmits = {
  /** 中文：下一调用方选择值。English: Next caller selection value. */
  'update:modelValue': (value: UChoiceValue) => void;
  /** 中文：与受控更新相同的下一选择值。English: The same next selection value as the controlled update. */
  change: (value: UChoiceValue) => void;
};

/**
 * @lang zh-CN 表示 `USwitch` 在原生布尔态与调用方值之间透明映射的有限值域。
 * @lang en Represents the finite value domain transparently mapped by `USwitch` between native boolean state and caller values.
 */
export type USwitchValue = boolean | string | number;

/**
 * @lang zh-CN 描述 `USwitch` 的受控布尔选择表面；loading 只阻止局部切换，不表示异步业务完成。
 * @lang en Describes the controlled boolean-choice surface of `USwitch`; loading only blocks local toggling and does not represent asynchronous business completion.
 */
export interface USwitchProps {
  /** 中文：调用方拥有的当前透明值。English: Caller-owned current transparent value. */
  modelValue?: USwitchValue;
  /** 中文：原生 true 映射到的调用方值。English: Caller value mapped from native true. */
  activeValue?: USwitchValue;
  /** 中文：原生 false 映射到的调用方值。English: Caller value mapped from native false. */
  inactiveValue?: USwitchValue;
  /** 中文：调用方可见标签。English: Caller-visible label. */
  label?: string;
  /** 中文：是否阻止局部切换。English: Whether to prevent local toggling. */
  disabled?: boolean;
  /** 中文：是否以本地 loading guard 阻止切换。English: Whether to prevent toggling with a local loading guard. */
  loading?: boolean;
}

/**
 * @lang zh-CN 描述 `USwitch` 映射后的标准更新与 change 事件。
 * @lang en Describes mapped standard update and change events of `USwitch`.
 */
export type USwitchEmits = {
  /** 中文：由原生布尔结果映射出的下一 caller 值。English: Next caller value mapped from the native boolean result. */
  'update:modelValue': (value: USwitchValue) => void;
  /** 中文：与受控更新相同的映射值。English: The same mapped value as the controlled update. */
  change: (value: USwitchValue) => void;
};

/**
 * @lang zh-CN 为 feedback scope 提供不可伪造的声明级身份；该 symbol 不导出，普通对象不能冒充由工厂创建的 scope。
 * @lang en Gives feedback scopes an unforgeable declaration-level identity; this symbol is not exported, so an ordinary object cannot impersonate a factory-created scope.
 */
declare const U_FEEDBACK_SCOPE_BRAND: unique symbol;

/**
 * @lang zh-CN 描述调用方显式创建、拥有并释放的局部 feedback scope；它不代表全局单例、页面或路由。
 * @lang en Describes a local feedback scope explicitly created, owned, and disposed by the caller; it represents no global singleton, page, or router.
 */
export interface UFeedbackScope {
  /** 中文：仅用于声明级 nominal identity，不存在可写业务数据。English: Declaration-only nominal identity with no writable business data. */
  readonly [U_FEEDBACK_SCOPE_BRAND]: true;
  /** 中文：幂等释放当前 toast/modal host，并永久使本 scope 失效。English: Idempotently releases current toast/modal hosts and permanently invalidates this scope. */
  dispose(): void;
}

/**
 * @lang zh-CN 表示 feedback 命令可公开返回的有限失败原因。
 * @lang en Represents the finite failure reasons publicly returned by a feedback command.
 */
export type UFeedbackRejectionReason =
  | 'invalid-scope'
  | 'host-unavailable'
  | 'scope-disposed'
  | 'stale-request'
  | 'invalid-options';

/**
 * @lang zh-CN 描述同步被当前 scope host 接收的命令；它不证明用户已看到、确认或完成业务。
 * @lang en Describes a command synchronously accepted by the current scoped host; it does not prove that a user saw, confirmed, or completed business work.
 */
export interface UFeedbackAcceptedResult {
  /** 中文：成功判别值。English: Success discriminant. */
  readonly accepted: true;
  /** 中文：scope 内单调请求编号；首次 show 前的幂等 close/clear 可返回 0。English: Scope-monotonic request ID; idempotent close/clear before the first show may return 0. */
  readonly requestId: number;
}

/**
 * @lang zh-CN 描述没有派发或没有完成预期宿主操作的同步命令结果。
 * @lang en Describes a synchronous command result that was not dispatched or did not complete the expected host operation.
 */
export interface UFeedbackRejectedResult {
  /** 中文：失败判别值。English: Failure discriminant. */
  readonly accepted: false;
  /** 中文：不泄漏异常、平台或宿主细节的稳定原因。English: Stable reason that leaks no exception, platform, or host detail. */
  readonly reason: UFeedbackRejectionReason;
}

/**
 * @lang zh-CN 表示所有公开 feedback controller 操作的可判别同步结果。
 * @lang en Represents the discriminated synchronous result of every public feedback-controller operation.
 */
export type UFeedbackCommandResult = UFeedbackAcceptedResult | UFeedbackRejectedResult;

/**
 * @lang zh-CN 表示 toast 可选择的有限视觉语气；它不编码业务结果。
 * @lang en Represents the finite visual tones selectable by a toast; it encodes no business outcome.
 */
export type UToastTone = 'info' | 'success' | 'warning' | 'error';

/**
 * @lang zh-CN 表示 toast 在局部 host 内的有限呈现位置。
 * @lang en Represents the finite presentation positions of a toast inside its local host.
 */
export type UToastPosition = 'top' | 'center' | 'bottom';

/**
 * @lang zh-CN 描述 toast 文字以外的有限呈现字段；该基础类型不接受 callback、URL、路由、请求或业务 payload。
 * @lang en Describes finite toast-presentation fields other than copy; this base type accepts no callback, URL, routing, request, or business payload.
 */
export interface UToastPresentationOptions {
  /** 中文：有限视觉语气。English: Finite visual tone. */
  tone?: UToastTone;
  /** 中文：tone 缺失时使用的迁移 alias。English: Migration alias used when tone is absent. */
  type?: UToastTone;
  /** 中文：是否组合静态 loading indicator；不表示异步任务存在。English: Whether to compose a static loading indicator; it does not imply an asynchronous task. */
  loading?: boolean;
  /** 中文：局部 host 内的有限位置。English: Finite position inside the local host. */
  position?: UToastPosition;
  /** 中文：0 表示保持到显式关闭，正值限制为 runtime 接受的有限毫秒数。English: Zero persists until explicit close; positive values are bounded milliseconds accepted by runtime. */
  duration?: number;
  /** 中文：非空时创建文字关闭 control。English: Creates a textual close control when nonempty. */
  closeText?: string;
}

/**
 * @lang zh-CN 描述 component-ref 与 service 共用的有限 toast 数据；类型层要求 `message` 或迁移 `title` 至少一个存在，runtime 继续拒绝空白文字。
 * @lang en Describes finite toast data shared by component-ref and service entries; the type layer requires either `message` or migration `title`, while runtime still rejects blank copy.
 */
export type UToastOptions = UToastPresentationOptions & (
  | {
      /** 中文：优先的非空可见文字。English: Preferred nonempty visible copy. */
      message: string;
      /** 中文：message 已存在时可保留的迁移文字 alias。English: Migration copy alias that may remain when message exists. */
      title?: string;
    }
  | {
      /** 中文：此分支省略 message，使 title 成为必填迁移文字。English: This branch omits message so title becomes required migration copy. */
      message?: never;
      /** 中文：message 缺失时必填的迁移文字 alias。English: Required migration copy when message is absent. */
      title: string;
    }
);

/**
 * @lang zh-CN 表示 toast 命令可接受的纯文字或有限 options。
 * @lang en Represents plain copy or finite options accepted by a toast command.
 */
export type UToastInput = string | UToastOptions;

/**
 * @lang zh-CN 描述绑定单个显式 scope 的不可变 toast controller。
 * @lang en Describes an immutable toast controller bound to one explicit scope.
 */
export interface UToastController {
  /** 中文：显示普通有限 toast。English: Shows an ordinary finite toast. */
  show(input: UToastInput): UFeedbackCommandResult;
  /** 中文：关闭当前 toast；expected ID 可阻止陈旧路径关闭新请求。English: Closes the current toast; an expected ID can prevent a stale path from closing a newer request. */
  close(expectedRequestId?: number): UFeedbackCommandResult;
  /** 中文：以固定 success tone 显示。English: Shows with the fixed success tone. */
  success(input: UToastInput): UFeedbackCommandResult;
  /** 中文：以固定 error tone 显示。English: Shows with the fixed error tone. */
  error(input: UToastInput): UFeedbackCommandResult;
  /** 中文：以固定 warning tone 显示。English: Shows with the fixed warning tone. */
  warning(input: UToastInput): UFeedbackCommandResult;
  /** 中文：以固定 info tone 显示。English: Shows with the fixed info tone. */
  info(input: UToastInput): UFeedbackCommandResult;
  /** 中文：强制 loading 呈现，并在未指定 duration 时保持到显式关闭。English: Forces loading presentation and persists until explicit close when duration is omitted. */
  loading(input: UToastInput): UFeedbackCommandResult;
}

/**
 * @lang zh-CN 描述 modal 文字主体以外的有限 control 与 loading 呈现字段；它们不执行异步任务或业务回调。
 * @lang en Describes finite control and loading-presentation fields other than modal body copy; they execute no asynchronous task or business callback.
 */
export interface UModalPresentationOptions {
  /** 中文：确认 control 的调用方文字。English: Caller copy for the confirm control. */
  confirmText?: string;
  /** 中文：取消 control 的调用方文字。English: Caller copy for the cancel control. */
  cancelText?: string;
  /** 中文：是否显示有名称的确认 control。English: Whether to show a named confirm control. */
  showConfirmButton?: boolean;
  /** 中文：是否显示有名称的取消 control。English: Whether to show a named cancel control. */
  showCancelButton?: boolean;
  /** 中文：确认后是否保留 modal 并进入局部 loading，等待 clearLoading/close。English: Whether confirmation retains the modal in local loading until clearLoading/close. */
  asyncClose?: boolean;
  /** 中文：初始确认 loading 呈现；不启动任务。English: Initial confirmation-loading presentation; it starts no task. */
  loading?: boolean;
}

/**
 * @lang zh-CN 描述 modal service 可接收的有限纯文字呈现配置；类型层要求 title/content 至少一项存在，runtime 继续拒绝两项均为空白。
 * @lang en Describes finite text-only presentation options accepted by the modal service; the type layer requires title or content, while runtime still rejects two blank values.
 */
export type UModalOptions = UModalPresentationOptions & (
  | {
      /** 中文：主本地化标题。English: Primary localized title. */
      title: string;
      /** 中文：可选本地化正文。English: Optional localized body. */
      content?: string;
    }
  | {
      /** 中文：此分支省略标题。English: This branch omits the title. */
      title?: never;
      /** 中文：标题缺失时必填的本地化正文。English: Required localized body when the title is absent. */
      content: string;
    }
);

/**
 * @lang zh-CN 描述 `confirm` helper 必须提供的双 control 文本配置。
 * @lang en Describes the dual-control copy required by the `confirm` helper.
 */
export type UModalConfirmOptions = UModalOptions & {
  /** 中文：必需的非空确认文字。English: Required nonempty confirmation copy. */
  confirmText: string;
  /** 中文：必需的非空取消文字。English: Required nonempty cancellation copy. */
  cancelText: string;
};

/**
 * @lang zh-CN 描述绑定单个显式 scope 的不可变 modal controller。
 * @lang en Describes an immutable modal controller bound to one explicit scope.
 */
export interface UModalController {
  /** 中文：显示无 control 文字或有限 modal options。English: Shows control-free copy or finite modal options. */
  show(input: string | UModalOptions): UFeedbackCommandResult;
  /** 中文：显示具有调用方双标签的确认 modal。English: Shows a confirmation modal with two caller-supplied labels. */
  confirm(input: UModalConfirmOptions): UFeedbackCommandResult;
  /** 中文：关闭当前 modal，并可用 expected ID 防陈旧关闭。English: Closes the current modal with an optional expected-ID stale guard. */
  close(expectedRequestId?: number): UFeedbackCommandResult;
  /** 中文：清除当前确认 loading 而不结束请求。English: Clears current confirmation loading without ending the request. */
  clearLoading(expectedRequestId?: number): UFeedbackCommandResult;
}

/**
 * @lang zh-CN 创建独立、无默认全局注册的 feedback scope。
 * @lang en Creates an independent feedback scope with no default global registration.
 */
export declare function createUFeedbackScope(): Readonly<UFeedbackScope>;

/**
 * @lang zh-CN 创建绑定必填显式 scope 的 toast controller；缺少 scope 在类型层即失败。
 * @lang en Creates a toast controller bound to a required explicit scope; omitting the scope fails at the type layer.
 */
export declare function useToast(scope: UFeedbackScope): Readonly<UToastController>;

/**
 * @lang zh-CN 创建绑定必填显式 scope 的 modal controller；它不发现页面或执行 callback。
 * @lang en Creates a modal controller bound to a required explicit scope; it discovers no page and executes no callback.
 */
export declare function useModal(scope: UFeedbackScope): Readonly<UModalController>;

/**
 * @lang zh-CN 表示 popup 的有限关闭来源。
 * @lang en Represents the finite close sources of a popup.
 */
export type UPopupCloseReason = 'mask' | 'control' | 'programmatic';

/**
 * @lang zh-CN 描述 `UPopup` 的 caller-controlled 可见性、局部 placement 与文字 control。
 * @lang en Describes caller-controlled visibility, local placement, and textual control of `UPopup`.
 */
export interface UPopupProps {
  /** 中文：显式 HIA 可见性，存在时优先于两个迁移入口。English: Explicit HIA visibility, taking precedence over both migration entries when supplied. */
  visible?: boolean;
  /** 中文：受控迁移可见值。English: Controlled migration visibility value. */
  modelValue?: boolean;
  /** 中文：第二受控迁移可见别名。English: Second controlled migration visibility alias. */
  show?: boolean;
  /** 中文：有限局部 panel placement。English: Finite local panel placement. */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  /** 中文：可选调用方标题。English: Optional caller title. */
  title?: string;
  /** 中文：非空时创建显式关闭 control。English: Creates an explicit close control when nonempty. */
  closeText?: string;
  /** 中文：是否允许遮罩产生关闭意图。English: Whether the mask may produce close intent. */
  maskClosable?: boolean;
}

/**
 * @lang zh-CN 描述 popup 的有序受控更新、打开转换与带原因关闭事件。
 * @lang en Describes ordered controlled updates, open transitions, and reasoned close events of a popup.
 */
export type UPopupEmits = {
  /** 中文：请求调用方把受控可见值改为 false。English: Requests the caller to change controlled visibility to false. */
  'update:modelValue': (value: boolean) => void;
  /** 中文：仅报告挂载后的 false→true 转换。English: Reports only a post-mount false-to-true transition. */
  open: () => void;
  /** 中文：保留原始事件并追加有限关闭原因。English: Preserves the raw event and appends a finite close reason. */
  close: (event: unknown, reason: UPopupCloseReason) => void;
};

/**
 * @lang zh-CN 描述 `UPopup` 通过组件 ref 暴露的局部关闭意图。
 * @lang en Describes the local close intent exposed by `UPopup` through a component ref.
 */
export interface UPopupExposed {
  /** 中文：在当前可见时报告 programmatic 关闭，不直接改写 prop。English: Reports a programmatic close while currently visible without mutating a prop. */
  close(): void;
}

/**
 * @lang zh-CN 描述 caller-controlled 局部遮罩的有限外观与交互资格。
 * @lang en Describes the finite appearance and interaction eligibility of a caller-controlled local mask.
 */
export interface UMaskProps {
  /** 中文：显式可见性，存在时优先于 show。English: Explicit visibility, taking precedence over show when supplied. */
  visible?: boolean;
  /** 中文：迁移可见别名。English: Migration visibility alias. */
  show?: boolean;
  /** 中文：runtime 会收束的遮罩透明度。English: Mask opacity constrained by runtime. */
  opacity?: number;
  /** 中文：runtime 会收束的局部层级。English: Local layer constrained by runtime. */
  layer?: number;
  /** 中文：是否允许报告 click intent。English: Whether click intent may be reported. */
  clickable?: boolean;
}

/**
 * @lang zh-CN 描述 mask 唯一的原始点击意图事件。
 * @lang en Describes the mask's sole raw click-intent event.
 */
export type UMaskEmits = {
  /** 中文：调用方显式允许时的原始遮罩事件。English: Raw mask event when explicitly enabled by the caller. */
  click: (event: unknown) => void;
};

/**
 * @lang zh-CN 表示 transition 支持的有限 CSS 呈现模式。
 * @lang en Represents finite CSS presentation modes supported by a transition.
 */
export type UTransitionMode = 'fade' | 'slide-up' | 'slide-down' | 'zoom';

/**
 * @lang zh-CN 描述无 timer、测量或全局生命周期的受控 CSS transition wrapper。
 * @lang en Describes a controlled CSS-transition wrapper with no timer, measurement, or global lifecycle.
 */
export interface UTransitionProps {
  /** 中文：显式可见性，存在时优先于 show。English: Explicit visibility, taking precedence over show when supplied. */
  visible?: boolean;
  /** 中文：受控迁移可见别名。English: Controlled migration visibility alias. */
  show?: boolean;
  /** 中文：有限 CSS 呈现模式。English: Finite CSS presentation mode. */
  mode?: UTransitionMode;
  /** 中文：runtime 收束为 0–1000ms 的持续时间。English: Duration constrained by runtime to 0–1000ms. */
  duration?: number;
}

/**
 * @lang zh-CN 描述 action-sheet 可读取的有限声明式条目。
 * @lang en Describes a finite declarative item readable by an action sheet.
 */
export interface UActionSheetItem {
  /** 中文：首选可见标签。English: Preferred visible label. */
  label?: string;
  /** 中文：label 的有限迁移别名。English: Finite migration alias for label. */
  text?: string;
  /** 中文：原样交还调用方的透明值。English: Transparent value returned unchanged to the caller. */
  value?: unknown;
  /** 中文：是否阻止该项产生选择事件。English: Whether the item is prevented from producing selection events. */
  disabled?: boolean;
}

/**
 * @lang zh-CN 描述 action-sheet 选择事件的稳定结构化 payload。
 * @lang en Describes the stable structured payload of an action-sheet selection event.
 */
export interface UActionSheetSelectDetail {
  /** 中文：条目的透明调用方值。English: Transparent caller value of the item. */
  value: unknown;
  /** 中文：规范化可见列表中的零基索引。English: Zero-based index in the normalized visible list. */
  index: number;
}

/**
 * @lang zh-CN 表示 action-sheet 的有限关闭来源。
 * @lang en Represents finite close sources of an action sheet.
 */
export type UActionSheetCloseReason = 'mask' | 'cancel' | 'programmatic';

/**
 * @lang zh-CN 描述 caller-controlled action-sheet 的有限文字、条目与遮罩许可。
 * @lang en Describes finite copy, items, and mask permission of a caller-controlled action sheet.
 */
export interface UActionSheetProps {
  /** 中文：显式可见性，存在时优先于 modelValue。English: Explicit visibility, taking precedence over modelValue when supplied. */
  visible?: boolean;
  /** 中文：受控迁移可见值。English: Controlled migration visibility value. */
  modelValue?: boolean;
  /** 中文：可选调用方标题。English: Optional caller title. */
  title?: string;
  /** 中文：有限字符串或结构化 action 条目。English: Finite string or structured action items. */
  items?: ReadonlyArray<string | UActionSheetItem>;
  /** 中文：非空时创建取消 control。English: Creates a cancel control when nonempty. */
  cancelText?: string;
  /** 中文：是否允许遮罩请求关闭。English: Whether the mask may request closure. */
  maskClosable?: boolean;
}

/**
 * @lang zh-CN 描述 action-sheet 的有序选择、迁移点击和带原因关闭事件。
 * @lang en Describes ordered selection, migration click, and reasoned close events of an action sheet.
 */
export type UActionSheetEmits = {
  /** 中文：请求受控可见值变为 false。English: Requests controlled visibility to become false. */
  'update:modelValue': (value: boolean) => void;
  /** 中文：保留 raw event 并追加有限关闭来源。English: Preserves the raw event and appends a finite close source. */
  close: (event: unknown, reason: UActionSheetCloseReason) => void;
  /** 中文：首先发出的结构化透明选择值。English: Structured transparent selection value emitted first. */
  select: (detail: UActionSheetSelectDetail) => void;
  /** 中文：随后发出的上游熟悉可见项索引。English: Upstream-familiar visible-item index emitted afterward. */
  click: (index: number) => void;
};

/**
 * @lang zh-CN 描述 action-sheet 组件 ref 的有限 programmatic close。
 * @lang en Describes finite programmatic close on an action-sheet component ref.
 */
export interface UActionSheetExposed {
  /** 中文：只报告受控关闭意图，不执行条目或路由。English: Reports controlled close intent only and executes no item or routing. */
  close(): void;
}

/**
 * @lang zh-CN 描述 service 触发 modal 确认时追加的不可执行 metadata。
 * @lang en Describes non-executable metadata appended when a service-triggered modal is confirmed.
 */
export interface UModalConfirmMetadata {
  /** 中文：固定 service 来源。English: Fixed service source. */
  readonly source: 'service';
  /** 中文：当前 scope request ID。English: Current scoped request ID. */
  readonly requestId: number;
}

/**
 * @lang zh-CN 描述 modal 取消来源；service 事件包含 request ID，受控 mask 事件不包含。
 * @lang en Describes modal cancellation sources; service events include a request ID, while a controlled mask event does not.
 */
export type UModalCancelMetadata =
  | Readonly<{ source: 'service'; requestId: number; reason: 'cancel' | 'mask' }>
  | Readonly<{ source: 'controlled'; reason: 'mask' }>;

/**
 * @lang zh-CN 描述 caller-controlled modal 与显式 opt-in service host 的完整 props。
 * @lang en Describes complete props of a caller-controlled modal and explicit opt-in service host.
 */
export interface UModalProps {
  /** 中文：显式可见性，存在时优先于 modelValue。English: Explicit visibility, taking precedence over modelValue when supplied. */
  visible?: boolean;
  /** 中文：受控迁移可见值。English: Controlled migration visibility value. */
  modelValue?: boolean;
  /** 中文：调用方本地化标题。English: Caller-localized title. */
  title?: string;
  /** 中文：default slot 缺失时的纯文字正文。English: Plain-text body used when a default slot is absent. */
  content?: string;
  /** 中文：是否呈现非空标题。English: Whether to present a nonempty title. */
  showTitle?: boolean;
  /** 中文：确认 control 文字。English: Confirmation-control copy. */
  confirmText?: string;
  /** 中文：取消 control 文字。English: Cancellation-control copy. */
  cancelText?: string;
  /** 中文：显式抑制或允许有名称的确认 control。English: Explicitly suppresses or permits a named confirmation control. */
  showConfirmButton?: boolean;
  /** 中文：显式抑制或允许有名称的取消 control。English: Explicitly suppresses or permits a named cancellation control. */
  showCancelButton?: boolean;
  /** 中文：确认时进入局部 loading，等待 clearLoading/关闭。English: Enters local loading on confirmation until clearLoading/closure. */
  asyncClose?: boolean;
  /** 中文：是否允许 mask 产生取消意图；保留上游熟悉拼写。English: Whether the mask may produce cancellation intent; retains familiar upstream spelling. */
  maskCloseAble?: boolean;
  /** 中文：由 createUFeedbackScope 创建的显式局部 scope。English: Explicit local scope created by createUFeedbackScope. */
  serviceScope?: UFeedbackScope | null;
  /** 中文：是否把当前实例注册为该 scope 的 modal host。English: Whether to register this instance as the modal host of that scope. */
  serviceHost?: boolean;
}

/**
 * @lang zh-CN 描述 modal 的受控写回与确认/取消 intent；service metadata 只作为可选第二参数追加。
 * @lang en Describes controlled writeback and confirm/cancel intent of a modal; service metadata is appended only as an optional second argument.
 */
export type UModalEmits = {
  /** 中文：请求受控可见值变为 false。English: Requests controlled visibility to become false. */
  'update:modelValue': (value: boolean) => void;
  /** 中文：确认原始事件与可选 service metadata。English: Confirmation raw event and optional service metadata. */
  confirm: (event: unknown, metadata?: UModalConfirmMetadata) => void;
  /** 中文：取消原始事件与可选有限来源 metadata。English: Cancellation raw event and optional finite source metadata. */
  cancel: (event: unknown, metadata?: UModalCancelMetadata) => void;
};

/**
 * @lang zh-CN 描述 modal ref 唯一公开的局部 loading 清理能力。
 * @lang en Describes the sole public local-loading cleanup capability of a modal ref.
 */
export interface UModalExposed {
  /** 中文：清除当前确认 loading，不关闭 modal 或完成任务。English: Clears current confirmation loading without closing the modal or completing a task. */
  clearLoading(): void;
}

/**
 * @lang zh-CN 描述 toast control 关闭命令式 session 时追加的有限 metadata。
 * @lang en Describes finite metadata appended when a toast control closes an imperative session.
 */
export interface UToastCloseMetadata {
  /** 中文：命令来自 component ref 或显式 service。English: Command originated from a component ref or explicit service. */
  readonly source: 'component-ref' | 'service';
  /** 中文：对应来源内的 request ID。English: Request ID within the corresponding source. */
  readonly requestId: number;
  /** 中文：当前唯一可见 control 关闭原因。English: Sole current visible-control close reason. */
  readonly reason: 'control';
}

/**
 * @lang zh-CN 描述 caller-controlled toast fallback、component-ref 默认值与显式 service host。
 * @lang en Describes caller-controlled toast fallback, component-ref defaults, and an explicit service host.
 */
export interface UToastProps {
  /** 中文：受控 fallback 是否可见。English: Whether the controlled fallback is visible. */
  visible?: boolean;
  /** 中文：受控 fallback 可见文字。English: Visible copy of the controlled fallback. */
  message?: string;
  /** 中文：是否组合静态 loading indicator。English: Whether to compose a static loading indicator. */
  loading?: boolean;
  /** 中文：优先有限视觉语气。English: Preferred finite visual tone. */
  tone?: UToastTone;
  /** 中文：tone 缺失时的迁移 alias。English: Migration alias used when tone is absent. */
  type?: UToastTone;
  /** 中文：局部 host 内有限位置。English: Finite position inside the local host. */
  position?: UToastPosition;
  /** 中文：component-ref show 的默认生命周期披露；受控 fallback 不自动关闭。English: Default lifecycle disclosure for component-ref show; controlled fallback does not auto-close. */
  duration?: number;
  /** 中文：非空时创建文字关闭 control。English: Creates a textual close control when nonempty. */
  closeText?: string;
  /** 中文：由 createUFeedbackScope 创建的显式局部 scope。English: Explicit local scope created by createUFeedbackScope. */
  serviceScope?: UFeedbackScope | null;
  /** 中文：是否把当前实例注册为该 scope 的 toast host。English: Whether to register this instance as the toast host of that scope. */
  serviceHost?: boolean;
}

/**
 * @lang zh-CN 描述 toast 唯一公开事件；受控路径仅有 raw event，命令式路径追加 metadata。
 * @lang en Describes the sole public toast event; the controlled path has only a raw event, while the imperative path appends metadata.
 */
export type UToastEmits = {
  /** 中文：有名称 control 的关闭 intent。English: Close intent from a named control. */
  close: (event: unknown, metadata?: UToastCloseMetadata) => void;
};

/**
 * @lang zh-CN 描述 mounted toast ref 的有限 imperative API；它与 scoped service controller 分层。
 * @lang en Describes the finite imperative API of a mounted toast ref; it remains layered separately from the scoped service controller.
 */
export interface UToastExposed {
  /** 中文：显示有限文字/options；非法输入在 runtime 安全 no-op。English: Shows finite copy/options; invalid runtime input is a safe no-op. */
  show(options: UToastInput): void;
  /** 中文：幂等关闭当前命令式 session。English: Idempotently closes the current imperative session. */
  close(): void;
  /** 中文：close 的同一幂等 alias。English: Same idempotent alias as close. */
  hide(): void;
}

/**
 * @lang zh-CN 描述纯展示、非路由 navbar 的 caller-owned 文本和可用性。
 * @lang en Describes caller-owned copy and availability of a presentation-only, non-routing navbar.
 */
export interface UNavbarProps {
  /** 中文：是否呈现局部导航结构。English: Whether to present the local navigation structure. */
  visible?: boolean;
  /** 中文：调用方标题。English: Caller title. */
  title?: string;
  /** 中文：优先左侧 control 文字。English: Preferred left-control copy. */
  leftText?: string;
  /** 中文：leftText 为空时的迁移 alias。English: Migration alias used when leftText is empty. */
  backText?: string;
  /** 中文：是否允许内建左侧文字 control；它不执行返回。English: Whether to allow the built-in left text control; it performs no back navigation. */
  isBack?: boolean;
  /** 中文：右侧 control 文字。English: Right-control copy. */
  rightText?: string;
  /** 中文：是否阻止两个内建 control 的点击 intent。English: Whether to block click intent from both built-in controls. */
  disabled?: boolean;
}

/**
 * @lang zh-CN 描述 navbar 左右两侧的原始、无路由点击意图。
 * @lang en Describes raw, non-routing click intents from both navbar sides.
 */
export type UNavbarEmits = {
  /** 中文：内建左侧 control 原始事件。English: Raw event from the built-in left control. */
  'left-click': (event: unknown) => void;
  /** 中文：内建右侧 control 原始事件。English: Raw event from the built-in right control. */
  'right-click': (event: unknown) => void;
};

/**
 * @lang zh-CN 描述 `UTabbar` 的有限、非路由 tab 项；没有页面或原生 tabBar 生命周期语义。
 * @lang en Describes a finite, non-routing `UTabbar` item with no page or native-tab-bar lifecycle semantics.
 */
export interface UTabbarItem {
  /** 中文：可见标签。English: Visible label. */
  label?: string;
  /** 中文：`label` 的有限文本 alias。English: Finite text alias for `label`. */
  text?: string;
  /** 中文：本地选中键；未提供时回退到 label/index。English: Local selected key; falls back to label/index when absent. */
  value?: UChoiceValue;
  /** 中文：是否阻止该本地项的选择。English: Whether to prevent selection of this local item. */
  disabled?: boolean;
}

/**
 * @lang zh-CN 描述 `UTabbar` 的局部可见性和受控本地选择；它不操作 router 或 native tabBar。
 * @lang en Describes local visibility and controlled local selection of `UTabbar`; it manipulates neither router nor native tab bar.
 */
export interface UTabbarProps {
  /** 中文：显式 HIA 可见性，存在时优先于 show。English: Explicit HIA visibility, taking precedence over show when supplied. */
  visible?: boolean;
  /** 中文：本地输出的迁移可见性开关。English: Migration visibility control for local output. */
  show?: boolean;
  /** 中文：调用方拥有的局部选中值。English: Caller-owned local selected value. */
  modelValue?: UChoiceValue;
  /** 中文：优先有限静态 tab 项。English: Preferred finite static tab items. */
  items?: ReadonlyArray<string | UTabbarItem>;
  /** 中文：items 为空时使用的有限迁移列表。English: Finite migration list used when items is empty. */
  list?: ReadonlyArray<string | UTabbarItem>;
}

/**
 * @lang zh-CN 描述 tabbar 严格 update→change 的透明局部值事件。
 * @lang en Describes transparent local-value events of a tabbar in strict update-to-change order.
 */
export type UTabbarEmits = {
  /** 中文：下一 caller-owned 本地值。English: Next caller-owned local value. */
  'update:modelValue': (value: UChoiceValue) => void;
  /** 中文：与受控更新相同的下一值。English: Same next value as the controlled update. */
  change: (value: UChoiceValue) => void;
};

/**
 * @lang zh-CN 描述 tabs 可读取的有限、非路由条目。
 * @lang en Describes a finite non-routing item readable by tabs.
 */
export interface UTabsItem extends UTabbarItem {
  /** 中文：label/text 为空时使用的熟悉名称 alias。English: Familiar name alias used when label/text is empty. */
  name?: string;
}

/**
 * @lang zh-CN 描述受控 tabs 的首选/迁移列表与 current 选择入口。
 * @lang en Describes preferred/migration lists and the current-selection entry of controlled tabs.
 */
export interface UTabsProps {
  /** 中文：current 未提供时使用的受控选中值。English: Controlled selected value used when current is absent. */
  modelValue?: UChoiceValue;
  /** 中文：优先有限静态 tabs。English: Preferred finite static tabs. */
  items?: ReadonlyArray<string | UTabsItem>;
  /** 中文：items 为空时使用的迁移列表。English: Migration list used when items is empty. */
  list?: ReadonlyArray<string | UTabsItem>;
  /** 中文：迁移索引或透明标识值；存在时优先决定活动项。English: Migration index or transparent identity value; when supplied, it determines the active item first. */
  current?: UChoiceValue;
}

/**
 * @lang zh-CN 描述 tabs 严格 update→change 的透明局部值事件。
 * @lang en Describes transparent local-value events of tabs in strict update-to-change order.
 */
export type UTabsEmits = UTabbarEmits;

/**
 * @lang zh-CN 描述 tabs ref 的有限、实例局部选择命令。
 * @lang en Describes the finite instance-local selection command of a tabs ref.
 */
export interface UTabsExposed {
  /** 中文：按有效数字索引或严格字符串值请求选择；无效/禁用/当前项无事件。English: Requests selection by a valid numeric index or strict string value; invalid, disabled, or current items emit nothing. */
  clickTab(candidate: UChoiceValue): void;
}

/**
 * @lang zh-CN 描述 `UNoticeBar` 的 caller-controlled 非滚动横幅表面。
 * @lang en Describes the caller-controlled non-scrolling banner surface of `UNoticeBar`.
 */
export interface UNoticeBarProps {
  /** 中文：显式 HIA 可见性，存在时优先于 show。English: Explicit HIA visibility, taking precedence over show when supplied. */
  visible?: boolean;
  /** 中文：本地输出的迁移可见性开关。English: Migration visibility control for local output. */
  show?: boolean;
  /** 中文：list 为空时使用的调用方正文。English: Caller body copy used when list is empty. */
  text?: string;
  /** 中文：调用方拥有且不会自动轮播的有限文字列表。English: Caller-owned finite copy list that is never auto-rotated. */
  list?: ReadonlyArray<string | number>;
  /** 中文：当前列表索引或数字字符串；runtime 对无效值回退 0。English: Current list index or numeric string; runtime falls back to 0 for invalid values. */
  current?: UChoiceValue;
  /** 中文：有限展示 tone。English: Finite presentation tone. */
  tone?: UToastTone;
  /** 中文：非空时显示 close control。English: Shows a close control when nonempty. */
  closeText?: string;
}

/**
 * @lang zh-CN 描述 notice-bar 正文点击的稳定索引与无写回关闭 intent。
 * @lang en Describes stable-index body clicks and non-writeback close intent of a notice bar.
 */
export type UNoticeBarEmits = {
  /** 中文：原始正文点击事件与当前投影索引。English: Raw body-click event and current projected index. */
  click: (event: unknown, index: number) => void;
  /** 中文：原始关闭 control 事件。English: Raw close-control event. */
  close: (event: unknown) => void;
};

/**
 * @lang zh-CN 描述 `UPicker` 可读取的 option 结构；额外字段保持调用方拥有，并且 `rangeKey` 只读取一个浅层自有字段。
 * @lang en Describes an option shape readable by `UPicker`; extra fields remain caller-owned, and `rangeKey` reads one shallow own field only.
 */
export interface UPickerOption {
  /** 中文：默认可见文字。English: Default visible copy. */
  label?: string | number;
  /** 中文：透明本地值。English: Transparent local value. */
  value?: UChoiceValue;
  /** 中文：是否阻止选择该 option。English: Whether selection of this option is prevented. */
  disabled?: boolean;
  /** 中文：供浅层 `rangeKey` 或调用方元数据使用的透明字段。English: Transparent field used by a shallow `rangeKey` or caller metadata. */
  [field: string]: unknown;
}

/**
 * @lang zh-CN 表示 picker 列中的原始标量或调用方 option 记录。
 * @lang en Represents a raw scalar or caller option record in a picker column.
 */
export type UPickerEntry = UChoiceValue | UPickerOption;

/**
 * @lang zh-CN 表示 `UPicker` 的单列标量或多列数组受控值。
 * @lang en Represents the controlled scalar value of a single-column `UPicker` or the array value of a multi-column picker.
 */
export type UPickerModelValue = UChoiceValue | ReadonlyArray<UChoiceValue>;

/**
 * @lang zh-CN 描述 picker 取消时的不可变列快照；未解析列明确使用 null 与 -1，顶层 value 保留 caller 当前值。
 * @lang en Describes an immutable per-column snapshot on picker cancellation; unresolved columns explicitly use null and -1, while the top-level value preserves the caller's current value.
 */
export interface UPickerCancelDetail {
  /** 中文：单列标量或多列值数组；取消时保留调用方当前受控值。English: Single-column scalar or multi-column value array; cancellation preserves the caller's current controlled value. */
  readonly value: UPickerModelValue;
  /** 中文：逐列透明值；未解析列为 null。English: Transparent values by column, with null for an unresolved column. */
  readonly values: ReadonlyArray<UChoiceValue | null>;
  /** 中文：逐列零基索引；未解析列为 -1。English: Zero-based indexes by column, with -1 for an unresolved column. */
  readonly indexes: ReadonlyArray<number>;
  /** 中文：逐列原始 caller option；未解析列为 null。English: Raw caller options by column, with null for an unresolved column. */
  readonly options: ReadonlyArray<UPickerEntry | null>;
}

/**
 * @lang zh-CN 描述 picker 仅在全部列均解析为 enabled option 后产生的不可变确定快照。
 * @lang en Describes the immutable picker confirmation snapshot produced only after every column resolves to an enabled option.
 */
export interface UPickerConfirmDetail {
  /** 中文：已确定的单列标量或多列值数组。English: Confirmed single-column scalar or multi-column value array. */
  readonly value: UPickerModelValue;
  /** 中文：每列均已解析的透明值。English: Resolved transparent value for every column. */
  readonly values: ReadonlyArray<UChoiceValue>;
  /** 中文：每列均有效的零基 option 索引。English: Valid zero-based option index for every column. */
  readonly indexes: ReadonlyArray<number>;
  /** 中文：每列均已解析的原始 caller option。English: Resolved raw caller option for every column. */
  readonly options: ReadonlyArray<UPickerEntry>;
}

/**
 * @lang zh-CN 描述一次 picker 列草稿变化及其完整不可变选择快照。
 * @lang en Describes one picker-column draft change and its complete immutable selection snapshot.
 */
export interface UPickerColumnChangeDetail {
  /** 中文：变化列的零基索引。English: Zero-based index of the changed column. */
  readonly column: number;
  /** 中文：该列中 option 的零基索引。English: Zero-based index of the option within that column. */
  readonly index: number;
  /** 中文：变化 option 的透明值。English: Transparent value of the changed option. */
  readonly value: UChoiceValue;
  /** 中文：变化 option 的原始 caller 输入。English: Raw caller input of the changed option. */
  readonly option: UPickerEntry;
  /** 中文：逐列透明值；未解析列为 null。English: Transparent values by column, with null for an unresolved column. */
  readonly values: ReadonlyArray<UChoiceValue | null>;
  /** 中文：逐列零基索引；未解析列为 -1。English: Zero-based indexes by column, with -1 for an unresolved column. */
  readonly indexes: ReadonlyArray<number>;
  /** 中文：逐列原始 caller option；未解析列为 null。English: Raw caller options by column, with null for an unresolved column. */
  readonly options: ReadonlyArray<UPickerEntry | null>;
}

/**
 * @lang zh-CN 描述 `UPicker` 的有限单列/多列受控草稿与确定/取消表面；它不绑定 popup、地区、时间或远端数据。
 * @lang en Describes the finite single-/multi-column controlled draft and confirm/cancel surface of `UPicker`; it binds to no popup, region, time, or remote data.
 */
export interface UPickerProps {
  /** 中文：调用方拥有的已确认单列或多列值。English: Caller-owned confirmed single- or multi-column value. */
  modelValue?: UPickerModelValue;
  /** 中文：有限单列或完整嵌套多列；混合嵌套形状在 runtime 失败关闭。English: Finite single column or fully nested multiple columns; mixed nesting fails closed at runtime. */
  columns?: ReadonlyArray<UPickerEntry> | ReadonlyArray<ReadonlyArray<UPickerEntry>>;
  /** 中文：`columns` 为空时使用的单列迁移 alias。English: Single-column migration alias used when `columns` is empty. */
  range?: ReadonlyArray<UPickerEntry>;
  /** 中文：仅用于读取 option 一个浅层自有显示字段的键。English: Key used only to read one shallow own display field from an option. */
  rangeKey?: string;
  /** 中文：列更新后是否尝试保留仍完整有效的最近确认值。English: Whether to try preserving the latest fully valid confirmed value after columns change. */
  preserveSelection?: boolean;
  /** 中文：本地标题。English: Local title. */
  title?: string;
  /** 中文：调用方提供的确认文字。English: Caller-provided confirm copy. */
  confirmText?: string;
  /** 中文：调用方提供的取消文字。English: Caller-provided cancel copy. */
  cancelText?: string;
  /** 中文：是否阻止本地 option/action 操作。English: Whether to prevent local option/action interaction. */
  disabled?: boolean;
}

/**
 * @lang zh-CN 描述 `UPicker` 的草稿变化、确定、取消与受控写回事件。
 * @lang en Describes draft-change, confirm, cancel, and controlled-writeback events of `UPicker`.
 */
export type UPickerEmits = {
  /** 中文：确定后产生的单列标量或多列数组写回意图。English: Single-column scalar or multi-column array writeback intent produced after confirmation. */
  'update:modelValue': (value: UPickerModelValue) => void;
  /** 中文：一次列草稿变化的完整快照。English: Complete snapshot of one column-draft change. */
  columnchange: (detail: UPickerColumnChangeDetail) => void;
  /** 中文：确定后的不可变选择快照。English: Immutable selection snapshot after confirmation. */
  confirm: (detail: UPickerConfirmDetail) => void;
  /** 中文：恢复 caller 值后的不可变取消快照。English: Immutable cancellation snapshot after restoring the caller value. */
  cancel: (detail: UPickerCancelDetail) => void;
};

/**
 * @lang zh-CN 描述 `UCalendar` 对单月 Gregorian 日期字段的受控输入；所有字符串在 runtime 按 `YYYY-MM-DD` 校验。
 * @lang en Describes controlled inputs of `UCalendar` for single-month Gregorian date fields; every string is validated as `YYYY-MM-DD` at runtime.
 */
export interface UCalendarProps {
  /** 中文：调用方拥有的当前选中日期。English: Caller-owned currently selected date. */
  modelValue?: string;
  /** 中文：调用方拥有的当前视图月份锚点。English: Caller-owned current view-month anchor. */
  viewDate?: string;
  /** 中文：可选择的最小日期边界。English: Minimum selectable-date bound. */
  minDate?: string;
  /** 中文：可选择的最大日期边界。English: Maximum selectable-date bound. */
  maxDate?: string;
  /** 中文：调用方声明的不可选择日期集合。English: Caller-declared set of unselectable dates. */
  disabledDates?: ReadonlyArray<string>;
  /** 中文：是否阻止日期选择但仍允许月份浏览。English: Whether to prevent date selection while retaining month navigation. */
  readonly?: boolean;
  /** 中文：可选的本地“今天”呈现日期。English: Optional local presentation date for “today”. */
  today?: string;
  /** 中文：恰好七项时覆盖 locale 星期文字。English: Overrides locale weekday copy when exactly seven entries are supplied. */
  weekLabels?: ReadonlyArray<string>;
}

/**
 * @lang zh-CN 描述一次合法 Gregorian 日期选择的冻结字段结果。
 * @lang en Describes the frozen field result of one valid Gregorian date selection.
 */
export interface UCalendarChangeDetail {
  /** 中文：规范 `YYYY-MM-DD` 日期。English: Canonical `YYYY-MM-DD` date. */
  readonly value: string;
  /** 中文：完整 Gregorian 年份。English: Full Gregorian year. */
  readonly year: number;
  /** 中文：一基 Gregorian 月份。English: One-based Gregorian month. */
  readonly month: number;
  /** 中文：一基月内日期。English: One-based day of month. */
  readonly day: number;
}

/**
 * @lang zh-CN 描述 `UCalendar` 的日期选择与独立视图月份事件。
 * @lang en Describes date-selection and independent view-month events of `UCalendar`.
 */
export type UCalendarEmits = {
  /** 中文：下一选中日期。English: Next selected date. */
  'update:modelValue': (value: string) => void;
  /** 中文：与 model 更新相同的旧版输入日期。English: Legacy input date equal to the model update. */
  input: (value: string) => void;
  /** 中文：结构化 Gregorian 日期字段。English: Structured Gregorian date fields. */
  change: (detail: UCalendarChangeDetail) => void;
  /** 中文：与 model 更新相同的旧版选择日期。English: Legacy selected date equal to the model update. */
  select: (value: string) => void;
  /** 中文：下一视图月份的一号日期锚点。English: First-day date anchor of the next view month. */
  'update:viewDate': (value: string) => void;
};

/**
 * @lang zh-CN 描述 `USelect` 可读取的 option；额外元数据只作为原始 option 随确认/取消快照返回。
 * @lang en Describes an option readable by `USelect`; extra metadata is returned only as the raw option in confirm/cancel snapshots.
 */
export interface USelectOption {
  /** 中文：可见文字。English: Visible copy. */
  label?: string | number;
  /** 中文：透明本地值。English: Transparent local value. */
  value?: UChoiceValue;
  /** 中文：是否阻止选择该 option。English: Whether selection of this option is prevented. */
  disabled?: boolean;
  /** 中文：随原始 option 保留的调用方元数据。English: Caller metadata retained with the raw option. */
  [field: string]: unknown;
}

/**
 * @lang zh-CN 表示 select 集合中的原始标量或调用方 option 记录。
 * @lang en Represents a raw scalar or caller option record in a select collection.
 */
export type USelectEntry = UChoiceValue | USelectOption;

/**
 * @lang zh-CN 描述 `USelect` 显式确定后的冻结快照；只有已解析 enabled option 才会产生该事件。
 * @lang en Describes the frozen snapshot of `USelect` after explicit confirmation; this event is produced only for a resolved enabled option.
 */
export interface USelectConfirmResult {
  /** 中文：已解析 option 的透明值。English: Transparent value of the resolved option. */
  readonly value: UChoiceValue;
  /** 中文：已解析 option 的零基索引。English: Zero-based index of the resolved option. */
  readonly index: number;
  /** 中文：已解析的原始 caller option。English: Resolved raw caller option. */
  readonly option: USelectEntry;
}

/**
 * @lang zh-CN 描述 `USelect` 取消恢复后的冻结快照；未匹配 caller 值保留 value，同时 index 为 -1、option 为 null。
 * @lang en Describes the frozen snapshot of `USelect` after cancellation restore; an unmatched caller value is retained while index is -1 and option is null.
 */
export interface USelectCancelResult {
  /** 中文：恢复的透明 caller 值；没有合法值时为 null。English: Restored transparent caller value, or null when no valid value exists. */
  readonly value: UChoiceValue | null;
  /** 中文：匹配 option 的零基索引；未匹配时为 -1。English: Zero-based index of the matching option, or -1 when unmatched. */
  readonly index: number;
  /** 中文：匹配的原始 caller option；未匹配时为 null。English: Matching raw caller option, or null when unmatched. */
  readonly option: USelectEntry | null;
}

/**
 * @lang zh-CN 描述 `USelect` 的有限 inline 单选和显式确定模式输入。
 * @lang en Describes finite inline single-selection and explicit-confirmation inputs of `USelect`.
 */
export interface USelectProps {
  /** 中文：调用方拥有的当前透明值。English: Caller-owned current transparent value. */
  modelValue?: UChoiceValue;
  /** 中文：有限 caller option 集合。English: Finite caller option collection. */
  options?: ReadonlyArray<USelectEntry>;
  /** 中文：没有匹配项时的调用方占位文字。English: Caller placeholder shown when no option matches. */
  placeholder?: string;
  /** 中文：调用方提供的确认文字。English: Caller-provided confirm copy. */
  confirmText?: string;
  /** 中文：调用方提供的取消文字。English: Caller-provided cancel copy. */
  cancelText?: string;
  /** 中文：是否先维护局部草稿并要求显式确定。English: Whether to retain a local draft and require explicit confirmation. */
  confirmMode?: boolean;
  /** 中文：是否阻止展开与选择。English: Whether to prevent opening and selection. */
  disabled?: boolean;
}

/**
 * @lang zh-CN 描述 `USelect` 的 inline 触发、受控写回与确定/取消事件。
 * @lang en Describes inline-trigger, controlled-writeback, and confirm/cancel events of `USelect`.
 */
export type USelectEmits = {
  /** 中文：提交后的下一透明值。English: Next transparent value after commit. */
  'update:modelValue': (value: UChoiceValue) => void;
  /** 中文：与受控更新相同的提交值。English: The same committed value as the controlled update. */
  change: (value: UChoiceValue) => void;
  /** 中文：展开 inline panel 的原始跨平台事件。English: Original cross-platform event that opens the inline panel. */
  click: (event: unknown) => void;
  /** 中文：显式确定后的结构化快照。English: Structured snapshot after explicit confirmation. */
  confirm: (result: USelectConfirmResult) => void;
  /** 中文：恢复 caller 值后的结构化取消快照。English: Structured cancellation snapshot after restoring the caller value. */
  cancel: (result: USelectCancelResult) => void;
};

/**
 * @lang zh-CN 描述 `UDropdown` 的 caller-owned legacy 值与局部 registry 禁用边界。
 * @lang en Describes the caller-owned legacy value and local-registry disabled boundary of `UDropdown`.
 */
export interface UDropdownProps {
  /** 中文：legacy 子项共享的当前透明值。English: Current transparent value shared by legacy children. */
  modelValue?: UChoiceValue;
  /** 中文：是否阻止 legacy 选择及 registry open。English: Whether to prevent legacy selection and registry opening. */
  disabled?: boolean;
}

/**
 * @lang zh-CN 描述 `UDropdown` 的 legacy 值更新与真正关闭显式 registry item 的事件。
 * @lang en Describes legacy-value updates of `UDropdown` and the event emitted when an explicit registry item actually closes.
 */
export type UDropdownEmits = {
  /** 中文：legacy 子项请求的下一透明值。English: Next transparent value requested by a legacy child. */
  'update:modelValue': (value: UChoiceValue) => void;
  /** 中文：与受控更新相同的 legacy 选择值。English: The same legacy selection value as the controlled update. */
  change: (value: UChoiceValue) => void;
  /** 中文：真正关闭的显式 item 原始 name。English: Raw name of the explicit item that actually closed. */
  close: (name: UChoiceValue) => void;
};

/**
 * @lang zh-CN 描述 `UDropdown` 唯一公开的 registry 控制方法；注册关系与 owner token 保持私有。
 * @lang en Describes the only public registry-control methods of `UDropdown`; registrations and owner tokens remain private.
 */
export interface UDropdownExposed {
  /** 中文：打开当前 registry 中唯一匹配且可交互的 item。English: Opens the sole matching interactive item in the current registry. */
  open(name: UChoiceValue): boolean;
  /** 中文：关闭当前 active item；没有 active item 时返回 false 且不发事件。English: Closes the current active item; returns false without emitting when none is active. */
  close(): boolean;
}

/**
 * @lang zh-CN 表示 `UDropdownItem` options 模式接受的透明标量或透明值数组。
 * @lang en Represents a transparent scalar or transparent-value array accepted by `UDropdownItem` options mode.
 */
export type UDropdownItemValue = UChoiceValue | ReadonlyArray<UChoiceValue>;

/**
 * @lang zh-CN 描述 `UDropdownItem` 的有限 option 记录；额外字段仅保留在 caller 对象中，不形成父级 registry API。
 * @lang en Describes a finite `UDropdownItem` option record; extra fields stay on the caller object and form no parent-registry API.
 */
export interface UDropdownItemOption {
  /** 中文：选择时原样交付的透明标量或数组。English: Transparent scalar or array delivered unchanged on selection. */
  value?: UDropdownItemValue;
  /** 中文：可见文字。English: Visible copy. */
  label?: string | number;
  /** 中文：是否阻止选择该 option。English: Whether selection of this option is prevented. */
  disabled?: boolean;
  /** 中文：由调用方保留且不被组件解释的元数据。English: Metadata retained by the caller and not interpreted by the component. */
  [field: string]: unknown;
}

/**
 * @lang zh-CN 描述 `UDropdownItem` 的独立 legacy 模式或显式 name/options 模式输入。
 * @lang en Describes independent legacy mode or explicit name/options mode inputs of `UDropdownItem`.
 */
export interface UDropdownItemProps {
  /** 中文：独立 legacy 或父级 legacy 模式使用的透明标量。English: Transparent scalar used by independent or parent legacy mode. */
  value?: UChoiceValue;
  /** 中文：显式提供后进入 registry options 模式的稳定 identity。English: Stable identity that enters registry options mode when explicitly supplied. */
  name?: UChoiceValue;
  /** 中文：trigger 可见文字；缺省时可回退到匹配 option label。English: Visible trigger copy, with fallback to a matching option label when omitted. */
  label?: string;
  /** 中文：是否阻止本 item 的本地交互。English: Whether to prevent local interaction for this item. */
  disabled?: boolean;
  /** 中文：options 模式中由调用方拥有的当前值。English: Caller-owned current value in options mode. */
  modelValue?: UDropdownItemValue;
  /** 中文：options 模式的有限 caller 记录集合。English: Finite caller-record collection for options mode. */
  options?: ReadonlyArray<UDropdownItemOption>;
  /** 中文：是否投影并注册当前显式 item。English: Whether to project and register the current explicit item. */
  show?: boolean;
}

/**
 * @lang zh-CN 描述 `UDropdownItem` 在两个互斥模式下的 legacy select 或受控 option 事件。
 * @lang en Describes legacy select or controlled-option events of `UDropdownItem` in its two mutually exclusive modes.
 */
export type UDropdownItemEmits = {
  /** 中文：独立或父级 legacy 模式的透明标量选择。English: Transparent scalar selection in independent or parent legacy mode. */
  select: (value: UChoiceValue) => void;
  /** 中文：options 模式选择的下一透明标量或数组。English: Next transparent scalar or array selected in options mode. */
  'update:modelValue': (value: UDropdownItemValue) => void;
  /** 中文：与 options 模式受控更新相同的值。English: The same value as the options-mode controlled update. */
  change: (value: UDropdownItemValue) => void;
};

/**
 * @lang zh-CN 描述 `UNumberBox` 的有限数值范围、步长与本地交互 guard。
 * @lang en Describes finite numeric bounds, step, and local interaction guards of `UNumberBox`.
 */
export interface UNumberBoxProps {
  /** 中文：调用方拥有的当前数值。English: Caller-owned current number. */
  modelValue?: number;
  /** 中文：本地数值下界；反向有限边界在 runtime 规范为升序。English: Local numeric lower bound; reversed finite bounds are normalized in ascending order at runtime. */
  min?: number;
  /** 中文：本地数值上界。English: Local numeric upper bound. */
  max?: number;
  /** 中文：按钮使用的十进制定点步长；非正值回退为 1。English: Decimal fixed-point step used by buttons; nonpositive values fall back to 1. */
  step?: number;
  /** 中文：是否阻止全部本地输入。English: Whether to prevent every local input. */
  disabled?: boolean;
  /** 中文：是否将按钮和直接输入同时置为只读。English: Whether to make buttons and direct input readonly together. */
  readonly?: boolean;
}

/**
 * @lang zh-CN 描述 `UNumberBox` 对同一有限下一值按固定顺序发送的三个事件。
 * @lang en Describes the three events emitted by `UNumberBox` in fixed order for the same finite next value.
 */
export type UNumberBoxEmits = {
  /** 中文：下一受控数值。English: Next controlled number. */
  'update:modelValue': (value: number) => void;
  /** 中文：与受控更新相同的旧版 input 数值。English: Legacy input number equal to the controlled update. */
  input: (value: number) => void;
  /** 中文：与受控更新相同的 change 数值。English: Change number equal to the controlled update. */
  change: (value: number) => void;
};

/**
 * @lang zh-CN 描述 `URate` 的 caller-owned 分级值、显式 current alias 与可见符号。
 * @lang en Describes caller-owned level value, explicit current alias, and visible symbols of `URate`.
 */
export interface URateProps {
  /** 中文：`current` 缺省时拥有显示状态的当前值。English: Current value that owns presentation state when `current` is omitted. */
  modelValue?: number;
  /** 中文：显式提供时优先的迁移显示 alias；组件不会修改它。English: Migration presentation alias that takes precedence when explicit and is never modified by the component. */
  current?: number;
  /** 中文：可见分级项数量；runtime 收紧为至少一项的有限整数。English: Visible level count, narrowed at runtime to a finite integer of at least one. */
  count?: number;
  /** 中文：是否阻止本地选择。English: Whether to prevent local selection. */
  disabled?: boolean;
  /** 中文：active 项的调用方可见符号。English: Caller-visible symbol for an active item. */
  activeSymbol?: string;
  /** 中文：inactive 项的调用方可见符号。English: Caller-visible symbol for an inactive item. */
  inactiveSymbol?: string;
}

/**
 * @lang zh-CN 描述 `URate` 对同一整数选择按固定顺序发送的三个事件。
 * @lang en Describes the three events emitted by `URate` in fixed order for the same integer selection.
 */
export type URateEmits = {
  /** 中文：下一受控整数选择。English: Next controlled integer selection. */
  'update:modelValue': (value: number) => void;
  /** 中文：与受控更新相同的旧版 input 数值。English: Legacy input number equal to the controlled update. */
  input: (value: number) => void;
  /** 中文：与受控更新相同的 change 数值。English: Change number equal to the controlled update. */
  change: (value: number) => void;
};

/**
 * @lang zh-CN 描述 `USlider` 的 caller-owned 数值、相对 min 步进网格与本地显示 guard。
 * @lang en Describes caller-owned number, min-relative step grid, and local presentation guard of `USlider`.
 */
export interface USliderProps {
  /** 中文：调用方拥有的当前数值。English: Caller-owned current number. */
  modelValue?: number;
  /** 中文：相对 step 网格的原点与下界。English: Origin and lower bound of the relative step grid. */
  min?: number;
  /** 中文：网格允许的数值上界。English: Numeric upper bound allowed by the grid. */
  max?: number;
  /** 中文：相对 min 的正十进制步长；无效值回退为 1。English: Positive decimal step relative to min; invalid values fall back to 1. */
  step?: number;
  /** 中文：是否显示规范后的当前数值。English: Whether to display the normalized current number. */
  showValue?: boolean;
  /** 中文：是否阻止原生 change。English: Whether to prevent native change. */
  disabled?: boolean;
}

/**
 * @lang zh-CN 描述 `USlider` 对同一网格对齐数值发送的受控更新与 change 事件。
 * @lang en Describes controlled-update and change events emitted by `USlider` for the same grid-aligned number.
 */
export type USliderEmits = {
  /** 中文：下一网格对齐数值。English: Next grid-aligned number. */
  'update:modelValue': (value: number) => void;
  /** 中文：与受控更新相同的网格对齐数值。English: The same grid-aligned number as the controlled update. */
  change: (value: number) => void;
};

/**
 * @lang zh-CN 表示 `UUpload` 仅用于本地呈现和 retry 资格的有限 caller 状态。
 * @lang en Represents the finite caller state used by `UUpload` only for local presentation and retry eligibility.
 */
export type UUploadFileStatus = 'ready' | 'pending' | 'error';

/**
 * @lang zh-CN 描述 `UUpload` 可读的 caller 文件状态记录；额外业务字段保持 opaque，组件不读取文件字节、URL 或凭据。
 * @lang en Describes a caller file-state record readable by `UUpload`; extra business fields stay opaque, and the component reads no file bytes, URL, or credentials.
 */
export interface UUploadFileRecord {
  /** 中文：首选可见标签。English: Preferred visible label. */
  label?: string | number;
  /** 中文：`label` 缺省时使用的可见标签 alias。English: Visible-label alias used when `label` is absent. */
  name?: string | number;
  /** 中文：可选的调用方说明文字。English: Optional caller description copy. */
  description?: string;
  /** 中文：有限本地呈现状态。English: Finite local presentation state. */
  status?: UUploadFileStatus;
  /** 中文：调用方本地化的状态文字。English: Caller-localized status copy. */
  statusText?: string;
  /** 中文：是否阻止该记录的 preview/remove/retry intent。English: Whether to prevent preview/remove/retry intent for this record. */
  disabled?: boolean;
  /** 中文：由调用方拥有且只作为 opaque record 随事件返回的额外字段。English: Extra caller-owned field returned only as part of the opaque record in events. */
  [field: string]: unknown;
}

/**
 * @lang zh-CN 表示可读字符串/数字快捷项或调用方文件状态记录；它不是文件路径、URL、binary handle 或上传任务。
 * @lang en Represents a readable string/number shorthand or caller file-state record; it is not a file path, URL, binary handle, or upload task.
 */
export type UUploadFile = string | number | UUploadFileRecord;

/**
 * @lang zh-CN 表示受限 upload adapter action；组件只按这四个固定名称读取方法。
 * @lang en Represents a constrained upload-adapter action; the component reads methods only by these four fixed names.
 */
export type UUploadAdapterAction = 'select' | 'preview' | 'remove' | 'retry';

/**
 * @lang zh-CN 描述 select adapter 获得的精确浅冻结上下文；不包含 chooser、transport、URL、header、token 或 bytes。
 * @lang en Describes the exact shallow-frozen context received by the select adapter; it contains no chooser, transport, URL, header, token, or bytes.
 */
export interface UUploadSelectAdapterContext {
  /** 中文：固定 select discriminant。English: Fixed select discriminant. */
  readonly action: 'select';
  /** 中文：开始调用时 caller 文件数组的新容器快照。English: New-container snapshot of the caller file array at invocation start. */
  readonly files: ReadonlyArray<UUploadFile>;
  /** 中文：有限显示列表中的剩余可请求槽位。English: Remaining requestable slots in the finite visible list. */
  readonly remainingSlots: number;
  /** 中文：未解析的原始跨平台交互事件。English: Uninterpreted original cross-platform interaction event. */
  readonly event: unknown;
  /** 中文：仅在当前组件实例内递增的请求关联号。English: Request correlation number increasing only within the current component instance. */
  readonly requestId: number;
}

/**
 * @lang zh-CN 描述某一个精确 preview/remove/retry action 的浅冻结 adapter 上下文；泛型 discriminant 不允许方法混淆 action。
 * @lang en Describes the shallow-frozen adapter context for one exact preview/remove/retry action; its generic discriminant prevents methods from conflating actions.
 */
export interface UUploadFileAdapterContext<Action extends Exclude<UUploadAdapterAction, 'select'>> {
  /** 中文：当前方法唯一对应的文件 action。English: File action corresponding uniquely to the current method. */
  readonly action: Action;
  /** 中文：开始调用时 caller 文件数组的新容器快照。English: New-container snapshot of the caller file array at invocation start. */
  readonly files: ReadonlyArray<UUploadFile>;
  /** 中文：当前原始 caller 文件记录。English: Current raw caller file record. */
  readonly file: UUploadFile;
  /** 中文：记录在原受控 source 数组中的索引。English: Record index in the original controlled source array. */
  readonly index: number;
  /** 中文：未解析的原始跨平台交互事件。English: Uninterpreted original cross-platform interaction event. */
  readonly event: unknown;
  /** 中文：仅在当前组件实例内递增的请求关联号。English: Request correlation number increasing only within the current component instance. */
  readonly requestId: number;
}

/**
 * @lang zh-CN 表示 preview 方法唯一可接收的精确 adapter context。
 * @lang en Represents the exact adapter context accepted only by the preview method.
 */
export type UUploadPreviewAdapterContext = UUploadFileAdapterContext<'preview'>;

/**
 * @lang zh-CN 表示 remove 方法唯一可接收的精确 adapter context。
 * @lang en Represents the exact adapter context accepted only by the remove method.
 */
export type UUploadRemoveAdapterContext = UUploadFileAdapterContext<'remove'>;

/**
 * @lang zh-CN 表示 retry 方法唯一可接收的精确 adapter context。
 * @lang en Represents the exact adapter context accepted only by the retry method.
 */
export type UUploadRetryAdapterContext = UUploadFileAdapterContext<'retry'>;

/**
 * @lang zh-CN 表示 adapter 可完成但不请求 model 写回，或交付一个不同 identity 的下一数组。
 * @lang en Represents adapter completion without a model writeback request, or delivery of a next array with a distinct identity.
 */
export type UUploadAdapterOutcome = void | ReadonlyArray<UUploadFile>;

/**
 * @lang zh-CN 表示 upload adapter 的同步、Promise 或 thenable 完成值；所有 rejection 由组件收束为稳定状态。
 * @lang en Represents a synchronous, Promise, or thenable upload-adapter outcome; every rejection is contained by the component as a stable state.
 */
export type UUploadAdapterResult = UUploadAdapterOutcome | PromiseLike<UUploadAdapterOutcome>;

/**
 * @lang zh-CN 描述调用方可选注入的四方法 adapter；缺失方法保持纯 legacy intent，且没有内置 transport 回退。
 * @lang en Describes the four-method adapter optionally injected by the caller; a missing method preserves pure legacy intent, with no built-in transport fallback.
 */
export interface UUploadAdapter {
  /** 中文：请求调用方选择下一文件状态。English: Requests that the caller select next file state. */
  select?(context: UUploadSelectAdapterContext): UUploadAdapterResult;
  /** 中文：请求调用方预览当前 opaque 记录。English: Requests that the caller preview the current opaque record. */
  preview?(context: UUploadPreviewAdapterContext): UUploadAdapterResult;
  /** 中文：请求调用方移除当前 opaque 记录。English: Requests that the caller remove the current opaque record. */
  remove?(context: UUploadRemoveAdapterContext): UUploadAdapterResult;
  /** 中文：请求调用方重试当前 error 记录。English: Requests that the caller retry the current error record. */
  retry?(context: UUploadRetryAdapterContext): UUploadAdapterResult;
}

/**
 * @lang zh-CN 描述 legacy select intent；它只报告有限剩余槽位和原始事件。
 * @lang en Describes the legacy select intent; it reports only finite remaining slots and the original event.
 */
export interface UUploadSelectIntent {
  /** 中文：有限显示列表中的剩余可请求槽位。English: Remaining requestable slots in the finite visible list. */
  readonly remainingSlots: number;
  /** 中文：未解析的原始跨平台事件。English: Uninterpreted original cross-platform event. */
  readonly event: unknown;
}

/**
 * @lang zh-CN 描述 legacy preview/remove/retry intent；opaque caller 记录原样返回。
 * @lang en Describes legacy preview/remove/retry intent; the opaque caller record is returned unchanged.
 */
export interface UUploadFileIntent {
  /** 中文：当前原始 caller 文件记录。English: Current raw caller file record. */
  readonly file: UUploadFile;
  /** 中文：未解析的原始跨平台事件。English: Uninterpreted original cross-platform event. */
  readonly event: unknown;
}

/**
 * @lang zh-CN 表示 upload adapter 唯一公开失败状态中的稳定、非本地化代码。
 * @lang en Represents the stable nonlocalized code in the sole public failure state of the upload adapter.
 */
export type UUploadAdapterFailureCode = 'adapter-threw' | 'adapter-rejected' | 'invalid-result';

/**
 * @lang zh-CN 描述不会泄漏原始异常、凭据或 caller error 对象的冻结失败信息。
 * @lang en Describes frozen failure information that leaks no original exception, credential, or caller error object.
 */
export interface UUploadAdapterFailure {
  /** 中文：稳定失败分类。English: Stable failure classification. */
  readonly code: UUploadAdapterFailureCode;
}

/**
 * @lang zh-CN 描述 adapter 方法调用前同步发送的 pending 状态。
 * @lang en Describes the pending state emitted synchronously before an adapter method call.
 */
export interface UUploadAdapterPendingState {
  /** 中文：pending discriminant。English: Pending discriminant. */
  readonly status: 'pending';
  /** 中文：当前受限 action。English: Current constrained action. */
  readonly action: UUploadAdapterAction;
  /** 中文：组件实例内 request id。English: Component-instance-local request id. */
  readonly requestId: number;
}

/**
 * @lang zh-CN 描述失去 per-action latest、source 或 adapter identity 资格后的最小 stale 状态。
 * @lang en Describes the minimal stale state after loss of per-action-latest, source, or adapter-identity eligibility.
 */
export interface UUploadAdapterStaleState {
  /** 中文：stale discriminant。English: Stale discriminant. */
  readonly status: 'stale';
  /** 中文：当前受限 action。English: Current constrained action. */
  readonly action: UUploadAdapterAction;
  /** 中文：组件实例内 request id。English: Component-instance-local request id. */
  readonly requestId: number;
}

/**
 * @lang zh-CN 描述 adapter 正常完成后的状态，并明确是否已产生 caller model 更新意图。
 * @lang en Describes state after normal adapter completion and explicitly states whether a caller-model update intent was produced.
 */
export interface UUploadAdapterSucceededState {
  /** 中文：succeeded discriminant。English: Succeeded discriminant. */
  readonly status: 'succeeded';
  /** 中文：当前受限 action。English: Current constrained action. */
  readonly action: UUploadAdapterAction;
  /** 中文：组件实例内 request id。English: Component-instance-local request id. */
  readonly requestId: number;
  /** 中文：是否已在本状态之前发送新的 model 数组。English: Whether a new model array was emitted before this state. */
  readonly updated: boolean;
}

/**
 * @lang zh-CN 描述当前 eligible adapter 请求的稳定失败状态。
 * @lang en Describes the stable failure state of a currently eligible adapter request.
 */
export interface UUploadAdapterFailedState {
  /** 中文：failed discriminant。English: Failed discriminant. */
  readonly status: 'failed';
  /** 中文：当前受限 action。English: Current constrained action. */
  readonly action: UUploadAdapterAction;
  /** 中文：组件实例内 request id。English: Component-instance-local request id. */
  readonly requestId: number;
  /** 中文：不含原始异常的冻结失败分类。English: Frozen failure classification containing no original exception. */
  readonly failure: UUploadAdapterFailure;
}

/**
 * @lang zh-CN 表示 `UUpload` 唯一异步状态事件的完整 discriminated union。
 * @lang en Represents the complete discriminated union of the sole asynchronous state event from `UUpload`.
 */
export type UUploadAdapterState =
  | UUploadAdapterPendingState
  | UUploadAdapterStaleState
  | UUploadAdapterSucceededState
  | UUploadAdapterFailedState;

/**
 * @lang zh-CN 描述 `UUpload` 的 caller-owned 文件状态、可选 adapter 和全部 caller-localized action copy。
 * @lang en Describes caller-owned file state, optional adapter, and all caller-localized action copy of `UUpload`.
 */
export interface UUploadProps {
  /** 中文：是否输出有限文件状态或 select control。English: Whether to output finite file state or a select control. */
  visible?: boolean;
  /** 中文：首选 caller-owned 文件状态数组；显式提供时优先于 `files`。English: Preferred caller-owned file-state array, taking precedence over `files` when explicit. */
  modelValue?: ReadonlyArray<UUploadFile>;
  /** 中文：`modelValue` 缺省时使用的旧版数组。English: Legacy array used when `modelValue` is omitted. */
  files?: ReadonlyArray<UUploadFile>;
  /** 中文：显式注入的有限 adapter；null 或缺失方法保持纯 legacy intent。English: Explicitly injected finite adapter; null or a missing method preserves pure legacy intent. */
  adapter?: UUploadAdapter | null;
  /** 中文：收紧到 1–12 的本地显示/选择槽位上限。English: Local display/select slot limit narrowed to 1–12. */
  max?: number;
  /** 中文：caller-localized group label。English: Caller-localized group label. */
  label?: string;
  /** 中文：非空时输出 select control 的 caller 文字。English: Caller copy that outputs the select control when nonempty. */
  selectText?: string;
  /** 中文：非空时输出 preview intent control 的 caller 文字。English: Caller copy that outputs the preview-intent control when nonempty. */
  previewText?: string;
  /** 中文：非空时输出 remove intent control 的 caller 文字。English: Caller copy that outputs the remove-intent control when nonempty. */
  removeText?: string;
  /** 中文：error 记录上非空时输出 retry intent control 的 caller 文字。English: Caller copy that outputs the retry-intent control when nonempty on an error record. */
  retryText?: string;
  /** 中文：是否阻止全部本地 intent。English: Whether to prevent every local intent. */
  disabled?: boolean;
}

/**
 * @lang zh-CN 描述 `UUpload` 的四个 legacy intent、可选 model 写回与唯一 adapter 状态事件。
 * @lang en Describes four legacy intents, optional model writeback, and the sole adapter-state event of `UUpload`.
 */
export type UUploadEmits = {
  /** 中文：请求调用方选择文件状态的 legacy intent。English: Legacy intent requesting caller file-state selection. */
  select: (intent: UUploadSelectIntent) => void;
  /** 中文：请求调用方预览 opaque 记录的 legacy intent。English: Legacy intent requesting caller preview of an opaque record. */
  preview: (intent: UUploadFileIntent) => void;
  /** 中文：请求调用方移除 opaque 记录的 legacy intent。English: Legacy intent requesting caller removal of an opaque record. */
  remove: (intent: UUploadFileIntent) => void;
  /** 中文：请求调用方重试 opaque error 记录的 legacy intent。English: Legacy intent requesting caller retry of an opaque error record. */
  retry: (intent: UUploadFileIntent) => void;
  /** 中文：adapter 返回不同 identity 新数组后的受控写回意图。English: Controlled writeback intent after an adapter returns a new array with distinct identity. */
  'update:modelValue': (files: ReadonlyArray<UUploadFile>) => void;
  /** 中文：pending/succeeded/stale/failed 的唯一异步状态 union。English: Sole asynchronous state union of pending/succeeded/stale/failed. */
  'adapter-state': (state: UUploadAdapterState) => void;
};

/**
 * @lang zh-CN 描述 `UAlertTips` 的局部、caller-controlled 可见性和有限文字表面；它不是全局反馈或自动关闭服务。
 * @lang en Describes the local caller-controlled visibility and finite text surface of `UAlertTips`; it is not a global feedback or auto-dismiss service.
 */
export interface UAlertTipsProps {
  /** 中文：是否投影当前局部提示条。English: Whether to project the current local alert strip. */
  show?: boolean;
  /** 中文：有限视觉类型。English: Finite visual type. */
  type?: 'primary' | 'success' | 'warning' | 'error' | string;
  /** 中文：调用方提供的标题。English: Caller-provided title. */
  title?: string;
  /** 中文：调用方提供的说明。English: Caller-provided description. */
  description?: string;
  /** 中文：是否显示局部 close intent control。English: Whether to show a local close-intent control. */
  closable?: boolean;
}

/**
 * @lang zh-CN 描述 `UTag` 的有限 token 化标签表面；`show` 与既有 `visible` 共同控制投影，任一为 false 都会隐藏本地标签。
 * @lang en Describes the finite tokenized tag surface of `UTag`; `show` and existing `visible` jointly control projection, and either false hides the local tag.
 */
export interface UTagProps {
  /** 中文：调用方可见文字，数字零保持可见。English: Caller-visible text; numeric zero remains visible. */
  text?: string | number;
  /** 中文：有限主题 tone。English: Finite theme tone. */
  tone?: 'neutral' | 'primary' | 'accent' | string;
  /** 中文：有限本地尺寸。English: Finite local size. */
  size?: 'small' | 'medium' | 'large' | string;
  /** 中文：有限本地形状。English: Finite local shape. */
  shape?: 'square' | 'rounded' | 'pill' | string;
  /** 中文：是否呈现 local close intent control。English: Whether to present a local close-intent control. */
  closable?: boolean;
  /** 中文：既有 HIA 可见性输入。English: Existing HIA visibility input. */
  visible?: boolean;
  /** 中文：迁移用可见性输入；不替代 visible。English: Migration visibility input; it does not replace visible. */
  show?: boolean;
  /** 中文：本地交互 guard；非空字符串和 true 都会阻止 click/close intent。English: Local interaction guard; a nonempty string and true both prevent click/close intent. */
  disabled?: boolean | string;
}

/**
 * @lang zh-CN 当前受审计的 choice、picker/date、dropdown、numeric、upload、navigation、feedback 与 form/input 组件保持精确 props、事件和必要实例声明；其余导出采用 `UViewComponent` 基线，等待逐项 API 审计。
 * @lang en Current audited choice, picker/date, dropdown, numeric, upload, navigation, feedback, and form/input components retain precise props, events, and required instance declarations; the remaining exports use the `UViewComponent` baseline pending per-item API audit.
 */
export declare const UField: UViewTypedComponent<UFieldProps, {}, UFieldEmits>;
/** @lang zh-CN UField 的公开组件实例类型。 @lang en Public component-instance type of UField. */
export type UFieldInstance = InstanceType<typeof UField>;
/** @lang zh-CN 表单 owner、registry 与校验编排组件。 @lang en Form owner, registry, and validation-orchestration component. */
export declare const UForm: UViewTypedComponent<UFormProps, UFormExposed, UFormEmits>;
/** @lang zh-CN UForm 的公开组件实例类型，包含七个 expose 方法。 @lang en Public component-instance type of UForm including its seven exposed methods. */
export type UFormInstance = InstanceType<typeof UForm>;
/** @lang zh-CN 单字段注册、校验与错误投影组件。 @lang en Single-field registration, validation, and error-projection component. */
export declare const UFormItem: UViewTypedComponent<UFormItemProps, UFormItemExposed>;
/** @lang zh-CN UFormItem 的公开组件实例类型，包含单字段 validate/clear/reset。 @lang en Public component-instance type of UFormItem including single-field validate/clear/reset. */
export type UFormItemInstance = InstanceType<typeof UFormItem>;
/** @lang zh-CN 受控单行输入组件。 @lang en Controlled single-line input component. */
export declare const UInput: UViewTypedComponent<UInputProps, {}, UInputEmits>;
/** @lang zh-CN UInput 的公开组件实例类型。 @lang en Public component-instance type of UInput. */
export type UInputInstance = InstanceType<typeof UInput>;
/** @lang zh-CN 受控搜索意图组件。 @lang en Controlled search-intent component. */
export declare const USearch: UViewTypedComponent<USearchProps, {}, USearchEmits>;
/** @lang zh-CN USearch 的公开组件实例类型。 @lang en Public component-instance type of USearch. */
export type USearchInstance = InstanceType<typeof USearch>;
/** @lang zh-CN 受控多行输入组件。 @lang en Controlled multiline input component. */
export declare const UTextarea: UViewTypedComponent<UTextareaProps, {}, UTextareaEmits>;
/** @lang zh-CN UTextarea 的公开组件实例类型。 @lang en Public component-instance type of UTextarea. */
export type UTextareaInstance = InstanceType<typeof UTextarea>;
/** @lang zh-CN 受控 checkbox 组件。 @lang en Controlled checkbox component. */
export declare const UCheckbox: DefineComponent<UCheckboxProps, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, UCheckboxEmits>;
/** @lang zh-CN UCheckbox 的公开组件实例类型。 @lang en Public component-instance type of UCheckbox. */
export type UCheckboxInstance = InstanceType<typeof UCheckbox>;
/** @lang zh-CN 受控多选 group 组件。 @lang en Controlled multi-choice group component. */
export declare const UCheckboxGroup: DefineComponent<UCheckboxGroupProps, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, UCheckboxGroupEmits>;
/** @lang zh-CN UCheckboxGroup 的公开组件实例类型。 @lang en Public component-instance type of UCheckboxGroup. */
export type UCheckboxGroupInstance = InstanceType<typeof UCheckboxGroup>;
/** @lang zh-CN 受控单选项组件。 @lang en Controlled single-choice item component. */
export declare const URadio: DefineComponent<URadioProps, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, URadioEmits>;
/** @lang zh-CN URadio 的公开组件实例类型。 @lang en Public component-instance type of URadio. */
export type URadioInstance = InstanceType<typeof URadio>;
/** @lang zh-CN 受控单选 group 组件。 @lang en Controlled single-choice group component. */
export declare const URadioGroup: DefineComponent<URadioGroupProps, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, URadioGroupEmits>;
/** @lang zh-CN URadioGroup 的公开组件实例类型。 @lang en Public component-instance type of URadioGroup. */
export type URadioGroupInstance = InstanceType<typeof URadioGroup>;
/** @lang zh-CN 受控布尔选择组件。 @lang en Controlled boolean-choice component. */
export declare const USwitch: DefineComponent<USwitchProps, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, USwitchEmits>;
/** @lang zh-CN USwitch 的公开组件实例类型。 @lang en Public component-instance type of USwitch. */
export type USwitchInstance = InstanceType<typeof USwitch>;
/** @lang zh-CN caller-controlled 局部 popup 组件。 @lang en Caller-controlled local popup component. */
export declare const UPopup: UViewTypedComponent<UPopupProps, UPopupExposed, UPopupEmits>;
/** @lang zh-CN UPopup 的公开实例类型，包含 programmatic close。 @lang en Public UPopup instance type including programmatic close. */
export type UPopupInstance = InstanceType<typeof UPopup>;
/** @lang zh-CN caller-controlled 局部 mask 组件。 @lang en Caller-controlled local mask component. */
export declare const UMask: UViewTypedComponent<UMaskProps, {}, UMaskEmits>;
/** @lang zh-CN UMask 的公开组件实例类型。 @lang en Public component-instance type of UMask. */
export type UMaskInstance = InstanceType<typeof UMask>;
/** @lang zh-CN 有限 CSS transition wrapper。 @lang en Finite CSS-transition wrapper. */
export declare const UTransition: UViewTypedComponent<UTransitionProps>;
/** @lang zh-CN UTransition 的公开组件实例类型。 @lang en Public component-instance type of UTransition. */
export type UTransitionInstance = InstanceType<typeof UTransition>;
/** @lang zh-CN caller-controlled 有限 action-sheet。 @lang en Caller-controlled finite action sheet. */
export declare const UActionSheet: UViewTypedComponent<UActionSheetProps, UActionSheetExposed, UActionSheetEmits>;
/** @lang zh-CN UActionSheet 的公开实例类型，包含 programmatic close。 @lang en Public UActionSheet instance type including programmatic close. */
export type UActionSheetInstance = InstanceType<typeof UActionSheet>;
/** @lang zh-CN caller-controlled 且可显式承接 scoped service 的 modal。 @lang en Caller-controlled modal that may explicitly host a scoped service. */
export declare const UModal: UViewTypedComponent<UModalProps, UModalExposed, UModalEmits>;
/** @lang zh-CN UModal 的公开实例类型，包含 clearLoading。 @lang en Public UModal instance type including clearLoading. */
export type UModalInstance = InstanceType<typeof UModal>;
/** @lang zh-CN caller-controlled、component-ref 与显式 scoped service toast。 @lang en Caller-controlled, component-ref, and explicit scoped-service toast. */
export declare const UToast: UViewTypedComponent<UToastProps, UToastExposed, UToastEmits>;
/** @lang zh-CN UToast 的公开实例类型，包含 show/close/hide。 @lang en Public UToast instance type including show/close/hide. */
export type UToastInstance = InstanceType<typeof UToast>;
/** @lang zh-CN 纯展示、非路由 navbar。 @lang en Presentation-only non-routing navbar. */
export declare const UNavbar: UViewTypedComponent<UNavbarProps, {}, UNavbarEmits>;
/** @lang zh-CN UNavbar 的公开组件实例类型。 @lang en Public component-instance type of UNavbar. */
export type UNavbarInstance = InstanceType<typeof UNavbar>;
/** @lang zh-CN 局部、非路由 tabbar 组件。 @lang en Local non-routing tabbar component. */
export declare const UTabbar: UViewTypedComponent<UTabbarProps, {}, UTabbarEmits>;
/** @lang zh-CN UTabbar 的公开组件实例类型。 @lang en Public component-instance type of UTabbar. */
export type UTabbarInstance = InstanceType<typeof UTabbar>;
/** @lang zh-CN 有限、非路由 tabs 组件。 @lang en Finite non-routing tabs component. */
export declare const UTabs: UViewTypedComponent<UTabsProps, UTabsExposed, UTabsEmits>;
/** @lang zh-CN UTabs 的公开实例类型，包含 clickTab。 @lang en Public UTabs instance type including clickTab. */
export type UTabsInstance = InstanceType<typeof UTabs>;
/** @lang zh-CN caller-controlled 非滚动横幅组件。 @lang en Caller-controlled non-scrolling banner component. */
export declare const UNoticeBar: UViewTypedComponent<UNoticeBarProps, {}, UNoticeBarEmits>;
/** @lang zh-CN UNoticeBar 的公开组件实例类型。 @lang en Public component-instance type of UNoticeBar. */
export type UNoticeBarInstance = InstanceType<typeof UNoticeBar>;
/** @lang zh-CN 有限单列/多列本地 picker 组件。 @lang en Finite single-/multi-column local picker component. */
export declare const UPicker: DefineComponent<UPickerProps, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, UPickerEmits>;
/** @lang zh-CN UPicker 的公开组件实例类型。 @lang en Public component-instance type of UPicker. */
export type UPickerInstance = InstanceType<typeof UPicker>;
/** @lang zh-CN 受控单月 Gregorian 日期组件。 @lang en Controlled single-month Gregorian calendar component. */
export declare const UCalendar: UViewTypedComponent<UCalendarProps, {}, UCalendarEmits>;
/** @lang zh-CN UCalendar 的公开组件实例类型。 @lang en Public component-instance type of UCalendar. */
export type UCalendarInstance = InstanceType<typeof UCalendar>;
/** @lang zh-CN 有限 inline 单值选择组件。 @lang en Finite inline single-value selection component. */
export declare const USelect: UViewTypedComponent<USelectProps, {}, USelectEmits>;
/** @lang zh-CN USelect 的公开组件实例类型。 @lang en Public component-instance type of USelect. */
export type USelectInstance = InstanceType<typeof USelect>;
/** @lang zh-CN 受控 legacy 选择与显式 name registry owner。 @lang en Controlled legacy-selection and explicit-name registry owner. */
export declare const UDropdown: UViewTypedComponent<UDropdownProps, UDropdownExposed, UDropdownEmits>;
/** @lang zh-CN UDropdown 的公开实例类型，包含 open/close。 @lang en Public UDropdown instance type including open/close. */
export type UDropdownInstance = InstanceType<typeof UDropdown>;
/** @lang zh-CN 独立 legacy 或 registry options 下拉子项。 @lang en Independent legacy or registry-options dropdown child. */
export declare const UDropdownItem: UViewTypedComponent<UDropdownItemProps, {}, UDropdownItemEmits>;
/** @lang zh-CN UDropdownItem 的公开组件实例类型。 @lang en Public component-instance type of UDropdownItem. */
export type UDropdownItemInstance = InstanceType<typeof UDropdownItem>;
/** @lang zh-CN 十进制定点受控 number-box。 @lang en Decimal fixed-point controlled number box. */
export declare const UNumberBox: UViewTypedComponent<UNumberBoxProps, {}, UNumberBoxEmits>;
/** @lang zh-CN UNumberBox 的公开组件实例类型。 @lang en Public component-instance type of UNumberBox. */
export type UNumberBoxInstance = InstanceType<typeof UNumberBox>;
/** @lang zh-CN 有限整数分级受控组件。 @lang en Finite integer-level controlled component. */
export declare const URate: UViewTypedComponent<URateProps, {}, URateEmits>;
/** @lang zh-CN URate 的公开组件实例类型。 @lang en Public component-instance type of URate. */
export type URateInstance = InstanceType<typeof URate>;
/** @lang zh-CN 相对 min 十进制网格受控 slider。 @lang en Min-relative decimal-grid controlled slider. */
export declare const USlider: UViewTypedComponent<USliderProps, {}, USliderEmits>;
/** @lang zh-CN USlider 的公开组件实例类型。 @lang en Public component-instance type of USlider. */
export type USliderInstance = InstanceType<typeof USlider>;
/** @lang zh-CN caller-owned 文件状态与显式 injected adapter 编排组件。 @lang en Caller-owned file-state and explicit injected-adapter orchestration component. */
export declare const UUpload: UViewTypedComponent<UUploadProps, {}, UUploadEmits>;
/** @lang zh-CN UUpload 的公开组件实例类型；它没有文件或 adapter expose 方法。 @lang en Public UUpload component-instance type; it exposes no file or adapter methods. */
export type UUploadInstance = InstanceType<typeof UUpload>;
/** @lang zh-CN caller-controlled 局部提示条组件。 @lang en Caller-controlled local alert-strip component. */
export declare const UAlertTips: DefineComponent<UAlertTipsProps>;
/** @lang zh-CN 有限 token 化文字标签组件。 @lang en Finite tokenized text-tag component. */
export declare const UTag: DefineComponent<UTagProps>;

/**
 * @lang zh-CN 以下运行时命名导出均已存在，但尚未承诺逐 prop、事件 payload、slot props、expose signature、父子 context 或全局 bus 的完整 TypeScript 形状。
 * @lang en The following runtime named exports already exist, but do not yet promise complete TypeScript shapes for every prop, event payload, slot prop, expose signature, parent-child context, or global bus.
 */
export declare const UActionSheetItem: UViewComponent;
export declare const UAvatar: UViewComponent;
export declare const UAvatarCropper: UViewComponent;
export declare const UBackTop: UViewComponent;
export declare const UBadge: UViewComponent;
export declare const UButton: UViewComponent;
export declare const UCard: UViewComponent;
export declare const UCarKeyboard: UViewComponent;
export declare const UCell: UViewComponent;
export declare const UCellGroup: UViewComponent;
export declare const UCellItem: UViewComponent;
export declare const UCircleProgress: UViewComponent;
export declare const UCitySelect: UViewComponent;
export declare const UCol: UViewComponent;
export declare const UCollapse: UViewComponent;
export declare const UCollapseItem: UViewComponent;
export declare const UColumnNotice: UViewComponent;
export declare const UConfigProvider: UViewComponent;
export declare const UCountDown: UViewComponent;
export declare const UCountTo: UViewComponent;
export declare const UDivider: UViewComponent;
export declare const UEmpty: UViewComponent;
export declare const UFab: UViewComponent;
export declare const UFullScreen: UViewComponent;
export declare const UGap: UViewComponent;
export declare const UGrid: UViewComponent;
export declare const UGridItem: UViewComponent;
export declare const UIcon: UViewComponent;
export declare const UImage: UViewComponent;
export declare const UIndexAnchor: UViewComponent;
export declare const UIndexList: UViewComponent;
export declare const UKeyboard: UViewComponent;
export declare const ULazyLoad: UViewComponent;
export declare const ULine: UViewComponent;
export declare const ULineProgress: UViewComponent;
export declare const ULink: UViewComponent;
export declare const UList: UViewComponent;
export declare const ULoading: UViewComponent;
export declare const ULoadingPage: UViewComponent;
export declare const ULoadingPopup: UViewComponent;
export declare const ULoadmore: UViewComponent;
export declare const UMessageInput: UViewComponent;
export declare const UNavBar: UViewComponent;
export declare const UNoNetwork: UViewComponent;
export declare const UNotice: UViewComponent;
export declare const UNumberKeyboard: UViewComponent;
export declare const UPagination: UViewComponent;
export declare const UReadMore: UViewComponent;
export declare const URootPortal: UViewComponent;
export declare const URow: UViewComponent;
export declare const URowNotice: UViewComponent;
export declare const USafeBottom: UViewComponent;
export declare const UScrollList: UViewComponent;
export declare const USection: UViewComponent;
export declare const USkeleton: UViewComponent;
export declare const UStack: UViewComponent;
export declare const UStatusBar: UViewComponent;
export declare const UStep: UViewComponent;
export declare const USteps: UViewComponent;
export declare const USticky: UViewComponent;
export declare const USubsection: UViewComponent;
export declare const USwipeAction: UViewComponent;
export declare const USwiper: UViewComponent;
export declare const UTable: UViewComponent;
export declare const UTabsSwiper: UViewComponent;
export declare const UTd: UViewComponent;
export declare const UText: UViewComponent;
export declare const UTh: UViewComponent;
export declare const UTimeLine: UViewComponent;
export declare const UTimeLineItem: UViewComponent;
export declare const UTopTips: UViewComponent;
export declare const UTr: UViewComponent;
export declare const UValidationMessage: UViewComponent;
export declare const UVerificationCode: UViewComponent;
export declare const UWaterfall: UViewComponent;

/**
 * @lang zh-CN 描述 explicit plugin 的最小 Vue application 输入；安装只在调用方显式 `app.use` 时发生。
 * @lang en Describes the minimum Vue application input for the explicit plugin; installation happens only when the caller explicitly invokes `app.use`.
 */
export declare function installUView(application: App): App;

/**
 * @lang zh-CN 描述当前命名模板和组件实现的只读 registry；它不是 application source scanner 或 runtime global registry。
 * @lang en Describes the readonly registry of current template names and component implementations; it is not an application-source scanner or runtime global registry.
 */
export declare const UVIEW_COMPONENTS: ReadonlyArray<Readonly<{
  /** 中文：稳定的 kebab-case 模板名称。English: Stable kebab-case template name. */
  name: string;
  /** 中文：对应的当前 runtime 组件实现。English: Corresponding current runtime component implementation. */
  component: UViewComponent;
}>>;

/**
 * @lang zh-CN 描述只接受 `zh-Hans` 和 `en` 的当前本地 locale 值；它不读取系统、存储或网络。
 * @lang en Describes the current local locale value that accepts only `zh-Hans` and `en`; it reads no system, storage, or network state.
 */
export type ULocale = 'zh-Hans' | 'en';

/**
 * @lang zh-CN 描述当前显式支持的有限 locale 列表。
 * @lang en Describes the finite list of currently explicitly supported locales.
 */
export declare const U_SUPPORTED_LOCALES: readonly ULocale[];

/**
 * @lang zh-CN 将任意输入归一为当前有限 locale，不读取系统偏好或持久化状态。
 * @lang en Normalizes arbitrary input to the current finite locale without reading system preference or persisted state.
 */
export declare function normalizeULocale(value?: unknown): ULocale;

/**
 * @lang zh-CN 返回调用方提供的 locale ref 或安全的局部默认值；它不创建全局 locale store。
 * @lang en Returns a caller-provided locale ref or a safe local default; it creates no global locale store.
 */
export declare function useULocale(locale?: ULocale | ComputedRef<ULocale>): ComputedRef<ULocale>;

/**
 * @lang zh-CN 描述显式安装所有当前 runtime 组件的私有 Vue plugin；它不自动注入样式或注册到全局 runtime。
 * @lang en Describes the private Vue plugin that explicitly installs all current runtime components; it neither automatically injects styles nor registers on global runtime.
 */
export declare const UView: Plugin;

export default UView;
