// src/utils/templates/creativeTemplate.ts
// 创意信息图简历模板

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

export function renderCreativeTemplate(data: ResumeJson, options: TemplateOptions = {}): string {
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

  // 技能进度条样式
  const skillsHtml = skills.length
    ? `<div class="section skills-section">
          <div class="section-title">专业技能</div>
          <div class="skills-grid">
            ${skills.map((skill, index) => `
              <div class="skill-item">
                <div class="skill-icon">★</div>
                <div class="skill-content">
                  <div class="skill-name">${skill}</div>
                  <div class="skill-bar">
                    <div class="skill-progress" style="width: ${75 + (index * 5) % 20}%"></div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>`
    : '';

  const workExperiencesHtml = work_experiences.length
    ? `<div class="section">
          <div class="section-title">工作经历</div>
          ${work_experiences.map(exp => `
            <div class="experience-card">
              <div class="card-header">
                <span class="card-company">${exp.company}</span>
                <span class="card-period">${exp.start_date} ~ ${exp.end_date}</span>
              </div>
              <div class="card-title">${exp.title}</div>
              ${exp.responsibilities?.length ? `
                <ul class="card-list">
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
          <div class="edu-card">
            <div class="card-header">
              <span class="card-company">${education.school}</span>
              <span class="card-period">${education.start_date} ~ ${education.end_date}</span>
            </div>
            <div class="card-title">${education.degree}${education.major ? ` · ${education.major}` : ''}</div>
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
      color: #333;
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

    /* 头部区域 - 蓝绿渐变 */
    .header {
      background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 18px;
      color: #fff;
    }

    .photo-container {
      width: 70px;
      height: 85px;
      flex-shrink: 0;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid rgba(255,255,255,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.2);
    }

    .photo {
      max-width: 100%;
      max-height: 100%;
      object-fit: cover;
    }

    .header-content {
      flex: 1;
    }

    .name {
      font-size: 24px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 8px;
      letter-spacing: 2px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }

    .contact-info {
      font-size: 10px;
      color: rgba(255,255,255,0.9);
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .contact-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    /* 区块样式 */
    .section {
      margin-bottom: 14px;
    }

    .section-title {
      font-size: 13px;
      font-weight: 700;
      color: #00b894;
      margin-bottom: 10px;
      padding-bottom: 4px;
      border-bottom: 2px solid #00b894;
      display: inline-block;
    }

    /* 技能区域 */
    .skills-section {
      background: #f8fffe;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #e0f7f5;
    }

    .skills-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .skill-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .skill-icon {
      color: #00b894;
      font-size: 12px;
      width: 16px;
      text-align: center;
    }

    .skill-content {
      flex: 1;
    }

    .skill-name {
      font-size: 10px;
      color: #333;
      margin-bottom: 3px;
    }

    .skill-bar {
      height: 4px;
      background: #e0f7f5;
      border-radius: 2px;
      overflow: hidden;
    }

    .skill-progress {
      height: 100%;
      background: linear-gradient(90deg, #00b894 0%, #00cec9 100%);
      border-radius: 2px;
    }

    /* 经验卡片 */
    .experience-card {
      background: #fff;
      border-left: 4px solid #00b894;
      padding: 12px;
      margin-bottom: 10px;
      border-radius: 0 6px 6px 0;
      box-shadow: 0 2px 8px rgba(0,184,148,0.1);
      page-break-inside: avoid;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 4px;
    }

    .card-company {
      font-size: 12px;
      font-weight: 700;
      color: #2d3436;
    }

    .card-period {
      font-size: 9px;
      color: #00b894;
    }

    .card-title {
      font-size: 10px;
      color: #636e72;
      margin-bottom: 6px;
    }

    .card-list {
      padding-left: 16px;
      margin: 0;
    }

    .card-list li {
      font-size: 10px;
      color: #555;
      line-height: 1.5;
      margin-bottom: 2px;
    }

    /* 教育卡片 */
    .edu-card {
      background: #fff;
      border-left: 4px solid #fd79a8;
      padding: 12px;
      border-radius: 0 6px 6px 0;
      box-shadow: 0 2px 8px rgba(253,121,168,0.1);
      page-break-inside: avoid;
    }

    .edu-card .card-period {
      color: #fd79a8;
    }

    /* 打印优化 */
    @media print {
      body {
        width: auto;
        min-height: auto;
        padding: 10mm;
      }
      .header {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
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

export const creativeTemplate = {
  key: 'creative',
  name: '创意信息图',
  hasPhoto: true,
  render: renderCreativeTemplate,
};
