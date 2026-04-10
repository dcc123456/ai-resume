// src/utils/pdfImageExtractor.ts
// 从 PDF 中提取图片（用于提取简历头像）
import { PDFDocument, PDFName, PDFRef, PDFRawStream } from 'pdf-lib';

interface ExtractedImage {
  base64: string;
  width: number;
  height: number;
  pageIndex: number;
}

function getImageMimeType(filterStr: string, colorSpaceStr: string): string {
  if (filterStr.includes('/DCTDecode')) return 'image/jpeg';
  if (filterStr.includes('/JPXDecode')) return 'image/jp2';
  if (filterStr.includes('/FlateDecode')) return 'image/png';
  if (colorSpaceStr === '/DeviceGray') return 'image/jpeg';
  return 'image/png';
}

export async function extractImagesFromPdf(pdfBuffer: Buffer): Promise<ExtractedImage[]> {
  const images: ExtractedImage[] = [];

  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const page = pages[pageIndex];

      // 获取页面的资源字典
      let resources: any = null;
      try {
        resources = page.node.get(PDFName.of('Resources'));
      } catch {
        continue;
      }
      if (!resources) continue;

      // 获取 XObject
      let xObject: any = null;
      try {
        xObject = resources.get(PDFName.of('XObject'));
      } catch {
        continue;
      }
      if (!xObject) continue;

      // 获取 page 的 context 用于解引用
      const context = page.doc.context;

      // 遍历 XObject 条目
      let entries: Array<[any, any]> = [];
      try {
        entries = [...xObject.entries()];
      } catch {
        continue;
      }

      for (const [nameKey, imageRef] of entries) {
        const keyStr = nameKey.toString();
        if (!keyStr.startsWith('/')) continue;

        try {
          // 解引用 - 使用 context.lookup
          let image: any = null;
          if (imageRef instanceof PDFRef) {
            image = context.lookup(imageRef);
          } else {
            image = imageRef;
          }

          if (!(image instanceof PDFRawStream)) continue;

          const imageDict = image.dict;

          // 检查是否是图片类型
          let subtype: any;
          try {
            subtype = imageDict.get(PDFName.of('Subtype'));
          } catch {
            continue;
          }
          if (!subtype || subtype.toString() !== '/Image') continue;

          // 获取尺寸
          let width = 0, height = 0;
          try {
            width = Number(imageDict.get(PDFName.of('Width'))) || 0;
            height = Number(imageDict.get(PDFName.of('Height'))) || 0;
          } catch {
            continue;
          }

          // 过滤太小的图片
          if (width < 50 || height < 50) continue;

          // 过滤太大的图片（可能是背景图）
          if (width > 600 || height > 800) continue;

          // 获取图片数据
          try {
            const filter = imageDict.get(PDFName.of('Filter'));
            const colorSpace = imageDict.get(PDFName.of('ColorSpace'));
            const mimeType = getImageMimeType(
              filter?.toString() || '',
              colorSpace?.toString() || ''
            );

            // 获取原始数据 - 使用 asUint8Array()
            const rawData = image.asUint8Array();
            if (!rawData || rawData.length === 0) continue;

            const base64 = `data:${mimeType};base64,${Buffer.from(rawData).toString('base64')}`;

            images.push({
              base64,
              width,
              height,
              pageIndex,
            });

            console.log(`[PDF图片提取] 发现图片: 页${pageIndex + 1}, 尺寸${width}x${height}, 类型${mimeType}, 数据长度${rawData.length}`);
          } catch (e: any) {
            console.log(`[PDF图片提取] 数据提取失败: ${e.message}`);
            continue;
          }
        } catch {
          continue;
        }
      }
    }
  } catch (err) {
    console.warn('[PDF图片提取] PDF 图片提取失败:', err);
  }

  return images;
}

// 根据尺寸比例智能判断哪个是头像
export function selectAvatarImage(images: ExtractedImage[]): string | null {
  if (images.length === 0) return null;
  if (images.length === 1) return images[0].base64;

  // 按尺寸排序，选择最接近证件照比例 (3:4 = 0.75 或 2:3 = 0.667)
  const sorted = images.sort((a, b) => {
    const ratioA = a.width / a.height;
    const ratioB = b.width / b.height;
    const targetRatio = 0.75; // 3:4
    return Math.abs(ratioA - targetRatio) - Math.abs(ratioB - targetRatio);
  });

  return sorted[0].base64;
}
