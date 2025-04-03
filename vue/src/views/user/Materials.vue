<template>
  <div class="materials-container">
    <!-- Subject Selection Card -->
    <el-card class="subject-card">
      <div class="subject-grid">
        <div 
          v-for="subject in subjects" 
          :key="subject.id"
          class="subject-item"
          :class="{ active: activeSubject === subject.id }"
          @click="selectSubject(subject)"
        >
          <el-icon :size="24">
            <component :is="subject.icon" />
          </el-icon>
          <h3>{{ subject.name }}</h3>
          <p>{{ subject.desc }}</p>
          <div class="progress-info">
            <el-progress 
              :percentage="subject.progress" 
              :status="subject.progress >= 80 ? 'success' : ''"
            />
          </div>
        </div>
      </div>
    </el-card>

    <!-- Practice Area -->
    <el-card v-if="activeSubject" class="practice-card">
      <template #header>
        <div class="card-header">
          <span>{{ currentSubject?.name }} 练习题</span>
          <div class="header-actions">
            <!-- License Type Selector -->
            <el-select 
              v-model="selectedLicenseType" 
              placeholder="选择驾照类型"
              class="license-type-select"
            >
              <el-option 
                v-for="license in licenseTypes" 
                :key="license.value"
                :label="license.label"
                :value="license.value"
              />
            </el-select>

            <el-button @click="fetchAndCacheQuestions" type="primary">
              获取题库
            </el-button>
            <el-button @click="startPractice" :disabled="!questions.length">
              开始练习
            </el-button>
            <el-button @click="viewHistory">
              历史记录
            </el-button>
            <el-button @click="goToCoachResources" type="success">
              教练资源中心
            </el-button>
          </div>
        </div>
      </template>

      <!-- Practice Area -->
      <div v-if="isPracticing" class="question-area" v-loading="loading">
        <div class="question-header">
          <span class="question-count">
      第 {{ currentIndex + 1 }}/{{ questions.length }} 题
    </span>
    <el-tag>{{ formatTime(remainingTime) }}</el-tag>
        </div>
        
        <div class="question-content">
  <h2>{{ currentQuestion?.title }}</h2>
  <div class="difficulty-tag">
    <el-tag :type="getDifficultyType(currentQuestion?.difficulty)">
      {{ getDifficultyLabel(currentQuestion?.difficulty) }}
    </el-tag>
  </div>
  <div class="options-list">
    <el-radio-group v-model="userAnswer">
      <el-radio 
        v-for="option in currentQuestion?.options"
        :key="option.key"
        :label="option.key"
        :disabled="isAnswered"
      >
        {{ option.text }}
      </el-radio>
    </el-radio-group>
  </div>
</div>

        <div v-if="isAnswered && currentQuestion.explanation" class="explanation-area">
          <el-alert 
            :title="userAnswer === currentQuestion.answer ? '回答正确' : '回答错误'"
            :type="userAnswer === currentQuestion.answer ? 'success' : 'error'"
            show-icon
          >
            <template #default>
              {{ currentQuestion.explanation }}
            </template>
          </el-alert>
        </div>

        <div class="question-footer">
          <el-button 
            type="primary" 
            @click="submitAnswer"
            :disabled="!userAnswer || isAnswered"
          >
            提交答案
          </el-button>
          <el-button @click="nextQuestion" :disabled="!isAnswered">
            下一题
          </el-button>
        </div>
      </div>

      <!-- History Area -->
      <div v-else class="summary-area">
  <div class="summary-header">
    <h3>练习历史记录</h3>
    <el-button @click="clearHistory" type="danger" size="small">
      清空记录
    </el-button>
  </div>
  
  <el-empty v-if="!practiceHistory.length" description="暂无练习记录" />
  
  <el-table v-else :data="practiceHistory" style="width: 100%">
    <el-table-column prop="date" label="练习时间" width="180" />
    <el-table-column prop="subjectName" label="科目" width="100" />
    <el-table-column prop="score" label="得分" width="80">
      <template #default="{ row }">
        <span :class="{ 'text-success': row.score >= 90 }">
          {{ row.score }}分
        </span>
      </template>
    </el-table-column>
    <el-table-column prop="accuracy" label="正确率" width="100" />
    <el-table-column prop="timeUsed" label="用时" width="100" />
    <el-table-column prop="questionCount" label="题目数量" width="100" />
    <el-table-column fixed="right" label="操作" width="120">
      <template #default="{ row }">
        <el-button link type="primary" @click="viewDetail(row)">
          查看详情
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage,ElMessageBox } from 'element-plus'
// import { 
//   Guide, 
//   Place, 
//   Car, 
//   TakeawayBox 
// } from '@element-plus/icons-vue'
import { getQuestions, getAllQuestions ,getAnswers} from '@/api/question.js'

// 类型定义
interface Subject {
  id: number;
  name: string;
  desc: string;
  icon: string;
  progress: number;
}

interface QuestionOption {
  key: string;
  text: string;
}

interface Question {
  id: number;
  title: string;
  options: QuestionOption[];
  answer: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  url?: string;
}

