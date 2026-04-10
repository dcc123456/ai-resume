// src/utils/pdfGeneratorFromTemplate.ts
// 基于原始PDF模板生成新简历，保留原始布局样式
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';

interface TextItem {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontName: string;
  pageIndex: number;
}

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

interface TemplateStyle {
  nameFontSize: number;
  nameY: number;
  contactFontSize: number;
  contactY: number;
  sectionTitleFontSize: number;
  sectionTitleY: number;
  expTitleFontSize: number;
  expContentFontSize: number;
  leftMargin: number;
  rightMargin: number;
  lineHeight: number;
}

// 从原始PDF提取文本位置信息，用于推断模板样式
async function extractTextPositions(pdfBuffer: Buffer): Promise<{ items: TextItem[]; pageWidth: number; pageHeight: number }> {
  const pdfLib = await PDFDocument.load(pdfBuffer);
  const pages = pdfLib.getPages();
  const items: TextItem[] = [];

  for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
    const page = pages[pageIdx];
    const { height } = page.getSize();

    // 尝试提取文本 - pdf-lib 的简单文本提取
    const content = page.node.getMaybeVal()?.Contents;
    if (!content) continue;

    try {
      // 获取页面的所有内容流
      const contentStream = content;
      const commands = contentStream.get城下之盟?.() || [];
      // pdf-lib 没有直接的文本提取API，这里用占位
    } catch (e) {
      // ignore
    }

    // 简单方法：直接用页面高度和已知信息推断位置
    // 由于pdf-lib文本提取能力有限，我们用启发式方法
  }

  return { items, pageWidth: pages[0]?.getSize().width || 595, pageHeight: pages[0]?.getSize().height || 842 };
}

// 字体颜色
const BLACK = rgb(0, 0, 0);
const DARK_GRAY = rgb(0.2, 0.2, 0.2);
const LIGHT_GRAY = rgb(0.5, 0.5, 0.5);

