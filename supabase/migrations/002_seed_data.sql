-- ============================================
-- Seed: Normas y checklists de cumplimiento
-- Sector alimentario - Colombia
-- ============================================

-- REGULATIONS
INSERT INTO regulations (id, code, name, description, entity) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'INVIMA-RS', 'Registro Sanitario INVIMA', 'Obligatorio para fabricar, envasar, almacenar o comercializar alimentos de consumo humano.', 'INVIMA'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'RES-2674-2013', 'Resolución 2674 de 2013', 'Por la cual se establece el Manual de Buenas Prácticas de Manufactura para alimentos.', 'Ministerio de Salud'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'BPM', 'Buenas Prácticas de Manufactura', 'Sistema de gestión de inocuidad alimentaria.', 'INVIMA')
ON CONFLICT (code) DO NOTHING;

-- CHECKLIST: Registro Sanitario INVIMA
INSERT INTO checklists (id, regulation_id, name, description) VALUES
  ('b2c3d4e5-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'Requisitos Registro Sanitario', 'Checklist para verificar preparación ante solicitud de Registro Sanitario INVIMA')
ON CONFLICT (id) DO NOTHING;

INSERT INTO checklist_items (checklist_id, title, description, sort_order, required)
SELECT v.checklist_id, v.title, v.description, v.sort_order, v.required
FROM (VALUES
  ('b2c3d4e5-0001-4000-8000-000000000001'::uuid, 'Razón social y NIT actualizados', 'Documentos legales de constitución de la empresa vigentes', 1, true),
  ('b2c3d4e5-0001-4000-8000-000000000001'::uuid, 'Registro Mercantil', 'Cámara de Comercio vigente (máx. 3 meses)', 2, true),
  ('b2c3d4e5-0001-4000-8000-000000000001'::uuid, 'Plano de planta aprobado', 'Plano arquitectónico del establecimiento', 3, true),
  ('b2c3d4e5-0001-4000-8000-000000000001'::uuid, 'Programa de BPM implementado', 'Evidencia de implementación de Buenas Prácticas de Manufactura', 4, true),
  ('b2c3d4e5-0001-4000-8000-000000000001'::uuid, 'Lista de productos a registrar', 'Descripción y etiquetado de cada producto', 5, true),
  ('b2c3d4e5-0001-4000-8000-000000000001'::uuid, 'Fichas técnicas de productos', 'Composición, vida útil, condiciones de almacenamiento', 6, true),
  ('b2c3d4e5-0001-4000-8000-000000000001'::uuid, 'Pago de tasa INVIMA', 'Recibo de pago de la tasa de tramite', 7, true)
) AS v(checklist_id, title, description, sort_order, required)
WHERE NOT EXISTS (SELECT 1 FROM checklist_items ci WHERE ci.checklist_id = v.checklist_id AND ci.title = v.title);

-- CHECKLIST: BPM - Resolución 2674
INSERT INTO checklists (id, regulation_id, name, description) VALUES
  ('b2c3d4e5-0002-4000-8000-000000000002', 'a1b2c3d4-0002-4000-8000-000000000002', 'BPM - Infraestructura', 'Requisitos de instalaciones según Resolución 2674'),
  ('b2c3d4e5-0003-4000-8000-000000000003', 'a1b2c3d4-0002-4000-8000-000000000002', 'BPM - Personal', 'Requisitos de higiene y capacitación del personal')
ON CONFLICT (id) DO NOTHING;

INSERT INTO checklist_items (checklist_id, title, description, sort_order, required)
SELECT v.checklist_id, v.title, v.description, v.sort_order, v.required
FROM (VALUES
  ('b2c3d4e5-0002-4000-8000-000000000002'::uuid, 'Pisos lisos, lavables e impermeables', 'Sin grietas ni desniveles que acumulen agua', 1, true),
  ('b2c3d4e5-0002-4000-8000-000000000002'::uuid, 'Paredes y techos lavables', 'Superficies que permitan limpieza adecuada', 2, true),
  ('b2c3d4e5-0002-4000-8000-000000000002'::uuid, 'Iluminación adecuada', 'Luminarias protegidas en zonas de proceso', 3, true),
  ('b2c3d4e5-0002-4000-8000-000000000002'::uuid, 'Ventilación y control de plagas', 'Rejillas, mallas y programa de control', 4, true),
  ('b2c3d4e5-0002-4000-8000-000000000002'::uuid, 'Áreas separadas: recepción, proceso, almacén', 'Flujo que evite contaminación cruzada', 5, true),
  ('b2c3d4e5-0002-4000-8000-000000000002'::uuid, 'Sanitarios separados del área de proceso', 'Con lavamanos y señalización', 6, true),
  ('b2c3d4e5-0002-4000-8000-000000000002'::uuid, 'Agua potable disponible', 'Potabilización o suministro certificado', 7, true),
  ('b2c3d4e5-0003-4000-8000-000000000003'::uuid, 'Examen médico y coprocultivo vigente', 'Personal con certificado de aptitud', 1, true),
  ('b2c3d4e5-0003-4000-8000-000000000003'::uuid, 'Indumentaria de trabajo', 'Uniforme, cofia, cubrebocas según zona', 2, true),
  ('b2c3d4e5-0003-4000-8000-000000000003'::uuid, 'Capacitación en BPM anual', 'Registro de asistencia y contenidos', 3, true),
  ('b2c3d4e5-0003-4000-8000-000000000003'::uuid, 'Lavado de manos documentado', 'Procedimiento y puntos de lavado', 4, true),
  ('b2c3d4e5-0003-4000-8000-000000000003'::uuid, 'Prohibición de alimentos en zona de proceso', 'Señalización y cumplimiento', 5, true)
) AS v(checklist_id, title, description, sort_order, required)
WHERE NOT EXISTS (SELECT 1 FROM checklist_items ci WHERE ci.checklist_id = v.checklist_id AND ci.title = v.title);
