// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate
const wishesCollection = db.collection('wishes')

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { type, data } = event

  switch (type) {
    case 'add':
      return addWish(data, OPENID)
    case 'list':
      return getWishList(data, OPENID)
    case 'update':
      return updateWish(data, OPENID)
    case 'delete':
      return deleteWish(data, OPENID)
    case 'like':
      return likeWish(data, OPENID)
    default:
      return {
        success: false,
        error: 'Unknown operation type'
      }
  }
}

// 添加愿望
async function addWish(data, openid) {
  try {
    const result = await wishesCollection.add({
      data: {
        _openid: openid,
        content: data.content,
        status: 'active',
        position: {
          x: data.position.x,
          y: data.position.y
        },
        starSize: data.starSize,
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
        isPublic: true,
        likes: 0,
        likedBy: []
      }
    })
    return {
      success: true,
      data: result
    }
  } catch (err) {
    return {
      success: false,
      error: err
    }
  }
}

// 获取愿望列表
async function getWishList(data, openid) {
  try {
    const { isPublic } = data || {}
    let query = {
      status: 'active'
    }
    
    // 如果指定了isPublic，则添加到查询条件
    if (typeof isPublic === 'boolean') {
      query.isPublic = isPublic
    }

    const result = await wishesCollection
      .where(query)
      .orderBy('createTime', 'desc')
      .get()

    return {
      success: true,
      data: result.data
    }
  } catch (err) {
    return {
      success: false,
      error: err
    }
  }
}

// 更新愿望
async function updateWish(data, openid) {
  try {
    const { wishId, content, status } = data
    const wish = await wishesCollection.doc(wishId).get()
    
    // 检查是否是愿望创建者
    if (wish.data._openid !== openid) {
      return {
        success: false,
        error: 'No permission'
      }
    }

    const result = await wishesCollection.doc(wishId).update({
      data: {
        content: content,
        status: status,
        updateTime: db.serverDate()
      }
    })

    return {
      success: true,
      data: result
    }
  } catch (err) {
    return {
      success: false,
      error: err
    }
  }
}
// 删除愿望
async function deleteWish(data, openid) {
    const { wishId } = data
  
    // 检查权限
    const wish = await wishesCollection.doc(wishId).get()
    if (!wish.data || wish.data._openid !== openid) {
      throw new Error('无权操作此愿望')
    }
  
    // 直接删除文档
    await wishesCollection.doc(wishId).remove()
  
    return {
      success: true
    }
}


// 点赞功能
async function likeWish(data, openid) {
  try {
    const { wishId } = data
    const wish = await wishesCollection.doc(wishId).get()
    
    // 检查是否已经点赞
    if (wish.data.likedBy.includes(openid)) {
      return {
        success: false,
        error: 'Already liked'
      }
    }

    const result = await wishesCollection.doc(wishId).update({
      data: {
        likes: _.inc(1),
        likedBy: _.push(openid),
        updateTime: db.serverDate()
      }
    })

    return {
      success: true,
      data: result
    }
  } catch (err) {
    return {
      success: false,
      error: err
    }
  }
} 