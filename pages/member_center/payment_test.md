# 微信支付会员充值功能对接说明

## 功能概述
已成功将 `wxpayFunctions/wxpay_order` 云函数与会员充值页面进行对接，实现完整的会员购买流程。

## 关于 cloudbase_module 问题解决

**问题**: `cloudbase_module` 是微信云开发的扩展模块，用于调用微信支付等第三方服务。

**解决方案**:
1. **开发环境**: 使用模拟支付参数，无需真实配置微信支付
2. **生产环境**: 需要配置真实的微信支付商户信息
3. **依赖更新**: 添加了 `@cloudbase/extension-wxpay` 依赖
4. **API调用**: 改用 `cloud.cloudPay.unifiedOrder` 替代 `cloudbase_module`

## 主要修改内容

### 1. 会员中心页面 (member_center.js)
- **confirmPurchase方法**: 修改支付逻辑，调用 `wxpayFunctions` 云函数创建订单
- **handlePaymentSuccess方法**: 增加订单号参数，调用 `profile` 云函数更新会员状态
- 增强错误处理和用户反馈

### 2. 微信支付云函数 (wxpayFunctions/wxpay_order/index.js)
- 接收会员方案参数 (planId, planName, description, amount)
- 生成唯一订单号格式: `MEMBER_{timestamp}_{random}`
- 将订单信息存储到 `member_orders` 数据库集合
- 返回支付参数和订单号

### 3. Profile云函数 (profile/index.js)
- 新增 `updateMemberStatus` 方法
- 根据会员方案计算过期时间
- 更新用户会员信息到 `users` 集合
- 更新订单状态为成功

## 支付流程

1. **用户选择会员方案** → 点击"立即开通"
2. **创建支付订单** → 调用 `wxpayFunctions` 云函数
3. **获取支付参数** → 返回微信支付所需参数
4. **调起微信支付** → 使用 `wx.requestPayment`
5. **支付成功回调** → 调用 `profile` 云函数更新会员状态
6. **更新本地状态** → 刷新页面显示会员权益

## 数据库结构

### member_orders 集合
```json
{
  "_openid": "用户openid",
  "outTradeNo": "订单号",
  "planId": "会员方案ID",
  "planName": "会员方案名称",
  "amount": "支付金额(元)",
  "status": "订单状态(pending/success/failed)",
  "createTime": "创建时间",
  "updateTime": "更新时间",
  "paymentInfo": {
    "payTime": "支付时间"
  }
}
```

### users 集合新增字段
```json
{
  "memberLevel": 1,
  "memberExpireDate": "会员过期时间",
  "memberPlan": "会员方案ID",
  "memberPlanName": "会员方案名称"
}
```

## 会员方案配置
- **plan1**: 月度会员 (1个月)
- **plan2**: 季度会员 (3个月)
- **plan3**: 半年会员 (6个月)
- **plan4**: 年度会员 (12个月)

## 测试建议

1. **开发环境测试**:
   - 确保云函数已部署
   - 检查数据库集合权限
   - 验证微信支付配置

2. **支付流程测试**:
   - 选择不同会员方案
   - 测试支付成功/失败场景
   - 验证会员状态更新

3. **错误处理测试**:
   - 网络异常情况
   - 支付取消场景
   - 订单创建失败

## 注意事项

1. **微信支付配置**: 需要在微信开发者工具中配置正确的商户号和密钥
2. **云函数权限**: 确保 `wxpayFunctions` 和 `profile` 云函数有数据库读写权限
3. **数据库索引**: 建议为 `member_orders` 集合的 `_openid` 和 `outTradeNo` 字段创建索引
4. **安全性**: 订单金额验证应在服务端进行，防止客户端篡改

## 后续优化建议

1. **支付回调验证**: 增加微信支付回调验证机制
2. **订单查询**: 实现订单状态查询功能
3. **退款功能**: 集成微信支付退款接口
4. **会员权益**: 完善会员权益验证逻辑
5. **订阅消息**: 完善支付成功后的订阅消息推送