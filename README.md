# KNN CC Check ｜ Claude Code 習熟度診断

Claude Code と AI 駆動開発の習熟度を『知識』と『実践』の2軸で測る、研修用の診断 Web アプリです。全10問・所要約4分。氏名は不要で、受講番号のみで匿名集計します。

外部ライブラリ・ビルド不要。単一の `index.html` だけで完結します（Web フォントのみ CDN 読み込み）。

---

## 特徴

- **2軸診断**：各領域を「知っている度（Knowledge / 0〜3）」と「やったことがある度（Practice / 0〜3）」の2軸で採点。合計 0〜60 点。
- **5段階レベル判定**：観測者 → 体験者 → 実装者 → 自動化者 → 設計者。
- **タイプ判定**：知識と実践の差から「評論家型・職人型・バランス型」を判定。
- **レベル別の次の課題**：診断結果に応じて、次にやるべき具体的な課題を3つ提示。
- **10領域レーダーチャート**：知識と実践の分布を SVG で可視化。
- **集計連携**：Google スプレッドシートへの送信、1行コピー（タブ区切り）、CSV 保存に対応。

---

## 診断する10領域

| # | 領域 | 内容 |
|---|------|------|
| 1 | ターミナル | CLI の基本操作（cd / ls / mkdir） |
| 2 | 導入・起動 | Claude Code のインストールと起動 |
| 3 | CLAUDE.md | プロジェクト記憶ファイル |
| 4 | 文脈管理 | /clear・/compact・計画モード・/rewind |
| 5 | Git / GitHub | commit・push・リポジトリ |
| 6 | Web 公開 | Vercel・GitHub Pages へのデプロイ |
| 7 | MCP／AI秘書 | 外部サービス連携（Gmail・Sheets 等） |
| 8 | 型化 | Skills・サブエージェント |
| 9 | 自動化 | Hooks・定期実行 |
| 10 | 他社比較 | Codex CLI・Gemini CLI・Gemini Spark 等 |

---

## レベル判定

| LV | 点数 | 名称 |
|----|------|------|
| 0 | 0〜11 | 観測者 ｜ Observer |
| 1 | 12〜23 | 体験者 ｜ Explorer |
| 2 | 24〜35 | 実装者 ｜ Builder |
| 3 | 36〜47 | 自動化者 ｜ Operator |
| 4 | 48〜60 | 設計者 ｜ Architect |

---

## ローカルで動かす

ビルド不要です。ファイルをブラウザで開くだけで動きます。

```bash
git clone https://github.com/paulkanda/knn-cc-check.git
cd knn-cc-check
open index.html
```

---

## Vercel で公開する

このリポジトリを Vercel に接続すると、`index.html` がそのまま静的サイトとして公開されます。フレームワークの選択は不要（Other）です。

1. [vercel.com](https://vercel.com) にログイン
2. `Add New...` → `Project`
3. この GitHub リポジトリを選択
4. `Deploy` を押す

以後、`main` ブランチに push するたびに自動で再デプロイされます。

---

## スプレッドシート集計を有効にする（任意）

診断結果を Google スプレッドシートに自動集計したい場合の手順です。

1. スプレッドシートを新規作成し、拡張機能 → Apps Script を開く
2. `gas-receiver.gs` の内容を貼り付ける
3. `setupSheets()` を1回実行（列見出しと集計式が自動生成されます）
4. デプロイ → ウェブアプリ（実行者：自分／アクセス：全員）
5. 発行された URL を `index.html` 内の `const GAS_URL = ""` に貼り付ける

送信が使えない環境向けに、結果画面には『1行コピー』と『CSV保存』も用意しています。

---

## ファイル構成

```
knn-cc-check/
├── index.html      診断アプリ本体（単一ファイル・外部依存なし）
├── vercel.json     Vercel 設定（静的サイト）
├── README.md       このファイル
└── .gitignore
```

---

## ライセンス・制作

KNN / KandaNewsNetwork, Inc.

研修・セミナーでの利用を想定しています。二次配布や改変については制作者までお問い合わせください。
