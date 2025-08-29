// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command  // 添加数据库操作符

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, data } = event
  const wxContext = cloud.getWXContext()
  const userId = wxContext.OPENID

  switch (action) {
    case 'doCheckin':
      return await doCheckin(userId, data)
    case 'getCheckinInfo':
      return await getCheckinInfo(userId)
    case 'getHistoricalCheckins':
      return await getHistoricalCheckins(userId, data && data.yearMonth)
    case 'getMonthlyCheckins':
      return await getMonthlyCheckins(userId, data)
    case 'getCheckinDetail':
      return await getCheckinDetail(userId, event.date)
    case 'fixCheckinCount':
      return await fixCheckinCount(userId)
    case 'toggleFavorite':
      return await toggleFavorite(userId, data)
    case 'getFavorites':
      return await getFavorites(userId)
    case 'getActivities':
      return await getActivities(userId, data)
    case 'updateMemberStatus':
      return await updateMemberStatus(userId, data)
    
    default:
      return {
        success: false,
        message: '未知的操作类型'
      }
  }
}

/**
 * 计算连续打卡天数
 * @param {string} userId 用户ID
 * @returns {Promise<number>} 连续打卡天数
 */
async function calculateStreak(userId) {
  try {
    // 获取用户的所有打卡记录，按日期倒序排列
    const checkins = await db.collection('checkins')
      .where({
        _openid: userId
      })
      .orderBy('date', 'desc')
      .get();

    if (!checkins.data || checkins.data.length === 0) {
      return 0;
    }

    const records = checkins.data;
    const today = getTodayDate();
    const yesterday = formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

    // 按日期排序（确保倒序）
    records.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log('计算连续打卡天数，打卡记录：', records.map(r => r.date));
    console.log('今天日期:', today, '昨天日期:', yesterday);

    // 检查最新的打卡记录是否是今天或昨天
    const latestRecord = records[0];
    if (latestRecord.date !== today && latestRecord.date !== yesterday) {
      // 如果最新打卡记录既不是今天也不是昨天，说明已经断签
      console.log('已断签，最新打卡日期:', latestRecord.date);
      return 0;
    }

    let streak = 1;
    let currentCheckDate = latestRecord.date;

    // 从最新的记录开始，检查是否连续
    for (let i = 1; i < records.length; i++) {
      const prevRecord = records[i];
      const expectedPrevDate = formatDate(new Date(new Date(currentCheckDate).getTime() - 24 * 60 * 60 * 1000));
      
      console.log('检查连续性:', {
        currentCheckDate,
        prevRecordDate: prevRecord.date,
        expectedPrevDate
      });

      // 如果前一天的记录存在且日期正确，则连续天数+1
      if (prevRecord.date === expectedPrevDate) {
        streak++;
        currentCheckDate = prevRecord.date;
      } else {
        // 一旦发现不连续，就停止计算
        break;
      }
    }

    console.log('最终计算的连续天数:', streak);
    return streak;
  } catch (error) {
    console.error('计算连续打卡天数失败:', error);
    return 0;
  }
}

/**
 * 判断是否已打卡的函数
 */
function isCheckedToday(monthlyCheckins, today, yearMonth) {
  console.log('判断是否已打卡:', {
    input: {
      monthlyCheckins,
      today,
      yearMonth
    }
  });

  // 确保数字类型一致
  const todayNum = parseInt(today, 10);
  const checkinNumbers = monthlyCheckins.number.map(n => parseInt(n, 10));
  
  console.log('数据类型检查:', {
    today: {
      value: today,
      parsed: todayNum,
      type: typeof today
    },
    numbers: checkinNumbers.map(n => ({
      original: n,
      type: typeof n,
      equalsToday: n === todayNum
    }))
  });

  // 检查月份和打卡记录
  const monthMatch = monthlyCheckins.year_month === yearMonth;
  const dayChecked = checkinNumbers.includes(todayNum);

  console.log('检查结果:', {
    monthMatch,
    dayChecked,
    finalResult: monthMatch && dayChecked
  });

  return monthMatch && dayChecked;
}

