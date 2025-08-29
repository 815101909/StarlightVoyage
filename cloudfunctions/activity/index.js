// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { action } = event
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  switch (action) {
    case 'createActivity':
      return await createActivity(openid, event.data)
    case 'getRecentActivities':
      return await getRecentActivities(openid, event.page, event.limit)
    default:
      return {
        success: false,
        message: '未知的操作类型'
      }
  }
}

// 创建活动记录
async function createActivity(openid, data) {
  try {
    const { type, title, content, _openid } = data  // 从data中获取_openid
    const now = new Date()
    
    // 检查最近的一条活动记录是否重复
    const recentActivity = await db.collection('activities')
      .where({
        _openid: _openid || openid,  // 优先使用传入的_openid
        type: type,
        title: title,
        // 添加对文章ID的检查
        'content.articleId': content.articleId  // 检查具体内容ID
      })
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get()

    // 如果有最近的活动，且在24小时内，则不创建新记录
    if (recentActivity.data && recentActivity.data.length > 0) {
      const lastActivity = recentActivity.data[0]
      const timeDiff = now - new Date(lastActivity.createdAt)
      if (timeDiff < 24 * 60 * 60 * 1000) { // 24小时内
        return {
          success: true,
          message: '已存在相同活动',
          duplicate: true
        }
      }
    }

    // 创建新活动记录
    const result = await db.collection('activities').add({
      data: {
        _openid: _openid || openid,  // 优先使用传入的_openid
        type,
        title,
        content,
        createdAt: now,
        displayTime: formatDisplayTime(now)
      }
    })

    return {
      success: true,
      data: result._id
    }
  } catch (error) {
    console.error('创建活动记录失败:', error)
    return {
      success: false,
      message: '创建活动记录失败'
    }
  }
}

// 获取用户最近活动
async function getRecentActivities(openid, page = 1, limit = 5) {
  try {
    const skip = (page - 1) * limit
    
    const result = await db.collection('activities')
      .where({
        _openid: openid
      })
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(limit)
      .get()

    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('获取最近活动失败:', error)
    return {
      success: false,
      message: '获取最近活动失败'
    }
  }
}

// 格式化显示时间
function formatDisplayTime(date) {
  const now = new Date()
  const diff = now - date
  
  if (diff < 24 * 60 * 60 * 1000) {
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  } else if (diff < 48 * 60 * 60 * 1000) {
    return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  } else if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}