Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLoading: false,
    userInfo: {
      nickName: "",
      avatarUrl: "",
      age: "",
      learningGoal: "",
      selectedGoal: "", // 选中的学习目标ID
      gender: 0, // 0-保密，1-男，2-女
      userId: ""
    },
    tags: [
      { id: 1, name: "天文摄影", selected: false },
      { id: 2, name: "星座观测", selected: false },
      { id: 3, name: "行星探索", selected: false },
      { id: 4, name: "深空天体", selected: false },
      { id: 5, name: "天文学习", selected: false },
      { id: 6, name: "流星雨", selected: false },
      { id: 7, name: "卫星观测", selected: false },
      { id: 8, name: "望远镜使用", selected: false },
      { id: 9, name: "星空打卡", selected: false },
      { id: 10, name: "天文科普", selected: false },
      { id: 11, name: "观星地点", selected: false },
      { id: 12, name: "天文历法", selected: false }
    ],
    learningGoalLength: 0,
    selectedTagCount: 0,
    // 学习目标列表
    learningGoals: [
      { id: "goal1", content: "了解基础天文知识，认识主要星座和行星" },
      { id: "goal2", content: "学习天文科普知识，掌握天文学基础理论" },
      { id: "goal3", content: "通过天文专题，探索宇宙奥秘与天体形成" },
      { id: "goal4", content: "深入研究深空天体，观测星云和星系" },
      { id: "goal5", content: "参与星空打卡活动，记录观星体验" }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 标记第一次加载
    this.isFirstLoad = true;
    this.loadUserProfile();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 页面每次显示时确保表单是活跃状态
    console.log('页面显示');
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // 页面渲染完成后确保表单控件已经初始化
    console.log('页面初次渲染完成');
  },

  /**
   * 加载用户资料
   */
  loadUserProfile: function() {
    this.setData({ isLoading: true });
    
    // 开发阶段使用模拟数据
    setTimeout(() => {
      // 只有第一次加载时才设置默认数据
      if (this.isFirstLoad) {
        // 模拟用户数据
        const mockUserInfo = {
          nickName: "晓视界用户",
          avatarUrl: "",  // 空字符串，将使用默认头像
          age: "23",
          learningGoal: "了解基础天文知识，认识主要星座和行星",
          selectedGoal: "goal1", // 默认选中的学习目标ID
          gender: 1,
          userId: "10086",
          tags: [2, 4] // 对应标签的id
        };
        
        // 模拟标签选择
        let tags = this.data.tags.map(tag => {
          // 深拷贝标签对象
          const newTag = {...tag};
          // 设置选中状态
          if (mockUserInfo.tags.includes(newTag.id)) {
            newTag.selected = true;
          }
          return newTag;
        });
        
        // 一次性更新所有数据
        this.setData({
          userInfo: mockUserInfo,
          tags: tags,
          learningGoalLength: mockUserInfo.learningGoal.length,
          selectedTagCount: mockUserInfo.tags.length
        });
        
        console.log('初始化后的用户数据:', this.data.userInfo);
        
        // 将标志设置为false，表示已经加载过一次
        this.isFirstLoad = false;
      } else {
        console.log('非首次加载，保留当前表单数据');
      }
      
      this.setData({ isLoading: false });
    }, 500);
  },

  /**
   * 通用输入变化处理函数
   */
  onInputChange: function(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    console.log(`更新${field}:`, value);
    
    // 创建一个临时对象来保存更新的数据
    let updatedData = {};
    
    if (field === 'learningGoal') {
      updatedData[`userInfo.${field}`] = value;
      updatedData.learningGoalLength = value.length;
    } else {
      updatedData[`userInfo.${field}`] = value;
    }
    
    // 一次性更新状态
    this.setData(updatedData);
    
    // 在控制台打印更新后的值，方便调试
    console.log(`更新后的${field}:`, this.data.userInfo[field]);
  },

  /**
   * 性别选择变化
   */
  onGenderChange: function(e) {
    this.setData({
      'userInfo.gender': parseInt(e.detail.value)
    });
  },

  /**
   * 切换标签选中状态
   */
  toggleTag: function(e) {
    const tagId = e.currentTarget.dataset.id;
    const tagIndex = this.data.tags.findIndex(item => item.id === tagId);
    
    if (tagIndex === -1) return;
    
    let tags = this.data.tags;
    let selectedCount = this.data.selectedTagCount;
    
    // 如果当前标签是选中状态，则取消选中
    if (tags[tagIndex].selected) {
      tags[tagIndex].selected = false;
      selectedCount--;
    } else {
      // 如果已经选择了3个标签，且当前要再选一个，则提示不能再选
      if (selectedCount >= 3) {
        wx.showToast({
          title: '最多只能选择3个标签',
          icon: 'none'
        });
        return;
      }
      
      // 选中当前标签
      tags[tagIndex].selected = true;
      selectedCount++;
    }
    
    this.setData({
      tags: tags,
      selectedTagCount: selectedCount
    });
  },

  /**
   * 选择头像
   */
  chooseAvatar: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        
        // 显示预览
        this.setData({
          'userInfo.avatarUrl': tempFilePath
        });
        
        // 实际开发中可能需要上传图片到服务器
        // this.uploadAvatar(tempFilePath);
      }
    });
  },

  /**
   * 上传头像到服务器（API预留）
   */
  uploadAvatar: function(filePath) {
    wx.showLoading({
      title: '上传中...',
    });
    
    // API预留接口
    // wx.uploadFile({
    //   url: 'https://your-api-domain.com/api/user/avatar',
    //   filePath: filePath,
    //   name: 'avatar',
    //   header: {
    //     'Authorization': `Bearer ${wx.getStorageSync('token')}`
    //   },
    //   success: (res) => {
    //     const data = JSON.parse(res.data);
    //     if (data.success) {
    //       this.setData({
    //         'userInfo.avatarUrl': data.data.url
    //       });
    //     } else {
    //       wx.showToast({
    //         title: '上传失败',
    //         icon: 'none'
    //       });
    //     }
    //   },
    //   fail: () => {
    //     wx.showToast({
    //       title: '上传失败',
    //       icon: 'none'
    //     });
    //   },
    //   complete: () => {
    //     wx.hideLoading();
    //   }
    // });
  },

  /**
   * 保存个人资料
   */
  saveProfile: function() {
    // 确保使用最新的数据进行保存
    const userInfo = this.data.userInfo;
    
    console.log('保存时的用户数据:', userInfo);
    console.log('昵称:', userInfo.nickName, '长度:', userInfo.nickName ? userInfo.nickName.length : 0);
    
    // 验证昵称不能为空
    if (!userInfo.nickName || userInfo.nickName.trim() === '') {
      wx.showToast({
        title: '昵称不能为空',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ isLoading: true });
    
    // 收集选中的标签ID
    const selectedTags = this.data.tags
      .filter(tag => tag.selected)
      .map(tag => tag.id);
    
    // 构建要提交的数据
    const profileData = {
      nickName: userInfo.nickName,
      age: userInfo.age,
      learningGoal: userInfo.learningGoal,
      gender: userInfo.gender,
      tags: selectedTags
    };
    
    // API预留接口
    // wx.request({
    //   url: 'https://your-api-domain.com/api/user/profile',
    //   method: 'PUT',
    //   header: {
    //     'Authorization': `Bearer ${wx.getStorageSync('token')}`
    //   },
    //   data: profileData,
    //   success: (res) => {
    //     if (res.statusCode === 200 && res.data.success) {
    //       wx.showToast({
    //         title: '保存成功',
    //         icon: 'success'
    //       });
    //       // 返回上一页
    //       setTimeout(() => {
    //         wx.navigateBack();
    //       }, 1500);
    //     } else {
    //       wx.showToast({
    //         title: res.data.message || '保存失败',
    //         icon: 'none'
    //       });
    //     }
    //   },
    //   fail: () => {
    //     wx.showToast({
    //       title: '网络错误',
    //       icon: 'none'
    //     });
    //   },
    //   complete: () => {
    //     this.setData({ isLoading: false });
    //   }
    // });
    
    // 开发阶段模拟保存
    setTimeout(() => {
      this.setData({ isLoading: false });
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      
      // 模拟保存成功后返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }, 1000);
  },

  /**
   * 取消编辑
   */
  cancelEdit: function() {
    wx.navigateBack();
  },

  /**
   * 保存个人资料 - 通过表单提交
   */
  saveProfileForm: function(e) {
    // 表单数据
    const formData = e.detail.value;
    console.log('表单提交的数据:', formData);
    
    // 验证昵称不能为空
    if (!formData.nickName || formData.nickName.trim() === '') {
      wx.showToast({
        title: '昵称不能为空',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ isLoading: true });
    
    // 收集选中的标签ID
    const selectedTags = this.data.tags
      .filter(tag => tag.selected)
      .map(tag => tag.id);
    
    // 构建要提交的数据
    const profileData = {
      nickName: formData.nickName,
      age: formData.age,
      learningGoal: this.data.userInfo.learningGoal,
      selectedGoal: this.data.userInfo.selectedGoal,
      gender: parseInt(formData.gender || this.data.userInfo.gender),
      tags: selectedTags
    };
    
    console.log('保存的完整数据:', profileData);
    
    // 开发阶段模拟保存
    setTimeout(() => {
      this.setData({ isLoading: false });
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      
      // 将修改后的数据传回上一页
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2]; // 获取上一个页面
      
      // 如果存在上一个页面，给它设置修改后的用户信息
      if (prevPage) {
        // 保留原有数据，只更新修改的部分
        const updatedUserInfo = {
          ...prevPage.data.userInfo,
          nickName: profileData.nickName,
          age: profileData.age,
          gender: profileData.gender,
          learningGoal: profileData.learningGoal,
          selectedGoal: profileData.selectedGoal,
          avatarUrl: this.data.userInfo.avatarUrl, // 确保头像也被更新
          tags: profileData.tags // 确保标签也被更新
        };
        
        // 调用上一个页面的方法更新用户信息
        prevPage.setData({
          userInfo: updatedUserInfo
        });
        
        console.log('更新后的主页用户信息:', updatedUserInfo);
      }
      
      // 模拟保存成功后返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }, 1000);
  },

  /**
   * 学习目标选择变化
   */
  onLearningGoalChange: function(e) {
    const selectedGoalId = e.detail.value;
    console.log('选择学习目标:', selectedGoalId);
    
    // 找到对应的学习目标内容
    const selectedGoal = this.data.learningGoals.find(goal => goal.id === selectedGoalId);
    const goalContent = selectedGoal ? selectedGoal.content : "";
    
    this.setData({
      'userInfo.selectedGoal': selectedGoalId,
      'userInfo.learningGoal': goalContent
    });
  }
}); 