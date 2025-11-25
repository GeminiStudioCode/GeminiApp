import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const explainQuestion = async (questionText: string, options: string[] | undefined, correctAnswer: string): Promise<string> => {
  const ai = getClient();
  if (!ai) return "请配置 API Key 以获取 AI 解析。";

  try {
    const prompt = `
      我正在做一个练习题。请简要解释为什么这是正确答案。
      
      问题: "${questionText}"
      ${options ? `选项: ${options.join(', ')}` : ''}
      正确答案: "${correctAnswer}"
      
      请用通俗易懂的中文解释，字数控制在100字以内。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "暂无解析";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 解析获取失败，请稍后重试。";
  }
};