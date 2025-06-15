# 晓视界微信小程序API接口文档

## 1. 星河页面 (star页面)

### 1.1 太空地图视频
- **URL**: `/api/star/videos`
- **方法**: GET
- **参数**: `type` (宇宙/星系/天体/地球)
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "videoUrl": "视频URL",
    "title": "宇宙结构探索",
    "duration": 120,
    "coverUrl": "封面URL"
  }
}
```

### 1.2 宇宙知识A4页面
- **URL**: `/api/star/a4content`
- **方法**: GET
- **参数**: `category` (宇宙结构/天体类型/能量与场/我们在哪)
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "imageUrl": "A4页面URL",
    "title": "宇宙结构",
    "description": "内容描述"
  }
}
```

### 1.3 获取打卡状态
- **URL**: `/api/starcheckin/status`
- **方法**: GET
- **认证**: Bearer Token
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "hasCheckedIn": true,
    "continuousDays": 7,
    "totalDays": 15
  }
}
```

### 1.4 打卡正能量语句
- **URL**: `/api/profile/checkin/quotes`
- **方法**: GET
- **参数**: `date` (可选，默认当天)
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "date": "2023-12-15",
    "quote": "仰望星空，脚踏实地，探索宇宙的奥秘",
    "author": "卡尔·萨根"
  }
}
```

### 1.5 星河打卡记录
- **URL**: `/api/starcheckin/history`
- **方法**: GET
- **认证**: Bearer Token
- **参数**: `month`, `year` (可选)
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "date": "2023-12-01",
        "checkedIn": true,
        "celestialId": 12
      }
    ],
    "continuousDays": 15,
    "totalDays": 45
  }
}
```

### 1.6 星河天体打卡解锁
- **URL**: `/api/starcheckin/unlock`
- **方法**: POST
- **认证**: Bearer Token
- **参数**: `celestialId` (天体ID)
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "unlocked": true,
    "celestial": {
      "id": 12,
      "name": "火星",
      "type": "planet",
      "description": "火星介绍"
    }
  }
}
```

## 2. 观测页面 (observe页面)

### 2.1 北斗七星A4页面
- **URL**: `/api/observe/beidou/a4content`
- **方法**: GET
- **参数**: `star` (天枢/天璇/天玑/天权/玉衡/开阳/瑶光)
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "imageUrl": "A4页面URL",
    "title": "天枢星",
    "description": "天枢星介绍"
  }
}
```

### 2.2 朗读音频
- **URL**: `/api/observe/audio`
- **方法**: GET
- **参数**: `star` (天枢/天璇/天玑/天权/玉衡/开阳/瑶光)
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "audioUrl": "音频URL",
    "duration": 60,
    "title": "天枢星介绍"
  }
}
```

### 2.3 观测地点管理
- **URL**: `/api/observe/locations`
- **方法**: GET/POST/DELETE
- **认证**: Bearer Token
- **响应示例(GET)**:
```json
{
  "success": true,
  "data": {
    "locations": [
      {
        "id": "loc1",
        "name": "城市郊外",
        "latitude": 39.9042,
        "longitude": 116.4074,
        "description": "光污染较少的观测地点"
      }
    ]
  }
}
```
- **参数(POST)**:
  - `name`: 地点名称
  - `latitude`: 纬度
  - `longitude`: 经度
  - `description`: 描述

### 2.4 望远镜使用指南
- **URL**: `/api/observe/telescope/guides`
- **方法**: GET
- **参数**: `type` (望远镜类型)
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "title": "反射式望远镜使用指南",
    "content": "使用步骤详细内容",
    "images": [
      {
        "url": "图片URL",
        "description": "图片说明"
      }
    ]
  }
}
```

## 3. 星空页面 (sky页面)

### 3.1 华夏星空星图
- **URL**: `/api/sky/chinese/starmap`
- **方法**: GET
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "imageUrl": "星图URL",
    "description": "华夏星空介绍",
    "title": "华夏星空图"
  }
}
```

