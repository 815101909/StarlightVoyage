// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 获取临时文件URL
    const fileID = event.fileID;
    let fileURL;
    
    if (fileID.startsWith('cloud://') || fileID.startsWith('https://')) {
      // 已经是云存储ID或URL
      fileURL = fileID;
    } else {
      // 本地临时文件，需要先上传到云存储获取URL
      const uploadResult = await cloud.uploadFile({
        cloudPath: `temp_check/${Date.now()}.jpg`,
        fileContent: Buffer.from(wx.getFileSystemManager().readFileSync(fileID), 'binary')
      });
      fileURL = uploadResult.fileID;
    }
    
    // 调用微信内容安全接口进行图片审核
    const result = await cloud.openapi.security.imgSecCheck({
      media: {
        contentType: 'image/jpg',
        value: fileURL
      }
    });
    
    // 如果是临时上传的文件，审核后删除
    if (!event.fileID.startsWith('cloud://') && !event.fileID.startsWith('https://')) {
      await cloud.deleteFile({
        fileList: [fileURL]
      });
    }
    
    // 返回审核结果
    return {
      errCode: result.errCode,
      errMsg: result.errMsg
    };
    
  } catch (err) {
    // 内容安全接口错误码 87014 表示内容含有违规信息
    if (err.errCode === 87014) {
      return {
        errCode: 87014,
        errMsg: '图片内容包含违规信息'
      };
    }
    
    // 其他错误
    return {
      errCode: -1,
      errMsg: err.errMsg || '内容检测失败'
    };
  }
} 