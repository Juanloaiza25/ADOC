CREATE TABLE corrective_actions (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  checklist_response_id TEXT REFERENCES checklist_responses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
  due_date TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'cancelled')),
  created_by TEXT NOT NULL REFERENCES users(id),
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX corrective_actions_company_idx ON corrective_actions(company_id);
CREATE INDEX corrective_actions_due_idx ON corrective_actions(company_id, due_date);
CREATE UNIQUE INDEX corrective_actions_open_response_idx ON corrective_actions(checklist_response_id) WHERE checklist_response_id IS NOT NULL AND status IN ('open', 'in_progress');
