<!--
@lang zh-CN mp-weixin 编译 fixture 的最小应用外壳；仅导入 HIA 默认主题，不声明跨端或真机能力。
@lang en Minimal application shell for the mp-weixin compile fixture; imports only the HIA default theme and declares no cross-platform or device capability.
-->
<script>
export default {
  // <lang><zh-CN>保留空 launch lifecycle 以满足最小 UniApp 壳形状；它不读取平台信息、注册服务、写 storage 或启动异步工作。</zh-CN><en>Retains an empty launch lifecycle to satisfy the minimal UniApp shell shape; it reads no platform information, registers no service, writes no storage, and starts no asynchronous work.</en></lang>
  onLaunch() {}
};
</script>

<style>
/* <lang><zh-CN>fixture 只导入本仓默认浅色主题，使组件 token 有可编译来源；不引入外部字体、图标或品牌资源。</zh-CN><en>The fixture imports only the repository default light theme so component tokens have a compilable source; it imports no external font, icon, or brand asset.</en></lang> */
@import "../../../src/theme/hia-light.css";
</style>