### 3.2 28星宿卡片
- **URL**: `/api/sky/xingxiu/cards`
- **方法**: GET
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "id": "xs1",
        "name": "角宿",
        "coverUrl": "封面URL",
        "description": "简短描述"
      }
    ]
  }
}
```

### 3.3 星宿详情页
- **URL**: `/api/sky/xingxiu/detail`
- **方法**: GET
- **参数**: `id` (星宿ID)
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "imageUrl": "A4图片URL",
    "name": "角宿",
    "description": "详细介绍",
    "stars": ["角宿一", "角宿二"],
    "mythology": "相关神话"
  }
}
```

### 3.4 星宿功能
- **URL**: `/api/sky/xingxiu/functions`
- **方法**: GET
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "id": "func1",
        "title": "导航功能",
        "imageUrl": "A4图片URL",
        "description": "功能介绍"
      }
    ]
  }
}
```

### 3.5 星象表达
- **URL**: `/api/sky/expressions`
- **方法**: GET
- **参数**: `type` (文学/占星/神话)
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "id": "expr1",
        "title": "诗词中的星空",
        "imageUrl": "A4图片URL",
        "description": "内容介绍"
      }
    ]
  }
}
```

### 3.6 星座运势
- **URL**: `/api/sky/horoscope`
- **方法**: GET
- **参数**: `sign` (星座名称), `date` (可选)
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "sign": "白羊座",
    "date": "2023-12-15",
    "content": "今日运势内容...",
    "lucky": {
      "color": "红色",
      "number": 7
    }
  }
}
```

### 3.7 天文历
- **URL**: `/api/sky/calendar`
- **方法**: GET
- **参数**: `date` (可选，默认当月)
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "month": 12,
    "year": 2023,
    "events": [
      {
        "date": "2023-12-14",
        "title": "双子座流星雨极大",
        "description": "每小时可见流星120颗左右"
      }
    ]
  }
}
```

## 4. 探索页面 (explore页面)

### 4.1 天文文章
- **URL**: `/api/explore/articles`
- **方法**: GET
- **参数**: `type` (天文时事/天文回顾)、`page`、`limit`
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "art1",
        "title": "韦伯望远镜最新发现",
        "coverUrl": "封面URL",
        "tags": ["太空望远镜", "发现"],
        "date": "2023-12-01",
        "hasAudio": true
      }
    ],
    "total": 56,
    "page": 1,
    "limit": 10
  }
}
```

### 4.2 文章详情
- **URL**: `/api/explore/article/detail`
- **方法**: GET
- **参数**: `id` (文章ID)
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "art1",
    "title": "韦伯望远镜最新发现",
    "content": "文章内容HTML",
    "author": "作者",
    "date": "2023-12-01",
    "images": [
      {
        "url": "图片URL",
        "description": "图片描述"
      }
    ],
    "textBoxes": [
      {
        "title": "知识点",
        "content": "相关知识"
      }
    ]
  }
}
```

### 4.3 文章朗读音频
- **URL**: `/api/explore/article/audio`
- **方法**: GET
- **参数**: `id` (文章ID)
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "audioUrl": "音频URL",
    "duration": 180,
    "title": "文章标题"
  }
}
```

### 4.4 文章A4打印页
- **URL**: `/api/explore/article/print`
- **方法**: GET
- **参数**: `id` (文章ID)
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "imageUrl": "A4打印页URL",
    "title": "文章标题",
    "pdfUrl": "PDF下载URL"
  }
}
```

### 4.5 文章习题
- **URL**: `/api/explore/article/exercises`
- **方法**: GET
- **参数**: `id` (文章ID)
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "exercises": [
      {
        "id": "q1",
        "question": "问题内容",
        "options": ["选项A", "选项B", "选项C", "选项D"],
        "correctAnswer": 0
      }
    ]
  }
}
```

### 4.6 习题数据
- **URL**: `/api/exercises/list`
- **方法**: GET
- **参数**:
  - `type`: 习题类型
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "exercises": [
      {
        "id": "q1",
        "question": "问题内容",
        "options": ["选项A", "选项B", "选项C"],
        "correctAnswer": 0,
        "explanation": "解释"
      }
    ]
  }
}
```

