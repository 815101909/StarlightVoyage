// pages/explore/explore.js
const app = getApp()
const cloud = wx.cloud

// 辅助函数: 格式化视频时长
function formatDuration(seconds) {
  if (!seconds) return '00:00'
  
  const totalSeconds = parseInt(seconds, 10)
  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = totalSeconds % 60
  
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

// 辅助函数: 格式化日期
function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
  const cstDate = new Date(utc + (3600000 * 8))
  
  return `${cstDate.getFullYear()}-${String(cstDate.getMonth() + 1).padStart(2, '0')}-${String(cstDate.getDate()).padStart(2, '0')}`
}

Page({
  data: {
    // 文章相关
    articles: [],
    currentTab: 'news',
    
    // 视频相关
    videoList: [],
    currentVideo: null,
    showVideoModal: false,
    filterByDate: false, // 是否启用日期筛选
    
    // 通用状态
    currentDate: '',
    isLoading: false,
    hasMore: {
      article: true,
      video: true
    },
    page: {
      article: 1,
      video: 1
    }
  },

  // 获取云存储文件链接
  async getCloudFileURL(fileID) {
    try {
      const { fileList } = await cloud.getTempFileURL({
        fileList: [fileID]
      })
      return fileList[0].tempFileURL
    } catch (error) {
      console.error('获取云存储链接失败:', error)
      return ''
    }
  },

  onLoad() {
    console.log('页面开始加载')
    // 初始化云环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }
    wx.cloud.init({
      env: 'cloud1-1gsyt78b92c539ef', // 使用与app.js相同的云环境ID
      traceUser: true
    })
    
    // 设置当前日期
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    console.log('初始化数据:', {
      currentDate: dateStr,
      filterByDate: false
    })
    
    this.setData({
      currentDate: dateStr,
      filterByDate: false,
      videoList: [],
      'page.video': 1,
      'hasMore.video': true,
      isLoading: false
    }, () => {
      // 设置完日期后立即加载数据
      this.loadVideos()
    })
  },

  onShow() {
    console.log('页面显示')
    // 如果视频列表为空，尝试重新加载
    if (this.data.videoList.length === 0) {
      console.log('视频列表为空，重新加载')
      this.setData({
        'page.video': 1,
        'hasMore.video': true,
        isLoading: false
      }, () => {
        this.loadVideos()
      })
    }
  },

  // 切换新闻/回顾标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    if (tab === this.data.currentTab) return
    
    this.setData({
      currentTab: tab,
      articles: [],
      'page.article': 1,
      'hasMore.article': true
    }, () => {
      this.loadArticles()
    })
  },

  // 日期选择
  dateChange(e) {
    const date = e.detail.value
    if (date === this.data.currentDate) return
    
    this.setData({
      currentDate: date,
      articles: [],
      'page.article': 1,
      'hasMore.article': true
    }, () => {
      this.loadArticles()
    })
  },

  // 视频日期选择
  videoDateChange(e) {
    const date = e.detail.value
    if (date === this.data.currentDate && this.data.filterByDate) return
    
    this.setData({
      currentDate: date,
      filterByDate: true, // 启用日期筛选
      videoList: [],
      'page.video': 1,
      'hasMore.video': true
    }, () => {
      this.loadVideos()
    })
  },

  // 重置日期筛选
  resetDateFilter() {
    if (!this.data.filterByDate) return
    
    this.setData({
      filterByDate: false,
      videoList: [],
      'page.video': 1,
      'hasMore.video': true,
      isLoading: false // 确保可以重新加载
    }, () => {
      wx.showLoading({
        title: '加载中...'
      })
      this.loadVideos().then(() => {
        wx.hideLoading()
      }).catch(err => {
        console.error('加载视频失败:', err)
        wx.hideLoading()
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
      })
    })
  },

  // 加载文章列表
  async loadArticles() {
    if (this.data.isLoading || !this.data.hasMore.article) return

    try {
      this.setData({ isLoading: true })

      const { result } = await cloud.callFunction({
        name: 'explore',
        data: {
          action: 'getArticles',
          date: this.data.currentTab === 'news' ? this.data.currentDate : null, // 只在天文时事标签下使用日期筛选
          page: this.data.page.article,
          limit: 10,
          status: 'published'
        }
      })

      console.log('云函数返回结果:', result)

      if (result.success) {
        // 处理文章数据
        const newArticles = result.data.map(article => {
          return {
            id: article.id || article._id,
            title: article.title || '无标题',
            summary: article.thoughtDescription || '',
          coverUrl: article.imageUrl || '',
            category: article.category || '未分类',
            author: article.author || '匿名',
            date: article.publishTime ? formatDate(Number(article.publishTime)) : '',
          views: article.views || 0
          }
        })

        console.log('处理后的文章数据:', newArticles)

        this.setData({
          articles: [...this.data.articles, ...newArticles],
          'page.article': this.data.page.article + 1,
          'hasMore.article': result.hasMore,
          isLoading: false
        })
      } else {
        console.error('加载文章失败:', result.message)
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
        this.setData({ isLoading: false })
      }
    } catch (error) {
      console.error('加载文章失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setData({ isLoading: false })
    }
  },

  // 加载视频列表
  async loadVideos() {
    console.log('进入loadVideos函数，当前状态:', {
      isLoading: this.data.isLoading,
      hasMore: this.data.hasMore.video,
      filterByDate: this.data.filterByDate,
      currentDate: this.data.currentDate,
      page: this.data.page.video
    })

    if (this.data.isLoading) {
      console.log('正在加载中，跳过重复加载')
      return
    }

    try {
      this.setData({ isLoading: true })

      // 构建云函数参数
      const params = {
        name: 'explore',
        data: {
          action: 'getVideos',
          page: this.data.page.video,
          limit: 10
        }
      }

      // 只在启用日期筛选时添加date参数
      if (this.data.filterByDate) {
        params.data.date = this.data.currentDate
      }

      console.log('调用云函数参数:', params)

      const { result } = await cloud.callFunction(params)

      console.log('视频加载结果:', result)

      if (result && result.success) {
        // 处理视频数据
        const videos = result.data.map(video => {
          // 确保视频对象有所有必要字段
          const processedVideo = {
            id: video.id || video._id,
            title: video.title || '未命名视频',
            description: video.description || '',
            coverUrl: video.coverUrl || '',
            videoUrl: video.videoUrl || '',
            author: video.author || '小舟摇星河',
            duration: formatDuration(video.duration) || '00:00',
            publishTime: video.date || formatDate(video.createdAt),
            views: video.views || 0
          }
          return processedVideo
        })

        // 更新数据
        this.setData({
          videoList: [...this.data.videoList, ...videos],
          'page.video': this.data.page.video + 1,
          'hasMore.video': videos.length === 10,
          isLoading: false
        })
      } else {
        console.error('加载视频失败:', result ? result.message : '返回结果为空')
        this.setData({ 
          isLoading: false,
          'hasMore.video': false
        })
      }
    } catch (error) {
      console.error('加载视频失败:', error)
      this.setData({ 
        isLoading: false,
        'hasMore.video': false
      })
    }
  },

  // 跳转到文章详情
  goToArticleDetail(e) {
    const id = e.currentTarget.dataset.id
    console.log('准备跳转到文章详情，ID:', id)
    console.log('完整的event数据:', e)
    
    if (!id) {
      console.error('文章ID不能为空')
      wx.showToast({
        title: '文章ID不能为空',
        icon: 'none'
      })
      return
    }

    const url = `/pages/article_detail/article_detail?articleId=${id}`
    console.log('跳转URL:', url)
    
    wx.navigateTo({
      url: url,
      success: (res) => {
        console.log('跳转成功:', res)
      },
      fail: (err) => {
        console.error('跳转失败:', err)
        console.error('完整的错误信息:', JSON.stringify(err))
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        })
      }
    })
  },

  // 视频准备就绪事件
  onVideoReady(e) {
    console.log('视频准备就绪:', e)
    if (this.data.currentVideo) {
      // 获取视频上下文
      const videoContext = wx.createVideoContext('fullscreen-video')
      // 获取视频时长
      videoContext.getDuration({
        success: (res) => {
          console.log('获取到视频时长:', res.duration)
          const duration = formatDuration(res.duration)
          this.setData({
            'currentVideo.duration': duration
          })
        }
      })
    }
  },

  // 播放视频
  playVideo(e) {
    const video = e.currentTarget.dataset.video
    console.log('准备播放视频:', video)
    
    if (!video || !video.videoUrl) {
      wx.showToast({
        title: '视频链接无效',
        icon: 'none'
      })
      return
    }
    
    // 格式化时长显示
    const duration = formatDuration(video.duration)
    
    this.setData({
      currentVideo: {
        ...video,
        duration: duration
      },
      showVideoModal: true
    })
    
    // 增加观看次数
    this.incrementVideoViews(video.id)
    
    // 记录观看活动
    wx.cloud.callFunction({
      name: 'activity',
      data: {
        action: 'createActivity',
        data: {
          type: 'watch',
          title: `观看了《${video.title}》`,
          content: {
            videoId: video.id,
            videoTitle: video.title,
            videoCover: video.coverUrl
          }
        }
      }
    }).catch(err => {
      console.error('记录观看活动失败:', err)
    })
  },
  
  // 增加视频观看次数
  async incrementVideoViews(videoId) {
    if (!videoId) return
    
    try {
      await cloud.callFunction({
        name: 'explore',
        data: {
          action: 'incrementVideoViews',
          videoId: videoId
        }
      })
      console.log('视频观看次数已更新')
    } catch (error) {
      console.error('更新视频观看次数失败:', error)
    }
  },

  // 关闭视频模态框
  closeVideoModal() {
    this.setData({
      showVideoModal: false,
      currentVideo: null
    })
  },

  // 视频播放事件处理
  onVideoPlay() {
    // 当视频开始播放时已经在playVideo中增加了观看次数，不需要再次增加
    console.log('视频开始播放')
  },

  onVideoPause() {
    // 可以添加暂停时的处理逻辑
  },

  // 视频播放结束事件
  onVideoEnded() {
    // 获取视频上下文
    const videoContext = wx.createVideoContext('fullscreen-video')
    // 将视频跳回到开始位置
    videoContext.seek(0)
    // 暂停播放，保持在第一帧
    videoContext.pause()
  },

  onVideoError(e) {
    console.error('视频播放错误:', e)
    wx.showToast({
      title: '视频播放失败',
      icon: 'none'
    })
  },

  onVideoReady() {
    // 可以添加视频准备就绪时的处理逻辑
  },

  // 视频时间更新事件
  onTimeUpdate(e) {
    const duration = e.detail.duration
    if (duration && duration > 0 && (!this.data.currentVideo.duration || this.data.currentVideo.duration === '00:00')) {
      console.log('获取到视频时长:', duration)
      const formattedDuration = formatDuration(duration)
      
      // 更新当前播放视频的时长
      this.setData({
        'currentVideo.duration': formattedDuration
      })
      
      // 更新列表中对应视频的时长
      const videoList = this.data.videoList.map(video => {
        if (video.id === this.data.currentVideo.id) {
          return { ...video, duration: formattedDuration }
        }
        return video
      })
      this.setData({ videoList })
      
      // 更新数据库中的时长
      wx.cloud.callFunction({
        name: 'explore',
        data: {
          action: 'updateVideoDuration',
          videoId: this.data.currentVideo.id,
          duration: Math.floor(duration)
        }
      }).then(() => {
        console.log('视频时长已更新到数据库')
      }).catch(error => {
        console.error('更新视频时长失败:', error)
      })
    }
  },

  // 处理图片加载错误
  handleImageError(e) {
    const index = e.currentTarget.dataset.index
    console.error('图片加载失败:', e)
    
    // 可以在这里设置一个默认图片
    const key = `articles[${index}].coverUrl`
    this.setData({
      [key]: ''  // 如果图片加载失败，清空URL
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      articles: [],
      videoList: [],
      'page.article': 1,
      'page.video': 1,
      'hasMore.article': true,
      'hasMore.video': true
    }, async () => {
      await Promise.all([
        this.loadArticles(),
        this.loadVideos()
      ])
      wx.stopPullDownRefresh()
    })
  },

  // 触底加载更多
  onReachBottom() {
    if (!this.data.isLoading) {
      if (this.data.hasMore.article) {
        this.loadArticles()
      }
      if (this.data.hasMore.video) {
        this.loadVideos()
      }
    }
  }
})