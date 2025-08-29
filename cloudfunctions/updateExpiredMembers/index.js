const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const chinaDateStr = `${year}-${month}-${day}`;

    // 查询会员等级大于0且过期的用户（中国时区）
    const usersToUpdate = await db.collection('users').where({
      memberLevel: 1,
      expireDate: _.lte(chinaDateStr)
    }).get();

    if (usersToUpdate.data.length === 0) {
      return {
        success: true,
        message: '没有需要更新的过期会员。'
      };
    }

    const updatePromises = usersToUpdate.data.map(user => {
      console.log(`用户 ${user._id} 的会员已过期，将memberLevel设置为0，expireDate设置为null。`);
      return db.collection('users').doc(user._id).update({
        data: {
          memberLevel: 0,
          expireDate: null
        }
      });
    });

    await Promise.all(updatePromises);

    return {
      success: true,
      updatedCount: usersToUpdate.data.length,
      message: `成功更新 ${usersToUpdate.data.length} 个过期会员。`
    };
  } catch (e) {
    console.error('更新过期会员失败:', e);
    return {
      success: false,
      error: e.message
    };
  }
};