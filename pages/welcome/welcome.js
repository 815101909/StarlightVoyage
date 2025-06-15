Page({
  data: {
    animationFinished: false,
    starsVisible: false,
    textLine1Visible: false,
    textLine2Visible: false,
    textLine3Visible: false,
    buttonVisible: false,
    navigating: false // 防止重复跳转
  },
  
  onLoad() {
    // 立即显示所有内容
    this.setData({
      starsVisible: true,
      textLine1Visible: true,
      textLine2Visible: true,
      textLine3Visible: true,
      buttonVisible: true,
      animationFinished: true
    })
    
    // 尝试两种方法确保跳转成功
    this.startNavigationTimer();
  },

  startNavigationTimer() {
    console.log("启动跳转计时器...");
    setTimeout(() => {
      // 如果还未跳转，则尝试跳转
      if (!this.data.navigating) {
        console.log("计时器到达，开始跳转");
        this.goToMain();
      }
    }, 2000); // 显示2秒后跳转
  },
  
  // 跳转到主页
  goToMain() {
    // 避免重复跳转
    if (this.data.navigating) {
      console.log("已经在跳转过程中，忽略重复调用");
      return;
    }
    
    console.log("正在尝试跳转到主页...");
    
    this.setData({
      navigating: true
    });

    // 先尝试通过switchTab跳转
    wx.switchTab({
      url: '/pages/star/star',
      success: () => {
        console.log("switchTab跳转成功");
      },
      fail: (err) => {
        console.error('switchTab跳转失败', err);
        
        // 如果switchTab失败，尝试reLaunch
        console.log("尝试使用reLaunch方法跳转");
        wx.reLaunch({
          url: '/pages/star/star',
          success: () => {
            console.log("reLaunch跳转成功");
          },
          fail: (err2) => {
            console.error('reLaunch跳转也失败', err2);
            
            // 最后尝试redirectTo
            console.log("尝试使用redirectTo方法跳转");
            wx.redirectTo({
              url: '/pages/star/star',
              success: () => {
                console.log("redirectTo跳转成功");
              },
              fail: (err3) => {
                console.error('所有跳转方法都失败', err3);
                // 重置导航状态，允许再次尝试
                this.setData({
                  navigating: false
                });
              }
            });
          }
        });
      }
    });
  },
  
  // 如果点击了跳过按钮
  skipAnimation() {
    // 立即跳转到主页
    this.goToMain();
  }
}) 