-- 既存データを保持しながらスキーマを更新するマイグレーション

-- pollsテーブルにteam_nameとcreated_byカラムを追加
ALTER TABLE polls ADD COLUMN IF NOT EXISTS team_name TEXT DEFAULT 'default_team';
ALTER TABLE polls ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'anonymous';

-- votesテーブルにteam_nameカラムを追加
ALTER TABLE votes ADD COLUMN IF NOT EXISTS team_name TEXT DEFAULT 'default_team';

-- 既存のデータを更新（デフォルト値で埋める）
UPDATE polls SET team_name = 'default_team' WHERE team_name IS NULL;
UPDATE polls SET created_by = 'anonymous' WHERE created_by IS NULL;
UPDATE votes SET team_name = 'default_team' WHERE team_name IS NULL;

-- NOT NULL制約を追加
ALTER TABLE polls ALTER COLUMN team_name SET NOT NULL;
ALTER TABLE polls ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE votes ALTER COLUMN team_name SET NOT NULL;

-- チーム名を設定する関数
CREATE OR REPLACE FUNCTION set_team_name(team_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config('app.team_name', team_name, false);
END;
$$;

-- インデックスを追加してパフォーマンスを向上
CREATE INDEX IF NOT EXISTS idx_polls_team_name ON polls(team_name);
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON polls(created_at);
CREATE INDEX IF NOT EXISTS idx_votes_team_name ON votes(team_name);
CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_options_poll_id ON options(poll_id); 