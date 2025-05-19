<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      v-loading="formLoading"
    >
      <el-form-item label="令牌名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入令牌名称" />
      </el-form-item>

      <el-form-item label="模型列表" prop="modelIds">
        <el-select
          v-model="formData.modelIds"
          filterable
          clearable
          multiple
          placeholder="请选择该令牌可访问的模型"
          @change="updateModelList"
        >
          <el-option
            v-for="model in allModels"
            :key="model.id"
            :label="model.model"
            :value="model.id"
          />
        </el-select>

        <div class="mt-10px" v-if="formData.modelIds?.length">
          <el-tag
            v-for="modelId in formData.modelIds"
            :key="modelId"
            class="mr-5px mb-5px"
          >
            {{ getModelName(modelId) }}
          </el-tag>
        </div>
      </el-form-item>

      <el-form-item label="过期时间" prop="expireTime">
        <el-date-picker
          v-model="formData.expireTime"
          type="datetime"
          placeholder="选择过期时间"
          value-format="x"
          :disabled-date="disabledDate"
        />
        <span class="ml-10px text-gray-500">留空表示永不过期</span>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { AiOneApiTokenApi, AiOneApiTokenVO } from '@/api/ai/model/oneapitoken'
import { ModelApi, ModelVO } from '@/api/ai/model/model'
import { formatDate } from '@/utils/formatTime'

defineOptions({ name: 'OneApiTokenForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')

const formData = ref<AiOneApiTokenVO>({
  id: undefined,
  name: '',
  token: '',
  modelIds: [],
  expireTime: undefined
})

const formRules = reactive({
  name: [{ required: true, message: '令牌名称不能为空', trigger: 'blur' }],
  expireTime: [{ required: true, message: '过期时间不能为空', trigger: 'blur' }]
})

const formRef = ref()
const allModels = ref<ModelVO[]>([])

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()

  // 加载模型列表
  allModels.value = await ModelApi.getModelSimpleList()

  // 修改时加载数据
  if (id) {
    formLoading.value = true
    try {
      const data = await AiOneApiTokenApi.getToken(id)
      formData.value = {
        ...data
      }
    } finally {
      formLoading.value = false
    }
  }
}

/** 提交表单 */
const emit = defineEmits(['success'])

const submitForm = async () => {
  await formRef.value.validate()
  formLoading.value = true

  try {
    const data = {
      ...formData.value,
      // 将数组转换为逗号分隔的字符串
     //  modelIds: formData.value.modelIds?.join(',') , 还是传 array 类型
    }

    if (formType.value === 'create') {
      await AiOneApiTokenApi.createToken(data)
      message.success(t('common.createSuccess'))
    } else {
      await AiOneApiTokenApi.updateToken(data)
      message.success(t('common.updateSuccess'))
    }

    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: '',
    token: '',
    modelIds: [],
    expireTime: undefined
  }
  formRef.value?.resetFields()
}

/** 根据ID获取模型名称 */
const getModelName = (id: number) => {
  return allModels.value.find(m => m.id === id)?.model || ''
}

/** 更新模型列表显示 */
const updateModelList = () => {
  // 可以在这里添加额外的逻辑
}

/** 禁用过去的日期 */
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
}

defineExpose({ open })
</script>