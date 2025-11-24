// pages/starcheckin/starcheckin.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    checkinInfo: {
      totalDays: 0,        // 累计打卡天数
      continuousDays: 0,   // 连续打卡天数
      todayChecked: false  // 今日是否已打卡
    },
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    weeks: [],  // 日历数组
    selectedDate: null, // 选中的日期
    monthlyCheckins: null, // 当月打卡记录
    userProfile: null, // 用户资料
    celestialBodies: [], // 从云端获取
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
  onLoad: async function (options) {
    const app = getApp();
    if (!app.isUserLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }

    this.setData({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate(),
      isLoading: true
    });

    try {
      // 先生成空白日历
      this.generateCalendar(this.data.year, this.data.month);
      
      // 获取星体数据
      await this.loadCelestialBodies();

      // 初始化数据
      await this.loadCheckinInfo();
    } catch (error) {
      console.error('初始化数据失败:', error);
    } finally {
      this.setData({
        isLoading: false
      });
    }
  },

  // 检查登录状态
  async checkLoginStatus() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'auth',
        data: { type: 'getUser' }
      });

      if (!result.success || !result.data) {
        // 未登录，跳转到登录页
        wx.redirectTo({
          url: '/pages/login/login'
        });
        return;
      }

      // 已登录，初始化页面
      this.initCalendar();
      this.loadCheckinData();
      this.loadDailyQuote();
    } catch (err) {
      console.error('检查登录状态失败:', err);
      wx.redirectTo({
        url: '/pages/login/login'
      });
    }
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
    const weeks = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    
    let currentWeek = [];
    
    // 填充第一周的空白日期
    for (let i = 0; i < firstDay.getDay(); i++) {
      currentWeek.push({
        day: '',
        hasCheckin: false,
        isToday: false,
        isCurrentMonth: false
      });
    }
    
    // 填充日期
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
    
    // 获取当前显示月份的打卡记录
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
    let checkinDays = [];
    
    if (this.data.monthlyCheckins) {
      console.log('月度打卡数据检查:', {
        monthlyCheckins: this.data.monthlyCheckins,
        yearMonth,
        monthMatch: this.data.monthlyCheckins.year_month === yearMonth,
        numberArray: this.data.monthlyCheckins.number,
        numberArrayLength: this.data.monthlyCheckins.number ? this.data.monthlyCheckins.number.length : 0,
        numberArrayContent: JSON.stringify(this.data.monthlyCheckins.number),
        currentYearMonth: this.data.monthlyCheckins.year_month,
        targetYearMonth: yearMonth
      });
      
      if (this.data.monthlyCheckins.year_month === yearMonth) {
        // 确保number字段是数组，并且元素都是数字类型
        const numberData = this.data.monthlyCheckins.number;
        console.log('处理number数据前:', {
          numberData,
          numberDataType: typeof numberData,
          isArray: Array.isArray(numberData),
          numberDataContent: JSON.stringify(numberData)
        });
        
        if (Array.isArray(numberData)) {
          checkinDays = numberData.map(item => parseInt(item, 10));
        } else if (numberData && typeof numberData === 'object') {
          // 如果是对象，尝试转换为数组
          checkinDays = Object.values(numberData).map(item => parseInt(item, 10));
        } else {
          checkinDays = [];
        }
      } else {
        console.log('检查numberArray字段:', {
          hasNumberArray: 'numberArray' in this.data.monthlyCheckins,
          numberArrayValue: this.data.monthlyCheckins.numberArray,
          isArray: Array.isArray(this.data.monthlyCheckins.numberArray),
          numberArrayType: typeof this.data.monthlyCheckins.numberArray
        });
        
        // 检查是否有 numberArray 字段（可能是旧的数据格式）
        if (this.data.monthlyCheckins.numberArray && Array.isArray(this.data.monthlyCheckins.numberArray)) {
          console.log('使用numberArray数据:', this.data.monthlyCheckins.numberArray);
          checkinDays = this.data.monthlyCheckins.numberArray.map(item => parseInt(item, 10));
          console.log('从numberArray生成checkinDays:', checkinDays);
        } else {
          console.log('没有找到有效的numberArray数据，尝试其他字段');
          // 尝试检查其他可能的字段名
          const possibleFields = ['numberArray', 'number', 'days', 'checkinDays'];
          let found = false;
          for (const field of possibleFields) {
            if (this.data.monthlyCheckins[field] && Array.isArray(this.data.monthlyCheckins[field])) {
              console.log(`找到字段 ${field}:`, this.data.monthlyCheckins[field]);
              checkinDays = this.data.monthlyCheckins[field].map(item => parseInt(item, 10));
              console.log(`从${field}生成checkinDays:`, checkinDays);
              found = true;
              break;
            }
          }
          if (!found) {
            checkinDays = [];
          }
        }
      }
    } else {
      console.log('monthlyCheckins为空');
    }
    
    // 如果是当天且已打卡，确保包含今天的日期
    if (isCurrentMonth && this.data.checkinInfo && this.data.checkinInfo.todayChecked) {
      const todayDate = today.getDate();
      if (!checkinDays.includes(todayDate)) {
        checkinDays.push(todayDate);
      }
    }
    
    console.log('生成日历 - 当前状态:', {
      year,
      month,
      today: today.getDate(),
      yearMonth,
      checkinDays,
      checkinDaysLength: checkinDays.length,
      monthlyCheckins: this.data.monthlyCheckins,
      checkinInfo: this.data.checkinInfo,
      '最终checkinDays内容': JSON.stringify(checkinDays)
    });
    
    for (let day = 1; day <= daysInMonth; day++) {
      // 检查是否有打卡记录
      const hasCheckin = checkinDays.includes(day);
      const isToday = isCurrentMonth && today.getDate() === day;
      
      // 只为特定日期输出详细调试信息
      if (day === 30 || day === 3 || hasCheckin) {
        console.log(`生成日历 - 检查日期 ${day}:`, {
          hasCheckin,
          isToday,
          isCurrentMonth,
          checkinDays,
          checkinDaysType: typeof checkinDays,
          dayType: typeof day,
          includesResult: checkinDays.includes(day),
          checkinDaysContent: JSON.stringify(checkinDays),
          todayChecked: this.data.checkinInfo?.todayChecked
        });
      }
      
      currentWeek.push({
        day,
        hasCheckin: hasCheckin || (isToday && this.data.checkinInfo?.todayChecked),
        isToday,
        isCurrentMonth: true,
        date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      });
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // 填充最后一周的空白日期
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({
          day: '',
          hasCheckin: false,
          isToday: false,
          isCurrentMonth: false
        });
      }
      weeks.push(currentWeek);
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
    
    wx.cloud.callFunction({
      name: 'profile',
      data: {
        action: 'getCheckinInfo'
      },
      success: (res) => {
        if (res.result.success) {
          const { totalDays, continuousDays, todayChecked, monthlyCheckins } = res.result.data;
          
          this.setData({
            'checkinInfo.totalDays': totalDays || 0,
            'checkinInfo.continuousDays': continuousDays || 0,
            'checkinInfo.todayChecked': todayChecked || false,
            monthlyCheckins: monthlyCheckins
          });
          
          // 重新生成日历
          this.generateCalendar(this.data.year, this.data.month);
        } else {
          wx.showToast({
            title: res.result.message || '加载打卡数据失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('加载打卡数据失败：', err);
        wx.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  /**
   * 加载用户数据和打卡信息
   */
  async loadCheckinInfo() {
    try {
      // 获取用户打卡信息
      const res = await wx.cloud.callFunction({
        name: 'profile',
        data: { 
          action: 'getCheckinInfo',
          year: this.data.year,
          month: this.data.month
        }
      });

      if (!res.result || !res.result.data) {
        throw new Error('获取打卡信息失败');
      }

      const checkinInfo = res.result.data;
      
      // 设置打卡信息（不包括monthlyCheckins，单独获取）
      this.setData({
        checkinInfo: {
          totalDays: checkinInfo.totalDays || 0,
          continuousDays: checkinInfo.continuousDays || 0,
          todayChecked: checkinInfo.todayChecked || false
        }
      });

      // 单独加载当前月份的打卡记录
      await this.loadMonthlyCheckins(this.data.year, this.data.month);

      wx.hideLoading();
    } catch (error) {
      console.error('加载打卡信息失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 加载月度打卡记录
   */
  async loadMonthlyCheckins(year, month) {
    try {
      // 如果没有传入参数，使用当前数据
      const targetYear = year || this.data.year;
      const targetMonth = month || this.data.month;
      
      const startDate = new Date(targetYear, targetMonth - 1, 1).toISOString();
      const endDate = new Date(targetYear, targetMonth, 0).toISOString();

      console.log('loadMonthlyCheckins 调用参数:', {
        targetYear,
        targetMonth,
        startDate,
        endDate,
        startDateStr: startDate.substring(0, 10),
        endDateStr: endDate.substring(0, 10)
      });

      const res = await wx.cloud.callFunction({
        name: 'profile',
        data: {
          action: 'getMonthlyCheckins',
          data: {
            startDate,
            endDate
          }
        }
      });

      console.log('loadMonthlyCheckins 返回结果:', res.result);

      if (!res.result || !res.result.checkins) {
        throw new Error('获取月度打卡记录失败');
      }

      console.log('设置monthlyCheckins数据前:', this.data.monthlyCheckins);
      
      this.setData({
        monthlyCheckins: res.result.checkins
      }, () => {
        console.log('setData回调 - monthlyCheckins数据已更新:', this.data.monthlyCheckins);
        // 在setData完成后重新生成日历
        this.generateCalendar(targetYear, targetMonth);
      });
      
      console.log('setData调用后（可能还未完成）:', this.data.monthlyCheckins);
    } catch (error) {
      console.error('加载月度打卡记录失败:', error);
    }
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
   * 切换到上一个月
   */
  prevMonth: async function() {
    let { year, month } = this.data;
    
    if (month === 1) {
      year--;
      month = 12;
    } else {
      month--;
    }
    
    this.setData({
      year,
      month
    });

    // 加载新月份的打卡记录（会自动重新生成日历）
    await this.loadMonthlyCheckins(year, month);
  },

  /**
   * 切换到下一个月
   */
  nextMonth: async function() {
    let { year, month } = this.data;
    
    if (month === 12) {
      year++;
      month = 1;
    } else {
      month++;
    }
    
    // 不能查看未来的月份
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (year > currentYear || (year === currentYear && month > currentMonth)) {
      wx.showToast({
        title: '不能查看未来的月份',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      year,
      month
    });

    // 加载新月份的打卡记录（会自动重新生成日历）
    await this.loadMonthlyCheckins(year, month);
  },
  
  /**
   * 获取指定月份的打卡记录
   */
  getMonthCheckins: function(year, month) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // 如果是当前月份，使用当前的打卡信息
    if (year === currentYear && month === currentMonth) {
      console.log('显示当前月打卡记录');
    this.generateCalendar(year, month);
      return;
    }
    
    // 否则请求历史打卡记录
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
    console.log('请求历史打卡记录:', yearMonth);
    
    wx.showLoading({
      title: '加载中...',
    });
    
    wx.cloud.callFunction({
      name: 'profile',
      data: {
        action: 'getHistoricalCheckins',
        yearMonth: yearMonth
      },
      success: (res) => {
        console.log('获取历史打卡记录结果:', res.result);
        
        if (res.result.success) {
          // 更新日历数据
          this.setData({
            monthlyCheckins: res.result.data
          }, () => {
            this.generateCalendar(year, month);
          });
        } else {
          wx.showToast({
            title: res.result.message || '获取历史记录失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取历史打卡记录失败:', err);
        wx.showToast({
          title: '获取历史记录失败',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  /**
   * 点击日期查看星体
   */
  tapDayItem: async function(e) {
    const { date } = e.currentTarget.dataset;
    if (!date) return; // 点击了空白日期
    
    console.log('点击日期:', date);
    
    // 直接从云端查询这一天的打卡记录
    try {
      wx.showLoading({ title: '加载中...' });
      
      console.log('调用getCheckinDetail云函数，传入日期:', date);
      const res = await wx.cloud.callFunction({
        name: 'profile',
        data: {
          action: 'getCheckinDetail',
          date: date
        }
      });
      
      console.log('云函数返回结果:', res.result);
      
      wx.hideLoading();
      
      if (!res.result || !res.result.success) {
        wx.showToast({
          title: res.result?.message || '这天没有打卡记录',
          icon: 'none'
        });
        return;
      }
      
      const checkinDetail = res.result.data;
      console.log('打卡详情:', checkinDetail);
      
      // 使用云函数返回的完整星体数据
      if (!checkinDetail.celestial) {
        wx.showToast({
          title: '星体数据不存在',
          icon: 'none'
        });
        return;
      }
      
      const celestial = checkinDetail.celestial;
      console.log('找到的星体数据:', celestial);
      
      // 显示星体详情
      this.setData({
        currentCelestial: {
          ...celestial,
          checkinDate: date
        },
        showCelestialDetail: true
      });
      
    } catch (error) {
      wx.hideLoading();
      console.error('获取打卡详情失败:', error);
      wx.showToast({
        title: '获取打卡详情失败',
        icon: 'none'
      });
    }
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
  async doCheckin() {
    console.log('开始打卡操作...');
    console.log('当前星体数据:', this.data.celestialBodies);
    
    if (this.data.checkinInfo.todayChecked) {
      console.log('今日已打卡');
      wx.showToast({
        title: '今天已经打卡了',
        icon: 'none'
      });
      return;
    }

    if (!this.data.celestialBodies || this.data.celestialBodies.length === 0) {
      console.error('星体数据为空，无法打卡');
      wx.showToast({
        title: '系统错误，请稍后重试',
        icon: 'none'
      });
      return;
    }

    try {
      wx.showLoading({ title: '打卡中...' });

      // 获取当前日期和时间
      const now = new Date();
      const checkinDate = now.getFullYear() + '-' + 
                         String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(now.getDate()).padStart(2, '0');
      const checkinTime = String(now.getHours()).padStart(2, '0') + ':' + 
                         String(now.getMinutes()).padStart(2, '0');

      // 随机选择一个星体作为奖励
      const randomIndex = Math.floor(Math.random() * this.data.celestialBodies.length);
      const celestial = this.data.celestialBodies[randomIndex];
      console.log('选中的星体:', celestial);

      // 调用云函数进行打卡
      const res = await wx.cloud.callFunction({
        name: 'profile',
        data: { 
          action: 'doCheckin',
          data: {
            celestialId: celestial._id,
            checkinDate: checkinDate
          }
        }
      });

      console.log('打卡结果:', res.result);

      if (!res.result || !res.result.success) {
        throw new Error(res.result.message || '打卡失败');
      }

      const totalDays = (res.result && res.result.data && (res.result.data.totalCheckins ?? res.result.data.totalDays)) ?? (this.data.checkinInfo.totalDays + 1);
      const continuousDays = (res.result && res.result.data && (res.result.data.streak ?? res.result.data.continuousDays)) ?? (this.data.checkinInfo.continuousDays + 1);
      this.setData({
        'checkinInfo.todayChecked': true,
        'checkinInfo.totalDays': totalDays,
        'checkinInfo.continuousDays': continuousDays,
        currentCelestial: {
          ...celestial,
          checkinDate: checkinDate,
          checkinTime: checkinTime
        },
        showCelestialDetail: true
      });

      // 重新从服务器加载月度打卡记录，确保包含所有历史记录
      await this.loadMonthlyCheckins(this.data.year, this.data.month);

      wx.hideLoading();
      wx.showToast({
        title: '打卡成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('打卡失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: error.message || '打卡失败',
        icon: 'none'
      });
    }
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
   * 显示打卡奖励
   * @param {number} continuousDays 连续打卡天数
   */
  showCheckinReward: function(continuousDays) {
    // 从星体列表中随机选择一个作为奖励
    const celestialBodies = this.data.celestialBodies;
    if (!celestialBodies || celestialBodies.length === 0) {
      wx.showToast({
        title: '打卡成功',
        icon: 'success'
      });
      return;
    }
    
    // 根据连续打卡天数提高获得稀有星体的概率
    let rareChance = 0.1; // 基础稀有度概率
    if (continuousDays >= 7) {
      rareChance = 0.3;
    } else if (continuousDays >= 3) {
      rareChance = 0.2;
    }
    
    // 按照类型划分星体
    const commonTypes = ['planet', 'satellite', 'star'];
    const rareTypes = ['galaxy', 'nebula', 'blackhole', 'cluster', 'deepspace'];
    
    // 确定获得稀有或普通星体
    const isRare = Math.random() < rareChance;
    
    // 筛选可能的星体
    let possibleCelestials = [];
    if (isRare) {
      possibleCelestials = celestialBodies.filter(c => rareTypes.includes(c.type));
    } else {
      possibleCelestials = celestialBodies.filter(c => commonTypes.includes(c.type));
    }
    
    // 如果没有符合条件的星体，使用全部星体
    if (possibleCelestials.length === 0) {
      possibleCelestials = celestialBodies;
    }
    
    // 随机选择一个星体
    const randomIndex = Math.floor(Math.random() * possibleCelestials.length);
    const todayCelestial = possibleCelestials[randomIndex];
    
    // 当前日期和时间
    const now = new Date();
    const date = this.formatDate(now);
    const time = this.formatTime(now);
    
    // 延迟显示，先显示打卡成功
    wx.showToast({
      title: '打卡成功',
      icon: 'success'
    });
    
    // 记录打卡星体
    const checkinRecords = this.data.checkinRecords || [];
    checkinRecords.push({
      date,
      celestialId: todayCelestial.id,
      time
    });
    
    this.setData({
      checkinRecords
    });
    
    // 1.5秒后显示获得的星体
    setTimeout(() => {
      this.showTodayCelestial(todayCelestial, date, time);
      
      // 对于连续打卡达到特定天数的，显示额外提示
      if (continuousDays === 3 || continuousDays === 7 || continuousDays === 15 || continuousDays === 30) {
        setTimeout(() => {
          wx.showModal({
            title: '连续打卡奖励',
            content: `恭喜你已连续打卡${continuousDays}天！继续保持，解锁更多星空奥秘！`,
            showCancel: false
          });
        }, 2000);
      }
    }, 1500);
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
  },
  
  /**
   * 修复打卡计数
   * 重新计算累计打卡天数，修复数据不一致问题
   */
  fixCheckinCount: function() {
    if (!wx.getStorageSync('token')) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '修复中...',
    });
    
    wx.cloud.callFunction({
      name: 'profile',
      data: {
        action: 'fixCheckinCount'
      },
      success: (res) => {
        console.log('修复打卡计数结果:', res.result);
        
        if (res.result.success) {
          const { oldCount, newCount, difference } = res.result.data;
          
          // 更新本地数据
          this.setData({
            'checkinInfo.totalDays': newCount
          });
          
          wx.showModal({
            title: '修复成功',
            content: `打卡计数已修复：从 ${oldCount} 天更新为 ${newCount} 天，差异 ${difference} 天`,
            showCancel: false
          });
          
          // 重新加载数据
          this.loadCheckinData();
        } else {
          wx.showToast({
            title: res.result.message || '修复失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('修复打卡计数失败:', err);
        wx.showToast({
          title: '修复失败，请重试',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 处理图片加载错误
  handleImageError(e) {
    console.error('图片加载失败:', e);
    wx.showToast({
      title: '图片加载失败',
      icon: 'none'
    });
  },

  // 获取云存储文件临时链接
  async getCloudFileURL(fileID) {
    try {
      console.log('处理图片路径:', fileID);
      
      if (!fileID) {
        console.error('文件ID为空');
        return '';
      }

      // 如果已经是http或https链接，直接返回
      if (fileID.startsWith('http://') || fileID.startsWith('https://')) {
        return fileID;
      }

      // 如果是相对路径，加上云存储前缀
      if (!fileID.startsWith('cloud://')) {
        const envID = 'cloud1-1gsyt78b92c539ef'; // 使用与app.js相同的云环境ID
        fileID = `cloud://${envID}.${fileID.startsWith('/') ? fileID.substr(1) : fileID}`;
      }

      console.log('转换后的fileID:', fileID);
      
      const { fileList } = await wx.cloud.getTempFileURL({
        fileList: [fileID]
      });

      console.log('获取临时链接结果:', fileList);
      
      if (fileList && fileList[0] && fileList[0].tempFileURL) {
        return fileList[0].tempFileURL;
      } else {
        console.error('获取临时链接失败:', fileList);
        return '';
      }
    } catch (error) {
      console.error('获取云存储链接失败:', error);
      return '';
    }
  },

  // 加载星体数据
  async loadCelestialBodies() {
    try {
      console.log('开始加载星体数据...');
      const { result } = await wx.cloud.callFunction({
        name: 'starmap',
        data: {
          action: 'getCelestialBodies'
        }
      });
      
      console.log('星体数据加载结果:', result);
      
      if (result && result.data) {
        this.setData({
          celestialBodies: result.data
        });
        console.log('星体数据设置成功，数量:', result.data.length);
      } else {
        console.error('星体数据格式不正确:', result);
      }
    } catch (error) {
      console.error('加载星体数据失败:', error);
      wx.showToast({
        title: '加载星体数据失败',
        icon: 'none'
      });
    }
  },

  // 显示星体详情
  async showCelestialDetail(celestial) {
    try {
      console.log('显示星体详情:', celestial);
      
      if (!celestial) {
        console.error('星体数据为空');
        return;
      }

      const celestialCopy = { ...celestial };
      
      if (celestialCopy.image) {
        console.log('处理星体图片:', celestialCopy.image);
        const tempFileURL = await this.getCloudFileURL(celestialCopy.image);
        celestialCopy.image = tempFileURL;
        console.log('处理后的图片URL:', tempFileURL);
      }
      
      this.setData({
        currentCelestial: celestialCopy,
        showCelestialDetail: true
      });
    } catch (error) {
      console.error('显示星体详情失败:', error);
      wx.showToast({
        title: '显示星体详情失败',
        icon: 'none'
      });
    }
  }
})