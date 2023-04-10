<template>
	<view class="login-body">
		<uni-nav-bar class="login-nav-bar" title="可视化调试" background-color="transparent" color="#000000" :border="false" fixed />
		<view class="login-welcome">
			<uni-title type="h2" title="你好，"></uni-title>
			<uni-title type="h2" title="欢迎来到云呼叫中心"></uni-title>
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
	import {TcccWorkstation,TCCCLoginType,TcccErrorCode} from "tccc-workstation-sdk";
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
		onLoad: () => {
				
		},
		onShow: () => {
		},
		methods: {
			getTcccSDK() {
				if (!this.tcccSDK) {
					this.tcccSDK = TcccWorkstation.sharedInstance();
				}
				return this.tcccSDK;
			},
			btnLoginClick() {
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
					if (res.sdkAppId == 1400264214) {
						this.getTcccSDK().callExperimentalAPI("setDebugMode","");
					} else {
						this.getTcccSDK().callExperimentalAPI("setReleseMode","");
					}
					const type = TCCCLoginType.Agent;
					this.getTcccSDK().login({
						type,
						sdkAppID: res.sdkAppId,
						userId: res.userID,
						token: res.token,
					},(code,message)=>{
						uni.hideLoading();
						if (code == TcccErrorCode.ERR_NONE) {
							uni.reLaunch({
								url:'/pages/numberList/index'
							});
						} else {
							uni.showToast({
								icon:'error',
								title:'登录失败'
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
