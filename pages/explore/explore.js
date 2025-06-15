Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 当前日期
    currentDate: '2023-11-15',
    // 当前选中的文章类型标签
    currentTab: 'news',
    
    // 天文时事文章列表
    newsArticles: [
      {
        id: 1,
        title: '韦伯太空望远镜发现系外行星大气中存在水分子',
        coverUrl: 'https://img.tech2ipo.com/upload/img/article/202307/1687945023925.jpg',
        tag: '太空探索',
        date: '2023-11-10',
        summary: '最新研究表明，韦伯太空望远镜通过近红外探测器观测到系外行星WASP-121b大气层中存在水分子，这一发现为研究系外行星宜居性带来重要突破。'
      },
      {
        id: 2,
        title: '中国天眼FAST探测到47颗新脉冲星',
        coverUrl: 'https://img.tech2ipo.com/upload/img/article/202307/1687945267047.jpg',
        tag: '射电天文',
        date: '2023-11-05',
        summary: '中国科学院国家天文台宣布，500米口径球面射电望远镜(FAST)在银河系内新发现47颗脉冲星，这些脉冲星数据将帮助科学家更好地了解星体演化过程。'
      }
    ],
    
    // 天文回顾文章列表
    reviewArticles: [
      {
        id: 101,
        title: '哈勃太空望远镜30周年：改变人类宇宙观的30张照片',
        coverUrl: 'https://img.tech2ipo.com/upload/img/article/202307/1687945460833.jpg', 
        tag: '太空摄影',
        date: '2023-10-25',
        summary: '回顾哈勃太空望远镜服役30年来拍摄的最具影响力的30张宇宙照片，这些图像如何改变了人类对宇宙的认知和理解。'
      },
      {
        id: 102,
        title: '人类首次观测黑洞：事件视界望远镜的突破性成就',
        coverUrl: 'https://img.tech2ipo.com/upload/img/article/202307/1687945890224.jpg',
        tag: '黑洞研究',
        date: '2023-09-15',
        summary: '2019年，事件视界望远镜(EHT)项目公布了人类历史上首张黑洞照片，本文回顾这一突破性科学成就背后的故事和技术挑战。'
      }
    ],
    
    // 视频列表
    videoList: [
      {
        id: 201,
        title: '走近黑洞：宇宙中最神秘天体的秘密',
        coverUrl: 'https://img.tech2ipo.com/upload/img/article/202307/1687946103339.jpg',
        duration: '25:16',
        description: '探索黑洞的形成、演化和影响，了解爱因斯坦相对论如何预测黑洞的存在。',
        date: '2023-11-08',
        views: '25.8万'
      },
      {
        id: 202,
        title: '宇宙中的"化学工厂"：恒星如何制造元素',
        coverUrl: 'https://img.tech2ipo.com/upload/img/article/202307/1687946278567.jpg',
        duration: '18:45',
        description: '从氢和氦到铁和金，了解恒星核心的核聚变如何创造了周期表上的元素。',
        date: '2023-10-20',
        views: '18.3万'
      }
    ],

    // 页码和加载状态
    newsPage: 1,
    reviewPage: 1,
    videoPage: 1,
    isLoading: false,
    hasMore: {
      news: false,
      review: false,
      video: false
    }
  },

  /**
   * 切换文章标签
   */
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab
    });
    
    // 如果对应标签的数据为空，则加载数据
    if (tab === 'news' && this.data.newsArticles.length === 0) {
      this.loadNewsArticles();
    } else if (tab === 'review' && this.data.reviewArticles.length === 0) {
      this.loadReviewArticles();
    }
  },

  /**
   * 加载天文时事文章
   */
  loadNewsArticles: function(date = '') {
    if (this.data.isLoading || !this.data.hasMore.news) return;
    
    this.setData({ isLoading: true });
    
    // 构建请求参数
    const params = {
      page: this.data.newsPage,
      limit: 10
    };
    
    if (date) {
      params.date = date;
    }
    
    // 调用API获取文章列表
    this.requestArticles('news', params);
  },
  
  /**
   * 加载天文回顾文章
   */
  loadReviewArticles: function(date = '') {
    if (this.data.isLoading || !this.data.hasMore.review) return;
    
    this.setData({ isLoading: true });
    
    // 构建请求参数
    const params = {
      page: this.data.reviewPage,
      limit: 10
    };
    
    if (date) {
      params.date = date;
    }
    
    // 调用API获取文章列表
    this.requestArticles('review', params);
  },
  
  /**
   * 加载视频列表
   */
  loadVideos: function(date = '') {
    if (this.data.isLoading || !this.data.hasMore.video) return;
    
    this.setData({ isLoading: true });
    
    // 构建请求参数
    const params = {
      page: this.data.videoPage,
      limit: 10
    };
    
    if (date) {
      params.date = date;
    }
    
    // 调用API获取视频列表
    wx.request({
      url: 'https://your-api-domain.com/api/videos',
      data: params,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          const newVideos = res.data.data.list || [];
          
          // 更新视频列表和分页信息
          this.setData({
            videoList: this.data.videoPage === 1 ? newVideos : [...this.data.videoList, ...newVideos],
            videoPage: this.data.videoPage + 1,
            hasMore: {
              ...this.data.hasMore,
              video: newVideos.length === params.limit
            }
          });
        } else {
          wx.showToast({
            title: '加载视频失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },
  
  /**
   * 请求文章API
   */
  requestArticles: function(type, params) {
    const apiUrl = `https://your-api-domain.com/api/articles/${type}`;
    
    wx.request({
      url: apiUrl,
      data: params,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          const newArticles = res.data.data.list || [];
          const isFirstPage = params.page === 1;
          
          if (type === 'news') {
            this.setData({
              newsArticles: isFirstPage ? newArticles : [...this.data.newsArticles, ...newArticles],
              newsPage: params.page + 1,
              hasMore: {
                ...this.data.hasMore,
                news: newArticles.length === params.limit
              }
            });
          } else if (type === 'review') {
            this.setData({
              reviewArticles: isFirstPage ? newArticles : [...this.data.reviewArticles, ...newArticles],
              reviewPage: params.page + 1,
              hasMore: {
                ...this.data.hasMore,
                review: newArticles.length === params.limit
              }
            });
          }
        } else {
          wx.showToast({
            title: '加载文章失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  /**
   * 上传文章
   */
  uploadArticle: function(articleData, files) {
    return new Promise((resolve, reject) => {
      // 先上传图片文件
      this.uploadFiles(files).then(fileUrls => {
        // 获取上传后的图片URL
        const coverUrl = fileUrls.coverImage;
        
        // 构建文章数据
        const article = {
          ...articleData,
          coverUrl
        };
        
        // 发送请求上传文章内容
        wx.request({
          url: 'https://your-api-domain.com/api/articles',
          method: 'POST',
          data: article,
          success: res => {
            if (res.statusCode === 200 && res.data.success) {
              resolve(res.data);
            } else {
              reject(new Error(res.data.message || '上传文章失败'));
            }
          },
          fail: err => {
            reject(err);
          }
        });
      }).catch(err => {
        reject(err);
      });
    });
  },
  
  /**
   * 上传视频
   */
  uploadVideo: function(videoData, files) {
    return new Promise((resolve, reject) => {
      // 先上传视频文件和封面图
      this.uploadFiles(files).then(fileUrls => {
        // 获取上传后的视频URL和封面URL
        const videoUrl = fileUrls.videoFile;
        const coverUrl = fileUrls.coverImage;
        
        // 构建视频数据
        const video = {
          ...videoData,
          videoUrl,
          coverUrl
        };
        
        // 发送请求上传视频内容
        wx.request({
          url: 'https://your-api-domain.com/api/videos',
          method: 'POST',
          data: video,
          success: res => {
            if (res.statusCode === 200 && res.data.success) {
              resolve(res.data);
            } else {
              reject(new Error(res.data.message || '上传视频失败'));
            }
          },
          fail: err => {
            reject(err);
          }
        });
      }).catch(err => {
        reject(err);
      });
    });
  },
  
  /**
   * 上传文件（图片/视频）
   */
  uploadFiles: function(files) {
    return new Promise((resolve, reject) => {
      const uploadTasks = [];
      const fileUrls = {};
      
      // 遍历文件对象
      Object.keys(files).forEach(key => {
        const filePath = files[key];
        if (!filePath) return;
        
        // 创建上传任务
        const task = new Promise((resolveTask, rejectTask) => {
          wx.uploadFile({
            url: 'https://your-api-domain.com/api/upload',
            filePath: filePath,
            name: 'file',
            formData: {
              type: key
            },
            success: res => {
              const data = JSON.parse(res.data);
              if (data.success) {
                fileUrls[key] = data.data.url;
                resolveTask();
              } else {
                rejectTask(new Error(data.message || '文件上传失败'));
              }
            },
            fail: err => {
              rejectTask(err);
            }
          });
        });
        
        uploadTasks.push(task);
      });
      
      // 等待所有上传任务完成
      Promise.all(uploadTasks)
        .then(() => resolve(fileUrls))
        .catch(err => reject(err));
    });
  },

  /**
   * 打开文章详情
   */
  openArticle: function(e) {
    const id = e.currentTarget.dataset.id;
    const type = e.currentTarget.dataset.type;
    
    wx.navigateTo({
      url: `/pages/article_detail/article_detail?id=${id}&type=${type}`
    });
  },

  /**
   * 播放视频
   */
  playVideo: function(e) {
    const id = e.currentTarget.dataset.id;
    this.playVideoById(id);
  },

  /**
   * 根据ID播放视频
   */
  playVideoById: function(id) {
    // 从API获取视频详情
    wx.request({
      url: `https://your-api-domain.com/api/videos/${id}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          const videoData = res.data.data;
          
          // 跳转到视频播放页
          wx.navigateTo({
            url: `/pages/video/video?id=${id}`
          });
          
          // 记录播放数据
          this.recordVideoPlay(id);
        } else {
          wx.showToast({
            title: '获取视频信息失败',
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
   * 记录视频播放数据
   */
  recordVideoPlay: function(videoId) {
    wx.request({
      url: 'https://your-api-domain.com/api/videos/play',
      method: 'POST',
      data: {
        videoId: videoId
      },
      success: () => {
        console.log('视频播放记录已上传');
      }
    });
  },

  /**
   * 文章日期选择变化处理
   */
  dateChange: function(e) {
    const dateStr = e.detail.value; // 格式为：YYYY-MM-DD
    const [year, month, day] = dateStr.split('-');
    
    const formattedDate = `${year}.${month}.${day}`;
    this.setData({
      currentDate: formattedDate,
      // 重置分页数据
      newsPage: 1,
      reviewPage: 1,
      hasMore: {
        ...this.data.hasMore,
        news: true,
        review: true
      }
    });
    
    // 根据当前选中的标签和日期加载数据
    if (this.data.currentTab === 'news') {
      this.loadNewsArticles(dateStr);
    } else {
      this.loadReviewArticles(dateStr);
    }
  },

  /**
   * 视频日期选择变化处理
   */
  videoDateChange: function(e) {
    const dateStr = e.detail.value; // 格式为：YYYY-MM-DD
    const [year, month, day] = dateStr.split('-');
    
    this.setData({
      currentDate: `${year}.${month}.${day}`,
      // 重置分页数据
      videoPage: 1,
      hasMore: {
        ...this.data.hasMore,
        video: true
      }
    });
    
    // 加载对应日期的视频数据
    this.loadVideos(dateStr);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // 设置当前日期
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    this.setData({
      currentDate: formattedDate
    });
    
    // 由于已经预先设置了mock数据，不需要在这里加载
    // 真实环境下，这里会调用loadNewsArticles等方法从API获取数据
  },
  
  /**
   * 初始加载数据
   */
  loadInitialData: function() {
    // 加载天文时事文章
    this.loadNewsArticles();
    
    // 加载视频列表
    this.loadVideos();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    // 根据当前标签加载更多数据
    if (this.data.currentTab === 'news') {
      this.loadNewsArticles();
    } else if (this.data.currentTab === 'review') {
      this.loadReviewArticles();
    }
  },

  /**
   * 视频列表触底加载更多
   */
  loadMoreVideos: function() {
    this.loadVideos();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 页面显示时的逻辑
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: '探索宇宙的奥秘',
      path: '/pages/explore/explore',
      imageUrl: '/assets/images/share/explore_share.jpg'
    };
  }
}) 