// 格式化日期为 YYYY-MM-DD，使用东八区时间
function formatDate(date) {
  // 转换为东八区时间
  const chinaDate = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  const year = chinaDate.getUTCFullYear();
  const month = String(chinaDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(chinaDate.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 格式化年月为 YYYY-MM
function formatYearMonth(date) {
  return formatDate(date).substring(0, 7);
}

// 获取今天的日期（东八区）
function getTodayDate() {
  const now = new Date();
  return formatDate(now);
}

// 获取打卡信息
async function getCheckinInfo(userId) {
  try {
    const today = getTodayDate();
    
    console.log('获取打卡信息:', {
      userId,
      today
    });

    // 1. 获取用户信息
    const userInfo = await db.collection('users').where({
      _openid: userId
    }).get();

    if (!userInfo.data || userInfo.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      };
    }

    const user = userInfo.data[0];

    // 2. 检查今日是否已打卡
    const todayCheckin = await db.collection('checkins').where({
      _openid: userId,
      date: today
    }).get();

    const todayChecked = todayCheckin.data.length > 0;

    // 3. 重新计算连续打卡天数（确保数据准确性）
    const actualStreak = await calculateStreak(userId);
    
    // 4. 获取本月打卡记录
    const yearMonth = today.substring(0, 7); // 获取 YYYY-MM
    const monthlyCheckins = await db.collection('checkins')
      .where({
        _openid: userId,
        date: db.RegExp({
          regexp: `^${yearMonth}`,
          options: 'i',
        })
      })
      .orderBy('date', 'asc')
      .get();

    // 提取本月打卡的日期
    const checkinDays = monthlyCheckins.data.map(record => 
      parseInt(record.date.split('-')[2], 10)
    );

    // 5. 如果计算出的连续天数与存储的不一致，更新数据库
    if (actualStreak !== (user.streak || 0)) {
      console.log('连续天数不一致，更新数据库:', {
        stored: user.streak || 0,
        calculated: actualStreak
      });
      
      await db.collection('users').where({
        _openid: userId
      }).update({
        data: {
        
          streak: actualStreak
        }
      });
    }

    return {
      success: true,
      data: {
        totalDays: user.totalCheckins || 0,
        continuousDays: actualStreak,
        todayChecked,
        monthlyCheckins: {
          year_month: yearMonth,
          number: checkinDays
        }
      }
    };

  } catch (error) {
    console.error('获取打卡信息失败:', error);
    return {
      success: false,
      message: '获取打卡信息失败'
    };
  }
}

/**
 * 执行打卡操作
 * @param {string} userId 用户openid
 */
async function doCheckin(userId, data = {}) {
  try {
    // Step 1: 获取当前用户信息
    const userInfo = await db.collection('users').where({
      _openid: userId
    }).get();

    if (!userInfo.data || userInfo.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      };
    }

    const user = userInfo.data[0];
    const { totalCheckins = 0 } = user;

    // Step 2: 获取今天日期（东八区，去除时间部分）
    const now = new Date();
    const today = data.checkinDate || formatDate(now);
    const celestialId = data.celestialId;

    // Step 3: 判断今天是否已打卡
    const existingCheckin = await db.collection('checkins').where({
      _openid: userId,
      date: today
    }).get();

    if (existingCheckin.data && existingCheckin.data.length > 0) {
      return {
        success: false,
        message: '今日已打卡'
      };
    }

    // Step 4: 插入新打卡记录
    await db.collection('checkins').add({
      data: {
        _openid: userId,
        date: today,
        celestialId: celestialId,
        createdAt: db.serverDate(),
        checkinTime: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      }
    });

    // Step 5: 计算新的连续打卡天数
    const updatedStreak = await calculateStreak(userId);
    const updatedTotalCheckins = totalCheckins + 1;

    // Step 6: 检查连续打卡奖励
    let memberReward = null;
    if (updatedStreak === 10) {
      memberReward = { days: 3, description: '连续打卡10天奖励3天会员' };
    } else if (updatedStreak === 20) {
      memberReward = { days: 7, description: '连续打卡20天奖励7天会员' };
    } else if (updatedStreak === 30) {
      memberReward = { days: 15, description: '连续打卡30天奖励15天会员' };
    }

    // Step 7: 如果有会员奖励，更新用户会员状态
    if (memberReward) {
      const currentUser = userInfo.data[0];
      const now = new Date();
      let newExpireDate;
      
      // 如果用户已有会员且未过期，在现有基础上延长
      if (currentUser.memberExpireDate && new Date(currentUser.memberExpireDate) > now) {
        newExpireDate = new Date(currentUser.memberExpireDate);
        newExpireDate.setDate(newExpireDate.getDate() + memberReward.days);
      } else {
        // 如果用户没有会员或已过期，从今天开始计算
        newExpireDate = new Date(now);
        newExpireDate.setDate(newExpireDate.getDate() + memberReward.days);
      }

      await db.collection('users').where({
        _openid: userId
      }).update({
        data: {
          lastCheckinDate: today,
          streak: updatedStreak,
          totalCheckins: updatedTotalCheckins,
          memberLevel: 1,
          memberExpireDate: newExpireDate,
          expireDate: newExpireDate.toISOString().split('T')[0],
          updatedAt: db.serverDate()
        }
      });
    } else {
      // Step 8: 更新用户信息（无会员奖励）
      await db.collection('users').where({
        _openid: userId
      }).update({
        data: {
          lastCheckinDate: today,
          streak: updatedStreak,
          totalCheckins: updatedTotalCheckins
        }
      });
    }

    // 获取本月打卡记录用于返回
    const yearMonth = today.substring(0, 7);
    const monthlyCheckins = await db.collection('checkins')
      .where({
        _openid: userId,
        date: db.RegExp({
          regexp: `^${yearMonth}`,
          options: 'i',
        })
      })
      .orderBy('date', 'asc')
      .get();

    const checkinDays = monthlyCheckins.data.map(record => 
      parseInt(record.date.split('-')[2], 10)
    );

    console.log('打卡完成:', {
      updatedStreak,
      updatedTotalCheckins,
      monthlyCheckins: checkinDays
    });

    return {
      success: true,
      data: {
        totalDays: updatedTotalCheckins,
        continuousDays: updatedStreak,
        todayChecked: true,
        monthlyCheckins: {
          year_month: yearMonth,
          number: checkinDays
        },
        memberReward: memberReward // 添加会员奖励信息
      }
    };

  } catch (error) {
    console.error('打卡失败:', error);
    return {
      success: false,
      message: '打卡失败，请重试'
    };
  }
}

/**
 * 添加或取消收藏文章
 */
async function toggleFavorite(userId, data) {
  try {
    const { articleId, title, coverUrl } = data;
    
    if (!articleId) {
      return {
        success: false,
        message: '文章ID不能为空'
      };
    }
    
    // 获取用户信息
    const userInfo = await db.collection('users').where({
      _openid: userId
    }).get();

    if (!userInfo.data || userInfo.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      };
    }

    const favorites = userInfo.data[0].favorites || [];
    
    // 检查文章是否已收藏
    const favoriteIndex = favorites.findIndex(item => item.articleId === articleId);
    let isAdd = false;
    
    if (favoriteIndex === -1) {
      // 添加收藏
      favorites.push({
        articleId,
        title: title || '未知标题',
        coverUrl: coverUrl || '',
        addTime: new Date()
      });
      isAdd = true;

      // 添加活动记录
      await cloud.callFunction({
        name: 'activity',
        data: {
          action: 'createActivity',
          data: {
            _openid: userId,  // 传入用户的openid
            type: 'favorite',
            title: `收藏了《${title || '未知标题'}》`,
            content: {
              articleId,
              title,
              coverUrl
            }
          }
        }
      });
    } else {
      // 取消收藏
      favorites.splice(favoriteIndex, 1);
    }
    
    // 更新用户收藏列表
    await db.collection('users').where({
      _openid: userId
    }).update({
      data: {
        favorites
      }
    });
    
    return {
      success: true,
      data: {
        isFavorite: isAdd,
        favorites
      },
      message: isAdd ? '收藏成功' : '已取消收藏'
    };
  } catch (error) {
    console.error('操作收藏失败:', error);
    return {
      success: false,
      message: '操作收藏失败',
      error: error.message
    };
  }
}

