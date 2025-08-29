// 云开发API调用工具
const app = getApp()

/**
 * 调用云函数的通用方法
 * @param {string} functionName 云函数名称
 * @param {object} data 传递给云函数的数据
 * @returns {Promise} 返回Promise对象
 */
function callCloudFunction(functionName, data = {}) {
  return new Promise((resolve, reject) => {
    if (!app.globalData.useCloudAPI) {
      reject(new Error('云开发未启用'))
      return
    }

    if (!wx.cloud) {
      reject(new Error('wx.cloud 未初始化'))
      return
    }

    wx.cloud.callFunction({
      name: functionName,
      data: data,
      success: res => {
        // 统一返回格式
        if (res.result) {
          if (res.result.success === false) {
            reject(new Error(res.result.message || '云函数执行失败'))
          } else if (res.result.success === true) {
            resolve(res.result)
          } else {
            // 如果没有success字段，包装一下返回格式
            resolve({
              success: true,
              data: res.result
            })
          }
        } else {
          reject(new Error('云函数返回数据格式错误'))
        }
      },
      fail: err => {
        console.error('云函数调用失败:', functionName, err)
        reject(err)
      }
    })
  })
}

/**
 * 上传文件到云存储
 * @param {string} cloudPath 云存储路径
 * @param {string|Buffer} filePath 本地文件路径或文件内容
 * @returns {Promise}
 */
function uploadToCloud(cloudPath, filePath) {
  return new Promise((resolve, reject) => {
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath,
      success: res => {
        console.log('文件上传成功:', res)
        resolve(res)
      },
      fail: err => {
        console.error('文件上传失败:', err)
        reject(err)
      }
    })
  })
}

/**
 * 从云存储下载文件
 * @param {string} fileID 文件ID
 * @returns {Promise}
 */
function downloadFromCloud(fileID) {
  return new Promise((resolve, reject) => {
    wx.cloud.downloadFile({
      fileID: fileID,
      success: res => {
        console.log('文件下载成功:', res)
        resolve(res)
      },
      fail: err => {
        console.error('文件下载失败:', err)
        reject(err)
      }
    })
  })
}

/**
 * 删除云存储文件
 * @param {Array} fileList 文件ID列表
 * @returns {Promise}
 */
function deleteFromCloud(fileList) {
  return new Promise((resolve, reject) => {
    wx.cloud.deleteFile({
      fileList: fileList,
      success: res => {
        console.log('文件删除成功:', res)
        resolve(res)
      },
      fail: err => {
        console.error('文件删除失败:', err)
        reject(err)
      }
    })
  })
}

// 用户认证相关API
const authAPI = {
  // 用户登录
  login(userInfo) {
    return callCloudFunction('auth', {
      action: 'login',
      userInfo: userInfo
    })
  },

  // 获取用户信息
  getUserInfo() {
    return callCloudFunction('auth', {
      action: 'getUserInfo'
    })
  },

  // 更新用户资料
  updateProfile(profileData) {
    return callCloudFunction('auth', {
      action: 'updateProfile',
      profileData: profileData
    })
  }
}

// 星图相关API
const starmapAPI = {
  // 获取星图列表
  getStarMaps(params = {}) {
    return callCloudFunction('starmap', {
      action: 'getStarMaps',
      ...params
    })
  },

  // 获取星图详情
  getStarMapDetail(starMapId) {
    return callCloudFunction('starmap', {
      action: 'getStarMapDetail',
      starMapId: starMapId
    })
  },

  // 获取星座信息
  getConstellations(params = {}) {
    return callCloudFunction('starmap', {
      action: 'getConstellations',
      ...params
    })
  },

  // 获取恒星信息
  getStars(params = {}) {
    return callCloudFunction('starmap', {
      action: 'getStars',
      ...params
    })
  },

  // 获取星宿卡片列表
  getXingxiuCards(params = {}) {
    return callCloudFunction('starmap', {
      action: 'getXingxiuCards',
      ...params
    })
  },

  // 获取星宿详情
  getXingxiuDetail(xingxiuId, name) {
    return callCloudFunction('starmap', {
      action: 'getXingxiuDetail',
      xingxiuId: xingxiuId,
      name: name
    })
  },

  // 获取星宿功能数据
  getXingxiuFunctions(params = {}) {
    return callCloudFunction('starmap', {
      action: 'getXingxiuFunctions',
      ...params
    })
  },

  // 获取星宿功能详情
  getXingxiuFunctionDetail(functionId, title) {
    return callCloudFunction('starmap', {
      action: 'getXingxiuFunctionDetail',
      functionId: functionId,
      title: title
    })
  },

  // 获取星宿表达数据
  getXingxiuExpressions(params = {}) {
    return callCloudFunction('starmap', {
      action: 'getXingxiuExpressions',
      ...params
    })
  },

  // 获取星宿表达详细信息
  getXingxiuExpressionDetail(params) {
    return callCloudFunction('starmap', {
      action: 'getXingxiuExpressionDetail',
      ...params
    })
  }
}

