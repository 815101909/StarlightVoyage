Page({
  /**
   * 页面的初始数据
   */
  data: {
    isSubmitting: false,
    feedbackTypes: [
      { id: 1, name: '功能建议', checked: true },
      { id: 2, name: '内容错误', checked: false },
      { id: 3, name: '使用问题', checked: false },
      { id: 4, name: '其他', checked: false }
    ],
    currentType: 1,
    feedbackContent: '',
    contactInfo: '',
    uploadImgs: [],
    maxImgCount: 3,
    uploadTips: '可上传' + 3 + '张图片（选填）'
  },

  /**
   * 选择反馈类型
   */
  selectFeedbackType: function (e) {
    const { id } = e.currentTarget.dataset;
    
    const feedbackTypes = this.data.feedbackTypes.map(type => {
      return {
        ...type,
        checked: type.id === parseInt(id)
      };
    });
    
    this.setData({ 
      feedbackTypes,
      currentType: parseInt(id)
    });
  },

  /**
   * 输入反馈内容
   */
  inputFeedback: function (e) {
    this.setData({
      feedbackContent: e.detail.value
    });
  },

  /**
   * 输入联系方式
   */
  inputContact: function (e) {
    this.setData({
      contactInfo: e.detail.value
    });
  },

  /**
   * 上传图片
   */
  uploadImage: function () {
    const { uploadImgs, maxImgCount } = this.data;
    
    if (uploadImgs.length >= maxImgCount) {
      wx.showToast({
        title: `最多只能上传${maxImgCount}张图片`,
        icon: 'none'
      });
      return;
    }
    
    wx.chooseImage({
      count: maxImgCount - uploadImgs.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // 返回选定照片的本地文件路径列表
        const tempFilePaths = res.tempFilePaths;
        
        // 模拟上传中
        wx.showLoading({
          title: '上传中...',
        });
        
        // 开发阶段，直接显示本地图片
        setTimeout(() => {
          this.setData({
            uploadImgs: [...uploadImgs, ...tempFilePaths]
          });
          
          wx.hideLoading();
        }, 500);
        
        // 实际环境中的上传代码
        // for (let path of tempFilePaths) {
        //   wx.uploadFile({
        //     url: 'https://your-api-domain.com/api/feedback/upload-image',
        //     filePath: path,
        //     name: 'image',
        //     header: {
        //       'Authorization': `Bearer ${wx.getStorageSync('token')}`
        //     },
        //     success: (res) => {
        //       if (res.statusCode === 200) {
        //         const data = JSON.parse(res.data);
        //         if (data.success) {
        //           // 添加上传成功的图片URL
        //           this.setData({
        //             uploadImgs: [...this.data.uploadImgs, data.url]
        //           });
        //         }
        //       }
        //     },
        //     complete: () => {
        //       wx.hideLoading();
        //     }
        //   });
        // }
      }
    });
  },

  /**
   * 移除图片
   */
  removeImage: function (e) {
    const { index } = e.currentTarget.dataset;
    let { uploadImgs } = this.data;
    
    uploadImgs.splice(index, 1);
    
    this.setData({ uploadImgs });
  },

  /**
   * 预览图片
   */
  previewImage: function (e) {
    const { index } = e.currentTarget.dataset;
    const { uploadImgs } = this.data;
    
    wx.previewImage({
      current: uploadImgs[index],
      urls: uploadImgs
    });
  },

  /**
   * 提交反馈
   */
  submitFeedback: function () {
    const { feedbackContent, contactInfo, currentType, uploadImgs } = this.data;
    
    // 验证反馈内容
    if (!feedbackContent.trim()) {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ isSubmitting: true });
    
    // API预留接口
    // wx.request({
    //   url: 'https://your-api-domain.com/api/feedback/submit',
    //   method: 'POST',
    //   data: {
    //     type: currentType,
    //     content: feedbackContent,
    //     contact: contactInfo,
    //     images: uploadImgs
    //   },
    //   header: {
    //     'Authorization': `Bearer ${wx.getStorageSync('token')}`
    //   },
    //   success: (res) => {
    //     if (res.statusCode === 200 && res.data.success) {
    //       wx.showToast({
    //         title: '反馈已提交，感谢您的建议',
    //         icon: 'success',
    //         duration: 2000
    //       });
    //       
    //       // 清空表单
    //       this.resetForm();
    //       
    //       // 返回上一页
    //       setTimeout(() => {
    //         wx.navigateBack();
    //       }, 2000);
    //     } else {
    //       wx.showToast({
    //         title: '提交失败，请重试',
    //         icon: 'none'
    //       });
    //     }
    //   },
    //   fail: () => {
    //     wx.showToast({
    //       title: '网络错误，请重试',
    //       icon: 'none'
    //     });
    //   },
    //   complete: () => {
    //     this.setData({ isSubmitting: false });
    //   }
    // });
    
    // 开发阶段模拟提交
    setTimeout(() => {
      wx.showToast({
        title: '反馈已提交，感谢您的建议',
        icon: 'success',
        duration: 2000
      });
      
      // 清空表单
      this.resetForm();
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
      
      this.setData({ isSubmitting: false });
    }, 1000);
  },

  /**
   * 重置表单
   */
  resetForm: function () {
    const feedbackTypes = this.data.feedbackTypes.map((type, index) => {
      return {
        ...type,
        checked: index === 0
      };
    });
    
    this.setData({
      feedbackTypes,
      currentType: 1,
      feedbackContent: '',
      contactInfo: '',
      uploadImgs: []
    });
  }
}); 