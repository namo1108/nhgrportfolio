CREATE TABLE IF NOT EXISTS records (
  id TEXT PRIMARY KEY,
  writer TEXT,
  type TEXT,
  cat TEXT,
  amt REAL,
  memo TEXT,
  date TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at DESC);
