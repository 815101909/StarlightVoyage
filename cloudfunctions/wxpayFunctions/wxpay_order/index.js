/**
 * 微信支付 - 下单
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { description, amount, planId, planName } = event;

  try {
    // 商户自行生成商户订单号
    const outTradeNo = `MEMBER_${Date.now()}_${Math.round(Math.random() * 10000)}`;

    // 存储订单信息到数据库
    const orderData = {
      _openid: wxContext.OPENID,
      outTradeNo: outTradeNo,
      planId: planId || '',
      planName: planName || '',
      amount: amount.total / 100, // 转换为元
      status: 'pending', // pending, success, failed
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    };

    await db.collection('member_orders').add({
      data: orderData
    });

    // 开发环境模拟支付参数（生产环境需要配置真实的微信支付）
    const isDevelopment = false; // 设置为false启用真实支付
    
    if (isDevelopment) {
      // 模拟支付参数用于开发测试
      const mockPaymentData = {
        timeStamp: String(Math.floor(Date.now() / 1000)),
        nonceStr: Math.random().toString(36).substr(2, 15),
        packageVal: `prepay_id=mock_prepay_${outTradeNo}`,
        paySign: 'mock_pay_sign_' + Math.random().toString(36).substr(2, 10)
      };
      
      return {
        data: mockPaymentData,
        out_trade_no: outTradeNo
      };
    } else {
      // 确保金额参数正确
      const totalFee = parseInt(amount.total); // 确保是整数（分）
      
      console.log('支付参数:', {
        description: description || '小舟摇星河会员服务',
        out_trade_no: outTradeNo,
        total_fee: totalFee,
        amount: amount,
        openid: wxContext.OPENID
      });
      
      // 使用cloudbase_module调用wxpay_order模块（参考原来可正常工作的代码）
      const res = await cloud.callFunction({
        name: 'cloudbase_module',
        data: {
          name: 'wxpay_order',
          data: {
            description: description || '小舟摇星河会员服务',
            amount: {
              total: totalFee, // 订单金额（分）
              currency: 'CNY'
            },
            out_trade_no: outTradeNo, // 商户生成的订单号
            payer: {
              openid: wxContext.OPENID // 服务端云函数中直接获取当前用户openId
            }
          }
        }
      });
      console.log(res.result);
      return res.result;
    }
  } catch (error) {
    console.error('创建支付订单失败:', error);
    return {
      errcode: -1,
      errmsg: error.message || '创建订单失败'
    };
  }
};