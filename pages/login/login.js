Page({
  /**
   * 页面的初始数据
   */
  data: {
    policyChecked: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 切换隐私政策选择状态
   */
  togglePolicy: function() {
    this.setData({
      policyChecked: !this.data.policyChecked
    });
  },
  
  /**
   * 微信一键登录
   */
  getUserInfo: function(e) {
    // 检查用户是否同意了隐私政策
    if (!this.data.policyChecked) {
      this.showPolicyTip();
      return;
    }
    
    // 判断用户授权结果
    if (e.detail.userInfo) {
      // 用户允许授权
      const userInfo = e.detail.userInfo;
      console.log('微信授权用户信息:', userInfo);
      
      // 保存用户信息到本地
      this.saveUserInfo(userInfo);
      
      // 调用登录接口获取code
      wx.login({
        success: (res) => {
          if (res.code) {
            console.log('登录code:', res.code);
            // 开发阶段，直接模拟登录成功
            this.loginSuccess({
              nickName: userInfo.nickName,
              avatarUrl: userInfo.avatarUrl
            });
            
            // 实际开发时需要调用后端登录接口
            // this.callLoginApi(res.code, userInfo);
          } else {
            wx.showToast({
              title: '登录失败: ' + res.errMsg,
              icon: 'none'
            });
          }
        }
      });
    } else {
      // 用户拒绝授权
      wx.showToast({
        title: '您拒绝了授权，无法使用微信一键登录',
        icon: 'none'
      });
    }
  },
  
  /**
   * 手机号快捷登录
   */
  getPhoneNumber: function(e) {
    // 检查用户是否同意了隐私政策
    if (!this.data.policyChecked) {
      this.showPolicyTip();
      return;
    }
    
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      // 用户允许授权手机号
      const encryptedData = e.detail.encryptedData;
      const iv = e.detail.iv;
      
      // 调用登录接口获取code
      wx.login({
        success: (res) => {
          if (res.code) {
            console.log('登录code:', res.code);
            
            // 开发阶段，模拟登录成功
            this.loginSuccess({
              nickName: '晓视界用户',
              avatarUrl: '',
              phoneNumber: '13*****6789' // 模拟手机号
            });
            
            // 实际开发时需要调用后端解密手机号
            // this.callPhoneLoginApi(res.code, encryptedData, iv);
          } else {
            wx.showToast({
              title: '登录失败: ' + res.errMsg,
              icon: 'none'
            });
          }
        }
      });
    } else {
      // 用户拒绝授权手机号
      wx.showToast({
        title: '您拒绝了授权，无法使用手机号登录',
        icon: 'none'
      });
    }
  },
  
  /**
   * 游客模式登录
   */
  guestLogin: function() {
    wx.showToast({
      title: '您将以游客身份浏览',
      icon: 'none'
    });
    
    // 返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },
  
  /**
   * 查看用户协议
   */
  viewUserAgreement: function() {
    wx.showModal({
      title: '用户协议',
      content: '《晓视界》用户协议内容...',
      showCancel: false,
      confirmText: '我知道了'
    });
  },
  
  /**
   * 查看隐私政策
   */
  viewPrivacyPolicy: function() {
    wx.showModal({
      title: '隐私政策',
      content: '《晓视界》隐私政策内容...',
      showCancel: false,
      confirmText: '我知道了'
    });
  },
  
  /**
   * 显示隐私政策提示
   */
  showPolicyTip: function() {
    wx.showToast({
      title: '请先同意用户协议和隐私政策',
      icon: 'none'
    });
  },
  
  /**
   * 保存用户信息到本地
   */
  saveUserInfo: function(userInfo) {
    try {
      console.log('保存用户信息:', userInfo);
      wx.setStorageSync('userInfo', userInfo);
    } catch (e) {
      console.error('保存用户信息失败:', e);
    }
  },
  
  /**
   * 登录成功处理
   */
  loginSuccess: function(userInfo) {
    // 获取app实例
    const app = getApp();
    
    // 检查是否是首次登录（注册）
    const isFirstTimeUser = !wx.getStorageSync('userInfo');
    
    // 确保用户信息完整
    const completeUserInfo = {
      nickName: userInfo.nickName || "晓视界用户",
      avatarUrl: userInfo.avatarUrl || "",
      // 添加其他必要字段
      userId: userInfo.userId || Date.now().toString(),
      phoneNumber: userInfo.phoneNumber || ""
    };
    
    // 设置登录态
    const token = 'demo_token_' + new Date().getTime();
    console.log('设置登录token:', token);
    wx.setStorageSync('token', token);
    
    // 保存用户信息
    this.saveUserInfo(completeUserInfo);
    
    // 更新app全局登录状态
    app.login(completeUserInfo);
    
    // 显示登录成功提示
    wx.showToast({
      title: isFirstTimeUser ? '注册成功' : '登录成功',
      icon: 'success'
    });
    
    // 返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },
  
  /**
   * 调用后端登录接口（实际开发时调用）
   */
  callLoginApi: function(code, userInfo) {
    // 这里调用后端接口，进行登录验证
    wx.request({
      url: 'https://your-api-domain.com/api/login',
      method: 'POST',
      data: {
        code: code,
        userInfo: userInfo
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          // 登录成功，保存token
          wx.setStorageSync('token', res.data.data.token);
          
          // 显示登录成功提示
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });
          
          // 返回上一页
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          wx.showToast({
            title: res.data.message || '登录失败，请重试',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },
  
  /**
   * 调用后端手机号登录接口（实际开发时调用）
   */
  callPhoneLoginApi: function(code, encryptedData, iv) {
    // 这里调用后端接口，解密手机号并进行登录
    wx.request({
      url: 'https://your-api-domain.com/api/login/phone',
      method: 'POST',
      data: {
        code: code,
        encryptedData: encryptedData,
        iv: iv
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          // 登录成功，保存token
          wx.setStorageSync('token', res.data.data.token);
          
          // 保存用户信息
          this.saveUserInfo(res.data.data.userInfo);
          
          // 显示登录成功提示
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });
          
          // 返回上一页
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          wx.showToast({
            title: res.data.message || '登录失败，请重试',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  }
}); 