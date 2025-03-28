import request from '@/utils/request'

// 从环境变量获取密钥
const APP_ID = import.meta.env.VITE_MXN_APP_ID || 'bmkxmtselmpjdfof'
const APP_SECRET = import.meta.env.VITE_MXN_APP_SECRET || 'iyP2T9k7sNfG7yZ92cRCoI12Utk3Wmja'
const BASE_URL = 'https://www.mxnzp.com/api/driver_exam'

/**
 * 获取驾考题目列表
 * @param {Object} params
 * @param {number} params.page - 页码，从1开始
 * @param {number} params.rank - 驾照类型(1=c1/c2,2=a1/a2,3=b1/b2)
 * @param {number} params.type - 科目类型(1=科目一,4=科目四)
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: {
 *     list: Array<{
 *       id: number,
 *       title: string,
 *       op1: string,
 *       op2: string,
 *       op3: string,
 *       op4: string,
 *       answer: string,
 *       explains: string,
 *       titlePic: string,
 *       type: number,
*       rank: number
 *     }>,
 *     total: number,
 *     limit: number,
*     page: number
 *   }
 * }>}
 */
export function getQuestions(params) {
  return request({
    url: `${BASE_URL}/question/list`,
    method: 'get',
    params: {
      app_id: APP_ID,
      app_secret: APP_SECRET,
      page: params.page || 1,
      rank: params.rank || 1,
      type: params.type || 1
    },
    // 添加错误处理
    validateStatus: status => status === 200
  })
}

// 添加测试方法
export async function testQuestionAPI() {
  try {
    const res = await getQuestions({
      page: 1,
      rank: 1,
      type: 1
    })
    console.log('API测试响应:', res)
    return res
  } catch (error) {
    console.error('API测试失败:', error)
    throw error
  }
}

/**
 * 获取分页题目
 * @param {Object} params
 * @param {number} params.rank - 驾照类型
 * @param {number} params.type - 科目类型
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise<Array>}
 */
export async function getAllQuestions(params) {
  try {
    const firstPage = await getQuestions({ ...params, page: 1 })
    if (firstPage.code !== 1) {
      throw new Error(firstPage.msg || '获取题库失败')
    }

    const total = firstPage.data.total
    const pageSize = params.pageSize || 100
    const totalPages = Math.ceil(total / pageSize)
    
    // 首页数据
    let allQuestions = [...firstPage.data.list]

    // 如果有多页，并发请求其他页
    if (totalPages > 1) {
      const pagePromises = []
      for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(
          getQuestions({ ...params, page })
            .then(res => res.code === 1 ? res.data.list : [])
            .catch(() => [])
        )
      }
      
      const results = await Promise.all(pagePromises)
      results.forEach(list => {
        allQuestions = allQuestions.concat(list)
      })
    }

    return allQuestions
  } catch (error) {
    console.error('获取全部题目失败:', error)
    throw error
  }
}
/**
 * 获取题目答案
 * @param {string} ids - 题目ID列表，用逗号分隔
 * @returns {Promise} 答案数据
 */
export function getAnswers(ids) {
  return request({
    url: `${BASE_URL}/answer/list`,
    method: 'get',
    params: {
      app_id: APP_ID,
      app_secret: APP_SECRET,
      ids: Array.isArray(ids) ? ids.join(',') : ids
    }
  })
}