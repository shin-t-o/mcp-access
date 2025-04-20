import { exec } from "node:child_process";
import { promisify } from "node:util";
import {
  ErrorCode,
  McpError,
} from "npm:@modelcontextprotocol/sdk@1.5.0/types.js";

const DEFAULT_ALLOWED_COMMANDS = [
  "ls",
  "mkdir",
  "cd",
  "npm",
  "npx",
  "node",
  "git",
];

// const ALLOWED_COMMANDS_CONFIG: AllowedCommandConfig[] = [
//   { command: "npx", allowedArgs: ["tsc", "-p", "."] },
//   { command: "npm", allowedArgs: ["run", "build", "install"] },
//   // ... etc
// ]

const getAllowedCommands = (): string[] => {
  const envCommands = Deno.env.get("ALLOWED_COMMANDS");
  if (!envCommands) {
    return DEFAULT_ALLOWED_COMMANDS;
  }
  return envCommands.split(",").map((cmd) => cmd.trim());
};

export const commandExecute = async (
  params: { command: string; cwd: string },
) => {
  const { command, cwd } = params;

  const allowedCommands = getAllowedCommands();
  if (!allowedCommands.includes(command.split(" ")[0])) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Command not allowed: ${command}`,
    );
  }

  try {
    const options = cwd ? { cwd } : {};
    const { stdout, stderr } = await promisify(exec)(command, options);
    return stdout + (stderr ? `\nSTDERR:\n${stderr}` : ""); // stdoutとstderrの両方を表示
  } catch (error: unknown) {
    if (error instanceof Error) {
      return `commandExecute: Command execution failed: ${error.message}`;
    }
    return "commandExecute: Command execution failed";
  }
};
