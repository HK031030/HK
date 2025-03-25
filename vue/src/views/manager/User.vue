<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input clearable @clear="load" style="width: 260px; margin-right: 5px" v-model="data.username" placeholder="请输入用户名查询" :prefix-icon="Search"></el-input>
      <el-input clearable @clear="load" style="width: 260px; margin-right: 5px" v-model="data.name" placeholder="请输入姓名查询" :prefix-icon="Search"></el-input>
      <el-button type="primary" @click="load" v-if="canView">查 询</el-button>
      <el-button @click="reset" v-if="canView">重 置</el-button>
    </div>
    <div class="card" style="margin-bottom: 5px" v-if="canEdit">
      <el-button type="primary" @click="handleAdd">新 增</el-button>
      <el-button type="danger" @click="deleteBatch">批量删除</el-button>
    </div>

    <div class="card" style="margin-bottom: 5px">
      <el-table :data="data.tableData" style="width: 100%" @selection-change="handleSelectionChange"
                :header-cell-style="{ color: '#333', backgroundColor: '#eaf4ff' }">
        <el-table-column type="selection" v-if="canEdit" width="55" />
        <el-table-column prop="username" label="账号" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="phone" label="电话" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column label="操作" width="100" v-if="canEdit">
          <template #default="scope">
            <el-button type="primary" icon="Edit" circle @click="handleEdit(scope.row)"></el-button>
            <el-button type="danger" icon="Delete" circle @click="del(scope.row.id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="card">
      <el-pagination
          v-model:current-page="data.pageNum"
          v-model:page-size="data.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[5, 10, 20]"
          :total="data.total"
          @current-change="load"
          @size-change="load"
      />
    </div>

    <el-dialog title="管理员信息" v-model="data.formVisible" width="30%" destroy-on-close>
      <el-form ref="formRef" :model="data.form" :rules="data.rules" label-width="80px" style="padding: 20px 30px 10px 0">
        <el-form-item prop="username" label="用户名">
          <el-input v-model="data.form.username" autocomplete="off" />
        </el-form-item>
        <el-form-item prop="name" label="名称">
          <el-input v-model="data.form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item prop="phone" label="电话">
          <el-input v-model="data.form.phone" autocomplete="off" />
        </el-form-item>
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="data.form.email" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="data.formVisible = false">取 消</el-button>
          <el-button type="primary" @click="save" v-if="canEdit">保 存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import request from "@/utils/request.js";
import { useRoute } from 'vue-router'; // 导入 useRoute

const data = reactive({
  username: null,
  name: null,
  pageNum: 1,
  pageSize: 5,
  total: 0,
  tableData: [],
  formVisible: false,
  form: {},
  rules: {
    username: [
      { required: true, message: '请填写用户名', trigger: 'blur' }
    ],
    name: [
      { required: true, message: '请填写姓名', trigger: 'blur' }
    ],
    phone: [
      { required: true, message: '请填写手机号', trigger: 'blur' }
    ],
    email: [
      { required: true, message: '请填写邮箱', trigger: 'blur' }
    ]
  },
  rows: []
});

const formRef = ref();
const role = ref(JSON.parse(localStorage.getItem('userInfo')).role || 'USER'); // 获取用户角色

// 权限控制
const canView = computed(() => role.value === 'ADMIN' || role.value === 'COACH');
const canEdit = computed(() => role.value === 'ADMIN');

// 加载用户数据
const load = () => {
  request.get('/user/selectPage', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      username: data.username,
      name: data.name
    }
  }).then(res => {
    if (res.code === '200') {
      data.tableData = res.data.records;
      data.total = res.data.total;
    } else {
      ElMessage.error(res.msg);
    }
  });
};

// 重置筛选条件
const reset = () => {
  data.username = null;
  data.name = null;
  load();
};

// 显示新增表单
const handleAdd = () => {
  data.formVisible = true;
  data.form = {};
};

