CREATE TABLE audit_log (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  before_json TEXT,
  after_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX audit_log_company_idx ON audit_log(company_id, created_at DESC);
CREATE INDEX audit_log_entity_idx ON audit_log(entity_type, entity_id, created_at DESC);
