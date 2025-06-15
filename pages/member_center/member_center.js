Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    userInfo: {
      nickName: "晓视界用户",
      avatarUrl: "",
      memberLevel: 0, // 0-非会员, 1-会员
      expireDate: ""
    },
    memberPlans: [
      {
        id: 'plan1',
        name: '月度会员',
        price: 15.00,
        originalPrice: 30.00,
        period: '1个月',
        recommended: false
      },
      {
        id: 'plan2',
        name: '季度会员',
        price: 36.00,
        originalPrice: 90.00,
        period: '3个月',
        recommended: false
      },
      {
        id: 'plan3',
        name: '半年会员',
        price: 68.00,
        originalPrice: 180.00,
        period: '6个月',
        recommended: true
      },
      {
        id: 'plan4',
        name: '年度会员',
        price: 118.00,
        originalPrice: 360.00,
        period: '12个月',
        recommended: false
      }
    ],
    promotionImage: '/assets/images/member_promotion.jpg',
    isSelectingPlan: false,
    selectedPlan: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadMemberInfo();
    this.loadPromotionImage();
    this.loadMemberPlans();
  },

  /**
   * 加载会员信息
   */
  loadMemberInfo: function() {
    this.setData({ isLoading: true });
    
    // 预留API接口，从后端获取会员信息
    // wx.request({
    //   url: 'https://your-api-domain.com/api/user/member-info',
    //   method: 'GET',
    //   header: {
    //     'Authorization': `Bearer ${wx.getStorageSync('token')}`
    //   },
    //   success: (res) => {
    //     if (res.statusCode === 200) {
    //       this.setData({
    //         userInfo: res.data.data || this.data.userInfo,
    //         isLoading: false
    //       });
    //     } else {
    //       this.handleError('加载会员信息失败');
    //     }
    //   },
    //   fail: () => {
    //     this.handleError('网络错误，请重试');
    //   }
    // });
    
    // 开发阶段使用模拟数据
    setTimeout(() => {
      this.setData({
        isLoading: false,
        userInfo: {
          nickName: "星空探索者",
          avatarUrl: "/assets/icons/profile.png",
          memberLevel: 0,
          expireDate: ""
        }
      });
    }, 500);
  },

  /**
   * 加载宣传图片
   */
  loadPromotionImage: function() {
    // 预留API接口，从后端获取宣传图片URL
    // wx.request({
    //   url: 'https://your-api-domain.com/api/member/promotion-image',
    //   method: 'GET',
    //   success: (res) => {
    //     if (res.statusCode === 200 && res.data.success) {
    //       this.setData({
    //         promotionImage: res.data.data.imageUrl
    //       });
    //     }
    //   }
    // });
  },

  /**
   * 加载会员方案
   */
  loadMemberPlans: function() {
    // 预留API接口，从后端获取会员方案列表
    // wx.request({
    //   url: 'https://your-api-domain.com/api/member/plans',
    //   method: 'GET',
    //   success: (res) => {
    //     if (res.statusCode === 200 && res.data.success) {
    //       this.setData({
    //         memberPlans: res.data.data.plans || this.data.memberPlans
    //       });
    //     }
    //   }
    // });
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
  confirmPurchase: function() {
    if (!this.data.selectedPlan) {
      return;
    }
    
    wx.showLoading({
      title: '处理中...',
    });
    
    // 预留API接口，提交会员购买请求
    // wx.request({
    //   url: 'https://your-api-domain.com/api/payment/create-member-order',
    //   method: 'POST',
    //   header: {
    //     'Authorization': `Bearer ${wx.getStorageSync('token')}`
    //   },
    //   data: {
    //     planId: this.data.selectedPlan.id,
    //     planName: this.data.selectedPlan.name,
    //     amount: this.data.selectedPlan.price
    //   },
    //   success: (res) => {
    //     if (res.statusCode === 200 && res.data.success) {
    //       // 调用微信支付
    //       wx.requestPayment({
    //         timeStamp: res.data.data.timeStamp,
    //         nonceStr: res.data.data.nonceStr,
    //         package: res.data.data.package,
    //         signType: res.data.data.signType,
    //         paySign: res.data.data.paySign,
    //         success: () => {
    //           wx.showToast({
    //             title: '开通成功',
    //             icon: 'success'
    //           });
    //           this.loadMemberInfo();
    //         },
    //         fail: () => {
    //           wx.showToast({
    //             title: '支付取消',
    //             icon: 'none'
    //           });
    //         }
    //       });
    //     } else {
    //       wx.showToast({
    //         title: '创建订单失败',
    //         icon: 'none'
    //       });
    //     }
    //   },
    //   fail: () => {
    //     wx.showToast({
    //       title: '网络错误',
    //       icon: 'none'
    //     });
    //   },
    //   complete: () => {
    //     wx.hideLoading();
    //     this.setData({ isSelectingPlan: false });
    //   }
    // });
    
    // 开发阶段模拟购买成功
    setTimeout(() => {
      wx.hideLoading();
      this.setData({ 
        isSelectingPlan: false,
        userInfo: {
          ...this.data.userInfo,
          memberLevel: 1,
          expireDate: "2024-12-31"
        }
      });
      wx.showToast({
        title: '开通成功',
        icon: 'success'
      });
    }, 1500);
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