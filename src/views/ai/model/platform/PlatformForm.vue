<template>

  <Dialog :title="dialogTitle" v-model="dialogVisible">

    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      v-loading="formLoading"
    >

      <el-form-item label="所属平台" prop="platform">
        <el-select v-model="formData.platform" placeholder="请输入平台" clearable >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.AI_PLATFORM)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="平台名字" prop="name">
        <el-input v-model="formData.name" placeholder="请输入平台名字" />
      </el-form-item>

      <el-form-item label="api访问地址" prop="name">
        <el-input v-model="formData.baseUrl" placeholder="请输入 API 请求地址" />
      </el-form-item>

      <el-form-item label="apiKey" prop="name">
        <el-input v-model="formData.apiKey" placeholder="请输入 APIKEY" />
      </el-form-item>

      <!-- =========================   所选模型列表 start  =========================  -->

      <el-form-item label="模型" prop="modelIds">
        <el-select v-model="formData.modelIds" filterable clearable multiple placeholder="请选择平台支持的模型" @change='doModelMapping'>
           <el-option
              v-for="model in modelList"
              :key="model.id"
              :label="model.model"
              :value="model.id"
           />
        </el-select>

        <!-- 添加的模型映射表格 -->
        <el-table
          :data="formData.modelMappings"
          style="width: 100%; margin-top: 15px"
          border
          v-if="formData.modelMappings.length > 0"
        >
          <el-table-column prop="model" label="模型名" width="200" />
          <el-table-column label="映射名">
            <template #default="{ row }">
              <el-input
                v-model="row.mappingName"
                placeholder="请输入映射名"
              />
            </template>
          </el-table-column>
        </el-table>

      </el-form-item>

      <!-- =========================   所选模型列表 end  =========================  -->

      <el-form-item label="模型排序" prop="sort">
        <el-input-number v-model="formData.sort" placeholder="请输入排序" class="!w-1/1" />
      </el-form-item>

      <el-form-item label="开启状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>

    </el-form>

    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>

  </Dialog>

</template>

<script setup lang="ts">

import { CommonStatusEnum } from '@/utils/constants'

import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'

import {PlatformApi, PlatformVO} from "@/api/ai/model/platform";

import {ModelApi, ModelVO} from "@/api/ai/model/model";

/** API 模型的表单 */
defineOptions({ name: 'PlatformForm' })

const { t } = useI18n() // 国际化

const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示

const dialogTitle = ref('') // 弹窗的标题

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用

const formType = ref('') // 表单的类型：create - 新增；update - 修改

const formData = ref({
  id: undefined,
  modelIds: undefined,
  modelMappings: [] as Array<{id: number, model: string, mappingName: string}>,
  name: undefined,
  platform: undefined,
  apiKey: undefined,
  baseUrl: undefined,
  sort: undefined,
  status: CommonStatusEnum.ENABLE
})

const formRules = reactive({
  name: [{ required: true, message: '模型名字不能为空', trigger: 'blur' }],
  platform: [{ required: true, message: '平台不能为空', trigger: 'blur' }],
  modelIds: [{ required: true, message: '模型不能为空', trigger: 'blur' }],
  apiKey: [{ required: true, message: 'apiKey不能为空', trigger: 'blur' }],
  baseUrl: [{ required: true, message: 'API地址不能为空', trigger: 'blur' }],
  sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
})

const formRef = ref() // 表单 Ref

const modelList = ref([] as ModelVO[]) // 模型列表

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await PlatformApi.getPlatform(id)
    } finally {
      formLoading.value = false
    }
  }
  // 获得模型下拉列表
  modelList.value = await ModelApi.getModelSimpleList()

  // 渲染模型映射
  doModelMapping()
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调

const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as PlatformVO
    if (formType.value === 'create') {
      await PlatformApi.createPlatform(data)
      message.success(t('common.createSuccess'))
    } else {
      await PlatformApi.updatePlatform(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    modelIds: undefined,
    modelMappings: [], // 确保这里包含 modelMappings
    platform: undefined,
    apiKey: undefined,
    sort: undefined,
    status: CommonStatusEnum.ENABLE
  }
  formRef.value?.resetFields()
}
/** 渲染 模型重定向 **/
const doModelMapping = () => {
  console.log("重新渲染 模型重定向!")

  const selectedIds = formData.value.modelIds || []

  const modelMappings = formData.value.modelMappings

  // 创建新的映射列表
  const newMappings = selectedIds.map(id => {
    const existingMapping = modelMappings.find(m => m.id === id)
    if (existingMapping) {
      // 保留现有映射，确保使用 mappingName
      return {
        id: existingMapping.id,
        model: existingMapping.model,
        mappingName: existingMapping.mappingName // 明确使用 mappingName
      }
    }

    const model = modelList.value.find(m => m.id === id)
    return {
      id: id,
      model: model?.model || '',
      mappingName: model?.model || '' // 默认映射名为模型名
    }
  })

  modelMappings.value = newMappings
  formData.value.modelMappings = newMappings
}

</script>