interface QuestionBank {
  subjectId: number;
  licenseType: string;
  questions: Question[];
}

interface PracticeRecord {
  date: string;
  score: number;
  accuracy: string;
  timeUsed: string;
  subjectId: number;       // 添加科目ID
  subjectName: string;     // 添加科目名称
  licenseType: string;     // 添加驾照类型
  questionCount: number;   // 添加题目数量
}

// 科目数据
const subjects: Subject[] = [
  {
    id: 1,
    name: '科目一',
    desc: '交通法规与道路知识',
    icon: 'Guide',
    progress: 65
  },
  {
    id: 2,
    name: '科目二',
    desc: '场地驾驶技能',
    icon: 'Place',
    progress: 40
  },
  {
    id: 3,
    name: '科目三',
    desc: '道路驾驶技能',
    icon: 'Car',
    progress: 20
  },
  {
    id: 4,
    name: '科目四',
    desc: '安全文明驾驶',
    icon: 'TakeawayBox',
    progress: 0
  }
]

// 驾照类型映射和选项
const LICENSE_RANK_MAP = {
  'c1': 1,
  'c2': 1,
  'a1': 2,
  'a2': 2,
  'b1': 3,
  'b2': 3
}

const licenseTypes = [
  { value: 'c1', label: 'C1（小型汽车）' },
  { value: 'c2', label: 'C2（小型自动挡汽车）' },
  { value: 'a1', label: 'A1（大型客车）' },
  { value: 'a2', label: 'A2（牵引车）' },
  { value: 'b1', label: 'B1（中型客车）' },
  { value: 'b2', label: 'B2（大型货车）' }
]

// 本地存储管理
const saveQuestionBanks = (banks: QuestionBank[]) => {
  localStorage.setItem('questionBanks', JSON.stringify(banks))
}

const loadQuestionBanks = (): QuestionBank[] => {
  const saved = localStorage.getItem('questionBanks')
  return saved ? JSON.parse(saved) : []
}

// 响应式变量
const questions = ref<Question[]>([])
const activeSubject = ref<number | null>(null)
const isPracticing = ref(false)
const currentIndex = ref(0)
const userAnswer = ref('')
const isAnswered = ref(false)
const remainingTime = ref(45)
const questionBanks = ref<QuestionBank[]>([])
const practiceHistory = ref<PracticeRecord[]>([])
const selectedLicenseType = ref('c1')
const loading = ref(false)

let timer: number | null = null


const router = useRouter()
// 添加跳转到教练资源中心的方法
const goToCoachResources = () => {
  router.push('/manager/coach/resources').catch(err => {
    console.error('路由跳转失败:', err)
    ElMessage.error('页面跳转失败，请检查路由配置')
  })
}
// 计算属性
const currentSubject = computed(() => 
  subjects.find(subject => subject.id === activeSubject.value)
)

const currentQuestion = computed(() => 
  questions.value[currentIndex.value] || null
)

// 难度判断方法
const getDifficulty = (length: number): 'easy' | 'medium' | 'hard' => {
  if (length < 15) return 'easy'
  if (length > 30) return 'hard'
  return 'medium'
}

const getDifficultyType = (difficulty?: string) => {
  switch(difficulty) {
    case 'easy': return 'success'
    case 'hard': return 'danger'
    default: return 'warning'
  }
}

const getDifficultyLabel = (difficulty?: string) => {
  switch(difficulty) {
    case 'easy': return '简单'
    case 'hard': return '困难'
    default: return '中等'
  }
}

// 选择科目
const selectSubject = (subject: Subject) => {
  activeSubject.value = subject.id
}

// 获取并缓存题库
const fetchAndCacheQuestions = async () => {
  if (!activeSubject.value) {
    ElMessage.warning('请先选择科目')
    return
  }

  loading.value = true
  try {
    // 获取题目列表
    const questionsRes = await getQuestions({
      page: 1,
      type: activeSubject.value === 4 ? 4 : 1,
      rank: LICENSE_RANK_MAP[selectedLicenseType.value]
    })

    if (questionsRes.code !== 1 || !questionsRes.data?.list?.length) {
      throw new Error(questionsRes.msg || '获取题库失败')
    }

    // 获取题目ID列表
    const questionIds = questionsRes.data.list.map(q => q.id)
    
    // 获取对应的答案
    const answersRes = await getAnswers(questionIds)

    if (answersRes.code !== 1) {
      throw new Error(answersRes.msg || '获取答案失败')
    }

    // 创建答案映射
    const answersMap = new Map(
      answersRes.data.map(item => [item.id, item])
    )

    // 转换题目格式
    const formattedQuestions = questionsRes.data.list.map(item => {
      const answerInfo = answersMap.get(item.id) || {}
      return {
        id: item.id,
        title: item.title || '',
        options: [
          { key: 'A', text: item.op1 || '' },
          { key: 'B', text: item.op2 || '' },
          { key: 'C', text: item.op3 || '' },
          { key: 'D', text: item.op4 || '' }
        ].filter(opt => opt.text),
        answer: answerInfo.answer || '',
        explanation: answerInfo.explain || '',
        url: item.titlePic || '',
        type: item.type,
        rank: item.rank,
        difficulty: getDifficulty(item.title?.length || 0)
      }
    })

    // 创建新的题库对象
    const bank = {
      subjectId: activeSubject.value,
      licenseType: selectedLicenseType.value,
      questions: formattedQuestions
    }

    // 更新状态
    questions.value = formattedQuestions
    isPracticing.value = true  // 自动开始练习
    currentIndex.value = 0
    userAnswer.value = ''
    isAnswered.value = false
    startTimer()

    // 更新本地存储
    const existingBanks = loadQuestionBanks()
    const updatedBanks = [
      ...existingBanks.filter(b => 
        b.subjectId !== bank.subjectId || 
        b.licenseType !== bank.licenseType
      ),
      bank
    ]
    
    saveQuestionBanks(updatedBanks)
    questionBanks.value = updatedBanks

    ElMessage.success(`成功获取 ${formattedQuestions.length} 道题目`)
  } catch (error) {
    console.error('获取题库失败:', error)
    ElMessage.error(error.message || '获取题库失败，请稍后重试')
    isPracticing.value = false
  } finally {
    loading.value = false
  }
}
// 开始练习
const startPractice = () => {
  if (questions.value.length === 0) {
    ElMessage.warning('请先获取题库')
    return
  }

  isPracticing.value = true
  currentIndex.value = 0
  userAnswer.value = ''
  isAnswered.value = false
  startTimer()
}

