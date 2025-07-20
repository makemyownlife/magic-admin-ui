<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
    >

      <el-form-item label="客户端KEY" prop="clientKey">
        <el-input
          v-model="queryParams.clientKey"
          placeholder=""
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>

      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>

        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['system:client:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>

      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
        row-key="id"
        v-loading="loading"
        :data="list"
        :stripe="true"
        @selection-change="handleRowCheckboxChange"
    >
    <el-table-column type="selection" width="55" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="客户端KEY" align="center" prop="clientKey" />
      <el-table-column label="设备类型" align="center" prop="deviceType">
        <template #default="{ row }">
          <el-tag>
            {{ formatDeviceType(row.deviceType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Token访问超时时间" align="center" prop="accessTimeout" />
      <el-table-column label="Token刷新超时时间" align="center" prop="refreshTimeout" />
      <el-table-column label="状态" align="center" prop="status" >
        <template #default="{ row }">
          <el-tag>
              {{ formatStatus(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['system:client:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['system:client:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <ClientForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { ClientApi, Client } from '@/api/system/client'
import ClientForm from './ClientForm.vue'

/** 系统客户端 列表 */
defineOptions({ name: 'SystemClient' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<Client[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  clientKey: undefined,
  clientSecret: undefined,
  grantType: undefined,
  deviceType: undefined,
  accessTimeout: undefined,
  refreshTimeout: undefined,
  status: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ClientApi.getClientPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await ClientApi.deleteClient(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除系统客户端 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await ClientApi.deleteClientList(checkedIds.value);
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: Client[]) => {
  checkedIds.value = records.map((item) => item.id);
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await ClientApi.exportClient(queryParams)
    download.excel(data, '系统客户端.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

const formatDeviceType = (type: number) => {
  const deviceTypeMap = {
    0: 'PC后台',
    1: 'APP端'
  }
  return deviceTypeMap[type] || '未知类型'
}

/** 状态格式化 */
const formatStatus = (status: number) => {
  const statusMap = {
    0: '正常',
    1: '停用'
  }
  return statusMap[status] || '未知状态'
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>