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
      userId: "",
      createdAt: "",
      lastLoginTime: ""
    }
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
  loadAccountInfo: async function () {
    try {
      const app = getApp();
      
      // 从云数据库获取用户信息
      const db = wx.cloud.database();
      const userResult = await db.collection('users')
        .where({
          _openid: app.globalData.openid
        })
        .get();

      if (userResult.data && userResult.data.length > 0) {
        const userData = userResult.data[0];
        
        // 更新用户数据到本地存储
        wx.setStorageSync('userInfo', userData);
        wx.setStorageSync('lastLoginTime', new Date().toISOString());

        this.setData({
          userInfo: {
            nickName: userData.nickName || '未设置昵称',
            avatarUrl: userData.avatar || '',
            phoneNumber: userData.phoneNumber || '未绑定',
            userId: userData.userId || '未生成',
            createdAt: this.formatTime(new Date(userData.createdAt)) || '未知',
            lastLoginTime: this.formatTime(new Date())
          },
          isLoading: false
        });

      } else {
        this.setData({
          userInfo: {
            nickName: '未设置昵称',
            avatarUrl: '',
            phoneNumber: '未绑定',
            userId: '未生成',
            createdAt: '未知',
            lastLoginTime: this.formatTime(new Date())
          },
          isLoading: false
        });
      }

    } catch (error) {
      console.error('加载账号信息失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ isLoading: false });
    }
  },

  /**
   * 复制用户ID
   */
  copyUserId: function () {
    const userId = this.data.userInfo.userId;
    if (userId && userId !== '未生成') {
      wx.setClipboardData({
        data: userId,
        success: function () {
          wx.showToast({
            title: '用户ID已复制',
            icon: 'success',
            duration: 2000
          });
        },
        fail: function () {
          wx.showToast({
            title: '复制失败',
            icon: 'none'
          });
        }
      });
    } else {
      wx.showToast({
        title: '用户ID未生成',
        icon: 'none'
      });
    }
  },

  formatTime: function (date) {
    try {
      if (!(date instanceof Date) || isNaN(date)) {
        return '时间格式错误';
      }

      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hour = date.getHours().toString().padStart(2, '0');
      const minute = date.getMinutes().toString().padStart(2, '0');
      return `${year}年${month}月${day}日 ${hour}:${minute}`;
    } catch (error) {
      console.error('时间格式化错误:', error);
      return '时间格式错误';
    }
  }
});