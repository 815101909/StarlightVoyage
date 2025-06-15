const STAR_COUNT = 18;
const getRandom = (min, max) => Math.random() * (max - min) + min;

Page({
  data: {
    stars: [], // {id, x, y, size, isWished, wish}
    showWishInput: false,
    wishText: '',
    activeStarId: null,
  },

  onLoad() {
    this.initStars();
  },

  // 初始化星星
  initStars() {
    let stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        id: Date.now() + i,
        x: getRandom(8, 88), // 百分比
        y: getRandom(10, 80),
        size: getRandom(36, 56),
        isWished: false,
        wish: ''
      });
    }
    // 加载本地已许愿星星
    const wishedStars = wx.getStorageSync('starryWishes') || [];
    wishedStars.forEach(ws => {
      stars.push(ws);
    });
    this.setData({ stars });
  },

  // 点击星空空白处
  onSkyTap(e) {
    // 获取点击位置（百分比）
    const { pageX, pageY } = e.touches ? e.touches[0] : { pageX: 200, pageY: 200 };
    const sys = wx.getSystemInfoSync();
    const x = (pageX / sys.windowWidth) * 100;
    const y = (pageY / sys.windowHeight) * 100;
    // 新增一颗星星
    const newStar = {
      id: Date.now(),
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
  onStarTap(e) {
    const id = e.currentTarget.dataset.id;
    const star = this.data.stars.find(s => s.id === id);
    if (!star) return;
    if (star.isWished) {
      // 已许愿星星，放大显示
      this.setData({ activeStarId: id });
      setTimeout(() => {
        this.setData({ activeStarId: null });
      }, 2000);
    } else {
      // 未许愿星星，弹窗许愿
      this.setData({
        activeStarId: id,
        showWishInput: true,
        wishText: ''
      });
    }
  },

  // 输入愿望
  onWishInput(e) {
    this.setData({ wishText: e.detail.value });
  },

  // 许愿确认
  confirmWish() {
    const { activeStarId, wishText, stars } = this.data;
    if (!wishText.trim()) {
      wx.showToast({ title: '请写下你的愿望', icon: 'none' });
      return;
    }
    const newStars = stars.map(star => {
      if (star.id === activeStarId) {
        return {
          ...star,
          isWished: true,
          wish: wishText.trim(),
          date: new Date().toLocaleDateString(),
          size: 72 // 许愿后变大
        };
      }
      return star;
    });
    // 保存已许愿星星到本地
    const wishedStars = newStars.filter(s => s.isWished);
    wx.setStorageSync('starryWishes', wishedStars);
    this.setData({
      stars: newStars,
      showWishInput: false,
      wishText: '',
      activeStarId: null
    });
    wx.showToast({ title: '愿望已许下', icon: 'success' });
  },

  // 取消许愿
  cancelWish() {
    this.setData({ showWishInput: false, wishText: '', activeStarId: null });
  },

  // 阻止弹窗冒泡
  stopTap() {
    // 阻止冒泡，不做任何事
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '来我的星空许愿池许下你的心愿吧',
      path: '/pages/planet_wheel/planet_wheel'
    };
  }
}); 