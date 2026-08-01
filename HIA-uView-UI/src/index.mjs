/**
 * @module hia-uview-ui
 * @lang zh-CN 提供 HIA-uView UI 的私有 runtime entry：显式命名组件导出与 Vue plugin。模块导入本身不注册组件、不注入样式，也不读取应用或平台状态。
 * @lang en Provides the private HIA-uView UI runtime entry: explicit named component exports and a Vue plugin. Importing this module itself registers no component, injects no style, and reads no application or platform state.
 */

// <lang><zh-CN>导入当前已批准的独立组件实现；每个组件仍由调用方直接导入或通过显式 plugin 选择注册。</zh-CN><en>Imports the currently approved independent component implementations; callers still choose direct imports or explicit plugin registration for every component.</en></lang>
import UButton from './components/u-button/u-button.vue';
import UActionSheet from './components/u-action-sheet/u-action-sheet.vue';
import UCell from './components/u-cell/u-cell.vue';
import UCheckbox from './components/u-checkbox/u-checkbox.vue';
import UCheckboxGroup from './components/u-checkbox-group/u-checkbox-group.vue';
import UCollapse from './components/u-collapse/u-collapse.vue';
import UCollapseItem from './components/u-collapse-item/u-collapse-item.vue';
import UEmpty from './components/u-empty/u-empty.vue';
import UField from './components/u-field/u-field.vue';
import UForm from './components/u-form/u-form.vue';
import UFormItem from './components/u-form-item/u-form-item.vue';
import UIcon from './components/u-icon/u-icon.vue';
import UImage from './components/u-image/u-image.vue';
import UAvatar from './components/u-avatar/u-avatar.vue';
import UInput from './components/u-input/u-input.vue';
import UModal from './components/u-modal/u-modal.vue';
import UNavBar from './components/u-nav-bar/u-nav-bar.vue';
import UNotice from './components/u-notice/u-notice.vue';
import UNumberBox from './components/u-number-box/u-number-box.vue';
import UPagination from './components/u-pagination/u-pagination.vue';
import UPopup from './components/u-popup/u-popup.vue';
import UTag from './components/u-tag/u-tag.vue';
import UBadge from './components/u-badge/u-badge.vue';
import UDivider from './components/u-divider/u-divider.vue';
import UCountTo from './components/u-count-to/u-count-to.vue';
import ULineProgress from './components/u-line-progress/u-line-progress.vue';
import UList from './components/u-list/u-list.vue';
import ULoadmore from './components/u-loadmore/u-loadmore.vue';
import ULoadingPage from './components/u-loading-page/u-loading-page.vue';
import URadio from './components/u-radio/u-radio.vue';
import URadioGroup from './components/u-radio-group/u-radio-group.vue';
import URate from './components/u-rate/u-rate.vue';
import USearch from './components/u-search/u-search.vue';
import UScrollList from './components/u-scroll-list/u-scroll-list.vue';
import USkeleton from './components/u-skeleton/u-skeleton.vue';
import UStack from './components/u-stack/u-stack.vue';
import USteps from './components/u-steps/u-steps.vue';
import USticky from './components/u-sticky/u-sticky.vue';
import USwiper from './components/u-swiper/u-swiper.vue';
import USwitch from './components/u-switch/u-switch.vue';
import UTabbar from './components/u-tabbar/u-tabbar.vue';
import UTabs from './components/u-tabs/u-tabs.vue';
import UTextarea from './components/u-textarea/u-textarea.vue';
import UToast from './components/u-toast/u-toast.vue';
import UValidationMessage from './components/u-validation-message/u-validation-message.vue';

/**
 * @lang zh-CN 显式 plugin 可注册的稳定模板名称与组件实现映射。该只读集合必须与 component manifest 一致；manifest 继续只服务开发期声明验证，不承担 runtime registry 职责。
 * @lang en Stable template-name and implementation mapping registerable by the explicit plugin. This read-only collection must match the component manifest; the manifest remains for development-time declaration validation and is not a runtime registry.
 */
