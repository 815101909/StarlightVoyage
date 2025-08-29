// pages/system_message/system_message.js
Page({
  data: {
    messages: [],
    isLoading: true,
    colors: ['#3a79fe', '#9C27B0', '#4CAF50', '#FFC107', '#FF5722', '#2196F3', '#E91E63', '#009688']
  },

  onLoad: function (options) {
    this.loadSystemMessages();
  },

  // 加载系统消息
  async loadSystemMessages() {
    try {
      this.setData({ isLoading: true });

      const { result } = await wx.cloud.callFunction({
        name: 'system',
        data: {
          action: 'getSystemMessages'
        }
      });

      if (result.success) {
        // 处理消息数据
        const messages = result.data.map(msg => ({
          ...msg,
          timeStr: this.formatDateTime(msg.createdAt),
          type: this.getMessageType(msg.title), // 根据标题判断消息类型
          color: this.getRandomColor() // 为每条消息分配随机颜色
        }));

        this.setData({
          messages: messages,
          isLoading: false
        });
      } else {
        wx.showToast({
          title: result.message || '加载失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('加载系统消息失败：', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ isLoading: false });
      wx.stopPullDownRefresh();
    }
  },

  // 获取随机颜色
  getRandomColor() {
    const { colors } = this.data;
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  },

  // 根据标题判断消息类型
  getMessageType(title) {
    if (title.includes('系统公告')) return 'notice';
    if (title.includes('天文活动')) return 'activity';
    if (title.includes('新功能')) return 'feature';
    if (title.includes('观测')) return 'reminder';
    return 'notice'; // 默认类型
  },

  // 格式化日期时间
  formatDateTime(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },

  // 查看消息详情
  viewMessageDetail(e) {
    const message = e.currentTarget.dataset.message;
    wx.showModal({
      title: message.title,
      content: message.content,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 刷新消息
  refreshMessages() {
    wx.showLoading({
      title: '刷新中...',
    });
    this.loadSystemMessages().then(() => {
      wx.hideLoading();
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadSystemMessages();
  }
}); 