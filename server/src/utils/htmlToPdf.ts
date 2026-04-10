// src/utils/htmlToPdf.ts
// 使用 Puppeteer 将 HTML 转换为 PDF，保留完整样式
import puppeteer from 'puppeteer';

export async function htmlToPdfBuffer(htmlContent: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();

    // 设置内容
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });

    // 等待字体加载
    await page.evaluateHandle('document.fonts.ready');

    // 生成 PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
