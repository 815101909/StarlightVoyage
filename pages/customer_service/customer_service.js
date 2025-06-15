Page({
  /**
   * 页面的初始数据
   */
  data: {
    contactInfo: {
      email: 'xiao_shi_jie@126.com',
      wechat: 'xiaoshijie_wx'
    },
    qrCodeUrl: '', // 微信客服二维码URL
    isLoading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.loadQRCode();
  },

  /**
   * 加载微信公众号二维码
   */
  loadQRCode: function() {
    // 预留API接口，从后台获取二维码
    // wx.request({
    //   url: 'https://your-api-domain.com/api/qrcode/customer-service',
    //   method: 'GET',
    //   success: (res) => {
    //     if (res.statusCode === 200 && res.data.success) {
    //       this.setData({
    //         qrCodeUrl: res.data.data.qrCodeUrl,
    //         isLoading: false
    //       });
    //     } else {
    //       this.handleLoadError();
    //     }
    //   },
    //   fail: (err) => {
    //     console.error('获取二维码失败：', err);
    //     this.handleLoadError();
    //   }
    // });

    // 开发阶段使用本地图片
    // 注意：实际项目中应该从API获取二维码
    setTimeout(() => {
      this.setData({
        qrCodeUrl: '/assets/images/wechat_qrcode.jpg',
        isLoading: false
      });
    }, 500);
  },

  /**
   * 处理加载错误
   */
  handleLoadError: function() {
    this.setData({ isLoading: false });
    wx.showToast({
      title: '二维码加载失败',
      icon: 'none'
    });
  },

  /**
   * 复制微信号
   */
  copyWechat: function() {
    wx.setClipboardData({
      data: this.data.contactInfo.wechat,
      success: () => {
        wx.showToast({
          title: '微信号已复制',
          icon: 'success'
        });
      }
    });
  },

  /**
   * 复制邮箱
   */
  copyEmail: function() {
    wx.setClipboardData({
      data: this.data.contactInfo.email,
      success: () => {
        wx.showToast({
          title: '邮箱已复制',
          icon: 'success'
        });
      }
    });
  },

  /**
   * 预览二维码
   */
  previewQRCode: function() {
    if (this.data.qrCodeUrl) {
      wx.previewImage({
        urls: [this.data.qrCodeUrl],
        current: this.data.qrCodeUrl
      });
    }
  }
}) 