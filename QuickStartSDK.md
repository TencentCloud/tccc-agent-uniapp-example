# 快速集成腾讯云呼叫中心TCCC Uni-app SDK
本文主要介绍如何快速地将腾讯云 TCCC uni-app SDK 集成到您的项目中。

## 开发环境要求
- 建议使用最新的 HBuilderX 编辑器 。
- iOS 9.0 或以上版本且支持音频的 iOS 设备。
- Android 版本不低于 4.1 且支持音频的 Android 设备，暂不支持模拟器。并请开启允许调试选项。
- iOS/Android 设备已经连接到 Internet。

## 接入前提
- 您已 [注册腾讯云](https://cloud.tencent.com/document/product/378/17985) 账号，并完成 [实名认证](https://cloud.tencent.com/document/product/378/3629) 。
- 您已 [开通云呼叫中心](https://cloud.tencent.com/document/product/679/48028#.E6.AD.A5.E9.AA.A41.EF.BC.9A.E5.87.86.E5.A4.87.E5.B7.A5.E4.BD.9C) 服务，并创建了 [云呼叫中心实例](https://cloud.tencent.com/document/product/679/48028#.E6.AD.A5.E9.AA.A42.EF.BC.9A.E5.88.9B.E5.BB.BA.E4.BA.91.E5.91.BC.E5.8F.AB.E4.B8.AD.E5.BF.83.E5.AE.9E.E4.BE.8B) 。
- 您已购买了号码，[查看购买指南](https://cloud.tencent.com/document/product/679/73526)。并且完成了对应的[IVR配置](https://cloud.tencent.com/document/product/679/73549)


## 关键概念


1. **SdkAppId**：是用户在 [腾讯云呼叫中心控制台](https://console.cloud.tencent.com/ccc) 上创建的应用 ID，称之为 SdkAppId，一个腾讯云账号最多可以创建20个腾讯呼叫中心应用，通常为140开头。
[](id:SdkAppId)


2. **UserID** ：座席或管理员在腾讯云呼叫中心内配置的账号，通常为邮箱格式，首次创建应用，主账号可前往 [站内信](https://console.cloud.tencent.com/message)（子账号需订阅云呼叫中心产品消息） 查看呼叫中心管理员账号和密码。一个 SDKAppID 下可以配置多个 UserID，如果超出配置数量限制，需到 [座席购买页](https://buy.cloud.tencent.com/ccc_seat) 购买更多座席数量。
[](id:UserID)


3. **SecretId 和 SecretKey**：开发者调用云 API 所需凭证，通过 [腾讯云控制台](https://console.cloud.tencent.com/cam/capi) 创建。
[](id:SecretId)


4. **token**: 登录票据，需要调用云API接口[**CreateSDKLoginToken**](https://cloud.tencent.com/document/api/679/49227)来获取。正确的做法是将 Token 的计算代码和加密密钥放在您的业务服务器上，然后由 App 按需向您的服务器获取实时算出的 Token。
[](id:token)

## 集成 SDK

1. 通过 npm 方式将 TCCC SDK 集成到您 uni-app 项目中。
```js
npm i tccc-sdk-uniapp
```

2. 购买 uni-app SDK 插件

	登录 [uni 原生插件市场](https://ext.dcloud.net.cn/plugin?id=11219)，在插件详情页中购买（免费插件也可以在插件市场 0 元购）。购买后才能够云端打包使用插件。**购买插件时请选择正确的 appid，以及绑定正确包名**。
	
	![](https://tccc.qcloud.com/assets/doc/Agent/uniapp_images/uniapp_tccc_pugin.png)

3. 配置权限

	编辑**manifest.json**文件,配置麦克风权限，具体如下：
	- ios 需要以下权限

		Privacy - Microphone Usage Description，并填入麦克风使用目的提示语。
		![](https://tccc.qcloud.com/assets/doc/Agent/uniapp_images/ios_qx.png)

	- Android 需要以下权限:
	
		```
		<uses-permission android:name="android.permission.INTERNET" />
		<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
		<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
		<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
		<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
		<uses-permission android:name="android.permission.RECORD_AUDIO" />
		<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
		<uses-permission android:name="android.permission.BLUETOOTH" />
		<uses-permission android:name="android.permission.READ_PHONE_STATE" />
		```

4. 配置音频后台运行

	手机应用程序在切换到后台时，操作系统会暂停应用程序的进程以节省资源。这意味着应用程序的所有活动都将被停止，包括播放音频。而ios下需要配置**audio background mode**才可以保证有音频影响的时候程序不会终止。

	![](https://tccc.qcloud.com/assets/doc/Agent/uniapp_images/ios_model.png)

> ! 不配置该权限，通话中切后台的时候会自动中断。

5. 使用自定义基座打包 uni 原生插件（请使用真机运行自定义基座）

	![](https://tccc.qcloud.com/assets/doc/Agent/uniapp_images/uniapp_run_demo.png)

> ! 什么是自定义调试基座及使用说明,请参见[官方教程](https://uniapp.dcloud.net.cn/tutorial/run/run-app.html#customplayground)

### 代码实现

具体编码实现可参考 [API 概览以及示例](api.md)

1. 创建 TCCCWorkstation 实例

```js
import {TcccWorkstation,TcccErrorCode} from "tccc-sdk-uniapp";
const tcccSDK = TcccWorkstation.sharedInstance();
// 监听错误事件
tcccSDK.on("onError",(errCode,errMsg) => {

});
```

2. 登录

```js
const type = TCCCLoginType.Agent;
// 其中sdkAppId、userId、token的获取参考关键概念对应的字段。
// 坐席登录
tcccSDK.login({
	sdkAppID: 1400000000,	//  请替换为自己的SdkAppId
	userId: "xxx@qq.com", // 替换为座席账号
	token: "xxxx", // 请替换为用调用云API接口 CreateSDKLoginToken 获取的token
	type: type,
},(code,message) => {
	if (code == TcccErrorCode.ERR_NONE) {
		// 登录成功
	} else {
		// 登录失败
	}
});
```
> ! token的获取需要后台开发进行，需要调用云API接口[**CreateSDKLoginToken**](https://cloud.tencent.com/document/api/679/49227)来获取。


3. 发起呼叫


```js
// 134xxxx为呼叫的号码
tcccSDK.call('134xxxx', (code,message) => {
	if (code == TcccErrorCode.ERR_NONE) {
		// 发起成功
	} else {
		// 发起失败
	}
});

```

## 常见问题

###  如何查看 TCCC 日志？

TCCC 的日志默认压缩加密，后缀为 .log。
- Android：
	- 日志路径：`/sdcard/Android/data/包名/files/tccc`
- Ios:
	- 日志路径：在**sandbox/Documents** 目录下的**tccc**文件夹

### TCCC SDK 在Android能不能支持X86模拟器？

TCCC 目前版本暂时不支持，未来会支持模拟器。如果需要在模拟器运行，建议在ios下的x86模拟器上运行调试。

### TCCC SDK 在Ios能不能支持armv7的CPU类型？

因在iPhone 5c以下才有该类型的CPU，目前基本上已经无人使用了。所以我们不适配该类型的CPU，并且在云打包ios的时候需要修改配置**manifest.json**文件


```
"validArchitectures": [
	"arm64"
],
```


### 发起呼叫报 **408或者503错误**

这种情况一般出现在应用程序切后台重新唤醒后，网络状态还未完全恢复。我们强烈建议你在发起呼叫或者是程序onshow的时候调用接口判断是否是已登录。


```js
import {TcccWorkstation,TcccErrorCode} from "tccc-sdk-uniapp";
// 手机应用程序在切换到后台时，操作系统会暂停应用程序的进程以节省资源。我们建议你在onShow的时候做一个登录状态检查
onShow() {
	const tcccSDK = TcccWorkstation.sharedInstance();
	tcccSDK.checkLogin((code,message) => {
		if (code != TcccErrorCode.ERR_NONE) {
			// 未登录，或者网络连接异常。请重新登陆。
		} else {
			// 已登录
		}
	});
}
```

## 其他

- [tccc uniapp demo](https://github.com/TencentCloud/tccc-agent-uniapp-example)
- [API 概览以及示例](https://github.com/TencentCloud/tccc-agent-uniapp-example/api.md)