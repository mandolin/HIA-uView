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
 * @lang zh-CN 描述 `UCheckbox` 当前受审计的 caller-controlled prop 表面；`checked` 是既有 alias，显式提供时优先于 `modelValue`。
 * @lang en Describes the current audited caller-controlled prop surface of `UCheckbox`; `checked` is the existing alias and takes precedence over `modelValue` when explicitly provided.
 */
export interface UCheckboxProps {
  /** 中文：独立事件或 group 成员关系使用的透明本地键。English: Transparent local key for independent events or group membership. */
  value?: UChoiceValue;
  /** 中文：调用方可见标签；默认 slot 可以替代其显示内容。English: Caller-visible label; the default slot may replace its displayed content. */
  label?: string;
  /** 中文：既有 HIA 受控 alias；显式提供时优先。English: Existing HIA controlled alias; it takes precedence when explicit. */
  checked?: boolean;
  /** 中文：独立模式的标准布尔受控值。English: Standard boolean controlled value in independent mode. */
  modelValue?: boolean;
  /** 中文：本地不可操作声明；非空字符串和 true 均为禁用。English: Local inactivity declaration; a nonempty string and true both disable interaction. */
  disabled?: string | boolean;
}

/**
 * @lang zh-CN 描述 `UCheckboxGroup` 的只读成员集合和局部禁用边界；组件 emit 新数组而不修改传入数组。
 * @lang en Describes the readonly membership collection and local disabled boundary of `UCheckboxGroup`; the component emits a new array rather than mutating the supplied array.
 */
export interface UCheckboxGroupProps {
  /** 中文：调用方拥有的成员集合。English: Caller-owned membership collection. */
  modelValue?: ReadonlyArray<UChoiceValue>;
  /** 中文：是否阻止该子树中 checkbox 的局部交互。English: Whether to prevent local checkbox interaction in this subtree. */
  disabled?: boolean;
}

/**
 * @lang zh-CN 描述 `URadio` 当前受审计的本地单选表面；group 内的 selected state 由 `URadioGroup` 控制。
 * @lang en Describes the current audited local single-choice surface of `URadio`; selected state inside a group is controlled by `URadioGroup`.
 */
export interface URadioProps {
  /** 中文：独立事件或 group 比较使用的透明本地键。English: Transparent local key for independent events or group comparison. */
  value?: UChoiceValue;
  /** 中文：调用方可见标签；默认 slot 可以替代其显示内容。English: Caller-visible label; the default slot may replace its displayed content. */
  label?: string;
  /** 中文：独立模式的受控选中态。English: Controlled selected state in independent mode. */
  checked?: boolean;
  /** 中文：本地不可操作声明；非空字符串和 true 均为禁用。English: Local inactivity declaration; a nonempty string and true both disable interaction. */
  disabled?: string | boolean;
}

/**
 * @lang zh-CN 描述 `URadioGroup` 的 caller-owned 单个本地键和禁用边界。
 * @lang en Describes the caller-owned single local key and disabled boundary of `URadioGroup`.
 */
export interface URadioGroupProps {
  /** 中文：调用方拥有的当前选中键。English: Caller-owned current selected key. */
  modelValue?: UChoiceValue;
  /** 中文：是否阻止该子树中 radio 的局部交互。English: Whether to prevent local radio interaction in this subtree. */
  disabled?: boolean;
}

/**
 * @lang zh-CN 描述 `USwitch` 的受控布尔选择表面；loading 只阻止局部切换，不表示异步业务完成。
 * @lang en Describes the controlled boolean-choice surface of `USwitch`; loading only blocks local toggling and does not represent asynchronous business completion.
 */
export interface USwitchProps {
  /** 中文：调用方拥有的当前布尔值。English: Caller-owned current boolean value. */
  modelValue?: boolean;
  /** 中文：调用方可见标签。English: Caller-visible label. */
  label?: string;
  /** 中文：是否阻止局部切换。English: Whether to prevent local toggling. */
  disabled?: boolean;
  /** 中文：是否以本地 loading guard 阻止切换。English: Whether to prevent toggling with a local loading guard. */
  loading?: boolean;
}

/**
 * @lang zh-CN 描述 `UTabbar` 的有限、非路由 tab 项；没有图标、徽标、页面或原生 tabBar 生命周期语义。
 * @lang en Describes a finite, non-routing `UTabbar` item; it has no icon, badge, page, or native-tab-bar lifecycle semantics.
 */
