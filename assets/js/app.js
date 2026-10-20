import {api, getToken, setToken} from './api.js';
import {$, escapeHTML, notify} from './utils.js';

let user = null;
let previousRoute = '';
const routes = {
  '/dashboard': () => import('./views/dashboard.js'),
  '/tarefas': () => import('./views/tasks.js'),
  '/tarefas/nova': () => import('./views/task-form.js'),
  '/usuarios': () => import('./views/users.js'),
};
const initials = str => str.split(' ').slice(0,2).map(x=>x[0]).join('').toUpperCase();
const menuLink = (hash, symbol, title, current) => `<a href="#${hash}" class="navlink ${current.startsWith(hash) ? 'active' : ''}"><span class="nav-icon">${symbol}</span>${title}</a>`;
function layout(current) {
  document.body.classList.remove('auth-mode');
  $('#app').innerHTML = `<div class="layout">
   <aside class="sidebar"><div class="brand"><div class="brand-mark">✦</div><div><strong>taskflow<span>.</span></strong><small>ORGANIZE & REALIZE</small></div></div>
    <div class="side-section">MENU PRINCIPAL</div>
    <nav aria-label="Navegação principal">
      ${menuLink('/dashboard','◫','Visão geral',current)}
      ${menuLink('/tarefas','☰','Minhas tarefas',current)}
      ${user.role==='admin' ? menuLink('/usuarios','♙','Usuários',current) : ''}
    </nav>
    <div class="sidebar-bottom"><div class="hint"><span>✧</span><strong>Um passo de cada vez.</strong><p>Transforme suas ideias em conquistas todos os dias.</p></div>
      <div class="account"><div class="avatar">${initials(user.name)}</div><div class="account-meta"><strong>${escapeHTML(user.name)}</strong><small>${user.role==='admin'?'Administrador':'Membro'}</small></div><button id="logout" class="logout" title="Sair" aria-label="Sair">↪</button></div>
    </div>
   </aside>
   <main class="main"><div class="mobile-top"><strong>✦ taskflow.</strong><button id="mobile-menu" aria-label="Abrir menu">☰</button></div>
     <div class="topbar"><span class="breadcrumb">Área de trabalho <span>›</span> TaskFlow</span><div class="top-right"><span class="online-dot"></span> Ambiente acadêmico <span class="top-avatar">${initials(user.name)}</span></div></div>
     <section id="screen" class="screen" aria-live="polite"><p>Carregando...</p></section>
     <footer class="footer">TaskFlow · Projeto acadêmico · Desenvolvimento Web Front-End · FUMEC</footer>
   </main></div>`;
  $('#logout').onclick = async () => {try {await api('logout',{method:'POST'});}catch{} setToken('');user=null;location.hash='#/login';};
  $('#mobile-menu').onclick = () => $('.sidebar').classList.toggle('sidebar-open');
  document.querySelectorAll('.navlink').forEach(item=>item.onclick=()=>$('.sidebar').classList.remove('sidebar-open'));
}
async function router() {
  const path = (location.hash.replace(/^#/, '') || '/dashboard').replace(/\/$/,'') || '/dashboard';
  if (!getToken() && path !== '/login') {location.hash='#/login';return;}
  if (!user && getToken()) {
    try {user = await api('me');} catch {setToken('');user=null;location.hash='#/login';return;}
  }
  if (path === '/login') {
    if (user && getToken()) {location.hash='#/dashboard';return;}
    document.body.classList.add('auth-mode');
    const module = await import('./views/login.js');
    module.render(async (credentials) => {
      const result = await api('login',{method:'POST',body:credentials});
      setToken(result.token);user=result.user;location.hash='#/dashboard';
    });
    return;
  }
  if (path === '/usuarios' && user.role !== 'admin') {notify('Acesso restrito a administradores.',true);location.hash='#/dashboard';return;}
  let getter = routes[path];
  let params = {};
  let match = path.match(/^\/tarefas\/(\d+)(\/editar)?$/);
  if (match) {
    params.id = Number(match[1]);
    getter = match[2] ? ()=>import('./views/task-form.js') : ()=>import('./views/task-detail.js');
  }
  if (!getter) {location.hash='#/dashboard';return;}
  const sameLayout = !!$('#screen') && !document.body.classList.contains('auth-mode');
  if (!sameLayout || (path.split('/')[1] !== previousRoute.split('/')[1])) layout(path);
  else {
    // Atualiza destaques da navegação sem reconstruir o conteúdo inteiro.
    document.querySelectorAll('.navlink').forEach(node=>node.classList.toggle('active',path.startsWith(node.getAttribute('href').slice(1))));
  }
  previousRoute=path;
  $('#screen').innerHTML='<div class="loading">Carregando informações...</div>';
  try {const module = await getter(); await module.render({user, params});}
  catch (error) { console.error(error);if($('#screen')) $('#screen').innerHTML=`<section class="panel error-panel"><h2>Não foi possível carregar esta página.</h2><p>${escapeHTML(error.message)}</p><button class="btn primary" onclick="location.reload()">Tentar novamente</button></section>`; }
}
window.addEventListener('hashchange', router);
router();
