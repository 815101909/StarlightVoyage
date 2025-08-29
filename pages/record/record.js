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
    ],
    locationFormatType: 'decimal' // 新增：控制位置显示格式，可以是 'decimal'（小数）或 'dms'（度分秒）
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
  loadRecords: async function () {
    this.setData({ isLoading: true });
    
    try {
      // 调用云函数获取当前用户的观测记录
      const { result } = await wx.cloud.callFunction({
        name: 'observation',
        data: {
          action: 'getObservations',
          limit: 20,  // 每次加载20条记录
          skip: 0     // 从头开始加载
        }
      });

      if (result.success) {
        // 处理记录数据，添加必要的展示信息
        const records = result.data.map(record => ({
          id: record._id,
          type: record.type,
          title: record.name,
          image: record.image,
          date: this.formatDate(record.createTime),
          updateTime: record.updateTime,
          location: record.location ? this.formatLocation(record.location.latitude, record.location.longitude) : null
        }));
          
          this.setData({
          records: records,
            isLoading: false
          });
      } else {
        this.handleError(result.message || '加载记录失败');
      }
    } catch (error) {
      console.error('加载记录失败:', error);
      this.handleError('加载记录失败，请重试');
    }
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
        location: { latitude: 39.9042, longitude: 116.4074 }, // 模拟位置信息
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
        location: { latitude: 39.9042, longitude: 116.4074 }, // 模拟位置信息
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
   * 格式化日期
   */
  formatDate: function(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  },

  /**
   * 格式化位置信息
   */
  formatLocation: function(latitude, longitude) {
    if (this.data.locationFormatType === 'dms') {
      // 转换为度分秒格式
      const formatToDMS = (decimal, isLatitude) => {
        const absolute = Math.abs(decimal);
        const degrees = Math.floor(absolute);
        const minutes = Math.floor((absolute - degrees) * 60);
        const seconds = ((absolute - degrees - minutes/60) * 3600).toFixed(2);
        
        let direction = '';
        if (isLatitude) {
          direction = decimal >= 0 ? 'N' : 'S';
        } else {
          direction = decimal >= 0 ? 'E' : 'W';
        }
        
        return `${degrees}°${minutes}'${seconds}"${direction}`;
      };
      
      const latDMS = formatToDMS(latitude, true);
      const lonDMS = formatToDMS(longitude, false);
      return `${latDMS}, ${lonDMS}`;
    } else {
      // 保持小数格式，但美化显示
      return `${latitude.toFixed(5)}°N, ${longitude.toFixed(5)}°E`;
    }
  },

  /**
   * 切换位置格式
   */
  toggleLocationFormat: function() {
    this.setData({
      locationFormatType: this.data.locationFormatType === 'decimal' ? 'dms' : 'decimal'
    });
    // 刷新记录显示
    this.loadRecords();
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
        let detailContent = `${record.title}\n`;
        
        if (record.date) {
          detailContent += `日期: ${record.date}\n`;
        }
        
        if (record.location) {
          detailContent += `位置: ${record.location}\n`;
        }
        
        wx.showModal({
          title: '观测记录',
          content: detailContent,
          showCancel: false,
          confirmText: '返回'
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
