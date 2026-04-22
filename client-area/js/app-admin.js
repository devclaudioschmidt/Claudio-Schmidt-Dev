/**
 * APP-ADMIN.JS - Lógica para Painel Admin
 */

// Estado global
let appState = {
  usuario: null,
  modo: 'admin',
  filtroStatus: 'todas',
  filtroCliente: null,
  tarefas: [...MOCK_DATA.tarefas]
};

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
  // Recupera usuário do sessionStorage
  const usuarioSalvo = sessionStorage.getItem('usuarioLogado');
  if (usuarioSalvo) {
    appState.usuario = JSON.parse(usuarioSalvo);
    appState.usuario.modo = 'admin';
  } else {
    appState.usuario = { nome: 'Admin', email: 'admin@claudio.dev', avatar: 'AD' };
  }
  
  renderizarSidebar();
  renderizarFiltros();
  renderizarTarefas();
});

// ========== TOGGLE MENU MOBILE ==========
window.toggleMenu = function() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('overlay-menu');
  const toggle = document.getElementById('menu-toggle');
  
  sidebar.classList.toggle('ativo');
  overlay?.classList.toggle('ativo');
  toggle?.classList.toggle('aberto');
};

function renderizarSidebar() {
  document.getElementById('user-nome').textContent = appState.usuario?.nome || 'Admin';
  document.getElementById('user-email').textContent = appState.usuario?.email || 'admin@claudio.dev';
  document.getElementById('user-avatar').textContent = 'AD';
  document.getElementById('page-title').textContent = 'Dashboard Admin';
  document.getElementById('page-subtitle').textContent = 'Gestão completa de clientes';
  document.getElementById('nav-clientes-btn').style.display = 'flex';
}

window.logout = function() {
  sessionStorage.removeItem('usuarioLogado');
  window.location.href = 'index.html';
};

// ========== FILTROS ==========
function renderizarFiltros() {
  const container = document.getElementById('filtros-container');
  if (!container) return;
  
  const contadores = getContadores(appState.tarefas);
  
  container.innerHTML = `
    <button class="filtro-btn ativo" data-status="todas">Todas <span class="count">${contadores.todas}</span></button>
    <button class="filtro-btn" data-status="pendente">Pendente <span class="count">${contadores.pendente}</span></button>
    <button class="filtro-btn" data-status="fazendo">Fazendo <span class="count">${contadores.fazendo}</span></button>
    <button class="filtro-btn" data-status="revisao">Revisão <span class="count">${contadores.revisao}</span></button>
    <button class="filtro-btn" data-status="concluido">Concluído <span class="count">${contadores.concluido}</span></button>
  `;
  
  container.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      container.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativo'));
      this.classList.add('ativo');
      appState.filtroStatus = this.dataset.status;
      renderizarTarefas();
    });
  });
}