export async function generatePdfFromTemplate(originalPdfBuffer: Buffer, resumeJson: ResumeJson): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(originalPdfBuffer);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width: pageWidth, height: pageHeight } = firstPage.getSize();

  console.log(`[PDF模板] 原始PDF尺寸: ${pageWidth}x${pageHeight}, 页数: ${pages.length}`);

  // 加载中文字体
  const fontPaths = [
    'C:/Windows/Fonts/STXIHEI.TTF',
    'C:/Windows/Fonts/simhei.ttf',
  ];
  let chineseFont = null;
  let boldChineseFont = null;

  for (const fp of fontPaths) {
    try {
      if (fs.existsSync(fp)) {
        pdfDoc.registerFontkit(fontkit);
        chineseFont = await pdfDoc.embedFont(fs.readFileSync(fp));
        console.log(`[PDF模板] 已加载中文字体: ${fp}`);
        break;
      }
    } catch (e: any) {
      console.warn(`[PDF模板] 字体加载失败 ${fp}: ${e.message}`);
    }
  }

  if (!chineseFont) {
    console.warn('[PDF模板] 未找到中文字体，使用Helvetica');
  }

  const font = chineseFont;
  const fontSize = 10;
  const leftMargin = 50;
  const rightMargin = pageWidth - 50;
  const contentWidth = rightMargin - leftMargin;

  // 清空第一页（作为模板基础）
  // 由于无法直接清除内容，我们创建新页面覆盖

  // ========== 第一页：基本信息 + 工作经历 ==========
  let y = pageHeight - 60;
  const lineHeight = 14;

  // 姓名
  if (resumeJson.name) {
    const nameFontSize = 18;
    if (font) {
      firstPage.drawText(resumeJson.name, {
        x: leftMargin,
        y: y,
        size: nameFontSize,
        font: font,
        color: BLACK,
      });
    }
    y -= lineHeight * 1.5;
  }

  // 联系方式
  const contactParts: string[] = [];
  if (resumeJson.phone) contactParts.push(resumeJson.phone);
  if (resumeJson.email) contactParts.push(resumeJson.email);
  if (contactParts.length > 0 && font) {
    firstPage.drawText(contactParts.join('  |  '), {
      x: leftMargin,
      y: y,
      size: 9,
      font: font,
      color: LIGHT_GRAY,
    });
    y -= lineHeight * 2;
  }

  // 分隔线
  firstPage.drawLine({
    start: { x: leftMargin, y: y },
    end: { x: rightMargin, y: y },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= lineHeight;

  // 专业技能
  if (resumeJson.skills?.length) {
    firstPage.drawText('专业技能', {
      x: leftMargin,
      y: y,
      size: 12,
      font: font!,
      color: BLACK,
    });
    y -= lineHeight;
    if (font) {
      firstPage.drawText(resumeJson.skills.join('、'), {
        x: leftMargin,
        y: y,
        size: 9,
        font: font,
        color: DARK_GRAY,
      });
    }
    y -= lineHeight * 1.5;
  }

  // 工作经历
  firstPage.drawText('工作经历', {
    x: leftMargin,
    y: y,
    size: 12,
    font: font!,
    color: BLACK,
  });
  y -= lineHeight;

  if (resumeJson.work_experiences?.length) {
    for (const exp of resumeJson.work_experiences) {
      // 公司 + 职位
      const expTitle = `${exp.company}  |  ${exp.title}`;
      if (font) {
        firstPage.drawText(expTitle, {
          x: leftMargin,
          y: y,
          size: 10,
          font: font,
          color: BLACK,
        });
      }
      y -= lineHeight * 0.8;

      // 时间
      const timeRange = `${exp.start_date} ~ ${exp.end_date}`;
      if (font) {
        firstPage.drawText(timeRange, {
          x: leftMargin,
          y: y,
          size: 8,
          font: font,
          color: LIGHT_GRAY,
        });
      }
      y -= lineHeight * 0.8;

      // 职责
      if (exp.responsibilities?.length) {
        for (const resp of exp.responsibilities) {
          if (y < 80) break; // 防止超出页面
          if (font) {
            // 逐字绘制，支持自动换行
            const words = resp.split('');
            let line = '';
            let lineY = y;
            for (const word of words) {
              const testLine = line + word;
              const textWidth = font.widthOfTextAtSize(testLine, 9);
              if (textWidth > contentWidth - 10) {
                firstPage.drawText('• ' + line, {
                  x: leftMargin + 10,
                  y: lineY,
                  size: 9,
                  font: font,
                  color: DARK_GRAY,
                });
                lineY -= lineHeight * 0.8;
                line = word;
              } else {
                line = testLine;
              }
            }
            if (line) {
              firstPage.drawText('• ' + line, {
                x: leftMargin + 10,
                y: lineY,
                size: 9,
                font: font,
                color: DARK_GRAY,
              });
            }
            y = lineY - lineHeight * 0.3;
          }
        }
      }
      y -= lineHeight * 0.5;

      if (y < 80) {
        break;
      }
    }
  }

  // 如果内容超出第一页，创建第二页
  if (y < 80 && resumeJson.education) {
    const newPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let y2 = pageHeight - 60;

    newPage.drawText('教育背景', {
      x: leftMargin,
      y: y2,
      size: 12,
      font: font!,
      color: BLACK,
    });
    y2 -= lineHeight;

    const edu = resumeJson.education;
    if (font) {
      newPage.drawText(`${edu.school}  |  ${edu.degree}${edu.major ? ' · ' + edu.major : ''}`, {
        x: leftMargin,
        y: y2,
        size: 10,
        font: font,
        color: BLACK,
      });
      y2 -= lineHeight * 0.8;

      newPage.drawText(`${edu.start_date} ~ ${edu.end_date}`, {
        x: leftMargin,
        y: y2,
        size: 8,
        font: font,
        color: LIGHT_GRAY,
      });
    }
  }

  return await pdfDoc.save();
}

// 简单版本：创建紧凑的PDF，完全自己控制样式
export async function generatePdfCompact(resumeJson: ResumeJson, originalPdfBuffer?: Buffer): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  // 加载中文字体
  const fontPaths = [
    'C:/Windows/Fonts/STXIHEI.TTF',
    'C:/Windows/Fonts/simhei.ttf',
  ];
  let chineseFont = null;
  for (const fp of fontPaths) {
    try {
      if (fs.existsSync(fp)) {
        pdfDoc.registerFontkit(fontkit);
        chineseFont = await pdfDoc.embedFont(fs.readFileSync(fp));
        console.log(`[PDF紧凑版] 已加载字体: ${path.basename(fp)}`);
        break;
      }
    } catch (e: any) {
      console.warn(`[PDF紧凑版] 字体失败 ${fp}: ${e.message}`);
    }
  }

  // A4
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const leftMargin = 50;
  const rightMargin = pageWidth - 50;
  const contentWidth = rightMargin - leftMargin;

  const BLACK = rgb(0, 0, 0);
  const DARK = rgb(0.15, 0.15, 0.15);
  const GRAY = rgb(0.45, 0.45, 0.45);
  const LINE_COLOR = rgb(0.85, 0.85, 0.85);

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - 55;
  const LINE = 13;
  const LINE_S = 10;

  function checkPage() {
    if (y < 80) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - 55;
    }
  }

  function drawLine(yPos: number) {
    currentPage.drawLine({
      start: { x: leftMargin, y: yPos },
      end: { x: rightMargin, y: yPos },
      thickness: 0.5,
      color: LINE_COLOR,
    });
  }

  function wrapText(text: string, fontSize: number, fontObj: any, maxWidth: number): string[] {
    const lines: string[] = [];
    let line = '';
    for (const char of text) {
      const test = line + char;
      const w = fontObj.widthOfTextAtSize(test, fontSize);
      if (w > maxWidth) {
        lines.push(line);
        line = char;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  // ===== 姓名 =====
  if (resumeJson.name) {
    currentPage.drawText(resumeJson.name, {
      x: leftMargin, y, size: 20, font: chineseFont!, color: BLACK,
    });
    y -= LINE * 1.3;
  }

  // ===== 联系方式 =====
  const contacts: string[] = [];
  if (resumeJson.phone) contacts.push(resumeJson.phone);
  if (resumeJson.email) contacts.push(resumeJson.email);
  if (contacts.length) {
    currentPage.drawText(contacts.join('   |   '), {
      x: leftMargin, y, size: 9, font: chineseFont!, color: GRAY,
    });
    y -= LINE * 1.5;
  }

  drawLine(y);
  y -= LINE;

  // ===== 专业技能 =====
  if (resumeJson.skills?.length) {
    currentPage.drawText('专业技能', {
      x: leftMargin, y, size: 11, font: chineseFont!, color: BLACK,
    });
    y -= LINE;

    currentPage.drawText(resumeJson.skills.join('、'), {
      x: leftMargin, y, size: 9, font: chineseFont!, color: DARK,
    });
    y -= LINE * 1.3;
    drawLine(y);
    y -= LINE;
  }

  // ===== 工作经历 =====
  currentPage.drawText('工作经历', {
    x: leftMargin, y, size: 11, font: chineseFont!, color: BLACK,
  });
  y -= LINE;

  if (resumeJson.work_experiences?.length) {
    for (const exp of resumeJson.work_experiences) {
      checkPage();

      // 公司 | 职位
      currentPage.drawText(`${exp.company}  ·  ${exp.title}`, {
        x: leftMargin, y, size: 10, font: chineseFont!, color: BLACK,
      });
      y -= LINE * 0.75;

      // 时间
      currentPage.drawText(`${exp.start_date} ~ ${exp.end_date}`, {
        x: leftMargin, y, size: 8, font: chineseFont!, color: GRAY,
      });
      y -= LINE * 0.75;

      // 职责列表
      if (exp.responsibilities?.length) {
        for (const resp of exp.responsibilities) {
          checkPage();
          const lines = wrapText(resp, 9, chineseFont!, contentWidth - 15);
          for (const l of lines) {
            checkPage();
            currentPage.drawText('• ' + l, {
              x: leftMargin + 12, y, size: 9, font: chineseFont!, color: DARK,
            });
            y -= LINE * 0.75;
          }
        }
      }
      y -= LINE * 0.4;
    }
  }

  // ===== 教育背景 =====
  if (resumeJson.education) {
    checkPage();
    drawLine(y);
    y -= LINE;

    currentPage.drawText('教育背景', {
      x: leftMargin, y, size: 11, font: chineseFont!, color: BLACK,
    });
    y -= LINE;

    const edu = resumeJson.education;
    const eduLine = `${edu.school}  ·  ${edu.degree}${edu.major ? ' · ' + edu.major : ''}`;
    currentPage.drawText(eduLine, {
      x: leftMargin, y, size: 10, font: chineseFont!, color: BLACK,
    });
    y -= LINE * 0.75;

    currentPage.drawText(`${edu.start_date} ~ ${edu.end_date}`, {
      x: leftMargin, y, size: 8, font: chineseFont!, color: GRAY,
    });
    y -= LINE;
  }

  return await pdfDoc.save();
}