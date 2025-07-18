import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 系统客户端信息 */
export interface Client {
          id: number; // 主键ID
          clientKey: string; // 客户端KEY
          clientSecret: string; // 客户端密钥
          grantType: string; // 授权类型
          deviceType: string; // 设备类型
          accessTimeout: number; // Token访问超时时间（秒）
          refreshTimeout: number; // Token刷新超时时间（秒）
          status: string; // 状态（0 正常 1 停用）
  }

// 系统客户端 API
export const ClientApi = {
  // 查询系统客户端分页
  getClientPage: async (params: any) => {
    return await request.get({ url: `/system/client/page`, params })
  },

  // 查询系统客户端详情
  getClient: async (id: number) => {
    return await request.get({ url: `/system/client/get?id=` + id })
  },

  // 新增系统客户端
  createClient: async (data: Client) => {
    return await request.post({ url: `/system/client/create`, data })
  },

  // 修改系统客户端
  updateClient: async (data: Client) => {
    return await request.put({ url: `/system/client/update`, data })
  },

  // 删除系统客户端
  deleteClient: async (id: number) => {
    return await request.delete({ url: `/system/client/delete?id=` + id })
  },

  /** 批量删除系统客户端 */
  deleteClientList: async (ids: number[]) => {
    return await request.delete({ url: `/system/client/delete-list?ids=${ids.join(',')}` })
  },

  // 导出系统客户端 Excel
  exportClient: async (params) => {
    return await request.download({ url: `/system/client/export-excel`, params })
  }
}