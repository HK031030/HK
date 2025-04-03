// src/api/message.js
import request from '@/utils/request'

// Get message list
export function getMessageList(params) {
  return request({
    url: '/message/list',
    method: 'get',
    params
  })
}

// Add new message
export function addMessage(data) {
  return request({
    url: '/message/add',
    method: 'post',
    data
  })
}

// Delete message
export function deleteMessage(id) {
  return request({
    url: `/message/delete/${id}`,
    method: 'delete'
  })
}