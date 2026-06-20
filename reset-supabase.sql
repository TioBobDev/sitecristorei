-- Script para resetar o banco de dados e restaurar os logins padrão no PostgreSQL (Supabase)

-- 1. Limpar todas as tabelas em cascata (reiniciando IDs se houver)
TRUNCATE TABLE 
  "AdminLog", 
  "Announcement", 
  "CarouselImage", 
  "News", 
  "Post", 
  "Project", 
  "Donation", 
  "Benefactor", 
  "User", 
  "SiteSettings", 
  "Category", 
  "MediaFile" 
RESTART IDENTITY CASCADE;

-- 2. Inserir Administrador Padrão (E-mail: admin@cristorei.org | Senha: Admin@123456)
INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
VALUES (
  'admin-default-uuid-35f73d36',
  'Administrador Cristo Rei',
  'admin@cristorei.org',
  '$2b$10$cx7rUjs7yJ0JGG6NJED9t.64X6amh8ssZoTMpI9Cw7MH4Pcw3ROZ6',
  'ADMIN',
  NOW(),
  NOW()
);

-- 3. Inserir Editor Padrão (E-mail: editor@cristorei.org | Senha: Editor@123456)
INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
VALUES (
  'editor-default-uuid-35f73d36',
  'Editor de Conteúdo',
  'editor@cristorei.org',
  '$2b$10$YaO9svSVnvzrN5LF578LSeNI69OT/eAycujbMR/mL4fc7E8Gg.dwK',
  'EDITOR',
  NOW(),
  NOW()
);

-- 4. Inserir Configurações do Site Iniciais
INSERT INTO "SiteSettings" (
  id, 
  name, 
  "logoUrl", 
  address, 
  phone, 
  email, 
  facebook, 
  instagram, 
  youtube, 
  "pixKey", 
  "pixBank", 
  "pixReceiver", 
  "pixQrCode", 
  "thankYouMsg", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  'singleton',
  'Associação Cristo Rei do Universo',
  '/images/logo.png',
  'Praça Cristo Rei, 100 - Centro, São Paulo - SP',
  '(11) 3456-7890',
  'contato@cristorei.org',
  'https://facebook.com/cristoreiuniverso',
  'https://instagram.com/cristoreiuniverso',
  'https://youtube.com/cristoreiuniverso',
  'contato@cristorei.org',
  'Banco do Brasil',
  'Associação Cristo Rei do Universo',
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'Muito obrigado por sua generosa doação e por alistar-se no Exército de Cristo Rei!',
  NOW(),
  NOW()
);
