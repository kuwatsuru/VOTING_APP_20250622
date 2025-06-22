-- 投票テーブル
CREATE TABLE polls (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
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

-- リアルタイムを有効にする
ALTER TABLE polls REPLICA IDENTITY FULL;
ALTER TABLE options REPLICA IDENTITY FULL;
ALTER TABLE votes REPLICA IDENTITY FULL;

-- RLSポリシー（匿名ユーザーでも読み書き可能）
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- 匿名ユーザー用のポリシー
CREATE POLICY "Allow anonymous read polls" ON polls FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert polls" ON polls FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update polls" ON polls FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete polls" ON polls FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read options" ON options FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert options" ON options FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update options" ON options FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete options" ON options FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert votes" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update votes" ON votes FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete votes" ON votes FOR DELETE USING (true); 