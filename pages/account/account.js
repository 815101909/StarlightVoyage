Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    userInfo: {
      nickName: "",
      avatarUrl: "",
      phoneNumber: "",
      lastLoginTime: ""
    },
    loginDevices: [
      {
        deviceName: "iPhone 13 Pro",
        loginTime: "2023-05-15 13:45",
        isCurrentDevice: true
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadAccountInfo();
  },

  /**
   * 加载账号信息
   */
  loadAccountInfo: function () {
    // API预留接口
    // wx.request({
    //   url: 'https://your-api-domain.com/api/user/account',
    //   method: 'GET',
    //   header: {
    //     'Authorization': `Bearer ${wx.getStorageSync('token')}`
    //   },
    //   success: (res) => {
    //     if (res.statusCode === 200 && res.data.success) {
    //       this.setData({
    //         userInfo: res.data.data.userInfo,
    //         loginDevices: res.data.data.loginDevices
    //       });
    //     }
    //   },
    //   complete: () => {
    //     this.setData({ isLoading: false });
    //   }
    // });
    
    // 开发阶段使用模拟数据
    setTimeout(() => {
      const mockUserInfo = {
        nickName: "星空探索者",
        avatarUrl: "/assets/icons/profile.png",
        phoneNumber: "138****1234",
        lastLoginTime: "2023-05-20 18:30"
      };
      
      const mockDevices = [
        {
          deviceName: "iPhone 13 Pro",
          loginTime: "2023-05-20 18:30",
          isCurrentDevice: true
        },
        {
          deviceName: "MacBook Pro",
          loginTime: "2023-05-18 10:15",
          isCurrentDevice: false
        }
      ];
      
      this.setData({
        userInfo: mockUserInfo,
        loginDevices: mockDevices,
        isLoading: false
      });
    }, 500);
  },

  /**
   * 修改密码
   */
  changePassword: function () {
    wx.navigateTo({
      url: '/pages/change_password/change_password'
    });
  },

  /**
   * 更新手机号
   */
  updatePhoneNumber: function () {
    wx.navigateTo({
      url: '/pages/update_phone/update_phone'
    });
  },

  /**
   * 注销设备
   */
  logoutDevice: function (e) {
    const { index } = e.currentTarget.dataset;
    const device = this.data.loginDevices[index];
    
    // 当前设备不能注销
    if (device.isCurrentDevice) {
      wx.showToast({
        title: '无法注销当前设备',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '注销设备',
      content: `确定要注销在 ${device.deviceName} 上的登录吗？`,
      success: (res) => {
        if (res.confirm) {
          // API预留接口
          // wx.request({
          //   url: 'https://your-api-domain.com/api/user/logout-device',
          //   method: 'POST',
          //   data: {
          //     deviceId: device.id
          //   },
          //   header: {
          //     'Authorization': `Bearer ${wx.getStorageSync('token')}`
          //   },
          //   success: (res) => {
          //     if (res.statusCode === 200 && res.data.success) {
          //       // 更新设备列表
          //       const updatedDevices = this.data.loginDevices.filter((_, i) => i !== index);
          //       this.setData({
          //         loginDevices: updatedDevices
          //       });
          //     }
          //   }
          // });
          
          // 开发阶段直接更新状态
          const updatedDevices = this.data.loginDevices.filter((_, i) => i !== index);
          this.setData({
            loginDevices: updatedDevices
          });
          
          wx.showToast({
            title: '已注销该设备',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 账号注销
   */
  deactivateAccount: function () {
    wx.showModal({
      title: '账号注销',
      content: '注销账号后，您的所有数据将被删除且无法恢复。确定要注销账号吗？',
      confirmColor: '#FF0000',
      confirmText: '注销账号',
      success: (res) => {
        if (res.confirm) {
          wx.showModal({
            title: '二次确认',
            content: '请再次确认，注销后所有数据将无法恢复！',
            confirmColor: '#FF0000',
            confirmText: '确认注销',
            success: (innerRes) => {
              if (innerRes.confirm) {
                wx.showLoading({
                  title: '处理中...',
                });
                
                // API预留接口
                // wx.request({
                //   url: 'https://your-api-domain.com/api/user/deactivate',
                //   method: 'POST',
                //   header: {
                //     'Authorization': `Bearer ${wx.getStorageSync('token')}`
                //   },
                //   success: (res) => {
                //     if (res.statusCode === 200 && res.data.success) {
                //       // 清理本地存储
                //       wx.clearStorageSync();
                //       
                //       // 返回登录页
                //       wx.reLaunch({
                //         url: '/pages/login/login'
                //       });
                //     }
                //   },
                //   complete: () => {
                //     wx.hideLoading();
                //   }
                // });
                
                // 开发阶段模拟操作
                setTimeout(() => {
                  wx.hideLoading();
                  
                  wx.showToast({
                    title: '账号已注销',
                    icon: 'success',
                    duration: 2000
                  });
                  
                  setTimeout(() => {
                    // 清理本地存储
                    wx.clearStorageSync();
                    
                    // 返回登录页
                    wx.reLaunch({
                      url: '/pages/login/login'
                    });
                  }, 2000);
                }, 1500);
              }
            }
          });
        }
      }
    });
  }
}); 