// src/utils/markdownRenderer.ts
interface ResumeJson {
  name?: string;
  phone?: string;
  email?: string;
  skills?: string[];
  work_experiences?: Array<{
    company: string;
    title: string;
    start_date: string;
    end_date: string;
    responsibilities?: string[];
  }>;
  education?: {
    degree: string;
    major?: string;
    school: string;
    start_date: string;
    end_date: string;
  };
}

export function renderMarkdown(resumeJson: ResumeJson): string {
  const lines: string[] = [];
  lines.push(`# ${resumeJson.name || ''}`);
  const contactParts: string[] = [];
  if (resumeJson.phone) contactParts.push(resumeJson.phone);
  if (resumeJson.email) contactParts.push(resumeJson.email);
  if (contactParts.length > 0) lines.push(contactParts.join(' | '));
  lines.push('');
  if (resumeJson.skills?.length) {
    lines.push('## 专业技能');
    lines.push(resumeJson.skills.join('、'));
    lines.push('');
  }
  if (resumeJson.work_experiences?.length) {
    lines.push('## 工作经历');
    for (const exp of resumeJson.work_experiences) {
      lines.push(`### ${exp.company} — ${exp.title}`);
      lines.push(`${exp.start_date} ~ ${exp.end_date}`);
      lines.push('');
      if (exp.responsibilities?.length) {
        for (const resp of exp.responsibilities) lines.push(`- ${resp}`);
        lines.push('');
      }
    }
  }
  if (resumeJson.education) {
    const edu = resumeJson.education;
    lines.push('## 教育背景');
    lines.push(`### ${edu.school}`);
    lines.push(`${edu.degree} · ${edu.major || ''}`);
    lines.push(`${edu.start_date} ~ ${edu.end_date}`);
    lines.push('');
  }
  return lines.join('\n');
}
