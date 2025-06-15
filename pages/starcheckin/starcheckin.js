// pages/starcheckin/starcheckin.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    // 用户打卡信息
    checkinInfo: {
      totalDays: 0,        // 累计打卡天数
      continuousDays: 0,   // 连续打卡天数
      todayChecked: false  // 今日是否已打卡
    },
    // 日历相关数据
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    weeks: [],  // 日历数组
    selectedDate: null, // 选中的日期
    // 星体数据库
    celestialBodies: [
      {
        id: 1,
        name: '月球',
        type: 'satellite',
        image: '/assets/images/celestial/moon.png',
        description: '月球是地球唯一的天然卫星，也是太阳系中第五大的卫星。它的存在影响着地球上的潮汐、昼夜节律和季节变化。'
      },
      {
        id: 2,
        name: '火星',
        type: 'planet',
        image: '/assets/images/celestial/mars.png',
        description: '火星是太阳系中的第四颗行星，被称为"红色星球"，因其表面富含氧化铁而呈现红色。火星拥有季节、极地冰盖、峡谷和休眠火山。'
      },
      {
        id: 3,
        name: '土星',
        type: 'planet',
        image: '/assets/images/celestial/saturn.png',
        description: '土星是太阳系中的第六颗行星，以其引人注目的行星环系统而闻名。土星的密度小于水，是太阳系中密度最低的行星。'
      },
      {
        id: 4,
        name: '仙女座星系',
        type: 'galaxy',
        image: '/assets/images/celestial/andromeda.png',
        description: '仙女座星系是距离银河系最近的大型星系，也是除了银河系以外肉眼可见的最远天体。它距离地球约250万光年。'
      },
      {
        id: 5,
        name: '猎户座大星云',
        type: 'nebula',
        image: '/assets/images/celestial/orion.png',
        description: '猎户座大星云是一个位于猎户座方向的发射星云，距离地球约1344光年。它是夜空中最明亮的星云之一，肉眼就能看到。'
      },
      {
        id: 6,
        name: '大犬座α星',
        type: 'star',
        image: '/assets/images/celestial/sirius.png',
        description: '大犬座α星又称天狼星，是夜空中最亮的恒星。它距离地球约8.6光年，是一个双星系统。'
      },
      {
        id: 7,
        name: '金星',
        type: 'planet',
        image: '/assets/images/celestial/venus.png',
        description: '金星是太阳系中的第二颗行星，被称为"晨星"或"昏星"，因为它在黎明或黄昏时分外明亮。金星表面被浓密的云层覆盖。'
      },
      {
        id: 8,
        name: '木星',
        type: 'planet',
        image: '/assets/images/celestial/jupiter.png',
        description: '木星是太阳系中最大的行星，质量是太阳系中所有其他行星总和的2.5倍。它的大红斑是一个持续了至少400年的巨大风暴。'
      },
      {
        id: 9,
        name: '织女星',
        type: 'star',
        image: '/assets/images/celestial/vega.png',
        description: '织女星是天琴座中最亮的恒星，也是北半球夏季夜空中最亮的恒星之一。在中国传统星象中，它与牛郎星隔着银河相望。'
      },
      {
        id: 10,
        name: '昴宿星团',
        type: 'cluster',
        image: '/assets/images/celestial/pleiades.png',
        description: '昴宿星团是一个开放星团，肉眼可见的有7颗明亮的恒星，也被称为"七姐妹"。它位于金牛座，距离地球约444光年。'
      },
      {
        id: 11,
        name: '哈勃深空视野',
        type: 'deepspace',
        image: '/assets/images/celestial/hubble.png',
        description: '哈勃深空视野是哈勃太空望远镜拍摄的一系列深空图像，显示了宇宙中大约一万个星系，这些星系距离地球约130亿光年。'
      },
      {
        id: 12,
        name: '蟹状星云',
        type: 'nebula',
        image: '/assets/images/celestial/crab.png',
        description: '蟹状星云是一个超新星遗迹，由一颗恒星爆炸形成，这次爆炸在1054年被中国天文学家记录下来。它位于金牛座，距离地球约6500光年。'
      },
      {
        id: 13,
        name: '半人马座α星',
        type: 'star',
        image: '/assets/images/celestial/alpha.png',
        description: '半人马座α星是距离太阳系最近的恒星系统，距离约4.37光年。它实际上是一个三星系统，包括两颗主星半人马座αA和αB，以及一颗暗弱的红矮星比邻星。'
      },
      {
        id: 14,
        name: '黑洞M87',
        type: 'blackhole',
        image: '/assets/images/celestial/m87.png',
        description: 'M87星系中心的超大质量黑洞是首个被直接成像的黑洞，其图像由事件视界望远镜于2019年公布。它的质量约为太阳的65亿倍。'
      },
      {
        id: 15,
        name: '海王星',
        type: 'planet',
        image: '/assets/images/celestial/neptune.png',
        description: '海王星是太阳系中最远的行星，也是第四大行星。它的蓝色外观来自大气中的甲烷。海王星有强烈的风暴，最快风速可达每小时2100公里。'
      },
      {
        id: 16,
        name: '北极星',
        type: 'star',
        image: '/assets/images/celestial/polaris.png',
        description: '北极星指向地球的北极，是古代航海家导航的重要工具。它实际上是一个多星系统，主星是一颗黄超巨星。'
      },
      {
        id: 17,
        name: '双子座流星雨',
        type: 'meteor',
        image: '/assets/images/celestial/gemini.png',
        description: '双子座流星雨是每年12月中旬出现的流星雨，它由法厄同小行星的碎片形成，高峰期每小时可见约120颗流星。'
      },
      {
        id: 18,
        name: '彗星67P',
        type: 'comet',
        image: '/assets/images/celestial/67p.png',
        description: '彗星67P/楚留莫夫-格拉西缅科是欧洲空间局罗塞塔任务的目标。该探测器成功地将菲莱着陆器送到了彗星表面。'
      },
      {
        id: 19,
        name: '大麦哲伦云',
        type: 'galaxy',
        image: '/assets/images/celestial/lmc.png',
        description: '大麦哲伦云是银河系的卫星星系，距离约16万光年。它是南半球夜空中的一个显著特征，肉眼可见。'
      },
      {
        id: 20,
        name: '太阳',
        type: 'star',
        image: '/assets/images/celestial/sun.png',
        description: '太阳是太阳系的中心天体，是一颗G型主序星。它提供了地球上生命所需的能量，并通过引力维持着太阳系的结构。'
      },
      {
        id: 21,
        name: '水星',
        type: 'planet',
        image: '/assets/images/celestial/mercury.png',
        description: '水星是太阳系中最内侧也是最小的行星，其表面布满陨石坑。水星没有大气层保护，温度变化剧烈。'
      },
      {
        id: 22,
        name: '冥王星',
        type: 'dwarf',
        image: '/assets/images/celestial/pluto.png',
        description: '冥王星曾经被认为是太阳系的第九大行星，但在2006年被重新分类为矮行星。新视野号探测器在2015年首次近距离拍摄了冥王星。'
      },
      {
        id: 23,
        name: '天王星',
        type: 'planet',
        image: '/assets/images/celestial/uranus.png',
        description: '天王星是太阳系中第七颗行星，以希腊神话中的天空之神命名。它是唯一一个自转轴几乎与公转平面垂直的行星。'
      },
      {
        id: 24,
        name: '大熊座',
        type: 'constellation',
        image: '/assets/images/celestial/ursa.png',
        description: '大熊座是北天最著名的星座之一，其中包含了我们熟知的北斗七星。它在世界多个文化中都有重要的象征意义。'
      },
      {
        id: 25,
        name: '哈雷彗星',
        type: 'comet',
        image: '/assets/images/celestial/halley.png',
        description: '哈雷彗星是最著名的周期性彗星，大约每76年回归一次。它的下一次回归预计在2061年。'
      },
      {
        id: 26,
        name: '猎户座',
        type: 'constellation',
        image: '/assets/images/celestial/orionc.png',
        description: '猎户座是夜空中最容易辨认的星座之一，在全球多个文化中都有关于它的传说。它包含了著名的猎户座腰带三星。'
      },
      {
        id: 27,
        name: '螺旋星系M51',
        type: 'galaxy',
        image: '/assets/images/celestial/m51.png',
        description: 'M51也被称为漩涡星系，是一个经典的旋臂结构清晰可见的螺旋星系。它距离地球约2300万光年。'
      },
      {
        id: 28,
        name: '天鹅座X-1',
        type: 'blackhole',
        image: '/assets/images/celestial/cygnus.png',
        description: '天鹅座X-1是首个被确认的黑洞候选体，它是一个双星系统，由一颗恒星和一个黑洞组成。'
      },
      {
        id: 29,
        name: '人马座A*',
        type: 'blackhole',
        image: '/assets/images/celestial/sagittarius.png',
        description: '人马座A*是银河系中心的超大质量黑洞，质量约为太阳的400万倍。它于2022年首次被事件视界望远镜成像。'
      },
      {
        id: 30,
        name: '国际空间站',
        type: 'artificial',
        image: '/assets/images/celestial/iss.png',
        description: '国际空间站是人类在低地球轨道上建造的最大人造结构，也是多国合作的科学实验室，持续有人类居住工作。'
      },
      {
        id: 31,
        name: '土卫六',
        type: 'satellite',
        image: '/assets/images/celestial/titan.png',
        description: '土卫六是土星最大的卫星，也是太阳系中唯一拥有浓密大气层的卫星。它的表面有液态甲烷湖泊和河流。'
      }
    ],
    // 打卡记录
    checkinRecords: [],
    // 当前选中的星体
    currentCelestial: null,
    // 是否显示星体详情弹窗
    showCelestialDetail: false,
    // 每日正能量
    dailyQuote: {
      content: '',
      author: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initCalendar();
    this.loadCheckinData();
    this.loadDailyQuote();
  },

  /**
   * 初始化日历数据
   */
  initCalendar: function() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    this.setData({
      year: year,
      month: month,
      day: date.getDate()
    });
    
    this.generateCalendar(year, month);
  },

  /**
   * 生成日历数据
   */
  generateCalendar: function(year, month) {
    // 获取当月第一天是星期几
    const firstDay = new Date(year, month - 1, 1).getDay();
    // 获取当月天数
    const totalDays = new Date(year, month, 0).getDate();
    
    // 生成日历数组
    let weeks = [];
    let days = [];
    
    // 填充第一周前面的空白
    for (let i = 0; i < firstDay; i++) {
      days.push({
        day: '',
        hasCheckin: false,
        isToday: false,
        isCurrentMonth: false
      });
    }
    
    // 填充当月日期
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
    
    for (let i = 1; i <= totalDays; i++) {
      // 检查是否有此日期的打卡记录
      const hasCheckin = this.checkHasCheckin(year, month, i);
      
      days.push({
        day: i,
        hasCheckin: hasCheckin,
        isToday: isCurrentMonth && today.getDate() === i,
        isCurrentMonth: true,
        date: `${year}-${month < 10 ? '0' + month : month}-${i < 10 ? '0' + i : i}`
      });
      
      // 每7天为一周
      if (days.length === 7) {
        weeks.push(days);
        days = [];
      }
    }
    
    // 补全最后一周
    if (days.length > 0) {
      for (let i = days.length; i < 7; i++) {
        days.push({
          day: '',
          hasCheckin: false,
          isToday: false,
          isCurrentMonth: false
        });
      }
      weeks.push(days);
    }
    
    this.setData({ weeks });
  },

  /**
   * 检查指定日期是否有打卡记录
   */
  checkHasCheckin: function(year, month, day) {
    const dateStr = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    return this.data.checkinRecords.some(record => record.date === dateStr);
  },

  /**
   * 加载用户打卡数据
   */
  loadCheckinData: function() {
    this.setData({ isLoading: true });
    
    // 预留API接口，从后端获取打卡数据
    // wx.request({
    //   url: 'https://your-api-domain.com/api/checkin/user-data',
    //   method: 'GET',
    //   header: {
    //     'Authorization': `Bearer ${wx.getStorageSync('token')}`
    //   },
    //   success: (res) => {
    //     if (res.statusCode === 200) {
    //       this.setData({
    //         checkinInfo: res.data.checkinInfo,
    //         checkinRecords: res.data.checkinRecords
    //       });
    //       this.generateCalendar(this.data.year, this.data.month);
    //     }
    //     this.setData({ isLoading: false });
    //   },
    //   fail: () => {
    //     this.setData({ isLoading: false });
    //     this.showError('加载打卡数据失败');
    //   }
    // });
    
    // 开发阶段使用模拟数据
    setTimeout(() => {
      // 生成模拟的打卡记录
      const records = this.generateMockCheckinRecords();
      
      this.setData({
        checkinInfo: {
          totalDays: records.length,
          continuousDays: this.calculateContinuousDays(records),
          todayChecked: this.isTodayChecked(records)
        },
        checkinRecords: records,
        isLoading: false
      });
      
      this.generateCalendar(this.data.year, this.data.month);
    }, 800);
  },

  /**
   * 生成模拟的打卡记录
   * 近一个月内随机15天的打卡记录
   */
  generateMockCheckinRecords: function() {
    const records = [];
    const today = new Date();
    
    // 记录今天之前的30天内的随机打卡
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // 随机决定这一天是否打卡（70%的概率打卡）
      if (i === 0 || Math.random() < 0.7) {
        // 随机选择一个星体ID
        const celestialId = Math.floor(Math.random() * this.data.celestialBodies.length) + 1;
        
        records.push({
          date: this.formatDate(date),
          celestialId: celestialId,
          time: this.formatTime(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 
                              Math.floor(Math.random() * 12) + 8, // 8:00 - 20:00 之间
                              Math.floor(Math.random() * 60)))
        });
      }
    }
    
    // 按日期排序
    records.sort((a, b) => a.date.localeCompare(b.date));
    
    return records;
  },

  /**
   * 计算连续打卡天数
   */
  calculateContinuousDays: function(records) {
    if (records.length === 0) return 0;
    
    let continuousDays = 0;
    const today = this.formatDate(new Date());
    
    // 检查今天是否打卡
    const hasTodayCheckin = records.some(r => r.date === today);
    
    let currentDate = new Date();
    if (!hasTodayCheckin) {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    // 从今天或昨天开始倒数
    while (true) {
      const dateStr = this.formatDate(currentDate);
      const hasCheckin = records.some(r => r.date === dateStr);
      
      if (!hasCheckin) break;
      
      continuousDays++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return continuousDays;
  },

  /**
   * 检查今天是否已打卡
   */
  isTodayChecked: function(records) {
    const today = this.formatDate(new Date());
    return records.some(r => r.date === today);
  },

  /**
   * 格式化日期为 YYYY-MM-DD
   */
  formatDate: function(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
  },

  /**
   * 格式化时间为 HH:MM
   */
  formatTime: function(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
  },

  /**
   * 切换到上个月
   */
  prevMonth: function() {
    let year = this.data.year;
    let month = this.data.month - 1;
    
    if (month < 1) {
      year--;
      month = 12;
    }
    
    this.setData({
      year,
      month
    });
    
    this.generateCalendar(year, month);
  },

  /**
   * 切换到下个月
   */
  nextMonth: function() {
    let year = this.data.year;
    let month = this.data.month + 1;
    
    if (month > 12) {
      year++;
      month = 1;
    }
    
    this.setData({
      year,
      month
    });
    
    this.generateCalendar(year, month);
  },

  /**
   * 点击日期查看星体
   */
  tapDayItem: function(e) {
    const { date } = e.currentTarget.dataset;
    if (!date) return; // 点击了空白日期
    
    // 查找当天的打卡记录
    const record = this.data.checkinRecords.find(r => r.date === date);
    if (!record) {
      wx.showToast({
        title: '这天没有打卡记录',
        icon: 'none'
      });
      return;
    }
    
    // 找到对应的星体数据
    const celestial = this.data.celestialBodies.find(c => c.id === record.celestialId);
    if (!celestial) {
      wx.showToast({
        title: '星体数据不存在',
        icon: 'none'
      });
      return;
    }
    
    // 显示星体详情
    this.setData({
      currentCelestial: {
        ...celestial,
        checkinDate: date,
        checkinTime: record.time
      },
      showCelestialDetail: true
    });
  },

  /**
   * 关闭星体详情弹窗
   */
  closeCelestialDetail: function() {
    this.setData({
      showCelestialDetail: false
    });
  },

  /**
   * 执行打卡操作
   */
  doCheckin: function() {
    if (this.data.checkinInfo.todayChecked) {
      wx.showToast({
        title: '今天已经打卡了',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '打卡中...',
    });
    
    // 预留API接口，提交打卡请求
    // wx.request({
    //   url: 'https://your-api-domain.com/api/checkin/do',
    //   method: 'POST',
    //   header: {
    //     'Authorization': `Bearer ${wx.getStorageSync('token')}`
    //   },
    //   success: (res) => {
    //     if (res.statusCode === 200) {
    //       // 更新打卡信息
    //       this.setData({
    //         checkinInfo: res.data.checkinInfo,
    //         checkinRecords: res.data.checkinRecords
    //       });
    //       this.generateCalendar(this.data.year, this.data.month);
    //       
    //       // 显示今天的星体
    //       this.showTodayCelestial(res.data.todayCelestial);
    //     } else {
    //       this.showError('打卡失败，请重试');
    //     }
    //   },
    //   fail: () => {
    //     this.showError('网络错误，请重试');
    //   },
    //   complete: () => {
    //     wx.hideLoading();
    //   }
    // });
    
    // 开发阶段模拟打卡
    setTimeout(() => {
      // 随机选择一个星体
      const celestialId = Math.floor(Math.random() * this.data.celestialBodies.length) + 1;
      const celestial = this.data.celestialBodies.find(c => c.id === celestialId);
      
      // 更新打卡记录
      const today = this.formatDate(new Date());
      const now = this.formatTime(new Date());
      
      const newRecord = {
        date: today,
        celestialId: celestialId,
        time: now
      };
      
      // 添加新记录
      const updatedRecords = [...this.data.checkinRecords, newRecord];
      
      // 更新打卡信息
      const updatedInfo = {
        totalDays: this.data.checkinInfo.totalDays + 1,
        continuousDays: this.data.checkinInfo.continuousDays + 1,
        todayChecked: true
      };
      
      this.setData({
        checkinInfo: updatedInfo,
        checkinRecords: updatedRecords
      });
      
      // 重新生成日历
      this.generateCalendar(this.data.year, this.data.month);
      
      // 可能更新每日正能量
      this.loadDailyQuote();
      
      wx.hideLoading();
      
      // 显示今天的星体
      this.showTodayCelestial(celestial, today, now);
    }, 1000);
  },

  /**
   * 显示今天打卡获得的星体
   */
  showTodayCelestial: function(celestial, date, time) {
    this.setData({
      currentCelestial: {
        ...celestial,
        checkinDate: date,
        checkinTime: time
      },
      showCelestialDetail: true
    });
    
    wx.showToast({
      title: '打卡成功！',
      icon: 'success'
    });
  },

  /**
   * 显示错误提示
   */
  showError: function(message) {
    wx.showToast({
      title: message,
      icon: 'none'
    });
  },

  /**
   * 加载每日正能量
   */
  loadDailyQuote: function() {
    // 预留API接口，从后端获取每日正能量
    // wx.request({
    //   url: 'https://your-api-domain.com/api/daily-quote',
    //   method: 'GET',
    //   success: (res) => {
    //     if (res.statusCode === 200) {
    //       this.setData({
    //         dailyQuote: res.data
    //       });
    //     }
    //   },
    //   fail: () => {
    //     // 使用默认内容
    //     this.setData({
    //       dailyQuote: {
    //         content: '探索星空，发现未知的宇宙奥秘，每一次仰望都是心灵的旅行。',
    //         author: '晓视界'
    //       }
    //     });
    //   }
    // });
    
    // 开发阶段使用模拟数据
    const mockQuotes = [
      {
        content: '仰望星空，每颗星星都是一种可能，每个星系都是一个故事。',
        author: '卡尔·萨根'
      },
      {
        content: '宇宙不只是比我们想象的更奇怪，而是比我们能够想象的还要奇怪。',
        author: '亚瑟·爱丁顿'
      },
      {
        content: '在宇宙中有两件事物是无限的：宇宙本身和人类的愚蠢。不过，对于前者我还不太确定。',
        author: '阿尔伯特·爱因斯坦'
      },
      {
        content: '我们是宇宙认识自己的一种方式。',
        author: '卡尔·萨根'
      },
      {
        content: '唯有宇宙永恒，风光不与四季同。',
        author: '苏轼'
      }
    ];
    
    // 随机选择一条
    const randomIndex = Math.floor(Math.random() * mockQuotes.length);
    this.setData({
      dailyQuote: mockQuotes[randomIndex]
    });
  }
}) 