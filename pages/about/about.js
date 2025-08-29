// pages/about/about.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    appInfo: {
      name: '小舟摇星河',
      version: '1.0.3',
      buildNumber: '20250515',
      lastUpdate: '2025-05-15'
    },
    developer: {
      name: '星空科技',
      email: 'xiao_shi_jie@126.com',
      website: 'https://xiaoshijie.com'
    },
    features: [
      { 
        title: '天文知识学习',
        desc: '涵盖从基础到高级的天文知识，包括星座、行星、银河系等',
        icon: '/assets/icons/features/learning.png'
      },
      { 
        title: '星空观测指南',
        desc: '专业的星空观测指导，包括观测时间、位置和条件建议',
        icon: '/assets/icons/features/observation.png'
      },
      { 
        title: '社区交流',
        desc: '连接全球天文爱好者，分享观测经验和精彩瞬间',
        icon: '/assets/icons/features/community.png'
      },
      { 
        title: '个性化学习路径',
        desc: '根据兴趣和水平定制专属学习路径，轻松进阶',
        icon: '/assets/icons/features/path.png'
      }
    ],
    showAchievements: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 检查更新
   */
  checkUpdate: function () {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          wx.showLoading({
            title: '检查更新中',
          });
        } else {
          wx.showToast({
            title: '已经是最新版本',
            icon: 'success'
          });
        }
      });
      
      updateManager.onUpdateReady(function () {
        wx.hideLoading();
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: function (res) {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          }
        });
      });
      
      updateManager.onUpdateFailed(function () {
        wx.hideLoading();
        wx.showToast({
          title: '更新失败，请稍后再试',
          icon: 'none'
        });
      });
    } else {
      wx.showToast({
        title: '当前微信版本过低，无法检查更新',
        icon: 'none'
      });
    }
  },
  
  /**
   * 联系我们
   */
  contactUs: function () {
    wx.setClipboardData({
      data: this.data.developer.email,
      success: () => {
        wx.showToast({
          title: '邮箱已复制',
          icon: 'success'
        });
      }
    });
  },
  
  /**
   * 查看网站
   */
  viewWebsite: function () {
    // 小程序内无法直接跳转外部网站，仅复制网址
    wx.setClipboardData({
      data: this.data.developer.website,
      success: () => {
        wx.showToast({
          title: '网址已复制',
          icon: 'success'
        });
      }
    });
  },
  
  /**
   * 查看成就与荣誉
   */
  toggleAchievements: function () {
    this.setData({
      showAchievements: !this.data.showAchievements
    });
  },
  
  /**
   * 前往反馈
   */
  goToFeedback: function () {
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    });
  },
  
  /**
   * 查看用户协议
   */
  viewUserAgreement: function () {
    wx.navigateTo({
      url: '/pages/privacy/privacy?tab=1'
    });
  },
  
  /**
   * 查看隐私政策
   */
  viewPrivacyPolicy: function () {
    wx.navigateTo({
      url: '/pages/privacy/privacy?tab=0'
    });
  },
  
  /**
   * 分享小程序
   */
  onShareAppMessage: function () {
    return {
      title: '乘小舟摇星河，探索浩瀚星空',
      path: '/pages/welcome/welcome',
      imageUrl: '/assets/images/share-cover.jpg' // 分享封面图
    };
  }
}); 