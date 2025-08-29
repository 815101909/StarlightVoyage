// app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-1gsyt78b92c539ef', // 替换为您的云环境ID
        traceUser: true,
      })
    }
  },
  
  onShow() {
    // 小程序显示时触发
    this.checkLoginStatus();
  },
  
  onHide() {
    // 小程序隐藏时触发
  },
  
  // 检查登录状态
  checkLoginStatus() {
    try {
      const token = wx.getStorageSync('token');
      const userInfo = wx.getStorageSync('userInfo');
      
      if (token && userInfo) {
        this.globalData.isLoggedIn = true;
        this.globalData.userInfo = userInfo;
      } else {
        this.globalData.isLoggedIn = false;
        this.globalData.userInfo = null;
      }
    } catch (e) {
      console.error('检查登录状态失败:', e);
      this.globalData.isLoggedIn = false;
    }
  },
  
  // 判断用户是否已登录
  isUserLoggedIn() {
    return this.globalData.isLoggedIn;
  },
  
  // 获取用户信息
  getUserInfo() {
    return this.globalData.userInfo;
  },
  
  // 用户登录
  login(userInfo) {
    // 检查是否是首次登录（注册）
    const isFirstLogin = !wx.getStorageSync('userInfo');
    
    console.log('app.login 设置用户信息:', userInfo);
    console.log('是否首次登录:', isFirstLogin);
    
    // 更新全局状态
    this.globalData.isLoggedIn = true;
    this.globalData.userInfo = userInfo;
    this.globalData.isFirstLogin = isFirstLogin;
    
    // 如果是首次登录，记录下来
    if (isFirstLogin) {
      wx.setStorageSync('isFirstLogin', 'true');
    }
  },
  
  // 判断是否是首次登录（注册）
  isFirstLogin() {
    return !!wx.getStorageSync('isFirstLogin');
  },
  
  // 清除首次登录标记（在加载完用户资料后调用）
  clearFirstLoginFlag() {
    wx.removeStorageSync('isFirstLogin');
    this.globalData.isFirstLogin = false;
  },
  
  // 用户退出登录
  logout() {
    try {
      wx.removeStorageSync('token');
      wx.removeStorageSync('userInfo');
      this.globalData.isLoggedIn = false;
      this.globalData.userInfo = null;
    } catch (e) {
      console.error('退出登录失败:', e);
    }
  },
  
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    // 使用云开发模式 (环境ID已配置，现在启用云开发)
    useCloudAPI: true,
    // API基础URL (备用方案)
    apiBaseUrl: 'http://localhost:3000/api', // 开发环境 - 修改为包含/api的路径
    // apiBaseUrl: 'https://api.xingxing.com', // 生产环境
    // 星座数据
    constellations: [],
    // 天文事件
    astronomicalEvents: [],
    // 用户观测记录
    observations: [],
    // 主题设置
    theme: 'dark'
  }
}) 