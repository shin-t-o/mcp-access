import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js"
import { z } from "zod"
import { commandExecute } from "./schema/commandExecuteRequest.js"
import { getPdfContent } from "./schema/getPdfContentRequest.js"
import { getWebpageMarkdown } from "./schema/getWebpageMarkdownRequest.js"

// Create server instance
const server = new Server(
  {
    name: "custom-access",
    version: "1.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
)

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get-webpage-markdown",
        description: "Parses a web page into Markdown and returns it",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The URL of the web page to parse",
            },
          },
          required: ["url"],
        },
      },
      {
        name: "get-pdf-content",
        description: "Text parsing and return of PDF content",
        inputSchema: {
          type: "object",
          properties: {
            pdfFilePath: {
              type: "string",
              description: "The filepath of the PDF file to parse",
            },
          },
          required: ["pdfFilePath"],
        },
      },
      {
        name: "command-execute",
        description: "Executes a command in the allowed list: ls / mkdir / cd / npm / npx / node / git / rm",
        inputSchema: {
          type: "object",
          properties: {
            command: {
              type: "string",
              description: "The command(command only) to execute on Windows PowerShell",
            },
            cwd: {
              type: "string",
              description: "Working directory at command execution",
            },
          },
          required: ["command", "cwd"],
        },
      },
    ],
  }
})

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      case "get-webpage-markdown":
        return await getWebpageMarkdown(args)
      case "get-pdf-content":
        return await getPdfContent(args)
      case "command-execute":
        return await commandExecute(args)
      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid arguments: ${error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`)
    }
    throw error
  }
})

// Start the server
const main = async () => {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error("Custom Browser MCP Server running on stdio")
}

main().catch((error) => {
  console.error("Fatal error in main():", error)
  process.exit(1)
})
