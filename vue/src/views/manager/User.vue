<template>
  <div>
    <div>
      <el-input style="width: 200px" placeholder="查询用户名" v-model="username"></el-input>
      <el-input style="width: 200px; margin: 0 5px" placeholder="查询姓名" v-model="name"></el-input>
      <el-button type="primary" @click="load(1)">查询</el-button>
      <el-button type="info" @click="reset">重置</el-button>
    </div>
    <div style="margin: 10px 0">
      <el-button type="primary" plain @click="handleAdd">新增</el-button>
      <el-button type="danger" plain @click="delBatch">批量删除</el-button>
    </div>
    <el-table :data="tableData" stripe :header-cell-style="{ backgroundColor: 'aliceblue', color: '#666' }" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"></el-table-column>
      <el-table-column prop="id" label="序号" width="70" align="center"></el-table-column>
      <el-table-column prop="username" label="用户名"></el-table-column>
      <el-table-column prop="name" label="姓名"></el-table-column>
      <el-table-column prop="phone" label="手机号"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="avatar" label="头像">
        <template v-slot="scope">
          <div style="display: flex; align-items: center">
            <el-image style="width: 50px; height: 50px; border-radius: 50%" v-if="scope.row.avatar" :src="scope.row.avatar" :preview-src-list="[scope.row.avatar]"></el-image>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="role" label="角色"></el-table-column>
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

    <el-dialog title="用户信息" :visible.sync="formVisible" width="30%">
      <el-form :model="form" label-width="80px" style="padding-right: 20px" :rules="rules" ref="formRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="姓名"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="电话"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="邮箱"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input type="textarea" v-model="form.address" placeholder="地址"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-radio-group v-model="form.role">
            <el-radio label="管理员"></el-radio>
            <el-radio label="用户"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
              class="avatar-uploader"
              action="https://localhost:9090/file/upload"
              :headers="{ token: user.token }"
              :file-list="form.avatar ? [form.avatar] : []"
              list-type="picture"
              :on-success="handleAvatarSuccess">
            <el-button type="primary">上传头像</el-button>
          </el-upload>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="formVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as userApi from '@/api/user1'; // 确保路径正确

export default {
  name: "User",
  data() {
    return {
      tableData: [],
      pageNum: 1,
      pageSize: 5,
      username: '',
      name: '',
      total: 0,
      formVisible: false,
      form: {},
      user: JSON.parse(localStorage.getItem('honey-user') || '{}'),
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ]
      },
      ids: []
    }
  },
  created() {
    this.load(); // 加载分页数据
    this.loadAllUsers(); // 加载所有用户数据
  },
  methods: {
    loadAllUsers() {
      userApi.selectAll().then(res => {
        console.log('API 响应:', res); // 打印响应
        if (res.code === '200') {
          // 处理所有用户数据
          console.log('所有用户数据:', res.data);
        } else {
          this.$message.error(res.msg);
        }
      }).catch(error => {
        console.error('加载所有用户失败:', error);
        this.$message.error('加载所有用户失败');
      });
    },
    delBatch() {
      if (!this.ids.length) {
        this.$message.warning('请选择数据');
        return;
      }
      this.$confirm('您确认批量删除这些数据吗?', '确认删除', { type: "warning" }).then(() => {
        userApi.deleteBatch(this.ids).then(res => {
          if (res.code === '200') {
            this.$message.success('操作成功');
            this.load(1);
          } else {
            this.$message.error(res.msg);
          }
        });
      }).catch(() => {});
    },
    handleSelectionChange(rows) {
      this.ids = rows.map(v => v.id);
    },
    del(id) {
      this.$confirm('您确认删除吗?', '确认删除', { type: "warning" }).then(() => {
        userApi.deleteUser(id).then(res => {
          if (res.code === '200') {
            this.$message.success('操作成功');
            this.load(1);
          } else {
            this.$message.error(res.msg);
          }
        });
      }).catch(() => {});
    },
    handleEdit(row) {
      this.form = JSON.parse(JSON.stringify(row));
      this.formVisible = true;
    },
    handleAdd() {
      this.form = { role: '用户' };
      this.formVisible = true;
    },
    save() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          userApi[this.form.id ? 'updateUser' : 'addUser'](this.form).then(res => {
            if (res.code === '200') {
              this.$message.success('保存成功');
              this.load(1);
              this.formVisible = false;
            } else {
              this.$message.error(res.msg);
            }
          });
        }
      });
    },
    reset() {
      this.name = '';
      this.username = '';
      this.load();
    },
    load(pageNum) {
      if (pageNum) this.pageNum = pageNum;
      userApi.selectPage({
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        username: this.username,
        name: this.name,
      }).then(res => {
        if (res.code === '200') {
          this.tableData = res.data.records;
          console.log('加载的数据:', this.tableData); // 打印加载的数据
          this.total = res.data.total;
        } else {
          this.$message.error(res.msg);
        }
      }).catch(error => {
        console.error('加载用户失败:', error);
        this.$message.error('加载用户失败');
      });
    },
    handleCurrentChange(pageNum) {
      this.load(pageNum);
    },
    handleAvatarSuccess(response, file, filelist) {
      this.form.avatar = response.data; // 更新头像链接
    }
  }
}
</script>

<style scoped>
/* 添加样式 */
</style>