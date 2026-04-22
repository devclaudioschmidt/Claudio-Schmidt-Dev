/**
 * APP-CLIENTE.JS - Lógica para Área do Cliente
 */

// Estado global
let appState = {
  usuario: null,
  filtroStatus: 'todas',
  tarefas: [...MOCK_DATA.tarefas]
};

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
  // Recupera usuário do sessionStorage
  const usuarioSalvo = sessionStorage.getItem('usuarioLogado');
  if (usuarioSalvo) {
    appState.usuario = JSON.parse(usuarioSalvo);
    renderizarUsuario();
    renderizarTarefas();
  } else {
    // Sem usuário, cria mock para testar no mobile
    appState.usuario = { nome: 'João Silva', email: 'joao@empresa.com', avatar: 'JS' };
    renderizarUsuario();
    renderizarTarefas();
  }
});

// ========== TOGGLE MENU MOBILE ==========
window.toggleMenu = function(e) {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('overlay-menu');
  const toggle = document.getElementById('menu-toggle');
  
  sidebar.classList.toggle('ativo');
  overlay.classList.toggle('ativo');
  toggle.classList.toggle('aberto');
};

function renderizarUsuario() {
  if (!appState.usuario) return;
  
  document.getElementById('user-nome').textContent = appState.usuario.nome;
  document.getElementById('user-email').textContent = appState.usuario.email;
  document.getElementById('user-avatar').textContent = appState.usuario.avatar;
  document.getElementById('page-title').textContent = 'Minhas Demandas';
  document.getElementById('page-subtitle').textContent = 'Acompanhe suas demandas';
}

window.logout = function() {
  sessionStorage.removeItem('usuarioLogado');
  window.location.href = 'index.html';
};

// ========== RENDERIZAR TAREFAS ==========
function renderizarTarefas() {
  const container = document.getElementById('tarefas-container');
  if (!container) return;
  
  // Filtra por cliente logado (usa email como ID temporário)
  let tarefasFiltradas = appState.tarefas.filter(t => {
    // Quando tiver Firebase, usar t.clienteId
    // Agora usa o email do mock ou nome
    return t.clienteNome === appState.usuario.nome || t.clienteId === 'user-001';
  });
  
  if (tarefasFiltradas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📋</div>
        <h3>Nenhuma demanda encontrada</h3>
        <p>Clique no botão acima para criar sua primeira demanda.</p>
      </div>
    `;
    return;
  }
  
  // Renderiza GRUPOS POR STATUS
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
          <span>💬 ${msgCount}</span>
        </div>
        <span>${formatarData(tarefa.updatedAt)}</span>
      </div>
    </article>
  `;
}

// ========== MODAL ==========
let tarefaAtual = null;

window.abrirModalTarefa = function(tarefaId) {
  tarefaAtual = appState.tarefas.find(t => t.id === tarefaId);
  if (!tarefaAtual) return;
  
  document.getElementById('modal-titulo').textContent = tarefaAtual.titulo;
  document.getElementById('modal-id').textContent = tarefaAtual.id;
  document.getElementById('modal-data').textContent = formatarData(tarefaAtual.updatedAt);
  document.getElementById('modal-descricao').textContent = tarefaAtual.descricao;
  
  // Oculta select de status (cliente não altera)
  document.getElementById('modal-status-area').style.display = 'none';
  
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

window.enviarMensagem = function() {
  const input = document.getElementById('mensagem-input');
  const text = input.value.trim();
  if (!text || !tarefaAtual) return;
  
  tarefaAtual.mensagens.push({
    senderId: 'cliente',
    text: text,
    timestamp: new Date().toISOString()
  });
  
  tarefaAtual.updatedAt = new Date().toISOString();
  input.value = '';
  renderizarMensagens();
  renderizarTarefas();
};

document.getElementById('mensagem-input')?.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    window.enviarMensagem();
  }
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

// ========== NOVA DEMANDA ==========
window.abrirModalNovaDemanda = function() {
  document.getElementById('modal-nova-demanda').classList.add('ativo');
};

document.getElementById('form-nova-demanda')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const titulo = document.getElementById('nova-titulo').value;
  const descricao = document.getElementById('nova-descricao').value;
  
  if (!titulo || !descricao) return;
  
  const id = `DEM-${String(appState.tarefas.length + 1).padStart(3, '0')}`;
  const novaTarefa = {
    id: id,
    clienteId: 'user-001',
    clienteNome: appState.usuario.nome,
    titulo: titulo,
    descricao: descricao,
    status: 'pendente',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mensagens: [{
      senderId: 'cliente',
      text: descricao,
      timestamp: new Date().toISOString()
    }]
  };
  
  appState.tarefas.push(novaTarefa);
  document.getElementById('nova-titulo').value = '';
  document.getElementById('nova-descricao').value = '';
  
  window.fecharModal();
  renderizarTarefas();
});

function formatarStatus(status) {
  const map = { pendente: 'Pendente', fazendo: 'Fazendo', revisao: 'Revisão', concluido: 'Concluído' };
  return map[status] || status;
}