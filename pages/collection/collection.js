Page({
  /**
   * 页面的初始数据
   */
  data: {
    bookmarkedArticles: [],
    isLoading: false,
    isLoggedIn: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.checkLoginStatus();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.checkLoginStatus();
    if (this.data.isLoggedIn) {
      this.loadBookmarkedArticles();
    }
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus: function() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    console.log('收藏页面检查登录状态:', !!token);
    console.log('用户信息:', userInfo);
    
    this.setData({
      isLoggedIn: !!token
    });
    
    if (!token) {
      wx.showToast({
        title: '请先登录以查看收藏',
        icon: 'none'
      });
    }
  },

  /**
   * 加载收藏的文章
   */
  loadBookmarkedArticles: async function() {
    if (!this.data.isLoggedIn) {
      return;
    }
    
    this.setData({ isLoading: true });

    try {
      // 调用云函数获取用户收藏列表
      const result = await wx.cloud.callFunction({
        name: 'profile',
        data: {
          action: 'getFavorites'
        }
      });
      
      if (result.result.success) {
        const favorites = result.result.data || [];
        this.setData({
          bookmarkedArticles: favorites,
          isLoading: false
        });
      } else {
        this.setData({
          bookmarkedArticles: [],
          isLoading: false
        });
        
        wx.showToast({
          title: '获取收藏失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('获取收藏列表失败:', error);
      this.setData({
        bookmarkedArticles: [],
        isLoading: false
      });
      
      wx.showToast({
        title: '获取收藏失败',
        icon: 'none'
      });
    }
  },

  /**
   * 跳转到文章详情页
   */
  navigateToArticle: function(e) {
    const articleId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/article_detail/article_detail?articleId=${articleId}`,
      fail: () => {
        wx.showToast({
          title: '页面开发中',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 移除收藏
   */
  removeBookmark: async function(e) {
    const articleId = e.currentTarget.dataset.id;
    const articleTitle = e.currentTarget.dataset.title || '';
    
    wx.showModal({
      title: '取消收藏',
      content: '确定要取消收藏这篇文章吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 调用云函数取消收藏
            const result = await wx.cloud.callFunction({
              name: 'profile',
              data: {
                action: 'toggleFavorite',
                data: {
                  articleId,
                  title: articleTitle
                }
              }
            });
            
            if (result.result.success) {
              // 重新加载收藏列表
              this.loadBookmarkedArticles();
              
              wx.showToast({
                title: '已取消收藏',
                icon: 'success'
              });
            } else {
              wx.showToast({
                title: result.result.message || '操作失败',
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('取消收藏失败:', error);
            wx.showToast({
              title: '操作失败，请稍后再试',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  /**
   * 跳转到登录页
   */
  navigateToLogin: function() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  /**
   * 跳转到探索页
   */
  navigateToExplore: function() {
    wx.switchTab({
      url: '/pages/explore/explore'
    });
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation: function(e) {
    // 阻止事件冒泡
  }
})