// 新增用户
const add = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      request.post('/user/add', data.form).then(res => {
        if (res.code === '200') {
          data.formVisible = false;
          ElMessage.success('新增成功');
          load();
        } else {
          ElMessage.error(res.msg);
        }
      });
    }
  });
};

// 显示编辑表单
const handleEdit = (row) => {
  data.form = JSON.parse(JSON.stringify(row));
  data.formVisible = true;
};

// 更新用户信息
const update = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      request.post(`/user/update`, data.form).then(res => {
        if (res.code === '200') {
          data.formVisible = false;
          ElMessage.success('修改成功');
          load();
        } else {
          ElMessage.error(res.msg);
        }
      });
    }
  });
};

// 保存用户信息
const save = () => {
  data.form.id ? update() : add();
};

// 删除用户
const del = (id) => {
  ElMessageBox.confirm('删除后无法恢复，您确认删除吗？', '删除确认', { type: 'warning' }).then(() => {
    request.delete('/user/delete/' + id).then(res => {
      if (res.code === '200') {
        ElMessage.success('删除成功');
        load();
      } else {
        ElMessage.error(res.msg);
      }
    });
  }).catch(() => {});
};

// 处理选择变化
const handleSelectionChange = (rows) => {
  data.rows = rows;
};

// 批量删除
const deleteBatch = () => {
  if (data.rows.length === 0) {
    ElMessage.warning('请选择数据');
    return;
  }

  const ids = data.rows.map(row => row.id);
  ElMessageBox.confirm('删除后无法恢复，您确认删除吗？', '删除确认', { type: 'warning' })
      .then(() => {
        request.delete('/user/delete/batch', {
          data: ids
        }).then(res => {
          if (res.code === '200') {
            ElMessage.success('批量删除成功');
            load();
          } else {
            ElMessage.error(res.msg);
          }
        }).catch(() => {
          ElMessage.error('删除请求失败，请稍后再试');
        });
      })
      .catch(() => {
        console.log('用户取消删除操作');
      });
};

// 组件挂载时加载数据并检查路由
const route = useRoute(); // 使用 useRoute 获取当前路由

onMounted(() => {
  load(); // 加载用户数据
  // 检查路由名称
  if (route.name === 'AddUser') {
    handleAdd(); // 调用新增功能
  }
});
</script>

<!--<template>-->
<!--  <div>-->
<!--    <div class="card" style="margin-bottom: 5px">-->
<!--      <el-input clearable @clear="load" style="width: 260px; margin-right: 5px" v-model="data.username" placeholder="请输入用户名查询" :prefix-icon="Search"></el-input>-->
<!--      <el-input clearable @clear="load" style="width: 260px; margin-right: 5px" v-model="data.name" placeholder="请输入姓名查询" :prefix-icon="Search"></el-input>-->
<!--      <el-button type="primary" @click="load">查 询</el-button>-->
<!--      <el-button @click="reset">重 置</el-button>-->
<!--    </div>-->
<!--    <div class="card" style="margin-bottom: 5px">-->
<!--      <el-button type="primary" @click="handleAdd">新 增</el-button>-->
<!--      <el-button type="danger" @click="deleteBatch">批量删除</el-button>-->
<!--    </div>-->

