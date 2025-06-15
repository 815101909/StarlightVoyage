Page({

  /**
   * 页面的初始数据
   */
  data: {
    articleId: '',
    articleTitle: '',
    printMode: 'text', // 默认为文本打印模式
    uploadedImages: [], // 上传的图片列表
    previewContent: [], // 文本预览内容
    currentDate: '', // 当前日期，用于预览
    isLoading: true,
    imageUrl: '' // 图片URL将由API提供
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { articleId, title } = options;
    
    // 设置当前日期
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    this.setData({
      articleId: articleId || 'sample-1',
      articleTitle: decodeURIComponent(title) || '文章标题',
      currentDate: formattedDate
    });
    
    // 获取文章内容用于预览
    this.fetchArticleContent();
  },
  
  /**
   * 获取文章内容用于预览
   */
  fetchArticleContent: function() {
    // 显示加载中
    wx.showLoading({
      title: '加载中...',
    });
    
    this.setData({ isLoading: true });
    
    // API端口
    const apiUrl = `https://your-api-domain.com/api/articles/${this.data.articleId}/print`;
    
    // 调用API获取文章内容
    wx.request({
      url: apiUrl,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          // 处理API返回的数据
          this.processArticleContent(res.data.data);
        } else {
          // API请求失败
          this.handleApiError();
        }
      },
      fail: (err) => {
        console.error('API请求失败：', err);
        this.handleApiError();
      },
      complete: () => {
        wx.hideLoading();
        this.setData({ isLoading: false });
      }
    });
    
    // 开发阶段使用模拟数据
    this.loadSampleContent();
  },
  
  /**
   * 处理API返回的文章内容
   */
  processArticleContent: function(data) {
    // 将文章内容分段处理
    const paragraphs = [];
    
    if (data.intro) {
      paragraphs.push(data.intro);
    }
    
    if (data.content) {
      // 将内容按段落拆分
      const contentParagraphs = data.content.split('\n\n').filter(p => p.trim() !== '');
      paragraphs.push(...contentParagraphs);
    }
    
    if (data.conclusion) {
      paragraphs.push(data.conclusion);
    }
    
    this.setData({
      previewContent: paragraphs
    });
  },
  
  /**
   * 加载模拟文章内容（开发阶段）
   */
  loadSampleContent: function() {
    // 模拟数据
    const sampleParagraphs = [
      "宇宙是一个神秘而广阔的存在，自人类文明开始，我们就不断抬头仰望星空，思考自己在宇宙中的位置。随着科技的发展，人类对宇宙的探索也从单纯的观测逐步迈向了深空探索的新时代。",
      "天文学是人类最古老的科学之一，早在几千年前，我们的祖先就已经开始记录天象，追踪星辰运动的规律。从伽利略的望远镜到现代的巨型射电望远镜阵列，观测设备的进步让我们看得更远，探索得更深。",
      "当代天文学的重要发现包括暗物质、暗能量、引力波等，这些发现极大地拓展了我们对宇宙本质的理解。詹姆斯·韦伯太空望远镜和即将升空的罗曼太空望远镜，将进一步揭示宇宙的奥秘。",
      "随着太空探索技术的不断突破，人类正在计划更远的旅程，比如重返月球、载人登陆火星以及探索太阳系的边缘。这些任务不仅是科学上的挑战，也是整个人类文明的伟大冒险。",
      "展望未来，星辰大海将不再是遥不可及的梦想，而是我们共同的目标和征途。每一次探索，都让我们对宇宙和自身有更深刻的认识和理解。"
    ];
    
    this.setData({
      previewContent: sampleParagraphs
    });
  },
  
  /**
   * API错误处理
   */
  handleApiError: function() {
    wx.showToast({
      title: '获取文章内容失败',
      icon: 'none'
    });
    
    // 加载模拟数据
    this.loadSampleContent();
  },
  
  /**
   * 切换打印模式（文本/图片）
   */
  setPrintMode: function(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({
      printMode: mode
    });
  },
  
  /**
   * 选择图片上传
   */
  chooseImage: function() {
    wx.chooseImage({
      count: 5 - this.data.uploadedImages.length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // 合并已有图片和新选择的图片
        const images = [...this.data.uploadedImages, ...res.tempFilePaths];
        this.setData({
          uploadedImages: images
        });
        
        // 如果是真实环境，这里会上传图片到服务器
        // this.uploadImagesToServer(res.tempFilePaths);
      }
    });
  },
  
  /**
   * 上传图片到服务器
   */
  uploadImagesToServer: function(tempFilePaths) {
    // 上传中提示
    wx.showLoading({
      title: '上传中...',
    });
    
    // 上传计数器
    let uploadedCount = 0;
    const totalCount = tempFilePaths.length;
    const uploadedUrls = [];
    
    // 上传图片
    tempFilePaths.forEach((filePath, index) => {
      wx.uploadFile({
        url: 'https://your-api-domain.com/api/upload/print-image',
        filePath: filePath,
        name: 'image',
        formData: {
          'articleId': this.data.articleId,
          'index': index
        },
        success: (res) => {
          uploadedCount++;
          
          // 解析返回的JSON
          const data = JSON.parse(res.data);
          if (data.success) {
            uploadedUrls.push(data.url);
          }
          
          // 全部上传完成
          if (uploadedCount === totalCount) {
            this.handleUploadComplete(uploadedUrls);
          }
        },
        fail: (err) => {
          console.error('上传失败：', err);
          uploadedCount++;
          
          // 即使有失败也继续处理剩余图片
          if (uploadedCount === totalCount) {
            this.handleUploadComplete(uploadedUrls);
          }
        }
      });
    });
  },
  
  /**
   * 图片上传完成处理
   */
  handleUploadComplete: function(urls) {
    wx.hideLoading();
    
    if (urls.length > 0) {
      wx.showToast({
        title: '上传成功',
        icon: 'success'
      });
      
      // 更新上传图片的URL（实际URL而非临时路径）
      // this.setData({
      //   uploadedImages: urls
      // });
    } else {
      wx.showToast({
        title: '上传失败',
        icon: 'none'
      });
    }
  },
  
  /**
   * 预览上传的图片
   */
  previewUploadedImage: function(e) {
    const index = e.currentTarget.dataset.index;
    
    wx.previewImage({
      current: this.data.uploadedImages[index],
      urls: this.data.uploadedImages
    });
  },
  
  /**
   * 删除上传的图片
   */
  deleteImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const images = [...this.data.uploadedImages];
    images.splice(index, 1);
    
    this.setData({
      uploadedImages: images
    });
  },
  
  /**
   * 提交打印请求
   */
  submitPrint: function() {
    // 显示加载中
    wx.showLoading({
      title: '发送打印请求...',
    });
    
    // 构建请求数据
    const requestData = {
      articleId: this.data.articleId,
      printMode: this.data.printMode
    };
    
    // 如果是图片打印模式，添加图片数据
    if (this.data.printMode === 'image' && this.data.uploadedImages.length > 0) {
      requestData.images = this.data.uploadedImages;
    }
    
    // API端口
    const apiUrl = 'https://your-api-domain.com/api/print';
    
    // 发送打印请求
    wx.request({
      url: apiUrl,
      method: 'POST',
      data: requestData,
      success: (res) => {
        wx.hideLoading();
        
        if (res.statusCode === 200 && res.data.success) {
          // 打印请求成功
          wx.showToast({
            title: '已发送到打印队列',
            icon: 'success'
          });
        } else {
          // 打印请求失败
          wx.showModal({
            title: '打印失败',
            content: res.data.message || '服务器错误，请稍后再试',
            showCancel: false
          });
        }
      },
      fail: (err) => {
        console.error('API请求失败：', err);
        wx.hideLoading();
        
        wx.showModal({
          title: '打印失败',
          content: '网络错误，请检查网络连接',
          showCancel: false
        });
      }
    });
    
    // 开发阶段模拟打印结果
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '打印请求已发送',
        icon: 'success'
      });
    }, 1500);
  },
  
  /**
   * 保存为PDF
   */
  savePdf: function() {
    // 显示加载中
    wx.showLoading({
      title: '生成PDF...',
    });
    
    // API端口
    const apiUrl = `https://your-api-domain.com/api/articles/${this.data.articleId}/pdf`;
    
    // 构建请求数据
    const requestData = {
      printMode: this.data.printMode
    };
    
    // 如果是图片打印模式，添加图片数据
    if (this.data.printMode === 'image' && this.data.uploadedImages.length > 0) {
      requestData.images = this.data.uploadedImages;
    }
    
    // 发送PDF生成请求
    wx.request({
      url: apiUrl,
      method: 'POST',
      data: requestData,
      success: (res) => {
        wx.hideLoading();
        
        if (res.statusCode === 200 && res.data.success) {
          // PDF生成成功，下载PDF
          this.downloadPdf(res.data.pdfUrl);
        } else {
          // PDF生成失败
          wx.showModal({
            title: 'PDF生成失败',
            content: res.data.message || '服务器错误，请稍后再试',
            showCancel: false
          });
        }
      },
      fail: (err) => {
        console.error('API请求失败：', err);
        wx.hideLoading();
        
        wx.showModal({
          title: 'PDF生成失败',
          content: '网络错误，请检查网络连接',
          showCancel: false
        });
      }
    });
    
    // 开发阶段模拟PDF生成
    setTimeout(() => {
      wx.hideLoading();
      wx.showModal({
        title: 'PDF已生成',
        content: '文件已保存至"文件"应用中',
        showCancel: false
      });
    }, 1500);
  },
  
  /**
   * 下载PDF文件
   */
  downloadPdf: function(pdfUrl) {
    wx.showLoading({
      title: '下载中...',
    });
    
    wx.downloadFile({
      url: pdfUrl,
      success: (res) => {
        wx.hideLoading();
        
        if (res.statusCode === 200) {
          // 打开PDF
          wx.openDocument({
            filePath: res.tempFilePath,
            success: () => {
              console.log('打开文档成功');
            },
            fail: (err) => {
              console.error('打开文档失败：', err);
            }
          });
        } else {
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('下载文件失败：', err);
        wx.hideLoading();
        
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        });
      }
    });
  },
  
  /**
   * 获取A4图片数据（API预留）
   */
  getA4ImageData: function() {
    // API预留接口
    // wx.request({
    //   url: 'https://your-api-domain.com/api/print',
    //   success: (res) => {
    //     if (res.statusCode === 200) {
    //       this.setData({
    //         imageUrl: res.data.imageUrl
    //       });
    //     }
    //   }
    // });
  },
  
  /**
   * 打印A4区域
   */
  printA4: function() {
    wx.showLoading({
      title: '准备打印...',
    });
    
    // API预留
    // 这里将通过API发送打印请求
    // wx.request({
    //   url: 'https://your-api-domain.com/api/print',
    //   method: 'POST',
    //   data: {
    //     articleId: this.data.articleId,
    //     imageUrl: this.data.imageUrl
    //   },
    //   success: (res) => {
    //     // 处理成功响应
    //   }
    // });
    
    // 开发阶段模拟打印
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '打印请求已发送',
        icon: 'success'
      });
    }, 1500);
  },
  
  /**
   * 返回上一页
   */
  navigateBack: function() {
    wx.navigateBack();
  }
}); 