// 观测记录相关API
const observationAPI = {
  // 创建观测记录
  createObservation(observationData) {
    return callCloudFunction('observation', {
      action: 'createObservation',
      observationData: observationData
    })
  },

  // 获取观测记录列表
  getObservations(params = {}) {
    return callCloudFunction('observation', {
      action: 'getObservations',
      ...params
    })
  },

  // 获取观测记录详情
  getObservationDetail(observationId) {
    return callCloudFunction('observation', {
      action: 'getObservationDetail',
      observationId: observationId
    })
  },

  // 更新观测记录
  updateObservation(observationId, updateData) {
    return callCloudFunction('observation', {
      action: 'updateObservation',
      observationId: observationId,
      updateData: updateData
    })
  },

  // 删除观测记录
  deleteObservation(observationId) {
    return callCloudFunction('observation', {
      action: 'deleteObservation',
      observationId: observationId
    })
  },

  // 上传观测照片
  uploadPhoto(fileData, fileName) {
    return callCloudFunction('observation', {
      action: 'uploadPhoto',
      fileData: fileData,
      fileName: fileName
    })
  },

  // 获取单个北斗星知识卡片
  getBeidouCard(starId) {
    return callCloudFunction('observation', {
      action: 'getBeidouCard',
      starId: starId
    })
  },

  // 获取所有北斗星知识卡片
  getBeidouCards() {
    return callCloudFunction('observation', {
      action: 'getBeidouCards'
    })
  }
}

// 视频相关API
const videoAPI = {
  // 获取太空地图视频
  getSpaceMapVideos(type) {
    return callCloudFunction('video', {
      action: 'getSpaceMapVideos',
      type: type
    })
  },

  // 根据类型获取视频
  getVideosByType(type) {
    console.log('前端API调用 - getVideosByType - 输入参数:', { type });
    
    return callCloudFunction('video', {
      action: 'getVideosByType',
      type: type
    }).then(res => {
      console.log('前端API调用 - getVideosByType - 云函数返回结果:', res);
      return res;
    }).catch(err => {
      console.error('前端API调用 - getVideosByType - 调用失败:', err);
      throw err;
    });
  },

  // 获取A4内容
  getA4Content(category) {
    return callCloudFunction('video', {
      action: 'getA4Content',
      category: category
    })
  },

  // 上传视频（管理员功能）
  uploadVideo(videoData) {
    return callCloudFunction('video', {
      action: 'uploadVideo',
      videoData: videoData
    })
  }
}

// 图片内容检测
const contentAPI = {
  // 检测图片内容
  checkImageContent(fileID) {
    return callCloudFunction('checkImageContent', {
      fileID: fileID
    })
  }
}

// 探索页面相关API
const exploreAPI = {
  // 获取文章列表
  getArticles(params = {}) {
    return callCloudFunction('explore', {
      action: 'getArticles',
      ...params
    })
  },

  // 获取视频列表
  getVideos(params = {}) {
    return callCloudFunction('explore', {
      action: 'getVideos', 
      ...params
    })
  },

  // 记录视频播放
  recordVideoPlay(params = {}) {
    return callCloudFunction('explore', {
      action: 'recordVideoPlay',
      ...params
    })
  },

  // 获取文章详情
  getArticleDetail(id) {
    return callCloudFunction('explore', {
      action: 'getArticleDetail',
      id: id
    })
  },

  // 获取视频详情
  getVideoDetail(id) {
    return callCloudFunction('explore', {
      action: 'getVideoDetail',
      id: id
    })
  },

  // 搜索文章
  searchArticles(params = {}) {
    return callCloudFunction('explore', {
      action: 'searchArticles',
      ...params
    })
  }
}

module.exports = {
  callCloudFunction,
  uploadToCloud,
  downloadFromCloud,
  deleteFromCloud,
  authAPI,
  starmapAPI,
  observationAPI,
  videoAPI,
  contentAPI,
  exploreAPI
}