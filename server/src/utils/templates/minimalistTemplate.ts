// src/utils/templates/minimalistTemplate.ts
// 极简主义简历模板

interface WorkExperience {
  company: string;
  title: string;
  start_date: string;
  end_date: string;
  responsibilities?: string[];
}

interface Education {
  school: string;
  degree: string;
  major?: string;
  start_date: string;
  end_date: string;
}

interface ResumeJson {
  name?: string;
  phone?: string;
  email?: string;
  skills?: string[];
  work_experiences?: WorkExperience[];
  education?: Education;
  photo_base64?: string;
}

interface TemplateOptions {
  includePhoto?: boolean;
}

export function renderMinimalistTemplate(data: ResumeJson, options: TemplateOptions = {}): string {
  const includePhoto = options.includePhoto ?? false;
  const {
    name = '',
    phone = '',
    email = '',
    skills = [],
    work_experiences = [],
    education,
  } = data;

  const photo_base64 = includePhoto ? data.photo_base64 : null;

  const photoHtml = photo_base64
    ? `<div class="photo-container"><img src="${photo_base64}" alt="头像" class="photo" /></div>`
    : '';

  const skillsHtml = skills.length
    ? `<div class="section">
          <div class="section-title">Skills</div>
          <div class="skills-text">${skills.join(' · ')}</div>
        </div>`
    : '';

  const workExperiencesHtml = work_experiences.length
    ? `<div class="section">
          <div class="section-title">Experience</div>
          ${work_experiences.map(exp => `
            <div class="experience-item">
              <div class="exp-header">
                <span class="exp-company">${exp.company}</span>
                <span class="exp-period">${exp.start_date} — ${exp.end_date}</span>
              </div>
              <div class="exp-title">${exp.title}</div>
              ${exp.responsibilities?.length ? `
                <div class="exp-responsibilities">
                  ${exp.responsibilities.map(r => `<div class="resp-item">${r}</div>`).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>`
    : '';

  const educationHtml = education
    ? `<div class="section">
          <div class="section-title">Education</div>
          <div class="edu-item">
            <div class="edu-header">
              <span class="edu-school">${education.school}</span>
              <span class="edu-period">${education.start_date} — ${education.end_date}</span>
            </div>
            <div class="edu-degree">${education.degree}${education.major ? `, ${education.major}` : ''}</div>
          </div>
        </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} - Resume</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: A4;
      margin: 20mm 25mm 20mm 25mm;
    }

    body {
      font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
      font-size: 11px;
      line-height: 1.7;
      color: #222;
      background: #fff;
      width: 210mm;
      min-height: 297mm;
      padding: 25mm 30mm;
      margin: 0 auto;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .resume {
      width: 100%;
    }

    /* 头部区域 */
    .header {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .header-main {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }

    .name {
      font-size: 28px;
      font-weight: 300;
      color: #111;
      margin-bottom: 10px;
      letter-spacing: 3px;
    }

    .contact-info {
      font-size: 10px;
      color: #888;
      display: flex;
      gap: 20px;
    }

    .contact-item {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .photo-container {
      width: 50px;
      height: 50px;
      flex-shrink: 0;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .photo {
      max-width: 100%;
      max-height: 100%;
      object-fit: cover;
    }

    /* 区块样式 */
    .section {
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 11px;
      font-weight: 600;
      color: #111;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    /* 技能文字 */
    .skills-text {
      font-size: 11px;
      color: #555;
      line-height: 1.8;
    }

    /* 工作经历 */
    .experience-item {
      margin-bottom: 16px;
    }

    .exp-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
    }

    .exp-company {
      font-size: 12px;
      font-weight: 600;
      color: #111;
    }

    .exp-period {
      font-size: 9px;
      color: #999;
    }

    .exp-title {
      font-size: 10px;
      color: #666;
      margin-bottom: 4px;
    }

    .exp-responsibilities {
      padding-left: 0;
    }

    .resp-item {
      font-size: 10px;
      color: #555;
      line-height: 1.6;
      margin-bottom: 1px;
    }

    /* 教育背景 */
    .edu-item {
      page-break-inside: avoid;
    }

    .edu-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
    }

    .edu-school {
      font-size: 12px;
      font-weight: 600;
      color: #111;
    }

    .edu-period {
      font-size: 9px;
      color: #999;
    }

    .edu-degree {
      font-size: 10px;
      color: #555;
    }

    /* 打印优化 */
    @media print {
      body {
        width: auto;
        min-height: auto;
        padding: 20mm 25mm;
      }
    }
  </style>
</head>
<body>
  <div class="resume">
    <!-- 头部 -->
    <div class="header">
      <div class="header-main">
        <div>
          <div class="name">${name}</div>
          <div class="contact-info">
            ${phone ? `<span class="contact-item">${phone}</span>` : ''}
            ${email ? `<span class="contact-item">${email}</span>` : ''}
          </div>
        </div>
        ${photoHtml}
      </div>
    </div>

    <!-- 专业技能 -->
    ${skillsHtml}

    <!-- 工作经历 -->
    ${workExperiencesHtml}

    <!-- 教育背景 -->
    ${educationHtml}
  </div>
</body>
</html>`;
}

export const minimalistTemplate = {
  key: 'minimalist',
  name: '极简主义',
  hasPhoto: false,
  render: renderMinimalistTemplate,
};