// 计时器相关方法
const startTimer = () => {
  remainingTime.value = 45
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      submitAnswer()
    }
  }, 1000) as unknown as number
}

const formatTime = (seconds: number) => {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
}

// 答题相关方法
const submitAnswer = () => {
  if (timer) clearInterval(timer)
  isAnswered.value = true
  
  const correct = userAnswer.value === currentQuestion.value.answer
  ElMessage({
    type: correct ? 'success' : 'error',
    message: correct 
      ? '回答正确！' 
      : `回答错误，正确答案是：${currentQuestion.value.answer}`
  })
}

const nextQuestion = () => {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
    userAnswer.value = ''
    isAnswered.value = false
    startTimer()
  } else {
    endPractice()
  }
}

const endPractice = () => {
  if (timer) clearInterval(timer)
  isPracticing.value = false
  
   // 计算得分
   const correctCount = questions.value.filter((q, index) => 
    userAnswer.value === q.answer  // 修改：使用 userAnswer 而不是 currentAnswers
  ).length
  
  const score = Math.round((correctCount / questions.value.length) * 100)
  
  // 创建新的练习记录
  const newRecord: PracticeRecord = {
    date: new Date().toLocaleString(),
    score,
    accuracy: `${score}%`,
    timeUsed: `${45 - remainingTime.value}秒`,
    subjectId: activeSubject.value || 0,
    subjectName: currentSubject.value?.name || '',
    licenseType: selectedLicenseType.value,
    questionCount: questions.value.length
  }
  
  // 更新历史记录
  practiceHistory.value.unshift(newRecord)
  savePracticeHistory(practiceHistory.value)
  
  ElMessage.success(`练习完成！得分：${score}分`)
}

// 历史记录存储管理
const savePracticeHistory = (history: PracticeRecord[]) => {
  localStorage.setItem('practiceHistory', JSON.stringify(history))
}

const loadPracticeHistory = (): PracticeRecord[] => {
  const saved = localStorage.getItem('practiceHistory')
  return saved ? JSON.parse(saved) : []
}
const clearHistory = () => {
  ElMessageBox.confirm(
    '确定要清空所有练习记录吗？此操作不可恢复。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    practiceHistory.value = []
    savePracticeHistory([])
    ElMessage.success('历史记录已清空')
  }).catch(() => {})
}

const viewHistory = () => {
  isPracticing.value = false  // 切换到历史记录视图
}

const viewDetail = (record: PracticeRecord) => {
  // 查看详细记录
  ElMessage.info(`查看 ${record.date} 的练习记录，得分：${record.score}分`)
}
// 初始化
onMounted(() => {
  questionBanks.value = loadQuestionBanks()
  practiceHistory.value = loadPracticeHistory()
})
</script>

<style lang="scss" scoped>
.materials-container {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .subject-card {
    .subject-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;

      .subject-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 15px;
        border: 1px solid #eee;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover, &.active {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-color: #409EFF;
        }

        .progress-info {
          margin-top: auto;
          width: 100%;
        }
      }
    }
  }
  .summary-area {
  .summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
    }
  }
  
  .text-success {
    color: #67C23A;
    font-weight: bold;
  }
}

  .practice-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-actions {
        display: flex;
        gap: 10px;
      }
    }

    .question-content {
      margin-bottom: 20px;

      .difficulty-tag {
        margin-bottom: 15px;
      }

      .options-list {
        margin-bottom: 15px;
      }
    }

    .question-image {
      text-align: center;
      margin-bottom: 15px;

      img {
        max-width: 100%;
        max-height: 300px;
      }
    }
  }
}
</style>