export interface QuestionOption {
    key: string;
    text: string;
  }
  
  export interface Question {
    id: number;
    title: string;
    options: QuestionOption[];
    answer: string;
    explanation?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
  }
  
  export interface QuestionBank {
    subjectId: number;
    questions: Question[];
  }
  
  export class QuestionBankManager {
    // 保存题库
    static saveQuestionBanks(banks: QuestionBank[]) {
      localStorage.setItem('questionBanks', JSON.stringify(banks))
    }
  
    // 加载题库
    static loadQuestionBanks(): QuestionBank[] {
      const saved = localStorage.getItem('questionBanks')
      return saved ? JSON.parse(saved) : []
    }
  
    // 按科目ID获取题库
    static getQuestionBankBySubject(subjectId: number): QuestionBank | undefined {
      const banks = this.loadQuestionBanks()
      return banks.find(bank => bank.subjectId === subjectId)
    }
  }