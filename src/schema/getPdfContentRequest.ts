import * as fs from "node:fs"
import * as path from "node:path"
import * as pdfjsLib from "pdfjs-dist"
import type { TextItem } from "pdfjs-dist/types/src/display/api.js"
import { z } from "zod"

const PdfContentSchema = z.object({
  pdfFilePath: z.string(),
})

export const getPdfContent = async (args: Record<string, unknown> | undefined) => {
  const { pdfFilePath } = PdfContentSchema.parse(args)
  const pathBuffer = Buffer.from(pdfFilePath)
  const filePath = pathBuffer.toString("utf8")

  // PDF ファイルのデータを Uint8Array 形式で読み込み
  const pdfData = new Uint8Array(fs.readFileSync(filePath))

  // PDF 読み込みタスクを生成
  const loadingTask = pdfjsLib.getDocument({ data: pdfData })

  // PDFDocument を取得
  const pdfDocument = await loadingTask.promise

  let fullText = ""

  // ページ数分ループして抽出
  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
    const page = await pdfDocument.getPage(pageNumber)
    const textContent = await page.getTextContent()

    // items配列から文字列を取り出し、結合
    const pageText = textContent.items
      .map((item) => {
        if ((item as TextItem).str !== undefined) {
          return (item as TextItem).str
        }
        return ""
      })
      .join("")

    // 改行など適宜入れる
    fullText += `${pageText}\n`
  }

  return {
    content: [
      {
        type: "text",
        text: fullText,
      },
    ],
  }
}