export const UVIEW_COMPONENTS = Object.freeze([
  // <lang><zh-CN>action sheet 只呈现调用方声明的有限 item 和 local intent，不执行命令或导航。</zh-CN><en>The action sheet presents caller-declared finite items and local intent only and executes no command or navigation.</en></lang>
  Object.freeze({ name: 'u-action-sheet', component: UActionSheet }),
  // <lang><zh-CN>按钮保留 P10/P11 已验证的独立本地操作边界。</zh-CN><en>The button retains the independently verified local-action boundary from P10/P11.</en></lang>
  Object.freeze({ name: 'u-button', component: UButton }),
  // <lang><zh-CN>信息行只展示调用方文字并 emit 受限 click 意图。</zh-CN><en>The information row displays caller text only and emits constrained click intent.</en></lang>
  Object.freeze({ name: 'u-cell', component: UCell }),
  // <lang><zh-CN>checkbox 只呈现调用方受控 checked/value 意图；group 协调由相邻 `u-checkbox-group` 显式提供。</zh-CN><en>The checkbox presents caller-controlled checked and value intent only; group coordination is explicitly provided by adjacent `u-checkbox-group`.</en></lang>
  Object.freeze({ name: 'u-checkbox', component: UCheckbox }),
  // <lang><zh-CN>checkbox group 只计算新的字符串集合并 emit，不拥有表单、提交或业务全选语义。</zh-CN><en>The checkbox group computes and emits a new string set only and owns no form, submission, or business select-all semantics.</en></lang>
  Object.freeze({ name: 'u-checkbox-group', component: UCheckboxGroup }),
  // <lang><zh-CN>折叠父级只提供调用方受控 open values 的局部 context，不执行动画或业务流程。</zh-CN><en>The collapse parent provides local context for caller-controlled open values only and performs no animation or business flow.</en></lang>
  Object.freeze({ name: 'u-collapse', component: UCollapse }),
  // <lang><zh-CN>折叠子项只呈现标题/slot 并报告 toggle intent，不拥有父级集合。</zh-CN><en>The collapse item presents title/slot and reports toggle intent only; it owns no parent collection.</en></lang>
  Object.freeze({ name: 'u-collapse-item', component: UCollapseItem }),
  // <lang><zh-CN>空态只展示调用方文字并 emit 可选 action 意图，不读取数据或加载状态。</zh-CN><en>The empty state displays caller text only and emits optional action intent without reading data or loading state.</en></lang>
  Object.freeze({ name: 'u-empty', component: UEmpty }),
  // <lang><zh-CN>字段结构只组织调用方标签、插槽、帮助和独立消息，不拥有表单模型或规则生命周期。</zh-CN><en>The field structure organizes caller label, slot, help, and independent message only and owns no form model or rule lifecycle.</en></lang>
  Object.freeze({ name: 'u-field', component: UField }),
  // <lang><zh-CN>表单区域只提供布局和显式 submit/reset intent，不拥有字段 registry 或规则执行。</zh-CN><en>The form region provides layout and explicit submit/reset intent only and owns no field registry or rule execution.</en></lang>
  Object.freeze({ name: 'u-form', component: UForm }),
  // <lang><zh-CN>表单项只组织标签、帮助和应用声明消息，嵌入控件仍由调用方控制。</zh-CN><en>The form item organizes label, help, and caller-declared message only while the embedded control remains caller-controlled.</en></lang>
  Object.freeze({ name: 'u-form-item', component: UFormItem }),
  // <lang><zh-CN>图标仅呈现调用方文字符号或 slot，不加载字体、图片或 icon registry。</zh-CN><en>The icon presents caller text or slot only and loads no font, image, or icon registry.</en></lang>
  Object.freeze({ name: 'u-icon', component: UIcon }),
  // <lang><zh-CN>图片只呈现调用方 src、尺寸、替代文字和错误 intent，不拥有请求或缓存。</zh-CN><en>The image presents caller src, size, alt text, and error intent only and owns no request or cache.</en></lang>
  Object.freeze({ name: 'u-image', component: UImage }),
  // <lang><zh-CN>头像只提供图片或 initials 占位，不解释身份、性别或等级。</zh-CN><en>The avatar provides image or initials placeholder only and interprets no identity, sex, or level.</en></lang>
  Object.freeze({ name: 'u-avatar', component: UAvatar }),
  // <lang><zh-CN>受控输入只显示调用方字符串并 emit 未修改的本地输入意图。</zh-CN><en>The controlled input displays caller string only and emits unmodified local input intent.</en></lang>
  Object.freeze({ name: 'u-input', component: UInput }),
  // <lang><zh-CN>modal 只呈现调用方 visible/内容与 confirm/cancel 意图，不自动关闭或管理焦点。</zh-CN><en>The modal presents caller visible/content and confirm/cancel intent only and neither auto-closes nor manages focus.</en></lang>
  Object.freeze({ name: 'u-modal', component: UModal }),
  // <lang><zh-CN>导航栏只展示标题/文字 control 并 emit back/action 意图。</zh-CN><en>The navigation bar displays title/text controls only and emits back/action intent.</en></lang>
  Object.freeze({ name: 'u-nav-bar', component: UNavBar }),
  // <lang><zh-CN>notice 只呈现调用方 message/tone 与可选 dismiss 意图，不创建全局 service 或定时器。</zh-CN><en>The notice presents caller message/tone and optional dismiss intent only and creates no global service or timer.</en></lang>
  Object.freeze({ name: 'u-notice', component: UNotice }),
  // <lang><zh-CN>数值盒只进行受边界保护的本地加减和输入 intent，不理解单位、库存或业务精度。</zh-CN><en>The number box performs bounded local increment/decrement and input intent only and understands no unit, inventory, or business precision.</en></lang>
  Object.freeze({ name: 'u-number-box', component: UNumberBox }),
  // <lang><zh-CN>分页只投影调用方 pageCount/current，不请求或缓存数据。</zh-CN><en>Pagination projects caller pageCount/current only and requests or caches no data.</en></lang>
  Object.freeze({ name: 'u-pagination', component: UPagination }),
  // <lang><zh-CN>浮层只提供局部 visible、slot 和 close intent，不拥有焦点、滚动或路由。</zh-CN><en>The popup provides local visible, slot, and close intent only and owns no focus, scrolling, or routing.</en></lang>
  Object.freeze({ name: 'u-popup', component: UPopup }),
  // <lang><zh-CN>标签只呈现有限 tone/size/shape 和 close intent，不拥有分类 registry。</zh-CN><en>The tag presents finite tone/size/shape and close intent only and owns no category registry.</en></lang>
  Object.freeze({ name: 'u-tag', component: UTag }),
  // <lang><zh-CN>徽标只呈现调用方文字或 dot，不读取通知或创建全局服务。</zh-CN><en>The badge presents caller text or dot only and reads no notifications or creates global services.</en></lang>
  Object.freeze({ name: 'u-badge', component: UBadge }),
  // <lang><zh-CN>分隔只提供局部方向、线条和 slot 文字，不推断页面层级。</zh-CN><en>The divider provides local direction, lines, and slot text only and infers no page hierarchy.</en></lang>
  Object.freeze({ name: 'u-divider', component: UDivider }),
  // <lang><zh-CN>数字呈现是同步格式投影，不使用计时器、动画或自动完成事件。</zh-CN><en>Numeric presentation is a synchronous formatting projection with no timer, animation, or auto-completion event.</en></lang>
  Object.freeze({ name: 'u-count-to', component: UCountTo }),
  // <lang><zh-CN>进度条只投影调用方百分比，不连接上传、下载或任务状态。</zh-CN><en>The progress bar projects caller percentage only and connects to no upload, download, or task state.</en></lang>
  Object.freeze({ name: 'u-line-progress', component: ULineProgress }),
  // <lang><zh-CN>列表只呈现调用方有限行与 select intent，不请求、缓存或虚拟化。</zh-CN><en>The list presents caller-declared finite rows and select intent only, with no request, cache, or virtualization.</en></lang>
  Object.freeze({ name: 'u-list', component: UList }),
  // <lang><zh-CN>加载更多只呈现受控状态并在 more 时报告 intent，不执行分页请求。</zh-CN><en>Loadmore presents controlled status and reports intent in more state only; it executes no paging request.</en></lang>
  Object.freeze({ name: 'u-loadmore', component: ULoadmore }),
  // <lang><zh-CN>页面 loading 是调用方控制的静态文字呈现，不推断异步状态或自动隐藏。</zh-CN><en>Page loading is caller-controlled static copy and infers no async state or automatic hiding.</en></lang>
  Object.freeze({ name: 'u-loading-page', component: ULoadingPage }),
  // <lang><zh-CN>radio 只呈现调用方受控单选意图；它不取消已选项，也不持有 option 数据。</zh-CN><en>The radio presents caller-controlled single-choice intent only; it neither clears a selected item nor owns option data.</en></lang>
  Object.freeze({ name: 'u-radio', component: URadio }),
  // <lang><zh-CN>radio group 只向直接子 radio 提供受控上下文并 emit 选择意图，不创建 picker、popup 或全局选择服务。</zh-CN><en>The radio group provides controlled context to direct child radios and emits selection intent only; it creates no picker, popup, or global selection service.</en></lang>
  Object.freeze({ name: 'u-radio-group', component: URadioGroup }),
  // <lang><zh-CN>评分只呈现文本符号和整数选择 intent，不提交评价或生成业务分数。</zh-CN><en>The rate presents text symbols and integer-selection intent only and submits no review or business score.</en></lang>
  Object.freeze({ name: 'u-rate', component: URate }),
  // <lang><zh-CN>搜索只组合受控文本与 search/clear intent，不请求、去重或生成结果。</zh-CN><en>The search control composes controlled text and search/clear intent only and performs no request, deduplication, or result generation.</en></lang>
  Object.freeze({ name: 'u-search', component: USearch }),
  // <lang><zh-CN>横向列表只使用局部 CSS overflow，不引入 WXS、BindingX 或 native plugin。</zh-CN><en>The horizontal list uses local CSS overflow only and introduces no WXS, BindingX, or native plugin.</en></lang>
  Object.freeze({ name: 'u-scroll-list', component: UScrollList }),
  // <lang><zh-CN>骨架只呈现静态 placeholder，不播放动画、测量 DOM 或等待异步。</zh-CN><en>The skeleton presents static placeholders only and does not animate, measure DOM, or await async work.</en></lang>
  Object.freeze({ name: 'u-skeleton', component: USkeleton }),
  // <lang><zh-CN>布局原语只排列默认插槽，不拥有页面或子项语义。</zh-CN><en>The layout primitive arranges the default slot only and owns no page or child semantics.</en></lang>
  Object.freeze({ name: 'u-stack', component: UStack }),
  // <lang><zh-CN>步骤只呈现调用方声明的有限序列，不执行流程或自动推进。</zh-CN><en>Steps presents a caller-declared finite sequence only and executes no flow or automatic advancement.</en></lang>
  Object.freeze({ name: 'u-steps', component: USteps }),
  // <lang><zh-CN>吸顶只投影标准 CSS sticky；调用方负责目标平台支持判断。</zh-CN><en>Sticky projects standard CSS sticky only; the caller owns target-platform support decisions.</en></lang>
  Object.freeze({ name: 'u-sticky', component: USticky }),
  // <lang><zh-CN>轮播只呈现静态 slide 与显式前后选择，不使用 autoplay、timer 或媒体源。</zh-CN><en>The swiper presents static slides and explicit previous/next selection only, using no autoplay, timer, or media source.</en></lang>
  Object.freeze({ name: 'u-swiper', component: USwiper }),
  // <lang><zh-CN>切换只回传受控布尔选择，不执行权限、持久化或远程更新。</zh-CN><en>The switch returns controlled boolean selection only and performs no authorization, persistence, or remote update.</en></lang>
  Object.freeze({ name: 'u-switch', component: USwitch }),
  // <lang><zh-CN>底部标签栏只回传局部选择，不执行 router、身份或全局导航。</zh-CN><en>The bottom tabbar returns local selection only and performs no router, identity, or global navigation.</en></lang>
  Object.freeze({ name: 'u-tabbar', component: UTabbar }),
  // <lang><zh-CN>标签栏只回传受控切换，不请求、懒加载或管理隐藏面板。</zh-CN><en>The tab strip returns controlled changes only and requests, lazy-loads, or manages no hidden panel.</en></lang>
  Object.freeze({ name: 'u-tabs', component: UTabs }),
  // <lang><zh-CN>多行输入只回传受控字符串和焦点/确认 intent，不执行校验、提交或持久化。</zh-CN><en>The textarea returns controlled string and focus/confirm intent only and performs no validation, submission, or persistence.</en></lang>
  Object.freeze({ name: 'u-textarea', component: UTextarea }),
  // <lang><zh-CN>toast 只呈现调用方受控反馈，不使用 timer、队列或全局 service。</zh-CN><en>The toast presents caller-controlled feedback only and uses no timer, queue, or global service.</en></lang>
  Object.freeze({ name: 'u-toast', component: UToast }),
  // <lang><zh-CN>独立校验消息只呈现应用声明的状态和文字，不推断结果或启动异步工作。</zh-CN><en>The independent validation message presents application-declared state and text only and infers no result or starts no asynchronous work.</en></lang>
  Object.freeze({ name: 'u-validation-message', component: UValidationMessage })
]);

