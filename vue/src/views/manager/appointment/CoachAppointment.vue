<template>
  <div class="appointment-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="header-title">预约管理</span>
        </div>
      </template>

      <div class="search-section">
        <el-select v-model="queryParams.status" placeholder="预约状态" @change="handleSearch">
          <el-option label="全部" value="" />
          <el-option label="待审核" value="PENDING" />
          <el-option label="已通过" value="APPROVED" />
          <el-option label="已拒绝" value="REJECTED" />
          <el-option label="已完成" value="COMPLETED" />
        </el-select>
      </div>

      <div class="table-section">
        <el-table :data="reservationList" v-loading="loading" border stripe>
          <el-table-column prop="studentName" label="学员姓名" />
          <el-table-column prop="courseTitle" label="课程名称" />
          <el-table-column prop="appointmentTime" label="预约时间" sortable />
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250" fixed="right">
            <template #default="{ row }">
              <template v-if="row.status === 'PENDING'">
                <el-button type="success" size="small" @click="handleApprove(row)">通过</el-button>
                <el-button type="danger" size="small" @click="handleReject(row)">拒绝</el-button>
              </template>
              <el-button type="primary" size="small" @click="handleDetail(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-section">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
// ...类似的脚本逻辑，但针对教练角色...
</script>

<style lang="scss" scoped>
@import '@/styles/appointment.scss';
</style>