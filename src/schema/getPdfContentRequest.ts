import * as fs from "node:fs";
import { Buffer } from "node:buffer";
import * as pdfjsLib from "npm:pdfjs-dist@4.10.38";
import type { TextItem } from "npm:pdfjs-dist@4.10.38/types/src/display/api.js";

export const getPdfContent = async (params: { pdfFilePath: string }) => {
  const { pdfFilePath } = params;
  try {
    const pathBuffer = Buffer.from(pdfFilePath);
    const filePath = pathBuffer.toString("utf8");

    // PDF ファイルのデータを Uint8Array 形式で読み込み
    const pdfData = new Uint8Array(fs.readFileSync(filePath));
    // PDF 読み込みタスクを生成
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    // PDFDocument を取得
    const pdfDocument = await loadingTask.promise;

    let fullText = "";

    // ページ数分ループして抽出
    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      const page = await pdfDocument.getPage(pageNumber);
      const textContent = await page.getTextContent();

      // items配列から文字列を取り出し、結合
      const pageText = textContent.items
        .map((item) => {
          if ((item as TextItem).str !== undefined) {
            return (item as TextItem).str;
          }
          return "";
        })
        .join("");

      // 改行など適宜入れる
      fullText += `${pageText}\n`;
    }

    return fullText;
  } catch (error) {
    console.error("Error reading PDF:", error);
    return "getPdfContent: Error reading PDF file.";
  }
};
