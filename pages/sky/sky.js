// pages/sky/sky.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 基本页面数据
    loading: false,
    currentContent: 'huaxia', // 默认显示华夏星空
    activeCardSet: 'all', // 默认显示全部星宿
    activeExpression: 'literature', // 默认显示文学表达标签
    activeFunction: 'official', // 默认显示天官体系
    
    // 今日日期和星宿
    todayDate: '',
    todayXingxiu: {},
    
    // 星图轮播相关
    currentStarmapIndex: 0,
    currentStarmap: {},
    
    // 杂志风格卡片数据
    magazineCards: [
      { id: 1, title: '溯源', subtitle: '二十八星宿的历史起源与发展', coverImage: 'pics/廿八/星空1.jpg' },
      { id: 2, title: '命名', subtitle: '星宿命名的文化渊源与象征', coverImage: 'pics/廿八/星河2.jpg' },
      { id: 3, title: '角', subtitle: '东方青龙七宿之首', coverImage: 'pics/青龙/w1.jpg' },
      { id: 4, title: '亢', subtitle: '青龙的颈项', coverImage: 'pics/青龙/w2.jpg' },
      { id: 5, title: '氐', subtitle: '青龙的胸膛', coverImage: 'pics/青龙/w3.jpg' },
      { id: 6, title: '房', subtitle: '青龙的腹部', coverImage: 'pics/青龙/w4.jpg' },
      { id: 7, title: '心', subtitle: '青龙的心脏', coverImage: 'pics/青龙/w5.jpg' },
      { id: 8, title: '尾', subtitle: '青龙的尾巴', coverImage: 'pics/青龙/w6.jpg' },
      { id: 9, title: '箕', subtitle: '青龙的尾尖', coverImage: 'pics/青龙/w7.jpg' },
      { id: 10, title: '井', subtitle: '南方朱雀七宿之首', coverImage: 'pics/朱雀/t1.jpg' },
      { id: 11, title: '鬼', subtitle: '朱雀的喉咙', coverImage: 'pics/朱雀/t2.jpg' },
      { id: 12, title: '柳', subtitle: '朱雀的嘴', coverImage: 'pics/朱雀/t3.jpg' },
      { id: 13, title: '星', subtitle: '朱雀的眼睛', coverImage: 'pics/朱雀/t4.jpg' },
      { id: 14, title: '张', subtitle: '朱雀张开的喙', coverImage: 'pics/朱雀/t5.jpg' },
      { id: 15, title: '翼', subtitle: '朱雀的翅膀', coverImage: 'pics/朱雀/t6.jpg' },
      { id: 16, title: '轸', subtitle: '朱雀的尾巴', coverImage: 'pics/朱雀/t7.jpg' },
      { id: 17, title: '奎', subtitle: '西方白虎七宿之首', coverImage: 'pics/白虎/r1.jpg' },
      { id: 18, title: '娄', subtitle: '白虎的颈部', coverImage: 'pics/白虎/r2.jpg' },
      { id: 19, title: '胃', subtitle: '白虎的咽喉', coverImage: 'pics/白虎/r3.jpg' },
      { id: 20, title: '昴', subtitle: '白虎的头顶', coverImage: 'pics/白虎/r4.jpg' },
      { id: 21, title: '毕', subtitle: '白虎的肩膀', coverImage: 'pics/白虎/r5.jpg' },
      { id: 22, title: '觜', subtitle: '白虎的口部', coverImage: 'pics/白虎/r6.jpg' },
      { id: 23, title: '参', subtitle: '白虎的腰部', coverImage: 'pics/白虎/r7.jpg' },
      { id: 24, title: '斗', subtitle: '北方玄武七宿之首', coverImage: 'pics/玄武/e1.jpg' },
      { id: 25, title: '牛', subtitle: '玄武的甲壳前部', coverImage: 'pics/玄武/e2.jpg' },
      { id: 26, title: '女', subtitle: '玄武的甲壳中部', coverImage: 'pics/玄武/e3.jpg' },
      { id: 27, title: '虚', subtitle: '玄武的甲壳后部', coverImage: 'pics/玄武/e4.jpg' },
      { id: 28, title: '危', subtitle: '玄武的尾巴', coverImage: 'pics/玄武/e5.jpg' },
      { id: 29, title: '室', subtitle: '玄武的腹部', coverImage: 'pics/玄武/e6.jpg' },
      { id: 30, title: '壁', subtitle: '玄武的背甲', coverImage: 'pics/玄武/e7.jpg' }
    ],
    
    // A4卡片详情数据
    showCardModal: false,
    currentCardPage: 1,
    totalCardPages: 0,
    cardsPerPage: 2,
    currentCardDetails: [],
    
    // 星宿信息卡片数据
    xingxiuInfoType: '', // 当前显示的信息类型：'origin' 或 'naming'
    xingxiuInfo: {
      origin: {
        title: '二十八宿的历史溯源',
        content: '二十八宿起源于中国上古时期，至少可以追溯到战国时期。《史记·天官书》中有较为完整的记载。二十八宿是古人观测天象时，将黄道（太阳运行的轨道）附近的恒星分为二十八组，用来确定日月五星的位置，是中国最早的恒星体系。',
        details: [
          { subtitle: '起源时期', text: '最早的文字记载见于战国时期，但实际观测与运用可能始于更早期间。' },
          { subtitle: '形成体系', text: '汉代时期已经形成完整的体系，《史记·天官书》和《淮南子·天文训》有详细记载。' },
          { subtitle: '功能演变', text: '从最初的天文历法工具，逐渐发展为农事指导、节气预测和占卜预言的重要系统。' }
        ]
      },
      naming: {
        title: '二十八宿的命名渊源',
        content: '二十八宿的命名体现了中国古代的文化特色和思维方式。这些名称多取自动物、器物等具象事物，按照东西南北四方位排列，每个方位七宿，分别以四灵（青龙、朱雀、白虎、玄武）统领。',
        details: [
          { subtitle: '形象命名', text: '如"角"象征龙角，"氐"象征龙腹，"房"象征房舍，体现了古人将天象与现实物象联系起来的思维方式。' },
          { subtitle: '四象统领', text: '东方七宿属青龙、南方七宿属朱雀、西方七宿属白虎、北方七宿属玄武。' },
          { subtitle: '文化意义', text: '这种命名既实用又富有诗意，将天文观测与文化意象相结合，是中华文明智慧的结晶。' }
        ]
      }
    },
    
    // 星空图数据（预留API接口）
    starmapList: [
      // Removed the 28星宿相关的星图
    ],
    
    // 星宿数据
    xingxiuData: [], // 将从四个方位的星宿数据中整合而来
    
    // 四个方位的星宿数据
    eastStars: [
      { name: '角', symbol: '♈', mainStar: '角宿一', starCount: 4, direction: 'east', directionName: '东方青龙', order: 1, 
        zodiacPosition: '黄经20°-30°', modernConstellation: '室女座α星(角宿一/Spica)' },
      { name: '亢', symbol: '♉', mainStar: '亢宿四', starCount: 4, direction: 'east', directionName: '东方青龙', order: 2,
        zodiacPosition: '黄经30°-40°', modernConstellation: '室女座η、ρ、σ、τ星' },
      { name: '氐', symbol: '♊', mainStar: '氐宿一', starCount: 4, direction: 'east', directionName: '东方青龙', order: 3,
        zodiacPosition: '黄经40°-50°', modernConstellation: '天秤座α、β、γ星' },
      { name: '房', symbol: '♋', mainStar: '房宿四', starCount: 4, direction: 'east', directionName: '东方青龙', order: 4,
        zodiacPosition: '黄经50°-60°', modernConstellation: '天蝎座π、δ、ρ、β星' },
      { name: '心', symbol: '♌', mainStar: '心宿二', starCount: 3, direction: 'east', directionName: '东方青龙', order: 5,
        zodiacPosition: '黄经60°-70°', modernConstellation: '天蝎座α星(心宿二/Antares)' },
      { name: '尾', symbol: '♍', mainStar: '尾宿九', starCount: 9, direction: 'east', directionName: '东方青龙', order: 6,
        zodiacPosition: '黄经70°-80°', modernConstellation: '天蝎座μ、σ、ε、ζ、η星' },
      { name: '箕', symbol: '♎', mainStar: '箕宿一', starCount: 4, direction: 'east', directionName: '东方青龙', order: 7,
        zodiacPosition: '黄经80°-90°', modernConstellation: '人马座γ、δ、η、ε星' }
    ],
    southStars: [
      { name: '井', symbol: '♏', mainStar: '井宿一', starCount: 8, direction: 'south', directionName: '南方朱雀', order: 1,
        zodiacPosition: '黄经90°-100°', modernConstellation: '人马座φ、λ、μ、σ星' },
      { name: '鬼', symbol: '♐', mainStar: '鬼宿四', starCount: 4, direction: 'south', directionName: '南方朱雀', order: 2,
        zodiacPosition: '黄经100°-110°', modernConstellation: '人马座θ、59、60、62星' },
      { name: '柳', symbol: '♑', mainStar: '柳宿一', starCount: 8, direction: 'south', directionName: '南方朱雀', order: 3,
        zodiacPosition: '黄经110°-120°', modernConstellation: '宝瓶座δ、ε、ζ、η星' },
      { name: '星', symbol: '♒', mainStar: '星宿一', starCount: 7, direction: 'south', directionName: '南方朱雀', order: 4,
        zodiacPosition: '黄经120°-130°', modernConstellation: '宝瓶座σ、τ、ζ星' },
      { name: '张', symbol: '♓', mainStar: '张宿一', starCount: 6, direction: 'south', directionName: '南方朱雀', order: 5,
        zodiacPosition: '黄经130°-140°', modernConstellation: '飞马座μ、λ、κ星' },
      { name: '翼', symbol: '⛎', mainStar: '翼宿一', starCount: 22, direction: 'south', directionName: '南方朱雀', order: 6,
        zodiacPosition: '黄经140°-150°', modernConstellation: '飞马座α、β、γ、ε星' },
      { name: '轸', symbol: '⚕', mainStar: '轸宿一', starCount: 4, direction: 'south', directionName: '南方朱雀', order: 7,
        zodiacPosition: '黄经150°-160°', modernConstellation: '飞马座η、ξ、ο星与仙女座δ星' }
    ],
    westStars: [
      { name: '奎', symbol: '⚖', mainStar: '奎宿一', starCount: 16, direction: 'west', directionName: '西方白虎', order: 1,
        zodiacPosition: '黄经160°-170°', modernConstellation: '仙女座η、ο、π、β、μ、ν星' },
      { name: '娄', symbol: '⚗', mainStar: '娄宿一', starCount: 3, direction: 'west', directionName: '西方白虎', order: 2,
        zodiacPosition: '黄经170°-180°', modernConstellation: '白羊座α、β、γ星' },
      { name: '胃', symbol: '⚘', mainStar: '胃宿一', starCount: 3, direction: 'west', directionName: '西方白虎', order: 3,
        zodiacPosition: '黄经180°-190°', modernConstellation: '白羊座35、39、41星' },
      { name: '昴', symbol: '⚜', mainStar: '昴宿一', starCount: 7, direction: 'west', directionName: '西方白虎', order: 4,
        zodiacPosition: '黄经190°-200°', modernConstellation: '金牛座昴星团(M45)' },
      { name: '毕', symbol: '⚝', mainStar: '毕宿五', starCount: 8, direction: 'west', directionName: '西方白虎', order: 5,
        zodiacPosition: '黄经200°-210°', modernConstellation: '金牛座ε星(毕宿五/Elnath)' },
      { name: '觜', symbol: '⚡', mainStar: '觜宿一', starCount: 3, direction: 'west', directionName: '西方白虎', order: 6,
        zodiacPosition: '黄经210°-220°', modernConstellation: '猎户座λ、φ1、φ2星' },
      { name: '参', symbol: '⚢', mainStar: '参宿四', starCount: 10, direction: 'west', directionName: '西方白虎', order: 7,
        zodiacPosition: '黄经220°-230°', modernConstellation: '猎户座α星(参宿四/Betelgeuse)' }
    ],
    northStars: [
      { name: '斗', symbol: '⚣', mainStar: '斗宿一', starCount: 6, direction: 'north', directionName: '北方玄武', order: 1,
        zodiacPosition: '黄经230°-240°', modernConstellation: '巨蟹座γ、δ、η、θ星' },
      { name: '牛', symbol: '⚤', mainStar: '牛宿一', starCount: 6, direction: 'north', directionName: '北方玄武', order: 2,
        zodiacPosition: '黄经240°-250°', modernConstellation: '狮子座β、δ、ζ、γ1、γ2星' },
      { name: '女', symbol: '⚥', mainStar: '女宿一', starCount: 4, direction: 'north', directionName: '北方玄武', order: 3,
        zodiacPosition: '黄经250°-260°', modernConstellation: '狮子座λ星' },
      { name: '虚', symbol: '⚦', mainStar: '虚宿一', starCount: 2, direction: 'north', directionName: '北方玄武', order: 4,
        zodiacPosition: '黄经260°-270°', modernConstellation: '狮子座α星(虚宿一/Regulus)' },
      { name: '危', symbol: '⚧', mainStar: '危宿一', starCount: 3, direction: 'north', directionName: '北方玄武', order: 5,
        zodiacPosition: '黄经270°-280°', modernConstellation: '狮子座σ、τ、υ星' },
      { name: '室', symbol: '⚨', mainStar: '室宿一', starCount: 2, direction: 'north', directionName: '北方玄武', order: 6,
        zodiacPosition: '黄经280°-290°', modernConstellation: '狮子座α、β星' },
      { name: '壁', symbol: '⚩', mainStar: '壁宿一', starCount: 2, direction: 'north', directionName: '北方玄武', order: 7,
        zodiacPosition: '黄经290°-300°', modernConstellation: '室女座γ、δ、ε星' }
    ],
    officialSystem: [
      {
        id: 1,
        title: '天官体系概述',
        subtitle: '古代天文官职体系',
        description: '天官体系是中国古代天文观测和历法制定中的重要官职体系，负责观测天象、制定历法、预测天象变化等工作。',
        details: [
          {
            title: '太史令',
            content: '主管天文历法，负责观测天象、制定历法、记录天象变化。'
          },
          {
            title: '天文博士',
            content: '负责天文观测和历法计算，协助太史令工作。'
          },
          {
            title: '历法博士',
            content: '专门负责历法制定和修订，确保历法准确。'
          }
        ]
      },
      {
        id: 2,
        title: '星官职责',
        subtitle: '各星宿对应的官职',
        description: '二十八宿在古代天官体系中各有对应的官职和职责，形成了完整的天文观测体系。',
        details: [
          {
            title: '东方七宿',
            content: '角、亢、氐、房、心、尾、箕，对应青龙七宿，主掌春季天象。'
          },
          {
            title: '南方七宿',
            content: '井、鬼、柳、星、张、翼、轸，对应朱雀七宿，主掌夏季天象。'
          },
          {
            title: '西方七宿',
            content: '奎、娄、胃、昴、毕、觜、参，对应白虎七宿，主掌秋季天象。'
          },
          {
            title: '北方七宿',
            content: '斗、牛、女、虚、危、室、壁，对应玄武七宿，主掌冬季天象。'
          }
        ]
      }
    ],
    medicalSystem: [
      {
        id: 1,
        title: '天医体系概述',
        subtitle: '星宿与中医的关联',
        description: '天医体系是中国古代将天文星象与中医理论相结合的独特体系，通过星宿变化来指导医疗实践。',
        details: [
          {
            title: '天人相应',
            content: '认为人体与天象相应，星宿变化会影响人体健康。'
          },
          {
            title: '时令养生',
            content: '根据星宿运行规律，指导不同时节的养生方法。'
          },
          {
            title: '星宿用药',
            content: '不同星宿对应不同的药材和治疗方法。'
          }
        ]
      },
      {
        id: 2,
        title: '星宿与脏腑',
        subtitle: '星宿与人体对应关系',
        description: '二十八宿与人体脏腑有对应关系，形成了独特的天医理论体系。',
        details: [
          {
            title: '东方七宿',
            content: '对应肝脏系统，主掌春季养生。'
          },
          {
            title: '南方七宿',
            content: '对应心脏系统，主掌夏季养生。'
          },
          {
            title: '西方七宿',
            content: '对应肺脏系统，主掌秋季养生。'
          },
          {
            title: '北方七宿',
            content: '对应肾脏系统，主掌冬季养生。'
          }
        ]
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // 整合所有星宿数据
    this.integrateXingxiuData();
    
    // 设置今日日期和星宿
    this.setTodayXingxiu();
    
    // 加载星空图数据（可以从API获取）
    this.loadStarmapData();
    
    // 设置初始的当前星图
    if (this.data.starmapList.length > 0) {
      this.setData({
        currentStarmap: this.data.starmapList[0]
      });
    }
    
    // 计算杂志卡片的总页数
    this.calculateCardPages();
  },
  
  /**
   * 计算卡片的总页数
   */
  calculateCardPages: function() {
    const totalCards = this.data.magazineCards.length;
    const cardsPerPage = 2; // 每页显示2张卡片
    const totalPages = Math.ceil(totalCards / cardsPerPage);
    
    this.setData({
      totalCardPages: totalPages,
      cardsPerPage: cardsPerPage
    });
  },
  
  /**
   * 点击杂志卡片，打开详情模态框
   */
  openCardDetail: function(e) {
    const cardId = e.currentTarget.dataset.id;
    const cardIndex = this.data.magazineCards.findIndex(card => card.id === cardId);
    
    if (cardIndex === -1) return;
    
    // 计算当前页码 (每页2张卡片)
    const currentPage = Math.ceil((cardIndex + 1) / this.data.cardsPerPage);
    
    // 显示模态框
    this.setData({
      showCardModal: true,
      currentCardPage: currentPage
    });
    
    // 请求API获取数据（预留接口）
    this.loadCardPage(currentPage);
  },
  
  /**
   * 关闭卡片详情模态框
   */
  closeCardModal: function() {
    this.setData({
      showCardModal: false
    });
  },
  
  /**
   * 加载指定页的卡片数据（预留API接口）
   */
  loadCardPage: function(page) {
    // API请求示例 - 实际项目中取消注释并配置真实API端点
    // wx.request({
    //   url: 'https://api.example.com/cards/details',
    //   method: 'GET',
    //   data: {
    //     page: page,
    //     limit: this.data.cardsPerPage,  // 每页2张卡片
    //     leftCardId: (page * 2) - 1,     // 左侧卡片ID
    //     rightCardId: page * 2           // 右侧卡片ID
    //   },
    //   success: (res) => {
    //     if (res.statusCode === 200 && res.data) {
    //       console.log('API返回数据成功', res.data);
    //       // 这里不需要做任何事情，因为后台会直接更新页面内容
    //     } else {
    //       console.error('API返回错误', res);
    //     }
    //   },
    //   fail: (err) => {
    //     console.error('获取卡片详情失败', err);
    //   }
    // });
    
    console.log(`请求加载第${page}页数据，此页包含ID为${(page * 2) - 1}和${page * 2}的卡片`);
  },
  
  /**
   * 切换到上一页卡片
   */
  prevCardPage: function() {
    if (this.data.currentCardPage > 1) {
      const newPage = this.data.currentCardPage - 1;
      this.loadCardPage(newPage);
      this.setData({
        currentCardPage: newPage
      });
    }
  },
  
  /**
   * 切换到下一页卡片
   */
  nextCardPage: function() {
    if (this.data.currentCardPage < this.data.totalCardPages) {
      const newPage = this.data.currentCardPage + 1;
      this.loadCardPage(newPage);
      this.setData({
        currentCardPage: newPage
      });
    }
  },
  
  /**
   * 整合所有方位的星宿数据
   */
  integrateXingxiuData: function() {
    // 将四个方位的星宿数据合并
    const allStars = [
      ...this.data.eastStars,
      ...this.data.southStars,
      ...this.data.westStars,
      ...this.data.northStars
    ];
    
    this.setData({ xingxiuData: allStars });
  },
  
  /**
   * 设置今日日期和星宿
   */
  setTodayXingxiu: function() {
    // 获取当前日期
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    // 格式化日期
    const todayDate = `${year}年${month}月${day}日`;
    
    // 根据日期确定今日星宿（此处为示例，实际应根据专业历法确定）
    // 这里使用简化算法：以当前日期的和对28取余数决定星宿序号
    const daySum = year + month + day;
    const xingxiuIndex = daySum % 28;
    
    // 获取相应的星宿
    const todayXingxiu = this.data.xingxiuData[xingxiuIndex] || this.data.eastStars[0];
    
    this.setData({
      todayDate,
      todayXingxiu
    });
  },

  /**
   * 加载星空图数据
   * 此处预留API接口，后期可改为从服务器获取
   */
  loadStarmapData: function() {
    // 设置加载状态
    this.setData({ loading: true });
    
    // API请求示例 - 实际项目中取消注释并配置真实API端点
    // wx.request({
    //   url: 'https://api.example.com/starmaps',
    //   method: 'GET',
    //   success: (res) => {
    //     if (res.statusCode === 200 && res.data && res.data.length) {
    //       // 更新星图数据
    //       this.setData({
    //         starmapList: res.data,
    //         currentStarmap: res.data[0],  // 默认选中第一张
    //         currentStarmapIndex: 0
    //       });
    //     } else {
    //       // API返回错误或空数据时，使用本地默认数据
    //       wx.showToast({
    //         title: '获取星图数据失败，使用默认数据',
    //         icon: 'none'
    //       });
    //     }
    //   },
    //   fail: (err) => {
    //     console.error('获取星空图失败', err);
    //     wx.showToast({
    //       title: '网络错误，使用默认数据',
    //       icon: 'none'
    //     });
    //   },
    //   complete: () => {
    //     // 无论成功或失败，都关闭加载状态
    //     this.setData({ loading: false });
    //   }
    // });
    
    // 当前使用本地数据
    setTimeout(() => {
      // 模拟API加载延迟
    this.setData({
        loading: false,
        // starmapList 已在 data 中初始化
        currentStarmap: this.data.starmapList[this.data.currentStarmapIndex]
      });
    }, 500);
  },
  
  /**
   * 预览星空图
   */
  previewStarmap: function(e) {
    const src = e.currentTarget.dataset.src;
    const index = e.currentTarget.dataset.index;
    
    // 如果没有图片路径，则提示
    if (!src || src.indexOf('/assets/images/placeholder') !== -1) {
      wx.showToast({
        title: '星空图片待上传',
        icon: 'none'
      });
      return;
    }
    
    // 获取所有图片URL用于预览
    const urls = this.data.starmapList
      .filter(item => item.imageUrl && item.imageUrl.indexOf('/assets/images/placeholder') === -1)
      .map(item => item.imageUrl);
    
    if (urls.length === 0) {
      wx.showToast({
        title: '暂无图片可预览',
        icon: 'none'
      });
      return;
    }
    
    // 打开预览
    wx.previewImage({
      current: src,
      urls: urls
    });
  },

  /**
   * 切换内容区域
   */
  switchContent: function(e) {
    const type = e.currentTarget.dataset.type;
    
    // 如果点击当前已选中的内容，不做任何操作
    if (type === this.data.currentContent) return;
    
    // 切换到新的内容区域
    this.setData({
      currentContent: type
    });
    
    // 根据类型加载相应数据
    if (type === 'huaxia') {
      this.loadStarmapData();
    }
    // 其他类型的数据加载可以在此处添加
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '二十八星宿 - 探索中国古代天文学',
      path: '/pages/sky/sky'
    }
  },

  /**
   * 星图轮播切换事件
   */
  onStarmapChange: function(e) {
    const current = e.detail.current;
    this.setData({
      currentStarmapIndex: current,
      currentStarmap: this.data.starmapList[current]
    });
  },

  /**
   * 显示星宿信息
   */
  showXingxiuInfo: function(e) {
    const type = e.currentTarget.dataset.type;
    
    // 如果点击当前已选中的信息类型，不做任何操作
    if (type === this.data.xingxiuInfoType) return;
    
    // 切换到新的信息类型
    this.setData({
      xingxiuInfoType: type
    });
  },
  
  /**
   * 关闭星宿信息模态框
   */
  closeXingxiuInfo: function() {
    this.setData({
      xingxiuInfoType: ''
    });
  },
  
  /**
   * 防止模态框内容滚动穿透
   */
  preventModalScroll: function() {
    return false;
  },

  /**
   * 切换星象表达的标签页
   */
  switchExpression: function(e) {
    const expression = e.currentTarget.dataset.expression;
    this.setData({
      activeExpression: expression
    });
    
    // 这里可以预留API调用接口，从后端获取对应标签的内容
    // 例如：loadExpressionContent(expression);
  },
  
  /**
   * 从API加载星象表达内容（预留API接口）
   */
  loadExpressionContent: function(expression) {
    // API请求示例 - 实际项目中取消注释并配置真实API端点
    // wx.request({
    //   url: 'https://api.example.com/expression',
    //   method: 'GET',
    //   data: {
    //     type: expression,  // 'literature', 'astrology', 或 'mythology'
    //   },
    //   success: (res) => {
    //     if (res.statusCode === 200 && res.data) {
    //       console.log('API返回表达内容成功', res.data);
    //       // 内容将由API直接填充到A4区域
    //     } else {
    //       console.error('API返回错误', res);
    //     }
    //   },
    //   fail: (err) => {
    //     console.error('请求失败', err);
    //   }
    // });
  },

  /**
   * 切换功能类型
   */
  switchFunction: function(e) {
    const functionType = e.currentTarget.dataset.function;
    this.setData({
      activeFunction: functionType
    });
    
    // 切换时加载对应的内容
    this.loadSystemContent(functionType);
  },

  /**
   * 加载体系内容
   */
  loadSystemContent: function(systemType) {
    // 预留API接口调用
    console.log(`加载${systemType}体系内容`);
    
    // 实际项目中的API调用示例（取消注释使用）
    /*
    wx.request({
      url: `https://your-api-domain.com/api/system/${systemType}`,
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          console.log(`${systemType}体系内容加载成功`, res.data);
          // 这里可以将内容渲染到A4页面中
          // 内容将通过后台API直接填充到页面
        } else {
          console.error(`${systemType}体系内容加载失败`, res.data);
        }
      },
      fail: (err) => {
        console.error(`${systemType}体系API调用失败`, err);
      }
    });
    */
  }
}) 

