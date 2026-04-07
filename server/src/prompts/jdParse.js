// resume-ai/server/src/prompts/jdParse.js
const SYSTEM_PROMPT = '你是一位资深招聘专家。你的任务是从职位描述中提取关键信息，输出严格的JSON格式。只输出JSON，不要有任何其他内容。';

const USER_TEMPLATE = `请从以下职位描述中提取关键信息，输出JSON。字段要求：
- title: 职位名称（字符串）
- hard_skills: 硬技能关键词数组（如编程语言、工具、框架等，每个关键词2-6个字）
- soft_skills: 软技能关键词数组
- exp_years: 所需经验年数（数字，如无法确定则为null）
- edu_level: 学历要求（字符串，如"本科""硕士""不限"）

职位描述：
{jd_text}`;

function buildJDParsePrompt(jdText) {
  return USER_TEMPLATE.replace('{jd_text}', jdText);
}

module.exports = { SYSTEM_PROMPT, buildJDParsePrompt };
