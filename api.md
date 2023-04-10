
## API 概览
### 创建实例和事件回调
| API | 描述 |
|-----|-----|
| sharedInstance | 创建 TCCCWorkstation 实例（单例模式） |
| destroyInstance | 销毁 TCCCWorkstation 实例（单例模式），建议你在不使用tccc的时候卸载tccc实例  |
| on | 设置 TCCCWorkstation 事件回调 |
| off | 取消 TCCCWorkstation 事件回调 |

#### 创建实例和设置事件回调示例代码
```js
// 引入TCCC相关包
import {TcccWorkstation,TCCCLoginType,TCCCAudioRoute,TCCCEndReason} from "tccc-workstation-sdk";
// 创建实例和设置事件回调
const tcccSDK = TCCCWorkstation.sharedInstance();
// 错误事件回调
tcccSDK.on('onError',(errCode,errMsg) => {
});
// 通话结束回调
tcccSDK.on('onEnded',(reason,reasonMessage,sessionId) => {
    if (reason == TCCCEndReason.Error) {
        // 呼叫异常
    }
});
// 对端接听回调
tcccSDK.on('onAccepted',(sessionId) => {
    
});
// 释放所有事件回调监听
tcccSDK.off('*');
```

### 登录相关接口函数
| API | 描述 |
|-----|-----|
| login | SDK 登录 |
| checkLogin | 检查 SDK 登录状态，建议你在页面**onShow**的时候调用 |
| logout | SDK 退出登录 |

#### 登录示例代码
```js
// 其中sdkAppId、userId、token的获取参考关键概念对应的字段。
// 坐席登录
tcccSDK.login({
	sdkAppID: sdkAppId,
	userId: userID,
	token: token,
	type: type,
},(code,message) => {
	if (code == TcccErrorCode.ERR_NONE) {
		// 登录成功
	} else {
		// 登录失败
	}
});
// 检查登录状态
tcccSDK.checkLogin(code,message) => {
    if (code == TcccErrorCode.ERR_NONE) {
		// 已登录
	} else {
		// 未登录
	}
});

```

### 呼叫相关接口函数
| API | 描述 |
|-----|-----|
| call | 发起通话 |
| answer | 接听来电 |
| terminate | 结束通话 |
| sendDTMF | 发送 DTMF（双音多频信号）|
| mute | 静音 |
| unmute | 取消静音 |

#### 发起呼叫和结束呼叫示例代码
```js
// 134xxxx为呼叫的号码
tcccSDK.call('134xxxx', (code,message) => {
	if (code == TcccErrorCode.ERR_NONE) {
		// 发起成功
	} else {
		// 发起失败
	}
});
// 结束通话
tcccSDK.terminate();
// 接听来听
tcccSDK.answer((code,message) => {
	if (code == TcccErrorCode.ERR_NONE) {
		// 接听成功
	} else {
		// 接听失败
	}
});
```

### 音频设备接口函数
| API | 描述 |
|-----|-----|
| setAudioCaptureVolume | 设定本地音频的采集音量 |
| getAudioCaptureVolume | 获取本地音频的采集音量 |
| setAudioPlayoutVolume | 设定远端音频的播放音量 |
| getAudioPlayoutVolume | 获取远端音频的播放音量 |
| setAudioRoute | 设置音频路由 |

```js
// TCCCAudioRoute.Earpiece 为耳麦
// 设置为扬声器
const route = TCCCAudioRoute.Speakerphone;
tcccSDK.getDeviceManager().setAudioRoute(route);
```

### 调试相关接口
| API | 描述 |
|-----|-----|
| getSDKVersion | 获取 SDK 版本信息 |
| setLogLevel | 设置 Log 输出级别 |
| setConsoleEnabled | 启用/禁用控制台日志打印 |

#### 获取SDK版本示例代码
```js
// 获取SDK 版本号
TCCCWorkstation.getSDKVersion();
```


### 错误和警告事件
| API | 描述 |
|-----|-----|
| onError | 错误事件回调 |
| onWarning | 警告事件回调 |
#### 处理错误回调事件回调示例代码
```js
// 错误事件回调
tcccSDK.on('onError',(errCode,errMsg) => {
});
// 警告事件回调
tcccSDK.on('onWarning',(warningCode,warningMsg) => {
});
```

