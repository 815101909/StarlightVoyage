Page({
  data: {
    article: null,
    isLoading: true,
    fontSize: 22, // 默认字体大小
    minFontSize: 10, // 最小字体大小
    maxFontSize: 40, // 最大字体大小
    fontSizeStep: 2, // 每次调整的步长
    isReading: false,
    isBookmarked: false,
    audioContext: null,
    userInfo: {
      memberLevel: 0,
      expireDate: null
    },
    isMember: false,
    showMemberLock: false,
    // 音频进度相关
    audioDuration: 0, // 音频总时长（秒）
    audioCurrentTime: 0, // 当前播放时间（秒）
    audioProgress: 0, // 播放进度百分比
    // 音频播放速度相关
    playbackRate: 1.0, // 当前播放速度
    playbackRates: [0.75, 0.8, 0.9, 1.0, 1.1, 1.25], // 可选播放速度
    currentRateIndex: 3, // 当前速度索引，默认指向1.0倍速
    // 背景音乐相关
    bgmContext: null,
    isBgmPlaying: false,
    bgmUrl: 'cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1370520707/audio/bgm/科学-科技-先进 (99)_爱给网_aigei_com.mp3'
  },

  onLoad: function(options) {
    // 初始化云开发环境
    if (!wx.cloud) {
      wx.showToast({
        title: '请使用 2.2.3 或以上的基础库以使用云能力',
        icon: 'none'
      });
      return;
    }
    wx.cloud.init({
      env: 'cloud1-1gsyt78b92c539ef', // 使用与app.js相同的云环境ID
      traceUser: true
    });

    this.initAudioContext();
    this.initBgmContext();
    
    wx.showLoading({
      title: '加载中',
    });
    
    // 设置字体大小
    const savedFontSize = wx.getStorageSync('fontSize') || 32;
    this.setData({
      fontSize: savedFontSize,
      isBookmarked: false
    });

    if (options.articleId) {
      // 先检查会员状态，然后加载文章
      this.checkMemberStatus().then(() => {
        this.loadArticleDetail(options.articleId);
        // 加载完成后自动播放背景音乐
        this.playBgm();
      });
      // 检查是否已收藏
      this.checkFavoriteStatus(options.articleId);
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  onShow: function() {
    // 页面显示时重新检查会员状态
    this.checkMemberStatus().then(() => {
      // 重新计算是否显示会员锁定
      if (this.data.article) {
        const showMemberLock = !this.data.isMember;
        this.setData({ showMemberLock });
      }
    });
  },

  // 获取云存储文件临时链接
  getCloudFileUrl: async function(fileID) {
    console.log('开始获取云存储文件：', fileID);
    try {
      const result = await wx.cloud.getTempFileURL({
        fileList: [fileID]
      });
      
      console.log('云存储返回结果：', result);
      if (result.fileList && result.fileList[0] && result.fileList[0].tempFileURL) {
        console.log('获取到临时链接：', result.fileList[0].tempFileURL);
        return result.fileList[0].tempFileURL;
      }
      console.log('未获取到临时链接');
      return null;
    } catch (error) {
      console.error('获取云存储文件失败：', error);
      return null;
    }
  },

  // 加载文章详情
  loadArticleDetail: async function(articleId) {
    try {
      const result = await wx.cloud.callFunction({
        name: 'explore',
        data: {
          action: 'getArticleDetail',
          articleId
        }
      });

      if (result.result.success) {
        // 处理文章数据
        const articleData = result.result.data;
        const formattedArticle = await this.formatArticleData(articleData);
        
        // 检查是否需要显示会员锁定（对所有文章都需要会员）
        const showMemberLock = !this.data.isMember;
        
        console.log('锁定检查:', {
          category: formattedArticle.category,
          isMember: this.data.isMember,
          memberLevel: this.data.userInfo.memberLevel,
          expireDate: this.data.userInfo.expireDate,
          showMemberLock: showMemberLock
        });
        
        this.setData({
          article: formattedArticle,
          isLoading: false,
          showMemberLock: showMemberLock
        });

        // 设置页面标题
        wx.setNavigationBarTitle({
          title: formattedArticle.title || '文章详情'
        });

        // 记录阅读活动
        recordReadActivity(formattedArticle);
      } else {
        wx.showToast({
          title: result.result.message || '加载失败',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
      this.setData({ isLoading: false });
    }
  },

  // 检查会员状态
  checkMemberStatus: async function() {
    try {
      // 检查用户是否已登录
      const token = wx.getStorageSync('token');
      const userInfo = wx.getStorageSync('userInfo');
      
      if (!token || !userInfo) {
        // 用户未登录，设置为非会员状态
        this.setData({
          userInfo: {
            memberLevel: 0,
            expireDate: null
          },
          isMember: false
        });
        console.log('用户未登录，设置为非会员状态');
        return Promise.resolve();
      }
      
      const result = await wx.cloud.callFunction({
        name: 'auth',
        data: {
          action: 'getProfile'
        }
      });

      if (result.result.success) {
        const userInfo = result.result.data;
        const now = new Date();
        const expireDate = userInfo.expireDate ? new Date(userInfo.expireDate) : null;
        // memberLevel: 0=非会员, 1=会员
        const isMember = userInfo.memberLevel === 1 && (!expireDate || expireDate > now);
        
        this.setData({
          userInfo: {
            memberLevel: userInfo.memberLevel || 0,
            expireDate: userInfo.expireDate
          },
          isMember: isMember
        });
        
        console.log('会员状态检查结果:', { isMember, memberLevel: userInfo.memberLevel, expireDate: userInfo.expireDate });
        return Promise.resolve();
      }
    } catch (error) {
      console.error('检查会员状态失败:', error);
      // 出错时也设置为非会员状态
      this.setData({
        userInfo: {
          memberLevel: 0,
          expireDate: null
        },
        isMember: false
      });
      return Promise.reject(error);
    }
  },

  // 跳转到会员中心
  goToMemberCenter: function() {
    wx.navigateTo({
      url: '/pages/member_center/member_center'
    });
  },

  checkFavoriteStatus: async function(articleId) {
    try {
      // 检查用户是否登录
      const token = wx.getStorageSync('token');
      if (!token) {
        return;
      }
      
      // 调用云函数获取用户收藏列表
      const result = await wx.cloud.callFunction({
        name: 'profile',
        data: {
          action: 'getFavorites'
        }
      });
      
      if (result.result.success) {
        const favorites = result.result.data || [];
        // 检查当前文章是否在收藏列表中
        const isBookmarked = favorites.some(item => item.articleId === articleId);
        this.setData({ isBookmarked });
      }
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
  },

  // 收藏或取消收藏文章
  bookmarkArticle: async function() {
    if (!this.data.article) {
      wx.showToast({
        title: '文章加载中',
        icon: 'none'
      });
      return;
    }
    
    // 检查用户是否登录
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showModal({
        title: '提示',
        content: '收藏功能需要登录，是否前往登录？',
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
    
    try {
      const article = this.data.article;
      // 调用云函数进行收藏操作
      const result = await wx.cloud.callFunction({
        name: 'profile',
        data: {
          action: 'toggleFavorite',
          data: {
            articleId: article._id,
            title: article.title,
            coverUrl: article.coverUrl
          }
        }
      });
      
      if (result.result.success) {
        // 更新收藏状态
        const isBookmarked = result.result.data.isFavorite;
        this.setData({ isBookmarked });
        
        // 显示提示
        wx.showToast({
          title: result.result.message,
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: result.result.message || '操作失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      wx.showToast({
        title: '操作失败，请稍后再试',
        icon: 'none'
      });
    }
  },

  // 处理富文本内容
  processRichText: function(richText) {
    if (!richText) {
      console.log('输入为空');
      return { 
        nodes: null,
        images: []
      };
    }

    try {
      // 如果是字符串,尝试解析为HTML
      const content = typeof richText === 'string' ? richText : JSON.stringify(richText);
      console.log('原始内容:', content);
      
      const images = [];
      let processedContent = content;

      // 1. 提取图片和描述
      const imgPattern = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
      
      // 匹配两种格式的描述：
      // 1. 标准格式："这是一段描述X"
      // 2. 自定义格式：任意文本（在<p style="text-align: center">中）
      const descPattern = /<p[^>]*style="text-align:\s*center"[^>]*>([^<]+)<\/p>/g;
      
      // 先收集所有图片
      const imgMatches = [...content.matchAll(imgPattern)];
      console.log('找到的图片:', imgMatches);
      
      // 再收集所有描述
      const descMatches = [...content.matchAll(descPattern)];
      console.log('找到的描述:', descMatches);

      // 组合图片和描述
      imgMatches.forEach((imgMatch, index) => {
        const imgUrl = imgMatch[1];
        const fullImgTag = imgMatch[0];
        
        // 尝试获取对应的描述文本
        let descText = '';
        if (descMatches[index]) {
          // 提取描述文本（在第一个捕获组中）
          descText = descMatches[index][1].trim();
        }

        images.push({
          url: imgUrl,
          width: 320,
          height: 240,
          description: descText
        });

        // 只从内容中移除图片标签和对应的描述
        processedContent = processedContent.replace(fullImgTag, '');
        if (descMatches[index]) {
          processedContent = processedContent.replace(descMatches[index][0], '');
        }
      });

      console.log('处理后的内容:', processedContent);
      console.log('提取的图片和描述:', images);

      return {
        nodes: processedContent,
        images: images
      };

    } catch (error) {
      console.error('处理富文本内容失败:', error);
      return {
        nodes: richText,
        images: []
      };
    }
  },

  // 格式化文章数据
  formatArticleData: async function(data) {
    // 处理富文本内容
    const processedIntro = this.processRichText(data.body || '');
    const processedContent = this.processRichText(data.content || '');
    const processedConclusion = this.processRichText(data.conclusion || '');

    // 处理音频文件
    if (data.voice) {
      console.log('处理音频文件：', data.voice);
      const audioUrl = await this.getCloudFileUrl(data.voice);
      if (audioUrl) {
        console.log('设置音频源：', audioUrl);
        this.audioContext.src = audioUrl;
      }
    }

    return {
      ...data,
      // 处理封面图片URL
      coverUrl: data.imageUrl || data.coverUrl || '',
      
      // 打印图片URL
      print: data.print || '',
      
      // 思考问题
      thinkingQuestion: data.thoughtDescription || '这项最新的太空发现对人类未来探索宇宙有什么意义？',
      
      // 分段内容
      introNodes: processedIntro.nodes,
      introImages: processedIntro.images || [],
      
      contentNodes: processedContent.nodes,
      contentImages: processedContent.images || [],
      
      conclusionNodes: processedConclusion.nodes,
      conclusionImages: processedConclusion.images || [],
      
      // 合并所有图片
      images: [
        ...processedIntro.images || [],
        ...processedContent.images || [],
        ...processedConclusion.images || []
      ]
    };
  },

  // 跳转到习题页面
  showExercises: function() {
    if (!this.data.article) {
      wx.showToast({
        title: '文章数据未加载',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/exercises/exercises?id=${this.data.article._id}&title=${encodeURIComponent(this.data.article.title)}`,
      fail: () => {
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    });
  },

  // 提取首字符和剩余内容
  extractFirstCharAndRest: function(text) {
    const cleanText = text.replace(/<\/?[^>]+(>|$)/g, "").trim();
    
    if (!cleanText) {
      return { firstChar: "", rest: "" };
    }
    
    const firstChar = cleanText.charAt(0);
    const rest = cleanText.substring(1);
    
    return { firstChar, rest };
  },

  // 初始化音频上下文
  initAudioContext: function() {
    const audioContext = wx.createInnerAudioContext();
    
    audioContext.onPlay(() => {
      console.log('音频开始播放');
      this.setData({ isReading: true });
      this.startProgressUpdate();
    });
    
    audioContext.onPause(() => {
      console.log('音频暂停');
      this.setData({ isReading: false });
      this.stopProgressUpdate();
    });
    
    audioContext.onStop(() => {
      console.log('音频停止');
      this.setData({ isReading: false });
      this.stopProgressUpdate();
    });
    
    audioContext.onEnded(() => {
      console.log('音频播放结束');
      this.setData({ 
        isReading: false,
        audioCurrentTime: 0,
        audioProgress: 0
      });
      this.stopProgressUpdate();
    });
    
    audioContext.onCanplay(() => {
      console.log('音频可以播放，时长：', audioContext.duration);
      // 设置播放速度
      audioContext.playbackRate = this.data.playbackRate;
      this.setData({
        audioDuration: audioContext.duration || 0
      });
    });
    
    audioContext.onTimeUpdate(() => {
      const currentTime = audioContext.currentTime || 0;
      const duration = audioContext.duration || 0;
      const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
      
      this.setData({
        audioCurrentTime: currentTime,
        audioProgress: progress
      });
    });
    
    audioContext.onError((res) => {
      console.error('音频播放错误：', res);
      this.setData({ isReading: false });
      this.stopProgressUpdate();
      wx.showToast({
        title: '朗读功能暂不可用',
        icon: 'none'
      });
    });
    
    this.audioContext = audioContext;
  },

  // 初始化背景音乐上下文
  initBgmContext: function() {
    const bgmContext = wx.createInnerAudioContext();
    
    bgmContext.loop = true; // 循环播放
    bgmContext.volume = 0.1; // 设置音量为5%
    
    bgmContext.onPlay(() => {
      console.log('背景音乐开始播放');
      this.setData({ isBgmPlaying: true });
    });
    
    bgmContext.onPause(() => {
      console.log('背景音乐暂停');
      this.setData({ isBgmPlaying: false });
    });
    
    bgmContext.onStop(() => {
      console.log('背景音乐停止');
      this.setData({ isBgmPlaying: false });
    });
    
    bgmContext.onError((res) => {
      console.error('背景音乐播放错误：', res);
      this.setData({ isBgmPlaying: false });
      wx.showToast({
        title: '背景音乐加载失败',
        icon: 'none'
      });
    });
    
    this.bgmContext = bgmContext;
  },

  // 播放背景音乐
  playBgm: async function() {
    try {
      // 获取云存储文件的临时链接
      const result = await wx.cloud.getTempFileURL({
        fileList: [this.data.bgmUrl]
      });
      
      if (result.fileList && result.fileList[0] && result.fileList[0].tempFileURL) {
        const tempUrl = result.fileList[0].tempFileURL;
        console.log('背景音乐临时链接：', tempUrl);
        
        this.bgmContext.src = tempUrl;
        this.bgmContext.play();
      } else {
        console.error('获取背景音乐临时链接失败');
      }
    } catch (error) {
      console.error('播放背景音乐失败：', error);
    }
  },

  // 切换背景音乐播放状态
    toggleBgm: function() {
      if (this.data.isBgmPlaying) {
        this.bgmContext.pause();
      } else {
        if (this.bgmContext.src) {
          this.bgmContext.play();
        } else {
          this.playBgm();
        }
      }
    },

    // 播放文章朗读音频
     playAudio: async function() {
       try {
         if (this.data.article && this.data.article.voice) {
           // 如果是云存储文件，获取临时链接
           let audioUrl = this.data.article.voice;
           if (audioUrl.startsWith('cloud://')) {
             const result = await wx.cloud.getTempFileURL({
               fileList: [audioUrl]
             });
             if (result.fileList && result.fileList[0] && result.fileList[0].tempFileURL) {
               audioUrl = result.fileList[0].tempFileURL;
             }
           }
           
           console.log('设置朗读音频源：', audioUrl);
           this.audioContext.src = audioUrl;
           this.audioContext.play();
         }
       } catch (error) {
         console.error('播放朗读音频失败：', error);
         wx.showToast({
           title: '音频播放失败',
           icon: 'none'
         });
       }
     },

     // 切换朗读播放状态（原有功能）
     toggleReading: function() {
       console.log('点击朗读按钮');
       
       // 检查会员权限
       if (!this.data.isMember) {
         wx.showModal({
           title: '会员专享',
           content: '朗读功能仅限会员使用，是否前往开通会员？',
           confirmText: '开通会员',
           cancelText: '取消',
           success: (res) => {
             if (res.confirm) {
               this.goToMemberCenter();
             }
           }
         });
         return;
       }
       
       if (!this.data.article || !this.data.article.voice) {
         wx.showToast({
           title: '暂无朗读音频',
           icon: 'none'
         });
         return;
       }
 
       if (this.data.isReading) {
         this.audioContext.pause();
       } else {
         if (this.audioContext.src) {
           this.audioContext.play();
         } else {
           this.playAudio();
         }
       }
     },

  // 开始进度更新
  startProgressUpdate: function() {
    this.stopProgressUpdate(); // 先清除之前的定时器
    this.progressTimer = setInterval(() => {
      if (this.audioContext) {
        const currentTime = this.audioContext.currentTime || 0;
        const duration = this.audioContext.duration || 0;
        const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
        
        this.setData({
          audioCurrentTime: currentTime,
          audioProgress: progress
        });
      }
    }, 1000);
  },

  // 停止进度更新
  stopProgressUpdate: function() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  },

  // 格式化时间显示
  formatTime: function(seconds) {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },





  // 处理富文本点击事件
  onRichTextTap: function(e) {
    // 获取点击的节点信息
    const node = e.target;
    if (!node) return;
    
    // 检查是否点击了图片
    if (node.nodeName === 'IMG') {
      // 获取图片索引
      const index = parseInt(node.dataset.index);
      if (!isNaN(index) && this.data.article.images) {
        const urls = this.data.article.images.map(img => img.url);
        const current = urls[index];
        
        // 预览图片
        wx.previewImage({
          current,
          urls,
          success: () => {
            // console.log('图片预览成功');
          },
          fail: (error) => {
            // console.error('图片预览失败:', error);
            wx.showToast({
              title: '图片预览失败',
              icon: 'none'
            });
          }
        });
      }
    }
  },
  
  // 预览图片
  previewImage: function(e) {
    const current = e.currentTarget.dataset.url;
    const urls = this.data.article.images ? this.data.article.images.map(img => img.url) : [];
    
    wx.previewImage({
      current,
      urls: urls.length ? urls : [current]
    });
  },

  // 分享
  onShareAppMessage: function() {
    const article = this.data.article;
    return {
      title: article.title,
      path: `/pages/article_detail/article_detail?id=${article._id}`,
      imageUrl: article.imageUrl
    };
  },

  // 分享到朋友圈
  onShareTimeline: function() {
    const article = this.data.article;
    return {
      title: article.title,
      query: `id=${article._id}`,
      imageUrl: article.imageUrl
    };
  },

  // 处理封面图片加载错误
  handleCoverError: function(e) {
    // console.error('封面图片加载失败:', e)
    this.setData({
      'article.coverUrl': ''
    })
  },

  // 增加字体大小
  increaseFontSize: function() {
    const newSize = Math.min(this.data.fontSize + this.data.fontSizeStep, this.data.maxFontSize);
    if (newSize !== this.data.fontSize) {
      this.setData({ fontSize: newSize });
      wx.setStorageSync('fontSize', newSize);
      wx.vibrateShort({ type: 'light' });
    } else {
      wx.showToast({
        title: '已是最大字号',
        icon: 'none',
        duration: 1000
      });
    }
  },

  // 减小字体大小
  decreaseFontSize: function() {
    const newSize = Math.max(this.data.fontSize - this.data.fontSizeStep, this.data.minFontSize);
    if (newSize !== this.data.fontSize) {
      this.setData({ fontSize: newSize }, () => {
        // 重新处理所有富文本内容
        if (this.data.article) {
          const article = this.data.article;
          const processedIntro = this.processRichText(article.body || '');
          const processedContent = this.processRichText(article.content || '');
          const processedConclusion = this.processRichText(article.conclusion || '');
          
          this.setData({
            'article.introSections': processedIntro.sections,
            'article.contentSections': processedContent.sections,
            'article.conclusionSections': processedConclusion.sections
          });
        }
      });
      wx.setStorageSync('fontSize', newSize);
      wx.vibrateShort({ type: 'light' });
    } else {
      wx.showToast({
        title: '已是最小字号',
        icon: 'none',
        duration: 1000
      });
    }
  },

  // 跳转到习题页面
  showExercises: function() {
    if (!this.data.article || !this.data.article._id) {
      wx.showToast({
        title: '文章信息不完整',
        icon: 'none'
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/exercises/exercises?id=${this.data.article._id}&title=${encodeURIComponent(this.data.article.title || '')}`,
      fail: (error) => {
        // console.error('跳转习题页面失败:', error);
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    });
  },

  // 跳转到习题页面
  goToExercises: function() {
    if (!this.data.article) {
      wx.showToast({
        title: '文章数据未加载',
        icon: 'none'
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/exercises/exercises?id=${this.data.article._id}&title=${encodeURIComponent(this.data.article.title || '文章')}`,
      fail: (error) => {
        // console.error('跳转习题页面失败:', error);
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 打印文章
   */
  printArticle() {
    if (!this.data.article) {
      wx.showToast({
        title: '文章内容加载中',
        icon: 'none'
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/print_page/print_page?articleId=${this.data.article._id}&title=${encodeURIComponent(this.data.article.title)}`,
      success: (res) => {
        // 传递文章数据到打印页面
        res.eventChannel.emit('acceptArticleData', {
          article: this.data.article
        });
      }
    });
  },



  onUnload: function() {
    // 页面卸载时停止音频播放和清理定时器
    this.stopProgressUpdate();
    if (this.audioContext) {
      this.audioContext.stop();
      this.audioContext.destroy();
    }
    // 停止背景音乐
    if (this.bgmContext) {
      this.bgmContext.stop();
      this.bgmContext.destroy();
    }
  },

  // 切换播放速度
  togglePlaybackRate: function() {
    const rates = this.data.playbackRates;
    let currentIndex = this.data.currentRateIndex;
    
    // 切换到下一个速度
    currentIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[currentIndex];
    
    this.setData({
      currentRateIndex: currentIndex,
      playbackRate: newRate
    });
    
    // 如果音频正在播放，立即应用新的播放速度
    if (this.audioContext && this.audioContext.src) {
      this.audioContext.playbackRate = newRate;
    }
    
    // 显示当前播放速度
    wx.showToast({
      title: `播放速度: ${newRate}x`,
      icon: 'none',
      duration: 1000
    });
  }
}); 

// 记录阅读活动
function recordReadActivity(article) {
  wx.cloud.callFunction({
    name: 'activity',
    data: {
      action: 'createActivity',
      data: {
        type: 'read',
        title: `阅读了《${article.title}》`,
        content: {
          articleId: article._id,
          articleTitle: article.title
        }
      }
    }
  }).catch(err => {
    console.error('记录阅读活动失败:', err)
  })
}