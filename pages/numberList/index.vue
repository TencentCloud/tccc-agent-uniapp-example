<template>
	<view>
		<view class="number-body">
			<uni-nav-bar left-icon="left" fixed @clickLeft="tapLogoutTccc" class="number-nav-bar" title="发起外呼" background-color="transparent" color="#000000" :border="false" fixed />
			<view class="number-content">
				<uni-swipe-action ref="swipeAction" v-if="isShowNumberList">
					<uni-swipe-action-item
						v-for="(item, index) in numberList"
						:right-options="swipeOptions"
						:key="item.id"
						@click="swipeClick($event, item)"
					>
						<view class="item-content-box">
							<view class="item-content-left">
								<uni-title type="h3" class="item-content-number" color="#000000" :title="item.number"></uni-title>
								<uni-title type="h5" class="item-content-note" color="#757575" :title="getNumberItemNote(item)"></uni-title>
							</view>
							<view class="item-content-right">
								<uni-icons type="phone" @click="navigateToCall(item)"  size="30"></uni-icons>
							</view>
						</view>
					</uni-swipe-action-item>
				</uni-swipe-action>
				
				<view class="number-empty-body" @click="btnEmptyClick" v-else>
					<view class="empty-image"></view>
					<text>暂无外呼号码，快去添加吧</text>
				</view>
			</view>
			<view class="number-bottom">
				<button type="primary" @click="showSaveNumberView">+ 添加外呼号码</button>
			</view>
		</view>
		<uni-popup ref="popup" :is-mask-click="false" background-color="#fff">
			<view class="popup-content">
				<uni-nav-bar :border="false" :title="getPopuTitle">
					<template v-slot:right>
					<uni-icons @click="closePopup" type="closeempty" size="20"></uni-icons>
					</template>
				</uni-nav-bar>
				<view class="popup-body">
					<uni-forms :modelValue="formData" :label-width="100">
						<uni-forms-item label="外呼号码" name="number">
							<uni-easyinput trim type="number" focus maxlength="12" v-model="formData.number" placeholder="请输入外呼号码" />
						</uni-forms-item>
						<uni-forms-item label="备注" name="remark">
							<uni-easyinput trim maxlength="15" type="text" v-model="formData.remark" placeholder="请输入备注" />
						</uni-forms-item>
					</uni-forms>
					<view class="token-bottom">
						<button type="primary" :disabled="isBtnSaveDisabled" class="button" @click="btnSaveClick">保存</button>
					</view>
				</view>
			</view>
		</uni-popup>
		<uni-popup ref="newCallInPopup" type="dialog">
			<uni-popup-dialog mode="base" :title="getCallInMessage" :before-close="true" cancelText="拒绝" confirmText="接听" @close="tapTerminate" @confirm="tapAnswer"></uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
	import {TcccWorkstation,TcccErrorCode,TCCCSessionDirection} from "tccc-sdk-uniapp";
	
	const storage_key = 'tccc_storage_numberList';
	export default {
		data() {
			return {
				swipeOptions: [{
						text: '编辑',
						style: {
							backgroundColor: '#1e80ff'
						}
					},{
						text: '删除',
						style: {
							backgroundColor: 'rgb(255,58,49)'
						}
					},
				],
				numberList:[],
				// 呼入的手机号
				callInNumber: '',
				callInMap: {},
				isEditorForm: false,
				tcccSDK: null,
				formData: {
					id: -1,
					number: '',
					remark: ''
				}
			}
		},
		onLoad(){
			this._getStorageNumberList();
		},
		onShow() {
			this.getTcccSDK().off('*');
			this.getTcccSDK().checkLogin((code,message) => {
				if (code != TcccErrorCode.ERR_NONE) {
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
					uni.showModal({
						title: msg,
						showCancel:false,
						success:()=>{
							uni.reLaunch({
								url:'/pages/sdkLogin/sdkLogin'
							});
						}
					});
				} else {
					this.handleTcccEvent();
				}
			});
		},
		computed: {
			isShowNumberList() {
				return this.numberList.length > 0;
			},
			isBtnSaveDisabled() {
				return this.formData.number.trim() == '' || this.formData.remark.trim() == '';
			},
			getPopuTitle() {
				if (this.isEditorForm)
					return "修改外呼号码";
				return "添加外呼号码";
			},
			getCallInMessage() {
				return `${this.callInNumber}来电，请接听。`;
			},
		},
		methods: {
			getTcccSDK() {
				if (!this.tcccSDK) {
					this.tcccSDK = TcccWorkstation.sharedInstance();
				}
				return this.tcccSDK;
			},
			handleTcccEvent() {
				// 主要处理呼入事件。
				console.info('handle tccc event');
				this.getTcccSDK().on('onNewSession',(res) => {
					const sessionDirection = res.sessionDirection;
					if (sessionDirection == TCCCSessionDirection.CallIn) {
						this.handleOnCallIn(res);
					}
				});
				this.getTcccSDK().on('onEnded',(reason,reasonMessage,sessionId) => {
					this.handleOnCallEnd(reason,reasonMessage,sessionId);
				});
				this.getTcccSDK().on('onError',(errCode,errMsg) => {
					this.handleOnError(errCode,errMsg);
				});
			},
			handleOnCallIn(res) {
				const fromUserId = res.fromUserId;
				this.callInNumber = fromUserId;
				this.callInMap[res.sessionId] = res;
				this.$refs.newCallInPopup.open();
				// 来听播放音乐提醒
				this.getTcccSDK().startPlayMusic("https://tccc.qcloud.com/assets/newUser.001a041a.wav", 9999);
			},
			tapAnswer() {
				this.callInNumber = '';
				this.getTcccSDK().stopPlayMusic();
				this.$refs.newCallInPopup.close();
				this.getTcccSDK().answer((code,message) => {
					if (code == TcccErrorCode.ERR_NONE) {
						uni.reLaunch({
							url:`/pages/calling/index?number=${this.callInNumber}&sessionDirection=${TCCCSessionDirection.CallIn}`
						});
					} else {
						uni.showToast({
							title:'接听失败',
							icon:"error"
						});
					}
				});
			},
			tapTerminate() {
				this.callInNumber = '';
				this.getTcccSDK().stopPlayMusic();
				this.getTcccSDK().terminate();
				this.$refs.newCallInPopup.close();
			},
			handleOnCallEnd(reason,reasonMessage,sessionId) {
				this.callInNumber = '';
				if (this.callInMap[sessionId]) {
					// 停止播放呼入音乐
					this.getTcccSDK().stopPlayMusic();
					this.$refs.newCallInPopup.close();
					this.callInNumber = '';
					var msg = "";
					if (reason == TCCCEndReason.Timeout) {
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
				} else {
					// 呼叫结束不在这里处理
				}
			},
			handleOnError(errCode,errMsg) {
				if (errCode == TcccErrorCode.ERR_SIP_FORBIDDEN) {
					uni.showModal({
						title: "你已在其他地方登录，请重新登陆。",
						showCancel:false,
						success:()=>{
							uni.reLaunch({
								url:'/pages/sdkLogin/sdkLogin'
							})
						}
					});
					return;
				}
				uni.showToast({
					icon:"error",
					title:errMsg,
				});
			},
			getNumberItemNote(item) {
				const itemTime = new Date(item.createTime);
				const timeStr = itemTime.getFullYear() + '.'+itemTime.getMonth()+'.'+itemTime.getDate();
				return `备注：${item.remark}   录入时间：${timeStr}`;
			},
			btnEmptyClick() {
				uni.setStorageSync(storage_key,[]);
				this.numberList = [];
			},
			navigateToCall(item) {
				uni.showLoading({
					title:'准备呼叫..',
				});
				this.getTcccSDK().checkLogin((code,message) => {
					uni.hideLoading();
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
					if (code != TcccErrorCode.ERR_NONE) {
						uni.showModal({
							title: msg,
							showCancel:false,
							success:()=>{
								uni.reLaunch({
									url:'/pages/sdkLogin/sdkLogin'
								})
							}
						});
					} else {
						uni.reLaunch({
							url:`/pages/calling/index?number=${item.number}&remark=${item.remark}&sessionDirection=${TCCCSessionDirection.CallOut}`
						});
					}
				});
			},
			swipeClick(e,nowItem) {
				const that = this;
				let {content} = e;
				if (content.text === '删除') {
					uni.showModal({
						title: '提示',
						content: '是否删除',
						success: res => {
							if (res.confirm) {
								const list = that.numberList.filter(item => {
									return item.id != nowItem.id;
								}) || [];
								uni.setStorageSync(storage_key, list);
								that.numberList = list;
							}
						}
					});
				} else {
					this.isEditorForm = true;
					this.formData.id = nowItem.id;
					this.formData.number = nowItem.number;
					this.formData.remark = nowItem.remark;
					this.$refs.popup.open('bottom');
				}
			},
			_getStorageNumberList() {
				const now = new Date();
				const value = uni.getStorageSync(storage_key) || [{
						id: now.getTime(),
						number: '075536564058',
						remark: '呼叫中心技术支持',
						createTime: now,
					}
				];
				this.numberList = value;
			},
			tapLogoutTccc() {
				uni.showModal({
					title: '提示',
					content: '是否退出',
					success: res => {
						if (res.confirm) {
							try{
								this.getTcccSDK().logout(null);
								this.tcccSDK = null;
							}catch(e){
								//TODO handle the exception
							}
							uni.reLaunch({
								url:'/pages/sdkLogin/sdkLogin'
							});
						}
					}
				});
			},
			closePopup() {
				this.$refs.popup.close();
			},
			showSaveNumberView(){
				this.isEditorForm = false;
				this.formData.number='';
				this.formData.remark='';
				this.$refs.popup.open('bottom');
			},
			btnSaveClick() {
				var errorMsg = '';
				if (!this.isEditorForm && this.numberList.length > 150) {
					errorMsg = '您已超过号码数量限制了';
				} else if(this.formData.number.trim()==''){
					errorMsg = '请输入外呼号码';
				} else if(this.formData.remark.trim()==''){
					errorMsg = '请输入备注';
				} else if (!this.isEditorForm && (this.numberList || []).find(item => {
					return item.number == this.formData.number;
				})) {
					errorMsg = '该号码已经添加';
				} else if(this.isEditorForm && (this.numberList || []).find(item => {
					return item.number == this.formData.number && item.id != this.formData.id;
				})) {
					errorMsg = '该号码已经存在，请修改为其他号码';
				}
				if(errorMsg!=''){
					uni.showToast({
						title: errorMsg,
						icon: 'error',
					});
					return;
				}
				const now = new Date();
				var list = [];
				if(this.isEditorForm) {
					this.numberList.map(item => {
						if(item.id == this.formData.id) {
							item.number = this.formData.number;
							item.remark = this.formData.remark;
						}
						return item;
					});
					list = [...this.numberList];
				} else {
					list = [...this.numberList,{
						id: now.getTime(),
						number: this.formData.number.trim(),
						remark: this.formData.remark.trim() != ''?this.formData.remark.trim():this.formData.number.trim(),
						createTime: now,
					}];
				}
				uni.setStorageSync(storage_key, list);
				this.numberList = list;
				this.closePopup();
			}
		}
	}
</script>

<style>
@import 'index.css'
</style>