/**
 * 获取用户收藏列表
 */
async function getFavorites(userId) {
  try {
    // 获取用户信息
    const userInfo = await db.collection('users').where({
      _openid: userId
    }).get();

    if (!userInfo.data || userInfo.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      };
    }

    const favorites = userInfo.data[0].favorites || [];
    
    // 按添加时间倒序排序
    favorites.sort((a, b) => {
      if (a.addTime && b.addTime) {
        return new Date(b.addTime) - new Date(a.addTime);
      }
      return 0;
    });
    
    return {
      success: true,
      data: favorites
    };
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    return {
      success: false,
      message: '获取收藏列表失败',
      error: error.message
    };
  }
}

/**
 * 修复用户的打卡计数
 * 重新计算累计打卡天数以确保与实际打卡记录一致
 */
async function fixCheckinCount(userId) {
  try {
    console.log('开始修复用户打卡计数:', userId);
    
    // 获取用户信息
    const userInfo = await db.collection('users').doc(userId).get();
    
    // 计算真实的累计打卡天数
    let totalCheckins = 0;
    
    // 统计历史记录中的打卡天数
    const historicalCheckins = userInfo.data.historicalCheckins || [];
    historicalCheckins.forEach(record => {
      if (record.number && Array.isArray(record.number)) {
        totalCheckins += record.number.length;
        console.log(`历史记录 ${record.year_month} 中有 ${record.number.length} 天打卡`);
      }
    });
    
    // 加上当前月的记录
    const currentMonthCheckins = userInfo.data.monthlyCheckins || { number: [] };
    if (currentMonthCheckins.number && Array.isArray(currentMonthCheckins.number)) {
      totalCheckins += currentMonthCheckins.number.length;
      console.log(`当前月 ${currentMonthCheckins.year_month} 中有 ${currentMonthCheckins.number.length} 天打卡`);
    }
    
    console.log('计算得到的总打卡天数:', totalCheckins);
    console.log('数据库中记录的打卡天数:', userInfo.data.checkinDays || 0);
    
    // 更新数据库
    await db.collection('users').doc(userId).update({
      data: {
        checkinDays: totalCheckins,
        updatedAt: new Date()
      }
    });
    
    return {
      success: true,
      message: '打卡计数已修复',
      data: {
        oldCount: userInfo.data.checkinDays || 0,
        newCount: totalCheckins,
        difference: totalCheckins - (userInfo.data.checkinDays || 0)
      }
    };
  } catch (error) {
    console.error('修复打卡计数失败:', error);
    return {
      success: false,
      message: '修复打卡计数失败',
      error: error.message
    };
  }
}