// ========== RENDERIZAR TAREFAS ==========
function renderizarTarefas() {
  const container = document.getElementById('tarefas-container');
  if (!container) return;
  
  let tarefasFiltradas = appState.tarefas;
  
  // Por cliente
  if (appState.filtroCliente) {
    tarefasFiltradas = tarefasFiltradas.filter(t => t.clienteId === appState.filtroCliente);
  }
  
  // Por status
  if (appState.filtroStatus !== 'todas') {
    tarefasFiltradas = tarefasFiltradas.filter(t => t.status === appState.filtroStatus);
  }
  
  if (tarefasFiltradas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📋</div>
        <h3>Nenhuma demanda encontrada</h3>
        <p>Não há demandas com este filtro.</p>
      </div>
    `;
    return;
  }
  
  const statuses = ['pendente', 'fazendo', 'revisao', 'concluido'];
  const statusLabels = { pendente: 'PENDENTE', fazendo: 'FAZENDO', revisao: 'REVISÃO', concluido: 'CONCLUÍDO' };
  
  let html = '';
  statuses.forEach(status => {
    const tarefasDoStatus = tarefasFiltradas.filter(t => t.status === status);
    if (tarefasDoStatus.length === 0) return;
    
    html += `
      <div class="grupo-status">
        <div class="grupo-header ${status}">
          <span class="grupo-titulo">${statusLabels[status]}</span>
          <span class="grupo-count">${tarefasDoStatus.length}</span>
        </div>
        <div class="grupo-cards">
          ${tarefasDoStatus.map(tarefa => renderizarCardTarefa(tarefa)).join('')}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function renderizarCardTarefa(tarefa) {
  const msgCount = tarefa.mensagens?.length || 0;
  return `
    <article class="card-tarefa ${tarefa.status}" onclick="abrirModalTarefa('${tarefa.id}')">
      <div class="card-header">
        <span class="badge-status">${formatarStatus(tarefa.status)}</span>
        <span class="card-id">${tarefa.id}</span>
      </div>
      <h3 class="card-titulo">${tarefa.titulo}</h3>
      <p class="card-desc">${tarefa.descricao}</p>
      <div class="card-footer">
        <div class="card-meta">
          <span>👤 ${tarefa.clienteNome}</span>
          <span>💬 ${msgCount}</span>
        </div>
        <span>${formatarData(tarefa.updatedAt)}</span>
      </div>
    </article>
  `;
}

// ========== CLIENTES ==========
function renderizarClientes() {
  const container = document.getElementById('clientes-container');
  if (!container) return;
  
  const busca = document.getElementById('busca-cliente')?.value?.toLowerCase() || '';
  let clientes = MOCK_DATA.clientes;
  
  if (busca) {
    clientes = clientes.filter(c => 
      c.nome.toLowerCase().includes(busca) || 
      c.email.toLowerCase().includes(busca) ||
      c.empresa?.toLowerCase().includes(busca)
    );
  }
  
  if (clientes.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="icon">👥</div><h3>Nenhum cliente encontrado</h3></div>';
    return;
  }
  
  container.innerHTML = clientes.map(cliente => {
    const demandasCount = appState.tarefas.filter(t => t.clienteId === cliente.uid).length;
    const demandasAtivas = appState.tarefas.filter(t => t.clienteId === cliente.uid && t.status !== 'concluido').length;
    
    return `
      <article class="card-cliente" onclick="verDemandasCliente('${cliente.uid}')">
        <div class="cliente-header">
          <div class="avatar">${cliente.nome.split(' ').map(n => n[0]).join('').substring(0,2)}</div>
          <div class="cliente-info">
            <h3>${cliente.nome}</h3>
            <p>${cliente.empresa || cliente.email}</p>
          </div>
          <span class="badge-status ${cliente.status}">${cliente.status}</span>
        </div>
        <div class="cliente-dados">
          <span>📧 ${cliente.email}</span>
          <span>📞 ${cliente.telefone}</span>
        </div>
        <div class="cliente-stats">
          <span class="stat">${demandasCount} demandas</span>
          <span class="stat ativo">${demandasAtivas} ativas</span>
        </div>
      </article>
    `;
  }).join('');
}

window.verDemandasCliente = function(clienteId) {
  appState.filtroCliente = clienteId;
  appState.filtroStatus = 'todas';
  mostrarSecao('demandas');
};

// ========== NAVEGAÇÃO ==========
window.mostrarSecao = function(secao) {
  const secoes = ['demandas', 'clientes'];
  secoes.forEach(s => {
    document.getElementById('secao-' + s).style.display = s === secao ? 'block' : 'none';
  });
  
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('ativo'));
  document.getElementById('nav-' + secao + '-btn').classList.add('ativo');
  
  if (secao === 'clientes') {
    document.getElementById('page-title').textContent = 'Clientes';
    document.getElementById('page-subtitle').textContent = 'Gestão de clientes';
    document.getElementById('filtros-container').style.display = 'none';
    renderizarClientes();
  } else {
    document.getElementById('page-title').textContent = 'Dashboard Admin';
    document.getElementById('page-subtitle').textContent = 'Gestão completa de clientes';
    document.getElementById('filtros-container').style.display = 'flex';
    appState.filtroCliente = null;
    renderizarTarefas();
  }
};

// ========== MODAL ==========
let tarefaAtual = null;

window.abrirModalTarefa = function(tarefaId) {
  tarefaAtual = appState.tarefas.find(t => t.id === tarefaId);
  if (!tarefaAtual) return;
  
  document.getElementById('modal-titulo').textContent = tarefaAtual.titulo;
  document.getElementById('modal-id').textContent = tarefaAtual.id;
  document.getElementById('modal-data').textContent = formatarData(tarefaAtual.updatedAt);
  document.getElementById('modal-descricao').textContent = tarefaAtual.descricao;
  
  const selectStatus = document.getElementById('select-status');
  selectStatus.style.display = 'block';
  selectStatus.value = tarefaAtual.status;
  selectStatus.className = `select-status ${tarefaAtual.status}`;
  
  renderizarMensagens();
  document.getElementById('modal-tarefa').classList.add('ativo');
};

function renderizarMensagens() {
  const container = document.getElementById('chat-mensagens');
  if (!container || !tarefaAtual) return;
  
  const mensagens = tarefaAtual.mensagens || [];
  container.innerHTML = mensagens.map(msg => {
    const isAdmin = msg.senderId === 'admin';
    return `
      <div class="mensagem ${isAdmin ? 'sistema' : 'usuario'}">
        <div class="balao">${msg.text}</div>
        <span class="hora">${formatarHora(msg.timestamp)}</span>
      </div>
    `;
  }).join('');
  
  container.scrollTop = container.scrollHeight;
}

window.alterarStatus = function(novoStatus) {
  if (!tarefaAtual) return;
  tarefaAtual.status = novoStatus;
  tarefaAtual.updatedAt = new Date().toISOString();
  document.getElementById('select-status').className = `select-status ${novoStatus}`;
  renderizarTarefas();
};

window.enviarMensagem = function() {
  const input = document.getElementById('mensagem-input');
  const text = input.value.trim();
  if (!text || !tarefaAtual) return;
  
  tarefaAtual.mensagens.push({ senderId: 'admin', text: text, timestamp: new Date().toISOString() });
  tarefaAtual.updatedAt = new Date().toISOString();
  input.value = '';
  renderizarMensagens();
  renderizarTarefas();
};

document.getElementById('mensagem-input')?.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); window.enviarMensagem(); }
});

window.fecharModal = function() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('ativo'));
  tarefaAtual = null;
};

document.querySelectorAll('.btn-fechar, .modal-overlay').forEach(el => {
  el.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('btn-fechar')) {
      window.fecharModal();
    }
  });
});

function formatarStatus(status) {
  const map = { pendente: 'Pendente', fazendo: 'Fazendo', revisao: 'Revisão', concluido: 'Concluído' };
  return map[status] || status;
}