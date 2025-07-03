-- 投票テーブル
CREATE TABLE polls (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  team_name TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  show_results BOOLEAN DEFAULT FALSE
);

-- 選択肢テーブル
CREATE TABLE options (
  id TEXT PRIMARY KEY,
  poll_id TEXT REFERENCES polls(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  votes INTEGER DEFAULT 0
);

-- 投票記録テーブル
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id TEXT REFERENCES polls(id) ON DELETE CASCADE,
  option_id TEXT REFERENCES options(id) ON DELETE CASCADE,
  voter_id TEXT NOT NULL,
  team_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, voter_id)
);

-- 投票数を増やす関数
CREATE OR REPLACE FUNCTION increment_votes()
RETURNS INTEGER
LANGUAGE SQL
AS $$
  SELECT votes + 1
$$;

-- チーム名を設定する関数
CREATE OR REPLACE FUNCTION set_team_name(team_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config('app.team_name', team_name, false);
END;
$$;

-- リアルタイムを有効にする
ALTER TABLE polls REPLICA IDENTITY FULL;
ALTER TABLE options REPLICA IDENTITY FULL;
ALTER TABLE votes REPLICA IDENTITY FULL;

-- RLSポリシー（チーム別アクセス制御）
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- チーム別アクセス制御ポリシー
-- pollsテーブル: 同じチーム名の投票のみアクセス可能
CREATE POLICY "Allow team access to polls" ON polls FOR ALL USING (
  team_name = current_setting('app.team_name', true)::text
);

-- optionsテーブル: 同じチームの投票の選択肢のみアクセス可能
CREATE POLICY "Allow team access to options" ON options FOR ALL USING (
  poll_id IN (
    SELECT id FROM polls 
    WHERE team_name = current_setting('app.team_name', true)::text
  )
);

-- votesテーブル: 同じチームの投票記録のみアクセス可能
CREATE POLICY "Allow team access to votes" ON votes FOR ALL USING (
  team_name = current_setting('app.team_name', true)::text
);

-- 匿名ユーザー用のフォールバックポリシー（チーム名が設定されていない場合）
CREATE POLICY "Allow anonymous read polls fallback" ON polls FOR SELECT USING (
  current_setting('app.team_name', true) IS NULL
);
CREATE POLICY "Allow anonymous read options fallback" ON options FOR SELECT USING (
  current_setting('app.team_name', true) IS NULL
);
CREATE POLICY "Allow anonymous read votes fallback" ON votes FOR SELECT USING (
  current_setting('app.team_name', true) IS NULL
); 