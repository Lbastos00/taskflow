import {api} from '../api.js';
import {$, escapeHTML, pageTitle, notify, label} from '../utils.js';
export async function render() {
  const users=await api('users');
  $('#screen').innerHTML=`${pageTitle('Gerenciar usuários','Controle os integrantes e as permissões da equipe.')}
    <div class="users-grid"><section class="panel"><div class="panel-heading"><div><h2>Equipe cadastrada</h2><p>${users.length} usuários ativos</p></div></div>
      <div class="user-list">${users.map(u=>`<div class="user-row"><div class="avatar">${escapeHTML(u.name.split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase())}</div><div><strong>${escapeHTML(u.name)}</strong><small>${escapeHTML(u.email)}</small></div>${label(u.role==='admin'?'Administrador':'Membro',u.role==='admin'?'admin':'member')}</div>`).join('')}</div>
    </section><section class="panel"><div class="panel-heading"><div><h2>Adicionar usuário</h2><p>Apenas administradores têm acesso a este formulário.</p></div></div>
    <form id="user-form" class="users-form"><label for="name">Nome completo</label><input id="name" minlength="3" required placeholder="Nome da pessoa" />
    <label for="email">E-mail</label><input id="email" type="email" required placeholder="email@exemplo.com" />
    <label for="password">Senha de acesso</label><input id="password" type="password" minlength="8" required placeholder="Pelo menos 8 caracteres" />
    <label for="role">Perfil de acesso</label><select id="role"><option value="membro">Membro</option><option value="admin">Administrador</option></select>
    <p class="form-error" id="user-error" role="alert"></p><button class="btn primary wide" type="submit" id="create">Cadastrar usuário</button></form></section></div>`;
  $('#user-form').onsubmit=async e=>{
    e.preventDefault();$('#user-error').textContent='';const button=$('#create');button.disabled=true;
    try {await api('users',{method:'POST',body:{name:$('#name').value,email:$('#email').value,password:$('#password').value,role:$('#role').value}});notify('Usuário cadastrado.');await render();}
    catch(err){$('#user-error').textContent=err.message;button.disabled=false;}
  };
}
