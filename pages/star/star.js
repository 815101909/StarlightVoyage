// pages/star/star.js
const { videoAPI, starmapAPI } = require('../../utils/cloudApi.js')
const app = getApp()

Page({
  data: {
    // 轮播配置
    autoplay: true,
    interval: 5000,
    duration: 800,
    circular: true,
    current: 0,
    
    // 太空地图配置
    currentMap: 'universe',
    mapVideos: {
      universe: null,
      galaxy: null,
      celestial: null,
      earth: null
    },
    
    // 网络状态
    isOffline: false,
    apiError: false,
    
    // 星宿卡片数据 
    sections: [
      { id: 'universe-structure', title: '宇宙结构' },
      { id: 'celestial-types', title: '天体类型' },
      { id: 'energy-fields', title: '能量与场' },
      { id: 'where-we-are', title: '我们在哪' }
    ],

    loading: false,
    
    // A4内容数据对象
    a4Contents: {
      'universe-structure': null,
      'celestial-types': null,
      'energy-fields': null,
      'where-we-are': null
    }
  },

  onLoad: function() {
    // 恢复上次选择的视频类型
    try {
      const savedMapType = wx.getStorageSync('currentMapType');
      if (savedMapType) {
        this.setData({
          currentMap: savedMapType
        });
      }
    } catch (e) {
      console.error('读取本地存储失败:', e);
    }
    
    this.createStars();
    this.checkNetworkStatus();
    this.fetchSpaceMapVideos();
    this.loadA4Content();
    this.checkMemberExpiry();
  },
  
  // 检查网络状态
  checkNetworkStatus: function() {
    const self = this;
    
    wx.getNetworkType({
      success: function(res) {
        const networkType = res.networkType;
        if (networkType === 'none') {
          self.setData({
            isOffline: true
          });
        } else {
          self.setData({
            isOffline: false
          });
        }
      }
    });
    
    // 监听网络状态变化
    wx.onNetworkStatusChange(function(res) {
      if (res.isConnected) {
        self.setData({
          isOffline: false
        });
        
        // 如果恢复网络连接，尝试重新获取视频
        if (!self.data.mapVideos[self.data.currentMap]) {
          self.fetchSpaceMapVideos();
        }
      } else {
        self.setData({
          isOffline: true
        });
      }
    });
  },
  
  // 获取太空地图视频数据的API调用
  fetchSpaceMapVideos: function() {
    const self = this;
    
    if (this.data.isOffline) {
      wx.hideLoading();
      return;
    }
    
    wx.showLoading({
      title: '加载中...',
    });
    
    const mapType = this.data.currentMap;
    
    const typeMap = {
      'universe': '宇宙',
      'galaxy': '星系',
      'celestial': '天体',
      'earth': '地球'
    };
    
    if (app.globalData.useCloudAPI) {
      videoAPI.getVideosByType(typeMap[mapType]).then(async res => {
        if (res.success && res.data) {
          // 转换云存储文件ID为临时链接
          const fileList = [];
          if (res.data.videoFileId && res.data.videoFileId.startsWith('cloud://')) {
            fileList.push(res.data.videoFileId);
          }
          if (res.data.coverFileId && res.data.coverFileId.startsWith('cloud://')) {
            fileList.push(res.data.coverFileId);
          }
          
          if (fileList.length > 0) {
            try {
              const result = await wx.cloud.getTempFileURL({
                fileList: fileList
              });
              
              if (result.fileList) {
                result.fileList.forEach(file => {
                  if (file.fileID === res.data.videoFileId) {
                    res.data.videoUrl = file.tempFileURL;
                  }
                  if (file.fileID === res.data.coverFileId) {
                    res.data.coverUrl = file.tempFileURL;
                  }
                });
              }
              
              // 确保获取到了临时链接
              if (!res.data.videoUrl || !res.data.videoUrl.startsWith('http')) {
                self.setData({
                  apiError: true
                });
                return;
              }
            } catch (err) {
              console.error('获取云存储临时链接失败:', err);
              self.setData({
                apiError: true
              });
              return;
            }
          }
          
          self.setData({
            apiError: false
          });
          
          const mapVideos = {...self.data.mapVideos};
          mapVideos[mapType] = res.data;
          
          self.setData({
            mapVideos: mapVideos
          });
        } else {
          self.setData({
            apiError: true
          });
        }
        
        wx.hideLoading();
        
      }).catch(err => {
        console.error('获取视频失败:', err);
        self.setData({
          apiError: true
        });
        wx.hideLoading();
      });
    } else {
      self.callTraditionalAPI(mapType);
    }
  },
  
  // 回退到传统API
  fallbackToTraditionalAPI: function(mapType) {
    this.callTraditionalAPI(mapType);
  },
  
  // 调用传统API
  callTraditionalAPI: function(mapType) {
    const self = this;
    
    const typeMap = {
      'universe': '宇宙',
      'galaxy': '星系',
      'celestial': '天体',
      'earth': '地球'
    };
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/star/videos`,
      method: 'GET',
      data: {
        type: typeMap[mapType]
      },
      timeout: 15000,
      success: function(res) {
        self.setData({
          apiError: false
        });
        
        if (res.data && res.data.success && res.data.data) {
          const mapVideos = {...self.data.mapVideos};
          
          const videoData = res.data.data;
          
          if (Array.isArray(videoData) && videoData.length > 0) {
            mapVideos[mapType] = videoData[0];
          } else {
            mapVideos[mapType] = videoData;
          }
          
          if (mapVideos[mapType] && mapVideos[mapType].videoUrl && !mapVideos[mapType].videoUrl.startsWith('http')) {
            mapVideos[mapType].videoUrl = app.globalData.apiBaseUrl.replace('/api', '') + mapVideos[mapType].videoUrl;
          }
          
          if (mapVideos[mapType] && mapVideos[mapType].coverUrl && !mapVideos[mapType].coverUrl.startsWith('http')) {
            mapVideos[mapType].coverUrl = app.globalData.apiBaseUrl.replace('/api', '') + mapVideos[mapType].coverUrl;
          }
          
          self.setData({
            mapVideos: mapVideos
          });
        } else {
          self.setData({
            apiError: true
          });
        }
      },
      fail: function(err) {
        self.setData({
          apiError: true
        });
      },
      complete: function() {
        wx.hideLoading();
      }
    });
  },
  
  // 切换地图类型
  switchMap: function(e) {
    const mapType = e.currentTarget.dataset.map;
    
    // 保存选择的视频类型到本地存储
    try {
      wx.setStorageSync('currentMapType', mapType);
    } catch (e) {
      console.error('保存本地存储失败:', e);
    }
    
    this.setData({
      currentMap: mapType
    });
    
    // 使用正确的视频加载函数
    if (!this.data.mapVideos[mapType] || !this.data.mapVideos[mapType].videoUrl) {
      this.fetchSpaceMapVideos();
    }
  },
  
  // 请求单个地图视频的API调用
  fetchSingleMapVideo: function(mapType) {
    const self = this;
    
    if (this.data.isOffline) {
      wx.hideLoading();
      return;
    }
    
    wx.showLoading({
      title: '加载中...',
    });
    
    const typeMap = {
      'universe': '宇宙',
      'galaxy': '星系',
      'celestial': '天体',
      'earth': '地球'
    };
    
    if (app.globalData.useCloudAPI) {
      videoAPI.getVideosByType(typeMap[mapType]).then(videoData => {
        self.setData({
          apiError: false
        });
        
        const mapVideos = {...self.data.mapVideos};
        mapVideos[mapType] = videoData;
        
        self.setData({
          mapVideos: mapVideos
        });
        
        wx.hideLoading();
        
      }).catch(err => {
        self.setData({
          apiError: true
        });
        
        self.callTraditionalSingleVideoAPI(mapType);
      });
    } else {
      self.callTraditionalSingleVideoAPI(mapType);
    }
  },
  
  // 调用传统单个视频API
  callTraditionalSingleVideoAPI: function(mapType) {
    const self = this;
    
    const typeMap = {
      'universe': '宇宙',
      'galaxy': '星系',
      'celestial': '天体',
      'earth': '地球'
    };
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/star/videos`,
      method: 'GET',
      data: {
        type: typeMap[mapType]
      },
      timeout: 15000,
      success: function(res) {
        self.setData({
          apiError: false
        });
        
        if (res.data && res.data.success && res.data.data) {
          const mapVideos = {...self.data.mapVideos};
          
          const videoData = res.data.data;
          
          if (Array.isArray(videoData) && videoData.length > 0) {
            mapVideos[mapType] = videoData[0];
          } else {
            mapVideos[mapType] = videoData;
          }
          
          if (mapVideos[mapType] && mapVideos[mapType].videoUrl && !mapVideos[mapType].videoUrl.startsWith('http')) {
            mapVideos[mapType].videoUrl = app.globalData.apiBaseUrl.replace('/api', '') + mapVideos[mapType].videoUrl;
          }
          
          if (mapVideos[mapType] && mapVideos[mapType].coverUrl && !mapVideos[mapType].coverUrl.startsWith('http')) {
            mapVideos[mapType].coverUrl = app.globalData.apiBaseUrl.replace('/api', '') + mapVideos[mapType].coverUrl;
          }
          
          self.setData({
            mapVideos: mapVideos
          });
        } else {
          self.setData({
            apiError: true
          });
        }
      },
      fail: function(err) {
        self.setData({
          apiError: true
        });
      },
      complete: function() {
        wx.hideLoading();
      }
    });
  },

  // 创建星空背景动画
  createStars: function() {
  },
  
  // 轮播切换事件
  swiperChange: function(e) {
    this.setData({
      current: e.detail.current
    });
  },
  
  // 点击指示点切换轮播
  dotTap: function(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      current: index
    });
  },

  // 导航到详情页
  navigateToDetail: function(e) {
    const section = e.currentTarget.dataset.section;
    const self = this;
    
    wx.showLoading({
      title: '加载中...'
    });

    // 预加载数据
    if (app.globalData.useCloudAPI) {
      videoAPI.getA4Content(section).then(result => {
        wx.hideLoading();
        wx.navigateTo({
          url: `../detail/detail?section=${section}`
        });
      }).catch(err => {
        wx.hideLoading();
        wx.navigateTo({
          url: `../detail/detail?section=${section}`
        });
      });
    } else {
      // 使用传统API预加载
      wx.request({
        url: `${app.globalData.apiBaseUrl}/star/a4content`,
        method: 'GET',
        data: {
          category: section
        },
        timeout: 5000,
        success: function(res) {
          wx.hideLoading();
          wx.navigateTo({
            url: `../detail/detail?section=${section}`
          });
        },
        fail: function(err) {
          wx.hideLoading();
          wx.navigateTo({
            url: `../detail/detail?section=${section}`
          });
        }
      });
    }
  },
  
  // 获取宇宙知识A4页面内容
  fetchA4Content: function(category) {
    const self = this;
    
    const categoryMap = {
      'universe-structure': '宇宙结构',
      'celestial-types': '天体类型',
      'energy-fields': '能量与场',
      'where-we-are': '我们在哪'
    };
    
    if (this.data.isOffline) {
      wx.hideLoading();
      return;
    }
    
    wx.showLoading({
      title: '加载内容中...',
    });
    
    if (app.globalData.useCloudAPI) {
      videoAPI.getA4Content(categoryMap[category]).then(contentData => {
        self.setData({
          apiError: false
        });
        
        const a4Contents = {...self.data.a4Contents};
        a4Contents[category] = contentData;
        
        self.setData({
          a4Contents: a4Contents
        });
        
        wx.hideLoading();
        
      }).catch(err => {
        self.setData({
          apiError: true
        });
        
        wx.hideLoading();
      });
    } else {
      self.callTraditionalA4API(category);
    }
  },
  
  // 调用传统A4内容API
  callTraditionalA4API: function(category) {
    const self = this;
    
    const categoryMap = {
      'universe-structure': '宇宙结构',
      'celestial-types': '天体类型',
      'energy-fields': '能量与场',
      'where-we-are': '我们在哪'
    };
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/star/a4content`,
      method: 'GET',
      data: {
        category: categoryMap[category]
      },
      timeout: 5000,
      success: function(res) {
        self.setData({
          apiError: false
        });
        
        if (res.data && res.data.success && res.data.data) {
          const a4Contents = {...self.data.a4Contents};
          a4Contents[category] = res.data.data;
          
          if (a4Contents[category] && a4Contents[category].imageUrl && !a4Contents[category].imageUrl.startsWith('http')) {
            a4Contents[category].imageUrl = app.globalData.apiBaseUrl.replace('/api', '') + a4Contents[category].imageUrl;
          }
          
          if (a4Contents[category] && a4Contents[category].pdfUrl && !a4Contents[category].pdfUrl.startsWith('http')) {
            a4Contents[category].pdfUrl = app.globalData.apiBaseUrl.replace('/api', '') + a4Contents[category].pdfUrl;
          }
          
          self.setData({
            a4Contents: a4Contents
          });
        } else {
          self.setData({
            apiError: true
          });
        }
      },
      fail: function(err) {
        self.setData({
          apiError: true
        });
      },
      complete: function() {
        wx.hideLoading();
      }
    });
  },
  
  // 加载A4内容数据
  loadA4Content: function() {
    const self = this;
    
    if (this.data.isOffline) {
      return;
    }
    
    this.setData({ loading: true });
    
    videoAPI.getA4Content().then(async result => {
      if (result && result.data) {
        const sections = result.data
          .sort((a, b) => a.order - b.order);
        
        // 转换云存储URL为临时链接
        for (let item of sections) {
          if (item.coverUrl && item.coverUrl.startsWith('cloud://')) {
            try {
              const res = await wx.cloud.getTempFileURL({
                fileList: [item.coverUrl]
              });
              if (res.fileList && res.fileList.length > 0) {
                item.coverUrl = res.fileList[0].tempFileURL;
              }
            } catch (error) {
              console.error(`封面转换失败:`, error);
              item.coverUrl = '';
            }
          }
        }
        
        const sectionsData = sections.map(item => ({
          id: item.category,
          title: item.title,
          coverUrl: item.coverUrl || '',
          description: item.description || ''
        }));

        self.setData({
          sections: sectionsData,
          loading: false
        });
      }
    }).catch(err => {
      console.error('加载A4内容失败:', err);
      self.setData({ loading: false });
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    });
  },
  
  onPullDownRefresh: function() {
    this.fetchSpaceMapVideos();
    
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  onShareAppMessage: function() {
    return {
      title: '星河 - 宇宙的奥秘',
      path: '/pages/star/star',
      imageUrl: 'pic/宇宙结构.jpg'
    };
  },
  
  onShareTimeline: function() {
    return {
      title: '星河 - 探索宇宙奥秘的旅程',
      query: '',
      imageUrl: 'pic/宇宙结构.jpg'
    };
  },

  // 视频开始播放
  onVideoPlay: function(e) {
    // 视频开始播放
  },

  // 视频暂停
  onVideoPause: function(e) {
    // 视频暂停
  },

  // 视频播放出错
  onVideoError: function(e) {
    console.error('视频播放错误:', e);
  },

  // 视频加载中
  onVideoWaiting: function(e) {
    // 视频加载中
  },

  // 视频播放进度更新
  onVideoTimeUpdate: function(e) {
    // 视频播放进度更新
  },

  // 视频播放结束
  onVideoEnded: function(e) {
    // 视频播放结束
  },

  // 检查会员是否过期
  checkMemberExpiry: function() {
    const self = this;
    
    wx.cloud.callFunction({
      name: 'member',
      data: {
        action: 'checkMemberExpiry'
      },
      success: function(res) {
        if (res.result.success) {
          if (res.result.expired) {
            // 会员已过期，更新全局用户信息
            const app = getApp();
            if (app.globalData.userInfo) {
              app.globalData.userInfo.memberLevel = 0;
            }
            
            // 可以在这里添加提示用户续费的逻辑
            wx.showToast({
              title: '会员已过期',
              icon: 'none',
              duration: 2000
            });
          }
        } else {
          console.error('检查会员过期状态失败:', res.result.message);
        }
      },
      fail: function(err) {
        console.error('调用会员过期检查云函数失败:', err);
      }
    });
  }
})