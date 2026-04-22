/**
 * APP-LOGIN.JS - Lógica de Login
 */

// ========== LOGIN SIMPLADO ==========
document.getElementById('form-login')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  
  if (email && senha) {
    // Salva no sessionStorage para usar nas páginas seguintes
    sessionStorage.setItem('usuarioLogado', JSON.stringify({
      email: email,
      nome: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      avatar: email.split('@')[0].split('.')[0][0].toUpperCase()
    }));
    
    // Redireciona como cliente por padrão
    window.location.href = 'cliente.html';
  }
});