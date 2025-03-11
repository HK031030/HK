<template>
  <div>
    <div>
      <el-input style="width: 200px" placeholder="查询标题" v-model="title" />
      <el-button type="primary" style="margin-left: 10px" @click="load(1)" v-if="canView">查询</el-button>
      <el-button type="info" @click="reset" v-if="canView">重置</el-button>
    </div>
    <div style="margin: 10px 0" v-if="canEdit">
      <el-button type="primary" plain @click="handleAdd">新增</el-button>
      <el-button type="danger" plain @click="delBatch">批量删除</el-button>
    </div>
    <el-table
        :data="tableData"
        stripe
        :header-cell-style="{ backgroundColor: 'aliceblue', color: '#666' }"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" v-if="canEdit" width="55" align="center" />
      <el-table-column prop="id" label="序号" width="70" align="center" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="description" label="简介" />
      <el-table-column prop="content" label="内容">
        <template #default="scope">
          <el-button @click="showContent(scope.row.content)" size="small">显示内容</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="详情页">
        <template #default="scope">
          <el-button @click="$router.push('/newsDetail?id=' + scope.row.id)" size="small">在详情页显示</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="author" label="发布人" />
      <el-table-column prop="time" label="发布时间" />
      <el-table-column label="操作" align="center" width="180" v-if="canEdit">
        <template #default="scope">
          <el-button size="small" type="primary" plain @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" plain @click="del(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin: 10px 0">
      <el-pagination
          @current-change="handleCurrentChange"
          :current-page="pageNum"
          :page-size="pageSize"
          layout="total, prev, pager, next"
          :total="total"
      />
    </div>

    <el-dialog
        v-model="fromVisible"
        title="新闻信息"
        width="60%"
        @close="closeDialog"
        :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="80px" style="padding-right: 20px" :rules="rules" ref="formRef">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="标题" />
        </el-form-item>
        <el-form-item label="简介" prop="description">
          <el-input v-model="form.description" placeholder="简介" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <div id="editor"></div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="fromVisible = false">取消</el-button>
          <el-button type="primary" @click="save" v-if="canEdit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
        v-model="fromVisible1"
        title="内容"
        width="60%"
    >
      <el-card class="w-e-text">
        <div v-html="content"></div>
      </el-card>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="fromVisible1 = false">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import WangEditor from 'wangeditor'; // 注意大小写
import hljs from 'highlight.js';
import request from '@/utils/request'; // 假设使用此请求工具

// 响应式变量
const router = useRouter();
const title = ref('');
const tableData = ref([]);
const pageNum = ref(1);
const pageSize = ref(5);
const total = ref(0);
const fromVisible = ref(false);
const formRef = ref(null);
const fromVisible1 = ref(false);
const content = ref('');
const ids = ref([]);
const form = reactive({
  id: '',
  title: '',
  description: '',
  content: '',
  author: '',
  time: ''
});
const editor = ref(null);
// const user = JSON.parse(localStorage.getItem('honey-user') || '{}'); // 假设存储用户信息

// 假设从本地存储或其他方式获取用户角色
const role = ref(JSON.parse(localStorage.getItem('userInfo')).role || 'USER'); // 示例获取角色
console.log("role:", role)

const user = ref(JSON.parse(localStorage.getItem('userInfo')));

// 权限控制
const canView = role.value === 'ADMIN' || role.value === 'COACH'; // ADMIN 和 COACH 可以查看
const canEdit = role.value === 'ADMIN' || role.value === 'COACH'; // ADMIN 和 COACH 可以编辑和删除
console.log("canView,canEdit",canView,canEdit)


// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' }
  ]
};

// 初始化加载数据
onMounted(() => {
  load();
});

// 方法定义
const load = async (newPageNum) => {
  if (newPageNum) pageNum.value = newPageNum;
  try {
    const res = await request.get('/news/selectByPage', {
      params: {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        title: title.value
      }
    });
    console.log('Response from load:', res);
    if (res.code === '200') {
      tableData.value = res.data.records || [];
      total.value = res.data.total || 0;
    } else {
      ElMessage.error(res.msg || '获取数据失败');
    }
  } catch (error) {
    ElMessage.error('获取数据失败');
  }
};

const reset = () => {
  title.value = '';
  load(1);
};

const handleCurrentChange = (newPageNum) => {
  load(newPageNum);
};

const handleSelectionChange = (rows) => {
  ids.value = rows.map(v => v.id);
};

const delBatch = async () => {
  if (!ids.value.length) {
    ElMessage.warning('请选择数据');
    return;
  }
  try {
    await ElMessageBox.confirm('您确认批量删除这些数据吗？', '确认删除', { type: 'warning' });
    const res = await request.delete('/news/delete/batch', { data: ids.value });
    console.log('Response from delBatch:', res);
    if (res.code === '200') {
      ElMessage.success('批量删除成功');
      load(1);
    } else {
      ElMessage.error(res.msg || '批量删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败');
    }
  }
};

const del = async (id) => {
  try {
    await ElMessageBox.confirm('您确认删除吗？', '确认删除', { type: 'warning' });
    const res = await request.delete(`/news/delete/${id}`);
    console.log('Response from del:', res);
    if (res.code === '200') {
      ElMessage.success('删除成功');
      load(1);
    } else {
      ElMessage.error(res.msg || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

const setRichText = () => {
  nextTick(() => {
    editor.value = new WangEditor('#editor');
    editor.value.highlight = hljs;
    editor.value.config.uploadImgServer = `${import.meta.env.VITE_API_URL}/file/editor/upload`;
    editor.value.config.uploadFileName = 'file';
    editor.value.config.uploadImgHeaders = {
      token: user.token
    };
    editor.value.config.uploadImgParams = {
      type: 'img'
    };
    editor.value.config.uploadVideoServer = `${import.meta.env.VITE_API_URL}/file/editor/upload`;
    editor.value.config.uploadVideoName = 'file';
    editor.value.config.uploadVideoHeaders = {
      token: user.token
    };
    editor.value.config.uploadVideoParams = {
      type: 'video'
    };
    editor.value.create();
  });
};

const handleEdit = (row) => {
  Object.assign(form, row); // 深拷贝数据
  fromVisible.value = true;
  setRichText();
  nextTick(() => {
    editor.value.txt.html(row.content); // 设置富文本内容
  });
};

const handleAdd = () => {
  Object.assign(form, {
    id: '',
    title: '',
    description: '',
    content: '',
    author: user.username || '未知用户',
    time: new Date().toISOString().slice(0, 19).replace('T', ' ')
  });
  fromVisible.value = true;
  setRichText();
};

const save = async () => {
  try {
    await formRef.value.validate();
    let content = editor.value.txt.html();
    form.content = content;
    const method = form.id ? 'put' : 'post';
    const url = form.id ? '/news/update' : '/news/add';
    const res = await request({
      url,
      method,
      data: form
    });
    console.log('Response from save:', res);
    if (res.code === '200') {
      ElMessage.success('保存成功');
      load(1);
      fromVisible.value = false;
    } else {
      ElMessage.error(res.msg || '操作失败');
    }
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

const showContent = (contentValue) => {
  content.value = contentValue;
  fromVisible1.value = true;
};

const closeDialog = () => {
  if (editor.value) {
    editor.value.destroy();
    editor.value = null;
  }
};
</script>

<style scoped>
.w-e-text {
  padding: 20px;
}
.dialog-footer {
  text-align: right;
}
</style>