<!--    <div class="card" style="margin-bottom: 5px">-->
<!--      <el-table :data="data.tableData" style="width: 100%" @selection-change="handleSelectionChange"-->
<!--                :header-cell-style="{ color: '#333', backgroundColor: '#eaf4ff' }">-->
<!--        <el-table-column type="selection" width="55" />-->
<!--        <el-table-column prop="username" label="账号" />-->
<!--        <el-table-column prop="name" label="名称" />-->
<!--        <el-table-column prop="phone" label="电话" />-->
<!--        <el-table-column prop="email" label="邮箱" />-->
<!--        <el-table-column label="操作" width="100">-->
<!--          <template #default="scope">-->
<!--            <el-button type="primary" icon="Edit" circle @click="handleEdit(scope.row)"></el-button>-->
<!--            <el-button type="danger" icon="Delete" circle @click="del(scope.row.id)"></el-button>-->
<!--          </template>-->
<!--        </el-table-column>-->
<!--      </el-table>-->
<!--    </div>-->
<!--    <div class="card">-->
<!--      <el-pagination-->
<!--          v-model:current-page="data.pageNum"-->
<!--          v-model:page-size="data.pageSize"-->
<!--          layout="total, sizes, prev, pager, next, jumper"-->
<!--          :page-sizes="[5, 10, 20]"-->
<!--          :total="data.total"-->
<!--          @current-change="load"-->
<!--          @size-change="load"-->
<!--      />-->
<!--    </div>-->

<!--    <el-dialog title="管理员信息" v-model="data.formVisible" width="30%" destroy-on-close>-->
<!--      <el-form ref="formRef" :model="data.form" :rules="data.rules" label-width="80px" style="padding: 20px 30px 10px 0">-->
<!--        <el-form-item prop="username" label="用户名">-->
<!--          <el-input v-model="data.form.username" autocomplete="off" />-->
<!--        </el-form-item>-->
<!--        <el-form-item prop="name" label="名称">-->
<!--          <el-input v-model="data.form.name" autocomplete="off" />-->
<!--        </el-form-item>-->
<!--        <el-form-item prop="phone" label="电话">-->
<!--          <el-input v-model="data.form.phone" autocomplete="off" />-->
<!--        </el-form-item>-->
<!--        <el-form-item prop="email" label="邮箱">-->
<!--          <el-input v-model="data.form.email" autocomplete="off" />-->
<!--        </el-form-item>-->
<!--      </el-form>-->
<!--      <template #footer>-->
<!--        <div class="dialog-footer">-->
<!--          <el-button @click="data.formVisible = false">取 消</el-button>-->
<!--          <el-button type="primary" @click="save">保 存</el-button>-->
<!--        </div>-->
<!--      </template>-->
<!--    </el-dialog>-->
<!--  </div>-->
<!--</template>-->

<!--<script setup>-->
<!--import { reactive, ref } from "vue";-->
<!--import {Search} from "@element-plus/icons-vue";-->
<!--import request from "@/utils/request.js";-->
<!--import {ElMessage, ElMessageBox} from "element-plus";-->

<!--const data = reactive({-->
<!--  username: null,-->
<!--  name: null,-->
<!--  pageNum: 1,-->
<!--  pageSize: 5,-->
<!--  total: 0,-->
<!--  tableData: [],-->
<!--  formVisible: false,-->
<!--  form: {},-->
<!--  rules: {-->
<!--    username: [-->
<!--      { required: true, message: '请填写用户名', trigger: 'blur' }-->
<!--    ],-->
<!--    name: [-->
<!--      { required: true, message: '请填写姓名', trigger: 'blur' }-->
<!--    ],-->
<!--    phone: [-->
<!--      { required: true, message: '请填写手机号', trigger: 'blur' }-->
<!--    ],-->
<!--    email: [-->
<!--      { required: true, message: '请填写邮箱', trigger: 'blur' }-->
<!--    ]-->
<!--  },-->
<!--  rows: []-->
<!--})-->

<!--const formRef = ref()-->

<!--const load = () => {-->
<!--  request.get('/user/selectPage', {-->
<!--    params: {-->
<!--      pageNum: data.pageNum,-->
<!--      pageSize: data.pageSize,-->
<!--      username: data.username,-->
<!--      name: data.name-->
<!--    }-->
<!--  }).then(res => {-->
<!--    if (res.code === '200') {-->
<!--      data.tableData = res.data.records-->
<!--      data.total = res.data.total-->
<!--    } else {-->
<!--      ElMessage.error(res.msg)-->
<!--    }-->
<!--  })-->
<!--}-->
<!--load()-->

