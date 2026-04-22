/**
 * APP-CLIENTE.JS - Área do Cliente com Firebase
 */

// Imports Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc, query, where, orderBy, serverTimestamp, Timestamp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

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

// Estado global
let appState = {
  usuario: null,
  tarefas: [],
  unsubscribe: null
};

// ========== INICIALIZAÇÃO ==========
onAuthStateChanged(auth, (user) => {
  if (user) {
    appState.usuario = {
      uid: user.uid,
      email: user.email,
      nome: user.displayName || user.email.split('@')[0],
      avatar: (user.displayName || user.email).split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()
    };
    
    renderizarUsuario();
    carregarTarefas();
  } else {
    // Não está logado
    window.location.href = 'index.html';
  }
});

function renderizarUsuario() {
  if (!appState.usuario) return;
  
  document.getElementById('user-nome').textContent = appState.usuario.nome;
  document.getElementById('user-email').textContent = appState.usuario.email;
  document.getElementById('user-avatar').textContent = appState.usuario.avatar;
  document.getElementById('page-title').textContent = 'Minhas Demandas';
  document.getElementById('page-subtitle').textContent = 'Acompanhe suas demandas';
}

window.logout = function() {
  signOut(auth).then(() => {
    sessionStorage.removeItem('usuarioLogado');
    window.location.href = 'index.html';
  });
};

// ========== CARREGAR TAREFAS DO FIRESTORE ==========
function carregarTarefas() {
  if (!appState.usuario) return;
  
  // Cancelar listener anterior
  if (appState.unsubscribe) {
    appState.unsubscribe();
  }
  
  // Query: tarefas do usuário logado, ordenadas por updatedAt
  const q = query(
    collection(db, "tarefas"),
    where("clienteId", "==", appState.usuario.uid),
    orderBy("updatedAt", "desc")
  );
  
  // Listener em tempo real
  appState.unsubscribe = onSnapshot(q, (snapshot) => {
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
  }, (error) => {
    console.error('Erro ao carregar tarefas:', error);
  });
}

// ========== RENDERIZAR TAREFAS ==========
function renderizarTarefas() {
  const container = document.getElementById('tarefas-container');
  if (!container) return;
  
  if (appState.tarefas.length === 0) {
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
    const tarefasDoStatus = appState.tarefas.filter(t => t.status === status);
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
    ? tarefa.updatedAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString('pt-BR');
  
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
          <span>💬 ${msgCount}</span>
        </div>
        <span>${dataFormatada}</span>
      </div>
    </article>
  `;
}

// ========== MODAL ==========
let tarefaAtual = null;

window.abrirModalTarefa = function(tarefaId) {
  tarefaAtual = appState.tarefas.find(t => t.id === tarefaId);
  if (!tarefaAtual) return;
  
  const dataFormatada = tarefaAtual.updatedAt instanceof Date 
    ? tarefaAtual.updatedAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString('pt-BR');
  
  document.getElementById('modal-titulo').textContent = tarefaAtual.titulo;
  document.getElementById('modal-id').textContent = tarefaAtual.id.substring(0, 8);
  document.getElementById('modal-data').textContent = dataFormatada;
  document.getElementById('modal-descricao').textContent = tarefaAtual.descricao;
  document.getElementById('modal-status-area').style.display = 'none';
  
  renderizarMensagens();
  document.getElementById('modal-tarefa').classList.add('ativo');
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
    senderId: appState.usuario.uid,
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

// ========== NOVA DEMANDA ==========
window.abrirModalNovaDemanda = function() {
  document.getElementById('modal-nova-demanda').classList.add('ativo');
};

document.getElementById('form-nova-demanda')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const titulo = document.getElementById('nova-titulo').value;
  const descricao = document.getElementById('nova-descricao').value;
  
  if (!titulo || !descricao) return;
  
  try {
    await addDoc(collection(db, "tarefas"), {
      clienteId: appState.usuario.uid,
      clienteNome: appState.usuario.nome,
      titulo: titulo,
      descricao: descricao,
      status: 'pendente',
      mensagens: [{
        senderId: appState.usuario.uid,
        text: descricao,
        timestamp: serverTimestamp()
      }],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    document.getElementById('nova-titulo').value = '';
    document.getElementById('nova-descricao').value = '';
    window.fecharModal();
  } catch (error) {
    console.error('Erro ao criar demanda:', error);
    alert('Erro ao criar demanda');
  }
});

function formatarStatus(status) {
  const map = { pendente: 'Pendente', fazendo: 'Fazendo', revisao: 'Revisão', concluido: 'Concluído' };
  return map[status] || status;
}