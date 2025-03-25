import request from '@/utils/request'

export const getReservationList = (params) => {
  return request({
    url: '/reservations',
    method: 'get',
    params
  });
};

// 获取用户预约状态
export function getUserReservations(userId) {
  return request({
    url: '/reservations/user',
    method: 'get',
    params: { userId }
  })
}

// 创建预约
export function createReservation(data) {
  return request({
    url: '/reservations',
    method: 'post',
    data
  })
}

// 取消预约
export function cancelReservation(userId, slotId) {
  return request({
    url: '/reservations/cancel',
    method: 'get',
    params: { 
      userId,
      slotId
    }
  })
}