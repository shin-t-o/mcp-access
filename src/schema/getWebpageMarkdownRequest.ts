import puppeteer from "puppeteer"
import TurndownService from "turndown"
import { z } from "zod"

const WebpageMarkdownSchema = z.object({
  url: z.string().url(),
})

export const getWebpageMarkdown = async (args: Record<string, unknown> | undefined) => {
  const { url } = WebpageMarkdownSchema.parse(args)
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] })
  const page = await browser.newPage()
  const turndownService = new TurndownService()

  try {
    await page.goto(url, { waitUntil: "networkidle2" })
  } catch (error) {
    // console.error("Failed to open the page:", url, error)
    await browser.close()
    return {
      content: [
        {
          type: "text",
          text: `Failed to open the page: ${url}`,
        },
      ],
    }
  }

  // Extract and clean the body content
  const content = await page.evaluate(() => {
    // Remove unnecessary elements
    const selectorsToRemove = [
      "header",
      "footer",
      "nav",
      "script",
      "style",
      '[class*="nav"]', // CSSクラスに「nav」を含む要素
      '[class*="sidebar"]', // CSSクラスに「sidebar」を含む要素
      '[class*="menu"]', // CSSクラスに「menu」を含む要素
      '[id*="nav"]', // IDに「nav」を含む要素
      '[id*="sidebar"]', // IDに「sidebar」を含む要素
      '[id*="menu"]', // IDに「menu」を含む要素
    ]
    for (const selector of selectorsToRemove) {
      const elements = document.querySelectorAll(selector)
      for (const el of elements) {
        el.remove()
      }
    }

    // Try to get the main content
    const mainContent =
      document.querySelector("article") ||
      document.querySelector("main") ||
      document.querySelector("section") || // 対応範囲を拡大
      Array.from(document.querySelectorAll("div")) // テキスト量が多い要素を探す
        .sort((a, b) => b.innerText.length - a.innerText.length)[0]
    if (mainContent) {
      return mainContent.innerHTML
    }

    // Fallback to body if no main content found
    return document.body.innerHTML
  })

  const markdownContent = turndownService.turndown(content)

  // close browser + return content
  await browser.close()
  return {
    content: [
      {
        type: "text",
        text: markdownContent,
      },
    ],
  }
}
