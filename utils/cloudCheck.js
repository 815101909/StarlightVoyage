// 云开发环境检测工具
const app = getApp()

/**
 * 检测云开发环境配置
 */
function checkCloudEnvironment() {
  return new Promise((resolve, reject) => {
    console.log('开始检测云开发环境...')
    
    // 检查基础库版本
    const systemInfo = wx.getAppBaseInfo()
    console.log('基础库版本:', systemInfo.SDKVersion)
    
    // 检查云开发是否可用
    if (!wx.cloud) {
      reject(new Error('云开发不可用，请检查基础库版本'))
      return
    }
    
    // 尝试获取云环境信息
    wx.cloud.callFunction({
      name: 'login', // 使用一个简单的测试函数
      data: {},
      success: res => {
        console.log('云环境检测成功:', res)
        resolve({
          success: true,
          message: '云开发环境配置正确',
          data: res
        })
      },
      fail: err => {
        console.error('云环境检测失败:', err)
        
        let errorMessage = '云环境配置错误'
        
        if (err.errMsg.includes('INVALID_ENV')) {
          errorMessage = '环境ID无效，请检查app.js中的env配置'
        } else if (err.errMsg.includes('function not found')) {
          errorMessage = '云函数未找到，请先上传云函数'
        } else if (err.errMsg.includes('no permission')) {
          errorMessage = '权限不足，请检查云函数权限配置'
        }
        
        reject(new Error(errorMessage))
      }
    })
  })
}

/**
 * 获取当前云环境信息
 */
function getCurrentCloudEnv() {
  try {
    // 尝试通过云数据库获取环境信息
    const db = wx.cloud.database()
    console.log('数据库实例:', db)
    
    return {
      hasCloud: !!wx.cloud,
      hasDatabase: !!db
    }
  } catch (error) {
    console.error('获取云环境信息失败:', error)
    return {
      hasCloud: false,
      hasDatabase: false,
      error: error.message
    }
  }
}

/**
 * 测试云函数连接
 */
function testCloudFunction(functionName = 'auth') {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: functionName,
      data: {
        action: 'test'
      },
      success: res => {
        resolve({
          success: true,
          functionName: functionName,
          result: res
        })
      },
      fail: err => {
        reject({
          success: false,
          functionName: functionName,
          error: err
        })
      }
    })
  })
}

/**
 * 显示云开发状态检测结果
 */
function showCloudStatus() {
  const envInfo = getCurrentCloudEnv()
  
  let statusMessage = '云开发状态检测：\n'
  statusMessage += `- 云开发可用: ${envInfo.hasCloud ? '✅' : '❌'}\n`
  statusMessage += `- 数据库可用: ${envInfo.hasDatabase ? '✅' : '❌'}\n`
  statusMessage += `- 当前模式: ${app.globalData.useCloudAPI ? '云开发' : '传统API'}\n`
  
  if (envInfo.error) {
    statusMessage += `- 错误信息: ${envInfo.error}\n`
  }
  
  wx.showModal({
    title: '云开发状态',
    content: statusMessage,
    showCancel: false
  })
}

function getSystemInfo() {
  try {
    // 使用新的API获取系统信息
    const systemInfo = {
      ...wx.getAppBaseInfo(),
      ...wx.getDeviceInfo(),
      ...wx.getSystemSetting(),
      ...wx.getAppAuthorizeSetting()
    };
    return systemInfo;
  } catch (error) {
    console.error('获取系统信息失败:', error);
    return {};
  }
}

module.exports = {
  checkCloudEnvironment,
  getCurrentCloudEnv,
  testCloudFunction,
  showCloudStatus,
  getSystemInfo
}