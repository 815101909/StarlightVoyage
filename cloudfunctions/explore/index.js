// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { action } = event
  console.log('云函数收到请求:', event)
  
  switch (action) {
    case 'getArticles':
      return await getArticles(event)
    case 'getArticleDetail':
      return await getArticleDetail(event)
    case 'getVideos':
      return await getVideos(event)
    case 'incrementVideoViews':
      return await incrementVideoViews(event)
    case 'updateVideoDuration':
      return await updateVideoDuration(event)
    default:
      console.error('未知的action:', action)
      return {
        success: false,
        message: '未知操作: ' + action
      }
  }
}

/**
 * 获取文章列表
 */
async function getArticles(event) {
  try {
    const { date, category, page = 1, limit = 10, status } = event
    console.log('获取文章列表参数:', event)
    
    // 构建查询条件
    let whereConditions = {
      status: status || 'published'  // 默认只显示已发布的文章
    }
    
    // 只在有日期参数时添加日期筛选条件
    if (date) {
      // 转换为东八区（UTC+8）的时间范围
      const selectedDate = new Date(date)
      const startTimestamp = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        -8, 0, 0, 0  // 调整为东八区的0点
      ).getTime()
      
      const endTimestamp = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        15, 59, 59, 999  // 调整为东八区的23:59:59.999
      ).getTime()
      
      whereConditions.publishTime = _.gte(startTimestamp).and(_.lte(endTimestamp))
      
      console.log('日期查询条件:', {
        date,
        startTimestamp,
        endTimestamp,
        startDate: new Date(startTimestamp).toISOString(),
        endDate: new Date(endTimestamp).toISOString()
      })
    }
    
    if (category && category !== '全部') {
      whereConditions.category = category
    }
    
    console.log('最终查询条件:', whereConditions)
    
    // 查询文章总数
    const countResult = await db.collection('star_articles')
      .where(whereConditions)
      .count()
    
    console.log('文章总数:', countResult.total)

    // 如果没有数据，直接返回空数组
    if (countResult.total === 0) {
      return {
        success: true,
        data: [],
        total: 0,
        hasMore: false
      }
    }
    
    // 查询文章
    const result = await db.collection('star_articles')
      .where(whereConditions)
      .orderBy('publishTime', 'desc')  // 按发布时间倒序排列
      .skip((page - 1) * limit)
      .limit(limit)
      .get()

    // 处理图片链接
    const articles = result.data
    const fileList = articles
      .filter(article => article.imageUrl && article.imageUrl.startsWith('cloud://'))
      .map(article => article.imageUrl)

    // 批量获取临时链接
    let tempUrls = {}
    if (fileList.length > 0) {
      const { fileList: tempFileList } = await cloud.getTempFileURL({ fileList })
      tempFileList.forEach(file => {
        tempUrls[file.fileID] = file.tempFileURL
      })
    }

    // 更新文章数据中的图片链接
    const processedData = articles.map(article => {
      const processedArticle = { ...article }
      
      // 处理封面图片链接
      if (article.imageUrl && article.imageUrl.startsWith('cloud://')) {
        processedArticle.imageUrl = tempUrls[article.imageUrl] || article.imageUrl
      }
      
      // 确保文章有ID
      if (!processedArticle.id && processedArticle._id) {
        processedArticle.id = processedArticle._id
      }
      
      return processedArticle
    })
    
    console.log('处理后的文章数据:', processedData)
    
    return {
      success: true,
      data: processedData,
      total: countResult.total,
      hasMore: (page * limit) < countResult.total
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
    return {
      success: false,
      message: '获取文章列表失败: ' + error.message,
      error: error
    }
  }
}

/**
 * 获取文章详情
 */