### 呼叫相关事件回调
| API | 描述 |
|-----|-----|
| onNewSession | 新会话事件。包括呼入和呼出 |
| onEnded | 会话结束事件 |
| onAudioVolume | 音量大小的反馈回调 |
| onNetworkQuality | 网络质量的实时统计回调 |
#### 处理接听和坐席挂断事件回调示例代码
```js
// 会话结束事件
tcccSDK.on("onEnded",(reason,reasonMessage,sessionId) => {

});
// 新会话事件。包括呼入和呼出
tcccSDK.on('onNewSession',(res) => {
    const sessionDirection = res.sessionDirection;
    if (sessionDirection == TCCCSessionDirection.CallIn) {
        // 呼入
    } else if (sessionDirection == TCCCSessionDirection.CallOut){
        // 呼出
    }
});
// 网络质量的实时统计回调
tcccSDK.on('onNetworkQuality',(localQuality) => {
    const quality = localQuality.quality;
//   ///当前网络一般
//   TCCCQuality_Poor = 3,
//   ///当前网络较差
//   TCCCQuality_Bad = 4,
//   ///当前网络很差
//   TCCCQuality_Vbad = 5,
//   ///当前网络不满足 通话 的最低要求
//   TCCCQuality_Down = 6,

});
// 音量大小的反馈回调.volume从0到100，数值越大表示声音越大。
tcccSDK.on('onAudioVolume',(userId,volume) => {

});
```



### 与云端连接情况的事件回调
| API | 描述 |
|-----|-----|
| onConnectionLost | SDK 与云端的连接已经断开 |
| onTryToReconnect | SDK 正在尝试重新连接到云端 |
| onConnectionRecovery | SDK 与云端的连接已经恢复 |

#### 与云端连接情况的事件回调示例代码

```js
// 与云端的连接已经断开
tcccSDK.on('onTryToReconnect',(serverType) => {

});
// 正在尝试重新连接到云端
tcccSDK.on('onConnectionRecovery',(serverType) => {

});
// 与云端的连接已经恢复
tcccSDK.on('onConnectionLost',(serverType) => {

});

```



## API 错误码
### 基础错误码

| 符号 | 值 | 含义 |
|---|---|---|
|ERR_NONE|0|无错误。成功|
|ERR_HTTP_REQUEST_FAILURE|-10001|Http 请求失败，请检查网络连接情况|
|ERR_HTTP_TOKEN_ERROR|-10002|token登录票据不正确或者已过期|
|ERR_HTTP_GETSIPINFO_ERROR|-10003|获取坐席配置失败。请联系我们|
|ERR_UNRIGIST_FAILURE|20001|注销失败|
|ERR_ANSWER_FAILURE|20002|接听失败，通常是trtc进房失败|
|ERR_SIPURI_WRONGFORMAT|20003|URI 格式错误。|


### SIP相关错误码

| 符号 | 值 | 含义 |
|---|---|---|
|ERR_SIP_BAD_REQUEST|400|错误请求。通常是坐席没有登录就发起了请求|
|ERR_SIP_UNAUTHORIZED|401|未授权（用户名密码不对情况）|
|ERR_SIP_PAYMENTREQUIRED|402|付费要求，通常是坐席许可满了|
|ERR_SIP_FORBIDDEN|403|密码错误，或者是被踢了|
|ERR_SIP_REQUESTTIMEOUT|408|请求超时（网络超时）|
|ERR_SIP_REQUEST_TERMINATED|487|请求终止（网络异常，网络中断场景下）|
|ERR_SIP_SERVICE_UNAVAILABLE|503|服务不可用|
|ERR_SIP_SERVER_TIMEOUT|504|服务超时|


### 音频设备相关错误码
| 符号 | 值 | 含义 |
|---|---|---|
|ERR_MIC_START_FAIL|-1302|打开麦克风失败。设备，麦克风的配置程序（驱动程序）异常，禁用后重新启用设备，或者重启机器，或者更新配置程序|
|ERR_MIC_NOT_AUTHORIZED|-1317|麦克风设备未授权，通常在移动设备出现，可能是权限被用户拒绝了|
|ERR_MIC_SET_PARAM_FAIL|-1318|麦克风设置参数失败|
|ERR_MIC_OCCUPY|-1319|麦克风正在被占用中，例如移动设备正在通话时，打开麦克风会失败|
|ERR_MIC_STOP_FAIL|-1320|停止麦克风失败|
|ERR_SPEAKER_START_FAIL|-1321|打开扬声器失败，例如在 Windows 或 Mac|
|ERR_SPEAKER_SET_PARAM_FAIL|-1322|扬声器设置参数失败|
|ERR_SPEAKER_STOP_FAIL|-1323|停止扬声器失败|
|ERR_UNSUPPORTED_SAMPLERATE|-1306|不支持的音频采样率|

### 网络相关错误码
| 符号 | 值 | 含义 |
|---|---|---|
|ERR_RTC_ENTER_ROOM_FAILED|-3301|进入房间失败，请查看 onError 中的 -3301 对应的 msg 提示确认失败原因|
|ERR_RTC_REQUEST_IP_TIMEOUT|-3307|请求 IP 和 sig 超时，请检查网络是否正常，或网络防火墙是否放行 UDP。|
|ERR_RTC_CONNECT_SERVER_TIMEOUT|-3308|请求进房超时，请检查是否断网或者是否开启vpn，您也可以切换4G进行测试确认|
|ERR_RTC_ENTER_ROOM_REFUSED|-3340|进房请求被拒绝，请检查是否连续调用 enterRoom 进入相同 Id 的房间|