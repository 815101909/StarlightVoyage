Page({
  /**
   * 页面的初始数据
   */
  data: {
    article: {
      title: "探索宇宙奥秘：从星辰大海到深空探索",
      date: "2023-10-18",
      tag: "科学探索",
      coverUrl: "https://example.com/cover.jpg",
      
      // 第一段介绍部分
      introFirstChar: "宇",
      introRest: "宙是一个神秘而广阔的存在，自人类文明开始，我们就不断抬头仰望星空，思考自己在宇宙中的位置。随着科技的发展，人类对宇宙的探索也从单纯的观测逐步迈向了深空探索的新时代。",
      
      // 第一张内容图片
      firstContentImage: "https://example.com/first-content-image.jpg",
      firstImageCaption: "银河系中心的壮丽景象，由哈勃太空望远镜拍摄",
      
      // 第二段内容
      contentPart1FirstChar: "天",
      contentPart1Rest: "文学是人类最古老的科学之一，早在几千年前，我们的祖先就已经开始记录天象，追踪星辰运动的规律。从伽利略的望远镜到现代的巨型射电望远镜阵列，观测设备的进步让我们看得更远，探索得更深。",
      
      // 第二张内容图片
      contentImage: "https://example.com/content-image.jpg",
      imageCaption: "詹姆斯·韦伯太空望远镜捕捉到的深空壮丽景象",
      
      // 第三段结论
      conclusionFirstChar: "随",
      conclusionRest: "着太空探索技术的不断突破，人类正在计划更远的旅程，比如重返月球、载人登陆火星以及探索太阳系的边缘。这些任务不仅是科学上的挑战，也是整个人类文明的伟大冒险。展望未来，星辰大海将不再是遥不可及的梦想，而是我们共同的目标和征途。"
    },
    isLoading: true,
    fontSize: 28, // Default font size in rpx
    isReading: false,
    isBookmarked: false,
    audioContext: null,
    // Sample HTML for content (will be replaced with real content from API)
    sampleHtml: '<div style="color: white;">文章内容示例</div>',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 初始化音频控制器
    this.initAudioContext();
    
    wx.showLoading({
      title: '加载中',
    });
    
    this.setData({
      fontSize: wx.getStorageSync('fontSize') || 32,
      isBookmarked: false
    });

    // 获取文章ID
    const articleId = options.id || '1'; // 默认ID为1
    this.setData({ articleId });
    
    // 检查文章是否被收藏
    if(articleId) {
      this.checkBookmarkStatus(articleId);
    }
    
    // 此处应该从API获取文章数据
    // 目前使用示例数据
    this.loadSampleArticle();

    wx.hideLoading();
  },
  
  /**
   * 获取文章数据
   */
  fetchArticleData: function(id, type = 'news') {
    // Show loading
    wx.showLoading({
      title: '加载中...',
    });
    
    this.setData({ isLoading: true });
    
    // API endpoint
    const apiUrl = `https://your-api-domain.com/api/articles/${id}`;
    
    // Request article data
    wx.request({
      url: apiUrl,
      method: 'GET',
      data: {
        type: type
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          // Format article data
          const article = this.formatArticleData(res.data.data);
          this.setData({ article, isLoading: false });
        } else {
          this.handleApiError();
        }
      },
      fail: (err) => {
        console.error('API请求失败：', err);
        this.handleApiError();
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },
  
  /**
   * API错误处理（加载样例数据）
   */
  handleApiError: function() {
    wx.showToast({
      title: '获取文章失败，加载示例内容',
      icon: 'none'
    });
    
    // Load sample article for development
    this.loadSampleArticle();
  },
  
  /**
   * 提取段落首字符和剩余内容
   */
  extractFirstCharAndRest: function(text) {
    // Remove HTML tags if present
    let cleanText = text.replace(/<\/?[^>]+(>|$)/g, "").trim();
    
    // 确保文本不为空
    if (!cleanText) {
      return { firstChar: "", rest: "" };
    }
    
    // Extract first character and the rest
    const firstChar = cleanText.charAt(0);
    const rest = cleanText.substring(1);
    
    console.log('处理文本:', cleanText, '首字:', firstChar, '余下:', rest); // 调试输出
    
    return { firstChar, rest };
  },
  
  /**
   * 格式化文章数据
   */
  formatArticleData: function(apiData) {
    // Process intro text
    const introText = apiData.intro || '';
    const introExtracted = this.extractFirstCharAndRest(introText);
    
    // Process content part 1
    const contentPart1Text = apiData.contentPart1 || '';
    const contentPart1Extracted = this.extractFirstCharAndRest(contentPart1Text);
    
    // Process conclusion
    const conclusionText = apiData.conclusion || '';
    const conclusionExtracted = this.extractFirstCharAndRest(conclusionText);
    
    // Format and return article data from API
    return {
      id: apiData.id,
      title: apiData.title,
      coverUrl: apiData.coverUrl,
      date: apiData.date,
      tag: apiData.tag,
      audioUrl: apiData.audioUrl || null,
      contentImage: apiData.contentImage || null,
      imageCaption: apiData.imageCaption || '',
      thinkingQuestion: apiData.thinkingQuestion || '',
      
      // Text content with first character separated
      introFirstChar: introExtracted.firstChar,
      introRest: introExtracted.rest,
      
      contentPart1FirstChar: contentPart1Extracted.firstChar,
      contentPart1Rest: contentPart1Extracted.rest,
      
      conclusionFirstChar: conclusionExtracted.firstChar,
      conclusionRest: conclusionExtracted.rest
    };
  },
  
  /**
   * 加载示例文章（开发阶段使用）
   */
  loadSampleArticle: function() {
    let article = {
      title: '仰望星空：人类探索宇宙的旅程',
      date: '2023年10月15日',
      tag: '科普阅读',
      coverUrl: '/images/universe.jpg',
      introduction: '宇宙是一个充满神秘和壮丽的地方，自古以来就吸引着人类的目光和想象力。从最早的天文学家到现代的太空探索，人类对宇宙的探索从未停止。',
      contentPart1: '天文学是人类最古老的科学之一。早在古代，人们就开始观测星空，试图理解那些闪烁的光点。随着技术的进步，我们的视野不断扩展，从肉眼观测到望远镜的发明，再到现代的哈勃太空望远镜，人类对宇宙的理解也在不断深入。',
      conclusion: '随着太空探索技术的不断发展，人类或许能够解答更多关于宇宙起源和演化的问题。正如诗人所言："我们都是星尘的孩子，通过观察星空，我们在探索自己的起源。"',
      contentImage: '/images/telescope.jpg',
      imageCaption: '哈勃太空望远镜传回的深空图像',
      firstContentImage: '/images/stars.jpg',
      firstImageCaption: '夜空中的银河系',
      thinkingQuestion: '在阅读完本文后，你认为人类为什么要不断探索宇宙？太空探索对我们的日常生活有哪些直接或间接的影响？'
    };

    // 提取首字符和剩余内容
    const introProcessed = this.extractFirstCharAndRest(article.introduction);
    const contentPart1Processed = this.extractFirstCharAndRest(article.contentPart1);
    const conclusionProcessed = this.extractFirstCharAndRest(article.conclusion);

    // 更新数据，确保首字符和剩余内容正确设置
    this.setData({
      article: {
        ...article,
        introFirstChar: introProcessed.firstChar,
        introRest: introProcessed.rest,
        contentPart1FirstChar: contentPart1Processed.firstChar,
        contentPart1Rest: contentPart1Processed.rest,
        conclusionFirstChar: conclusionProcessed.firstChar,
        conclusionRest: conclusionProcessed.rest
      }
    });
    
    console.log('Article loaded:', this.data.article); // 调试输出
  },

  /**
   * 初始化音频上下文
   */
  initAudioContext: function() {
    const audioContext = wx.createInnerAudioContext();
    
    audioContext.onPlay(() => {
      console.log('音频开始播放');
      this.setData({ isReading: true });
    });
    
    audioContext.onStop(() => {
      console.log('音频停止');
      this.setData({ isReading: false });
    });
    
    audioContext.onEnded(() => {
      console.log('音频播放结束');
      this.setData({ isReading: false });
    });
    
    audioContext.onError((res) => {
      console.error('音频播放错误：', res);
      this.setData({ isReading: false });
      wx.showToast({
        title: '朗读功能暂不可用',
        icon: 'none'
      });
    });
    
    this.audioContext = audioContext;
  },
  
  /**
   * 检查文章收藏状态
   */
  checkBookmarkStatus: function(articleId) {
    // Get bookmarked articles from storage
    wx.getStorage({
      key: 'bookmarkedArticles',
      success: (res) => {
        const bookmarkedArticles = res.data || [];
        const isBookmarked = bookmarkedArticles.includes(articleId);
        this.setData({ isBookmarked });
      },
      fail: () => {
        // No bookmarked articles found in storage
        this.setData({ isBookmarked: false });
      }
    });
  },
  
  /**
   * 收藏/取消收藏文章
   */
  bookmarkArticle: function() {
    if (!this.data.article) return;
    
    const articleId = this.data.article.id;
    const isCurrentlyBookmarked = this.data.isBookmarked;
    
    // Get current bookmarked articles
    wx.getStorage({
      key: 'bookmarkedArticles',
      success: (res) => {
        let bookmarkedArticles = res.data || [];
        
        if (isCurrentlyBookmarked) {
          // Remove from bookmarks
          bookmarkedArticles = bookmarkedArticles.filter(id => id !== articleId);
          wx.showToast({
            title: '已取消收藏',
            icon: 'none'
          });
        } else {
          // Add to bookmarks
          bookmarkedArticles.push(articleId);
          wx.showToast({
            title: '已加入收藏',
            icon: 'success'
          });
        }
        
        // Save updated bookmarks
        wx.setStorage({
          key: 'bookmarkedArticles',
          data: bookmarkedArticles,
          complete: () => {
            this.setData({ isBookmarked: !isCurrentlyBookmarked });
          }
        });
      },
      fail: () => {
        // No bookmarks yet, create new array
        const bookmarkedArticles = [articleId];
        wx.setStorage({
          key: 'bookmarkedArticles',
          data: bookmarkedArticles,
          complete: () => {
            this.setData({ isBookmarked: true });
            wx.showToast({
              title: '已加入收藏',
              icon: 'success'
            });
          }
        });
      }
    });
  },
  
  /**
   * 增加字体大小
   */
  increaseFontSize: function() {
    // 最大字体大小限制
    if (this.data.fontSize < 48) {
      const newSize = this.data.fontSize + 2;
      this.setData({
        fontSize: newSize
      });
      // 保存设置到本地存储
      wx.setStorageSync('fontSize', newSize);
      
      wx.showToast({
        title: '字体已放大',
        icon: 'none',
        duration: 500
      });
    } else {
      wx.showToast({
        title: '已是最大字号',
        icon: 'none',
        duration: 500
      });
    }
  },
  
  /**
   * 减小字体大小
   */
  decreaseFontSize: function() {
    // 最小字体大小限制
    if (this.data.fontSize > 24) {
      const newSize = this.data.fontSize - 2;
      this.setData({
        fontSize: newSize
      });
      // 保存设置到本地存储
      wx.setStorageSync('fontSize', newSize);
      
      wx.showToast({
        title: '字体已缩小',
        icon: 'none',
        duration: 500
      });
    } else {
      wx.showToast({
        title: '已是最小字号',
        icon: 'none',
        duration: 500
      });
    }
  },
  
  /**
   * 朗读文章
   */
  readArticle: function() {
    // 检查是否正在朗读
    if (this.data.isReading) {
      // 如果正在朗读，则停止
      if (this.audioContext) {
        this.audioContext.stop();
      }
      this.setData({ isReading: false });
      return;
    }
    
    // API预留接口
    const apiUrl = "https://your-api-domain.com/api/tts";
    const articleText = this.getArticleFullText();
    
    // 显示加载中
    wx.showLoading({
      title: '准备朗读...',
    });
    
    // 调用朗读API
    wx.request({
      url: apiUrl,
      method: 'POST',
      data: {
        text: articleText,
        articleId: this.data.article.id,
        voice: 'female', // 可选参数：语音类型
        speed: 1.0       // 可选参数：语速
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          // 获取音频URL
          const audioUrl = res.data.audioUrl;
          
          // 播放音频
          if (this.audioContext) {
            this.audioContext.src = audioUrl;
            this.audioContext.play();
            this.setData({ isReading: true });
          }
        } else {
          this.handleTtsError();
        }
      },
      fail: (err) => {
        console.error('TTS API请求失败：', err);
        this.handleTtsError();
      },
      complete: () => {
        wx.hideLoading();
      }
    });
    
    // 开发阶段处理（模拟API）
    this.simulateTts();
  },
  
  // 获取文章完整文本用于朗读
  getArticleFullText: function() {
    const article = this.data.article;
    return `${article.title}。${article.introFirstChar}${article.introRest}${article.contentPart1FirstChar}${article.contentPart1Rest}${article.conclusionFirstChar}${article.conclusionRest}`;
  },
  
  // 模拟TTS API响应（开发阶段）
  simulateTts: function() {
    wx.hideLoading();
    
    // 模拟成功响应
    if (Math.random() > 0.2) { // 80%成功率
      wx.showToast({
        title: '开始朗读',
        icon: 'success'
      });
      this.setData({ isReading: true });
      
      // 3秒后自动停止（模拟）
      setTimeout(() => {
        this.setData({ isReading: false });
      }, 3000);
    } else {
      this.handleTtsError();
    }
  },
  
  // TTS错误处理
  handleTtsError: function() {
    wx.showToast({
      title: '朗读功能暂不可用',
      icon: 'none'
    });
    this.setData({ isReading: false });
  },
  
  /**
   * 打印功能 - 跳转到打印页面
   */
  printArticle: function() {
    // 获取文章ID
    const articleId = this.data.article.id || 'sample-1';
    
    // 跳转到打印页面
    wx.navigateTo({
      url: `/pages/print_page/print_page?articleId=${articleId}&title=${encodeURIComponent(this.data.article.title)}`,
      success: () => {
        console.log('成功跳转到打印页面');
      },
      fail: (err) => {
        console.error('跳转打印页面失败：', err);
        wx.showToast({
          title: '打印功能暂不可用',
          icon: 'none'
        });
      }
    });
  },
  
  /**
   * 显示习题
   */
  showExercises: function() {
    wx.showToast({
      title: '正在加载习题...',
      icon: 'loading',
      duration: 1500
    });
    
    // Mock exercise loading (would be replaced with actual API)
    setTimeout(() => {
      wx.navigateTo({
        url: `/pages/exercises/exercises?articleId=${this.data.article.id}`
      });
    }, 1500);
  },
  
  /**
   * 预览图片
   */
  previewImage: function(e) {
    let url = e.currentTarget.dataset.image || e.currentTarget.src;
    let urls = [
      this.data.article.coverUrl,
      this.data.article.firstContentImage,
      this.data.article.contentImage
    ].filter(Boolean); // 过滤掉可能的空值
    
    wx.previewImage({
      current: url,
      urls: urls
    });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    // Stop audio and release resources
    if (this.audioContext) {
      this.audioContext.stop();
    }
  },
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    const article = this.data.article;
    return {
      title: article ? article.title : '精彩文章分享',
      path: `/pages/article_detail/article_detail?id=${article ? article.id : 'sample-1'}`,
      imageUrl: article ? article.coverUrl : ''
    };
  },

  /**
   * 加载文章数据
   */
  loadArticleData: function(articleId) {
    this.setData({ isLoading: true });
    
    // 这里通常会调用API获取文章详情
    // 开发阶段使用模拟数据
    setTimeout(() => {
      // 创建唯一的文章ID
      const uniqueId = articleId || 'art' + Math.floor(Math.random() * 10 + 1);
      
      // 模拟文章数据，使用ID作为关联
      const article = {
        id: uniqueId,
        title: this.getArticleTitle(uniqueId),
        author: '晓视界编辑组',
        date: '2023-10-15',
        tags: ['天文', '科学', '宇宙'],
        views: 1256,
        likes: 328,
        introFirstChar: '在',
        introRest: '浩瀚的宇宙中，人类一直在寻找宜居的系外行星。最近，韦伯太空望远镜的最新观测数据带来了令人振奋的消息。',
        contentPart1FirstChar: '科',
        contentPart1Rest: '学家们使用韦伯太空望远镜的近红外光谱仪观测了距离地球约40光年的系外行星K2-18b的大气层。这颗行星围绕一颗红矮星运行，质量约为地球的8.6倍，半径约为地球的2.6倍，被归类为"超级地球"或"迷你海王星"。\n\n研究团队在这颗行星的大气中探测到了水分子的存在，这是韦伯望远镜首次在宜居带系外行星上探测到水分子。不仅如此，科学家们还发现了大量的甲烷和二氧化碳，这种大气成分组合与海洋行星的预测模型相符。',
        conclusionFirstChar: '这',
        conclusionRest: '一发现为寻找宜居系外行星提供了新的希望。科学家们计划使用韦伯望远镜进行后续观测，以获取更多关于这颗行星大气成分的详细信息。\n\n同时，这也提醒我们保护地球环境的重要性。在我们探索宇宙寻找第二个家园的同时，更应珍惜我们现有的美丽家园。',
        relatedArticles: [
          { id: 'art2', title: '系外行星探测技术的发展历程' },
          { id: 'art3', title: '韦伯太空望远镜的科学任务' },
          { id: 'art4', title: '宜居带系外行星的特征' }
        ]
      };
      
      this.setData({
        article: article,
        isLoading: false
      });
      
      // 检查收藏状态
      this.checkBookmarkStatus(article.id);
    }, 500);
  },
  
  /**
   * 根据ID获取文章标题
   */
  getArticleTitle: function(articleId) {
    const titleMap = {
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
    
    return titleMap[articleId] || '浩瀚宇宙：探索未知的奥秘';
  },
}) 