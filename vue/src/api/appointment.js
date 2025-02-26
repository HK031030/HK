import request from '@/utils/request';

// 获取预约列表
export function getAppointmentList(params) {
  return request({
    url: '/appointment/selectPage',
    method: 'get',
    params
  });
}

// 审核预约
export function auditAppointment(id, data) {
  return request({
    url: `/appointment/audit`,
    method: 'post',
    data: { id, ...data }
  });
}