/**
 * 获取历史打卡记录
 * @param {string} userId 用户ID
 * @param {string} yearMonth 年月，格式为YYYY-MM
 */
async function getHistoricalCheckins(userId, yearMonth) {
  try {
    if (!yearMonth) {
      return {
        success: false,
        message: '年月参数不能为空'
      };
    }

    console.log('获取历史打卡记录:', {
      userId,
      yearMonth
    });

    // 获取用户信息
    const userInfo = await db.collection('users').doc(userId).get();
    
    // 如果查询的是当前月份，直接返回用户的monthlyCheckins
    const now = new Date();
    const currentYearMonth = formatYearMonth(now);
    
    if (yearMonth === currentYearMonth) {
      let monthlyCheckins = userInfo.data.monthlyCheckins || { year_month: yearMonth, number: [] };
      if (monthlyCheckins.year_month !== yearMonth) {
        monthlyCheckins = { year_month: yearMonth, number: [] };
      }
      
      return {
        success: true,
        data: monthlyCheckins
      };
    }
    
    // 如果查询的是历史月份，从历史记录中查找
    const historicalCheckins = userInfo.data.historicalCheckins || [];
    const record = historicalCheckins.find(item => item.year_month === yearMonth);
    
    if (record) {
      return {
        success: true,
        data: record
      };
    }
    
    // 未找到记录，返回空数组
    return {
      success: true,
      data: {
        year_month: yearMonth,
        number: []
      }
    };
  } catch (error) {
    console.error('获取历史打卡记录失败:', error);
    return {
      success: false,
      message: '获取历史打卡记录失败',
      error: error.message
    };
  }
} 

/**
 * 获取用户活动列表
 * @param {string} userId 用户ID
 * @param {object} params 分页参数
 */
