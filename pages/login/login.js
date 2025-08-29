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
   * 手机号快捷登录（新版API方式）
   */
  getPhoneNumber: function(e) {
    console.log('getPhoneNumber 被调用，事件详情：', e.detail);
    
    // 检查用户是否同意了隐私政策
    if (!this.data.policyChecked) {
      this.showPolicyTip();
      return;
    }
    
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      // 用户允许授权手机号
      const code = e.detail.code;
      
      console.log('手机号授权成功，动态令牌：', {
        hasCode: !!code,
        codeLength: code ? code.length : 0
      });
      
      if (code) {
        console.log('获取到动态令牌，准备调用云函数');
        // 直接使用动态令牌调用云函数
        this.callPhoneLoginCloudFunction(code);
      } else {
        console.error('未获取到动态令牌 code');
        wx.showToast({
          title: '获取手机号令牌失败，请重试',
          icon: 'none'
        });
      }
    } else {
      // 用户拒绝授权手机号或其他错误
      console.log('手机号授权失败：', e.detail.errMsg);
      
      // 检查是否是用户主动拒绝授权
      if (e.detail.errMsg.includes('cancel') || e.detail.errMsg.includes('拒绝')) {
        // 用户主动拒绝授权
        wx.showToast({
          title: '您拒绝了授权，无法使用手机号登录',
          icon: 'none',
          duration: 3000
        });
      } else {
        // 其他错误，直接显示验证指引
        console.log('手机号授权失败，显示验证指引：', e.detail.errMsg);
        this.showPhoneVerificationGuide();
      }
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
    wx.navigateTo({
      url: '/pages/privacy/privacy?tab=1'
    });
  },
  
  /**
   * 查看隐私政策
   */
  viewPrivacyPolicy: function() {
    wx.navigateTo({
      url: '/pages/privacy/privacy?tab=0'
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
      avatar: userInfo.avatarUrl || "",  // 修正字段名
      userId: userInfo.userId || Date.now().toString(),
      phoneNumber: userInfo.phoneNumber || "",
      // 添加其他必要字段
      continuousDays: 0,  // 连续打卡天数
      favorites: [],      // 收藏列表
      lastCheckinDate: null,  // 最后打卡日期
      monthlyCheckins: {},    // 月度打卡记录
      signature: "",      // 个性签名
      tags: [],          // 用户标签
      learningGoal: "",  // 学习目标
      createTime: new Date(),
      updateTime: new Date()
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
   * 调用手机号登录云函数（新版API）
   */
  callPhoneLoginCloudFunction: function(code) {
    console.log('开始调用手机号登录云函数，参数：', {
      action: 'phoneLogin',
      hasCode: !!code,
      codeLength: code ? code.length : 0
    });
    
    // 如果没有code，说明是前端授权失败，直接显示验证指引
    if (!code) {
      console.log('没有获取到code，直接显示验证指引');
      this.showPhoneVerificationGuide();
      return;
    }
    
    wx.showLoading({
      title: '登录中...'
    });
    
    // 调用手机号登录云函数
    wx.cloud.callFunction({
      name: 'phoneLogin',
      data: {
        action: 'phoneLogin',
        code: code
      },
      success: (res) => {
        console.log('云函数调用成功，返回结果：', res);
        wx.hideLoading();
        
        if (res.result && res.result.success) {
          // 登录成功，保存token
          if (res.result.data.token) {
            wx.setStorageSync('token', res.result.data.token);
          }
          
          // 保存用户信息
          this.saveUserInfo(res.result.data.userInfo);
          
          // 显示登录成功提示
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });
          
          // 调用登录成功处理
          this.handleLoginSuccess(res.result.data.userInfo);
          
        } else {
          // 根据错误类型显示不同的提示
          let errorMessage = res.result.message || '登录失败，请重试';
          
          if (res.result.errorCode === 'PHONE_API_FAILED') {
             // 手机号获取失败
             wx.showToast({
               title: res.result.message || '手机号获取失败，请稍后重试',
               icon: 'none',
               duration: 3000
             });
           } else if (res.result.errorCode === 'PHONE_VERIFICATION_REQUIRED') {
             // 需要验证手机号，直接调用验证指引
             this.showPhoneVerificationGuide();
           } else if (res.result.errorCode === 'PHONE_API_RATE_LIMIT') {
             // API调用频率限制
             wx.showToast({
               title: 'API调用过于频繁，请稍后重试',
               icon: 'none',
               duration: 3000
             });
           } else if (res.result.errorCode === 'SESSION_EXPIRED') {
             // 登录凭证过期
             wx.showToast({
               title: '登录凭证已过期，请重新授权',
               icon: 'none',
               duration: 3000
             });
           } else {
              // 其他错误
              wx.showToast({
                title: errorMessage,
                icon: 'none',
                duration: 3000
              });
            }
        }
      },
      fail: (error) => {
        wx.hideLoading();
        console.error('手机号登录云函数调用失败：', error);
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 显示手机号验证指南
   */
  showPhoneVerificationGuide: function() {
    wx.showModal({
      title: '微信手机号验证指引',
      content: '您的微信手机号需要验证，请按以下步骤操作：\n\n📱 在微信APP中：\n1. 点击右下角"我"\n2. 点击"设置"\n3. 点击"账号与安全"\n4. 点击"手机号"\n5. 按提示完成短信验证\n\n✅ 验证完成后：\n重新打开小程序尝试手机号登录\n\n💡 提示：这是微信官方的安全验证要求',
      showCancel: true,
      cancelText: '微信登录',
      confirmText: '我知道了',
      success: (modalRes) => {
        if (modalRes.cancel) {
          // 用户选择微信登录作为替代方案
          this.getUserInfo();
        }
      }
    });
  },

  handleLoginSuccess: async function(userInfo) {
    try {
      wx.showLoading({
        title: '登录中...',
        mask: true
      });

      // 获取用户信息（这里会自动创建新用户）
      const profileResult = await wx.cloud.callFunction({
        name: 'auth',
        data: {
          action: 'getProfile'
        }
      });

      if (profileResult.result.success) {
        // 保存登录状态和用户信息
        wx.setStorageSync('token', 'logged_in');
        wx.setStorageSync('userInfo', profileResult.result.data);

        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500
        });

        // 延迟返回，确保toast显示完整
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(profileResult.result.message || '获取用户信息失败');
      }
    } catch (error) {
      console.error('登录失败：', error);
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  }
});