### 4.7 提交答案
- **URL**: `/api/exercises/submit`
- **方法**: POST
- **认证**: Bearer Token
- **参数**:
  - `exerciseId`: 习题ID
  - `answer`: 用户答案
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "isCorrect": true,
    "explanation": "答案解释"
  }
}
```

### 4.8 宇宙小剧场
- **URL**: `/api/explore/videos`
- **方法**: GET
- **参数**: `page`、`limit`
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "videos": [
      {
        "id": "vid1",
        "title": "黑洞的形成",
        "thumbnailUrl": "缩略图URL",
        "date": "2023-12-01",
        "duration": 240
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10
  }
}
```

### 4.9 上传视频
- **URL**: `/api/explore/video/upload`
- **方法**: POST
- **认证**: Bearer Token
- **参数**:
  - 视频文件
  - `title`: 视频标题
  - `description`: 视频描述
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "videoId": "vid10",
    "url": "视频URL",
    "thumbnailUrl": "缩略图URL"
  }
}
```

### 4.10 批量获取文章
- **URL**: `/api/articles/batch`
- **方法**: POST
- **参数**:
  - `ids`: 文章ID数组
- **响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "art1",
      "title": "文章标题",
      "coverUrl": "封面URL",
      "author": "作者",
      "date": "2023-12-01",
      "intro": "文章简介",
      "views": 1200,
      "likes": 56
    }
  ]
}
```

### 4.11 收藏文章
- **URL**: `/api/article/bookmark`
- **方法**: POST
- **认证**: Bearer Token
- **参数**:
  - `articleId`: 文章ID
- **响应示例**:
```json
{
  "success": true,
  "message": "收藏成功"
}
```

### 4.12 公众号文章同步
- **URL**: `/api/wechat/articles/sync`
- **方法**: GET
- **参数**: `page`, `limit`
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "mp1",
        "title": "公众号文章标题",
        "url": "原文链接",
        "publishDate": "2023-12-01",
        "coverUrl": "封面图片"
      }
    ]
  }
}
```

## 5. 个人中心 (profile页面)

### 5.1 获取用户资料
- **URL**: `/api/user/profile`
- **方法**: GET
- **认证**: Bearer Token
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "nickName": "星空探索者",
    "avatarUrl": "图片URL",
    "userId": "10086",
    "memberLevel": 1,
    "expireDate": "2023-12-31",
    "checkinDays": 15,
    "groupCount": 3,
    "tags": ["amateur", "photographer"]
  }
}
```

### 5.2 用户登录
- **URL**: `/api/login`
- **方法**: POST
- **参数**:
  - `code`: 微信登录code
  - `userInfo`: 用户信息
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "token": "用户认证token"
  }
}
```

### 5.3 手机号登录
- **URL**: `/api/login/phone`
- **方法**: POST
- **参数**:
  - `code`: 微信登录code
  - `encryptedData`: 加密的手机号数据
  - `iv`: 加密向量
- **响应示例**: 与普通登录相同

### 5.4 更新用户资料
- **URL**: `/api/user/update-profile`
- **方法**: POST
- **认证**: Bearer Token
- **参数**:
  - `nickName`: 昵称
  - `learningGoal`: 学习目标
  - `tags`: 标签数组
- **响应示例**:
```json
{
  "success": true,
  "message": "更新成功"
}
```

### 5.5 上传头像
- **URL**: `/api/user/upload-avatar`
- **方法**: POST
- **认证**: Bearer Token
- **参数**:
  - 图片文件
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "avatarUrl": "头像URL"
  }
}
```

