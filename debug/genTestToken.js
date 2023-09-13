/**
 * 座席账号，格式为 ： xxx@qq.com
 */
const USERID = '';

/**
 * 腾讯云 SDKAppId，需要替换为您自己账号下的 SDKAppId。
 * 进入腾讯云联络中心[控制台](https://console.cloud.tencent.com/ccc ) 创建应用，即可看到 SDKAppId，
 * 它是腾讯云用于区分客户的唯一标识。
 */
const SDKAPPID = 1400264214;
/**
* 计算签名用的加密密钥ID，[查看秘钥](https://console.cloud.tencent.com/cam/capi)
* 注意：该方案仅适用于调试Demo，正式上线前请将 UserSig 计算代码和密钥迁移到您的后台服务器上，以避免加密密钥泄露导致的流量盗用。
* 文档：https://cloud.tencent.com/document/product/679/58260
*/
const SECRETID = "";

/**
* 计算签名用的加密密钥Key，[查看秘钥](https://console.cloud.tencent.com/cam/capi)
* 注意：该方案仅适用于调试Demo，正式上线前请将 UserSig 计算代码和密钥迁移到您的后台服务器上，以避免加密密钥泄露导致的流量盗用。
* 文档：https://cloud.tencent.com/document/product/679/58260
*/
const SECRETKEY = ""; 

/**
* 签名过期时间，不能超过一个小时
* <p>
* 时间单位：秒
* 默认时间：30 x 60 = 1800 = 30 分钟
*/
const EXPIRETIME = 1800;
	

/**
 * 生成票据
 * 
 * @note 请不要将如下代码发布到您的线上正式版本的 App 中，原因如下：
 * 
 * 本文件中的代码虽然能够正确计算出 Token，但仅适合快速调通 SDK 的基本功能，不适合线上产品，
 * 这是因为客户端代码中的 SECRETKEY 很容易被反编译逆向破解，尤其是 Web 端的代码被破解的难度几乎为零。
 * 一旦您的密钥泄露，攻击者就可以计算出正确的 Token 来盗用您的腾讯云流量
 * 
 * 正确的做法是将 Token 的计算代码和加密密钥放在您的业务服务器上，然后由 App 按需向您的服务器获取实时算出的 Token。
 * 由于破解服务器的成本要高于破解客户端 App，所以服务器计算的方案能够更好地保护您的加密密钥。
 *
 * 文档：https://cloud.tencent.com/document/product/679/58260
 * 
 * @return 如果出错，会返回为空，或者有异常打印，成功返回有效的票据
 */
function genTestToken(ops, successCallback,failCallback) {
  const token = '';
  const newSDKID =ops.SDKAPPID? ops.SDKAPPID:SDKAPPID;
  uni.request({
  	url:'https://tccc-gavin-5g19jovqc598f12b-1258344699.ap-guangzhou.app.tcloudbase.com/tccc-agent',
	data:{
		secretId: ops.SECRETID? ops.SECRETID:SECRETID,
		secretKey: ops.SECRETKEY? ops.SECRETKEY:SECRETKEY,
		isTest: newSDKID == 1400264214 || newSDKID == 1400651411 || newSDKID == 1400670064?true:false,
		SdkAppId: newSDKID,
		SeatUserId: ops.USERID? ops.USERID: USERID,
	},
	success(res) {
		if (res.data.errorCode != 0) {
			failCallback(res.data.errorMessage);
			return;
		}
		successCallback({
			sdkAppId: ops.SDKAPPID ?ops.SDKAPPID:SDKAPPID,
			userID: ops.USERID? ops.USERID: USERID,
			token: res.data.Token,
		  });
	},
	fail() {
		failCallback("发起请求失败，请检查网络连接。");
	}
  });
}

// module.exports = {
//   genTestToken,
// };

// HBuilder 选择 vue3 时, 上面的打包无法通过 import 进行引入
export {
	genTestToken,
	SDKAPPID,
	SECRETID,
	SECRETKEY,
	USERID
};

