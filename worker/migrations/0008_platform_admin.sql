ALTER TABLE users ADD COLUMN is_platform_admin INTEGER NOT NULL DEFAULT 0 CHECK (is_platform_admin IN (0, 1));
ALTER TABLE users ADD COLUMN suspended_at TEXT;
UPDATE users SET is_platform_admin=1 WHERE email='demo@adoc.app';
