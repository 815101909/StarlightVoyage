Page({
  data: {
    pageTitle: '学习内容',  // 页面标题，根据类型设置
    section: '',       // 当前查看的区域
    contentList: [],   // 内容列表 - 知识点
    isLoading: true,    // 是否正在加载内容
    apiBase: 'https://api.yourdomain.com/v1', // API基础URL - 实际项目中需要替换
    starId: '',         // 保存星星ID
    showDescriptions: true, // 始终显示描述
    currentImageIndex: 0,  // 当前显示的图片索引
    cardData: {
      title: '',
      imageUrl: '',
      imageUrls: [],      // 支持多图片
      videoUrls: [],      // 支持多视频
      mediaItems: []      // 支持混合媒体
    }
  },
  
  // 页面加载
  onLoad: function(options) {
    // 初始化空的内容列表和加载状态
    this.setData({
      contentList: [],
      isLoading: true,
      showDescriptions: true
    });
    
    // 获取页面参数
    if (options.section) {
      const section = options.section;
      this.setData({
        section: section,
        pageTitle: this.getSectionTitle(section, options.title),
        starId: options.starId || '' // 保存星星ID
      });
      
      // 北斗七星特殊处理
      if (section === 'beidou-star') {
        this.loadBeiDouStarContent(options.starId);
      } else {
        // 获取该分类下的内容列表
        this.fetchContentList(section);
      }
    } else {
      const cardId = options.cardId;
      if (cardId) {
        this.loadCardData(cardId);
      } else {
        wx.showToast({
          title: '卡片ID不存在',
          icon: 'none',
          duration: 2000
        });
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
  
  // 获取内容列表 - 使用云开发API
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
    
    // 获取categoryKey（section ID 到中文类别的映射）
    const categoryMap = {
      'universe-structure': '宇宙结构',
      'celestial-types': '天体类型',
      'energy-fields': '能量与场',
      'where-we-are': '我们在哪'
    };
    
    // 根据section确定是哪种类型的内容
    if (['universe-structure', 'celestial-types', 'energy-fields', 'where-we-are'].includes(section)) {
      // 检查是否启用云开发
      const app = getApp();
      if (app.globalData.useCloudAPI) {
        // 使用云开发API
        this.fetchContentFromCloud(section, categoryMap[section]);
      } else {
        // 使用传统API
        this.fetchContentFromTraditionalAPI(section, categoryMap[section]);
      }
    } else {
      // 其他类型的内容，使用模拟数据
      this.loadMockData(section);
      wx.hideLoading();
      this.setData({ isLoading: false });
    }
  },

  // 从云开发获取内容
  fetchContentFromCloud: function(section, category) {
    const { videoAPI } = require('../../utils/cloudApi');
    
    // 使用section作为category查询
    videoAPI.getA4Content(section).then(async (response) => {
      // 检查返回格式并获取内容
      if (!response.success) {
        throw new Error(response.message || '获取内容失败');
      }
      
      // 获取第一条内容
      const content = response.data[0];
      if (!content) {
        throw new Error('未找到相关内容');
      }
      
      // 转换云存储URL为HTTP URL
      let imageUrls = [];
      if (content.imageUrls && content.imageUrls.length > 0) {
        try {
          const result = await wx.cloud.getTempFileURL({
            fileList: content.imageUrls
          });
          imageUrls = result.fileList.map(item => item.tempFileURL);
        } catch (error) {
          wx.showToast({
            title: '图片URL转换失败',
            icon: 'none',
            duration: 2000
          });
        }
      }
      
      // 转换封面图URL
      let coverUrl = content.coverUrl;
      if (coverUrl && coverUrl.startsWith('cloud://')) {
        try {
          const result = await wx.cloud.getTempFileURL({
            fileList: [coverUrl]
          });
          coverUrl = result.fileList[0].tempFileURL;
        } catch (error) {
          wx.showToast({
            title: '封面图URL转换失败',
            icon: 'none',
            duration: 2000
          });
        }
      }
      
      // 构建contentList，使用转换后的URL
      const contentList = [{
        id: content._id,
        title: content.title,
        description: content.description,
        imageUrls: imageUrls,  // 使用转换后的URL数组
        imageUrl: coverUrl,    // 使用转换后的封面URL
        category: content.category
      }];
      
      // 更新页面数据
      this.setData({ 
        contentList: contentList,
        isLoading: false,
        showDescriptions: true,
        currentImageIndex: 0
      }, () => {
        wx.hideLoading();
      });
    }).catch((error) => {
      this.setData({ isLoading: false }, () => {
        wx.hideLoading();
        wx.showToast({
          title: error.message || '获取内容失败',
          icon: 'none',
          duration: 2000
        });
      });
    });
  },

  // 从传统API获取内容
  fetchContentFromTraditionalAPI: function(section, category) {
      // 宇宙知识A4页面API
      wx.request({
        url: `${getApp().globalData.apiBaseUrl}/star/a4content`,
        method: 'GET',
        data: {
          category: category
        },
        timeout: 10000, // 设置10秒超时
        success: (res) => {
          if (res.data && res.data.success && res.data.data) {
            // 获取API返回的数据
            let content = res.data.data;
            
            // 确保description字段存在
            let description = content.description || '';
            if (!description && typeof content === 'object') {
              // 尝试从其他可能的字段获取描述
              description = content.desc || content.text || '';
            }
            
            // 转换为contentList格式
            const contentList = [{
              id: `${section}-1`,
              title: content.title || category,
              description: description || "宇宙知识内容描述",
              imageUrl: content.imageUrl || ''
            }];
            
            this.setData({ 
              contentList: contentList,
              isLoading: false,
              showDescriptions: true
            });
            
            wx.hideLoading();
          } else {
            // API返回错误时使用模拟数据
            this.loadMockData(section);
          }
        },
        fail: (err) => {
          // API请求失败时使用模拟数据
          this.loadMockData(section);
          
          if (err.errMsg.includes('timeout')) {
            wx.showToast({
              title: '请求超时',
              icon: 'none',
              duration: 2000
            });
          } else {
            wx.showToast({
              title: '网络错误',
              icon: 'none',
              duration: 2000
            });
          }
        },
        complete: () => {
          wx.hideLoading();
        }
      });
  },

  // 图片加载成功
  onImageLoad: function(e) {
    // 图片加载成功，不需要特殊处理
  },

  // 图片加载失败
  onImageError: function(e) {
    wx.showToast({
      title: '图片加载失败',
      icon: 'none',
      duration: 2000
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
          title: '宇宙结构全图',
          description: '从微观粒子到宏观宇宙，探索宇宙的层次结构与演化历程，包括量子领域、恒星系统、星系团和宇宙大尺度结构。',
          imageUrl: '/uploads/images/universe_structure_a4.jpg'
        }
      ];
    } else if (section === 'celestial-types') {
      mockContent = [
        {
          id: 'ct1',
          title: '天体分类与特性',
          description: '恒星、行星、彗星、黑洞等天体的详细分类、形成过程及物理特性介绍。',
          imageUrl: '/uploads/images/天体类型.jpg'
        }
      ];
    } else if (section === 'energy-fields') {
      mockContent = [
        {
          id: 'ef1',
          title: '宇宙四大基本力',
          description: '引力、电磁力、强弱核力等宇宙基本作用力的详细解析，以及它们如何塑造宇宙。',
          imageUrl: '/uploads/images/能量与场.jpg'
        }
      ];
    } else if (section === 'where-we-are') {
      mockContent = [
        {
          id: 'wwa1',
          title: '人类在宇宙中的位置',
          description: '从地球、太阳系、银河系到本星系群，探索人类在浩瀚宇宙中的位置。',
          imageUrl: '/uploads/images/我们在哪.jpg'
        }
      ];
    }
    
    this.setData({ 
      contentList: mockContent,
      showDescriptions: true
    });
  },
  
  // 返回上一页
  // 返回上一页
  navigateBack: function() {
  wx.navigateBack({
  delta: 1,
  fail: function() {
  // 如果返回失败，则跳转到首页
  wx.switchTab({
  url: '/pages/index/index'
  });
  }
  });
  },
  
  // 页面卸载
  onUnload: function() {
    // 音频功能已移除
  },
  
  // 加载北斗七星内容
  loadBeiDouStarContent: function(starId) {
    if (!starId) {
      this.useDefaultContent(starId);
      return;
    }
    
    wx.showLoading({
      title: '加载知识卡片...',
    });
    
    // 检查是否启用云开发
    const app = getApp();
    if (app.globalData.useCloudAPI) {
      // 使用云开发API获取北斗星知识卡片
      const { observationAPI } = require('../../utils/cloudApi');
      
      console.log('正在调用云函数获取北斗星数据，starId:', starId);
      
      observationAPI.getBeidouCard(starId).then((response) => {
        console.log('云函数返回结果:', response);
        
        // 检查返回结果的结构
        if (response && response.success && response.data) {
          const cardData = response.data;
          console.log('获取到的卡片数据:', cardData);
          
          if (cardData && cardData._id && cardData.title) {
          // 构建媒体内容数组
          let mediaItems = [];
          
          // 处理混合媒体数组（优先）
          if (cardData.mediaUrls && Array.isArray(cardData.mediaUrls) && cardData.mediaUrls.length > 0) {
            mediaItems = cardData.mediaUrls.map(item => ({
              url: item.url,
              type: item.type || 'image'
            }));
          } else {
            // 处理图片
            if (cardData.imageUrls && Array.isArray(cardData.imageUrls)) {
              mediaItems = cardData.imageUrls.map(url => ({
                url: url,
                type: 'image'
              }));
            } else if (cardData.imageUrl) {
              mediaItems.push({
                url: cardData.imageUrl,
                type: 'image'
              });
            }
            
            // 处理视频
            if (cardData.videoUrls && Array.isArray(cardData.videoUrls)) {
              const videoItems = cardData.videoUrls.map(url => ({
                url: url,
                type: 'video'
              }));
              mediaItems = [...mediaItems, ...videoItems];
            }
          }
          
          // 兼容旧的图片格式
          let imageUrls = mediaItems.filter(item => item.type === 'image').map(item => item.url);
          
          // 转换为页面需要的格式
          const contentList = [{
            id: cardData._id,
            title: cardData.title,
            description: cardData.description,
            content: cardData.content,
            imageUrl: imageUrls.length > 0 ? imageUrls[0] : '',  // 兼容单图格式
            imageUrls: imageUrls,  // 支持多图格式（兼容）
            mediaItems: mediaItems,  // 新的媒体数组（图片+视频）
            tags: cardData.tags || [],
            difficulty: cardData.difficulty || '',
            readTime: cardData.readTime || '',
            category: cardData.category || '',
            starName: cardData.starName || '',
            relatedTopics: cardData.relatedTopics || []
          }];
          
          this.setData({
            contentList: contentList,
            isLoading: false,
            showDescriptions: true,
            currentImageIndex: 0  // 重置图片索引
          });
          
          wx.hideLoading();
        } else {
          console.log('卡片数据不完整或获取失败');
          this.useDefaultContent(starId);
          wx.hideLoading();
        }
      } else {
        console.log('云函数调用失败或返回格式错误:', response);
        this.useDefaultContent(starId);
        wx.hideLoading();
      }
      }).catch((err) => {
        console.error('云函数调用异常:', err);
        this.useDefaultContent(starId);
        wx.hideLoading();
      });
    } else {
      // 使用传统API（暂时使用默认内容）
      this.useDefaultContent(starId);
      wx.hideLoading();
    }
  },
  
  // 使用默认内容（云数据库无数据时）
  useDefaultContent: function(starId) {
    // 根据星星ID提供默认映射
    const starName = this.getStarName(starId);
    
    // 设置提示内容，引导用户检查云数据库
    this.setData({
      contentList: [{
        id: `nodata-${starId || 'beidou'}`,
        title: starName || '北斗七星',
        description: '正在从云数据库获取数据，请确保云数据库中已上传北斗七星图片数据。如果长时间无响应，请联系管理员检查云数据库连接。',
        imageUrl: '',
        imageUrls: [],
        mediaItems: []
      }],
      isLoading: false,
      showDescriptions: true
    });
    
    // 显示提示
    wx.showToast({
      title: '数据加载中，请稍后重试',
      icon: 'none',
      duration: 2000
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

  loadCardData: function (cardId) {
    // 现在只使用云数据库，不加载本地数据
    wx.showToast({
      title: '请使用云数据库获取卡片数据',
      icon: 'none',
      duration: 2000
    });
    
    // 清空数据，等待云数据库加载
    this.setData({
      cardData: {
        title: '数据加载中',
        imageUrl: '',
        imageUrls: [],
        videoUrls: [],
        mediaItems: []
      },
      currentImageIndex: 0
    });
  },

  // 图片加载成功
  onImageLoad: function(e) {
    // 图片加载成功，不需要特殊处理
  },

  // 图片加载失败
  onImageError: function(e) {
    wx.showToast({
      title: '图片加载失败',
      icon: 'none',
      duration: 2000
    });
  },

  // 轮播图片改变事件
  onSwiperChange: function(e) {
    this.setData({
      currentImageIndex: e.detail.current
    });
  },

  // 图片点击预览
  onImageTap: function(e) {
    const { url, urls, index } = e.currentTarget.dataset;
    
    if (!urls || urls.length === 0) {
      return;
    }
    
    // 过滤掉空的URL
    const validUrls = urls.filter(imgUrl => imgUrl && imgUrl.trim() !== '');
    
    if (validUrls.length === 0) {
      return;
    }
    
    // 使用微信小程序的图片预览API
    wx.previewImage({
      current: url || validUrls[index] || validUrls[0], // 当前显示的图片
      urls: validUrls // 所有图片URL数组
    });
  },

  // 视频播放事件
  onVideoPlay: function(e) {
    // 视频开始播放，不需要特殊处理
  },

  // 视频暂停事件
  onVideoPause: function(e) {
    // 视频暂停，不需要特殊处理
  },

  // 视频错误事件
  onVideoError: function(e) {
    wx.showToast({
      title: '视频播放失败',
      icon: 'none',
      duration: 2000
    });
  }
})
