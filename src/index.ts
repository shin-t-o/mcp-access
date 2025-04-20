import { createToolsServer } from "jsr:@mizchi/mcp-helper";
import { StdioServerTransport } from "npm:@modelcontextprotocol/sdk@1.5.0/server/stdio.js";
import { z } from "zod";
import { commandExecute } from "./schema/commandExecuteRequest.ts";
import { getPdfContent } from "./schema/getPdfContentRequest.ts";
import { getUrlToMd } from "./schema/getUrlToMdRequest.ts";

// Define your tools with Zod schemas
const tools = [
  {
    name: "commandExecute",
    description:
      "Executes a command in the allowed list: ls / mkdir / cd / npm / npx / node / git",
    inputSchema: z.object({
      command: z.string(),
      cwd: z.string(),
    }),
    outputSchema: z.string(),
  },
  {
    name: "getUrlToMd",
    description: "Parses a web page into Markdown and returns it",
    inputSchema: z.object({
      url: z.string().url(),
      contentSelector: z.string().optional(),
    }),
    outputSchema: z.string(),
  },
  {
    name: "getPdfContent",
    description: "Text parsing and return of PDF content",
    inputSchema: z.object({
      pdfFilePath: z.string(),
    }),
    outputSchema: z.string(),
  },
] as const satisfies readonly {
  name: string;
  description: string;
  inputSchema: z.ZodTypeAny;
  outputSchema: z.ZodTypeAny;
}[];

// Create the server with type-safe handlers
const server = createToolsServer(
  {
    name: "mcp-access-deno",
    version: "1.0.0",
  },
  tools,
  // define handlers for all tools
  {
    commandExecute(params: { command: string; cwd: string }) {
      return commandExecute(params);
    },
    getUrlToMd(params: { url: string; contentSelector?: string }) {
      return getUrlToMd(params);
    },
    getPdfContent(params: { pdfFilePath: string }) {
      return getPdfContent(params);
    },
  },
);

if (import.meta.main) {
  await server.connect(new StdioServerTransport());
}

export default server;
