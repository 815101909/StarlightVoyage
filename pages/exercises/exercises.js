Page({
  /**
   * 页面的初始数据
   */
  data: {
    articleId: '',
    exercises: [],
    userAnswers: {},
    score: 0,
    showResult: false,
    encouragement: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.id) {
    this.setData({
        articleId: options.id,
        userAnswers: {}
    });
    this.fetchExercises();
    }
  },

  /**
   * 获取习题数据
   */
  fetchExercises: async function() {
    wx.showLoading({
      title: '加载习题...',
    });

    try {
      const db = wx.cloud.database();
      const _ = db.command;
      
      // 获取习题列表，按更新时间升序排序（早的在前）
      const { data: exercises } = await db.collection('questions')
        .where({
          id: this.data.articleId
        })
        .orderBy('updatedAt', 'asc')
        .get();

      if (exercises && exercises.length > 0) {
        // 处理习题数据
        const formattedExercises = exercises.map(exercise => {
          // 确保answer是数组形式，并且是数字类型
          const answerArray = Array.isArray(exercise.answer) 
            ? exercise.answer.map(ans => Number(ans)) 
            : [Number(exercise.answer)];
          
          return {
          id: exercise._id,
          question: exercise.question,
          options: exercise.options,
            correctAnswer: answerArray,  // 统一使用数字数组形式存储答案
          explanation: exercise.explanation,
            point: exercise.point || 25,
            type: answerArray.length >= 2 ? 'multiple' : 'single',  // 根据答案数量判断类型
            updatedAt: exercise.updatedAt || 0
          };
        });

        // 确保按更新时间排序，没有更新时间的排在最后
        formattedExercises.sort((a, b) => {
          if (!a.updatedAt && !b.updatedAt) return 0;
          if (!a.updatedAt) return 1;
          if (!b.updatedAt) return -1;
          return a.updatedAt - b.updatedAt;
        });

        console.log('格式化后的习题数据:', formattedExercises);

        this.setData({
          exercises: formattedExercises,
          userAnswers: {},  // 重置用户答案
          showResult: false,  // 重置显示结果状态
          score: 0  // 重置分数
        });
      }
    } catch (error) {
      console.error('获取习题失败:', error);
      wx.showToast({
        title: '获取习题失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },
  
  /**
   * 选择答案
   */
  selectOption: function(e) {
    if (this.data.showResult) return;  // 如果已显示结果，不允许再选择
    
    const questionId = e.currentTarget.dataset.questionId;
    const optionIndex = parseInt(e.currentTarget.dataset.optionIndex);  // 确保是数字
    const type = e.currentTarget.dataset.type;  // 获取题目类型
    
    // 更新用户答案
    const userAnswers = {...this.data.userAnswers};
    
    if (type === 'multiple') {
      // 多选题处理
      if (!userAnswers[questionId]) {
        // 初始化一个与选项数量相同的布尔数组，全部为false
        const exercise = this.data.exercises.find(ex => ex.id === questionId);
        if (!exercise) return;
        userAnswers[questionId] = new Array(exercise.options.length).fill(false);
      }
      
      // 切换选中状态
      userAnswers[questionId][optionIndex] = !userAnswers[questionId][optionIndex];
      
      // 如果所有选项都未选中，删除这个答案
      if (userAnswers[questionId].every(selected => !selected)) {
        delete userAnswers[questionId];
      }
    } else {
      // 单选题处理 - 直接设置选项，不需要数组
      if (userAnswers[questionId] === optionIndex) {
        delete userAnswers[questionId];  // 取消选中
      } else {
        userAnswers[questionId] = optionIndex;  // 选中新选项
      }
    }
    
    console.log('选择的题目ID:', questionId);
    console.log('选择的选项索引:', optionIndex);
    console.log('题目类型:', type);
    console.log('更新后的答案:', userAnswers);
    
    this.setData({
      userAnswers: userAnswers
    });
  },

  /**
   * 提交答案
   */
  submitAnswers: function() {
    if (Object.keys(this.data.userAnswers).length === 0) {
      wx.showToast({
        title: '请至少回答一题',
        icon: 'none'
      });
      return;
    }
    
      this.calculateScore();
  },
  
  /**
   * 计算分数
   */
  calculateScore: function() {
    const { exercises, userAnswers } = this.data;
    let totalScore = 0;
    let correctCount = 0;
    
    // 计算总分值
    const totalPossibleScore = exercises.reduce((sum, exercise) => sum + (exercise.point || 25), 0);
    
    // 计算得分
    exercises.forEach(exercise => {
      if (exercise.type === 'multiple') {
        const userAnswer = userAnswers[exercise.id];
        if (!userAnswer) return;
        
        // 将布尔数组转换为选中项的索引数组
        const selectedIndexes = userAnswer.reduce((acc, selected, index) => {
          if (selected) acc.push(index);
          return acc;
        }, []);
        
        // 检查答案是否匹配（不考虑顺序）
        const isCorrect = selectedIndexes.length === exercise.correctAnswer.length &&
          selectedIndexes.every(index => exercise.correctAnswer.some(ans => ans === index)) &&
          exercise.correctAnswer.every(ans => selectedIndexes.some(index => index === ans));
        
        if (isCorrect) {
          correctCount++;
          totalScore += (exercise.point || 50); // 多选题50分
        }
      } else {
        // 单选题判断
        if (userAnswers[exercise.id] === exercise.correctAnswer[0]) {
        correctCount++;
          totalScore += (exercise.point || 50); // 单选题50分
        }
      }
    });
    
    // 根据得分设置鼓励语
    let encouragement = '';
    const percentage = (totalScore / totalPossibleScore) * 100;
    
    if (percentage === 100) {
      encouragement = '太棒了！你完全理解了文章内容，继续保持这种学习热情！';
    } else if (percentage >= 75) {
      encouragement = '做得很好！只有一点小失误，再接再厉！';
    } else if (percentage >= 50) {
      encouragement = '不错的尝试！回顾一下文章，你会发现更多细节。';
    } else if (percentage >= 25) {
      encouragement = '继续努力！建议你重新阅读文章，加深理解。';
    } else {
      encouragement = '不要灰心！这只是一次学习机会，重读文章会有新发现。';
    }
    
    console.log('计算分数：', {
      userAnswers,
      exercises,
      totalScore,
      correctCount,
      totalPossibleScore
    });
    
    this.setData({
      score: totalScore,
      showResult: true,
      encouragement: encouragement
    });
  },
  
  /**
   * 重新作答
   */
  retryExercises: function() {
    this.setData({
      userAnswers: {},  // 清空用户答案
      showResult: false,  // 隐藏结果
      score: 0,  // 重置分数
      encouragement: ''  // 清空鼓励语
    });
  }
}); 