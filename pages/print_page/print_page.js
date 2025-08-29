Page({
  data: {
    articleId: '',
    articleTitle: '',
    printImages: [], // 改为数组存储多张图片
    currentImageIndex: 0, // 当前显示的图片索引
    isLoading: true,
    retryCount: 0
  },

  onLoad: function (options) {
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

    const { articleId, title } = options;
    
    this.setData({
      articleId: articleId || 'sample-1',
      articleTitle: decodeURIComponent(title) || '文章标题'
    });

    // 获取文章数据
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('acceptArticleData', (data) => {
      console.log('接收到的文章数据：', data);
      const article = data.article;
      if (article && article.print) {
        // 如果print是字符串，转换为数组
        const prints = Array.isArray(article.print) ? article.print : [article.print];
        console.log('打印图片URLs：', prints);
        
        // 获取所有图片的临时链接
        Promise.all(prints.map(fileID => this.getCloudFile(fileID)))
          .then(tempFileURLs => {
            const validURLs = tempFileURLs.filter(url => url); // 过滤掉null
            this.setData({
              printImages: validURLs,
              isLoading: false
            });
          });
      } else {
        console.log('未找到打印图片字段：', article);
        wx.showToast({
          title: '未找到打印图片',
          icon: 'none'
        });
      }
    });
  },

  // 获取云存储文件
  getCloudFile: async function(fileID) {
    console.log('开始获取云存储文件：', fileID);
    try {
      const res = await wx.cloud.getTempFileURL({
        fileList: [{
          fileID: fileID,
          maxAge: 60 * 60, // 有效期一小时
        }]
      });
      console.log('获取临时链接成功：', res);
      return res.fileList[0].tempFileURL;
    } catch (error) {
      console.error('获取云存储图片失败：', error);
      return null;
    }
  },

  // 切换到下一张图片
  nextImage: function() {
    if (this.data.printImages.length <= 1) return;
    let nextIndex = (this.data.currentImageIndex + 1) % this.data.printImages.length;
    this.setData({
      currentImageIndex: nextIndex
    });
  },

  // 切换到上一张图片
  prevImage: function() {
    if (this.data.printImages.length <= 1) return;
    let prevIndex = this.data.currentImageIndex - 1;
    if (prevIndex < 0) prevIndex = this.data.printImages.length - 1;
    this.setData({
      currentImageIndex: prevIndex
    });
  },

  // 预览图片
  previewImage: function() {
    if (this.data.printImages.length > 0) {
      wx.previewImage({
        current: this.data.printImages[this.data.currentImageIndex],
        urls: this.data.printImages
      });
    }
  }
});