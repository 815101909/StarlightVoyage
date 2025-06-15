// pages/star/star.js
Page({
  data: {
    // 轮播配置
    autoplay: true,
    interval: 5000,
    duration: 800,
    circular: true,
    current: 0,
    
    // 太空地图配置
    currentMap: 'universe', // 当前选中的地图类别：universe, galaxy, celestial, earth
    mapVideos: {
      universe: '', // 宇宙视频链接
      galaxy: '',   // 星系视频链接
      celestial: '', // 天体视频链接
      earth: ''     // 地球视频链接
    },
    
    // 四个部分的数据
    sections: [
      {
        id: 'universe-structure',
        title: '宇宙结构',
        image: 'pic/宇宙结构.jpg',
        description: '从微观粒子到宏观宇宙，探索宇宙的层次结构与演化历程'
      },
      {
        id: 'celestial-types',
        title: '天体类型',
        image: 'pic/天体类型.jpg',
        description: '恒星、行星、彗星、黑洞...了解宇宙中各种奇妙天体'
      },
      {
        id: 'energy-fields',
        title: '能量与场',
        image: 'pic/能量与场.jpg',
        description: '引力、电磁力、强弱核力...宇宙中的能量与场如何运作'
      },
      {
        id: 'where-we-are',
        title: '我们在哪',
        image: 'pic/我们在哪.jpg',
        description: '太阳系、银河系、本星系群...人类在浩瀚宇宙中的位置'
      }
    ]
  },

  onLoad: function() {
    // 添加星星动画效果
    this.createStars();
    
    // 获取太空地图视频数据
    this.fetchSpaceMapVideos();
  },
  
  // 获取太空地图视频数据的API调用
  fetchSpaceMapVideos: function() {
    // 这里是API调用的预留代码
    // 实际使用时可以替换为真实的API调用
    const self = this;
    
    // 模拟API请求
    wx.showLoading({
      title: '加载中...',
    });
    
    // 预留的API调用示例
    // wx.request({
    //   url: 'https://api.example.com/space-videos',
    //   method: 'GET',
    //   success: function(res) {
    //     if (res.statusCode === 200 && res.data) {
    //       self.setData({
    //         mapVideos: res.data
    //       });
    //     }
    //   },
    //   complete: function() {
    //     wx.hideLoading();
    //   }
    // });
    
    // 模拟请求完成
    setTimeout(function() {
      wx.hideLoading();
      
      // 这里可以放置测试数据
      // self.setData({
      //   mapVideos: {
      //     universe: 'https://example.com/videos/universe.mp4',
      //     galaxy: 'https://example.com/videos/galaxy.mp4',
      //     celestial: 'https://example.com/videos/celestial.mp4',
      //     earth: 'https://example.com/videos/earth.mp4'
      //   }
      // });
      
      console.log('Space map videos loaded');
    }, 1000);
  },
  
  // 切换地图类型
  switchMap: function(e) {
    const mapType = e.currentTarget.dataset.map;
    
    this.setData({
      currentMap: mapType
    });
    
    // 如果该类型的视频尚未加载，则尝试单独请求
    if (!this.data.mapVideos[mapType]) {
      this.fetchSingleMapVideo(mapType);
    }
  },
  
  // 请求单个地图视频的API调用
  fetchSingleMapVideo: function(mapType) {
    // 这里是单个视频请求的预留代码
    console.log(`Fetching video for ${mapType}`);
    
    // 预留的单个视频API调用示例
    // wx.request({
    //   url: `https://api.example.com/space-videos/${mapType}`,
    //   method: 'GET',
    //   success: (res) => {
    //     if (res.statusCode === 200 && res.data) {
    //       // 更新单个视频
    //       const mapVideos = {...this.data.mapVideos};
    //       mapVideos[mapType] = res.data.videoUrl;
    //       
    //       this.setData({
    //         mapVideos: mapVideos
    //       });
    //     }
    //   }
    // });
  },

  // 创建星空背景动画
  createStars: function() {
    // 在小程序中这里可以使用canvas绘制星空效果
    // 由于这里只设计布局与样式，所以暂不实现具体动画效果
    console.log('Create stars animation');
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
    console.log(`Navigate to ${section} detail page`);
    
    // 实际使用时可以用下面的代码进行跳转
    wx.navigateTo({
      url: `../detail/detail?section=${section}`
    });
  },

  onPullDownRefresh: function() {
    // 下拉刷新逻辑
    console.log('Pull down refresh');
    // 重新获取太空地图视频数据
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
  }
}) 