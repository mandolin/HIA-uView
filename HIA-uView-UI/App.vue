<!--
@lang zh-CN 仅供本仓 mp-weixin compiler fixture 使用的输入根 App 壳；它复用 fixture 本身的无副作用 lifecycle，并显式引入完整 UI 样式入口。
@lang en Input-root App shell used only by this repository's mp-weixin compiler fixture; it reuses the fixture's side-effect-free lifecycle and explicitly imports the complete UI style entry.
-->
<script>
import FixtureApp from './fixtures/mp-weixin/src/App.vue';

// <lang><zh-CN>输入根壳不添加 lifecycle、状态、service 或平台行为，只转交 fixture 自己的最小 App 对象。</zh-CN><en>The input-root shell adds no lifecycle, state, service, or platform behavior and only delegates the fixture's own minimal App object.</en></lang>
export default FixtureApp;
</script>

<style>
/* <lang><zh-CN>样式必须从官方 compiler 的输入根导入，才能稳定写入微信小程序 app WXSS；该入口不加载网络、字体、图标或外部资产。</zh-CN><en>Styles must be imported from the official compiler input root to reliably enter WeChat Mini Program app WXSS; this entry loads no network, font, icon, or external asset.</en></lang> */
@import "./src/style.css";
</style>
