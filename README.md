# 快速跑通TCCC uni-app Demo
本文主要介绍如何快速跑通腾讯云 TCCC uni-app Demo。

## 开发环境要求
- 建议使用最新的 HBuilderX 编辑器 。
- iOS 9.0 或以上版本且支持音频的 iOS 设备。
- Android 版本不低于 4.1 且支持音频的 Android 设备，暂不支持模拟器。并请开启允许调试选项。
- iOS/Android 设备已经连接到 Internet。


## 前提条件
- 您已 [注册腾讯云](https://cloud.tencent.com/document/product/378/17985) 账号，并完成 [实名认证](https://cloud.tencent.com/document/product/378/3629) 。
- 您已 [开通云呼叫中心](https://cloud.tencent.com/document/product/679/48028#.E6.AD.A5.E9.AA.A41.EF.BC.9A.E5.87.86.E5.A4.87.E5.B7.A5.E4.BD.9C) 服务，并创建了 [云呼叫中心实例](https://cloud.tencent.com/document/product/679/48028#.E6.AD.A5.E9.AA.A42.EF.BC.9A.E5.88.9B.E5.BB.BA.E4.BA.91.E5.91.BC.E5.8F.AB.E4.B8.AD.E5.BF.83.E5.AE.9E.E4.BE.8B) 。
- 您已购买了号码，[查看购买指南](https://cloud.tencent.com/document/product/679/73526)。并且完成了对应的[IVR配置](https://cloud.tencent.com/document/product/679/73549)

## 操作步骤

[](id:step1)
### 步骤1：下载 tccc-agent-uniapp-example 源码
  根据实际业务需求 [tccc-agent-uniapp-example](https://github.com/TencentCloud/tccc-agent-uniapp-example) 源码。

[](id:step2)
### 步骤2：安装依赖

- 安装npm包依赖

```
npm i tccc-workstation-sdk
```

- 安装uni-ui

用HBuilderX导入[uni-ui](https://ext.dcloud.net.cn/plugin?id=55)

[](id:step3)

### 步骤3：配置 tccc-agent-uniapp-example 工程文件
1. 找到并打开 debug/genTestToken.js 文件。

2. 设置 genTestToken.js 文件中的相关参数：
<ul>
  <li/>USERID：座席账号，格式为 ： xxx@qq.com
  <li/>SDKAPPID：腾讯云呼叫中心 SDKAppId，需要替换为您自己账号下的 SDKAppId
	<li/>SECRETID：计算签名用的加密密钥ID。
  <li/>SECRETKEY：计算签名用的加密密钥Key。
</ul>


![](https://tccc.qcloud.com/assets/doc/Agent/uniapp_images/gen_token.png)


> ! 请不要将如下代码发布到您的线上正式版本的 App 中，原因如下：
 - 本文件中的代码虽然能够正确计算出 Token，但仅适合快速调通 SDK 的基本功能，**不适合线上产品**，这是因为客户端代码中的 SECRETKEY 很容易被反编译逆向破解，尤其是 Web 端的代码被破解的难度几乎为零。一旦您的密钥泄露，攻击者就可以计算出正确的 Token 来盗用您的腾讯云流量。 
 - 正确的做法是将 Token 的计算代码和加密密钥放在您的业务服务器上，然后由 App 按需向您的服务器获取实时算出的 Token。由于破解服务器的成本要高于破解客户端 App，所以服务器计算的方案能够更好地保护您的加密密钥。更多详情请参见[创建 SDK 登录 Token](https://cloud.tencent.com/document/product/679/49227)


### 步骤4：编译

使用自定义基座打包 uni 原生插件（请使用真机运行自定义基座）

	![](https://tccc.qcloud.com/assets/doc/Agent/uniapp_images/uniapp_run_demo.png)

> ! 什么是自定义调试基座及使用说明,请参见[官方教程](https://uniapp.dcloud.net.cn/tutorial/run/run-app.html#customplayground)


### 步骤5：运行

1. 选择在真机运行后，点击登录。

2. 登录成功后输入需要拨打的手机号即可完成拨打功能。


### 运行效果

基本功能如下图所示

| 登录页面 | 号码管理页面 | 拨打页面 | 
|-----|-----|-----|
|<img src="https://tccc.qcloud.com/assets/doc/Agent/uniapp_images/Demo_login.jpeg" style="width:200px;height:200px">|<img src="https://tccc.qcloud.com/assets/doc/Agent/uniapp_images/Demo_number.jpeg" style="width:200px;height:200px" >|<img src="https://tccc.qcloud.com/assets/doc/Agent/uniapp_images/Demo_Call.jpeg" style="width:200px;height:200px" >|



## 其他

- [快速集成SDK](QuickStartSDK.md)
- [API 概览以及示例](api.md)