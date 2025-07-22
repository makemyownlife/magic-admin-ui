<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="750px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      v-loading="formLoading"
      label-width="200px"
    >
      <el-form-item label="客户端KEY" prop="clientKey"  >
        <el-input v-model="formData.clientKey" placeholder="请输入客户端KEY"  :disabled="formType === 'update'"/>
      </el-form-item>

      <el-form-item label="客户端密钥" prop="clientSecret"          >
        <el-input v-model="formData.clientSecret" placeholder="请输入客户端密钥"  :disabled="formType === 'update'"/>
      </el-form-item>

      <el-form-item label="设备类型" prop="deviceType" >
        <el-select v-model="formData.deviceType" placeholder="请选择设备类型" :disabled="formType === 'update'">
          <el-option label="PC后台" :value="0"/>
          <el-option label="APP端" :value="1"/>
        </el-select>
      </el-form-item>

      <el-form-item label="Token访问超时时间（秒）" prop="accessTimeout">
        <el-input v-model="formData.accessTimeout" placeholder="请输入Token访问超时时间（秒）"/>
      </el-form-item>

      <el-form-item label="Token刷新超时时间（秒）" prop="refreshTimeout">
        <el-input v-model="formData.refreshTimeout" placeholder="请输入Token刷新超时时间（秒）"/>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择状态" :disabled="formData.id === 1">
          <el-option label="正常" :value="0"/>
          <el-option label="停用" :value="1"/>
        </el-select>
      </el-form-item>

    </el-form>

    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>

  </Dialog>

</template>

<script setup lang="ts">
import {ClientApi, Client} from '@/api/system/client'

/** 系统客户端 表单 */
defineOptions({name: 'ClientForm'})

const {t} = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  clientKey: undefined,
  clientSecret: undefined,
  grantType: undefined,
  deviceType: undefined,
  accessTimeout: undefined,
  refreshTimeout: undefined,
  status: undefined
})

const formRules = reactive({})
const formRef = ref() // 表单 Ref

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
      formData.value = await ClientApi.getClient(id)
    } finally {
      formLoading.value = false
    }
  }
  else {
    // 新增时自动生成 clientKey 和 clientSecret
    formData.value.clientKey = generateClientKey()
    formData.value.clientSecret = generateClientSecret()
  }
}
defineExpose({open}) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as Client
    if (formType.value === 'create') {
      await ClientApi.createClient(data)
      message.success(t('common.createSuccess'))
    } else {
      await ClientApi.updateClient(data)
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
    clientKey: undefined,
    clientSecret: undefined,
    grantType: undefined,
    deviceType: undefined,
    accessTimeout: undefined,
    refreshTimeout: undefined,
    status: undefined
  }
  formRef.value?.resetFields()
}

/** 生成随机的 clientKey (32位) */
/** 生成随机字符串 */
const generateRandomString = (length: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const crypto = window.crypto || (window as any).msCrypto
  const values = new Uint32Array(length)
  crypto.getRandomValues(values)
  for (let i = 0; i < length; i++) {
    result += chars[values[i] % chars.length]
  }
  return result
}

/** 生成随机的 clientKey (32位) */
const generateClientKey = () => {
  return generateRandomString(32)
}

/** 生成随机的 clientSecret */
const generateClientSecret = () => {
  return generateRandomString(64)
}

</script>