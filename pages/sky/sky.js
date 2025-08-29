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
    
    // 30张精美卡片设计（2张文化介绍 + 28张星宿卡片）
    // 注释掉本地数据，强制从云端获取
    magazineCards: [], // 初始为空，强制从云端加载
    
    // A4卡片详情数据
    showCardModal: false,
    currentCardPage: 1,
    totalCardPages: 0,
    cardsPerPage: 2,
    leftCardData: null, // 左侧卡片数据
    rightCardData: null, // 右侧卡片数据
    
    // 星宿卡片详情模态框
    showDetailModal: false,
    currentDetailCard: null,
    currentDetailPage: 1,
    totalDetailPages: 1,
    
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
    starmapList: [],
    
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
    // 天官体系和天医体系数据（从云函数加载）
    allSystems: [],
    
    // 星宿表达数据 - 新增
    literatureExpression: [], // 文学表达卡片
    astrologyExpression: [], // 占星表达卡片
    mythologyExpression: [], // 故事表达卡片
    
    // 星宿表达详情控制 - 新增
    currentExpressionType: '', // 当前表达类型
    currentExpressionCards: [], // 当前表达卡片组
    
    // 当前星宿详情数据
    currentCardDetail: null
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
    
    // 加载28宿卡片数据
    this.loadXingxiuCards();
    
    // 加载星宿功能数据
    this.loadXingxiuFunctions();
    
    // 加载星宿表达数据 - 新增
    this.loadXingxiuExpressions();
    
    // 设置初始的当前星图
    if (this.data.starmapList.length > 0) {
      this.setData({
        currentStarmap: this.data.starmapList[0]
      });
    }
    
    // 计算杂志卡片的总页数（在数据加载完成后会重新计算）
    this.calculateCardPages();
  },
  
  /**
   * 加载星宿卡片数据（使用云开发）
   */
  loadXingxiuCards: function() {
    // 直接使用云开发获取数据
    this.loadXingxiuCardsFromCloud();
    
    // 注释：传统API分支已废弃
    // const app = getApp();
    // if (app.globalData.useCloudAPI) {
    //   this.loadXingxiuCardsFromCloud();
    // } else {
    //   this.loadConstellationCards();
    // }
  },

  /**
   * 加载星宿功能数据（天官体系和天医体系）
   */
  loadXingxiuFunctions: function() {
    // 直接使用云开发获取数据
    this.loadXingxiuFunctionsFromCloud();
    
    // 注释：非云API分支已废弃
    // const app = getApp();
    // if (app.globalData.useCloudAPI) {
    //   this.loadXingxiuFunctionsFromCloud();
    // } else {
    //   this.useDefaultXingxiuFunctions();
    // }
  },

  /**
   * 从云开发获取星宿功能数据
   */
  loadXingxiuFunctionsFromCloud: function() {
    const { starmapAPI } = require('../../utils/cloudApi');
    
    // 加载所有星宿功能数据，不带 category
    starmapAPI.getXingxiuFunctions().then(result => {
      let allSystems = [];
      if (Array.isArray(result)) {
        allSystems = this.transformFunctionData(result);
      } else if (result && result.success && Array.isArray(result.data)) {
        allSystems = this.transformFunctionData(result.data);
      }
      
      // 更新数据
      this.setData({
        allSystems: allSystems
      });
    }).catch(error => {
      console.error('加载星宿功能数据失败:', error);
      // 注释：不再使用默认数据作为回退方案
      // this.useDefaultXingxiuFunctions();
      
      // 可选：显示错误提示或保持loading状态
      wx.showToast({
        title: '数据加载失败',
        icon: 'none',
        duration: 2000
      });
    });
  },

  /**
   * 将云函数返回的数据转换为页面需要的格式
   */
  transformFunctionData: function(cloudData) {
    return cloudData.map(item => {
      // 为所有数据设置统一默认封面图片
      let defaultCoverImage = '/pages/sky/pics/placeholder-card.jpg';

      // 保留完整的必要字段
      const transformedItem = {
        _id: item._id,  // 保留原始 _id
        id: item.id || item._id, // 使用 id 字段，如果没有则使用 _id
        coverImage: item.coverImage || defaultCoverImage,
        imageUrls: item.imageUrls || [item.coverImage || defaultCoverImage], // 保留 imageUrls 字段
        isActive: item.isActive !== undefined ? item.isActive : true // 默认为 true
      };
      
      return transformedItem;
    }).filter(item => {
      // 确保返回的项有必要的字段
      const isValid = item && item.coverImage && (item.id !== undefined || item._id !== undefined);
      if (!isValid) {
        console.error('无效的数据项:', item);
      }
      return isValid;
    }).sort((a, b) => {
      // 按 id 数字顺序排序
      const idA = typeof a.id === 'number' ? a.id : parseInt(a.id) || 0;
      const idB = typeof b.id === 'number' ? b.id : parseInt(b.id) || 0;
      return idA - idB;
    });
  },

  /**
   * 根据应用场景获取具体内容
   */
  getApplicationContent: function(application, category) {
    // 删除此函数，因为不再需要
  },

  /**
   * 获取默认的详情信息（用于没有applications字段的数据）
   */
  getDefaultDetails: function(title) {
    // 删除此函数，因为不再需要
  },

  // 注释：已废弃的默认数据函数，现在完全使用云开发数据
  /*
   * 使用默认的星宿功能数据（云函数失败时的备用方案）
   * 已废弃：现在完全依赖云开发数据
   */
  /*
  useDefaultXingxiuFunctions: function() {
    
    const defaultOfficialSystem = [
      {
        id: 1,
        title: '天官体系概述',
        subtitle: '古代天文官职体系',
        description: '天官体系是中国古代天文观测和历法制定中的重要官职体系，负责观测天象、制定历法、预测天象变化等工作。',
        details: [
          { title: '太史令', content: '主管天文历法，负责观测天象、制定历法、记录天象变化。' },
          { title: '天文博士', content: '负责天文观测和历法计算，协助太史令工作。' },
          { title: '历法博士', content: '专门负责历法制定和修订，确保历法准确。' }
        ]
      },
      {
        id: 2,
        title: '星官职责',
        subtitle: '各星宿对应的官职',
        description: '二十八宿在古代天官体系中各有对应的官职和职责，形成了完整的天文观测体系。',
        details: [
          { title: '东方七宿', content: '角、亢、氐、房、心、尾、箕，对应青龙七宿，主掌春季天象。' },
          { title: '南方七宿', content: '井、鬼、柳、星、张、翼、轸，对应朱雀七宿，主掌夏季天象。' },
          { title: '西方七宿', content: '奎、娄、胃、昴、毕、觜、参，对应白虎七宿，主掌秋季天象。' },
          { title: '北方七宿', content: '斗、牛、女、虚、危、室、壁，对应玄武七宿，主掌冬季天象。' }
        ]
      }
    ];
    
    const defaultMedicalSystem = [
      {
        id: 1,
        title: '天医体系概述',
        subtitle: '星宿与中医的关联',
        description: '天医体系是中国古代将天文星象与中医理论相结合的独特体系，通过星宿变化来指导医疗实践。',
        details: [
          { title: '天人相应', content: '认为人体与天象相应，星宿变化会影响人体健康。' },
          { title: '时令养生', content: '根据星宿运行规律，指导不同时节的养生方法。' },
          { title: '星宿用药', content: '不同星宿对应不同的药材和治疗方法。' }
        ]
      },
      {
        id: 2,
        title: '星宿与脏腑',
        subtitle: '星宿与人体对应关系',
        description: '二十八宿与人体脏腑有对应关系，形成了独特的天医理论体系。',
        details: [
          { title: '东方七宿', content: '对应肝脏系统，主掌春季养生。' },
          { title: '南方七宿', content: '对应心脏系统，主掌夏季养生。' },
          { title: '西方七宿', content: '对应肺脏系统，主掌秋季养生。' },
          { title: '北方七宿', content: '对应肾脏系统，主掌冬季养生。' }
        ]
      }
    ];
    
    this.setData({
      officialSystem: defaultOfficialSystem,
      medicalSystem: defaultMedicalSystem
    });
  },
  */

  /**
   * 功能卡片点击事件
   */
  onFunctionCardTap: function(e) {
    const cardId = e.currentTarget.dataset.cardId;
    
    const allCards = this.data.allSystems;
    
    // 同时检查 _id 和 id 字段
    const functionCard = allCards.find(item => 
      item._id === cardId || item.id === cardId
    );
    
    if (functionCard) {
      const cardIndex = allCards.findIndex(item => 
        item._id === cardId || item.id === cardId
      );
      const currentPage = cardIndex + 1;
      const totalPages = allCards.length;
      
      this.loadFunctionDetail(functionCard, currentPage, totalPages);
    } else {
      console.log('查找失败，cardId:', cardId, 'allCards:', allCards);
      wx.showToast({
        title: '卡片数据不存在',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 从云开发获取星宿卡片数据
   */
  loadXingxiuCardsFromCloud: function() {
    const app = getApp();
    if (!app.globalData.useCloudAPI) {
      console.error('云开发未启用');
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });
    
    const cloudApi = require('../../utils/cloudApi.js');
    cloudApi.starmapAPI.getXingxiuCards()
      .then(res => {
        console.log('云端星宿卡片数据:', res);
        if (res && res.data && Array.isArray(res.data)) {
          this.setData({
            magazineCards: res.data,
            loading: false
          });
          // 重新计算页数
          this.calculateCardPages();
        } else {
          throw new Error('数据格式错误');
        }
      })
      .catch(err => {
        console.error('加载星宿卡片失败:', err);
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
        this.setData({ loading: false });
      });
  },

  /**
   * 使用默认星宿卡片数据
   */
  useDefaultXingxiuCards: function() {
    // 使用页面data中预设的magazineCards数据
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
   * 星宿卡片点击事件 - 修改为每个星宿一页
   */
  onCardTap: function(e) {
    const index = e.currentTarget.dataset.index;
    
    // 直接使用index获取对应的卡片数据
    if (index >= 0 && index < this.data.magazineCards.length) {
      const currentCard = this.data.magazineCards[index];
      const currentPage = index + 1; // 页码从1开始
      const totalPages = this.data.magazineCards.length;
      
      // 从云端获取星宿详细信息
      this.loadXingxiuDetail(currentCard, currentPage, totalPages);
    } else {
      wx.showToast({
        title: '卡片数据不存在',
        icon: 'none',
        duration: 2000
      });
    }
  },
  
  /**
   * 从云端加载星宿详细信息
   */
  loadXingxiuDetail: function(card, currentPage, totalPages) {
    const { starmapAPI } = require('../../utils/cloudApi');
    
    console.log('开始加载星宿详情:', {
      cardId: card._id,
      title: card.title,
      currentPage,
      totalPages
    });
    
    // 显示加载状态
    wx.showLoading({
      title: '加载中...',
    });
    
    // 调用云函数获取星宿详情
    starmapAPI.getXingxiuDetail(card._id, card.title).then(result => {
      wx.hideLoading();
      console.log('获取星宿详情成功:', result);
      
      let cardDetailData = {
        _id: card._id,
        title: card.title,
        subtitle: card.subtitle,
        description: card.description,
        coverImage: card.coverImage,
        imageUrls: card.imageUrls || [] // 使用原始卡片的imageUrls作为默认值
      };
      
      // 处理云函数返回的数据
      if (result && result.data) {
        const detailData = result.data;
        console.log('处理详情数据:', detailData);
        
        // 处理图片数组
        let imageUrls = [];
        if (detailData.imageUrls && Array.isArray(detailData.imageUrls)) {
          imageUrls = detailData.imageUrls;
          console.log('使用详情中的imageUrls:', imageUrls);
        } else if (card.imageUrls && Array.isArray(card.imageUrls)) {
          imageUrls = card.imageUrls;
          console.log('使用原始卡片的imageUrls:', imageUrls);
        }
        
        cardDetailData = {
          ...cardDetailData,
          title: detailData.title || card.title,
          subtitle: detailData.subtitle || card.subtitle,
          description: detailData.description || card.description,
          coverImage: detailData.coverImage || card.coverImage,
          imageUrls: imageUrls
        };
      } else {
        console.log('云函数未返回有效数据，使用原始卡片数据');
      }
      
      console.log('最终设置的详情数据:', cardDetailData);
      
      // 打开模态框并设置数据
      this.setData({
        showCardModal: true,
        currentCardPage: currentPage,
        totalCardPages: totalPages,
        currentCardDetail: cardDetailData
      }, () => {
        console.log('模态框数据设置完成:', {
          currentPage: this.data.currentCardPage,
          totalPages: this.data.totalCardPages
        });
      });
      
    }).catch(error => {
      wx.hideLoading();
      console.error('获取星宿详情失败:', error);
      
      // 使用原始卡片数据
      const basicData = {
        _id: card._id,
        title: card.title,
        subtitle: card.subtitle,
        description: card.description,
        coverImage: card.coverImage,
        imageUrls: card.imageUrls || []
      };
      
      console.log('错误情况下使用的数据:', basicData);
      
      this.setData({
        showCardModal: true,
        currentCardPage: currentPage,
        totalCardPages: totalPages,
        currentCardDetail: basicData
      });
    });
  },

  /**
   * 从云端加载功能详细信息（复用星宿详情模态框）
   */
  loadFunctionDetail: function(card, currentPage, totalPages) {
    const { starmapAPI } = require('../../utils/cloudApi');
    
    console.log('loadFunctionDetail 调用，card:', card);
    
    // 使用 _id 或 id 作为 functionId
    const functionId = card._id || card.id;
    const title = card.title || `功能 ${card.id || card._id}`;
    
    wx.showLoading({
      title: '加载中...',
    });
    
    // 调用云函数获取详情
    starmapAPI.getXingxiuFunctionDetail(functionId, title)
      .then(detailData => {
        wx.hideLoading();
        console.log('功能详情数据:', detailData);
        
        // 移除字段映射逻辑，直接使用云函数返回的数据
        // 确保 imageUrls 字段存在且不为空
        if (detailData && (!detailData.imageUrls || detailData.imageUrls.length === 0)) {
          detailData.imageUrls = [card.coverImage];
        }
        
        this.setData({
          currentContent: 'function',
          showCardModal: true,
          currentCardPage: currentPage,
          totalCardPages: totalPages,
          currentCardDetail: detailData || {
            _id: card._id,
            id: card.id,
            title: title,
            coverImage: card.coverImage,
            isActive: card.isActive,
            content: '暂无详细信息',
            imageUrls: [card.coverImage]
          }
        });
      })
      .catch(error => {
        wx.hideLoading();
        console.error('获取功能详情失败:', error);
        
        // 使用基础数据作为后备方案
        const basicData = {
          _id: card._id,
          id: card.id,
          title: title,
          coverImage: card.coverImage,
          isActive: card.isActive,
          content: '暂无详细信息',
          imageUrls: [card.coverImage]
        };
        
        this.setData({
          currentContent: 'function',
          showCardModal: true,
          currentCardPage: currentPage,
          totalCardPages: totalPages,
          currentCardDetail: basicData
        });
      });
  },

  /**
   * 关闭卡片详情模态框
   */
  closeCardModal: function() {
    this.setData({
      showCardModal: false,
      leftCardData: null,
      rightCardData: null,
      currentCardDetail: null,
      currentExpressionType: '',
      currentExpressionCards: []
    });
  },

  /**
   * 图片预览功能
   */
  previewImage: function(e) {
    const src = e.currentTarget.dataset.src;
    if (!src) return;
    
    // 构建预览图片数组
    let urls = [src];
    
    // 如果有详细图片，加入预览数组
    if (this.data.currentCardDetail && this.data.currentCardDetail.imageUrls) {
      urls = [src, ...this.data.currentCardDetail.imageUrls.filter(url => url !== src)];
    }
    
    wx.previewImage({
      current: src,
      urls: urls
    });
  },

  /**
   * 图片加载错误处理
   */
  onImageError: function(e) {
    console.error('图片加载失败:', e.detail);
    wx.showToast({
      title: '图片加载失败',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 生成模拟图片数据（临时方案）
   */
  generateMockImages: function(starName) {
    // 根据星宿名称生成模拟的图片URL
    const mockImages = [];
    
    // 如果有封面图片，优先使用
    if (this.data.magazineCards) {
      const currentCard = this.data.magazineCards.find(card => card.title === starName);
      if (currentCard && currentCard.coverImage) {
        mockImages.push(currentCard.coverImage);
      }
    }
    
    // 添加一些示例图片URL（您可以替换为真实的图片链接）
    const sampleImages = [
      'https://pic.616pic.com/ys_bnew_img/00/13/34/VNOlv8xZUt.jpg', // 星空示例图1
      'https://pic.616pic.com/ys_bnew_img/00/23/88/dR9f1BGTIS.jpg', // 星空示例图2
      'https://pic.616pic.com/ys_bnew_img/00/23/88/1w3Cl6ZrJW.jpg'  // 星空示例图3
    ];
    
    // 随机选择1-3张图片
    const imageCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < imageCount && i < sampleImages.length; i++) {
      if (!mockImages.includes(sampleImages[i])) {
        mockImages.push(sampleImages[i]);
      }
    }
    
    return mockImages;
  },

  /**
   * 切换到上一页卡片 - 修改为星宿导航
   */
  prevCardPage: function() {
    if (this.data.currentContent === 'function') {
      if (this.data.currentCardPage > 1) {
        const newPage = this.data.currentCardPage - 1;
        const newCardIndex = newPage - 1;
        const allCards = this.data.allSystems;
        const newCard = allCards[newCardIndex];
        if (newCard) {
          this.loadFunctionDetail(newCard, newPage, allCards.length);
        }
      }
    } else {
      if (this.data.currentCardPage > 1) {
        const newPage = this.data.currentCardPage - 1;
        const newCardIndex = newPage - 1;
        const newCard = this.data.magazineCards[newCardIndex];
        if (newCard) {
          this.loadXingxiuDetail(newCard, newPage, this.data.totalCardPages);
        }
      }
    }
  },
  
  /**
   * 切换到下一页卡片 - 修改为星宿导航
   */
  nextCardPage: function() {
    if (this.data.currentContent === 'function') {
      const allCards = this.data.allSystems;
      if (this.data.currentCardPage < allCards.length) {
        const newPage = this.data.currentCardPage + 1;
        const newCardIndex = newPage - 1;
        const newCard = allCards[newCardIndex];
        if (newCard) {
          this.loadFunctionDetail(newCard, newPage, allCards.length);
        }
      }
    } else {
      if (this.data.currentCardPage < this.data.totalCardPages) {
        const newPage = this.data.currentCardPage + 1;
        const newCardIndex = newPage - 1;
        const newCard = this.data.magazineCards[newCardIndex];
        if (newCard) {
          this.loadXingxiuDetail(newCard, newPage, this.data.totalCardPages);
        }
      }
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
   */
  loadStarmapData: function() {
    const { starmapAPI } = require('../../utils/cloudApi');
    
    // 显示加载状态
    this.setData({ loading: true });
    
    // 从云端获取星图数据
    starmapAPI.getStarMaps().then(result => {
      if (result && result.success && Array.isArray(result.data)) {
        const starmapList = result.data.map(item => ({
          id: item._id,
          title: item.title,
          description: item.description,
          imageUrl: item.imageUrl
        }));
        
        // 更新数据
        this.setData({
          loading: false,
          starmapList: starmapList,
          currentStarmap: starmapList[0] || null,
          currentStarmapIndex: 0
        });
      } else {
        this.setData({ loading: false });
        
        wx.showToast({
          title: '数据格式错误',
          icon: 'none',
          duration: 2000
        });
      }
    }).catch(error => {
      console.error('加载星图数据失败:', error);
      this.setData({ loading: false });
      
      wx.showToast({
        title: '加载失败',
        icon: 'none',
        duration: 2000
      });
    });
  },

  /**
   * 从云开发获取星图数据
   */
  loadStarmapDataFromCloud: function() {
    const { starmapAPI } = require('../../utils/cloudApi');
    
    // 调用云函数获取星图数据
    starmapAPI.getStarMaps({
      limit: 20
    }).then(result => {
      // callCloudFunction 直接返回了数据数组，不是包含success字段的对象
      if (result && Array.isArray(result) && result.length > 0) {
        // 处理云开发返回的数据，只使用云存储或网络图片
        const starMaps = result.map((item) => {
          let imageUrl = null;
          
          if (item.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.trim()) {
            if (item.imageUrl.startsWith('cloud://') || 
                item.imageUrl.startsWith('http://') || 
                item.imageUrl.startsWith('https://')) {
              imageUrl = item.imageUrl;
            }
            // 如果是相对路径，转换为云存储URL
            else if (item.imageUrl.startsWith('/uploads/')) {
              const filename = item.imageUrl.replace('/uploads/images/', '');
              imageUrl = `cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1330472678/uploads/images/${filename}`;
            }
          }
          
          return {
            id: item._id,
            title: item.title,
            description: item.description,
            imageUrl: imageUrl
          };
        });
        
        // 更新星图数据
        this.setData({
          starmapList: starMaps,
          currentStarmap: starMaps[0],
          currentStarmapIndex: 0,
          loading: false
        });
      } else {
        this.handleStarmapLoadError('未获取到星图数据');
      }
    }).catch(error => {
      console.error('云函数获取星图数据失败:', error);
      this.handleStarmapLoadError('获取数据失败');
    });
  },

  /**
   * 从传统后端获取星图数据
   */
  loadStarmapDataFromBackend: function() {
    // 获取全局API配置
    const app = getApp();
    const apiBaseUrl = app.globalData.apiBaseUrl;
    
    // 调用华夏星空API
    wx.request({
      url: `${apiBaseUrl}/sky/chinese/starmap`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.success) {
          const responseData = res.data.data;
          let starMaps = [];
          
          // 检查是否有starMaps数组（新版API）
          if (responseData.starMaps && responseData.starMaps.length > 0) {
            starMaps = responseData.starMaps;
          } 
          // 否则使用单个星图字段（当前API格式）
          else if (responseData.imageUrl && responseData.title) {
            starMaps = [{
              id: 'current_starmap',
              imageUrl: responseData.imageUrl,
              description: responseData.description,
              title: responseData.title
            }];
          }
          
          if (starMaps.length > 0) {
            // 处理图片URL，确保是完整路径
            const processedStarMaps = starMaps.map(starMap => ({
              ...starMap,
              imageUrl: starMap.imageUrl.startsWith('/uploads/') 
                ? apiBaseUrl.replace('/api', '') + starMap.imageUrl 
                : starMap.imageUrl
            }));
            
            // 更新星图数据
            this.setData({
              starmapList: processedStarMaps,
              currentStarmap: processedStarMaps[0],
              currentStarmapIndex: 0,
              loading: false
            });
          } else {
            this.handleStarmapLoadError('未获取到星图数据');
          }
        } else {
          this.handleStarmapLoadError('API返回错误');
        }
      },
      fail: (err) => {
        console.error('获取华夏星空图失败', err);
        this.handleStarmapLoadError('网络错误');
      }
    });
  },
  
  /**
   * 处理星图加载错误
   */
  handleStarmapLoadError: function(message) {
    // 使用默认的星图数据
    const defaultStarmaps = [
      {
        id: 'default_1',
        title: '华夏星空',
        description: '正在加载华夏星空数据...',
        imageUrl: null
      }
    ];
    
    this.setData({
      starmapList: defaultStarmaps,
      currentStarmap: defaultStarmaps[0],
      currentStarmapIndex: 0,
      loading: false
    });
  },
  
  /**
   * 预览星空图
   */
  previewStarmap: function(e) {
    const src = e.currentTarget.dataset.src;
    if (src) {
      wx.previewImage({
        current: src,
        urls: [src]
      });
    }
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
    switch(type) {
      case 'huaxia':
      this.loadStarmapData();
        break;
      case 'cards':
        this.loadXingxiuCards();
        break;
      case 'function':
        this.loadXingxiuFunctions();
        break;
      case 'expression':
        this.loadXingxiuExpressions();
        break;
    }
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
   * 图片加载错误处理
   */
  onImageError: function(e) {
    // 图片加载失败处理
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
    const starmap = this.data.starmapList[current];
    
    this.setData({
      currentStarmapIndex: current,
      currentStarmap: starmap
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
    const type = e.currentTarget.dataset.expression;
    
    // 获取对应的数据数组
    let expressionData = [];
    switch(type) {
      case 'literature':
        expressionData = this.data.literatureExpression;
        break;
      case 'astrology':
        expressionData = this.data.astrologyExpression;
        break;
      case 'mythology':
        expressionData = this.data.mythologyExpression;
        break;
    }
    
    // 如果有数据，只更新状态
    if (expressionData && expressionData.length > 0) {
      const totalPages = expressionData.length;
      
    this.setData({
        activeExpression: type,
        currentCardPage: 1,
        totalCardPages: totalPages,
        currentExpressionType: type,
        showCardModal: false
      });
    } else {
      wx.showToast({
        title: '暂无数据',
        icon: 'none',
        duration: 2000
    });
    }
  },
  
  /**
   * 加载星宿表达数据
   */
  loadXingxiuExpressions: function() {
    // 直接使用云开发获取数据
    this.loadXingxiuExpressionsFromCloud();
  },

  /**
   * 从云开发获取星宿表达数据
   */
  loadXingxiuExpressionsFromCloud: function() {
    const { starmapAPI } = require('../../utils/cloudApi');
    
    // 显示加载状态
    wx.showLoading({
      title: '加载中...',
    });
    
    // 同时加载三种表达方式的数据
    Promise.all([
      starmapAPI.getXingxiuExpressions({ type: 'literature' }),
      starmapAPI.getXingxiuExpressions({ type: 'astrology' }),
      starmapAPI.getXingxiuExpressions({ type: 'mythology' })
    ]).then(results => {
      wx.hideLoading();
      
      // 处理每种类型的数据
      const [literatureResult, astrologyResult, mythologyResult] = results;
      
      // 设置数据，确保使用data字段
      this.setData({
        literatureExpression: this.processExpressionData(literatureResult.data || []),
        astrologyExpression: this.processExpressionData(astrologyResult.data || []),
        mythologyExpression: this.processExpressionData(mythologyResult.data || [])
      });
      
      console.log('星象表达数据加载完成:', {
        literature: this.data.literatureExpression,
        astrology: this.data.astrologyExpression,
        mythology: this.data.mythologyExpression
      });
      
    }).catch(error => {
      wx.hideLoading();
      console.error('加载星宿表达数据失败:', error);
      
      wx.showToast({
        title: '数据加载失败',
        icon: 'none',
        duration: 2000
      });
      
      // 使用空数组作为默认值
      this.setData({
        literatureExpression: [],
        astrologyExpression: [],
        mythologyExpression: []
      });
    });
  },

  /**
   * 处理星宿表达数据
   */
  processExpressionData: function(data) {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => {
      // 处理封面图片
      let coverImage = null;
      if (item.coverImage && typeof item.coverImage === 'string' && item.coverImage.trim()) {
        coverImage = this.processImageUrl(item.coverImage);
      }
      
      // 处理图片数组
      let imageUrls = [];
      if (item.imageUrls && Array.isArray(item.imageUrls)) {
        imageUrls = item.imageUrls.map(url => this.processImageUrl(url)).filter(url => url !== null);
      }
      
      return {
        id: item.id || item._id,
        dbId: item._id,
        title: item.title,
        subtitle: item.subtitle,
        coverImage: coverImage,
        imageUrls: imageUrls,
        description: item.description,
        content: item.content,
        type: item.type,
        order: item.order || 0
      };
    });
  },

  /**
   * 处理图片URL
   */
  processImageUrl: function(url) {
    if (!url || typeof url !== 'string' || !url.trim()) {
      return null;
    }

    const trimmedUrl = url.trim();
    
    // 如果已经是云存储或HTTP(S)链接，直接返回
    if (trimmedUrl.startsWith('cloud://') || 
        trimmedUrl.startsWith('http://') || 
        trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }
    
    // 如果是相对路径，转换为云存储URL
    if (trimmedUrl.startsWith('/uploads/')) {
      const filename = trimmedUrl.replace('/uploads/images/', '');
      return `cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1330472678/uploads/images/${filename}`;
    }
    
    // 其他情况返回null
    return null;
  },

  /**
   * 使用默认星宿表达数据
   */
  useDefaultExpressionData: function() {
    const defaultLiteratureData = [
      {
        id: 'lit_1',
        title: '诗经中的星宿',
        subtitle: '古代诗歌中的星空意象',
        coverImage: 'pics/星象表达.jpg',
        imageUrls: [
          'cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1345335463/Constellations Cards/test.png',
          'cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1345335463/Constellations Cards/test2.png'
        ],
        description: '《诗经》中多处提到星宿，如"维天有汉，监亦有光"等，体现了古人对星空的诗意理解。',
        content: '《诗经》作为中国最早的诗歌总集，其中蕴含着丰富的天文知识和星空意象...',
        type: 'literature'
      },
      {
        id: 'lit_2',
        title: '唐诗中的星象',
        subtitle: '盛唐诗人的星空情怀',
        coverImage: 'pics/星象表达.jpg',
        imageUrls: [
          'cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1345335463/Constellations Cards/test.png',
          'cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1345335463/Constellations Cards/test2.png'
        ],
        description: '唐代诗人如李白、杜甫等，常以星象入诗，抒发情感，寄托理想。',
        content: '李白《静夜思》中的"举头望明月"，杜甫《月夜忆舍弟》中的"戍鼓断人行，边秋一雁声"...',
        type: 'literature'
      },
      {
        id: 'lit_3',
        title: '宋词中的星月',
        subtitle: '婉约豪放中的天象描写',
        coverImage: 'pics/星象表达.jpg',
        imageUrls: [
          'cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1345335463/Constellations Cards/test.png',
          'cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1345335463/Constellations Cards/test2.png'
        ],
        description: '宋代词人将星月意象融入词作，创造了独特的意境美。',
        content: '苏轼《水调歌头》中的"明月几时有"，辛弃疾《青玉案》中的"蛾儿雪柳黄金缕"...',
        type: 'literature'
      }
    ];
    
    const defaultAstrologyData = [
      {
        id: 'ast_1',
        title: '星宿占卜',
        subtitle: '古代占星术的基本原理',
        coverImage: 'pics/星象表达.jpg',
        imageUrls: [
          'cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1345335463/Constellations Cards/test.png',
          'cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1345335463/Constellations Cards/test2.png'
        ],
        description: '古代占星师通过观察星宿的位置和变化，预测人事吉凶。',
        content: '中国古代占星术以二十八宿为基础，结合五行理论，形成了独特的占卜体系...',
        type: 'astrology'
      },
      {
        id: 'ast_2',
        title: '星象与命运',
        subtitle: '星宿对人生的影响',
        coverImage: 'pics/星象表达.jpg',
        imageUrls: [
          'cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1345335463/Constellations Cards/test.png',
          'cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1345335463/Constellations Cards/test2.png'
        ],
        description: '古人认为出生时的星象配置会影响一个人的性格和命运。',
        content: '根据出生时间对应的星宿，古代占星师会推算出这个人的性格特点...',
        type: 'astrology'
      },
      {
        id: 'ast_3',
        title: '时辰星宿',
        subtitle: '不同时辰的星宿守护',
        coverImage: 'pics/星象表达.jpg',
        imageUrls: [
          'cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1345335463/Constellations Cards/test.png',
          'cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1345335463/Constellations Cards/test2.png'
        ],
        description: '每个时辰都有对应的星宿守护，影响着这个时辰的吉凶。',
        content: '子时对应虚宿，丑时对应危宿，寅时对应室宿...',
        type: 'astrology'
      }
    ];
    
    const defaultMythologyData = [
      {
        id: 'myth_1',
        title: '牛郎织女',
        subtitle: '最著名的星宿爱情故事',
        coverImage: 'pics/星象表达.jpg',
        imageUrls: [
          'cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1345335463/Constellations Cards/test.png',
          'cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1345335463/Constellations Cards/test2.png'
        ],
        description: '牛郎星（河鼓二）和织女星（织女一）的爱情故事，流传千年。',
        content: '相传织女是天帝的女儿，心灵手巧，能织出美丽的云彩...',
        type: 'mythology'
      },
      {
        id: 'myth_2',
        title: '嫦娥奔月',
        subtitle: '月宫中的美丽传说',
        coverImage: 'pics/星象表达.jpg',
        imageUrls: [
          'cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1345335463/Constellations Cards/test.png',
          'cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1345335463/Constellations Cards/test2.png'
        ],
        description: '嫦娥偷吃仙药飞向月宫，成为月神的故事。',
        content: '后羿射日立功，西王母赐予不死药，嫦娥偷吃后飞向月宫...',
        type: 'mythology'
      },
      {
        id: 'myth_3',
        title: '女娲补天',
        subtitle: '创世神话中的星空',
        coverImage: 'pics/星象表达.jpg',
        imageUrls: [
          'cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1345335463/Constellations Cards/test.png',
          'cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1345335463/Constellations Cards/test2.png'
        ],
        description: '女娲炼石补天，重新安排了天上的星宿。',
        content: '天塌地陷时，女娲炼五色石补天，重新安排了星宿的位置...',
        type: 'mythology'
      }
    ];
    
    this.setData({
      literatureExpression: defaultLiteratureData,
      astrologyExpression: defaultAstrologyData,
      mythologyExpression: defaultMythologyData
    });
  },

  /**
   * 点击表达卡片
   */
  onExpressionCardTap: function(e) {
    const index = e.currentTarget.dataset.index;
    const type = e.currentTarget.dataset.type;
    
    // 获取对应的数据数组
    let expressionData = [];
    switch(type) {
      case 'literature':
      expressionData = this.data.literatureExpression;
        break;
      case 'astrology':
      expressionData = this.data.astrologyExpression;
        break;
      case 'mythology':
      expressionData = this.data.mythologyExpression;
        break;
    }
    
    if (index >= 0 && index < expressionData.length) {
      const currentCard = expressionData[index];
      const currentPage = index + 1;
      const totalPages = expressionData.length;
      
      // 更新状态并加载详情
      this.setData({
        currentCardPage: currentPage,
        totalCardPages: totalPages,
        currentExpressionType: type
      }, () => {
      this.loadExpressionDetail(currentCard, currentPage, totalPages, type);
      });
    } else {
      wx.showToast({
        title: '数据加载失败',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 加载星象表达详情
   */
  loadExpressionDetail: function(card, currentPage, totalPages, type) {
    // 获取对应的数据数组
    let expressionData = [];
    switch(type) {
      case 'literature':
        expressionData = this.data.literatureExpression;
        break;
      case 'astrology':
        expressionData = this.data.astrologyExpression;
        break;
      case 'mythology':
        expressionData = this.data.mythologyExpression;
        break;
    }

    // 根据页码获取正确的数据
    const currentIndex = currentPage - 1;
    const currentCard = expressionData[currentIndex];

    if (!currentCard) {
      return;
    }

    // 直接使用当前数据进行显示
    const cardDetailData = {
      _id: currentCard._id,
      title: currentCard.title,
      subtitle: currentCard.subtitle || '',
      description: currentCard.description || '',
      coverImage: currentCard.coverImage,
      imageUrls: currentCard.imageUrls || []
        };
      
    // 更新页面数据
      this.setData({
        showCardModal: true,
        currentCardPage: currentPage,
        totalCardPages: totalPages,
        currentCardDetail: cardDetailData,
        currentExpressionType: type
    });
  },

  /**
   * 切换到上一页表达卡片
   */
  prevExpressionPage: function() {
    const currentPage = this.data.currentCardPage;
    const type = this.data.currentExpressionType;
    
    // 获取对应的数据数组
    let expressionData = [];
    switch(type) {
      case 'literature':
        expressionData = this.data.literatureExpression;
        break;
      case 'astrology':
        expressionData = this.data.astrologyExpression;
        break;
      case 'mythology':
        expressionData = this.data.mythologyExpression;
        break;
      }
      
    const totalPages = expressionData.length;
    
    if (currentPage > 1 && currentPage <= totalPages) {
      const newPage = currentPage - 1;
      const newCardIndex = newPage - 1;
      const newCard = expressionData[newCardIndex];
      
      if (newCard) {
        this.loadExpressionDetail(newCard, newPage, totalPages, type);
      } else {
        console.error('未找到上一页数据:', newCardIndex);
      }
    } else {
      wx.showToast({
        title: '已经是第一页',
        icon: 'none',
        duration: 1500
      });
    }
  },

  /**
   * 切换到下一页表达卡片
   */
  nextExpressionPage: function() {
    const currentPage = this.data.currentCardPage;
    const type = this.data.currentExpressionType;
    
    // 获取对应的数据数组
    let expressionData = [];
    switch(type) {
      case 'literature':
        expressionData = this.data.literatureExpression;
        break;
      case 'astrology':
        expressionData = this.data.astrologyExpression;
        break;
      case 'mythology':
        expressionData = this.data.mythologyExpression;
        break;
      }
      
    const totalPages = expressionData.length;
    
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      const newCardIndex = newPage - 1;
      const newCard = expressionData[newCardIndex];
      
      if (newCard) {
        this.loadExpressionDetail(newCard, newPage, totalPages, type);
      } else {
        console.error('未找到下一页数据:', newCardIndex);
      }
    } else {
      wx.showToast({
        title: '已经是最后一页',
        icon: 'none',
        duration: 1500
      });
    }
  },

  /**
   * 预览表达图片
   */
  previewExpressionImage: function(e) {
    const src = e.currentTarget.dataset.src;
    if (!src) return;
    
    // 构建预览图片数组
    let urls = [src];
    
    // 如果有详细图片，加入预览数组
    if (this.data.currentCardDetail && this.data.currentCardDetail.imageUrls) {
      urls = [src, ...this.data.currentCardDetail.imageUrls.filter(url => url !== src)];
    }
    
    wx.previewImage({
      current: src,
      urls: urls
    });
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
            // 这里可以将内容渲染到A4页面中
            // 内容将通过后台API直接填充到页面
          }
        }
    });
    */
  },

  /**
   * 将远程图片转换为base64格式
   */
  convertImageToBase64: function(imageUrl) {
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url: imageUrl,
        success: (res) => {
          if (res.statusCode === 200) {
            const fs = wx.getFileSystemManager();
            fs.readFile({
              filePath: res.tempFilePath,
              encoding: 'base64',
              success: (readRes) => {
                const base64 = 'data:image/jpeg;base64,' + readRes.data;
                resolve(base64);
              },
              fail: reject
            });
          } else {
            reject(new Error(`下载图片失败，状态码: ${res.statusCode}`));
          }
        },
        fail: reject
      });
    });
  },

  /**
   * 关闭卡片模态框
   */
  closeCardModal: function() {
    this.setData({
      showCardModal: false,
      leftCardData: null,
      rightCardData: null,
      currentCardDetail: null,
      currentExpressionType: '',
      currentExpressionCards: []
    });
  },

  /**
   * 阻止模态框内滚动事件传播
   */
  preventModalScroll: function() {
    return false;
  },

  /**
   * 预览表达详情图片
   */
  previewExpressionImage: function(e) {
    const src = e.currentTarget.dataset.src;
    const currentCard = this.data.currentCardDetail;
    
    if (!src || !currentCard) return;
    
    // 获取当前卡片的所有图片URL
    const imageUrls = currentCard.imageUrls || [];
    
    if (imageUrls.length === 0) {
      wx.showToast({
        title: '暂无图片',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 预览图片
    wx.previewImage({
      current: src,
      urls: imageUrls
    });
  },

  /**
   * 预览星空图
   */
  previewStarmap: function(e) {
    const src = e.currentTarget.dataset.src;
    if (src) {
      wx.previewImage({
        current: src,
        urls: [src]
      });
    }
  },

  /**
   * 表达卡片滑动切换事件
   */
  onExpressionSwiperChange: function(e) {
    const currentIndex = e.detail.current;
    const type = this.data.currentExpressionType;
    
    // 获取对应的数据数组
    let expressionData = [];
    switch(type) {
      case 'literature':
        expressionData = this.data.literatureExpression;
        break;
      case 'astrology':
        expressionData = this.data.astrologyExpression;
        break;
      case 'mythology':
        expressionData = this.data.mythologyExpression;
        break;
    }
    
    // 计算实际页码（从1开始）
    const newPage = currentIndex + 1;
    const totalPages = expressionData.length;
    
    console.log('滑动切换:', {
      currentIndex: currentIndex,
      newPage: newPage,
      totalPages: totalPages,
      type: type
    });
    
    if (currentIndex >= 0 && currentIndex < expressionData.length) {
      const currentCard = expressionData[currentIndex];
      
      // 更新页面数据
      this.setData({
        currentCardPage: newPage,
        totalCardPages: totalPages
      }, () => {
        // 在状态更新后加载详情
        this.loadExpressionDetail(currentCard, newPage, totalPages, type);
      });
    } else {
      console.error('无效的滑动索引:', currentIndex);
    }
  },
})

