# MCP Access Template

tools for personal use  
previous: nodejs -> deno

## Settings

```json
{
  "mcpServers": {
    "mcp-access-deno": {
      "command": "deno", // OR full-path
      "args": ["run", "-A", "PROJEC_DIR/src/index.ts"],
      "env": {}
    }
  }
}
```

<br />

## Tools

### List

- `commandExecute`
  - Execute a command in the allowed list
- `getUrlToMd`
  - Parse a web page into Markdown and return it
- `getPdfContent`
  - Text parsing and return of PDF content

### Libraries

- `createToolsServer`
  - https://jsr.io/@mizchi/mcp-helper
  - https://zenn.dev/mizchi/articles/deno-mcp-server

### MCP Inspector

> The MCP inspector is a developer tool for testing and debugging MCP servers.

```bash
$ npx @modelcontextprotocol/inspector deno run -A src/index.ts
```

<br />

## Trouble shooting

### Workaround

#### pdfjs-dist
> How to remove `Warning: Please use the `legacy` build in Node.js environments.` (since this console message inhibits MCP startup)

```js:node_modules/pdfjs-dist/build/pdf.mjs
// if (isNodeJS) {
//   warn("Please use the `legacy` build in Node.js environments.");
// }
```

## Exec locally

```bash
# start locally
$ deno run -A src/index.ts

# exec
$ {"jsonrpc":"2.0","id":"toolcall-1","method":"tools/call","params":{"name":"getUrlToMd","arguments":{"url":"https://code.visualstudio.com/docs/editing/intellisense"}}}

# ---
# start locally + exec + save result
$ echo '{"jsonrpc":"2.0","id":"toolcall-1","method":"tools/call","params":{"name":"getUrlToMd","arguments":{"url":"https://code.visualstudio.com/docs/editing/intellisense"}}}' | \
    deno run -A src/index.ts | \
    grep "result" | \
    jq -r '.result.content[0].text | fromjson' > example.md
```