async function getArticleDetail(event) {
  console.log('获取文章详情，参数:', event)
  try {
    const { articleId } = event
    
    if (!articleId) {
      console.error('文章ID为空')
      return {
        success: false,
        message: '文章ID不能为空'
      }
    }
    
    console.log('查询文章详情，ID:', articleId)
    const result = await db.collection('star_articles')
      .doc(articleId)
      .get()
    
    console.log('数据库查询结果:', result)
    
    if (!result.data) {
      console.error('文章不存在，ID:', articleId)
      return {
        success: false,
        message: '文章不存在'
      }
    }

    // 处理图片链接
    if (result.data.imageUrl && result.data.imageUrl.startsWith('cloud://')) {
      console.log('处理云存储图片链接:', result.data.imageUrl)
      const { fileList } = await cloud.getTempFileURL({
        fileList: [result.data.imageUrl]
      })
      if (fileList && fileList[0]) {
        result.data.imageUrl = fileList[0].tempFileURL
        console.log('转换后的图片链接:', result.data.imageUrl)
      }
    }

    // 处理富文本内容中的图片链接
    const processRichTextImages = async (content) => {
      if (!content) return content;
      
      // 提取所有cloud://开头的图片链接
      const imgRegex = /<img[^>]+src="(cloud:\/\/[^"]+)"[^>]*>/g;
      const cloudImages = [];
      let match;
      
      while ((match = imgRegex.exec(content)) !== null) {
        cloudImages.push(match[1]);
      }
      
      if (cloudImages.length > 0) {
        console.log('富文本中发现云存储图片:', cloudImages);
        const { fileList } = await cloud.getTempFileURL({
          fileList: cloudImages
        });
        
        // 替换所有图片链接
        let processedContent = content;
        fileList.forEach(file => {
          processedContent = processedContent.replace(
            new RegExp(file.fileID.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            file.tempFileURL
          );
        });
        
        return processedContent;
      }
      
      return content;
    };

    // 处理音频文件链接
    if (result.data.voice && result.data.voice.startsWith('cloud://')) {
      console.log('处理音频文件链接:', result.data.voice);
      const { fileList } = await cloud.getTempFileURL({
        fileList: [result.data.voice]
      });
      if (fileList && fileList[0]) {
        result.data.voice = fileList[0].tempFileURL;
        console.log('转换后的音频链接:', result.data.voice);
      }
    }

    // 处理所有富文本字段
    result.data.body = await processRichTextImages(result.data.body);
    result.data.content = await processRichTextImages(result.data.content);
    result.data.conclusion = await processRichTextImages(result.data.conclusion);
    
    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
    console.error('完整错误信息:', JSON.stringify(error))
    return {
      success: false,
      message: '获取文章详情失败',
      error: error.message
    }
  }
} 

/**
 * 获取宇宙小剧场视频列表
 */
