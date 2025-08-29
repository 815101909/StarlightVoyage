Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    userInfo: {
      nickName: "小舟用户",
      avatar: "",
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
    avatarText: "舟",  // 默认头像文字
    // 用户标签配置
    tagNames: {
      'newbie': '新手',
      'amateur': '业余天文爱好者',
      'professional': '专业天文学者',
      'photographer': '天文摄影师',
      'explorer': '太空探索爱好者'
    },
    // 学习目标映射
    goalNames: {
      'basic': '了解基础天文知识',
      'observation': '学习天体观测技巧',
      'photography': '掌握天文摄影技术',
      'research': '进行天文研究',
      'equipment': '了解天文设备使用'
    },
    // 活动图标配置（使用emoji替代图片）
    activityIcons: {
      read: '📚',
      checkin: '✨',
      favorite: '⭐',  // 改为 favorite
      observe: '🔭',
      community: '👥',
      watch: '📺'  // 添加观看活动的图标
    },
    // 默认头像配置
    defaultAvatarText: '舟',
    defaultAvatarBgColor: '', // 默认头像背景颜色
    // 活动弹窗相关数据
    showAllActivities: false,  // 是否显示全部活动弹窗
    allActivities: [],        // 存储所有活动
    isLoadingMore: false,     // 是否正在加载更多
    hasMore: true,           // 是否还有更多数据
    currentPage: 1           // 当前页码
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    this.checkLoginStatus();
    this.generateRandomAvatarColor();
  },

  generateRandomAvatarColor: function() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#28C76F',
      '#FF9F43', '#6A057F', '#8D86C9', '#2A2A72', '#F4F4F4'
    ];
    const randomIndex = Math.floor(Math.random() * colors.length);
    this.setData({
      defaultAvatarBgColor: colors[randomIndex]
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 每次显示页面时都检查登录状态并加载数据
    this.checkLoginStatus();
    if (this.data.isLoggedIn) {
      this.loadAllUserData();
    }
  },

  // 加载所有用户数据
  loadAllUserData: async function() {
    try {
      await Promise.all([
        this.loadUserProfile(),
        this.checkDailyCheckin(),
        this.loadRecentActivities()
      ]);
    } catch (error) {
      console.error('加载用户数据失败:', error);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ isLoading: false });
    }
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus: function() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      // 保持tags和learningGoal分开
      this.setData({ 
        isLoggedIn: true,
        userInfo: {
          ...userInfo,
          // 确保userId被包含在内
          userId: userInfo._id || userInfo.userId || '',  // 添加这行，优先使用_id
          // 保持原有的tags和learningGoal
          tags: userInfo.tags || [],
          learningGoal: userInfo.learningGoal || ''
        },
        avatarText: '舟'  // 始终显示"舟"
      });
    } else {
      this.setData({ 
        isLoggedIn: false,
        userInfo: {
          nickName: "小舟用户",
          avatar: "",
          tags: [],
          learningGoal: "",
          memberLevel: 0,
          expireDate: "",
          checkinDays: 0,
          groupCount: 0
        },
        avatarText: '舟'
      });
    }
    this.setData({ isLoading: false });
  },

  /**
   * 处理头像点击
   */
  handleAvatarTap: function() {
    if (!this.data.isLoggedIn) {
      this.showLoginTip();
      return;
    }

    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      camera: 'front',
      sizeType: ['compressed'], // 添加压缩选项
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.uploadAvatar(tempFilePath);
      }
    });
  },

  /**
   * 上传头像
   */
  uploadAvatar: async function(tempFilePath) {
    wx.showLoading({
      title: '上传中...',
      mask: true
    });

    try {
      // 获取本地存储中的userInfo，确保获取最新的userId
      const userInfo = wx.getStorageSync('userInfo');
      const userId = userInfo._id || userInfo.userId || userInfo._openid;  // 按优先级尝试不同的ID字段

      // 检查userId
      if (!userId) {
        console.error('用户信息:', userInfo);
        throw new Error('未找到用户ID，请重新登录');
      }

      // 上传到云存储
      console.log('开始上传文件到云存储');
      const cloudPath = `avatars/${userId}_${Date.now()}.jpg`;
      const uploadResult = await wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: tempFilePath
      });

      console.log('云存储上传结果:', uploadResult);

      if (!uploadResult.fileID) {
        throw new Error('云存储上传失败');
      }

      // 更新用户信息 - 只更新头像字段
      console.log('开始更新用户头像, fileID:', uploadResult.fileID);
      const result = await wx.cloud.callFunction({
        name: 'auth',
        data: {
          action: 'updateProfile',
          profileData: {
            nickName: userInfo.nickName,
            signature: userInfo.signature ,
            tags: userInfo.tags,
            learningGoal: userInfo.learningGoal,
            memberLevel: userInfo.memberLevel,
            expireDate: userInfo.expireDate,
            groupCount: userInfo.groupCount,
            streak: userInfo.streak,
            avatar: uploadResult.fileID
          }
        }
      });

      console.log('更新用户信息结果:', result);

      if (!result.result) {
        throw new Error('云函数返回结果为空');
      }

      if (!result.result.success) {
        // 如果云函数返回了错误信息，则使用该信息
        throw new Error(result.result.message || '更新用户信息失败');
      }

      // 更新成功，更新本地数据
      this.setData({
        'userInfo.avatar': uploadResult.fileID
      });

      // 更新本地存储的用户信息
      const storedUserInfo = wx.getStorageSync('userInfo');
      wx.setStorageSync('userInfo', {
        ...storedUserInfo,
        avatar: uploadResult.fileID
      });

      wx.showToast({
        title: '头像更新成功',
        icon: 'success'
      });
      
    } catch (error) {
      console.error('头像上传失败，详细错误:', error);
      if (error.errMsg) {
        console.error('云函数错误信息:', error.errMsg);
      }
      wx.showToast({
        title: error.message || '头像更新失败',
        icon: 'none',
        duration: 2000
      });
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 加载用户资料
   */
  loadUserProfile: async function() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'auth',
        data: {
          action: 'getProfile'
        }
      });

      if (result.result.success) {
        const userInfo = result.result.data;
        console.log('从云函数获取的 userInfo.expireDate:', userInfo.expireDate);
        
        // 更新页面数据
        this.setData({
          userInfo: {
            nickName: userInfo.nickName || "小舟用户",
            avatar: userInfo.avatar || "",
            userId: userInfo._id || userInfo.userId,  // 确保userId被设置
            signature: userInfo.signature || "",
            tags: userInfo.tags || [],
            learningGoal: userInfo.learningGoal || "",
            memberLevel: userInfo.memberLevel || 0,
            expireDate: userInfo.expireDate || "",
            checkinDays: userInfo.streak || 0,  // 使用streak作为打卡天数
            groupCount: userInfo.groupCount || 0
          }
        });

        // 更新本地存储
        wx.setStorageSync('userInfo', userInfo);
        
        return userInfo;
      } else {
        throw new Error(result.result.message || '获取用户信息失败');
      }
    } catch (error) {
      console.error('加载用户信息失败：', error);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
      return null;
    }
  },

  /**
   * 检查每日打卡状态
   */
  checkDailyCheckin: function() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'profile',
        data: {
          action: 'getCheckinInfo'
        },
        success: (res) => {
          if (res.result && res.result.success) {
            const { todayChecked } = res.result.data;
            this.setData({
              hasCheckedInToday: todayChecked || false
            });
            resolve(todayChecked);
          } else {
            console.error('获取打卡信息失败:', res.result ? res.result.message : '未知错误');
            this.setData({
              hasCheckedInToday: false
            });
            resolve(false);
          }
        },
        fail: (err) => {
          console.error('调用云函数失败:', err);
        this.setData({
            hasCheckedInToday: false
          });
          resolve(false);
        }
        });
    });
  },
  
  /**
   * 加载近期活动记录
   */
  loadRecentActivities: function() {
    return new Promise((resolve) => {
      wx.cloud.callFunction({
        name: 'activity',
        data: {
          action: 'getRecentActivities',
          limit: 6
        },
        success: (res) => {
          if (res.result && res.result.success) {
            this.setData({ activities: res.result.data });
          } else {
            console.error('获取活动记录失败:', res);
            this.setData({ activities: [] });
          }
          resolve();
        },
        fail: (err) => {
          console.error('调用云函数失败:', err);
          this.setData({ activities: [] });
          resolve();
        }
      });
    });
  },
  
  /**
   * 编辑个人资料
   */
  editProfile: function() {
    wx.navigateTo({
      url: '/pages/profile_edit/profile_edit'
    });
  },

  /**
   * 显示登录提示
   */
  showLoginTip: function() {
    wx.showModal({
      title: '提示',
      content: '请先登录',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/login/login'
          });
        }
      }
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

  /**
   * 打开星空许愿页面
   */
  navigateToPlanetWheel: function() {
    wx.navigateTo({
      url: '/pages/wish/wish',
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
  logout: async function() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 更新最后登录时间
            await wx.cloud.callFunction({
              name: 'auth',
              data: {
                action: 'updateProfile',
                profileData: {
                  lastLoginDate: new Date().toISOString(),
                  // 保持其他字段不变
                  nickName: this.data.userInfo.nickName,
                  avatar: this.data.userInfo.avatar,
                  signature: this.data.userInfo.signature,
                  tags: this.data.userInfo.tags,
                  learningGoal: this.data.userInfo.learningGoal,
                  memberLevel: this.data.userInfo.memberLevel,
                  expireDate: this.data.userInfo.expireDate
                }
              }
            });

            // 调用全局的logout方法清除本地存储的用户信息
            getApp().logout();

            // 重置页面数据
            this.setData({
              isLoggedIn: false,
              userInfo: {
                nickName: "小舟用户",
                avatar: "",
                tags: [],
                learningGoal: "",
                memberLevel: 0,
                expireDate: "",
                checkinDays: 0,
                groupCount: 0
              },
              hasCheckedInToday: false,
              activities: [],
              isLoading: false
            });

            wx.showToast({
              title: '退出成功',
              icon: 'success'
            });

            // 刷新当前页面，确保数据更新
            this.onShow();
          } catch (error) {
            console.error('退出登录失败:', error);
            wx.showToast({
              title: '退出失败',
              icon: 'none'
            });
          }
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
    this.setData({
      isLoading: false,
      userInfo: {
        nickName: "星空探索者",
        avatar: "", // 清空默认头像，使用文字替代
        userId: "10086",
        tags: ['amateur', 'photographer'],
        learningGoal: "学习天文摄影技巧",
        memberLevel: Math.floor(Math.random() * 3),
        checkinDays: Math.floor(Math.random() * 30) + 1,
        groupCount: Math.floor(Math.random() * 5) + 1
      }
    });
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
   * 关于小舟摇星河
   */
  aboutApp: function() {
    wx.showModal({
      title: '关于小舟摇星河',
      content: '小舟摇星河专注于天文启蒙教育，融合前沿天文发现与历史性天文事件，引领您探索浩瀚星空的奥秘与美丽。\n\n@小舟摇学习团队 | 探索星空，记录星际之旅',
      confirmText: '了解',
      showCancel: false,
      confirmColor: '#3778FF',
      success: (res) => {
        console.log('用户查看了关于信息');
      }
    });
  },

  // 跳转到登录页面
  navigateToLogin: function() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  // 获取昵称首字母
  getAvatarText: function(nickName) {
    if (!nickName) return "舟";
    return nickName.charAt(0);
  },

  // 更新头像文字
  updateAvatarText: function() {
    const nickName = this.data.userInfo.nickName;
    this.setData({
      avatarText: this.getAvatarText(nickName)
    });
  },

  // 打开活动列表弹窗
  showActivityModal: function() {
    this.setData({
      showAllActivities: true,
      allActivities: [],
      currentPage: 1,
      hasMore: true
    });
    this.loadMoreActivities();
  },

  // 关闭活动列表弹窗
  closeActivityModal: function() {
    this.setData({
      showAllActivities: false
    });
  },

  // 防止穿透滚动
  preventTouchMove: function() {
    return false;
  },

  // 加载更多活动
  loadMoreActivities: function() {
    if (this.data.isLoadingMore || !this.data.hasMore) return;

    this.setData({ isLoadingMore: true });

    // 调用云函数获取活动列表
    wx.cloud.callFunction({
      name: 'activity',
      data: {
        action: 'getRecentActivities',
        page: this.data.currentPage,
        limit: 10
      }
    }).then(res => {
      if (res.result && res.result.success) {
        const newActivities = res.result.data || [];
        
        // 如果返回的数据为空或少于10条，说明没有更多数据了
        const hasMore = newActivities.length === 10;
        
        this.setData({
          allActivities: [...this.data.allActivities, ...newActivities],
          currentPage: this.data.currentPage + 1,
          hasMore: hasMore,
          isLoadingMore: false
        });
      } else {
        throw new Error(res.result ? res.result.message : '获取数据失败');
      }
    }).catch(err => {
      console.error('加载活动失败:', err);
      this.setData({ 
        isLoadingMore: false,
        hasMore: false
      });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    });
  },

  // 格式化时间
  formatTime: function(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
});
