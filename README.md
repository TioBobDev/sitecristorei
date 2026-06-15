# Portal e Painel Administrativo — Igreja Cristo Rei do Universo

Este é o sistema web institucional e de projetos sociais da **Associação Cristo Rei do Universo**, desenvolvido com o framework Next.js 15 (App Router), TypeScript, Tailwind CSS, Prisma ORM e NextAuth v5.

---

## 🚀 Tecnologias Utilizadas

- **Frontend:** Next.js 15+, React, TypeScript, Tailwind CSS, Shadcn/UI, Lucide Icons
- **Formulários e Validação:** React Hook Form, Zod Validation
- **Requisições:** TanStack Query
- **Autenticação:** NextAuth/Auth.js v5 (com suporte a perfis: Administrador, Editor, Benfeitor)
- **Banco de Dados:** Prisma ORM integrado ao PostgreSQL (Supabase ou Local)
- **Upload de Arquivos:** Sistema local protegido armazenado em `public/uploads`

---

## 📦 Estrutura do Site

- **Área Pública (Portal/Blog):**
  - `/` — Página inicial com Hero institucional, carrossel de fotos dinâmico, feeds de últimas notícias e projetos sociais em destaque, com botão fixo de doações.
  - `/noticias` e `/noticias/[slug]` — Feed completo e leitura detalhada de informativos.
  - `/projetos/[slug]` e `/projetos/[slug]/[postSlug]` — Rotas dinâmicas geradas automaticamente para cada categoria de projeto.
  - `/contato` — Formulário de contato e dados institucionais.
- **Área Restrita do Associado (/associado):**
  - `/associado/dashboard` — Exibição da patente militar do benfeitor, valor acumulado doado e comunicados administrativos.
  - `/associado/doacoes` — Histórico de doações com filtros por mês, ano e status.
  - `/associado/perfil` — Atualização cadastral de endereço, telefone e senha (CPF bloqueado).
- **Painel Administrativo (/admin):**
  - `/admin/dashboard` — Métricas globais e log de auditoria de ações dos administradores.
  - `/admin/noticias` — CRUD completo de notícias públicas.
  - `/admin/categorias` — CRUD completo de categorias de projetos.
  - `/admin/posts` — CRUD completo de posts de projetos com editor HTML.
  - `/admin/carrossel` — CRUD e ordenação do carrossel da home page.
  - `/admin/comunicados` — Emissão de avisos para a Área do Associado.
  - `/admin/benfeitores` — Relatório de membros e valores totais contribuídos.
  - `/admin/doacoes` — Conciliação e lançamento de contribuições.
  - `/admin/configuracoes` — Configuração do PIX, QR Code, contatos e dados da igreja.

---

## 🛠️ Instalação e Configuração Passo a Passo

### 1. Clonar ou Acessar o Projeto
Navegue até a raiz do diretório `c:\cancaonova\sitecristorei`.

### 2. Instalar as Dependências
Abra o terminal e execute:
```bash
npm install
```

### 3. Configurar o Banco de Dados (Supabase ou Docker Local)
Abra o arquivo `.env` localizado na raiz do projeto. 

- **Caso use o Supabase (Recomendado no início):**
  Substitua a variável `DATABASE_URL` com a string de conexão (Transaction ou Direct) fornecida no painel do seu projeto do Supabase.
  
- **Caso prefira rodar o PostgreSQL localmente via Docker:**
  Certifique-se de ter o Docker e Docker Compose instalados e execute:
  ```bash
  docker compose up -d
  ```
  Deixe a variável `DATABASE_URL` no `.env` apontada para:
  `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cristorei?schema=public"`

### 4. Sincronizar o Banco de Dados (Prisma Schema)
Execute o comando a seguir para gerar as tabelas no PostgreSQL (do Supabase ou Docker) conforme a nossa modelagem de dados:
```bash
npx prisma db push
```

### 5. Alimentar o Banco de Dados (Seed)
Execute o seed para criar os usuários de teste, as configurações gerais de PIX, as imagens do carrossel e as categorias iniciais (Reforço Pedagógico, Música, Pilates, Informática, Festa Junina, Noite Cultural):
```bash
npx prisma db seed
```

### 6. Executar o Servidor de Desenvolvimento
Inicie o servidor localmente:
```bash
npm run dev
```
Acesse a aplicação em [http://localhost:3000](http://localhost:3000).

---

## 🔑 Credenciais Iniciais para Testes

O seed criará dois usuários de controle padrão para testes de perfil:

- **Usuário Administrador (Acesso Total):**
  - **E-mail:** `admin@cristorei.org`
  - **Senha:** `Admin@123456`

- **Usuário Editor (Gestão de Conteúdo):**
  - **E-mail:** `editor@cristorei.org`
  - **Senha:** `Editor@123456`

- **Usuário Benfeitor:**
  Cadastre-se na home page através do botão **"Quero ser um Benfeitor"** (seja alistando-se como Coronel, Major, Tenente, etc.). Após a simulação de cadastro e PIX, você poderá logar no painel com o e-mail e a senha informados.
