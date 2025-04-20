import { Readability } from "npm:@mozilla/readability";
import { Window } from "npm:happy-dom";
import { cheerio } from "https://deno.land/x/cheerio@1.0.7/mod.ts";
import TurndownService from "turndown";

export const getUrlToMd = async (params: {
  url: string;
  contentSelector?: string;
}) => {
  const { url, contentSelector } = params;
  const turndownService = new TurndownService();

  try {
    // 通常のfetchでHTMLを取得
    const response = await fetch(url);
    const html = await response.text();

    // cheerioでの前処理
    const $ = cheerio.load(html);
    $("script,style,link,img,video").remove();

    // contentSelectorが指定されている場合は使用
    const targetHtml = contentSelector ? $(contentSelector).html() : $.html();

    if (!targetHtml) {
      return `No content found for: ${url}`;
    }

    // happy-domでDOM環境を構築
    const window = new Window({
      url,
      settings: {
        disableJavaScriptFileLoading: true,
        disableJavaScriptEvaluation: true,
        disableCSSFileLoading: true,
      },
    });

    window.document.write(targetHtml);
    await window.happyDOM.waitUntilComplete();

    // Readabilityでコンテンツ抽出
    const article = new Readability(window.document as unknown as Document)
      .parse();
    await window.happyDOM.close();

    if (!article) {
      return `Failed to extract content from: ${url}`;
    }

    return turndownService.turndown(article.content); // Convert to Markdown
  } catch (error) {
    console.error("Error during webpage parsing:", error);
    return `Error processing: ${url}`;
  }
};
