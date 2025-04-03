import request from '@/utils/request';

// FAQ 搜索
export const searchFAQ = (keyword) => {
  return request.get('/faq/search', {
    params: { keyword }
  });
};

// 获取系统数据（可选）
export const fetchSystemData = () => {
  return request.get('/system/data');
};