### 5.6 获取会员信息
- **URL**: `/api/user/member-info`
- **方法**: GET
- **认证**: Bearer Token
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "memberLevel": 1,
    "expireDate": "2023-12-31",
    "memberPrivileges": ["特权1", "特权2"]
  }
}
```

### 5.7 获取会员宣传图片
- **URL**: `/api/member/promotion-image`
- **方法**: GET
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "imageUrl": "宣传图片URL"
  }
}
```

### 5.8 获取会员方案
- **URL**: `/api/member/plans`
- **方法**: GET
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "plan1",
        "name": "月度会员",
        "price": 15.00,
        "originalPrice": 30.00,
        "period": "1个月",
        "recommended": false
      }
    ]
  }
}
```

### 5.9 创建会员订单
- **URL**: `/api/payment/create-member-order`
- **方法**: POST
- **认证**: Bearer Token
- **参数**:
  - `planId`: 会员方案ID
  - `planName`: 会员方案名称
  - `amount`: 支付金额
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "timeStamp": "1606975899",
    "nonceStr": "随机字符串",
    "package": "prepay_id=xxx",
    "signType": "MD5",
    "paySign": "签名"
  }
}
```

### 5.10 会员宣传A4页面
- **URL**: `/api/profile/member/promotion`
- **方法**: GET
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "imageUrl": "A4宣传图URL",
    "title": "会员专享权益",
    "description": "宣传内容"
  }
}
```

### 5.11 会员方案列表
- **URL**: `/api/profile/member/plans`
- **方法**: GET
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "plan1",
        "name": "月度会员",
        "price": 15.00,
        "originalPrice": 30.00,
        "period": "1个月",
        "features": ["特权1", "特权2"]
      }
    ]
  }
}
```

### 5.12 获取近期活动
- **URL**: `/api/user/activities`
- **方法**: GET
- **认证**: Bearer Token
- **参数**:
  - `limit`: 获取记录数量
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": "act1",
        "type": "read",
        "title": "阅读了《探索宇宙奥秘》",
        "time": "今天 14:30"
      }
    ]
  }
}
```

### 5.13 收藏夹内容列表
- **URL**: `/api/user/bookmarks`
- **方法**: GET
- **认证**: Bearer Token
- **参数**: `type` (文章/视频/A4页面)
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "bookmarks": [
      {
        "id": "bm1",
        "type": "article",
        "title": "探索宇宙奥秘",
        "coverUrl": "封面URL",
        "date": "2023-12-01"
      }
    ]
  }
}
```

### 5.14 系统消息
- **URL**: `/api/system/messages`
- **方法**: GET
- **认证**: Bearer Token
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "sys001",
        "title": "系统公告",
        "content": "内容",
        "date": "2023-12-05",
        "time": "15:30",
        "isRead": false,
        "type": "notice"
      }
    ]
  }
}
```

### 5.15 标记消息已读
- **URL**: `/api/system/message/read`
- **方法**: POST
- **认证**: Bearer Token
- **参数**:
  - `messageId`: 消息ID
- **响应示例**:
```json
{
  "success": true,
  "message": "标记成功"
}
```

### 5.16 系统通知设置
- **URL**: `/api/user/notification/settings`
- **方法**: GET/POST
- **认证**: Bearer Token
- **响应示例(GET)**:
```json
{
  "success": true,
  "data": {
    "settings": {
      "newArticle": true,
      "newVideo": true,
      "activity": true,
      "checkin": false
    }
  }
}
```
- **参数(POST)**:
  - `settings`: 通知设置对象
- **响应示例(POST)**:
```json
{
  "success": true,
  "message": "设置已更新"
}
```

### 5.17 获取客服二维码
- **URL**: `/api/profile/qrcode`
- **方法**: GET
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "qrCodeUrl": "二维码URL",
    "description": "扫码关注公众号"
  }
}
```

