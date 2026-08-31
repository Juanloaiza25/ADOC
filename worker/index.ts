import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createSession, destroySession, hashPassword, requireAuth, verifyPassword } from './auth'
import type { AppVariables, Env } from './types'

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>()

app.use('/api/*', async (c, next) => cors({
  origin: (origin) => c.env.APP_ORIGIN.split(',').includes(origin) ? origin : '',
  credentials: true,
  allowHeaders: ['Content-Type'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
})(c, next))

app.get('/api/health', (c) => c.json({ status: 'ok', service: 'adoc-api' }))

app.post('/api/auth/register', async (c) => {
  const body = await c.req.json<{ email?: string; password?: string; name?: string }>()
  const email = body.email?.trim().toLowerCase()
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return c.json({ error: 'Valid email required' }, 400)
  if (!body.password || body.password.length < 8) return c.json({ error: 'Password must have at least 8 characters' }, 400)
  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
  if (existing) return c.json({ error: 'Email already registered' }, 409)
  const id = crypto.randomUUID()
  await c.env.DB.prepare('INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)')
    .bind(id, email, await hashPassword(body.password), body.name?.trim() || null).run()
  await createSession(c, id)
  return c.json({ user: { id, email, name: body.name?.trim() || null } }, 201)
})

app.post('/api/auth/login', async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>()
  const user = await c.env.DB.prepare('SELECT id, email, full_name, password_hash FROM users WHERE email = ?')
    .bind(body.email?.trim().toLowerCase() ?? '').first<{ id: string; email: string; full_name: string | null; password_hash: string }>()
  if (!user || !body.password || !(await verifyPassword(body.password, user.password_hash))) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }
  await createSession(c, user.id)
  return c.json({ user: { id: user.id, email: user.email, name: user.full_name } })
})

app.post('/api/auth/logout', requireAuth, async (c) => {
  await destroySession(c)
  return c.body(null, 204)
})

app.get('/api/auth/session', requireAuth, async (c) => {
  const user = await c.env.DB.prepare('SELECT id, email, full_name FROM users WHERE id = ?')
    .bind(c.get('userId')).first<{ id: string; email: string; full_name: string | null }>()
  return c.json({ user: user ? { id: user.id, email: user.email, name: user.full_name } : null })
})

app.get('/api/profile', requireAuth, async (c) => {
  const profile = await c.env.DB.prepare(
    'SELECT id, email, full_name, avatar_key, company_id, COALESCE(access_role, role) role, created_at, updated_at FROM users WHERE id = ?',
  ).bind(c.get('userId')).first()
  return c.json({ profile })
})

