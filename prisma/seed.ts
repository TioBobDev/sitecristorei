import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando semeadura do banco de dados...');

  // 1. Criar Configurações Gerais do Site
  const settings = await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      name: 'Associação Cristo Rei do Universo',
      logoUrl: '/images/logo.png',
      address: 'Praça Cristo Rei, 100 - Centro, São Paulo - SP',
      phone: '(11) 3456-7890',
      email: 'contato@cristorei.org',
      facebook: 'https://facebook.com/cristoreiuniverso',
      instagram: 'https://instagram.com/cristoreiuniverso',
      youtube: 'https://youtube.com/cristoreiuniverso',
      pixKey: 'contato@cristorei.org',
      pixBank: 'Banco do Brasil',
      pixReceiver: 'Associação Cristo Rei do Universo',
      pixQrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', // Pix fake base64
      thankYouMsg: 'Muito obrigado por sua generosa doação e por alistar-se no Exército de Cristo Rei!',
    },
  });
  console.log('Configurações do site criadas:', settings.name);

  // 2. Criar Usuários Padrão (Admin e Editor)
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cristorei.org' },
    update: {},
    create: {
      name: 'Administrador Cristo Rei',
      email: 'admin@cristorei.org',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });
  console.log('Usuário Administrador criado:', admin.email);

  const editorPasswordHash = await bcrypt.hash('Editor@123456', 10);
  const editor = await prisma.user.upsert({
    where: { email: 'editor@cristorei.org' },
    update: {},
    create: {
      name: 'Editor de Conteúdo',
      email: 'editor@cristorei.org',
      passwordHash: editorPasswordHash,
      role: Role.EDITOR,
    },
  });
  console.log('Usuário Editor criado:', editor.email);

  // 3. Criar Categorias Iniciais
  const initialCategories = [
    { name: 'Reforço Pedagógico', slug: 'reforco-pedagogico', description: 'Apoio escolar e pedagógico para crianças e adolescentes da comunidade.' },
    { name: 'Aula de Informática', slug: 'aula-de-informatica', description: 'Cursos de inclusão digital e programação básica para jovens e adultos.' },
    { name: 'Aula de Música', slug: 'aula-de-musica', description: 'Musicalização, violão, teclado, coral e percussão para todas as idades.' },
    { name: 'Pilates', slug: 'pilates', description: 'Aulas de pilates solo visando a saúde física e postura para idosos e adultos.' },
    { name: 'Festa Junina', slug: 'festa-junina', description: 'Nossa tradicional festividade com fins beneficentes e comunitários.' },
    { name: 'Noite Cultural', slug: 'noite-cultural', description: 'Apresentações teatrais, mostras artísticas e saraus comunitários.' },
  ];

  for (const cat of initialCategories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        bannerUrl: `/images/categories/${cat.slug}.jpg`,
      },
    });
    console.log(`Categoria criada: ${category.name} (/projetos/${category.slug})`);

    // Criar um projeto exemplo em cada categoria se ele não existir
    const projectSlug = `projeto-${cat.slug}`;
    const projectExists = await prisma.project.findUnique({
      where: { slug: projectSlug }
    });

    if (!projectExists) {
      await prisma.project.create({
        data: {
          name: `Projeto ${cat.name}`,
          slug: projectSlug,
          summary: `Conheça o trabalho que realizamos no projeto de ${cat.name}.`,
          description: `O projeto de ${cat.name} foi criado para promover transformação social através do desenvolvimento de habilidades e integração da comunidade. Nossas ações contam com profissionais voluntários e doações da comunidade para prover o melhor acolhimento e ensino.`,
          bannerUrl: `/images/categories/${cat.slug}.jpg`,
          categoryId: category.id,
        },
      });
    }
  }

  // 4. Carrossel de Banners (Apenas os banners cadastrados pelo usuário serão exibidos)
  // De acordo com os requisitos: se não tiver banner cadastrado, não aparece NADA.

  // 5. Criar Notícias Iniciais
  const newsCount = await prisma.news.count();
  if (newsCount === 0) {
    await prisma.news.create({
      data: {
        title: 'Inauguração das Novas Salas de Informática',
        subtitle: 'Comunidade ganha computadores novos e cursos gratuitos',
        summary: 'Graças às contribuições de nossos coroneis e tenentes do Exército de Cristo Rei, inauguramos hoje a nova sala de computadores.',
        content: '<p>A Associação Cristo Rei do Universo tem a alegria de informar que a nova sala de aula digital foi inaugurada. Equipados com computadores modernos, iniciaremos as novas turmas de informática básica e desenvolvimento web para jovens na próxima segunda-feira.</p><p>Agradecemos a todos os benfeitores que tornaram esse sonho possível através de suas generosas doações mensais via PIX.</p>',
        coverImage: '/images/news/informatica-inauguracao.jpg',
        status: 'Published',
        authorId: admin.id,
      },
    });

    await prisma.news.create({
      data: {
        title: 'Nossa Noite Cultural Reúne Centenas de Fiéis',
        subtitle: 'Apresentações artísticas marcaram o último final de semana',
        summary: 'Noite Cultural da paróquia arrecada fundos para as oficinas gratuitas de música e teatro.',
        content: '<p>O evento contou com apresentações de violão e flauta dos alunos da oficina de música Cristo Rei. Tivemos também uma peça teatral inspiradora contando a história de dedicação social da comunidade. Todo o valor arrecadado na praça de alimentação será revertido para a manutenção das oficinas gratuitas.</p>',
        coverImage: '/images/news/noite-cultural-evento.jpg',
        status: 'Published',
        authorId: admin.id,
      },
    });
    console.log('Notícias de exemplo criadas.');
  } else {
    console.log('Notícias de exemplo já existem.');
  }

  // 6. Criar Comunicados Iniciais
  const announcementCount = await prisma.announcement.count();
  if (announcementCount === 0) {
    await prisma.announcement.create({
      data: {
        title: 'Assembleia Mensal dos Benfeitores',
        content: 'Convidamos todos os membros do Exército de Cristo Rei a participarem de nossa assembleia virtual no dia 25 deste mês às 19h30, onde apresentaremos o balanço financeiro e as conquistas do último trimestre.',
        authorId: admin.id,
      },
    });
    console.log('Comunicados de exemplo criados.');
  } else {
    console.log('Comunicados de exemplo já existem.');
  }

  // 7. Criar Postagens de Exemplo (Posts dos Projetos)
  const postsCount = await prisma.post.count();
  if (postsCount === 0) {
    const cats = await prisma.category.findMany();
    const getCat = (slug: string) => cats.find((c) => c.slug === slug)?.id || cats[0]?.id;

    const samplePosts = [
      {
        title: 'Avanço no Reforço Escolar das Crianças da Comunidade',
        slug: 'avanco-reforco-escolar-comunidade',
        summary: 'Mais de 60 crianças receberam apoio pedagógico e melhoraram seu rendimento escolar.',
        content: '<p>Com dedicação dos professores voluntários e suporte dos benfeitores, nosso reforço escolar tem gerado frutos reais no aprendizado de matemática e língua portuguesa.</p>',
        coverImage: '/images/categories/reforco-pedagogico.jpg',
        status: 'Published',
        authorId: editor.id,
        categoryId: getCat('reforco-pedagogico'),
      },
      {
        title: 'Primeiros Alunos Concluem Curso de Informática',
        slug: 'primeiros-alunos-concluem-curso-informatica',
        summary: 'Jovens receberam certificado de qualificação profissional em informática básica.',
        content: '<p>A primeira turma de inclusão digital concluiu com êxito todas as etapas de computação e internet para o mercado de trabalho.</p>',
        coverImage: '/images/categories/aula-de-informatica.jpg',
        status: 'Published',
        authorId: editor.id,
        categoryId: getCat('aula-de-informatica'),
      },
      {
        title: 'Apresentação de Violão e Coral no Santuário',
        slug: 'apresentacao-violao-coral-santuario',
        summary: 'Alunos da oficina de música emocionaram o público em recital especial.',
        content: '<p>A música transforma trajetórias. No último domingo, nossos jovens instrumentistas e o coral juvenil realizaram sua primeira apresentação aberta.</p>',
        coverImage: '/images/categories/aula-de-musica.jpg',
        status: 'Published',
        authorId: editor.id,
        categoryId: getCat('aula-de-musica'),
      },
      {
        title: 'Pilates e Saúde Física na Terceira Idade',
        slug: 'pilates-saude-fisica-terceira-idade',
        summary: 'Encontros semanais garantem mais mobilidade, saúde e qualidade de vida aos idosos.',
        content: '<p>Nossas turmas de pilates contam com fisioterapeutas voluntários oferecendo acolhimento, alívio de dores e integração aos participantes da comunidade.</p>',
        coverImage: '/images/categories/pilates.jpg',
        status: 'Published',
        authorId: editor.id,
        categoryId: getCat('pilates'),
      },
    ];

    for (const p of samplePosts) {
      if (p.categoryId) {
        await prisma.post.create({ data: p });
      }
    }
    console.log('Postagens de exemplo criadas.');
  } else {
    console.log('Postagens já existem.');
  }

  // 8. Criar Benfeitores e Doações de Exemplo
  function generateValidCPF(baseNumber: number): string {
    const numStr = String(baseNumber).padStart(9, '0').slice(0, 9);
    let d1 = 0;
    for (let i = 0; i < 9; i++) {
      d1 += parseInt(numStr[i]) * (10 - i);
    }
    let rev1 = 11 - (d1 % 11);
    if (rev1 >= 10) rev1 = 0;

    const numStr10 = numStr + rev1;
    let d2 = 0;
    for (let i = 0; i < 10; i++) {
      d2 += parseInt(numStr10[i]) * (11 - i);
    }
    let rev2 = 11 - (d2 % 11);
    if (rev2 >= 10) rev2 = 0;

    return numStr + rev1 + rev2;
  }

  const benefactorsCount = await prisma.benefactor.count();
  if (benefactorsCount === 0) {
    const defaultPassword = await bcrypt.hash('123456', 10);

    const sampleBenefactors = [
      {
        name: 'Carlos Alberto Silveira',
        email: 'carlos.silveira@cristorei.org',
        rank: 'Marechal',
        phone: '(11) 98765-4321',
        address: 'Av. Paulista, 1500 - Bela Vista, São Paulo - SP',
        donations: [1500.0, 1500.0],
      },
      {
        name: 'Maria Helena Albuquerque',
        email: 'maria.helena@cristorei.org',
        rank: 'Coronel',
        phone: '(11) 97654-3210',
        address: 'Rua Oscar Freire, 800 - Jardins, São Paulo - SP',
        donations: [1000.0, 1000.0, 1000.0],
      },
      {
        name: 'Roberto Fernandes Dias',
        email: 'roberto.dias@cristorei.org',
        rank: 'Tenente-Coronel',
        phone: '(11) 96543-2109',
        address: 'Rua Domingos de Morais, 420 - Vila Mariana, São Paulo - SP',
        donations: [500.0, 500.0],
      },
      {
        name: 'Ana Paula Medeiros',
        email: 'ana.medeiros@cristorei.org',
        rank: 'Major',
        phone: '(11) 95432-1098',
        address: 'Rua Pamplona, 310 - Jardim Paulista, São Paulo - SP',
        donations: [300.0, 300.0, 300.0],
      },
      {
        name: 'Fernando Augusto Lima',
        email: 'fernando.lima@cristorei.org',
        rank: 'Capitão',
        phone: '(11) 94321-0987',
        address: 'Rua Augusta, 1200 - Consolação, São Paulo - SP',
        donations: [200.0, 200.0],
      },
      {
        name: 'Juliana Costa Ferreira',
        email: 'juliana.costa@cristorei.org',
        rank: 'Primeiro Tenente',
        phone: '(11) 93210-9876',
        address: 'Rua Vergueiro, 950 - Liberdade, São Paulo - SP',
        donations: [100.0, 100.0],
      },
      {
        name: 'Lucas Gabriel Martins',
        email: 'lucas.martins@cristorei.org',
        rank: 'Segundo Tenente',
        phone: '(11) 92109-8765',
        address: 'Rua Teodoro Sampaio, 600 - Pinheiros, São Paulo - SP',
        donations: [50.0, 50.0],
      },
      {
        name: 'Patrícia Rocha Mendes',
        email: 'patricia.mendes@cristorei.org',
        rank: 'Oficial Espontâneo',
        phone: '(11) 91098-7654',
        address: 'Av. Brigadeiro Faria Lima, 2000 - Itaim Bibi, São Paulo - SP',
        donations: [150.0, 250.0],
      },
    ];

    let baseCpfSeed = 123456780;
    for (const ben of sampleBenefactors) {
      baseCpfSeed += 13;
      const user = await prisma.user.create({
        data: {
          name: ben.name,
          email: ben.email,
          passwordHash: defaultPassword,
          role: Role.BENEFACTOR,
        },
      });

      const benefactor = await prisma.benefactor.create({
        data: {
          userId: user.id,
          cpf: generateValidCPF(baseCpfSeed),
          birthDate: new Date('1985-05-15'),
          phone: ben.phone,
          address: ben.address,
          militaryRank: ben.rank,
        },
      });

      for (const amount of ben.donations) {
        await prisma.donation.create({
          data: {
            amount,
            status: 'CONFIRMED',
            benefactorId: benefactor.id,
            date: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
          },
        });
      }
    }
    console.log(`${sampleBenefactors.length} Benfeitores e doações de exemplo criados.`);
  } else {
    console.log('Benfeitores já existem.');
  }

  // 9. Criar Logs Administrativos Iniciais
  const logsCount = await prisma.adminLog.count();
  if (logsCount === 0) {
    await prisma.adminLog.createMany({
      data: [
        {
          userId: admin.id,
          action: 'Inicialização do Sistema',
          details: 'Banco de dados populado com dados iniciais e categorias.',
        },
        {
          userId: admin.id,
          action: 'Cadastro de Benfeitores',
          details: 'Primeiros benfeitores do Exército de Cristo Rei adicionados com sucesso.',
        },
        {
          userId: editor.id,
          action: 'Publicação de Notícias',
          details: 'Artigos sobre as obras sociais e reforço pedagógico publicados.',
        },
      ],
    });
    console.log('Logs administrativos de exemplo criados.');
  }

  console.log('Semeadura do banco de dados concluída com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
