const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action } = event

  try {
    switch (action) {
      case 'createMemberOrder':
        return await createMemberOrder(event, wxContext)
      case 'getMemberInfo':
        return await getMemberInfo(wxContext)
      case 'updateMemberStatus':
        return await updateMemberStatus(event, wxContext)
      case 'getMemberPlans':
        return await getMemberPlans()
      case 'handlePaymentCallback':
        return await handlePaymentCallback(event)
      case 'checkMemberExpiry':
        return await checkMemberExpiry(wxContext)
      default:
        return {
          success: false,
          message: '未知操作'
        }
    }
  } catch (error) {
    console.error('会员系统错误:', error)
    return {
      success: false,
      message: '服务器错误',
      error: error.message
    }
  }
}

// 创建会员订单
async function createMemberOrder(event, wxContext) {
  const { planId, planName, amount } = event
  const openid = wxContext.OPENID

  try {
    // 1. 创建订单记录
    const order = {
      _openid: openid,
      planId,
      planName,
      amount,
      status: 'pending', // pending, success, failed
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    }

    const orderResult = await db.collection('member_orders').add({
      data: order
    })

    // 2. 调用微信支付统一下单
    const result = await cloud.cloudPay.unifiedOrder({
      body: `小舟摇星河-${planName}`,
      outTradeNo: orderResult._id,
      spbillCreateIp: event.clientIp || '127.0.0.1',
      subMchId: 'YOUR_SUB_MCH_ID', // 替换为您的子商户号
      totalFee: amount * 100,
      envId: cloud.DYNAMIC_CURRENT_ENV,
      functionName: 'member',
      nonceStr: generateNonceStr(),
      tradeType: 'JSAPI'
    })

    // 3. 返回支付参数
    return {
      success: true,
      data: {
        orderId: orderResult._id,
        payment: result
      }
    }
  } catch (error) {
    console.error('创建订单失败:', error)
    return {
      success: false,
      message: error.message || '创建订单失败'
    }
  }
}

// 处理支付回调
async function handlePaymentCallback(event) {
  try {
    const { orderId, transactionId } = event

    // 1. 查询订单
    const order = await db.collection('member_orders').doc(orderId).get()
    if (!order.data) {
      throw new Error('订单不存在')
    }

    // 2. 更新订单状态
    await db.collection('member_orders').doc(orderId).update({
      data: {
        status: 'success',
        'paymentInfo.transactionId': transactionId,
        'paymentInfo.payTime': db.serverDate(),
        updateTime: db.serverDate()
      }
    })

    // 3. 更新用户会员状态
    const expireDate = calculateExpireDate(order.data.planId)
    await db.collection('users').where({
      _openid: order.data._openid
    }).update({
      data: {
        memberLevel: 1,
        expireDate: expireDate,
        updateTime: db.serverDate()
      }
    })
    console.log('handlePaymentCallback: 更新用户会员状态成功，memberLevel:', 1, 'expireDate:', expireDate);

    // 4. 发送订阅消息
    await sendSubscribeMessage(order.data._openid, {
      orderId: orderId,
      planName: order.data.planName,
      expireDate: expireDate
    })

    return {
      success: true,
      message: '支付成功'
    }
  } catch (error) {
    console.error('处理支付回调失败:', error)
    return {
      success: false,
      message: error.message || '处理支付回调失败'
    }
  }
}

// 生成随机字符串
function generateNonceStr(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 发送订阅消息
async function sendSubscribeMessage(openid, data) {
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: openid,
      templateId: 'YOUR_TEMPLATE_ID', // 替换为您的订阅消息模板ID
      page: 'pages/member_center/member_center',
      data: {
        thing1: { value: data.planName }, // 会员类型
        time2: { value: data.expireDate }, // 到期时间
        thing3: { value: '会员开通成功' }, // 开通状态
        thing4: { value: '感谢您的支持' } // 备注
      }
    })
    return result
  } catch (error) {
    console.error('发送订阅消息失败:', error)
    return error
  }
}