### 5.18 获取社区列表
- **URL**: `/api/community/groups`
- **方法**: GET
- **认证**: Bearer Token
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": "grp1",
        "name": "摄影组",
        "description": "描述",
        "memberCount": 128,
        "checkedInMembers": 98,
        "checkinRate": "76.6%",
        "imageUrl": "图片URL"
      }
    ]
  }
}
```

### 5.19 加入社区
- **URL**: `/api/community/join`
- **方法**: POST
- **认证**: Bearer Token
- **参数**:
  - `groupId`: 社区ID
- **响应示例**:
```json
{
  "success": true,
  "message": "加入成功"
}
```

### 5.20 知识点学习进度
- **URL**: `/api/user/learning/progress`
- **方法**: GET
- **认证**: Bearer Token
- **参数**: `category` (可选)
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "progress": 65,
    "completedTopics": 13,
    "totalTopics": 20,
    "categories": [
      {
        "name": "恒星",
        "progress": 80
      }
    ]
  }
}
```

### 5.21 互动问答功能
- **URL**: `/api/community/qa`
- **方法**: GET/POST
- **认证**: Bearer Token
- **参数(POST)**:
  - `question`: 问题内容
  - `images`: 图片数组(可选)
- **响应示例(GET)**:
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "q123",
        "title": "如何观测木星?",
        "content": "问题详情",
        "createTime": "2023-12-01 14:30",
        "answerCount": 3
      }
    ]
  }
}
```

### 5.22 会员积分系统
- **URL**: `/api/user/points`
- **方法**: GET
- **认证**: Bearer Token
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "points": 560,
    "history": [
      {
        "id": "p123",
        "type": "checkin",
        "points": 10,
        "description": "每日签到",
        "date": "2023-12-15"
      }
    ]
  }
}
```

### 5.23 小组打卡率数据
- **URL**: `/api/groups/checkin-data`
- **方法**: GET
- **响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "groupId": "grp1",
      "checkedInMembers": 98,
      "totalMembers": 128,
      "checkinRate": "76.6%"
    }
  ]
}
```

### 5.24 进入小组学习
- **URL**: `/api/groups/learning`
- **方法**: GET
- **认证**: Bearer Token
- **参数**:
  - `groupId`: 小组ID
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "group": {
      "id": "grp1",
      "name": "摄影组",
      "description": "描述"
    },
    "learningMaterials": [
      {
        "id": "lm1",
        "title": "入门天文摄影技巧",
        "type": "article",
        "coverUrl": "封面URL",
        "duration": 15
      }
    ],
    "userProgress": 35
  }
}
```

## 6. 通用功能

### 6.1 A4打印图片功能
- **URL**: `/api/print/images`
- **方法**: GET
- **响应示例**:
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "id": "img1",
        "title": "星空图",
        "description": "描述",
        "url": "图片URL",
        "downloadUrl": "下载URL"
      }
    ]
  }
}
```

## 天官体系和天医体系接口

### 获取天官体系内容接口

**接口地址：** `GET /api/system/official`

**接口描述：** 获取天官体系的A4页面内容

**响应示例：**
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "title": "天官体系",
    "content": "天官体系的详细内容...",
    "lastUpdated": "2023-01-01T12:00:00Z"
  }
}
```

### 获取天医体系内容接口

**接口地址：** `GET /api/system/medical`

**接口描述：** 获取天医体系的A4页面内容

**响应示例：**
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "title": "天医体系",
    "content": "天医体系的详细内容...",
    "lastUpdated": "2023-01-01T12:00:00Z"
  }
}
```

## 注意事项

1. 天官体系和天医体系的内容管理在后台管理系统中进行
2. 前端只负责展示，不提供上传功能
3. 内容以HTML格式返回，可直接渲染到A4页面中
4. 建议使用CDN加速内容访问

## 安全认证

所有需要认证的接口都应在请求头中添加：
```
Authorization: Bearer {token}
```

其中`{token}`为用户登录后获取的认证令牌。 