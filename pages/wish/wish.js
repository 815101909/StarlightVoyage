// pages/wish/wish.js
const STAR_COUNT = 18;
const getRandom = (min, max) => Math.random() * (max - min) + min;

Page({
  data: {
    stars: [], // {id, x, y, size, isWished, wish}
    showWishInput: false,
    wishText: '',
    activeStarId: null,
    showWishDetail: false, // 显示愿望详情
    currentWish: null // 当前选中的愿望
  },

  onLoad() {
    const app = getApp();
    if (!app.isUserLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    this.loadWishes();
  },

  // 加载已有的愿望并初始化星星
  async loadWishes() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'wishes',
        data: {
          type: 'list',
          data: {
            onlyMine: true  // 只获取自己的愿望
          }
        }
      });

      if (result.success) {
        const wishes = result.data;
        // 根据已有的愿望创建星星
        const stars = wishes.map(wish => ({
          id: wish._id,
          x: wish.position.x,
          y: wish.position.y,
          size: wish.starSize,
          isWished: true,
          wish: wish.content,
          date: new Date(wish.createTime).toLocaleDateString(),
          isCompleted: wish.isCompleted || false
        }));

        // 如果愿望数量少于STAR_COUNT，添加新的空星星
        while (stars.length < STAR_COUNT) {
          stars.push({
            id: 'new_' + Date.now() + '_' + stars.length,
            x: getRandom(8, 88),
            y: getRandom(10, 80),
            size: getRandom(36, 56),
            isWished: false,
            wish: ''
          });
        }

        this.setData({ stars });
      }
    } catch (err) {
      console.error('加载愿望失败:', err);
      // 加载失败时，至少显示空的星星
      this.initEmptyStars();
    }
  },

  // 初始化空星星（仅在加载失败时使用）
  initEmptyStars() {
    let stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        id: 'new_' + Date.now() + '_' + i,
        x: getRandom(8, 88),
        y: getRandom(10, 80),
        size: getRandom(36, 56),
        isWished: false,
        wish: ''
      });
    }
    this.setData({ stars });
  },

  // 点击星空空白处
  onSkyTap(e) {
    // 获取点击位置（百分比）
    const { pageX, pageY } = e.touches ? e.touches[0] : { pageX: 200, pageY: 200 };
    const sys = {
      ...wx.getAppBaseInfo(),
      ...wx.getDeviceInfo(),
      ...wx.getWindowInfo()
    };
    const x = (pageX / sys.windowWidth) * 100;
    const y = (pageY / sys.windowHeight) * 100;
    // 新增一颗星星
    const newStar = {
      id: 'new_' + Date.now(),
      x,
      y,
      size: getRandom(40, 60),
      isWished: false,
      wish: ''
    };
    this.setData({
      stars: [...this.data.stars, newStar],
      activeStarId: newStar.id,
      showWishInput: true,
      wishText: ''
    });
  },

  // 点击星星
  async onStarTap(e) {
    const id = e.currentTarget.dataset.id;
    const star = this.data.stars.find(s => s.id === id);
    if (!star) return;
    
    if (star.isWished) {
      // 已许愿星星，直接显示详情
      this.setData({ 
        currentWish: star,
        showWishDetail: true,
        activeStarId: id
      });
    } else {
      // 未许愿星星，弹窗许愿
      this.setData({
        activeStarId: id,
        showWishInput: true,
        wishText: ''
      });
    }
  },

  // 获取用户信息
  async getUserInfo() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'auth',
        data: { action: 'getOpenid' }
      }).then(res => {
        if (res.result && res.result.success) {
          resolve(res.result.data);
        } else {
          reject(new Error('获取用户信息失败'));
        }
      }).catch(reject);
    });
  },

  // 删除愿望
  async deleteWish() {
    const { currentWish } = this.data;
    if (!currentWish || !currentWish.id) return;

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'wishes',
        data: {
          type: 'delete',
          data: {
            wishId: currentWish.id
          }
        }
      });

      if (result.success) {
        // 从stars中移除该愿望
        const stars = this.data.stars.filter(s => s.id !== currentWish.id);
        // 添加一个新的空星星
        stars.push({
          id: 'new_' + Date.now(),
          x: getRandom(8, 88),
          y: getRandom(10, 80),
          size: getRandom(36, 56),
          isWished: false,
          wish: ''
        });

        this.setData({
          stars,
          showWishDetail: false,
          currentWish: null,
          activeStarId: null
        });
        wx.showToast({ title: '愿望已删除', icon: 'success' });
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('删除愿望失败:', err);
      wx.showToast({ 
        title: '删除失败，请重试',
        icon: 'none'
      });
    }
  },

  // 标记愿望已实现
  async markAsCompleted() {
    const { currentWish } = this.data;
    if (!currentWish || !currentWish.id) return;

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'wishes',
        data: {
          type: 'update',
          data: {
            wishId: currentWish.id,
            isCompleted: true
          }
        }
      });

      if (result.success) {
        // 更新stars中的愿望状态
        const stars = this.data.stars.map(s => {
          if (s.id === currentWish.id) {
            return { ...s, isCompleted: true };
          }
          return s;
        });

        this.setData({
          stars,
          currentWish: { ...this.data.currentWish, isCompleted: true }
        });
        wx.showToast({ title: '愿望已实现', icon: 'success' });
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('更新愿望状态失败:', err);
      wx.showToast({ 
        title: '操作失败，请重试',
        icon: 'none'
      });
    }
  },

  // 输入愿望
  onWishInput(e) {
    this.setData({ wishText: e.detail.value });
  },

  // 许愿确认
  async confirmWish() {
    const { activeStarId, wishText, stars } = this.data;
    if (!wishText.trim()) {
      wx.showToast({ title: '请写下你的愿望', icon: 'none' });
      return;
    }

    try {
      const star = stars.find(s => s.id === activeStarId);
      const { result } = await wx.cloud.callFunction({
        name: 'wishes',
        data: {
          type: 'add',
          data: {
            content: wishText.trim(),
            position: {
              x: star.x,
              y: star.y
            },
            starSize: 72,
            isCompleted: false
          }
        }
      });

      if (result.success) {
        // 使用返回的_id更新星星
        const newStars = stars.map(s => {
          if (s.id === activeStarId) {
            return {
              ...s,
              id: result.data._id,
              isWished: true,
              wish: wishText.trim(),
              date: new Date().toLocaleDateString(),
              size: 72,
              _openid: result.data._openid,
              isCompleted: false
            };
          }
          return s;
        });

        this.setData({
          stars: newStars,
          showWishInput: false,
          wishText: '',
          activeStarId: null
        });
        wx.showToast({ title: '愿望已许下', icon: 'success' });
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('许愿失败:', err);
      wx.showToast({ 
        title: '许愿失败，请重试',
        icon: 'none'
      });
    }
  },

  // 取消许愿
  cancelWish() {
    this.setData({ showWishInput: false, wishText: '', activeStarId: null });
  },

  // 关闭愿望详情
  closeWishDetail() {
    this.setData({ 
      showWishDetail: false,
      currentWish: null,
      activeStarId: null
    });
  },

  // 阻止弹窗冒泡
  stopTap() {
    // 阻止冒泡，不做任何事
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '来我的星空许愿池许下你的心愿吧',
      path: '/pages/wish/wish'
    };
  }
}); 