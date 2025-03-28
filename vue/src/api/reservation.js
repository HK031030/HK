import request from '@/utils/request'

export const getReservationList = (params) => {
  return request({
    url: '/reservations/selectPage',
    method: 'get',
    params
  });
};

export const getCoaches = () => {
  return request({
    url: '/reservations/coach',
    method: 'get',
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


// 获取用户预约状态
export function getUserReservations_List(params) {
  return request({
    url: '/reservations/selectUserPage',
    method: 'get',
    params
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
export function getUserReservations_List_Coach(params) {
  return request({
    url: '/reservations/selectCoachPage',
    method: 'get',
    params
  })
}