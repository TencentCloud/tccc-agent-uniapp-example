<template>
	<view class="calling-body">
		<!-- <view>calling-body page</view> -->
		<view v-if="isShowTransfer" class='transfer-wrapper'>
			<view class='dial-text'>{{keysPressed}}</view>
			<view class='dial-panel' @click="handleTapKey">
			  <view v-for="(item) in keys" :key="item"
			  hover-class="key-active" data-name="key" :data-value="item" class='key-item'>
				{{item}}
			  </view>
			</view>
			<view class='dial-panel-handles'>
			  <view class='btn-hide-dial-panel' @click="handleClose">隐藏</view>
			</view>
		</view>
		<view v-else class="calling-panel">
			
			<view class="loading">
				<view class="loading-img">
					<image :src="image.avatar" class="rotate-img"></image>
					<view class="circle-wrapper">
					  <view class="circle"/>
					  <view class="circle"/>
					  <view class="circle"/>
					</view>
				</view>
				<view class="calleePhone">{{displayPhone}}</view>
				<view class="loading-text">{{calleeRemark}}</view>
			</view>
			
			<view class="handle-btns">
				
				<view v-if="status == 'waitingPeer' || status =='loading'" class="btn-normal btn-hangup" @click="handleHangup">
					<image class="btn-image" :src="image.hangup"/>
				</view>
			    <block v-if="status=='inProgress'">
					<view class="btn-dial-panel-wrapper" @click="handleOpenTransfer">
					  <view class="btn-normal btn-dial-panel">
						<image class="btn-image" :src="image.dialPanel"></image>
					  </view>
					  <view class="btn-dial-panel-text">输入分机号</view>
					</view>
					<view class="btn-normal" @click="handlerAudioMute">
					  <image class="btn-image" :src="micAudioUrl "></image>
					</view>
					<view class="btn-normal btn-hangup" @click="handleHangup">
					  <image class="btn-image" :src="image.hangup"/>
					</view>
					<view class="btn-normal" @click="handleSoundMode">
					  <image class="btn-image" :src="soundModeUrl"></image>
					</view>
				</block>
				<view v-else-if="status=='finished'" class="btn-normal btn-close" @click="handleReLoadNumberPage">
					<image class="btn-image btn-close" :src="image.close"/>
				</view>
				
			</view>
			
		</view>
	</view>
</template>

