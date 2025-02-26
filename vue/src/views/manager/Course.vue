<template>
  <div class="course-container">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchForm.name"
        placeholder="课程名称"
        style="width: 200px"
        clearable
      />
      <el-select v-model="searchForm.type" placeholder="课程类型" clearable>
        <el-option label="科目一" value="科目一" />
        <el-option label="科目二" value="科目二" />
        <el-option label="科目三" value="科目三" />
        <el-option label="科目四" value="科目四" />
      </el-select>
      <el-select v-model="searchForm.status" placeholder="课程状态" clearable>
        <el-option label="未开始" value="未开始" />
        <el-option label="进行中" value="进行中" />
        <el-option label="已结束" value="已结束" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="loadCourses">搜索</el-button>
      <!-- 仅 ADMIN 和 COACH 有新增权限，且 COACH 可选 -->
      <el-button
        v-if="hasPermission('course-info-edit')"
        type="success"
        :icon="Plus"
        @click="handleAdd"
      >
        新增课程
      </el-button>
    </div>

    <!-- 课程表格 -->
    <el-table :data="courses" v-loading="loading" border stripe>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="name" label="课程名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="descr" label="课程介绍" min-width="200" show-overflow-tooltip />
      <el-table-column prop="type" label="课程类型" width="100" />
      <el-table-column prop="during" label="课程时长" width="100">
        <template #default="{ row }">
          {{ row.during }}课时
        </template>
      </el-table-column>
      <el-table-column prop="time" label="上课时间" width="180" />
      <el-table-column prop="location" label="上课地点" width="150" show-overflow-tooltip />
      <el-table-column prop="coachName" label="教练" width="100" />
      <el-table-column prop="max" label="最大人数" width="100" align="center" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <!-- 编辑按钮：ADMIN 或 COACH 且是自己负责的课程 -->
          <el-button
            type="primary"
            :icon="Edit"
            circle
            @click="handleEdit(row)"
            v-if="canEditCourse(row)"
          />
          <!-- 删除按钮：仅 ADMIN 有权限 -->
          <el-button
            type="danger"
            :icon="Delete"
            circle
            @click="handleDelete(row)"
            v-if="role === 'ADMIN'"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? '编辑课程' : '新增课程'"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="课程介绍" prop="descr">
          <el-input v-model="form.descr" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="课程类型" prop="type">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="科目一" value="科目一" />
            <el-option label="科目二" value="科目二" />
            <el-option label="科目三" value="科目三" />
            <el-option label="科目四" value="科目四" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程时长" prop="during">
          <el-input-number v-model="form.during" :min="1" />
          <span class="unit">课时</span>
        </el-form-item>
        <el-form-item label="上课时间" prop="time">
          <el-date-picker
            v-model="form.time"
            type="datetime"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="上课地点" prop="location">
          <el-input v-model="form.location" />
        </el-form-item>
        <el-form-item label="教练" prop="coachId">
  <el-select v-model="form.coachId" style="width: 100%" placeholder="请选择教练">
    <el-option
      v-for="coach in coachList"
      :key="coach.id"
      :label="coach.name"
      :value="coach.id"
    />
  </el-select>
</el-form-item>
        <el-form-item label="最大人数" prop="max">
          <el-input-number v-model="form.max" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="课程状态" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="未开始" value="未开始" />
            <el-option label="进行中" value="进行中" />
            <el-option label="已结束" value="已结束" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import request from '@/utils/request';
// 导入所需的 API 函数
import { 
  getCourseList, 
  addCourse, 
  updateCourse, 
  deleteCourse, 
  getCourseDetail,
  deleteBatch 
} from '@/api/course'

// 数据列表相关
const courses = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const coachList = ref([]);

// 用户信息和角色
const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'));
const role = ref(userInfo.value.role || '');

// 权限检查函数
const hasPermission = (permission) => {
  const permissions = {
    'ADMIN': ['course-info', 'course-info-edit'],
    'COACH': ['course-info', 'course-info-edit'],
    'USER': ['course-info']
  };
  return permissions[role.value]?.includes(permission) || false;
};

// 检查是否可以编辑课程（COACH 只能编辑自己负责的课程）
const canEditCourse = (row) => {
  if (role.value === 'ADMIN') return true;
  if (role.value === 'COACH') return row.coachId === userInfo.value.id;
  return false;
};

