// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action } = event

  try {
    switch (action) {
      case 'createObservation':
        return await createObservation(event, wxContext)
      case 'getObservations':
        return await getObservations(event, wxContext)
      case 'getObservationDetail':
        return await getObservationDetail(event, wxContext)
      case 'updateObservation':
        return await updateObservation(event, wxContext)
      case 'deleteObservation':
        return await deleteObservation(event, wxContext)
      case 'uploadPhoto':
        return await uploadPhoto(event, wxContext)
      case 'getBeidouCard':
        return await getBeidouCard(event, wxContext)
      case 'getBeidouCards':
        return await getBeidouCards(event, wxContext)
      // 后台管理接口
      case 'getAllObservations':
        return await getAllObservations(event, wxContext)
      case 'deleteObservationAdmin':
        return await deleteObservationAdmin(event, wxContext)
      default:
        return {
          success: false,
          message: '未知操作'
        }
    }
  } catch (error) {
    console.error('云函数执行错误:', error)
    return {
      success: false,
      message: '服务器错误',
      error: error.message
    }
  }
}

// 创建观测记录
async function createObservation(event, wxContext) {
  const { observationData } = event
  const openid = wxContext.OPENID
  
  const newObservation = {
    ...observationData,
    openid: openid,
    createTime: new Date(),
    updateTime: new Date()
  }
  
  const result = await db.collection('observations').add({
    data: newObservation
  })
  
  // 更新用户观测次数
  await db.collection('users').where({
    openid: openid
  }).update({
    data: {
      observationCount: _.inc(1)
    }
  })
  
  return {
    success: true,
    data: {
      _id: result._id,
      ...newObservation
    }
  }
}

// 获取观测记录列表
async function getObservations(event, wxContext) {
  const { limit = 20, skip = 0, type } = event
  const openid = wxContext.OPENID
  
  let query = db.collection('observations').where({
    openid: openid
  })
  
  if (type) {
    query = query.where({
      type: type
    })
  }
  
  const result = await query
    .orderBy('createTime', 'desc')
    .limit(limit)
    .skip(skip)
    .get()
  
  return {
    success: true,
    data: result.data
  }
}

// 获取观测记录详情
async function getObservationDetail(event, wxContext) {
  const { observationId } = event
  const openid = wxContext.OPENID
  
  const result = await db.collection('observations')
    .where({
      _id: observationId,
      openid: openid
    })
    .get()
  
  if (result.data.length === 0) {
    return {
      success: false,
      message: '观测记录不存在'
    }
  }
  
  return {
    success: true,
    data: result.data[0]
  }
}

// 更新观测记录
async function updateObservation(event, wxContext) {
  const { observationId, updateData } = event
  const openid = wxContext.OPENID
  
  await db.collection('observations')
    .where({
      _id: observationId,
      openid: openid
    })
    .update({
      data: {
        ...updateData,
        updateTime: new Date()
      }
    })
  
  return {
    success: true,
    message: '更新成功'
  }
}

// 删除观测记录
async function deleteObservation(event, wxContext) {
  const { observationId } = event
  const openid = wxContext.OPENID
  
  const result = await db.collection('observations')
    .where({
      _id: observationId,
      openid: openid
    })
    .remove()
  
  if (result.stats.removed > 0) {
    // 更新用户观测次数
    await db.collection('users').where({
      openid: openid
    }).update({
      data: {
        observationCount: _.inc(-1)
      }
    })
  }
  
  return {
    success: true,
    message: '删除成功'
  }
}

// 上传观测照片
async function uploadPhoto(event, wxContext) {
  const { fileData, fileName } = event
  const openid = wxContext.OPENID
  
  // 上传到云存储
  const uploadResult = await cloud.uploadFile({
    cloudPath: `observations/${openid}/${Date.now()}_${fileName}`,
    fileContent: Buffer.from(fileData, 'base64')
  })
  
  return {
    success: true,
    data: {
      fileID: uploadResult.fileID,
      url: uploadResult.fileID
    }
  }
}

