Page({
  /**
   * 页面的初始数据
   */
  data: {
    messages: [],
    isLoading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadSystemMessages();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 可以在这里刷新已读状态
  },

  /**
   * 加载系统消息
   */
  loadSystemMessages: function() {
    this.setData({ isLoading: true });
    
    // 模拟加载系统消息
    setTimeout(() => {
      const systemMessages = [
        {
          id: 'sys001',
          title: '系统公告',
          content: '天文观测小程序已更新至1.0.2版本，新增观测记录功能，现在你可以在观测页面记录你的观星体验。',
          date: '2023-12-05',
          time: '15:30',
          isRead: false,
          type: 'notice'
        },
        {
          id: 'sys002',
          title: '天文活动',
          content: '12月14日将迎来双子座流星雨极大，流星体数量预计为每小时120颗，建议当晚前往郊外观测。最佳观测时间为22:00-次日04:00。',
          date: '2023-12-10',
          time: '09:15',
          isRead: true,
          type: 'activity'
        },
        {
          id: 'sys003',
          title: '新功能提醒',
          content: '现在您可以通过观测页面拍照并记录您的星空体验，记录将显示在个人中心的记录页面。同时支持查看历史记录和分享给好友。',
          date: '2023-12-12',
          time: '18:45',
          isRead: false,
          type: 'feature'
        },
        {
          id: 'sys004',
          title: '观测提醒',
          content: '今晚将有ISS国际空间站过境，可在21:40-21:46期间在西北方向上空观测到明亮的移动光点。',
          date: '2023-12-15',
          time: '14:20',
          isRead: false,
          type: 'reminder'
        }
      ];
      
      this.setData({
        messages: systemMessages,
        isLoading: false
      });
    }, 600);
  },

  /**
   * 标记消息为已读
   */
  markAsRead: function(e) {
    const messageId = e.currentTarget.dataset.id;
    const messages = this.data.messages;
    
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex >= 0) {
      // 更新本地状态
      messages[messageIndex].isRead = true;
      this.setData({ messages });
      
      // 可以添加API调用，更新服务器上的已读状态
      // wx.request({ ... });
      
      // 查看消息详情
      this.viewMessageDetail(messages[messageIndex]);
    }
  },

  /**
   * 查看消息详情
   */
  viewMessageDetail: function(message) {
    wx.showModal({
      title: message.title,
      content: message.content,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  /**
   * 刷新消息列表
   */
  refreshMessages: function() {
    this.loadSystemMessages();
  }
}) 