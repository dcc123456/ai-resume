// src/utils/templates/modernTemplate.ts
// 现代风格简历模板

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

export function renderModernTemplate(data: ResumeJson, options: TemplateOptions = {}): string {
  const includePhoto = options.includePhoto ?? true;
  const photo_base64 = includePhoto ? data.photo_base64 : null;

  const {
    name = '',
    phone = '',
    email = '',
    skills = [],
    work_experiences = [],
    education,
  } = data;

  const photoHtml = photo_base64
    ? `<div class="photo-wrapper"><img src="${photo_base64}" alt="头像" class="photo" /></div>`
    : '';

  const skillsHtml = skills.length
    ? `<div class="section">
          <div class="section-title">专业技能</div>
          <div class="skills-grid">
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
                <span class="exp-period accent">${exp.start_date} ~ ${exp.end_date}</span>
              </div>
              <div class="exp-title accent">${exp.title}</div>
              ${exp.responsibilities?.length ? `
                <ul class="exp-list">
                  ${exp.responsibilities.map(r => `<li>${r}</li>`).join('')}
                </ul>
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
              <span class="edu-period accent">${education.start_date} ~ ${education.end_date}</span>
            </div>
            <div class="edu-degree accent">${education.degree}${education.major ? ` · ${education.major}` : ''}</div>
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
      margin: 10mm 12mm 10mm 12mm;
    }

    body {
      font-family: 'Microsoft YaHei', 'PingFang SC', 'SimHei', sans-serif;
      font-size: 11px;
      line-height: 1.6;
      color: #2c3e50;
      background: #fff;
      width: 210mm;
      min-height: 297mm;
      padding: 12mm;
      margin: 0 auto;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .resume {
      width: 100%;
    }

    /* 头部区域 - 现代居中风格 */
    .header {
      text-align: center;
      margin-bottom: 18px;
      padding-bottom: 15px;
      border-bottom: 2px solid #3498db;
      position: relative;
    }

    .header-main {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
    }

    .photo-wrapper {
      width: 70px;
      height: 85px;
      border-radius: 4px;
      overflow: hidden;
      border: 2px solid #3498db;
      flex-shrink: 0;
    }

    .photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .header-content {
      text-align: left;
    }

    .name {
      font-size: 26px;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 8px;
      letter-spacing: 2px;
    }

    .contact-info {
      font-size: 10px;
      color: #7f8c8d;
      display: flex;
      gap: 15px;
      justify-content: flex-start;
    }

    .contact-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    /* 区块样式 */
    .section {
      margin-bottom: 16px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #fff;
      background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
      padding: 6px 12px;
      border-radius: 3px;
      margin-bottom: 10px;
      display: inline-block;
    }

    /* 技能标签 */
    .skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 4px 0;
    }

    .skill-tag {
      background: #ecf0f1;
      color: #2c3e50;
      padding: 4px 10px;
      border-radius: 15px;
      font-size: 10px;
      border: 1px solid #bdc3c7;
    }

    /* 工作经历 */
    .experience-item {
      margin-bottom: 14px;
      padding: 10px;
      background: #f8f9fa;
      border-left: 3px solid #3498db;
      border-radius: 0 4px 4px 0;
      page-break-inside: avoid;
    }

    .exp-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 4px;
    }

    .exp-company {
      font-size: 13px;
      font-weight: 700;
      color: #2c3e50;
    }

    .exp-period {
      font-size: 9px;
      color: #95a5a6;
    }

    .exp-title {
      font-size: 11px;
      color: #7f8c8d;
      margin-bottom: 6px;
    }

    .exp-list {
      padding-left: 18px;
      margin: 0;
    }

    .exp-list li {
      font-size: 10px;
      color: #555;
      line-height: 1.5;
      margin-bottom: 2px;
    }

    /* 教育背景 */
    .edu-item {
      padding: 10px;
      background: #f8f9fa;
      border-left: 3px solid #9b59b6;
      border-radius: 0 4px 4px 0;
      page-break-inside: avoid;
    }

    .edu-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 4px;
    }

    .edu-school {
      font-size: 13px;
      font-weight: 700;
      color: #2c3e50;
    }

    .edu-period {
      font-size: 9px;
      color: #95a5a6;
    }

    .edu-degree {
      font-size: 11px;
      color: #7f8c8d;
    }

    .accent {
      color: #3498db;
    }

    /* 打印优化 */
    @media print {
      body {
        width: auto;
        min-height: auto;
        padding: 10mm;
      }
    }
  </style>
</head>
<body>
  <div class="resume">
    <!-- 头部 -->
    <div class="header">
      <div class="header-main">
        ${photoHtml}
        <div class="header-content">
          <div class="name">${name}</div>
          <div class="contact-info">
            ${phone ? `<span class="contact-item">📱 ${phone}</span>` : ''}
            ${email ? `<span class="contact-item">✉️ ${email}</span>` : ''}
          </div>
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

export const modernTemplate = {
  key: 'modern',
  name: '现代风格',
  hasPhoto: true,
  render: renderModernTemplate,
};
