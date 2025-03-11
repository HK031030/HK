import request from '@/utils/request';

export const getReservationList = (params) => {
  return request({
    url: '/reservations',
    method: 'get',
    params
  });
};