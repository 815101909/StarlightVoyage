// pages/record/record.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLoggedIn: false,
    records: [],
    isLoading: true,
    recordTypes: [
      { id: 'observation', name: '观测记录', icon: '🔭' },
      { id: 'learning', name: '学习笔记', icon: '📚' },
      { id: 'stargazing', name: '观星心得', icon: '✨' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.checkLoginStatus();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 每次页面显示时都检查登录状态和刷新数据
    this.checkLoginStatus();
    
    // 不论登录状态如何，都尝试加载记录
    // 这样即使有临时记录变更也能响应
    this.loadRecords();
    
    console.log('记录页面显示，刷新数据');
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus: function () {
    const token = wx.getStorageSync('token');
    this.setData({
      isLoggedIn: !!token
    });
    
    if (!token) {
      this.setData({ isLoading: false });
    }
  },

  /**
   * 加载记录列表
   */
  loadRecords: function () {
    this.setData({ isLoading: true });
    
    // 预留API接口，从后端获取记录列表
    // wx.request({
    //   url: 'https://your-api-domain.com/api/records',
    //   method: 'GET',
    //   header: {
    //     'Authorization': `Bearer ${wx.getStorageSync('token')}`
    //   },
    //   success: (res) => {
    //     if (res.statusCode === 200) {
    //       this.setData({
    //         records: res.data.data || [],
    //         isLoading: false
    //       });
    //     } else {
    //       this.handleError('加载记录失败');
    //     }
    //   },
    //   fail: () => {
    //     this.handleError('网络错误，请重试');
    //   }
    // });
    
    // 从localStorage加载用户记录
    setTimeout(() => {
      let userRecords = wx.getStorageSync('userRecords');
      
      if (userRecords) {
        try {
          // 尝试解析JSON字符串
          if (typeof userRecords === 'string') {
            userRecords = JSON.parse(userRecords);
          }
          
          this.setData({
            records: userRecords,
            isLoading: false
          });
          
          console.log('从存储加载的记录:', userRecords);
          
        } catch (e) {
          console.error('解析记录数据错误:', e);
          this.loadMockRecords(); // 解析失败时加载模拟数据
        }
      } else {
        // 如果没有记录，加载模拟数据
        this.loadMockRecords();
      }
    }, 500);
  },
  
  /**
   * 加载模拟记录数据
   */
  loadMockRecords: function() {
    const mockRecords = [
      {
        id: 'rec1',
        type: 'observation',
        title: '春季猎户座带观测记录',
        content: '今晚使用150mm反射望远镜观测猎户座带，天气晴朗，透明度良好。成功观测到猎户座大星云(M42)的细节结构...',
        location: '北京市海淀区',
        date: '2023-10-12',
        images: ['/assets/images/record_image1.jpg'],
        tags: ['猎户座', '深空天体', '星云']
      },
      {
        id: 'rec2',
        type: 'learning',
        title: '哈勃望远镜的工作原理学习笔记',
        content: '哈勃太空望远镜是一个位于地球低轨道的空间望远镜，于1990年发射。其主要特点是能够避开地球大气层的干扰...',
        date: '2023-09-28',
        tags: ['望远镜', '太空', '科学']
      },
      {
        id: 'rec3',
        type: 'stargazing',
        title: '首次观测到流星雨的感受',
        content: '今晚在郊外观测到了英仙座流星雨，这是我第一次亲眼看到如此壮观的天文现象。流星划过夜空的瞬间...',
        location: '河北省廊坊市',
        date: '2023-08-15',
        images: ['/assets/images/record_image2.jpg', '/assets/images/record_image3.jpg'],
        tags: ['流星雨', '英仙座', '观星']
      }
    ];
    
    this.setData({
      records: mockRecords,
      isLoading: false
    });
  },

  /**
   * 处理错误
   */
  handleError: function (message) {
    this.setData({ isLoading: false });
    wx.showToast({
      title: message,
      icon: 'none'
    });
  },

  /**
   * 创建新记录
   */
  createRecord: function () {
    if (!this.data.isLoggedIn) {
      this.navigateToLogin();
      return;
    }
    
    wx.showActionSheet({
      itemList: this.data.recordTypes.map(type => `${type.icon} ${type.name}`),
      success: (res) => {
        if (res.tapIndex >= 0) {
          const selectedType = this.data.recordTypes[res.tapIndex];
          this.navigateToEditor(selectedType.id);
        }
      }
    });
  },

  /**
   * 跳转到编辑器页面
   */
  navigateToEditor: function (recordType) {
    wx.navigateTo({
      url: `/pages/record_editor/record_editor?type=${recordType}`,
      fail: () => {
        wx.showToast({
          title: '记录功能开发中',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 查看记录详情
   */
  viewRecordDetail: function (e) {
    const recordId = e.currentTarget.dataset.id;
    
    // 从记录列表中找到对应的记录
    const record = this.data.records.find(r => r.id === recordId);
    
    if (!record) {
      wx.showToast({
        title: '记录不存在',
        icon: 'none'
      });
      return;
    }
    
    // 尝试跳转到详情页
    wx.navigateTo({
      url: `/pages/record_detail/record_detail?id=${recordId}`,
      fail: () => {
        // 如果导航失败，显示模态框展示记录详情
        let detailContent = `${record.title}\n\n`;
        
        if (record.date) {
          detailContent += `日期: ${record.date}\n`;
        }
        
        if (record.location) {
          detailContent += `位置: ${record.location}\n`;
        }
        
        if (record.tags && record.tags.length > 0) {
          detailContent += `标签: ${record.tags.join(', ')}\n`;
        }
        
        detailContent += `\n${record.content}`;
        
        wx.showModal({
          title: record.type === 'observation' ? '观测记录' : 
                 record.type === 'learning' ? '学习笔记' : '观星心得',
          content: detailContent,
          showCancel: false,
          confirmText: '返回',
          success: (res) => {
            // 如果记录有图片，显示图片预览
            if (record.images && record.images.length > 0) {
              setTimeout(() => {
                wx.previewImage({
                  current: record.images[0],
                  urls: record.images
                });
              }, 500);
            }
          }
        });
      }
    });
  },

  /**
   * 跳转到登录页面
   */
  navigateToLogin: function () {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },

  /**
   * 导航到观测页面
   */
  navigateToObserve: function() {
    wx.navigateTo({
      url: '/pages/observe/observe'
    });
  },
}) 