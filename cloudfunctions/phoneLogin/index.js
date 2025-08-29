// 手机号登录云函数（新版API）
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action, code } = event

  switch (action) {
    case 'phoneLogin':
      return await phoneLogin(code, wxContext)
    default:
      return {
        success: false,
        message: '未知的操作类型'
      }
  }
}

// 手机号登录处理（新版API）
async function phoneLogin(code, wxContext) {
  try {
    console.log('phoneLogin 开始执行（新版API），参数：', { code: !!code })
    
    if (!code) {
      return {
        success: false,
        errorCode: 'MISSING_PARAMS',
        message: '缺少动态令牌参数'
      }
    }
    
    // 使用新版API获取手机号
    console.log('开始调用 phonenumber.getPhoneNumber，code:', code)
    console.log('云环境信息：', {
      env: cloud.DYNAMIC_CURRENT_ENV,
      hasOpenapi: !!cloud.openapi,
      hasPhoneNumberApi: !!cloud.openapi?.phonenumber?.getPhoneNumber
    })
    
    let phoneResult
    try {
      // 确保云函数环境正确初始化
      if (!cloud.openapi || !cloud.openapi.phonenumber || !cloud.openapi.phonenumber.getPhoneNumber) {
        throw new Error('云函数openapi未正确初始化')
      }
      
      phoneResult = await cloud.openapi.phonenumber.getPhoneNumber({
        code: code
      })
    } catch (apiError) {
      console.error('API调用异常：', {
        error: apiError,
        message: apiError.message,
        stack: apiError.stack,
        name: apiError.name
      })
      return {
        success: false,
        errorCode: 'PHONE_API_FAILED',
        message: `API调用异常：${apiError.message || '未知错误'}`
      }
    }
    
    console.log('phonenumber.getPhoneNumber 结果：', {
      errcode: phoneResult.errcode || phoneResult.errCode,
      errmsg: phoneResult.errmsg || phoneResult.errMsg,
      hasPhoneInfo: !!(phoneResult.phone_info || phoneResult.phoneInfo),
      resultType: typeof phoneResult,
      resultKeys: Object.keys(phoneResult || {}),
      fullResult: phoneResult
    })
    
    // 检查API返回结果的完整性
    if (!phoneResult || typeof phoneResult !== 'object') {
      console.error('API返回结果异常：', phoneResult)
      return {
        success: false,
        errorCode: 'PHONE_API_FAILED',
        message: `API返回结果异常：${typeof phoneResult}`
      }
    }
    
    // 适配微信云调用的字段格式差异：errCode vs errcode
    const errcode = phoneResult.errcode !== undefined ? phoneResult.errcode : phoneResult.errCode
    const errmsg = phoneResult.errmsg || phoneResult.errMsg
    const phoneInfo = phoneResult.phone_info || phoneResult.phoneInfo
    
    // 检查errcode是否存在
    if (errcode === undefined || errcode === null) {
      console.error('API返回结果缺少errcode字段：', phoneResult)
      return {
        success: false,
        errorCode: 'PHONE_API_FAILED',
        message: `API返回结果格式异常：缺少errcode字段`
      }
    }
    
    if (errcode !== 0) {
      console.error('获取手机号失败：', errcode, errmsg)
      
      // 根据微信API错误码返回不同的错误类型
      if (errcode === 40029) {
        // code无效，通常是验证相关问题
        return {
          success: false,
          errorCode: 'PHONE_VERIFICATION_REQUIRED',
          message: '手机号验证失败，请在微信APP中完成手机号验证后重试'
        }
      } else if (errcode === 45011) {
        // API调用频率限制
        return {
          success: false,
          errorCode: 'PHONE_API_RATE_LIMIT',
          message: 'API调用过于频繁，请稍后重试'
        }
      }else if (errcode === 40013) {
        // appid不匹配
        return {
          success: false,
          errorCode: 'invalid appid',
          message: '请求appid身份与获取code的小程序appid不匹配'
        }
      } else {
        // 其他错误
        return {
          success: false,
          errorCode: 'PHONE_API_FAILED',
          message: `获取手机号失败：错误码${errcode}，${errmsg || '未知错误'}`
        }
      }
    }
    
    if (!phoneInfo || !phoneInfo.phoneNumber) {
      return {
        success: false,
        errorCode: 'PHONE_DATA_EMPTY',
        message: '手机号数据为空'
      }
    }
    
    const phoneNumber = phoneInfo.phoneNumber
    const purePhoneNumber = phoneInfo.purePhoneNumber
    const countryCode = phoneInfo.countryCode
    
    console.log('获取到手机号信息：', {
      hasPhoneNumber: !!phoneNumber,
      hasPurePhoneNumber: !!purePhoneNumber,
      countryCode: countryCode
    })
    
    // 获取用户openid（通过云函数上下文）
    const openid = wxContext.OPENID
    
    if (!openid) {
      return {
        success: false,
        errorCode: 'OPENID_FAILED',
        message: '获取用户标识失败'
      }
    }

    // 查询或创建用户
    const userResult = await findOrCreateUser(openid, phoneNumber, purePhoneNumber)
    
    if (!userResult.success) {
      return userResult
    }

    // 生成登录token
    const token = generateToken(userResult.user._id);

    // 返回登录成功信息
    return {
      success: true,
      data: {
        token: token,
        userInfo: {
          id: userResult.user._id,
          phoneNumber: phoneNumber,
          purePhoneNumber: purePhoneNumber,
          countryCode: countryCode,
          _openid: openid,
          nickname: userResult.user.nickname || '',
          avatar: userResult.user.avatar || ''
        }
      },
      message: '登录成功'
    }

  } catch (error) {
    console.error('手机号登录失败：', error)
    
    return {
      success: false,
      message: '登录失败，请重试',
      errorCode: 'INTERNAL_ERROR',
      error: error.message
    }
  }
}

// 查询或创建用户
async function findOrCreateUser(openid, phoneNumber, purePhoneNumber) {
  try {
    // 先查询是否已存在该用户
    const userQuery = await db.collection('users').where({
      _openid: openid
    }).get();
    
    if (userQuery.data.length > 0) {
      // 用户已存在，更新手机号
      const user = userQuery.data[0];
      await db.collection('users').doc(user._id).update({
        data: {
          phoneNumber: phoneNumber,
          purePhoneNumber: purePhoneNumber,
          lastLoginTime: new Date()
        }
      });
      
      return {
        success: true,
        user: {
          ...user,
          phoneNumber: phoneNumber,
          purePhoneNumber: purePhoneNumber
        }
      };
    } else {
      // 用户不存在，创建新用户
      const createResult = await db.collection('users').add({
        data: {
          _openid: openid,
          phoneNumber: phoneNumber,
          purePhoneNumber: purePhoneNumber,
          createTime: new Date(),
          lastLoginTime: new Date(),
          nickname: '',
          avatar: ''
        }
      });
      
      return {
        success: true,
        user: {
          _id: createResult._id,
          _openid: openid,
          phoneNumber: phoneNumber,
          purePhoneNumber: purePhoneNumber,
          nickname: '',
          avatar: ''
        }
      };
    }
  } catch (error) {
    console.error('查询或创建用户失败：', error);
    return {
      success: false,
      errorCode: 'USER_OPERATION_FAILED',
      message: '用户操作失败'
    };
  }
}

// 简单的token生成（实际项目中应该使用更安全的方式）
function generateToken(openid) {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2)
  return Buffer.from(`${openid}_${timestamp}_${randomStr}`).toString('base64')
}