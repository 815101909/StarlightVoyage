Page({
  data: {
    pageTitle: '学习内容',  // 页面标题，根据类型设置
    section: '',       // 当前查看的区域
    contentList: [],   // 内容列表 - A4图片
    isPlaying: false,  // 是否正在播放音频
    currentPlayingId: '', // 当前播放的内容ID
    audioContext: null,   // 音频上下文
    isLoading: true,    // 是否正在加载内容
    apiBase: 'https://api.yourdomain.com/v1', // API基础URL - 实际项目中需要替换
    starId: '',         // 保存星星ID
  },
  
  // 页面加载
  onLoad: function(options) {
    console.log('detail页面加载，接收到参数：', options);
    
    // 设置默认内容
    this.setData({
      contentList: [{
        id: 'default-beidou',
        mediaUrl: '/pages/star/pic/北斗七星.jpg',
        audioUrl: '/audio/beidou/default.mp3',
        title: '北斗七星'
      }]
    });
    
    // 获取页面参数
    if (options.section) {
      const section = options.section;
      this.setData({
        section: section,
        pageTitle: this.getSectionTitle(section, options.title),
        starId: options.starId || '' // 保存星星ID
      });
      
      // 创建音频上下文
      this.initAudioContext();
      
      // 北斗七星特殊处理
      if (section === 'beidou-star') {
        this.loadBeiDouStarContent(options.starId);
      } else {
        // 获取该分类下的内容列表
        this.fetchContentList(section);
      }
    }
  },
  
  // 页面显示时检查是否需要刷新内容
  onShow: function() {
    // 如果已经有section参数且contentList为空，重新获取内容
    if (this.data.section && this.data.contentList.length === 0) {
      this.fetchContentList(this.data.section);
    }
  },
  
  // 下拉刷新功能
  onPullDownRefresh: function() {
    if (this.data.section) {
      this.fetchContentList(this.data.section, true);
    }
    
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },
  
  // 初始化音频上下文
  initAudioContext: function() {
    const audioContext = wx.createInnerAudioContext();
    
    audioContext.onPlay(() => {
      console.log('开始播放音频');
    });
    
    audioContext.onPause(() => {
      console.log('音频暂停');
    });
    
    audioContext.onStop(() => {
      console.log('音频停止');
      this.setData({
        isPlaying: false,
        currentPlayingId: ''
      });
    });
    
    audioContext.onEnded(() => {
      console.log('音频自然播放结束');
      this.setData({
        isPlaying: false,
        currentPlayingId: ''
      });
    });
    
    audioContext.onError((res) => {
      console.error('音频播放错误：', res);
      wx.showToast({
        title: '音频播放失败',
        icon: 'none'
      });
      this.setData({
        isPlaying: false,
        currentPlayingId: ''
      });
    });
    
    this.audioContext = audioContext;
  },
  
  // 获取分类标题
  getSectionTitle: function(section, customTitle) {
    // 如果有自定义标题，优先使用
    if (customTitle) {
      return decodeURIComponent(customTitle);
    }
    
    const sectionTitles = {
      'universe-structure': '宇宙结构',
      'celestial-types': '天体类型', 
      'energy-fields': '能量与场',
      'where-we-are': '我们在哪',
      'beidou-star': '北斗七星'
    };
    
    return sectionTitles[section] || '学习内容';
  },
  
  // 获取内容列表 - 支持后台动态上传的A4图片和音频
  fetchContentList: function(section, isRefresh = false) {
    if (isRefresh) {
      wx.showLoading({
        title: '刷新内容中...',
      });
    } else if (this.data.isLoading) {
      wx.showLoading({
        title: '加载内容中...',
      });
    }

    // 设置加载状态
    this.setData({ isLoading: true });
    
    // API请求 - 实际项目中需要替换为正确的API接口
    const apiUrl = `${this.data.apiBase}/content/${section}`;
    
    // 实际项目中应调用后端API获取数据
    wx.request({
      url: apiUrl,
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        // 检查响应状态和数据格式
        if (res.statusCode === 200 && res.data) {
          // 格式化API返回的数据
          let contentList = this.formatContentData(res.data, section);
          this.setData({ 
            contentList: contentList,
            isLoading: false
          });
        } else {
          // 使用模拟数据（开发阶段使用）
          this.loadMockData(section);
          console.warn('API返回错误或格式不正确，使用模拟数据');
        }
      },
      fail: (err) => {
        console.error('API请求失败：', err);
        // API请求失败时使用模拟数据（开发阶段使用）
        this.loadMockData(section);
        
        wx.showToast({
          title: '获取内容失败，使用本地数据',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
        this.setData({ isLoading: false });
      }
    });

    // 在实际项目中，启用返回首页功能
    wx.enableAlwaysBackToHome({
      success: (res) => {
        console.log('启用了返回首页功能');
      }
    });
  },
  
  // 格式化API返回的数据
  formatContentData: function(apiData, section) {
    try {
      // 确保API返回的数据格式符合要求
      if (Array.isArray(apiData.contents)) {
        return apiData.contents.map((item, index) => {
          return {
            id: item.id || `${section}-${index}`,
            mediaUrl: item.imageUrl || item.mediaUrl, // 支持不同的API字段名
            audioUrl: item.audioUrl || null,
            title: item.title || '学习内容',
            createdAt: item.createdAt || new Date().toISOString().split('T')[0]
          };
        });
      } else if (apiData.a4Images && Array.isArray(apiData.a4Images)) {
        // 另一种可能的API响应格式
        return apiData.a4Images.map((item, index) => {
          return {
            id: item.id || `${section}-${index}`,
            mediaUrl: item.url,
            audioUrl: item.audioUrl || null,
            title: item.title || '学习内容',
            createdAt: item.createdAt || new Date().toISOString().split('T')[0]
          };
        });
      }
      return [];
    } catch (e) {
      console.error('数据格式化错误：', e);
      return [];
    }
  },
  
  // 加载模拟数据（开发阶段使用）
  loadMockData: function(section) {
    // 模拟数据 - 仅用于开发测试，实际使用时会从后端获取A4图片
    let mockContent = [];
    
    if (section === 'universe-structure') {
      mockContent = [
        {
          id: 'us1',
          mediaUrl: '/pages/star/pic/宇宙结构.jpg',
          audioUrl: null,
        }
      ];
    } else if (section === 'celestial-types') {
      mockContent = [
        {
          id: 'ct1',
          mediaUrl: '/pages/star/pic/天体类型.jpg',
          audioUrl: null,
        }
      ];
    } else if (section === 'energy-fields') {
      mockContent = [
        {
          id: 'ef1',
          mediaUrl: '/pages/star/pic/能量与场.jpg',
          audioUrl: null,
        }
      ];
    } else if (section === 'where-we-are') {
      mockContent = [
        {
          id: 'wwa1',
          mediaUrl: '/pages/star/pic/我们在哪.jpg',
          audioUrl: null,
        }
      ];
    }
    
    this.setData({ contentList: mockContent });
  },
  
  // 播放音频
  playAudio: function(e) {
    const audioId = e.currentTarget.dataset.id;
    const audioUrl = e.currentTarget.dataset.url;
    
    // 如果没有音频URL，提示用户
    if (!audioUrl) {
      console.log('该内容暂无音频');
      wx.showToast({
        title: '该内容暂无音频',
        icon: 'none'
      });
      return;
    }
    
    try {
      // 如果是当前正在播放的音频
      if (this.data.isPlaying && this.data.currentPlayingId === audioId) {
        // 暂停播放
        this.audioContext.pause();
        this.setData({ isPlaying: false });
      } else {
        // 先停止之前可能在播放的音频
        if (this.data.isPlaying) {
          this.audioContext.stop();
        }
        
        // 设置新的音频URL并播放
        this.audioContext.src = audioUrl;
        
        // 尝试播放音频
        try {
          this.audioContext.play();
          
          this.setData({
            isPlaying: true,
            currentPlayingId: audioId
          });
        } catch (error) {
          console.error('音频播放失败:', error);
          wx.showToast({
            title: '音频播放失败',
            icon: 'none'
          });
        }
      }
    } catch (error) {
      console.error('音频操作失败:', error);
      wx.showToast({
        title: '音频播放异常',
        icon: 'none'
      });
    }
  },
  
  // 预览图片
  previewImage: function(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      urls: [url],
      current: url
    });
  },
  
  // 返回上一页
  navigateBack: function() {
    wx.navigateBack({
      fail: function() {
        // 如果navigateBack失败，则跳转到首页
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
    });
  },
  
  // 页面卸载
  onUnload: function() {
    // 停止音频播放
    if (this.audioContext) {
      this.audioContext.stop();
    }
  },
  
  // 加载北斗七星内容
  loadBeiDouStarContent: function(starId) {
    wx.showLoading({
      title: '加载内容中...',
    });
    
    // 此处应该调用API获取后台上传的A4图片
    // 示例API调用，使用starId参数获取特定星星的多张图片
    const apiUrl = `${this.data.apiBase}/content/beidou-star?star=${starId}`;
    // 由于API可能不可用，我们直接使用默认内容
    this.useDefaultContent(starId);
    wx.hideLoading();
    
    // API调用保留，但先注释掉，确保页面始终显示内容
    /*
    wx.request({
      url: apiUrl,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.success) {
          // 后台返回的多张图片和音频处理
          const contentList = res.data.data.map((item, index) => {
            return {
              id: item.id || `beidou-${index}`,
              mediaUrl: item.imageUrl, // 图片URL
              audioUrl: item.audioUrl, // 音频URL
              title: item.title || this.data.pageTitle
            };
          });
          
          this.setData({
            contentList: contentList,
            isLoading: false
          });
        } else {
          // API请求失败时使用默认内容
          this.useDefaultContent(starId);
        }
      },
      fail: (err) => {
        console.error('获取北斗七星内容失败:', err);
        // API请求失败时使用默认内容
        this.useDefaultContent(starId);
      },
      complete: () => {
        wx.hideLoading();
      }
    });
    */
  },
  
  // 使用默认内容
  useDefaultContent: function(starId) {
    // 根据星星ID提供默认映射
    const starName = this.getStarName(starId);
    console.log('使用默认内容，星星ID:', starId, '星星名称:', starName);
    
    // 设置默认内容
    this.setData({
      contentList: [{
        id: `default-${starId || 'beidou'}`,
        mediaUrl: '/pages/star/pic/北斗七星.jpg', // 默认使用同一张图片，实际项目中应替换为对应图片
        audioUrl: '/audio/beidou/default.mp3',
        title: starName || '北斗七星'
      }],
      isLoading: false
    });
  },
  
  // 获取星星名称
  getStarName: function(starId) {
    const starNameMap = {
      'tianShu': '天枢',
      'tianXuan': '天璇',
      'tianJi': '天玑',
      'tianQuan': '天权',
      'yuHeng': '玉衡',
      'kaiYang': '开阳',
      'yaoGuang': '瑶光'
    };
    
    return starId ? starNameMap[starId] || '北斗七星' : '北斗七星';
  },
})