async function getVideos(event) {
  try {
    const { date, page = 1, limit = 10 } = event
    console.log('获取视频列表参数:', event)
    
    // 构建查询条件
    let whereConditions = {
      status: 'published'  // 默认只显示已发布的视频
    }
    
    // 只在有日期参数时添加日期筛选条件
    if (date) {
      // 转换为东八区（UTC+8）的时间范围
      const selectedDate = new Date(date)
      // 调整为东八区的起始时间（前一天16:00 UTC）
      const startTimestamp = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate() - 1,
        16, 0, 0, 0  // UTC时间，对应东八区的0点
      ).getTime()
      
      // 调整为东八区的结束时间（当天16:00 UTC）
      const endTimestamp = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        16, 0, 0, 0  // UTC时间，对应东八区的第二天0点
      ).getTime()
      
      whereConditions.createdAt = _.gte(startTimestamp).and(_.lte(endTimestamp))
      
      console.log('日期查询条件:', {
        date,
        startTimestamp,
        endTimestamp,
        startDate: new Date(startTimestamp).toISOString(),
        endDate: new Date(endTimestamp).toISOString(),
        startLocal: new Date(startTimestamp + 8 * 3600000).toISOString(),
        endLocal: new Date(endTimestamp + 8 * 3600000).toISOString()
      })
    }
    
    console.log('最终查询条件:', whereConditions)
    
    // 查询视频总数
    const countResult = await db.collection('star_videos')
      .where(whereConditions)
      .count()
    
    console.log('视频总数:', countResult.total)

    // 如果没有数据，直接返回空数组
    if (countResult.total === 0) {
      return {
        success: true,
        data: [],
        total: 0,
        hasMore: false
      }
    }
    
    // 查询视频
    const result = await db.collection('star_videos')
      .where(whereConditions)
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * limit)
      .limit(limit)
      .get()

    console.log('数据库查询结果:', result.data)
    
    // 处理云存储链接
    const videos = result.data
    const fileIDs = []
    
    // 收集需要获取临时链接的云存储ID
    videos.forEach(video => {
      if (video.coverUrl && video.coverUrl.startsWith('cloud://')) {
        fileIDs.push(video.coverUrl)
      }
      if (video.videoUrl && video.videoUrl.startsWith('cloud://')) {
        fileIDs.push(video.videoUrl)
      }
    })

    // 批量获取临时链接
    let tempUrls = {}
    if (fileIDs.length > 0) {
      const { fileList } = await cloud.getTempFileURL({ fileList: fileIDs })
      fileList.forEach(file => {
        tempUrls[file.fileID] = file.tempFileURL
      })
    }

    // 更新视频数据中的链接
    const processedData = videos.map(video => {
      const processedVideo = { ...video }
      
      if (video.coverUrl && video.coverUrl.startsWith('cloud://')) {
        processedVideo.coverUrl = tempUrls[video.coverUrl] || ''
      }
      if (video.videoUrl && video.videoUrl.startsWith('cloud://')) {
        processedVideo.videoUrl = tempUrls[video.videoUrl] || ''
      }
      
      // 确保视频有ID
      if (!processedVideo.id && processedVideo._id) {
        processedVideo.id = processedVideo._id
      }
      
      // 格式化日期显示（转换为东八区）
      if (video.createdAt) {
        const timestamp = video.createdAt + (8 * 3600000) // 加8小时转换为东八区
        const date = new Date(timestamp)
        processedVideo.date = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
        processedVideo.publishTime = processedVideo.date // 兼容前端使用
      }
      
      // 确保视频有标题
      if (!processedVideo.title && processedVideo.videoTitle) {
        processedVideo.title = processedVideo.videoTitle
      }
      
      // 确保视频有描述
      if (!processedVideo.description && processedVideo.videoDescription) {
        processedVideo.description = processedVideo.videoDescription
      }
      
      // 默认浏览量
      if (typeof processedVideo.views !== 'number') {
        processedVideo.views = 0
      }
      
      return processedVideo
    })
    
    console.log('处理后的视频数据:', processedData)
    
    return {
      success: true,
      data: processedData,
      total: countResult.total,
      hasMore: (page * limit) < countResult.total
    }
  } catch (error) {
    console.error('获取视频列表失败:', error)
    return {
      success: false,
      message: '获取视频列表失败: ' + error.message,
      error: error
    }
  }
}

/**
 * 增加视频观看次数
 */
async function incrementVideoViews(event) {
  try {
    const { videoId } = event
    
    if (!videoId) {
      return {
        success: false,
        message: '视频ID不能为空'
      }
    }
    
    // 更新视频观看次数
    await db.collection('star_videos').doc(videoId).update({
      data: {
        views: _.inc(1),  // 增加1次观看
        updatedAt: Date.now()  // 更新时间
      }
    })
    
    return {
      success: true,
      message: '更新观看次数成功'
    }
  } catch (error) {
    console.error('更新视频观看次数失败:', error)
    return {
      success: false,
      message: '更新视频观看次数失败',
      error: error.message
    }
  }
} 

/**
 * 更新视频时长
 */
async function updateVideoDuration(event) {
  try {
    const { videoId, duration } = event
    
    if (!videoId) {
      return {
        success: false,
        message: '视频ID不能为空'
      }
    }
    
    if (typeof duration !== 'number' || duration <= 0) {
      return {
        success: false,
        message: '视频时长无效'
      }
    }
    
    // 更新视频时长
    await db.collection('star_videos').doc(videoId).update({
      data: {
        duration: duration,
        updatedAt: Date.now()
      }
    })
    
    return {
      success: true,
      message: '更新视频时长成功'
    }
  } catch (error) {
    console.error('更新视频时长失败:', error)
    return {
      success: false,
      message: '更新视频时长失败',
      error: error.message
    }
  }
} 