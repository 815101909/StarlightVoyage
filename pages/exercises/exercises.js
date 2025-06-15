Page({
  /**
   * 页面的初始数据
   */
  data: {
    articleId: '',
    articleTitle: '',
    exercises: [],
    userAnswers: {},
    isSubmitting: false,
    showResult: false,
    score: 0,
    correctAnswers: {},
    encouragement: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { id, title } = options;
    
    this.setData({
      articleId: id,
      articleTitle: title || '文章'
    });
    
    // 获取习题数据
    this.fetchExercises();
  },

  /**
   * 获取习题数据（API预留）
   */
  fetchExercises: function() {
    // API预留
    // wx.request({
    //   url: `https://your-api-domain.com/api/exercises/${this.data.articleId}`,
    //   success: (res) => {
    //     if (res.statusCode === 200 && res.data.success) {
    //       this.setData({
    //         exercises: res.data.exercises
    //       });
    //     }
    //   }
    // });
    
    // 开发阶段使用模拟数据
    this.setMockData();
  },
  
  /**
   * 设置模拟练习题数据（开发阶段）
   */
  setMockData: function() {
    const mockExercises = [
      {
        id: 'q1',
        question: '文章中提到的天文望远镜是哪一个？',
        options: [
          '哈勃太空望远镜',
          '詹姆斯·韦伯太空望远镜',
          '钱德拉X射线望远镜',
          '斯皮策红外望远镜'
        ],
        correctAnswer: 1, // B
        explanation: '文章中提到詹姆斯·韦伯太空望远镜捕捉到的深空壮丽景象。'
      },
      {
        id: 'q2',
        question: '根据文章内容，人类探索宇宙的下一个重要目标是什么？',
        options: [
          '探索黑洞',
          '寻找系外行星',
          '重返月球',
          '建立太空站'
        ],
        correctAnswer: 2, // C
        explanation: '文章提到"随着太空探索技术的不断突破，人类正在计划更远的旅程，比如重返月球、载人登陆火星..."'
      },
      {
        id: 'q3',
        question: '文章中引用的诗歌《天真的预言》的作者是谁？',
        options: [
          '济慈',
          '莎士比亚',
          '雪莱',
          '威廉·布莱克'
        ],
        correctAnswer: 3, // D
        explanation: '文章底部引用了威廉·布莱克的《天真的预言》，由梁宗岱翻译。'
      },
      {
        id: 'q4',
        question: '文章表达了人类对宇宙的哪种态度？',
        options: [
          '恐惧与敬畏',
          '好奇与探索',
          '征服与利用',
          '漠不关心'
        ],
        correctAnswer: 1, // B
        explanation: '文章整体表达了人类对宇宙的好奇心和探索精神，特别提到"人类对宇宙的探索也从单纯的观测逐步迈向了深空探索的新时代"。'
      }
    ];
    
    // 为每道题准备正确答案
    const correctAnswers = {};
    mockExercises.forEach(exercise => {
      correctAnswers[exercise.id] = exercise.correctAnswer;
    });
    
    this.setData({
      exercises: mockExercises,
      correctAnswers: correctAnswers
    });
  },

  /**
   * 选择答案
   */
  selectOption: function(e) {
    // 如果已经显示结果，不允许再选择
    if (this.data.showResult) return;
    
    const questionId = e.currentTarget.dataset.questionId;
    const optionIndex = e.currentTarget.dataset.optionIndex;
    
    // 更新用户答案
    const userAnswers = {...this.data.userAnswers};
    userAnswers[questionId] = optionIndex;
    
    this.setData({
      userAnswers: userAnswers
    });
  },

  /**
   * 提交答案（API预留）
   */
  submitAnswers: function() {
    if (this.data.isSubmitting || this.data.showResult) return;
    
    // 检查是否已回答所有问题
    const answeredCount = Object.keys(this.data.userAnswers).length;
    if (answeredCount < this.data.exercises.length) {
      wx.showToast({
        title: `请回答所有题目 (${answeredCount}/${this.data.exercises.length})`,
        icon: 'none'
      });
      return;
    }
    
    this.setData({ isSubmitting: true });
    
    // API预留
    // wx.request({
    //   url: 'https://your-api-domain.com/api/exercises/submit',
    //   method: 'POST',
    //   data: {
    //     articleId: this.data.articleId,
    //     answers: this.data.userAnswers
    //   },
    //   success: (res) => {
    //     if (res.statusCode === 200 && res.data.success) {
    //       // 处理结果
    //       this.processResults(res.data.score);
    //     } else {
    //       wx.showToast({
    //         title: res.data.message || '提交失败',
    //         icon: 'none'
    //       });
    //     }
    //   },
    //   fail: () => {
    //     wx.showToast({
    //       title: '网络错误，请重试',
    //       icon: 'none'
    //     });
    //   },
    //   complete: () => {
    //     this.setData({ isSubmitting: false });
    //   }
    // });
    
    // 开发阶段模拟评分
    setTimeout(() => {
      this.calculateScore();
      this.setData({ isSubmitting: false });
    }, 1000);
  },
  
  /**
   * 计算分数
   */
  calculateScore: function() {
    const { exercises, userAnswers, correctAnswers } = this.data;
    let correctCount = 0;
    
    // 计算正确题目数量
    exercises.forEach(exercise => {
      if (userAnswers[exercise.id] === exercise.correctAnswer) {
        correctCount++;
      }
    });
    
    // 每题25分
    const score = correctCount * 25;
    
    // 根据得分设置鼓励语
    let encouragement = '';
    if (score === 100) {
      encouragement = '太棒了！你完全理解了文章内容，继续保持这种学习热情！';
    } else if (score >= 75) {
      encouragement = '做得很好！只有一点小失误，再接再厉！';
    } else if (score >= 50) {
      encouragement = '不错的尝试！回顾一下文章，你会发现更多细节。';
    } else if (score >= 25) {
      encouragement = '继续努力！建议你重新阅读文章，加深理解。';
    } else {
      encouragement = '不要灰心！这只是一次学习机会，重读文章会有新发现。';
    }
    
    this.setData({
      score: score,
      showResult: true,
      encouragement: encouragement
    });
  },
  
  /**
   * 重新作答
   */
  retryExercises: function() {
    this.setData({
      userAnswers: {},
      showResult: false,
      score: 0,
      encouragement: ''
    });
  }
}); 