<!--const reset = () => {-->
<!--  data.username = null-->
<!--  data.name = null-->
<!--  load()-->
<!--}-->

<!--const handleAdd = () => {-->
<!--  data.formVisible = true-->
<!--  data.form = {}-->
<!--}-->

<!--const add = () => {-->
<!--  // formRef 是表单的引用-->
<!--  formRef.value.validate((valid) => {-->
<!--    if (valid) {   // 验证通过的情况下-->
<!--      request.post('/user/add', data.form).then(res => {-->
<!--        if (res.code === '200') {-->
<!--          data.formVisible = false-->
<!--          ElMessage.success('新增成功')-->
<!--          load()-->
<!--        } else {-->
<!--          ElMessage.error(res.msg)-->
<!--        }-->
<!--      })-->
<!--    }-->
<!--  })-->
<!--}-->

<!--const handleEdit = (row) => {-->
<!--  data.form = JSON.parse(JSON.stringify(row))  // 深度拷贝数据-->
<!--  data.formVisible = true-->
<!--}-->

<!--const update = () => {-->
<!--  // formRef 是表单的引用-->
<!--  formRef.value.validate((valid) => {-->
<!--    if (valid) { // 验证通过的情况下-->
<!--      request.post(`/user/update`, data.form).then(res => {-->
<!--        if (res.code === '200') {-->
<!--          data.formVisible = false;-->
<!--          ElMessage.success('修改成功');-->
<!--          load();-->
<!--        } else {-->
<!--          ElMessage.error(res.msg);-->
<!--        }-->
<!--      });-->
<!--    }-->
<!--  });-->
<!--}-->

<!--const save = () => {-->
<!--  data.form.id ? update() : add()-->
<!--}-->

<!--const del = (id) => {-->
<!--  ElMessageBox.confirm('删除后无法恢复，您确认删除吗？', '删除确认', { type: 'warning' }).then(res => {-->
<!--    request.delete('/user/delete/' + id).then(res => {-->
<!--      if (res.code === '200') {-->
<!--        ElMessage.success('删除成功')-->
<!--        load()-->
<!--      } else {-->
<!--        ElMessage.error(res.msg)-->
<!--      }-->
<!--    })-->
<!--  }).catch(err => {})-->
<!--}-->

<!--const handleSelectionChange = (rows) => {  // rows 就是实际选择的数组-->
<!--  data.rows = rows-->
<!--  console.log(rows)-->
<!--}-->

<!--const deleteBatch = () => {-->
<!--  if (data.rows.length === 0) {-->
<!--    ElMessage.warning('请选择数据');-->
<!--    return;-->
<!--  }-->

<!--  // 提取所有选中行的 ID-->
<!--  const ids = data.rows.map(row => row.id);-->
<!--  console.log('准备删除的 IDs:', ids); // 调试输出-->

<!--  ElMessageBox.confirm('删除后无法恢复，您确认删除吗？', '删除确认', { type: 'warning' })-->
<!--      .then(() => {-->
<!--        // 调用批量删除的 API-->
<!--        request.delete('/user/delete/batch', {-->
<!--          data: ids // 使用 data 发送 ids 数组-->
<!--        })-->
<!--            .then(res => {-->
<!--              console.log('删除响应:', res); // 调试输出-->
<!--              if (res.code === '200') {-->
<!--                ElMessage.success('批量删除成功');-->
<!--                load();-->
<!--              } else {-->
<!--                ElMessage.error(res.msg);-->
<!--              }-->
<!--            })-->
<!--            .catch(error => {-->
<!--              console.error('删除请求失败:', error); // 捕获并打印错误-->
<!--              ElMessage.error('删除请求失败，请稍后再试');-->
<!--            });-->
<!--      })-->
<!--      .catch(err => {-->
<!--        console.log('用户取消删除操作'); // 用户取消操作的日志-->
<!--      });-->
<!--}-->
<!--</script>-->