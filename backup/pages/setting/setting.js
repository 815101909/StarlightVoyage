Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    fontSizeOptions: [
      { label: '小', value: 'small', checked: false },
      { label: '中', value: 'medium', checked: true },
      { label: '大', value: 'large', checked: false }
    ],
    notificationSettings: {
      pushEnabled: true,
      activityNotice: true,
      learningReminder: true,
      marketingInfo: false
    },
    // 外观设置
    darkMode: false,
    // 数据同步设置
    autoSync: true,
    // 网络使用设置
    wifiDownloadOnly: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadSettings();
  },

  /**
   * 加载用户设置
   */
  loadSettings: function () {
    // 从本地存储加载设置
    const settings = wx.getStorageSync('userSettings');
    
    if (settings) {
      try {
        const parsedSettings = JSON.parse(settings);
        // 设置字体大小
        if (parsedSettings.fontSize) {
          const fontSizeOptions = this.data.fontSizeOptions.map(option => {
            return {
              ...option,
              checked: option.value === parsedSettings.fontSize
            };
          });
          this.setData({ fontSizeOptions });
        }
        
        // 设置通知选项
        if (parsedSettings.notificationSettings) {
          this.setData({
            notificationSettings: {
              ...this.data.notificationSettings,
              ...parsedSettings.notificationSettings
            }
          });
        }
        
        // 设置外观模式
        if (typeof parsedSettings.darkMode !== 'undefined') {
          this.setData({ darkMode: parsedSettings.darkMode });
        }
        
        // 设置数据同步
        if (typeof parsedSettings.autoSync !== 'undefined') {
          this.setData({ autoSync: parsedSettings.autoSync });
        }
        
        // 设置网络使用
        if (typeof parsedSettings.wifiDownloadOnly !== 'undefined') {
          this.setData({ wifiDownloadOnly: parsedSettings.wifiDownloadOnly });
        }
      } catch (e) {
        console.error('解析设置出错:', e);
      }
    }
    
    this.setData({ isLoading: false });
  },

  /**
   * 保存所有设置
   */
  saveSettings: function () {
    const selectedFontSize = this.data.fontSizeOptions.find(option => option.checked)?.value || 'medium';
    
    const settings = {
      fontSize: selectedFontSize,
      notificationSettings: this.data.notificationSettings,
      darkMode: this.data.darkMode,
      autoSync: this.data.autoSync,
      wifiDownloadOnly: this.data.wifiDownloadOnly
    };
    
    try {
      wx.setStorageSync('userSettings', JSON.stringify(settings));
      wx.showToast({
        title: '设置已保存',
        icon: 'success'
      });
    } catch (e) {
      console.error('保存设置出错:', e);
      wx.showToast({
        title: '保存设置失败',
        icon: 'none'
      });
    }
  },

  /**
   * 切换字体大小
   */
  onFontSizeChange: function (e) {
    const { value } = e.detail;
    const fontSizeOptions = this.data.fontSizeOptions.map(option => {
      return {
        ...option,
        checked: option.value === value
      };
    });
    
    this.setData({ fontSizeOptions }, () => {
      this.saveSettings();
    });
  },

  /**
   * 切换通知设置
   */
  toggleNotification: function (e) {
    const { setting } = e.currentTarget.dataset;
    const value = !this.data.notificationSettings[setting];
    
    // 如果关闭总开关，所有子开关也关闭
    if (setting === 'pushEnabled' && !value) {
      this.setData({
        'notificationSettings.pushEnabled': false,
        'notificationSettings.activityNotice': false,
        'notificationSettings.learningReminder': false,
        'notificationSettings.marketingInfo': false
      }, () => {
        this.saveSettings();
      });
      return;
    }
    
    // 如果打开了某个子开关，确保总开关打开
    if (setting !== 'pushEnabled' && value) {
      this.setData({
        [`notificationSettings.${setting}`]: value,
        'notificationSettings.pushEnabled': true
      }, () => {
        this.saveSettings();
      });
      return;
    }
    
    this.setData({
      [`notificationSettings.${setting}`]: value
    }, () => {
      this.saveSettings();
    });
  },

  /**
   * 切换暗黑模式
   */
  toggleDarkMode: function () {
    this.setData({
      darkMode: !this.data.darkMode
    }, () => {
      this.saveSettings();
      
      // 可能需要通知应用其他部分更改主题
      getApp().globalData.darkMode = this.data.darkMode;
      
      // 显示提示消息
      wx.showToast({
        title: this.data.darkMode ? '已切换为暗黑模式' : '已切换为浅色模式',
        icon: 'none'
      });
    });
  },

  /**
   * 切换自动同步
   */
  toggleAutoSync: function () {
    this.setData({
      autoSync: !this.data.autoSync
    }, () => {
      this.saveSettings();
    });
  },

  /**
   * 切换仅在WiFi下下载
   */
  toggleWifiDownload: function () {
    this.setData({
      wifiDownloadOnly: !this.data.wifiDownloadOnly
    }, () => {
      this.saveSettings();
    });
  },

  /**
   * 重置所有设置
   */
  resetSettings: function () {
    wx.showModal({
      title: '重置设置',
      content: '确定要将所有设置恢复到默认状态吗？',
      success: (res) => {
        if (res.confirm) {
          const defaultSettings = {
            fontSizeOptions: [
              { label: '小', value: 'small', checked: false },
              { label: '中', value: 'medium', checked: true },
              { label: '大', value: 'large', checked: false }
            ],
            notificationSettings: {
              pushEnabled: true,
              activityNotice: true,
              learningReminder: true,
              marketingInfo: false
            },
            darkMode: false,
            autoSync: true,
            wifiDownloadOnly: false
          };
          
          this.setData(defaultSettings, () => {
            this.saveSettings();
            
            wx.showToast({
              title: '已恢复默认设置',
              icon: 'success'
            });
          });
        }
      }
    });
  }
}); 