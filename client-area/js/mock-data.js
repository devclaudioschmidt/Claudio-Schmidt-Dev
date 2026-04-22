/**
 * MOCK DATA - Dados de exemplo para testar o frontend
 * Substituir por Firebase na Fase 2
 */

const MOCK_DATA = {
  // Usuário logado atual (será substituído pelo Auth)
  usuarioAtual: {
    uid: 'user-001',
    nome: 'João Silva',
    email: 'joao@empresa.com',
    role: 'cliente', // 'admin' ou 'cliente'
    avatar: 'JS'
  },
  
  // Lista de clientes (para Admin)
  clientes: [
    { uid: 'user-001', nome: 'João Silva', email: 'joao@empresa.com', avatar: 'JS' },
    { uid: 'user-002', nome: 'Maria Santos', email: 'maria@empresa.com', avatar: 'MS' },
    { uid: 'user-003', nome: 'Pedro Costa', email: 'pedro@empresa.com', avatar: 'PC' },
  ],
  
  // Tarefas de exemplo
  tarefas: [
    {
      id: 'DEM-001',
      clienteId: 'user-001',
      clienteNome: 'João Silva',
      titulo: 'Criar Landing Page para Empresa',
      descricao: 'Preciso de uma landing page moderna para minha empresa de consultoria. O site deve ter design responsivo e terintegrasi com WhatsApp.',
      status: 'fazendo',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T14:20:00Z',
      mensagens: [
        { senderId: 'user-001', text: 'Olá, preciso criar um site para minha empresa.', timestamp: '2024-01-15T10:30:00Z' },
        { senderId: 'admin', text: 'Olá João! Vou começar o desenvolvimento hoje.', timestamp: '2024-01-15T11:00:00Z' },
        { senderId: 'user-001', text: 'Perfeito, estou no aguardo!', timestamp: '2024-01-15T11:15:00Z' }
      ]
    },
    {
      id: 'DEM-002',
      clienteId: 'user-001',
      clienteNome: 'João Silva',
      titulo: 'Otimização SEO do Site Atual',
      descricao: 'Meu site atual está lento e não aparece no Google. Preciso melhorar o PageSpeed e o posicionamento.',
      status: 'pendente',
      createdAt: '2024-01-18T09:00:00Z',
      updatedAt: '2024-01-18T09:00:00Z',
      mensagens: [
        { senderId: 'user-001', text: 'Meu site não aparece no Google, precisa de SEO.', timestamp: '2024-01-18T09:00:00Z' }
      ]
    },
    {
      id: 'DEM-003',
      clienteId: 'user-001',
      clienteNome: 'João Silva',
      titulo: 'Sistema de Blog com CMS',
      descricao: 'Preciso adicionar um blog ao meu site com sistema de gerenciamento de conteúdo simples.',
      status: 'revisao',
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-17T16:00:00Z',
      mensagens: [
        { senderId: 'user-001', text: 'Gostaria de adicionar um blog.', timestamp: '2024-01-10T08:00:00Z' },
        { senderId: 'admin', text: 'Criei o sistema de blog. Pode testar.', timestamp: '2024-01-16T10:00:00Z' },
        { senderId: 'user-001', text: 'Estou verificando e te informo.', timestamp: '2024-01-17T16:00:00Z' }
      ]
    },
    {
      id: 'DEM-004',
      clienteId: 'user-001',
      clienteNome: 'João Silva',
      titulo: 'Configuração de E-mail Profissional',
      descricao: 'Preciso configurar domínio com Google Workspace.',
      status: 'concluido',
      createdAt: '2024-01-05T14:00:00Z',
      updatedAt: '2024-01-08T10:00:00Z',
      mensagens: [
        { senderId: 'user-001', text: 'Preciso de e-mail profissional.', timestamp: '2024-01-05T14:00:00Z' },
        { senderId: 'admin', text: 'Configurado! Agora você tem contato@empresa.com', timestamp: '2024-01-08T10:00:00Z' }
      ]
    },
    {
      id: 'DEM-005',
      clienteId: 'user-002',
      clienteNome: 'Maria Santos',
      titulo: 'Criação de Web App',
      descricao: 'Preciso de um sistema web para gestão de clientes.',
      status: 'fazendo',
      createdAt: '2024-01-12T11:00:00Z',
      updatedAt: '2024-01-16T15:00:00Z',
      mensagens: [
        { senderId: 'user-002', text: 'Preciso de um sistema de gestão.', timestamp: '2024-01-12T11:00:00Z' },
        { senderId: 'admin', text: 'Vou desenvolver um CRM básico para você.', timestamp: '2024-01-13T09:00:00Z' }
      ]
    },
    {
      id: 'DEM-006',
      clienteId: 'user-003',
      clienteNome: 'Pedro Costa',
      titulo: 'Loja Virtual Completa',
      descricao: 'Preciso de uma loja virtual com pagamento via Stripe.',
      status: 'pendente',
      createdAt: '2024-01-19T16:00:00Z',
      updatedAt: '2024-01-19T16:00:00Z',
      mensagens: [
        { senderId: 'user-003', text: 'Quero criar uma loja virtual.', timestamp: '2024-01-19T16:00:00Z' }
      ]
    }
  ],
  
  clientes: [
    { uid: 'user-001', nome: 'João Silva', email: 'joao@empresa.com', telefone: '(47) 99999-0001', empresa: 'Silva Consultoria', status: 'ativo', createdAt: '2024-01-01T10:00:00Z' },
    { uid: 'user-002', nome: 'Maria Santos', email: 'maria@santos.com.br', telefone: '(47) 99999-0002', empresa: 'Santos Tecnologia', status: 'ativo', createdAt: '2024-01-05T14:00:00Z' },
    { uid: 'user-003', nome: 'Pedro Costa', email: 'pedro@costa.eng.br', telefone: '(47) 99999-0003', empresa: 'Costa Engenharia', status: 'ativo', createdAt: '2024-01-10T09:00:00Z' },
    { uid: 'user-004', nome: 'Ana Oliveira', email: 'ana@oliveira.com', telefone: '(47) 99999-0004', empresa: 'Oliveira Arquitetos', status: 'inativo', createdAt: '2023-12-15T11:00:00Z' }
  ]
};

// Função utility para formatar data
function formatarData(dataStr) {
  const data = new Date(dataStr);
  return data.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Função para obter horas reduzidas
function formatarHora(dataStr) {
  const data = new Date(dataStr);
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Contadores por status
function getContadores(tarefas, clienteId = null) {
  const filtradas = clienteId 
    ? tarefas.filter(t => t.clienteId === clienteId) 
    : tarefas;
  
  return {
    todas: filtradas.length,
    pendente: filtradas.filter(t => t.status === 'pendente').length,
    fazendo: filtradas.filter(t => t.status === 'fazendo').length,
    revisao: filtradas.filter(t => t.status === 'revisao').length,
    concluido: filtradas.filter(t => t.status === 'concluido').length
  };
}