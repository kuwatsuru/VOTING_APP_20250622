# 多数決アプリ

Next.js + React + TypeScript + Supabase で作成したリアルタイム多数決（投票）アプリです。

## 主な機能

- 投票テーマの作成
- 複数の選択肢を設定可能
- 投票は1人1回のみ（ブラウザベースの投票者ID）
- 投票前は得票数・結果が非表示
- 投票後に結果・得票数・最多票が表示
- **リアルタイム投票結果共有**（Supabase連携）
- **投票の削除機能**
- モダンなUI/UX（Tailwind CSS, Radix UI）

## セットアップ方法

### 1. リポジトリをクローン

```bash
git clone https://github.com/kuwatsuru/VOTING_APP_20250622.git
cd VOTING_APP_20250622
```

### 2. 依存パッケージをインストール

```bash
npm install
```

### 3. Supabaseのセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. `supabase-schema.sql`の内容をSQLエディタで実行
3. プロジェクトURLとanon keyを取得

### 4. 環境変数の設定

`.env.local`ファイルを作成：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. 開発サーバーを起動

```bash
npm run dev
```

### 6. ブラウザでアクセス

[http://localhost:3000](http://localhost:3000) または [http://localhost:3001](http://localhost:3001)

## 使い方

1. 「新しい投票を作成」ボタンから投票テーマと選択肢を入力して作成
2. 投票一覧から投票を選択
3. 投票を行うと、得票数・結果が表示されます
4. **リアルタイムで他のユーザーの投票結果も反映されます**
5. 投票一覧の🗑️ボタンで投票を削除可能

## 技術スタック

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Zustand（状態管理）
- Radix UI
- **Supabase（リアルタイムデータベース）**

## データベース構造

- `polls`: 投票テーブル
- `options`: 選択肢テーブル
- `votes`: 投票記録テーブル

## ライセンス

MIT License
