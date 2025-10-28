// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { action } = event

  try {
    switch (action) {
      case 'getSpaceMapVideos':
        return await getSpaceMapVideos(event)
      case 'getVideosByType':
        return await getVideosByType(event)
      case 'uploadVideo':
        return await uploadVideo(event)
      case 'getA4Content':
        return await getA4Content(event)
      // ========== 新增的视频管理功能 ==========
      case 'getVideos':
        return await getVideos(event)
      case 'getVideoById':
        return await getVideoById(event)
      case 'createVideo':
        return await createVideo(event)
      case 'updateVideo':
        return await updateVideo(event)
      case 'deleteVideo':
        return await deleteVideo(event)
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

// 获取太空地图视频列表
async function getSpaceMapVideos(event) {
  const { type } = event
  
  let query = db.collection('videos').where({
    category: 'space_map',
    status: 'active'
  })
  
  if (type) {
    query = query.where({
      type: type
    })
  }
  
  const result = await query
    .orderBy('order', 'asc')
    .orderBy('createTime', 'desc')
    .limit(10)
    .get()
  
  // 处理视频URL，确保是可访问的云存储URL
  const videos = result.data.map(video => {
    return {
      ...video,
      videoUrl: video.videoFileId ? video.videoFileId : video.videoUrl,
      coverUrl: video.coverFileId ? video.coverFileId : video.coverUrl
    }
  })
  
  return {
    success: true,
    data: videos
  }
}

// 根据类型获取视频
async function getVideosByType(event) {
  const { type } = event
  
  if (!type) {
    return {
      success: false,
      message: '类型参数不能为空'
    }
  }
  
  const result = await db.collection('videos')
    .where({
      type: type,
      status: 'active'
    })
    .orderBy('order', 'asc')
    .orderBy('createTime', 'desc')
    .limit(1)
    .get()
  
  if (result.data.length === 0) {
    return {
      success: false,
      message: '暂无该类型视频'
    }
  }
  
  const video = result.data[0]
  
  // 处理视频URL
  const processedVideo = {
    ...video,
    videoUrl: video.videoFileId ? video.videoFileId : video.videoUrl,
    coverUrl: video.coverFileId ? video.coverFileId : video.coverUrl
  }
  
  return {
    success: true,
    data: processedVideo
  }
}

// 上传视频（管理员功能）
async function uploadVideo(event) {
  const { videoData } = event
  
  const newVideo = {
    ...videoData,
    createTime: new Date(),
    updateTime: new Date(),
    status: 'active'
  }
  
  const result = await db.collection('videos').add({
    data: newVideo
  })
  
  return {
    success: true,
    data: {
      _id: result._id,
      ...newVideo
    }
  }
}

// 获取A4内容
async function getA4Content(event) {
  const { category } = event
  
  try {
    let query = db.collection('a4_contents')
    
    if (category) {
      query = query.where({
        category: category
      })
    }
    
    const result = await query
      .orderBy('order', 'asc')
      .get()
    
    if (!result || result.data.length === 0) {
      return {
        success: false,
        message: '暂无该类别内容'
      }
    }
    
    // 直接返回查询结果
    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('getA4Content错误:', error)
    return {
      success: false,
      message: error.message,
      data: []
    }
  }
}

// ========== 新增的视频管理功能 ==========

// 获取视频列表（支持分页和搜索）
async function getVideos(event) {
  const { skip = 0, limit = 20, search = '' } = event
  
  let query = db.collection('videos')
  
  // 添加搜索条件
  if (search) {
    query = query.where(_.or([
      { title: new RegExp(search, 'i') },
      { type: new RegExp(search, 'i') },
      { category: new RegExp(search, 'i') }
    ]))
  }
  
  const result = await query
    .orderBy('createTime', 'desc')
    .skip(skip)
    .limit(limit)
    .get()
  
  // 处理视频URL
  const videos = result.data.map(video => {
    return {
      ...video,
      videoUrl: video.videoFileId ? video.videoFileId : video.videoUrl,
      coverUrl: video.coverFileId ? video.coverFileId : video.coverUrl
    }
  })
  
  return {
    success: true,
    data: videos,
    total: videos.length
  }
}

// 根据ID获取视频详情
async function getVideoById(event) {
  const { videoId } = event
  
  if (!videoId) {
    return {
      success: false,
      message: '视频ID不能为空'
    }
  }
  
  const result = await db.collection('videos')
    .doc(videoId)
    .get()
  
  if (!result.data) {
    return {
      success: false,
      message: '视频不存在'
    }
  }
  
  const video = {
    ...result.data,
    videoUrl: result.data.videoFileId ? result.data.videoFileId : result.data.videoUrl,
    coverUrl: result.data.coverFileId ? result.data.coverFileId : result.data.coverUrl
  }
  
  return {
    success: true,
    data: video
  }
}

// 创建视频
async function createVideo(event) {
  const { videoData } = event
  
  if (!videoData || !videoData.title || !videoData.type) {
    return {
      success: false,
      message: '视频标题和类型不能为空'
    }
  }
  
  const newVideo = {
    ...videoData,
    createTime: new Date(),
    updateTime: new Date(),
    status: videoData.status || 'active'
  }
  
  const result = await db.collection('videos').add({
    data: newVideo
  })
  
  return {
    success: true,
    data: {
      _id: result._id,
      ...newVideo
    },
    message: '视频创建成功'
  }
}

// 更新视频
async function updateVideo(event) {
  const { videoId, updateData } = event
  
  if (!videoId) {
    return {
      success: false,
      message: '视频ID不能为空'
    }
  }
  
  if (!updateData || Object.keys(updateData).length === 0) {
    return {
      success: false,
      message: '更新数据不能为空'
    }
  }
  
  // 添加更新时间
  const dataToUpdate = {
    ...updateData,
    updateTime: new Date()
  }
  
  try {
    const result = await db.collection('videos')
      .doc(videoId)
      .update({
        data: dataToUpdate
      })
    
    return {
      success: true,
      data: result,
      message: '视频更新成功'
    }
  } catch (error) {
    return {
      success: false,
      message: '视频更新失败: ' + error.message
    }
  }
}

// 删除视频
async function deleteVideo(event) {
  const { videoId } = event
  
  if (!videoId) {
    return {
      success: false,
      message: '视频ID不能为空'
    }
  }
  
  try {
    const result = await db.collection('videos')
      .doc(videoId)
      .remove()
    
    return {
      success: true,
      data: result,
      message: '视频删除成功'
    }
  } catch (error) {
    return {
      success: false,
      message: '视频删除失败: ' + error.message
    }
  }
}