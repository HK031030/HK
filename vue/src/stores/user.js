import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')
  }),
  
  getters: {
    userId: (state) => state.userInfo.id || '',
    username: (state) => state.userInfo.username || '',
    role: (state) => state.userInfo.role || '',
    avatar: (state) => state.userInfo.avatar || ''
  },
  
  actions: {
    setUserInfo(info) {
      this.userInfo = info
      localStorage.setItem('userInfo', JSON.stringify(info))
    },
    
    clearUserInfo() {
      this.userInfo = {}
      localStorage.removeItem('userInfo')
    }
  }
})