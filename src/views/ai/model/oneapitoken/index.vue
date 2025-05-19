<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="令牌名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入令牌名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>

      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-5px"/>
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-5px"/>
          重置
        </el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['ai:oneapitoken:create']"
        >
          <Icon icon="ep:plus" class="mr-5px"/>
          新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">

      <el-table-column label="令牌名称" align="left" prop="name" min-width="120" />

      <el-table-column label="令牌值" align="center" prop="token" min-width="150">
        <template #default="{ row }">
          <el-popover trigger="click" width="auto">
            <template #reference>
              <el-button link type="primary">点击查看</el-button>
            </template>
            <div style="max-width: 300px; word-break: break-all;">{{ row.token }}</div>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column label="过期时间" align="center" prop="expireTime" min-width="120">
        <template #default="{ row }">
          {{ row.expireTime ? formatDate(row.expireTime) : '永久' }}
        </template>
      </el-table-column>

      <el-table-column label="创建时间" align="center" prop="createTime" min-width="120">
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" min-width="120" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['ai:oneapitoken:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['ai:oneapitoken:delete']"
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
  <OneApiTokenForm ref="formRef" @success="getList"/>
</template>

<script setup lang="ts">
import { AiOneApiTokenApi, AiOneApiTokenVO } from '@/api/ai/model/oneapitoken'
import OneApiTokenForm from './OneApiTokenForm.vue'
import { formatDate } from '@/utils/formatTime'

defineOptions({ name: 'AiOneApiToken' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const list = ref<AiOneApiTokenVO[]>([])
const total = ref(0)

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
})

const queryFormRef = ref()

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await AiOneApiTokenApi.getTokenPage(queryParams)
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
    await message.confirm('确定删除该令牌吗？')
    await AiOneApiTokenApi.deleteToken(id)
    message.success('删除成功')
    await getList()
  } catch {
    // 取消删除不做操作
  }
}

onMounted(() => {
  getList()
})
</script>