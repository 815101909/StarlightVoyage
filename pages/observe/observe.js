// pages/observe/observe.js
/**
 * 恒星数据参考来源：
 * 1. 国际天文联合会(IAU)官方数据
 * 2. NASA天文数据中心
 * 3. 《天文学与天体物理》学术期刊
 * 4. 中国古代天文历法文献
 * 
 * 应用共包含7颗守护星星：
 * - 天狼星(Sirius)：大犬座α
 * - 织女星(Vega)：天琴座α
 * - 参宿四(Betelgeuse)：猎户座α
 * - 心宿二(Antares)：天蝎座α
 * - 大角星(Arcturus)：牧夫座α
 * - 毕宿五(Aldebaran)：金牛座α
 * - 北河二(Pollux)：双子座β
 */

Page({
  data: {
    // 初始数据
    loading: false,  // 改为默认不显示loading
    showInfo: false,
    latitude: null,
    longitude: null,
    locationStatus: '',
    currentStarInfo: {
      title: '',
      content: ''
    },
    activeStar: '', // 当前激活的星星
    
    // 北斗七星信息对应关系
    starInfoMap: {
      tianShu: {
        title: '工具',
        content: '观测工具是探索宇宙奥秘的关键。从古代的简易星盘到现代的天文望远镜，人类不断创新观测工具，扩展我们对宇宙的认知边界。'
      },
      tianXuan: {
        title: '现象',
        content: '观测进行时，我们可以捕捉到各种天文现象：行星运动、恒星演化、星系碰撞等壮观景象，这些都是宇宙动态变化的表现。'
      },
      tianJi: {
        title: '占星',
        content: '古人通过观测星象发展出占星术，试图解读天象与人事的关联。虽然现代科学与占星分道扬镳，但星象观测在文化传承中仍有重要地位。'
      },
      tianQuan: {
        title: '机构',
        content: '天文观测管理机构协调全球天文资源，组织大型观测项目，制定国际天文标准，推动天文学和空间科学的发展。'
      },
      yuHeng: {
        title: '历法',
        content: '观测与生活紧密相连。古代历法基于天文观测制定，影响农耕、节日、文化习俗等生活方方面面，至今仍在指导我们的日常生活。'
      },
      kaiYang: {
        title: '人物',
        content: '从古代的张衡、祖冲之到近现代的爱因斯坦、霍金，无数天文学家通过观测探索宇宙奥秘，推动人类文明进步。'
      },
      yaoGuang: {
        title: '文学',
        content: '天文观测启发了丰富的文学创作，从《天问》到《星际穿越》，星空成为文学艺术的永恒灵感源泉，连接科学与人文。'
      }
    },
    
    // 照片观测数据
    userPhotos: [],
    
    // 守护星星测试相关数据
    testSection: "start", // start, question, result
    currentQuestion: 0,
    questions: [
      {
        text: "你更喜欢什么时间段？",
        options: ["清晨", "正午", "黄昏", "深夜"]
      },
      {
        text: "以下颜色你最喜欢哪一个？",
        options: ["蓝色", "红色", "金色", "白色", "紫色", "绿色", "橙色"]
      },
      {
        text: "选择一种你向往的地方：",
        options: ["海边", "山林", "城市", "草原", "沙漠", "极地"]
      },
      {
        text: "你认为自己的性格更接近：",
        options: ["稳重踏实", "热情洋溢", "内敛安静", "活泼开朗", "神秘深邃"]
      },
      {
        text: "当面对挑战时，你会：",
        options: ["勇敢面对", "谨慎权衡", "寻求帮助", "灵活应变", "避开风险"]
      }
    ],
    userAnswers: [],
    guardianStar: null,
    stars: [
      {
        id: "sirius",
        name: "天狼星",
        englishName: "Sirius",
        type: "A1V型主序星",
        distance: "距离地球8.6光年",
        description: "天狼星是夜空中最亮的恒星（视星等-1.46），位于大犬座。它的亮度约为太阳的25倍，与白矮星伴星'天狼B'组成双星系统。并非距离地球最近的恒星（比邻星为4.24光年）。",
        personality: "作为你的守护星星，天狼星赋予你闪耀的光芒和卓越的才能。你天生具有领导能力，充满自信和决断力，能在众人中脱颖而出。同时，你也拥有无穷的能量和热情，勇于追求梦想。",
        className: "star-sirius"
      },
      {
        id: "vega",
        name: "织女星",
        englishName: "Vega",
        type: "A0V型主序星",
        distance: "距离地球25光年",
        description: "织女星是天琴座最亮的恒星，也是北半球夏季夜空中最明亮的星之一（视星等0.03）。在中国传统文化中，它与牛郎星的美丽爱情故事流传至今。因地球岁差运动，约12,000年后将再次成为北极星（上一次是公元前12,000年）。",
        personality: "作为你的守护星星，织女星赋予你艺术天赋和创造力。你善于表达自己的情感，具有敏锐的审美能力。你重视情感联结，珍视亲密关系，同时也保持着独立的个性和坚定的信念。",
        className: "star-vega"
      },
      {
        id: "betelgeuse",
        name: "参宿四",
        englishName: "Betelgeuse",
        type: "M1-2型红超巨星",
        distance: "距离地球约724光年",
        description: "参宿四是猎户座右肩上的明亮红色恒星，半径约为太阳的900-1000倍，是已知最大的恒星之一。它已进入演化末期，可能在百万年内爆发为超新星。近年来亮度变化引起天文学家的广泛关注。",
        personality: "作为你的守护星星，参宿四赋予你宏大的视野和不凡的气质。你具有强烈的存在感，喜欢挑战自我和探索未知。虽然有时情绪波动较大，但你内心深处有着坚定的意志和无限的潜能，能在关键时刻爆发出惊人的能量。",
        className: "star-betelgeuse"
      },
      {
        id: "antares",
        name: "心宿二",
        englishName: "Antares",
        type: "M1.5型红超巨星",
        distance: "距离地球约550-600光年",
        description: "心宿二是天蝎座最亮的恒星（视星等0.6-1.6，因脉动变化），呈现出明显的红色。它的名称源自希腊语'Anti-Ares'（火星的对手），在中国古代天文学中，它是二十八宿心宿的主星，象征着帝王的心脏。",
        personality: "作为你的守护星星，心宿二赋予你热情和坚韧的品质。你情感丰富，直觉敏锐，善于洞察他人内心。你有强烈的保护欲和占有欲，会为所爱的人奋不顾身。虽然有时显得神秘而难以捉摸，但你的忠诚和专注是无可替代的。",
        className: "star-antares"
      },
      {
        id: "arcturus",
        name: "大角星",
        englishName: "Arcturus",
        type: "K0III型橙巨星",
        distance: "距离地球36.7光年",
        description: "大角星是牧夫座中最亮的恒星，也是北半球第四亮的恒星（视星等-0.05）。它的半径约为太阳的25倍，亮度是太阳的170倍。光谱中富含重元素，可能源自早期星系合并事件。",
        personality: "作为你的守护星星，大角星赋予你智慧和稳重的特质。你通常思考深远，做事有条不紊，善于规划和组织。你重视稳定和安全，但也不缺乏对知识的渴求和对生活的热爱。你的建议常常能为他人指明方向，是值得信赖的朋友和顾问。",
        className: "star-arcturus"
      },
      {
        id: "aldebaran",
        name: "毕宿五",
        englishName: "Aldebaran",
        type: "K5III型橙红巨星",
        distance: "距离地球65光年",
        description: "毕宿五是金牛座最亮的恒星（视星等0.85），呈现橙红色。它的半径约为太阳的44倍，位于毕星团前方（实际不属于该星团）。在中国古代天文学中，它是二十八宿毕宿的主星。它的名字在阿拉伯语中意为'跟随者'，因为它似乎在跟随昴星团穿越夜空。",
        personality: "作为你的守护星星，毕宿五赋予你坚毅和耐心的品质。你做事踏实稳重，不喜欢冒险，更倾向于循序渐进地达成目标。你重视传统和家庭，对朋友忠诚可靠。虽然有时显得固执，但你的坚持不懈往往能带来丰厚的回报。",
        className: "star-aldebaran"
      },
      {
        id: "pollux",
        name: "北河二",
        englishName: "Pollux",
        type: "K0III型橙巨星",
        distance: "距离地球33.7光年",
        description: "北河二是双子座最亮的恒星（视星等1.14），半径约为太阳的9倍。它是双子座β星，但实际亮度超过α星北河三。确认拥有系外行星北河二b（质量约为木星2.3倍，轨道周期590天）。在希腊神话中，它与北河三代表着卡斯托尔和波吕克斯双胞胎兄弟。",
        personality: "作为你的守护星星，北河二赋予你多元的天赋和适应力。你思维灵活，善于沟通，能够在不同环境中游刃有余。你重视友谊和合作，常常能在冲突中找到平衡点。你好奇心强，乐于学习新事物，同时也懂得珍惜已有的成就和关系。",
        className: "star-pollux"
      }
    ]
  },

  onLoad() {
    // 开启分享功能
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    
    // 获取用户位置
    this.getUserLocation();
  },
    
  onShow() {
    // 每次显示页面时都清空数据
      this.setData({
      userPhotos: [],
        loading: false
      });
  },

  onHide() {
    this.setData({
      userPhotos: []
    });
  },

  onShareAppMessage() {
    // 检查是否有要分享的照片
    const sharePhoto = getApp().globalData.sharePhoto;
    
    if (sharePhoto && sharePhoto.name && (sharePhoto.tempUrl || sharePhoto.url)) {
      return {
        title: `我的星空观测 - ${sharePhoto.name}`,
        path: '/pages/observe/observe',
        imageUrl: sharePhoto.tempUrl || sharePhoto.url
      };
    }
    
    // 默认分享
    return {
      title: '江月何年初照人？- 星空观测记录',
      path: '/pages/observe/observe'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    // 检查是否有要分享的照片
    const sharePhoto = getApp().globalData.sharePhoto;
    
    if (sharePhoto && sharePhoto.name && (sharePhoto.tempUrl || sharePhoto.url)) {
      return {
        title: `我的星空观测 - ${sharePhoto.name}`,
        query: '',
        imageUrl: sharePhoto.tempUrl || sharePhoto.url
      };
    }
    
    // 默认分享到朋友圈
    return {
      title: '江月何年初照人？- 星空观测记录',
      query: ''
    };
  },

  // 处理星星点击事件
  showStarInfo(e) {
    const starId = e.currentTarget.dataset.star;
    const starInfo = this.data.starInfoMap[starId];
    
    this.setData({
      showInfo: true,
      currentStarInfo: starInfo,
      activeStar: starId,
      userPhotos: [] // 清空照片
    });
    
    // 添加震动反馈
    wx.vibrateShort({
      type: 'medium'
    });
  },
  
  // 隐藏星星信息
  hideStarInfo() {
    this.setData({
      showInfo: false,
      activeStar: ''
    });
  },
  
  // 阻止冒泡，防止点击信息卡片时关闭
  preventBubble() {
    // 只阻止冒泡，不做其他操作
  },

  // 开始测试
  startTest: function() {
    this.setData({
      testSection: "question",
      currentQuestion: 0,
      userAnswers: [],
      userPhotos: [] // 清空照片
    });
  },

  // 选择答案
  selectAnswer: function(e) {
    const index = e.currentTarget.dataset.index;
    let userAnswers = this.data.userAnswers;
    userAnswers.push(index);
    
    this.setData({
      userAnswers
    });
  },
  
  // 下一题
  nextQuestion: function() {
    // 检查是否已选择答案
    if (this.data.userAnswers.length <= this.data.currentQuestion) {
      wx.showToast({
        title: '请先选择一个答案',
        icon: 'none'
      });
      return;
    }
    
    // 判断是否还有下一题
    if (this.data.currentQuestion < this.data.questions.length - 1) {
      this.setData({
        currentQuestion: this.data.currentQuestion + 1
      });
    } else {
      // 测试完成，计算结果
      this.calculateResult(this.data.userAnswers);
      this.setData({
        testSection: "result"
      });
    }
  },

  // 计算测试结果
  calculateResult: function(answers) {
    // 简单算法：根据用户回答选择守护星星
    // 这里使用加权随机算法，每个答案会增加某些星星被选中的权重
    let weights = {
      "sirius": 10,     // 天狼星
      "vega": 10,       // 织女星
      "betelgeuse": 10, // 参宿四
      "antares": 10,    // 心宿二
      "arcturus": 10,   // 大角星
      "aldebaran": 10,  // 毕宿五
      "pollux": 10      // 北河二
    };
    
    // 根据答案调整权重
    // 第一题：喜欢的时间段
    if(answers[0] === 0) { // 清晨
      weights.aldebaran += 15;
      weights.arcturus += 10;
    } else if(answers[0] === 1) { // 正午
      weights.sirius += 15;
      weights.pollux += 10;
    } else if(answers[0] === 2) { // 黄昏
      weights.vega += 15;
      weights.aldebaran += 10;
    } else if(answers[0] === 3) { // 深夜
      weights.antares += 15;
      weights.betelgeuse += 10;
    }
    
    // 第二题：喜欢的颜色
    if(answers[1] === 0) { // 蓝色
      weights.sirius += 15;
      weights.vega += 10;
    } else if(answers[1] === 1) { // 红色
      weights.betelgeuse += 15;
      weights.antares += 10;
    } else if(answers[1] === 2) { // 金色
      weights.arcturus += 15;
      weights.aldebaran += 10;
    } else if(answers[1] === 3) { // 白色
      weights.sirius += 15;
      weights.pollux += 5;
    } else if(answers[1] === 4) { // 紫色
      weights.antares += 10;
      weights.vega += 10;
    } else if(answers[1] === 5) { // 绿色
      weights.arcturus += 10;
      weights.pollux += 10;
    } else if(answers[1] === 6) { // 橙色
      weights.betelgeuse += 10;
      weights.aldebaran += 15;
    }
    
    // 第三题：向往的地方
    if(answers[2] === 0) { // 海边
      weights.vega += 15;
      weights.sirius += 10;
    } else if(answers[2] === 1) { // 山林
      weights.arcturus += 15;
      weights.pollux += 10;
    } else if(answers[2] === 2) { // 城市
      weights.sirius += 10;
      weights.pollux += 15;
    } else if(answers[2] === 3) { // 草原
      weights.aldebaran += 15;
      weights.arcturus += 10;
    } else if(answers[2] === 4) { // 沙漠
      weights.betelgeuse += 15;
      weights.antares += 10;
    } else if(answers[2] === 5) { // 极地
      weights.vega += 10;
      weights.sirius += 10;
    }
    
    // 第四题：性格特点
    if(answers[3] === 0) { // 稳重踏实
      weights.aldebaran += 20;
      weights.arcturus += 15;
    } else if(answers[3] === 1) { // 热情洋溢
      weights.betelgeuse += 20;
      weights.sirius += 15;
    } else if(answers[3] === 2) { // 内敛安静
      weights.vega += 20;
      weights.pollux += 10;
    } else if(answers[3] === 3) { // 活泼开朗
      weights.sirius += 20;
      weights.pollux += 15;
    } else if(answers[3] === 4) { // 神秘深邃
      weights.antares += 20;
      weights.betelgeuse += 10;
    }
    
    // 第五题：面对挑战
    if(answers[4] === 0) { // 勇敢面对
      weights.sirius += 15;
      weights.betelgeuse += 15;
    } else if(answers[4] === 1) { // 谨慎权衡
      weights.arcturus += 15;
      weights.aldebaran += 15;
    } else if(answers[4] === 2) { // 寻求帮助
      weights.vega += 15;
      weights.pollux += 15;
    } else if(answers[4] === 3) { // 灵活应变
      weights.pollux += 15;
      weights.sirius += 10;
    } else if(answers[4] === 4) { // 避开风险
      weights.aldebaran += 10;
      weights.antares += 10;
    }
    
    // 根据权重随机选择守护星星
    let totalWeight = 0;
    for (let star in weights) {
      totalWeight += weights[star];
    }
    
    let random = Math.random() * totalWeight;
    let weightSum = 0;
    
    for (let star in weights) {
      weightSum += weights[star];
      if (random <= weightSum) {
        // 找到对应的星星对象
        const result = this.data.stars.find(s => s.id === star);
        this.setData({
          guardianStar: result
        });
        break;
      }
    }
  },

  // 重新开始测试
  restartTest: function() {
    this.setData({
      testSection: "start",
      currentQuestion: 0,
      userAnswers: [],
      guardianStar: null
    });
  },

  // 分享测试结果
  shareResult: function() {
    // 直接触发分享动作
    wx.showToast({
      title: '点击右上角分享给好友',
      icon: 'none',
      duration: 2000
    });
    
    // 生成分享卡片
    const guardian = this.data.guardianStar;
    if (guardian) {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
    }
  },

  // 分享小程序
  onShareAppMessage: function (res) {
    if (res.from === 'button' && this.data.testSection === 'result') {
      return {
        title: `我的守护星星是${this.data.guardianStar.name}，快来测测你的吧！`,
        path: '/pages/observe/observe',
        imageUrl: '/images/share-guardian-star.jpg' // 需要准备分享图片
      }
    }
    return {
      title: '来看看北斗七星，测测你的守护星星吧！',
      path: '/pages/observe/observe'
    }
  },

  // 导航至深入学习页面
  navigateToDeepLearning(e) {
    const starId = e.currentTarget.dataset.star;
    const starInfo = this.data.starInfoMap[starId];
    
    // 提供星星对应名称映射
    const starNameMap = {
      'tianShu': '天枢',
      'tianXuan': '天璇',
      'tianJi': '天玑',
      'tianQuan': '天权',
      'yuHeng': '玉衡',
      'kaiYang': '开阳',
      'yaoGuang': '瑶光'
    };
    
    // 获取当前星星的名称
    const starName = starNameMap[starId] || '北斗七星';
    
    // 隐藏星星信息卡片
    this.hideStarInfo();
    
    // 显示加载状态
    wx.showLoading({
      title: '加载知识卡片...',
    });
    
    // 导航到详情页面，传递星星ID和名称参数
    wx.navigateTo({
      url: `../detail/detail?section=beidou-star&title=${starName}&starId=${starId}`
    });
    
    // 隐藏加载状态
    wx.hideLoading();
  },

  // 照片观测相关函数
  
  // 加载用户照片
  async loadUserPhotos() {
    try {
      wx.showLoading({
        title: '加载照片...'
      });

      const { result } = await wx.cloud.callFunction({
        name: 'observation',
        data: {
          action: 'getObservations',
          type: 'photo',
          limit: 20,
          skip: 0
        }
      });

      if (result.success) {
        this.setData({
          userPhotos: result.data || []
        });
      } else {
        console.error('加载照片失败:', result.message);
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('加载照片失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },
  
  // 上传图片
  uploadPhoto: function() {
    const that = this;
    
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: function(res) {
        const sourceType = res.tapIndex === 0 ? ['camera'] : ['album'];
        
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed', 'original'],
          sourceType: sourceType,
          success: function(res) {
            const tempFilePath = res.tempFilePaths[0];
            // 先进行A4横向比例裁剪，再命名
            that.cropToA4Landscape(tempFilePath);
          },
          fail: function() {
            wx.showToast({
              title: '取消选择',
              icon: 'none',
              duration: 1000
            });
          }
        });
      }
    });
  },

  // 裁剪照片为横向A4比例 (297:210 = 1.414:1)
  cropToA4Landscape: function(tempFilePath) {
    const that = this;
    
    // 获取图片信息
    wx.getImageInfo({
      src: tempFilePath,
      success: function(imgInfo) {
        const originalWidth = imgInfo.width;
        const originalHeight = imgInfo.height;
        const targetRatio = 297 / 210; // A4横向比例约1.414
        
        let cropWidth, cropHeight;
        
        // 计算裁剪尺寸，保持A4横向比例
        if (originalWidth / originalHeight > targetRatio) {
          // 原图太宽，以高度为准
          cropHeight = originalHeight;
          cropWidth = Math.round(originalHeight * targetRatio);
        } else {
          // 原图太高，以宽度为准
          cropWidth = originalWidth;
          cropHeight = Math.round(originalWidth / targetRatio);
        }
        
        // 计算居中裁剪的起始位置
        const cropX = Math.round((originalWidth - cropWidth) / 2);
        const cropY = Math.round((originalHeight - cropHeight) / 2);
        
        // 使用canvas裁剪图片
        const canvas = wx.createCanvasContext('crop-canvas');
        
        // 由于小程序限制，我们使用简化的处理方式
        // 直接使用原图，在显示时通过CSS控制比例
        that.showPhotoNamingDialog(tempFilePath);
      },
      fail: function(error) {
        console.error('获取图片信息失败:', error);
        // 如果获取失败，直接使用原图
        that.showPhotoNamingDialog(tempFilePath);
      }
    });
  },

  // 显示照片命名对话框
  showPhotoNamingDialog(tempFilePath) {
    const that = this;
    const now = new Date();
    const defaultName = `星空观测 ${now.getMonth() + 1}-${now.getDate()}`;
    
    wx.showModal({
      title: '为照片命名',
      content: '请为这张观测照片起个名字',
      editable: true,
      placeholderText: defaultName,
      success(res) {
        if (res.confirm) {
          const photoName = res.content || defaultName;
          // 添加到照片列表
          const newPhoto = {
            id: Date.now().toString(),
            tempUrl: tempFilePath,
            url: tempFilePath,
            name: photoName,
            date: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
            time: `${now.getHours()}:${now.getMinutes()}`
          };
          
          that.setData({
            userPhotos: [newPhoto, ...that.data.userPhotos]
          });
        }
      }
    });
  },

  // 保存照片到云端
  async savePhotoToLocal(tempFilePath, photoName, options = {}) {
    const that = this;
    
    wx.showLoading({
      title: '保存中...',
    });

    try {
      // 上传图片到云存储
      const uploadResult = await wx.cloud.uploadFile({
        cloudPath: `observations/${Date.now()}_${photoName}.jpg`,
        filePath: tempFilePath
      });

      if (!uploadResult.fileID) {
        throw new Error('上传失败');
      }

      // 创建观测记录
      const { result } = await wx.cloud.callFunction({
        name: 'observation',
        data: {
          action: 'createObservation',
          observationData: {
            type: 'photo',
          name: photoName,
            fileID: uploadResult.fileID,
          date: that.formatDate(new Date()),
          time: that.formatTime(new Date()),
            cropInfo: options.cropInfo || null,
            isA4Landscape: true
          }
        }
      });

      if (!result.success) {
        throw new Error(result.message || '保存失败');
      }

      // 保存成功后，只添加新上传的照片到列表
      const newPhoto = {
        ...result.data,
        fileID: uploadResult.fileID,
        name: photoName
      };
      
      const updatedPhotos = [...this.data.userPhotos];
      updatedPhotos.unshift(newPhoto);  // 将新照片添加到列表开头
      
      this.setData({
        userPhotos: updatedPhotos
        });

        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });

      // 添加到个人记录
      await this.addToPersonalRecord(newPhoto);

    } catch (error) {
      console.error('保存照片失败:', error);
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
    } finally {
      wx.hideLoading();
      }
  },

  // 预览照片
  previewPhoto: function(e) {
    const photo = e.currentTarget.dataset.photo;
    const urls = this.data.userPhotos.map(p => p.tempUrl || p.url);
    const current = photo.tempUrl || photo.url;
    
    wx.previewImage({
      current: current,
      urls: urls,
      showmenu: true,
      success: () => {
        // 预览成功
      },
      fail: (error) => {
        console.error('预览失败:', error);
        wx.showToast({
          title: '预览失败',
          icon: 'none'
        });
      }
    });
  },

  // 长按照片显示操作菜单
  onPhotoLongPress: function(e) {
    const photo = e.currentTarget.dataset.photo;
    const that = this;
    
    wx.showActionSheet({
      itemList: ['重命名', '删除照片', '添加到记录', '分享'],
      success: function(res) {
        switch(res.tapIndex) {
          case 0:
            that.renamePhoto(photo);
            break;
          case 1:
            that.deletePhoto(photo);
            break;
          case 2:
            that.addToPersonalRecord(photo);
            break;
          case 3:
            that.sharePhoto(photo);
            break;
        }
      }
    });
  },

  // 重命名照片
  renamePhoto: function(photo) {
    const that = this;
    
    wx.showModal({
      title: '重命名照片',
      content: '请输入新的照片名称',
      editable: true,
      placeholderText: photo.name,
      success: function(res) {
        if (res.confirm && res.content) {
          // 更新照片名称
          let userPhotos = [...that.data.userPhotos];
          const photoIndex = userPhotos.findIndex(p => p.id === photo.id);
          
          if (photoIndex !== -1) {
            userPhotos[photoIndex].name = res.content;
            
            // 保存更新
            wx.setStorageSync('userObservationPhotos', JSON.stringify(userPhotos));
            
            that.setData({
              userPhotos: userPhotos
            });
            
            wx.showToast({
              title: '重命名成功',
              icon: 'success'
            });
          }
        }
      }
    });
  },

  // 删除照片
  deletePhoto: function(photo) {
    const that = this;
    
    wx.showModal({
      title: '删除照片',
      content: `确定要删除"${photo.name}"吗？此操作不可恢复。`,
      confirmText: '删除',
      confirmColor: '#ff4444',
      success: function(res) {
        if (res.confirm) {
          // 从数组中移除
          let userPhotos = that.data.userPhotos.filter(p => p.id !== photo.id);
          
          // 保存更新
          wx.setStorageSync('userObservationPhotos', JSON.stringify(userPhotos));
          
          that.setData({
            userPhotos: userPhotos
          });
          
          // 尝试删除本地文件
          if (photo.url && photo.url.includes(wx.env.USER_DATA_PATH)) {
            wx.getFileSystemManager().unlink({
              filePath: photo.url,
              success: () => console.log('本地文件删除成功'),
              fail: (error) => console.log('本地文件删除失败:', error)
            });
          }
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 分享照片
  sharePhoto: function(photo) {
    const that = this;
    // 保存要分享的照片信息到全局数据
    getApp().globalData.sharePhoto = photo;
    
    wx.showActionSheet({
      itemList: ['分享给好友', '分享到朋友圈', '保存到相册'],
      success: function(res) {
        if (res.tapIndex === 0) {
          // 分享给好友
          that.shareToFriend(photo);
        } else if (res.tapIndex === 1) {
          // 分享到朋友圈
          that.shareToTimeline(photo);
        } else if (res.tapIndex === 2) {
          // 保存到相册
          that.saveToAlbum(photo);
        }
      }
    });
  },

  // 保存照片到相册
  saveToAlbum: function(photo) {
    const that = this;
    
    // 先获取保存到相册的权限
    wx.getSetting({
      success: function(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          // 如果没有权限，先申请权限
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: function() {
              that.doSaveToAlbum(photo);
            },
            fail: function() {
              // 用户拒绝授权，引导用户设置
              wx.showModal({
                title: '需要相册权限',
                content: '保存照片需要您授权访问相册',
                confirmText: '去设置',
                success: function(modalRes) {
                  if (modalRes.confirm) {
                    wx.openSetting();
                  }
                }
              });
            }
          });
        } else {
          // 已有权限，直接保存
          that.doSaveToAlbum(photo);
        }
      }
    });
  },

  // 执行保存到相册
  doSaveToAlbum: function(photo) {
    wx.showLoading({
      title: '保存中...'
    });
    
    wx.saveImageToPhotosAlbum({
      filePath: photo.tempUrl || photo.url,
      success: function() {
        wx.hideLoading();
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      },
      fail: function(error) {
        wx.hideLoading();
        console.error('保存到相册失败:', error);
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    });
  },

  // 分享给好友  
  shareToFriend: function(photo) {
    if (photo) {
      getApp().globalData.sharePhoto = photo;
    }
    
    // 确保分享菜单可用，然后引导用户
    wx.showShareMenu({
      withShareTicket: true,
      success: function() {
        // 显示模态框，更明确地指引用户
        wx.showModal({
          title: '分享给好友',
          content: '照片已准备好！\n请点击右上角的"●●●"按钮\n然后选择"转发"即可分享',
          showCancel: false,
          confirmText: '我知道了'
        });
      }
    });
  },

  // 分享到朋友圈
  shareToTimeline: function(photo) {
    if (photo) {
      getApp().globalData.sharePhoto = photo;
    }
    
    // 确保分享菜单可用，然后引导用户
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
      success: function() {
        // 显示模态框，更明确地指引用户
        wx.showModal({
          title: '分享到朋友圈',
          content: '照片已准备好！\n请点击右上角的"●●●"按钮\n然后选择"分享到朋友圈"',
          showCancel: false,
          confirmText: '我知道了'
        });
      }
    });
  },

  // 上传图片到云存储
  async uploadPhotoToCloud(tempFilePath) {
    try {
      const cloudPath = `observations/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const uploadResult = await wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: tempFilePath
      });
      console.log('图片上传成功:', uploadResult);
      return uploadResult.fileID;
    } catch (error) {
      console.error('图片上传失败:', error);
      wx.showToast({
        title: '图片上传失败',
        icon: 'none'
      });
      throw error;
    }
  },

  // 获取地理位置
  async getLocation() {
    try {
      return new Promise((resolve, reject) => {
        wx.getLocation({
          type: 'gcj02',
          success(res) {
            if (res && typeof res.latitude !== 'undefined' && typeof res.longitude !== 'undefined') {
              resolve({
                latitude: res.latitude,
                longitude: res.longitude
              });
            } else {
              resolve(null);
            }
          },
          fail(error) {
            console.error('获取位置失败:', error);
            resolve(null);  // 失败时返回null而不是reject
          }
        });
      });
    } catch (error) {
      console.error('获取位置异常:', error);
      return null;
    }
  },

  // 添加到个人记录
  async addToPersonalRecord(photo) {
    try {
      // 先上传图片到云存储
      const fileID = await this.uploadPhotoToCloud(photo.tempUrl);
      
      // 获取位置信息
      let location = null;
      try {
        location = await this.getLocation();
      } catch (error) {
        console.error('获取位置出错:', error);
      }
    
      // 准备观测记录数据
      const observationData = {
        name: photo.name,
        image: fileID,
        type: 'photo',
        createTime: new Date(),
        updateTime: new Date()
      };

      // 如果成功获取到位置信息，添加到记录中
      if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
        observationData.location = {
          latitude: location.latitude,
          longitude: location.longitude
        };
      }

      // 调用云函数创建观测记录
      const result = await wx.cloud.callFunction({
        name: 'observation',
        data: {
          action: 'createObservation',
          observationData: observationData
        }
      });

      if (result.result.success) {
    wx.showToast({
          title: '添加成功',
      icon: 'success'
    });
        
        // 清空临时照片
        this.setData({
          userPhotos: []
        });
      } else {
        throw new Error(result.result.message || '添加失败');
      }
    } catch (error) {
      console.error('添加到记录失败:', error);
      wx.showToast({
        title: '添加失败',
        icon: 'none'
      });
    }
  },

  // 时间格式化
  formatTime: function(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 记录观测内容到个人记录
  shareToCommunity: function() {
    // 检查登录状态
    const app = getApp();
    if (!app.isUserLoggedIn()) {
      wx.showModal({
        title: '需要登录',
        content: '记录功能需要先登录账号',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }
    
    // 检查是否有照片
    if (!this.data.userPhotos || this.data.userPhotos.length === 0) {
      wx.showModal({
        title: '需要拍照',
        content: '请先拍摄或上传一张星空照片再记录',
        confirmText: '去拍照',
        success: (res) => {
          if (res.confirm) {
            this.uploadPhoto();
          }
        }
      });
      return;
    }
    
    // 显示分享选项
    const that = this;
    const latestPhoto = this.data.userPhotos[0]; // 获取最新照片
    
    wx.showActionSheet({
      itemList: [
        '分享给好友',
        '分享到朋友圈'
      ],
      success: function(res) {
        switch(res.tapIndex) {
          case 0:
            that.shareToFriend(latestPhoto);
            break;
          case 1:
            that.shareToTimeline(latestPhoto);
            break;
        }
      }
    });
  },

  // 分享给好友
  shareToFriend: function() {
    // 设置分享信息
    if (this.data.userPhotos.length > 0) {
      getApp().globalData.sharePhoto = this.data.userPhotos[0];
      wx.showModal({
        title: '分享给好友',
        content: '请点击右上角的"..."按钮，选择"转发"分享给好友。\n\n已为您准备好最新的观测照片！',
        showCancel: false,
        confirmText: '知道了'
      });
    } else {
      // 没有照片时清除分享照片信息
      getApp().globalData.sharePhoto = null;
      wx.showModal({
        title: '分享给好友',
        content: '请点击右上角的"..."按钮，选择"转发"分享给好友。\n\n分享这个精彩的观测页面吧！',
        showCancel: false,
        confirmText: '知道了'
      });
    }
  },

  // 分享到朋友圈
  shareToTimeline: function() {
    // 设置分享信息
    if (this.data.userPhotos.length > 0) {
      getApp().globalData.sharePhoto = this.data.userPhotos[0];
      wx.showModal({
        title: '分享到朋友圈',
        content: '请点击右上角的"..."按钮，选择"分享到朋友圈"。\n\n已为您准备好最新的观测照片！',
        showCancel: false,
        confirmText: '知道了'
      });
    } else {
      // 没有照片时清除分享照片信息
      getApp().globalData.sharePhoto = null;
      wx.showModal({
        title: '分享到朋友圈',
        content: '请点击右上角的"..."按钮，选择"分享到朋友圈"。\n\n分享这个精彩的观测页面吧！',
        showCancel: false,
        confirmText: '知道了'
      });
    }
  },

  // 分享到微信（保留兼容）
  shareToWechat: function() {
    if (this.data.userPhotos.length === 0) {
      wx.showToast({
        title: '请先拍摄照片',
        icon: 'none'
      });
      return;
    }

    // 设置分享信息
    getApp().globalData.sharePhoto = this.data.userPhotos[0];
    
    wx.showActionSheet({
      itemList: ['分享给好友', '分享到朋友圈'],
      success: function(res) {
        if (res.tapIndex === 0) {
          // 分享给好友
          wx.showModal({
            title: '分享给好友',
            content: '请点击右上角的"..."按钮，选择"转发"分享给好友。\n\n已为您准备好最新的观测照片！',
            showCancel: false,
            confirmText: '知道了'
          });
        } else if (res.tapIndex === 1) {
          // 分享到朋友圈
          wx.showModal({
            title: '分享到朋友圈',
            content: '请点击右上角的"..."按钮，选择"分享到朋友圈"。\n\n已为您准备好最新的观测照片！',
            showCancel: false,
            confirmText: '知道了'
          });
        }
      }
    });
  },

  // 日期格式化
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  
  // 导航到社区页面
  navigateToCommunity() {
    wx.showToast({
      title: '社区功能开发中',
      icon: 'none'
    });
    
    // 实际应用中可以导航到社区页面
    // wx.navigateTo({
    //   url: '../community/community'
    // });
  },

  // 获取用户位置信息
  getUserLocation: function() {
    const self = this;
    wx.getLocation({
      type: 'wgs84',  // 返回 GPS 坐标
      success(res) {
        const latitude = res.latitude;   // 获取纬度
        const longitude = res.longitude; // 获取经度
        
        self.setData({
          latitude: latitude,
          longitude: longitude,
          locationStatus: '定位成功！'
        });
      },
      fail(error) {
        console.error('获取位置失败：', error);
        self.setData({
          locationStatus: '定位失败！请检查定位权限设置。'
        });
      }
    });
  }
}) 