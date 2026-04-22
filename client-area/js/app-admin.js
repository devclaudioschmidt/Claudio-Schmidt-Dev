/**
 * APP-ADMIN.JS - Painel Admin com Firebase
 */

// Imports Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc, query, where, orderBy, serverTimestamp, getDocs, setDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDYvLbBw02MbTcCL-CZekBmb5Nv0Cyk5ic",
  authDomain: "cliente-area-crm.firebaseapp.com",
  projectId: "cliente-area-crm",
  storageBucket: "cliente-area-crm.firebasestorage.app",
  messagingSenderId: "584425836546",
  appId: "1:584425836546:web:06ce1d814a750f66a5d71b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const db = getFirestore(app);

// Estado global
let appState = {
  usuario: null,
  tarefas: [],
  clientes: [],
  unsubscribeTarefas: null,
  unsubscribeClientes: null
};

// ========== INICIALIZAÇÃO ==========
onAuthStateChanged(auth, (user) => {
  if (user) {
    appState.usuario = {
      uid: user.uid,
      email: user.email,
      nome: user.displayName || user.email.split('@')[0],
      avatar: 'AD',
      role: 'admin'
    };
    
    renderizarSidebar();
    renderizarFiltros();
    carregarTarefas();
    carregarClientes();
  } else {
    window.location.href = 'index.html';
  }
});

function renderizarSidebar() {
  document.getElementById('user-nome').textContent = appState.usuario?.nome || 'Admin';
  document.getElementById('user-email').textContent = appState.usuario?.email || 'admin@claudio.dev';
  document.getElementById('user-avatar').textContent = 'AD';
  document.getElementById('page-title').textContent = 'Dashboard Admin';
  document.getElementById('page-subtitle').textContent = 'Gestão completa de clientes';
  document.getElementById('nav-clientes-btn').style.display = 'flex';
}

window.logout = function() {
  signOut(auth).then(() => {
    sessionStorage.removeItem('usuarioLogado');
    window.location.href = 'index.html';
  });
};

// ========== FILTROS ==========
function renderizarFiltros() {
  const container = document.getElementById('filtros-container');
  if (!container) return;
  
  const contadores = {
    todas: appState.tarefas.length,
    pendente: appState.tarefas.filter(t => t.status === 'pendente').length,
    fazendo: appState.tarefas.filter(t => t.status === 'fazendo').length,
    revisao: appState.tarefas.filter(t => t.status === 'revisao').length,
    concluido: appState.tarefas.filter(t => t.status === 'concluido').length
  };
  
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
  
  appState.filtroStatus = 'todas';
}

// ========== CARREGAR TAREFAS ==========
function carregarTarefas() {
  if (appState.unsubscribeTarefas) {
    appState.unsubscribeTarefas();
  }
  
  const q = query(
    collection(db, "tarefas"),
    orderBy("updatedAt", "desc")
  );
  
  appState.unsubscribeTarefas = onSnapshot(q, (snapshot) => {
    appState.tarefas = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      appState.tarefas.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date()
      });
    });
    renderizarTarefas();
    renderizarFiltros();
  }, (error) => {
    console.error('Erro ao carregar tarefas:', error);
  });
}

// ========== CARREGAR CLIENTES ==========
function carregarClientes() {
  if (appState.unsubscribeClientes) {
    appState.unsubscribeClientes();
  }
  
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
  
  appState.unsubscribeClientes = onSnapshot(q, (snapshot) => {
    appState.clientes = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.role !== 'admin') {
        appState.clientes.push({ uid: doc.id, ...data });
      }
    });
    renderizarClientes();
  });
}

// ========== RENDERIZAR TAREFAS ==========
function renderizarTarefas() {
  const container = document.getElementById('tarefas-container');
  if (!container) return;
  
  let tarefasFiltradas = appState.tarefas;
  
  // Filtrar por cliente
  if (appState.filtroCliente) {
    tarefasFiltradas = tarefasFiltradas.filter(t => t.clienteId === appState.filtroCliente);
  }
  
  // Filtrar por status
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
  const dataFormatada = tarefa.updatedAt instanceof Date 
    ? tarefa.updatedAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';
  
  return `
    <article class="card-tarefa ${tarefa.status}" onclick="abrirModalTarefa('${tarefa.id}')">
      <div class="card-header">
        <span class="badge-status">${formatarStatus(tarefa.status)}</span>
        <span class="card-id">${tarefa.id.substring(0, 8)}</span>
      </div>
      <h3 class="card-titulo">${tarefa.titulo}</h3>
      <p class="card-desc">${tarefa.descricao}</p>
      <div class="card-footer">
        <div class="card-meta">
          <span>👤 ${tarefa.clienteNome}</span>
          <span>💬 ${msgCount}</span>
        </div>
        <span>${dataFormatada}</span>
      </div>
    </article>
  `;
}

