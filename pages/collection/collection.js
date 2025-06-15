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
    this.loadBookmarkedArticles();
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
  loadBookmarkedArticles: function() {
    this.setData({ isLoading: true });

    // 获取收藏的文章ID列表
    wx.getStorage({
      key: 'bookmarkedArticles',
      success: (res) => {
        const bookmarkIds = res.data || [];
        
        if (bookmarkIds.length === 0) {
          this.setData({
            bookmarkedArticles: [],
            isLoading: false
          });
          return;
        }
        
        // 获取收藏文章的详细信息
        this.getArticlesByIds(bookmarkIds);
      },
      fail: () => {
        // 没有收藏文章
        this.setData({
          bookmarkedArticles: [],
          isLoading: false
        });
      }
    });
  },

  /**
   * 根据ID列表获取文章详细信息
   */
  getArticlesByIds: function(articleIds) {
    // 在实际项目中，应该通过API获取文章详情
    // wx.request({
    //   url: 'https://your-api-domain.com/api/articles/batch',
    //   method: 'POST',
    //   data: { ids: articleIds },
    //   success: (res) => {
    //     if (res.statusCode === 200 && res.data.success) {
    //       this.setData({
    //         bookmarkedArticles: res.data.data,
    //         isLoading: false
    //       });
    //     }
    //   },
    //   fail: () => {
    //     this.setData({ isLoading: false });
    //   }
    // });

    // 开发阶段使用模拟数据
    setTimeout(() => {
      // 模拟文章标题列表
      const articleTitles = {
        'art1': '韦伯望远镜发现系外行星含有水分子',
        'art2': '探索宇宙奥秘：从星辰大海到深空探索',
        'art3': '2023年10月猎户座流星雨观测指南',
        'art4': '银河系中心黑洞的最新研究成果',
        'art5': '如何用智能手机拍摄星空',
        'art6': '天文摄影入门：器材选择与使用技巧',
        'art7': '太阳系外行星探测的新方法',
        'art8': '黑洞照片背后的故事：事件视界望远镜项目',
        'art9': '2023年值得关注的天文现象',
        'art10': '业余天文学家如何参与科学研究'
      };
      
      const mockArticles = articleIds.map((id, index) => {
        return {
          id: id,
          title: articleTitles[id] || `天文文章 ${index + 1}：关于宇宙的探索`,
          coverUrl: '/assets/images/article_cover_' + (Math.floor(Math.random() * 5) + 1) + '.jpg',
          author: '晓视界编辑',
          date: this.getRandomDate(),
          intro: '这是一篇关于宇宙探索的精彩文章，探讨了最新的天文发现和科学研究进展...',
          views: Math.floor(Math.random() * 10000) + 100,
          likes: Math.floor(Math.random() * 500) + 10
        };
      });

      this.setData({
        bookmarkedArticles: mockArticles,
        isLoading: false
      });
    }, 500);
  },

  /**
   * 生成随机日期
   */
  getRandomDate: function() {
    const now = new Date();
    const days = Math.floor(Math.random() * 30);
    const date = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  },

  /**
   * 跳转到文章详情页
   */
  navigateToArticle: function(e) {
    const articleId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/article_detail/article_detail?id=${articleId}`,
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
  removeBookmark: function(e) {
    const articleId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '取消收藏',
      content: '确定要取消收藏这篇文章吗？',
      success: (res) => {
        if (res.confirm) {
          // 获取当前收藏文章列表
          wx.getStorage({
            key: 'bookmarkedArticles',
            success: (res) => {
              let bookmarkedArticles = res.data || [];
              
              // 移除选中的文章
              bookmarkedArticles = bookmarkedArticles.filter(id => id !== articleId);
              
              // 更新存储
              wx.setStorage({
                key: 'bookmarkedArticles',
                data: bookmarkedArticles,
                success: () => {
                  // 更新显示
                  this.loadBookmarkedArticles();
                  
                  wx.showToast({
                    title: '已取消收藏',
                    icon: 'success'
                  });
                }
              });
            }
          });
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