app.patch('/api/profile', requireAuth, async (c) => {
  const body = await c.req.json<{ full_name?: string }>()
  await c.env.DB.prepare("UPDATE users SET full_name = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(body.full_name?.trim() || null, c.get('userId')).run()
  return c.json({ ok: true })
})

app.post('/api/companies', requireAuth, async (c) => {
  const userId = c.get('userId')
  const user = await c.env.DB.prepare('SELECT company_id FROM users WHERE id = ?').bind(userId).first<{ company_id: string | null }>()
  if (user?.company_id) return c.json({ error: 'User already belongs to a company' }, 409)
  const body = await c.req.json<Record<string, string | undefined>>()
  if (!body.name?.trim()) return c.json({ error: 'Company name required' }, 400)
  const id = crypto.randomUUID()
  await c.env.DB.batch([
    c.env.DB.prepare('INSERT INTO companies (id, name, nit, address, city, department, phone, sector) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, body.name.trim(), body.nit || null, body.address || null, body.city || null, body.department || null, body.phone || null, body.sector || null),
    c.env.DB.prepare("UPDATE users SET company_id = ?, role = 'owner', updated_at = datetime('now') WHERE id = ? AND company_id IS NULL")
      .bind(id, userId),
  ])
  const company = await c.env.DB.prepare('SELECT * FROM companies WHERE id = ?').bind(id).first()
  return c.json({ company }, 201)
})

app.get('/api/company', requireAuth, async (c) => {
  const company = await c.env.DB.prepare('SELECT c.* FROM companies c JOIN users u ON u.company_id = c.id WHERE u.id = ?')
    .bind(c.get('userId')).first()
  return company ? c.json({ company }) : c.json({ company: null })
})

app.patch('/api/company', requireAuth, async (c) => {
  const body = await c.req.json<Record<string, string | undefined>>()
  const membership = await c.env.DB.prepare("SELECT company_id, role FROM users WHERE id = ? AND role IN ('owner', 'admin')")
    .bind(c.get('userId')).first<{ company_id: string; role: string }>()
  if (!membership?.company_id) return c.json({ error: 'Owner or admin role required' }, 403)
  if (!body.name?.trim()) return c.json({ error: 'Company name required' }, 400)
  await c.env.DB.prepare("UPDATE companies SET name=?, nit=?, address=?, city=?, department=?, phone=?, sector=?, updated_at=datetime('now') WHERE id=?")
    .bind(body.name.trim(), body.nit || null, body.address || null, body.city || null, body.department || null, body.phone || null, body.sector || null, membership.company_id).run()
  const company = await c.env.DB.prepare('SELECT * FROM companies WHERE id = ?').bind(membership.company_id).first()
  return c.json({ company })
})

app.get('/api/team', requireAuth, async (c) => {
  const membership = await c.env.DB.prepare('SELECT company_id, COALESCE(access_role, role) role FROM users WHERE id=?').bind(c.get('userId')).first<{ company_id: string | null; role: string }>()
  if (!membership?.company_id) return c.json({ members: [], invitations: [] })
  const { results: members } = await c.env.DB.prepare(`SELECT id, email, full_name, COALESCE(access_role, role) role, created_at FROM users WHERE company_id=? ORDER BY CASE COALESCE(access_role, role) WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END, full_name`).bind(membership.company_id).all()
  const { results: invitations } = await c.env.DB.prepare(`SELECT id, email, role, token, expires_at, accepted_at, created_at FROM company_invitations WHERE company_id=? AND accepted_at IS NULL AND expires_at > datetime('now') ORDER BY created_at DESC`).bind(membership.company_id).all()
  return c.json({ members, invitations, canManage: ['owner', 'admin'].includes(membership.role) })
})

app.post('/api/team/invitations', requireAuth, async (c) => {
  const userId = c.get('userId')
  const membership = await c.env.DB.prepare('SELECT company_id, COALESCE(access_role, role) role FROM users WHERE id=?').bind(userId).first<{ company_id: string | null; role: string }>()
  if (!membership?.company_id || !['owner', 'admin'].includes(membership.role)) return c.json({ error: 'Owner or admin role required' }, 403)
  const body = await c.req.json<{ email?: string; role?: string }>()
  const email = body.email?.trim().toLowerCase()
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return c.json({ error: 'Valid email required' }, 400)
  if (!['admin', 'auditor', 'collaborator'].includes(body.role ?? '')) return c.json({ error: 'Invalid role' }, 400)
  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE company_id=? AND email=?').bind(membership.company_id, email).first()
  if (existing) return c.json({ error: 'El usuario ya pertenece al equipo' }, 409)
  const id = crypto.randomUUID()
  const token = `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, '')
  const expires = new Date(Date.now() + 7 * 86400000).toISOString()
  try {
    await c.env.DB.prepare('INSERT INTO company_invitations (id, company_id, email, role, token, invited_by, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(id, membership.company_id, email, body.role, token, userId, expires).run()
  } catch (error) {
    if (String(error).includes('UNIQUE')) return c.json({ error: 'Ya existe una invitación pendiente para este correo' }, 409)
    throw error
  }
  return c.json({ invitation: { id, email, role: body.role, token, expires_at: expires } }, 201)
})

app.post('/api/team/invitations/:token/accept', requireAuth, async (c) => {
  const userId = c.get('userId')
  const user = await c.env.DB.prepare('SELECT email, company_id FROM users WHERE id=?').bind(userId).first<{ email: string; company_id: string | null }>()
  const invitation = await c.env.DB.prepare(`SELECT * FROM company_invitations WHERE token=? AND accepted_at IS NULL AND expires_at > datetime('now')`).bind(c.req.param('token')).first<Record<string, unknown>>()
  if (!invitation) return c.json({ error: 'Invitation not found or expired' }, 404)
  if (!user || user.email.toLowerCase() !== String(invitation.email).toLowerCase()) return c.json({ error: 'La invitación pertenece a otro correo' }, 403)
  if (user.company_id && user.company_id !== invitation.company_id) return c.json({ error: 'El usuario ya pertenece a otra empresa' }, 409)
  await c.env.DB.batch([
    c.env.DB.prepare("UPDATE users SET company_id=?, access_role=?, role='member', updated_at=datetime('now') WHERE id=?").bind(invitation.company_id, invitation.role, userId),
    c.env.DB.prepare("UPDATE company_invitations SET accepted_at=datetime('now') WHERE id=?").bind(invitation.id),
  ])
  return c.json({ ok: true })
})

app.patch('/api/team/members/:id', requireAuth, async (c) => {
  const actor = await c.env.DB.prepare('SELECT company_id, COALESCE(access_role, role) role FROM users WHERE id=?').bind(c.get('userId')).first<{ company_id: string | null; role: string }>()
  if (!actor?.company_id || !['owner', 'admin'].includes(actor.role)) return c.json({ error: 'Owner or admin role required' }, 403)
  const target = await c.env.DB.prepare('SELECT id, COALESCE(access_role, role) role FROM users WHERE id=? AND company_id=?').bind(c.req.param('id'), actor.company_id).first<{ id: string; role: string }>()
  if (!target) return c.json({ error: 'Member not found' }, 404)
  const body = await c.req.json<{ role?: string }>()
  if (!['owner', 'admin', 'auditor', 'collaborator'].includes(body.role ?? '')) return c.json({ error: 'Invalid role' }, 400)
  if (target.role === 'owner' && body.role !== 'owner') {
    const owners = await c.env.DB.prepare("SELECT COUNT(*) count FROM users WHERE company_id=? AND COALESCE(access_role, role)='owner'").bind(actor.company_id).first<{ count: number }>()
    if (Number(owners?.count) <= 1) return c.json({ error: 'La empresa debe conservar al menos un propietario' }, 409)
  }
  await c.env.DB.prepare("UPDATE users SET access_role=?, role=CASE WHEN ? IN ('owner','admin') THEN ? ELSE 'member' END, updated_at=datetime('now') WHERE id=?").bind(body.role, body.role, body.role, target.id).run()
  return c.json({ ok: true })
})

app.get('/api/dashboard', requireAuth, async (c) => {
  const membership = await c.env.DB.prepare('SELECT company_id FROM users WHERE id=?').bind(c.get('userId')).first<{ company_id: string | null }>()
  if (!membership?.company_id) return c.json({ error: 'Company required' }, 409)
  const companyId = membership.company_id
  const totals = await c.env.DB.prepare(`
    SELECT COUNT(ci.id) total,
      SUM(CASE WHEN cr.status='compliant' THEN 1 ELSE 0 END) compliant,
      SUM(CASE WHEN cr.status='non_compliant' THEN 1 ELSE 0 END) non_compliant,
      SUM(CASE WHEN cr.status='not_applicable' THEN 1 ELSE 0 END) not_applicable,
      SUM(CASE WHEN cr.status IS NULL OR cr.status='pending' THEN 1 ELSE 0 END) pending
    FROM checklist_items ci
    JOIN checklists c ON c.id=ci.checklist_id AND c.active=1
    LEFT JOIN company_checklists cc ON cc.checklist_id=c.id AND cc.company_id=?
    LEFT JOIN checklist_responses cr ON cr.company_checklist_id=cc.id AND cr.checklist_item_id=ci.id
  `).bind(companyId).first<Record<string, number>>()
  const { results: checklists } = await c.env.DB.prepare(`
    SELECT c.id, c.name, r.code regulation_code, COUNT(ci.id) total,
      SUM(CASE WHEN cr.status='compliant' THEN 1 ELSE 0 END) compliant,
      SUM(CASE WHEN cr.status='non_compliant' THEN 1 ELSE 0 END) non_compliant,
      SUM(CASE WHEN cr.status='not_applicable' THEN 1 ELSE 0 END) not_applicable,
      SUM(CASE WHEN cr.status IS NULL OR cr.status='pending' THEN 1 ELSE 0 END) pending
    FROM checklists c JOIN regulations r ON r.id=c.regulation_id
    JOIN checklist_items ci ON ci.checklist_id=c.id
    LEFT JOIN company_checklists cc ON cc.checklist_id=c.id AND cc.company_id=?
    LEFT JOIN checklist_responses cr ON cr.company_checklist_id=cc.id AND cr.checklist_item_id=ci.id
    WHERE c.active=1 GROUP BY c.id, c.name, r.code ORDER BY c.name
  `).bind(companyId).all<Record<string, unknown>>()
  const { results: recent } = await c.env.DB.prepare(`
    SELECT cr.updated_at, ci.title, cr.status, u.full_name actor
    FROM checklist_responses cr
    JOIN company_checklists cc ON cc.id=cr.company_checklist_id
    JOIN checklist_items ci ON ci.id=cr.checklist_item_id
    LEFT JOIN users u ON u.id=cr.responded_by
    WHERE cc.company_id=? ORDER BY cr.updated_at DESC LIMIT 6
  `).bind(companyId).all()
  const total = Number(totals?.total ?? 0)
  const evaluated = Number(totals?.compliant ?? 0) + Number(totals?.non_compliant ?? 0) + Number(totals?.not_applicable ?? 0)
  return c.json({
    summary: {
      total,
      compliant: Number(totals?.compliant ?? 0),
      nonCompliant: Number(totals?.non_compliant ?? 0),
      notApplicable: Number(totals?.not_applicable ?? 0),
      pending: Number(totals?.pending ?? 0),
      progress: total ? Math.round(evaluated * 100 / total) : 0,
    },
    checklists: checklists.map((item) => ({ ...item, total: Number(item.total), compliant: Number(item.compliant), non_compliant: Number(item.non_compliant), not_applicable: Number(item.not_applicable), pending: Number(item.pending) })),
    recent,
  })
})

app.get('/api/actions', requireAuth, async (c) => {
  const membership = await c.env.DB.prepare('SELECT company_id FROM users WHERE id=?').bind(c.get('userId')).first<{ company_id: string | null }>()
  if (!membership?.company_id) return c.json({ actions: [] })
  const { results } = await c.env.DB.prepare(`
    SELECT a.*, assignee.full_name assignee_name, assignee.email assignee_email,
      ci.title requirement_title, ch.name checklist_name
    FROM corrective_actions a
    LEFT JOIN users assignee ON assignee.id=a.assigned_to
    LEFT JOIN checklist_responses cr ON cr.id=a.checklist_response_id
    LEFT JOIN checklist_items ci ON ci.id=cr.checklist_item_id
    LEFT JOIN company_checklists cc ON cc.id=cr.company_checklist_id
    LEFT JOIN checklists ch ON ch.id=cc.checklist_id
    WHERE a.company_id=? ORDER BY CASE a.status WHEN 'open' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END,
      CASE a.priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
      COALESCE(a.due_date, '9999-12-31')
  `).bind(membership.company_id).all()
  return c.json({ actions: results })
})

app.post('/api/actions', requireAuth, async (c) => {
  const userId = c.get('userId')
  const membership = await c.env.DB.prepare('SELECT company_id FROM users WHERE id=?').bind(userId).first<{ company_id: string | null }>()
  if (!membership?.company_id) return c.json({ error: 'Company required' }, 409)
  const body = await c.req.json<{ checklistResponseId?: string; title?: string; description?: string; assignedTo?: string; dueDate?: string; priority?: string }>()
  if (!body.title?.trim()) return c.json({ error: 'Title required' }, 400)
  if (!['low', 'medium', 'high', 'critical'].includes(body.priority ?? 'medium')) return c.json({ error: 'Invalid priority' }, 400)
  if (body.checklistResponseId) {
    const response = await c.env.DB.prepare(`SELECT cr.id FROM checklist_responses cr JOIN company_checklists cc ON cc.id=cr.company_checklist_id WHERE cr.id=? AND cc.company_id=?`).bind(body.checklistResponseId, membership.company_id).first()
    if (!response) return c.json({ error: 'Checklist response not found' }, 404)
  }
  if (body.assignedTo) {
    const assignee = await c.env.DB.prepare('SELECT id FROM users WHERE id=? AND company_id=?').bind(body.assignedTo, membership.company_id).first()
    if (!assignee) return c.json({ error: 'Assignee not found' }, 404)
  }
  const id = crypto.randomUUID()
  try {
    await c.env.DB.prepare(`INSERT INTO corrective_actions (id, company_id, checklist_response_id, title, description, assigned_to, due_date, priority, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, membership.company_id, body.checklistResponseId || null, body.title.trim(), body.description?.trim() || null, body.assignedTo || null, body.dueDate || null, body.priority || 'medium', userId).run()
  } catch (error) {
    if (String(error).includes('UNIQUE')) return c.json({ error: 'Ya existe una acción abierta para este requisito' }, 409)
    throw error
  }
  const action = await c.env.DB.prepare('SELECT * FROM corrective_actions WHERE id=?').bind(id).first()
  return c.json({ action }, 201)
})

app.patch('/api/actions/:id', requireAuth, async (c) => {
  const membership = await c.env.DB.prepare('SELECT company_id FROM users WHERE id=?').bind(c.get('userId')).first<{ company_id: string | null }>()
  const current = membership?.company_id ? await c.env.DB.prepare('SELECT * FROM corrective_actions WHERE id=? AND company_id=?').bind(c.req.param('id'), membership.company_id).first<Record<string, unknown>>() : null
  if (!current) return c.json({ error: 'Action not found' }, 404)
  const body = await c.req.json<{ title?: string; description?: string | null; assignedTo?: string | null; dueDate?: string | null; priority?: string; status?: string }>()
  const priority = body.priority ?? String(current.priority)
  const status = body.status ?? String(current.status)
  if (!['low', 'medium', 'high', 'critical'].includes(priority) || !['open', 'in_progress', 'resolved', 'cancelled'].includes(status)) return c.json({ error: 'Invalid action values' }, 400)
  const assignedTo = body.assignedTo === undefined ? current.assigned_to : body.assignedTo
  if (assignedTo) {
    const assignee = await c.env.DB.prepare('SELECT id FROM users WHERE id=? AND company_id=?').bind(assignedTo, membership!.company_id).first()
    if (!assignee) return c.json({ error: 'Assignee not found' }, 404)
  }
  const completedAt = status === 'resolved' ? (current.completed_at ?? new Date().toISOString()) : null
  await c.env.DB.prepare(`UPDATE corrective_actions SET title=?, description=?, assigned_to=?, due_date=?, priority=?, status=?, completed_at=?, updated_at=datetime('now') WHERE id=?`)
    .bind(body.title?.trim() || current.title, body.description === undefined ? current.description : body.description?.trim() || null, assignedTo || null, body.dueDate === undefined ? current.due_date : body.dueDate || null, priority, status, completedAt, c.req.param('id')).run()
  const action = await c.env.DB.prepare('SELECT * FROM corrective_actions WHERE id=?').bind(c.req.param('id')).first()
  return c.json({ action })
})

app.get('/api/reports/history', requireAuth, async (c) => {
  const membership = await c.env.DB.prepare('SELECT company_id FROM users WHERE id=?').bind(c.get('userId')).first<{ company_id: string | null }>()
  if (!membership?.company_id) return c.json({ reports: [] })
  const { results } = await c.env.DB.prepare(`SELECT re.*, u.full_name generated_by_name, u.email generated_by_email FROM report_exports re JOIN users u ON u.id=re.generated_by WHERE re.company_id=? ORDER BY re.created_at DESC LIMIT 30`).bind(membership.company_id).all()
  return c.json({ reports: results })
})

app.post('/api/reports/history', requireAuth, async (c) => {
  const userId = c.get('userId')
  const membership = await c.env.DB.prepare('SELECT company_id FROM users WHERE id=?').bind(userId).first<{ company_id: string | null }>()
  if (!membership?.company_id) return c.json({ error: 'Company required' }, 409)
  const body = await c.req.json<{ reportType?: string; title?: string }>()
  if (!body.reportType?.trim() || !body.title?.trim()) return c.json({ error: 'Report type and title required' }, 400)
  const id = crypto.randomUUID()
  await c.env.DB.prepare('INSERT INTO report_exports (id, company_id, report_type, title, generated_by) VALUES (?, ?, ?, ?, ?)').bind(id, membership.company_id, body.reportType.trim(), body.title.trim(), userId).run()
  const report = await c.env.DB.prepare('SELECT * FROM report_exports WHERE id=?').bind(id).first()
  return c.json({ report }, 201)
})

app.get('/api/checklists', requireAuth, async (c) => {
  const { results: checklists } = await c.env.DB.prepare(`
    SELECT c.id, c.name, c.description, r.code regulation_code, r.name regulation_name
    FROM checklists c JOIN regulations r ON r.id = c.regulation_id WHERE c.active = 1 ORDER BY c.name
  `).all<Record<string, unknown>>()
  const { results: items } = await c.env.DB.prepare('SELECT * FROM checklist_items ORDER BY sort_order').all<Record<string, unknown>>()
  return c.json({ checklists: checklists.map((checklist) => ({ ...checklist, items: items.filter((item) => item.checklist_id === checklist.id) })) })
})

app.post('/api/company-checklists/:checklistId', requireAuth, async (c) => {
  const membership = await c.env.DB.prepare('SELECT company_id FROM users WHERE id = ?').bind(c.get('userId')).first<{ company_id: string | null }>()
  if (!membership?.company_id) return c.json({ error: 'Company required' }, 409)
  const checklistId = c.req.param('checklistId')
  let instance = await c.env.DB.prepare('SELECT * FROM company_checklists WHERE company_id=? AND checklist_id=?').bind(membership.company_id, checklistId).first()
  if (!instance) {
    const id = crypto.randomUUID()
    await c.env.DB.prepare('INSERT INTO company_checklists (id, company_id, checklist_id) VALUES (?, ?, ?)').bind(id, membership.company_id, checklistId).run()
    instance = await c.env.DB.prepare('SELECT * FROM company_checklists WHERE id=?').bind(id).first()
  }
  return c.json({ companyChecklist: instance })
})

app.get('/api/company-checklists/:id/responses', requireAuth, async (c) => {
  const allowed = await c.env.DB.prepare(`SELECT cc.id FROM company_checklists cc JOIN users u ON u.company_id=cc.company_id WHERE cc.id=? AND u.id=?`).bind(c.req.param('id'), c.get('userId')).first()
  if (!allowed) return c.json({ error: 'Not found' }, 404)
  const { results } = await c.env.DB.prepare('SELECT * FROM checklist_responses WHERE company_checklist_id=?').bind(c.req.param('id')).all()
  return c.json({ responses: results })
})

app.put('/api/company-checklists/:id/responses/:itemId', requireAuth, async (c) => {
  const companyChecklistId = c.req.param('id')
  const itemId = c.req.param('itemId')
  const allowed = await c.env.DB.prepare(`SELECT cc.id FROM company_checklists cc JOIN users u ON u.company_id=cc.company_id WHERE cc.id=? AND u.id=?`).bind(companyChecklistId, c.get('userId')).first()
  if (!allowed) return c.json({ error: 'Not found' }, 404)
  const body = await c.req.json<{ status?: string; notes?: string }>()
  if (!['compliant', 'non_compliant', 'not_applicable', 'pending'].includes(body.status ?? '')) return c.json({ error: 'Invalid status' }, 400)
  await c.env.DB.prepare(`INSERT INTO checklist_responses (id, company_checklist_id, checklist_item_id, status, notes, responded_by)
    VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(company_checklist_id, checklist_item_id) DO UPDATE SET status=excluded.status, notes=excluded.notes, responded_by=excluded.responded_by, updated_at=datetime('now')`)
    .bind(crypto.randomUUID(), companyChecklistId, itemId, body.status, body.notes?.trim() || null, c.get('userId')).run()
  const totals = await c.env.DB.prepare(`SELECT COUNT(ci.id) total, SUM(CASE WHEN cr.status IN ('compliant','non_compliant','not_applicable') THEN 1 ELSE 0 END) answered FROM company_checklists cc JOIN checklist_items ci ON ci.checklist_id=cc.checklist_id LEFT JOIN checklist_responses cr ON cr.company_checklist_id=cc.id AND cr.checklist_item_id=ci.id WHERE cc.id=?`).bind(companyChecklistId).first<{ total: number; answered: number }>()
  const progress = totals?.total ? Math.round((totals.answered ?? 0) * 100 / totals.total) : 0
  await c.env.DB.prepare("UPDATE company_checklists SET progress_percent=?, status=?, updated_at=datetime('now') WHERE id=?").bind(progress, progress === 100 ? 'completed' : 'in_progress', companyChecklistId).run()
  return c.json({ ok: true, progress })
})

app.post('/api/company-checklists/:id/responses/:itemId/evidence', requireAuth, async (c) => {
  const companyChecklistId = c.req.param('id')
  const itemId = c.req.param('itemId')
  const membership = await c.env.DB.prepare(`SELECT cc.company_id FROM company_checklists cc JOIN users u ON u.company_id=cc.company_id WHERE cc.id=? AND u.id=?`).bind(companyChecklistId, c.get('userId')).first<{ company_id: string }>()
  if (!membership) return c.json({ error: 'Not found' }, 404)
  const body = await c.req.parseBody()
  const file = body.file
  if (!(file instanceof File)) return c.json({ error: 'File required' }, 400)
  if (file.size > 10 * 1024 * 1024) return c.json({ error: 'Maximum file size is 10 MB' }, 413)
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) return c.json({ error: 'Unsupported file type' }, 415)
  const extension = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'bin'
  const key = `${membership.company_id}/${companyChecklistId}/${itemId}/${crypto.randomUUID()}.${extension}`
  await c.env.EVIDENCE.put(key, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { originalName: file.name } })
  await c.env.DB.prepare(`INSERT INTO checklist_responses (id, company_checklist_id, checklist_item_id, status, evidence_key, responded_by)
    VALUES (?, ?, ?, 'pending', ?, ?) ON CONFLICT(company_checklist_id, checklist_item_id) DO UPDATE SET evidence_key=excluded.evidence_key, responded_by=excluded.responded_by, updated_at=datetime('now')`)
    .bind(crypto.randomUUID(), companyChecklistId, itemId, key, c.get('userId')).run()
  return c.json({ evidenceKey: key }, 201)
})

