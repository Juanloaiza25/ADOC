-- ============================================
-- SaaS Cumplimiento Normativo Alimentario
-- Estructura de base de datos para pymes
-- ============================================

-- Extensión para UUIDs (viene por defecto en Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------
-- COMPANIES (pymes)
-- --------------------------------------------
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  nit TEXT,
  address TEXT,
  city TEXT,
  department TEXT,
  phone TEXT,
  sector TEXT, -- ej: alimentos, bebidas, lácteos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------
-- PROFILES (extiende auth.users de Supabase)
-- --------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  company_id UUID REFERENCES companies(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para crear perfil al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- --------------------------------------------
-- REGULATIONS (normas: INVIMA, Res. 2674, BPM, etc.)
-- --------------------------------------------
CREATE TABLE regulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  entity TEXT, -- INVIMA, Ministerio de Salud, etc.
  url_document TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------
-- CHECKLISTS (plantillas de cumplimiento por norma)
-- --------------------------------------------
CREATE TABLE checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  regulation_id UUID NOT NULL REFERENCES regulations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------
-- CHECKLIST_ITEMS (ítems individuales del checklist)
-- --------------------------------------------
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------
-- COMPANY_CHECKLISTS (checklist asignado a una empresa)
-- --------------------------------------------
CREATE TABLE company_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('pending', 'in_progress', 'completed')),
  progress_percent INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, checklist_id)
);

-- --------------------------------------------
-- CHECKLIST_ITEM_RESPONSES (respuesta de la empresa a cada ítem)
-- --------------------------------------------
CREATE TABLE checklist_item_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_checklist_id UUID NOT NULL REFERENCES company_checklists(id) ON DELETE CASCADE,
  checklist_item_id UUID NOT NULL REFERENCES checklist_items(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('compliant', 'non_compliant', 'not_applicable', 'pending')),
  notes TEXT,
  evidence_url TEXT, -- URL de documento/imagen adjunto
  responded_by UUID REFERENCES profiles(id),
  responded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_checklist_id, checklist_item_id)
);

-- --------------------------------------------
-- FORMS (plantillas de formularios normativos)
-- --------------------------------------------
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  regulation_id UUID REFERENCES regulations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT, -- registro_sanitario, solicitud_invima, etc.
  schema JSONB NOT NULL, -- definición de campos del formulario
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------
-- FORM_SUBMISSIONS (envíos de formularios por empresa)
-- --------------------------------------------
CREATE TABLE form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  data JSONB NOT NULL, -- respuestas del formulario
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------
-- ÍNDICES
-- --------------------------------------------
CREATE INDEX idx_profiles_company ON profiles(company_id);
CREATE INDEX idx_company_checklists_company ON company_checklists(company_id);
CREATE INDEX idx_company_checklists_status ON company_checklists(status);
CREATE INDEX idx_checklist_item_responses_company_checklist ON checklist_item_responses(company_checklist_id);
CREATE INDEX idx_form_submissions_company ON form_submissions(company_id);
CREATE INDEX idx_form_submissions_form ON form_submissions(form_id);

-- --------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- --------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_item_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Regulations y checklists son lectura pública (catálogo)
ALTER TABLE regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Políticas: usuarios ven solo datos de su empresa
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view company if member"
  ON companies FOR SELECT
  USING (
    id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Authenticated users can create company"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Company owners/admins can update"
  ON companies FOR ALL
  USING (
    id IN (
      SELECT company_id FROM profiles
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users view company checklists"
  ON company_checklists FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users manage company checklists"
  ON company_checklists FOR ALL
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users view checklist responses"
  ON checklist_item_responses FOR ALL
  USING (
    company_checklist_id IN (
      SELECT id FROM company_checklists
      WHERE company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users view form submissions"
  ON form_submissions FOR ALL
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Catálogo: lectura pública para normas, checklists, forms
CREATE POLICY "Public read regulations"
  ON regulations FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read checklists"
  ON checklists FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read checklist_items"
  ON checklist_items FOR SELECT
  USING (true);

CREATE POLICY "Public read forms"
  ON forms FOR SELECT
  USING (is_active = true);
