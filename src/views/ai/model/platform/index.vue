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
      <el-form-item label="配置名字" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入配置名字"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>

      <el-form-item label="模型平台" prop="platform">
        <el-input
          v-model="queryParams.platform"
          placeholder="请输入模型平台"
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
          v-hasPermi="['ai:model:create']"
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

      <el-table-column label="平台名" align="center" prop="platform">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.AI_PLATFORM" :value="scope.row.platform"/>
        </template>
      </el-table-column>

      <el-table-column label="配置名称" align="center" prop="platform" min-width="50">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.AI_PLATFORM" :value="scope.row.name"/>
        </template>
      </el-table-column>

      <el-table-column label="baseUrl" align="center" prop="baseUrl" min-width="100" />

      <el-table-column label="模型列表" align="center" prop="baseUrl" min-width="100" >
        <template>
        </template>
      </el-table-column>

      <el-table-column label="模型重定向" align="center" prop="baseUrl">
        <template>
        </template>
      </el-table-column>

      <el-table-column label="排序" align="center" prop="sort" min-width="80"/>

      <el-table-column label="状态" align="center" prop="status" min-width="80">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status"/>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="180" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['ai:model:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['ai:model:delete']"
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
  <PlatformForm ref="formRef" @success="getList"/>

</template>

<script setup lang="ts">

import {PlatformApi, PlatformVO} from '@/api/ai/model/platform'

import PlatformForm from './PlatformForm.vue'

import {DICT_TYPE} from '@/utils/dict'

/** API 厂商配置(绑定) */
defineOptions({name: 'AiPlatform'})

const message = useMessage() // 消息弹窗

const {t} = useI18n() // 国际化

const loading = ref(true) // 列表的加载中

const list = ref<ModelVO[]>([]) // 列表的数据

const total = ref(0) // 列表的总页数

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  model: undefined,
  platform: undefined
})

const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {

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


}

// /** 初始化 **/
// onMounted(async () => {
//   // await getList()
//   // 下面代码可以做其他的事情
// })
</script>
