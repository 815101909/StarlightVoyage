Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    userInfo: {
      nickName: "晓视界用户",
      avatarUrl: "",
      tags: [],
      learningGoal: "",
      memberLevel: 0,
      expireDate: "",
      checkinDays: 0,
      groupCount: 0
    },
    isLoggedIn: false,
    hasCheckedInToday: false,
    activities: [], // 用户近期活动记录
    stats: {
      totalGroupMembers: 2345
    },
    tagNames: {
      'newbie': '新手',
      'amateur': '业余天文爱好者',
      'professional': '专业天文学者',
      'photographer': '天文摄影师',
      'explorer': '太空探索爱好者'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    this.checkLoginStatus();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (this.data.isLoggedIn) {
      this.loadUserProfile();
      this.checkDailyCheckin();
      this.loadRecentActivities();
    }
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus: function() {
    const token = wx.getStorageSync('token');
    
    if (token) {
      this.setData({ isLoggedIn: true });
      this.loadUserProfile();
      this.checkDailyCheckin();
      this.loadRecentActivities();
    } else {
      // 开发阶段使用模拟数据
      this.setData({ isLoggedIn: true });
      // 实际使用时可能需要重定向到登录页
      // wx.redirectTo({
      //   url: '/pages/login/login'
      // });
      this.loadMockUserData();
    }
  },

  /**
   * 加载用户资料
   */
  loadUserProfile: function() {
    this.setData({ isLoading: true });
    
    // API预留接口
    // wx.request({
    //   url: 'https://your-api-domain.com/api/user/profile',
    //   method: 'GET',
    //   header: {
    //     'Authorization': `Bearer ${wx.getStorageSync('token')}`
    //   },
    //   success: (res) => {
    //     if (res.statusCode === 200 && res.data.success) {
    //       this.setData({
    //         userInfo: res.data.data
    //       });
    //     }
    //   },
    //   complete: () => {
    //     this.setData({ isLoading: false });
    //   }
    // });
    
    // 开发阶段使用模拟数据
    setTimeout(() => {
      // 生成随机连续打卡天数
      const checkinDays = Math.floor(Math.random() * 30) + 1;
      // 随机会员状态
      const memberLevel = Math.floor(Math.random() * 3);
      // 随机生成会员过期日期
      const today = new Date();
      const expireDate = new Date(today);
      expireDate.setDate(today.getDate() + Math.floor(Math.random() * 180) + 30);
      const expireDateString = expireDate.getFullYear() + '-' + 
                              (expireDate.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                              expireDate.getDate().toString().padStart(2, '0');
      
      this.setData({ 
        isLoading: false,
        hasCheckedInToday: Math.random() > 0.5, // 随机打卡状态
        userInfo: {
          nickName: "星空探索者",
          avatarUrl: "/assets/icons/profile.png",
          userId: "10086",
          memberLevel: memberLevel,
          expireDate: expireDateString,
          checkinDays: checkinDays,
          groupCount: Math.floor(Math.random() * 5) + 1
        },
        stats: {
          totalGroupMembers: 128 + Math.floor(Math.random() * 200) // 随机总人数
        }
      });
    }, 500);
  },

  /**
   * 检查每日打卡状态
   */
  checkDailyCheckin: function() {
    // API预留接口
    // wx.request({
    //   url: 'https://your-api-domain.com/api/starcheckin/status',
    //   method: 'GET',
    //   header: {
    //     'Authorization': `Bearer ${wx.getStorageSync('token')}`
    //   },
    //   success: (res) => {
    //     if (res.statusCode === 200 && res.data.success) {
    //       this.setData({ 
    //         hasCheckedInToday: res.data.data.hasCheckedIn
    //       });
    //     }
    //   }
    // });
    
    // 开发阶段使用模拟数据
    this.setData({ hasCheckedInToday: false });
  },
  
  /**
   * 加载近期活动记录
   */
  loadRecentActivities: function() {
    // API预留接口
    // wx.request({
    //   url: 'https://your-api-domain.com/api/user/activities',
    //   method: 'GET',
    //   header: {
    //     'Authorization': `Bearer ${wx.getStorageSync('token')}`
    //   },
    //   data: {
    //     limit: 5  // 获取最近5条记录
    //   },
    //   success: (res) => {
    //     if (res.statusCode === 200 && res.data.success) {
    //       this.setData({ 
    //         activities: res.data.data.list
    //       });
    //     }
    //   }
    // });
    
    // 开发阶段使用模拟数据
    this.loadMockActivities();
  },
  
  /**
   * 加载模拟活动数据
   */
  loadMockActivities: function() {
    const mockActivities = [
      {
        id: 'act1',
        type: 'read',
        title: '阅读了《探索宇宙奥秘：从星辰大海到深空探索》',
        time: '今天 14:30'
      },
      {
        id: 'act2',
        type: 'checkin',
        title: '完成了今日星空打卡',
        time: '今天 09:15'
      },
      {
        id: 'act3',
        type: 'collection',
        title: '收藏了文章《韦伯望远镜发现系外行星含有水分子》',
        time: '昨天 18:22'
      },
      {
        id: 'act4',
        type: 'observe',
        title: '参与了"木星观测"活动',
        time: '3天前'
      },
      {
        id: 'act5',
        type: 'community',
        title: '加入了"银河观测小组"',
        time: '1周前'
      }
    ];
    
    this.setData({ activities: mockActivities });
  },

  /**
   * 编辑个人资料
   */
  editProfile: function() {
    wx.navigateTo({
      url: '/pages/profile_edit/profile_edit',
      fail: () => {
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 显示登录提示
   */
  showLoginTip: function() {
    wx.showToast({
      title: '请先登录',
      icon: 'none'
    });
  },

  /**
   * 导航到其他页面
   */
  navigateTo: function(e) {
    const path = e.currentTarget.dataset.path;
    wx.navigateTo({
      url: path,
      fail: () => {
        wx.showToast({
          title: '页面开发中',
          icon: 'none'
        });
      }
    });
  },

  navigateToPlanetWheel: function() {
    wx.navigateTo({
      url: '/pages/planet_wheel/planet_wheel',
      fail: () => {
        wx.showToast({
          title: '页面开发中',
          icon: 'none'
        });
      }
    });
  },
  
  /**
   * 联系客服
   */
  contactCustomerService: function() {
    // 直接跳转到客服页面
    wx.navigateTo({
      url: '/pages/customer_service/customer_service'
    });
  },

  /**
   * 显示收藏信息
   */
  showCollectionInfo: function() {
    // 检查登录状态
    if (!this.data.isLoggedIn) {
      // 未登录时，提示用户登录
      wx.showModal({
        title: '提示',
        content: '请先登录后再查看收藏',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }
    
    // 已登录，跳转到收藏页面
    wx.navigateTo({
      url: '/pages/collection/collection',
      fail: (err) => {
        console.error('导航到收藏页面失败', err);
        wx.showToast({
          title: '该功能开发中',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 关于系统
   */
  aboutSystem: function() {
    // 跳转到系统消息页面
    wx.navigateTo({
      url: '/pages/system_message/system_message'
    });
  },
  
  /**
   * 退出登录
   */
  logout: function() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录状态和用户信息
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          
          // 更新页面状态
          this.setData({
            isLoggedIn: false,
            userInfo: {
              nickName: "晓视界用户",
              avatarUrl: "",
              tags: [],
              learningGoal: "",
              memberLevel: 0,
              expireDate: "",
              checkinDays: 0,
              groupCount: 0
            },
            hasCheckedInToday: false
          });
          
          // 重新加载模拟活动数据
          this.loadMockActivities();
          
          // 提示用户已退出登录
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 打开会员中心
   */
  openMemberCenter: function() {
    // 跳转到会员中心页面
    wx.navigateTo({
      url: '/pages/member_center/member_center'
          });
  },

  /**
   * 打开星空打卡页面
   */
  openStarCheckin: function() {
    wx.navigateTo({
      url: '/pages/starcheckin/starcheckin'
    });
  },

  /**
   * 加载模拟用户数据
   */
  loadMockUserData: function() {
    // 模拟数据
    const mockData = {
      isLoggedIn: true,
      userInfo: {
        nickName: "星空探索者",
        avatarUrl: "/assets/icons/default_avatar.png",
        tags: ['amateur', 'photographer'],
        learningGoal: "学习天文摄影技巧，拍摄星空。",
        memberLevel: 0,
        expireDate: "",
        checkinDays: 8,
        groupCount: 2
      },
      hasCheckedInToday: false
    };
    
    this.setData({
      isLoggedIn: mockData.isLoggedIn,
      userInfo: mockData.userInfo,
      hasCheckedInToday: mockData.hasCheckedInToday,
      isLoading: false
    });
    
    // 加载活动数据
    this.loadMockActivities();
  },
  
  /**
   * 清理缓存
   */
  cleanCache: function() {
    wx.showModal({
      title: '缓存管理',
      content: '确定要清除应用缓存吗？这将不会删除您的个人数据和登录状态。',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '正在清理...',
          });
          
          // 清理本地缓存数据，但保留登录信息
          const token = wx.getStorageSync('token');
          const userInfo = wx.getStorageSync('userInfo');
          
          wx.clearStorageSync();
          
          // 恢复登录信息
          if (token) {
            wx.setStorageSync('token', token);
          }
          if (userInfo) {
            wx.setStorageSync('userInfo', userInfo);
          }
          
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({
              title: '缓存已清理',
              icon: 'success'
            });
          }, 800);
        }
      }
    });
  },

  /**
   * 关于晓视界
   */
  aboutApp: function() {
    wx.showModal({
      title: '关于晓视界',
      content: '晓视界专注于天文启蒙教育，融合前沿天文发现与历史性天文事件，引领您探索浩瀚星空的奥秘与美丽。\n\n@晓学习团队 | 探索星空，记录星际之旅',
      confirmText: '了解',
      showCancel: false,
      confirmColor: '#3778FF',
      success: (res) => {
        console.log('用户查看了关于信息');
      }
    });
  },

  navigateToLogin: function() {
    wx.showToast({
      title: '登录功能开发中',
      icon: 'none'
    });
  },
});
