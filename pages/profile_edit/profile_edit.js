Page({
  data: {
    userInfo: {
      nickName: '',
      avatarUrl: '',
      signature: '',
      tags: [],
      learningGoal: '',  // 这里存储的是value值，如'basic'
    defaultAvatarBgColor: '', // 默认头像背景颜色
    },
    // 标签配置
    tagList: [
      { value: 'newbie', name: '新手', icon: '🌟', selected: false },
      { value: 'amateur', name: '业余天文爱好者', icon: '🔭', selected: false },
      { value: 'professional', name: '专业天文学者', icon: '📚', selected: false },
      { value: 'photographer', name: '天文摄影师', icon: '📸', selected: false },
      { value: 'explorer', name: '太空探索爱好者', icon: '🚀', selected: false }
    ],
    // 学习目标配置
    goalList: [
      { value: 'basic', icon: '📖', content: '了解基础天文知识', selected: false },
      { value: 'observation', icon: '🔭', content: '学习天体观测技巧', selected: false },
      { value: 'photography', icon: '📸', content: '掌握天文摄影技术', selected: false },
      { value: 'research', icon: '🔬', content: '进行天文研究', selected: false },
      { value: 'equipment', icon: '🛠️', content: '了解天文设备使用', selected: false }
    ],
    isLoading: true
  },

  onLoad: function() {
    this.loadUserProfile();
    this.generateRandomAvatarColor();
  },

  generateRandomAvatarColor: function() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#28C76F',
      '#FF9F43', '#6A057F', '#8D86C9', '#2A2A72', '#37474F'
    ];
    const randomIndex = Math.floor(Math.random() * colors.length);
    this.setData({
      defaultAvatarBgColor: colors[randomIndex]
    });
  },

  // 加载用户信息
  loadUserProfile: async function() {
    try {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });

      const result = await wx.cloud.callFunction({
        name: 'auth',
        data: {
          action: 'getProfile'
        }
      });

      if (result.result.success) {
        const { nickName, avatar, signature, tags, learningGoal, memberLevel, expireDate, checkinDays, groupCount } = result.result.data;

        // 格式化 expireDate
        const formattedExpireDate = expireDate || '';

        // 更新标签选中状态
        const tagList = this.data.tagList.map(tag => ({
          ...tag,
          selected: tags.includes(tag.value)
        }));

        // 更新学习目标选中状态
        const goalList = this.data.goalList.map(goal => ({
          ...goal,
          selected: goal.value === learningGoal
        }));

        this.setData({
          userInfo: {
            nickName: nickName || '',
            avatarUrl: avatar || '',
            signature: signature || '',
            tags: tags || [],
            learningGoal: learningGoal || '',
            memberLevel: memberLevel || 0,
            expireDate: formattedExpireDate,
            checkinDays: checkinDays || 0,
            groupCount: groupCount || 0
          },
          tagList,
          goalList,
          isLoading: false
        });
      } else {
        throw new Error(result.result.message || '获取用户信息失败');
      }
    } catch (error) {
      console.error('加载用户信息失败：', error);
        wx.showToast({
        title: '加载失败，请重试',
          icon: 'none'
        });
    } finally {
      wx.hideLoading();
    }
  },

  // 选择头像
  chooseAvatar: function() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      camera: 'front',
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.uploadAvatar(tempFilePath);
      }
    });
  },

  // 上传头像
  uploadAvatar: async function(tempFilePath) {
    wx.showLoading({
      title: '上传中...',
      mask: true
    });

    try {
      // 上传到云存储
      const cloudPath = `avatars/${Date.now()}.jpg`;
      const uploadResult = await wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: tempFilePath
      });

      if (!uploadResult.fileID) {
        throw new Error('上传失败');
      }

      // 更新用户信息中的头像
      this.setData({
        'userInfo.avatarUrl': uploadResult.fileID
      });
      
      wx.showToast({
        title: '头像更新成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('上传头像失败：', error);
      wx.showToast({
        title: '上传失败，请重试',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 切换标签选择
  toggleTag: function(e) {
    const tagValue = e.currentTarget.dataset.tag;
    const tagList = this.data.tagList.map(tag => {
      if (tag.value === tagValue) {
        return { ...tag, selected: !tag.selected };
      }
      return tag;
    });
    
    // 更新选中的标签列表
    const selectedTags = tagList
      .filter(tag => tag.selected)
      .map(tag => tag.value);

    this.setData({
      tagList,
      'userInfo.tags': selectedTags
    });
  },

  // 选择学习目标
  selectGoal: function(e) {
    const goalValue = e.currentTarget.dataset.goal;
    
    // 只更新goalList的选中状态
    const goalList = this.data.goalList.map(goal => ({
      ...goal,
      selected: goal.value === goalValue
    }));
    
    // 只更新选中状态，不更新userInfo
    this.setData({
      goalList
    });
  },

  // 保存表单
  saveProfileForm: async function(e) {
    const formData = e.detail.value;
    
    // 找到选中的目标的value值
    const selectedGoal = this.data.goalList.find(goal => goal.selected);
    
    // 合并表单数据并确保数据类型正确
    const profileData = {
      nickName: formData.nickName ? formData.nickName.trim() : '',  // 必填
      signature: formData.signature ? formData.signature.trim() : '',  // 可选
      avatar: this.data.userInfo.avatarUrl || '',  // 可选
      tags: this.data.userInfo.tags || [],  // 身份标签
      learningGoal: selectedGoal ? selectedGoal.value : '',  // 保存value值到数据库
      memberLevel: this.data.userInfo.memberLevel || 0, // 确保会员等级不丢失
      expireDate: this.data.userInfo.expireDate || null, // 确保会员有效期不丢失
      updateTime: new Date()  // 必填,更新时间
    };

    // 表单验证
    if (!profileData.nickName) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }
    
    try {
      wx.showLoading({
        title: '保存中...',
        mask: true
      });
    
      const result = await wx.cloud.callFunction({
        name: 'auth',
        data: {
          action: 'updateProfile',
          profileData
        }
      });

      if (result.result.success) {
        // 保存成功后更新本地数据
        this.setData({
          userInfo: {
            ...this.data.userInfo,
            ...profileData
          }
        });
    
        // 更新本地存储
        wx.setStorageSync('userInfo', {
          ...wx.getStorageSync('userInfo'),
          ...profileData
        });

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      
        // 延迟返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      } else {
        throw new Error(result.result.message || '保存失败');
      }
    } catch (error) {
      console.error('保存失败：', error);
      wx.showToast({
        title: error.message || '保存失败，请重试',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  }
});