export interface UTabbarItem {
  /** 中文：可见标签。English: Visible label. */
  label?: string;
  /** 中文：`label` 的既有文本 alias。English: Existing text alias for `label`. */
  text?: string;
  /** 中文：本地选中键；未提供时组件回退到 label/text/index。English: Local selected key; the component falls back to label/text/index when absent. */
  value?: UChoiceValue;
  /** 中文：是否阻止该本地项的选择。English: Whether to prevent selection of this local item. */
  disabled?: boolean;
}

/**
 * @lang zh-CN 描述 `UTabbar` 的局部可见性和受控本地选择；`visible` 显式提供时优先于 `show`。
 * @lang en Describes local visibility and controlled local selection of `UTabbar`; explicit `visible` takes precedence over `show`.
 */
export interface UTabbarProps {
  /** 中文：既有 HIA 显式可见性 alias。English: Existing explicit HIA visibility alias. */
  visible?: boolean;
  /** 中文：本地输出的上游熟悉可见性开关；不调用 native tabBar API。English: Upstream-familiar visibility control for local output; it calls no native tab-bar API. */
  show?: boolean;
  /** 中文：调用方拥有的局部选中值，默认运行时值为 0。English: Caller-owned local selected value, with runtime default 0. */
  modelValue?: UChoiceValue;
  /** 中文：调用方声明的有限静态 tab 项。English: Finite static tab items declared by the caller. */
  items?: ReadonlyArray<string | UTabbarItem>;
}

/**
 * @lang zh-CN 描述 `UNoticeBar` 的 caller-controlled 横幅表面；它不是全局消息队列或自动滚动服务。
 * @lang en Describes the caller-controlled banner surface of `UNoticeBar`; it is neither a global message queue nor an auto-scrolling service.
 */
export interface UNoticeBarProps {
  /** 中文：既有 HIA 显式可见性 alias。English: Existing explicit HIA visibility alias. */
  visible?: boolean;
  /** 中文：本地输出的上游熟悉可见性开关。English: Upstream-familiar visibility control for local output. */
  show?: boolean;
  /** 中文：调用方拥有的横幅正文。English: Caller-owned banner body. */
  text?: string;
  /** 中文：有限展示 tone；未知值回退到 info。English: Finite presentation tone; unknown values fall back to info. */
  tone?: 'info' | 'success' | 'warning' | 'error' | string;
  /** 中文：非空时显示 close control；组件不生成默认本地化文字。English: Shows a close control when nonempty; the component generates no default localized copy. */
  closeText?: string;
}

/**
 * @lang zh-CN 描述 `UPicker` 单列 option 的声明式本地结构；它不是日期、地区、远端或多列 picker contract。
 * @lang en Describes the declarative local shape of a single-column `UPicker` option; it is not a date, region, remote, or multi-column picker contract.
 */
export interface UPickerOption {
  /** 中文：可见文字。English: Visible text. */
  label?: string | number;
  /** 中文：透明本地值。English: Transparent local value. */
  value?: UChoiceValue;
  /** 中文：是否禁止选择该 option。English: Whether selection of this option is prevented. */
  disabled?: boolean;
}

/**
 * @lang zh-CN 描述 `UPicker` 的有限单列受控草稿/确认表面；其同名 `modelValue` 不等同于上游 popup、地区、时间或多列状态语义。
 * @lang en Describes the finite single-column controlled draft/confirm surface of `UPicker`; its same-name `modelValue` is not equivalent to upstream popup, region, time, or multi-column state semantics.
 */
