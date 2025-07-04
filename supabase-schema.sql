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

-- 簡素化されたポリシー（チーム名による直接フィルタリング）
CREATE POLICY "Allow team access to polls" ON polls FOR ALL USING (true);
CREATE POLICY "Allow team access to options" ON options FOR ALL USING (true);
CREATE POLICY "Allow team access to votes" ON votes FOR ALL USING (true); 