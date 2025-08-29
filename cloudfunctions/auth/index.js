// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const userCollection = db.collection('users')

// 用户集合结构
/*
{
  _id: 'openid',  // 使用openid作为文档id
  nickName: '用户昵称',
  avatar: '头像URL',
  signature: '个性签名',
  phoneNumber: '手机号', // 手机号（通过手机号登录时存储）
  tags: ['amateur', 'photographer'], // 用户标签
  learningGoal: 'basic', // 学习目标
  memberLevel: 0, // 会员等级
  expireDate: null, // 会员过期时间
  checkinDays: 0, // 总打卡天数
  continuousDays: 0, // 连续打卡天数
  groupCount: 0, // 小组数量
  favorites: [], // 收藏列表
  lastCheckinDate: null, // 最后打卡日期
  monthlyCheckins: {}, // 月度打卡记录
  createdAt: serverDate, // 创建时间
  updatedAt: serverDate, // 更新时间
}
*/

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  switch (event.action) {
    case 'getOpenid':
      return {
        success: true,
        data: {
          openid: openid,
          appid: wxContext.APPID,
          unionid: wxContext.UNIONID,
        }
      }
    case 'getProfile':
      return await getProfile(openid)
    case 'updateProfile':
      return await updateProfile(openid, event.profileData)
    default:
      return {
        success: false,
        message: '未知的操作类型'
      }
  }
}

// 生成唯一的用户ID
async function generateUniqueUserId() {
  let userId;
  let isUnique = false;
  
  while (!isUnique) {
    // 生成8位随机数字
    const randomNum = Math.floor(10000000 + Math.random() * 90000000);
    userId = `XH_${randomNum}`;
    
    // 检查是否已存在
    const existingUser = await db.collection('users').where({
      userId: userId
    }).get();
    
    if (existingUser.data.length === 0) {
      isUnique = true;
    }
  }
  
  return userId;
}

// 获取用户信息
async function getProfile(openid) {
  try {
    // 先查询是否存在用户
    const users = await db.collection('users').where({
      _openid: openid
    }).get();

    // 如果找到用户
    if (users.data && users.data.length > 0) {
    return {
      success: true,
        data: users.data[0]
    };
    }

    // 如果没有找到用户，创建新用户（默认7天试用会员）
    const trialExpireDateTime = new Date();
    trialExpireDateTime.setDate(trialExpireDateTime.getDate() + 7); // 7天后过期
    
    // 格式化为YYYY-MM-DD格式的日期字符串
    const trialExpireDateStr = trialExpireDateTime.toISOString().split('T')[0];
    
    // 生成唯一的用户ID
    const userId = await generateUniqueUserId();
    
    const newUser = {
      _openid: openid,
      userId: userId, // 添加唯一用户ID
      nickName: "小舟用户",
      avatar: "",
      signature: "",
      tags: [],
      learningGoal: "",
      memberLevel: 1, // 设置为试用会员
      expireDate: trialExpireDateStr, // 7天试用期（YYYY-MM-DD格式）
      memberExpireDate: trialExpireDateTime, // 详细的日期时间
      checkinDays: 0,
      continuousDays: 0,
      groupCount: 0,
      favorites: [],
      lastCheckinDate: null,
      monthlyCheckins: {},
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    };

    // 创建新用户记录
        await db.collection('users').add({
          data: newUser
        });

        return {
          success: true,
          data: newUser
        };

  } catch (error) {
    console.error('获取用户信息失败：', error);
    return {
      success: false,
      message: '获取用户信息失败'
    };
  }
}

// 更新用户信息
async function updateProfile(openid, profileData) {
  try {
    // 数据验证
    if (!profileData) {
      return {
        success: false,
        message: '更新数据不能为空'
      };
    }
    
    // 必填字段验证
    if (!profileData.nickName) {
      return {
        success: false,
        message: '昵称不能为空'
      };
    }

    // 数据类型验证
    const validData = {
      nickName: String(profileData.nickName),
      signature: String(profileData.signature || ''),
      avatar: String(profileData.avatar || ''),
      phoneNumber: profileData.phoneNumber ? String(profileData.phoneNumber) : undefined,
      tags: Array.isArray(profileData.tags) ? profileData.tags : [],
      learningGoal: String(profileData.learningGoal || ''),
      memberLevel: Number(profileData.memberLevel || 0),
      expireDate: profileData.expireDate || null,
      checkinDays: Number(profileData.checkinDays || 0),
      continuousDays: Number(profileData.continuousDays || 0),
      groupCount: Number(profileData.groupCount || 0),
      favorites: Array.isArray(profileData.favorites) ? profileData.favorites : [],
      lastCheckinDate: profileData.lastCheckinDate || null,
      monthlyCheckins: profileData.monthlyCheckins || {},
      updatedAt: db.serverDate()
    };
    
    // 如果phoneNumber为undefined，则从validData中删除该字段
    if (validData.phoneNumber === undefined) {
      delete validData.phoneNumber;
    }

    // 标签验证
    if (validData.tags.length > 3) {
      return {
        success: false,
        message: '标签数量不能超过3个'
      };
    }

    // 会员等级验证
    if (![0, 1, 2].includes(validData.memberLevel)) {
      return {
        success: false,
        message: '无效的会员等级'
      };
    }

    // 更新数据库
    await db.collection('users').where({
      _openid: openid
    }).update({
      data: validData
    });

    return {
      success: true,
      data: validData
    };

  } catch (error) {
    console.error('更新用户信息失败：', error);
    return {
      success: false,
      message: '更新失败，请重试'
    };
  }
}