/**
 * @lang zh-CN 将当前组件集合显式注册到一个 Vue application。调用者控制 `app.use` 时机；本函数不导入样式、不自动安装、不访问路由、Tool、网络或全局平台状态。
 * @lang en Explicitly registers the current component collection on one Vue application. Callers control when `app.use` runs; this function imports no style, auto-installs nothing, and accesses no route, Tool, network, or global platform state.
 * @param {{ component: (name: string, implementation: unknown) => unknown }} application <lang><zh-CN>具有 Vue `component(name, implementation)` 注册能力的应用实例。</zh-CN><en>Application instance exposing Vue `component(name, implementation)` registration capability.</en></lang>
 * @returns {typeof application} <lang><zh-CN>同一应用实例，便于调用方显式链式使用。</zh-CN><en>The same application instance, enabling explicit caller-side chaining.</en></lang>
 * @throws {TypeError} <lang><zh-CN>应用实例缺失或不具有组件注册函数时抛出。</zh-CN><en>Thrown when the application is absent or has no component-registration function.</en></lang>
 */
export function installUView(application) {
  // <lang><zh-CN>在注册前验证最小 Vue application 表面，避免对任意对象产生部分注册副作用。</zh-CN><en>Validates the minimum Vue application surface before registration, avoiding partial registration side effects on arbitrary objects.</en></lang>
  if (!application || typeof application.component !== 'function') {
    throw new TypeError('UView install requires a Vue application with component(name, implementation).');
  }

  // <lang><zh-CN>按冻结集合的声明顺序注册每个模板名；解构出的 name 和 component 始终来自经过审阅的本地 registry。</zh-CN><en>Registers every template name in declared frozen-collection order; destructured name and component always come from the reviewed local registry.</en></lang>
  for (const { name, component } of UVIEW_COMPONENTS) {
    // <lang><zh-CN>以一对一的模板名和实现执行 Vue 注册；每次调用只影响调用方传入的 application 实例。</zh-CN><en>Register Vue with one template-name and implementation pair; each call affects only the application instance passed by the caller.</en></lang>
    application.component(name, component);
  }

  // <lang><zh-CN>返回原应用实例而非创建包装对象，保持 Vue plugin 的显式且可预测的生命周期。</zh-CN><en>Returns the original application rather than creating a wrapper, preserving an explicit and predictable Vue-plugin lifecycle.</en></lang>
  return application;
}

