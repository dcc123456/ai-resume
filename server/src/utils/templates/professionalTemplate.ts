// src/utils/templates/professionalTemplate.ts
// 专业经典简历模板

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

export function renderProfessionalTemplate(data: ResumeJson, options: TemplateOptions = {}): string {
  const includePhoto = options.includePhoto ?? true;
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
          <div class="section-title">专业技能</div>
          <div class="skills-list">
            ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
        </div>`
    : '';

  const workExperiencesHtml = work_experiences.length
    ? `<div class="section">
          <div class="section-title">工作经历</div>
          ${work_experiences.map(exp => `
            <div class="experience-item">
              <div class="exp-header">
                <span class="exp-company">${exp.company}</span>
                <span class="exp-period">${exp.start_date} ~ ${exp.end_date}</span>
              </div>
              <div class="exp-title">${exp.title}</div>
              ${exp.responsibilities?.length ? `
                <div class="exp-responsibilities">
                  ${exp.responsibilities.map(r => `<div class="resp-item">• ${r}</div>`).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>`
    : '';

  const educationHtml = education
    ? `<div class="section">
          <div class="section-title">教育背景</div>
          <div class="edu-item">
            <div class="edu-header">
              <span class="edu-school">${education.school}</span>
              <span class="edu-period">${education.start_date} ~ ${education.end_date}</span>
            </div>
            <div class="edu-degree">${education.degree}${education.major ? ` · ${education.major}` : ''}</div>
          </div>
        </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} - 简历</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: A4;
      margin: 15mm 18mm 15mm 18mm;
    }

    body {
      font-family: 'Microsoft YaHei', 'SimHei', 'Noto Sans CJK SC', sans-serif;
      font-size: 11px;
      line-height: 1.6;
      color: #333;
      background: #fff;
      width: 210mm;
      min-height: 297mm;
      padding: 15mm 20mm;
      margin: 0 auto;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .resume {
      width: 100%;
    }

    /* 头部区域 */
    .header {
      display: flex;
      align-items: flex-start;
      gap: 18px;
      margin-bottom: 18px;
      padding-bottom: 14px;
      border-bottom: 1px solid #c0c0c0;
    }

    .header-content {
      flex: 1;
    }

    .name {
      font-size: 24px;
      font-weight: 700;
      color: #1e3a5f;
      margin-bottom: 8px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .contact-info {
      font-size: 10px;
      color: #555;
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      border-top: 1px solid #e0e0e0;
      padding-top: 8px;
      margin-top: 6px;
    }

    .contact-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .photo-container {
      width: 60px;
      height: 75px;
      flex-shrink: 0;
      border: 1px solid #1e3a5f;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
    }

    .photo {
      max-width: 100%;
      max-height: 100%;
      object-fit: cover;
    }

    /* 区块样式 */
    .section {
      margin-bottom: 16px;
    }

    .section-title {
      font-size: 13px;
      font-weight: 700;
      color: #1e3a5f;
      margin-bottom: 10px;
      padding-bottom: 4px;
      border-bottom: 1px solid #1e3a5f;
      display: inline-block;
    }

    /* 技能标签 */
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 4px 0;
    }

    .skill-tag {
      background: #f0f4f8;
      color: #1e3a5f;
      padding: 4px 12px;
      border-radius: 2px;
      font-size: 10px;
      border: 1px solid #c5d0db;
    }

    /* 工作经历 */
    .experience-item {
      margin-bottom: 14px;
      padding-left: 4px;
      page-break-inside: avoid;
    }

    .exp-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
    }

    .exp-company {
      font-size: 12px;
      font-weight: 700;
      color: #1e3a5f;
    }

    .exp-period {
      font-size: 9px;
      color: #888;
    }

    .exp-title {
      font-size: 10px;
      color: #555;
      margin-bottom: 5px;
    }

    .exp-responsibilities {
      padding-left: 10px;
    }

    .resp-item {
      font-size: 10px;
      color: #444;
      line-height: 1.6;
      margin-bottom: 2px;
    }

    /* 教育背景 */
    .edu-item {
      padding-left: 4px;
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
      color: #1e3a5f;
    }

    .edu-period {
      font-size: 9px;
      color: #888;
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
        padding: 12mm 15mm;
      }
    }
  </style>
</head>
<body>
  <div class="resume">
    <!-- 头部 -->
    <div class="header">
      ${photoHtml}
      <div class="header-content">
        <div class="name">${name}</div>
        <div class="contact-info">
          ${phone ? `<span class="contact-item">📱 ${phone}</span>` : ''}
          ${email ? `<span class="contact-item">✉️ ${email}</span>` : ''}
        </div>
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

export const professionalTemplate = {
  key: 'professional',
  name: '专业经典',
  hasPhoto: true,
  render: renderProfessionalTemplate,
};