async function getActivities(userId, params = {}) {
  try {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const skip = (page - 1) * pageSize;

    // 获取活动总数
    const countResult = await db.collection('user_activities')
      .where({
        _openid: userId
      })
      .count();

    // 获取活动列表
    const activities = await db.collection('user_activities')
      .where({
        _openid: userId
      })
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get();

    return {
      success: true,
      data: activities.data || [],
      hasMore: skip + pageSize < countResult.total
    };

  } catch (error) {
    console.error('获取活动列表失败:', error);
    return {
      success: false,
      message: '获取活动列表失败',
      data: [],
      hasMore: false
    };
  }
}

/**
 * 获取指定月份的打卡记录
 * @param {string} userId 用户ID
 * @param {object} data 包含startDate和endDate的对象
 */
async function getMonthlyCheckins(userId, data) {
  try {
    const { startDate, endDate } = data;
    
    if (!startDate || !endDate) {
      return {
        success: false,
        message: '缺少必要的日期参数'
      };
    }

    // 将ISO日期转换为YYYY-MM-DD格式进行比较
    const startDateStr = startDate.substring(0, 10);
    const endDateStr = endDate.substring(0, 10);

    console.log('获取月度打卡记录:', {
      userId,
      startDateStr,
      endDateStr
    });

    // 获取指定日期范围内的打卡记录
    const checkins = await db.collection('checkins')
      .where({
        _openid: userId,
        date: _.gte(startDateStr).and(_.lte(endDateStr))
      })
      .orderBy('date', 'asc')
      .get();

    // 提取打卡的日期数字
    const checkinDays = checkins.data.map(record => {
      const day = parseInt(record.date.split('-')[2], 10);
      return day;
    });

    // 获取年月信息
    const yearMonth = startDateStr.substring(0, 7);

    console.log('月度打卡记录结果:', {
      yearMonth,
      checkinDays,
      totalRecords: checkins.data.length
    });

    return {
      success: true,
      checkins: {
        year_month: yearMonth,
        number: checkinDays
      }
    };
  } catch (error) {
    console.error('获取月度打卡记录失败:', error);
    return {
      success: false,
      message: '获取月度打卡记录失败'
    };
  }
}

/**
 * 获取指定日期的打卡记录详情
 * @param {string} userId 用户ID
 * @param {string} date 日期 (YYYY-MM-DD格式)
 */
