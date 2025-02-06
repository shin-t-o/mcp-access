import { exec } from "node:child_process"
import { promisify } from "node:util"
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js"
import { z } from "zod"

const DEFAULT_ALLOWED_COMMANDS = ["ls", "mkdir", "cd", "npm", "npx", "node", "git", "rm"]

// const ALLOWED_COMMANDS_CONFIG: AllowedCommandConfig[] = [
//   { command: "npx", allowedArgs: ["tsc", "-p", "."] },
//   { command: "npm", allowedArgs: ["run", "build", "install"] },
//   // ... etc
// ]

const getAllowedCommands = (): string[] => {
  const envCommands = process.env.ALLOWED_COMMANDS
  if (!envCommands) {
    return DEFAULT_ALLOWED_COMMANDS
  }
  return envCommands.split(",").map((cmd) => cmd.trim())
}

const CommandExecuteSchema = z.object({
  command: z.string(),
  cwd: z.string(),
})

export const commandExecute = async (args: Record<string, unknown> | undefined) => {
  const { command, cwd } = CommandExecuteSchema.parse(args)

  const allowedCommands = getAllowedCommands()
  if (!allowedCommands.includes(command.split(" ")[0])) {
    throw new McpError(ErrorCode.InvalidParams, `Command not allowed: ${command}`)
  }

  try {
    const options = cwd ? { cwd } : {}
    const { stdout, stderr } = await promisify(exec)(command, options)
    return {
      content: [
        {
          type: "text",
          text: stdout + (stderr ? `\nSTDERR:\n${stderr}` : ""), // stdoutとstderrの両方を表示
        },
      ],
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        content: [
          {
            type: "text",
            text: `Command execution failed: ${error.message}`,
          },
        ],
      }
    }
    return {
      content: [
        {
          type: "text",
          text: "Command execution failed",
        },
      ],
    }
  }
}