app.get('/api/evidence/*', requireAuth, async (c) => {
  const key = c.req.path.replace('/api/evidence/', '')
  const membership = await c.env.DB.prepare('SELECT company_id FROM users WHERE id=?').bind(c.get('userId')).first<{ company_id: string | null }>()
  if (!membership?.company_id || !key.startsWith(`${membership.company_id}/`)) return c.json({ error: 'Not found' }, 404)
  const object = await c.env.EVIDENCE.get(key)
  if (!object) return c.json({ error: 'Not found' }, 404)
  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('Content-Disposition', `inline; filename="${object.customMetadata?.originalName ?? 'evidence'}"`)
  return new Response(object.body, { headers })
})

app.get('/api/forms', requireAuth, async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT f.*, r.code regulation_code, r.name regulation_name FROM forms f LEFT JOIN regulations r ON r.id=f.regulation_id WHERE f.active=1 ORDER BY f.name`).all<Record<string, unknown>>()
  return c.json({ forms: results.map((form) => ({ ...form, schema: JSON.parse(form.schema_json as string) })) })
})

app.get('/api/forms/:formId/submission', requireAuth, async (c) => {
  const membership = await c.env.DB.prepare('SELECT company_id FROM users WHERE id=?').bind(c.get('userId')).first<{ company_id: string | null }>()
  if (!membership?.company_id) return c.json({ submission: null })
  const submission = await c.env.DB.prepare('SELECT * FROM form_submissions WHERE company_id=? AND form_id=?').bind(membership.company_id, c.req.param('formId')).first<Record<string, unknown>>()
  return c.json({ submission: submission ? { ...submission, data: JSON.parse(submission.data_json as string) } : null })
})

app.put('/api/forms/:formId/submission', requireAuth, async (c) => {
  const membership = await c.env.DB.prepare('SELECT company_id FROM users WHERE id=?').bind(c.get('userId')).first<{ company_id: string | null }>()
  if (!membership?.company_id) return c.json({ error: 'Company required' }, 409)
  const body = await c.req.json<{ data?: Record<string, string | number>; status?: 'draft' | 'submitted' }>()
  if (!body.data || !['draft', 'submitted'].includes(body.status ?? '')) return c.json({ error: 'Invalid submission' }, 400)
  const id = crypto.randomUUID()
  const submittedAt = body.status === 'submitted' ? new Date().toISOString() : null
  await c.env.DB.prepare(`INSERT INTO form_submissions (id, company_id, form_id, data_json, status, submitted_by, submitted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(company_id, form_id) DO UPDATE SET data_json=excluded.data_json, status=excluded.status, submitted_by=excluded.submitted_by, submitted_at=excluded.submitted_at, updated_at=datetime('now')`)
    .bind(id, membership.company_id, c.req.param('formId'), JSON.stringify(body.data), body.status, c.get('userId'), submittedAt).run()
  const submission = await c.env.DB.prepare('SELECT * FROM form_submissions WHERE company_id=? AND form_id=?').bind(membership.company_id, c.req.param('formId')).first<Record<string, unknown>>()
  return c.json({ submission: { ...submission, data: JSON.parse(submission!.data_json as string) } })
})

app.notFound((c) => c.json({ error: 'Not found' }, 404))
app.onError((error, c) => {
  console.error(error)
  return c.json({ error: 'Internal server error' }, 500)
})

export default app
