/// <reference no-default-lib="true" />
/// <reference lib="deno.ns" />
/// <reference lib="dom" />

declare interface ImportMeta {
  url: string
  main: boolean
}

declare namespace Deno {
  export const args: string[]
  export function exit(code?: number): never
  export function writeTextFile(path: string | URL, data: string | Uint8Array): Promise<void>
}
