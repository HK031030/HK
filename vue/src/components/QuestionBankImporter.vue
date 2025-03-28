<template>
    <div class="question-bank-importer">
      <!-- 文件导入 -->
      <div class="import-section">
        <h3>题库导入</h3>
        
        <!-- 文件上传 -->
        <div class="file-upload">
          <input 
            type="file" 
            ref="fileInput"
            accept=".json" 
            @change="handleFileUpload"
            style="display: none"
          />
          <el-button 
            type="primary" 
            icon="Upload" 
            @click="triggerFileInput"
          >
            上传JSON题库
          </el-button>
        </div>
  
        <!-- 文本粘贴 -->
        <div class="text-paste mt-4">
          <el-input 
            type="textarea" 
            :rows="6"
            v-model="jsonTextContent"
            placeholder="直接粘贴JSON题库内容"
          />
          <el-button 
            type="success" 
            class="mt-2" 
            @click="parseJsonText"
          >
            解析JSON
          </el-button>
        </div>
      </div>
  
      <!-- 预览区域 -->
      <div v-if="parsedQuestionBanks.length" class="preview-section mt-4">
        <h3>题库预览</h3>
        <el-table 
          :data="parsedQuestionBanks" 
          border 
          style="width: 100%"
        >
          <el-table-column prop="subjectId" label="科目ID" width="100" />
          <el-table-column label="题目数量">
            <template #default="{ row }">
              {{ row.questions.length }}
            </template>
          </el-table-column>
          <el-table-column label="预览" width="300">
            <template #default="{ row }">
              <div>
                <p>首个题目：{{ row.questions[0].title }}</p>
                <el-tag :type="getDifficultyType(row.questions[0].difficulty)">
                  {{ getDifficultyLabel(row.questions[0].difficulty) }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ $index }">
              <el-button 
                type="primary" 
                size="small" 
                @click="saveQuestionBank($index)"
              >
                保存题库
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
  
      <!-- 示例模板 -->
      <div class="template-section mt-4">
        <h3>JSON题库模板</h3>
        <el-card shadow="hover">
          <pre>{{ jsonTemplate }}</pre>
          <el-button 
            type="text" 
            @click="copyJsonTemplate"
          >
            复制模板
          </el-button>
        </el-card>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { ElMessage } from 'element-plus'
  
  // 类型定义
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
  }
  
  interface QuestionBank {
    subjectId: number;
    questions: Question[];
  }
  
  // 响应式状态
  const fileInput = ref<HTMLInputElement | null>(null)
  const jsonTextContent = ref('')
  const parsedQuestionBanks = ref<QuestionBank[]>([])
  
  // JSON模板
  const jsonTemplate = ref(`{
    "subjectId": 1,
    "questions": [
      {
        "id": 1,
        "title": "题目内容",
        "options": [
          {"key": "A", "text": "选项A"},
          {"key": "B", "text": "选项B"}
        ],
        "answer": "A",
        "explanation": "答案解析",
        "difficulty": "easy"
      }
    ]
  }`)
  
  // 触发文件选择
  const triggerFileInput = () => {
    fileInput.value?.click()
  }
  
  // 文件上传处理
  const handleFileUpload = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        parseJsonContent(content)
      }
      reader.readAsText(file)
    }
  }
  
  // 文本解析
  const parseJsonText = () => {
    if (!jsonTextContent.value.trim()) {
      ElMessage.warning('请输入JSON内容')
      return
    }
    parseJsonContent(jsonTextContent.value)
  }
  
  // 解析JSON内容
  const parseJsonContent = (content: string) => {
    try {
      const data = JSON.parse(content)
      const validatedBanks = validateQuestionBanks(
        Array.isArray(data) ? data : [data]
      )
      
      parsedQuestionBanks.value = validatedBanks
      
      if (validatedBanks.length > 0) {
        ElMessage.success(`成功解析 ${validatedBanks.length} 个题库`)
      } else {
        ElMessage.warning('未解析到有效题库')
      }
    } catch (error) {
      ElMessage.error('JSON解析失败：' + (error as Error).message)
    }
  }
  
  // 验证题库
  const validateQuestionBanks = (banks: any[]): QuestionBank[] => {
    return banks.filter(bank => 
      bank.subjectId && 
      Array.isArray(bank.questions) && 
      bank.questions.length > 0
    ).map(bank => ({
      subjectId: bank.subjectId,
      questions: bank.questions.map(validateQuestion)
    }))
  }
  
  // 验证单个题目
  const validateQuestion = (q: any): Question => ({
    id: q.id || Date.now(),
    title: q.title || '未知题目',
    options: q.options || [],
    answer: q.answer || '',
    explanation: q.explanation || '',
    difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) 
      ? q.difficulty 
      : 'medium'
  })
  
  // 保存题库
  const saveQuestionBank = (index: number) => {
    const bank = parsedQuestionBanks.value[index]
    
    // 获取已保存的题库
    const savedBanks = JSON.parse(
      localStorage.getItem('questionBanks') || '[]'
    )
    
    // 检查是否已存在相同科目的题库
    const existingIndex = savedBanks.findIndex(
      (b: QuestionBank) => b.subjectId === bank.subjectId
    )
    
    if (existingIndex !== -1) {
      // 询问是否覆盖
      ElMessageBox.confirm(
        `科目 ${bank.subjectId} 的题库已存在，是否覆盖？`,
        '提示',
        {
          confirmButtonText: '覆盖',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        savedBanks[existingIndex] = bank
        localStorage.setItem('questionBanks', JSON.stringify(savedBanks))
        ElMessage.success('题库保存成功')
      }).catch(() => {
        ElMessage.info('已取消保存')
      })
    } else {
      // 直接添加新题库
      savedBanks.push(bank)
      localStorage.setItem('questionBanks', JSON.stringify(savedBanks))
      ElMessage.success('题库保存成功')
    }
  }
  
  // 难度标签
  const getDifficultyType = (difficulty?: string) => {
    switch(difficulty) {
      case 'easy': return 'success'
      case 'hard': return 'danger'
      default: return 'warning'
    }
  }
  
  // 难度标签文本
  const getDifficultyLabel = (difficulty?: string) => {
    switch(difficulty) {
      case 'easy': return '简单'
      case 'hard': return '困难'
      default: return '中等'
    }
  }
  
  // 复制模板
  const copyJsonTemplate = () => {
    navigator.clipboard.writeText(jsonTemplate.value).then(() => {
      ElMessage.success('模板已复制到剪贴板')
    }).catch(() => {
      ElMessage.error('复制失败')
    })
  }
  </script>
  
  <style scoped>
  .question-bank-importer {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .import-section, 
  .preview-section, 
  .template-section {
    background-color: #f5f7fa;
    border-radius: 4px;
    padding: 20px;
    margin-bottom: 20px;
  }
  
  pre {
    background-color: #f0f2f5;
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
  }
  </style>