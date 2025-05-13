import request from '@/config/axios'

// AI 平台 VO export 是一个关键字，用于将模块（ 变量、函数、类、接口等 ）暴露给其他文件使用。你提供的代码片段中有两种导出方式：
export interface PlatformVO {
  id: number // 编号
  platform: string // 模型平台
  name: string // 平台名称
  modelMappingJson: string // 模型映射
  baseUrl: string // api请求地址
  sort: number // 排序
  status: number // 状态
}

// AI 平台配置
export const PlatformApi = {

  // 分页
  getPlatformPage: async (params: any) => {
    return await request.get({ url: `/ai/platform/page`, params })
  },

  // 详情
  getPlatform: async (id: number) => {
    return await request.get({ url: `/ai/platform/get?id=` + id })
  },

  // 新增
  createPlatform: async (data: PlatformVO) => {
    return await request.post({ url: `/ai/platform/create`, data })
  },

  // 修改
  updatePlatform: async (data: PlatformVO) => {
    return await request.put({ url: `/ai/platform/update`, data })
  },

  // 删除模型
  deletePlatform: async (id: number) => {
    return await request.delete({ url: `/ai/platform/delete?id=` + id })
  }

}
