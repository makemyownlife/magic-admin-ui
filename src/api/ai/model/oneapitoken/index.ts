import request from '@/config/axios'

// AI OneAPI Token VO
export interface AiOneApiTokenVO {

  id: number // 主键ID (雪花算法)
  modelIds: string // 模型列表
  name: string // 令牌名称
  token: string // 令牌值 (实际API密钥)
  expireTime: Date // 过期时间
  createTime?: Date // 创建时间 (继承自BaseDO)
  updateTime?: Date // 更新时间 (继承自BaseDO)

}

// AI OneAPI Token API
export const AiOneApiTokenApi = {

  // 分页查询
  getTokenPage: async (params: any) => {
    return await request.get({ url: `/ai/oneapitoken/page`, params })
  },

  // 详情
  getToken: async (id: number) => {
    return await request.get({ url: `/ai/oneapitoken/get?id=${id}` })
  },

  // 新增
  createToken: async (data: AiOneApiTokenVO) => {
    return await request.post({ url: `/ai/oneapitoken/create`, data })
  },

  // 修改
  updateToken: async (data: AiOneApiTokenVO) => {
    return await request.put({ url: `/ai/oneapitoken/update`, data })
  },

  // 删除
  deleteToken: async (id: number) => {
    return await request.delete({ url: `/ai/oneapitoken/delete?id=${id}` })
  }

}