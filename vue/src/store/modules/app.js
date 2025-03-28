import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    showLayout: true  // 控制整体布局显示
  }),
  actions: {
    setShowLayout(show) {
      this.showLayout = show
    }
  }
})