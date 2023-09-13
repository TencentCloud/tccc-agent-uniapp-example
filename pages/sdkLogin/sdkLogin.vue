<template>
	<view class="login-body">
		<uni-nav-bar class="login-nav-bar" title="可视化调试" background-color="transparent" color="#000000" :border="false" fixed />
		<view @click="onTitleClick" class="login-welcome">
			<uni-title type="h2" title="你好，"></uni-title>
			<uni-title type="h2" title="欢迎来到云联络中心"></uni-title>
		</view>
		<view class="login-content">
			<uni-forms :modelValue="userFormData" :label-width="100">
				<uni-forms-item label="密钥ID" name="SECRETID">
					<uni-easyinput type="password" name="SECRETID" maxlength="50" trim v-model="userFormData.SECRETID" placeholder="请输入调试秘钥ID" />
				</uni-forms-item>
				<uni-forms-item label="密钥Key" name="SECRETKEY">
					<uni-easyinput type="password" name="SECRETKEY" maxlength="50" v-model="userFormData.SECRETKEY" placeholder="请输入调试秘钥Key" />
				</uni-forms-item>
				<uni-forms-item label="应用ID" name="SDKAPPID">
					<uni-easyinput type="number" name="SDKAPPID" maxlength="15" v-model="userFormData.SDKAPPID" placeholder="请输入调试应用ID" />
				</uni-forms-item>
				<uni-forms-item label="坐席邮箱" name="USERID">
					<uni-easyinput type="text" name="USERID" maxlength="35" v-model="userFormData.USERID" placeholder="请输入调试用户ID" />
				</uni-forms-item>
			</uni-forms>
		</view>
		<view class="login-bottom">
			<button type="primary" :disabled="isBtnDisabled" @click="btnLoginClick()">登录</button>
		</view>
	</view>
</template>

<script>
	import {genTestToken,SDKAPPID,SECRETID,SECRETKEY,USERID} from '@/debug/genTestToken.js'
	import {TcccWorkstation,TCCCLoginType,TcccErrorCode} from "tccc-sdk-uniapp";
	const storage_key_for_SECRET = 'tccc_storage_SECRET_info_x';
	export default {
		data() {
			return {
				titleClickCount: 0,
				tcccSDK: null,
				userFormData: {
					SECRETID: SECRETID,
					SECRETKEY: SECRETKEY,
					SDKAPPID: SDKAPPID,
					USERID: USERID
				}
			}
		},
		computed: {
			isBtnDisabled() {
				return this.userFormData.SECRETID.trim() == '' || this.userFormData.SECRETKEY.trim() == '' || this.userFormData.USERID.trim() == '';
			},
		},
		onLoad()  {
			this.getLoginUserInf();
		},
		onShow(){
		},
		methods: {
			getLoginUserInf() {
				const value = uni.getStorageSync(storage_key_for_SECRET);
				if (value && value["SECRETID"] && SECRETID == '') {
					this.userFormData.SECRETID = value.SECRETID;
					this.userFormData.SECRETKEY = value.SECRETKEY;
					this.userFormData.SDKAPPID = value.SDKAPPID;
					this.userFormData.USERID = value.USERID;
				}
			},
			onTitleClick() {
				const that = this;
				this.titleClickCount++;
				if (that.titleClickCount == 1) {
					setTimeout(() => {
						that.titleClickCount = 0;
					}, 300);
				} else if (that.titleClickCount == 2) {
					that.titleClickCount = 0;
					uni.showModal({
						content: '是否跳转到调试页面？',
						success: function (res) {
							if (res.confirm) {
								uni.reLaunch({
									url:'/pages/apiTest/index'
								});
							}
						}
					});
				}
			},
			getTcccSDK() {
				if (!this.tcccSDK) {
					this.tcccSDK = TcccWorkstation.sharedInstance();
				}
				return this.tcccSDK;
			},
			btnLoginClick() {
				const that = this;
				uni.showLoading({
					title: '获取Token..',
				});
				genTestToken({
					SECRETID: this.userFormData.SECRETID,
					SECRETKEY: this.userFormData.SECRETKEY,
					SDKAPPID: this.userFormData.SDKAPPID,
					USERID: this.userFormData.USERID,
				},(res) => {
					uni.showLoading({
						title: '登录中..',
					});
					const type = TCCCLoginType.Agent;
					this.getTcccSDK().login({
						type,
						sdkAppID: res.sdkAppId,
						userId: res.userID,
						token: res.token,
					},(code,message)=>{
						uni.hideLoading();
						if (code == TcccErrorCode.ERR_NONE) {
							uni.setStorageSync(storage_key_for_SECRET,{
								SECRETID: that.userFormData.SECRETID,
								SECRETKEY: that.userFormData.SECRETKEY,
								SDKAPPID: that.userFormData.SDKAPPID,
								USERID :that.userFormData.USERID,
							});
							uni.reLaunch({
								url:'/pages/numberList/index'
							});
						} else {
							var msg = message;
							if (code == TcccErrorCode.ERR_SIP_BAD_REQUEST) {
								msg = "您还未登录，请先登录。";
							} else if (code == TcccErrorCode.ERR_SIP_FORBIDDEN) {
								msg = "你已在其他地方登录，请重新登陆。";
							} else if (code == TcccErrorCode.ERR_SIP_REQUESTTIMEOUT) {
								msg = "请求超时，请重新登陆。";
							} else if (code == TcccErrorCode.ERR_SIP_PAYMENTREQUIRED) {
								msg = "坐席许可满了，请购买坐席。";
							}
							uni.showToast({
								icon:'error',
								title: msg
							});
						}
					});
					
				},(res) => {
					uni.hideLoading();
					uni.showToast({
						icon:'error',
						title:res
					})
				});
			},
		}
	}
</script>

<style>
@import url('sdkLogin.css');
</style>
