# MCP Access Template

自分用ツール
他で共有済みのもの

> URL

https://modelcontextprotocol.io/introduction

## 使い方

---

### インストールとビルド

```bash
npm ci
npm run build
```

### 設定ファイル編集

`claude_desktop_config.json` で指定

```json
{
  "mcpServers": {
    // free to name
    "mcp-access": {
      "command": "node",
      "args": ["path/to/dist/index.js"]
    }
    // ...（another plugins）
  }
}
```

<br />

## 機能メモ

---

上記を設定すると何ができるか

=====================

**ウェブページのテキスト抽出**

- `get-web-content` という名前で URL のウェブページのテキストを抽出する機能が追加される
- `url` という引数を受け取り、そのウェブページのテキストを返却する
  - サンプルプロンプト: `get-web-contentを用いてこのページの内容を要約してください -> http://example.com`

**PDF のテキスト抽出**

- `get-pdf-content` という名前で PDF ファイルのテキストを抽出する機能が追加される
- `pdfFilePath` という引数を受け取り、その PDF ファイルのテキストを返却する
  - サンプルプロンプト: `get-pdf-contentを用いて現在のパスにあるPDFの内容を取り込んでください`

**コマンドの実行**

- `command-execute` という名前でコマンドを実行する機能が追加される(ただしコード内で指定したもののみ)
- `command, cwd` という引数を受け取り、そのコマンドを実行する
  - サンプルプロンプト: `npm install, npm run build を実行して下さい`

=====================