export interface UPickerProps {
  /** 中文：调用方拥有的已确认值。English: Caller-owned confirmed value. */
  modelValue?: UChoiceValue;
  /** 中文：有限单列 option；原始 string/number 同样可用。English: Finite single-column options; primitive strings/numbers are also accepted. */
  columns?: ReadonlyArray<UChoiceValue | UPickerOption>;
  /** 中文：本地标题。English: Local title. */
  title?: string;
  /** 中文：调用方提供的确认文字。English: Caller-provided confirm text. */
  confirmText?: string;
  /** 中文：调用方提供的取消文字。English: Caller-provided cancel text. */
  cancelText?: string;
  /** 中文：是否阻止本地 option/action 操作。English: Whether to prevent local option/action interaction. */
  disabled?: boolean;
}

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
 * @lang zh-CN 当前受审计的 choice/navigation/feedback/form/input 组件保持精确 props、事件和必要实例声明；其余导出采用 `UViewComponent` 基线，等待逐项 API 审计。
 * @lang en Current audited choice/navigation/feedback/form/input components retain precise props, events, and required instance declarations; the remaining exports use the `UViewComponent` baseline pending per-item API audit.
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
export declare const UCheckbox: DefineComponent<UCheckboxProps>;
/** @lang zh-CN 受控多选 group 组件。 @lang en Controlled multi-choice group component. */
export declare const UCheckboxGroup: DefineComponent<UCheckboxGroupProps>;
/** @lang zh-CN 受控单选项组件。 @lang en Controlled single-choice item component. */
export declare const URadio: DefineComponent<URadioProps>;
/** @lang zh-CN 受控单选 group 组件。 @lang en Controlled single-choice group component. */
export declare const URadioGroup: DefineComponent<URadioGroupProps>;
/** @lang zh-CN 受控布尔选择组件。 @lang en Controlled boolean-choice component. */
export declare const USwitch: DefineComponent<USwitchProps>;
/** @lang zh-CN 局部、非路由 tabbar 组件。 @lang en Local non-routing tabbar component. */
export declare const UTabbar: DefineComponent<UTabbarProps>;
/** @lang zh-CN caller-controlled 非滚动横幅组件。 @lang en Caller-controlled non-scrolling banner component. */
export declare const UNoticeBar: DefineComponent<UNoticeBarProps>;
/** @lang zh-CN 有限单列本地 picker 组件。 @lang en Finite single-column local picker component. */
export declare const UPicker: DefineComponent<UPickerProps>;
/** @lang zh-CN caller-controlled 局部提示条组件。 @lang en Caller-controlled local alert-strip component. */
export declare const UAlertTips: DefineComponent<UAlertTipsProps>;
/** @lang zh-CN 有限 token 化文字标签组件。 @lang en Finite tokenized text-tag component. */
export declare const UTag: DefineComponent<UTagProps>;

/**
 * @lang zh-CN 以下运行时命名导出均已存在，但尚未承诺逐 prop、事件 payload、slot props、expose signature、父子 context 或全局 bus 的完整 TypeScript 形状。
 * @lang en The following runtime named exports already exist, but do not yet promise complete TypeScript shapes for every prop, event payload, slot prop, expose signature, parent-child context, or global bus.
 */
export declare const UActionSheet: UViewComponent;
export declare const UActionSheetItem: UViewComponent;
export declare const UAvatar: UViewComponent;
export declare const UAvatarCropper: UViewComponent;
export declare const UBackTop: UViewComponent;
export declare const UBadge: UViewComponent;
export declare const UButton: UViewComponent;
export declare const UCalendar: UViewComponent;
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
export declare const UDropdown: UViewComponent;
export declare const UDropdownItem: UViewComponent;
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
export declare const UMask: UViewComponent;
export declare const UMessageInput: UViewComponent;
export declare const UModal: UViewComponent;
export declare const UNavBar: UViewComponent;
export declare const UNavbar: UViewComponent;
export declare const UNoNetwork: UViewComponent;
export declare const UNotice: UViewComponent;
export declare const UNumberBox: UViewComponent;
export declare const UNumberKeyboard: UViewComponent;
export declare const UPagination: UViewComponent;
export declare const UPopup: UViewComponent;
export declare const URate: UViewComponent;
export declare const UReadMore: UViewComponent;
export declare const URootPortal: UViewComponent;
export declare const URow: UViewComponent;
export declare const URowNotice: UViewComponent;
export declare const USafeBottom: UViewComponent;
export declare const UScrollList: UViewComponent;
export declare const USection: UViewComponent;
export declare const USelect: UViewComponent;
export declare const USkeleton: UViewComponent;
export declare const USlider: UViewComponent;
export declare const UStack: UViewComponent;
export declare const UStatusBar: UViewComponent;
export declare const UStep: UViewComponent;
export declare const USteps: UViewComponent;
export declare const USticky: UViewComponent;
export declare const USubsection: UViewComponent;
export declare const USwipeAction: UViewComponent;
export declare const USwiper: UViewComponent;
export declare const UTable: UViewComponent;
export declare const UTabs: UViewComponent;
export declare const UTabsSwiper: UViewComponent;
export declare const UTd: UViewComponent;
export declare const UText: UViewComponent;
export declare const UTh: UViewComponent;
export declare const UTimeLine: UViewComponent;
export declare const UTimeLineItem: UViewComponent;
export declare const UToast: UViewComponent;
export declare const UTopTips: UViewComponent;
export declare const UTr: UViewComponent;
export declare const UTransition: UViewComponent;
export declare const UUpload: UViewComponent;
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