// 获取会员信息
async function getMemberInfo(wxContext) {
  const openid = wxContext.OPENID

  try {
    const userInfo = await db.collection('users')
      .where({
        _openid: openid
      })
      .get()

    if (!userInfo.data || userInfo.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    const member = userInfo.data[0]
    return {
      success: true,
      data: {
        memberLevel: member.memberLevel || 0,
        expireDate: member.expireDate || null,
        memberPrivileges: getMemberPrivileges(member.memberLevel)
      }
    }
  } catch (error) {
    console.error('获取会员信息失败:', error)
    return {
      success: false,
      message: '获取会员信息失败'
    }
  }
}

// 更新会员状态
async function updateMemberStatus(event, wxContext) {
  const { orderId, status } = event
  const openid = wxContext.OPENID

  try {
    // 1. 获取订单信息
    const orderInfo = await db.collection('member_orders')
      .doc(orderId)
      .get()

    if (!orderInfo.data) {
      return {
        success: false,
        message: '订单不存在'
      }
    }

    const order = orderInfo.data

    // 2. 更新订单状态
    await db.collection('member_orders')
      .doc(orderId)
      .update({
        data: {
          status: status,
          updateTime: db.serverDate()
        }
      })

    // 3. 如果支付成功，更新会员状态
    if (status === 'success') {
      // 获取用户当前会员信息
      const userInfo = await db.collection('users')
        .where({
          _openid: openid
        })
        .get()
      
      let expireDate, memberExpireDate
      
      if (userInfo.data && userInfo.data.length > 0) {
        const currentUser = userInfo.data[0]
        const now = new Date(new Date().getTime() + 8 * 60 * 60 * 1000)
        
        // 如果用户已有会员且未过期，在现有基础上延长
        if (currentUser.memberExpireDate && new Date(currentUser.memberExpireDate) > now) {
          expireDate = calculateExpireDateFromBase(order.planId, currentUser.memberExpireDate)
          memberExpireDate = new Date(expireDate + 'T23:59:59+08:00')
        } else {
          // 如果用户没有会员或已过期，从今天开始计算
          expireDate = calculateExpireDate(order.planId)
          memberExpireDate = new Date(expireDate + 'T23:59:59+08:00')
        }
      } else {
        // 新用户，从今天开始计算
        expireDate = calculateExpireDate(order.planId)
        memberExpireDate = new Date(expireDate + 'T23:59:59+08:00')
      }
      
      await db.collection('users')
        .where({
          _openid: openid
        })
        .update({
          data: {
            memberLevel: 1,
            expireDate: expireDate,
            memberExpireDate: memberExpireDate,
            updateTime: db.serverDate()
          }
        })
    }

    return {
      success: true,
      message: '更新成功'
    }
  } catch (error) {
    console.error('更新会员状态失败:', error)
    return {
      success: false,
      message: '更新会员状态失败'
    }
  }
}

// 获取会员方案列表
async function getMemberPlans() {
  try {
    // 从数据库获取会员套餐列表
    const result = await db.collection('memberPlans')
      .orderBy('price', 'asc') // 按价格升序排列
      .get();
    
    return {
      success: true,
      data: {
        plans: result.data
      }
    }
  } catch (error) {
    console.error('获取会员方案失败:', error)
    return {
      success: false,
      message: '获取会员方案失败'
    }
  }
}

// 获取会员权益
function getMemberPrivileges(memberLevel) {
  const privileges = {
    0: ['基础内容访问', '基础功能使用'],
    1: ['无广告浏览', '专属内容访问', '高级功能使用', '专属客服服务'],
    2: ['全部权益', 'VIP专属内容', '优先体验新功能', '24小时专属客服']
  }

  return privileges[memberLevel] || privileges[0]
}

// 计算会员过期时间
// 检查会员是否过期
async function checkMemberExpiry(wxContext) {
  const openid = wxContext.OPENID

  try {
    const userInfo = await db.collection('users')
      .where({
        _openid: openid
      })
      .get()

    if (!userInfo.data || userInfo.data.length === 0) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    const user = userInfo.data[0]
    // 使用中国时区（UTC+8）获取当前时间
    const currentDate = new Date(new Date().getTime() + 8 * 60 * 60 * 1000)
    const expireDate = user.expireDate
    const memberExpireDate = user.memberExpireDate
    const memberLevel = user.memberLevel || 0

    // 如果用户有会员等级且有过期时间
    if (memberLevel > 0 && (memberExpireDate || expireDate)) {
      // 优先使用memberExpireDate，如果没有则使用expireDate（使用中国时区）
      const expireDateObj = memberExpireDate ? new Date(memberExpireDate) : new Date(expireDate + 'T23:59:59+08:00')
      if (currentDate > expireDateObj) {
        // 会员已过期，更新memberLevel为0
        await db.collection('users').where({
          _openid: openid
        }).update({
          data: {
            memberLevel: 0,
            expireDate: null,
            memberExpireDate: null,
            updateTime: db.serverDate()
          }
        })

        return {
          success: true,
          expired: true,
          message: '会员已过期，已更新状态',
          data: {
              memberLevel: 0,
              expireDate: expireDate,
              memberExpireDate: memberExpireDate ? new Date(new Date(memberExpireDate).getTime() + 8 * 60 * 60 * 1000) : null,
              currentDate: currentDate.toISOString().split('T')[0]
            }
        }
      } else {
        // 会员未过期
        return {
          success: true,
          expired: false,
          message: '会员未过期',
          data: {
              memberLevel: memberLevel,
              expireDate: expireDate,
              memberExpireDate: memberExpireDate ? new Date(new Date(memberExpireDate).getTime() + 8 * 60 * 60 * 1000) : null,
              currentDate: currentDate.toISOString().split('T')[0]
            }
        }
      }
    } else {
      // 用户本身就不是会员
      return {
        success: true,
        expired: false,
        message: '用户非会员',
        data: {
          memberLevel: 0,
          expireDate: null
        }
      }
    }
  } catch (error) {
    console.error('检查会员过期状态失败:', error)
    return {
      success: false,
      message: error.message || '检查会员过期状态失败'
    }
  }
}

function calculateExpireDate(planId) {
  // 使用中国时区（UTC+8）获取当前时间
  const now = new Date(new Date().getTime() + 8 * 60 * 60 * 1000)
  const monthsMap = {
    'plan1': 1,
    'plan2': 3,
    'plan3': 6,
    'plan4': 12
  }

  const months = monthsMap[planId] || 1
  now.setMonth(now.getMonth() + months)
  return now.toISOString().split('T')[0]
}

// 基于现有过期日期计算新的过期日期
function calculateExpireDateFromBase(planId, baseExpireDate) {
  const baseDate = new Date(baseExpireDate)
  const monthsMap = {
    'plan1': 1,
    'plan2': 3,
    'plan3': 6,
    'plan4': 12
  }

  const months = monthsMap[planId] || 1
  baseDate.setMonth(baseDate.getMonth() + months)
  return baseDate.toISOString().split('T')[0]
}