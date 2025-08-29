// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, data } = event

  switch (action) {
    case 'getSystemMessages':
      return getSystemMessages()
    case 'addSystemMessage':
      return addSystemMessage(data)
    case 'updateSystemMessage':
      return updateSystemMessage(data)
    case 'deleteSystemMessage':
      return deleteSystemMessage(data)
    default:
      return {
        success: false,
        message: '未知的操作类型'
      }
  }
}

// 获取系统消息列表
async function getSystemMessages() {
  try {
    const result = await db.collection('systemMessages')
      .orderBy('createTime', 'desc')
      .get()
    
    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('获取系统消息失败：', error)
    return {
      success: false,
      message: '获取系统消息失败'
    }
  }
}

// 添加系统消息
async function addSystemMessage(data) {
  try {
    const { content, title } = data
    
    // 参数验证
    if (!content || !title) {
      return {
        success: false,
        message: '标题和内容不能为空'
      }
    }

    const result = await db.collection('systemMessages').add({
      data: {
        content,
        title,
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })

    return {
      success: true,
      data: result._id
    }
  } catch (error) {
    console.error('添加系统消息失败：', error)
    return {
      success: false,
      message: '添加系统消息失败'
    }
  }
}

// 更新系统消息
async function updateSystemMessage(data) {
  try {
    const { _id, content, title } = data
    
    // 参数验证
    if (!_id) {
      return {
        success: false,
        message: '消息ID不能为空'
      }
    }

    const updateData = {}
    if (content !== undefined) updateData.content = content
    if (title !== undefined) updateData.title = title
    updateData.updateTime = db.serverDate()

    const result = await db.collection('systemMessages')
      .doc(_id)
      .update({
        data: updateData
      })

    return {
      success: true,
      updated: result.stats.updated
    }
  } catch (error) {
    console.error('更新系统消息失败：', error)
    return {
      success: false,
      message: '更新系统消息失败'
    }
  }
}

// 删除系统消息
async function deleteSystemMessage(data) {
  try {
    const { _id } = data
    
    // 参数验证
    if (!_id) {
      return {
        success: false,
        message: '消息ID不能为空'
      }
    }

    const result = await db.collection('systemMessages')
      .doc(_id)
      .remove()

    return {
      success: true,
      deleted: result.stats.removed
    }
  } catch (error) {
    console.error('删除系统消息失败：', error)
    return {
      success: false,
      message: '删除系统消息失败'
    }
  }
} 