// 获取单个北斗星知识卡片
async function getBeidouCard(event, wxContext) {
  const { starId } = event
  
  if (!starId) {
    return {
      success: false,
      message: '星星ID不能为空'
    }
  }
  
  try {
    console.log('查询北斗星卡片，starId:', starId)
    
    // 先尝试通过starId查询
    let result = await db.collection('beidou_cards')
      .where({
        starId: starId
      })
      .get()
    
    console.log('通过starId查询结果:', result)
    
    // 如果starId查询失败，尝试通过_id查询
    if (result.data.length === 0) {
      console.log('starId查询失败，尝试通过_id查询')
      result = await db.collection('beidou_cards')
        .where({
          _id: starId
        })
        .get()
      
      console.log('通过_id查询结果:', result)
    }
    
    // 如果还是找不到，尝试查询所有记录看看数据结构
    if (result.data.length === 0) {
      console.log('所有查询都失败，获取集合中的所有记录进行调试')
      const allRecords = await db.collection('beidou_cards')
        .limit(5)
        .get()
      
      console.log('集合中的所有记录示例:', allRecords.data)
      
      return {
        success: false,
        message: '未找到该星星的知识卡片',
        debug: {
          searchId: starId,
          availableRecords: allRecords.data.map(record => ({
            _id: record._id,
            starId: record.starId,
            title: record.title
          }))
        }
      }
    }
    
    return {
      success: true,
      data: result.data[0]
    }
  } catch (error) {
    console.error('获取北斗星知识卡片失败:', error)
    return {
      success: false,
      message: '获取知识卡片失败',
      error: error.message
    }
  }
}

// 获取所有北斗星知识卡片
async function getBeidouCards(event, wxContext) {
  try {
    const result = await db.collection('beidou_cards')
      .orderBy('starId', 'asc')
      .get()
    
    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('获取北斗星知识卡片列表失败:', error)
    return {
      success: false,
      message: '获取知识卡片列表失败',
      error: error.message
    }
  }
}

// ========== 后台管理接口 ==========

// 获取所有用户的观测记录 (后台管理)
async function getAllObservations(event, wxContext) {
  const { page = 1, limit = 20, userId = '' } = event
  
  try {
    let query = db.collection('observations')
    
    // 如果指定了用户ID，则只查询该用户的记录
    if (userId) {
      query = query.where({
        openid: userId
      })
    }
    
    // 分页查询
    const result = await query
      .skip((page - 1) * limit)
      .limit(limit)
      .orderBy('createTime', 'desc')
      .get()
    
    // 获取总数
    let totalQuery = db.collection('observations')
    if (userId) {
      totalQuery = totalQuery.where({
        openid: userId
      })
    }
    const countResult = await totalQuery.count()
    
    return {
      success: true,
      data: {
        observations: result.data,
        total: countResult.total,
        page,
        limit
      }
    }
  } catch (error) {
    console.error('获取所有观测记录失败:', error)
    return {
      success: false,
      message: error.message,
      data: []
    }
  }
}

// 删除观测记录 (后台管理)
async function deleteObservationAdmin(event, wxContext) {
  const { observationId } = event
  
  try {
    // 先获取观测记录信息，以便更新用户统计
    const observation = await db.collection('observations').doc(observationId).get()
    
    if (!observation.data) {
      return {
        success: false,
        message: '观测记录不存在'
      }
    }
    
    const openid = observation.data.openid
    
    // 删除观测记录
    const result = await db.collection('observations').doc(observationId).remove()
    
    if (result.stats.removed > 0) {
      // 更新用户观测次数
      await db.collection('users').where({
        openid: openid
      }).update({
        data: {
          observationCount: _.inc(-1)
        }
      })
    }
    
    return {
      success: true,
      message: '观测记录删除成功',
      data: result
    }
  } catch (error) {
    console.error('删除观测记录失败:', error)
    return {
      success: false,
      message: error.message
    }
  }
} 