// 格式化时间
const formatTime = (time) => {
  const date = new Date(time);
  const pad = (num) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

// 加载教练列表
const loadCoaches = async () => {
  try {
    const res = await request({
      url: '/coach/selectAll', // 假设后端提供此接口
      method: 'get'
    });
    if (res.code === '200') {
      coachList.value = res.data || [];
    } else {
      ElMessage.error('加载教练列表失败');
    }
  } catch (error) {
    console.error('加载教练失败:', error);
    ElMessage.error('加载教练失败');
  }
};
const loadCourses = async () => {
  loading.value = true;
  try {
    const params = {
      pageNum: page.value,
      pageSize: pageSize.value,
      name: searchForm.name,
      type: searchForm.type,
      status: searchForm.status
    };
    if (role.value === 'COACH') {
      params.coachId = userInfo.value.id; // COACH 只能看到自己的课程
    }
    const res = await getCourseList(params);
    if (res.code === '200') {
      courses.value = res.data.list || [];
      total.value = res.data.total || 0;
    } else {
      ElMessage.error(res.msg || '加载课程列表失败');
    }
  } catch (error) {
    ElMessage.error('加载课程列表失败');
  } finally {
    loading.value = false;
  }
};
// 在 onMounted 中加载
onMounted(() => {
  loadCourses();
  loadCoaches();
});
// 搜索表单
const searchForm = reactive({
  name: '', 
  type: '',
  status: ''
})

// 弹窗表单相关
const dialogVisible = ref(false)
const formRef = ref(null)
const submitting = ref(false)
// 修改表单数据结构
const form = reactive({
  id: '',
  name: '',
  descr: '',
  type: '',
  during: 1,         // 已为整数，保持不变
  time: '',
  location: '',
  coachId: null,        // 改为 coachId，默认值为 0（整数）
  max: 20,           // 已为整数，保持不变
  status: '未开始'
})

// 修改验证规则
const rules = {
  name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],  // 添加 name 验证
  descr: [{ required: true, message: '请输入课程介绍', trigger: 'blur' }],
  type: [{ required: true, message: '请选择课程类型', trigger: 'change' }],
  during: [{ required: true, message: '请输入课程时长', trigger: 'blur' }],
  time: [{ required: true, message: '请选择上课时间', trigger: 'change' }],
  location: [{ required: true, message: '请输入上课地点', trigger: 'blur' }],
  coachId: [{ required: true, message: '请选择教练', trigger: 'change' }],
  max: [{ required: true, message: '请输入最大人数', trigger: 'blur' }],
  status: [{ required: true, message: '请选择课程状态', trigger: 'change' }]
}
// 获取状态标签类型
const getStatusType = (status) => {
  const map = {
    '未开始': 'info',
    '进行中': 'success',
    '已结束': ''
  }
  return map[status]
}

// 处理新增
const handleAdd = () => {
  Object.assign(form, {
    id: '',
    name: '',
    descr: '',
    type: '',
    during: 1,
    time: '',
    location: '',
    coachId: role.value === 'COACH' ? userInfo.value.id : null, // COACH 默认选择自己
    max: 20,
    status: '未开始'
  });
  dialogVisible.value = true;
};

// 处理编辑
const handleEdit = (row) => {
  if (!canEditCourse(row)) {
    ElMessage.warning('您无权编辑此课程');
    return;
  }
  Object.assign(form, {
    id: row.id,
    name: row.name,
    descr: row.descr,
    type: row.type,
    during: row.during,
    time: row.time,
    location: row.location,
    coachId: row.coachId,
    max: row.max,
    status: row.status
  });
  dialogVisible.value = true;
};
// 处理删除
const handleDelete = async (row) => {
  if (role.value !== 'ADMIN') {
    ElMessage.warning('您无权删除课程');
    return;
  }
  try {
    await ElMessageBox.confirm('确认删除该课程吗？', '提示', {
      type: 'warning'
    });
    const res = await deleteCourse(row.id);
    if (res.code === '200') {
      ElMessage.success('删除成功');
      loadCourses();
    } else {
      ElMessage.error(res.msg || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败');
  }
};

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    submitting.value = true;
    const submitData = {
      id: String(form.id),
      name: form.name,
      descr: form.descr,
      type: form.type === "科目一" ? "1" : form.type === "科目二" ? "2" : form.type === "科目三" ? "3" : "4",
      during: parseInt(form.during),
      time: formatTime(form.time),
      location: form.location,
      coachId: parseInt(form.coachId),
      max: parseInt(form.max),
      status: form.status
    };
    const apiMethod = form.id ? updateCourse : addCourse;
    const res = await apiMethod(submitData);
    if (res.code === '200') {
      ElMessage.success(form.id ? '更新成功' : '添加成功');
      dialogVisible.value = false;
      loadCourses();
    } else {
      ElMessage.error(res.msg || '操作失败');
    }
  } catch (error) {
    ElMessage.error('操作失败');
  } finally {
    submitting.value = false;
  }
};

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  loadCourses()
}

const handleCurrentChange = (val) => {
  page.value = val
  loadCourses()
}

onMounted(() => {
  loadCourses()
})
</script>

<style scoped>
.course-container {
  padding: 20px;
}

.search-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.unit {
  margin-left: 10px;
  color: #606266;
}

:deep(.el-form-item__label) {
  font-weight: bold;
}

:deep(.el-table) {
  margin-top: 20px;
}
</style>