import request from '@/utils/request'
import { mockAppointmentApi } from '@/mock/appointment'

// 是否使用模拟数据
const useMock = true

// 获取预约列表
export function getAppointmentList(params) {
  if (useMock) {
    return Promise.resolve(mockAppointmentApi.getAppointmentList(params))
  }
  return request({
    url: '/appointment/page',
    method: 'get',
    params
  })
}

// 审核预约
export function auditAppointment(id, data) {
  if (useMock) {
    return Promise.resolve(mockAppointmentApi.auditAppointment(id, data))
  }
  return request({
    url: `/appointment/${id}/audit`,
    method: 'put',
    data
  })
}