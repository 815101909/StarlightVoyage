Page({
  /**
   * 页面的初始数据
   */
  data: {
    contactInfo: {
      email: 'xiaoxiaovision@foxmail.com',
      wechat: 'xiaovisiontogether'
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
  loadQRCode: async function() {
    try {
      // 使用云存储文件链接
      const cloudFileId = 'cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1370520707/wx_QR/20250810-155526.png';
      
      // 获取临时链接
      const result = await wx.cloud.getTempFileURL({
        fileList: [cloudFileId]
      });
      
      if (result.fileList && result.fileList[0] && result.fileList[0].tempFileURL) {
        this.setData({
          qrCodeUrl: result.fileList[0].tempFileURL,
          isLoading: false
        });
      } else {
        this.handleLoadError();
      }
    } catch (error) {
      console.error('获取二维码临时链接失败：', error);
      this.handleLoadError();
    }
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