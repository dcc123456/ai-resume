// src/utils/pdfGenerator.ts
import PDFDocument from 'pdfkit';
import { marked } from 'marked';

interface Token {
  type: string;
  text: string;
  depth?: number;
  raw?: string;
}

function tokenizeMarkdown(md: string): Token[] {
  const tokens: Token[] = marked.lexer(md) as Token[];
  return tokens;
}

export async function generatePdfBuffer(markdownText: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: 'Resume',
        Author: 'AI Resume Optimizer',
      },
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const tokens = tokenizeMarkdown(markdownText);
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    for (const token of tokens) {
      switch (token.type) {
        case 'heading': {
          const fontSize = token.depth === 1 ? 22 : token.depth === 2 ? 16 : 13;
          doc.font('Helvetica-Bold').fontSize(fontSize);
          doc.text(token.text, { width: pageWidth });

          if (token.depth === 2) {
            doc.moveDown(0.3);
            doc.moveTo(doc.x, doc.y)
              .lineTo(doc.x + pageWidth, doc.y)
              .strokeColor('#333333')
              .lineWidth(1)
              .stroke();
          }
          doc.moveDown(0.5);
          break;
        }
        case 'paragraph': {
          doc.font('Helvetica').fontSize(10);
          doc.text(token.text, { width: pageWidth, lineGap: 3 });
          doc.moveDown(0.5);
          break;
        }
        case 'list': {
          const items = (token as any).items || [];
          for (const item of items) {
            const text = typeof item === 'string' ? item : item.text || '';
            doc.font('Helvetica').fontSize(10);
            doc.text(`•  ${text}`, doc.page.margins.left + 15, doc.y, {
              width: pageWidth - 15,
              lineGap: 2,
            });
            doc.moveDown(0.2);
          }
          doc.moveDown(0.3);
          break;
        }
        case 'list_item': {
          doc.font('Helvetica').fontSize(10);
          doc.text(`•  ${token.text}`, doc.page.margins.left + 15, doc.y, {
            width: pageWidth - 15,
            lineGap: 2,
          });
          doc.moveDown(0.2);
          break;
        }
        case 'text': {
          doc.font('Helvetica').fontSize(10);
          doc.text(token.text, { width: pageWidth, lineGap: 3 });
          doc.moveDown(0.3);
          break;
        }
        case 'strong': {
          doc.font('Helvetica-Bold').fontSize(10);
          doc.text(token.text, { width: pageWidth, continued: false });
          doc.moveDown(0.2);
          break;
        }
        case 'hr': {
          doc.moveDown(0.5);
          doc.moveTo(doc.x, doc.y)
            .lineTo(doc.x + pageWidth, doc.y)
            .strokeColor('#cccccc')
            .lineWidth(0.5)
            .stroke();
          doc.moveDown(0.5);
          break;
        }
        default:
          if (token.text) {
            doc.font('Helvetica').fontSize(10);
            doc.text(token.text, { width: pageWidth, lineGap: 3 });
            doc.moveDown(0.3);
          }
          break;
      }
    }

    doc.end();
  });
}
