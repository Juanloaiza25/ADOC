INSERT INTO regulations (id, code, name, description, entity) VALUES
('a1b2c3d4-0001-4000-8000-000000000001','INVIMA-RS','Registro Sanitario INVIMA','Requisitos para fabricar y comercializar alimentos de consumo humano.','INVIMA'),
('a1b2c3d4-0002-4000-8000-000000000002','RES-2674-2013','Resolución 2674 de 2013','Buenas Prácticas de Manufactura para alimentos.','Ministerio de Salud'),
('a1b2c3d4-0003-4000-8000-000000000003','BPM','Buenas Prácticas de Manufactura','Sistema de gestión de inocuidad alimentaria.','INVIMA');

INSERT INTO checklists (id, regulation_id, name, description) VALUES
('b2c3d4e5-0001-4000-8000-000000000001','a1b2c3d4-0001-4000-8000-000000000001','Requisitos Registro Sanitario','Preparación para solicitar el Registro Sanitario INVIMA'),
('b2c3d4e5-0002-4000-8000-000000000002','a1b2c3d4-0002-4000-8000-000000000002','BPM - Infraestructura','Requisitos de instalaciones según Resolución 2674'),
('b2c3d4e5-0003-4000-8000-000000000003','a1b2c3d4-0002-4000-8000-000000000002','BPM - Personal','Higiene y capacitación del personal');

INSERT INTO checklist_items (id, checklist_id, title, description, sort_order) VALUES
('ci-001','b2c3d4e5-0001-4000-8000-000000000001','Razón social y NIT actualizados','Documentos legales vigentes',1),
('ci-002','b2c3d4e5-0001-4000-8000-000000000001','Registro Mercantil','Cámara de Comercio vigente',2),
('ci-003','b2c3d4e5-0001-4000-8000-000000000001','Plano de planta aprobado','Plano arquitectónico del establecimiento',3),
('ci-004','b2c3d4e5-0001-4000-8000-000000000001','Programa de BPM implementado','Evidencia de implementación',4),
('ci-005','b2c3d4e5-0001-4000-8000-000000000001','Fichas técnicas de productos','Composición, vida útil y almacenamiento',5),
('ci-101','b2c3d4e5-0002-4000-8000-000000000002','Pisos lisos, lavables e impermeables','Sin grietas que acumulen agua',1),
('ci-102','b2c3d4e5-0002-4000-8000-000000000002','Paredes y techos lavables','Superficies de fácil limpieza',2),
('ci-103','b2c3d4e5-0002-4000-8000-000000000002','Control de plagas','Programa documentado y activo',3),
('ci-201','b2c3d4e5-0003-4000-8000-000000000003','Certificados médicos vigentes','Personal apto para manipular alimentos',1),
('ci-202','b2c3d4e5-0003-4000-8000-000000000003','Indumentaria de trabajo','Uniforme y elementos de protección',2),
('ci-203','b2c3d4e5-0003-4000-8000-000000000003','Capacitación BPM anual','Registro de asistencia y contenidos',3);

INSERT INTO forms (id, regulation_id, name, description, type, schema_json) VALUES
('form-invima-1','a1b2c3d4-0001-4000-8000-000000000001','Ficha básica para Registro Sanitario','Información inicial para preparar la solicitud ante INVIMA.','registro_sanitario','{"fields":[{"name":"business_name","label":"Razón social","type":"text","required":true},{"name":"nit","label":"NIT","type":"text","required":true},{"name":"product_name","label":"Nombre del producto","type":"text","required":true},{"name":"ingredients","label":"Ingredientes","type":"textarea","required":true}]}'),
('form-bpm-1','a1b2c3d4-0003-4000-8000-000000000003','Diagnóstico inicial BPM','Datos generales del diagnóstico de Buenas Prácticas.','diagnostico_bpm','{"fields":[{"name":"visit_date","label":"Fecha del diagnóstico","type":"date","required":true},{"name":"evaluator","label":"Responsable","type":"text","required":true},{"name":"main_findings","label":"Hallazgos principales","type":"textarea","required":true},{"name":"corrective_actions","label":"Acciones correctivas","type":"textarea","required":true}]}');
