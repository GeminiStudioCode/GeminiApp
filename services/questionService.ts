
import { Question, QuestionCategory } from '../types';
import { getFavorites } from './storageService';
import { rawSingleChoice, rawMultipleChoice, rawTrueFalse } from '../data';

const parseChoiceQuestions = (raw: string, category: QuestionCategory): Question[] => {
  const questions: Question[] = [];
  const lines = raw.split('\n').map(l => l.trim()).filter(l => l);
  
  let currentQ: Partial<Question> & { options: string[] } = { options: [] };
  let idCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match question start: "1." or "1、" or "1 "
    if (/^\d+[\.\、\s]/.test(line)) {
      const match = line.match(/^(\d+)[\.\、\s]\s*(.*)$/);
      if (match) {
        currentQ = {
            id: `${category}-${idCounter++}`,
            category: category,
            text: match[2].trim(),
            options: [],
            correctAnswers: [],
            explanation: ''
        };
      }
    } 
    else if (/^[A-E][\.\、\s]/.test(line)) {
       // Match options: "A." or "A、" or "A "
       const match = line.match(/^([A-E])[\.\、\s]\s*(.*)$/);
       if (match) {
           currentQ.options.push(match[2].trim());
       }
    }
    // More robust answer detection: handles spaces like "答案 ：" or "答案:"
    else if (line.replace(/\s/g, '').startsWith('答案') || line.includes('答案')) {
       // Extract text after "答案" and potential punctuation
       let ansString = "";
       if (line.includes('：')) {
           ansString = line.split('：')[1];
       } else if (line.includes(':')) {
           ansString = line.split(':')[1];
       } else {
           // Fallback if just "答案 A"
           ansString = line.replace(/答案[:：]?\s*/, '');
       }
       
       if (ansString) {
           ansString = ansString.trim();
           const indices: string[] = [];
           for (const char of ansString) {
               const code = char.toUpperCase().charCodeAt(0) - 65;
               if (code >= 0 && code <= 26) {
                   indices.push(String(code));
               }
           }
           currentQ.correctAnswers = indices;
           
           if (currentQ.text && currentQ.options.length > 0) {
               questions.push(currentQ as Question);
           }
           currentQ = { options: [] };
       }
    }
    else {
        // Append continuation lines
        if (currentQ.text && currentQ.options.length === 0 && !currentQ.correctAnswers) {
            currentQ.text += " " + line;
        }
        else if (currentQ.options.length > 0 && !currentQ.correctAnswers) {
            currentQ.options[currentQ.options.length - 1] += " " + line;
        }
    }
  }
  
  return questions;
};

const parseTrueFalseQuestions = (raw: string): Question[] => {
    const questions: Question[] = [];
    const lines = raw.split('\n').filter(l => l.trim());
    let idCounter = 0;

    for (const line of lines) {
        // Relaxed regex:
        // 1. Allow dot, comma, or space after number: [\.\,\、\s]
        // 2. Allow spaces inside brackets: [（(]\s* ... \s*[)）]
        const match = line.match(/^(\d+)[\.\,\、\s]\s*(.*)[（(]\s*([√×])\s*[)）]\s*$/);
        
        if (match) {
            const text = match[2].trim();
            const symbol = match[3];
            const isTrue = symbol === '√';
            
            questions.push({
                id: `${QuestionCategory.BOOLEAN}-${idCounter++}`,
                category: QuestionCategory.BOOLEAN,
                text: text,
                correctAnswers: [isTrue ? "true" : "false"],
                explanation: ''
            });
        }
    }
    return questions;
};

const singleChoiceQuestions = parseChoiceQuestions(rawSingleChoice, QuestionCategory.SINGLE);
const multiChoiceQuestions = parseChoiceQuestions(rawMultipleChoice, QuestionCategory.MULTI);
const booleanQuestions = parseTrueFalseQuestions(rawTrueFalse);

// Create map once for performance and lookup
const allQuestions = [...singleChoiceQuestions, ...multiChoiceQuestions, ...booleanQuestions];
const questionsMap = new Map(allQuestions.map(q => [q.id, q]));

// Store for Mock Questions
let currentMockQuestions: Question[] = [];

export const generateMockQuestions = () => {
    // Combine all questions
    const all = [...singleChoiceQuestions, ...multiChoiceQuestions, ...booleanQuestions];
    // Fisher-Yates shuffle
    for (let i = all.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [all[i], all[j]] = [all[j], all[i]];
    }
    // Pick first 20
    currentMockQuestions = all.slice(0, 20);
};

const getQuestionsByOriginalCategory = (originalCategory: QuestionCategory) => {
    const favIds = getFavorites();
    return favIds
        .map(id => questionsMap.get(id))
        .filter((q): q is Question => !!q && q.category === originalCategory);
};

export const getQuestions = (category: QuestionCategory): Question[] => {
  switch (category) {
    case QuestionCategory.SINGLE:
      return singleChoiceQuestions;
    case QuestionCategory.MULTI:
      return multiChoiceQuestions;
    case QuestionCategory.BOOLEAN:
      return booleanQuestions;
    case QuestionCategory.COLLECTION_SINGLE:
      return getQuestionsByOriginalCategory(QuestionCategory.SINGLE);
    case QuestionCategory.COLLECTION_MULTI:
        return getQuestionsByOriginalCategory(QuestionCategory.MULTI);
    case QuestionCategory.COLLECTION_BOOLEAN:
        return getQuestionsByOriginalCategory(QuestionCategory.BOOLEAN);
    case QuestionCategory.MOCK:
        return currentMockQuestions;
    default:
      return [];
  }
};

export const getCategoryTitle = (category: QuestionCategory): string => {
  switch (category) {
    case QuestionCategory.SINGLE:
      return "单项选择题";
    case QuestionCategory.MULTI:
      return "多项选择题";
    case QuestionCategory.BOOLEAN:
      return "判断题";
    case QuestionCategory.COLLECTION_SINGLE:
      return "错题集 - 单选";
    case QuestionCategory.COLLECTION_MULTI:
        return "错题集 - 多选";
    case QuestionCategory.COLLECTION_BOOLEAN:
        return "错题集 - 判断";
    case QuestionCategory.MOCK:
        return "模拟练习";
    default:
      return "";
  }
};

export const getCategoryCount = (category: QuestionCategory): number => {
   switch (category) {
    case QuestionCategory.SINGLE:
      return singleChoiceQuestions.length;
    case QuestionCategory.MULTI:
      return multiChoiceQuestions.length;
    case QuestionCategory.BOOLEAN:
      return booleanQuestions.length;
    case QuestionCategory.COLLECTION_SINGLE:
        return getQuestionsByOriginalCategory(QuestionCategory.SINGLE).length;
    case QuestionCategory.COLLECTION_MULTI:
        return getQuestionsByOriginalCategory(QuestionCategory.MULTI).length;
    case QuestionCategory.COLLECTION_BOOLEAN:
        return getQuestionsByOriginalCategory(QuestionCategory.BOOLEAN).length;
    case QuestionCategory.MOCK:
        return currentMockQuestions.length;
    default:
      return 0;
  }
};