async function getCheckinDetail(userId, date) {
  try {
    if (!date) {
      return {
        success: false,
        message: '缺少日期参数'
      };
    }

    console.log('获取打卡详情:', {
      userId,
      date
    });

    // 查询指定日期的打卡记录
    const checkin = await db.collection('checkins')
      .where({
        _openid: userId,
        date: date
      })
      .get();

    if (!checkin.data || checkin.data.length === 0) {
      return {
        success: false,
        message: '该日期没有打卡记录'
      };
    }

    const checkinRecord = checkin.data[0];
    
    console.log('找到打卡记录:', {
      celestialId: checkinRecord.celestialId,
      date: checkinRecord.date
    });

    // 查询对应的星体数据
    const celestial = await db.collection('celestials')
      .where({
        _id: checkinRecord.celestialId
      })
      .get();

    if (!celestial.data || celestial.data.length === 0) {
      console.log('未找到星体数据:', checkinRecord.celestialId);
      return {
        success: false,
        message: '星体数据不存在'
      };
    }

    const celestialData = celestial.data[0];
    
    console.log('找到星体数据:', {
      id: celestialData._id,
      name: celestialData.name
    });

    return {
      success: true,
      data: {
        celestialId: checkinRecord.celestialId,
        date: checkinRecord.date,
        checkinTime: checkinRecord.createdAt ? new Date(checkinRecord.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : '未知时间',
        celestial: celestialData
      }
    };
  } catch (error) {
    console.error('获取打卡详情失败:', error);
    return {
      success: false,
      message: '获取打卡详情失败'
    };
  }
}

/**
 * 更新会员状态
 * @param {string} userId 用户ID
 * @param {object} data 会员信息
 * @returns {Promise<object>} 更新结果
 */
async function updateMemberStatus(userId, data) {
  try {
    const { planId, planName, amount, outTradeNo } = data
    
    console.log('开始更新会员状态:', { userId, planId, planName, amount, outTradeNo })
    
    // 获取用户当前会员信息
    const userQuery = await db.collection('users').where({
      _openid: userId
    }).get()
    
    let expireDate, memberExpireDate
    const now = new Date(new Date().getTime() + 8 * 60 * 60 * 1000) // 中国时区
    
    const monthsMap = {
      'plan1': 1,  // 月度会员
      'plan2': 3,  // 季度会员
      'plan3': 6,  // 半年会员
      'plan4': 12  // 年度会员
    }
    
    const months = monthsMap[planId] || 1
    
    // 如果用户存在且有有效会员，在现有基础上延长
    if (userQuery.data && userQuery.data.length > 0) {
      const currentUser = userQuery.data[0]
      
      // 如果用户已有会员且未过期，在现有基础上延长
      if (currentUser.memberExpireDate && new Date(currentUser.memberExpireDate) > now) {
        const baseDate = new Date(currentUser.memberExpireDate)
        baseDate.setMonth(baseDate.getMonth() + months)
        expireDate = baseDate
        memberExpireDate = baseDate
      } else {
        // 如果用户没有会员或已过期，从今天开始计算
        const newExpireDate = new Date(now)
        newExpireDate.setMonth(newExpireDate.getMonth() + months)
        expireDate = newExpireDate
        memberExpireDate = newExpireDate
      }
    } else {
      // 新用户，从今天开始计算
      const newExpireDate = new Date(now)
      newExpireDate.setMonth(newExpireDate.getMonth() + months)
      expireDate = newExpireDate
      memberExpireDate = newExpireDate
    }
    
    if (!userQuery.data || userQuery.data.length === 0) {
      console.log('用户不存在，创建新用户记录')
      // 创建新用户记录
      await db.collection('users').add({
        data: {
          _openid: userId,
          nickName: "小舟用户",
          avatar: "",
          signature: "",
          tags: [],
          learningGoal: "",
          memberLevel: 1,
          memberExpireDate: memberExpireDate,
          expireDate: expireDate.toISOString().split('T')[0], // 添加 expireDate 字段
          memberPlan: planId,
          memberPlanName: planName,
          checkinDays: 0,
          continuousDays: 0,
          groupCount: 0,
          favorites: [],
          lastCheckinDate: null,
          monthlyCheckins: {},
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      })
    } else {
      // 更新现有用户会员信息
      const userResult = await db.collection('users').where({
        _openid: userId
      }).update({
        data: {
          memberLevel: 1,
          memberExpireDate: memberExpireDate,
          expireDate: expireDate.toISOString().split('T')[0], // 添加 expireDate 字段
          memberPlan: planId,
          memberPlanName: planName,
          updatedAt: db.serverDate()
        }
      })
      
      console.log('用户会员信息更新结果:', userResult)
    }
    
    // 更新订单状态为成功
    const orderResult = await db.collection('member_orders').where({
      _openid: userId,
      outTradeNo: outTradeNo
    }).update({
      data: {
        status: 'success',
        updateTime: db.serverDate(),
        paymentInfo: {
          payTime: db.serverDate()
        }
      }
    })
    
    console.log('订单状态更新结果:', orderResult)
    
    if (orderResult.stats.updated === 0) {
      console.warn('未找到对应的订单记录:', { userId, outTradeNo })
      // 查询是否存在该订单
      const orderQuery = await db.collection('member_orders').where({
        _openid: userId,
        outTradeNo: outTradeNo
      }).get()
      console.log('订单查询结果:', orderQuery)
    }
    
    console.log('会员状态更新成功:', {
      userId,
      planId,
      planName,
      amount,
      expireDate: expireDate.toISOString()
    })
    
    return {
      success: true,
      message: '会员状态更新成功',
      data: {
        memberLevel: 1,
        expireDate: expireDate.toISOString().split('T')[0],
        memberExpireDate: memberExpireDate,
        planId,
        planName
      }
    }
  } catch (error) {
    console.error('更新会员状态失败:', error)
    return {
      success: false,
      message: '更新会员状态失败',
      error: error.message
    }
  }
}