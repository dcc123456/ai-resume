// src/prompts/resumeParse.ts
export const SYSTEM_PROMPT = '你是一位专业的HR助手。你的任务是从简历文本中提取结构化信息，输出严格的JSON格式。只输出JSON，不要有任何其他内容。如果某个字段无法从文本中提取，使用null。';

const USER_TEMPLATE = `请从以下简历文本中提取结构化信息，输出JSON。字段要求：
- name: 姓名（字符串）
- phone: 电话号码（字符串）
- email: 邮箱（字符串）
- work_experiences: 工作经历数组，每个元素包含 company, title, start_date, end_date, responsibilities数组
- education: 教育背景对象，包含 degree, major, school, start_date, end_date
- skills: 技能关键词数组

简历文本：
{resume_text}`;

export function buildResumeParsePrompt(resumeText: string): string {
  return USER_TEMPLATE.replace('{resume_text}', resumeText);
}
