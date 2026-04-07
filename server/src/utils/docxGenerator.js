// resume-ai/server/src/utils/docxGenerator.js
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');

function convertMarkdownToDocxElements(markdown) {
  const paragraphs = [];
  for (const line of markdown.split('\n')) {
    if (line.startsWith('# ')) {
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: line.slice(2), bold: true, size: 36 })], heading: HeadingLevel.HEADING_1, spacing: { after: 100 } }));
    } else if (line.startsWith('### ')) {
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: line.slice(4), bold: true, size: 24 })], heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 50 } }));
    } else if (line.startsWith('## ')) {
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: line.slice(3), bold: true, size: 28 })], heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }));
    } else if (line.startsWith('- ')) {
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: line.slice(2), size: 22 })], bullet: { level: 0 }, spacing: { after: 50 } }));
    } else if (line.trim() === '') {
      paragraphs.push(new Paragraph({ children: [] }));
    } else {
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: line, size: 22 })], spacing: { after: 50 } }));
    }
  }
  return paragraphs;
}

async function generateDocxBuffer(markdown) {
  const doc = new Document({ sections: [{ children: convertMarkdownToDocxElements(markdown) }] });
  return await Packer.toBuffer(doc);
}

module.exports = { generateDocxBuffer };