// ========== CLIENTES ==========
function renderizarClientes() {
  const container = document.getElementById('clientes-container');
  if (!container) return;
  
  const busca = document.getElementById('busca-cliente')?.value?.toLowerCase() || '';
  let clientes = appState.clientes;
  
  if (busca) {
    clientes = clientes.filter(c => 
      c.nome?.toLowerCase().includes(busca) || 
      c.email?.toLowerCase().includes(busca) ||
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
    const avatar = (cliente.nome || 'CL').split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
    
    return `
      <article class="card-cliente" onclick="verDemandasCliente('${cliente.uid}')">
        <div class="cliente-header">
          <div class="avatar">${avatar}</div>
          <div class="cliente-info">
            <h3>${cliente.nome}</h3>
            <p>${cliente.empresa || cliente.email}</p>
          </div>
          <span class="badge-status ${cliente.status || 'ativo'}">${cliente.status || 'ativo'}</span>
        </div>
        <div class="cliente-dados">
          <span>📧 ${cliente.email}</span>
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
  
  const dataFormatada = tarefaAtual.updatedAt instanceof Date 
    ? tarefaAtual.updatedAt.toLocaleDateString('pt-BR')
    : '';
  
  document.getElementById('modal-titulo').textContent = tarefaAtual.titulo;
  document.getElementById('modal-id').textContent = tarefaAtual.id.substring(0, 8);
  document.getElementById('modal-data').textContent = dataFormatada;
  document.getElementById('modal-descricao').textContent = tarefaAtual.descricao;
  
  const selectStatus = document.getElementById('select-status');
  selectStatus.style.display = 'block';
  selectStatus.value = tarefaAtual.status;
  selectStatus.className = `select-status ${tarefaAtual.status}`;
  
  renderizarMensagens();
  document.getElementById('modal-tarefa').classList.add('ativo');
};

window.alterarStatus = async function(novoStatus) {
  if (!tarefaAtual) return;
  
  try {
    await updateDoc(doc(db, "tarefas", tarefaAtual.id), {
      status: novoStatus,
      updatedAt: serverTimestamp()
    });
    
    document.getElementById('select-status').className = `select-status ${novoStatus}`;
    renderizarTarefas();
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    alert('Erro ao alterar status');
  }
};

function renderizarMensagens() {
  const container = document.getElementById('chat-mensagens');
  if (!container || !tarefaAtual) return;
  
  const mensagens = tarefaAtual.mensagens || [];
  container.innerHTML = mensagens.map(msg => {
    const hora = msg.timestamp instanceof Date 
      ? msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : '';
    const isAdmin = msg.senderId === 'admin';
    return `
      <div class="mensagem ${isAdmin ? 'sistema' : 'usuario'}">
        <div class="balao">${msg.text}</div>
        <span class="hora">${hora}</span>
      </div>
    `;
  }).join('');
  
  container.scrollTop = container.scrollHeight;
}

window.enviarMensagem = async function() {
  const input = document.getElementById('mensagem-input');
  const text = input.value.trim();
  if (!text || !tarefaAtual) return;
  
  const mensagens = tarefaAtual.mensagens || [];
  mensagens.push({
    senderId: 'admin',
    text: text,
    timestamp: new Date()
  });
  
  try {
    await updateDoc(doc(db, "tarefas", tarefaAtual.id), {
      mensagens: mensagens,
      updatedAt: serverTimestamp()
    });
    
    input.value = '';
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    alert('Erro ao enviar mensagem');
  }
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

function formatarStatus(status) {
  const map = { pendente: 'Pendente', fazendo: 'Fazendo', revisao: 'Revisão', concluido: 'Concluído' };
  return map[status] || status;
}

// ========== CADASTRO DE NOVOS CLIENTES ==========
window.abrirModalNovoCliente = function() {
  document.getElementById('modal-novo-cliente').classList.add('ativo');
};

window.fecharModalNovoCliente = function() {
  document.getElementById('modal-novo-cliente').classList.remove('ativo');
  document.getElementById('form-novo-cliente').reset();
};

document.getElementById('form-novo-cliente')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const nome = document.getElementById('novo-cliente-nome').value;
  const email = document.getElementById('novo-cliente-email').value;
  const senha = document.getElementById('novo-cliente-senha').value;
  const btn = document.getElementById('btn-cadastrar-cliente');
  
  if (!nome || !email || !senha) {
    alert('Preencha todos os campos!');
    return;
  }
  
  btn.disabled = true;
  btn.textContent = 'Cadastrando...';
  
  try {
    // 1. Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;
    
    // 2. Criar documento no Firestore
    await setDoc(doc(db, "users", user.uid), {
      nome: nome,
      email: email,
      role: 'cliente',
      status: 'ativo',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    alert('Cliente cadastrado com sucesso!');
    fecharModalNovoCliente();
    renderizarClientes();
    
  } catch (error) {
    console.error('Erro ao cadastrar:', error);
    if (error.code === 'auth/email-already-in-use') {
      alert('Este e-mail já está cadastrado!');
    } else {
      alert('Erro ao cadastrar cliente: ' + error.message);
    }
    btn.disabled = false;
    btn.textContent = 'CADASTRAR';
  }
});