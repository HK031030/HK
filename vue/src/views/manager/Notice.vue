<template>
  <div>
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input 
        v-model="title" 
        placeholder="查询标题" 
        style="width: 200px"
        clearable
      />
      <el-button type="primary" @click="load(1)">查询</el-button>
      <el-button type="info" @click="reset">重置</el-button>
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleAdd">新增</el-button>
      <el-button 
        type="danger" 
        @click="delBatch" 
        :disabled="!ids.length"
      >批量删除</el-button>
    </div>

    <el-table :data="tableData" stripe :header-cell-style="{ backgroundColor: 'aliceblue', color: '#666' }" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"></el-table-column>
      <el-table-column prop="id" label="序号" width="70" align="center"></el-table-column>
      <el-table-column prop="title" label="标题"></el-table-column>
      <el-table-column prop="content" label="内容" show-overflow-tooltip></el-table-column>
      <el-table-column prop="user" label="发布人"></el-table-column>
      <el-table-column prop="time" label="发布时间"></el-table-column>
      <el-table-column label="是否公开">
        <template v-slot="scope">
          <el-switch v-model="scope.row.open" @change="changeOpen(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180">
        <template v-slot="scope">
          <el-button size="mini" type="primary" plain @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" plain @click="del(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin: 10px 0">
      <el-pagination
          @current-change="handleCurrentChange"
          :current-page="pageNum"
          :page-size="pageSize"
          layout="total, prev, pager, next"
          :total="total">
      </el-pagination>
    </div>

    <el-dialog 
      v-model="fromVisible"
      title="公告信息" 
      width="40%" 
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="80px" style="padding-right: 20px" :rules="rules" ref="formRef">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="标题"></el-input>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input type="textarea" v-model="form.content" placeholder="内容"></el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="fromVisible = false">取 消</el-button>
          <el-button type="primary" @click="save">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus'
// import { mockNoticeApi } from '@/mock/notice'
import { getNoticeList, addNotice, updateNotice, deleteNotice, batchDeleteNotice, updateStatus } from '@/api/notice';

export default {
  name: "Notice",
  data() {
    return {
      tableData: [],
      pageNum: 1,
      pageSize: 5,
      title: '',
      total: 0,
      fromVisible: false,
      form: {},
      rules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入内容', trigger: 'blur' }
        ]
      },
      ids: []
    }
  },
  created() {
    this.load()
  },
  methods: {
    // 修改公开状态
    async changeOpen(row) {
      try {
        const res = await updateStatus(row.id, row.open);
        if (res.code === '200') {
          ElMessage.success('状态更新成功');
        } else {
          row.open = !row.open; // 还原状态
          ElMessage.error(res.msg || '状态更新失败');
        }
      } catch (error) {
        row.open = !row.open; // 还原状态
        ElMessage.error('状态更新失败');
      }
    },

    // 批量删除
    async delBatch() {
      if (!this.ids.length) {
        ElMessage.warning('请选择要删除的数据')
        return
      }

      try {
        await ElMessageBox.confirm('确认删除选中的记录吗？', '提示', {
          type: 'warning'
        })
        const res = await batchDeleteNotice(this.ids)
        if (res.code === '200') {
          ElMessage.success(res.msg || '批量删除成功');
          this.load(1)
        }else {
          ElMessage.error(res.msg || '批量删除失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('批量删除失败')
        }
      }
    },

    handleSelectionChange(rows) {   // 当前选中的所有的行数据
      this.ids = rows.map(v => v.id)
    },
    async del(id) {
      try {
        await ElMessageBox.confirm('确认删除该条公告吗？', '提示', {
          type: 'warning'
        })
        const res = await deleteNotice(id)
        if (res.code === '200') {
          ElMessage.success(res.msg)
          this.load(1)
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    },
    handleEdit(row) {   // 编辑数据
      this.form = JSON.parse(JSON.stringify(row))  // 给form对象赋值  注意要深拷贝数据
      this.fromVisible = true   // 打开弹窗
    },
    handleAdd() {   // 新增数据
      this.form = { 
        user: JSON.parse(localStorage.getItem('userInfo') || '{}').username || '未知用户', // 默认发布人为当前用户
        time: new Date().toISOString().slice(0, 19).replace('T', ' '), // 当前时间
        open: false // 默认不公开
      };
      this.fromVisible = true;
    },
    async save() {   // 保存按钮触发的逻辑  它会触发新增或者更新
      try {
        await this.$refs.formRef.validate();
        const api = this.form.id ? updateNotice : addNotice;
        const res = await api(this.form);
        console.log('Response from save:', res);
        if (res.code === '200') {
          ElMessage.success(res.msg || '操作成功');
          this.load(1);
          this.fromVisible = false;
        } else {
          ElMessage.error(res.msg || '操作失败');
        }
      } catch (error) {
        ElMessage.error('操作失败');
      }
    },
    reset() {
      this.title = ''
      this.load()
    },
    async load(pageNum) {  // 分页查询
      if (pageNum) this.pageNum = pageNum;
      try {
        const res = await getNoticeList({
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          title: this.title
        });
        console.log('Response from getNoticeList:', res);


        if (res.code === '200') {
          this.tableData = res.data.records || res.data.list || []; // 适配可能的字段差异
          this.total = res.data.total || 0;
        } else {
          ElMessage.error(res.msg || '获取数据失败');
        }
      } catch (error) {
        ElMessage.error('获取数据失败');
      }
    },
    handleCurrentChange(pageNum) {
      this.load(pageNum)
    },
  }
}
</script>

<style lang="scss" scoped>
.search-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.action-bar {
  margin: 10px 0;
}

:deep(.el-table) {
  margin: 20px 0;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
}
</style>