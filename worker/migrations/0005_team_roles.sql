ALTER TABLE users ADD COLUMN access_role TEXT CHECK (access_role IN ('owner', 'admin', 'auditor', 'collaborator'));
UPDATE users SET access_role = CASE role WHEN 'member' THEN 'collaborator' ELSE role END;

CREATE TABLE company_invitations (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL COLLATE NOCASE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'auditor', 'collaborator')),
  token TEXT NOT NULL UNIQUE,
  invited_by TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  accepted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX company_invitations_company_idx ON company_invitations(company_id, created_at DESC);
CREATE UNIQUE INDEX company_invitations_pending_email_idx ON company_invitations(company_id, email) WHERE accepted_at IS NULL;
