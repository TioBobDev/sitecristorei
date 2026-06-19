-- Script para restaurar os logins e senhas padrão dos usuários do site (MySQL)

USE cristorei;

-- 1. Restaurar/Inserir Administrador (E-mail: admin@cristorei.org | Senha: Admin@123456)
INSERT INTO User (id, name, email, passwordHash, role, createdAt, updatedAt)
VALUES (
  'admin-default-uuid-35f73d36',
  'Administrador Cristo Rei',
  'admin@cristorei.org',
  '$2b$10$cx7rUjs7yJ0JGG6NJED9t.64X6amh8ssZoTMpI9Cw7MH4Pcw3ROZ6',
  'ADMIN',
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  name = 'Administrador Cristo Rei',
  passwordHash = '$2b$10$cx7rUjs7yJ0JGG6NJED9t.64X6amh8ssZoTMpI9Cw7MH4Pcw3ROZ6',
  role = 'ADMIN',
  updatedAt = NOW(3);

-- 2. Restaurar/Inserir Editor (E-mail: editor@cristorei.org | Senha: Editor@123456)
INSERT INTO User (id, name, email, passwordHash, role, createdAt, updatedAt)
VALUES (
  'editor-default-uuid-35f73d36',
  'Editor de Conteúdo',
  'editor@cristorei.org',
  '$2b$10$YaO9svSVnvzrN5LF578LSeNI69OT/eAycujbMR/mL4fc7E8Gg.dwK',
  'EDITOR',
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  name = 'Editor de Conteúdo',
  passwordHash = '$2b$10$YaO9svSVnvzrN5LF578LSeNI69OT/eAycujbMR/mL4fc7E8Gg.dwK',
  role = 'EDITOR',
  updatedAt = NOW(3);
