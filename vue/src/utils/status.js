// 获取状态类型
export const getStatusType = (status) => {
  const statusMap = {
    'PENDING': 'warning',
    'APPROVED': 'success',
    'REJECTED': 'danger',
    'COMPLETED': 'info'
  }
  return statusMap[status] || 'info'
}

// 获取状态显示文本
export const getStatusText = (status) => {
  const statusMap = {
    'PENDING': '待审核',
    'APPROVED': '已通过',
    'REJECTED': '已拒绝',
    'COMPLETED': '已完成'
  }
  return statusMap[status] || '未知'
}