/**
 * @lang zh-CN 供 `app.use(UView)` 显式调用的私有 Vue plugin。它只委托 `installUView`，绝不自动加载 theme/style entry。
 * @lang en Private Vue plugin for explicit `app.use(UView)` calls. It delegates only to `installUView` and never loads the theme/style entry automatically.
 */
export const UView = Object.freeze({
  // <lang><zh-CN>plugin 的唯一生命周期入口保持为显式 install 函数，避免 import-time 注册或隐式全局状态。</zh-CN><en>The plugin's sole lifecycle entry remains the explicit install function, avoiding import-time registration or implicit global state.</en></lang>
  install: installUView
});

// <lang><zh-CN>导出命名组件供应用按需注册；默认导出保持显式 plugin 入口，二者均不产生 import-time 副作用。</zh-CN><en>Exports named components for application-side registration; the default export remains the explicit plugin entry, and neither creates import-time side effects.</en></lang>
export { UActionSheet, UButton, UCell, UCheckbox, UCheckboxGroup, UCollapse, UCollapseItem, UEmpty, UField, UForm, UFormItem, UIcon, UImage, UAvatar, UInput, ULineProgress, UList, ULoadmore, ULoadingPage, UModal, UNavBar, UNotice, UNumberBox, UPagination, UPopup, UTag, UBadge, UDivider, UCountTo, URadio, URadioGroup, URate, USearch, UScrollList, USkeleton, UStack, USteps, USticky, USwiper, USwitch, UTabbar, UTabs, UTextarea, UToast, UValidationMessage };
export default UView;
