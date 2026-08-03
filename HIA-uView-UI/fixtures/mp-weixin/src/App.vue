<!--
@lang zh-CN mp-weixin 编译 fixture 的最小应用外壳；由输入根 App 显式导入 HIA 默认主题和组件规则，不声明跨端或真机能力。
@lang en Minimal application shell for the mp-weixin compile fixture; the input-root App explicitly imports HIA default theme and component rules, and this shell declares no cross-platform or device capability.
-->
<script>
export default {
  // <lang><zh-CN>保留空 launch lifecycle 以满足最小 UniApp 壳形状；它不读取平台信息、注册服务、写 storage 或启动异步工作。</zh-CN><en>Retains an empty launch lifecycle to satisfy the minimal UniApp shell shape; it reads no platform information, registers no service, writes no storage, and starts no asynchronous work.</en></lang>
  onLaunch() {}
};
</script>
