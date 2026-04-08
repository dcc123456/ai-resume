// src/llm/mockProvider.ts
import { BaseLLMProvider, LLMResponse, APIMessage } from './baseProvider';

export class MockLLMProvider extends BaseLLMProvider {
  constructor() {
    super('mock', 'mock-model', 'mock-key', 'http://localhost');
  }

  async _callAPI(messages: APIMessage[], options: { temperature: number; responseFormat: string }): Promise<{ content: string; usage: { total_tokens: number } }> {
    const userMsg = messages.find(m => m.role === 'user')?.content || '';
    const isJson = options.responseFormat === 'json';

    if (isJson) {
      // 根据请求内容生成模拟 JSON 响应
      if (userMsg.includes('简历') || userMsg.includes('resume')) {
        const mockResume = {
          name: "Zhang San",
          email: "zhangsan@example.com",
          phone: "138-0000-1234",
          location: "Beijing, China",
          education: [
            {
              school: "Beijing University of Technology",
              degree: "Bachelor",
              major: "Computer Science",
              startDate: "2018-09",
              endDate: "2022-06"
            }
          ],
          workExperience: [
            {
              company: "ByteDance",
              position: "Frontend Developer",
              startDate: "2022-07",
              endDate: "Present",
              description: "Developed and maintained TikTok web application using React and TypeScript. Optimized page loading performance by 40%. Built internal component library used by 10+ teams."
            }
          ],
          skills: ["JavaScript", "TypeScript", "React", "Vue.js", "Next.js", "Node.js", "MySQL", "MongoDB", "Docker", "Git"]
        };
        return { content: JSON.stringify(mockResume), usage: { total_tokens: 100 } };
      }

      if (userMsg.includes('职位') || userMsg.includes('JD') || userMsg.includes('job')) {
        const mockJD = {
          title: "Senior Frontend Developer",
          company: "Tech Company",
          location: "Beijing",
          hardSkills: ["React", "TypeScript", "Next.js", "Node.js", "CSS3", "HTML5", "Git", "CI/CD"],
          softSkills: ["Team collaboration", "Problem solving", "Communication"],
          experience: "3-5 years",
          education: "Bachelor degree or above in Computer Science"
        };
        return { content: JSON.stringify(mockJD), usage: { total_tokens: 100 } };
      }

      return { content: '{}', usage: { total_tokens: 10 } };
    }

    // 文本生成模式 - 生成模拟简历
    if (userMsg.includes('生成') || userMsg.includes('定制')) {
      const mockMarkdown = `# Zhang San

**Email:** zhangsan@example.com | **Phone:** 138-0000-1234 | **Location:** Beijing, China

## 求职意向

Senior Frontend Developer

## 工作经历

### ByteDance — Frontend Developer (2022.07 - Present)
- Developed and maintained TikTok web application using React and TypeScript
- Optimized page loading performance by 40% through code splitting and lazy loading
- Collaborated with UI/UX team to implement responsive design components
- Built internal component library used by 10+ teams across the organization

## 教育背景

### Beijing University of Technology — Bachelor (2018.09 - 2022.06)
Computer Science

## 专业技能

- **Languages:** JavaScript, TypeScript, Python, HTML5, CSS3
- **Frameworks:** React, Vue.js, Next.js, Node.js, Express
- **Tools:** Git, Docker, Webpack, Vite, Jest, CI/CD
- **Databases:** MySQL, MongoDB, Redis`;
      return { content: mockMarkdown, usage: { total_tokens: 200 } };
    }

    return { content: 'Mock response', usage: { total_tokens: 10 } };
  }
}
