// resume-ai/server/src/prompts/resumeGenerate.js
const SYSTEM_PROMPT = '你是一位资深简历顾问。你的任务是根据职位描述和基础简历，生成一份高度匹配的定制化简历。严格遵守事实，绝不编造经历。';

const USER_TEMPLATE = `根据【职位描述】和【基础简历】生成定制化简历JSON，规则：
1. 禁止修改公司名称、职位名称、起止时间——这些是事实信息，必须与基础简历完全一致。
2. 重写工作职责描述，自然融入JD中的硬技能关键词，使用STAR法则（情境Situation、任务Task、行动Action、结果Result）。
3. 可以调整工作经历的顺序，将与JD最相关的经历放在前面。
4. 如果某段经历与JD完全无关，保留但简化描述。
5. 输出JSON格式必须与基础简历完全一致（name, phone, email, work_experiences, education, skills）。
6. skills 数组应包含基础简历中与JD匹配的技能，并补充JD中要求但简历中体现的相关技能。

【职位描述】
{jd_text}

【基础简历】
{base_json}`;

function buildGeneratePrompt(jdText, baseJson) {
  return USER_TEMPLATE.replace('{jd_text}', jdText).replace('{base_json}', JSON.stringify(baseJson, null, 2));
}

const RETRY_APPEND = '\n\n重要提醒：你上一次的输出中修改了公司名/职位名/时间，这是严格禁止的。请重新生成，确保这些字段与基础简历完全一致。';

module.exports = { SYSTEM_PROMPT, buildGeneratePrompt, RETRY_APPEND };
