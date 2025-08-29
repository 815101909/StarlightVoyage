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
      case 'getStarMaps':
        return await getStarMaps(event)
      case 'getStarMapDetail':
        return await getStarMapDetail(event)
      case 'getConstellations':
        return await getConstellations(event)
      case 'getStars':
        return await getStars(event)
      case 'getXingxiuCards':
        return await getXingxiuCards(event)
      case 'getXingxiuDetail':
        return await getXingxiuDetail(event)
      case 'getXingxiuFunctions':
        return await getXingxiuFunctions(event)
      case 'getXingxiuFunctionDetail':
        return await getXingxiuFunctionDetail(event)
      case 'getXingxiuExpressions':
        return await getXingxiuExpressions(event)
      case 'getXingxiuExpressionDetail':
        return await getXingxiuExpressionDetail(event)
      case 'getA4Content':
        return await getA4Content(event)
      case 'updateUrls':
        return await updateUrls(event)
      case 'getCelestialBodies':
        return await getCelestialBodies(event)
      // 后台管理接口 - 星图
      case 'createStarMap':
        return await createStarMap(event)
      case 'updateStarMap':
        return await updateStarMap(event)
      case 'deleteStarMap':
        return await deleteStarMap(event)
      // 后台管理接口 - 星宿卡片
      case 'createXingxiuCard':
        return await createXingxiuCard(event)
      case 'updateXingxiuCard':
        return await updateXingxiuCard(event)
      case 'deleteXingxiuCard':
        return await deleteXingxiuCard(event)
      case 'doCheckin':
        return await doCheckin(event.OPENID)
      case 'getCheckinInfo':
      default:
        return {
          success: false,
          message: '未知操作: ' + action
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

// 获取星图列表
async function getStarMaps(event) {
  try {
    // 直接从数据库获取所有星图数据
    const result = await db.collection('starmaps').get();
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('getStarMaps错误:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// 获取星图详情
async function getStarMapDetail(event) {
  const { starMapId } = event
  
  const result = await db.collection('starmaps').doc(starMapId).get()
  
  if (!result.data) {
    return {
      success: false,
      message: '星图不存在'
    }
  }
  
  return {
    success: true,
    data: result.data
  }
}

// 获取星座信息
async function getConstellations(event) {
  const { type = 'chinese', limit = 50 } = event
  
  const result = await db.collection('constellations')
    .where({
      type: type
    })
    .limit(limit)
    .get()
  
  return {
    success: true,
    data: result.data
  }
}

// 获取恒星信息
async function getStars(event) {
  const { constellation, magnitude, limit = 100 } = event
  
  let query = db.collection('stars')
  
  if (constellation) {
    query = query.where({
      constellation: constellation
    })
  }
  
  if (magnitude) {
    query = query.where({
      magnitude: _.lte(magnitude)
    })
  }
  
  const result = await query
    .limit(limit)
    .get()
  
  return {
    success: true,
    data: result.data
  }
}

// 获取星宿卡片列表
async function getXingxiuCards(event) {
  const { direction} = event
  
  try {
    let query = db.collection('xingxiu_cards')
    
    if (direction) {
      query = query.where({
        direction: direction
      })
    }
    
    const result = await query
      .orderBy('id', 'asc')
      .get()
    
    // 确保每条数据都包含必要的字段
    const processedData = result.data.map(item => ({
      _id: item._id,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      coverImage: item.coverImage,
      imageUrls: item.imageUrls || [],  // 确保返回imageUrls字段
      order: item.order || 0,
      createTime: item.createTime || Date.now(),
      updateTime: item.updateTime || Date.now()
    }))
    
    return {
      success: true,
      data: processedData
    }
  } catch (error) {
    console.error('getXingxiuCards错误:', error)
    return {
      success: false,
      message: error.message,
      data: []
    }
  }
}

// 获取星宿详情
async function getXingxiuDetail(event) {
  const { xingxiuId, name } = event
  
  try {
    let query = db.collection('xingxiu_cards')
    let rawData = null
    
    if (xingxiuId) {
      try {
        // 通过ID查询 - 先尝试直接文档查询
        const result = await query.doc(xingxiuId).get()
        
        if (result.data) {
          rawData = result.data
        } else {
          // 如果doc查询失败，尝试where查询
          const whereResult = await query.where({
            _id: xingxiuId
          }).get()
          
          if (whereResult.data.length > 0) {
            rawData = whereResult.data[0]
          }
        }
      } catch (docError) {
        // 如果doc查询异常，尝试where查询
        const whereResult = await query.where({
          _id: xingxiuId
        }).get()
        
        if (whereResult.data.length > 0) {
          rawData = whereResult.data[0]
        }
      }
    }
    
    // 如果通过ID没有找到，或者没有提供ID，则通过名称查询
    if (!rawData && name) {
      // 通过名称查询 - 修正字段名为title
      const result = await query.where({
        title: name
      }).get()
      
      if (result.data.length === 0) {
        // 如果通过title查不到，尝试通过name字段查询
        const nameResult = await query.where({
          name: name
        }).get()
        
        if (nameResult.data.length > 0) {
          rawData = nameResult.data[0]
        }
      } else {
        rawData = result.data[0]
      }
    }
    
    // 检查是否找到数据
    if (!rawData) {
      return {
        success: false,
        message: `星宿不存在 - ID: ${xingxiuId}, Name: ${name}`
      }
    }
    
    // 处理返回的数据，返回完整信息包括详情图片
    const processedData = {
      ...rawData,
      imageUrls: rawData.imageUrls || [] // 确保imageUrls是数组
    }
    
    return {
      success: true,
      data: processedData
    }
  } catch (error) {
    console.error('getXingxiuDetail错误:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

// 处理图片URL数组的辅助函数
function processImageUrls(data) {
  // 尝试从多个可能的字段获取图片数组
  let imageUrls = []
  
  // 检查各种可能的字段名
  if (data.imageUrls && Array.isArray(data.imageUrls)) {
    imageUrls = data.imageUrls
  } else if (data.images && Array.isArray(data.images)) {
    imageUrls = data.images
  } else if (data.imageList && Array.isArray(data.imageList)) {
    imageUrls = data.imageList
  } else if (data.detailImages && Array.isArray(data.detailImages)) {
    imageUrls = data.detailImages
  } else if (data.imageUrls && typeof data.imageUrls === 'string') {
    // 如果是字符串，尝试解析JSON
    try {
      imageUrls = JSON.parse(data.imageUrls)
      if (!Array.isArray(imageUrls)) {
        imageUrls = [data.imageUrls]
      }
    } catch (e) {
      imageUrls = [data.imageUrls]
    }
  }
  
  // 过滤空值并确保URL格式正确
  imageUrls = imageUrls.filter(url => url && typeof url === 'string' && url.trim() !== '')
  
  return imageUrls
}

// 获取星宿功能数据
async function getXingxiuFunctions(event) {
  const { category } = event
  
  try {
    let query = db.collection('xingxiu_functions')
    
    // 构建查询条件
    let whereConditions = {
      isActive: true
    };
    
    if (category) {
      whereConditions.category = category;
    }
    
    // 执行查询
    const result = await query
      .where(whereConditions)
      .orderBy('id', 'asc')
      .get()

    // 处理每个功能数据的imageUrls
    const processedData = await Promise.all(result.data.map(async (item) => {
      // 获取详情数据
      const detailResult = await getXingxiuFunctionDetail({ functionId: item._id });
      if (detailResult.success && detailResult.data) {
        return {
          ...item,
          imageUrls: detailResult.data.imageUrls || []
        };
      }
      return item;
    }));
    
    return {
      success: true,
      data: processedData
    }
  } catch (error) {
    console.error('getXingxiuFunctions错误:', error)
    return {
      success: false,
      message: error.message,
      data: []
    }
  }
}

// 获取星宿功能详情
async function getXingxiuFunctionDetail(event) {
  const { functionId } = event;

  try {
    let query = db.collection('xingxiu_functions');
    
    // 通过ID查询
    const result = await query.where({
      _id: functionId
    }).get();
    
    if (result.data.length === 0) {
      return {
        success: false,
        message: `星宿功能不存在 - ID: ${functionId}`
      };
    }
    
    // 返回完整的必要字段
    const rawData = result.data[0];
    const processedData = {
      _id: rawData._id,
      id: rawData.id,
      title: '', // 默认为空
      content: '', // 默认为空
      coverImage: rawData.coverImage,
      imageUrls: [rawData.coverImage], // 改为 imageUrls
      isActive: rawData.isActive
    };
    
    return {
      success: true,
      data: processedData
    };
  } catch (error) {
    console.error('getXingxiuFunctionDetail错误:', error);
    return {
      success: false,
      message: '查询星宿功能详情失败'
    };
  }
}

// 处理功能图片URL数组的辅助函数
function processFunctionImageUrls(data) {
  // 尝试从多个可能的字段获取图片数组
  let imageUrls = []
  
  // 检查各种可能的字段名
  if (data.imageUrls && Array.isArray(data.imageUrls)) {
    imageUrls = data.imageUrls
  } else if (data.images && Array.isArray(data.images)) {
    imageUrls = data.images
  } else if (data.imageList && Array.isArray(data.imageList)) {
    imageUrls = data.imageList
  } else if (data.detailImages && Array.isArray(data.detailImages)) {
    imageUrls = data.detailImages
  } else if (data.imageUrls && typeof data.imageUrls === 'string') {
    // 如果是字符串，尝试解析JSON
    try {
      imageUrls = JSON.parse(data.imageUrls)
      if (!Array.isArray(imageUrls)) {
        imageUrls = [data.imageUrls]
      }
    } catch (e) {
      imageUrls = [data.imageUrls]
    }
  }
  
  // 过滤空值并确保URL格式正确
  imageUrls = imageUrls.filter(url => {
    // 检查是否为有效的字符串
    if (!url || typeof url !== 'string') {
      return false;
    }
    
    // 去除空白字符
    const trimmedUrl = url.trim();
    if (trimmedUrl === '') {
      return false;
    }
    
    // 检查是否为云存储路径
    if (trimmedUrl.startsWith('cloud://')) {
      return true;
    }
    
    // 检查是否为HTTP(S)链接
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return true;
    }
    
    // 检查是否为相对路径
    if (trimmedUrl.startsWith('/')) {
      return true;
    }
    
    return false;
  })

  return imageUrls
}

// 获取星宿表达数据
async function getXingxiuExpressions(event) {
  const { type, limit = 20 } = event
  
  try {
    let query = db.collection('xingxiu_expressions')
    
    // 构建查询条件
    let whereConditions = {
      isActive: true
    };
    
    if (type) {
      whereConditions.type = type; // 'literature', 'astrology', 'mythology'
    }
    
    // 执行查询
    const result = await query
      .where(whereConditions)
      .orderBy('order', 'asc')
      .limit(limit)
      .get()
    
    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('getXingxiuExpressions错误:', error)
    return {
      success: false,
      message: error.message,
      data: []
    }
  }
}

// 获取星宿表达详细信息
async function getXingxiuExpressionDetail(event) {
  const { id, type } = event;
  
  try {
    // 根据ID获取详细信息
    const result = await db.collection('xingxiu_expressions')
      .where({
        _id: id,
        type: type,
        isActive: true
      })
      .get();
    
    if (result.data.length > 0) {
      const item = result.data[0];
      
      // 处理图片URLs
      const processedItem = processExpressionImageUrls(item);
      
      return {
        success: true,
        data: processedItem
      };
    } else {
      return {
        success: false,
        error: '未找到相关数据'
      };
    }
  } catch (error) {
    console.error('获取星宿表达详细信息失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 处理星宿表达的图片URLs
function processExpressionImageUrls(item) {
  // 处理封面图片
  if (item.coverImage && typeof item.coverImage === 'string') {
    if (!item.coverImage.startsWith('cloud://') && !item.coverImage.startsWith('http')) {
      item.coverImage = `cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1330472678/uploads/images/${item.coverImage}`;
    }
  }
  
  // 处理图片数组
  if (item.imageUrls && Array.isArray(item.imageUrls)) {
    item.imageUrls = item.imageUrls.map(url => {
      if (typeof url === 'string') {
        if (!url.startsWith('cloud://') && !url.startsWith('http')) {
          return `cloud://cloud1-1gsyt78b92c539ef.636c-cloud1-1gsyt78b92c539ef-1330472678/uploads/images/${url}`;
        }
        return url;
      }
      return url;
    });
  }
  
  return item;
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
    
    // 处理返回数据
    const processedData = result.data.map(item => ({
      _id: item._id,
      title: item.title,
      description: item.description,
      coverUrl: item.coverUrl,
      imageUrls: item.imageUrls || [],
      order: item.order,
      createTime: item.createTime,
      updateTime: item.updateTime
    }))
    
    return {
      success: true,
      data: processedData
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

// 获取星体列表
async function getCelestialBodies(event) {
  try {
    // 从celestials集合获取数据
    const result = await db.collection('celestials').get();
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('获取星体列表失败:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// ========== 后台管理接口 - 星图 ==========

// 创建星图 (后台管理)
async function createStarMap(event) {
  const { starMapData } = event
  
  try {
    const newStarMap = {
      ...starMapData,
      createTime: new Date(),
      updateTime: new Date()
    }
    
    const result = await db.collection('starmaps').add({
      data: newStarMap
    })
    
    return {
      success: true,
      message: '星图创建成功',
      data: {
        _id: result._id,
        ...newStarMap
      }
    }
  } catch (error) {
    console.error('创建星图失败:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

// 更新星图 (后台管理)
async function updateStarMap(event) {
  const { starMapId, updateData } = event
  
  try {
    const result = await db.collection('starmaps').doc(starMapId).update({
      data: {
        ...updateData,
        updateTime: new Date()
      }
    })
    
    return {
      success: true,
      message: '星图更新成功',
      data: result
    }
  } catch (error) {
    console.error('更新星图失败:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

// 删除星图 (后台管理)
async function deleteStarMap(event) {
  const { starMapId } = event
  
  try {
    const result = await db.collection('starmaps').doc(starMapId).remove()
    
    return {
      success: true,
      message: '星图删除成功',
      data: result
    }
  } catch (error) {
    console.error('删除星图失败:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

// ========== 后台管理接口 - 星宿卡片 ==========

// 创建星宿卡片 (后台管理)
async function createXingxiuCard(event) {
  const { cardData } = event
  
  try {
    const newCard = {
      ...cardData,
      createTime: new Date(),
      updateTime: new Date()
    }
    
    const result = await db.collection('xingxiu_cards').add({
      data: newCard
    })
    
    return {
      success: true,
      message: '星宿卡片创建成功',
      data: {
        _id: result._id,
        ...newCard
      }
    }
  } catch (error) {
    console.error('创建星宿卡片失败:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

// 更新星宿卡片 (后台管理)
async function updateXingxiuCard(event) {
  const { cardId, updateData } = event
  
  try {
    const result = await db.collection('xingxiu_cards').doc(cardId).update({
      data: {
        ...updateData,
        updateTime: new Date()
      }
    })
    
    return {
      success: true,
      message: '星宿卡片更新成功',
      data: result
    }
  } catch (error) {
    console.error('更新星宿卡片失败:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

// 删除星宿卡片 (后台管理)
async function deleteXingxiuCard(event) {
  const { cardId } = event
  
  try {
    const result = await db.collection('xingxiu_cards').doc(cardId).remove()
    
    return {
      success: true,
      message: '星宿卡片删除成功',
      data: result
    }
  } catch (error) {
    console.error('删除星宿卡片失败:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