<script>
	import {TcccWorkstation,TCCCLoginType,TCCCAudioRoute,TCCCEndReason,TCCCSessionDirection} from "tccc-sdk-uniapp";
	import permision from "@/js_sdk/wa-permission/permission.js"
	
	export default {
		data() {
			return {
				image: {
					  avatar:
						'https://imgcache.qq.com/operation/dianshi/other/circle.539d85544b59d22d305d518be9fc63fcfa152d1c.svg',
					  audioTrue:
						'https://imgcache.qq.com/operation/dianshi/other/audio-true.3c5b5a834d4ae418543dac481f5c3fcacf20ed7c.svg',
					  audioFalse:
						'https://imgcache.qq.com/operation/dianshi/other/audio-false.c25cdc1fd2e624142f22c7be21016ef0172d675c.svg',
					  speakerTrue:
						'https://imgcache.qq.com/operation/dianshi/other/speak-true.658aec3a6979a089492567997e8a1387c2f13546.svg',
					  speakerFalse:
						'https://imgcache.qq.com/operation/dianshi/other/seaker-false.e8c4a5ad4207daea252b90821e749e79738da53f.svg',
					  hangup:
						'https://imgcache.qq.com/operation/dianshi/other/hangup.60bb3915a59187bb87a8f0d89763ebab97e7267e.svg',
					  close:
						'https://imgcache.qq.com/operation/dianshi/other/CLOSE.8445a839c6e7289a69147f7fce5c6e35eb88fc69.svg',
					  dialPanel:
						'https://comm.qq.com/im/static-files/tccc-miniapp/icons/dial_panel.png',
				},
				isShowTransfer: false,
				keysPressed: '',
				keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'],
				
				isSpeakerTrue: true,
				isMicAudio: false,
				
				displayPhone:'',
				calleeRemark: '',
				tcccSDK: null,
				status: 'loading',
				// 'loading',呼出中...
				// 'waitingPeer',等待接听中
				// 'inProgress',通话中
				// 'finished',已结束
			}
		},
		computed: {
			soundModeUrl(){
				return this.isSpeakerTrue ? this.image.speakerTrue:this.image.speakerFalse;
			},
			micAudioUrl() {
				return this.isMicAudio ? this.image.audioFalse:this.image.audioTrue;
			}
		},
		onLoad(option) {
			const {number, remark,sessionDirection} = option;
			if (sessionDirection == TCCCSessionDirection.CallIn) {
				this.displayPhone = number;
				this.status = 'inProgress';
				this.calleeRemark = "通话中...";
				return;
			}
			if(number) {
				this.displayPhone = number;
				this.calleeRemark = "呼出中...";
				this.status = 'loading';// for test. loading
				this.getTcccSDK().call(number, () => {
					this.status = 'waitingPeer';
					this.calleeRemark = "等待接听中...";
				});
			}
		},
		onUnload() {
			
		},
		async mounted() {
			if (uni.getSystemInfoSync().platform === 'android') {
				var result = await permision.requestAndroidPermission('android.permission.RECORD_AUDIO');
				var strStatus;
				if (result == 1) {
					strStatus = "已获得授权"
				} else if (result == 0) {
					strStatus = "未获得授权"
				} else {
					strStatus = "被永久拒绝权限"
				}
				if (result != 1) {
					uni.showModal({
						content: "麦克风权限，"+ strStatus,
						showCancel: false
					});
				}
			}
		},
		methods: {
			handleClose() {
			  this.keysPressed = '';
			  this.isShowTransfer = false;
			},
			getTcccSDK() {
				if (!this.tcccSDK) {
					this.tcccSDK = TcccWorkstation.sharedInstance();
					this.handleTcccEvent();
				}
				return this.tcccSDK;
			},
			handleTcccEvent() {
				this.tcccSDK.off('*');
				this.tcccSDK.on('onError',(errCode,errMsg) => {
					uni.showToast({
						icon:"error",
						title:errMsg,
					})
				});
				this.tcccSDK.on('onEnded',(reason,reasonMessage,sessionId) => {
					var msg = "";
					if (reason == TCCCEndReason.Error) {
						msg = "系统异常"+reasonMessage;
					} else if (reason == TCCCEndReason.Timeout) {
						msg = "超时挂断";
					} else if (reason == TCCCEndReason.LocalBye) {
						msg = "你已挂断";
					} else if (reason == TCCCEndReason.RemoteBye) {
						msg = "对方已挂断";
					} else if (reason == TCCCEndReason.Rejected) {
						msg = "对方已拒接";
					} else if (reason == TCCCEndReason.RemoteCancel) {
						msg = "对方已取消";
					}
					if (msg != "") {
						uni.showToast({
							title: msg,
							icon:"error"
						});
					}
					this.status = 'finished';
					this.calleeRemark = "已结束";
				});
				this.tcccSDK.on('onAccepted',(sessionId) => {
					this.status = 'inProgress';
					this.calleeRemark = "通话中...";
				});
				this.tcccSDK.on('onConnectionLost',(serverType) => {
					uni.showToast({
						title: '与云端的连接已经断开',
						icon:"error"
					});
				});
				this.tcccSDK.on('onTryToReconnect',(serverType) => {
					uni.showToast({
						title: '正在尝试重新连接到云端',
						icon: "none"
					});
				});
				this.tcccSDK.on('onConnectionRecovery',(serverType) => {
					uni.showToast({
						title: '与云端的连接已经恢复',
						icon: 'success'
					});
				});
			},
			handleOpenTransfer() {
				this.isShowTransfer = true;
			},
			handleSoundMode() {
				this.isSpeakerTrue = !this.isSpeakerTrue;
				const route = this.isSpeakerTrue? TCCCAudioRoute.Speakerphone: TCCCAudioRoute.Earpiece;
				this.getTcccSDK().getDeviceManager().setAudioRoute(route);
			},
			handleHangup() {
				this.status = 'finished';
				this.calleeRemark = "已结束";
				this.getTcccSDK().terminate();
			},
			handlerAudioMute() {
				this.isMicAudio = !this.isMicAudio;
				if (this.isMicAudio)
					this.getTcccSDK().mute();
				else
					this.getTcccSDK().unMute();
			},
			handleReLoadNumberPage() {
				uni.reLaunch({
					url:'/pages/numberList/index'
				})
			},
			handleTapKey(e) {
			  const { target } = e;
			  if (target.dataset.name !== 'key') return;
			  const key = target.dataset.value;
			  this.keysPressed +=key;
			  this.getTcccSDK().sendDTMF(key, null);
			},
		}
	}
</script>

<style>
	
@import "index.css"

</style>
