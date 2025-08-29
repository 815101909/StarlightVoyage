Page({
  data: {
    isLoading: true,
    userInfo: {
      nickName: "小舟摇星河用户",
      avatarUrl: "",
      memberLevel: 0, // 0-非会员, 1-会员
      expireDate: ""
    },
    memberPlans: [],
    promotionImage: '', // 宣传图临时链接
    isSelectingPlan: false,
    selectedPlan: null,
    memberPrivileges: [],
    memberExpireDate: ""
  },

  onLoad: function (options) {
    const app = getApp();
    if (!app.isUserLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    this.setData({ userInfo: app.getUserInfo() });
    this.loadPromotionImage();
    this.loadMemberInfo();
    this.loadMemberPlans();
  },

  /**
   * 加载宣传图
   */
  loadPromotionImage: async function() {
    try {
      const cloudPath = 'cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1370520707/membership/小舟摇星河会员.jpg';
      const cacheKey = 'promotion_image_temp_url';
      const cacheTimeKey = 'promotion_image_cache_time';
      
      // 检查本地缓存
      const cachedUrl = wx.getStorageSync(cacheKey);
      const cacheTime = wx.getStorageSync(cacheTimeKey);
      const now = Date.now();
      
      // 如果缓存存在且未过期（1小时内），直接使用缓存
      if (cachedUrl && cacheTime && (now - cacheTime < 1 * 60 * 60 * 1000)) {
        this.setData({ promotionImage: cachedUrl });
        console.log('使用缓存的宣传图链接:', cachedUrl);
        return;
      }
      
      // 获取临时链接
      const result = await wx.cloud.getTempFileURL({
        fileList: [cloudPath]
      });
      
      if (result.fileList && result.fileList.length > 0) {
        const tempFileURL = result.fileList[0].tempFileURL;
        
        // 更新页面数据
        this.setData({ promotionImage: tempFileURL });
        
        // 缓存临时链接和时间戳
        wx.setStorageSync(cacheKey, tempFileURL);
        wx.setStorageSync(cacheTimeKey, now);
        
        console.log('获取宣传图临时链接成功:', tempFileURL);
      } else {
        console.error('获取临时链接失败:', result);
        // 使用默认图片作为备用
        this.setData({ promotionImage: '/assets/images/beidou/beidou_a4.jpg' });
      }
    } catch (error) {
      console.error('加载宣传图失败:', error);
      // 使用默认图片作为备用
      this.setData({ promotionImage: '/assets/images/beidou/beidou_a4.jpg' });
    }
  },

  /**
   * 加载会员信息
   */
  loadMemberInfo: async function() {
    try {
      this.setData({ isLoading: true });
      
      // 调用云函数获取用户信息
      const userResult = await wx.cloud.callFunction({
        name: 'auth',
        data: {
          action: 'getProfile'
        }
      });
      
      if (userResult.result && userResult.result.success) {
        const userData = userResult.result.data;
        const memberLevel = userData.memberLevel || 0;
        let expireDate = null;
        let memberExpireDate = null;
        let memberPrivileges = ['基础内容访问', '基础功能使用'];
        
        // 如果是会员，设置过期时间和权限
        if (memberLevel > 0 && userData.expireDate) {
          expireDate = new Date(userData.expireDate).toISOString().split('T')[0];
          memberExpireDate = new Date(userData.expireDate).toString();
          memberPrivileges = ['无广告浏览', '专属内容访问', '高级功能使用', '专属客服服务'];
          
          // 检查会员是否过期
          const now = new Date();
          const expire = new Date(userData.expireDate);
          if (now > expire) {
            // 会员已过期，重置为非会员
            memberLevel = 0;
            expireDate = null;
            memberExpireDate = null;
            memberPrivileges = ['基础内容访问', '基础功能使用'];

            // 调用云函数更新数据库中的会员状态
            await wx.cloud.callFunction({
              name: 'auth',
              data: {
                action: 'updateProfile',
                profileData: {
                  memberLevel: 0,
                  expireDate: null,
                   memberExpireDate: null
                }
              }
            });
          }
        }
        
        this.setData({
          userInfo: {
            ...this.data.userInfo,
            memberLevel: memberLevel,
            expireDate: expireDate,
            memberExpireDate: memberExpireDate
          },
          memberPrivileges: memberPrivileges,
          isLoading: false
        });
        
        console.log('加载会员信息成功:', {
          memberLevel,
          expireDate,
          originalExpireDate: userData.expireDate,
           memberExpireDate: memberExpireDate
        });
      } else {
        // 获取失败，使用默认值
        this.setData({
          userInfo: {
            ...this.data.userInfo,
            memberLevel: 0,
            expireDate: null
          },
          memberPrivileges: ['基础内容访问', '基础功能使用'],
          isLoading: false
        });
      }
    } catch (error) {
      console.error('加载会员信息失败:', error);
      this.setData({
        userInfo: {
          ...this.data.userInfo,
          memberLevel: 0,
          expireDate: null
        },
        memberPrivileges: ['基础内容访问', '基础功能使用'],
        isLoading: false
      });
      this.handleError('网络错误，请重试');
    }
  },

  /**
   * 加载会员套餐
   */
  loadMemberPlans: async function() {
    try {
      // 调用云函数获取会员套餐列表
      const result = await wx.cloud.callFunction({
        name: 'member',
        data: {
          action: 'getMemberPlans'
        }
      });
      
      if (result.result && result.result.success) {
        this.setData({
          memberPlans: result.result.data.plans
        });
        console.log('加载会员套餐成功:', result.result.data.plans);
      } else {
        console.error('获取会员套餐失败:', result.result);
        this.handleError('获取会员套餐失败');
      }
    } catch (error) {
      console.error('加载会员套餐失败:', error);
      this.handleError('网络错误，请重试');
    }
  },

  /**
   * 选择会员方案
   */
  selectPlan: function(e) {
    const planId = e.currentTarget.dataset.id;
    const plan = this.data.memberPlans.find(p => p.id === planId);
    
    if (plan) {
      this.setData({
        selectedPlan: plan
      });
    }
  },

  /**
   * 显示购买确认弹窗
   */
  showPurchaseModal: function() {
    if (!this.data.selectedPlan) {
      // 如果没有选择方案，默认选择推荐方案
      const recommendedPlan = this.data.memberPlans.find(p => p.recommended) 
                          || this.data.memberPlans[0];
      
      this.setData({
        selectedPlan: recommendedPlan,
        isSelectingPlan: true
      });
    } else {
      this.setData({
        isSelectingPlan: true
      });
    }
  },

  /**
   * 确认购买会员
   */
  confirmPurchase: async function() {
    if (!this.data.selectedPlan) {
      return;
    }

    // 检查用户是否登录
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再购买会员',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }
    
    wx.showLoading({
      title: '创建订单中...',
    });
    
    try {
      // 调用微信支付云函数创建订单
      const orderResult = await wx.cloud.callFunction({
        name: 'wxpayFunctions',
        data: {
          type: 'wxpay_order',
          description: `小舟摇星河-${this.data.selectedPlan.name}`,
          amount: {
            total: this.data.selectedPlan.price * 100, 
            currency: 'CNY'
          },
          planId: this.data.selectedPlan.id,
          planName: this.data.selectedPlan.name
        }
      });

      wx.hideLoading();

      console.log('下单结果: ', orderResult);
      const paymentData = orderResult.result.data;
      
      if (paymentData) {
        // 唤起微信支付组件，完成支付
        wx.requestPayment({
          timeStamp: paymentData?.timeStamp,
          nonceStr: paymentData?.nonceStr,
          package: paymentData?.packageVal,
          paySign: paymentData?.paySign,
          signType: 'RSA', // 该参数为固定值
          success: (res) => {
            // 支付成功回调，实现自定义的业务逻辑
            console.log('唤起支付组件成功：', res);
            this.handlePaymentSuccess(paymentData.out_trade_no);
          },
          fail: (err) => {
            // 支付失败回调
            console.error('唤起支付组件失败：', err);
            if (err.errMsg === 'requestPayment:fail cancel') {
              wx.showToast({
                title: '支付已取消',
                icon: 'none'
              });
            } else {
              wx.showToast({
                title: '支付失败，请重试',
                icon: 'none'
              });
            }
          },
          complete: () => {
            this.setData({ isSelectingPlan: false });
          }
        });
      } else {
        wx.showToast({
          title: '创建订单失败，请重试',
          icon: 'none'
        });
        this.setData({ isSelectingPlan: false });
      }
    } catch (error) {
      console.error('创建订单失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
      this.setData({ isSelectingPlan: false });
    }
  },

  /**
   * 处理支付成功
   */
  handlePaymentSuccess: async function(outTradeNo) {
    try {
      wx.showLoading({
        title: '处理中...',
      });

      // 调用云函数更新会员状态
      console.log('准备调用 updateMemberStatus 云函数:', {
        planId: this.data.selectedPlan.id,
        planName: this.data.selectedPlan.name,
        amount: this.data.selectedPlan.price,
        outTradeNo: outTradeNo
      });
      
      const updateResult = await wx.cloud.callFunction({
        name: 'profile',
        data: {
          action: 'updateMemberStatus',
          data: {
            planId: this.data.selectedPlan.id,
            planName: this.data.selectedPlan.name,
            amount: this.data.selectedPlan.price,
            outTradeNo: outTradeNo
          }
        }
      });

      console.log('云函数调用结果:', updateResult);
      wx.hideLoading();

      if (updateResult.result && updateResult.result.success) {
        // 更新本地会员状态
        this.setData({
          userInfo: {
            ...this.data.userInfo,
            memberLevel: updateResult.result.data.memberLevel,
            expireDate: updateResult.result.data.expireDate,
            memberExpireDate: new Date(updateResult.result.data.expireDate).toString()
          },
          memberPrivileges: ['无广告浏览', '专属内容访问', '高级功能使用', '专属客服服务']
        });
        
        console.log('会员状态更新成功:', {
          memberLevel: updateResult.result.data.memberLevel,
          expireDate: updateResult.result.data.expireDate,
          planId: updateResult.result.data.planId,
          planName: updateResult.result.data.planName
        });

        wx.showToast({
          title: '开通成功',
          icon: 'success'
        });

        // 重新加载会员信息以确保数据同步
        await this.loadMemberInfo();
        
        // 发送订阅消息
        this.requestSubscribeMessage();
      } else {
        console.error('云函数返回失败:', updateResult.result);
        wx.showToast({
          title: updateResult.result?.message || '会员状态更新失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('更新会员状态失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '处理失败，请联系客服',
        icon: 'none'
      });
    }
  },

  /**
   * 计算会员过期时间
   */
  calculateExpireDate: function() {
    const now = new Date();
    const monthsMap = {
      'plan1': 1,
      'plan2': 3,
      'plan3': 6,
      'plan4': 12
    };

    const months = monthsMap[this.data.selectedPlan.id] || 1;
    now.setMonth(now.getMonth() + months);
    return now.toISOString().split('T')[0];
  },

  /**
   * 请求订阅消息授权
   */
  requestSubscribeMessage: function() {
    wx.requestSubscribeMessage({
      tmplIds: ['YOUR_TEMPLATE_ID'], // 替换为您的订阅消息模板ID
      success: (res) => {
        console.log('订阅消息授权成功', res);
      },
      fail: (err) => {
        console.error('订阅消息授权失败', err);
      }
    });
  },

  /**
   * 取消购买
   */
  cancelPurchase: function() {
    this.setData({
      selectedPlan: null,
      isSelectingPlan: false
    });
  },

  /**
   * 处理错误
   */
  handleError: function(message) {
    this.setData({ isLoading: false });
    wx.showToast({
      title: message,
      icon: 'none'
    });
  }
})