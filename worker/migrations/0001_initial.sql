PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  avatar_key TEXT,
  company_id TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX sessions_user_idx ON sessions(user_id);
CREATE INDEX sessions_expiry_idx ON sessions(expires_at);

CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nit TEXT,
  address TEXT,
  city TEXT,
  department TEXT,
  phone TEXT,
  sector TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE regulations (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  entity TEXT,
  document_url TEXT,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE checklists (
  id TEXT PRIMARY KEY,
  regulation_id TEXT NOT NULL REFERENCES regulations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE checklist_items (
  id TEXT PRIMARY KEY,
  checklist_id TEXT NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  required INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE company_checklists (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  checklist_id TEXT NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('pending', 'in_progress', 'completed')),
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(company_id, checklist_id)
);

CREATE TABLE checklist_responses (
  id TEXT PRIMARY KEY,
  company_checklist_id TEXT NOT NULL REFERENCES company_checklists(id) ON DELETE CASCADE,
  checklist_item_id TEXT NOT NULL REFERENCES checklist_items(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('compliant', 'non_compliant', 'not_applicable', 'pending')),
  notes TEXT,
  evidence_key TEXT,
  responded_by TEXT REFERENCES users(id),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(company_checklist_id, checklist_item_id)
);

CREATE TABLE forms (
  id TEXT PRIMARY KEY,
  regulation_id TEXT REFERENCES regulations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  schema_json TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  active INTEGER NOT NULL DEFAULT 1,
  UNIQUE(type, version)
);

CREATE TABLE form_submissions (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  data_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  submitted_by TEXT REFERENCES users(id),
  submitted_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(company_id, form_id)
);

CREATE INDEX users_company_idx ON users(company_id);
CREATE INDEX company_checklists_company_idx ON company_checklists(company_id);
CREATE INDEX checklist_responses_parent_idx ON checklist_responses(company_checklist_id);
CREATE INDEX form_submissions_company_idx ON form_submissions(company_id);

CREATE TRIGGER prevent_last_owner_removal
BEFORE UPDATE OF role, company_id ON users
WHEN OLD.role = 'owner' AND OLD.company_id IS NOT NULL
  AND (NEW.role <> 'owner' OR NEW.company_id IS NOT OLD.company_id)
  AND (SELECT COUNT(*) FROM users WHERE company_id = OLD.company_id AND role = 'owner') = 1
BEGIN
  SELECT RAISE(ABORT, 'A company must retain at least one owner');
END;
